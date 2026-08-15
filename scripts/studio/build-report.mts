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

/* ── THE SHARED REPORT GRAMMAR (house/report.ts) ───────────────────────────
   Paul, 2026-08-15: *"i want all decks, docs and collateral for a client to
   have the same look and feel as the branded smbx collateral… i just want to
   have consistency in design languages."*

   The cover construction, the stylesheet and the document skeleton used to live
   in this file, and the app had a SECOND implementation of the same artifact in
   the retired Ledger language. They now share one grammar, the same way the
   carousel shares `house/deck.ts`. This builder keeps what is genuinely local:
   the CLI, reading the file, and resolving images off disk.

   The extraction was verbatim, so a report built before it and after it renders
   the same bytes — that is what makes the change reviewable by looking at one. */
const R = await import(pathToFileURL(path.join(ROOT, 'house/report.ts')).href);

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

/* ── split cover (before first `---`) from body ─────────────────────────
   <!--cover
     byline: Paul Baker
     role: smbX.ai · Buy-side corporate development
     headshot: founder-portrait.jpg          (bare name, abs path, or beside the .md)
     for: Ridgeline Capital Partners          (a CLIENT document; omit for public)
     stat: $600B+ | Combined U.S. revenue     (repeatable; VALUE | LABEL)
   -->
   Absent → a plain cover (byline defaults to the owner, no stat band).
   Parsing is `house/report.ts`'s, so the app reads the same convention.      */
const { cfg: coverCfg, coverMd, bodyMd, bodyHasH1 } = R.parseReportMarkdown(readFileSync(mdPath, 'utf8'));
const coverEyebrow = flag('--eyebrow') || coverCfg.eyebrow || eyebrow;

(marked as any).setOptions({ gfm: true, breaks: false });
const coverHtmlRaw = coverMd ? (marked as any).parse(coverMd) : '';
const bodyHtml = (marked as any).parse(bodyMd);

const { titleHtml, restHtml: restRaw, plainTitle } = R.splitTitle(coverHtmlRaw);
const restHtml = R.listToCards(restRaw);
/* running-footer label: --footer / config, else the plain-text report title */
const footerRaw = flag('--footer') || coverCfg.footer;
const footerLabel = footerRaw
  ? footerRaw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  : (plainTitle || slug);

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

/* optional cover hero image (framed) — like the carousel cover carries.
   The frame construction itself lives in house/report.ts; resolving the file
   off disk is this builder's job and the app's is to pull it from
   studio_assets, which is the whole shape of "shared engine, separate use
   cases". */
const heroPath = resolveAsset(coverCfg.image);
const HERO = heroPath ? b64(heroPath, mimeOf(heroPath)) : null;

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

/* ── the document — THE SHARED GRAMMAR (house/report.ts) ──────────────────
   Everything the cover, the stylesheet and the skeleton used to say inline now
   lives in house/report.ts, so the app renders the identical document. This
   builder supplies the parts that are genuinely local: content parsed from the
   .md, and images resolved off disk. */
const doc = R.reportDocument({
  eyebrow: coverEyebrow,
  titleHtml,
  preparedFor: coverCfg.preparedFor,
  stats: coverCfg.stats,
  introHtml: restHtml,
  byline: { name: coverCfg.byline, role: coverCfg.role },
  bodyHtml: bodyOut,
  bodyHasH1,
  footerLabel,
}, { logoWhite: LOGO_W, headshot: HEAD, hero: HERO }, cartaFontFaceCss(), coverCfg.imagePos);

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
const COVER_W_IN = R.REPORT_COVER_W_IN;

async function rasterizeCover(): Promise<string> {
  /* Same document, same CSS — just the cover, at 2x device scale so the raster
     lands near 192dpi instead of the 96dpi a screenshot would default to. */
  const coverDoc = R.coverOnlyDocument(doc);
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

const flatDoc = R.withFlatCover(doc, await rasterizeCover());

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
    margin: { ...R.REPORT_MARGIN },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: R.reportFooterTemplate(footerLabel),
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
