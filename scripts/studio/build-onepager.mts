/**
 * Studio one-pager builder — a house-style LinkedIn single-image post from a
 * plain spec, rendered on YOUR computer via Cowork. Sibling to build-deck.mts
 * (carousels); this one owns the single 1080×1350 formats.
 *
 * Why this exists (Paul, 2026-07-22, "make it repeatable and robust"): the
 * availability / statement one-pagers were hand-written throwaway scripts. This
 * turns the format into a fixed, brand-locked template driven by a tiny spec —
 * copy + one image + which modes — so re-running with new numbers is a
 * 30-second job, not a rebuild. Same Ledger design system as the deck builder
 * (palette, Fraunces/Inter/Plex, boardroom texture) and the same renderer-proof
 * flat-image PDF, all pure local compute (no app, no API key).
 *
 * Usage:
 *   npx tsx scripts/studio/build-onepager.mts <spec.post.mts> [--media <dir>] [--out <dir>]
 *
 * The spec is a small .mts file that `export const post = {...}` (see
 * scripts/studio/decks/2-open-seats.post.mts for a worked example + full field
 * reference). Image paths resolve against --media, then ./media, ./assets, the
 * spec's own folder, then CWD; absolute paths pass through; brand assets (logo,
 * texture) come from the repo.
 *
 * Layouts (2026-08-18, Paul: "lock that in for carousel and single image
 * formats… don't remove the other types, but this can be the default"):
 *
 *   'figure'  THE DEFAULT for new specs. The full-length founder cutout
 *             (assets/brand/founder-standing.png — axis-straightened, matte
 *             re-cut for any ground) floats in the text flow, so the copy
 *             WRAPS his silhouette via shape-outside. Geometry is measured,
 *             not felt: figure height 834px = 1350 × φ⁻¹ (the figure : card
 *             ratio IS the golden ratio), vertical intervals step the
 *             Fibonacci ladder (21 · 34 · 55), and the dark ground carries the
 *             SANCTIONED green bloom behind the figure (Paul, 2026-08-18 —
 *             a scoped amendment to Carta's flat-band law; see DESIGN.md §6.2.
 *             `bloom: false` switches it off; the texture stays retired).
 *   'split'   The prior layout — copy column left, photo full-bleed right,
 *             recessed-shadow seam. Fully preserved.
 *
 * BACK-COMPAT INFERENCE, load-bearing for rebuild-all.sh: a spec that names
 * `image` and no `layout` is a split spec from before the default flipped, and
 * MUST keep rendering split — otherwise re-rendering the back catalogue would
 * silently change what was published. `layout` unset + no `image` = figure.
 *
 * Outputs (into --out, default ./collateral): <slug>-dark.png / -light.png (the
 * postable images), <slug>-dark.pdf / -light.pdf (single-page document form),
 * <slug>-caption.txt (the post copy). Modes default to both; set `variants`.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { writeBuildRecord } from './build-record.mts';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
const { cartaFontFaceCss } = await import(pathToFileURL(path.join(ROOT, 'server/services/fontEmbeds.ts')).href);
const { assertCarta } = await import(pathToFileURL(path.join(ROOT, 'house/palette-guard.ts')).href);
const { newRenderPage } = await import(pathToFileURL(path.join(ROOT, 'server/services/premiumPdfRenderer.ts')).href);

/* ── house palette — CARTA (2026-08-15, Paul: "no ledger at all. carta") ──
   THE shared definition — see house/tokens.ts. Never hardcode a hex here.

   Four Ledger constants had no Carta equivalent and are GONE rather than
   remapped, because Carta has exactly ONE accent and no warm colour at all:

     BRASS / HONEY  the amber pair. Every use was a mono kicker, so the kicker
                    now takes the accent — green on light, mint on the band.
                    Remapping brass to "some other warm" would have been the
                    drift; deleting the slot is the conversion.
     the TEXTURE    blackbleed.webp is a Ledger asset. Carta's band is a FLAT
                    colour, so blockBackground() has nothing to composite and
                    the texture would only make the band look like the old one.
                    Note it could not simply be left in place: a texture image
                    sits ABOVE the colour in a background stack and wins
                    outright, so swapping the token and keeping the stack
                    renders identically while showing a clean diff.
     IVORY / SUB    renamed, not deleted — Carta's on-dark reading pair. */
