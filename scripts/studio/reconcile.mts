/**
 * Reconcile candidate rows into the client register — the CLI half.
 * All matching, merging and refusal logic lives in house/reconcile.ts (pure,
 * tested by `npm run test:reconcile`); this file does the fs, nothing else.
 *
 * Usage, from `studio/clients/` (paths are flags, so anywhere works):
 *
 *   npx tsx <repo>/scripts/studio/reconcile.mts propose --candidates candidates.csv
 *   npx tsx <repo>/scripts/studio/reconcile.mts propose                # run 0 — alias backfill
 *   npx tsx <repo>/scripts/studio/reconcile.mts apply --queue reconcile/<date>/review-queue.csv
 *
 * Flags: --register <file> (default ./crm-bundle/02_organizations.csv, else the
 * repo's studio/clients copy) · --aliases <file> (default reconcile/aliases.csv
 * beside the register, if present; `alias,canonical` rows — the Reedy
 * Industries / PremiStar map) · --out <dir> · --date YYYY-MM-DD · --dry-run
 * (compute everything, write NOTHING, print the log).
 *
 * Writes, and only these: the register IN PLACE (MATCHED merges + NEW appends,
 * VERIFIED candidates only) · reconcile/<date>/review-queue.csv ·
 * reconcile/<date>/RECONCILE_LOG.md. The dated hunt emissions under
 * `clients/candidates/` are RECORDS — this tool refuses to write anything on a
 * path inside a candidates/ folder, ever.
 *
 * Exit codes, house convention: 0 clean · 1 findings (a review queue to
 * adjudicate, or held/undecided rows) · 2 cannot-run (refusal — nothing written).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { csvRecords } from '../../house/screen.js';
import {
  applyDecisions, propose, toQuotedCsv,
  QUEUE_COLUMNS, type AliasPair, type QueueRow, type Row,
} from '../../house/reconcile.js';

const argv = process.argv.slice(2);
const verb = argv[0];
if (verb !== 'propose' && verb !== 'apply') {
  console.error('Usage: reconcile.mts propose [--candidates <file.csv>] [--register <file>] [--aliases <file>] [--out <dir>] [--date YYYY-MM-DD] [--dry-run]');
  console.error('       reconcile.mts apply   --queue <review-queue.csv> [--register <file>] [--date YYYY-MM-DD] [--dry-run]');
  process.exit(2);
}
const flag = (name: string): string | undefined => {
  const i = argv.indexOf('--' + name);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : undefined;
};
const has = (name: string) => argv.includes('--' + name);
const dryRun = has('dry-run');

/* "Today" is the LOCAL day — toISOString() is UTC and flips at 7pm Central,
   the trap Leads.tsx already documents. */
const localToday = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const runDate = flag('date') || localToday();
if (!/^\d{4}-\d{2}-\d{2}$/.test(runDate)) { console.error(`--date must be YYYY-MM-DD (got "${runDate}")`); process.exit(2); }

/* ── locate the register ── */
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
let registerPath = flag('register');
if (!registerPath) {
  const candidates = [
    path.resolve('crm-bundle/02_organizations.csv'),
    path.join(repoRoot, 'studio/clients/crm-bundle/02_organizations.csv'),
  ];
  registerPath = candidates.find(existsSync);
  if (!registerPath) {
    console.error('No register found. Looked for:\n' + candidates.map(c => '  ' + c).join('\n') + '\nPass --register <file>.');
    process.exit(2);
  }
} else registerPath = path.resolve(registerPath);
if (!existsSync(registerPath)) { console.error(`Register file missing: ${registerPath}`); process.exit(2); }

/* The dated emissions under clients/candidates/ are RECORDS. Nothing here may
   write inside a candidates/ folder — including a --register pointed at one. */
const insideCandidates = (p: string) =>
  path.resolve(p).split(path.sep).includes('candidates') || path.basename(p) === 'candidates.csv';
if (insideCandidates(registerPath)) {
  console.error(`REFUSED: --register points into the candidates funnel/records (${registerPath}).`);
  console.error('The register is crm-bundle/02_organizations.csv; candidate files are read-only inputs (--candidates).');
  process.exit(2);
}

