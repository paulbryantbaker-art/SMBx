/* V6 Mobile — Analyses launcher (hub).
 *
 * The discoverable, top-level way to RUN an analysis on mobile (the desktop
 * AnalysisRoot equivalent). It's a launch surface over the existing run
 * primitive: each catalog item carries the same { analysisType, menuItemSlug,
 * label } the per-deal Yulia actions use, so tapping one runs it on the
 * primary deal (mirrors desktop's pickActionDeal) via onRunDealAnalysis →
 * MobileAnalysisScreen. With no deals, it hands off to Yulia in chat.
 */
import { useState, type CSSProperties } from "react";
import { GlassTopBar, LargeTitle } from "../TopBar";
import { MobileIcon } from "../icons";
import type { MobilePipelineRow } from "../../../../hooks/useMobileDeals";

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
}

export function MobileAnalysesScreen({ initials, onAvatarClick, onSearch, onNotif, notifCount, deals, onRunDealAnalysis, onAskYulia }: AnalysesHubProps) {
  const [query, setQuery] = useState("");
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
          <div className="mb-section-eyebrow" style={{ padding: "0 6px 8px" }}>START HERE</div>
          <div style={A.starterRow} className="mb-hide-scroll">
            {starters.map(t => (
              <button key={t.id} type="button" onClick={() => launch(t)} style={A.starterChip}>
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Full catalog */}
      <div style={{ padding: "18px 16px 0" }}>
        <div className="mb-section-eyebrow" style={{ padding: "0 6px 4px", display: "flex", justifyContent: "space-between" }}>
          <span>ALL ANALYSES</span>
          <span className="mb-mono" style={{ color: "var(--mb-ink-4)" }}>{filtered.length}/{CATALOG.length}</span>
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
