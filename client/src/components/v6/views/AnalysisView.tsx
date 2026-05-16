import { useEffect, useState, type CSSProperties, type ChangeEvent } from "react";
import Markdown from "react-markdown";
import { authHeaders } from "../../../hooks/useAuth";
import {
  defaultScenarioName,
  formatAssumptionDisplay,
  isStructuredAnalysis,
  numericAssumptionValue,
  patchStructuredDataAssumptions,
  sliderConfigForAssumption,
  syncLinkedAssumptions,
  type AnalysisTone,
  type ScenarioSliderConfig,
  type StructuredAnalysisData,
  type StructuredAssumption,
  type StructuredChart,
  type StructuredMetric,
  type StructuredTable,
} from "../../../lib/analysisCanvasModel";
import { executeSurfaceAction, runActionAnalysis } from "../../../lib/v6ActionContracts";
import { getSurfaceActionContract, isSurfaceActionId, type SurfaceActionId } from "../../../lib/v6SurfaceActions";
import type { FileScope, OpenTab } from "../types";

type AccentKey = "primary" | "tertiary" | "pursue" | "watch" | "pass";

interface AnalysisVersionSummary {
  versionNumber: number;
  changeReason: string | null;
  createdAt: string;
  scenarioName: string | null;
  summary: string | null;
}

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
  markdown,
  comparisonData,
  analysisData,
  analysisRunId,
  deliverableId,
  status,
  versionNumber,
  resolvedMenuItemSlug,
  openTab,
  onTalkToYulia,
}: {
  title: string;
  tool?: string;
  markdown?: string;
  comparisonData?: Record<string, any>[];
  analysisData?: Record<string, any>;
  analysisRunId?: number | null;
  deliverableId?: number | null;
  status?: string;
  versionNumber?: number | null;
  resolvedMenuItemSlug?: string;
  openTab?: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
}) {
  const [multiple, setMultiple] = useState(7.0);
  const [sde, setSde] = useState(1.80);
  const [downPct, setDownPct] = useState(20);
  const [interest, setInterest] = useState(11.5);
  const [growth, setGrowth] = useState(4);
  const [actionNote, setActionNote] = useState<string | null>(null);
  const [snapshotData, setSnapshotData] = useState<Record<string, any> | null>(null);
  const [snapshotMarkdown, setSnapshotMarkdown] = useState<string | null>(null);
  const [snapshotStatus, setSnapshotStatus] = useState<string | null>(null);
  const [snapshotVersion, setSnapshotVersion] = useState<number | null>(null);
  const [snapshotType, setSnapshotType] = useState<string | null>(null);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);

  useEffect(() => {
    if (!analysisRunId || analysisData) {
      setSnapshotData(null);
      setSnapshotMarkdown(null);
      setSnapshotStatus(null);
      setSnapshotVersion(null);
      setSnapshotType(null);
      setSnapshotError(null);
      setSnapshotLoading(false);
      return;
    }

    let alive = true;
    setSnapshotLoading(true);
    setSnapshotError(null);
    fetch(`/api/analysis-runs/${analysisRunId}`, { headers: authHeaders() })
      .then(async res => {
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload.error || `HTTP ${res.status}`);
        return payload;
      })
      .then(payload => {
        if (!alive) return;
        setSnapshotData(payload.analysisData ?? null);
        setSnapshotMarkdown(payload.commentaryMarkdown ?? null);
        setSnapshotStatus(payload.analysisStatus ?? status ?? null);
        setSnapshotVersion(payload.versionNumber ?? null);
        setSnapshotType(payload.analysisType ?? null);
      })
      .catch((err: any) => {
        if (!alive) return;
        setSnapshotError(err?.message || "Could not load saved analysis.");
        setSnapshotData(null);
      })
      .finally(() => {
        if (alive) setSnapshotLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [analysisRunId, analysisData, status]);

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

  const draftScenarioNote = () => {
    const docTitle = `${title} · scenario note`;
    openTab?.({
      kind: "doc",
      title: docTitle,
      id: `doc-scenario-${Date.now()}`,
    });
    onTalkToYulia?.(`${scenarioPrompt()} Draft this as a concise scenario note with facts, assumptions, risks, and user decision points.`);
    setActionNote("Scenario note opened and sent to Yulia for drafting.");
  };

  const askYuliaToFile = () => {
    onTalkToYulia?.(`${scenarioPrompt()} Attach this analysis to the relevant deal workspace and tell me which deal file or data-room location it belongs in.`);
    setActionNote("Yulia has the scenario context and can attach it to the right deal.");
  };

  const optimizeFallbackScenario = () => {
    onTalkToYulia?.(`${scenarioPrompt()} Use optimize_scenario if this canvas is linked to a live analysis run; otherwise optimize from these visible assumptions and tell me the best path, negotiation asks, fallback positions, reps and warranties, diligence requests, professional signoffs, and work products to create next.`);
    setActionNote("Yulia has the scenario context and will optimize the path from the visible assumptions.");
  };

  const effectiveAnalysisData = analysisData ?? snapshotData ?? undefined;
  const effectiveMarkdown = markdown ?? snapshotMarkdown ?? undefined;
  const effectiveStatus = status ?? snapshotStatus ?? undefined;
  const effectiveVersion = versionNumber ?? snapshotVersion ?? undefined;
  const effectiveTool = tool ?? snapshotType ?? undefined;
  const needsRealCanvas = shouldUseRealAnalysisCanvas({
    title,
    tool: effectiveTool,
    analysisRunId,
    analysisData: effectiveAnalysisData,
  });

  if (snapshotLoading && analysisRunId && !analysisData) {
    return (
      <AnalysisRunState
        title={title}
        eyebrow="ANALYSIS · LOADING RUN"
        body="Yulia is reopening the saved analysis run and its evidence trail. This view will not show sample numbers while the real canvas loads."
      />
    );
  }

  if (snapshotError && analysisRunId && !analysisData) {
    return (
      <AnalysisRunState
        title={title}
        eyebrow="ANALYSIS · RUN UNAVAILABLE"
        body={snapshotError}
        actionLabel="Ask Yulia to rerun it"
        onAction={() => onTalkToYulia?.(`Rerun ${title} as a real interactive analysis canvas from the current deal data, market intelligence, evidence, and methodology guardrails.`)}
      />
    );
  }

  if (isStructuredAnalysis(effectiveAnalysisData)) {
    return (
      <StructuredAnalysisCanvas
        fallbackTitle={title}
        data={effectiveAnalysisData}
        analysisRunId={analysisRunId}
        deliverableId={deliverableId}
        status={effectiveStatus}
        versionNumber={effectiveVersion}
        resolvedMenuItemSlug={resolvedMenuItemSlug}
        openTab={openTab}
        onTalkToYulia={onTalkToYulia}
      />
    );
  }

  if (effectiveTool === "tool-compare") {
    return (
      <ComparisonCanvas
        title={title}
        markdown={effectiveMarkdown}
        comparisonData={comparisonData ?? []}
        onTalkToYulia={onTalkToYulia}
      />
    );
  }

  if (needsRealCanvas) {
    return (
      <AnalysisRunState
        title={title}
        eyebrow="ANALYSIS · NEEDS REAL MODEL"
        body="This tab was opened with an analysis intent but no model payload. Yulia should run the specific analysis before the canvas shows numbers, sliders, scenarios, or conclusions."
        actionLabel="Run this analysis"
        onAction={() => onTalkToYulia?.(`Run ${title} as a real interactive analysis canvas. Use the active deal data, market intelligence, evidence trail, methodology, tax/legal guardrails, and model-specific assumptions. Do not answer only in chat; open the canvas with sliders and saved-scenario support.`)}
      />
    );
  }

  return (
    <div className="m-fade-up" style={{ maxWidth: 1380 }}>
      <section style={{ marginBottom: 24 }}>
        <div className="mono" style={A.eyebrow}>{effectiveTool === "tool-compare" ? "ANALYSIS · COMPARISON · YULIA CAN REFINE" : "ANALYSIS · LIVE · YULIA RECOMPUTES AS YOU MOVE"}</div>
        <div style={A.headerRow}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={A.h1}>{title}</h1>
            <div style={A.sub}>
              {analysisRunId ? `Saved analysis #${analysisRunId}` : "Live analysis"}
              {effectiveStatus ? ` · ${effectiveStatus}` : ""}
              {deliverableId ? ` · deliverable #${deliverableId}` : ""}
              {resolvedMenuItemSlug ? ` · ${resolvedMenuItemSlug}` : ""}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="m-btn outlined" type="button" onClick={resetScenario}>Reset</button>
            <button className="m-btn outlined" type="button" onClick={draftScenarioNote}>Draft note</button>
            <button className="m-btn outlined" type="button" onClick={optimizeFallbackScenario}>Optimize</button>
            <button className="m-btn filled" type="button" onClick={askYuliaToFile}>Ask Yulia to file</button>
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

function StructuredAnalysisCanvas({
  fallbackTitle,
  data,
  analysisRunId,
  deliverableId,
  status,
  versionNumber,
  resolvedMenuItemSlug,
  openTab,
  onTalkToYulia,
}: {
  fallbackTitle: string;
  data: StructuredAnalysisData;
  analysisRunId?: number | null;
  deliverableId?: number | null;
  status?: string;
  versionNumber?: number | null;
  resolvedMenuItemSlug?: string;
  openTab?: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
}) {
  const [canvasData, setCanvasData] = useState(data);
  const [currentVersion, setCurrentVersion] = useState<number | null>(versionNumber ?? null);
  const [versions, setVersions] = useState<AnalysisVersionSummary[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [saveNote, setSaveNote] = useState<string | null>(null);
  useEffect(() => setCanvasData(data), [data]);
  useEffect(() => setCurrentVersion(versionNumber ?? null), [versionNumber]);

  const refreshVersions = async () => {
    if (!analysisRunId) {
      setVersions([]);
      return;
    }
    setVersionsLoading(true);
    try {
      const res = await fetch(`/api/analysis-runs/${analysisRunId}/versions`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();
      setVersions(Array.isArray(payload.versions) ? payload.versions : []);
    } catch {
      setVersions([]);
    } finally {
      setVersionsLoading(false);
    }
  };

  useEffect(() => {
    void refreshVersions();
  }, [analysisRunId]);

  const updateAssumptions = async (updates: Record<string, unknown>, scenarioName?: string) => {
    const nextData = patchStructuredDataAssumptions(canvasData, updates);
    const modelUpdates = scenarioName ? { ...updates, _scenario_name: scenarioName } : updates;
    setCanvasData(nextData);
    window.dispatchEvent(new CustomEvent("smbx:canvas_action", {
      detail: {
        canvas_action: "update_model",
        tabId: "active",
        updates: modelUpdates,
        analysisRunId: analysisRunId ?? null,
        analysisData: nextData,
      },
    }));

    if (!analysisRunId) {
      setSaveNote("Scenario updated on this canvas. Save is unavailable until this analysis is linked to a run.");
      return;
    }

    try {
      const res = await fetch(`/api/analysis-runs/${analysisRunId}/assumptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ updates, scenarioName, changeReason: scenarioName ? `Saved scenario: ${scenarioName}` : "Canvas scenario edit" }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();
      const savedData = payload.analysisData ?? nextData;
      setCanvasData(savedData);
      setCurrentVersion(payload.versionNumber ?? currentVersion ?? null);
      if (Array.isArray(payload.versions)) setVersions(payload.versions);
      setSaveNote(payload.versionNumber ? `Saved scenario v${payload.versionNumber}. Yulia can reference this version in chat.` : "Scenario saved. Yulia can reference this version in chat.");
      window.dispatchEvent(new CustomEvent("smbx:canvas_action", {
        detail: {
          canvas_action: "update_model",
          tabId: "active",
          updates: modelUpdates,
          analysisRunId,
          analysisData: savedData,
          versionNumber: payload.versionNumber ?? null,
        },
      }));
    } catch {
      setSaveNote("Scenario updated locally. Sign in or reconnect to save this version.");
    }
  };

  const restoreVersion = async (targetVersion: number) => {
    if (!analysisRunId) return;
    setSaveNote(`Restoring v${targetVersion}...`);
    try {
      const res = await fetch(`/api/analysis-runs/${analysisRunId}/versions/${targetVersion}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();
      if (payload.analysisData) setCanvasData(payload.analysisData);
      setCurrentVersion(payload.versionNumber ?? null);
      if (Array.isArray(payload.versions)) setVersions(payload.versions);
      setSaveNote(`Restored v${targetVersion} as v${payload.versionNumber ?? "latest"}. Yulia can compare it against the prior scenario.`);
      window.dispatchEvent(new CustomEvent("smbx:canvas_action", {
        detail: {
          canvas_action: "update_model",
          tabId: "active",
          analysisRunId,
          analysisData: payload.analysisData ?? canvasData,
          versionNumber: payload.versionNumber ?? null,
        },
      }));
    } catch {
      setSaveNote("Could not restore that version. Ask Yulia to reopen the saved analysis run or reconnect.");
    }
  };

  const dataView = canvasData;
  const metrics = dataView.metrics ?? [];
  const charts = dataView.charts ?? [];
  const tables = dataView.tables ?? [];
  const risks = dataView.risks ?? [];
  const missingData = dataView.missingData ?? [];
  const professionalTriggers = dataView.professionalTriggers ?? [];
  const evidenceRefs = dataView.evidenceRefs ?? [];
  const nextActions = dataView.nextActions ?? [];
  const primaryPrompt = nextActions[0]?.prompt || `Explain ${dataView.title || fallbackTitle} and tell me what decision this supports.`;
  const analysisDealId = dataView.calculations?.dealId;
  const linkedDealId = typeof analysisDealId === "number" || typeof analysisDealId === "string" ? analysisDealId : null;
  const analysisDealTitle = typeof dataView.calculations?.dealName === "string"
    ? dataView.calculations.dealName
    : (dataView.title || fallbackTitle).split(" · ")[0];

  const openScenarioNote = () => {
    const docTitle = `${dataView.title || fallbackTitle} · Yulia read`;
    openTab?.({ kind: "doc", title: docTitle, id: `doc-analysis-note-${Date.now()}` });
    onTalkToYulia?.(`Turn this analysis into a concise work product note: ${dataView.yuliaRead || dataView.summary}`);
  };

  const openDealFiles = (scope: FileScope) => {
    if (linkedDealId == null) {
      onTalkToYulia?.(`Open the ${scope === "all" ? "" : `${scope} `}files that support ${dataView.title || fallbackTitle}.`);
      setSaveNote("Yulia has the request, but this analysis is not linked to a saved deal id yet.");
      return;
    }
    openTab?.({
      kind: "deal",
      id: String(linkedDealId),
      title: analysisDealTitle,
      fileScope: scope,
    });
  };

  const openScenarioControls = () => {
    document.getElementById("analysis-scenario-controls")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setSaveNote("Use the scenario sliders below to model changes. Saved versions are attached to this analysis run for Yulia to reference.");
  };

  const openReviewPackage = (prompt: string) => {
    const docTitle = `${dataView.title || fallbackTitle} · review package`;
    openTab?.({ kind: "doc", title: docTitle, id: `doc-review-package-${Date.now()}` });
    onTalkToYulia?.(`${prompt} Draft this as a review package with evidence, open questions, and user decision points. Do not present legal or tax sign-off as final.`);
    setSaveNote("Review package opened. Yulia has the analysis context and sign-off guardrails.");
  };

  const openTargetDeal = (action: NonNullable<StructuredAnalysisData["nextActions"]>[number], scope?: FileScope) => {
    const targetDealId = action.targetDealId ?? linkedDealId;
    if (targetDealId == null) {
      onTalkToYulia?.(action.prompt);
      setSaveNote("Yulia has the request, but this action needs a linked deal before it can open a deal surface.");
      return;
    }
    openTab?.({
      kind: "deal",
      id: String(targetDealId),
      title: action.targetDealTitle || analysisDealTitle,
      fileScope: scope,
    });
  };

  const runContractAnalysis = async (
    action: NonNullable<StructuredAnalysisData["nextActions"]>[number],
    analysisType: string,
    label: string,
  ) => {
    const targetDealId = action.targetDealId ?? linkedDealId;
    if (targetDealId == null) {
      onTalkToYulia?.(action.prompt);
      setSaveNote("Yulia has the request, but this analysis needs a linked deal id before it can run.");
      return;
    }
    setSaveNote(`${label} is running as a live analysis canvas...`);
    try {
      await runActionAnalysis({
        deal: { id: targetDealId, name: action.targetDealTitle || analysisDealTitle },
        analysisType,
        label,
        openTab: openTab ?? (() => undefined),
        requestedFrom: "analysis_next_action",
        onNote: setSaveNote,
      });
    } catch (error: any) {
      onTalkToYulia?.(`${action.prompt} I tried to run this from the canvas, but it needs Yulia to coordinate it: ${error?.message || "analysis failed"}`);
      setSaveNote("Yulia has the request. The direct analysis action could not complete from this canvas.");
    }
  };

  const runSurfaceAction = async (
    action: NonNullable<StructuredAnalysisData["nextActions"]>[number],
    surfaceActionId: SurfaceActionId,
  ) => {
    if (surfaceActionId === "update_model_assumption") {
      openScenarioControls();
      return;
    }
    const contract = getSurfaceActionContract(surfaceActionId);
    const targetDealId = action.targetDealId ?? linkedDealId;
    setSaveNote(`${contract.label} is opening from this analysis...`);
    try {
      await executeSurfaceAction({
        actionId: surfaceActionId,
        deal: targetDealId != null ? { id: targetDealId, name: action.targetDealTitle || analysisDealTitle } : null,
        document: { title: action.label },
        fileScope: action.fileScope,
        title: action.label,
        prompt: action.prompt,
        openTab: openTab ?? (() => undefined),
        requestedFrom: "analysis_next_action",
        onNote: setSaveNote,
        onTalkToYulia,
      });
    } catch (error: any) {
      onTalkToYulia?.(`${action.prompt} I tried to run this from the analysis canvas, but Yulia needs to coordinate it: ${error?.message || "action failed"}`);
      setSaveNote("Yulia has the request. The direct action could not complete from this canvas.");
    }
  };

  const runNextAction = async (action: NonNullable<StructuredAnalysisData["nextActions"]>[number]) => {
    if (isSurfaceActionId(action.surfaceActionId)) {
      await runSurfaceAction(action, action.surfaceActionId);
      return;
    }

    const labelText = `${action.label} ${action.prompt}`.toLowerCase();
    if (action.actionType === "run_analysis") {
      await runContractAnalysis(action, action.analysisType || "red_flags", action.label);
      return;
    }
    if (action.actionType === "open_files") {
      const scope: FileScope = action.fileScope
        || (/data[-\s]?room/.test(labelText)
          ? "data-room"
          : /action|review|signature|sign-off|signoff|sent|received|deferred|executed|shared/.test(labelText)
            ? "shared"
            : "all");
      openTargetDeal(action, scope);
      return;
    }
    if (action.actionType === "update_model") {
      openScenarioControls();
      return;
    }
    if (action.actionType === "request_review") {
      openReviewPackage(action.prompt);
      return;
    }
    if (action.actionType === "request_evidence") {
      const docTitle = `${analysisDealTitle} · evidence request`;
      openTab?.({ kind: "doc", title: docTitle, id: `doc-evidence-request-${Date.now()}` });
      onTalkToYulia?.(`${action.prompt} Turn it into a concise request list with owner, purpose, and data-room destination.`);
      setSaveNote("Evidence request opened from the analysis.");
      return;
    }
    if (action.actionType === "open_deal") {
      openTargetDeal(action);
      return;
    }
    onTalkToYulia?.(action.prompt);
  };

  return (
    <div className="m-fade-up" style={{ maxWidth: 1380 }}>
      <section style={{ marginBottom: 24 }}>
        <div className="mono" style={A.eyebrow}>ANALYSIS · STRUCTURED · EVIDENCE LED</div>
        <div style={A.headerRow}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={A.h1}>{dataView.title || fallbackTitle}</h1>
            <div style={A.sub}>
              {analysisRunId ? `Saved analysis #${analysisRunId}` : "Live deterministic model"}
              {currentVersion ? ` · v${currentVersion}` : ""}
              {status ? ` · ${status}` : ""}
              {deliverableId ? ` · deliverable #${deliverableId}` : ""}
              {resolvedMenuItemSlug ? ` · ${resolvedMenuItemSlug}` : ""}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="m-btn outlined" type="button" onClick={openScenarioNote}>Draft note</button>
            <button className="m-btn filled" type="button" onClick={() => onTalkToYulia?.(primaryPrompt)}>Ask Yulia</button>
          </div>
        </div>
      </section>

      <div className="m-card" style={A.structuredHero}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <div style={{ ...A.verdictBadge, background: toneBg(dataView.verdict?.tone), color: toneFg(dataView.verdict?.tone) }}>
            {dataView.verdict?.score ?? "Y"}
          </div>
          <div>
            <div className="mono" style={A.cardEyebrow}>{dataView.verdict?.label || "YULIA READ"}</div>
            <div style={{ fontSize: 15, color: "var(--m-on-surface)", lineHeight: 1.45, fontWeight: 700 }}>
              {dataView.summary}
            </div>
          </div>
        </div>
        {dataView.verdict?.rationale && <p style={A.structuredCopy}>{dataView.verdict.rationale}</p>}
        {dataView.yuliaRead && <p style={A.structuredCopy}>{dataView.yuliaRead}</p>}
      </div>

      {metrics.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, marginBottom: 22 }}>
          {metrics.slice(0, 8).map(metric => (
            <div key={metric.key} className="m-card" style={{ ...A.metricCard, borderColor: toneBorder(metric.tone) }}>
              <div className="mono" style={A.cardEyebrow}>{metric.label}</div>
              <div style={A.metricValue}>{metric.displayValue}</div>
              {metric.sub && <div style={A.metricSub}>{metric.sub}</div>}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.15fr) minmax(320px, 0.85fr)", gap: 22, alignItems: "start" }}>
        <div style={{ display: "grid", gap: 18 }}>
          {charts.map(chart => (
            <StructuredChartView key={chart.title} chart={chart} />
          ))}
          {tables.map(table => (
            <StructuredTableView key={table.title} table={table} />
          ))}
        </div>

        <div style={{ display: "grid", gap: 18 }}>
          <StructuredListCard
            eyebrow="YULIA EVIDENCE"
            title="Evidence Yulia used"
            empty="No evidence references were attached to this analysis yet."
            items={evidenceRefs.map(item => ({
              key: `${item.type}-${item.label}`,
              label: item.label,
              sub: [
                item.value,
                item.source,
                item.detail,
              ].filter(Boolean).join(" · "),
              badge: item.confidence || item.type.replace("_", " "),
              tone: confidenceTone(item.confidence),
            }))}
          />
          <StructuredListCard
            eyebrow="SOURCE GAPS"
            title="Missing data"
            empty="No critical missing data surfaced from the current facts."
            items={missingData.map(item => ({
              key: item.label,
              label: item.label,
              sub: item.why,
              badge: item.priority,
              tone: priorityTone(item.priority),
            }))}
          />
          <StructuredListCard
            eyebrow="RISK REGISTER"
            title="Risks to clear"
            empty="No material risk flags surfaced from the current facts."
            items={risks.map(item => ({
              key: item.label,
              label: item.label,
              sub: item.detail,
              badge: item.severity,
              tone: priorityTone(item.severity),
            }))}
          />
          <StructuredListCard
            eyebrow="GOVERNANCE"
            title="Professional review"
            empty="No professional-review trigger is active yet."
            items={professionalTriggers.map(item => ({
              key: `${item.role}-${item.trigger}`,
              label: item.role,
              sub: `${item.trigger} ${item.why}`,
              badge: "review",
              tone: "watch",
            }))}
          />
          <div className="m-card" style={{ padding: "20px 22px" }}>
            <div className="mono" style={A.cardEyebrow}>YULIA NEXT</div>
            <div style={A.sideTitle}>Actions from the read</div>
            <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                {nextActions.map(action => (
                  <button
                    key={`${action.actionType}-${action.label}`}
                    className="m-state"
                    type="button"
                    style={A.actionRow}
                    onClick={() => { void runNextAction(action); }}
                  >
                  <span>{action.label}</span>
                  <span style={{ color: "var(--m-primary)", fontWeight: 800 }}>→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {saveNote && <div style={A.actionNote}>{saveNote}</div>}

      {(dataView.inputs?.length || dataView.assumptions?.length || dataView.methodologyRefs?.length) && (
          <div id="analysis-scenario-controls" className="m-card" style={A.methodologyCard}>
          <div className="mono" style={A.cardEyebrow}>METHOD · INPUTS · GOVERNANCE</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginTop: 10 }}>
            <MiniFactList title="Inputs" rows={(dataView.inputs ?? []).map(input => [input.label, input.displayValue])} />
            <ScenarioAssumptionPanel
              assumptions={dataView.assumptions ?? []}
              analysisTitle={dataView.title || fallbackTitle}
              onSave={updateAssumptions}
              onTalkToYulia={onTalkToYulia}
            />
            <MiniFactList title="Methodology refs" rows={(dataView.methodologyRefs ?? []).map(ref => ["Ref", ref])} />
          </div>
          {analysisRunId && (
            <VersionHistoryPanel
              versions={versions}
              currentVersion={currentVersion}
              loading={versionsLoading}
              onRestore={restoreVersion}
              onAskYulia={(version) => onTalkToYulia?.(
                `Use the open ${dataView.title || fallbackTitle} canvas and explain saved scenario v${version.versionNumber}${version.scenarioName ? ` (${version.scenarioName})` : ""}. Compare it against the current version and tell me what decision it supports.`,
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}

function StructuredChartView({ chart }: { chart: StructuredChart }) {
  const values = chart.data.map(point => Number(point.value ?? 0)).filter(Number.isFinite);
  const max = Math.max(1, ...values);

  return (
    <div className="m-card" style={{ padding: "22px 24px" }}>
      <div className="mono" style={A.cardEyebrow}>{chart.type.toUpperCase()}</div>
      <div style={A.sideTitle}>{chart.title}</div>
      <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
        {chart.data.map(point => {
          const value = Number(point.value ?? 0);
          const width = `${Math.max(4, Math.min(100, (value / max) * 100))}%`;
          const label = String(point.label ?? "Item");
          const tone = typeof point.tone === "string" ? point.tone as AnalysisTone : "neutral";
          return (
            <div key={`${chart.title}-${label}`}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12.5, marginBottom: 5 }}>
                <span style={{ color: "var(--m-on-surface-var)", fontWeight: 700 }}>{label}</span>
                <span className="mono" style={{ color: "var(--m-on-surface)", fontWeight: 800 }}>{String(point.displayValue ?? value)}</span>
              </div>
              <div style={A.barTrack}>
                <div style={{ ...A.barFill, width, background: toneAccent(tone) }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StructuredTableView({ table }: { table: StructuredTable }) {
  return (
    <div className="m-card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "18px 22px 10px" }}>
        <div className="mono" style={A.cardEyebrow}>TABLE</div>
        <div style={A.sideTitle}>{table.title}</div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={A.dataTable}>
          <thead>
            <tr>
              {table.columns.map(col => <th key={col} style={A.th}>{col}</th>)}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, i) => (
              <tr key={`${table.title}-${i}`}>
                {row.map((cell, j) => <td key={`${table.title}-${i}-${j}`} style={A.td}>{cell ?? "—"}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StructuredListCard({
  eyebrow,
  title,
  empty,
  items,
}: {
  eyebrow: string;
  title: string;
  empty: string;
  items: Array<{ key: string; label: string; sub: string; badge: string; tone: AnalysisTone }>;
}) {
  return (
    <div className="m-card" style={{ padding: "20px 22px" }}>
      <div className="mono" style={A.cardEyebrow}>{eyebrow}</div>
      <div style={A.sideTitle}>{title}</div>
      {items.length ? (
        <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
          {items.map(item => (
            <div key={item.key} style={A.listRow}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, color: "var(--m-on-surface)", fontWeight: 800 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: "var(--m-on-surface-var)", lineHeight: 1.45, marginTop: 3 }}>{item.sub}</div>
              </div>
              <span style={{ ...A.smallBadge, color: toneFg(item.tone), background: toneBg(item.tone) }}>{item.badge}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 12.5, color: "var(--m-on-surface-var)", marginTop: 10 }}>{empty}</div>
      )}
    </div>
  );
}

function ScenarioAssumptionPanel({
  assumptions,
  analysisTitle,
  onSave,
  onTalkToYulia,
}: {
  assumptions: StructuredAssumption[];
  analysisTitle: string;
  onSave: (updates: Record<string, unknown>, scenarioName?: string) => void | Promise<void>;
  onTalkToYulia?: (prompt: string) => void;
}) {
  const [drafts, setDrafts] = useState<Record<string, number>>({});
  const [scenarioName, setScenarioName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDrafts(Object.fromEntries(
      assumptions
        .map(item => [item.key, numericAssumptionValue(item)] as const)
        .filter((entry): entry is readonly [string, number] => entry[1] != null),
    ));
  }, [assumptions]);

  const sliderRows = assumptions
    .map(item => {
      const config = sliderConfigForAssumption(item);
      const original = numericAssumptionValue(item);
      if (!config || original == null) return null;
      return { item, config, original };
    })
    .filter((item): item is { item: StructuredAssumption; config: ScenarioSliderConfig; original: number } => item != null);

  const readOnlyRows = assumptions.filter(item => !sliderConfigForAssumption(item)).slice(0, 5);
  const changedRows = sliderRows.filter(({ item, original }) => Math.abs((drafts[item.key] ?? original) - original) > 0.000001);
  const scenarioLabel = scenarioName.trim() || defaultScenarioName(analysisTitle);

  const saveScenario = async () => {
    if (!changedRows.length) return;
    const updates = Object.fromEntries(changedRows.map(({ item, original }) => [item.key, drafts[item.key] ?? original]));
    setSaving(true);
    try {
      await onSave(updates, scenarioLabel);
    } finally {
      setSaving(false);
    }
  };

  const discussScenario = () => {
    const changedText = changedRows.length
      ? changedRows.map(({ item, original }) => {
        const nextValue = drafts[item.key] ?? original;
        return `${item.label}: ${formatAssumptionDisplay(item.key, original)} to ${formatAssumptionDisplay(item.key, nextValue)}`;
      }).join("; ")
      : "no changed assumptions yet";
    onTalkToYulia?.(`Use the open ${analysisTitle} canvas and discuss scenario "${scenarioLabel}". Changed assumptions: ${changedText}. Tell me what moved, what risk changed, and what decision this supports.`);
  };

  const optimizeScenario = () => {
    const changedText = changedRows.length
      ? changedRows.map(({ item, original }) => {
        const nextValue = drafts[item.key] ?? original;
        return `${item.label}: ${formatAssumptionDisplay(item.key, original)} to ${formatAssumptionDisplay(item.key, nextValue)}`;
      }).join("; ")
      : "use the current saved/base assumptions";
    onTalkToYulia?.(`Use optimize_scenario with tabId "active" for the open ${analysisTitle} canvas and optimize scenario "${scenarioLabel}" for my role in this transaction. Infer whether I am buying, selling, raising, divesting, or advising from the deal context; if that is ambiguous, ask one clarifying question before recommending. Read the active model, saved scenarios, evidence, market context, tax/legal constraints, financing constraints, and risk appetite. Changed assumptions: ${changedText}. Pick the best risk-adjusted scenario, explain why, and show the path to get there through negotiation asks, fallback positions, reps and warranties, diligence requests, professional signoffs, and concrete work products Yulia should create or update.`);
  };

  return (
    <div>
      <div style={A.scenarioHeader}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 900, color: "var(--m-on-surface)" }}>Scenario sliders</div>
          <div style={{ fontSize: 11.5, color: "var(--m-on-surface-var)", marginTop: 2 }}>Save a version, then ask Yulia about it.</div>
        </div>
        <span className="mono" style={A.scenarioCount}>{changedRows.length} changed</span>
      </div>

      <label style={A.scenarioNameRow}>
        <span className="mono" style={A.cardEyebrow}>SCENARIO NAME</span>
        <input
          style={A.assumptionInput}
          value={scenarioName}
          placeholder={defaultScenarioName(analysisTitle)}
          onChange={event => setScenarioName(event.target.value)}
        />
      </label>

      <div style={{ display: "grid", gap: 12 }}>
        {sliderRows.slice(0, 8).map(({ item, config, original }) => {
          const value = drafts[item.key] ?? original;
          return (
            <div key={item.key} style={A.sliderScenarioRow}>
              <div style={A.sliderScenarioTop}>
                <span style={A.assumptionLabel}>{item.label}</span>
                <span className="mono" style={A.sliderScenarioValue}>{formatAssumptionDisplay(item.key, value)}</span>
              </div>
              <input
                type="range"
                className="m-slider"
                min={config.min}
                max={config.max}
                step={config.step}
                value={value}
                onChange={event => setDrafts(prev => syncLinkedAssumptions(prev, item.key, Number(event.target.value)))}
                aria-label={item.label}
                aria-valuetext={formatAssumptionDisplay(item.key, value)}
              />
              <div style={A.sliderScenarioBounds}>
                <span>{formatAssumptionDisplay(item.key, config.min)}</span>
                <span>base {formatAssumptionDisplay(item.key, original)}</span>
                <span>{formatAssumptionDisplay(item.key, config.max)}</span>
              </div>
            </div>
          );
        })}
        {readOnlyRows.length > 0 && (
          <div style={A.scenarioReadOnly}>
            {readOnlyRows.map(item => (
              <div key={item.key} style={A.scenarioReadOnlyRow}>
                <span>{item.label}</span>
                <strong>{item.displayValue}</strong>
              </div>
            ))}
          </div>
        )}
        <div style={A.scenarioActions}>
          <button
            className="m-btn filled"
            type="button"
            style={A.scenarioSave}
            disabled={!changedRows.length || saving}
            onClick={() => { void saveScenario(); }}
          >
            {saving ? "Saving" : "Save scenario"}
          </button>
          <button
            className="m-btn outlined"
            type="button"
            style={A.scenarioSave}
            onClick={optimizeScenario}
          >
            Optimize
          </button>
          <button
            className="m-btn outlined"
            type="button"
            style={A.scenarioSave}
            onClick={discussScenario}
          >
            Ask Yulia
          </button>
        </div>
      </div>
    </div>
  );
}

function VersionHistoryPanel({
  versions,
  currentVersion,
  loading,
  onRestore,
  onAskYulia,
}: {
  versions: AnalysisVersionSummary[];
  currentVersion: number | null;
  loading: boolean;
  onRestore: (versionNumber: number) => void | Promise<void>;
  onAskYulia: (version: AnalysisVersionSummary) => void;
}) {
  const rows = versions.slice(0, 8);
  return (
    <div style={A.versionPanel}>
      <div style={A.scenarioHeader}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 900, color: "var(--m-on-surface)" }}>Saved scenarios</div>
          <div style={{ fontSize: 11.5, color: "var(--m-on-surface-var)", marginTop: 2 }}>
            Yulia can reference, compare, or restore any saved version.
          </div>
        </div>
        <span className="mono" style={A.scenarioCount}>{currentVersion ? `v${currentVersion}` : "live"}</span>
      </div>
      {loading ? (
        <div style={A.versionEmpty}>Loading version history...</div>
      ) : rows.length ? (
        <div style={A.versionRows}>
          {rows.map(version => {
            const active = currentVersion === version.versionNumber;
            return (
              <div key={version.versionNumber} style={A.versionRow}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={A.versionTitle}>
                    v{version.versionNumber}
                    {version.scenarioName ? ` · ${version.scenarioName}` : ""}
                    {active ? " · current" : ""}
                  </div>
                  <div style={A.versionMeta}>
                    {version.changeReason || "Saved analysis version"} · {formatVersionDate(version.createdAt)}
                  </div>
                  {version.summary && <div style={A.versionSummary}>{version.summary}</div>}
                </div>
                <div style={A.versionActions}>
                  <button className="m-btn outlined" type="button" style={A.versionButton} onClick={() => onAskYulia(version)}>
                    Ask
                  </button>
                  <button
                    className="m-btn outlined"
                    type="button"
                    style={A.versionButton}
                    disabled={active}
                    onClick={() => { void onRestore(version.versionNumber); }}
                  >
                    Restore
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={A.versionEmpty}>Save a scenario to start the version trail.</div>
      )}
    </div>
  );
}

function formatVersionDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function MiniFactList({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--m-on-surface)", marginBottom: 8 }}>{title}</div>
      <div style={{ display: "grid", gap: 8 }}>
        {rows.slice(0, 7).map(([label, value], index) => (
          <div key={`${title}-${label}-${index}`} style={{ fontSize: 12, color: "var(--m-on-surface-var)", lineHeight: 1.4 }}>
            <strong style={{ color: "var(--m-on-surface)" }}>{label}:</strong> {value}
          </div>
        ))}
      </div>
    </div>
  );
}

function shouldUseRealAnalysisCanvas({
  title,
  tool,
  analysisRunId,
  analysisData,
}: {
  title: string;
  tool?: string | null;
  analysisRunId?: number | null;
  analysisData?: Record<string, any> | null;
}): boolean {
  if (isStructuredAnalysis(analysisData)) return false;
  if (analysisRunId) return true;

  const text = `${tool || ""} ${title || ""}`.toLowerCase();
  if (!text.trim()) return false;

  const legacyScenarioOnly = /\bsba\b|\bfinanc(?:e|ing)\b|\bcapital structure\b|\bscenario\b/.test(text)
    && !/\bbuyer fit\b|\bmarket intelligence\b|\bcomps?\b|\bvaluation\b|\bdcf\b|\blbo\b|\bsensitivity\b|\btax\b|\blegal\b|\bqoe\b|\brecast\b|\bred flag\b|\bcovenant\b|\bearnout\b|\ballocation\b/.test(text);
  if (legacyScenarioOnly) return false;

  return /\banalysis\b|\bmodel\b|\bmarket intelligence\b|\bbuyer fit\b|\bcomps?\b|\bvaluation\b|\bdcf\b|\blbo\b|\bsensitivity\b|\btax\b|\blegal\b|\bqoe\b|\brecast\b|\bred flag\b|\bcovenant\b|\bearnout\b|\ballocation\b|^tool-/.test(text);
}

function AnalysisRunState({
  title,
  eyebrow,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  eyebrow: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="m-fade-up" style={{ maxWidth: 960 }}>
      <section style={{ marginBottom: 20 }}>
        <div className="mono" style={A.eyebrow}>{eyebrow}</div>
        <h1 style={A.h1}>{title}</h1>
      </section>
      <div className="m-card" style={A.analysisRunState}>
        <div style={A.analysisRunIcon}>Y</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="mono" style={A.cardEyebrow}>YULIA WORKSPACE</div>
          <div style={A.analysisRunBody}>{body}</div>
          {actionLabel && onAction && (
            <button className="m-btn filled" type="button" style={{ marginTop: 16 }} onClick={onAction}>
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function toneAccent(tone?: AnalysisTone): string {
  if (tone === "pursue") return "var(--m-pursue)";
  if (tone === "watch") return "var(--m-watch)";
  if (tone === "pass") return "var(--m-pass)";
  return "var(--m-primary)";
}

function toneBg(tone?: AnalysisTone): string {
  if (tone === "pursue") return "var(--m-pursue-container)";
  if (tone === "watch") return "var(--m-watch-container)";
  if (tone === "pass") return "var(--m-pass-container)";
  return "var(--m-primary-container)";
}

function toneFg(tone?: AnalysisTone): string {
  if (tone === "pursue") return "var(--m-pursue-on-cont)";
  if (tone === "watch") return "#3F2E00";
  if (tone === "pass") return "#4A1410";
  return "var(--m-on-primary-container)";
}

function toneBorder(tone?: AnalysisTone): string {
  if (tone === "pursue") return "rgba(69, 133, 101, 0.28)";
  if (tone === "watch") return "rgba(188, 137, 31, 0.28)";
  if (tone === "pass") return "rgba(185, 75, 67, 0.28)";
  return "var(--m-outline-var)";
}

function priorityTone(priority: string): AnalysisTone {
  if (priority === "high") return "pass";
  if (priority === "medium") return "watch";
  if (priority === "low") return "pursue";
  return "neutral";
}

function confidenceTone(confidence?: string): AnalysisTone {
  if (confidence === "high") return "pursue";
  if (confidence === "medium") return "watch";
  if (confidence === "low") return "pass";
  return "neutral";
}

function ComparisonCanvas({
  title,
  markdown,
  comparisonData,
  onTalkToYulia,
}: {
  title: string;
  markdown?: string;
  comparisonData: Record<string, any>[];
  onTalkToYulia?: (prompt: string) => void;
}) {
  const deals = comparisonData.slice(0, 3);
  const hasDeals = deals.length >= 2;

  return (
    <div className="m-fade-up" style={{ maxWidth: 1380 }}>
      <section style={{ marginBottom: 24 }}>
        <div className="mono" style={A.eyebrow}>ANALYSIS · COMPARISON</div>
        <div style={A.headerRow}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={A.h1}>{title}</h1>
            <div style={A.sub}>Side-by-side deal read. Yulia can keep refining the ranking from here.</div>
          </div>
          <button
            className="m-btn filled"
            type="button"
            onClick={() => onTalkToYulia?.("Update this comparison with risks, source gaps, and the next action for each deal.")}
          >
            Ask Yulia for the read
          </button>
        </div>
      </section>

      {hasDeals ? (
        <div className="m-card" style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ ...A.compareGrid, gridTemplateColumns: `160px repeat(${deals.length}, minmax(180px, 1fr))` }}>
            <div style={A.compareHeaderCell}>Field</div>
            {deals.map(deal => (
              <div key={String(deal.id ?? deal.dealId ?? deal.title)} style={A.compareHeaderCell}>
                {dealTitle(deal)}
              </div>
            ))}
            {[
              ["Stage", (d: Record<string, any>) => d.current_gate || d.currentGate || "—"],
              ["Journey", (d: Record<string, any>) => d.journey_type || d.journeyType || "—"],
              ["Revenue", (d: Record<string, any>) => fmtMaybeCents(d.revenue ?? d.revenueCents)],
              ["SDE", (d: Record<string, any>) => fmtMaybeCents(d.sde ?? d.sdeCents)],
              ["EBITDA", (d: Record<string, any>) => fmtMaybeCents(d.ebitda ?? d.ebitdaCents)],
              ["Asking", (d: Record<string, any>) => fmtMaybeCents(d.asking_price ?? d.askingPriceCents)],
              ["Fit", (d: Record<string, any>) => fmtMaybeNumber(d.seven_factor_composite ?? d.fit ?? d.score)],
            ].map(([label, reader]) => (
              <ComparisonRow
                key={String(label)}
                label={String(label)}
                deals={deals}
                reader={reader as (deal: Record<string, any>) => string}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="m-card" style={A.compareEmpty}>
          <strong>Pick at least two live deals.</strong>
          <span>Once your workspace has deal rows, this tab becomes a side-by-side comparison surface instead of a chat-only answer.</span>
        </div>
      )}

      {markdown && (
        <div className="m-card" style={A.markdownCard}>
          <div className="mono" style={A.cardEyebrow}>YULIA READ</div>
          <Markdown>{markdown}</Markdown>
        </div>
      )}
    </div>
  );
}

function ComparisonRow({
  label,
  deals,
  reader,
}: {
  label: string;
  deals: Record<string, any>[];
  reader: (deal: Record<string, any>) => string;
}) {
  return (
    <>
      <div style={A.compareLabel}>{label}</div>
      {deals.map(deal => (
        <div key={`${String(deal.id ?? deal.dealId ?? deal.title)}-${label}`} style={A.compareCell}>
          {reader(deal)}
        </div>
      ))}
    </>
  );
}

function dealTitle(deal: Record<string, any>): string {
  return deal.business_name || deal.title || deal.name || `Deal #${deal.id ?? deal.dealId ?? "—"}`;
}

function fmtMaybeNumber(value: unknown): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return String(Math.round(n));
}

function fmtMaybeCents(value: unknown): string {
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return "—";
  const dollars = n / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (dollars >= 1_000) return `$${Math.round(dollars / 1_000)}K`;
  return `$${Math.round(dollars).toLocaleString()}`;
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
  analysisRunState: {
    padding: "22px 24px",
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
    background: "linear-gradient(145deg, rgba(255,255,255,0.94), rgba(232,242,253,0.78))",
    borderColor: "rgba(111, 139, 177, 0.22)",
    boxShadow: "var(--m-elev-2)",
  },
  analysisRunIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    background: "linear-gradient(145deg, var(--m-primary), #79A892)",
    color: "#fff",
    display: "grid",
    placeItems: "center",
    fontFamily: "var(--font-mono)",
    fontSize: 16,
    fontWeight: 900,
    boxShadow: "0 10px 24px rgba(49, 91, 119, 0.18)",
    flexShrink: 0,
  },
  analysisRunBody: {
    fontSize: 14,
    lineHeight: 1.6,
    color: "var(--m-on-surface-var)",
    maxWidth: 740,
  },
  compareGrid: {
    display: "grid",
    alignItems: "stretch",
  },
  compareHeaderCell: {
    padding: "16px 18px",
    background: "var(--m-surface-2)",
    borderBottom: "1px solid var(--m-outline-var)",
    color: "var(--m-on-surface)",
    fontWeight: 800,
    fontSize: 13,
  },
  compareLabel: {
    padding: "14px 18px",
    borderBottom: "1px solid var(--m-outline-var)",
    color: "var(--m-on-surface-mid)",
    fontSize: 12,
    fontWeight: 700,
  },
  compareCell: {
    padding: "14px 18px",
    borderBottom: "1px solid var(--m-outline-var)",
    color: "var(--m-on-surface)",
    fontSize: 13,
    fontVariantNumeric: "tabular-nums",
  },
  compareEmpty: {
    padding: "22px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    color: "var(--m-on-surface-var)",
  },
  markdownCard: {
    padding: "22px 26px",
    fontSize: 13,
    lineHeight: 1.6,
  },
  cardEyebrow: {
    fontSize: 9.5,
    color: "var(--m-on-surface-mid)",
    letterSpacing: "0.14em",
    fontWeight: 700,
    marginBottom: 10,
  },
  structuredHero: {
    padding: "24px 26px",
    marginBottom: 22,
    background: "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(239,245,255,0.88))",
    borderColor: "rgba(103, 126, 174, 0.18)",
    boxShadow: "var(--m-elev-2)",
  },
  verdictBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    display: "grid",
    placeItems: "center",
    fontFamily: "var(--font-mono)",
    fontSize: 18,
    fontWeight: 900,
    flexShrink: 0,
    fontVariantNumeric: "tabular-nums",
  },
  structuredCopy: {
    fontSize: 13.5,
    lineHeight: 1.58,
    color: "var(--m-on-surface-var)",
    maxWidth: 900,
    margin: "8px 0 0",
  },
  metricCard: {
    padding: "16px 18px",
    minHeight: 112,
    boxSizing: "border-box",
  },
  metricValue: {
    fontFamily: "var(--font-display)",
    fontWeight: 850,
    fontSize: 26,
    letterSpacing: "-0.025em",
    color: "var(--m-on-surface)",
    fontVariantNumeric: "tabular-nums",
  },
  metricSub: {
    fontSize: 11.5,
    lineHeight: 1.35,
    color: "var(--m-on-surface-var)",
    marginTop: 5,
  },
  sideTitle: {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: 18,
    letterSpacing: "-0.02em",
    color: "var(--m-on-surface)",
  },
  barTrack: {
    height: 9,
    borderRadius: 999,
    background: "rgba(112, 124, 150, 0.14)",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
    minWidth: 8,
  },
  dataTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 12.5,
  },
  th: {
    textAlign: "left",
    padding: "12px 16px",
    borderTop: "1px solid var(--m-outline-var)",
    borderBottom: "1px solid var(--m-outline-var)",
    color: "var(--m-on-surface-mid)",
    background: "var(--m-surface-2)",
    fontSize: 11,
    fontWeight: 800,
  },
  td: {
    padding: "12px 16px",
    borderBottom: "1px solid var(--m-outline-var)",
    color: "var(--m-on-surface-var)",
    verticalAlign: "top",
  },
  listRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    paddingBottom: 12,
    borderBottom: "1px solid var(--m-outline-var)",
  },
  smallBadge: {
    padding: "6px 9px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800,
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  },
  actionRow: {
    all: "unset",
    cursor: "pointer",
    padding: "11px 12px",
    borderRadius: 12,
    background: "var(--m-surface-2)",
    color: "var(--m-on-surface)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    fontSize: 12.5,
    fontWeight: 800,
  },
  methodologyCard: {
    padding: "20px 22px",
    marginTop: 22,
  },
  assumptionRow: {
    display: "grid",
    gap: 5,
  },
  assumptionLabel: {
    fontSize: 11.5,
    color: "var(--m-on-surface-var)",
    fontWeight: 800,
  },
  assumptionControl: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    gap: 6,
    alignItems: "center",
  },
  assumptionInput: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid var(--m-outline-var)",
    borderRadius: 10,
    padding: "8px 10px",
    background: "rgba(255,255,255,0.8)",
    color: "var(--m-on-surface)",
    font: "inherit",
    fontSize: 12,
    outline: "none",
  },
  assumptionSave: {
    minHeight: 32,
    padding: "0 10px",
    fontSize: 11,
  },
  scenarioHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  scenarioCount: {
    flex: "0 0 auto",
    padding: "5px 8px",
    borderRadius: 999,
    background: "var(--m-primary-container)",
    color: "var(--m-on-primary-container)",
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: "0.05em",
  },
  scenarioNameRow: {
    display: "grid",
    gap: 6,
    marginBottom: 14,
  },
  sliderScenarioRow: {
    padding: "12px",
    borderRadius: 14,
    background: "linear-gradient(145deg, rgba(255,255,255,0.78), rgba(241,246,252,0.72))",
    border: "1px solid rgba(121, 142, 170, 0.16)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.72)",
  },
  sliderScenarioTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 10,
    marginBottom: 8,
  },
  sliderScenarioValue: {
    fontSize: 12,
    fontWeight: 900,
    color: "var(--m-on-surface)",
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  },
  sliderScenarioBounds: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 6,
    color: "var(--m-on-surface-var)",
    fontSize: 10.5,
  },
  scenarioReadOnly: {
    display: "grid",
    gap: 6,
    padding: "10px 12px",
    borderRadius: 14,
    background: "rgba(244, 247, 251, 0.8)",
    border: "1px solid var(--m-outline-var)",
  },
  scenarioReadOnlyRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    color: "var(--m-on-surface-var)",
    fontSize: 11.5,
  },
  scenarioActions: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 8,
    marginTop: 2,
  },
  scenarioSave: {
    minHeight: 36,
    padding: "0 10px",
    fontSize: 11.5,
  },
  versionPanel: {
    marginTop: 18,
    paddingTop: 16,
    borderTop: "1px solid var(--m-outline-var)",
  },
  versionRows: {
    display: "grid",
    gap: 10,
  },
  versionRow: {
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
    padding: "12px",
    borderRadius: 16,
    background: "linear-gradient(145deg, rgba(255,255,255,0.82), rgba(241,246,252,0.70))",
    border: "1px solid rgba(121, 142, 170, 0.16)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.72)",
  },
  versionTitle: {
    fontSize: 13,
    fontWeight: 900,
    color: "var(--m-on-surface)",
  },
  versionMeta: {
    marginTop: 3,
    fontSize: 11.5,
    color: "var(--m-on-surface-var)",
    lineHeight: 1.35,
  },
  versionSummary: {
    marginTop: 6,
    fontSize: 11.5,
    color: "var(--m-on-surface-var)",
    lineHeight: 1.45,
    maxWidth: 760,
  },
  versionActions: {
    display: "flex",
    gap: 6,
    flexShrink: 0,
  },
  versionButton: {
    minHeight: 30,
    padding: "0 10px",
    fontSize: 11,
  },
  versionEmpty: {
    padding: "12px",
    borderRadius: 14,
    background: "rgba(244, 247, 251, 0.8)",
    border: "1px solid var(--m-outline-var)",
    color: "var(--m-on-surface-var)",
    fontSize: 12,
  },
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
