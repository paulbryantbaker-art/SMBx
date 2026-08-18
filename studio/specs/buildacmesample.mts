/* ============================================================================
   ⚠ THIS BUILDER IS LEDGER. DO NOT RUN IT. (2026-08-08)

   CARTA-HOLDOUT — declared, tracked by carta-guard.mts, still owed a pass.

   Carta is canon. This file hand-rolls its own CSS with retired hexes written
   as literals, so it bypasses house/tokens.ts entirely — which is the thing
   DESIGN.md and CLAUDE.md both name as the single largest drift tell, and the
   reason a 52-page report once shipped in the wrong typeface.

   It is also outside the palette guard: house/palette-guard.ts is called by the
   three house builders, and this is not one of them. Running it produces a
   Ledger document with nothing to stop it.

   Its companion, SAMPLE-VALUATION-SPEC.md, carries the full conversion note.
   Both need one pass together: the spec rewritten against DESIGN.md §4-§5, and
   this file either rebuilt on build-report.mts or deleted.
   ========================================================================== */

/**
 * Sample valuation report — "Acme Mechanical Group" (illustrative company),
 * $35.2M commercial MEP, Dallas, national footprint. SIXTEEN Letter pages,
 * house-marketing bookends, for Paul to post as proof of what owners receive.
 *
 * LAWS: the COMPANY is fictional and says so on the cover and the closer;
 * every MARKET figure (the 5–11x band, the service-mix spread, the driver
 * thresholds) is real and cited to the practice's published assessments.
 * Range, never a point estimate. Pure local Chromium — no model, no key.
 *
 * ── READ THIS BEFORE YOU EDIT ────────────────────────────────────────────
 * DESIGN.md §10, drift tell #1, verbatim: "You wrote HTML or CSS. The single
 * largest tell. House collateral comes out of the three builders. A 52-page
 * report once shipped in the wrong typeface because a session could not find
 * the template and wrote its own stylesheet to 'match the style'."
 *
 * THIS FILE IS THAT DRIFT TELL. It is ~600 lines of bespoke CSS approximating
 * a system that already exists in `house/tokens.ts` and three builders. That is
 * why the same corrections keep coming back: nothing here is inherited, so
 * every session re-derives the house from memory and gets a different subset
 * wrong. `design-check.mts`, `voice-check.mts` and `verify-spec.mts` all take a
 * `.deck.mts` / `.post.mts` spec — none of them can see this file.
 *
 * The durable fix is to move this artifact onto `build-report.mts`, whose cover
 * (DESIGN.md §6.3) already carries logo, eyebrow, title, rule, hero image, a
 * three-card stat band and the byline. Until that happens, PREFLIGHT below is
 * the stopgap: it makes the palette laws executable so they fail the build
 * instead of reaching Paul.
 *
 * ── PALETTE LAWS THIS FILE HAS BROKEN BEFORE (DESIGN.md §4) ──────────────
 *   honey #F5C452  "the same jobs as amber, on the jade block: the bar under a
 *                  signature numeral, the cover eyebrow, part-rules, ONE mono
 *                  tag. Never body text, never a button, never a fill.
 *                  Large-text-only — a numeral, a rule, a tag — NEVER A CAPTION."
 *                  → stat-card labels were honey at 8px. Banned twice over.
 *   mint  #A8F0CE  "rules on the block, the headshot ring, SWIPE and FOLLOW."
 *                  → the hook rule, the headshot ring and the closing mono line
 *                  are MINT, not honey.
 *   statLabel #BFE3D2 exists for "cover stat-card labels". Use the token.
 *   "On the block, hierarchy comes from size and weight, not colour — the text
 *    is ivory, the secondary is #DED8CC, and that is the whole ladder."
 *                  → no opacity ladder. Anywhere. It is not in the system.
 *
 * ── BLOCK TEXT IS #FFFFFF HERE, AND THAT IS A DELIBERATE DIVERGENCE ──────
 * Paul, 2026-08-04: "All the white text should be bright white." DESIGN.md §4
 * says block reading text is ivory #F2FBF6, and the cover measured exactly
 * that — off-white, green-tinted (G 251 vs R 242). BLOCK_TEXT below overrides
 * it for this artifact only. Making it house-wide is a two-line edit to
 * `LEDGER.ivory` and DESIGN.md §4; until that is made, this constant is drift
 * with a note on it rather than drift without one.
 *
 * Usage:
 *   SMBX_ROOT=/home/user/SMBx npx tsx buildacmesample.mts --out <dir>
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.env.SMBX_ROOT || '/home/user/SMBx';
const arg = (n: string) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : undefined; };
const OUT = arg('--out') || path.join(ROOT, 'out');
fs.mkdirSync(OUT, { recursive: true });

const imp = (rel: string) => import(pathToFileURL(path.join(ROOT, rel)).href);
const { fontFaceCss } = await imp('server/services/fontEmbeds.ts');
const { newRenderPage } = await imp('server/services/premiumPdfRenderer.ts');
const { LEDGER, REPORT, TYPE, DISPLAY_OPSZ, rgba, blockBackground } = await imp('house/tokens.ts');

const b64 = (p: string, mime: string) => `data:${mime};base64,${fs.readFileSync(p).toString('base64')}`;
const LOGO_W = b64(path.join(ROOT, 'client/public/logo-green-x-dark.png'), 'image/png');
const LOGO_G = b64(path.join(ROOT, 'client/public/logo-green-x.png'), 'image/png');
const TEXTURE = b64(path.join(ROOT, 'client/public/textures/blackbleed.webp'), 'image/webp');
const HEAD = b64(path.join(ROOT, 'client/public/founder-portrait.jpg'), 'image/jpeg');

const L = LEDGER as Record<string, string>, R = REPORT as Record<string, string>;
const INK = L.ink, GREEN = L.green, BRASS = L.brass, HONEY = L.honey, MINT = L.mint;
const BONE = L.bone, HAIR = L.hair, MUTED = L.muted, RULE = L.rule;
const BODY = R.body, IVORY_SUB = R.ivorySub, STAT_LABEL = R.statLabel, TINT = R.tableHead;
const DISPLAY = TYPE.display, SANS = TYPE.sans, MONO = TYPE.mono;

/** Block reading text. See the divergence note in the header. */
const BLOCK_TEXT = '#FFFFFF';
/**
 * Block secondary — ALSO white. Paul, 2026-08-04: "the bottom line is still a
 * darker white and not bright white like ALL white text should be."
 *
 * That collapses DESIGN.md §4's two-rung block ladder (ivory, then #DED8CC) to
 * one rung. It is a divergence in the colours and, read carefully, a tightening
 * of the principle: §4's own sentence is "on the block, hierarchy comes from
 * SIZE AND WEIGHT, not colour." One white, sized and weighted, is that rule
 * with nothing left over. The pale-mint tokens (ivory-sub, stat-label) go with
 * it — a dimmed near-white reads as dirty rather than as hierarchy.
 *
 * Honey and mint are untouched. They are not white text; they are the accent
 * and the jewelry, and they still carry every job DESIGN.md §4 gives them.
 */
const BLOCK_SUB = '#FFFFFF';
const BLOCK_LABEL = '#FFFFFF';

const BLOCK = blockBackground(TEXTURE, '760px 460px at 62% -8%');
const GLASS_EDGE = rgba('#FFFFFF', 0.26);
const GLASS_FILL = rgba('#FFFFFF', 0.05);

const SAMPLE_NOTE =
  'Acme Mechanical Group is an illustrative company created for this sample — its figures are hypothetical. ' +
  'Every market figure in this report is real, published, and cited.';
const DISCLAIMER =
  'Market context from published transaction data applied to company-provided figures — not an appraisal or ' +
  'opinion of value. Actual transactions are priced in diligence.';
const PAGES_TOTAL = 16;
const crumb = (n: number) => `<div class="crumb"><img src="${LOGO_G}"><div class="t">Sample owner valuation · ${n} of ${PAGES_TOTAL}</div></div>`;
const foot = `<div class="foot"><span>SMBX.AI · SAMPLE — ILLUSTRATIVE COMPANY</span><span>FREE FULL VALUATION</span></div>`;

