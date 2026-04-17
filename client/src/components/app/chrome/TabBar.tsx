/**
 * TabBar — the glass bottom tab bar. 4 tabs: Deal, Docs, Pipeline, Search.
 *
 * Glass recipe (mandatory):
 * - background: var(--glass-light) (rgba white 0.72)
 * - backdrop-filter: blur(32px) saturate(1.8)
 * - border-top: 0.5px solid rgba(0,0,0,0.08)
 * - box-shadow: inset 0 0.5px 0 rgba(255,255,255,0.9) -- the specular is mandatory
 *
 * Positioning: position:absolute bottom:0 inside body sized to --vvh
 * (see architecture_ios_pwa_pill.md). NOT position:fixed.
 */

import type { ReactNode } from 'react';
import type { AppTab } from '../types';

interface Props {
  active: AppTab;
  onChange: (next: AppTab) => void;
  /** Pipeline tab is dim until sourcing data / portfolio exists. */
  pipelineDim?: boolean;
}

const TABS: Array<{ id: AppTab; label: string; icon: ReactNode }> = [
  {
    id: 'deal',
    label: 'Deal',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-6 9 6v11a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1V9z" />
      </svg>
    ),
  },
  {
    id: 'docs',
    label: 'Docs',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3v5h5M5 3h9l5 5v12a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
      </svg>
    ),
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h4l3-8 4 16 3-8h4" />
      </svg>
    ),
  },
  {
    id: 'search',
    label: 'Search',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </svg>
    ),
  },
];

export default function TabBar({ active, onChange, pipelineDim }: Props) {
  return (
    <div
      role="tablist"
      aria-label="App sections"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 74,
        padding: '8px 4px 20px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
        display: 'flex',
        zIndex: 30,
        background: 'var(--glass-light)',
        backdropFilter: 'blur(32px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(32px) saturate(1.8)',
        borderTop: '0.5px solid var(--border)',
        boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.9)',
      }}
    >
      {TABS.map((t) => {
        const isActive = t.id === active;
        const isDim = t.id === 'pipeline' && pipelineDim;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t.id)}
            type="button"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '5px 0',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              opacity: isDim ? 0.35 : 1,
              transition: 'color 150ms cubic-bezier(0.4, 0, 0.2, 1), opacity 150ms',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span
              aria-hidden
              style={{
                width: 21,
                height: 21,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fill: isActive ? 'currentColor' : 'none',
              }}
            >
              {t.icon}
            </span>
            <span
              style={{
                fontFamily: "'Sora', system-ui, sans-serif",
                fontSize: 9,
                fontWeight: isActive ? 700 : 600,
                letterSpacing: '-0.005em',
              }}
            >
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
