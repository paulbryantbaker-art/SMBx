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
  user: User | null;
}

export function MobileDealsListScreen({ onBack, onOpenDeal, user }: Props) {
  const workspace = useV6WorkspaceData(user);
  const [query, setQuery] = useState("");
  const isSample = !workspace.canFetch;
  const all = isSample ? SAMPLE : workspace.deals;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(d =>
      [d.business_name, d.industry, d.location, d.league, d.current_gate].some(v => (v || "").toLowerCase().includes(q)),
    );
  }, [all, query]);

  return (
    <div className="mb-fade-up" style={{ minHeight: "100vh", paddingBottom: 90 }}>
      <button type="button" onClick={onBack} aria-label="Back" style={D.backBtn}>
        <MobileIcon name="back" size={14} c="var(--mb-ink-1)" />
      </button>

      <div style={D.heroHeader}>
        <div style={D.heroEyebrow}>PIPELINE</div>
        <h1 style={D.heroTitle}>All deals</h1>
        <p style={D.heroSub}>
          {workspace.loading
            ? "Loading deals…"
            : `${filtered.length}${filtered.length !== all.length ? ` of ${all.length}` : ""} ${all.length === 1 ? "deal" : "deals"}${isSample ? " · sample" : ""}`}
        </p>
      </div>

      <div style={{ padding: "0 16px 6px" }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search deals…"
          style={D.search}
        />
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: "32px 22px", textAlign: "center", color: "var(--mb-ink-3)" }}>
          {all.length === 0 ? "No deals yet." : "No matching deals."}
        </div>
      ) : (
        <div className="mb-as-card" style={{ margin: "4px 16px 0", padding: "4px 0" }}>
          {filtered.map((d, i) => (
            <DealRow
              key={d.id}
              deal={d}
              last={i === filtered.length - 1}
              onTap={() => onOpenDeal(String(d.id), d.business_name || `Deal #${d.id}`)}
            />
          ))}
        </div>
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
  heroEyebrow: {
    fontFamily: "var(--mb-font-mono)", fontSize: 11, letterSpacing: "0.08em",
    color: "var(--mb-ink-3)", fontWeight: 600, textTransform: "uppercase",
  },
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
};

export default MobileDealsListScreen;
