// App Store-style primitives for Yulia mobile.

const Icon = {
  chat: (p) => <svg width={p.size||20} height={p.size||20} viewBox="0 0 20 20" fill="none"><path d="M3 9.2C3 5.6 5.8 3 9.5 3H10.5C14.2 3 17 5.6 17 9.2C17 12.8 14.2 15.4 10.5 15.4H8.6L5.4 17.6C5.1 17.8 4.7 17.6 4.7 17.2V14.9C3.6 13.6 3 12 3 9.2Z" stroke={p.c||'currentColor'} strokeWidth="1.7" strokeLinejoin="round"/></svg>,
  search: (p) => <svg width={p.size||17} height={p.size||17} viewBox="0 0 17 17" fill="none"><circle cx="7.5" cy="7.5" r="5.5" stroke={p.c||'currentColor'} strokeWidth="1.8"/><path d="M11.6 11.6L15 15" stroke={p.c||'currentColor'} strokeWidth="1.8" strokeLinecap="round"/></svg>,
  back: (p) => <svg width={p.size||14} height={p.size||22} viewBox="0 0 14 22" fill="none"><path d="M11 2L3 11L11 20" stroke={p.c||'#000'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  share: (p) => <svg width={p.size||18} height={p.size||20} viewBox="0 0 18 20" fill="none"><path d="M9 2V13M9 2L5.5 5.5M9 2L12.5 5.5" stroke={p.c||'currentColor'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 10V17C3 17.6 3.4 18 4 18H14C14.6 18 15 17.6 15 17V10" stroke={p.c||'currentColor'} strokeWidth="1.7" strokeLinecap="round"/></svg>,
  close: (p) => <svg width={p.size||16} height={p.size||16} viewBox="0 0 16 16" fill="none"><path d="M3 3L13 13M13 3L3 13" stroke={p.c||'currentColor'} strokeWidth="2" strokeLinecap="round"/></svg>,
  download: (p) => <svg width={p.size||22} height={p.size||22} viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="9.5" stroke={p.c||'#7FA8D9'} strokeWidth="1.5"/><path d="M11 6V14M11 14L7.5 10.5M11 14L14.5 10.5" stroke={p.c||'#007AFF'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevron: (p) => <svg width={p.size||9} height={p.size||14} viewBox="0 0 9 14" fill="none"><path d="M1 1L7 7L1 13" stroke={p.c||'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  star: (p) => <svg width={p.size||12} height={p.size||12} viewBox="0 0 12 12" fill={p.c||'#000'}><path d="M6 0.5L7.5 4L11 4.5L8.5 7L9 10.5L6 8.7L3 10.5L3.5 7L1 4.5L4.5 4L6 0.5Z"/></svg>,
  arrowUp: (p) => <svg width={p.size||16} height={p.size||16} viewBox="0 0 16 16" fill="none"><path d="M8 13V3M8 3L3.5 7.5M8 3L12.5 7.5" stroke={p.c||'#fff'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  // Tab bar icons (App Store style — filled when active)
  today: (p) => <svg width={22} height={22} viewBox="0 0 22 22" fill={p.active?p.c:'none'} stroke={p.c||'currentColor'} strokeWidth="1.5"><rect x="4" y="3" width="14" height="16" rx="2"/><path d="M4 7H18" strokeWidth="1.2"/></svg>,
  pipeline: (p) => <svg width={22} height={22} viewBox="0 0 22 22" fill={p.active?p.c:'none'} stroke={p.c||'currentColor'} strokeWidth="1.5"><path d="M3 5L11 9L19 5L11 1L3 5Z"/><path d="M3 11L11 15L19 11" strokeLinejoin="round"/><path d="M3 17L11 21L19 17" strokeLinejoin="round"/></svg>,
  brief: (p) => <svg width={22} height={22} viewBox="0 0 22 22" fill={p.active?p.c:'none'} stroke={p.c||'currentColor'} strokeWidth="1.5"><path d="M5 3H17V19H5V3Z"/><path d="M8 7H14M8 11H14M8 15H12" strokeLinecap="round" strokeWidth="1.2"/></svg>,
};

// Yulia avatar mark (square rounded, App Store icon style)
function YIcon({ size = 60, kind = 'default', radius }) {
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
      boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.18), inset 0 1px 0 rgba(255,255,255,0.12), 0 1px 2px rgba(0,0,0,0.08)',
      flexShrink: 0,
    }}>Y</div>
  );
}

// Big floating glass tab bar (App Store style)
function TabBar({ active = 'today', onChange = () => {} }) {
  const tabs = [
    { id: 'today', label: 'Today', icon: Icon.today },
    { id: 'pipeline', label: 'Pipeline', icon: Icon.pipeline },
    { id: 'brief', label: 'Brief', icon: Icon.brief },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 18, left: 12, right: 12,
      display: 'flex', alignItems: 'center', gap: 8,
      zIndex: 40,
    }}>
      <div style={{
        flex: 1,
        background: 'rgba(255,255,255,0.78)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        borderRadius: 999,
        boxShadow: '0 8px 28px rgba(0,0,0,0.10), inset 0 0 0 0.5px rgba(255,255,255,0.5)',
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
      </div>
      {/* Floating circular chat — Yulia composer */}
      <button style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'var(--accent-ink)',
        border: 'none',
        boxShadow: '0 8px 28px rgba(46,92,138,0.32), inset 0 0 0 0.5px rgba(255,255,255,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff',
      }}>
        <Icon.chat c="#fff" size={22}/>
      </button>
    </div>
  );
}

// Top bar — page title (large) + search button + circular avatar in top right
function TopBar({ title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '54px 22px 8px', gap: 10 }}>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontWeight: 800,
        fontSize: 34, letterSpacing: -1, margin: 0, lineHeight: 1,
        color: 'var(--ink)', flex: 1, minWidth: 0,
      }}>{title}</h1>
      <button aria-label="Search" style={{
        width: 36, height: 36, borderRadius: '50%',
        background: 'rgba(0,0,0,0.04)',
        border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon.search c="var(--ink-1)" size={17}/>
      </button>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: 'linear-gradient(145deg, #4D5666, #1F2530)',
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
        flexShrink: 0,
      }}>JM</div>
    </div>
  );
}

// Verdict pill (App Store-context: small, fits over color or on white)
function VerdictPill({ kind = 'pursue', onLight = false }) {
  const map = {
    pursue: 'PURSUE',
    pass: 'PASS',
    watch: 'WATCH',
  };
  const cls = `verdict-pill${onLight ? ' on-light' : ''}${kind === 'watch' ? ' warn' : ''}${kind === 'pass' ? ' danger' : ''}`;
  return <span className={cls}><span className="pulse-dot"/>{map[kind]}</span>;
}

// Sparkline
function Sparkline({ values, w = 80, h = 22, c = 'var(--accent)' }) {
  const min = Math.min(...values), max = Math.max(...values);
  const norm = (v) => (max === min ? 0.5 : (v - min) / (max - min));
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - 2 - norm(v) * (h - 4);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={c} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/></svg>;
}

Object.assign(window, { Icon, YIcon, TabBar, TopBar, VerdictPill, Sparkline });
