/**
 * Process routing — the table, the resolver, and the doc that must match it.
 *
 * Run: npx tsx house/__tests__/where.test.mts   (npm run test:where)
 *
 * Why this file exists: this repo has three live examples of a law rotting in
 * place — THE_LINE_POLICY.md and DESIGN_LANGUAGE.md pointed at from a
 * workspace that cannot read them, and a fee rule sourced from
 * PRACTICE_RECORD.md, which does not exist. Each read as authoritative and
 * each was wrong. A routing decision written only as prose would go the same
 * way, so the table is data and the shipped document is GENERATED from it.
 * The last section here is the part that matters: if WHERE.md and the table
 * disagree, this goes red.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PROCESSES, resolve, byId, renderMarkdown, ONE_LINE, TIEBREAK,
} from '../where.js';

let pass = 0, total = 0;
function is(name: string, got: unknown, want: unknown) {
  total++;
  const ok = JSON.stringify(got) === JSON.stringify(want);
  pass += ok ? 1 : 0;
  console.log(`${ok ? '  ok  ' : ' FAIL '}${name}`);
  if (!ok) console.log(`        got  ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`);
}
function ok(name: string, cond: boolean) { is(name, cond, true); }

const HERE = path.dirname(fileURLToPath(import.meta.url));
const STUDIO = path.resolve(HERE, '../../content/studio');

/* ── the table is well formed ─────────────────────────────────────────── */

ok('every process has an id, a name and a why',
  PROCESSES.every(p => p.id && p.name && p.why));
is('ids are unique', PROCESSES.length, new Set(PROCESSES.map(p => p.id)).size);
ok('every process says how it is run', PROCESSES.every(p => p.workflow.length > 0));
ok('every process carries search terms', PROCESSES.every(p => p.aka.length > 0));

/* ── the decisions themselves ─────────────────────────────────────────── */

/* These are the answer Paul asked for, pinned so a later edit is deliberate
   rather than accidental. */
const owns = (id: string) => byId(id)?.owner;

is('DEFINITIVE is the app — it cannot leave', owns('definitive'), 'app');
is('valuation is the app — a what-if wants a slider', owns('valuation'), 'app');
is('deal state is the app', owns('deal-state'), 'app');
is('the CRM is the app', owns('crm'), 'app');
is('outreach is the app', owns('outreach'), 'app');
is('counterparty comms is the app', owns('counterparty-comms'), 'app');
is('the sourcing engine is the app', owns('sourcing-pipeline'), 'app');
is('LinkedIn analytics stays the app — the standing exception', owns('linkedin-analytics'), 'app');

is('market research is the workspace', owns('market-research'), 'workspace');
is('master synthesis is the workspace', owns('master-synthesis'), 'workspace');
is('the weekly sweep is the workspace', owns('weekly-sweep'), 'workspace');
is('corp-dev documents are the workspace', owns('corp-dev-documents'), 'workspace');
is('deal documents are the workspace', owns('deal-documents'), 'workspace');
is('collateral is the workspace', owns('collateral'), 'workspace');

is('the citation audit runs identically either side', owns('citation-audit'), 'both');

/* The cost story, which is the evidence the decision rests on. */
is('exactly the research paths can spend dollars',
  PROCESSES.filter(p => p.cost === 'expensive').map(p => p.id).sort(),
  ['market-research', 'master-synthesis', 'weekly-sweep']);

ok('nothing expensive is owned by the app',
  PROCESSES.filter(p => p.cost === 'expensive').every(p => p.owner !== 'app'));

/* The load-bearing claim: interleaved work must not be split. */
ok('everything that interleaves is the app',
  PROCESSES.filter(p => p.interleaves).every(p => p.owner === 'app'));

/* ── the resolver ─────────────────────────────────────────────────────── */

is('"irr" finds valuation', resolve('irr')[0]?.id, 'valuation');
is('"dscr" finds valuation', resolve('dscr')[0]?.id, 'valuation');
is('"crm" finds the CRM', resolve('crm')[0]?.id, 'crm');
is('"who\'s who" finds the corp-dev documents', resolve("who's who")[0]?.id, 'corp-dev-documents');
is('"carousel" finds collateral', resolve('carousel')[0]?.id, 'collateral');
is('"gates" finds DEFINITIVE', resolve('gates')[0]?.id, 'definitive');
is('"lawyer" finds counterparty comms', resolve('lawyer')[0]?.id, 'counterparty-comms');

/* WRONG-FIRST. A first-match resolver sends "deal model" to deal-documents,
   because "deal" appears in that name too. Scoring is what makes the obvious
   phrasing land on the obvious answer. */
is('"deal model" is valuation, not the deal memo', resolve('deal model')[0]?.id, 'valuation');
is('"deal memo" IS the deal documents', resolve('deal memo')[0]?.id, 'deal-documents');

/* An unknown must stay unknown. Guessing a home is the failure mode. */
is('an unrecognised process resolves to nothing', resolve('astrology'), []);
is('an empty query resolves to nothing', resolve('   '), []);

/* ── the generated document must match the table ──────────────────────── */

const docPath = path.join(STUDIO, 'WHERE.md');
const jsonPath = path.join(STUDIO, 'where.json');

ok('WHERE.md is checked in', existsSync(docPath));
ok('where.json is checked in', existsSync(jsonPath));

if (existsSync(docPath)) {
  /* The whole point. Change the table without re-rendering and this fails,
     which is the difference between a generated doc and a second source. */
  is('WHERE.md matches what the table renders — re-run `where.mts render`',
    readFileSync(docPath, 'utf8') === renderMarkdown(), true);

  const doc = readFileSync(docPath, 'utf8');
  ok('…and it names every process', PROCESSES.every(p => doc.includes(p.name)));
  ok('…and states the rule', doc.includes(ONE_LINE));
  ok('…and carries the tiebreak for anything unlisted',
    TIEBREAK.every(t => doc.includes(t)));
  ok('…and warns against hand-editing', /GENERATED/.test(doc));
}

if (existsSync(jsonPath)) {
  const parsed = JSON.parse(readFileSync(jsonPath, 'utf8'));
  is('where.json carries every process', parsed.processes.length, PROCESSES.length);
  is('where.json agrees with the table on every owner',
    parsed.processes.map((p: any) => `${p.id}:${p.owner}`),
    PROCESSES.map(p => `${p.id}:${p.owner}`));
}

/* ── it has to reach the workspace ────────────────────────────────────── */

/* A law that does not travel is the defect this session found three times.
   Cowork is Claude Desktop — it READS FILES and cannot be relied on to run a
   CLI — so WHERE.md reaching the workspace is the whole delivery mechanism,
   not a nicety. */
const init = readFileSync(path.resolve(HERE, '../../scripts/studio/init-workspace.mts'), 'utf8');
ok('init-workspace copies WHERE.md into the workspace', init.includes("'WHERE.md'"));
ok('init-workspace copies where.json too', init.includes("'where.json'"));

console.log(`\n${pass}/${total} correct`);
process.exit(pass === total ? 0 : 1);
