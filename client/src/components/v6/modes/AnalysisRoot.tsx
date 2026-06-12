import { useMemo, useState } from "react";
import { V6Icon } from "../icons";
import { V6DocStatus, type DocStatusKind } from "./cards";
import type { IconName, OpenTab } from "../types";
import type { User } from "../../../hooks/useAuth";
import { useV6WorkspaceData, type WorkspaceDeal } from "../../../hooks/useV6WorkspaceData";
import { GATE_MAP } from "@shared/gateRegistry";
import type { ModelPreference } from "../../../lib/modelPreference";
import {
  analysisActionForTool,
  executeSurfaceAction,
  pickActionDeal,
  primaryAnalysisActionForJourney,
  runActionAnalysis,
  yuliaComparePrompt,
} from "../../../lib/v6ActionContracts";
import type { SurfaceActionId } from "../../../lib/v6SurfaceActions";
import { VERDICT_MATERIAL } from "../shared/verdictMaterial";

interface Tool { id: string; name: string; sub: string; icon: IconName; actionId?: SurfaceActionId }

const TOOLS: Tool[] = [
  { id: "tool-recast",      name: "Recast P&L",       sub: "Find honest add-backs",          icon: "chart",  actionId: "run_recast_analysis" },
  { id: "tool-qoe",         name: "QoE",              sub: "Earnings quality + proof",       icon: "search", actionId: "run_qoe_analysis" },
  { id: "tool-comps",       name: "Comps",            sub: "Public + private benchmarks",    icon: "chart",  actionId: "run_comps_analysis" },
  { id: "tool-val",         name: "Valuation model",  sub: "Multiples + pricing bridge",     icon: "chart",  actionId: "run_valuation_analysis" },
  { id: "tool-dcf",         name: "DCF",              sub: "Growth, WACC, terminal value",   icon: "chart",  actionId: "run_dcf_analysis" },
  { id: "tool-lbo",         name: "LBO",              sub: "Leverage, MOIC, IRR",            icon: "chart",  actionId: "run_lbo_analysis" },
  { id: "tool-sensitivity", name: "Sensitivity",      sub: "Scenario table with sliders",    icon: "chart",  actionId: "run_sensitivity_analysis" },
  { id: "tool-tax",         name: "Tax impact",       sub: "Allocation + sign-off map",      icon: "deal",   actionId: "run_tax_impact_analysis" },
  { id: "tool-earnout",     name: "Earnout",          sub: "Contingent value scenarios",     icon: "deal",   actionId: "run_earnout_analysis" },
  { id: "tool-buyer",       name: "Buyer fit",        sub: "Score against your thesis",      icon: "deal",   actionId: "run_buyer_fit_analysis" },
  { id: "tool-sba",         name: "SBA structure",    sub: "Model leverage scenarios",       icon: "chart",  actionId: "run_sba_analysis" },
  { id: "tool-wc",          name: "Working capital",  sub: "Peg, true-up, and target NWC",   icon: "chart" },
  { id: "tool-captable",    name: "Cap table",        sub: "Dilution + waterfall scenarios", icon: "deal" },
  { id: "tool-covenant",    name: "Covenant check",   sub: "Compliance + headroom over time", icon: "chart" },
  { id: "tool-compare",     name: "Compare deals",    sub: "Side-by-side next-action read",  icon: "deal",   actionId: "compare_deals" },
];

const TOOLS_BY_ID: Record<string, Tool> = Object.fromEntries(TOOLS.map(t => [t.id, t]));

/* Family tonal fills (judged tonal pass): the 15-card catalog gets
   group-colored icon tiles ONLY — 15 textures would be loud; tonal chips
   carry the families. The judged family hexes ARE the verdictMaterial tone
   trios (valuation→#E6F3EC/#3F8A6A, diligence→#EAF0FA/#4A7AB0,
   structure/tax/legal→#FAF1E1/#9C7128) — consume, never restate. */
const FAMILY_TONE = {
  valuation: VERDICT_MATERIAL.pursue.tone,
  diligence: VERDICT_MATERIAL.baseline.tone,
  structure: VERDICT_MATERIAL.watch.tone,
} as const;

