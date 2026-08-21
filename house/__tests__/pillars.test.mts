/**
 * shared/pillars.ts — tests.
 *
 * The cases that matter are the REFUSALS. This register exists to settle a bet
 * (does The Capture outperform?), and the way a rollup lies is not by throwing
 * — it is by turning an absence into a zero, or by printing a percentage over
 * four rows. Every test below that begins "…is unknown, not" is guarding that.
 */
import {
  PILLARS, AVOID, TARGETS_BEGIN_AFTER, targetsApply, pillarById, isPillarId,
  per1k, latestByPost, pillarRollup, MIN_TAGGED_FOR_SHARE, MIN_READINGS_FOR_RATE,
  parsePostPaste, suggestPillar,
  type Reading, type PostRow,
} from '../../shared/pillars.js';

let pass = 0;
const fails: string[] = [];
function ok(name: string, cond: boolean, detail = '') {
  if (cond) { pass++; return; }
  fails.push(`${name}${detail ? ` — ${detail}` : ''}`);
}
function eq(name: string, actual: unknown, expected: unknown) {
  ok(name, JSON.stringify(actual) === JSON.stringify(expected),
    `got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)}`);
}

/* ── the register itself ───────────────────────────────────────────────── */
eq('five pillars', PILLARS.length, 5);
eq('the weights sum to 100', PILLARS.reduce((a, p) => a + p.targetPct, 0), 100);
eq('The Capture is the flagship', [...PILLARS].sort((a, b) => b.targetPct - a.targetPct)[0].id, 'the-capture');
ok('every id is unique', new Set(PILLARS.map(p => p.id)).size === 5);
ok('every pillar says what belongs in it', PILLARS.every(p => p.scope.length > 20 && p.carries.length > 0));
eq('lookup by id', pillarById('the-capture')?.name, 'The Capture');
eq('an unknown id is undefined, not a default', pillarById('the-market-read'), undefined);
eq('null is undefined too', pillarById(null), undefined);
ok('the guard accepts a real id', isPillarId('the-kill-floor'));
ok('…and refuses anything else', !isPillarId('Dead Deal Economics') && !isPillarId(null) && !isPillarId(7));
ok('the rooms we do not enter are carried with reasons', AVOID.length >= 5 && AVOID.every(a => a.why.length > 10));
ok('AI-as-headline is one of them', AVOID.some(a => /AI as the headline/i.test(a.topic)));

/* ── targets do not apply to a window planned before they existed ──────── */
eq('the live window scores no targets', targetsApply('2026-08-21'), false);
eq('an earlier window neither', targetsApply('2026-08-17'), false);
eq('the next campaign does', targetsApply('2026-09-20'), true);
/* INVERTED 2026-08-21 when the calendar was retired: the standing queue is
   where every post is created from a pillar now, so it is the one place the
   weights must show. The exemption is for the retired calendars, not for new
   work — the old rule would have hidden the target column forever. */
eq('the standing queue IS where targets apply now', targetsApply(null), true);
eq('…and an absent stamp means the standing queue', targetsApply(''), true);
eq('undefined too', targetsApply(undefined), true);
eq('a library-hook post is not a planned window either', targetsApply('library-2026-08'), true);
eq('…and that holds for a name that sorts BEFORE the boundary', targetsApply('0-library'), true);
eq('the boundary is the live calendar', TARGETS_BEGIN_AFTER, '2026-08-21');

/* ── per1k: the ranking term ───────────────────────────────────────────── */
const R = (o: Partial<Reading>): Reading => ({
  queueId: 'P-1', readOn: '2026-08-21', daysAfterPost: 7,
  impressions: null, membersReached: null, reactions: null, comments: null, reposts: null, ...o,
});

eq('reactions + comments + reposts per 1,000 impressions',
  per1k(R({ impressions: 4000, reactions: 38, comments: 11, reposts: 2 })), 12.75);
eq('a post with no impressions is unknown, not zero',
  per1k(R({ impressions: null, reactions: 38 })), null);
eq('zero impressions is unknown, not a division',
  per1k(R({ impressions: 0, reactions: 38 })), null);
eq('impressions but no activity typed yet is unknown, not zero',
  per1k(R({ impressions: 4000 })), null);
eq('a genuine zero-engagement post IS zero — it was typed',
  per1k(R({ impressions: 4000, reactions: 0, comments: 0, reposts: 0 })), 0);
eq('a partly-typed reading counts what is there',
  per1k(R({ impressions: 2000, comments: 4 })), 2);
eq('no reading at all is unknown', per1k(null), null);
eq('undefined too', per1k(undefined), null);

/* ── latestByPost: LinkedIn revises upward for days ────────────────────── */
{
  const day1 = R({ queueId: 'P-1', readOn: '2026-08-21', impressions: 900, reactions: 4 });
  const day7 = R({ queueId: 'P-1', readOn: '2026-08-27', impressions: 4000, reactions: 38 });
  eq('the newest reading wins, whatever order they arrive in',
    latestByPost([day7, day1]).get('P-1')?.impressions, 4000);
  eq('…and the other way round',
    latestByPost([day1, day7]).get('P-1')?.impressions, 4000);
  eq('one entry per post', latestByPost([day1, day7]).size, 1);
}

