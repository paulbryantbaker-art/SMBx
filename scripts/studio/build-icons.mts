/**
 * Favicons and app icons, rendered from the X mark (2026-07-29).
 *
 * Paul: "Where is the X logo in the address bar?" Nowhere — index.html asked
 * for `/X.png` and the manifest asked for `pwa-icon-*.png`, and NONE of those
 * files existed. Every icon the site declared was a 404, so the browser fell
 * back to its generic document glyph. The mark was deleted in a logo cleanup
 * and the references were never updated.
 *
 * They are generated rather than hand-exported because the brand accent has
 * already moved three times (coral → blue → green) and each move silently left
 * the icons behind. One command re-cuts every size from the current mark:
 *
 *     npx tsx scripts/studio/build-icons.mts
 *
 * EVERY tile is now the mark in bone on the JADE PLATE (2026-08-01, Paul:
 * "let's improve the favicon"). The original reasoning — a light tile holds
 * its own against a dark tab strip — was right about the TILE and silent
 * about the MARK: a thin Deal-Green X on near-white bone measures a hair over
 * 3:1, and at 16px, after the browser has anti-aliased a one-pixel stroke, it
 * reads as a smudge. Ivory on jade is 6.2:1 and the plate is saturated, so it
 * separates from a light strip AND a dark one. The `-dark` suffix on the PWA
 * names is now historical; it is the only treatment.
 *
 * Padding is tighter than it was for the same reason: the stroke weight is
 * intrinsic to the mark, so the only way to thicken it at 16px is to let the
 * mark occupy more of the tile.
 *
 * Pure local Chromium. No model, no API key.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
const { newRenderPage } = await import(pathToFileURL(path.join(ROOT, 'server/services/premiumPdfRenderer.ts')).href);

const OUT = path.join(ROOT, 'client/public');
mkdirSync(OUT, { recursive: true });

/* THE shared definition — see house/tokens.ts. Never hardcode a hex here. */
const { LEDGER } = await import(pathToFileURL(path.join(ROOT, 'house/tokens.ts')).href);
const BONE = LEDGER.bone;
const DARK = LEDGER.dark;

const MARK = 'data:image/png;base64,' +
  readFileSync(path.join(OUT, 'logo-x-green.png')).toString('base64');

interface Icon { file: string; size: number; dark?: boolean; pad?: number; radius?: number }

const ICONS: Icon[] = [
  // Browser tab. 32 covers most cases; 16 is cut separately because it needs
  // the mark proportionally LARGER — not smaller — to survive anti-aliasing.
  { file: 'favicon-32.png', size: 32, dark: true, pad: 0.17 },
  { file: 'favicon-16.png', size: 16, dark: true, pad: 0.13 },
  // Bookmarks, and the icon Safari shows on a pinned/home-screen tile.
  { file: 'favicon-180.png', size: 180, dark: true, pad: 0.22 },
  // iOS home screen. Apple ignores transparency, so the tile must be opaque —
  // which the jade plate is, so this needs no special case any more.
  { file: 'apple-touch-icon.png', size: 180, dark: true, pad: 0.22, radius: 0 },
  // Installed PWA.
  { file: 'pwa-icon-180-dark.png', size: 180, dark: true, pad: 0.22, radius: 0 },
  { file: 'pwa-icon-192-dark.png', size: 192, dark: true, pad: 0.22, radius: 0 },
  { file: 'pwa-icon-512-dark.png', size: 512, dark: true, pad: 0.22, radius: 0 },
];

const html = (i: Icon) => `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  html, body { margin: 0; padding: 0; background: transparent; }
  .tile {
    width: ${i.size}px; height: ${i.size}px; box-sizing: border-box;
    background: ${i.dark ? DARK : BONE};
    ${i.radius === 0 ? '' : `border-radius: ${Math.round(i.size * (i.radius ?? 0.22))}px;`}
    display: flex; align-items: center; justify-content: center;
    padding: ${Math.round(i.size * (i.pad ?? 0.18))}px;
  }
  img {
    width: 100%; height: 100%; object-fit: contain; display: block;
    /* The source mark is Deal Green. On the dark tile it has to become bone,
       and a filter does that without keeping a second master in the repo. */
    ${i.dark ? 'filter: brightness(0) invert(1);' : ''}
  }
</style></head><body><div class="tile"><img src="${MARK}"></div></body></html>`;

const page = await newRenderPage();
try {
  for (const icon of ICONS) {
    await page.setViewport({ width: icon.size, height: icon.size, deviceScaleFactor: 1 });
    // 'load', not 'networkidle0': the mark is a data URI, so there is no
    // network to go idle and the wait just burns the 30s timeout.
    await page.setContent(html(icon), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const buf = await page.screenshot({
      type: 'png',
      omitBackground: true,
      clip: { x: 0, y: 0, width: icon.size, height: icon.size },
    });
    writeFileSync(path.join(OUT, icon.file), buf);
    console.log(`  ✓ ${icon.file.padEnd(26)} ${icon.size}×${icon.size}  ${icon.dark ? 'bone on jade' : 'green on bone'}  ${Math.round(buf.length / 1024)}KB`);
  }
} finally {
  await page.close();
  await page.browser().close().catch(() => {});
}
console.log(`\n${ICONS.length} icons → client/public/`);
