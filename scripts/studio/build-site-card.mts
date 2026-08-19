/**
 * THE SITE LINK-PREVIEW CARD — built for the CROP, not for the mockup.
 *
 * Paul, 2026-08-19, with a screenshot of his own LinkedIn comment: *"we need to
 * fix whatever this is called. it not legible at all on mobile and not much
 * better on desktop since linkedin's columns is narrow even on desktop."*
 *
 * WHAT IS ACTUALLY WRONG, because it is not "the type is too small". A card is
 * authored at 1200×630 (1.91:1) and reviewed at that size, where it looks
 * fine. Almost nowhere renders it at that size:
 *
 *   · LinkedIn COMMENT preview  — a small thumbnail, roughly 1.3:1 on a phone
 *     and 1.6:1 on desktop, `object-fit: cover`, so it CENTRE-CROPS the sides.
 *   · Slack / iMessage / WhatsApp — frequently a 1:1 square.
 *   · LinkedIn POST preview      — the full 1.91:1, the only place the whole
 *                                  card is ever seen.
 *
 * The previous card was composed left-aligned across the full 1200, so every
 * one of those crops sliced the first letter off the wordmark AND off the
 * headline — "mbX.ai … uying a business is hard work" is what a reader saw.
 * Nothing about it looks wrong in the source file, which is exactly why it
 * shipped and stayed.
 *
 * THE RULE THIS FILE ENFORCES: **everything that carries meaning lives inside
 * the centre square.** A 1200×630 image cropped to any ratio between 1:1 and
 * 1.91:1 always keeps the centre 630×630, so a composition that fits there
 * survives every surface intact. The flanks carry ground and glow only —
 * things that lose nothing when they are cut.
 *
 * THE SECOND RULE: at a 90pt-wide phone thumbnail the card is downscaled ~7×,
 * so it can hold a MARK and about six words. Not a sentence, not a stat, not a
 * byline. The og:title beside the image already carries the words; the picture
 * carries recognition.
 *
 * --proof renders the contact sheet that proves both — the new card and the
 * one it replaces, cropped at the real ratios and shown at the real display
 * sizes. Look at that file, never at the 1200px render, before shipping.
 *
 * Usage:
 *   npx tsx scripts/studio/build-site-card.mts            # → client/public
 *   npx tsx scripts/studio/build-site-card.mts --proof    # + the crop sheet
 *   npx tsx scripts/studio/build-site-card.mts --line "Buy-side M&A — we run the process."
 *
 * A COPY CHANGE NEEDS A NEW --name. LinkedIn caches an OG image by URL: new
 * bytes at the old URL keep showing the old picture for weeks. Ship a new
 * filename and point index.html at it (server/index.ts carries the same name
 * as the report fallback — move both).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
const imp = (rel: string) => import(pathToFileURL(path.join(ROOT, rel)).href);
const { cartaFontFaceCss } = await imp('server/services/fontEmbeds.ts');
const { assertCarta } = await imp('house/palette-guard.ts');
const { newRenderPage } = await imp('server/services/premiumPdfRenderer.ts');
const { CARTA, CARTA_TYPE, CARTA_DISPLAY_WEIGHT } = await imp('house/tokens.ts');

/* ── CLI ──────────────────────────────────────────────────────────────── */
const args = process.argv.slice(2);
const flag = (n: string, d = '') => { const i = args.indexOf(n); return i >= 0 ? (args[i + 1] ?? d) : d; };
const has = (n: string) => args.includes(n);

/* Paul's own line, from the reference card he sent. `|` forces a break and
   every forced line is then set NOWRAP and auto-fitted, so a line can never
   silently re-wrap into a shape nobody chose — which is how the first render
   put the em dash alone at the head of line 2. Left as one run with no `|`,
   the browser balances it. The dash became a full stop for the same reason:
   at three lines "— we run" opened a line on a dash, and a dash is not a word. */
