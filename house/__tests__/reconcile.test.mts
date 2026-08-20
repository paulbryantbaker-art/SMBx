/**
 * Register reconcile — behaviour suite.
 *
 * Run: npx tsx house/__tests__/reconcile.test.mts   (npm run test:reconcile)
 *
 * The cases marked WHY-THIS-EXISTS pin the failures the tool was built after:
 * the 2026-08-18 hand run produced THREE false positives by treating a sponsor
 * parenthetical as an alias (Altas/Gridiron/Highview each merged into the
 * platform it owns), and the register/funnel boundary exists because a 225-row
 * research universe once arrived shaped as a drop-in register replacement.
 * Every one of those failure modes must stay a failing test, not a memory.
 */
import {
  applyDecisions, arithmeticCloses, buildNewRow, levenshtein, mapTier,
  nameKey, nameKeyOf, nextOrgId, propose, toQuotedCsv,
  QUEUE_COLUMNS, REGISTER_COLUMNS,
  type AliasPair, type ProposeResult, type QueueRow, type Row,
} from '../reconcile.js';
import { csvRecords } from '../screen.js';

let pass = 0, total = 0;
function is(name: string, got: unknown, want: unknown) {
  total++;
  const ok = JSON.stringify(got) === JSON.stringify(want);
  pass += ok ? 1 : 0;
  console.log(`${ok ? '  ok  ' : ' FAIL '}${name}`);
  if (!ok) console.log(`        got ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`);
}
function ok(name: string, got: unknown) { is(name, Boolean(got), true); }

/* ── fixtures ─────────────────────────────────────────────────────────── */

const DATE = '2026-08-19';
const blank = (): Row => Object.fromEntries(REGISTER_COLUMNS.map(c => [c, ''])) as Row;
const rrow = (over: Record<string, string>): Row => ({ ...blank(), ...over });

const freshRegister = (): Row[] => [
  rrow({ org_id: 'ORG-006', firm: 'Capital Southwest (NASDAQ: CSWC)', city: 'Dallas', state: 'TX', website: 'capitalsouthwest.com', tier: 'A', bucket: 'REFERRAL', notes: 'BDC.', source_url: 'https://a.example/one', verification: '' }),
  rrow({ org_id: 'ORG-039', firm: 'National Fire & Safety (Highview Capital)', tier: 'B', bucket: 'CLIENT', verification: 'VERIFIED' }),
  rrow({ org_id: 'ORG-050', firm: 'Calvetti Ferguson (now Cherry Bekaert)', bucket: 'REFERRAL' }),
  rrow({ org_id: 'ORG-060', firm: 'Genesis Park / GP Capital Partners', bucket: 'CLIENT' }),
  rrow({ org_id: 'ORG-070', firm: 'Texas HVAC services platform (name undisclosed)', bucket: 'CLIENT' }),
  rrow({ org_id: 'ORG-071', firm: 'Monroe Capital', bucket: 'CLIENT' }),
  rrow({ org_id: 'ORG-080', firm: 'Reedy Industries', bucket: 'CLIENT' }),
  rrow({ org_id: 'ORG-090', firm: 'Acme Duct Co', website: 'acmeduct.com', bucket: 'CLIENT' }),
  rrow({ org_id: 'ORG-095', firm: 'KKR', bucket: 'CLIENT' }),
];

const unionCols = (rows: Array<Record<string, string>>): string[] => {
  const cols: string[] = [];
  for (const r of rows) for (const k of Object.keys(r)) if (!cols.includes(k)) cols.push(k);
  return cols;
};

function doPropose(
  cands: Array<Record<string, string>> | null,
  opts: { register?: Row[]; cols?: string[]; aliasPairs?: AliasPair[]; label?: string } = {},
): ProposeResult {
  return propose({
    register: opts.register ?? freshRegister(),
    registerCols: [...REGISTER_COLUMNS],
    registerLabel: '02_organizations.csv',
    candidates: cands === null ? null : { cols: opts.cols ?? unionCols(cands), rows: cands as Row[], label: opts.label ?? 'test-file' },
    aliasPairs: opts.aliasPairs ?? [],
    runDate: DATE,
  });
}
const byOrg = (r: ProposeResult, id: string): Row => r.register.find(x => x.org_id === id)!;

/* ── name keys: the parenthetical is not one thing (spec §5.1) ────────── */

