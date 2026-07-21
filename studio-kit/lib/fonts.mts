/**
 * Self-contained brand type — the same embed logic as the app, standalone.
 *
 * Reads the Fraunces / Inter / IBM Plex Mono woff2s from the @fontsource
 * packages and inlines them as base64 @font-face rules, so the render never
 * touches the network and the type is identical on every machine.
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
  try {
    const require = createRequire(import.meta.url);
    return readFileSync(require.resolve(pkgPath));
  } catch {
    return readFileSync(path.join(process.cwd(), 'node_modules', pkgPath));
  }
}

let cached: string | null = null;

/** All @font-face rules with the fonts inlined; '' if the packages are missing
 *  (run `npm install` in the kit). */
export function fontFaceCss(): string {
  if (cached !== null) return cached;
  try {
    cached = FILES.map(f => {
      const b64 = readFontFile(f.pkgPath).toString('base64');
      const fmt = f.variations ? 'woff2-variations' : 'woff2';
      return `@font-face{font-family:'${f.family}';font-style:normal;font-display:block;font-weight:${f.weight};src:url(data:font/woff2;base64,${b64}) format('${fmt}');}`;
    }).join('\n');
  } catch (err: any) {
    console.warn('[fonts] embedding failed — run `npm install` in the kit:', err?.message);
    cached = '';
  }
  return cached;
}
