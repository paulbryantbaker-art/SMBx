import { useEffect, useRef, type ReactNode } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * ScrollGrow — scroll-linked "grow into focus".
 *
 * The children start slightly smaller and dimmed, then scale to full size and
 * full opacity as the element scrolls up through the viewport. Used on the Home
 * hero's full-bleed workspace so it doesn't compete with the headline on load:
 * the headline owns the first view, and the artifact becomes the focus as you
 * scroll.
 *
 * Driven off `getBoundingClientRect().top` (viewport-relative) on a capture-
 * phase scroll listener, so it tracks the marketing `<body>` scroll container
 * correctly (framer's `useScroll` reads window scroll, which is always 0 here).
 * Scroll-event-driven, so it also works regardless of rAF throttling. Honors
 * `prefers-reduced-motion` by rendering at the full end-state.
 */
export function ScrollGrow({
  children,
  fromScale = 0.9,
  fromOpacity = 0.55,
}: {
  children: ReactNode;
  fromScale?: number;
  fromOpacity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      el.style.transform = 'none';
      el.style.opacity = '1';
      return;
    }
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // progress 0 → 1 as the element's top travels from ~92% of the viewport
      // up to ~32% (i.e. as you scroll it into the focal band).
      const p = Math.min(1, Math.max(0, (vh * 0.92 - r.top) / (vh * 0.6)));
      const s = fromScale + (1 - fromScale) * p;
      const o = fromOpacity + (1 - fromOpacity) * p;
      el.style.transform = `scale(${s.toFixed(4)})`;
      el.style.opacity = o.toFixed(3);
    };
    update();
    const opts: AddEventListenerOptions = { passive: true, capture: true };
    document.addEventListener('scroll', update, opts);
    window.addEventListener('resize', update, { passive: true });
    return () => {
      document.removeEventListener('scroll', update, opts);
      window.removeEventListener('resize', update);
    };
  }, [reduce, fromScale, fromOpacity]);

  return (
    <div ref={ref} style={{ transformOrigin: 'center top', willChange: 'transform, opacity' }}>
      {children}
    </div>
  );
}
