/**
 * The house design language — conformance suite.
 *
 * Run: npx tsx house/__tests__/design.test.mts
 *
 * Why this file exists: `content/studio/DESIGN.md` describes the palette in
 * prose, and prose about colour is exactly the kind of thing that goes quietly
 * wrong. A brand change moves `house/tokens.ts`, every renderer follows it, and
 * the document keeps instructing sessions in the OLD colours — which they
 * follow faithfully, because it is the only description they were given. The
 * output drifts with no code change to review and nothing visibly wrong in the
 * diff. That is the same failure `brandPaletteLines()` exists to prevent for
 * model prompts; this is it for the human-and-session-facing document.
 *
 * So three things are pinned:
 *   1. every hex in DESIGN.md is a real token          (nothing invented)
 *   2. every token is documented in DESIGN.md          (nothing omitted)
 *   3. the WEBSITE's own stylesheet still uses them    (the "looks like our
 *      website" claim is checked, not asserted)
 *
 * Plus the dead-systems list, which is the document's main defence against
 * drift and is worthless if a retired hex leaks into the live sections.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { CARTA, LEDGER, REPORT } from '../tokens.js';

const ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
const DESIGN = readFileSync(path.join(ROOT, 'content/studio/DESIGN.md'), 'utf8');
const SITE_CSS = readFileSync(path.join(ROOT, 'client/src/practice/practice.css'), 'utf8');
const REPORT_CSS = readFileSync(path.join(ROOT, 'client/src/practice/report.css'), 'utf8');

let pass = 0, total = 0;
function is(name: string, got: unknown, want: unknown) {
  total++;
  const ok = JSON.stringify(got) === JSON.stringify(want);
  pass += ok ? 1 : 0;
  console.log(`${ok ? '  ok  ' : ' FAIL '}${name}`);
  if (!ok) console.log(`        got ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`);
}

const up = (h: string) => h.toUpperCase();
const HEX_RE = /#[0-9A-Fa-f]{6}\b/g;
const hexesIn = (s: string) => [...new Set((s.match(HEX_RE) || []).map(up))];

/* Every token that must be described, as `name → hex`. Derived from the token
   module rather than restated, so a token added there fails here until it is
   documented — which is the point. */
/* 2026-08-12: CARTA joined the universe when Cowork's rewrite made it the
   collateral language (the doc landed on main without this suite moving —
   main ran 70/77 until this commit). LEDGER stays in the ALLOWED set because
   the doc may still quote it as history, but the DOCUMENTED requirement below
   is CARTA's — requiring LEDGER rows in a Carta palette table would demand
   the doc teach a retired system. */
const TOKENS: Record<string, string> = { ...LEDGER, ...REPORT };
const DOCUMENTED: Record<string, string> = { ...CARTA };
/* The hex universe is the VALUES of all three exports taken separately —
   spreading them into one record silently DROPS every LEDGER value whose
   key CARTA reuses (dark, muted, hair, bone…), which made real tokens read
   as "invented". Found because #0A6A4C failed membership while LEDGER.dark
   held exactly that value. */
const ALL_TOKEN_VALUES = [
  ...Object.values(LEDGER), ...Object.values(REPORT), ...Object.values(CARTA),
] as string[];

/* ── 1. the retired systems ───────────────────────────────────────────────
   These are the hexes a drifting session reaches for. They belong in the dead
   list and nowhere else in the file — a retired hex appearing in a live
   section would read as sanctioned. */

const DEAD = [
  '#16624C', '#0F4E3C', '#0F1A16',  // Ledger green-black, retired by Aurora 2026-07-31
  '#F6F4EF', '#14181C', '#B08637', '#8FD0AE',  // Ledger-trial bone/ink/brass/mint, same retirement
  '#FF385C', '#E61E4D', '#D70466',  // coral practice site v1–v3
  '#185ABD', '#124A9E', '#9EC1FF',  // office-blue pivot
  '#D4714E',                        // terra cotta wireframe pass
  '#00D632',                        // liquid-glass neon
  '#D44A78',                        // hot pink V3/V4
];

const DEAD_START = DESIGN.indexOf('# 2. DEAD');
const LIVE_START = DESIGN.indexOf('# 3. It looks like the website');
is('DESIGN.md has the sections this suite navigates by', DEAD_START > 0 && LIVE_START > DEAD_START, true);

