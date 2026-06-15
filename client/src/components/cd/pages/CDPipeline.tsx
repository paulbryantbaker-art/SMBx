/**
 * CDPipeline — Portfolio › Pipeline, ported to the Claude-Design (cool/indigo)
 * language. Visual target is the CD "Ultra Modern Fintech" portfolio board
 * (portfolio.jsx): editorial header, a KPI band, then deals grouped by stage as
 * cards — EV, multiple, open-item count, verdict pill, next step.
 *
 * Intelligence preserved from V6 PipelineRoot: the page LEADS with the computed
 * answer (the one deal nearest a gate with the most real open items — "what can
 * move first"), and ranks stages funnel-order. Every value is real (the same
 * hooks PipelineRoot binds) or honestly "—": no fabricated MOIC / sparkline /
 * trend. The CD mockup's demo data (MOIC, sparklines, EV deltas) has no live
 * backend here, so those affordances are dropped rather than faked.
 *
 * Mounts under `.cd-root` (cdTokens.css); only `--cd-*` tokens.
 */
import { useMemo, type ReactNode } from "react";
import { type User } from "../../../hooks/useAuth";
import { useV6WorkspaceData, type WorkspaceDeal } from "../../../hooks/useV6WorkspaceData";
import { useTodayOperatingBrief, type TodayGateCountdownItem, type TodayDefinitiveDealState } from "../../../hooks/useTodayOperatingBrief";
import { usePortfolioSummary } from "../../../hooks/usePortfolioSummary";
import { realBlockers } from "../../v6/shared/operatingPrimitives";
import { PIPELINE_STAGES, stageForGate, type PipelineStageId } from "../../../lib/pipelineStages";
import { LEAGUE_MULTIPLES } from "../../../lib/calculations/core";
import {
  CDIcon, CDPill, CDCard, CDStat, CDLeagueBadge, CDLineNote,
  cdFmtCents, cdDealColor, type CDTone,
} from "../kit/cdUi";

interface PipelineProps {
  user: User | null;
  openTab: (t: any) => void;
  onTalkToYulia?: (p: string) => void;
  modelPreference?: any;
}

type Verdict = "pursue" | "watch" | "pass";
const VERDICT_TONE: Record<Verdict, CDTone> = { pursue: "pos", watch: "warn", pass: "neg" };
const VERDICT_WORD: Record<Verdict, string> = { pursue: "Pursue", watch: "Watch", pass: "Pass" };
const JOURNEY_TONE: Record<string, CDTone> = { BUY: "accent", SELL: "pos", RAISE: "warn", PMI: "neutral" };

