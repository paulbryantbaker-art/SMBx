/**
 * DealJourneyFlow — answers "where is this deal in the process?" at a glance.
 *
 * A deal's journey (sell/buy/raise/pmi) maps to a known, ordered sequence of
 * stages (gateRegistry). Given the deal's current gate, this renders the whole
 * flow in plain English, marks what's done / where we are / what's next, and
 * says what the current stage needs to advance — no "S0 / gate 12" jargon.
 */
import { getJourneyGates, GATE_MAP, getNextGate } from "@shared/gateRegistry";

type Journey = "sell" | "buy" | "raise" | "pmi";

const JOURNEY_LABEL: Record<Journey, string> = {
  sell: "Sell-side",
  buy: "Buy-side",
  raise: "Capital raise",
  pmi: "Post-merger",
};

// Plain-English "what happens at this stage" for each gate.
const STAGE_BLURB: Record<string, string> = {
  S0: "Capture the basics — industry, location, revenue, and why the owner is selling.",
  S1: "Recast the financials — verify SDE/EBITDA and confirm the add-backs.",
  S2: "Set a defensible valuation range with comps and method triangulation.",
  S3: "Build the CIM and the deal package buyers will see.",
  S4: "Find, rank, and reach the right buyers.",
  S5: "Negotiate, paper the deal, and drive to close.",
  B0: "Define the thesis — what you're buying, the size range, and how you'll finance it.",
  B1: "Source targets that fit the thesis and score them.",
  B2: "Value the target and test whether the financing works.",
  B3: "Run diligence — quality of earnings, legal, and the real risks.",
  B4: "Structure the terms, tax treatment, and financing.",
  B5: "Negotiate, sign, and close.",
  R0: "Capture the raise — amount, use of funds, and current revenue.",
  R1: "Prepare the financial package investors will underwrite.",
  R2: "Build the investor materials and the pitch.",
  R3: "Reach the right investors and run outreach.",
  R4: "Work the terms and the term sheet.",
  R5: "Finalize and close the round.",
  PMI0: "Day zero — lock the close details and the first-100-day plan.",
  PMI1: "Stabilize operations and people.",
  PMI2: "Assess the business against the acquisition thesis.",
  PMI3: "Optimize and create value.",
};

const FIELD_OVERRIDES: Record<string, string> = {
  sde: "SDE",
  net_income: "Net income",
  owner_salary: "Owner salary",
  cim_generated: "CIM",
  buyer_list_generated: "Buyer list",
  investor_list_generated: "Investor list",
  pitch_deck_generated: "Pitch deck",
  dd_checklist_generated: "Diligence checklist",
  deal_structure_modeled: "Deal structure",
  term_sheet_analyzed: "Term sheet",
  financial_package_prepared: "Financial package",
  target_criteria_set: "Target criteria",
  target_valuation_range: "Target valuation",
  target_size_range: "Target size",
  target_industry: "Target industry",
  day_zero_checklist_complete: "Day-zero checklist",
  assessment_complete: "Assessment",
  valuation_range: "Valuation range",
  multiple_range: "Multiple range",
  capital_use: "Use of funds",
  raise_amount: "Raise amount",
  current_revenue: "Current revenue",
  acquisition_details: "Acquisition details",
  close_date: "Close date",
  financing_approach: "Financing approach",
};

