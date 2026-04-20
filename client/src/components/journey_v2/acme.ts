/**
 * Acme, Inc. — the canonical worked example across every journey page.
 *
 * Paul 2026-04-20: one running character, not five. Sell/Buy/Raise/
 * Integrate all walk the visitor through Acme at the stage relevant
 * to that page. Numbers tie out across pages.
 *
 * Profile:
 *   Upper middle-market multi-discipline industrial distributor.
 *   Phoenix HQ with AZ/NM/TX/NV footprint (SW USA). Founded 1987 by
 *   Ray Whitaker, Sr. Current owner Ray Jr. (58, 2nd gen) exploring
 *   exit in 18–24 months. 140 employees. 400+ active accounts.
 *   Hospitality, industrial, healthcare, and construction supply.
 *
 * Financials (canon):
 *   Revenue            $65.0M
 *   Reported EBITDA    $9.2M   (14.2% margin)
 *   Defensible add-backs  $1.8M
 *   Normalized EBITDA  $11.0M  (17% margin)
 *   At 7.5× normalized → EV ~$82.5M
 *
 * Key people (referenced by name across pages):
 *   - Ray Whitaker Jr.   · Owner / CEO · 58 · 2nd generation
 *   - Nina Arellano      · COO · 14yr tenure · holds ops together
 *   - Jennifer Wu        · Controller · 11yr · all banking + vendor MOUs
 *   - Marco Delgado      · VP Sales · 22yr · top-10 customer relationships
 *   - Dana Okafor        · Regional Manager · New Mexico + West Texas
 */

export const ACME = {
  name: 'Acme, Inc.',
  tagline: 'Multi-discipline industrial distribution · SW USA',
  hq: 'Phoenix, AZ',
  footprint: 'AZ · NM · TX · NV',
  founded: 1987,
  age: 38,
  employees: 140,
  accounts: 400,
  concentration: { topN: 10, pct: 35 },   // top-10 = 35% of revenue
  recurring: 0.62,                         // 62% on blanket / repeating POs

  /* Income statement */
  revenue: 65_000_000,
  revenueLabel: '$65.0M',
  reportedEbitda: 9_200_000,
  reportedEbitdaLabel: '$9.2M',
  reportedMarginLabel: '14.2%',
  addBacksTotal: 1_800_000,
  addBacksLabel: '$1.8M',
  normalizedEbitda: 11_000_000,
  normalizedEbitdaLabel: '$11.0M',
  normalizedMarginLabel: '17.0%',

  /* Valuation */
  multiple: 7.5,
  multipleLabel: '7.5×',
  multipleLow: 7.0,
  multipleHigh: 8.5,
  evLabel: '$82.5M',
  evLowLabel: '$77M',
  evHighLabel: '$94M',

  /* Post-close (for Integrate) */
  closeDate: '2026-03-21',                 // Friday
  day3: '2026-03-24',                      // Monday
  workingCapital: '$4.8M',
  covenantDscr: '1.25×',

  /* People */
  people: {
    owner:     { name: 'Ray Whitaker Jr.', role: 'Owner / CEO', tenure: '2nd gen · 32yr in business', age: 58 },
    coo:       { name: 'Nina Arellano',    role: 'COO',         tenure: '14yr' },
    controller:{ name: 'Jennifer Wu',      role: 'Controller',  tenure: '11yr' },
    sales:     { name: 'Marco Delgado',    role: 'VP Sales',    tenure: '22yr' },
    regional:  { name: 'Dana Okafor',      role: 'Regional Mgr · NM + West TX', tenure: '8yr' },
  },

  /* Discipline mix (for CIM / pitch narrative) */
  disciplines: [
    { name: 'Industrial MRO',      revPct: 38 },
    { name: 'Hospitality supply',  revPct: 24 },
    { name: 'Healthcare non-clinical', revPct: 19 },
    { name: 'Construction supply', revPct: 19 },
  ] as const,
};

/* Add-back line items for Acme — used on the Sell page's DealBench.
   Line items must sum to the stated total: $1.80M. */
export const ACME_ADDBACKS: readonly { title: string; sub: string; amt: string }[] = [
  { title: 'Owner comp above market',           sub: "Ray Jr.'s $420K vs $265K market replacement (BLS, distribution VP)", amt: '+$155K' },
  { title: 'Family on payroll',                  sub: 'Two siblings · non-operating roles · replaceable at market',           amt: '+$180K' },
  { title: 'Discretionary travel + events',      sub: 'Sponsor suites, board retreats, personal country-club dues',           amt: '+$95K' },
  { title: 'Legal reserve — one-time litigation', sub: 'Settled 2024 · non-recurring',                                          amt: '+$310K' },
  { title: 'Real estate above-market lease',     sub: 'Phoenix HQ leased from family trust · market rent delta',               amt: '+$420K' },
  { title: 'Discontinued Nevada branch',          sub: 'Closed Q3 2024 · overhead still in reported run-rate · carve-out',     amt: '+$640K' },
  { title: 'Defensible total',                   sub: 'All IRS-documented · Big-4 concordance ~96%',                           amt: '+$1.80M' },
];

/* Readiness dimension scores — referenced on Sell + Buy */
export const ACME_READINESS = [
  { label: 'Revenue quality',        value: 8.6, tone: 'green' as const },
  { label: 'Margins',                value: 7.9, tone: 'green' as const },
  { label: 'Owner dependency',       value: 5.4, tone: 'amber' as const },
  { label: 'Management depth',       value: 7.4, tone: 'green' as const },
  { label: 'Concentration',          value: 6.0, tone: 'amber' as const },
  { label: 'Financial integrity',    value: 9.1, tone: 'green' as const },
  { label: 'Scalability',            value: 8.0, tone: 'green' as const },
];

/* Rundown scores (Buy page) — same profile from buyer's lens */
export const ACME_RUNDOWN = [
  { label: 'Financial quality',      value: 9.1, tone: 'green' as const },
  { label: 'Margins',                value: 7.9, tone: 'green' as const },
  { label: 'Revenue quality',        value: 8.4, tone: 'green' as const },
  { label: 'Concentration',          value: 6.0, tone: 'amber' as const },
  { label: 'Management depth',       value: 7.4, tone: 'green' as const },
  { label: 'Owner dependency',       value: 5.4, tone: 'amber' as const },
  { label: 'Scalability',            value: 8.0, tone: 'green' as const },
];