/* Outputs anchor to the register's clients/ folder, not the cwd. */
const clientsDir = path.basename(path.dirname(registerPath)) === 'crm-bundle'
  ? path.dirname(path.dirname(registerPath))
  : path.dirname(registerPath);
const outDir = path.resolve(flag('out') || path.join(clientsDir, 'reconcile', runDate));
if (insideCandidates(outDir)) { console.error(`REFUSED: --out points into a candidates/ folder (${outDir}) — those are records.`); process.exit(2); }
const logPath = path.join(outDir, 'RECONCILE_LOG.md');
const queuePath = path.join(outDir, 'review-queue.csv');

/* ── shared readers ── */
function readTable(p: string): { cols: string[]; rows: Row[]; bom: boolean; crlf: boolean } {
  const text = readFileSync(p, 'utf8');
  const shape = { bom: text.startsWith('﻿'), crlf: text.includes('\r\n') };
  const records = csvRecords(text);
  if (!records.length) return { cols: [], rows: [], ...shape };
  const cols = records[0].map(h => h.trim());
  const rows = records.slice(1)
    .filter(r => r.some(v => v.trim() !== ''))
    .map(r => {
      const o: Row = {};
      cols.forEach((h, i) => { if (h) o[h] = (r[i] ?? '').trim(); });
      return o;
    });
  return { cols, rows, ...shape };
}

function readAliasPairs(): { pairs: AliasPair[]; from: string | null } {
  const p = flag('aliases') || path.join(clientsDir, 'reconcile', 'aliases.csv');
  if (!existsSync(p)) {
    if (flag('aliases')) { console.error(`Alias map missing: ${p}`); process.exit(2); }
    return { pairs: [], from: null };
  }
  const { cols, rows } = readTable(p);
  if (!cols.includes('alias') || !cols.includes('canonical')) {
    console.error(`Alias map ${p} must carry "alias" and "canonical" columns (got: ${cols.join(', ') || 'nothing'})`);
    process.exit(2);
  }
  const pairs = rows
    .map(r => [(r.alias || '').trim(), (r.canonical || '').trim()] as AliasPair)
    .filter(([a, b]) => a && b);
  return { pairs, from: p };
}

const reg = readTable(registerPath);
if (!reg.cols.length) { console.error(`Register is unparseable or empty: ${registerPath}`); process.exit(2); }
const { pairs: aliasPairs, from: aliasFrom } = readAliasPairs();

const writeRegister = (cols: string[], rows: Row[]) => {
  // Preserve the file's own shape — BOM kept, CRLF kept, every field quoted,
  // column order from the file itself — so the merge diff shows the merge and
  // nothing else. (The live register is BOM + CRLF; measured, not assumed.)
  const extra: string[] = [];
  for (const r of rows) for (const k of Object.keys(r)) if (!cols.includes(k) && !extra.includes(k)) extra.push(k);
  writeFileSync(registerPath, (reg.bom ? '﻿' : '') + toQuotedCsv([...cols, ...extra], rows, reg.crlf ? '\r\n' : '\n'));
};

