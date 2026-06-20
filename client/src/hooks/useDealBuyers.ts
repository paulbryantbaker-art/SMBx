/**
 * Sell-side buyer funnel data layer (advisor cockpit) over /api/deals/:id/buyers
 * (server/routes/dealBuyers.ts). A buyer is one acquirer the advisor is marketing
 * a sell mandate to, moving through identified → contacted → nda → cim → ioi →
 * loi → passed. THE LINE: this tracks status and lets the user draft outreach;
 * it never contacts a buyer.
 */
import { useCallback, useEffect, useState } from "react";
import { DEV_AUTH_BYPASS, authHeaders, type User } from "./useAuth";

export type BuyerStage = "identified" | "contacted" | "nda" | "cim" | "ioi" | "loi" | "passed";
export type BuyerType = "strategic" | "financial" | "individual";

export interface DealBuyer {
  id: number;
  deal_id: number;
  user_id: number;
  name: string;
  buyer_type: BuyerType;
  stage: BuyerStage;
  contacted_at: string | null;
  nda_signed_at: string | null;
  do_not_contact: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** The funnel order — used for grouping, counts, and "advance" logic. `passed`
 *  is a side bucket, not the end of the line. */
export const BUYER_STAGES: { id: BuyerStage; label: string }[] = [
  { id: "identified", label: "Identified" },
  { id: "contacted", label: "Contacted" },
  { id: "nda", label: "NDA signed" },
  { id: "cim", label: "CIM sent" },
  { id: "ioi", label: "IOI" },
  { id: "loi", label: "LOI" },
];
export const BUYER_TYPES: { id: BuyerType; label: string }[] = [
  { id: "strategic", label: "Strategic" },
  { id: "financial", label: "Financial" },
  { id: "individual", label: "Individual" },
];

export function useDealBuyers(user: User | null, dealId: number | null) {
  const canFetch = !!user && !DEV_AUTH_BYPASS && dealId != null;
  const [buyers, setBuyers] = useState<DealBuyer[]>([]);
  const [loading, setLoading] = useState(canFetch);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!canFetch) {
      setBuyers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/deals/${dealId}/buyers`, { headers: authHeaders() });
      const j = await r.json().catch(() => ({}));
      if (r.ok) setBuyers(Array.isArray(j.buyers) ? j.buyers : []);
      else setError(j.error || "Failed to load buyers");
    } catch {
      setError("Failed to load buyers");
    }
    setLoading(false);
  }, [canFetch, dealId]);

  useEffect(() => {
    void load();
  }, [load]);

  const addBuyer = useCallback(
    async (input: { name: string; buyer_type?: BuyerType; notes?: string }) => {
      if (dealId == null) return;
      const r = await fetch(`/api/deals/${dealId}/buyers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(input),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.buyer) setBuyers((prev) => [...prev, j.buyer]);
    },
    [dealId],
  );

  const updateBuyer = useCallback(
    async (buyerId: number, patch: Partial<Pick<DealBuyer, "stage" | "buyer_type" | "name" | "notes" | "do_not_contact" | "nda_signed_at">>) => {
      if (dealId == null) return;
      // optimistic
      setBuyers((prev) => prev.map((b) => (b.id === buyerId ? { ...b, ...patch } : b)));
      const r = await fetch(`/api/deals/${dealId}/buyers/${buyerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(patch),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.buyer) setBuyers((prev) => prev.map((b) => (b.id === buyerId ? j.buyer : b)));
      else void load(); // reconcile on failure
    },
    [dealId, load],
  );

  const removeBuyer = useCallback(
    async (buyerId: number) => {
      if (dealId == null) return;
      setBuyers((prev) => prev.filter((b) => b.id !== buyerId));
      await fetch(`/api/deals/${dealId}/buyers/${buyerId}`, { method: "DELETE", headers: authHeaders() });
    },
    [dealId],
  );

  return { buyers, loading, error, canFetch, refresh: load, addBuyer, updateBuyer, removeBuyer };
}
