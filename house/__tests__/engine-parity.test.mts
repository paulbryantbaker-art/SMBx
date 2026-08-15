/**
 * ONE ENGINE, TWO CONSUMERS — asserted, not assumed.
 *
 * Run: npx tsx house/__tests__/engine-parity.test.mts   (npm run test:engine-parity)
 *
 * Paul, 2026-08-15: *"the studio in app needs to use the same exact engine and
 * process as the Cowork used smbx-studio"* — *"a shared engine structure,
 * separate use cases."*
 *
 * That is already the doctrine (`house/deck.ts` opens by stating it) and it was
 * already one-third true. What was missing is the thing that makes a doctrine
 * hold: a check. This file is that check, and writing it immediately found a
 * defect that had been shipping silently.
 *
 * THE DEFECT, because it is the reason this file's shape is what it is.
 * `researchComposer.houseDeckHtml` renders through `house/deck.ts` — genuinely
 * the shared grammar, exactly as intended. But it embedded the LEDGER font set
 * (Inter, Fraunces, Plex) while `deckCss()` asks for `CARTA_TYPE` (Source Serif
 * 4, Schibsted Grotesk). Neither Carta face was in the document. On a Mac the
 * browser quietly borrowed an installed face; in the container — Alpine with
 * Noto and nothing else — both fell through to the generic fallback. Same
 * spec, same tokens, same grammar, different document.
 *
 * Nothing catches that: a missing @font-face is not an error, it is a
 * substitution, and the substitution renders. So a shared MODULE is not
 * sufficient for a shared OUTPUT — the whole seam has to be shared, and the
 * parts of the seam that are strings in a template get checked here by reading
 * the source, because that is where they live.
 *
 * WHAT THIS FILE ASSERTS, AND WHAT IT CANNOT.
 * It asserts WIRING: that both consumers of an artifact reach the same grammar
 * module and the same font set, and that the local builders keep calling the
 * guards. It cannot assert that two rendered PDFs are byte-identical — that
 * needs Chromium and real assets, and it belongs in a render harness. Wiring is
 * where every drift so far has actually entered, so wiring is what is watched.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

let pass = 0, total = 0;
function is(name: string, got: unknown, want: unknown) {
  total++;
  const ok = JSON.stringify(got) === JSON.stringify(want);
  pass += ok ? 1 : 0;
  console.log(`${ok ? '  ok  ' : ' FAIL '}${name}`);
  if (!ok) console.log(`        got  ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`);
}
function ok(name: string, cond: boolean) { is(name, cond, true); }

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (p: string) => readFileSync(path.join(ROOT, p), 'utf8');

const composer = read('server/services/researchComposer.ts');
const buildDeck = read('scripts/studio/build-deck.mts');
const buildReport = read('scripts/studio/build-report.mts');
const buildOnepager = read('scripts/studio/build-onepager.mts');
const deck = read('house/deck.ts');

/* ── the carousel: the artifact that already shares its engine ─────────── */

/* This pair is the PRECEDENT the rest of the collateral is meant to follow, so
   it is pinned hard. If either side stops importing the house grammar, the two
   surfaces have quietly become two builders again. */
ok('the app renders the carousel through house/deck.ts',
  /from '\.\.\/\.\.\/house\/deck\.js'/.test(composer));
ok('build-deck.mts renders the carousel through house/deck.ts',
  /house\/deck\.ts/.test(buildDeck));

ok('both reach the same two entry points — deckPages and deckCss',
  /deckPages, deckCss/.test(composer) && /deckPages, deckCss/.test(buildDeck));

/* THE FONT SEAM — the defect above, pinned so it cannot come back.
   `deckCss()` names the Carta faces; a document that embeds the Ledger set
   renders the Carta grammar in whatever the host happens to have. */
ok('house/deck.ts asks for the Carta faces',
  /CARTA_TYPE/.test(deck));
