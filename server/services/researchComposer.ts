/**
 * Research Composer — turns a completed research run into shareable artifacts
 * in the PRACTICE-SITE coral language (NOT the retired terra-pink premium PDF
 * skin): Schibsted Grotesk + IBM Plex Mono, ink #222, coral #FF385C, warm
 * white, generous air.
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
import { getBrowser } from './premiumPdfRenderer.js';

/* ─── palette (practice .pd language) ─────────────────────────────────── */
const INK = '#222222';
const BODY = '#4A4A4A';
const TERT = '#6A6A6A';
const CORAL = '#FF385C';
const CORAL_DEEP = '#E61E4D';
const CARD = '#F7F7F7';
const HAIR = '#EBEBEB';
const WARM = '#FFFDFC';
const DARK = '#141414';

const FONTS = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:ital,wght@0,400..900;1,400..900&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
`;
const SANS = `'Schibsted Grotesk', -apple-system, 'Segoe UI', sans-serif`;
const MONO = `'IBM Plex Mono', ui-monospace, 'SF Mono', monospace`;

function esc(s: string): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmtDate(d: Date | string | null | undefined): string {
  const date = d ? new Date(d) : new Date();
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

const TYPE_LABELS: Record<string, string> = {
  vertical_scan: 'Vertical Scan',
  participant_map: 'Participant Map',
  buyer_roster: 'Buyer Roster',
  deal_monitor: 'Deal Monitor',
  thesis_validation: 'Thesis Validation',
  topic_brief: 'Topic Brief',
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

  const sourcesHtml = sources.length
    ? `<section class="appendix">
        <h2>Sources</h2>
        <ol class="srcs">
          ${sources.map(s => `<li><span class="st">${esc(s.title)}</span><br><a href="${esc(s.url)}">${esc(s.url)}</a></li>`).join('')}
        </ol>
      </section>`
    : '';

  const feedHtml = feed
    ? `<section class="appendix feed">
        <div class="feedtag">STUDIO FEED · INTERNAL MARKETING MATERIAL</div>
        ${Array.isArray(feed.hooks) && feed.hooks.length ? `<h2>Hooks</h2><ul>${feed.hooks.map((h: string) => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}
        ${Array.isArray(feed.dataPoints) && feed.dataPoints.length ? `<h2>Data points</h2>
          <table><thead><tr><th>Stat</th><th>Source</th><th>Freshness</th><th>Confidence</th></tr></thead>
          <tbody>${feed.dataPoints.map((p: any) => `<tr><td>${esc(p.stat)}</td><td>${esc(p.source)}</td><td>${esc(p.freshness)}</td><td>${esc(p.confidence)}</td></tr>`).join('')}</tbody></table>` : ''}
        ${Array.isArray(feed.angles) && feed.angles.length ? `<h2>Post angles</h2>${feed.angles.map((a: any) => `<p class="angle"><b>${esc(a.title)}.</b> ${esc(a.body)}</p>`).join('')}` : ''}
        ${feed.visual ? `<h2>Suggested visual</h2><p>${esc(feed.visual)}</p>` : ''}
        ${Array.isArray(feed.accounts) && feed.accounts.length ? `<h2>Accounts to watch</h2><p>${feed.accounts.map((a: string) => esc(a)).join(' · ')}</p>` : ''}
      </section>`
    : '';

  const u = run.usage || {};
  return `<!DOCTYPE html><html><head><meta charset="utf-8">${FONTS}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${SANS}; color: ${INK}; background: #fff; font-size: 10.5pt; line-height: 1.62; }
    .kicker { display: flex; justify-content: space-between; align-items: baseline; font-family: ${MONO};
      font-size: 8pt; letter-spacing: 0.09em; color: ${TERT}; text-transform: uppercase; }
    .kicker b { color: ${CORAL_DEEP}; font-weight: 600; }
    .rule { height: 3px; width: 64px; background: ${CORAL}; margin: 14px 0 22px; border-radius: 2px; }
    h1.title { font-size: 25pt; font-weight: 800; letter-spacing: -0.02em; line-height: 1.08; max-width: 9in; }
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
    .feed { background: ${CARD}; border-radius: 14px; padding: 22px 24px; }
    .feedtag { font-family: ${MONO}; font-size: 7.5pt; letter-spacing: 0.1em; color: ${CORAL_DEEP}; font-weight: 600; margin-bottom: 4px; }
    .feed ul { margin: 0 0 10px 1.2em; color: ${BODY}; font-size: 9.5pt; }
    .feed table { width: 100%; border-collapse: collapse; font-size: 8.5pt; margin: 8px 0 14px; }
    .feed th { text-align: left; font-family: ${MONO}; font-size: 7pt; letter-spacing: 0.07em; text-transform: uppercase; color: ${TERT}; padding: 5px 8px; border-bottom: 2px solid ${INK}; }
    .feed td { padding: 6px 8px; border-bottom: 1px solid #E2E2E2; color: ${BODY}; vertical-align: top; }
    .feed .angle { font-size: 9.5pt; color: ${BODY}; margin: 0 0 8px; }
    .feed p { font-size: 9.5pt; color: ${BODY}; margin: 0 0 8px; }
    .disc { margin-top: 26px; padding-top: 12px; border-top: 1px solid ${HAIR}; font-size: 7.5pt; color: ${TERT}; line-height: 1.5; }
  </style></head><body>
    <div class="kicker"><span><b>smbX</b> · RESEARCH BRIEF · ${esc(typeLabel.toUpperCase())}</span><span>${esc(fmtDate(run.completed_at))}</span></div>
    <div class="rule"></div>
    <h1 class="title">${esc(title)}</h1>
    <div class="meta">${esc(typeLabel)} · ${esc(run.depth)} depth · ${Number(u.searches ?? 0)} searches · ${sources.length} sources</div>
    <div class="doc">${body}</div>
    ${sourcesHtml}
    ${feedHtml}
    <div class="disc">Internal research prepared by smbX for its own use. Figures are as reported by the cited sources; items marked (directional) are estimates. This document is not investment, legal, tax, or accounting advice and contains no opinion of value on any specific company.</div>
  </body></html>`;
}

