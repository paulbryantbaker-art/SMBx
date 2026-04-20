/* ═══════════════════════════════════════════════════════════
   v4-library.jsx — Library module
   Side-nav: All · Data rooms · My docs · Shared · Templates
   Data rooms nested Portfolio > Deal, with To review / Action / Sealed.
   ═══════════════════════════════════════════════════════════ */

const { useState: vlUseState, useMemo: vlUseMemo } = React;

/* ── Icons ────────────────────────────────────────── */
const VL_IC = {
  all:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>,
  room:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><rect x="9" y="12" width="6" height="4" rx="0.5"/></svg>,
  mine:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>,
  shared:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="3"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><circle cx="17" cy="9" r="2.5"/><path d="M15 14h4a2 2 0 0 1 2 2v1"/></svg>,
  template: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  pdf:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>,
  xls:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 9h18M9 4v16M15 4v16"/></svg>,
  doc:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></svg>,
  zip:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v4M12 11v2M12 17v2"/></svg>,
  chev:     <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>,
  plus:     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  sparkles: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4 12H2M22 12h-2M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/><circle cx="12" cy="12" r="3"/></svg>,
};

const VL_KIND_IC = { pdf: VL_IC.pdf, spreadsheet: VL_IC.xls, doc: VL_IC.doc, zip: VL_IC.zip };

