/* ============================================================================
   Closing.tsx — Closing & Post-merger workspace surfaces, plus a journeys
   reference board showing the four lifecycles (SELL · BUY · RAISE · PMI).
   Faithful port of Test 33 / source/closing.jsx.

   - Closing: conditions-to-close checklist, funds-flow Sources & Uses, and a
     Yulia banner that escalates to a StagedConfirm (THE LINE) before any
     funds-flow memo is transmitted to the escrow agent — irreversible & outward.
   - PostMerger: integration workstreams with status + progress, and an honest
     synergy-capture empty state until the post-close GL is connected.
   - JourneysBoard: the four lifecycles, journey-aware stage rails.

   PRESENTATIONAL ONLY — all data arrives via typed props; the integration layer
   wires real data, the surrounding Sidebar/Yulia rail, and callbacks later. The
   honest-empty states (EmptyChart "No live feed yet") are preserved by design.
   ============================================================================ */
import { Fragment, useState } from "react";
import { Ic, Mono, Dot, Btn, YuliaMark, StatusPill } from "../primitives";
import type { PillTone } from "../primitives";
import { TopBar, StagedConfirm, EmptyChart, JOURNEYS } from "../chrome";

/* ---- shared kinds — the source uses ok | warn | neutral row tones ---- */
export type ClosingRowKind = "ok" | "warn" | "neutral";

/** Maps the design's row `kind` to a StatusPill tone (1:1 for the kinds used). */
function rowTone(kind: ClosingRowKind): PillTone {
  return kind === "ok" ? "ok" : kind === "warn" ? "warn" : "neutral";
}

/* ============================================================ CLOSING */

export interface ClosingCondition {
  /** Condition title, e.g. "Purchase agreement executed". */
  title: string;
  /** Detail line, e.g. "All parties signed June 11". */
  detail: string;
  /** Row status — drives the icon and pill tone. */
  kind: ClosingRowKind;
  /** Pill label, e.g. "Signed" / "Pending" / "2 of 3". */
  label: string;
}

export interface FundsFlowRow {
  /** Line label, e.g. "Senior debt" / "Purchase price (equity)". */
  label: string;
  /** Formatted value, e.g. "$96.0M". */
  value: string;
}

export interface ClosingProps {
  /** Tab labels (Closing checklist | Funds flow | Signature packet). Selection is local-only. */
  tabs?: string[];
  /** Top-bar deal identity. */
  deal?: string;
  target?: string;
  side?: string;
  journey?: string;
  stageActive?: string;
  /** Target-close caption shown at the right of the tab strip. */
  targetCloseLabel?: string;
  /** Conditions-to-close rows. */
  conditions: ClosingCondition[];
  /** Caption for the conditions section pill, e.g. "4 of 6 cleared". */
  conditionsClearedLabel?: string;
  /** Funds-flow Sources rows. */
  sources: FundsFlowRow[];
  /** Funds-flow Uses rows. */
  uses: FundsFlowRow[];
  /** Tie-out total shown on both Sources & Uses cards, e.g. "$184.0M". */
  fundsFlowTotal: string;
  /** Funds-flow banner copy (before "$184.0M" is highlighted via fundsFlowTotal). */
  fundsFlowMemoLine?: string;
  onHome?: () => void;
  onRecheck?: () => void;
  /** Fired when the user authorizes (confirms) the funds-flow memo transmission. */
  onAuthorizeFundsFlow?: () => void;
}

