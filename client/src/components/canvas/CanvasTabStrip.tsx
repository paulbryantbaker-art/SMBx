/**
 * CanvasTabStrip — Dia-style top-mounted canvas tabs.
 *
 * Horizontal strip sitting on top of the canvas card. Active tab
 * visually melts into the canvas below (same fill, no visible divider
 * where they meet); inactive tabs sit recessed with a subtle outline.
 *
 * Used for both logged-in document switching and logged-out marketing
 * navigation. The `closeable` flag differentiates the two modes: docs
 * close on X-click, marketing tabs do not.
 *
 * Replaces the right-side CanvasPicker for primary document switching.
 * The old vertical picker was removed per the 2026-04-22 rearchitecture.
 */

import type { ReactNode, KeyboardEvent } from 'react';

export interface CanvasStripTab {
  id: string;
  label: string;
  icon?: ReactNode;
  closeable?: boolean;
}

interface Props {
  tabs: CanvasStripTab[];
  activeTabId: string | null;
  onSelect: (id: string) => void;
  onClose?: (id: string) => void;
  dark: boolean;
  /** Optional content rendered flush-left of the tabs (e.g., wordmark). */
  leftSlot?: ReactNode;
  /** Optional content rendered flush-right (e.g., Sign in button). */
  rightSlot?: ReactNode;
}

export default function CanvasTabStrip({
  tabs, activeTabId, onSelect, onClose, dark, leftSlot, rightSlot,
}: Props) {
  /* Cowork/Claude-style file tabs: active tab paints the canvas fill
     and carries a hairline top border that "merges" with the canvas
     card below. Inactive tabs are plain muted text on the darker body
     — no box, no fill. The body itself sits on --bg-body (gray-200)
     so the active tab's cream fill visibly lifts. */
  const canvasBg = dark ? '#1a1918' : '#faf9f5';
  const border = dark ? 'rgba(245,244,237,0.10)' : '#dedcd1';
  const headingC = dark ? '#f5f4ed' : '#1a1918';
  const mutedC = dark ? 'rgba(245,244,237,0.55)' : '#5e5d59';
  const hoverBg = dark ? 'rgba(245,244,237,0.06)' : 'rgba(26,25,24,0.04)';
  const closeHoverBg = dark ? 'rgba(245,244,237,0.10)' : 'rgba(26,25,24,0.08)';

  const handleKey = (e: KeyboardEvent<HTMLDivElement>, idx: number) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const delta = e.key === 'ArrowLeft' ? -1 : 1;
      const next = (idx + delta + tabs.length) % tabs.length;
      onSelect(tabs[next].id);
    } else if ((e.key === 'Backspace' || e.key === 'Delete') && tabs[idx].closeable && onClose) {
      e.preventDefault();
      onClose(tabs[idx].id);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(tabs[idx].id);
    }
  };

  return (
    <div
      className="canvas-tab-strip"
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 16,
        paddingLeft: 14,
        paddingRight: 14,
        paddingTop: 6,
        position: 'relative',
        zIndex: 3,
        marginBottom: -1,
        minHeight: 44,
      }}
    >
      {leftSlot && (
        <div style={{ display: 'flex', alignItems: 'center', paddingBottom: 10, flexShrink: 0 }}>
          {leftSlot}
        </div>
      )}
      <div
        role="tablist"
        aria-label="Canvas tabs"
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 2,
          flex: 1,
          minWidth: 0,
          justifyContent: leftSlot ? 'flex-start' : 'flex-start',
        }}
      >
      {tabs.map((tab, idx) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onSelect(tab.id)}
            onKeyDown={(e) => handleKey(e, idx)}
            className="canvas-tab"
            data-active={isActive ? 'true' : 'false'}
            style={{
              height: 38,
              padding: tab.icon ? '0 20px 0 14px' : '0 22px',
              /* Dia-style: larger top-corner radius + inverted "scoop"
                 pseudo-corners at the bottom so the active tab flows
                 smoothly into the canvas card below instead of meeting
                 it at a hard right angle. */
              borderTop: isActive ? `1px solid ${border}` : '1px solid transparent',
              borderLeft: isActive ? `1px solid ${border}` : '1px solid transparent',
              borderRight: isActive ? `1px solid ${border}` : '1px solid transparent',
              borderBottom: 'none',
              borderRadius: '14px 14px 0 0',
              background: isActive ? canvasBg : 'transparent',
              color: isActive ? headingC : mutedC,
              fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              fontFamily: "'Figtree', system-ui, sans-serif",
              letterSpacing: '-0.005em',
              cursor: isActive ? 'default' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              position: 'relative',
              zIndex: isActive ? 2 : 1,
              transition: 'color 0.15s ease, background 0.15s ease, border-color 0.15s ease',
              WebkitTapHighlightColor: 'transparent',
              outline: 'none',
              userSelect: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.icon && (
              <span
                aria-hidden
                className="canvas-tab-icon"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  color: isActive ? headingC : mutedC,
                  transition: 'color 0.15s ease',
                }}
              >
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {tab.closeable && onClose && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onClose(tab.id); }}
                onKeyDown={(e) => e.stopPropagation()}
                aria-label={`Close ${tab.label}`}
                className="canvas-tab-close"
                style={{
                  width: 16,
                  height: 16,
                  padding: 0,
                  marginLeft: 2,
                  borderRadius: 4,
                  border: 'none',
                  background: 'transparent',
                  color: mutedC,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isActive ? 0.55 : 0,
                  transition: 'opacity 0.12s ease, background 0.12s ease',
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        );
      })}
      </div>
      {rightSlot && (
        <div style={{ display: 'flex', alignItems: 'center', paddingBottom: 10, flexShrink: 0 }}>
          {rightSlot}
        </div>
      )}
      <style>{`
        .canvas-tab[data-active='false']:hover {
          color: ${headingC} !important;
          background: ${hoverBg} !important;
        }
        .canvas-tab[data-active='false']:hover .canvas-tab-icon {
          color: ${headingC} !important;
        }
        .canvas-tab:hover .canvas-tab-close {
          opacity: 0.7;
        }
        .canvas-tab-close:hover {
          opacity: 1 !important;
          background: ${closeHoverBg} !important;
        }
        .canvas-tab:focus-visible {
          outline: 2px solid ${dark ? '#ec9d78' : '#1a1918'};
          outline-offset: 1px;
        }

        /* Dia-style inverted corners — the active tab scoops into the
           canvas below with a quarter-circle curve on each outside edge.
           Implementation: 12×12 pseudo-elements sit to the left and right
           of the tab's bottom. A radial gradient carves a transparent
           quarter-circle at the corner nearest the tab; the rest of the
           pseudo is filled with the canvas color, painting a seamless
           curve from tab into canvas surface. */
        .canvas-tab[data-active='true']::before,
        .canvas-tab[data-active='true']::after {
          content: '';
          position: absolute;
          bottom: 0;
          width: 12px;
          height: 12px;
          pointer-events: none;
        }
        .canvas-tab[data-active='true']::before {
          left: -12px;
          background: radial-gradient(circle at 0% 0%, transparent 12px, ${canvasBg} 12.5px);
        }
        .canvas-tab[data-active='true']::after {
          right: -12px;
          background: radial-gradient(circle at 100% 0%, transparent 12px, ${canvasBg} 12.5px);
        }
      `}</style>
    </div>
  );
}
