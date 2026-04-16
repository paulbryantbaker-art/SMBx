/**
 * DealSurfaceToggle — binary Glass segmented toggle between the deal's
 * two peer surfaces: private Thread (chat with Yulia) and shared Data Room
 * (docs + cross-party comments).
 *
 * Pill track (9999px radius) with the active tab rendered as a lifted pill.
 * 36px control + 14px vertical chrome padding. Sticky under DealThreadHeader.
 *
 * Optional dataRoomBadge surfaces unread/new comment count on the Data Room
 * tab — matches the "comment count tinted pill" pattern from feedback_mobile_design_rules.md.
 */

import { useMemo } from 'react';

export type DealSurface = 'thread' | 'dataroom';

interface Props {
  dark: boolean;
  active: DealSurface;
  onChange: (next: DealSurface) => void;
  /** Optional unread count badge on the Data Room tab. */
  dataRoomBadge?: number;
  /** Pixel offset from viewport top for sticky position (below header). Default 60 + safe-area. */
  stickyTop?: string;
}

export default function DealSurfaceToggle({
  dark,
  active,
  onChange,
  dataRoomBadge = 0,
  stickyTop = 'calc(env(safe-area-inset-top, 0px) + 60px)',
}: Props) {
  const t = useMemo(() => ({
    glassBg: dark ? 'rgba(20,22,24,0.72)' : 'rgba(255,255,255,0.82)',
    border: dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)',
    trackBg: dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.05)',
    activeBg: dark ? '#1f2123' : '#ffffff',
    activeShadow: dark
      ? '0 1px 2px rgba(0,0,0,0.32), 0 0 0 1px rgba(255,255,255,0.06)'
      : '0 1px 2px rgba(15,16,18,0.06), 0 0 0 1px rgba(15,16,18,0.04)',
    heading: dark ? '#F9F9FC' : '#0f1012',
    muted: dark ? 'rgba(218,218,220,0.55)' : '#6e6a63',
    accent: dark ? '#E8709A' : '#D44A78',
  }), [dark]);

  return (
    <div
      style={{
        position: 'sticky',
        top: stickyTop,
        zIndex: 4,
        flexShrink: 0,
        padding: '6px 12px 8px',
        background: t.glassBg,
        backdropFilter: 'blur(18px) saturate(180%)',
        WebkitBackdropFilter: 'blur(18px) saturate(180%)',
        borderBottom: `1px solid ${t.border}`,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        role="tablist"
        aria-label="Deal surface"
        style={{
          display: 'flex',
          gap: 4,
          padding: 4,
          borderRadius: 9999,
          background: t.trackBg,
        }}
      >
        <ToggleButton
          label="Thread"
          active={active === 'thread'}
          onClick={() => onChange('thread')}
          tokens={t}
        />
        <ToggleButton
          label="Data Room"
          active={active === 'dataroom'}
          onClick={() => onChange('dataroom')}
          tokens={t}
          badge={dataRoomBadge}
        />
      </div>
    </div>
  );
}

interface ToggleTokens {
  activeBg: string;
  activeShadow: string;
  heading: string;
  muted: string;
  accent: string;
}

function ToggleButton({
  label,
  active,
  onClick,
  tokens,
  badge = 0,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  tokens: ToggleTokens;
  badge?: number;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      type="button"
      className="active:scale-[0.98]"
      style={{
        flex: 1,
        minHeight: 32,
        padding: '6px 14px',
        borderRadius: 9999,
        border: 'none',
        background: active ? tokens.activeBg : 'transparent',
        color: active ? tokens.heading : tokens.muted,
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        letterSpacing: '-0.005em',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        boxShadow: active ? tokens.activeShadow : 'none',
        transition: 'background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {label}
      {badge > 0 && (
        <span
          aria-hidden
          style={{
            minWidth: 16,
            height: 16,
            padding: '0 5px',
            borderRadius: 9999,
            background: tokens.accent,
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );
}
