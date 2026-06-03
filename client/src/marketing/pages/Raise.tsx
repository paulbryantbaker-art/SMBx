import { useEffect, useRef, useState } from 'react';
import { useReducedMotion, animate } from 'framer-motion';
import { MarketingShell } from '../MarketingShell';
import { YuliaLauncher } from '../YuliaChat';
import { ClosingCTA } from '../components/ClosingCTA';
import { JourneyStepper, type JourneyStage } from '../components/JourneyStepper';
import { InvestorDeckMock, CapTableMock } from '../components/ProductMocks';

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

/* ============================================================
   shared scroll-in count-up (mirrors ProductMocks.CountUp)
   ============================================================ */
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
  const valRef = useRef(val);
  valRef.current = val;
  useEffect(() => {
    if (reduce) {
      setVal(to);
      return;
    }
    if (!run) return;
    const from = valRef.current;
    if (from === to) return;
    const controls = animate(from, to, {
      duration,
      delay,
      ease: EASE,
      onUpdate: (v) => setVal(v),
      onComplete: () => setVal(to),
    });
    return () => controls.stop();
  }, [run, to, duration, delay, reduce]);
  return <span className="mono num">{fmt(val)}</span>;
}

/* Animate-on-mount trigger for count-ups. Mocks here are either above the fold
   (hero) or revealed by an explicit stage selection (stepper panels remount per
   selection), so their numbers count up on mount — no scroll-in-view gating.
   Returns run=true after mount (or instantly under reduced motion). Uses
   setTimeout (not rAF) so it still fires in a backgrounded tab. Bar/row reveals
   are handled by CSS keyframes (the `jr-*` classes), which settle on their
   end-state regardless of frame scheduling. */
function useMountRun() {
  const reduce = !!useReducedMotion();
  const [run, setRun] = useState(reduce);
  useEffect(() => {
    if (reduce) {
      setRun(true);
      return;
    }
    const t = setTimeout(() => setRun(true), 0);
    return () => clearTimeout(t);
  }, [reduce]);
  return { run, reduce };
}

/* ============================================================
   HERO — raise-package readiness mock (count + rows reveal in)
   ============================================================ */
const READY_ROWS: Array<{ label: string; status: string; ready?: boolean }> = [
  { label: 'Normalized financials', status: 'ready', ready: true },
  { label: '5-year projection', status: 'ready', ready: true },
  { label: 'Cap table & terms', status: 'ready', ready: true },
  { label: 'Investor deck', status: 'ready', ready: true },
  { label: 'Data room', status: 'ready', ready: true },
  { label: 'Customer cohorts', status: 'in draft' },
];

