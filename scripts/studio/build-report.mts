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
const coverCfg: { byline: string; role: string; headshot: string; eyebrow?: string; stats: { n: string; l: string }[] } =
  { byline: 'Paul Baker', role: 'smbX.ai · Buy-side corporate development', headshot: '', stats: [] };
const cfgMatch = coverMdRaw.match(/<!--\s*cover([\s\S]*?)-->/i);
const coverMd = (cfgMatch ? coverMdRaw.replace(cfgMatch[0], '') : coverMdRaw).trim();
if (cfgMatch) for (const line of cfgMatch[1].split('\n')) {
  const m = line.match(/^\s*(\w+)\s*:\s*(.+?)\s*$/); if (!m) continue;
  const [, k, v] = m;
  if (k === 'stat') { const bar = v.indexOf('|'); coverCfg.stats.push(bar >= 0 ? { n: v.slice(0, bar).trim(), l: v.slice(bar + 1).trim() } : { n: v.trim(), l: '' }); }
  else if (k in coverCfg) (coverCfg as any)[k] = v;
}
const coverEyebrow = flag('--eyebrow') || coverCfg.eyebrow || eyebrow;

(marked as any).setOptions({ gfm: true, breaks: false });
const coverHtmlRaw = coverMd ? (marked as any).parse(coverMd) : '';
const bodyHtml = (marked as any).parse(bodyMd);

/* title (+ brass rule) split off so a stat band can sit right under it; the
   cover's numbered list (e.g. the research workstreams) becomes framed cards. */
const h1End = coverHtmlRaw.indexOf('</h1>');
const titleHtml = h1End >= 0 ? coverHtmlRaw.slice(0, h1End + 5) + '<div class="rule"></div>' : coverHtmlRaw;
const restHtml = (h1End >= 0 ? coverHtmlRaw.slice(h1End + 5) : '').replace(/<ol>([\s\S]*?)<\/ol>/i, (_m, inner) => {
  let i = 0;
  const cards = inner.replace(/<li>([\s\S]*?)<\/li>/gi, (_x: string, li: string) => `<div class="cv-card"><span class="cv-cardno">${String(++i).padStart(2, '0')}</span><div class="cv-cardbody">${li.trim()}</div></div>`);
  return `<div class="cv-cards">${cards}</div>`;
});
const statBand = coverCfg.stats.length
  ? `<div class="cv-stats">${coverCfg.stats.map(s => `<div class="cv-stat"><div class="n">${s.n}</div>${s.l ? `<div class="l">${s.l}</div>` : ''}</div>`).join('')}</div>`
  : '';

const b64 = (p: string, m: string) => `data:${m};base64,${readFileSync(p).toString('base64')}`;
const LOGO_W = b64(path.join(ROOT, 'client/public/logo-green-x-dark.png'), 'image/png');
const TEXTURE = b64(path.join(ROOT, 'client/public/textures/blackbleed.webp'), 'image/webp');

/* headshot for the owner byline — config path, else the repo founder portrait */
const resolveHead = (h: string) => {
  if (h) { const cands = path.isAbsolute(h) ? [h] : [path.dirname(mdPath), path.join(path.dirname(mdPath), 'media'), path.join(ROOT, 'client/public')].map(d => path.join(d, h)); const hit = cands.find(existsSync); if (hit) return hit; }
  return path.join(ROOT, 'client/public/founder-portrait.jpg');
};
const headPath = resolveHead(coverCfg.headshot);
const headMime = /\.png$/i.test(headPath) ? 'image/png' : /\.webp$/i.test(headPath) ? 'image/webp' : 'image/jpeg';
const HEAD = existsSync(headPath) ? b64(headPath, headMime) : '';
const bylineHtml = `<div class="cv-byline">${HEAD ? `<img class="cv-face" src="${HEAD}">` : ''}<div><div class="cv-by-name">${coverCfg.byline}</div><div class="cv-by-role">${coverCfg.role}</div></div></div>`;

