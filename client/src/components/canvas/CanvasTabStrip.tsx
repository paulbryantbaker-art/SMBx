/**
 * CanvasTabStrip — always-visible tab row at the top of the canvas card.
 *
 * Replaces the hover-reveal FloatingTabBar for desktop. Mounts as part of
 * the card chrome so users always know what's open. Browser-tab styling:
 * active tab raised with subtle background, others muted, X on hover.
 *
 * Mobile keeps its own bottom floating bar (separate component).
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

export default function CanvasTabStrip({ tabs, activeTabId, onSelect, onClose, dark = false }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll the active tab into view when it changes
  useEffect(() => {
    if (!scrollRef.current || !activeTabId) return;
    const el = scrollRef.current.querySelector(`[data-tab-id="${activeTabId}"]`);
    if (el && 'scrollIntoView' in el) {
      (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [activeTabId]);

  if (tabs.length === 0) return null;

  const stripBg = dark ? 'rgba(255,255,255,0.02)' : 'rgba(15,16,18,0.015)';
  const borderC = dark ? 'rgba(255,255,255,0.06)' : '#E5E1D9';
  const activeBg = dark ? '#1A1C1E' : '#FFFFFF';
  const activeBorder = dark ? 'rgba(255,255,255,0.10)' : '#D8D4CC';
  const activeText = dark ? '#F0F0F3' : '#1A1C1E';
  const mutedText = dark ? 'rgba(240,240,243,0.55)' : '#6B6C6F';
  const accent = dark ? '#E8709A' : '#D44A78';

  return (
    <div
      style={{
        background: stripBg,
        borderBottom: `1px solid ${borderC}`,
        padding: '6px 8px 0',
        flexShrink: 0,
        position: 'relative',
        zIndex: 5,
      }}
    >
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 2,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        className="canvas-tabstrip-scroll"
      >
        {tabs.map(tab => {
          const isActive = tab.id === activeTabId;
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
              className="canvas-tabstrip-tab"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 10px 8px 12px',
                minWidth: 0,
                maxWidth: 200,
                borderRadius: '10px 10px 0 0',
                border: isActive ? `1px solid ${activeBorder}` : '1px solid transparent',
                borderBottom: isActive ? `1px solid ${activeBg}` : '1px solid transparent',
                marginBottom: -1,
                background: isActive ? activeBg : 'transparent',
                color: isActive ? activeText : mutedText,
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 12.5,
                fontWeight: isActive ? 600 : 500,
                letterSpacing: '-0.005em',
                cursor: 'pointer',
                transition: 'background 0.12s ease, color 0.12s ease',
                outline: 'none',
              }}
            >
              {/* Active accent rail */}
              {isActive && (
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 8,
                    right: 8,
                    height: 2,
                    borderRadius: 2,
                    background: accent,
                  }}
                />
              )}
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 15, flexShrink: 0, color: isActive ? accent : 'currentColor' }}
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
              <button
                onClick={(e) => { e.stopPropagation(); onClose(tab.id); }}
                aria-label={`Close ${tab.label}`}
                className="canvas-tabstrip-close"
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
      <style>{`
        .canvas-tabstrip-scroll::-webkit-scrollbar { display: none; }
        .canvas-tabstrip-tab:hover { background: ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(15,16,18,0.04)'} !important; }
        .canvas-tabstrip-tab:hover .canvas-tabstrip-close { opacity: 0.7; }
        .canvas-tabstrip-close:hover { opacity: 1 !important; background: ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(15,16,18,0.08)'} !important; }
        .canvas-tabstrip-tab:focus-visible { outline: 2px solid ${accent}; outline-offset: -2px; }
      `}</style>
    </div>
  );
}
