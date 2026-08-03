/**
 * YuliaFab — the glass Yulia button (m4 §1e). Appears on screens without an
 * inline composer (Pipeline, Cockpit, Sourcing) and opens the quick-chat
 * bottom-sheet. A small round glass button, NOT a full-viewport fixed bg div
 * (Safari toolbar rule).
 *
 * `aboveNav` lifts it above the floating tab bar (Pipeline, which has the nav);
 * without it the FAB sits at the same bottom inset the nav would occupy
 * (Cockpit / Sourcing, which have no nav).
 */
import type { CSSProperties } from "react";
import { RT } from "./redesign/rt";
import { rgba, LEDGER } from "../../../../../house/tokens";

export function YuliaFab({
  onOpen,
  aboveNav = false,
}: {
  onOpen: () => void;
  aboveNav?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label="Ask Yulia"
      onClick={onOpen}
      style={{
        ...S.fab,
        bottom: aboveNav
          ? "calc(env(safe-area-inset-bottom, 0px) + 96px)" // clears the floating nav
          : "calc(env(safe-area-inset-bottom, 0px) + 20px)",
      }}
    >
      {/* white sparkle — Yulia's mark on the Deal Green primary FAB (the
          neon era wanted a dark glyph; Deal Green carries white at 5.3:1) */}
      <svg width="26" height="26" viewBox="0 0 24 24" fill={RT.onAccent} aria-hidden="true">
        <path d="M12 2c.4 4.6 2.4 6.6 7 7-4.6.4-6.6 2.4-7 7-.4-4.6-2.4-6.6-7-7 4.6-.4 6.6-2.4 7-7z" />
      </svg>
    </button>
  );
}

const S: Record<string, CSSProperties> = {
  // Redesign: the brand-green PRIMARY action (green fill, dark symbol — green is
  // a fill, not a light glyph). A small bottom-anchored fixed button (Safari rule).
  fab: {
    position: "fixed",
    right: 18,
    width: 58,
    height: 58,
    borderRadius: "50%",
    background: RT.accent,
    border: "none",
    boxShadow: `0 10px 26px ${rgba(LEDGER.green, 0.38)}, 0 2px 6px ${rgba(LEDGER.ink, 0.16)}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 5,
    WebkitTapHighlightColor: "transparent",
  },
};
