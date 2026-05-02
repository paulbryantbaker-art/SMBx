// Detail screen — App Store app-detail style for a deal.
// Big icon + name + dev row, stats strip, tag chips, what's new, a closer look (artifacts), ratings (Yulia's confidence + your notes).

function DetailScreen({ onBack = () => {} }) {
  return (
    <div style={{ background: '#fff', minHeight: '100%', paddingBottom: 110 }}>
      {/* Floating nav buttons */}
      <FloatingNav onBack={onBack}/>

      {/* Hero block — icon + name + verdict */}
      <div style={{ padding: '60px 22px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <YIcon size={108} kind="pursue" radius={24}/>
        <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 22, letterSpacing: -0.5, lineHeight: 1.1,
            margin: 0, color: 'var(--ink)',
          }}>Industrial Svc · TX</h1>
          <div style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 4 }}>East Texas · Deal #SMBX-0119</div>
          <div style={{ marginTop: 10 }}>
            <button className="get-pill solid" style={{ padding: '7px 26px', fontSize: 15 }}>Pursue</button>
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 4, textAlign: 'center', maxWidth: 110 }}>
            Yulia's verdict
          </div>
        </div>
      </div>

      {/* Stats strip — like App Store ratings · age · chart */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        padding: '4px 22px 18px',
        gap: 0,
      }}>
        <Stat top="$1.80M" label="NORM. SDE" sub={<span style={{ color: 'var(--accent)' }}>+$760K</span>}/>
        <Stat top="7.0×" label="MULTIPLE" sub="SBA-clear"/>
        <Stat top="92" label="FIT SCORE" sub={<Stars n={4.6}/>}/>
        <Stat top="#3" label="THIS WEEK" sub="of 142"/>
      </div>

      {/* Tag chips (App Store category chips) */}
      <div style={{ display: 'flex', gap: 8, padding: '0 22px 20px', overflowX: 'auto' }} className="hide-scroll">
        {['Industrial', 'Services', 'Recurring', 'SBA-clear', 'Sun Belt'].map(t => (
          <div key={t} style={{
            padding: '7px 14px', borderRadius: 999,
            background: 'var(--card-2)',
            fontSize: 13, color: 'var(--ink-1)', fontWeight: 500,
            whiteSpace: 'nowrap',
          }}>{t}</div>
        ))}
      </div>

      {/* What's New — Yulia's latest note */}
      <Section title="What's Yulia saying" eyebrow={null} chevron>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-4)', marginBottom: 6 }}>
          UPDATED 2 MIN AGO &nbsp;·&nbsp; v3
        </div>
        <p style={{ fontSize: 15, color: 'var(--ink-1)', lineHeight: 1.45, margin: 0, letterSpacing: -0.1 }}>
          Recast is real. $760K of add-backs are clean — owner comp, family payroll, one-time legal, M&E. The 38% top-5 concentration looks scary on paper but they've held those accounts 6+ years with zero churn. That's a moat, not a risk. NWC peg is below median; flag for QoE. Drafting the IOI now.
        </p>
      </Section>

      {/* A Closer Look — artifact rail (horizontal scroll, card preview) */}
      <Section title="A closer look" eyebrow={null} pad={false}>
        <div style={{ display: 'flex', gap: 14, padding: '4px 22px 4px', overflowX: 'auto' }} className="hide-scroll">
          <ArtifactPreview kind="recast" title="Recast walk" big="$1.80M" sub="P&L normalization · 5 lines"/>
          <ArtifactPreview kind="baseline" title="Baseline range" big="$7.2–9.4M" sub="4 scenarios · SBA at $7.8M"/>
          <ArtifactPreview kind="buyers" title="Buyer list" big="69" sub="47 strategics · 22 sponsors"/>
          <ArtifactPreview kind="ioi" title="IOI draft" big="v2" sub="Aggressive but earnest"/>
        </div>
      </Section>

      {/* Ratings & Reviews → "Yulia's confidence + Your notes" */}
      <Section title="Confidence & notes" eyebrow={null} chevron>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, paddingTop: 4 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 56, letterSpacing: -2, lineHeight: 1, color: 'var(--ink)' }}>
              4.6
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>out of 5</div>
          </div>
          <div style={{ flex: 1 }}>
            <Stars n={4.6} size={14}/>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>Yulia's confidence</div>
            <div style={{ marginTop: 6, fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.4 }}>
              Verdict held across 3 reviews. Concentration risk and NWC peg are the only two reasons confidence isn't 5/5.
            </div>
          </div>
        </div>

        {/* Your note row */}
        <div style={{
          marginTop: 16, padding: 14,
          background: 'var(--card-2)', borderRadius: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Stars n={5} size={11}/>
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>·&nbsp;you, 1d ago</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
            Worth the call. Lining up the SBA pre-qual today.
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.4 }}>
            The recast story tracks with what the broker mentioned off-record. I want to see the customer contracts before IOI goes out.
          </div>
        </div>
      </Section>
    </div>
  );
}

