import { useEffect, useRef, useState } from 'react';
import { useReducedMotion, animate } from 'framer-motion';
import { MarketingShell } from '../MarketingShell';
import { YuliaLauncher } from '../YuliaChat';
import { ClosingCTA } from '../components/ClosingCTA';
import { JourneyStepper, type JourneyStage } from '../components/JourneyStepper';

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

/* shared scroll-in count-up (mirrors ProductMocks.CountUp) */
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

/* Animate-on-mount trigger for count-ups — twin of pages/Raise.tsx. Mocks are
   above the fold (hero) or revealed on stage selection (stepper panels remount),
   so numbers count up on mount; no scroll-in-view gating. setTimeout (not rAF)
   so it fires in a backgrounded tab. Bar/segment reveals use CSS keyframes
   (`jr-*`), which settle on their end-state regardless of frame scheduling. */
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
   HERO — the integration clock (day counter + progress reveal in)
   ============================================================ */
function IntegrationClockMock() {
  const { run, reduce } = useMountRun();
  return (
    <div className="mock" style={{ width: 280, textAlign: 'center' }}>
      <div className="mock-bar">
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-title">Integration clock</span>
      </div>
      <div className="mock-body" style={{ padding: '34px 24px' }}>
        <div className="mono num" style={{ fontSize: '4.6rem', fontWeight: 500, lineHeight: 1, letterSpacing: '-.04em' }}>
          <CountUp to={7} fmt={(n) => String(Math.round(n)).padStart(2, '0')} run={run} reduce={reduce} duration={0.9} />
        </div>
        <div className="mono" style={{ fontSize: '.8rem', color: 'var(--ink-3)', marginTop: 6 }}>of 100 days</div>
        <div style={{ height: 8, background: 'var(--surface-2)', borderRadius: 4, marginTop: 20, overflow: 'hidden' }}>
          <div
            className="jr-progress"
            style={{ height: '100%', width: '7%', background: 'var(--accent)', borderRadius: 4, animationDelay: '0.2s' }}
          />
        </div>
        <div className="mono" style={{ fontSize: '.74rem', color: 'var(--accent-strong)', marginTop: 14 }}>Phase · Stabilization</div>
      </div>
    </div>
  );
}

/* ============================================================
   PMI0 visual — first-week checklist
   ============================================================ */
const CHECKLIST: Array<{ k: string; v: string }> = [
  { k: 'Payroll cutover', v: 'Day 1' },
  { k: 'Bank & signatory access', v: 'Day 1' },
  { k: 'Key-customer calls', v: 'Day 2' },
  { k: 'System logins', v: 'Day 3' },
];