function humanizeField(f: string): string {
  return FIELD_OVERRIDES[f] || f.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function journeyFromGate(gate: string): Journey {
  if (gate?.startsWith("PMI")) return "pmi";
  if (gate?.startsWith("S")) return "sell";
  if (gate?.startsWith("R")) return "raise";
  return "buy";
}

export function DealJourneyFlow({
  journeyType,
  currentGate,
  league,
  onAsk,
}: {
  journeyType?: string | null;
  currentGate?: string | null;
  league?: string | null;
  onAsk?: (prompt: string) => void;
}) {
  const gateId = currentGate || "S0";
  const journey: Journey = (["sell", "buy", "raise", "pmi"].includes(String(journeyType)) ? journeyType : journeyFromGate(gateId)) as Journey;
  const gates = getJourneyGates(journey);
  if (gates.length === 0) return null;

  const current = GATE_MAP[gateId] ?? gates[0];
  const currentIdx = current.index;
  const nextId = getNextGate(current.id);
  const next = nextId ? GATE_MAP[nextId] : null;
  const needs = current.requiredFields ?? [];

  return (
    <section className="wkcard" style={{ padding: "20px 22px 22px", marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ color: "var(--ink)", fontSize: "1.05rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          {JOURNEY_LABEL[journey]} · where this deal stands
        </div>
        <div style={{ color: "var(--ink-3)", fontSize: "0.82rem" }}>
          Step {currentIdx + 1} of {gates.length}{league ? ` · ${league}` : ""}
        </div>
      </div>

      {/* Stepper */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 0, overflowX: "auto", paddingBottom: 4 }}>
        {gates.map((g, i) => {
          const state = i < currentIdx ? "done" : i === currentIdx ? "current" : "upcoming";
          const dotBg = state === "done" ? "var(--accent-strong)" : state === "current" ? "var(--accent-strong)" : "var(--surface-2)";
          const dotBorder = state === "upcoming" ? "1px solid var(--line-2)" : "none";
          const dotColor = state === "upcoming" ? "var(--ink-3)" : "#fff";
          return (
            <div key={g.id} style={{ flex: 1, minWidth: 92, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, position: "relative" }}>
              {/* connector line to previous node */}
              {i > 0 && (
                <span style={{ position: "absolute", top: 13, right: "50%", width: "100%", height: 2, background: i <= currentIdx ? "var(--accent-strong)" : "var(--line)" }} />
              )}
              <span style={{
                position: "relative", zIndex: 1,
                width: 28, height: 28, borderRadius: "50%",
                background: dotBg, border: dotBorder, color: dotColor,
                display: "grid", placeItems: "center",
                fontSize: "0.78rem", fontWeight: 700, fontVariantNumeric: "tabular-nums",
                boxShadow: state === "current" ? "0 0 0 4px var(--accent-soft)" : "none",
              }}>
                {state === "done" ? "✓" : i + 1}
              </span>
              <span style={{
                fontSize: "0.78rem", lineHeight: 1.25, textAlign: "center",
                color: state === "current" ? "var(--ink)" : state === "done" ? "var(--ink-2)" : "var(--ink-3)",
                fontWeight: state === "current" ? 700 : 500,
                padding: "0 4px",
              }}>
                {g.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* You are here */}
      <div style={{ marginTop: 18, padding: "16px 18px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 12 }}>
        <div style={{ color: "var(--ink)", fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          You're in {current.name}
        </div>
        <p style={{ margin: "6px 0 0", color: "var(--ink-2)", fontSize: "0.88rem", lineHeight: 1.5 }}>
          {STAGE_BLURB[current.id] || "Work this stage with Yulia, then advance."}
        </p>

        {needs.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ color: "var(--ink-3)", fontSize: "0.78rem", marginBottom: 6 }}>To clear this stage:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {needs.map(f => (
                <span key={f} style={{ fontSize: "0.8rem", color: "var(--ink-2)", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 999, padding: "4px 11px" }}>
                  {humanizeField(f)}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          <button
            className="wkbtn primary"
            type="button"
            onClick={() => onAsk?.(`This deal is in the ${current.name} stage of a ${JOURNEY_LABEL[journey].toLowerCase()} process. Tell me exactly what's been done, what's still missing to advance${next ? ` to ${next.name}` : " to close"}, and the single next thing I should do.`)}
          >
            What's needed to advance?
          </button>
          {next && (
            <span style={{ color: "var(--ink-3)", fontSize: "0.84rem" }}>
              Up next: <strong style={{ color: "var(--ink-2)", fontWeight: 600 }}>{next.name}</strong>
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
