/* V6 Mobile — All deals full list screen (Apple "See All" pattern).

   Summary surfaces (Today, Pipeline) cap their deal previews to stay light;
   tapping "See all" opens THIS full list of every deal from
   useV6WorkspaceData().deals (the full uncapped /api/deals array). Lightweight
   rows handle hundreds without virtualization; tapping a row opens the deal
   detail. Dev / logged-out (canFetch=false) shows a deterministic sample set so
   the layout and long-list behavior are visible without prod data. */

import { type CSSProperties, useMemo, useState } from "react";
import { MobileIcon } from "../icons";
import { IndustryIcon } from "../IndustryIcon";
import type { Verdict } from "../types";
import { type User } from "../../../../hooks/useAuth";
import { useV6WorkspaceData, type WorkspaceDeal } from "../../../../hooks/useV6WorkspaceData";
import { PIPELINE_STAGES, stageForGate, type PipelineStageId } from "../../../../lib/pipelineStages";

function fmtCents(cents: number | null | undefined): string {
  if (!cents) return "--";
  const d = cents / 100;
  if (d >= 1_000_000) return `$${(d / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (d >= 1_000) return `$${Math.round(d / 1_000)}K`;
  return `$${Math.round(d).toLocaleString()}`;
}

const JOURNEY_LABEL: Record<string, string> = { buy: "Buy", sell: "Sell", raise: "Raise", pmi: "PMI" };

function verdictFor(status: string): Verdict {
  const s = (status || "").toLowerCase();
  if (s === "active") return "pursue";
  if (s === "stalled") return "watch";
  return "pass";
}

// Deterministic sample for dev / logged-out (canFetch=false → no real deals).
const SAMPLE: WorkspaceDeal[] = Array.from({ length: 40 }, (_, i) => {
  const journeys = ["buy", "sell", "raise", "pmi"];
  const industries = ["HVAC", "Software", "Logistics", "Healthcare Tech", "E-commerce", "Manufacturing", "Staffing", "Dental"];
  const locs = ["Austin, TX", "Cleveland, OH", "Denver, CO", "Tampa, FL", "Phoenix, AZ"];
  const names = ["Apex", "Velocity", "Prime", "Summit", "Global", "Elite", "Tech", "Lakeshore"];
  const statuses = ["active", "active", "active", "stalled", "closed"];
  const ind = industries[i % industries.length];
  return {
    id: 9000 + i,
    business_name: `${names[i % names.length]} ${ind} ${100 + i}`,
    industry: ind,
    location: locs[i % locs.length],
    league: ["L1", "L2", "L3", "L4", "L5"][i % 5],
    current_gate: ["B1", "B2", "B3", "S2", "R2"][i % 5],
    journey_type: journeys[i % journeys.length],
    status: statuses[i % statuses.length],
    revenue: (1 + (i % 9)) * 100_000_000,
    sde: (1 + (i % 5)) * 40_000_000,
    ebitda: (1 + (i % 6)) * 30_000_000,
    asking_price: (2 + (i % 12)) * 80_000_000,
    financials: null,
    updated_at: "2026-05-15",
    created_at: "2026-01-01",
  };
});

interface Props {
  onBack: () => void;
  onOpenDeal: (id: string, title: string) => void;
  /** Preselected pipeline-stage filter (Pipeline "See all in {stage}").
   *  The stage chips let the user change or clear it. */
  initialStage?: string;
  user: User | null;
}

const STAGE_IDS = new Set<string>(PIPELINE_STAGES.map(s => s.id));

// Full-list pagination law (both platforms): render up to 100 rows, then a
// full-width "Show next 100" button appends the next client-side page from
// the already-fetched array.
const PAGE_SIZE = 100;

export function MobileDealsListScreen({ onBack, onOpenDeal, initialStage, user }: Props) {
  const workspace = useV6WorkspaceData(user);
  const [query, setQuery] = useState("");
  const [journey, setJourney] = useState<"all" | "buy" | "sell" | "raise" | "pmi">("all");
  const [stage, setStage] = useState<PipelineStageId | "all">(
    initialStage && STAGE_IDS.has(initialStage) ? (initialStage as PipelineStageId) : "all",
  );
  const [limit, setLimit] = useState(PAGE_SIZE);
  const isSample = !workspace.canFetch;
  const all = isSample ? SAMPLE : workspace.deals;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(d => {
      if (journey !== "all" && (d.journey_type || "").toLowerCase() !== journey) return false;
      if (stage !== "all" && stageForGate(d.current_gate || "B2") !== stage) return false;
      if (!q) return true;
      return [d.business_name, d.industry, d.location, d.league, d.current_gate].some(v => (v || "").toLowerCase().includes(q));
    });
  }, [all, query, journey, stage]);

  // Paginate at 100: render the first page(s), append via "Show next 100".
  // Search + the journey chips narrow within the full set (and reset paging).
  const shown = filtered.slice(0, limit);

  const chip = (active: boolean): CSSProperties => ({
    flexShrink: 0,
    padding: "6px 14px", borderRadius: 999, cursor: "pointer",
    fontSize: 13, fontWeight: 600,
    border: `1px solid ${active ? "var(--mb-accent-ink)" : "var(--mb-line-2)"}`,
    background: active ? "var(--mb-accent-ink)" : "transparent",
    color: active ? "#fff" : "var(--mb-ink-2)",
    WebkitTapHighlightColor: "transparent",
  });

  return (
    <div className="mb-fade-up" style={{ minHeight: "100vh", paddingBottom: 90 }}>
      <button type="button" onClick={onBack} aria-label="Back" style={D.backBtn}>
        <MobileIcon name="back" size={14} c="var(--mb-ink-1)" />
      </button>

      <div style={D.heroHeader}>
        <h1 style={D.heroTitle}>All deals</h1>
        <p style={D.heroSub}>
          {workspace.loading
            ? "Loading deals…"
            : filtered.length > shown.length
              ? `Showing ${shown.length} of ${filtered.length} deals${isSample ? " · sample" : ""}`
              : `${filtered.length}${filtered.length !== all.length ? ` of ${all.length}` : ""} ${all.length === 1 ? "deal" : "deals"}${isSample ? " · sample" : ""}`}
        </p>
      </div>

      <div style={{ padding: "0 16px 6px" }}>
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setLimit(PAGE_SIZE); }}
          placeholder="Search deals…"
          style={D.search}
        />
      </div>
      <div style={{ display: "flex", gap: 7, padding: "2px 16px 10px", overflowX: "auto" }}>
        {(["all", "buy", "sell", "raise", "pmi"] as const).map(j => (
          <button key={j} type="button" onClick={() => { setJourney(j); setLimit(PAGE_SIZE); }} style={chip(journey === j)}>
            {j === "all" ? "All" : JOURNEY_LABEL[j]}
          </button>
        ))}
      </div>
      {/* Stage chips — the same five Pipeline stages, so "See all in Source"
          lands here already narrowed. */}
      <div style={{ display: "flex", gap: 7, padding: "0 16px 10px", overflowX: "auto" }}>
        <button type="button" onClick={() => { setStage("all"); setLimit(PAGE_SIZE); }} style={chip(stage === "all")}>
          All stages
        </button>
        {PIPELINE_STAGES.map(s => (
          <button key={s.id} type="button" onClick={() => { setStage(s.id); setLimit(PAGE_SIZE); }} style={chip(stage === s.id)}>
            {s.title}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: "32px 22px", textAlign: "center", color: "var(--mb-ink-3)" }}>
          {all.length === 0 ? "No deals yet." : "No matching deals."}
        </div>
      ) : (
        <>
          <div className="mb-as-card" style={{ margin: "4px 16px 0", padding: "4px 0" }}>
            {shown.map((d, i) => (
              <DealRow
                key={d.id}
                deal={d}
                last={i === shown.length - 1}
                onTap={() => onOpenDeal(String(d.id), d.business_name || `Deal #${d.id}`)}
              />
            ))}
          </div>
          {filtered.length > shown.length && (
            <div style={{ padding: "12px 16px 0" }}>
              <button
                type="button"
                className="mb-tap"
                onClick={() => setLimit(l => l + PAGE_SIZE)}
                style={D.showNext}
              >
                Show next 100
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DealRow({ deal, last, onTap }: { deal: WorkspaceDeal; last: boolean; onTap: () => void }) {
  const name = deal.business_name || `Deal #${deal.id}`;
  const loc = [deal.industry, deal.location].filter(Boolean).join(" · ");
  const meta = [JOURNEY_LABEL[(deal.journey_type || "").toLowerCase()] || deal.journey_type, deal.league, loc].filter(Boolean).join(" · ");
  const value = fmtCents(deal.asking_price) !== "--" ? fmtCents(deal.asking_price) : fmtCents(deal.sde);
  return (
    <div
      className="mb-tap"
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTap(); } }}
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px 11px 18px", borderBottom: last ? "none" : "0.5px solid var(--mb-line-2)", cursor: "pointer" }}
    >
      <IndustryIcon name={deal.industry || name} verdict={verdictFor(deal.status)} size={34} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={D.rowName}>{name}</div>
        <div style={D.rowSub}>{meta || "—"}</div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div className="mb-mono" style={D.rowValue}>{value}</div>
        {deal.current_gate ? <div style={D.rowGate}>{deal.current_gate}</div> : null}
      </div>
      <MobileIcon name="chevron" c="var(--mb-ink-4)" size={11} />
    </div>
  );
}