const DOC_HEAD = `<!doctype html><html><head><meta charset="utf-8"><style>
${fontFaceCss()}
* { margin:0; padding:0; box-sizing:border-box; }
html,body { background:#fff; }
body { font-family:${SANS}; color:${INK}; -webkit-font-smoothing:antialiased; }
.pg { width:8.5in; height:11in; position:relative; overflow:hidden; page-break-after:always; background:${BONE}; }
.pg:last-child { page-break-after:auto; }

/* ══ DARK BOOKENDS — the house block, via blockBackground() ══════════════ */
.dark { color:${BLOCK_TEXT}; background:${BLOCK}; }
.dark .inner { position:relative; height:100%; display:flex; flex-direction:column; padding:0.5in 0.58in 0.42in; }
.ghost { position:absolute; overflow:hidden; opacity:0.085; pointer-events:none; }
.ghost img { position:absolute; height:100%; width:auto; max-width:none; }

.topbar { display:flex; align-items:center; justify-content:space-between; }
.topbar img { height:23px; width:auto; }
.kicker { font-family:${MONO}; font-size:10.5px; font-weight:500; letter-spacing:0.2em; color:${HONEY}; text-transform:uppercase; }

.cvrow { display:flex; gap:30px; flex:1; margin-top:34px; min-height:0; }
.cvcol { flex:1; display:flex; flex-direction:column; min-width:0; position:relative; z-index:2; }

/* signature figure in honey OVER A HONEY BAR — DESIGN.md §6.1 */
.numeral { font-family:${DISPLAY}; font-variation-settings:'opsz' ${DISPLAY_OPSZ}; font-weight:660; font-size:73px; line-height:0.92; letter-spacing:-0.015em;
           color:${HONEY}; font-variant-numeric:tabular-nums; white-space:nowrap; }
.numbar { width:132px; height:8px; background:${HONEY}; border-radius:99px; margin-top:14px; }
.numlabel { margin-top:12px; font-family:${MONO}; font-size:9.5px; font-weight:500; letter-spacing:0.15em;
            line-height:1.75; color:${BLOCK_LABEL}; text-transform:uppercase; }
/* the hook rule is MINT, 70×6, fully rounded — DESIGN.md §6.1 */
.rule { width:70px; height:6px; background:${MINT}; border-radius:99px; margin:24px 0 0; }
.h1 { font-family:${DISPLAY}; font-variation-settings:'opsz' ${DISPLAY_OPSZ}; font-weight:545; font-size:40px; line-height:1.07; letter-spacing:-0.012em; margin-top:22px; text-wrap:balance; color:${BLOCK_TEXT}; }
.h1 .turn { color:${HONEY}; }
.tag { margin-top:18px; font-size:13.5px; line-height:1.62; color:${BLOCK_TEXT}; }
.tag.catch { margin-top:13px; }
/* emphasis on the block is WEIGHT, not colour — DESIGN.md §4 */
.tag.catch b { color:${BLOCK_TEXT}; font-weight:700; }
.statcap { margin-top:30px; font-family:${MONO}; font-size:8px; font-weight:500; letter-spacing:0.13em;
           line-height:1.7; color:${BLOCK_SUB}; text-transform:uppercase; }

.stats { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-top:12px; }
.stat { border:1px solid ${GLASS_EDGE}; background:${GLASS_FILL}; border-radius:13px; padding:15px 13px 13px; }
.stat .n { font-family:${DISPLAY}; font-variation-settings:'opsz' ${DISPLAY_OPSZ}; font-weight:600; font-size:20px; line-height:1.12; color:${BLOCK_TEXT}; font-variant-numeric:tabular-nums; }
/* stat-card labels use REPORT.statLabel — the token that exists for this job.
   They were honey at 8px, which DESIGN.md §4 bans twice: honey is never a
   caption, and never text below display size. */
.stat .l { margin-top:8px; font-family:${MONO}; font-size:8px; font-weight:500; letter-spacing:0.12em;
           color:${BLOCK_LABEL}; text-transform:uppercase; line-height:1.6; }

.panel { width:3.15in; border-radius:24px; overflow:hidden; background:${BONE}; flex-shrink:0;
         border:1px solid ${GLASS_EDGE}; box-shadow:0 18px 44px ${rgba('#000000', 0.20)}; }
.panel img { width:100%; height:100%; object-fit:cover; object-position:50% 50%; display:block; }

.cv-note { margin-top:22px; font-size:9px; line-height:1.6; color:${BLOCK_SUB}; position:relative; z-index:2; }
.footbar { margin-top:16px; padding-top:15px; border-top:1px solid ${GLASS_EDGE};
           display:flex; align-items:center; gap:18px; position:relative; z-index:2; }
.footbar .fl { height:19px; width:auto; }
.footbar .nm { font-size:12.5px; font-weight:700; color:${BLOCK_TEXT}; line-height:1.35; }
.footbar .rl { font-size:10.5px; color:${BLOCK_SUB}; line-height:1.35; }
/* the right-edge mono slot is MINT — the SWIPE/FOLLOW slot, DESIGN.md §4 */
.footbar .rt { margin-left:auto; font-family:${MONO}; font-size:9.5px; font-weight:500; letter-spacing:0.16em; color:${MINT}; }

/* ══ CLOSER ══════════════════════════════════════════════════════════════ */
.close-inner { align-items:center; text-align:center; justify-content:center; padding:0.66in 0.7in 0.42in; }
.close-h { font-family:${DISPLAY}; font-variation-settings:'opsz' ${DISPLAY_OPSZ}; font-weight:545; font-size:38px; line-height:1.08; letter-spacing:-0.012em; margin-top:18px; max-width:6.4in; color:${BLOCK_TEXT}; }
.close-h .turn { color:${HONEY}; }
.close-rule { width:70px; height:6px; background:${MINT}; border-radius:99px; margin:24px auto 0; }
.close-b { margin-top:24px; font-size:13.5px; line-height:1.7; color:${BLOCK_TEXT}; max-width:5.6in; }
.close-b + .close-b { margin-top:14px; }
.steps { margin-top:28px; display:grid; grid-template-columns:repeat(3,1fr); gap:12px; width:100%; max-width:6.4in; text-align:left; }
.step { border:1px solid ${GLASS_EDGE}; background:${GLASS_FILL}; border-radius:13px; padding:15px 14px; }
.step .n { font-family:${DISPLAY}; font-variation-settings:'opsz' ${DISPLAY_OPSZ}; font-weight:660; font-size:19px; color:${HONEY}; line-height:1; }
.step .b { margin-top:8px; font-size:10.5px; line-height:1.6; color:${BLOCK_TEXT}; }
.close-url { margin-top:30px; font-family:${MONO}; font-size:17px; font-weight:500; letter-spacing:0.16em; color:${BLOCK_TEXT}; }
.close-url span { color:${MINT}; }
.close-by { margin-top:30px; display:flex; align-items:center; gap:12px; }
/* the headshot ring is MINT — DESIGN.md §6.1 */
.close-by img { width:52px; height:52px; border-radius:50%; object-fit:cover; border:2px solid ${MINT}; }
.close-by .nm { font-size:13.5px; font-weight:700; color:${BLOCK_TEXT}; line-height:1.35; text-align:left; }
.close-by .rl { font-size:11px; color:${BLOCK_SUB}; line-height:1.35; text-align:left; }
.close-logo { height:24px; width:auto; margin-top:26px; }
.credits { margin-top:14px; font-family:${MONO}; font-size:9px; font-weight:500; letter-spacing:0.15em; color:${MINT}; }
.close-note { margin-top:26px; font-size:8.5px; line-height:1.6; color:${BLOCK_SUB}; max-width:6.4in; }

/* ══ RENDERER-PROOF BOOKENDS ═════════════════════════════════════════════ */
.pg.flat { padding:0; background:none; }
.pg.flat img { width:100%; height:100%; display:block; }
/* ══ LIGHT BODY PAGES ══════════════════════════════════════════════════════
   RENDERER-PROOF DISCIPLINE: solid hex only on body pages. No rgba(), no
   gradient, no box-shadow, no opacity. Those are what put transparency groups
   and shadings into the PDF, and the body pages are the ones that stay vector.
   The bookends can carry anything because they go in as flat bitmaps. */
.body-pg { padding:0.66in 0.8in 0.8in; display:flex; flex-direction:column; }
.crumb { display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid ${INK}; padding-bottom:9px; }
.crumb img { height:19px; width:auto; }
.crumb .t { font-family:${MONO}; font-size:9px; letter-spacing:0.15em; color:${MUTED}; text-transform:uppercase; }
h2 { font-family:${DISPLAY}; font-variation-settings:'opsz' ${DISPLAY_OPSZ}; font-weight:560; font-size:21px; margin:24px 0 9px; letter-spacing:-0.006em; }
h2:first-of-type { margin-top:26px; }
h3 { font-family:${SANS}; font-weight:700; font-size:12px; margin:16px 0 5px; color:${INK}; }
p, li { font-size:12.2px; line-height:1.62; color:${BODY}; }
p + p { margin-top:9px; }
.lead { font-size:13.2px; line-height:1.62; }
.mini { font-family:${MONO}; font-size:8.5px; font-weight:500; letter-spacing:0.15em; color:${GREEN}; text-transform:uppercase; margin-top:20px; }

.facts { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin:13px 0 2px; }
.facts.three { grid-template-columns:repeat(3,1fr); }
.fact { border:1px solid ${HAIR}; border-radius:10px; background:#fff; padding:12px 12px 10px; }
.fact .n { font-family:${DISPLAY}; font-variation-settings:'opsz' ${DISPLAY_OPSZ}; font-size:18px; color:${GREEN}; font-variant-numeric:tabular-nums; }
.fact .l { margin-top:5px; font-family:${MONO}; font-size:8px; letter-spacing:0.11em; color:${MUTED}; text-transform:uppercase; line-height:1.45; }

table { width:100%; border-collapse:collapse; margin-top:9px; }
td, th { border-top:1px solid ${HAIR}; padding:5.5px 6px; font-size:11.2px; vertical-align:top; text-align:left; }
th { font-family:${MONO}; font-size:8px; letter-spacing:0.11em; color:${MUTED}; text-transform:uppercase; font-weight:500; border-top:none; padding-bottom:5px; }
.bl b { color:${INK}; }
.bl .nt { display:block; font-size:9.4px; color:${MUTED}; margin-top:1px; line-height:1.38; }
.bn { text-align:right; font-variant-numeric:tabular-nums; font-weight:600; width:108px; white-space:nowrap; }
tr.sub td { border-top:1.5px solid ${INK}; font-weight:700; }
tr.tot td { border-top:2.5px solid ${GREEN}; font-weight:800; color:${INK}; font-size:12.2px; padding-top:9px; }
tr.tot .bn { color:${GREEN}; }
tr.head td { border-top:none; }

.range { display:flex; gap:14px; margin:14px 0 4px; }
.rr { flex:1; border:1px solid ${HAIR}; border-radius:12px; padding:16px 18px 13px; background:#fff; }
.rr .n { font-family:${DISPLAY}; font-variation-settings:'opsz' ${DISPLAY_OPSZ}; font-size:25px; color:${GREEN}; font-variant-numeric:tabular-nums; white-space:nowrap; }
.rr .l { font-family:${MONO}; font-size:8.5px; letter-spacing:0.12em; color:${MUTED}; text-transform:uppercase; margin-top:7px; line-height:1.5; }
.rr.hero { border-left:3px solid ${BRASS}; }
.src { font-size:9px; color:${MUTED}; margin-top:9px; line-height:1.55; }
.dl { font-weight:600; width:112px; } .ds { width:88px; font-weight:700; font-size:10.2px; } .dn { color:${BODY}; font-size:10.8px; }
.disc { margin-top:auto; border:1px solid ${HAIR}; border-left:3px solid ${BRASS}; background:#fff; padding:10px 13px; font-size:9.6px; color:${BODY}; line-height:1.5; }
.foot { position:absolute; left:0.8in; right:0.8in; bottom:0.3in; display:flex; justify-content:space-between; font-family:${MONO}; font-size:8px; letter-spacing:0.08em; color:${MUTED}; }

/* two-column body */
.two { display:grid; grid-template-columns:1fr 1fr; gap:26px; margin-top:4px; }
.two.wide { grid-template-columns:1.25fr 1fr; }
/* page density modifier — for a page whose copy is all load-bearing and which
   runs a little long. Never use it to cram; the overflow guard is the arbiter. */
.dense h2 { margin:16px 0 7px; font-size:20px; }
.dense p, .dense li { font-size:11.8px; line-height:1.56; }
.dense table { margin-top:7px; }

/* tinted panel — SOLID fill, never a tint over the page */
.box { background:${TINT}; border:1px solid ${HAIR}; border-radius:12px; padding:12px 15px; margin-top:10px; }
.box .bt { font-family:${SANS}; font-weight:700; font-size:11.5px; color:${INK}; margin-bottom:5px; }
.box p, .box li { font-size:11px; line-height:1.58; }
.box.brass { border-left:3px solid ${BRASS}; }
.box.green { border-left:3px solid ${GREEN}; }

/* contents */
.toc { margin-top:16px; }
.toc .row { display:flex; align-items:baseline; gap:10px; border-bottom:1px solid ${HAIR}; padding:7px 0; }
.toc .row .nm { font-size:12.2px; font-weight:600; color:${INK}; }
.toc .row .ds2 { flex:1; border-bottom:1px dotted ${RULE}; transform:translateY(-3px); }
.toc .row .pn { font-family:${MONO}; font-size:10.5px; color:${GREEN}; font-weight:600; }
.toc .row .sub { display:block; font-size:10px; font-weight:400; color:${MUTED}; margin-top:2px; line-height:1.4; }

/* proportional bars — widths are the ratio of the figures, per FORMATS */
.bars { margin-top:14px; }
.brow { margin-bottom:10px; }
.brow .bl2 { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:5px; }
.brow .bn2 { font-family:${DISPLAY}; font-variation-settings:'opsz' ${DISPLAY_OPSZ}; font-size:18px; color:${INK}; font-variant-numeric:tabular-nums; }
.brow .bk { font-family:${MONO}; font-size:8.5px; letter-spacing:0.11em; color:${MUTED}; text-transform:uppercase; }
.brow .bar { height:18px; border-radius:4px; }
.brow .bar.now { background:${GREEN}; }
.brow .bar.then { background:${BRASS}; }
.brow .cap { font-size:9.6px; color:${MUTED}; margin-top:4px; line-height:1.45; }

/* waterfall */
.wf td { font-size:11.2px; }
.wf .lbl { font-weight:600; }
.wf .lbl .nt { display:block; font-size:9.6px; color:${MUTED}; font-weight:400; margin-top:2px; line-height:1.45; }
.wf .a, .wf .b { text-align:right; font-variant-numeric:tabular-nums; width:104px; white-space:nowrap; }
.wf tr.sub2 td { border-top:1.5px solid ${INK}; font-weight:700; }
.wf tr.fin td { border-top:2.5px solid ${GREEN}; font-weight:800; color:${GREEN}; padding-top:9px; }

/* buyer / structure stacks */
.stack { margin-top:11px; }
.st { border:1px solid ${HAIR}; border-radius:10px; padding:10px 12px; margin-bottom:7px; background:#fff; }
.st .sh { display:flex; justify-content:space-between; align-items:baseline; gap:10px; }
.st .sn { font-weight:700; font-size:11.8px; color:${INK}; }
.st .sv { font-family:${MONO}; font-size:9.5px; color:${GREEN}; font-weight:600; white-space:nowrap; }
.st .sb { font-size:10.4px; line-height:1.5; color:${BODY}; margin-top:3px; }

/* timeline */
.tl { margin-top:12px; }
.tl .ti { display:flex; gap:13px; padding:9px 0; border-top:1px solid ${HAIR}; }
.tl .tw { font-family:${MONO}; font-size:9px; letter-spacing:0.1em; color:${GREEN}; text-transform:uppercase; width:96px; flex-shrink:0; padding-top:2px; font-weight:600; }
.tl .tb { font-size:11.2px; line-height:1.55; color:${BODY}; }
.tl .tb b { color:${INK}; }
</style></head><body>`;

