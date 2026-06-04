import { useEffect, useState, type CSSProperties } from "react";
import { authHeaders } from "../../../../hooks/useAuth";
import { exportDeliverableFile } from "../../../../hooks/useV6WorkspaceData";
import {
  defaultScenarioName,
  formatAssumptionDisplay,
  isStructuredAnalysis,
  numericAssumptionValue,
  patchStructuredDataAssumptions,
  sliderConfigForAssumption,
  syncLinkedAssumptions,
  type ScenarioSliderConfig,
  type StructuredAnalysisData,
  type StructuredAssumption,
} from "../../../../lib/analysisCanvasModel";
import { getSurfaceActionContract, isSurfaceActionId, type SurfaceActionId } from "../../../../lib/v6SurfaceActions";
import { ChatStarterPill } from "../ChatStarterPill";
import { DeliverableComments } from "./DeliverableComments";
import { MobileIcon } from "../icons";
import { YIcon } from "../YIcon";

interface AnalysisVersionSummary {
  versionNumber: number;
  changeReason: string | null;
  createdAt: string;
  scenarioName: string | null;
  summary: string | null;
}

interface MobileAnalysisScreenProps {
  title: string;
  analysisRunId?: number | null;
  analysisData?: Record<string, any>;
  comparisonData?: Record<string, any>[];
  modelState?: Record<string, any>;
  status?: string;
  versionNumber?: number | null;
  onBack: () => void;
  onAskYulia: (prompt: string) => void;
  onOpenDealFiles?: (dealId: string, dealTitle: string, scope: "all" | "data-room" | "shared") => void;
  onOpenDeal?: (dealId: string, dealTitle: string) => void;
  onOpenDocument?: (docTitle: string, docMeta?: string, docKind?: string) => void;
  onRunDealAnalysis?: (input: {
    dealId: string;
    dealTitle: string;
    analysisType: string;
    menuItemSlug?: string;
    label: string;
    prompt: string;
  }) => void | Promise<void>;
  onUpdate?: (patch: {
    analysisData?: Record<string, any>;
    versionNumber?: number | null;
    status?: string;
    modelState?: Record<string, any>;
  }) => void;
}

/* Generic read-only renderers — show a model's values + a comparison grid on
   mobile when the interactive canvas (sliders) can't render here. */
function prettyKey(k: string): string {
  return k.replace(/[_-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
function formatVal(v: unknown): string {
  if (typeof v === "number") return Number.isFinite(v) ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : String(v);
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
}
function readableEntries(obj: Record<string, any> | undefined | null): [string, unknown][] {
  if (!obj || typeof obj !== "object") return [];
  return Object.entries(obj).filter(([k, v]) =>
    !k.startsWith("_")
    && (typeof v === "string" || typeof v === "number" || typeof v === "boolean")
    && v !== "" && v != null,
  );
}
function comparisonRowTitle(row: Record<string, any>, i: number): string {
  return String(row.name || row.business_name || row.title || row.deal || `Option ${i + 1}`);
}
function ReadonlyValues({ entries }: { entries: [string, unknown][] }) {
  if (entries.length === 0) return null;
  return (
    <div>
      {entries.slice(0, 24).map(([k, v]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "6px 0", borderBottom: "0.5px solid var(--mb-line-2)" }}>
          <span style={{ fontSize: 13, color: "var(--mb-ink-3)" }}>{prettyKey(k)}</span>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--mb-ink)", textAlign: "right" }}>{formatVal(v)}</span>
        </div>
      ))}
    </div>
  );
}

