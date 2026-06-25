/**
 * AtlasHeader — the 58px global header + module tab strip + utilities.
 *
 * Tab strip: Today · Deals · Sourcing · Studio · Integration · Files · Agent.
 * (The old "Pipeline" tab is merged into Deals — its kanban funnel is the Deals
 * Board toggle.) Active-tab logic (from design map 00 §b): cockpit → Deals,
 * canvas → Deals (keeps the prior app tab feel), pipeline alias → Deals,
 * settings → none.
 */
import type { CSSProperties } from "react";
import { useAtlasNav, type AtlasScreen } from "./atlasNav";
import { Sparkle, Avatar } from "./primitives";
import { SearchIcon, HelpIcon, BellIcon } from "./icons";
import { T } from "./atlasTokens";

interface TabDef {
  id: AtlasScreen;
  label: string;
}

const TABS: TabDef[] = [
  { id: "today", label: "Today" },
  { id: "deals", label: "Deals" },
  { id: "sourcing", label: "Sourcing" },
  { id: "studio", label: "Studio" },
  { id: "integration", label: "Integration" },
  { id: "files", label: "Files" },
  { id: "agent", label: "Agent" },
];

/** Map the current screen to the highlighted tab. Cockpit + canvas highlight
 *  Deals; the retired "pipeline" alias also highlights Deals (the funnel now
 *  lives in the Deals Board toggle); settings highlights nothing. */
function activeTabFor(screen: AtlasScreen): AtlasScreen | null {
  if (screen === "cockpit" || screen === "canvas" || screen === "pipeline") return "deals";
  if (screen === "settings") return null;
  return screen;
}

