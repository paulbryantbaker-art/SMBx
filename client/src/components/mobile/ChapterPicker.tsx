/**
 * ChapterPicker — horizontal pill row of deal chapters.
 *
 * Laymen's names only: "Intake", "LOI", "Due Diligence", "TSA", "Closing" —
 * never internal methodology codes like "S2" or "B3".
 *
 * Auto-hides on scroll down, reveals on scroll up (iOS Mail / Safari pattern).
 * Caller passes a scroll-container ref; if omitted, the picker stays visible.
 *
 * Active chapter = accent-tinted background + accent text + dot.
 * Past chapter   = muted text, neutral pill background.
 * Future chapter = dashed border, muted text. (Rare — Yulia opens new chapters
 * on gate transitions; users don't manually create them.)
 */

import { RefObject, useEffect, useMemo, useRef, useState } from 'react';

export type ChapterStatus = 'past' | 'current' | 'future';

export interface Chapter {
  id: string;
  /** Laymen's-term display name. "LOI", "Due Diligence", etc. */
  name: string;
  status: ChapterStatus;
  messageCount?: number;
}

interface Props {
  dark: boolean;
  chapters: Chapter[];
  activeChapterId: string;
  onChange: (chapterId: string) => void;
  /** Scroll container to watch for auto-hide. If omitted, picker never hides. */
  scrollRef?: RefObject<HTMLElement | null>;
  /** Pixel offset from viewport top for sticky position. Default = header + toggle height. */
  stickyTop?: string;
}

export default function ChapterPicker({
  dark,
  chapters,
  activeChapterId,
  onChange,
  scrollRef,
  stickyTop = 'calc(env(safe-area-inset-top, 0px) + 106px)',
}: Props) {
  const [hidden, setHidden] = useState(false);
  const lastScroll = useRef(0);

  useEffect(() => {
    const el = scrollRef?.current;
    if (!el) return;
    const onScroll = () => {
      const top = el.scrollTop;
      const delta = top - lastScroll.current;
      if (Math.abs(delta) < 6) return;
      if (top < 80) { setHidden(false); lastScroll.current = top; return; }
      setHidden(delta > 0);
      lastScroll.current = top;
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [scrollRef]);

  const t = useMemo(() => ({
    glassBg: dark ? 'rgba(20,22,24,0.72)' : 'rgba(255,255,255,0.82)',
    border: dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)',
    muted: dark ? 'rgba(218,218,220,0.55)' : '#6e6a63',
    body: dark ? 'rgba(218,218,220,0.85)' : '#3c3d40',
    accent: dark ? '#E8709A' : '#D44A78',
    accentBg: dark ? 'rgba(232,112,154,0.16)' : 'rgba(212,74,120,0.10)',
    pillBg: dark ? 'rgba(255,255,255,0.04)' : 'rgba(15,16,18,0.03)',
    futureBorder: dark ? 'rgba(255,255,255,0.12)' : 'rgba(15,16,18,0.14)',
  }), [dark]);

  return (
    <div
      role="tablist"
      aria-label="Deal chapters"
      style={{
        position: 'sticky',
        top: stickyTop,
        zIndex: 3,
        flexShrink: 0,
        background: t.glassBg,
        backdropFilter: 'blur(18px) saturate(180%)',
        WebkitBackdropFilter: 'blur(18px) saturate(180%)',
        borderBottom: `1px solid ${t.border}`,
        transform: hidden ? 'translateY(-110%)' : 'translateY(0)',
        transition: 'transform 0.24s cubic-bezier(0.2, 0.8, 0.2, 1)',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        className="chapter-picker-scroll"
        style={{
          display: 'flex',
          gap: 6,
          padding: '8px 12px',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {chapters.map((ch) => {
          const isActive = ch.id === activeChapterId;
          const isPast = ch.status === 'past';
          const isFuture = ch.status === 'future';
          const color = isActive ? t.accent : isPast ? t.muted : t.body;
          const bg = isActive ? t.accentBg : isFuture ? 'transparent' : t.pillBg;
          return (
            <button
              key={ch.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(ch.id)}
              type="button"
              className="active:scale-[0.97]"
              style={{
                flexShrink: 0,
                padding: '6px 12px',
                borderRadius: 9999,
                border: isFuture ? `1px dashed ${t.futureBorder}` : '1px solid transparent',
                background: bg,
                color,
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                letterSpacing: '-0.005em',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'background 0.15s ease, color 0.15s ease',
                WebkitTapHighlightColor: 'transparent',
                whiteSpace: 'nowrap',
              }}
            >
              {ch.name}
              {isActive && (
                <span
                  aria-hidden
                  style={{
                    width: 6, height: 6, borderRadius: 9999,
                    background: t.accent,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
      <style>{`
        .chapter-picker-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
