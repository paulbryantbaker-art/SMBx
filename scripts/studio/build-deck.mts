/**
 * Studio deck builder — a house-style LinkedIn carousel from a plain spec,
 * rendered on YOUR computer via Cowork. No SMBX app, no app API key.
 *
 * Why this exists (Paul, 2026-07-22): the app's research pipeline bills the
 * app's ANTHROPIC_API_KEY. This builder runs the SAME house design system
 * (Ledger palette, Fraunces/Inter/Plex, boardroom texture, the framed-cover
 * grammar, the rasterized-PDF renderer-proof pass) as pure local compute —
 * a Cowork session composes the spec on your Claude subscription, this script
 * renders it for free. Style lives in the repo; media comes from a folder or
 * a Google-Drive download; the plan is a file. The app is fully bypassed.
 *
 * Usage:
 *   npx tsx scripts/studio/build-deck.mts <spec.deck.mts> [--media <dir>] [--out <dir>]
 *
 * The spec is a small .mts file that `export const deck = {...}` (see
 * scripts/studio/decks/elevator-teardown-1.deck.mts for a worked example and
 * the full field reference). Image paths in the spec resolve against --media,
 * then the spec's own folder, then CWD; absolute paths pass through.
 *
 * Outputs (into --out, default ./out next to CWD): <slug>.pdf (the swipeable
 * carousel), <slug>-pNN.jpg (each page), <slug>-caption.txt (the post copy).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
const { fontFaceCss } = await import(pathToFileURL(path.join(ROOT, 'server/services/fontEmbeds.ts')).href);
const { newRenderPage } = await import(pathToFileURL(path.join(ROOT, 'server/services/premiumPdfRenderer.ts')).href);

/* ── house palette (mirrors server/services/researchComposer.ts) ──────── */
/* THE shared definition — see house/tokens.ts. Never hardcode a hex here. */
const { LEDGER, TYPE } = await import(pathToFileURL(path.join(ROOT, 'house/tokens.ts')).href);
const INK = LEDGER.ink, BODY = LEDGER.slate, TERT = LEDGER.muted, GREEN = LEDGER.green;
const WARM = LEDGER.bone, DARK = LEDGER.dark, IVORY = LEDGER.ivory, IVORY_SUB = LEDGER.rule;
const BRASS = LEDGER.brass, HAIR = LEDGER.hair, MINT = LEDGER.mint;
const DISPLAY = TYPE.display, SANS = TYPE.sans, MONO = TYPE.mono;

/* ── CLI args ─────────────────────────────────────────────────────────── */
const args = process.argv.slice(2);
const specArg = args.find(a => !a.startsWith('--'));
if (!specArg) { console.error('Usage: build-deck.mts <spec.deck.mts> [--media <dir>] [--out <dir>]'); process.exit(1); }
const flag = (name: string) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const specPath = path.resolve(specArg);
// LOCAL-FIRST (Paul, 2026-07-22: "move from App to my computer… folders for
// media, assets and collateral"): with no flags, read images from ./media and
// ./assets in the CWD and write outputs to ./collateral — so from a studio
// workspace folder you just run the builder with a spec and it Just Works.
const mediaDir = flag('--media') ? path.resolve(flag('--media')!) : null;
const outDir = flag('--out') ? path.resolve(flag('--out')!) : path.resolve('collateral');
mkdirSync(outDir, { recursive: true });

const { deck } = await import(pathToFileURL(specPath).href) as { deck: Deck };

/* ── types (documented in the example spec) ───────────────────────────── */
interface Bar { label: string; sub: string; style: 'ink' | 'green'; h: number }
type Page =
  | { kind: 'numeral'; numeral: string; unit?: string; head: string; body?: string; source?: string }
  | { kind: 'statement'; tag: string; tagColor?: 'green' | 'brass'; head: string; body?: string; source?: string }
  | { kind: 'diagram'; tag: string; head: string; body?: string; source?: string; bars: Bar[]; connector?: string }
  | { kind: 'trade'; name: string; image?: string; imagePos?: string; numeral?: string; unit?: string; head: string; body?: string; source?: string };
interface Deck {
  slug: string;
  kicker: string;                                   // mono header label, e.g. 'MARKET MAP'
  cover: { hook: string; sub?: string; image?: string; imagePos?: string };
  pages: Page[];
  closer: { tag?: string; head: string; body?: string };
  headshot?: string;                                // byline photo; defaults to repo founder-portrait
  caption?: string;                                 // the LinkedIn post text
}

/* ── asset resolution ─────────────────────────────────────────────────── */
const { b64, esc, faceDisc, logoImg } = await import(pathToFileURL(path.join(ROOT, 'house/assets.ts')).href);
// Resolve an image path against, in order: absolute → --media dir → the CWD's
// local media/ and assets/ folders → the spec's own folder → CWD. So a spec
// can just name "tree.png" and drop it in ./media or ./assets.
const resolveImg = (p?: string): string | null => {
  if (!p) return null;
  const tries = [
    path.isAbsolute(p) ? p : null,
    mediaDir ? path.join(mediaDir, p) : null,
    path.resolve('media', p),
    path.resolve('assets', p),
    path.join(path.dirname(specPath), p),
    path.resolve(p),
  ].filter(Boolean) as string[];
  const hit = tries.find(t => existsSync(t));
  if (!hit) { console.warn(`[deck] image not found: ${p} (looked in ${tries.join(', ')})`); return null; }
  return b64(hit);
};

