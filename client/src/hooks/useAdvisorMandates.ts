/**
 * Advisor multi-mandate roll-up data layer (Phase 3) over GET /api/advisor/mandates
 * (server/routes/advisorMandates.ts). Aggregates the buyer funnel + offer health
 * across the signed-in advisor's own active SELL-side deals.
 *
 * THE LINE: every field is a factual count / max / soonest-date. The hook does no
 * ranking and no prioritization — it just fetches the aggregate; the UI renders
 * countdowns and the user decides what to work on. Money is integer cents
 * (server coerces BIGINT→number; we defensively coerce again, null → "—").
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { DEV_AUTH_BYPASS, authHeaders, type User } from "./useAuth";

export type MandateStage = "identified" | "contacted" | "nda" | "cim" | "ioi" | "loi";
export type OfferStatusKey =
  | "received" | "under_review" | "countered" | "accepted" | "declined" | "expired" | "withdrawn";

export interface MandateRow {
  dealId: number;
  name: string;
  journeyType: string | null;
  currentGate: string | null;
  league: string | null;
  updatedAt: string | null;
  buyers: {
    total: number;
    byStage: Record<MandateStage | "passed", number>;
    furthestStage: MandateStage | null;
  };
  offers: {
    total: number;
    live: number;
    byStatus: Record<OfferStatusKey, number>;
    highestOfferCents: number | null;
    latestOfferAt: string | null;
    soonestOfferExpiresAt: string | null;
    soonestExclusivityExpiresAt: string | null;
  };
}

export interface MandateTotals {
  activeMandates: number;
  buyersInPlay: number;
  buyersByStage: Record<MandateStage, number>;
  liveOffers: number;
  offersByStatus: Record<OfferStatusKey, number>;
}

function toNum(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}
function toCents(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Defensive normalization — the server already returns numbers, but BIGINT
 *  footguns are easy to reintroduce, so coerce counts + cents here too. */
function normalizeMandate(m: any): MandateRow {
  const stages: (MandateStage | "passed")[] = ["identified", "contacted", "nda", "cim", "ioi", "loi", "passed"];
  const statuses: OfferStatusKey[] = ["received", "under_review", "countered", "accepted", "declined", "expired", "withdrawn"];
  return {
    dealId: toNum(m?.dealId),
    name: m?.name || `Deal #${toNum(m?.dealId)}`,
    journeyType: m?.journeyType ?? null,
    currentGate: m?.currentGate ?? null,
    league: m?.league ?? null,
    updatedAt: m?.updatedAt ?? null,
    buyers: {
      total: toNum(m?.buyers?.total),
      byStage: Object.fromEntries(stages.map((s) => [s, toNum(m?.buyers?.byStage?.[s])])) as Record<MandateStage | "passed", number>,
      furthestStage: (m?.buyers?.furthestStage ?? null) as MandateStage | null,
    },
    offers: {
      total: toNum(m?.offers?.total),
      live: toNum(m?.offers?.live),
      byStatus: Object.fromEntries(statuses.map((s) => [s, toNum(m?.offers?.byStatus?.[s])])) as Record<OfferStatusKey, number>,
      highestOfferCents: toCents(m?.offers?.highestOfferCents),
      latestOfferAt: m?.offers?.latestOfferAt ?? null,
      soonestOfferExpiresAt: m?.offers?.soonestOfferExpiresAt ?? null,
      soonestExclusivityExpiresAt: m?.offers?.soonestExclusivityExpiresAt ?? null,
    },
  };
}

export function useAdvisorMandates(user: User | null) {
  const canFetch = !!user && !DEV_AUTH_BYPASS;
  const [mandates, setMandates] = useState<MandateRow[]>([]);
  const [totals, setTotals] = useState<MandateTotals | null>(null);
  const [loading, setLoading] = useState(canFetch);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!canFetch) {
      setMandates([]);
      setTotals(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/advisor/mandates`, { headers: authHeaders() });
      const j = await r.json().catch(() => ({}));
      if (r.ok) {
        setMandates(Array.isArray(j.mandates) ? j.mandates.map(normalizeMandate) : []);
        setTotals(j.totals ?? null);
      } else {
        setError(j.error || "Failed to load mandates");
      }
    } catch {
      setError("Failed to load mandates");
    }
    setLoading(false);
  }, [canFetch]);

  useEffect(() => {
    void load();
  }, [load]);

  // O(1) lookup so a board card can join its mandate row by dealId.
  const byDealId = useMemo(() => {
    const m = new Map<number, MandateRow>();
    for (const row of mandates) m.set(row.dealId, row);
    return m;
  }, [mandates]);

  return { mandates, totals, byDealId, loading, error, canFetch, refresh: load };
}
