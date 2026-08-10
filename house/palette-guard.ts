/**
 * THE PALETTE GUARD — a retired colour cannot leave a builder.
 *
 * WHY THIS EXISTS. Paul, 2026-08-08: *"make the style sticky and eliminate
 * reversion to any previous style."* Everything before this was a document
 * telling a session what to do, and this practice has now watched that fail
 * three times in eight days: the Aurora handoff described a palette that was
 * never committed, the Carta work order described one that was never on disk,
 * and the first Carta re-render shipped correct pages carrying Ledger pictures.
 * A rule that only exists in prose is a rule that gets read by whoever happens
 * to read it.
 *
 * So this is not advice. Every builder calls `assertCarta()` on the document it
 * is about to render, and a document carrying a retired hex or a retired
 * typeface **does not get written**. The build exits non-zero and names the
 * offender, the count, and where to look.
 *
 * WHAT IT CANNOT DO. It reads the DOCUMENT, not the pictures — a base64 image
 * is opaque to a substring search, and the Ledger artwork is exactly how the
 * last reversion happened. `scripts/studio/carta-guard.mts` covers the library;
 * this covers the markup. Between them the two surfaces that have actually
 * regressed are both watched.
 *
 * WHY IT IS NOT SIMPLY "GREP THE SOURCE". Source greps pass while output fails:
 * a token can change its job, a consumer can hold the old meaning, and a colour
 * can arrive through a function three files away. The rendered document is the
 * only place the question "what colour is this artifact" has one answer.
 */
import { LEDGER, CARTA, REPORT } from './tokens.js';

const norm = (h: string) => h.toUpperCase();
const live = new Set([...Object.values(CARTA), ...Object.values(REPORT)].map(norm));

/**
 * Every hex this house has retired, with the system it belonged to.
 *
 * The Ledger values are derived rather than typed, so retiring another one is a
 * `tokens.ts` edit and not two. Six Ledger values survived the Carta restyle
 * unchanged — bone, ink, Deal Green, its hover, the chip tint and mint — and
 * the `live` filter is what keeps those out of the graveyard.
 */
const DEAD: Array<[string, string]> = [
  ...Object.entries(LEDGER)
    .filter(([, hex]) => !live.has(norm(hex)))
    .map(([name, hex]) => [hex, `Ledger/Aurora ${name}`] as [string, string]),
  ['#C9E8DA', 'Ledger REPORT.ivorySub'],
  ['#BFE3D2', 'Ledger REPORT.statLabel'],
  ['#F1ECE0', 'Ledger REPORT.tableHead'],
  ['#16624C', 'Ledger green-black, Deal Green'],
  ['#0F4E3C', 'Ledger green-black, hover'],
  ['#0F1A16', 'Ledger green-black, boardroom band'],
  ['#B08637', 'Ledger green-black, brass'],
  ['#F6F4EF', 'Ledger green-black, bone'],
  ['#14181C', 'Ledger green-black, ink'],
  ['#8FD0AE', 'Ledger green-black, mint'],
  ['#F3F1EA', 'Ledger green-black, ivory'],
  ['#FF385C', 'coral site v1'],
  ['#E61E4D', 'coral site v1'],
  ['#D70466', 'coral site v1'],
  ['#185ABD', 'office-blue pivot'],
  ['#124A9E', 'office-blue pivot'],
  ['#9EC1FF', 'office-blue pivot'],
  ['#D4714E', 'terra cotta wireframes'],
  ['#00D632', 'liquid-glass marketing'],
  ['#D44A78', 'hot pink V3/V4'],
];

/** Faces this house has retired. A document may not name one. */
const DEAD_TYPE = ['Fraunces', 'Newsreader'];

export interface GuardResult { ok: boolean; report: string; }

/**
 * @param html   the document about to be rendered
 * @param label  what to call it in the failure message
 */
export function checkCarta(html: string, label: string): GuardResult {
  const hay = html.toUpperCase();
  const hits: string[] = [];

  for (const [hex, origin] of DEAD) {
    const n = hay.split(norm(hex)).length - 1;
    if (n > 0) hits.push(`  ${hex}  ×${n}   ${origin}`);
  }
  /* Type is matched on the FONT-FAMILY declaration, not on the bare word: a
     comment explaining why Fraunces was retired is not a document using it, and
     a guard that fires on its own documentation gets switched off. */
  for (const face of DEAD_TYPE) {
    const re = new RegExp(`font-family\\s*:[^;}]*['"]?${face}`, 'gi');
    const n = (html.match(re) || []).length;
    if (n > 0) hits.push(`  '${face}'  ×${n}   retired typeface, set as a family`);
  }

  if (!hits.length) return { ok: true, report: `✓ palette guard — ${label} is Carta` };

  return {
    ok: false,
    report:
      `\n✗ PALETTE GUARD FAILED — ${label} carries retired values:\n\n` +
      hits.join('\n') +
      `\n\nCarta is canon (2026-08-08). Nothing renders in a retired palette.\n` +
      `  · A hex reached the document from somewhere — a hardcoded literal, a\n` +
      `    LEDGER import, or a token whose JOB changed while its consumers did not.\n` +
      `  · content/studio/DESIGN.md §2 lists every dead system with its hexes.\n` +
      `  · Nothing new imports LEDGER. It survives only as the rollback path.\n`,
  };
}

/** Throwing form — what a builder calls. Writes nothing on failure. */
export function assertCarta(html: string, label: string): void {
  const { ok, report } = checkCarta(html, label);
  if (!ok) { console.error(report); process.exit(4); }
}
