/**
 * Home-services teardown — COVER STYLE PREVIEW.
 *
 * THE MESSAGE, in one line: a register of consolidators is not a map of a
 * market, and Dallas–Fort Worth proves it.
 *
 * This exists to show the three named cover styles on real copy and real art,
 * so a style can be chosen by eye rather than from a code. Build it three
 * times with `style` swapped — figure · masthead · inversion.
 *
 * EVERY FIGURE IS IN `PRACTICE_RECORD.md` §Dallas–Fort Worth, which carries
 * them from `markets/home-services/master.md` Part XI. Eighteen platform
 * parents verified against a register that recorded four; 2,412 establishments;
 * 1,797 under ten employees; roughly 280 in the 10–249 band matching no
 * consolidator. "Unmatched" is not "confirmed independent" and the copy does
 * not claim it is.
 */
const CAPTION = [
  'A register is not a market.',
  '',
  'The consolidator register for Dallas–Fort Worth recorded four platform parents.',
  '',
  'A parent-by-parent check of all 34 entries found eighteen.',
  '',
  'At the same time, roughly 280 establishments in the 10–249 employee band match no consolidator in the register at all.',
  '',
  'Both things are true at once: more crowded than anyone had recorded, and with a floor of several hundred buyable businesses underneath it.',
  '',
  'A buyer without a corp-dev function knows neither.',
  '',
  'Nobody publishes this. You have to go and count it.',
  '',
  '#MergersAndAcquisitions #CorporateDevelopment #HomeServices #LowerMiddleMarket',
].join('\n');

export const deck = {
  slug: 'hs-teardown-preview',
  kicker: 'LANE TEARDOWN',

  cover: {
    // style is injected by the preview runner — figure · masthead · inversion
    hero: '18',
    heroNow: 'VERIFIED',
    heroWas: 'the register said 4',
    claim: 'A register is not a market.',
    promise: 'Eighteen platform parents hold Dallas–Fort Worth. A register of the same market recorded four — and roughly 280 buyable establishments match none of them.',
    figures: [
      { value: '2,412', label: 'Establishments · NAICS 238220' },
      { value: '1,797', label: 'Under ten employees' },
      { value: '≈280', label: 'Match no consolidator' },
    ],
    image: 'hvac-condensers.png',
    imagePos: '50% 50%',
    bandImage: 'rooftop-units.png',
  },

  pages: [
    {
      kind: 'statement',
      tag: 'THE COUNT',
      head: 'Eleven counties, counted one parent at a time.',
      body: 'The register is where most buyers stop. It is a starting list, not a map.',
      bullets: [
        '**2,412 establishments** across the eleven counties of the Dallas–Fort Worth MSA.',
        '**1,797 of them — 74.5% —** employ fewer than ten people.',
        '**4,665 licensed firms** on the Texas roster, because most licence holders have no payroll.',
      ],
      source: 'Census County Business Patterns 2023 (NAICS 238220); Texas TDLR air-conditioning contractor roster.',
    },
  ],

  closer: {
    tag: 'FOR THE ACQUIRER',
    head: 'We count the market before we buy in it.',
    rows: [
      { name: 'smbXCorpDev', note: 'Thesis to close.' },
      { name: 'smbXCorpDev Premium', note: 'Stays through the first hundred days and beyond.' },
    ],
    line: 'One senior operator, on your side of the table.',
    action: 'Book a call — smbx.ai',
    proof: '150 acquisitions. Zero sell-side deals. Ever.',
  },

  caption: CAPTION,
};
