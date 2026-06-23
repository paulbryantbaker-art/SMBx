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
  // ink / text
  ink: '#1f1f1f', ink2: '#202124', ink3: '#3c4043', label: '#444746',
  // muted2/faint darkened to pass WCAG AA (were #80868b ~3.5:1 / #9aa3ad ~2.6:1 —
  // illegible secondary text; readability is paramount, esp. on mobile).
  muted: '#5e6b7b', muted2: '#5d6672', faint: '#616a78',
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
  border: '#e3e8ef', hair: '#eef1f5', rowDiv: '#f3f5f8', rowDiv2: '#f6f8fb',
  inputBd: '#dbe3ec', progTrack: '#e8edf3',
  // gradients
  spark: 'linear-gradient(135deg,#4285F4,#9B72CB 50%,#D96570)',
  avatarGrad: 'linear-gradient(135deg,#4285F4,#9B72CB)',
  // radii
  rCard: 14, rCardLg: 16, rPill: 999, rComposer: 24, rBubble: 18, rChip: 13,
  // shadow
  shCard: '0 1px 2px rgba(60,64,67,.06)', shSoft: '0 1px 2px rgba(60,64,67,.05)',
  shHover: '0 4px 12px rgba(60,64,67,.10)', shWin: '0 8px 30px rgba(31,41,55,.16)',
} as const;

export type AtlasTokens = typeof T;
