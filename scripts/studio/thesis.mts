/**
 * The thesis register — what we believe, for whom, off which facts.
 *
 * Paul, 2026-07-27: "let's create the thesis builder for any of our verticals
 * and save it such that Cowork can access it any time as we may have multiple
 * thesis for the same markets."
 *
 * A thesis is not a document, it is a POSITION. Positions differ by who you
 * hold them for, they age as the research beneath them moves, and their
 * "what has to be true" list is the actual product — the falsifiable core.
 * One `thesis.md` per market carries none of that.
 *
 * So each thesis carries front matter naming the market, the buyer profile,
 * and THE MASTER VERSION IT WAS BUILT FROM. That last field is what makes
 * staleness mechanical rather than remembered: the master moves to v4 and
 * this says, out loud, that the position rests on v2.
 *
 *   thesis.mts new <market> <profile>   scaffold one, stamped with the
 *                                       current master version
 *   thesis.mts list                     every thesis, with staleness
 *   thesis.mts check                    same, but exits non-zero if any
 *                                       active thesis is behind its master
 *   thesis.mts register                 rewrite THESES.md from what is on disk
 *
 * Run from the workspace root. No API, no database — it reads folders.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const WS = process.cwd();
const MARKETS = path.join(WS, 'markets');

type Front = Record<string, string>;
interface Thesis {
  file: string; market: string; profile: string;
  builtOn: number | null;     // master version this position rests on
  masterNow: number | null;   // where that master is today
  status: string; title: string; date: string;
  assumptions: { text: string; state: string }[];
}

/* ── front matter: a --- fenced block of key: value at the top ── */
function parseFront(md: string): { front: Front; body: string } {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(md);
  if (!m) return { front: {}, body: md };
  const front: Front = {};
  for (const line of m[1].split('\n')) {
    const kv = /^\s*([A-Za-z_][\w-]*)\s*:\s*(.*?)\s*$/.exec(line);
    if (kv) front[kv[1].toLowerCase()] = kv[2];
  }
  return { front, body: md.slice(m[0].length) };
}

/** How many master versions a market has on disk (versions/master-vN.md). */
function masterVersion(marketDir: string): number | null {
  const vdir = path.join(marketDir, 'versions');
  let top = 0;
  if (existsSync(vdir)) {
    for (const f of readdirSync(vdir)) {
      const n = /master-v(\d+)\.md$/i.exec(f);
      if (n) top = Math.max(top, Number(n[1]));
    }
  }
  // A market with master.md but no versions/ is v1 by construction.
  if (!top && existsSync(path.join(marketDir, 'master.md'))) return 1;
  return top || null;
}

/**
 * The assumptions from "What has to be true" — the section that makes a
 * thesis falsifiable. A leading [x]/[~]/[ ] marks tested/partial/untested.
 */
function readAssumptions(body: string): { text: string; state: string }[] {
  const sec = /##\s*What has to be true[^\n]*\n([\s\S]*?)(?=\n##\s|\n#\s|$)/i.exec(body);
  if (!sec) return [];
  const out: { text: string; state: string }[] = [];
  for (const line of sec[1].split('\n')) {
    const li = /^\s*(?:[-*]|\d+\.)\s+(.*)$/.exec(line);
    if (!li) continue;
    const t = li[1].trim();
    if (!t) continue;
    const mark = /^\[([ x~?])\]\s*/i.exec(t);
    const text = (mark ? t.slice(mark[0].length) : t).replace(/\*\*/g, '').trim().slice(0, 120);
    // An unfilled scaffold bullet is not an assumption. Counting it would
    // report three assumptions on a thesis that states none.
    if (!text) continue;
    out.push({
      state: mark ? ({ x: 'confirmed', '~': 'partial', '?': 'testing', ' ': 'untested' }[mark[1].toLowerCase()] || 'untested') : 'untested',
      text,
    });
  }
  return out;
}

