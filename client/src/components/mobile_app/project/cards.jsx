/* ═══════════════════════════════════════════════════════════
   Workbench cards — Rundown, DD, LOI, Compare, Model, Chart, Source
   Shared atoms: Bench, Row, Pill, DimRow, ScoreDonut
   ═══════════════════════════════════════════════════════════ */

const TONE_HEX = { green: '#22A755', amber: '#E8A033', red: '#D4533A' };

/* ── Atoms ───────────────────────────────────── */

function Bench({ title, meta, metaLive = true, flash = false, children, padBody = true, style }) {
  return (
    <div className={'bench' + (flash ? ' flash' : '')} style={style}>
      <div className="bench__head">
        <div className="bench__title">{title}</div>
        {meta && (
          <div className="bench__meta">
            {metaLive && <span className="bench__dot" />}
            {meta}
          </div>
        )}
      </div>
      <div className="bench__body" style={padBody ? null : { padding: 0 }}>
        {children}
      </div>
    </div>
  );
}

function Row({ title, sub, amt }) {
  return (
    <div className="row">
      <div>
        <div className="row__title">{title}</div>
        {sub && <div className="row__sub">{sub}</div>}
      </div>
      <div className="row__amt">{amt}</div>
    </div>
  );
}

function Pill({ tone = 'ok', children }) {
  return <span className={`pill pill--${tone}`}>{children}</span>;
}

function DimRow({ label, value, tone }) {
  return (
    <div className="dim">
      <span className="dim__dot" style={{ background: TONE_HEX[tone] }} />
      <span className="dim__lbl">{label}</span>
      <span className="dim__bar"><span className="dim__bar-fill" style={{ width: (value * 10) + '%' }} /></span>
      <span className="dim__val">{value.toFixed(1)}</span>
    </div>
  );
}

function ScoreDonut({ score, max = 100, size = 140 }) {
  const C = 2 * Math.PI * 90;
  const pct = Math.max(0, Math.min(1, score / max));
  const off = C * (1 - pct);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
        <circle cx="100" cy="100" r="90" fill="none" stroke="#F0F0F2" strokeWidth="14" />
        <circle
          cx="100" cy="100" r="90" fill="none" stroke="#0A0A0B" strokeWidth="14"
          strokeLinecap="round" strokeDasharray={C} strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.19,1,0.22,1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: size * 0.3, letterSpacing: '-0.035em', lineHeight: 1 }}>
          {score}<span style={{ fontSize: size * 0.11, color: '#9A9A9F' }}>/{max}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Rundown card ─────────────────────────────── */

function RundownCard({ deal, compact = false }) {
  return (
    <Bench
      title={`Rundown · ${deal.name}`}
      meta={<>YULIA · {deal.lastUpdate.toUpperCase()} AGO</>}
    >
      <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 14 }}>
        <ScoreDonut score={deal.score || 0} size={compact ? 110 : 140} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <Pill tone={deal.status === 'pursue' ? 'ok' : deal.status === 'pass' ? 'flag' : 'warn'}>
              {deal.status === 'pursue' ? 'Pursue' : deal.status === 'pass' ? 'Pass' : 'Hold'}
            </Pill>
            <Pill tone="ink">Fit {deal.fit}</Pill>
          </div>
          <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 14, letterSpacing: '-0.005em', marginBottom: 4 }}>
            {deal.name}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--gg-mute)', lineHeight: 1.5 }}>
            {deal.industry} · {deal.revenue} rev · {deal.ebitda} EBITDA
          </div>
        </div>
      </div>
      <div style={{ borderTop: '0.5px solid var(--gg-border-soft)', paddingTop: 10 }}>
        {deal.dims.map(d => <DimRow key={d.label} {...d} />)}
      </div>
    </Bench>
  );
}

/* ── Sourcing list ─────────────────────────────── */

function SourcingCard({ deals }) {
  return (
    <Bench
      title="Deal flow · HVAC roll-up · TX+OK"
      meta="LIVE · 47 NEW THIS WEEK"
    >
      <div className="src">
        {deals.map(d => (
          <div key={d.id} className="src__row">
            <div>
              <div className="src__t">{d.name}</div>
              <div className="src__s">{d.sub} · {d.revenue} rev · {d.ebitda} EBITDA</div>
            </div>
            <div className="src__fit">{d.fit}<small>FIT</small></div>
          </div>
        ))}
        <div className="src__row" style={{ background: '#F5F5F7', margin: '0 -18px -16px', padding: '12px 18px' }}>
          <div>
            <div className="src__t">+ 44 more matching thesis</div>
            <div className="src__s">Named, contactable, fit ≥ 70</div>
          </div>
          <div className="src__fit" style={{ fontSize: 13 }}>View all</div>
        </div>
      </div>
    </Bench>
  );
}

/* ── DD workstreams ────────────────────────────── */

const DD_ROWS = [
  { label: 'Quality of earnings',       sub: 'EBITDA adj, normalizations',     pill: 'ok',   text: 'Cleared' },
  { label: 'Working capital peg',       sub: 'NWC trailing 12mo',              pill: 'ok',   text: 'Cleared' },
  { label: 'Backlog verification',      sub: 'Signed MSAs · POs',              pill: 'ok',   text: 'Cleared' },
  { label: 'Customer concentration',    sub: '38% top-3 · MSA review',         pill: 'flag', text: 'Flag' },
  { label: 'Key-person risk',           sub: 'Non-compete · retention plan',   pill: 'warn', text: 'Today' },
  { label: 'Environmental',             sub: 'Phase I site assessment',        pill: 'warn', text: 'Today' },
  { label: 'Legal · contracts',         sub: 'Change-of-control review',       pill: 'ok',   text: 'Cleared' },
  { label: 'Insurance · claims',        sub: '3yr loss runs',                  pill: 'ok',   text: 'Cleared' },
];