export async function renderResearchPdf(run: ResearchRunRow): Promise<Buffer> {
  const html = await researchReportHtml(run);
  const browser = await getBrowser();
  const page = await browser.newPage();
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
        <span>smbX — internal research</span>
        <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
      </div>`,
    });
    return Buffer.from(pdf);
  } finally {
    await page.close().catch(() => {});
  }
}

/* ─── the LinkedIn card (1080×1350) ───────────────────────────────────── */

export function researchCardHtml(run: ResearchRunRow, hookIndex = 0): string {
  const feed = run.studio_feed && typeof run.studio_feed === 'object' ? run.studio_feed : {};
  const hooks: string[] = Array.isArray(feed.hooks) ? feed.hooks : [];
  const hook = hooks[Math.min(Math.max(hookIndex, 0), Math.max(hooks.length - 1, 0))] || run.report_title || run.topic;
  const points: any[] = (Array.isArray(feed.dataPoints) ? feed.dataPoints : []).slice(0, 3);
  const typeLabel = TYPE_LABELS[run.research_type] ?? 'Research';

  // Long hooks step the display size down so nothing clips at 1080 wide.
  const hookSize = hook.length > 150 ? 52 : hook.length > 100 ? 60 : hook.length > 60 ? 70 : 80;

  return `<!DOCTYPE html><html><head><meta charset="utf-8">${FONTS}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 1080px; height: 1350px; font-family: ${SANS}; color: ${INK}; background: ${WARM}; overflow: hidden; position: relative; }
    .wash { position: absolute; inset: 0; background:
      radial-gradient(720px 560px at 88% -6%, rgba(255,56,92,0.075), transparent 62%),
      radial-gradient(640px 520px at -8% 44%, rgba(255,116,140,0.055), transparent 60%); }
    .frame { position: absolute; inset: 0; display: flex; flex-direction: column; padding: 84px 88px 0; }
    .tag { display: flex; justify-content: space-between; align-items: baseline; font-family: ${MONO};
      font-size: 21px; letter-spacing: 0.1em; color: ${TERT}; text-transform: uppercase; }
    .tag b { color: ${CORAL_DEEP}; font-weight: 600; }
    .hook { margin-top: 92px; font-size: ${hookSize}px; font-weight: 800; letter-spacing: -0.022em; line-height: 1.06; max-width: 880px; }
    .rule { height: 6px; width: 96px; background: ${CORAL}; border-radius: 3px; margin: 56px 0 0; }
    .pts { margin-top: 58px; display: flex; flex-direction: column; gap: 40px; }
    .pt { display: flex; gap: 26px; align-items: flex-start; }
    .dot { width: 14px; height: 14px; border-radius: 50%; background: ${CORAL}; margin-top: 14px; flex: none; }
    .stat { font-size: 33px; font-weight: 700; letter-spacing: -0.012em; line-height: 1.28; color: ${INK}; }
    .src { margin-top: 8px; font-family: ${MONO}; font-size: 18px; color: ${TERT}; letter-spacing: 0.02em; }
    .foot { position: absolute; left: 0; right: 0; bottom: 0; height: 128px; background: ${DARK};
      display: flex; align-items: center; justify-content: space-between; padding: 0 88px; }
    .brand { display: flex; align-items: center; gap: 16px; color: #fff; font-size: 30px; font-weight: 800; letter-spacing: -0.01em; }
    .brand .bd { width: 13px; height: 13px; border-radius: 50%; background: ${CORAL}; }
    .foot .r { color: #C9C9C9; font-size: 19px; font-weight: 500; }
  </style></head><body>
    <div class="wash"></div>
    <div class="frame">
      <div class="tag"><span><b>smbX</b> · ${esc(typeLabel.toUpperCase())}</span><span>${esc(fmtDate(run.completed_at))}</span></div>
      <div class="hook">${esc(hook)}</div>
      <div class="rule"></div>
      ${points.length ? `<div class="pts">${points.map(p => `
        <div class="pt"><div class="dot"></div><div>
          <div class="stat">${esc(p.stat)}</div>
          <div class="src">${esc([p.source, p.freshness].filter(Boolean).join(' · '))}</div>
        </div></div>`).join('')}</div>` : ''}
    </div>
    <div class="foot">
      <div class="brand"><span class="bd"></span>smbx.ai</div>
      <div class="r">Buy-side corporate development</div>
    </div>
  </body></html>`;
}

export async function renderResearchCardPng(run: ResearchRunRow, hookIndex = 0): Promise<Buffer> {
  const html = researchCardHtml(run, hookIndex);
  const browser = await getBrowser();
  const page = await browser.newPage();
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
