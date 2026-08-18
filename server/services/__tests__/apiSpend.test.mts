/**
 * The API kill switch — behaviour suite.
 *
 * Run: npm run test:api-lanes
 *
 * Why this file exists: this module is the only thing standing between the
 * app and an unattended charge on the metered org key. Paul, 2026-08-09:
 * "Ok we need to kill these bc they eat up API. ALL of them." → "Let's kill
 * all for now."
 *
 * A guard that fails OPEN is worse than no guard, because it reads as
 * protection. So the cases below are mostly about the ways a parser can
 * quietly say yes:
 *   • an unrecognised name must be DROPPED, never treated as "all" — a typo in
 *     a Railway variable has to fail closed, and it must also be REPORTED or
 *     the typo is invisible until the bill arrives;
 *   • `none` must mean none, including the two lanes that are on by default;
 *   • the value must be read LIVE, not cached at import, or a Railway change
 *     appears to take effect and does not until the next deploy;
 *   • the refusal message must name the fix verbatim, because the person
 *     reading it is the person who has to undo it.
 */
import {
  enabledLanes, spendAllowed, assertSpendAllowed, SpendDisabledError,
  unknownLaneNames, SPEND_LANES, DEFAULT_LANES, estimateCostCents,
} from '../apiSpend.js';

let pass = 0, total = 0;
function eq(label: string, got: unknown, want: unknown) {
  total++;
  const g = JSON.stringify(got), w = JSON.stringify(want);
  const ok = g === w;
  pass += ok ? 1 : 0;
  console.log(ok ? `  ok   ${label} → ${g}` : `  FAIL ${label} → got ${g}, want ${w}`);
}

/** Set API_LANES (or unset it) and report what resolves. */
const lanesFor = (v: string | undefined) => {
  if (v === undefined) delete process.env.API_LANES; else process.env.API_LANES = v;
  return [...enabledLanes()].sort();
};

console.log('\nAPI_LANES → the lanes it turns on');
eq('(unset) is the default posture', lanesFor(undefined), [...DEFAULT_LANES].sort());
eq('empty string  = none',           lanesFor(''),                          []);
eq('"none"        = none',           lanesFor('none'),                      []);
eq('"off"         = none',           lanesFor('off'),                       []);
eq('"false"       = none',           lanesFor('false'),                     []);
eq('"all"',                          lanesFor('all'),                       [...SPEND_LANES].sort());
eq('case-insensitive',               lanesFor('ALL'),                       [...SPEND_LANES].sort());
eq('one lane',                       lanesFor('studio'),                    ['studio']);
eq('a list',                         lanesFor('chat,marketing,studio'),     ['chat','marketing','studio']);
eq('whitespace + case in a list',    lanesFor(' chat , Studio '),           ['chat','studio']);
eq('duplicates collapse',            lanesFor('chat,chat'),                 ['chat']);
eq('trailing comma',                 lanesFor('chat,'),                     ['chat']);

console.log('\na typo FAILS CLOSED and is reported (not swallowed)');
eq('typo alone turns nothing on',    lanesFor('studios'),                   []);
eq('typo does not poison the rest',  lanesFor('studios,chat'),              ['chat']);
process.env.API_LANES = 'studios,chat,reserch';
eq('the typos are named',            unknownLaneNames().sort(),             ['reserch','studios']);
process.env.API_LANES = 'all';
eq('nothing unknown in "all"',       unknownLaneNames(),                    []);
delete process.env.API_LANES;
eq('nothing unknown when unset',     unknownLaneNames(),                    []);

console.log('\nthe shipped default, lane by lane (2026-08-15)');
delete process.env.API_LANES;
for (const lane of SPEND_LANES) {
  eq(`spendAllowed('${lane}')`, spendAllowed(lane), (DEFAULT_LANES as readonly string[]).includes(lane));
}
// Named individually, not just derived from DEFAULT_LANES — the loop above
// passes whatever that constant says, so on its own it asserts nothing about
// WHICH lanes should be on. These four are the decision.
eq('chat is on — Yulia is the product',        spendAllowed('chat'),      true);
eq('marketing is on — the public funnel',      spendAllowed('marketing'), true);
eq('sourcing is OFF — pre-IoI, so the studio', spendAllowed('sourcing'),  false);
eq('studio is OFF — collateral is Cowork\'s',  spendAllowed('studio'),    false);
eq('research is OFF — the only dollar press',  spendAllowed('research'),  false);

