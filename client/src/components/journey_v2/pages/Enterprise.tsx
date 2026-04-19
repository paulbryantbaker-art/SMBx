/**
 * Glass Grok v2 · Enterprise.tsx — explainer page.
 * 4 sections: firm logos → 4 use-case cards → pipeline workspace → ROI tiles.
 * Port of new_journey/project/enterprise.html.
 */
import {
  DealRoomPage, DealStep, DealBench, Row, DealBottom,
  type DealTab,
} from '../deal-room';

interface Props {
  active: DealTab;
  onSend: (text: string) => void;
  onStartFree: () => void;
  onNavigate: (d: DealTab) => void;
  onSignIn?: () => void;
}

const SECTION_NAV = [
  { id: 's1', label: 'Who uses this' },
  { id: 's2', label: 'Use cases' },
  { id: 's3', label: 'Workspace' },
  { id: 's4', label: 'ROI' },
] as const;

const CHIPS = ['Search fund', 'Lower MM PE', 'Family office', 'Boutique bank'] as const;

const LOGOS = [
  'Kepler', 'Meridian', 'Halcyon', 'Northstar', 'Atlas Grp',
  'Summit Capital', 'Pinehurst', 'Covington', 'Bridgepoint', 'Longwood',
] as const;

type CaseCard = { stat: string; statSub: string; title: string; quote: string; attr: string };
const CASES: readonly CaseCard[] = [
  {
    stat: '3.2×', statSub: 'deals/yr before→after',
    title: 'Search fund · independent sponsor',
    quote: '"I used to get through one deal a year because diligence ate four months. With Yulia running the 42 workstreams I can run three processes in parallel and still do the founder calls myself."',
    attr: '— Solo operator, post-MBA · Austin',
  },
  {
    stat: '−$1.4M', statSub: 'annual diligence spend',
    title: 'Lower-middle-market PE · $400M fund II',
    quote: '"We ran 14 QoEs last year. At $55K each that’s $770K out the door to Big-4 before a single deal closed. Now we run the same pack through Yulia for a subscription and only engage the Big-4 on final two."',
    attr: '— Partner, 12-person investment team · Chicago',
  },
  {
    stat: '11 days', statSub: 'close-to-monday-1',
    title: 'Family office · multi-generational',
    quote: '"Integration is where we used to lose money. Yulia’s Day-0 + 180-day plan means we walk in Monday knowing exactly who runs what and which MSA renewal happens Tuesday."',
    attr: '— Head of private investments · Dallas',
  },
  {
    stat: '6 → 14', statSub: 'concurrent mandates',
    title: 'Boutique sell-side bank · 8 bankers',
    quote: '"CIM drafting used to block every deal for 3 weeks. With Yulia generating draft one, our associates are reviewing and pushing in a day. We took our capacity from six live mandates to fourteen with the same team."',
    attr: '— MD, healthcare services · Boston',
  },
];

type RoiTile = { label: string; value: string; sub: string; dark?: boolean };
const ROI: readonly RoiTile[] = [
  { label: 'Diligence spend',  value: '−$620K',  sub: 'Avg. $55K QoE × 14 runs, down to $30K on final 2 only' },
  { label: 'Associate hours',  value: '−2,800h', sub: 'CIM, IOI tracking, model rebuilds — per year' },
  { label: 'Deal capacity',    value: '+2.3×',   sub: 'Same team, same IC cadence, more live deals' },
  { label: 'Time to IOI',      value: '−58%',    sub: 'From kickoff to first buyer IOI (sell-side)' },
  { label: 'Post-close drift catch', value: '7.2 wks', sub: 'Earlier vs. quarterly LP reporting cadence' },
  { label: 'Annual platform cost', value: '$118K', sub: 'Firm plan × 12mo. vs $1.4M of freed capacity', dark: true },
];

