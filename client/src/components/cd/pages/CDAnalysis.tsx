/**
 * CDAnalysis — the Claude Design "Ultra Modern Fintech" Analysis page, ported
 * into the real app and wired to LIVE data. Mounts under `.cd-root`.
 *
 * Diligence › Analyses. The page leads on CONSEQUENCE: which models are stale
 * and why (the real signal an analysis needs re-running), then per-deal
 * recommendations (each deal's gate → the analyses that move it forward), then
 * a browsable methodology catalog, then the user's real recently-run analyses.
 *
 * Every value is real (from useV6WorkspaceData / useTodayOperatingBrief) or
 * honestly empty. The CD mockup's run-next/catalog/stale arrays are demo data —
 * we copy the LAYOUT, never the numbers. THE LINE: each action routes to chat
 * via onTalkToYulia, or opens a deal/analysis tab; nothing here recommends a
 * regulated transaction decision.
 */
import { useMemo, useState, type CSSProperties } from "react";
import type { User } from "../../../hooks/useAuth";
import { useV6WorkspaceData, type WorkspaceDeal } from "../../../hooks/useV6WorkspaceData";
import { useTodayOperatingBrief, type TodayModelRefreshItem } from "../../../hooks/useTodayOperatingBrief";
import type { OpenTab } from "../../v6/types";
import type { ModelPreference } from "../../../lib/modelPreference";
import { GATE_MAP } from "@shared/gateRegistry";
import {
  CDIcon,
  CDPill,
  CDCard,
  CDSectionTitle,
  CDEyebrow,
  CDDivider,
  CDLeagueBadge,
  CDLineNote,
  cdDealColor,
} from "../kit/cdUi";

/* ─── the methodology catalog (matches AnalysisRoot's TOOLS, families tonal) ─ */
type Family = "valuation" | "diligence" | "structure";
interface CatalogTool { id: string; name: string; sub: string; icon: string; family: Family }

const TOOLS: CatalogTool[] = [
  { id: "tool-recast",      name: "Recast P&L",      sub: "Find honest add-backs",          icon: "data",     family: "valuation" },
  { id: "tool-qoe",         name: "QoE",             sub: "Earnings quality + proof",       icon: "search",   family: "diligence" },
  { id: "tool-comps",       name: "Comps",           sub: "Public + private benchmarks",    icon: "scenario", family: "valuation" },
  { id: "tool-val",         name: "Valuation model", sub: "Multiples + pricing bridge",     icon: "analysis", family: "valuation" },
  { id: "tool-dcf",         name: "DCF",             sub: "Growth, WACC, terminal value",   icon: "analysis", family: "valuation" },
  { id: "tool-lbo",         name: "LBO",             sub: "Leverage, MOIC, IRR",            icon: "model",    family: "structure" },
  { id: "tool-sensitivity", name: "Sensitivity",     sub: "Scenario table with sliders",    icon: "grid",     family: "valuation" },
  { id: "tool-tax",         name: "Tax impact",      sub: "Allocation + sign-off map",      icon: "doc",      family: "structure" },
  { id: "tool-earnout",     name: "Earnout",         sub: "Contingent value scenarios",     icon: "scenario", family: "structure" },
  { id: "tool-buyer",       name: "Buyer fit",       sub: "Score against your thesis",      icon: "flag",     family: "diligence" },
  { id: "tool-sba",         name: "SBA structure",   sub: "Model leverage scenarios",       icon: "model",    family: "structure" },
  { id: "tool-wc",          name: "Working capital", sub: "Peg, true-up, and target NWC",   icon: "scenario", family: "diligence" },
  { id: "tool-captable",    name: "Cap table",       sub: "Dilution + waterfall scenarios", icon: "model",    family: "structure" },
  { id: "tool-covenant",    name: "Covenant check",  sub: "Compliance + headroom over time", icon: "scenario", family: "structure" },
  { id: "tool-compare",     name: "Compare deals",   sub: "Side-by-side next-action read",  icon: "grid",     family: "diligence" },
];
const TOOLS_BY_ID: Record<string, CatalogTool> = Object.fromEntries(TOOLS.map(t => [t.id, t]));

