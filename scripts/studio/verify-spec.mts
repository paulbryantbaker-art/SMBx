/**
 * verify-spec.mts — is this deck spec faithful to the document behind it?
 *
 *   npx tsx $REPO/scripts/studio/verify-spec.mts markets/<m>/specs/<name>.deck.mts
 *   npx tsx $REPO/scripts/studio/verify-spec.mts <spec.post.mts> --against <doc.md>
 *
 * WHY THIS EXISTS. The market pipeline has a guard rail — research/ → master →
 * audit.mts — and the spec-straight-to-deck path had none. The builders check
 * nothing: they print whatever the spec says, at 300dpi, with whatever you
 * typed on the `source:` line underneath. That is how a carousel reached
 * LinkedIn carrying "$700B", "$1.2T", "74%" and "~$250B", none of them
 * verified, and it is why the rule files have named this script since
 * 2026-07-29. It did not exist until now. A rule that names a script nobody
 * wrote is worse than no rule, because it reads as enforced.
 *
 * IT READS THE SPEC AS A MODULE, NOT AS TEXT, and that is load-bearing. These
 * files carry long header comments arguing about what was deliberately left
 * OFF the pages — the fire-safety spec's is 70 lines and names every figure it
 * refuses to print. Scanning the file as text would flag all of them. Only
 * copy that reaches a page is copy that can be wrong, so: dynamic import, then
 * walk the object the builder walks. Commented-out draft pages are invisible
 * here for the same reason they are invisible to the builder.
 *
 * FOUR FINDINGS, and they are different defects:
 *
 *   1 · RETIRED — the figure appears in the source document ONLY inside its
 *       correction ledger (## A.0.x). That is where dead figures are RECORDED,
 *       so a naive traceability check finds them there and reports the spec
 *       clean. It is the exact false green light this practice treats as worse
 *       than no check: the elevator teardown's OEM/independent split is
 *       contradicted by Otis's 10-K and retired in the master, and the master
 *       quotes it verbatim while retiring it.
 *   2 · UNEXPLAINED — in no part of the source document at all. Cite it, add a
 *       `## Derivations` entry (Derivations is part of the master's text, so a
 *       registered figure passes for free), or take it off the page.
 *   3 · NO SOURCE — the page carries a figure and names nobody. A
 *       sourced-but-untraceable figure and a traceable-but-unattributed one
 *       are separate problems and are reported separately.
 *   4 · BY EYE — a numeral the figure grammar cannot see. A `numeral` page's
 *       number and a `diagram` bar's label are figures BY CONSTRUCTION — that
 *       is what the format is for — but "40" and "5" carry no unit and no
 *       currency, so they match nothing. Saying so is the honest answer.
 *       Cover and closer figures land here too on the attribution half: those
 *       formats have no `source:` slot, so nothing mechanical can check them.
 *
 * ONE NOTION OF "A FIGURE". `figuresNotIn` comes from `house/audit.ts`, which
 * is the one with a test suite behind it. This file defines no figure regex,
 * deliberately — including for the by-eye test, which asks the same function
 * what it can see rather than asking a second pattern.
 *
 * A CLEAN RUN IS NOT A CLEAN BILL OF HEALTH. It proves the spec is faithful to
 * the document. It cannot tell you the document is right — a faithfully
 * carried fabrication passes here exactly as it passes audit.mts. Job 2 is
 * still the step that catches that, and this script says so on success.
 *
 * Exit 0 clean · 1 findings · 2 COULD NOT VERIFY.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { figuresNotIn } from '../../house/audit.js';

/* ── args ─────────────────────────────────────────────────────────────── */
const argv = process.argv.slice(2);
const againstIdx = argv.indexOf('--against');
const againstVal = againstIdx >= 0 ? argv[againstIdx + 1] : undefined;
/* Skip the --against VALUE when hunting for the positional: invoked as
   `--against doc.md spec.mts` the first non-flag argument is the document. */
const specArg = argv.find((a, i) => !a.startsWith('--') && (againstIdx < 0 || i !== againstIdx + 1));

if (!specArg) {
  console.error('Usage: verify-spec.mts <spec.deck.mts|spec.post.mts> [--against <doc.md>]');
  process.exit(2);
}
const specPath = path.resolve(specArg);

/** Exit 2 is NOT a pass. Say it in the same words every time. */
function cannotVerify(headline: string, ...detail: string[]): never {
  console.log(`\n✗ NOT VERIFIED — ${headline}`);
  for (const d of detail) console.log(`  ${d}`);
  console.log('\nNothing about this spec has been checked. This is not a pass, and a');
  console.log('spec that has not been checked does not get rendered.\n');
  process.exit(2);
}

if (!existsSync(specPath)) cannotVerify(`no such spec: ${specPath}`);