export default function Enterprise({ active, onSend, onStartFree, onNavigate, onSignIn }: Props) {
  return (
    <DealRoomPage
      active={active}
      sectionNav={SECTION_NAV}
      onNavigate={onNavigate}
      onSignIn={onSignIn}
      onStartFree={onStartFree}
      rail={{
        name: 'Yulia',
        status: 'For teams + firms',
        script: {},
        opening: 'Hi — I’m <strong>Yulia</strong>. Tell me about your firm and I’ll show you how teams like yours are using smbX at scale.',
        reply: 'Three things: <strong>firm type</strong>, <strong>team size</strong>, <strong>deals/year</strong>. I’ll model your specific ROI before anyone books a call.',
        chips: CHIPS,
        onSend,
      }}
    >
      {/* s1 · who uses this */}
      <DealStep
        n={1}
        id="s1"
        idx="Who uses smbX at scale"
        title="Search funds, lower-middle-market PE, family offices, boutique banks."
        lede={<>The firms that used to hire three associates and a VP to run a deal now run six deals with the same headcount. smbX is the platform, not the process.</>}
      >
        <div className="ent-logos">
          {LOGOS.map(l => <div key={l} className="ent-logo">{l}</div>)}
        </div>
      </DealStep>

      {/* s2 · use cases */}
      <DealStep
        n={2}
        id="s2"
        idx="Use cases"
        title="Four firm shapes. Four different workflows."
        lede={<>Below: how a real firm in each shape uses smbX day-to-day. Click any to see the config.</>}
      >
        <div style={{ marginTop: 18 }}>
          {CASES.map(c => (
            <div key={c.title} className="ent-case">
              <div className="ent-case__stat">
                {c.stat}
                <small>{c.statSub}</small>
              </div>
              <div>
                <div className="ent-case__t">{c.title}</div>
                <div className="ent-case__q">{c.quote}</div>
                <div className="ent-case__a">{c.attr}</div>
              </div>
            </div>
          ))}
        </div>
      </DealStep>

      {/* s3 · team workspace */}
      <DealStep
        n={3}
        id="s3"
        idx="Team workspace"
        title="Every deal in one workspace. Every teammate on the same page."
        lede={<>Multi-deal pipeline, versioned artifacts, shared chats, white-label client rooms, audit log. The parts that matter when six people are touching twelve deals.</>}
      >
        <DealBench title="Pipeline · Kepler Growth · Q2" meta="6 OF 14 LIVE" bodyStyle={{ padding: '0 22px 22px' }}>
          <Row
            title="Project Phoenix · HVAC platform"
            sub="Sell-side · IOIs in · 3 bidders · LOI this week"
            amt={<StageTag color="#22A755">LOI STAGE</StageTag>}
          />
          <Row
            title="Project Summit · Specialty services"
            sub="Buy-side · DD day 4 of 6 · one concentration flag"
            amt={<StageTag color="#E8A033">DILIGENCE</StageTag>}
          />
          <Row
            title="Project Halcyon · Minority recap"
            sub="Raise · deck v3 · 6 tier-1 investors engaged"
            amt={<StageTag color="#22A755">IC PREP</StageTag>}
          />
          <Row
            title="Atlas Air · Post-close"
            sub="Integration · week 14 · thesis: one drift flag"
            amt={<StageTag color="#6B6B70">MONITORING</StageTag>}
          />
          <Row
            title="+ 10 more in sourcing"
            sub="Rundown scored, awaiting next-step decision"
            amt={<span style={{ fontSize: 15 }}>View all</span>}
            highlight
          />
        </DealBench>
      </DealStep>

      {/* s4 · ROI */}
      <DealStep
        n={4}
        id="s4"
        idx="ROI"
        title="The math, for a 6-mandate firm."
        lede={<>Modeled against a $400M fund doing 6 platform deals a year + tuck-ins. Your numbers will vary; Yulia will model your firm specifically on the first call.</>}
      >
        <div className="ent-roi">
          {ROI.map(r => (
            <div
              key={r.label}
              className="ent-roi__c"
              style={r.dark ? { background: '#0A0A0B', color: '#fff', borderColor: '#0A0A0B' } : undefined}
            >
              <div className="ent-roi__l" style={r.dark ? { color: 'rgba(255,255,255,0.6)' } : undefined}>{r.label}</div>
              <div className="ent-roi__v">{r.value}</div>
              <div className="ent-roi__s" style={r.dark ? { color: 'rgba(255,255,255,0.7)' } : undefined}>{r.sub}</div>
            </div>
          ))}
        </div>
      </DealStep>

      <DealBottom
        heading="Tell Yulia about your firm. She’ll model your specific ROI before the demo."
        sub="Firm shape, team size, deal cadence. We’ll come back with a workspace config and a dollar number — before we book a call."
        placeholder="Firm type, team size, deals per year…"
        onSend={onSend}
      />
    </DealRoomPage>
  );
}

function StageTag({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{
      fontSize: 13,
      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      color,
    }}>
      {children}
    </span>
  );
}