function FloatingNav({ onBack }) {
  const btn = {
    width: 32, height: 32, borderRadius: '50%',
    background: 'rgba(255,255,255,0.78)',
    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  };
  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60, background: 'transparent', zIndex: 5 }}/>
      <button onClick={onBack} style={{ ...btn, position: 'absolute', top: 18, left: 16, zIndex: 10 }}>
        <Icon.back c="var(--ink-1)" size={14}/>
      </button>
      <button style={{ ...btn, position: 'absolute', top: 18, right: 16, zIndex: 10 }}>
        <Icon.share c="var(--ink-1)" size={16}/>
      </button>
    </>
  );
}

function Stat({ top, label, sub }) {
  return (
    <div style={{ borderRight: '0.5px solid var(--line-2)', padding: '0 4px', minWidth: 0 }} className="last:border-0">
      <div style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: 0.1, fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: -0.4, color: 'var(--ink)', marginTop: 2 }}>{top}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function Stars({ n, size = 12 }) {
  const full = Math.floor(n);
  const half = n - full >= 0.3 && n - full <= 0.7;
  return (
    <span style={{ display: 'inline-flex', gap: 1.5, color: 'var(--ink-1)' }}>
      {[0,1,2,3,4].map(i => (
        <Icon.star key={i} size={size} c={i < full ? 'var(--ink-1)' : (i === full && half ? 'var(--ink-1)' : 'var(--ink-5)')}/>
      ))}
    </span>
  );
}

function Section({ title, eyebrow, chevron, pad = true, children }) {
  return (
    <div style={{ borderTop: '0.5px solid var(--line-2)', padding: pad ? '20px 22px 22px' : '20px 0 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: pad ? 0 : '0 22px', marginBottom: 10 }}>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: 22, letterSpacing: -0.5, color: 'var(--ink)',
          margin: 0, display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {title}
          {chevron && <Icon.chevron c="var(--ink-3)" size={11}/>}
        </h3>
      </div>
      {children}
    </div>
  );
}

function ArtifactPreview({ kind, title, big, sub }) {
  const grads = {
    recast:   ['#A8D4BD', '#5FA88A'],
    baseline: ['#A9C4E5', '#7FA8D9'],
    buyers:   ['#C5B0E5', '#9077C5'],
    ioi:      ['#3A4150', '#1A2233'],
  };
  const [c1, c2] = grads[kind] || grads.recast;
  return (
    <div className="tap" style={{
      flexShrink: 0, width: 220, borderRadius: 18,
      background: `linear-gradient(160deg, ${c1}, ${c2})`,
      color: '#fff', overflow: 'hidden', position: 'relative',
      boxShadow: '0 6px 18px -8px rgba(0,0,0,0.2)',
    }}>
      <div style={{ height: 130, position: 'relative' }}>
        <div style={{ position: 'absolute', top: -30, right: -20, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)' }}/>
        <div style={{ position: 'absolute', bottom: 12, left: 16, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 0.1, color: 'rgba(255,255,255,0.7)' }}>{title.toUpperCase()}</div>
        <div style={{ position: 'absolute', bottom: 24, left: 16, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, letterSpacing: -1, lineHeight: 1, color: '#fff' }}>{big}</div>
      </div>
      <div style={{ padding: '10px 14px 12px', background: 'rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.3 }}>{sub}</div>
        <button className="get-pill dark" style={{ padding: '4px 14px', fontSize: 12 }}>Open</button>
      </div>
    </div>
  );
}

window.DetailScreen = DetailScreen;
