/**
 * Target screening, locally — pull a market, tag who is already owned, rank
 * what is left. No app, no database, no Anthropic key.
 *
 * Paul, 2026-07-28: "this whole search and rank function needs to be built
 * locally so that Cowork can do it - using a google Sheet is likely the best
 * way to manage big lists and rankings."
 *
 * So the list is a CSV. Google Sheets opens it, sorts it, and lets you add
 * columns; `rank` preserves anything you add. The chain is:
 *
 *   screen.mts init  <market>   seed screen.md + consolidators.md + benchmarks.md
 *   screen.mts pull  <market>   Google Places → screen/candidates.csv
 *   screen.mts rank  <market>   classify + size + score, in place, offline
 *
 * Only `pull` touches a network, and it uses GOOGLE_PLACES_API_KEY — a
 * different key from the app's Anthropic one, which is the point: text search
 * is free, and the detail tiers carry their own monthly free allowance. The
 * search was never what the spend cap broke.
 *
 * `rank` is free and instant, so re-run it as often as you like — after
 * editing the register, after changing the buy-box, after pulling the sheet
 * back down.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import {
  parseRegister, parseBenchmarks, parseEmployeeRules, classify, revenueBand,
  score, parseCsv, toCsv, COLUMNS,
  type Candidate, type Screen,
} from '../../house/screen.js';

const WS = process.cwd();
const [cmd, marketArg, ...flags] = process.argv.slice(2);
const flag = (n: string) => { const i = flags.indexOf(n); return i >= 0 ? flags[i + 1] : undefined; };
const has = (n: string) => flags.includes(n);

function marketDir(m: string): string {
  const d = path.join(WS, 'markets', m);
  if (!existsSync(d)) die(`No such market: markets/${m}`);
  return d;
}
function die(msg: string): never { console.error(msg); process.exit(1); }

/* ── config ──────────────────────────────────────────────────────────── */

function loadScreen(dir: string): Screen {
  const f = path.join(dir, 'screen', 'screen.md');
  if (!existsSync(f)) die(`No screen config. Run:  screen.mts init ${path.basename(dir)}`);
  const md = readFileSync(f, 'utf8');
  const fm = /^---\n([\s\S]*?)\n---/.exec(md);
  const front: Record<string, string> = {};
  if (fm) for (const l of fm[1].split('\n')) {
    const kv = /^\s*([a-z_]+)\s*:\s*(.*?)\s*$/i.exec(l);
    if (kv) front[kv[1].toLowerCase()] = kv[2];
  }
  const list = (s: string) => (s || '').split(',').map(x => x.trim()).filter(Boolean);
  const items = (heading: string) => {
    const re = new RegExp(`##\\s*${heading}[^\\n]*\\n([\\s\\S]*?)(?=\\n##\\s|$)`, 'i');
    const sec = re.exec(md);
    if (!sec) return [];
    return sec[1].split('\n')
      .map(l => /^\s*[-*]\s+(.*)$/.exec(l)?.[1]?.trim())
      .filter((x): x is string => !!x);
  };
  const queries = items('Queries'), geos = items('Geographies');
  const matrix: string[] = [];
  for (const q of queries) for (const g of geos) matrix.push(`${q} in ${g}`);

  return {
    naics: front.naics || '',
    states: list(front.states).map(s => s.toUpperCase()),
    metros: list(front.metros),
    revenueMin: Number(front.revenue_min) || 0,
    revenueMax: Number(front.revenue_max) || Number.MAX_SAFE_INTEGER,
    queries: matrix,
  };
}

const readIf = (f: string) => existsSync(f) ? readFileSync(f, 'utf8') : '';

/* ── init ────────────────────────────────────────────────────────────── */

