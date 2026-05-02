// V2 Today screen — Liquid Glass push.
// Uses GlassTopBar (translucent, content scrolls under it) instead of static title.
// HeroCard's inner cell uses thicker on-color glass.

function TodayScreen2() {
  return (
    <div style={{ background: '#fff', minHeight: '100%', paddingBottom: 110, position: 'relative' }}>
      <GlassTopBar title="Today"/>

      {/* Large title under the glass bar — the App Store pattern */}
      <LargeTitle>Today</LargeTitle>

      {/* Hero card — logged-out welcome */}
      <div style={{ padding: '4px 16px 0' }}>
        <HeroCard2
          eyebrow="WELCOME TO SMBX · WORKING SAMPLE"
          title={<>Agentic AI built for buying and selling businesses.</>}
          sub="Yulia does the hard work — so your deal team can focus on relationships and closing better, faster."
          deal={{ name: 'Try it free — chat with Yulia', sub: 'No signup · explore a real sample deal' }}
          kind="pursue"
          welcome
        />
      </div>

      {/* Secondary card — "How to try this" guide for new viewers */}
      <div style={{ padding: '14px 16px 0' }}>
        <TryThisCard/>
      </div>

      <div style={{ marginTop: 24, padding: '0 16px' }}>
        <div className="as-card" style={{ padding: '20px 0 6px' }}>
          <div style={{ padding: '0 22px 4px' }}>
            <div className="section-eyebrow">VIEW SAMPLE · IN PIPELINE</div>
            <div className="section-title">5 deals Yulia is working</div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.45 }}>
              Tap any to see what Yulia delivered — verdict, recast, drafts.
            </div>
          </div>
          <PipelineRow icon="cool" name="Marina Holdings · FL" sub="Buyer list — 47 strategics ready" action="open" verdict="pursue"/>
          <PipelineRow icon="default" name="Machine Shop · OH" sub="Pass note · concentration cliff" action="get" price="Pass"/>
          <PipelineRow icon="cool" name="El. Contractor · WA" sub="Structure model done · asset deal +$612K" action="open"/>
          <PipelineRow icon="default" name="Logistics · GA" sub="IOI draft v2 · aggressive but earnest" action="open" verdict="pursue"/>
          <PipelineRow icon="cool" name="Food Svc Distribution · MN" sub="QoE flags · 3 items to verify" action="get" price="Dig in" last/>
        </div>
      </div>

      <div style={{ padding: '16px 22px 4px' }}>
        <div className="section-eyebrow">VIEW SAMPLE · YULIA'S BRIEF</div>
        <div className="section-title">3 picks worth your 10 minutes</div>
        <div style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 4 }}>
          See how Yulia screens 142 sources down to what matters — every morning.
        </div>
      </div>
    </div>
  );
}

// HeroCard with stronger on-color liquid glass inner cell
function HeroCard2({ eyebrow, title, sub, deal, kind = 'pursue', compact = false, welcome = false }) {
  const grads = {
    pursue: ['#A8D4BD', '#5FA88A'],
    watch:  ['#EBC891', '#C99959'],
    pass:   ['#EBB1AA', '#C6857D'],
  };
  const [c1, c2] = grads[kind] || grads.pursue;

  return (
    <div className="tap" style={{
      borderRadius: 22,
      background: `linear-gradient(165deg, ${c1} 0%, ${c2} 100%)`,
      color: '#fff', overflow: 'hidden',
      boxShadow: '0 12px 28px -10px rgba(0,0,0,0.25)',
      position: 'relative',
    }}>
      <div style={{ position: 'relative', height: compact ? 130 : 280, overflow: 'hidden' }}>
        <HeroVisual2 kind={kind}/>
        <div style={{ position: 'absolute', top: 18, left: 22 }}>
          <div className="eyebrow">{eyebrow}</div>
        </div>
      </div>

      <div style={{ padding: compact ? '6px 22px 0' : '4px 22px 0' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: compact ? 22 : 26, letterSpacing: -0.6,
          lineHeight: 1.1, margin: 0, color: '#fff',
        }}>{title}</h2>
        <p style={{
          fontSize: 14, color: 'rgba(255,255,255,0.85)',
          margin: '8px 0 0', lineHeight: 1.35,
        }}>{sub}</p>
      </div>

      {/* Inner cell — pronounced liquid glass over the colored hero */}
      <GlassSurface tint="onColor" radius={16} style={{
        margin: '16px 14px 14px',
        padding: '10px 12px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <YIcon2 size={42} kind={kind}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', letterSpacing: -0.2 }}>{deal.name}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.78)', marginTop: 1 }}>{deal.sub}</div>
        </div>
        <button className="get-pill dark" style={{ padding: '6px 16px', fontSize: 13 }}>{welcome ? 'Start' : 'Open'}</button>
      </GlassSurface>
    </div>
  );
}

function HeroVisual2({ kind }) {
  if (kind === 'pursue') {
    return (
      <div style={{ position: 'absolute', inset: 0 }}>
        <div style={{ position: 'absolute', top: -60, right: -40, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.22), transparent 60%)' }}/>
        <div style={{ position: 'absolute', bottom: -80, left: -30, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.12), transparent 60%)' }}/>
        <svg viewBox="0 0 360 280" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="sparkfill2a" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.18)"/>
              <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
            </linearGradient>
          </defs>
          <path d="M0 220 L40 210 L80 200 L120 180 L160 168 L200 140 L240 110 L280 90 L320 70 L360 50 L360 280 L0 280 Z" fill="url(#sparkfill2a)"/>
          <path d="M0 220 L40 210 L80 200 L120 180 L160 168 L200 140 L240 110 L280 90 L320 70 L360 50" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.95"/>
        </svg>
        <div style={{ position: 'absolute', bottom: 18, right: 22, textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.1 }}>SDE</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 56, letterSpacing: -2, lineHeight: 1, color: '#fff' }}>$1.80M</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>+$760K NORMALIZED</div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', top: -40, right: -30, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.18), transparent 60%)' }}/>
      <div style={{
        position: 'absolute', top: 50, right: 22,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div className="pulse-dot" style={{ color: '#fff', width: 8, height: 8 }}/>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff', letterSpacing: 0.1, fontWeight: 600 }}>YULIA WORKING</span>
      </div>
    </div>
  );
}

window.TodayScreen2 = TodayScreen2;
window.HeroCard2 = HeroCard2;
