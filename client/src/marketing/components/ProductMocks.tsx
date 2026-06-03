import { type ReactNode, Fragment, useEffect, useRef, useState } from 'react';
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

/* ============================================================
   3 · PAGE SURFACES — larger, browser-chromed surfaces for the
   Buy / Sell / Raise / Connectors feature sections. Each is a sibling
   of the hero Valuation card and meant to sit inside a <ProductFrame>.
   All figures stay IC-grade (PE / family-office / sponsor scale).
   ============================================================ */

/** BUY · sourcing — a deal-pipeline / candidate list with fit scores + a header tally. */
export function DealPipelineMock() {
  const ROWS: Array<{ name: string; sector: string; ebitda: string; fit: number; stage: string }> = [
    { name: 'Northwind Industrial', sector: 'Industrial svcs', ebitda: '$8.4M', fit: 91, stage: 'Diligence' },
    { name: 'Cedar Park Logistics', sector: 'Transportation', ebitda: '$6.2M', fit: 84, stage: 'IOI sent' },
    { name: 'Atlas Facility Group', sector: 'Facility svcs', ebitda: '$11.3M', fit: 78, stage: 'Screening' },
    { name: 'Brightway Components', sector: 'Manufacturing', ebitda: '$5.1M', fit: 64, stage: 'Sourced' },
  ];
  return (
    <InView className="mkt-pipe" amount={0.35}>
      {(run, reduce) => (
        <>
          <div className="mkt-pipe-head">
            <span className="mkt-pipe-title">Acquisition pipeline</span>
            <span className="mkt-pipe-tally mono num">42 screened · 4 live</span>
          </div>
          <div className="mkt-pipe-list">
            {ROWS.map((r, i) => (
              <div className="mkt-pipe-row" key={r.name}>
                <span className="mkt-pipe-co">
                  <span className="mkt-pipe-coname">{r.name}</span>
                  <span className="mkt-pipe-cosub mono">{r.sector} · {r.ebitda} EBITDA</span>
                </span>
                <span className="mkt-pipe-stage mono">{r.stage}</span>
                <span className={`mkt-pipe-fit${r.fit >= 80 ? ' hi' : r.fit >= 70 ? ' mid' : ''}`}>
                  <span className="mkt-pipe-fitnum mono num">{r.fit}</span>
                  <span className="mkt-pipe-fittrack" aria-hidden="true">
                    <motion.span
                      className="mkt-pipe-fitfill"
                      initial={reduce ? { width: `${r.fit}%` } : { width: '0%' }}
                      animate={run ? { width: `${r.fit}%` } : {}}
                      transition={{ duration: 0.7, ease: EASE, delay: 0.15 + i * 0.08 }}
                    />
                  </span>
                </span>
              </div>
            ))}
          </div>
          <div className="mkt-pipe-foot mono">
            <span className="mkt-val-vdot" />
            Scored against thesis · industrial · $5M–$15M EBITDA
          </div>
        </>
      )}
    </InView>
  );
}

/** BUY · LBO + sensitivity — IRR sensitivity matrix across entry multiple × exit multiple. */
export function SensitivityMock() {
  // IRR (%) grid: rows = exit multiple, cols = entry multiple. Center cell is base case.
  const COLS = ['5.0×', '5.5×', '6.0×'];
  const ROWS = ['6.0×', '6.5×', '7.0×'];
  const GRID = [
    [18, 21, 24],
    [22, 24, 27],
    [26, 29, 32],
  ];
  // shade intensity 0..1 used for the accent-soft → accent fill
  const lo = 18, hi = 32;
  const shade = (v: number) => (v - lo) / (hi - lo);
  return (
    <div className="mkt-sens">
      <div className="mkt-sens-head">
        <span className="mkt-sens-title">IRR sensitivity</span>
        <span className="mkt-sens-base mono num">Base 24%</span>
      </div>
      <div className="mkt-sens-axis mono">Entry multiple →</div>
      <div className="mkt-sens-grid">
        <span className="mkt-sens-corner mono">Exit ↓</span>
        {COLS.map((c) => (
          <span className="mkt-sens-colh mono" key={c}>{c}</span>
        ))}
        {ROWS.map((rlabel, ri) => (
          <Fragment key={rlabel}>
            <span className="mkt-sens-rowh mono">{rlabel}</span>
            {GRID[ri].map((v, ci) => {
              const isBase = ri === 1 && ci === 1;
              return (
                <span
                  className={`mkt-sens-cell mono num${isBase ? ' base' : ''}`}
                  key={ci}
                  style={{ ['--sens' as string]: shade(v).toFixed(3) }}
                >
                  {v}%
                </span>
              );
            })}
          </Fragment>
        ))}
      </div>
      <div className="mkt-sens-foot mono">
        <span className="mkt-val-vdot" />
        5.5× entry · 6.5× exit · $30M senior · 3.2× leverage
      </div>
    </div>
  );
}

