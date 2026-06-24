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
  // Redesign: a clean SOLID white floating pill (no glass) — the only place a
  // soft shadow is allowed (floating chrome needs lift off the grey page).
  background: "#ffffff",
  fallbackBg: "#ffffff",
  backdropFilter: "none",
  border: "1px solid rgba(40,42,80,.06)",
  boxShadow: "0 8px 26px rgba(30,32,70,.14), 0 1px 3px rgba(30,32,70,.08)",
  /** Selected-tab capsule — the violet accent, soft tint. */
  activeBg: "#ece9fb",
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
  // Redesign: a flat WARM OFF-WHITE page (RT.page / marketing --bg). Separation
  // is by TONE — white elements read as raised on the warm off-white, no gradient.
  frameBg: "#FBFAF6",
  /** Studio shares the same page (kept as an alias so callers don't break). */
  frameBgStudio: "#FBFAF6",
  /** Ask-Yulia / chat surfaces use a solid field (frame 02). */
  chatField: "#fff",
  glassNav,
  glassFab,
  glassSheet,
  /** Mobile neutral — sheet handle / toggle-off greys (≈ T.inputBd). */
  neutralLine: "#cdd5df",
} as const;

export type MobileTokens = typeof M;
