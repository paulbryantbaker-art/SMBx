/* V6 Mobile — TopBar variants.
   GlassTopBar = translucent sticky bar (mask-image bottom fade) for App Store
                 large-title pattern. The title in the bar is HIDDEN while the
                 LargeTitle is on-screen, then fades in once the user scrolls
                 past it — matching iOS App Store's collapse behavior.
   LargeTitle  = 34px display title that sits under the glass bar (visible on
                 scroll-top, collapses into bar title on scroll). Reports its
                 visibility via TitleCollapseContext so the bar can sync.
   TitleCollapseProvider = wraps the mobile shell once, holds the shared
                 collapsed flag. */

import {
  createContext, useContext, useEffect, useRef, useState,
  type CSSProperties, type ReactNode,
} from "react";
import { GlassSurface } from "./glass";
import { MobileIcon } from "./icons";

/* ─── Title-collapse context ──────────────────────────────── */

interface TitleCollapseValue {
  collapsed: boolean;
  setCollapsed: (b: boolean) => void;
}
const TitleCollapseContext = createContext<TitleCollapseValue>({
  collapsed: false,
  setCollapsed: () => {},
});

export function TitleCollapseProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <TitleCollapseContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </TitleCollapseContext.Provider>
  );
}

interface GlassTopBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: ReactNode;
  initials?: string;
  onAvatarClick?: () => void;
}

export function GlassTopBar({
  title,
  showBack,
  onBack,
  rightSlot,
  initials = "JM",
  onAvatarClick,
}: GlassTopBarProps) {
  const { collapsed } = useContext(TitleCollapseContext);
  return (
    <>
      {/* Spacer reserves only safe-area + a small gap. The LargeTitle starts
          right beneath it; the floating chrome (avatar + search) overlays the
          LargeTitle row on the right side, App-Store style. */}
      <div style={T.spacer} aria-hidden="true" />

      {/* Glass bar with title — fades in only when LargeTitle has scrolled
          out of view. At rest (scroll-top) this layer is fully transparent
          so it doesn't add visual mass at the top of the screen. */}
      <div
        style={{
          ...T.barWrap,
          opacity: collapsed ? 1 : 0,
          pointerEvents: collapsed ? "auto" : "none",
          transition: "opacity 180ms cubic-bezier(0.25, 1, 0.5, 1)",
        }}
        aria-hidden={!collapsed}
      >
        <GlassSurface tint="chrome" radius={0} style={T.bar}>
          {showBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              style={T.iconBtn}
            >
              <MobileIcon name="back" size={14} c="var(--mb-ink-1)" />
            </button>
          ) : <div style={{ width: 32 }} aria-hidden="true" />}

          <h1
            style={{
              ...T.title,
              transform: collapsed ? "translateY(0)" : "translateY(4px)",
              transition: "transform 180ms cubic-bezier(0.25, 1, 0.5, 1)",
            }}
          >{title}</h1>

          {/* Reserve the right gutter so the centered title stays centered
              against the always-visible floating chrome above. */}
          <div style={{ width: 80 }} aria-hidden="true" />
        </GlassSurface>
      </div>

      {/* Floating chrome — always visible, always at top-right. Sits above
          the glass bar layer so a single set of buttons handles both
          scroll-top and collapsed states. */}
      <div style={T.floatingChrome}>
        {rightSlot ?? (
          <>
            <button
              type="button"
              aria-label="Search"
              style={T.searchBtn}
            >
              <MobileIcon name="search" size={15} c="var(--mb-ink-1)" />
            </button>
            <button
              type="button"
              aria-label="Account"
              onClick={onAvatarClick}
              style={T.avatar}
            >{initials}</button>
          </>
        )}
      </div>
    </>
  );
}

interface LargeTitleProps {
  children: ReactNode;
}

export function LargeTitle({ children }: LargeTitleProps) {
  const ref = useRef<HTMLHeadingElement | null>(null);
  const { setCollapsed } = useContext(TitleCollapseContext);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    // Observe whether the LargeTitle is still visible in the viewport.
    // rootMargin's negative top accounts for the glass bar zone above —
    // once the title has scrolled fully under the bar, collapsed = true.
    const obs = new IntersectionObserver(
      ([entry]) => setCollapsed(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-56px 0px 0px 0px" },
    );
    obs.observe(el);
    // Reset to expanded when this LargeTitle mounts (new screen / tab).
    setCollapsed(false);
    return () => {
      obs.disconnect();
      // Leave collapsed false on unmount so the next screen starts clean.
      setCollapsed(false);
    };
  }, [setCollapsed]);

  return <h1 ref={ref} style={T.largeTitle}>{children}</h1>;
}

const T: Record<string, CSSProperties> = {
  spacer: {
    // Just safe-area inset — no chrome row. The LargeTitle below sits
    // directly under the safe area; the floating chrome overlays it
    // on the right (App Store pattern).
    height: "env(safe-area-inset-top, 44px)",
  },
  barWrap: {
    position: "fixed",
    top: 0, left: 0, right: 0,
    zIndex: 30,
    paddingTop: "env(safe-area-inset-top, 44px)",
  },
  bar: {
    padding: "8px 16px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 0,
    maskImage: "linear-gradient(to bottom, black 80%, transparent 100%)",
    WebkitMaskImage: "linear-gradient(to bottom, black 80%, transparent 100%)",
  },
  iconBtn: {
    width: 32, height: 32,
    background: "transparent", border: "none",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  title: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700,
    fontSize: 17, letterSpacing: "-0.3px", margin: 0,
    color: "var(--mb-ink)", textAlign: "center", flex: 1,
  },
  floatingChrome: {
    position: "fixed",
    top: "calc(env(safe-area-inset-top, 44px) + 10px)",
    right: 16,
    zIndex: 31,
    display: "flex", alignItems: "center", gap: 8,
  },
  searchBtn: {
    width: 32, height: 32, borderRadius: "50%",
    background: "rgba(0,0,0,0.05)", border: "none",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  avatar: {
    width: 32, height: 32, borderRadius: "50%",
    background: "linear-gradient(145deg, #4D5666, #1F2530)",
    color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "var(--mb-font-display)", fontWeight: 700, fontSize: 12,
    border: "none", cursor: "pointer",
  },
  largeTitle: {
    fontFamily: "var(--mb-font-display)", fontWeight: 800,
    fontSize: 34, letterSpacing: "-1px",
    margin: 0, lineHeight: 1.05,
    // Right padding clears the floating avatar+search (32+8+32+16=88).
    padding: "6px 96px 12px 22px",
    color: "var(--mb-ink)",
    textWrap: "balance",
  },
};
