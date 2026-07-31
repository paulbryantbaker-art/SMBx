/**
 * Studio link-preview card builder — the 1200×630 image a shared report URL
 * previews as (2026-07-29). Sibling to build-report.mts / build-deck.mts /
 * build-onepager.mts.
 *
 * Why: LinkedIn, Slack and X don't run JavaScript, so a posted /reports/<slug>
 * link previews from whatever <meta property="og:image"> the SERVER stamps into
 * index.html. Without a card, the link renders as a small text-only preview —
 * which is a poor result for the post that's meant to drive the traffic.
 *
 * The card is the announcement dark cover in miniature: boardroom texture,
 * white logo, brass kicker, two-tone Fraunces title, mint rule, ringed headshot
 * byline, and the report's own cover photo in a framed panel on the right
 * (framed, never soft-faded — the renderer-proof law from the carousel pass).
 *
 * Usage:
 *   npx tsx scripts/studio/build-og-card.mts <report.md> --slug <slug> [--out <dir>]
 *
 * Reads the same `<!--cover …-->` config block build-report.mts reads, so the
 * card, the PDF and the web page all describe one source of truth.
 * Output: <out>/<slug>-cover.jpg  (referenced by shared/reports.ts → ogImage)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
const { fontFaceCss } = await import(pathToFileURL(path.join(ROOT, 'server/services/fontEmbeds.ts')).href);
const { newRenderPage } = await import(pathToFileURL(path.join(ROOT, 'server/services/premiumPdfRenderer.ts')).href);

/* ── house palette (Ledger) ───────────────────────────────────────────── */
/* THE shared definition — see house/tokens.ts. Never hardcode a hex here. */
const { LEDGER, REPORT, blockBackground } = await import(pathToFileURL(path.join(ROOT, 'house/tokens.ts')).href);
const DARK = LEDGER.dark, IVORY = LEDGER.ivory, IVORY_SUB = REPORT.ivorySub;
const BRASS = LEDGER.brass, MINT = LEDGER.mint;
const DISPLAY = `'Fraunces', Georgia, serif`, SANS = `'Inter', -apple-system, sans-serif`, MONO = `'IBM Plex Mono', monospace`;

/* ── CLI ──────────────────────────────────────────────────────────────── */
const args = process.argv.slice(2);
const specArg = args.find(a => !a.startsWith('--'));
if (!specArg) {
  console.error('Usage: build-og-card.mts <report.md> --slug <slug> [--out <dir>] [--kicker "..."]');
  process.exit(1);
}
const flag = (n: string) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const mdPath = path.resolve(specArg);
const slug = flag('--slug') || path.basename(mdPath).replace(/\.md$/i, '');
const outDir = flag('--out') ? path.resolve(flag('--out')!) : path.join(ROOT, 'client/public/reports');
mkdirSync(outDir, { recursive: true });

/* ── read the cover config (build-report.mts's convention, verbatim) ──── */
const rawMd = readFileSync(mdPath, 'utf8');
const cut = rawMd.indexOf('\n---\n');
const coverRaw = cut >= 0 ? rawMd.slice(0, cut).trim() : rawMd;