for (const d of DEAD) {
  is(`dead ${d} is named in the dead-systems table`,
    DESIGN.slice(DEAD_START, LIVE_START).toUpperCase().includes(d), true);
}

/* Checking "no dead hex after §3" is not enough, and the first version of this
   suite proved it: swapping the accent in the §1 PASTE BLOCK to retired coral
   passed clean, because §1 sits before the split point. The paste block is the
   most-copied text in the file — the one paragraph that ends up inside other
   prompts — so it is the worst possible place to leave unguarded.

   So the rule applies to the whole document: a retired hex may appear only
   where it is being retired — a row of the §2 table, or the paste block's
   explicit ban clause. Anywhere else, including any line that describes it
   positively, is a drift.

   Getting the SCOPE of that exemption right took two tries, and both failures
   are worth keeping in mind because both passed a mutated file clean:

   - Per LINE was too narrow. The ban clause is prose and wraps, so "Never:"
     lands on one line and half the retired hexes on the next — the clause was
     flagged as a violation of itself.
   - Per PARAGRAPH was too wide. The paste block is a single paragraph that
     names the live accent AND bans the retired ones, so exempting the whole
     paragraph exempted the accent too: swapping Deal Green for retired coral
     in the most-copied text in the file still passed.

   So the exemption runs from the "Never:" marker to the end of the paragraph,
   and everything before it is live guidance. */
const leaked: string[] = [];
let offset = 0;
for (const block of DESIGN.split(/\n\s*\n/)) {
  const start = DESIGN.indexOf(block, offset);
  offset = start + block.length;
  if (start >= DEAD_START && start < LIVE_START && /^\s*\|/m.test(block)) continue; // §2 table
  const ban = block.search(/\bNever:/);
  const live = ban >= 0 ? block.slice(0, ban) : block;
  const hits = hexesIn(live).filter(h => DEAD.map(up).includes(h));
  if (hits.length) leaked.push(`${hits.join(' ')} in: ${live.slice(0, 60).replace(/\n/g, ' ')}…`);
}
is('no retired hex is used as live guidance anywhere in the file', leaked, []);

/* A retired hex must never be a live token either — the belt to that suspenders. */
for (const d of DEAD) {
  is(`dead ${d} is not a house token`, Object.values(TOKENS).map(up).includes(d), false);
}

/* ── 2. nothing invented, nothing omitted ─────────────────────────────────
   Both directions matter. A hex in the doc that is not a token is a colour a
   session would use and no renderer would produce; a token missing from the doc
   is a colour a session has to guess at. */

const TOKEN_HEXES = new Set(ALL_TOKEN_VALUES.map(up));

/* Hexes the document legitimately carries that are not palette tokens: the
   glaze/ring rgba() recipes quote them, and the dead table names retired ones.
   Anything else must be a token. */
const ALLOWED_NON_TOKEN = new Set([...DEAD.map(up)]);

const docHexes = hexesIn(DESIGN);
const invented = docHexes.filter(h => !TOKEN_HEXES.has(h) && !ALLOWED_NON_TOKEN.has(h));
is('DESIGN.md invents no colours', invented, []);

/* Scoped to §4 deliberately. "Appears somewhere in the file" is too weak: the
   §1 paste block names most of the palette in passing, so deleting a whole row
   out of the reference table still passed. §4 is the table a session reads to
   answer "what colour is X" — a token missing from THERE is a token that has to
   be guessed at, whatever else the file happens to mention. */
const PAL_START = DESIGN.indexOf('# 4. The palette');
const PAL_END = DESIGN.indexOf('# 5. Type');
is('DESIGN.md has a palette section', PAL_START > 0 && PAL_END > PAL_START, true);
const paletteHexes = hexesIn(DESIGN.slice(PAL_START, PAL_END));

const undocumented = Object.entries(DOCUMENTED)
  .filter(([, hex]) => !paletteHexes.includes(up(hex)))
  .map(([name]) => name);
is('every CARTA token is in the §4 palette tables', undocumented, []);

/* ── 3. the website actually uses these ───────────────────────────────────
   §3 of DESIGN.md claims the collateral looks like the site because it IS the
   site's values. That is a checkable claim, so check it. If a site retheme
   moves one of these, this fails and the mapping table gets updated with it —
   rather than the document quietly describing a site that no longer exists. */