export function MobileAnalysisScreen({
  title,
  analysisRunId,
  analysisData,
  comparisonData,
  modelState,
  status,
  versionNumber,
  onBack,
  onAskYulia,
  onOpenDealFiles,
  onOpenDeal,
  onOpenDocument,
  onRunDealAnalysis,
  onUpdate,
}: MobileAnalysisScreenProps) {
  const [data, setData] = useState<Record<string, any> | undefined>(analysisData);
  const [currentVersion, setCurrentVersion] = useState<number | null | undefined>(versionNumber);
  const [versions, setVersions] = useState<AnalysisVersionSummary[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [deliverableId, setDeliverableId] = useState<number | null>(() => deliverableIdFromAnalysisData(analysisData));
  const [commentaryMarkdown, setCommentaryMarkdown] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    setData(analysisData);
    setCurrentVersion(versionNumber);
    const embedded = deliverableIdFromAnalysisData(analysisData);
    if (embedded != null) setDeliverableId(embedded);
  }, [analysisData, versionNumber]);

  // Resolve the deliverable id (for PDF export) and any text commentary from the saved run.
  useEffect(() => {
    if (!analysisRunId) {
      setDeliverableId(prev => prev ?? null);
      return;
    }
    let cancelled = false;
    fetch(`/api/analysis-runs/${analysisRunId}`, { headers: authHeaders() })
      .then(res => res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`)))
      .then(payload => {
        if (cancelled) return;
        const id = deliverableIdFromRunPayload(payload);
        if (id != null) setDeliverableId(id);
        const markdown = typeof payload?.commentaryMarkdown === "string" ? payload.commentaryMarkdown.trim() : "";
        if (markdown) setCommentaryMarkdown(markdown);
      })
      .catch(() => { /* export/commentary stay unavailable; the screen degrades gracefully */ });
    return () => { cancelled = true; };
  }, [analysisRunId]);

  const exportPdf = async () => {
    if (deliverableId == null || exporting) return;
    setExportError(null);
    setExporting(true);
    try {
      const { blob, filename } = await exportDeliverableFile(deliverableId, "pdf");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (err: any) {
      setExportError(err?.message ? `Export failed: ${err.message}` : "Export failed. Try again or ask Yulia.");
    } finally {
      setExporting(false);
    }
  };

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

  useEffect(() => {
    if (data || !analysisRunId) return;
    let cancelled = false;
    fetch(`/api/analysis-runs/${analysisRunId}`, { headers: authHeaders() })
      .then(res => res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`)))
      .then(payload => {
        if (cancelled) return;
        setData(payload.analysisData ?? undefined);
        setCurrentVersion(payload.versionNumber ?? null);
        onUpdate?.({
          analysisData: payload.analysisData ?? undefined,
          versionNumber: payload.versionNumber ?? null,
          status: payload.versionNumber ? `saved v${payload.versionNumber}` : status,
        });
      })
      .catch(() => {
        if (!cancelled) setNote("Yulia can still discuss this analysis, but the saved run could not be loaded here.");
      });
    return () => { cancelled = true; };
  }, [analysisRunId, data, onUpdate, status]);

  // Deal id for the comments @mention autocomplete (deliverable → deal → participants).
  // Available to both the structured and fallback render paths below.
  const commentsDealId = dealIdFromAnalysisData(data);

  if (!isStructuredAnalysis(data)) {
    const fallbackSummary = typeof data?.summary === "string" ? data.summary.trim() : "";
    const fallbackMarkdown = commentaryMarkdown
      || (typeof data?.commentaryMarkdown === "string" ? data.commentaryMarkdown.trim() : "")
      || (typeof data?.analysisMarkdown === "string" ? data.analysisMarkdown.trim() : "");
    const fallbackText = fallbackMarkdown || fallbackSummary;
    // Read-only model + comparison content so phones SEE the figures even when
    // the interactive canvas (sliders) can't render here.
    const modelEntries = readableEntries(modelState);
    const comparisonRows = Array.isArray(comparisonData) ? comparisonData.filter(r => r && typeof r === "object") : [];
    const hasReadOnly = modelEntries.length > 0 || comparisonRows.length > 0;
    return (
      <div style={S.page}>
        <FloatingChrome onBack={onBack} shareTitle={title} />
        <section style={S.emptyCard}>
          <div className="mb-mono" style={S.eyebrow}>ANALYSIS</div>
          <h1 style={S.title}>{title}</h1>
          {fallbackText ? (
            <p style={{ ...S.copy, whiteSpace: "pre-wrap" }}>{fallbackText}</p>
          ) : hasReadOnly ? (
            <p style={S.copy}>Read-only view of this model — open on desktop for the interactive sliders and adjustments.</p>
          ) : (
            <p style={S.copy}>
              The interactive canvas for this analysis is not available on this phone, but Yulia can walk you through it in chat.
            </p>
          )}
          {note && <div style={S.note}>{note}</div>}
          {exportError && <div style={S.note}>{exportError}</div>}
          <button
            type="button"
            style={S.primaryButton}
            onClick={() => onAskYulia(
              fallbackText || hasReadOnly
                ? `Walk me through ${title}: what it found, what decision it supports, and what to verify next.`
                : `Open ${title} as an interactive analysis canvas and explain what is available on mobile.`,
            )}
          >
            Ask Yulia
          </button>
          {deliverableId != null && (
            <button
              type="button"
              disabled={exporting}
              style={{ ...S.readButton, opacity: exporting ? 0.6 : 1 }}
              onClick={() => { void exportPdf(); }}
            >
              {exporting ? "Exporting…" : "Export PDF"}
            </button>
          )}
        </section>

        {modelEntries.length > 0 && (
          <section style={S.whiteCard}>
            <div className="mb-mono" style={S.cardEyebrow}>MODEL VALUES</div>
            <ReadonlyValues entries={modelEntries} />
          </section>
        )}

        {comparisonRows.length > 0 && (
          <section style={S.whiteCard}>
            <div className="mb-mono" style={S.cardEyebrow}>COMPARISON</div>
            {comparisonRows.slice(0, 6).map((row, i) => (
              <div key={i} style={{ padding: "10px 0", borderTop: i ? "0.5px solid var(--mb-line-2)" : "none" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--mb-ink)", marginBottom: 4 }}>{comparisonRowTitle(row, i)}</div>
                <ReadonlyValues entries={readableEntries(row).filter(([k]) => !["name", "business_name", "title", "deal"].includes(k))} />
              </div>
            ))}
          </section>
        )}

        {/* Comments — renders only when this run resolved a real deliverable id. */}
        <DeliverableComments deliverableId={deliverableId} dealId={commentsDealId} defaultCollapsed />
      </div>
    );
  }

  const structured = data;
  const primaryPrompt = structured.nextActions?.[0]?.prompt || `Explain ${structured.title || title} and what decision this supports.`;
  const analysisDealId = structured.calculations?.dealId;
  const linkedDealId = typeof analysisDealId === "number" || typeof analysisDealId === "string" ? analysisDealId : null;
  const analysisDealTitle = typeof structured.calculations?.dealName === "string"
    ? structured.calculations.dealName
    : (structured.title || title).split(" · ")[0];

  const runNextAction = (action: NonNullable<StructuredAnalysisData["nextActions"]>[number]) => {
    const targetDealId = action.targetDealId ?? linkedDealId;
    const targetDealTitle = action.targetDealTitle || analysisDealTitle;

    if (isSurfaceActionId(action.surfaceActionId)) {
      runContractedAction(action.surfaceActionId, action, targetDealId, targetDealTitle);
      return;
    }

    if (action.actionType === "open_files") {
      const scope = action.fileScope || "all";
      if (targetDealId != null && onOpenDealFiles) {
        onOpenDealFiles(String(targetDealId), targetDealTitle, scope);
        return;
      }
    }

    if (action.actionType === "update_model") {
      document.getElementById("mobile-analysis-scenario-controls")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setNote("Use the sliders below to model the scenario. Saved versions stay attached to this analysis for Yulia.");
      return;
    }

    if (action.actionType === "run_analysis" && targetDealId != null && onRunDealAnalysis) {
      onRunDealAnalysis({
        dealId: String(targetDealId),
        dealTitle: targetDealTitle,
        analysisType: action.analysisType || "red_flags",
        label: action.label,
        prompt: action.prompt,
      });
      return;
    }
    onAskYulia(action.prompt);
  };

  const runContractedAction = (
    actionId: SurfaceActionId,
    action: NonNullable<StructuredAnalysisData["nextActions"]>[number],
    targetDealId: number | string | null,
    targetDealTitle: string,
  ) => {
    const contract = getSurfaceActionContract(actionId);
    const promptText = action.prompt || `${contract.label}. Use the open analysis context and keep the result tied to this canvas.`;

    if (actionId === "update_model_assumption") {
      document.getElementById("mobile-analysis-scenario-controls")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setNote("Use the sliders below to model the scenario. Saved versions stay attached to this analysis for Yulia.");
      return;
    }

    if (actionId === "ask_yulia" || contract.result === "chat") {
      onAskYulia(promptText);
      return;
    }

    if (actionId === "open_deal") {
      if (targetDealId != null && onOpenDeal) {
        onOpenDeal(String(targetDealId), targetDealTitle);
        return;
      }
      onAskYulia(promptText);
      return;
    }

    if (isMobileFileAction(actionId)) {
      if (targetDealId != null && onOpenDealFiles) {
        onOpenDealFiles(String(targetDealId), targetDealTitle, action.fileScope || mobileFileScopeForAction(actionId));
        return;
      }
      onAskYulia(promptText);
      return;
    }

    if (actionId === "open_document") {
      if (onOpenDocument) {
        onOpenDocument(action.label || contract.label, structured.title || title, "analysis");
        return;
      }
      onAskYulia(promptText);
      return;
    }

    if (contract.kind === "analysis" && targetDealId != null && onRunDealAnalysis) {
      onRunDealAnalysis({
        dealId: String(targetDealId),
        dealTitle: targetDealTitle,
        analysisType: action.analysisType || contract.analysisType || structured.analysisType || "red_flags",
        label: action.label || contract.label,
        prompt: promptText,
      });
      return;
    }

    if (contract.requiresConfirmation || contract.result === "staged_confirmation") {
      onAskYulia(`${promptText} Stage this governed action for confirmation before anything is shared, filed, sent, or requested.`);
      return;
    }

    onAskYulia(promptText);
  };

  const updateAssumptions = async (updates: Record<string, unknown>, scenarioName?: string) => {
    const nextData = patchStructuredDataAssumptions(structured, updates);
    const modelState = scenarioName ? { ...updates, _scenario_name: scenarioName } : updates;
    setData(nextData);
    setNote("Scenario updated on this phone. Saving version...");
    onUpdate?.({ analysisData: nextData, modelState });

    window.dispatchEvent(new CustomEvent("smbx:canvas_action", {
      detail: {
        canvas_action: "update_model",
        tabId: "active",
        updates: modelState,
        analysisRunId: analysisRunId ?? null,
        analysisData: nextData,
      },
    }));

    if (!analysisRunId) {
      setNote("Scenario changed here. Save needs an analysis run.");
      return;
    }

    try {
      const res = await fetch(`/api/analysis-runs/${analysisRunId}/assumptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          updates,
          scenarioName,
          changeReason: scenarioName ? `Saved mobile scenario: ${scenarioName}` : "Mobile scenario edit",
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();
      const savedData = payload.analysisData ?? nextData;
      setData(savedData);
      setCurrentVersion(payload.versionNumber ?? currentVersion ?? null);
      if (Array.isArray(payload.versions)) setVersions(payload.versions);
      setNote(payload.versionNumber ? `Saved scenario v${payload.versionNumber}. Yulia can reference it in chat.` : "Scenario saved. Yulia can reference it in chat.");
      onUpdate?.({
        analysisData: savedData,
        versionNumber: payload.versionNumber ?? currentVersion ?? null,
        status: payload.versionNumber ? `saved v${payload.versionNumber}` : "scenario saved",
        modelState,
      });
      window.dispatchEvent(new CustomEvent("smbx:canvas_action", {
        detail: {
          canvas_action: "update_model",
          tabId: "active",
          updates: modelState,
          analysisRunId,
          analysisData: savedData,
          versionNumber: payload.versionNumber ?? null,
        },
      }));
    } catch {
      setNote("Scenario changed locally. Reconnect or sign in to save the version.");
    }
  };

  const restoreVersion = async (targetVersion: number) => {
    if (!analysisRunId) return;
    setNote(`Restoring v${targetVersion}...`);
    try {
      const res = await fetch(`/api/analysis-runs/${analysisRunId}/versions/${targetVersion}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();
      const restoredData = payload.analysisData ?? data;
      setData(restoredData);
      setCurrentVersion(payload.versionNumber ?? null);
      if (Array.isArray(payload.versions)) setVersions(payload.versions);
      setNote(`Restored v${targetVersion} as v${payload.versionNumber ?? "latest"}. Yulia can compare it in chat.`);
      onUpdate?.({
        analysisData: restoredData,
        versionNumber: payload.versionNumber ?? null,
        status: payload.versionNumber ? `restored v${payload.versionNumber}` : "version restored",
      });
      window.dispatchEvent(new CustomEvent("smbx:canvas_action", {
        detail: {
          canvas_action: "update_model",
          tabId: "active",
          analysisRunId,
          analysisData: restoredData,
          versionNumber: payload.versionNumber ?? null,
        },
      }));
    } catch {
      setNote("Could not restore that version. Ask Yulia to reopen the saved analysis.");
    }
  };

  return (
    <div style={S.page}>
      <FloatingChrome onBack={onBack} shareTitle={structured.title || title} />

      <section style={S.hero}>
        <div style={S.heroWash} />
        <div className="mb-mono" style={S.eyebrow}>ANALYSIS · LIVE MODEL</div>
        <h1 style={S.title}>{structured.title || title}</h1>
        <p style={S.copy}>{structured.summary}</p>
        <div style={S.metaLine}>
          <span>{analysisRunId ? `Run ${analysisRunId}` : "Live canvas"}</span>
          <span>{currentVersion ? `v${currentVersion}` : status || "ready"}</span>
        </div>
        {deliverableId != null && (
          <div style={S.heroActions}>
            <button
              type="button"
              disabled={exporting}
              style={{ ...S.heroActionButton, opacity: exporting ? 0.6 : 1 }}
              onClick={() => { void exportPdf(); }}
            >
              <MobileIcon name="share" size={15} c="#FFFFFF" />
              {exporting ? "Exporting…" : "Export PDF"}
            </button>
          </div>
        )}
        {structured.verdict && (
          <div style={S.verdictPanel}>
            <div style={S.scoreOrb}>{structured.verdict.score ?? "Y"}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="mb-mono" style={S.glassEyebrow}>{structured.verdict.label}</div>
              <div style={S.verdictText}>{structured.verdict.rationale}</div>
            </div>
          </div>
        )}
      </section>

      {structured.metrics?.length ? (
        <section style={S.metricsGrid}>
          {structured.metrics.slice(0, 6).map(metric => (
            <div key={metric.key} style={S.metricTile}>
              <div className="mb-mono" style={S.metricLabel}>{metric.label}</div>
              <div style={S.metricValue}>{metric.displayValue}</div>
              {metric.sub && <div style={S.metricSub}>{metric.sub}</div>}
            </div>
          ))}
        </section>
      ) : null}

      {structured.yuliaRead && (
        <section style={S.readCard}>
          <div style={S.readHeader}>
            <YIcon size={44} kind="pursue" />
            <div>
              <div className="mb-mono" style={S.darkEyebrow}>YULIA READ</div>
              <div style={S.readTitle}>What moved</div>
            </div>
          </div>
          <p style={S.readCopy}>{structured.yuliaRead}</p>
          <button type="button" style={S.readButton} onClick={() => onAskYulia(primaryPrompt)}>
            Discuss this read
          </button>
        </section>
      )}

      {structured.charts?.length ? (
        <section style={S.whiteCard}>
          <div className="mb-mono" style={S.cardEyebrow}>MODEL OUTPUT</div>
          {structured.charts.slice(0, 2).map(chart => (
            <ChartBlock key={chart.title} title={chart.title} rows={chart.data} />
          ))}
        </section>
      ) : null}

      {structured.assumptions?.length ? (
        <section id="mobile-analysis-scenario-controls" style={S.whiteCard}>
          <ScenarioPanel
            assumptions={structured.assumptions}
            analysisTitle={structured.title || title}
            onSave={updateAssumptions}
            onAskYulia={onAskYulia}
          />
        </section>
      ) : null}

      {analysisRunId ? (
        <section style={S.whiteCard}>
          <MobileVersionHistory
            versions={versions}
            currentVersion={currentVersion ?? null}
            loading={versionsLoading}
            onRestore={restoreVersion}
            onAskYulia={(version) => onAskYulia(
              `Use the open ${structured.title || title} mobile analysis and explain saved scenario v${version.versionNumber}${version.scenarioName ? ` (${version.scenarioName})` : ""}. Compare it with the current version and tell me what decision it supports.`,
            )}
          />
        </section>
      ) : null}

      {structured.nextActions?.length ? (
        <section style={S.whiteCard}>
          <div className="mb-mono" style={S.cardEyebrow}>YULIA NEXT</div>
          <h2 style={S.sectionTitle}>Act on the read</h2>
          <div style={S.nextActionStack}>
            {structured.nextActions.map(action => (
              <button
                key={`${action.actionType}-${action.label}`}
                type="button"
                style={S.nextActionRow}
                onClick={() => runNextAction(action)}
              >
                <span style={{ display: "grid", gap: 4 }}>
                  <span style={{ fontSize: 16, fontWeight: 900 }}>{action.label}</span>
                  <span style={{ fontSize: 13, lineHeight: 1.3, color: "var(--mb-ink-3)" }}>{action.prompt}</span>
                </span>
                <MobileIcon name="chevron" size={16} c="rgba(31,42,66,0.55)" />
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {structured.evidenceRefs?.length ? (
        <section style={S.whiteCard}>
          <div className="mb-mono" style={S.cardEyebrow}>YULIA EVIDENCE</div>
          <MiniList
            title="Evidence Yulia used"
            rows={structured.evidenceRefs.map(item => [
              item.label,
              [item.value, item.source, item.detail].filter(Boolean).join(" · "),
            ])}
          />
        </section>
      ) : null}

      {(structured.risks?.length || structured.missingData?.length || structured.professionalTriggers?.length) ? (
        <section style={S.whiteCard}>
          <div className="mb-mono" style={S.cardEyebrow}>DILIGENCE CONTROL</div>
          <MiniList title="Risks" rows={(structured.risks ?? []).map(item => [item.label, item.detail])} />
          <MiniList title="Missing data" rows={(structured.missingData ?? []).map(item => [item.label, item.why])} />
          <MiniList title="Professional triggers" rows={(structured.professionalTriggers ?? []).map(item => [item.role, item.why])} />
        </section>
      ) : null}

      {/* Comments — shared async thread on this analysis's deliverable. Renders
          only when the run resolved a real deliverable id (sample runs skip it). */}
      <DeliverableComments deliverableId={deliverableId} dealId={commentsDealId} defaultCollapsed />

      {exportError && <div style={S.floatingNote}>{exportError}</div>}
      {note && <div style={S.floatingNote}>{note}</div>}

      <div style={S.chatDock}>
        <ChatStarterPill
          placeholder="Ask Yulia about this analysis"
          ariaLabel="Ask Yulia about this analysis"
          onSend={onAskYulia}
          style={S.chatPill}
        />
      </div>
    </div>
  );
}

function coerceDeliverableId(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
    const parsed = Number(value);
    return parsed > 0 ? parsed : null;
  }
  return null;
}

// The deliverable id can ride along inside the structured analysis payload (calculations block).
function deliverableIdFromAnalysisData(value: unknown): number | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, any>;
  const direct = coerceDeliverableId(record.deliverableId ?? record.deliverable_id);
  if (direct != null) return direct;
  const calc = record.calculations;
  if (calc && typeof calc === "object") {
    return coerceDeliverableId((calc as Record<string, any>).deliverableId ?? (calc as Record<string, any>).deliverable_id);
  }
  return null;
}

// Deal id for participant-sourced @mentions. Rides inside the structured
// analysis payload (calculations.dealId) the same way the deliverable id does.
// Best-effort: when absent/non-numeric the comments thread simply ships without
// @mention autocomplete (the backend still notifies the team on every comment).
function dealIdFromAnalysisData(value: unknown): number | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, any>;
  const calc = record.calculations;
  const raw = (calc && typeof calc === "object" ? (calc as Record<string, any>).dealId : undefined) ?? record.dealId ?? record.deal_id;
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) return raw;
  if (typeof raw === "string" && raw.trim() && Number.isFinite(Number(raw))) {
    const parsed = Number(raw);
    return parsed > 0 ? parsed : null;
  }
  return null;
}

// The saved-run endpoint may expose the deliverable id at the top level or nested in analysisData.
function deliverableIdFromRunPayload(payload: unknown): number | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, any>;
  const top = coerceDeliverableId(record.deliverableId ?? record.deliverable_id);
  if (top != null) return top;
  return deliverableIdFromAnalysisData(record.analysisData);
}

function isMobileFileAction(actionId: SurfaceActionId): boolean {
  return actionId === "open_files_all"
    || actionId === "open_files_data_room"
    || actionId === "open_files_shared"
    || actionId === "open_files_needing_action";
}

function mobileFileScopeForAction(actionId: SurfaceActionId): "all" | "data-room" | "shared" {
  switch (actionId) {
    case "open_files_data_room":
      return "data-room";
    case "open_files_shared":
    case "open_files_needing_action":
      return "shared";
    case "open_files_all":
    default:
      return "all";
  }
}

function FloatingChrome({ onBack, shareTitle }: { onBack: () => void; shareTitle: string }) {
  const onShare = async () => {
    const url = window.location.href;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: shareTitle, url });
        return;
      } catch { /* user cancelled */ }
    }
    // Desktop / unsupported: copy URL to clipboard.
    try { await navigator.clipboard?.writeText(url); } catch { /* noop */ }
  };

  return (
    <>
      <button type="button" onClick={onBack} aria-label="Back" style={S.floatBack}>
        <MobileIcon name="back" size={14} c="var(--mb-ink-1)" />
      </button>
      <button type="button" onClick={() => { void onShare(); }} aria-label="Share" style={S.floatShare}>
        <MobileIcon name="share" size={16} c="var(--mb-ink-1)" />
      </button>
    </>
  );
}