const { CARTA, CARTA_TYPE } = await import(pathToFileURL(path.join(ROOT, 'house/tokens.ts')).href);
const INK = CARTA.ink, BODY = CARTA.body, GREEN = CARTA.green;
const WARM = CARTA.bone, DARK = CARTA.dark, IVORY = CARTA.darkInk, IVORY_SUB = CARTA.darkSub;
const HAIR = CARTA.hair, MINT = CARTA.mint;
const DISPLAY = CARTA_TYPE.display, SANS = CARTA_TYPE.sans, MONO = CARTA_TYPE.mono;

/* ── CLI args ─────────────────────────────────────────────────────────── */
const args = process.argv.slice(2);
const specArg = args.find(a => !a.startsWith('--'));
if (!specArg) { console.error('Usage: build-onepager.mts <spec.post.mts> [--media <dir>] [--out <dir>]'); process.exit(1); }
const flag = (name: string) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const specPath = path.resolve(specArg);
const mediaDir = flag('--media') ? path.resolve(flag('--media')!) : null;
const outDir = flag('--out') ? path.resolve(flag('--out')!) : path.resolve('collateral');
mkdirSync(outDir, { recursive: true });

const { post } = await import(pathToFileURL(specPath).href) as { post: Post };

/* ── types (documented in the example spec) ───────────────────────────── */
interface Post {
  slug: string;
  layout?: 'figure' | 'split';              // default 'figure'; a spec with `image` and no `layout` infers 'split' (back-compat)
  kicker?: string;                          // mono top-right label, e.g. 'AVAILABILITY'
  numeral?: string;                         // giant mint/green figure, e.g. '2' (split layout)
  numeralLabel?: string;                    // small mono label beside it ('\n' = line break)
  hook: string;                             // display-serif headline — use ‑ (U+2011) to glue compounds like buy‑side
  body?: string;                            // supporting paragraph (figure layout: the lede)
  invite?: string;                          // bold, warm invitation line (split layout)
  cta?: string;                             // mono call-to-action, e.g. "Let's talk  →"
  byline?: { name?: string; title?: string };
  image?: string;                           // split layout: right-panel photo; its PRESENCE infers layout:'split' when layout is unset
  imagePos?: string;                        // CSS object-position, default '50% 42%'
  /* figure layout */
  figure?: string;                          // the cutout; default 'brand/founder-standing.png'. MISSING = HARD ERROR, never a quiet text-only card
  points?: { k: string; v: string }[];      // numbered list — k bold lead-in, v the rest of the sentence
  note?: string;                            // mono foot-of-copy line — sources and their interests
  bloom?: boolean;                          // dark ground only; default true (sanctioned 2026-08-18). Set false for the Carta-flat card
  pop?: boolean;                            // the C treatment (default true): bloom aimed at the figure + 1.16/1.05 renderer lift. false = original ambient bloom, unlifted
  headshot?: string;                        // byline face; defaults to the repo founder portrait
  caption?: string;                         // the LinkedIn post text
  variants?: ('dark' | 'light')[];          // default: both
}

