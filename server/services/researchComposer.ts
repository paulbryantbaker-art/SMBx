/**
 * Research Composer — turns a completed research run into shareable artifacts
 * in the PRACTICE-SITE Ledger language (2026-07-18): bone paper, ink #14181C,
 * Fraunces display over Inter working type + IBM Plex Mono, one Deal Green
 * accent #16624C, brass jewelry on labels, green-black boardroom dark
 * surfaces. Historical const names (CORAL = the accent slot).
 *
 * Two outputs, rendered on demand from the stored run row (nothing cached on
 * disk):
 *   • renderResearchPdf  — US-Letter report: kicker, title, styled markdown
 *     body, sources appendix, STUDIO FEED appendix, numbered footer.
 *   • renderResearchCardPng — 1080×1350 LinkedIn one-pager (2× for crispness):
 *     one hook + up to three cited data points + the dark brand footer.
 *
 * Reuses the shared Puppeteer instance from premiumPdfRenderer (prod
 * Chromium has network — Google Fonts CDN, same dependency base.ts takes).
 */
import { marked } from 'marked';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { newRenderPage } from './premiumPdfRenderer.js';
import { listStudioAssets, getStudioAsset } from './studioAssets.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* The practice site's dark-band texture (blackbleed), inlined so Puppeteer
 * needs no asset server. ~530KB as base64 — fine for a render page. Falls back
 * to the plain dark gradient if the file is ever missing. */
let DARK_TEXTURE_URI = '';
try {
  const buf = readFileSync(path.resolve(__dirname, '../../client/public/textures/blackbleed.webp'));
  DARK_TEXTURE_URI = `data:image/webp;base64,${buf.toString('base64')}`;
} catch { /* gradient fallback */ }

/* The canonical logo — the SAME asset and treatment the practice site uses:
 * /logo-green-x.png (1584×396 wordmark) as-is on light surfaces, and inverted
 * to pure white on dark surfaces exactly like the site footer
 * (`.pd-footer img { filter: brightness(0) invert(1) }`). Never redrawn,
 * never recolored beyond that inversion, aspect ratio always preserved. */
let LOGO_URI = '';
try {
  const buf = readFileSync(path.resolve(__dirname, '../../client/public/logo-green-x.png'));
  LOGO_URI = `data:image/png;base64,${buf.toString('base64')}`;
} catch { /* text fallback */ }

/* Dark-surface logo — white wordmark with the X in luminous mint (Paul,
 * 2026-07-18: the flat white inversion lost the green X on dark artifacts).
 * Falls back to the white-inverted light logo if the asset is missing. */
let DARK_LOGO_URI = '';
try {
  const buf = readFileSync(path.resolve(__dirname, '../../client/public/logo-green-x-dark.png'));
  DARK_LOGO_URI = `data:image/png;base64,${buf.toString('base64')}`;
} catch { /* inversion fallback */ }

/* ─── The author photo (Paul, 2026-07-19: "I need my headshot on anything
 * produced") — pulled from the Studio media library so the focal point Paul
 * sets there drives the crop everywhere. Prefers a photo labeled "headshot",
 * falls back to any library photo, then to the shipped site portrait; a
 * missing photo renders a clean initial disc, never an empty box. */
export interface AuthorPhoto { dataUri: string; focalX: number; focalY: number }

let authorCache: { at: number; photo: AuthorPhoto | null } | null = null;

export async function authorPhoto(): Promise<AuthorPhoto | null> {
  if (authorCache && Date.now() - authorCache.at < 60_000) return authorCache.photo;
  let photo: AuthorPhoto | null = null;
  try {
    const assets = await listStudioAssets();
    const pick = assets.find(a => a.kind !== 'collateral' && /headshot/i.test(a.label))
      ?? assets.find(a => a.kind !== 'collateral' && a.mime.startsWith('image/'));
    if (pick) {
      const full = await getStudioAsset(pick.id);
      if (full) photo = { dataUri: `data:${full.mime};base64,${full.data.toString('base64')}`, focalX: full.focal_x, focalY: full.focal_y };
    }
  } catch { /* library unavailable — fall through to the shipped portrait */ }
  if (!photo) {
    try {
      const buf = readFileSync(path.resolve(__dirname, '../../client/public/founder-portrait.jpg'));
      photo = { dataUri: `data:image/jpeg;base64,${buf.toString('base64')}`, focalX: 0.5, focalY: 0.24 };
    } catch { photo = null; }
  }
  authorCache = { at: Date.now(), photo };
  return photo;
}

/** Round byline face: the headshot cropped to a circle by its focal point;
 *  falls back to an ink disc with the initials so the block never breaks. */
function faceImg(sizePx: number, photo: AuthorPhoto | null, opts: { ring?: string } = {}): string {
  const ring = opts.ring ? `border:3px solid ${opts.ring};` : '';
  if (photo?.dataUri) {
    return `<img src="${photo.dataUri}" alt="Paul Baker" style="width:${sizePx}px;height:${sizePx}px;border-radius:50%;object-fit:cover;object-position:${Math.round(photo.focalX * 100)}% ${Math.round(photo.focalY * 100)}%;display:block;flex:none;${ring}">`;
  }
  return `<div style="width:${sizePx}px;height:${sizePx}px;border-radius:50%;background:${INK};color:#fff;display:flex;align-items:center;justify-content:center;font-family:${SANS};font-weight:800;font-size:${Math.round(sizePx * 0.38)}px;flex:none;${ring}">PB</div>`;
}

/** The logo <img>, sized by height (aspect preserved); white=true applies the
 *  site's dark-surface inversion. Falls back to the text wordmark if the asset
 *  is ever missing so artifacts never render brandless. */
function logoImg(heightPx: number, opts: { white?: boolean } = {}): string {
  if (opts.white && DARK_LOGO_URI) {
    return `<img src="${DARK_LOGO_URI}" alt="smbX.ai" style="height:${heightPx}px;width:auto;display:block;">`;
  }
  if (!LOGO_URI) {
    return `<span style="font-family:${SANS};font-weight:800;letter-spacing:-0.01em;font-size:${Math.round(heightPx * 0.72)}px;color:${opts.white ? '#fff' : INK}">smb<span style="color:${opts.white ? '#8FD0AE' : CORAL}">X</span>.ai</span>`;
  }
  return `<img src="${LOGO_URI}" alt="smbX.ai" style="height:${heightPx}px;width:auto;display:block;${opts.white ? 'filter:brightness(0) invert(1);' : ''}">`;
}

/* ─── palette (practice .pd language) ─────────────────────────────────── */
const INK = '#14181C';
const BODY = '#5C6670';
const TERT = '#8A9099';
const CORAL = '#16624C'; // Ledger Deal Green 2026-07-17 (historical const name)
const CORAL_DEEP = '#0F4E3C';
const CARD = '#FFFFFF';
const HAIR = '#E4E1D9';
const WARM = '#F6F4EF';
const DARK = '#0F1A16';
const IVORY = '#F3F1EA';
const IVORY_SUB = '#D8D5CA';
const BRASS = '#B08637';

