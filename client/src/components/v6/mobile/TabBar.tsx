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
      <GlassSurface tint="chrome" radius={999} style={B.capsule}>
        {TABS.map(t => {
          const isActive = active === t.id;
          const c = isActive ? "var(--mb-accent-ink)" : "var(--mb-ink-3)";
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
    position: "absolute",
    bottom: 18,
    left: 12,
    right: 12,
    display: "flex",
    alignItems: "center",
    gap: 10,
    zIndex: 40,
    pointerEvents: "auto",
    touchAction: "manipulation",
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
    background: "var(--mb-accent-ink)",
    border: "none",
    boxShadow: "0 10px 28px -6px rgba(46,92,138,0.45), inset 0 0 0 0.5px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    cursor: "pointer",
    flexShrink: 0,
  },
};
