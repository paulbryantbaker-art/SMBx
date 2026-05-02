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
import { MobileIcon } from "./icons";

/* ─── Title-collapse context ──────────────────────────────── */

interface TitleCollapseValue {
  /** True once the LargeTitle has scrolled past the bar zone. Drives the
      small title fade-in inside the bar. */
  collapsed: boolean;
  setCollapsed: (b: boolean) => void;
  /** True as soon as the user has scrolled at all. Drives the bar's
      backdrop tint — the blur itself is always on so content scrolling
      under the bar is always covered, but the visible chrome only
      materializes once the user starts scrolling. */
  scrolled: boolean;
  setScrolled: (b: boolean) => void;
}
const TitleCollapseContext = createContext<TitleCollapseValue>({
  collapsed: false,
  setCollapsed: () => {},
  scrolled: false,
  setScrolled: () => {},
});

export function TitleCollapseProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  return (
    <TitleCollapseContext.Provider value={{ collapsed, setCollapsed, scrolled, setScrolled }}>
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
  const { collapsed, scrolled } = useContext(TitleCollapseContext);
  return (
    <>
      {/* Spacer reserves only safe-area + a small gap. The LargeTitle starts
          right beneath it; the floating chrome (avatar + search) overlays the
          LargeTitle row on the right side, App-Store style. */}
      <div style={T.spacer} aria-hidden="true" />

      {/* Glass bar — the BLUR is always on so any content scrolling under
          the bar zone is cleanly covered (no half-cut LargeTitle). The
          visible tint fades in as soon as the user starts scrolling, and
          the small title fades in once the LargeTitle has scrolled past. */}
      <div
        style={{
          ...T.barWrap,
          // Only intercept taps when the bar is materialized — at
          // scroll-top the bar is fully transparent and shouldn't capture
          // events meant for the LargeTitle row beneath it.
          pointerEvents: scrolled ? "auto" : "none",
        }}
        aria-hidden={!collapsed}
      >
        <div
          style={{
            ...T.bar,
            // Backdrop blur is conditional — at scroll-top it would blur
            // the LargeTitle behind it (the bar zone overlaps with the
            // title's vertical position), creating a "ghost rectangle"
            // look. Snap on the moment the user scrolls; the LargeTitle
            // is moving by then so the snap reads as glass sliding over.
            backdropFilter: scrolled
              ? "blur(28px) saturate(180%) brightness(1.04)"
              : "none",
            WebkitBackdropFilter: scrolled
              ? "blur(28px) saturate(180%) brightness(1.04)"
              : "none",
            background: scrolled
              ? "rgba(255,255,255,0.55)"
              : "rgba(255,255,255,0)",
            boxShadow: scrolled
              ? "inset 0 -0.5px 0 rgba(0,0,0,0.06)"
              : "none",
            transition:
              "background 220ms cubic-bezier(0.25, 1, 0.5, 1), " +
              "box-shadow 220ms cubic-bezier(0.25, 1, 0.5, 1)",
          }}
        >
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
              opacity: collapsed ? 1 : 0,
              transform: collapsed ? "translateY(0)" : "translateY(4px)",
              transition:
                "opacity 180ms cubic-bezier(0.25, 1, 0.5, 1), " +
                "transform 180ms cubic-bezier(0.25, 1, 0.5, 1)",
            }}
          >{title}</h1>

          {/* Reserve the right gutter so the centered title stays centered
              against the always-visible floating chrome above. */}
          <div style={{ width: 80 }} aria-hidden="true" />
        </div>
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
  const { setCollapsed, setScrolled } = useContext(TitleCollapseContext);

  // Scroll-position driven (was IntersectionObserver). The observer races
  // with iOS PWA layout settling + the mb-fade-up entrance transform on
  // first paint, sometimes reporting "not intersecting" at scrollTop=0
  // and starting the page in the collapsed state. A direct scroll listener
  // on the mobile-root container is both faster and deterministic.
  //
  // Two thresholds:
  //   • scrolled  — true as soon as scrollTop > a small threshold. Drives
  //                 the bar's tint so glass appears the moment content
  //                 starts moving under it (no half-cut LargeTitle).
  //   • collapsed — true once scrollTop has passed the LargeTitle's
  //                 bottom. Drives the small title fade-in inside the bar.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = el.closest(".mobile-root") as HTMLElement | null;
    if (!root) {
      setCollapsed(false);
      setScrolled(false);
      return;
    }
    const SCROLL_THRESHOLD = 4;   // px before showing glass tint
    const COLLAPSE_OFFSET   = 12; // px past title's bottom before collapse
    const update = () => {
      const titleBottom = el.offsetTop + el.offsetHeight;
      setScrolled(root.scrollTop > SCROLL_THRESHOLD);
      setCollapsed(root.scrollTop > titleBottom - COLLAPSE_OFFSET);
    };
    update();
    root.addEventListener("scroll", update, { passive: true });
    // Recompute after layout settles — covers the first ~600ms.
    const t1 = setTimeout(update, 60);
    const t2 = setTimeout(update, 240);
    const t3 = setTimeout(update, 540);
    return () => {
      root.removeEventListener("scroll", update);
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      setCollapsed(false);
      setScrolled(false);
    };
  }, [setCollapsed, setScrolled]);

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
    // Mask gradient previously faded the bar's bottom edge, but with the
    // always-on blur that fade let half-cut LargeTitle text peek through
    // as it scrolled past. Hard cutoff is what we want — anything below
    // the bar's bottom edge is fully out of the bar zone.
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
