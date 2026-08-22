/**
 * design-check.mts — THE SURFACE PREFLIGHT. Run it before you render.
 *
 *   npx tsx $REPO/scripts/studio/design-check.mts <spec.deck.mts|spec.post.mts|<report>.md> [--media <dir>]
 *   npx tsx $REPO/scripts/studio/design-check.mts                    # bookend arithmetic only
 *
 * WHY THIS EXISTS (FORMATS.md §8, specified 2026-08-03, written 2026-08-11):
 * *"one build shipped with three trade pages missing their illustrations and a
 * cover CTA that was unreadable on the light bookend. Neither failure raised an
 * error. Paul caught both by eye."*
 *
 * That is the whole brief: THE FAILURES THAT DO NOT RAISE AN ERROR. Every
 * other checker in this practice reads the words — `audit.mts` traces figures,
 * `verify-spec.mts` binds a spec to its master, `voice-check.mts` reads the
 * copy. Nothing read the SURFACE, and the surface fails silently by
 * construction: a missing image renders as an empty panel, an `image:` on a
 * page kind with no slot is dropped without complaint, a square photo in a
 * tall slot is centre-cropped into nonsense, and a colour that only works on
 * the block goes to roughly 1.4:1 on bone without moving a single figure.
 *
 * SIX CHECKS. Each one is a failure this workspace has already shipped.
 *
 *   1 · ART RESOLVES   the builders' own resolution chain, replicated exactly,
 *                      so the answer is what the build will actually do.
 *   2 · SLOT GEOMETRY  the supplied file against the slot it lands in — the
 *                      centre crop and the effective resolution.
 *   3 · SILENT DROP    a key the builder does not read. FORMATS.md §4: an
 *                      `image:` on a page kind with no slot "is silently
 *                      discarded — the build succeeds, the render looks
 *                      finished, the picture is simply gone."
 *   4 · BOOKEND        WCAG arithmetic on both grounds, from the tokens. The
 *                      cover-CTA failure, and FORMATS.md §8's `.bk-lt` rule.
 *   5 · COVER BUDGET   the fixed cover box against the copy put in it.
 *   6 · FIT            the two hard ceilings FORMATS.md §1 measured: a bar
 *                      label over six glyphs clips, and a `numeral` page runs
 *                      off the right edge one glyph later.
 *
 * EXIT CODES, and the precedence matters more than the codes:
 *
 *   0  clean          every check ran and found nothing
 *   1  findings       at least one check found something
 *   2  COULD NOT CHECK  something was not checked. NEVER read a 2 as a pass.
 *
 * Precedence is deliberately `1 > 2 > 0`: a run with findings exits 1 even if
 * something else could not be checked, so the findings are what you act on;
 * but a run with NO findings and an unchecked area exits 2 rather than 0,
 * because "nothing found" and "nothing looked" must never share an exit code.
 * A clean audit on unverified research is this practice's canonical false
 * green light; the same rule applies to a checker that quietly skipped half
 * its job.
 *
 * WHAT IT CANNOT DO, said plainly so the check is not mistaken for the step it
 * supports: it never renders. It measures files, arithmetic and geometry. A
 * picture that resolves, fits its slot at full resolution and clears AA can
 * still be the wrong picture, and a cover that fits can still be ugly.
 * FORMATS.md §8's own words about its sibling apply here: "Render both
 * bookends and look at both."
 *
 * NO NEW DEPENDENCIES. Image dimensions come from python3 + Pillow via
 * `spawnSync`, which is `carta-guard.mts`'s technique and is already a
 * requirement of the preflight.
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
const TOKENS: any = await import(pathToFileURL(path.join(ROOT, 'house/tokens.ts')).href);
const { LEDGER, CARTA, REPORT } = TOKENS;
const { deckCss } = await import(pathToFileURL(path.join(ROOT, 'house/deck.ts')).href);

/* ── CLI ──────────────────────────────────────────────────────────────── */
const args = process.argv.slice(2);
const flag = (n: string) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const target = args.find(a => !a.startsWith('--') && a !== flag('--media'));
const mediaDir = flag('--media') ? path.resolve(flag('--media')!) : null;

/* ── the ledger of what this run found ────────────────────────────────────
   Findings carry a SCOPE. A spec finding is this build's problem and is fixed
   by editing the spec; a grammar finding is house-wide, will repeat on every
   spec until `house/deck.ts` changes, and is fixed by a commit to the engine.
   Printing them in one undifferentiated list is how a checker teaches people
   to skim it. */
type Finding = { check: string; where: string; msg: string; scope: 'spec' | 'grammar' };
const findings: Finding[] = [];
const notChecked: string[] = [];
const notes: string[] = [];
const fail = (check: string, where: string, msg: string, scope: 'spec' | 'grammar' = 'spec') =>
  findings.push({ check, where, msg, scope });
const cannot = (what: string) => notChecked.push(what);
const note = (s: string) => notes.push(s);
const head = (s: string) => console.log(`\n── ${s} ${'─'.repeat(Math.max(0, 62 - s.length))}`);
const line = (s: string) => console.log(`  ${s}`);

/* ── colour arithmetic ────────────────────────────────────────────────────
   WCAG 2.1 relative luminance and contrast. Pure arithmetic on the token
   hexes — this is the half of the bookend problem that needs no renderer,
   which is exactly why it went unchecked for so long: it looks like a
   judgement call and it is not. */
const hex2rgb = (h: string): [number, number, number] => {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const lum = ([r, g, b]: [number, number, number]) => {
  const f = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (fg: string, bg: string) => {
  const a = lum(hex2rgb(fg)), b = lum(hex2rgb(bg));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};
/** `rgba(r,g,b,a)` composited over a ground, so a translucent rule is measured
 *  as it actually prints rather than skipped. */
const flatten = (colour: string, ground: string): string | null => {
  const m = colour.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)\s*(?:[,/]\s*([\d.]+))?\s*\)/i);
  if (m) {
    const [gr, gg, gb] = hex2rgb(ground);
    const a = m[4] === undefined ? 1 : parseFloat(m[4]);
    const mix = (c: number, g: number) => Math.round(c * a + g * (1 - a));
    const v = [mix(+m[1], gr), mix(+m[2], gg), mix(+m[3], gb)];
    return '#' + v.map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
  }
  const h = colour.trim().match(/^#([0-9a-f]{6})$/i);
  return h ? '#' + h[1].toUpperCase() : null;
};
/** Every live token, hex → name, so a finding can say WHICH token failed
   rather than quoting a hex a reader then has to look up. Never invent a hex:
   this map is the only place colours enter this file. */
