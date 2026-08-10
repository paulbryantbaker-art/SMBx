#!/usr/bin/env node
/**
 * retired-check — does anything we ship still carry a figure we killed?
 *
 * `audit.mts` proves a figure is TRACEABLE. It cannot prove it is TRUE, and a
 * faithfully-carried fabrication audits green. Every figure this tool looks for
 * audited clean at the time it was published; each was retired later by a named
 * correction pass. Three of them were live on LinkedIn when they were retired.
 *
 * The gap this closes is the one the rules have described since July:
 * derived artifacts do not follow the master, and nothing mechanical tells you
 * a posted carousel is carrying a dead number.
 *
 * WHAT IT IS NOT. This tool does not decide anything. It reports CANDIDATES —
 * a retired pattern appearing near its context words. A number is not wrong
 * because it is 40%; it is wrong when it is 40% used as the recurring-revenue
 * threshold. Every hit needs a human read. Zero hits is meaningful; a hit is a
 * question.
 *
 * Reads   markets/<m>/retired.md      the curated denylist (see that file)
 * Scans   markets/<m>/specs/*.mts     the words that become collateral
 *         markets/<m>/documents/*.md  report sources
 *         collateral + decks .txt     the captions that ship with a post
 *         specs/*.mts                 house-level specs at the studio root
 *
 * Does NOT scan master.md or versions/ — the master is where retirements are
 * RECORDED, so it names every retired figure on purpose and would hit on all
 * of them. Pass --include-master to override.
 *
 * Zero dependencies. Plain node, no tsx, no install, no network.
 *
 *   node retired-check.mjs --studio ~/Documents/smbx-studio
 *   node retired-check.mjs --studio . --market home-services
 *   node retired-check.mjs --studio . --json
 *
 * Exit 0 = no candidates. Exit 1 = candidates found. Exit 2 = could not run.
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, basename, dirname } from 'node:path';

/* ── args ─────────────────────────────────────────────────────────────── */

const argv = process.argv.slice(2);
function arg(name, fallback = null) {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback;
}
const STUDIO = arg('studio', process.cwd());
const ONLY_MARKET = arg('market');
const AS_JSON = argv.includes('--json');
const INCLUDE_MASTER = argv.includes('--include-master');

/* How far either side of a pattern to look for its context words. Roughly one
 * sentence. Wider catches more real hits and starts pulling in the NEXT claim
 * in a caption array, which is how a guard earns being ignored. --window to
 * tune; widen it when hunting, not when reporting. */
const CONTEXT_WINDOW = Number(arg('window', 160));

if (!existsSync(join(STUDIO, 'markets'))) {
  console.error(`Not a studio workspace: ${STUDIO}\n  (no markets/ directory — pass --studio <path>)`);
  process.exit(2);
}

/* ── normalisation ────────────────────────────────────────────────────────
 * A retired figure resurfaces through a copy-paste, so it arrives with
 * whatever punctuation the source used. "3–4 turn", "3-4 turn" and
 * "3‑4 turn" are the same claim. Fold every dash to "-", every space
 * variant to " ", and compare lowercased.                                  */

const DASHES = /[‐‑‒–—―−]/g;
const SPACES = /[     ]/g;

function normalise(s) {
  return s.replace(DASHES, '-').replace(SPACES, ' ').toLowerCase();
}

/* ── the denylist ─────────────────────────────────────────────────────── */

function parseRetired(path) {
  const entries = [];
  let cur = null;
  for (const raw of readFileSync(path, 'utf8').split('\n')) {
    const head = raw.match(/^###\s+(\S+)\s*·\s*(.+?)\s*$/);
    if (head) {
      if (cur?.pattern) entries.push(cur);
      cur = { id: head[1], title: head[2], pattern: null, requires: [], ledger: '', verdict: '' };
      continue;
    }
    if (!cur) continue;
    const field = raw.match(/^-\s+(pattern|requires|ledger|verdict):\s*(.+?)\s*$/i);
    if (!field) continue;
    const [, key, value] = field;
    if (key.toLowerCase() === 'pattern') cur.pattern = normalise(value);
    else if (key.toLowerCase() === 'requires') cur.requires = value.split('|').map(w => normalise(w.trim())).filter(Boolean);
    else if (key.toLowerCase() === 'ledger') cur.ledger = value;
    else cur.verdict = value;
  }
  if (cur?.pattern) entries.push(cur);
  return entries;
}

/* ── what to scan ─────────────────────────────────────────────────────── */

function walk(dir, test, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git' || name === '_archive') continue;
    const p = join(dir, name);
    let st; try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, test, out);
    else if (test(p)) out.push(p);
  }
  return out;
}

