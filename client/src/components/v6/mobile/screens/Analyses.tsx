/* V6 Mobile — Analyses launcher (hub).
 *
 * The discoverable, top-level way to RUN an analysis on mobile (the desktop
 * AnalysisRoot equivalent). It's a launch surface over the existing run
 * primitive: each catalog item carries the same { analysisType, menuItemSlug,
 * label } the per-deal Yulia actions use, so tapping one runs it on the
 * primary deal (mirrors desktop's pickActionDeal) via onRunDealAnalysis →
 * MobileAnalysisScreen. With no deals, it hands off to Yulia in chat.
 */
import { useEffect, useState, type CSSProperties } from "react";
import { GlassTopBar, LargeTitle } from "../TopBar";
import { MobileIcon } from "../icons";
import { DEV_AUTH_BYPASS, authHeaders } from "../../../../hooks/useAuth";
import type { MobilePipelineRow } from "../../../../hooks/useMobileDeals";
import type { WorkspaceDeliverable } from "../../../../hooks/useV6WorkspaceData";

interface CatalogItem {
  id: string;
  name: string;
  sub: string;
  group: "Value" | "Diligence" | "Structure";
  analysisType: string;
  menuItemSlug: string;
  label: string;
}

// Same launch contract the per-deal actions use (see mobileAnalysisForAction
// in Detail.tsx) — kept here so the hub is a self-contained launch surface.
const CATALOG: CatalogItem[] = [
  { id: "valuation", name: "Valuation", sub: "Multiples + pricing bridge", group: "Value", analysisType: "valuation", menuItemSlug: "buy-valuation-model", label: "valuation model" },
  { id: "comps", name: "Comps", sub: "Public + private benchmarks", group: "Value", analysisType: "comps", menuItemSlug: "universal-comp-analysis", label: "comps analysis" },
  { id: "recast", name: "Recast P&L", sub: "Find honest add-backs", group: "Value", analysisType: "recast", menuItemSlug: "buy-deal-scorecard", label: "recast analysis" },
  { id: "qoe", name: "Quality of earnings", sub: "Earnings quality + proof", group: "Diligence", analysisType: "qoe", menuItemSlug: "buy-deal-scorecard", label: "QoE analysis" },
  { id: "working_capital", name: "Working capital", sub: "Peg, true-up, target NWC", group: "Diligence", analysisType: "working_capital", menuItemSlug: "buy-working-capital-model", label: "working-capital analysis" },
  { id: "red_flags", name: "Red flags", sub: "Diligence risk scan", group: "Diligence", analysisType: "red_flags", menuItemSlug: "buy-red-flag-report", label: "red-flag analysis" },
  { id: "buyer_fit", name: "Buyer fit", sub: "Score against your thesis", group: "Diligence", analysisType: "buyer_fit", menuItemSlug: "buy-deal-scorecard", label: "buyer-fit analysis" },
  { id: "dcf", name: "DCF", sub: "Growth, WACC, terminal value", group: "Value", analysisType: "dcf", menuItemSlug: "buy-valuation-model", label: "DCF model" },
  { id: "lbo", name: "LBO", sub: "Leverage, MOIC, IRR", group: "Structure", analysisType: "lbo", menuItemSlug: "buy-valuation-model", label: "LBO model" },
  { id: "sensitivity", name: "Sensitivity", sub: "Scenario table with sliders", group: "Value", analysisType: "sensitivity", menuItemSlug: "buy-valuation-model", label: "sensitivity model" },
  { id: "sba", name: "SBA structure", sub: "Model leverage scenarios", group: "Structure", analysisType: "sba", menuItemSlug: "universal-sba-analysis", label: "SBA structure analysis" },
  { id: "capital_structure", name: "Capital structure", sub: "Debt + equity stack", group: "Structure", analysisType: "capital_structure", menuItemSlug: "buy-capital-structure", label: "capital structure model" },
  { id: "tax_impact", name: "Tax impact", sub: "Allocation + sign-off map", group: "Structure", analysisType: "tax_impact", menuItemSlug: "buy-capital-structure", label: "tax impact model" },
  { id: "earnout", name: "Earnout", sub: "Contingent value scenarios", group: "Structure", analysisType: "earnout", menuItemSlug: "buy-earnout-analysis", label: "earnout model" },
  { id: "cap_table", name: "Cap table", sub: "Dilution + waterfall", group: "Structure", analysisType: "cap_table", menuItemSlug: "raise-cap-table", label: "cap table model" },
  { id: "covenant", name: "Covenant check", sub: "Compliance + headroom", group: "Structure", analysisType: "covenant", menuItemSlug: "buy-capital-structure", label: "covenant model" },
];

