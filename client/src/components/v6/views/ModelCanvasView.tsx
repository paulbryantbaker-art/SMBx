import { useEffect, useMemo, useState, type CSSProperties } from "react";
import ModelRenderer from "../../models/ModelRenderer";
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
      <div className="m-fade-up m-page-flow" style={S.shell}>
        <section className="m-card" style={S.empty}>
          <div className="mono" style={S.eyebrow}>MODEL CANVAS · NOT LOADED</div>
          <h1 style={S.title}>{title}</h1>
          <p style={S.body}>
            The canvas tab is here, but the in-memory model state is not loaded in this browser session. Ask Yulia to reopen it from the saved deal state or model run.
          </p>
          <button className="m-btn filled" type="button" onClick={() => onTalkToYulia?.(prompt)}>
            Ask Yulia to reopen
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="m-fade-up m-page-flow" style={S.shell}>
      <section className="m-card" style={S.header}>
        <div style={S.headerCopy}>
          <div className="mono" style={S.eyebrow}>MODEL CANVAS · ITERATIVE</div>
          <h1 style={S.title}>{tab.title}</h1>
          <p style={S.body}>
            This is a working model, not a one-time answer. Adjust EV, EBITDA, debt, working capital, tax, and terms; each change is saved as a version Yulia can read back into the deal loop.
          </p>
        </div>
        <div style={S.headerActions}>
          <div style={S.statusStack}>
            <div style={S.versionPill}>v{tab.versionNumber}</div>
            <div className="mono" style={S.hashPill}>
              {latestSavedRun ? shortHash(latestSavedRun.outputHash) : readbackLabel(readbackState)}
            </div>
            <div className="mono" style={{ ...S.freshnessPill, ...freshnessTone(latestFreshness?.status) }}>
              {latestFreshness?.statusLabel || (latestSavedRun ? "checking" : "live")}
            </div>
          </div>
          <button className="m-btn filled" type="button" onClick={() => onTalkToYulia?.(prompt)}>
            Ask Yulia to compare
          </button>
        </div>
      </section>

      <section style={S.grid}>
        <div className="m-card" style={S.modelSurface}>
          <ModelRenderer tabId={tabId} />
        </div>
        <aside className="m-card" style={S.rail}>
          <div className="mono" style={S.eyebrow}>VERSION TRAIL</div>
          <h2 style={S.railTitle}>Scenario history</h2>
          <div style={S.railHint}>
            Local changes stay fast. Saved runs become audit-stamped artifacts that Yulia and external agents can read back later.
          </div>
          <div style={S.dependencyBox}>
            <div style={S.dependencyTitle}>Rerun if</div>
            <div style={S.triggerList}>
              {dependencyRule.rerunTriggers.slice(0, 4).map(trigger => (
                <span key={trigger} style={S.triggerChip}>{trigger}</span>
              ))}
            </div>
          </div>
          <div style={S.versionStack}>
            {versionRows.map(version => (
              <button
                key={`${tab.id}-${version.versionNumber}-${version.createdAt}`}
                type="button"
                className="m-state"
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
          <div className="mono" style={S.eyebrow}>SAVED RUNS</div>
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
                    <span className="mono" style={S.savedHash}>{shortHash(run.outputHash)}</span>
                  </div>
                  <div className="mono" style={{ ...S.savedFreshness, ...freshnessTone(freshness.status) }}>
                    {freshness.statusLabel}
                  </div>
                  <div style={S.savedMeta}>{formatSavedTime(run.createdAt)}</div>
                  <div style={S.savedOutputs}>{formatKeyOutputs(run)}</div>
                  {freshness.status !== "current" && freshness.status !== "unknown" && (
                    <div style={S.freshnessReason}>{summarizeFreshness(freshness)}</div>
                  )}
                  <div style={S.savedActions}>
                    <button
                      className="m-btn ghost"
                      type="button"
                      style={S.miniButton}
                      onClick={() => onTalkToYulia?.(`Read saved model execution ${run.executionId} (${tab.title} v${run.clientVersionNumber}, output hash ${run.outputHash}). Freshness: ${freshness.statusLabel}. ${freshness.rerunPrompt} Recompute action: ${run.recomputePlan?.actionKey || run.recomputePlan?.surfaceActionId || "execute_model"}. Explain what changed, what this unlocks in the deal lifecycle, and what model input should be tested next.`)}
                    >
                      Explain
                    </button>
                    <button
                      className="m-btn ghost"
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
                      className="m-btn ghost"
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
      </section>
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
      background: "rgba(188, 98, 34, 0.13)",
      borderColor: "rgba(188, 98, 34, 0.26)",
      color: "#8A3D12",
    };
  }
  if (status === "superseded") {
    return {
      background: "rgba(84, 106, 147, 0.12)",
      borderColor: "rgba(84, 106, 147, 0.22)",
      color: "var(--m-on-surface-mid)",
    };
  }
  if (status === "current") {
    return {
      background: "rgba(61, 124, 94, 0.13)",
      borderColor: "rgba(61, 124, 94, 0.24)",
      color: "#2F6C50",
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
  empty: {
    padding: 28,
    maxWidth: 760,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "flex-start",
    padding: 24,
    marginBottom: 18,
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
  statusStack: {
    display: "grid",
    justifyItems: "end",
    gap: 6,
  },
  eyebrow: {
    color: "var(--m-on-surface-mid)",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.14em",
  },
  title: {
    margin: "5px 0 8px",
    color: "var(--m-on-surface)",
    fontFamily: "var(--font-display)",
    fontSize: "clamp(28px, 4vw, 48px)",
    lineHeight: 1,
    letterSpacing: "-0.03em",
  },
  body: {
    color: "var(--m-on-surface-var)",
    margin: 0,
    fontSize: 14,
    lineHeight: 1.55,
    maxWidth: 740,
  },
  versionPill: {
    minWidth: 54,
    height: 38,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    paddingInline: 14,
    background: "var(--m-primary-container)",
    color: "var(--m-on-primary-container)",
    fontWeight: 800,
    fontVariantNumeric: "tabular-nums",
  },
  hashPill: {
    minWidth: 76,
    minHeight: 24,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    padding: "0 10px",
    background: "rgba(46,92,138,0.1)",
    color: "var(--m-on-surface-mid)",
    border: "1px solid rgba(46,92,138,0.12)",
    fontSize: 10,
    letterSpacing: 0,
  },
  freshnessPill: {
    minWidth: 76,
    minHeight: 24,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    padding: "0 10px",
    background: "rgba(46,92,138,0.08)",
    color: "var(--m-on-surface-mid)",
    border: "1px solid rgba(46,92,138,0.12)",
    fontSize: 10,
    letterSpacing: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(260px, 320px)",
    gap: 18,
    alignItems: "start",
  },
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
    color: "var(--m-on-surface)",
    letterSpacing: "-0.03em",
  },
  railTitleSmall: {
    margin: "4px 0 10px",
    fontSize: 17,
    color: "var(--m-on-surface)",
    letterSpacing: "-0.03em",
  },
  railHint: {
    margin: "-4px 0 14px",
    color: "var(--m-on-surface-mid)",
    fontSize: 12,
    lineHeight: 1.45,
  },
  dependencyBox: {
    border: "1px solid var(--m-outline-var)",
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    background: "rgba(255,255,255,0.62)",
  },
  dependencyTitle: {
    color: "var(--m-on-surface)",
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
    background: "rgba(46,92,138,0.08)",
    color: "var(--m-on-surface-mid)",
    fontSize: 11,
    lineHeight: 1,
  },
  versionStack: {
    display: "grid",
    gap: 10,
  },
  versionRow: {
    width: "100%",
    display: "flex",
    gap: 12,
    alignItems: "center",
    textAlign: "left",
    border: "1px solid var(--m-outline-var)",
    borderRadius: 16,
    background: "rgba(255,255,255,0.72)",
    padding: 12,
    cursor: "pointer",
  },
  versionIndex: {
    width: 44,
    height: 44,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: "var(--m-primary)",
    color: "var(--m-on-primary)",
    fontWeight: 800,
    fontVariantNumeric: "tabular-nums",
    flex: "0 0 auto",
  },
  versionText: {
    display: "grid",
    gap: 3,
    color: "var(--m-on-surface)",
    fontSize: 13,
  },
  emptyRail: {
    border: "1px dashed var(--m-outline-var)",
    borderRadius: 16,
    padding: 14,
    color: "var(--m-on-surface-mid)",
    fontSize: 13,
    lineHeight: 1.45,
  },
  divider: {
    height: 1,
    background: "var(--m-outline-var)",
    margin: "18px 0",
    opacity: 0.7,
  },
  savedStack: {
    display: "grid",
    gap: 10,
  },
  savedRun: {
    border: "1px solid var(--m-outline-var)",
    borderRadius: 16,
    background: "rgba(255,255,255,0.78)",
    padding: 12,
  },
  savedHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  savedVersion: {
    color: "var(--m-on-surface)",
    fontWeight: 800,
    fontVariantNumeric: "tabular-nums",
  },
  savedHash: {
    color: "var(--m-on-surface-mid)",
    fontSize: 10,
    letterSpacing: 0,
  },
  savedMeta: {
    marginTop: 4,
    color: "var(--m-on-surface-mid)",
    fontSize: 12,
  },
  savedFreshness: {
    width: "max-content",
    borderRadius: 999,
    padding: "5px 8px",
    marginTop: 8,
    border: "1px solid rgba(46,92,138,0.12)",
    background: "rgba(46,92,138,0.08)",
    color: "var(--m-on-surface-mid)",
    fontSize: 10,
    letterSpacing: 0,
  },
  savedOutputs: {
    marginTop: 8,
    color: "var(--m-on-surface)",
    fontSize: 12,
    lineHeight: 1.4,
  },
  freshnessReason: {
    marginTop: 8,
    borderRadius: 12,
    padding: "8px 10px",
    background: "rgba(188, 98, 34, 0.08)",
    color: "var(--m-on-surface-var)",
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
