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
ok('the app renders through it',
  /from '\.\.\/\.\.\/house\/report\.js'/.test(composer) && /HR\.reportDocument\(/.test(composer));

ok('both take the Carta faces, which the grammar names',
  /cartaFontFaceCss\(\)/.test(buildReport) && /CARTA_FONTS_CSS/.test(composer));

/* The renderer-proof split has to be the SAME split on both sides or the two
   PDFs differ in the one way a reader notices: a re-composited dark cover. */
ok('both rasterize the cover through the shared helpers',
  /R\.coverOnlyDocument\(|R\.withFlatCover\(/.test(buildReport)
  && /HR\.coverOnlyDocument\(/.test(composer) && /HR\.withFlatCover\(/.test(composer));
ok('…and share the page margins and the footer',
  /R\.REPORT_MARGIN/.test(buildReport) && /HR\.REPORT_MARGIN/.test(composer)
  && /R\.reportFooterTemplate/.test(buildReport) && /HR\.reportFooterTemplate/.test(composer));

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
  /export function numberSections/.test(report)
  && /HR\.numberSections\(/.test(composer)
  && !/^function numberSections/m.test(composer));

/* Still open, and recorded so the order of work is a fact on disk rather than a
   memory: the one-pager is two implementations in one palette family. Written
   to go red the same way the report's did. */
ok('KNOWN GAP: the one-pager is still a second implementation',
  /LEDGER, TYPE, blockBackground/.test(buildOnepager)
  && /export function researchCardHtml/.test(composer));

/* The Ledger consts survive in researchComposer for the card, the announcement
   and the postcard — the artifacts not yet extracted. Asserted so that when the
   last one moves, this goes red and the dead code gets deleted rather than
   sitting there looking live. */
ok('KNOWN GAP: the Ledger palette is still reachable for the un-extracted artifacts',
  /const BRASS = LEDGER\.brass/.test(composer));

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

/* ── THE APP CANNOT SHIP OFF-LANGUAGE (2026-08-15) ─────────────────────── */

/* Paul: *"i'll let cowork remake any collateral that needs remaking. I just
   want to be sure that any docs or collateral made in app are using the same
   DL."*

   "Be sure" cannot rest on every future edit remembering. `assertCarta` had
   guarded the local builders since the Carta pass and NO server path called it,
   so the app could render a Ledger one-pager, file it into Collateral, and hand
   it over as a download with nothing saying so. Every artifact-producing
   function in researchComposer now returns through `gateArtifact`.

   This asserts the SET, not a count: a new producer added without a gate is the
   failure, and counting would let one be swapped for another. */
{
  const PRODUCERS = [
    'researchReportHtml', 'linkedInDocHtml', 'researchCardHtml',
    'announcementCardHtml', 'postCardHtml', 'designedDeckHtml',
  ];
  ok('the app imports the palette gate', /from '\.\/paletteGate\.js'/.test(composer));

  const ungated: string[] = [];
  for (const fn of PRODUCERS) {
    const start = composer.indexOf(`function ${fn}(`);
    if (start < 0) { ungated.push(`${fn} (missing)`); continue; }
    const end = composer.indexOf('\n}\n', start);
    if (!composer.slice(start, end).includes('gateArtifact(')) ungated.push(fn);
  }
  is('every artifact producer returns through the gate', ungated, []);

  /* houseDeckHtml is the ONE that must NOT be gated, and the reason is the
     interesting part: it is fail-soft, so a throw inside it returns null and
     the caller renders the LEDGER legacy template instead. Gating there would
     convert "this document is off-language" into "silently render the more
     off-language one". linkedInDocHtml gates both paths on the way out.
     Pinned so a later tidy-up does not "fix the missing gate". */
  {
    const start = composer.indexOf('function houseDeckHtml(');
    const end = composer.indexOf('\n}\n', start);
    ok('houseDeckHtml is deliberately NOT gated — it is fail-soft',
      !composer.slice(start, end).includes('gateArtifact('));
  }

  /* The gate must THROW, never exit: assertCarta ends in process.exit(4), which
     is right for a CLI writing a file and would take the whole server down. */
  const gate = read('server/services/paletteGate.ts');
  /* Comments stripped first — the file EXPLAINS why it does not call
     process.exit, and a check that reads the explanation as the behaviour is
     the same mistake the DESIGN.md builder table made an hour ago. */
  const gateCode = gate.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  ok('the gate throws rather than exiting the process',
    /throw new PaletteGateError/.test(gateCode) && !/process\.exit/.test(gateCode));
  ok('…and blocks by default, warning only when told to',
    /COLLATERAL_GUARD === 'warn' \? 'warn' : 'strict'/.test(gate));
  ok('…and a blocked path says where the work happens instead',
    /build-report\.mts|build-onepager\.mts/.test(composer));
}

/* KNOWN GAP, and the sharpest one left: deckDesigner.ts instructs a MODEL to
   write the deck HTML, and its brand contract is still Ledger — Fraunces,
   Inter, the jade block, brass. That path WINS over the house grammar at every
   caller (`designedDeckHtml(run) ?? linkedInDocHtml(...)`), so the app's
   default carousel was the designed Ledger one. The gate now sends it to the
   Carta template instead of shipping it, which is a correct outcome and not a
   fix. Rewriting the contract in Carta is the fix. */
ok('KNOWN GAP: the deck designer still briefs the model in Ledger',
  /import \{ LEDGER/.test(read('server/services/deckDesigner.ts')));

/* ── and the session has to be TOLD ───────────────────────────────────── */

/* Every finding in this file is worthless to Cowork if it stays in the repo.
   Cowork is Claude Desktop: it reads the files in the workspace and cannot be
   relied on to run a CLI. COLLATERAL_STATE.md is the write-up, and these three
   are its delivery mechanism — the same check WHERE.md carries, for the same
   reason. A law that does not travel is the defect this practice keeps
   finding. */
{
  const state = read('content/studio/COLLATERAL_STATE.md');
  const init = read('scripts/studio/init-workspace.mts');
  const ws = read('content/studio/workspace-CLAUDE.md');

  ok('init-workspace copies COLLATERAL_STATE.md into the workspace',
    init.includes("'COLLATERAL_STATE.md'"));
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