is('ticker strips from the key', nameKey('Capital Southwest (NASDAQ: CSWC)').key, 'capital southwest');
is('…and is classified as a ticker', nameKey('Capital Southwest (NASDAQ: CSWC)').parens[0].meaning, 'ticker');
is('OTCMKTS is a ticker too (alternation order matters)', nameKey('X Y (OTCMKTS: XY)').parens[0].meaning, 'ticker');
is('rebrand parenthetical is a LIVE alias — it is the current name',
  nameKey('Calvetti Ferguson (now Cherry Bekaert)').aliasKeys, ['cherry bekaert']);
is('sponsor/parent parenthetical is NOT an alias', nameKey('National Fire & Safety (Highview Capital)').aliasKeys, []);
is('…but it is kept as classified data', nameKey('National Fire & Safety (Highview Capital)').parens[0].meaning, 'sponsor-or-parent');
is('redaction can never carry a key', nameKey('Texas HVAC services platform (name undisclosed)').key, '');
ok('…and is flagged redacted', nameKey('Texas HVAC services platform (name undisclosed)').redacted);
is('mid-string parenthetical is an expansion alias',
  nameKey('A.R.I. (Applied Real Intelligence) Senior Secured Fund').parens[0].meaning, 'expansion');
is('…whose primary key drops it', nameKey('A.R.I. (Applied Real Intelligence) Senior Secured Fund').key, 'a r i senior secured fund');
is('slash form: primary is the first part', nameKey('Genesis Park / GP Capital Partners').key, 'genesis park');
is('slash form: the rest are aliases', nameKey('Genesis Park / GP Capital Partners').aliasKeys, ['gp capital partners']);
is('legal suffixes strip iteratively', nameKeyOf('Reedy Industries, LLC'), 'reedy industries');
is('dotted legal suffixes strip too', nameKeyOf('Acme Fire, L.L.C.'), 'acme fire');
is('Holdings/Group/Partners/Capital/Management do NOT strip — they distinguish real firms',
  nameKeyOf('Serata Capital Partners'), 'serata capital partners');
is('HTML entities fold (norm is shared with screen.ts)', nameKeyOf('PARKER &amp; SONS LLC'), 'parker sons');

is('tier maps 1→A · 2→B · 3→C', [mapTier('1').tier, mapTier('2').tier, mapTier('3').tier], ['A', 'B', 'C']);
is('tier A/B/C passes through', mapTier('b').tier, 'B');
ok('an unmappable tier is named, never guessed', mapTier('7').note!.includes('"7"'));
is('levenshtein basics', [levenshtein('monroe capital', 'monroe capital'), levenshtein('monroe capital', 'monroe capitel'), levenshtein('abc', 'xyz', 2)], [0, 1, 3]);
is('next org id continues the sequence, zero-padded', nextOrgId([{ org_id: 'ORG-007' }, { org_id: 'ORG-154' }]), 'ORG-155');
is('next org id never reuses a retired id (max+1, not gap-fill)', nextOrgId([{ org_id: 'ORG-001' }, { org_id: 'ORG-009' }]), 'ORG-010');

/* ── the ladder, against the real cases (spec §11) ────────────────────── */

{ // Capital Southwest (NASDAQ: CSWC) ↔ Capital Southwest → MATCHED, ticker strip
  const r = doPropose([{ firm: 'Capital Southwest', verification: 'VERIFIED', notes: 'New fund closed.', source_key: 'P9-001' }]);
  is('ticker-decorated register row matches its bare candidate', r.counts.matched, 1);
  is('…on the name-only tier (register has the domain, candidate does not)', r.counts.matchedBy['name-only'], 1);
  is('…and the register keeps its decorated firm string — decoration is data', byOrg(r, 'ORG-006').firm, 'Capital Southwest (NASDAQ: CSWC)');
  is('notes APPEND with dated provenance, existing text verbatim',
    byOrg(r, 'ORG-006').notes, 'BDC.\n[2026-08-19 test-file / P9-001] New fund closed.');
  // idempotence: the same candidate re-run against the merged register must not stutter
  const r2 = doPropose([{ firm: 'Capital Southwest', verification: 'VERIFIED', notes: 'New fund closed.', source_key: 'P9-001' }], { register: r.register });
  is('re-running the same candidate appends nothing twice', byOrg(r2, 'ORG-006').notes, byOrg(r, 'ORG-006').notes);
  // …including on a LATER day: the tag carries the date, so dedupe must key on
  // source + content, or every re-run stamps the same note with a fresh date
  // (caught driving the sandbox, 2026-08-19).
  const r3 = propose({
    register: r.register, registerCols: [...REGISTER_COLUMNS], registerLabel: '02_organizations.csv',
    candidates: { cols: ['firm', 'verification', 'notes', 'source_key'], rows: [{ firm: 'Capital Southwest', verification: 'VERIFIED', notes: 'New fund closed.', source_key: 'P9-001' }], label: 'test-file' },
    aliasPairs: [], runDate: '2026-08-21',
  });
  is('…nor on a later run date', byOrg(r3, 'ORG-006').notes, byOrg(r, 'ORG-006').notes);
}

