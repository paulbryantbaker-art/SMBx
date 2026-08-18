/**
 * COMMERCIAL MEP — "the number you were given probably does not mean what you
 * think it means."
 *
 * v2, 2026-08-03 (Paul): rewritten for plain language and a clear message.
 * The first version was a set of true observations that never said what it was
 * for — Paul: *"I'm just confused on what the actual message is… we're asking
 * firms to trust us to go against banks and auctions. Just use plain language
 * throughout and be thorough and explanatory. Too much jargon."*
 *
 * So: every term is explained the first time it is used. "EV/EBITDA" is spelled
 * out as what it measures rather than named. "Backlog" is explained before it is
 * relied on. "MEP" is expanded on the cover. The deck now ends on the work
 * itself, which is the thing being asked for trust on.
 *
 * THE MESSAGE, in one line: before you bid, someone should check that the number
 * you are working from means what you think it means. Each page is one worked
 * example of that; the closer names it.
 *
 * SOURCE OF TRUTH IS THE OTHER MARKET'S MASTER. `markets/commercial-mep/` has no
 * master yet (job 0 opened 2026-08-03). Every figure comes from
 * `markets/home-services/master.md` §4.3, §11.2 and A.0.3 §D — the
 * commercial-mechanical section that master tables separately. So:
 *
 *   npx tsx $REPO/scripts/studio/verify-spec.mts \
 *     markets/commercial-mep/specs/mep-comp-basis.deck.mts \
 *     --against markets/home-services/master.md
 *
 * NO COMPETITOR TALK. The setting is an auction and the reader knows it; the
 * closer describes our own work and lets the contrast sit. DESIGN.md §9:
 * describe the work, never other people's work.
 *
 * Bookends are auto-added. Do not author a cover or closer page.
 */
const CAPTION = [
  'If you are about to bid on a commercial mechanical contractor, start by checking that the number you were handed means what you think it means.',
  '',
  'Three things go wrong before anyone opens a data room.',
  '',
  '1. The benchmark company is not doing the same job.',
  '',
  'When people need a comparison for a commercial mechanical business, they reach for Comfort Systems, because it is the biggest public one. But 45.0% of its revenue comes from technology customers. Another 63.2% of its work is installing systems in new buildings rather than maintaining existing ones. And a single customer is about 12.8% of everything it sells.',
  '',
  'If your target services a few hundred local buildings, those two companies have almost nothing in common but a job title.',
  '',
  '2. The same company can be 23x or 16x, depending on the math.',
  '',
  'You will hear EMCOR quoted at 21–23x. That is true if you compare the share price to profit after tax — it is 23.47x that way. Compare the whole business including its debt to its operating earnings, and the same company is 16.34x.',
  '',
  'Neither number is wrong. But if a seller quotes the higher one and you underwrite to it, you are about seven turns high before you have started.',
  '',
  '3. These businesses are bought for work they have not done yet.',
  '',
  'A home services company is valued on customers who come back. A commercial mechanical company is valued on signed contracts it has not started. Comfort Systems held $14.06B of that at the end of June, against $8.12B a year earlier. EMCOR reported a record $15.62B.',
  '',
  'So the diligence question is not "how loyal are the customers." It is "how much of that signed work is real, and what does it actually earn?"',
  '',
  'One more thing worth knowing before you bid. In Dallas–Fort Worth, 18 companies already own a business in this space. Eight of them do commercial work. Those eight are who you are in the room with, and they want different things than the residential ten.',
  '',
  'And something I cannot tell you: whether anyone is buying up commercial plumbing nationally. People say no one is. I have not been able to confirm it. If it is true, that is an open lane. If it is false, my list is just incomplete. I would rather say I do not know than let you assume.',
  '',
  'None of this is glamorous. It is reading filings, checking what a comparison company actually does, and asking which math a multiple was built on. It all happens before the number you sign up to.',
  '',
  'If you are looking at one of these right now — which number are you working from, and do you know how it was built? 👇',
  '',
  '(Link in the comments for the full assessment.)',
  '',
  '#MergersAndAcquisitions #PrivateEquity #MEP #CorporateDevelopment #LowerMiddleMarket',
].join('\n');