const TOKEN_NAME = new Map<string, string>();
for (const [set, obj] of [['LEDGER', LEDGER], ['CARTA', CARTA], ['REPORT', REPORT]] as const)
  for (const [k, v] of Object.entries(obj as Record<string, string>))
    if (/^#[0-9a-f]{6}$/i.test(v) && !TOKEN_NAME.has(v.toUpperCase())) TOKEN_NAME.set(v.toUpperCase(), `${set}.${k}`);
const name = (h: string) => TOKEN_NAME.get(h.toUpperCase()) ?? h;

/* ── text measurement ─────────────────────────────────────────────────────
   An ESTIMATE, and it is labelled as one wherever it reaches the page. There
   is no font metric available without a browser, so line counts come from
   per-character advance factors calibrated against the rendered house decks.
   The thresholds below carry a margin for that: this fires on a cover that
   overflows by a line, not on one that is merely full. FORMATS.md §3.2's
   "check page 1 of every render" is not replaced by this and says so. */
const ADVANCE: Array<[RegExp, number]> = [
  [/[ ]/, 0.26], [/[iljtfrI.,;:'!|()\[\]{}\-]/, 0.34], [/[mwMW@]/, 0.90],
  [/[A-Z]/, 0.68], [/[0-9$%]/, 0.56],
];
const charW = (c: string, mono: boolean) => {
  if (mono) return 0.60;
  for (const [re, w] of ADVANCE) if (re.test(c)) return w;
  return 0.52;
};
const textW = (s: string, size: number, mono = false) =>
  [...s].reduce((a, c) => a + charW(c, mono) * size, 0);
/** Greedy wrap — the same thing `text-wrap: balance` is optimising, counted
 *  rather than optimised. Balance changes where the breaks fall, not how many. */
const lineCount = (s: string, size: number, box: number, mono = false) => {
  if (!s) return 0;
  let lines = 1, w = 0;
  for (const word of s.split(/\s+/)) {
    const ww = textW(word + ' ', size, mono);
    if (w > 0 && w + ww > box) { lines++; w = ww; } else w += ww;
  }
  return lines;
};

/* ── image dimensions, carta-guard's way ──────────────────────────────────
   python3 + Pillow in one spawn for the whole set. No new node dependency,
   and it reads webp, which is what the founder photography is stored as. */
type Dim = { w: number; h: number } | { err: string };
function imageDims(files: string[]): Map<string, Dim> {
  const out = new Map<string, Dim>();
  if (!files.length) return out;
  const py = `
import sys, json
from PIL import Image
for f in sys.argv[1:]:
    try:
        im = Image.open(f)
        print(json.dumps({"f": f, "w": im.size[0], "h": im.size[1]}))
    except Exception as e:
        print(json.dumps({"f": f, "err": type(e).__name__ + ": " + str(e)}))
`;
  const r = spawnSync('python3', ['-c', py, ...files], { encoding: 'utf8', maxBuffer: 32 << 20 });
  if (r.error || r.status !== 0) {
    cannot(`image dimensions — python3 + Pillow unavailable (${r.error?.message ?? r.stderr?.trim() ?? 'exit ' + r.status}). Check 2 did not run.`);
    return out;
  }
  for (const l of r.stdout.split('\n')) {
    if (!l.trim()) continue;
    try { const o = JSON.parse(l); out.set(o.f, o.err ? { err: o.err } : { w: o.w, h: o.h }); } catch { /* ignore */ }
  }
  return out;
}

/* ── slots ────────────────────────────────────────────────────────────────
   Derived from the grammar the builder actually renders, then cross-checked
   against FORMATS.md §4's published table. A slot that has moved in the CSS
   and not in the rule file is itself a finding: the table is what the imagery
   brief asks Gemini for, so a drifted box means every future image is
   commissioned to the wrong shape. */
type Slot = { id: string; w: number; h: number; ask: string; from: string };
const cssRaw: string = deckCss('');
const ruleBlocks: Array<{ sel: string; body: string }> = [];
for (const m of cssRaw.matchAll(/([^{}]+)\{([^{}]*)\}/g))
  ruleBlocks.push({ sel: m[1].replace(/\/\*[\s\S]*?\*\//g, '').trim().replace(/\s+/g, ' '), body: m[2] });
const propOf = (sel: string, prop: string): string | null => {
  const b = ruleBlocks.find(r => r.sel === sel);
  if (!b) return null;
  const m = b.body.match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`, 'i'));
  return m ? m[1].trim() : null;
};
const pxOf = (sel: string, prop: string): number | null => {
  const v = propOf(sel, prop); const m = v && v.match(/(-?[\d.]+)px/); return m ? parseFloat(m[1]) : null;
};

/** FORMATS.md §4, transcribed. The script derives what it can and compares. */
const PUBLISHED: Record<string, { w: number; h: number; ask: string }> = {
  'carousel cover panel': { w: 476, h: 1102, ask: '9:16' },
  'carousel trade page': { w: 404, h: 604, ask: '3:4' },
  'one-pager photo column': { w: 470, h: 1350, ask: '9:16' },
  /* the report's two are published in inches; at the 96dpi the builder lays
     out in, 5.84 × 2.05in is 561 × 197 CSS px. build-report.mts rasterises the
     cover at deviceScaleFactor 2 (≈192dpi), the same doubling as the posts. */
  'report cover hero': { w: 561, h: 197, ask: '16:9' },
  'report accent band': { w: 1700, h: 520, ask: '16:9' },
};
function deriveSlots(): Record<string, Slot> {
  const s: Record<string, Slot> = {};
  /* the cover panel is an inset box, not a sized one: .cv-right is pinned
     left/top/right/bottom inside the 1080×1350 page. */
  const l = pxOf('.cv-right', 'left'), t = pxOf('.cv-right', 'top'),
        r = pxOf('.cv-right', 'right'), b = pxOf('.cv-right', 'bottom');
  if (l != null && t != null && r != null && b != null)
    s['carousel cover panel'] = { id: 'carousel cover panel', w: 1080 - l - r, h: 1350 - t - b, ask: '9:16', from: 'house/deck.ts .cv-right' };
  const tw = pxOf('.trade-img', 'width'), th = pxOf('.trade-img', 'height');
  if (tw != null && th != null)
    s['carousel trade page'] = { id: 'carousel trade page', w: tw, h: th, ask: '3:4', from: 'house/deck.ts .trade-img' };
  /* the one-pager's CSS is built inside its builder against the spec, so it
     cannot be imported. FORMATS.md §4 is the source for that one, stated. */
  s['one-pager photo column'] = { id: 'one-pager photo column', ...PUBLISHED['one-pager photo column'], from: 'FORMATS.md §4 (builder CSS is not importable)' };
  for (const k of ['report cover hero', 'report accent band'])
    s[k] = { id: k, ...PUBLISHED[k], from: 'FORMATS.md §4 (build-report.mts sizes these in inches)' };
  for (const [k, v] of Object.entries(s)) {
    const p = PUBLISHED[k];
    if (p && v.from.startsWith('house/') && (p.w !== v.w || p.h !== v.h))
      fail('slot table', k, `grammar renders ${v.w}×${v.h} (${v.from}); FORMATS.md §4 publishes ${p.w}×${p.h}. The table is what the imagery brief commissions to — one of the two is wrong.`);
  }
  return s;
}
const SLOTS = deriveSlots();

/* ── 4 · BOOKEND CONTRAST ────────────────────────────────────────────────
   FORMATS.md §8: "Any cover or closer rule coloured with a block-only token —
   mint, darkInk, darkSub — must have a matching `.bk-lt` override. Miss one
   and the light bookend renders that element at roughly 2.8:1 on bone."

   Implemented as arithmetic rather than as a list of token names, because a
   token name is a proxy for the thing that actually matters: what the colour
   measures on the other ground. Every rule in the deck grammar that paints
   ink or a rule is placed on the ground it lands on, measured there, and then
   measured again on the ground the OTHER bookend would give it.

   THE COMPLETENESS GUARD IS THE POINT. Every colouring rule in the grammar
   must be in exactly one bucket below. A selector this file has never heard
   of is reported as NOT CHECKED — so when the grammar grows a page kind, this
   check says it went blind instead of printing a clean line about the rules
   it still recognises. That is the difference between a guard and a habit. */
/* THESE READ CARTA, NOT LEDGER (2026-08-22). They were LEDGER.dark/.bone —
   the Aurora jade block and its bone — while house/deck.ts has rendered from
   CARTA since 2026-08-07. Every contrast number this file printed was measured
   against a ground the collateral had already stopped using, which is the
   quietest way for a guard to be confidently wrong. */
const GROUND_DARK = CARTA.dark;       // the field — the flat value is the worse case
const GROUND_LIGHT = CARTA.bone;      // the body pages and the light bookend

const ON_DARK = new Set([
  '.pg.dark', '.cv-hook', '.cv-sub', '.wn', '.wt', '.swipe', '.cv-rule',
  '.ct-head', '.ct-body', '.ct-name', '.ct-tag2', '.follow', '.ct-rule',
  '.pg.dark .kt.brass', '.pg.dark .tag.brasstag', '.pg.dark .vs', '.pg.dark .brassbar',
  '.pn',                                    // sits on .pfoot, whose background is the block
]);
const ON_LIGHT = new Set([
  '.pg.light', '.kt', '.numeral', '.stat-h', '.stat-b', '.src', '.tag.green',
  '.tag.brasstag', '.stmt-h', '.stmt-b', '.stmt-src', '.greenrule', '.brassbar',
  '.bar.ink .barnum', '.collab', '.collab.strong', '.vs', '.bar.green',
  '.trade-num', '.trade-h', '.trade-b', '.bl-rule',
]);
/** Grounds that are neither bookend nor bone. */
const ON_OTHER: Record<string, string> = { '.bar.green .barnum': CARTA.green };
/** Not evaluated, each with the reason. Printed every run — an exemption that
 *  is invisible is an exemption nobody can argue with. */
const EXEMPT: Record<string, string> = {
  '.ghost': 'the watermark page numeral, deliberately at 5% — it is not text and must not read as text',
  '.kt.brass': 'cover kicker base rule, always superseded by `.pg.dark .kt.brass` — never painted as written',
  '.glaze': 'a gradient veil over the block, not a foreground colour',
  '.cv-right': 'the image panel fill, covered by the photograph',
  '.pfoot': 'the footer band ground itself — measured through `.pn`',
  '.bar.ink': 'a 2px ink outline on bone, measured through `.bar.ink .barnum`',
  '.trade-img': 'the image panel fill, covered by the artwork',
  '.pg': 'the page box — no colour of its own',
};
/** The BOOKENDS proper — the cover and the closer. FORMATS.md §8's override
 *  rule is scoped to these two surfaces, and the scoping matters: `.pn` sits
 *  on a dark footer band on a LIGHT page, so it is block-only and needs no
 *  light-bookend counterpart, because it already has a block under it on
 *  every page it appears. */
const BOOKEND = new Set([
  '.pg.dark', '.cv-hook', '.cv-sub', '.cv-rule', '.wn', '.wt', '.swipe',
  '.ct-head', '.ct-body', '.ct-rule', '.ct-name', '.ct-tag2', '.follow',
  '.pg.dark .kt.brass', '.pg.dark .tag.brasstag', '.pg.dark .vs', '.pg.dark .brassbar',
]);
/** A DECLARED HOLDOUT, carta-guard's idiom, in the grammar's own source:
 *
 *      /* DESIGN-CHECK-HOLDOUT .swipe — <reason> *\/
 *
 *  It is reported on every run and does not fail the check. This exists so
 *  that a known, deliberate value is visible rather than silently tolerated —
 *  and so the decision to tolerate it stays Paul's rather than this script's.
 *  A guard that is always red is a guard that gets switched off; a guard that
 *  quietly forgives things is worse. */
const HOLDOUT = new Map<string, string>();
for (const m of cssRaw.matchAll(/DESIGN-CHECK-HOLDOUT\s+([^\n*]+)/g)) {
  /* the selector may itself contain spaces (`.pg.dark .kt.brass`), so the
     split is on the separator, not on the first whitespace */
  const [sel, ...why] = m[1].split(/\s+[—–:-]\s+/);
  HOLDOUT.set(sel.trim(), why.join(' - ').trim() || 'no reason given');
}

/** Font size and weight for a rule that only overrides colour. `.pg.dark .vs`
 *  carries no `font-size` — it inherits 52px from `.vs`, which decides whether
 *  WCAG reads it as large text (3:1) or normal text (4.5:1). Resolving it
 *  wrong is a fabricated finding in one direction and a miss in the other. */
function inherited(sel: string, body: string): { size: number; weight: number; from: string } {
  const own = parseFloat(body.match(/font-size\s*:\s*([\d.]+)px/i)?.[1] ?? '0');
  const ownW = parseInt(body.match(/font-weight\s*:\s*(\d+)/i)?.[1] ?? '0', 10);
  if (own) return { size: own, weight: ownW || 400, from: sel };
  /* walk the compound selector's own classes, longest first: `.pg.dark .vs`
     asks `.vs`; `.pg.dark .tag.brasstag` asks `.tag.brasstag` then `.tag`. */
  const last = sel.split(/\s+/).pop() ?? sel;
  const cands = [last, ...last.split('.').filter(Boolean).map(c => '.' + c)];
  for (const c of cands) {
    for (const r of ruleBlocks) {
      if (!r.sel.split(',').map(s => s.trim()).includes(c)) continue;
      const s = parseFloat(r.body.match(/font-size\s*:\s*([\d.]+)px/i)?.[1] ?? '0');
      if (s) return { size: s, weight: ownW || parseInt(r.body.match(/font-weight\s*:\s*(\d+)/i)?.[1] ?? '400', 10), from: c };
    }
  }
  return { size: 0, weight: ownW || 400, from: '' };
}

/** Is the light bookend implemented in this engine copy? FORMATS.md §1
 *  documents `--bookend dark|light|both`, default both. If the grammar has no
 *  light bookend, nothing renders these roles on bone and the override check
 *  is NOT APPLICABLE rather than passing — the distinction is stated in the
 *  output so it can never read as "checked and fine". */
const LIGHT_BOOKEND = /\.bk-lt/.test(cssRaw) ||
  (existsSync(path.join(ROOT, 'scripts/studio/build-deck.mts')) &&
   /--bookend/.test(readFileSync(path.join(ROOT, 'scripts/studio/build-deck.mts'), 'utf8')));

function checkBookends() {
  head('4 · bookend contrast — WCAG on both grounds, from the tokens');
  let evaluated = 0, unknown: string[] = [], overrideNeeded: string[] = [], held: string[] = [];
  for (const { sel, body } of ruleBlocks) {
    for (const one of sel.split(',').map(s => s.trim()).filter(Boolean)) {
      if (EXEMPT[one]) continue;
      const colour = (body.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i)?.[1]
                   ?? body.match(/(?:^|;)\s*background\s*:\s*(#[0-9a-fA-F]{6}|rgba?\([^)]*\))/i)?.[1])?.trim();
      if (!colour) continue;
      /* `.bk-lt <anything>` is the light bookend by definition — bucket it
         without being told, or the check goes blind on exactly the engine it
         was written for, and reports that blindness as NOT CHECKED noise. */
      const ground = one.startsWith('.bk-lt') ? GROUND_LIGHT
        : ON_DARK.has(one) ? GROUND_DARK : ON_LIGHT.has(one) ? GROUND_LIGHT : ON_OTHER[one] ?? null;
      if (!ground) { unknown.push(one); continue; }
      const fg = flatten(colour, ground);
      if (!fg) continue;                       // a texture/gradient — nothing to measure
      /* self-grounding rule: `.pg.light { background: bone; color: ink }` */
      const ownBg = body.match(/(?:^|;)\s*background\s*:\s*(#[0-9a-fA-F]{6})/i)?.[1];
      const bg = (ownBg && /color\s*:/.test(body)) ? ownBg : ground;
      const isGraphic = !/color\s*:/.test(body);
      const { size, weight, from } = inherited(one, body);
      /* WCAG 2.1: large text is ≥24px, or ≥18.66px at ≥700. Graphics and UI
         components take the 3:1 floor. A rule whose size cannot be resolved at
         all is treated as normal text — the stricter reading, on purpose. */
      const large = size >= 24 || (size >= 18.66 && weight >= 700);
      const floor = isGraphic || large ? 3.0 : 4.5;
      const what = isGraphic ? 'a graphic element' : size ? `${size}px${from && from !== one ? ` (inherited from ${from})` : ''} text` : 'text of unresolved size';
      const now = contrast(fg, bg);
      const other = contrast(fg, bg === GROUND_DARK ? GROUND_LIGHT : GROUND_DARK);
      evaluated++;
      if (now < floor) {
        if (HOLDOUT.has(one)) held.push(`${one.padEnd(24)} ${now.toFixed(2)}:1 — ${HOLDOUT.get(one)}`);
        else fail('bookend contrast', `house/deck.ts ${one}`,
          `${name(fg)} on ${name(bg)} is ${now.toFixed(2)}:1 — below ${floor.toFixed(1)}:1 for ${what}.`, 'grammar');
      }
      /* the §8 check: a BOOKEND colour that cannot survive the other bookend */
      if (BOOKEND.has(one) && other < floor) {
        overrideNeeded.push(`${one.padEnd(24)} ${name(fg).padEnd(16)} ${other.toFixed(2)}:1 on bone (needs ${floor.toFixed(1)}:1)`);
        if (LIGHT_BOOKEND && !new RegExp(`\\.bk-lt[^,{]*${one.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(cssRaw))
          fail('light bookend', `house/deck.ts ${one}`,
            `${name(fg)} measures ${other.toFixed(2)}:1 on ${name(GROUND_LIGHT)} and has no \`.bk-lt\` override — FORMATS.md §8. On the light bookend this element is invisible, and nothing in a diff or a screenshot shows it.`, 'grammar');
      }
    }
  }
  line(`${evaluated} colouring rule(s) measured on their own ground`);
  if (held.length) {
    console.log(`\n  DECLARED HOLDOUTS — marked DESIGN-CHECK-HOLDOUT in house/deck.ts, still owed a pass:`);
    held.forEach(h => line('  ' + h));
  }
  if (overrideNeeded.length) {
    console.log(`\n  BLOCK-ONLY — these are correct on the block and fail on bone:`);
    overrideNeeded.forEach(o => line('  ' + o));
    if (!LIGHT_BOOKEND) {
      line('');
      line('This engine copy renders no light bookend: house/deck.ts carries no `.bk-lt`');
      line('and build-deck.mts takes no `--bookend`. So the above is NOT APPLICABLE here —');
      line('it becomes a finding on an engine that renders one. NOT a pass.');
      note('light-bookend override check is n/a in this engine copy — no light bookend in the grammar');
    }
  }
  if (unknown.length) {
    cannot(`${unknown.length} colouring rule(s) the ground map has never seen: ${[...new Set(unknown)].join(' ')} — the grammar moved; check 4 is partly blind.`);
  }
  if (Object.keys(EXEMPT).length) {
    console.log(`\n  NOT EVALUATED, and why:`);
    for (const [k, v] of Object.entries(EXEMPT)) line(`  ${k.padEnd(16)} ${v}`);
  }
}

/* ── spec loading ────────────────────────────────────────────────────────── */
type Kind = 'deck' | 'post' | 'report';
type Loaded = { kind: Kind; spec: any; file: string };
async function load(file: string): Promise<Loaded | null> {
  if (!existsSync(file)) { cannot(`target does not exist: ${file}`); return null; }
  if (/\.md$/i.test(file)) return { kind: 'report', spec: readFileSync(file, 'utf8'), file };
  let mod: any;
  try { mod = await import(pathToFileURL(file).href); }
  catch (e: any) { cannot(`could not import ${file}: ${e?.message ?? e}`); return null; }
  if (mod.deck) return { kind: 'deck', spec: mod.deck, file };
  if (mod.post) return { kind: 'post', spec: mod.post, file };
  cannot(`${file} exports neither \`deck\` nor \`post\` — nothing to check`);
  return null;
}

/* ── 1 · ART RESOLVES ─────────────────────────────────────────────────────
   The builders' chain, replicated line for line from build-deck.mts and
   build-onepager.mts. Replicated rather than approximated on purpose: a
   preflight that resolves an image the builder will not find is worse than no
   preflight, because it certifies the exact failure it exists to catch. The
   one-pager chain has an extra step (the repo's client/public), and that
   difference is real — a bare `founder-walking.webp` resolves on a one-pager
   and does not on a deck. */
function tries(ref: string, specFile: string, kind: Kind): string[] {
  const t: (string | null)[] = [
    path.isAbsolute(ref) ? ref : null,
    mediaDir ? path.join(mediaDir, ref) : null,
    path.resolve('media', ref),
    path.resolve('assets', ref),
    path.join(path.dirname(specFile), ref),
    kind === 'post' ? path.join(ROOT, 'client/public', ref) : null,
    path.resolve(ref),
  ];
  return t.filter(Boolean) as string[];
}
type Req = { ref: string; where: string; slot: string; pos?: string };
function requests(l: Loaded): Req[] {
  const out: Req[] = [];
  if (l.kind === 'deck') {
    const d = l.spec;
    if (d.cover?.image) out.push({ ref: d.cover.image, where: 'cover', slot: 'carousel cover panel', pos: d.cover.imagePos });
    (d.pages ?? []).forEach((p: any, i: number) => {
      if (p.image) out.push({ ref: p.image, where: `page ${i + 2} · ${p.kind}${p.name ? ` · ${p.name}` : ''}`, slot: p.kind === 'trade' ? 'carousel trade page' : '(no slot)', pos: p.imagePos });
    });
    if (d.headshot) out.push({ ref: d.headshot, where: 'headshot', slot: '(disc, cropped round)', pos: undefined });
  } else if (l.kind === 'post') {
    const p = l.spec;
    for (const k of ['image', 'imageDark', 'imageLight'])
      if (p[k]) out.push({ ref: p[k], where: k, slot: 'one-pager photo column', pos: p.imagePos });
  } else {
    /* the report cover block — build-report.mts resolves these against the
       .md's own folder, its media/, its SIBLING ../media/ and client/public,
       and NOT against ./assets. Different chain, stated in CLAUDE.md. */
    for (const m of (l.spec as string).matchAll(/^\s*(image|headshot|accent)\s*:\s*(.+)$/gim)) {
      const v = m[2].trim();
      const ref = m[1] === 'accent' ? (v.split('|')[1] ?? '').trim() : v;
      if (ref) out.push({ ref, where: m[1] === 'accent' ? `accent · ${(v.split('|')[0] ?? '').trim()}` : m[1], slot: m[1] === 'accent' ? 'report accent band' : m[1] === 'image' ? 'report cover hero' : '(disc, cropped round)' });
    }
  }
  return out;
}
function reportTries(ref: string, mdFile: string): string[] {
  const d = path.dirname(mdFile);
  return [path.isAbsolute(ref) ? ref : null, mediaDir ? path.join(mediaDir, ref) : null,
    path.join(d, ref), path.join(d, 'media', ref), path.join(d, '..', 'media', ref),
    path.join(ROOT, 'client/public', ref)].filter(Boolean) as string[];
}

function checkArt(l: Loaded, reqs: Req[]): Map<string, string> {
  head('1 · art resolves — the builder’s own chain');
  const hits = new Map<string, string>();
  if (!reqs.length) { line('the spec asks for no art at all'); return hits; }
  for (const r of reqs) {
    const chain = l.kind === 'report' ? reportTries(r.ref, l.file) : tries(r.ref, l.file, l.kind);
    const hit = chain.find(t => { try { return existsSync(t) && statSync(t).isFile(); } catch { return false; } });
    if (hit) { hits.set(r.ref, hit); line(`ok    ${r.where.padEnd(34)} ${r.ref}`); }
    else {
      line(`MISS  ${r.where.padEnd(34)} ${r.ref}`);
      fail('art resolves', r.where,
        `\`${r.ref}\` is not on any search path. That page renders WITHOUT art and the build still says ✓.\n` +
        [...new Set(chain)].map(t => `        looked: ${t}`).join('\n'));
    }
  }
  return hits;
}

/* ── 2 · SLOT GEOMETRY ───────────────────────────────────────────────────
   Every slot is `object-fit: cover`: the image is scaled to fill and the
   overflow is cropped from the CENTRE. FORMATS.md §4: "A square image in a
   tall slot loses over half its width. That is why images don't fit."

   Thresholds are set off the house's own published asks so the check does not
   cry wolf. The commissioned 9:16 into the 470×1350 one-pager column already
   loses 38% of its height — that is the correct, intended case. So a finding
   starts at half the frame gone, which is where FORMATS.md draws it too. */
function checkGeometry(reqs: Req[], hits: Map<string, string>) {
  head('2 · slot geometry — the centre crop, and the resolution');
  const files = [...new Set([...hits.values()])];
  if (!files.length) {
    line(reqs.length ? 'nothing to measure — none of the requested art resolved (see check 1)' : 'nothing to measure — the spec asks for no art');
    if (reqs.length) cannot('slot geometry for every requested image — none of them resolved, so none could be measured');
    return;
  }
  const dims = imageDims(files);
  if (!dims.size) { line('not checked — see the NOT CHECKED block'); return; }
  for (const r of reqs) {
    const f = hits.get(r.ref); if (!f) continue;
    const d = dims.get(f);
    if (!d) { cannot(`dimensions of ${f}`); continue; }
    if ('err' in d) { cannot(`dimensions of ${f} (${d.err})`); continue; }
    const slot = SLOTS[r.slot];
    if (!slot) { line(`--    ${r.where.padEnd(34)} ${d.w}×${d.h}  (${r.slot} — no published box)`); continue; }
    const sAR = slot.w / slot.h, iAR = d.w / d.h;
    const lostAxis = iAR > sAR ? 'width' : 'height';
    const lost = iAR > sAR ? 1 - sAR / iAR : 1 - iAR / sAR;
    /* effective resolution: cover-fit scale, against the 2× device pixels the
       carousel actually rasterises at (build-deck.mts sets deviceScaleFactor 2) */
    const scale = Math.max(slot.w / d.w, slot.h / d.h);
    const eff = 1 / scale;                              // source px per CSS px
    const tag = lost >= 0.50 ? 'CROP' : eff < 1 ? 'SOFT' : 'ok  ';
    line(`${tag}  ${r.where.padEnd(34)} ${d.w}×${d.h} → ${slot.w}×${slot.h}  ` +
         `${(lost * 100).toFixed(0)}% of the ${lostAxis} cropped · ${eff.toFixed(2)}× source px`);
    if (lost >= 0.50)
      fail('slot geometry', r.where,
        `${d.w}×${d.h} (${iAR.toFixed(2)}) into the ${slot.id} at ${slot.w}×${slot.h} (${sAR.toFixed(2)}): the centre crop discards ${(lost * 100).toFixed(0)}% of the ${lostAxis}. Ask Gemini for ${slot.ask}${r.pos ? '' : ', or steer it with `imagePos`'}.`);
    else if (lost >= 0.40)
      note(`${r.where}: ${(lost * 100).toFixed(0)}% of the ${lostAxis} is cropped — within the house ask (${slot.ask}) but worth an eye on the render.`);
    if (eff < 1)
      fail('slot geometry', r.where,
        `${d.w}×${d.h} is smaller than the ${slot.w}×${slot.h} slot — it is upscaled ${(1 / eff).toFixed(2)}× and prints soft. Both post builders rasterise at deviceScaleFactor 2, so this slot wants ${slot.w * 2}×${slot.h * 2}.`);
    else if (eff < 2)
      note(`${r.where}: ${eff.toFixed(2)}× source pixels against a 2× raster — acceptable, not crisp.`);
  }
}

/* ── 3 · SILENT DROP ─────────────────────────────────────────────────────
   FORMATS.md §4 calls this "the most common failure in the whole system", and
   §2 records the same failure inside the rule file itself: a `sub:` on a
   one-pager was documented for four days, accepted by every spec, and dropped
   by the builder on every render.

   The key sets are the builders' own interfaces. A key outside them is not
   an error anywhere in the pipeline — it simply never reaches a page. */
const DECK_KEYS: Record<string, string[]> = {
  numeral: ['kind', 'numeral', 'unit', 'head', 'body', 'source'],
  statement: ['kind', 'tag', 'tagColor', 'head', 'body', 'source'],
  diagram: ['kind', 'tag', 'head', 'body', 'source', 'bars', 'connector'],
  trade: ['kind', 'name', 'image', 'imagePos', 'numeral', 'unit', 'head', 'body', 'source'],
};
const DECK_TOP = ['slug', 'kicker', 'cover', 'pages', 'closer', 'headshot', 'caption'];
const COVER_KEYS = ['hook', 'sub', 'image', 'imagePos'];
const POST_KEYS = ['slug', 'kicker', 'numeral', 'numeralLabel', 'hook', 'body', 'invite', 'cta',
  'byline', 'image', 'imagePos', 'caption', 'variants'];
const SLOTLESS = 'FORMATS.md §4: `trade` is the only body page kind with an image slot. An `image:` on any other kind is silently discarded — the build succeeds and the picture is simply gone.';

function checkSilentDrop(l: Loaded) {
  head('3 · silent drop — keys the builder never reads');
  let n = 0;
  const drop = (where: string, key: string, why: string) => { n++; fail('silent drop', where, `\`${key}:\` ${why}`); line(`DROP  ${where.padEnd(34)} ${key}`); };
  if (l.kind === 'deck') {
    const d = l.spec;
    for (const k of Object.keys(d)) if (!DECK_TOP.includes(k)) drop('spec root', k, 'is not a field build-deck.mts reads. It never reaches a page.');
    for (const k of Object.keys(d.cover ?? {})) if (!COVER_KEYS.includes(k)) drop('cover', k, `is not a cover field in this engine copy (${COVER_KEYS.join(', ')}). It renders as nothing.`);
    (d.pages ?? []).forEach((p: any, i: number) => {
      const known = DECK_KEYS[p.kind];
      const where = `page ${i + 2} · ${p.kind}`;
      if (!known) { fail('silent drop', where, `\`kind: '${p.kind}'\` is not one of the four page kinds — build-deck.mts renders NO page for it and the page count silently shrinks.`); n++; line(`DROP  ${where.padEnd(34)} kind=${p.kind}`); return; }
      for (const k of Object.keys(p)) {
        if (known.includes(k)) continue;
        if (k === 'image' || k === 'imagePos') drop(where, k, SLOTLESS);
        else drop(where, k, `is not a \`${p.kind}\` field (${known.join(', ')}).`);
      }
    });
  } else if (l.kind === 'post') {
    /* FORMATS.md §2 documents per-variant art (`imageDark` / `imageLight` /
       `imagePosDark` / `imagePosLight`). This engine copy's `Post` interface
       does not carry them. That is rule-file/engine drift, not author error,
       and the finding has to say which — the spec is right and the engine is
       behind, so the fix is a different commit in a different repo. */
    const DOCUMENTED_NOT_BUILT = ['imageDark', 'imageLight', 'imagePosDark', 'imagePosLight'];
    for (const k of Object.keys(l.spec)) {
      if (POST_KEYS.includes(k)) continue;
      if (k === 'sub') drop('post', k, 'is the documented one — FORMATS.md §2: the field never existed on the builder\'s `Post` interface. The supporting line goes in `body`.');
      else if (DOCUMENTED_NOT_BUILT.includes(k)) drop('post', k, `is documented in FORMATS.md §2 (per-variant art) but is NOT on this engine copy's \`Post\` interface — this builder drops it. The rule file and the engine disagree; check which one is behind before changing the spec.`);
      else drop('post', k, `is not a field build-onepager.mts reads (${POST_KEYS.join(', ')}).`);
    }
  } else {
    const cfg = (l.spec as string).match(/<!--\s*cover([\s\S]*?)-->/i);
    if (!cfg) { line('no cover block — nothing to drop'); return; }
    const KNOWN = ['byline', 'role', 'headshot', 'image', 'imagePos', 'footer', 'eyebrow', 'accent', 'stat'];
    for (const m of cfg[1].matchAll(/^\s*([A-Za-z_]+)\s*:/gm))
      if (!KNOWN.includes(m[1])) drop('cover block', m[1], 'is not a key build-report.mts reads. FORMATS.md §3.1: "Any other key is silently discarded."');
  }
  if (!n) line('clean — every key the spec sets is a key the builder reads');
}

/* ── 5 · COVER BUDGET ────────────────────────────────────────────────────
   Two different failures under one name, and they fail in opposite
   directions, which is why both are here:

   · the REPORT cover is a flowed box — overflow pushes the byline and the
     headshot onto page 2 and the cover "just looks like it has a hole in it"
     (CLAUDE.md). FORMATS.md §3.2 carries the mechanical budget AND the rule
     that supersedes it: a cover carries no stat band and no numbered cards.
   · the CAROUSEL cover is a fixed 1080×1350 with `overflow: hidden` — it does
     not push anything anywhere, it CLIPS. Same silence, opposite mechanism. */
function checkCoverBudget(l: Loaded) {
  head('5 · cover budget');
  if (l.kind === 'deck') {
    const c = l.spec.cover ?? {};
    const padL = pxOf('.cv-left', 'padding') ?? 66;
    const colW = pxOf('.cv-left', 'width') ?? 544;
    /* .cv-left padding is `66px 50px 40px 66px` — left and right off the box */
    const pad = (propOf('.cv-left', 'padding') ?? '66px 50px 40px 66px').match(/[\d.]+/g)?.map(Number) ?? [66, 50, 40, 66];
    const box = colW - (pad[3] ?? padL) - (pad[1] ?? 50);
    const hookSize = pxOf('.cv-hook', 'font-size') ?? 52;
    const hookLh = parseFloat(propOf('.cv-hook', 'line-height') ?? '1.08');
    const subSize = pxOf('.cv-sub', 'font-size') ?? 22;
    const subLh = parseFloat(propOf('.cv-sub', 'line-height') ?? '1.5');
    const hookLines = lineCount(c.hook ?? '', hookSize, box);
    const subLines = lineCount(c.sub ?? '', subSize, box);
    /* the copy column: page height less the foot band, less top/bottom padding
       and the kicker row the flex column also has to carry */
    const footH = pxOf('.cv-left', 'bottom') ?? 128;
    const avail = 1350 - footH - (pad[0] ?? 66) - (pad[2] ?? 40) - 34 /* kicker row */ - 24 /* its gap */;
    const used = hookLines * hookSize * hookLh + 62 /* .cv-rule box: 6 + 30 + 26 */ + subLines * subSize * subLh;
    line(`hook ≈ ${hookLines} line(s) at ${hookSize}px in a ${box}px column · sub ≈ ${subLines} line(s)`);
    line(`copy column ≈ ${Math.round(used)}px of ${avail}px  (estimate — the page CLIPS, it does not reflow)`);
    if (used > avail)
      fail('cover budget', 'deck cover', `the copy column needs ≈${Math.round(used)}px and the box is ${avail}px. \`.pg\` is \`overflow: hidden\`, so the overflow is CLIPPED with no error — the hook loses its last line.`);
    else if (used > avail * 0.88)
      note(`the deck cover is at ≈${Math.round(100 * used / avail)}% of its copy column — within a line of clipping. Look at page 1.`);
    if (c.image && !c.imagePos) note('the cover image has no `imagePos`; the crop defaults to `50% 45%`. FORMATS.md §4: steer it.');
  } else if (l.kind === 'post') {
    /* the one-pager's box is the builder's own CSS and is not importable; the
       measured constants below are FORMATS.md §2's published type scale */
    const box = (l.spec.image ? 610 : 1080) - 60 - 60;
    const hookLines = lineCount(l.spec.hook ?? '', 45, box);
    line(`hook ≈ ${hookLines} line(s) at 45px in a ${box}px column (FORMATS.md §2 type scale)`);
    if (hookLines > 6)
      fail('cover budget', 'one-pager hook', `the hook estimates at ${hookLines} lines at 45px. The card is fixed 1080×1350 with \`overflow: hidden\` — the copy below it is pushed out of the card silently.`);
  } else {
    const md = l.spec as string;
    const cfg = md.match(/<!--\s*cover([\s\S]*?)-->/i)?.[1] ?? '';
    const stats = [...cfg.matchAll(/^\s*stat\s*:/gim)].length;
    const hero = /^\s*image\s*:\s*\S/im.test(cfg);
    const coverMd = md.split(/^---\s*$/m)[0].replace(/<!--[\s\S]*?-->/, '');
    const title = coverMd.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? '';
    const cards = [...coverMd.matchAll(/^\s*\d+\.\s+/gm)].length;
    /* .cover h1 is 26pt in a 6.1in box → px at 96dpi */
    const titleLines = lineCount(title, 26 * 96 / 72, 6.1 * 96);
    const statRows = Math.ceil(stats / 3);
    const allowed = 4 - Math.max(0, titleLines - 1) - Math.max(0, statRows - 1);
    line(`title ≈ ${titleLines} line(s) · hero ${hero ? 'yes' : 'no'} · ${stats} stat card(s) in ${statRows} row(s) · ${cards} numbered card(s)`);
    line(`mechanical budget: ${allowed} numbered card(s) affordable`);
    if (cards > allowed)
      fail('cover budget', 'report cover', `${cards} numbered card(s) against a budget of ${allowed}. Overflow is silent: the byline and the headshot slide onto page 2 and the cover looks like it has a hole in it.`);
    /* the rule that supersedes the arithmetic */
    if (stats || cards)
      fail('cover budget', 'report cover', `FORMATS.md §3.2 is binding and supersedes the budget: a cover carries eyebrow, title, rule, ONE subtitle line, one image and the byline. Not ${[stats ? `${stats} stat card(s)` : '', cards ? `${cards} numbered card(s)` : ''].filter(Boolean).join(' or ')}. Findings belong in \`## EXECUTIVE SUMMARY\` on page 2.`);
    if (!hero) note('no cover `image:` — build-report.mts renders the `.nohero` cover, which centres the copy. Deliberate or not, look at page 1.');
  }
}

/* ── 6 · FIT ─────────────────────────────────────────────────────────────
   FORMATS.md §1, measured 2026-08-03: "A bar label longer than six glyphs
   overflows its bar. Bars are a fixed 168px wide and the label has no fitting
   logic — `$8.12B` fits, `$14.06B` clips its final character, and nothing
   errors. The `numeral` page has the same ceiling one glyph higher: at 290px,
   `$14.06B` runs off the right edge of the page."

   "Rounding is not the escape — a rounded figure is a different figure." So
   the finding names the two legitimate moves and neither of them is rounding. */
function checkFit(l: Loaded) {
  if (l.kind !== 'deck') return;
  head('6 · fit — the two ceilings FORMATS.md §1 measured');
  let n = 0;
  (l.spec.pages ?? []).forEach((p: any, i: number) => {
    const where = `page ${i + 2} · ${p.kind}`;
    if (p.kind === 'diagram') for (const b of p.bars ?? []) {
      if ([...String(b.label)].length > 6) {
        n++; line(`CLIP  ${where.padEnd(34)} bar label \`${b.label}\``);
        fail('fit', where, `bar label \`${b.label}\` is ${[...String(b.label)].length} glyphs; the bar is ${pxOf('.bar', 'width') ?? 168}px and clips at six. A chart that mis-states its own figure is worse than no chart — move the figure into a \`statement\` head, or pick a comparison with shorter labels. Not rounding.`);
      }
    }
    if ((p.kind === 'numeral' || p.kind === 'trade') && p.numeral) {
      const s = String(p.numeral) + (p.unit ?? '');
      const size = p.kind === 'numeral' ? (pxOf('.numeral', 'font-size') ?? 290) : (pxOf('.trade-num', 'font-size') ?? 100);
      const box = 1080 - 2 * 88;
      const w = textW(s, size);
      if (w > box) { n++; line(`OVER  ${where.padEnd(34)} \`${s}\` ≈${Math.round(w)}px in a ${box}px column`);
        fail('fit', where, `\`${s}\` at ${size}px estimates ≈${Math.round(w)}px against a ${box}px column — it runs off the right edge. Move it into a \`statement\` head (58px display serif has room). Not rounding.`); }
    }
  });
  if (!n) console.log('  clean — every bar label and display numeral fits its box');
}

/* ── run ─────────────────────────────────────────────────────────────────── */
console.log(`design-check · ${target ?? '(no target — bookend arithmetic only)'}`);
if (mediaDir) console.log(`media: ${mediaDir}`);
if (!existsSync(path.resolve('assets')) && !mediaDir)
  note('no ./assets in the working directory and no --media: run this from the workspace root, the way the builders are run, or the resolution chain here is not the one the build will use.');

let loaded: Loaded | null = null;
if (target) {
  loaded = await load(path.resolve(target));
  if (loaded) {
    const reqs = requests(loaded);
    const hits = checkArt(loaded, reqs);
    checkGeometry(reqs, hits);
    checkSilentDrop(loaded);
  }
}
checkBookends();
if (loaded) { checkCoverBudget(loaded); checkFit(loaded); }
else cannot(`the spec checks (1, 2, 3, 5, 6) — ${target ? 'the target could not be read' : 'no target given'}`);

/* ── the report ──────────────────────────────────────────────────────────── */
const spec = findings.filter(f => f.scope === 'spec');
const grammar = findings.filter(f => f.scope === 'grammar');
const printAll = (list: Finding[]) => list.forEach((f, i) => {
  console.log(`  ${String(i + 1).padStart(2)} · [${f.check}] ${f.where}`);
  f.msg.split('\n').forEach(l2 => console.log(`       ${l2}`));
});
head(`findings — the spec${target ? ` (${path.basename(target)})` : ''}`);
if (spec.length) printAll(spec); else console.log('  none');
if (grammar.length) {
  head('findings — the house grammar (house/deck.ts)');
  printAll(grammar);
  line('');
  line('These are house-wide: they do not come from this spec and they will repeat on');
  line('every run until the grammar changes. Fix them in the engine, or mark one with');
  line('`/* DESIGN-CHECK-HOLDOUT <selector> — why */` in house/deck.ts, which reports it');
  line('on every run without failing the check.');
}

if (notes.length) { head('notes — not findings, worth an eye'); notes.forEach(n => line(`· ${n}`)); }

if (notChecked.length) {
  head('NOT CHECKED');
  notChecked.forEach(n => line(`· ${n}`));
  line('');
  line('A NOT CHECKED line is not a pass. Exit 2 says the same thing.');
}

const code = findings.length ? 1 : notChecked.length ? 2 : 0;
console.log('\n' + (code === 0
  ? '✓ design-check: clean. Every check ran. Now render both bookends and look at them.'
  : code === 1
    ? `✗ design-check: ${spec.length} spec finding(s), ${grammar.length} grammar finding(s)${notChecked.length ? ` · ${notChecked.length} area(s) NOT CHECKED` : ''}.`
    : `? design-check: no findings, but ${notChecked.length} area(s) COULD NOT BE CHECKED. This is not a pass.`));
process.exit(code);
