/**
 * Glass Grok v2 · Buy.tsx
 * 4 steps: sourcing → Rundown → DD pack → LOI structures.
 * Port of new_journey/project/buy.html.
 */
import {
  DealRoomPage, DealStep, DealBench, Row, ScoreDonut, DimList, DealBottom,
  type DealTab, type DealStepScript, type Dim,
} from '../deal-room';

interface Props {
  active: DealTab;
  onSend: (text: string) => void;
  onStartFree: () => void;
  onNavigate: (d: DealTab) => void;
  onSignIn?: () => void;
}

const SECTION_NAV = [
  { id: 's1', label: 'Sourcing' },
  { id: 's2', label: 'Rundown' },
  { id: 's3', label: 'DD pack' },
  { id: 's4', label: 'LOI' },
] as const;

const CHIPS = ['Find me deals', 'Score this target', 'Draft an LOI', 'Build a DD pack'] as const;

const RUNDOWN_DIMS: readonly Dim[] = [
  { label: 'Financial quality',         value: 9.1, tone: 'green' },
  { label: 'Margin stability',          value: 8.4, tone: 'green' },
  { label: 'Customer concentration',    value: 6.2, tone: 'amber' },
  { label: 'Recurring revenue',         value: 7.8, tone: 'green' },
  { label: 'Owner dependency',          value: 5.9, tone: 'amber' },
  { label: 'Integration fit · your thesis', value: 8.7, tone: 'green' },
];

const SCRIPT: DealStepScript = {
  1: [
    { who: 'y', text: 'Thesis filter: <strong>HVAC, $3–10M rev, TX+OK, 15%+ EBITDA</strong>. I pulled 47 named targets this week, all with owner contact info.' },
    { who: 'y', text: 'Atlas Air hits a 94 fit — commercial book, retiring 2nd-gen owner, clean financials. Your first outreach.' },
  ],
  2: [
    { who: 'y', text: 'Rundown on Atlas: <strong>83/100, Pursue</strong>. Concentration and owner dependency are the two yellows — both fixable in integration.' },
    { who: 'me', text: 'Is 38% concentration a dealbreaker?' },
    { who: 'y', text: 'Not at your check size. Two of the three are MSAs with 8+ year tenure. I’ll model a retention scenario before LOI.' },
  ],
  3: [
    { who: 'y', text: 'Running 42 diligence workstreams in parallel. QoE, WC peg, backlog all cleared. Key-person + enviro landing today.' },
    { who: 'y', text: 'One flag — 38% top-3 concentration on month-to-month MSAs. I drafted the conversation for your owner call.' },
  ],
  4: [
    { who: 'y', text: 'Three LOI structures modeled. Recommended: <strong>$16.8M, 70/20/10</strong>. Maximizes their after-tax NPV and keeps your check under $12M.' },
    { who: 'y', text: 'Rollover aligns them through year 3 — which is exactly when the concentration risk unwinds. Send it?' },
  ],
};

