/**
 * BottomNav — the floating dock, the signature Atlas-mobile element.
 *
 * Cash App language: a SMALL, centered, form-fitting pill that hugs its buttons
 * (NOT a full-width bar). Three round pill buttons inside the pill dock — the two
 * content tabs (Today / Deals) + Yulia (the chat action, the violet accent). The
 * active tab gets a soft-violet pill behind it (a true pill, NOT a rounded
 * square); Yulia is a solid-violet pill so it reads as the one accent action.
 *
 * Because Yulia lives in the dock here, the separate FAB only appears on screens
 * that have NO dock (detail/hub) — one Yulia affordance per screen, never two.
 *
 * It is a SMALL inset element (position:fixed bottom, centered) — NOT a
 * full-viewport fixed bg div, so the Safari toolbar / chrome-collapse rule holds.
 */
import type { CSSProperties, ReactNode } from "react";
import { HomeIcon, DealsListIcon } from "../desktop/icons";
import type { AtlasScreen } from "../desktop/atlasNav";

// Two content tabs. Yulia is the chat action (opens the slide-up sheet), not a
// destination, so it's rendered separately — not part of the tab union.
export type BottomTab = "today" | "deals";

const ICON = 25;

const TABS: { id: BottomTab; label: string; icon: (c: string) => ReactNode }[] = [
  { id: "today", label: "Today", icon: (c) => <HomeIcon size={ICON} c={c} /> },
  { id: "deals", label: "Deals", icon: (c) => <DealsListIcon size={ICON} c={c} /> },
];

const ACCENT = "#5b53d6";
const ACCENT_SOFT = "#ece9fb";
const INACTIVE = "#6c6b66";

export function BottomNav({
  active,
  onTab,
  onYulia,
}: {
  active: BottomTab;
  onTab: (tab: BottomTab) => void;
  /** Opens the Yulia slide-up sheet — the chat action lives in the dock now. */
  onYulia: () => void;
}) {
  return (
    <nav style={S.bar} aria-label="Primary">
      {TABS.map((it) => {
        const isActive = it.id === active;
        return (
          <button
            key={it.id}
            type="button"
            aria-label={it.label}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onTab(it.id)}
            style={{ ...S.btn, background: isActive ? ACCENT_SOFT : "transparent" }}
          >
            {it.icon(isActive ? ACCENT : INACTIVE)}
          </button>
        );
      })}
      {/* Yulia — the chat action, integrated into the dock as the violet accent. */}
      <button type="button" aria-label="Ask Yulia" onClick={onYulia} style={{ ...S.btn, ...S.yulia }}>
        <svg width={ICON} height={ICON} viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
          <path d="M12 2c.4 4.6 2.4 6.6 7 7-4.6.4-6.6 2.4-7 7-.4-4.6-2.4-6.6-7-7 4.6-.4 6.6-2.4 7-7z" />
        </svg>
      </button>
    </nav>
  );
}

/** Today / Deals + the deal-detail surfaces highlight a tab; everything else
 *  (sourcing/studio/agent/integration/settings) lives in the avatar hub. */
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
      return null;
  }
}

const S: Record<string, CSSProperties> = {
  // Centered, content-hugging pill (form-fitting) — a small bottom-anchored fixed
  // element (Safari rule), NOT a full-width bar.
  bar: {
    position: "fixed",
    left: "50%",
    transform: "translateX(-50%)",
    bottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: 6,
    borderRadius: 999,
    background: "#ffffff",
    boxShadow: "0 10px 30px rgba(30,32,70,.18), 0 1px 3px rgba(30,32,70,.10)",
    zIndex: 5,
  },
  // Each button is a horizontal PILL (stadium — wider than tall, fully rounded),
  // like Cash App's dock lozenges. NOT a circle, NOT a rounded square. The active
  // tab + Yulia carry the fill; inactive tabs are bare icons (per the reference).
  btn: {
    width: 66,
    height: 46,
    flex: "none",
    borderRadius: 999,
    border: "none",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    background: "transparent",
    transition: "background .18s ease",
    WebkitTapHighlightColor: "transparent",
  },
  yulia: {
    background: ACCENT,
    boxShadow: "0 4px 12px rgba(91,83,214,.35)",
  },
};
