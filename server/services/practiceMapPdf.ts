/**
 * Market Map → PDF. Built for the forward: a family-office principal sends
 * this to their CIO, a sponsor to their capital partner — so it must be
 * self-contained, unmistakably smbX, dated, and carry the next step on it.
 *
 * Deliberately self-contained HTML: system font stack + monospace, no
 * external resources (no font fetch to flake at render time), no charts.
 * Shares the Puppeteer singleton with the premium deliverable renderer.
 */
import fs from 'fs';
import path from 'path';
import { getBrowser } from './premiumPdfRenderer.js';
import type { IntakeMap } from './practiceIntake.js';

const esc = (v: string): string =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The header wordmark (smbX.ai), embedded as a data URI so the PDF stays
 *  self-contained. Falls back to a typographic mark if the file is missing. */
function logoDataUri(): string | null {
  const candidates = [
    path.join(process.cwd(), 'dist', 'client', 'logo-coral-x.png'),
    path.join(process.cwd(), 'client', 'public', 'logo-coral-x.png'),
  ];
  for (const p of candidates) {
    try {
      return `data:image/png;base64,${fs.readFileSync(p).toString('base64')}`;
    } catch { /* try next */ }
  }
  return null;
}

function mapHtml(map: IntakeMap, generatedAt: string): string {
  const pushback = map.verdict === 'PUSHBACK';
  const logo = logoDataUri();
  const mark = logo
    ? `<img src="${logo}" alt="smbX.ai" style="height:20px;width:auto;display:block;">`
    : `<div class="mark">smb<span class="x">X</span>.ai</div>`;
  const funnel = map.funnel
    .map(
      s => `
      <div class="step">
        <div class="n">${esc(s.n)}</div>
        <div class="l">${esc(s.label)}</div>
      </div>`,
    )
    .join('<div class="arrow">&darr;</div>');

  const section = (label: string, body: string) =>
    body
      ? `<div class="sec"><div class="k">${label}</div><div class="v">${esc(body)}</div></div>`
      : '';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { background: #ffffff; }
  body {
    font-family: -apple-system, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #222222; font-size: 11.5px; line-height: 1.55;
    padding: 52px 56px 40px;
  }
  .mono { font-family: 'SF Mono', 'Cascadia Mono', Consolas, Menlo, monospace; }
  .head { display: flex; justify-content: space-between; align-items: center; padding-bottom: 14px; border-bottom: 2px solid #222222; }
  .mark { font-weight: 800; font-size: 17px; letter-spacing: -0.02em; }
  .mark .x { color: #E61E4D; }
  .headmeta { font-family: 'SF Mono', Consolas, Menlo, monospace; font-size: 8.5px; letter-spacing: 0.14em; color: #9A9A9A; text-align: right; }
  .title { margin-top: 26px; font-size: 27px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.08; }
  .thesis { margin-top: 9px; font-family: 'SF Mono', Consolas, Menlo, monospace; font-size: 9.5px; letter-spacing: 0.05em; color: #6A6A6A; }
  .answer { margin-top: 20px; border-left: 3px solid #222222; padding: 10px 0 10px 16px; font-size: 13.5px; font-weight: 700; line-height: 1.45; }
  .funnel { margin-top: 26px; border-top: 1px solid #EBEBEB; border-bottom: 1px solid #EBEBEB; padding: 18px 0; }
  .funnel .fk { font-family: 'SF Mono', Consolas, Menlo, monospace; font-size: 8.5px; letter-spacing: 0.14em; color: #E61E4D; margin-bottom: 12px; }
  .step { display: flex; align-items: baseline; gap: 16px; }
  .step .n { font-size: 34px; font-weight: 800; letter-spacing: -0.03em; min-width: 128px; }
  .step .l { font-size: 11.5px; color: #6A6A6A; }
  .arrow { color: #BBBBBB; font-size: 13px; padding: 2px 0 2px 4px; }
  .sec { margin-top: 20px; }
  .sec .k { font-family: 'SF Mono', Consolas, Menlo, monospace; font-size: 8.5px; letter-spacing: 0.14em; color: #E61E4D; }
  .sec .v { margin-top: 5px; font-size: 11.5px; line-height: 1.6; }
  .insight { margin-top: 24px; background: #F7F7F7; padding: 18px 20px; }
  .insight .k { font-family: 'SF Mono', Consolas, Menlo, monospace; font-size: 8.5px; letter-spacing: 0.14em; color: #222222; }
  .insight .v { margin-top: 7px; font-size: 12.5px; font-weight: 600; line-height: 1.6; }
  .next { margin-top: 26px; border: 1px solid #222222; padding: 16px 20px; }
  .next .k { font-family: 'SF Mono', Consolas, Menlo, monospace; font-size: 8.5px; letter-spacing: 0.14em; color: #222222; }
  .next .v { margin-top: 6px; font-size: 11.5px; line-height: 1.6; }
  .foot { margin-top: 24px; padding-top: 12px; border-top: 1px solid #EBEBEB; font-family: 'SF Mono', Consolas, Menlo, monospace; font-size: 7.8px; letter-spacing: 0.06em; line-height: 1.7; color: #9A9A9A; }
</style>
</head>
<body>
  <div class="head">
    ${mark}
    <div class="headmeta">PRELIMINARY MARKET READ<br>${esc(generatedAt.toUpperCase())}</div>
  </div>
  <div class="title">${esc(map.title)}</div>
  <div class="thesis">${esc(map.thesis.toUpperCase())}</div>
  ${pushback && map.answer ? `<div class="answer">${esc(map.answer)}</div>` : ''}
  <div class="funnel">
    <div class="fk">${pushback ? 'THE EVIDENCE' : 'THE UNIVERSE'}</div>
    ${funnel}
  </div>
  ${section('THE ECONOMICS', map.econ)}
  ${section('THE COMPETITIVE PICTURE', map.comp)}
  <div class="insight">
    <div class="k">${pushback ? 'WHERE CAPITAL WORKS BETTER' : 'WHAT MOST BUYERS MISS'}</div>
    <div class="v">${esc(map.insight)}</div>
  </div>
  ${section('WHAT WOULD KILL THIS THESIS', map.kill)}
  ${section('WHAT AN ENGAGEMENT PRODUCES', map.produces)}
  <div class="next">
    <div class="k">NEXT STEP</div>
    <div class="v">A confidential consultation with our senior deal team. Thirty minutes, no retainer, and an honest answer on whether this thesis is worth your capital. Book at smbx.ai.</div>
  </div>
  <div class="foot">
    ${esc(map.sources)}<br>
    smbX advises buyers only — one client per target, privately held companies under $250M in annual revenue. smbX is not a registered broker-dealer or investment adviser and does not provide legal, tax, or accounting advice. Nothing here is an offer to buy or sell any security.
  </div>
</body>
</html>`;
}

export async function renderPracticeMapPdf(map: IntakeMap, generatedAt: string): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setContent(mapHtml(map, generatedAt), { waitUntil: 'load', timeout: 15000 });
    const pdf = await page.pdf({
      format: 'letter',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
    });
    return Buffer.from(pdf);
  } finally {
    await page.close().catch(() => {});
  }
}