const LINE = flag('--line', 'Buy-side M&A.|We run the process.');
const NAME = flag('--name', 'site-card-v3');
const OUT = flag('--out') ? path.resolve(flag('--out')) : path.join(ROOT, 'client/public');
/* The proof sheet is a working file, not an asset — it defaults OUT of the
   published folder so a review render can never ship as part of the site. */
const PROOF_OUT = flag('--proof-out') ? path.resolve(flag('--proof-out')) : tmpdir();
mkdirSync(OUT, { recursive: true });

/* rgba() is invisible to the palette guard (it matches HEX substrings), so a
   transcribed decimal triple would silently keep an OLD colour if the token
   ever moved — the exact drift the guard exists to catch. Every translucent
   stop is therefore DERIVED from the token at render time. */
const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

const W = 1200, H = 630;
/** The safe square. Any crop from 1:1 to 1.91:1 keeps every pixel of it. */
const SAFE = H;                       // 630
const PAD = 40;                       // breathing room inside the square
const BOX = SAFE - PAD * 2;           // 550 — the real measure for type

/* ── the wordmark, trimmed to its INK ─────────────────────────────────────
   `/logo-green-x-dark.png` is 1584×396 carrying ~13% TRANSPARENT padding on
   each side, so sizing the FILE to 420px puts only ~309px of mark on the
   page — a fifth smaller than it measures, and off-centre the moment the
   padding is ever asymmetric. The bbox is measured in the page (the same
   lesson the nav logo taught: measure the ink, not the box) and the mark is
   sized from that. */
const LOGO_SRC = `data:image/png;base64,${readFileSync(path.join(ROOT, 'client/public/logo-green-x-dark.png')).toString('base64')}`;

const probe = await newRenderPage();
let ink: { x: number; y: number; w: number; h: number; sw: number; sh: number };
try {
  ink = await probe.evaluate(async (src: string) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
      if (d[(y * c.width + x) * 4 + 3] > 8) {
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
    return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1, sw: c.width, sh: c.height };
  }, LOGO_SRC);
} finally { await probe.close(); }
/* A re-exported logo with an empty layer returns x1 = -1, the negative extents
   cancel through the sprite math, and the card ships with a BLANK where the
   wordmark belongs — nothing throws and the checkmark prints. Refuse instead. */
if (ink.w <= 0 || ink.h <= 0) {
  console.error(`✗ logo-green-x-dark.png contains no ink above the alpha threshold — refusing to render a markless card`);
  process.exit(1);
}

const MARK_W = 470;                                   // ink width on the card
const scale = MARK_W / ink.w;
const markH = Math.round(ink.h * scale);

/* ── type ─────────────────────────────────────────────────────────────────
   Schibsted at 700, not Source Serif. CARTA's display face is the serif and
   it stays the serif everywhere the reader has a full page; at a 90pt
   thumbnail a serif's modulation and brackets are the first things to go, and
   what survives a 7× downscale is stroke weight. `--face serif` renders the
   site's own H1 treatment for comparison — look at the proof sheet, not at
   the principle. */
/* --line is user copy going into markup: unescaped, "<a million in EBITDA"
   opens an anchor TAG and silently swallows the rest of the line — and the
   default copy's own "M&A." was leaning on browser error-recovery. Escaped
   here once, at the boundary. */
const escHtml = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const SERIF = has('--face') && flag('--face') === 'serif';
/* The safe square can be DRAWN (hairlines + a whisper of fill) so the wide
   card reads as a centre panel. Off by default: the seams land on the crop
   line, so they buy structure in the one place the card is already fine and
   read as an accident in the flanks. --panel to see it. */
const PANEL = has('--panel');
const plain = LINE.replace(/\|/g, ' ');
const SIZE = plain.length > 46 ? 54 : plain.length > 34 ? 60 : plain.length > 22 ? 68 : 80;

