/**
 * PREFLIGHT — every guard, one command, one verdict.
 *
 * WHY. On 2026-08-12 a teardown rendered in the retired design language
 * because carta-guard was not run first; on the same day two documents printed
 * a blind CLEAN because one guard's coverage was never read; a week earlier a
 * clean audit stood in for verification that had not happened. The pattern is
 * one pattern: eight checks that each work, assembled by memory, in the wrong
 * order or not at all. A method is not repeatable if its checklist lives in a
 * person.
 *
 * So: one command. It runs every applicable guard for a market (and optionally
 * one spec), in the right order, prints one table, and exits nonzero unless
 * EVERYTHING passed. There is no partial credit and no "the important ones
 * passed". A skipped guard is a row in the table saying SKIPPED and why, so
 * silence is never mistaken for a pass.
 *
 *   npx tsx $REPO/scripts/studio/preflight.mts <market>                 # the market
 *   npx tsx $REPO/scripts/studio/preflight.mts <market> --spec <path>   # + one spec
 *   npx tsx $REPO/scripts/studio/preflight.mts <market> --skip-sourcing # (never for a post)
 *
 * Run from the STUDIO ROOT, like every builder. Exit 0 all green · 1 anything
 * else.
 *
 * Order and meaning:
 *   audit         every figure traces to research/ or Derivations   (traceability)
 *   crossfoot     every written sum/quotient computes               (accounting)
 *   quote-check   every quotation exists verbatim in the corpus     (words)
 *   sourcing      origins independent, classified, instrument-backed (independence)
 *   retired       no retired figure has crept back                  (memory)
 *   verify-spec   spec figures faithful to the master               (spec only)
 *   voice         plain language, the message written               (spec only)
 *   design        slots legal per FORMATS.md                        (spec only)
 *   carta         no retired palette anywhere in src or assets      (always)
 *
 * What a full green preflight is NOT: proof the research is true. Job 2 —
 * primary-source verification, a human reading claims against instruments —
 * has no mechanical substitute, and the verdict line says so every run.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const args = process.argv.slice(2);
const market = args.find(a => !a.startsWith('--'));
const spec = args.includes('--spec') ? args[args.indexOf('--spec') + 1] : null;
const skipSourcing = args.includes('--skip-sourcing');
if (!market || !existsSync(path.join('markets', market))) {
  console.error('usage (from the studio root): preflight.mts <market> [--spec <path>]');
  console.error('markets on disk: ' + (existsSync('markets') ? readdirSync('markets').filter(m => !m.startsWith('_')).join(' · ') : '(none — are you in the studio root?)'));
  process.exit(1);
}

const M = path.join('markets', market);
const master = path.join(M, 'master.md');
const docsDir = path.join(M, 'documents');
const docs = existsSync(docsDir)
  ? readdirSync(docsDir).filter(f => f.endsWith('.md') && !/draft/i.test(f)).map(f => path.join(docsDir, f))
  : [];

interface Row { guard: string; target: string; verdict: 'PASS' | 'FAIL' | 'REFUSED' | 'SKIPPED'; note: string }
const rows: Row[] = [];
const run = (guard: string, script: string, argv: string[], target: string) => {
  const isMjs = script.endsWith('.mjs');
  const r = spawnSync(isMjs ? 'node' : 'npx', isMjs ? [path.join(HERE, script), ...argv] : ['tsx', path.join(HERE, script), ...argv], { encoding: 'utf8' });
  const out = (r.stdout ?? '') + (r.stderr ?? '');
  const tail = out.trim().split('\n').filter(l => /✓|✗|NOT ESTABLISHED|NOT AUDITED|CLEAN|finding|WRONG|unverifiable/.test(l)).pop() ?? `exit ${r.status}`;
  const verdict: Row['verdict'] = r.status === 0 ? 'PASS' : r.status === 3 ? 'REFUSED' : 'FAIL';
  rows.push({ guard, target, verdict, note: tail.trim().slice(0, 96) });
  return r.status === 0;
};
const skip = (guard: string, target: string, why: string) =>
  rows.push({ guard, target, verdict: 'SKIPPED', note: why });

console.log(`\nPREFLIGHT      ${market}${spec ? ` + ${spec}` : ''}\n`);

/* market-level */
if (existsSync(master)) {
  run('audit', 'audit.mts', [master], 'master.md');
  run('crossfoot', 'crossfoot.mts', [master, ...docs], docs.length ? `master + ${docs.length} doc(s)` : 'master.md');
  run('quote-check', 'quote-check.mts', [master], 'master.md');
  for (const d of docs) {
    run('audit', 'audit.mts', [d, '--against', master], path.basename(d));
    run('quote-check', 'quote-check.mts', [d], path.basename(d));
  }
} else {
  skip('audit', 'master.md', 'NO MASTER — nothing to check, and nothing to derive from either');
}
if (skipSourcing) {
  skip('sourcing', 'documents', '--skip-sourcing given. NEVER valid for anything that posts.');
} else {
  for (const d of (docs.length ? docs : existsSync(master) ? [master] : []))
    run('sourcing', 'sourcing-protection.mts', [d], path.basename(d));
}
run('retired', 'retired-check.mjs', ['--studio', '.', '--market', market], market);

