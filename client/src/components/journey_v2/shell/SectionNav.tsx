/**
 * SectionNav — sticky vertical dot-rail for journey pages.
 *
 * Each journey page has 5–8 sections with DOM ids. This renders a
 * right-anchored sticky rail of dots (hover reveals the label),
 * tracks which section is in view via IntersectionObserver, and
 * binds `j` / `k` / ↓ / ↑ for keyboard navigation.
 *
 * Solves two audit findings: (1) discoverability — long pages with
 * no TOC leave users scrolling blindly; (2) efficiency — no way to
 * jump to "pricing" on a long page without a wheel.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface Section {
  id: string;
  label: string;
}

interface Props {
  sections: readonly Section[];
  /** CSS selector for the scroll container that holds section nodes.
   *  Journey pages scroll within `.v4-canvas__body` inside the floating
   *  canvas, NOT window. Default handles that. */
  scrollRootSelector?: string;
}

export default function SectionNav({ sections, scrollRootSelector = '.v4-canvas__body' }: Props) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '');
  const rootRef = useRef<HTMLElement | null>(null);

  /* Resolve the scroll root once the DOM is populated. Journey pages
     render their content inside the canvas card, which is itself
     scrollable — so IntersectionObserver must use the canvas body as
     its `root`, not the default viewport. */
  useEffect(() => {
    rootRef.current = document.querySelector(scrollRootSelector) as HTMLElement | null;
  }, [scrollRootSelector]);

  /* Observe section visibility. Use a narrow rootMargin near the top
     so "active" tracks what the user is reading, not what's merely in
     the lower half of the viewport. */
  useEffect(() => {
    const root = rootRef.current;
    const nodes = sections
      .map((s) => document.getElementById(s.id))
      .filter((n): n is HTMLElement => !!n);
    if (!nodes.length) return;
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.target as HTMLElement).offsetTop - (b.target as HTMLElement).offsetTop);
        if (visible[0]) setActiveId((visible[0].target as HTMLElement).id);
      },
      { root, rootMargin: '-20% 0px -60% 0px', threshold: 0 },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [sections]);

  const goTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  /* j/k bindings — don't hijack if the user is typing in the chat
     composer or any other editable field. */
  const activeIndex = useMemo(
    () => Math.max(0, sections.findIndex((s) => s.id === activeId)),
    [sections, activeId],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const next = () => goTo(sections[Math.min(sections.length - 1, activeIndex + 1)].id);
      const prev = () => goTo(sections[Math.max(0, activeIndex - 1)].id);

      if (e.key === 'j' || e.key === 'ArrowDown') { e.preventDefault(); next(); }
      else if (e.key === 'k' || e.key === 'ArrowUp') { e.preventDefault(); prev(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sections, activeIndex, goTo]);

  return (
    <nav
      aria-label="Page sections"
      style={{
        position: 'sticky',
        top: 'clamp(80px, 14vh, 140px)',
        float: 'right',
        marginRight: -28,
        marginLeft: 8,
        zIndex: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '14px 10px',
        pointerEvents: 'none',
      }}
    >
      <style>{`
        @media (max-width: 960px) { [data-section-nav] { display: none !important; } }
        [data-section-nav-dot]:hover [data-section-nav-label] { opacity: 1; transform: translateX(0); }
      `}</style>
      <div data-section-nav style={{ display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'auto' }}>
        {sections.map((s) => {
          const active = s.id === activeId;
          return (
            <button
              key={s.id}
              data-section-nav-dot
              type="button"
              onClick={() => goTo(s.id)}
              aria-label={`Jump to ${s.label}`}
              aria-current={active ? 'true' : undefined}
              style={{
                position: 'relative',
                width: 10, height: 10,
                padding: 0,
                background: active ? '#0A0A0B' : 'rgba(10,10,11,0.24)',
                border: 'none',
                borderRadius: 999,
                cursor: 'pointer',
                transition: 'background 180ms ease, transform 180ms ease',
                transform: active ? 'scale(1.2)' : 'scale(1)',
              }}
            >
              <span
                data-section-nav-label
                style={{
                  position: 'absolute',
                  right: 18, top: '50%',
                  transform: 'translate(8px, -50%)',
                  opacity: 0,
                  transition: 'opacity 180ms ease, transform 180ms ease',
                  padding: '4px 10px',
                  background: '#0A0A0B',
                  color: '#FFFFFF',
                  borderRadius: 8,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: 11.5,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}
              >
                {s.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