const P1 = `
<div class="pg dark">
  <div class="ghost" style="left:-40px; bottom:1.05in; width:186px; height:248px;"><img src="${LOGO_W}" style="height:248px; left:-496px; top:0;"></div>
  <div class="inner">
    <div class="topbar">
      <img src="${LOGO_W}">
      <div class="kicker">Sample report · what every owner receives</div>
    </div>
    <div class="cvrow">
      <div class="cvcol">
        <div class="numeral">$37–51M</div>
        <div class="numbar"></div>
        <div class="numlabel">Where the market clears<br>8–11x adjusted EBITDA</div>
        <div class="rule"></div>
        <div class="h1">Free Full Business Valuation<br><span class="turn">You Can Bank On</span></div>
        <div class="tag">Not a guess with a handful of data points — a full walkthrough for your business.</div>
        <div class="tag catch"><b>What's the catch?</b> Someday, we may have a buyer that is looking for you.</div>
        <div class="statcap">Acme Mechanical Group, LLC · Dallas, Texas<br>Commercial mechanical, HVAC &amp; plumbing · TTM June 2026</div>
        <div class="stats">
          <div class="stat"><div class="n">$35.2M</div><div class="l">Revenue · 38% service</div></div>
          <div class="stat"><div class="n">$4.64M</div><div class="l">Adjusted EBITDA · 13.2%</div></div>
          <div class="stat"><div class="n">Upper third</div><div class="l">Readiness read</div></div>
        </div>
      </div>
      <div class="panel"><img src="${HEAD}"></div>
    </div>
    <div class="cv-note">${SAMPLE_NOTE}</div>
    <div class="footbar">
      <img class="fl" src="${LOGO_W}">
      <div><div class="nm">Paul Baker</div><div class="rl">Buy-side corporate development</div></div>
      <div class="rt">August 2026</div>
    </div>
  </div>
</div>`;

const P2 = `
<div class="pg body-pg">
  ${crumb(2)}
  <div class="two wide">
    <div>
      <h2>What's in here</h2>
      <p>Sixteen pages, in the order a buyer would work through them: what the business is, what it really earns, what that earns in the market, and what an owner would actually walk away with.</p>
      <div class="toc">
        <div class="row"><div><div class="nm">Executive summary<span class="sub">The answer, up front</span></div></div><div class="ds2"></div><div class="pn">03</div></div>
        <div class="row"><div><div class="nm">The company<span class="sub">Profile, mix, backlog, bonding</span></div></div><div class="ds2"></div><div class="pn">04</div></div>
        <div class="row"><div><div class="nm">Earnings, normalized<span class="sub">The add-back walk, line by line</span></div></div><div class="ds2"></div><div class="pn">05</div></div>
        <div class="row"><div><div class="nm">Three years<span class="sub">Trend in revenue, mix and margin</span></div></div><div class="ds2"></div><div class="pn">06</div></div>
        <div class="row"><div><div class="nm">What buyers are paying<span class="sub">The published band, applied</span></div></div><div class="ds2"></div><div class="pn">07</div></div>
        <div class="row"><div><div class="nm">Where this business sits<span class="sub">The readiness drivers buyers price</span></div></div><div class="ds2"></div><div class="pn">08</div></div>
        <div class="row"><div><div class="nm">The numbers a buyer runs<span class="sub">The ratios computed before the first call</span></div></div><div class="ds2"></div><div class="pn">09</div></div>
        <div class="row"><div><div class="nm">What moves the number<span class="sub">The same business, twenty-four months on</span></div></div><div class="ds2"></div><div class="pn">10</div></div>
        <div class="row"><div><div class="nm">What the owner walks away with<span class="sub">Enterprise value down to cash at close</span></div></div><div class="ds2"></div><div class="pn">11</div></div>
        <div class="row"><div><div class="nm">What an offer looks like<span class="sub">Structure, escrow, the working-capital peg</span></div></div><div class="ds2"></div><div class="pn">12</div></div>
        <div class="row"><div><div class="nm">Who buys a business like this<span class="sub">Four buyer types, four different prices</span></div></div><div class="ds2"></div><div class="pn">13</div></div>
        <div class="row"><div><div class="nm">What diligence will test<span class="sub">The quality-of-earnings rebuild, previewed</span></div></div><div class="ds2"></div><div class="pn">14</div></div>
        <div class="row"><div><div class="nm">What happens next<span class="sub">The sequence, and what to do first</span></div></div><div class="ds2"></div><div class="pn">15</div></div>
      </div>
    </div>
    <div>
      <h2>How we get to a range</h2>
      <p>Three approaches are used to value a private company. This report leans on the first, checks against the second, and names the third where it applies.</p>
      <div class="box green">
        <div class="bt">Market approach — what this report runs on</div>
        <p>What businesses like this one actually changed hands for, expressed as a multiple of normalized earnings. It is the approach buyers themselves use, which is why it predicts an outcome rather than describing a theory.</p>
      </div>
      <div class="box">
        <div class="bt">Income approach — the cross-check</div>
        <p>Discounting future cash flow to today. Useful as a sanity check on whether the multiple the market pays is consistent with what the business can actually service in debt. It moves with assumptions a buyer has not made yet, so it does not set the range.</p>
      </div>
      <div class="box">
        <div class="bt">Asset approach — named, not used</div>
        <p>The net value of what the business owns. It sets a floor for a business that is not earning, and it is the wrong tool for one that is. It is why the real estate on page 11 is treated separately and never folded into the operating range.</p>
      </div>
      <h2>Why a range and never one number</h2>
      <p>A single figure implies a precision that does not exist before diligence. Two identical earnings streams price turns apart on recurring revenue, concentration, and whether the books survive a rebuild. The honest output is a band with the reasons attached — pages 7 through 10.</p>
      <div class="disc"><b>How to read this:</b> ${DISCLAIMER}</div>
    </div>
  </div>
  ${foot}
</div>`;

