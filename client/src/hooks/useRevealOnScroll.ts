/**
 * useRevealOnScroll — Cowork-style section fade-up reveals.
 *
 * Cowork (claude.com/product/cowork) uses GSAP ScrollTrigger for a
 * measured, editorial enter: opacity 0 → 1 and y:24 → 0 with a
 * 0.08s stagger, power2.out easing, once-only. No parallax, no
 * elastic — just a confident settle.
 *
 * Usage:
 *   const ref = useRef<HTMLElement>(null);
 *   useRevealOnScroll(ref);
 *   <section ref={ref}>
 *     <h2 data-reveal>...</h2>
 *     <p data-reveal>...</p>
 *   </section>
 *
 * The hook looks for `[data-reveal]` children inside the container.
 * Respects `prefers-reduced-motion` (no-ops entirely in that case).
 */
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register once per module — idempotent.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface RevealOptions {
  /** CSS selector for reveal children. Default: `[data-reveal]`. */
  selector?: string;
  /** Delay between each child, in seconds. Default: 0.08. */
  stagger?: number;
  /** Vertical offset (px) before animating up. Default: 24. */
  y?: number;
  /** Animation duration, in seconds. Default: 0.6. */
  duration?: number;
  /** GSAP easing. Default: `'power2.out'`. */
  ease?: string;
  /** Scroll-trigger start position. Default: `'top 80%'`. */
  start?: string;
  /** If true, reveal on every scroll-in (not once). Default: false. */
  repeat?: boolean;
}

export function useRevealOnScroll(
  containerRef: React.RefObject<HTMLElement | null>,
  options: RevealOptions = {},
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Respect reduced motion — make targets visible, skip animation.
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const {
      selector = '[data-reveal]',
      stagger = 0.08,
      y = 24,
      duration = 0.6,
      ease = 'power2.out',
      start = 'top 80%',
      repeat = false,
    } = options;

    const targets = container.querySelectorAll(selector);
    if (!targets.length) return;

    // Set initial state synchronously to avoid FOUC flash.
    gsap.set(targets, { opacity: 0, y });

    const tween = gsap.to(targets, {
      opacity: 1,
      y: 0,
      duration,
      stagger,
      ease,
      scrollTrigger: {
        trigger: container,
        start,
        once: !repeat,
        toggleActions: repeat ? 'play none none reverse' : 'play none none none',
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
    // Options object identity may change each render; callers should
    // keep options stable (inline literal is fine — the hook only
    // reads on mount and tears down on unmount).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef]);
}
