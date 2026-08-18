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
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as HR from '../report.js';
import { checkCarta } from '../palette-guard.js';

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

/**
 * Source with comments stripped — use this for any check about BEHAVIOUR.
 *
 * This helper exists because the same mistake was made three times in one day.
 * A converted file's comments legitimately name the thing it stopped doing —
 * "CARTA, not LEDGER", "this used to call process.exit", "Fraunces is retired" —
 * and a regex over raw source reads the explanation as the behaviour and fires
 * on the file's own documentation. Every one of those failures looked like a
 * real regression for a minute.
 *
 * The inverse also matters and is why this is a helper rather than a blanket
 * rule: a check that the file still EXPLAINS itself must read the raw source.
 * Pick deliberately, and the two forms now look different at the call site.
 */
const codeOf = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const buildDeck = read('scripts/studio/build-deck.mts');
const buildReport = read('scripts/studio/build-report.mts');
const buildOnepager = read('scripts/studio/build-onepager.mts');
const deck = read('house/deck.ts');

/* ── ONE ENGINE, ONE CONSUMER (2026-08-16) ─────────────────────────────────
   This block replaces three sections — "the carousel", "THE APP CANNOT SHIP
   OFF-LANGUAGE", and the deck-designer brief — and it is a STRONGER guarantee
   than what they asserted.

   Those sections existed because there were TWO renderers: the app's
   `researchComposer` / `deckDesigner`, and the local `scripts/studio/*.mts`
   builders. Parity is what you check when you cannot have singularity. Phase A
   deleted the app's side outright, so the question stops being "do the two
   agree" and becomes "is there still only one" — which is checkable by
   existence rather than by grepping two files for matching strings.

   `paletteGate.ts` went with them. It was a choke point that threw before an
   off-language artifact could leave the server; with no server-side renderer
   left there is nothing for it to stand in front of, and an unreferenced guard
   is worse than no guard because it reads as protection.

   IF ANY OF THESE FILES COMES BACK, THIS TEST FAILS — which is the point. A
   second renderer inside the app is exactly the drift the whole `house/`
   doctrine exists to prevent, and it would arrive looking like a convenience. */
{
  const gone = [
    'server/services/researchComposer.ts',
    'server/services/deckDesigner.ts',
    'server/services/collateralComposer.ts',
    'server/services/artworkService.ts',
    'server/services/paletteGate.ts',
    'server/routes/research.ts',
  ];
  for (const f of gone) {
    ok(`no server-side renderer: ${f}`, !existsSync(path.join(ROOT, f)));
  }

  /* And the local builders are still the ones that exist, still routed through
     house/. This is the half of the old parity check that survives, because it
     was never about the app — it was about the builders not hand-rolling. */
  /* NOTE THE IMPORT FORM. The builders reach house/ through a DYNAMIC
     `await import(pathToFileURL(path.join(ROOT, 'house/deck.ts')))`, not the
     static `from '../../house/deck.js'` the deleted app renderer used — they
     are .mts run by tsx from an arbitrary cwd, so the path is resolved at
     runtime. The first cut of this assertion grepped for the static form and
     failed on both builders; the check was wrong, not the code. */
  ok('build-deck routes through house/deck', /house\/deck\.ts'\)\)/.test(buildDeck));
  ok('build-report routes through house/report', /house\/report\.ts'\)\)/.test(buildReport));
  ok('build-deck embeds the CARTA faces, not the retired set',
    /cartaFontFaceCss/.test(buildDeck) && !/\bfontFaceCss\(\)/.test(codeOf(buildDeck)));
  ok('build-report embeds the CARTA faces', /cartaFontFaceCss/.test(buildReport));
  ok('build-onepager embeds the CARTA faces', /cartaFontFaceCss/.test(buildOnepager));
}

/* ── the guards: a local builder may not render unguarded ─────────────── */

/* `assertCarta` is what stops a retired palette leaving a builder. It reads the
   rendered document rather than the source, which is the only place the
   question has one answer — so every builder that writes a file must call it.
   Recorded per builder rather than as a blanket sweep, because the interesting
   information is WHICH one lost its guard. */
ok('build-report.mts guards its palette', /assertCarta\(/.test(buildReport));
ok('build-deck.mts guards its palette', /assertCarta\(/.test(buildDeck));

/* ── the report: extracted 2026-08-15, and pinned in the new position ──── */

/* This was three KNOWN-GAP assertions written to go red when the extraction
   landed, and it landed. Before: build-report.mts rendered Carta (flat #131512
   cover, Source Serif 4, one green accent, radius 0, guarded, renderer-proof
   asserted) and researchComposer.researchReportHtml rendered Ledger (Fraunces,
   brass, a bone card at radius 14 with a box-shadow, no cover page, no guard) —
   the second would have failed assertCarta outright. Two houses, one artifact.
   Now both call house/report.ts. */
const report = read('house/report.ts');

ok('the shared report grammar exists',
  /export function reportDocument/.test(report));
ok('build-report.mts renders through it',
  /house\/report\.ts/.test(buildReport) && /R\.reportDocument\(/.test(buildReport));
/* The app's half of these assertions is gone with its renderer (Phase A). What
   they were really guarding is that the ONE remaining builder does not drift
   from the grammar, so each check keeps its local half and drops the pair. */
ok('it takes the Carta faces, which the grammar names',
  /cartaFontFaceCss\(\)/.test(buildReport));

/* The renderer-proof split has to be the SAME split on both sides or the two
   PDFs differ in the one way a reader notices: a re-composited dark cover. */
ok('it rasterizes the cover through the shared helpers',
  /R\.coverOnlyDocument\(|R\.withFlatCover\(/.test(buildReport));
ok('…and takes the page margins and the footer from the grammar',
  /R\.REPORT_MARGIN/.test(buildReport) && /R\.reportFooterTemplate/.test(buildReport));

/* THE ONE THING A CLIENT DOCUMENT ADDS (Paul, 2026-08-15: "it will just have
   whose it's for on the cover too"). One field, on the cover, in both parsers —
   so a client deck is the house artifact plus a name, never a second template.
   `for:` is the .md spelling; `preparedFor` is the API. */
ok('the cover carries who it is for', /preparedFor\?: string/.test(report));
ok('…the .md convention reads it as `for:`', /k === 'for' \|\| k === 'preparedFor'/.test(report));
ok('…and it renders, rather than being parsed and dropped',
  /class="cv-for"/.test(report) && /\.cv-for \{/.test(report));

/* `sec-N` addresses a section for BOTH the accent bands and the board
   thumbnails. Two copies of an ordinal scheme is a silent off-by-one, so there
   is one, and the app calls it rather than keeping its own. */
ok('section ordinals come from one place',
  /export function numberSections/.test(report));

/* CLOSED 2026-08-15 (Paul: "no ledger at all. carta"). The one-pager builder
   was `LEDGER, TYPE, blockBackground` and is now Carta, fonted and guarded.
   It is still a SEPARATE implementation from the app's researchCardHtml — the
   grammar has not been lifted into house/ the way the deck's and the report's
   were. As of Phase A that is no longer a drift risk at all: the app's rival
   copy is DELETED rather than gated, so there is nothing left to diverge from.
   Lifting it into house/ is now tidiness, not safety. */
ok('the one-pager builder is on Carta',
  !/\bLEDGER\b/.test(codeOf(buildOnepager))
  && /cartaFontFaceCss/.test(buildOnepager) && /assertCarta\(/.test(buildOnepager));
{
  const og = read('scripts/studio/build-og-card.mts');
  ok('the OG-card builder is on Carta',
    !/\bLEDGER\b/.test(codeOf(og)) && /cartaFontFaceCss/.test(og) && /assertCarta\(/.test(og));
  /* It also hard-coded its three typefaces as string literals, so no font
     change could ever have reached it — a second, quieter way to be stranded
     on a retired system that reads nothing like a palette bug. */
  ok('…and reads its type from tokens rather than hard-coding the faces',
    /CARTA_TYPE/.test(og) && !/'Fraunces'/.test(og));
}
ok('KNOWN GAP: the one-pager grammar still lives in its builder, not in house/',
  /function post(Dark|Light)?Html|export const post|function render/.test(buildOnepager));

/* THE TRIPWIRE FIRED, AND IT FIRED CORRECTLY (2026-08-16).

   This used to assert `const BRASS = LEDGER.brass` still existed in
   researchComposer, with the note: "asserted so that when the last one moves,
   this goes red and the dead code gets deleted rather than sitting there
   looking live." Phase A deleted the whole file, the assertion went red, and
   the dead code went with it. That is a check doing its job.

   What replaces it points at where Ledger ACTUALLY still lives, so the same
   tripwire keeps working. `ownerFunnel.ts` and `ownerFullReport.ts` are the
   OWNER-side artifacts — the free valuation and the full evaluation the public
   funnel mails out. They are still Ledger, they are still live, and they are
   the last two renderers in the server on a retired palette. Neither was in
   scope for Phase A (they are the funnel, not the app), and neither ever passed
   through the palette gate. When they convert, this goes red. */
{
  const ledgerLeft = ['server/services/ownerFunnel.ts', 'server/services/ownerFullReport.ts']
    .filter(f => /LEDGER/.test(read(f)));
  is('KNOWN GAP: the owner-side artifacts are the last Ledger renderers', ledgerLeft, [
    'server/services/ownerFunnel.ts', 'server/services/ownerFullReport.ts',
  ]);
}

/* ── the report document itself, exercised rather than grepped ─────────── */

/* Everything above reads source. These build the document the APP now produces
   — its shapes, its fields — and put it through the same guard the local
   builder runs, which is the one check that actually answers "is this the
   house language". Real assets are data URIs and opaque to a substring search,
   so stubs are honest here.

   This is where the value is: the app's report USED to fail this. */
{
  const doc = HR.reportDocument({
    eyebrow: 'RESEARCH FINDINGS · MARKET ASSESSMENT',
    titleHtml: HR.splitTitle('<h1>Home Services M&amp;A</h1>').titleHtml,
    preparedFor: 'Ridgeline Capital Partners',
    stats: [{ n: '$600B+', l: 'Combined U.S. revenue' }],
    cards: [{ tag: '01', body: '<em>9.5x median EBITDA</em><br>Capstone · Jul 2026' }],
    introHtml: '<p>Intro prose.</p>',
    byline: { name: 'Paul Baker', role: 'smbX — buy-side corporate development' },
    bodyHtml: HR.numberSections(
      '<h2>One</h2><p>Body <strong>bold</strong>.</p><blockquote><p>A notice.</p></blockquote>'
      + '<table><thead><tr><th>A</th></tr></thead><tbody><tr><td>1</td></tr></tbody></table>'),
    bodyHasH1: false,
    footerLabel: 'Home Services M&amp;A',
    appendixHtml: '<h2>Sources</h2><ol class="srcs"><li><span class="st">Capstone</span></li></ol>',
    disclaimer: 'Research by smbX.',
  }, { logoWhite: 'data:image/png;base64,AAAA', headshot: 'data:image/jpeg;base64,AAAA', hero: null },
     "@font-face{font-family:'Source Serif 4';src:url(data:font/woff2;base64,AAAA)}");

  const guard = checkCarta(doc, 'app-report');
  if (!guard.ok) console.log(guard.report);
  ok('the app\'s report document passes the palette guard', guard.ok);

  /* RENDERER-PROOF, statically. Everything translucent belongs on the
     rasterized cover; the vector body must carry none of it, because a
     transparency group is what lets Preview re-composite a page. The old app
     report shipped a box-shadow AND a radius in the flow. */
  const body = doc.slice(doc.indexOf('<main'));
  const translucent = [/rgba\(/, /box-shadow/, /linear-gradient/, /border-radius/]
    .filter(re => re.test(body)).map(String);
  is('nothing translucent reaches the vector body', translucent, []);

  /* WHOSE IT IS FOR — present when supplied, ABSENT when not. The second half
     matters more than the first: published collateral must not grow a client
     line because the field defaulted to something. */
  ok('a client document names who it is for',
    doc.includes('Prepared for') && doc.includes('Ridgeline Capital Partners'));
  const published = HR.reportDocument({
    eyebrow: 'X', titleHtml: '<h1>T</h1>', byline: { name: 'P', role: 'r' },
    bodyHtml: '<p>b</p>', bodyHasH1: false, footerLabel: 'T',
  }, { logoWhite: '', headshot: '', hero: null }, '');
  ok('published collateral carries no client line', !published.includes('Prepared for'));

  /* The two-stage render. Both sides call these, so a mismatch here is a
     mismatch in the one thing a reader notices — a re-composited dark cover. */
  const coverOnly = HR.coverOnlyDocument(doc);
  ok('the cover raster sees the cover and nothing else',
    /class="cover( nohero)?"/.test(coverOnly)
    && !coverOnly.includes('<main')
    && !coverOnly.includes('class="appendix"')
    && !coverOnly.includes('class="disc"'));
  const flat = HR.withFlatCover(doc, 'data:image/jpeg;base64,BBBB');
  ok('the flat cover replaces the live one and keeps everything after it',
    flat.includes('cover-flat') && !/class="cover( nohero)?"/.test(flat)
    && flat.includes('<main') && flat.includes('class="appendix"') && flat.includes('class="disc"'));

  /* WRONG-FIRST, kept as a test: the cover is `class="cover nohero"` whenever
     there is no hero image, so a check written against `class="cover"` reports
     that the cover was dropped when it is sitting right there. Two of the
     assertions above were written that way and both lied. */
  ok('a hero-less cover is still a cover',
    /class="cover nohero"/.test(doc) && !/class="cover"/.test(doc));
}

/* ── the cover config convention, shared so both sides read one .md ────── */

{
  const parsed = HR.parseReportMarkdown([
    '<!--cover',
    'byline: Paul Baker',
    'for: Ridgeline Capital Partners',
    'stat: $600B+ | Combined U.S. revenue',
    'accent: Consolidation | wave.png | 50% 30%',
    'eyebrow: MARKET ASSESSMENT',
    '-->',
    '# Home Services',
    '',
    '---',
    '',
    '## One',
    'Body.',
  ].join('\n'));

  is('`for:` lands on preparedFor', parsed.cfg.preparedFor, 'Ridgeline Capital Partners');
  is('stats parse as value | label', parsed.cfg.stats, [{ n: '$600B+', l: 'Combined U.S. revenue' }]);
  is('accents parse as match | image | position', parsed.cfg.accents,
    [{ match: 'Consolidation', img: 'wave.png', pos: '50% 30%' }]);
  /* This one is a REGRESSION TEST, not a nicety: the parser assigns with
     `k in cfg`, so a key declared only in the type is silently dropped — which
     is exactly what happened to `eyebrow:` for a while. It parsed, it matched,
     and it did nothing. */
  is('eyebrow is actually assigned, not silently dropped', parsed.cfg.eyebrow, 'MARKET ASSESSMENT');
  is('a body that leads with ## is not an H1 body', parsed.bodyHasH1, false);
  ok('the cover is what precedes the first rule', parsed.coverMd.includes('# Home Services'));
  ok('…and the body is what follows it',
    parsed.bodyMd.startsWith('## One') && !parsed.bodyMd.includes('# Home Services'));
}

/* ── and the session has to be TOLD ───────────────────────────────────── */

/* Every finding in this file is worthless to Cowork if it stays in the repo.
   Cowork is Claude Desktop: it reads the files in the workspace and cannot be
   relied on to run a CLI. COLLATERAL_STATE.md is the write-up, and these three
   are its delivery mechanism — the same check WHERE.md carries, for the same
   reason. A law that does not travel is the defect this practice keeps
   finding. */
{
  /* ONE CLONE (2026-08-18): the workspace lives at `studio/` in this repo and
     the write-up is read in place — the copier that used to carry it there is
     retired, so "it travels" is now "it is there and the CLAUDE.md beside it
     points at it". */
  const state = read('studio/COLLATERAL_STATE.md');
  const ws = read('studio/CLAUDE.md');

  ok('COLLATERAL_STATE.md lives in the workspace itself', state.length > 0);
  ok('the workspace CLAUDE.md routes to it before a build',
    ws.includes('COLLATERAL_STATE.md'));

  /* It must NAME the two behind builders. A write-up that says "some builders
     are behind" sends a session to check, which is the thing it exists to
     spare them. */
  ok('…and it names both builders that are still on Ledger',
    state.includes('build-onepager.mts') && state.includes('build-og-card.mts'));
  ok('…states the hand-roll law first, because that is the drift',
    /Never hand-roll a layout/.test(state));
  ok('…and carries the font trap, which no diff would ever show',
    /Source Serif 4/.test(state) && /@font-face/.test(state));
}

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
