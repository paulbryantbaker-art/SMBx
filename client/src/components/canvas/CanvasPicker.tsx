/**
 * CanvasPicker — Dia-style right-side document picker.
 *
 * Desktop only. Replaces the bottom floating tab bar. Shows every open
 * canvas document grouped by deal, with collapsible group headers
 * colored by journey accent. Same information density as Dia's side
 * tabs: compact rows, group toggles, visible doc counts.
 *
 * Per-row interactions:
 *   - Click row           → make that doc the active (primary) pane
 *   - Click split icon    → open side-by-side as the split pane
 *   - Click close X       → fully close (removes from workspace + picker)
 *
 * Picker-level interactions:
 *   - Chevron on outer edge → collapse/expand the whole picker
 *   - Group header click    → collapse/expand that deal's doc list
 *
 * Apple Glass not applied here — this is always-visible chrome, not
 * floating. Paper-like surface with hairline borders.
 */

import { useEffect, useRef, useState } from 'react';

export interface PickerTab {
  id: string;
  type: string;
  label: string;
  props?: Record<string, any>;
}

export interface DealMeta {
  id: string | number;
  name: string;
  journey?: string; // 'sell' | 'buy' | 'raise' | 'pmi' | 'integrate' | 'advisors'
}

interface Props {
  tabs: PickerTab[];
  activeTabId: string | null;
  splitTabId?: string | null;
  onSelect: (tabId: string) => void;
  onSplit?: (tabId: string) => void;
  onUnsplit?: () => void;
  onClose: (tabId: string) => void;
  deals: DealMeta[];
  dark: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

const TAB_ICONS: Record<string, string> = {
  deliverable: 'description',
  markdown: 'article',
  model: 'calculate',
  'deal-messages': 'forum',
  comparison: 'compare_arrows',
};

const JOURNEY_COLORS: Record<string, { light: string; dark: string }> = {
  sell: { light: '#D44A78', dark: '#E8709A' },
  buy: { light: '#3E8E8E', dark: '#52A8A8' },
  raise: { light: '#C99A3E', dark: '#DDB25E' },
  pmi: { light: '#8F4A7A', dark: '#AE6D9A' },
  integrate: { light: '#8F4A7A', dark: '#AE6D9A' },
  advisors: { light: '#D44A78', dark: '#E8709A' },
};
const DEFAULT_ACCENT = { light: '#6e6a63', dark: 'rgba(218,218,220,0.55)' };

const DOC_TYPES = new Set(['deliverable', 'markdown', 'model', 'deal-messages', 'comparison']);

const UNCATEGORIZED_KEY = '__uncategorized__';

export default function CanvasPicker({
  tabs, activeTabId, splitTabId, onSelect, onSplit, onUnsplit, onClose,
  deals, dark, collapsed, onToggleCollapsed,
}: Props) {
  // Collapse state per deal group. Keyed by dealId-as-string. Persisted to
  // localStorage so the picker remembers between sessions.
  const [groupCollapsed, setGroupCollapsed] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem('canvas_picker_groups_collapsed');
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });
  useEffect(() => {
    try { localStorage.setItem('canvas_picker_groups_collapsed', JSON.stringify(groupCollapsed)); } catch { /* noop */ }
  }, [groupCollapsed]);

  const toggleGroup = (key: string) => {
    setGroupCollapsed(p => ({ ...p, [key]: !p[key] }));
  };

  // Filter to document-type tabs (modules never appear here)
  const docTabs = tabs.filter(t => DOC_TYPES.has(t.type));

  // Group by deal
  const dealById = new Map<string, DealMeta>();
  for (const d of deals) dealById.set(String(d.id), d);

  const groups = new Map<string, { deal?: DealMeta; tabs: PickerTab[] }>();
  for (const t of docTabs) {
    const dealId = t.props?.dealId != null ? String(t.props.dealId) : UNCATEGORIZED_KEY;
    if (!groups.has(dealId)) {
      groups.set(dealId, { deal: dealById.get(dealId), tabs: [] });
    }
    groups.get(dealId)!.tabs.push(t);
  }

  // Palette
  const pageBg = dark ? '#151617' : '#FFFFFF';
  const border = dark ? 'rgba(255,255,255,0.06)' : '#E5E1D9';
  const sectionBg = dark ? 'rgba(255,255,255,0.02)' : 'rgba(15,16,18,0.015)';
  const headingC = dark ? '#F0F0F3' : '#1A1C1E';
  const bodyC = dark ? 'rgba(240,240,243,0.72)' : '#3c3d40';
  const mutedC = dark ? 'rgba(240,240,243,0.45)' : '#7c7d80';
  const chipActive = dark ? 'rgba(232,112,154,0.12)' : 'rgba(212,74,120,0.06)';
  const chipHover = dark ? 'rgba(255,255,255,0.04)' : 'rgba(15,16,18,0.03)';
  const accent = dark ? '#E8709A' : '#D44A78';

  if (collapsed) {
    return (
      <aside
        aria-label="Documents picker (collapsed)"
        style={{
          width: 40,
          flexShrink: 0,
          background: pageBg,
          border: `1px solid ${border}`,
          borderRadius: 14,
          marginLeft: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '12px 0',
          gap: 10,
        }}
      >
        <button
          onClick={onToggleCollapsed}
          aria-label="Expand documents picker"
          title="Expand"
          type="button"
          style={{
            width: 28, height: 28, borderRadius: 8,
            border: 'none', background: 'transparent',
            color: bodyC, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        {docTabs.length > 0 && (
          <span
            aria-hidden
            style={{
              fontFamily: "'Sora', system-ui, sans-serif",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: accent,
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              marginTop: 4,
            }}
          >
            {docTabs.length} DOC{docTabs.length === 1 ? '' : 'S'}
          </span>
        )}
      </aside>
    );
  }

  return (
    <aside
      aria-label="Documents picker"
      style={{
        width: 260,
        flexShrink: 0,
        background: pageBg,
        border: `1px solid ${border}`,
        borderRadius: 14,
        marginLeft: 12,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${border}`,
          background: sectionBg,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: mutedC }}>
          Documents
        </span>
        <button
          onClick={onToggleCollapsed}
          aria-label="Collapse documents picker"
          title="Collapse"
          type="button"
          style={{
            width: 24, height: 24, borderRadius: 6,
            border: 'none', background: 'transparent',
            color: bodyC, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          className="canvas-picker-header-btn"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Groups */}
      <div className="canvas-picker-scroll" style={{ flex: 1, overflowY: 'auto', padding: '6px 6px 12px' }}>
        {groups.size === 0 && (
          <p style={{ textAlign: 'center', padding: '24px 12px', fontSize: 13, color: mutedC, margin: 0, lineHeight: 1.5 }}>
            No documents open.<br />
            Ask Yulia to generate one.
          </p>
        )}

        {Array.from(groups.entries()).map(([key, group]) => {
          const isCollapsed = !!groupCollapsed[key];
          const j = group.deal?.journey || '';
          const journeyColor = JOURNEY_COLORS[j]
            ? (dark ? JOURNEY_COLORS[j].dark : JOURNEY_COLORS[j].light)
            : (dark ? DEFAULT_ACCENT.dark : DEFAULT_ACCENT.light);
          const title = group.deal?.name || (key === UNCATEGORIZED_KEY ? 'General' : `Deal ${key}`);
          return (
            <section key={key} style={{ marginBottom: 4 }}>
              <button
                onClick={() => toggleGroup(key)}
                type="button"
                aria-expanded={!isCollapsed}
                className="canvas-picker-group-header"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 8px',
                  borderRadius: 8,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: headingC,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '-0.005em',
                  fontFamily: 'inherit',
                }}
              >
                <svg
                  width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease', flexShrink: 0 }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: journeyColor, flexShrink: 0 }} aria-hidden />
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {title}
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: mutedC, letterSpacing: '0.02em', flexShrink: 0 }}>
                  {group.tabs.length}
                </span>
              </button>

              {!isCollapsed && (
                <ul style={{ listStyle: 'none', margin: 0, padding: '0 0 4px 8px' }}>
                  {group.tabs.map(tab => {
                    const isActive = tab.id === activeTabId;
                    const isSplit = tab.id === splitTabId;
                    const rowBg = isActive || isSplit ? chipActive : 'transparent';
                    return (
                      <li
                        key={tab.id}
                        className="canvas-picker-row"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 8px',
                          borderRadius: 8,
                          marginBottom: 1,
                          background: rowBg,
                          cursor: 'pointer',
                          position: 'relative',
                        }}
                        onClick={() => onSelect(tab.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(tab.id); }
                          if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); onClose(tab.id); }
                        }}
                      >
                        {/* Active rail */}
                        {(isActive || isSplit) && (
                          <span
                            aria-hidden
                            style={{
                              position: 'absolute', left: 0, top: 6, bottom: 6,
                              width: 2, borderRadius: 2, background: accent,
                            }}
                          />
                        )}
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 14, flexShrink: 0, color: isActive ? accent : mutedC }}
                          aria-hidden
                        >
                          {TAB_ICONS[tab.type] || 'description'}
                        </span>
                        <span
                          style={{
                            flex: 1,
                            minWidth: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontSize: 12.5,
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? headingC : bodyC,
                            letterSpacing: '-0.005em',
                          }}
                          title={tab.label}
                        >
                          {tab.label}
                        </span>
                        {/* Split indicator */}
                        {isSplit && onUnsplit && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onUnsplit(); }}
                            type="button"
                            aria-label="Exit split"
                            title="Exit split"
                            style={{
                              width: 16, height: 16, padding: 0, borderRadius: 4,
                              border: 'none', background: 'transparent',
                              color: accent, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>splitscreen</span>
                          </button>
                        )}
                        {/* Split toggle on hover */}
                        {onSplit && !isActive && !isSplit && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onSplit(tab.id); }}
                            type="button"
                            aria-label={`Open ${tab.label} side-by-side`}
                            title="Split"
                            className="canvas-picker-row-split"
                            style={{
                              width: 16, height: 16, padding: 0, borderRadius: 4,
                              border: 'none', background: 'transparent',
                              color: mutedC, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                              opacity: 0, transition: 'opacity 0.12s ease',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>splitscreen</span>
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); onClose(tab.id); }}
                          type="button"
                          aria-label={`Close ${tab.label}`}
                          className="canvas-picker-row-close"
                          style={{
                            width: 16, height: 16, padding: 0, borderRadius: 4,
                            border: 'none', background: 'transparent',
                            color: mutedC, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                            opacity: isActive ? 0.55 : 0, transition: 'opacity 0.12s ease, background 0.12s ease',
                          }}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <style>{`
        .canvas-picker-scroll::-webkit-scrollbar { width: 6px; }
        .canvas-picker-scroll::-webkit-scrollbar-thumb {
          background: ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)'};
          border-radius: 3px;
        }
        .canvas-picker-scroll::-webkit-scrollbar-track { background: transparent; }
        .canvas-picker-group-header:hover { background: ${chipHover} !important; }
        .canvas-picker-row:hover { background: ${chipHover} !important; }
        .canvas-picker-row:hover .canvas-picker-row-close { opacity: 0.7; }
        .canvas-picker-row:hover .canvas-picker-row-split { opacity: 0.55; }
        .canvas-picker-row-close:hover { opacity: 1 !important; background: ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.06)'} !important; }
        .canvas-picker-row-split:hover { opacity: 1 !important; background: ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.06)'} !important; }
        .canvas-picker-header-btn:hover { background: ${chipHover} !important; }
      `}</style>
    </aside>
  );
}
