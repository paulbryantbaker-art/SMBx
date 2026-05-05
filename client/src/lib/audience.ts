/* Persona model for in-app routing.
   The full audience matrix in PRODUCT_AUDIT.md §1 lists seven marketing
   segments (search funders vs. independent sponsors vs. principal buyers
   etc.). The PROCESSES those segments run aren't actually different in
   the app — only the analysis depth and document complexity (which is
   the L1–L6 sophistication axis from METHODOLOGY V17, layered later).
   What genuinely diverges is the JOURNEY: are you buying, selling,
   raising, or integrating? Those are four different flows with
   different gates, artifacts, and counterparties.

   So we collapse here to the four journey personas from CLAUDE.md and
   METHODOLOGY V17. The marketing-segment matrix still applies on the
   marketing side (homepage, pricing, sales copy) — just not in the app
   shell.

   Type name stays `Audience` so we don't churn the wiring. Values are
   the four journey codes.
*/

export type Audience = "buy" | "sell" | "raise" | "pmi";

export const AUDIENCES: Audience[] = ["buy", "sell", "raise", "pmi"];

/** Default for an anonymous test drive — buy is the most universal flow
    and the one most existing sample data is shaped around. */
export const DEFAULT_AUDIENCE: Audience = "buy";

/** Short labels for the audience switcher pill. */
export const AUDIENCE_LABELS: Record<Audience, string> = {
  buy:   "Buyer",
  sell:  "Seller",
  raise: "Raiser",
  pmi:   "Integrator",
};

/** Long labels — used in the picker sheet and aria-labels. */
export const AUDIENCE_LONG: Record<Audience, string> = {
  buy:   "Buying a business",
  sell:  "Selling a business",
  raise: "Raising capital",
  pmi:   "Integrating an acquisition",
};

/** Maps audience → primary journey code from CLAUDE.md / METHODOLOGY V17.
    Identity mapping now that the two axes have been unified. */
export const AUDIENCE_JOURNEY: Record<Audience, "buy" | "sell" | "raise" | "pmi"> = {
  buy:   "buy",
  sell:  "sell",
  raise: "raise",
  pmi:   "pmi",
};

export function isBuySide(a: Audience): boolean {
  return a === "buy";
}

export function isSellSide(a: Audience): boolean {
  return a === "sell";
}
