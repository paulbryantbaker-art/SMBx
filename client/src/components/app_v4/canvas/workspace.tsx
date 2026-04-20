/**
 * Canvas workspace views — DCF / Compare / Portfolio / Scratch.
 * Port of claude_design/app/project/workspace.jsx (lines 77–369).
 *
 * Each view renders inside V4Canvas body when the active tab matches.
 * Dispatched from V4CanvasBody in ../chrome/V4Canvas.tsx.
 */
import { useState, type CSSProperties } from 'react';
import { DEALS, STAGES, type Deal, type Portfolio } from '../data';
import type { Tab } from '../session';
import './workspace.css';

/* ═══════════════════════════════════════════════════════════════════
   DCF — full projection + assumptions + bar chart
   ═══════════════════════════════════════════════════════════════════ */

export function DCFView({ deal }: { deal: Deal | null }) {
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
  const tv = (proj[4].fcf * 1.025) / (wacc - 0.025);
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
        {proj.map(p => (
          <div key={p.y} className="dcf__bar">
            <div className="dcf__bar-fill" style={{ height: `${(p.fcf / proj[4].fcf) * 100}%` }} />
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

/* ═══════════════════════════════════════════════════════════════════
   COMPARE — 3-mode view (side / overlay / table)
   ═══════════════════════════════════════════════════════════════════ */

type CompareMode = 'side' | 'overlay' | 'table';

export function CompareView({ dealIds, onOpenDeal }: {
  dealIds: string[];
  onOpenDeal?: (d: Deal) => void;
}) {
  const [mode, setMode] = useState<CompareMode>('side');
  const deals = dealIds
    .map(id => DEALS.find(d => d.id === id))
    .filter((d): d is Deal => !!d);
  if (deals.length === 0) return <div className="ws__empty">No deals to compare</div>;

  const metrics: { k: string; label: string; get: (d: Deal) => number; fmt: (v: number) => string }[] = [
    { k: 'revenue', label: 'Revenue',       get: d => parseFloat(d.revenue.replace(/[^0-9.]/g, '')), fmt: v => `$${v.toFixed(1)}M` },
    { k: 'ebitda',  label: 'EBITDA margin', get: d => parseFloat(d.ebitda),                           fmt: v => `${v.toFixed(0)}%` },
    { k: 'score',   label: 'Rundown',       get: d => d.score ?? 0,                                    fmt: v => `${v}/100` },
    { k: 'fit',     label: 'Thesis fit',    get: d => d.fit,                                           fmt: v => `${v}` },
  ];

  const openDeal = (d: Deal) => onOpenDeal?.(d);

  return (
    <div className="cmp">
      <div className="cmp__toolbar">
        <div className="cmp__seg">
          <button type="button" className={mode === 'side' ? 'active' : ''}    onClick={() => setMode('side')}>Side-by-side</button>
          <button type="button" className={mode === 'overlay' ? 'active' : ''} onClick={() => setMode('overlay')}>Overlay chart</button>
          <button type="button" className={mode === 'table' ? 'active' : ''}   onClick={() => setMode('table')}>Table</button>
        </div>
        <div className="cmp__chips">
          {deals.map(d => (
            <span key={d.id} className="cmp__chip">
              <span className={`cmp__chip-dot cmp__chip-dot--${d.tone}`} />
              {d.name}
            </span>
          ))}
        </div>
      </div>

      {mode === 'side' && (
        <div className="cmp__grid" style={{ gridTemplateColumns: `repeat(${deals.length}, 1fr)` }}>
          {deals.map(d => (
            <div key={d.id} className="cmp__col">
              <div className="cmp__col-h" onClick={() => openDeal(d)} title={`Open ${d.name}`}>
                <div className="cmp__col-n">{d.name}</div>
                <div className="cmp__col-s">{d.sub}</div>
                <div className="cmp__col-open">OPEN DEAL →</div>
              </div>
              {metrics.map(m => (
                <div
                  key={m.k}
                  className="cmp__metric cmp__metric--clickable"
                  onClick={() => openDeal(d)}
                  title={`Open ${d.name} → ${m.label}`}
                >
                  <div className="cmp__metric-k">{m.label}</div>
                  <div className="cmp__metric-v">{m.fmt(m.get(d))}</div>
                  <svg className="cmp__metric-drill" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                </div>
              ))}
              <div className="cmp__dims">
                {d.dims.slice(0, 4).map(dm => (
                  <div key={dm.label} className="cmp__dim cmp__dim--clickable" onClick={() => openDeal(d)}>
                    <span className="cmp__dim-k">{dm.label}</span>
                    <span className="cmp__dim-v">{dm.value.toFixed(1)}</span>
                    <div className="cmp__dim-bar">
                      <div style={{
                        width: `${dm.value * 10}%`,
                        background: dm.tone === 'green' ? '#22A755' : dm.tone === 'amber' ? '#E8A033' : '#D4533A',
                      }} />
                    </div>
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
                <div>
                  {deals.map((d, i) => (
                    <div key={d.id} className="cmp__ov-row">
                      <span className="cmp__ov-n">{d.name.split(' ')[0]}</span>
                      <div className="cmp__ov-bar">
                        <div
                          className="cmp__ov-fill"
                          style={{
                            width: `${(vals[i] / max) * 100}%`,
                            background: d.tone === 'ok' ? '#0A0A0B' : d.tone === 'warn' ? '#E8A033' : '#D4533A',
                          }}
                        />
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
        <div
          className="cmp__tbl"
          style={{ gridTemplateColumns: `1.4fr repeat(${deals.length}, 1fr)` } as CSSProperties}
        >
          <div
            className="cmp__tbl-row cmp__tbl-row--h"
            style={{ gridTemplateColumns: `1.4fr repeat(${deals.length}, 1fr)` }}
          >
            <span>Metric</span>
            {deals.map(d => <span key={d.id}>{d.name}</span>)}
          </div>
          {metrics.map(m => (
            <div
              key={m.k}
              className="cmp__tbl-row"
              style={{ gridTemplateColumns: `1.4fr repeat(${deals.length}, 1fr)` }}
            >
              <span className="cmp__tbl-k">{m.label}</span>
              {deals.map(d => <span key={d.id}>{m.fmt(m.get(d))}</span>)}
            </div>
          ))}
          {deals[0].dims.map((_, di) => {
            const label = deals[0].dims[di]?.label;
            if (!label) return null;
            return (
              <div
                key={di}
                className="cmp__tbl-row"
                style={{ gridTemplateColumns: `1.4fr repeat(${deals.length}, 1fr)` }}
              >
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

/* ═══════════════════════════════════════════════════════════════════
   PORTFOLIO — KPIs + stage kanban
   ═══════════════════════════════════════════════════════════════════ */

export function PortfolioView({ portfolio }: { portfolio: Portfolio }) {
  const deals = DEALS.filter(d => portfolio.dealIds.includes(d.id));
  const live = deals.filter(d => d.score != null);
  const avgScore = live.length
    ? Math.round(live.reduce((s, d) => s + (d.score ?? 0), 0) / live.length)
    : 0;
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
        {STAGES.map(s => {
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
                    <span className={`pov__card-dot pov__card-dot--${d.tone}`} />
                    <strong>{d.name}</strong>
                  </div>
                  <div className="pov__card-s">{d.kicker}</div>
                  <div className="pov__card-m">{d.revenue} · Fit {d.fit}{d.score != null ? ` · ${d.score}/100` : ''}</div>
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

/* ═══════════════════════════════════════════════════════════════════
   SCRATCH — ad-hoc query results
   ═══════════════════════════════════════════════════════════════════ */

interface ScratchTab extends Tab {
  query?: string;
  results?: Deal[];
}

export function ScratchView({ tab }: { tab: ScratchTab }) {
  const results = tab.results ?? DEALS.filter(d => d.industry === 'Plumbing' || d.industry === 'HVAC').slice(0, 3);
  return (
    <div className="sc">
      <div className="sc__q">
        <span className="sc__q-k">Query</span>
        <div className="sc__q-v">{tab.query || 'Show me all plumbing deals with EBITDA > $2M'}</div>
      </div>
      <div className="sc__result">
        {results.map(d => (
          <div key={d.id} className="sc__row">
            <span className={`sc__dot sc__dot--${d.tone}`} />
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
  );
}