export const deck = {
  slug: 'mep-comp-basis',
  kicker: 'COMMERCIAL MEP',
  cover: {
    hook: 'Before you bid, check that the number you were given means what you think it means.',
    sub: 'Commercial mechanical, electrical and plumbing contractors — and the three things that go wrong before anyone opens a data room.',
    image: 'mep/cooling-towers.png', imagePos: '50% 42%',
    /* Deliberately NOT the Home Services assessment. That report covers a
       different market, and sending a commercial-MEP reader to it would undo
       the separation this deck exists to make. Commercial MEP has no
       assessment of its own yet — job 0 opened 2026-08-03. */
    cta: 'Market assessments at smbx.ai/research',
    numeral: '45', unit: '%',
    numeralLabel: 'of the benchmark company\nis a different business',
    /* Each stat is cited on a body page: the two EMCOR figures on pages 2 and 3,
       the backlog on page 4. */
    stats: [
      { value: '23.47x', label: 'share price against profit' },
      { value: '16.34x', label: 'the same firm, whole business' },
      { value: '$14.06B', label: 'work signed, not yet started' },
    ],
  },
  pages: [
    { kind: 'numeral', numeral: '45.0%', head: 'of the company everyone compares to comes from technology customers.',
      body: 'When people need a benchmark for a commercial mechanical business, they reach for Comfort Systems, because it is the biggest public one. But 63.2% of its work is installing systems in new buildings rather than maintaining existing ones, and a single customer is about 12.8% of everything it sells. If the business you are buying services a few hundred local buildings, those two companies have almost nothing in common but a job title.',
      source: 'Comfort Systems USA, FY2025 and Q2 2026' },

    { kind: 'statement', tagColor: 'brass', tag: 'THE SAME COMPANY, TWICE',
      head: 'A multiple means nothing until you know which math built it.',
      body: 'You will hear EMCOR quoted at 21–23x. That is true if you compare the share price to profit after tax — 23.47x today. Compare the whole business, debt included, to its operating earnings, and the same company is 16.34x. Neither number is wrong. But take the higher one into your model and you are about seven turns high before you have started.',
      source: 'Third-party market data, 28 July 2026' },

    { kind: 'diagram', tag: 'ONE COMPANY, TWO NUMBERS', head: 'Seven turns apart, and both are correct.',
      body: 'The gap is not a disagreement about the company. It is two different questions, and only one of them is the question you are asking.',
      connector: 'vs',
      /* Bar heights are the ratio: 16.34 ÷ 23.47 = 0.696, and 340 × 0.696 = 237. */
      bars: [
        { label: '23.47x', sub: 'share price vs. profit', style: 'ink', h: 340 },
        { label: '16.34x', sub: 'whole business vs. earnings', style: 'green', h: 237 },
      ],
      source: 'Third-party market data, 28 July 2026' },

    { kind: 'statement', tag: 'WHAT IS ACTUALLY BEING BOUGHT',
      head: 'These businesses are bought for work they have not done yet.',
      body: 'A home services company is valued on customers who keep coming back — service plans, repeat repairs. A commercial mechanical company is valued on contracts it has signed and not yet started. Comfort Systems held $14.06B of that at the end of June, against $8.12B a year earlier, and EMCOR reported a record $15.62B. So the question in diligence is not how loyal the customers are. It is how much of that signed work is real, and what it actually earns.',
      source: 'Comfort Systems USA and EMCOR Group, Q2 2026' },

    { kind: 'trade', name: 'DALLAS–FORT WORTH', image: 'mep/chilled-water-plant.png', imagePos: '50% 50%',
      numeral: '8', head: 'companies here already buy commercial mechanical businesses.',
      body: 'Eighteen firms own a home or commercial services business in this metro. Eight are on the commercial side: Comfort Systems, EMCOR, Modigent, Crete United, Service Logic, Astra, United Building Solutions and FirstCall. Those eight are who you are in the room with, and they are looking for different things than the other ten.',
      source: 'Owner-published rosters, verified 2026-08-03' },

    { kind: 'statement', tag: 'WHAT WE COULD NOT FIND OUT',
      head: 'Nobody could tell us whether commercial plumbing has a national buyer.',
      body: 'People say no company is buying up commercial plumbing across the country. We have not been able to confirm that, and we have looked. If it is true, it is an open lane and worth a serious look. If it is false, our list is simply incomplete. We would rather tell you we do not know than let you assume either way.' },
  ],
  closer: {
    tag: 'WHAT WE DO',
    head: 'This is the work that happens before you bid.',
    body: 'Read the filings. Check what the comparison company actually does. Ask which math a multiple was built on. Find out who else is already at the table. Then say plainly what we could not find out. None of it is glamorous, and all of it happens before the number you sign your name to.',
  },
  caption: CAPTION,
};
