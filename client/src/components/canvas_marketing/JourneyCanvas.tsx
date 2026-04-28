/* JourneyCanvas — /journey in V23C Anthropic-restraint vocabulary.
 *
 * Mounted by AppShell at /journey. Canvas-wrapped paper sheet floats on
 * warm body (matches V23C home + HowItWorks + Pricing).
 *
 * Six personas (searcher / advisor / broker / sponsor / banker / planner)
 * share a single template. Persona swap via sticky pill bar at the top of
 * the canvas. Deep-linkable via `?p=<id>` (AppShell parses the query, this
 * file just consumes the prop).
 *
 * Per persona, the page lays out:
 *   1. Hero — eyebrow tag, restrained headline, sub, CTA pill
 *   2. What you're up against — 4-stat grid + paragraph + sources line
 *   3. How Yulia changes that — 4 numbered rows
 *   4. The arc — 4–5 stage strip (static, no animated draw)
 *   5. Six months in — italic-foil editorial paragraph (the one foil moment)
 *   6. Optional banker stack note
 *   7. Pricing pointer — single rule-divided line
 *   8. Final CTA — primary + secondary
 *   9. Site footer — duplicate of HowItWorks footer for parity
 *
 * Anthropic restraint applied:
 *   - One italic-foil moment per persona (Six Months In paragraph)
 *   - Hero scale ≤72px (NOT 124px V21)
 *   - No animated typewriter, count-up, glass-on-scroll, arc-draw
 *   - Sans throughout, italic-serif foil only at the single moment
 *   - Conservative motion (button hover lifts + persona-pill border)
 *   - Canvas card wraps content; warm body shows in gutters
 *
 * The 6-persona DATA constant from the prior build is preserved verbatim
 * — it's the load-bearing IP (sourced stats, persona-specific copy, demo
 * scripts). Only the rendering shell is replaced.
 */

import { useCallback, useEffect, useState, type CSSProperties } from 'react';

export type PersonaId =
  | 'searcher'
  | 'advisor'
  | 'broker'
  | 'sponsor'
  | 'banker'
  | 'planner';

interface Props {
  persona: PersonaId;
  onPersonaChange: (p: PersonaId) => void;
  onSend: (msg: string) => void;
  /** AppShell signature compat — Edition pages always render on cream. */
  dark: boolean;
}

interface PersonaContent {
  id: PersonaId;
  short: string;
  tag: string;
  headline: [string, string];
  headlineTail: string;
  sub: string;
  chatPh: string;
  chips: string[];
  stats: [string, string][];
  sources: string;
  upAgainst: string;
  changes: { title: string; body: string }[];
  demoTitle: string;
  demoLines: ['user' | 'yulia', string][];
  arc: [string, string][];
  sixMonthsIn: string;
  pricing: string;
  footerCta: string;
  stackNote?: { title: string; body: string };
}

const TABS: { id: PersonaId; short: string }[] = [
  { id: 'searcher', short: 'Searcher' },
  { id: 'advisor',  short: 'Advisor' },
  { id: 'broker',   short: 'Broker' },
  { id: 'sponsor',  short: 'Sponsor' },
  { id: 'banker',   short: 'Banker' },
  { id: 'planner',  short: 'Exit Planner' },
];

const SECTION_PAD = '56px';