/* ── asset resolution (local-first, same order as build-deck.mts) ─────── */
const { b64, esc, logoImg } = await import(pathToFileURL(path.join(ROOT, 'house/assets.ts')).href);
const resolveImg = (p?: string): string | null => {
  if (!p) return null;
  const tries = [
    path.isAbsolute(p) ? p : null,
    mediaDir ? path.join(mediaDir, p) : null,
    path.resolve('media', p),
    path.resolve('assets', p),
    path.join(path.dirname(specPath), p),
    path.join(ROOT, 'client/public', p),   // repo brand/founder photos by bare name (founder-walking.webp, …)
    path.resolve(p),
  ].filter(Boolean) as string[];
  const hit = tries.find(t => existsSync(t));
  if (!hit) { console.warn(`[onepager] image not found: ${p} (looked in ${tries.join(', ')})`); return null; }
  return b64(hit);
};

const LOGO = b64(path.join(ROOT, 'client/public/logo-green-x.png'));
const LOGO_W = b64(path.join(ROOT, 'client/public/logo-green-x-dark.png'));
/* No TEXTURE constant. See the palette note above — the band is a colour. */

/* Which layout? The inference is the back-compat contract (see header). */
const LAYOUT: 'figure' | 'split' = post.layout ?? (post.image ? 'split' : 'figure');

const PHOTO = LAYOUT === 'split' ? resolveImg(post.image) : null;

/* The figure is load-bearing in its layout: a missing cutout must be a
   blocker, not a quiet text-only card. Quiet degradation is exactly how a
   spec pointing at pest.png/plumbing.png shipped pages with no art. */
const FIG = LAYOUT === 'figure' ? resolveImg(post.figure ?? 'brand/founder-standing.png') : null;
if (LAYOUT === 'figure' && !FIG) {
  console.error(`[onepager] figure layout, but the cutout is missing: ${post.figure ?? 'brand/founder-standing.png'}`);
  console.error('           render from the STUDIO ROOT so ./assets resolves, or pass figure:/--media explicitly.');
  process.exit(1);
}
/* The C treatment aims the bloom at the FIGURE, so the builder needs the
   cutout's aspect to know where the figure's centre lands. PNG IHDR carries
   width/height at fixed offsets; anything unparseable falls back to the
   founder-standing aspect rather than erroring — a slightly mis-aimed bloom
   is a lesser failure than no render. */
const figAspect = (() => {
  try {
    const m = /^data:image\/png;base64,(.{200})/.exec(FIG ?? '');
    if (m) {
      const head = Buffer.from(m[1], 'base64');
      if (head.readUInt32BE(12) === 0x49484452) // 'IHDR'
        return head.readUInt32BE(16) / head.readUInt32BE(20);
    }
  } catch { /* fall through */ }
  return 0.323; // founder-standing.png, straightened
})();
const HEAD = resolveImg(post.headshot) || b64(path.join(ROOT, 'client/public/founder-portrait.jpg'));

const name = post.byline?.name ?? 'Paul Baker';
const title = post.byline?.title ?? 'Buy-side corporate development';
const COLW = PHOTO ? 610 : 1080;
const PHOTOW = 1080 - COLW;

/* ── the FIGURE card (default layout; approved v6 mock, 2026-08-18) ─────
   Geometry, measured rather than felt — every number below is one of these:
     · figure height 834px = 1350 × φ⁻¹  (figure : card = the golden ratio)
     · the float's top margin 100px is the APPROVED v6 value — it lands his
       feet just above the foot hairline, the rendering Paul signed off; do
       not "correct" it to touch without a new sign-off
     · vertical intervals step the Fibonacci ladder: 21 · 34 · 55
   The wrap is CSS shape-outside on the cutout's own alpha, which is the whole
   reason the figure must float IN FLOW: position:absolute removes it from
   flow and silently turns the wrap into a plain column (the v2 mock defect).
   The dark ground's green bloom is a SANCTIONED, SCOPED exception to Carta's
   flat-band law (Paul, 2026-08-18) — this layout, dark variant, radial Deal
   Green, nothing else; the boardroom texture stays retired. Renderer-proof is
   unaffected: the PDF is rebuilt from the flat PNG, so no gradient survives
   to the vector layer. */
