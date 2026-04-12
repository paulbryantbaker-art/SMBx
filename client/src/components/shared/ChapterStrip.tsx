/**
 * ChapterStrip.tsx
 *
 * Compact horizontal chapter timeline rendered above chat messages.
 * Shows the current deal's conversation chapters as a scrollable strip.
 *
 * Design: Grok-minimal — warm charcoal, Sora micro-labels, rose gold
 * for active chapter, muted dots for completed, subtle connector lines.
 * No cards, no borders — just a clean horizontal flow.
 *
 * Only renders when a deal has 2+ conversations (chapters).
 */

import { useRef, useEffect } from 'react';

interface Chapter {
  id: number;
  title: string;
  gate_label?: string;
  gate_status?: string;
  summary?: string;
}

interface Props {
  chapters: Chapter[];
  activeChapterId: number | null;
  onChapterTap: (id: number) => void;
  dark: boolean;
}

export function ChapterStrip({ chapters, activeChapterId, onChapterTap, dark }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active chapter
  useEffect(() => {
    if (!scrollRef.current || !activeChapterId) return;
    const el = scrollRef.current.querySelector(`[data-chapter="${activeChapterId}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeChapterId]);

  if (chapters.length < 2) return null;

  const pink = dark ? '#E8709A' : '#D44A78';
  const heading = dark ? '#f0f0f3' : '#1a1c1e';
  const muted = dark ? 'rgba(218,218,220,0.45)' : '#7c7d80';
  const line = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.06)';
  const activeBg = dark ? 'rgba(232,112,154,0.10)' : 'rgba(212,74,120,0.06)';

  return (
    <div
      className="shrink-0 relative"
      style={{
        borderBottom: `1px solid ${line}`,
      }}
    >
      <div
        ref={scrollRef}
        className="flex items-center gap-1 overflow-x-auto px-4 py-2.5 mobile-scroll"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {chapters.map((ch, i) => {
          const isActive = ch.id === activeChapterId;
          const isCompleted = ch.gate_status === 'completed';
          const isLast = i === chapters.length - 1;
          const cleanTitle = ch.title?.replace(' ✓', '') || 'Chapter';

          return (
            <div key={ch.id} className="flex items-center shrink-0" data-chapter={ch.id}>
              <button
                onClick={() => onChapterTap(ch.id)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all active:scale-[0.97] shrink-0"
                style={{
                  background: isActive ? activeBg : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
                title={ch.summary || cleanTitle}
              >
                {/* Status dot */}
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    background: isActive ? pink
                      : isCompleted ? muted
                      : (dark ? 'rgba(255,255,255,0.15)' : 'rgba(15,16,18,0.10)'),
                  }}
                />
                <span
                  className="text-[11px] font-semibold whitespace-nowrap"
                  style={{
                    fontFamily: "'Sora', system-ui, sans-serif",
                    color: isActive ? heading : muted,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {cleanTitle.length > 24 ? cleanTitle.substring(0, 22) + '...' : cleanTitle}
                </span>
                {ch.gate_label && (
                  <span
                    className="text-[8px] font-mono px-1 py-0.5 rounded shrink-0"
                    style={{
                      background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.04)',
                      color: muted,
                    }}
                  >
                    {ch.gate_label}
                  </span>
                )}
              </button>
              {/* Connector */}
              {!isLast && (
                <div
                  className="w-3 h-px shrink-0"
                  style={{ background: line }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
