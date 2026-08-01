/**
 * THE house deck grammar — the page templates and CSS for a 1080×1350
 * LinkedIn carousel.
 *
 * Canonical by Paul's call (2026-07-24): "I want collateral to be produced the
 * same as being done in Claude Code now." So the builders you drive from a
 * Cowork session are the reference implementation, and the app conforms to
 * them — not the other way round.
 *
 * Pure by construction: this module does no I/O and knows nothing about where
 * images live. Callers resolve assets (disk for the local CLI, `studio_assets`
 * for the app) and pass data URIs in. Same spec + same assets → same bytes,
 * wherever it runs.
 */
import { LEDGER, TYPE, DISPLAY_WEIGHT, MINT_RING, GREEN_HALO, blockBackground, rgba } from './tokens.js';
import { esc, faceDisc, logoImg } from './assets.js';

export interface DeckAssets {
  /** ink wordmark, for light pages */
  logo: string;
  /** white wordmark, for dark pages and footer bands */
  logoWhite: string;
  /** boardroom band texture */
  texture: string;
  /** Paul's real headshot — never a stock face (house law) */
  headshot: string;
  /** the cover image, already resolved; null renders the text-only cover */
  coverImage: string | null;
  /** per-page image resolver — returns a data URI or null */
  image: (ref?: string) => string | null;
}

/* Local aliases so the moved template bodies below read unchanged. */
const INK = LEDGER.ink, BODY = LEDGER.slate, TERT = LEDGER.muted, GREEN = LEDGER.green;
const WARM = LEDGER.bone, DARK = LEDGER.dark, IVORY = LEDGER.ivory, IVORY_SUB = LEDGER.rule;
const BRASS = LEDGER.brass, HAIR = LEDGER.hair, MINT = LEDGER.mint;
const HONEY = LEDGER.honey;
const DISPLAY = TYPE.display, SANS = TYPE.sans, MONO = TYPE.mono;

