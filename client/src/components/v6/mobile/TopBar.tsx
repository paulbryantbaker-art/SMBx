/* V6 Mobile — TopBar variants.
   GlassTopBar = translucent sticky bar (mask-image bottom fade) for App Store
                 large-title pattern.
   LargeTitle  = 34px display title that sits under the glass bar (visible on
                 scroll-top, collapses into bar title on scroll).
   StaticTopBar = standard non-translucent fallback for surfaces that don't
                 want the glass treatment (e.g., the deal detail uses its own
                 floating nav). */

import { type CSSProperties, type ReactNode } from "react";
import { GlassSurface } from "./glass";
import { MobileIcon } from "./icons";

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

          <h1 style={T.title}>{title}</h1>

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
  return <h1 style={T.largeTitle}>{children}</h1>;
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