export default function Buy({ active, onSend, onStartFree, onNavigate, onSignIn }: Props) {
  return (
    <DealRoomPage
      active={active}
      sectionNav={SECTION_NAV}
      onNavigate={onNavigate}
      onSignIn={onSignIn}
      onStartFree={onStartFree}
      rail={{
        name: 'Yulia',
        status: 'Sourcing for searcher',
        script: SCRIPT,
        opening: 'Hi — I’m <strong>Yulia</strong>. Today I’m sourcing and diligencing for a searcher on an HVAC roll-up thesis. Scroll to watch.',
        reply: 'Give me three things: <strong>industry</strong>, <strong>geography</strong>, and <strong>check size</strong>. I’ll return a ranked list of named, off-market targets within the hour.',
        chips: CHIPS,
        onSend,
      }}
    >
      {/* Step 01 · Sourcing */}
      <DealStep
        n={1}
        id="s1"
        idx="Step 01 · Sourcing"
        title="Proprietary deal flow, not the MLS for broken businesses."
        lede={<>Yulia crawls 14M US business records, filters by your thesis, and pings owners who fit. Off-market. Named. Reachable. <strong>78% of our searchers close a deal that never hit BizBuySell.</strong></>}
      >
        <DealBench title="Deal flow · HVAC roll-up · TX+OK" meta="LIVE · 47 NEW THIS WEEK" metaLive bodyStyle={{ padding: '0 22px 22px' }}>
          <Row title="Atlas Air — Fort Worth, TX" sub="Commercial HVAC · $6.2M rev · 18% EBITDA · 2nd-gen owner, 58yo" amt={<span style={{ fontSize: 15 }}>Fit 94</span>} />
          <Row title="Summit Climate — Tulsa, OK" sub="Residential + light commercial · $4.1M rev · solo owner, exploring exit" amt={<span style={{ fontSize: 15 }}>Fit 91</span>} />
          <Row title="Benchmark Mechanical — Dallas, TX" sub="Service-heavy · $9.4M rev · 22% EBITDA · two partners, one retiring" amt={<span style={{ fontSize: 15 }}>Fit 88</span>} />
          <Row title="+ 44 more matching thesis" sub="Named, contactable, fit ≥ 70" amt={<span style={{ fontSize: 15 }}>View all</span>} highlight />
        </DealBench>
      </DealStep>

      {/* Step 02 · Rundown */}
      <DealStep
        n={2}
        id="s2"
        idx="Step 02 · Rundown"
        title="Every target, scored the same way. Before you ever get on a call."
        lede={<>Paste a CIM, a teaser, or three tax returns. Yulia returns a <strong>Rundown score</strong> in 15 minutes — financial quality, concentration risk, key-person risk, integration fit. Kill the 9 out of 10 bad deals fast.</>}
      >
        <DealBench
          title="Rundown · Atlas Air"
          meta="8 MIN AGO"
          metaLive
          bodyStyle={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 32, alignItems: 'center', padding: '26px 22px' }}
        >
          <div>
            <ScoreDonut score={83} />
            <div style={{ textAlign: 'center', marginTop: -18 }}>
              <div style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 9, letterSpacing: '0.15em', color: '#22A755', textTransform: 'uppercase' }}>Pursue</div>
            </div>
          </div>
          <DimList dims={RUNDOWN_DIMS} />
        </DealBench>
      </DealStep>

      {/* Step 03 · DD workstreams */}
      <DealStep
        n={3}
        id="s3"
        idx="Step 03 · Diligence pack"
        title="A Big-4 diligence pack. Without the Big-4 invoice."
        lede={<>Quality of Earnings. Customer concentration. Working capital peg. Key-person risk. Environmental. Yulia runs all 42 workstreams in parallel and produces the same memo your LPs expect — <strong>in 6 days, not 10 weeks</strong>.</>}
      >
        <DealBench title="DD workstreams · Atlas Air" meta="DAY 4 OF 6">
          <div style={{ padding: 22, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <DdTile title="QoE adjustments" status="DONE" tone="done" />
            <DdTile title="Customer cohort" status="DONE" tone="done" />
            <DdTile title="WC peg" status="DONE" tone="done" />
            <DdTile title="Backlog validation" status="DONE" tone="done" />
            <DdTile title="Key-person interviews" status="LIVE" tone="live" />
            <DdTile title="Environmental Phase I" status="LIVE" tone="live" />
            <DdTile title="Legal + corp review" status="DAY 5" tone="queued" />
            <DdTile title="IT + cyber" status="DAY 5" tone="queued" />
          </div>
          <FlagStrip>
            <strong style={{ color: '#0A0A0B' }}>Flag:</strong> 38% of revenue sits with top 3 customers. Two on month-to-month MSAs. Yulia drafted the retention conversation for the owner call.
          </FlagStrip>
        </DealBench>
      </DealStep>

      {/* Step 04 · LOI */}
      <DealStep
        n={4}
        id="s4"
        idx="Step 04 · LOI"
        title="Three LOIs. Three structures. One you can actually close."
        lede={<>Yulia drafts the LOI alongside you — cash/earnout mix, escrow, working-capital peg, non-competes, exclusivity window. She models the after-tax outcome for both sides so you walk in with the right number, not just a big one.</>}
      >
        <DealBench title="LOI structures · Atlas Air" meta="3 OPTIONS · MODELED">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: 22 }}>
            <LoiCard label="Aggressive" price="$18.4M" terms="85% cash · $2M earnout · 45-day exclusivity" />
            <LoiCard label="Recommended" price="$16.8M" terms="70% cash · 20% rollover · 10% seller note @ 6%" featured />
            <LoiCard label="Conservative" price="$15.2M" terms="60% cash · 30% rollover · performance earnout" />
          </div>
          <FlagStrip>
            <strong style={{ color: '#0A0A0B' }}>Yulia’s take:</strong> Recommended structure maximizes seller’s after-tax NPV at ~$14.1M while keeping your check size under $12M. Rollover aligns them through year 3 — exactly when concentration risk unwinds.
          </FlagStrip>
        </DealBench>
      </DealStep>

      <DealBottom
        heading="Tell Yulia your thesis. Get a list of real targets tonight."
        sub="Industry, geography, check size. She returns a ranked list of named, contactable targets with Rundown scores — usually within an hour."
        placeholder="Industry, geography, check size…"
        onSend={onSend}
      />
    </DealRoomPage>
  );
}

/* ─── page-local atoms ─── */

function DdTile({ title, status, tone }: { title: string; status: string; tone: 'done' | 'live' | 'queued' }) {
  const styles: Record<typeof tone, React.CSSProperties> = {
    done: { background: '#F5F5F7', border: 'none' },
    live: { background: '#fff', border: '0.5px solid #E8A033' },
    queued: { background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)' },
  };
  const statusColor = tone === 'done' ? '#22A755' : tone === 'live' ? '#E8A033' : '#6B6B70';
  const textColor = tone === 'queued' ? '#6B6B70' : '#0A0A0B';
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      padding: '12px 14px', borderRadius: 8, fontSize: 12.5,
      ...styles[tone],
    }}>
      <span style={{ fontWeight: 600, color: textColor }}>{title}</span>
      <span style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace', color: statusColor, fontSize: 10 }}>{status}</span>
    </div>
  );
}

function LoiCard({ label, price, terms, featured }: { label: string; price: string; terms: string; featured?: boolean }) {
  return (
    <div style={{
      background: featured ? '#0A0A0B' : '#fff',
      color: featured ? '#fff' : 'inherit',
      border: featured ? '0.5px solid #0A0A0B' : '0.5px solid rgba(0,0,0,0.08)',
      borderRadius: 12, padding: 18,
    }}>
      <div style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 9.5, letterSpacing: '0.1em', opacity: featured ? 0.7 : 0.5, marginBottom: 8, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em', marginBottom: 6 }}>{price}</div>
      <div style={{ fontSize: 11, lineHeight: 1.5, opacity: featured ? 0.85 : 0.7 }}>{terms}</div>
    </div>
  );
}

function FlagStrip({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: '14px 22px', background: '#FAFAFB',
      borderTop: '0.5px solid rgba(0,0,0,0.06)',
      fontSize: 12.5, color: '#3A3A3E', lineHeight: 1.55,
    }}>
      {children}
    </div>
  );
}
