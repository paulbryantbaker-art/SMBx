/**
 * Atlas desktop design tokens — the single source of truth for inline-styled
 * desktop components. Values are verbatim from /tmp/atlas_maps/00 §(a) GLOBAL
 * TOKENS and the ATLAS_BUILD_CONTRACT. `atlas.css` mirrors the palette as CSS
 * vars under `.atlas-root`; this object is what every screen imports.
 */
export const T = {
  // The native system font (San Francisco on iOS/macOS, Segoe UI on Windows,
  // Roboto on Android). The OS hints it to the device and optically sizes it, so
  // it renders crisper than any webfont — the app reads as cleanly as a native
  // app (YouTube/Kroger reference). Replaced 'DM Sans', which read soft on mobile.
  font: '-apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  // ink / text — the whole scale lifted darker for stronger contrast/readability
  // (2026-06-23). Titles near-black for YouTube-style punch; body a touch darker;
  // the secondary grays raised from ~5.6:1 to ~7:1 (AAA) so they stay legible on
  // the tinted frame wash, not just on white. Hierarchy steps preserved.
  ink: '#141519', ink2: '#181a1e', ink3: '#2d3136', label: '#393c41',
  // Secondary text — all comfortably AAA on white (≈6.7–7:1) and still ≥AA on the
  // lavender wash. (Earlier these were illegible: muted2 #80868b ~3.5:1 / faint
  // #9aa3ad ~2.6:1.) Readability is paramount, especially on mobile.
  muted: '#4d5765', muted2: '#4b5460', faint: '#4e5764',
  // blue (primary/active)
  blue: '#0b57d0', blueBg: '#e8f0fe', blueBg2: '#eef4ff', blueBg3: '#f3f7ff',
  navActive: '#d3e3fd', stageActiveBd: '#bcd4fb', approvalBd: '#cfe0ff',
  tabActive: 'rgba(11,87,208,.10)', tabHover: 'rgba(11,87,208,.05)',
  // green / amber / terra / violet
  green: '#1f8a5b', greenBg: '#e6f4ec', greenAv: '#cdeada',
  amber: '#9a6b00', amberBg: '#fdf0d5', amberBg2: '#fff3e0', amberAv: '#f3e0b0',
  citeBg: '#fff6d6', citeBd: '#f0dca0',
  terra: '#c2410c', terraBg: '#fdeee6',
  violet: '#5b53d6', violetBg: '#ecebfb',
  // surfaces / borders
  white: '#fff', surface: '#fafbfd', page: '#e9edf2', hover: '#f7f9fc',
  track: '#f0f4f9', railDiv: '#f0f2f5',
  border: '#d8dfe9', hair: '#eef1f5', rowDiv: '#f3f5f8', rowDiv2: '#f6f8fb',
  inputBd: '#dbe3ec', progTrack: '#e8edf3',
  // gradients
  spark: 'linear-gradient(135deg,#4285F4,#9B72CB 50%,#D96570)',
  avatarGrad: 'linear-gradient(135deg,#4285F4,#9B72CB)',
  // radii
  rCard: 14, rCardLg: 16, rPill: 999, rComposer: 24, rBubble: 18, rChip: 13,
  // shadow — slightly deeper + faintly violet-tinted so white cards lift cleanly
  // off the new purple frame wash (more separation = more perceived contrast).
  shCard: '0 2px 6px rgba(34,36,72,.09), 0 1px 2px rgba(34,36,72,.05)',
  shSoft: '0 1px 3px rgba(34,36,72,.07)',
  shHover: '0 6px 16px rgba(34,36,72,.13)', shWin: '0 8px 30px rgba(31,41,55,.16)',
} as const;

export type AtlasTokens = typeof T;
