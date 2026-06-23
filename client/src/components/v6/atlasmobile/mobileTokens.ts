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
  // More translucent so content REFRACTS through (true iOS liquid glass, not a
  // flat white pill). Legibility is preserved by the dark nav labels on top.
  background: "rgba(255,255,255,.46)",
  /** Solid fallback where backdrop-filter is unsupported (keeps the bar legible). */
  fallbackBg: "rgba(255,255,255,.92)",
  // Lighter frost + higher saturation = content visibly slides behind the glass;
  // the hairline edge + bright top inner highlight give the lit-pane read.
  backdropFilter: "blur(28px) saturate(2)",
  border: "1px solid rgba(255,255,255,.7)",
  boxShadow:
    "0 8px 30px rgba(20,22,28,.16), 0 1px 2px rgba(20,22,28,.08), inset 0 1px 1.5px rgba(255,255,255,.85), inset 0 -1px 1px rgba(20,22,28,.05)",
  /** Selected-tab capsule highlight behind the active icon+label (the iOS
   *  liquid-glass tab-bar treatment), tinted to the Atlas accent. */
  activeBg: "rgba(11,87,208,.13)",
  radius: 31,
  height: 62,
} as const;

/** Glass Yulia FAB material (m4 §1e) — same lit-glass treatment as the nav. */
const glassFab = {
  background: "rgba(255,255,255,.46)",
  fallbackBg: "rgba(255,255,255,.94)",
  backdropFilter: "blur(24px) saturate(2)",
  border: "1px solid rgba(255,255,255,.72)",
  boxShadow:
    "0 10px 28px rgba(20,22,28,.20), 0 1px 2px rgba(20,22,28,.10), inset 0 1px 1.5px rgba(255,255,255,.85)",
  size: 56,
} as const;

/** Glass bottom-sheet material (frame 08 — m4 §2). Scrim + grab-handle + the
 *  translucent sheet fill. Mobile-only. */
const glassSheet = {
  background: "rgba(255,255,255,.82)",
  fallbackBg: "rgba(255,255,255,.97)",
  backdropFilter: "blur(36px) saturate(1.8)",
  radius: "30px 30px 0 0",
  boxShadow:
    "0 -10px 34px rgba(0,0,0,.18), inset 0 1px 1.5px rgba(255,255,255,.9)",
  scrim: "rgba(15,17,22,.4)",
  handle: { width: 40, height: 5, radius: 3, color: "#cdd5df" },
} as const;

export const M = {
  /** The mobile app-shell background wash, applied to EVERY screen's root (never
   *  a fixed child — Safari toolbar rule). Two layers: a top-anchored blue→violet
   *  glow (the "purple gradient" that used to live only on Today, now on all
   *  pages) over a light lavender base. The glow is px-anchored near the top so it
   *  sits behind the header/hero on every screen and scrolls away with the page;
   *  the base stays light so cards/text keep strong contrast (white cards pop
   *  harder against the violet than against the old near-white wash). */
  frameBg:
    "radial-gradient(900px 520px at 50% -40px, rgba(139,110,214,.30) 0%, rgba(96,128,232,.16) 46%, rgba(255,255,255,0) 72%)," +
    "linear-gradient(180deg,#f6f4fc 0%,#f2f3fb 48%,#ecedf7 100%)",
  /** Studio shares the same wash now (kept as an alias so callers don't break). */
  frameBgStudio:
    "radial-gradient(900px 520px at 50% -40px, rgba(139,110,214,.30) 0%, rgba(96,128,232,.16) 46%, rgba(255,255,255,0) 72%)," +
    "linear-gradient(180deg,#f6f4fc 0%,#f2f3fb 48%,#ecedf7 100%)",
  /** Ask-Yulia / chat surfaces use a solid field (frame 02). */
  chatField: "#fff",
  glassNav,
  glassFab,
  glassSheet,
  /** Mobile neutral — sheet handle / toggle-off greys (≈ T.inputBd). */
  neutralLine: "#cdd5df",
} as const;

export type MobileTokens = typeof M;
