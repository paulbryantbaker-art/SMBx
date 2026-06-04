/**
 * Loads the authed user's deals once and categorizes them for the V6 home page
 * (Yulia's Picks / In Review / Recently Closed). Anonymous callers get null —
 * the consuming component falls back to its hardcoded sample arrays.
 *
 * Endpoint: GET /api/deals (server/routes/pipeline.ts) — returns deals with
 * revenue/sde/ebitda in cents, league, current_gate, status, financials JSON.
 */
import { useEffect, useState } from "react";
import { DEV_AUTH_BYPASS, authHeaders, type User } from "./useAuth";

export interface HomeDeal {
  id: number;
  business_name: string | null;
  industry: string | null;
  location: string | null;
  league: string | null;
  current_gate: string;
  status: string;
  revenue: number | null;
  sde: number | null;
  ebitda: number | null;
  asking_price: number | null;
  financials: { multiple?: number; status_label?: string; notes?: string } | null;
  updated_at: string;
  deliverable_count?: number;
  document_count?: number;
  conversation_id?: number | null;
  seven_factor_composite?: number | null;
}

export interface CategorizedHome {
  all: HomeDeal[];        // every deal the user owns (unsliced) — for the full pipeline
  picks: HomeDeal[];      // top 5 active deals by ebitda (quality proxy)
  inReview: HomeDeal[];   // active deals mid-journey, ordered by recency
  closed: HomeDeal[];     // closed deals, most recent 4
  totalActive: number;
  totalClosed: number;
}

export interface UseHomeDealsResult extends CategorizedHome {
  loading: boolean;
  error: string | null;
  isAuthed: boolean;
  hasData: boolean; // true when fetch succeeded with at least one deal
}

const EMPTY: CategorizedHome = {
  all: [], picks: [], inReview: [], closed: [],
  totalActive: 0, totalClosed: 0,
};

const MID_JOURNEY = new Set([
  "S2", "S3", "S4",
  "B2", "B3", "B4",
  "R2", "R3", "R4",
]);

function categorize(deals: HomeDeal[]): CategorizedHome {
  const active = deals.filter(d => d.status === "active");
  const closed = deals.filter(d => d.status === "closed");

  // Picks: top 5 active deals by EBITDA descending (quality proxy when fit
  // score isn't available on a deal record).
  const picks = [...active]
    .sort((a, b) => (b.ebitda ?? 0) - (a.ebitda ?? 0))
    .slice(0, 5);

  // In review: active deals at mid-journey gates, most recently touched first.
  const inReview = active
    .filter(d => MID_JOURNEY.has(d.current_gate))
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6);

  // Recently closed.
  const closedRecent = [...closed]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 4);

  return {
    all: deals,
    picks,
    inReview,
    closed: closedRecent,
    totalActive: active.length,
    totalClosed: closed.length,
  };
}

export function useHomeDeals(user: User | null): UseHomeDealsResult {
  const [data, setData] = useState<CategorizedHome>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    if (!user || DEV_AUTH_BYPASS) {
      setData(EMPTY);
      setHasData(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch("/api/deals", { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((deals: HomeDeal[]) => {
        if (cancelled) return;
        setData(categorize(deals));
        setHasData(deals.length > 0);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e.message);
        setData(EMPTY);
        setHasData(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user?.id]);

  return { ...data, loading, error, isAuthed: !!user, hasData };
}