const SITE_MAP: [string, string, string][] = [
  ['--pd-ink', CARTA.ink, 'ink'],
  ['--pd-body', CARTA.body, 'body ink'],
  ['--pd-tert', CARTA.muted, 'muted'],
  ['--pd-hair', CARTA.hair, 'hairline'],
  ['--pd-coral', CARTA.green, 'Deal Green (historical var name)'],
  ['--pd-cta', CARTA.green, 'CTA green'],
  ['--pd-cta-hover', CARTA.greenHover, 'green hover'],
  ['--pd-dark-bg', CARTA.dark, 'the flat dark band'],
];
for (const [varName, hex, label] of SITE_MAP) {
  const m = SITE_CSS.match(new RegExp(`${varName}:\\s*(#[0-9A-Fa-f]{6})`));
  is(`site ${varName} is ${label} ${hex}`, m ? up(m[1]) : null, up(hex));
}

/* The bone canvas is set as a literal background on .pd, not as a custom
   property, so it is matched on its own. */
is('site canvas is bone', SITE_CSS.includes(`background: ${CARTA.bone}`), true);

/* The research page holds parity with the report PDF, which is the strongest
   form of the claim in §3 — same markdown, same reading ink. */
is('research page uses the report body ink', REPORT_CSS.includes(REPORT.body), true);

/* ── 4. the laws that make the document work ──────────────────────────────
   Each of these is a rule that cost a rebuild when it was broken. They are
   pinned so an edit cannot quietly drop one. */

/* The site and the collateral are DIFFERENT SYSTEMS during the Carta port
   (2026-08-07). DESIGN.md's opening claim — "everything smbX produces looks
   like one practice" — is false while that is true, so the interim notice is
   pinned here: a session that deletes it re-asserts something untrue, and a
   session that reads the site's tokens into a deck breaks the phase split. */
/* The interim split ENDED with the Carta collateral rewrite (2026-08-12):
   the doc's claim is unity again, so the pin moves from the split notice to
   the unity sentence — a session that deletes it deletes the point. */
is('DESIGN.md claims site/collateral unity',
   DESIGN.includes('read as the same practice'), true);
is('DESIGN.md names both token exports so neither is guessed at',
   DESIGN.includes('`LEDGER`') && DESIGN.includes('`CARTA`'), true);

const MUST_SAY: [string, string][] = [
  ['tokens.ts is named as the source of truth', 'house/tokens.ts'],
  ['the display weight is stated', '550'],
  ['the variable-name trap is called out', '`--pd-coral` is green'],
  ['the trade slot is named', 'trade slot'],
  ['the bookend law is stated', 'cover and closer take the band'],
  ['the 13px floor is stated', 'below 13px'],
  ['hand-rolled layout is named as the largest tell', 'You wrote HTML or CSS'],
  ['real-photos-only is stated', 'real or absent'],
  ['the two founder photos are named', 'founder-portrait.jpg'],
];
for (const [name, needle] of MUST_SAY) is(name, DESIGN.includes(needle), true);

/* FORMATS.md owns the slot dimensions. DESIGN.md must not restate them — two
   copies of a measurement is how one of them goes stale. */
is('DESIGN.md does not duplicate the slot table', /476\s*×\s*1102|404\s*×\s*604\s*px\b.*\bratio/i.test(DESIGN), false);
is('DESIGN.md points at FORMATS.md instead', DESIGN.includes('FORMATS.md'), true);

/* ── 4b. CSS comment markers must balance ─────────────────────────────────
   This exists because it shipped. A paragraph pasted in after a comment's
   closing marker ran on as raw CSS and swallowed the rule beneath it into a
   selector that matches nothing, so `padding-top: 0` silently stopped applying
   and the contents sheet grew a 22px gap that list rows scrolled through.

   CSS has no safety net here: an unparseable selector is DROPPED, with no
   build warning and no runtime error. The only signal was a user screenshot.
   Counting the markers is crude and would have caught it instantly. */