const P3 = `
<div class="pg body-pg">
  ${crumb(3)}
  <h2>Executive summary</h2>
  <p class="lead">Acme Mechanical Group runs $35.2M of revenue with a 38% contracted service book, and earns $4.64M once the books are normalized the way an acquirer's accountants will normalize them. Against the published band for commercial mechanical contractors, that clears at <b>$37.1M to $51.0M</b> — the upper tier, not the middle.</p>
  <div class="range">
    <div class="rr"><div class="n">$23.2M – $51.0M</div><div class="l">Full published band · 5.0x–11.0x</div></div>
    <div class="rr hero"><div class="n">$37.1M – $51.0M</div><div class="l">Where the market clears · 8.0x–11.0x with a real service book</div></div>
  </div>
  <div class="two">
    <div>
      <div class="mini">What carries it</div>
      <p><b>The service book.</b> At 38% contracted service and maintenance, this business sits above the ~30% mark where buyers stop pricing a contractor and start pricing an annuity. That single fact is the difference between the 5–6x tier and the 8–11x tier — roughly $14M of enterprise value on these earnings.</p>
      <div class="mini">What caps it</div>
      <p><b>Project weighting and owner dependence.</b> 62% of revenue is still project work, and the owner still holds the key program relationships. Neither is fatal. Both get priced.</p>
    </div>
    <div>
      <div class="mini">What moves it</div>
      <p>Three changes — service mix past 45%, a named president, and the rollout program held under 15% of revenue — take the same business to <b>$53.3M – $61.7M</b> inside twenty-four months. The arithmetic is on page 10.</p>
      <div class="mini">What the owner keeps</div>
      <p>After retiring $5.2M of funded debt and paying transaction costs, the range delivers roughly <b>$30.4M to $43.8M</b> in gross proceeds, of which $26.7M to $38.7M lands at close and the balance releases from escrow. The waterfall is on page 11. The building is a separate asset and is not in these figures.</p>
    </div>
  </div>
  <h2>Readiness read: upper third of the band</h2>
  <p>Scored on the drivers buyers actually price — recurring revenue, management depth, customer concentration, record quality and revenue mix — this profile reads in the upper third. Two drivers are strengths, two are watch items, and one should be fixed before going to market. Page 8 sets out each one and what it is worth.</p>
  <div class="box brass">
    <div class="bt">The one thing to take from this page</div>
    <p>The gap between the bottom of the published band and the top is not a matter of negotiation. It is a matter of mix. Every point of revenue moved from project work to contracted service moves this business toward the top of a range that is already $28M wide.</p>
  </div>
  ${foot}
</div>`;

const P4 = `
<div class="pg body-pg">
  ${crumb(4)}
  <h2>The company</h2>
  <p>Founded 2004. 178 employees running commercial mechanical, HVAC piping, plumbing and controls from a Dallas headquarters and fabrication shop, with rollout and program work delivered in 22 states — national grocery and retail programs, healthcare, and light industrial. Revenue splits <b>$13.4M service &amp; maintenance (38%)</b> against <b>$21.8M construction and projects (62%)</b>; gross margin runs 34% on the service book and 20% on project work. Backlog stands at $28.4M with surety capacity of $15M single / $40M aggregate, and the work-in-progress schedule is net overbilled — the billing discipline buyers look for first in this trade.</p>
  <div class="facts">
    <div class="fact"><div class="n">38%</div><div class="l">Service &amp; maintenance mix</div></div>
    <div class="fact"><div class="n">$28.4M</div><div class="l">Backlog · POC schedule current</div></div>
    <div class="fact"><div class="n">22</div><div class="l">States · national programs</div></div>
    <div class="fact"><div class="n">178</div><div class="l">Employees · 62-vehicle fleet</div></div>
  </div>
  <h2>Where the revenue comes from</h2>
  <table>
    <tr class="head"><th>Revenue line</th><th style="text-align:right">Revenue</th><th style="text-align:right">Mix</th><th style="text-align:right">Gross margin</th><th style="text-align:right">Gross profit</th></tr>
    <tr><td class="bl"><b>Service &amp; maintenance</b><span class="nt">Contracted preventive maintenance, service agreements, demand service</span></td><td class="bn">$13,400,000</td><td class="bn">38%</td><td class="bn">34%</td><td class="bn">$4,556,000</td></tr>
    <tr><td class="bl"><b>Construction &amp; projects</b><span class="nt">National rollout programs, healthcare, light industrial, tenant work</span></td><td class="bn">$21,800,000</td><td class="bn">62%</td><td class="bn">20%</td><td class="bn">$4,360,000</td></tr>
    <tr class="tot"><td class="bl">Total</td><td class="bn">$35,200,000</td><td class="bn">100%</td><td class="bn">25.3%</td><td class="bn">$8,916,000</td></tr>
  </table>
  <p style="margin-top:11px">The two lines earn very differently and are valued very differently. Fourteen points of gross margin separate them, and — as page 7 sets out — so do three to five turns of EBITDA.</p>
  <div class="two" style="margin-top:6px">
    <div>
      <div class="mini">Management and labour</div>
      <p>A general manager and a project-manager bench run delivery day to day. The owner-CEO remains the relationship holder on the national programs. 178 employees across field, fabrication and office; a 62-vehicle fleet.</p>
      <div class="mini">Customers</div>
      <p>The largest account is a national grocery rollout program at 14% of revenue. No other account exceeds 8%. The service book is spread across several hundred contracted sites.</p>
    </div>
    <div>
      <div class="mini">Bonding and backlog</div>
      <p>Surety capacity of $15M single / $40M aggregate, with $28.4M of backlog — about sixteen months of project work at the current run rate. Percentage-of-completion schedules are current and reviewed.</p>
      <div class="mini">Premises</div>
      <p>The headquarters and fabrication shop are owned by a related entity and leased to the business at $180,000 against a $340,000 market rate. Both the earnings restatement and the proceeds waterfall handle this — see pages 5 and 11.</p>
    </div>
  </div>
  ${foot}
</div>`;

const P5 = `
<div class="pg body-pg">
  ${crumb(5)}
  <h2>Earnings, normalized the way a buyer will</h2>
  <p>Buyers don't price the tax return — their accountants rebuild it, adding back what won't recur under new ownership and restating what isn't at market. This is that walk:</p>
  <table>
    <tr><td class="bl"><b>Reported pre-tax income</b><span class="nt">Per CPA-reviewed accrual statements, TTM June 2026</span></td><td class="bn">$2,120,000</td></tr>
    <tr><td class="bl">Interest expense<span class="nt">Line of credit + equipment notes</span></td><td class="bn">+$410,000</td></tr>
    <tr><td class="bl">Depreciation &amp; amortization<span class="nt">Fleet, fabrication equipment, leaseholds</span></td><td class="bn">+$1,290,000</td></tr>
    <tr class="sub"><td class="bl">EBITDA (10.9% of revenue)</td><td class="bn">$3,820,000</td></tr>
    <tr><td class="bl">Owner compensation above market<span class="nt">Owner-CEO total comp $750,000 vs. $375,000 market replacement</span></td><td class="bn">+$375,000</td></tr>
    <tr><td class="bl">One-time litigation settlement<span class="nt">2024 project dispute — resolved, no recurrence</span></td><td class="bn">+$240,000</td></tr>
    <tr><td class="bl">Non-working family payroll<span class="nt">Two family members not active in the business</span></td><td class="bn">+$165,000</td></tr>
    <tr><td class="bl">One-time ERP implementation<span class="nt">2025 system migration; run-rate support stays in overhead</span></td><td class="bn">+$112,000</td></tr>
    <tr><td class="bl">Personal expenses run through the business<span class="nt">Vehicles, travel, memberships</span></td><td class="bn">+$88,000</td></tr>
    <tr><td class="bl">Occupancy restated to market rent<span class="nt">HQ + fab shop owned by a related entity; $180,000 expensed vs. $340,000 market</span></td><td class="bn">−$160,000</td></tr>
    <tr class="tot"><td class="bl">Adjusted EBITDA (13.2% of revenue)</td><td class="bn">$4,640,000</td></tr>
  </table>
  <h2 style="margin-top:18px">Which of these survive a buyer's accountant</h2>
  <div class="two">
    <div>
      <div class="mini">Defends easily</div>
      <p><b>Interest, depreciation and owner compensation.</b> Mechanical, documented, standard in every deal.</p>
      <p><b>Occupancy restated to market.</b> A deduction, not an add-back — it lowers earnings by $160,000. Volunteering it is what makes the rest credible.</p>
    </div>
    <div>
      <div class="mini">Expect a challenge</div>
      <p><b>The ERP implementation ($112,000)</b> and <b>personal expenses ($88,000).</b> Buyers test whether ERP spend is finished and whether the personal items recur. Have the invoices ready.</p>
      <p><b>The litigation settlement ($240,000)</b> needs the agreement itself, not a summary — an unsupported one-time item is the fastest way to lose the schedule's credibility.</p>
    </div>
  </div>
  <div class="box brass" style="margin-top:8px">
    <div class="bt">What this is worth</div>
    <p>$820,000 separates reported EBITDA from adjusted EBITDA. At the 8–11x tier this business underwrites in, that schedule is worth <b>$6.6M to $9.0M</b> of enterprise value — the highest-return document an owner prepares, and the one most often prepared badly.</p>
  </div>
  ${foot}
</div>`;

