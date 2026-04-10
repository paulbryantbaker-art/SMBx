/**
 * Canvas Tab Bar — horizontal tabs like browser/VS Code with icons, labels, close buttons.
 *
 * Design: Inter 12px, terra active indicator, subtle hover, close on hover.
 * Shows when 1+ tabs exist. Scrolls horizontally on overflow.
 */
import { useRef, useCallback } from 'react';

interface CanvasTab {
  id: string;
  type: string;
  label: string;
  closable: boolean;
  props?: Record<string, any>;
}

interface CanvasTabBarProps {
  tabs: CanvasTab[];
  activeTabId: string | null;
  onSelect: (tabId: string) => void;
  onClose: (tabId: string) => void;
  dark?: boolean;
}

const TAB_ICONS: Record<string, string> = {
  pipeline: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  dataroom: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  documents: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
  sourcing: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  deliverable: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  markdown: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2',
  model: 'M9 7h6m0 10v-3m-3 3v-6m-3 6v-2M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z',
  'seller-dashboard': 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  'buyer-pipeline': 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
  analytics: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  'deal-messages': 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
};

function TabIcon({ type }: { type: string }) {
  const path = TAB_ICONS[type] || TAB_ICONS.deliverable;
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

export default function CanvasTabBar({ tabs, activeTabId, onSelect, onClose, dark }: CanvasTabBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  }, []);

  if (tabs.length === 0) return null;

  return (
    <div
      className="shrink-0 flex items-end overflow-hidden"
      style={{
        background: dark ? '#141416' : '#F5F5F3',
        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
        height: 38,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
      }}
    >
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className="flex items-end gap-0 overflow-x-auto scrollbar-none flex-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {tabs.map(tab => {
          const isActive = tab.id === activeTabId;

          return (
            <div
              key={tab.id}
              onClick={() => onSelect(tab.id)}
              className="group relative shrink-0 flex items-center gap-1.5 cursor-pointer select-none"
              style={{
                padding: '6px 12px 7px',
                maxWidth: 180,
                minWidth: 0,
                background: isActive
                  ? (dark ? '#1A1C1E' : '#FFFFFF')
                  : 'transparent',
                borderTop: isActive ? `2px solid ${dark ? '#F0F0F3' : '#1A1C1E'}` : '2px solid transparent',
                borderRight: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}`,
                borderRadius: isActive ? '6px 6px 0 0' : 0,
                marginBottom: isActive ? -1 : 0,
                transition: 'background 0.15s ease, border-color 0.15s ease',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }
              }}
            >
              {/* Icon */}
              <span className={`shrink-0 ${isActive ? (dark ? 'text-[#F0F0F3]' : 'text-[#1A1C1E]') : dark ? 'text-[#6E6A63]' : 'text-[#A9A49C]'}`}>
                <TabIcon type={tab.type} />
              </span>

              {/* Label */}
              <span
                className="truncate"
                style={{
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive
                    ? (dark ? '#F5F3EF' : '#0D0D0D')
                    : (dark ? '#8A8680' : '#6E6A63'),
                  fontFamily: "'Inter', system-ui, sans-serif",
                  letterSpacing: '-0.01em',
                }}
              >
                {tab.label}
              </span>

              {/* Close button — visible on hover or when active */}
              {tab.closable && (
                <button
                  onClick={e => { e.stopPropagation(); onClose(tab.id); }}
                  className={`shrink-0 w-4 h-4 rounded flex items-center justify-center border-0 cursor-pointer transition-all ${
                    isActive
                      ? `opacity-60 hover:opacity-100 hover:bg-[${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}]`
                      : `opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-[${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}]`
                  }`}
                  style={{ background: 'transparent', padding: 0 }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