export function CDPipeline({ user, openTab, onTalkToYulia }: PipelineProps) {
  const workspace = useV6WorkspaceData(user);
  const operating = useTodayOperatingBrief(user, !!user);
  const { summary } = usePortfolioSummary(user, !!user);
  const ob = operating.brief;

  const ask = (prompt: string) => onTalkToYulia?.(prompt);
  const openDeal = (id: number, title: string) => openTab({ kind: "deal", id: String(id), title });
  const openAllDeals = () => openTab({ id: "deals-all", kind: "deals-list", title: "All deals", dealsListView: "all" });
  const openStage = (stageId: PipelineStageId, stageTitle: string) =>
    openTab({ id: `deals-stage-${stageId}`, kind: "deals-list", title: `${stageTitle} deals`, dealsListView: "all", dealsStage: stageId });

  // Per-deal DEFINITIVE readiness + gate brief, keyed by deal id.
  const gateById = useMemo(() => {
    const m = new Map<string, TodayGateCountdownItem>();
    for (const g of ob?.gateCountdown ?? []) m.set(g.dealId, g);
    return m;
  }, [ob]);
  const readinessById = useMemo(() => {
    const m = new Map<string, TodayDefinitiveDealState>();
    for (const g of ob?.gateCountdown ?? []) if (g.definitive) m.set(g.dealId, g.definitive);
    for (const p of ob?.dealPulse ?? []) if (p.definitive && !m.has(p.dealId)) m.set(p.dealId, p.definitive);
    return m;
  }, [ob]);

  const deals = workspace.deals;
  const active = useMemo(() => deals.filter(d => (d.status || "").toLowerCase() === "active"), [deals]);

  // KPI band — over the ACTIVE set so each tile describes one population.
  const totalEv = summary?.totalEvCents ?? 0;
  const activeAsk = active.reduce((s, d) => s + (typeof d.asking_price === "number" && d.asking_price > 0 ? d.asking_price : 0), 0);
  const totalBlockers = (ob?.gateCountdown ?? []).reduce((n, g) => n + realBlockers(g.blockers).length, 0);
  const blockedDealCount = (ob?.gateCountdown ?? []).filter(g => realBlockers(g.blockers).length > 0).length;

  // The lead pointer: the deal nearest a gate with the MOST real open items —
  // "what can move first." Descriptive; the board below stays funnel-ordered.
  const topBlocked = useMemo(() => (ob?.gateCountdown ?? [])
    .map(g => ({ g, open: realBlockers(g.blockers) }))
    .filter(x => x.open.length > 0)
    .sort((a, b) => b.open.length - a.open.length)[0], [ob]);

  // Group by pipeline stage, preserving API row order within each stage.
  const grouped = useMemo(() => PIPELINE_STAGES.map(stage => ({
    stage,
    rows: deals.filter(d => stageForGate(d.current_gate || "B2") === stage.id),
  })).filter(g => g.rows.length > 0), [deals]);

  const loading = workspace.canFetch && workspace.loading && deals.length === 0;
  const empty = !loading && workspace.canFetch && !workspace.loading && deals.length === 0;

  return (
    <div className="cd-root cd-scrollable" style={{ background: "var(--cd-canvas)", height: "100%", overflow: "auto", padding: "30px 34px 60px", display: "flex", flexDirection: "column", gap: "var(--cd-gap)" }}>
      {/* editorial header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "var(--cd-serif)", fontWeight: 600, fontSize: 38, lineHeight: 1.03, letterSpacing: "-0.02em" }}>Pipeline</h1>
          <p style={{ margin: "9px 0 0", color: "var(--cd-ink-2)", fontSize: 14 }}>
            {summary
              ? <>{summary.totalActive} active mandate{summary.totalActive === 1 ? "" : "s"} · <span className="cd-num" style={{ fontWeight: 600, color: "var(--cd-ink)" }}>{cdFmtCents(totalEv)}</span> aggregate enterprise value in play.</>
              : "Your deals by stage — value, fit, and what's blocking each gate."}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <GhostBtn onClick={openAllDeals}>All deals</GhostBtn>
          <PrimaryBtn onClick={() => ask("Help me source or add a deal to my pipeline.")}><CDIcon name="plus" size={14} color="white" />New deal</PrimaryBtn>
        </div>
      </div>

      {loading ? (
        <CDCard><div className="cd-skel" style={{ height: 140 }} /></CDCard>
      ) : empty ? (
        <CDCard style={{ textAlign: "center", color: "var(--cd-ink-2)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--cd-ink)" }}>No deals yet</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Source a target or add a deal you're tracking — Yulia takes it from there.</div>
          <div style={{ marginTop: 16 }}><PrimaryBtn onClick={() => ask("Help me source my first deal.")}><CDIcon name="sparkle" size={14} color="white" />Source a deal</PrimaryBtn></div>
        </CDCard>
      ) : (
        <>
          {/* KPI band — real computed facts over the active pipeline */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "var(--cd-gap)" }}>
            <CDStat
              label="Deals in motion"
              value={String(active.length)}
              sub={active.length !== deals.length ? `of ${deals.length} tracked` : undefined}
            />
            <CDStat label="Total ask" value={cdFmtCents(activeAsk)} sub="active pipeline" />
            <CDStat
              label="Open blockers"
              value={String(totalBlockers)}
              accent={totalBlockers > 0 ? "var(--cd-warn)" : "var(--cd-pos)"}
              sub={ob ? (totalBlockers > 0 ? `across ${blockedDealCount} deal${blockedDealCount === 1 ? "" : "s"}` : "nothing waiting") : "no live feed yet"}
            />
          </div>

          {/* ⭐ THE LEAD — the one deal that can move first (computed answer) */}
          {topBlocked && (
            <button
              type="button"
              onClick={() => openDeal(Number(topBlocked.g.dealId), topBlocked.g.title)}
              style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 15, padding: "15px 20px", borderRadius: "var(--cd-r-lg)", background: "var(--cd-accent-soft)", border: "1px solid var(--cd-accent-ring)", boxShadow: "var(--cd-shadow-sm)" }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--cd-accent)", display: "grid", placeItems: "center", flexShrink: 0 }}><CDIcon name="bolt" size={17} color="white" /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="cd-eyebrow" style={{ color: "var(--cd-accent-strong)", marginBottom: 4 }}>What can move first</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--cd-ink)", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {topBlocked.g.title}
                  <span className="cd-num" style={{ fontSize: 11.5, color: "var(--cd-ink-3)", background: "var(--cd-surface)", border: "1px solid var(--cd-line)", borderRadius: 6, padding: "2px 7px" }}>{topBlocked.g.gateId}</span>
                  <CDPill tone="warn"><CDIcon name="flag" size={11} color="oklch(0.5 0.13 75)" />{topBlocked.open.length} open item{topBlocked.open.length === 1 ? "" : "s"}</CDPill>
                </div>
                {topBlocked.g.nextAction && <div style={{ fontSize: 12.5, color: "var(--cd-ink-2)", marginTop: 4, lineHeight: 1.45 }}><span style={{ color: "var(--cd-ink-4)" }}>Next · </span>{topBlocked.g.nextAction}</div>}
              </div>
              <span aria-hidden style={{ flexShrink: 0, fontSize: 12.5, fontWeight: 700, color: "var(--cd-accent-strong)", display: "inline-flex", alignItems: "center", gap: 4 }}>Open deal<CDIcon name="chevright" size={13} color="var(--cd-accent)" /></span>
            </button>
          )}
          {topBlocked && <CDLineNote style={{ marginTop: -4 }} />}

          {/* THE BOARD — deals grouped by stage as cards */}
          {grouped.map(({ stage, rows }) => {
            const stageAsk = rows.reduce((s, d) => s + (typeof d.asking_price === "number" && d.asking_price > 0 ? d.asking_price : 0), 0);
            return (
              <div key={stage.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => openStage(stage.id, stage.title)}
                    title={`Open all ${rows.length} ${stage.title} deals`}
                    style={{ all: "unset", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 9 }}
                  >
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--cd-ink)" }}>{stage.title}</h3>
                    <span className="cd-num" style={{ fontSize: 11, fontWeight: 700, color: "var(--cd-ink-3)", background: "var(--cd-surface-3)", borderRadius: 6, padding: "1px 7px" }}>{rows.length}</span>
                  </button>
                  <span style={{ fontSize: 12, color: "var(--cd-ink-4)" }}>{stage.sub}</span>
                  {stageAsk > 0 && <span className="cd-num" style={{ marginLeft: "auto", fontSize: 12, color: "var(--cd-ink-3)" }}>{cdFmtCents(stageAsk)} total ask</span>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "var(--cd-gap)" }}>
                  {rows.map(d => (
                    <DealCard
                      key={d.id}
                      deal={d}
                      gate={gateById.get(String(d.id))}
                      readiness={readinessById.get(String(d.id))}
                      onOpen={() => openDeal(d.id, dealTitle(d))}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

/* ─── deal card — the board atom (CD portfolio.jsx grammar) ─────────────── */
function DealCard({ deal, gate, readiness, onOpen }: { deal: WorkspaceDeal; gate?: TodayGateCountdownItem; readiness?: TodayDefinitiveDealState; onOpen: () => void }) {
  const color = cdDealColor(deal.id);
  const verdict = dealVerdict(deal);
  const journey = (deal.journey_type || "buy").toUpperCase();
  const league = parseInt(String(deal.league || "").replace(/\D/g, ""), 10) || null;
  const open = gate ? realBlockers(gate.blockers) : [];
  const mult = fmtMultiple(deal);
  const range = multipleRange(deal);
  const multColor = range === null ? "var(--cd-ink)" : range ? "var(--cd-pos)" : "var(--cd-neg)";
  const score = typeof readiness?.score === "number" ? readiness.score : null;

  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        all: "unset", cursor: "pointer", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 12,
        background: "var(--cd-surface)", border: "1px solid var(--cd-line)", borderRadius: "var(--cd-r-lg)",
        boxShadow: "var(--cd-shadow-sm)", padding: 15, minWidth: 0,
      }}
    >
      {/* header — color rail · name · league · journey */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span style={{ width: 8, height: 34, borderRadius: 3, background: color, flexShrink: 0 }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--cd-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{dealTitle(deal)}</div>
          <div style={{ fontSize: 11.5, color: "var(--cd-ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{[deal.industry, deal.location].filter(Boolean).join(" · ") || "—"}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
          {league != null && <CDLeagueBadge league={league} />}
          <CDPill tone={JOURNEY_TONE[journey] || "neutral"}>{journey}</CDPill>
        </div>
      </div>

      {/* metric row — Asking · Multiple (both real or "—") */}
      <div style={{ display: "flex", gap: 20 }}>
        <Metric label="Asking" value={cdFmtCents(deal.asking_price)} />
        <Metric label="Multiple" value={mult} color={mult === "—" ? undefined : multColor} />
        <div style={{ marginLeft: "auto", alignSelf: "flex-end" }}>
          <span className="cd-num" style={{ fontSize: 11.5, color: "var(--cd-ink-3)", background: "var(--cd-surface-2)", border: "1px solid var(--cd-line)", borderRadius: 6, padding: "2px 8px", whiteSpace: "nowrap" }}>
            {deal.current_gate || "—"}{gate?.gateName ? ` · ${gate.gateName}` : ""}
          </span>
        </div>
      </div>

      {/* footer — verdict · readiness/blockers · next step */}
      <div style={{ borderTop: "1px solid var(--cd-line)", paddingTop: 11, display: "flex", flexDirection: "column", gap: 9 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <CDPill tone={VERDICT_TONE[verdict]}>{VERDICT_WORD[verdict]}</CDPill>
          {open.length > 0
            ? <CDPill tone="warn"><CDIcon name="flag" size={11} color="oklch(0.5 0.13 75)" />{open.length} blocker{open.length === 1 ? "" : "s"}</CDPill>
            : gate
              ? <CDPill tone="pos"><CDIcon name="check" size={11} color="var(--cd-pos)" />On track</CDPill>
              : null}
          {score != null && (
            <span className="cd-num" style={{ marginLeft: "auto", fontSize: 11.5, fontWeight: 700, color: "var(--cd-ink-3)" }}>
              {score}% <span style={{ fontWeight: 500, color: "var(--cd-ink-4)" }}>ready</span>
            </span>
          )}
        </div>
        {gate?.nextAction && (
          <div style={{ fontSize: 11.5, color: "var(--cd-ink-2)", lineHeight: 1.4 }}>
            <span style={{ color: "var(--cd-ink-4)" }}>Next · </span>{gate.nextAction}
          </div>
        )}
      </div>
    </button>
  );
}

function Metric({ label, value, color }: { label: string; value: ReactNode; color?: string }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div className="cd-eyebrow" style={{ fontSize: 9 }}>{label}</div>
      <div className="cd-num" style={{ fontSize: 15, fontWeight: 600, marginTop: 2, color: color || "var(--cd-ink)" }}>{value}</div>
    </div>
  );
}

/* ─── buttons ───────────────────────────────────────────────────────────── */
function GhostBtn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--cd-surface)", color: "var(--cd-ink-2)", border: "1px solid var(--cd-line-2)", borderRadius: "var(--cd-r-md)", padding: "9px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--cd-sans)", whiteSpace: "nowrap" }}>{children}</button>
  );
}
function PrimaryBtn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--cd-accent)", color: "white", border: "none", borderRadius: "var(--cd-r-md)", padding: "9px 15px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--cd-sans)", whiteSpace: "nowrap", boxShadow: "var(--cd-shadow-sm)" }}>{children}</button>
  );
}