const P6 = `
<div class="pg body-pg">
  ${crumb(6)}
  <h2>Three years</h2>
  <p>One year of figures is a snapshot; three is a direction. Buyers pay for direction — and what this trend shows is a contractor deliberately moving weight from project work onto a contracted service book, with margin following the mix.</p>
  <table>
    <tr class="head"><th>&nbsp;</th><th style="text-align:right">FY2024</th><th style="text-align:right">FY2025</th><th style="text-align:right">TTM Jun-26</th></tr>
    <tr><td class="bl"><b>Revenue</b></td><td class="bn">$28,600,000</td><td class="bn">$31,900,000</td><td class="bn">$35,200,000</td></tr>
    <tr><td class="bl">Service &amp; maintenance<span class="nt">Contracted, recurring</span></td><td class="bn">$9,400,000</td><td class="bn">$11,300,000</td><td class="bn">$13,400,000</td></tr>
    <tr><td class="bl">Service mix</td><td class="bn">33%</td><td class="bn">35%</td><td class="bn">38%</td></tr>
    <tr><td class="bl">Gross margin (blended)</td><td class="bn">24.6%</td><td class="bn">25.0%</td><td class="bn">25.3%</td></tr>
    <tr class="sub"><td class="bl">EBITDA</td><td class="bn">$2,660,000</td><td class="bn">$3,280,000</td><td class="bn">$3,820,000</td></tr>
    <tr class="tot"><td class="bl">Adjusted EBITDA</td><td class="bn">$3,310,000</td><td class="bn">$4,020,000</td><td class="bn">$4,640,000</td></tr>
    <tr><td class="bl">Adjusted EBITDA margin</td><td class="bn">11.6%</td><td class="bn">12.6%</td><td class="bn">13.2%</td></tr>
    <tr><td class="bl">Backlog at period end</td><td class="bn">$21,200,000</td><td class="bn">$24,900,000</td><td class="bn">$28,400,000</td></tr>
    <tr><td class="bl">Employees</td><td class="bn">141</td><td class="bn">159</td><td class="bn">178</td></tr>
  </table>
  <div class="facts three" style="margin-top:16px">
    <div class="fact"><div class="n">10.9%</div><div class="l">Revenue CAGR · two years</div></div>
    <div class="fact"><div class="n">18.4%</div><div class="l">Adjusted EBITDA CAGR · two years</div></div>
    <div class="fact"><div class="n">+5 pts</div><div class="l">Service mix · 33% to 38%</div></div>
  </div>
  <h2>What a buyer reads in this</h2>
  <p><b>Earnings are growing faster than revenue.</b> Adjusted EBITDA compounded at 18.4% against revenue at 10.9%, and the reason is visible in the same table: five points of mix shifted into a book that earns fourteen more points of gross margin. That is operating leverage a buyer can underwrite, because it comes from a decision rather than from a good year.</p>
  <p><b>Backlog grew with revenue, not ahead of it.</b> Backlog at $28.4M against $21.8M of project revenue is about sixteen months of work — coverage that has held steady across all three years. A backlog growing faster than revenue would raise a delivery-capacity question; one shrinking would raise a pipeline question. Neither applies.</p>
  <p><b>Headcount grew slower than revenue.</b> 141 to 178 employees against $28.6M to $35.2M — revenue per employee moved from $203,000 to $198,000. Broadly flat, which reads as a business scaling on its existing structure rather than buying its growth.</p>
  <div class="box green">
    <div class="bt">The question this table invites</div>
    <p>If five points of mix produced this much margin over two years, what does the next seven points produce? That is page 10.</p>
  </div>
  ${foot}
</div>`;

const P7 = `
<div class="pg body-pg">
  ${crumb(7)}
  <h2>What buyers are paying for commercial MEP</h2>
  <p>Published data has commercial mechanical contractors trading between <b>5x and 11x adjusted EBITDA</b> — and the spread is not noise, it is the service-mix arbitrage: project-led contractors (under about 15% service) clear at 5–6x, while businesses carrying a real contracted service book command 8–11x. At 38% service &amp; maintenance revenue, Acme underwrites on the strong side of that divide. Applied to normalized adjusted EBITDA of $4,640,000:</p>
  <div class="range">
    <div class="rr"><div class="n">$23.2M – $51.0M</div><div class="l">Full published band · 5.0x–11.0x</div></div>
    <div class="rr hero"><div class="n">$37.1M – $51.0M</div><div class="l">Where the market clears · 8.0x–11.0x with a real service book</div></div>
  </div>
  <div class="src">Band: smbX, "The U.S. Commercial Mechanical, HVAC &amp; Plumbing Services Market" (July 2026) — project-led lower-middle-market contractor 5–6x; 8–11x with a real service book. Underlying multiples carried from CT Acquisitions and the report's own source register. A range, never a single number: the exact landing point is priced in diligence.</div>
  <h2>Why the service book carries the multiple</h2>
  <p>Project revenue re-wins itself every year; a maintenance contract renews. Buyers underwrite the renewal: contracted service revenue survives ownership change, smooths the bid cycle, and feeds the project pipeline from inside customer buildings. That is why the published spread between a project-led book and a service-led book is measured in full turns of EBITDA — on Acme's earnings, each turn is worth roughly $4.6M of enterprise value.</p>
  <table style="margin-top:12px">
    <tr class="head"><th>Profile</th><th>Service mix</th><th>Published multiple</th><th style="text-align:right">On $4,640,000</th></tr>
    <tr><td class="bl"><b>Project-led contractor</b><span class="nt">Bid-build, thin recurring revenue</span></td><td class="dn">under ~15%</td><td class="dn">5.0x – 6.0x</td><td class="bn">$23.2M – $27.8M</td></tr>
    <tr><td class="bl"><b>Mixed book</b><span class="nt">A service department, not a service business</span></td><td class="dn">15% – 30%</td><td class="dn">6.0x – 8.0x</td><td class="bn">$27.8M – $37.1M</td></tr>
    <tr class="sub"><td class="bl">Real contracted service book — where Acme sits</td><td class="dn">30%+</td><td class="dn">8.0x – 11.0x</td><td class="bn">$37.1M – $51.0M</td></tr>
  </table>
  <h2>What underwrites the range</h2>
  <p>Three things a buyer's diligence will test, and where Acme stands in this sample: the <b>work-in-progress schedule</b> (net overbilled $1.1M — cash-positive discipline, no borrowed margin); <b>surety</b> ($15M single / $40M aggregate — capacity transfers with a well-structured deal); and <b>percentage-of-completion accounting</b> reviewed by an outside CPA firm, so the earnings above survive a quality-of-earnings rebuild largely intact.</p>
  ${foot}
</div>`;

const P8 = `
<div class="pg body-pg">
  ${crumb(8)}
  <h2>Where this business sits, and why</h2>
  <p>On the readiness drivers buyers actually price, this profile reads in the <b>upper third</b> of the band.</p>
  <table>
    <tr><td class="dl">Recurring revenue</td><td class="ds" style="color:${GREEN}">Strength</td><td class="dn">38% contracted service &amp; maintenance — above the ~30% mark where buyers re-rate a contractor, and the single largest reason this profile prices in the 8–11x tier rather than the project-led 5–6x.</td></tr>
    <tr><td class="dl">Owner dependence</td><td class="ds" style="color:${BRASS}">Watch</td><td class="dn">A GM and PM bench runs delivery; the owner still holds key program relationships. Buyers will test whether the business transfers — expect the question, and expect part of the answer to be priced.</td></tr>
    <tr><td class="dl">Customer concentration</td><td class="ds" style="color:${BRASS}">Watch</td><td class="dn">Top account (a national grocery rollout program) at 14% of revenue — inside the range buyers accept, but close to the 15–20% line they price against as the program grows.</td></tr>
    <tr><td class="dl">Financial records</td><td class="ds" style="color:${GREEN}">Strength</td><td class="dn">Accrual books, outside CPA review, current POC schedules — the record-keeping that defends a multiple in quality-of-earnings.</td></tr>
    <tr><td class="dl">Project weighting</td><td class="ds" style="color:${BRASS}">Fix before sale</td><td class="dn">62% of revenue is project work. The published spread prices project-led books at 5–6x — every point of mix shifted toward contracted service moves this business deeper into the 8–11x tier.</td></tr>
  </table>
  <div class="src">Readiness thresholds carried from smbX published assessments: "Home Services — State of the Market" (Aug 2026) and "Commercial MEP Buy-Side Assessment" (Aug 2026).</div>
  <h2>The two watch items, priced</h2>
  <div class="two">
    <div>
      <div class="mini">Owner dependence</div>
      <p>This is not a binary. A buyer asks one question: on the Monday after closing, who answers the phone when the national grocery program calls? If the answer is a named president with the relationship already transferred, the discount disappears. If the answer is the departing owner, part of the price moves into an earnout or a two-year consulting agreement.</p>
      <p>It is the most fixable line on the table and the one that takes the longest to fix — a relationship transfer is measured in quarters, not weeks.</p>
    </div>
    <div>
      <div class="mini">Customer concentration</div>
      <p>14% is comfortable. The risk is directional: a rollout program that scales takes concentration with it, and 20% is where buyers start structuring around it — a portion of the price tied to that account's retention post-close.</p>
      <p>The defence is either a second program of similar weight or a written framework agreement with term. Growing the account without growing its share is the outcome to aim for.</p>
    </div>
  </div>
  <h2>The real estate</h2>
  <p>The headquarters and fabrication shop are owned by a related entity, so two things hold. First, the range on page 7 values the <b>operating business at market rent</b> — earnings were restated as if a third-party landlord charged the $340,000 market rate. Second, the property is a <b>separate asset</b> with its own value: buyers typically lease it back at market or purchase it separately, and its value comes from a licensed real estate appraiser — it is not included in the range and we do not estimate it.</p>
  ${foot}
</div>`;

