/* ============================================================================
   NewDeal.tsx — New-deal intake flow. Name the deal, pick a journey, and Yulia
   stands up the workspace and kicks off the first stage. Exports NewDeal.

   Faithful port of Test 33 / intake.jsx → presentational TSX. The journey picker
   drives a live "here's how I'll run a {journey} deal" plan card whose prose and
   stage breadcrumb update with the chosen journey. THE LINE: the plan is what
   Yulia WILL do once you create the deal — the user decides by clicking Create.

   PRESENTATIONAL ONLY: no data fetching, no network hooks. Journey/name/target
   may be controlled via props or fall back to local state; callbacks via props.
   Styling lives in nd.css (.mck-* under .nd-root). Primitives from ../primitives,
   shared chrome (Sidebar, JOURNEYS) from ../chrome.
   ============================================================================ */
import { Fragment, useState } from "react";
import type { CSSProperties } from "react";
import { Ic, YuliaMark } from "../primitives";
import type { IcName } from "../primitives";
import { Sidebar, JOURNEYS } from "../chrome";

/* ---- journey options — the four top-level mandates ---- */
export type NewDealJourney = "BUY" | "SELL" | "RAISE" | "PMI";

interface JourneyCard {
  key: NewDealJourney;
  label: string;
  ic: IcName;
  desc: string;
  plan: string;
}
const JOURNEY_CARDS: JourneyCard[] = [
  { key: "BUY", label: "Buy", ic: "st_source", desc: "Acquire a target", plan: "I'll define the thesis, screen targets, value the business, run diligence, and prep the close." },
  { key: "SELL", label: "Sell", ic: "target", desc: "Sell-side mandate", plan: "I'll package the business, match it to ranked buyers, run the process, and drive to close." },
  { key: "RAISE", label: "Raise", ic: "bars", desc: "Raise capital", plan: "I'll build the financial package & investor materials, rank investors, and manage outreach." },
  { key: "PMI", label: "Integrate", ic: "st_post", desc: "Post-merger", plan: "I'll stand up the 100-day plan, track integration workstreams, and monitor synergy capture." },
];

/* ---- labelled input field ---- */
interface FieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  mono?: boolean;
}
function Field({ label, placeholder, value, onChange, mono }: FieldProps) {
  return (
    <label className="mck-col" style={{ gap: 7 }}>
      <span className="mck-kv-k">{label}</span>
      <input
        className="mck-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ fontFamily: mono ? "var(--mono)" : "inherit" } as CSSProperties}
      />
    </label>
  );
}

export interface NewDealProps {
  /** chosen journey — controlled when paired with onPick; else seeds local state */
  journey?: NewDealJourney;
  /** seed for the uncontrolled journey; defaults to "BUY" */
  defaultJourney?: NewDealJourney;
  onPick?: (journey: NewDealJourney) => void;

  /** project name — controlled when paired with onName; else seeds local state */
  name?: string;
  defaultName?: string;
  onName?: (name: string) => void;

  /** target / company — controlled when paired with onTarget; else seeds local state */
  target?: string;
  defaultTarget?: string;
  onTarget?: (target: string) => void;

  /** primary: create the deal & hand off to Yulia. Receives the assembled draft. */
  onCreate?: (draft: { journey: NewDealJourney; name: string; target: string }) => void;
  /** secondary: dismiss the flow */
  onCancel?: () => void;

  /** shell wiring — forwarded to the journey-aware Sidebar */
  onHome?: () => void;
  onNav?: (key: string) => void;
}

