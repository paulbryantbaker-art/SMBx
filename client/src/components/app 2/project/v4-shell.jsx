/* ═══════════════════════════════════════════════════════════
   v4-canvas.jsx — Floating canvas card with breadcrumb + two pills
   Reuses v3-canvas body content (tab renderers) since they're pure data
   ═══════════════════════════════════════════════════════════ */

function V4CanvasBody({ tab, portfolio, onOpenDeal }) {
  if (!tab) {
    return (
      <div className="v4-canvas__empty">
        <div className="v4-canvas__empty-logo">smbx.ai</div>
        <div className="v4-canvas__empty-t">No document open</div>
        <div className="v4-canvas__empty-s">Ask Yulia to open a rundown, DCF, LOI or compare — or pick one from the tab strip on the right.</div>
      </div>
    );
  }
  const deal = tab.dealId ? window.DEALS.find(d => d.id === tab.dealId) : null;
  if (tab.kind === 'compare' && window.CompareView) return <window.CompareView dealIds={tab.dealIds || []} onOpenDeal={onOpenDeal} />;
  if (tab.kind === 'portfolio' && window.PortfolioView) return <window.PortfolioView portfolio={portfolio} />;
  if (tab.kind === 'library' && window.LibraryView) return <window.LibraryView portfolio={portfolio} onOpenDeal={onOpenDeal} />;
  if (tab.kind === 'scratch' && window.ScratchView) return <window.ScratchView tab={tab} />;
  if (tab.kind === 'model' && window.DCFView) return <window.DCFView deal={deal} />;
  if (tab.kind === 'rundown' && window.RundownCard) return <div style={{ maxWidth: 720 }}><window.RundownCard deal={deal} /></div>;
  if (tab.kind === 'dd' && window.DDCard) return <div style={{ maxWidth: 720 }}><window.DDCard deal={deal} /></div>;
  if (tab.kind === 'loi' && window.LOICard) return <div style={{ maxWidth: 720 }}><window.LOICard deal={deal} /></div>;
  if (deal && window.DashboardView) return <window.DashboardView deal={deal} />;
  return (
    <div className="v4-canvas__empty">
      <div className="v4-canvas__empty-t">{tab.label}</div>
      <div className="v4-canvas__empty-s">{tab.sub || ''}</div>
    </div>
  );
}