export function Closing({
  tabs = ["Closing checklist", "Funds flow", "Signature packet"],
  deal = "Project Atlas",
  target = "Northwind Logistics",
  side = "buy-side",
  journey = "BUY",
  stageActive = "Closing",
  targetCloseLabel = "Target close · June 28",
  conditions,
  conditionsClearedLabel = "4 of 6 cleared",
  sources,
  uses,
  fundsFlowTotal,
  fundsFlowMemoLine = "Sources tie to uses at",
  onHome,
  onRecheck,
  onAuthorizeFundsFlow,
}: ClosingProps) {
  const [tab, setTab] = useState(0);
  const [auth, setAuth] = useState<"idle" | "open" | "done">("idle");

  const tabIcon = (i: number): string => (i === 0 ? "check" : i === 1 ? "bars" : "doc");

  return (
    <div className="mck-col mck-grow" style={{ minWidth: 0, height: "100%" }}>
      <TopBar deal={deal} target={target} side={side} journey={journey} stageActive={stageActive} onHome={onHome} />
      <div className="mck-row" style={{ gap: 4, padding: "8px 22px", borderBottom: "1px solid var(--line)" }}>
        {tabs.map((t, i) => (
          <span key={t} className={"mck-tab" + (i === tab ? " is-active" : "")} onClick={() => setTab(i)} style={{ cursor: "pointer" }}>
            <Ic name={tabIcon(i)} size={14} />{t}
          </span>
        ))}
        <div className="mck-grow" />
        <span className="mck-row" style={{ gap: 7, fontSize: 11.5, color: "var(--ink-3)" }}>
          <Dot tone="accent" pulse /> {targetCloseLabel}
        </span>
      </div>

      <div className="mck-grow mck-scrollfade" style={{ overflow: "hidden", padding: "30px 0" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 34px", display: "flex", flexDirection: "column", gap: 30 }}>
          {/* conditions to close */}
          <section>
            <div className="mck-row" style={{ gap: 10, marginBottom: 14 }}>
              <span className="mck-eyebrow">01</span>
              <h2 style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", margin: 0, whiteSpace: "nowrap", flex: "0 0 auto" }}>Conditions to close</h2>
              <span className="mck-pill mck-pill-neutral" style={{ marginLeft: 2 }}>{conditionsClearedLabel}</span>
              <div className="mck-grow" />
              <Btn variant="quiet" size="sm" icon="agent" onClick={onRecheck}>Re-check</Btn>
            </div>
            <div className="mck-card" style={{ overflow: "hidden" }}>
              {conditions.map((c, i) => (
                <div key={c.title} className="mck-row" style={{ gap: 13, padding: "13px 16px", borderTop: i ? "1px solid var(--line-2)" : "none" }}>
                  <span className={"mck-task-ic " + (c.kind === "ok" ? "is-done" : "")}><Ic name={c.kind === "ok" ? "check" : "clock"} size={13} /></span>
                  <span className="mck-col" style={{ gap: 2 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>{c.title}</span>
                    <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{c.detail}</span>
                  </span>
                  <span style={{ marginLeft: "auto" }}><StatusPill tone={rowTone(c.kind)} dot={c.kind !== "neutral"}>{c.label}</StatusPill></span>
                </div>
              ))}
            </div>
          </section>

          {/* funds flow */}
          <section>
            <div className="mck-row" style={{ gap: 10, marginBottom: 14 }}>
              <span className="mck-eyebrow">02</span>
              <h2 style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", margin: 0, whiteSpace: "nowrap", flex: "0 0 auto" }}>Funds flow</h2>
              <span className="mck-pill mck-pill-yulia" style={{ marginLeft: 2 }}><Ic name="agent" size={11} />reconciled by Yulia</span>
            </div>
            <div className="mck-row" style={{ gap: 14, marginBottom: 16 }}>
              {([["Sources", sources], ["Uses", uses]] as const).map(([title, rows]) => (
                <div key={title} className="mck-card mck-grow" style={{ overflow: "hidden" }}>
                  <div className="mck-row" style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{title}</span>
                    <Mono className="mck-tnum" style={{ marginLeft: "auto", fontSize: 13, fontWeight: 600 }}>{fundsFlowTotal}</Mono>
                  </div>
                  <div className="mck-hr" />
                  {rows.map((r, i) => (
                    <div key={r.label} className="mck-row" style={{ padding: "11px 16px", borderTop: i ? "1px solid var(--line-2)" : "none" }}>
                      <span style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{r.label}</span>
                      <Mono className="mck-tnum" style={{ marginLeft: "auto", fontSize: 12.5 }}>{r.value}</Mono>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {auth === "idle" && (
              <div className="mck-row" style={{ gap: 12, padding: "13px 16px", background: "var(--accent-soft)", border: "1px solid var(--accent-line)", borderRadius: 11 }}>
                <YuliaMark size={24} />
                <span style={{ fontSize: 13, color: "var(--accent-ink)" }}>{fundsFlowMemoLine} <b>{fundsFlowTotal}</b>. The funds-flow memo is ready for the escrow agent.</span>
                <button className="mck-btn mck-btn-ink mck-btn-sm" style={{ marginLeft: "auto" }} onClick={() => setAuth("open")}>Authorize funds flow</button>
              </div>
            )}
            {auth === "open" && (
              <StagedConfirm
                title="Send funds-flow memo to escrow agent"
                kv={[
                  { k: "Action", v: "Transmit signed funds-flow memo to Northern Trust (escrow)" },
                  { k: "Total", v: `${fundsFlowTotal} — sources tie to uses` },
                  { k: "Reversible", v: "No — initiates settlement on close date" },
                ]}
                note="Outward-facing & irreversible — Yulia prepares but never transmits or moves money until you confirm."
                confirmLabel="Authorize"
                status="open"
                onConfirm={() => { setAuth("done"); onAuthorizeFundsFlow && onAuthorizeFundsFlow(); }}
                onCancel={() => setAuth("idle")}
              />
            )}
            {auth === "done" && <StagedConfirm status="done" />}
          </section>
        </div>
      </div>
    </div>
  );
}

/* ============================================================ POST-MERGER (PMI) */

export interface IntegrationWorkstream {
  /** Workstream title, e.g. "Day-0 communications". */
  title: string;
  /** Detail line, e.g. "Employees, customers & vendors notified". */
  detail: string;
  /** Row status — drives the pill tone and bar color. */
  kind: ClosingRowKind;
  /** Pill label, e.g. "Complete" / "In progress" / "Not started". */
  label: string;
  /** Progress, 0–100. */
  pct: number;
}

export interface PostMergerProps {
  /** Tab labels (Integration plan | Synergy tracking | Milestones). Selection is local-only. */
  tabs?: string[];
  /** Top-bar deal identity. */
  deal?: string;
  target?: string;
  side?: string;
  journey?: string;
  stageActive?: string;
  /** Day-counter caption shown at the right of the tab strip, e.g. "Day 24 of 100". */
  dayLabel?: string;
  /** Integration workstream rows. */
  workstreams: IntegrationWorkstream[];
  /** Synergy section pill, e.g. "Target $41M NPV". */
  synergyTargetLabel?: string;
  /**
   * Synergy capture is honest-empty until the post-close GL is connected.
   * When false (or omitted) the EmptyChart "No live feed yet" is shown. The
   * integrator flips this true and passes `synergyContent` once data exists.
   */
  synergyConnected?: boolean;
  /** Optional real synergy chart/content, rendered when synergyConnected is true. */
  synergyContent?: React.ReactNode;
  onHome?: () => void;
  onGeneratePlan?: () => void;
}

export function PostMerger({
  tabs = ["Integration plan", "Synergy tracking", "Milestones"],
  deal = "Project Atlas",
  target = "Northwind Logistics",
  side = "integration",
  journey = "PMI",
  stageActive = "Stabilization",
  dayLabel = "Day 24 of 100",
  workstreams,
  synergyTargetLabel = "Target $41M NPV",
  synergyConnected = false,
  synergyContent,
  onHome,
  onGeneratePlan,
}: PostMergerProps) {
  const [tab, setTab] = useState(0);

  const tabIcon = (i: number): string => (i === 0 ? "st_post" : i === 1 ? "bars" : "clock");

  return (
    <div className="mck-col mck-grow" style={{ minWidth: 0, height: "100%" }}>
      <TopBar deal={deal} target={target} side={side} journey={journey} stageActive={stageActive} onHome={onHome} />
      <div className="mck-row" style={{ gap: 4, padding: "8px 22px", borderBottom: "1px solid var(--line)" }}>
        {tabs.map((t, i) => (
          <span key={t} className={"mck-tab" + (i === tab ? " is-active" : "")} onClick={() => setTab(i)} style={{ cursor: "pointer" }}>
            <Ic name={tabIcon(i)} size={14} />{t}
          </span>
        ))}
        <div className="mck-grow" />
        <span className="mck-row" style={{ gap: 7, fontSize: 11.5, color: "var(--ink-3)" }}>
          <Dot tone="accent" pulse /> {dayLabel}
        </span>
      </div>

      <div className="mck-grow mck-scrollfade" style={{ overflow: "hidden", padding: "30px 0" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 34px", display: "flex", flexDirection: "column", gap: 30 }}>
          <section>
            <div className="mck-row" style={{ gap: 10, marginBottom: 14 }}>
              <span className="mck-eyebrow">01</span>
              <h2 style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", margin: 0, whiteSpace: "nowrap", flex: "0 0 auto" }}>Integration workstreams</h2>
              <div className="mck-grow" />
              <Btn variant="quiet" size="sm" icon="agent" onClick={onGeneratePlan}>Generate 100-day plan</Btn>
            </div>
            <div className="mck-col" style={{ gap: 8 }}>
              {workstreams.map((w) => (
                <div key={w.title} className="mck-card" style={{ padding: "14px 16px" }}>
                  <div className="mck-row" style={{ gap: 13 }}>
                    <span className="mck-col" style={{ gap: 2, flex: 1 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600 }}>{w.title}</span>
                      <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{w.detail}</span>
                    </span>
                    <StatusPill tone={rowTone(w.kind)} dot={w.kind !== "neutral"}>{w.label}</StatusPill>
                  </div>
                  <div className="mck-row" style={{ gap: 12, marginTop: 11 }}>
                    <div className="mck-grow" style={{ height: 5, borderRadius: 3, background: "var(--surface-3)", position: "relative" }}>
                      <span style={{ position: "absolute", left: 0, top: 0, height: "100%", width: w.pct + "%", borderRadius: 3, background: w.kind === "ok" ? "var(--ok)" : "var(--ink)" }} />
                    </div>
                    <Mono className="mck-tnum" style={{ fontSize: 11.5, color: "var(--ink-2)", width: 34, textAlign: "right" }}>{w.pct}%</Mono>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mck-row" style={{ gap: 10, marginBottom: 14 }}>
              <span className="mck-eyebrow">02</span>
              <h2 style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", margin: 0, whiteSpace: "nowrap", flex: "0 0 auto" }}>Synergy capture</h2>
              <span className="mck-pill mck-pill-neutral" style={{ marginLeft: 2 }}>{synergyTargetLabel}</span>
            </div>
            <div className="mck-card" style={{ padding: 18 }}>
              {synergyConnected && synergyContent ? (
                synergyContent
              ) : (
                <EmptyChart
                  icon="bars"
                  title="No live feed yet"
                  sub="Synergy capture tracks against the finance system once the post-close GL is connected. Until then I show plan vs. — actuals."
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ============================================================ JOURNEYS BOARD */

export interface JourneyRowData {
  /** Journey code, e.g. "BUY" / "SELL" / "RAISE" / "PMI". */
  name: string;
  /** Subtitle, e.g. "Acquisition — the hero example (Project Atlas)". */
  sub: string;
  /** Ordered stage labels; defaults to JOURNEYS[name] when omitted. */
  stages?: string[];
  /** Index of the current stage; earlier stages render as done. */
  curIdx: number;
}

export interface JourneysBoardProps {
  /** Header title. */
  title?: string;
  /** Header caption shown at the right. */
  caption?: string;
  /** The lifecycle rows; defaults to the four canonical journeys. */
  journeys?: JourneyRowData[];
  /** Footer note explaining journey-aware nav. */
  footnote?: string;
}

function JourneyRow({ name, sub, stages, curIdx }: JourneyRowData) {
  const list = stages ?? JOURNEYS[name] ?? [];
  return (
    <div className="mck-card" style={{ padding: "16px 18px" }}>
      <div className="mck-row" style={{ gap: 10, marginBottom: 13 }}>
        <span className="mck-pill mck-pill-neutral"><Mono style={{ fontSize: 10 }}>{name}</Mono></span>
        <span style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{sub}</span>
      </div>
      <div className="mck-stageline" style={{ flexWrap: "wrap", rowGap: 8 }}>
        {list.map((s, i) => (
          <Fragment key={s}>
            {i > 0 && <span style={{ color: "var(--ink-4)", fontSize: 11 }}>·</span>}
            <span className={"mck-stage-node " + (i < curIdx ? "is-done" : i === curIdx ? "is-cur" : "")}>{s}</span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

const JOURNEYS_DEFAULT: JourneyRowData[] = [
  { name: "BUY", sub: "Acquisition — the hero example (Project Atlas)", stages: JOURNEYS.BUY, curIdx: 5 },
  { name: "SELL", sub: "Sell-side mandate (Project Vela)", stages: JOURNEYS.SELL, curIdx: 5 },
  { name: "RAISE", sub: "Capital raise (Project Ember)", stages: JOURNEYS.RAISE, curIdx: 3 },
  { name: "PMI", sub: "Post-merger integration", stages: JOURNEYS.PMI, curIdx: 1 },
];

export function JourneysBoard({
  title = "Journeys",
  caption = "The pipeline rail reads each deal's journey & shows its stages",
  journeys = JOURNEYS_DEFAULT,
  footnote = "Each deal lives in one journey. The left rail's PIPELINE section and the top-bar breadcrumb both adapt to the active deal's journey and show live counts per stage.",
}: JourneysBoardProps) {
  return (
    <div className="mck" style={{ flexDirection: "column", overflow: "hidden", background: "var(--bg)" }}>
      <div className="mck-row" style={{ gap: 11, height: 56, flex: "0 0 56px", padding: "0 30px", borderBottom: "1px solid var(--line)" }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{title}</span>
        <span className="mck-pill mck-pill-neutral" style={{ marginLeft: 4 }}>Journey-aware nav</span>
        <div className="mck-grow" />
        <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{caption}</span>
      </div>
      <div className="mck-grow" style={{ overflow: "hidden", padding: "28px 30px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
          {journeys.map((j) => (
            <JourneyRow key={j.name} {...j} />
          ))}
          <div className="mck-row" style={{ gap: 9, marginTop: 6, padding: "12px 15px", background: "var(--surface-2)", borderRadius: 10, fontSize: 12, color: "var(--ink-2)" }}>
            <Ic name="agent" size={14} style={{ color: "var(--accent)", flex: "0 0 auto" }} />
            {footnote}
          </div>
        </div>
      </div>
    </div>
  );
}
