/**
 * House asset primitives — the shared half of collateral rendering.
 *
 * Pairs with `tokens.ts`. Same rule: ZERO dependencies. No DB, no API key, no
 * Express, no Anthropic SDK — only `node:fs`. That is what lets one definition
 * serve a local Cowork CLI run, an in-app render, and the vendored
 * `studio-kit/` copy without drifting.
 *
 * The seam this file draws (Paul, 2026-07-24 — "same backend regardless of
 * where I am"):
 *
 *   RESOLUTION  — where image bytes come from — stays with the caller.
 *                 Local builders read `./media`; the app reads `studio_assets`.
 *   EMISSION    — what the HTML looks like — lives here, shared.
 *
 * So the emitters below take a data URI, never a path or a DB row. Callers
 * resolve, this file renders. That one rule is what keeps the app and Cowork
 * from producing different-looking collateral from the same content.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

/* ── pure helpers ─────────────────────────────────────────────────────── */

/** Extension → mime. Covers the formats the house system actually ships. */
export const mimeOf = (p: string): string =>
  /\.png$/i.test(p) ? 'image/png'
  : /\.webp$/i.test(p) ? 'image/webp'
  : /\.svg$/i.test(p) ? 'image/svg+xml'
  : 'image/jpeg';

/** File → data URI. Mime inferred from the extension unless given. */
export const b64 = (p: string, mime?: string): string =>
  `data:${mime || mimeOf(p)};base64,${readFileSync(p).toString('base64')}`;

/** HTML-escape a value bound for a template. Always use on spec-supplied copy. */
export const esc = (s: unknown): string =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ── brand assets ─────────────────────────────────────────────────────── */

/** Canonical brand asset paths, relative to the repo root. */
export const BRAND_PATHS = {
  logoGreen: 'client/public/logo-green-x.png',
  logoWhite: 'client/public/logo-green-x-dark.png', // for dark surfaces
  texture: 'client/public/textures/blackbleed.webp', // boardroom band
  founderPortrait: 'client/public/founder-portrait.jpg',
  founderWalking: 'client/public/founder-walking.webp',
} as const;

/** Load the brand set as data URIs. `root` is the repo root. */
export function brandAssets(root: string) {
  const load = (rel: string) => {
    const p = path.join(root, rel);
    return existsSync(p) ? b64(p) : null;
  };
  return {
    logoGreen: load(BRAND_PATHS.logoGreen),
    logoWhite: load(BRAND_PATHS.logoWhite),
    texture: load(BRAND_PATHS.texture),
    founderPortrait: load(BRAND_PATHS.founderPortrait),
  };
}

/* ── emitters — shared grammar ────────────────────────────────────────── */

/**
 * The byline headshot: a circle-cropped face.
 *
 * `objectPosition` is the focal crop — local specs pass a fixed value, the app
 * passes the per-asset focal point from `studio_assets`. `ring` is the mint
 * hairline; omit for no ring.
 */
export function faceDisc(
  src: string,
  sizePx: number,
  opts: { objectPosition?: string; ring?: string; alt?: string } = {},
): string {
  const ring = opts.ring ? `border:3px solid ${opts.ring};` : '';
  const pos = opts.objectPosition || '50% 22%';
  return `<img src="${src}" alt="${esc(opts.alt || 'Paul Baker')}" style="width:${sizePx}px;height:${sizePx}px;border-radius:50%;object-fit:cover;object-position:${pos};display:block;flex:none;${ring}">`;
}

/**
 * Initials fallback for the byline, so a missing headshot degrades to a brand
 * mark rather than a broken image. Never a stock face — house law.
 */
export function initialsDisc(
  sizePx: number,
  opts: { ring?: string; bg: string; sans: string; initials?: string } = {} as never,
): string {
  const ring = opts.ring ? `border:3px solid ${opts.ring};` : '';
  return `<div style="width:${sizePx}px;height:${sizePx}px;border-radius:50%;background:${opts.bg};color:#fff;display:flex;align-items:center;justify-content:center;font-family:${opts.sans};font-weight:800;font-size:${Math.round(sizePx * 0.38)}px;flex:none;${ring}">${esc(opts.initials || 'PB')}</div>`;
}

/** The logo, sized by height with aspect preserved. */
export function logoImg(
  src: string,
  heightPx: number,
  opts: { invert?: boolean } = {},
): string {
  const filter = opts.invert ? 'filter:brightness(0) invert(1);' : '';
  return `<img src="${src}" alt="smbX.ai" style="height:${heightPx}px;width:auto;display:block;${filter}">`;
}

/**
 * Resolve an image reference against an ordered list of directories.
 * Returns a data URI, or null if nothing matched.
 *
 * This is the LOCAL resolver (disk). The app supplies its own resolver over
 * `studio_assets` — same emitters downstream, different source.
 */
export function resolveFromDirs(
  ref: string | undefined,
  dirs: (string | null | undefined)[],
  onMiss?: (ref: string, tried: string[]) => void,
): string | null {
  if (!ref) return null;
  const tried = [
    path.isAbsolute(ref) ? ref : null,
    ...dirs.filter(Boolean).map(d => path.join(d as string, ref)),
  ].filter(Boolean) as string[];
  const hit = tried.find(t => existsSync(t));
  if (!hit) { onMiss?.(ref, tried); return null; }
  return b64(hit);
}
