/**
 * V6DealsListView — the "full list view" for deals (Apple "See All" pattern).
 *
 * Summary surfaces (Today, Pipeline) show a capped, enriched preview; tapping
 * "See all" opens THIS view, which renders the COMPLETE deal set from
 * useV6WorkspaceData().deals (the full uncapped /api/deals array) as lightweight
 * rows. Hundreds of simple rows render fine without virtualization; heavy
 * per-deal enrichment (DEFINITIVE state, gate countdowns) stays on the preview.
 * Rows open the deal detail on click, where rich data loads on demand.
 */
import { useMemo, useState } from "react";
import type { OpenTab } from "../types";
import { type User } from "../../../hooks/useAuth";
import { useV6WorkspaceData, type WorkspaceDeal } from "../../../hooks/useV6WorkspaceData";

function fmtCents(cents: number | null | undefined): string {
  if (!cents) return "--";
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (dollars >= 1_000) return `$${Math.round(dollars / 1_000)}K`;
  return `$${Math.round(dollars).toLocaleString()}`;
}

const JOURNEY_LABEL: Record<string, string> = { buy: "Buy", sell: "Sell", raise: "Raise", pmi: "PMI" };

function statusPillClass(status: string): string {
  const s = (status || "").toLowerCase();
  if (s === "active") return "good";
  if (s === "stalled") return "review";
  return "missing"; // closed / archived / other
}

function dealInitials(name: string): string {
  return (
    name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("") || "—"
  );
}

// Deterministic sample set so the layout (and long-list behavior) is visible in
// local dev / logged-out, where canFetch is false and workspace.deals is empty.
const SAMPLE_DEALS: WorkspaceDeal[] = Array.from({ length: 60 }, (_, i) => {
  const journeys = ["buy", "sell", "raise", "pmi"];
  const industries = ["HVAC", "Software/SaaS", "Logistics", "Healthcare Tech", "E-commerce", "Manufacturing", "Staffing", "Dental Services"];
  const locs = ["Austin, TX", "Cleveland, OH", "Denver, CO", "Tampa, FL", "Phoenix, AZ", "Boise, ID"];
  const names = ["Apex", "Velocity", "Prime", "Summit", "Global", "Elite", "Tech", "Lakeshore", "Atlas", "Comfort"];
  const leagues = ["L1", "L2", "L3", "L4", "L5"];
  const gates = ["B1", "B2", "B3", "S2", "R2", "PMI1"];
  const statuses = ["active", "active", "active", "stalled", "closed"];
  const ind = industries[i % industries.length];
  return {
    id: 9000 + i,
    business_name: `${names[i % names.length]} ${ind.split("/")[0]} ${100 + i}`,
    industry: ind,
    location: locs[i % locs.length],
    league: leagues[i % leagues.length],
    current_gate: gates[i % gates.length],
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

type JourneyFilter = "all" | "buy" | "sell" | "raise" | "pmi";

interface Props {
  view?: "all";
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
  user: User | null;
}

export function V6DealsListView({ openTab, user }: Props) {
  const workspace = useV6WorkspaceData(user);
  const [query, setQuery] = useState("");
  const [journey, setJourney] = useState<JourneyFilter>("all");

  const isSample = !workspace.canFetch;
  const allDeals = isSample ? SAMPLE_DEALS : workspace.deals;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allDeals.filter(d => {
      if (journey !== "all" && (d.journey_type || "").toLowerCase() !== journey) return false;
      if (!q) return true;
      return [d.business_name, d.industry, d.location, d.league, d.current_gate].some(v => (v || "").toLowerCase().includes(q));
    });
  }, [allDeals, query, journey]);

  const openDeal = (d: WorkspaceDeal) =>
    openTab({ kind: "deal", id: String(d.id), title: d.business_name || `Deal #${d.id}`, dealId: d.id, dealTitle: d.business_name });

  const chip = (active: boolean) => ({
    all: "unset" as const,
    cursor: "pointer",
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: "0.78rem",
    fontWeight: 600,
    border: `1px solid ${active ? "var(--accent-strong)" : "var(--line)"}`,
    background: active ? "var(--accent-strong)" : "var(--surface)",
    color: active ? "#fff" : "var(--ink-2)",
  });

  return (
    <div className="wk-content m-fade-up" style={{ maxWidth: 1180, margin: "0 auto" }}>
      {/* Page header */}
      <div className="pg-head">
        <div>
          <div className="pg-title">All deals</div>
          <p className="pg-sub">
            {workspace.loading
              ? "Loading deals…"
              : `${filtered.length}${filtered.length !== allDeals.length ? ` of ${allDeals.length}` : ""} ${allDeals.length === 1 ? "deal" : "deals"}${isSample ? " · sample data" : ""}`}
          </p>
        </div>
      </div>

      {/* Search + journey filter */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", margin: "2px 0 16px" }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name, industry, location, league, gate…"
          style={{ flex: "1 1 280px", minWidth: 220, padding: "10px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", fontSize: "0.9rem", outline: "none" }}
        />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(["all", "buy", "sell", "raise", "pmi"] as const).map(j => (
            <button key={j} type="button" onClick={() => setJourney(j)} style={chip(journey === j)}>
              {j === "all" ? "All" : JOURNEY_LABEL[j]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="wkcard" style={{ textAlign: "center", color: "var(--ink-2)" }}>
          <div className="wkcard-title">{allDeals.length === 0 ? "No deals yet" : "No matching deals"}</div>
          <div className="wkcard-sub">{allDeals.length === 0 ? "When you add a deal it shows up here." : "Try a different search or filter."}</div>
        </div>
      ) : (
        <table className="wktable">
          <thead>
            <tr>
              <th>Deal</th>
              <th>Journey</th>
              <th>League</th>
              <th>Stage</th>
              <th className="r">SDE</th>
              <th className="r">Asking</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id} onClick={() => openDeal(d)}>
                <td>
                  <div className="cellname">
                    <span className="logo">{dealInitials(d.business_name || "?")}</span>
                    <div>
                      <div className="nm">{d.business_name || `Deal #${d.id}`}</div>
                      <div className="sub">{[d.industry, d.location].filter(Boolean).join(" · ") || "—"}</div>
                    </div>
                  </div>
                </td>
                <td>{JOURNEY_LABEL[(d.journey_type || "").toLowerCase()] || d.journey_type || "—"}</td>
                <td>{d.league || "—"}</td>
                <td>{d.current_gate || "—"}</td>
                <td className="r amt">{fmtCents(d.sde)}</td>
                <td className="r amt">{fmtCents(d.asking_price)}</td>
                <td>
                  <span className={`statpill ${statusPillClass(d.status)}`}>
                    <span className="d" />
                    {d.status || "—"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default V6DealsListView;