console.log('\nthe research split — the point of the whole exercise');
delete process.env.API_LANES;
// The claim the split exists to make good on: composition can be armed WITHOUT
// arming the ~$18-a-press research agent. Before 2026-08-14 one `studio` lane
// covered both, so this combination was unexpressible.
//
// It is now asserted EXPLICITLY rather than through the default, because the
// default changed underneath it. `studio` was on by default on 2026-08-14 and
// this line read `spendAllowed('studio') === true`; THE_IOI_SEAM.md returned
// collateral to the studio a day later and the default went dark, so the
// assertion started failing while the property it was testing was still
// perfectly true. A test coupled to a default tests the default.
process.env.API_LANES = 'studio';
eq('composition can be armed alone',  spendAllowed('studio'),   true);
eq('…without arming research',        spendAllowed('research'), false);
delete process.env.API_LANES;
eq('…and research is NOT',           spendAllowed('research'), false);
process.env.API_LANES = 'studio';
eq('asking for studio alone',        [...enabledLanes()],      ['studio']);
eq('…still does not arm research',   spendAllowed('research'), false);
// `all` must keep meaning all, or a reader would assume research is exempt.
process.env.API_LANES = 'all';
eq('"all" DOES include research',    spendAllowed('research'), true);

console.log('\n"none" really means none — including the on-by-default lanes');
process.env.API_LANES = 'none';
for (const lane of SPEND_LANES) eq(`spendAllowed('${lane}')`, spendAllowed(lane), false);

console.log('\nthe refusal is actionable');
// Tested on `research` because that is the lane a user actually meets: it is
// the one that is off by default, and the one whose help has somewhere else
// to send them. (Until 2026-08-14 this read `studio`, which carried the
// workspace pointer; after the split that pointer belongs to research, and
// studio's own refusal means "someone set API_LANES narrower than default".)
process.env.API_LANES = 'chat,marketing';
let err: any = null;
try { assertSpendAllowed('research', 'Research runs'); } catch (e) { err = e; }
eq('throws SpendDisabledError',  err instanceof SpendDisabledError, true);
eq('carries the lane',           err?.lane,   'research');
eq('carries a 503, not a 500',   err?.status, 503);
eq('opens by naming the work',   /^Research runs is switched off/.test(err?.message ?? ''), true);
eq('points at the workspace',    (err?.message ?? '').includes('studio/ in this repo'), true);
eq('names the price, so the default reads as a choice',
   /\$18/.test(err?.message ?? ''), true);
eq('spells the fix verbatim',    (err?.message ?? '').includes('API_LANES=chat,marketing,research'), true);
eq('an ON lane does not throw',
   (() => { try { assertSpendAllowed('chat', 'Yulia'); return 'no throw'; } catch { return 'threw'; } })(),
   'no throw');

console.log('\nread live, so a Railway change lands on the next request');
process.env.API_LANES = 'studio'; eq('flip on',  spendAllowed('studio'), true);
process.env.API_LANES = 'none';   eq('flip off', spendAllowed('studio'), false);


/* ── cached tokens are priced, not dropped ──────────────────────────────────
   Added 2026-08-15 after finding that both recordSpend call sites passed only
   `usage.input_tokens`. Under prompt caching that field is the UNCACHED part
   alone, so the ledger saw a fraction of the chat lane — the lane the ceiling
   most needs to measure, and the undercount direction, which is the one that
   matters for a runaway stop: a cap that under-reports never trips. */
console.log('\ncached tokens are priced');
{
  const M = 'claude-sonnet-4-6';                 // $3/MTok in, $15/MTok out
  eq('uncached input at full rate',   estimateCostCents(M, 1_000_000, 0), 300);
  eq('output at its own rate',        estimateCostCents(M, 0, 1_000_000), 1500);
  eq('a cache READ is a tenth',       estimateCostCents(M, 0, 0, 1_000_000, 0), 30);
  eq('a cache WRITE is 1.25x',        estimateCostCents(M, 0, 0, 0, 1_000_000), 375);
  eq('omitted cache args mean none, not unknown', estimateCostCents(M, 1_000_000, 0), 300);

  /* THE CASE THAT MOTIVATED IT — one deal-chat turn against the measured
     43.4k static floor, ~22k of it cached, 1k out. What the ledger used to
     record versus what it costs. */
  const warm = estimateCostCents(M, 21_400, 1_000, 22_000, 0);
  const oldWay = estimateCostCents(M, 21_400, 1_000);
  eq('a warm turn is undercounted without cache reads', oldWay < warm, true);

  /* And the cold turn — the cache WRITE is the expensive one, and it recurs
     every time the TTL lapses, so a low-traffic day pays it again and again. */
  const cold = estimateCostCents(M, 21_400, 1_000, 0, 22_000);
  eq('a cold turn costs more than a warm one', cold > warm, true);
  eq('…and the old estimate missed most of it', oldWay < cold, true);
}

console.log(`\n${pass}/${total} cases passed`);
process.exit(pass === total ? 0 : 1);
