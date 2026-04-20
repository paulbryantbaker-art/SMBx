/**
 * MobileTopBar — contextual header for the Today / Deals / Inbox tabs.
 *
 * Left: dynamic title (e.g. "Today · Friday Apr 18" for Today, "Deals" /
 * "Inbox" for the others). Small date kicker above on Today.
 * Right: help bell + account avatar (glass pill buttons, 32×32).
 *
 * Hidden entirely when the Chat full-screen overlay is active.
 */

import type { MobileTab } from '../types';

interface Props {
  tab: MobileTab;
  userInitial: string;
  onHelpTap: () => void;
  onAccountTap: () => void;
}

function formatToday(): { date: string } {
  const d = new Date();
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const day = d.getDate();
  return { date: `${weekday} · ${month} ${day}` };
}

export default function MobileTopBar({ tab, userInitial, onHelpTap, onAccountTap }: Props) {
  const { date } = formatToday();

  const title = tab === 'today' ? 'Today' : tab === 'deals' ? 'Deals' : 'Inbox';
  const showDate = tab === 'today';

  return (
    <div
      style={{
        padding: '8px 16px 4px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        {showDate && (
          <div
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--text-muted)',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              lineHeight: 1.2,
            }}
          >
            {date}
          </div>
        )}
        <h1
          style={{
            margin: 0,
            marginTop: showDate ? 1 : 0,
            fontFamily: "'Sora', system-ui, sans-serif",
            fontSize: showDate ? 28 : 30,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            lineHeight: 1.05,
          }}
        >
          {title}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          onClick={onHelpTap}
          aria-label="Help and glossary"
          style={glassBtn}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        </button>

        <button
          type="button"
          onClick={onAccountTap}
          aria-label="Account"
          style={{
            ...glassBtn,
            fontFamily: "'Sora', system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 13,
          }}
        >
          {userInitial}
        </button>
      </div>
    </div>
  );
}

const glassBtn: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '0.5px solid var(--border)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.9)',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  padding: 0,
  WebkitTapHighlightColor: 'transparent',
};
