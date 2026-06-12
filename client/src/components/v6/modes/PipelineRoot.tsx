/**
 * Desktop Pipeline — the analyst's ledger schedule (Working Paper, Phase 3).
 * One .wktable: every deal as a schedule line with SDE / Asking / Multiple /
 * Fit, one <tbody> per pipeline stage (PIPELINE_STAGES) with an aggregate
 * header row, and an accountant total row at the foot.
 *
 * Data: useV6WorkspaceData (full WorkspaceDeal rows from /api/deals — same
 * source DealsListView binds) grouped by current_gate via stageForGate.
 * useMobileDeals stays for `featured` (strongest source KPI) and `picks`
 * (Yulia's ranked read) so those slices can't diverge from mobile.
 */
import { useMobileDeals, type MobilePick } from "../../../hooks/useMobileDeals";
import { useV6WorkspaceData, type WorkspaceDeal } from "../../../hooks/useV6WorkspaceData";
import { PIPELINE_STAGES, stageForGate } from "../../../lib/pipelineStages";
import { YuliaSkeleton } from "../shared/YuliaSkeleton";
import type { OpenTab } from "../types";
import type { User } from "../../../hooks/useAuth";
import type { ModelPreference } from "../../../lib/modelPreference";
import type { Verdict } from "./cards";

interface PipelineRootProps {
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
  user: User | null;
  modelPreference?: ModelPreference;
}

// House list law: stage groups are SHORT lists. Desktop caps at 5 rows per
// stage (founder: the page must not run super long — five stages × 5 rows
// is one comfortable viewport) with a "See all N in {stage}" tail row and a
// clickable stage header, both landing on the full deals list FILTERED to
// that stage.
const STAGE_ROW_CAP = 5;
const COLUMNS = 7; // Deal | Stage | SDE | Asking | Multiple | Fit | Verdict

