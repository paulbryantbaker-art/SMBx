import { type ReactNode, useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, animate } from 'framer-motion';
import { YuliaGlyph } from '../MarketingChrome';

/**
 * ProductMocks — coded product-UI surfaces (Ramp/Mercury-style) that "show the
 * product" inside the Home marketing page. They are siblings of HeroShowcase's
 * Valuation card: same tokens, same chrome, same scroll-reveal grammar.
 *
 * Two families:
 *   1. Walkthrough surfaces (ingest / build / deliver) — larger, meant to sit
 *      inside a <ProductFrame> for the "You talk. Yulia builds." steps.
 *   2. Mini surfaces (valuation / QoE / working-capital / financing / structure
 *      / documents) — compact mini-framed cards for the "What SMBX produces"
 *      grid. Each carries its OWN slim frame (.mkt-mini), not browser chrome.
 *
 * Every figure is institutional / IC-grade (EBITDA $8.4M, EV $46M, 5.5× entry,
 * 24% IRR, 2.8× MOIC). All motion honors prefers-reduced-motion: bars and
 * count-ups jump to their end-state and nothing sequences.
 */

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

/* ---- shared in-view count-up (mirrors HeroShowcase.CountUp) ---- */
function CountUp({
  to,
  fmt,
  run,
  reduce,
  duration = 1.0,
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

/* A wrapper that flips `run` true once its content scrolls into view. */
function InView({
  children,
  amount = 0.4,
  className,
}: {
  children: (run: boolean, reduce: boolean) => ReactNode;
  amount?: number;
  className?: string;
}) {
  const reduce = !!useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const run = useInView(ref, { once: true, amount });
  return (
    <div ref={ref} className={className}>
      {children(reduce ? true : run, reduce)}
    </div>
  );
}

/* fmt helpers */
const M = (n: number) => `$${(n / 1_000_000).toFixed(1)}M`;
const Mr = (n: number) => `$${Math.round(n / 1_000_000)}M`;
const X = (n: number) => `${n.toFixed(1)}×`;
const PCT = (n: number) => `${Math.round(n)}%`;

/* ============================================================
   1 · WALKTHROUGH SURFACES — for the 3 "You talk. Yulia builds." steps
   ============================================================ */

/** Step 1 — ingest. Yulia message + uploaded P&L file chip + extracted figures. */
export function ChatIngestMock() {
  return (
    <div className="mkt-ingest" aria-hidden="true">
      <div className="mkt-ingest-thread">
        <div className="mkt-ingest-yulia">
          <span className="mkt-ingest-av"><YuliaGlyph size={15} /></span>
          <span className="mkt-ingest-text">
            Got the P&amp;L. Pulling EBITDA, revenue, and owner add-backs now.
          </span>
        </div>
        <div className="mkt-ingest-file">
          <span className="mkt-ingest-fileicon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="mkt-ingest-filemeta">
            <span className="mkt-ingest-filename">FY24_P&amp;L.xlsx</span>
            <span className="mkt-ingest-filesub mono">2.4 MB · parsed</span>
          </span>
          <span className="mkt-ingest-check" aria-hidden="true">
            <svg width="13" height="13" viewBox="0 0 15 15" fill="none">
              <path d="M4 7.7l2.2 2.2L11 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
      <div className="mkt-ingest-extract">
        {[
          ['Revenue', '$42.0M'],
          ['Reported EBITDA', '$7.6M'],
          ['Owner add-backs', '+$0.8M'],
        ].map(([k, v]) => (
          <div className="mkt-ingest-row" key={k}>
            <span className="mkt-ingest-k">{k}</span>
            <span className="mkt-ingest-v mono num">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Step 2 — build. A model surface adapted from the hero's mkt-val card (LBO returns). */
export function ModelBuildMock() {
  const COLS = [
    { label: 'Entry', h: 62 },
    { label: 'Yr 3', h: 80 },
    { label: 'Exit', h: 98 },
  ];
  const KPIS = [
    { label: 'Equity check', to: 16_000_000, fmt: Mr },
    { label: 'IRR', to: 24, fmt: PCT },
    { label: 'MOIC', to: 2.8, fmt: X },
  ];
  return (
    <InView className="mkt-val">
      {(run, reduce) => (
        <>
          <div className="mkt-val-rangehead">
            <span className="mkt-val-label">LBO returns</span>
            <span className="mkt-val-range mono num">2.8×&nbsp;MOIC</span>
          </div>
          <div className="mkt-val-track">
            <motion.div
              className="mkt-val-fill"
              initial={reduce ? { width: '72%' } : { width: '0%' }}
              animate={run ? { width: '72%' } : {}}
              transition={{ duration: 1.0, ease: EASE, delay: 0.1 }}
            >
              <motion.span
                className="mkt-val-mid"
                initial={reduce ? { opacity: 1 } : { opacity: 0 }}
                animate={run ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: 1.0 }}
              />
            </motion.div>
          </div>
          <div className="mkt-val-body">
            <div className="mkt-val-chart" aria-hidden="true">
              {COLS.map((c, i) => (
                <div className="mkt-val-col" key={c.label}>
                  <div className="mkt-val-bararea">
                    <motion.div
                      className="mkt-val-bar"
                      initial={reduce ? { height: `${c.h}%` } : { height: '0%' }}
                      animate={run ? { height: `${c.h}%` } : {}}
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
                    <CountUp to={k.to} fmt={k.fmt} run={run} reduce={reduce} delay={0.35 + i * 0.12} />
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="mkt-val-foot mono">
            <span className="mkt-val-vdot" />
            $30M senior · 3.2× leverage · assumptions editable
          </div>
        </>
      )}
    </InView>
  );
}

/** Step 3 — deliver. A CIM document mock: title + section lines + a mini chart block. */
export function CIMDeliverMock() {
  const BARS = [54, 72, 63, 88, 79]; // quarterly revenue trend, % heights
  return (
    <InView className="mkt-doc">
      {(run, reduce) => (
        <>
          <div className="mkt-doc-head">
            <span className="mkt-doc-kicker mono">Section 3</span>
            <h4 className="mkt-doc-title">Confidential Information Memorandum</h4>
          </div>
          <div className="mkt-doc-lines">
            <span className="mkt-doc-line w-full" />
            <span className="mkt-doc-line w-92" />
            <span className="mkt-doc-line w-78" />
          </div>
          <div className="mkt-doc-sections">
            <span className="mkt-doc-section">Business overview</span>
            <span className="mkt-doc-section">Financial performance</span>
            <span className="mkt-doc-section">Growth thesis</span>
          </div>
          <div className="mkt-doc-chartblock">
            <div className="mkt-doc-chartmeta">
              <span className="mkt-doc-chartlabel mono">Revenue · FY20–FY24</span>
              <span className="mkt-doc-chartval mono num">$42.0M</span>
            </div>
            <div className="mkt-doc-chart" aria-hidden="true">
              {BARS.map((h, i) => (
                <div className="mkt-doc-barslot" key={i}>
                  <motion.div
                    className="mkt-doc-bar"
                    initial={reduce ? { height: `${h}%` } : { height: '0%' }}
                    animate={run ? { height: `${h}%` } : {}}
                    transition={{ duration: 0.6, ease: EASE, delay: 0.1 + i * 0.08 }}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </InView>
  );
}

/* ============================================================
   2 · MINI SURFACES — compact framed cards for the produces grid
   Each renders its own slim .mkt-mini frame (no browser chrome).
   ============================================================ */

function MiniFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mkt-mini">
      <div className="mkt-mini-bar">
        <span className="mkt-mini-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="mkt-mini-title mono">{title}</span>
      </div>
      <div className="mkt-mini-body">{children}</div>
    </div>
  );
}

/** Valuation — range + EV/EBITDA/multiple readout. */
export function MiniValuation() {
  return (
    <MiniFrame title="valuation">
      <InView amount={0.5}>
        {(run, reduce) => (
          <>
            <div className="mkt-mini-rangehead">
              <span className="mkt-mini-rangeval mono num">$38M – $52M</span>
            </div>
            <div className="mkt-mini-track">
              <motion.div
                className="mkt-mini-fill"
                initial={reduce ? { width: '64%' } : { width: '0%' }}
                animate={run ? { width: '64%' } : {}}
                transition={{ duration: 0.9, ease: EASE }}
              >
                <span className="mkt-mini-knob" />
              </motion.div>
            </div>
            <div className="mkt-mini-kvs">
              <div className="mkt-mini-kv"><span>Enterprise value</span><span className="mono num">$46M</span></div>
              <div className="mkt-mini-kv"><span>EV / EBITDA</span><span className="mono num">5.5×</span></div>
            </div>
          </>
        )}
      </InView>
    </MiniFrame>
  );
}

/** Quality of earnings — add-back rows + normalized EBITDA total. */
export function MiniQoE() {
  return (
    <MiniFrame title="quality of earnings">
      <div className="mkt-mini-addbacks">
        {[
          ['Reported EBITDA', '$7.6M', ''],
          ['Owner compensation', '+$0.5M', 'pos'],
          ['Non-recurring legal', '+$0.3M', 'pos'],
        ].map(([k, v, cls]) => (
          <div className="mkt-mini-addrow" key={k}>
            <span className="mkt-mini-addk">{k}</span>
            <span className={`mkt-mini-addv mono num ${cls}`}>{v}</span>
          </div>
        ))}
        <div className="mkt-mini-addrow total">
          <span className="mkt-mini-addk">Normalized EBITDA</span>
          <span className="mkt-mini-addv mono num">$8.4M</span>
        </div>
      </div>
    </MiniFrame>
  );
}

/** Working capital — peg vs. delivered, with a price adjustment chip. */
export function MiniWorkingCapital() {
  return (
    <MiniFrame title="working capital">
      <InView amount={0.5}>
        {(run, reduce) => (
          <>
            <div className="mkt-mini-pegrow">
              <span className="mkt-mini-peglabel">Target peg</span>
              <div className="mkt-mini-pegtrack">
                <motion.div
                  className="mkt-mini-pegfill peg"
                  initial={reduce ? { width: '70%' } : { width: '0%' }}
                  animate={run ? { width: '70%' } : {}}
                  transition={{ duration: 0.8, ease: EASE }}
                />
              </div>
              <span className="mkt-mini-pegval mono num">$5.8M</span>
            </div>
            <div className="mkt-mini-pegrow">
              <span className="mkt-mini-peglabel">Delivered</span>
              <div className="mkt-mini-pegtrack">
                <motion.div
                  className="mkt-mini-pegfill"
                  initial={reduce ? { width: '78%' } : { width: '0%' }}
                  animate={run ? { width: '78%' } : {}}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.12 }}
                />
              </div>
              <span className="mkt-mini-pegval mono num">$6.5M</span>
            </div>
            <div className="mkt-mini-adjust">
              <span className="mkt-mini-adjdot" />
              Price adjustment <span className="mono num">+$0.7M</span>
            </div>
          </>
        )}
      </InView>
    </MiniFrame>
  );
}

/** Financing — entry/exit + IRR / MOIC returns. */
export function MiniFinancing() {
  return (
    <MiniFrame title="financing">
      <InView amount={0.5}>
        {(run, reduce) => (
          <>
            <div className="mkt-mini-returns">
              <div className="mkt-mini-return">
                <span className="mkt-mini-returnv mono num">
                  <CountUp to={24} fmt={PCT} run={run} reduce={reduce} />
                </span>
                <span className="mkt-mini-returnk">IRR</span>
              </div>
              <div className="mkt-mini-return">
                <span className="mkt-mini-returnv mono num">
                  <CountUp to={2.8} fmt={X} run={run} reduce={reduce} delay={0.1} />
                </span>
                <span className="mkt-mini-returnk">MOIC</span>
              </div>
            </div>
            <div className="mkt-mini-kvs">
              <div className="mkt-mini-kv"><span>Entry / exit</span><span className="mono num">5.5× → 6.5×</span></div>
              <div className="mkt-mini-kv"><span>Senior debt</span><span className="mono num">$30M · 3.2×</span></div>
            </div>
          </>
        )}
      </InView>
    </MiniFrame>
  );
}

/** Structure — asset vs. stock comparison with a §1060 note. */
export function MiniStructure() {
  return (
    <MiniFrame title="structure">
      <div className="mkt-mini-struct">
        <div className="mkt-mini-structcol active">
          <span className="mkt-mini-structname">Asset deal</span>
          <span className="mkt-mini-structnum mono num">$44.1M</span>
          <span className="mkt-mini-structnote mono">after-tax to seller</span>
        </div>
        <div className="mkt-mini-structcol">
          <span className="mkt-mini-structname">Stock deal</span>
          <span className="mkt-mini-structnum mono num">$46.8M</span>
          <span className="mkt-mini-structnote mono">after-tax to seller</span>
        </div>
      </div>
      <div className="mkt-mini-structfoot mono">§1060 allocation · stepped-up basis modeled</div>
    </MiniFrame>
  );
}

/** Documents — a small heatmap-free CIM doc preview (title + lines + section chips). */
export function MiniDocuments() {
  return (
    <MiniFrame title="documents">
      <div className="mkt-mini-doc">
        <span className="mkt-mini-doctitle">Confidential Information Memorandum</span>
        <span className="mkt-mini-docline w-full" />
        <span className="mkt-mini-docline w-85" />
        <span className="mkt-mini-docline w-70" />
        <div className="mkt-mini-docchips">
          <span className="mkt-mini-docchip mono">CIM</span>
          <span className="mkt-mini-docchip mono">IC deck</span>
          <span className="mkt-mini-docchip mono">Lender book</span>
        </div>
      </div>
    </MiniFrame>
  );
}

/* Ordered to match Home's PRODUCES grid (Valuation, QoE, Working capital,
   Financing, Structure, Documents). */
export const PRODUCE_MOCKS = [
  MiniValuation,
  MiniQoE,
  MiniWorkingCapital,
  MiniFinancing,
  MiniStructure,
  MiniDocuments,
] as const;
