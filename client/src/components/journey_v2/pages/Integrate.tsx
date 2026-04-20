/**
 * Glass Grok v2 · Integrate.tsx
 * 4 steps: Day 0 → 180-day plan → retention → thesis tracking.
 * Port of new_journey/project/integrate.html.
 */
import {
  DealStep, DealBench, Row, DealBottom,
  type DealTab, type DealStepScript,
} from '../deal-room';
import JourneyShell from '../shell/JourneyShell';

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
      {/* Step 01 · Day 0 */}
      <DealStep
        n={1}
        id="s1"
        idx="Step 01 · Day 0"
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

      {/* Step 02 · 180-day plan */}
      <DealStep
        n={2}
        id="s2"
        idx="Step 02 · 180-day plan"
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

      {/* Step 03 · Retention */}
      <DealStep
        n={3}
        id="s3"
        idx="Step 03 · Retention"
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

      {/* Step 04 · Thesis tracking */}
      <DealStep
        n={4}
        id="s4"
        idx="Step 04 · Thesis tracking"
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
