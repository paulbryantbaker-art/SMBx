/**
 * smbX corp-dev offering sheet — the two products, and the why underneath them.
 *
 * THE MESSAGE, in one line: smbX is a corporate development function you engage
 * for the deal — smbX Core runs it to close, smbX Premium carries it
 *
 * RENAMED 2026-08-19 (Paul): smbXCorpDev -> smbX Core, smbXCorpDev Premium ->
 * smbX Premium. The old names still appear in the LIVE SITE
 * (client/src/practice/Landing.tsx), server/index.ts, house/assets.ts and the
 * root CLAUDE.md product-naming section — all Claude Code's side of ONE
 * CLONE, all flagged rather than edited from here.
 * through the first hundred days.
 *
 * Paul, 2026-08-04, supplied the hook and the tag verbatim from the practice's
 * own hero: "Buying a Business is Hard Work. We Make it Easier." / "Whether your
 * 1st or your 100th acquisition, we run the process for you, freeing up your
 * time and resources." Both carry across from
 * `specs/smbx-open-for-business.post.mts` — this deck is the same argument with
 * the products named.
 *
 * "3 page carousel" is read as THREE CONTENT BEATS. FORMATS.md §1 auto-adds the
 * cover and closer as the two bookends, so three body pages renders as five —
 * why · smbX Core · smbX Premium. Cutting to one body page to hit a
 * literal three would put both products on the same page, which is the opposite
 * of "diving deeper into each service".
 *
 * EVERY FIGURE HERE IS IN `PRACTICE_RECORD.md`. 150 acquisitions, $5B+ enterprise
 * value added (corrected from "revenue" 2026-08-06 — see the note in the record), ≈$21B transaction value touched, 0 sell-side transactions ever, the
 * $250M ceiling. Check it with:
 *   verify-spec.mts specs/smbx-corpdev-offering.deck.mts --against PRACTICE_RECORD.md
 *
 * NO PRICING ON THIS VARIANT — AN EDITORIAL CHOICE, NO LONGER A RULE. The old
 * comment here cited "No fee talk on any public surface", which Paul RETIRED on
 * 2026-08-05. Publishing the schedule is now allowed and
 * `smbx-corpdev-offering-pricing.deck.mts` does exactly that. This variant stays
 * clean because a cold LinkedIn audience is being sold the IDEA, and a price on
 * slide 1 answers a question they have not asked yet — not because the perimeter
 * forbids it. If that judgement changes, change it; no policy is in the way.
 *
 * The pivot underneath: smbX was once an APP licensed to brokers and bankers, on
 * a membership fee, collecting no success fee. That business is scrapped. smbX
 * now runs corp dev itself and earns a success fee, which is why the old rule
 * stopped describing anything real. THE_LINE_POLICY.md says the same thing from
 * the other side — v1 was "written to make a software product a regulatory safe
 * harbor" — and its v2 §Permitted already allows both the buy-side retainer and
 * the buy-side success fee. PLAYBOOK's fee bullet was the last stale copy and
 * was amended 2026-08-06. `PRACTICE_RECORD.md` §The perimeter carries the full
 * note, including the warning that other pre-pivot copy may still be describing
 * the app rather than the practice.
 *
 * ON THE "WHY" PAGE AND COMPETITORS. PLAYBOOK's THE LINE: "Never criticize a
 * named competitor, bank, or advisor." Page 2 therefore names three structural
 * realities of how buying gets resourced — a standing team, an advisory firm,
 * doing it yourself — and indicts none of them. Frame B's cardinal rule, applied
 * one step out: name the reality of the work, never the reader and never a rival.
 *
 * TEXT-ONLY TRADE PAGES, deliberately. `trade` is the only body kind with an
 * image slot and `tradewrap.noimg` is a real format, not a degraded one. Nothing
 * in `assets/` depicts corporate development — the library is trade
 * illustrations, MEP photography and one tree. A wrong picture is worse than
 * none. The imagery brief for two proper panels is the obvious next step.
 */
const CAPTION = [
  'Buying a business is hard work. We make it easier.',
  '',
  'Two ways to work with smbX, and one idea underneath both of them.',
  '',
  'Most buyers in the lower middle market have three options for getting a deal done.',
  '',
  '• A standing corp-dev team — $500,000 to $1,500,000 a year all-in, attached to an activity that only happens occasionally, and idle in between.',
  '• An advisory firm — real capacity, brought to several clients at once.',
  '• Doing it yourself — no fees, and no bandwidth, against someone who does this every week.',
  '',
  'smbX is a fourth: a corporate development function you engage for the deal.',
  '',
  '→ smbX Core runs it end to end. Thesis, market sized from primary sources, off-market outreach, diligence, negotiation, close. Then it scales to zero.',
  '',
  '→ smbX Premium carries the same team past signing into the first hundred days. A deal is not finished when it closes. It is finished when the thing you underwrote is actually running.',
  '',
  'One buyer per target. Never the sell side. Never two-sided. It is in the engagement letter.',
  '',
  'About 150 acquisitions behind it, and zero sell-side transactions. Ever.',
  '',
  'If you are buying in the lower middle market this year — are you resourcing it with a team, a firm, or your own evenings? Curious what people are actually doing. 👇',
  '',
  '#MergersAndAcquisitions #CorporateDevelopment #PrivateEquity #LowerMiddleMarket',
].join('\n');