const P9 = `
<div class="pg body-pg">
  ${crumb(9)}
  <h2>The numbers a buyer runs</h2>
  <p>Before a buyer makes a call, an analyst computes about a dozen ratios from the statements. None of them set the price on their own; together they decide whether the business gets a second meeting. These are Acme's, with what each one is being used to test.</p>
  <table>
    <tr class="head"><th>Measure</th><th style="text-align:right">Acme</th><th>What the buyer is testing</th></tr>
    <tr><td class="bl"><b>Adjusted EBITDA margin</b></td><td class="bn">13.2%</td><td class="dn">Whether the earnings are structural or a good year. Rising across three years, and traceable to mix rather than to price.</td></tr>
    <tr><td class="bl"><b>Blended gross margin</b></td><td class="bn">25.3%</td><td class="dn">Estimating accuracy and job discipline. A blended margin drifting down means jobs are being bought.</td></tr>
    <tr><td class="bl"><b>Days sales outstanding</b></td><td class="bn">72 days</td><td class="dn">Collection discipline and the retainage position. Normal for commercial contracting; a buyer funds this in working capital.</td></tr>
    <tr><td class="bl"><b>Work-in-progress position</b></td><td class="bn">Net overbilled $1.1M</td><td class="dn">The first thing tested in this trade. Overbilled is cash-positive discipline. Underbilled means margin has been borrowed from future periods.</td></tr>
    <tr><td class="bl"><b>Working capital</b></td><td class="bn">$3.15M · 8.9% of revenue</td><td class="dn">Sets the peg the buyer will require at close. See page 12 — this is the line that quietly moves the wire amount.</td></tr>
    <tr><td class="bl"><b>Total debt / adjusted EBITDA</b></td><td class="bn">1.12x</td><td class="dn">Whether the balance sheet is carrying the earnings. Low, and retired at close in any structure on page 11.</td></tr>
    <tr><td class="bl"><b>Net debt / adjusted EBITDA</b></td><td class="bn">0.72x</td><td class="dn">The same question after cash. Well inside what a lender will fund against.</td></tr>
    <tr><td class="bl"><b>Backlog coverage</b></td><td class="bn">1.30x · ~16 months</td><td class="dn">Whether next year is already sold. Coverage has held flat across three years of growth.</td></tr>
    <tr><td class="bl"><b>Revenue per employee</b></td><td class="bn">$197,800</td><td class="dn">Whether growth came from productivity or from headcount. Broadly flat across three years — the former.</td></tr>
    <tr><td class="bl"><b>Fixed assets / revenue</b></td><td class="bn">11.9%</td><td class="dn">How capital-hungry the business is, and what maintenance capex a buyer must deduct. See page 14.</td></tr>
  </table>
  <div class="box brass">
    <div class="bt">Why there is no "industry average" column here</div>
    <p>Because we could not cite one. Ratio benchmarks for privately held mechanical contractors are widely republished and thinly sourced, and a comparison dot next to a number the reader cannot trace is worse than no dot at all. Where a threshold in this report is a real published line — the ~30% recurring-revenue mark on page 8, the 15–20% concentration line, the 5–11x band on page 7 — it is cited to the assessment it came from. Where one is not, it is not here.</p>
  </div>
  ${foot}
</div>`;

const P10 = `
<div class="pg body-pg dense">
  ${crumb(10)}
  <h2>What moves the number</h2>
  <p>The three items on page 8 are not a wish list — each has arithmetic behind it. Held to a growth rate below what this business has already achieved, and with mix moved to 45%, the same company prices differently inside twenty-four months.</p>
  <div class="bars">
    <div class="brow">
      <div class="bl2"><div class="bn2">$37.1M – $51.0M</div><div class="bk">Today · 8.0x–11.0x on $4.64M</div></div>
      <div class="bar now" style="width:76.6%"></div>
      <div class="cap">Midpoint $44.1M. Bar widths are the ratio of the two midpoints.</div>
    </div>
    <div class="brow">
      <div class="bl2"><div class="bn2">$53.3M – $61.7M</div><div class="bk">In 24 months · 9.5x–11.0x on $5.61M</div></div>
      <div class="bar then" style="width:100%"></div>
      <div class="cap">Midpoint $57.5M — <b style="color:${INK}">$13.4M above today</b>, from three operating decisions and two years. The multiple narrows into the upper half of the same published 8–11x tier; no new band is introduced.</div>
    </div>
  </div>
  <h2 style="margin-top:18px">The arithmetic</h2>
  <table>
    <tr><td class="bl"><b>Revenue in 24 months</b><span class="nt">5.9% compound — below the 10.9% this business achieved over the last two years, deliberately</span></td><td class="bn">$39,500,000</td></tr>
    <tr><td class="bl">Service &amp; maintenance at 45% of revenue<span class="nt">Up from 38% — $17.8M against $21.7M of project work; blended gross margin 26.3%, up 1.0 point on the mix shift alone</span></td><td class="bn">$17,800,000</td></tr>
    <tr class="sub"><td class="bl">Adjusted EBITDA at 14.2% of revenue</td><td class="bn">$5,610,000</td></tr>
    <tr><td class="bl">Multiple<span class="nt">Upper half of the published 8–11x tier — 45% mix, a named president, concentration held</span></td><td class="bn">9.5x – 11.0x</td></tr>
    <tr class="tot"><td class="bl">Enterprise value</td><td class="bn">$53.3M – $61.7M</td></tr>
  </table>
  <h2 style="margin-top:18px">The three moves, in order of what they are worth</h2>
  <div class="stack">
    <div class="st"><div class="sh"><div class="sn">1 · Grow the service book past 45%</div><div class="sv">+$970,000 EBITDA</div></div>
      <div class="sb">Seven points of mix moves roughly $2.8M of revenue from a 20%-margin line to a 34%-margin line — a full point of blended gross margin dropping through overhead already in place. It also holds the multiple in the upper half of the tier: mix, more than size, separates 6x from 10x.</div></div>
    <div class="st"><div class="sh"><div class="sn">2 · Name a president</div><div class="sv">Multiple, not EBITDA</div></div>
      <div class="sb">Earns nothing on the income statement, worth turns at exit. It removes the owner-dependence discount — the difference between a buyer paying at the top of the range and one holding a quarter of the price in an earnout. Start it first; the transfer takes quarters.</div></div>
    <div class="st"><div class="sh"><div class="sn">3 · Hold the rollout program under 15%</div><div class="sv">Protects the range</div></div>
      <div class="sb">Defensive rather than additive — growing the top account without growing its share keeps concentration out of the structure conversation.</div></div>
  </div>
  <p style="margin-top:12px">Every line above is an operating decision, not a negotiating position — the case for starting this conversation before the year an owner intends to sell rather than during it.</p>
  ${foot}
</div>`;

const P11 = `
<div class="pg body-pg">
  ${crumb(11)}
  <h2>What the owner actually walks away with</h2>
  <p>The range on page 7 is <b>enterprise value</b> — the value of the business on a cash-free, debt-free basis. It is not the wire amount, and the gap between the two is where most owners are surprised. This is the walk down.</p>
  <table class="wf">
    <tr class="head"><th>&nbsp;</th><th style="text-align:right">At 8.0x</th><th style="text-align:right">At 11.0x</th></tr>
    <tr><td class="lbl">Enterprise value<span class="nt">Cash-free, debt-free, on $4,640,000 of adjusted EBITDA</span></td><td class="a">$37,120,000</td><td class="b">$51,040,000</td></tr>
    <tr><td class="lbl">Less funded debt retired at close<span class="nt">Line of credit $1.9M + equipment notes $3.3M</span></td><td class="a">−$5,200,000</td><td class="b">−$5,200,000</td></tr>
    <tr class="sub2"><td class="lbl">Equity value to the seller</td><td class="a">$31,920,000</td><td class="b">$45,840,000</td></tr>
    <tr><td class="lbl">Less transaction costs<span class="nt">Sell-side advisory, legal, quality-of-earnings, insurance — modelled at 4% of enterprise value</span></td><td class="a">−$1,480,000</td><td class="b">−$2,040,000</td></tr>
    <tr class="sub2"><td class="lbl">Gross proceeds to the owner</td><td class="a">$30,440,000</td><td class="b">$43,800,000</td></tr>
    <tr><td class="lbl">Held in escrow at close<span class="nt">10% for 12–18 months against reps and warranties — released, not lost</span></td><td class="a">−$3,710,000</td><td class="b">−$5,100,000</td></tr>
    <tr class="fin"><td class="lbl">Cash at close</td><td class="a">$26,730,000</td><td class="b">$38,700,000</td></tr>
  </table>
  <div class="src">Cost and escrow percentages are structure norms from smbX buy-side practice, not published market data. Every deal is negotiated, and page 12 sets out the variants. Working capital is assumed delivered at the agreed peg, so no true-up is shown — see page 12 for what happens when it is not.</div>
  <div class="two" style="margin-top:14px">
    <div>
      <div class="mini">The building is on top of this</div>
      <p>The headquarters and fabrication shop are owned separately and are <b>not</b> in any figure above. Two outcomes are normal: the buyer signs a market lease at the $340,000 rate already reflected in earnings and the owner keeps the property as an income asset, or the property is sold separately.</p>
      <p>Its value comes from a licensed real estate appraiser. We do not estimate it, and an owner should be sceptical of anyone who does it in passing.</p>
    </div>
    <div>
      <div class="mini">Tax is named here, not estimated</div>
      <p>What an owner keeps after tax turns on the deal being structured as an asset sale or an equity sale, on the entity type, on basis, on state of residence and on how the purchase price is allocated. Those five facts can move the after-tax outcome by more than the negotiating range on page 7 does.</p>
      <p>That makes it a question for the owner's CPA before a letter of intent is signed — not after, when the structure is already agreed and the leverage is gone. It is not a question this report can answer, and a figure here would be a guess wearing a number's clothes.</p>
    </div>
  </div>
  <div class="disc"><b>How to read this:</b> ${DISCLAIMER}</div>
  ${foot}
</div>`;

