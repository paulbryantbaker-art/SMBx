/**
 * MobileHeader — the two Atlas-mobile header variants (m4 §1b).
 *
 *   Variant A ("top bar"): page title + search + avatar — NO app wordmark. The
 *     Cash App pattern: the bar names the PAGE you're on (Today / Deals), not the
 *     app. Used on the bottom-nav destinations. flex:none band so it stays put
 *     while the rest scrolls; safe-area top-padded.
 *   Variant B ("detail/section" back bar): BackIcon + optional MarkBadge + title
 *     + optional right slot. Pure detail screens (no badge/right) CENTER the title
 *     like Cash App; deal screens (badge + right action) stay left-aligned.
 *
 * Reuses the desktop Atlas foundation (BackIcon, SearchIcon, Avatar, MarkBadge);
 * text colors come from the redesign RT scale so the bar matches the neutral page.
 */
import type { CSSProperties, ReactNode } from "react";
import { T } from "../desktop/atlasTokens";
import { RT } from "./redesign/rt";
import { BackIcon, SearchIcon } from "../desktop/icons";
import { Sparkle, Avatar, MarkBadge } from "../desktop/primitives";

/* ─── Variant A — top bar: page title + search + avatar ─────── */

/** A bottom-nav destination (Today, Deals) gets a titled top bar — the title
 *  names the PAGE, not the app (no "Atlas" wordmark). Search + avatar sit right. */
export function MobileTabHeader({
  title,
  initials,
  onAvatar,
  onSearch,
}: {
  title: string;
  initials: string;
  onAvatar?: () => void;
  onSearch?: () => void;
}) {
  return (
    <div style={S.homeRow}>
      <span style={S.tabTitle}>{title}</span>
      <div style={S.topRight}>
        {onSearch && (
          <button type="button" aria-label="Search" onClick={onSearch} style={S.iconBtn}>
            <SearchIcon size={20} c={RT.ink} />
          </button>
        )}
        <button type="button" aria-label="Account" onClick={onAvatar} style={S.avatarBtn}>
          <Avatar initials={initials} size={34} gradient />
        </button>
      </div>
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
  // Pure detail screens (no deal badge, no chat sparkle, no right action) center
  // the title like Cash App; a trailing 40px cell balances the back button.
  const centered = !badge && !showSparkle && !right;
  return (
    <header style={solid ? { ...S.backBar, ...S.backBarSolid } : S.backBar}>
      <button type="button" aria-label="Back" onClick={onBack} style={S.backBtn}>
        <BackIcon size={22} c={RT.ink} />
      </button>
      {badge && (
        <MarkBadge letter={badge.letter} bg={badge.bg} fg={badge.fg} size={28} radius={8} />
      )}
      {showSparkle && <Sparkle size={18} />}
      <span style={centered ? S.backTitleCentered : S.backTitle}>{title}</span>
      {centered ? (
        <span style={{ width: 40, flex: "none" }} aria-hidden="true" />
      ) : (
        <>
          <span style={{ flex: 1, minWidth: 8 }} />
          {right}
        </>
      )}
    </header>
  );
}

const S: Record<string, CSSProperties> = {
  /* Variant A — top bar */
  homeRow: {
    flex: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 18px 0",
    paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)",
  },
  tabTitle: { fontSize: 24, fontWeight: 700, color: RT.ink, letterSpacing: "-.02em" },
  topRight: { display: "flex", alignItems: "center", gap: 10 },
  iconBtn: {
    width: 38,
    height: 38,
    flex: "none",
    border: `1px solid ${RT.line}`,
    background: "#fff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  },
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
    color: RT.ink,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  backTitleCentered: {
    flex: 1,
    minWidth: 0,
    textAlign: "center",
    fontSize: 17,
    fontWeight: 600,
    color: RT.ink,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
};
