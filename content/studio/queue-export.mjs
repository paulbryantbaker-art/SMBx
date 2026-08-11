#!/usr/bin/env node
/**
 * queue-export — turn the human content guide into something the app can import.
 *
 *   node content/studio/queue-export.mjs > content/studio/post-queue.json
 *   node content/studio/queue-export.mjs --check      # exit 1 if malformed
 *
 * WHY THIS EXISTS. `POST_QUEUE.md` is the source of record because Paul reads
 * and edits it, and a markdown table is the only format he will actually keep
 * current. An importer parsing markdown by hand is brittle and breaks silently
 * the first time someone adds a column. So: one source, one generated artifact,
 * and a parser that fails loudly rather than importing half a queue.
 *
 * WHO OWNS WHAT — the rule that stops the two copies fighting:
 *
 *   POST_QUEUE.md owns CONTENT   the angle, format, slot, evidence grade
 *   the app owns STATE           posted_at, impressions, engagement
 *
 * They never write the same field, so no round-trip sync is needed. `status`
 * moves `next` → `drafted` in the markdown (the weekly run writes it) and
 * `drafted` → `posted` in the app (a human clicks it). The importer treats
 * markdown `status` as the floor: it will not pull a row backwards out of
 * `posted`.
 *
 * Zero dependencies. Plain node.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = process.argv.find(a => a.endsWith('.md')) || join(HERE, 'POST_QUEUE.md');
const CHECK = process.argv.includes('--check');

const GRADES = new Set(['STRONG', 'MODERATE', 'THIN', 'VERIFIED', 'RETIRED', 'n/a']);
const STATUSES = new Set(['next', 'drafted', 'posted', 'parked', 'recurring']);
const FORMATS = new Set([
  'Teardown', 'Market Map', 'Contrarian Take', 'How Buyers Think',
  'Practitioner Note', 'Human Thread', 'Hand-Raiser',
]);

const md = readFileSync(SRC, 'utf8');
const rows = [];
const problems = [];
let tier = null;

for (const line of md.split('\n')) {
  const h = /^###\s+(Tier\s+\d+[^|]*)$/.exec(line.trim());
  if (h) { tier = h[1].trim(); continue; }

  // a queue row starts with | Qnn |
  const m = /^\|\s*(Q\d{2})\s*\|(.+)\|\s*$/.exec(line.trim());
  if (!m) continue;

  const [, id, rest] = m;
  const cells = rest.split('|').map(c => c.trim());
  if (cells.length < 5) { problems.push(`${id}: expected 5 cells, got ${cells.length}`); continue; }

  const [angleRaw, format, carries, gradeRaw, statusRaw] = cells;

  // "**Bold lead.** the rest" → lead + body
  const angle = angleRaw.replace(/\*\*/g, '').trim();
  const lead = (/^\*\*(.+?)\*\*/.exec(angleRaw)?.[1] || angle.split('.')[0]).trim();

  // grade cell often carries a parenthetical disclosure: "STRONG (single vendor — disclose SPS)"
  const grade = (gradeRaw.match(/\b(STRONG|MODERATE|THIN|VERIFIED|RETIRED)\b/) || [])[1]
    || (/n\/a/i.test(gradeRaw) ? 'n/a' : null);
  const disclosure = (/\(([^)]+)\)/.exec(gradeRaw)?.[1] || '').trim() || null;

  const status = (statusRaw.match(/\b(next|drafted|posted|parked|recurring)\b/) || [])[1] || null;

  if (!grade)  problems.push(`${id}: no evidence grade in "${gradeRaw}"`);
  if (!status) problems.push(`${id}: no status in "${statusRaw}"`);
  if (grade && !GRADES.has(grade))    problems.push(`${id}: unknown grade ${grade}`);
  if (status && !STATUSES.has(status)) problems.push(`${id}: unknown status ${status}`);
  if (format && !FORMATS.has(format) && !/recurring/i.test(format)) {
    problems.push(`${id}: "${format}" is not in the format vocabulary`);
  }

  rows.push({
    queue_id: id,
    tier,
    lead,
    angle,
    format,
    carries: carries.replace(/\*\*/g, '').trim(),
    evidence_grade: grade,
    source_disclosure: disclosure,
    status,
    // THE LAW, carried into the data so an importer cannot lose it:
    // THIN means the post makes an argument and states no figure.
    // VERIFIED = traced to a master that passed primary-source verification.
    // RETIRED  = the figure was withdrawn by a correction pass. Never state it.
    may_state_figure: ['STRONG', 'MODERATE', 'VERIFIED'].includes(grade),
  });
}

if (!rows.length) problems.push('no queue rows found — has the table format changed?');

const seen = new Set();
for (const r of rows) {
  if (seen.has(r.queue_id)) problems.push(`${r.queue_id}: duplicate id`);
  seen.add(r.queue_id);
}

if (problems.length) {
  console.error('queue-export: MALFORMED — nothing written.\n');
  for (const p of problems) console.error('  ✗ ' + p);
  console.error('\nFix the markdown. A half-imported queue is worse than none.');
  process.exit(1);
}

if (CHECK) {
  console.error(`queue-export: ${rows.length} rows, all valid.`);
  const by = g => rows.filter(r => r.evidence_grade === g).length;
  console.error(`  STRONG ${by('STRONG')} · MODERATE ${by('MODERATE')} · THIN ${by('THIN')}`);
  console.error(`  ${rows.filter(r => !r.may_state_figure).length} row(s) may NOT state a figure.`);
  process.exit(0);
}

process.stdout.write(JSON.stringify({
  source: 'content/studio/POST_QUEUE.md',
  generated_from: 'queue-export.mjs',
  note: 'Generated. Edit POST_QUEUE.md, re-run, commit both. The app owns posted_at and analytics; this file owns content.',
  count: rows.length,
  rows,
}, null, 2) + '\n');
