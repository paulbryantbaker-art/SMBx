/* Cross-screen sample deal bank for the anonymous test drive.
   Single source of truth so chips on Pipeline filter into the same
   pool the WatchingScreen reads from. Each deal carries a stage so
   the chips can filter, plus the visual fields (icon, verdict, action)
   the rows render. */

import type { Verdict, YIconKind } from "../components/v6/mobile/types";

export type DealStage = "sourced" | "screened" | "in-review" | "pursuing" | "watching";
export type DealAction = "open" | "watch" | "pass" | "pursue";

export interface SampleDeal {
  id: string;
  name: string;
  sub: string;
  /** Where in Yulia's pipeline this deal sits — drives chip filter on Pipeline. */
  stage: DealStage;
  /** Yulia's call. Drives row pill (Pursue / Watch / Pass) and verdict color. */
  verdict: Verdict;
  icon: YIconKind;
  /** Fit score 0–100 — used by the ranked Watching list. */
  fit: number;
  /** Headline figure shown on the right of the row (e.g. "$1.4M SDE"). */
  metric: string;
}

/* 24 sample deals across all five stages so chips filter into real lists.
   Geography / industry / size kept varied so the demo doesn't look
   templated. Verdicts leaning to "watch" since that's where this app's
   centre of gravity is. */
export const SAMPLE_DEAL_BANK: SampleDeal[] = [
  // In review (the four currently shown — same data, just centralized)
  { id: "deal-bigfake",    name: "Big Fake Deal · sample",    sub: "$1.80M SDE · honest capex story",     stage: "in-review", verdict: "pursue", icon: "cool",    fit: 92, metric: "$1.80M SDE" },
  { id: "deal-pest",       name: "Pest Control · FL",         sub: "92% on monthly contracts",            stage: "in-review", verdict: "pursue", icon: "cool",    fit: 84, metric: "$1.4M SDE" },
  { id: "deal-electrical", name: "Electrical Contractor · TX", sub: "Margins good · concentration risk",  stage: "in-review", verdict: "watch",  icon: "default", fit: 78, metric: "Watch" },
  { id: "deal-hvac",       name: "HVAC platform · CO",        sub: "Family business · clean financials",  stage: "in-review", verdict: "watch",  icon: "default", fit: 74, metric: "Watch" },

  // Pursuing (advanced — actively in motion)
  { id: "deal-marina",     name: "Marina Holdings · FL",      sub: "$8.2M rev · Tampa Bay",                stage: "pursuing",  verdict: "pursue", icon: "cool",    fit: 89, metric: "Pursue" },
  { id: "deal-logistics",  name: "Boutique Logistics · GA",   sub: "$6.7M rev · Atlanta",                  stage: "pursuing",  verdict: "pursue", icon: "default", fit: 82, metric: "Pursue" },

  // Watching (longer tail — Yulia is keeping an eye)
  { id: "deal-pestrollup", name: "Pest Control Roll-up · FL", sub: "$4.1M rev · Orlando",                  stage: "watching",  verdict: "pursue", icon: "cool",    fit: 86, metric: "$1.4M SDE" },
  { id: "deal-elec-tx",    name: "Electrical Contractor · TX", sub: "$8.7M rev · Austin",                  stage: "watching",  verdict: "watch",  icon: "default", fit: 79, metric: "Watch" },
  { id: "deal-hvac-az",    name: "HVAC services · AZ",        sub: "$3.2M rev · Phoenix",                  stage: "watching",  verdict: "watch",  icon: "default", fit: 76, metric: "Watch" },
  { id: "deal-laundry",    name: "Commercial laundry · NC",   sub: "$5.5M rev · Charlotte",                stage: "watching",  verdict: "watch",  icon: "default", fit: 73, metric: "Watch" },
  { id: "deal-dental",     name: "Dental DSO · FL",           sub: "$11M rev · 4 locations",               stage: "watching",  verdict: "watch",  icon: "default", fit: 71, metric: "Watch" },
  { id: "deal-landscape",  name: "Landscaping group · TX",    sub: "$6.1M rev · DFW + Austin",             stage: "watching",  verdict: "pursue", icon: "cool",    fit: 70, metric: "Pursue" },
  { id: "deal-fab",        name: "Metal fabrication · OH",    sub: "$4.8M rev · Cleveland",                stage: "watching",  verdict: "watch",  icon: "default", fit: 68, metric: "Watch" },

  // Screened (passed initial screen but not deeply reviewed yet)
  { id: "deal-roofing",    name: "Roofing contractor · GA",   sub: "$3.4M rev · Atlanta metro",            stage: "screened",  verdict: "watch",  icon: "default", fit: 66, metric: "$840K SDE" },
  { id: "deal-plumbing",   name: "Plumbing services · TN",    sub: "$2.9M rev · Nashville",                stage: "screened",  verdict: "watch",  icon: "default", fit: 64, metric: "$610K SDE" },
  { id: "deal-flooring",   name: "Flooring install · WA",     sub: "$5.1M rev · Seattle",                  stage: "screened",  verdict: "watch",  icon: "default", fit: 62, metric: "Watch" },
  { id: "deal-paint",      name: "Painting · CO",             sub: "$2.4M rev · Denver",                   stage: "screened",  verdict: "pass",   icon: "default", fit: 48, metric: "Pass" },

  // Sourced (raw top of funnel — Yulia found these but hasn't screened)
  { id: "deal-tile",       name: "Tile & stone · FL",         sub: "$1.8M rev · Miami",                    stage: "sourced",   verdict: "watch",  icon: "default", fit: 58, metric: "View" },
  { id: "deal-irrigation", name: "Irrigation · CA",           sub: "$2.6M rev · Sacramento",               stage: "sourced",   verdict: "watch",  icon: "default", fit: 56, metric: "View" },
  { id: "deal-fence",      name: "Fence install · TX",        sub: "$3.0M rev · Houston",                  stage: "sourced",   verdict: "watch",  icon: "default", fit: 55, metric: "View" },
  { id: "deal-pool",       name: "Pool service · AZ",         sub: "$1.4M rev · Scottsdale",               stage: "sourced",   verdict: "pass",   icon: "default", fit: 42, metric: "Pass" },
  { id: "deal-gutter",     name: "Gutter cleaning · OR",      sub: "$1.1M rev · Portland",                 stage: "sourced",   verdict: "pass",   icon: "default", fit: 40, metric: "Pass" },
  { id: "deal-locksmith",  name: "Locksmith · MN",            sub: "$0.9M rev · Minneapolis",              stage: "sourced",   verdict: "pass",   icon: "default", fit: 38, metric: "Pass" },
  { id: "deal-distohi",    name: "Distribution · OH",         sub: "Asking high · margins thin",           stage: "sourced",   verdict: "pass",   icon: "default", fit: 35, metric: "Pass" },
];

export function dealsByStage(stage: DealStage): SampleDeal[] {
  return SAMPLE_DEAL_BANK.filter(d => d.stage === stage);
}

/** All deals where Yulia's call is "watch" or "pursue" — the WatchingScreen feed. */
export function watchableDeals(): SampleDeal[] {
  return SAMPLE_DEAL_BANK
    .filter(d => d.verdict !== "pass")
    .sort((a, b) => b.fit - a.fit);
}

export function findDeal(id: string): SampleDeal | undefined {
  return SAMPLE_DEAL_BANK.find(d => d.id === id);
}
