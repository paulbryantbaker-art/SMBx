/**
 * Studio report builder — a house-style, multi-page PDF REPORT from a plain
 * markdown file. Sibling to build-deck.mts (carousels) and build-onepager.mts
 * (single-image posts); this one owns long-form research reports.
 *
 * Why (Paul, 2026-07-23): some research is a full report, not a carousel — and
 * it must keep 100% fidelity. This renders any markdown (headings, tables,
 * lists, bold/em) into the Ledger language: bone canvas, Fraunces display, Inter
 * body, IBM Plex Mono labels, brass part-rules, hairline tables, a dark
 * boardroom cover, and page numbers. Pure local Chromium — no app, no API key.
 *
 * Usage:
 *   npx tsx scripts/studio/build-report.mts <report.md> [--out <dir>] [--slug <name>] [--eyebrow "MARKET ASSESSMENT"]
 *
 * Convention: everything before the FIRST horizontal rule (`---`) becomes the
 * dark cover page (lead with a single `# Title`); everything after flows as the
 * body. Each top-level `#` heading starts a new page (parts); `##`/`###` are
 * sections/subsections. GFM tables render as hairline tables. Output: <slug>.pdf.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { writeBuildRecord } from './build-record.mts';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
const { cartaFontFaceCss } = await import(pathToFileURL(path.join(ROOT, 'server/services/fontEmbeds.ts')).href);
const { newRenderPage } = await import(pathToFileURL(path.join(ROOT, 'server/services/premiumPdfRenderer.ts')).href);
const { assertCarta } = await import(pathToFileURL(path.join(ROOT, 'house/palette-guard.ts')).href);
const { marked } = await import('marked');

/* ── house palette — THE shared definition, see house/tokens.ts ───────── */
const { CARTA, REPORT, CARTA_TYPE, CARTA_DISPLAY_WEIGHT, CARTA_CONTROL_RADIUS, CARTA_HANDLE, HANDLE_HTML, handleCss, handleColorCss, rgba, flatten, cartaBand } = await import(pathToFileURL(path.join(ROOT, 'house/tokens.ts')).href);
const INK = CARTA.ink, BODY = REPORT.body, TERT = CARTA.muted, GREEN = CARTA.green;
const WARM = CARTA.bone, DARK = CARTA.dark;
/* THE COVER IS THE CARTA BAND — flat #131512. No texture, no glaze, no bloom.
   Paul retired the saturated green field on 2026-08-06 because it fought the
   skin tones in his headshot; Carta takes the near-black the rest of the way
   and drops the atmosphere with it.

   REPORT.body #3F464C stays as it was. Long-form reading wants more contrast
   than a slide glanced at for two seconds, and the site's own report pages use
   that exact ink. It is the one Ledger-era value the Carta pass keeps on
   purpose rather than by omission. */
const CV_TEXT = CARTA.darkInk;
const CV_SUB  = CARTA.darkSub;
const CV_FAINT = CARTA.darkMuted;
const CV_LINE = CARTA.darkSeam;
const CV_PLATE = CARTA.darkPlate;
const HAIR = CARTA.hair, MINT = CARTA.mint, WHITE = CARTA.white;
const DISPLAY = CARTA_TYPE.display, SANS = CARTA_TYPE.sans, MONO = CARTA_TYPE.mono;
const DW = CARTA_DISPLAY_WEIGHT;
/* The report body sets no background, so the page ground is the print white.
   Every flatten() call below blends over THIS — change one, change both. */
const PAGE = '#FFFFFF';

/* ── CLI ──────────────────────────────────────────────────────────────── */
const args = process.argv.slice(2);
const specArg = args.find(a => !a.startsWith('--'));
if (!specArg) { console.error('Usage: build-report.mts <report.md> [--out <dir>] [--slug <name>] [--eyebrow "..."]'); process.exit(1); }
const flag = (n: string) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const mdPath = path.resolve(specArg);
const outDir = flag('--out') ? path.resolve(flag('--out')!) : path.resolve('collateral');
mkdirSync(outDir, { recursive: true });
const slug = flag('--slug') || path.basename(mdPath).replace(/\.md$/i, '');
const eyebrow = flag('--eyebrow') || 'MARKET ASSESSMENT';

