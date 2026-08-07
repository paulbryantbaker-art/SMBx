/**
 * Market Map → PDF. Built for the forward: a family-office principal sends
 * this to their CIO, a sponsor to their capital partner — so it must be
 * self-contained, unmistakably smbX, dated, and carry the next step on it.
 *
 * CARTA (2026-08-07): the PDF holds parity with the on-page map (`.pd-map`)
 * — Source Serif 4 numerals/title, Schibsted body, Plex Mono kickers, one
 * green accent, square panels — with the woff2s inlined (cartaFontFaceCss)
 * so no render environment can fall back to system faces.
 * Shares the Puppeteer singleton with the premium deliverable renderer.
 */
import fs from 'fs';
import path from 'path';
import { newRenderPage } from './premiumPdfRenderer.js';
import { cartaFontFaceCss } from './fontEmbeds.js';
import { CARTA } from '../../house/tokens.js';
import type { IntakeMap } from './practiceIntake.js';

const esc = (v: string): string =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The header wordmark (smbX.ai), embedded as a data URI so the PDF stays
 *  self-contained. Falls back to a typographic mark if the file is missing. */
function logoDataUri(): string | null {
  const candidates = [
    path.join(process.cwd(), 'dist', 'client', 'logo-green-x.png'),
    path.join(process.cwd(), 'client', 'public', 'logo-green-x.png'),
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
  ${cartaFontFaceCss()}
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { background: #ffffff; }
  body {
    font-family: 'Schibsted Grotesk', 'Helvetica Neue', Arial, sans-serif;
    color: ${CARTA.ink}; font-size: 11.5px; font-variant-numeric: tabular-nums; line-height: 1.55;
    padding: 52px 56px 40px;
  }
  .mono { font-family: 'IBM Plex Mono', monospace; }
  .head { display: flex; justify-content: space-between; align-items: center; padding-bottom: 14px; border-bottom: 1px solid ${CARTA.hair}; }
  .mark { font-weight: 700; font-size: 17px; letter-spacing: -0.02em; }
  .mark .x { color: ${CARTA.green}; }
  .headmeta { display: inline-flex; align-items: center; gap: 6px; background: ${CARTA.green}; color: ${CARTA.bone}; font-family: 'IBM Plex Mono', monospace; font-size: 8.5px; letter-spacing: 0.12em; padding: 4px 8px; }
  .headmeta::before { content: ''; width: 6px; height: 6px; background: ${CARTA.bone}; }
  .title { margin-top: 26px; font-family: 'Source Serif 4', Georgia, serif; font-size: 27px; font-weight: 600; letter-spacing: -0.01em; line-height: 1.16; }
  .thesis { margin-top: 9px; font-family: 'IBM Plex Mono', monospace; font-size: 9.5px; letter-spacing: 0.05em; color: ${CARTA.muted}; }
  .answer { margin-top: 20px; border-left: 3px solid ${CARTA.green}; padding: 10px 0 10px 16px; font-size: 13.5px; font-weight: 700; line-height: 1.45; }
  .funnel { margin-top: 26px; border-top: 1px solid ${CARTA.hair}; border-bottom: 1px solid ${CARTA.hair}; padding: 18px 0; }
  .funnel .fk { font-family: 'IBM Plex Mono', monospace; font-size: 8.5px; letter-spacing: 0.14em; color: ${CARTA.green}; margin-bottom: 12px; }
  .step { display: flex; align-items: baseline; gap: 16px; }
  .step .n { font-family: 'Source Serif 4', Georgia, serif; font-size: 34px; font-weight: 600; letter-spacing: -0.02em; min-width: 128px; }
  .step .l { font-size: 11.5px; color: ${CARTA.body}; }
  .arrow { color: ${CARTA.green}; font-size: 13px; padding: 2px 0 2px 4px; }
  .sec { margin-top: 20px; }
  .sec .k { font-family: 'IBM Plex Mono', monospace; font-size: 8.5px; letter-spacing: 0.14em; color: ${CARTA.green}; }
  .sec .v { margin-top: 5px; font-size: 11.5px; line-height: 1.6; }
  .insight { margin-top: 24px; background: ${CARTA.boneAlt}; border: 1px solid ${CARTA.hair}; padding: 18px 20px; }
  .insight .k { font-family: 'IBM Plex Mono', monospace; font-size: 8.5px; letter-spacing: 0.14em; color: ${CARTA.green}; }
  .insight .v { margin-top: 7px; font-size: 12.5px; font-weight: 600; line-height: 1.6; }
  .next { margin-top: 26px; border: 1px solid ${CARTA.ink}; padding: 16px 20px; }
  .next .k { font-family: 'IBM Plex Mono', monospace; font-size: 8.5px; letter-spacing: 0.14em; color: ${CARTA.ink}; }
  .next .v { margin-top: 6px; font-size: 11.5px; line-height: 1.6; }
  .foot { margin-top: 24px; padding-top: 12px; border-top: 1px solid ${CARTA.hair}; font-family: 'IBM Plex Mono', monospace; font-size: 7.8px; letter-spacing: 0.06em; line-height: 1.7; color: ${CARTA.muted}; }
</style>
</head>
<body>
  <div class="head">
    ${mark}
    <div class="headmeta">PRELIMINARY MARKET READ &middot; ${esc(generatedAt.toUpperCase())}</div>
  </div>
  <div class="title">${esc(map.title)}</div>
  <div class="thesis">${esc(map.thesis)}</div>
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
  const page = await newRenderPage();
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