function V4Canvas({ tab, portfolio, onCloseTab, onFullscreen, onOpenModule, onOpenDeal }) {
  const crumbKind = tab ? (tab.kind || '').toUpperCase() : 'CANVAS';
  const crumbTitle = tab ? tab.label : 'Nothing open';
  const crumbSub = tab ? (tab.sub || '') : '';

  return (
    <div className="v4-canvas-wrap">
      <div className="v4-canvas">
        <V4Top portfolio={portfolio} onOpenModule={onOpenModule} onOpenDeal={onOpenDeal} />
        <div className="v4-canvas__head">
          <div className="v4-canvas__crumb">
            <span className="v4-canvas__crumb-k">{portfolio.name}</span>
            <span className="v4-canvas__crumb-sep">/</span>
            <span className="v4-canvas__crumb-k">{crumbKind}</span>
            <span className="v4-canvas__crumb-sep">/</span>
            <span className="v4-canvas__crumb-t">{crumbTitle}</span>
            {crumbSub && <span className="v4-canvas__crumb-badge">{crumbSub}</span>}
          </div>
        </div>

        {tab && (
          <>
            <div className="v4-cpill v4-cpill--left">
              <button className="v4-cpill__btn" title="Share">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>
              </button>
              <button className="v4-cpill__btn" title="Export">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5-5 5 5M12 5v12"/></svg>
              </button>
              <button className="v4-cpill__btn" title="Print">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/></svg>
              </button>
              <span className="v4-cpill__sep" />
              <button className="v4-cpill__btn v4-cpill__btn--label" title="Version">v1.3</button>
            </div>

            <div className="v4-cpill v4-cpill--right">
              <button className="v4-cpill__btn" title="Fullscreen" onClick={onFullscreen}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
              </button>
              <button className="v4-cpill__btn" title="More">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
              </button>
              <span className="v4-cpill__sep" />
              <button className="v4-cpill__btn" title="Close" onClick={() => onCloseTab(tab.id)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </>
        )}

        <div className="v4-canvas__body">
          <V4CanvasBody tab={tab} portfolio={portfolio} onOpenDeal={onOpenDeal} />
        </div>
      </div>
      <V4DealMessages />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   v4-rail.jsx — Vertical tab strip (grouped by type) + actions block
   ═══════════════════════════════════════════════════════════ */

const V4_TAB_KIND = {
  deal:     { group: 'Deals',     glyph: 'D', label: 'Deal' },
  rundown:  { group: 'Analyses',  glyph: 'R', label: 'Rundown' },
  model:    { group: 'Analyses',  glyph: 'M', label: 'DCF' },
  dcf:      { group: 'Analyses',  glyph: 'M', label: 'DCF' },
  compare:  { group: 'Compare',   glyph: 'C', label: 'Compare' },
  dd:       { group: 'Docs',      glyph: 'D', label: 'DD pack' },
  loi:      { group: 'Docs',      glyph: 'L', label: 'LOI' },
  memo:     { group: 'Docs',      glyph: 'M', label: 'Memo' },
  chart:    { group: 'Analyses',  glyph: 'C', label: 'Chart' },
  doc:      { group: 'Docs',      glyph: '·', label: 'Doc' },
  library:  { group: 'Modules',   glyph: 'L', label: 'Library' },
  portfolio:{ group: 'Modules',   glyph: 'P', label: 'Portfolio' },
  deals:    { group: 'Modules',   glyph: 'D', label: 'Deals' },
  sourcing: { group: 'Modules',   glyph: 'S', label: 'Sourcing' },
};
const V4_GROUP_ORDER = ['Modules', 'Deals', 'Analyses', 'Docs', 'Compare'];

function V4Rail({ tabs, activeTabId, onSwitch, onClose, onReorder, onCollapse, expanded, onNewTab, onFullscreen }) {
  const [draggingId, setDraggingId] = v4cUseState(null);
  const [overId, setOverId] = v4cUseState(null);

  const byGroup = {};
  V4_GROUP_ORDER.forEach(g => byGroup[g] = []);
  tabs.forEach(t => {
    const k = V4_TAB_KIND[t.kind] || V4_TAB_KIND.doc;
    byGroup[k.group].push(t);
  });

  if (!expanded) {
    // Collapsed: narrow icon strip, mirrors left tool rail
    return (
      <aside className="v4-rail v4-rail--collapsed" role="toolbar">
        <button className="v4-rail__collapse-btn" onClick={onCollapse} title="Expand tab strip">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="v4-rail__collapse-sep" />
        <div className="v4-rail__collapse-list">
          {tabs.map(t => {
            const k = V4_TAB_KIND[t.kind] || V4_TAB_KIND.doc;
            return (
              <button
                key={t.id}
                className={'v4-rail__collapse-tab' + (t.id === activeTabId ? ' v4-rail__collapse-tab--active' : '')}
                onClick={() => onSwitch(t.id)}
                data-tip={t.label}
              >
                <span className="v4-rail__collapse-tab-ic">{k.glyph}</span>
              </button>
            );
          })}
          <button className="v4-rail__collapse-tab v4-rail__collapse-tab--new" onClick={onNewTab} data-tip="New tab">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="v4-rail">
      <div className="v4-rail__head">
        <span className="v4-rail__head-t">Open</span>
        <span className="v4-rail__head-c">{tabs.length}</span>
        <button className="v4-rail__head-btn" title="New tab" onClick={onNewTab}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
        </button>
        <button className="v4-rail__head-btn" title="Collapse" onClick={onCollapse}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      <div className="v4-rail__groups">
        {V4_GROUP_ORDER.map(g => {
          const list = byGroup[g];
          if (!list.length) return null;
          return (
            <div key={g} className="v4-rail__group">
              <div className="v4-rail__group-h">
                {g}
                <span className="v4-rail__group-c">{list.length}</span>
              </div>
              {list.map(t => {
                const k = V4_TAB_KIND[t.kind] || V4_TAB_KIND.doc;
                return (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={() => setDraggingId(t.id)}
                    onDragOver={e => { e.preventDefault(); setOverId(t.id); }}
                    onDragEnd={() => { setDraggingId(null); setOverId(null); }}
                    onDrop={e => { e.preventDefault(); if (draggingId && draggingId !== t.id) onReorder(draggingId, t.id); setDraggingId(null); setOverId(null); }}
                    className={
                      'v4-tab' +
                      (t.id === activeTabId ? ' v4-tab--active' : '') +
                      (draggingId === t.id ? ' v4-tab--dragging' : '') +
                      (overId === t.id && draggingId && draggingId !== t.id ? ' v4-tab--over' : '')
                    }
                    onClick={() => onSwitch(t.id)}
                  >
                    <div className="v4-tab__ico">{k.glyph}</div>
                    <div className="v4-tab__body">
                      <div className="v4-tab__t">{t.label}</div>
                      <div className="v4-tab__s">{t.sub || k.label}</div>
                    </div>
                    <button className="v4-tab__x" onClick={e => { e.stopPropagation(); onClose(t.id); }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}
        {tabs.length === 0 && (
          <div style={{ padding: '24px 12px', fontSize: 12, color: 'var(--v4-mute)', lineHeight: 1.5 }}>
            No open documents yet. Ask Yulia or click <strong>+</strong> above to add one.
          </div>
        )}
      </div>
    </aside>
  );
}

/* ═══════════════════════════════════════════════════════════
   v4-top.jsx — Top-right floating action bar (modules + notifications + account)
   ═══════════════════════════════════════════════════════════ */

const V4_NOTIFS = [
  { id: 1, unread: true, who: 'LS', t: '<strong>Lena Sato</strong> shared the Atlas DD pack with you', meta: 'Atlas · 4m ago' },
  { id: 2, unread: true, who: 'JM', t: '<strong>Jordan Mercer</strong> left 3 comments on Benchmark · LOI', meta: 'Benchmark · 28m ago' },
  { id: 3, unread: false, who: 'KR', t: '<strong>Kira Reyes</strong> approved your Summit memo', meta: 'Summit · 2h ago' },
  { id: 4, unread: false, who: 'DP', t: '<strong>Diego Park</strong> updated the Ridge forecast · Q4 revised +3.1%', meta: 'Ridge · yesterday' },
];

function V4Top({ onOpenModule, portfolio, onOpenDeal }) {
  const [notifOpen, setNotifOpen] = v4cUseState(false);
  const [dealsOpen, setDealsOpen] = v4cUseState(false);
  const notifRef = v4cUseRef(null);
  const dealsRef = v4cUseRef(null);
  v4cUseEffect(() => {
    if (!notifOpen) return;
    const h = e => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [notifOpen]);
  v4cUseEffect(() => {
    if (!dealsOpen) return;
    const h = e => { if (dealsRef.current && !dealsRef.current.contains(e.target)) setDealsOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [dealsOpen]);
  const unread = V4_NOTIFS.filter(n => n.unread).length;
  const portDeals = (portfolio && window.DEALS) ? window.DEALS.filter(d => portfolio.dealIds.includes(d.id)) : [];
  return (
    <div className="v4-top">
      <div className="v4-top__group">
        <button className="v4-top__btn" onClick={() => onOpenModule('portfolio')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          Portfolio
        </button>
        <div ref={dealsRef} style={{ position: 'relative', display: 'inline-flex' }}>
          <button className={'v4-top__btn' + (dealsOpen ? ' v4-top__btn--active' : '')} onClick={() => setDealsOpen(o => !o)} data-badge={portDeals.length || undefined}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-7l-2-3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/></svg>
            Deals
          </button>
          {dealsOpen && (
            <div className="v4-deals-pop">
              <div className="v4-deals-pop__head">
                <div className="v4-deals-pop__head-t">Deals in {portfolio ? portfolio.name : 'portfolio'}</div>
                <div className="v4-deals-pop__head-b">{portDeals.length} ACTIVE</div>
              </div>
              <div className="v4-deals-pop__list">
                {portDeals.map(d => (
                  <button
                    key={d.id}
                    className="v4-deals-pop__row"
                    onClick={() => { onOpenDeal && onOpenDeal(d); setDealsOpen(false); }}
                  >
                    <div className={'v4-deals-pop__row-dot v4-deals-pop__row-dot--' + (d.tone || 'ok')} />
                    <div className="v4-deals-pop__row-body">
                      <div className="v4-deals-pop__row-t">{d.name}</div>
                      <div className="v4-deals-pop__row-s">{d.kicker || d.stage || ''}</div>
                    </div>
                    {d.score != null && <div className="v4-deals-pop__row-score">{d.score}</div>}
                  </button>
                ))}
              </div>
              <div className="v4-deals-pop__foot">
                <button className="v4-deals-pop__foot-btn" onClick={() => { onOpenModule('compare'); setDealsOpen(false); }}>Compare live deals →</button>
              </div>
            </div>
          )}
        </div>
        <button className="v4-top__btn" onClick={() => onOpenModule('sourcing')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          Sourcing
        </button>
        <button className="v4-top__btn" onClick={() => onOpenModule('compare')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>
          Compare
        </button>
        <button className="v4-top__btn" onClick={() => onOpenModule('library')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          Library
        </button>
      </div>

      <div className="v4-top__right">
        <div className="v4-top__group" ref={notifRef} style={{ position: 'relative' }}>
        <button className="v4-top__btn" title="Search">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        </button>
        <button className="v4-top__btn" title="Notifications" onClick={() => setNotifOpen(o => !o)} data-badge={unread || undefined}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </button>
        {notifOpen && (
          <div className="v4-notif">
            <div className="v4-notif__head">
              <div className="v4-notif__head-t">Notifications</div>
              <div className="v4-notif__head-b">{unread} NEW</div>
            </div>
            <div className="v4-notif__list">
              {V4_NOTIFS.map(n => (
                <button key={n.id} className={'v4-notif__row' + (n.unread ? ' v4-notif__row--unread' : '')}>
                  <div className="v4-notif__row-av">{n.who}</div>
                  <div className="v4-notif__row-body">
                    <div className="v4-notif__row-t" dangerouslySetInnerHTML={{ __html: n.t }} />
                    <div className="v4-notif__row-meta">{n.meta}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <button className="v4-top__avatar" title="Account" style={{ display: 'none' }}>P</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   v4-dm.jsx — Deal Messages dock (bottom-right Gmail style)
   ═══════════════════════════════════════════════════════════ */

const V4_DM_THREADS = [
  { id: 1, who: 'SK', name: 'Sarah Kim (Atlas Air, CFO)', unread: true, sub: '"Happy to share the Q3 figures — attaching the revised deck."', when: '12m', tag: 'ATLAS · EMAIL' },
  { id: 2, who: 'JM', name: 'Jordan Mercer', unread: true, sub: 'Left 3 comments on the LOI draft — can you ping back on concentration?', when: '1h', tag: 'BENCHMARK · IN-APP' },
  { id: 3, who: 'LS', name: 'Lena Sato', unread: false, sub: 'Shared the DD pack — 38/42 items cleared.', when: '3h', tag: 'ATLAS · IN-APP' },
  { id: 4, who: 'RT', name: 'Robert Tan (Summit, CEO)', unread: false, sub: '"Let me know what works for a follow-up next Tue."', when: 'yesterday', tag: 'SUMMIT · EMAIL' },
];

function V4DealMessages() {
  const [open, setOpen] = v4cUseState(false);
  const unread = V4_DM_THREADS.filter(t => t.unread).length;
  return (
    <div className={'v4-dm' + (open ? '' : ' v4-dm--mini')}>
      <div className="v4-dm__head" onClick={() => setOpen(o => !o)}>
        <div className="v4-dm__head-ico">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="m22 6-10 7L2 6"/></svg>
        </div>
        <div className="v4-dm__head-t">Deal messages</div>
        {unread > 0 && <div className="v4-dm__head-b">{unread}</div>}
        <button className="v4-dm__head-btn" onClick={e => { e.stopPropagation(); setOpen(o => !o); }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="m18 15-6-6-6 6"/> : <path d="m6 9 6 6 6-6"/>}
          </svg>
        </button>
      </div>
      {open && (
        <div className="v4-dm__body">
          {V4_DM_THREADS.map(t => (
            <button key={t.id} className="v4-dm__thread">
              <div className={'v4-dm__thread-av' + (t.unread ? ' v4-dm__thread-av--unread' : '')}>{t.who}</div>
              <div className="v4-dm__thread-body">
                <div className="v4-dm__thread-line1">
                  <div className="v4-dm__thread-n">{t.name}</div>
                  <div className="v4-dm__thread-w">{t.when}</div>
                </div>
                <div className="v4-dm__thread-sub">{t.sub}</div>
                <div className="v4-dm__thread-tag">{t.tag}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { V4Canvas, V4Rail, V4Top, V4DealMessages });
