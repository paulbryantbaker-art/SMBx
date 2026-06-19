/**
 * Atlas-mobile token block. Everything that already exists in the desktop Atlas
 * design system is reused from `../desktop/atlasTokens` (`T`) — this file holds
 * ONLY the mobile-only values that have no desktop equivalent: the three glass
 * materials (nav / FAB / bottom-sheet), the frame-background wash, and a couple
 * of mobile neutrals. Values are verbatim from the Atlas-mobile shell spec
 * (m4 §2 "MOBILE-ONLY values").
 *
 * Law: never re-derive a desktop token here. If a color resolves to a `T`
 * token, import `T` and use it — only the liquid-glass materials + the frame
 * gradient are genuinely new.
 */

/** Liquid-glass tab-bar material (m4 §1d). A small inset rounded bar — NOT a
 *  full-viewport fixed bg div (Safari toolbar rule). The `fallbackBg` is the
 *  higher-opacity solid for browsers without backdrop-filter support. */
const glassNav = {
  background: "rgba(255,255,255,.5)",
  /** Solid fallback where backdrop-filter is unsupported (keeps the bar legible). */
  fallbackBg: "rgba(255,255,255,.9)",
  backdropFilter: "blur(28px) saturate(1.9)",
  border: "1px solid rgba(255,255,255,.75)",
  boxShadow: "0 10px 32px rgba(20,22,28,.18), inset 0 1px 1px rgba(255,255,255,.6)",
  radius: 31,
  height: 62,
} as const;

/** Glass Yulia FAB material (m4 §1e). */
const glassFab = {
  background: "rgba(255,255,255,.42)",
  fallbackBg: "rgba(255,255,255,.92)",
  backdropFilter: "blur(22px) saturate(1.9)",
  border: "1px solid rgba(255,255,255,.78)",
  boxShadow: "0 10px 28px rgba(20,22,28,.22), inset 0 1px 1px rgba(255,255,255,.7)",
  size: 56,
} as const;

/** Glass bottom-sheet material (frame 08 — m4 §2). Scrim + grab-handle + the
 *  translucent sheet fill. Mobile-only. */
const glassSheet = {
  background: "rgba(255,255,255,.86)",
  fallbackBg: "rgba(255,255,255,.96)",
  backdropFilter: "blur(30px) saturate(1.8)",
  radius: "30px 30px 0 0",
  boxShadow: "0 -10px 34px rgba(0,0,0,.18)",
  scrim: "rgba(15,17,22,.38)",
  handle: { width: 40, height: 5, radius: 3, color: "#cdd5df" },
} as const;

export const M = {
  /** The mobile app-shell background wash (desktop uses flat `T.page`). Applied
   *  to the app root, never to a fixed child (Safari toolbar rule). */
  frameBg: "linear-gradient(165deg,#ffffff 0%,#f7faff 46%,#eef2fe 78%,#e9e8f6 100%)",
  /** Studio (frame 10) uses a slightly different wash; kept here so that screen
   *  can opt into it without re-deriving. */
  frameBgStudio: "linear-gradient(165deg,#ffffff,#f3f6fc 60%,#e7ebf7 100%)",
  /** Ask-Yulia / chat surfaces use a solid field (frame 02). */
  chatField: "#fff",
  glassNav,
  glassFab,
  glassSheet,
  /** Mobile neutral — sheet handle / toggle-off greys (≈ T.inputBd). */
  neutralLine: "#cdd5df",
} as const;

export type MobileTokens = typeof M;