/** The page set. Returns one `<section class="pg">` string per page. */
export function deckPages(deck: any, a: DeckAssets): string[] {
  const LOGO = a.logo, LOGO_W = a.logoWhite, HEAD = a.headshot, COVER_IMG = a.coverImage;
  const resolveImg = a.image;
  const face = (s: number) => faceDisc(HEAD, s, { objectPosition: '50% 22%', ring: MINT_RING });
  const total = deck.pages.length + 2; // cover + middles + closer
  const kicker = `<div class="kick">${logoImg(LOGO, 30)}<span class="kt">${esc(deck.kicker)}</span></div>`;
  const pfoot = (n: number) => `<div class="pfoot">${logoImg(LOGO_W, 34)}<span class="pn">${n} / ${total}</span></div>`;
  const ghost = (n: number) => `<div class="ghost">${String(n).padStart(2, '0')}</div>`;

  const html: string[] = [];

  // cover (dark, page 1)
  html.push(`<section class="pg dark">
    <div class="glaze"></div>
    <div class="cv-left">
      <div class="kick2"><img src="${LOGO_W}" style="height:34px;width:auto;display:block"><span class="kt brass">${esc(deck.kicker)}</span></div>
      <div class="cv-body">
        <div class="cv-hook">${esc(deck.cover.hook)}</div>
        <div class="cv-rule"></div>
        ${deck.cover.sub ? `<div class="cv-sub">${esc(deck.cover.sub)}</div>` : ''}
      </div>
    </div>
    ${COVER_IMG ? `<div class="cv-right"><img src="${COVER_IMG}" style="width:100%;height:100%;object-fit:cover;object-position:${deck.cover.imagePos || '50% 45%'};display:block"></div>` : ''}
    <div class="cv-foot">
      <img src="${LOGO_W}" style="height:44px;width:auto;display:block">
      <div class="who">${face(72)}<div><div class="wn">Paul Baker</div><div class="wt">Buy-side corporate development</div></div></div>
      <span class="swipe">SWIPE&nbsp;&nbsp;→</span>
    </div>
  </section>`);

  // middles (light, pages 2..total-1)
  deck.pages.forEach((p: any, i: number) => {
    const n = i + 2;
    if (p.kind === 'numeral') {
      html.push(`<section class="pg light">${kicker}${ghost(n)}
        <div class="statwrap">
          <div class="numeral">${esc(p.numeral)}${p.unit ? `<span class="unit">${esc(p.unit)}</span>` : ''}</div>
          <div class="brassbar"></div>
          <div class="stat-h">${esc(p.head)}</div>
          ${p.body ? `<div class="stat-b">${esc(p.body)}</div>` : ''}
        </div>
        ${p.source ? `<div class="baserail"><div class="bl-rule"></div><span class="src">${esc(p.source)}</span></div>` : ''}
        ${pfoot(n)}</section>`);
    } else if (p.kind === 'statement') {
      html.push(`<section class="pg light">${kicker}${ghost(n)}
        <div class="stmtwrap">
          <div class="tag ${p.tagColor === 'brass' ? 'brasstag' : 'green'}">${esc(p.tag)}</div>
          <div class="stmt-h">${esc(p.head)}</div>
          <div class="greenrule"></div>
          ${p.body ? `<div class="stmt-b">${esc(p.body)}</div>` : ''}
          ${p.source ? `<div class="stmt-src">${esc(p.source)}</div>` : ''}
        </div>
        ${pfoot(n)}</section>`);
    } else if (p.kind === 'diagram') {
      const cols = p.bars.map((b: any) => `<div class="col"><div class="bars"><div class="bar ${b.style}" style="height:${b.h}px"><span class="barnum">${esc(b.label)}</span></div></div><div class="collab ${b.style === 'green' ? 'strong' : ''}">${b.sub}</div></div>`);
      const joined = cols.join(`<div class="vs">${esc(p.connector || '→')}</div>`);
      html.push(`<section class="pg light">${kicker}
        <div class="diagwrap">
          <div class="tag green">${esc(p.tag)}</div>
          <div class="stmt-h" style="max-width:840px;margin-top:22px">${esc(p.head)}</div>
          <div class="diag">${joined}</div>
          ${p.body ? `<div class="stmt-b" style="margin-top:48px">${esc(p.body)}</div>` : ''}
          ${p.source ? `<div class="stmt-src">${esc(p.source)}</div>` : ''}
        </div>
        ${pfoot(n)}</section>`);
    } else if (p.kind === 'trade') {
      const img = resolveImg(p.image);
      html.push(`<section class="pg light">${kicker}
        <div class="tradewrap${img ? '' : ' noimg'}">
          <div class="trade-txt">
            <div class="tag green">${esc(p.name)}</div>
            ${p.numeral ? `<div class="trade-num">${esc(p.numeral)}${p.unit ? `<span class="tunit">${esc(p.unit)}</span>` : ''}</div>` : ''}
            <div class="brassbar tbar"></div>
            <div class="trade-h">${esc(p.head)}</div>
            ${p.body ? `<div class="trade-b">${esc(p.body)}</div>` : ''}
            ${p.source ? `<div class="stmt-src">${esc(p.source)}</div>` : ''}
          </div>
          ${img ? `<div class="trade-img"><img src="${img}" style="object-position:${p.imagePos || '50% 50%'}"></div>` : ''}
        </div>
        ${pfoot(n)}</section>`);
    }
  });

  // closer (dark, last page)
  html.push(`<section class="pg dark">
    <div class="glaze"></div>
    <div class="closer">
      ${deck.closer.tag ? `<div class="tag brasstag">${esc(deck.closer.tag)}</div>` : ''}
      <div class="ct-head">${esc(deck.closer.head)}</div>
      <div class="ct-rule"></div>
      ${deck.closer.body ? `<div class="ct-body">${esc(deck.closer.body)}</div>` : ''}
      <div class="ct-sign">${face(104)}<div class="ct-who"><div class="ct-name">Paul Baker</div><div class="ct-tag2">Buy-side corporate development</div></div></div>
      <div class="ct-brand"><img src="${LOGO_W}" style="height:64px;width:auto;display:block"><span class="follow">FOLLOW FOR THE NEXT READ.</span></div>
    </div>
  </section>`);
  return html;
}