export function V6PipelineRoot({ openTab, onTalkToYulia, user }: PipelineRootProps) {
  const deals = useMobileDeals(user);
  const workspace = useV6WorkspaceData(user);
  const ask = (prompt: string) => onTalkToYulia?.(prompt);
  const openDeal = (rawId: number, title: string) => openTab({ kind: "deal", id: String(rawId), title });
  const openAllDeals = () => openTab({ id: "deals-all", kind: "deals-list", title: "All deals", dealsListView: "all" });
  // Stage-scoped full list — the "See all N in Source" promise must land on
  // Source, not on an unfiltered dump of every deal.
  const openStage = (stageId: string, stageTitle: string) =>
    openTab({ id: `deals-stage-${stageId}`, kind: "deals-list", title: `${stageTitle} deals`, dealsListView: "all", dealsStage: stageId });

  const featured = deals.featured;
  const picks = deals.picks;
  const tableDeals = workspace.deals;
  const loading =
    (deals.isAuthed && deals.loading && !deals.loaded) ||
    (workspace.canFetch && workspace.loading);
  const empty = !loading && deals.loaded && tableDeals.length === 0 && !featured;

  // Group by pipeline stage, preserving API row order within each stage —
  // identical grouping/ordering to the previous stage-card layout.
  const grouped = PIPELINE_STAGES.map(stage => ({
    stage,
    rows: tableDeals.filter(d => stageForGate(d.current_gate || "B2") === stage.id),
  })).filter(g => g.rows.length > 0);

  // Header KPIs (replaces the featured hero card)
  const activeCount = tableDeals.filter(d => (d.status || "").toLowerCase() === "active").length;
  const askingValues = tableDeals.map(d => d.asking_price).filter((v): v is number => typeof v === "number" && v > 0);
  const totalAsk = askingValues.reduce((sum, v) => sum + v, 0);
  const fitValues = tableDeals
    .map(d => d.seven_factor_composite)
    .filter((v): v is number => typeof v === "number" && Number.isFinite(v))
    .sort((a, b) => a - b);
  const medianFit = fitValues.length
    ? Math.round(
        fitValues.length % 2
          ? fitValues[(fitValues.length - 1) / 2]
          : (fitValues[fitValues.length / 2 - 1] + fitValues[fitValues.length / 2]) / 2,
      )
    : null;

  return (
    <div className="wk-content m-fade-up m-page-flow" style={{ maxWidth: 1180, margin: "0 auto" }}>
      <div className="pg-head">
        <div>
          <div className="pg-title">Pipeline</div>
          <p className="pg-sub">Your deals, grouped by stage — and the strongest source this week.</p>
        </div>
        <div className="pg-actions">
          <button className="wkbtn" type="button" onClick={openAllDeals}>All deals</button>
          <button className="wkbtn primary" type="button" onClick={() => ask("Help me source or add a deal to my pipeline.")}>New deal</button>
        </div>
      </div>

      {loading ? (
        <div style={{ marginTop: 16 }}><YuliaSkeleton rows={4} label="Yulia is reading your pipeline…" /></div>
      ) : empty ? (
        <div className="wkcard" style={{ marginTop: 16, textAlign: "center", color: "var(--ink-2)" }}>
          <div className="wkcard-title">No deals yet</div>
          <div className="wkcard-sub">Source a target or add a deal you're tracking — Yulia takes it from there.</div>
          <button className="wkbtn dark" type="button" style={{ marginTop: 14 }} onClick={() => ask("Help me source my first deal.")}>Source a deal</button>
        </div>
      ) : (
        <>
          {/* KPI band — warm tonal card (fusion Wave C3; chrome lives in the
              .mhead CSS block in workspace.css). Explicitly NOT watercolor. */}
          {(tableDeals.length > 0 || featured) && (
            <div className="mhead">
              {tableDeals.length > 0 && (
                <div className="mh">
                  <div className="l">Deals in motion</div>
                  <div className="v">{activeCount}</div>
                  {activeCount !== tableDeals.length && <div className="s">of {tableDeals.length} tracked</div>}
                </div>
              )}
              {totalAsk > 0 && (
                <div className="mh">
                  <div className="l">Total ask</div>
                  <div className="v">{fmtCents(totalAsk)}</div>
                </div>
              )}
              {medianFit !== null && (
                <div className="mh">
                  <div className="l">Median fit</div>
                  <div className="v">{medianFit}</div>
                </div>
              )}
              {featured && (
                <div className="mh">
                  <div className="l">Strongest source</div>
                  <button
                    type="button"
                    className="v mh-name"
                    onClick={() => openDeal(featured.rawId, featured.name)}
                    style={{ background: "none", border: 0, padding: 0, cursor: "pointer", textAlign: "left" }}
                  >
                    {featured.name}
                  </button>
                  {featured.fitIsReal && <div className="s">fit {featured.fit}</div>}
                </div>
              )}
            </div>
          )}

          {/* The schedule — one tbody per stage, total row at the foot */}
          {grouped.length > 0 && (
            <table className="wktable" style={{ marginTop: 0 }}>
              <thead>
                <tr>
                  <th>Deal</th>
                  <th>Stage</th>
                  <th className="r">SDE</th>
                  <th className="r">Asking</th>
                  <th className="r">Multiple</th>
                  <th className="r">Fit</th>
                  <th>Verdict</th>
                </tr>
              </thead>
              {grouped.map(({ stage, rows }) => {
                const shown = rows.slice(0, STAGE_ROW_CAP);
                const stageAsk = rows.reduce((sum, d) => sum + (typeof d.asking_price === "number" && d.asking_price > 0 ? d.asking_price : 0), 0);
                const agg = [
                  `${rows.length} ${rows.length === 1 ? "deal" : "deals"}`,
                  stageAsk > 0 ? `${fmtCents(stageAsk)} total ask` : null,
                ].filter(Boolean).join(" · ");
                return (
                  <tbody key={stage.id}>
                    <tr
                      className="stage-row"
                      onClick={() => openStage(stage.id, stage.title)}
                      style={{ cursor: "pointer" }}
                      title={`Open all ${rows.length} ${stage.title} deals`}
                    >
                      <td colSpan={COLUMNS}>
                        <span className="wkstage-agg">{agg}</span>
                        <span className="stage-name">{stage.title}</span>
                        <span className="stage-sub">{stage.sub}</span>
                      </td>
                    </tr>
                    {shown.map(d => (
                      <ScheduleRow key={d.id} deal={d} onOpen={() => openDeal(d.id, dealTitle(d))} />
                    ))}
                    {rows.length > shown.length && (
                      <tr onClick={() => openStage(stage.id, stage.title)}>
                        <td colSpan={COLUMNS} style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 600, color: "var(--accent-strong)" }}>
                          See all {rows.length} in {stage.title} →
                        </td>
                      </tr>
                    )}
                  </tbody>
                );
              })}
              <tbody>
                <tr className="total-row">
                  <td colSpan={2}>All stages</td>
                  <td className="r" />
                  <td className="r amt">{fmtCents(totalAsk)}</td>
                  <td colSpan={3} />
                </tr>
              </tbody>
            </table>
          )}

          {/* Yulia's ranked read (deals.picks) */}
          {picks.length > 0 && (
            <div className="wksec">
              <div className="wksec-title" style={{ marginBottom: 2 }}>Yulia's ranked read</div>
              <p style={{ color: "var(--ink-2)", fontSize: "0.84rem", margin: "0 0 12px" }}>What Yulia would look at first.</p>
              <div className="wkcard" style={{ padding: 0, overflow: "hidden" }}>
                {picks.map((p, i) => (
                  <PickRow key={p.id} pick={p} last={i === picks.length - 1} onOpen={() => openDeal(p.rawId, p.name)} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ScheduleRow({ deal, onOpen }: { deal: WorkspaceDeal; onOpen: () => void }) {
  const verdict = dealVerdict(deal);
  return (
    <tr onClick={onOpen}>
      <td>
        <div className="cellname">
          <span className="logo">{initials(dealTitle(deal))}</span>
          <div>
            <div className="nm">{dealTitle(deal)}</div>
            <div className="sub">{[deal.industry, deal.location].filter(Boolean).join(" · ") || "—"}</div>
          </div>
        </div>
      </td>
      <td>{deal.current_gate || "—"}</td>
      <td className="r amt">{fmtCents(deal.sde)}</td>
      <td className="r amt">{fmtCents(deal.asking_price)}</td>
      <td className="r amt">{fmtMultiple(deal)}</td>
      <td className="r amt">{typeof deal.seven_factor_composite === "number" && Number.isFinite(deal.seven_factor_composite) ? Math.round(deal.seven_factor_composite) : "—"}</td>
      <td>
        <span className={`statpill ${verdictClass(verdict)}`}><span className="d" />{capitalize(verdict)}</span>
      </td>
    </tr>
  );
}

function PickRow({ pick, last, onOpen }: { pick: MobilePick; last: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, width: "100%", boxSizing: "border-box", padding: "14px 18px", borderBottom: last ? "none" : "1px solid var(--line)" }}
      onClick={onOpen}
    >
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", fontWeight: 700, color: "var(--ink-3)", width: 22 }}>{pick.rank}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", color: "var(--ink)", fontWeight: 600, fontSize: "0.92rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pick.name}</span>
        <span style={{ display: "block", color: "var(--ink-3)", fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pick.sub}</span>
      </span>
      <span className={`statpill ${verdictClass(pick.kind)}`}><span className="d" />{capitalize(pick.kind)}</span>
      {pick.fitIsReal !== false && (
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-strong)", fontSize: "1rem" }}>{pick.fit}</span>
      )}
    </button>
  );
}

/* ─── helpers ─────────────────────────────────────────────── */

// Same money formatter as DealsListView (cents → $X.XM / $XK).
function fmtCents(cents: number | null | undefined): string {
  if (!cents) return "--";
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (dollars >= 1_000) return `$${Math.round(dollars / 1_000)}K`;
  return `$${Math.round(dollars).toLocaleString()}`;
}

// Asking ÷ (EBITDA, else SDE) — both in cents, so the ratio is unitless.
function fmtMultiple(d: WorkspaceDeal): string {
  const denom = (typeof d.ebitda === "number" && d.ebitda > 0) ? d.ebitda : (typeof d.sde === "number" && d.sde > 0) ? d.sde : null;
  if (!denom || typeof d.asking_price !== "number" || d.asking_price <= 0) return "—";
  return `${(d.asking_price / denom).toFixed(1)}×`;
}

// Same title fallback the mobile hook uses (nameOf), so tab titles stay byte-identical.
function dealTitle(d: WorkspaceDeal): string {
  return d.business_name?.trim() || `Deal #SMBX-${String(d.id).padStart(4, "0")}`;
}

// Mirrors useMobileDeals.dealVerdict so the pill matches mobile exactly.
function dealVerdict(d: WorkspaceDeal): Verdict {
  const label = String(d.financials?.status_label ?? "").toLowerCase();
  if (/loi|closing|negotiat|pursu|signed/.test(label)) return "pursue";
  if (/pass|cold|drop|reject/.test(label)) return "pass";
  const gate = d.current_gate ?? "";
  if (/[BSR]4|[BSR]5/.test(gate)) return "pursue";
  return "watch";
}

function initials(value: string): string {
  return String(value || "").split(/\s+/).filter(Boolean).map(p => p[0]).slice(0, 2).join("").toUpperCase() || "··";
}

function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function verdictClass(verdict: Verdict): string {
  if (verdict === "pursue") return "good";
  if (verdict === "pass") return "flag";
  return "review";
}
