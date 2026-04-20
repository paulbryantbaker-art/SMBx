/* ═══════════════════════════════════════════════════════════
   Workspace — renders the content of the active tab
   Command palette (/) for switching modules inside a tab
   ═══════════════════════════════════════════════════════════ */

const { useState: wUseState, useEffect: wUseEffect, useRef: wUseRef, useMemo: wUseMemo } = React;

/* Module catalog — used by command palette and default view */
const MODULES = [
  { id: 'overview',   label: 'Overview',   hint: 'KPIs + chart', shortcut: 'O' },
  { id: 'timeline',   label: 'Timeline',   hint: 'Activity stream', shortcut: 'T' },
  { id: 'documents',  label: 'Documents',  hint: 'Files & memos', shortcut: 'D' },
  { id: 'rundown',    label: 'Rundown',    hint: 'Scorecard', shortcut: 'R' },
  { id: 'dd',         label: 'DD pack',    hint: '42 workstreams', shortcut: 'X' },
  { id: 'loi',        label: 'LOI',        hint: 'Structures', shortcut: 'L' },
  { id: 'dcf',        label: 'DCF',        hint: 'Projection + DCF', shortcut: 'F' },
  { id: 'sensitivity',label: 'Sensitivity',hint: 'Heatmap', shortcut: 'S' },
];