const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${cartaFontFaceCss()}</style>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: ${W}px; height: ${H}px; overflow: hidden; }
  .card {
    position: relative; width: ${W}px; height: ${H}px; overflow: hidden;
    background: ${CARTA.dark};
    font-family: ${CARTA_TYPE.sans};
  }
  /* Paul's reference: green in the top-left corner falling away to near-black.
     It is ground, not information — the crop takes whatever it likes from it
     and the card is unharmed. Every stop derives from CARTA.green/mint via
     rgba() above; note the guard itself could not police these (it detects
     RETIRED hexes only, and only in hex form) — derivation is the protection. */
  .card::before {
    content: ''; position: absolute; inset: 0;
    background:
      radial-gradient(115% 130% at -6% -14%, ${CARTA.green} 0%, ${rgba(CARTA.green, 0.55)} 26%, ${rgba(CARTA.green, 0)} 62%),
      radial-gradient(60% 70% at 108% 118%, ${rgba(CARTA.mint, 0.10)}, ${rgba(CARTA.mint, 0)} 60%);
  }
  /* The safe square, made visible as structure rather than left as an empty
     middle: two hairlines land exactly ON the 1:1 crop line, so at full size
     the card reads as a centred panel and in the square they are the edge. */
  .safe {
    position: absolute; top: 0; left: 50%; transform: translateX(-50%);
    width: ${SAFE}px; height: ${H}px;
    ${PANEL ? `border-left: 1px solid ${CARTA.darkSeam}; border-right: 1px solid ${CARTA.darkSeam};
    background: ${rgba(CARTA.white, 0.022)};` : ''}
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: ${PAD}px; gap: 30px;
  }
  /* sprite-trim: the wrapper is the INK box, the image is scaled and pulled so
     only the ink shows. */
  .mark { position: relative; overflow: hidden; width: ${MARK_W}px; height: ${markH}px; flex: none; }
  .mark img {
    position: absolute; width: ${Math.round(ink.sw * scale)}px; height: ${Math.round(ink.sh * scale)}px;
    left: ${-Math.round(ink.x * scale)}px; top: ${-Math.round(ink.y * scale)}px;
  }
  .rule { width: 84px; height: 3px; background: ${CARTA.mint}; flex: none; }
  h1 {
    font-family: ${SERIF ? CARTA_TYPE.display : CARTA_TYPE.sans};
    font-weight: ${SERIF ? CARTA_DISPLAY_WEIGHT : 700};
    font-size: ${SIZE}px; line-height: 1.14; letter-spacing: -0.02em;
    color: ${CARTA.darkInk}; text-align: center; text-wrap: balance;
    max-width: ${BOX}px;
  }
  h1 .ln { display: block; white-space: nowrap; }
</style></head><body>
  <div class="card">
    <div class="safe">
      <div class="mark"><img src="${LOGO_SRC}"></div>
      <div class="rule"></div>
      <h1>${LINE.includes('|')
        ? LINE.split('|').map(s => `<span class="ln">${escHtml(s.trim())}</span>`).join('')
        : escHtml(plain)}</h1>
    </div>
  </div>