const DATA: Record<PersonaId, PersonaContent> = {
  searcher: {
    id: 'searcher', short: 'Searcher',
    tag: 'SEARCHERS · ETA · SELF-FUNDED',
    headline: ['From 100 teasers', 'to 3 real deals.'],
    headlineTail: 'In a week, not a quarter.',
    sub: 'The median ETA search runs 19 months. You screen 100–300 companies a week. 37% of searches end without a close. Yulia screens a teaser in 90 seconds, runs pre-LOI diligence in the time it takes to read the teaser again, and models SBA-compliant structures that clear the June 2025 SOP 50 10 8 rule changes.',
    chatPh: 'Paste a teaser or describe what you’re looking for…',
    chips: ['Screen this teaser', 'Run QoE Lite', 'Model SBA structure for $4M EBITDA'],
    stats: [
      ['1,250', 'hours/yr on top-of-funnel screening'],
      ['37%', 'of searches end without a close'],
      ['21.3%', 'of 2025 LOIs broken on QoE'],
      ['19 mo', 'median search length'],
    ],
    sources: 'Stanford 2024 Search Fund Study · Fed SBCS 2024 · Axial Dead Deal Report 2025',
    upAgainst: '1,250 hours a year on top-of-funnel screening. A pipeline that tops out at 150 companies per week even with Grata or Sourcescrub. A 37% failure rate on the search itself. A 21.3% rate of LOI breaks from QoE discrepancies in 2025 — double the 2023 rate. And on June 1, 2025, SOP 50 10 8 deleted the phased buyout structure your peers relied on, forcing full seller standby and personal guarantees on retained equity.',
    changes: [
      { title: 'Proprietary sourcing engine.', body: 'Google Places + Census + SBA-data-integrated. Surfaces trigger-event targets by age, tenure, industry, and readiness markers. The intern-reading-PDFs loop becomes a scored pipeline Yulia maintains daily.' },
      { title: '90-second teaser screen.', body: 'SDE normalized against owner comp. Add-backs stress-tested. Customer concentration flagged. Pursue/pass with reasoning attached. The red flags your broker won’t volunteer — surfaced.' },
      { title: 'QoE Lite pre-LOI.', body: 'Proof of cash. NWC peg. One-timer scrub. The Range Rover add-back called out by name. The QoE findings that caused 21.3% of 2025 broken LOIs — surfaced at gate 10, not at the LP’s $75K outside QoE.' },
      { title: 'SOP 50 10 8 structures.', body: 'Hard-codes the June 2025 rule changes — seller note full-standby, 10% equity injection, no partial buyouts, tax-transcript verification. Deals that can’t be financed die at gate 4, not gate 18.' },
    ],
    demoTitle: 'Yulia · teaser screen',
    demoLines: [
      ['user', 'Screen this teaser. HVAC services, Texas, $1.8M revenue.'],
      ['yulia', 'Read. SDE $1.0M after normalizing $184K owner comp and three add-backs. Customer concentration moderate (top 5 = 38%). One red flag: Q3 revenue down 14% YoY — investigate before LOI.'],
      ['yulia', 'Indicative range 3.2× – 3.8× = $3.2–$3.8M. SBA 7a financeable at $4M cap with 10% injection. Pursue.'],
    ],
    arc: [
      ['Raise', 'LP pitch, search budget memo, quarterly LP update.'],
      ['Search', 'Buyer-criteria sheets, aggregator queries, inbound teaser scoring.'],
      ['Screen', '90-second pursue/pass. Survivors get CIM-level scrub.'],
      ['Buy', 'QoE Lite, structure modeling, IC memo, financing memo.'],
      ['Operate', '100-day plan, quarterly board update, monthly QoE.'],
    ],
    sixMonthsIn: 'You’ve screened 4,000 teasers without burning out an intern. Your top-12 pipeline is scored, dated, and ready to revisit when fundamentals change. The two LOIs you signed both held to close because Yulia caught the EBITDA discrepancies before the seller did. The third one you killed at gate 6 saved you $40K in dead-deal costs. You’re still searching — but you’re not the same searcher.',
    pricing: 'Free for the first deliverable. Starter $49 for one active search. Pro $149 for parallel deals.',
    footerCta: 'Try Yulia on a teaser you’re sitting on right now.',
  },

  advisor: {
    id: 'advisor', short: 'Advisor',
    tag: 'M&A ADVISORS · IBAs · LMM',
    headline: ['Your client’s CIM.', 'Drafted by Friday.'],
    headlineTail: 'Closed by Tuesday.',
    sub: 'You run 2–4 live mandates. CIM drafting eats 80–150 hours per mandate. 30–40% of engaged mandates don’t close. Bake-off win rate hovers at 20–33%. In a sub-$500M deal market sitting at multi-year lows, the advisors who close in 2026 are the ones who do more with less.',
    chatPh: 'Tell Yulia about a mandate you’re pitching or running…',
    chips: ['Draft a CIM for a $12M EBITDA platform', 'Build a buyer tree for industrial services', 'Generate the pitch for Tuesday’s bake-off'],
    stats: [
      ['400–600', 'hrs/yr on CIM drafting'],
      ['30–40%', 'mandate failure rate'],
      ['20–33%', 'bake-off win rate'],
      ['$80–250K', 'tool stack/yr · 5-person shop'],
    ],
    sources: 'FE Training 2024 · Vendr 2025 · Axial 2024 · FIRMEX Fee Guide',
    upAgainst: '400–600 hours a year of CIM drafting at principal rates. A 30–40% mandate failure rate — meaning 60% of your engagement hours don’t convert. A bake-off win rate of 20–33%, so 60–80% of your pitch labor is unrecovered. A tool stack that runs $80K–$250K a year for a 5-person shop — DealCloud, PitchBook, Axial, Datasite — that gives you raw material but doesn’t produce the finished work. And a sub-$500M deal market at multi-year lows.',
    changes: [
      { title: 'CIM draft in under an hour.', body: '100 pages, redline-ready, branded to your firm. The book that took three months of analyst time. First complete draft in the time it takes to have coffee with the client.' },
      { title: 'Buyer tree that responds.', body: 'Strategics, financials, platform plays — scored against the seller’s profile. Axial data shows a 21% pursuit-rate generates more than 2.5× the buyer interest of the 8% platform average.' },
      { title: '22-gate deal scoring.', body: 'Kill dying mandates at gate 8, not gate 18. Recover the 400 hours you’d otherwise sink in a dead engagement.' },
      { title: 'Structure modeling + negotiation tactics.', body: 'R&W insurance terms. Earnout structures that survive diligence. Rollover equity that PE buyers can’t unwind post-LOI. The Rundown™ — your complete deal intelligence package, branded and ready to send.' },
    ],
    demoTitle: 'Yulia · CIM section draft',
    demoLines: [
      ['user', 'Draft section 3.2 for the Acme mandate. Industrial services, $12M EBITDA.'],
      ['yulia', 'Drafting Operations & Customer Concentration… 30-year operating history, top 5 accounts at 38% of TTM revenue, multi-decade contract renewals.'],
      ['yulia', '847 words drafted, redline-ready. Want me to draft the next section while you review?'],
    ],
    arc: [
      ['Pitch', 'Pitchbook, comp set, indicative range.'],
      ['CIM', '100 pages of analyst-grade output in under an hour.'],
      ['Buyer tree', 'Public filings + enrichment, scored against the seller.'],
      ['Diligence', 'Status emails generated. Q&A drafted. Data room organized.'],
      ['Close', 'Closing checklist, funds-flow worksheet, earnout schedule.'],
    ],
    sixMonthsIn: 'You’ve taken on a fifth concurrent mandate. Your bake-off win rate moved from 25% to 38% because the pitch quality is sharper. The two PE buyers who got your CIMs last quarter both said the same thing: "this is the cleanest book we’ve seen this year." Two of them are now coming directly to you with new mandates. You added a junior — but only one — because Yulia is doing the work the second junior would have done.',
    pricing: 'Pro $149/month for the solo MD. Team $999 for a 2–5 advisor bench. Enterprise for 8+ concurrent mandates with SSO and shared deal vaults.',
    footerCta: 'Try Yulia on a mandate you’re pitching this week.',
  },

  broker: {
    id: 'broker', short: 'Broker',
    tag: 'BUSINESS BROKERS · IBBA',
    headline: ['Recast. Valuation.', 'Marketing package.'],
    headlineTail: 'By lunch.',
    sub: '75–90% of Main Street listings never sell. Each dead listing consumed 50–150 hours of your time. CIM prep takes 40–80 hours per engagement. 23–29% of deal failures trace to unrealistic seller expectations. Yulia handles the prep that swallows your week and arms you for the seller conversation that wins the listing.',
    chatPh: 'Tell Yulia about a listing you’re prepping…',
    chips: ['Recast this P&L', 'Run The Baseline on a $1.8M HVAC business', 'Draft the marketing package'],
    stats: [
      ['3.6', 'closes/broker/yr · IBBA Q4 2024'],
      ['75–90%', 'Main Street listings never sell'],
      ['40–80', 'hrs CIM prep per engagement'],
      ['23–29%', 'failures = unrealistic pricing'],
    ],
    sources: 'IBBA Market Pulse Q4 2024 · M&A Source 2024 · Axial 2024',
    upAgainst: 'IBBA Q4 2024: 368 brokers completed 330 deals — about 3.6 closes per broker per year. 75–90% of Main Street listings never sell. CIM prep on an engagement that does move forward runs 40–80 hours. 23–29% of deal failures trace to unrealistic seller expectations, with 84% of those pricing gaps 11–30% over realistic value. SBA 7(a) denial rate is 45% — and SOP 50 10 8 just tightened it further.',
    changes: [
      { title: 'The Baseline™ multi-scenario valuation.', body: 'Sourced to IBBA Market Pulse multiples and the seller’s financials. Three scenarios — quick cash, structured sale, strategic process — each with implications. Arms you for the "priced to sell" conversation before the listing is signed.' },
      { title: 'Full marketing package in hours.', body: 'CIM, teaser, NDA, buyer list, offer matrix. The 40–80 hour prep workflow becomes a 4-hour review cycle.' },
      { title: 'SBA pre-qualification modeling.', body: 'Buyer financial capacity tested against SOP 50 10 8 before LOI. Lender-kill rate drops from 30–40% back toward the pre-2024 15–20% baseline.' },
      { title: 'Buyer-list engine.', body: 'Google Places + comp-transactions database. Replaces the BizBuySell + DealStream + BizEquity stack with a single workspace.' },
    ],
    demoTitle: 'Yulia · recast worksheet',
    demoLines: [
      ['user', 'Recast this P&L. HVAC, Texas, $1.8M revenue.'],
      ['yulia', 'Recast complete. Reported earnings $612,400. Defended $388K in add-backs (owner comp, vehicle, legal, family payroll). Normalized SDE $1,000,600.'],
      ['yulia', 'Indicative range $3.2M–$3.8M at 3.2×–3.8× the IBBA TX industrial services band.'],
    ],
    arc: [
      ['Pitch the listing', 'Defensible Baseline number sourced to seller financials.'],
      ['Recast & value', 'P&L recast, SDE normalization, indicative range.'],
      ['Marketing package', 'Teaser, blind profile, CIM, buyer list.'],
      ['Buyer qualification', 'Inquiry response, NDA, financial pre-screen.'],
    ],
    sixMonthsIn: 'Your listings-to-close ratio moved from 20% to 32%. Your average days-on-market dropped by 90 days because the Baseline conversation up front filtered out the listings that were never going to sell. Two of your prior dead listings re-listed at realistic numbers and both closed. You’ve added two new listings to your book this quarter alone — capacity you didn’t have before.',
    pricing: 'Starter $49/month — personal credit card, cancel anytime. 2–5 broker offices use Team at $999 for the shared workspace.',
    footerCta: 'Try Yulia on a listing you’re prepping right now.',
  },

  sponsor: {
    id: 'sponsor', short: 'Sponsor',
    tag: 'INDEPENDENT SPONSORS · FUNDLESS · DEAL-BY-DEAL',
    headline: ['One deal. Fifteen LPs.', 'Fifteen memos.'],
    headlineTail: 'One afternoon.',
    sub: 'You pitch 5–20 LPs per deal. Hit rate is 10–25% on the second meeting. 1–3 commit. 25–33% of exclusive LOIs fail to close — absorbing $150K–$300K of diligence and legal per dead deal. Yulia auto-generates audience-specific IC memos, models R&W and earnout structures, and front-runs the QoE discrepancies that killed 21.3% of 2025 LOIs.',
    chatPh: 'Tell Yulia about the deal you’re raising for…',
    chips: ['Draft IC memo for family office', 'Model rollover equity', 'Build cap table waterfall'],
    stats: [
      ['25–33%', 'exclusive LOIs that fail to close'],
      ['$150–300K', 'absorbed per dead deal'],
      ['10–25%', '2nd-meeting hit rate'],
      ['27%', 'of 2024 Axial closed deals · IS'],
    ],
    sources: 'McGuireWoods 2024 IS Survey · Citrin Cooperman 2024 · Axial 2025',
    upAgainst: 'McGuireWoods 2024: two-thirds to three-quarters of exclusive LOIs close. The 25–33% that die cost $150K–$300K each in diligence and legal. You run 5–10 deals a year. IC memo labor is 40–80 hours per deal × audience variant. Independent sponsors were 27% of Axial closed deals last year — competing against funds with committed capital and a Monday-morning IC.',
    changes: [
      { title: 'Audience-specific IC memos.', body: 'Family-office version, mezz-fund version, institutional-LP version — generated from one deal file. 40–80 hour memo task becomes a 4-hour review cycle. Fifteen LPs in one afternoon.' },
      { title: 'Structure modeling against LP mandates.', body: 'R&W, earnout, rollover, seller financing — pre-tested against each capital partner’s known mandates before pitching. The 10–25% take-a-meeting rate climbs.' },
      { title: 'Blind Equity™ + QoE Lite.', body: 'Front-runs the QoE discrepancies that caused 21.3% of 2025 broken LOIs. Issues caught at gate 10, not at the LP’s $75K outside QoE.' },
      { title: '22-gate methodology + deal scoring.', body: 'Defensible "why now" narrative for family-office LPs demanding institutional-quality diligence. Wins exclusivity battles against committed-capital funds.' },
    ],
    demoTitle: 'Yulia · IC memo · family-office variant',
    demoLines: [
      ['user', 'Draft IC memo for the Acme deal. Audience: family office, mid-cap industrial mandate.'],
      ['yulia', '14-page memo drafted. Lead: 30-yr operating history, $1.0M SDE, 3.5× indicative. Sized for $4–5M check, no leverage, 5-yr hold.'],
      ['yulia', 'Want the mezz-fund and institutional-LP variants generated from the same file?'],
    ],
    arc: [
      ['Source', 'Thesis-driven sourcing.'],
      ['Raise', 'LP pitch, deal memo, audience-specific variants.'],
      ['Structure', 'R&W, earnout, rollover modeled against LP preferences.'],
      ['Close', 'LOI through close with diligence coordination.'],
      ['Operate', 'Post-close portfolio management, investor updates.'],
    ],
    sixMonthsIn: 'You’ve closed two deals you wouldn’t have — one because the family office said yes on the first meeting after seeing a memo built for them specifically, and one because you caught the EBITDA discrepancy in your own diligence before the LP’s QoE provider did. Your LP rolodex is now in the system, with each partner’s mandate criteria tagged. Your next deal cycle starts with structure pre-tested against the four most likely capital partners.',
    pricing: 'Starter $49 during the hunt. Pro $149 for parallel deals. Team $999 when your capital partner expects an associate. Post-close, subscription continues at your current tier with 180 days of PMI included.',
    footerCta: 'Start drafting the capital partner memo for your live deal.',
  },

  banker: {
    id: 'banker', short: 'Banker',
    tag: 'BOUTIQUE SECTOR-IBs · CORPORATE FINANCE · LMM-MM',
    headline: ['The work that used to take', 'an analyst pod.'],
    headlineTail: 'Now it takes Yulia and you.',
    sub: 'You run a 5–25 person sector-focused boutique. Your competition is named — the bigger names with the bigger pods, the bigger overhead, the bigger pitches. You win on judgment and sector depth. Yulia gives you the analyst pod without the analyst pod, so your judgment scales without your overhead.',
    chatPh: 'Describe a mandate you’re pitching or running…',
    chips: ['Draft pitch for Tuesday’s bake-off', 'Build comp set for healthcare services', 'Run buyer universe targeting'],
    stats: [
      ['150–300', 'hrs analyst CIM/model per mandate'],
      ['100–200', 'hrs pitchbook prep per bake-off'],
      ['25–35%', 'boutique bake-off win rate'],
      ['Multi-yr', 'sub-$500M deal volume lows'],
    ],
    sources: 'McKinsey 2024 · SignalFire 2024 · Vendr 2025 · Farsight AI in IB 2024 · PitchBook 2025',
    upAgainst: 'The sector-boutique advantage has always been judgment and depth at lower overhead than the bigger banks. But analyst CIM and model labor still consumes 150–300 hours per mandate. Pitchbook prep before a bake-off runs another 100–200. Bake-off win rate at the boutique tier is 25–35%. Sub-$500M deal volume is at multi-year lows. The boutiques that grow in 2026 will be the ones that don’t add headcount they can’t justify when deal flow recovers.',
    changes: [
      { title: 'Analyst-pod equivalent on subscription.', body: '28 document generators. CIM, pitch deck, model, buyer universe, status reporting. The 200-hour CIM/model build becomes ~40 hours of review-grade work — matching the McKinsey 9-hour → 30-minute compression for standardized investment briefs.' },
      { title: 'Sector-tuned buyer universes.', body: 'Yulia screens against current public filings, recent transactions, and platform-play activity in your sector. Your sector depth is what you bring; Yulia is what makes that depth scalable.' },
      { title: 'MD pitch leverage.', body: 'Self-serve the pitch cycle that currently eats 400 hours/MD/year. Run two more bake-offs per quarter without adding a junior.' },
      { title: 'Deal room with diligence Q&A tracking.', body: 'Document classification, version control, RBAC. Replaces the per-deal-page Datasite cost on smaller mandates where the math doesn’t work.' },
    ],
    demoTitle: 'Yulia · pitchbook draft',
    demoLines: [
      ['user', 'Draft Tuesday’s pitch for the GreenStone bake-off. Healthcare services, $80M revenue, $14M EBITDA.'],
      ['yulia', '32-slide pitchbook drafted. Comp set pulled (8 strategics, 12 financials). Indicative range 9.5×–11× = $133–154M EV.'],
      ['yulia', 'Buyer universe queued — 47 strategics, 89 financial buyers — scored. Want me to run the rank now?'],
    ],
    arc: [
      ['Pitch', 'Pitchbook, comp set, indicative range, methodology defended.'],
      ['CIM', 'Sector-aware analyst output in under an hour, your house style preserved.'],
      ['Buyer universe', 'Public filings + sector-specific platform tracking.'],
      ['Diligence', 'Status across multiple parties generated. Q&A drafted. Data room organized.'],
      ['Close', 'Closing checklist, funds-flow worksheet, earnout schedule.'],
    ],
    sixMonthsIn: 'You ran two more mandates this quarter than capacity would have allowed last year. Your win rate on bake-offs against the bigger banks is up — not because their work is worse but because yours is sharper and faster. The junior you would have hired by now you didn’t. The MD time you would have spent on pitch labor went into client coverage instead. You’re more competitive against the names above you, not less.',
    stackNote: {
      title: 'Where Yulia sits relative to your stack.',
      body: 'Yulia is built for the sector-focused LMM and lower-MM boutique — the firms that compete with the bigger banks on judgment, not on platform scale. If you run a 50+ banker firm with firm-wide DealCloud, custom risk infrastructure, and SOC 2 / SSO requirements, Yulia integrates with your stack but the buying motion is enterprise — talk to us.',
    },
    pricing: 'Pro $149/month for individual bankers — personal credit card, pilot purchase. Team $999 for a 2–10 banker bench standardizing the workflow. Enterprise for firm-wide deployment — contact sales for quote, deployment model, and infrastructure.',
    footerCta: 'Try Yulia on your next bake-off pitch.',
  },

  planner: {
    id: 'planner', short: 'Exit Planner',
    tag: 'CEPAs · WEALTH ADVISORS',
    headline: ['Owner readiness', 'diagnosed in one'],
    headlineTail: 'conversation.',
    sub: '80% of an owner’s net worth sits illiquid in the business. 76% regret the sale within 12 months. Businesses scoring ≥80 on readiness get offers 71% higher than average. Only 32% of owners have a documented exit plan. Yulia surfaces trigger-event owners, generates the readiness report, and quarterbacks the 5–7 specialist handoffs.',
    chatPh: 'Describe a client’s business and we’ll run the readiness scorecard…',
    chips: ['Run owner-readiness scorecard', 'Generate value-gap analysis', 'Build 100-day value creation plan'],
    stats: [
      ['80%', 'owner net worth illiquid in business'],
      ['76%', 'regret sale within 12 mo'],
      ['+71%', 'offers when readiness ≥ 80'],
      ['32%', 'owners with documented plan'],
    ],
    sources: 'EPI 2023–25 State of Owner Readiness · Value Builder · EPI',
    upAgainst: 'EPI 2023: 80% of owner net worth sits in the business. 76% regret the sale within 12 months. Value Builder data: businesses scoring ≥80 receive offers 71% higher than average — implying ~40% discount for unprepared owners. Only 32% of owners have a documented exit plan, so 68% of your natural market is invisible to conventional prospecting.',
    changes: [
      { title: 'Prospect-identification engine.', body: 'Google Places + Census + SBA-data-integrated trigger-event detection. Surfaces age 55+, 10+ year tenure, no valuation, 80%+ illiquid owners.' },
      { title: 'Owner-readiness + value-gap assessment.', body: 'Blind Equity™ and The Baseline™ generate a branded Rundown™ report you hand to the owner in the first retainer conversation.' },
      { title: '28 document generators including the 100-day PMI plan.', body: 'Lets you demonstrate post-sale wealth trajectory in the first retainer conversation.' },
      { title: 'Handoff coordination via deal room.', body: 'Single system to quarterback CPA, M&A attorney, IB, estate planner, insurance, lender. Recovers the 400+ hours a year lost to coordination drag.' },
    ],
    demoTitle: 'Yulia · owner readiness scorecard',
    demoLines: [
      ['user', 'Run readiness on a 64-yr-old owner. Manufacturing, 28-year tenure, no valuation on file.'],
      ['yulia', 'Readiness 47/100. Personal: 38 (heavy reliance, no successor). Financial: 41 (no recast, no peg). Business: 62 (concentrated customers).'],
      ['yulia', 'Value gap: ~$2.4M lift if readiness reaches 80. 18-month plan drafted with milestones for CPA, attorney, IB.'],
    ],
    arc: [
      ['Identify', 'Trigger-event owners surfaced from public data.'],
      ['Diagnose', 'Readiness score + value gap analysis.'],
      ['Plan', 'Multi-year readiness engagement with milestones.'],
      ['Execute', 'Handoff coordination across 5–7 specialists.'],
      ['Post-liquidity', 'AUM recurring revenue, ongoing advisory.'],
    ],
    sixMonthsIn: 'Three new retainer engagements you wouldn’t have had — sourced from the trigger-event prospect list Yulia maintains daily. Your existing roster of owners now has documented readiness scores you can show progress against quarter over quarter. The first owner who hits a value-gap milestone closes 18 months later at a multiple 30%+ higher than where they started — and the AUM that follows the liquidity event is yours, not the M&A advisor’s.',
    pricing: 'Pro $149/month for individual CEPAs and wealth advisors. Team $999 for a 3–10 advisor practice.',
    footerCta: 'Run the readiness scorecard on a client you’ve been circling.',
  },
};