function figureCard(dark: boolean): string {
  const inkC = dark ? IVORY : INK, subC = dark ? IVORY_SUB : BODY;
  const accC = dark ? MINT : GREEN, logoSrc = dark ? LOGO_W : LOGO;
  const seamC = dark ? CARTA.darkSeam : HAIR;
  /* White CTA on the band (Paul, 2026-08-18: "the site address in the footer
     needs to be bright white") — CARTA.white, not a new hex. Green on paper. */
  const ctaC = dark ? CARTA.white : GREEN;
  const plateC = dark ? CARTA.darkPlate : CARTA.panel;
  /* THE C TREATMENT (Paul, 2026-08-18 — FORMATS §2.0). The first posted card
     read too dark: ambient bloom, unlit figure, black trousers into the band.
     C aims the bloom at the figure's torso and lifts the figure 1.16/1.05 in
     the RENDERER (the asset is never touched, so light grounds inherit no
     lift). `pop: false` returns the original ambient numbers, unlifted. */
  const pop = dark && post.pop !== false;
  /* Figure geometry: content right edge 978 (1080−46−56); figure width from
     the cutout's aspect at the 834px φ height; top = 46+52+30+55+100 = 283;
     centre-y at 45% of the figure. */
  const figW = Math.round(834 * figAspect);
  const bx = Math.round(978 - figW / 2), by = Math.round(283 + 834 * 0.45);
  const bloom = dark && post.bloom !== false
    ? (pop
      ? `<div class="lay" style="background:radial-gradient(ellipse 600px 860px at ${bx}px ${by}px, rgba(10,122,88,0.52) 0%, rgba(10,122,88,0.213) 42%, transparent 85%)"></div>`
      : `<div class="lay" style="background:radial-gradient(ellipse 760px 980px at 76% 58%, rgba(10,122,88,0.34) 0%, rgba(10,122,88,0.14) 42%, transparent 72%)"></div>`)
    : '';
  const figFilter = pop ? 'filter:brightness(1.16) contrast(1.05);' : '';
  const points = (post.points ?? []).map((p, i) =>
    `<li><span class="fn" style="color:${accC};border-color:${seamC};background:${plateC}">${i + 1}</span><div style="color:${subC}"><b style="color:${inkC}">${esc(p.k)}</b> ${esc(p.v)}</div></li>`).join('');
  return `<div class="card fig-card" style="background:${dark ? DARK : WARM};color:${inkC}">
    ${bloom}
    <div class="fframe" style="border-color:${seamC}"><i class="hdl" style="background:${inkC};left:-4px;top:-4px"></i><i class="hdl" style="background:${inkC};right:-4px;top:-4px"></i><i class="hdl" style="background:${inkC};left:-4px;bottom:-4px"></i><i class="hdl" style="background:${inkC};right:-4px;bottom:-4px"></i></div>
    <div class="fpad">
      <div class="ftop"><div class="fkick" style="color:${accC}"><span class="fsq" style="background:${accC}"></span>${esc(post.kicker ?? '')}</div><img src="${logoSrc}" style="height:30px;width:auto;display:block"></div>
      <div class="fflow">
        <img class="ffig" src="${FIG}" style="shape-outside:url(${FIG});${figFilter}">
        <div class="fhook" style="color:${inkC}">${esc(post.hook)}</div>
        ${post.body ? `<div class="flede" style="color:${subC}">${esc(post.body)}</div>` : ''}
        <div class="frule" style="background:${accC}"></div>
        ${points ? `<ol class="fpoints">${points}</ol>` : ''}
        ${post.note ? `<div class="fnote" style="color:${dark ? CARTA.darkMuted : CARTA.muted}">${esc(post.note)}</div>` : ''}
      </div>
      <div class="ffoot" style="border-color:${seamC}">
        <img class="fface" src="${HEAD}" style="border-color:${plateC}">
        <div class="fwho"><b style="color:${inkC}">${esc(name)}</b><span style="color:${dark ? CARTA.darkMuted : CARTA.muted}">${esc(title)}</span></div>
        <span class="fcta" style="color:${ctaC}">${esc(post.cta ?? 'smbx.ai  →')}</span>
      </div>
    </div>
  </div>`;
}