</body></html>`;

assertCarta(html, 'site-card');

const page = await newRenderPage();
let buf: Buffer;
try {
  /* deviceScaleFactor 2 → the file is 2400×1260. LinkedIn re-encodes every
     OG image through its media proxy and the inspector/retina feeds display it
     upscaled — a 1200px source came back visibly blurry (Paul, 2026-08-19,
     from the Post Inspector). The 2× master survives the round trip sharp;
     og:image:width/height in index.html state the FILE's pixels, so they move
     with this. */
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 });
  /* `load` + fonts.ready, NOT networkidle0: every byte here is inlined, so
     there is no network to go idle — on a machine without egress the idle
     watcher simply times out and the build dies with nothing wrong. What
     actually has to finish is the FONTS, and that has its own promise. */
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => (document as any).fonts.ready);
  /* AUTO-FIT. A forced line is nowrap, so an over-long one would run out of
     the safe square and be cropped by the very surface this file exists to
     survive — the failure would be silent and would look like a design choice.
     Shrink until the widest line fits the measure, and report what it took. */
  /* No inner arrow/function expressions in here: tsx compiles with keepNames,
     which wraps a named function in `__name(...)` — a helper that exists in the
     BUILD, never in the page, so the evaluate dies with "__name is not
     defined". Plain loops only.

     Both axes are checked. Width: each .ln is a BLOCK, so its rect is the
     h1's width whatever the text does — scrollWidth is the content (the first
     render measured the box, believed it, and let a line run 90px past the
     crop line). Height: the width fit alone lets enough forced lines run out
     of the 630px frame with every individual line passing. And the result is
     RETURNED and judged, because a fit that hits its 24px floor still
     overflowing must fail the build — the overflow gets cropped by the very
     surfaces this file exists to survive, and it looks like a design choice. */
  const fit = await page.evaluate((box: number, availH: number) => {
    const h1 = document.querySelector('h1') as HTMLElement;
    const safe = document.querySelector('.safe') as HTMLElement;
    const lines = Array.from(h1.querySelectorAll('.ln')) as HTMLElement[];
    let size = parseFloat(getComputedStyle(h1).fontSize);
    const gap = parseFloat(getComputedStyle(safe).rowGap) || 0;
    for (;;) {
      let w = h1.scrollWidth <= box ? 0 : h1.scrollWidth;
      for (const l of lines) { const r = l.scrollWidth; if (r > w) w = r; }
      let stack = 0, kids = 0;
      for (const k of Array.from(safe.children) as HTMLElement[]) { stack += k.getBoundingClientRect().height; kids++; }
      stack += gap * (kids - 1);
      if ((w <= box && stack <= availH) || size <= 24) return { size, widest: w, stack };
      size -= 1;
      h1.style.fontSize = size + 'px';
    }
  }, BOX, SAFE - PAD * 2);
  if (fit.widest > BOX || fit.stack > SAFE - PAD * 2) {
    console.error(`✗ copy does not fit the centre square even at the ${fit.size}px floor — widest line ${Math.round(fit.widest)}px vs ${BOX}px, stack ${Math.round(fit.stack)}px vs ${SAFE - PAD * 2}px. Shorten the --line; the overflow would be cropped on every non-1.91:1 surface.`);
    process.exit(1);
  }
  if (fit.size !== SIZE) console.log(`  · line fitted ${SIZE}px → ${fit.size}px to hold the ${BOX}px measure`);
  buf = Buffer.from(await page.screenshot({ type: 'png' }));
  writeFileSync(path.join(OUT, `${NAME}.png`), buf);
  console.log(`✓ ${NAME}.png  ${W}×${H}  (${Math.round(buf.length / 1024)}KB) → ${OUT}`);
} finally { await page.close(); }

/* ── the proof sheet ──────────────────────────────────────────────────────
   The only review that means anything. Every box below is a real surface at
   its real display size, cropped the way that surface crops. The card it
   replaces sits beside it, because "better" is a comparison. */
if (has('--proof')) {
  /* The baseline is whatever index.html is LIVE with, read from its og:image
     tag — hard-coding site-card.png here would judge the next iteration
     against a two-generations-old card under a header claiming otherwise. If
     the live card IS this build (a re-render), fall back to the prior
     generation so the comparison still compares something. */
  const shellHtml = readFileSync(path.join(ROOT, 'client/index.html'), 'utf8');
  const liveName = shellHtml.match(/property="og:image" content="[^"]*\/([^/"]+)"/)?.[1] || 'site-card.png';
  const candidates = [liveName, 'site-card.png'].filter(n => n !== `${NAME}.png`);
  let baseName = '', basePath = '';
  for (const n of candidates) {
    const c = path.join(ROOT, 'client/public', n);
    if (existsSync(c)) { baseName = n; basePath = c; break; }
  }
  if (!basePath) { console.error(`✗ --proof: no baseline card found (looked for ${candidates.join(', ')} in client/public)`); process.exit(1); }
  const OLD = `data:image/png;base64,${readFileSync(basePath).toString('base64')}`;
  const NEW = `data:image/png;base64,${buf.toString('base64')}`;

  /* label · display width (CSS px, as the surface renders it) · aspect.
     The first three are measured real renders. The 1:1 row is a FLOOR, not
     the typical render — Slack and iMessage show a summary_large_image
     1200×630 at full aspect; a square centre-crop is the small-thumbnail
     fallback (compact unfurls, WhatsApp). It stays on the sheet because it is
     the harshest crop any surface applies, and a card that reads there reads
     everywhere — but it must not be labeled as what Slack normally does. */
  const SURFACES: Array<[string, number, number]> = [
    ['LinkedIn post preview · 1.91:1', 552, 1.91],
    ['LinkedIn comment, desktop · ~1.6:1', 171, 1.6],
    ['LinkedIn comment, phone · ~1.3:1', 90, 1.3],
    ['Square thumbnail floor · 1:1 (compact unfurls; harshest crop)', 128, 1],
  ];
  const col = (src: string) => SURFACES.map(([l, w, r]) => `
    <div class="s">
      <div class="lab">${l}</div>
      <div class="crop" style="width:${w}px;height:${Math.round(w / r)}px"><img src="${src}"></div>
    </div>`).join('');

  const sheet = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${cartaFontFaceCss()}</style>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { width: 1360px; background: ${CARTA.bone}; font-family: ${CARTA_TYPE.sans}; padding: 40px 44px 52px; }
    h2 { font-family:${CARTA_TYPE.display}; font-weight:550; font-size:26px; color:${CARTA.ink}; letter-spacing:-0.01em; }
    .sub { font-size:14px; color:${CARTA.body}; margin-top:8px; max-width:900px; line-height:1.5; }
    .cols { display:grid; grid-template-columns:1fr 1fr; gap:40px; margin-top:34px; }
    .head { font-family:${CARTA_TYPE.mono}; font-size:12px; letter-spacing:0.14em; text-transform:uppercase;
            color:${CARTA.muted}; padding-bottom:10px; border-bottom:1px solid ${CARTA.hair}; margin-bottom:22px; }
    .s { margin-bottom:26px; }
    .lab { font-family:${CARTA_TYPE.mono}; font-size:11px; letter-spacing:0.08em; color:${CARTA.muted}; margin-bottom:7px; }
    .crop { overflow:hidden; border:1px solid ${CARTA.hair}; }
    .crop img { width:100%; height:100%; object-fit:cover; object-position:50% 50%; display:block; }
  </style></head><body>
    <h2>What the link preview actually looks like</h2>
    <div class="sub">Each box is the surface's real display size and its real crop. Everything narrower than
    1.91:1 centre-crops the sides, which is the whole defect: composition that runs the full width loses its
    first and last letters everywhere except the post preview.</div>
    <div class="cols">
      <div><div class="head">Now — ${baseName}</div>${col(OLD)}</div>
      <div><div class="head">New — ${NAME}.png</div>${col(NEW)}</div>
    </div>
  </body></html>`;

  const p2 = await newRenderPage();
  try {
    await p2.setViewport({ width: 1360, height: 1200, deviceScaleFactor: 2 });
    await p2.setContent(sheet, { waitUntil: 'load' });
    await p2.evaluate(() => (document as any).fonts.ready);
    const pb = Buffer.from(await p2.screenshot({ type: 'png', fullPage: true }));
    mkdirSync(PROOF_OUT, { recursive: true });
    const pp = path.join(PROOF_OUT, `${NAME}-proof.png`);
    writeFileSync(pp, pb);
    console.log(`✓ ${NAME}-proof.png → ${pp}`);
  } finally { await p2.close(); }
}

/* The renderer holds a singleton browser; a CLI that leaves it open never exits. */
await (await imp('server/services/premiumPdfRenderer.ts')).getBrowser().then((b: any) => b.close()).catch(() => {});
process.exit(0);
