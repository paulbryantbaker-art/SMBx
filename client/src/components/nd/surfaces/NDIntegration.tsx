/* ============================================================================
   NDIntegration — the post-merger INTEGRATION surface (the "Integration" tab in
   NDDealWorkspace for a PMI-journey deal). Now backed by the REAL 100-day
   value-capture plan (server/routes/pmiPlan.ts + pmiValueCaptureService).

   HONESTY: targets are ILLUSTRATIVE (labeled). Execution progress is
   self-reported (workstream status/%). There is NO verified captured-$ number —
   that waits for a finance/GL connector — so section 03 shows a standing
   "verified actuals pending" banner and never a fabricated capture figure.
   Stage timeline (01) + deliverables (04) are real from the deal record.
   THE LINE: plan & implications only; Yulia never recommends regulated moves.
   ============================================================================ */
import { Ic, Mono, Btn, Dot, StatusPill, type PillTone } from "../primitives";
import { EmptyChart } from "../chrome";

interface GateRow { gate: string; status?: string; completed_at?: string | null }
interface DeliverableRow { id: number; name?: string; slug?: string; status?: string; gate?: string | null }
export interface Workstream { id: number; title: string; detail?: string; owner?: string | null; first_move?: string | null; status: string; pct: number; kind: "ok" | "warn" | "neutral"; label: string }
export interface ValueLever { name: string; category: string; target_value_cents: number | null; confidence: string }

const PMI_STAGES: { code: string; label: string }[] = [
  { code: "PMI0", label: "Day 0" },
  { code: "PMI1", label: "Stabilization" },
  { code: "PMI2", label: "Assessment" },
  { code: "PMI3", label: "Optimization" },
];

function titleCase(s: string) { return s.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase()); }
function fmtCents(c?: number | null): string {
  if (c == null || !isFinite(c)) return "—";
  const d = c / 100;
  if (d >= 1e9) return `$${(d / 1e9).toFixed(1)}B`;
  if (d >= 1e6) return `$${(d / 1e6).toFixed(d >= 1e7 ? 0 : 1)}M`;
  if (d >= 1e3) return `$${Math.round(d / 1e3)}K`;
  return `$${Math.round(d)}`;
}
const LEVER_TONE: Record<string, PillTone> = { cost_synergy: "ok", revenue_synergy: "ok", working_capital: "neutral", operational: "neutral", integration_risk: "warn", one_time_cost: "warn" };