{ // domain+name tier when both sides carry the domain
  const r = doPropose([{ firm: 'Capital Southwest', website: 'https://www.capitalsouthwest.com/', verification: 'VERIFIED' }]);
  is('domain+name fires when both align', r.counts.matchedBy['domain+name'], 1);
}

{ // Calvetti Ferguson (now Cherry Bekaert) ↔ Cherry Bekaert → MATCHED via alias
  const r = doPropose([{ firm: 'Cherry Bekaert', verification: 'VERIFIED' }]);
  is('rebrand: the current name MATCHES the row instead of creating a new one', r.counts.matchedBy['alias'], 1);
  is('…and no row was minted', r.counts.registerOut, r.counts.registerIn);
  ok('…while the differing firm string is held as a CONFLICT, not silently refreshed',
    r.queue.some(q => q.kind === 'CONFLICT' && q.reason === 'firm' && q.register_org_id === 'ORG-050'));
}

{ // Genesis Park / GP Capital Partners ↔ GP Capital Partners → MATCHED via alias
  const r = doPropose([{ firm: 'GP Capital Partners', verification: 'VERIFIED' }]);
  is('slash form matches either half', r.counts.matchedBy['alias'], 1);
}

{ // WHY-THIS-EXISTS: the sponsor trap. On 2026-08-18 "(Highview Capital)"
  // treated as an alias merged the sponsor into the platform it owns — three
  // times. The sponsor must come out of the key and NEVER match as one.
  const r = doPropose([{ firm: 'Highview Capital', verification: 'VERIFIED' }]);
  is('a sponsor never matches the platform that carries it in a parenthetical', r.counts.newTotal, 1);
  is('…it is appended as its own entity', r.counts.appended, 1);
  is('…and the platform row is untouched', byOrg(r, 'ORG-039').firm, 'National Fire & Safety (Highview Capital)');
  const bare = doPropose([{ firm: 'National Fire & Safety', verification: 'VERIFIED' }]);
  is('…while the platform’s own bare name still matches its decorated row', bare.counts.matchedBy['name-only'], 1);
  const dec = doPropose([{ firm: 'National Fire & Safety (Highview Capital)', verification: 'VERIFIED' }]);
  is('a decorated candidate matches the decorated row', dec.counts.matched, 1);
  ok('…and the sponsor survives as DATA — an ALIAS_PROPOSAL naming sponsor_parent, never a silent merge key',
    dec.queue.some(q => q.kind === 'ALIAS_PROPOSAL' && q.reason === 'sponsor-or-parent' && q.confidence_note.includes('sponsor_parent=Highview Capital')));
}

{ // Texas HVAC services platform (name undisclosed) → UNMATCHABLE, never merges
  const r = doPropose([{ firm: 'Dallas plumbing platform (name undisclosed)', verification: 'VERIFIED' }]);
  is('a redaction is UNMATCHABLE', r.counts.unmatchable, 1);
  is('…and never appends or merges', [r.counts.appended, r.counts.merged], [0, 0]);
  ok('…and lands in the queue by name', r.queue.some(q => q.kind === 'UNMATCHABLE' && q.reason === 'redaction'));
  ok('the register’s own redacted row is named in the log every run', r.log.includes('ORG-070'));
}

{ // Monroe Capital ↔ Monroe Capital Partners → AMBIGUOUS, never auto-merged
  const r = doPropose([{ firm: 'Monroe Capital Partners', verification: 'VERIFIED' }]);
  is('token containment goes to review', r.counts.ambiguous, 1);
  ok('…on the T6 tier', r.queue.some(q => q.kind === 'AMBIGUOUS' && q.match_tier === 'token-containment'));
  is('…and the register is not written at all', [r.counts.appended, r.counts.merged, r.counts.registerOut], [0, 0, r.counts.registerIn]);
}

{ // same domain, different names → AMBIGUOUS possible-rebrand
  const r = doPropose([{ firm: 'Zephyr Mechanical', website: 'https://www.acmeduct.com/', verification: 'VERIFIED' }]);
  ok('possible-rebrand: the case the whole system exists to catch',
    r.queue.some(q => q.kind === 'AMBIGUOUS' && q.match_tier === 'possible-rebrand' && q.register_org_id === 'ORG-090'));
}