const P12 = `
<div class="pg body-pg">
  ${crumb(12)}
  <h2>What an offer looks like</h2>
  <p>Owners hear a number and picture a wire. Buyers hear the same number and picture a structure. Both are describing the same deal — and the distance between them is why deals that agree on price still die. This is the anatomy of a typical offer at this size.</p>
  <div class="stack">
    <div class="st"><div class="sh"><div class="sn">Cash at close</div><div class="sv">70% – 85%</div></div>
      <div class="sb">Funded by the buyer's equity plus senior debt. The percentage moves with the quality of the earnings and the depth of management — the two items on page 8. A business with a named president and a clean quality-of-earnings result sits at the top of this range.</div></div>
    <div class="st"><div class="sh"><div class="sn">Seller note</div><div class="sv">0% – 10%</div></div>
      <div class="sb">A promissory note back to the seller, typically two to five years at a single-digit rate, subordinated to the senior lender. Common where the buyer needs to bridge a gap; usually avoidable when the balance sheet supports the leverage, as this one does at 1.12x.</div></div>
    <div class="st"><div class="sh"><div class="sn">Rollover equity</div><div class="sv">0% – 25%</div></div>
      <div class="sb">The owner reinvests part of the proceeds into the buyer's holding company. Standard with a private-equity platform, absent with a strategic. It is not a discount — it is a second bite, and on a platform that performs it is often worth more than the cash it replaced. It is also money at risk again.</div></div>
    <div class="st"><div class="sh"><div class="sn">Earnout</div><div class="sv">0% – 15%</div></div>
      <div class="sb">Price contingent on post-close performance. At this profile the likely trigger is service-book retention or the rollout program's renewal. An earnout is how a buyer prices the two watch items on page 8 without walking away — which is exactly why fixing those items before going to market is worth more than negotiating the earnout later.</div></div>
    <div class="st"><div class="sh"><div class="sn">Escrow or representation insurance</div><div class="sv">8% – 12%, or a premium</div></div>
      <div class="sb">Held 12–18 months against breaches of the seller's representations. Increasingly replaced by a representations-and-warranties insurance policy, which costs a premium but returns the held-back cash to the seller at close. Worth pricing both ways.</div></div>
  </div>
  <h2>The working-capital peg — the line that moves the wire</h2>
  <p>Nearly every deal is done on a cash-free, debt-free basis with a <b>normal level of working capital</b> delivered at close. That level is negotiated, usually as an average of the trailing twelve months, and the difference between the peg and what is actually delivered is trued up dollar for dollar against the price.</p>
  <p>Acme runs $3.15M of working capital, 8.9% of revenue. A peg set half a point of revenue too high costs the seller about $176,000 at close — real money, decided in a schedule most owners never read, months after the price was agreed. In this trade the argument is usually about retainage and the treatment of over- and underbillings, which is why the WIP position on page 9 matters twice.</p>
  ${foot}
</div>`;

const P13 = `
<div class="pg body-pg">
  ${crumb(13)}
  <h2>Who buys a business like this</h2>
  <p>"What is it worth" has no single answer because there is no single buyer. Four types will look at a $4.64M-EBITDA commercial mechanical contractor with a real service book, and they value the same business differently — because they are buying different things with it.</p>
  <div class="stack">
    <div class="st"><div class="sh"><div class="sn">Regional strategic · another contractor</div><div class="sv">Often the top of the band</div></div>
      <div class="sb">Buys route density, the service book and the licence footprint across 22 states. Can pay the most because it removes duplicated overhead and puts the crews to work immediately — and it is the buyer most likely to move fast, because it already knows the trade. The trade-off is integration: the name usually goes, and so does some of the back office.</div></div>
    <div class="st"><div class="sh"><div class="sn">Private-equity platform · buy-and-build</div><div class="sv">Upper half, with rollover</div></div>
      <div class="sb">Buys a base to acquire from. At $4.64M of EBITDA with reviewed books, a manager bench and 38% recurring revenue, this profile is a credible platform rather than a tuck-in — which matters, because platforms clear at a premium to what they subsequently pay for add-ons. Expect 10–25% rollover equity and a five-year horizon. The name and the team usually stay.</div></div>
    <div class="st"><div class="sh"><div class="sn">Private-equity add-on · tuck-in to an existing platform</div><div class="sv">Mid-band, synergy-driven</div></div>
      <div class="sb">Buys into a footprint someone else already built. Pays against the platform's own multiple less an integration discount, so the headline can look lower while the certainty of close is higher — the capital and the diligence machinery are already in place. Best fit where the platform lacks the Dallas footprint or the national programs.</div></div>
    <div class="st"><div class="sh"><div class="sn">Independent sponsor or search fund</div><div class="sv">Lower, with more structure</div></div>
      <div class="sb">Buys the business as a career. Almost always brings a capital partner, which means the price is real but the structure carries more seller note, more earnout and a longer path to signing. At this size, SBA-backed buyers are below the range entirely — the loan programmes cap out well under what this business clears — so the buyer pool here is capital-partnered rather than bank-programme buyers.</div></div>
  </div>
  <h2>What this means in practice</h2>
  <div class="two">
    <div>
      <p><b>Run a process, not a conversation.</b> The spread between these buyer types on the same business is wider than the spread most owners negotiate within a single conversation. One unsolicited approach is one data point, and it is the one data point a buyer would most like an owner to act on.</p>
    </div>
    <div>
      <p><b>Price is not the only variable.</b> A strategic at the top of the band with a full integration, a platform in the upper half with rollover and the team intact, and an add-on slightly lower with high certainty of close are three genuinely different outcomes. Which one is best depends on what the owner wants the business to be afterwards.</p>
    </div>
  </div>
  ${foot}
</div>`;

const P14 = `
<div class="pg body-pg">
  ${crumb(14)}
  <h2>What diligence will test</h2>
  <p>Between a signed letter of intent and a closing sits a quality-of-earnings rebuild — an independent accounting firm, working for the buyer, re-deriving the earnings on page 5 from the source records. It is the single most common place a price gets re-traded. Everything below is knowable in advance.</p>
  <table>
    <tr class="head"><th>What gets tested</th><th>What they are looking for</th><th style="width:96px">Acme</th></tr>
    <tr><td class="bl"><b>Percentage-of-completion schedules</b></td><td class="dn">Job fade — margins estimated at bid that shrink as jobs complete. They re-perform the calculation on closed jobs and compare to what was booked.</td><td class="ds" style="color:${GREEN}">Reviewed</td></tr>
    <tr><td class="bl"><b>Over- and underbillings</b></td><td class="dn">Whether cash has been collected ahead of work performed, and whether any job is carrying borrowed margin.</td><td class="ds" style="color:${GREEN}">Net overbilled</td></tr>
    <tr><td class="bl"><b>The add-back schedule</b></td><td class="dn">Each line challenged individually and supported from the general ledger. Owner comp and interest survive; one-time items need documents.</td><td class="ds" style="color:${BRASS}">Prepare files</td></tr>
    <tr><td class="bl"><b>Maintenance capital expenditure</b></td><td class="dn">What must be spent each year simply to keep 62 vehicles and the fabrication shop running. Deducted from EBITDA when sizing debt.</td><td class="ds" style="color:${BRASS}">Quantify</td></tr>
    <tr><td class="bl"><b>Contract assignability</b></td><td class="dn">Change-of-control clauses in the service agreements and the national programs. A contract that terminates on a change of control is a contract the buyer does not get.</td><td class="ds" style="color:${BRASS}">Review</td></tr>
    <tr><td class="bl"><b>Surety consent</b></td><td class="dn">Whether the bonding line survives the transaction and on what terms. The surety is effectively a third party to the deal in this trade.</td><td class="ds" style="color:${BRASS}">Engage early</td></tr>
    <tr><td class="bl"><b>Labour and safety</b></td><td class="dn">Union status, prevailing-wage exposure, the workers-compensation experience modifier, open claims.</td><td class="dn">—</td></tr>
    <tr><td class="bl"><b>Warranty and callback reserve</b></td><td class="dn">Whether historic warranty cost is reserved or expensed as incurred. An unreserved callback history becomes an EBITDA adjustment.</td><td class="dn">—</td></tr>
  </table>
  <h2>The one most owners have not thought about</h2>
  <p><b>Maintenance capex.</b> Depreciation on page 5 runs $1,290,000 — that is an accounting figure, not a cash requirement. The cash requirement is what it costs to keep a 62-vehicle fleet and a fabrication shop working, which on a business of this asset intensity typically lands somewhere below depreciation but well above zero.</p>
  <p>It matters because lenders and buyers underwrite <b>adjusted EBITDA less maintenance capex</b> when sizing debt, not adjusted EBITDA. An owner who can separate maintenance spend from growth spend — the trucks that replace trucks, versus the trucks that add crews — is handing the buyer a bigger number to lend against. An owner who cannot has it estimated for them, conservatively.</p>
  <div class="box green">
    <div class="bt">The pattern in this table</div>
    <p>Two rows are already strengths because the work was done years ago — reviewed books and current job schedules. Four rows say "prepare", "quantify", "review", "engage early", and every one of them can be closed before a buyer is ever in the room. None of them can be closed quickly once one is.</p>
  </div>
  ${foot}
</div>`;

const P15 = `
<div class="pg body-pg">
  ${crumb(15)}
  <h2>What happens next</h2>
  <p>A sale process at this size runs six to nine months from first buyer contact to funds in the account. The preparation that decides the price happens before any of it starts.</p>
  <div class="tl">
    <div class="ti"><div class="tw">Now – Month 3</div><div class="tb"><b>Preparation.</b> Build the add-back schedule with its supporting documents. Quantify maintenance capex separately from growth capex. Pull the change-of-control clauses out of the service agreements and the national programs. Talk to the surety. Nothing here involves a buyer, and all of it moves the price.</div></div>
    <div class="ti"><div class="tw">Month 1 – 12</div><div class="tb"><b>The two structural fixes.</b> Name a president and begin transferring the program relationships. Move mix toward 45%. These are the page 10 items — they are the slowest to take effect and the most valuable, which is why they start first and run underneath everything else.</div></div>
    <div class="ti"><div class="tw">Month 4 – 5</div><div class="tb"><b>Materials and buyer list.</b> The information memorandum, the financial model, the data room. In parallel, a buyer universe built across all four types on page 13 — not the one strategic who already called.</div></div>
    <div class="ti"><div class="tw">Month 5 – 7</div><div class="tb"><b>Market and negotiate.</b> Outreach, management meetings, indications of interest, then letters of intent. Competitive tension between buyer types is what converts the range on page 7 into a number at the top of it.</div></div>
    <div class="ti"><div class="tw">Month 7 – 9</div><div class="tb"><b>Diligence and close.</b> The quality-of-earnings rebuild on page 14, legal diligence, surety consent, the purchase agreement, the working-capital peg. Then funds flow.</div></div>
    <div class="ti"><div class="tw">Post-close</div><div class="tb"><b>Transition.</b> Escrow releases at 12–18 months. Any earnout runs its measurement period. If there is rollover equity, the second bite is three to five years out.</div></div>
  </div>
  <h2>If you do only three things</h2>
  <div class="stack">
    <div class="st"><div class="sh"><div class="sn">1 · Build the add-back schedule now, with the documents attached</div><div class="sv">Worth $6.6M – $9.0M</div></div>
      <div class="sb">Page 5. It is the highest-return document an owner ever prepares, and it is worth nothing if it arrives as an assertion instead of a file.</div></div>
    <div class="st"><div class="sh"><div class="sn">2 · Name a president and start the relationship transfer</div><div class="sv">Turns, not points</div></div>
      <div class="sb">Page 8. The slowest fix on the list, so it has to be the first one started. Quarters, not weeks.</div></div>
    <div class="st"><div class="sh"><div class="sn">3 · Move the mix</div><div class="sv">+$970,000 of EBITDA</div></div>
      <div class="sb">Page 10. Seven points of revenue from project work to contracted service — and with it, the upper half of the multiple range rather than the lower.</div></div>
  </div>
  <div class="box brass">
    <div class="bt">The order matters more than the list</div>
    <p>Every item above is cheaper, slower and more valuable done before a buyer is in the room than after. That is the whole argument for reading a valuation years before the year you intend to sell.</p>
  </div>
  ${foot}
</div>`;

