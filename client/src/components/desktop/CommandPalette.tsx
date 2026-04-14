/**
 * CommandPalette — ⌘K fuzzy-search launcher.
 *
 * Searches across: deals, tools, routes, and quick actions. Keyboard-first:
 * arrows to navigate, enter to pick, escape to close, typed text filters in
 * real time. Opens via ⌘K / Ctrl+K globally.
 *
 * Uses Radix Dialog for focus trap + overlay, which is already a dep.
 * Styled as a centered floating card — keeps the Canva grammar even for
 * ephemeral UI.
 */

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

export interface CommandItem {
  id: string;
  label: string;
  /** Secondary descriptive line */
  hint?: string;
  /** Material icon name */
  icon?: string;
  /** Group heading */
  group: string;
  /** Keyboard shortcut hint rendered on right */
  shortcut?: string;
  /** Extra searchable tokens (e.g. business name + industry) */
  keywords?: string;
  /** Optional color dot (for journey/deal rows) */
  dot?: string;
  onSelect: () => void;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CommandItem[];
  dark: boolean;
  /** Placeholder text for the search input */
  placeholder?: string;
}

/** Score a single item against a lowercased query. Returns -1 to exclude. */
function scoreItem(item: CommandItem, q: string): number {
  if (!q) return 0;
  const hay = `${item.label} ${item.hint || ''} ${item.keywords || ''}`.toLowerCase();
  // Prefer prefix match on label, then substring anywhere, then fuzzy subsequence
  const label = item.label.toLowerCase();
  if (label.startsWith(q)) return 1000 - label.length;
  if (label.includes(q)) return 500 - label.indexOf(q);
  if (hay.includes(q)) return 250 - hay.indexOf(q);
  // Fuzzy subsequence
  let idx = 0;
  for (const ch of q) {
    idx = hay.indexOf(ch, idx);
    if (idx === -1) return -1;
    idx++;
  }
  return 50;
}

