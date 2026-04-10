/**
 * Floating bottom tab bar for canvas content tabs.
 * - Sits at bottom-center of the canvas card
 * - Pill-shaped, matches the top toolbar styling
 * - Auto-shows when mouse is near the bottom area
 * - Auto-hides when mouse is far away
 */
import { useState, useEffect, useRef } from 'react';

interface Tab {
  id: string;
  type: string;
  label: string;
}

interface FloatingTabBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onSelect: (tabId: string) => void;
  onClose: (tabId: string) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  dark?: boolean;
}

const TAB_ICONS: Record<string, string> = {
  deliverable: 'description',
  markdown: 'article',
  model: 'calculate',
  'deal-messages': 'forum',
  comparison: 'compare_arrows',
};

export default function FloatingTabBar({ tabs, activeTabId, onSelect, onClose, containerRef, dark = false }: FloatingTabBarProps) {
  const [visible, setVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tabs.length === 0) return;
    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      // Show when mouse is within 140px of the bottom of the canvas card
      const distFromBottom = rect.bottom - e.clientY;
      const horizInside = e.clientX >= rect.left - 20 && e.clientX <= rect.right + 20;
      const nearBottom = distFromBottom >= -10 && distFromBottom <= 140;
      setVisible(horizInside && nearBottom);
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [tabs.length, containerRef]);

  if (tabs.length === 0) return null;

  return (
    <div
      ref={barRef}
      className="absolute left-1/2 -translate-x-1/2 z-20 pointer-events-none"
      style={{
        bottom: 16,
        opacity: visible ? 1 : 0,
        transform: `translate(-50%, ${visible ? '0' : '12px'})`,
        transition: 'opacity 0.2s ease, transform 0.2s ease',
      }}
    >
      <div
        className="pointer-events-auto"
        style={{
          background: dark ? '#1A1C1E' : '#FFFFFF',
          border: dark ? '1px solid #2A2C2E' : '1px solid #E5E1D9',
          borderRadius: 100,
          boxShadow: dark
            ? '0 1px 2px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.35)'
            : '0 1px 2px rgba(60,55,45,0.08), 0 8px 24px rgba(60,55,45,0.1)',
          padding: '6px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          maxWidth: '70vw',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {tabs.map(tab => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              className="floating-tab-pill group"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px 6px 12px',
                borderRadius: 100,
                border: 'none',
                background: isActive
                  ? (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)')
                  : 'transparent',
                color: isActive
                  ? (dark ? '#F0F0F3' : '#1A1C1E')
                  : (dark ? '#A0A0A0' : '#5D5E61'),
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                fontFamily: "'Inter', system-ui, sans-serif",
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                transition: 'background 0.15s ease, color 0.15s ease',
              }}
              onClick={() => onSelect(tab.id)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                {TAB_ICONS[tab.type] || 'tab'}
              </span>
              <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {tab.label}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onClose(tab.id); }}
                style={{
                  marginLeft: 2,
                  width: 16,
                  height: 16,
                  padding: 0,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'currentColor',
                  opacity: 0.5,
                }}
                className="floating-tab-close"
                title="Close tab"
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
          );
        })}
        <style>{`
          .floating-tab-pill:hover .floating-tab-close { opacity: 1; }
          .floating-tab-pill:hover { background: ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'} !important; }
          .floating-tab-close:hover { background: ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'} !important; }
        `}</style>
      </div>
    </div>
  );
}
