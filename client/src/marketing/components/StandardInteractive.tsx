import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  motion,
  AnimatePresence,
  useInView,
  useReducedMotion,
  animate,
} from 'framer-motion';
import { ConformanceTerminal } from './ConformanceTerminal';

/**
 * StandardInteractive — the interactive pieces of the /standard page
 * ("The Diligence Standard"). Three self-contained, scroll-reveal,
 * reduced-motion-safe widgets that let a human dealmaker AND an agent/engineer
 * read the open specification:
 *
 *   1. StatRail        — count-up hero metrics (123 / 30 / 472 / 233).
 *   2. GateModelExplorer — pick a domain, the models it routes to animate in,
 *                          each with an M-code, a TIER badge, and authorities.
 *   3. ModelAnatomy    — toggle between two models (M109 / M206); each declares
 *                        inputs, computation (mono, not secret), worked example,
 *                        authorities, an audit packet, and a THE LINE note.
 *   4. ConformanceConsole — a terminal that types/plays the conformance run,
 *                          plus the machine-discovery surface (endpoints).
 *
 * Tokens only; built on the same `mkt-*` + `mock` chrome the rest of the
 * marketing site uses. FACTS ARE LOCKED — every number/name/M-code below is
 * verbatim from the spec brief; invent nothing.
 */

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

/* ============================================================
   shared: scroll-in count-up (mirrors HeroWorkspace / ProductMocks)
   ============================================================ */
function CountUp({
  to,
  fmt = (n) => `${Math.round(n)}`,
  run,
  reduce,
  duration = 1.2,
  delay = 0,
}: {
  to: number;
  fmt?: (n: number) => string;
  run: boolean;
  reduce: boolean;
  duration?: number;
  delay?: number;
}) {
  const [val, setVal] = useState(reduce ? to : 0);
  // Animate from the CURRENT value (not always 0) toward `to`. Starting from the
  // live value makes the count-up interruption-safe: if React 19 StrictMode (or
  // any remount) tears down the controls mid-run, the next effect pass resumes
  // from where it stopped and still lands on `to` — instead of freezing.
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
  return <>{fmt(val)}</>;
}

/* ============================================================
   1 · STAT RAIL — count-up hero metrics
   123 models · 30 decision gates · 472 conformance tests · 233 authority sources
   ============================================================ */
const STATS: Array<{ to: number; label: string }> = [
  { to: 123, label: 'models' },
  { to: 30, label: 'decision gates' },
  { to: 472, label: 'conformance tests' },
  { to: 233, label: 'authority sources' },
];