function targetsFor(marketDir) {
  const files = [];
  files.push(...walk(join(marketDir, 'specs'), p => p.endsWith('.mts')));
  files.push(...walk(join(marketDir, 'documents'), p => p.endsWith('.md')));
  files.push(...walk(join(marketDir, 'collateral'), p => p.endsWith('.txt')));
  files.push(...walk(join(marketDir, 'decks'), p => p.endsWith('.txt')));
  if (INCLUDE_MASTER) {
    const m = join(marketDir, 'master.md');
    if (existsSync(m)) files.push(m);
  }
  return files;
}

/* ── the scan ─────────────────────────────────────────────────────────── */

/* Which byte ranges of a source file are comment, not content.
 *
 * These specs carry long provenance headers that NAME the figures they had to
 * drop — hs-buybox.deck.mts opens with 27 lines of exactly that. So does the
 * master's A.0.x. A retired figure quoted in a comment is the record of the
 * fix, not the defect, and reporting it as a candidate is how a guard becomes
 * noise. Comment hits are kept and shown separately, because a comment
 * claiming a figure was removed while the body still carries it is worth
 * seeing — but they are not candidates. */
function commentMask(text) {
  const mask = new Uint8Array(text.length);
  let i = 0, inBlock = false, inLine = false, inStr = null;
  while (i < text.length) {
    const c = text[i], d = text[i + 1];
    if (inBlock) { mask[i] = 1; if (c === '*' && d === '/') { mask[i + 1] = 1; i += 2; inBlock = false; continue; } i++; continue; }
    if (inLine) { if (c === '\n') { inLine = false; i++; continue; } mask[i] = 1; i++; continue; }
    if (inStr) { if (c === '\\') { i += 2; continue; } if (c === inStr) inStr = null; i++; continue; }
    if (c === '/' && d === '*') { mask[i] = mask[i + 1] = 1; i += 2; inBlock = true; continue; }
    if (c === '/' && d === '/') { mask[i] = mask[i + 1] = 1; i += 2; inLine = true; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c; i++; continue; }
    i++;
  }
  return mask;
}

/* The same problem in markdown.
 *
 * A report source carries the provenance appendices — `## A.0 Provenance`
 * through `## A.4` — and those sections exist precisely to NAME every retired
 * figure "so they stay recognisable if they resurface from an older copy."
 * market-assessment.md produced 97 matches on its first run and 96 of them
 * were its own correction ledger. Mask the A.<n> appendices and their
 * subsections; everything before and after is body, and body is what ships. */
function appendixMask(text) {
  const mask = new Uint8Array(text.length);
  const lines = text.split('\n');
  let off = 0, inAppendix = false;
  for (const line of lines) {
    const h2 = /^##\s+(.+)$/.exec(line);
    if (h2) inAppendix = /^A\.\d/.test(h2[1].trim());
    if (inAppendix) mask.fill(1, off, off + line.length + 1);
    off += line.length + 1;
  }
  return mask;
}

function scan(file, entries) {
  let text;
  try { text = readFileSync(file, 'utf8'); } catch { return []; }
  const isCode = /\.(mts|ts|mjs|js)$/.test(file);
  const mask = isCode ? commentMask(text) : (file.endsWith('.md') ? appendixMask(text) : null);
  const flat = normalise(text);
  const lines = text.split('\n');
  const lineStart = [];
  let acc = 0;
  for (const l of lines) { lineStart.push(acc); acc += l.length + 1; }
  const lineAt = idx => {
    let lo = 0, hi = lineStart.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (lineStart[mid] <= idx) lo = mid; else hi = mid - 1; }
    return lo;
  };

  const hits = [];
  for (const e of entries) {
    let from = 0;
    for (;;) {
      const at = flat.indexOf(e.pattern, from);
      if (at < 0) break;
      from = at + e.pattern.length;

      if (e.requires.length) {
        const ctx = flat.slice(Math.max(0, at - CONTEXT_WINDOW), at + e.pattern.length + CONTEXT_WINDOW);
        if (!e.requires.some(w => ctx.includes(w))) continue;
      }
      const ln = lineAt(at);
      hits.push({
        entry: e,
        line: ln + 1,
        inComment: mask ? mask[at] === 1 : false,
        excerpt: lines[ln].trim().slice(0, 160),
      });
    }
  }
  return hits;
}

/* ── which posted folders a flagged spec reaches ──────────────────────── */

function postedFrom(marketDir, specPath) {
  const slug = basename(specPath).replace(/\.(deck|post)\.mts$/, '').replace(/\.mts$/, '');
  const out = [];
  for (const kind of ['collateral', 'decks']) {
    const d = join(marketDir, kind, slug);
    if (!existsSync(d)) continue;
    for (const date of readdirSync(d)) {
      const p = join(d, date);
      try { if (statSync(p).isDirectory()) out.push(relative(STUDIO, p)); } catch { /* ignore */ }
    }
  }
  return out.sort();
}

/* ── run ──────────────────────────────────────────────────────────────── */

const marketsDir = join(STUDIO, 'markets');
const markets = readdirSync(marketsDir)
  .filter(m => !m.startsWith('_') && !m.startsWith('.'))
  .filter(m => { try { return statSync(join(marketsDir, m)).isDirectory(); } catch { return false; } })
  .filter(m => !ONLY_MARKET || m === ONLY_MARKET);