/* ── one card (dark|light), the preserved split composition ───────────── */
function card(dark: boolean): string {
  if (LAYOUT === 'figure') return figureCard(dark);
  const colBg = `background:${dark ? DARK : WARM}`;
  /* NO GLAZE. Both of these were atmosphere over the Ledger boardroom texture
     — a jade bloom and a vertical darkening on the block, a whisper of green on
     the bone. Carta deleted the whole atmosphere layer: the band is a flat
     colour and the paper is white, and a radial wash over either just produces
     a slightly different flat colour while adding a transparency group the
     renderer-proof law forbids. The element stays (one empty div is cheaper
     than restructuring the card) and paints nothing. */
  const glaze = 'none';
  const inkC = dark ? IVORY : INK, subC = dark ? IVORY_SUB : BODY;
  const numC = dark ? MINT : GREEN, ctaC = dark ? MINT : GREEN, logoImg = dark ? LOGO_W : LOGO;
  /* Flat seam, not a translucent one — see the renderer-proof law. */
  const footBorder = dark ? CARTA.darkSeam : HAIR;
  const pad = PHOTO ? '66px 60px 46px' : '84px 92px 56px';
  const numLabel = post.numeralLabel ? esc(post.numeralLabel).replace(/\n/g, '<br>') : 'open<br>seats';

  const seats = post.numeral
    ? `<div class="seats"><span class="num" style="color:${numC}">${esc(post.numeral)}</span><span class="numlab" style="color:${subC}">${numLabel}</span></div>`
    : '';
  const body = post.body ? `<div class="body" style="color:${subC}">${esc(post.body)}</div>` : '';
  const invite = post.invite ? `<div class="emph" style="color:${inkC}">${esc(post.invite)}</div>` : '';
  const cta = post.cta ? `<div class="cta" style="color:${ctaC}">${esc(post.cta)}</div>` : '';
  const kick = post.kicker ? `<span class="kick">${esc(post.kicker)}</span>` : '<span></span>';
  const photo = PHOTO
    ? `<div class="photo"><img src="${PHOTO}" alt=""><div class="vgrad"></div></div>`
    : '';

  return `<div class="card" style="color:${inkC}">
    <div class="col${dark ? ' dark' : ''}" style="${colBg}">
      <div class="glaze" style="background:${glaze}"></div>
      <div class="pad" style="padding:${pad}">
        <div class="top"><img src="${logoImg}" style="height:38px;width:auto;display:block">${kick}</div>
        <div class="mid">
          ${seats}
          <div class="hook" style="color:${inkC}">${esc(post.hook)}</div>
          <div class="rule"></div>
          ${body}
          ${invite}
          ${cta}
        </div>
        <div class="foot" style="border-top:1px solid ${footBorder}">
          <div class="who"><div class="n" style="color:${inkC}">${esc(name)}</div><div class="t" style="color:${subC}">${esc(title)}</div></div>
          <img class="logo" src="${logoImg}" style="height:32px;width:auto;display:block">
        </div>
      </div>
    </div>
    ${photo}
  </div>`;
}

