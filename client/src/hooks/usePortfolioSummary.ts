/**
 * usePortfolioSummary — portfolio rollup for the Today KPI tiles.
 *
 * Backed by server/routes/pipeline.ts: GET /api/portfolio/summary returns
 * weighted EV (Σ deal value × close-probability), total EV, counts by gate,
 * and a close-window distribution — all computed server-side over the user's
 * active deals. We use weightedEvCents as the "Pipeline value" tile: it is the
 * probability-weighted, consistently-derived figure (asking_price, or
 * ebitda×multiple when absent), not a raw asking-price sum.
 */
import { useEffect, useState } from "react";
import { authHeaders, type User } from "./useAuth";

export interface PortfolioSummary {
  totalActive: number;
  weightedEvCents: number;
  totalEvCents: number;
  byGate: { gate: string; count: number }[];
  byCloseWindow: { window: string; label: string; count: number }[];
}

export function usePortfolioSummary(user: User | null, canFetch: boolean) {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !canFetch) {
      setSummary(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch("/api/portfolio/summary", { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`summary ${r.status}`)))
      .then((data: PortfolioSummary) => { if (!cancelled) setSummary(data); })
      .catch(() => { if (!cancelled) setSummary(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id, canFetch]);

  return { summary, loading };
}
