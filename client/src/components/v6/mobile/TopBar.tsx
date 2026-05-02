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
      {/* Spacer reserves layout space so content starts below the bar */}
      <div style={{ height: 100 }} aria-hidden="true" />
      <div style={T.barWrap}>
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
            aria-hidden={!collapsed}
            style={{
              ...T.title,
              opacity: collapsed ? 1 : 0,
              transform: collapsed ? "translateY(0)" : "translateY(4px)",
              transition: "opacity 180ms cubic-bezier(0.25, 1, 0.5, 1), transform 180ms cubic-bezier(0.25, 1, 0.5, 1)",
              pointerEvents: collapsed ? "auto" : "none",
            }}
          >{title}</h1>

          <div style={T.right}>
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
        </GlassSurface>
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
  right: {
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
    padding: "8px 22px 12px",
    color: "var(--mb-ink)",
    textWrap: "balance",
  },
};