/** The house CSS for a deck document. `texture` is the boardroom band image. */
export function deckCss(TEXTURE: string): string {
  return `
  * { margin: 0; padding: 0; box-sizing: border-box; } img { vertical-align: middle; }
  html, body { width: 1080px; }
  .pg { width: 1080px; height: 1350px; position: relative; overflow: hidden; page-break-after: always; font-family: ${SANS}; font-variant-numeric: tabular-nums; }
  .pg:last-child { page-break-after: auto; }
  .pg.light { background: ${WARM}; color: ${INK}; }
  .pg.dark { background: ${blockBackground(TEXTURE)}; color: ${IVORY}; }
  /* The cover's quieting veil. It is much lighter than it used to be because
     the block itself is now a glazed composite — stacking the old 0.55→0.72
     dark veil on top of that would take the jade straight back to the
     near-black this pass exists to remove. */
  /* The cover's quieting veil, on TOP of the already-glazed block. Kept very
     light: at 0.30-0.48 it multiplied with the base glaze to about 0.92
     effective and flattened the plaster out of the cover entirely, which is
     why a ladder of the BASE alpha alone showed almost no difference. */
  .glaze { position: absolute; inset: 0; background:
    radial-gradient(900px 500px at 50% -10%, ${GREEN_HALO}, transparent 65%),
    linear-gradient(180deg, ${rgba(LEDGER.dark, 0.06)}, ${rgba(LEDGER.dark, 0.16)}); }
  .kick { position: absolute; left: 66px; right: 66px; top: 60px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid ${HAIR}; padding-bottom: 22px; z-index: 3; }
  .kt { font-family: ${MONO}; font-size: 18px; letter-spacing: 0.1em; color: ${TERT}; text-transform: uppercase; }
  .kt.brass { color: ${BRASS}; }
  .pfoot { position: absolute; left: 0; right: 0; bottom: 0; height: 84px; background: ${DARK}; display: flex; align-items: center; justify-content: space-between; padding: 0 66px; z-index: 3; }
  .pn { font-family: ${MONO}; font-size: 16px; letter-spacing: 0.1em; color: ${IVORY_SUB}; }
  .ghost { position: absolute; right: 60px; bottom: 150px; z-index: 0; font-family: ${DISPLAY}; font-weight: 545; font-size: 360px; line-height: 0.8; color: rgba(20,24,28,0.05); letter-spacing: -0.04em; }
  .cv-left { position: absolute; left: 0; top: 0; bottom: 128px; width: 544px; padding: 66px 50px 40px 66px; display: flex; flex-direction: column; z-index: 2; }
  .kick2 { display: flex; align-items: center; justify-content: space-between; }
  .cv-body { flex: 1; display: flex; flex-direction: column; justify-content: center; }
  .cv-hook { font-family: ${DISPLAY}; font-weight: 545; font-size: 52px; line-height: 1.08; letter-spacing: -0.014em; color: ${IVORY}; text-wrap: balance; }
  .cv-rule { width: 70px; height: 6px; background: ${MINT}; border-radius: 99px; margin: 30px 0 26px; }
  .cv-sub { font-size: 22px; line-height: 1.5; color: ${IVORY_SUB}; font-weight: 500; }
  .cv-right { position: absolute; left: 544px; top: 60px; right: 60px; bottom: 188px; background: #fff; border: 1px solid rgba(243,241,234,0.18); border-radius: 24px; overflow: hidden; z-index: 1; }
  .cv-foot { position: absolute; left: 0; right: 0; bottom: 0; height: 128px; border-top: 1px solid rgba(243,241,234,0.10); display: flex; align-items: center; gap: 26px; padding: 0 60px; z-index: 3; }
  .who { display: flex; align-items: center; gap: 18px; }
  .wn { color: ${IVORY}; font-size: 21px; font-weight: 700; letter-spacing: -0.01em; }
  .wt { margin-top: 3px; color: ${IVORY_SUB}; font-size: 16.5px; font-weight: 500; }
  .swipe { margin-left: auto; font-family: ${MONO}; font-size: 21px; letter-spacing: 0.14em; color: ${MINT}; font-weight: 600; }
  .statwrap { position: absolute; left: 88px; right: 88px; top: 300px; z-index: 1; }
  .numeral { font-weight: 800; font-size: 290px; line-height: 0.9; letter-spacing: -0.03em; color: ${INK}; }
  .numeral .unit { font-size: 150px; }
  .brassbar { height: 8px; width: 132px; background: ${BRASS}; border-radius: 4px; margin: 44px 0 40px; }
  .stat-h { font-family: ${DISPLAY}; font-weight: 545; font-size: 44px; line-height: 1.16; letter-spacing: -0.01em; color: ${INK}; max-width: 830px; }
  .stat-b { margin-top: 26px; font-size: 25px; line-height: 1.55; color: ${BODY}; max-width: 800px; }
  .baserail { position: absolute; left: 88px; right: 88px; bottom: 128px; display: flex; flex-direction: column; gap: 16px; z-index: 1; }
  .bl-rule { height: 1px; width: 100%; background: ${HAIR}; }
  .src { font-family: ${MONO}; font-size: 17px; letter-spacing: 0.05em; color: ${TERT}; }
  .stmtwrap { position: absolute; left: 88px; right: 88px; top: 0; bottom: 84px; display: flex; flex-direction: column; justify-content: center; z-index: 1; }
  .tag { font-family: ${MONO}; font-size: 18px; letter-spacing: 0.12em; font-weight: 600; }
  .tag.green { color: ${GREEN}; }
  .tag.brasstag { color: ${BRASS}; }
  .stmt-h { margin-top: 26px; font-family: ${DISPLAY}; font-weight: 545; font-size: 58px; line-height: 1.1; letter-spacing: -0.012em; color: ${INK}; max-width: 880px; }
  .greenrule { width: 96px; height: 6px; background: ${GREEN}; border-radius: 99px; margin: 36px 0; }
  .stmt-b { font-size: 27px; line-height: 1.55; color: ${BODY}; max-width: 820px; }
  .stmt-src { margin-top: 34px; font-family: ${MONO}; font-size: 17px; letter-spacing: 0.05em; color: ${TERT}; }
  .diagwrap { position: absolute; left: 88px; right: 88px; top: 0; bottom: 84px; display: flex; flex-direction: column; justify-content: center; z-index: 1; }
  .diag { display: flex; align-items: flex-end; gap: 72px; margin-top: 60px; }
  .col { display: flex; flex-direction: column; gap: 22px; }
  .bars { display: flex; align-items: flex-end; }
  .bar { width: 168px; border-radius: 10px 10px 0 0; position: relative; display: flex; align-items: flex-start; justify-content: center; }
  .bar.ink { background: transparent; border: 2px solid ${INK}; }
  .bar.green { background: ${GREEN}; }
  .barnum { margin-top: 20px; font-family: ${DISPLAY}; font-weight: 545; font-size: 46px; }
  .bar.ink .barnum { color: ${INK}; }
  .bar.green .barnum { color: ${IVORY}; }
  .collab { font-family: ${MONO}; font-size: 17px; letter-spacing: 0.04em; color: ${TERT}; line-height: 1.5; }
  .collab.strong { color: ${GREEN}; font-weight: 600; }
  .vs { font-family: ${DISPLAY}; font-weight: 545; font-size: 52px; color: ${BRASS}; padding-bottom: 130px; }
  /* Amber sits at 3.8:1 on the jade block — large-text only, and these are
     small mono labels. HONEY is amber's on-block value and the block gets
     it, exactly as the site re-scopes --pd-brass inside .pd-dark. Light
     surfaces keep brass. */
  .pg.dark .kt.brass, .pg.dark .tag.brasstag, .pg.dark .vs { color: ${HONEY}; }
  .pg.dark .brassbar { background: ${HONEY}; }
  .closer { position: absolute; inset: 0; padding: 96px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; z-index: 1; }
  .ct-head { margin-top: 22px; font-family: ${DISPLAY}; font-weight: 545; font-size: 48px; line-height: 1.16; letter-spacing: -0.012em; color: ${IVORY}; max-width: 860px; }
  .ct-rule { margin: 30px 0; height: 6px; width: 96px; background: ${MINT}; border-radius: 99px; }
  .ct-body { font-size: 29px; line-height: 1.5; color: ${IVORY_SUB}; max-width: 800px; }
  .ct-sign { margin-top: 56px; display: flex; align-items: center; gap: 22px; }
  .ct-who { text-align: left; }
  .ct-name { font-size: 26px; font-weight: 700; color: ${IVORY}; letter-spacing: -0.01em; }
  .ct-tag2 { margin-top: 3px; font-size: 19px; color: ${IVORY_SUB}; }
  .ct-brand { margin-top: 44px; display: flex; flex-direction: column; align-items: center; gap: 22px; }
  .follow { font-family: ${MONO}; font-size: 18px; letter-spacing: 0.14em; color: ${MINT}; font-weight: 600; }
  .tradewrap { position: absolute; left: 88px; right: 88px; top: 150px; bottom: 116px; display: flex; align-items: center; gap: 54px; z-index: 1; }
  .trade-txt { flex: 1; min-width: 0; }
  .trade-num { font-weight: 800; font-size: 100px; line-height: 0.92; letter-spacing: -0.03em; color: ${INK}; }
  .trade-num .tunit { font-size: 58px; }
  .tradewrap.noimg .trade-num { font-size: 224px; }
  .brassbar.tbar { margin: 22px 0 22px; }
  .trade-h { font-family: ${DISPLAY}; font-weight: 545; font-size: 40px; line-height: 1.15; letter-spacing: -0.01em; color: ${INK}; }
  .tradewrap.noimg .trade-h { font-size: 50px; max-width: 900px; }
  .trade-b { margin-top: 20px; font-size: 23px; line-height: 1.5; color: ${BODY}; }
  .tradewrap.noimg .trade-b { font-size: 26px; max-width: 860px; }
  .trade-img { width: 404px; height: 604px; flex: none; background: #fff; border: 1px solid ${HAIR}; border-radius: 24px; overflow: hidden; }
  .trade-img img { width: 100%; height: 100%; object-fit: cover; display: block; }`;
}

/** A complete deck document, ready to hand to Chromium. */
export function deckDocument(deck: any, a: DeckAssets, fontCss: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${fontCss}</style>
<style>${deckCss(a.texture)}</style></head><body>${deckPages(deck, a).join('')}</body></html>`;
}
