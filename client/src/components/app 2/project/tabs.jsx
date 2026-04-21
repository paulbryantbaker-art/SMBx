/* ═══════════════════════════════════════════════════════════
   Deal tabs — Dia-style vertical pills
   Each tab is a working context (deal | model | compare | scratch | portfolio)
   ═══════════════════════════════════════════════════════════ */

const { useState: tUseState, useRef: tUseRef, useEffect: tUseEffect } = React;

/* Tab kind labels + icons */
const TAB_KIND_META = {
  deal:      { label: 'Deal',      letter: 'D' },
  model:     { label: 'DCF',       letter: 'M' },
  compare:   { label: 'Compare',   letter: 'C' },
  scratch:   { label: 'Scratch',   letter: 'S' },
  portfolio: { label: 'Portfolio', letter: 'P' },
  rundown:   { label: 'Rundown',   letter: 'R' },
  dd:        { label: 'DD',        letter: 'DD' },
  loi:       { label: 'LOI',       letter: 'L' },
};

const TAB_KIND_COLOR = {
  deal: '#0A0A0B',
  model: '#5B8DEF',
  compare: '#A76BEF',
  scratch: '#6B6B70',
  portfolio: '#22A755',
  rundown: '#E8A033',
  dd: '#22A755',
  loi: '#5B8DEF',
};

/* ── Portfolio switcher (popover) ─────────────── */
function PortfolioSwitch({ portfolio, onChange, collapsed }) {
  const [open, setOpen] = tUseState(false);
  const ref = tUseRef(null);
  tUseEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div className="psw" ref={ref}>
      <button className="psw__btn" onClick={() => setOpen(v => !v)} title={portfolio.name}>
        <span className="psw__logo">s</span>
        {!collapsed && <>
          <span className="psw__body">
            <span className="psw__n">{portfolio.name}</span>
            <span className="psw__k">{portfolio.kicker}</span>
          </span>
          <span className="psw__caret">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
          </span>
        </>}
      </button>
      {open && (
        <div className="psw__pop">
          <div className="psw__pop-h">PORTFOLIOS</div>
          {window.PORTFOLIOS.map(p => (
            <button
              key={p.id}
              className={'psw__pop-row' + (p.id === portfolio.id ? ' active' : '')}
              onClick={() => { onChange(p.id); setOpen(false); }}
            >
              <span className="psw__pop-logo">{p.name[0]}</span>
              <span className="psw__pop-body">
                <span className="psw__pop-n">{p.name}</span>
                <span className="psw__pop-k">{p.kicker} · {p.dealIds.length} deals</span>
              </span>
              {p.id === portfolio.id && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 12l5 5 10-10"/></svg>
              )}
            </button>
          ))}
          <div className="psw__pop-sep" />
          <button className="psw__pop-row psw__pop-new">
            <span className="psw__pop-logo psw__pop-logo--new">+</span>
            <span className="psw__pop-body">
              <span className="psw__pop-n">New portfolio</span>
              <span className="psw__pop-k">Create a new workspace</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Single tab pill ──────────────────────────── */
function TabPill({ tab, active, collapsed, onClick, onClose, onDragStart, onDragOver, onDrop, draggingId }) {
  const deal = tab.dealId ? window.DEALS.find(d => d.id === tab.dealId) : null;
  const tone =
    tab.kind === 'compare' ? 'compare' :
    tab.kind === 'model' ? 'model' :
    tab.kind === 'scratch' ? 'scratch' :
    tab.kind === 'portfolio' ? 'portfolio' :
    deal ? deal.tone : 'ok';
  const isDragging = draggingId === tab.id;
  return (
    <div
      className={
        'tab' +
        (active ? ' tab--active' : '') +
        (tab.progress ? ' tab--progress' : '') +
        (isDragging ? ' tab--dragging' : '')
      }
      data-tone={tone}
      draggable
      onDragStart={e => onDragStart(tab.id, e)}
      onDragOver={e => { e.preventDefault(); onDragOver(tab.id); }}
      onDrop={e => { e.preventDefault(); onDrop(tab.id); }}
      onClick={onClick}
    >
      <span className={'tab__glyph tab__glyph--' + tab.kind}>
        {tab.kind === 'deal' && deal && <span className="tab__dot" style={{ background: deal.tone === 'ok' ? '#22A755' : deal.tone === 'warn' ? '#E8A033' : '#D4533A' }} />}
        {tab.kind === 'model' && 'ƒ'}
        {tab.kind === 'compare' && '⇌'}
        {tab.kind === 'scratch' && '¶'}
        {tab.kind === 'portfolio' && '◇'}
        {(tab.kind === 'rundown' || tab.kind === 'dd' || tab.kind === 'loi') && TAB_KIND_META[tab.kind].letter}
      </span>
      {!collapsed && (
        <span className="tab__body">
          <span className="tab__t">{tab.label}</span>
          {tab.sub && <span className="tab__s">{tab.sub}</span>}
        </span>
      )}
      {tab.progress && !collapsed && (
        <span className="tab__spin">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M12 2a10 10 0 1 0 10 10" />
          </svg>
        </span>
      )}
      {!collapsed && (
        <span
          role="button"
          tabIndex={0}
          className="tab__x"
          onClick={e => { e.stopPropagation(); onClose(tab.id); }}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onClose(tab.id); } }}
          title="Close tab"
        >×</span>
      )}
    </div>
  );
}

/* ── Tab list (vertical) ──────────────────────── */
function TabList({ tabs, activeTabId, onSwitch, onClose, onReorder, collapsed }) {
  const [draggingId, setDraggingId] = tUseState(null);
  const handleDragStart = id => setDraggingId(id);
  const handleDragOver = id => {
    if (!draggingId || draggingId === id) return;
    onReorder(draggingId, id);
  };
  const handleDrop = () => setDraggingId(null);
  return (
    <div className="tabs" onDragEnd={() => setDraggingId(null)}>
      {tabs.map(t => (
        <TabPill
          key={t.id}
          tab={t}
          active={t.id === activeTabId}
          collapsed={collapsed}
          onClick={() => onSwitch(t.id)}
          onClose={onClose}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          draggingId={draggingId}
        />
      ))}
      {tabs.length === 0 && !collapsed && (
        <div className="tabs__empty">
          <div className="tabs__empty-t">No tabs open</div>
          <div className="tabs__empty-s">Click a deal below or ask Yulia to start working.</div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { PortfolioSwitch, TabList, TAB_KIND_META, TAB_KIND_COLOR });
