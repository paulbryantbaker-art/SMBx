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
  PullQuote, StatBreaker,
  type DealTab, type DealStepScript,
} from '../deal-room';
import JourneyShell from '../shell/JourneyShell';
import InteractiveTool from '../shell/InteractiveTool';
import { ACME, ACME_ADDBACKS, ACME_READINESS } from '../acme';

interface Props {
  active: DealTab;
  onSend: (text: string) => void;
  onStartFree: () => void;
  onNavigate: (d: DealTab) => void;
  onSignIn?: () => void;
}

const CHIPS = ['What\'s Acme worth?', 'Find my add-backs', 'Am I ready to sell?', 'Sell or raise?'] as const;

/* 5-min Acme walkthrough: Ray Whitaker Jr. exploring exit of the
   Phoenix distribution business his dad founded in 1987. Scripts
   play as each DealStep enters the viewport. */
const SCRIPT: DealStepScript = {
  3: [
    { who: 'y',  text: `Let's walk through <strong>${ACME.name}</strong>. Ray Whitaker Jr., 58, 2nd-gen owner. $65M revenue distributor, Phoenix HQ with AZ/NM/TX/NV footprint. Dad founded it in 1987.` },
    { who: 'y',  text: `Reported EBITDA is <strong>$9.2M</strong>. That's what their CPA files. But reported and real aren't the same number — I pulled three years of tax returns and found <strong>$1.8M</strong> of defensible add-backs.` },
    { who: 'me', text: 'What moved the needle?' },
    { who: 'y',  text: `Two big ones. Ray's Phoenix HQ is leased from a family trust at <strong>$420K above market</strong>. And a discontinued Nevada branch — $640K of overhead still sitting in the reported run-rate after Q3 2024 shutdown.` },
    { who: 'y',  text: `Add Ray's compensation above market ($155K), two siblings on payroll ($180K), one-time legal ($310K), discretionary travel ($95K) — normalized EBITDA is <strong>$11.0M</strong>.` },
    { who: 'y',  text: `That's <strong>20% more earnings</strong> than the CPA reports — every dollar IRS-documented. At 7.5× that's <strong>$13.5M</strong> of enterprise value sitting in the financials nobody surfaced.` },
  ],
  4: [
    { who: 'y',  text: `Now Acme through a buyer's lens — 17 dimensions scored. Total <strong>74/100</strong>. Strong on financial integrity (9.1), revenue quality (8.6), scalability (8.0).` },
    { who: 'y',  text: `Two yellow flags: <strong>owner dependency (5.4)</strong> — Ray still signs every invoice over $50K. And <strong>concentration (6.0)</strong> — top 10 accounts are 35% of revenue, most on handshake with Marco Delgado, VP Sales, 22 years in.` },
    { who: 'me', text: 'Fixable before we go to market?' },
    { who: 'y',  text: `Yes. I built the playbook: promote Nina Arellano (COO, 14yr) into a COO-plus role with signing authority up to $250K. Formalize top-10 contracts with Marco as relationship owner — gets the multiple 0.5–0.75× higher on pack. Earns back $5–8M EV over 12 months.` },
  ],
  5: [
    { who: 'y',  text: `Drafting Acme's CIM. 32 pages. Positioning isn't "distributor for sale" — it's <strong>"the SW anchor asset for a national multi-discipline platform."</strong>` },
    { who: 'y',  text: `Same diligence pack, two narratives. "Distributor for sale" trades at 6× × $11M = <strong>$66M</strong>. "SW anchor for national consolidation" trades at 8× × $11M = <strong>$88M</strong>.` },
    { who: 'y',  text: `That's a <strong>$22M spread on identical financials</strong>. The four disciplines (industrial MRO 38%, hospitality 24%, healthcare 19%, construction 19%) are the moat — hospitality softens, healthcare picks up. I A/B tested the opening paragraph against 12 simulated buyer reads. The anchor narrative wins every time.` },
    { who: 'me', text: 'Show me page one.' },
    { who: 'y',  text: `Executive summary pulled up on your canvas now. Revenue $65M, Adj EBITDA $11M, 17% margin — but the first sentence is about the <strong>38-year Phoenix-anchored multi-discipline platform</strong>, not the age of the business. Ray reads it. Nods. "That's what I built."` },
  ],
  6: [
    { who: 'y',  text: `Teaser went to 18 buyers — strategic distributors, PE roll-ups, family offices. <strong>4 IOIs back</strong> inside 21 days.` },
    { who: 'y',  text: `Strategic (HVAC+ Distribution, Dallas-based) leading at <strong>$91M · 80% cash · 20% rollover · 45-day exclusivity</strong>. PE roll-up at $86M, 55% cash, $4M earnout. Family office $82M all-cash, 30-day close. Competing offer at $77M — I told them we'd pass politely.` },
    { who: 'y',  text: `After-tax, all three close within <strong>$4M on headline</strong>. But the strategic's 20% rollover at their exit multiple in 3–5 years models to <strong>$14–18M second bite</strong>. Total haul: $107M vs. $82M all-cash today.` },
    { who: 'me', text: "What's your call?" },
    { who: 'y',  text: `Strategic. Your concentration risk unwinds faster inside their platform (they have a fleet-vehicle category you don't have). Rollover aligns them through year 3 — exactly when Marco's top-10 contracts formalize. And the buyer diligence is the cleanest of the four.` },
    { who: 'y',  text: `Ray texted at 11:47pm Thursday: <strong>"run the strategic."</strong> LOI draft is in your docket. 18 hours from first IOI to his decision.` },
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
        status: `Working on ${ACME.name}`,
        script: SCRIPT,
        opening: `Hi — I'm <strong>Yulia</strong>. I'm going to walk you through a real sell-side deal: <strong>${ACME.name}</strong>, a $65M multi-discipline distributor in the Southwest. Owner's 58, considering exit. Scroll to watch the whole process — valuation through IOI comparison.`,
        reply: 'Three things and I\'ll build your real analysis: <strong>industry</strong>, <strong>revenue</strong>, <strong>reported EBITDA</strong>. First deliverable inside 30 minutes. No credit card.',
        chips: CHIPS,
        onSend,
      }}
    >
      {/* Hero */}
      <DealStep
        n={1}
        id="s1"
        idx="Sell-side · walkthrough"
        scale="hero"
        title={<>Know what you have. Before anyone else does.</>}
        lede={<>Yulia finds the value hiding in your financials, builds the documents that sell your business, and manages the process that gets you to the closing table. From first conversation to wire transfer.</>}
      />

      <StatBreaker
        value="75%"
        label="of owners who sell their business regret it within a year — the #1 reason is leaving money on the table they never knew was there."
        source="Exit Planning Institute · 2024 survey"
        secondary={{ value: '$1.1M', label: 'Average hidden value Yulia finds in pre-LOI analysis.' }}
      />

      {/* Interactive add-back estimator — merged with the old Problem section */}
      <DealStep
        n={2}
        id="s2"
        idx="Estimator"
        scale="major"
        title={<>How much value is hiding in your financials?</>}
        lede={<>Reported EBITDA and real EBITDA are almost never the same number. Your accountant minimizes taxes. A buyer maximizes the price they\'ll justify to a lender. The gap is larger than you think — pick three things and I\'ll estimate it for you.</>}
      >
        <InteractiveTool
          kicker="Add-back estimator"
          sub="Pick three things. See your hidden value range instantly."
          tag="3 inputs · 3 sec"
        >
          <AddBackEstimator />
        </InteractiveTool>
      </DealStep>

      {/* Add-backs — Acme, Inc. walkthrough */}
      <DealStep
        n={3}
        id="s3"
        idx={`Worked example · ${ACME.name}`}
        title="The money hiding in your tax returns."
        lede={<>Reported EBITDA and real EBITDA are almost never the same number. For Acme — $65M revenue distributor, Phoenix-headquartered — the gap is <strong>{ACME.addBacksLabel} of defensible add-backs</strong>. At 7.5× that\'s $13.5M of enterprise value sitting in the financials the CPA never surfaces.</>}
      >
        <DealBench
          title={`Add-back schedule · ${ACME.name}`}
          meta="YULIA · LIVE"
          metaLive
          bodyStyle={{ padding: '0 22px 22px' }}
        >
          {ACME_ADDBACKS.map((a, i) => (
            <Row
              key={a.title}
              title={a.title}
              sub={a.sub}
              amt={a.amt}
              highlight={i === ACME_ADDBACKS.length - 1}
            />
          ))}
        </DealBench>
      </DealStep>

      {/* Readiness */}
      <DealStep
        n={4}
        id="s4"
        idx="Readiness"
        title="Your business, scored through a buyer's lens."
        lede={<>Seventeen dimensions. The same checklist every PE associate runs — automated and consistent. Acme comes in at <strong>74/100</strong>: strong on financial integrity and revenue quality, two fixable yellows on owner dependency and concentration.</>}
      >
        <DealBench
          title={`Readiness score · ${ACME.name}`}
          meta="6 MIN AGO"
          metaLive
          bodyStyle={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 32, alignItems: 'center' }}
        >
          <ScoreDonut score={74} />
          <DimList dims={ACME_READINESS} />
        </DealBench>
      </DealStep>

      <PullQuote attribution="Same diligence pack. Two narratives.">
        Same company, described two ways, trades at 6× or 8×.
      </PullQuote>

      {/* CIM */}
      <DealStep
        n={5}
        id="s5"
        idx="CIM"
        scale="major"
        title="Your business deserves better than a data dump."
        lede={<>Most CIMs are data dumps. Yulia's is a strategic narrative. 25–40 pages. Your business positioned not as a business to buy, but as a platform to scale. The same company, described two ways, can trade at <strong>4.5× or 7×</strong>. The difference is rarely the business.</>}
      >
        <DealBench
          title="CIM preview · Project Mesa"
          meta="32 PAGES · CONFIDENTIAL"
          bodyStyle={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, background: '#FAFAFB', padding: 22 }}
        >
          <CimPage
            idx="01 · Executive summary"
            title="A 38-year multi-discipline SW distribution platform, positioned as the anchor asset for national consolidation."
            kpis={[
              { label: 'Revenue',    value: ACME.revenueLabel },
              { label: 'Adj EBITDA', value: ACME.normalizedEbitdaLabel },
              { label: 'Margin',     value: ACME.normalizedMarginLabel },
            ]}
          />
          <CimPage
            idx="07 · Growth levers"
            title="Three levers to take normalized EBITDA from $11M to $17M within 36 months."
          />
        </DealBench>
      </DealStep>

      {/* IOI comparison */}
      <DealStep
        n={6}
        id="s6"
        idx="Competitive process"
        title="One buyer gives you a price. Five give you a market."
        lede={<>Yulia identifies the buyer universe, sequences outreach, and stacks IOIs against each other. The winning bid in a competitive process is typically <strong>15–30% above</strong> the first offer. On a $50M transaction that\'s $7.5M–$15M more — from running a process instead of accepting a number.</>}
      >
        <DealBench
          title="IOI comparison · Project Mesa"
          meta="4 OF 18 BUYERS · 3 WEEKS IN"
          bodyStyle={{ padding: 0 }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: 22 }}>
            <IoiCard label="Family office"        price="$82M" terms="100% cash · 45-day close · no earnout" />
            <IoiCard label="Strategic distributor" price="$91M" terms="80% cash · 20% rollover · synergy case strong" featured />
            <IoiCard label="PE roll-up"           price="$86M" terms="55% cash · $4M earnout · 75-day diligence" />
          </div>
          <div style={{
            padding: '14px 22px', background: '#FAFAFB',
            borderTop: '0.5px solid rgba(0,0,0,0.06)',
            fontSize: 12.5, color: '#3A3A3E', lineHeight: 1.55,
          }}>
            <strong style={{ color: '#0A0A0B' }}>Yulia's take:</strong> Strategic wins headline + certainty. After-tax all three within $4M. The 20% rollover at strategic\'s exit multiple in 3–5 years is another $14–18M — that\'s the second bite. Ray\'s call on timing vs. certainty.
          </div>
        </DealBench>
      </DealStep>

      {/* Exit paths */}
      <DealStep
        n={7}
        id="s7"
        idx="Exit paths"
        scale="major"
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