const STARTER_IDS = ["valuation", "qoe", "comps", "working_capital"];

/* ─── Recently run (real deliverables) ────────────────────────────────────
   Saved analyses were unreachable cold from this hub — the only paths were
   re-running or digging through Files. This mirrors LibrarySearch's cached
   workspace fetch (same endpoint, same honesty rules: real data or nothing,
   never samples for a signed-in user) with a module-level cache so repeated
   hub visits in a session don't re-hit the network. */

let recentDeliverablesCache: { promise: Promise<WorkspaceDeliverable[]>; at: number } | null = null;

function fetchAllDeliverables(): Promise<WorkspaceDeliverable[]> {
  const now = Date.now();
  if (recentDeliverablesCache && now - recentDeliverablesCache.at < 30_000) {
    return recentDeliverablesCache.promise;
  }
  const promise = (async (): Promise<WorkspaceDeliverable[]> => {
    const res = await fetch("/api/deliverables/all", { headers: authHeaders() });
    if (!res.ok) throw new Error(`deliverables ${res.status}`);
    const json = await res.json();
    return Array.isArray(json) ? json : [];
  })();
  recentDeliverablesCache = { promise, at: now };
  promise.catch(() => {
    if (recentDeliverablesCache?.promise === promise) recentDeliverablesCache = null;
  });
  return promise;
}

// Mirrors desktop DealView's isAnalysisDeliverable split (artifact_kind /
// folder_category first, then the slug+name keyword heuristic).
const ANALYSIS_KEYWORDS = /valuation|dcf|lbo|capital[-\s]?structure|working[-\s]?capital|\bqoe\b|quality[-\s]?of[-\s]?earnings|sensitivity|earnout|\bsba\b|dscr|comps?\b|scorecard|\bmodel\b|recast|tax[-\s]?impact|financial[-\s]?spread|cap[-\s]?table|covenant|red[-\s]?flag|risk/i;

function isAnalysisDeliverable(d: WorkspaceDeliverable): boolean {
  if (d.analysis_run_id) return true;
  if (d.artifact_kind && /model|analysis|snapshot|comparison/i.test(d.artifact_kind)) return true;
  if (d.folder_category && /model|analys/i.test(d.folder_category)) return true;
  return ANALYSIS_KEYWORDS.test(`${d.slug || ""} ${d.name || ""}`);
}

function deliverableWhen(d: WorkspaceDeliverable): string {
  return d.updated_at || d.completed_at || d.created_at || "";
}

