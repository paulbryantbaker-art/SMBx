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
/* MOVED 2026-08-15 (Paul: "there will be no sourcing in the app the app is
   internal now IoI to integration"). Finding candidates is pre-IoI, therefore
   market-shaped, therefore the studio's — the seam applied consistently rather
   than carved around. This assertion said 'app' and going red is exactly what
   it was for. */
is('sourcing is pre-IoI, so the studio', owns('sourcing-pipeline'), 'workspace');
is('LinkedIn analytics stays the app — the standing exception', owns('linkedin-analytics'), 'app');

is('market research is the workspace', owns('market-research'), 'workspace');
is('master synthesis is the workspace', owns('master-synthesis'), 'workspace');
is('the weekly sweep is the workspace', owns('weekly-sweep'), 'workspace');
is('the target screen is the workspace', owns('target-screen'), 'workspace');
is('data wrangling is the workspace', owns('data-wrangling'), 'workspace');

/* THE IoI SEAM (Paul, 2026-08-15; THE_IOI_SEAM.md). Third and settled axis.
   The first cut split on "documents are files, pipelines are rows"; the second
   on "raw input vs practice output". Both put collateral and the corp-dev
   documents in the wrong place, from opposite directions. This one splits on
   AUDIENCE — the same law that already separates collateral/ from decks/ —
   and returns both to the studio.

   Pinned in the new position so a fourth move is deliberate rather than drift. */
is('collateral is MARKET-shaped, so the studio', owns('collateral'), 'workspace');
is('corp-dev documents are MARKET-shaped, so the studio', owns('corp-dev-documents'), 'workspace');
is('pre-IoI screening math is the studio', owns('pre-ioi-math'), 'workspace');

is('deal documents are DEAL-shaped, so the app', owns('deal-documents'), 'app');
is('the data room is the app, and is why the modelling is too', owns('data-room'), 'app');
is('live scenario modelling is the app, from the IoI', owns('valuation'), 'app');

is('the citation audit runs identically either side', owns('citation-audit'), 'both');
is('the promotion itself spans both sides — that is what a seam is',
  owns('ioi-promotion'), 'both');

/* THE ASYMMETRY, asserted because it is the one thing about the seam that is
   NOT "before the IoI is the studio": outreach is app-side from first touch,
   so a candidate has a CRM row while its analysis is still in the studio. */
is('CRM is app-side from the first touch, before any IoI', owns('crm'), 'app');
is('…and so is the outreach queue', owns('outreach'), 'app');

/* The market side, enumerated. Everything here is one-to-many and speculative
   with no counterparty — which is the whole definition of market-shaped. */
is('the studio holds exactly the market-shaped work',
  PROCESSES.filter(p => p.owner === 'workspace').map(p => p.id).sort(),
  ['collateral', 'corp-dev-documents', 'data-wrangling', 'market-research',
   'master-synthesis', 'pre-ioi-math', 'sourcing-pipeline', 'target-screen',
   'weekly-sweep']);

/* THE APP IS IoI → INTEGRATION, stated as a set rather than left implicit.
   Everything here is downstream of a named target becoming a deal — plus the
   CRM, which is the seam's one asymmetry (outreach starts before the IoI). If
   a process is added to the app side that is not one of these, it is either a
   new deal-phase capability or a mistake, and this makes someone say which. */
is('the app holds exactly the deal-shaped work, plus three named exceptions',
  PROCESSES.filter(p => p.owner === 'app').map(p => p.id).sort(),
  ['counterparty-comms', 'crm', 'data-room', 'deal-documents', 'deal-state',
   'definitive', 'linkedin-analytics', 'outreach', 'valuation', 'website']);

/* The three that are app-owned WITHOUT being deal-shaped, each for its own
   reason. Named individually because "the app is IoI → integration" is the
   rule and these are the exceptions to it — an unnamed exception is how a rule
   quietly stops meaning anything.

     crm + outreach     the seam's asymmetry: a candidate has a CRM row while
                        its analysis is still in the studio. Outreach is how
                        the IoI happens in the first place.
     linkedin-analytics THE STANDING EXCEPTION — the XLSX parser has no local
                        equivalent. It is the reason the studio lane stayed on
                        for a day longer than it should have.
     website            the practice site is served by the app because it is a
                        web server. Not deal work, not studio work, just
                        hosting. */
for (const id of ['crm', 'outreach', 'linkedin-analytics', 'website']) {
  is(`${id} is a named app-side exception to IoI → integration`, owns(id), 'app');
}

/* ── decided ≠ built ──────────────────────────────────────────────────── */

/* Both of these shipped in this table as app-owned and LIVE, and neither claim
   survived reading the code: corpDevDocs.ts generates three of PLAYBOOK's four
   (no target map), and nothing in the app produces §5's deal memo, diligence
   plan or term framework. A routing table that sends work somewhere it dies is
   worse than none, so the gap is a field and it is pinned here. Delete a gap
   only when the app can actually do the thing. */
is('every gap is recorded, and only those',
  PROCESSES.filter(p => p.gap).map(p => p.id).sort(),
  ['corp-dev-documents', 'deal-documents', 'ioi-promotion', 'pre-ioi-math', 'sourcing-pipeline']);

ok('the deal-document gap says it is not implemented at all',
  /NOT IMPLEMENTED/.test(byId('deal-documents')?.gap ?? ''));

/* The two the IoI seam added, and the honest state of each. */
ok('the promotion is recorded as unbuilt — the largest missing piece',
  /NOT BUILT/.test(byId('ioi-promotion')?.gap ?? ''));
ok('the engine is recorded as not yet vendored',
  /not vendored/i.test(byId('pre-ioi-math')?.gap ?? ''));

/* The app's sourcing engine produces figures that would fail this practice's
   own citation audit — a model-guessed revenue band and no independence check.
   Pinned because the sourcing lane is now ON by default, so the defects are
   reachable, and because house/screen.ts exists specifically to correct them. */
ok('the sourcing engine\'s citation defects are recorded',
  /CITATION-LAW DEFECTS/.test(byId('sourcing-pipeline')?.gap ?? ''));

/* A gap must not be silently dropped from the document — that is exactly how
   it would go back to reading as "done". */
ok('every gap is printed in the rendered doc',
  PROCESSES.filter(p => p.gap).every(p => renderMarkdown().includes(p.gap!)));

/* A gap on a STUDIO-owned process means something different from a gap on an
   app-owned one, and the difference is worth keeping straight: the studio can
   do the work today, the gap is about HOW WELL. `pre-ioi-math` runs fine — it
   just cannot yet say which engine version produced its numbers, which is the
   provenance the IoI seam asks for. An app-side gap means the work does not
   happen there at all. */
ok('a studio-side gap never blocks the work, only its provenance',
  PROCESSES.filter(p => p.owner === 'workspace' && p.gap)
    .every(p => !/NOT BUILT|NOT IMPLEMENTED/.test(p.gap!)));

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