/* ── split cover (before first `---`) from body ───────────────────────── */
const rawMd = readFileSync(mdPath, 'utf8').replace(/\r\n/g, '\n');
const splitIdx = rawMd.indexOf('\n---\n');
const coverMdRaw = splitIdx >= 0 ? rawMd.slice(0, splitIdx).trim() : '';
const bodyMd = splitIdx >= 0 ? rawMd.slice(splitIdx + 5).trim() : rawMd;

/* ── optional cover config (an HTML comment atop the cover) ───────────────
   <!--cover
     byline: Paul Baker
     role: smbX.ai · Buy-side corporate development
     headshot: founder-portrait.jpg          (bare name, abs path, or beside the .md)
     stat: $600B+ | Combined U.S. revenue     (repeatable; VALUE | LABEL)
   -->
   Absent → a plain cover (byline defaults to the owner, no stat band).       */
const coverCfg: { byline: string; role: string; headshot: string; image: string; imagePos: string; footer: string; eyebrow?: string; stats: { n: string; l: string }[]; accents: { match: string; img: string; pos: string }[] } =
  // `eyebrow` must be present here, not just in the type: the parser below
  // assigns with `k in coverCfg`, so an optional key left off the initializer
  // is silently dropped — `eyebrow:` in a cover block did nothing.
  { byline: 'Paul Baker', role: 'smbX.ai · Buy-side corporate development', headshot: '', image: '', imagePos: '50% 50%', footer: '', eyebrow: '', stats: [], accents: [] };
const cfgMatch = coverMdRaw.match(/<!--\s*cover([\s\S]*?)-->/i);
const coverMd = (cfgMatch ? coverMdRaw.replace(cfgMatch[0], '') : coverMdRaw).trim();
if (cfgMatch) for (const line of cfgMatch[1].split('\n')) {
  const m = line.match(/^\s*(\w+)\s*:\s*(.+?)\s*$/); if (!m) continue;
  const [, k, v] = m;
  if (k === 'stat') { const bar = v.indexOf('|'); coverCfg.stats.push(bar >= 0 ? { n: v.slice(0, bar).trim(), l: v.slice(bar + 1).trim() } : { n: v.trim(), l: '' }); }
  else if (k === 'accent') { const p = v.split('|').map(s => s.trim()); coverCfg.accents.push({ match: p[0] || '', img: p[1] || '', pos: p[2] || '50% 50%' }); }
  else if (k in coverCfg) (coverCfg as any)[k] = v;
}
const coverEyebrow = flag('--eyebrow') || coverCfg.eyebrow || eyebrow;

(marked as any).setOptions({ gfm: true, breaks: false });
const coverHtmlRaw = coverMd ? (marked as any).parse(coverMd) : '';
const bodyHtml = (marked as any).parse(bodyMd);
/* pagination: break before `#` parts if the body has any, else before its
   top-level `##` sections (some reports lead with ## and never use #). */
const bodyHasH1 = /^# /m.test(bodyMd);

/* title (+ brass rule) split off so a stat band can sit right under it; the
   cover's numbered list (e.g. the research workstreams) becomes framed cards. */
let titleHtml = '', rest = coverHtmlRaw;
const h1m = rest.match(/<h1[\s\S]*?<\/h1>/i); if (h1m) { titleHtml += h1m[0]; rest = rest.replace(h1m[0], ''); }
const h2m = rest.match(/<h2[\s\S]*?<\/h2>/i); if (h2m) { titleHtml += h2m[0]; rest = rest.replace(h2m[0], ''); }
titleHtml += '<div class="rule"></div>';
/* Fraunces's DEFAULT ampersand is a swash form — not an alternate a feature
   setting can switch off — and at title size "M&A" reads as a glyph nobody
   recognises. Set the ampersand in the sans face instead; it is the only
   character that needs it. */
titleHtml = titleHtml.replace(/&amp;/g, '<span class="amp">&amp;</span>');
/* running-footer label: --footer / config, else the plain-text report title */
const footerRaw = flag('--footer') || coverCfg.footer;
const footerLabel = footerRaw
  ? footerRaw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  : (h1m ? h1m[0].replace(/<[^>]+>/g, '').trim() : slug);
