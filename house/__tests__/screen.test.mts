/**
 * Target screening — behaviour suite.
 *
 * Run: npx tsx house/__tests__/screen.test.mts
 *
 * Why this file exists: `rank` writes the word "independent" next to a company
 * name, and somebody acts on that. The expensive error is not a missed target —
 * it is a false independent, which sends a client into diligence on a business
 * that a sponsor already owns. So the matching rules get pinned here, including
 * the ones that exist to stop a confident wrong answer.
 */
import {
  parseRegister, classify, normDomain, parseBenchmarks, parseEmployeeRules,
  revenueBand, score, parseCsv, toCsv, COLUMNS,
  type Candidate, type Screen,
} from '../screen.js';

let pass = 0, total = 0;
function is(name: string, got: unknown, want: unknown) {
  total++;
  const ok = JSON.stringify(got) === JSON.stringify(want);
  pass += ok ? 1 : 0;
  console.log(`${ok ? '  ok  ' : ' FAIL '}${name}`);
  if (!ok) console.log(`        got ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`);
}

/* ── the register ─────────────────────────────────────────────────────── */

const REG_MD = `# Consolidators — home services

## Neighborly
backer: KKR
brands: Aire Serv, Mr. Rooter, Mr. Electric
domains: neighborly.com, aireserv.com

## Wrench Group
backer: Leonard Green
brands: Parker & Sons, Coolray
domains: wrenchgroup.com
`;
const REG = parseRegister(REG_MD);

is('register parses both platforms', REG.length, 2);
is('backer carried', REG[0].backer, 'KKR');
is('parent name is itself a matchable brand', REG[0].brands[0], 'Neighborly');
is('brands parsed', REG[1].brands.includes('Parker & Sons'), true);
is('domains normalized', REG[0].domains, ['neighborly.com', 'aireserv.com']);

is('normDomain strips scheme/www/path', normDomain('https://www.Example.com/about?x=1'), 'example.com');
is('normDomain strips port', normDomain('http://example.com:8080'), 'example.com');

/* ── classification ───────────────────────────────────────────────────── */

const C = (o: Partial<Candidate>): Candidate => o as Candidate;
const cls = (o: Partial<Candidate>, reg = REG) => classify(C(o), reg);

is('franchise location matched by brand in the name',
  cls({ name: 'Mr. Rooter Plumbing of Phoenix' }).affiliation, 'affiliated');
is('…and names which platform',
  cls({ name: 'Mr. Rooter Plumbing of Phoenix' }).affiliatedTo, 'Neighborly');
is('…with the evidence spelled out',
  cls({ name: 'Mr. Rooter Plumbing of Phoenix' }).evidence, 'name contains "Mr. Rooter"');
is('punctuation and case do not hide a brand',
  cls({ name: 'PARKER & SONS' }).affiliation, 'affiliated');
is('an HTML-entity ampersand does not hide a brand either',
  cls({ name: 'PARKER &amp; SONS' }).affiliation, 'affiliated');
is('subdomain of a registered domain is still the platform',
  cls({ name: 'Valley Air', website: 'https://phoenix.aireserv.com' }).affiliation, 'affiliated');
is('domain beats name — checked first',
  cls({ name: 'Valley Air', website: 'wrenchgroup.com' }).affiliatedTo, 'Wrench Group');
is('an unlisted operator is independent',
  cls({ name: 'Bruno Air Conditioning', website: 'brunoac.com' }).affiliation, 'independent');
is('…and says what it was checked against',
  cls({ name: 'Bruno Air Conditioning' }).evidence, 'no match in 2-entry register');

// The load-bearing guard: no register means no claim, not a market of independents.
is('an empty register returns unknown, never independent',
  cls({ name: 'Bruno Air Conditioning' }, []).affiliation, 'unknown');

// This one is here because the seeded template broke it on the first real run:
// a fenced example parsed as a live entry, the register looked populated, and a
// Neighborly franchise ranked #1 tagged "independent".
is('a fenced example is documentation, not a register entry',
  parseRegister('# R\n\n```\n## Example Platform Co\nbrands: Example Air\n```\n').length, 0);
is('entries after a fenced example still parse',
  parseRegister('# R\n```\n## Example\nbrands: X\n```\n## Real Co\nbrands: Real Air\n').map(c => c.name),
  ['Real Co']);

// Substring collisions are how a false "affiliated" creeps in; word boundaries
// are how a real one is still caught.
is('a brand inside a longer word does not match',
  cls({ name: 'Coolrays Tanning Salon' }).affiliation, 'independent');
is('a brand as a whole word does match',
  cls({ name: 'Coolray Heating and Cooling' }).affiliation, 'affiliated');
is('short brand tokens are ignored (they collide with ordinary words)',
  classify(C({ name: 'ARS of Tucson' }), parseRegister('## X\nbrands: ARS\n')).affiliation, 'independent');

/* ── revenue: a band, with its working ────────────────────────────────── */