const FONTS = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,400..600&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
`;
const SANS = `'Inter', -apple-system, 'Segoe UI', sans-serif`;
const DISPLAY = `'Fraunces', Georgia, 'Times New Roman', serif`;
const MONO = `'IBM Plex Mono', ui-monospace, 'SF Mono', monospace`;

function esc(s: string): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmtDate(d: Date | string | null | undefined): string {
  const date = d ? new Date(d) : new Date();
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

// Document-register names for the RESEARCH_TYPES keys (researchAgent.ts) —
// these stamp the report PDF header, where the Studio picker's conversational
// labels ("Any topic — full research") would read oddly.
const TYPE_LABELS: Record<string, string> = {
  vertical_scan: 'Sector Scan',
  participant_map: 'Market Map',
  buyer_roster: 'Buyer Landscape',
  deal_monitor: 'Recent Deals',
  thesis_validation: 'Thesis Check',
  topic_brief: 'Research Brief',
};

export interface ResearchRunRow {
  id: number;
  research_type: string;
  topic: string;
  depth: string;
  report_title: string | null;
  report_md: string | null;
  studio_feed: any;
  sources: Array<{ url: string; title: string }> | null;
  usage: any;
  completed_at: string | Date | null;
}

/* ─── the letter report ───────────────────────────────────────────────── */

async function reportBodyHtml(md: string): Promise<string> {
  // The H1 is rendered by the header block — strip the first one from the body.
  const withoutH1 = md.replace(/^\s*#\s+.+$/m, '').trim();
  return String(await marked.parse(withoutH1, { gfm: true, breaks: false }));
}

export async function researchReportHtml(run: ResearchRunRow): Promise<string> {
  const typeLabel = TYPE_LABELS[run.research_type] ?? 'Research Brief';
  const title = run.report_title || run.topic;
  const body = await reportBodyHtml(run.report_md || '');
  const sources = Array.isArray(run.sources) ? run.sources : [];
  const feed = run.studio_feed && typeof run.studio_feed === 'object' ? run.studio_feed : null;
  const photo = await authorPhoto();

  const sourcesHtml = sources.length
    ? `<section class="appendix">
        <h2>Sources</h2>
        <ol class="srcs">
          ${sources.map(s => `<li><span class="st">${esc(s.title)}</span><br><a href="${esc(s.url)}">${esc(s.url)}</a></li>`).join('')}
        </ol>
      </section>`
    : '';

  // FINDINGS-FIRST (Paul, 2026-07-19: the report must lead with what we FOUND,
  // as a document he can post). The cited data points open the document as a
  // Key-findings block; the internal Studio-feed appendix (hooks/angles —
  // marketing scaffolding) no longer ships in this PDF at all. It lives in the
  // review sheet, where it belongs.
  const points: any[] = feed && Array.isArray(feed.dataPoints) ? feed.dataPoints.slice(0, 4) : [];
  const findingsHtml = points.length
    ? `<section class="findings">
        <div class="ftag">KEY FINDINGS</div>
        ${points.map(p => `<div class="frow">
          <div class="fstat">${esc(p.stat)}</div>
          <div class="fsrc">${esc([p.source, p.freshness].filter(Boolean).join(' · '))}</div>
        </div>`).join('')}
      </section>`
    : '';

  const u = run.usage || {};
  return `<!DOCTYPE html><html><head><meta charset="utf-8">${FONTS}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${SANS}; color: ${INK}; background: #fff; font-size: 10.5pt; line-height: 1.62; }
    .kicker { display: flex; justify-content: space-between; align-items: center; font-family: ${MONO};
      font-size: 8pt; letter-spacing: 0.09em; color: ${TERT}; text-transform: uppercase; }
    .kicker .kl { display: flex; align-items: center; gap: 12px; }
    .rule { height: 3px; width: 64px; background: ${CORAL}; margin: 14px 0 22px; border-radius: 2px; }
    h1.title { font-family: ${DISPLAY}; font-size: 25pt; font-weight: 545; letter-spacing: -0.012em; line-height: 1.14; max-width: 9in; }
    .meta { margin-top: 10px; font-size: 9pt; color: ${TERT}; }
    .doc { margin-top: 26px; }
    .doc h2 { font-size: 13.5pt; font-weight: 800; letter-spacing: -0.01em; margin: 26px 0 10px; padding-top: 14px;
      border-top: 1px solid ${HAIR}; break-after: avoid; }
    .doc h2:first-child { border-top: none; padding-top: 0; margin-top: 0; }
    .doc h3 { font-size: 11pt; font-weight: 700; margin: 16px 0 6px; break-after: avoid; }
    .doc p { margin: 0 0 10px; color: ${BODY}; }
    .doc ul, .doc ol { margin: 0 0 12px 1.25em; color: ${BODY}; }
    .doc li { margin-bottom: 5px; }
    .doc a { color: ${CORAL_DEEP}; text-decoration: none; word-break: break-all; }
    .doc b, .doc strong { color: ${INK}; }
    .doc blockquote { border-left: 3px solid ${CORAL}; padding: 6px 0 6px 14px; margin: 12px 0; color: ${BODY}; background: ${CARD}; }
    .doc table { width: 100%; border-collapse: collapse; margin: 12px 0 16px; font-size: 9pt; break-inside: avoid; }
    .doc th { text-align: left; font-family: ${MONO}; font-size: 7.5pt; letter-spacing: 0.07em; text-transform: uppercase;
      color: ${TERT}; font-weight: 600; padding: 6px 10px; border-bottom: 2px solid ${INK}; }
    .doc td { padding: 7px 10px; border-bottom: 1px solid ${HAIR}; vertical-align: top; color: ${BODY}; }
    .doc tr:nth-child(even) td { background: ${CARD}; }
    /* TL;DR: the first h2's list reads as the executive summary */
    .appendix { margin-top: 30px; page-break-before: always; }
    .appendix h2 { font-size: 12pt; font-weight: 800; margin: 18px 0 8px; }
    .srcs { margin-left: 1.2em; font-size: 8.5pt; color: ${BODY}; }
    .srcs li { margin-bottom: 7px; }
    .srcs .st { font-weight: 600; color: ${INK}; }
    .srcs a { color: ${CORAL_DEEP}; text-decoration: none; word-break: break-all; }
    .byline { display: flex; align-items: center; gap: 10px; margin-top: 16px; }
    .byline .bn { font-size: 9.5pt; font-weight: 700; color: ${INK}; }
    .byline .bt { font-size: 8.5pt; color: ${TERT}; }
    .findings { margin-top: 22px; background: ${WARM}; border: 1px solid ${HAIR}; border-radius: 14px; padding: 18px 22px 8px; break-inside: avoid; }
    .ftag { font-family: ${MONO}; font-size: 7.5pt; letter-spacing: 0.1em; color: ${BRASS}; font-weight: 600; margin-bottom: 10px; }
    .frow { padding: 8px 0 10px; border-top: 1px solid ${HAIR}; }
    .frow:first-of-type { border-top: none; padding-top: 0; }
    .fstat { font-size: 11.5pt; font-weight: 700; color: ${INK}; letter-spacing: -0.008em; line-height: 1.35; }
    .fsrc { margin-top: 3px; font-family: ${MONO}; font-size: 7.5pt; color: ${TERT}; letter-spacing: 0.03em; }
    .disc { margin-top: 26px; padding-top: 12px; border-top: 1px solid ${HAIR}; font-size: 7.5pt; color: ${TERT}; line-height: 1.5; }
  </style></head><body>
    <div class="kicker"><span class="kl">${logoImg(24)}<span>RESEARCH FINDINGS · ${esc(typeLabel.toUpperCase())}</span></span><span>${esc(fmtDate(run.completed_at))}</span></div>
    <div class="rule"></div>
    <h1 class="title">${esc(title)}</h1>
    <div class="byline">
      ${faceImg(34, photo)}
      <div>
        <div class="bn">Paul Baker</div>
        <div class="bt">smbX — buy-side corporate development · ${esc(typeLabel)} · ${sources.length} sources</div>
      </div>
    </div>
    ${findingsHtml}
    <div class="doc">${body}</div>
    ${sourcesHtml}
    <div class="disc">Research by smbX. Figures are as reported by the cited sources; items marked (directional) are estimates. This document is not investment, legal, tax, or accounting advice and contains no opinion of value on any specific company. · ${esc(run.depth)} depth · ${Number(u.searches ?? 0)} searches</div>
  </body></html>`;
}

export async function renderResearchPdf(run: ResearchRunRow): Promise<Buffer> {
  const html = await researchReportHtml(run);
  const page = await newRenderPage();
  try {
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 45000 });
    await page.evaluateHandle('document.fonts.ready').catch(() => {});
    const pdf = await page.pdf({
      format: 'letter',
      printBackground: true,
      margin: { top: '0.85in', bottom: '0.9in', left: '0.85in', right: '0.85in' },
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: `<div style="width:100%;display:flex;justify-content:space-between;padding:0 0.85in;font-family:'IBM Plex Mono',monospace;font-size:7px;color:#9A9A9A;">
        <span>smbX — research, with sources</span>
        <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
      </div>`,
    });
    return Buffer.from(pdf);
  } finally {
    await page.close().catch(() => {});
  }
}

/* ─── the LinkedIn card (1080×1350) ───────────────────────────────────── */

export function researchCardHtml(run: ResearchRunRow, hookIndex = 0, photo: AuthorPhoto | null = null): string {
  const feed = run.studio_feed && typeof run.studio_feed === 'object' ? run.studio_feed : {};
  const hooks: string[] = Array.isArray(feed.hooks) ? feed.hooks : [];
  const hook = hooks[Math.min(Math.max(hookIndex, 0), Math.max(hooks.length - 1, 0))] || run.report_title || run.topic;
  const allPoints: any[] = (Array.isArray(feed.dataPoints) ? feed.dataPoints : []).slice(0, 3);
  const typeLabel = TYPE_LABELS[run.research_type] ?? 'Research';

  // The story motif (2026-07-19, Paul: graphics that carry the story): the
  // LEAD data point becomes the site's signature giant numeral — the number IS
  // the graphic, brass-jewelled, always from a cited stat, never decoration.
  const lead = allPoints[0] ?? null;
  const leadNum = lead ? firstNumberToken(lead.stat) : '';
  const heroStat = leadNum.length >= 2 ? lead : null;
  const rest = heroStat ? allPoints.slice(1) : allPoints;
  const heroCaption = heroStat ? String(heroStat.stat).replace(leadNum, '').replace(/^\s*[—–\-:,]\s*/, '').trim() : '';
  const numSize = leadNum.length > 9 ? 128 : leadNum.length > 6 ? 158 : 190;

  // Long hooks step the display size down so nothing clips at 1080 wide.
  const hookSize = hook.length > 150 ? 46 : hook.length > 100 ? 54 : hook.length > 60 ? 62 : 72;

  return `<!DOCTYPE html><html><head><meta charset="utf-8">${FONTS}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 1080px; height: 1350px; font-family: ${SANS}; color: ${INK}; background: ${WARM}; overflow: hidden; position: relative; font-variant-numeric: tabular-nums; }
    .wash { position: absolute; inset: 0; background:
      radial-gradient(820px 620px at 88% -6%, rgba(22,98,76,0.10), transparent 62%),
      radial-gradient(700px 560px at -8% 52%, rgba(176,134,55,0.07), transparent 60%); }
    .frame { position: absolute; inset: 0; display: flex; flex-direction: column; padding: 76px 88px 0; }
    .tag { display: flex; justify-content: space-between; align-items: center; font-family: ${MONO};
      font-size: 21px; letter-spacing: 0.1em; color: ${TERT}; text-transform: uppercase; }
    .tag .tl { display: flex; align-items: center; gap: 22px; }
    .hook { margin-top: 66px; font-family: ${DISPLAY}; font-size: ${hookSize}px; font-weight: 545; letter-spacing: -0.012em; line-height: 1.12; max-width: 900px; }
    .rule { height: 6px; width: 96px; background: ${CORAL}; border-radius: 3px; margin: 44px 0 0; }
    .hero { margin-top: 48px; }
    .hero .num { font-weight: 800; font-size: ${numSize}px; letter-spacing: -0.03em; line-height: 0.98; color: ${INK}; }
    .hero .bar { height: 8px; width: 132px; background: ${BRASS}; border-radius: 4px; margin: 26px 0 22px; }
    .hero .cap { font-size: 33px; font-weight: 700; letter-spacing: -0.012em; line-height: 1.3; color: ${INK}; max-width: 880px; }
    .hero .src { margin-top: 10px; font-family: ${MONO}; font-size: 18px; color: ${TERT}; letter-spacing: 0.02em; }
    .pts { margin-top: 44px; display: flex; flex-direction: column; gap: 30px; }
    .pt { display: flex; gap: 24px; align-items: flex-start; }
    .dot { width: 13px; height: 13px; border-radius: 50%; background: ${CORAL}; margin-top: 12px; flex: none; }
    .stat { font-size: 29px; font-weight: 700; letter-spacing: -0.012em; line-height: 1.3; color: ${INK}; }
    .src { margin-top: 7px; font-family: ${MONO}; font-size: 17px; color: ${TERT}; letter-spacing: 0.02em; }
    .foot { position: absolute; left: 0; right: 0; bottom: 0; height: 150px; background: ${DARK};
      ${DARK_TEXTURE_URI ? `background-image: url('${DARK_TEXTURE_URI}'); background-size: cover; background-position: center;` : ''}
      display: flex; align-items: center; justify-content: space-between; padding: 0 88px; }
    .foot::before { content: ''; position: absolute; inset: 0; background:
      radial-gradient(700px 220px at 30% 0%, rgba(84,150,118,0.20), transparent 70%),
      linear-gradient(180deg, rgba(15,26,22,0.30), rgba(13,23,19,0.45)); }
    .who { position: relative; display: flex; align-items: center; gap: 22px; }
    .who .wn { color: ${IVORY}; font-size: 24px; font-weight: 700; letter-spacing: -0.01em; }
    .who .wt { margin-top: 4px; color: ${IVORY_SUB}; font-size: 18px; font-weight: 500; }
    .foot .br { position: relative; }
  </style></head><body>
    <div class="wash"></div>
    <div class="frame">
      <div class="tag"><span class="tl">${logoImg(38)}<span>${esc(typeLabel.toUpperCase())}</span></span><span>${esc(fmtDate(run.completed_at))}</span></div>
      <div class="hook">${esc(hook)}</div>
      <div class="rule"></div>
      ${heroStat ? `<div class="hero">
        <div class="num">${esc(leadNum)}</div>
        <div class="bar"></div>
        ${heroCaption ? `<div class="cap">${esc(heroCaption)}</div>` : ''}
        <div class="src">${esc([heroStat.source, heroStat.freshness].filter(Boolean).join(' · '))}</div>
      </div>` : ''}
      ${rest.length ? `<div class="pts">${rest.map(p => `
        <div class="pt"><div class="dot"></div><div>
          <div class="stat">${esc(p.stat)}</div>
          <div class="src">${esc([p.source, p.freshness].filter(Boolean).join(' · '))}</div>
        </div></div>`).join('')}</div>` : ''}
    </div>
    <div class="foot">
      <div class="who">
        ${faceImg(96, photo, { ring: 'rgba(143,208,174,0.65)' })}
        <div>
          <div class="wn">Paul Baker</div>
          <div class="wt">Buy-side corporate development</div>
        </div>
      </div>
      <div class="br">${logoImg(50, { white: true })}</div>
    </div>
  </body></html>`;
}

export async function renderResearchCardPng(run: ResearchRunRow, hookIndex = 0): Promise<Buffer> {
  const photo = await authorPhoto();
  const html = researchCardHtml(run, hookIndex, photo);
  const page = await newRenderPage();
  try {
    await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 45000 });
    await page.evaluateHandle('document.fonts.ready').catch(() => {});
    const png = await page.screenshot({ type: 'png' });
    return Buffer.from(png);
  } finally {
    await page.close().catch(() => {});
  }
}

/* ─── the ready-to-paste LinkedIn post text ────────────────────────────── */

/**
 * The post text the 1-pager image (or doc PDF) ships with. Prefers the
 * synthesized feed.post.text; older runs without one get an honest assembly
 * from the hook + top cited data points — never invented copy.
 */
export function researchPostText(run: ResearchRunRow): string {
  const feed = run.studio_feed && typeof run.studio_feed === 'object' ? run.studio_feed : {};
  const post = feed.post;
  if (post && typeof post.text === 'string' && post.text.trim().length > 40) return post.text.trim();

  const hooks: string[] = Array.isArray(feed.hooks) ? feed.hooks : [];
  const hook = hooks[0] || run.report_title || run.topic;
  const points: any[] = (Array.isArray(feed.dataPoints) ? feed.dataPoints : []).slice(0, 3);
  const lines: string[] = [hook, ''];
  for (const p of points) lines.push(`— ${p.stat}${p.source ? ` (${p.source})` : ''}`);
  if (points.length) lines.push('');
  lines.push('From our latest research read on this market.');
  lines.push('');
  lines.push('#MergersAndAcquisitions #CorporateDevelopment #LowerMiddleMarket');
  return lines.join('\n');
}

/* ─── the LinkedIn document post (swipeable 1080×1350 PDF) ─────────────── */

interface DocPage { kind: string; heading?: string; body?: string; stat?: string; source?: string }

/** Normalize the synthesized deck; older runs fall back to hook + data points. */
function docPages(run: ResearchRunRow): DocPage[] {
  const feed = run.studio_feed && typeof run.studio_feed === 'object' ? run.studio_feed : {};
  const raw: any[] = Array.isArray(feed.docPages) ? feed.docPages : [];
  const KINDS = new Set(['cover', 'stat', 'story', 'takeaway']);
  let pages = raw
    .filter(p => p && KINDS.has(p.kind) && typeof p.heading === 'string' && p.heading.trim())
    .slice(0, 10);
  if (!pages.some(p => p.kind === 'cover')) pages = [];  // a deck without a cover is malformed — rebuild
  if (!pages.length) {
    const hooks: string[] = Array.isArray(feed.hooks) ? feed.hooks : [];
    const points: any[] = (Array.isArray(feed.dataPoints) ? feed.dataPoints : []).slice(0, 5);
    const angles: any[] = Array.isArray(feed.angles) ? feed.angles : [];
    pages = [
      { kind: 'cover', heading: hooks[0] || run.report_title || run.topic, body: 'What the sourced numbers actually say.' },
      ...points.map(p => ({ kind: 'stat', stat: firstNumberToken(p.stat), heading: p.stat, body: '', source: [p.source, p.freshness].filter(Boolean).join(' · ') })),
      ...(angles[0]?.body ? [{ kind: 'takeaway', heading: 'What this means for an acquirer', body: angles[0].body }] : []),
    ];
  }
  return pages;
}

/** Pull a short display numeral ("$4.2B", "38%", "1,900") off a stat sentence. */
function firstNumberToken(stat: string): string {
  const m = /(?:[$€£]\s?)?\d[\d,.]*(?:\s?[%xX×]|\s?(?:billion|million|bn|mm|M|B|K|k))?/.exec(String(stat ?? ''));
  return (m ? m[0] : '').trim();
}

/** The run's generated story artwork (artworkService files it into the media
 *  library with run provenance). Null when none was generated — callers fall
 *  back to the procedural motif. */
export async function runArtwork(runId: number): Promise<AuthorPhoto | null> {
  try {
    const assets = await listStudioAssets();
    const pick = assets.find(a => a.kind !== 'collateral' && (a as any).run_id === runId && /^Artwork/i.test(a.label) && a.mime.startsWith('image/'));
    if (!pick) return null;
    const full = await getStudioAsset(pick.id);
    if (!full) return null;
    return { dataUri: `data:${full.mime};base64,${full.data.toString('base64')}`, focalX: full.focal_x, focalY: full.focal_y };
  } catch { return null; }
}

/* ─── Procedural editorial motif (2026-07-20) ──────────────────────────────
 * When a run has no generated artwork, the pages still carry a graphic: a
 * deterministic composition of arcs, a brass diagonal, dots, and (for
 * structural lenses) grid lines — seeded by the run id so each deck is its
 * own, in the Ledger palette, always abstract, never fake data. */
function motifSvg(type: string, seed: number, w: number, h: number, dark = false): string {
  let s = (seed >>> 0) || 1;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const ink = dark ? 'rgba(243,241,234,0.10)' : 'rgba(20,24,28,0.07)';
  const green = dark ? 'rgba(143,208,174,0.38)' : 'rgba(22,98,76,0.30)';
  const brass = dark ? 'rgba(176,134,55,0.7)' : 'rgba(176,134,55,0.55)';
  const cx = w * (0.62 + rnd() * 0.3);
  const cy = h * (0.12 + rnd() * 0.22);
  const rings = Array.from({ length: 5 }, (_, i) =>
    `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${((i + 2) * (h / 8.5)).toFixed(0)}" fill="none" stroke="${i === 2 ? green : ink}" stroke-width="${i === 2 ? 3 : 2}"/>`).join('');
  const diag = type === 'thesis_validation'
    ? `<line x1="${w * 0.08}" y1="${h * 0.88}" x2="${w * 0.62}" y2="${h * 0.22}" stroke="${brass}" stroke-width="6" stroke-linecap="round"/>
       <line x1="${w * 0.22}" y1="${h * 0.18}" x2="${w * 0.86}" y2="${h * 0.84}" stroke="${green}" stroke-width="3" stroke-linecap="round"/>`
    : `<line x1="${w * 0.06}" y1="${h * 0.86}" x2="${w * 0.94}" y2="${h * 0.28}" stroke="${brass}" stroke-width="6" stroke-linecap="round"/>`;
  const dots = Array.from({ length: 8 }, () =>
    `<circle cx="${(w * rnd()).toFixed(0)}" cy="${(h * rnd()).toFixed(0)}" r="5" fill="${green}"/>`).join('');
  const grid = (type === 'vertical_scan' || type === 'participant_map' || type === 'buyer_roster')
    ? Array.from({ length: 4 }, (_, i) => `<line x1="${((w / 5) * (i + 1)).toFixed(0)}" y1="0" x2="${((w / 5) * (i + 1)).toFixed(0)}" y2="${h}" stroke="${ink}" stroke-width="1.5"/>`).join('')
    : '';
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${grid}${rings}${diag}${dots}</svg>`;
}

export function linkedInDocHtml(run: ResearchRunRow, photo: AuthorPhoto | null = null, art: AuthorPhoto | null = null): string {
  const feed = run.studio_feed && typeof run.studio_feed === 'object' ? run.studio_feed : {};
  const typeLabel = TYPE_LABELS[run.research_type] ?? 'Research';
  const pages = docPages(run);
  const seed = Number(run.id) || 7;
  const ghost = (n: number) => `<div class="ghost">${String(n).padStart(2, '0')}</div>`;
  const sideMotif = `<div class="motif">${motifSvg(run.research_type, seed, 520, 520)}</div>`;
  const chart = feed.chart && Array.isArray(feed.chart.labels) && Array.isArray(feed.chart.values)
    && feed.chart.labels.length >= 3 && feed.chart.labels.length === feed.chart.values.length
    && feed.chart.values.every((v: any) => typeof v === 'number' && Number.isFinite(v))
    ? feed.chart : null;

  const kicker = (n: number, total: number) => `
    <div class="kick"><span class="kl">${logoImg(30)}<span>${esc(typeLabel.toUpperCase())}</span></span><span>${n} / ${total}</span></div>`;

  // Total = content pages + optional chart page + closer.
  const total = pages.length + (chart ? 1 : 0) + 1;
  let n = 0;
  const pageHtml: string[] = [];

  for (const p of pages) {
    n++;
    if (p.kind === 'cover') {
      const h = String(p.heading ?? '');
      // The cover carries the STORY VISUAL: the run's generated artwork when
      // one exists, else the procedural motif — never a bare text page.
      const size = h.length > 120 ? 54 : h.length > 80 ? 62 : h.length > 50 ? 72 : 84;
      const artPanel = art?.dataUri
        ? `<div class="cover-art"><img src="${art.dataUri}" style="width:100%;height:100%;object-fit:cover;object-position:${Math.round(art.focalX * 100)}% ${Math.round(art.focalY * 100)}%;display:block"></div>`
        : `<div class="cover-art motifbox">${motifSvg(run.research_type, seed, 400, 760)}</div>`;
      pageHtml.push(`<div class="pg">
        <div class="wash"></div>
        <div class="in">
          <div class="kick"><span class="kl">${logoImg(40)}<span>${esc(typeLabel.toUpperCase())}</span></span><span>${esc(fmtDate(run.completed_at))}</span></div>
          <div class="cover-row">
            <div class="cover-txt">
              <div class="cover-h" style="font-size:${size}px">${esc(h)}</div>
              <div class="rule" style="margin-top:44px"></div>
              ${p.body ? `<div class="cover-sub">${esc(p.body)}</div>` : ''}
            </div>
            ${artPanel}
          </div>
          <div class="cover-by">
            ${faceImg(88, photo, { ring: 'rgba(22,98,76,0.35)' })}
            <div>
              <div class="cby-n">Paul Baker</div>
              <div class="cby-t">Buy-side corporate development</div>
            </div>
          </div>
          <div class="swipe">SWIPE&nbsp;&nbsp;→</div>
        </div>
      </div>`);
    } else if (p.kind === 'stat') {
      const numeral = String(p.stat ?? '').trim() || firstNumberToken(p.heading ?? '');
      const numSize = numeral.length > 8 ? 120 : numeral.length > 5 ? 150 : 184;
      pageHtml.push(`<div class="pg">
        <div class="wash"></div>
        ${ghost(n)}
        ${sideMotif}
        <div class="in">
          ${kicker(n, total)}
          <div class="grow">
            <div class="numeral" style="font-size:${numSize}px">${esc(numeral)}</div>
            <div class="brassbar"></div>
            <div class="stat-h">${esc(p.heading ?? '')}</div>
            ${p.body ? `<div class="stat-b">${esc(p.body)}</div>` : ''}
          </div>
          ${p.source ? `<div class="src-line">${esc(p.source)}</div>` : ''}
        </div>
      </div>`);
    } else if (p.kind === 'takeaway') {
      // The takeaway flips to the boardroom band — the deck's dark punctuation.
      pageHtml.push(`<div class="pg dark">
        <div class="halo"></div>
        <div class="motif dark-motif">${motifSvg(run.research_type, seed + 3, 520, 520, true)}</div>
        <div class="in">
          <div class="kick dark-kick"><span class="kl">${logoImg(30, { white: true })}<span>${esc(typeLabel.toUpperCase())}</span></span><span>${n} / ${total}</span></div>
          <div class="grow">
            <div class="take-tag">FOR THE ACQUIRER</div>
            <div class="story-h dark-h">${esc(p.heading ?? '')}</div>
            <div class="rule"></div>
            ${p.body ? `<div class="story-b dark-b">${esc(p.body)}</div>` : ''}
          </div>
        </div>
      </div>`);
    } else { // story
      pageHtml.push(`<div class="pg">
        <div class="wash"></div>
        ${ghost(n)}
        ${sideMotif}
        <div class="in">
          ${kicker(n, total)}
          <div class="grow">
            <div class="story-h">${esc(p.heading ?? '')}</div>
            <div class="rule"></div>
            ${p.body ? `<div class="story-b">${esc(p.body)}</div>` : ''}
          </div>
        </div>
      </div>`);
    }
  }

  if (chart) {
    n++;
    pageHtml.push(`<div class="pg">
      <div class="wash"></div>
      <div class="in">
        ${kicker(n, total)}
        <div class="grow">
          <div class="story-h" style="font-size:52px">${esc(chart.title ?? 'The numbers')}</div>
          <div class="rule"></div>
          <div class="chart-panel"><canvas id="c1" width="880" height="720"></canvas></div>
          ${chart.unit ? `<div class="chart-unit">${esc(chart.unit)}</div>` : ''}
        </div>
        ${chart.source ? `<div class="src-line">${esc(chart.source)}</div>` : ''}
      </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
    <script>
      new Chart(document.getElementById('c1'), {
        type: 'bar',
        data: { labels: ${JSON.stringify(chart.labels.map((l: any) => String(l)))},
                datasets: [{ data: ${JSON.stringify(chart.values)}, backgroundColor: '${CORAL}', borderRadius: 8, maxBarThickness: 88 }] },
        options: { responsive: false, animation: false, devicePixelRatio: 2,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { family: 'IBM Plex Mono', size: 17 }, color: '${TERT}' } },
            y: { grid: { color: '${HAIR}' }, ticks: { font: { family: 'IBM Plex Mono', size: 17 }, color: '${TERT}' } }
          } }
      });
    </script>`);
  }

  // Closer — the site's dark textured band; the FACE closes the doc (that's
  // what makes a follow card work), brand beneath it.
  pageHtml.push(`<div class="pg dark">
    <div class="halo"></div>
    <div class="in closer">
      <div class="close-face">${faceImg(148, photo, { ring: 'rgba(143,208,174,0.7)' })}</div>
      <div class="close-name">Paul Baker</div>
      <div class="close-line">Research with sources, not takes.</div>
      <div class="brand-big">${logoImg(96, { white: true })}</div>
      <div class="close-sub">Buy-side corporate development for lower-middle-market acquirers.</div>
      <div class="follow">Follow for the next read.</div>
    </div>
  </div>`);

  return `<!DOCTYPE html><html><head><meta charset="utf-8">${FONTS}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 1080px; }
    body { font-family: ${SANS}; color: ${INK}; }
    .pg { width: 1080px; height: 1350px; position: relative; overflow: hidden; background: ${WARM}; page-break-after: always; }
    .pg:last-child { page-break-after: auto; }
    .wash { position: absolute; inset: 0; background:
      radial-gradient(720px 560px at 88% -6%, rgba(22,98,76,0.075), transparent 62%),
      radial-gradient(640px 520px at -8% 44%, rgba(255,116,140,0.055), transparent 60%); }
    .in { position: absolute; inset: 0; display: flex; flex-direction: column; padding: 76px 88px 84px; }
    .kick { display: flex; justify-content: space-between; align-items: center; font-family: ${MONO};
      font-size: 21px; letter-spacing: 0.1em; color: ${TERT}; text-transform: uppercase; }
    .kick .kl { display: flex; align-items: center; gap: 24px; }
    .rule { height: 6px; width: 96px; background: ${CORAL}; border-radius: 3px; }
    .grow { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 34px; }
    /* editorial graphics layer */
    .ghost { position: absolute; top: 34px; right: 52px; font-family: ${DISPLAY}; font-weight: 545; font-size: 320px;
      line-height: 1; color: rgba(20,24,28,0.055); letter-spacing: -0.03em; }
    .motif { position: absolute; right: -90px; bottom: -110px; width: 520px; height: 520px; }
    .dark-motif { opacity: 0.9; }
    .brassbar { height: 8px; width: 132px; background: ${BRASS}; border-radius: 4px; }
    /* cover */
    .cover-row { margin-top: 96px; display: flex; gap: 52px; align-items: stretch; }
    .cover-txt { flex: 1; min-width: 0; display: flex; flex-direction: column; }
    .cover-art { width: 400px; height: 760px; flex: none; border-radius: 24px; overflow: hidden;
      box-shadow: 0 30px 80px rgba(15,26,22,0.22); background: #fff; }
    .cover-art.motifbox { background: #fff; border: 1px solid ${HAIR}; box-shadow: 0 20px 60px rgba(15,26,22,0.12); }
    .cover-h { font-family: ${DISPLAY}; font-weight: 545; letter-spacing: -0.012em; line-height: 1.12; }
    .cover-sub { margin-top: 36px; font-size: 31px; color: ${BODY}; line-height: 1.42; max-width: 560px; }
    .cover-by { position: absolute; left: 88px; bottom: 76px; display: flex; align-items: center; gap: 24px; }
    .cby-n { font-size: 26px; font-weight: 700; color: ${INK}; letter-spacing: -0.01em; }
    .cby-t { margin-top: 4px; font-size: 19px; color: ${TERT}; font-weight: 500; }
    .swipe { position: absolute; right: 88px; bottom: 96px; font-family: ${MONO}; font-size: 22px; letter-spacing: 0.14em; color: ${CORAL_DEEP}; font-weight: 600; }
    /* stat */
    .numeral { font-weight: 800; letter-spacing: -0.03em; line-height: 1; color: ${INK}; }
    .stat-h { font-size: 40px; font-weight: 700; letter-spacing: -0.014em; line-height: 1.22; max-width: 880px; }
    .stat-b { font-size: 29px; color: ${BODY}; line-height: 1.45; max-width: 860px; }
    .src-line { font-family: ${MONO}; font-size: 19px; color: ${TERT}; letter-spacing: 0.02em; }
    /* story / takeaway */
    .story-h { font-family: ${DISPLAY}; font-size: 58px; font-weight: 545; letter-spacing: -0.012em; line-height: 1.16; max-width: 890px; }
    .story-b { font-size: 32px; color: ${BODY}; line-height: 1.5; max-width: 860px; }
    .dark-h { color: ${IVORY}; }
    .dark-b { color: ${IVORY_SUB}; }
    .dark-kick { color: ${IVORY_SUB}; }
    .take-tag { font-family: ${MONO}; font-size: 20px; letter-spacing: 0.12em; color: ${BRASS}; font-weight: 600; }
    /* chart */
    .chart-panel { background: #fff; border: 1px solid ${HAIR}; border-radius: 20px; padding: 34px; width: 904px; }
    .chart-unit { font-size: 24px; color: ${BODY}; }
    /* closer */
    .pg.dark { background: ${DARK}; ${DARK_TEXTURE_URI ? `background-image: url('${DARK_TEXTURE_URI}'); background-size: cover; background-position: center;` : ''} }
    .halo { position: absolute; inset: 0; background:
      radial-gradient(900px 500px at 50% -10%, rgba(22,98,76,0.28), transparent 65%),
      linear-gradient(180deg, rgba(20,19,18,0.25), rgba(20,20,20,0.55)); }
    .closer { justify-content: center; align-items: center; text-align: center; gap: 0; }
    .close-face { display: flex; justify-content: center; }
    .close-name { margin-top: 26px; font-size: 30px; font-weight: 700; color: ${IVORY}; letter-spacing: -0.01em; }
    .close-line { margin-top: 14px; font-family: ${DISPLAY}; font-size: 40px; font-weight: 545; color: ${IVORY}; letter-spacing: -0.01em; }
    .brand-big { margin-top: 42px; display: flex; align-items: center; justify-content: center; }
    .close-sub { margin-top: 28px; font-size: 30px; color: ${IVORY_SUB}; max-width: 760px; line-height: 1.45; }
    .follow { margin-top: 54px; font-family: ${MONO}; font-size: 22px; letter-spacing: 0.12em; color: #8FD0AE; font-weight: 600; text-transform: uppercase; }
  </style></head><body>${pageHtml.join('\n')}</body></html>`;
}

export async function renderLinkedInDocPdf(run: ResearchRunRow): Promise<Buffer> {
  const photo = await authorPhoto();
  const art = await runArtwork(Number(run.id));
  const html = linkedInDocHtml(run, photo, art);
  const page = await newRenderPage();
  try {
    await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.evaluateHandle('document.fonts.ready').catch(() => {});
    // Chart.js renders synchronously with animation:false; a beat for raster.
    await new Promise(r => setTimeout(r, 150));
    const pdf = await page.pdf({
      width: '1080px', height: '1350px', printBackground: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    });
    return Buffer.from(pdf);
  } finally {
    await page.close().catch(() => {});
  }
}

/* ═══ Announcement card (2026-07-17) ═══════════════════════════════════════
 * The approved "open for business" 1-pager, productized: two compositions
 * (light editorial split · dark textured) with parametrized copy and a photo
 * from the Studio media library. The photo's focal point drives the crop
 * (object-position) so faces stay framed in any slot. Same brand system as
 * every other artifact: real logo in the site's two treatments, coral accents,
 * blackbleed texture on dark.
 */
export interface AnnouncementPhoto { dataUri: string; focalX: number; focalY: number }
export interface AnnouncementSpec {
  variant: 'light' | 'dark';
  headline: string;   // ink (light) / white (dark) opening line(s)
  accent: string;     // the coral continuation line
  sub: string;        // muted paragraph under the rule
  bullets: string[];  // 0–4 coral-dot bullets; *word* renders italic
  mandate: string;    // bold closing line
  kicker?: string;    // dark variant's top-right mono label (default "Announcement")
  footerTag: string;  // mono coral-pink footer line
  footerNote?: string; // dark variant's plain right-side footer text
  photo?: AnnouncementPhoto | null;
}

const annEsc = (s: string) => esc(s).replace(/\*([^*]+)\*/g, '<i>$1</i>');
const annPos = (p?: AnnouncementPhoto | null) => p ? `${Math.round(p.focalX * 100)}% ${Math.round(p.focalY * 100)}%` : '50% 25%';

function annPhotoBlock(radius: number, photo?: AnnouncementPhoto | null): string {
  if (photo?.dataUri) {
    return `<img src="${photo.dataUri}" style="width:100%;height:100%;object-fit:cover;object-position:${annPos(photo)};display:block;border-radius:${radius}px">`;
  }
  return `<div style="width:100%;height:100%;border-radius:${radius}px;background:repeating-linear-gradient(45deg,#ECE9E6 0 26px,#F5F2EF 26px 52px);display:flex;align-items:center;justify-content:center;text-align:center;padding:40px"><div style="font-family:${MONO};font-size:19px;letter-spacing:0.08em;color:#8A8A8A;text-transform:uppercase;line-height:2">Photo slot<br>upload media in Studio</div></div>`;
}

function annBullets(spec: AnnouncementSpec, dark: boolean): string {
  return spec.bullets.filter(b => b.trim()).slice(0, 4).map(b => `
  <div style="display:flex;gap:18px;align-items:flex-start">
    <span style="width:11px;height:11px;border-radius:50%;background:${CORAL};flex:none;margin-top:11px"></span>
    <span style="font-size:${dark ? '25.5px' : '22.5px'};line-height:1.55;color:${dark ? '#F4F4F4' : INK};font-weight:500">${annEsc(b)}</span>
  </div>`).join('');
}

export function announcementCardHtml(spec: AnnouncementSpec): string {
  if (spec.variant === 'dark') {
    return `<!doctype html><meta charset="utf-8">${FONTS}<style>*{margin:0;padding:0;box-sizing:border-box}</style>
<div style="width:1080px;height:1350px;position:relative;background:${DARK} ${DARK_TEXTURE_URI ? `url('${DARK_TEXTURE_URI}') center/cover` : ''};overflow:hidden;font-family:${SANS};font-variant-numeric:tabular-nums">
  <div style="position:absolute;inset:0;background:
    radial-gradient(900px 480px at 50% 0%, rgba(84,150,118,0.16), transparent 60%),
    linear-gradient(180deg, rgba(15,26,22,0.24), rgba(13,23,19,0.44))"></div>
  <div style="position:relative;height:100%;padding:60px 66px 56px;display:flex;flex-direction:column">
    <div style="display:flex;align-items:center;justify-content:space-between">
      ${logoImg(42, { white: true })}
      <div style="font-family:${MONO};font-size:18px;letter-spacing:0.1em;color:${BRASS};text-transform:uppercase">${annEsc(spec.kicker || 'Announcement')}</div>
    </div>
    <div style="margin-top:46px;display:flex;gap:48px;align-items:stretch">
      <div style="width:432px;height:544px;flex:none;box-shadow:0 30px 80px rgba(0,0,0,0.5)">${annPhotoBlock(24, spec.photo)}</div>
      <div style="display:flex;flex-direction:column;justify-content:center">
        <div style="font-family:${DISPLAY};font-weight:545;font-size:58px;line-height:1.12;letter-spacing:-0.012em;color:${IVORY}">${annEsc(spec.headline)}<br><span style="color:#8FD0AE">${annEsc(spec.accent)}</span></div>
        <div style="width:70px;height:6px;background:${CORAL};border-radius:99px;margin-top:30px"></div>
        <div style="margin-top:28px;font-size:22.5px;line-height:1.55;color:${IVORY_SUB};font-weight:500">${annEsc(spec.sub)}</div>
      </div>
    </div>
    <div style="margin-top:auto;display:flex;flex-direction:column;gap:36px;max-width:940px">${annBullets(spec, true)}</div>
    <div style="margin-top:auto;font-size:28px;line-height:1.45;color:${IVORY};font-weight:700;max-width:920px;padding-bottom:4px">${annEsc(spec.mandate)}</div>
    <div style="margin-top:34px;border-top:1px solid rgba(243,241,234,0.14);padding-top:26px;display:flex;align-items:center;justify-content:space-between">
      <div style="font-family:${MONO};font-size:19px;letter-spacing:0.1em;color:#8FD0AE;text-transform:uppercase">${annEsc(spec.footerTag)}</div>
      <div style="font-size:18px;color:${IVORY_SUB};font-weight:500">${annEsc(spec.footerNote || '')}</div>
    </div>
  </div>
</div>`;
  }
  return `<!doctype html><meta charset="utf-8">${FONTS}<style>*{margin:0;padding:0;box-sizing:border-box}</style>
<div style="width:1080px;height:1350px;position:relative;background:${WARM};overflow:hidden;font-family:${SANS};font-variant-numeric:tabular-nums">
  <div style="position:absolute;inset:0;background:
    radial-gradient(1200px 800px at 8% 0%, rgba(22,98,76,0.045), transparent 60%),
    radial-gradient(900px 700px at 100% 100%, rgba(203,193,170,0.16), transparent 55%)"></div>
  <div style="position:absolute;left:0;top:0;bottom:128px;width:512px;padding:60px 46px 0 60px;display:flex;flex-direction:column">
    <div style="align-self:flex-start">${logoImg(42)}</div>
    <div style="margin-top:64px;font-family:${DISPLAY};font-weight:545;font-size:52px;line-height:1.12;letter-spacing:-0.012em;color:${INK}">${annEsc(spec.headline)}<br><span style="color:${CORAL_DEEP}">${annEsc(spec.accent)}</span></div>
    <div style="width:70px;height:6px;background:${CORAL};border-radius:99px;margin:34px 0 30px"></div>
    <div style="font-size:22px;line-height:1.5;color:${TERT};font-weight:500">${annEsc(spec.sub)}</div>
    <div style="margin-top:36px;display:flex;flex-direction:column;gap:22px">${annBullets(spec, false)}</div>
    <div style="margin-top:auto;padding-bottom:48px;font-size:23.5px;line-height:1.45;color:${INK};font-weight:700">${annEsc(spec.mandate)}</div>
  </div>
  <div style="position:absolute;left:536px;top:0;bottom:128px;right:0">${annPhotoBlock(0, spec.photo)}
    <div style="position:absolute;inset:0;background:linear-gradient(90deg, ${WARM} 0%, transparent 9%)"></div>
  </div>
  <div style="position:absolute;left:0;right:0;bottom:0;height:128px;background:${DARK};display:flex;align-items:center;justify-content:space-between;padding:0 60px">
    ${logoImg(48, { white: true })}
    <div style="font-family:${MONO};font-size:19px;letter-spacing:0.1em;color:#8FD0AE;text-transform:uppercase">${annEsc(spec.footerTag)}</div>
  </div>
</div>`;
}

export async function renderAnnouncementCardPng(spec: AnnouncementSpec): Promise<Buffer> {
  const page = await newRenderPage();
  try {
    await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
    await page.setContent(announcementCardHtml(spec), { waitUntil: 'networkidle0', timeout: 60000 });
    await page.evaluateHandle('document.fonts.ready').catch(() => {});
    await new Promise(r => setTimeout(r, 150));
    return Buffer.from(await page.screenshot({ type: 'png' }));
  } finally {
    await page.close().catch(() => {});
  }
}


/* ─── Post cards — the daily-campaign template rack (2026-07-18) ──────────
 * Four 1080×1350 layouts in the Ledger system, one per content kind:
 *   stat     — one big brass number + serif claim + source (light/dark)
 *   quote    — serif pull-quote + attribution photo chip (light/dark)
 *   thesis   — sector teardown: title + mono-labeled rows + THE READ box
 *   playbook — numbered steps
 * All share the brand shell: logo header + mono kicker, green-black footer.
 */

export type PostCardTemplate = 'stat' | 'quote' | 'thesis' | 'playbook';

export interface PostCardSpec {
  template: PostCardTemplate;
  variant?: 'light' | 'dark';
  kicker?: string;
  value?: string;
  claim?: string;
  source?: string;
  quote?: string;
  name?: string;
  role?: string;
  title?: string;
  rows?: Array<{ k: string; v: string }>;
  insight?: string;
  steps?: string[];
  footerTag: string;
  photo?: AnnouncementPhoto | null;
}

const cardHead = (dark: boolean, kicker: string) => `
  <div style="display:flex;align-items:center;justify-content:space-between">
    ${logoImg(42, { white: dark })}
    <div style="font-family:${MONO};font-size:18px;letter-spacing:0.1em;color:${dark ? BRASS : TERT};text-transform:uppercase">${annEsc(kicker)}</div>
  </div>`;

/** Light cards end on the 128px boardroom footer band; dark cards close with
 *  a hairline row (the whole canvas is already the boardroom). */
const cardFootLight = (footerTag: string) => `
  <div style="position:absolute;left:0;right:0;bottom:0;height:128px;background:${DARK};display:flex;align-items:center;justify-content:space-between;padding:0 60px">
    ${logoImg(48, { white: true })}
    <div style="font-family:${MONO};font-size:19px;letter-spacing:0.1em;color:#8FD0AE;text-transform:uppercase">${annEsc(footerTag)}</div>
  </div>`;
const cardFootDark = (footerTag: string) => `
  <div style="margin-top:auto;border-top:1px solid rgba(243,241,234,0.14);padding-top:26px;display:flex;align-items:center;justify-content:space-between">
    <div style="font-family:${MONO};font-size:19px;letter-spacing:0.1em;color:#8FD0AE;text-transform:uppercase">${annEsc(footerTag)}</div>
  </div>`;

const cardShell = (dark: boolean, kicker: string, footerTag: string, body: string) => dark
  ? `<!doctype html><meta charset="utf-8">${FONTS}<style>*{margin:0;padding:0;box-sizing:border-box}</style>
<div style="width:1080px;height:1350px;position:relative;background:${DARK} ${DARK_TEXTURE_URI ? `url('${DARK_TEXTURE_URI}') center/cover` : ''};overflow:hidden;font-family:${SANS};font-variant-numeric:tabular-nums">
  <div style="position:absolute;inset:0;background:
    radial-gradient(900px 480px at 50% 0%, rgba(84,150,118,0.16), transparent 60%),
    linear-gradient(180deg, rgba(15,26,22,0.24), rgba(13,23,19,0.44))"></div>
  <div style="position:relative;height:100%;padding:60px 66px 56px;display:flex;flex-direction:column">
    ${cardHead(true, kicker)}
    ${body}
    ${cardFootDark(footerTag)}
  </div>
</div>`
  : `<!doctype html><meta charset="utf-8">${FONTS}<style>*{margin:0;padding:0;box-sizing:border-box}</style>
<div style="width:1080px;height:1350px;position:relative;background:${WARM};overflow:hidden;font-family:${SANS};font-variant-numeric:tabular-nums">
  <div style="position:absolute;inset:0;background:
    radial-gradient(1200px 800px at 8% 0%, rgba(22,98,76,0.045), transparent 60%),
    radial-gradient(900px 700px at 100% 100%, rgba(203,193,170,0.16), transparent 55%)"></div>
  <div style="position:absolute;inset:0 0 128px 0;padding:60px 66px 48px;display:flex;flex-direction:column">
    ${cardHead(false, kicker)}
    ${body}
  </div>
  ${cardFootLight(footerTag)}
</div>`;

function statSize(v: string): number {
  const n = v.length;
  if (n <= 4) return 300;
  if (n <= 6) return 250;
  if (n <= 9) return 190;
  return 140;
}

function quoteSize(q: string): number {
  const n = q.length;
  if (n <= 120) return 56;
  if (n <= 200) return 48;
  if (n <= 300) return 42;
  return 36;
}

export function postCardHtml(spec: PostCardSpec): string {
  const dark = spec.variant === 'dark';

  if (spec.template === 'stat') {
    const v = spec.value || '—';
    const size = spec.photo ? Math.min(statSize(v), 210) : statSize(v);
    const claimSize = spec.photo ? 38 : 46;
    const inner = `
      <div style="font-size:${size}px;font-weight:800;letter-spacing:-0.03em;line-height:0.95;color:${BRASS}">${annEsc(v)}</div>
      <div style="margin-top:${spec.photo ? 30 : 38}px;font-family:${DISPLAY};font-weight:545;font-size:${claimSize}px;line-height:1.18;letter-spacing:-0.01em;color:${dark ? IVORY : INK};max-width:900px">${annEsc(spec.claim || '')}</div>
      ${spec.source ? `<div style="margin-top:${spec.photo ? 24 : 30}px;font-family:${MONO};font-size:17px;letter-spacing:0.07em;color:${dark ? IVORY_SUB : TERT};text-transform:uppercase">${annEsc(spec.source)}</div>` : ''}`;
    const body = spec.photo
      ? `
    <div style="flex:1;display:flex;align-items:center;gap:52px;min-height:0">
      <div style="flex:1;min-width:0">${inner}</div>
      <div style="width:380px;height:640px;flex:none;box-shadow:0 30px 80px rgba(0,0,0,${dark ? '0.5' : '0.22'})">${annPhotoBlock(24, spec.photo)}</div>
    </div>`
      : `
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center">${inner}</div>`;
    return cardShell(dark, spec.kicker || 'The number', spec.footerTag, body);
  }

  if (spec.template === 'quote') {
    const q = spec.quote || '';
    const attribution = `
      <div>
        <div style="font-size:21px;font-weight:800;color:${dark ? IVORY : INK}">${annEsc(spec.name || '')}</div>
        <div style="margin-top:4px;font-size:17.5px;font-weight:500;color:${dark ? IVORY_SUB : BODY}">${annEsc(spec.role || '')}</div>
      </div>`;
    const body = spec.photo
      ? `
    <div style="flex:1;display:flex;align-items:center;gap:50px;min-height:0">
      <div style="width:400px;height:560px;flex:none;box-shadow:0 30px 80px rgba(0,0,0,${dark ? '0.5' : '0.22'})">${annPhotoBlock(24, spec.photo)}</div>
      <div style="flex:1;min-width:0">
        <div style="font-family:${DISPLAY};font-size:110px;line-height:0.6;color:${dark ? '#8FD0AE' : CORAL};margin-bottom:6px">“</div>
        <div style="font-family:${DISPLAY};font-weight:545;font-size:${Math.min(quoteSize(q), 46)}px;line-height:1.22;letter-spacing:-0.01em;color:${dark ? IVORY : INK}">${annEsc(q)}</div>
        <div style="margin-top:44px">${attribution}</div>
      </div>
    </div>`
      : `
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center">
      <div style="font-family:${DISPLAY};font-size:120px;line-height:0.6;color:${dark ? '#8FD0AE' : CORAL};margin-bottom:8px">“</div>
      <div style="font-family:${DISPLAY};font-weight:545;font-size:${quoteSize(q)}px;line-height:1.2;letter-spacing:-0.01em;color:${dark ? IVORY : INK};max-width:920px">${annEsc(q)}</div>
      <div style="margin-top:52px">${attribution}</div>
    </div>`;
    return cardShell(dark, spec.kicker || 'On the record', spec.footerTag, body);
  }

  if (spec.template === 'thesis') {
    const rows = (spec.rows || []).slice(0, spec.photo ? 3 : 4).map(r => `
      <div style="padding:24px 0;border-top:1px solid ${HAIR}">
        <div style="font-family:${MONO};font-size:15.5px;letter-spacing:0.09em;color:${CORAL_DEEP};text-transform:uppercase">${annEsc(r.k)}</div>
        <div style="margin-top:8px;font-size:22px;line-height:1.5;color:${BODY};font-weight:500">${annEsc(r.v)}</div>
      </div>`).join('');
    const body = `
    <div style="flex:1;display:flex;flex-direction:column;justify-content:flex-start">
      <div style="margin-top:${spec.photo ? 40 : 52}px;font-family:${DISPLAY};font-weight:545;font-size:${spec.photo ? 48 : 54}px;line-height:1.12;letter-spacing:-0.012em;color:${INK};max-width:900px">${annEsc(spec.title || '')}</div>
      ${spec.photo ? `<div style="margin-top:34px;height:290px;box-shadow:0 20px 60px rgba(0,0,0,0.16)">${annPhotoBlock(16, spec.photo)}</div>` : ''}
      <div style="margin-top:${spec.photo ? 28 : 40}px">${rows}</div>
      ${spec.insight ? `
      <div style="margin-top:auto;background:#E7F0EC;border-left:5px solid ${CORAL};padding:26px 30px;margin-bottom:8px">
        <div style="font-family:${MONO};font-size:15px;letter-spacing:0.1em;color:${CORAL_DEEP};text-transform:uppercase">The read</div>
        <div style="margin-top:9px;font-size:23px;line-height:1.5;color:${INK};font-weight:600">${annEsc(spec.insight)}</div>
      </div>` : ''}
    </div>`;
    return cardShell(false, spec.kicker || 'Sector teardown', spec.footerTag, body);
  }

  // playbook
  const steps = (spec.steps || []).slice(0, spec.photo ? 4 : 5).map((t, i) => `
    <div style="display:flex;gap:30px;align-items:baseline;padding:26px 0;border-top:1px solid ${HAIR}">
      <div style="font-size:46px;font-weight:800;letter-spacing:-0.02em;color:${CORAL};min-width:92px">${String(i + 1).padStart(2, '0')}</div>
      <div style="font-size:23px;line-height:1.5;color:${INK};font-weight:500">${annEsc(t)}</div>
    </div>`).join('');
  const body = `
    <div style="flex:1;display:flex;flex-direction:column">
      <div style="margin-top:${spec.photo ? 40 : 52}px;font-family:${DISPLAY};font-weight:545;font-size:${spec.photo ? 48 : 54}px;line-height:1.12;letter-spacing:-0.012em;color:${INK};max-width:900px">${annEsc(spec.title || '')}</div>
      ${spec.photo ? `<div style="margin-top:34px;height:270px;box-shadow:0 20px 60px rgba(0,0,0,0.16)">${annPhotoBlock(16, spec.photo)}</div>` : ''}
      <div style="margin-top:${spec.photo ? 26 : 44}px">${steps}</div>
    </div>`;
  return cardShell(false, spec.kicker || 'The playbook', spec.footerTag, body);
}

export async function renderPostCardPng(spec: PostCardSpec): Promise<Buffer> {
  const page = await newRenderPage();
  try {
    await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
    await page.setContent(postCardHtml(spec), { waitUntil: 'networkidle0', timeout: 60000 });
    await page.evaluateHandle('document.fonts.ready').catch(() => {});
    await new Promise(r => setTimeout(r, 150));
    return Buffer.from(await page.screenshot({ type: 'png' }));
  } finally {
    await page.close().catch(() => {});
  }
}