function scan(): Thesis[] {
  if (!existsSync(MARKETS)) return [];
  const out: Thesis[] = [];
  for (const market of readdirSync(MARKETS)) {
    const dir = path.join(MARKETS, market);
    const docs = path.join(dir, 'documents');
    if (!existsSync(docs)) continue;
    const now = masterVersion(dir);
    for (const f of readdirSync(docs)) {
      if (!/^thesis.*\.md$/i.test(f)) continue;
      const md = readFileSync(path.join(docs, f), 'utf8');
      const { front, body } = parseFront(md);
      const built = front.master_version ? Number(front.master_version) : null;
      out.push({
        file: path.join('markets', market, 'documents', f),
        market: front.market || market,
        profile: front.profile || (/thesis-(.+)\.md$/i.exec(f)?.[1] ?? 'general').replace(/-/g, ' '),
        builtOn: Number.isFinite(built as number) ? built : null,
        masterNow: now,
        status: (front.status || 'draft').toLowerCase(),
        title: (/^#\s+(.+)$/m.exec(body)?.[1] || f).slice(0, 80),
        date: front.date || '',
        assumptions: readAssumptions(body),
      });
    }
  }
  return out.sort((a, b) => a.market.localeCompare(b.market) || a.profile.localeCompare(b.profile));
}

const staleness = (t: Thesis): string => {
  // Order matters: "no master" is the truer diagnosis than "no provenance"
  // when the market has nothing to be built on in the first place.
  if (t.masterNow == null) return 'RESTS ON NOTHING — this market has no master';
  if (t.builtOn == null) return 'NO PROVENANCE — front matter has no master_version';
  const behind = t.masterNow - t.builtOn;
  if (behind > 0) return `${behind} version${behind === 1 ? '' : 's'} behind (built on v${t.builtOn}, master is v${t.masterNow})`;
  // Ahead of what's on disk: the version it names does not exist, so the
  // provenance is wrong. Reading that as "current" would hide a broken claim.
  if (behind < 0) return `claims master v${t.builtOn}, but only v${t.masterNow} exists`;
  return 'current';
};

/* ── commands ─────────────────────────────────────────────────────────── */

const [cmd, ...rest] = process.argv.slice(2);

if (cmd === 'new') {
  const [market, ...profileParts] = rest;
  const profile = profileParts.join(' ');
  if (!market || !profile) {
    console.error('Usage: thesis.mts new <market> <buyer profile>');
    console.error('  e.g. thesis.mts new home-services family-office');
    process.exit(1);
  }
  const dir = path.join(MARKETS, market);
  if (!existsSync(dir)) { console.error(`No such market: markets/${market}`); process.exit(1); }
  const v = masterVersion(dir);
  if (v == null) console.error(`! markets/${market} has no master yet — build one first, or this thesis rests on nothing.`);

  const slug = profile.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const file = path.join(dir, 'documents', `thesis-${slug}.md`);
  if (existsSync(file)) { console.error(`Already exists: ${path.relative(WS, file)}`); process.exit(1); }
  mkdirSync(path.join(dir, 'documents'), { recursive: true });

  const today = new Date().toISOString().slice(0, 10);
  writeFileSync(file, `---
market: ${market}
profile: ${profile}
master_version: ${v ?? ''}
date: ${today}
status: draft
---

# ${market}: investment thesis — ${profile}

> Scaffold. Fill each section from the master; every figure carries its source.
> See PLAYBOOK.md for what belongs in each one, and THE LINE for what may not.

## The thesis in one paragraph

## Why this market, now

## What we would buy

## How value is created after close

## What has to be true

Mark each as you test it: \`[ ]\` untested · \`[?]\` testing · \`[~]\` partial · \`[x]\` confirmed.
If one of these is false, the thesis fails — so make each one specific enough to check.

- [ ]
- [ ]
- [ ]

## What would kill it

## How we would test it

## What we don't know yet
`);
  console.log(`✓ ${path.relative(WS, file)}`);
  console.log(`  market ${market} · profile ${profile} · built on master v${v ?? '—'}`);
  console.log(`  Fill it from the master, then: thesis.mts register`);
  process.exit(0);
}

if (cmd === 'register') {
  const all = scan();
  const lines = [
    '# Theses',
    '',
    'Every position we hold, who it is for, and which facts it rests on.',
    'Generated by `thesis.mts register` — edit the theses, not this file.',
    '',
    '| Market | Buyer profile | Status | Built on | Master now | Standing | File |',
    '|---|---|---|---|---|---|---|',
  ];
  for (const t of all) {
    const s = staleness(t);
    lines.push(`| ${t.market} | ${t.profile} | ${t.status} | ${t.builtOn ? 'v' + t.builtOn : '—'} | ${t.masterNow ? 'v' + t.masterNow : '—'} | ${s === 'current' ? 'current' : '**' + s + '**'} | \`${t.file}\` |`);
  }
  if (!all.length) lines.push('| _none yet_ | | | | | | |');

  // The assumption ledger — the part that makes a thesis a position rather
  // than an essay. Untested assumptions are the work list.
  const withAssumptions = all.filter(t => t.assumptions.length);
  if (withAssumptions.length) {
    lines.push('', '## What has to be true', '');
    for (const t of withAssumptions) {
      lines.push(`### ${t.market} — ${t.profile}`, '');
      for (const a of t.assumptions) {
        const box = { confirmed: '[x]', partial: '[~]', testing: '[?]', untested: '[ ]' }[a.state] || '[ ]';
        lines.push(`- ${box} ${a.text}`);
      }
      lines.push('');
    }
  }
  writeFileSync(path.join(WS, 'THESES.md'), lines.join('\n') + '\n');
  console.log(`✓ THESES.md — ${all.length} thesis/theses across ${new Set(all.map(t => t.market)).size} market(s)`);
  process.exit(0);
}

if (cmd === 'list' || cmd === 'check' || !cmd) {
  const all = scan();
  if (!all.length) {
    console.log('\nNo theses yet.  thesis.mts new <market> <profile>\n');
    process.exit(0);
  }
  console.log('');
  let stale = 0, noProv = 0;
  for (const t of all) {
    const s = staleness(t);
    const bad = s !== 'current';
    if (bad && t.status === 'active') stale++;
    // Only a missing stamp on a market that HAS a master is a fixable gap;
    // "no master at all" already says the truer thing on its own line.
    if (t.builtOn == null && t.masterNow != null) noProv++;
    const untested = t.assumptions.filter(a => a.state === 'untested').length;
    console.log(`${bad ? '!' : '·'} ${t.market} — ${t.profile}  [${t.status}]`);
    console.log(`    ${s}`);
    // A thesis with no stated assumptions isn't falsifiable yet, which is the
    // one thing a thesis has to be. Say so rather than printing nothing.
    console.log(t.assumptions.length
      ? `    ${t.assumptions.length} assumption(s), ${untested} untested`
      : `    no assumptions stated — nothing here can be tested yet`);
    console.log(`    ${t.file}`);
  }
  console.log('');
  if (noProv) console.log(`${noProv} thesis/theses have no master_version in front matter — add one so staleness can be checked.`);
  if (stale) {
    console.log(`${stale} ACTIVE thesis/theses rest on facts that have moved. Re-read them against the current master before they go anywhere.\n`);
    if (cmd === 'check') process.exit(1);
  } else if (cmd === 'check') {
    console.log('All active theses are current.\n');
  }
  process.exit(0);
}

console.error(`Unknown command: ${cmd}`);
console.error('Usage: thesis.mts [list|check|new <market> <profile>|register]');
process.exit(1);