/* ─────────────────── Component ─────────────────── */

export default function JourneyCanvas({ persona, onPersonaChange, onSend }: Props) {
  /* AppShell uses wouter's useLocation, which only tracks pathname —
     not the search string. So `?p=advisor` URL updates won't trigger
     AppShell to re-render with a new persona prop. Solution: own
     active persona state locally, sync from the prop on mount + when
     it genuinely changes (deep-link, browser back), and on click both
     update local state immediately AND notify the parent for the URL
     update. The UI never depends on the parent re-rendering. */
  const [active, setActive] = useState<PersonaId>(persona);
  useEffect(() => {
    setActive(persona);
  }, [persona]);

  const handleChange = useCallback(
    (next: PersonaId) => {
      setActive(next);
      onPersonaChange(next);
    },
    [onPersonaChange],
  );

  const t = DATA[active] ?? DATA.searcher;

  return (
    <div
      className="smbx-edition v23c"
      style={{
        background: 'var(--canvas-warm)',
        color: 'var(--ink-primary)',
        fontFamily: 'var(--font-body)',
        minHeight: '100%',
      }}
    >
      <PageStyles />
      <div
        className="canvas-card"
        style={{
          position: 'relative',
          background: 'var(--canvas-paper)',
          borderRadius: 12,
          margin: '8px 16px 32px 0',
          boxShadow: [
            'inset 0 1px 0 rgba(255, 255, 255, 0.65)',
            '0 1px 0 rgba(26, 24, 20, 0.04)',
            '0 6px 14px rgba(26, 24, 20, 0.05)',
            '0 16px 36px rgba(26, 24, 20, 0.08)',
            '0 36px 60px -16px rgba(26, 24, 20, 0.14)',
            '0 56px 96px -28px rgba(26, 24, 20, 0.10)',
          ].join(', '),
        }}
      >
        <PersonaTabBar active={active} onChange={handleChange} />
        <Hero t={t} onSend={onSend} />
        <UpAgainst t={t} />
        <HowChanges t={t} />
        <Arc t={t} />
        <SixMonthsIn t={t} />
        <PricingPointer t={t} />
        <FinalCTA t={t} onSend={onSend} />
        <SiteFooter />
      </div>
    </div>
  );
}