export function StatRail() {
  const reduce = !!useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  // Latch: once the rail has been seen (or on mount if it's already on-screen),
  // keep `run` true forever. This survives the React 19 StrictMode
  // mount→unmount→remount in dev — where a one-shot `useInView({once:true})`
  // can miss re-firing on the second mount and leave later cells frozen at 0.
  const [run, setRun] = useState(reduce);
  useEffect(() => {
    if (reduce) {
      setRun(true);
      return;
    }
    if (inView) setRun(true);
  }, [inView, reduce]);
  return (
    <div className="std-statrail" ref={ref}>
      {STATS.map((s, i) => (
        <div className="std-stat" key={s.label}>
          <span className="std-stat-v mono num">
            <CountUp to={s.to} run={run} reduce={reduce} delay={i * 0.12} />
          </span>
          <span className="std-stat-k mono">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   2 · GATE → MODEL EXPLORER
   ============================================================ */
type Tier = 'deterministic' | 'professional handoff' | 'research only';

type ModelRow = {
  name: string;
  code?: string;
  tier: Tier;
  authorities: string;
};

type Domain = {
  id: string;
  label: string;
  models: ModelRow[];
};

const DOMAINS: Domain[] = [
  {
    id: 'valuation',
    label: 'Valuation & earnings quality',
    models: [
      { name: 'Valuation baseline (multiples, DCF, comparables)', tier: 'deterministic', authorities: 'Damodaran 2026, GF Data' },
      { name: 'SDE & EBITDA normalization (QoE method)', tier: 'deterministic', authorities: 'ABA Deal Points 2025' },
      { name: 'Working-capital peg', code: 'M109', tier: 'deterministic', authorities: 'ABA 2025, SRS Acquiom 2025' },
      { name: 'Quality-of-earnings add-backs', tier: 'deterministic', authorities: 'SRS Acquiom 2025' },
    ],
  },
  {
    id: 'structure',
    label: 'Structure & tax',
    models: [
      { name: '§1060 seven-class allocation', code: 'M139', tier: 'deterministic', authorities: 'IRC §1060, Treas. Reg. 1.338-6' },
      { name: 'Asset vs. stock election', tier: 'deterministic', authorities: 'IRC §338' },
      { name: '§382 NOL limitation', tier: 'deterministic', authorities: 'IRC §382' },
      { name: '§280G parachute analysis', tier: 'deterministic', authorities: 'IRC §280G' },
      { name: 'Transaction-tax master', code: 'M200', tier: 'deterministic', authorities: 'state/local rules' },
      { name: 'FIRPTA withholding', code: 'M199', tier: 'deterministic', authorities: 'IRC §1445' },
    ],
  },
  {
    id: 'financing',
    label: 'Financing',
    models: [
      { name: 'SBA debt-service coverage', tier: 'deterministic', authorities: 'SBA SOP 50 10 8' },
      { name: 'LBO entry/exit, IRR & MOIC', tier: 'deterministic', authorities: 'market terms' },
      { name: 'ABL borrowing base', tier: 'deterministic', authorities: 'market terms' },
      { name: 'Convertible / SAFE conversion', tier: 'deterministic', authorities: 'market terms' },
      { name: 'Covenant baskets & make-whole', tier: 'deterministic', authorities: 'market terms' },
    ],
  },
  {
    id: 'legal',
    label: 'Legal economics',
    models: [
      { name: 'Indemnification ladder', code: 'M206', tier: 'deterministic', authorities: 'ABA 2025, SRS Acquiom 2025' },
      { name: 'Survival periods & escrow sizing', tier: 'deterministic', authorities: 'ABA 2025' },
      { name: 'RWI stack architecture', code: 'M108', tier: 'professional handoff', authorities: 'Marsh RWI 2025' },
      { name: 'Earnout architecture', code: 'M213', tier: 'professional handoff', authorities: 'SRS Acquiom 2025' },
      { name: 'Conditions logic & termination-fee economics', tier: 'deterministic', authorities: 'ABA 2025' },
    ],
  },
  {
    id: 'restructuring',
    label: 'Restructuring & capital structure',
    models: [
      { name: 'Three-prong solvency', code: 'M148', tier: 'deterministic', authorities: 'case law' },
      { name: '§363 asset-sale mechanics', code: 'M151', tier: 'deterministic', authorities: '11 U.S.C. §363' },
      { name: 'Plan feasibility & best-interests test', tier: 'deterministic', authorities: '11 U.S.C. §1129' },
      { name: 'Cramdown rate & 1111(b) election', tier: 'deterministic', authorities: 'case law' },
      { name: 'Liability management (uptier / drop-down)', code: 'M161–M163', tier: 'research only', authorities: 'case law' },
    ],
  },
  {
    id: 'realestate',
    label: 'Real estate overlays',
    models: [
      { name: 'Rent-roll normalization', tier: 'deterministic', authorities: 'market norms' },
      { name: 'NOI / cap-rate bridge', code: 'M190', tier: 'deterministic', authorities: 'market cap rates' },
      { name: 'Asset-vs-entity election', code: 'M187', tier: 'deterministic', authorities: 'IRC' },
      { name: 'OpCo / PropCo separation & ground lease', tier: 'deterministic', authorities: 'ASC 842' },
      { name: 'CITT transfer tax & PCA reserve', tier: 'deterministic', authorities: 'state rules' },
    ],
  },
  {
    id: 'diligence',
    label: 'Diligence & IP',
    models: [
      { name: 'HSR reportability', code: 'M128', tier: 'deterministic', authorities: 'FTC 2026 HSR thresholds' },
      { name: 'IP chain-of-title & lien search', tier: 'deterministic', authorities: 'UCC Article 9' },
      { name: 'OSS exposure & source-code escrow', tier: 'professional handoff', authorities: 'market norms' },
      { name: 'Cyber / privacy / sanctions / ESG / climate diligence', code: 'M130–M134', tier: 'professional handoff', authorities: 'market frameworks' },
    ],
  },
];

const TIER_CLASS: Record<Tier, string> = {
  deterministic: 'det',
  'professional handoff': 'pro',
  'research only': 'res',
};

function TierBadge({ tier }: { tier: Tier }) {
  return <span className={`std-tier ${TIER_CLASS[tier]}`}>{tier}</span>;
}

export function GateModelExplorer() {
  const reduce = !!useReducedMotion();
  const [active, setActive] = useState(DOMAINS[0].id);
  const domain = DOMAINS.find((d) => d.id === active) ?? DOMAINS[0];

  return (
    <div className="std-explorer">
      {/* domain selector — accessible radio-style pills */}
      <div className="std-domains" role="tablist" aria-label="Diligence domains">
        {DOMAINS.map((d) => {
          const selected = d.id === active;
          return (
            <button
              key={d.id}
              role="tab"
              type="button"
              id={`std-tab-${d.id}`}
              aria-selected={selected}
              aria-controls="std-explorer-panel"
              className={`std-domain${selected ? ' is-active' : ''}`}
              onClick={() => setActive(d.id)}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      {/* panel: the models the chosen domain routes to */}
      <div
        className="mock std-explorer-mock"
        id="std-explorer-panel"
        role="tabpanel"
        aria-labelledby={`std-tab-${domain.id}`}
      >
        <div className="mock-bar">
          <span className="mock-dot" />
          <span className="mock-dot" />
          <span className="mock-dot" />
          <span className="mock-title">{domain.label}</span>
          <span className="mock-tag mono">
            {domain.models.length} model{domain.models.length === 1 ? '' : 's'}
          </span>
        </div>
        <div className="std-explorer-body">
          <AnimatePresence mode="wait">
            <motion.div
              key={domain.id}
              className="std-modelrows"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {domain.models.map((m, i) => (
                <motion.div
                  key={m.name}
                  className="std-modelrow"
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.34, ease: EASE, delay: reduce ? 0 : i * 0.05 }}
                >
                  <div className="std-modelrow-main">
                    <span className="std-modelrow-name">{m.name}</span>
                    <span className="std-modelrow-auth mono">{m.authorities}</span>
                  </div>
                  <div className="std-modelrow-meta">
                    {m.code && <span className="std-modelrow-code mono">{m.code}</span>}
                    <TierBadge tier={m.tier} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
        {/* tier legend */}
        <div className="std-legend">
          <span className="std-legend-item">
            <span className="std-tier det">deterministic</span>
            computed in code
          </span>
          <span className="std-legend-item">
            <span className="std-tier pro">professional handoff</span>
            routed to a specialist
          </span>
          <span className="std-legend-item">
            <span className="std-tier res">research only</span>
            mapped, not executed
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   3 · ANATOMY OF A MODEL — toggle between M109 and M206
   ============================================================ */
type Anatomy = {
  id: string;
  code: string;
  name: string;
  runtime: string;
  inputs: ReactNode;
  computation: ReactNode;
  example: Array<{ k: string; v: string; accent?: boolean }>;
  authorities: string[];
  audit: Array<{ k: string; v: string }>;
  lineNote: string;
};

const ANATOMIES: Anatomy[] = [
  {
    id: 'm109',
    code: 'M109',
    name: 'Working-capital peg',
    runtime: 'MODEL.STRUCT.NWC.PEG.v1',
    inputs: (
      <>
        <code className="std-tok">monthly_nwc_cents[]</code> — trailing 12 months
        of net working capital (current assets − current liabilities), from the
        balance sheet
      </>
    ),
    computation: (
      <>
        <span className="std-c-cmt"># net working capital</span>
        {'\n'}NWC = current assets − current liabilities{'\n'}
        {'\n'}
        <span className="std-c-cmt"># the peg</span>
        {'\n'}peg = average(NWC) over the reference period{'\n'}
        {'\n'}
        <span className="std-c-cmt"># observed range</span>
        {'\n'}range = [min(NWC), max(NWC)]{'\n'}
        {'\n'}
        <span className="std-c-cmt"># purchase-price adjustment</span>
        {'\n'}adjustment = delivered NWC − peg
      </>
    ),
    example: [
      { k: 'Peg', v: '$1,250,000' },
      { k: 'Observed', v: '12 months' },
      { k: 'Range', v: '$980K – $1.52M' },
      { k: 'Delivered', v: '$1,265,700' },
      { k: 'Adjustment', v: '+$15,700', accent: true },
    ],
    authorities: [
      'ABA Deal Points 2025 (§ Working Capital)',
      'SRS Acquiom 2025 (§ NWC True-Up)',
    ],
    audit: [
      { k: 'model', v: 'M109' },
      { k: 'runtime', v: 'MODEL.STRUCT.NWC.PEG.v1' },
      { k: 'version', v: 'v1.0' },
      { k: 'methodology', v: 'V19' },
      { k: 'input hash', v: 'sha256(…)' },
      { k: 'output hash', v: 'sha256(…)' },
      { k: 'THE LINE', v: 'deterministic' },
    ],
    lineNote:
      'Computational output. You and your accountant decide whether the peg is right for closing.',
  },
  {
    id: 'm206',
    code: 'M206',
    name: 'Indemnification ladder',
    runtime: 'MODEL.LEGAL.INDEMNITY.LADDER.v1',
    inputs: (
      <>
        <code className="std-tok">purchase_price</code>{' · '}
        <code className="std-tok">cap_pct</code>{' · '}
        <code className="std-tok">basket_type</code>{' · '}
        <code className="std-tok">basket_cents</code>{' · '}
        <code className="std-tok">survival_months_general</code>{' · '}
        <code className="std-tok">survival_months_tax</code>
      </>
    ),
    computation: (
      <>
        <span className="std-c-cmt"># indemnity cap</span>
        {'\n'}cap = cap_pct × purchase_price{'\n'}
        {'\n'}
        <span className="std-c-cmt"># basket (tipping)</span>
        {'\n'}basket (tipping) → full recovery once exceeded{'\n'}
        {'\n'}
        <span className="std-c-cmt"># survival</span>
        {'\n'}survival schedule by rep class
      </>
    ),
    example: [
      { k: 'Deal', v: '$50M' },
      { k: 'Cap (2%)', v: '$1,000,000' },
      { k: 'Basket', v: '$50,000 (tipping)' },
      { k: 'General survival', v: '18 mo' },
      { k: 'Tax reps', v: '36 mo' },
      { k: 'Implied recovery', v: '$50K – $1.0M', accent: true },
    ],
    authorities: [
      'ABA Deal Points 2025 (median 2–3% cap, $50–100K basket, 15–18 mo survival)',
      'SRS Acquiom 2025',
    ],
    audit: [
      { k: 'model', v: 'M206' },
      { k: 'runtime', v: 'MODEL.LEGAL.INDEMNITY.LADDER.v1' },
      { k: 'version', v: 'v1.0' },
      { k: 'methodology', v: 'V19' },
      { k: 'input / output', v: 'hashes' },
      { k: 'THE LINE', v: 'deterministic' },
    ],
    lineNote: 'Market mechanics, not advice. You and counsel negotiate up or down.',
  },
];

function FileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

export function ModelAnatomy() {
  const reduce = !!useReducedMotion();
  const [active, setActive] = useState(ANATOMIES[0].id);
  const m = ANATOMIES.find((a) => a.id === active) ?? ANATOMIES[0];

  return (
    <div className="std-anatomy">
      {/* model toggle */}
      <div className="std-anatomy-toggle" role="tablist" aria-label="Choose a model">
        {ANATOMIES.map((a) => {
          const selected = a.id === active;
          return (
            <button
              key={a.id}
              role="tab"
              type="button"
              id={`std-anat-tab-${a.id}`}
              aria-selected={selected}
              aria-controls="std-anatomy-panel"
              className={`std-anatomy-tab${selected ? ' is-active' : ''}`}
              onClick={() => setActive(a.id)}
            >
              <span className="std-anatomy-tab-code mono">{a.code}</span>
              <span className="std-anatomy-tab-name">{a.name}</span>
            </button>
          );
        })}
      </div>

      <div
        className="mock std-anatomy-mock"
        id="std-anatomy-panel"
        role="tabpanel"
        aria-labelledby={`std-anat-tab-${m.id}`}
      >
        <div className="mock-bar">
          <span className="mock-dot" />
          <span className="mock-dot" />
          <span className="mock-dot" />
          <span className="mock-title">{m.runtime}</span>
          <span className="mock-tag mono">
            <span className="vdot" />
            {m.code}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={m.id}
            className="std-anatomy-body"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            {/* INPUTS */}
            <div className="std-anat-part">
              <span className="std-anat-label mono">Inputs</span>
              <p className="std-anat-inputs">{m.inputs}</p>
            </div>

            {/* COMPUTATION (mono, dark — not secret) */}
            <div className="std-anat-part">
              <span className="std-anat-label mono">Computation</span>
              <pre className="std-anat-comp mono">{m.computation}</pre>
            </div>

            {/* WORKED EXAMPLE */}
            <div className="std-anat-part">
              <span className="std-anat-label mono">Worked example</span>
              <div className="std-anat-kvs">
                {m.example.map((row) => (
                  <div className="std-anat-kv" key={row.k}>
                    <span className="std-anat-kv-k">{row.k}</span>
                    <span className={`std-anat-kv-v mono num${row.accent ? ' accent' : ''}`}>{row.v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AUTHORITIES */}
            <div className="std-anat-part">
              <span className="std-anat-label mono">Authorities</span>
              <ul className="std-anat-auth">
                {m.authorities.map((a) => (
                  <li key={a}>
                    <span className="std-anat-auth-icon" aria-hidden="true"><FileIcon /></span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>

            {/* AUDIT PACKET */}
            <div className="std-anat-part std-anat-part-wide">
              <span className="std-anat-label mono">Audit packet</span>
              <div className="std-anat-audit">
                {m.audit.map((row) => (
                  <span className="std-anat-chip mono" key={row.k}>
                    <span className="std-anat-chip-k">{row.k}</span>
                    <span className="std-anat-chip-v">{row.v}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* THE LINE note */}
            <div className="std-anat-line std-anat-part-wide">
              <span className="std-anat-line-tag mono">The line</span>
              <p>{m.lineNote}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ============================================================
   4 · CONFORMANCE CONSOLE — terminal run + machine discovery
   (terminal itself lives in ConformanceTerminal.tsx so Home's
   dark band can mount it without pulling in this whole module)
   ============================================================ */
type Discovery = { label: string; value: string; note?: string };

const DISCOVERY: Discovery[] = [
  { label: 'Spec manifest', value: '/api/definitive/spec' },
  { label: 'Catalog URI', value: 'definitive://v1.1/deal-mechanics' },
  { label: 'Machine discovery', value: '/.well-known/definitive.json' },
  { label: 'Agent card', value: '/.well-known/mcp/server-card.json' },
  { label: 'Reference impls', value: 'reference/definitive-ts', note: 'MIT, 4 core models' },
  { label: '', value: 'reference/definitive-python', note: 'MIT, 4 core models' },
];

export function ConformanceConsole() {
  return (
    <div className="std-console">
      <ConformanceTerminal />
      <div className="std-discovery">
        {DISCOVERY.map((d, i) => (
          <Fragment key={d.value}>
            <div className="std-discovery-row">
              {d.label ? (
                <span className="std-discovery-label">{d.label}</span>
              ) : (
                <span className="std-discovery-label std-discovery-cont" aria-hidden="true" />
              )}
              <code className="std-discovery-value mono">{d.value}</code>
              {d.note && <span className="std-discovery-note mono">{d.note}</span>}
            </div>
            {i < DISCOVERY.length - 1 && <span className="std-discovery-div" aria-hidden="true" />}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
