// Pipeline screen — App Store "Games" style. Category chips on top + featured + curated list.
// Plus Brief screen — Yulia's daily picks, App Store editorial layout.

function PipelineScreen() {
  return (
    <div style={{ background: '#fff', minHeight: '100%', paddingBottom: 110 }}>
      <TopBar title="Pipeline"/>

      {/* Logged-out sample callout */}
      <div style={{ padding: '0 22px 14px' }}>
        <div style={{ fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.45 }}>
          A live sample pipeline. <span style={{ color: 'var(--accent-ink)', fontWeight: 600 }}>Tap any deal</span> to see how Yulia thinks — your real pipeline lives here once you start.
        </div>
      </div>

      {/* Category chips — App Store style */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px 16px', overflowX: 'auto' }} className="hide-scroll">
        {[
          { l: 'Sourced', n: 142 },
          { l: 'Screened', n: 28 },
          { l: 'In review', n: 4 },
          { l: 'Pursuing', n: 2 },
          { l: 'Watching', n: 87 },
        ].map((c, i) => (
          <div key={c.l} style={{
            padding: '9px 16px', borderRadius: 999,
            background: i === 2 ? 'var(--ink)' : '#fff',
            color: i === 2 ? '#fff' : 'var(--ink-1)',
            fontSize: 14, fontWeight: 600,
            boxShadow: i === 2 ? 'none' : '0 1px 3px rgba(0,0,0,0.06), inset 0 0 0 0.5px var(--line-2)',
            whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {c.l}
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              padding: '1px 6px', borderRadius: 999,
              background: i === 2 ? 'rgba(255,255,255,0.2)' : 'var(--card-2)',
              color: i === 2 ? '#fff' : 'var(--ink-3)',
            }}>{c.n}</span>
          </div>
        ))}
      </div>

      {/* Section: New today */}
      <div style={{ padding: '0 22px 8px' }}>
        <div className="section-eyebrow">VIEW SAMPLE · NEW TODAY</div>
        <div className="section-title">Food Svc Distribution · MN</div>
        <div style={{ fontSize: 16, color: 'var(--ink-3)', marginTop: 2 }}>The strongest source this week — tap to see why.</div>
      </div>
      <div style={{ padding: '12px 16px 4px' }}>
        <div className="tap" style={{
          borderRadius: 18, overflow: 'hidden',
          background: 'linear-gradient(160deg, #A9C4E5 0%, #7FA8D9 100%)',
          color: '#fff', position: 'relative',
          boxShadow: '0 8px 22px -10px rgba(0,0,0,0.25)',
        }}>
          <div style={{ height: 200, position: 'relative' }}>
            <div style={{ position: 'absolute', top: -50, right: -30, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.22), transparent 60%)' }}/>
            <div style={{ position: 'absolute', bottom: 16, left: 22 }}>
              <div className="eyebrow">FIT 92 · PURSUE</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, letterSpacing: -0.7, color: '#fff', marginTop: 4, lineHeight: 1.05 }}>
                Recurring revenue.<br/>Honest capex story.
              </div>
            </div>
            <div style={{ position: 'absolute', top: 18, right: 22, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.85)', letterSpacing: 0.1, fontWeight: 600 }}>
              $14.2M REV
            </div>
          </div>
          <div style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <YIcon size={42} kind="cool"/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Food Svc Distribution · MN</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Minneapolis · BizBuySell</div>
            </div>
            <button className="get-pill dark" style={{ padding: '6px 16px', fontSize: 13 }}>Dig in</button>
          </div>
        </div>
      </div>

      {/* What we're playing → "Yulia is watching" */}
      <div style={{ padding: '24px 22px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: -0.5, margin: 0, color: 'var(--ink)' }}>Yulia is watching</h2>
          <Icon.chevron c="var(--ink-3)" size={11}/>
        </div>
        <div style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 2 }}>Sample sources Yulia revisits weekly — yours go here.</div>
      </div>
      <div className="as-card" style={{ margin: '12px 16px 0', padding: '4px 0' }}>
        <PipeRow icon="cool" name="Pest Control Roll-up · FL" sub="$4.1M rev · Orlando" pill="$1.4M SDE"/>
        <PipeRow icon="default" name="Electrical Contractor · TX" sub="$8.7M rev · Austin" pill="Watch"/>
        <PipeRow icon="cool" name="Marina Holdings · FL" sub="$8.2M rev · Tampa Bay" pill="Pursue"/>
        <PipeRow icon="default" name="Boutique Logistics · GA" sub="$6.7M rev · Atlanta" pill="Pursue" last/>
      </div>
    </div>
  );
}

