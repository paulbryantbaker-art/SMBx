/**
 * FloatingCanvasTabBar — Canva/Excel-style bottom floating tab bar.
 *
 * Replaces the browser-tab-style CanvasTabStrip that sat at the top of
 * the canvas card. This floats over the canvas content at the bottom,
 * centered, as a translucent pill (Apple Glass material).
 *
 * Pattern:
 *   - Each open tab is a pill-chip inside the bar
 *   - Click chip to switch
 *   - X on active chip to close (shows on hover for inactive)
 *   - Long-press / right-click opens split-pane toggle (defers to menu)
 *   - Horizontal scroll if tabs overflow
 *
 * Desktop-only. Mobile has its own bottom drawer pattern untouched.
 */

import { useEffect, useRef } from 'react';

interface Tab {
  id: string;
  type: string;
  label: string;
}

interface Props {
  tabs: Tab[];
  activeTabId: string | null;
  onSelect: (tabId: string) => void;
  onClose: (tabId: string) => void;
  dark?: boolean;
  /** Side-by-side split controls (desktop only) */
  splitTabId?: string | null;
  onSplit?: (tabId: string) => void;
  onUnsplit?: () => void;
}

const TAB_ICONS: Record<string, string> = {
  deliverable: 'description',
  markdown: 'article',
  model: 'calculate',
  'deal-messages': 'forum',
  comparison: 'compare_arrows',
  pipeline: 'view_kanban',
  dataroom: 'lock',
  documents: 'folder_open',
  sourcing: 'search',
  settings: 'settings',
  'seller-dashboard': 'storefront',
  'buyer-pipeline': 'shopping_bag',
  analytics: 'analytics',
};