/* ── the source of truth ──────────────────────────────────────────────── */
/* Two levels up from the spec FILE is the market folder — markets/<m>/specs/
   <name>.deck.mts → markets/<m>/master.md. That is the layout, so the common
   case needs no flag. */
const srcPath = againstVal
  ? path.resolve(againstVal)
  : path.resolve(path.dirname(specPath), '..', 'master.md');

if (!existsSync(srcPath)) {
  cannotVerify(
    `no source document at ${path.relative(process.cwd(), srcPath)}`,
    'A spec with nothing behind it cannot be verified, and passing it vacuously',
    'is the failure this script exists to prevent.',
    '',
    'Either the market has no master yet — do jobs 0–2 in CLAUDE.md first —',
    'or this spec rests on something else: pass --against <doc.md>.');
}

const srcMd = readFileSync(srcPath, 'utf8');

/* ── live text vs the correction ledger ───────────────────────────────────
 * The standing appendix numbers its correction record A.0.1, A.0.2, … and each
 * entry QUOTES the figure it is killing, so the retired figure is present in
 * the master's text — findable, and dead. Hold those sections out of the live
 * text and a figure that survives only there is reported as RETIRED rather
 * than as traceable.
 *
 * `## Derivations` is NOT held out: a registered derived figure is explained,
 * not retired, and it passes for free exactly as the rules say.
 *
 * A document with no A.0.x sections yields an empty ledger, and this whole
 * step is then a no-op — the check degrades to plain traceability.            */