const TOOL_FAMILY: Record<string, keyof typeof FAMILY_TONE> = {
  "tool-recast": "valuation",
  "tool-comps": "valuation",
  "tool-val": "valuation",
  "tool-dcf": "valuation",
  "tool-sensitivity": "valuation",
  "tool-qoe": "diligence",
  "tool-buyer": "diligence",
  "tool-wc": "diligence",
  "tool-compare": "diligence",
  "tool-tax": "structure",
  "tool-earnout": "structure",
  "tool-sba": "structure",
  "tool-lbo": "structure",
  "tool-captable": "structure",
  "tool-covenant": "structure",
};

function toolTone(toolId: string) {
  return FAMILY_TONE[TOOL_FAMILY[toolId] ?? "diligence"];
}

// Portfolio-aware recommendation: a deal's gate implies which analyses move it
// forward (methodology gate → required models). Deterministic first pass; the
// "Ask Yulia to recommend" button hands portfolio-wide judgment to the model.
function timeOf(iso?: string | null): number {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : 0;
}

function fmtRelative(iso?: string | null): string {
  if (!iso) return "—";
  const t = timeOf(iso);
  if (!t) return "—";
  const min = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}

function formatSlug(input: string): string {
  return (input || "Analysis").replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function mapRunStatus(s?: string | null): DocStatusKind {
  const v = (s || "").toLowerCase();
  if (/generat|queue|run|progress|live|pending/.test(v)) return "live";
  return "saved";
}

function recommendedToolIdsForGate(gate: string): string[] {
  const stage = gate.match(/(\d+)\s*$/)?.[1] ?? "";
  switch (stage) {
    case "0":
    case "1": return ["tool-buyer", "tool-comps", "tool-val"];
    case "2": return ["tool-val", "tool-comps", "tool-dcf", "tool-recast"];
    case "3": return ["tool-qoe", "tool-recast", "tool-wc", "tool-sensitivity"];
    case "4": return ["tool-lbo", "tool-sba", "tool-tax", "tool-captable"];
    case "5": return ["tool-covenant", "tool-tax", "tool-compare"];
    default:  return ["tool-val", "tool-qoe", "tool-wc"];
  }
}

export function V6AnalysisRoot({
  openTab,
  onTalkToYulia,
  user,
  modelPreference,
}: {
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
  user: User | null;
  modelPreference?: ModelPreference;
}) {
  const workspace = useV6WorkspaceData(user);
  const deal = pickActionDeal(workspace.deals);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const runAnalysisAction = async (tool?: Tool, dealOverride?: WorkspaceDeal) => {
    setActionError(null);
    setActionNote(null);

    if (tool?.id === "tool-compare") {
      const compareDeals = workspace.deals.slice(0, 4);
      if (compareDeals.length < 2) {
        openTab({
          kind: "analysis",
          title: "Deal comparison",
          tool: tool.id,
          comparisonData: compareDeals,
        });
        onTalkToYulia?.(yuliaComparePrompt(workspace.deals));
        return;
      }
      setBusyAction(tool.id);
      try {
        await executeSurfaceAction({
          actionId: "compare_deals",
          deals: compareDeals,
          openTab,
          title: "Deal comparison",
          modelPreference,
          requestedFrom: "analysis_root",
          onNote: setActionNote,
        });
      } catch (e: any) {
        setActionError(e?.message || "Could not compare deals.");
      } finally {
        setBusyAction(null);
      }
      return;
    }

    const target = dealOverride ?? deal;
    if (tool?.actionId && target) {
      setBusyAction(tool.id);
      try {
        await executeSurfaceAction({
          actionId: tool.actionId,
          deal: target,
          openTab,
          modelPreference,
          requestedFrom: "analysis_root",
          onNote: setActionNote,
          onTalkToYulia,
        });
        void workspace.refresh();
      } catch (e: any) {
        setActionError(e?.message || `Could not run ${tool.name}.`);
      } finally {
        setBusyAction(null);
      }
      return;
    }

    const mapping = tool ? analysisActionForTool(tool.id, target?.journey_type) : primaryAnalysisActionForJourney(target?.journey_type);
    if (!target || !mapping) {
      openTab({ kind: "analysis", title: tool ? `New ${tool.name}` : "New analysis", tool: tool?.id });
      onTalkToYulia?.(tool
        ? `Run ${tool.name} on the active deal. Use the deal data already in the workspace and tell me what needs action.`
        : "Run the most useful analysis on the active deal and open the result.");
      return;
    }

    setBusyAction(tool?.id ?? "new-analysis");
    try {
      await runActionAnalysis({
        deal: target,
        analysisType: mapping.analysisType,
        menuItemSlug: mapping.menuItemSlug,
        label: mapping.label,
        openTab,
        modelPreference,
        requestedFrom: "analysis_root",
        onNote: setActionNote,
      });
      void workspace.refresh();
    } catch (e: any) {
      setActionError(e?.message || "Could not run analysis.");
    } finally {
      setBusyAction(null);
    }
  };

  const q = query.trim().toLowerCase();
  const filtered = q
    ? TOOLS.filter(t => t.name.toLowerCase().includes(q) || t.sub.toLowerCase().includes(q))
    : TOOLS;

  // Recently run = the user's real analysis deliverables (those with an
  // analysis_run_id), newest first. Replaces the hardcoded sample table.
  const recentRuns = useMemo(
    () => workspace.deliverables
      .filter(d => d.analysis_run_id != null)
      .map(d => ({
        analysisRunId: d.analysis_run_id as number,
        title: d.name || formatSlug(d.slug),
        deal: d.deal_name || "Deal",
        status: mapRunStatus(d.analysis_status || d.status),
        updatedIso: d.completed_at || d.updated_at || d.created_at,
        analysisType: d.analysis_type ?? undefined,
      }))
      .sort((a, b) => timeOf(b.updatedIso) - timeOf(a.updatedIso))
      .slice(0, 8),
    [workspace.deliverables],
  );

  return (
    <div className="wk-content m-fade-up m-page-flow" style={{ maxWidth: 1180, margin: "0 auto" }}>
      <div className="pg-head">
        <div>
          <div className="pg-title">Analyses</div>
          <p className="pg-sub">Yulia recommends what to run next per deal and gate — or search the full methodology catalog.</p>
        </div>
        <div className="pg-actions">
          <button
            className="wkbtn primary"
            aria-label="New analysis"
            type="button"
            onClick={() => { void runAnalysisAction(); }}
            disabled={busyAction === "new-analysis"}
          >
            <V6Icon name="plus" size={12} />
            <span style={{ marginLeft: 6 }}>{busyAction === "new-analysis" ? "Running..." : "New analysis"}</span>
          </button>
        </div>
      </div>

      {(actionError || actionNote || workspace.error) && (
        <div className={actionError || workspace.error ? "wkerr" : "wknote"}>
          {actionError || workspace.error || actionNote}
        </div>
      )}

      {/* Portfolio-aware recommendations — each deal's gate maps to the next analyses */}
      <div className="wksec">
        <div className="pg-head" style={{ alignItems: "center" }}>
          <div>
            <div className="wksec-title" style={{ marginBottom: 2 }}>Recommended for your portfolio</div>
            <p className="pg-sub" style={{ marginTop: 2 }}>Each deal's gate maps to the analyses that move it forward.</p>
          </div>
          <div className="pg-actions">
            <button
              className="wkbtn"
              type="button"
              onClick={() => onTalkToYulia?.("Look across my whole portfolio — for each deal, recommend the analyses and documents to run next based on its gate, status, and blockers, and tell me which deal to focus on first.")}
            >
              Ask Yulia to recommend
            </button>
          </div>
        </div>
        {workspace.deals.length > 0 ? (
          <div className="wkgrid g2">
            {workspace.deals.slice(0, 4).map(d => {
              const gate = GATE_MAP[d.current_gate || ""];
              const recs = recommendedToolIdsForGate(d.current_gate || "")
                .map(id => TOOLS_BY_ID[id])
                .filter(Boolean);
              return (
                <div key={d.id} className="wkcard" style={{ boxShadow: "var(--wk-elev-card)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <div className="wkcard-title" style={{ fontSize: "0.98rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {d.business_name || `Deal #${d.id}`}
                    </div>
                    <span className="statpill diligence" style={{ flexShrink: 0 }}>
                      <span className="d" />{(d.current_gate || "—").toUpperCase()}{gate ? ` · ${gate.name}` : ""}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                    {recs.map(t => (
                      <button
                        key={t.id}
                        className="fchip wk-tap"
                        type="button"
                        disabled={busyAction === t.id}
                        onClick={() => { void runAnalysisAction(t, d); }}
                      >
                        {busyAction === t.id ? "Running…" : t.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="wkcard">
            <div className="wkcard-title">No deals in your portfolio yet</div>
            <div className="wkcard-sub">Add a deal and Yulia will recommend the analyses and documents that fit its stage. Meanwhile, browse the full catalog below.</div>
          </div>
        )}
      </div>

      {/* Searchable full catalog (show all) */}
      <div className="wksec">
        <div className="wksec-title">All analyses</div>
        <div className="filterbar">
          <label className="fsearch">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" /><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search analyses…" style={{ border: 0, background: "transparent", outline: "none", color: "var(--ink)", font: "inherit", width: "100%", minWidth: 120 }} />
          </label>
          <span className="grow" />
          <span className="muted">{filtered.length} of {TOOLS.length}</span>
        </div>
        {filtered.length > 0 ? (
          <div className="wkgrid g3" style={{ marginTop: 14 }}>
            {filtered.map(t => (
              <div
                key={t.id}
                className="wkcard wk-tap"
                style={{ boxShadow: "var(--wk-elev-card)", cursor: "pointer" }}
                onClick={() => { void runAnalysisAction(t); }}
                role="button"
                tabIndex={0}
                aria-label={`Run ${t.name} — ${t.sub}`}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); void runAnalysisAction(t); } }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Group-colored icon tile — the tonal chip carries the family */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    display: "grid", placeItems: "center",
                    background: toolTone(t.id).soft, color: toolTone(t.id).ink,
                  }}>
                    <V6Icon name={t.icon} size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="wkcard-title" style={{ fontSize: "0.95rem" }}>
                      {busyAction === t.id ? "Running..." : t.name}
                    </div>
                    <div className="wkcard-sub" style={{ fontSize: "0.82rem", marginTop: 2 }}>{t.sub}</div>
                  </div>
                  <span style={{ transform: "rotate(180deg)", display: "inline-flex", color: "var(--ink-3)" }} aria-hidden="true">
                    <V6Icon name="back" size={11} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="wkcard" style={{ marginTop: 14, textAlign: "center" }}>
            <div className="wkcard-title">No analysis matches “{query}”</div>
            <div className="wkcard-sub">Try a different term, or ask Yulia to run something custom.</div>
          </div>
        )}
      </div>

      <div className="wksec">
        <div className="wksec-title">Recently run</div>
        <p className="pg-sub" style={{ marginTop: 0, marginBottom: 14 }}>Open any to keep iterating.</p>
        {recentRuns.length === 0 ? (
          <div className="wkcard" style={{ textAlign: "center" }}>
            <div className="wkcard-title">Nothing run yet</div>
            <div className="wkcard-sub">Pick an analysis above and your runs will collect here.</div>
          </div>
        ) : (
          <>
            <table className="wktable">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Deal</th>
                  <th>Status</th>
                  <th className="r">Updated</th>
                </tr>
              </thead>
              <tbody>
                {recentRuns.map(r => (
                  <tr
                    key={r.analysisRunId}
                    onClick={() => openTab({ kind: "analysis", title: r.title, id: `analysis-${r.analysisRunId}`, analysisRunId: r.analysisRunId, tool: r.analysisType })}
                    role="button"
                    aria-label={`${r.title}, ${r.deal}`}
                  >
                    <td>
                      <div className="cellname">
                        <span className="logo"><V6Icon name="chart" size={14} /></span>
                        <div className="nm">{r.title}</div>
                      </div>
                    </td>
                    <td><span className="muted">{r.deal}</span></td>
                    <td><V6DocStatus status={r.status} /></td>
                    <td className="r muted">{fmtRelative(r.updatedIso)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="tabfoot">
              <span>{recentRuns.length} recent {recentRuns.length === 1 ? "analysis" : "analyses"}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
