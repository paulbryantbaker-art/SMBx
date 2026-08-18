#!/usr/bin/env node
/**
 * THE ENGAGEMENT BOARD — what we're doing for whom, and where it stands.
 *
 * Paul, 2026-07-29: "I need a way on the Cowork side to actually track real
 * work. Our clients, work we're doing for them, where we are in the process."
 * And: "I don't want to have to keep downloading main and reimporting it so
 * that Cowork can use it."
 *
 * So this file LIVES IN THE WORKSPACE, not the repo. It is plain JavaScript on
 * node built-ins — no npm install, no tsx, no network, no database. Open the
 * workspace in Cowork and it is already there:
 *
 *     node engagements.mjs list
 *
 * It is also DELIBERATELY OPTIONAL. Every engagement is a markdown file a
 * person (or Claude) can read and edit by hand; this script only does the
 * mechanical parts — rebuild the board, compute staleness, stamp a stage
 * change. If node ever isn't handy, nothing is lost: edit the markdown.
 *
 *   engagements.mjs new <client> <engagement>   scaffold one
 *   engagements.mjs list                        the board, newest movement first
 *   engagements.mjs stage <path> <stage> [note] advance it, stamped and logged
 *   engagements.mjs note  <path> <note>          append to its log
 *   engagements.mjs board                       rewrite ENGAGEMENTS.md
 *   engagements.mjs check [--days N]            exit 1 if anything has stalled
 *
 * Layout:  clients/<client>/<engagement>/engagement.md
 *          plus documents/ and analysis/ beside it, same shape as deals/.
 *
 * THE LINE still governs what these stages can mean. We analyse, model, draft
 * and coordinate; the CLIENT decides, signs, and carries the deal. A stage
 * called "closing" means we are supporting a close, never that we closed it.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';

const WS = process.cwd();
const ROOT = path.join(WS, 'clients');

/* ── the stage ladder ──────────────────────────────────────────────────────
   Ordered, so the board can sort by how far along something is. Edit this
   list if the practice's language changes — everything downstream reads it. */
const STAGES = [
  'prospect',     // a conversation; nothing papered
  'engaged',      // engagement letter signed
  'thesis',       // buy-box and thesis agreed with the client
  'sourcing',     // building and screening the target set
  'outreach',     // approaches going out (the client's name on them)
  'diligence',    // a live target under examination
  'structuring',  // terms, financing, specialists engaged
  'closing',      // supporting a signing/close the client runs
  'closed',       // done — kept for the record
];
/** Not on the ladder: holding states that should never read as "stalled". */
const RESTING = ['parked', 'ended'];
const ALL_STAGES = [...STAGES, ...RESTING];

/** Who the next move belongs to. The honest field — most stalls are a wait. */
const WAITING = ['us', 'client', 'counterparty', 'specialist', 'nobody'];

const today = () => new Date().toISOString().slice(0, 10);
const days = (iso) => {
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : Math.floor((Date.now() - t) / 86400000);
};

/* ── front matter: a tiny key: value block, no YAML dependency ─────────── */

function parse(file) {
  const raw = readFileSync(file, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { fm: {}, body: raw, raw };
  const fm = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim();
    if (k) fm[k] = v;
  }
  return { fm, body: m[2], raw };
}

function write(file, fm, body) {
  const order = ['client', 'engagement', 'stage', 'waiting_on', 'next', 'opened', 'last_moved', 'letter'];
  const keys = [...order.filter(k => k in fm), ...Object.keys(fm).filter(k => !order.includes(k))];
  const head = keys.map(k => `${k}: ${fm[k]}`).join('\n');
  writeFileSync(file, `---\n${head}\n---\n${body.replace(/^\n+/, '\n')}`);
}

/* ── reading the folder ────────────────────────────────────────────────── */

function listDirs(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(n => !n.startsWith('.') && !n.startsWith('_'))
    .filter(n => statSync(path.join(dir, n)).isDirectory())
    .sort();
}

function load() {
  const out = [];
  for (const client of listDirs(ROOT)) {
    for (const eng of listDirs(path.join(ROOT, client))) {
      const file = path.join(ROOT, client, eng, 'engagement.md');
      if (!existsSync(file)) continue;
      const { fm, body } = parse(file);
      const stage = (fm.stage || 'prospect').toLowerCase();
      out.push({
        file,
        rel: `${client}/${eng}`,
        client: fm.client || client,
        name: fm.engagement || eng,
        stage,
        stageIndex: STAGES.indexOf(stage),
        resting: RESTING.includes(stage),
        waiting: (fm.waiting_on || 'us').toLowerCase(),
        next: fm.next || '',
        opened: fm.opened || '',
        moved: fm.last_moved || fm.opened || '',
        letter: fm.letter || '',
        fm, body,
      });
    }
  }
  return out;
}

