import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useInView,
  useReducedMotion,
  animate,
  AnimatePresence,
} from 'framer-motion';
import { YuliaGlyph } from '../MarketingChrome';
import { ProductFrame } from './ProductFrame';
import { FloatingCard } from './FloatingCard';

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

/* Illustrative SMB demo numbers — clearly a sample deal. */
const KPIS = [
  { label: 'SDE (normalized)', to: 640_000, fmt: (n: number) => `$${Math.round(n / 1000)}K` },
  { label: 'Applied multiple', to: 3.8, fmt: (n: number) => `${n.toFixed(1)}×` },
  { label: 'Midpoint value', to: 2_700_000, fmt: (n: number) => `$${(n / 1_000_000).toFixed(1)}M` },
] as const;

/* SDE / EBITDA columns — grow upward. heights are % of the plot area. */
const COLUMNS = [
  { label: 'SDE', h: 88 },
  { label: 'EBITDA', h: 72 },
  { label: 'Adj.', h: 96 },
] as const;

/**
 * A number that counts up from 0 → `to` when `run` flips true. Honors reduced
 * motion by jumping straight to the end value.
 */
function CountUp({
  to,
  fmt,
  run,
  reduce,
  duration = 1.1,
  delay = 0,
}: {
  to: number;
  fmt: (n: number) => string;
  run: boolean;
  reduce: boolean;
  duration?: number;
  delay?: number;
}) {
  const [val, setVal] = useState(reduce ? to : 0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduce) {
      setVal(to);
      return;
    }
    if (!run) return;
    const controls = animate(0, to, {
      duration,
      delay,
      ease: EASE,
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [run, to, duration, delay, reduce]);

  return (
    <span ref={ref} className="mono num">
      {fmt(val)}
    </span>
  );
}

/* The conversational thread script. */
type Line = { id: number; who: 'user' | 'yulia'; text: string };

/**
 * HeroShowcase — the "you talk, Yulia builds" centerpiece.
 *
 * On scroll-in (once), it plays a short sequence:
 *   1. user bubble: "What's the business worth?"
 *   2. Yulia thinking pulse → "Here's the range —"
 *   3. the Valuation card materializes: a range bar fills left→right
 *      ($2.1M – $3.4M), three SDE/EBITDA columns grow upward, and the KPI
 *      numbers count up.
 *   4. a FloatingCard drifts in — a green pill: "Valuation · $2.7M".
 *
 * Reduced motion → the whole end-state renders statically (no sequence).
 * The chat thread loops subtly after settling so the hero stays alive.
 */
export function HeroShowcase() {
  const reduce = !!useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { once: true, amount: 0.35 });

  // Chat thread state-machine.
  const [lines, setLines] = useState<Line[]>(reduce ? FINAL_LINES : []);
  const [thinking, setThinking] = useState(false);
  const [cardLive, setCardLive] = useState(reduce);

  useEffect(() => {
    if (reduce || !inView) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

    // a. user asks
    at(350, () => setLines([{ id: 1, who: 'user', text: "What's the business worth?" }]));
    // b. Yulia thinks, then answers
    at(900, () => setThinking(true));
    at(2000, () => {
      setThinking(false);
      setLines((l) => [...l, { id: 2, who: 'yulia', text: "Here's the range —" }]);
    });
    // c. the card materializes
    at(2350, () => setCardLive(true));

    return () => timers.forEach(clearTimeout);
  }, [inView, reduce]);

  return (
    <div className="mkt-hero-showcase" ref={rootRef}>
      {/* soft green glow behind the composition */}
      <div className="mkt-hero-glow" aria-hidden="true" />

      <div className="mkt-hero-grid">
        {/* LEFT — Yulia chat thread */}
        <div className="mkt-hero-chat" aria-hidden="true">
          <div className="mkt-hero-chat-hd">
            <span className="mkt-hero-av"><YuliaGlyph size={16} /></span>
            <span className="mkt-hero-chat-name">Yulia</span>
          </div>
          <div className="mkt-hero-thread">
            <AnimatePresence initial={false}>
              {lines.map((ln) => (
                <motion.div
                  key={ln.id}
                  className={`mkt-hero-bubble ${ln.who}`}
                  initial={reduce ? false : { opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  {ln.text}
                </motion.div>
              ))}
              {thinking && (
                <motion.div
                  key="thinking"
                  className="mkt-hero-bubble yulia mkt-hero-thinking"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <span className="mkt-dot" /><span className="mkt-dot" /><span className="mkt-dot" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT — Valuation model card inside browser chrome */}
        <div className="mkt-hero-card-wrap">
          <ProductFrame variant="browser" url="app.smbx.ai/deal" delay={0.05}>
            <div className="mkt-val">
              {/* range bar */}
              <div className="mkt-val-rangehead">
                <span className="mkt-val-label">Valuation range</span>
                <span className="mkt-val-range mono num">$2.1M&nbsp;–&nbsp;$3.4M</span>
              </div>
              <div className="mkt-val-track">
                <motion.div
                  className="mkt-val-fill"
                  initial={reduce ? { width: '74%' } : { width: '0%' }}
                  animate={cardLive ? { width: '74%' } : {}}
                  transition={{ duration: 1.0, ease: EASE, delay: 0.1 }}
                >
                  <motion.span
                    className="mkt-val-mid"
                    initial={reduce ? { opacity: 1 } : { opacity: 0 }}
                    animate={cardLive ? { opacity: 1 } : {}}
                    transition={{ duration: 0.4, delay: 1.0 }}
                  />
                </motion.div>
              </div>

              {/* columns + KPIs */}
              <div className="mkt-val-body">
                <div className="mkt-val-chart" aria-hidden="true">
                  {COLUMNS.map((c, i) => (
                    <div className="mkt-val-col" key={c.label}>
                      <div className="mkt-val-bararea">
                        <motion.div
                          className="mkt-val-bar"
                          initial={reduce ? { height: `${c.h}%` } : { height: '0%' }}
                          animate={cardLive ? { height: `${c.h}%` } : {}}
                          transition={{ duration: 0.75, ease: EASE, delay: 0.25 + i * 0.12 }}
                        />
                      </div>
                      <span className="mkt-val-collabel mono">{c.label}</span>
                    </div>
                  ))}
                </div>

                <div className="mkt-val-kpis">
                  {KPIS.map((k, i) => (
                    <div className="mkt-val-kpi" key={k.label}>
                      <span className="mkt-val-kpilabel">{k.label}</span>
                      <span className="mkt-val-kpival">
                        <CountUp
                          to={k.to}
                          fmt={k.fmt}
                          run={cardLive}
                          reduce={reduce}
                          delay={0.35 + i * 0.12}
                        />
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mkt-val-foot mono">
                <span className="mkt-val-vdot" />
                Illustrative · every figure traces to its source
              </div>
            </div>
          </ProductFrame>

          {/* floating green pill */}
          <FloatingCard
            className="mkt-hero-pill"
            style={{ right: -14, top: 26 }}
            delay={cardLive ? 1.15 : 0.3}
            parallax={34}
          >
            <span className="mkt-hero-pill-dot" />
            <span className="mkt-hero-pill-k">Valuation</span>
            <span className="mkt-hero-pill-v mono num">$2.7M</span>
          </FloatingCard>

          {/* second, smaller float — a confidence mini-stat */}
          <FloatingCard
            className="mkt-hero-ministat"
            style={{ left: -22, bottom: 18 }}
            delay={cardLive ? 1.35 : 0.4}
            parallax={-22}
          >
            <span className="mkt-hero-ministat-v mono num">3.8×</span>
            <span className="mkt-hero-ministat-k">applied multiple</span>
          </FloatingCard>
        </div>
      </div>
    </div>
  );
}

/* End-state used directly when prefers-reduced-motion is on. */
const FINAL_LINES: Line[] = [
  { id: 1, who: 'user', text: "What's the business worth?" },
  { id: 2, who: 'yulia', text: "Here's the range —" },
];