/* ─────────────────── Page styles ─────────────────── */
function PageStyles() {
  return (
    <style>{`
      .v23c .cta-primary {
        transition: background 200ms cubic-bezier(0.23, 1, 0.32, 1),
                    transform 120ms cubic-bezier(0.23, 1, 0.32, 1),
                    box-shadow 200ms cubic-bezier(0.23, 1, 0.32, 1);
      }
      .v23c .cta-primary:hover { background: var(--terra-hover); box-shadow: 0 14px 30px rgba(212, 113, 78, 0.24); }
      .v23c .cta-primary:active { transform: scale(0.97); }
      .v23c .cta-secondary {
        transition: border-color 200ms cubic-bezier(0.23, 1, 0.32, 1),
                    background 200ms cubic-bezier(0.23, 1, 0.32, 1),
                    transform 120ms cubic-bezier(0.23, 1, 0.32, 1);
      }
      .v23c .cta-secondary:hover { border-color: var(--ink-primary); background: var(--canvas-cream); }
      .v23c .cta-secondary:active { transform: scale(0.97); }
      .v23c .persona-pill {
        transition: background 220ms cubic-bezier(0.23, 1, 0.32, 1),
                    color 220ms cubic-bezier(0.23, 1, 0.32, 1),
                    border-color 220ms cubic-bezier(0.23, 1, 0.32, 1);
      }
      .v23c .persona-pill:not(.is-active):hover {
        background: var(--canvas-cream);
        border-color: var(--ink-primary);
      }
      .v23c .chip {
        transition: background 200ms cubic-bezier(0.23, 1, 0.32, 1),
                    border-color 200ms cubic-bezier(0.23, 1, 0.32, 1),
                    color 200ms cubic-bezier(0.23, 1, 0.32, 1);
      }
      .v23c .chip:hover {
        background: var(--canvas-cream);
        border-color: var(--ink-primary);
        color: var(--ink-primary);
      }
      .v23c .change-row {
        display: grid;
        grid-template-columns: 80px minmax(0, 1fr) minmax(0, 2fr);
        gap: 32px;
        padding: 32px 0;
        border-bottom: 1px solid var(--rule);
        align-items: baseline;
      }
      .v23c .arc-grid {
        display: grid;
        gap: 0;
      }
      @media (max-width: 1023px) {
        .v23c .hero-split { grid-template-columns: 1fr !important; gap: 36px !important; }
        .v23c .upagainst-split { grid-template-columns: 1fr !important; gap: 36px !important; }
        .v23c .change-row { grid-template-columns: 60px minmax(0, 1fr) !important; }
        .v23c .change-row > p { grid-column: 1 / -1; padding-top: 4px; }
        .v23c .stats-grid { grid-template-columns: 1fr 1fr !important; }
        .v23c .arc-grid { grid-template-columns: 1fr 1fr !important; }
        .v23c .arc-grid > div { border-right: none !important; border-bottom: 1px solid var(--rule); }
        .v23c .arc-grid > div:nth-child(odd) { border-right: 1px solid var(--rule) !important; }
      }
      @media (max-width: 639px) {
        .v23c .stats-grid { grid-template-columns: 1fr !important; }
        .v23c .change-row { grid-template-columns: 1fr !important; gap: 12px !important; padding: 28px 0 !important; }
        .v23c .change-row > span { font-size: 32px !important; }
        .v23c .arc-grid { grid-template-columns: 1fr !important; }
        .v23c .arc-grid > div { border-right: none !important; border-bottom: 1px solid var(--rule); }
        .v23c .arc-grid > div:last-child { border-bottom: none; }
      }
    `}</style>
  );
}