export function NDIntegration({
  dealName, gates, deliverables, currentGate, onAsk,
  workstreams = [], levers = [], targetValueCents = null, generating = false,
  onGenerate, onSetWorkstreamStatus,
}: {
  dealName: string;
  gates: GateRow[];
  deliverables: DeliverableRow[];
  currentGate?: string | null;
  onAsk: (prompt: string) => void;
  workstreams?: Workstream[];
  levers?: ValueLever[];
  targetValueCents?: number | null;
  generating?: boolean;
  onGenerate?: () => void;
  onSetWorkstreamStatus?: (wsId: number, status: string) => void;
}) {
  const stageStatus = (code: string): "done" | "current" | "upcoming" => {
    const g = gates.find(x => (x.gate || "").toUpperCase() === code);
    if (g?.status === "completed") return "done";
    if (code === (currentGate || "").toUpperCase() || g?.status === "active") return "current";
    return "upcoming";
  };
  const doneCount = PMI_STAGES.filter(s => stageStatus(s.code) === "done").length;
  const curIdx = PMI_STAGES.findIndex(s => stageStatus(s.code) === "current");

  const dels = (deliverables || []).filter(d => d.name || d.slug);
  const hasPlan = workstreams.length > 0;
  const wsComplete = workstreams.filter(w => w.status === "complete").length;

  return (
    <div className="mck-grow mck-scrollfade" style={{ overflow: "auto", minHeight: 0 }}>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "30px 34px", display: "flex", flexDirection: "column", gap: 30 }}>

        {/* 01 — integration timeline (REAL, from gates) */}
        <section>
          <div className="mck-row" style={{ gap: 10, marginBottom: 16 }}>
            <span className="mck-eyebrow">01</span>
            <h2 style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Integration timeline</h2>
            <div className="mck-grow" />
            <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{doneCount} of {PMI_STAGES.length} stages complete</span>
          </div>
          <div className="mck-card" style={{ padding: "22px 24px" }}>
            <div className="mck-row" style={{ gap: 0, alignItems: "flex-start" }}>
              {PMI_STAGES.map((s, i) => {
                const st = stageStatus(s.code);
                const color = st === "done" ? "var(--ink)" : st === "current" ? "var(--accent)" : "var(--ink-4)";
                return (
                  <div key={s.code} className="mck-col" style={{ flex: 1, alignItems: "center", gap: 8, position: "relative" }}>
                    {i > 0 && <span style={{ position: "absolute", left: "-50%", top: 11, width: "100%", height: 2, background: i <= curIdx || doneCount > i ? "var(--ink-3)" : "var(--line)" }} />}
                    <span style={{ zIndex: 1, width: 24, height: 24, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", background: st === "upcoming" ? "var(--surface-3)" : color, color: st === "upcoming" ? "var(--ink-4)" : "#fff" }}>
                      {st === "done" ? <Ic name="check" size={13} /> : st === "current" ? <Dot tone="ink" size={7} /> : <Mono style={{ fontSize: 10, color: "var(--ink-4)" }}>{i}</Mono>}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: st === "current" ? 600 : 500, color: st === "upcoming" ? "var(--ink-4)" : "var(--ink)", textAlign: "center" }}>{s.label}</span>
                    {st === "current" && <span className="mck-pill mck-pill-yulia" style={{ fontSize: 9.5 }}>In progress</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 02 — integration workstreams (REAL plan or honest-empty) */}
        <section>
          <div className="mck-row" style={{ gap: 10, marginBottom: 14 }}>
            <span className="mck-eyebrow">02</span>
            <h2 style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Integration workstreams</h2>
            {hasPlan && <span className="mck-pill mck-pill-neutral" style={{ height: 18, padding: "0 7px", fontSize: 10 }}>{wsComplete}/{workstreams.length} done</span>}
            <div className="mck-grow" />
            <Btn variant="quiet" size="sm" icon={generating ? "spark" : "agent"} onClick={onGenerate}>{generating ? "Building…" : hasPlan ? "Rebuild plan" : "Build 100-day plan"}</Btn>
          </div>
          {hasPlan ? (
            <div className="mck-col" style={{ gap: 8 }}>
              {workstreams.map(w => (
                <div key={w.id} className="mck-card" style={{ padding: "14px 16px" }}>
                  <div className="mck-row" style={{ gap: 13, alignItems: "flex-start" }}>
                    <span className="mck-col" style={{ gap: 3, flex: 1, minWidth: 0 }}>
                      <span className="mck-row" style={{ gap: 8 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600 }}>{w.title}</span>
                        {w.owner && <span className="mck-pill mck-pill-neutral" style={{ fontSize: 10 }}>{w.owner}</span>}
                      </span>
                      {w.detail && <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{w.detail}</span>}
                      {w.first_move && <span className="mck-row" style={{ gap: 6, fontSize: 11.5, color: "var(--ink-3)", marginTop: 1 }}><Ic name="arrowRight" size={11} />{w.first_move}</span>}
                    </span>
                    <StatusPill tone={w.kind} dot={w.kind !== "neutral"}>{w.label}</StatusPill>
                  </div>
                  <div className="mck-row" style={{ gap: 12, marginTop: 11 }}>
                    <div className="mck-grow" style={{ height: 5, borderRadius: 3, background: "var(--surface-3)", position: "relative" }}>
                      <span style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${w.pct}%`, borderRadius: 3, background: w.kind === "ok" ? "var(--ok)" : w.kind === "warn" ? "var(--warn)" : "var(--ink)", transition: "width .2s" }} />
                    </div>
                    {onSetWorkstreamStatus && (
                      <div className="mck-row" style={{ gap: 5, flex: "0 0 auto" }}>
                        <WsBtn label="On track" active={w.status === "on_track"} onClick={() => onSetWorkstreamStatus(w.id, "on_track")} />
                        <WsBtn label="At risk" active={w.status === "at_risk"} onClick={() => onSetWorkstreamStatus(w.id, "at_risk")} />
                        <WsBtn label="Done" active={w.status === "complete"} onClick={() => onSetWorkstreamStatus(w.id, "complete")} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyChart icon="st_post" h={150} title="No 100-day plan yet"
              sub="Build the plan and Yulia lays out the integration workstreams — Day-0 comms, finance & systems, customers, people, synergy capture — with owners and first moves you can track here." />
          )}
        </section>

        {/* 03 — value creation (illustrative targets; verified actuals pending GL) */}
        <section>
          <div className="mck-row" style={{ gap: 10, marginBottom: 14 }}>
            <span className="mck-eyebrow">03</span>
            <h2 style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Value creation</h2>
            {targetValueCents != null && targetValueCents > 0 && (
              <span className="mck-pill mck-pill-neutral" style={{ marginLeft: 2 }}>Target {fmtCents(targetValueCents)} · illustrative</span>
            )}
          </div>
          {levers.length > 0 ? (
            <div className="mck-col" style={{ gap: 12 }}>
              <div className="mck-card" style={{ overflow: "hidden" }}>
                <table className="mck-tbl">
                  <thead><tr><th style={{ paddingLeft: 16 }}>Value lever</th><th>Type</th><th>Target (illustrative)</th><th>Confidence</th></tr></thead>
                  <tbody>
                    {levers.map((l, i) => (
                      <tr key={i}>
                        <td style={{ paddingLeft: 16, fontSize: 13.5, fontWeight: 500 }}>{l.name}</td>
                        <td><StatusPill tone={LEVER_TONE[l.category] || "neutral"} dot={false}>{titleCase(l.category)}</StatusPill></td>
                        <td><Mono className="mck-tnum" style={{ color: l.target_value_cents == null ? "var(--ink-4)" : "var(--ink)" }}>{fmtCents(l.target_value_cents)}</Mono></td>
                        <td style={{ color: "var(--ink-2)", fontSize: 12.5 }}>{titleCase(l.confidence)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* the honest line: plan ≠ verified actuals */}
              <div className="mck-row" style={{ gap: 10, padding: "11px 14px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 10 }}>
                <Ic name="agent" size={14} style={{ color: "var(--ink-3)" }} />
                <span style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5 }}>
                  Targets are <b>illustrative</b>. Verified synergy actuals (captured vs. target) track against the books once your finance system is connected — until then, Yulia tracks execution above, not realized dollars.
                </span>
              </div>
            </div>
          ) : (
            <EmptyChart icon="bars" h={140} title="No value levers yet"
              sub="Building the 100-day plan identifies the cost and revenue synergy levers with illustrative targets. Verified capture tracks against the finance system once it's connected." />
          )}
        </section>

        {/* 04 — deliverables (REAL) */}
        <section>
          <div className="mck-row" style={{ gap: 10, marginBottom: 14 }}>
            <span className="mck-eyebrow">04</span>
            <h2 style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Deliverables</h2>
            {dels.length > 0 && <span className="mck-pill mck-pill-neutral" style={{ height: 18, padding: "0 7px", fontSize: 10 }}>{dels.length}</span>}
          </div>
          {dels.length === 0 ? (
            <EmptyChart icon="doc" h={120} title="No deliverables yet"
              sub="Ask Yulia to produce an integration brief, synergy model, or Day-0 checklist and it'll appear here." />
          ) : (
            <div className="mck-card" style={{ overflow: "hidden" }}>
              {dels.map((d, i) => {
                const status = (d.status || "").toLowerCase();
                const tone: PillTone = status === "complete" ? "ok" : status === "queued" || status === "processing" ? "warn" : "neutral";
                return (
                  <div key={d.id} className="mck-row" style={{ gap: 13, padding: "13px 16px", borderTop: i ? "1px solid var(--line-2)" : "none" }}>
                    <span className="mck-task-ic"><Ic name="doc" size={13} /></span>
                    <span style={{ fontSize: 13.5, fontWeight: 500 }}>{d.name || titleCase(d.slug || "Deliverable")}</span>
                    {d.gate && <Mono style={{ fontSize: 10.5, color: "var(--ink-4)" }}>{d.gate}</Mono>}
                    <span style={{ marginLeft: "auto" }}><StatusPill tone={tone} dot={tone !== "neutral"}>{titleCase(d.status || "Draft")}</StatusPill></span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function WsBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mck-btn mck-btn-sm"
      style={{
        height: 24, padding: "0 9px", fontSize: 11, borderRadius: 6,
        background: active ? "var(--ink)" : "transparent",
        color: active ? "#fff" : "var(--ink-3)",
        border: `1px solid ${active ? "var(--ink)" : "var(--line)"}`,
      }}
    >{label}</button>
  );
}
