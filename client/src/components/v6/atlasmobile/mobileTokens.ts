/**
 * Atlas-mobile token block. Everything that already exists in the desktop Atlas
 * design system is reused from `../desktop/atlasTokens` (`T`) — this file holds
 * ONLY the mobile-only values that have no desktop equivalent: the three glass
 * materials (nav / FAB / bottom-sheet), the frame-background wash, and a couple
 * of mobile neutrals.
 *
 * Law: never re-derive a desktop token here. If a color resolves to a `T`
 * token, import `T` and use it — only the liquid-glass materials + the frame
 * gradient are genuinely new.
 *
 * AURORA SKIN (2026-08-02, with atlasTokens.ts — see its header for the full
 * mapping and the laws that travelled): the violet Cash-App-era accents move
 * to Deal Green via `house/tokens.ts`, and the frame goes from neutral grey
 * to the warm bone family. The earlier "neutral, not warm — closer to Cash
 * App" note is superseded by Paul's direction: Cash App's GRAMMAR (tone
 * separation, floating white chrome, card-first), Aurora's PALETTE.
 */
import { LEDGER, rgba } from '../../../../../house/tokens';

/** Liquid-glass tab-bar material (m4 §1d). A small inset rounded bar — NOT a
 *  full-viewport fixed bg div (Safari toolbar rule). The `fallbackBg` is the
 *  higher-opacity solid for browsers without backdrop-filter support. */
const glassNav = {
  // A clean SOLID white floating pill (no glass) — the only place a soft
  // shadow is allowed (floating chrome needs lift off the page). Shadow and
  // border are warm-ink now, not the violet-tinted originals.
  background: "#ffffff",
  fallbackBg: "#ffffff",
  backdropFilter: "none",
  border: `1px solid ${rgba(LEDGER.ink, 0.07)}`,
  boxShadow: `0 8px 26px ${rgba(LEDGER.ink, 0.12)}, 0 1px 3px ${rgba(LEDGER.ink, 0.07)}`,
  /** Selected-tab capsule — the brand accent's tint (was the violet tint). */
  activeBg: LEDGER.greenTint,
  radius: 30,
  height: 68,
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
  // Warm-neutral handle (was cool #cdd5df) — sits on the white sheet, one
  // step lighter than LEDGER.rule.
  handle: { width: 40, height: 5, radius: 3, color: "#D6D0C4" },
} as const;

export const M = {
  /** The mobile app-shell background, applied to EVERY screen's root (never
   *  a fixed child — Safari toolbar rule). Flat warm page — the bone↔well
   *  midpoint, matching T.page (the well itself read "a little too dark",
   *  Paul, first deploy). Separation is by TONE — white cards and the
   *  floating nav read as raised on it, the Cash App way — but the tone is
   *  Aurora's bone family, not the old neutral grey. */
  frameBg: "#F9F6F0",
  glassNav,
  glassSheet,
} as const;

export type MobileTokens = typeof M;
