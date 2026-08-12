/**
 * THE QUOTE GUARD — every quotation must exist, verbatim, in the corpus.
 *
 * WHY. On 2026-08-11 the elevator teardown draft attributed to Otis the words
 * "will take sustained time". The phrase appears in no transcript, no filing
 * and no research file — it was a paraphrase wearing quotation marks, which is
 * a fabrication however faithful the gist. It was caught by a human re-reading
 * the source. Nothing mechanical was looking, because `audit.mts` checks
 * FIGURES and a quotation carries none.
 *
 * The check: extract every quoted span of QUOTE_MIN_WORDS+ words from the
 * target (a master, a document, or a spec's rendered strings) and require the
 * span to appear verbatim — after typographic normalisation — in a file under
 * `research/`. A quotation that appears nowhere in research is either invented
 * or resting on evidence that never got filed; both fail, and the fix is the
 * same either way: put the source text in `research/` or take the quotation
 * marks off.
 *
 * Normalisation is typographic only: curly quotes to straight, dashes to one
 * form, whitespace collapsed, case preserved. Wording is NEVER normalised —
 * "about 17x" does not satisfy "roughly 17x". A paraphrase is a paraphrase.
 *
 *   npx tsx scripts/studio/quote-check.mts markets/<m>/master.md
 *   npx tsx scripts/studio/quote-check.mts markets/<m>/documents/<doc>.md
 *   npx tsx scripts/studio/quote-check.mts markets/<m>/specs/<name>.deck.mts
 *   ... [--corpus <dir>]   override the research folder
 *
 * Exit 0 every quotation found · 1 fabricated-or-unfiled quotation(s) ·
 * 2 usage / no corpus.
 *
 * What this cannot do: it proves the words exist in the corpus, not that the
 * ATTRIBUTION is right — a real Otis sentence credited to KONE passes. And a
 * fabrication planted in research/ verifies "cleanly" one level down; job 2
 * (primary-source verification) is still the check on the corpus itself.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';

const QUOTE_MIN_WORDS = 3;

const args = process.argv.slice(2);
const targetPath = args.find(a => !a.startsWith('--'));
const corpusFlag = args.includes('--corpus') ? args[args.indexOf('--corpus') + 1] : null;
if (!targetPath || !existsSync(targetPath)) {
  console.error('usage: quote-check.mts <master.md|doc.md|spec.mts> [--corpus <dir>]');
  process.exit(2);
}

/* Typographic normalisation — and ONLY typographic. */
const norm = (s: string) => s
  .replace(/^([ \t]*>)+[ \t]/gm, '')   // blockquote markers only — ">80%" is math, not a quote
  .replace(/[‘’‚′]/g, "'")
  .replace(/[“”„″]/g, '"')
  .replace(/[‐-―−]/g, '-')
  .replace(/…/g, '...')
  /* The house converts ~ to ≈ by rule (CLAUDE.md: a paired ~ is GFM
     strikethrough and has silently struck out 51 lines of a master). So a
     source written "~60%" and a document written "≈60%" are the same words
     under this practice's own typography. */
  .replace(/[~≈]/g, '≈')
  .replace(/ /g, ' ')
  .replace(/\*+(?=\S)|(?<=\S)\*+/g, '')  // emphasis hugs a word; " * " (multiplication) survives
  .replace(/__|~~|`/g, '')
  .replace(/\s+/g, ' ')
  .trim();
/* Markdown emphasis is typography too: "**35%** of sales" and "*share*"
   quote the same words unmarked. House arithmetic writes × or ÷, and a
   spaced " * " is left alone, so multiplication cannot be eaten. */

/* ── the corpus ──────────────────────────────────────────────────────────── */
function findCorpus(target: string): string | null {
  if (corpusFlag) return existsSync(corpusFlag) ? corpusFlag : null;
  let dir = path.resolve(path.dirname(target));
  for (let i = 0; i < 4; i++) {
    const candidate = path.join(dir, 'research');
    if (existsSync(candidate) && statSync(candidate).isDirectory()) return candidate;
    dir = path.dirname(dir);
  }
  return null;
}
const corpusRoot = findCorpus(targetPath);
if (!corpusRoot) {
  console.error('✗ NO CORPUS — no research/ found near the target and no --corpus given.');
  console.error('  An unchecked quotation is an unverified quotation. This is not a pass.');
  process.exit(2);
}
/* One level deep, exactly like audit.mts — a subfolder is not evidence.

   PLUS the document's own history: the A.0.x correction ledger and
   retired.md quote the master's own retired wording ("was published as…").
   Those quotations' referent is the prior version, not a research file, so
   versions/ and retired.md are legitimate referents — for self-history only.
   A SOURCE quotation that only matches versions/ would mean the master is
   quoting its own draft as evidence, which job 2 exists to catch. */
const corpusFiles = readdirSync(corpusRoot)
  .filter(f => /\.(md|txt)$/i.test(f))
  .map(f => path.join(corpusRoot, f));
const marketRoot = path.dirname(corpusRoot);
for (const extra of ['versions', '']) {
  const dir = path.join(marketRoot, extra);
  if (!existsSync(dir) || !statSync(dir).isDirectory()) continue;
  for (const f of readdirSync(dir)) {
    if (extra === 'versions' ? /\.md$/i.test(f) : f === 'retired.md')
      corpusFiles.push(path.join(dir, f));
  }
}
const corpus = norm(corpusFiles.map(f => readFileSync(f, 'utf8')).join('\n'));
const corpusPerFile = corpusFiles.map(f => ({ file: f, text: norm(readFileSync(f, 'utf8')) }));

/* ── extract quotations from the target ──────────────────────────────────── */
const raw = readFileSync(targetPath, 'utf8');
const isSpec = /\.mts$/.test(targetPath);

/* In a spec, only STRING LITERALS reach a page; in markdown, the body does.
   Header comments in a spec are working notes, not print. */
let scanText: string;
if (isSpec) {
  const strings: string[] = [];
  const re = /'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;
  const noComments = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  for (let m; (m = re.exec(noComments));) strings.push(m[1] ?? m[2] ?? m[3] ?? '');
  scanText = strings.join('\n');
} else {
  scanText = raw;
}
scanText = norm(scanText);

interface Quote { text: string; words: number }
const quotes: Quote[] = [];
const seen = new Set<string>();
/* Double quotes are quotation marks. Single quotes are too ambiguous in prose
   (apostrophes, scare quotes) — a single-quoted span is only taken when it is
   clearly delimited by spaces on both sides. */
for (const m of scanText.matchAll(/"([^"]{4,400})"/g)) {
  const text = m[1].trim();
  const words = (text.match(/\S+/g) || []).length;
  if (words < QUOTE_MIN_WORDS) continue;
  /* Not a quotation: pure figures/units ("$1.7 billion"), file paths, code. */
  if (/^[\d\s$%.,x×~≈+\-–—/]+[A-Za-z]{0,2}$/.test(text)) continue;
  if (/[/\\]|\.mts|\.md|\.ts|http/.test(text)) continue;
  if (seen.has(text)) continue;
  seen.add(text);
  quotes.push({ text, words });
}

/* ── verify ──────────────────────────────────────────────────────────────── */
console.log(`\nQuote check    ${path.relative(process.cwd(), targetPath)}`);
console.log(`Corpus         ${path.relative(process.cwd(), corpusRoot)} · ${corpusFiles.length} file(s)`);
console.log(`Quotations     ${quotes.length} span(s) of ${QUOTE_MIN_WORDS}+ words in quotation marks\n`);

/* A span verifies when every FRAGMENT of it is verbatim in the corpus.
   Fragments: the span split on ellipsis ("…" / "...") — proper elision joins
   verbatim pieces — with sentence punctuation the writer's own style put
   inside the closing quote (trailing , . ; :) stripped. Wording inside a
   fragment is never loosened. */
/* Sentence-initial case. A fragment lifted into the middle of a sentence is
   lower-cased, and one opening a sentence is capitalised — the convention
   scholarly writing marks with "[R]oughly". That is placement, not wording, so
   the FIRST character is compared case-insensitively and every other character
   is not: alter a word inside a quotation and it still fails. */
const firstCharVariants = (f: string): string[] => {
  if (!f) return [f];
  const a = f[0].toUpperCase() + f.slice(1);
  const b = f[0].toLowerCase() + f.slice(1);
  return a === b ? [f] : [f, a, b];
};

const fragments = (text: string): string[] =>
  text.split(/\.\.\.|…/)
    .map(f => f.trim().replace(/^[,;:.]+|[,;:.]+$/g, '').trim())
    .filter(f => (f.match(/\S+/g) || []).length >= QUOTE_MIN_WORDS);

const missing: Quote[] = [];
for (const q of quotes) {
  const frags = fragments(q.text);
  const inCorpus = (f: string) => firstCharVariants(f).some(v => corpus.includes(v));
  const allFound = frags.length > 0 && frags.every(inCorpus);
  if (allFound) {
    const inFile = (c: { text: string }, f: string) => firstCharVariants(f).some(v => c.text.includes(v));
    const home = corpusPerFile.find(c => frags.every(f => inFile(c, f)))
      ?? corpusPerFile.find(c => inFile(c, frags[0]));
    console.log(`  ok    "${q.text.length > 68 ? q.text.slice(0, 65) + '…' : q.text}"`);
    if (home) console.log(`        └ ${path.basename(home.file)}`);
  } else if (frags.length === 0) {
    /* every fragment under the word floor once punctuation came off */
    continue;
  } else {
    missing.push(q);
  }
}

if (missing.length) {
  console.log('\n── FABRICATED OR UNFILED ─────────────────────────────────────');
  console.log('  These words are in quotation marks in the target and appear VERBATIM in');
  console.log('  no research file. Each is an invented quotation, a paraphrase wearing');
  console.log('  quotation marks, or evidence that was never filed. The fix is the same:');
  console.log('  file the source text in research/, or remove the quotation marks and');
  console.log('  state it as a paraphrase with its attribution.');
  for (const q of missing) console.log(`\n  ✗ "${q.text}"`);
  console.log('\n──────────────────────────────────────────────────────────────');
  console.log(`✗ ${missing.length} of ${quotes.length} quotation(s) unverifiable. Not ready to post.`);
} else {
  console.log('\n──────────────────────────────────────────────────────────────');
  console.log(`✓ every quotation traced to the corpus, verbatim.`);
  console.log('  This proves the words exist in research/ — not that the attribution is');
  console.log('  right, and not that the corpus itself is sound. Job 2 owns those.');
}
process.exit(missing.length ? 1 : 0);
