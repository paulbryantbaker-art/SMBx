/**
 * usePortfolioSummary — fetches GET /api/portfolio/summary for the V6
 * PortfolioOverviewCard (desktop) and the mobile Pipeline header (B2.8).
 *
 * Anonymous callers get null — the consuming components hide the card.
 */
import { useEffect, useState } from "react";
import { authHeaders, type User } from "./useAuth";

export interface GateCount { gate: string; count: number }
export interface CloseWindowCount { window: string; label: string; count: number }

export interface PortfolioSummary {
  totalActive: number;
  weightedEvCents: number;
  totalEvCents: number;
  byGate: GateCount[];
  byCloseWindow: CloseWindowCount[];
}

export function usePortfolioSummary(user: User | null): {
  data: PortfolioSummary | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setData(null); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch("/api/portfolio/summary", { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((d: PortfolioSummary) => { if (!cancelled) setData(d); })
      .catch((e: Error) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id]);

  return { data, loading, error };
}

/** Format cents as compact USD ($1.2M, $850K, etc.) */
export function fmtEv(cents: number): string {
  if (!cents || cents <= 0) return "—";
  const dollars = cents / 100;
  if (dollars >= 1_000_000_000) return `$${(dollars / 1_000_000_000).toFixed(1)}B`;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1_000) return `$${Math.round(dollars / 1_000)}K`;
  return `$${Math.round(dollars).toLocaleString()}`;
}
