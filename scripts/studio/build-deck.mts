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

/* ── the document — house grammar, shared with the app (house/deck.ts) ──
   Paul, 2026-07-24: collateral must render the same whether it is built
   here in a Cowork session or by the app. Both call deckDocument(). */
const { deckPages, deckCss } = await import(pathToFileURL(path.join(ROOT, 'house/deck.ts')).href);
const html: string[] = deckPages(deck, {
  logo: LOGO, logoWhite: LOGO_W, texture: TEXTURE,
  headshot: HEAD, coverImage: COVER_IMG, image: resolveImg,
});
const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${fontFaceCss()}</style>
<style>${deckCss(TEXTURE)}</style></head><body>${html.join('')}</body></html>`;

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
