/**
 * Glass Grok v2 · Sell.tsx — merged SITE_COPY April 2026 + Acme HVAC
 * walkthrough.
 *
 * Sections: hero → 75%-regret problem → interactive add-back
 * estimator → Acme add-backs → readiness → CIM preview → IOI
 * comparison → exit paths (6 structures).
 */
import { useMemo, useState } from 'react';
import {
  DealStep, DealBench, Row, ScoreDonut, DimList, DealBottom,
  type DealTab, type DealStepScript, type Dim,
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

const CHIPS = ['What\'s it worth?', 'Find my add-backs', 'Am I ready?', 'Sell or raise?'] as const;

const READINESS_DIMS: readonly Dim[] = [
  { label: 'Revenue quality',     value: 8.4, tone: 'green' },
  { label: 'Margins',             value: 7.9, tone: 'green' },
  { label: 'Owner dependency',    value: 5.2, tone: 'amber' },
  { label: 'Management depth',    value: 7.1, tone: 'green' },
  { label: 'Concentration',       value: 6.0, tone: 'amber' },
  { label: 'Financial integrity', value: 8.8, tone: 'green' },
];

const SCRIPT: DealStepScript = {
  4: [
    { who: 'y', text: 'I read Acme\'s last three <strong>tax returns + QBs</strong>. Found <strong>$47K</strong> of defensible add-backs — owner comp above market, F-150s, spouse on payroll.' },
    { who: 'y', text: 'At your band that\'s ~<strong>$258K</strong> more in enterprise value. Just from cleaning up the P&L.' },
  ],
  5: [
    { who: 'y', text: 'Scoring through a buyer\'s lens — seventeen dimensions. Acme came in at <strong>75/100</strong>. Owner dependency and concentration are the fixable ones.' },
  ],
  6: [
    { who: 'y', text: 'Drafting the CIM now. 28 pages. Positioning Acme as a <strong>regional platform</strong> with three growth levers, not a 30-year services business.' },
    { who: 'y', text: 'Same company, two ways, trades at <strong>4.5× or 7×</strong>. On Acme that\'s a <strong>$4.7M</strong> spread. Rarely about the business.' },
  ],
  7: [
    { who: 'y', text: '11 buyers in. Three IOIs back. Strategic is leading on headline + certainty. After-tax within $180K but rollover creates a <strong>second bite in 3–5 years</strong>.' },
  ],
};

/* Interactive add-back estimator — industry patterns, not real data. */
const REVENUE_OPTIONS: readonly string[] = ['$1–5M', '$5–10M', '$10–25M', '$25–50M', '$50M+'];
const INDUSTRY_OPTIONS: readonly string[] = ['Services', 'Manufacturing', 'Healthcare', 'Technology', 'Construction', 'Retail', 'Other'];
const OWNER_OPTIONS: readonly string[] = ['Full-time operator', 'Part-time', 'Management team runs it'];

/* Industry-pattern hidden-value ranges per revenue band.
   Rough numbers — real analysis is specific to the business. */
function estimateHiddenValue(rev: string, industry: string, owner: string): { low: number; high: number } | null {
  if (!rev || !industry || !owner) return null;
  const revFactor: Record<string, [number, number]> = {
    '$1–5M':   [0.35, 0.65],
    '$5–10M':  [0.6,  1.2],
    '$10–25M': [1.1,  2.2],
    '$25–50M': [2.0,  3.8],
    '$50M+':   [3.5,  6.5],
  };
  const industryBoost: Record<string, number> = {
    'Services':     1.1,
    'Manufacturing': 1.0,
    'Healthcare':   1.15,
    'Technology':   0.9,
    'Construction': 1.05,
    'Retail':       0.95,
    'Other':        1.0,
  };
  const ownerBoost = owner === 'Full-time operator' ? 1.25 : owner === 'Part-time' ? 1.05 : 0.85;
  const [lo, hi] = revFactor[rev] ?? [0, 0];
  const iB = industryBoost[industry] ?? 1.0;
  return { low: lo * iB * ownerBoost, high: hi * iB * ownerBoost };
}

type ExitPath = { n: string; title: string; body: string; typical?: string };
const EXIT_PATHS: readonly ExitPath[] = [
  { n: '01', title: 'Full Sale',                 body: 'Sell 100%. Maximum immediate liquidity. Clean break. Best for owners ready to exit entirely.' },
  { n: '02', title: 'Majority Sale with Rollover', body: 'Sell 51–80% to PE or a strategic. Cash today, equity retained for a second bite when the business exits again in 3–5 years.', typical: '15–30% rollover' },
  { n: '03', title: 'Minority Equity Raise',     body: 'Sell 20–40% to a growth investor. Access capital without giving up control. Stay in the operator seat.', typical: '$5M–$25M raised' },
  { n: '04', title: 'ESOP',                      body: 'Sell to your employees. Significant tax advantages via Section 1042. Stay as chairman. Culture preserved.', typical: '70–80% of FMV' },
  { n: '05', title: 'Dividend Recapitalization', body: 'Lever the business with debt, pay yourself a dividend. Retain 100% equity. Business services the debt.', typical: '$10M–$50M distributed' },
  { n: '06', title: 'Partial Asset Sale',        body: 'Sell a division, license IP, or sell-leaseback real estate. Unlock value without a full exit.' },
];

export default function Sell({ active, onSend, onStartFree, onNavigate, onSignIn }: Props) {
  return (
    <JourneyShell
      active={active}
      onNavigate={onNavigate}
      onSignIn={onSignIn}
      onStartFree={onStartFree}
      chat={{
        title: 'Yulia',
        status: 'Working on Acme HVAC',
        script: SCRIPT,
        opening: "Hi — I'm <strong>Yulia</strong>. I'll walk you through a real sell-side deal using Acme HVAC as the example. Scroll to follow along.",
        reply: 'To run your numbers I need three things: <strong>industry</strong>, <strong>revenue</strong>, and <strong>reported EBITDA</strong>. Drop them in and I\'ll have a preliminary range in about 20 minutes.',
        chips: CHIPS,
        onSend,
      }}
    >
      {/* Hero */}
      <DealStep
        n={1}
        id="s1"
        idx="Sell-side"
        title="Know what you have. Before anyone else does."
        lede={<>Yulia finds the value hiding in your financials, builds the documents that sell your business, and manages the process that gets you to the closing table. From first conversation to wire transfer.</>}
      />

      {/* Problem */}
      <DealStep
        n={2}
        id="s2"
        idx="The problem"
        title="75% of owners who sell their business regret it within a year."
        lede={<>The Exit Planning Institute surveyed thousands of former owners. The regrets are almost always the same: they weren\'t financially prepared. They left hundreds of thousands — sometimes millions — on the table. In add-backs they never identified. In tax structures they never modeled. In processes they never ran. Most of it was preventable.</>}
      >
        <div style={{
          marginTop: 18,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
        }}>
          <StatCard n="$1.1M" label="Average hidden value found per analysis" />
          <StatCard n="30 min" label="Average time to first deliverable" />
          <StatCard n="4–7×" label="Typical preparation premium on enterprise value" />
        </div>
      </DealStep>

      {/* Interactive add-back estimator */}
      <DealStep
        n={3}
        id="s3"
        idx="Estimator"
        title="How much value is hiding in your financials?"
        lede={<>A quick estimate based on industry patterns. Yulia\'s real analysis is specific to your numbers.</>}
      >
        <InteractiveTool
          kicker="Add-back estimator"
          sub="Pick three things. See your hidden value range instantly."
        >
          <AddBackEstimator />
        </InteractiveTool>
      </DealStep>

      {/* Add-backs Acme walkthrough */}
      <DealStep
        n={4}
        id="s4"
        idx="Worked example · Acme HVAC"
        title="The money hiding in your tax returns."
        lede={<>Reported EBITDA and real EBITDA are almost never the same number. Your accountant minimizes taxes. A buyer maximizes the price they\'ll justify to their lender. The gap is almost always larger than you think.</>}
      >
        <DealBench
          title="Add-back schedule · Acme HVAC"
          meta="YULIA · LIVE"
          metaLive
          bodyStyle={{ padding: '0 22px 22px' }}
        >
          <Row title="Owner comp above market"      sub="$165K paid · $143K benchmark (BLS MSA)"       amt="+$22,000" />
          <Row title="Personal vehicles on books"    sub="2 F-150s · fuel, maintenance, insurance"       amt="+$14,000" />
          <Row title="Spouse on payroll"              sub="Replaceable at market rate"                    amt="+$11,000" />
          <Row title="Blind Equity™ total"           sub="Adds ~0.35× to multiple on upper band"          amt="+$47K" highlight />
        </DealBench>
      </DealStep>

      {/* Readiness */}
      <DealStep
        n={5}
        id="s5"
        idx="Readiness"
        title="Your business, scored through a buyer's lens."
        lede={<>Seventeen dimensions. Revenue quality, margins, concentration, owner dependency, financial integrity. The same checklist every PE associate runs — automated and consistent.</>}
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

      {/* CIM */}
      <DealStep
        n={6}
        id="s6"
        idx="CIM"
        title="Your business deserves better than a data dump."
        lede={<>Most CIMs are data dumps. Yulia's is a strategic narrative. 25–40 pages. Your business positioned not as a business to buy, but as a platform to scale. The same company, described two ways, can trade at <strong>4.5× or 7×</strong>. The difference is rarely the business.</>}
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

      {/* IOI comparison */}
      <DealStep
        n={7}
        id="s7"
        idx="Competitive process"
        title="One buyer gives you a price. Five give you a market."
        lede={<>Yulia identifies the buyer universe, sequences outreach, and stacks IOIs against each other. The winning bid in a competitive process is typically <strong>15–30% above</strong> the first offer. On a $50M transaction that\'s $7.5M–$15M more — from running a process instead of accepting a number.</>}
      >
        <DealBench
          title="IOI comparison · round 1"
          meta="3 OF 11 BUYERS · 2 WEEKS IN"
          bodyStyle={{ padding: 0 }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: 22 }}>
            <IoiCard label="Family office" price="$2.4M" terms="100% cash · 60-day close · no earnout" />
            <IoiCard label="Strategic"     price="$2.9M" terms="85% cash · 15% rollover · synergy case strong" featured />
            <IoiCard label="PE roll-up"    price="$2.7M" terms="$400K earnout · 90-day diligence" />
          </div>
          <div style={{
            padding: '14px 22px', background: '#FAFAFB',
            borderTop: '0.5px solid rgba(0,0,0,0.06)',
            fontSize: 12.5, color: '#3A3A3E', lineHeight: 1.55,
          }}>
            <strong style={{ color: '#0A0A0B' }}>Yulia's take:</strong> Strategic wins on headline and certainty. After-tax, all three within $180K — but the rollover creates a second-bite in 3–5 years.
          </div>
        </DealBench>
      </DealStep>

      {/* Exit paths */}
      <DealStep
        n={8}
        id="s8"
        idx="Exit paths"
        title="Selling 100% isn't your only option."
        lede={<>Yulia models every exit structure against your specific numbers. After-tax proceeds, retained ownership, ongoing cash flow, control implications. Side by side. Same financials. Different outcomes.</>}
      >
        <div style={{
          marginTop: 18,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
        }}>
          {EXIT_PATHS.map((p) => <ExitPathCard key={p.n} p={p} />)}
        </div>
      </DealStep>

      <DealBottom
        heading="Tell Yulia about your business."
        sub="The first conversation is free. The first deliverable is free. Start when you're ready."
        placeholder="Industry, revenue, what you're thinking…"
        onSend={onSend}
      />
    </JourneyShell>
  );
}

function AddBackEstimator() {
  const [rev, setRev] = useState('');
  const [ind, setInd] = useState('');
  const [owner, setOwner] = useState('');
  const est = useMemo(() => estimateHiddenValue(rev, ind, owner), [rev, ind, owner]);
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
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 14,
      }}>
        <SelectBlock label="Annual revenue"  options={REVENUE_OPTIONS} value={rev} onChange={setRev} />
        <SelectBlock label="Industry"        options={INDUSTRY_OPTIONS} value={ind} onChange={setInd} />
        <SelectBlock label="Owner involvement" options={OWNER_OPTIONS} value={owner} onChange={setOwner} />
      </div>
      <div style={{
        marginTop: 18,
        padding: 20,
        background: est ? '#0A0A0B' : '#FAFAFB',
        color: est ? '#fff' : '#6B6B70',
        borderRadius: 12,
        minHeight: 110,
      }}>
        {est ? (
          <>
            <div style={{
              fontFamily: 'JetBrains Mono, ui-monospace, monospace',
              fontSize: 9.5,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              opacity: 0.6,
            }}>Estimated hidden value</div>
            <div style={{
              fontFamily: 'Sora, sans-serif',
              fontWeight: 800,
              fontSize: 36,
              letterSpacing: '-0.03em',
              marginTop: 6,
            }}>${est.low.toFixed(2)}M – ${est.high.toFixed(2)}M</div>
            <div style={{ fontSize: 12.5, opacity: 0.8, marginTop: 6 }}>
              At a typical 5–6× multiple, that's <strong>${(est.low * 5.5).toFixed(1)}M – ${(est.high * 5.5).toFixed(1)}M</strong> in enterprise value.
            </div>
            <div style={{ fontSize: 11, opacity: 0.6, marginTop: 10 }}>
              Industry-pattern estimates only. The real number is in your specific financials.
            </div>
          </>
        ) : (
          <div style={{ fontSize: 13, fontStyle: 'italic' }}>Pick all three inputs to see the estimate.</div>
        )}
      </div>
    </div>
  );
}

function SelectBlock({ label, options, value, onChange }: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
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
      <div style={{ display: 'grid', gap: 5 }}>
        {options.map((o) => {
          const active = value === o;
          return (
            <button
              key={o}
              type="button"
              onClick={() => onChange(o)}
              style={{
                padding: '8px 12px',
                textAlign: 'left',
                background: active ? '#0A0A0B' : '#FAFAFB',
                color: active ? '#fff' : '#1A1C1E',
                border: 'none',
                borderRadius: 8,
                fontFamily: 'Sora, sans-serif',
                fontWeight: 600,
                fontSize: 12.5,
                cursor: 'pointer',
                transition: 'background 150ms',
              }}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ExitPathCard({ p }: { p: ExitPath }) {
  return (
    <div style={{
      background: '#fff',
      border: '0.5px solid rgba(0,0,0,0.08)',
      borderRadius: 12,
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize: 10,
        letterSpacing: '0.14em',
        color: '#9A9A9F',
        textTransform: 'uppercase',
      }}>{p.n}</div>
      <div style={{
        fontFamily: 'Sora, sans-serif',
        fontWeight: 700,
        fontSize: 15,
        letterSpacing: '-0.015em',
        color: '#0A0A0B',
      }}>{p.title}</div>
      <div style={{ fontSize: 12.5, lineHeight: 1.5, color: '#3A3A3E' }}>{p.body}</div>
      {p.typical && (
        <div style={{
          marginTop: 'auto',
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          fontSize: 10,
          letterSpacing: '0.1em',
          color: '#6B6B70',
          textTransform: 'uppercase',
          paddingTop: 8,
          borderTop: '0.5px solid rgba(0,0,0,0.06)',
        }}>Typical · {p.typical}</div>
      )}
    </div>
  );
}

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
      {[94, 88, 62, 70].map((w, i) => (
        <div key={i} style={{ height: 4, width: `${w}%`, background: '#E8E8EB', borderRadius: 2, marginBottom: 6 }} />
      ))}
      {kpis && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${kpis.length}, 1fr)`, gap: 8, marginTop: 14 }}>
          {kpis.map((k) => (
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