if (cmd === 'init') {
  if (!marketArg) die('Usage: screen.mts init <market>');
  const dir = marketDir(marketArg);
  const sdir = path.join(dir, 'screen');
  mkdirSync(sdir, { recursive: true });

  const write = (name: string, body: string) => {
    const f = path.join(sdir, name);
    if (existsSync(f)) { console.log(`  · ${name} (kept — already exists)`); return; }
    writeFileSync(f, body);
    console.log(`  ✓ ${name}`);
  };

  write('screen.md', `---
naics: 2382
states: AZ
metros: Phoenix, Mesa, Tucson
revenue_min: 3000000
revenue_max: 25000000
---

# ${marketArg} — screen

The buy-box lives in the front matter above; \`rank\` scores against it.
Queries × Geographies is the search matrix \`pull\` fires at Google Places.

## Queries

- HVAC contractor
- air conditioning repair
- heating and cooling company

## Geographies

- Phoenix AZ
- Mesa AZ
- Tucson AZ

## Employee proxy

Review count is a WEAK size signal, not a measurement — it is here so the
revenue band has an input, and every band \`rank\` produces names this table as
its assumption. Change these to whatever this trade actually looks like.

reviews 0-9    | 1-3
reviews 10-49  | 3-8
reviews 50-199 | 8-25
reviews 200+   | 25-60
`);

  write('consolidators.md', `# Consolidators — ${marketArg}

Who is already rolling this market up. **This file is what makes "independent"
mean anything** — \`rank\` calls a business independent when it is not in here,
so a thin register produces a confident, wrong answer.

Build it from the master's who's-who. In a session on this workspace:

> Write markets/${marketArg}/screen/consolidators.md from the master's
> consolidating-platforms section. Named entities only, with their brands and
> domains. Nothing the master doesn't say.

Add an entry per platform, in the shape below. Brands are what a location
actually trades as — that is what gets matched against the business name.

\`\`\`
## Example Platform Co
backer: Example Capital
brands: Example Heating & Air, Example Plumbing
domains: exampleplatform.com, exampleheating.com
\`\`\`

The example is fenced on purpose: an unfilled register must parse as EMPTY, so
\`rank\` tags every row "unknown" instead of confidently calling a market of
franchises independent. Delete nothing — just add real entries below.
`);

  write('benchmarks.md', `# Revenue per employee — ${marketArg}

The size anchor. \`rank\` multiplies an employee range by this to get a revenue
BAND, and prints the arithmetic so the number survives an audit.

**Pin the sources before any figure here reaches a client document.** The seed
rows below came from the app's NAICS benchmark table, which attributed them to
a source family ("BLS QCEW + Damodaran") rather than a citable table — good
enough to sort a list, not good enough to publish.

| NAICS | Label | Revenue/employee | Source |
|---|---|---|---|
| 2382 | Building equipment contractors | $185,000 | BLS QCEW 2023 + Damodaran RPE — UNVERIFIED |
| 2389 | Specialty trade contractors | $170,000 | BLS QCEW 2023 + Damodaran RPE — UNVERIFIED |
| 5617 | Services to buildings and dwellings | $110,000 | BLS QCEW 2023 + Damodaran RPE — UNVERIFIED |
| 5612 | Facilities support services | $120,000 | BLS QCEW 2023 + Damodaran RPE — UNVERIFIED |
| 8111 | Automotive repair and maintenance | $140,000 | BLS QCEW 2023 + Damodaran RPE — UNVERIFIED |
| 8121 | Personal care services | $90,000 | BLS QCEW 2023 + Damodaran RPE — UNVERIFIED |
`);

  console.log(`\nNext:  fill screen/consolidators.md from the master, then`);
  console.log(`       npx tsx <repo>/scripts/studio/screen.mts pull ${marketArg}\n`);
  process.exit(0);
}

/* ── pull ────────────────────────────────────────────────────────────── */

const API = 'https://places.googleapis.com/v1';
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