{ // same name, two different domains → AMBIGUOUS
  const r = doPropose([{ firm: 'Acme Duct', website: 'acmeduct.io', verification: 'VERIFIED' }]);
  ok('same-name-two-domains goes to review',
    r.queue.some(q => q.match_tier === 'same-name-two-domains' && q.register_org_id === 'ORG-090'));
}

{ // T7 near-miss: can move a row NEW → review, never review → merged
  const r = doPropose([{ firm: 'Monroe Capitel', verification: 'VERIFIED' }]);
  ok('edit distance ≤ 2 sends the row to review', r.queue.some(q => q.match_tier === 'near-miss'));
  is('…the INVARIANT: T7 never merges — matched stays 0, register unwritten',
    [r.counts.matched, r.counts.appended, r.counts.merged], [0, 0, 0]);
}

{ // short keys: exact tiers only, then NAMED — never silently admitted as NEW
  const r = doPropose([{ firm: 'ARS', verification: 'VERIFIED' }]);
  is('a sub-5-char key that matches nothing is UNMATCHABLE, not NEW', r.counts.unmatchable, 1);
  ok('…named with its key', r.queue.some(q => q.reason === 'short-key' && q.confidence_note.includes('"ars"')));
  const kkr = doPropose([{ firm: 'KKR', verification: 'VERIFIED' }]);
  is('…but a short key still matches EXACTLY (KKR is a real firm)', kkr.counts.matchedBy['name-only'], 1);
}

/* ── the alias map: Reedy Industries vs PremiStar must not mint two entities ── */

{
  const control = doPropose([{ firm: 'PremiStar', verification: 'VERIFIED', sponsor_parent: 'Partners Group', tier: '2' }]);
  is('without the map, a rename reads as NEW (the disease)', control.counts.newTotal, 1);

  const map: AliasPair[] = [['PremiStar', 'Reedy Industries']];
  const r = doPropose([{ firm: 'PremiStar', verification: 'VERIFIED', sponsor_parent: 'Partners Group', tier: '2' }], { aliasPairs: map });
  is('WHY-THIS-EXISTS: with the alias map, the rename MATCHES its register row', r.counts.matchedBy['alias'], 1);
  is('…no second entity is minted', r.counts.registerOut, r.counts.registerIn);
  is('…facts merge into the existing row', byOrg(r, 'ORG-080').sponsor_parent, 'Partners Group');
  is('…empty register tier fills from the candidate, mapped 2→B', byOrg(r, 'ORG-080').tier, 'B');

  const both = doPropose([
    { firm: 'PremiStar', verification: 'VERIFIED' },
    { firm: 'Reedy Industries', verification: 'VERIFIED' },
  ], { aliasPairs: map });
  is('both names in one file still resolve to ONE entity', [both.counts.matched, both.counts.registerOut - both.counts.registerIn], [2, 0]);
}

{ // in-file duplicates: the live index folds the second row into the first append
  const r = doPropose([
    { firm: 'Zeta Fire Protection LLC', verification: 'VERIFIED', city: 'Austin' },
    { firm: 'Zeta Fire Protection', verification: 'VERIFIED', state: 'TX' },
  ]);
  is('two spellings of one new firm mint ONE row', r.counts.appended, 1);
  is('…the second merges into the first’s fresh org_id', r.counts.matched, 1);
  const added = r.register[r.register.length - 1];
  is('…and both rows’ facts land on it', [added.city, added.state], ['Austin', 'TX']);
}

/* ── merge policy (spec §6) ───────────────────────────────────────────── */

{
  const r = doPropose([{ firm: 'Capital Southwest', verification: 'VERIFIED', city: '', state: '', website: '' }]);
  is('a blank candidate cell never erases a populated register cell',
    [byOrg(r, 'ORG-006').city, byOrg(r, 'ORG-006').website], ['Dallas', 'capitalsouthwest.com']);
}

{
  const r = doPropose([{ register_match: 'ORG-006', firm: 'Capital SW Holdings', verification: 'VERIFIED', tier: '3' }]);
  is('T0: an explicit register_match matches regardless of the name', r.counts.matchedBy['source_key'], 1);
  is('org_id is NEVER reassigned on a merge', byOrg(r, 'ORG-006').org_id, 'ORG-006');
  is('tier: the existing value wins, always (the app’s after a re-score)', byOrg(r, 'ORG-006').tier, 'A');
  ok('…a differing firm string on an id-match is a CONFLICT', r.queue.some(q => q.kind === 'CONFLICT' && q.reason === 'firm'));
}

