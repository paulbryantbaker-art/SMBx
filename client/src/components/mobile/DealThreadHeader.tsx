/**
 * DealThreadHeader — sticky Apple Glass header for the mobile Deal surface.
 *
 * Left:   back button (to Deal List).
 * Center: deal name + laymen's stage pill (e.g., "LOI", "Due Diligence").
 *         Counterparty shows as caption line underneath.
 * Right:  bell → cross-deal notifications screen. Badge when unread.
 *
 * Sticky at top: 0; safe-area-inset-top padding handles the iOS status bar.
 * z-index 5 keeps it below the fixed top-right account avatar (z-55).
 */

import { useMemo } from 'react';

interface Props {
  dark: boolean;
  dealName: string;
  /** Other-party role ("Seller", "Buyer", "Investor") or their name. Optional caption. */
  counterparty?: string;
  /** Laymen's stage name — "Intake", "LOI", "Due Diligence", "TSA", "Closing". Never gate codes. */
  stageName: string;
  /** Unread cross-deal notification count. */
  notificationCount?: number;
  onBack: () => void;
  onBellClick: () => void;
}

export default function DealThreadHeader({
  dark,
  dealName,
  counterparty,
  stageName,
  notificationCount = 0,
  onBack,
  onBellClick,
}: Props) {
  const t = useMemo(() => ({
    glassBg: dark ? 'rgba(20,22,24,0.72)' : 'rgba(255,255,255,0.82)',
    border: dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)',
    heading: dark ? '#F9F9FC' : '#0f1012',
    muted: dark ? 'rgba(218,218,220,0.55)' : '#6e6a63',
    body: dark ? 'rgba(218,218,220,0.85)' : '#3c3d40',
    accent: dark ? '#E8709A' : '#D44A78',
    accentBg: dark ? 'rgba(232,112,154,0.16)' : 'rgba(212,74,120,0.10)',
    bgCard: dark ? '#141618' : '#ffffff',
  }), [dark]);

  const hasBadge = notificationCount > 0;

  return (
    <div
      role="banner"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 5,
        flexShrink: 0,
        paddingTop: 'env(safe-area-inset-top, 0px)',
        background: t.glassBg,
        backdropFilter: 'blur(18px) saturate(180%)',
        WebkitBackdropFilter: 'blur(18px) saturate(180%)',
        borderBottom: `1px solid ${t.border}`,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          padding: '8px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          minHeight: 44,
        }}
      >
        <button
          onClick={onBack}
          type="button"
          aria-label="Back to deals"
          className="active:scale-90"
          style={{
            width: 44, height: 44, flexShrink: 0,
            borderRadius: 10,
            border: 'none',
            background: 'transparent',
            color: t.body,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s ease',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              minWidth: 0,
            }}
          >
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: t.heading,
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                minWidth: 0,
              }}
              title={dealName}
            >
              {dealName}
            </span>
            <span
              style={{
                flexShrink: 0,
                fontSize: 11,
                fontWeight: 600,
                color: t.accent,
                background: t.accentBg,
                padding: '2px 8px',
                borderRadius: 9999,
                letterSpacing: '0.01em',
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
              }}
            >
              {stageName}
            </span>
          </div>
          {counterparty && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: t.muted,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {counterparty}
            </span>
          )}
        </div>

        <button
          onClick={onBellClick}
          type="button"
          aria-label={hasBadge ? `${notificationCount} notifications` : 'Notifications'}
          className="active:scale-90"
          style={{
            position: 'relative',
            width: 44, height: 44, flexShrink: 0,
            borderRadius: 10,
            border: 'none',
            background: 'transparent',
            color: t.body,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s ease',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          {hasBadge && (
            <span
              aria-hidden
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                minWidth: 16,
                height: 16,
                padding: '0 4px',
                borderRadius: 9999,
                background: t.accent,
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
                border: `2px solid ${t.bgCard}`,
                boxSizing: 'content-box',
              }}
            >
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