/* ── the document ─────────────────────────────────────────────────────── */
const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${fontFaceCss()}</style>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: ${SANS}; color: ${BODY}; font-size: 10.5pt; line-height: 1.5; font-variant-numeric: tabular-nums; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  /* cover (dark boardroom title card, fills page 1 within the print margins) */
  .cover { position: relative; min-height: 9.35in; padding: 0.5in 0.58in 0.46in; background: ${DARK} url('${TEXTURE}') center/cover; color: ${IVORY}; border-radius: 12px; overflow: hidden; page-break-after: always; display: flex; flex-direction: column; }
  .cover::before { content: ''; position: absolute; inset: 0; background:
    radial-gradient(760px 420px at 26% 2%, rgba(22,98,76,0.30), transparent 60%),
    linear-gradient(180deg, rgba(15,26,22,0.42), rgba(15,26,22,0.74)); }
  .cover > * { position: relative; z-index: 1; }
  /* logo is 4:1 — align-self stops the column flexbox from stretching it wide */
  .cv-logo { height: 25px; width: auto; align-self: flex-start; display: block; }
  .cv-eyebrow { font-family: ${MONO}; font-size: 9.5pt; letter-spacing: 0.2em; color: ${BRASS}; margin-top: 0.32in; }
  .cover h1 { font-family: ${DISPLAY}; font-weight: 545; font-size: 27pt; line-height: 1.05; letter-spacing: -0.012em; color: ${IVORY}; margin: 0.1in 0 0.17in; max-width: 6.1in; text-wrap: balance; }
  .cover .rule { width: 84px; height: 5px; background: ${BRASS}; border-radius: 99px; margin-bottom: 0.2in; }
  .cover p, .cover li { color: ${IVORY_SUB}; font-size: 10pt; line-height: 1.5; margin: 0 0 0.07in; }
  .cover strong { color: ${IVORY}; font-weight: 600; }
  .cover em { color: #8FD0AE; font-style: italic; }
  .cover ol { padding-left: 1.1em; margin: 0.06in 0; }

  /* "by the numbers" stat band — framed cards, brass Fraunces numerals */
  .cv-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; margin: 0.02in 0 0.2in; }
  .cv-stat { border: 1px solid rgba(143,208,174,0.24); border-radius: 10px; padding: 11px 13px 12px; background: rgba(255,255,255,0.035); }
  .cv-stat .n { font-family: ${DISPLAY}; font-weight: 545; font-size: 19pt; line-height: 1; color: ${BRASS}; letter-spacing: -0.01em; }
  .cv-stat .l { font-family: ${MONO}; font-size: 6.6pt; letter-spacing: 0.05em; text-transform: uppercase; color: #A6BEB2; margin-top: 6px; line-height: 1.4; }

  /* framed workstream cards (the cover's numbered list) */
  .cv-cards { display: flex; flex-direction: column; gap: 7px; margin: 0.05in 0 0.1in; }
  .cv-card { display: flex; gap: 11px; align-items: baseline; border: 1px solid rgba(255,255,255,0.10); border-left: 2.5px solid ${BRASS}; border-radius: 8px; padding: 9px 13px; background: rgba(255,255,255,0.022); }
  .cv-cardno { font-family: ${MONO}; font-size: 8pt; color: ${BRASS}; letter-spacing: 0.06em; flex: none; }
  .cv-cardbody { color: ${IVORY_SUB}; font-size: 9.5pt; line-height: 1.48; }
  .cv-cardbody em { color: ${IVORY}; font-style: italic; font-weight: 500; }

  /* owner byline — headshot disc pinned to the bottom of the cover */
  .cv-byline { margin-top: auto; display: flex; align-items: center; gap: 13px; padding-top: 0.16in; border-top: 1px solid rgba(255,255,255,0.13); }
  .cv-face { width: 46px; height: 46px; border-radius: 50%; object-fit: cover; object-position: 50% 20%; border: 2px solid rgba(143,208,174,0.5); flex: none; }
  .cv-by-name { font-family: ${SANS}; font-weight: 600; font-size: 11pt; color: ${IVORY}; }
  .cv-by-role { font-family: ${MONO}; font-size: 7.6pt; letter-spacing: 0.05em; color: #A6BEB2; margin-top: 3px; text-transform: uppercase; }

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
    <div class="cv-eyebrow">${coverEyebrow}</div>
    ${titleHtml}
    ${statBand}
    ${restHtml}
    ${bylineHtml}
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