function DDCard({ deal }) {
  return (
    <Bench title={`DD pack · ${deal.name}`} meta="42 WORKSTREAMS · 38 CLEARED">
      <div className="dd">
        {DD_ROWS.map(r => (
          <div key={r.label} className="dd__row">
            <div className="dd__lbl">
              {r.label}
              <small>{r.sub}</small>
            </div>
            <Pill tone={r.pill}>{r.text}</Pill>
          </div>
        ))}
      </div>
    </Bench>
  );
}

/* ── LOI structures ────────────────────────────── */

function LOICard({ deal }) {
  return (
    <Bench title={`LOI structures · ${deal.name}`} meta="3 SCENARIOS MODELED">
      <div className="loi">
        <div className="loi__card rec">
          <div className="loi__rec-badge">Recommended</div>
          <div className="loi__price">$16.8M</div>
          <div className="loi__struc">70 cash / 20 note / 10 rollover</div>
          <div className="loi__note">Maximizes their after-tax NPV, keeps your check under $12M. Rollover aligns seller through year 3 — exactly when concentration risk unwinds.</div>
        </div>
        <div className="loi__card">
          <div className="loi__price">$15.2M</div>
          <div className="loi__struc">100 cash at close</div>
          <div className="loi__note">Cleanest close. Seller leaves $1.6M on table vs. recommended structure.</div>
        </div>
        <div className="loi__card">
          <div className="loi__price">$18.4M</div>
          <div className="loi__struc">60 cash / 15 earnout / 25 rollover</div>
          <div className="loi__note">Highest headline price but 40% contingent. Use only if seller is married to the ask.</div>
        </div>
      </div>
    </Bench>
  );
}

/* ── Compare (portfolio) ───────────────────────── */

function CompareCard({ deals }) {
  return (
    <Bench title="Portfolio compare · 3 live deals" meta="STACK-RANKED">
      <div className="compare" style={{ '--cols': deals.length }}>
        {deals.map(d => (
          <div key={d.id} className="compare__col">
            <div className="compare__col-t">{d.name}</div>
            <div className="compare__col-s">{d.industry} · {d.stage}</div>
            <div className="compare__score">{d.score}<small>/100</small></div>
            <div className="compare__rows">
              <div><span>Fit</span><span>{d.fit}</span></div>
              <div><span>Revenue</span><span>{d.revenue}</span></div>
              <div><span>EBITDA</span><span>{d.ebitda}</span></div>
              <div><span>Concentration</span><span style={{ color: d.dims[2] ? TONE_HEX[d.dims[2].tone] : '#000' }}>{d.dims[2] ? d.dims[2].value.toFixed(1) : '—'}</span></div>
              <div><span>Owner risk</span><span style={{ color: d.dims[4] ? TONE_HEX[d.dims[4].tone] : '#000' }}>{d.dims[4] ? d.dims[4].value.toFixed(1) : '—'}</span></div>
              <div><span>Status</span><span><Pill tone={d.status === 'pursue' ? 'ok' : 'warn'}>{d.status}</Pill></span></div>
            </div>
          </div>
        ))}
      </div>
    </Bench>
  );
}

/* ── Financial model (code-like output) ────────── */

function ModelCard({ deal }) {
  return (
    <Bench title={`QoE model · ${deal.name}`} meta="ADJUSTED EBITDA · TTM">
      <pre className="fm" style={{ margin: 0 }}>
{`<span class="l">// Quality of Earnings · adjusted EBITDA</span>
<span class="k">reported_ebitda</span>   = <span class="v">$1,012,400</span>
<span class="k">owner_comp_addback</span> = <span class="g">+ $184,200</span>
<span class="k">personal_expenses</span>  = <span class="g">+ $42,800</span>
<span class="k">one_time_legal</span>     = <span class="g">+ $18,500</span>
<span class="k">rent_normalization</span> = <span class="r">- $14,900</span>
<span class="l">—</span>
<span class="k">adjusted_ebitda</span>   = <span class="v">$1,243,000</span>
<span class="k">adj_margin</span>        = <span class="v">20.0%</span>
<span class="k">wc_peg</span>            = <span class="v">$620,000</span>
<span class="k">net_debt</span>          = <span class="v">$105,000</span>`}
      </pre>
    </Bench>
  );
}

/* ── Chart (revenue trend) ─────────────────────── */

function ChartCard({ deal }) {
  const data = [
    { y: '2020', v: 4.2 },
    { y: '2021', v: 4.9 },
    { y: '2022', v: 4.7 },
    { y: '2023', v: 5.6 },
    { y: '2024', v: 6.2 },
  ];
  const max = 7;
  return (
    <Bench title={`Revenue trend · ${deal.name}`} meta="5YR · $M">
      <div className="chart">
        {data.map((d, i) => (
          <div key={d.y} className={'chart__bar' + (i === 2 ? ' muted' : '')}
               style={{ height: (d.v / max * 100) + '%' }}>
            <div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, textAlign: 'center', fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 11, marginBottom: 4 }}>{d.v}</div>
          </div>
        ))}
      </div>
      <div className="chart__lbls">
        {data.map(d => <span key={d.y}>{d.y}</span>)}
      </div>
    </Bench>
  );
}

/* Export */
Object.assign(window, {
  Bench, Row, Pill, DimRow, ScoreDonut,
  RundownCard, SourcingCard, DDCard, LOICard, CompareCard, ModelCard, ChartCard,
  TONE_HEX,
});