function ChecklistVisual() {
  return (
    <div className="mock">
      <div className="mock-bar">
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-title">First-week checklist</span>
        <span className="mock-tag"><span className="vdot" />sequenced</span>
      </div>
      <div className="mock-body">
        {CHECKLIST.map((r) => (
          <div className="kv" key={r.k}>
            <span className="k" style={{ fontSize: '.9rem' }}>{r.k}</span>
            <span className="v">{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   PMI1 visual — critical-path risk map
   ============================================================ */
const RISKS: Array<{ k: string; sev: 'High' | 'Med' | 'Low' }> = [
  { k: 'Vendor concentration', sev: 'High' },
  { k: 'Key-person dependency', sev: 'High' },
  { k: 'Customer churn on change of control', sev: 'Med' },
  { k: 'System migration', sev: 'Low' },
];
const SEV_STYLE: Record<'High' | 'Med' | 'Low', { color: string; bg: string; border: string }> = {
  High: { color: '#9A2F12', bg: '#FCE7DD', border: '#F0BBA6' },
  Med: { color: '#946200', bg: '#FBEFD6', border: '#ECCB8A' },
  Low: { color: 'var(--ink-3)', bg: 'var(--surface-2)', border: 'var(--line-2)' },
};

function RiskMapVisual() {
  return (
    <div className="mock">
      <div className="mock-bar">
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-title">Critical-path risk map</span>
        <span className="mock-tag"><span className="vdot" />first 30 days</span>
      </div>
      <div className="mock-body">
        {RISKS.map((r) => {
          const s = SEV_STYLE[r.sev];
          return (
            <div className="kv" key={r.k}>
              <span className="k" style={{ fontSize: '.9rem' }}>{r.k}</span>
              <span
                className="mono"
                style={{
                  fontSize: '.66rem',
                  letterSpacing: '.03em',
                  borderRadius: 999,
                  padding: '4px 10px',
                  color: s.color,
                  background: s.bg,
                  border: `1px solid ${s.border}`,
                }}
              >
                {r.sev}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   PMI2 visual — Revenue → EBITDA composition (dark mock)
   ============================================================ */
const COMPOSITION: Array<{ k: string; v: string; accent?: boolean }> = [
  { k: 'Revenue', v: '$34M' },
  { k: 'COGS', v: '$19M' },
  { k: 'Operating expense', v: '$6.0M' },
  { k: 'Identified leakage', v: '$0.6M' },
  { k: 'EBITDA', v: '$8.4M', accent: true },
];

function CompositionVisual() {
  // segment widths sum to 100% of revenue: COGS 56% · opex 18% · leakage 2% · EBITDA 24%
  const SEG = [
    { w: 56, bg: 'var(--surface-3)' },
    { w: 18, bg: 'var(--ink-3)' },
    { w: 2, bg: '#C0562F' },
    { w: 24, bg: 'var(--accent)' },
  ];
  return (
    <div className="mock" style={{ background: 'var(--dk-2)', borderColor: 'var(--dk-line)' }}>
      <div className="mock-bar" style={{ background: 'var(--dk-2)', borderColor: 'var(--dk-line)' }}>
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-title" style={{ color: 'rgba(255,255,255,.5)' }}>Revenue → EBITDA composition</span>
      </div>
      <div className="mock-body" style={{ color: '#fff' }}>
        <div style={{ display: 'flex', height: 42, borderRadius: 8, overflow: 'hidden', marginBottom: 18 }}>
          {SEG.map((s, i) => (
            <div
              key={i}
              className="jr-seg"
              style={{ background: s.bg, height: '100%', width: `${s.w}%`, animationDelay: `${0.1 + i * 0.1}s` }}
            />
          ))}
        </div>
        {COMPOSITION.map((r) => (
          <div className="kv" key={r.k} style={{ borderColor: 'var(--dk-line)' }}>
            <span className="k" style={{ color: 'rgba(255,255,255,.7)' }}>{r.k}</span>
            <span className="v" style={{ color: r.accent ? 'var(--accent)' : '#fff' }}>{r.v}</span>
          </div>
        ))}
        <p className="mono" style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.42)', marginTop: 14, letterSpacing: '.02em' }}>
          Illustrative
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   PMI3 visual — EBITDA value-bridge + ranked initiatives
   ============================================================ */
const BRIDGE: Array<{ label: string; pct: number; value: string }> = [
  { label: 'Today', pct: 70, value: '$8.4M' },
  { label: 'Pricing', pct: 78, value: '+$0.7M' },
  { label: 'Procure', pct: 86, value: '+$0.5M' },
  { label: 'Mix', pct: 92, value: '+$0.4M' },
  { label: 'Target', pct: 100, value: '$10.0M' },
];
const INITIATIVES: Array<{ name: string; tag: string }> = [
  { name: 'Reprice underwater accounts', tag: 'High · Low effort' },
  { name: 'Renegotiate top suppliers', tag: 'High · Med' },
  { name: 'Shift mix to service revenue', tag: 'Med · Med' },
];

function ValueBridgeVisual() {
  const { run: go, reduce } = useMountRun();
  return (
    <div className="mock">
      <div className="mock-bar">
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-title">EBITDA value bridge</span>
        <span className="mock-tag"><span className="vdot" />computed</span>
      </div>
      <div className="mock-body">
        <div className="bars">
          {BRIDGE.map((b, i) => (
            <div className="bar-row" key={b.label}>
              <span className="bl">{b.label}</span>
              <span className="bar-track">
                <span
                  className="bar-fill jr-barfill"
                  style={{ display: 'block', height: '100%', width: `${b.pct}%`, animationDelay: `${0.1 + i * 0.08}s` }}
                />
              </span>
              <span className="bv">{b.value}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--line)', marginTop: 16, paddingTop: 14 }}>
          {INITIATIVES.map((it) => (
            <div className="row" key={it.name} style={{ justifyContent: 'space-between', gap: 12, padding: '8px 0' }}>
              <span style={{ fontSize: '.9rem', fontWeight: 500 }}>{it.name}</span>
              <span className="tag" style={{ fontSize: '.68rem', whiteSpace: 'nowrap', flex: 'none' }}>{it.tag}</span>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid var(--line)', marginTop: 10, paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="mono" style={{ fontSize: '.74rem', color: 'var(--ink-3)' }}>Upside to EBITDA</span>
          <span className="mono num" style={{ fontSize: '1.4rem', fontWeight: 500, color: 'var(--accent-strong)' }}>
            <CountUp to={19} fmt={(n) => `+${Math.round(n)}%`} run={go} reduce={reduce} delay={0.5} />
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   The first 100 days, stage by stage — PMI0 … PMI3
   ============================================================ */
const PMI_STAGES: JourneyStage[] = [
  {
    code: 'PMI0',
    title: 'Day 0',
    build: 'A first-week checklist',
    blurb:
      'Payroll, banking, systems, key relationships — prioritized, with owners and deadlines.',
    visual: <ChecklistVisual />,
  },
  {
    code: 'PMI1',
    title: 'Stabilization',
    build: 'A critical-path and risk map',
    blurb:
      'What cannot break in the first 30 days, and the risk to each — vendor concentration, key people, customer churn on a change of ownership.',
    visual: <RiskMapVisual />,
  },
  {
    code: 'PMI2',
    title: 'Assessment',
    build: 'A revenue → EBITDA breakdown',
    blurb: 'Where the business actually makes money, and where margin quietly leaks.',
    visual: <CompositionVisual />,
  },
  {
    code: 'PMI3',
    title: 'Optimization',
    build: 'A sequenced value-creation plan',
    blurb:
      'The initiatives that move EBITDA, ranked by impact and effort — so you do the high-leverage work first.',
    visual: <ValueBridgeVisual />,
  },
];

export default function Integrate() {
  return (
    <MarketingShell>
      {/* HERO */}
      <section style={{ paddingBottom: 'calc(var(--pad-y) * .5)' }}>
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 56, alignItems: 'center' }}>
          <div className="reveal">
            <h1 className="display" data-d="1" style={{ fontSize: 'clamp(2.4rem,4.6vw,4rem)', maxWidth: '14ch' }}>
              The first 100 days, planned from the actuals.
            </h1>
            <p className="lead reveal" data-d="2" style={{ marginTop: 24, maxWidth: '47ch' }}>
              The deal closed. Now the work starts. Yulia turns the diligence you already
              did into a working integration plan — what to stabilize first, what to assess,
              and where the value actually is.
            </p>
            <p className="reveal mono" data-d="2" style={{ marginTop: 16, fontSize: '.8rem', color: 'var(--ink-3)', letterSpacing: '.01em' }}>
              For new owners — PE buyers, independent sponsors, and strategic acquirers.
            </p>
            <div className="reveal" data-d="3">
              <YuliaLauncher />
            </div>
          </div>
          <div className="reveal" data-d="2" style={{ display: 'flex', justifyContent: 'center' }}>
            <IntegrationClockMock />
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* THE FIRST 100 DAYS, STAGE BY STAGE — interactive stepper */}
      <section>
        <div className="wrap reveal">
          <JourneyStepper
            idBase="pmi"
            title="The first 100 days, stage by stage"
            intro="From Day 0 to a steady operation — what Yulia builds at each phase."
            stages={PMI_STAGES}
          />
        </div>
      </section>

      {/* SCOPE BOUNDARY CALLOUT */}
      <section className="dark" style={{ paddingTop: 'calc(var(--pad-y) * .7)', paddingBottom: 'calc(var(--pad-y) * .7)' }}>
        <div className="wrap">
          <div className="reveal" style={{ display: 'flex', gap: 18, alignItems: 'flex-start', maxWidth: '60ch', margin: '0 auto' }}>
            <span aria-hidden="true" style={{ flex: 'none', width: 10, height: 10, marginTop: 12, background: 'var(--accent)', transform: 'rotate(45deg)' }} />
            <p style={{ fontSize: 'clamp(1.2rem,2vw,1.6rem)', fontWeight: 500, letterSpacing: '-.02em', lineHeight: 1.35, color: '#fff' }}>
              Yulia builds the plan once, from the diligence you already did. She doesn&rsquo;t
              execute the work, manage your team, or track monthly actuals — your operators run it.
            </p>
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <ClosingCTA heading="Just closed? Start the clock with a plan." launcher />
    </MarketingShell>
  );
}
