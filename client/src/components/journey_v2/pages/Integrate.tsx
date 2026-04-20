/**
 * Glass Grok v2 · Integrate.tsx
 * 4 steps: Day 0 → 180-day plan → retention → thesis tracking.
 * Port of new_journey/project/integrate.html.
 */
import { useMemo, useState } from 'react';
import {
  DealStep, DealBench, Row, DealBottom,
  type DealTab, type DealStepScript,
} from '../deal-room';
import JourneyShell from '../shell/JourneyShell';
import InteractiveTool from '../shell/InteractiveTool';

interface Props {
  active: DealTab;
  onSend: (text: string) => void;
  onStartFree: () => void;
  onNavigate: (d: DealTab) => void;
  onSignIn?: () => void;
}

const SECTION_NAV = [
  { id: 's1', label: 'Day 0' },
  { id: 's2', label: '180-day plan' },
  { id: 's3', label: 'Retention' },
  { id: 's4', label: 'Thesis tracking' },
] as const;

const CHIPS = ['Day 0 checklist', '180-day plan', 'Retain key people', 'Am I on thesis?'] as const;

const SCRIPT: DealStepScript = {
  1: [
    { who: 'y', text: 'Close is <strong>T-48 hours</strong>. Payroll, insurance, banking are done. One flag: <strong>TX contractor license transfer</strong> needs seller’s signature for 90 days.' },
    { who: 'y', text: 'I drafted the addendum — add it to close docs. Don’t let this slip to post-close or you’ll be unable to invoice commercial jobs for three weeks.' },
  ],
  2: [
    { who: 'y', text: 'Plan is 6 workstreams, all named owners. Pricing reset day 45, MSA renewals day 60, service manager hire day 75.' },
    { who: 'me', text: 'What happens at day 30?' },
    { who: 'y', text: 'First cash runway check. You bought with <strong>$4.2M of working cap</strong>. I’ll flag if we’re burning faster than plan a full 60 days before the covenant test.' },
  ],
  3: [
    { who: 'y', text: 'Marco Delgado is your #1 retention risk. 22 years. Owns 60% of commercial dispatches. Replacement cost ~<strong>$340K</strong> and 4-6 months.' },
    { who: 'y', text: 'Package draft: $45K stay bonus over 24mo + 2% rollover + VP Operations title. Meeting is on his calendar Thursday. I wrote the opening.' },
  ],
  4: [
    { who: 'y', text: 'Week 14. EBITDA on plan. Recurring mix ahead. FCCV clean. One drift: <strong>concentration at 34%</strong>, thesis said 28% by Q2.' },
    { who: 'y', text: 'Root cause — neither of the two new MSAs has started. I booked the conversation with Marco for Wednesday.' },
  ],
};

type Tile = { title: string; status: string; tone: 'done' | 'live' | 'queued' };
const DAY0_TILES: readonly Tile[] = [
  { title: 'New entity + EIN',                  status: 'DONE',      tone: 'done' },
  { title: 'Payroll handover · ADP',            status: 'DONE',      tone: 'done' },
  { title: 'Ops liability + umbrella',          status: 'DONE',      tone: 'done' },
  { title: 'State contractor licenses (TX, OK)', status: 'AT RISK',  tone: 'live' },
  { title: 'Top-3 vendor notifications',        status: 'QUEUED',    tone: 'queued' },
  { title: 'Staff town hall · script drafted',  status: 'DAY 1, 7:00', tone: 'queued' },
  { title: 'AP transition · 47 open invoices',  status: 'DAY 1',     tone: 'queued' },
  { title: 'Keys, fobs, IT cutover',            status: 'DAY 2',     tone: 'queued' },
];

type Plan = { name: string; pct: number; due: string };
const PLAN_180: readonly Plan[] = [
  { name: 'Pricing reset',       pct: 45, due: 'DAY 45' },
  { name: 'MSA renewals × 3',    pct: 30, due: 'DAY 60' },
  { name: 'Service mgr hire',    pct: 60, due: 'DAY 75' },
  { name: 'Route optimization',  pct: 75, due: 'DAY 120' },
  { name: 'Tuck-in #1 · Summit', pct: 95, due: 'DAY 180' },
  { name: 'Billing system cutover', pct: 90, due: 'DAY 150' },
];

