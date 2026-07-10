import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  animate,
  AnimatePresence,
} from 'framer-motion';
import { YuliaGlyph } from '../MarketingChrome';

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

/* Illustrative mid-market sample deal — every figure is clearly a demo number. */
const KPIS = [
  { label: 'EBITDA (normalized)', to: 8_400_000, fmt: (n: number) => `$${(n / 1_000_000).toFixed(1)}M` },
  { label: 'Entry multiple', to: 5.5, fmt: (n: number) => `${n.toFixed(1)}×` },
  { label: 'Enterprise value', to: 46_000_000, fmt: (n: number) => `$${Math.round(n / 1_000_000)}M` },
  { label: 'IRR', to: 24, fmt: (n: number) => `${Math.round(n)}%` },
  { label: 'MOIC', to: 2.8, fmt: (n: number) => `${n.toFixed(1)}×` },
] as const;

/* EBITDA / EBIT / Adj. columns — grow upward. Heights are % of the plot area. */
const COLUMNS = [
  { label: 'EBITDA', h: 88 },
  { label: 'EBIT', h: 70 },
  { label: 'Adj.', h: 96 },
] as const;

/* Left-rail journey stages — Valuation is the active one. */
const STAGES = ['Thesis', 'Sourcing', 'Valuation', 'Diligence', 'Structure'] as const;
const ACTIVE_STAGE = 'Valuation';

/**
 * A number that counts up from 0 → `to` when `run` flips true. Honors reduced
 * motion by jumping straight to the end value. (Same grammar as HeroShowcase.)
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

  return <span className="mono num">{fmt(val)}</span>;
}

/* The center-pane conversational thread. */
type Line = { id: number; who: 'user' | 'yulia'; text: string };

const FINAL_LINES: Line[] = [
  { id: 1, who: 'user', text: "What's the business worth?" },
  { id: 2, who: 'yulia', text: 'Here’s the range —' },
  {
    id: 3,
    who: 'yulia',
    text: 'At 5.5× on $8.4M normalized EBITDA, that’s $46M EV, inside a $38M–$55M range.',
  },
];

/**
 * HeroWorkspace — a single wide, edge-to-edge smbX *workspace* window.
 *
 * One browser frame (traffic-light dots + app.smbx.ai/deal URL pill) holding a
 * realistic 3-pane app: deal-context rail · Yulia chat thread · model canvas.
 * It fills a full-bleed width rather than going hollow like the two-up
 * HeroShowcase did.
 *
 * On scroll-in (once) it plays the "you talk, Yulia builds" sequence:
 *   1. user asks "What's the business worth?"
 *   2. Yulia thinks (mkt-dot pulse) → "Here's the range —"
 *   3. Yulia answers with the priced range
 *   4. the model canvas builds: range bar fills, columns grow, KPIs count up
 *   5. a floating "Enterprise value $46M" pill drifts in near the model
 *
 * Reduced motion → the whole END-STATE renders statically, numbers final.
 */