/* ─── helpers (ported from V6 PipelineRoot so the two surfaces agree) ────── */

// League-range check for the Multiple cell: null = not demonstrable, true =
// within the league's band (green), false = outside (red).
function multipleRange(d: WorkspaceDeal): boolean | null {
  const entry = d.league ? LEAGUE_MULTIPLES[d.league] : undefined;
  if (!entry || entry.max <= entry.min) return null;
  const earnings = entry.metric === "SDE" ? d.sde : d.ebitda;
  if (typeof d.asking_price !== "number" || d.asking_price <= 0) return null;
  if (typeof earnings !== "number" || earnings <= 0) return null;
  const implied = d.asking_price / earnings;
  return implied >= entry.min && implied <= entry.max;
}

// Asking ÷ (EBITDA, else SDE) — both in cents, so the ratio is unitless.
function fmtMultiple(d: WorkspaceDeal): string {
  const denom = (typeof d.ebitda === "number" && d.ebitda > 0) ? d.ebitda : (typeof d.sde === "number" && d.sde > 0) ? d.sde : null;
  if (!denom || typeof d.asking_price !== "number" || d.asking_price <= 0) return "—";
  return `${(d.asking_price / denom).toFixed(1)}×`;
}

function dealTitle(d: WorkspaceDeal): string {
  return d.business_name?.trim() || `Deal #SMBX-${String(d.id).padStart(4, "0")}`;
}

// Mirrors V6 PipelineRoot.dealVerdict so the pill matches the rest of the app.
function dealVerdict(d: WorkspaceDeal): Verdict {
  const label = String(d.financials?.status_label ?? "").toLowerCase();
  if (/loi|closing|negotiat|pursu|signed/.test(label)) return "pursue";
  if (/pass|cold|drop|reject/.test(label)) return "pass";
  const gate = d.current_gate ?? "";
  if (/[BSR]4|[BSR]5/.test(gate)) return "pursue";
  return "watch";
}
