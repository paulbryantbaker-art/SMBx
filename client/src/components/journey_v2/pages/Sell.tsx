/**
 * Glass Grok v2 · Sell.tsx (also serves / as Home per specs.md)
 * ─────────────────────────────────────────────────────────────────
 * 4 steps: add-backs → readiness score → CIM preview → IOI comparison
 * Bottom close: "Paste revenue, industry, reported EBITDA."
 *
 * Content is a verbatim port of new_journey/project/sell.html —
 * Claude Design handoff, keep as-is until cutover is green.
 */
import {
  DealStep, DealBench, Row, ScoreDonut, DimList, DealBottom,
  type DealTab, type DealStepScript, type Dim,
} from '../deal-room';
import JourneyShell from '../shell/JourneyShell';

interface Props {
  active: DealTab;   /* 'home' or 'sell' — the same page serves both */
  onSend: (text: string) => void;
  onStartFree: () => void;
  onNavigate: (d: DealTab) => void;
  onSignIn?: () => void;
}

const SECTION_NAV = [
  { id: 's1', label: 'Add-backs' },
  { id: 's2', label: 'Readiness' },
  { id: 's3', label: 'CIM' },
  { id: 's4', label: 'Bids' },
] as const;

const CHIPS = [
  'What’s it worth?',
  'Find my add-backs',
  'Draft my CIM',
  'Am I ready?',
] as const;

const READINESS_DIMS: readonly Dim[] = [
  { label: 'Revenue quality',     value: 8.4, tone: 'green' },
  { label: 'Margins',             value: 7.9, tone: 'green' },
  { label: 'Owner dependency',    value: 5.2, tone: 'amber' },
  { label: 'Management depth',    value: 7.1, tone: 'green' },
  { label: 'Concentration',       value: 6.0, tone: 'amber' },
  { label: 'Financial integrity', value: 8.8, tone: 'green' },
];

const SCRIPT: DealStepScript = {
  1: [
    { who: 'y', text: 'I read Acme’s last three <strong>tax returns + QBs</strong>. Found <strong>$47K</strong> of defensible add-backs — owner comp above market, F-150s, spouse on payroll.' },
    { who: 'y', text: 'At your band that’s ~<strong>$258K</strong> more in enterprise value. Just from cleaning up the P&L.' },
  ],
  2: [
    { who: 'y', text: 'Now scoring through a buyer’s lens — seventeen dimensions.' },
    { who: 'y', text: 'Acme came in at <strong>75/100</strong>. Margins + financials are strong. Owner dependency and concentration are the fixable ones — I’ll show the playbook.' },
  ],
  3: [
    { who: 'y', text: 'Drafting the CIM now. 28 pages. Positioning Acme as a <strong>regional platform</strong> with three growth levers, not a 30-year services business.' },
    { who: 'me', text: 'How much does positioning actually matter?' },
    { who: 'y', text: 'Same company, two ways, trades at <strong>4.5× or 7×</strong>. On Acme that’s a <strong>$4.7M</strong> spread. Rarely about the business.' },
  ],
  4: [
    { who: 'y', text: 'Outreach went to 11 buyers. Three IOIs back. Strategic is leading on headline + certainty.' },
    { who: 'y', text: 'After-tax within $180K — but rollover creates a <strong>second bite in 3–5 years</strong>. Model both?' },
  ],
};