/* ── Root ─────────────────────────────────────────── */
function LibraryView({ portfolio, onOpenDeal }) {
  // section: all | rooms | mine | shared | templates
  // when section === 'rooms', roomDealId filters to one deal, else shows tree overview
  const [section, setSection] = vlUseState('rooms');
  const [roomDealId, setRoomDealId] = vlUseState(null);
  const [query, setQuery] = vlUseState('');

  const portDeals = window.DEALS.filter(d => portfolio.dealIds.includes(d.id));
  const rooms     = window.DATA_ROOMS || [];
  const mine      = window.MY_DOCS || [];
  const shared    = window.SHARED_DOCS || [];
  const templates = window.TEMPLATES || [];

  const portRoomItems = rooms.filter(r => portfolio.dealIds.includes(r.dealId));

  // Counts for nav badges
  const counts = vlUseMemo(() => ({
    all: portRoomItems.length + mine.length + shared.length,
    rooms: portRoomItems.length,
    roomsReview: portRoomItems.filter(r => r.status === 'review').length,
    roomsAction: portRoomItems.filter(r => r.status === 'action').length,
    mine: mine.filter(m => !m.dealId || portfolio.dealIds.includes(m.dealId)).length,
    shared: shared.length,
    sharedUnread: shared.filter(s => s.unread).length,
    templates: templates.length,
  }), [portRoomItems, mine, shared, templates, portfolio]);

  return (
    <div className="vlib">
      <VLibSide
        section={section}
        onSection={s => { setSection(s); setRoomDealId(null); }}
        portfolio={portfolio}
        portDeals={portDeals}
        roomDealId={roomDealId}
        onPickRoomDeal={did => { setSection('rooms'); setRoomDealId(did); }}
        counts={counts}
        rooms={portRoomItems}
      />
      <div className="vlib__main">
        <VLibToolbar
          section={section}
          roomDeal={roomDealId ? window.DEALS.find(d => d.id === roomDealId) : null}
          query={query} onQuery={setQuery}
          portfolio={portfolio}
        />
        <div className="vlib__body">
          {section === 'all' && (
            <VLibAll portfolio={portfolio} portDeals={portDeals} rooms={portRoomItems} mine={mine} shared={shared} query={query} />
          )}
          {section === 'rooms' && !roomDealId && (
            <VLibRoomsOverview portfolio={portfolio} portDeals={portDeals} rooms={portRoomItems} onPickDeal={did => setRoomDealId(did)} onOpenDeal={onOpenDeal} />
          )}
          {section === 'rooms' && roomDealId && (
            <VLibRoom deal={window.DEALS.find(d => d.id === roomDealId)} rooms={rooms.filter(r => r.dealId === roomDealId)} query={query} onBack={() => setRoomDealId(null)} />
          )}
          {section === 'mine' && (
            <VLibMine portfolio={portfolio} portDeals={portDeals} docs={mine} query={query} />
          )}
          {section === 'shared' && (
            <VLibShared docs={shared} query={query} />
          )}
          {section === 'templates' && (
            <VLibTemplates templates={templates} query={query} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Side nav ─────────────────────────────────────── */
function VLibSide({ section, onSection, portfolio, portDeals, roomDealId, onPickRoomDeal, counts, rooms }) {
  const [roomsOpen, setRoomsOpen] = vlUseState(true);
  return (
    <aside className="vlib__side">
      <div className="vlib__side-h">Library</div>

      <button className={'vlib__nav' + (section === 'all' ? ' vlib__nav--on' : '')} onClick={() => onSection('all')}>
        <span className="vlib__nav-i">{VL_IC.all}</span>
        <span className="vlib__nav-t">All documents</span>
        <span className="vlib__nav-c">{counts.all}</span>
      </button>

      <div className="vlib__sect">
        <button
          className={'vlib__nav vlib__nav--parent' + (section === 'rooms' && !roomDealId ? ' vlib__nav--on' : '')}
          onClick={() => { onSection('rooms'); setRoomsOpen(o => !o); }}
        >
          <span className={'vlib__nav-chev' + (roomsOpen ? ' vlib__nav-chev--open' : '')}>{VL_IC.chev}</span>
          <span className="vlib__nav-i">{VL_IC.room}</span>
          <span className="vlib__nav-t">Data rooms</span>
          <span className="vlib__nav-c">{counts.rooms}</span>
        </button>
        {roomsOpen && (
          <div className="vlib__tree">
            <div className="vlib__tree-port">
              <span className="vlib__tree-port-dot" />
              {portfolio.name}
            </div>
            {portDeals.map(d => {
              const dealRooms = rooms.filter(r => r.dealId === d.id);
              const review = dealRooms.filter(r => r.status === 'review').length;
              const action = dealRooms.filter(r => r.status === 'action').length;
              return (
                <button
                  key={d.id}
                  className={'vlib__tree-deal' + (roomDealId === d.id ? ' vlib__tree-deal--on' : '')}
                  onClick={() => onPickRoomDeal(d.id)}
                >
                  <span className={'vlib__tree-deal-dot vlib__tree-deal-dot--' + (d.tone || 'ok')} />
                  <span className="vlib__tree-deal-t">{d.name}</span>
                  <span className="vlib__tree-deal-n">{dealRooms.length}</span>
                  {(review > 0 || action > 0) && (
                    <span className="vlib__tree-deal-flags">
                      {action > 0 && <span className="vlib__flag vlib__flag--action" title={`${action} to action`}>{action}</span>}
                      {review > 0 && <span className="vlib__flag vlib__flag--review" title={`${review} to review`}>{review}</span>}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button className={'vlib__nav' + (section === 'mine' ? ' vlib__nav--on' : '')} onClick={() => onSection('mine')}>
        <span className="vlib__nav-i">{VL_IC.mine}</span>
        <span className="vlib__nav-t">My documents</span>
        <span className="vlib__nav-c">{counts.mine}</span>
      </button>

      <button className={'vlib__nav' + (section === 'shared' ? ' vlib__nav--on' : '')} onClick={() => onSection('shared')}>
        <span className="vlib__nav-i">{VL_IC.shared}</span>
        <span className="vlib__nav-t">Shared with me</span>
        {counts.sharedUnread > 0
          ? <span className="vlib__nav-c vlib__nav-c--hot">{counts.sharedUnread}</span>
          : <span className="vlib__nav-c">{counts.shared}</span>}
      </button>

      <div className="vlib__side-sep" />

      <button className={'vlib__nav' + (section === 'templates' ? ' vlib__nav--on' : '')} onClick={() => onSection('templates')}>
        <span className="vlib__nav-i">{VL_IC.template}</span>
        <span className="vlib__nav-t">Templates</span>
        <span className="vlib__nav-c">{counts.templates}</span>
      </button>

      <div className="vlib__side-ft">
        <div className="vlib__side-ft-k">Data rooms</div>
        <div className="vlib__side-ft-t">{counts.roomsAction + counts.roomsReview} items need attention across {portfolio.name}</div>
      </div>
    </aside>
  );
}

/* ── Top toolbar of main pane ─────────────────────── */
function VLibToolbar({ section, roomDeal, query, onQuery, portfolio }) {
  const title = roomDeal ? `${roomDeal.name} · Data room`
    : section === 'all' ? 'All documents'
    : section === 'rooms' ? 'Data rooms'
    : section === 'mine' ? 'My documents'
    : section === 'shared' ? 'Shared with me'
    : 'Templates';
  const sub = roomDeal ? roomDeal.sub
    : section === 'all' ? `Everything you can see across ${portfolio.name}`
    : section === 'rooms' ? `Formal DD collections · ${portfolio.name}`
    : section === 'mine' ? 'Documents you created'
    : section === 'shared' ? 'From co-investors, advisors, counterparties'
    : 'Standard starter documents — Yulia can generate any of these on request';

  return (
    <div className="vlib__bar">
      <div className="vlib__bar-head">
        <div className="vlib__bar-t">{title}</div>
        <div className="vlib__bar-s">{sub}</div>
      </div>
      <div className="vlib__bar-r">
        <div className="vlib__search">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
          <input placeholder="Search" value={query} onChange={e => onQuery(e.target.value)} />
        </div>
        {section === 'templates'
          ? <button className="vlib__bar-btn vlib__bar-btn--prim">{VL_IC.sparkles}Ask Yulia to draft</button>
          : <button className="vlib__bar-btn">{VL_IC.plus}New document</button>}
      </div>
    </div>
  );
}

/* ── All documents (flat) ─────────────────────────── */
function VLibAll({ portfolio, portDeals, rooms, mine, shared, query }) {
  const rows = vlUseMemo(() => {
    const q = query.toLowerCase();
    const out = [];
    rooms.forEach(r => out.push({
      id: r.id, title: r.title, kind: r.kind || 'doc', scope: 'Data room',
      deal: portDeals.find(d => d.id === r.dealId), when: r.uploaded, meta: r.from, status: r.status,
    }));
    mine.filter(m => !m.dealId || portfolio.dealIds.includes(m.dealId)).forEach(m => out.push({
      id: m.id, title: m.title, kind: m.kind, scope: 'My doc',
      deal: portDeals.find(d => d.id === m.dealId), when: m.updated, meta: m.size, status: null,
    }));
    shared.forEach(s => out.push({
      id: s.id, title: s.title, kind: s.kind, scope: 'Shared',
      deal: portDeals.find(d => d.id === s.dealId), when: s.sharedOn, meta: s.from, status: s.unread ? 'unread' : null,
    }));
    return out.filter(r => !q || r.title.toLowerCase().includes(q) || (r.meta || '').toLowerCase().includes(q));
  }, [rooms, mine, shared, query, portfolio, portDeals]);

  return (
    <div className="vlib__scroll">
      <div className="vlib__table">
        <div className="vlib__table-h">
          <div className="vlib__c-title">Title</div>
          <div className="vlib__c-scope">Scope</div>
          <div className="vlib__c-deal">Deal</div>
          <div className="vlib__c-meta">Contributor</div>
          <div className="vlib__c-when">Updated</div>
          <div className="vlib__c-stat"></div>
        </div>
        {rows.map(r => (
          <div key={r.id} className="vlib__row">
            <div className="vlib__c-title">
              <span className="vlib__row-ic">{VL_KIND_IC[r.kind] || VL_IC.doc}</span>
              <span className="vlib__row-t">{r.title}</span>
            </div>
            <div className="vlib__c-scope"><span className={'vlib__scope vlib__scope--' + r.scope.replace(/\s+/g, '').toLowerCase()}>{r.scope}</span></div>
            <div className="vlib__c-deal">{r.deal ? <><span className={'vlib__tree-deal-dot vlib__tree-deal-dot--' + (r.deal.tone || 'ok')} />{r.deal.name}</> : <span className="vlib__c-faint">—</span>}</div>
            <div className="vlib__c-meta">{r.meta || ''}</div>
            <div className="vlib__c-when">{r.when || ''}</div>
            <div className="vlib__c-stat">{r.status && <StatusChip status={r.status} />}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Data rooms overview (all deals as cards) ─────── */
function VLibRoomsOverview({ portfolio, portDeals, rooms, onPickDeal, onOpenDeal }) {
  const totalReview = rooms.filter(r => r.status === 'review').length;
  const totalAction = rooms.filter(r => r.status === 'action').length;
  const totalSealed = rooms.filter(r => r.status === 'sealed').length;
  return (
    <div className="vlib__scroll">
      <div className="vlib__rooms-kpis">
        <div className="vlib__kpi"><div className="vlib__kpi-n">{rooms.length}</div><div className="vlib__kpi-k">DOCUMENTS</div></div>
        <div className="vlib__kpi vlib__kpi--action"><div className="vlib__kpi-n">{totalAction}</div><div className="vlib__kpi-k">TO ACTION</div></div>
        <div className="vlib__kpi vlib__kpi--review"><div className="vlib__kpi-n">{totalReview}</div><div className="vlib__kpi-k">TO REVIEW</div></div>
        <div className="vlib__kpi"><div className="vlib__kpi-n">{totalSealed}</div><div className="vlib__kpi-k">SEALED</div></div>
      </div>

      <div className="vlib__rooms-grid">
        {portDeals.map(d => {
          const dr = rooms.filter(r => r.dealId === d.id);
          if (dr.length === 0) return (
            <div key={d.id} className="vlib__rcard vlib__rcard--empty" onClick={() => onPickDeal(d.id)}>
              <div className="vlib__rcard-h">
                <span className={'vlib__tree-deal-dot vlib__tree-deal-dot--' + (d.tone || 'ok')} />
                <span className="vlib__rcard-t">{d.name}</span>
              </div>
              <div className="vlib__rcard-empty">No room yet · click to request</div>
            </div>
          );
          const review = dr.filter(r => r.status === 'review').length;
          const action = dr.filter(r => r.status === 'action').length;
          const sealed = dr.filter(r => r.status === 'sealed').length;
          const recent = [...dr].sort((a,b) => b.uploaded.localeCompare(a.uploaded)).slice(0, 3);
          return (
            <button key={d.id} className="vlib__rcard" onClick={() => onPickDeal(d.id)}>
              <div className="vlib__rcard-h">
                <span className={'vlib__tree-deal-dot vlib__tree-deal-dot--' + (d.tone || 'ok')} />
                <span className="vlib__rcard-t">{d.name}</span>
                <span className="vlib__rcard-stage">{d.stage && d.stage.toUpperCase()}</span>
              </div>
              <div className="vlib__rcard-row">
                {action > 0 && <span className="vlib__chip vlib__chip--action">{action} action</span>}
                {review > 0 && <span className="vlib__chip vlib__chip--review">{review} review</span>}
                {sealed > 0 && <span className="vlib__chip vlib__chip--sealed">{sealed} sealed</span>}
              </div>
              <div className="vlib__rcard-recent">
                {recent.map(r => (
                  <div key={r.id} className="vlib__rcard-rec">
                    <span className="vlib__rcard-rec-ic">{VL_KIND_IC[r.kind] || VL_IC.doc}</span>
                    <span className="vlib__rcard-rec-t">{r.title}</span>
                    <span className="vlib__rcard-rec-d">{r.uploaded}</span>
                  </div>
                ))}
              </div>
              <div className="vlib__rcard-foot">Open room →</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── One deal's data room (three lanes) ───────────── */
function VLibRoom({ deal, rooms, query, onBack }) {
  const q = query.toLowerCase();
  const filtered = rooms.filter(r => !q || r.title.toLowerCase().includes(q) || (r.from || '').toLowerCase().includes(q));
  const lanes = [
    { id: 'action', title: 'To action',  sub: 'You owe a response', items: filtered.filter(r => r.status === 'action') },
    { id: 'review', title: 'To review',  sub: 'Seller uploaded — needs your read', items: filtered.filter(r => r.status === 'review') },
    { id: 'sealed', title: 'Sealed',     sub: 'Closed out · archived for audit', items: filtered.filter(r => r.status === 'sealed') },
  ];
  return (
    <div className="vlib__scroll">
      <div className="vlib__room-crumb">
        <button onClick={onBack}>← All data rooms</button>
        <span className="vlib__room-crumb-sep">/</span>
        <span>{deal.name}</span>
      </div>
      <div className="vlib__lanes">
        {lanes.map(l => (
          <div key={l.id} className={'vlib__lane vlib__lane--' + l.id}>
            <div className="vlib__lane-h">
              <div className="vlib__lane-title">{l.title}</div>
              <div className="vlib__lane-count">{l.items.length}</div>
            </div>
            <div className="vlib__lane-sub">{l.sub}</div>
            <div className="vlib__lane-list">
              {l.items.length === 0 && <div className="vlib__lane-empty">Nothing here.</div>}
              {l.items.map(it => (
                <div key={it.id} className="vlib__doc">
                  <span className="vlib__doc-ic">{VL_KIND_IC[it.kind] || VL_IC.doc}</span>
                  <div className="vlib__doc-body">
                    <div className="vlib__doc-t">{it.title}</div>
                    <div className="vlib__doc-m">{it.folder} · {it.from} · {it.uploaded} · {it.size}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── My documents ────────────────────────────────── */
function VLibMine({ portfolio, portDeals, docs, query }) {
  const q = query.toLowerCase();
  const rows = docs
    .filter(m => !m.dealId || portfolio.dealIds.includes(m.dealId))
    .filter(m => !q || m.title.toLowerCase().includes(q));
  return (
    <div className="vlib__scroll">
      <div className="vlib__cards">
        {rows.map(m => {
          const deal = portDeals.find(d => d.id === m.dealId);
          return (
            <div key={m.id} className="vlib__mcard">
              <div className={'vlib__mcard-thumb vlib__mcard-thumb--' + m.kind}>
                <span>{m.thumb}</span>
              </div>
              <div className="vlib__mcard-b">
                <div className="vlib__mcard-t">{m.title}</div>
                <div className="vlib__mcard-m">
                  {deal ? <><span className={'vlib__tree-deal-dot vlib__tree-deal-dot--' + deal.tone} />{deal.name}</> : 'Portfolio'}
                  <span className="vlib__mcard-sep">·</span>
                  {m.size}
                  <span className="vlib__mcard-sep">·</span>
                  {m.updated}
                </div>
              </div>
              <span className={'vlib__kind vlib__kind--' + m.kind}>{m.kind}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Shared with me ──────────────────────────────── */
function VLibShared({ docs, query }) {
  const q = query.toLowerCase();
  const rows = docs.filter(d => !q || d.title.toLowerCase().includes(q) || d.from.toLowerCase().includes(q));
  return (
    <div className="vlib__scroll">
      <div className="vlib__shared">
        {rows.map(s => {
          const deal = s.dealId ? window.DEALS.find(d => d.id === s.dealId) : null;
          const init = s.from.replace(/[()].*$/, '').trim().split(' ').map(w => w[0]).slice(0, 2).join('');
          return (
            <div key={s.id} className={'vlib__scard' + (s.unread ? ' vlib__scard--unread' : '')}>
              <div className="vlib__scard-av">{init}</div>
              <div className="vlib__scard-b">
                <div className="vlib__scard-t">{s.title}{s.unread && <span className="vlib__scard-dot" />}</div>
                <div className="vlib__scard-m">
                  <span className="vlib__scard-from">{s.from}</span>
                  <span className="vlib__mcard-sep">·</span>
                  {deal ? <span><span className={'vlib__tree-deal-dot vlib__tree-deal-dot--' + deal.tone} />{deal.name}</span> : 'Portfolio'}
                  <span className="vlib__mcard-sep">·</span>
                  Shared {s.sharedOn}
                </div>
              </div>
              <span className={'vlib__kind vlib__kind--' + s.kind}>{s.kind}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Templates ───────────────────────────────────── */
function VLibTemplates({ templates, query }) {
  const q = query.toLowerCase();
  const rows = templates.filter(t => !q || t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q));
  return (
    <div className="vlib__scroll">
      <div className="vlib__tpl-lead">
        <span className="vlib__tpl-lead-ic">{VL_IC.sparkles}</span>
        <div>
          <div className="vlib__tpl-lead-t">Yulia-generated templates</div>
          <div className="vlib__tpl-lead-s">Ask in chat or click "Use" — populated automatically from the active deal's context.</div>
        </div>
      </div>
      <div className="vlib__tpls">
        {rows.map(t => (
          <div key={t.id} className="vlib__tpl">
            <div className="vlib__tpl-h">
              <div className={'vlib__tpl-ic vlib__tpl-ic--' + t.kind}>{t.title.slice(0, 1)}</div>
              <div className="vlib__tpl-hb">
                <div className="vlib__tpl-t">{t.title}</div>
                <div className="vlib__tpl-tags">{t.tags.map(tg => <span key={tg} className="vlib__tpl-tag">{tg}</span>)}</div>
              </div>
            </div>
            <div className="vlib__tpl-d">{t.desc}</div>
            <div className="vlib__tpl-ft">
              <button className="vlib__tpl-btn vlib__tpl-btn--prim">{VL_IC.sparkles}Use template</button>
              <button className="vlib__tpl-btn">Preview</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Status chip ─────────────────────────────────── */
function StatusChip({ status }) {
  const map = {
    review:  { label: 'To review',  cls: 'review' },
    action:  { label: 'To action',  cls: 'action' },
    sealed:  { label: 'Sealed',     cls: 'sealed' },
    unread:  { label: 'Unread',     cls: 'unread' },
  };
  const m = map[status] || { label: status, cls: 'sealed' };
  return <span className={'vlib__chip vlib__chip--' + m.cls}>{m.label}</span>;
}

Object.assign(window, { LibraryView });