/* ── propose ── */
if (verb === 'propose') {
  const candPath = flag('candidates');
  let candidates: { cols: string[]; rows: Row[]; label: string } | null = null;
  if (candPath) {
    const p = path.resolve(candPath);
    if (!existsSync(p)) { console.error(`Candidate file missing: ${p}`); process.exit(2); }
    const t = readTable(p);
    if (!t.cols.length) { console.error(`Candidate file is unparseable or empty: ${p}`); process.exit(2); }
    const label = path.basename(p, path.extname(p)).replace(/^\d{4}-\d{2}-\d{2}-/, '');
    candidates = { cols: t.cols, rows: t.rows, label };
  }

  const result = propose({
    register: reg.rows, registerCols: reg.cols,
    registerLabel: path.basename(registerPath),
    candidates, aliasPairs, runDate,
  });

  if (!result.ok) {
    console.error(`REFUSED — nothing written:\n` + result.refusals.map(r => '  - ' + r).join('\n'));
    process.exit(2);
  }
  if (aliasFrom) console.log(`alias map      ${path.relative(process.cwd(), aliasFrom)} (${aliasPairs.length} pair(s))`);
  console.log(result.log);

  if (dryRun) {
    console.log(`--dry-run: nothing written (register would go ${result.counts.registerIn} → ${result.counts.registerOut}; queue would carry ${result.queue.length} row(s))`);
    process.exit(result.exitCode);
  }

  if (existsSync(queuePath)) {
    console.error(`REFUSED: ${queuePath} already exists — an adjudication may be in progress.`);
    console.error('Apply it (or clear it deliberately), or pass --out <dir> for a separate run.');
    process.exit(2);
  }
  mkdirSync(outDir, { recursive: true });
  writeFileSync(queuePath, toQuotedCsv(QUEUE_COLUMNS, result.queue as Row[]));
  // Newest first, one section per run: new sections land right after the header.
  let logText: string;
  if (existsSync(logPath)) {
    const prior = readFileSync(logPath, 'utf8');
    const i = prior.indexOf('\n## ');
    logText = i >= 0 ? prior.slice(0, i + 1) + result.log + '\n' + prior.slice(i + 1) : prior + '\n' + result.log;
  } else {
    logText = `# RECONCILE LOG — ${runDate}\n\nNewest first. One section per run. Written by scripts/studio/reconcile.mts.\n\n` + result.log;
  }
  writeFileSync(logPath, logText);
  writeRegister(result.registerCols, result.register);

  console.log(`register       ${path.relative(process.cwd(), registerPath)} rewritten (${result.counts.registerIn} → ${result.counts.registerOut} rows)`);
  console.log(`review queue   ${path.relative(process.cwd(), queuePath)} (${result.queue.length} row(s))`);
  console.log(`log            ${path.relative(process.cwd(), logPath)}`);
  if (result.queue.length) {
    const self = path.relative(process.cwd(), fileURLToPath(import.meta.url));
    console.log(`\nAdjudicate the queue (decision column: merge:ORG-NNN · new · skip · disqualify · alias:<text>), then:\n  npx tsx ${self.startsWith('..') ? fileURLToPath(import.meta.url) : self} apply --queue ${path.relative(process.cwd(), queuePath)}`);
  }
  process.exit(result.exitCode);
}

/* ── apply ── */
const queueArg = flag('queue');
if (!queueArg) { console.error('apply needs --queue <review-queue.csv>'); process.exit(2); }
const qPath = path.resolve(queueArg);
if (!existsSync(qPath)) { console.error(`Queue file missing: ${qPath}`); process.exit(2); }
const qt = readTable(qPath);
const missing = QUEUE_COLUMNS.filter(c => !qt.cols.includes(c));
if (missing.length) { console.error(`Queue is missing column(s): ${missing.join(', ')} — is this a review-queue.csv?`); process.exit(2); }

const applyResult = applyDecisions({
  register: reg.rows, registerCols: reg.cols,
  queue: qt.rows as QueueRow[], aliasPairs, runDate,
});
if (!applyResult.ok) {
  console.error(`REFUSED — nothing written:\n` + applyResult.refusals.map(r => '  - ' + r).join('\n'));
  process.exit(2);
}
console.log(applyResult.logAppend.trim() + '\n');
if (dryRun) {
  console.log(`--dry-run: nothing written (register would go ${reg.rows.length} → ${applyResult.register.length})`);
  process.exit(applyResult.exitCode);
}
writeRegister(applyResult.registerCols, applyResult.register);
const applyLogPath = path.join(path.dirname(qPath), 'RECONCILE_LOG.md');
writeFileSync(applyLogPath, (existsSync(applyLogPath) ? readFileSync(applyLogPath, 'utf8') : `# RECONCILE LOG\n`) + applyResult.logAppend);
console.log(`register       ${path.relative(process.cwd(), registerPath)} rewritten (${reg.rows.length} → ${applyResult.register.length} rows)`);
console.log(`log            ${path.relative(process.cwd(), applyLogPath)} (## Applied section appended)`);
process.exit(applyResult.exitCode);