/* ─────────────────── Persona tab bar ─────────────────── */
function PersonaTabBar({ active, onChange }: { active: PersonaId; onChange: (p: PersonaId) => void }) {
  return (
    <div
      role="tablist"
      aria-label="Persona"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'rgba(255, 252, 247, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--rule)',
        padding: '14px 28px',
        display: 'flex',
        gap: 6,
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
      }}
    >
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={`persona-pill${isActive ? ' is-active' : ''}`}
            style={{
              all: 'unset',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontWeight: isActive ? 600 : 500,
              fontSize: 13.5,
              letterSpacing: '-0.005em',
              color: isActive ? 'var(--canvas-paper)' : 'var(--ink-secondary)',
              background: isActive ? 'var(--ink-primary)' : 'transparent',
              border: `1px solid ${isActive ? 'var(--ink-primary)' : 'var(--rule)'}`,
              padding: '10px 16px',
              minHeight: 36,
              borderRadius: 999,
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {isActive && (
              <span
                aria-hidden
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--terra)',
                }}
              />
            )}
            {tab.short}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────── 1. Hero ─────────────────── */
function Hero({ t, onSend }: { t: PersonaContent; onSend: (msg: string) => void }) {
  return (
    <section style={{ padding: `96px ${SECTION_PAD} 72px` }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={eyebrowStyle()}>{t.tag}</div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(40px, 5.4vw, 72px)',
            lineHeight: 1.02,
            letterSpacing: '-0.034em',
            margin: 0,
            color: 'var(--ink-primary)',
            textWrap: 'balance',
            maxWidth: 1100,
          }}
        >
          {t.headline[0]}
          <br />
          {t.headline[1]}
          <br />
          <span
            style={{
              fontFamily: 'var(--font-editorial)',
              fontStyle: 'italic',
              fontWeight: 400,
              color: 'var(--ink-secondary)',
            }}
          >
            {t.headlineTail}
          </span>
        </h1>

        <div
          className="hero-split"
          style={{
            marginTop: 48,
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr)',
            gap: 56,
            alignItems: 'start',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(16px, 1.4vw, 19px)',
              lineHeight: 1.6,
              color: 'var(--ink-secondary)',
              margin: 0,
              textWrap: 'pretty',
              maxWidth: 700,
            }}
          >
            {t.sub}
          </p>

          <div
            style={{
              background: 'var(--canvas-cream)',
              border: '1px solid var(--rule)',
              borderRadius: 12,
              padding: '20px 22px',
            }}
          >
            <div style={{ ...eyebrowStyle(), marginBottom: 14 }}>Try it now</div>
            <button
              type="button"
              onClick={() => onSend(t.chatPh.replace(/…$/, ''))}
              style={{
                all: 'unset',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '14px 16px',
                background: 'var(--canvas-paper)',
                borderRadius: 8,
                border: '1px solid var(--rule)',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                color: 'var(--ink-tertiary)',
                marginBottom: 14,
              }}
            >
              <span style={{ flex: 1 }}>{t.chatPh}</span>
              <span
                aria-hidden
                style={{
                  width: 1.5,
                  height: 16,
                  background: 'var(--terra)',
                  animation: 'smbx-type-cursor 1s steps(2) infinite',
                }}
              />
            </button>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {t.chips.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onSend(c)}
                  className="chip"
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                    padding: '6px 12px',
                    borderRadius: 999,
                    background: 'var(--canvas-paper)',
                    border: '1px solid var(--rule)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 12,
                    color: 'var(--ink-secondary)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── 2. Up against ─────────────────── */