{
  const r = doPropose([{ firm: 'Capital Southwest', verification: 'VERIFIED', primary_source_url: 'https://b.example/two' }],
    { cols: ['firm', 'verification', 'primary_source_url'] });
  is('source_url: new wins', byOrg(r, 'ORG-006').source_url, 'https://b.example/two');
  ok('…and the old one is preserved as a dated notes line',
    byOrg(r, 'ORG-006').notes!.includes('prior source_url (2026-08-19): https://a.example/one'));
}

{
  const r = doPropose([{ firm: 'Capital Southwest', verification: 'VERIFIED', city: 'Fort Worth' }]);
  is('a MATCHED row can still hold fields for review — do not collapse it', [r.counts.matched, r.counts.conflicts], [1, 1]);
  is('…the register keeps its value until adjudicated', byOrg(r, 'ORG-006').city, 'Dallas');
  ok('…and the conflict names both sides', r.queue.some(q =>
    q.kind === 'CONFLICT' && q.reason === 'city' && q.confidence_note.includes('Dallas') && q.confidence_note.includes('Fort Worth')));
}

{ // WHY-THIS-EXISTS: bucket must never silently flip — mis-bucketing is how a
  // do-not-pitch firm gets pitched.
  const reg = freshRegister();
  reg[5].bucket = 'ECOSYSTEM_DO_NOT_PITCH'; // Monroe Capital
  const r = doPropose([{ firm: 'Monroe Capital', verification: 'VERIFIED', bucket: 'CLIENT' }], { register: reg });
  is('a bucket disagreement is held, not refreshed', byOrg(r, 'ORG-071').bucket, 'ECOSYSTEM_DO_NOT_PITCH');
  ok('…as a CONFLICT queue row', r.queue.some(q => q.kind === 'CONFLICT' && q.reason === 'bucket'));
}

/* ── the funnel dialect and header guards (spec §9) ───────────────────── */

{
  const cols = ['account_name', 'account_type', 'hq_city', 'hq_state', 'website_domain', 'fund_or_aum', 'verification', 'primary_source_url', 'notes', 'tier', 'source_key', 'zzz_mystery'];
  const r = doPropose([{
    account_name: 'Bluebonnet Capital', account_type: 'P2_FAMILY_OFFICE', hq_city: 'Plano', hq_state: 'TX',
    website_domain: 'bluebonnet.example', fund_or_aum: '$100M', verification: 'VERIFIED',
    primary_source_url: 'https://bluebonnet.example/about', notes: 'Own site read.', tier: '1', source_key: 'P2-099', zzz_mystery: 'x',
  }], { cols });
  is('the funnel dialect maps onto register columns', r.counts.appended, 1);
  const added = r.register[r.register.length - 1];
  is('…account_name→firm, hq_*→city/state, website_domain→website, fund_or_aum→aum_or_fund_size, primary_source_url→source_url',
    [added.firm, added.city, added.state, added.website, added.aum_or_fund_size, added.source_url],
    ['Bluebonnet Capital', 'Plano', 'TX', 'bluebonnet.example', '$100M', 'https://bluebonnet.example/about']);
  is('…tier 1 maps to A on a NEW row', added.tier, 'A');
  is('…org_id continues the register sequence', added.org_id, 'ORG-096');
  ok('an unknown header is NAMED and warned, never refused (spec §9.3)',
    r.ok && r.warnings.some(w => w.includes('zzz_mystery')));
  ok('bucket defaulted to CLIENT is NAMED in the log — a blank imports app-side as acquirer',
    added.bucket === 'CLIENT' && r.log.includes('bucket defaulted to CLIENT'));
}

{
  const r = doPropose([{ company: 'No Firm Header Inc' }], { cols: ['company'] });
  is('a candidate file without a firm header is a REFUSAL, not a skip', [r.ok, r.exitCode], [false, 2]);
}

{
  const dangling = doPropose([{ firm: 'Ghost Row', register_match: 'ORG-999', verification: 'VERIFIED' }]);
  ok('a dangling register_match goes to review, not to a guess',
    dangling.queue.some(q => q.reason === 'register-match-dangling'));
  // The live funnel writes register_match as "ORG-006 | Display Name" — the id
  // leads, the name rides along (measured in candidates.csv, 2026-08-19).
  const decorated = doPropose([{ firm: 'Capital Southwest', register_match: 'ORG-006 | Capital Southwest (NASDAQ: CSWC)', verification: 'VERIFIED' }]);
  is('register_match in the funnel’s "ORG-NNN | name" form still matches T0', decorated.counts.matchedBy['source_key'], 1);
}

