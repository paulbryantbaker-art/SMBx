/**
 * Self-contained brand type for Puppeteer-rendered artifacts (2026-07-20).
 *
 * Paul's production report PDF came back in typewriter mono: the composer
 * templates loaded Fraunces/Inter/IBM Plex Mono from the Google Fonts CDN at
 * render time, those fetches fail on the deployed render path (networkidle0
 * completes with the requests dead), and the Docker image ships only
 * Noto/free fonts — so every artifact silently fell back and "did not follow
 * the family styles." The woff2s now ship with the app (@fontsource packages,
 * ordinary dependencies) and are inlined as base64 data URIs: no network, no
 * system-font dependence, identical type in every environment.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const FILES: Array<{ family: string; pkgPath: string; weight: string; variations?: boolean }> = [
  { family: 'Inter', pkgPath: '@fontsource-variable/inter/files/inter-latin-opsz-normal.woff2', weight: '100 900', variations: true },
  { family: 'Fraunces', pkgPath: '@fontsource-variable/fraunces/files/fraunces-latin-opsz-normal.woff2', weight: '100 900', variations: true },
  { family: 'IBM Plex Mono', pkgPath: '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2', weight: '400' },
  { family: 'IBM Plex Mono', pkgPath: '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2', weight: '500' },
  { family: 'IBM Plex Mono', pkgPath: '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff2', weight: '600' },
];

function readFontFile(pkgPath: string): Buffer {
  // Proper node resolution first (works from source and from the esbuild
  // bundle, which sits in dist/server with node_modules two levels up)...
  try {
    const require = createRequire(import.meta.url);
    return readFileSync(require.resolve(pkgPath));
  } catch {
    // ...then the app root, which is where both dev and the Docker image run.
    return readFileSync(path.join(process.cwd(), 'node_modules', pkgPath));
  }
}

let cached: string | null = null;

/** All @font-face rules with the fonts inlined; '' when the files are missing
 *  (the composer then falls back to the CDN link, the old behavior). */
export function fontFaceCss(): string {
  if (cached !== null) return cached;
  try {
    cached = FILES.map(f => {
      const b64 = readFontFile(f.pkgPath).toString('base64');
      const fmt = f.variations ? 'woff2-variations' : 'woff2';
      return `@font-face{font-family:'${f.family}';font-style:normal;font-display:block;font-weight:${f.weight};src:url(data:font/woff2;base64,${b64}) format('${fmt}');}`;
    }).join('\n');
  } catch (err: any) {
    console.warn('[fonts] embedding failed — artifacts fall back to the CDN link:', err?.message);
    cached = '';
  }
  return cached;
}
