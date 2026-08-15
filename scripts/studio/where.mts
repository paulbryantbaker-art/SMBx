/**
 * scripts/studio/where.mts — "is this mine, or the app's?"
 *
 * (2026-08-14, Paul: "lets give this finding to cowork so it understands
 * completely programatically" + "lets clearly delineate responsibilities and
 * workflows for all processes".)
 *
 * The routing question, answerable in one command instead of by reading a
 * paragraph and hoping it is current. `house/where.ts` is the table; this is
 * the front end; `house/__tests__/where.test.mts` keeps the shipped doc honest
 * against the table.
 *
 *   where.mts <anything>    which system owns it, why, and how it runs
 *   where.mts list          every process, grouped
 *   where.mts app|workspace just that side's responsibilities
 *   where.mts check <id>    exit 0 = do it here · 1 = the app's · 2 = undecided
 *
 * `check` is the programmatic form, for scripts and for a session that wants a
 * hard answer rather than prose. It answers the question a caller actually has
 * — "may I do this here, now?" — which is NOT the same as who owns it: a
 * process the app owns but cannot yet perform (see `gap`) exits 0, because
 * today the honest answer is yes and the gap text says why.
 *
 * Exit 2 means UNKNOWN, deliberately distinct from "the app owns it": an
 * unrecognised process is one nobody has decided about, and silently treating
 * it as somebody's is how work ends up in two systems.
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROCESSES, resolve, byId, ONE_LINE, TIEBREAK, renderMarkdown, type Process, type Owner } from '../../house/where.js';

const OWNER_LABEL: Record<Owner, string> = {
  app: 'THE APP',
  workspace: 'HERE (Cowork / the workspace)',
  both: 'EITHER — identical answer both sides',
};

const COST_LABEL = {
  free: 'free — calls no model',
  drip: 'a drip — Haiku or a bounded turn, cents',
  expensive: 'EXPENSIVE — one press can spend dollars',
} as const;

function show(p: Process): void {
  console.log('');
  console.log(`  ${p.name}`);
  console.log(`  ${'─'.repeat(Math.min(p.name.length, 68))}`);
  console.log(`  where    ${OWNER_LABEL[p.owner]}`);
  console.log(`  cost     ${COST_LABEL[p.cost]}`);
  console.log(`  why      ${wrap(p.why, 11)}`);
  if (p.gap) {
    console.log('');
    console.log(`  ⚠️  NOT FULLY THERE YET`);
    console.log(`           ${wrap(p.gap, 11)}`);
  }
  console.log('');
  for (const step of p.workflow) console.log(`     ${step}`);
}

/** Wrap continuation lines under a fixed left gutter. */
function wrap(text: string, indent: number, width = 78): string {
  const pad = ' '.repeat(indent);
  const out: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    if (line && (line + ' ' + word).length + indent > width) { out.push(line); line = word; }
    else line = line ? `${line} ${word}` : word;
  }
  if (line) out.push(line);
  return out.join(`\n${pad}`);
}

const [cmd, ...rest] = process.argv.slice(2);

/* ── render — the form Claude Desktop actually reads ──────────────────── */

/* Cowork is Claude Desktop, not a terminal (Paul, 2026-08-14). A session
   there READS FILES; it cannot be relied on to run `npx tsx`. So the table's
   primary output is a document, and the CLI below is the secondary surface
   for whoever does have a shell. `where.test.mts` fails if the checked-in
   WHERE.md drifts from the table, which is what stops this being a second
   source of truth. */
if (cmd === 'render') {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const out = path.resolve(here, '../../content/studio');
  writeFileSync(path.join(out, 'WHERE.md'), renderMarkdown());
  writeFileSync(
    path.join(out, 'where.json'),
    JSON.stringify({ rule: ONE_LINE, tiebreak: TIEBREAK, processes: PROCESSES }, null, 2) + '\n',
  );
  console.log('Wrote content/studio/WHERE.md and where.json from house/where.ts');
  process.exit(0);
}

/* ── list ─────────────────────────────────────────────────────────────── */

