/**
 * Studio one-pager builder — a house-style LinkedIn single-image post from a
 * plain spec, rendered on YOUR computer via Cowork. Sibling to build-deck.mts
 * (carousels); this one owns the single 1080×1350 formats.
 *
 * Why this exists (Paul, 2026-07-22, "make it repeatable and robust"): the
 * availability / statement one-pagers were hand-written throwaway scripts. This
 * turns the format into a fixed, brand-locked template driven by a tiny spec —
 * copy + one image + which modes — so re-running with new numbers is a
 * 30-second job, not a rebuild. Same Ledger design system as the deck builder
 * (palette, Fraunces/Inter/Plex, boardroom texture) and the same renderer-proof
 * flat-image PDF, all pure local compute (no app, no API key).
 *
 * Usage:
 *   npx tsx scripts/studio/build-onepager.mts <spec.post.mts> [--media <dir>] [--out <dir>]
 *
 * The spec is a small .mts file that `export const post = {...}` (see
 * scripts/studio/decks/2-open-seats.post.mts for a worked example + full field
 * reference). Image paths resolve against --media, then ./media, ./assets, the
 * spec's own folder, then CWD; absolute paths pass through; brand assets (logo,
 * texture) come from the repo.
 *
 * Layout: a vertical split — copy column (dark boardroom OR light bone) on the
 * left, your photo full-bleed on the right with a recessed-shadow seam (no
 * light line, at any zoom). Omit `image` and the copy fills the whole card.
 *
 * Outputs (into --out, default ./collateral): <slug>-dark.png / -light.png (the
 * postable images), <slug>-dark.pdf / -light.pdf (single-page document form),
 * <slug>-caption.txt (the post copy). Modes default to both; set `variants`.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
const { fontFaceCss } = await import(pathToFileURL(path.join(ROOT, 'server/services/fontEmbeds.ts')).href);
const { newRenderPage } = await import(pathToFileURL(path.join(ROOT, 'server/services/premiumPdfRenderer.ts')).href);

/* ── house palette (mirrors build-deck.mts / researchComposer.ts) ─────── */
/* THE shared definition — see house/tokens.ts. Never hardcode a hex here. */
const { LEDGER, TYPE } = await import(pathToFileURL(path.join(ROOT, 'house/tokens.ts')).href);
const INK = LEDGER.ink, BODY = LEDGER.slate, GREEN = LEDGER.green;
const WARM = LEDGER.bone, DARK = LEDGER.dark, IVORY = LEDGER.ivory, IVORY_SUB = LEDGER.rule;
const BRASS = LEDGER.brass, HAIR = LEDGER.hair, MINT = LEDGER.mint;
const DISPLAY = TYPE.display, SANS = TYPE.sans, MONO = TYPE.mono;

/* ── CLI args ─────────────────────────────────────────────────────────── */
const args = process.argv.slice(2);
const specArg = args.find(a => !a.startsWith('--'));
if (!specArg) { console.error('Usage: build-onepager.mts <spec.post.mts> [--media <dir>] [--out <dir>]'); process.exit(1); }
const flag = (name: string) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const specPath = path.resolve(specArg);
const mediaDir = flag('--media') ? path.resolve(flag('--media')!) : null;
const outDir = flag('--out') ? path.resolve(flag('--out')!) : path.resolve('collateral');
mkdirSync(outDir, { recursive: true });

const { post } = await import(pathToFileURL(specPath).href) as { post: Post };

/* ── types (documented in the example spec) ───────────────────────────── */
interface Post {
  slug: string;
  kicker?: string;                          // mono brass top-right label, e.g. 'AVAILABILITY'
  numeral?: string;                         // giant mint/green figure, e.g. '2'
  numeralLabel?: string;                    // small mono label beside it ('\n' = line break)
  hook: string;                             // Fraunces headline — use ‑ (U+2011) to glue compounds like buy‑side
  body?: string;                            // supporting paragraph
  invite?: string;                          // bold, warm invitation line
  cta?: string;                             // mono call-to-action, e.g. "Let's talk  →"
  byline?: { name?: string; title?: string };
  image?: string;                           // right-panel photo; omit for a full-width text card
  imagePos?: string;                        // CSS object-position, default '50% 42%'
  caption?: string;                         // the LinkedIn post text
  variants?: ('dark' | 'light')[];          // default: both
}