const restHtml = rest.replace(/<ol>([\s\S]*?)<\/ol>/i, (_m, inner) => {
  let i = 0;
  const cards = inner.replace(/<li>([\s\S]*?)<\/li>/gi, (_x: string, li: string) => `<div class="cv-card"><span class="cv-cardno">${String(++i).padStart(2, '0')}</span><div class="cv-cardbody">${li.trim()}</div></div>`);
  return `<div class="cv-cards">${cards}</div>`;
});
const statBand = coverCfg.stats.length
  ? `<div class="cv-stats">${coverCfg.stats.map(s => `<div class="cv-stat"><div class="n">${s.n}</div>${s.l ? `<div class="l">${s.l}</div>` : ''}${HANDLE_HTML}</div>`).join('')}</div>`
  : '';

const { b64, mimeOf } = await import(pathToFileURL(path.join(ROOT, 'house/assets.ts')).href);
const LOGO_W = b64(path.join(ROOT, 'client/public/logo-green-x-dark.png'), 'image/png');
/* NO TEXTURES. Carta's cover band is a flat colour and its body page is the
   print white — the blackbleed plaster and the bonebleed grain are both gone,
   deleted rather than re-pointed. A texture layer left in a background stack
   sits ABOVE the colour and wins outright, so a re-point renders identically
   and shows a clean diff. */

/* resolve a config asset (bare name → beside the .md, its ./media, its sibling
   ../media, or client/public; abs path as-is) — returns '' if not found, so
   callers choose their fallback.
   The ../media step (2026-07-29) is what lets the studio's market layout work:
   the report source lives in markets/<m>/documents/ and its art in
   markets/<m>/media/. Without it every cover image and section band resolved to
   nothing, silently — a missing accent simply does not render. */
/* mimeOf now comes from house/assets.ts (imported above) */
const resolveAsset = (h: string) => {
  if (!h) return '';
  if (path.isAbsolute(h)) return existsSync(h) ? h : '';
  return [
    path.dirname(mdPath),
    path.join(path.dirname(mdPath), 'media'),
    path.join(path.dirname(mdPath), '..', 'media'),
    path.join(ROOT, 'client/public'),
  ].map(d => path.join(d, h)).find(existsSync) || '';
};

/* headshot for the owner byline — config path, else the repo founder portrait */
const headPath = resolveAsset(coverCfg.headshot) || path.join(ROOT, 'client/public/founder-portrait.jpg');
const HEAD = existsSync(headPath) ? b64(headPath, mimeOf(headPath)) : '';
const bylineHtml = `<div class="cv-byline">${HEAD ? `<img class="cv-face" src="${HEAD}">` : ''}<div><div class="cv-by-name">${coverCfg.byline}</div><div class="cv-by-role">${coverCfg.role}</div></div></div>`;

/* optional cover hero image (framed) — like the carousel cover carries */
const heroPath = resolveAsset(coverCfg.image);
/* The hero is a FRAMED PANEL, not a bare image. Carta replaces atmosphere with
   structure: the frame and its four corner handles are what make a flat band
   read as designed rather than as a page with the texture switched off. The
   clip lives on an inner element because the handles sit OUTSIDE the border. */
const heroHtml = heroPath
  ? `<div class="cv-heroframe"><div class="cv-heroclip"><img class="cv-hero" style="object-position:${coverCfg.imagePos}" src="${b64(heroPath, mimeOf(heroPath))}"></div>${HANDLE_HTML}</div>`
  : '';

/* inline section accents — a framed image dropped in right after a matching
   `## ` header (match = any substring of the header text; case-insensitive). */
