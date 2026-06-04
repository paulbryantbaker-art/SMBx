/**
 * Desktop Pipeline — SAME items as mobile Pipeline, in desktop UI.
 * Reads the IDENTICAL hook (useMobileDeals) so it can't diverge from mobile:
 *   - .featured  → "strongest source this week" hero
 *   - .all       → stage-grouped pipeline (PIPELINE_STAGES)
 *   - .picks     → Yulia's ranked read
 */
import { useMobileDeals, type MobileStageRow, type MobilePick } from "../../../hooks/useMobileDeals";
import { PIPELINE_STAGES } from "../../../lib/pipelineStages";
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

export function V6PipelineRoot({ openTab, onTalkToYulia, user }: PipelineRootProps) {
  const deals = useMobileDeals(user);
  const ask = (prompt: string) => onTalkToYulia?.(prompt);
  const openDeal = (rawId: number, title: string) => openTab({ kind: "deal", id: String(rawId), title });

  const featured = deals.featured;
  const all = deals.all;
  const picks = deals.picks;
  const loading = deals.isAuthed && deals.loading && !deals.loaded;
  const empty = deals.loaded && all.length === 0 && !featured;

  return (
    <div className="wk-content m-fade-up" style={{ maxWidth: 1180, margin: "0 auto" }}>
      <div className="pg-head">
        <div>
          <div className="pg-title">Pipeline</div>
          <p className="pg-sub">Your deals, grouped by stage — and the strongest source this week.</p>
        </div>
        <div className="pg-actions">
          <button className="wkbtn" type="button" onClick={() => openTab({ id: "deals-all", kind: "deals-list", title: "All deals", dealsListView: "all" })}>All deals</button>
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
          {/* Strongest source this week (deals.featured) */}
          {featured && (
            <div className="wkcard" style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 14 }}>
              <span className="logo" style={{ width: 48, height: 48, fontSize: "1rem" }}>{initials(featured.name)}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--ink-3)", fontWeight: 600, letterSpacing: "0.06em" }}>STRONGEST SOURCE THIS WEEK</div>
                <div style={{ color: "var(--ink)", fontWeight: 700, fontSize: "1.05rem", letterSpacing: "-0.02em", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{featured.name}</div>
                <div style={{ color: "var(--ink-3)", fontSize: "0.84rem" }}>{featured.sub} · {featured.revLabel}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-strong)", fontSize: "1.5rem", lineHeight: 1 }}>{featured.fit}</div>
                <div style={{ fontSize: "0.66rem", color: "var(--ink-3)", fontWeight: 600 }}>FIT</div>
              </div>
              <button className="wkbtn primary" type="button" onClick={() => openDeal(featured.rawId, featured.name)}>Dig in</button>
            </div>
          )}

          {/* Stage-grouped pipeline (deals.all) */}
          {PIPELINE_STAGES.map(stage => {
            const rows = all.filter(d => d.stageId === stage.id);
            if (rows.length === 0) return null;
            const shown = rows.slice(0, 20);
            return (
              <div className="wksec" key={stage.id}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                  <div className="wksec-title" style={{ marginBottom: 2 }}>{stage.title}</div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--ink-3)" }}>{rows.length}</span>
                </div>
                <p style={{ color: "var(--ink-2)", fontSize: "0.84rem", margin: "0 0 12px" }}>{stage.sub}</p>
                <div className="wkcard" style={{ padding: 0, overflow: "hidden" }}>
                  {shown.map((d, i) => (
                    <DealRow key={d.id} row={d} last={i === shown.length - 1} onOpen={() => openDeal(d.rawId, d.name)} />
                  ))}
                </div>
                {rows.length > shown.length && (
                  <button type="button" onClick={() => openTab({ id: "deals-all", kind: "deals-list", title: "All deals", dealsListView: "all" })} style={{ all: "unset", cursor: "pointer", marginTop: 8, fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 600, color: "var(--accent-strong)" }}>See all {rows.length} →</button>
                )}
              </div>
            );
          })}

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

function DealRow({ row, last, onOpen }: { row: MobileStageRow; last: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, width: "100%", boxSizing: "border-box", padding: "14px 18px", borderBottom: last ? "none" : "1px solid var(--line)" }}
      onClick={onOpen}
    >
      <span className="logo">{initials(row.name)}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", color: "var(--ink)", fontWeight: 600, fontSize: "0.92rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.name}</span>
        <span style={{ display: "block", color: "var(--ink-3)", fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.sub}</span>
      </span>
      <span className={`statpill ${verdictClass(row.verdict)}`}><span className="d" />{capitalize(row.verdict)}</span>
    </button>
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
      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-strong)", fontSize: "1rem" }}>{pick.fit}</span>
    </button>
  );
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
