import { type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * ProductFrame — a Stripe-style chrome wrapper around product UI.
 *
 * `browser` renders a slim top bar (three traffic-light dots + a faux pill URL)
 * over a content area, lifted on a green-tinted brand shadow. `phone` renders a
 * rounded phone outline. Both fade + rise into view once on scroll
 * (framer-motion `whileInView`, `once:true`), and collapse to their end-state
 * under `prefers-reduced-motion`.
 *
 * Styling lives in marketing.css under `.mkt-frame*`.
 */
export function ProductFrame({
  variant = 'browser',
  url = 'app.smbx.ai/deal',
  children,
  className,
  delay = 0,
}: {
  variant?: 'browser' | 'phone';
  url?: string;
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  const initial = reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 };
  const inView = { opacity: 1, y: 0 };

  if (variant === 'phone') {
    return (
      <motion.div
        className={`mkt-frame mkt-frame-phone${className ? ` ${className}` : ''}`}
        initial={initial}
        whileInView={inView}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.62, ease: [0.22, 0.61, 0.36, 1], delay }}
      >
        <div className="mkt-frame-notch" aria-hidden="true" />
        <div className="mkt-frame-screen">{children}</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`mkt-frame mkt-frame-browser${className ? ` ${className}` : ''}`}
      initial={initial}
      whileInView={inView}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.62, ease: [0.22, 0.61, 0.36, 1], delay }}
    >
      <div className="mkt-frame-bar">
        <span className="mkt-frame-dots" aria-hidden="true">
          <i /><i /><i />
        </span>
        <span className="mkt-frame-url" aria-hidden="true">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {url}
        </span>
      </div>
      <div className="mkt-frame-content">{children}</div>
    </motion.div>
  );
}
