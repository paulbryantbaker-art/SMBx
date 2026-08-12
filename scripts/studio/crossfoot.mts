/**
 * CROSSFOOT — every piece of arithmetic written on the page must compute.
 *
 * WHY. The A.0.7 correction exists because 291 + 192 + 66 + 49 was summed
 * correctly and then the sum was filed under the wrong band name — and the
 * documents downstream carried "26 ÷ 307 = 8.5%" as the 10–249 share for nine
 * days. The label half of that error needs a human. The arithmetic half does
 * not: wherever a document writes out its working — `a + b = c`, `a ÷ b = c%`,
 * `a − b = c`, `a × b = c` — the working can be checked by a machine, exactly
 * the way an accountant cross-foots a schedule.
 *
 * This reads a master or document, finds every inline arithmetic statement,
 * and recomputes it. Tolerance is the precision of the printed result: a
 * result printed `4.3%` is right if the true value rounds to 4.3%. A result
 * printed `598` must be exactly 598.
 *
 * It deliberately checks only what is WRITTEN. It cannot know that a sum's
 * label is right (A.0.7's actual failure), that inputs are true (job 2), or
 * that unstated arithmetic is sound — a figure with no working shown is
 * audit.mts's territory (Derivations register), not this one's.
 *
 *   npx tsx scripts/studio/crossfoot.mts markets/<m>/master.md [more files…]
 *
 * Exit 0 all arithmetic computes · 1 mismatch(es) · 2 usage.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const files = process.argv.slice(2).filter(a => !a.startsWith('--'));
if (!files.length || files.some(f => !existsSync(f))) {
  console.error('usage: crossfoot.mts <doc.md> [more…]');
  process.exit(2);
}

/* A number as documents print them: $1,858M · 4.3% · 598 · 2,412 · 13.3 */
const NUM = String.raw`\$?\s?(\d[\d,]*(?:\.\d+)?)\s*(%|[KkMmBbTt]\b|million|billion|trillion|pp\b)?`;
const OPS = String.raw`[+×x*−\-÷/]`; // + × x * − - ÷ /
/* chain = number (op number)+ = result   — markdown bold/space tolerant */
const CHAIN = new RegExp(
  String.raw`${NUM}((?:\s*${OPS}\s*\*{0,2}${NUM}\*{0,2}){1,8})\s*=\s*\*{0,2}${NUM}`, 'g');

const MAG: Record<string, number> = {
  k: 1e3, m: 1e6, b: 1e9, t: 1e12,
  million: 1e6, billion: 1e9, trillion: 1e12,
};
const toVal = (numStr: string, unit: string | undefined) => {
  const v = parseFloat(numStr.replace(/,/g, ''));
  if (!unit) return v;
  const u = unit.toLowerCase();
  if (u === '%' || u === 'pp') return v;      // computed in the printed unit
  return v * (MAG[u] ?? 1);
};
/* precision of the printed result — 4.3 → 0.05 ; 598 → 0.5 */
const tol = (s: string) => {
  const dp = (s.split('.')[1] ?? '').length;
  return 0.5 * Math.pow(10, -dp) + 1e-9;
};

let checked = 0, wrong = 0;
for (const file of files) {
  const raw = readFileSync(file, 'utf8');
  console.log(`\nCrossfoot      ${path.relative(process.cwd(), file)}`);
  const lines = raw.split('\n');
  lines.forEach((line, li) => {
    /* NAICS prose — "2382 comprises 238210 + 238220 + 238290" — is code
       enumeration, not arithmetic. A code is not a quantity. */
    if (/NAICS/i.test(line)) return;
    /* strip markdown emphasis so **598** parses; keep the raw line for print */
    const text = line.replace(/\*\*/g, '');
    for (const m of text.matchAll(CHAIN)) {
      const [whole, n1, u1, chain, , , nR, uR] = m;
      /* Re-tokenise the full expression left of `=` */
      const exprSrc = whole.slice(0, whole.lastIndexOf('='));
      const nums = [...exprSrc.matchAll(new RegExp(NUM, 'g'))]
        .map(x => ({ v: toVal(x[1], x[2]), raw: x[0] }));
      const ops = [...exprSrc.matchAll(new RegExp(OPS, 'g'))].map(x => x[0]);
      if (nums.length < 2 || ops.length !== nums.length - 1) continue;
      /* Industry codes are numerals, not quantities — "238210 + 238220 +
         238290 = 2382" is an identity about classification, and 2382 − 238210
         is nobody's subtraction. The tell: real quantities that size carry
         thousands separators in this house (92,075 · 122,152); codes never do.
         Two or more comma-less 4+-digit integers in one chain is code talk.
         The skip is PRINTED — a silent skip is how a guard goes blind. */
      const codeLike = [...whole.matchAll(/\d+(?:,\d{3})*(?:\.\d+)?/g)]
        .filter(x => !x[0].includes(',') && !x[0].includes('.') && x[0].length >= 4).length;
      if (codeLike >= 2) {
        console.log(`  ·     L${li + 1}  ${whole.replace(/\s+/g, ' ').trim().slice(0, 70)} — code-like operands, not arithmetic; skipped`);
        continue;
      }
      /* Percent results from ÷ are printed ×100; detect by result unit. */
      let acc = nums[0].v;
      for (let i = 0; i < ops.length; i++) {
        const b = nums[i + 1].v, op = ops[i];
        if (op === '+') acc += b;
        else if (op === '−' || op === '-') acc -= b;
        else if (op === '×' || op === 'x' || op === '*') acc *= b;
        else acc /= b;
      }
      const resultStr = nR;
      let expect = toVal(resultStr, uR);
      let got = acc;
      if (uR === '%' && ops.every(o => o === '÷' || o === '/')) got = acc * 100;
      /* A magnitude-unit result compares in that magnitude, not raw. */
      if (uR && uR !== '%' && uR !== 'pp') got = got / (MAG[uR.toLowerCase()] ?? 1) * (MAG[uR.toLowerCase()] ?? 1), expect = toVal(resultStr, uR);
      checked++;
      if (Math.abs(got - expect) <= tol(resultStr) * (uR && MAG[uR.toLowerCase()] ? MAG[uR.toLowerCase()] : 1)) {
        console.log(`  ok    L${li + 1}  ${whole.replace(/\s+/g, ' ').trim().slice(0, 84)}`);
      } else {
        wrong++;
        console.log(`  ✗ WRONG  L${li + 1}  ${whole.replace(/\s+/g, ' ').trim().slice(0, 84)}`);
        console.log(`           computes to ${Number.isInteger(got) ? got : got.toPrecision(6)}, page says ${resultStr}${uR ?? ''}`);
      }
    }
  });
}

console.log('\n──────────────────────────────────────────────────────────────');
if (!checked) {
  console.log('· no inline arithmetic found. Nothing proved — a document that never');
  console.log('  shows its working gives this check nothing to hold.');
} else if (wrong) {
  console.log(`✗ ${wrong} of ${checked} arithmetic statement(s) do not compute. Not ready to post.`);
} else {
  console.log(`✓ all ${checked} arithmetic statement(s) compute at printed precision.`);
  console.log('  This proves the working shown is done right — not that the inputs are');
  console.log('  true (job 2) or the labels on the results are right (a human read).');
}
process.exit(wrong ? 1 : 0);
