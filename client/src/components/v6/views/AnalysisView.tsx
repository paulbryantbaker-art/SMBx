import { useState, type CSSProperties, type ChangeEvent } from "react";
import type { OpenTab } from "../types";

type AccentKey = "primary" | "tertiary" | "pursue" | "watch" | "pass";

interface SliderProps {
  label: string;
  val: number;
  setVal: (v: number) => void;
  min: number;
  max: number;
  step: number;
  fmt: (v: number) => string;
}

function V6Slider({ label, val, setVal, min, max, step, fmt }: SliderProps) {
  const onChange = (e: ChangeEvent<HTMLInputElement>) => setVal(parseFloat(e.target.value));
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "var(--m-on-surface-var)", fontWeight: 500 }}>{label}</span>
        <span className="mono" style={{
          fontSize: 13, color: "var(--m-on-surface)", fontWeight: 700,
          letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums",
        }}>{fmt(val)}</span>
      </div>
      <input
        type="range" className="m-slider"
        min={min} max={max} step={step} value={val}
        onChange={onChange}
        aria-label={label}
        aria-valuetext={fmt(val)}
      />
    </div>
  );
}

const ACCENT_BG: Record<AccentKey, string> = {
  primary:  "var(--m-primary-container)",
  tertiary: "var(--m-tertiary-container)",
  pursue:   "var(--m-pursue-container)",
  watch:    "var(--m-watch-container)",
  pass:     "var(--m-pass-container)",
};
const ACCENT_FG: Record<AccentKey, string> = {
  primary:  "var(--m-on-primary-container)",
  tertiary: "var(--m-on-tertiary-container)",
  pursue:   "var(--m-pursue-on-cont)",
  watch:    "#3F2E00",
  pass:     "#4A1410",
};

function V6OutputCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: AccentKey }) {
  return (
    <div className="m-card" style={{
      padding: "16px 18px",
      background: ACCENT_BG[accent], color: ACCENT_FG[accent],
      border: "none",
    }}>
      <div className="mono" style={{ fontSize: 9.5, letterSpacing: "0.14em", fontWeight: 600, opacity: 0.7 }}>{label.toUpperCase()}</div>
      <div className="mono" style={{
        fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28,
        letterSpacing: "-0.025em", marginTop: 4, fontVariantNumeric: "tabular-nums",
      }}>{value}</div>
      <div style={{ fontSize: 11.5, marginTop: 4, opacity: 0.78 }}>{sub}</div>
    </div>
  );
}

interface FlowRowProps {
  label: string;
  val: number;
  sign: "+" | "−" | "=";
  big?: boolean;
  total?: boolean;
  accent?: AccentKey;
}

function V6FlowRow({ label, val, sign, big, total, accent }: FlowRowProps) {
  const totalColor = accent === "pursue" ? "var(--m-pursue)"
    : accent === "watch" ? "var(--m-watch)"
    : accent === "pass" ? "var(--m-pass)"
    : "var(--m-on-surface)";
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "baseline",
      padding: "6px 0",
      fontSize: total ? 14 : 12.5,
      fontWeight: total || big ? 700 : 500,
      color: total ? totalColor : "var(--m-on-surface-var)",
    }}>
      <span>{label}</span>
      <span className="mono" style={{
        fontSize: total ? 18 : 13.5,
        fontWeight: total ? 800 : 600,
        letterSpacing: "-0.01em",
        color: total ? totalColor : "var(--m-on-surface)",
        fontVariantNumeric: "tabular-nums",
      }}>
        <span style={{ color: "var(--m-on-surface-mid)", marginRight: 6 }}>{sign}</span>${val.toFixed(2)}M
      </span>
    </div>
  );
}

interface Scenario { l: string; m: number; s: number; d: number; i: number }

const SCENARIOS: Scenario[] = [
  { l: "Conservative", m: 6.5, s: 1.65, d: 25, i: 11.5 },
  { l: "Base case",    m: 7.0, s: 1.80, d: 20, i: 11.5 },
  { l: "Aggressive",   m: 7.5, s: 1.85, d: 15, i: 11.5 },
];