const CSS = `
  * { margin:0; padding:0; box-sizing:border-box; } img { vertical-align:middle; }
  html, body { width:1080px; }
  .card { width:1080px; height:1350px; position:relative; display:flex; overflow:hidden; font-family:${SANS}; font-variant-numeric:tabular-nums; }
  .col { width:${COLW}px; height:100%; position:relative; flex:none; }
  .glaze { position:absolute; inset:0; }
  .pad { position:absolute; inset:0; display:flex; flex-direction:column; z-index:1; }
  .top { display:flex; align-items:center; justify-content:space-between; }
  .kick { font-family:${MONO}; font-size:17px; letter-spacing:0.16em; color:${GREEN}; font-weight:600; text-transform:uppercase; }
  /* Mint is the accent's value on the band, the way green is its value on
     light — one accent, two grounds. This rule used to hand the dark kicker
     HONEY, amber's on-block value, chosen because amber sat at 3.8:1 on the
     old jade block and could not carry small mono text. Neither colour exists
     any more, and mint clears the small-text floor on the flat band. */
  .col.dark .kick { color:${MINT}; }
  .mid { flex:1; display:flex; flex-direction:column; justify-content:center; }
  .seats { display:flex; align-items:baseline; gap:20px; margin-bottom:26px; }
  .num { font-family:${DISPLAY}; font-weight:545; font-size:124px; line-height:0.86; }
  .numlab { font-family:${MONO}; font-size:18px; letter-spacing:0.1em; text-transform:uppercase; line-height:1.4; }
  .hook { font-family:${DISPLAY}; font-weight:545; font-size:45px; line-height:1.13; letter-spacing:-0.014em; text-wrap:balance; }
  /* Square. Radius is 0 in Carta everywhere except buttons and inputs, and a
     99px pill on a 5px bar is the most visible Ledger tell on the whole card. */
  .rule { width:72px; height:5px; background:${MINT}; margin:30px 0 26px; }
  .body { font-size:23px; line-height:1.5; }
  .emph { margin-top:20px; font-size:23px; line-height:1.5; font-weight:600; }
  .cta { margin-top:30px; font-family:${MONO}; font-size:20px; letter-spacing:0.05em; font-weight:600; }
  .foot { display:flex; align-items:center; gap:16px; padding-top:26px; }
  .who .n { font-size:22px; font-weight:700; letter-spacing:-0.01em; }
  .who .t { margin-top:2px; font-size:16px; }
  .foot .logo { margin-left:auto; }
  .photo { width:${PHOTOW}px; height:100%; position:relative; flex:none; background:${DARK}; }
  .photo img { width:100%; height:100%; object-fit:cover; object-position:${post.imagePos || '50% 42%'}; display:block; }
  /* Recessed-shadow seam: a DARK gradient on the photo's left edge. No light
     element near the join, so nothing can read as a white line, in any renderer. */
  .vgrad { position:absolute; inset:0; background:linear-gradient(90deg, rgba(9,15,13,0.78) 0%, rgba(9,15,13,0.34) 6%, transparent 18%); }

  /* ── figure layout (see figureCard's header for the geometry law) ──── */
  .fig-card { display:block; }
  .lay { position:absolute; inset:0; }
  .fframe { position:absolute; inset:46px; border:1px solid; pointer-events:none; z-index:3; }
  .hdl { position:absolute; width:8px; height:8px; }
  .fpad { position:absolute; inset:46px; padding:52px 56px 44px; display:flex; flex-direction:column; z-index:2; }
  .ftop { display:flex; align-items:center; justify-content:space-between; margin-bottom:55px; }
  .fkick { font-family:${MONO}; font-size:17px; letter-spacing:0.16em; font-weight:600; text-transform:uppercase; display:flex; align-items:center; gap:13px; }
  .fsq { width:8px; height:8px; display:block; flex:none; }
  .fflow { flex:1; position:relative; }
  .ffig { float:right; height:834px; width:auto; margin-top:100px; margin-left:30px; shape-margin:30px; shape-image-threshold:0.45; }
  .fhook { font-family:${DISPLAY}; font-weight:545; font-size:80px; line-height:1.05; letter-spacing:-0.014em; margin-bottom:55px; }
  .flede { font-size:25px; line-height:1.55; margin-bottom:34px; }
  .frule { width:72px; height:5px; margin-bottom:34px; }
  .fpoints { list-style:none; }
  .fpoints li { display:flex; gap:18px; margin-bottom:34px; }
  .fn { font-family:${MONO}; font-size:15px; font-weight:600; border:1px solid; width:34px; height:34px; display:flex; align-items:center; justify-content:center; flex:none; margin-top:4px; }
  .fpoints b { font-weight:600; }
  .fpoints div { font-size:22px; line-height:1.55; }
  .fnote { font-family:${MONO}; font-size:14px; line-height:1.6; }
  .ffoot { display:flex; align-items:center; gap:16px; border-top:1px solid; padding-top:21px; height:92px; position:relative; z-index:2; }
  .fface { width:56px; height:56px; border-radius:50%; object-fit:cover; object-position:50% 22%; border:3px solid; flex:none; }
  .fwho b { display:block; font-size:22px; font-weight:700; letter-spacing:-0.01em; }
  .fwho span { font-size:16px; }
  .fcta { margin-left:auto; font-family:${MONO}; font-size:20px; letter-spacing:0.05em; font-weight:600; }
`;

