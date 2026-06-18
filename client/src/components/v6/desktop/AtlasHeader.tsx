/**
 * AtlasHeader — the 58px global header + module tab strip + utilities.
 *
 * Tab strip: Today · Pipeline · Sourcing · Deals · Studio · Integration ·
 * Files · Agent. Active-tab logic (from design map 00 §b): cockpit → Deals,
 * canvas → Deals (keeps the prior app tab feel), settings → none.
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
  { id: "pipeline", label: "Pipeline" },
  { id: "sourcing", label: "Sourcing" },
  { id: "deals", label: "Deals" },
  { id: "studio", label: "Studio" },
  { id: "integration", label: "Integration" },
  { id: "files", label: "Files" },
  { id: "agent", label: "Agent" },
];

/** Map the current screen to the highlighted tab. Cockpit + canvas highlight
 *  Deals; settings highlights nothing. */
function activeTabFor(screen: AtlasScreen): AtlasScreen | null {
  if (screen === "cockpit" || screen === "canvas") return "deals";
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

      {/* Utilities */}
      <button type="button" aria-label="Search" style={S.iconBtn} onClick={() => nav.go("deals")}>
        <SearchIcon size={21} c={T.muted} />
      </button>
      <button type="button" aria-label="Help" style={S.iconBtn}>
        <HelpIcon size={21} c={T.muted} />
      </button>
      <button type="button" aria-label="Notifications" style={{ ...S.iconBtn, position: "relative" }}>
        <BellIcon size={21} c={T.muted} />
        {hasNotifications && <span style={S.notifDot} />}
      </button>

      <button type="button" style={S.upgrade} onClick={() => nav.openSettings("billing")}>
        <Sparkle size={14} />
        Upgrade
      </button>

      <button
        type="button"
        aria-label="Account"
        onClick={() => nav.openSettings("profile")}
        style={S.avatarBtn}
      >
        <Avatar initials={initials} size={32} gradient />
      </button>
    </header>
  );
}

const S: Record<string, CSSProperties> = {
  header: {
    height: 58,
    flex: "none",
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "0 16px",
    borderBottom: `1px solid ${T.hair}`,
    background: T.white,
  },
  logo: { display: "flex", alignItems: "center", gap: 9, marginRight: 6, flex: "none" },
  wordmark: { fontSize: 19, fontWeight: 600, letterSpacing: "-.01em", color: T.ink },
  tabs: { flex: 1, minWidth: 0, display: "flex", gap: 2, overflowX: "auto" },
  tab: {
    border: "none",
    borderRadius: T.rPill,
    padding: "7px 12px",
    fontSize: 14,
    cursor: "pointer",
    fontFamily: T.font,
    whiteSpace: "nowrap",
    flex: "none",
  },
  iconBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    flex: "none",
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
  },
  avatarBtn: { border: "none", background: "transparent", cursor: "pointer", padding: 0, flex: "none" },
};

export default AtlasHeader;
