/* ═══════════════════════════════════════════════════════════
   Canvas pane — middle multi-tab workspace
   Tabs: Timeline · Pipeline · Documents · Analysis · Dashboard
   Supports multiple parallel canvases for simulations/comparisons
   ═══════════════════════════════════════════════════════════ */

const { useState: cUseState, useRef: cUseRef } = React;

const CANVAS_TABS = [
  { id: 'timeline',   label: 'Timeline',   ic: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> },
  { id: 'pipeline',   label: 'Pipeline',   ic: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h4l2 12h4l2-12h6"/></svg> },
  { id: 'documents',  label: 'Documents',  ic: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h6"/></svg> },
  { id: 'analysis',   label: 'Analysis',   ic: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3v18h18M7 14l4-4 4 4 6-6"/></svg> },
  { id: 'dashboard',  label: 'Dashboard',  ic: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg> },
];

/* ── Timeline view ──────────────────────────── */
function TimelineView({ deal }) {
  const events = deal ? [
    { d: 'Apr 19', t: 'QoE cleared', s: 'Adjusted EBITDA $1.24M, margin 20.0% after owner comp.', tone: 'ok' },
    { d: 'Apr 18', t: 'WC peg landed', s: 'NWC trailing 12mo $620K.', tone: 'ok' },
    { d: 'Apr 17', t: 'Concentration flagged', s: '38% top-3 on month-to-month MSAs.', tone: 'flag' },
    { d: 'Apr 15', t: 'Rundown published', s: '83/100 · Pursue.', tone: 'ok' },
    { d: 'Apr 12', t: 'Owner intro call', s: '2nd-gen, 58yo, retiring. Wants 24-month transition.', tone: 'ok' },
    { d: 'Apr 08', t: 'CIM received', s: 'From broker. 47 pages.', tone: 'muted' },
    { d: 'Apr 03', t: 'Match generated', s: 'Fit 94 — top of HVAC thesis.', tone: 'muted' },
  ] : [
    { d: 'Apr 19', t: '47 new named targets', s: 'HVAC thesis · TX+OK this week.', tone: 'ok' },
    { d: 'Apr 18', t: 'Benchmark · LOI drafted', s: '$16.8M, 70/20/10. Awaiting your review.', tone: 'ok' },
    { d: 'Apr 17', t: 'Clearwater · concentration flag', s: '62% from single GC. Recommend walk.', tone: 'flag' },
  ];
  return (
    <div className="tl">
      {events.map((e, i) => (
        <div key={i} className="tl__row">
          <div className="tl__d">{e.d}</div>
          <div className={'tl__dot tl__dot--' + e.tone} />
          <div className="tl__body">
            <div className="tl__t">{e.t}</div>
            <div className="tl__s">{e.s}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Pipeline view (Kanban-ish) ────────────── */
function PipelineView() {
  const stages = window.STAGES;
  const deals = window.DEALS;
  return (
    <div className="pipe">
      {stages.map(s => {
        const col = deals.filter(d => d.stage === s.id);
        return (
          <div key={s.id} className="pipe__col">
            <div className="pipe__head">
              <span className="pipe__head-t">{s.label}</span>
              <span className="pipe__head-c">{col.length}</span>
            </div>
            {col.map(d => (
              <div key={d.id} className="pipe__card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span className={`rail__item-dot rail__item-dot--${d.tone === 'ok' ? 'ok' : 'warn'}`} style={{ width: 6, height: 6 }} />
                  <span className="pipe__card-t">{d.name}</span>
                </div>
                <div className="pipe__card-s">{d.industry} · {d.revenue} · Fit {d.fit}</div>
                {d.score && <div className="pipe__card-score">{d.score}<small>/100</small></div>}
              </div>
            ))}
            {col.length === 0 && <div className="pipe__empty">—</div>}
          </div>
        );
      })}
    </div>
  );
}

/* ── Documents view ─────────────────────────── */
const DOCS = [
  { n: 'CIM_Atlas_Air.pdf',            k: '47 pp · 4.2MB',  t: 'CIM',      deal: 'atlas',     d: 'Apr 08' },
  { n: 'QoE_Atlas_v3.xlsx',            k: '18 tabs · 890KB', t: 'MODEL',    deal: 'atlas',     d: 'Apr 19' },
  { n: 'Rundown_Atlas_Air.pdf',        k: '6 pp · 280KB',   t: 'RUNDOWN',  deal: 'atlas',     d: 'Apr 15' },
  { n: 'Concentration_memo.docx',      k: '3 pp · 45KB',    t: 'MEMO',     deal: 'atlas',     d: 'Apr 17' },
  { n: 'Phase_I_environ.pdf',          k: '22 pp · 1.8MB',  t: 'DD',       deal: 'atlas',     d: 'Apr 18' },
  { n: 'LOI_Benchmark_v2.docx',        k: '8 pp · 95KB',    t: 'LOI',      deal: 'benchmark', d: 'Apr 18' },
  { n: 'Summit_tax_returns_2021-23.pdf', k: '84 pp · 6.1MB', t: 'TAX',     deal: 'summit',    d: 'Apr 12' },
  { n: 'Portfolio_compare.pdf',        k: '4 pp · 320KB',   t: 'COMPARE',  deal: null,        d: 'Apr 19' },
];
function DocumentsView({ deal }) {
  const rows = deal ? DOCS.filter(d => d.deal === deal.id) : DOCS;
  return (
    <div className="docs">
      <div className="docs__head">
        <span style={{ flex: 2 }}>Name</span>
        <span style={{ width: 70 }}>Type</span>
        <span style={{ width: 120 }}>Size</span>
        <span style={{ width: 70, textAlign: 'right' }}>Date</span>
      </div>
      {rows.map(d => (
        <div key={d.n} className="docs__row">
          <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div className="docs__ic">{IC.doc}</div>
            <span className="docs__n">{d.n}</span>
          </div>
          <span className="docs__type"><span className="pill pill--ink">{d.t}</span></span>
          <span className="docs__k" style={{ width: 120 }}>{d.k}</span>
          <span className="docs__k" style={{ width: 70, textAlign: 'right' }}>{d.d}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Analysis view — simulations / compare / infographics ── */
function AnalysisView({ deal }) {
  const [sim, setSim] = cUseState('loi');
  return (
    <div>
      <div className="analysis__tabs">
        {['loi', 'compare', 'sensitivity', 'returns'].map(k => (
          <button key={k} className={'analysis__tab' + (sim === k ? ' active' : '')} onClick={() => setSim(k)}>
            {k === 'loi' ? 'LOI scenarios' : k === 'compare' ? 'Deal compare' : k === 'sensitivity' ? 'Sensitivity' : 'Returns'}
          </button>
        ))}
      </div>

      {sim === 'loi' && deal && <LOICard deal={deal} />}
      {sim === 'compare' && <CompareCard deals={window.DEALS.filter(d => d.score).slice(0, 3)} />}

      {sim === 'sensitivity' && (
        <Bench title={`Sensitivity · ${deal ? deal.name : 'Portfolio'}`} meta="MULTIPLE × GROWTH">
          <div className="sens">
            <div className="sens__yaxis">
              <div>3.5×</div><div>4.0×</div><div>4.5×</div><div>5.0×</div><div>5.5×</div>
            </div>
            <div className="sens__grid">
              {[0.08, 0.1, 0.12, 0.14, 0.16].flatMap((g, gi) =>
                [3.5, 4.0, 4.5, 5.0, 5.5].map((m, mi) => {
                  const irr = (m * 2.3 + g * 80 + 4).toFixed(1);
                  const hot = parseFloat(irr) > 22;
                  const cool = parseFloat(irr) < 16;
                  return (
                    <div key={gi + '-' + mi} className="sens__cell"
                         style={{ background: hot ? 'rgba(34,167,85,0.22)' : cool ? 'rgba(212,83,58,0.12)' : 'rgba(232,160,51,0.12)' }}>
                      {irr}%
                    </div>
                  );
                })
              )}
            </div>
            <div className="sens__xaxis">
              <span>8%</span><span>10%</span><span>12%</span><span>14%</span><span>16%</span>
            </div>
            <div className="sens__xlbl">Revenue growth →</div>
          </div>
        </Bench>
      )}

      {sim === 'returns' && (
        <Bench title="Fund returns · IRR distribution" meta="5 LIVE DEALS">
          <div className="ret">
            {[
              { n: 'Atlas Air',    irr: 28.4, tone: 'ok' },
              { n: 'Benchmark',    irr: 24.1, tone: 'ok' },
              { n: 'Summit',       irr: 19.8, tone: 'ok' },
              { n: 'Ridge',        irr: 14.2, tone: 'warn' },
              { n: 'Clearwater',   irr: 6.8,  tone: 'flag' },
            ].map(r => (
              <div key={r.n} className="ret__row">
                <span className="ret__n">{r.n}</span>
                <div className="ret__bar">
                  <div className="ret__fill" style={{ width: (r.irr / 35 * 100) + '%', background: r.tone === 'ok' ? '#22A755' : r.tone === 'warn' ? '#E8A033' : '#D4533A' }} />
                </div>
                <span className="ret__v">{r.irr.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </Bench>
      )}
    </div>
  );
}

/* ── Dashboard view — overview of a deal (mini-multi) ── */
function DashboardView({ deal }) {
  if (!deal) {
    return (
      <div>
        <div className="dash-kpis">
          <div className="dash-kpi"><div className="dash-kpi__k">Live deals</div><div className="dash-kpi__v">5</div></div>
          <div className="dash-kpi"><div className="dash-kpi__k">Total deployed</div><div className="dash-kpi__v">$0M</div></div>
          <div className="dash-kpi"><div className="dash-kpi__k">Weighted IRR</div><div className="dash-kpi__v">18.7%</div></div>
          <div className="dash-kpi"><div className="dash-kpi__k">Flags</div><div className="dash-kpi__v" style={{ color: '#D4533A' }}>2</div></div>
        </div>
        <CompareCard deals={window.DEALS.filter(d => d.score).slice(0, 3)} />
      </div>
    );
  }
  return (
    <div>
      <div className="dash-kpis">
        <div className="dash-kpi"><div className="dash-kpi__k">Rundown</div><div className="dash-kpi__v">{deal.score || '—'}<small>/100</small></div></div>
        <div className="dash-kpi"><div className="dash-kpi__k">Fit</div><div className="dash-kpi__v">{deal.fit}</div></div>
        <div className="dash-kpi"><div className="dash-kpi__k">Revenue</div><div className="dash-kpi__v">{deal.revenue}</div></div>
        <div className="dash-kpi"><div className="dash-kpi__k">EBITDA</div><div className="dash-kpi__v">{deal.ebitda}</div></div>
      </div>
      <ChartCard deal={deal} />
      {deal.dims.length > 0 && <RundownCard deal={deal} compact />}
    </div>
  );
}

/* ── Main Canvas component ─────────────────── */
function CanvasPane({ deal, onDrillDown, onCollapse }) {
  const [tab, setTab] = cUseState('dashboard');
  const [splits, setSplits] = cUseState([]);   // extra canvases for parallel sims
  const [canvasIdx, setCanvasIdx] = cUseState(0);

  const allCanvases = [{ id: 'main', label: deal ? deal.name : 'Portfolio', deal }, ...splits];
  const cur = allCanvases[canvasIdx] || allCanvases[0];

  const addSplit = () => {
    const d = window.DEALS.find(x => x.id !== (cur.deal && cur.deal.id));
    setSplits(s => [...s, { id: 'split-' + Date.now(), label: d.name + ' · compare', deal: d }]);
    setCanvasIdx(allCanvases.length);
  };
  const closeSplit = id => {
    setSplits(s => s.filter(x => x.id !== id));
    setCanvasIdx(0);
  };

  return (
    <section className="canvas pane">
      <div className="canvas__head pane__toolbar">
        <div className="canvas__tabs">
          {CANVAS_TABS.map(t => (
            <button key={t.id} className={'canvas__tab' + (tab === t.id ? ' active' : '')} onClick={() => setTab(t.id)}>
              {t.ic}<span>{t.label}</span>
            </button>
          ))}
        </div>
        <div className="canvas__splits">
          {allCanvases.map((c, i) => (
            <span
              key={c.id}
              role="button"
              tabIndex={0}
              className={'canvas__split' + (canvasIdx === i ? ' active' : '')}
              onClick={() => setCanvasIdx(i)}
            >
              {c.label}
              {c.id !== 'main' && (
                <span
                  role="button"
                  tabIndex={0}
                  className="canvas__split-x"
                  onClick={e => { e.stopPropagation(); closeSplit(c.id); }}
                >×</span>
              )}
            </span>
          ))}
          <button className="canvas__split-add" onClick={addSplit} title="New canvas for compare/sim">+</button>
          <button className="canvas__split-add pane__collapse-btn" onClick={onCollapse} title="Collapse canvas" style={{ marginLeft: 'auto' }}>◱</button>
        </div>
      </div>
      <div className="canvas__scroll">
        {tab === 'timeline'  && <TimelineView deal={cur.deal} />}
        {tab === 'pipeline'  && <PipelineView />}
        {tab === 'documents' && <DocumentsView deal={cur.deal} />}
        {tab === 'analysis'  && <AnalysisView deal={cur.deal} />}
        {tab === 'dashboard' && <DashboardView deal={cur.deal} />}
      </div>
    </section>
  );
}

Object.assign(window, { CanvasPane, TimelineView, DocumentsView, AnalysisView, DashboardView, PipelineView });