/* ── Command palette ──────────────────────────── */
function CommandPalette({ open, onClose, onPick, tab }) {
  const [q, setQ] = wUseState('');
  const inpRef = wUseRef(null);
  wUseEffect(() => {
    if (open) {
      setQ('');
      setTimeout(() => inpRef.current && inpRef.current.focus(), 10);
    }
  }, [open]);
  wUseEffect(() => {
    const h = e => {
      if (!open) return;
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;
  const query = q.replace(/^\//, '').toLowerCase();
  const modules = MODULES.filter(m => !query || m.label.toLowerCase().includes(query) || m.id.includes(query));
  const deal = tab && tab.dealId ? window.DEALS.find(d => d.id === tab.dealId) : null;
  return (
    <div className="cmd" onClick={onClose}>
      <div className="cmd__box" onClick={e => e.stopPropagation()}>
        <div className="cmd__head">
          <span className="cmd__slash">/</span>
          <input
            ref={inpRef}
            className="cmd__input"
            placeholder="Switch module — type to filter"
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && modules[0]) { onPick(modules[0].id); onClose(); }
            }}
          />
          <span className="cmd__esc">ESC</span>
        </div>
        <div className="cmd__list">
          <div className="cmd__group">Modules {deal ? `· ${deal.name}` : ''}</div>
          {modules.map(m => (
            <button key={m.id} className="cmd__row" onClick={() => { onPick(m.id); onClose(); }}>
              <span className="cmd__row-icon">/</span>
              <span className="cmd__row-t">{m.label}</span>
              <span className="cmd__row-hint">{m.hint}</span>
              <span className="cmd__row-k">{m.shortcut}</span>
            </button>
          ))}
          {modules.length === 0 && <div className="cmd__empty">No modules match "{q}"</div>}
        </div>
      </div>
    </div>
  );
}

/* ── DCF view ─────────────────────────────────── */
function DCFView({ deal }) {
  if (!deal) return <div className="ws__empty">Select a deal</div>;
  const rev0 = parseFloat(deal.revenue.replace(/[^0-9.]/g, ''));
  const ebitdaPct = parseFloat(deal.ebitda) / 100;
  const growth = 0.09;
  const years = [1, 2, 3, 4, 5];
  const proj = years.map(y => {
    const rev = rev0 * Math.pow(1 + growth, y);
    const ebitda = rev * ebitdaPct;
    const fcf = ebitda * 0.72;
    return { y: 2025 + y, rev, ebitda, fcf };
  });
  const wacc = 0.11;
  const tv = proj[4].fcf * 1.025 / (wacc - 0.025);
  const pvTv = tv / Math.pow(1 + wacc, 5);
  const pvFCF = proj.reduce((s, p, i) => s + p.fcf / Math.pow(1 + wacc, i + 1), 0);
  const ev = pvFCF + pvTv;
  return (
    <div className="dcf">
      <div className="dcf__hdr">
        <div className="dcf__hdr-l">
          <div className="dcf__t">DCF · {deal.name}</div>
          <div className="dcf__s">{deal.sub} · {deal.revenue} rev · {deal.ebitda} EBITDA</div>
        </div>
        <div className="dcf__hdr-r">
          <div className="dcf__ev">
            <div className="dcf__ev-k">Enterprise value</div>
            <div className="dcf__ev-v">${ev.toFixed(1)}M</div>
          </div>
        </div>
      </div>

      <div className="dcf__assumps">
        <div className="dcf__assump"><span>Revenue growth</span><strong>9.0%</strong></div>
        <div className="dcf__assump"><span>EBITDA margin</span><strong>{deal.ebitda}</strong></div>
        <div className="dcf__assump"><span>FCF conversion</span><strong>72%</strong></div>
        <div className="dcf__assump"><span>WACC</span><strong>11.0%</strong></div>
        <div className="dcf__assump"><span>Terminal g</span><strong>2.5%</strong></div>
      </div>

      <div className="dcf__tbl">
        <div className="dcf__row dcf__row--h">
          <span>Year</span>
          {proj.map(p => <span key={p.y}>{p.y}</span>)}
          <span>Terminal</span>
        </div>
        <div className="dcf__row">
          <span>Revenue</span>
          {proj.map(p => <span key={p.y}>${p.rev.toFixed(1)}M</span>)}
          <span>—</span>
        </div>
        <div className="dcf__row">
          <span>EBITDA</span>
          {proj.map(p => <span key={p.y}>${p.ebitda.toFixed(2)}M</span>)}
          <span>—</span>
        </div>
        <div className="dcf__row dcf__row--hi">
          <span>Free cash flow</span>
          {proj.map(p => <span key={p.y}>${p.fcf.toFixed(2)}M</span>)}
          <span>${tv.toFixed(1)}M</span>
        </div>
        <div className="dcf__row dcf__row--pv">
          <span>Present value</span>
          {proj.map((p, i) => <span key={p.y}>${(p.fcf / Math.pow(1 + wacc, i + 1)).toFixed(2)}M</span>)}
          <span>${pvTv.toFixed(1)}M</span>
        </div>
      </div>

      <div className="dcf__bars">
        {proj.map((p, i) => (
          <div key={p.y} className="dcf__bar">
            <div className="dcf__bar-fill" style={{ height: (p.fcf / proj[4].fcf * 100) + '%' }} />
            <div className="dcf__bar-v">${p.fcf.toFixed(1)}M</div>
            <div className="dcf__bar-y">{p.y}</div>
          </div>
        ))}
        <div className="dcf__bar dcf__bar--tv">
          <div className="dcf__bar-fill" style={{ height: '92%', background: '#A76BEF' }} />
          <div className="dcf__bar-v">${tv.toFixed(0)}M</div>
          <div className="dcf__bar-y">TV</div>
        </div>
      </div>
    </div>
  );
}

/* ── Compare view ─────────────────────────────── */
function CompareView({ dealIds, onOpenDeal }) {
  const [mode, setMode] = wUseState('side');  // 'side' | 'overlay' | 'table'
  const deals = dealIds.map(id => window.DEALS.find(d => d.id === id)).filter(Boolean);
  if (deals.length === 0) return <div className="ws__empty">No deals to compare</div>;

  const openDeal = (d, focus) => {
    if (!onOpenDeal) return;
    onOpenDeal({ ...d, _focus: focus });
  };

  const metrics = [
    { k: 'revenue',  label: 'Revenue',       get: d => parseFloat(d.revenue.replace(/[^0-9.]/g, '')), unit: 'M', fmt: v => `$${v.toFixed(1)}M` },
    { k: 'ebitda',   label: 'EBITDA margin', get: d => parseFloat(d.ebitda), unit: '%', fmt: v => `${v.toFixed(0)}%` },
    { k: 'score',    label: 'Rundown',       get: d => d.score || 0, unit: '/100', fmt: v => `${v}/100` },
    { k: 'fit',      label: 'Thesis fit',    get: d => d.fit, unit: '', fmt: v => `${v}` },
  ];

  return (
    <div className="cmp">
      <div className="cmp__toolbar">
        <div className="cmp__seg">
          <button className={mode === 'side' ? 'active' : ''} onClick={() => setMode('side')}>Side-by-side</button>
          <button className={mode === 'overlay' ? 'active' : ''} onClick={() => setMode('overlay')}>Overlay chart</button>
          <button className={mode === 'table' ? 'active' : ''} onClick={() => setMode('table')}>Table</button>
        </div>
        <div className="cmp__chips">
          {deals.map(d => (
            <span key={d.id} className="cmp__chip">
              <span className={'cmp__chip-dot cmp__chip-dot--' + d.tone} />
              {d.name}
            </span>
          ))}
        </div>
      </div>

      {mode === 'side' && (
        <div className="cmp__grid" style={{ gridTemplateColumns: `repeat(${deals.length}, 1fr)` }}>
          {deals.map(d => (
            <div key={d.id} className="cmp__col cmp__col--clickable">
              <div
                className="cmp__col-h cmp__col-h--clickable"
                onClick={() => openDeal(d)}
                title={`Open ${d.name}`}
              >
                <div className="cmp__col-n">{d.name}</div>
                <div className="cmp__col-s">{d.sub}</div>
                <div className="cmp__col-open">OPEN DEAL →</div>
              </div>
              {metrics.map(m => (
                <div
                  key={m.k}
                  className="cmp__metric cmp__metric--clickable"
                  onClick={() => openDeal(d, m.k)}
                  title={`Open ${d.name} → ${m.label}`}
                >
                  <div className="cmp__metric-k">{m.label}</div>
                  <div className="cmp__metric-v">{m.fmt(m.get(d))}</div>
                  <svg className="cmp__metric-drill" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                </div>
              ))}
              <div className="cmp__dims">
                {d.dims.slice(0, 4).map(dm => (
                  <div
                    key={dm.label}
                    className="cmp__dim cmp__dim--clickable"
                    onClick={() => openDeal(d, 'dim:' + dm.label.toLowerCase().replace(/\s+/g, '_'))}
                    title={`Open ${d.name} → ${dm.label}`}
                  >
                    <span className="cmp__dim-k">{dm.label}</span>
                    <span className="cmp__dim-v">{dm.value.toFixed(1)}</span>
                    <div className="cmp__dim-bar"><div style={{ width: (dm.value * 10) + '%', background: dm.tone === 'green' ? '#22A755' : dm.tone === 'amber' ? '#E8A033' : '#D4533A' }} /></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {mode === 'overlay' && (
        <div className="cmp__overlay">
          {metrics.map(m => {
            const vals = deals.map(d => m.get(d));
            const max = Math.max(...vals);
            return (
              <div key={m.k} className="cmp__ov-card">
                <div className="cmp__ov-k">{m.label}</div>
                <div className="cmp__ov-bars">
                  {deals.map((d, i) => (
                    <div key={d.id} className="cmp__ov-row">
                      <span className="cmp__ov-n">{d.name.split(' ')[0]}</span>
                      <div className="cmp__ov-bar">
                        <div className="cmp__ov-fill" style={{
                          width: (vals[i] / max * 100) + '%',
                          background: d.tone === 'ok' ? '#0A0A0B' : d.tone === 'warn' ? '#E8A033' : '#D4533A',
                        }} />
                      </div>
                      <span className="cmp__ov-v">{m.fmt(vals[i])}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {mode === 'table' && (
        <div className="cmp__tbl">
          <div className="cmp__tbl-row cmp__tbl-row--h">
            <span>Metric</span>
            {deals.map(d => <span key={d.id}>{d.name}</span>)}
          </div>
          {metrics.map(m => (
            <div key={m.k} className="cmp__tbl-row">
              <span className="cmp__tbl-k">{m.label}</span>
              {deals.map(d => <span key={d.id}>{m.fmt(m.get(d))}</span>)}
            </div>
          ))}
          {deals[0].dims.map((_, di) => {
            const label = deals[0].dims[di].label;
            return (
              <div key={di} className="cmp__tbl-row">
                <span className="cmp__tbl-k">{label}</span>
                {deals.map(d => {
                  const dm = d.dims.find(x => x.label === label);
                  return <span key={d.id}>{dm ? dm.value.toFixed(1) : '—'}</span>;
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Portfolio overview view ───────────────────── */
function PortfolioView({ portfolio }) {
  const deals = window.DEALS.filter(d => portfolio.dealIds.includes(d.id));
  const live = deals.filter(d => d.score);
  const avgScore = live.length ? Math.round(live.reduce((s, d) => s + d.score, 0) / live.length) : 0;
  const totalRev = deals.reduce((s, d) => s + parseFloat(d.revenue.replace(/[^0-9.]/g, '')), 0);
  return (
    <div className="pov">
      <div className="pov__kpis">
        <div className="pov__kpi"><div className="pov__kpi-k">Deals</div><div className="pov__kpi-v">{deals.length}</div></div>
        <div className="pov__kpi"><div className="pov__kpi-k">Live (scored)</div><div className="pov__kpi-v">{live.length}</div></div>
        <div className="pov__kpi"><div className="pov__kpi-k">Avg rundown</div><div className="pov__kpi-v">{avgScore}<small>/100</small></div></div>
        <div className="pov__kpi"><div className="pov__kpi-k">Total revenue</div><div className="pov__kpi-v">${totalRev.toFixed(1)}M</div></div>
      </div>
      <div className="pov__stages">
        {window.STAGES.map(s => {
          const col = deals.filter(d => d.stage === s.id);
          return (
            <div key={s.id} className="pov__stage">
              <div className="pov__stage-h">
                <span>{s.label}</span>
                <span className="pov__stage-c">{col.length}</span>
              </div>
              {col.map(d => (
                <div key={d.id} className="pov__card">
                  <div className="pov__card-h">
                    <span className={'pov__card-dot pov__card-dot--' + d.tone} />
                    <strong>{d.name}</strong>
                  </div>
                  <div className="pov__card-s">{d.kicker}</div>
                  <div className="pov__card-m">{d.revenue} · Fit {d.fit}{d.score ? ` · ${d.score}/100` : ''}</div>
                </div>
              ))}
              {col.length === 0 && <div className="pov__stage-empty">—</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Scratch view ──────────────────────────────── */
function ScratchView({ tab }) {
  return (
    <div className="sc">
      <div className="sc__q">
        <span className="sc__q-k">Query</span>
        <div className="sc__q-v">{tab.query || 'Show me all plumbing deals with EBITDA > $2M'}</div>
      </div>
      <div className="sc__body">
        <div className="sc__result">
          {(tab.results || window.DEALS.filter(d => d.industry === 'Plumbing' || d.industry === 'HVAC').slice(0, 3)).map(d => (
            <div key={d.id} className="sc__row">
              <span className={'sc__dot sc__dot--' + d.tone} />
              <div style={{ flex: 1 }}>
                <div className="sc__n">{d.name}</div>
                <div className="sc__s">{d.sub}</div>
              </div>
              <span className="sc__m">{d.revenue}</span>
              <span className="sc__m">Fit {d.fit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Workspace — the active tab's content ──────── */
function Workspace({ tab, portfolio, onOpenTab, onCommand }) {
  const [module, setModule] = wUseState('overview');
  const [paletteOpen, setPaletteOpen] = wUseState(false);

  wUseEffect(() => { setModule('overview'); }, [tab && tab.id]);

  wUseEffect(() => {
    const h = e => {
      const active = document.activeElement;
      const inEditable = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
      if (e.key === '/' && !inEditable) {
        e.preventDefault();
        setPaletteOpen(true);
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  if (!tab) {
    return (
      <div className="ws ws--empty">
        <div className="ws-empty__box">
          <div className="ws-empty__t">No tab open</div>
          <div className="ws-empty__s">Click a deal on the left, or ask Yulia to model a deal.</div>
        </div>
      </div>
    );
  }

  const deal = tab.dealId ? window.DEALS.find(d => d.id === tab.dealId) : null;

  /* Decide which body to render */
  let body;
  if (tab.kind === 'compare') {
    body = <CompareView dealIds={tab.dealIds || []} />;
  } else if (tab.kind === 'portfolio') {
    body = <PortfolioView portfolio={portfolio} />;
  } else if (tab.kind === 'scratch') {
    body = <ScratchView tab={tab} />;
  } else if (tab.kind === 'model') {
    body = <DCFView deal={deal} />;
  } else {
    /* Deal tab — module switcher applies */
    if (module === 'overview') body = <DashboardView deal={deal} />;
    else if (module === 'timeline') body = <TimelineView deal={deal} />;
    else if (module === 'documents') body = <DocumentsView deal={deal} />;
    else if (module === 'rundown') body = <RundownCard deal={deal} />;
    else if (module === 'dd') body = <DDCard deal={deal} />;
    else if (module === 'loi') body = <LOICard deal={deal} />;
    else if (module === 'dcf') body = <DCFView deal={deal} />;
    else if (module === 'sensitivity') body = <AnalysisView deal={deal} />;
  }

  /* Breadcrumb */
  const crumbs = [portfolio.name, tab.label];
  if (tab.kind === 'deal' || !tab.kind.match(/compare|portfolio|scratch|model/)) {
    crumbs.push(MODULES.find(m => m.id === module)?.label || module);
  }

  return (
    <section className="ws pane">
      <div className="ws__head pane__toolbar">
        <div className="ws__crumb">
          {crumbs.map((c, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="ws__crumb-sep">›</span>}
              <span className={'ws__crumb-p' + (i === crumbs.length - 1 ? ' ws__crumb-p--last' : '')}>{c}</span>
            </React.Fragment>
          ))}
        </div>
        <div className="ws__tools">
          <button className="ws__cmd-hint" onClick={() => setPaletteOpen(true)}>
            <span className="ws__cmd-slash">/</span>
            <span>switch module</span>
            <span className="ws__cmd-kbd">⌘K</span>
          </button>
        </div>
      </div>
      <div className="ws__body">{body}</div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onPick={id => setModule(id)}
        tab={tab}
      />
    </section>
  );
}

Object.assign(window, { Workspace, CommandPalette, DCFView, CompareView, PortfolioView, ScratchView, MODULES });