/* ── the verification boundary (requirement §9 addition + row-universe law) ── */

{
  const reg = freshRegister();
  reg[1].verification = 'DISCOVERY';
  const r = doPropose([{ firm: 'Anything', verification: 'VERIFIED' }], { register: reg });
  is('a register row that is neither VERIFIED nor blank REFUSES the whole run', [r.ok, r.exitCode], [false, 2]);
  ok('…naming the row', r.refusals[0].includes('ORG-039'));
  is('…and the register comes back untouched (nothing to write)', r.register, reg);
}

{
  const r = doPropose([
    { firm: 'Some Discovery Fund', verification: 'DISCOVERY' },
    { firm: 'Capital Southwest', verification: 'DISCOVERY', notes: 'should not land' },
    { firm: 'Blank Verification Co', verification: '' },
  ]);
  is('not-VERIFIED candidates are computed but HELD — promotion is the verification act',
    [r.counts.held, r.counts.appended, r.counts.merged], [3, 0, 0]);
  is('…counted by value', r.counts.heldBy, { DISCOVERY: 2, '(blank)': 1 });
  ok('…named in the log', r.log.includes('Held — not VERIFIED') && r.log.includes('Some Discovery Fund'));
  ok('…and a held MATCH writes nothing', !byOrg(r, 'ORG-006').notes!.includes('should not land'));
}

{
  const r = doPropose([{ firm: 'Hand Curated Fund' }], { cols: ['firm'] });
  is('a file with NO verification column admits rows (blank verification)', r.counts.appended, 1);
  ok('…and says so out loud', r.warnings.some(w => w.includes('no verification column')));
}

/* ── refusals: duplicates, arithmetic, and writes-nothing (spec §9) ───── */

{
  const reg = freshRegister();
  reg.push(rrow({ org_id: 'ORG-006', firm: 'Duplicate Id Co' }));
  const r = doPropose([{ firm: 'x', verification: 'VERIFIED' }], { register: reg });
  is('duplicate org_id refuses — the join key is already broken', [r.ok, r.exitCode], [false, 2]);
}
{
  const reg = freshRegister();
  reg.push(rrow({ org_id: 'ORG-200', firm: 'Monroe Capital, LLC' }));
  const r = doPropose([{ firm: 'x', verification: 'VERIFIED' }], { register: reg });
  ok('duplicate stripped-name key refuses — fix the register before merging into it',
    !r.ok && r.refusals.some(x => x.includes('monroe capital')));
}
{
  const r = doPropose([{ firm: 'x', verification: 'VERIFIED' }], { register: [] });
  is('an empty register refuses', [r.ok, r.exitCode], [false, 2]);
}
{
  ok('the closing arithmetic — the single line this tool exists for',
    arithmeticCloses({ candidatesIn: 4, matched: 1, newTotal: 1, ambiguous: 1, unmatchable: 1 } as never));
  ok('…and a dropped row fails it',
    !arithmeticCloses({ candidatesIn: 5, matched: 1, newTotal: 1, ambiguous: 1, unmatchable: 1 } as never));
  const r = doPropose([
    { firm: 'Capital Southwest', verification: 'VERIFIED' },
    { firm: 'Monroe Capital Partners', verification: 'VERIFIED' },
    { firm: 'ARS', verification: 'VERIFIED' },
    { firm: 'Fresh New Fund', verification: 'VERIFIED' },
    { firm: 'Held Fund', verification: 'DISCOVERY' },
  ]);
  is('a real run closes: matched + new + ambiguous + unmatchable == candidates in',
    r.counts.matched + r.counts.newTotal + r.counts.ambiguous + r.counts.unmatchable, r.counts.candidatesIn);
  ok('…and the log prints the closure', r.log.includes('arithmetic closes'));
}

{ // propose never mutates its inputs — the CLI writes only what it is handed back
  const reg = freshRegister();
  const before = JSON.stringify(reg);
  doPropose([{ firm: 'Capital Southwest', verification: 'VERIFIED', notes: 'mutation probe' }], { register: reg });
  is('propose works on a copy — the caller’s rows are untouched', JSON.stringify(reg), before);
}

/* ── exit codes: 0 clean · 1 findings · 2 cannot-run ──────────────────── */

