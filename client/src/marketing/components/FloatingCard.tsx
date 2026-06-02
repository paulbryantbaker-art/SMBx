import { type ReactNode, type CSSProperties } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

/**
 * FloatingCard — a small, absolutely-positioned accent card (Linear motion
 * grammar). The PARENT positions it via `style` (top/left/right/bottom). It
 * drifts in on a subtle parallax — moving slightly slower than the surrounding
 * frame as the page scrolls — and carries the brand shadow.
 *
 * Holds arbitrary children (a chip, a mini-stat). Reduced motion → static,
 * fully-visible end-state.
 *
 * Styling lives in marketing.css under `.mkt-floatcard`.
 *
 * @param parallax  drift amount in px across the viewport (default 28). Negative
 *                  values drift the opposite direction.
 */
export function FloatingCard({
  children,
  style,
  className,
  delay = 0.3,
  parallax = 28,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  delay?: number;
  parallax?: number;
}) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  // Slow, frame-relative drift: as the page scrolls, the card lags the frame.
  const y = useTransform(scrollY, [0, 1400], [0, -parallax]);

  return (
    <motion.div
      className={`mkt-floatcard${className ? ` ${className}` : ''}`}
      style={{ ...style, y: reduce ? 0 : y }}
      initial={reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9, y: 10 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