/* ── asset resolution (local-first, same order as build-deck.mts) ─────── */
const { b64, esc, logoImg } = await import(pathToFileURL(path.join(ROOT, 'house/assets.ts')).href);
const resolveImg = (p?: string): string | null => {
  if (!p) return null;
  const tries = [
    path.isAbsolute(p) ? p : null,
    mediaDir ? path.join(mediaDir, p) : null,
    path.resolve('media', p),
    path.resolve('assets', p),
    path.join(path.dirname(specPath), p),
    path.join(ROOT, 'client/public', p),   // repo brand/founder photos by bare name (founder-walking.webp, …)
    path.resolve(p),
  ].filter(Boolean) as string[];
  const hit = tries.find(t => existsSync(t));
  if (!hit) { console.warn(`[onepager] image not found: ${p} (looked in ${tries.join(', ')})`); return null; }
  return b64(hit);
};

const LOGO = b64(path.join(ROOT, 'client/public/logo-green-x.png'));
const LOGO_W = b64(path.join(ROOT, 'client/public/logo-green-x-dark.png'));
const TEXTURE = b64(path.join(ROOT, 'client/public/textures/blackbleed.webp'));
const PHOTO = resolveImg(post.image);

const name = post.byline?.name ?? 'Paul Baker';
const title = post.byline?.title ?? 'Buy-side corporate development';
const COLW = PHOTO ? 610 : 1080;
const PHOTOW = 1080 - COLW;

/* ── one card (dark|light), the approved split composition ────────────── */
function card(dark: boolean): string {
  const colBg = dark ? `background:${DARK} url('${TEXTURE}') center/cover` : `background:${WARM}`;
  const glaze = dark
    ? `radial-gradient(760px 460px at 30% -6%, rgba(22,98,76,0.22), transparent 62%), linear-gradient(180deg, rgba(15,26,22,0.5), rgba(15,26,22,0.72))`
    : `radial-gradient(900px 620px at 12% 0%, rgba(22,98,76,0.05), transparent 60%)`;
  const inkC = dark ? IVORY : INK, subC = dark ? IVORY_SUB : BODY;
  const numC = dark ? MINT : GREEN, ctaC = dark ? MINT : GREEN, logoImg = dark ? LOGO_W : LOGO;
  const footBorder = dark ? 'rgba(243,241,234,0.12)' : HAIR;
  const pad = PHOTO ? '66px 60px 46px' : '84px 92px 56px';
  const numLabel = post.numeralLabel ? esc(post.numeralLabel).replace(/\n/g, '<br>') : 'open<br>seats';

  const seats = post.numeral
    ? `<div class="seats"><span class="num" style="color:${numC}">${esc(post.numeral)}</span><span class="numlab" style="color:${subC}">${numLabel}</span></div>`
    : '';
  const body = post.body ? `<div class="body" style="color:${subC}">${esc(post.body)}</div>` : '';
  const invite = post.invite ? `<div class="emph" style="color:${inkC}">${esc(post.invite)}</div>` : '';
  const cta = post.cta ? `<div class="cta" style="color:${ctaC}">${esc(post.cta)}</div>` : '';
  const kick = post.kicker ? `<span class="kick">${esc(post.kicker)}</span>` : '<span></span>';
  const photo = PHOTO
    ? `<div class="photo"><img src="${PHOTO}" alt=""><div class="vgrad"></div></div>`
    : '';

  return `<div class="card" style="color:${inkC}">
    <div class="col" style="${colBg}">
      <div class="glaze" style="background:${glaze}"></div>
      <div class="pad" style="padding:${pad}">
        <div class="top"><img src="${logoImg}" style="height:38px;width:auto;display:block">${kick}</div>
        <div class="mid">
          ${seats}
          <div class="hook" style="color:${inkC}">${esc(post.hook)}</div>
          <div class="rule"></div>
          ${body}
          ${invite}
          ${cta}
        </div>
        <div class="foot" style="border-top:1px solid ${footBorder}">
          <div class="who"><div class="n" style="color:${inkC}">${esc(name)}</div><div class="t" style="color:${subC}">${esc(title)}</div></div>
          <img class="logo" src="${logoImg}" style="height:32px;width:auto;display:block">
        </div>
      </div>
    </div>
    ${photo}
  </div>`;
}