function PipeRow({ icon, name, sub, pill, last }) {
  return (
    <div className="tap" style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 18px', borderBottom: last ? 'none' : '0.5px solid var(--line-2)',
      marginLeft: 18, paddingLeft: 0,
    }}>
      <YIcon size={48} kind={icon} radius={11}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', letterSpacing: -0.2 }}>{name}</div>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 1 }}>{sub}</div>
      </div>
      <button className="get-pill" style={{ padding: '5px 14px', fontSize: 13, marginRight: 18 }}>{pill}</button>
    </div>
  );
}

// Brief screen — App Store "story" feel
function BriefScreen() {
  return (
    <div style={{ background: '#fff', minHeight: '100%', paddingBottom: 110 }}>
      <TopBar title="Brief"/>
      <div style={{ padding: '0 22px 12px' }}>
        <div style={{ fontSize: 14, color: 'var(--ink-3)' }}>
          Sample brief · Friday, March 27 · screened from 142 sourced
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 6, lineHeight: 1.45 }}>
          This is what Yulia sends every morning. <span style={{ color: 'var(--accent-ink)', fontWeight: 600 }}>Start free</span> to get yours.
        </div>
      </div>

      {/* Editorial story card */}
      <div style={{ padding: '8px 16px 0' }}>
        <div className="tap" style={{
          borderRadius: 22, overflow: 'hidden',
          background: 'linear-gradient(165deg, #A8D4BD 0%, #5FA88A 100%)',
          color: '#fff', position: 'relative',
        }}>
          <div style={{ padding: '24px 22px 12px' }}>
            <div className="eyebrow">YULIA · 3 PICKS · 10 MIN</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: -0.7, lineHeight: 1.1, margin: '8px 0 6px', color: '#fff' }}>
              Three worth your<br/>10 minutes today
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.4 }}>
              Recurring revenue, honest add-backs, and one I'd pass on.
            </p>
          </div>
          <div style={{ height: 80, position: 'relative' }}>
            <svg viewBox="0 0 360 80" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              <path d="M0 60 L40 50 L80 55 L120 40 L160 35 L200 25 L240 30 L280 18 L320 22 L360 10 L360 80 L0 80 Z" fill="rgba(255,255,255,0.12)"/>
              <path d="M0 60 L40 50 L80 55 L120 40 L160 35 L200 25 L240 30 L280 18 L320 22 L360 10" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.95"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Picks list */}
      <div style={{ marginTop: 24, padding: '0 16px' }}>
        <div className="as-card" style={{ padding: '20px 0 6px' }}>
          <div style={{ padding: '0 22px 4px' }}>
            <div className="section-eyebrow">RANKED · SAMPLE</div>
            <div className="section-title">Today's three picks</div>
          </div>
          <BriefPick rank={1} name="Food Svc Distribution · MN" sub="Recurring rev · honest capex story" fit={92} kind="pursue"/>
          <BriefPick rank={2} name="Pest Control Roll-up · FL" sub="92% on monthly contracts · add-back rich" fit={84} kind="pursue"/>
          <BriefPick rank={3} name="Electrical Contractor · TX" sub="Margins good but 60% one customer" fit={78} kind="watch" last/>
        </div>
      </div>
    </div>
  );
}

function BriefPick({ rank, name, sub, fit, kind, last }) {
  const c = kind === 'pursue' ? 'var(--accent)' : kind === 'pass' ? 'var(--danger)' : 'var(--warn)';
  return (
    <div className="tap" style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 22px', borderBottom: last ? 'none' : '0.5px solid var(--line-2)',
      marginLeft: 22, paddingLeft: 0,
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--ink-4)', width: 22 }}>{rank}</div>
      <YIcon size={48} kind={kind === 'pursue' ? 'cool' : 'default'} radius={11}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', letterSpacing: -0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingRight: 22, flexShrink: 0 }}>
        <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: c, letterSpacing: -0.5 }}>{fit}</div>
        <div style={{ fontSize: 9, color: 'var(--ink-4)', letterSpacing: 0.1, fontWeight: 600 }}>FIT</div>
      </div>
    </div>
  );
}

window.PipelineScreen = PipelineScreen;
window.BriefScreen = BriefScreen;
