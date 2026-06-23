/**
 * MobileHeader — the two Atlas-mobile header variants (m4 §1b).
 *
 *   Variant A ("home"): ✦ Atlas wordmark + avatar. Used on Today. It sits at the
 *     top of the page; in this shell the Today screen renders inside the scroll
 *     area, but the brand row is a flex:none band so it stays put while the rest
 *     scrolls. Top-padded with the safe-area inset.
 *   Variant B ("detail/section" back bar): BackIcon + optional MarkBadge + title
 *     + optional right slot. flex:none, border-bottom T.railDiv. Used on every
 *     detail/section screen (Ask Yulia, Cockpit, Files, Sourcing, Studio,
 *     Integration, Agent, Settings).
 *
 * Reuses the desktop Atlas foundation: T tokens, BackIcon, Sparkle, Avatar,
 * MarkBadge. No new design language.
 */
import type { CSSProperties, ReactNode } from "react";
import { T } from "../desktop/atlasTokens";
import { BackIcon } from "../desktop/icons";
import { Sparkle, Avatar, MarkBadge } from "../desktop/primitives";

/* ─── Variant A — home header ──────────────────────────────── */

export function MobileHomeHeader({
  initials,
  onAvatar,
}: {
  initials: string;
  onAvatar?: () => void;
}) {
  return (
    <div style={S.homeRow}>
      <div style={S.brandLeft}>
        <Sparkle size={21} />
        <span style={S.brandWord}>Atlas</span>
      </div>
      <button
        type="button"
        aria-label="Account"
        onClick={onAvatar}
        style={S.avatarBtn}
      >
        <Avatar initials={initials} size={34} gradient />
      </button>
    </div>
  );
}

/* ─── Variant B — detail / section back bar ────────────────── */

export function MobileBackHeader({
  title,
  onBack,
  badge,
  right,
  showSparkle = false,
  solid = false,
}: {
  title: string;
  onBack: () => void;
  /** Optional deal-initial chip shown before the title (cockpit / files). */
  badge?: { letter: string; bg?: string; fg?: string };
  /** Optional right-side action slot (a Pill, a text action, etc.). */
  right?: ReactNode;
  /** Chat surfaces (Ask Yulia) show the ✦ + "Yulia" lockup before the title. */
  showSparkle?: boolean;
  /** Solid white bar (+ divider) for white-field surfaces like the chat, so the
   *  header matches the field instead of revealing the shell's top glow. Content
   *  screens leave this false → transparent header over the glow. */
  solid?: boolean;
}) {
  return (
    <header style={solid ? { ...S.backBar, ...S.backBarSolid } : S.backBar}>
      <button type="button" aria-label="Back" onClick={onBack} style={S.backBtn}>
        <BackIcon size={22} c={T.ink} />
      </button>
      {badge && (
        <MarkBadge letter={badge.letter} bg={badge.bg} fg={badge.fg} size={28} radius={8} />
      )}
      {showSparkle && <Sparkle size={18} />}
      <span style={S.backTitle}>{title}</span>
      <span style={{ flex: 1, minWidth: 8 }} />
      {right}
    </header>
  );
}

const S: Record<string, CSSProperties> = {
  /* Variant A */
  homeRow: {
    flex: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 18px 0",
    paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)",
  },
  brandLeft: { display: "flex", alignItems: "center", gap: 8 },
  brandWord: { fontSize: 18, fontWeight: 600, color: T.ink, letterSpacing: "-.01em" },
  avatarBtn: {
    border: "none",
    background: "transparent",
    padding: 5, // bump the 34px avatar's hit area toward ≥44px
    margin: -5,
    cursor: "pointer",
    borderRadius: "50%",
    display: "flex",
    WebkitTapHighlightColor: "transparent",
  },

  /* Variant B */
  backBar: {
    flex: "none",
    minHeight: 52,
    display: "flex",
    alignItems: "center",
    gap: 11,
    padding: "0 14px",
    paddingTop: "calc(env(safe-area-inset-top, 0px) + 4px)",
    paddingBottom: 4,
    // Transparent + borderless so the shell's top glow shows behind the back bar
    // on every screen (matches the Today home header). The bar scrolls away with
    // the page (body-scroll), so it needs no opaque fill or divider.
    background: "transparent",
  },
  // White-field surfaces (chat) opt in: solid bar + divider so it reads as one
  // surface with the white chat below instead of a violet strip over white.
  backBarSolid: {
    background: T.white,
    borderBottom: `1px solid ${T.railDiv}`,
  },
  backBtn: {
    width: 40,
    height: 40,
    marginLeft: -8,
    flex: "none",
    border: "none",
    background: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    borderRadius: "50%",
    WebkitTapHighlightColor: "transparent",
  },
  backTitle: {
    fontSize: 17,
    fontWeight: 600,
    color: T.ink,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
};
