/* ═══════════════════════════════════════════════════════════
   v3-rail.jsx — RIGHT PANE (Dia-style vertical tabs)
   Documents/analyses list · deal quick-access footer
   ═══════════════════════════════════════════════════════════ */

const { useState: rUseState, useRef: rUseRef, useEffect: rUseEffect } = React;

/* Tab glyph character per kind */
const V3_TAB_GLYPH = {
  deal:      '◆',
  model:     'ƒ',
  compare:   '⇌',
  scratch:   '¶',
  portfolio: '◇',
  rundown:   'R',
  dd:        'DD',
  loi:       'L',
  document:  '▦',
};

function V3TabPill({ tab, active, onClick, onClose, onDragStart, onDragOver, onDrop, draggingId }) {
  const deal = tab.dealId ? window.DEALS.find(d => d.id === tab.dealId) : null;
  const isDragging = draggingId === tab.id;

  return (
    <div
      className={
        'v3-tab' +
        (active ? ' v3-tab--active' : '') +
        (tab.progress ? ' v3-tab--progress' : '') +
        (isDragging ? ' v3-tab--dragging' : '')
      }
      draggable
      onDragStart={e => onDragStart(tab.id, e)}
      onDragOver={e => { e.preventDefault(); onDragOver(tab.id); }}
      onDrop={e => { e.preventDefault(); onDrop(tab.id); }}
      onClick={onClick}
    >
      <span className={'v3-tab__glyph v3-tab__glyph--' + tab.kind}>
        {V3_TAB_GLYPH[tab.kind] || 'D'}
        {deal && (
          <span
            className="v3-tab__dot"
            style={{ background: deal.tone === 'ok' ? 'var(--v3-ok)' : deal.tone === 'warn' ? 'var(--v3-warn)' : 'var(--v3-flag)' }}
          />
        )}
      </span>
      <span className="v3-tab__body">
        <span className="v3-tab__t">{tab.label}</span>
        {tab.sub && <span className="v3-tab__s">{tab.sub}</span>}
      </span>
      {tab.progress && (
        <span className="v3-tab__spin">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M12 2a10 10 0 1 0 10 10"/>
          </svg>
        </span>
      )}
      <button
        className="v3-tab__x"
        onClick={e => { e.stopPropagation(); onClose(tab.id); }}
        title="Close tab"
      >×</button>
    </div>
  );
}

/* Deals popover — quick-access to deals in the portfolio */
function V3DealsPopover({ portfolio, openDealIds, onOpenDeal, onClose }) {
  const portDeals = window.DEALS.filter(d => portfolio.dealIds.includes(d.id));
  const ref = rUseRef(null);
  rUseEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    setTimeout(() => document.addEventListener('mousedown', h), 20);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);
  return (
    <div className="v3-deals" ref={ref}>
      <div className="v3-deals__head">
        <div className="v3-deals__head-t">Deals in {portfolio.name}</div>
        <button className="v3-deals__head-x" onClick={onClose}>×</button>
      </div>
      <div className="v3-deals__list">
        {portDeals.map(d => {
          const isOpen = openDealIds.has(d.id);
          return (
            <button
              key={d.id}
              className={'v3-deals__row' + (isOpen ? ' v3-deals__row--open' : '')}
              onClick={() => { onOpenDeal(d); onClose(); }}
            >
              <span className={'v3-deals__dot v3-deals__dot--' + d.tone} />
              <span className="v3-deals__body">
                <span className="v3-deals__n">{d.name}</span>
                <span className="v3-deals__s">{d.kicker}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Right tab rail ──────────────────────────── */
function V3Rail({
  portfolio,
  tabs, activeTabId, onSwitch, onClose, onReorder, onOpenDeal, onOpenPortfolio, onOpenCompare,
  visible, onToggleVisible,
}) {
  const [draggingId, setDraggingId] = rUseState(null);
  const [dealsOpen, setDealsOpen] = rUseState(false);

  const openDealIds = new Set(tabs.filter(t => t.kind === 'deal').map(t => t.dealId));

  return (
    <aside className="v3-rail">
      <div className="v3-rail__head">
        <div className="v3-rail__head-t">Documents</div>
        <div className="v3-rail__head-c">{tabs.length}</div>
        <button className="v3-rail__head-btn" onClick={onToggleVisible} title="Hide panel">
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>

      <div className="v3-rail__body">
        {tabs.length === 0 ? (
          <div className="v3-rail__empty">
            <div className="v3-rail__empty-ic">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
            </div>
            <div className="v3-rail__empty-t">No documents yet</div>
            <div className="v3-rail__empty-s">Ask Yulia for a Rundown, DCF, LOI draft… it'll open here.</div>
          </div>
        ) : (
          <div className="v3-tabs" onDragEnd={() => setDraggingId(null)}>
            {tabs.map(t => (
              <V3TabPill
                key={t.id}
                tab={t}
                active={t.id === activeTabId}
                onClick={() => onSwitch(t.id)}
                onClose={onClose}
                onDragStart={id => setDraggingId(id)}
                onDragOver={id => { if (draggingId && draggingId !== id) onReorder(draggingId, id); }}
                onDrop={() => setDraggingId(null)}
                draggingId={draggingId}
              />
            ))}
          </div>
        )}
      </div>

      <div className="v3-rail__footer">
        <button className="v3-rail__footer-btn" onClick={onOpenPortfolio}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          Portfolio
        </button>
        <button className="v3-rail__footer-btn" onClick={() => setDealsOpen(v => !v)}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-3V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v3H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/></svg>
          Deals
        </button>
        <button className="v3-rail__footer-btn" onClick={onOpenCompare}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 4v16M17 4v16M3 8h4M17 8h4M3 16h4M17 16h4"/></svg>
          Compare
        </button>
      </div>

      {dealsOpen && (
        <V3DealsPopover
          portfolio={portfolio}
          openDealIds={openDealIds}
          onOpenDeal={onOpenDeal}
          onClose={() => setDealsOpen(false)}
        />
      )}
    </aside>
  );
}

Object.assign(window, { V3Rail, V3TabPill, V3_TAB_GLYPH });