ok('the app embeds the CARTA faces on the deck, not the Ledger set',
  /CARTA_FONTS}\s*\n?<style>\$\{deckCss/.test(composer));
ok('…and it imports cartaFontFaceCss to do it',
  /import \{[^}]*cartaFontFaceCss[^}]*\} from '\.\/fontEmbeds\.js'/.test(composer));
ok('build-deck.mts embeds the same Carta faces',
  /cartaFontFaceCss/.test(buildDeck));

/* The Ledger embed still exists and is still correct for the artifacts in this
   file that have not been restyled. Asserting it stays REACHABLE stops a future
   cleanup from deleting it and silently un-fonting the report and the card. */
ok('the Ledger embed survives for the not-yet-restyled artifacts',
  /const EMBEDDED_FONTS = fontFaceCss\(\)/.test(composer));

/* ── the guards: a local builder may not render unguarded ─────────────── */

/* `assertCarta` is what stops a retired palette leaving a builder. It reads the
   rendered document rather than the source, which is the only place the
   question has one answer — so every builder that writes a file must call it.
   Recorded per builder rather than as a blanket sweep, because the interesting
   information is WHICH one lost its guard. */
ok('build-report.mts guards its palette', /assertCarta\(/.test(buildReport));
ok('build-deck.mts guards its palette', /assertCarta\(/.test(buildDeck));

/* ── the drift that is still open, recorded rather than asserted away ──── */

/* THE REPORT IS TWO IMPLEMENTATIONS IN TWO DESIGN LANGUAGES.
   `build-report.mts` renders Carta — flat #131512 cover, Source Serif 4, one
   green accent, radius 0, palette-guarded, renderer-proof asserted.
   `researchComposer.researchReportHtml` renders Ledger — Fraunces, brass, bone
   card, radius 14px, a box-shadow. It has no cover page, runs no guard, and
   would FAIL `assertCarta` outright: it names a retired typeface and retired
   hexes.
   `house/report.ts` does not exist yet. These three assertions are the honest
   state of that, and they are written to GO RED when the extraction lands —
   which is the point. A test that passes both before and after a fix is not
   tracking the fix. */
const REPORT_GRAMMAR_EXTRACTED = false; // flip when house/report.ts exists
ok('KNOWN GAP: there is no shared report grammar yet',
  REPORT_GRAMMAR_EXTRACTED === false);
ok('KNOWN GAP: the app still renders reports in the retired Ledger display face',
  /const DISPLAY = `'Fraunces'/.test(composer));
ok('KNOWN GAP: …and still uses brass, which Carta retired',
  /const BRASS = LEDGER\.brass/.test(composer));

/* The one-pager is the same story one notch less severe: two implementations,
   same palette family. Recorded so the extraction order is a fact on disk. */
ok('KNOWN GAP: the one-pager is a second implementation too',
  /LEDGER, TYPE, blockBackground/.test(buildOnepager)
  && /export function researchCardHtml/.test(composer));

/* ── what "separate use cases" means, so it is not read as "separate copies" ─ */

/* The shared thing is the GRAMMAR; the different thing is where the content and
   the assets come from. house/deck.ts is pure and takes its images as data URIs
   through DeckAssets precisely so the app can resolve them from studio_assets
   and the CLI from disk. If the grammar ever grows an fs or db import, the two
   consumers stop being able to share it — that is the failure mode, and it is
   cheap to watch. */
ok('the shared grammar does no I/O — no fs',
  !/from 'node:fs'|require\('fs'\)|from 'fs'/.test(deck));
ok('…no database', !/postgres|from '\.\.\/server\//.test(deck));
ok('…and no environment or clock',
  !/process\.env|Date\.now\(\)/.test(deck));
ok('…so it takes its assets as an injected parameter instead',
  /export interface DeckAssets/.test(deck));

console.log(`\n${pass}/${total} correct`);
process.exit(pass === total ? 0 : 1);