function ChartBlock({ title, rows }: { title: string; rows: Array<Record<string, unknown>> }) {
  const values = rows
    .map(row => Number(row.value ?? row.score ?? row.amount ?? row.y ?? 0))
    .filter(value => Number.isFinite(value));
  const max = Math.max(1, ...values.map(value => Math.abs(value)));
  return (
    <div style={S.chartBlock}>
      <div style={S.chartTitle}>{title}</div>
      <div style={{ display: "grid", gap: 10 }}>
        {rows.slice(0, 6).map((row, index) => {
          const label = String(row.label ?? row.name ?? row.key ?? `Item ${index + 1}`);
          const value = Number(row.value ?? row.score ?? row.amount ?? row.y ?? 0);
          const width = `${Math.max(8, Math.min(100, Math.abs(value) / max * 100))}%`;
          return (
            <div key={`${title}-${label}-${index}`} style={S.chartRow}>
              <div style={S.chartRowTop}>
                <span>{label}</span>
                <strong>{Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "n/a"}</strong>
              </div>
              <div style={S.barTrack}>
                <div style={{ ...S.barFill, width }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScenarioPanel({
  assumptions,
  analysisTitle,
  onSave,
  onAskYulia,
}: {
  assumptions: StructuredAssumption[];
  analysisTitle: string;
  onSave: (updates: Record<string, unknown>, scenarioName?: string) => void | Promise<void>;
  onAskYulia: (prompt: string) => void;
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
    onAskYulia(`Use the open ${analysisTitle} mobile analysis and discuss scenario "${scenarioLabel}". Changed assumptions: ${changedText}. Tell me what moved, what risk changed, and what decision this supports.`);
  };

  const optimizeScenario = () => {
    const changedText = changedRows.length
      ? changedRows.map(({ item, original }) => {
        const nextValue = drafts[item.key] ?? original;
        return `${item.label}: ${formatAssumptionDisplay(item.key, original)} to ${formatAssumptionDisplay(item.key, nextValue)}`;
      }).join("; ")
      : "use the current saved/base assumptions";
    onAskYulia(`Use optimize_scenario with tabId "active" for the open ${analysisTitle} mobile analysis and optimize scenario "${scenarioLabel}" for my role in this transaction. Infer whether I am buying, selling, raising, divesting, or advising from the deal context; if that is ambiguous, ask one clarifying question before comparing options. Read the active model, saved scenarios, evidence, market context, tax/legal constraints, financing constraints, and risk appetite. Changed assumptions: ${changedText}. Show the strongest risk-adjusted scenario candidates, explain why, and map the user/professional approval path through negotiation-prep asks, fallback positions, reps and warranties, diligence requests, professional signoffs, and concrete work products Yulia should create or update.`);
  };

  return (
    <div>
      <div className="mb-mono" style={S.cardEyebrow}>SCENARIO MODEL</div>
      <h2 style={S.sectionTitle}>Play with the inputs</h2>
      <p style={S.sectionCopy}>Save a scenario, then Yulia can compare it against the base case in chat.</p>
      <label style={S.scenarioName}>
        <span className="mb-mono" style={S.smallLabel}>NAME</span>
        <input
          value={scenarioName}
          placeholder={defaultScenarioName(analysisTitle)}
          onChange={event => setScenarioName(event.currentTarget.value)}
          style={S.scenarioInput}
        />
      </label>
      <div style={S.sliderStack}>
        {sliderRows.slice(0, 8).map(({ item, config, original }) => {
          const value = drafts[item.key] ?? original;
          return (
            <label key={item.key} style={S.sliderRow}>
              <span style={S.sliderTop}>
                <span style={S.sliderLabel}>{item.label}</span>
                <strong style={S.sliderValue}>{formatAssumptionDisplay(item.key, value)}</strong>
              </span>
              <input
                type="range"
                min={config.min}
                max={config.max}
                step={config.step}
                value={value}
                onChange={event => setDrafts(prev => syncLinkedAssumptions(prev, item.key, Number(event.currentTarget.value)))}
                aria-label={item.label}
                aria-valuetext={formatAssumptionDisplay(item.key, value)}
                style={S.range}
              />
              <span style={S.sliderBounds}>
                <span>{formatAssumptionDisplay(item.key, config.min)}</span>
                <span>base {formatAssumptionDisplay(item.key, original)}</span>
                <span>{formatAssumptionDisplay(item.key, config.max)}</span>
              </span>
            </label>
          );
        })}
      </div>
      <div style={S.scenarioActions}>
        <button
          type="button"
          disabled={!changedRows.length || saving}
          onClick={() => { void saveScenario(); }}
          style={{ ...S.primaryButton, opacity: changedRows.length && !saving ? 1 : 0.48 }}
        >
          {saving ? "Saving" : "Save scenario"}
        </button>
        <button type="button" onClick={optimizeScenario} style={S.secondaryButton}>Optimize</button>
        <button type="button" onClick={discussScenario} style={S.secondaryButton}>Ask Yulia</button>
      </div>
    </div>
  );
}

function MobileVersionHistory({
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
  const rows = versions.slice(0, 5);
  return (
    <div>
      <div className="mb-mono" style={S.cardEyebrow}>VERSIONS</div>
      <h2 style={S.sectionTitle}>Saved scenarios</h2>
      <p style={S.sectionCopy}>Restore one, or ask Yulia how it changes the decision.</p>
      {loading ? (
        <div style={S.versionEmpty}>Loading version history...</div>
      ) : rows.length ? (
        <div style={S.versionStack}>
          {rows.map(version => {
            const active = currentVersion === version.versionNumber;
            return (
              <div key={version.versionNumber} style={S.versionRow}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={S.versionTitle}>
                    v{version.versionNumber}
                    {version.scenarioName ? ` · ${version.scenarioName}` : ""}
                    {active ? " · current" : ""}
                  </div>
                  <div style={S.versionMeta}>
                    {version.changeReason || "Saved analysis version"} · {formatMobileVersionDate(version.createdAt)}
                  </div>
                  {version.summary && <div style={S.versionSummary}>{version.summary}</div>}
                </div>
                <div style={S.versionActions}>
                  <button type="button" style={S.versionButton} onClick={() => onAskYulia(version)}>Ask</button>
                  <button
                    type="button"
                    style={{ ...S.versionButton, opacity: active ? 0.42 : 1 }}
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
        <div style={S.versionEmpty}>Save a scenario to start the version trail.</div>
      )}
    </div>
  );
}

function formatMobileVersionDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function MiniList({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  if (!rows.length) return null;
  return (
    <div style={S.miniList}>
      <div style={S.miniTitle}>{title}</div>
      {rows.slice(0, 4).map(([label, value]) => (
        <div key={`${title}-${label}`} style={S.miniRow}>
          <strong>{label}</strong>
          <span>{value}</span>
        </div>
      ))}
    </div>
  );
}

const glassPanel: CSSProperties = {
  background: "radial-gradient(circle at 16% 0%, rgba(255,255,255,0.30), transparent 34%), linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.055))",
  border: "1px solid rgba(255,255,255,0.46)",
  boxShadow: "0 16px 34px -22px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.44), inset 0 -1px 0 rgba(255,255,255,0.10)",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
};

const S: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "86px 16px 150px",
    background: "linear-gradient(180deg, #FFFFFF 0%, #F7FAFD 54%, #CAD2F0 100%)",
    color: "var(--mb-ink)",
  },
  floatBack: {
    position: "fixed",
    top: "calc(env(safe-area-inset-top, 0px) + 18px)",
    left: 18,
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.78)",
    background: "rgba(255,255,255,0.78)",
    boxShadow: "0 10px 24px rgba(31,42,66,0.14)",
    zIndex: 20,
    display: "grid",
    placeItems: "center",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },
  floatShare: {
    position: "fixed",
    top: "calc(env(safe-area-inset-top, 0px) + 18px)",
    right: 18,
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.78)",
    background: "rgba(255,255,255,0.78)",
    boxShadow: "0 10px 24px rgba(31,42,66,0.14)",
    zIndex: 20,
    display: "grid",
    placeItems: "center",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },
  hero: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 30,
    padding: "26px 24px 22px",
    background: "linear-gradient(145deg, #406E98 0%, #6EA4C0 45%, #25385F 100%)",
    boxShadow: "0 24px 58px -32px rgba(17,35,70,0.7)",
    color: "#FFFFFF",
  },
  heroWash: {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(circle at 22% 10%, rgba(255,255,255,0.26), transparent 34%), radial-gradient(circle at 88% 100%, rgba(9,22,54,0.42), transparent 36%)",
    pointerEvents: "none",
  },
  eyebrow: {
    position: "relative",
    zIndex: 1,
    fontSize: 12,
    letterSpacing: "0.18em",
    fontWeight: 900,
    color: "#FFFFFF",
  },
  title: {
    position: "relative",
    zIndex: 1,
    margin: "12px 0 0",
    fontFamily: "var(--mb-font-display)",
    fontSize: 42,
    lineHeight: 0.96,
    letterSpacing: 0,
    color: "#FFFFFF",
  },
  copy: {
    position: "relative",
    zIndex: 1,
    margin: "16px 0 0",
    fontSize: 18,
    lineHeight: 1.35,
    color: "#FFFFFF",
  },
  metaLine: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 18,
    fontSize: 13,
    color: "#FFFFFF",
  },
  heroActions: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  heroActionButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    minHeight: 44,
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.28)",
    background: "rgba(255,255,255,0.14)",
    color: "#FFFFFF",
    padding: "0 18px",
    fontWeight: 900,
    fontSize: 15,
  },
  verdictPanel: {
    ...glassPanel,
    position: "relative",
    zIndex: 1,
    marginTop: 22,
    borderRadius: 24,
    padding: 14,
    display: "flex",
    gap: 14,
    alignItems: "center",
  },
  scoreOrb: {
    width: 58,
    height: 58,
    borderRadius: 18,
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.24)",
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: 900,
    flexShrink: 0,
  },
  glassEyebrow: {
    fontSize: 10,
    letterSpacing: "0.18em",
    color: "#FFFFFF",
  },
  verdictText: {
    marginTop: 5,
    fontSize: 15,
    lineHeight: 1.36,
    fontWeight: 800,
    color: "#FFFFFF",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 10,
    marginTop: 14,
  },
  metricTile: {
    borderRadius: 22,
    padding: 16,
    background: "rgba(255,255,255,0.86)",
    border: "1px solid rgba(216,224,237,0.86)",
    boxShadow: "0 14px 34px -28px rgba(30,45,80,0.5)",
  },
  metricLabel: {
    fontSize: 10,
    letterSpacing: "0.16em",
    color: "var(--mb-accent-ink)",
  },
  metricValue: {
    marginTop: 7,
    fontSize: 25,
    fontWeight: 900,
    color: "var(--mb-ink)",
  },
  metricSub: {
    marginTop: 3,
    fontSize: 13,
    color: "var(--mb-ink-3)",
    lineHeight: 1.25,
  },
  readCard: {
    marginTop: 14,
    borderRadius: 28,
    padding: 18,
    background: "#172135",
    color: "#FFFFFF",
    boxShadow: "0 24px 54px -34px rgba(10,19,39,0.78)",
  },
  readHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  darkEyebrow: {
    fontSize: 10,
    letterSpacing: "0.18em",
    color: "#8D9BF1",
  },
  readTitle: {
    fontSize: 24,
    fontWeight: 900,
  },
  readCopy: {
    margin: "16px 0 0",
    fontSize: 16,
    lineHeight: 1.46,
    color: "#FFFFFF",
  },
  readButton: {
    marginTop: 16,
    minHeight: 48,
    borderRadius: 24,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.12)",
    color: "#FFFFFF",
    padding: "0 18px",
    fontWeight: 900,
  },
  whiteCard: {
    marginTop: 14,
    borderRadius: 28,
    padding: 18,
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(219,226,238,0.92)",
    boxShadow: "0 18px 48px -34px rgba(35,49,78,0.5)",
  },
  cardEyebrow: {
    fontSize: 11,
    letterSpacing: "0.18em",
    color: "var(--mb-accent-ink)",
    fontWeight: 900,
  },
  sectionTitle: {
    margin: "8px 0 0",
    fontSize: 26,
    lineHeight: 1.05,
    fontWeight: 900,
    color: "var(--mb-ink)",
  },
  sectionCopy: {
    margin: "7px 0 0",
    fontSize: 15,
    lineHeight: 1.36,
    color: "var(--mb-ink-3)",
  },
  nextActionStack: {
    display: "grid",
    gap: 0,
    marginTop: 14,
    borderRadius: 22,
    overflow: "hidden",
    border: "1px solid var(--mb-line-2)",
    background: "rgba(247,249,253,0.7)",
  },
  nextActionRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "center",
    gap: 12,
    minHeight: 76,
    padding: "14px 14px",
    border: "none",
    borderBottom: "1px solid var(--mb-line-2)",
    background: "rgba(255,255,255,0.64)",
    textAlign: "left",
    color: "var(--mb-ink)",
  },
  chartBlock: {
    marginTop: 16,
  },
  chartTitle: {
    fontSize: 17,
    fontWeight: 900,
    marginBottom: 12,
  },
  chartRow: {
    display: "grid",
    gap: 6,
  },
  chartRowTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    fontSize: 13,
    color: "var(--mb-ink-3)",
  },
  barTrack: {
    height: 9,
    borderRadius: 999,
    background: "rgba(120,132,160,0.16)",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #5C79D6, #D9AD5F)",
  },
  scenarioName: {
    display: "grid",
    gap: 7,
    marginTop: 16,
  },
  smallLabel: {
    fontSize: 10,
    letterSpacing: "0.16em",
    color: "var(--mb-ink-3)",
  },
  scenarioInput: {
    width: "100%",
    minHeight: 48,
    borderRadius: 18,
    border: "1px solid var(--mb-line-2)",
    background: "rgba(245,247,252,0.78)",
    padding: "0 14px",
    fontFamily: "var(--mb-font-body)",
    fontSize: 16,
    color: "var(--mb-ink)",
    outline: "none",
  },
  sliderStack: {
    display: "grid",
    gap: 16,
    marginTop: 18,
  },
  sliderRow: {
    display: "grid",
    gap: 9,
    paddingBottom: 14,
    borderBottom: "1px solid var(--mb-line-2)",
  },
  sliderTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
  },
  sliderLabel: {
    fontSize: 15,
    fontWeight: 850,
    color: "var(--mb-ink)",
  },
  sliderValue: {
    color: "var(--mb-accent-ink)",
    fontVariantNumeric: "tabular-nums",
  },
  range: {
    width: "100%",
    accentColor: "var(--mb-action)",
  },
  sliderBounds: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    fontSize: 11,
    color: "var(--mb-ink-4)",
  },
  scenarioActions: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 10,
    marginTop: 18,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 24,
    border: "none",
    background: "var(--mb-action)",
    color: "#FFFFFF",
    fontWeight: 900,
    padding: "0 12px",
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 24,
    border: "1px solid var(--mb-line-2)",
    background: "rgba(238,242,250,0.78)",
    color: "var(--mb-accent-ink)",
    fontWeight: 900,
    padding: "0 12px",
  },
  versionStack: {
    display: "grid",
    gap: 12,
    marginTop: 16,
  },
  versionRow: {
    display: "grid",
    gap: 12,
    padding: 14,
    borderRadius: 20,
    border: "1px solid var(--mb-line-2)",
    background: "linear-gradient(145deg, rgba(255,255,255,0.88), rgba(241,245,252,0.78))",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.72)",
  },
  versionTitle: {
    fontSize: 15,
    fontWeight: 900,
    color: "var(--mb-ink)",
  },
  versionMeta: {
    marginTop: 3,
    fontSize: 12,
    color: "var(--mb-ink-4)",
    lineHeight: 1.35,
  },
  versionSummary: {
    marginTop: 6,
    fontSize: 12,
    color: "var(--mb-ink-3)",
    lineHeight: 1.45,
  },
  versionActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
  },
  versionButton: {
    minHeight: 38,
    borderRadius: 999,
    border: "1px solid var(--mb-line-2)",
    background: "rgba(238,242,250,0.78)",
    color: "var(--mb-accent-ink)",
    fontWeight: 900,
    padding: "0 14px",
  },
  versionEmpty: {
    marginTop: 14,
    padding: "12px 14px",
    borderRadius: 18,
    border: "1px solid var(--mb-line-2)",
    background: "rgba(241,245,252,0.78)",
    color: "var(--mb-ink-3)",
    fontSize: 13,
  },
  miniList: {
    marginTop: 16,
  },
  miniTitle: {
    fontSize: 18,
    fontWeight: 900,
    color: "var(--mb-ink)",
  },
  miniRow: {
    display: "grid",
    gap: 3,
    padding: "12px 0",
    borderBottom: "1px solid var(--mb-line-2)",
    fontSize: 14,
    lineHeight: 1.35,
    color: "var(--mb-ink-3)",
  },
  floatingNote: {
    marginTop: 14,
    borderRadius: 18,
    padding: "12px 14px",
    background: "rgba(30,42,68,0.86)",
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 1.35,
  },
  chatDock: {
    position: "fixed",
    left: 14,
    right: 14,
    bottom: "calc(env(safe-area-inset-bottom, 0px) + 86px)",
    zIndex: 15,
  },
  chatPill: {
    boxShadow: "0 18px 42px -22px rgba(18,30,58,0.65)",
  },
  emptyCard: {
    borderRadius: 28,
    padding: 24,
    background: "#172135",
    color: "#FFFFFF",
    minHeight: 360,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  note: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 1.35,
    color: "#FFFFFF",
  },
};
