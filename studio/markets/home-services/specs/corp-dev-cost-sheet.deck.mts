/**
 * What a corp dev function actually costs — P-7, Thu 10 Sept 2026.
 *
 * THE MESSAGE, in one line: the function is expensive whether or not it works,
 * so the real question is not "spend less" but where the next dollar of a
 * team's finite attention produces a return.
 *
 * ── v1, 2026-08-18 ─────────────────────────────────────────────────────────
 * Built from `content/studio/CAMPAIGN_2026-08-18.md` §3 · P-7, the content of
 * record for `campaign-2026-08-18.json`. Copy transposed into slots; no figure
 * added, none rounded.
 *
 * THE CONSTRAINT CHECK ON THIS POST IS THE TIGHTEST IN THE WINDOW, and the
 * campaign states it in three clauses: THEIR cost structure, never OUR price,
 * never THE COMPARISON. That rules out more than it first appears to. It rules
 * out the fee schedule, obviously — no figure from it appears on any site
 * surface and none appears here. But it also rules out the move this deck is
 * structurally begging for, which is to total the cost sheet and then set the
 * total beside what an outsourced alternative costs. Page 9 is where that
 * comparison would go and page 9 is deliberately an ALLOCATION question
 * instead: where does the next dollar of attention produce a return. The
 * restraint is the post. A reader who does the comparison themselves has
 * arrived somewhere; a reader who is walked to it has been sold to.
 *
 * PAGE 4 IS THE CREDIBILITY PAGE AND IT CONTAINS NO NUMBER. Time from a new
 * BD hire to their first sourced close is not published anywhere. Under
 * POST_QUEUE.md law 1 that is THIN, and THIN means an argument rather than a
 * claim — so the page names the gap and says that anyone quoting a confident
 * figure is inferring. In a deck where every other page carries a figure, the
 * one that refuses to is the page that makes the others believable. It is not
 * the page to cut for room.
 *
 * EVERY SOURCE ON THIS SHEET IS SELLING SOMETHING and each page says which.
 * Heidrick & Struggles is a recruiter publishing compensation data — robust
 * numbers serve recruiters. The data vendors publish list pricing that is
 * always negotiated down. Sutton Place Strategies is owned by With
 * Intelligence and Bain and sells origination analytics, so a large coverage
 * gap is a finding that serves SPS directly; it is also the only longitudinal
 * series in existence, which is why it is used rather than avoided.
 *
 * WHAT IS DELIBERATELY NOT HERE, and why.
 *
 *   1. NO FEE TALK, NO RETAINER, NO SUCCESS FEE, NO SMBX PRICE. THE LINE, and
 *      the site itself carries no public figure either.
 *   2. NO OUTSOURCED-ALTERNATIVE COMPARISON. See above — this is the whole
 *      constraint check.
 *   3. NO INVENTED BENCHMARK ON PAGE 6. The $60–200K per sourced close is
 *      arithmetic on the ranges stated earlier in the same deck, it is
 *      LABELLED illustrative on the page, and the reader is told to redo it
 *      with their own numbers. A derived figure presented as a published one
 *      is the failure mode the citation audit exists to catch, and a carousel
 *      has no Derivations section to register it in — so the page does the
 *      registering in prose.
 *   4. NO IMAGE. Same reason as the two sibling decks in this window: every
 *      asset in `markets/home-services/media/` fails `carta-guard`'s ground
 *      check. A cost sheet is also the least illustrable thing in the
 *      calendar; there is no honest photograph of an overhead line item.
 *
 * THE 30% HEADCOUNT FIGURE ON PAGE 8 IS FROM 2021 and the page says so in its
 * own copy rather than only on the source line. A dated figure carried
 * silently is a figure the reader cannot grade.
 */