/* ── the rollup ────────────────────────────────────────────────────────── */
const P = (queueId: string, pillar: PostRow['pillar'], status = 'posted'): PostRow =>
  ({ queueId, pillar, status, campaign: '2026-08-21' });

{
  /* A small window — below every threshold. This is the shape of Paul's first
     two weeks, and it is the one that must refuse to draw conclusions. */
  const posts = [P('P-1', 'the-capture'), P('P-2', 'the-capture'), P('P-3', 'the-kill-floor'), P('P-4', null)];
  const readings = [R({ queueId: 'P-1', impressions: 4000, reactions: 40, comments: 10, reposts: 0 })];
  const roll = pillarRollup(posts, readings, { campaign: '2026-08-21' });

  eq('the live window shows no targets', roll.showTargets, false);
  eq('tagged posts are counted', roll.tagged, 3);
  eq('untagged posts are counted and NOT hidden', roll.untagged, 1);
  eq('share is not meaningful yet', roll.shareIsMeaningful, false);

  const cap = roll.lines.find(l => l.id === 'the-capture')!;
  eq('counts are always shown', [cap.posts, cap.posted], [2, 2]);
  eq('one of the two carries a reading', cap.withMetrics, 1);
  eq('share is withheld below the floor, not estimated', cap.sharePct, null);
  eq('a median over one reading is withheld', cap.medianPer1k, null);

  const kf = roll.lines.find(l => l.id === 'the-kill-floor')!;
  eq('a pillar with no readings reports none rather than zero', kf.withMetrics, 0);
  eq('…and no rate', kf.medianPer1k, null);
  eq('…and no age spread', kf.ageDays, null);

  ok('every pillar appears even with no posts',
    roll.lines.length === 5 && roll.lines.every(l => typeof l.posts === 'number'));
}

{
  /* A window past both thresholds, on a campaign that scores targets. */
  const posts: PostRow[] = [];
  for (let i = 1; i <= 9; i++) posts.push({ ...P(`C-${i}`, 'the-capture'), campaign: '2026-09-20' });
  for (let i = 1; i <= 5; i++) posts.push({ ...P(`K-${i}`, 'the-kill-floor'), campaign: '2026-09-20' });

  const readings: Reading[] = [
    R({ queueId: 'C-1', impressions: 1000, reactions: 10, comments: 0, reposts: 0, daysAfterPost: 7 }),  // 10
    R({ queueId: 'C-2', impressions: 1000, reactions: 20, comments: 0, reposts: 0, daysAfterPost: 9 }),  // 20
    R({ queueId: 'C-3', impressions: 1000, reactions: 30, comments: 0, reposts: 0, daysAfterPost: 5 }),  // 30
    R({ queueId: 'K-1', impressions: 1000, reactions: 5, comments: 0, reposts: 0 }),
    R({ queueId: 'K-2', impressions: 1000, reactions: 7, comments: 0, reposts: 0 }),
  ];
  const roll = pillarRollup(posts, readings, { campaign: '2026-09-20' });

  eq('a later campaign scores targets', roll.showTargets, true);
  eq('fourteen tagged clears the share floor', roll.shareIsMeaningful, true);

  const cap = roll.lines.find(l => l.id === 'the-capture')!;
  eq('share is now computed over TAGGED posts', Math.round(cap.sharePct!), 64);
  eq('the median of 10, 20, 30 is 20', cap.medianPer1k, 20);
  eq('the age spread is carried so comparability is visible', cap.ageDays, { min: 5, max: 9 });

  const kf = roll.lines.find(l => l.id === 'the-kill-floor')!;
  eq('two readings is still below the rate floor', kf.medianPer1k, null);
  eq('…though the count is honest about why', kf.withMetrics, 2);
  eq('share still shows — it needs the window, not the metrics', Math.round(kf.sharePct!), 36);

  const empty = roll.lines.find(l => l.id === 'the-settlement')!;
  eq('a pillar with nothing in it is 0 posts and a real 0% share', [empty.posts, empty.sharePct], [0, 0]);
}

{
  /* THE ONE THAT WOULD HAVE LIED: an un-typed post must not drag the median. */
  const posts = [P('A', 'the-capture'), P('B', 'the-capture'), P('C', 'the-capture'), P('D', 'the-capture')];
  const readings = [
    R({ queueId: 'A', impressions: 1000, reactions: 20, comments: 0, reposts: 0 }),
    R({ queueId: 'B', impressions: 1000, reactions: 20, comments: 0, reposts: 0 }),
    R({ queueId: 'C', impressions: 1000, reactions: 20, comments: 0, reposts: 0 }),
    // D was posted and never typed in.
  ];
  const cap = pillarRollup(posts, readings).lines.find(l => l.id === 'the-capture')!;
  eq('four posts, three readings — the median is of the three', cap.medianPer1k, 20);
  eq('and the count says three, so the reader can see the gap', [cap.posted, cap.withMetrics], [4, 3]);
}

