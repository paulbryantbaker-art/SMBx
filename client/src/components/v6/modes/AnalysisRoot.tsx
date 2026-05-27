import { useState, type CSSProperties } from "react";
import { V6Section } from "../Section";
import { V6Icon } from "../icons";
import { V6DocStatus, type DocStatusKind } from "./cards";
import type { IconName, OpenTab } from "../types";
import type { User } from "../../../hooks/useAuth";
import { useV6WorkspaceData } from "../../../hooks/useV6WorkspaceData";
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

type ToneKey = "primary" | "secondary" | "tertiary" | "pursue" | "watch";

interface RecentRun { id: string; title: string; deal: string; updated: string; status: DocStatusKind }

const RECENTS: RecentRun[] = [
  { id: "an-recast", title: "Big Fake Deal · Recast",     deal: "Big Fake Deal · sample", updated: "Mar 25", status: "live"  },
  { id: "an-comps",  title: "Pest Control · Comps",       deal: "Pest Control · FL",      updated: "Mar 20", status: "saved" },
  { id: "an-val",    title: "Electrical · Valuation",     deal: "Electrical · TX",        updated: "Mar 18", status: "saved" },
  { id: "an-buyer",  title: "Big Fake Deal · Buyer fit",  deal: "Big Fake Deal · sample", updated: "Mar 24", status: "live"  },
];

interface Tool { id: string; name: string; sub: string; icon: IconName; tone: ToneKey; actionId?: SurfaceActionId }

const TOOLS: Tool[] = [
  { id: "tool-recast",      name: "Recast P&L",       sub: "Find honest add-backs",          icon: "chart", tone: "tertiary", actionId: "run_recast_analysis" },
  { id: "tool-qoe",         name: "QoE",              sub: "Earnings quality + proof",       icon: "search",tone: "primary",  actionId: "run_qoe_analysis" },
  { id: "tool-comps",       name: "Comps",            sub: "Public + private benchmarks",    icon: "chart", tone: "primary",  actionId: "run_comps_analysis" },
  { id: "tool-val",         name: "Valuation model",  sub: "Multiples + pricing bridge",     icon: "chart", tone: "pursue",   actionId: "run_valuation_analysis" },
  { id: "tool-dcf",         name: "DCF",              sub: "Growth, WACC, terminal value",   icon: "chart", tone: "secondary",actionId: "run_dcf_analysis" },
  { id: "tool-lbo",         name: "LBO",              sub: "Leverage, MOIC, IRR",            icon: "chart", tone: "watch",    actionId: "run_lbo_analysis" },
  { id: "tool-sensitivity", name: "Sensitivity",      sub: "Scenario table with sliders",    icon: "chart", tone: "tertiary", actionId: "run_sensitivity_analysis" },
  { id: "tool-tax",         name: "Tax impact",       sub: "Allocation + sign-off map",      icon: "deal",  tone: "primary",  actionId: "run_tax_impact_analysis" },
  { id: "tool-earnout",     name: "Earnout",          sub: "Contingent value scenarios",     icon: "deal",  tone: "watch",    actionId: "run_earnout_analysis" },
  { id: "tool-buyer",       name: "Buyer fit",        sub: "Score against your thesis",      icon: "deal",  tone: "secondary",actionId: "run_buyer_fit_analysis" },
  { id: "tool-sba",         name: "SBA structure",    sub: "Model leverage scenarios",       icon: "chart", tone: "watch",    actionId: "run_sba_analysis" },
  { id: "tool-compare",     name: "Compare deals",    sub: "Side-by-side next-action read",  icon: "deal",  tone: "tertiary", actionId: "compare_deals" },
];

