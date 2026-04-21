/* ═══════════════════════════════════════════════════════════
   v3-canvas.jsx — CENTER PANE (working area)
   Floating toolbar · renders active tab's content via Workspace views
   ═══════════════════════════════════════════════════════════ */

const { useState: vcUseState, useMemo: vcUseMemo } = React;

const V3_CIC = {
  share:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>,
  export: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>,
  print:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/></svg>,
  version:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  fork:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="3" r="3"/><circle cx="6" cy="21" r="3"/><circle cx="18" cy="12" r="3"/><path d="M6 6v9a6 6 0 0 0 6 6 6 6 0 0 0 6-6V9"/></svg>,
  fs:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>,
  more:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
  x:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>,
};

/* ── Empty canvas ─────────────────────────────── */
function V3CanvasEmpty({ onSend }) {
  const starters = [
    { t: 'Run a Rundown',   s: 'Score a target against your thesis',  prompt: 'Run a Rundown on Atlas Air'  },
    { t: 'Model a DCF',     s: 'Project 5 years + terminal value',    prompt: 'Model DCF on Atlas' },
    { t: 'Compare deals',   s: 'Stack-rank your open deals',          prompt: 'Compare my 3 open deals' },
    { t: 'Draft an LOI',    s: 'Structure cash/note/rollover',        prompt: 'Draft LOI for Benchmark' },
  ];
  return (
    <div className="v3-canvas__empty">
      <div className="v3-canvas__empty-logo">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l16 16M20 4L4 20"/></svg>
        smbx.ai
      </div>
      <div className="v3-canvas__empty-t">Ask Yulia to open a tool.</div>
      <div className="v3-canvas__empty-starters">
        {starters.map(s => (
          <button key={s.t} className="v3-canvas__starter" onClick={() => onSend(s.prompt)}>
            <div className="v3-canvas__starter-t">{s.t}</div>
            <div className="v3-canvas__starter-s">{s.s}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Floating toolbar ─────────────────────────── */
function V3FloatingToolbar({ tab, portfolio, onClose }) {
  const deal = tab && tab.dealId ? window.DEALS.find(d => d.id === tab.dealId) : null;
  const kindLabel = {
    deal: 'Deal',
    model: 'DCF',
    compare: 'Compare',
    portfolio: 'Portfolio',
    scratch: 'Scratch',
    rundown: 'Rundown',
    dd: 'DD pack',
    loi: 'LOI',
  }[tab && tab.kind] || 'Doc';

  return (
    <div className="v3-ftb">
      {/* Left cluster — doc-level info + actions */}
      <div className="v3-ftb__group">
        <span className="v3-ftb__crumb">
          <span className="v3-ftb__crumb-k">{kindLabel}</span>
          {tab ? tab.label : ''}
        </span>
      </div>
      <div className="v3-ftb__sep" />
      <div className="v3-ftb__group">
        <button className="v3-ftb__btn" title="Share">{V3_CIC.share}<span>Share</span></button>
        <button className="v3-ftb__btn" title="Export">{V3_CIC.export}<span>Export</span></button>
        <button className="v3-ftb__btn" title="Print">{V3_CIC.print}</button>
        <button className="v3-ftb__btn" title="Version history">{V3_CIC.version}</button>
      </div>
      <div className="v3-ftb__sep" />
      {/* Right cluster — canvas actions */}
      <div className="v3-ftb__group">
        <button className="v3-ftb__btn" title="Fork as new tab">{V3_CIC.fork}<span>Fork</span></button>
        <button className="v3-ftb__btn" title="Fullscreen">{V3_CIC.fs}</button>
        <button className="v3-ftb__btn" title="More">{V3_CIC.more}</button>
        <button className="v3-ftb__btn" onClick={onClose} title="Close tab">{V3_CIC.x}</button>
      </div>
    </div>
  );
}

/* ── Canvas ───────────────────────────────────── */
function V3Canvas({ tab, portfolio, onCloseTab, onSend, onOpenTab }) {
  const deal = tab && tab.dealId ? window.DEALS.find(d => d.id === tab.dealId) : null;

  /* Which module (for deal tab) */
  const [module, setModule] = vcUseState('overview');
  React.useEffect(() => { setModule('overview'); }, [tab && tab.id]);

  if (!tab) {
    return (
      <section className="v3-canvas v3-canvas--empty">
        <V3CanvasEmpty onSend={onSend} />
      </section>
    );
  }

  /* Choose body */
  let body;
  if (tab.kind === 'compare') {
    body = <CompareView dealIds={tab.dealIds || []} />;
  } else if (tab.kind === 'portfolio') {
    body = <PortfolioView portfolio={portfolio} />;
  } else if (tab.kind === 'scratch') {
    body = <ScratchView tab={tab} />;
  } else if (tab.kind === 'model') {
    body = <DCFView deal={deal} />;
  } else if (tab.kind === 'rundown') {
    body = <div style={{ maxWidth: 720 }}><RundownCard deal={deal} /></div>;
  } else if (tab.kind === 'dd') {
    body = <div style={{ maxWidth: 720 }}><DDCard deal={deal} /></div>;
  } else if (tab.kind === 'loi') {
    body = <div style={{ maxWidth: 720 }}><LOICard deal={deal} /></div>;
  } else {
    /* Deal tab — show overview by default */
    if (module === 'overview') body = <DashboardView deal={deal} />;
    else if (module === 'timeline') body = <TimelineView deal={deal} />;
    else if (module === 'documents') body = <DocumentsView deal={deal} />;
    else if (module === 'rundown') body = <RundownCard deal={deal} />;
    else if (module === 'dd') body = <DDCard deal={deal} />;
    else if (module === 'loi') body = <LOICard deal={deal} />;
    else if (module === 'dcf') body = <DCFView deal={deal} />;
    else if (module === 'sensitivity') body = <AnalysisView deal={deal} />;
    else body = <DashboardView deal={deal} />;
  }

  return (
    <section className="v3-canvas">
      <V3FloatingToolbar tab={tab} portfolio={portfolio} onClose={() => onCloseTab(tab.id)} />
      <div className="v3-canvas__body">
        {body}
      </div>
    </section>
  );
}

Object.assign(window, { V3Canvas, V3CanvasEmpty, V3FloatingToolbar });
