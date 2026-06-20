/**
 * Structured inbound offers data layer (advisor sell-side cockpit, Phase 2) over
 * /api/deals/:id/offers (server/routes/dealOffers.ts). A deal_offer is one IOI/LOI
 * a buyer submits, with structured TERMS. It is a child of a deal_buyer (one buyer,
 * many offers over time), keyed by buyer_id. THE LINE: this captures and compares
 * terms; it never recommends an offer or contacts the buyer.
 *
 * Money note: the server stores BIGINT cents, which postgres-js returns as STRINGS
 * over JSON. Every numeric field is coerced via toNum on load so the client shape
 * is `number | null` end-to-end and fmtCents (em-dash for null) works directly.
 */
import { useCallback, useEffect, useState } from "react";
import { DEV_AUTH_BYPASS, authHeaders, type User } from "./useAuth";

export type OfferType = "ioi" | "loi";
export type OfferStatus =
  | "received"
  | "under_review"
  | "countered"
  | "accepted"
  | "declined"
  | "expired"
  | "withdrawn";

export interface DealOffer {
  id: number;
  deal_id: number;
  buyer_id: number | null;
  user_id: number;
  buyer_name: string | null;
  offer_type: OfferType;
  status: OfferStatus;
  // Consideration legs — integer cents (number | null after normalization).
  total_price_cents: number | null;
  cash_at_close_cents: number | null;
  seller_note_cents: number | null;
  seller_note_rate_bps: number | null;
  seller_note_term_months: number | null;
  earnout_cents: number | null;
  earnout_term_months: number | null;
  earnout_basis: string | null;
  rollover_cents: number | null;
  escrow_holdback_cents: number | null;
  contingencies: string | null;
  exclusivity_days: number | null;
  expires_at: string | null;
  notes: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Editable input for a new / updated offer. All money in INTEGER CENTS (the UI
 *  converts dollars → cents before calling). */
export type OfferInput = Partial<
  Pick<
    DealOffer,
    | "buyer_id"
    | "buyer_name"
    | "offer_type"
    | "status"
    | "total_price_cents"
    | "cash_at_close_cents"
    | "seller_note_cents"
    | "seller_note_rate_bps"
    | "seller_note_term_months"
    | "earnout_cents"
    | "earnout_term_months"
    | "earnout_basis"
    | "rollover_cents"
    | "escrow_holdback_cents"
    | "contingencies"
    | "exclusivity_days"
    | "expires_at"
    | "notes"
    | "submitted_at"
  >
>;

export const OFFER_TYPES: { id: OfferType; label: string }[] = [
  { id: "ioi", label: "IOI" },
  { id: "loi", label: "LOI" },
];

/** Funnel-ish status order for grouping / display. `received` is the entry. */
export const OFFER_STATUSES: { id: OfferStatus; label: string }[] = [
  { id: "received", label: "Received" },
  { id: "under_review", label: "Under review" },
  { id: "countered", label: "Countered" },
  { id: "accepted", label: "Accepted" },
  { id: "declined", label: "Declined" },
  { id: "expired", label: "Expired" },
  { id: "withdrawn", label: "Withdrawn" },
];

function toNum(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

const NUMERIC_FIELDS: (keyof DealOffer)[] = [
  "total_price_cents", "cash_at_close_cents", "seller_note_cents", "seller_note_rate_bps",
  "seller_note_term_months", "earnout_cents", "earnout_term_months", "rollover_cents",
  "escrow_holdback_cents", "exclusivity_days",
];

/** Coerce a raw server row (string cents) into a number-shaped DealOffer. */
function normalize(raw: any): DealOffer {
  const o = { ...raw } as DealOffer;
  for (const f of NUMERIC_FIELDS) (o as any)[f] = toNum((raw as any)[f]);
  return o;
}

export function useDealOffers(user: User | null, dealId: number | null) {
  const canFetch = !!user && !DEV_AUTH_BYPASS && dealId != null;
  const [offers, setOffers] = useState<DealOffer[]>([]);
  const [loading, setLoading] = useState(canFetch);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!canFetch) {
      setOffers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/deals/${dealId}/offers`, { headers: authHeaders() });
      const j = await r.json().catch(() => ({}));
      if (r.ok) setOffers(Array.isArray(j.offers) ? j.offers.map(normalize) : []);
      else setError(j.error || "Failed to load offers");
    } catch {
      setError("Failed to load offers");
    }
    setLoading(false);
  }, [canFetch, dealId]);

  useEffect(() => {
    void load();
  }, [load]);

  const addOffer = useCallback(
    async (input: OfferInput): Promise<DealOffer | null> => {
      if (dealId == null) return null;
      const r = await fetch(`/api/deals/${dealId}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(input),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.offer) {
        const o = normalize(j.offer);
        setOffers((prev) => [o, ...prev]);
        return o;
      }
      setError(j.error || "Failed to add offer");
      return null;
    },
    [dealId],
  );

  const updateOffer = useCallback(
    async (offerId: number, patch: OfferInput) => {
      if (dealId == null) return;
      // optimistic
      setOffers((prev) => prev.map((o) => (o.id === offerId ? { ...o, ...patch } as DealOffer : o)));
      const r = await fetch(`/api/deals/${dealId}/offers/${offerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(patch),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.offer) setOffers((prev) => prev.map((o) => (o.id === offerId ? normalize(j.offer) : o)));
      else void load(); // reconcile on failure
    },
    [dealId, load],
  );

  const removeOffer = useCallback(
    async (offerId: number) => {
      if (dealId == null) return;
      setOffers((prev) => prev.filter((o) => o.id !== offerId));
      const r = await fetch(`/api/deals/${dealId}/offers/${offerId}`, { method: "DELETE", headers: authHeaders() });
      if (!r.ok) void load(); // reconcile the row back on a failed delete
    },
    [dealId, load],
  );

  return { offers, loading, error, canFetch, refresh: load, addOffer, updateOffer, removeOffer };
}
