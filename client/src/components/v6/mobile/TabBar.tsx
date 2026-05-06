/* V6 Mobile — Floating Liquid Glass tab bar + adjacent chat FAB.
   Portaled to document.body to escape backdrop-filter containing-block hazards
   (per feedback_fixed_position_containing_block.md). Inside an installed PWA
   body is sized to --vvh so position:absolute bottom:18 anchors above the
   keyboard. In Safari browser, body uses initial containing block = viewport.

   The tab bar is the only component that switches active tab; everything
   above is read-only state. */

import { type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { GlassSurface } from "./glass";
import { MobileIcon } from "./icons";
import type { MobileTab } from "./types";

interface TabBarProps {
  active: MobileTab;
  onChange: (next: MobileTab) => void;
  onChat: () => void;
}

const TABS: { id: MobileTab; label: string; icon: "today" | "pipeline" | "brief" }[] = [
  { id: "today",    label: "Today",    icon: "today"    },
  { id: "pipeline", label: "Pipeline", icon: "pipeline" },
  { id: "brief",    label: "Brief",    icon: "brief"    },
];

export function TabBar({ active, onChange, onChat }: TabBarProps) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="tablist"
      aria-label="Mobile workspace tabs"
      className="mobile-root"
      style={B.wrap}
    >
      <GlassSurface
        tint="dark"
        radius={999}
        style={B.capsule}
      >
        {TABS.map(t => {
          const isActive = active === t.id;
          // Dark glass pill (iOS Music/Camera/Photos pattern) carries
          // its own contrast: white unselected, soft lavender action
          // color selected. Lavender is lighter + more violet-shifted
          // than the periwinkle brand accent — distinct enough to read
          // as "active" without clashing with the cool palette.
          const c = isActive ? "var(--mb-action)" : "#fff";
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={t.label}
              onClick={() => onChange(t.id)}
              style={{ ...B.tab, color: c }}
            >
              <MobileIcon name={t.icon} c={c} active={isActive} />
              <span style={B.tabLabel}>{t.label}</span>
            </button>
          );
        })}
      </GlassSurface>

      <button
        type="button"
        aria-label="Open chat with Yulia"
        onClick={onChat}
        style={B.fab}
      >
        <MobileIcon name="chat" c="#fff" size={22} />
      </button>
    </div>,
    document.body,
  );
}

const B: Record<string, CSSProperties> = {
  wrap: {
    // position:fixed (was absolute) so the pill stays anchored to the
    // viewport bottom regardless of whether body scrolls (Safari tab) or
    // is locked to --vvh (PWA standalone). With viewport-fit=cover +
    // interactive-widget=resizes-content in index.html, fixed bottom is
    // measured from the visible viewport edge — above the URL bar in
    // Safari, above the keyboard when open. safe-area-inset-bottom adds
    // home-indicator clearance in PWA (≈30px) and 0 in Safari tab.
    position: "fixed",
    bottom: "calc(18px + env(safe-area-inset-bottom, 0px))",
    /* Side insets bumped 12 → 20 so the floating pill sits inside the
       card-edge line on both sides. Was overhanging the cards by ~4px
       which read as the pill being "too big" rather than floating
       cleanly inside the content. */
    left: 20,
    right: 20,
    display: "flex",
    alignItems: "center",
    gap: 10,
    zIndex: 40,
    pointerEvents: "auto",
    touchAction: "manipulation",
    // Override the .mobile-root class's bg (var(--mb-bg) = #FFFFFF). The
    // class is applied here so children can read --mb-* CSS tokens, but
    // the side-effect white bg painted a full-width strip behind the
    // floating pill + FAB, defeating the Liquid Glass effect.
    background: "transparent",
  },
  capsule: {
    flex: 1,
    display: "flex",
    justifyContent: "space-around",
    padding: "8px 4px 10px",
  },
  tab: {
    flex: 1,
    background: "none",
    border: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    padding: "2px 0",
    cursor: "pointer",
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: 600,
    fontFamily: "var(--mb-font-body)",
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "var(--mb-action)",
    border: "none",
    boxShadow: "0 10px 28px -6px rgba(180,128,52,0.42), inset 0 0 0 0.5px rgba(255,255,255,0.28), inset 0 1px 0 rgba(255,255,255,0.24)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    cursor: "pointer",
    flexShrink: 0,
  },
};