/* spec-level */
if (spec) {
  if (!existsSync(spec)) skip('verify-spec', spec, 'SPEC NOT FOUND');
  else {
    run('verify-spec', 'verify-spec.mts', [spec], path.basename(spec));
    run('voice', 'voice-check.mts', [spec], path.basename(spec));
    run('design', 'design-check.mts', [spec, '--media', path.join(M, 'media')], path.basename(spec));
    run('quote-check', 'quote-check.mts', [spec], path.basename(spec));
    run('sourcing', 'sourcing-protection.mts', [spec], path.basename(spec));
  }
}

/* house-level */
run('carta', 'carta-guard.mts', ['--assets', 'assets', '--src', M], 'palette + assets');

/* ── the table ─────────────────────────────────────────────────────────── */
const W = Math.max(...rows.map(r => r.target.length), 12);
console.log(`  ${'guard'.padEnd(13)}${'target'.padEnd(W + 2)}verdict   note`);
console.log('  ' + '─'.repeat(13 + W + 2 + 40));
for (const r of rows) {
  const mark = r.verdict === 'PASS' ? '✓' : r.verdict === 'SKIPPED' ? '·' : '✗';
  console.log(`  ${r.guard.padEnd(13)}${r.target.padEnd(W + 2)}${mark} ${r.verdict.padEnd(8)}${r.note}`);
}

const bad = rows.filter(r => r.verdict === 'FAIL' || r.verdict === 'REFUSED');
const skipped = rows.filter(r => r.verdict === 'SKIPPED');
console.log('\n──────────────────────────────────────────────────────────────');
if (bad.length) {
  console.log(`✗ NOT READY — ${bad.length} guard run(s) failed or refused${skipped.length ? `, ${skipped.length} skipped` : ''}.`);
  console.log('  Nothing renders and nothing posts off this state. Fix top to bottom —');
  console.log('  the order above is dependency order.');
} else if (skipped.length) {
  console.log(`✗ NOT READY — every run passed but ${skipped.length} guard(s) were SKIPPED.`);
  console.log('  A skipped guard is an unchecked claim. Unskip it or say so on the page.');
} else {
  console.log('✓ ALL GUARDS GREEN.');
  console.log('  What this proves: traceable, arithmetic sound, quotations verbatim,');
  console.log('  origins independent and classified, nothing retired resurfaced, spec');
  console.log('  faithful, palette canon.');
  console.log('  What it cannot prove: that the research is TRUE. Job 2 — a human');
  console.log('  reading the load-bearing claims against the primary instruments — is');
  console.log('  the only check on that, and it has no substitute.');
}
process.exit(bad.length || skipped.length ? 1 : 0);
