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
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
const { fontFaceCss } = await import(pathToFileURL(path.join(ROOT, 'server/services/fontEmbeds.ts')).href);
const { newRenderPage } = await import(pathToFileURL(path.join(ROOT, 'server/services/premiumPdfRenderer.ts')).href);
const { marked } = await import('marked');

/* ── house palette ────────────────────────────────────────────────────── */
const INK = '#14181C', BODY = '#3F464C', TERT = '#8A9099', GREEN = '#16624C';
const WARM = '#F6F4EF', DARK = '#0F1A16', IVORY = '#F3F1EA', IVORY_SUB = '#CBD1CB';
const BRASS = '#B08637', HAIR = '#E4E1D9';
const DISPLAY = `'Fraunces', Georgia, serif`, SANS = `'Inter', -apple-system, sans-serif`, MONO = `'IBM Plex Mono', monospace`;

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

/* ── split cover (before first `---`) from body, then markdown → html ──── */
const rawMd = readFileSync(mdPath, 'utf8').replace(/\r\n/g, '\n');
const splitIdx = rawMd.indexOf('\n---\n');
const coverMd = splitIdx >= 0 ? rawMd.slice(0, splitIdx).trim() : '';
const bodyMd = splitIdx >= 0 ? rawMd.slice(splitIdx + 5).trim() : rawMd;
(marked as any).setOptions({ gfm: true, breaks: false });
const coverHtml = coverMd ? (marked as any).parse(coverMd) : '';
const bodyHtml = (marked as any).parse(bodyMd);

const b64 = (p: string, m: string) => `data:${m};base64,${readFileSync(p).toString('base64')}`;
const LOGO_W = b64(path.join(ROOT, 'client/public/logo-green-x-dark.png'), 'image/png');
const TEXTURE = b64(path.join(ROOT, 'client/public/textures/blackbleed.webp'), 'image/webp');

/* ── the document ─────────────────────────────────────────────────────── */
const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${fontFaceCss()}</style>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: ${SANS}; color: ${BODY}; font-size: 10.5pt; line-height: 1.5; font-variant-numeric: tabular-nums; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  /* cover (dark boardroom title card, fills page 1 within the print margins) */
  .cover { position: relative; min-height: 9.35in; padding: 0.72in 0.62in; background: ${DARK} url('${TEXTURE}') center/cover; color: ${IVORY}; border-radius: 12px; overflow: hidden; page-break-after: always; display: flex; flex-direction: column; }
  .cover::before { content: ''; position: absolute; inset: 0; background:
    radial-gradient(760px 420px at 26% 2%, rgba(22,98,76,0.28), transparent 60%),
    linear-gradient(180deg, rgba(15,26,22,0.42), rgba(15,26,22,0.74)); }
  .cover > * { position: relative; z-index: 1; }
  .cv-logo { height: 30px; width: auto; display: block; }
  .cv-eyebrow { font-family: ${MONO}; font-size: 10pt; letter-spacing: 0.2em; color: ${BRASS}; margin-top: 2.0in; }
  .cover h1 { font-family: ${DISPLAY}; font-weight: 545; font-size: 33pt; line-height: 1.04; letter-spacing: -0.012em; color: ${IVORY}; margin: 0.14in 0 0.26in; max-width: 6.1in; text-wrap: balance; }
  .cover .rule { width: 84px; height: 5px; background: ${BRASS}; border-radius: 99px; margin-bottom: 0.28in; }
  .cover p, .cover li { color: ${IVORY_SUB}; font-size: 10.5pt; line-height: 1.55; margin: 0 0 0.08in; }
  .cover strong { color: ${IVORY}; font-weight: 600; }
  .cover em { color: #8FD0AE; font-style: italic; }
  .cover ol { padding-left: 1.1em; margin: 0.06in 0; }

  /* body */
  .rbody h1 { font-family: ${DISPLAY}; font-weight: 545; font-size: 21pt; line-height: 1.08; letter-spacing: -0.01em; color: ${INK}; page-break-before: always; margin: 0 0 0.12in; padding-top: 0.16in; border-top: 2.5px solid ${BRASS}; }
  .rbody h2 { font-family: ${DISPLAY}; font-weight: 545; font-size: 14.5pt; line-height: 1.15; color: ${INK}; margin: 0.26in 0 0.07in; page-break-after: avoid; }
  .rbody h3 { font-family: ${SANS}; font-weight: 700; font-size: 11.5pt; color: ${INK}; margin: 0.17in 0 0.04in; page-break-after: avoid; }
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
  .rbody thead { background: #EEE9DD; }
  .rbody th { font-family: ${MONO}; font-size: 7.4pt; letter-spacing: 0.03em; text-transform: uppercase; color: ${INK}; text-align: left; padding: 6px 8px; border-bottom: 1.5px solid ${BRASS}; vertical-align: bottom; }
  .rbody td { padding: 5px 8px; border-bottom: 1px solid ${HAIR}; color: ${BODY}; vertical-align: top; }
  .rbody tr { page-break-inside: avoid; }
  .rbody td strong { color: ${INK}; }
  .rbody em { color: ${TERT}; }
</style></head>
<body>
  <section class="cover">
    <img class="cv-logo" src="${LOGO_W}">
    <div class="cv-eyebrow">${eyebrow}</div>
    ${coverHtml.replace('</h1>', '</h1><div class="rule"></div>')}
  </section>
  <main class="rbody">${bodyHtml}</main>
</body></html>`;

/* ── render: multi-page PDF with page numbers ─────────────────────────── */
const page = await newRenderPage();
try {
  await page.setContent(doc, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.evaluateHandle('document.fonts.ready').catch(() => {});
  await page.evaluate(() => Promise.all(Array.from(document.images).map((im: any) => (im as HTMLImageElement).decode().catch(() => {})))).catch(() => {});
  await new Promise(r => setTimeout(r, 150));
  const pdf = await page.pdf({
    format: 'Letter',
    printBackground: true,
    margin: { top: '0.55in', bottom: '0.7in', left: '0.75in', right: '0.75in' },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `<div style="width:100%;font-family:'IBM Plex Mono',monospace;font-size:7pt;color:#8A9099;padding:0 0.75in;display:flex;justify-content:space-between;"><span>smbX.ai&nbsp;&nbsp;·&nbsp;&nbsp;Home Services M&amp;A — Master Assessment</span><span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
  });
  writeFileSync(path.join(outDir, `${slug}.pdf`), Buffer.from(pdf));
  const kb = (pdf.length / 1024).toFixed(0);
  console.log(`✓ ${slug}.pdf (${kb}KB) → ${outDir}`);
} finally { await page.close().catch(() => {}); process.exit(0); }