export default function CommandPalette({ open, onOpenChange, items, dark, placeholder = 'Search deals, tools, actions…' }: Props) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!open) { setQuery(''); setActiveIndex(0); } }, [open]);

  // Filter + rank
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items
      .map(i => ({ item: i, score: scoreItem(i, q) }))
      .filter(({ score }) => score >= 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);
  }, [items, query]);

  useEffect(() => { setActiveIndex(0); }, [query]);

  // Group for rendering
  const groups = useMemo(() => {
    const out: Array<{ group: string; items: CommandItem[] }> = [];
    const seen = new Map<string, CommandItem[]>();
    for (const it of filtered) {
      const g = seen.get(it.group);
      if (g) g.push(it);
      else seen.set(it.group, [it]);
    }
    for (const [group, items] of seen.entries()) out.push({ group, items });
    return out;
  }, [filtered]);

  // Flatten index map: flatIndex → item
  const flatMap = useMemo(() => {
    const arr: CommandItem[] = [];
    for (const g of groups) for (const it of g.items) arr.push(it);
    return arr;
  }, [groups]);

  // Ensure active row scrolls into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-cmd-index="${activeIndex}"]`) as HTMLElement | null;
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, flatMap.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const picked = flatMap[activeIndex];
      if (picked) { onOpenChange(false); picked.onSelect(); }
    }
  };

  const bg = dark ? '#151617' : '#FFFFFF';
  const heading = dark ? '#F0F0F3' : '#1A1C1E';
  const body = dark ? 'rgba(240,240,243,0.78)' : '#3C3D40';
  const muted = dark ? 'rgba(240,240,243,0.55)' : '#6B6C6F';
  const border = dark ? 'rgba(255,255,255,0.08)' : '#E5E1D9';
  const activeBg = dark ? 'rgba(232,112,154,0.12)' : 'rgba(212,74,120,0.06)';
  const accent = dark ? '#E8709A' : '#D44A78';

  let flatIndexCounter = 0;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15,16,18,0.45)',
          zIndex: 200,
          animation: 'cmdOverlayIn 120ms ease',
        }} />
        <Dialog.Content
          onOpenAutoFocus={(e) => { e.preventDefault(); inputRef.current?.focus(); }}
          aria-label="Command palette"
          style={{
            position: 'fixed',
            top: '18vh',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(640px, calc(100vw - 32px))',
            maxHeight: '64vh',
            background: bg,
            border: `1px solid ${border}`,
            borderRadius: 16,
            boxShadow: dark
              ? '0 1px 2px rgba(0,0,0,0.4), 0 24px 48px rgba(0,0,0,0.5)'
              : '0 1px 2px rgba(60,55,45,0.08), 0 24px 48px rgba(60,55,45,0.18)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 210,
            outline: 'none',
            animation: 'cmdContentIn 160ms ease',
          }}
        >
          <Dialog.Title style={{
            position: 'absolute',
            width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0,
          }}>
            Command palette
          </Dialog.Title>

          {/* Search row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: `1px solid ${border}` }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: muted }}>search</span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKey}
              placeholder={placeholder}
              type="search"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: heading,
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 15,
              }}
            />
            <span style={{
              padding: '3px 7px',
              borderRadius: 6,
              border: `1px solid ${border}`,
              fontSize: 10, fontWeight: 700,
              color: muted,
              fontFamily: "'Inter', system-ui, sans-serif",
              letterSpacing: '0.04em',
            }}>
              ESC
            </span>
          </div>

          {/* Results */}
          <div
            ref={listRef}
            onKeyDown={handleKey}
            style={{ flex: 1, overflowY: 'auto', padding: 6 }}
          >
            {filtered.length === 0 ? (
              <div style={{
                padding: 32, textAlign: 'center',
                color: muted,
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 13.5,
              }}>
                No matches for <strong style={{ color: heading }}>{query}</strong>
              </div>
            ) : (
              groups.map((g, gi) => (
                <Fragment key={g.group + gi}>
                  <div style={{
                    padding: '10px 12px 4px',
                    fontFamily: "'Sora', system-ui, sans-serif",
                    fontSize: 10, fontWeight: 800,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: muted,
                  }}>
                    {g.group}
                  </div>
                  {g.items.map((item) => {
                    const idx = flatIndexCounter++;
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={item.id}
                        data-cmd-index={idx}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => { onOpenChange(false); item.onSelect(); }}
                        type="button"
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '10px 12px',
                          borderRadius: 10,
                          border: 'none',
                          background: isActive ? activeBg : 'transparent',
                          color: heading,
                          fontFamily: "'Inter', system-ui, sans-serif",
                          fontSize: 14,
                          fontWeight: 600,
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'background 80ms ease',
                        }}
                      >
                        {item.dot ? (
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.dot, flexShrink: 0 }} />
                        ) : item.icon ? (
                          <span className="material-symbols-outlined" style={{ fontSize: 18, color: isActive ? accent : muted, flexShrink: 0 }}>
                            {item.icon}
                          </span>
                        ) : null}
                        <span style={{
                          flex: 1,
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {item.label}
                          {item.hint && (
                            <span style={{
                              marginLeft: 8, color: muted, fontWeight: 400, fontSize: 12.5,
                            }}>
                              {item.hint}
                            </span>
                          )}
                        </span>
                        {item.shortcut && (
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: 5,
                            fontSize: 10, fontWeight: 700,
                            color: isActive ? accent : muted,
                            border: `1px solid ${isActive ? accent : border}`,
                            fontFamily: "'Inter', system-ui, sans-serif",
                            letterSpacing: '0.04em',
                            flexShrink: 0,
                          }}>
                            {item.shortcut}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </Fragment>
              ))
            )}
            {/* unused var */}
            <span aria-hidden style={{ display: 'none' }}>{body}</span>
          </div>

          <style>{`
            @keyframes cmdOverlayIn { from { opacity: 0 } to { opacity: 1 } }
            @keyframes cmdContentIn { from { opacity: 0; transform: translate(-50%, -4px) scale(0.99); } to { opacity: 1; transform: translate(-50%, 0) scale(1); } }
          `}</style>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
