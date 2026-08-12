/**
 * Studio one-pager builder — a house-style LinkedIn single-image post from a
 * plain spec, rendered on YOUR computer via Cowork. Sibling to build-deck.mts
 * (carousels); this one owns the single 1080×1350 formats.
 *
 * Why this exists (Paul, 2026-07-22, "make it repeatable and robust"): the
 * availability / statement one-pagers were hand-written throwaway scripts. This
 * turns the format into a fixed, brand-locked template driven by a tiny spec —
 * copy + one image + which modes — so re-running with new numbers is a
 * 30-second job, not a rebuild. Same CARTA design system as the deck builder
 * (palette, Source Serif 4 / Schibsted Grotesk / Plex, the flat band) and the
 * same renderer-proof flat-image PDF, all pure local compute (no app, no API
 * key).
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
 * Layout: a vertical split — copy column (dark boardroom OR light bone) on the
 * left, your photo full-bleed on the right with a recessed-shadow seam (no
 * light line, at any zoom). Omit `image` and the copy fills the whole card.
 *
 * Outputs (into --out, default ./collateral): <slug>-dark.png / -light.png (the
 * postable images), <slug>-dark.pdf / -light.pdf (single-page document form),
 * <slug>-caption.txt (the post copy). Modes default to both; set `variants`.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
const { cartaFontFaceCss } = await import(pathToFileURL(path.join(ROOT, 'server/services/fontEmbeds.ts')).href);
const { newRenderPage } = await import(pathToFileURL(path.join(ROOT, 'server/services/premiumPdfRenderer.ts')).href);
const { assertCarta } = await import(pathToFileURL(path.join(ROOT, 'house/palette-guard.ts')).href);

/* ── house palette — CARTA (2026-08-08) ───────────────────────────────── */
/* THE shared definition — see house/tokens.ts. Never hardcode a hex here.
   There is ONE accent and it is green. The warm is gone: brass and honey have
   no Carta equivalent, so any numeral, bar or kicker that used to be amber is
   now ink with a green bar under it. */
const {
  CARTA, CARTA_TYPE, CARTA_DISPLAY_WEIGHT, CARTA_STAT_BAR, CARTA_KICKER,
  HANDLE_HTML, handleCss, handleColorCss, cartaBand, cartaPage, rgba,
} = await import(pathToFileURL(path.join(ROOT, 'house/tokens.ts')).href);
const INK = CARTA.ink, BODY = CARTA.body, GREEN = CARTA.green;
const WARM = CARTA.bone, DARK = CARTA.dark;
const DARK_INK = CARTA.darkInk, DARK_SUB = CARTA.darkSub, DARK_MUTED = CARTA.darkMuted;
const MUTED = CARTA.muted, HAIR = CARTA.hair, MINT = CARTA.mint, SEAM = CARTA.darkSeam;
const DISPLAY = CARTA_TYPE.display, SANS = CARTA_TYPE.sans, MONO = CARTA_TYPE.mono;
const DW = CARTA_DISPLAY_WEIGHT;

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
  kicker?: string;                          // mono top-right label with a green square, e.g. 'AVAILABILITY'
  numeral?: string;                         // giant ink figure over a green bar, e.g. '2'
  numeralLabel?: string;                    // small mono label beside it ('\n' = line break)
  hook: string;                             // Source Serif 4 headline — use ‑ (U+2011) to glue compounds like buy‑side
  body?: string;                            // supporting paragraph
  invite?: string;                          // bold, warm invitation line
  cta?: string;                             // mono call-to-action, e.g. "Let's talk  →"
  byline?: { name?: string; title?: string };
  image?: string;                           // right-panel photo; omit for a full-width text card
  imagePos?: string;                        // CSS object-position, default '50% 42%'
  /* Per-variant art. The two cards are one artifact, not two — but the block
     and the paper are different surfaces and a photo that carries one can sit
     badly on the other. Either key overrides `image` on that card alone; omit
     both and the single `image` runs on both, which is the common case. */
  imageDark?: string;                       // overrides `image` on the dark card
  imageLight?: string;                      // overrides `image` on the light card
  imagePosDark?: string;                    // overrides `imagePos` on the dark card
  imagePosLight?: string;                   // overrides `imagePos` on the light card
  caption?: string;                         // the LinkedIn post text
  variants?: ('dark' | 'light')[];          // default: both
}

