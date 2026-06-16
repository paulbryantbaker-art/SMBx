/* ============================================================================
   NDIntegration — the post-merger INTEGRATION surface for a PMI-journey deal.
   Rendered as the "Integration" tab in NDDealWorkspace when journey === 'pmi'.

   HONEST BY CONSTRUCTION: there is no PMI/workstream/synergy backend (verified).
   So this surface leads with what IS real — the gate-driven stage timeline
   (Day 0 → Stabilization → Assessment → Optimization) and the deal's deliverables —
   and presents workstreams + synergy capture as honest-empty states with Yulia
   CTAs (which run the real MODEL.PMI.VALUE.CREATION analysis / generate the plan).
   No fabricated synergy numbers. THE LINE: plan & implications, never recommend.
   ============================================================================ */
import { Ic, Mono, Btn, Dot, StatusPill, type PillTone } from "../primitives";
import { EmptyChart } from "../chrome";

interface GateRow { gate: string; status?: string; completed_at?: string | null }
interface DeliverableRow { id: number; name?: string; slug?: string; status?: string; gate?: string | null }

const PMI_STAGES: { code: string; label: string }[] = [
  { code: "PMI0", label: "Day 0" },
  { code: "PMI1", label: "Stabilization" },
  { code: "PMI2", label: "Assessment" },
  { code: "PMI3", label: "Optimization" },
];

function titleCase(s: string) { return s.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase()); }

export function NDIntegration({
  dealName, gates, deliverables, currentGate, onAsk,
}: {
  dealName: string;
  gates: GateRow[];
  deliverables: DeliverableRow[];
  currentGate?: string | null;
  onAsk: (prompt: string) => void;
}) {
  const stageStatus = (code: string): "done" | "current" | "upcoming" => {
    const g = gates.find(x => (x.gate || "").toUpperCase() === code);
    if (g?.status === "completed") return "done";
    if (code === (currentGate || "").toUpperCase() || g?.status === "active") return "current";
    return "upcoming";
  };
  const doneCount = PMI_STAGES.filter(s => stageStatus(s.code) === "done").length;
  const curIdx = PMI_STAGES.findIndex(s => stageStatus(s.code) === "current");

  // real deliverables for this PMI deal (honest — may be from the buy phase)
  const dels = (deliverables || []).filter(d => d.name || d.slug);

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

        {/* 02 — integration workstreams (HONEST-EMPTY — no backend) */}
        <section>
          <div className="mck-row" style={{ gap: 10, marginBottom: 14 }}>
            <span className="mck-eyebrow">02</span>
            <h2 style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Integration workstreams</h2>
            <div className="mck-grow" />
            <Btn variant="quiet" size="sm" icon="agent" onClick={() => onAsk(`Build a 100-day integration plan for ${dealName} — workstreams, owners, and milestones.`)}>Build 100-day plan</Btn>
          </div>
          <EmptyChart icon="st_post" h={140} title="No workstream tracker yet"
            sub="Ask Yulia to build the 100-day plan and she'll lay out the integration workstreams — Day-0 comms, systems, people, customers — with owners and milestones here." />
        </section>

        {/* 03 — value creation / synergy (HONEST-EMPTY until GL connected) */}
        <section>
          <div className="mck-row" style={{ gap: 10, marginBottom: 14 }}>
            <span className="mck-eyebrow">03</span>
            <h2 style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Value creation</h2>
            <div className="mck-grow" />
            <Btn variant="quiet" size="sm" icon="agent" onClick={() => onAsk(`Run the value-creation analysis for ${dealName} — identify the value levers, integration risks, and first-100-day actions.`)}>Run analysis</Btn>
          </div>
          <EmptyChart icon="bars" h={140} title="No synergy actuals yet"
            sub="Yulia models the value levers and 100-day actions on request; synergy capture tracks against the finance system once the post-close GL is connected." />
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