type ScorecardKpi = { label: string; value: string; sub: string; tone: 'on-plan' | 'ahead' | 'drift' };
const KPIS: readonly ScorecardKpi[] = [
  { label: 'On plan', value: '$1.14M', sub: 'Trailing 12-mo EBITDA · thesis $1.08M', tone: 'on-plan' },
  { label: 'Ahead',   value: '71%',    sub: 'Recurring revenue mix · thesis 65%',    tone: 'ahead' },
  { label: 'Drift',   value: '34%',    sub: 'Top-3 concentration · thesis ≤28% by Q2', tone: 'drift' },
  { label: 'On plan', value: '1.42×',  sub: 'FCCV · covenant 1.25×',                 tone: 'on-plan' },
];

export default function Integrate({ active, onSend, onStartFree, onNavigate, onSignIn }: Props) {
  void SECTION_NAV;
  return (
    <JourneyShell
      active={active}
      onNavigate={onNavigate}
      onSignIn={onSignIn}
      onStartFree={onStartFree}
      canvasKicker="POST-CLOSE · WALK-THROUGH"
      canvasTitle="The 72 hours that decide whether this deal works."
      chat={{
        title: 'Yulia',
        status: 'Day 3 post-close',
        script: SCRIPT,
        opening: 'Hi — I’m <strong>Yulia</strong>. You just closed Atlas Air. Close was Friday; it’s now Monday morning. Scroll to see what the first 180 days look like.',
        reply: 'Share the <strong>LOI</strong>, the <strong>QoE</strong>, and one sentence about your thesis. I’ll have a Day-0 checklist and a 180-day plan on your desk in two hours.',
        chips: CHIPS,
        onSend,
      }}
    >
      {/* Hero */}
      <DealStep
        n={1}
        id="hero"
        idx="Post-close"
        title="Day 1 after the wire. 180 employees. Do you have a plan?"
        lede={<>Yulia builds the 180-day integration plan from your specific deal data — risks identified, opportunities found, people to protect. Auto-generated before the wire hits. Executed one day at a time.</>}
      />

      {/* Problem */}
      <DealStep
        n={2}
        id="problem"
        idx="The stat"
        title="75% of acquisitions fail to achieve their stated synergies."
        lede={<>Harvard Business Review. Thirty years of research across thousands of deals. The #1 reason, every time: <strong>no integration plan</strong>. Not a bad plan. No plan.</>}
      >
        <div style={{
          marginTop: 18,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
        }}>
          <StatCard n="75%" label="Acquisitions that miss synergy targets (HBR)" />
          <StatCard n="40%+" label="Key-person attrition in year 1 without a retention plan" />
          <StatCard n="Day 0" label="When Yulia's 180-day plan lands — before the wire" />
        </div>
      </DealStep>

      {/* Day-1 checklist generator */}
      <DealStep
        n={3}
        id="generator"
        idx="Generator"
        title="Generate your Day-1 checklist."
        lede={<>Five questions. Customized checklist by category — IT, People, Customers, Vendors, Operations.</>}
      >
        <InteractiveTool
          kicker="Day-1 checklist generator"
          sub="Answer five. See your customized starter checklist in 5 seconds."
        >
          <Day1Generator onSend={onSend} />
        </InteractiveTool>
      </DealStep>

      {/* Step 04 · Day 0 */}
      <DealStep
        n={4}
        id="s1"
        idx="Day 0 · Atlas"
        title="The 72 hours that decide whether this deal works."
        lede={<>Bank accounts, payroll, insurance, licenses, vendor notifications, staff town hall, the first Monday. Yulia runs the Day-0 checklist against your deal structure and flags what has to happen <strong>before signing</strong> vs. what can slip to week one.</>}
      >
        <DealBench title="Day 0 · Atlas Air close" meta="T-48 HOURS" metaLive>
          <div style={{ padding: 22, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {DAY0_TILES.map(t => <StatusTile key={t.title} {...t} />)}
          </div>
          <FlagStrip>
            <strong style={{ color: '#0A0A0B' }}>Flag:</strong> Texas contractor license transfer needs seller’s continued signature for 90 days. Drafting the addendum — add to close docs, don’t let it slip to post-close.
          </FlagStrip>
        </DealBench>
      </DealStep>

      {/* Step 05 · 180-day plan */}
      <DealStep
        n={5}
        id="s2"
        idx="180-day plan"
        title="The first six months, scripted against your thesis."
        lede={<>You bought this company for a reason. Yulia translates that reason into a 180-day operating plan with named owners, weekly milestones, and a cash runway check at day 30, 90, and 180. You run the business; she watches the plan.</>}
      >
        <DealBench title="180-day plan · Atlas Air" meta="6 WORKSTREAMS">
          <div style={{ padding: 22 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {PLAN_180.map(p => <GanttRow key={p.name} {...p} />)}
            </div>
          </div>
        </DealBench>
      </DealStep>

      {/* Step 06 · Retention */}
      <DealStep
        n={6}
        id="s3"
        idx="Retention"
        title="Keep the people who actually run the place."
        lede={<>Most SMB deals lose <strong>40%+ of their key people</strong> in year one. Yulia maps the org, scores each role for replacement risk, and drafts the retention conversation — including stay bonus, equity, title, and a candid talk about what you’re changing.</>}
      >
        <DealBench title="Key-person map · Atlas Air" meta="14 ROLES · 4 CRITICAL" bodyStyle={{ padding: '0 22px 22px' }}>
          <Row
            title="Marco Delgado · Service Manager (22yrs)"
            sub="Owns 60% of commercial dispatches · replacement cost ~$340K · flight risk HIGH"
            amt={<span style={{ fontSize: 15, color: '#B02A2A' }}>Critical</span>}
          />
          <Row
            title="Jennifer Wu · Controller (14yrs)"
            sub="Every vendor relationship · bank signer · flight risk MEDIUM"
            amt={<span style={{ fontSize: 15, color: '#B02A2A' }}>Critical</span>}
          />
          <Row
            title="Three senior techs · certified"
            sub="Together cover 48% of revenue hours · replacement 4–6mo each"
            amt={<span style={{ fontSize: 15, color: '#E8A033' }}>Elevated</span>}
          />
          <Row
            title="Retention package · Marco"
            sub="$45K stay bonus (24mo vest) + 2% rollover equity + VP Operations title"
            amt={<span style={{ fontSize: 15 }}>Draft</span>}
            highlight
          />
        </DealBench>
      </DealStep>

      {/* Step 07 · Thesis tracking */}
      <DealStep
        n={7}
        id="s4"
        idx="Thesis tracking"
        title="Are you on thesis? Yulia tells you every Monday."
        lede={<>Every investment thesis comes with three or four numbers that matter — and fifty that don’t. Yulia pulls your GL, AP, CRM, and timesheet data weekly, tracks only the ones that matter, and flags the first week you drift.</>}
      >
        <DealBench title="Thesis scorecard · week 14" meta="MONDAY 6:02 AM" metaLive>
          <div style={{ padding: 22, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {KPIS.map(k => <KpiTile key={k.sub} {...k} />)}
          </div>
          <FlagStrip>
            <strong style={{ color: '#0A0A0B' }}>Drift flag:</strong> Concentration hasn’t moved since close. Your thesis had 28% by Q2 via two new MSAs. Neither has started. Booking the conversation with Marco for Wednesday.
          </FlagStrip>
        </DealBench>
      </DealStep>

      <DealBottom
        heading="Just closed a deal? Yulia writes your first 180 days."
        sub="Share the LOI, the QoE, and a sentence about your thesis. She returns a Day-0 checklist, a 180-day plan, and a weekly scorecard — ready by your first Monday."
        placeholder="Deal size, industry, thesis in one line…"
        onSend={onSend}
      />
    </JourneyShell>
  );
}

/* ─── atoms ─── */

function StatusTile({ title, status, tone }: Tile) {
  const style: Record<Tile['tone'], React.CSSProperties> = {
    done:   { background: '#F5F5F7', border: 'none' },
    live:   { background: '#fff', border: '0.5px solid #E8A033' },
    queued: { background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)' },
  };
  const statusColor = tone === 'done' ? '#22A755' : tone === 'live' ? '#E8A033' : '#6B6B70';
  const textColor = tone === 'queued' ? '#6B6B70' : '#0A0A0B';
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      padding: '12px 14px', borderRadius: 8, fontSize: 12.5,
      ...style[tone],
    }}>
      <span style={{ fontWeight: 600, color: textColor }}>{title}</span>
      <span style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace', color: statusColor, fontSize: 10 }}>{status}</span>
    </div>
  );
}

function GanttRow({ name, pct, due }: Plan) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: 14, alignItems: 'center', fontSize: 12.5 }}>
      <span style={{ fontWeight: 600 }}>{name}</span>
      <div style={{ height: 24, background: '#F0F0F2', borderRadius: 4, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${pct}%`, background: '#0A0A0B', borderRadius: 4 }} />
      </div>
      <span style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 10, color: '#6B6B70' }}>{due}</span>
    </div>
  );
}

function KpiTile({ label, value, sub, tone }: ScorecardKpi) {
  const palette: Record<ScorecardKpi['tone'], { bg: string; fg: string }> = {
    'on-plan': { bg: '#FAFAFB', fg: '#22A755' },
    'ahead':   { bg: '#FAFAFB', fg: '#22A755' },
    'drift':   { bg: '#FFF5EC', fg: '#E8A033' },
  };
  const { bg, fg } = palette[tone];
  return (
    <div style={{ background: bg, borderRadius: 10, padding: 16 }}>
      <div style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 9.5, letterSpacing: '0.1em', color: fg, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 28, marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: '#6B6B70' }}>{sub}</div>
    </div>
  );
}

function FlagStrip({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '14px 22px', background: '#FAFAFB', borderTop: '0.5px solid rgba(0,0,0,0.06)', fontSize: 12.5, color: '#3A3A3E', lineHeight: 1.55 }}>
      {children}
    </div>
  );
}

function StatCard({ n, label }: { n: string; label: string }) {
  return (
    <div style={{
      background: '#fff',
      border: '0.5px solid rgba(0,0,0,0.08)',
      borderRadius: 12,
      padding: 22,
    }}>
      <div style={{
        fontFamily: 'Sora, sans-serif',
        fontWeight: 800,
        fontSize: 34,
        letterSpacing: '-0.02em',
        color: '#0A0A0B',
      }}>{n}</div>
      <div style={{
        marginTop: 6,
        fontSize: 12.5,
        lineHeight: 1.45,
        color: '#3A3A3E',
      }}>{label}</div>
    </div>
  );
}

/* Day-1 checklist generator — 5 inputs → computed checklist by category.
   Industry-pattern outputs, not prescriptive. Tells Yulia to write the
   real one if the visitor wants to continue. */
type EmpBand = '<50' | '50–200' | '200–500' | '500+';
type RevBand = '<$5M' | '$5–25M' | '$25–100M' | '$100M+';
type CustBand = '0' | '1–5' | '5–20' | '20+';

const EMP_OPTS: readonly EmpBand[] = ['<50', '50–200', '200–500', '500+'];
const REV_OPTS: readonly RevBand[] = ['<$5M', '$5–25M', '$25–100M', '$100M+'];
const CUST_OPTS: readonly CustBand[] = ['0', '1–5', '5–20', '20+'];
const IND_OPTS = ['Services', 'Manufacturing', 'Healthcare', 'Technology', 'Construction', 'Retail', 'Other'] as const;

function Day1Generator({ onSend }: { onSend: (t: string) => void }) {
  const [industry, setIndustry] = useState<string>('');
  const [emp, setEmp] = useState<EmpBand | ''>('');
  const [rev, setRev] = useState<RevBand | ''>('');
  const [cust, setCust] = useState<CustBand | ''>('');
  const [sys, setSys] = useState<'yes' | 'no' | ''>('');

  const ready = !!(industry && emp && rev && cust && sys);

  const groups = useMemo(() => {
    if (!ready) return null;
    const empFactor = emp === '500+' ? 3 : emp === '200–500' ? 2 : emp === '50–200' ? 1.5 : 1;
    const sysFactor = sys === 'yes' ? 2 : 1;
    const custBonus = cust === '20+' ? 4 : cust === '5–20' ? 3 : cust === '1–5' ? 2 : 0;
    const itBase = [
      'Rotate admin credentials for top 50 systems',
      'Transfer DNS + domain ownership',
      'Audit and remove ex-employee access',
      'Insurance verification (cyber + D&O + umbrella)',
    ];
    const itExtras = [
      'ITGC review against SOC 2 scope',
      'Dedicated security-ops handover meeting',
      'SSO tenant cutover plan',
    ];
    const peopleBase = [
      'Individual retention conversation — top 5 key-people list from DD',
      'Comp review where compression identified',
      'First all-hands town hall (script drafted)',
      'Payroll system cutover confirmation',
    ];
    const peopleExtras = [
      'Union / works-council liaison (where applicable)',
      'Benefits re-enrollment communication',
      'Manager-level skip-levels in first 2 weeks',
    ];
    const custBase = [
      'Top customer outreach — CEO-to-CEO calls',
      'Contract & MSA inventory + renewals schedule',
    ];
    const vendBase = [
      'Top-10 vendor notifications',
      'AP transition + open-invoice reconciliation',
    ];
    const opsBase = [
      'Legal entity + EIN filings',
      'Licenses + permits transfer (state-specific)',
      'First Monday operating cadence defined',
    ];

    return {
      'IT / Security':  [...itBase, ...(empFactor > 1.5 ? itExtras : [])],
      People:           [...peopleBase, ...(empFactor > 1.5 ? peopleExtras : [])],
      Customers:        [...custBase, ...(custBonus > 0 ? [`Named-contact handoff for ${cust} seller-held relationships`] : [])],
      Vendors:          vendBase,
      Operations:       [...opsBase, ...(sysFactor > 1 ? ['Systems migration runbook + dependency map', 'Finance close-cutover rehearsal'] : [])],
    };
  }, [ready, emp, sys, cust]);

  const totalCount = useMemo(() => {
    if (!groups) return 0;
    return Object.values(groups).reduce((sum, arr) => sum + arr.length, 0);
  }, [groups]);

  void rev; // rev not used in heuristic currently; kept for future scoring
  void industry;

  return (
    <div style={{
      marginTop: 18,
      background: '#fff',
      border: '0.5px solid rgba(0,0,0,0.08)',
      borderRadius: 14,
      padding: 22,
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 10,
      }}>
        <SelectBlock label="Industry" options={IND_OPTS} value={industry} onChange={setIndustry} />
        <SelectBlock label="Employees" options={EMP_OPTS} value={emp} onChange={(v) => setEmp(v as EmpBand)} />
        <SelectBlock label="Revenue"  options={REV_OPTS} value={rev} onChange={(v) => setRev(v as RevBand)} />
        <SelectBlock label="Seller customer ties" options={CUST_OPTS} value={cust} onChange={(v) => setCust(v as CustBand)} />
        <SelectBlock label="Systems migration?" options={['yes', 'no'] as const} value={sys} onChange={(v) => setSys(v as 'yes' | 'no')} />
      </div>

      <div style={{
        marginTop: 18,
        padding: 20,
        background: ready ? '#FAFAFB' : '#FAFAFB',
        borderRadius: 12,
        minHeight: 120,
      }}>
        {groups ? (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}>
              <div style={{
                fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                fontSize: 10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#0A0A0B',
              }}>Your Day-1 checklist · {totalCount} items</div>
              <button
                type="button"
                onClick={() => onSend(`Generate my full PMI plan — ${industry} · ${emp} employees · ${rev} · ${cust} seller-held customer relationships · systems migration: ${sys}.`)}
                style={{
                  background: '#0A0A0B',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 999,
                  padding: '8px 14px',
                  fontFamily: 'Sora, sans-serif',
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >Continue with Yulia →</button>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 10,
            }}>
              {Object.entries(groups).map(([group, items]) => (
                <div key={group} style={{
                  background: '#fff',
                  border: '0.5px solid rgba(0,0,0,0.08)',
                  borderRadius: 10,
                  padding: 14,
                  fontSize: 11.5,
                  lineHeight: 1.5,
                }}>
                  <div style={{
                    fontFamily: 'Sora, sans-serif',
                    fontWeight: 700,
                    fontSize: 12,
                    marginBottom: 8,
                  }}>{group}</div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 5 }}>
                    {items.map((i) => <li key={i}>· {i}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ fontSize: 13, color: '#6B6B70', fontStyle: 'italic' }}>
            Pick all five inputs to generate a starter checklist.
          </div>
        )}
      </div>
    </div>
  );
}

function SelectBlock<T extends string>({ label, options, value, onChange }: {
  label: string;
  options: readonly T[];
  value: string;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <div style={{
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize: 9.5,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: '#6B6B70',
        marginBottom: 8,
      }}>{label}</div>
      <div style={{ display: 'grid', gap: 4 }}>
        {options.map((o) => {
          const active = value === o;
          return (
            <button
              key={o}
              type="button"
              onClick={() => onChange(o)}
              style={{
                padding: '7px 10px',
                textAlign: 'left',
                background: active ? '#0A0A0B' : '#FAFAFB',
                color: active ? '#fff' : '#1A1C1E',
                border: 'none',
                borderRadius: 8,
                fontFamily: 'Sora, sans-serif',
                fontWeight: 600,
                fontSize: 11.5,
                cursor: 'pointer',
              }}
            >{o}</button>
          );
        })}
      </div>
    </div>
  );
}