export const deck = {
  slug: 'smbx-corpdev-offering',
  kicker: 'CORPORATE DEVELOPMENT',

  /* Cover mode 1b — editorial. NOT 1a, and the reason is the spec's own rule:
     "every hero number carries its comparison." 150 acquisitions has no
     honest baseline to sit beside it, so the hero-figure mode is the wrong
     one here and COVER-CTA-SPEC.md §7 names 1b as the documented fallback.
     The three figures move off the hero and onto the ruled row, where they
     support the claim instead of competing with it. */
  cover: {
    style: '1b',
    /* Upper-right positioning line (Paul, 2026-08-19) — the slot the logo
       vacated when it moved to the lower-left signature. Names the ICP on
       the artifact itself. */
    audience: 'Outsourced Corporate Development\nfor Private Equity and Family Offices',
    claim: 'Buying a business is hard work. We make it easier.',
    promise: 'Whether it’s your 1st or your 100th acquisition, we run the process for you — thesis, sourcing, diligence, close.',
    figures: [
      { value: '150', label: 'Acquisitions' },
      { value: '$5B+', label: 'Enterprise value added' },
      { value: '0', label: 'Sell-side deals. Ever.' },
    ],
    /* No cover image. Spec option 1a: the portrait is the 92px identity disc
       in the bottom strip, not a competing element in the hero. The bottom
       BAND would need a landscape frame, and neither founder photograph is
       one — see the note in house/deck.ts. */
  },

  pages: [
    /* ── PHONE-FIRST REWRITE 2026-08-19 (Paul: "none of this text is going
       to be legible... think of it as mobile"). The arithmetic: LinkedIn
       renders 1080px at ~360px on a phone — divide every size by 3. The
       site's own floor is 13px customer-facing, so the carousel floor is
       ~40px ON CANVAS for reading text, and a page carries ONE idea in
       ≤45 words. Heads stay verbatim site voice; bodies are the site's key
       clauses, cut to phone length. */
    {
      kind: 'statement',
      tag: 'THE PROBLEM',
      head: 'Corp dev in-house: **$500K–$1.5M a year.**',
      body: 'All-in, and it does not scale down between deals. The function is idle. The cost is not.',
      source: 'Buy-side only, under $250M revenue — THE LINE.',
    },
    {
      kind: 'statement',
      tag: 'THE MODEL',
      head: 'Engage the function for the deal.',
      body: 'The whole buy-side function, one senior operator, run in your name. Then it scales to zero.',
      bullets: [
        '**smbX Core** — thesis to close.',
        '**smbX Premium** — Core, then ownership.',
      ],
      source: 'One buyer per target. Never the sell side.',
    },
    {
      kind: 'statement',
      tag: '01–02 · FIND',
      head: 'We find the owners who aren’t looking to sell.',
      body: 'Thesis first: what to buy, and whether it is buyable today. Then the market mapped, and reached quietly — under your name.',
      source: 'smbX Core · thesis + sourcing.',
    },
    {
      kind: 'statement',
      tag: '03–04 · DECIDE',
      head: 'What it’s really worth — and whether to walk.',
      body: 'Financials rebuilt. Add-backs tested. Then the offer: seller notes, earnouts, rollover — terms a lender will actually back.',
      source: 'smbX Core · valuation + structure.',
    },
    {
      kind: 'statement',
      tag: '05 · CLOSE',
      head: 'Where most deals come apart. Our heaviest work.',
      body: 'Diligence across financials, legal, tax and operations — every thread held together to a signed deal.',
      source: 'smbX Core · diligence & close.',
    },
    {
      kind: 'statement',
      tag: '06–07 · OWN',
      head: 'The price is set at close. The value comes after.',
      body: 'The first hundred days, planned before close. Then the levers, and the add-ons that turn one deal into a platform.',
      source: 'smbX Premium — scoped to the deal.',
    },
  ],

  closer: {
    tag: 'FOR THE ACQUIRER',
    head: 'Pick the engagement. We’ll bring the function.',
    /* TWO PLATES, not two rows (2026-08-19, Paul: "The CTA page is also super
       boring"). A closer asking the reader to CHOOSE should show the choice
       as two objects side by side with what each covers, so the decision is
       visible at a glance rather than read as a list. */
    cards: [
      { name: 'smbX Core', phases: 'PHASES 01–05',
        note: 'Thesis to close. Then it scales to zero.' },
      { name: 'smbX Premium', phases: 'PHASES 01–07',
        note: 'Core, then the first hundred days and beyond.' },
    ],
    line: 'One senior operator, on your side of the table.',
    action: 'Book a call — smbx.ai',
    proof: '150 acquisitions. $5B+ enterprise value added. Zero sell-side deals. Ever.',
  },

  caption: CAPTION,
};