/** Text Search, ID-only field mask — free and unlimited, so page it out. */
async function searchIds(query: string, key: string, maxPages: number): Promise<string[]> {
  const ids: string[] = [];
  let pageToken: string | undefined;
  for (let page = 0; page < maxPages; page++) {
    const body: Record<string, unknown> = { textQuery: query, languageCode: 'en' };
    if (pageToken) body.pageToken = pageToken;
    let res: Response;
    try {
      res = await fetch(`${API}/places:searchText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'places.id,nextPageToken' },
        body: JSON.stringify(body),
      });
    } catch (e: any) { console.error(`  ! ${query}: ${e.message}`); break; }
    if (!res.ok) { console.error(`  ! ${query}: HTTP ${res.status} ${(await res.text().catch(() => '')).slice(0, 160)}`); break; }
    const data: any = await res.json();
    for (const p of data.places || []) if (p.id) ids.push(p.id);
    pageToken = data.nextPageToken;
    if (!pageToken) break;
    await sleep(250);   // the token needs a beat before it is valid
  }
  return ids;
}

const DETAIL_MASK = [
  'id', 'displayName', 'formattedAddress', 'addressComponents', 'nationalPhoneNumber',
  'businessStatus', 'types', 'rating', 'userRatingCount', 'websiteUri',
].join(',');

async function detail(id: string, key: string): Promise<Candidate | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`${API}/${id}`, { headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': DETAIL_MASK } });
      if (res.status === 429) { await sleep(1200); continue; }
      if (!res.ok) return null;
      const p: any = await res.json();
      let city = '', state = '', zip = '';
      for (const c of p.addressComponents || []) {
        if (c.types?.includes('locality')) city = c.longText;
        if (c.types?.includes('administrative_area_level_1')) state = c.shortText;
        if (c.types?.includes('postal_code')) zip = c.longText;
      }
      return {
        place_id: p.id || id,
        name: p.displayName?.text || '',
        address: p.formattedAddress || '',
        city, state, zip,
        phone: p.nationalPhoneNumber || '',
        website: p.websiteUri || '',
        rating: p.rating != null ? String(p.rating) : '',
        reviews: p.userRatingCount != null ? String(p.userRatingCount) : '',
        types: (p.types || []).join(' '),
        status: p.businessStatus || '',
      };
    } catch { return null; }
  }
  return null;
}

if (cmd === 'pull') {
  if (!marketArg) die('Usage: screen.mts pull <market> [--pages 3] [--max 2000] [--yes]');
  const dir = marketDir(marketArg);
  const s = loadScreen(dir);
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) die('GOOGLE_PLACES_API_KEY not set.\n  export GOOGLE_PLACES_API_KEY=…   (a Places key — NOT the Anthropic one)');
  if (!s.queries.length) die('No search matrix — screen.md needs a ## Queries and a ## Geographies list.');

  const pages = Number(flag('--pages')) || 3;
  const max = Number(flag('--max')) || 2000;
  const csvPath = path.join(dir, 'screen', 'candidates.csv');

  console.log(`\n${s.queries.length} queries × up to ${pages} pages · free (ID-only field mask)`);
  const seen = new Set<string>();
  for (let i = 0; i < s.queries.length; i++) {
    const ids = await searchIds(s.queries[i], key, pages);
    for (const id of ids) seen.add(id);
    process.stdout.write(`\r  searched ${i + 1}/${s.queries.length} — ${seen.size} unique places  `);
    await sleep(120);
  }
  console.log('');

  // Keep whatever the sheet already knows about these places.
  const existing = existsSync(csvPath) ? parseCsv(readFileSync(csvPath, 'utf8')) : [];
  const byId = new Map(existing.map(r => [r.place_id || '', r]));
  const fresh = [...seen].filter(id => !byId.has(id)).slice(0, max);

  console.log(`\n  ${seen.size} unique · ${existing.length} already in the sheet · ${fresh.length} new to fetch`);
  console.log(`  Place Details is billed per request ($17/1k, first 5,000/month free).`);
  if (fresh.length > 5000 && !has('--yes')) {
    die(`  ${fresh.length} exceeds the monthly free allowance. Re-run with --yes, or cap it with --max.`);
  }

  const rows: Candidate[] = [];
  for (let i = 0; i < fresh.length; i += 25) {
    const batch = await Promise.all(fresh.slice(i, i + 25).map(id => detail(id, key)));
    for (const r of batch) if (r) rows.push(r);
    process.stdout.write(`\r  fetched ${Math.min(i + 25, fresh.length)}/${fresh.length}  `);
    await sleep(200);
  }
  console.log('');

  // Merge: existing rows keep every column, new rows append.
  for (const r of rows) {
    const prior = byId.get(r.place_id || '');
    byId.set(r.place_id || '', prior ? { ...prior, ...r } : r);
  }
  const all = [...byId.values()];
  mkdirSync(path.dirname(csvPath), { recursive: true });
  writeFileSync(csvPath, toCsv(all, COLUMNS));
  console.log(`\n✓ ${path.relative(WS, csvPath)} — ${all.length} candidates (${rows.length} new)`);
  console.log(`  Now:  screen.mts rank ${marketArg}\n`);
  process.exit(0);
}

/* ── rank ────────────────────────────────────────────────────────────── */

if (cmd === 'rank') {
  if (!marketArg) die('Usage: screen.mts rank <market>');
  const dir = marketDir(marketArg);
  const s = loadScreen(dir);
  const sdir = path.join(dir, 'screen');
  const csvPath = path.join(sdir, 'candidates.csv');
  if (!existsSync(csvPath)) die(`No candidates yet. Run:  screen.mts pull ${marketArg}`);

  const rows = parseCsv(readFileSync(csvPath, 'utf8'));
  const register = parseRegister(readIf(path.join(sdir, 'consolidators.md')));
  const benchmarks = parseBenchmarks(readIf(path.join(sdir, 'benchmarks.md')));
  const rules = parseEmployeeRules(readIf(path.join(sdir, 'screen.md')));

  if (!register.length) {
    console.log('\n! consolidators.md names no platforms, so nothing can be called independent.');
    console.log('  Every row will be tagged "unknown" until you fill it from the master.');
  }

  const counts: Record<string, number> = { independent: 0, affiliated: 0, unknown: 0 };
  const tiers: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  let banded = 0;

  for (const r of rows) {
    const cls = classify(r, register);
    const rev = revenueBand(r, s.naics, benchmarks, rules);
    const sc = score(r, s, cls, rev);
    r.affiliation = cls.affiliation;
    r.affiliated_to = cls.affiliatedTo;
    r.affiliation_evidence = cls.evidence;
    r.revenue_low = rev.low != null ? String(Math.round(rev.low)) : '';
    r.revenue_high = rev.high != null ? String(Math.round(rev.high)) : '';
    r.revenue_basis = rev.basis;
    r.score = String(sc.score);
    r.tier = sc.tier;
    r.score_detail = sc.detail;
    counts[cls.affiliation]++;
    tiers[sc.tier]++;
    if (rev.low != null) banded++;
  }

  rows.sort((a, b) => Number(b.score) - Number(a.score));
  writeFileSync(csvPath, toCsv(rows, COLUMNS));

  console.log(`\n✓ ${path.relative(WS, csvPath)} — ${rows.length} ranked`);
  console.log(`  register   ${register.length} platform(s), ${register.reduce((n, c) => n + c.brands.length, 0)} brand(s)`);
  console.log(`  affiliation  ${counts.independent} independent · ${counts.affiliated} affiliated · ${counts.unknown} unknown`);
  console.log(`  tier         A ${tiers.A} · B ${tiers.B} · C ${tiers.C} · D ${tiers.D}`);
  console.log(`  revenue band on ${banded}/${rows.length} (needs a NAICS benchmark + a review count)`);
  console.log(`\n  Open it in Google Sheets — File → Import → Upload. Columns you add`);
  console.log(`  survive a re-rank, so export back over the same file and run rank again.`);
  console.log(`\n  "independent" means NOT IN THE REGISTER. It is exactly as good as`);
  console.log(`  consolidators.md is complete — check the top of the list by hand.\n`);
  process.exit(0);
}

console.error(`Usage: screen.mts <init|pull|rank> <market> [flags]

  init <market>    seed screen/screen.md + consolidators.md + benchmarks.md
  pull <market>    Google Places → screen/candidates.csv   (needs GOOGLE_PLACES_API_KEY)
                   --pages N   pages per query (default 3, ~20 results each)
                   --max N     cap new detail fetches (default 2000)
  rank <market>    classify against the register, size, score — offline and free
`);
process.exit(1);