export default function Sell({ active, onSend, onStartFree, onNavigate, onSignIn }: Props) {
  void SECTION_NAV; /* kept above for future bottom progress indicator */
  return (
    <JourneyShell
      active={active}
      onNavigate={onNavigate}
      onSignIn={onSignIn}
      onStartFree={onStartFree}
      canvasKicker="SELL-SIDE · WALK-THROUGH"
      canvasTitle="Know what you have. Before anyone else does."
      chat={{
        title: 'Yulia',
        status: 'Working on Acme HVAC',
        script: SCRIPT,
        opening: 'Hi — I’m <strong>Yulia</strong>. I’ll walk you through a real sell-side deal using Acme HVAC as the example. Scroll to follow along.',
        reply: 'To run your numbers I need three things: <strong>industry</strong>, <strong>revenue</strong>, and <strong>reported EBITDA</strong>. Drop them in and I’ll have a preliminary range in about 20 minutes.',
        chips: CHIPS,
        onSend,
      }}
    >
      {/* ═══ Step 01 · Add-backs ═══ */}
      <DealStep
        n={1}
        id="s1"
        idx="Step 01 · What you have"
        title="Know what you have. Before anyone else does."
        lede={
          <>
            Yulia read Acme’s last three tax returns. She found <strong>$47K</strong> of
            defensible add-backs the seller never told the broker. At 5.5× that’s a
            quarter million in enterprise value — already in the financials, just
            unclaimed.
          </>
        }
      >
        <DealBench
          title="Add-back schedule · Acme HVAC"
          meta={<>YULIA · LIVE</>}
          metaLive
          bodyStyle={{ padding: '0 22px 22px' }}
        >
          <Row title="Owner comp above market" sub="$165K paid · $143K benchmark (BLS MSA)" amt="+$22,000" />
          <Row title="Personal vehicles on books" sub="2 F-150s · fuel, maintenance, insurance" amt="+$14,000" />
          <Row title="Spouse on payroll" sub="Replaceable at market rate" amt="+$11,000" />
          <Row title="Blind Equity™ total" sub="Adds ~0.35× to multiple on upper band" amt="+$47K" highlight />
        </DealBench>
      </DealStep>

      {/* ═══ Step 02 · Readiness ═══ */}
      <DealStep
        n={2}
        id="s2"
        idx="Step 02 · What a buyer sees"
        title="Your business, scored through a buyer’s lens."
        lede={
          <>
            Seventeen dimensions. Revenue quality, margins, concentration, owner
            dependency, financial integrity. The same checklist every PE associate
            runs — automated and consistent.
          </>
        }
      >
        <DealBench
          title="Readiness score · Acme HVAC"
          meta="6 MIN AGO"
          metaLive
          bodyStyle={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 32, alignItems: 'center' }}
        >
          <ScoreDonut score={75} />
          <DimList dims={READINESS_DIMS} />
        </DealBench>
      </DealStep>

      {/* ═══ Step 03 · CIM preview ═══ */}
      <DealStep
        n={3}
        id="s3"
        idx="Step 03 · What buyers read"
        title="A CIM that positions a platform, not a business."
        lede={
          <>
            28 pages. Written in the voice of a boutique banker — not a template.
            The same business, positioned two ways, trades at <strong>4.5× or 7×</strong>.
            The difference is almost never the business.
          </>
        }
      >
        <DealBench
          title="CIM preview · Project Phoenix"
          meta="28 PAGES · CONFIDENTIAL"
          bodyStyle={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, background: '#FAFAFB', padding: 22 }}
        >
          <CimPage
            idx="01 · Executive summary"
            title="A 32-year regional HVAC platform, positioned for geographic expansion."
            kpis={[
              { label: 'Revenue',    value: '$8.4M' },
              { label: 'Adj EBITDA', value: '$1.9M' },
              { label: 'Margin',     value: '22.6%' },
            ]}
          />
          <CimPage
            idx="07 · Growth levers"
            title="Three identified levers to double EBITDA within 36 months."
          />
        </DealBench>
      </DealStep>

      {/* ═══ Step 04 · IOI comparison ═══ */}
      <DealStep
        n={4}
        id="s4"
        idx="Step 04 · Competitive process"
        title="One buyer gives you a price. Five give you a market."
        lede={
          <>
            Yulia identifies the buyer universe, sequences outreach, and stacks IOIs
            against each other. The winning bid in a competitive process is typically
            {' '}<strong>15–30% above</strong> the first offer.
          </>
        }
      >
        <DealBench
          title="IOI comparison · round 1"
          meta="3 OF 11 BUYERS · 2 WEEKS IN"
          bodyStyle={{ padding: 0 }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: 22 }}>
            <IoiCard label="Family office" price="$2.4M" terms="100% cash · 60-day close · no earnout" />
            <IoiCard label="Strategic" price="$2.9M" terms="85% cash · 15% rollover · synergy case strong" featured />
            <IoiCard label="PE roll-up" price="$2.7M" terms="$400K earnout · 90-day diligence" />
          </div>
          <div style={{
            padding: '14px 22px', background: '#FAFAFB',
            borderTop: '0.5px solid rgba(0,0,0,0.06)',
            fontSize: 12.5, color: '#3A3A3E', lineHeight: 1.55,
          }}>
            <strong style={{ color: '#0A0A0B' }}>Yulia’s take:</strong> Strategic
            wins on headline and certainty. After-tax, all three within $180K —
            but the rollover creates a second-bite in 3–5 years.
          </div>
        </DealBench>
      </DealStep>

      {/* ═══ Bottom close ═══ */}
      <DealBottom
        heading="Paste revenue, industry, and reported EBITDA."
        sub="Yulia returns a preliminary value range, add-back list, and readiness score in about 20 minutes. No credit card."
        placeholder="Industry, revenue, reported EBITDA…"
        onSend={onSend}
      />
    </JourneyShell>
  );
}

/* ───────────────────────────────────────────────────────────────────
   Page-local atoms (used only here — kept inline for readability)
   ─────────────────────────────────────────────────────────────────── */

function CimPage({ idx, title, kpis }: {
  idx: string; title: string; kpis?: { label: string; value: string }[];
}) {
  return (
    <div style={{
      background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)',
      borderRadius: 10, padding: 20, aspectRatio: '4/5',
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize: 9.5, letterSpacing: '0.1em', color: '#9A9A9F', marginBottom: 10,
      }}>{idx}</div>
      <div style={{
        fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 13,
        lineHeight: 1.3, marginBottom: 12,
      }}>{title}</div>
      {/* Fake body text — 4 grey bars of varying widths */}
      {[94, 88, 62, 70].map((w, i) => (
        <div key={i} style={{ height: 4, width: `${w}%`, background: '#E8E8EB', borderRadius: 2, marginBottom: 6 }} />
      ))}
      {kpis && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${kpis.length}, 1fr)`, gap: 8, marginTop: 14 }}>
          {kpis.map(k => (
            <div key={k.label}>
              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 13 }}>{k.value}</div>
              <div style={{ fontSize: 9, color: '#9A9A9F', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function IoiCard({ label, price, terms, featured }: {
  label: string; price: string; terms: string; featured?: boolean;
}) {
  return (
    <div style={{
      background: featured ? '#0A0A0B' : '#fff',
      color: featured ? '#fff' : 'inherit',
      border: featured ? '0.5px solid #0A0A0B' : '0.5px solid rgba(0,0,0,0.08)',
      borderRadius: 12,
      padding: 18,
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize: 9.5, letterSpacing: '0.1em',
        opacity: featured ? 0.7 : 0.5,
        marginBottom: 8, textTransform: 'uppercase',
      }}>{label}</div>
      <div style={{
        fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 26,
        letterSpacing: '-0.02em', marginBottom: 6,
      }}>{price}</div>
      <div style={{ fontSize: 11, lineHeight: 1.5, opacity: featured ? 0.85 : 0.7 }}>
        {terms}
      </div>
    </div>
  );
}