const P16 = `
<div class="pg dark">
  <div class="inner close-inner">
    <div class="kicker">For owners</div>
    <div class="close-h">Preparation is key for a smooth transaction.<br><span class="turn">Buyers will appreciate it too.</span></div>
    <div class="close-rule"></div>
    <div class="close-b">Nobody pays a premium for surprises. The businesses that clear at the top of their band are the ones whose schedules and contracts were ready before the first call.</div>
    <div class="close-b">This is the short version. The one we build with you runs on your figures — and costs you nothing, because acquirers pay us and owners never do.</div>
    <div class="steps">
      <div class="step"><div class="n">1</div><div class="b">Pick your trade and answer the walk — about fifteen minutes, in plain chat.</div></div>
      <div class="step"><div class="n">2</div><div class="b">Your figures are never stored. The finished report is the one record, kept only if you say keep it.</div></div>
      <div class="step"><div class="n">3</div><div class="b">It arrives by email — and when a buyer engages us in your lane, registered owners are the first call.</div></div>
    </div>
    <div class="close-url">SMBX.AI <span>→ FREE VALUATION</span></div>
    <div class="close-by">
      <img src="${HEAD}">
      <div><div class="nm">Paul Baker</div><div class="rl">Founder · two decades on the buy side</div></div>
    </div>
    <img class="close-logo" src="${LOGO_W}">
    <div class="credits">EVERY MARKET FIGURE CITED · BUY-SIDE ONLY · NEVER A FEE FROM AN OWNER</div>
    <div class="close-note">${SAMPLE_NOTE}<br>${DISCLAIMER}</div>
  </div>
</div>`;

const doc = (pages: string[]) => DOC_HEAD + pages.join('\n') + '</body></html>';
const BODY_PAGES = [P2, P3, P4, P5, P6, P7, P8, P9, P10, P11, P12, P13, P14, P15];

/* ══ PREFLIGHT — the house laws, made executable ═══════════════════════════
 * Paul, 2026-08-04: "I don't understand how we're having to go back and make
 * so many corrections that we've corrected a hundred times already."
 *
 * Because the rules live in prose that a session has to remember, and this
 * file is hand-written CSS that inherits none of them. `design-check.mts`
 * exists to catch exactly these, and it reads a `.deck.mts` / `.post.mts`
 * spec — it cannot see this file. So the checks run here instead, and they
 * FAIL THE BUILD rather than printing a warning above a success line.
 *
 * Every rule below has already been broken in this artifact at least once. */
const ALLOWED_HEX = new Set(
  [...Object.values(LEDGER as Record<string, string>), ...Object.values(REPORT as Record<string, string>),
   '#FFFFFF', '#000000'].map(h => h.toLowerCase()));

const norm = (h: string) => (h.length === 4
  ? '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3] : h).toLowerCase();

function preflight(css: string, markup = ''): string[] {
  const errs: string[] = [];

  /* 1 · No opacity ladder on the block. DESIGN.md §4: "On the block, hierarchy
   *     comes from size and weight, not colour — the text is ivory, the
   *     secondary is #DED8CC, and that is the whole ladder."
   *     The ghost is exempt: DESIGN.md §6.1 specifies it at 5% opacity. */
  for (const rule of css.split('}')) {
    if (!/opacity\s*:/.test(rule)) continue;
    if (/\.ghost/.test(rule)) continue;
    errs.push(`opacity used outside .ghost — not a house device: "${rule.trim().split('\n')[0].slice(0, 60)}"`);
  }

  /* 2 · Honey and amber are large-text-only. DESIGN.md §4: "Never body text,
   *     never a button, never a fill. It is a large-text-only colour on both
   *     grounds — a numeral, a rule, a tag — never a caption."
   *     Stat-card labels shipped as honey at 8px. Twice banned. */
  const JEWELRY = [HONEY.toLowerCase(), BRASS.toLowerCase()];
  for (const block of css.split('}')) {
    const m = block.match(/color\s*:\s*(#[0-9a-fA-F]{3,8})/);
    if (!m || !JEWELRY.includes(m[1].toLowerCase())) continue;
    if (/\.kicker/.test(block)) continue;   // DESIGN.md §4: "the cover eyebrow", "one mono tag"
    const fs = block.match(/font-size\s*:\s*([\d.]+)px/);
    if (fs && parseFloat(fs[1]) < 18) {
      errs.push(`jewelry colour ${m[1]} on ${fs[1]}px text — honey/amber is numerals, rules and tags only`);
    }
  }

  /* 3 · DESIGN.md §10, drift tell: "A hex appears that is not in §4." */
  for (const hex of new Set((css + ' ' + markup).match(/#[0-9a-fA-F]{3,8}\b/g) || [])) {
    if (!ALLOWED_HEX.has(norm(hex))) errs.push(`hex ${hex} is not in the palette (DESIGN.md §4)`);
  }
  return errs;
}

const cssOnly = DOC_HEAD.slice(DOC_HEAD.indexOf('* { margin:0'));
/* markup is scanned too — an inline style:"color:#B00" on a table cell is
   how a second accent got into this file the first time. */
const preErrs = preflight(cssOnly, [P1, ...BODY_PAGES, P16].join('\n').replace(/data:[^"')]+/g, ''));
if (preErrs.length) {
  console.error(`\n✗ PREFLIGHT FAILED — ${preErrs.length} palette violation(s):`);
  for (const e of preErrs) console.error('    ' + e);
  console.error('\n  DESIGN.md §4 is the authority. Fix the stylesheet, not the check.\n');
  process.exit(2);
}
console.log('✓ preflight: palette, jewelry sizing and the block ladder all clean.');

const page = await newRenderPage();
try {
  await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 2 });
  await page.setContent(doc([P1, ...BODY_PAGES, P16]), { waitUntil: 'domcontentloaded', timeout: 180000 });
  await page.evaluateHandle('document.fonts.ready').catch(() => {});
  await page.evaluate(() => Promise.all(Array.from(document.images).map((im: any) => im.decode().catch(() => {})))).catch(() => {});
  await new Promise(r => setTimeout(r, 200));

  /* Overflow guard. FORMATS.md §3.2: overflow is SILENT — "the byline slides
     onto page 2 and the cover just looks like it has a hole in it." */
  const over = await page.evaluate(() => Array.from(document.querySelectorAll('.pg'))
    .map((p: any, i) => ({ n: i + 1, over: p.scrollHeight - p.clientHeight }))
    .filter(x => x.over > 2));
  if (over.length) {
    console.log(`\n✗ ${over.length} page(s) overflow their sheet:`);
    for (const o of over) console.log(`    page ${o.n}: +${o.over}px`);
    process.exitCode = 4;
  } else {
    console.log('✓ no page overflows its sheet.');
  }

  const els = await page.$$('.pg');
  const shots: Buffer[] = [];
  for (let i = 0; i < els.length; i++) {
    const buf = Buffer.from(await els[i].screenshot({ type: 'png' }));
    fs.writeFileSync(path.join(OUT, `acme-p${String(i + 1).padStart(2, '0')}.png`), buf);
    shots.push(buf);
  }

  /* THE RENDERER-PROOF LAW — bookends go in as flat bitmaps so Preview has
     nothing to composite. See SAMPLE-VALUATION-SPEC.md §1. */
  const flat = (b: Buffer) => `<div class="pg flat"><img src="data:image/png;base64,${b.toString('base64')}"></div>`;
  await page.setContent(doc([flat(shots[0]), ...BODY_PAGES, flat(shots[shots.length - 1])]),
    { waitUntil: 'domcontentloaded', timeout: 180000 });
  await page.evaluateHandle('document.fonts.ready').catch(() => {});
  await page.evaluate(() => Promise.all(Array.from(document.images).map((im: any) => im.decode().catch(() => {})))).catch(() => {});
  const pdf = Buffer.from(await page.pdf({ width: '8.5in', height: '11in', printBackground: true }));
  fs.writeFileSync(path.join(OUT, 'smbx-sample-valuation-acme.pdf'), pdf);

  const bytes = pdf.toString('latin1');
  const count = (k: string) => bytes.split(k).length - 1;
  const groups = count('/Group'), shadings = count('/Shading');
  console.log(`pages: ${els.length}  pdf: ${(pdf.length / 1e6).toFixed(2)}MB`);
  console.log(`transparency: /Group=${groups}  /Shading=${shadings}  (image /SMask=${count('/SMask')}, benign)`);
  if (groups || shadings) {
    console.log(`\n✗ ${groups + shadings} renderer-dependent structure(s) reached the PDF — Preview will not match the PNGs.`);
    process.exitCode = 3;
  } else {
    console.log('✓ renderer-proof: no transparency groups, no shadings.');
  }
} catch (e) {
  console.error('BUILD FAILED:', e);
  process.exitCode = 1;
} finally {
  await page.close().catch(() => {});
  process.exit(process.exitCode ?? 0);
}