{
  const clean = doPropose([{ firm: 'Capital Southwest', verification: 'VERIFIED' }]);
  is('a run with nothing to adjudicate exits 0', clean.exitCode, 0);
  const findings = doPropose([{ firm: 'Monroe Capital Partners', verification: 'VERIFIED' }]);
  is('a run with a review queue exits 1', findings.exitCode, 1);
  const refused = doPropose([{ company: 'x' }], { cols: ['company'] });
  is('a refusal exits 2', refused.exitCode, 2);
}

/* ── run 0: the alias backfill (spec §10) ─────────────────────────────── */

{
  const r = doPropose(null);
  is('run 0 never writes the register', r.counts.registerOut, r.counts.registerIn);
  const reasons = r.queue.map(q => q.reason);
  ok('…proposes the ticker', reasons.includes('ticker'));
  ok('…the sponsor/parent (with the false-positive warning)',
    r.queue.some(q => q.reason === 'sponsor-or-parent' && q.confidence_note.includes('false positives')));
  ok('…the rebrand as the CURRENT name', r.queue.some(q => q.reason === 'rebrand' && q.confidence_note.includes('alias:Cherry Bekaert')));
  ok('…and the slash form', r.queue.some(q => q.reason === 'slash-form' && q.confidence_note.includes('GP Capital Partners')));
  ok('…each anchored to its register row', r.queue.every(q => q.register_org_id.startsWith('ORG-')));
  is('…and exits 1: proposals are findings to adjudicate', r.exitCode, 1);
  ok('contacts scope is logged on run 0 too', r.log.includes('contacts: not reconciled (v1 scope)'));
}

/* ── apply (spec §4/§7) ───────────────────────────────────────────────── */

const qrow = (over: Partial<QueueRow>): QueueRow => ({
  queue_id: 'RQ-001', kind: 'AMBIGUOUS', reason: '', candidate_firm: '', candidate_domain: '',
  candidate_row_json: '', register_org_id: '', register_firm: '', register_domain: '',
  match_tier: '', confidence_note: '', decision: '', decided_by: '', decided_on: '', ...over,
});
function doApply(queue: QueueRow[], register = freshRegister()) {
  return applyDecisions({ register, registerCols: [...REGISTER_COLUMNS], queue, runDate: DATE });
}