function RaiseReadinessMock() {
  const { run, reduce } = useMountRun();
  return (
    <div className="mock" style={{ maxWidth: 420, margin: '0 auto' }}>
      <div className="mock-bar">
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-title">Raise package</span>
        <span className="mock-tag">
          <span className="vdot" />
          <CountUp to={14} fmt={(n) => `${Math.round(n)}`} run={run} reduce={reduce} duration={0.9} /> / 16 ready
        </span>
      </div>
      <div className="mock-body">
        {READY_ROWS.map((r, i) => (
          <div
            className="kv jr-rowin"
            key={r.label}
            style={{ animationDelay: `${0.12 + i * 0.07}s` }}
          >
            <span className="k mono" style={{ fontSize: '.86rem' }}>{r.label}</span>
            <span
              className={`v${r.ready ? ' pos' : ''}`}
              style={{ fontSize: '.78rem', color: r.ready ? undefined : 'var(--ink-3)' }}
            >
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   R1 visual — 5-year revenue projection (animated bars + footer stats)
   ============================================================ */
const PROJ_BARS: Array<{ label: string; pct: number; value: string }> = [
  { label: 'Y1', pct: 42, value: '$22M' },
  { label: 'Y2', pct: 54, value: '$28M' },
  { label: 'Y3', pct: 67, value: '$35M' },
  { label: 'Y4', pct: 83, value: '$43M' },
  { label: 'Y5', pct: 100, value: '$52M' },
];

function ProjectionVisual() {
  const { run: go, reduce } = useMountRun();
  return (
    <div className="mock">
      <div className="mock-bar">
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-title">Revenue projection — 5yr</span>
        <span className="mock-tag"><span className="vdot" />computed</span>
      </div>
      <div className="mock-body">
        <div className="bars">
          {PROJ_BARS.map((b, i) => (
            <div className="bar-row" key={b.label}>
              <span className="bl">{b.label}</span>
              <span className="bar-track">
                <span
                  className="bar-fill jr-barfill"
                  style={{ display: 'block', height: '100%', width: `${b.pct}%`, animationDelay: `${0.1 + i * 0.09}s` }}
                />
              </span>
              <span className="bv">{b.value}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 28, borderTop: '1px solid var(--line)', marginTop: 18, paddingTop: 16 }}>
          <div>
            <div className="mono" style={{ fontSize: '.7rem', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>CAGR</div>
            <div className="mono num" style={{ fontSize: '1.5rem', fontWeight: 500, color: 'var(--accent-strong)' }}>
              <CountUp to={24} fmt={(n) => `${Math.round(n)}%`} run={go} reduce={reduce} delay={0.5} />
            </div>
          </div>
          <div>
            <div className="mono" style={{ fontSize: '.7rem', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Gross margin</div>
            <div className="mono num" style={{ fontSize: '1.5rem', fontWeight: 500 }}>61%</div>
          </div>
          <div>
            <div className="mono" style={{ fontSize: '.7rem', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Rule of 40</div>
            <div className="mono num" style={{ fontSize: '1.5rem', fontWeight: 500 }}>46</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   R3 visual — funding landscape segments (NOT a contact list)
   ============================================================ */
function FundingLandscapeVisual() {
  return (
    <div className="mock">
      <div className="mock-bar">
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-title">Funding landscape</span>
        <span className="mock-tag"><span className="vdot" />by deal profile</span>
      </div>
      <div className="mock-body">
        <div className="tags">
          <span className="tag">Unitranche · 3.0–4.0× · 9–11%</span>
          <span className="tag">Growth equity · $30–60M pre</span>
          <span className="tag">SBA 7(a) · ≤ $5M · 1.15× DSCR</span>
        </div>
        <p className="mono" style={{ fontSize: '.72rem', color: 'var(--ink-3)', marginTop: 16, lineHeight: 1.5 }}>
          What each source underwrites to — not a contact list.
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   R5 visual — sources & uses reconciliation
   ============================================================ */
const SOURCES_USES: Array<{ k: string; v: string; cls?: string }> = [
  { k: 'Senior debt', v: '$30M' },
  { k: 'Equity', v: '$15M' },
  { k: 'Rollover', v: '$6M' },
  { k: 'Fees', v: '−$1.2M', cls: 'neg' },
];

function SourcesUsesVisual() {
  return (
    <div className="mock">
      <div className="mock-bar">
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-title">Sources &amp; uses</span>
        <span className="mock-tag"><span className="vdot" />reconciled</span>
      </div>
      <div className="mock-body">
        {SOURCES_USES.map((r) => (
          <div className="kv" key={r.k}>
            <span className="k" style={{ fontSize: '.9rem' }}>{r.k}</span>
            <span className={`v${r.cls ? ` ${r.cls}` : ''}`}>{r.v}</span>
          </div>
        ))}
        <p className="mono" style={{ fontSize: '.7rem', color: 'var(--ink-3)', marginTop: 14, letterSpacing: '.02em' }}>
          Illustrative · audit-stamped &amp; portable
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   Deep-dive — normalized earnings a lender expects (~$6.2M)
   ============================================================ */
const QOE_ROWS: Array<{ k: string; v: string; cls?: string; total?: boolean }> = [
  { k: 'Reported EBITDA', v: '$5.1M' },
  { k: 'Owner compensation', v: '+$0.7M', cls: 'pos' },
  { k: 'Non-recurring items', v: '+$0.4M', cls: 'pos' },
  { k: 'Normalized EBITDA', v: '$6.2M', total: true },
];

function NormalizedEarnings() {
  return (
    <div className="mock">
      <div className="mock-bar">
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-title">Quality of earnings</span>
        <span className="mock-tag"><span className="vdot" />normalized</span>
      </div>
      <div className="mock-body">
        {QOE_ROWS.map((r) => (
          <div
            className="kv"
            key={r.k}
            style={r.total ? { borderTop: '1px solid var(--line-2)', marginTop: 4, paddingTop: 12 } : undefined}
          >
            <span className="k" style={{ fontSize: '.9rem', fontWeight: r.total ? 600 : undefined, color: r.total ? 'var(--ink)' : undefined }}>{r.k}</span>
            <span
              className={`v${r.cls ? ` ${r.cls}` : ''}`}
              style={r.total ? { color: 'var(--accent-strong)', fontSize: '1.05rem' } : undefined}
            >
              {r.v}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   The raise, stage by stage — R0 … R5
   ============================================================ */
const RAISE_STAGES: JourneyStage[] = [
  {
    code: 'R0',
    title: 'Intake',
    build: 'A raise-readiness profile',
    blurb:
      "What you're raising, why, and against what — debt, equity, or a partial sale. Yulia flags what's missing before you start.",
  },
  {
    code: 'R1',
    title: 'Financial package',
    build: 'Normalized financials + a 5-year projection',
    blurb:
      'Recast earnings and a projection tied to the metrics your capital source underwrites to — not aspirational hockey sticks.',
    visual: <ProjectionVisual />,
  },
  {
    code: 'R2',
    title: 'Investor materials',
    build: 'A pitch deck and a data room',
    blurb: 'Drafted from the same package — consistent numbers, every figure cited.',
    visual: <InvestorDeckMock />,
  },
  {
    code: 'R3',
    title: 'Outreach',
    build: 'The funding landscape for deals like yours',
    blurb: 'Who funds deals like yours and what they underwrite to.',
    note: 'smbX.ai does not solicit or contact investors on your behalf.',
    visual: <FundingLandscapeVisual />,
  },
  {
    code: 'R4',
    title: 'Terms',
    build: 'Cap table, dilution, and term economics',
    blurb:
      "Model the cap table and the economics of every term you're offered — convertible caps and discounts, warrant coverage, the dilution waterfall.",
    visual: <CapTableMock />,
  },
  {
    code: 'R5',
    title: 'Closing',
    build: 'Funds flow and a portable package',
    blurb:
      'A sources-and-uses reconciliation and an audit-stamped package you can take anywhere.',
    visual: <SourcesUsesVisual />,
  },
];

export default function Raise() {
  return (
    <MarketingShell>
      {/* HERO */}
      <section style={{ paddingBottom: 'calc(var(--pad-y) * .5)' }}>
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1fr .9fr', gap: 56, alignItems: 'center' }}>
          <div className="reveal">
            <h1 className="display" data-d="1" style={{ fontSize: 'clamp(2.4rem,4.6vw,4rem)', maxWidth: '14ch' }}>
              The package capital providers actually require.
            </h1>
            <p className="lead reveal" data-d="2" style={{ marginTop: 24, maxWidth: '50ch' }}>
              Whether you&rsquo;re raising debt or equity, Yulia builds the financial package,
              models the terms you&rsquo;re offered, and assembles the investor materials a
              sophisticated lender or investor expects — from your real numbers, every figure
              cited.
            </p>
            <p className="reveal mono" data-d="2" style={{ marginTop: 16, fontSize: '.8rem', color: 'var(--ink-3)', letterSpacing: '.01em' }}>
              For operators, independent sponsors, and founders.
            </p>
            <div className="reveal" data-d="3">
              <YuliaLauncher />
            </div>
          </div>
          <div className="reveal" data-d="2">
            <RaiseReadinessMock />
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* THE RAISE, STAGE BY STAGE — interactive stepper */}
      <section>
        <div className="wrap reveal">
          <JourneyStepper
            idBase="raise"
            title="The raise, stage by stage"
            intro="From intake to a closed round — what Yulia builds at each step."
            stages={RAISE_STAGES}
          />
        </div>
      </section>

      {/* DEEP DIVE — projections a lender will accept */}
      <section>
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 56, alignItems: 'center' }}>
          <div className="reveal">
            <h2 style={{ maxWidth: '13ch' }}>Projections a lender will accept.</h2>
            <p className="lead" style={{ marginTop: 22, maxWidth: '46ch' }}>
              Underneath every projection is the recast earnings a lender actually
              underwrites to. Yulia normalizes the P&amp;L — owner comp, non-recurring
              items — so the number you raise against is the number that survives diligence.
            </p>
          </div>
          <div className="reveal" data-d="1">
            <NormalizedEarnings />
          </div>
        </div>
      </section>

      {/* BOUNDARY CALLOUT */}
      <section className="dark" style={{ paddingTop: 'calc(var(--pad-y) * .7)', paddingBottom: 'calc(var(--pad-y) * .7)' }}>
        <div className="wrap">
          <div className="reveal" style={{ display: 'flex', gap: 18, alignItems: 'flex-start', maxWidth: '60ch', margin: '0 auto' }}>
            <span aria-hidden="true" style={{ flex: 'none', width: 10, height: 10, marginTop: 12, background: 'var(--accent)', transform: 'rotate(45deg)' }} />
            <p style={{ fontSize: 'clamp(1.2rem,2vw,1.6rem)', fontWeight: 500, letterSpacing: '-.02em', lineHeight: 1.35, color: '#fff' }}>
              Yulia models the economics of the terms you&rsquo;re offered. She does not
              contact investors, solicit, place capital, or negotiate — that&rsquo;s yours and
              your advisors&rsquo;.
            </p>
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <ClosingCTA heading="Raising soon? Build the package first." launcher />
    </MarketingShell>
  );
}