/* Family tonal fill — the CD palette. Icon tile carries the family; valuation
   → pos-green, diligence → accent-indigo, structure → warn-amber. */
const FAMILY_TONE: Record<Family, { soft: string; ink: string }> = {
  valuation: { soft: "var(--cd-pos-soft)", ink: "var(--cd-pos)" },
  diligence: { soft: "var(--cd-accent-soft)", ink: "var(--cd-accent-strong)" },
  structure: { soft: "var(--cd-warn-soft)", ink: "oklch(0.5 0.13 75)" },
};
function toolTone(id: string) {
  return FAMILY_TONE[TOOLS_BY_ID[id]?.family ?? "diligence"];
}

/* Portfolio-aware: a deal's gate implies the analyses that move it forward
   (methodology gate → models). Mirrors AnalysisRoot.recommendedToolIdsForGate. */
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

/* ─── helpers ────────────────────────────────────────────────── */
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
function formatSlug(input?: string | null): string {
  return (input || "Analysis").replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
function leagueNum(league?: string | null): number {
  return parseInt(String(league || "").replace(/\D/g, ""), 10) || 1;
}

const PROMPT_BY_TOOL: Record<string, string> = {
  "tool-compare": "Compare my deals side by side — for each, the next action by gate and which to focus first.",
};
function runPrompt(tool: CatalogTool, dealName?: string): string {
  if (PROMPT_BY_TOOL[tool.id]) return PROMPT_BY_TOOL[tool.id];
  return dealName
    ? `Run ${tool.name} on ${dealName} using the deal data already in the workspace, and tell me what needs action.`
    : `Run ${tool.name} on the active deal using the workspace data, and tell me what needs action.`;
}

/* ─── small atoms (CD, --cd- themed) ─────────────────────────── */
function ModelStatusPill({ status }: { status: TodayModelRefreshItem["status"] }) {
  return <CDPill tone="warn">{status === "needs_rerun" ? "Rerun" : status === "superseded" ? "Superseded" : "Stale"}</CDPill>;
}
function RunStatusPill({ status }: { status: string }) {
  const v = (status || "").toLowerCase();
  const live = /generat|queue|run|progress|live|pending/.test(v);
  return <CDPill tone={live ? "accent" : "pos"}>{live ? "Live" : "Saved"}</CDPill>;
}

/* analysis-family chip — a runnable model suggestion on a deal card */
function ModelChip({ tool, onRun }: { tool: CatalogTool; onRun: () => void }) {
  const t = toolTone(tool.id);
  return (
    <button
      type="button"
      onClick={onRun}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "6px 11px 6px 8px", borderRadius: 999,
        background: t.soft, color: t.ink,
        border: "1px solid transparent", cursor: "pointer",
        fontFamily: "var(--cd-sans)", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
      }}
    >
      <CDIcon name={tool.icon} size={13} color={t.ink} />
      {tool.name}
    </button>
  );
}

