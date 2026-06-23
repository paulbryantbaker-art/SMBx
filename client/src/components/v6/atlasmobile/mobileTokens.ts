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
  // Frosted, but predominantly a bright material so the bar reads as a clear,
  // floating panel against the busy purple wash (it was too translucent at .46 —
  // it disappeared into the gradient). Apple's tab bars are heavily frosted, not
  // see-through; the blur + saturate still let content hint through the edges.
  background: "rgba(255,255,255,.82)",
  /** Solid fallback where backdrop-filter is unsupported (keeps the bar legible). */
  fallbackBg: "rgba(255,255,255,.95)",
  backdropFilter: "blur(26px) saturate(1.9)",
  // A real edge: a soft dark hairline (visible on light bg, unlike a white one)
  // plus the bright inner top highlight for the lit-glass read.
  border: "1px solid rgba(40,42,80,.10)",
  boxShadow:
    "0 12px 34px rgba(30,32,70,.22), 0 2px 8px rgba(30,32,70,.12), inset 0 1px 1.5px rgba(255,255,255,.95), inset 0 -1px 1px rgba(20,22,28,.05)",
  /** Selected-tab capsule highlight behind the active icon+label (the iOS
   *  liquid-glass tab-bar treatment), tinted to the Atlas accent. */
  activeBg: "rgba(11,87,208,.15)",
  radius: 30,
  height: 68,
} as const;

/** Glass Yulia FAB material (m4 §1e) — same lit-glass treatment as the nav. */
const glassFab = {
  background: "rgba(255,255,255,.82)",
  fallbackBg: "rgba(255,255,255,.96)",
  backdropFilter: "blur(24px) saturate(1.9)",
  border: "1px solid rgba(40,42,80,.10)",
  boxShadow:
    "0 12px 30px rgba(30,32,70,.24), 0 2px 6px rgba(30,32,70,.12), inset 0 1px 1.5px rgba(255,255,255,.95)",
  size: 58,
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