export function HeroWorkspace() {
  const reduce = !!useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { once: true, amount: 0.3 });

  // Chat thread state-machine.
  const [lines, setLines] = useState<Line[]>(reduce ? FINAL_LINES : []);
  const [thinking, setThinking] = useState(false);
  const [cardLive, setCardLive] = useState(reduce);

  // Subtle parallax drift for the floating accent pill (frame-relative lag).
  const { scrollY } = useScroll();
  const pillY = useTransform(scrollY, [0, 1400], [0, -30]);

  // Drive the "you talk, Yulia builds" sequence once the window scrolls in.
  // Re-running on every `inView`/`reduce` change (and on the StrictMode
  // mount → cleanup → remount in dev) is safe: the cleanup clears any pending
  // timers, and a fresh run re-schedules the whole chain — so the hero always
  // reaches its finished state instead of freezing on the empty $0 placeholder.
  useEffect(() => {
    if (reduce || !inView) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

    // a. user asks
    at(350, () => setLines([{ id: 1, who: 'user', text: "What's the business worth?" }]));
    // b. Yulia thinks
    at(900, () => setThinking(true));
    // c. Yulia answers — short framing line, then the priced range
    at(2000, () => {
      setThinking(false);
      setLines((l) =>
        l.some((x) => x.id === 2) ? l : [...l, { id: 2, who: 'yulia', text: 'Here’s the range —' }],
      );
    });
    at(2550, () =>
      setLines((l) =>
        l.some((x) => x.id === 3)
          ? l
          : [
              ...l,
              {
                id: 3,
                who: 'yulia',
                text: 'At 5.5× on $8.4M normalized EBITDA, that’s $46M EV, inside a $38M–$55M range.',
              },
            ],
      ),
    );
    // d. the model canvas builds as the answer lands
    at(2700, () => setCardLive(true));

    return () => timers.forEach(clearTimeout);
  }, [inView, reduce]);

  return (
    <div className="mkt-ws" ref={rootRef}>
      {/* soft green glow behind the window */}
      <div className="mkt-ws-glow" aria-hidden="true" />

      {/* ONE browser window — chrome bar, then a 3-pane workspace body */}
      <div className="mkt-ws-frame">
        <div className="mkt-ws-bar">
          <span className="mkt-ws-dots" aria-hidden="true">
            <i /><i /><i />
          </span>
          <span className="mkt-ws-url" aria-hidden="true">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            app.smbx.ai/deal
          </span>
        </div>

        <div className="mkt-ws-body">
          {/* LEFT RAIL — deal context */}
          <aside className="mkt-ws-rail" aria-hidden="true">
            <div className="mkt-ws-deal">
              <span className="mkt-ws-deal-name">Northwind Industrial</span>
              <span className="mkt-ws-deal-sub">$8.4M EBITDA · Buy-side</span>
            </div>
            <nav className="mkt-ws-stages">
              {STAGES.map((s) => (
                <span
                  key={s}
                  className={`mkt-ws-stage${s === ACTIVE_STAGE ? ' is-active' : ''}`}
                >
                  {s === ACTIVE_STAGE && <span className="mkt-ws-stage-dot" />}
                  {s}
                </span>
              ))}
            </nav>
          </aside>

          {/* CENTER — Yulia chat thread + pinned input */}
          <section className="mkt-ws-chat" aria-hidden="true">
            <div className="mkt-ws-chat-hd">
              <span className="mkt-ws-av"><YuliaGlyph size={16} /></span>
              <span className="mkt-ws-chat-name">Yulia</span>
            </div>

            <div className="mkt-ws-thread">
              <AnimatePresence initial={false}>
                {lines.map((ln) => (
                  <motion.div
                    key={ln.id}
                    className={`mkt-ws-bubble ${ln.who}`}
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
                    className="mkt-ws-bubble yulia mkt-ws-thinking"
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

            {/* pinned input bar */}
            <div className="mkt-ws-input">
              <span className="mkt-ws-input-glyph"><YuliaGlyph size={16} /></span>
              <span className="mkt-ws-input-ph">Ask Yulia about this deal…</span>
              <span className="mkt-ws-input-send" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </section>

          {/* RIGHT — model canvas (adapted mkt-val card) */}
          <section className="mkt-ws-canvas" aria-hidden="true">
            <div className="mkt-val mkt-ws-val">
              {/* range bar */}
              <div className="mkt-val-rangehead">
                <span className="mkt-val-label">Enterprise value range</span>
                <span className="mkt-val-range mono num">$38M&nbsp;–&nbsp;$55M</span>
              </div>
              <div className="mkt-val-track">
                <motion.div
                  className="mkt-val-fill"
                  initial={reduce ? { width: '64%' } : { width: '0%' }}
                  animate={cardLive ? { width: '64%' } : {}}
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
              <div className="mkt-val-body mkt-ws-val-body">
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
                          delay={0.35 + i * 0.1}
                        />
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mkt-val-foot mono">
                <span className="mkt-val-vdot" />
                Illustrative · every figure traces to its source · $30M senior · 3.2× leverage
              </div>
            </div>

            {/* floating accent pill near the model */}
            <motion.div
              className="mkt-floatcard mkt-ws-pill"
              style={{ y: reduce ? 0 : pillY }}
              initial={reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9, y: 10 }}
              animate={cardLive ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, ease: EASE, delay: reduce ? 0 : 1.15 }}
            >
              <span className="mkt-ws-pill-dot" />
              <span className="mkt-ws-pill-k">Enterprise value</span>
              <span className="mkt-ws-pill-v mono num">$46M</span>
            </motion.div>
          </section>
        </div>
      </div>
    </div>
  );
}
