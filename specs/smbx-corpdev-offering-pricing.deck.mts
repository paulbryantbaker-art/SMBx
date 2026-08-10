/**
 * smbX corp-dev offering sheet — THE PRICING VARIANT.
 *
 * THE MESSAGE, in one line: the same offering sheet, with the published fee
 * schedule on it, for the people who ask what it costs.
 *
 * Paul, 2026-08-05: "We can create a version for people who are looking for
 * pricing or for those I send to or ask for pricing." So this is a SECOND
 * artifact, not a replacement. The public carousel stays clean and goes on
 * LinkedIn; this one is the leave-behind and the reply to "what does it cost?".
 *
 * ONE SLUG PER ARTIFACT (FORMATS.md §5, the slug law) — hence a separate spec
 * and a separate slug. But the shared pages are IMPORTED, never copied. Two
 * hand-maintained copies of the same four pages would drift within a fortnight,
 * and the drift would be invisible because both would still build clean.
 * Edit the base spec and both artifacts move together.
 *
 * PRICING IS NOW PUBLISHABLE, and that is a change to the perimeter, not a
 * copy decision. "No fee talk on any public surface" was retired 2026-08-05 by
 * Paul and the schedule is recorded in `PRACTICE_RECORD.md` §The published fee
 * schedule, which is what lets verify-spec check these figures instead of
 * refusing to render them. `THE_LINE_POLICY.md` and PLAYBOOK's THE LINE still
 * carry the retired wording and need the same amendment.
 *
 * EVERY FIGURE ON THE PRICING PAGE IS EXACT AND CHECKED. The $210,000 / 4.2%
 * anchor was re-derived from the bands, not copied: 5% of the first $1M =
 * $50,000, plus 4% of the next $4M = $160,000. The $100,000 minimum binds on
 * any deal below $2.25M and is overtaken smoothly above it — a floor, not a
 * cliff. Both properties are recorded in PRACTICE_RECORD.md.
 *
 * VOICE (Paul, 2026-08-05: "dont be so combative lol"): this page sells
 * CLARITY, warmly. No defiant lines — no "no negotiation", no "the schedule is
 * the schedule". "Nothing to haggle over, no surprises at close" is the tone.
 * The numbers stay exact; only the voice is soft.
 *
 * NO COMPARISON TO BANKS OR LEHMAN FORMULAS on this page. The grievance law
 * holds even where the contrast would flatter us: the schedule stands on its own.
 */
import { deck as base } from './smbx-corpdev-offering.deck.mts';

const PRICING_PAGE = {
  kind: 'statement',
  tag: 'THE SCHEDULE',
  head: 'Simple, up-front pricing — **the same for everyone.**',
  body: 'Published, so you can decide without another call. Nothing to haggle over, no surprises at close.',
  bullets: [
    '**$15,000 a quarter** — that is $5,000 a month, billed quarterly in advance.',
    '**Every dollar credited at close.** The retainer is not a charge on top — it comes off the total.',
    '**No cliffs** — each dollar priced in its own band. A $5M deal: $210,000, or 4.2%.',
    '**Premium adds no second formula** — the retainer simply continues past close.',
  ],
  table: {
    head: ['Transaction value', 'Rate'],
    rows: [
      ['First $1M', '5%'],
      ['$1M – $5M', '4%'],
      ['$5M – $10M', '3%'],
      ['Above $10M', '2%'],
      ['Minimum fee', '$100,000'],
    ],
    emphasiseLast: true,
  },
  /* THE NO-CLOSE TERM, added 2026-08-06 at Paul's instruction. It answers the
     question every buyer asks second, and leaving it unsaid made the schedule
     look riskier than it is. Non-refundable AND fully credited are both true
     and have to appear together: either one alone misleads. */
  source: 'If the deal does not close there is no success fee — you pay the retainer and nothing else. The retainer is non-refundable, and every dollar of it comes off the fee at close. Every term spelled out plainly in the engagement letter. Same schedule for every client.',
};

const CAPTION = base.caption
  /* Written with the EXACT figures, not "$5K" and "$100K". verify-spec caught
     the abbreviated form on the first run: a rounded figure is a different
     figure, and money abbreviated in a public post is precisely the drift the
     rule guards. */
  + '\n\nAnd the pricing is published: $15,000 a quarter — $5,000 a month, billed quarterly in advance — with every dollar credited against the fee at close. Success fee 5/4/3/2 with a $100,000 floor.\n\nIf the deal does not close there is no success fee. You pay the retainer and nothing else. It is non-refundable, and it comes off the total when there is one.';

export const deck = {
  ...base,
  slug: 'smbx-corpdev-offering-pricing',
  /* Appended, so the schedule lands after Premium and before the closer the
     builder adds — the reader has been told what the work is before being told
     what it costs. */
  pages: [...base.pages, PRICING_PAGE],
  closer: {
    ...base.closer,
    line: 'One senior operator, on your side of the table, at a price you already know.',
  },
  caption: CAPTION,
};
