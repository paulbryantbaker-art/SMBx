import { useEffect, useMemo, useState, type CSSProperties } from "react";
import ModelRenderer from "../../models/ModelRenderer";
import { WorkSeal } from "../shared/WorkSeal";
import { V6EmptyState } from "../shared/EmptyState";
import { useModelStore } from "../../../lib/modelStore";
import {
  listSavedModelExecutions,
  type SavedModelExecution,
} from "../../../lib/modelExecutionPersistence";
import {
  buildModelFreshnessEnvelope,
  extractAssumptionsFromModelExecution,
  getModelDependencyRule,
  type ModelFreshnessEnvelope,
} from "@shared/modelStaleness";

export function V6ModelCanvasView({
  tabId,
  title,
  onTalkToYulia,
}: {
  tabId: string;
  title: string;
  onTalkToYulia?: (prompt: string) => void;
}) {
  const tab = useModelStore(s => s.tabs[tabId]);
  const updateAssumptions = useModelStore(s => s.updateAssumptions);
  const [savedRuns, setSavedRuns] = useState<SavedModelExecution[]>([]);
  const [readbackState, setReadbackState] = useState<"idle" | "loading" | "ready" | "local-only" | "error">("idle");

  const versionRows = useMemo(() => (tab?.versions || []).slice(0, 6), [tab?.versions]);
  const latestSavedRun = savedRuns[0];
  const dependencyRule = useMemo(() => getModelDependencyRule(tab?.type), [tab?.type]);
  const latestFreshness = useMemo(() => {
    if (!tab || !latestSavedRun) return null;
    return buildModelFreshnessEnvelope({
      modelType: tab.type,
      currentAssumptions: tab.assumptions,
      savedAssumptions: extractAssumptionsFromModelExecution(latestSavedRun),
      currentVersionNumber: tab.versionNumber,
      savedVersionNumber: latestSavedRun.clientVersionNumber,
    });
  }, [latestSavedRun, tab?.assumptions, tab?.type, tab?.versionNumber]);
  const prompt = tab
    ? `Read the active model "${tab.title}" version ${tab.versionNumber}. Compare the saved versions, explain what changed, and tell me the next model iteration to run before IOI, LOI, diligence, negotiation, or PMI.`
    : `Reopen ${title} as an interactive model canvas and preserve the model versions for Yulia.`;
  const optimizePrompt = tab
    ? `Optimize the active model "${tab.title}" version ${tab.versionNumber}. First use optimize_scenario with tabId "active"; then explain the best risk-adjusted model path, which inputs to test next, what a human can manually adjust on the canvas, and what downstream IOI, LOI, diligence, negotiation, or PMI artifacts become ready only after the rerun.`
    : `Reopen ${title} as an interactive model canvas, then optimize it through the saved model loop.`;

  useEffect(() => {
    if (!tab) return;
    let canceled = false;
    setReadbackState(prev => (prev === "ready" ? "ready" : "loading"));
    const timer = window.setTimeout(async () => {
      const result = await listSavedModelExecutions({
        canvasTabId: tab.id,
        dealId: tab.dealId ?? null,
        modelType: tab.type,
        currentAssumptions: tab.assumptions,
        currentVersionNumber: tab.versionNumber,
        limit: 12,
      });
      if (canceled) return;
      if (result.ok) {
        setSavedRuns(result.executions || []);
        setReadbackState("ready");
      } else if (result.skipped && result.reason === "auth_required") {
        setReadbackState("local-only");
      } else {
        setReadbackState("error");
      }
    }, 1100);
    return () => {
      canceled = true;
      window.clearTimeout(timer);
    };
  }, [tab?.id, tab?.dealId, tab?.type, tab?.versionNumber]);

  if (!tab) {
    return (
      <div className="wk-content" style={S.shell}>
        <V6EmptyState
          title={title}
          body="The canvas tab is here, but the in-memory model state is not loaded in this browser session. Ask Yulia to reopen it from the saved deal state or model run."
          action={{ label: "Ask Yulia to reopen", onClick: () => onTalkToYulia?.(prompt) }}
        />
      </div>
    );
  }

  return (
    <div className="wk-content" style={S.shell}>
      {/* Header card */}
      <div className="wkcard" style={S.header}>
        <div style={S.headerCopy}>
          <h1 style={S.title}>{tab.title}</h1>
          <p style={S.body}>
            This is a working model, not a one-time answer. Adjust EV, EBITDA, debt, working capital, tax, and terms; each change is saved as a version Yulia can read back into the deal loop.
          </p>
        </div>
        <div style={S.headerActions}>
          <div style={S.statusStack}>
            <div style={S.versionPill}>v{tab.versionNumber}</div>
            {/* WorkSeal replaces the old hash pill: same real outputHash, plus
                model id, saved version, and time. Unsigned when nothing has
                been persisted yet (or readback is local-only / errored). */}
            {latestSavedRun && readbackState !== "local-only" && readbackState !== "error" ? (
              <WorkSeal
                modelId={`MODEL.${tab.type}.v1`}
                version={latestSavedRun.clientVersionNumber}
                outputHash={latestSavedRun.outputHash}
                timestamp={latestSavedRun.createdAt}
              />
            ) : (
              <WorkSeal unsigned title={`No signature yet — saved-run readback: ${readbackLabel(readbackState)}`} />
            )}
            <div style={{ ...S.freshnessPill, ...freshnessTone(latestFreshness?.status) }}>
              {latestFreshness?.statusLabel || (latestSavedRun ? "checking" : "live")}
            </div>
          </div>
          <div style={S.actionStack}>
            <button className="wkbtn dark wk-tap" type="button" onClick={() => onTalkToYulia?.(optimizePrompt)}>
              Ask Yulia to optimize
            </button>
            <button className="wkbtn wk-tap" type="button" onClick={() => onTalkToYulia?.(prompt)}>
              Compare versions
            </button>
          </div>
        </div>
      </div>

      <div style={S.grid}>
        {/* Main model surface */}
        <div className="wkcard" style={S.modelSurface}>
          <ModelRenderer tabId={tabId} onTalkToYulia={onTalkToYulia} />
        </div>

        {/* Rail / version history */}
        <aside className="wkcard" style={S.rail}>
          <div style={S.railLabel}>Version trail</div>
          <h2 style={S.railTitle}>Scenario history</h2>
          <div style={S.railHint}>
            Local changes stay fast. Saved runs become audit-stamped artifacts that Yulia and external agents can read back later.
          </div>

          {/* Dependency / rerun triggers */}
          <div style={S.dependencyBox}>
            <div style={S.dependencyTitle}>Rerun if</div>
            <div style={S.triggerList}>
              {dependencyRule.rerunTriggers.slice(0, 4).map(trigger => (
                <span key={trigger} style={S.triggerChip}>{trigger}</span>
              ))}
            </div>
          </div>

          {/* Version rows */}
          <div style={S.versionStack}>
            {versionRows.map(version => (
              <button
                key={`${tab.id}-${version.versionNumber}-${version.createdAt}`}
                type="button"
                style={S.versionRow}
                onClick={() => {
                  const freshness = buildModelFreshnessEnvelope({
                    modelType: tab.type,
                    currentAssumptions: tab.assumptions,
                    savedAssumptions: version.assumptions,
                    currentVersionNumber: tab.versionNumber,
                    savedVersionNumber: version.versionNumber,
                  });
                  onTalkToYulia?.(`Explain ${tab.title} v${version.versionNumber}. Freshness: ${freshness.statusLabel}. ${freshness.rerunPrompt} Use these key outputs: ${JSON.stringify(version.keyOutputs)}. Then compare it to the latest version and identify the next model input to test.`);
                }}
              >
                <span style={S.versionIndex}>v{version.versionNumber}</span>
                <span style={S.versionText}>
                  <strong>{version.changeReason}</strong>
                  <span>{formatVersionTime(version.createdAt)}</span>
                </span>
              </button>
            ))}
            {!versionRows.length && (
              <div style={S.emptyRail}>Adjust an assumption to start the scenario trail.</div>
            )}
          </div>

          <div style={S.divider} />

          {/* Saved runs */}
          <div style={S.railLabel}>Saved runs</div>
          <h2 style={S.railTitleSmall}>Agent readback</h2>
          <div style={S.savedStack}>
            {savedRuns.slice(0, 6).map(run => {
              const assumptions = extractSavedAssumptions(run);
              const freshness = buildModelFreshnessEnvelope({
                modelType: tab.type,
                currentAssumptions: tab.assumptions,
                savedAssumptions: extractAssumptionsFromModelExecution(run),
                currentVersionNumber: tab.versionNumber,
                savedVersionNumber: run.clientVersionNumber,
              });
              return (
                <article key={`${run.executionId}-${run.outputHash}`} style={S.savedRun}>
                  <div style={S.savedHeader}>
                    <span style={S.savedVersion}>v{run.clientVersionNumber}</span>
                    <span style={S.savedHash}>{shortHash(run.outputHash)}</span>
                  </div>
                  <div style={{ ...S.savedFreshness, ...freshnessTone(freshness.status) }}>
                    {freshness.statusLabel}
                  </div>
                  <div style={S.savedMeta}>{formatSavedTime(run.createdAt)}</div>
                  <div style={S.savedOutputs}>{formatKeyOutputs(run)}</div>
                  {freshness.status !== "current" && freshness.status !== "unknown" && (
                    <div style={S.freshnessReason}>{summarizeFreshness(freshness)}</div>
                  )}
                  <div style={S.savedActions}>
                    <button
                      className="wkbtn"
                      type="button"
                      style={S.miniButton}
                      onClick={() => onTalkToYulia?.(`Read saved model execution ${run.executionId} (${tab.title} v${run.clientVersionNumber}, output hash ${run.outputHash}). Freshness: ${freshness.statusLabel}. ${freshness.rerunPrompt} Recompute action: ${run.recomputePlan?.actionKey || run.recomputePlan?.surfaceActionId || "execute_model"}. Explain what changed, what this unlocks in the deal lifecycle, and what model input should be tested next.`)}
                    >
                      Explain
                    </button>
                    <button
                      className="wkbtn"
                      type="button"
                      style={S.miniButton}
                      onClick={() => {
                        updateAssumptions(tab.id, tab.assumptions);
                        onTalkToYulia?.(`I reran ${tab.title} from the current model canvas assumptions because ${summarizeFreshness(freshness)}. Recompute action: ${run.recomputePlan?.actionKey || run.recomputePlan?.surfaceActionId || "execute_model"}. Treat the new saved version as the next iterative output, preserve parent-output lineage, and identify which downstream deal artifacts become current.`);
                      }}
                    >
                      Rerun
                    </button>
                    <button
                      className="wkbtn"
                      type="button"
                      style={S.miniButton}
                      disabled={!Object.keys(assumptions).length}
                      onClick={() => updateAssumptions(tab.id, assumptions)}
                    >
                      Restore
                    </button>
                  </div>
                </article>
              );
            })}
            {!savedRuns.length && (
              <div style={S.emptyRail}>
                {readbackState === "local-only"
                  ? "Signed-in workspaces save the durable model run trail. Local scenario history is still active here."
                  : readbackState === "loading"
                    ? "Saving the latest model version..."
                    : "No saved runs yet. Adjust an assumption and this model will write its first durable version."}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function formatVersionTime(value: number): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "just now";
  return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function shortHash(value?: string | null): string {
  if (!value) return "not saved";
  return value.length > 12 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;
}

function readbackLabel(state: "idle" | "loading" | "ready" | "local-only" | "error"): string {
  if (state === "loading") return "saving";
  if (state === "local-only") return "local";
  if (state === "error") return "retry";
  return "pending";
}

function formatSavedTime(value?: string | null): string {
  if (!value) return "Saved run";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Saved run";
  return `Saved ${date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`;
}

function extractSavedAssumptions(run: SavedModelExecution): Record<string, any> {
  const fromSnapshot = run.versionSnapshot?.assumptions;
  if (fromSnapshot && typeof fromSnapshot === "object" && !Array.isArray(fromSnapshot)) {
    return fromSnapshot as Record<string, any>;
  }
  const fromModel = run.modelOutput?.inputs;
  if (fromModel && typeof fromModel === "object" && !Array.isArray(fromModel)) {
    return fromModel as Record<string, any>;
  }
  return {};
}

function formatKeyOutputs(run: SavedModelExecution): string {
  const keyOutputs = run.versionSnapshot?.keyOutputs || run.modelOutput?.keyOutputs || {};
  if (!keyOutputs || typeof keyOutputs !== "object" || Array.isArray(keyOutputs)) return "Saved artifact";
  const entries = Object.entries(keyOutputs).filter(([, value]) => value !== undefined && value !== null).slice(0, 2);
  if (!entries.length) return "Saved artifact";
  return entries.map(([key, value]) => `${humanizeKey(key)} ${formatOutputValue(value)}`).join(" · ");
}

function summarizeFreshness(freshness: ModelFreshnessEnvelope): string {
  const changes = [...freshness.criticalInputChanges, ...freshness.sensitiveInputChanges]
    .map(change => change.label)
    .slice(0, 3);
  if (changes.length) return `${changes.join(", ")} changed`;
  return freshness.status === "superseded" ? "a newer version exists" : freshness.statusLabel.toLowerCase();
}

function freshnessTone(status?: ModelFreshnessEnvelope["status"] | null): CSSProperties {
  if (status === "needs_rerun") {
    return {
      background: "var(--st-risk-bg)",
      borderColor: "var(--st-risk-dot)",
      color: "var(--st-risk-fg)",
    };
  }
  if (status === "superseded") {
    return {
      background: "var(--st-missing-bg)",
      borderColor: "var(--st-missing-dot)",
      color: "var(--st-missing-fg)",
    };
  }
  if (status === "current") {
    return {
      background: "var(--st-good-bg)",
      borderColor: "var(--st-good-dot)",
      color: "var(--st-good-fg)",
    };
  }
  return {};
}

function humanizeKey(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/_/g, " ").toLowerCase();
}

function formatOutputValue(value: unknown): string {
  if (typeof value === "number") {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
  if (typeof value === "boolean") return value ? "yes" : "no";
  return String(value);
}

const S: Record<string, CSSProperties> = {
  shell: {
    maxWidth: 1280,
    margin: "0 auto",
  },
  /* header: the warm rested frame (fusion Wave C2). The chrome card takes
     the composer's resting elevation; the model BODY below stays pure
     paper — flat wkcard, hairlines, mono numerals — untouched. */
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "flex-start",
    padding: 24,
    marginBottom: 18,
    background: "var(--surface)",
    borderRadius: "var(--wk-radius-card)",
    boxShadow: "var(--wk-elev-card)",
  },
  headerCopy: {
    minWidth: 0,
    maxWidth: 760,
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  actionStack: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  statusStack: {
    display: "grid",
    justifyItems: "end",
    gap: 6,
  },
  /* rail label: sentence-case visible label (eyebrow-lock 2026-06-01 —
     mono-caps kickers are retired; these carry real section meaning) */
  railLabel: {
    color: "var(--ink-3)",
    fontSize: 12,
    fontWeight: 600,
  },
  title: {
    margin: "5px 0 8px",
    color: "var(--ink)",
    fontFamily: "var(--font-display)",
    fontSize: "clamp(28px, 4vw, 48px)",
    lineHeight: 1,
    letterSpacing: "-0.03em",
  },
  body: {
    color: "var(--ink-2)",
    margin: 0,
    fontSize: 14,
    lineHeight: 1.55,
    maxWidth: 740,
  },
  /* version pill: accent-soft bg, accent-strong text, mono */
  versionPill: {
    minWidth: 54,
    height: 38,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    paddingInline: 14,
    background: "var(--accent-soft)",
    color: "var(--accent-strong)",
    fontFamily: "var(--font-mono)",
    fontWeight: 800,
    fontVariantNumeric: "tabular-nums",
  },
  /* freshness pill: base style; freshnessTone() merges status-specific --st-* colours */
  freshnessPill: {
    minWidth: 76,
    minHeight: 24,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    padding: "0 10px",
    background: "var(--surface-2)",
    color: "var(--ink-3)",
    border: "1px solid var(--line)",
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    letterSpacing: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(260px, 320px)",
    gap: 18,
    alignItems: "start",
  },
  /* modelSurface: zero padding so ModelRenderer fills flush */
  modelSurface: {
    padding: 0,
    overflow: "hidden",
  },
  rail: {
    padding: 18,
    position: "sticky",
    top: 12,
  },
  railTitle: {
    margin: "4px 0 14px",
    fontSize: 22,
    fontWeight: 600,
    color: "var(--ink)",
    letterSpacing: "-0.03em",
  },
  railTitleSmall: {
    margin: "4px 0 10px",
    fontSize: 17,
    fontWeight: 600,
    color: "var(--ink)",
    letterSpacing: "-0.03em",
  },
  railHint: {
    margin: "-4px 0 14px",
    color: "var(--ink-2)",
    fontSize: 12,
    lineHeight: 1.45,
  },
  /* dependency box: flat surface-2, hairline border */
  dependencyBox: {
    border: "1px solid var(--line)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    background: "var(--surface-2)",
  },
  dependencyTitle: {
    color: "var(--ink)",
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 8,
  },
  triggerList: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },
  triggerChip: {
    borderRadius: 999,
    padding: "5px 8px",
    background: "var(--surface)",
    border: "1px solid var(--line)",
    color: "var(--ink-2)",
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    lineHeight: 1,
  },
  versionStack: {
    display: "grid",
    gap: 10,
  },
  /* version row button: flat surface bg, hairline border, no glass */
  versionRow: {
    width: "100%",
    display: "flex",
    gap: 12,
    alignItems: "center",
    textAlign: "left",
    border: "1px solid var(--line)",
    borderRadius: 12,
    background: "var(--surface)",
    padding: 12,
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(25,24,19,.06)",
  },
  /* version index badge: accent bg, on-accent text, mono */
  versionIndex: {
    width: 44,
    height: 44,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    background: "var(--accent)",
    color: "var(--on-accent)",
    fontFamily: "var(--font-mono)",
    fontWeight: 800,
    fontVariantNumeric: "tabular-nums",
    flex: "0 0 auto",
    fontSize: 13,
  },
  versionText: {
    display: "grid",
    gap: 3,
    color: "var(--ink)",
    fontSize: 13,
  },
  emptyRail: {
    border: "1px dashed var(--line-2)",
    borderRadius: 12,
    padding: 14,
    color: "var(--ink-3)",
    fontSize: 13,
    lineHeight: 1.45,
  },
  divider: {
    height: 1,
    background: "var(--line)",
    margin: "18px 0",
  },
  savedStack: {
    display: "grid",
    gap: 10,
  },
  /* saved run card: flat surface bg, hairline border */
  savedRun: {
    border: "1px solid var(--line)",
    borderRadius: 12,
    background: "var(--surface)",
    padding: 12,
    boxShadow: "0 1px 2px rgba(25,24,19,.06)",
  },
  savedHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  /* saved version label: mono, ink, tabular */
  savedVersion: {
    color: "var(--ink)",
    fontFamily: "var(--font-mono)",
    fontWeight: 800,
    fontVariantNumeric: "tabular-nums",
  },
  /* saved hash: mono, ink-3, small */
  savedHash: {
    color: "var(--ink-3)",
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    letterSpacing: 0,
  },
  savedMeta: {
    marginTop: 4,
    color: "var(--ink-3)",
    fontSize: 12,
  },
  /* freshness badge inside saved run — base; freshnessTone() merges --st-* */
  savedFreshness: {
    width: "max-content",
    borderRadius: 999,
    padding: "5px 8px",
    marginTop: 8,
    border: "1px solid var(--line)",
    background: "var(--surface-2)",
    color: "var(--ink-3)",
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    letterSpacing: 0,
  },
  /* saved outputs: mono for all figures */
  savedOutputs: {
    marginTop: 8,
    color: "var(--ink)",
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    lineHeight: 1.4,
  },
  /* freshness reason callout: risk-soft bg */
  freshnessReason: {
    marginTop: 8,
    borderRadius: 10,
    padding: "8px 10px",
    background: "var(--st-risk-bg)",
    color: "var(--ink-2)",
    fontSize: 12,
    lineHeight: 1.35,
  },
  savedActions: {
    display: "flex",
    gap: 8,
    marginTop: 10,
  },
  miniButton: {
    minHeight: 32,
    padding: "0 12px",
    fontSize: 12,
  },
};