const report = { markets: [], totals: { candidates: 0, documented: 0, files: 0, scanned: 0, noRegister: [] } };

const shape = h => ({ id: h.entry.id, title: h.entry.title, ledger: h.entry.ledger, verdict: h.entry.verdict, line: h.line, excerpt: h.excerpt });

function record(m, file, hits, posted) {
  const live = hits.filter(h => !h.inComment);
  const documented = hits.filter(h => h.inComment);
  report.totals.documented += documented.length;
  if (!live.length) return;
  m.files.push({ path: relative(STUDIO, file), posted, hits: live.map(shape), documentedCount: documented.length });
  report.totals.candidates += live.length;
  report.totals.files++;
}

for (const market of markets) {
  const marketDir = join(marketsDir, market);
  const registerPath = join(marketDir, 'retired.md');
  if (!existsSync(registerPath)) { report.totals.noRegister.push(market); continue; }

  const entries = parseRetired(registerPath);
  const files = targetsFor(marketDir);
  const m = { market, entries: entries.length, scanned: files.length, files: [] };

  for (const f of files) {
    report.totals.scanned++;
    record(m, f, scan(f, entries), f.endsWith('.mts') ? postedFrom(marketDir, f) : []);
  }
  report.markets.push(m);
}

/* ── house-level specs at the studio root, checked against every register ── */

const rootSpecs = walk(join(STUDIO, 'specs'), p => p.endsWith('.mts'));
if (rootSpecs.length) {
  const all = [];
  for (const market of markets) {
    const rp = join(marketsDir, market, 'retired.md');
    if (existsSync(rp)) all.push(...parseRetired(rp).map(e => ({ ...e, id: `${e.id} (${market})` })));
  }
  const m = { market: 'house (studio root)', entries: all.length, scanned: rootSpecs.length, files: [] };
  for (const f of rootSpecs) {
    report.totals.scanned++;
    record(m, f, scan(f, all), []);
  }
  if (m.entries) report.markets.push(m);
}

/* ── output ───────────────────────────────────────────────────────────── */

if (AS_JSON) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.totals.candidates ? 1 : 0);
}

const B = s => `\x1b[1m${s}\x1b[0m`;
console.log('');
console.log(B('  retired-check — figures we killed, still in things we ship'));
console.log('  ' + '='.repeat(58));

const SUMMARY = argv.includes('--summary');

for (const m of report.markets) {
  console.log('');
  console.log(B(`  ${m.market}`) + `  ·  ${m.entries} retired figures  ·  ${m.scanned} files scanned`);
  if (!m.files.length) { console.log('    clean — no retired figure appears in anything shippable'); continue; }
  for (const f of m.files) {
    if (SUMMARY) {
      const ids = [...new Set(f.hits.map(h => h.id.split(' ')[0]))].join(' ');
      console.log(`    ${f.hits.length}x  ${f.path}`);
      console.log(`         ${ids}${f.posted.length ? `   -> ${f.posted.length} posted folder(s)` : ''}`);
      continue;
    }
    console.log('');
    console.log(`    ${B(f.path)}`);
    for (const h of f.hits) {
      console.log(`      line ${h.line}  ${h.id} — ${h.title}   [${h.ledger}]`);
      console.log(`        > ${h.excerpt}`);
      console.log(`        ${h.verdict}`);
    }
    if (f.documentedCount) {
      console.log(`      (+${f.documentedCount} more in a comment or an A.x appendix — the record of the fix)`);
    }
    if (f.posted.length) {
      console.log(`      REACHES ${f.posted.length} posted folder(s):`);
      for (const p of f.posted) console.log(`        ${p}`);
    }
  }
}

console.log('');
console.log('  ' + '='.repeat(58));
if (report.totals.noRegister.length) {
  console.log(`  NO REGISTER: ${report.totals.noRegister.join(', ')}`);
  console.log('    These markets were NOT checked. A market without a retired.md is');
  console.log('    unchecked, not clean. Write one as its first correction pass lands.');
}
if (!report.totals.candidates) {
  console.log(`  CLEAN — ${report.totals.scanned} files scanned, no retired figure found.`);
  console.log('  This proves no KNOWN-retired figure is present. It does not prove the');
  console.log('  figures that ARE present are true — that is job 2, and it is human.');
} else {
  console.log(`  ${report.totals.candidates} CANDIDATE(S) in ${report.totals.files} file(s).`);
  console.log('  Each is a pattern near its context words, not a verdict. Read every one:');
  console.log('  a figure is wrong in a use, not in isolation.');
}
if (report.totals.documented) {
  console.log(`  ${report.totals.documented} further match(es) sit in a comment or an A.x appendix and are`);
  console.log('  NOT counted — naming a figure you dropped is the record of the fix.');
}
console.log('');
process.exit(report.totals.candidates ? 1 : 0);