const TONE_BG: Record<ToneKey, string> = {
  primary:   "var(--m-primary-container)",
  secondary: "var(--m-secondary-container)",
  tertiary:  "var(--m-tertiary-container)",
  pursue:    "var(--m-pursue-container)",
  watch:     "var(--m-watch-container)",
};
const TONE_FG: Record<ToneKey, string> = {
  primary:   "var(--m-on-primary-container)",
  secondary: "var(--m-on-secondary-container)",
  tertiary:  "var(--m-on-tertiary-container)",
  pursue:    "var(--m-pursue-on-cont)",
  watch:     "#3F2E00",
};

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

  const runAnalysisAction = async (tool?: Tool) => {
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

    const target = deal;
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

  return (
    <div className="m-fade-up m-page-flow" style={A.page}>
      <V6Section
        eyebrow="ANALYSIS"
        title="Run an analysis"
        sub="Yulia handles the math. You read the result."
        action={
          <button
            className="m-btn filled"
            aria-label="New analysis"
            type="button"
            onClick={() => { void runAnalysisAction(); }}
            disabled={busyAction === "new-analysis"}
          >
            <V6Icon name="plus" size={12} />
            <span style={{ marginLeft: 6 }}>{busyAction === "new-analysis" ? "Running..." : "New analysis"}</span>
          </button>
        }
      >
        {(actionError || actionNote || workspace.error) && (
          <div style={actionError || workspace.error ? A.actionError : A.actionNote}>
            {actionError || workspace.error || actionNote}
          </div>
        )}
      </V6Section>

      <V6Section eyebrow="TOOLS" title="What can I run">
        <div className="m-flow-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {TOOLS.map(t => (
            <div
              key={t.id}
              className="m-card m-state tap"
              onClick={() => { void runAnalysisAction(t); }}
              role="button"
              tabIndex={0}
              aria-label={`Run ${t.name} — ${t.sub}`}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); void runAnalysisAction(t); } }}
              style={{ padding: "18px 20px", cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ ...A.toolIcon, background: TONE_BG[t.tone], color: TONE_FG[t.tone] }}>
                  <V6Icon name={t.icon} size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={A.toolName}>{busyAction === t.id ? "Running..." : t.name}</div>
                  <div style={A.toolSub}>{t.sub}</div>
                </div>
                <span style={{ transform: "rotate(180deg)", display: "inline-flex", color: "var(--m-on-surface-mid)" }} aria-hidden="true">
                  <V6Icon name="back" size={11} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </V6Section>

      <V6Section eyebrow="RECENT" title="Recently run" sub="Open any to keep iterating.">
        <div className="m-card" style={{ overflow: "hidden", padding: 0 }}>
          {RECENTS.map((r, i) => (
            <div
              key={r.id}
              className="m-state"
              onClick={() => openTab({ kind: "analysis", title: r.title, id: r.id })}
              role="button"
              tabIndex={0}
              aria-label={`${r.title}, ${r.deal}`}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openTab({ kind: "analysis", title: r.title, id: r.id }); } }}
              style={{
                display: "grid", gridTemplateColumns: "32px 2fr 2fr 80px 80px",
                alignItems: "center", gap: 16,
                padding: "14px 18px",
                borderBottom: i === RECENTS.length - 1 ? "none" : "1px solid var(--m-outline-var)",
                cursor: "pointer",
              }}
            >
              <V6Icon name="chart" size={14} />
              <div style={A.recentTitle}>{r.title}</div>
              <div style={A.recentDeal}>{r.deal}</div>
              <V6DocStatus status={r.status} />
              <div className="mono" style={A.recentDate}>{r.updated.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </V6Section>
    </div>
  );
}

const A: Record<string, CSSProperties> = {
  page: {
    width: "min(100%, 1440px)",
    maxWidth: 1440,
    margin: "0 auto",
    boxSizing: "border-box",
  },
  toolIcon: {
    width: 36, height: 36, borderRadius: 10,
    display: "grid", placeItems: "center",
    flexShrink: 0,
  },
  toolName: {
    fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14,
    letterSpacing: "-0.01em", color: "var(--m-on-surface)",
  },
  toolSub: {
    fontSize: 11.5, color: "var(--m-on-surface-mid)", marginTop: 1,
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  recentTitle: {
    fontSize: 13, fontWeight: 600, color: "var(--m-on-surface)",
    letterSpacing: "-0.01em",
  },
  recentDeal: { fontSize: 12, color: "var(--m-on-surface-mid)" },
  recentDate: {
    fontSize: 10.5, color: "var(--m-on-surface-mid)",
    letterSpacing: "0.1em", textAlign: "right",
  },
  actionNote: {
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(225, 242, 235, 0.9)",
    color: "#246B50",
    fontSize: 12.5,
    boxShadow: "var(--m-elev-1)",
  },
  actionError: {
    padding: "10px 12px",
    borderRadius: 12,
    background: "var(--m-pass-container)",
    color: "#6F241E",
    fontSize: 12.5,
    boxShadow: "var(--m-elev-1)",
  },
};
