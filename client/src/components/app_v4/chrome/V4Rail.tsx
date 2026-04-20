/**
 * V4Rail — right vertical tab strip.
 *
 * Expanded (240px): grouped tabs with full labels + close, drag-to-reorder.
 * Collapsed (72px): icon-only strip with tooltips.
 *
 * Ported from `claude_design/app/project/v4-shell.jsx`.
 */

import { useState } from 'react';
import type { Tab } from '../session';

const TAB_KIND: Record<string, { group: string; glyph: string; label: string }> = {
  deal:      { group: 'Deals',    glyph: 'D', label: 'Deal'      },
  rundown:   { group: 'Analyses', glyph: 'R', label: 'Rundown'   },
  model:     { group: 'Analyses', glyph: 'M', label: 'DCF'       },
  dcf:       { group: 'Analyses', glyph: 'M', label: 'DCF'       },
  compare:   { group: 'Compare',  glyph: 'C', label: 'Compare'   },
  dd:        { group: 'Docs',     glyph: 'D', label: 'DD pack'   },
  loi:       { group: 'Docs',     glyph: 'L', label: 'LOI'       },
  memo:      { group: 'Docs',     glyph: 'M', label: 'Memo'      },
  chart:     { group: 'Analyses', glyph: 'C', label: 'Chart'     },
  doc:       { group: 'Docs',     glyph: '·', label: 'Doc'       },
  library:   { group: 'Modules',  glyph: 'L', label: 'Library'   },
  portfolio: { group: 'Modules',  glyph: 'P', label: 'Portfolio' },
  deals:     { group: 'Modules',  glyph: 'D', label: 'Deals'     },
  sourcing:  { group: 'Modules',  glyph: 'S', label: 'Sourcing'  },
};
const GROUP_ORDER = ['Modules', 'Deals', 'Analyses', 'Docs', 'Compare'];

interface Props {
  tabs: Tab[];
  activeTabId: string | null;
  expanded: boolean;
  onSwitch: (id: string) => void;
  onClose: (id: string) => void;
  onReorder: (draggedId: string, overId: string) => void;
  onCollapse: () => void;
  onNewTab: () => void;
}

export default function V4Rail({
  tabs,
  activeTabId,
  expanded,
  onSwitch,
  onClose,
  onReorder,
  onCollapse,
  onNewTab,
}: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  if (!expanded) {
    return (
      <aside className="v4-rail v4-rail--collapsed" role="toolbar">
        <button type="button" className="v4-rail__collapse-btn" onClick={onCollapse} title="Expand tab strip">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div className="v4-rail__collapse-sep" />
        <div className="v4-rail__collapse-list">
          {tabs.map((t) => {
            const k = TAB_KIND[t.kind] ?? TAB_KIND.doc;
            return (
              <button
                key={t.id}
                type="button"
                className={'v4-rail__collapse-tab' + (t.id === activeTabId ? ' v4-rail__collapse-tab--active' : '')}
                onClick={() => onSwitch(t.id)}
                data-tip={t.label}
              >
                <span className="v4-rail__collapse-tab-ic">{k.glyph}</span>
              </button>
            );
          })}
          <button type="button" className="v4-rail__collapse-tab v4-rail__collapse-tab--new" onClick={onNewTab} data-tip="New tab">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          </button>
        </div>
      </aside>
    );
  }

  const byGroup: Record<string, Tab[]> = {};
  GROUP_ORDER.forEach((g) => (byGroup[g] = []));
  tabs.forEach((t) => {
    const k = TAB_KIND[t.kind] ?? TAB_KIND.doc;
    byGroup[k.group].push(t);
  });

  return (
    <aside className="v4-rail">
      <div className="v4-rail__head">
        <span className="v4-rail__head-t">Open</span>
        <span className="v4-rail__head-c">{tabs.length}</span>
        <button type="button" className="v4-rail__head-btn" title="New tab" onClick={onNewTab}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
        </button>
        <button type="button" className="v4-rail__head-btn" title="Collapse" onClick={onCollapse}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>

      <div className="v4-rail__groups">
        {GROUP_ORDER.map((g) => {
          const list = byGroup[g];
          if (!list.length) return null;
          return (
            <div key={g} className="v4-rail__group">
              <div className="v4-rail__group-h">
                {g}
                <span className="v4-rail__group-c">{list.length}</span>
              </div>
              {list.map((t) => {
                const k = TAB_KIND[t.kind] ?? TAB_KIND.doc;
                return (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={() => setDraggingId(t.id)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setOverId(t.id);
                    }}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setOverId(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggingId && draggingId !== t.id) onReorder(draggingId, t.id);
                      setDraggingId(null);
                      setOverId(null);
                    }}
                    className={
                      'v4-tab' +
                      (t.id === activeTabId ? ' v4-tab--active' : '') +
                      (draggingId === t.id ? ' v4-tab--dragging' : '') +
                      (overId === t.id && draggingId && draggingId !== t.id ? ' v4-tab--over' : '')
                    }
                    onClick={() => onSwitch(t.id)}
                  >
                    <div className="v4-tab__ico">{k.glyph}</div>
                    <div className="v4-tab__body">
                      <div className="v4-tab__t">{t.label}</div>
                      <div className="v4-tab__s">{t.sub || k.label}</div>
                    </div>
                    <button
                      type="button"
                      className="v4-tab__x"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose(t.id);
                      }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6 6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}
        {tabs.length === 0 && (
          <div style={{ padding: '24px 12px', fontSize: 12, color: 'var(--v4-mute)', lineHeight: 1.5 }}>
            No open documents yet. Ask Yulia or click <strong>+</strong> above to add one.
          </div>
        )}
      </div>
    </aside>
  );
}