export const deck = {
  slug: 'corp-dev-cost-sheet',
  kicker: 'THE COST SHEET',
  cover: {
    hook: 'What it actually costs to run an add-on program.',
    sub: 'Line by line — with every source’s commercial interest named on the page it appears on, because most of these numbers come from somebody selling something.',
    /* Cited on pages of this deck: the numeral on page 5, the stats on pages
       2, 3 and 7. */
    numeral: '17.6', unit: '%',
    numeralLabel: 'of relevant deal flow seen by\nthe median private equity firm',
    stats: [
      { value: '$150–250K', label: 'a dedicated BD professional, before carry' },
      { value: '$100K+', label: 'a year in stacked data subscriptions' },
      { value: '$25–50K', label: 'of QoE per busted exclusivity' },
    ],
  },
  pages: [
    { kind: 'statement', tag: 'THE PERSON', head: 'A dedicated BD professional runs $150–250K in total compensation.',
      body: 'And about 90% of heads of business development receive carried interest on top of it, so the cash line understates the real cost of the seat by a margin that only becomes visible at exit. The compensation figures are published by an executive search firm — recruiters benefit when the numbers look robust, which is worth holding in mind before treating the top of that range as a market rate. It is still the most systematic survey of the role that gets published.',
      source: 'Heidrick & Struggles 2025 PE compensation survey; Capstone' },

    { kind: 'statement', tag: 'THE TOOLS', head: 'The data stack routinely clears $100K a year before the CRM.',
      body: 'PitchBook runs roughly $12–40K and upward per user. Grata or Sourcescrub, another $15–40K. Capital IQ or FactSet, $20–100K and up. Firms stack these because no single one covers the whole market, and the overlap is the point rather than the waste — but it means the true number is additive and the subscriptions renew whether or not anybody closed anything. All of the above is vendor list pricing, all of it is negotiable, and all of it is real money leaving every year.',
      source: 'Vendor list pricing, 2025–26' },

    { kind: 'statement', tag: 'THE RAMP', head: 'How long until a new BD hire’s first sourced close? Nobody publishes it.',
      body: 'In search-fund data the first LOI lands around month seven, which is the closest available proxy and is not the same measurement. For the thing actually being budgeted — a new business-development hire to their first close that they themselves sourced — no clean published statistic exists. That gap is worth knowing by name, because anyone quoting you a confident figure for it is inferring, exactly as we would be. This is the page where the sheet says what it does not know.',
      source: 'Search-fund literature for the proxy; no series located for the measure' },

    { kind: 'numeral', numeral: '17.6%',
      head: 'of the relevant deal flow is seen by the median private equity firm, in its own space.',
      body: 'That is the coverage all of the spending above buys. The publisher is owned by With Intelligence and Bain and sells origination analytics for a living, so a large and persistent coverage gap is a finding that directly serves the firm reporting it — state that plainly and keep the number, because it is also the only longitudinal series anyone has built. What it tells you is not that the median firm is bad at its job. It is that comprehensive coverage of a fragmented market is not what a small team can buy at any price.',
      source: 'Sutton Place Strategies' },

    { kind: 'statement', tag: 'THE MATH · ILLUSTRATIVE', head: 'Somewhere between $60K and $200K per sourced close.',
      body: 'This is arithmetic on the ranges already on this sheet, and it is not a published benchmark — nobody publishes one. Take a fully loaded function at $250–400K all in, divide by two to four sourced closes a year, and that is the band you land in, before a single dead-deal cost is counted. Redo it with your own compensation, your own stack and your own closed count; the numbers will move and the shape will not. Anyone presenting a figure like this as an industry benchmark has quietly turned their own division into somebody else’s data.',
      source: 'smbX arithmetic on the ranges above — illustrative, not a benchmark' },

    { kind: 'numeral', numeral: '47%',
      head: 'of post-LOI breaks now come from diligence findings — and each one has a bill.',
      body: 'Quality of earnings at lower-middle-market sizes runs $25–50K per busted exclusivity, with legal on top of it. The break data is member-reported through a marketplace that sells access to the channel it measures, and the QoE pricing comes from the firms selling QoE, so both carry their interest. The budgeting point survives either caveat: dead deals are not an accident in this function, they are a recurring line item with a predictable frequency, and a program budgeted as though every process closes is a program budgeted wrong.',
      source: 'Axial Dead Deal Report, member-reported, 2025' },

    { kind: 'numeral', numeral: '30%',
      head: 'of private equity firms had no dedicated BD professional at all.',
      body: 'That is as of the last public count, taken in 2021 — dated, and it is the most recent figure that exists, which is itself informative about how thinly this function is studied. Below the mid-market the share is almost certainly higher, though nobody has measured it, so that sentence is an inference and is marked as one. The reason it belongs on a cost sheet: the sheet is describing a function that a large minority of firms have decided not to staff, which makes it a real allocation decision rather than a cost of doing business.',
      source: 'Sutton Place Strategies, 2021' },

    { kind: 'statement', tag: 'WHAT THE SHEET SAYS', head: 'The function is expensive whether or not it works.',
      body: 'That is the honest conclusion and it is not "spend less". A seat, a stack and a ramp cost what they cost, and the coverage they buy is a minority of the market however well they are run. So the question the sheet actually poses is one of allocation: where does the next dollar of your team’s finite attention produce a return — another seat at the top of the funnel, or capacity at the point where the return is captured, after the wire clears? That is a question about your own operation and nobody outside it can answer it for you.',
      source: 'smbX, 2026' },
  ],
  closer: {
    tag: 'FOR THE ACQUIRER',
    head: 'The sheet is not an argument to spend less. It is an argument to know the number.',
    body: 'For anyone who has built this function at a platform: what did your cost per closed add-on actually come out to? I read everything.',
  },
  caption: [
    'Nobody publishes what an add-on program costs to run. So here is the sheet, assembled from what is public — with every source’s commercial interest named, because most of these numbers come from someone selling something.',
    '',
    'The person: $150–250K before carry. The data stack: routinely six figures. The ramp: first LOI around month seven in search data, and no clean published number for time-to-first-sourced-close — a gap worth knowing by name. The coverage all of it buys: the median firm sees about 17.6% of its own market’s deal flow, per the one longitudinal series that exists (published by a firm that sells origination analytics).',
    '',
    'And the line nobody budgets: dead deals. $25–50K of QoE per busted exclusivity, with ~47% of post-LOI breaks now driven by diligence findings.',
    '',
    'One page in the carousel does the arithmetic — fully loaded cost divided by sourced closes, somewhere between $60K and $200K each. It is labeled illustrative on the page, because it is my arithmetic on published ranges and not a benchmark anybody has established. Redo it with your own numbers.',
    '',
    'The sheet’s conclusion is not "spend less". It is that the function is expensive whether or not it works — so the question is where the next dollar of finite attention produces a return. On most platforms I have seen, the starved end is not the top of the funnel.',
    '',
    'If you have built this function: what did your cost per closed add-on actually come out to?',
  ].join('\n'),
};