/* ── asset resolution (local-first, same order as build-deck.mts) ─────── */
const { b64, esc, logoImg } = await import(pathToFileURL(path.join(ROOT, 'house/assets.ts')).href);
/* See the note in build-deck.mts: requested art that does not resolve fails
   the build. Omitting `image` entirely is still a real format (the full-width
   text card) and is not affected. */
const MISSING_ART: string[] = [];
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
  if (!hit) { MISSING_ART.push(p); console.warn(`[onepager] image not found: ${p} (looked in ${tries.join(', ')})`); return null; }
  return b64(hit);
};

const LOGO = b64(path.join(ROOT, 'client/public/logo-green-x.png'));
const LOGO_W = b64(path.join(ROOT, 'client/public/logo-green-x-dark.png'));
/* NO TEXTURE. The Carta band is a flat colour — see `cartaBand()`. The Ledger
   block was a composite (blackbleed plaster under a jade glaze under a halo)
   and the whole stack is deleted, not re-pointed: `background: DARK url(tex)`
   ignores the colour, because the image sits above it in the CSS background
   stack, so a re-point renders identically and shows a clean diff. */
const PHOTO = resolveImg(post.image);
const PHOTO_DARK  = post.imageDark  ? resolveImg(post.imageDark)  : PHOTO;
const PHOTO_LIGHT = post.imageLight ? resolveImg(post.imageLight) : PHOTO;

const name = post.byline?.name ?? 'Paul Baker';
const title = post.byline?.title ?? 'Buy-side corporate development';
const COLW = PHOTO ? 610 : 1080;
const PHOTOW = 1080 - COLW;

