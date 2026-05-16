import { useEffect, useRef, useState, type CSSProperties } from "react";
import { MODES, V6Icon } from "./icons";
import type { FileListView, IconName, ModeId, OpenTab, Tab } from "./types";
import { isSuperAdminUser } from "../../lib/superAdmin";

interface SidebarProps {
  activeMode: ModeId;
  tabs: Tab[];
  activeTabId: string;
  onPickMode: (id: ModeId) => void;
  onPickTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onOpenTab: OpenTab;
  user: { display_name: string | null; email: string; role?: string } | null;
  onSignIn: () => void;
  onSignUp: () => void;
  onSignOut: () => void;
}

export function V6Sidebar({
  activeMode, tabs, activeTabId, onPickMode, onPickTab, onCloseTab, onOpenTab,
  user, onSignIn, onSignUp, onSignOut,
}: SidebarProps) {
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const expanded = pinned || hover || menuOpen;
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside to close account menu
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const isAnon = !user;
  const showStudio = isSuperAdminUser(user);
  const tabsForMode = (mode: ModeId) => tabs.filter(tab => tabBelongsToMode(tab, mode, tabs));
  const aboutTabs = tabs.filter(tab => tab.kind === "learn");
  const aboutActive = aboutTabs.some(tab => tab.id === activeTabId);
  const acctName = user
    ? (user.display_name?.trim() || user.email.split("@")[0])
    : "Guest";
  const acctSub = user ? user.email : "Sign in to use yours";
  const initials = (() => {
    if (!user) return "·";
    const src = user.display_name?.trim() || user.email;
    const parts = src.split(/[\s@.]+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return src.slice(0, 2).toUpperCase();
  })();

  return (
    <aside
      className={`workspace-rail ${expanded ? "expanded" : "collapsed"}`}
      style={{ ...S.rail, width: expanded ? 332 : 56 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
      }}
    >
      <div ref={menuRef} style={{ ...S.account, padding: expanded ? "12px 14px" : "12px 0", justifyContent: expanded ? "flex-start" : "center", position: "relative" }}>
        <button
          className="m-state"
          style={{ ...S.avatar, cursor: "pointer", border: "none" }}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={user ? "Account menu" : "Sign in or sign up"}
          aria-expanded={menuOpen}
        >{initials}</button>
        {expanded && (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={S.acctName}>{acctName}</div>
              <div style={S.acctSub}>{acctSub}</div>
            </div>
            <button
              className="m-state"
              style={S.chevBtn}
              title={pinned ? "Unpin sidebar" : "Pin sidebar"}
              aria-label={pinned ? "Unpin sidebar" : "Pin sidebar"}
              aria-pressed={pinned}
              onClick={() => setPinned(!pinned)}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                {pinned
                  ? <path d="M9 4.5l-3-3-3 3M9 7.5l-3 3-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  : <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>}
              </svg>
            </button>
          </>
        )}

        {menuOpen && expanded && (
          <div role="menu" style={S.menu} className="m-fade-in">
            {isAnon ? (
              <>
                <button role="menuitem" className="m-state" style={S.menuItem} onClick={() => { setMenuOpen(false); onSignIn(); }}>
                  Sign in
                </button>
                <button role="menuitem" className="m-state" style={S.menuItem} onClick={() => { setMenuOpen(false); onSignUp(); }}>
                  Create account
                </button>
                <div style={S.menuDivider} />
                <div style={S.menuFooter}>
                  Free tier · unlimited chat · 1 deliverable
                </div>
              </>
            ) : (
              <>
                <div style={S.menuHeader}>
                  <div style={S.menuName}>{acctName}</div>
                  <div style={S.menuEmail}>{user.email}</div>
                </div>
                <div style={S.menuDivider} />
                <button
                  role="menuitem"
                  className="m-state"
                  style={S.menuItem}
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenTab({ id: "tab-settings", kind: "settings", title: "Settings" });
                  }}
                >
                  Profile
                </button>
                <button
                  role="menuitem"
                  className="m-state"
                  style={S.menuItem}
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenTab({ id: "tab-settings", kind: "settings", title: "Settings" });
                  }}
                >
                  Settings
                </button>
                <div style={S.menuDivider} />
                <button role="menuitem" className="m-state" style={{ ...S.menuItem, color: "var(--m-pass)" }} onClick={() => { setMenuOpen(false); onSignOut(); }}>
                  Sign out
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div style={{ ...S.modes, padding: expanded ? "20px 10px 10px" : "18px 6px 8px" }}>
          {expanded && <div style={S.sectionHead}>Workspace</div>}
          {MODES.map(m => {
            const modeTabs = tabsForMode(m.id);
            const tabTree = groupTabsByDeal(modeTabs);
            const modeOpenCount = modeTabs.length;
            const hasOpenWork = expanded && modeOpenCount > 0;
            const renderWorkRow = (tab: Tab, options: { child?: boolean; parentTitle?: string } = {}) => {
              const active = tab.id === activeTabId;
              const parentDeal = options.parentTitle ? null : owningDealForTab(tab, tabs);
              const dealContext = options.parentTitle ?? parentDeal?.title ?? inferredDealNameForTab(tab);
              const label = dealContext ? childTabTitle(tab, dealContext) : tab.title;
              return (
                <div
                  key={tab.id}
                  className={`module-work-row ${options.child ? "child" : "parent"} ${active ? "active" : ""}`}
                  role="listitem"
                >
                  <button
                    className="module-work-item"
                    onClick={() => onPickTab(tab.id)}
                    title={tab.title}
                  >
                    <span className="module-work-icon"><V6Icon name={tabIcon(tab)} size={options.child ? 11 : 12} /></span>
                    <span className="module-work-copy">
                      <span className="module-work-title">{label}</span>
                      <span className="module-work-meta">{tabMeta(tab, tabs, Boolean(options.parentTitle || parentDeal))}</span>
                    </span>
                  </button>
                  <button
                    className="module-work-close"
                    onClick={(event) => {
                      event.stopPropagation();
                      onCloseTab(tab.id);
                    }}
                    aria-label={`Close ${tab.title}`}
                    title={`Close ${tab.title}`}
                  >
                    <V6Icon name="close" size={10} />
                  </button>
                </div>
              );
            };
            const renderVirtualDealRow = (deal: Tab, hasActiveChild: boolean) => (
              <div
                key={deal.id}
                className={`module-work-row parent virtual ${hasActiveChild ? "active-parent" : ""}`}
                role="listitem"
              >
                <button
                  className="module-work-item"
                  onClick={() => onOpenTab({ id: dealTabIdForTitle(deal.title), kind: "deal", title: deal.title, sourceMode: "pipeline" })}
                  title={`Open ${deal.title}`}
                >
                  <span className="module-work-icon"><V6Icon name="deal" size={12} /></span>
                  <span className="module-work-copy">
                    <span className="module-work-title">{deal.title}</span>
                    <span className="module-work-meta">Deal workspace</span>
                  </span>
                </button>
              </div>
            );
            return (
            <div
              key={m.id}
              className={`module-group ${hasOpenWork ? "has-work" : ""} ${activeMode === m.id ? "active" : ""}`}
            >
              <button
                className={`mode-item module-head ${activeMode === m.id ? "active" : ""}`}
                onClick={() => onPickMode(m.id)}
                title={!expanded ? m.label : undefined}
                aria-label={m.label}
                aria-current={activeMode === m.id ? "page" : undefined}
                style={!expanded ? { justifyContent: "center", padding: "10px 0" } : undefined}
              >
                <span className="mode-icon"><V6Icon name={m.icon} size={17} /></span>
                {expanded && (
                  <>
                    <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.label}</span>
                    {modeOpenCount > 0 && <span className="mode-count">{modeOpenCount}</span>}
                  </>
                )}
              </button>
              {hasOpenWork && (
                <div className="module-work-reveal open">
                  <div className="module-work-stack" role="list" aria-label={`${m.label} open work`}>
                    {tabTree.deals.map(group => (
                      <div
                        key={group.deal.id}
                        className={`module-work-branch ${group.children.some(tab => tab.id === activeTabId) ? "active-child" : ""}`}
                        role="listitem"
                      >
                        {group.virtual
                          ? renderVirtualDealRow(group.deal, group.children.some(tab => tab.id === activeTabId))
                          : renderWorkRow(group.deal)}
                        {group.children.length > 0 && (
                          <div className="module-child-stack" role="list" aria-label={`${group.deal.title} open work`}>
                            {group.children.map(tab => renderWorkRow(tab, { child: true, parentTitle: group.deal.title }))}
                          </div>
                        )}
                      </div>
                    ))}
                    {tabTree.loose.map(tab => renderWorkRow(tab))}
                  </div>
                </div>
              )}
              {showStudio && m.id === "files" && (
                <button
                  className="mode-item"
                  onClick={() => onOpenTab({ id: "marketing-studio", kind: "marketing-studio", title: "Marketing Studio", studioView: "home" })}
                  title={!expanded ? "Marketing Studio" : undefined}
                  aria-label="Marketing Studio"
                  style={{
                    marginTop: 3,
                    ...(expanded
                      ? { color: "var(--m-on-surface)", background: "rgba(255,255,255,0.44)" }
                      : { justifyContent: "center", padding: "10px 0" }),
                  }}
                >
                  <span className="mode-icon"><V6Icon name="doc" size={17} /></span>
                  {expanded && (
                    <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Studio</span>
                  )}
                </button>
              )}
            </div>
          );
          })}
          {expanded && aboutTabs.length > 0 && (
            <div className={`module-group has-work about-group ${aboutActive ? "active" : ""}`}>
              <button
                className={`mode-item module-head ${aboutActive ? "active" : ""}`}
                onClick={() => onPickTab(aboutTabs[0].id)}
                aria-label="About SMBX"
                aria-current={aboutActive ? "page" : undefined}
              >
                <span className="mode-icon"><V6Icon name="library" size={17} /></span>
                <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>About SMBX</span>
                <span className="mode-count">{aboutTabs.length}</span>
              </button>
              <div className="module-work-reveal open">
                <div className="module-work-stack" role="list" aria-label="About SMBX open pages">
                  {aboutTabs.map(tab => (
                    <div
                      key={tab.id}
                      className={`module-work-row child ${tab.id === activeTabId ? "active" : ""}`}
                      role="listitem"
                    >
                      <button
                        className="module-work-item"
                        onClick={() => onPickTab(tab.id)}
                        title={tab.title}
                      >
                        <span className="module-work-icon"><V6Icon name={tabIcon(tab)} size={11} /></span>
                        <span className="module-work-copy">
                          <span className="module-work-title">{tab.title}</span>
                          <span className="module-work-meta">{tabMeta(tab)}</span>
                        </span>
                      </button>
                      <button
                        className="module-work-close"
                        onClick={(event) => {
                          event.stopPropagation();
                          onCloseTab(tab.id);
                        }}
                        aria-label={`Close ${tab.title}`}
                        title={`Close ${tab.title}`}
                      >
                        <V6Icon name="close" size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
      </div>

      <div style={{ ...S.foot, padding: expanded ? "8px 8px 12px" : "8px 6px 12px" }}>
          <button
            className="mode-item"
            style={{ width: "100%", ...(expanded ? null : { justifyContent: "center", padding: "10px 0" }) }}
            title={!expanded ? "Recent activity" : undefined}
            aria-label="Recent activity"
            onClick={() => onOpenTab({ id: "tab-history", kind: "history", title: "Conversation history" })}
          >
            <span className="mode-icon"><V6Icon name="history" size={17} /></span>
            {expanded && <span>Recent activity</span>}
          </button>
          <button
            className="mode-item"
            style={{ width: "100%", ...(expanded ? null : { justifyContent: "center", padding: "10px 0" }) }}
            title={!expanded ? "Settings" : undefined}
            aria-label="Settings"
            onClick={() => onOpenTab({ id: "tab-settings", kind: "settings", title: "Settings" })}
          >
            <span className="mode-icon"><V6Icon name="settings" size={17} /></span>
            {expanded && <span>Settings</span>}
          </button>
      </div>
    </aside>
  );
}

interface DealTabGroup {
  deal: Tab;
  children: Tab[];
  virtual?: boolean;
}

function tabBelongsToMode(tab: Tab, mode: ModeId, allTabs: Tab[]): boolean {
  if (tab.kind === "mode-root") return false;
  if (tab.kind === "learn") return false;
  if (tab.kind === "files-list" || tab.kind === "marketing-studio") return mode === "files";
  if (tab.kind === "deal") return mode === "pipeline";
  const dealParent = owningDealForTab(tab, allTabs);
  if (dealParent) {
    return mode === "pipeline";
  }
  const inferredDeal = inferredDealNameForTab(tab);
  if (tab.kind === "doc") {
    if (inferredDeal) return mode === "pipeline";
    if (tab.sourceMode) return tab.sourceMode === mode;
    return mode === "files";
  }
  if (tab.kind === "analysis") {
    if (inferredDeal) return mode === "pipeline";
    if (tab.sourceMode) return tab.sourceMode === mode;
    return mode === "pipeline";
  }
  if (tab.sourceMode) return tab.sourceMode === mode;
  if (tab.kind === "feed-item" || tab.kind === "starter") return mode === "today";
  if (tab.kind === "settings" || tab.kind === "history") return mode === "today";
  return false;
}

function groupTabsByDeal(modeTabs: Tab[]): { deals: DealTabGroup[]; loose: Tab[] } {
  const dealTabs = modeTabs.filter(tab => tab.kind === "deal");
  const used = new Set<string>();
  const deals = dealTabs.map(deal => {
    used.add(deal.id);
    const children = modeTabs.filter(tab => tab.kind !== "deal" && tabMatchesDeal(tab, deal));
    children.forEach(tab => used.add(tab.id));
    return { deal, children };
  });
  const virtualDealChildren = new Map<string, Tab[]>();
  modeTabs.forEach(tab => {
    if (used.has(tab.id) || tab.kind === "deal") return;
    const dealTitle = inferredDealNameForTab(tab);
    if (!dealTitle) return;
    if (!virtualDealChildren.has(dealTitle)) virtualDealChildren.set(dealTitle, []);
    virtualDealChildren.get(dealTitle)?.push(tab);
    used.add(tab.id);
  });
  virtualDealChildren.forEach((children, dealTitle) => {
    deals.push({
      deal: {
        id: `virtual-${dealTabIdForTitle(dealTitle)}`,
        kind: "deal",
        title: dealTitle,
        sourceMode: "pipeline",
      },
      children,
      virtual: true,
    });
  });
  return {
    deals,
    loose: modeTabs.filter(tab => !used.has(tab.id)),
  };
}

function owningDealForTab(tab: Tab, allTabs: Tab[]): Tab | null {
  if (tab.kind === "deal") return null;
  return allTabs.find(candidate => candidate.kind === "deal" && tabMatchesDeal(tab, candidate)) ?? null;
}

function tabMatchesDeal(tab: Tab, deal: Tab): boolean {
  return isChildOfDeal(tab, deal) || sameDealName(inferredDealNameForTab(tab), deal.title);
}

function isChildOfDeal(tab: Tab, deal: Tab): boolean {
  if (tab.id === deal.id) return false;
  const dealTitle = normalizeDealTitle(deal.title);
  const tabTitle = normalizeTabTitle(tab.title);
  if (sameDealName(inferredDealNameForTab(tab), dealTitle)) return true;
  return stripDealPrefix(tabTitle, dealTitle) !== tabTitle;
}

function childTabTitle(tab: Tab, parentTitle: string): string {
  return stripDealPrefix(normalizeTabTitle(tab.title), parentTitle);
}

function normalizeTabTitle(title: string): string {
  return title.replace(/\s+/g, " ").trim();
}

function normalizeDealTitle(title: string): string {
  return normalizeTabTitle(title)
    .replace(/\s*[·:-]\s*sample\b/gi, "")
    .trim();
}

function dealTitleKey(title?: string | null): string {
  return normalizeDealTitle(title ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function sameDealName(left?: string | null, right?: string | null): boolean {
  const a = dealTitleKey(left);
  const b = dealTitleKey(right);
  return Boolean(a && b && a === b);
}

function stripDealPrefix(title: string, dealTitle: string): string {
  const normalizedTitle = normalizeTabTitle(title);
  const normalizedDeal = normalizeDealTitle(dealTitle);
  if (!normalizedDeal) return normalizedTitle;
  const patterns = [
    new RegExp(`^${escapeRegExp(normalizedDeal)}\\s*(?:[·:/-])\\s*`, "i"),
    new RegExp(`^${escapeRegExp(normalizedDeal)}\\s+`, "i"),
  ];
  for (const pattern of patterns) {
    const stripped = normalizedTitle.replace(pattern, "").trim();
    if (stripped !== normalizedTitle) return stripped || normalizedTitle;
  }
  return normalizedTitle;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function inferredDealNameForTab(tab: Tab): string | null {
  const haystack = normalizeTabTitle([
    tab.id,
    tab.title,
    tab.kind === "analysis" ? tab.tool : "",
    tab.kind === "doc" ? tab.status : "",
  ].filter(Boolean).join(" ")).toLowerCase();

  if (haystack.includes("big fake") || haystack.includes("bigfake")) return "Big Fake Deal";
  if (haystack.includes("pest")) return "Pest Control · FL";
  if (haystack.includes("hvac")) return "HVAC platform · CO";
  if (haystack.includes("electrical")) return "Electrical Contractor · TX";
  if (haystack.includes("distribution")) return "Distribution · OH";

  if (
    /\bioi\b/.test(haystack) ||
    haystack.includes("qoe") ||
    haystack.includes("buyer fit") ||
    haystack.includes("mutual nda")
  ) {
    return "Big Fake Deal";
  }
  if (
    haystack.includes("p&l") ||
    haystack.includes("p-l") ||
    haystack.includes("audited") ||
    haystack.includes("tax return")
  ) {
    return "Big Fake Deal";
  }
  if (haystack.includes("pest") || /\bloi\b/.test(haystack)) return "Pest Control · FL";
  if (
    haystack.includes("customer list") ||
    haystack.includes("security findings") ||
    haystack.includes("corporate org") ||
    haystack.includes("disclosure schedule") ||
    haystack.includes("insurance") ||
    haystack.includes("litigation")
  ) {
    return "HVAC platform · CO";
  }
  return null;
}

function dealTabIdForTitle(title: string): string {
  const key = normalizeDealTitle(title).toLowerCase();
  if (key.includes("big fake")) return "deal-bigfake";
  if (key.includes("pest")) return "deal-pest";
  if (key.includes("hvac")) return "deal-hvac";
  if (key.includes("electrical")) return "deal-electrical";
  if (key.includes("distribution")) return "deal-distribution";
  return `deal-${key.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "workspace"}`;
}

function tabIcon(tab: Tab): IconName {
  if (tab.kind === "deal") return "deal";
  if (tab.kind === "analysis") return "chart";
  if (tab.kind === "files-list") return tab.fileListView === "data-rooms" ? "library" : "doc";
  if (tab.kind === "doc") return "doc";
  if (tab.kind === "marketing-studio") return "doc";
  if (tab.kind === "learn") return "library";
  if (tab.kind === "history") return "history";
  if (tab.kind === "settings") return "settings";
  if (tab.kind === "starter") return "plus";
  return "feed";
}

function tabMeta(tab: Tab, allTabs: Tab[] = [], insideDeal = false): string {
  const dealContext = insideDeal ? null : (owningDealForTab(tab, allTabs)?.title ?? inferredDealNameForTab(tab));
  const withDeal = (label: string) => dealContext ? `${dealContext} · ${label}` : label;
  if (tab.kind === "deal") return "Deal workspace";
  if (tab.kind === "analysis") return withDeal(tab.tool ? `Analysis · ${tab.tool}` : "Analysis canvas");
  if (tab.kind === "files-list") {
    const view: Record<FileListView, string> = {
      all: "All files",
      "deal-libraries": "Deal libraries",
      "needs-action": "Needs action",
      "data-rooms": "Data rooms",
    };
    return view[tab.fileListView ?? "all"];
  }
  if (tab.kind === "doc") return withDeal(docLaneForTab(tab));
  if (tab.kind === "marketing-studio") {
    if (tab.studioView === "collection") return tab.studioCollectionSub ? `Studio · ${tab.studioCollectionSub}` : "Studio collection";
    if (tab.studioView === "canvas") return tab.studioFormat ? `Studio draft · ${tab.studioFormat}` : "Studio draft";
    return "Studio home";
  }
  if (tab.kind === "learn") return tab.section === "pricing" ? "Pricing" : "How it works";
  if (tab.kind === "history") return "Recent activity";
  if (tab.kind === "settings") return "Workspace settings";
  if (tab.kind === "starter") return "New workspace";
  return "Open work";
}

function docLaneForTab(tab: Tab): string {
  const haystack = normalizeTabTitle([
    tab.id,
    tab.title,
    tab.status ?? "",
  ].filter(Boolean).join(" ")).toLowerCase();

  if (haystack.includes("mutual nda")) return "Shared docs · In review";
  if (haystack.includes("countersigned") || haystack.includes("executed") || haystack.includes("signed")) return "Data room · Executed";
  if (
    haystack.includes("customer list") ||
    haystack.includes("security findings") ||
    haystack.includes("corporate org") ||
    haystack.includes("disclosure schedule") ||
    haystack.includes("insurance") ||
    haystack.includes("litigation") ||
    haystack.includes("p&l") ||
    haystack.includes("p-l") ||
    haystack.includes("tax return") ||
    haystack.includes("audited")
  ) {
    return "Data room · Locked artifact";
  }
  if (haystack.includes("qoe")) return "Analysis · QoE Lite";
  if (haystack.includes("buyer fit") || haystack.includes("recast") || haystack.includes("concentration")) return "Private workspace · Analysis";
  if (/\bioi\b/.test(haystack) || /\bloi\b/.test(haystack) || haystack.includes("draft")) return "Private workspace · Draft";
  return tab.status ? `Document · ${tab.status}` : "Document";
}

const S: Record<string, CSSProperties> = {
  rail: {
    flexShrink: 0,
    background: "linear-gradient(180deg, rgba(225,236,247,0.98) 0%, rgba(214,229,242,0.98) 100%)",
    border: "1px solid rgba(197, 214, 230, 0.82)",
    borderRadius: 22,
    display: "flex", flexDirection: "column", height: "100%",
    transition: "width 260ms cubic-bezier(0.16, 1, 0.3, 1)",
    overflow: "hidden",
    position: "relative", zIndex: 5,
    boxShadow: "0 22px 54px rgba(38, 59, 84, 0.10)",
  },
  account: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "12px 14px",
    borderBottom: "1px solid #E1E8F2",
    background: "rgba(248,251,255,0.88)",
  },
  avatar: {
    width: 32, height: 32, borderRadius: 10,
    background: "#1A1918",
    color: "#FFFFFF",
    display: "grid", placeItems: "center",
    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
    letterSpacing: "-0.02em",
    flexShrink: 0,
    boxShadow: "0 8px 18px rgba(26,34,51,0.12)",
  },
  acctName: {
    fontSize: 13, fontWeight: 600, color: "var(--m-on-surface)",
    letterSpacing: "-0.01em",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  acctSub: {
    fontSize: 11.5, color: "var(--m-on-surface-mid)",
    marginTop: 1,
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  chevBtn: {
    all: "unset",
    width: 24, height: 24, borderRadius: 6,
    display: "grid", placeItems: "center",
    color: "var(--m-on-surface-mid)", cursor: "pointer",
    flexShrink: 0,
  },
  modes: { flex: 1, overflow: "auto", padding: "16px 8px 8px" },
  sectionHead: {
    padding: "0 10px 8px",
    fontFamily: "var(--font-mono)", fontSize: 9.5,
    color: "var(--m-on-surface-mid)",
    letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600,
  },
  foot: {
    padding: "8px 8px 12px",
    borderTop: "1px solid #E1E8F2",
    display: "flex", flexDirection: "column", gap: 2,
  },
  menu: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 12, right: 12,
    background: "var(--m-surface-on-light)",
    border: "1px solid #DCE6F1",
    borderRadius: 10,
    boxShadow: "var(--m-elev-3)",
    padding: 4,
    zIndex: 50,
    display: "flex", flexDirection: "column", gap: 1,
  },
  menuItem: {
    all: "unset",
    padding: "8px 10px",
    borderRadius: 6,
    fontSize: 12.5,
    color: "var(--m-on-surface)",
    cursor: "pointer",
    fontWeight: 500,
  },
  menuHeader: { padding: "8px 10px 6px" },
  menuName: { fontSize: 12.5, fontWeight: 600, color: "var(--m-on-surface)" },
  menuEmail: { fontSize: 11, color: "var(--m-on-surface-mid)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  menuDivider: { height: 1, background: "var(--m-outline-var)", margin: "4px 0" },
  menuFooter: { padding: "6px 10px", fontSize: 10.5, color: "var(--m-on-surface-mid)" },
};
