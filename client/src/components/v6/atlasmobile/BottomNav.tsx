/**
 * BottomNav — the floating liquid-glass tab bar (m4 §1d), the signature
 * Atlas-mobile element. Four tabs: Today / Deals / Yulia / Sourcing. Yulia (the
 * ✦ chat) is the product's core action and lives in the bar; Files moved into
 * each deal's cockpit (per-deal data room) and the old "More" menu now opens
 * from the home user icon.
 *
 * It is a SMALL inset rounded bar (position:fixed bottom, left/right:14) — NOT a
 * full-viewport fixed bg div, so the Safari toolbar rule is satisfied.
 *
 * Active item = T.blue, inactive = a readable mid-grey; the icons inherit via
 * stroke/fill currentColor (Yulia uses the gradient Sparkle, always lit). Today/
 * Deals/Sourcing drive nav.go(...); Yulia opens the chat (handled by the shell).
 */
import type { CSSProperties, ReactNode } from "react";
import { T } from "../desktop/atlasTokens";
import { M } from "./mobileTokens";
import { HomeIcon, DealsListIcon, SourcingIcon } from "../desktop/icons";
import { Sparkle } from "../desktop/primitives";
import type { AtlasScreen } from "../desktop/atlasNav";

export type BottomTab = "today" | "deals" | "yulia" | "sourcing";

const ICON = 26;

const ITEMS: { id: BottomTab; label: string; icon: (c: string) => ReactNode }[] = [
  { id: "today", label: "Today", icon: (c) => <HomeIcon size={ICON} c={c} /> },
  { id: "deals", label: "Deals", icon: (c) => <DealsListIcon size={ICON} c={c} /> },
  // Yulia = the chat action. The Sparkle is a fixed gradient (ignores `c`), so it
  // always reads as lit/colorful — the bar's most prominent affordance.
  { id: "yulia", label: "Yulia", icon: () => <Sparkle size={ICON} /> },
  { id: "sourcing", label: "Sourcing", icon: (c) => <SourcingIcon size={ICON} c={c} /> },
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
    case "files": // files is a per-deal surface now → highlight Deals
      return "deals";
    case "sourcing":
      return "sourcing";
    default:
      return null;
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