{
  const r = doApply([qrow({ decision: 'obliterate' })]);
  is('an unrecognised decision token refuses', [r.ok, r.exitCode], [false, 2]);
  ok('…naming the row and the token', r.refusals[0].includes('RQ-001') && r.refusals[0].includes('obliterate'));
}
{
  const r = doApply([qrow({ decision: 'merge:ORG-999', candidate_row_json: JSON.stringify({ firm: 'X', verification: 'VERIFIED' }) })]);
  ok('merge naming a row that does not exist refuses', !r.ok && r.refusals[0].includes('ORG-999'));
}
{
  const bad = doApply([
    qrow({ decision: 'obliterate' }),
    qrow({ queue_id: 'RQ-002', decision: 'merge:ORG-006', candidate_row_json: JSON.stringify({ firm: 'Capital Southwest', verification: 'VERIFIED', notes: 'should not land' }) }),
  ]);
  ok('one bad token refuses the WHOLE apply — nothing is half-written',
    !bad.ok && !bad.register.some(x => (x.notes || '').includes('should not land')));
}
{
  const r = doApply([qrow({
    decision: 'merge:ORG-071', register_org_id: 'ORG-071',
    candidate_row_json: JSON.stringify({ firm: 'Monroe Capital Partners', verification: 'VERIFIED', city: 'Chicago', source_key: 'P1-055' }),
  })]);
  is('merge: adopts candidate facts under §6', r.register.find(x => x.org_id === 'ORG-071')!.city, 'Chicago');
  is('…and exits 0 when everything decided applied cleanly', r.exitCode, 0);
  // An explicit merge IS the adjudication, so a held identity field adopts…
  const reg2 = freshRegister();
  const adopted = applyDecisions({
    register: reg2, registerCols: [...REGISTER_COLUMNS], runDate: DATE,
    queue: [qrow({ decision: 'merge:ORG-006', register_org_id: 'ORG-006', candidate_row_json: JSON.stringify({ firm: 'Capital SW Group', verification: 'VERIFIED', city: 'Fort Worth' }) })],
  });
  is('an adjudicated merge ADOPTS a held identity field (propose only proposes)',
    adopted.register.find(x => x.org_id === 'ORG-006')!.city, 'Fort Worth');
  is('…but NEVER the firm string — the app row is keyed to it (COLUMNS.md)',
    adopted.register.find(x => x.org_id === 'ORG-006')!.firm, 'Capital Southwest (NASDAQ: CSWC)');
  ok('…and says so in the applied line', adopted.applied[0].includes('firm string kept'));
}
{
  const r = doApply([qrow({ decision: 'new', candidate_row_json: JSON.stringify({ firm: 'KKR', verification: 'VERIFIED', tier: '2' }) })]);
  // register already has ORG-095 KKR — the exact-key guard makes re-applies idempotent
  ok('new on a firm already present is an idempotent no-op, not a duplicate',
    r.register.length === freshRegister().length && r.applied[0].includes('already present as ORG-095'));
  const fresh = doApply([qrow({ decision: 'new', candidate_row_json: JSON.stringify({ firm: 'Brand New Fund', verification: 'VERIFIED', tier: '3' }) })]);
  is('new appends with the next org_id and the mapped tier',
    [fresh.register[fresh.register.length - 1].org_id, fresh.register[fresh.register.length - 1].tier], ['ORG-096', 'C']);
}
{
  const r = doApply([qrow({ decision: 'new', candidate_row_json: JSON.stringify({ firm: 'Unverified Fund', verification: 'DISCOVERY' }) })]);
  is('a human decision does not override the register law — DISCOVERY is HELD, named, exit 1',
    [r.register.length === freshRegister().length, r.held.length, r.exitCode], [true, 1, 1]);
}
{
  const r = doApply([qrow({ decision: 'disqualify', register_org_id: 'ORG-071' })]);
  const row = r.register.find(x => x.org_id === 'ORG-071')!;
  is('disqualify flips an existing row to ECOSYSTEM_DO_NOT_PITCH', row.bucket, 'ECOSYSTEM_DO_NOT_PITCH');
  ok('…with the change recorded in notes', (row.notes || '').includes('ECOSYSTEM_DO_NOT_PITCH'));
  const app = doApply([qrow({ decision: 'disqualify', candidate_row_json: JSON.stringify({ firm: 'Pye-Barker Fire & Safety', verification: 'VERIFIED' }) })]);
  is('…and appends a protective row when there is no register target',
    app.register[app.register.length - 1].bucket, 'ECOSYSTEM_DO_NOT_PITCH');
}
{
  const r = doApply([qrow({ decision: 'alias:PremiStar', register_org_id: 'ORG-080' })]);
  is('alias: records the text pipe-separated on the row (spec §10)',
    r.register.find(x => x.org_id === 'ORG-080')!.aliases, 'PremiStar');
  ok('…adding the aliases column to the header', r.registerCols.includes('aliases'));
  const again = applyDecisions({ register: r.register, registerCols: r.registerCols, queue: [qrow({ decision: 'alias:PremiStar', register_org_id: 'ORG-080' })], runDate: DATE });
  is('…idempotently', again.register.find(x => x.org_id === 'ORG-080')!.aliases, 'PremiStar');
  const nextRun = doPropose([{ firm: 'PremiStar', verification: 'VERIFIED' }], { register: r.register });
  is('…and the recorded alias is LIVE on the next propose — no map file needed any more',
    nextRun.counts.matchedBy['alias'], 1);
}
{
  const r = doApply([qrow({ decision: '' }), qrow({ queue_id: 'RQ-002', decision: 'skip' })]);
  is('an empty decision is not an error — it is left, and skip re-raises next run',
    [r.ok, r.undecided, r.skipped.length, r.register.length === freshRegister().length], [true, 1, 1, true]);
  is('…but unfinished adjudication is still a finding (exit 1)', r.exitCode, 1);
}

/* ── serialization: the register’s own shape survives a round trip ────── */

{
  const rows: Row[] = [
    { org_id: 'ORG-001', firm: 'Comma, Inc', notes: 'line one\nline "two", quoted' },
    { org_id: 'ORG-002', firm: 'Plain Co', notes: '' },
  ];
  const text = toQuotedCsv(['org_id', 'firm', 'notes'], rows);
  ok('every field is quoted — matching the live register’s style', text.startsWith('"org_id","firm","notes"'));
  const back = csvRecords(text);
  is('embedded commas, quotes and newlines round-trip exactly',
    [back[1][1], back[1][2]], ['Comma, Inc', 'line one\nline "two", quoted']);
}

console.log(`\n${pass}/${total} correct`);
process.exit(pass === total ? 0 : 1);
