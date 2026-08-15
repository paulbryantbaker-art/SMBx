/**
 * THE BACKTICK GUARD.
 *
 * `house/deck.ts` builds its stylesheet inside a template literal. A backtick
 * written into a COMMENT inside that literal terminates the string, and the
 * build dies with a parser error pointing at a line a long way from the cause —
 * "Expected ; but found pretty", "Expected ; but found cover".
 *
 * This happened FOUR times on 2026-08-06 alone, every time from the same
 * instinct: writing `text-wrap: balance` or `::before` or `cover` in backticks
 * because that is how you quote code in prose. The habit is correct everywhere
 * except inside the one file that is itself a template literal.
 *
 * Four repeats of one mistake is not carelessness, it is a missing check. So:
 *
 *   npx tsx scripts/studio/backtick-check.mts
 *
 * Exit 1 with the file, line and text of every offender. Run it before a build,
 * or wire it into the builder — an error here costs a second; the same error
 * found by esbuild costs a confused ten minutes reading the wrong line.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('../..', import.meta.url).pathname);

/* Files whose CSS lives in a template literal. Add to this list, do not
   generalise: a backtick in an ordinary .ts comment is perfectly legal, and a
   check that fires on those would be noise. */
const GUARDED = [
  'house/deck.ts',
  /* house/report.ts builds the report stylesheet inside a template literal the
     same way deck.ts does — the same trap, so the same guard. A backtick in one
     of its block comments terminates the string and the file stops parsing. */
  'house/report.ts',
  'scripts/studio/build-deck.mts',
  'scripts/studio/build-report.mts',
  'scripts/studio/build-onepager.mts',
];

type Hit = { file: string; line: number; text: string };
const hits: Hit[] = [];

/* Only comments INSIDE a template literal matter. A backtick in an ordinary
   file-header comment is legal and common — flagging those produced fifteen
   false positives on the first run, which is precisely the cry-wolf guard
   nobody keeps.

   Test: blank every comment, then count unescaped backticks in the remaining
   CODE before the comment starts. Odd means a template literal is open at that
   point, so the comment is inside it and its backticks will close the string. */
const insideTemplate = (codeOnly: string, upTo: number): boolean => {
  let n = 0;
  for (let k = 0; k < upTo; k++) {
    if (codeOnly[k] === '`' && codeOnly[k - 1] !== '\\') n++;
  }
  return n % 2 === 1;
};

for (const rel of GUARDED) {
  let src: string;
  try { src = readFileSync(path.join(ROOT, rel), 'utf8'); } catch { continue; }

  const re = /\/\*(?:(?!\*\/)[\s\S])*?\*\/|\/\/[^\n]*/g;
  const spans = [...src.matchAll(re)];

  /* Comments blanked to spaces, newlines kept so offsets and line numbers hold. */
  let codeOnly = src;
  for (const m of spans) {
    const blank = m[0].replace(/[^\n]/g, ' ');
    codeOnly = codeOnly.slice(0, m.index) + blank + codeOnly.slice(m.index! + m[0].length);
  }

  for (const m of spans) {
    if (!m[0].includes('`')) continue;
    if (!insideTemplate(codeOnly, m.index!)) continue;   // harmless
    const line = src.slice(0, m.index).split('\n').length;
    for (const [i, l] of m[0].split('\n').entries()) {
      if (l.includes('`')) hits.push({ file: rel, line: line + i, text: l.trim() });
    }
  }
}

if (!hits.length) {
  console.log(`backtick check ok — ${GUARDED.length} file(s), no backticks in block comments.`);
  process.exit(0);
}

console.error('✗ BACKTICK IN A COMMENT — this terminates the CSS template literal.\n');
for (const h of hits) {
  console.error(`  ${h.file}:${h.line}`);
  console.error(`    ${h.text}\n`);
}
console.error(`${hits.length} line(s). Use plain words or single quotes instead.`);
process.exit(1);
