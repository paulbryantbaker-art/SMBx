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
  unknownLaneNames, SPEND_LANES, DEFAULT_LANES,
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

console.log('\nthe shipped default, lane by lane (2026-08-09)');
delete process.env.API_LANES;
for (const lane of SPEND_LANES) {
  // studio + sourcing are OFF because both have a local Cowork equivalent;
  // chat + marketing are ON because switching them off leaves a brick and
  // breaks the lead funnel respectively. See apiSpend.ts's header.
  eq(`spendAllowed('${lane}')`, spendAllowed(lane), (DEFAULT_LANES as readonly string[]).includes(lane));
}

console.log('\n"none" really means none — including the on-by-default lanes');
process.env.API_LANES = 'none';
for (const lane of SPEND_LANES) eq(`spendAllowed('${lane}')`, spendAllowed(lane), false);

console.log('\nthe refusal is actionable');
process.env.API_LANES = 'chat,marketing';
let err: any = null;
try { assertSpendAllowed('studio', 'Research runs'); } catch (e) { err = e; }
eq('throws SpendDisabledError',  err instanceof SpendDisabledError, true);
eq('carries the lane',           err?.lane,   'studio');
eq('carries a 503, not a 500',   err?.status, 503);
eq('opens by naming the work',   /^Research runs is switched off/.test(err?.message ?? ''), true);
eq('points at the workspace',    (err?.message ?? '').includes('~/Documents/smbx-studio'), true);
eq('spells the fix verbatim',    (err?.message ?? '').includes('API_LANES=chat,marketing,studio'), true);
eq('an ON lane does not throw',
   (() => { try { assertSpendAllowed('chat', 'Yulia'); return 'no throw'; } catch { return 'threw'; } })(),
   'no throw');

console.log('\nread live, so a Railway change lands on the next request');
process.env.API_LANES = 'studio'; eq('flip on',  spendAllowed('studio'), true);
process.env.API_LANES = 'none';   eq('flip off', spendAllowed('studio'), false);

console.log(`\n${pass}/${total} cases passed`);
process.exit(pass === total ? 0 : 1);
