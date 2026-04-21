/* ═══════════════════════════════════════════════════════════
   v4-tool.jsx — Left vertical floating toolbar (module rail)
   ═══════════════════════════════════════════════════════════ */

const V4_IC = {
  chat:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  deals:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-7l-2-3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/></svg>,
  sourcing:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>,
  analyses:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-5"/></svg>,
  library:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  team:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  drafts:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  schedule:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  trash:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>,
  settings:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
};

/* Ambient items — things that don't change the module/canvas, just expose always-on
   surfaces: chat search, inbox, activity, pinned. */
const V4_AMBIENT = [
  { id: 'new-chat',   label: 'New chat',     icon: V4_IC.chat },
  { id: 'inbox',      label: 'Inbox',        icon: V4_IC.schedule, badge: 3 },
  { id: 'drafts',     label: 'My drafts',    icon: V4_IC.drafts, badge: 2 },
  { id: 'team',       label: 'Team',         icon: V4_IC.team },
];

const V4_QUICK_ACTIONS = [
  {
    id: 'new-deal',
    label: 'New deal',
    desc: 'Log a new sourced company. Paste a deck, a site, or just a name — Yulia will do the first-pass research.',
    shortcut: 'N D',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-7l-2-3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M12 11v6M9 14h6"/></svg>
  },
  {
    id: 'new-rundown',
    label: 'Rundown',
    desc: 'Structured brief on any deal — market, traction, moat, team, risks. Linked to live data.',
    shortcut: 'N R',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg>
  },
  {
    id: 'new-dcf',
    label: 'DCF model',
    desc: 'Live-linked valuation. Tweak growth, margin, WACC and multiple; outputs flow into rundowns.',
    shortcut: 'N M',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg>
  },
  {
    id: 'new-loi',
    label: 'LOI',
    desc: 'Term-sheet draft with placeholders. Matches your fund template and fills in counterparty automatically.',
    shortcut: 'N L',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
  },
  {
    id: 'compare',
    label: 'Compare',
    desc: 'Side-by-side scorecard for two or more deals. Customize rows; exports to memo or board deck.',
    shortcut: 'N C',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>
  },
];

function V4Tool({ active, onPick, expanded, onToggle, nextAction, onNextGo }) {
  const [hoverQA, setHoverQA] = React.useState(null); // id of hovered quick action
  return (
    <aside className={'v4-tool' + (expanded ? ' v4-tool--expanded' : '')} role="toolbar">
      <button className="v4-tool__logo" onClick={onToggle} title={expanded ? 'Collapse' : 'Expand'}>
        {expanded ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', paddingLeft: 4 }}>
            <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 16, letterSpacing: '-0.04em' }}>smbx</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 'auto', opacity: 0.6 }}><path d="M15 18l-6-6 6-6"/></svg>
          </span>
        ) : 'sm'}
      </button>
      <div className="v4-tool__sep" />

      {/* Primary creation surfaces — quick actions + Yulia's suggested next */}
      <div className="v4-tool__list">
        {expanded && <div className="v4-tool__group-h"><span>CREATE</span></div>}

        {nextAction && nextAction.label && (
          <button
            className="v4-tool__btn v4-tool__btn--quick v4-tool__btn--yulia"
            onClick={onNextGo}
            onMouseEnter={() => setHoverQA('__yulia')}
            onMouseLeave={() => setHoverQA(null)}
            data-tip={expanded ? undefined : nextAction.label}
          >
            <span className="v4-tool__yulia-ico">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>
            </span>
            {expanded && (
              <span className="v4-tool__lbl v4-tool__lbl--yulia">
                <span className="v4-tool__yulia-k">Yulia suggests</span>
                <span className="v4-tool__yulia-t">{nextAction.label}</span>
              </span>
            )}
            {hoverQA === '__yulia' && expanded && (
              <div className="v4-tool__pop">
                <div className="v4-tool__pop-kicker">YULIA SUGGESTS · NEXT</div>
                <div className="v4-tool__pop-t">{nextAction.label}</div>
                <div className="v4-tool__pop-d">Yulia surfaces this based on what's open, what's stale, and what typically unblocks you next. Click to run it; she'll fill in context automatically.</div>
                <div className="v4-tool__pop-kbd">↵ to run</div>
              </div>
            )}
          </button>
        )}

        {V4_QUICK_ACTIONS.map(it => (
          <button
            key={it.id}
            className="v4-tool__btn v4-tool__btn--quick"
            data-tip={expanded ? undefined : it.label}
            onClick={() => onPick && onPick(it.id)}
            onMouseEnter={() => setHoverQA(it.id)}
            onMouseLeave={() => setHoverQA(null)}
          >
            {it.icon}
            {expanded && <span className="v4-tool__lbl">{it.label}</span>}
            {hoverQA === it.id && (
              <div className="v4-tool__pop">
                <div className="v4-tool__pop-t">{it.label}</div>
                <div className="v4-tool__pop-d">{it.desc}</div>
                <div className="v4-tool__pop-kbd">{it.shortcut}</div>
              </div>
            )}
          </button>
        ))}

        {expanded && <div className="v4-tool__group-h" style={{ marginTop: 14 }}><span>WORKSPACE</span></div>}
        {!expanded && <div className="v4-tool__minisep" />}

        {V4_AMBIENT.map(it => (
          <button
            key={it.id}
            className={'v4-tool__btn' + (active === it.id ? ' v4-tool__btn--active' : '')}
            onClick={() => onPick && onPick(it.id)}
            data-tip={expanded ? undefined : it.label}
            data-badge={it.badge || undefined}
          >
            {it.icon}
            {expanded && <span className="v4-tool__lbl">{it.label}</span>}
          </button>
        ))}
      </div>
      <div className="v4-tool__sep" />
      <div className="v4-tool__list" style={{ flex: 'none' }}>
        <button className="v4-tool__btn" data-tip={expanded ? undefined : 'Trash'}>
          {V4_IC.trash}
          {expanded && <span className="v4-tool__lbl">Trash</span>}
        </button>
        <button className="v4-tool__btn v4-tool__btn--acct" data-tip={expanded ? undefined : 'Paul Delgado'}>
          <span className="v4-tool__acct-av">P</span>
          {expanded && (
            <span className="v4-tool__lbl v4-tool__lbl--acct">
              <span className="v4-tool__acct-n">Paul Delgado</span>
              <span className="v4-tool__acct-s">PRO · Fund I</span>
            </span>
          )}
        </button>
        <button className="v4-tool__btn" data-tip={expanded ? undefined : 'Settings'}>
          {V4_IC.settings}
          {expanded && <span className="v4-tool__lbl">Settings</span>}
        </button>
        {!expanded && (
          <button className="v4-tool__btn" onClick={onToggle} data-tip="Expand">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        )}
      </div>
    </aside>
  );
}

Object.assign(window, { V4Tool, V4_IC });