const cfg: Record<string, string> = { byline: 'Paul Baker', role: 'smbX.ai · Buy-side corporate development', headshot: '', image: '', imagePos: '50% 50%' };
const cfgMatch = coverRaw.match(/<!--\s*cover([\s\S]*?)-->/i);
if (cfgMatch) for (const line of cfgMatch[1].split('\n')) {
  const i = line.indexOf(':');
  if (i < 0) continue;
  const k = line.slice(0, i).trim(), v = line.slice(i + 1).trim();
  if (v && k in cfg) cfg[k] = v;
}
const coverMd = (cfgMatch ? coverRaw.replace(cfgMatch[0], '') : coverRaw).trim();
const title = (coverMd.match(/^#\s+(.+)$/m)?.[1] || slug).trim();
const kicker = flag('--kicker') || 'Market assessment';

/* ── assets ───────────────────────────────────────────────────────────── */
const b64 = (p: string, m: string) => `data:${m};base64,${readFileSync(p).toString('base64')}`;
const mimeOf = (p: string) => /\.png$/i.test(p) ? 'image/png' : /\.webp$/i.test(p) ? 'image/webp' : 'image/jpeg';
const resolveAsset = (h: string) => {
  if (!h) return '';
  if (path.isAbsolute(h)) return existsSync(h) ? h : '';
  return [path.dirname(mdPath), path.join(path.dirname(mdPath), 'media'), path.join(ROOT, 'client/public')]
    .map(d => path.join(d, h)).find(existsSync) || '';
};

const LOGO_W = b64(path.join(ROOT, 'client/public/logo-green-x-dark.png'), 'image/png');
const TEXTURE = b64(path.join(ROOT, 'client/public/textures/blackbleed.webp'), 'image/webp');
const headPath = resolveAsset(cfg.headshot) || path.join(ROOT, 'client/public/founder-portrait.jpg');
const HEAD = existsSync(headPath) ? b64(headPath, mimeOf(headPath)) : '';
const heroPath = resolveAsset(cfg.image);
const HERO = heroPath ? b64(heroPath, mimeOf(heroPath)) : '';

/* Two-tone title: the first clause reads ivory, the turn reads mint — the
   house hook grammar. Split on the first em-dash/colon, else at the midpoint
   word boundary so it never cuts mid-phrase. */
/* Words that must never sit at either edge of the colour change — a run that
   ends on "&" or opens on "of" reads as a typo, not a turn. */
const CONNECTORS = new Set(['&', 'and', 'or', 'of', 'the', 'a', 'an', 'for', 'in', 'on', 'at', 'to', 'by', 'with', 'from']);

function twoTone(t: string): string {
  // A real separator is surrounded by space — an inner hyphen ("Buy-Side")
  // is part of a word and must not split it.
  const m = t.match(/^(.*?)\s+[—–:-]\s+(.+)$/);
  if (m && m[1].trim().length > 8) {
    return `${m[1].trim()} <span class="turn">${m[2].trim()}</span>`;
  }
  const words = t.split(/\s+/);
  if (words.length < 5) return t;

  let at = Math.ceil(words.length * 0.55);
  const isConn = (w?: string) => !!w && CONNECTORS.has(w.toLowerCase());
  // Nudge the boundary left so the connector travels with the phrase it binds.
  if (isConn(words[at])) at -= 1;
  if (isConn(words[at - 1])) at -= 1;
  at = Math.max(2, Math.min(at, words.length - 1));

  return `${words.slice(0, at).join(' ')} <span class="turn">${words.slice(at).join(' ')}</span>`;
}

/* ── the card ─────────────────────────────────────────────────────────── */
const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${fontFaceCss()}</style>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; overflow: hidden; }
  .card {
    position: relative; width: 1200px; height: 630px; display: flex;
    background: ${blockBackground(TEXTURE)}; color: ${IVORY};
    font-family: ${SANS};
  }
  .card::before {
    content: ''; position: absolute; inset: 0;
    background:
      radial-gradient(80% 60% at 50% -10%, rgba(168,240,206,0.13), rgba(168,240,206,0) 60%),
      radial-gradient(70% 50% at 50% 110%, rgba(232,166,43,0.10), rgba(232,166,43,0) 62%),
      linear-gradient(rgba(10,106,76,0.42), rgba(10,106,76,0.42));
  }
  .card > * { position: relative; z-index: 1; }

  .left {
    flex: ${HERO ? '0 0 690px' : '1'}; display: flex; flex-direction: column;
    padding: 54px 44px 46px 58px;
  }
  .logo { height: 30px; width: auto; align-self: flex-start; display: block; }
  .body { flex: 1; display: flex; flex-direction: column; justify-content: center; }
  .kicker {
    font-family: ${MONO}; font-size: 15px; letter-spacing: 0.15em;
    text-transform: uppercase; color: ${BRASS}; font-weight: 500; margin-bottom: 20px;
  }
  h1 {
    font-family: ${DISPLAY}; font-weight: 545; font-size: ${title.length > 74 ? '40px' : title.length > 52 ? '46px' : '54px'};
    line-height: 1.07; letter-spacing: -0.02em; color: ${IVORY}; text-wrap: balance;
  }
  h1 .turn { color: ${MINT}; }
  .rule { width: 78px; height: 4px; background: ${BRASS}; border-radius: 99px; margin-top: 26px; }

  .byline { display: flex; align-items: center; gap: 14px; }
  .face {
    width: 52px; height: 52px; border-radius: 50%; object-fit: cover;
    object-position: 50% 20%; flex: none; border: 2px solid rgba(168,240,206,0.55);
  }
  .by-name { font-size: 17px; font-weight: 600; color: ${IVORY}; }
  .by-role { font-size: 14px; color: ${IVORY_SUB}; margin-top: 2px; }

  /* Framed panel — never a soft-masked dissolve; fades seam under third-party
     rasterizers (the renderer-proof law). */
  .right { flex: 1; padding: 54px 58px 46px 0; display: flex; }
  .hero {
    width: 100%; height: 100%; object-fit: cover; object-position: ${cfg.imagePos};
    border-radius: 18px; border: 1px solid rgba(255,255,255,0.18);
    box-shadow: 0 18px 44px rgba(0,0,0,0.45);
  }
</style></head><body>
  <div class="card">
    <div class="left">
      <img class="logo" src="${LOGO_W}">
      <div class="body">
        <div class="kicker">${kicker}</div>
        <h1>${twoTone(title)}</h1>
        <div class="rule"></div>
      </div>
      <div class="byline">
        ${HEAD ? `<img class="face" src="${HEAD}">` : ''}
        <div>
          <div class="by-name">${cfg.byline}</div>
          <div class="by-role">${cfg.role}</div>
        </div>
      </div>
    </div>
    ${HERO ? `<div class="right"><img class="hero" src="${HERO}"></div>` : ''}
  </div>
</body></html>`;

/* ── render ───────────────────────────────────────────────────────────── */
const page = await newRenderPage();
try {
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const buf = await page.screenshot({ type: 'jpeg', quality: 88 });
  const out = path.join(outDir, `${slug}-cover.jpg`);
  writeFileSync(out, buf);
  console.log(`✓ ${slug}-cover.jpg (${Math.round(buf.length / 1024)}KB) → ${outDir}`);
} finally {
  await page.close();
  await page.browser().close().catch(() => {});
}