export function V6AnalysisView({
  title,
  tool,
  openTab,
  onTalkToYulia,
}: {
  title: string;
  tool?: string;
  openTab?: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
}) {
  const [multiple, setMultiple] = useState(7.0);
  const [sde, setSde] = useState(1.80);
  const [downPct, setDownPct] = useState(20);
  const [interest, setInterest] = useState(11.5);
  const [growth, setGrowth] = useState(4);
  const [actionNote, setActionNote] = useState<string | null>(null);

  const purchase = +(sde * multiple).toFixed(2);
  const down = +(purchase * downPct / 100).toFixed(2);
  const loan = +(purchase - down).toFixed(2);
  const monthlyRate = interest / 100 / 12;
  const months = 120;
  const monthlyDebt = +((loan * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)).toFixed(3);
  const annualDebt = +(monthlyDebt * 12).toFixed(2);
  const cashFlow = +(sde - annualDebt).toFixed(2);
  const dscr = +(sde / annualDebt).toFixed(2);

  const dscrAccent: AccentKey = dscr >= 1.25 ? "pursue" : dscr >= 1.15 ? "watch" : "pass";
  const flowAccent: AccentKey = cashFlow > 0.5 ? "pursue" : cashFlow > 0.2 ? "watch" : "pass";
  const dscrCommentary = dscr >= 1.25
    ? "comfortably above SBA's 1.25 threshold"
    : dscr >= 1.15
      ? "marginal; banks will push back"
      : "below bank-clear; this won't close as structured";
  const cashCommentary = cashFlow >= 0.6
    ? "Year-1 owner cash is healthy after debt service."
    : cashFlow > 0
      ? "Year-1 cash is tight after debt service — leave room for surprises."
      : "Year-1 cash goes negative after debt service; structure won't hold.";

  const applyScenario = (sc: Scenario) => {
    setMultiple(sc.m);
    setSde(sc.s);
    setDownPct(sc.d);
    setInterest(sc.i);
    setActionNote(`${sc.l} assumptions applied.`);
  };

  const resetScenario = () => {
    const base = SCENARIOS[1];
    setMultiple(base.m);
    setSde(base.s);
    setDownPct(base.d);
    setInterest(base.i);
    setGrowth(4);
    setActionNote("Scenario reset to base case.");
  };

  const scenarioPrompt = () =>
    `${title}: save this scenario. Multiple ${multiple.toFixed(1)}x, SDE $${sde.toFixed(2)}M, ${downPct}% down, ${interest.toFixed(2)}% interest, ${growth >= 0 ? "+" : ""}${growth.toFixed(1)}% year-1 growth. DSCR ${dscr.toFixed(2)}, free cash flow $${(cashFlow - 0.35).toFixed(2)}M.`;

  const saveScenario = () => {
    const docTitle = `${title} · scenario note`;
    openTab?.({
      kind: "doc",
      title: docTitle,
      id: `doc-scenario-${Date.now()}`,
    });
    onTalkToYulia?.(`${scenarioPrompt()} Draft this as a concise scenario note with facts, assumptions, risks, and user decision points.`);
    setActionNote("Scenario note opened and sent to Yulia for drafting.");
  };

  const addToDeal = () => {
    onTalkToYulia?.(`${scenarioPrompt()} Attach this analysis to the relevant deal workspace and tell me which deal file or data-room location it belongs in.`);
    setActionNote("Yulia has the scenario context and can attach it to the right deal.");
  };

  return (
    <div className="m-fade-up" style={{ maxWidth: 1180 }}>
      <section style={{ marginBottom: 24 }}>
        <div className="mono" style={A.eyebrow}>{tool === "tool-compare" ? "ANALYSIS · COMPARISON · YULIA CAN REFINE" : "ANALYSIS · LIVE · YULIA RECOMPUTES AS YOU MOVE"}</div>
        <div style={A.headerRow}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={A.h1}>{title}</h1>
            <div style={A.sub}>SBA 7(a) leverage scenario · 10-year amortization · 78% LTV</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="m-btn outlined" type="button" onClick={resetScenario}>Reset</button>
            <button className="m-btn outlined" type="button" onClick={saveScenario}>Save scenario</button>
            <button className="m-btn filled" type="button" onClick={addToDeal}>Add to deal</button>
          </div>
        </div>
        {actionNote && <div style={A.actionNote}>{actionNote}</div>}
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 24, alignItems: "flex-start" }}>
        <div className="m-card" style={{ padding: "20px 22px" }}>
          <div style={A.cardTitle}>Inputs</div>

          <V6Slider label="Multiple of SDE"           val={multiple} setVal={setMultiple} min={5}    max={9}  step={0.1}  fmt={v => `${v.toFixed(1)}×`} />
          <V6Slider label="SDE ($M)"                  val={sde}      setVal={setSde}      min={1.0}  max={3.0} step={0.05} fmt={v => `$${v.toFixed(2)}M`} />
          <V6Slider label="Down payment (%)"          val={downPct}  setVal={setDownPct}  min={10}   max={40} step={1}    fmt={v => `${v}%`} />
          <V6Slider label="Interest rate (%)"         val={interest} setVal={setInterest} min={8}    max={14} step={0.25} fmt={v => `${v.toFixed(2)}%`} />
          <V6Slider label="Year-1 growth assumption"  val={growth}   setVal={setGrowth}   min={-5}   max={15} step={0.5}  fmt={v => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`} />

          <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--m-outline-var)" }}>
            <div className="mono" style={A.scenariosEyebrow}>SCENARIOS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {SCENARIOS.map(sc => (
                <button key={sc.l} className="m-state" onClick={() => applyScenario(sc)} style={A.scenarioBtn}>
                  <span style={{ fontWeight: 600 }}>{sc.l}</span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--m-on-surface-mid)" }}>
                    {sc.m}× · ${sc.s}M · {sc.d}%
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
            <V6OutputCard
              label="Purchase price"
              value={`$${purchase.toFixed(2)}M`}
              sub={`${multiple.toFixed(1)}× × $${sde.toFixed(2)}M SDE`}
              accent="primary"
            />
            <V6OutputCard
              label="Cash to close"
              value={`$${down.toFixed(2)}M`}
              sub={`${downPct}% down · $${loan.toFixed(2)}M financed`}
              accent="tertiary"
            />
            <V6OutputCard
              label="DSCR"
              value={dscr.toFixed(2)}
              sub={dscr >= 1.25 ? "Bank-clear (≥1.25)" : dscr >= 1.15 ? "Marginal" : "Tight"}
              accent={dscrAccent}
            />
          </div>

          <div className="m-card" style={{ padding: "20px 24px", marginBottom: 20 }}>
            <div className="mono" style={A.cashFlowEyebrow}>CASH FLOW · YEAR 1</div>
            <V6FlowRow label="SDE (cash earnings)"     val={sde}          sign="+" big />
            <V6FlowRow label="Annual debt service"     val={annualDebt}   sign="−" />
            <V6FlowRow label="Working capital reserve" val={0.20}         sign="−" />
            <V6FlowRow label="Owner draw / cushion"    val={0.15}         sign="−" />
            <div style={{ borderTop: "1px solid var(--m-outline-var)", margin: "12px 0 8px" }} />
            <V6FlowRow
              label="Free cash flow"
              val={+(cashFlow - 0.35).toFixed(2)}
              sign="="
              total
              accent={flowAccent}
            />
          </div>

          <div className="m-card" style={A.yuliaRead}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={A.yuliaMark}>Y</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="mono" style={A.yuliaEyebrow}>YULIA&rsquo;S READ</div>
                <div style={{ fontSize: 13, lineHeight: 1.55, marginTop: 4 }}>
                  At <strong>{multiple.toFixed(1)}× × ${sde.toFixed(2)}M</strong>, you&rsquo;re paying <strong>${purchase.toFixed(2)}M</strong>. With {downPct}% down at {interest}%, DSCR lands at <strong>{dscr.toFixed(2)}</strong> &mdash; {dscrCommentary}. {cashCommentary}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const A: Record<string, CSSProperties> = {
  eyebrow: {
    fontSize: 10, color: "var(--m-on-surface-mid)",
    letterSpacing: "0.14em", fontWeight: 600, marginBottom: 6,
  },
  headerRow: {
    display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20,
  },
  h1: {
    fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 32,
    letterSpacing: "-0.025em", margin: 0, color: "var(--m-on-surface)",
    textWrap: "balance",
  },
  sub: { fontSize: 13.5, color: "var(--m-on-surface-var)", marginTop: 6 },
  cardTitle: {
    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
    letterSpacing: "-0.01em", color: "var(--m-on-surface)", marginBottom: 18,
  },
  scenariosEyebrow: {
    fontSize: 9.5, color: "var(--m-on-surface-mid)",
    letterSpacing: "0.14em", fontWeight: 600, marginBottom: 10,
  },
  scenarioBtn: {
    all: "unset",
    padding: "8px 12px", borderRadius: 8,
    fontSize: 12, color: "var(--m-on-surface-var)", cursor: "pointer",
    background: "var(--m-surface-2)",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  cashFlowEyebrow: {
    fontSize: 9.5, color: "var(--m-on-surface-mid)",
    letterSpacing: "0.14em", fontWeight: 600, marginBottom: 14,
  },
  yuliaRead: {
    padding: "20px 24px",
    background: "var(--m-primary-container)",
    color: "var(--m-on-primary-container)",
    border: "none",
  },
  yuliaMark: {
    width: 28, height: 28, borderRadius: 8,
    background: "var(--m-primary)", color: "#fff",
    display: "grid", placeItems: "center",
    fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 12,
    flexShrink: 0,
  },
  yuliaEyebrow: { fontSize: 9.5, letterSpacing: "0.14em", fontWeight: 600, opacity: 0.7 },
  actionNote: {
    marginTop: 12,
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(225, 242, 235, 0.9)",
    color: "#246B50",
    fontSize: 12.5,
    boxShadow: "var(--m-elev-1)",
  },
};
