/**
 * MobileTabBar — the four-tab Apple Liquid Glass pill.
 *
 * Tabs: Today · Deals · Chat · Inbox.
 *
 * Positioning: portaled to document.body with position:absolute + bottom:10.
 * Body is sized to var(--vvh) (visualViewport.height) via index.css, so
 * absolute bottom anchors exactly to the visible viewport bottom regardless
 * of AppShellInner's internal flex sizing. See memory/architecture_ios_pwa_pill.md.
 *
 * Hidden entirely (render returns null) when the Chat full-screen overlay is
 * active — the overlay has its own header chrome.
 */

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { MobileTab } from '../types';

interface Props {
  active: MobileTab;
  onChange: (next: MobileTab) => void;
}

const TABS: Array<{ id: MobileTab; label: string; icon: ReactNode }> = [
  {
    id: 'today',
    label: 'Today',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
        <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
      </svg>
    ),
  },
  {
    id: 'deals',
    label: 'Deals',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7l9-4 9 4M3 7v10l9 4 9-4V7M3 7l9 4 9-4M12 11v10" />
      </svg>
    ),
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: 'inbox',
    label: 'Inbox',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-6l-2 3h-4l-2-3H2" />
        <path d="M5.5 5h13l3 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z" />
      </svg>
    ),
  },
];

export default function MobileTabBar({ active, onChange }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="tablist"
      aria-label="App sections"
      className="gg-glass-pill"
      style={{
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 10,
        height: 54,
        padding: '6px 6px',
        display: 'flex',
        zIndex: 30,
        borderRadius: 28,
        background: 'var(--glass-light)',
        backdropFilter: 'blur(40px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
        border: '0.5px solid var(--border)',
        boxShadow:
          'inset 0 0.5px 0 rgba(255,255,255,0.9), 0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)',
      }}
    >
      {TABS.map((t) => {
        const isActive = t.id === active;
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
              justifyContent: 'center',
              gap: 2,
              padding: '4px 0',
              border: 'none',
              borderRadius: 22,
              background: isActive ? 'rgba(10,10,11,0.06)' : 'transparent',
              cursor: 'pointer',
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              transition: 'background 150ms ease, color 150ms ease',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span
              aria-hidden
              style={{
                width: 20,
                height: 20,
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
                fontSize: 9.5,
                fontWeight: isActive ? 700 : 600,
                letterSpacing: '-0.005em',
              }}
            >
              {t.label}
            </span>
          </button>
        );
      })}
    </div>,
    document.body,
  );
}
