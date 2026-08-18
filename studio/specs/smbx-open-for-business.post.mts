/**
 * Rooftop — the practice is open, and there is room for another buyer.
 *
 * v3, 2026-08-03 (Paul): hero replaced with the website's own —
 * "Buying a business is hard work. We make it easier." — and the site tag line
 * folded into the body. "led or co-led" removed at Paul's direction: it read as
 * a hedge. The card now makes no claim about role at all, which is the honest
 * way to drop the qualifier rather than upgrading to "closed" (which
 * TrackRecord.tsx rule 1 forbids outright). NOTE: smbx.ai/track-record still
 * carries "led or co-led" and the full attribution shield — the two surfaces
 * now differ, deliberately.
 *
 * VOICE: the card is "we" to match the website. The caption is "I", because a
 * LinkedIn post comes from Paul personally. The byline slot is unchanged.
 *
 * THE MESSAGE, in one line: smbX is open, and Paul will run a buyer's
 * acquisition process for them, end to end.
 *
 * v4, 2026-08-03: caption rewritten to Paul's LinkedIn-reach review. NO URL in
 * the body (off-platform links are down-ranked) — the link goes in the FIRST
 * COMMENT at post time, and the caption says so. Short lines and bullets for
 * dwell time; the close is a question, not a statement, to pull comments inside
 * the first 60-90 minutes. Bullets are U+2022, not markdown asterisks —
 * LinkedIn renders no markdown, so a '*' posts as a literal asterisk.
 * The card keeps its smbx.ai CTA: it is baked into an image, not a link, and
 * carries no reach penalty.
 *
 * v2 note, still true: neither surface names a deal, so the attribution line is
 * not owed here (TrackRecord.tsx rule 3 binds it to wherever the names appear).
 * Rule 5 holds — no employer named.
 *
 * NOTE: build-onepager.mts has no `sub` field, despite FORMATS.md §2 listing
 * one. A `sub:` key is silently dropped. The supporting line lives in `body`.
 *
 * Check it against the practice record, not a market master:
 *   verify-spec.mts specs/smbx-open-for-business.post.mts --against PRACTICE_RECORD.md
 */
const CAPTION = [
  'Buying a business is hard work. We make it easier.',
  '',
  'Today, I\u2019m officially opening the doors to smbX.',
  '',
  'Whether it is your 1st or your 100th acquisition, we run the process for you\u2014freeing up your time and resources.',
  '',
  'I\u2019ve spent two decades in corporate development, all of it on the buy side. That includes about 150 acquisitions and more than $5 billion of revenue added: big platform businesses, small ones folded into them, and plenty of unglamorous deals that made the model work. One side of the table, every time.',
  '',
  'Here is what our partnership looks like:',
  '',
  '\u2022 We build the thesis together.',
  '\u2022 I size the market from primary sources.',
  '\u2022 I find the operators who aren\u2019t for sale yet and run the outreach.',
  '\u2022 I sit beside you through diligence and close.',
  '',
  'It is an entire corporate development function, without hiring one.',
  '',
  'Here is a taste of the finding process. Last week, I read the Census County Business Patterns file and the Texas contractor license roster for the 11 counties of Dallas\u2013Fort Worth. I wanted to know what a \u201csaturated\u201d metro is actually worth to a buyer.',
  '',
  'Here is what I found:',
  '',
  '\u2022 2,412 plumbing and HVAC establishments.',
  '\u2022 1,797 of them employ fewer than ten people.',
  '\u2022 18 companies already own a business there.',
  '\u2022 Roughly 280 businesses of buyable size are owned by none of them.',
  '',
  'Nobody publishes that. You have to go and count it\u2014and that is the part I enjoy most.',
  '',
  'My calendar is currently open for new partners. If you are buying in the lower middle market, what specific spaces or regions are you hunting for right now? Let me know below. \ud83d\udc47',
  '',
  '(Link in the comments to learn more about smbX!)',
  '',
  '#MergersAndAcquisitions #CorporateDevelopment #PrivateEquity #LowerMiddleMarket',
].join('\n');

export const post = {
  slug: 'smbx-open-for-business',
  kicker: 'CORPORATE DEVELOPMENT',
  numeral: '150',
  numeralLabel: 'acquisitions',
  hook: 'Buying a business is hard work. We make it easier.',   // U+00A0 glue — see FORMATS note on U+2011
  body: 'Whether it’s your 1st or your 100th acquisition, we run the process for you, freeing up your time and resources. Thesis, market, targets, outreach, diligence, close — the whole function. Two decades of corporate development behind it, and we work one side of the table: yours.',
  invite: 'There’s room on the calendar, and we’d like to spend it on your deal.',
  cta: 'smbx.ai  →',
  byline: { name: 'Paul Baker', title: 'Buy-side corporate development' },
  /* Per-variant art (2026-08-03, Paul): the headshot on the block, the walking
     shot on paper. The block is the surface people meet first, and eye contact
     is the trust layer — DESIGN.md 7, "the face is the trust layer". Both are
     real photographs of Paul; neither is generated or altered. */
  image: 'founder-walking.webp',
  imagePos: '50% 40%',
  imageDark: 'founder-portrait.jpg',
  imagePosDark: '50% 30%',
  caption: CAPTION,
};