/* THE PALETTE GUARD. This builder rendered unguarded through the whole Carta
   era, which is exactly how it kept shipping Ledger without anyone noticing —
   the two guarded builders were fine and nobody thought to check the third.
   It reads the rendered document, not the source, because a colour can arrive
   through a function three files away or out of a spec. */
const docFor = (dark: boolean) => {
  const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${cartaFontFaceCss()}</style><style>${CSS}</style></head><body>${card(dark)}</body></html>`;
  assertCarta(doc, `${post.slug ?? 'one-pager'} (${dark ? 'dark' : 'light'})`);
  return doc;
};

/* ── render each mode: PNG + renderer-proof single-image PDF ───────────── */
const variants = post.variants ?? ['dark', 'light'];
const page = await newRenderPage();
try {
  await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
  for (const v of variants) {
    const dark = v === 'dark';
    await page.setContent(docFor(dark), { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.evaluateHandle('document.fonts.ready').catch(() => {});
    await page.evaluate(() => Promise.all(Array.from(document.images).map((im: any) => (im as HTMLImageElement).decode().catch(() => {})))).catch(() => {});
    await new Promise(r => setTimeout(r, 140));
    const png = await page.screenshot({ type: 'png' });
    writeFileSync(path.join(outDir, `${post.slug}-${v}.png`), Buffer.from(png));
    // Wrap the flat PNG into a single-page PDF — one image, no vector object
    // edges, so Preview / LinkedIn have nothing to crack (the renderer-proof law).
    const uri = `data:image/png;base64,${Buffer.from(png).toString('base64')}`;
    const flat = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0}@page{size:1080px 1350px;margin:0}html,body{width:1080px;height:1350px}img{width:1080px;height:1350px;display:block}</style></head><body><img src="${uri}"></body></html>`;
    await page.setContent(flat, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.evaluate(() => Promise.all(Array.from(document.images).map((im: any) => (im as HTMLImageElement).decode().catch(() => {})))).catch(() => {});
    const pdf = await page.pdf({ width: '1080px', height: '1350px', printBackground: true, pageRanges: '1' });
    writeFileSync(path.join(outDir, `${post.slug}-${v}.pdf`), Buffer.from(pdf));
  }
} finally { await page.close().catch(() => {}); }

if (post.caption) writeFileSync(path.join(outDir, `${post.slug}-caption.txt`), post.caption.trim() + '\n');
writeBuildRecord(outDir, 'build-onepager.mts', [
  { label: 'spec', file: specPath },
  { label: 'master', file: path.join(path.dirname(specPath), '..', 'master.md') },
]);
console.log(`✓ ${post.slug}: ${variants.join(' + ')} → ${outDir}/${post.slug}-*.png/.pdf${post.caption ? ' (+ caption)' : ''}`);
console.log(`  photo: ${post.image ? (PHOTO ? post.image : 'NOT FOUND — text-only card') : 'none (text-only card)'}  ·  collateral: ${outDir}`);
process.exit(0);
