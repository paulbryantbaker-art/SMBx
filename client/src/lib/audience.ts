/* Audience model — primary axis for persona-aware UI.
   Per PRODUCT_AUDIT.md §1, the matrix's seven audiences are higher-resolution
   than the four journey personas in CLAUDE.md. We use audience as the
   primary axis (drives copy, capability shortcuts, sample data) and the
   journey is a secondary attribute derived from it (sell / buy / raise / pmi).
*/

export type Audience =
  | "principal_buyer"
  | "principal_seller"
  | "search_funder"
  | "independent_sponsor"
  | "lmm_advisor"
  | "corp_dev"
  | "family_office";

export const AUDIENCES: Audience[] = [
  "principal_buyer",
  "principal_seller",
  "search_funder",
  "independent_sponsor",
  "lmm_advisor",
  "corp_dev",
  "family_office",
];

/** Default for an anonymous test drive — lowest-friction entry per matrix
    audience #7 (principal buyer is the most universal "first acquirer"
    flow and matches our existing buyer-shaped sample data). */
export const DEFAULT_AUDIENCE: Audience = "principal_buyer";

/** Short labels for the audience switcher pill. Kept tight so the pill
    fits on a 375px viewport without truncation. */
export const AUDIENCE_LABELS: Record<Audience, string> = {
  principal_buyer:     "Buyer",
  principal_seller:    "Seller",
  search_funder:       "Searcher",
  independent_sponsor: "Sponsor",
  lmm_advisor:         "Advisor",
  corp_dev:            "Corp dev",
  family_office:       "Family office",
};

/** Long labels for tooltips, settings sheets, and copy that introduces the
    audience by name. */
export const AUDIENCE_LONG: Record<Audience, string> = {
  principal_buyer:     "First-time buyer",
  principal_seller:    "Owner-operator selling",
  search_funder:       "Search fund / ETA operator",
  independent_sponsor: "Independent sponsor",
  lmm_advisor:         "LMM advisor / boutique broker",
  corp_dev:            "Corp dev at a serial acquirer",
  family_office:       "Family office, direct-investing",
};

/** Maps audience → primary journey from CLAUDE.md / METHODOLOGY V17.
    Audiences that span multiple journeys (search funder is buy + pmi)
    list the most-active journey here. */
export const AUDIENCE_JOURNEY: Record<Audience, "buy" | "sell" | "raise" | "pmi"> = {
  principal_buyer:     "buy",
  principal_seller:    "sell",
  search_funder:       "buy",
  independent_sponsor: "buy",
  lmm_advisor:         "sell",  // advisors are sell-side first
  corp_dev:            "buy",
  family_office:       "buy",
};

/** Buy-side audiences (drives Pipeline tab visibility and stage labels). */
export function isBuySide(a: Audience): boolean {
  const j = AUDIENCE_JOURNEY[a];
  return j === "buy";
}

/** Sell-side audiences. Per matrix Decision 2, principal sellers should NOT
    see a stage pipeline; they get a "Your buyers" view instead. */
export function isSellSide(a: Audience): boolean {
  const j = AUDIENCE_JOURNEY[a];
  return j === "sell";
}
