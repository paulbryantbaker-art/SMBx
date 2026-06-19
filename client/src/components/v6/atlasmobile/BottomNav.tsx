/**
 * BottomNav — the floating liquid-glass tab bar (m4 §1d), the signature
 * Atlas-mobile element. Five tabs: Today / Pipeline / Deals / Files / More.
 *
 * It is a SMALL inset rounded bar (position:absolute, left/right:16, bottom
 * calc(safe-area+16)) — NOT a full-viewport fixed bg div, so the Safari toolbar
 * rule is satisfied (it sits inside the app root which is position:relative).
 *
 * Active item = T.blue, inactive = T.faint; the icons inherit via
 * stroke/fill currentColor. Drives nav.go(...) for the four real screens; More
 * is a shell-level overlay flag handled by AtlasMobileApp.
 */
import type { CSSProperties, ReactNode } from "react";
import { T } from "../desktop/atlasTokens";
import { M } from "./mobileTokens";
import {
  HomeIcon,
  PipelineBarsIcon,
  DealsListIcon,
  FolderIcon,
  MoreDotsIcon,
} from "../desktop/icons";
import type { AtlasScreen } from "../desktop/atlasNav";

export type BottomTab = "today" | "pipeline" | "deals" | "files" | "more";

const ITEMS: { id: BottomTab; label: string; icon: (c: string) => ReactNode }[] = [
  { id: "today", label: "Today", icon: (c) => <HomeIcon size={22} c={c} /> },
  { id: "pipeline", label: "Pipeline", icon: (c) => <PipelineBarsIcon size={22} c={c} /> },
  { id: "deals", label: "Deals", icon: (c) => <DealsListIcon size={22} c={c} /> },
  { id: "files", label: "Files", icon: (c) => <FolderIcon size={22} c={c} /> },
  { id: "more", label: "More", icon: (c) => <MoreDotsIcon size={22} c={c} /> },
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
        const color = isActive ? T.blue : T.faint;
        return (
          <button
            key={it.id}
            type="button"
            aria-label={it.label}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onTab(it.id)}
            style={{ ...S.item, color }}
          >
            {it.icon(color)}
            <span style={{ ...S.label, fontWeight: isActive ? 600 : 400 }}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/** The four bottom tabs that map onto an AtlasScreen (More is a shell overlay,
 *  not an AtlasScreen). Exported so the shell can derive the active tab. */
export function bottomTabForScreen(screen: AtlasScreen): BottomTab | null {
  switch (screen) {
    case "today":
      return "today";
    case "pipeline":
      return "pipeline";
    case "deals":
      return "deals";
    case "files":
      return "files";
    default:
      return null;
  }
}

const S: Record<string, CSSProperties> = {
  bar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
    height: M.glassNav.height,
    borderRadius: M.glassNav.radius,
    background: M.glassNav.background,
    backdropFilter: M.glassNav.backdropFilter,
    WebkitBackdropFilter: M.glassNav.backdropFilter,
    border: M.glassNav.border,
    boxShadow: M.glassNav.boxShadow,
    display: "flex",
    alignItems: "center",
    padding: "0 6px",
    zIndex: 5,
  },
  item: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontFamily: T.font,
    WebkitTapHighlightColor: "transparent",
  },
  label: { fontSize: 10, lineHeight: 1 },
};