export default function FloatingCanvasTabBar({
  tabs, activeTabId, onSelect, onClose, dark = false,
  splitTabId, onSplit, onUnsplit,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll the active chip into view when selection changes
  useEffect(() => {
    if (!scrollRef.current || !activeTabId) return;
    const el = scrollRef.current.querySelector(`[data-tab-id="${activeTabId}"]`);
    if (el && 'scrollIntoView' in el) {
      (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [activeTabId]);

  if (tabs.length === 0) return null;

  const accent = dark ? '#E8709A' : '#D44A78';
  const chipBg = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.04)';
  const chipActiveBg = dark ? 'rgba(255,255,255,0.12)' : 'rgba(15,16,18,0.08)';
  const chipText = dark ? 'rgba(240,240,243,0.72)' : 'rgba(26,28,30,0.75)';
  const chipActiveText = dark ? '#f9f9fc' : '#0f1012';
  const dividerC = dark ? 'rgba(255,255,255,0.12)' : 'rgba(15,16,18,0.10)';

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 z-20"
      style={{
        bottom: 16,
        maxWidth: 'calc(100% - 32px)',
        display: 'flex',
        alignItems: 'center',
        padding: 6,
        borderRadius: 999,
        // Apple Glass — translucent + backdrop-filter
        background: dark ? 'rgba(20,22,24,0.72)' : 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(18px) saturate(180%)',
        WebkitBackdropFilter: 'blur(18px) saturate(180%)',
        border: dark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(15,16,18,0.08)',
        boxShadow: dark
          ? '0 12px 32px -12px rgba(0,0,0,0.6)'
          : '0 12px 32px -12px rgba(0,0,0,0.2)',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        ref={scrollRef}
        className="canvas-floating-tab-scroll"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          maxWidth: 880,
        }}
      >
        {tabs.map(tab => {
          const isActive = tab.id === activeTabId;
          const isSplit = splitTabId === tab.id;
          return (
            <div
              key={tab.id}
              data-tab-id={tab.id}
              onClick={() => onSelect(tab.id)}
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(tab.id); }
                if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); onClose(tab.id); }
              }}
              className="canvas-floating-chip"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 10px 6px 12px',
                maxWidth: 200,
                borderRadius: 999,
                background: isActive ? chipActiveBg : chipBg,
                color: isActive ? chipActiveText : chipText,
                fontSize: 12.5,
                fontWeight: isActive ? 600 : 500,
                letterSpacing: '-0.005em',
                cursor: 'pointer',
                transition: 'background 0.14s ease, color 0.14s ease',
                outline: 'none',
                flexShrink: 0,
                border: 'none',
              }}
            >
              {/* Active accent dot */}
              {isActive && (
                <span
                  aria-hidden
                  style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: accent, flexShrink: 0,
                  }}
                />
              )}
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 15,
                  flexShrink: 0,
                  color: isActive ? accent : 'currentColor',
                  display: isActive ? 'none' : 'inline-block',
                }}
              >
                {TAB_ICONS[tab.type] || 'tab'}
              </span>
              <span
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  flex: 1,
                  minWidth: 0,
                }}
                title={tab.label}
              >
                {tab.label}
              </span>
              {/* Split badge — only shown on the split tab */}
              {isSplit && onUnsplit && (
                <button
                  onClick={(e) => { e.stopPropagation(); onUnsplit(); }}
                  aria-label="Exit split view"
                  title="Exit split"
                  type="button"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    padding: '1px 6px 1px 4px',
                    borderRadius: 999,
                    border: 'none',
                    background: dark ? 'rgba(232,112,154,0.18)' : 'rgba(212,74,120,0.1)',
                    color: accent,
                    fontSize: 9.5, fontWeight: 800,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 10 }}>close</span>
                  Split
                </button>
              )}
              {/* Split toggle — on hover for inactive non-split tabs */}
              {onSplit && !isActive && !isSplit && (
                <button
                  onClick={(e) => { e.stopPropagation(); onSplit(tab.id); }}
                  aria-label={`Open ${tab.label} side-by-side`}
                  title="Open side-by-side"
                  className="canvas-floating-split"
                  type="button"
                  style={{
                    width: 16, height: 16, padding: 0,
                    borderRadius: '50%', border: 'none', background: 'transparent',
                    color: 'currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', opacity: 0, transition: 'opacity 0.12s ease, background 0.12s ease',
                    flexShrink: 0,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>splitscreen</span>
                </button>
              )}
              {/* Close — always visible on active, on hover for others */}
              <button
                onClick={(e) => { e.stopPropagation(); onClose(tab.id); }}
                aria-label={`Close ${tab.label}`}
                className="canvas-floating-close"
                type="button"
                style={{
                  width: 16,
                  height: 16,
                  padding: 0,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'transparent',
                  color: 'currentColor',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  opacity: isActive ? 0.55 : 0,
                  transition: 'opacity 0.12s ease, background 0.12s ease',
                  flexShrink: 0,
                }}
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
      {/* Trailing count indicator when many tabs open — purely informational */}
      {tabs.length > 4 && (
        <div
          aria-hidden
          style={{
            marginLeft: 8, paddingLeft: 10,
            borderLeft: `1px solid ${dividerC}`,
            color: chipText,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.04em',
            flexShrink: 0,
          }}
        >
          {tabs.length}
        </div>
      )}
      <style>{`
        .canvas-floating-tab-scroll::-webkit-scrollbar { display: none; }
        .canvas-floating-chip:hover { background: ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(15,16,18,0.06)'} !important; }
        .canvas-floating-chip:hover .canvas-floating-close { opacity: 0.7; }
        .canvas-floating-chip:hover .canvas-floating-split { opacity: 0.55; }
        .canvas-floating-split:hover { opacity: 1 !important; background: ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(15,16,18,0.08)'} !important; }
        .canvas-floating-close:hover { opacity: 1 !important; background: ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(15,16,18,0.08)'} !important; }
        .canvas-floating-chip:focus-visible { outline: 2px solid ${accent}; outline-offset: 2px; }
      `}</style>
    </div>
  );
}
