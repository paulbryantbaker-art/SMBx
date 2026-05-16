/**
 * <Reveal> — drop-in wrapper that fades its children up on scroll.
 *
 * Cowork-style section reveal: children marked `data-reveal` enter
 * with y:24 → 0 opacity:0 → 1, 0.08s stagger, power2.out. Once-only.
 * Reduced-motion: renders statically.
 *
 * Usage:
 *   <Reveal>
 *     <h2 data-reveal>Heading</h2>
 *     <p data-reveal>Body copy.</p>
 *   </Reveal>
 *
 * For inline H1/H2/H3 single-element reveals use <RevealItem>:
 *   <RevealItem as="h2" className="gg-h2">Heading</RevealItem>
 */
import { useRef, type ReactNode, type HTMLAttributes, type ElementType } from 'react';
import { useRevealOnScroll, type RevealOptions } from '../../hooks/useRevealOnScroll';

interface RevealProps extends HTMLAttributes<HTMLElement>, RevealOptions {
  as?: ElementType;
  children: ReactNode;
}

export function Reveal({
  as: Tag = 'section',
  children,
  selector,
  stagger,
  y,
  duration,
  ease,
  start,
  repeat,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  useRevealOnScroll(ref, { selector, stagger, y, duration, ease, start, repeat });
  return (
    <Tag ref={ref as any} {...rest}>
      {children}
    </Tag>
  );
}

