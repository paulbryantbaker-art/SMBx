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
  onSearch?: () => void;
}

export function GlassTopBar({
  title,
  showBack,
  onBack,
  rightSlot,
  initials = "JM",
  onAvatarClick,
  onSearch,
}: GlassTopBarProps) {
  const { collapsed, scrolled } = useContext(TitleCollapseContext);
  return (
    <>
      {/* iOS 26 chrome sampler — Safari 26 live-samples the topmost
          position:fixed element (≥80% wide, near edge) to compute the
          status-bar tint, including its backdrop-filter. By placing a
          fixed strip in ONLY the safe-area zone, we get true Liquid
          Glass chrome without overlapping the LargeTitle below. The
          subtle white wash + blur lets page content live-blur through
          the chrome as the user scrolls — apple.com / macrumors quality.
          Older iOS treats this as an invisible 0.2-alpha strip behind
          the chrome (no visible regression). */}
      <div style={T.chromeSentinel} aria-hidden="true" />

      {/* Spacer reserves only safe-area + a small gap. The LargeTitle starts
          right beneath it; the floating chrome (avatar + search) overlays the
          LargeTitle row on the right side, App-Store style. */}
      <div style={T.spacer} aria-hidden="true" />

      {/* DIAGNOSTIC PROBE (2026-05-03): bar is PERMANENTLY transparent —
          NO React-driven inline-style mutations on this fixed-tree element
          during scroll. Hypothesis: iOS 26 was locking chrome translucency
          when scroll flipped `scrolled` → React updated bg/backdropFilter
          inline → Safari treated it as a near-chrome paint mutation and
          opaque-locked the status bar. If bleed survives scroll with this
          static version, the hypothesis is confirmed and the App Store
          collapse pattern needs to be rebuilt via CSS-only
          (animation-timeline: scroll, sticky positioning) instead of
          React state.

          The small title (h1 inside) still fades on `collapsed` because
          it's a content child, not a fixed element bg — should be safe. */}
      <div
        style={{
          ...T.barWrap,
          pointerEvents: "none", // permanently non-interactive while bar is transparent
        }}
        aria-hidden={!collapsed}
      >
        <div
          style={{
            ...T.bar,
            background: "rgba(255,255,255,0)",
            backdropFilter: "none",
            WebkitBackdropFilter: "none",
            boxShadow: "none",
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
              onClick={onSearch}
              disabled={!onSearch}
              style={{
                ...T.searchBtn,
                cursor: onSearch ? "pointer" : "default",
                opacity: onSearch ? 1 : 0.5,
              }}
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
  /** Flip title to bright white for pages whose top sits over the
      gold/sage gradient band (Pipeline, Brief). Default is dark ink
      for hero-led pages where the title sits over the page body. */
  onColor?: boolean;
}

export function LargeTitle({ children, onColor }: LargeTitleProps) {
  const ref = useRef<HTMLHeadingElement | null>(null);
  const { setCollapsed, setScrolled } = useContext(TitleCollapseContext);

  // Scroll-position driven (was IntersectionObserver). The observer races
  // with iOS PWA layout settling + the mb-fade-up entrance transform on
  // first paint, sometimes reporting "not intersecting" at scrollTop=0
  // and starting the page in the collapsed state. A direct scroll listener
  // is both faster and deterministic.
  //
  // Scroll source depends on architecture (see V6Mobile.tsx isStandalone):
  //   • PWA standalone: .mobile-root is the scroll container, listen there.
  //   • Safari tab: body scrolls (per the desktop-only html/body lock gate
  //     in index.css), listen on window. el.offsetTop is relative to the
  //     offsetParent in either case so the math works for both.
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
    const isStandalone =
      typeof window !== "undefined" &&
      window.matchMedia("(display-mode: standalone)").matches;
    const root = el.closest(".mobile-root") as HTMLElement | null;
    if (isStandalone && !root) {
      setCollapsed(false);
      setScrolled(false);
      return;
    }
    const SCROLL_THRESHOLD = 4;   // px before showing glass tint
    const COLLAPSE_OFFSET   = 12; // px past title's bottom before collapse
    const getScrollTop = () =>
      isStandalone && root ? root.scrollTop : window.scrollY;
    const update = () => {
      const titleBottom = el.offsetTop + el.offsetHeight;
      const scrollTop = getScrollTop();
      setScrolled(scrollTop > SCROLL_THRESHOLD);
      setCollapsed(scrollTop > titleBottom - COLLAPSE_OFFSET);
    };
    update();
    const target: HTMLElement | Window =
      isStandalone && root ? root : window;
    target.addEventListener("scroll", update, { passive: true });
    // Recompute after layout settles — covers the first ~600ms.
    const t1 = setTimeout(update, 60);
    const t2 = setTimeout(update, 240);
    const t3 = setTimeout(update, 540);
    return () => {
      target.removeEventListener("scroll", update);
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      setCollapsed(false);
      setScrolled(false);
    };
  }, [setCollapsed, setScrolled]);

  return (
    <h1
      ref={ref}
      style={onColor ? { ...T.largeTitle, color: "#fff" } : T.largeTitle}
    >{children}</h1>
  );
}

const T: Record<string, CSSProperties> = {
  chromeSentinel: {
    // Sized to ONLY the safe-area-inset-top zone. Subtle white wash
    // (0.20 alpha) + 20px blur. Safari 26 picks the topmost qualifying
    // fixed element to drive chrome tint — this beats the body-bg
    // fallback because it carries a backdrop-filter, which Safari
    // propagates into the chrome surface itself. Result: chrome
    // becomes truly translucent and live-blurs whatever is scrolling
    // beneath it.
    //
    // pointer-events:none so it doesn't intercept taps near the top.
    // z-index 29 = below barWrap (30) so the bar still draws above it
    // when the bar materializes on scroll.
    position: "fixed",
    top: 0, left: 0, right: 0,
    height: "env(safe-area-inset-top, 44px)",
    background: "rgba(255,255,255,0.20)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    zIndex: 29,
    pointerEvents: "none",
  },
  spacer: {
    // Just safe-area inset reservation — NO background color. A bg here
    // forces iOS chrome translucency to show this color instead of the
    // actual page content, which means scrolling never produces a real
    // content-bleed-through-chrome effect (you observed Detail page
    // bleeds on scroll because it has no spacer with bg; Today did NOT
    // bleed because the spacer was forcing warm gold). Body bg #D4A258
    // (set in index.html inline script) still provides the subtle warm
    // chrome tint via Safari's body-bg sampling fallback.
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