export function NewDeal({
  journey: journeyProp,
  defaultJourney = "BUY",
  onPick,
  name: nameProp,
  defaultName = "",
  onName,
  target: targetProp,
  defaultTarget = "",
  onTarget,
  onCreate,
  onCancel,
  onHome,
  onNav,
}: NewDealProps) {
  const [journeyLocal, setJourneyLocal] = useState<NewDealJourney>(defaultJourney);
  const [nameLocal, setNameLocal] = useState(defaultName);
  const [targetLocal, setTargetLocal] = useState(defaultTarget);

  const journey = journeyProp ?? journeyLocal;
  const name = nameProp ?? nameLocal;
  const target = targetProp ?? targetLocal;

  const setJourney = (j: NewDealJourney) => {
    if (journeyProp === undefined) setJourneyLocal(j);
    onPick?.(j);
  };
  const setName = (v: string) => {
    if (nameProp === undefined) setNameLocal(v);
    onName?.(v);
  };
  const setTarget = (v: string) => {
    if (targetProp === undefined) setTargetLocal(v);
    onTarget?.(v);
  };

  const cur = JOURNEY_CARDS.find((j) => j.key === journey) || JOURNEY_CARDS[0];
  const stages = JOURNEYS[journey] || [];

  const create = () => onCreate?.({ journey, name, target });

  return (
    <div className="mck">
      <Sidebar active="new" journey={journey} onHome={onHome} onNav={onNav} />
      <div className="mck-col mck-grow" style={{ minWidth: 0, height: "100%" }}>
        <div className="mck-row" style={{ gap: 10, height: 54, flex: "0 0 54px", padding: "0 26px", borderBottom: "1px solid var(--line)" }}>
          <Ic name="plus" size={17} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>New deal</span>
          <div className="mck-grow" />
          <button className="mck-iconbtn" title="Close" onClick={onHome}><Ic name="x" size={16} /></button>
        </div>

        <div className="mck-grow mck-scrollfade" style={{ overflow: "auto", padding: "44px 0" }}>
          <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 32px", display: "flex", flexDirection: "column", gap: 30 }}>
            <div className="mck-row" style={{ gap: 12, alignItems: "flex-start" }}>
              <YuliaMark size={32} />
              <div className="mck-col" style={{ gap: 5 }}>
                <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.025em", margin: 0 }}>Let's set up a new deal.</h1>
                <p style={{ fontSize: 14.5, color: "var(--ink-2)", margin: 0, lineHeight: 1.55 }}>Tell me what you're working on. I'll create the workspace and kick off the first stage.</p>
              </div>
            </div>

            {/* journey picker */}
            <div className="mck-col" style={{ gap: 11 }}>
              <span className="mck-eyebrow">Journey</span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {JOURNEY_CARDS.map((j) => {
                  const on = j.key === journey;
                  return (
                    <button key={j.key} onClick={() => setJourney(j.key)}
                      className="mck-card" style={{ padding: "15px 14px", textAlign: "left", display: "flex", flexDirection: "column", gap: 9, cursor: "pointer", boxShadow: on ? "0 0 0 1.5px var(--accent)" : "none", borderColor: on ? "var(--accent-line)" : "var(--line)", background: on ? "var(--accent-soft)" : "var(--surface)" }}>
                      <span className="mck-task-ic" style={{ width: 30, height: 30, borderRadius: 8, background: on ? "var(--accent)" : "var(--surface-2)", color: on ? "#fff" : "var(--ink-2)" }}><Ic name={j.ic} size={15} /></span>
                      <span className="mck-col" style={{ gap: 1 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: on ? "var(--accent-ink)" : "var(--ink)" }}>{j.label}</span>
                        <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{j.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* fields */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Project name" placeholder="e.g. Project Atlas" value={name} onChange={setName} />
              <Field label="Target / company" placeholder="e.g. Northwind Logistics" value={target} onChange={setTarget} />
            </div>

            {/* what Yulia will do */}
            <div className="mck-card" style={{ padding: 0, overflow: "hidden" }}>
              <div className="mck-row" style={{ gap: 10, padding: "14px 16px", background: "var(--accent-soft)", borderBottom: "1px solid var(--accent-line)" }}>
                <YuliaMark size={22} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-ink)" }}>Here's how I'll run a {cur.label.toLowerCase()} deal</span>
              </div>
              <div style={{ padding: "15px 16px" }}>
                <p style={{ fontSize: 13.5, lineHeight: 1.6, margin: "0 0 14px", color: "var(--ink)" }}>{cur.plan}</p>
                <div className="mck-stageline" style={{ flexWrap: "wrap", rowGap: 8 }}>
                  {stages.map((s, i) => (
                    <Fragment key={s}>
                      {i > 0 && <span style={{ color: "var(--ink-4)", fontSize: 11 }}>·</span>}
                      <span className={"mck-stage-node " + (i === 0 ? "is-cur" : "")}>{s}</span>
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* actions */}
            <div className="mck-row" style={{ gap: 10 }}>
              <button className="mck-btn mck-btn-ink mck-btn-md" onClick={create}><Ic name="agent" size={14} />Create deal &amp; start with Yulia</button>
              <button className="mck-btn mck-btn-ghost mck-btn-md" onClick={onCancel}>Cancel</button>
              <div className="mck-grow" />
              <span className="mck-row" style={{ gap: 7, fontSize: 11.5, color: "var(--ink-3)" }}>
                <Ic name="agent" size={12} /> Yulia sets up the workspace — nothing leaves the building until you approve it.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