{
  /* A post not yet posted carries no reading and must not count as measured. */
  const posts = [P('X', 'the-capture', 'drafted'), P('Y', 'the-capture', 'next')];
  const roll = pillarRollup(posts, []);
  const cap = roll.lines.find(l => l.id === 'the-capture')!;
  eq('tagged but unpublished posts count as tagged', cap.posts, 2);
  eq('…and as not posted', cap.posted, 0);
  eq('…and as unmeasured', cap.withMetrics, 0);
}

eq('the share floor is Paul\'s own benchmark', MIN_TAGGED_FOR_SHARE, 12);
eq('a median needs at least three readings', MIN_READINGS_FOR_RATE, 3);

/* ── the paste parser: it proposes, it never sets ──────────────────────── */

const POSTS_URL = 'https://www.linkedin.com/posts/paulbaker_the-qoe-came-back-and-the-addback-schedule-activity-7231234567890123456-Ab1c';
const FEED_URL  = 'https://www.linkedin.com/feed/update/urn:li:activity:7231234567890123456/';

eq('the URL is found on its own line', parsePostPaste(FEED_URL).url, FEED_URL);
eq('…and inside pasted copy', parsePostPaste(`Some post text.\n\n${FEED_URL}`).url, FEED_URL);
eq('trailing punctuation is not part of the link', parsePostPaste(`see ${FEED_URL.slice(0, -1)}.`).url, FEED_URL.slice(0, -1));
eq('a paste with no link still parses', parsePostPaste('Just some copy').url, null);
eq('empty in, nothing out', parsePostPaste('   '), { url: null, title: null, pillar: null, matched: [] });

/* THE SLUG IS THE WHOLE REASON A URL-ONLY PASTE IS USEFUL. LinkedIn's /posts/
   share link embeds the opening words; /feed/update/ carries none. */
eq('a /posts/ link recovers the opening words as a title',
  parsePostPaste(POSTS_URL).title, 'The QoE came back and the addback schedule');
eq('the trade\'s acronyms survive LinkedIn\'s lowercasing of the slug',
  parsePostPaste('https://www.linkedin.com/posts/paulbaker_ma-volume-and-the-ebitda-bridge-activity-7231234567890-Ab1c').title,
  'M&A volume and the EBITDA bridge');
eq('a /feed/update/ link recovers nothing — and says so rather than inventing',
  parsePostPaste(FEED_URL).title, null);
eq('pasted copy beats the slug — it is the real thing',
  parsePostPaste(`What the QoE actually found\n${POSTS_URL}`).title, 'What the QoE actually found');
eq('a long first line is clipped at a word',
  parsePostPaste('The quality of earnings report came back on Tuesday and it moved the number by a full turn of EBITDA which changes everything about this deal').title,
  'The quality of earnings report came back on Tuesday and it moved the number by a full…');

/* THE PROPOSAL. A clear winner is offered; a tie is not. */
eq('diligence language points at the Kill Floor',
  suggestPillar('The QoE came back and the add-back schedule fell apart during diligence.').pillar, 'the-kill-floor');
eq('structure language points at the Settlement',
  suggestPillar('The earnout was 40% of consideration and the escrow ran 18 months.').pillar, 'the-settlement');
eq('post-close language points at the Capture',
  suggestPillar('What we underwrote at IC versus what integration actually captured by day one.').pillar, 'the-capture');
eq('trade roll-up language points at the Consolidation Playbook',
  suggestPillar('The third add-on is where an HVAC platform usually stalls.').pillar, 'the-consolidation');
eq('a URL-only /posts/ paste can still propose, from the slug alone',
  parsePostPaste(POSTS_URL).pillar, 'the-kill-floor');

/* THESE FOUR ARE THE POINT: a wrong confident guess puts a post in the wrong
   column of the table settling a strategic bet. Silence beats a coin flip. */
eq('no cue words, no proposal', suggestPillar('Had a good week. Grateful for the team.').pillar, null);
eq('…and nothing is claimed as evidence', suggestPillar('Had a good week.').matched, []);
eq('an even split proposes NOTHING rather than the likeliest',
  suggestPillar('The earnout depends on integration.').pillar, null);
eq('the cue words are reported, so a wrong guess is legible',
  suggestPillar('The QoE and the add-back schedule.').matched.sort(), ['add-back', 'qoe']);

/* Word-bounded: the false positives that make a parser look stupid. */
eq('`loi` does not match "exploit"', suggestPillar('We exploit that gap.').pillar, null);
eq('`mep` does not match "development"', suggestPillar('Business development work.').pillar, null);

/* ── report ────────────────────────────────────────────────────────────── */
for (const f of fails) console.log(`✗ ${f}`);
console.log(`\n${pass}/${pass + fails.length} passed`);
if (fails.length) process.exit(1);