let bodyOut = bodyHtml;
for (const a of coverCfg.accents) {
  const p = resolveAsset(a.img); if (!p || !a.match) continue;
  const esc = a.match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(<h2[^>]*>[^<]*${esc}[^<]*</h2>)`, 'i');
  const tag = `<img class="rb-accent" style="object-position:${a.pos}" src="${b64(p, mimeOf(p))}">`;
  bodyOut = bodyOut.replace(re, `$1${tag}`);
}

/* ── the document ─────────────────────────────────────────────────────── */
const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${cartaFontFaceCss()}</style>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: ${SANS}; color: ${BODY}; font-size: 10.5pt; line-height: 1.5; font-variant-numeric: tabular-nums; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  /* cover (dark boardroom title card, fills page 1 within the print margins) */
  /* THE COVER IS FLAT AND SQUARE. Ledger built this ground as a composite —
     blackbleed plaster, an ink veil at 0.34, and three radial blooms placed to
     keep the byline corner clear. Carta deletes the whole stack: the band is a
     colour. The 12px radius goes with it; radius is 0 everywhere except
     buttons and inputs. */
  .cover { position: relative; min-height: 9.35in; padding: 0.44in 0.58in 0.4in; background: ${cartaBand()}; color: ${CV_TEXT}; page-break-after: always; display: flex; flex-direction: column; }
  .cover > * { position: relative; z-index: 1; }
  /* THE COVER PANEL. An inset hairline bracket with the four handles at its
     corners — the house gesture, and the thing that was missing when this cover
     read as "the old layout with the texture turned off". */
  .cv-frame { position: absolute; inset: 0.22in; border: 1px solid ${CV_LINE}; pointer-events: none; z-index: 0; }
  ${handleCss(CARTA.darkInk)}
  /* the small cut on a stat plate — 7px at -4px */
  .cv-stat .hdl { width: ${CARTA_HANDLE.sizeSmall}px; height: ${CARTA_HANDLE.sizeSmall}px; }
  /* logo is 4:1 — align-self stops the column flexbox from stretching it wide */
  .cv-logo { height: 25px; width: auto; align-self: flex-start; display: block; }
  /* THE KICKER: an 8px green square, then the label in darkMuted. Same
     construction as the deck and the one-pager; only the label colour moves
     between grounds. */
  .cv-eyebrow { font-family: ${MONO}; font-size: 9.5pt; letter-spacing: 0.16em; color: ${CV_FAINT}; margin-top: 0.22in; }
  .cv-eyebrow::before { content: ''; display: inline-block; width: 8px; height: 8px; background: ${GREEN}; margin-right: 9px; vertical-align: 0.5px; }
  /* Discretionary ligatures OFF. Fraunces shipped a swash ampersand that read
     as a glyph nobody recognises in a title like "Home Services M&A"; Source
     Serif 4 is better behaved, but a title is the wrong place to find out that
     a face has opinions, so the switch stays. */
  .cover h1 { font-family: ${DISPLAY}; font-weight: ${DW}; font-size: 26pt; line-height: 1.04; letter-spacing: -0.012em; color: ${CV_TEXT}; margin: 0.1in 0 0.1in; max-width: 6.1in; text-wrap: balance;
    font-variant-ligatures: none; }
  .cover h1 .amp { font-family: ${SANS}; font-weight: 500; font-size: 0.86em; }
  .cover h2 { font-family: ${SANS}; font-weight: 500; font-size: 12.5pt; line-height: 1.4; color: ${CV_SUB}; margin: 0 0 0.03in; max-width: 5.9in; }
  .cover .rule { width: 84px; height: 4px; background: ${MINT}; margin: 0.06in 0 0.2in; }
  /* optional framed hero image on the cover (like the carousel cover) */
  /* AN IMAGE FRAME — square, hairline, no shadow. The drop shadow went with
     the radius: a translucent shadow is a PDF transparency group, which is the
     renderer-proof law's whole subject, and Carta has no soft edges to justify
     carrying one. */
  .cv-heroframe { position: relative; border: 1px solid ${CV_LINE}; margin: 0 0 0.16in; }
  .cv-heroclip { overflow: hidden; display: block; }
  .cv-hero { width: 100%; height: 2.05in; object-fit: cover; display: block; }
  .cover p, .cover li { color: ${CV_SUB}; font-size: 10pt; line-height: 1.5; margin: 0 0 0.07in; }
  .cover strong { color: ${CV_TEXT}; font-weight: 600; }
  .cover em { color: ${MINT}; font-style: italic; }
  .cover ol { padding-left: 1.1em; margin: 0.06in 0; }

  /* "by the numbers" stat band — square label plates, reading-ink numerals.
     Ledger set the figure itself in brass; Carta sets it in darkInk and lets
     the green kicker square above be the page's accent. */
  .cv-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; margin: 0.02in 0 0.16in; }
  .cv-stat { position: relative; border: 1px solid ${CV_LINE}; padding: 11px 13px 12px; background: ${CV_PLATE}; }
  .cv-stat .n { font-family: ${DISPLAY}; font-weight: ${DW}; font-size: 19pt; line-height: 1; color: ${CV_TEXT}; letter-spacing: -0.01em; }
  .cv-stat .l { font-family: ${MONO}; font-size: 6.6pt; letter-spacing: 0.05em; text-transform: uppercase; color: ${CV_FAINT}; margin-top: 6px; line-height: 1.4; }

  /* framed workstream cards (the cover's numbered list) */
  .cv-cards { display: flex; flex-direction: column; gap: 7px; margin: 0.05in 0 0.1in; }
  .cv-card { display: flex; gap: 11px; align-items: baseline; border: 1px solid ${CV_LINE}; border-left: 2.5px solid ${MINT}; padding: 9px 13px; background: ${CV_PLATE}; }
  .cv-cardno { font-family: ${MONO}; font-size: 8pt; color: ${MINT}; letter-spacing: 0.06em; flex: none; }
  .cv-cardbody { color: ${CV_SUB}; font-size: 9.5pt; line-height: 1.48; }
  .cv-cardbody em { color: ${CV_TEXT}; font-style: italic; font-weight: 500; }

  /* owner byline — headshot disc pinned to the bottom of the cover */
  /* The byline pins to the foot, so everything above it needs somewhere to
     go. WITH a hero the block sits top-aligned and the image carries the
     middle; WITHOUT one there is nothing to fill that space, and the cover
     reads as a hole — so the block centres instead. */
  .cv-body { flex: 1; display: flex; flex-direction: column; min-height: 0; }
  .cover.nohero .cv-body { justify-content: center; padding-bottom: 0.3in; }
  .cv-byline { margin-top: auto; display: flex; align-items: center; gap: 13px; padding-top: 0.16in; border-top: 1px solid ${CV_LINE}; }
  .cv-face { width: 46px; height: 46px; border-radius: 50%; object-fit: cover; object-position: 50% 20%; border: 2px solid ${CARTA.chipBorder}; flex: none; }
  .cv-by-name { font-family: ${SANS}; font-weight: 600; font-size: 11pt; color: ${CV_TEXT}; }
  .cv-by-role { font-family: ${MONO}; font-size: 7.6pt; letter-spacing: 0.05em; color: ${CV_FAINT}; margin-top: 3px; text-transform: uppercase; }

  /* body */
  .rbody h1 { font-family: ${DISPLAY}; font-weight: ${DW}; font-size: 21pt; line-height: 1.08; letter-spacing: -0.01em; color: ${INK}; page-break-before: always; margin: 0 0 0.12in; padding-top: 0.16in; border-top: 2.5px solid ${INK}; }
  .rbody h2 { font-family: ${DISPLAY}; font-weight: ${DW}; font-size: 14.5pt; line-height: 1.15; color: ${INK}; margin: 0.26in 0 0.07in; page-break-after: avoid; }
  .rbody h3 { font-family: ${SANS}; font-weight: 700; font-size: 11.5pt; color: ${INK}; margin: 0.17in 0 0.04in; page-break-after: avoid; }
  /* reports that lead with ## (no # parts): promote ## to the page-breaking part header */
  .rbody.noh1 h2 { page-break-before: always; font-size: 17pt; margin: 0 0 0.11in; padding-top: 0.16in; border-top: 2.5px solid ${INK}; }
  .rbody.noh1 h2:first-child { page-break-before: avoid; border-top: none; padding-top: 0; }
  /* inline section accent — framed photo band on the bone page (renderer-safe) */
  /* No box-shadow: a translucent drop shadow is a PDF transparency group, and
     the hairline border does the same job on paper. Renderer-proof law. */
  .rb-accent { display: block; width: 100%; height: 2.2in; object-fit: cover; border: 1px solid ${INK}; margin: 0.05in 0 0.22in; page-break-inside: avoid; }
  /* A blockquote in a report is a NOTICE — a correction, a caveat, something
     the reader must not skim past. Ledger gave it a brass rail; Carta has one
     accent, so it takes a green rail over the green tint. Square, and the fill
     is flattened rather than translucent — see the renderer-proof law below. */
  blockquote { margin: 0.18in 0; padding: 0.14in 0.2in; border-left: 3px solid ${GREEN};
    background: ${flatten(CARTA.green, 0.05, PAGE)}; page-break-inside: avoid; }
  blockquote p { margin: 0 0 0.08in; font-size: 9.5pt; line-height: 1.55; }
  blockquote p:last-child, blockquote ol:last-child, blockquote ul:last-child { margin-bottom: 0; }
  blockquote ol, blockquote li { font-size: 9.5pt; line-height: 1.55; }
  .rbody p { margin: 0 0 0.11in; }
  .rbody strong { color: ${INK}; font-weight: 600; }
  .rbody em { font-style: italic; }
  .rbody ul, .rbody ol { margin: 0 0 0.12in; padding-left: 1.25em; }
  .rbody li { margin: 0 0 0.045in; }
  .rbody li::marker { color: ${GREEN}; }
  .rbody ul ul, .rbody ol ol, .rbody ul ol, .rbody ol ul { margin: 0.04in 0 0.04in; }
  .rbody hr { display: none; }
  a { color: ${GREEN}; text-decoration: none; }

  /* tables — hairline, bone header, tabular figures */
  .rbody table { width: 100%; border-collapse: collapse; margin: 0.12in 0 0.2in; font-size: 8.4pt; line-height: 1.34; }
  /* The GFM table head plate. REPORT.tableHead is a Ledger-era warm bone;
     Carta's neutral panel is the same job without the warmth. */
  .rbody thead { background: ${CARTA.panel}; }
  .rbody th { font-family: ${MONO}; font-size: 7.4pt; letter-spacing: 0.03em; text-transform: uppercase; color: ${INK}; text-align: left; padding: 6px 8px; border-bottom: 1.5px solid ${INK}; vertical-align: bottom; }
  .rbody td { padding: 5px 8px; border-bottom: 1px solid ${HAIR}; color: ${BODY}; vertical-align: top; }
  .rbody tr { page-break-inside: avoid; }
  .rbody td strong { color: ${INK}; }
  .rbody em { color: ${TERT}; }
</style></head>
<body>
  <section class="cover${heroHtml ? '' : ' nohero'}">
    <div class="cv-frame">${HANDLE_HTML}</div>
    <img class="cv-logo" src="${LOGO_W}">
    <div class="cv-body">
      <div class="cv-eyebrow">${coverEyebrow}</div>
      ${titleHtml}
      ${heroHtml}
      ${statBand}
      ${restHtml}
    </div>
    ${bylineHtml}
  </section>
  <main class="rbody${bodyHasH1 ? '' : ' noh1'}">${bodyOut}</main>
</body></html>`;

/* THE PALETTE GUARD. Nothing renders in a retired palette — see
   house/palette-guard.ts. It runs on the document rather than the source
   because a colour can arrive through a function three files away, and the
   rendered markup is the only place "what colour is this artifact" has one
   answer. Placed before the cover raster so a bad cover never becomes a JPEG
   nobody can grep. */
assertCarta(doc, slug);

/* ── renderer-proof: rasterize the COVER, keep the body vector ─────────
   The law (SMBX_RENDERER_PROOF_LAW_2026-08-04): a PDF that ships transparency
   groups and shadings lets Preview and LinkedIn re-composite the page their own
   way, which is the hard-edged lighter rectangle that keeps appearing on dark
   covers. build-deck.mts solves it by rasterizing EVERY page — a carousel is
   images anyway.

   A report cannot do that. Rasterizing fifty-five pages of research would
   destroy selectable, searchable text and multiply the file size. So the split
   is: the cover — one page, dark, gradient-heavy, all of the /Shading — becomes
   a flat JPEG, and the body stays real vector text with its few translucent
   fills flattened by flatten(). Best of both, and the assertion at the bottom
   is what stops it regressing. */
const COVER_W_IN = 7.0;   // Letter 8.5in less the two 0.75in print margins

async function rasterizeCover(): Promise<string> {
  /* Same document, same CSS — just the cover, at 2x device scale so the raster
     lands near 192dpi instead of the 96dpi a screenshot would default to. */
  const coverDoc = doc
    .replace(/<main[\s\S]*?<\/main>/, '')
    .replace('</head>', `<style>html,body{width:${COVER_W_IN}in;background:${PAGE};}</style></head>`);
  const p = await newRenderPage();
  try {
    await p.setViewport({ width: Math.round(COVER_W_IN * 96), height: 1000, deviceScaleFactor: 2 });
    await p.setContent(coverDoc, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await p.evaluateHandle('document.fonts.ready').catch(() => {});
    await p.evaluate(() => Promise.all(Array.from(document.images).map((im: any) => (im as HTMLImageElement).decode().catch(() => {})))).catch(() => {});
    await new Promise(r => setTimeout(r, 200));
    const el = await p.$('.cover');
    if (!el) throw new Error('renderer-proof: .cover not found, cannot rasterize');
    const b = await el.screenshot({ type: 'jpeg', quality: 92, encoding: 'base64' });
    return `data:image/jpeg;base64,${b}`;
  } finally { await p.close().catch(() => {}); }
}

const flatDoc = doc
  .replace(/<section class="cover[\s\S]*?<\/section>/, `<section class="cover-flat"><img src="${await rasterizeCover()}"></section>`)
  /* No border-radius on the flat cover: rounding it would clip, and a clip is
     another transparency group. A full-bleed rectangle measures 0. */
  .replace('</head>', '<style>.cover-flat{page-break-after:always;}.cover-flat img{display:block;width:100%;height:auto;}</style></head>');

/* ── render: multi-page PDF with page numbers ─────────────────────────── */
let exitCode = 0;
const page = await newRenderPage();
try {
  await page.setContent(flatDoc, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.evaluateHandle('document.fonts.ready').catch(() => {});
  await page.evaluate(() => Promise.all(Array.from(document.images).map((im: any) => (im as HTMLImageElement).decode().catch(() => {})))).catch(() => {});
  await new Promise(r => setTimeout(r, 150));
  const pdf = await page.pdf({
    format: 'Letter',
    printBackground: true,
    margin: { top: '0.55in', bottom: '0.7in', left: '0.75in', right: '0.75in' },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `<div style="width:100%;font-family:'IBM Plex Mono',monospace;font-size:7pt;color:${TERT};padding:0 0.75in;display:flex;justify-content:space-between;"><span>smbX.ai&nbsp;&nbsp;·&nbsp;&nbsp;${footerLabel}</span><span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
  });
  const buf = Buffer.from(pdf);
  writeFileSync(path.join(outDir, `${slug}.pdf`), buf);
  const kb = (buf.length / 1024).toFixed(0);
  console.log(`✓ ${slug}.pdf (${kb}KB) → ${outDir}`);
  writeBuildRecord(outDir, 'build-report.mts', [
    { label: 'source', file: mdPath },
    { label: 'master', file: path.join(path.dirname(mdPath), '..', 'master.md') },
  ]);

  /* THE ASSERTION. Prose in a design doc does not stop a regression; an exit
     code does. Both counts must be zero — see the law above. */
  const raw = buf.toString('latin1');
  const groups = (raw.match(/\/Group/g) || []).length;
  const shadings = (raw.match(/\/Shading/g) || []).length;
  if (groups || shadings) {
    console.error(`\n✗ RENDERER-PROOF FAILED — /Group=${groups} /Shading=${shadings}. Both must be 0.`);
    console.error('  Something translucent survived into the vector body: an rgba() fill, a');
    console.error('  gradient, a box-shadow, or a clip. Flatten it with flatten() from');
    console.error('  house/tokens.ts, or move it onto the rasterized cover.');
    exitCode = 7;
  } else {
    console.log('  renderer-proof: /Group=0 /Shading=0');
  }
/* exitCode, not a bare exit(0): the old `finally { process.exit(0) }` swallowed
   every failure above it, including a thrown render error, and the build looked
   green while writing nothing. */
} finally { await page.close().catch(() => {}); process.exit(exitCode); }