if (cmd === 'list' || (!cmd && false)) {
  console.log(`\n${ONE_LINE}\n`);
  const groups = ['sourcing', 'deal', 'crm', 'collateral', 'ops'] as const;
  const title = {
    sourcing: 'SOURCING — finding markets and targets',
    deal: 'DEAL — from a live target to close',
    crm: 'CRM AND COMMS — clients and everyone else',
    collateral: 'COLLATERAL — what goes out',
    ops: 'OPS — the standing jobs',
  };
  for (const g of groups) {
    console.log(`  ${title[g]}`);
    for (const p of PROCESSES.filter(x => x.group === g)) {
      const w = p.owner === 'app' ? 'app      ' : p.owner === 'workspace' ? 'workspace' : 'either   ';
      const flag = (p.cost === 'expensive' ? '  $' : '') + (p.gap ? '  ⚠️' : '');
      console.log(`    ${w}  ${p.name}${flag}`);
    }
    console.log('');
  }
  console.log('  $ = one press can spend dollars.   ⚠️ = decided, but the owner cannot do all of it yet.');
  console.log('  where.mts <anything>  for the why and the workflow.\n');
  process.exit(0);
}

/* ── one side's responsibilities ──────────────────────────────────────── */

if (cmd === 'app' || cmd === 'workspace' || cmd === 'cowork') {
  const side: Owner = cmd === 'app' ? 'app' : 'workspace';
  const mine = PROCESSES.filter(p => p.owner === side || p.owner === 'both');
  console.log(`\n${OWNER_LABEL[side]} — ${mine.length} processes\n`);
  for (const p of mine) {
    console.log(`  ${p.name}${p.owner === 'both' ? '   (either side)' : ''}`);
    console.log(`      ${wrap(p.why, 6)}`);
  }
  console.log('');
  process.exit(0);
}

/* ── the programmatic gate ────────────────────────────────────────────── */

if (cmd === 'check') {
  const id = rest[0];
  if (!id) {
    console.error('Usage: where.mts check <process-id>   (where.mts list for the ids)');
    process.exit(2);
  }
  const p = byId(id) ?? resolve(id)[0];
  if (!p) {
    console.error(`unknown: ${id}`);
    console.error('Not a decided process. Do not guess a home for it — the tiebreak:');
    for (const t of TIEBREAK) console.error(`  · ${t}`);
    process.exit(2);
  }
  console.log(`${p.id}\t${p.owner}${p.gap ? '\tgap' : ''}`);
  if (p.gap) console.error(`gap: ${p.gap}`);
  // 0 = do it here (workspace-owned, or app-owned with a gap the app cannot
  // yet fill). 1 = the app's and the app can do it. 2 = undecided.
  process.exit(p.owner === 'app' && !p.gap ? 1 : 0);
}

/* ── the question ─────────────────────────────────────────────────────── */

if (cmd) {
  const query = [cmd, ...rest].join(' ');
  const hits = resolve(query);

  if (!hits.length) {
    console.log(`\n  No process matches "${query}".`);
    console.log('\n  That is an answer, not a failure: nobody has decided this one.');
    console.log('  Do not pick a side by feel — that is how the same work ended up');
    console.log('  in two systems the first time. The tiebreak:\n');
    for (const t of TIEBREAK) console.log(`     · ${t}`);
    console.log('\n  where.mts list  for everything that IS decided.\n');
    process.exit(2);
  }

  show(hits[0]);
  if (hits.length > 1) {
    console.log('');
    console.log(`  also matched: ${hits.slice(1, 4).map(p => p.id).join(', ')}`);
  }
  console.log('');
  process.exit(hits[0].owner === 'app' && !hits[0].gap ? 1 : 0);
}

/* ── no arguments ─────────────────────────────────────────────────────── */

console.log(`
${ONE_LINE}

  Cowork is the INPUT layer: gathering sources, aggregating them into a
  master, deep search, and wrangling messy data into something structured.
  Everything the practice PRODUCES or TRACKS — the deal, the CRM, the
  documents, the collateral — is the app, in one place, because that is the
  work that interleaves and splitting it is what made moving between systems
  painful.

  Two of the app's are DECIDED BUT NOT BUILT — the target map, and the deal
  memo / diligence plan / term framework. Those still happen here. The list
  command marks them, and check exits 0 for them, because today the answer
  is yes.

  where.mts <anything>     which system owns it, why, and how to run it
  where.mts list           every process, grouped
  where.mts app            what the app is responsible for
  where.mts workspace      what this workspace is responsible for
  where.mts check <id>     exit 0 = do it here · 1 = the app's · 2 = undecided
`);
process.exit(0);
