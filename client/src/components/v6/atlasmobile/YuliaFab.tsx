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
import { M } from "./mobileTokens";
import { Sparkle } from "../desktop/primitives";

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
          ? "calc(env(safe-area-inset-bottom, 0px) + 94px)" // clears the 62px bar + 16px gap + breathing room
          : "calc(env(safe-area-inset-bottom, 0px) + 18px)",
      }}
    >
      <Sparkle size={26} />
    </button>
  );
}

const S: Record<string, CSSProperties> = {
  fab: {
    position: "fixed", // own viewport-fixed FAB — NOT inside a full-viewport fixed layer (which would block iOS chrome collapse)
    right: 18,
    width: M.glassFab.size,
    height: M.glassFab.size,
    borderRadius: "50%",
    background: M.glassFab.background,
    backdropFilter: M.glassFab.backdropFilter,
    WebkitBackdropFilter: M.glassFab.backdropFilter,
    border: M.glassFab.border,
    boxShadow: M.glassFab.boxShadow,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 5,
    WebkitTapHighlightColor: "transparent",
  },
};