export function AtlasHeader({
  initials,
  hasNotifications = false,
}: {
  initials: string;
  hasNotifications?: boolean;
}) {
  const nav = useAtlasNav();
  const active = activeTabFor(nav.view.screen);

  return (
    <header style={S.header}>
      {/* Logo cluster */}
      <div style={S.logo}>
        <Sparkle size={22} />
        <span style={S.wordmark}>Atlas</span>
      </div>

      {/* Module tab list */}
      <nav style={S.tabs}>
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => nav.go(tab.id)}
              style={{
                ...S.tab,
                background: isActive ? T.tabActive : "transparent",
                color: isActive ? T.blue : T.muted,
                fontWeight: isActive ? 600 : 500,
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = T.tabHover;
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Divider between the module nav and the open-document tabs (only when any
          are open) — visually separates "where you navigate" from "what you have
          open", in the SAME row so no vertical height is added. */}
      {nav.openTabs.length > 0 && <span style={S.tabDivider} aria-hidden="true" />}

      {/* Open-document tab strip (deals + canvases). Takes the flexible middle
          space and scrolls horizontally; doubles as the spacer that keeps the
          utilities right-aligned when nothing is open. */}
      <div style={S.tabStrip} role="tablist" aria-label="Open tabs">
        {nav.openTabs.map((t) => {
          const isActive = t.id === nav.activeTabId;
          return (
            <span
              key={t.id}
              style={{ ...S.openTab, background: isActive ? T.tabActive : "transparent" }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = T.tabHover;
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                title={t.title}
                onClick={() => nav.selectTab(t)}
                style={{
                  ...S.openTabLabel,
                  color: isActive ? T.blue : T.muted,
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {t.title}
              </button>
              <button
                type="button"
                aria-label={`Close ${t.title}`}
                onClick={() => nav.closeTab(t.id)}
                style={S.tabClose}
                onMouseEnter={(e) => (e.currentTarget.style.color = T.ink)}
                onMouseLeave={(e) => (e.currentTarget.style.color = T.faint)}
              >
                ×
              </button>
            </span>
          );
        })}
      </div>

      {/* Utilities */}
      <button
        type="button"
        aria-label="Search"
        style={S.iconBtn}
        onClick={() => nav.go("deals")}
        onMouseEnter={hoverIconOn}
        onMouseLeave={hoverIconOff}
      >
        <SearchIcon size={21} c={T.muted} />
      </button>
      <button
        type="button"
        aria-label="Help"
        style={S.iconBtn}
        onMouseEnter={hoverIconOn}
        onMouseLeave={hoverIconOff}
      >
        <HelpIcon size={21} c={T.muted} />
      </button>
      <button
        type="button"
        aria-label="Notifications"
        style={{ ...S.iconBtn, position: "relative" }}
        onMouseEnter={hoverIconOn}
        onMouseLeave={hoverIconOff}
      >
        <BellIcon size={21} c={T.muted} />
        {hasNotifications && <span style={S.notifDot} />}
      </button>

      <button
        type="button"
        style={S.upgrade}
        onClick={() => nav.openSettings("billing")}
        onMouseEnter={(e) => (e.currentTarget.style.background = T.navActive)}
        onMouseLeave={(e) => (e.currentTarget.style.background = T.blueBg)}
      >
        <Sparkle size={14} />
        Upgrade
      </button>

      <button
        type="button"
        aria-label="Account"
        onClick={() => nav.openSettings("profile")}
        style={S.avatarBtn}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        <Avatar initials={initials} size={32} gradient />
      </button>
    </header>
  );
}

/* Shared icon-button hover (subtle blue wash, matching the tab/Upgrade chrome). */
function hoverIconOn(e: { currentTarget: HTMLElement }) {
  e.currentTarget.style.background = T.tabHover;
}
function hoverIconOff(e: { currentTarget: HTMLElement }) {
  e.currentTarget.style.background = "transparent";
}

const S: Record<string, CSSProperties> = {
  header: {
    height: 58,
    flex: "none",
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "0 16px",
    // No bottom hairline — the canvas below fades from white at the top
    // (detailRegion gradient), so the nav meets the content seamlessly.
    background: T.white,
  },
  logo: { display: "flex", alignItems: "center", gap: 9, marginRight: 6, flex: "none" },
  wordmark: { fontSize: 19, fontWeight: 600, letterSpacing: "-.01em", color: T.ink },
  tabs: {
    // Content-width now (was flex:1) so the open-tab strip can take the flexible
    // middle space. The module nav stays fully visible; on a narrow window it
    // can shrink + scroll before the tab strip does.
    flex: "0 1 auto",
    minWidth: 0,
    display: "flex",
    gap: 2,
    overflowX: "auto",
    // The strip can scroll on narrow widths, but the scrollbar reads as chrome
    // noise in a 58px header — hide it (content stays reachable by wheel/drag).
    scrollbarWidth: "none",
  },
  // Hairline between the module nav and the open-document tabs.
  tabDivider: {
    flex: "none",
    width: 1,
    height: 22,
    background: T.border,
    margin: "0 4px",
  },
  // Open-document tab strip — flexible middle space; scrolls; also the spacer
  // that keeps the right-hand utilities pinned when nothing is open.
  tabStrip: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    gap: 3,
    overflowX: "auto",
    scrollbarWidth: "none",
  },
  openTab: {
    flex: "none",
    display: "inline-flex",
    alignItems: "center",
    maxWidth: 180,
    borderRadius: T.rPill,
    transition: "background .12s ease",
  },
  openTabLabel: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontFamily: T.font,
    fontSize: 13.5,
    padding: "6px 2px 6px 11px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 148,
    transition: "color .12s ease",
  },
  tabClose: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: T.faint,
    fontSize: 16,
    lineHeight: 1,
    padding: "4px 9px 4px 3px",
    display: "inline-flex",
    alignItems: "center",
    transition: "color .12s ease",
  },
  tab: {
    border: "none",
    borderRadius: T.rPill,
    padding: "7px 12px",
    fontSize: 14,
    cursor: "pointer",
    fontFamily: T.font,
    whiteSpace: "nowrap",
    flex: "none",
    transition: "background .12s ease, color .12s ease",
  },
  iconBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
    borderRadius: T.rPill,
    flex: "none",
    transition: "background .12s ease",
  },
  notifDot: {
    position: "absolute",
    top: 3,
    right: 3,
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: T.blue,
    border: "1.5px solid #fff",
  },
  upgrade: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    background: T.blueBg,
    color: T.blue,
    border: "none",
    borderRadius: T.rPill,
    padding: "7px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: T.font,
    flex: "none",
    transition: "background .12s ease",
  },
  avatarBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
    flex: "none",
    transition: "opacity .12s ease",
  },
};

export default AtlasHeader;