const CSS = `
  * { margin:0; padding:0; box-sizing:border-box; } img { vertical-align:middle; }
  html, body { width:1080px; }
  .card { width:1080px; height:1350px; position:relative; display:flex; overflow:hidden; font-family:${SANS}; font-variant-numeric:tabular-nums; }
  .col { width:${COLW}px; height:100%; position:relative; flex:none; }
  .glaze { position:absolute; inset:0; }
  .pad { position:absolute; inset:0; display:flex; flex-direction:column; z-index:1; }
  .top { display:flex; align-items:center; justify-content:space-between; }
  .kick { font-family:${MONO}; font-size:17px; letter-spacing:0.16em; color:${BRASS}; font-weight:600; text-transform:uppercase; }
  .mid { flex:1; display:flex; flex-direction:column; justify-content:center; }
  .seats { display:flex; align-items:baseline; gap:20px; margin-bottom:26px; }
  .num { font-family:${DISPLAY}; font-weight:545; font-size:124px; line-height:0.86; }
  .numlab { font-family:${MONO}; font-size:18px; letter-spacing:0.1em; text-transform:uppercase; line-height:1.4; }
  .hook { font-family:${DISPLAY}; font-weight:545; font-size:45px; line-height:1.13; letter-spacing:-0.014em; text-wrap:balance; }
  .rule { width:72px; height:5px; background:${MINT}; border-radius:99px; margin:30px 0 26px; }
  .body { font-size:23px; line-height:1.5; }
  .emph { margin-top:20px; font-size:23px; line-height:1.5; font-weight:600; }
  .cta { margin-top:30px; font-family:${MONO}; font-size:20px; letter-spacing:0.05em; font-weight:600; }
  .foot { display:flex; align-items:center; gap:16px; padding-top:26px; }
  .who .n { font-size:22px; font-weight:700; letter-spacing:-0.01em; }
  .who .t { margin-top:2px; font-size:16px; }
  .foot .logo { margin-left:auto; }
  .photo { width:${PHOTOW}px; height:100%; position:relative; flex:none; background:${DARK}; }
  .photo img { width:100%; height:100%; object-fit:cover; object-position:${post.imagePos || '50% 42%'}; display:block; }
  /* Recessed-shadow seam: a DARK gradient on the photo's left edge. No light
     element near the join, so nothing can read as a white line, in any renderer. */
  .vgrad { position:absolute; inset:0; background:linear-gradient(90deg, rgba(9,15,13,0.78) 0%, rgba(9,15,13,0.34) 6%, transparent 18%); }
`;

const docFor = (dark: boolean) =>
  `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${fontFaceCss()}</style><style>${CSS}</style></head><body>${card(dark)}</body></html>`;

/* ── render each mode: PNG + renderer-proof single-image PDF ───────────── */
const variants = post.variants ?? ['dark', 'light'];
const page = await newRenderPage();
try {
  await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
  for (const v of variants) {
    const dark = v === 'dark';
    await page.setContent(docFor(dark), { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.evaluateHandle('document.fonts.ready').catch(() => {});
    await page.evaluate(() => Promise.all(Array.from(document.images).map((im: any) => (im as HTMLImageElement).decode().catch(() => {})))).catch(() => {});
    await new Promise(r => setTimeout(r, 140));
    const png = await page.screenshot({ type: 'png' });
    writeFileSync(path.join(outDir, `${post.slug}-${v}.png`), Buffer.from(png));
    // Wrap the flat PNG into a single-page PDF — one image, no vector object
    // edges, so Preview / LinkedIn have nothing to crack (the renderer-proof law).
    const uri = `data:image/png;base64,${Buffer.from(png).toString('base64')}`;
    const flat = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0}@page{size:1080px 1350px;margin:0}html,body{width:1080px;height:1350px}img{width:1080px;height:1350px;display:block}</style></head><body><img src="${uri}"></body></html>`;
    await page.setContent(flat, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.evaluate(() => Promise.all(Array.from(document.images).map((im: any) => (im as HTMLImageElement).decode().catch(() => {})))).catch(() => {});
    const pdf = await page.pdf({ width: '1080px', height: '1350px', printBackground: true, pageRanges: '1' });
    writeFileSync(path.join(outDir, `${post.slug}-${v}.pdf`), Buffer.from(pdf));
  }
} finally { await page.close().catch(() => {}); }

if (post.caption) writeFileSync(path.join(outDir, `${post.slug}-caption.txt`), post.caption.trim() + '\n');
console.log(`✓ ${post.slug}: ${variants.join(' + ')} → ${outDir}/${post.slug}-*.png/.pdf${post.caption ? ' (+ caption)' : ''}`);
console.log(`  photo: ${post.image ? (PHOTO ? post.image : 'NOT FOUND — text-only card') : 'none (text-only card)'}  ·  collateral: ${outDir}`);
process.exit(0);