const D: Record<string, CSSProperties> = {
  backBtn: {
    position: "absolute",
    top: "calc(env(safe-area-inset-top, 44px) + 12px)",
    left: 16, zIndex: 10,
    width: 36, height: 36, borderRadius: "50%",
    background: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
    border: "none",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.04)",
    cursor: "pointer",
  },
  heroHeader: { padding: "calc(env(safe-area-inset-top, 44px) + 64px) 22px 6px" },
  heroTitle: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700, fontSize: 32,
    letterSpacing: "-0.7px", lineHeight: 1.05, margin: "6px 0 0", color: "var(--mb-ink)",
  },
  heroSub: { fontSize: 14, color: "var(--mb-ink-3)", margin: "8px 0 12px", lineHeight: 1.4 },
  search: {
    width: "100%", boxSizing: "border-box",
    padding: "11px 14px", borderRadius: 12,
    border: "0.5px solid var(--mb-line-2)", background: "var(--mb-surface, #fff)",
    color: "var(--mb-ink)", fontSize: 15, outline: "none",
    WebkitAppearance: "none",
  },
  rowName: {
    fontSize: 15, fontWeight: 600, color: "var(--mb-ink)", letterSpacing: "-0.2px",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  rowSub: {
    fontSize: 12.5, color: "var(--mb-ink-3)", marginTop: 1,
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  rowValue: { fontSize: 14, fontWeight: 700, color: "var(--mb-ink)", letterSpacing: "-0.2px" },
  rowGate: { fontSize: 11, color: "var(--mb-ink-4)", fontFamily: "var(--mb-font-mono)", marginTop: 1 },
  /* Full-width client-side pagination button below the list card. */
  showNext: {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: "100%", minHeight: 48, boxSizing: "border-box",
    padding: "12px 16px", borderRadius: 16,
    background: "#fff", border: "0.5px solid var(--mb-line-2)",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    fontSize: 14.5, fontWeight: 700, color: "var(--mb-accent-ink)",
    cursor: "pointer",
  },
};

export default MobileDealsListScreen;
