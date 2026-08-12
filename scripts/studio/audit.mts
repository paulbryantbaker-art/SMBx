/**
 * Check a document's citations — on your machine, no app, no database, no API.
 *
 * Paul, 2026-07-26: everything moves local. The citation guarantee has to move
 * with it, or "every figure is traceable" becomes something we used to be able
 * to say. This runs the IDENTICAL check the app runs (house/audit.ts), against
 * files on disk.
 *
 * Usage, from your workspace:
 *   npx tsx <repo>/scripts/studio/audit.mts markets/home-services/master.md
 *   npx tsx <repo>/scripts/studio/audit.mts <doc.md> --against research/
 *   npx tsx <repo>/scripts/studio/audit.mts <doc.md> --against a.md b.md
 *
 * With no --against, it audits the document against everything in a sibling
 * `research/` or `sources/` folder — which is the workspace layout, so the
 * common case needs no flags.
 *
 * PDFs cannot be read here (no text layer without a parser), so they are
 * COUNTED AND NAMED as unaudited rather than silently ignored. A clean bill
 * that skipped half your sources is worse than no bill at all.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { auditCitations } from '../../house/audit.js';

const argv = process.argv.slice(2);
const docArg = argv.find(a => !a.startsWith('--'));
if (!docArg) {
  console.error('Usage: audit.mts <document.md> [--against <file|dir> ...]');
  process.exit(1);
}
const docPath = path.resolve(docArg);
if (!existsSync(docPath)) { console.error(`No such document: ${docPath}`); process.exit(1); }

/* Sources: explicit --against, else a sibling research/ or sources/ folder. */
const againstIdx = argv.indexOf('--against');
let roots: string[];
if (againstIdx >= 0) {
  roots = argv.slice(againstIdx + 1).filter(a => !a.startsWith('--'));
} else {
  const dir = path.dirname(docPath);
  roots = ['research', 'sources'].map(d => path.join(dir, d)).filter(existsSync);
}

const TEXT = /\.(md|markdown|txt|text)$/i;
const files: string[] = [];
for (const r of roots) {
  const abs = path.resolve(r);
  if (!existsSync(abs)) { console.error(`(skipping missing ${r})`); continue; }
  if (statSync(abs).isDirectory()) {
    for (const f of readdirSync(abs)) files.push(path.join(abs, f));
  } else files.push(abs);
}

const readable = files.filter(f => TEXT.test(f) && path.resolve(f) !== docPath);
const unreadable = files.filter(f => !TEXT.test(f) && statSync(f).isFile());

const doc = readFileSync(docPath, 'utf8');
const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
const self = norm(doc);
// A document filed alongside its own sources audits against itself and returns
// a meaningless clean bill. Identity only — a near-match is a judgement call
// this shouldn't make.
const texts: string[] = [], labels: string[] = [];
for (const f of readable) {
  const t = readFileSync(f, 'utf8');
  if (norm(t) === self) { console.error(`(skipping ${path.basename(f)} — it is this document)`); continue; }
  texts.push(t); labels.push(path.basename(f, path.extname(f)));
}

console.log(`\nAuditing  ${path.relative(process.cwd(), docPath)}`);
console.log(`Against   ${texts.length} readable source(s)${unreadable.length ? `, ${unreadable.length} unreadable` : ''}`);
for (const l of labels) console.log(`          · ${l}`);
for (const f of unreadable) console.log(`          · ${path.basename(f)}  NOT AUDITED (no text layer)`);

if (!texts.length) {
  console.log('\nNOT AUDITED — no machine-readable source text to check against.');
  console.log('The figures in this document carry no mechanical verification.');
  console.log('Paste the underlying research as .md/.txt beside it to have them checked.\n');
  process.exit(2);
}

const a = auditCitations(doc, texts, labels);
const n = (x: number) => String(x).padStart(4);
console.log(`\nFigures   ${n(a.masterFigures)} total`);
console.log(`          ${n(a.citedCount)} found in a source`);
console.log(`          ${n(a.derivedRegistered.length)} derived, with working stated`);
console.log(`          ${n(a.unexplainedCount)} UNEXPLAINED`);
console.log(`Registers Sources ${a.hasSourceRegister ? 'yes' : 'NO'} · Derivations ${a.hasDerivationRegister ? 'yes' : 'NO'}`);
const shown = a.urlsDroppedCount > a.urlsDropped.length ? ` (${a.urlsDropped.length} shown)` : '';
console.log(`URLs      ${a.urlsDroppedCount} dropped from the sources${shown}`);

if (a.ok && !unreadable.length) {
  console.log('\n✓ CLEAN — ' + a.note + '\n');
  process.exit(0);
}
if (a.ok) {
  console.log(`\n✓ Clean against readable sources — but ${unreadable.length} file(s) could not be checked. Not a full bill of health.\n`);
  process.exit(0);
}

console.log('\n✗ NOT CLEAN\n');
if (a.unexplained.length) {
  console.log('Figures in no source and not registered as derived:');
  for (const f of a.unexplained) console.log(`  ${f}`);
  console.log('\nFor each: cite the source, OR add a "## Derivations" entry showing');
  console.log('inputs, arithmetic and the assumption, OR remove the claim.');
  console.log('A ROUNDED figure counts as a different figure — $835B is not $835.5B.\n');
}
if (a.sourcesMissing.length) {
  console.log(`Sources never acknowledged in the register: ${a.sourcesMissing.join('; ')}\n`);
}
if (a.urlsDropped.length) {
  console.log(`Source URLs that did not carry through (${a.urlsDropped.length}):`);
  for (const u of a.urlsDropped.slice(0, 10)) console.log(`  ${u}`);
  console.log('');
}
process.exit(1);
