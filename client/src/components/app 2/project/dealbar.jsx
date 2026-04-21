/* ═══════════════════════════════════════════════════════════
   Dealbar (left) — replaces old LeftRail
   Contains: Portfolio switcher · Vertical deal tabs · Deals shortlist · User footer
   ═══════════════════════════════════════════════════════════ */

const { useState: dbUseState, useEffect: dbUseEffect, useMemo: dbUseMemo } = React;

const DB_IC = {
  plus: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>,
  search: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>,
  collapse: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></svg>,
  compare: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 4v16M17 4v16M3 8h4M17 8h4M3 16h4M17 16h4"/></svg>,
  portfolio: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
};

function Dealbar({
  portfolio, onPortfolioChange,
  tabs, activeTabId, onSwitchTab, onCloseTab, onReorderTabs, onOpenTab,
  collapsed, onToggleCollapse,
}) {
  const portDeals = dbUseMemo(
    () => window.DEALS.filter(d => portfolio.dealIds.includes(d.id)),
    [portfolio]
  );
  const [showAllDeals, setShowAllDeals] = dbUseState(true);

  /* Quick-open: clicking a deal opens its tab if not already open */
  const openDealTab = d => {
    onOpenTab({ kind: 'deal', dealId: d.id, label: d.name, sub: d.kicker });
  };
  const openComparePrompt = () => {
    const live = portDeals.filter(d => d.score).slice(0, 3);
    if (live.length >= 2) {
      onOpenTab({
        kind: 'compare',
        dealIds: live.map(d => d.id),
        label: `Compare · ${live.map(d => d.name.split(' ')[0]).join(' + ')}`,
      });
    }
  };
  const openPortfolioTab = () => {
    onOpenTab({ kind: 'portfolio', label: `${portfolio.name} · Overview` });
  };

  const openDealIds = new Set(tabs.filter(t => t.kind === 'deal').map(t => t.dealId));

  return (
    <aside className={'dbar pane' + (collapsed ? ' dbar--collapsed' : '')}>
      <div className="dbar__head">
        <PortfolioSwitch portfolio={portfolio} onChange={onPortfolioChange} collapsed={collapsed} />
        {!collapsed && (
          <button className="dbar__collapse" onClick={onToggleCollapse} title="Collapse dealbar">
            {DB_IC.collapse}
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="dbar__actions">
          <button className="dbar__action" onClick={openPortfolioTab} title="Portfolio overview">
            {DB_IC.portfolio}<span>Portfolio</span>
          </button>
          <button className="dbar__action" onClick={openComparePrompt} title="Compare 3 live deals">
            {DB_IC.compare}<span>Compare</span>
          </button>
        </div>
      )}

      {!collapsed && (
        <div className="dbar__sec">
          <div className="dbar__sec-h">
            <span>Open tabs</span>
            <span className="dbar__sec-c">{tabs.length}</span>
          </div>
        </div>
      )}

      <div className="dbar__tabs">
        <TabList
          tabs={tabs}
          activeTabId={activeTabId}
          onSwitch={onSwitchTab}
          onClose={onCloseTab}
          onReorder={onReorderTabs}
          collapsed={collapsed}
        />
      </div>

      {!collapsed && (
        <>
          <div className="dbar__sec dbar__sec--deals">
            <div className="dbar__sec-h">
              <span>Deals in {portfolio.name}</span>
              <span className="dbar__sec-c">{portDeals.length}</span>
            </div>
          </div>
          <div className="dbar__deals">
            {portDeals.map(d => {
              const isOpen = openDealIds.has(d.id);
              return (
                <button
                  key={d.id}
                  className={'dbar__deal' + (isOpen ? ' dbar__deal--open' : '')}
                  onClick={() => openDealTab(d)}
                >
                  <span className={`dbar__deal-dot dbar__deal-dot--${d.tone}`} />
                  <span className="dbar__deal-body">
                    <span className="dbar__deal-n">{d.name}</span>
                    <span className="dbar__deal-s">{d.kicker}</span>
                  </span>
                  {isOpen
                    ? <span className="dbar__deal-badge" title="Already open as tab">●</span>
                    : <span className="dbar__deal-k">{d.lastUpdate}</span>
                  }
                </button>
              );
            })}
          </div>
        </>
      )}

      {collapsed && (
        <div className="dbar__expand">
          <button onClick={onToggleCollapse} title="Expand">
            {DB_IC.collapse}
          </button>
        </div>
      )}

      <div className="dbar__user">
        <div className="dbar__avatar">M</div>
        {!collapsed && (
          <div className="dbar__user-body">
            <div className="dbar__user-t">Marcus Delgado</div>
            <div className="dbar__user-s">PRO</div>
          </div>
        )}
      </div>
    </aside>
  );
}

Object.assign(window, { Dealbar });
