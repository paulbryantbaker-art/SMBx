import { useEffect, useMemo, useState, type CSSProperties, type ChangeEvent } from "react";
import Markdown from "react-markdown";
import { authHeaders } from "../../../hooks/useAuth";
import {
  exportDeliverableFile,
  exportModelArtifactPreview,
  saveAnalysisModelArtifact,
  type SavedModelArtifact,
} from "../../../hooks/useV6WorkspaceData";
import {
  defaultScenarioName,
  formatCents,
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
import {
  buildBigFakeInvestmentBoardTab,
  buildInvestmentBoardComparisonCandidates,
  type InvestmentBoardComparisonCandidate,
} from "../../../lib/sampleInvestmentBoard";
import type { FileScope, OpenTab } from "../types";
import { AnalysisTableauView } from "./AnalysisTableauView";

type AccentKey = "primary" | "tertiary" | "pursue" | "watch" | "pass";

interface AnalysisVersionSummary {
  versionNumber: number;
  changeReason: string | null;
  createdAt: string;
  scenarioName: string | null;
  summary: string | null;
}

interface ComparisonDeal {
  id: string;
  data: StructuredAnalysisData;
  role: "primary" | "comparison";
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
  artifactData,
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
  artifactData?: Record<string, any>;
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

  if (isDefinitivePacketArtifact(artifactData)) {
    return (
      <DefinitivePacketCanvas
        title={title}
        markdown={effectiveMarkdown}
        artifactData={artifactData}
        openTab={openTab}
        onTalkToYulia={onTalkToYulia}
      />
    );
  }

  if (effectiveTool === "artifact") {
    return (
      <ArtifactCanvas
        title={title}
        markdown={effectiveMarkdown}
        artifactData={artifactData}
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
    <div className="m-fade-up m-page-flow" style={{ width: "min(100%, 1440px)", maxWidth: 1440, margin: "0 auto", boxSizing: "border-box" }}>
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
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
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
  const [savedModelArtifacts, setSavedModelArtifacts] = useState<SavedModelArtifact[]>([]);
  const [savingModelArtifact, setSavingModelArtifact] = useState(false);
  const [exportingModelArtifact, setExportingModelArtifact] = useState<"pdf" | "pptx" | null>(null);
  const [comparisonItems, setComparisonItems] = useState<ComparisonDeal[]>([]);
  const [controlScope, setControlScope] = useState("primary");
  const [liveScenarioUpdates, setLiveScenarioUpdates] = useState<Record<string, Record<string, unknown>>>({});
  useEffect(() => setCanvasData(data), [data]);
  useEffect(() => setCurrentVersion(versionNumber ?? null), [versionNumber]);
  useEffect(() => {
    setComparisonItems([]);
    setControlScope("primary");
    setLiveScenarioUpdates({});
    setSavedModelArtifacts([]);
  }, [data.title]);

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
    const nextData = applyLiveScenarioToData(canvasData, updates);
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
  const nextActions = dataView.nextActions ?? [];
  const primaryPrompt = nextActions[0]?.prompt || `Explain ${dataView.title || fallbackTitle} and tell me what decision this supports.`;
  const analysisDealId = dataView.calculations?.dealId;
  const linkedDealId = typeof analysisDealId === "number" || typeof analysisDealId === "string" ? analysisDealId : null;
  const analysisDealTitle = typeof dataView.calculations?.dealName === "string"
    ? dataView.calculations.dealName
    : (dataView.title || fallbackTitle).split(" · ")[0];
  const rawComparisonDeals: ComparisonDeal[] = [
    { id: "primary", data: dataView, role: "primary" },
    ...comparisonItems,
  ];
  const comparisonDeals = rawComparisonDeals.map(item => ({
    ...item,
    data: applyLiveScenarioToData(item.data, liveScenarioUpdates[item.id]),
  }));
  const primaryDisplayData = comparisonDeals[0]?.data ?? dataView;
  const metrics = primaryDisplayData.metrics ?? [];
  const tables = primaryDisplayData.tables ?? [];
  const risks = primaryDisplayData.risks ?? [];
  const missingData = primaryDisplayData.missingData ?? [];
  const evidenceRefs = primaryDisplayData.evidenceRefs ?? [];
  const comparisonActive = comparisonDeals.length > 1;
  const controlDeal = comparisonDeals.find(item => item.id === controlScope) ?? comparisonDeals[0];
  const rawControlDeal = rawComparisonDeals.find(item => item.id === controlDeal.id) ?? rawComparisonDeals[0];
  const comparisonCandidates = useMemo(() => {
    const selectedTitles = new Set(comparisonDeals.map(item => item.data.title));
    const selectedIds = new Set(comparisonItems.map(item => item.id));
    return buildInvestmentBoardComparisonCandidates()
      .filter(candidate => !selectedIds.has(candidate.id))
      .filter(candidate => !selectedTitles.has(candidate.data.title));
  }, [comparisonItems, dataView.title, liveScenarioUpdates]);

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
    setSaveNote("Use the side rail to model changes. Saved versions are attached to this analysis run for Yulia to reference.");
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

  const addComparison = (candidate: InvestmentBoardComparisonCandidate) => {
    if (comparisonItems.length >= 2) {
      setSaveNote("Comparison mode is capped at three deals for readability. Remove one before adding another.");
      return;
    }
    setComparisonItems(prev => [
      ...prev,
      { id: candidate.id, data: candidate.data, role: "comparison" },
    ]);
    setControlScope(candidate.id);
    setSaveNote(`${candidate.label} added beside ${analysisDealTitle}. The canvas is now comparing opportunities side by side.`);
  };

  const removeComparison = (id: string) => {
    const removed = comparisonItems.find(item => item.id === id);
    setComparisonItems(prev => prev.filter(item => item.id !== id));
    if (controlScope === id) setControlScope("primary");
    if (removed) setSaveNote(`${dealNameFromAnalysis(removed.data)} removed from the comparison.`);
  };

  const saveScopedAssumptions = async (updates: Record<string, unknown>, scenarioName?: string) => {
    if (controlDeal.id === "primary") {
      await updateAssumptions(updates, scenarioName);
      setLiveScenarioUpdates(prev => {
        const next = { ...prev };
        delete next.primary;
        return next;
      });
      return;
    }
    setComparisonItems(prev => prev.map(item => {
      if (item.id !== controlDeal.id) return item;
      return { ...item, data: applyLiveScenarioToData(item.data, updates) };
    }));
    setLiveScenarioUpdates(prev => {
      const next = { ...prev };
      delete next[controlDeal.id];
      return next;
    });
    setSaveNote(`${scenarioName || dealNameFromAnalysis(controlDeal.data)} updated in this comparison view. A live saved analysis run will persist scenario versions for this deal.`);
  };
  const previewScopedAssumptions = (updates: Record<string, unknown>) => {
    setLiveScenarioUpdates(prev => {
      if (!updates || Object.keys(updates).length === 0) {
        const next = { ...prev };
        delete next[controlDeal.id];
        return next;
      }
      return { ...prev, [controlDeal.id]: updates };
    });
  };
  const controlData = controlDeal.data;
  const controlProfessionalTriggers = controlData.professionalTriggers ?? [];
  const controlNextActions = controlData.nextActions ?? [];
  const controlInputRows = (controlData.inputs?.length
    ? controlData.inputs.map(input => [input.label, input.displayValue] as [string, string])
    : (controlData.assumptions ?? []).map(input => [input.label, input.displayValue] as [string, string]));
  const runScopedNextAction = async (action: NonNullable<StructuredAnalysisData["nextActions"]>[number]) => {
    if (controlDeal.id === "primary") {
      await runNextAction(action);
      return;
    }
    onTalkToYulia?.(`${buildSelectedDealYuliaContext({
      selectedDeal: controlDeal,
      allDeals: comparisonDeals,
      hostTitle: dataView.title || fallbackTitle,
      comparisonActive,
    })}\n\nNext action for the selected deal: ${action.prompt}`);
    setSaveNote(`${dealNameFromAnalysis(controlData)} action sent to Yulia from the comparison rail.`);
  };
  const optimizeComparisonBoard = () => {
    const optimizedUpdates = Object.fromEntries(
      rawComparisonDeals.map(item => [item.id, buildBestFitScenarioUpdates(item.data)]),
    );
    setLiveScenarioUpdates(optimizedUpdates);
    const optimizedDeals = rawComparisonDeals.map(item => ({
      ...item,
      data: applyLiveScenarioToData(item.data, optimizedUpdates[item.id]),
    }));
    const best = optimizedDeals.reduce((leader, item) =>
      comparisonModelScore(item.data) > comparisonModelScore(leader.data) ? item : leader,
      optimizedDeals[0],
    );
    setControlScope(best.id);
    setSaveNote(`Optimized all visible deals to best-fit assumptions. ${dealNameFromAnalysis(best.data)} models strongest after the scenario pass.`);
    onTalkToYulia?.(buildOptimizedComparisonPrompt({
      hostTitle: dataView.title || fallbackTitle,
      optimizedDeals,
      optimizedUpdates,
      best,
    }));
  };
  const modelArtifactTitle = `${comparisonActive ? `${comparisonDeals.length} deal comparison` : dealNameFromAnalysis(primaryDisplayData)} · Model snapshot`;
  const relatedDealIdsForArtifact = Array.from(new Set(
    comparisonDeals
      .map(item => numericDealIdFromAnalysis(item.data))
      .filter((id): id is number => typeof id === "number"),
  ));
  const buildModelArtifactPayload = () => ({
    artifactKind: comparisonActive ? "deal_model_comparison" : "deal_model_snapshot",
    canvasTitle: dataView.title || fallbackTitle,
    title: modelArtifactTitle,
    savedAt: new Date().toISOString(),
    analysisRunId,
    versionNumber: currentVersion,
    comparisonActive,
    activeScope: controlDeal.id,
    selectedDeal: dealNameFromAnalysis(controlData),
    yuliaRead: comparisonActive
      ? `The canvas compares ${comparisonDeals.map(item => dealNameFromAnalysis(item.data)).join(", ")} using the same live model lens.`
      : (primaryDisplayData.yuliaRead || primaryDisplayData.verdict?.rationale || primaryDisplayData.summary || ""),
    primaryData: primaryDisplayData,
    deals: comparisonDeals.map(item => ({
      id: item.id,
      role: item.role,
      title: dealNameFromAnalysis(item.data),
      modelScore: comparisonModelScore(item.data),
      data: item.data,
    })),
    liveScenarioUpdates,
  });
  const ensureModelArtifactSaved = async () => {
    if (savedModelArtifacts.length > 0) return savedModelArtifacts;
    if (!analysisRunId) {
      setSaveNote("This dev sample is not attached to a saved analysis run yet. Real deal boards will save to the related deal files under Models.");
      return [];
    }
    setSavingModelArtifact(true);
    try {
      const payload = await saveAnalysisModelArtifact({
        analysisRunId,
        title: modelArtifactTitle,
        dealIds: relatedDealIdsForArtifact,
        artifactPayload: buildModelArtifactPayload(),
      });
      setSavedModelArtifacts(payload.deliverables);
      setSaveNote(payload.message || `Saved ${modelArtifactTitle} to Files / Models. It was not added to the data room.`);
      return payload.deliverables;
    } catch (e: any) {
      setSaveNote(e?.message || "Could not save this model artifact.");
      return [];
    } finally {
      setSavingModelArtifact(false);
    }
  };
  const saveModelArtifact = async () => {
    await ensureModelArtifactSaved();
  };
  const hasExportAuth = () => Boolean(authHeaders().Authorization);
  const exportModelArtifact = async (format: "pdf" | "pptx") => {
    setExportingModelArtifact(format);
    try {
      if (!analysisRunId) {
        if (!hasExportAuth()) {
          setSaveNote("Sign in to export PDF or PowerPoint. Demo boards stay interactive on the canvas, but document downloads require a saved workspace.");
          return;
        }
        const exported = await exportModelArtifactPreview({
          title: modelArtifactTitle,
          format,
          artifactPayload: buildModelArtifactPayload(),
        });
        downloadBlob(exported.blob, exported.filename);
        setSaveNote(`Downloaded a demo ${format.toUpperCase()} from the live canvas. Logged-in saved boards also file privately under Files / Models, and data-room filing stays explicit.`);
        return;
      }
      const artifacts = await ensureModelArtifactSaved();
      const first = artifacts[0];
      if (!first) {
        if (!hasExportAuth()) {
          setSaveNote("Sign in to save and export this model. Demo boards do not download documents.");
          return;
        }
        const exported = await exportModelArtifactPreview({
          title: modelArtifactTitle,
          format,
          artifactPayload: buildModelArtifactPayload(),
        });
        downloadBlob(exported.blob, exported.filename);
        setSaveNote(`Downloaded ${format.toUpperCase()} from the live canvas. The model was not filed because no saved deal artifact was available.`);
        return;
      }
      const exported = await exportDeliverableFile(first.id, format);
      downloadBlob(exported.blob, exported.filename);
      setSaveNote(`Exported ${first.title} as ${format.toUpperCase()}. The saved model remains private unless you share or file it.`);
    } catch (e: any) {
      setSaveNote(e?.message || `Could not export ${format.toUpperCase()}.`);
    } finally {
      setExportingModelArtifact(null);
    }
  };

  return (
    <div className="m-fade-up m-page-flow" style={{ width: "min(100%, 1440px)", maxWidth: 1440, margin: "0 auto", boxSizing: "border-box" }}>
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
            <button className="m-btn outlined" type="button" disabled={savingModelArtifact} onClick={() => { void saveModelArtifact(); }}>
              {savingModelArtifact ? "Saving..." : "Save model"}
            </button>
            <button className="m-btn outlined" type="button" disabled={!!exportingModelArtifact || savingModelArtifact} onClick={() => { void exportModelArtifact("pdf"); }}>
              {exportingModelArtifact === "pdf" ? "PDF..." : "PDF"}
            </button>
            <button className="m-btn outlined" type="button" disabled={!!exportingModelArtifact || savingModelArtifact} onClick={() => { void exportModelArtifact("pptx"); }}>
              {exportingModelArtifact === "pptx" ? "PowerPoint..." : "PowerPoint"}
            </button>
            <button className="m-btn outlined" type="button" onClick={openScenarioNote}>Draft note</button>
            <button className="m-btn filled" type="button" onClick={() => onTalkToYulia?.(primaryPrompt)}>Ask Yulia</button>
          </div>
        </div>
      </section>

      <div
        style={{
          ...A.analysisWorkbench,
          gridTemplateColumns: comparisonActive
            ? "minmax(700px, 1fr) minmax(260px, 300px) minmax(190px, 240px)"
            : "minmax(0, 1fr) minmax(300px, 360px)",
          gap: comparisonActive ? 14 : 18,
        }}
      >
        <main style={A.analysisMain}>
          {comparisonActive ? (
            <InvestmentComparisonWorkspace
              deals={comparisonDeals}
              activeScope={controlScope}
              onSelectScope={setControlScope}
              onRemove={removeComparison}
              onTalkToYulia={onTalkToYulia}
            />
          ) : (
            <>
              <div className="m-card" style={A.structuredHero}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                  <div style={{ ...A.verdictBadge, background: toneBg(primaryDisplayData.verdict?.tone), color: toneFg(primaryDisplayData.verdict?.tone) }}>
                    {primaryDisplayData.verdict?.score ?? "Y"}
                  </div>
                  <div>
                    <div className="mono" style={A.cardEyebrow}>{primaryDisplayData.verdict?.label || "YULIA READ"}</div>
                    <div style={{ fontSize: 15, color: "var(--m-on-surface)", lineHeight: 1.45, fontWeight: 700 }}>
                      {primaryDisplayData.summary}
                    </div>
                  </div>
                </div>
              {primaryDisplayData.verdict?.rationale && <p style={A.structuredCopy}>{primaryDisplayData.verdict.rationale}</p>}
              {primaryDisplayData.yuliaRead && <p style={A.structuredCopy}>{primaryDisplayData.yuliaRead}</p>}
              </div>

              <AnalysisTableauView
                data={primaryDisplayData}
                onTalkToYulia={onTalkToYulia}
                onOpenScenarioControls={openScenarioControls}
              />

              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.15fr) minmax(300px, 0.85fr)", gap: 18, alignItems: "start" }}>
                <div style={{ display: "grid", gap: 18 }}>
                  {tables.length > 0 ? (
                    tables.map(table => (
                      <StructuredTableView key={table.title} table={table} />
                    ))
                  ) : (
                    <StructuredListCard
                      eyebrow="CANVAS OUTPUT"
                      title="Metrics available"
                      empty="Run or rerun the analysis to populate table detail."
                      items={metrics.map(metric => ({
                        key: metric.key,
                        label: metric.label,
                        sub: [metric.displayValue, metric.sub].filter(Boolean).join(" · "),
                        badge: metric.tone || "metric",
                        tone: metric.tone || "neutral",
                      }))}
                    />
                  )}
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
                </div>
              </div>
            </>
          )}
        </main>

        <aside id="analysis-scenario-controls" style={A.analysisControlRail}>
          <div className="m-card" style={A.controlRailCard}>
            <div className="mono" style={A.cardEyebrow}>MODEL CONTROLS</div>
            {comparisonActive && (
              <ComparisonScopePicker
                deals={comparisonDeals}
                selectedId={controlDeal.id}
                onSelect={setControlScope}
              />
            )}
            <ScenarioAssumptionPanel
              key={controlDeal.id}
              assumptions={rawControlDeal.data.assumptions ?? []}
              analysisTitle={controlData.title || fallbackTitle}
              yuliaContext={buildSelectedDealYuliaContext({
                selectedDeal: controlDeal,
                allDeals: comparisonDeals,
                hostTitle: dataView.title || fallbackTitle,
                comparisonActive,
              })}
              draftOverrides={liveScenarioUpdates[controlDeal.id]}
              onPreview={previewScopedAssumptions}
              onSave={saveScopedAssumptions}
              onOptimize={comparisonActive ? optimizeComparisonBoard : undefined}
              optimizeLabel={comparisonActive ? "Optimize all" : "Optimize"}
              onTalkToYulia={onTalkToYulia}
            />
          </div>
          <div className="m-card" style={A.controlRailCard}>
            <div className="mono" style={A.cardEyebrow}>INPUTS</div>
            <MiniFactList title={dealNameFromAnalysis(controlData)} rows={controlInputRows} />
          </div>
          <div className="m-card" style={A.controlRailCard}>
            <div className="mono" style={A.cardEyebrow}>GOVERNANCE</div>
            <div style={A.sideTitle}>Review triggers</div>
            {controlProfessionalTriggers.length ? (
              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                {controlProfessionalTriggers.map(item => (
                  <div key={`${item.role}-${item.trigger}`} style={A.controlListRow}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: "var(--m-on-surface)", fontWeight: 850 }}>{item.role}</div>
                      <div style={{ fontSize: 11.5, color: "var(--m-on-surface-var)", lineHeight: 1.42, marginTop: 3 }}>{item.trigger} {item.why}</div>
                    </div>
                    <span style={{ ...A.smallBadge, color: toneFg("watch"), background: toneBg("watch") }}>review</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 12.5, color: "var(--m-on-surface-var)", marginTop: 10 }}>No professional-review trigger is active yet.</div>
            )}
            <div style={{ marginTop: 14 }}>
              <MiniFactList title="Methodology refs" rows={(controlData.methodologyRefs ?? []).map(ref => ["Ref", ref])} />
            </div>
          </div>
          <div className="m-card" style={A.controlRailCard}>
            <div className="mono" style={A.cardEyebrow}>YULIA NEXT</div>
            <div style={A.sideTitle}>Actions from the read</div>
            <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
              {controlNextActions.map(action => (
                <button
                  key={`${action.actionType}-${action.label}`}
                  className="m-state"
                  type="button"
                  style={A.actionRow}
                  onClick={() => { void runScopedNextAction(action); }}
                >
                  <span>{action.label}</span>
                  <span style={{ color: "var(--m-primary)", fontWeight: 800 }}>→</span>
                </button>
              ))}
            </div>
          </div>
          {analysisRunId && controlDeal.id === "primary" && (
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
        </aside>

        <ComparisonTray
          activeDeals={comparisonDeals}
          candidates={comparisonCandidates}
          onAdd={addComparison}
          onRemove={removeComparison}
          onSelect={setControlScope}
          onTalkToYulia={onTalkToYulia}
        />
      </div>

      {saveNote && <div style={A.actionNote}>{saveNote}</div>}
    </div>
  );
}

function InvestmentComparisonWorkspace({
  deals,
  activeScope,
  onSelectScope,
  onRemove,
  onTalkToYulia,
}: {
  deals: ComparisonDeal[];
  activeScope: string;
  onSelectScope: (id: string) => void;
  onRemove: (id: string) => void;
  onTalkToYulia?: (prompt: string) => void;
}) {
  const winner = deals.reduce((best, item) => {
    const score = comparisonModelScore(item.data);
    const bestScore = comparisonModelScore(best.data);
    return score > bestScore ? item : best;
  }, deals[0]);
  const winnerName = dealNameFromAnalysis(winner.data);
  const rankedDeals = [...deals].sort((a, b) => comparisonModelScore(b.data) - comparisonModelScore(a.data));
  const comparisonRead = buildComparisonRead(rankedDeals, winner);
  const benefitRows = buildComparisonBenefitRows(deals);

  return (
    <section style={A.comparisonWorkspace} aria-label="Deal comparison board">
      <div style={A.comparisonHeader}>
        <div>
          <div className="mono" style={A.cardEyebrow}>COMPARE MODE · BUY OPPORTUNITIES</div>
          <h2 style={A.comparisonTitle}>{deals.length} deals on one canvas</h2>
          <p style={A.comparisonSub}>
            Same rows, same metrics, same decision lens. Use the right rail to change shared assumptions or switch into a specific deal.
          </p>
        </div>
        <button
          className="m-btn filled"
          type="button"
          onClick={() => onTalkToYulia?.(`Compare ${deals.map(item => dealNameFromAnalysis(item.data)).join(", ")} as a buyer. Tell me which one wins, what assumption would change the ranking, and what diligence I should run next.`)}
        >
          Ask Yulia to rank
        </button>
      </div>

      <div
        style={{
          ...A.comparisonColumns,
          gridTemplateColumns: `repeat(${Math.max(deals.length, 1)}, minmax(220px, 1fr))`,
        }}
      >
        {deals.map(item => (
          <ComparisonDealPanel
            key={item.id}
            item={item}
            active={item.id === activeScope}
            winner={item.id === winner.id}
            onSelect={() => onSelectScope(item.id)}
            onRemove={item.role === "comparison" ? () => onRemove(item.id) : undefined}
            onTalkToYulia={onTalkToYulia}
          />
        ))}
      </div>

      <div style={A.comparisonDecisionPanel}>
        <div style={A.modelReadGrid}>
          <div style={A.modelLeaderBlock}>
            <div className="mono" style={A.cardEyebrow}>MODEL READ · NOT TRANSACTION ADVICE</div>
            <div style={A.modelLeaderKicker}>Current top model</div>
            <div style={A.modelLeaderName}>{winnerName}</div>
            <p style={A.modelLeaderCopy}>{comparisonRead}</p>
            <div style={A.modelAdviceNote}>Model output only. Yulia can explain judgment, diligence gaps, and professional-review needs in chat.</div>
          </div>

          <div style={A.rankedOutputBlock}>
            <div className="mono" style={A.cardEyebrow}>RANKED MODEL OUTPUT</div>
            <div style={A.rankedOutputRows}>
              {rankedDeals.map((item, index) => (
                <div key={`${item.id}-matrix`} style={A.rankedOutputRow}>
                  <span style={A.rankPill}>{index + 1}</span>
                  <span style={A.rankName}>{dealNameFromAnalysis(item.data)}</span>
                  <strong style={A.rankScore}>{comparisonModelScore(item.data).toFixed(0)}</strong>
                  <small style={A.rankRange}>{metricText(item.data, "valuation") || metricText(item.data, "ask") || "Needs range"}</small>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={A.comparisonBenefitsPanel}>
          <div className="mono" style={A.cardEyebrow}>WHAT WINS OUT</div>
          <div style={A.benefitGrid}>
            {benefitRows.map(row => (
              <div key={row.label} style={A.benefitTile}>
                <span style={A.benefitLabel}>{row.label}</span>
                <strong style={A.benefitWinner}>{row.winner}</strong>
                <small style={A.benefitReason}>{row.reason}</small>
              </div>
            ))}
          </div>
        </div>

        <div style={A.comparisonChangePanel}>
          <div className="mono" style={A.cardEyebrow}>WHAT WOULD CHANGE THE RANKING</div>
          <div style={A.comparisonChangeRows}>
            {rankedDeals.map(item => (
              <div key={`${item.id}-change`} style={A.comparisonChangeRow}>
                <span>{dealNameFromAnalysis(item.data)}</span>
                <strong>{rankingChangeText(item.data)}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ComparisonDealPanel({
  item,
  active,
  winner,
  onSelect,
  onRemove,
  onTalkToYulia,
}: {
  item: ComparisonDeal;
  active: boolean;
  winner: boolean;
  onSelect: () => void;
  onRemove?: () => void;
  onTalkToYulia?: (prompt: string) => void;
}) {
  const data = item.data;
  const tone = data.verdict?.tone ?? "neutral";
  const score = comparisonModelScore(data);
  const chart = data.charts?.find(candidate => candidate.type === "bar") ?? data.charts?.[0] ?? null;
  const risks = data.risks ?? [];
  const action = data.nextActions?.[0];

  return (
    <article
      onClick={onSelect}
      style={{
        ...A.compareDealPanel,
        ...(active ? A.compareDealPanelActive : null),
      }}
    >
      <div style={A.compareDealTop}>
        <div style={{ ...A.compareScore, background: toneBg(tone), color: toneFg(tone) }}>{score.toFixed(0)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={A.compareDealName}>{dealNameFromAnalysis(data)}</div>
          <div style={A.compareDealMeta}>
            {winner ? "Models strongest" : item.role === "primary" ? "Current board" : "Compared target"} · {data.verdict?.label || "Review"}
          </div>
        </div>
        {onRemove && (
          <button
            className="m-btn outlined"
            type="button"
            style={A.compareIconButton}
            onClick={(event) => {
              event.stopPropagation();
              onRemove();
            }}
            aria-label={`Remove ${dealNameFromAnalysis(data)}`}
          >
            ×
          </button>
        )}
      </div>

      <div style={A.compareSelectButton}>
        <span>{active ? "Controls are editing this deal" : "Click card to edit assumptions"}</span>
        <span aria-hidden="true">→</span>
      </div>

      <div style={A.compareMetricGrid}>
        <ComparisonMetric label="Model" value={score.toFixed(0)} tone={tone} />
        <ComparisonMetric label="SDE" value={metricText(data, "sde") || "—"} tone={metricTone(data, "sde")} />
        <ComparisonMetric label="EBITDA" value={metricText(data, "ebitda") || "—"} tone={metricTone(data, "ebitda")} />
        <ComparisonMetric label="Value" value={metricText(data, "valuation") || "—"} tone={metricTone(data, "valuation")} />
      </div>

      {chart && <ComparisonMiniBars chart={chart} />}

      <div style={A.compareRiskStack}>
        <div className="mono" style={A.compareSectionLabel}>RISKS TO CLEAR</div>
        {risks.slice(0, 2).map(risk => (
          <div key={risk.label} style={A.compareRiskRow}>
            <span style={{ ...A.compareRiskDot, background: toneAccent(priorityTone(risk.severity)) }} />
            <span>{risk.label}</span>
          </div>
        ))}
      </div>

      {action && (
        <button
          className="m-state"
          type="button"
          style={A.compareActionButton}
          onClick={(event) => {
            event.stopPropagation();
            onTalkToYulia?.(`${buildSelectedDealYuliaContext({
              selectedDeal: item,
              allDeals: [item],
              hostTitle: data.title,
              comparisonActive: true,
            })} Next action: ${action.prompt}`);
          }}
        >
          <span>{action.label}</span>
          <span aria-hidden="true">→</span>
        </button>
      )}
    </article>
  );
}

function ComparisonMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: AnalysisTone;
}) {
  return (
    <div style={{ ...A.compareMetric, borderColor: toneBorder(tone) }}>
      <span className="mono">{label}</span>
      <strong style={{ color: tone === "watch" ? "#88630F" : tone === "pass" ? "var(--m-pass)" : tone === "pursue" ? "var(--m-pursue)" : "var(--m-on-surface)" }}>{value}</strong>
    </div>
  );
}

function ComparisonMiniBars({ chart }: { chart: StructuredChart }) {
  const rows = chart.data.slice(0, 5);
  const values = rows.map(point => Number(point.value ?? 0)).filter(Number.isFinite);
  const max = Math.max(1, ...values.map(value => Math.abs(value)));
  return (
    <div style={A.compareMiniBars}>
      <div className="mono" style={A.compareSectionLabel}>{chart.title}</div>
      {rows.map(point => {
        const value = Number(point.value ?? 0);
        const width = `${Math.max(4, Math.min(100, Math.abs(value) / max * 100))}%`;
        const tone = typeof point.tone === "string" ? point.tone as AnalysisTone : "neutral";
        return (
          <div key={`${chart.title}-${String(point.label)}`} style={A.compareMiniBarRow}>
            <div style={A.compareMiniBarLabel}>
              <span>{String(point.label ?? "Line")}</span>
              <strong>{String(point.displayValue ?? value)}</strong>
            </div>
            <div style={A.compareMiniBarTrack}>
              <div style={{ ...A.compareMiniBarFill, width, background: toneAccent(tone) }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ComparisonScopePicker({
  deals,
  selectedId,
  onSelect,
}: {
  deals: ComparisonDeal[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div style={A.scopePicker}>
      <div style={A.scopeLabel}>Assumption scope</div>
      <div style={A.scopeChips}>
        {deals.map(item => (
          <button
            key={item.id}
            type="button"
            className="m-state"
            style={{
              ...A.scopeChip,
              ...(item.id === selectedId ? A.scopeChipActive : null),
            }}
            onClick={() => onSelect(item.id)}
          >
            {item.role === "primary" ? "Current" : dealNameFromAnalysis(item.data)}
          </button>
        ))}
      </div>
    </div>
  );
}

function ComparisonTray({
  activeDeals,
  candidates,
  onAdd,
  onRemove,
  onSelect,
  onTalkToYulia,
}: {
  activeDeals: ComparisonDeal[];
  candidates: InvestmentBoardComparisonCandidate[];
  onAdd: (candidate: InvestmentBoardComparisonCandidate) => void;
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
  onTalkToYulia?: (prompt: string) => void;
}) {
  const comparedDeals = activeDeals.filter(item => item.role === "comparison");
  return (
    <aside style={A.analysisCompareRail}>
      <div className="m-card" style={A.compareTrayCard}>
        <div className="mono" style={A.cardEyebrow}>COMPARE WITH</div>
        <div style={A.sideTitle}>Opportunity tray</div>
        <p style={A.compareTrayCopy}>
          Add targets here for split-screen comparison. Tabs stay for deep work; this tray is for fast swapping.
        </p>

        {comparedDeals.length > 0 && (
          <div style={A.compareTrayGroup}>
            <div style={A.compareTrayLabel}>On canvas</div>
            {comparedDeals.map(item => (
              <div key={item.id} style={A.activeCompareRow}>
                <button type="button" className="m-state" style={A.activeCompareMain} onClick={() => onSelect(item.id)}>
                  <span>{dealNameFromAnalysis(item.data)}</span>
                  <strong>{metricText(item.data, "fit") || item.data.verdict?.score || "—"}</strong>
                </button>
                <button type="button" className="m-btn outlined" style={A.compareIconButton} onClick={() => onRemove(item.id)} aria-label={`Remove ${dealNameFromAnalysis(item.data)}`}>
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={A.compareTrayGroup}>
          <div style={A.compareTrayLabel}>Available</div>
          {candidates.length ? candidates.map(candidate => (
            <button
              key={candidate.id}
              type="button"
              className="m-state"
              style={A.compareCandidate}
              onClick={() => onAdd(candidate)}
            >
              <ComparisonThumbnail data={candidate.data} />
              <span style={A.compareCandidateCopy}>
                <strong>{candidate.label}</strong>
                <span>{candidate.subtitle}</span>
              </span>
            </button>
          )) : (
            <div style={A.compareTrayEmpty}>Three deals are already on the canvas.</div>
          )}
        </div>

        <button
          className="m-btn outlined"
          type="button"
          style={{ width: "100%", justifyContent: "center" }}
          onClick={() => onTalkToYulia?.("Find or open another buy opportunity to compare against this board. Put it on the same canvas when ready.")}
        >
          Ask Yulia for another
        </button>
      </div>
    </aside>
  );
}

function ComparisonThumbnail({ data }: { data: StructuredAnalysisData }) {
  const tone = data.verdict?.tone ?? "neutral";
  const chart = data.charts?.[0];
  const rows = chart?.data?.slice(-3) ?? [];
  const values = rows.map(item => Number(item.value ?? 0)).filter(Number.isFinite);
  const max = Math.max(1, ...values);
  return (
    <span style={A.compareThumb}>
      <span style={{ ...A.compareThumbScore, color: toneFg(tone), background: toneBg(tone) }}>
        {data.verdict?.score ?? metricText(data, "fit") ?? "Y"}
      </span>
      <span style={A.compareThumbBars}>
        {rows.map(item => {
          const value = Number(item.value ?? 0);
          const height = `${Math.max(18, Math.min(100, value / max * 100))}%`;
          const itemTone = typeof item.tone === "string" ? item.tone as AnalysisTone : tone;
          return <span key={String(item.label)} style={{ ...A.compareThumbBar, height, background: toneAccent(itemTone) }} />;
        })}
      </span>
    </span>
  );
}

function applyLiveScenarioToData(data: StructuredAnalysisData, updates?: Record<string, unknown>): StructuredAnalysisData {
  const patched = updates && Object.keys(updates).length > 0
    ? patchStructuredDataAssumptions(data, updates)
    : data;
  return recomputeInvestmentBoardData(patched);
}

function buildBestFitScenarioUpdates(data: StructuredAnalysisData): Record<string, unknown> {
  const sdeCents = assumptionNumber(data, "normalized_sde_cents") ?? numberFromCalculation(data, "normalizedSdeCents") ?? 0;
  const ebitdaCents = assumptionNumber(data, "adjusted_ebitda_cents") ?? numberFromCalculation(data, "adjustedEbitdaCents") ?? 0;
  const addBacksCents = assumptionNumber(data, "add_backs_cents") ?? numberFromCalculation(data, "addBacksCents") ?? 0;
  const proofBurden = evidenceBurdenScore(data);
  const addBackLimitRatio = proofBurden >= 8 ? 0.28 : proofBurden >= 5 ? 0.32 : 0.38;
  const optimizedAddBacks = sdeCents > 0
    ? Math.min(addBacksCents, Math.round(sdeCents * addBackLimitRatio))
    : addBacksCents;
  const haircut = Math.max(0, addBacksCents - optimizedAddBacks);
  const optimizedSde = sdeCents > 0 ? Math.max(Math.round(sdeCents * 0.72), sdeCents - haircut) : sdeCents;
  const optimizedEbitda = ebitdaCents > 0 ? Math.max(Math.round(ebitdaCents * 0.72), ebitdaCents - Math.round(haircut * 0.85)) : ebitdaCents;
  return {
    normalized_sde_cents: optimizedSde,
    adjusted_ebitda_cents: optimizedEbitda,
    base_multiple: optimalMultipleForDeal(data),
    add_backs_cents: optimizedAddBacks,
  };
}

function optimalMultipleForDeal(data: StructuredAnalysisData): number {
  const fit = Number(data.verdict?.score ?? metricNumber(data, "fit") ?? data.calculations?.fitScore ?? 75);
  const proofBurden = evidenceBurdenScore(data);
  const current = dealMultiple(data);
  const qualityBase = fit >= 90 ? 6.9 : fit >= 84 ? 6.65 : fit >= 78 ? 6.15 : 5.7;
  const burdenDiscount = Math.min(0.9, proofBurden * 0.075);
  const target = qualityBase - burdenDiscount;
  return roundToStep(clamp(Math.min(current, target), 3.0, 8.5), 0.1);
}

function recomputeInvestmentBoardData(data: StructuredAnalysisData): StructuredAnalysisData {
  const sdeCents = assumptionNumber(data, "normalized_sde_cents") ?? numberFromCalculation(data, "normalizedSdeCents");
  const ebitdaCents = assumptionNumber(data, "adjusted_ebitda_cents") ?? numberFromCalculation(data, "adjustedEbitdaCents");
  const multiple = assumptionNumber(data, "base_multiple") ?? 7;
  const addBacksCents = assumptionNumber(data, "add_backs_cents") ?? 0;
  const valuationLowCents = ebitdaCents != null ? Math.max(0, Math.round(ebitdaCents * Math.max(0.5, multiple - 0.35))) : null;
  const valuationHighCents = ebitdaCents != null ? Math.max(0, Math.round(ebitdaCents * (multiple + 0.35))) : null;
  const modelScore = comparisonModelScore({
    ...data,
    calculations: {
      ...(data.calculations ?? {}),
      normalizedSdeCents: sdeCents ?? data.calculations?.normalizedSdeCents,
      adjustedEbitdaCents: ebitdaCents ?? data.calculations?.adjustedEbitdaCents,
      valuationLowCents: valuationLowCents ?? data.calculations?.valuationLowCents,
      valuationHighCents: valuationHighCents ?? data.calculations?.valuationHighCents,
      baseMultiple: multiple,
      addBacksCents,
    },
  });
  const tone: AnalysisTone = modelScore >= 84 ? "pursue" : modelScore >= 70 ? "watch" : "pass";
  const valuationDisplay = valuationLowCents != null && valuationHighCents != null
    ? `${formatCents(valuationLowCents)}-${formatCents(valuationHighCents)}`
    : metricText(data, "valuation") ?? "Needs range";
  const nextMetrics = (data.metrics ?? []).map(metric => {
    if (metric.key === "fit" || /fit/i.test(metric.label)) {
      return { ...metric, value: modelScore, displayValue: modelScore.toFixed(0), sub: "Live risk-adjusted model", tone };
    }
    if (metric.key === "sde" || /sde/i.test(metric.label)) {
      return sdeCents != null ? { ...metric, value: sdeCents / 100 / 1_000_000, displayValue: formatCents(sdeCents), tone: sdeTone(sdeCents) } : metric;
    }
    if (metric.key === "ebitda" || /ebitda/i.test(metric.label)) {
      return ebitdaCents != null ? { ...metric, value: ebitdaCents / 100 / 1_000_000, displayValue: formatCents(ebitdaCents), tone: ebitdaTone(ebitdaCents) } : metric;
    }
    if (metric.key === "valuation" || /valuation|value/i.test(metric.label)) {
      return { ...metric, displayValue: valuationDisplay, sub: `${multiple.toFixed(1)}x adjusted EBITDA`, tone: valuationTone(multiple) };
    }
    return metric;
  });
  const nextCharts = (data.charts ?? []).map(chart => {
    if (!/recast|bridge/i.test(chart.title)) return chart;
    return {
      ...chart,
      data: chart.data.map(point => {
        const label = String(point.label ?? "");
        if (/normalized\s+sde/i.test(label) && sdeCents != null) {
          return { ...point, value: centsToMillions(sdeCents), displayValue: formatCents(sdeCents), tone: sdeTone(sdeCents) };
        }
        if (/adjusted\s+ebitda/i.test(label) && ebitdaCents != null) {
          return { ...point, value: centsToMillions(ebitdaCents), displayValue: formatCents(ebitdaCents), tone: ebitdaTone(ebitdaCents) };
        }
        if (/add-back|addback/i.test(label) && addBacksCents) {
          return { ...point, value: centsToMillions(addBacksCents), displayValue: `+${formatCents(addBacksCents)}`, tone: addBackTone(addBacksCents, sdeCents) };
        }
        return point;
      }),
    };
  });
  return {
    ...data,
    verdict: data.verdict ? {
      ...data.verdict,
      score: Math.round(modelScore),
      tone,
      label: tone === "pursue" ? "MODELS STRONG" : tone === "watch" ? "WATCH" : "MODEL WEAK",
      rationale: liveRationale(data, modelScore, multiple, addBacksCents, sdeCents),
    } : data.verdict,
    metrics: nextMetrics,
    charts: nextCharts,
    calculations: {
      ...(data.calculations ?? {}),
      fitScore: Math.round(modelScore),
      normalizedSdeCents: sdeCents ?? data.calculations?.normalizedSdeCents,
      adjustedEbitdaCents: ebitdaCents ?? data.calculations?.adjustedEbitdaCents,
      valuationLowCents: valuationLowCents ?? data.calculations?.valuationLowCents,
      valuationHighCents: valuationHighCents ?? data.calculations?.valuationHighCents,
      baseMultiple: multiple,
      addBacksCents,
    },
  };
}

function dealNameFromAnalysis(data: StructuredAnalysisData): string {
  const name = data.calculations?.dealName;
  if (typeof name === "string" && name.trim()) return name;
  return (data.title || "Deal").split(" · ")[0].trim() || "Deal";
}

function metricText(data: StructuredAnalysisData, key: string): string | null {
  const metric = data.metrics?.find(item =>
    item.key.toLowerCase() === key.toLowerCase()
    || item.label.toLowerCase().includes(key.toLowerCase()),
  );
  return metric?.displayValue ?? null;
}

function metricNumber(data: StructuredAnalysisData, key: string): number | null {
  const metric = data.metrics?.find(item =>
    item.key.toLowerCase() === key.toLowerCase()
    || item.label.toLowerCase().includes(key.toLowerCase()),
  );
  const value = Number(metric?.value);
  return Number.isFinite(value) ? value : null;
}

function metricTone(data: StructuredAnalysisData, key: string): AnalysisTone {
  const metric = data.metrics?.find(item =>
    item.key.toLowerCase() === key.toLowerCase()
    || item.label.toLowerCase().includes(key.toLowerCase()),
  );
  return metric?.tone ?? "neutral";
}

function assumptionNumber(data: StructuredAnalysisData, key: string): number | null {
  const assumption = data.assumptions?.find(item => item.key === key);
  return assumption ? numericAssumptionValue(assumption) : null;
}

function numberFromCalculation(data: StructuredAnalysisData, key: string): number | null {
  const value = data.calculations?.[key];
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function centsToMillions(cents: number): number {
  return cents / 100 / 1_000_000;
}

function comparisonModelScore(data: StructuredAnalysisData): number {
  const baseFit = Number(data.verdict?.score ?? metricNumber(data, "fit") ?? data.calculations?.fitScore ?? 70);
  const multiple = assumptionNumber(data, "base_multiple") ?? numberFromCalculation(data, "baseMultiple") ?? 7;
  const sdeCents = assumptionNumber(data, "normalized_sde_cents") ?? numberFromCalculation(data, "normalizedSdeCents") ?? 0;
  const addBacksCents = assumptionNumber(data, "add_backs_cents") ?? numberFromCalculation(data, "addBacksCents") ?? 0;
  const riskPenalty = (data.risks ?? []).reduce((sum, risk) => sum + (risk.severity === "high" ? 2.5 : risk.severity === "medium" ? 1.25 : 0.35), 0) * 0.5;
  const dataPenalty = (data.missingData ?? []).reduce((sum, item) => sum + (item.priority === "high" ? 2 : item.priority === "medium" ? 0.9 : 0.2), 0) * 0.3;
  const addBackRatio = sdeCents > 0 ? addBacksCents / sdeCents : 0;
  const addBackPenalty = Math.max(0, addBackRatio - 0.35) * 18;
  const ebitdaM = dealEbitdaCents(data) / 100 / 1_000_000;
  const scaleBonus = clamp((ebitdaM - 1.5) * 1.5, -1.5, 4);
  const priceDiscipline = (7 - multiple) * 3.2;
  const score = baseFit + scaleBonus + priceDiscipline - riskPenalty - dataPenalty - addBackPenalty;
  return Math.max(35, Math.min(98, score));
}

function sdeTone(cents: number): AnalysisTone {
  return cents >= 1_750_000_00 ? "pursue" : cents >= 1_100_000_00 ? "watch" : "neutral";
}

function ebitdaTone(cents: number): AnalysisTone {
  return cents >= 2_000_000_00 ? "pursue" : cents >= 1_250_000_00 ? "watch" : "neutral";
}

function valuationTone(multiple: number): AnalysisTone {
  if (multiple <= 6.4) return "pursue";
  if (multiple <= 7.5) return "watch";
  return "pass";
}

function addBackTone(addBacksCents: number, sdeCents: number | null): AnalysisTone {
  if (!sdeCents) return "neutral";
  const ratio = addBacksCents / sdeCents;
  if (ratio > 0.45) return "pass";
  if (ratio > 0.3) return "watch";
  return "pursue";
}

function liveRationale(data: StructuredAnalysisData, modelScore: number, multiple: number, addBacksCents: number, sdeCents: number | null): string {
  const ratio = sdeCents ? addBacksCents / sdeCents : 0;
  const priceRead = multiple <= 6.4 ? "entry multiple helps the buyer case" : multiple <= 7.5 ? "valuation is workable but sensitive" : "valuation asks a lot from execution";
  const addBackRead = ratio > 0.45 ? "add-back proof is the main drag" : ratio > 0.3 ? "add-backs still need clean support" : "earnings quality reads comparatively cleaner";
  return `${dealNameFromAnalysis(data)} models at ${modelScore.toFixed(0)} on the live assumptions: ${priceRead}, and ${addBackRead}. This is a model read for comparison, not a purchase recommendation.`;
}

function numericDealIdFromAnalysis(data: StructuredAnalysisData): number | null {
  const raw = data.calculations?.dealId;
  const numeric = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(numeric) ? numeric : null;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildComparisonRead(deals: ComparisonDeal[], winner: ComparisonDeal): string {
  const winnerName = dealNameFromAnalysis(winner.data);
  const winnerScore = comparisonModelScore(winner.data);
  const runnerUp = deals.find(item => item.id !== winner.id);
  const scoreSpread = runnerUp
    ? Math.max(0, winnerScore - comparisonModelScore(runnerUp.data))
    : 0;
  const tiedLeaders = deals
    .filter(item => item.id !== winner.id)
    .filter(item => Math.abs(comparisonModelScore(item.data) - winnerScore) < 0.5);
  const valueWinner = lowestMultipleDeal(deals);
  const cleanest = cleanestEvidenceDeal(deals);
  return [
    tiedLeaders.length
      ? `${winnerName} is tied in the top model band with ${tiedLeaders.map(item => dealNameFromAnalysis(item.data)).join(", ")}.`
      : runnerUp
      ? `${winnerName} leads by ${scoreSpread.toFixed(0)} points on the live model.`
      : `${winnerName} is the only model on this canvas.`,
    `${dealNameFromAnalysis(valueWinner.data)} is the cleanest price-discipline case at ${dealMultiple(valueWinner.data).toFixed(1)}x.`,
    `${dealNameFromAnalysis(cleanest.data)} has the lowest proof burden right now.`,
  ].join(" ");
}

function buildComparisonBenefitRows(deals: ComparisonDeal[]): Array<{ label: string; winner: string; reason: string }> {
  const strongest = deals.reduce((best, item) => comparisonModelScore(item.data) > comparisonModelScore(best.data) ? item : best, deals[0]);
  const value = lowestMultipleDeal(deals);
  const earnings = highestEbitdaDeal(deals);
  const cleanest = cleanestEvidenceDeal(deals);
  return [
    { label: "Best live model", winner: dealNameFromAnalysis(strongest.data), reason: `${comparisonModelScore(strongest.data).toFixed(0)} score on current assumptions` },
    { label: "Best price discipline", winner: dealNameFromAnalysis(value.data), reason: `${dealMultiple(value.data).toFixed(1)}x EBITDA basis` },
    { label: "Most earnings scale", winner: dealNameFromAnalysis(earnings.data), reason: metricText(earnings.data, "ebitda") || "Highest adjusted EBITDA" },
    { label: "Lowest proof burden", winner: dealNameFromAnalysis(cleanest.data), reason: "Fewer high-priority gaps and risk flags" },
  ];
}

function buildOptimizedComparisonPrompt({
  hostTitle,
  optimizedDeals,
  optimizedUpdates,
  best,
}: {
  hostTitle: string;
  optimizedDeals: ComparisonDeal[];
  optimizedUpdates: Record<string, Record<string, unknown>>;
  best: ComparisonDeal;
}): string {
  const dealLines = optimizedDeals.map(item => {
    const updates = optimizedUpdates[item.id] ?? {};
    const updateText = Object.entries(updates)
      .map(([key, value]) => `${humanizeAssumptionKey(key)} ${formatAssumptionDisplay(key, value)}`)
      .join(", ");
    return `${dealNameFromAnalysis(item.data)}: model score ${comparisonModelScore(item.data).toFixed(0)}, valuation ${metricText(item.data, "valuation") || "needs range"}, optimized assumptions: ${updateText || "base case"}.`;
  }).join("\n");
  return [
    `The canvas just optimized all visible deals in the multi-deal comparison hosted inside "${hostTitle}".`,
    `The current best-fit model is ${dealNameFromAnalysis(best.data)}, but do not phrase this as legal, tax, investment, or purchase advice.`,
    "Use the optimized canvas state as shared context with the user. Explain what models out best, why it wins on the model, what could change the ranking, and which diligence/professional-review items still matter.",
    "Keep it concise and board-quality. If there is wisdom that belongs in chat rather than the canvas, say it clearly.",
    dealLines,
  ].join("\n\n");
}

function humanizeAssumptionKey(key: string): string {
  return key
    .replace(/_cents$/i, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());
}

function evidenceBurdenScore(data: StructuredAnalysisData): number {
  return (
    (data.risks ?? []).reduce((sum, risk) => sum + (risk.severity === "high" ? 3 : risk.severity === "medium" ? 1.5 : 0.5), 0)
    + (data.missingData ?? []).reduce((sum, gap) => sum + (gap.priority === "high" ? 2.5 : gap.priority === "medium" ? 1 : 0.25), 0)
  );
}

function lowestMultipleDeal(deals: ComparisonDeal[]): ComparisonDeal {
  return deals.reduce((best, item) => dealMultiple(item.data) < dealMultiple(best.data) ? item : best, deals[0]);
}

function highestEbitdaDeal(deals: ComparisonDeal[]): ComparisonDeal {
  return deals.reduce((best, item) => dealEbitdaCents(item.data) > dealEbitdaCents(best.data) ? item : best, deals[0]);
}

function cleanestEvidenceDeal(deals: ComparisonDeal[]): ComparisonDeal {
  const burden = (item: ComparisonDeal) => evidenceBurdenScore(item.data);
  return deals.reduce((best, item) => burden(item) < burden(best) ? item : best, deals[0]);
}

function dealMultiple(data: StructuredAnalysisData): number {
  return assumptionNumber(data, "base_multiple") ?? numberFromCalculation(data, "baseMultiple") ?? 99;
}

function dealEbitdaCents(data: StructuredAnalysisData): number {
  return assumptionNumber(data, "adjusted_ebitda_cents") ?? numberFromCalculation(data, "adjustedEbitdaCents") ?? 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function roundToStep(value: number, step: number): number {
  return Number((Math.round(value / step) * step).toFixed(3));
}

function buildSelectedDealYuliaContext({
  selectedDeal,
  allDeals,
  hostTitle,
  comparisonActive,
}: {
  selectedDeal: ComparisonDeal;
  allDeals: ComparisonDeal[];
  hostTitle: string;
  comparisonActive: boolean;
}): string {
  const data = selectedDeal.data;
  const selectedName = dealNameFromAnalysis(data);
  const metrics = (data.metrics ?? [])
    .slice(0, 5)
    .map(metric => `${metric.label}: ${metric.displayValue}${metric.sub ? ` (${metric.sub})` : ""}`)
    .join("; ");
  const assumptions = (data.assumptions ?? [])
    .slice(0, 6)
    .map(item => `${item.label}: ${item.displayValue}`)
    .join("; ");
  const peerNames = allDeals.map(item => dealNameFromAnalysis(item.data)).join(", ");
  const scopeLine = comparisonActive
    ? `The active canvas is a multi-deal comparison hosted inside "${hostTitle}". The selected highlighted deal card is "${selectedName}". Use that selected card as the current deal scope, even if the host tab title says something else. Deals on this canvas: ${peerNames}.`
    : `The active canvas scope is "${selectedName}".`;
  return [
    scopeLine,
    `Selected deal verdict: ${data.verdict?.label || "Review"}${data.verdict?.score != null ? `, score ${data.verdict.score}` : ""}.`,
    data.summary ? `Selected deal summary: ${data.summary}` : "",
    metrics ? `Selected deal metrics: ${metrics}.` : "",
    assumptions ? `Selected deal assumptions: ${assumptions}.` : "",
    "When responding, do not say the visible canvas is mismatched just because the host tab title differs from the selected comparison card.",
  ].filter(Boolean).join(" ");
}

function rankingChangeText(data: StructuredAnalysisData): string {
  const tone = data.verdict?.tone;
  const risks = data.risks ?? [];
  const missing = data.missingData ?? [];
  if (tone === "pursue" && risks.some(risk => risk.severity === "medium" || risk.severity === "high")) {
    return risks[0]?.label ? `Clear ${risks[0].label.toLowerCase()}` : "Clear diligence risks";
  }
  if (tone === "watch") {
    return missing[0]?.label ? `Prove ${missing[0].label.toLowerCase()}` : "Prove missing evidence";
  }
  if (tone === "pass") return "Reset price or risk";
  return data.verdict?.rationale ? "Tighten the evidence" : "Run the next model";
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
  yuliaContext,
  draftOverrides,
  onPreview,
  onSave,
  onOptimize,
  optimizeLabel = "Optimize",
  onTalkToYulia,
}: {
  assumptions: StructuredAssumption[];
  analysisTitle: string;
  yuliaContext?: string;
  draftOverrides?: Record<string, unknown>;
  onPreview?: (updates: Record<string, unknown>) => void;
  onSave: (updates: Record<string, unknown>, scenarioName?: string) => void | Promise<void>;
  onOptimize?: () => void;
  optimizeLabel?: string;
  onTalkToYulia?: (prompt: string) => void;
}) {
  const [drafts, setDrafts] = useState<Record<string, number>>({});
  const [scenarioName, setScenarioName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const baseDrafts = Object.fromEntries(
      assumptions
        .map(item => [item.key, numericAssumptionValue(item)] as const)
        .filter((entry): entry is readonly [string, number] => entry[1] != null),
    );
    const overrideDrafts = Object.fromEntries(
      Object.entries(draftOverrides ?? {})
        .map(([key, value]) => [key, Number(value)] as const)
        .filter((entry): entry is readonly [string, number] => Number.isFinite(entry[1])),
    );
    setDrafts({ ...baseDrafts, ...overrideDrafts });
  }, [assumptions, draftOverrides]);

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
  const previewUpdatesFor = (nextDrafts: Record<string, number>) => Object.fromEntries(
    sliderRows
      .filter(({ item, original }) => Math.abs((nextDrafts[item.key] ?? original) - original) > 0.000001)
      .map(({ item, original }) => [item.key, nextDrafts[item.key] ?? original]),
  );

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
    onTalkToYulia?.(`${yuliaContext ? `${yuliaContext}\n\n` : ""}Discuss scenario "${scenarioLabel}" for the selected canvas scope: ${analysisTitle}. Changed assumptions: ${changedText}. Tell me what moved, what risk changed, and what decision this supports.`);
  };

  const optimizeScenario = () => {
    const changedText = changedRows.length
      ? changedRows.map(({ item, original }) => {
        const nextValue = drafts[item.key] ?? original;
        return `${item.label}: ${formatAssumptionDisplay(item.key, original)} to ${formatAssumptionDisplay(item.key, nextValue)}`;
      }).join("; ")
      : "use the current saved/base assumptions";
    onTalkToYulia?.(`${yuliaContext ? `${yuliaContext}\n\n` : ""}Optimize scenario "${scenarioLabel}" for the selected canvas scope: ${analysisTitle}. Changed assumptions: ${changedText}. If a tool can target the selected comparison scope, use it; if tool state only reports the host tab, do not ask me to switch tabs and do not treat that as a mismatch. Optimize from the selected deal facts above and the visible sliders. Infer whether I am buying, selling, raising, divesting, or advising from the deal context; if that is ambiguous, ask one concise clarifying question before recommending. Pick the best risk-adjusted scenario, explain what changed, and show the path through negotiation asks, fallback positions, reps and warranties, diligence requests, professional signoffs, and concrete work products Yulia should create or update.`);
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
                onChange={event => {
                  const nextValue = Number(event.target.value);
                  setDrafts(prev => {
                    const nextDrafts = syncLinkedAssumptions(prev, item.key, nextValue);
                    onPreview?.(previewUpdatesFor(nextDrafts));
                    return nextDrafts;
                  });
                }}
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
            onClick={onOptimize ?? optimizeScenario}
          >
            {optimizeLabel}
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
    <div className="m-fade-up m-page-flow" style={{ maxWidth: 960 }}>
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

function isDefinitivePacketArtifact(data?: Record<string, any>): boolean {
  return data?.type === "definitive_packet";
}

function DefinitivePacketCanvas({
  title,
  markdown,
  artifactData,
  openTab,
  onTalkToYulia,
}: {
  title: string;
  markdown?: string;
  artifactData?: Record<string, any>;
  openTab?: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
}) {
  const packetRowId = numericMaybe(artifactData?.packetRowId);
  const dealId = textMaybe(artifactData?.dealId);
  const dealTitle = textMaybe(artifactData?.dealTitle) || "this deal";
  const [packet, setPacket] = useState<Record<string, any> | null>(null);
  const [packetLoading, setPacketLoading] = useState(false);
  const [packetError, setPacketError] = useState<string | null>(null);

  useEffect(() => {
    if (!packetRowId) {
      setPacket(null);
      setPacketLoading(false);
      setPacketError(null);
      return;
    }

    let alive = true;
    setPacketLoading(true);
    setPacketError(null);
    const params = new URLSearchParams();
    params.set("packetRowId", String(packetRowId));
    if (dealId) params.set("dealId", dealId);
    params.set("limit", "50");
    fetch(`/api/definitive/deal-packets?${params.toString()}`, { headers: authHeaders() })
      .then(async res => {
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload.error || `HTTP ${res.status}`);
        return payload;
      })
      .then(payload => {
        if (!alive) return;
        const rows = Array.isArray(payload.packets) ? payload.packets : [];
        setPacket(rows.find((item: any) => Number(item.id) === packetRowId) ?? rows[0] ?? null);
      })
      .catch((err: Error) => {
        if (!alive) return;
        setPacket(null);
        setPacketError(err.message || "Could not load packet details.");
      })
      .finally(() => {
        if (alive) setPacketLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [dealId, packetRowId]);

  const packetType = textMaybe(packet?.packetType) || textMaybe(artifactData?.packetType) || title;
  const packetId = textMaybe(packet?.packetId) || textMaybe(artifactData?.packetId) || (packetRowId ? `row ${packetRowId}` : "available packet");
  const stateCid = textMaybe(packet?.dealStateCid) || textMaybe(artifactData?.stateCid) || "pending";
  const packetCid = textMaybe(packet?.packetCid) || textMaybe(artifactData?.packetCid) || "pending";
  const toolName = labelFromCode(textMaybe(packet?.toolName) || textMaybe(artifactData?.toolName) || "DEFINITIVE");
  const nextCalls = arrayMaybe(packet?.nextSuggestedCalls);
  const artifacts = arrayMaybe(packet?.takeBackArtifacts);
  const payloadRows = summarizePacketPayload(packet?.payload || {});

  const askPrompt = `Explain ${packetType} for ${dealTitle}. Use packet ${packetId}, DealState ${stateCid}, and show what is known, what is missing, the current gate, the next suggested calls, and what another agent can take back to its system.`;

  return (
    <div className="m-fade-up m-page-flow" style={DP.shell}>
      <section className="m-card" style={DP.hero}>
        <div style={DP.heroCopy}>
          <div className="mono" style={DP.eyebrow}>DEFINITIVE PACKET · DEAL OS HANDOFF</div>
          <h1 style={DP.title}>{title}</h1>
          <p style={DP.deckline}>
            This packet is a portable deal-state object, not a loose document. Yulia and external agents can use it to resume the deal, advance the next gate, or carry the current state back to another system.
          </p>
          <div style={DP.actions}>
            <button className="m-btn filled" type="button" onClick={() => onTalkToYulia?.(askPrompt)}>
              Ask Yulia to explain
            </button>
            {dealId && (
              <button
                className="m-btn outlined"
                type="button"
                onClick={() => openTab?.({ kind: "deal", id: dealId, title: dealTitle })}
              >
                Open deal
              </button>
            )}
          </div>
        </div>
        <div style={DP.identityCard}>
          <PacketDatum label="Packet" value={packetId} />
          <PacketDatum label="Type" value={packetType} />
          <PacketDatum label="Tool" value={toolName} />
          <PacketDatum label="DealState CID" value={shortHash(stateCid)} />
          <PacketDatum label="Packet CID" value={shortHash(packetCid)} />
          <PacketDatum label="Methodology" value={textMaybe(packet?.methodologyVersion) || "DEFINITIVE"} />
        </div>
      </section>

      {(packetLoading || packetError) && (
        <div className="m-card" style={DP.notice}>
          {packetLoading ? "Loading the persisted packet payload..." : `Packet metadata is available, but the persisted payload could not be loaded (${packetError}).`}
        </div>
      )}

      <section style={DP.grid}>
        <div className="m-card" style={DP.panel}>
          <div className="mono" style={DP.panelEyebrow}>NEXT SUGGESTED CALLS</div>
          <h2 style={DP.panelTitle}>Continue the deal from here</h2>
          <div style={DP.stack}>
            {nextCalls.length ? nextCalls.slice(0, 6).map((call, index) => (
              <button
                key={`next-call-${index}`}
                type="button"
                className="m-state"
                style={DP.callRow}
                onClick={() => onTalkToYulia?.(`Use ${packetType} for ${dealTitle}. Prepare or run the next suggested call: ${summarizePacketValue(call)}. Preserve THE LINE and tell me what information is still missing.`)}
              >
                <span style={DP.callIndex}>{String(index + 1).padStart(2, "0")}</span>
                <span style={DP.callText}>
                  <strong>{packetCallTitle(call)}</strong>
                  <span>{summarizePacketValue(call)}</span>
                </span>
              </button>
            )) : (
              <div style={DP.empty}>No next call was persisted on this packet. Ask Yulia to infer the next gate from DealState.</div>
            )}
          </div>
        </div>

        <div className="m-card" style={DP.panel}>
          <div className="mono" style={DP.panelEyebrow}>TAKE-BACK ARTIFACTS</div>
          <h2 style={DP.panelTitle}>What another agent can carry out</h2>
          <div style={DP.stack}>
            {artifacts.length ? artifacts.slice(0, 6).map((artifact, index) => (
              <button
                key={`artifact-${index}`}
                type="button"
                className="m-state"
                style={DP.artifactRow}
                onClick={() => onTalkToYulia?.(`Explain this take-back artifact from ${packetType} for ${dealTitle}: ${summarizePacketValue(artifact)}`)}
              >
                <strong>{packetArtifactTitle(artifact, index)}</strong>
                <span>{summarizePacketValue(artifact)}</span>
              </button>
            )) : (
              <div style={DP.empty}>No separate artifacts were persisted. The packet identity and payload still remain reusable.</div>
            )}
          </div>
        </div>
      </section>

      <section className="m-card" style={DP.panel}>
        <div className="mono" style={DP.panelEyebrow}>PAYLOAD READ</div>
        <h2 style={DP.panelTitle}>State carried by this packet</h2>
        <div style={DP.payloadGrid}>
          {payloadRows.length ? payloadRows.map(row => (
            <div key={row.label} style={DP.payloadItem}>
              <strong>{row.label}</strong>
              <span>{row.value}</span>
            </div>
          )) : (
            <div style={DP.empty}>{markdown || "Only packet metadata is available in this view."}</div>
          )}
        </div>
      </section>

      {markdown && (
        <details style={DP.rawDetails}>
          <summary style={DP.rawSummary}>Packet opening note</summary>
          <div className="m-card" style={A.markdownCard}>
            <Markdown>{markdown}</Markdown>
          </div>
        </details>
      )}
    </div>
  );
}

function PacketDatum({ label, value }: { label: string; value: string }) {
  return (
    <div style={DP.identityRow}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function numericMaybe(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function textMaybe(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function arrayMaybe(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

function labelFromCode(input: string): string {
  return input
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

function shortHash(value: string): string {
  if (!value || value === "pending") return value;
  if (value.length <= 18) return value;
  return `${value.slice(0, 10)}...${value.slice(-6)}`;
}

function packetCallTitle(call: any): string {
  const raw = call?.toolName || call?.tool || call?.name || call?.action || call?.type || "Next call";
  return labelFromCode(String(raw));
}

function packetArtifactTitle(artifact: any, index: number): string {
  const raw = artifact?.title || artifact?.name || artifact?.type || artifact?.schema || `Artifact ${index + 1}`;
  return labelFromCode(String(raw));
}

function summarizePacketPayload(payload: Record<string, any>): Array<{ label: string; value: string }> {
  return Object.entries(payload || {})
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .slice(0, 12)
    .map(([key, value]) => ({
      label: labelFromCode(key),
      value: summarizePacketValue(value),
    }));
}

function summarizePacketValue(value: any): string {
  if (value === null || value === undefined) return "None";
  if (typeof value === "string") return value.length > 220 ? `${value.slice(0, 217)}...` : value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    if (!value.length) return "Empty";
    const preview = value.slice(0, 3).map(item => summarizePacketValue(item)).join("; ");
    return value.length > 3 ? `${preview}; +${value.length - 3} more` : preview;
  }
  if (typeof value === "object") {
    const record = value as Record<string, any>;
    const preferred = record.title || record.name || record.label || record.summary || record.description || record.toolName || record.type || record.schema;
    if (preferred) return summarizePacketValue(preferred);
    const entries = Object.entries(record).slice(0, 4).map(([key, entryValue]) => `${labelFromCode(key)}: ${summarizePacketValue(entryValue)}`);
    return entries.join("; ") || "Object";
  }
  return String(value);
}

function ArtifactCanvas({
  title,
  markdown,
  artifactData,
  onTalkToYulia,
}: {
  title: string;
  markdown?: string;
  artifactData?: Record<string, any>;
  onTalkToYulia?: (prompt: string) => void;
}) {
  const visual = buildVisualArtifact(title, markdown, artifactData);
  const providerMetrics = buildArtifactMetrics(artifactData);
  const metrics = dedupeArtifactMetrics([...visual.metrics, ...providerMetrics]).slice(0, 5);
  const providerSections = buildArtifactSections(artifactData);
  const sections = visual.sections.length ? visual.sections : providerSections.map(section => ({
    title: section.title,
    eyebrow: section.eyebrow,
    summary: section.rows.map(row => [row.label, row.sub].filter(Boolean).join(": ")).join(" "),
    bullets: section.rows.map(row => [row.label, row.sub].filter(Boolean).join(" - ")),
    table: null,
    tone: "neutral" as AnalysisTone,
  }));
  const bridgeTable = visual.bridgeTable ?? visual.tables[0] ?? null;
  const firstSignal = sections[0]?.summary || visual.deckline || "Yulia opened this as a canvas artifact. The board will become more structured as the analysis includes facts, tables, and model outputs.";
  const hasPayload = hasVisualArtifactPayload(visual, markdown, providerSections.length);
  if (!hasPayload) {
    return (
      <ArtifactNeedsPayload
        title={visual.title}
        onTalkToYulia={onTalkToYulia}
      />
    );
  }

  return (
    <div className="m-fade-up m-page-flow" style={IA.shell}>
      <section style={IA.hero}>
        <div style={IA.heroCopy}>
          <div className="mono" style={IA.eyebrow}>INVESTMENT BOARD · YULIA ARTIFACT</div>
          <h1 style={IA.title}>{visual.title}</h1>
          <p style={IA.deckline}>{visual.deckline}</p>
        </div>

        <div style={IA.decisionPanel}>
          <div className="mono" style={IA.decisionLabel}>DECISION SIGNAL</div>
          <div style={{ ...IA.decisionValue, color: visual.verdictTone === "pass" ? "var(--m-pass)" : visual.verdictTone === "watch" ? "#8A6311" : "var(--m-pursue)" }}>
            {visual.verdict}
          </div>
          <div style={IA.decisionSub}>{firstSignal}</div>
          <button
            className="m-btn filled"
            type="button"
            style={IA.heroAction}
            onClick={() => onTalkToYulia?.(`Use the open ${visual.title} investment board. Turn it into a structured interactive analysis with editable assumptions, charts, evidence, and next actions.`)}
          >
            Ask Yulia to model it
          </button>
        </div>
      </section>

      {metrics.length > 0 && (
        <section style={IA.metricStrip} aria-label="Investment metrics">
          {metrics.map(metric => (
            <ArtifactMetricTile key={metric.label} metric={metric} />
          ))}
        </section>
      )}

      <div style={IA.boardGrid}>
        <div className="m-card" style={IA.bridgePanel}>
          <div style={IA.panelHeader}>
            <div>
              <div className="mono" style={IA.panelEyebrow}>{bridgeTable ? "MODEL BRIDGE" : "ANALYSIS READ"}</div>
              <h2 style={IA.panelTitle}>{bridgeTable?.title || "Yulia read"}</h2>
            </div>
            {bridgeTable && <div className="mono" style={IA.tableCount}>{bridgeTable.rows.length} LINES</div>}
          </div>
          {bridgeTable ? (
            <ArtifactBridge table={bridgeTable} />
          ) : (
            <p style={IA.emptyRead}>{visual.deckline}</p>
          )}
        </div>

        <aside className="m-card" style={IA.signalPanel}>
          <div className="mono" style={IA.panelEyebrow}>BOARD READ</div>
          <h2 style={IA.panelTitle}>What matters now</h2>
          <div style={IA.signalStack}>
            {sections.slice(0, 4).map(section => (
              <button
                key={section.title}
                type="button"
                className="m-state"
                style={IA.signalRow}
                onClick={() => onTalkToYulia?.(`Work from the ${section.title} section on the open ${visual.title} board. Tell me the decision, evidence, and next action.`)}
              >
                <span style={{ ...IA.signalDot, background: toneAccent(section.tone) }} />
                <span style={IA.signalText}>
                  <strong>{section.title}</strong>
                  <span>{section.summary || section.bullets[0] || "No summary available yet."}</span>
                </span>
              </button>
            ))}
          </div>
        </aside>
      </div>

      {sections.length > 0 && (
        <section style={IA.sectionGrid} aria-label="Analysis sections">
          {sections.slice(0, 6).map(section => (
            <ArtifactSectionCard key={section.title} section={section} />
          ))}
        </section>
      )}

      {markdown && (
        <details style={IA.rawDetails}>
          <summary style={IA.rawSummary}>Original Yulia text</summary>
          <div className="m-card" style={A.markdownCard}>
            <Markdown>{markdown}</Markdown>
          </div>
        </details>
      )}
    </div>
  );
}

function ArtifactNeedsPayload({
  title,
  onTalkToYulia,
}: {
  title: string;
  onTalkToYulia?: (prompt: string) => void;
}) {
  const cleanTitle = /loading into the model/i.test(title) ? "Investment board" : title;
  return (
    <div className="m-fade-up m-page-flow" style={IA.shell}>
      <section className="m-card" style={IA.needsPayload}>
        <div className="mono" style={IA.eyebrow}>CANVAS ARTIFACT · NEEDS DATA</div>
        <h1 style={IA.title}>{cleanTitle}</h1>
        <p style={IA.deckline}>
          This tab opened without the actual analysis payload, so I am not going to fake a board with empty cards. Rerun the analysis and Yulia should send the full table, metrics, risks, and recommendations into this canvas.
        </p>
        <div style={IA.needsPayloadActions}>
          <button
            className="m-btn filled"
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("smbx:canvas_action", {
                  detail: { canvas_action: "open_tab", tab: buildBigFakeInvestmentBoardTab() },
                }));
              } else {
                onTalkToYulia?.("Run the most useful market, tax/legal, buyer, valuation, and risk analysis for the highest-priority deal. Open it as a data-rich investment-board canvas with metrics, charts, a recast/valuation bridge, risk tiles, and next actions. Do not answer as a prose wall in chat.");
              }
            }}
          >
            Rebuild board
          </button>
        </div>
      </section>
    </div>
  );
}

interface ArtifactMetric {
  label: string;
  value: string;
  sub?: string;
  tone?: AnalysisTone;
}

interface ArtifactTable {
  title: string;
  headers: string[];
  rows: string[][];
}

interface ArtifactSection {
  eyebrow: string;
  title: string;
  summary: string;
  bullets: string[];
  table: ArtifactTable | null;
  tone: AnalysisTone;
}

interface VisualArtifact {
  title: string;
  deckline: string;
  verdict: string;
  verdictTone: AnalysisTone;
  metrics: ArtifactMetric[];
  tables: ArtifactTable[];
  bridgeTable: ArtifactTable | null;
  sections: ArtifactSection[];
}

function hasVisualArtifactPayload(visual: VisualArtifact, markdown?: string, providerSectionCount = 0): boolean {
  const text = markdown?.trim() ?? "";
  const usefulMetrics = visual.metrics.filter(metric => metric.label !== "Verdict" || metric.value !== "REVIEW");
  return visual.tables.length > 0
    || visual.sections.length > 1
    || usefulMetrics.length > 1
    || providerSectionCount > 0
    || (text.length > 700 && countVisualSignals(text) >= 4);
}

function countVisualSignals(text: string): number {
  return [
    /\$[\d,.]+/i,
    /\b\d+(?:\.\d+)?%/,
    /\b\d+(?:\.\d+)?x\b/i,
    /\bSDE\b/i,
    /\bEBITDA\b/i,
    /\bvaluation\b/i,
    /\brisk\b/i,
    /\bbuyer\b/i,
  ].reduce((sum, pattern) => sum + (pattern.test(text) ? 1 : 0), 0);
}

function ArtifactMetricTile({ metric }: { metric: ArtifactMetric }) {
  const tone = metric.tone ?? "neutral";
  return (
    <div style={{ ...IA.metricTile, borderColor: toneBorder(tone), background: tone === "neutral" ? "rgba(255,255,255,0.72)" : toneBg(tone) }}>
      <div className="mono" style={IA.metricLabel}>{metric.label}</div>
      <div style={{ ...IA.metricValue, color: tone === "neutral" ? "var(--m-on-surface)" : toneFg(tone) }}>{metric.value}</div>
      {metric.sub && <div style={{ ...IA.metricSub, color: tone === "neutral" ? "var(--m-on-surface-var)" : toneFg(tone) }}>{metric.sub}</div>}
    </div>
  );
}

function ArtifactBridge({ table }: { table: ArtifactTable }) {
  const rows = table.rows.slice(0, 9);
  const amounts = rows.map(row => numericAmount(row[1] ?? row[row.length - 1]));
  const max = Math.max(1, ...amounts.map(amount => Math.abs(amount ?? 0)));
  return (
    <div style={IA.bridgeRows}>
      {rows.map((row, index) => {
        const label = row[0] || `Line ${index + 1}`;
        const amount = row[1] ?? row[row.length - 1] ?? "";
        const parsed = numericAmount(amount);
        const isTotal = /\b(normalized|adjusted|total|range|asking|ebitda|sde)\b/i.test(label) || /\*\*/.test(amount);
        const width = parsed == null ? 16 : Math.max(6, Math.min(100, Math.abs(parsed) / max * 100));
        const tone: AnalysisTone = isTotal ? "pursue" : parsed && parsed < 0 ? "pass" : parsed && parsed > 0 ? "watch" : "neutral";
        return (
          <div key={`${label}-${index}`} style={IA.bridgeRow}>
            <div style={IA.bridgeLabel}>
              <span>{cleanMarkdownCell(label)}</span>
              <strong>{cleanMarkdownCell(amount)}</strong>
            </div>
            <div style={IA.bridgeTrack}>
              <div style={{ ...IA.bridgeFill, width: `${width}%`, background: toneAccent(tone), opacity: isTotal ? 1 : 0.72 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ArtifactSectionCard({ section }: { section: ArtifactSection }) {
  return (
    <article className="m-card" style={{ ...IA.sectionCard, borderColor: toneBorder(section.tone) }}>
      <div className="mono" style={IA.sectionEyebrow}>{section.eyebrow}</div>
      <h3 style={IA.sectionTitle}>{section.title}</h3>
      {section.summary && <p style={IA.sectionSummary}>{section.summary}</p>}
      {section.bullets.length > 0 && (
        <div style={IA.bulletStack}>
          {section.bullets.slice(0, 3).map((bullet, index) => (
            <div key={`${section.title}-${index}`} style={IA.bulletRow}>
              <span style={{ ...IA.signalDot, background: toneAccent(section.tone) }} />
              <span>{bullet}</span>
            </div>
          ))}
        </div>
      )}
      {section.table && <ArtifactMiniTable table={section.table} />}
    </article>
  );
}

function ArtifactMiniTable({ table }: { table: ArtifactTable }) {
  return (
    <div style={IA.miniTableWrap}>
      <table style={IA.miniTable}>
        <tbody>
          {table.rows.slice(0, 5).map((row, rowIndex) => (
            <tr key={`${table.title}-${rowIndex}`}>
              <td style={IA.miniTd}>{cleanMarkdownCell(row[0] ?? "")}</td>
              <td style={{ ...IA.miniTd, ...IA.miniValue }}>{cleanMarkdownCell(row[1] ?? row[row.length - 1] ?? "")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function buildArtifactMetrics(data?: Record<string, any>): Array<{ label: string; value: string; sub?: string }> {
  if (!data) return [];
  const rows: Array<{ label: string; value: string; sub?: string }> = [];
  if (typeof data.demandSignal === "string") rows.push({ label: "Demand", value: data.demandSignal, sub: "Market heat" });
  if (Number.isFinite(Number(data.matchingThesesCount))) rows.push({ label: "Matches", value: String(data.matchingThesesCount), sub: "Buyer theses" });
  if (Array.isArray(data.neededTypes)) rows.push({ label: "Needs", value: String(data.neededTypes.length), sub: "Professional types" });
  if (data.recommendations && typeof data.recommendations === "object") {
    const total = Object.values(data.recommendations).reduce<number>(
      (sum, value) => sum + (Array.isArray(value) ? value.length : 0),
      0,
    );
    rows.push({ label: "Providers", value: String(total), sub: "Recommended matches" });
  }
  if (Array.isArray(data.providers)) rows.push({ label: "Providers", value: String(data.providers.length), sub: data.state ? `State: ${data.state}` : "Search results" });
  return rows.slice(0, 4);
}

function buildArtifactSections(data?: Record<string, any>): Array<{
  eyebrow: string;
  title: string;
  rows: Array<{ label: string; sub?: string; badge?: string }>;
}> {
  if (!data) return [];
  const sections: Array<{ eyebrow: string; title: string; rows: Array<{ label: string; sub?: string; badge?: string }> }> = [];
  if (data.recommendations && typeof data.recommendations === "object") {
    Object.entries(data.recommendations).forEach(([kind, value]) => {
      if (!Array.isArray(value) || value.length === 0) return;
      sections.push({
        eyebrow: "RECOMMENDATIONS",
        title: kind.replace(/_/g, " "),
        rows: value.slice(0, 5).map((item: any) => ({
          label: item.name || item.firm_name || "Provider",
          sub: [item.firm_name, item.location_city, item.location_state].filter(Boolean).join(" · "),
          badge: item.client_rating ? `${item.client_rating}/5` : undefined,
        })),
      });
    });
  }
  if (Array.isArray(data.providers) && data.providers.length) {
    sections.push({
      eyebrow: "SEARCH RESULTS",
      title: "Providers",
      rows: data.providers.slice(0, 6).map((item: any) => ({
        label: item.name || item.firm_name || "Provider",
        sub: [item.firm_name, item.location_city, item.location_state, item.practice_areas?.join?.(", ")].filter(Boolean).join(" · "),
        badge: item.client_rating ? `${item.client_rating}/5` : undefined,
      })),
    });
  }
  if (Array.isArray(data.neededTypes) && data.neededTypes.length) {
    sections.push({
      eyebrow: "NEXT COVERAGE",
      title: "Professional gaps",
      rows: data.neededTypes.map((item: any) => ({
        label: String(item),
        sub: "Yulia can stage outreach or review requests from here.",
      })),
    });
  }
  return sections.slice(0, 4);
}

function buildVisualArtifact(title: string, markdown?: string, data?: Record<string, any>): VisualArtifact {
  const text = markdown?.trim() ?? "";
  const parsedSections = parseMarkdownSections(text);
  const tables = parsedSections.flatMap(section => section.tables);
  const bridgeTable = tables.find(table =>
    /recast|valuation|sde|ebitda|line item/i.test(`${table.title} ${table.headers.join(" ")}`),
  ) ?? null;
  const metrics = buildMarkdownMetrics(text, data);
  const sections = parsedSections
    .filter(section => !/full\s+analysis\s+canvas/i.test(section.title))
    .filter(section => section.summary || section.bullets.length || section.tables.length)
    .map(section => ({
      eyebrow: section.eyebrow,
      title: section.title,
      summary: section.summary,
      bullets: section.bullets,
      table: section.tables[0] ?? null,
      tone: inferSectionTone(section.title, `${section.summary} ${section.bullets.join(" ")}`),
    }));
  const verdict = inferVerdict(text);
  return {
    title: cleanArtifactTitle(title || parsedSections[0]?.title || "Yulia analysis"),
    deckline: inferDeckline(text, parsedSections),
    verdict: verdict.label,
    verdictTone: verdict.tone,
    metrics,
    tables,
    bridgeTable,
    sections,
  };
}

function buildMarkdownMetrics(markdown: string, data?: Record<string, any>): ArtifactMetric[] {
  const rows: ArtifactMetric[] = [];
  const verdict = inferVerdict(markdown);
  rows.push({ label: "Verdict", value: verdict.label, sub: verdict.sub, tone: verdict.tone });

  const fit = markdown.match(/\bFIT\s+score\s+(\d{1,3})\b/i)?.[1] ?? markdown.match(/\bscore\s+(\d{1,3})\b/i)?.[1];
  if (fit) rows.push({ label: "Fit score", value: fit, sub: "Deal quality signal", tone: Number(fit) >= 85 ? "pursue" : Number(fit) >= 70 ? "watch" : "pass" });

  const sde = valueAfterLabel(markdown, /normalized\s+sde|reported\s+sde|sde/i);
  if (sde) rows.push({ label: "SDE", value: sde, sub: "Normalized cash earnings", tone: "pursue" });

  const ebitda = valueAfterLabel(markdown, /adjusted\s+ebitda|ebitda/i);
  if (ebitda) rows.push({ label: "EBITDA", value: ebitda, sub: "Adjusted run-rate", tone: "pursue" });

  const valuation = markdown.match(/valuation\s+range[^:\n]*:\s*([^\n]+)/i)?.[1];
  if (valuation) rows.push({ label: "Valuation range", value: cleanMarkdownCell(valuation), sub: "Board range", tone: "watch" });

  const asking = markdown.match(/asking\s+price[^:\n]*:\s*([^\n]+)/i)?.[1] ?? markdown.match(/(\$[\d,.]+\s*[-–]\s*\$?[\d,.]+M)\s+ask/i)?.[1];
  if (asking) rows.push({ label: "Ask", value: cleanMarkdownCell(asking), sub: "Seller price", tone: "watch" });

  if (typeof data?.demandSignal === "string") rows.push({ label: "Demand", value: data.demandSignal, sub: "Buyer heat", tone: "neutral" });
  return dedupeArtifactMetrics(rows);
}

function dedupeArtifactMetrics(metrics: ArtifactMetric[]): ArtifactMetric[] {
  const seen = new Set<string>();
  return metrics.filter(metric => {
    const key = metric.label.toLowerCase();
    if (!metric.value || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseMarkdownSections(markdown: string): Array<{
  eyebrow: string;
  title: string;
  summary: string;
  bullets: string[];
  tables: ArtifactTable[];
}> {
  if (!markdown.trim()) return [];
  const rawSections: Array<{ title: string; lines: string[] }> = [];
  let current: { title: string; lines: string[] } = { title: "Executive read", lines: [] };

  markdown.split(/\r?\n/).forEach(line => {
    const heading = line.match(/^#{2,4}\s+(.+?)\s*$/);
    if (heading) {
      if (current.lines.some(item => item.trim())) rawSections.push(current);
      current = { title: cleanSectionTitle(heading[1]), lines: [] };
      return;
    }
    current.lines.push(line);
  });
  if (current.lines.some(item => item.trim())) rawSections.push(current);

  return rawSections.map(section => {
    const tables = extractMarkdownTables(section.title, section.lines);
    const bodyLines = stripTableLines(section.lines)
      .map(line => line.trim())
      .filter(line => line && line !== "---" && !/^[-*_]{3,}$/.test(line));
    const body = bodyLines.join("\n").replace(/\n{2,}/g, "\n");
    const bullets = bodyLines
      .filter(line => /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line))
      .map(line => cleanMarkdownCell(line.replace(/^[-*]\s+|^\d+\.\s+/, "")))
      .filter(Boolean);
    const prose = bodyLines
      .filter(line => !/^[-*]\s+/.test(line) && !/^\d+\.\s+/.test(line))
      .map(cleanMarkdownCell)
      .filter(Boolean);
    return {
      eyebrow: sectionEyebrow(section.title),
      title: section.title,
      summary: summarizeText(prose.join(" ")),
      bullets: bullets.length ? bullets : prose.slice(1, 4).map(summarizeText).filter(Boolean),
      tables,
    };
  });
}

function extractMarkdownTables(sectionTitle: string, lines: string[]): ArtifactTable[] {
  const tables: ArtifactTable[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    const next = lines[index + 1];
    if (!isTableRow(line) || !isMarkdownSeparator(next)) {
      index += 1;
      continue;
    }
    const headers = splitTableRow(line);
    const rows: string[][] = [];
    index += 2;
    while (index < lines.length && isTableRow(lines[index])) {
      rows.push(splitTableRow(lines[index]));
      index += 1;
    }
    if (headers.length && rows.length) tables.push({ title: sectionTitle, headers, rows });
  }
  return tables;
}

function stripTableLines(lines: string[]): string[] {
  const stripped: string[] = [];
  let inTable = false;
  lines.forEach((line, index) => {
    const startsTable = isTableRow(line) && isMarkdownSeparator(lines[index + 1]);
    if (startsTable) {
      inTable = true;
      return;
    }
    if (inTable && (isTableRow(line) || isMarkdownSeparator(line))) return;
    inTable = false;
    stripped.push(line);
  });
  return stripped;
}

function isTableRow(line?: string): boolean {
  return Boolean(line && line.includes("|") && line.trim().startsWith("|"));
}

function isMarkdownSeparator(line?: string): boolean {
  return Boolean(line && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line));
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map(cleanMarkdownCell)
    .filter((cell, index, arr) => cell || index < arr.length - 1);
}

function inferVerdict(markdown: string): { label: string; tone: AnalysisTone; sub: string } {
  if (/\bPASS\b/i.test(markdown)) return { label: "PASS", tone: "pass", sub: "Do not pursue without a reset." };
  if (/\bWATCH\b/i.test(markdown)) return { label: "WATCH", tone: "watch", sub: "Proceed only with tighter evidence." };
  if (/\bPURSUE\b/i.test(markdown)) return { label: "PURSUE", tone: "pursue", sub: "Priority deal, subject to diligence." };
  if (/\bclear|healthy|strong|priced at market/i.test(markdown)) return { label: "PURSUE", tone: "pursue", sub: "Positive signal with diligence caveats." };
  return { label: "REVIEW", tone: "watch", sub: "Needs a model-backed decision." };
}

function inferDeckline(markdown: string, sections: Array<{ summary: string }>): string {
  const firstSentence = summarizeText(markdown
    .split(/\r?\n/)
    .map(cleanMarkdownCell)
    .find(line => line && !line.startsWith("|") && !/^#{1,4}/.test(line) && line !== "---") ?? "");
  return firstSentence || sections.find(section => section.summary)?.summary || "Visual board generated from Yulia's analysis.";
}

function inferSectionTone(title: string, content: string): AnalysisTone {
  const combined = `${title} ${content}`;
  if (/risk|legal|tax|gap|attack|push back|concern|red flag|pass/i.test(combined)) return "pass";
  if (/market|valuation|watch|range|priced|scenario|diligence/i.test(combined)) return "watch";
  if (/pursue|clear|fit|buyer|strong|healthy|demand/i.test(combined)) return "pursue";
  return "neutral";
}

function valueAfterLabel(markdown: string, labelPattern: RegExp): string | null {
  const tableLine = markdown
    .split(/\r?\n/)
    .find(line => labelPattern.test(line) && line.includes("|"));
  if (tableLine) {
    const cells = splitTableRow(tableLine);
    const value = cells.find((cell, index) => index > 0 && /[$\d]/.test(cell));
    if (value) return cleanMarkdownCell(value);
  }
  const proseMatch = markdown.match(new RegExp(`(?:${labelPattern.source})[^\\n$]*(\\$[\\d,.]+\\s*(?:K|M|B|MM|million|billion)?)`, "i"));
  return proseMatch?.[1] ? cleanMarkdownCell(proseMatch[1]) : null;
}

function numericAmount(value: string): number | null {
  const cleaned = cleanMarkdownCell(value);
  const match = cleaned.match(/([+-])?\s*\$?([\d,.]+)\s*(K|M|B|MM|million|billion)?/i);
  if (!match) return null;
  const sign = match[1] === "-" ? -1 : 1;
  const raw = Number(match[2].replace(/,/g, ""));
  if (!Number.isFinite(raw)) return null;
  const unit = match[3]?.toLowerCase();
  const scale = unit === "k" ? 0.001 : unit === "b" || unit === "billion" ? 1000 : 1;
  return sign * raw * scale;
}

function cleanSectionTitle(value: string): string {
  return cleanMarkdownCell(value)
    .replace(/^\d+\s*[.·-]\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanArtifactTitle(value: string): string {
  return cleanMarkdownCell(value)
    .replace(/\bfull\s+analysis\s+canvas\b/ig, "")
    .replace(/\s*[-–—·]\s*$/g, "")
    .trim() || "Yulia analysis";
}

function cleanMarkdownCell(value: string): string {
  return String(value ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function summarizeText(value: string): string {
  const cleaned = cleanMarkdownCell(value);
  if (!cleaned) return "";
  const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [cleaned];
  return sentences.slice(0, 2).join(" ").trim();
}

function sectionEyebrow(title: string): string {
  if (/valuation|recast|sde|ebitda/i.test(title)) return "QUALITY OF EARNINGS";
  if (/buyer|demand|market/i.test(title)) return "MARKET SIGNAL";
  if (/tax|legal/i.test(title)) return "GOVERNANCE";
  if (/risk/i.test(title)) return "RISK REGISTER";
  if (/next|action|recommend/i.test(title)) return "NEXT MOVE";
  return "ANALYSIS BLOCK";
}

const DP: Record<string, CSSProperties> = {
  shell: {
    width: "min(100%, 1440px)",
    maxWidth: 1440,
    margin: "0 auto",
    boxSizing: "border-box",
  },
  hero: {
    padding: 28,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 22,
    alignItems: "stretch",
    background: "linear-gradient(135deg, rgba(247,250,255,0.92), rgba(232,239,250,0.78))",
  },
  heroCopy: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 16,
    minWidth: 0,
  },
  eyebrow: {
    fontSize: 9.5,
    letterSpacing: "0.15em",
    fontWeight: 900,
    color: "var(--m-on-surface-mid)",
  },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(30px, 4.5vw, 58px)",
    lineHeight: 0.95,
    letterSpacing: 0,
    color: "var(--m-on-surface)",
    margin: "8px 0 0",
  },
  deckline: {
    maxWidth: 820,
    margin: 0,
    color: "var(--m-on-surface-var)",
    fontSize: 15,
    lineHeight: 1.5,
  },
  actions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  identityCard: {
    display: "grid",
    gap: 8,
    alignContent: "start",
    padding: 16,
    borderRadius: 20,
    border: "1px solid rgba(121,142,170,0.22)",
    background: "rgba(255,255,255,0.66)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.78)",
    minWidth: 0,
  },
  identityRow: {
    display: "grid",
    gap: 3,
    padding: "8px 0",
    borderBottom: "1px solid rgba(121,142,170,0.14)",
    minWidth: 0,
  },
  notice: {
    padding: "14px 16px",
    color: "var(--m-on-surface-var)",
    fontSize: 13,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 16,
    alignItems: "stretch",
  },
  panel: {
    padding: 22,
    minWidth: 0,
  },
  panelEyebrow: {
    fontSize: 9.5,
    letterSpacing: "0.14em",
    fontWeight: 900,
    color: "var(--m-on-surface-mid)",
  },
  panelTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 26,
    lineHeight: 1,
    letterSpacing: 0,
    color: "var(--m-on-surface)",
    margin: "5px 0 16px",
  },
  stack: {
    display: "grid",
    gap: 10,
  },
  callRow: {
    all: "unset",
    cursor: "pointer",
    display: "grid",
    gridTemplateColumns: "44px minmax(0, 1fr)",
    gap: 12,
    alignItems: "start",
    padding: 14,
    borderRadius: 18,
    border: "1px solid rgba(121,142,170,0.18)",
    background: "linear-gradient(145deg, rgba(255,255,255,0.84), rgba(241,246,252,0.70))",
  },
  callIndex: {
    width: 40,
    height: 40,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    fontSize: 11,
    fontWeight: 900,
    color: "#3C5F96",
    background: "rgba(222,232,249,0.9)",
  },
  callText: {
    display: "grid",
    gap: 4,
    color: "var(--m-on-surface-var)",
    fontSize: 12.5,
    lineHeight: 1.4,
    minWidth: 0,
  },
  artifactRow: {
    all: "unset",
    cursor: "pointer",
    display: "grid",
    gap: 5,
    padding: 14,
    borderRadius: 18,
    border: "1px solid rgba(121,142,170,0.18)",
    background: "rgba(255,255,255,0.74)",
    color: "var(--m-on-surface-var)",
    fontSize: 12.5,
    lineHeight: 1.4,
  },
  empty: {
    padding: 14,
    borderRadius: 18,
    background: "rgba(244,247,251,0.82)",
    color: "var(--m-on-surface-var)",
    fontSize: 13,
    lineHeight: 1.45,
  },
  payloadGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 10,
  },
  payloadItem: {
    display: "grid",
    gap: 5,
    padding: 14,
    borderRadius: 18,
    border: "1px solid rgba(121,142,170,0.16)",
    background: "rgba(255,255,255,0.72)",
    color: "var(--m-on-surface-var)",
    fontSize: 12.5,
    lineHeight: 1.4,
  },
  rawDetails: {
    marginTop: 2,
  },
  rawSummary: {
    cursor: "pointer",
    color: "var(--m-on-surface-var)",
    fontSize: 13,
    fontWeight: 800,
  },
};

const IA: Record<string, CSSProperties> = {
  shell: {
    maxWidth: 1360,
  },
  needsPayload: {
    padding: "34px 38px",
    maxWidth: 780,
    background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(242,247,252,0.9))",
    borderColor: "rgba(184, 205, 226, 0.84)",
    boxShadow: "var(--m-elev-2)",
  },
  needsPayloadActions: {
    marginTop: 22,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 22,
    alignItems: "stretch",
    marginBottom: 16,
  },
  heroCopy: {
    padding: "6px 0 0",
  },
  eyebrow: {
    fontSize: 9.5,
    letterSpacing: "0.16em",
    fontWeight: 900,
    color: "var(--m-on-surface-mid)",
  },
  title: {
    fontFamily: "var(--font-display)",
    fontWeight: 900,
    fontSize: 38,
    lineHeight: 1.03,
    letterSpacing: "-0.025em",
    margin: "7px 0 0",
    color: "var(--m-on-surface)",
    textWrap: "balance",
  },
  deckline: {
    margin: "12px 0 0",
    maxWidth: 780,
    fontSize: 15.5,
    lineHeight: 1.5,
    color: "var(--m-on-surface-var)",
  },
  decisionPanel: {
    padding: "20px 22px",
    borderRadius: 18,
    border: "1px solid rgba(184, 205, 226, 0.84)",
    background: "linear-gradient(145deg, rgba(255,255,255,0.92), rgba(238,246,251,0.84))",
    boxShadow: "var(--m-elev-2)",
  },
  decisionLabel: {
    fontSize: 9,
    letterSpacing: "0.15em",
    fontWeight: 900,
    color: "var(--m-on-surface-mid)",
  },
  decisionValue: {
    marginTop: 8,
    fontFamily: "var(--font-display)",
    fontSize: 34,
    lineHeight: 1,
    fontWeight: 950,
    letterSpacing: "-0.02em",
  },
  decisionSub: {
    marginTop: 10,
    fontSize: 12.5,
    lineHeight: 1.45,
    color: "var(--m-on-surface-var)",
  },
  heroAction: {
    marginTop: 16,
    width: "100%",
    justifyContent: "center",
  },
  metricStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(148px, 1fr))",
    gap: 10,
    marginBottom: 16,
  },
  metricTile: {
    minHeight: 102,
    padding: "14px 15px",
    borderRadius: 14,
    border: "1px solid rgba(169, 190, 212, 0.7)",
    boxSizing: "border-box",
  },
  metricLabel: {
    fontSize: 8.5,
    letterSpacing: "0.13em",
    fontWeight: 900,
    color: "var(--m-on-surface-mid)",
    textTransform: "uppercase",
  },
  metricValue: {
    marginTop: 8,
    fontFamily: "var(--font-display)",
    fontSize: 25,
    lineHeight: 1.03,
    fontWeight: 950,
    letterSpacing: "-0.02em",
    fontVariantNumeric: "tabular-nums",
  },
  metricSub: {
    marginTop: 7,
    fontSize: 11.5,
    lineHeight: 1.32,
  },
  boardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 16,
    alignItems: "stretch",
    marginBottom: 16,
  },
  bridgePanel: {
    padding: "22px 24px",
    background: "rgba(255,255,255,0.82)",
  },
  signalPanel: {
    padding: "22px",
    background: "rgba(248,251,255,0.82)",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
    marginBottom: 18,
  },
  panelEyebrow: {
    fontSize: 9,
    letterSpacing: "0.15em",
    fontWeight: 900,
    color: "var(--m-on-surface-mid)",
  },
  panelTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 20,
    fontWeight: 900,
    letterSpacing: "-0.02em",
    margin: "5px 0 0",
    color: "var(--m-on-surface)",
  },
  tableCount: {
    padding: "6px 8px",
    borderRadius: 999,
    background: "rgba(230, 240, 249, 0.9)",
    color: "var(--m-on-surface-mid)",
    fontSize: 9,
    letterSpacing: "0.12em",
    fontWeight: 900,
  },
  bridgeRows: {
    display: "grid",
    gap: 13,
  },
  bridgeRow: {
    display: "grid",
    gap: 7,
  },
  bridgeLabel: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    fontSize: 12.5,
    color: "var(--m-on-surface-var)",
  },
  bridgeTrack: {
    height: 13,
    borderRadius: 999,
    background: "rgba(221, 232, 243, 0.9)",
    overflow: "hidden",
  },
  bridgeFill: {
    height: "100%",
    minWidth: 4,
    borderRadius: 999,
  },
  emptyRead: {
    fontSize: 14,
    lineHeight: 1.55,
    color: "var(--m-on-surface-var)",
  },
  signalStack: {
    display: "grid",
    gap: 10,
    marginTop: 16,
  },
  signalRow: {
    all: "unset",
    display: "grid",
    gridTemplateColumns: "10px minmax(0, 1fr)",
    gap: 11,
    alignItems: "start",
    padding: "10px 0",
    borderBottom: "1px solid var(--m-outline-var)",
    cursor: "pointer",
  },
  signalDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    marginTop: 5,
    flexShrink: 0,
  },
  signalText: {
    display: "grid",
    gap: 3,
    fontSize: 12,
    lineHeight: 1.35,
    color: "var(--m-on-surface-var)",
  },
  sectionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 14,
    alignItems: "stretch",
    marginTop: 16,
  },
  sectionCard: {
    padding: "18px 20px",
    minHeight: 226,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    background: "rgba(255,255,255,0.76)",
  },
  sectionEyebrow: {
    fontSize: 8.5,
    letterSpacing: "0.14em",
    fontWeight: 900,
    color: "var(--m-on-surface-mid)",
  },
  sectionTitle: {
    margin: 0,
    fontFamily: "var(--font-display)",
    fontSize: 18,
    lineHeight: 1.12,
    fontWeight: 900,
    letterSpacing: "-0.02em",
    color: "var(--m-on-surface)",
  },
  sectionSummary: {
    margin: 0,
    fontSize: 12.5,
    lineHeight: 1.45,
    color: "var(--m-on-surface-var)",
  },
  bulletStack: {
    display: "grid",
    gap: 8,
    marginTop: 2,
  },
  bulletRow: {
    display: "grid",
    gridTemplateColumns: "9px minmax(0, 1fr)",
    gap: 9,
    alignItems: "start",
    fontSize: 11.8,
    lineHeight: 1.35,
    color: "var(--m-on-surface-var)",
  },
  miniTableWrap: {
    marginTop: "auto",
    paddingTop: 10,
    borderTop: "1px solid var(--m-outline-var)",
    overflowX: "auto",
  },
  miniTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 11.5,
  },
  miniTd: {
    padding: "6px 0",
    borderBottom: "1px solid rgba(186, 204, 221, 0.42)",
    color: "var(--m-on-surface-var)",
    verticalAlign: "top",
  },
  miniValue: {
    textAlign: "right",
    color: "var(--m-on-surface)",
    fontWeight: 850,
    fontVariantNumeric: "tabular-nums",
  },
  rawDetails: {
    marginTop: 18,
  },
  rawSummary: {
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 850,
    color: "var(--m-on-surface-mid)",
    marginBottom: 10,
  },
};

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
    <div className="m-fade-up m-page-flow" style={{ width: "min(100%, 1440px)", maxWidth: 1440, margin: "0 auto", boxSizing: "border-box" }}>
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
  analysisWorkbench: {
    display: "grid",
    gridTemplateColumns: "minmax(640px, 1fr) minmax(300px, 360px) minmax(220px, 280px)",
    gap: 18,
    alignItems: "start",
  },
  analysisMain: {
    minWidth: 0,
  },
  analysisControlRail: {
    position: "sticky",
    top: 16,
    display: "grid",
    gap: 12,
    maxHeight: "calc(100vh - 48px)",
    overflowY: "auto",
    paddingRight: 4,
  },
  analysisCompareRail: {
    position: "sticky",
    top: 16,
    maxHeight: "calc(100vh - 48px)",
    overflowY: "auto",
  },
  controlRailCard: {
    padding: "18px 20px",
    background: "linear-gradient(145deg, rgba(255,255,255,0.94), rgba(242,247,252,0.88))",
    borderColor: "rgba(181, 202, 222, 0.76)",
  },
  comparisonWorkspace: {
    display: "grid",
    gap: 16,
  },
  comparisonHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 18,
    padding: "24px 26px",
    borderRadius: 22,
    background: "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(238,246,252,0.88))",
    border: "1px solid rgba(181, 202, 222, 0.76)",
    boxShadow: "var(--m-elev-1)",
  },
  comparisonTitle: {
    margin: 0,
    fontFamily: "var(--font-display)",
    fontSize: 28,
    lineHeight: 1.08,
    fontWeight: 900,
    letterSpacing: "-0.025em",
    color: "var(--m-on-surface)",
  },
  comparisonSub: {
    margin: "8px 0 0",
    maxWidth: 680,
    fontSize: 13.5,
    lineHeight: 1.5,
    color: "var(--m-on-surface-var)",
  },
  comparisonColumns: {
    display: "grid",
    gap: 14,
    alignItems: "stretch",
  },
  compareDealPanel: {
    minWidth: 0,
    padding: "18px",
    borderRadius: 18,
    background: "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(246,250,254,0.84))",
    border: "1px solid rgba(181, 202, 222, 0.76)",
    boxShadow: "var(--m-elev-1)",
    display: "grid",
    gap: 13,
    cursor: "pointer",
  },
  compareDealPanelActive: {
    borderColor: "rgba(104, 157, 205, 0.92)",
    boxShadow: "0 18px 48px rgba(58, 98, 140, 0.14), inset 0 0 0 1px rgba(104, 157, 205, 0.52)",
  },
  compareDealTop: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
  },
  compareScore: {
    width: 44,
    height: 44,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    fontFamily: "var(--font-mono)",
    fontSize: 15,
    fontWeight: 900,
    fontVariantNumeric: "tabular-nums",
    flexShrink: 0,
  },
  compareDealName: {
    fontSize: 18,
    lineHeight: 1.12,
    fontWeight: 950,
    color: "var(--m-on-surface)",
    letterSpacing: "-0.018em",
  },
  compareDealMeta: {
    marginTop: 4,
    fontSize: 11.5,
    color: "var(--m-on-surface-var)",
    lineHeight: 1.35,
  },
  compareIconButton: {
    minWidth: 30,
    minHeight: 30,
    padding: "0 8px",
    borderRadius: 10,
    fontSize: 16,
    lineHeight: 1,
  },
  compareSelectButton: {
    all: "unset",
    minHeight: 34,
    padding: "0 11px",
    borderRadius: 12,
    background: "rgba(236, 243, 250, 0.82)",
    color: "var(--m-on-surface)",
    fontSize: 12,
    fontWeight: 850,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  compareMetricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 8,
  },
  compareMetric: {
    minHeight: 68,
    padding: "10px 11px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(181, 202, 222, 0.76)",
    display: "grid",
    alignContent: "space-between",
    gap: 7,
  },
  compareMiniBars: {
    display: "grid",
    gap: 9,
    paddingTop: 2,
  },
  compareSectionLabel: {
    fontSize: 8.5,
    letterSpacing: "0.14em",
    fontWeight: 900,
    color: "var(--m-on-surface-mid)",
  },
  compareMiniBarRow: {
    display: "grid",
    gap: 5,
  },
  compareMiniBarLabel: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    fontSize: 11,
    lineHeight: 1.25,
    color: "var(--m-on-surface-var)",
  },
  compareMiniBarTrack: {
    height: 9,
    borderRadius: 999,
    background: "rgba(221, 232, 243, 0.9)",
    overflow: "hidden",
  },
  compareMiniBarFill: {
    height: "100%",
    minWidth: 4,
    borderRadius: 999,
  },
  compareRiskStack: {
    display: "grid",
    gap: 8,
    paddingTop: 4,
  },
  compareRiskRow: {
    display: "grid",
    gridTemplateColumns: "8px minmax(0, 1fr)",
    gap: 9,
    alignItems: "start",
    fontSize: 11.5,
    lineHeight: 1.35,
    color: "var(--m-on-surface-var)",
  },
  compareRiskDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginTop: 4,
  },
  compareActionButton: {
    all: "unset",
    minHeight: 36,
    padding: "0 12px",
    borderRadius: 12,
    background: "rgba(225, 242, 235, 0.82)",
    color: "#246B50",
    fontSize: 12,
    fontWeight: 850,
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  comparisonDecisionPanel: {
    display: "grid",
    gap: 16,
    padding: "18px 20px",
    borderRadius: 18,
    background: "rgba(238, 246, 252, 0.74)",
    border: "1px solid rgba(181, 202, 222, 0.7)",
  },
  modelReadGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(280px, 0.95fr) minmax(360px, 1.05fr)",
    gap: 14,
    alignItems: "stretch",
  },
  modelLeaderBlock: {
    display: "grid",
    alignContent: "start",
    gap: 7,
    padding: "16px 18px",
    borderRadius: 16,
    background: "linear-gradient(145deg, rgba(255,255,255,0.84), rgba(241,247,252,0.7))",
    border: "1px solid rgba(181, 202, 222, 0.58)",
  },
  modelLeaderKicker: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 1.25,
    fontWeight: 850,
    color: "var(--m-on-surface-var)",
  },
  modelLeaderName: {
    fontFamily: "var(--font-display)",
    fontSize: 27,
    lineHeight: 1,
    fontWeight: 900,
    letterSpacing: "-0.01em",
    color: "var(--m-on-surface)",
  },
  modelLeaderCopy: {
    margin: "2px 0 0",
    maxWidth: 620,
    fontSize: 13.5,
    lineHeight: 1.45,
    color: "var(--m-on-surface-var)",
  },
  modelAdviceNote: {
    marginTop: 5,
    padding: "9px 10px",
    borderRadius: 10,
    background: "rgba(232, 241, 249, 0.86)",
    color: "var(--m-on-surface-mid)",
    fontSize: 11.5,
    lineHeight: 1.35,
  },
  rankedOutputBlock: {
    display: "grid",
    alignContent: "start",
    gap: 10,
    padding: "16px 18px",
    borderRadius: 16,
    background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(181, 202, 222, 0.58)",
  },
  rankedOutputRows: {
    display: "grid",
    gap: 4,
  },
  rankedOutputRow: {
    display: "grid",
    gridTemplateColumns: "30px minmax(0, 1fr) minmax(52px, auto) minmax(118px, auto)",
    gap: 10,
    alignItems: "center",
    minHeight: 38,
    padding: "7px 0",
    borderBottom: "1px solid rgba(181, 202, 222, 0.46)",
    color: "var(--m-on-surface-var)",
    fontSize: 12.5,
    lineHeight: 1.25,
  },
  rankPill: {
    width: 24,
    height: 24,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: "var(--m-primary-container)",
    color: "var(--m-on-primary-container)",
    fontSize: 11,
    fontWeight: 900,
  },
  rankName: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "var(--m-on-surface)",
    fontWeight: 850,
  },
  rankScore: {
    justifySelf: "end",
    color: "var(--m-on-surface)",
    fontSize: 13,
  },
  rankRange: {
    justifySelf: "end",
    color: "var(--m-on-surface-mid)",
    fontSize: 12,
    whiteSpace: "nowrap",
  },
  comparisonChangePanel: {
    gridColumn: "1 / -1",
    paddingTop: 14,
    borderTop: "1px solid rgba(181, 202, 222, 0.62)",
  },
  comparisonBenefitsPanel: {
    gridColumn: "1 / -1",
    paddingTop: 14,
    borderTop: "1px solid rgba(181, 202, 222, 0.62)",
  },
  benefitGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 8,
  },
  benefitTile: {
    display: "grid",
    gap: 4,
    padding: "11px 12px",
    borderRadius: 13,
    background: "linear-gradient(145deg, rgba(255,255,255,0.78), rgba(241,246,252,0.68))",
    border: "1px solid rgba(181, 202, 222, 0.56)",
    color: "var(--m-on-surface-var)",
    fontSize: 11.5,
    lineHeight: 1.32,
  },
  benefitLabel: {
    color: "var(--m-on-surface-mid)",
  },
  benefitWinner: {
    color: "var(--m-on-surface)",
    fontSize: 13,
    lineHeight: 1.2,
  },
  benefitReason: {
    color: "var(--m-on-surface-mid)",
    lineHeight: 1.3,
  },
  comparisonChangeRows: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 8,
  },
  comparisonChangeRow: {
    display: "grid",
    gap: 3,
    padding: "10px 11px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.62)",
    border: "1px solid rgba(181, 202, 222, 0.52)",
    fontSize: 11.5,
    color: "var(--m-on-surface-var)",
  },
  comparisonMiniMatrix: {
    display: "grid",
    gap: 8,
    alignContent: "center",
  },
  comparisonMatrixRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    paddingBottom: 8,
    borderBottom: "1px solid rgba(181, 202, 222, 0.58)",
    fontSize: 12,
    color: "var(--m-on-surface-var)",
  },
  scopePicker: {
    marginBottom: 14,
    padding: "10px",
    borderRadius: 14,
    background: "rgba(236, 243, 250, 0.72)",
    border: "1px solid rgba(181, 202, 222, 0.65)",
  },
  scopeLabel: {
    marginBottom: 8,
    fontSize: 11,
    fontWeight: 850,
    color: "var(--m-on-surface-var)",
  },
  scopeChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  scopeChip: {
    all: "unset",
    padding: "7px 9px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.72)",
    color: "var(--m-on-surface-var)",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 850,
  },
  scopeChipActive: {
    background: "var(--m-primary-container)",
    color: "var(--m-on-primary-container)",
    boxShadow: "inset 0 0 0 1px rgba(83, 128, 170, 0.24)",
  },
  compareTrayCard: {
    padding: "18px",
    background: "linear-gradient(145deg, rgba(255,255,255,0.92), rgba(242,247,252,0.84))",
    borderColor: "rgba(181, 202, 222, 0.76)",
  },
  compareTrayCopy: {
    margin: "8px 0 16px",
    fontSize: 12.3,
    lineHeight: 1.45,
    color: "var(--m-on-surface-var)",
  },
  compareTrayGroup: {
    display: "grid",
    gap: 8,
    marginBottom: 16,
  },
  compareTrayLabel: {
    fontSize: 10.5,
    fontWeight: 900,
    letterSpacing: "0.1em",
    color: "var(--m-on-surface-mid)",
    textTransform: "uppercase",
  },
  compareCandidate: {
    all: "unset",
    cursor: "pointer",
    minHeight: 78,
    padding: "10px",
    borderRadius: 15,
    background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(181, 202, 222, 0.62)",
    display: "grid",
    gridTemplateColumns: "58px minmax(0, 1fr)",
    gap: 10,
    alignItems: "center",
  },
  compareCandidateCopy: {
    display: "grid",
    gap: 3,
    minWidth: 0,
    color: "var(--m-on-surface)",
    fontSize: 12.5,
    lineHeight: 1.3,
  },
  compareThumb: {
    width: 58,
    height: 58,
    borderRadius: 14,
    background: "linear-gradient(180deg, rgba(241,246,252,0.9), rgba(255,255,255,0.74))",
    border: "1px solid rgba(181, 202, 222, 0.66)",
    display: "grid",
    gridTemplateRows: "24px 1fr",
    gap: 4,
    padding: 6,
    boxSizing: "border-box",
  },
  compareThumbScore: {
    borderRadius: 8,
    display: "grid",
    placeItems: "center",
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    fontWeight: 900,
  },
  compareThumbBars: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 3,
    minHeight: 0,
  },
  compareThumbBar: {
    width: 8,
    borderRadius: 999,
    minHeight: 6,
  },
  activeCompareRow: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 32px",
    gap: 6,
    alignItems: "center",
  },
  activeCompareMain: {
    all: "unset",
    cursor: "pointer",
    padding: "10px 11px",
    borderRadius: 13,
    background: "rgba(236, 243, 250, 0.86)",
    color: "var(--m-on-surface)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    fontWeight: 850,
  },
  compareTrayEmpty: {
    padding: "12px",
    borderRadius: 13,
    background: "rgba(244, 247, 251, 0.8)",
    border: "1px solid var(--m-outline-var)",
    color: "var(--m-on-surface-var)",
    fontSize: 12,
  },
  controlListRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    paddingBottom: 10,
    borderBottom: "1px solid var(--m-outline-var)",
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
