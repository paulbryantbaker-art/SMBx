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
  /** One-sentence reason for the verdict, shown as the blurb on Detail.
      For WATCH deals this should also include what would flip it to PURSUE
      so the user understands the criteria, not just the label. */
  verdictWhy?: string;
}

/* 24 sample deals across all five stages so chips filter into real lists.
   Geography / industry / size kept varied so the demo doesn't look
   templated. Verdicts leaning to "watch" since that's where this app's
   centre of gravity is. */
export const SAMPLE_DEAL_BANK: SampleDeal[] = [
  // In review (the four currently shown — same data, just centralized)
  { id: "deal-bigfake",    name: "Big Fake Deal · sample",    sub: "$1.80M SDE · honest capex story",     stage: "in-review", verdict: "pursue", icon: "cool",    fit: 92, metric: "$1.80M SDE",
    verdictWhy: "Recast holds. $760K of clean add-backs, top-5 concentration looks scary but accounts are 6+ years old with zero churn — that's a moat. NWC peg flagged for QoE, otherwise SBA-clear at 7.0×." },
  { id: "deal-pest",       name: "Pest Control · FL",         sub: "92% on monthly contracts",            stage: "in-review", verdict: "pursue", icon: "cool",    fit: 84, metric: "$1.4M SDE",
    verdictWhy: "92% recurring revenue on monthly service contracts. Strong PE roll-up vertical (Anticimex/Rentokil/Rollins active). Add-back rich, multiples typically 4-6× SDE." },
  { id: "deal-electrical", name: "Electrical Contractor · TX", sub: "Margins good · concentration risk",  stage: "in-review", verdict: "watch",  icon: "default", fit: 78, metric: "Watch",
    verdictWhy: "60% revenue from one customer is the deal-killer. Flips to PURSUE if (a) that anchor is on a multi-year locked contract, (b) 5+ years zero-churn history, and (c) the relationship transfers cleanly post-close." },
  { id: "deal-hvac",       name: "HVAC platform · CO",        sub: "Family business · clean financials",  stage: "in-review", verdict: "watch",  icon: "default", fit: 74, metric: "Watch",
    verdictWhy: "Clean books, but it's a family business and dad runs everything. Flips to PURSUE if a non-family GM is already in place or there's a credible 12-month transition plan." },

  // Pursuing (advanced — actively in motion)
  { id: "deal-marina",     name: "Marina Holdings · FL",      sub: "$8.2M rev · Tampa Bay",                stage: "pursuing",  verdict: "pursue", icon: "cool",    fit: 89, metric: "Pursue",
    verdictWhy: "Slip rentals are de facto recurring (95% renewal). Land-and-water moat. LOI submitted, in due diligence." },
  { id: "deal-logistics",  name: "Boutique Logistics · GA",   sub: "$6.7M rev · Atlanta",                  stage: "pursuing",  verdict: "pursue", icon: "default", fit: 82, metric: "Pursue",
    verdictWhy: "Specialty freight niche, owner driving 90% of EBITDA growth. Earnout structure works. IOI accepted, drafting LOI." },

  // Watching (longer tail — Yulia is keeping an eye)
  { id: "deal-pestrollup", name: "Pest Control Roll-up · FL", sub: "$4.1M rev · Orlando",                  stage: "watching",  verdict: "pursue", icon: "cool",    fit: 86, metric: "$1.4M SDE",
    verdictWhy: "Three locations consolidated, 88% recurring. Roll-up arithmetic works at this size. Waiting on Q3 numbers." },
  { id: "deal-elec-tx",    name: "Electrical Contractor · TX", sub: "$8.7M rev · Austin",                  stage: "watching",  verdict: "watch",  icon: "default", fit: 79, metric: "Watch",
    verdictWhy: "Same concentration risk as the in-review TX one. Flips to PURSUE if anchor customer is contractually locked and the relationship transfers." },
  { id: "deal-hvac-az",    name: "HVAC services · AZ",        sub: "$3.2M rev · Phoenix",                  stage: "watching",  verdict: "watch",  icon: "default", fit: 76, metric: "Watch",
    verdictWhy: "Strong service contract base but seller wants to stay 30 days. Flips to PURSUE with a real 6-month transition + non-compete." },
  { id: "deal-laundry",    name: "Commercial laundry · NC",   sub: "$5.5M rev · Charlotte",                stage: "watching",  verdict: "watch",  icon: "default", fit: 73, metric: "Watch",
    verdictWhy: "Hospital + hotel contracts are sticky, but capex on washers is heavy. Flips to PURSUE if recent capex is verified and lease has 7+ years." },
  { id: "deal-dental",     name: "Dental DSO · FL",           sub: "$11M rev · 4 locations",               stage: "watching",  verdict: "watch",  icon: "default", fit: 71, metric: "Watch",
    verdictWhy: "DSO arithmetic works above 5 locations. Flips to PURSUE if seller will roll equity for 18 months while you add the 5th location." },
  { id: "deal-landscape",  name: "Landscaping group · TX",    sub: "$6.1M rev · DFW + Austin",             stage: "watching",  verdict: "pursue", icon: "cool",    fit: 70, metric: "Pursue",
    verdictWhy: "Two-metro footprint with fleet in place. Recurring HOA + commercial contracts. Below-multiple ask — moving to LOI." },
  { id: "deal-fab",        name: "Metal fabrication · OH",    sub: "$4.8M rev · Cleveland",                stage: "watching",  verdict: "watch",  icon: "default", fit: 68, metric: "Watch",
    verdictWhy: "OEM concentration on two automotive accounts. Flips to PURSUE if non-auto book grows past 30% before close." },

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