const liveLines: string[] = [];
const ledgerLines: string[] = [];
let inLedger = false, ledgerLevel = 0, ledgerSections = 0;
for (const line of srcMd.split('\n')) {
  const h = line.match(/^(#{1,6})\s+(.*)$/);
  if (h) {
    const level = h[1].length;
    if (inLedger && level <= ledgerLevel) inLedger = false;
    if (/^A\.0\.\d/.test(h[2].trim()) || /correction (record|ledger)/i.test(h[2])) {
      inLedger = true; ledgerLevel = level; ledgerSections++;
    }
  }
  (inLedger ? ledgerLines : liveLines).push(line);
}
const LIVE = liveLines.join('\n');
const LEDGER = ledgerLines.join('\n');

/* ── the spec, as a module ────────────────────────────────────────────── */
let mod: any;
try {
  mod = await import(pathToFileURL(specPath).href);
} catch (err: any) {
  cannotVerify(
    'the spec would not import',
    String(err?.message ?? err).split('\n')[0],
    '',
    'The builder imports this file the same way, so it would not render either.');
}
const shape: 'deck' | 'post' | null = mod.deck ? 'deck' : mod.post ? 'post' : null;
if (!shape) {
  cannotVerify(
    'the spec exports neither `deck` nor `post`',
    `exports found: ${Object.keys(mod).join(', ') || '(none)'}`,
    'build-deck.mts reads `deck`; build-onepager.mts reads `post`.');
}
const art = mod[shape];

/* ── collecting the copy that reaches a page ──────────────────────────── */
/* Keys that are never copy. `source` is attribution rather than a claim, and
   is checked for PRESENCE, not for figures — a date in a citation is not a
   figure on the card. */
const SKIP = new Set(['image', 'imagePos', 'slug', 'kind', 'style', 'tagColor',
  'variants', 'h', 'source', 'connector', 'name']);

interface Frag { field: string; text: string; }

/* A figure and the words that give it meaning are two keys in a spec and one
   thing on the page. Joining them matters twice: "~10" + "%" is unreadable as
   a figure apart and obvious together, and reporting a bar's label and its own
   caption as two findings is the noise that gets a guard switched off. */
const PAIRS: [string, string][] = [['numeral', 'unit'], ['value', 'label'], ['label', 'sub']];

/** Every string in an object, with the path it came from. */
function collect(node: any, prefix = '', out: Frag[] = []): Frag[] {
  if (node == null) return out;
  if (typeof node === 'string') {
    if (node.trim()) out.push({ field: prefix || '(text)', text: node });
    return out;
  }
  if (typeof node === 'number') { out.push({ field: prefix, text: String(node) }); return out; }
  if (Array.isArray(node)) {
    node.forEach((v, i) => collect(v, `${prefix}[${i}]`, out));
    return out;
  }
  if (typeof node !== 'object') return out;

  const joined = new Set<string>();
  for (const [head, tail] of PAIRS) {
    if (joined.has(head) || node[head] == null) continue;
    const t = node[tail] == null ? String(node[head])
      : `${node[head]}${head === 'numeral' ? '' : '  ·  '}${node[tail]}`;
    out.push({ field: prefix ? `${prefix}.${head}` : head, text: t });
    joined.add(head); if (node[tail] != null) joined.add(tail);
  }
  for (const [k, v] of Object.entries(node)) {
    if (SKIP.has(k) || joined.has(k)) continue;
    collect(v, prefix ? `${prefix}.${k}` : k, out);
  }
  return out;
}

/** The keys whose whole job is to hold a number. */
const NUMBER_SLOT_FIELD = /(^|\.)(numeral|label|value)$/;

/** What the figure grammar sees in a string. Same function, empty haystack. */
const figuresIn = (t: string) => figuresNotIn(t, '');

const excerpt = (text: string, fig: string) => {
  const i = text.indexOf(fig);
  if (i < 0 || text.length <= 76) return text.trim().replace(/\s+/g, ' ');
  const s = Math.max(0, i - 34), e = Math.min(text.length, i + fig.length + 34);
  return `${s ? '…' : ''}${text.slice(s, e).trim().replace(/\s+/g, ' ')}${e < text.length ? '…' : ''}`;
};

type Kind = 'RETIRED' | 'UNEXPLAINED' | 'in the master';
const classify = (fig: string): Kind =>
  figuresNotIn(fig, LIVE).length === 0 ? 'in the master'
    : figuresNotIn(fig, LEDGER).length === 0 ? 'RETIRED'
      : 'UNEXPLAINED';

/* ── the surfaces ─────────────────────────────────────────────────────── */
interface Surface {
  label: string;
  frags: Frag[];
  source?: string;            // the card's attribution, if the format has a slot
  hasSourceSlot: boolean;     // cover, closer and one-pagers do not
  numberSlot: boolean;        // the format is BUILT around a figure
}
const surfaces: Surface[] = [];

if (shape === 'deck') {
  /* The cover's giant numeral and its stat strip are number slots with no
     source: line anywhere near them — the most exposed figures in the set and
     the only ones nothing can check. */
  if (art.cover) surfaces.push({ label: 'cover', frags: collect(art.cover), hasSourceSlot: false,
    numberSlot: art.cover.numeral != null || Array.isArray(art.cover.stats) });
  (art.pages ?? []).forEach((p: any, i: number) => {
    const src = typeof p.source === 'string' && p.source.trim() ? p.source.trim() : undefined;
    surfaces.push({
      label: `page ${i + 1}  ${p.kind ?? '?'}`,
      frags: collect(p),
      source: src,
      hasSourceSlot: true,
      /* A numeral page's numeral, a trade page's numeral and a diagram's bar
         labels ARE the measurement — the format has no other purpose. Whether
         the figure grammar can read the typography is beside the point. */
      numberSlot: p.kind === 'numeral' || p.kind === 'diagram' ||
                  (p.kind === 'trade' && p.numeral != null),
    });
  });
  if (art.closer) surfaces.push({ label: 'closer', frags: collect(art.closer), hasSourceSlot: false, numberSlot: false });
  if (art.caption) surfaces.push({ label: 'caption', frags: [{ field: 'caption', text: art.caption }], hasSourceSlot: false, numberSlot: false });
} else {
  const { caption, ...card } = art;
  surfaces.push({ label: 'card', frags: collect(card), hasSourceSlot: false, numberSlot: art.numeral != null });
  if (caption) surfaces.push({ label: 'caption', frags: [{ field: 'caption', text: caption }], hasSourceSlot: false, numberSlot: false });
}

/* ── the run ──────────────────────────────────────────────────────────── */
const rel = (p: string) => path.relative(process.cwd(), p) || p;
console.log(`\nVerifying  ${rel(specPath)}`);
console.log(`Shape      ${shape}${shape === 'deck' ? ` · ${(art.pages ?? []).length} page(s) + cover + closer${art.caption ? ' + caption' : ''}` : art.caption ? ' + caption' : ''}`);
console.log(`Against    ${rel(srcPath)}`);
console.log(`           ${ledgerSections
  ? `${ledgerSections} correction-ledger section(s) held out of the live text`
  : 'no correction ledger (A.0.x) in this document — traceability only'}`);

let retired = 0, unexplained = 0, unattributed = 0, byEye = 0, checked = 0;
const lines: string[] = [];

for (const s of surfaces) {
  const rows: string[] = [];
  let carriesFigure = false;

  for (const f of s.frags) {
    for (const fig of figuresIn(f.text)) {
      checked++;
      carriesFigure = true;
      const k = classify(fig);
      if (k === 'in the master') continue;
      if (k === 'RETIRED') retired++; else unexplained++;
      rows.push(`    ${k.padEnd(12)} ${f.field.padEnd(22)} ${fig}`);
      rows.push(`    ${' '.repeat(12)} ${' '.repeat(22)} ${excerpt(f.text, fig)}`);
    }
    /* A digit the grammar cannot read. Only worth saying where the format is a
       number slot — prose full of dates and section numbers is not a claim. */
    if (s.numberSlot && /\d/.test(f.text) && !figuresIn(f.text).length &&
        NUMBER_SLOT_FIELD.test(f.field)) {
      byEye++;
      carriesFigure = true;
      rows.push(`    ${'BY EYE'.padEnd(12)} ${f.field.padEnd(22)} ${f.text.trim().replace(/\s+/g, ' ')}`);
      rows.push(`    ${' '.repeat(12)} ${' '.repeat(22)} no unit or currency — the figure check cannot see this`);
    }
  }

  if (s.hasSourceSlot && !s.source && (carriesFigure || s.numberSlot)) {
    unattributed++;
    rows.unshift(`    ${'NO SOURCE'.padEnd(12)} ${'—'.padEnd(22)} the page carries a figure and names nobody`);
  }
  if (!s.hasSourceSlot && carriesFigure) {
    byEye++;
    rows.push(`    ${'BY EYE'.padEnd(12)} ${'(attribution)'.padEnd(22)} this format has no source: slot — check the attribution yourself`);
  }

  if (rows.length) {
    lines.push(`  ${s.label}${s.hasSourceSlot ? (s.source ? `   source: ${s.source}` : '   NO source: line') : ''}`);
    lines.push(...rows);
  }
}

console.log(`\nFigures    ${String(checked).padStart(4)} on a page or in the caption`);
console.log(`           ${String(retired).padStart(4)} RETIRED — in the source only inside its correction ledger`);
console.log(`           ${String(unexplained).padStart(4)} UNEXPLAINED — in no part of the source`);
console.log(`Pages      ${String(unattributed).padStart(4)} carrying a figure with no source: line`);
console.log(`By eye     ${String(byEye).padStart(4)} thing(s) nothing mechanical can check`);

const findings = retired + unexplained + unattributed;

if (lines.length) {
  console.log('\n── findings ──────────────────────────────────────────────────');
  console.log(lines.join('\n'));
}

/* Two half-checks this script does not make, named rather than implied. */
const marketDir = path.resolve(path.dirname(specPath), '..');
const retiredMd = path.join(marketDir, 'retired.md');
const notes: string[] = [];
if (existsSync(retiredMd)) {
  notes.push('THE HALF THIS SCRIPT DOES NOT DO. A figure the source document names in its');
  notes.push('own prose WHILE RETIRING IT reads as traceable here, and no text-presence');
  notes.push(`check can tell those apart. ${path.basename(marketDir)} keeps a curated denylist:`);
  notes.push(`  node $REPO/scripts/studio/retired-check.mjs --studio . --market ${path.basename(marketDir)}`);
}

if (!findings) {
  console.log('\n✓ CLEAN — every figure that reaches a page is in ' + path.basename(srcPath) + ',');
  console.log('  and every page carrying one names a source.');
  if (byEye) console.log(`  ${byEye} item(s) above still need your eyes. Nothing mechanical covered them.`);
  console.log('\n  A CLEAN VERIFY-SPEC IS NOT A CLEAN BILL OF HEALTH. It proves this spec is');
  console.log(`  faithful to ${path.basename(srcPath)}. It cannot tell you ${path.basename(srcPath)} is right —`);
  console.log('  a faithfully carried fabrication passes here exactly as it passes audit.mts.');
  console.log('  Job 2, verification against primary sources, is what catches that.');
  if (notes.length) { console.log(''); for (const n of notes) console.log(`  ${n}`); }
  console.log('');
  process.exit(0);
}

console.log('\n✗ NOT CLEAN\n');
if (retired) {
  console.log(`RETIRED (${retired}) — the source names this figure only where it records killing it.`);
  console.log('  A correction ledger quotes the figure it retires, so a traceability check');
  console.log('  finds it and calls the spec clean. Do not restate it. Re-render from the');
  console.log('  current text, or take the page off.');
}
if (unexplained) {
  console.log(`\nUNEXPLAINED (${unexplained}) — in no part of the source document.`);
  console.log('  Cite it in the source, register it under "## Derivations" with its inputs,');
  console.log('  arithmetic and assumption, or remove the claim. A ROUNDED figure counts as');
  console.log('  a different figure — $835B is not $835.5B.');
}
if (unattributed) {
  console.log(`\nNO SOURCE (${unattributed}) — the page carries a figure and the card names nobody.`);
  console.log('  Separate defect from the two above: the reader scrolling a feed sees the');
  console.log('  card, not the caption. Add the source: line or take the figure off.');
}
if (byEye) {
  console.log(`\nBY EYE (${byEye}) — reported, not judged. Bare integers in a number slot, and`);
  console.log('  covers and closers, where the format gives no source: slot at all.');
}
if (notes.length) { console.log(''); for (const n of notes) console.log(n); }
console.log('\nThis spec is not ready to render.\n');
process.exit(1);
