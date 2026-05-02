// V2 mobile primitives — Liquid Glass push.
// Tab bar, top bar (translucent on scroll), and floating buttons all
// use multi-layer iOS-spec glass: blur + saturate + brightness + edge highlight.

const Icon2 = {
  search: (p) => <svg width={p.size||17} height={p.size||17} viewBox="0 0 17 17" fill="none"><circle cx="7.5" cy="7.5" r="5.5" stroke={p.c||'currentColor'} strokeWidth="1.8"/><path d="M11.6 11.6L15 15" stroke={p.c||'currentColor'} strokeWidth="1.8" strokeLinecap="round"/></svg>,
  chat: (p) => <svg width={p.size||20} height={p.size||20} viewBox="0 0 20 20" fill="none"><path d="M3 9.2C3 5.6 5.8 3 9.5 3H10.5C14.2 3 17 5.6 17 9.2C17 12.8 14.2 15.4 10.5 15.4H8.6L5.4 17.6C5.1 17.8 4.7 17.6 4.7 17.2V14.9C3.6 13.6 3 12 3 9.2Z" stroke={p.c||'currentColor'} strokeWidth="1.7" strokeLinejoin="round"/></svg>,
  back: (p) => <svg width={p.size||14} height={p.size||22} viewBox="0 0 14 22" fill="none"><path d="M11 2L3 11L11 20" stroke={p.c||'#000'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  share: (p) => <svg width={p.size||18} height={p.size||20} viewBox="0 0 18 20" fill="none"><path d="M9 2V13M9 2L5.5 5.5M9 2L12.5 5.5" stroke={p.c||'currentColor'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 10V17C3 17.6 3.4 18 4 18H14C14.6 18 15 17.6 15 17V10" stroke={p.c||'currentColor'} strokeWidth="1.7" strokeLinecap="round"/></svg>,
  today: (p) => <svg width={22} height={22} viewBox="0 0 22 22" fill={p.active?p.c:'none'} stroke={p.c||'currentColor'} strokeWidth="1.5"><rect x="4" y="3" width="14" height="16" rx="2"/><path d="M4 7H18" strokeWidth="1.2"/></svg>,
  pipeline: (p) => <svg width={22} height={22} viewBox="0 0 22 22" fill={p.active?p.c:'none'} stroke={p.c||'currentColor'} strokeWidth="1.5"><path d="M3 5L11 9L19 5L11 1L3 5Z"/><path d="M3 11L11 15L19 11" strokeLinejoin="round"/><path d="M3 17L11 21L19 17" strokeLinejoin="round"/></svg>,
  brief: (p) => <svg width={22} height={22} viewBox="0 0 22 22" fill={p.active?p.c:'none'} stroke={p.c||'currentColor'} strokeWidth="1.5"><path d="M5 3H17V19H5V3Z"/><path d="M8 7H14M8 11H14M8 15H12" strokeLinecap="round" strokeWidth="1.2"/></svg>,
};

// ── Liquid Glass surface primitive.
// Stacks: background tint + thick backdrop-filter (blur + saturate + brightness)
// + 0.5px inner edge highlight + subtle shadow. This is the iOS 26 spec recipe.
function GlassSurface({ children, radius = 999, tint = 'light', style = {}, ...rest }) {
  const tints = {
    light: {
      bg: 'rgba(255,255,255,0.55)',
      filter: 'blur(32px) saturate(180%) brightness(1.05)',
      edge: 'inset 0 0 0 0.5px rgba(255,255,255,0.7), inset 0 1px 0 rgba(255,255,255,0.55)',
      shadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px -6px rgba(0,0,0,0.10)',
    },
    chrome: {
      bg: 'rgba(255,255,255,0.62)',
      filter: 'blur(40px) saturate(180%) brightness(1.06)',
      edge: 'inset 0 0 0 0.5px rgba(255,255,255,0.75), inset 0 1px 0 rgba(255,255,255,0.55)',
      shadow: '0 1px 0 rgba(0,0,0,0.04), 0 10px 30px -8px rgba(0,0,0,0.14)',
    },
    dark: {
      bg: 'rgba(28,28,32,0.62)',
      filter: 'blur(40px) saturate(180%) brightness(0.92)',
      edge: 'inset 0 0 0 0.5px rgba(255,255,255,0.18), inset 0 1px 0 rgba(255,255,255,0.10)',
      shadow: '0 1px 3px rgba(0,0,0,0.20), 0 10px 28px -8px rgba(0,0,0,0.40)',
    },
    onColor: {
      // For glass cells INSIDE a colored hero — content shows through, subtle white wash
      bg: 'rgba(255,255,255,0.18)',
      filter: 'blur(20px) saturate(180%) brightness(1.10)',
      edge: 'inset 0 0 0 0.5px rgba(255,255,255,0.32), inset 0 1px 0 rgba(255,255,255,0.22)',
      shadow: '0 1px 2px rgba(0,0,0,0.06)',
    },
  };
  const t = tints[tint] || tints.light;
  return (
    <div {...rest} style={{
      borderRadius: radius,
      background: t.bg,
      backdropFilter: t.filter,
      WebkitBackdropFilter: t.filter,
      boxShadow: `${t.edge}, ${t.shadow}`,
      ...style,
    }}>{children}</div>
  );
}

function YIcon2({ size = 60, kind = 'default', radius }) {
  const r = radius ?? size * 0.225;
  const grads = {
    default: ['#A8D4BD', '#5FA88A'],
    pursue: ['#A8D4BD', '#5FA88A'],
    watch: ['#EBC891', '#C99959'],
    pass: ['#EBB1AA', '#C6857D'],
    cool: ['#A9C4E5', '#7FA8D9'],
  };
  const [c1, c2] = grads[kind] || grads.default;
  return (
    <div style={{
      width: size, height: size, borderRadius: r,
      background: `linear-gradient(155deg, ${c1} 0%, ${c2} 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff',
      fontFamily: 'var(--font-display)', fontWeight: 700,
      fontSize: size * 0.5, letterSpacing: -1,
      boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.15), 0 1px 2px rgba(0,0,0,0.08)',
      flexShrink: 0,
    }}>Y</div>
  );
}

// Floating glass tab bar — thicker glass, edge highlights, true iOS 26 feel
function TabBar2({ active = 'today', onChange = () => {} }) {
  const tabs = [
    { id: 'today', label: 'Today', icon: Icon2.today },
    { id: 'pipeline', label: 'Pipeline', icon: Icon2.pipeline },
    { id: 'brief', label: 'Brief', icon: Icon2.brief },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 18, left: 12, right: 12,
      display: 'flex', alignItems: 'center', gap: 10,
      zIndex: 40,
    }}>
      <GlassSurface tint="chrome" radius={999} style={{
        flex: 1,
        display: 'flex', justifyContent: 'space-around', padding: '8px 4px 10px',
      }}>
        {tabs.map(t => {
          const isActive = t.id === active;
          const c = isActive ? 'var(--accent-ink)' : 'var(--ink-3)';
          return (
            <button key={t.id} onClick={() => onChange(t.id)} style={{
              flex: 1, background: 'none', border: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              color: c, padding: '2px 0',
            }}>
              <t.icon c={c} active={isActive} size={24}/>
              <span style={{ fontSize: 10, fontWeight: 600 }}>{t.label}</span>
            </button>
          );
        })}
      </GlassSurface>
      {/* Floating chat — Yulia composer (was search; search moved to TopBar) */}
      <button style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'var(--accent-ink)',
        border: 'none',
        boxShadow: '0 10px 28px -6px rgba(46,92,138,0.45), inset 0 0 0 0.5px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff',
      }}>
        <Icon2.chat c="#fff" size={22}/>
      </button>
    </div>
  );
}

// Translucent top bar — sticky chrome, content scrolls under it.
// Pinned at the top of each screen, replaces the old static TopBar.
function GlassTopBar({ title, showBack, onBack }) {
  return (
    <>
      {/* Spacer to push content below the glass bar */}
      <div style={{ height: 100 }}/>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        zIndex: 30,
        paddingTop: 44,  // status bar
      }}>
        <GlassSurface tint="chrome" radius={0} style={{
          padding: '8px 16px 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderRadius: 0,
          // Bottom edge fades to transparent — classic iOS effect
          maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
        }}>
          {showBack ? (
            <button onClick={onBack} style={{
              width: 32, height: 32, background: 'transparent', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon2.back c="var(--ink-1)" size={14}/>
            </button>
          ) : <div style={{ width: 32 }}/>}
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 17, letterSpacing: -0.3, margin: 0,
            color: 'var(--ink)', textAlign: 'center', flex: 1,
          }}>{title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button aria-label="Search" style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(0,0,0,0.05)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon2.search c="var(--ink-1)" size={15}/>
            </button>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(145deg, #4D5666, #1F2530)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12,
            }}>JM</div>
          </div>
        </GlassSurface>
      </div>
    </>
  );
}

// Large title (under the glass top bar) — the App Store pattern
function LargeTitle({ children }) {
  return (
    <h1 style={{
      fontFamily: 'var(--font-display)', fontWeight: 800,
      fontSize: 34, letterSpacing: -1, margin: 0, lineHeight: 1.05,
      padding: '8px 22px 12px',
      color: 'var(--ink)',
    }}>{children}</h1>
  );
}

function VerdictPill2({ kind = 'pursue', onLight = false }) {
  const map = { pursue: 'PURSUE', pass: 'PASS', watch: 'WATCH' };
  const cls = `verdict-pill${onLight ? ' on-light' : ''}${kind === 'watch' ? ' warn' : ''}${kind === 'pass' ? ' danger' : ''}`;
  return <span className={cls}><span className="pulse-dot"/>{map[kind]}</span>;
}

function Sparkline2({ values, w = 80, h = 22, c = 'var(--accent)' }) {
  const min = Math.min(...values), max = Math.max(...values);
  const norm = (v) => (max === min ? 0.5 : (v - min) / (max - min));
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - 2 - norm(v) * (h - 4);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={c} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/></svg>;
}

Object.assign(window, {
  Icon2, YIcon2, GlassSurface, TabBar2, GlassTopBar, LargeTitle,
  VerdictPill2, Sparkline2,
  // Override existing globals so the existing screens pick up the new chrome
  GlassTabBar: TabBar2,
});