const LOGO = b64(path.join(ROOT, 'client/public/logo-green-x.png'));
const LOGO_W = b64(path.join(ROOT, 'client/public/logo-green-x-dark.png'));
const TEXTURE = b64(path.join(ROOT, 'client/public/textures/blackbleed.webp'));
const HEAD = resolveImg(deck.headshot) || b64(path.join(ROOT, 'client/public/founder-portrait.jpg'));
const COVER_IMG = resolveImg(deck.cover.image);

const face = (s: number) => faceDisc(HEAD, s, { objectPosition: '50% 22%', ring: 'rgba(143,208,174,0.65)' });
const total = deck.pages.length + 2; // cover + middles + closer
const kicker = `<div class="kick">${logoImg(LOGO, 30)}<span class="kt">${esc(deck.kicker)}</span></div>`;
const pfoot = (n: number) => `<div class="pfoot">${logoImg(LOGO_W, 34)}<span class="pn">${n} / ${total}</span></div>`;
const ghost = (n: number) => `<div class="ghost">${String(n).padStart(2, '0')}</div>`;

/* ── page builders ────────────────────────────────────────────────────── */
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
deck.pages.forEach((p, i) => {
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
    const cols = p.bars.map(b => `<div class="col"><div class="bars"><div class="bar ${b.style}" style="height:${b.h}px"><span class="barnum">${esc(b.label)}</span></div></div><div class="collab ${b.style === 'green' ? 'strong' : ''}">${b.sub}</div></div>`);
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

/* ── the document (house CSS, verbatim from researchComposer grammar) ─── */
const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${fontFaceCss()}</style>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; } img { vertical-align: middle; }
  html, body { width: 1080px; }
  .pg { width: 1080px; height: 1350px; position: relative; overflow: hidden; page-break-after: always; font-family: ${SANS}; font-variant-numeric: tabular-nums; }
  .pg:last-child { page-break-after: auto; }
  .pg.light { background: ${WARM}; color: ${INK}; }
  .pg.dark { background: ${DARK} url('${TEXTURE}') center/cover; color: ${IVORY}; }
  .glaze { position: absolute; inset: 0; background:
    radial-gradient(900px 500px at 50% -10%, rgba(22,98,76,0.22), transparent 65%),
    linear-gradient(180deg, rgba(15,26,22,0.55), rgba(15,26,22,0.72)); }
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
  .trade-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
</style></head><body>${html.join('')}</body></html>`;

/* ── render: page JPGs + rasterized PDF (the renderer-proof law) ──────── */
const page = await newRenderPage();
try {
  await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
  await page.setContent(doc, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.evaluateHandle('document.fonts.ready').catch(() => {});
  await page.evaluate(() => Promise.all(Array.from(document.images).map((im: any) => (im as HTMLImageElement).decode().catch(() => {})))).catch(() => {});
  await new Promise(r => setTimeout(r, 150));
  const shots: string[] = [];
  for (let i = 0; i < html.length; i++) {
    const shot = await page.screenshot({ type: 'jpeg', quality: 92, clip: { x: 0, y: i * 1350, width: 1080, height: 1350 } });
    writeFileSync(path.join(outDir, `${deck.slug}-p${String(i + 1).padStart(2, '0')}.jpg`), Buffer.from(shot));
    shots.push(`data:image/jpeg;base64,${Buffer.from(shot).toString('base64')}`);
  }
  const flat = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>* { margin: 0; padding: 0; } html, body { width: 1080px; } img { display: block; width: 1080px; height: 1350px; page-break-after: always; } img:last-child { page-break-after: auto; }</style></head><body>${shots.map(s => `<img src="${s}">`).join('')}</body></html>`;
  await page.setContent(flat, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.evaluate(() => Promise.all(Array.from(document.images).map((im: any) => (im as HTMLImageElement).decode().catch(() => {})))).catch(() => {});
  const pdf = await page.pdf({ width: '1080px', height: '1350px', printBackground: true, margin: { top: 0, bottom: 0, left: 0, right: 0 } });
  writeFileSync(path.join(outDir, `${deck.slug}.pdf`), Buffer.from(pdf));
} finally { await page.close().catch(() => {}); }

if (deck.caption) writeFileSync(path.join(outDir, `${deck.slug}-caption.txt`), deck.caption.trim() + '\n');
console.log(`✓ ${deck.slug}: ${html.length} pages → ${outDir}/${deck.slug}.pdf${deck.caption ? ' (+ caption)' : ''}`);
console.log(`  media: ${mediaDir || './media, ./assets (local folders)'}  ·  collateral: ${outDir}`);
process.exit(0);