function UpAgainst({ t }: { t: PersonaContent }) {
  return (
    <section
      style={{
        padding: `88px ${SECTION_PAD}`,
        background: 'var(--canvas-cream)',
        borderTop: '1px solid var(--rule)',
        borderBottom: '1px solid var(--rule)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
          className="upagainst-split"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)',
            gap: 56,
            alignItems: 'start',
          }}
        >
          <div>
            <div style={eyebrowStyle()}>What you’re up against</div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 'clamp(32px, 3.6vw, 48px)',
                lineHeight: 1.06,
                letterSpacing: '-0.028em',
                margin: '0 0 24px',
                color: 'var(--ink-primary)',
                textWrap: 'balance',
              }}
            >
              The math you’re swimming against.
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.06em',
                color: 'var(--ink-tertiary)',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Source: {t.sources}
            </p>
          </div>

          <div>
            <div
              className="stats-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                marginBottom: 28,
                borderTop: '1px solid var(--ink-primary)',
                borderBottom: '1px solid var(--rule)',
              }}
            >
              {t.stats.map(([n, l], i) => (
                <div
                  key={`${n}-${l}`}
                  style={{
                    padding: '22px 22px',
                    borderRight: i % 2 === 0 ? '1px solid var(--rule)' : 'none',
                    borderBottom: i < 2 ? '1px solid var(--rule)' : 'none',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      fontSize: 36,
                      letterSpacing: '-0.028em',
                      lineHeight: 1,
                      marginBottom: 10,
                      color: 'var(--ink-primary)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {n}
                  </div>
                  <div style={{ ...eyebrowStyle(), color: 'var(--ink-tertiary)' }}>{l}</div>
                </div>
              ))}
            </div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 16,
                lineHeight: 1.6,
                color: 'var(--ink-secondary)',
                margin: 0,
              }}
            >
              {t.upAgainst}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── 3. How Yulia changes that ─────────────────── */