const BENCH = parseBenchmarks(`
| NAICS | Label | Revenue/employee | Source |
|---|---|---|---|
| 2382 | Building equipment contractors | $185,000 | BLS QCEW 2023 — UNVERIFIED |
`);
const RULES = parseEmployeeRules(`## Employee proxy
reviews 0-9    | 1-3
reviews 10-49  | 3-8
reviews 50-199 | 8-25
reviews 200+   | 25-60
`);

is('benchmark table parsed, header and separator skipped', BENCH.length, 1);
is('money parsed out of the cell', BENCH[0].revenuePerEmployee, 185000);
is('employee proxy bands parsed', RULES.length, 4);

const band = revenueBand(C({ reviews: '74' }), '2382', BENCH, RULES);
is('band = employee range × revenue per employee', [band.low, band.high], [8 * 185000, 25 * 185000]);
is('basis names the review count', band.basis.includes('74 reviews'), true);
is('basis calls the proxy an assumption', band.basis.includes('not a measurement'), true);
is('basis carries the benchmark source', band.basis.includes('UNVERIFIED'), true);

// Refusing to produce a number is the whole point when there is nothing behind it.
is('no benchmark for the NAICS → no band',
  revenueBand(C({ reviews: '74' }), '9999', BENCH, RULES).low, null);
is('no review count → no band',
  revenueBand(C({}), '2382', BENCH, RULES).low, null);
is('a 6-digit NAICS falls back to its 4-digit benchmark',
  revenueBand(C({ reviews: '74' }), '238220', BENCH, RULES).low, 8 * 185000);

/* ── scoring ──────────────────────────────────────────────────────────── */

const SCREEN: Screen = {
  naics: '2382', states: ['AZ'], metros: ['Phoenix'],
  revenueMin: 3_000_000, revenueMax: 25_000_000, queries: [],
};
const good = C({ name: 'Bruno Air', city: 'Phoenix', state: 'AZ', website: 'b.com', rating: '4.7', reviews: '74' });
const goodBand = revenueBand(good, '2382', BENCH, RULES);

const sIndep = score(good, SCREEN, classify(good, REG), goodBand);
const owned = C({ ...good, name: 'Coolray Heating and Cooling' });
const sOwned = score(owned, SCREEN, classify(owned, REG), goodBand);

is('a strong independent in the buy-box tiers A', sIndep.tier, 'A');
// Affiliation gates rather than deducts: an owned business is off the board,
// however good it looks on every other axis.
is('the same business, already owned, scores zero', sOwned.score, 0);
is('…and says who owns it', sOwned.detail.includes('Wrench Group'), true);
is('an unverified business takes a visible discount, not a free pass',
  score(good, SCREEN, classify(good, []), goodBand).score, Math.round(sIndep.score * 0.85));

const outOfState = C({ ...good, city: 'Reno', state: 'NV' });
is('out of the target state scores lower',
  score(outOfState, SCREEN, classify(outOfState, REG), goodBand).score < sIndep.score, true);

const thin = C({ name: 'Someone', city: 'Phoenix', state: 'AZ', rating: '3.1', reviews: '2' });
is('no website, poor rating, no reviews → D',
  score(thin, SCREEN, classify(thin, REG), revenueBand(thin, '2382', BENCH, RULES)).tier, 'D');
is('a closed business is scored down hard',
  score(C({ ...good, types: 'plumber permanently_closed' }), SCREEN, classify(good, REG), goodBand).score
    < sIndep.score, true);

/* ── CSV round trip — the Google Sheet is the working surface ─────────── */

const CSV = `place_id,name,city,Notes
p1,"Bruno Air, Inc.",Phoenix,"called 7/28 — owner said ""not now"""
p2,Valley HVAC,Mesa,
`;
const rows = parseCsv(CSV);
is('quoted comma does not split a field', rows[0].name, 'Bruno Air, Inc.');
is('escaped quotes survive', rows[0].Notes, 'called 7/28 — owner said "not now"');
is('empty trailing cell is empty, not missing', rows[1].Notes, '');
is('blank lines dropped', rows.length, 2);

const out = toCsv(rows, COLUMNS);
is('a column the user added in Sheets survives a re-rank', out.includes('Notes'), true);
is('…with its content intact', parseCsv(out)[0].Notes, 'called 7/28 — owner said "not now"');
is('tool columns lead', out.split('\n')[0].startsWith('place_id,name,'), true);
// toCsv emits the full canonical column set, so a re-read gains empty columns —
// that is the point (a stable schema). What must not change is the content.
const back = parseCsv(out);
is('round trip preserves every value that was set',
  back.map(r => [r.place_id, r.name, r.city, r.Notes]),
  rows.map(r => [r.place_id, r.name, r.city, r.Notes]));
is('round trip is idempotent from there', toCsv(back, COLUMNS), out);

console.log(`\n${pass}/${total} correct`);
process.exit(pass === total ? 0 : 1);
