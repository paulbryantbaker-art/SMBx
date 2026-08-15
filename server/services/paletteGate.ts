/**
 * THE APP MAY NOT SHIP AN ARTIFACT IN A RETIRED PALETTE.
 *
 * Paul, 2026-08-15: *"i'll let cowork remake any collateral that needs
 * remaking. I just want to be sure that any docs or collateral made in app are
 * using the same DL."*
 *
 * That is an enforcement requirement, not a conversion one — and nothing
 * enforced it. `assertCarta` has guarded the local builders since the Carta
 * pass, but no server path called it, so the app could render a retired-palette
 * one-pager, file it into Collateral, and hand it to Paul as a download with
 * nothing anywhere saying so. "Be sure" cannot rest on every future edit
 * remembering; it has to rest on a gate.
 *
 * WHY NOT `assertCarta` DIRECTLY. It ends in `process.exit(4)`, which is right
 * for a CLI writing a file and catastrophic for a web server: one bad artifact
 * would take down the whole app for every other request. This throws instead,
 * so a bad artifact fails its own download and nothing else.
 *
 * THE MESSAGE ROUTES THE WORK. Same idiom as the API_LANES kill switch — a
 * blocked path names the work, says where that work happens now, and spells the
 * env var that undoes it. A guard that only says "no" gets switched off.
 */
import { checkCarta } from '../../house/palette-guard.js';

/**
 * `strict` (default) blocks. `warn` logs and lets it through.
 *
 * The escape hatch exists because this gate lands on THREE artifacts that
 * currently render in Ledger — the one-pager card, the announcement card and
 * the post card — and blocking a download is user-visible. It is deliberately
 * an env var rather than a code constant so the posture can be changed on
 * Railway without a deploy, and deliberately NOT the default, because a default
 * of `warn` is indistinguishable from no gate at all: nobody reads a server log
 * to find out what colour a PDF was.
 */
function mode(): 'strict' | 'warn' {
  return process.env.COLLATERAL_GUARD === 'warn' ? 'warn' : 'strict';
}

export class PaletteGateError extends Error {
  readonly artifact: string;
  constructor(artifact: string, report: string) {
    super(report);
    this.name = 'PaletteGateError';
    this.artifact = artifact;
  }
}

/**
 * Gate a document on its way to the renderer.
 *
 * Returns the html unchanged so it can wrap an expression inline — the point is
 * that a render path cannot forget to call it without the call site looking
 * obviously different.
 *
 * @param html   the document about to be rendered
 * @param label  the artifact, named as Paul would recognise it
 * @param where  the local builder that produces this artifact correctly
 */
export function gateArtifact(html: string, label: string, where?: string): string {
  const { ok, report } = checkCarta(html, label);
  if (ok) return html;

  const routed = report
    + (where
      ? `\nBuild this one in Cowork instead — the local builder is on Carta:\n  ${where}\n`
      : '')
    + `\nCOLLATERAL_GUARD=warn downgrades this to a log line. It is off by\n`
    + `default on purpose: a warning nobody reads is the same as no gate.\n`;

  if (mode() === 'warn') {
    console.warn(`[palette] ${label} is off-language and COLLATERAL_GUARD=warn let it through.${routed}`);
    return html;
  }
  throw new PaletteGateError(label, routed);
}

/** Non-throwing form, for a preview surface that would rather show a state. */
export function artifactIsCarta(html: string, label: string): boolean {
  return checkCarta(html, label).ok;
}