function HowChanges({ t }: { t: PersonaContent }) {
  return (
    <section style={{ padding: `96px ${SECTION_PAD}` }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={eyebrowStyle()}>How Yulia changes that</div>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(36px, 4.2vw, 56px)',
            lineHeight: 1.04,
            letterSpacing: '-0.028em',
            margin: '0 0 48px',
            color: 'var(--ink-primary)',
            textWrap: 'balance',
            maxWidth: 900,
          }}
        >
          Four moves that change the math<span style={{ color: 'var(--terra)' }}>.</span>
        </h2>
        <div style={{ borderTop: '1px solid var(--rule)' }}>
          {t.changes.map((c, i) => (
            <div key={c.title} className="change-row">
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 48,
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                  color: 'var(--ink-primary)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 'clamp(20px, 1.9vw, 24px)',
                  lineHeight: 1.2,
                  letterSpacing: '-0.012em',
                  margin: 0,
                  color: 'var(--ink-primary)',
                  textWrap: 'balance',
                }}
              >
                {c.title}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 15.5,
                  lineHeight: 1.6,
                  margin: 0,
                  color: 'var(--ink-secondary)',
                }}
              >
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── 4. The arc ─────────────────── */
function Arc({ t }: { t: PersonaContent }) {
  return (
    <section
      style={{
        padding: `96px ${SECTION_PAD}`,
        background: 'var(--canvas-cream)',
        borderTop: '1px solid var(--rule)',
        borderBottom: '1px solid var(--rule)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={eyebrowStyle()}>The arc</div>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(36px, 4.2vw, 56px)',
            lineHeight: 1.04,
            letterSpacing: '-0.028em',
            margin: '0 0 48px',
            color: 'var(--ink-primary)',
            textWrap: 'balance',
            maxWidth: 900,
          }}
        >
          The whole engagement, start to finish.
        </h2>
        <div
          className="arc-grid"
          style={{
            gridTemplateColumns: `repeat(${t.arc.length}, minmax(0, 1fr))`,
            border: '1px solid var(--rule)',
            background: 'var(--canvas-paper)',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          {t.arc.map(([n, d], i) => (
            <div
              key={n}
              style={{
                padding: '24px 22px',
                borderRight: i < t.arc.length - 1 ? '1px solid var(--rule)' : 'none',
                background: 'var(--canvas-paper)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span
                  aria-hidden
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: 'var(--terra)',
                  }}
                />
                <div style={{ ...eyebrowStyle(), color: 'var(--ink-tertiary)' }}>
                  Stage {String(i + 1).padStart(2, '0')}
                </div>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 22,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                  marginBottom: 10,
                  color: 'var(--ink-primary)',
                  textWrap: 'balance',
                }}
              >
                {n}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  color: 'var(--ink-secondary)',
                }}
              >
                {d}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── 5. Six months in ─────────────────── */
function SixMonthsIn({ t }: { t: PersonaContent }) {
  return (
    <section style={{ padding: `120px ${SECTION_PAD}` }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ ...eyebrowStyle(), marginBottom: 28 }}>Six months in</div>
        <p
          style={{
            fontFamily: 'var(--font-editorial)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(24px, 2.8vw, 36px)',
            lineHeight: 1.32,
            letterSpacing: '-0.012em',
            margin: 0,
            color: 'var(--ink-primary)',
            textWrap: 'pretty',
          }}
        >
          {t.sixMonthsIn}
        </p>

        {t.stackNote && (
          <div style={{ marginTop: 56, paddingTop: 24, borderTop: '1px solid var(--rule)' }}>
            <div style={{ ...eyebrowStyle(), marginBottom: 12 }}>{t.stackNote.title}</div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 15,
                lineHeight: 1.6,
                color: 'var(--ink-secondary)',
                margin: 0,
                maxWidth: 760,
              }}
            >
              {t.stackNote.body}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/* ─────────────────── 6. Pricing pointer ─────────────────── */
function PricingPointer({ t }: { t: PersonaContent }) {
  return (
    <section style={{ padding: `48px ${SECTION_PAD} 64px` }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 28,
            paddingBottom: 24,
            borderBottom: '1px solid var(--rule)',
            flexWrap: 'wrap',
          }}
        >
          <div style={eyebrowStyle()}>Pricing</div>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 15.5,
              lineHeight: 1.6,
              margin: 0,
              color: 'var(--ink-secondary)',
              flex: '1 1 320px',
            }}
          >
            {t.pricing}
          </p>
          <a
            href="/pricing"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--ink-primary)',
              textDecoration: 'none',
              borderBottom: '1px solid currentColor',
              paddingBottom: 2,
            }}
          >
            See all tiers →
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── 7. Final CTA ─────────────────── */
function FinalCTA({ t, onSend }: { t: PersonaContent; onSend: (msg: string) => void }) {
  return (
    <section
      style={{
        padding: `144px ${SECTION_PAD} 160px`,
        background: 'var(--canvas-paper)',
        textAlign: 'center',
        borderTop: '1px solid var(--rule)',
      }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ ...eyebrowStyle(), marginBottom: 22 }}>The invitation</div>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(40px, 4.8vw, 64px)',
            lineHeight: 1.04,
            letterSpacing: '-0.028em',
            margin: 0,
            color: 'var(--ink-primary)',
            textWrap: 'balance',
          }}
        >
          {t.footerCta.replace(/Yulia/, '__YULIA__').split('__YULIA__').map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <span
                  style={{
                    fontFamily: 'var(--font-editorial)',
                    fontStyle: 'italic',
                    fontWeight: 400,
                    color: 'var(--terra)',
                  }}
                >
                  Yulia
                </span>
              )}
            </span>
          ))}
        </h2>
        <div style={{ display: 'inline-flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 32 }}>
          <button
            type="button"
            className="cta-primary"
            onClick={() => onSend(t.chatPh.replace(/…$/, ''))}
            style={primaryCta()}
          >
            Talk to Yulia
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <a
            href="/how-it-works"
            className="cta-secondary"
            style={{ ...secondaryCta(), textDecoration: 'none' }}
          >
            See how it works <span style={{ color: 'var(--terra)' }}>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── Site footer ─────────────────── */
function SiteFooter() {
  const columns: { heading: string; links: string[] }[] = [
    { heading: 'Product',   links: ['Yulia', 'Pricing', 'Changelog', 'Status'] },
    { heading: 'Resources', links: ['How it works', 'Field guide', 'API docs', 'Help center'] },
    { heading: 'Solutions', links: ['For searchers', 'For advisors', 'For brokers', 'For sponsors', 'For bankers', 'For planners'] },
    { heading: 'Company',   links: ['About', 'Press', 'Careers', 'Contact'] },
    { heading: 'Terms',     links: ['Privacy', 'Terms of service', 'Security', 'Compliance'] },
  ];
  return (
    <footer style={{ padding: `80px ${SECTION_PAD} 56px`, background: 'var(--canvas-warm)', borderTop: '1px solid var(--rule)' }}>
      <div
        className="footer-grid"
        style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(5, 1fr)', gap: 40, marginBottom: 56 }}
      >
        <style>{`
          @media (max-width: 1023px) { .footer-grid { grid-template-columns: 1fr 1fr !important; } }
          @media (max-width: 639px)  { .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; } }
        `}</style>
        <div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.04em', color: 'var(--ink-primary)' }}>
            smbx<span style={{ color: 'var(--terra)' }}>.</span>ai
          </span>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-tertiary)', margin: '12px 0 0', maxWidth: 280 }}>
            The AI deal team for people who do deals — drafts the documents, models the structures, scores the buyers.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.heading}>
            <div style={{ ...eyebrowStyle(), marginBottom: 14, fontSize: 10 }}>{col.heading}</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {col.links.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 13.5,
                      color: 'var(--ink-secondary)',
                      textDecoration: 'none',
                      transition: 'color 200ms cubic-bezier(0.23, 1, 0.32, 1)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ink-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-secondary)'; }}
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div
        style={{
          paddingTop: 28,
          borderTop: '1px solid var(--rule)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-tertiary)' }}>
          © 2026 smbx.ai · All rights reserved
        </span>
        <div style={{ display: 'flex', gap: 18 }}>
          {['LinkedIn', 'X', 'YouTube'].map((s) => (
            <a
              key={s}
              href="#"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--ink-secondary)',
                textDecoration: 'none',
                transition: 'color 200ms cubic-bezier(0.23, 1, 0.32, 1)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--terra)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-secondary)'; }}
            >
              {s}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────── Shared styles ─────────────────── */
function eyebrowStyle(): CSSProperties {
  return {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'var(--ink-tertiary)',
    marginBottom: 14,
  };
}

function primaryCta(): CSSProperties {
  return {
    all: 'unset',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    fontSize: 16,
    color: 'var(--canvas-paper)',
    background: 'var(--terra)',
    padding: '14px 26px',
    borderRadius: 999,
    boxShadow: '0 8px 22px rgba(212, 113, 78, 0.22)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
  };
}

function secondaryCta(): CSSProperties {
  return {
    all: 'unset',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    fontSize: 16,
    color: 'var(--ink-primary)',
    padding: '13px 22px',
    borderRadius: 999,
    border: '1px solid var(--rule)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  };
}
