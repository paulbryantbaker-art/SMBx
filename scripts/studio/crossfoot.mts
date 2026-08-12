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
const NUM = String.raw`\$?\s?(\d[\d,]*(?:\.\d+)?)\s*(%|bps\b|pp\b|[KkMmBbTt]\b|million|billion|trillion)?`;
const OPS = String.raw`[+×x*−\-÷/]`; // + × x * − - ÷ /
/* chain = number (op number)+ = result — markdown-bold and space tolerant.
   The leading (?<![\d.,)^%]\s?) guard stops a match STARTING mid-expression:
   without it "(1,563 + 484) ÷ 7,911 × 365 = 94.45" also matches as the false
   sub-chain "7,911 × 365 = 94.45", which computes to 2,887,515 and reads as a
   defect. A guard that invents findings is discarded within a week. */
const CHAIN = new RegExp(
  String.raw`(?<![\d.,)^]\s?)(?<![÷/×*+−\-]\s?)${NUM}((?:\s*${OPS}\s*\*{0,2}${NUM}\*{0,2}){1,8})\s*=\s*\*{0,2}${NUM}`, 'g');

const MAG: Record<string, number> = {
  k: 1e3, m: 1e6, b: 1e9, t: 1e12,
  million: 1e6, billion: 1e9, trillion: 1e12,
};
const isMag = (u?: string) => !!u && MAG[u.toLowerCase()] !== undefined;
/* precision of the printed result — 4.3 → 0.05 ; 598 → 0.5 */
const tol = (s: string) => {
  const dp = (s.split('.')[1] ?? '').length;
  return 0.5 * Math.pow(10, -dp) + 1e-9;
};
const ISO_DATE = /\d{4}-\d{2}-\d{2}/;

let checked = 0, wrong = 0, declined = 0;
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
      const whole = m[0];
      const short = whole.replace(/\s+/g, ' ').trim();
      const decline = (why: string) => {
        declined++;
        console.log(`  ·     L${li + 1}  ${short.slice(0, 70)} — ${why}; not computed`);
      };
      /* ── things this check does not do, each said out loud ───────────── */
      if (ISO_DATE.test(whole)) { decline('dates, not quantities'); continue; }
      if (/[\^()]/.test(whole)) { decline('exponent or parentheses — precedence unsupported'); continue; }
      const exprSrc = whole.slice(0, whole.lastIndexOf('='));
      const nums = [...exprSrc.matchAll(new RegExp(NUM, 'g'))]
        .map(x => ({ v: parseFloat(x[1].replace(/,/g, '')), unit: x[2] }));
      const ops = [...exprSrc.matchAll(new RegExp(OPS, 'g'))].map(x => x[0]);
      if (nums.length < 2 || ops.length !== nums.length - 1) continue;
      /* Industry codes are numerals, not quantities. The tell: real quantities
         that size carry thousands separators in this house (92,075 · 122,152);
         codes never do. Two or more comma-less 4+-digit integers is code talk. */
      const codeLike = [...whole.matchAll(/\d+(?:,\d{3})*(?:\.\d+)?/g)]
        .filter(x => !x[0].includes(',') && !x[0].includes('.') && x[0].length >= 4).length;
      if (codeLike >= 2) { decline('code-like operands, not arithmetic'); continue; }

      /* ── evaluate, left to right: house working is written in that order ── */
      const anyMag = nums.some(n => isMag(n.unit));
      const scaled = nums.map(n => isMag(n.unit) ? n.v * MAG[n.unit!.toLowerCase()] : n.v);
      let acc = scaled[0];
      for (let i = 0; i < ops.length; i++) {
        const b = scaled[i + 1], op = ops[i];
        if (op === '+') acc += b;
        else if (op === '−' || op === '-') acc -= b;
        else if (op === '×' || op === 'x' || op === '*') acc *= b;
        else acc /= b;
      }
      /* ── compare IN THE UNIT THE PAGE PRINTED, which is the whole trick ──
         · result in %   from divisions        → the quotient ×100
         · result in pp  from % operands       → already in points
         · result in bps from % operands       → points ×100
         · result in a magnitude (M/B/T):
             operands carried one  → divide down into that unit
             operands bare         → they were implicitly in it already      */
      const resultStr = m[m.length - 2] ?? '';
      const uR = m[m.length - 1];
      const uL = uR?.toLowerCase();
      const allDiv = ops.every(o => o === '÷' || o === '/');
      let got = acc;
      if (uL === '%' && allDiv) got = acc * 100;
      else if (uL === 'bps') got = acc * 100;
      else if (isMag(uR) && anyMag) got = acc / MAG[uL!];
      const expect = parseFloat(resultStr.replace(/,/g, ''));
      checked++;
      if (Math.abs(got - expect) <= tol(resultStr)) {
        console.log(`  ok    L${li + 1}  ${short.slice(0, 84)}`);
      } else {
        wrong++;
        console.log(`  ✗ WRONG  L${li + 1}  ${short.slice(0, 84)}`);
        console.log(`           computes to ${Number.isInteger(got) ? got : got.toPrecision(6)}, page says ${resultStr}${uR ?? ''}`);
      }
    }
  });
}

console.log('\n──────────────────────────────────────────────────────────────');
if (!checked && !declined) {
  console.log('· no inline arithmetic found. Nothing proved — a document that never');
  console.log('  shows its working gives this check nothing to hold.');
} else if (wrong) {
  console.log(`✗ ${wrong} of ${checked} arithmetic statement(s) do not compute. Not ready to post.`);
  if (declined) console.log(`  ${declined} further chain(s) DECLINED and named above — unchecked, not passed.`);
} else {
  console.log(`✓ all ${checked} arithmetic statement(s) compute at printed precision.`);
  if (declined) {
    console.log(`  ${declined} chain(s) DECLINED and named above — dates, exponents, parentheses,`);
    console.log('  codes. Each is unchecked, not passed: read them, or restate the working');
    console.log('  in a form that computes left to right.');
  }
  console.log('  This proves the working shown is done right — not that the inputs are');
  console.log('  true (job 2) or the labels on the results are right (a human read).');
}
process.exit(wrong ? 1 : 0);