/** Data room / DD checklist — a file list with status pills + a request-tracker bar.
 *  Reusable for Buy (DD) and Sell (buyer data room). */
export function DataRoomMock({
  title = 'Data room',
  variant = 'diligence',
}: {
  title?: string;
  variant?: 'diligence' | 'sell';
}) {
  const ITEMS: Array<{ name: string; meta: string; state: 'done' | 'review' | 'open' }> =
    variant === 'sell'
      ? [
          { name: 'Financial statements', meta: 'FY21–FY24 · 14 files', state: 'done' },
          { name: 'Quality of earnings', meta: 'Normalized EBITDA $8.4M', state: 'done' },
          { name: 'Customer contracts', meta: '38 of 41 uploaded', state: 'review' },
          { name: 'Legal & corporate', meta: 'Cap table, org docs', state: 'done' },
          { name: 'Management presentation', meta: 'Draft in review', state: 'open' },
        ]
      : [
          { name: 'Quality of earnings', meta: 'Add-backs reconciled', state: 'done' },
          { name: 'Working capital analysis', meta: 'Peg $5.8M', state: 'done' },
          { name: 'Customer concentration', meta: 'Top-10 = 38% rev', state: 'review' },
          { name: 'Contracts & leases', meta: '3 items outstanding', state: 'open' },
          { name: 'Tax & compliance', meta: '§1060, nexus review', state: 'done' },
        ];
  const STATE_LABEL = { done: 'Cleared', review: 'In review', open: 'Open' } as const;
  const done = ITEMS.filter((i) => i.state === 'done').length;
  return (
    <InView className="mkt-dr" amount={0.35}>
      {(run, reduce) => (
        <>
          <div className="mkt-dr-head">
            <span className="mkt-dr-title">{title}</span>
            <span className="mkt-dr-count mono num">{done} / {ITEMS.length} cleared</span>
          </div>
          <div className="mkt-dr-track" aria-hidden="true">
            <motion.span
              className="mkt-dr-trackfill"
              initial={reduce ? { width: `${(done / ITEMS.length) * 100}%` } : { width: '0%' }}
              animate={run ? { width: `${(done / ITEMS.length) * 100}%` } : {}}
              transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
            />
          </div>
          <div className="mkt-dr-list">
            {ITEMS.map((it) => (
              <div className="mkt-dr-row" key={it.name}>
                <span className="mkt-dr-fileicon" aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                    <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="mkt-dr-meta">
                  <span className="mkt-dr-name">{it.name}</span>
                  <span className="mkt-dr-sub mono">{it.meta}</span>
                </span>
                <span className={`mkt-dr-pill mono ${it.state}`}>{STATE_LABEL[it.state]}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </InView>
  );
}

/** SELL · buyer management — a ranked buyer list (type, fit, indicated range, status). */
export function BuyerListMock() {
  const ROWS: Array<{ name: string; type: string; range: string; fit: number; status: string }> = [
    { name: 'Sponsor — platform', type: 'Private equity', range: '$44M – $50M', fit: 92, status: 'IOI' },
    { name: 'Strategic acquirer', type: 'Industry buyer', range: '$46M – $54M', fit: 88, status: 'NDA' },
    { name: 'Family office', type: 'Long-hold', range: '$40M – $46M', fit: 81, status: 'Intro' },
    { name: 'Search fund', type: 'Independent', range: '$38M – $43M', fit: 67, status: 'Screening' },
  ];
  return (
    <InView className="mkt-pipe" amount={0.35}>
      {(run, reduce) => (
        <>
          <div className="mkt-pipe-head">
            <span className="mkt-pipe-title">Buyer landscape</span>
            <span className="mkt-pipe-tally mono num">4 buyer types modeled</span>
          </div>
          <div className="mkt-pipe-list">
            {ROWS.map((r, i) => (
              <div className="mkt-pipe-row" key={r.name}>
                <span className="mkt-pipe-co">
                  <span className="mkt-pipe-coname">{r.name}</span>
                  <span className="mkt-pipe-cosub mono">{r.type} · indicated {r.range}</span>
                </span>
                <span className="mkt-pipe-stage mono">{r.status}</span>
                <span className={`mkt-pipe-fit${r.fit >= 80 ? ' hi' : r.fit >= 70 ? ' mid' : ''}`}>
                  <span className="mkt-pipe-fitnum mono num">{r.fit}</span>
                  <span className="mkt-pipe-fittrack" aria-hidden="true">
                    <motion.span
                      className="mkt-pipe-fitfill"
                      initial={reduce ? { width: `${r.fit}%` } : { width: '0%' }}
                      animate={run ? { width: `${r.fit}%` } : {}}
                      transition={{ duration: 0.7, ease: EASE, delay: 0.15 + i * 0.08 }}
                    />
                  </span>
                </span>
              </div>
            ))}
          </div>
          <div className="mkt-pipe-foot mono">
            <span className="mkt-val-vdot" />
            Fit by what each buyer underwrites · no buyers contacted
          </div>
        </>
      )}
    </InView>
  );
}

/** RAISE · investor materials — an IC / investor deck preview: slide thumbnails + a lead slide. */
export function InvestorDeckMock() {
  const THUMBS = ['Thesis', 'Market', 'Model', 'Use of funds'];
  const BARS = [48, 63, 71, 84, 96]; // ARR ramp on the lead slide
  return (
    <InView className="mkt-deck" amount={0.35}>
      {(run, reduce) => (
        <>
          <div className="mkt-deck-stage">
            <div className="mkt-deck-slide">
              <div className="mkt-deck-slidehd">
                <span className="mkt-deck-slidekicker mono">Investment thesis</span>
                <span className="mkt-deck-slidepage mono num">03 / 14</span>
              </div>
              <div className="mkt-deck-slidetitle">A capital-efficient compounder</div>
              <div className="mkt-deck-chart" aria-hidden="true">
                {BARS.map((h, i) => (
                  <div className="mkt-deck-barslot" key={i}>
                    <motion.div
                      className="mkt-deck-bar"
                      initial={reduce ? { height: `${h}%` } : { height: '0%' }}
                      animate={run ? { height: `${h}%` } : {}}
                      transition={{ duration: 0.6, ease: EASE, delay: 0.15 + i * 0.08 }}
                    />
                  </div>
                ))}
              </div>
              <div className="mkt-deck-slidekpis">
                <div className="mkt-deck-slidekpi">
                  <span className="mkt-deck-kv mono num"><CountUp to={9.2} fmt={(n) => `$${n.toFixed(1)}M`} run={run} reduce={reduce} /></span>
                  <span className="mkt-deck-kk mono">ARR</span>
                </div>
                <div className="mkt-deck-slidekpi">
                  <span className="mkt-deck-kv mono num"><CountUp to={142} fmt={(n) => `${Math.round(n)}%`} run={run} reduce={reduce} delay={0.1} /></span>
                  <span className="mkt-deck-kk mono">Net retention</span>
                </div>
                <div className="mkt-deck-slidekpi">
                  <span className="mkt-deck-kv mono num"><CountUp to={47} fmt={(n) => `${Math.round(n)}`} run={run} reduce={reduce} delay={0.2} /></span>
                  <span className="mkt-deck-kk mono">Rule of 40</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mkt-deck-thumbs">
            {THUMBS.map((t) => (
              <div className="mkt-deck-thumb" key={t}>
                <span className="mkt-deck-thumbline" />
                <span className="mkt-deck-thumbline short" />
                <span className="mkt-deck-thumblabel mono">{t}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </InView>
  );
}

/** RAISE · cap table — an ownership / dilution table with pre vs. post-round bars. */
export function CapTableMock() {
  const ROWS: Array<{ name: string; pre: number; post: number }> = [
    { name: 'Founders', pre: 78, post: 61 },
    { name: 'Existing investors', pre: 14, post: 11 },
    { name: 'New round', pre: 0, post: 22 },
    { name: 'Option pool', pre: 8, post: 6 },
  ];
  return (
    <InView className="mkt-cap" amount={0.4}>
      {(run, reduce) => (
        <>
          <div className="mkt-cap-head">
            <span className="mkt-cap-title">Ownership · pre / post round</span>
            <span className="mkt-cap-raise mono num">$12M Series A</span>
          </div>
          <div className="mkt-cap-legend mono">
            <span className="mkt-cap-legitem"><span className="mkt-cap-swatch pre" />Pre</span>
            <span className="mkt-cap-legitem"><span className="mkt-cap-swatch post" />Post</span>
          </div>
          <div className="mkt-cap-rows">
            {ROWS.map((r, i) => (
              <div className="mkt-cap-row" key={r.name}>
                <span className="mkt-cap-name">{r.name}</span>
                <span className="mkt-cap-bars">
                  <span className="mkt-cap-bartrack">
                    <motion.span
                      className="mkt-cap-bar pre"
                      initial={reduce ? { width: `${r.pre}%` } : { width: '0%' }}
                      animate={run ? { width: `${r.pre}%` } : {}}
                      transition={{ duration: 0.7, ease: EASE, delay: 0.1 + i * 0.07 }}
                    />
                  </span>
                  <span className="mkt-cap-bartrack">
                    <motion.span
                      className="mkt-cap-bar post"
                      initial={reduce ? { width: `${r.post}%` } : { width: '0%' }}
                      animate={run ? { width: `${r.post}%` } : {}}
                      transition={{ duration: 0.7, ease: EASE, delay: 0.18 + i * 0.07 }}
                    />
                  </span>
                </span>
                <span className="mkt-cap-pct mono num">{r.post}%</span>
              </div>
            ))}
          </div>
          <div className="mkt-cap-foot mono">
            <span className="mkt-val-vdot" />
            $54M post-money · founder dilution 17 pts · pool topped to 6%
          </div>
        </>
      )}
    </InView>
  );
}

/** CONNECTORS · smbX inside an assistant — a Claude/ChatGPT-style thread where a
 *  tool call returns a real smbX artifact (valuation) with an audit + hash stamp. */
export function AssistantSurfaceMock({ assistant = 'Claude' }: { assistant?: string }) {
  return (
    <div className="mkt-asst">
      <div className="mkt-asst-hd">
        <span className="mkt-asst-name mono">{assistant}</span>
        <span className="mkt-asst-conn mono">
          <span className="mkt-asst-conndot" />
          smbX connector
        </span>
      </div>
      <div className="mkt-asst-user">
        What&rsquo;s Northwind worth at 5.5× on $8.4M EBITDA?
      </div>
      <div className="mkt-asst-tool">
        <span className="mkt-asst-toolhd mono">
          <span className="mkt-asst-toolglyph" aria-hidden="true">
            <YuliaGlyph size={13} />
          </span>
          smbX · valuation.run
          <span className="mkt-asst-toolok mono">200 OK</span>
        </span>
        <div className="mkt-asst-toolbody">
          <div className="mkt-asst-kv"><span>Enterprise value</span><span className="mono num">$46.2M</span></div>
          <div className="mkt-asst-kv"><span>EV / EBITDA</span><span className="mono num">5.5×</span></div>
          <div className="mkt-asst-kv"><span>Range</span><span className="mono num">$38M – $52M</span></div>
        </div>
        <div className="mkt-asst-stamp mono">
          <span>method v2.4</span>
          <span className="mkt-asst-hash">hash 0x9f3a…d21 <span className="mkt-asst-match">✓ matches app</span></span>
        </div>
      </div>
      <div className="mkt-asst-reply">
        At a 5.5× entry on $8.4M normalized EBITDA, the enterprise value is $46.2M,
        inside a $38M–$52M range. Every figure traces to its source.
      </div>
    </div>
  );
}
