/**
 * Citation & derivation audit — behaviour suite.
 *
 * Run: npx tsx server/services/__tests__/researchLanes.audit.test.mts
 *
 * Why this file exists: the audit is the only thing standing between a
 * synthesized master and a silently fabricated number reaching a client
 * document. Paul, 2026-07-24: "It needs to work correctly in all cases — we
 * cannot lose citation, and if we infer a value, we need to be able to explain
 * our inferred value… it is OK to report a variation or a range of values as
 * long as we can say here's why and explain it."
 *
 * Every case below encodes one of those rules. Three of them exist because the
 * check got them WRONG first:
 *   • "$600 and $700 million" — the first endpoint carries no unit, so it read
 *     as "$600", missed the source's "$600 million", and flagged honest work.
 *   • "$50.7B" — the bare B suffix was unmatched, so the reports' own dominant
 *     notation looked like an unexplained inference.
 *   • an unacknowledged source passed because its topic words appeared in the
 *     body title rather than in the Sources register.
 */
import { auditCitations } from '../researchLanes.js';

let pass = 0, total = 0;
const T = (name: string, md: string, src: string[], lbl: string[], expectOk: boolean) => {
  total++;
  const a = auditCitations(md, src, lbl);
  const ok = a.ok === expectOk;
  pass += ok ? 1 : 0;
  console.log(`${ok ? '  ok  ' : ' FAIL '}${a.ok ? 'PASS' : 'FLAG'}  ${name}`);
  if (!ok) console.log(`        expected ${expectOk ? 'PASS' : 'FLAG'} — ${a.note.slice(0, 120)}`);
};

/* ── core: citation + derivation ──────────────────────────────────────── */
const SRC = `Gemini research. Data-center construction reached $50.7 billion SAAR (U.S. Census Bureau).
Comfort Systems backlog $11.94 billion (FY2025 10-K). See https://example.gov/vcw`;
const GOOD = `# L
Construction hit **$50.7B** (Census). Backlog **$11.94 billion** (FY2025 10-K).
Recurring pool **~$40B** (DERIVED).

## Sources
- Gemini research — Census VCW (https://example.gov/vcw); Comfort Systems FY2025 10-K.

## Derivations
- **~$40B** — DERIVED. $180B base x 22% service share; assumption, range $32B-$47B.
`;
const L = ['Gemini research'];

T('clean master, mixed $50.7B / $11.94 billion notation', GOOD, [SRC], L, true);
T('inferred figure with no Derivations entry', GOOD.replace(/## Derivations[\s\S]*$/, ''), [SRC], L, false);
T('source URL dropped from the master', GOOD.replace('https://example.gov/vcw', 'the series'), [SRC], L, false);
T('uploaded document never acknowledged in Sources', GOOD.replace('- Gemini research — ', '- '), [SRC], L, false);
T('invented figure, in no source and no register', GOOD.replace('Recurring pool **~$40B** (DERIVED).', 'Recurring pool **$63.2B**.'), [SRC], L, false);
T('no Sources section at all', GOOD.replace(/## Sources[\s\S]*?(?=## Derivations)/, ''), [SRC], L, false);

/* ── conflicting sources: both values stand, ranges are legitimate ────── */
const A = 'Capstone: pool is $700 million.';
const B = 'IBISWorld: pool is $600 million.';
const LB = ['Capstone read', 'IBISWorld read'];
const HEAD = `# L\nCapstone reports **$700 million**, IBISWorld **$600 million** — we cannot say which is right.\n`;
const REG = `\n## Sources\n- Capstone read — $700M.\n- IBISWorld read — $600M.\n`;

T('range citing both reported endpoints', HEAD + 'Between **$600 and $700 million**.\n' + REG, [A, B], LB, true);
T('en-dash range form', HEAD + '**$600–$700 million**.\n' + REG, [A, B], LB, true);
T('B-suffix range form', HEAD + '**$600M–$700M**.\n' + REG, [A, B], LB, true);
T('midpoint invented between two sources', HEAD + 'The pool is **$650 million**.\n' + REG, [A, B], LB, false);
T('midpoint WITH stated working', HEAD + '**$650 million** (DERIVED).\n' + REG +
  '\n## Derivations\n- **$650 million** — DERIVED midpoint of the $700M and $600M reads; true value unknown within that spread.\n',
  [A, B], LB, true);

/* ── notation equivalence: source and master may write it differently ─── */
for (const [srcForm, mstForm] of [
  ['$50.7 billion', '$50.7B'], ['$180 billion', '$180B'], ['$40 billion', '$40bn'],
  ['1.03 million', '1.03M'], ['$3 trillion', '$3T'], ['$700 million', '$700M'],
  ['28.1%', '28.1%'], ['9.7x', '9.7x'],
] as [string, string][]) {
  T(`notation: source "${srcForm}" vs master "${mstForm}"`,
    `# L\nValue is **${mstForm}**.\n\n## Sources\n- Doc A — the figure.\n`,
    [`Doc A reports ${srcForm} for the thing.`], ['Doc A'], true);
}

console.log(`\n${pass}/${total} correct`);
process.exit(pass === total ? 0 : 1);
