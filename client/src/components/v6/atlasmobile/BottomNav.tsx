/**
 * BottomNav — the floating bottom tab bar, the signature Atlas-mobile element.
 * Redesign: just TWO content tabs (Today / Deals). Yulia is the universal violet
 * FAB → slide-up sheet (which also carries jump-to nav); Sourcing/Studio/Agent/
 * Integration/Settings live in the avatar menu hub; per-deal surfaces live in the
 * deal.
 *
 * It is a SMALL inset rounded white pill (position:fixed bottom, left/right:14) —
 * NOT a full-viewport fixed bg div, so the Safari toolbar rule is satisfied.
 *
 * Active item = the one violet accent (#5b53d6) with a soft-tinted lozenge,
 * inactive = a readable mid-grey; icons inherit via stroke/fill currentColor.
 */
import type { CSSProperties, ReactNode } from "react";
import { T } from "../desktop/atlasTokens";
import { M } from "./mobileTokens";
import { HomeIcon, DealsListIcon } from "../desktop/icons";
import type { AtlasScreen } from "../desktop/atlasNav";

// Redesign: just two content tabs. Yulia is the universal FAB → slide-up sheet
// (it also carries jump-to nav); Sourcing/Studio/etc. live in the avatar hub.
export type BottomTab = "today" | "deals";

const ICON = 26;

const ITEMS: { id: BottomTab; label: string; icon: (c: string) => ReactNode }[] = [
  { id: "today", label: "Today", icon: (c) => <HomeIcon size={ICON} c={c} /> },
  { id: "deals", label: "Deals", icon: (c) => <DealsListIcon size={ICON} c={c} /> },
];

export function BottomNav({
  active,
  onTab,
}: {
  active: BottomTab;
  /** The four real screens go through nav.go; 'more' toggles the More overlay. */
  onTab: (tab: BottomTab) => void;
}) {
  return (
    <nav style={S.bar} aria-label="Primary">
      {ITEMS.map((it) => {
        const isActive = it.id === active;
        // Redesign: the one violet accent for active; readable mid-grey inactive.
        const color = isActive ? "#5b53d6" : "#6c6b66";
        return (
          <button
            key={it.id}
            type="button"
            aria-label={it.label}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onTab(it.id)}
            style={S.item}
          >
            {/* inner capsule — the selected tab gets a tinted lozenge behind the
                icon+label (iOS liquid-glass tab-bar treatment). */}
            <span
              style={{
                ...S.cap,
                color,
                background: isActive ? M.glassNav.activeBg : "transparent",
              }}
            >
              {it.icon(color)}
              <span style={{ ...S.label, fontWeight: isActive ? 700 : 500 }}>{it.label}</span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}

/** The four bottom tabs that map onto an AtlasScreen (More is a shell overlay,
 *  not an AtlasScreen). Exported so the shell can derive the active tab. The
 *  retired "pipeline" alias and the deal-detail surfaces (cockpit) highlight
 *  Deals — the funnel now lives in the Deals Board toggle. */
export function bottomTabForScreen(screen: AtlasScreen): BottomTab | null {
  switch (screen) {
    case "today":
      return "today";
    case "deals":
    case "pipeline":
    case "cockpit":
    case "files": // per-deal surfaces highlight Deals
    case "canvas":
      return "deals";
    default:
      return null; // sourcing/studio/agent/integration/settings live in the hub
  }
}

const S: Record<string, CSSProperties> = {
  bar: {
    position: "fixed", // own viewport-fixed bottom bar — NOT inside a full-viewport fixed layer (which would block iOS chrome collapse)
    left: 14,
    right: 14,
    bottom: "calc(env(safe-area-inset-bottom, 0px) + 14px)",
    height: M.glassNav.height,
    borderRadius: M.glassNav.radius,
    background: M.glassNav.background,
    backdropFilter: M.glassNav.backdropFilter,
    WebkitBackdropFilter: M.glassNav.backdropFilter,
    border: M.glassNav.border,
    boxShadow: M.glassNav.boxShadow,
    display: "flex",
    alignItems: "center",
    padding: "0 4px",
    zIndex: 5,
  },
  // Each tab fills its quarter of the bar AND its full height — a ~88×68 hit
  // area (was cramped with 5 tabs). The visible capsule is centered inside.
  item: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontFamily: T.font,
    WebkitTapHighlightColor: "transparent",
  },
  cap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    padding: "7px 16px",
    borderRadius: 18,
    transition: "background .2s ease",
  },
  label: { fontSize: 11.5, lineHeight: 1, letterSpacing: "-0.01em" },
};
