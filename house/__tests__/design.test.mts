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
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { LEDGER, REPORT } from '../tokens.js';

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
const TOKENS: Record<string, string> = { ...LEDGER, ...REPORT };

/* ── 1. the retired systems ───────────────────────────────────────────────
   These are the hexes a drifting session reaches for. They belong in the dead
   list and nowhere else in the file — a retired hex appearing in a live
   section would read as sanctioned. */

const DEAD = [
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

const TOKEN_HEXES = new Set(Object.values(TOKENS).map(up));

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

const undocumented = Object.entries(TOKENS)
  .filter(([, hex]) => !paletteHexes.includes(up(hex)))
  .map(([name]) => name);
is('every house token is in the §4 palette tables', undocumented, []);

/* ── 3. the website actually uses these ───────────────────────────────────
   §3 of DESIGN.md claims the collateral looks like the site because it IS the
   site's values. That is a checkable claim, so check it. If a site retheme
   moves one of these, this fails and the mapping table gets updated with it —
   rather than the document quietly describing a site that no longer exists. */

const SITE_MAP: [string, string, string][] = [
  ['--pd-ink', LEDGER.ink, 'ink'],
  ['--pd-body', LEDGER.slate, 'slate body'],
  ['--pd-tert', LEDGER.muted, 'muted'],
  ['--pd-hair', LEDGER.hair, 'hairline'],
  ['--pd-coral', LEDGER.green, 'Deal Green (historical var name)'],
  ['--pd-cta', LEDGER.green, 'CTA green'],
  ['--pd-cta-hover', LEDGER.greenHover, 'green hover'],
  ['--pd-brass', LEDGER.brass, 'brass'],
  ['--pd-dark-bg', LEDGER.dark, 'boardroom dark'],
];
for (const [varName, hex, label] of SITE_MAP) {
  const m = SITE_CSS.match(new RegExp(`${varName}:\\s*(#[0-9A-Fa-f]{6})`));
  is(`site ${varName} is ${label} ${hex}`, m ? up(m[1]) : null, up(hex));
}

/* The bone canvas is set as a literal background on .pd, not as a custom
   property, so it is matched on its own. */
is('site canvas is bone', SITE_CSS.includes(`background: ${LEDGER.bone}`), true);

/* The research page holds parity with the report PDF, which is the strongest
   form of the claim in §3 — same markdown, same reading ink. */
is('research page uses the report body ink', REPORT_CSS.includes(REPORT.body), true);

/* ── 4. the laws that make the document work ──────────────────────────────
   Each of these is a rule that cost a rebuild when it was broken. They are
   pinned so an edit cannot quietly drop one. */

const MUST_SAY: [string, string][] = [
  ['tokens.ts is named as the source of truth', 'house/tokens.ts'],
  ['the display weight is stated', '545'],
  ['the variable-name trap is called out', '`--pd-coral` is green'],
  ['trade is named as the only carousel image page', 'only body page with an image slot'],
  ['the bookend law is stated', 'exactly two dark pages'],
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

/* ── 5. it travels ────────────────────────────────────────────────────────
   The document only solves anything if it reaches the workspace. */
const INIT = readFileSync(path.join(ROOT, 'scripts/studio/init-workspace.mts'), 'utf8');
is('init-workspace copies DESIGN.md into the workspace',
  INIT.includes(`law('content/studio/DESIGN.md', 'DESIGN.md')`), true);
const WS = readFileSync(path.join(ROOT, 'content/studio/workspace-CLAUDE.md'), 'utf8');
is('the workspace CLAUDE.md tells a session to read it', WS.includes('DESIGN.md'), true);
is('FORMATS.md cross-references it',
  readFileSync(path.join(ROOT, 'content/studio/FORMATS.md'), 'utf8').includes('DESIGN.md'), true);

console.log(`\n${pass}/${total} passed`);
process.exit(pass === total ? 0 : 1);
