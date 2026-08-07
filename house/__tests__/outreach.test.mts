/**
 * Outreach pure core — behaviour suite.
 *
 * Run: npx tsx house/__tests__/outreach.test.mts
 *
 * Why this file exists: parseTargets decides WHO gets queued and
 * renderTemplate decides WHAT the send gate allows. A silent mis-parse
 * queues the wrong Tier A contact; a silently blanked research field sends
 * "congratulations on ." to a fund manager. Both are confident wrong answers,
 * so every shape in the real 2026-08-05 plan data appears here verbatim.
 */
import {
  parseTargets, expandRange, RANGE_CAP,
  mergeContext, renderTemplate, unescapeBody, hasUnresolved,
} from '../outreach.js';

let pass = 0, total = 0;
function is(name: string, got: unknown, want: unknown) {
  total++;
  const ok = JSON.stringify(got) === JSON.stringify(want);
  pass += ok ? 1 : 0;
  console.log(`${ok ? '  ok  ' : ' FAIL '}${name}`);
  if (!ok) console.log(`        got ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`);
}
function ok(name: string, cond: boolean) { is(name, cond, true); }

/* ── parseTargets: every shape in the real plan ───────────────────────── */

is('single id', parseTargets('REF-015'), [{ kind: 'id', id: 'REF-015' }]);
is('comma ids', parseTargets('IS-001, IS-004, IS-007'), [
  { kind: 'id', id: 'IS-001' }, { kind: 'id', id: 'IS-004' }, { kind: 'id', id: 'IS-007' },
]);
is('semicolon mix — EVT-001, EVT-002', parseTargets('EVT-001, EVT-002'), [
  { kind: 'id', id: 'EVT-001' }, { kind: 'id', id: 'EVT-002' },
]);
is('range + ids (the EVT-001 target cell)', parseTargets('REF-001 through REF-015; OPR-002; FO-004'), [
  { kind: 'range', prefix: 'REF', from: 1, to: 15 },
  { kind: 'id', id: 'OPR-002' },
  { kind: 'id', id: 'FO-004' },
]);
is('segment selector — two segments', parseTargets('All IND_SPONSOR and CAPITAL_EQUITY records'), [
  { kind: 'segment', segments: ['IND_SPONSOR', 'CAPITAL_EQUITY'] },
]);
is('segment selector — one segment, singular "record"', parseTargets('All FAMILY_OFFICE record'), [
  { kind: 'segment', segments: ['FAMILY_OFFICE'] },
]);
is('lowercase id normalises up', parseTargets('cap-001'), [{ kind: 'id', id: 'CAP-001' }]);
is('empty cell', parseTargets(''), []);
is('null cell', parseTargets(null), []);
is('prose lands as unknown, not dropped', parseTargets('Whoever seems relevant'), [
  { kind: 'unknown', raw: 'Whoever seems relevant' },
]);
is('mismatched range prefixes are unknown, never a guess',
  parseTargets('REF-001 through CAP-015'), [{ kind: 'unknown', raw: 'REF-001 through CAP-015' }]);
is('inverted range is unknown', parseTargets('REF-015 through REF-001'),
  [{ kind: 'unknown', raw: 'REF-015 through REF-001' }]);
is('"to" works as range word', parseTargets('FO-001 to FO-003'),
  [{ kind: 'range', prefix: 'FO', from: 1, to: 3 }]);

is('range expands zero-padded', expandRange({ prefix: 'REF', from: 1, to: 3 }), ['REF-001', 'REF-002', 'REF-003']);
is('range beyond cap expands to nothing (flood guard)',
  expandRange({ prefix: 'X', from: 1, to: RANGE_CAP + 2 }), []);

/* ── template merge: honest fills, honest refusals ────────────────────── */

const acct = { firm: 'Align Collaborate', hq_city: 'Dallas', hq_state: 'TX', segment: 'CAPITAL_EQUITY', trades: null };
const person = { name: 'Grant Kornman', title: 'Co-Founder / Partner' };

is('mergeContext first name', mergeContext(acct, person).first_name, 'Grant');
is('mergeContext no contact → null names', mergeContext(acct, null).first_name, null);

const t1 = renderTemplate(
  'DFW trades register — for {firm}',
  '{first_name} — congratulations on {recent_fund_or_deal}.\\n\\nMore soon.',
  mergeContext(acct, person),
);
is('known fields merge', t1.subject, 'DFW trades register — for Align Collaborate');
ok('body merges name and keeps research field IN PLACE',
  t1.body.startsWith('Grant — congratulations on {recent_fund_or_deal}.'));
is('unresolved names the research field', t1.unresolved, ['recent_fund_or_deal']);
ok('escaped \\n became a real blank line', t1.body.includes('.\n\nMore soon.'));

const t2 = renderTemplate('Hi {first_name}', 'For {firm} in {city}, {state}.', mergeContext(acct, person));
is('fully resolvable → empty unresolved', t2.unresolved, []);
ok('send gate: resolved body passes', !hasUnresolved(t2.body));
ok('send gate: unresolved body blocks', hasUnresolved(t1.body));

/* An EMPTY string counts as unresolved — a contact with name "" must not
   silently render "Hi ," (the confident wrong answer this file exists for). */
const t3 = renderTemplate('Hi {first_name}', 'x', mergeContext(acct, { name: '', title: null }));
is('empty context value is unresolved, not blank', t3.unresolved, ['first_name']);

is('unescapeBody leaves real newlines alone', unescapeBody('a\nb'), 'a\nb');

console.log(`\n${pass}/${total} passed`);
if (pass !== total) process.exit(1);
