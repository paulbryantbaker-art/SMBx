/**
 * JourneyTool — left vertical rail for public journey pages.
 *
 * Same visual + class names as V4Tool (`.v4-tool`, `.v4-tool__btn`,
 * `.v4-tool__logo`, etc.) so the journey pages and the logged-in app
 * share chrome. Only the item set differs: journey shows Sell / Buy /
 * Raise / Integrate / How / Pricing / Enterprise + Sign in + Start free
 * (vs. Rundown / DCF / LOI / Compare / Inbox / Drafts for the app).
 */
import type { ReactNode } from 'react';
import type { DealTab } from '../deal-room';

/* Icons — inline SVGs so the component has no asset dependency. Sizes
   and stroke match V4Tool exactly. */
const Ic = {
  sell:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l1-5h16l1 5M4 9v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M9 22V12h6v10"/></svg>,
  buy:        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/></svg>,
  raise:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 6l-9.5 9.5-5-5L1 18M17 6h6v6"/></svg>,
  integrate:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>,
  how:        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg>,
  pricing:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41L13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  enterprise: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"/></svg>,
  signIn:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>,
  startFree:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>,
  chevronRight: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>,
};

interface NavItem {
  id: DealTab;
  label: string;
  icon: ReactNode;
}
const NAV: NavItem[] = [
  { id: 'sell',         label: 'Sell',       icon: Ic.sell },
  { id: 'buy',          label: 'Buy',        icon: Ic.buy },
  { id: 'raise',        label: 'Raise',      icon: Ic.raise },
  { id: 'integrate',    label: 'Integrate',  icon: Ic.integrate },
  { id: 'how-it-works', label: 'How it works', icon: Ic.how },
  { id: 'pricing',      label: 'Pricing',    icon: Ic.pricing },
  { id: 'enterprise',   label: 'Enterprise', icon: Ic.enterprise },
];

interface Props {
  active: DealTab;
  onNavigate: (dest: DealTab) => void;
  onSignIn?: () => void;
  onStartFree: () => void;
  expanded: boolean;
  onToggle: () => void;
}

export default function JourneyTool({
  active, onNavigate, onSignIn, onStartFree, expanded, onToggle,
}: Props) {
  return (
    <aside className={`v4-tool${expanded ? ' v4-tool--expanded' : ''}`} role="toolbar">
      {/* Logo — tap to expand/collapse. Same shape as V4Tool. */}
      <button
        type="button"
        className="v4-tool__logo"
        onClick={onToggle}
        title={expanded ? 'Collapse' : 'Expand'}
      >
        {expanded ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', paddingLeft: 4 }}>
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: '-0.04em' }}>smbx</span>
            <span style={{ marginLeft: 'auto', opacity: 0.6, display: 'flex' }}>{Ic.chevronRight}</span>
          </span>
        ) : 'sm'}
      </button>

      <div className="v4-tool__sep" />

      {/* Journey nav */}
      <div className="v4-tool__list">
        {expanded && <div className="v4-tool__group-h"><span>JOURNEY</span></div>}
        {NAV.map((it) => (
          <button
            key={it.id}
            type="button"
            className={`v4-tool__btn${active === it.id ? ' v4-tool__btn--active' : ''}`}
            onClick={() => onNavigate(it.id)}
            data-tip={expanded ? undefined : it.label}
          >
            {it.icon}
            {expanded && <span className="v4-tool__lbl">{it.label}</span>}
          </button>
        ))}
      </div>

      <div className="v4-tool__sep" />

      {/* Bottom — Sign in + Start free (replaces Trash/Account/Settings
          from the in-app V4Tool since the visitor isn't authenticated). */}
      <div className="v4-tool__list" style={{ flex: 'none' }}>
        {onSignIn && (
          <button
            type="button"
            className="v4-tool__btn"
            onClick={onSignIn}
            data-tip={expanded ? undefined : 'Sign in'}
          >
            {Ic.signIn}
            {expanded && <span className="v4-tool__lbl">Sign in</span>}
          </button>
        )}
        <button
          type="button"
          className="v4-tool__btn v4-tool__btn--active"
          onClick={onStartFree}
          data-tip={expanded ? undefined : 'Start free'}
          style={{ marginTop: 4 }}
        >
          {Ic.startFree}
          {expanded && <span className="v4-tool__lbl">Start free</span>}
        </button>
        {!expanded && (
          <button
            type="button"
            className="v4-tool__btn"
            onClick={onToggle}
            data-tip="Expand"
          >
            {Ic.chevronRight}
          </button>
        )}
      </div>
    </aside>
  );
}