function find(rel) {
  const all = load();
  const hit = all.filter(e => e.rel === rel || e.rel.endsWith(`/${rel}`) || e.rel.startsWith(`${rel}/`));
  if (hit.length === 1) return hit[0];
  if (hit.length === 0) { console.error(`No engagement matching "${rel}".`); process.exit(1); }
  console.error(`"${rel}" matches ${hit.length}: ${hit.map(h => h.rel).join(', ')}`);
  process.exit(1);
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* ── commands ──────────────────────────────────────────────────────────── */

function cmdNew(clientName, engName) {
  if (!clientName || !engName) {
    console.error('Usage: engagements.mjs new "<client>" "<engagement>"');
    process.exit(1);
  }
  const dir = path.join(ROOT, slug(clientName), slug(engName));
  const file = path.join(dir, 'engagement.md');
  if (existsSync(file)) { console.error(`Already exists: ${path.relative(WS, file)}`); process.exit(1); }
  for (const sub of ['', 'documents', 'analysis']) mkdirSync(path.join(dir, sub), { recursive: true });

  const fm = {
    client: clientName,
    engagement: engName,
    stage: 'prospect',
    waiting_on: 'us',
    next: 'Write down what the next move actually is.',
    opened: today(),
    last_moved: today(),
    letter: 'none',
  };
  const body = `
# ${engName}

**Client:** ${clientName}

## Mandate
<!-- What they hired us to do, in their words where possible. Buy-side only:
     one buyer per target, targets under $250M revenue. -->

## Where it stands
<!-- The current picture in a few lines. Update this, don't append to it. -->

## What has to happen next
- [ ] ${fm.next}

## Log
- ${today()} — opened, stage: prospect

## Documents
<!-- documents/ is what the client and counterparties sent us.
     analysis/ is what we produced. Same split as deals/. -->
`;
  write(file, fm, body);
  console.log(`✓ ${path.relative(WS, file)}`);
  console.log(`  stage: prospect · waiting on: us`);
  console.log(`  Next: fill in the mandate, then \`node engagements.mjs board\`.`);
}

function cmdStage(rel, stage, note) {
  if (!stage || !ALL_STAGES.includes(stage.toLowerCase())) {
    console.error(`Stage must be one of: ${ALL_STAGES.join(', ')}`);
    process.exit(1);
  }
  const e = find(rel);
  const from = e.stage;
  const to = stage.toLowerCase();
  e.fm.stage = to;
  e.fm.last_moved = today();
  const line = `- ${today()} — ${from} → ${to}${note ? ` · ${note}` : ''}`;
  write(e.file, e.fm, appendLog(e.body, line));
  console.log(`✓ ${e.rel}: ${from} → ${to}`);
}

function cmdNote(rel, note) {
  if (!note) { console.error('Usage: engagements.mjs note <path> "<note>"'); process.exit(1); }
  const e = find(rel);
  write(e.file, e.fm, appendLog(e.body, `- ${today()} — ${note}`));
  console.log(`✓ ${e.rel}: noted`);
}

/** Put the line under `## Log`, or start that section if the file has none. */
function appendLog(body, line) {
  const m = body.match(/^##\s+Log\s*$/m);
  if (!m) return `${body.replace(/\s*$/, '')}\n\n## Log\n${line}\n`;
  const at = m.index + m[0].length;
  return body.slice(0, at) + '\n' + line + body.slice(at);
}

function rows() {
  const all = load();
  // Resting last, then by how stale, so what needs a hand is at the top.
  return all.sort((a, b) => {
    if (a.resting !== b.resting) return a.resting ? 1 : -1;
    return (days(b.moved) ?? 0) - (days(a.moved) ?? 0);
  });
}

function cmdList() {
  const all = rows();
  if (!all.length) {
    console.log('No engagements yet.  node engagements.mjs new "<client>" "<engagement>"');
    return;
  }
  const w = (s, n) => String(s).padEnd(n).slice(0, n);
  console.log(`${w('ENGAGEMENT', 30)} ${w('STAGE', 13)} ${w('WAITING', 13)} ${w('IDLE', 6)} NEXT`);
  for (const e of all) {
    const d = days(e.moved);
    const idle = e.resting ? '—' : d === null ? '?' : `${d}d`;
    console.log(`${w(e.rel, 30)} ${w(e.stage, 13)} ${w(e.resting ? '—' : e.waiting, 13)} ${w(idle, 6)} ${e.next.slice(0, 60)}`);
  }
}

function cmdBoard() {
  const all = rows();
  const live = all.filter(e => !e.resting && e.stage !== 'closed');
  const out = [];
  out.push('# Engagements');
  out.push('');
  out.push('<!-- Rebuilt by `node engagements.mjs board`. Edit the engagement.md files,');
  out.push('     not this page — anything typed here is overwritten. -->');
  out.push('');
  out.push(`_${live.length} live · rebuilt ${today()}_`);
  out.push('');

  if (live.length) {
    out.push('| Engagement | Stage | Waiting on | Idle | Next |');
    out.push('| --- | --- | --- | ---: | --- |');
    for (const e of live) {
      const d = days(e.moved);
      out.push(`| [${e.client} — ${e.name}](clients/${e.rel}/engagement.md) | ${e.stage} | ${e.waiting} | ${d === null ? '?' : d + 'd'} | ${e.next || '—'} |`);
    }
    out.push('');
  }

  // The queue that actually matters: what is ours to move.
  const ours = live.filter(e => e.waiting === 'us');
  out.push('## Ours to move');
  out.push('');
  if (!ours.length) out.push('_Nothing is waiting on us._');
  else for (const e of ours) out.push(`- **${e.client} — ${e.name}** (${e.stage}) — ${e.next || 'no next action written down'}`);
  out.push('');

  const rest = all.filter(e => e.resting || e.stage === 'closed');
  if (rest.length) {
    out.push('## Closed, parked and ended');
    out.push('');
    for (const e of rest) out.push(`- ${e.client} — ${e.name} · ${e.stage}${e.moved ? ` · ${e.moved}` : ''}`);
    out.push('');
  }

  writeFileSync(path.join(WS, 'ENGAGEMENTS.md'), out.join('\n'));
  console.log(`✓ ENGAGEMENTS.md — ${live.length} live, ${rest.length} at rest`);
}

function cmdCheck(limit) {
  const all = load();
  const stale = all
    .filter(e => !e.resting && e.stage !== 'closed')
    .map(e => ({ e, d: days(e.moved) }))
    .filter(x => x.d !== null && x.d > limit);
  const nameless = all.filter(e => !e.resting && e.stage !== 'closed' && !e.next.trim());

  if (!stale.length && !nameless.length) {
    console.log(`✓ every live engagement has moved inside ${limit} days and says what's next`);
    return;
  }
  for (const { e, d } of stale) {
    console.log(`STALLED  ${e.rel} — ${d} days in "${e.stage}", waiting on ${e.waiting}`);
  }
  for (const e of nameless) {
    console.log(`NO NEXT  ${e.rel} — no next action written down`);
  }
  process.exit(1);
}

/* ── entry ─────────────────────────────────────────────────────────────── */

const [cmd, ...rest] = process.argv.slice(2);
const flag = (n, d) => { const i = rest.indexOf(n); return i >= 0 ? rest[i + 1] : d; };
const positional = rest.filter((a, i) => !a.startsWith('--') && !(i > 0 && rest[i - 1].startsWith('--')));

switch (cmd) {
  case 'new':   cmdNew(positional[0], positional[1]); break;
  case 'list':  cmdList(); break;
  case 'stage': cmdStage(positional[0], positional[1], positional.slice(2).join(' ')); break;
  case 'note':  cmdNote(positional[0], positional.slice(1).join(' ')); break;
  case 'board': cmdBoard(); break;
  case 'check': cmdCheck(Number(flag('--days', 14))); break;
  default:
    console.log(`Engagements — what we're doing for whom, and where it stands.

  node engagements.mjs new <client> <engagement>    scaffold one
  node engagements.mjs list                         the board in the terminal
  node engagements.mjs stage <path> <stage> [note]  advance it, stamped + logged
  node engagements.mjs note <path> "<note>"         append to its log
  node engagements.mjs board                        rewrite ENGAGEMENTS.md
  node engagements.mjs check [--days 14]            exit 1 if anything stalled

  stages   ${STAGES.join(' → ')}
           (plus ${RESTING.join(', ')})
  waiting  ${WAITING.join(' · ')}

Every engagement is a markdown file under clients/<client>/<engagement>/.
Edit them by hand whenever you like — this script only does the mechanical
parts. Run it from the workspace root.`);
}