/* ─── the page ──────────────────────────────────────────────── */
export function CDAnalysis({
  user,
  openTab,
  onTalkToYulia,
}: {
  user: User | null;
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
  modelPreference?: ModelPreference;
}) {
  const workspace = useV6WorkspaceData(user);
  const operating = useTodayOperatingBrief(user, !!user);
  const brief = operating.brief;
  const staleModels = brief?.modelRefreshNeeds ?? [];

  const [query, setQuery] = useState("");
  const [showCatalog, setShowCatalog] = useState(false);

  const openDeal = (d: WorkspaceDeal) => openTab({ kind: "deal", id: String(d.id), title: d.business_name || `Deal #${d.id}` });

  // Per-deal recommendations: each deal's gate → the analyses that advance it.
  const recCards = useMemo(
    () => workspace.deals.slice(0, 4).map(d => ({
      deal: d,
      gate: GATE_MAP[d.current_gate || ""],
      tools: recommendedToolIdsForGate(d.current_gate || "").map(id => TOOLS_BY_ID[id]).filter(Boolean) as CatalogTool[],
    })),
    [workspace.deals],
  );

  // Recently run = the user's real analysis deliverables (analysis_run_id set), newest first.
  const recentRuns = useMemo(
    () => workspace.deliverables
      .filter(d => d.analysis_run_id != null)
      .map(d => ({
        analysisRunId: d.analysis_run_id as number,
        title: d.name || formatSlug(d.slug),
        deal: d.deal_name || "Deal",
        status: d.analysis_status || d.status || "",
        updatedIso: d.completed_at || d.updated_at || d.created_at,
        analysisType: d.analysis_type ?? undefined,
      }))
      .sort((a, b) => timeOf(b.updatedIso) - timeOf(a.updatedIso))
      .slice(0, 8),
    [workspace.deliverables],
  );

  const q = query.trim().toLowerCase();
  const filtered = q ? TOOLS.filter(t => t.name.toLowerCase().includes(q) || t.sub.toLowerCase().includes(q)) : TOOLS;
  const catalogOpen = showCatalog || !!q;

  const loading = workspace.canFetch && workspace.loading && workspace.deals.length === 0;

  return (
    <div
      className="cd-root cd-scrollable"
      style={{ background: "var(--cd-canvas)", height: "100%", overflow: "auto", padding: "30px 34px 60px", display: "flex", flexDirection: "column", gap: "var(--cd-gap)" }}
    >
      {/* editorial header */}
      <div>
        <h1 style={{ margin: 0, fontFamily: "var(--cd-serif)", fontWeight: 600, fontSize: 34, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
          Analyses
        </h1>
        <p style={{ margin: "8px 0 0", color: "var(--cd-ink-2)", fontSize: 14 }}>
          Yulia recommends what to run next per deal and gate — or browse the full methodology catalog.
        </p>
      </div>

      {workspace.error && (
        <CDCard style={{ borderColor: "var(--cd-neg)", color: "var(--cd-neg)" }}>{workspace.error}</CDCard>
      )}

      {/* ⭐ MODEL FRESHNESS — the computed lead: which models are stale and why.
          A model whose inputs changed is the real signal an analysis needs a
          rerun. Honest "all current" fallback when nothing is waiting. */}
      {brief && (
        staleModels.length > 0 ? (
          <CDCard pad={false}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "15px 20px 12px" }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: "var(--cd-warn-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <CDIcon name="clock" size={16} color="oklch(0.5 0.13 75)" />
              </div>
              <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, letterSpacing: "-0.01em" }}>
                {staleModels.length} model{staleModels.length === 1 ? "" : "s"} need a rerun
              </h3>
              <span className="cd-num" style={{ fontSize: 11.5, color: "var(--cd-ink-4)", marginLeft: "auto" }}>inputs changed</span>
            </div>
            {staleModels.slice(0, 4).map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => onTalkToYulia?.(m.recomputePrompt || `Rerun ${m.modelTitle}${m.dealTitle ? ` for ${m.dealTitle}` : ""} — the inputs changed.`)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  width: "100%", textAlign: "left", padding: "12px 20px",
                  border: "none", borderTop: "1px solid var(--cd-line)",
                  background: "transparent", cursor: "pointer", fontFamily: "var(--cd-sans)",
                }}
              >
                <ModelStatusPill status={m.status} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontWeight: 600, fontSize: 13, color: "var(--cd-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.modelTitle}{m.dealTitle ? ` · ${m.dealTitle}` : ""}
                  </span>
                  <span style={{ display: "block", fontSize: 11.5, color: "var(--cd-ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
                    {m.changedInputs.length ? `${m.changedInputs.join(", ")} changed` : (m.reason || m.statusLabel)}
                  </span>
                </span>
                <span style={{ color: "var(--cd-accent-strong)", flexShrink: 0 }} aria-hidden><CDIcon name="arrowup" size={14} color="var(--cd-accent-strong)" style={{ transform: "rotate(45deg)" }} /></span>
              </button>
            ))}
            <CDLineNote style={{ padding: "11px 20px", borderTop: "1px solid var(--cd-line)" }} />
          </CDCard>
        ) : (
          <CDCard style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--cd-ink-2)", fontSize: 13 }}>
            <CDPill tone="pos"><CDIcon name="check" size={11} color="var(--cd-pos)" />Current</CDPill>
            Every model is current — no reruns waiting.
          </CDCard>
        )
      )}

      {/* ⭐ RECOMMENDED FOR YOUR PORTFOLIO — each deal's gate → next analyses */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>Recommended for your portfolio</h2>
          <CDPill tone="accent"><CDIcon name="sparkle" size={12} color="var(--cd-accent)" />Yulia · per gate</CDPill>
        </div>
        <button
          type="button"
          onClick={() => onTalkToYulia?.("Look across my whole portfolio — for each deal, recommend the analyses and documents to run next based on its gate, status, and blockers, and tell me which deal to focus on first.")}
          style={SOFT_BTN}
        >
          Ask Yulia to recommend
        </button>
      </div>

      {loading ? (
        <CDCard><div className="cd-skel" style={{ height: 96 }} /></CDCard>
      ) : recCards.length === 0 ? (
        <CDCard style={{ textAlign: "center", color: "var(--cd-ink-2)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--cd-ink)" }}>No deals in your portfolio yet</div>
          <div style={{ fontSize: 12.5, marginTop: 5 }}>Add a deal and Yulia will recommend the analyses that fit its stage. Meanwhile, browse the full catalog below.</div>
        </CDCard>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--cd-gap)" }}>
          {recCards.map(({ deal, gate, tools }) => {
            const color = cdDealColor(deal.id);
            return (
              <CDCard key={deal.id} pad={false}>
                <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "15px 18px 13px", borderBottom: "1px solid var(--cd-line)", background: `linear-gradient(100deg, color-mix(in oklch, ${color}, transparent 93%), var(--cd-surface) 62%)` }}>
                  <span style={{ width: 8, height: 30, borderRadius: 3, background: color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <button
                      type="button"
                      onClick={() => openDeal(deal)}
                      style={{ margin: 0, padding: 0, border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--cd-sans)", fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--cd-ink)", display: "block", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "left" }}
                    >
                      {deal.business_name || `Deal #${deal.id}`}
                    </button>
                    <div style={{ fontSize: 11.5, color: "var(--cd-ink-3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {[(deal.industry || "").split(" ")[0] || null, deal.location].filter(Boolean).join(" · ") || "—"}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
                    <CDLeagueBadge league={leagueNum(deal.league)} />
                    <span className="cd-num" style={{ fontSize: 11, color: "var(--cd-ink-3)", background: "var(--cd-surface-2)", border: "1px solid var(--cd-line)", borderRadius: 6, padding: "2px 7px", whiteSpace: "nowrap" }}>
                      {(deal.current_gate || "—").toUpperCase()}{gate ? ` · ${gate.name}` : ""}
                    </span>
                  </div>
                </div>
                <div style={{ padding: "13px 18px 16px" }}>
                  <CDEyebrow style={{ marginBottom: 10 }}>Run next</CDEyebrow>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {tools.map(t => (
                      <ModelChip key={t.id} tool={t} onRun={() => onTalkToYulia?.(runPrompt(t, deal.business_name || undefined))} />
                    ))}
                    {tools.length === 0 && <span style={{ fontSize: 12, color: "var(--cd-ink-3)" }}>Clear to advance — no analysis gating this gate.</span>}
                  </div>
                </div>
              </CDCard>
            );
          })}
        </div>
      )}

      {/* ALL ANALYSES — the methodology catalog, collapsed by default so the page
          opens on consequence, not a 15-card menu. Searching auto-expands it. */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>All analyses</h2>
        <button type="button" onClick={() => setShowCatalog(v => !v)} style={SOFT_BTN}>
          {catalogOpen ? "Hide catalog" : `Browse all ${TOOLS.length} analyses`}
        </button>
      </div>

      {catalogOpen && (
        <CDCard pad={false}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", borderBottom: "1px solid var(--cd-line)" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
              <CDIcon name="search" size={14} color="var(--cd-ink-3)" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search analyses…"
                style={{ border: 0, background: "transparent", outline: "none", color: "var(--cd-ink)", font: "inherit", fontSize: 13, width: "100%", minWidth: 120, fontFamily: "var(--cd-sans)" }}
              />
            </label>
            <span className="cd-num" style={{ fontSize: 11.5, color: "var(--cd-ink-3)", flexShrink: 0 }}>{filtered.length} of {TOOLS.length}</span>
          </div>
          {filtered.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
              {filtered.map((t, i) => {
                const tone = toolTone(t.id);
                const col = i % 3;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onTalkToYulia?.(runPrompt(t))}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, textAlign: "left",
                      padding: "14px 16px", background: "transparent", cursor: "pointer",
                      fontFamily: "var(--cd-sans)",
                      borderTop: "1px solid var(--cd-line)",
                      borderLeft: col === 0 ? "none" : "1px solid var(--cd-line)",
                      borderRight: "none", borderBottom: "none",
                    }}
                  >
                    <span style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: "grid", placeItems: "center", background: tone.soft, color: tone.ink }}>
                      <CDIcon name={t.icon} size={17} color={tone.ink} />
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: "var(--cd-ink)" }}>{t.name}</span>
                      <span style={{ display: "block", fontSize: 11.5, color: "var(--cd-ink-3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.sub}</span>
                    </span>
                    <CDIcon name="chevright" size={13} color="var(--cd-ink-4)" style={{ flexShrink: 0 }} />
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: "22px 18px", textAlign: "center" }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--cd-ink)" }}>No analysis matches “{query}”</div>
              <div style={{ fontSize: 12, color: "var(--cd-ink-3)", marginTop: 4 }}>Try a different term, or ask Yulia to run something custom.</div>
            </div>
          )}
        </CDCard>
      )}

      {/* RECENTLY RUN — the user's real analysis deliverables */}
      <CDDivider label="Recently run" />
      {recentRuns.length === 0 ? (
        <CDCard style={{ textAlign: "center", color: "var(--cd-ink-2)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--cd-ink)" }}>Nothing run yet</div>
          <div style={{ fontSize: 12.5, marginTop: 5 }}>Pick an analysis above and your runs will collect here.</div>
        </CDCard>
      ) : (
        <CDCard pad={false}>
          <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 0.8fr 0.8fr", gap: 12, padding: "12px 18px 10px", borderBottom: "1px solid var(--cd-line)" }}>
            {["Title", "Deal", "Status", "Updated"].map((h, i) => (
              <CDEyebrow key={h} style={{ textAlign: i === 3 ? "right" : "left" }}>{h}</CDEyebrow>
            ))}
          </div>
          {recentRuns.map(r => (
            <button
              key={r.analysisRunId}
              type="button"
              onClick={() => openTab({ kind: "analysis", title: r.title, id: `analysis-${r.analysisRunId}`, analysisRunId: r.analysisRunId, tool: r.analysisType })}
              style={{
                display: "grid", gridTemplateColumns: "1.8fr 1fr 0.8fr 0.8fr", gap: 12, alignItems: "center",
                width: "100%", textAlign: "left", padding: "12px 18px",
                borderTop: "1px solid var(--cd-line)", borderLeft: "none", borderRight: "none", borderBottom: "none",
                background: "transparent", cursor: "pointer", fontFamily: "var(--cd-sans)",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "grid", placeItems: "center", background: toolTone(r.analysisType || "").soft, color: toolTone(r.analysisType || "").ink }}>
                  <CDIcon name="analysis" size={15} color={toolTone(r.analysisType || "").ink} />
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--cd-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</span>
              </span>
              <span style={{ fontSize: 12.5, color: "var(--cd-ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.deal}</span>
              <span><RunStatusPill status={r.status} /></span>
              <span className="cd-num" style={{ fontSize: 11.5, color: "var(--cd-ink-3)", textAlign: "right" }}>{fmtRelative(r.updatedIso)}</span>
            </button>
          ))}
          <div style={{ padding: "11px 18px", borderTop: "1px solid var(--cd-line)", fontSize: 11.5, color: "var(--cd-ink-3)" }}>
            {recentRuns.length} recent {recentRuns.length === 1 ? "analysis" : "analyses"}
          </div>
        </CDCard>
      )}
    </div>
  );
}

const SOFT_BTN: CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6,
  background: "var(--cd-surface)", color: "var(--cd-ink-2)",
  border: "1px solid var(--cd-line-2)", borderRadius: "var(--cd-r-md)",
  padding: "8px 13px", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
  fontFamily: "var(--cd-sans)", whiteSpace: "nowrap",
};