function fmtRelativeShort(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const min = Math.floor((Date.now() - then) / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}

function useRecentAnalyses(): { real: boolean; loaded: boolean; analyses: WorkspaceDeliverable[] } {
  // Real signed-in user only (token present, not the dev-bypass preview) —
  // anon/dev keep the catalog-only hub rather than fake "recent" rows.
  const [real] = useState(() => !DEV_AUTH_BYPASS && Boolean(authHeaders().Authorization));
  const [state, setState] = useState<{ loaded: boolean; analyses: WorkspaceDeliverable[] }>({
    loaded: false,
    analyses: [],
  });
  useEffect(() => {
    if (!real) return;
    let cancelled = false;
    fetchAllDeliverables()
      .then(all => {
        if (cancelled) return;
        const analyses = all
          .filter(isAnalysisDeliverable)
          .sort((a, b) => new Date(deliverableWhen(b)).getTime() - new Date(deliverableWhen(a)).getTime())
          .slice(0, 5);
        setState({ loaded: true, analyses });
      })
      .catch(() => {
        if (!cancelled) setState({ loaded: true, analyses: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [real]);
  return { real, ...state };
}

export interface AnalysesRunInput {
  dealId: string;
  dealTitle: string;
  analysisType: string;
  menuItemSlug?: string;
  label: string;
  prompt: string;
}

interface AnalysesHubProps {
  initials: string;
  onAvatarClick: () => void;
  onSearch?: () => void;
  /** Opens the notifications sheet + unread badge count. Omitted → no bell. */
  onNotif?: () => void;
  notifCount?: number;
  /** Live deal rows (today slice); null when anon / no deals. */
  deals: MobilePipelineRow[] | null;
  onRunDealAnalysis: (input: AnalysesRunInput) => void;
  onAskYulia: (prompt: string) => void;
  /** Opens a saved deliverable in the real document reader — same handler the
   *  Files surfaces use (onOpenLibraryDoc in V6Mobile). */
  onOpenDeliverable: (title?: string, meta?: string, kind?: string, deliverableId?: number) => void;
}

export function MobileAnalysesScreen({ initials, onAvatarClick, onSearch, onNotif, notifCount, deals, onRunDealAnalysis, onAskYulia, onOpenDeliverable }: AnalysesHubProps) {
  const [query, setQuery] = useState("");
  const recent = useRecentAnalyses();
  const primaryDeal = deals && deals.length > 0 ? deals[0] : null;

  const launch = (item: CatalogItem) => {
    if (primaryDeal) {
      onRunDealAnalysis({
        dealId: String(primaryDeal.rawId),
        dealTitle: primaryDeal.name,
        analysisType: item.analysisType,
        menuItemSlug: item.menuItemSlug,
        label: item.label,
        prompt: `Run a ${item.label} on ${primaryDeal.name}. Use the deal data already in the workspace and tell me what needs action.`,
      });
    } else {
      onAskYulia(`Run a ${item.label}. Walk me through the few figures you need, then open the result.`);
    }
  };

  const q = query.trim().toLowerCase();
  const filtered = q
    ? CATALOG.filter(t => t.name.toLowerCase().includes(q) || t.sub.toLowerCase().includes(q) || t.group.toLowerCase().includes(q))
    : CATALOG;
  const starters = CATALOG.filter(t => STARTER_IDS.includes(t.id));

  return (
    <div className="mb-fade-up" style={{ minHeight: "100vh", paddingBottom: 110 }}>
      <GlassTopBar title="Analyses" initials={initials} onAvatarClick={onAvatarClick} onSearch={onSearch} onNotif={onNotif} notifCount={notifCount} />
      <LargeTitle>Analyses</LargeTitle>

      <div style={{ padding: "0 22px 6px" }}>
        <div style={A.lede}>
          {primaryDeal
            ? <>Runs on <span style={{ color: "var(--mb-accent-ink)", fontWeight: 700 }}>{primaryDeal.name}</span>. Open a deal to target a different one.</>
            : <>Pick an analysis and Yulia will ask for the few figures she needs.</>}
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: "8px 16px 4px" }}>
        <label style={A.search}>
          <MobileIcon name="search" c="var(--mb-ink-3)" size={15} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search analyses…"
            aria-label="Search analyses"
            style={A.searchInput}
            autoComplete="off"
          />
        </label>
      </div>

      {/* Start here */}
      {!q && (
        <div style={{ padding: "10px 16px 0" }}>
          <div style={{ ...A.sectionLabel, padding: "0 6px 8px" }}>Start here</div>
          <div style={A.starterRow} className="mb-hide-scroll">
            {starters.map(t => (
              <button key={t.id} type="button" onClick={() => launch(t)} style={A.starterChip}>
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recently run — real deliverables, tap to reopen in the reader. */}
      {!q && recent.real && recent.loaded && (
        <div style={{ padding: "18px 16px 0" }}>
          <div style={{ ...A.sectionLabel, padding: "0 6px 4px" }}>Recently run</div>
          {recent.analyses.length === 0 ? (
            <div className="mb-as-card" style={A.recentEmpty}>
              No analyses yet. Run your first one below.
            </div>
          ) : (
            <div className="mb-as-card" style={{ padding: "6px 0" }}>
              {recent.analyses.map((d, i) => {
                const name = d.name || "Analysis";
                const when = fmtRelativeShort(deliverableWhen(d));
                const meta = [
                  d.deal_name,
                  d.status && d.status !== "complete" ? d.status.replace(/[-_]/g, " ") : null,
                  when,
                ].filter(Boolean).join(" · ");
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => onOpenDeliverable(name, meta, "ai", d.id)}
                    aria-label={`Open ${name}`}
                    style={{ ...A.row, borderBottom: i === recent.analyses.length - 1 ? "none" : "0.5px solid var(--mb-line)" }}
                  >
                    <span style={A.rowIcon}><MobileIcon name="brief" c="var(--mb-accent-ink)" size={16} /></span>
                    <span style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                      <span style={{ ...A.rowName, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                      <span style={{ ...A.rowSub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{meta}</span>
                    </span>
                    <span style={{ transform: "rotate(180deg)", display: "inline-flex", color: "var(--mb-ink-4)" }} aria-hidden="true">
                      <MobileIcon name="back" size={11} c="var(--mb-ink-4)" />
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Full catalog */}
      <div style={{ padding: "18px 16px 0" }}>
        <div style={{ ...A.sectionLabel, padding: "0 6px 4px", display: "flex", justifyContent: "space-between" }}>
          <span>All analyses</span>
          <span className="mb-mono" style={{ color: "var(--mb-ink-4)", fontSize: 11 }}>{filtered.length}/{CATALOG.length}</span>
        </div>
        <div className="mb-as-card" style={{ padding: "6px 0" }}>
          {filtered.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => launch(t)}
              aria-label={`Run ${t.name} — ${t.sub}`}
              style={{ ...A.row, borderBottom: i === filtered.length - 1 ? "none" : "0.5px solid var(--mb-line)" }}
            >
              <span style={A.rowIcon}><MobileIcon name="brief" c="var(--mb-accent-ink)" size={16} /></span>
              <span style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                <span style={A.rowName}>{t.name}</span>
                <span style={A.rowSub}>{t.sub}</span>
              </span>
              <span style={A.rowGo} className="mb-mono">{t.group}</span>
              <span style={{ transform: "rotate(180deg)", display: "inline-flex", color: "var(--mb-ink-4)" }} aria-hidden="true">
                <MobileIcon name="back" size={11} c="var(--mb-ink-4)" />
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: "20px 22px", textAlign: "center", color: "var(--mb-ink-4)", fontSize: 13 }}>
              No analysis matches “{query}”. Ask Yulia to run something custom.
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "16px 22px 0" }}>
        <button type="button" className="mb-get-pill solid" style={{ width: "100%", padding: "12px 16px", fontSize: 14 }} onClick={() => onAskYulia("What analysis should I run next, and why?")}>
          Ask Yulia what to run next
        </button>
      </div>
    </div>
  );
}

const A: Record<string, CSSProperties> = {
  lede: { fontSize: 14, lineHeight: 1.45, color: "var(--mb-ink-2)" },
  // Visible sentence-case section label (replaces the hidden eyebrow class).
  sectionLabel: { fontSize: 12, fontWeight: 600, color: "var(--mb-ink-3)" },
  recentEmpty: { padding: "16px 18px", fontSize: 13.5, lineHeight: 1.45, color: "var(--mb-ink-3)" },
  search: {
    display: "flex", alignItems: "center", gap: 8, padding: "11px 14px",
    background: "#fff", border: "0.5px solid var(--mb-line-2)", borderRadius: 14,
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  searchInput: { flex: 1, border: 0, outline: "none", background: "transparent", font: "inherit", fontSize: 15, color: "var(--mb-ink)", minWidth: 0 },
  starterRow: { display: "flex", gap: 8, overflowX: "auto", padding: "0 6px 4px" },
  starterChip: {
    flexShrink: 0, padding: "9px 15px", borderRadius: 999, border: "0.5px solid var(--mb-accent)",
    background: "var(--mb-accent-soft)", color: "var(--mb-accent-ink)", fontWeight: 600, fontSize: 13.5, cursor: "pointer",
    whiteSpace: "nowrap",
  },
  row: {
    display: "flex", alignItems: "center", gap: 12, width: "100%",
    padding: "13px 18px", background: "transparent", border: "none", cursor: "pointer",
  },
  rowIcon: {
    width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: "grid", placeItems: "center",
    background: "var(--mb-accent-soft)",
  },
  rowName: { display: "block", fontWeight: 600, fontSize: 15, color: "var(--mb-ink)", fontFamily: "var(--mb-font-display)" },
  rowSub: { display: "block", fontSize: 12.5, color: "var(--mb-ink-3)", marginTop: 1 },
  rowGo: { fontSize: 10, color: "var(--mb-ink-4)", textTransform: "uppercase", letterSpacing: "0.04em", flexShrink: 0 },
};