/* ── one card (dark|light), the approved split composition ────────────── */
function card(dark: boolean): string {
  /* The band is a COLOUR now. Nothing else. */
  const colBg = dark ? `background:${cartaBand()}` : `background:${cartaPage()}`;
  const inkC = dark ? DARK_INK : INK, subC = dark ? DARK_SUB : BODY;
  /* The numeral is INK, and the accent is the 4×52 bar underneath it — the
     live site's About-page proof trio. Ledger put the colour IN the numeral
     (honey on the block, green on paper); Carta puts the numeral in the
     reading ink and lets one green bar do the accent work for the whole page.
     On the band the bar is MINT: Deal Green on #131512 is a 1.9:1 mark and
     reads as a dark smudge, and an invisible accent is indistinguishable from
     a page that never converted (design-check.mts §the light-override law). */
  const barC = dark ? MINT : GREEN, ctaC = dark ? MINT : GREEN, logoImg = dark ? LOGO_W : LOGO;
  const kickC = dark ? DARK_MUTED : MUTED;
  const footBorder = dark ? SEAM : HAIR;
  const frameC = dark ? SEAM : CARTA.chipBorder;
  const handleC = dark ? DARK_INK : INK;
  const photoSrc = dark ? PHOTO_DARK : PHOTO_LIGHT;
  const photoPos = (dark ? post.imagePosDark : post.imagePosLight) || post.imagePos || '50% 42%';
  const pad = photoSrc ? '66px 60px 46px' : '84px 92px 56px';
  const numLabel = post.numeralLabel ? esc(post.numeralLabel).replace(/\n/g, '<br>') : 'open<br>seats';

  const seats = post.numeral
    ? `<div class="seats"><div class="numwrap"><span class="num" style="color:${inkC}">${esc(post.numeral)}</span><span class="statbar" style="background:${barC}"></span></div><span class="numlab" style="color:${subC}">${numLabel}</span></div>`
    : '';
  const body = post.body ? `<div class="body" style="color:${subC}">${esc(post.body)}</div>` : '';
  const invite = post.invite ? `<div class="emph" style="color:${inkC}">${esc(post.invite)}</div>` : '';
  const cta = post.cta ? `<div class="cta" style="color:${ctaC}">${esc(post.cta)}</div>` : '';
  /* The kicker mark: an 8px GREEN square, then the label in muted mono. The
     square is the accent; the words are not. On the band the label steps to
     darkMuted and the square stays green — it is a mark, not type. */
  const kick = post.kicker
    ? `<span class="kick" style="color:${kickC}"><i class="kicksq"></i>${esc(post.kicker)}</span>`
    : '<span></span>';
  const photo = photoSrc
    ? `<div class="photo"><img src="${photoSrc}" alt="" style="object-position:${photoPos}"><div class="vgrad"></div></div>`
    : '';

  return `<div class="card ${dark ? 'dk' : 'lt'}" style="color:${inkC}">
    <div class="col" style="${colBg}">
      <div class="frame" style="border-color:${frameC}">${HANDLE_HTML}</div>
      <div class="pad" style="padding:${pad}">
        <div class="top"><img src="${logoImg}" style="height:38px;width:auto;display:block">${kick}</div>
        <div class="mid">
          ${seats}
          <div class="hook" style="color:${inkC}">${esc(post.hook)}</div>
          <div class="rule" style="background:${barC}"></div>
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
  .kick { display:inline-flex; align-items:center; gap:10px; font-family:${MONO}; font-size:17px; letter-spacing:${CARTA_KICKER.tracking}; font-weight:500; text-transform:uppercase; }
  .kicksq { width:${CARTA_KICKER.square}px; height:${CARTA_KICKER.square}px; background:${GREEN}; display:block; flex:none; }
  .mid { flex:1; display:flex; flex-direction:column; justify-content:center; }
  .seats { display:flex; align-items:flex-end; gap:24px; margin-bottom:30px; }
  .numwrap { display:flex; flex-direction:column; align-items:flex-start; }
  .num { font-family:${DISPLAY}; font-weight:${DW}; font-size:124px; line-height:0.86; }
  /* The stat bar. 4×52, ten below the numeral — the site's proof trio, not a
     value picked to look right here. */
  .statbar { display:block; width:${CARTA_STAT_BAR.width}px; height:${CARTA_STAT_BAR.height}px; margin-top:${CARTA_STAT_BAR.gap}px; }
  .numlab { font-family:${MONO}; font-size:18px; letter-spacing:0.1em; text-transform:uppercase; line-height:1.4; padding-bottom:4px; }
  .hook { font-family:${DISPLAY}; font-weight:${DW}; font-size:45px; line-height:1.13; letter-spacing:-0.014em; text-wrap:balance; }
  /* SQUARE. Radius 0 everywhere except buttons and inputs — a rounded pill is
     the loudest tell that a surface did not convert. */
  .rule { width:72px; height:4px; margin:30px 0 26px; }
  .body { font-size:23px; line-height:1.5; }
  .emph { margin-top:20px; font-size:23px; line-height:1.5; font-weight:600; }
  .cta { margin-top:30px; font-family:${MONO}; font-size:20px; letter-spacing:0.05em; font-weight:600; }
  /* The COVER PANEL: an inset hairline frame wearing the four corner handles —
     the house gesture that replaced Ledger's curved crests. It brackets the
     copy column only. Run across the whole card it crosses the photograph and
     reads as a stray box; the panel is the framed thing, not the page.

     The handles sit at -4px, OUTSIDE the frame, so neither the frame nor the
     column may carry overflow:hidden — that shears them off silently. */
  .frame { position:absolute; inset:30px; border:1px solid; z-index:2; pointer-events:none; }
  ${handleCss()}
  ${handleColorCss('.card.dk', DARK_INK)}
  ${handleColorCss('.card.lt', INK)}
  .foot { display:flex; align-items:center; gap:16px; padding-top:26px; }
  .who .n { font-size:22px; font-weight:700; letter-spacing:-0.01em; }
  .who .t { margin-top:2px; font-size:16px; }
  .foot .logo { margin-left:auto; }
  .photo { width:${PHOTOW}px; height:100%; position:relative; flex:none; background:${DARK}; }
  .photo img { width:100%; height:100%; object-fit:cover; object-position:${post.imagePos || '50% 42%'}; display:block; }
  /* Recessed-shadow seam: an INK gradient on the photo's left edge. No light
     element near the join, so nothing can read as a white line, in any renderer.

     This is a SHADOW and must stay a neutral dark on BOTH variants — it is not
     the band. It used the retired palette's band token until 2026-08-03, which
     was right while that token meant a near-black. Aurora redefined it as the jade block
     without sweeping its consumers, so the seam began painting the leftmost 18%
     of the photo in saturated green — invisible on the dark card and a green
     wash across the photo on the light one.

     NEITHER THE HEX NOR THE RETIRED PALETTE'S NAME IS WRITTEN HERE. This comment lives inside the
     CSS template literal, so every word of it ships inside the rendered
     document — and the palette guard reads the document. A retired hex quoted
     in a comment is a retired hex in the artifact, and the guard is right to
     fail it. Name the system, not the value; DESIGN.md §2 holds the hexes. Under Carta the two
     tokens are near-identical darks again, which makes this exactly the kind of
     bug that will not show up until the next palette move: keep it on INK,
     which is the SHADOW, not on DARK, which is the rhythm break. */
  .vgrad { position:absolute; inset:0; background:linear-gradient(90deg, ${rgba(CARTA.ink, 0.92)} 0%, ${rgba(CARTA.ink, 0.5)} 6%, transparent 18%); }
`;

const docFor = (dark: boolean) =>
  `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${cartaFontFaceCss()}</style><style>${CSS}</style></head><body>${card(dark)}</body></html>`;

/* ── render each mode: PNG + renderer-proof single-image PDF ───────────── */
const variants = post.variants ?? ['dark', 'light'];
const page = await newRenderPage();
try {
  await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
  for (const v of variants) {
    const dark = v === 'dark';
    /* THE PALETTE GUARD — see house/palette-guard.ts. Before Chromium sees it. */
    assertCarta(docFor(dark), `${post.slug} (${v} card)`);
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
console.log(`✓ ${post.slug}: ${variants.join(' + ')} → ${outDir}/${post.slug}-*.png/.pdf${post.caption ? ' (+ caption)' : ''}`);
const shot = (label: string, want?: string, got?: string | null) =>
  want ? `${label} ${got ? want : `${want} NOT FOUND`}` : '';
const photoReport = (post.imageDark || post.imageLight)
  ? [shot('dark:', post.imageDark ?? post.image, PHOTO_DARK),
     shot('light:', post.imageLight ?? post.image, PHOTO_LIGHT)].filter(Boolean).join('  ·  ')
  : (post.image ? (PHOTO ? post.image : 'NOT FOUND — text-only card') : 'none (text-only card)');
console.log(`  photo: ${photoReport}  ·  collateral: ${outDir}`);

/* ── the art guard ─────────────────────────────────────────────────────────
   Requested art that did not resolve fails the build. This prints AFTER the
   success line so it is the last thing on screen, and exits 3 so a script
   cannot mistake it for a clean run. */
if (MISSING_ART.length && !args.includes('--allow-missing-art')) {
  const missing = [...new Set(MISSING_ART)];   // both bookends resolve the same file
  console.error(`\n✗ ${missing.length} image(s) the spec asked for could not be found:`);
  missing.forEach(p => console.error(`    ${p}`));
  console.error(`\nThe pages that wanted them rendered WITHOUT art. Nothing above is postable.`);
  console.error(`Put the files where the resolver looks, or remove the image key from the spec.`);
  console.error(`--allow-missing-art overrides this for a deliberate dry run.\n`);
  process.exit(3);
}

process.exit(0);