for (const rel of ['client/src/practice/report.css', 'client/src/practice/practice.css']) {
  const css = readFileSync(path.join(ROOT, rel), 'utf8');
  const opens = (css.match(/\/\*/g) || []).length;
  const closes = (css.match(/\*\//g) || []).length;
  is(`${path.basename(rel)}: comment markers balance`, `${opens} open / ${closes} close`, `${opens} open / ${opens} close`);
  // A stray terminator sitting after ordinary prose, once real comments are
  // stripped, is the exact shape of the bug. (Written with line comments on
  // purpose: spelling the terminator inside a block comment closes it early —
  // which is how I broke this file on the first attempt, minutes after the
  // same slip broke report.css.)
  const orphanClose = /^\s*[^/*\s][^\n]*\*\/\s*$/m.test(css.replace(/\/\*[\s\S]*?\*\//g, ''));
  is(`${path.basename(rel)}: no comment terminator outside a comment`, orphanClose, false);
}

/* ── 4c. the builder-state table must match the builders ──────────────────
   WHY THIS EXISTS. The notice at the top of DESIGN.md claimed "all four
   builders import CARTA" and it was FALSE for two of them — `build-onepager`
   and `build-og-card` both open by destructuring `LEDGER`, embed the Ledger
   faces, and run no palette guard. The claim was prose, so nothing checked it,
   and a session reading DESIGN.md as canon had no reason to look.

   That is the fourth time in this codebase a law has read authoritative and
   been wrong (THE_LINE_POLICY and DESIGN_LANGUAGE cited from a workspace that
   cannot open them; a fee rule sourced from a file that does not exist). The
   remedy each time is the same: derive the claim from the thing it describes.

   So the table is checked against the source. A builder counts as CONVERTED
   when it touches no LEDGER token outside a comment, embeds the Carta faces,
   and calls assertCarta — all three, because the font seam alone was enough to
   render a fully-Carta grammar in the wrong typeface for a week. */
{
  const BUILDERS = ['build-deck', 'build-report', 'build-onepager', 'build-og-card'];
  const behind: string[] = [];
  for (const b of BUILDERS) {
    const src = readFileSync(path.join(ROOT, `scripts/studio/${b}.mts`), 'utf8');
    // Comments are where a converted builder legitimately still NAMES Ledger,
    // to say why it left. Strip them or every explanation reads as a relapse.
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    const usesLedger = /\bLEDGER\b/.test(code);
    const cartaFaces = /cartaFontFaceCss/.test(code) && !/[^a]\bfontFaceCss\(/.test(code);
    const guarded = /assertCarta\(/.test(code);
    if (usesLedger || !cartaFaces || !guarded) behind.push(`${b}.mts`);
  }

  /* Now READ THE TABLE and compare, row by row.

     WRONG-FIRST, and instructively so: the first version of this check asserted
     only that DESIGN.md CONTAINED each behind builder's name. Editing the
     one-pager's row to claim it was converted left the name in place, so the
     check stayed green while the document said the opposite of the truth — the
     precise failure it was written to prevent, reproduced by the check itself.
     A test that reads a name is not reading a claim. This parses the row. */
  const rows = new Map<string, boolean>(); // builder → does the doc call it converted
  for (const line of DESIGN.split('\n')) {
    /* The `> ` prefix is not optional decoration — the table lives inside the
       notice's blockquote, and a regex anchored on `|` matched nothing at all.
       That is why the row loop silently ran zero times on the first attempt and
       the whole check reported green. An empty iteration is not a pass. */
    const m = line.match(/^>?\s*\|\s*\*{0,2}`(build-[a-z-]+\.mts)`\*{0,2}\s*\|(.*)$/);
    if (!m) continue;
    const [, name, rest] = m;
    // A row claims CONVERTED when it says neither LEDGER nor "no" for the guard.
    const claimsBehind = /LEDGER/i.test(rest) || /\|\s*\*{0,2}no\*{0,2}\s*\|?\s*$/i.test(rest);
    rows.set(name, !claimsBehind);
  }

  is('the notice tabulates every builder', [...rows.keys()].sort(), BUILDERS.map(b => `${b}.mts`).sort());

  /* Paul, 2026-08-15: "no ledger at all. carta." So the expectation is NONE,
     and this is the assertion that turns that from an intention into a floor:
     a builder that regains a LEDGER import, loses its Carta faces or drops its
     guard fails here, named. It was `['build-onepager.mts', 'build-og-card.mts']`
     for the few hours between measuring the drift and fixing it. */
  is('no builder is behind Carta', behind, []);

  for (const [name, claimsConverted] of rows) {
    /* Both directions are wrong. Claiming converted while a builder still
       imports LEDGER is how this shipped for a week; claiming behind after one
       lands turns the table into noise nobody trusts. */
    is(`DESIGN.md's row for ${name} matches the source`,
      claimsConverted, !behind.includes(name));
  }

  /* The notice may now legitimately SAY all four are converted, because they
     are — but not as bare prose in place of the table. The old sentence is
     banned by its exact wording so it cannot be pasted back.

     QUOTED USES ARE EXEMPT, and that exemption is not a loophole — it is the
     same shape as §2's dead-hex rule, where naming a retired value inside the
     graveyard is how a session catches itself. The notice explains the failure
     by quoting the sentence that caused it, and a check that cannot tell a
     citation from a claim fires on its own documentation and gets switched off.
     (Written after this fired on exactly that, an hour after the identical
     mistake in the palette-gate check.) */
  const unquoted = DESIGN.replace(/["“][^"”]*["”]/g, '');
  is('the notice does not restate the claim as unchecked prose',
    /all four builders import it/.test(unquoted), false);
  is('…and the banned sentence IS still quoted, so the lesson survives',
    /all four builders import it/.test(DESIGN), true);
  is('…and the table is still what carries it',
    rows.size, BUILDERS.length);
}

/* ── 4d. EVERY travelling law file, not just this one ─────────────────────
   This suite guarded DESIGN.md and nothing else, on the reasonable-sounding
   basis that DESIGN.md is where the palette is documented. It is not where the
   palette is USED. `FORMATS.md` carries the Gemini image-brief template — the
   literal text a session pastes into an image model — and it travels to the
   workspace beside DESIGN.md with exactly the same authority.

   It was naming `#FCFAF6` as the background and `#131512` as the flat band.
   Both were real Carta values and both moved: the canvas went bone→white on
   2026-08-12 and the band is `#181818`. Neither is a token any more, so every
   illustration generated from that template came back on a ground no renderer
   produces — sitting slightly warm on a pure-white page, which reads as a
   printing fault rather than as a palette error.

   A stale hex in a PROMPT is worse than one in a renderer: the renderer is
   checked by assertCarta at build time, and the prompt's output is a picture,
   which the palette guard cannot see through. So the rule is now: any law file
   that travels may name only live tokens, outside its own dead list. */
{
  const TRAVELS = [
    'content/studio/FORMATS.md',
    'content/studio/COLLATERAL_STATE.md',
    'content/studio/workspace-CLAUDE.md',
    'content/studio/PLAYBOOK.md',
  ];
  for (const rel of TRAVELS) {
    let text: string;
    try { text = readFileSync(path.join(ROOT, rel), 'utf8'); }
    catch { is(`${rel} exists`, false, true); continue; }

    /* Same exemption shape as §2: a hex may appear where it is being RETIRED.
       These files defer their graveyard to DESIGN.md rather than keeping their
       own, so the exemption is narrow — a sentence that retires it by name. */
    const offenders = hexesIn(text).filter(h => {
      if (TOKEN_HEXES.has(h)) return false;
      const at = text.toUpperCase().indexOf(h);
      const around = text.slice(Math.max(0, at - 220), at + 220);
      return !/retired|dead|drift|never|no longer|graveyard/i.test(around);
    });
    is(`${path.basename(rel)} names only live tokens`, offenders, []);
  }
}

/* ── 5. it travels ────────────────────────────────────────────────────────
   The document only solves anything if it reaches the workspace. */
const INIT = readFileSync(path.join(ROOT, 'scripts/studio/init-workspace.mts'), 'utf8');
is('init-workspace copies DESIGN.md into the workspace',
  INIT.includes(`law('content/studio/DESIGN.md', 'DESIGN.md')`), true);
const WS = readFileSync(path.join(ROOT, 'content/studio/workspace-CLAUDE.md'), 'utf8');
is('the workspace CLAUDE.md tells a session to read it', WS.includes('DESIGN.md'), true);
is('FORMATS.md cross-references it',
  readFileSync(path.join(ROOT, 'content/studio/FORMATS.md'), 'utf8').includes('DESIGN.md'), true);

/* ── 6. image briefs ──────────────────────────────────────────────────────
   A brief hardcodes the palette as literal text, because a human copies it
   into Gemini — so it cannot import a token, and it is exactly the drift
   `brandPaletteLines()` exists to stop: move the palette and the brief keeps
   instructing the model in the old colours, faithfully, with nothing wrong in
   any diff. It is checked here instead.

   Retired hexes are ALLOWED in a brief, but only inside its reject checklist,
   which is where they do their job — a session cannot catch itself drifting
   without knowing which values are dead. So the rule is scoped: live sections
   must carry only live tokens; the checklist may name the dead. */
const BRIEFS = ['scripts/studio/briefs/site-hero.image-brief.md'];
for (const rel of BRIEFS) {
  const brief = readFileSync(path.join(ROOT, rel), 'utf8');
  const name = rel.split('/').pop();

  // The prompt must name the CURRENT accent, ink and paper.
  const promptStart = brief.indexOf('## The prompt');
  const promptEnd = brief.indexOf('## Accepting it');
  is(`${name} has a prompt block`, promptStart > 0 && promptEnd > promptStart, true);
  const prompt = brief.slice(promptStart, promptEnd).toUpperCase();
  for (const [label, hex] of [['accent', LEDGER.green], ['ink', LEDGER.ink], ['paper', LEDGER.bone]] as const) {
    is(`${name} prompt names the live ${label} ${hex}`, prompt.includes(hex.toUpperCase()), true);
  }
  // …and must not name a retired one, where the model would obey it.
  const deadInPrompt = DEAD.filter(d => prompt.includes(d.toUpperCase()));
  is(`${name} prompt names no retired colour`, deadInPrompt, []);
}

/* ── 7. the error screen ──────────────────────────────────────────────────
   The one screen a visitor sees when everything else has failed, and until
   2026-08-01 the only screen still wearing the retired terra-cotta wireframe
   palette. It survived every rebrand because this suite reads STYLESHEETS and
   that component styles inline — so the check follows it there.

   Its palette is inlined deliberately (it must render when the app is broken,
   and an import is one more thing that can be broken), which is exactly the
   condition that makes an automated check worth having. */
const EB = readFileSync(path.join(ROOT, 'client/src/components/shared/ErrorBoundary.tsx'), 'utf8');
/* The header comment documents what it used to be, so retired hexes are
   legitimate there and nowhere else — same scoping as the image briefs. */
const EB_CODE = EB.slice(EB.indexOf('export class'));
const ebHexes = [...new Set((EB_CODE.match(/#[0-9A-Fa-f]{6}/g) || []).map(h => h.toUpperCase()))];
const LIVE = new Set([...Object.values(LEDGER), ...Object.values(REPORT)].map(v => String(v).toUpperCase()));
is('the error screen invents no colours',
  ebHexes.filter(h => !LIVE.has(h) && h !== '#FFFFFF'), []);
is('the error screen names no retired colour',
  DEAD.filter(d => EB_CODE.toUpperCase().includes(d.toUpperCase())), []);
is('the error screen uses the house faces', /Fraunces/.test(EB_CODE) && /Inter/.test(EB_CODE), true);
is('the error screen no longer names Yulia at a stranger', /Yulia/.test(EB_CODE), false);

/* ── 8. the APP wears Aurora too (2026-08-02, Paul: "marry Aurora with
   Cash App"). Phase 1 of UI_RETOOL_READINESS.md: the Atlas token objects
   import house/tokens.ts, so the app and the site cannot drift. Slot
   names are historical (T.blue holds Deal Green — the --pd-coral
   precedent); these cases pin the marriage AND the two laws that must
   survive it: the verdict green stays distinct from the brand accent
   (two-greens law), and no Google-era hue survives in the gradients.

   RE-POINTED TO CARTA 2026-08-15. These read LEDGER, and three of them were
   actively HOLDING THE SHELL BACK — asserting the warm surfaces and the brass
   gradient, so the re-skin could not land without them going red. That is the
   right behaviour from a pin and the wrong content; a test that fails when the
   system improves is doing its job badly only if nobody updates it. */
const { T } = await import('../../client/src/components/v6/desktop/atlasTokens');
const { M } = await import('../../client/src/components/v6/atlasmobile/mobileTokens');
is('the app primary slot is Deal Green', T.blue, CARTA.green);
is('the violet slot collapsed into the accent', T.violet, CARTA.green);
/* Was `[LEDGER.bone, LEDGER.rule, LEDGER.hair]` — the warm family. Two of those
   three are in the retired table (#DED8CC, #EAE5DC), so this assertion was
   PINNING the shell to Ledger: the token re-skin could not land without it
   going red. Carta's neutrals are cool and its canvas is white. */
is('app surfaces are the Carta neutrals',
  [T.surface, T.border, T.hair], [CARTA.bone, CARTA.hair, CARTA.hair]);
is('the verdict green did NOT adopt the brand accent (two-greens law)',
  T.green !== LEDGER.green && T.green.toLowerCase() === '#1f8a5b', true);
/* THE GRADIENT IS GONE, SO THE ASSERTION INVERTS AGAIN (2026-08-16).

   This has now been rewritten twice. It first asserted the sparkle gradient
   ran jade → green → BRASS. Carta collapsed it to one accent, so it asserted
   brass was ABSENT. Paul then asked for the real logo everywhere, `Sparkle`
   was deleted, and with it the `spark` token — the last gradient in the app's
   token set.

   The check that survives is the one that was always the point: **no gradient
   anywhere in T.** A gradient token is how a second hue creeps back in, and
   the mark is an <img> of the real logo now, which has nothing to recolour. */
is('the app token set carries no gradient at all',
  !Object.values(T).some(v => typeof v === 'string' && v.includes('gradient')), true);
is('…and `spark` specifically is gone rather than merely unused',
  (T as Record<string, unknown>).spark, undefined);
/* ── NO RETIRED HEX ANYWHERE IN THE APP (2026-08-16) ──────────────────────

   Paul: *"actually use the correct logo everywhere."* Chasing that turned up
   something bigger than a logo. **`#D4714E` — the terra-cotta wireframe
   accent, superseded on 2026-07-10 after two days — was live in 57 places
   across 17 files**, including `ChatDock` (the send-button fill, on every
   screen) and all four auth screens. The first thing you saw on signing in was
   painted in a palette that had been dead for five weeks.

   Nothing caught it because every existing check pointed at `house/tokens.ts`
   and the practice site. The APP's own source was never scanned, so a hex
   hard-coded into a Tailwind class or an inline style was invisible to the
   gate that exists to find exactly that.

   This scans the app. It is deliberately a whole-tree grep rather than a token
   check, because the defect was never in the tokens. */
{
  const RETIRED_HEX: Record<string, string> = {
    D4714E: 'terra-cotta wireframe accent (2026-07-08, superseded two days later)',
    FF385C: 'coral (retired by the Office-blue pivot, 2026-07-17)',
    E61E4D: 'coral hover',
    '185ABD': 'Office blue (retired by Ledger, 2026-07-17)',
    '16624C': 'Ledger Deal Green (re-valued by Aurora, 2026-07-31)',
    E8A62B: 'Ledger amber (retired by Carta, 2026-08-07)',
    F5C452: 'Ledger honey',
    D44A78: 'V3/V4 hot pink',
    '00D632': 'liquid-glass neon',
  };
  /* WALK AND STRIP, DO NOT GREP.

     The first cut grepped and then skipped any line whose first character was
     `*`, `//` or `/*`. It immediately flagged a line of THIS FILE'S OWN
     explanation in atlas.css — a `/* ... *\/` block whose continuation line
     starts with plain prose. That is the comment-vs-behaviour trap that has now
     been made five times in this repo, and the fix is the one already proven in
     engine-parity: strip comments from the SOURCE, then look. A line-prefix
     heuristic is not a comment parser. */
  const APP_DIRS = [
    'client/src/components', 'client/src/pages', 'client/src/hooks', 'client/src/lib',
  ];
  const stripComments = (src: string) =>
    src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

  const walk = (dir: string): string[] => {
    const out: string[] = [];
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) out.push(...walk(full));
      else if (/\.(tsx?|css)$/.test(e.name)) out.push(full);
    }
    return out;
  };

  const offenders: string[] = [];
  for (const dir of APP_DIRS) {
    const abs = path.join(ROOT, dir);
    if (!existsSync(abs)) continue;
    for (const file of walk(abs)) {
      const code = stripComments(readFileSync(file, 'utf8'));
      for (const [hex, why] of Object.entries(RETIRED_HEX)) {
        if (new RegExp(`#${hex}`, 'i').test(code)) {
          offenders.push(`${file.replace(ROOT + '/', '')}  #${hex} — ${why}`);
        }
      }
    }
  }
  is('no retired palette hex is live anywhere in the app', offenders, []);
}

is('the mobile active capsule is the accent tint', M.glassNav.activeBg, CARTA.greenTint);
is('the mobile frame is the Claude-app neutral (Paul-sampled)', M.frameBg, '#F9F9F9');
const ATLAS_CSS = readFileSync(path.join(ROOT, 'client/src/components/v6/desktop/atlas.css'), 'utf8');
is('the atlas var mirror moved with the tokens',
  ATLAS_CSS.includes('--at-blue: #0A7A58') && !ATLAS_CSS.toLowerCase().includes('#0b57d0'), true);

/* ── 9. no retired era survives in the app CODE (Phase 3 sweep, 2026-08-02).
   The Ramp neon, the Google blue, the Cash-App violet and the Material
   error red are dead in v6. Comments may name them as history (rt.ts
   documents what it replaced), so the scan strips comments first. */
const DEAD_APP = ['#2BFF77', '#10E060', '#CFFFE1', '#0A5C2E', '#00210F',
  '#0B57D0', '#5B53D6', '#8B7BD8', '#4F9ED9', '#B3261E'];
const V6DIR = path.join(ROOT, 'client/src/components/v6');
const v6Files = readdirSync(V6DIR, { recursive: true }) as string[];
const offenders: string[] = [];
for (const f of v6Files) {
  if (!/\.(ts|tsx|css)$/.test(f)) continue;
  const code = readFileSync(path.join(V6DIR, f), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
  const up = code.toUpperCase();
  for (const d of DEAD_APP) if (up.includes(d)) offenders.push(`${f}:${d}`);
}
is('no retired era hex survives in v6 code', offenders, []);

/* ── the app shell imports CARTA, not LEDGER (2026-08-15) ─────────────────
   The check above catches a retired HEX pasted into v6. It could never catch
   the shell importing `LEDGER` and reading values that happen to have survived
   the restyle — which is exactly what it was doing: 32 references across
   atlasTokens, mobileTokens, rt.ts and YuliaFab, of which only six lines
   touched anything retired (`rule`, `hair`, a brass gradient) plus five
   hand-mixed warm bone tints.

   That is the subtler half of the same problem the collateral builders had. A
   module reading `LEDGER.green` is correct TODAY and wrong the moment Carta
   moves a value Ledger keeps — and it reads, to anyone auditing, as a surface
   still on the old system. Source of a token is documentation.

   Comments are stripped: several of these files legitimately explain what they
   stopped doing, and a check that reads the explanation as the behaviour is a
   mistake this suite has now made three times in one day. */
{
  const ledgerInV6: string[] = [];
  for (const f of v6Files) {
    if (!/\.(ts|tsx)$/.test(f)) continue;
    const code = readFileSync(path.join(V6DIR, f), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1');
    if (/\bLEDGER\b/.test(code)) ledgerInV6.push(String(f));
  }
  is('the app shell reads CARTA, never LEDGER', ledgerInV6, []);

  /* The semantic warning/danger warms are a DELIBERATE exception and are
     documented as one in atlasTokens. Asserted so the exception stays visible:
     if it is ever removed, this fails and someone has to read the note before
     concluding the shell drifted. Carta's no-warm-colour rule governs the
     brand accent in collateral, where nothing has a warning state; an app that
     cannot say something is wrong has lost more than it gained. */
  const atlas = readFileSync(path.join(V6DIR, 'desktop/atlasTokens.ts'), 'utf8');
  is('the semantic warm exception is still documented, not silent',
    /SEMANTIC WARNING \/ DANGER/.test(atlas) && /deliberately KEPT under Carta/.test(atlas), true);
}

console.log(`\n${pass}/${total} passed`);
process.exit(pass === total ? 0 : 1);
