/**
 * Glass Grok v2 · HowItWorks.tsx
 *
 * 5 sections: scope line → IB comparison table → 22 formulas →
 * ChatGPT harness → sample conversation. Copy merged from
 * SITE_COPY.md (April 2026) with current IB comparison table +
 * transcript format preserved.
 */
import { useState } from 'react';
import {
  DealStep, DealBench, DealBottom,
  PullQuote, StatBreaker,
  type DealTab,
} from '../deal-room';
import JourneyShell from '../shell/JourneyShell';

interface Props {
  active: DealTab;
  onSend: (text: string) => void;
  onStartFree: () => void;
  onNavigate: (d: DealTab) => void;
  onSignIn?: () => void;
}

const CHIPS = [
  'What doesn\'t Yulia do?',
  'How accurate?',
  'Show me the math',
  'Is this just ChatGPT?',
] as const;

const DOES: readonly string[] = [
  'Generate documents — valuations, CIMs, financial models, DD checklists, LOIs, pitch decks, LP updates',
  'Draft communications for you to send (outreach, counter-offers, DD follow-ups, attorney briefs)',
  'Score and rank offers against objective criteria',
  'Drive the timeline with proactive nudges and status tracking',
  'Coordinate due diligence — checklist generation, item tracking, red-flag identification',
  'Model scenarios — base/bull/bear, sensitivity, capital stacks',
  'Present market data with sources cited',
  'Handle the math — 22 deterministic formulas, not AI estimates',
];

const DOESNT: readonly string[] = [
  'Recommend what you should do (presents options with trade-offs)',
  'Negotiate on your behalf (never contacts counterparties)',
  'Provide legal, tax, or appraisal advice (refers you to licensed professionals)',
  'Represent either side (not your agent, not your fiduciary)',
  'Hold, transfer, or escrow funds',
  'Guarantee outcomes, prices, or timelines',
  'Charge success fees or take-rates',
  "Replace your advisor's judgment",
];

const IB_ROWS: readonly [string, string, string][] = [
  ['Preliminary valuation range',          '1 week',             '20 minutes'],
  ['Seller readiness assessment',          '2–3 weeks',          '15 minutes'],
  ['Full Quality of Earnings',             '3–6 weeks',          'refers to specialist'],
  ['Add-back analysis (pre-LOI)',          '1–2 weeks',          '15 minutes'],
  ['Comparative transaction analysis',     '3 days',             '8 minutes'],
  ['Confidential Info Memorandum',         '3–4 weeks',          '30 minutes'],
  ['Blind teaser',                         '3 days',             '10 minutes'],
  ['Buyer universe mapping',               '2 weeks',            '20 minutes'],
  ['Outreach strategy + sequencing',       '1 week',             '15 minutes'],
  ['Data room setup + management',         '1–2 weeks',          '5 minutes'],
  ['IOI analysis + comparison',            '2 days / IOI',       '5 minutes / IOI'],
  ['LOI counter-drafting',                 '1 week',             '4 minutes'],
  ['Working capital peg',                  '3–5 days',           '3 minutes'],
  ['Due diligence coordination',           '8–12 weeks',         'automated + oversight'],
  ['Total human touch points',             '200–400 hours',      'Your judgment only'],
];

type FormulaGroup = { title: string; count: number; formulas: string[] };
const FORMULAS: readonly FormulaGroup[] = [
  { title: 'Valuation',    count: 7, formulas: ['SDE calculation', 'EBITDA normalization', 'Comparable transaction multiple', 'Asset-based floor', 'DCF valuation', 'Sensitivity analysis', 'Quality score adjustment'] },
  { title: 'Financing',    count: 5, formulas: ['Capital stack optimization', 'DSCR calculation', 'SBA SOP 50 10 8 compliance', 'Personal-guarantee stress test', 'IRR/MOIC modeling'] },
  { title: 'Deal scoring', count: 4, formulas: ['7-dimension Rundown', 'Concentration risk', 'Dependency scoring', 'Financial integrity check'] },
  { title: 'Structure',    count: 3, formulas: ['Working capital peg', 'Earnout NPV', 'Reps & warranties exposure'] },
  { title: 'Post-close',   count: 3, formulas: ['Value-creation tracking', 'Variance analysis', 'Thesis confirmation'] },
];

type ConvoTurn = { who: 'y' | 'u'; text: React.ReactNode };
const CONVO: readonly ConvoTurn[] = [
  { who: 'u', text: "Looking at Acme, Inc. in Phoenix. Multi-discipline distribution. $65M revenue, $9.2M reported EBITDA. Owner asking $95M." },
  { who: 'y', text: <>Upper MM multi-discipline distribution in the SW — I know the comps well. At $9.2M reported EBITDA, straight 7.5× gets you to <strong>$69M</strong>. Asking $95M implies 10.3× — that\'s above the top of the SW distribution band.</> },
  { who: 'y', text: <>Before deciding, three things to check: <strong>add-back defensibility</strong> (reported vs. normalized is typically 15–25% gap in founder-run distributors), <strong>discipline mix</strong> (diversification premium on 3+ verticals), and <strong>owner role</strong> (2nd-gen signing every invoice over $50K kills the multiple). What's the revenue split?</> },
  { who: 'u', text: "Industrial MRO 38%, hospitality 24%, healthcare 19%, construction 19%. Owner is 58, handles top-10 customer relationships." },
  { who: 'y', text: <>Four disciplines with no one over 40% — that\'s a real <strong>diversification premium</strong>. Hospitality softens, healthcare picks up. Worth 0.5–0.75× on the multiple. But top-10 on the owner\'s handshake is a <strong>concentration + key-person risk stacked</strong> — that's 0.5–1.0× down.</> },
  { who: 'y', text: <>If their add-backs defend to <strong>$11M normalized EBITDA</strong> (industry-typical), and they formalize top-10 contracts with a sales VP before LOI, 7.5× × $11M = <strong>$82.5M</strong> is defensible. If not, you\'re at 6.5× × $9.2M = <strong>$60M</strong>. That\'s the $22M spread.</> },
  { who: 'y', text: <>Asking $95M isn\'t aggressive negotiation — it\'s pricing the best-case multiple on the unnormalized number. Want me to run the full Rundown and draft a <strong>counter at $82M contingent on QoE and concentration fix</strong>?</> },
];

export default function HowItWorks({ active, onSend, onStartFree, onNavigate, onSignIn }: Props) {
  return (
    <JourneyShell
      active={active}
      onNavigate={onNavigate}
      onSignIn={onSignIn}
      onStartFree={onStartFree}
      chat={{
        title: 'Yulia',
        status: 'Ask me anything',
        script: {},
        opening: "Hi — I'm <strong>Yulia</strong>. This page explains what I actually do, where my math comes from, and what I won't do. Ask anything specific.",
        reply: 'Try a concrete question — "<em>what\'s my add-back range for a $4M plumbing shop?</em>" works better than "how does it work?"',
        chips: CHIPS,
        onSend,
      }}
    >
      {/* Hero */}
      <DealStep
        n={1}
        id="s1"
        idx="How it works"
        scale="hero"
        title={<>90% of what an investment bank does. Everything that doesn&apos;t require a license.</>}
        lede={<>Yulia handles the production work — valuations, CIMs, financial models, deal scoring, due diligence, LOIs, integration plans. You keep the judgment, the relationships, and the authority to sign.</>}
      />

      {/* Scope columns */}
      <DealStep
        n={2}
        id="s2"
        idx="The line"
        title="What Yulia does. What Yulia doesn't."
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginTop: 18,
        }}>
          <ScopeCol heading="Yulia does" items={DOES} tone="green" />
          <ScopeCol heading="Yulia doesn't" items={DOESNT} tone="muted" />
        </div>
        <div style={{
          marginTop: 18,
          padding: '16px 20px',
          background: '#FAFAFB',
          borderRadius: 12,
          borderLeft: '3px solid #0A0A0B',
          fontSize: 13,
          lineHeight: 1.55,
          color: '#3A3A3E',
        }}>
          Every drafted communication ends with <em>"Review and send when ready — adjust the tone and details to match your style."</em> You sign every document. You make every call. Yulia does the work that leads up to the decision.
        </div>
      </DealStep>

      {/* IB comparison */}
      <DealStep
        n={3}
        id="s3"
        idx="The IB stack"
        title="What an investment bank delivers on a $30M sell-side engagement."
        lede={<>Yulia produces all of it. The 10% she doesn't do is where your expertise lives.</>}
      >
        <DealBench title="Deliverable timelines" meta="IB vs YULIA">
          <div style={{ padding: 22 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead>
                <tr style={{
                  fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                  fontSize: 9.5,
                  letterSpacing: '0.1em',
                  color: '#9A9A9F',
                  textTransform: 'uppercase',
                }}>
                  <th style={{ textAlign: 'left', padding: '8px 10px', fontWeight: 600 }}>Deliverable</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px', fontWeight: 600 }}>IB timeline</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px', fontWeight: 600 }}>Yulia</th>
                </tr>
              </thead>
              <tbody>
                {IB_ROWS.map(([d, t, y], i) => (
                  <tr key={d} style={{
                    borderTop: '0.5px solid rgba(0,0,0,0.06)',
                    background: i === IB_ROWS.length - 1 ? '#FAFAFB' : undefined,
                    fontWeight: i === IB_ROWS.length - 1 ? 700 : undefined,
                  }}>
                    <td style={{ padding: '11px 10px', fontWeight: 600 }}>{d}</td>
                    <td style={{ textAlign: 'right', padding: '11px 10px', fontVariantNumeric: 'tabular-nums', color: '#6B6B70' }}>{t}</td>
                    <td style={{ textAlign: 'right', padding: '11px 10px', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{y}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{
            padding: '14px 22px',
            background: '#0A0A0B',
            color: '#fff',
            fontSize: 12.5,
            lineHeight: 1.55,
          }}>
            A boutique IB charges $150K retainer + 4% success fee. Same deliverables from Yulia: <strong>$199/month</strong>. Not a toy. Institutional quality. The difference isn't what gets produced — it's who produces it and what it costs.
          </div>
        </DealBench>
      </DealStep>

      <PullQuote attribution="The distinction that matters">
        Large language models hallucinate arithmetic. That&apos;s unacceptable in M&A.
      </PullQuote>

      {/* 22 formulas */}
      <DealStep
        n={4}
        id="s4"
        idx="The math"
        scale="major"
        title="22 deterministic formulas. Not AI estimates."
        lede={<>Large language models hallucinate arithmetic. They compute 2+2=5 with confidence. Unacceptable in M&A where every number is audited. Yulia doesn't ask an LLM to calculate your SDE — the numbers come from code. Same output every time. Auditable. Reproducible. Defensible. The LLM handles the narrative. The code handles the math.</>}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 10,
          marginTop: 18,
        }}>
          {FORMULAS.map((g) => <FormulaGroupCard key={g.title} group={g} />)}
        </div>
      </DealStep>

      {/* ChatGPT harness */}
      <DealStep
        n={5}
        id="s5"
        idx="The harness"
        scale="major"
        title="ChatGPT is the engine. smbX is the harness."
        lede={<>A resourceful practitioner with ChatGPT Plus and a weekend can replicate any one of Yulia's capabilities. They can't do twelve. Building the harness that makes capabilities fast, reliable, auditable, team-shareable, and integrated with each other is 2–12 weeks of real engineering per capability. Multiply by twelve: 2+ years of build.</>}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.6fr',
          gap: 12,
          marginTop: 18,
        }}>
          <HarnessCol
            label="ChatGPT alone"
            nodes={['Chat', 'Output']}
            tone="muted"
          />
          <HarnessCol
            label="smbX"
            nodes={['Conversation', 'Deal memory', '22 formulas', 'Document generation', 'Team sharing', 'Audit trail', 'Regulatory guardrails', 'Output']}
            tone="dark"
          />
        </div>
        <div style={{
          marginTop: 14,
          fontSize: 12.5,
          color: '#3A3A3E',
          lineHeight: 1.55,
        }}>
          ChatGPT can do any one of these. smbX does all of them, together, with your deal's context, at a price you don't have to defend.
        </div>
      </DealStep>

      {/* Sample conversation */}
      <DealStep
        n={6}
        id="s6"
        idx="Ninety seconds"
        title="A real first conversation."
        lede={<>Verbatim from a buyer evaluating Acme, Inc. at a $95M asking price. Not a demo. One chat turn to preliminary range, three to defensible counter.</>}
      >
        <DealBench title="Acme, Inc. · asking $95M" meta="VERBATIM">
          <div style={{ padding: 22 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CONVO.map((m, i) => (
                <div
                  key={i}
                  style={{
                    maxWidth: '86%',
                    alignSelf: m.who === 'u' ? 'flex-end' : 'flex-start',
                    background: m.who === 'u' ? '#0A0A0B' : '#F4F4F5',
                    color: m.who === 'u' ? '#fff' : '#1A1C1E',
                    padding: '10px 14px',
                    borderRadius: 12,
                    fontSize: 13,
                    lineHeight: 1.55,
                  }}
                >
                  {m.text}
                </div>
              ))}
            </div>
          </div>
        </DealBench>
      </DealStep>

      <StatBreaker
        value="22"
        label="Deterministic formulas. Same output every time. Auditable. Reproducible. Defensible. No hallucinated arithmetic."
        secondary={{ value: '200–400h', label: 'Typical human touchpoints on a \$30M sell-side engagement. You still sign every document and make every call.' }}
      />

      <DealBottom
        heading="Start a conversation. See for yourself."
        sub="Drop a question, paste a P&L, or describe what you're thinking about. Yulia does the rest."
        placeholder="Ask Yulia anything…"
        onSend={onSend}
      />
    </JourneyShell>
  );
}

function ScopeCol({ heading, items, tone }: { heading: string; items: readonly string[]; tone: 'green' | 'muted' }) {
  const ink = tone === 'green' ? '#22A755' : '#9A9A9F';
  return (
    <div style={{
      background: '#fff',
      border: '0.5px solid rgba(0,0,0,0.08)',
      borderRadius: 14,
      padding: 22,
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize: 10.5,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: ink,
        marginBottom: 12,
      }}>{heading}</div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
        {items.map((it) => (
          <li key={it} style={{
            fontSize: 12.5,
            lineHeight: 1.5,
            paddingLeft: 16,
            position: 'relative',
            color: '#3A3A3E',
          }}>
            <span style={{
              position: 'absolute',
              left: 0,
              top: 7,
              width: 8,
              height: 2,
              background: ink,
              borderRadius: 1,
            }} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FormulaGroupCard({ group }: { group: FormulaGroup }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      style={{
        textAlign: 'left',
        background: open ? '#0A0A0B' : '#fff',
        color: open ? '#fff' : 'inherit',
        border: '0.5px solid ' + (open ? '#0A0A0B' : 'rgba(0,0,0,0.08)'),
        borderRadius: 12,
        padding: 16,
        cursor: 'pointer',
        font: 'inherit',
        transition: 'all 180ms',
      }}
    >
      <div style={{
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize: 9.5,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        opacity: open ? 0.6 : 0.55,
        marginBottom: 8,
      }}>{group.count} formulas</div>
      <div style={{
        fontFamily: 'Sora, sans-serif',
        fontWeight: 700,
        fontSize: 14,
      }}>{group.title}</div>
      {open && (
        <ul style={{
          marginTop: 12,
          padding: 0,
          listStyle: 'none',
          display: 'grid',
          gap: 5,
          fontSize: 11,
          lineHeight: 1.45,
          opacity: 0.88,
        }}>
          {group.formulas.map((f) => <li key={f}>· {f}</li>)}
        </ul>
      )}
    </button>
  );
}

function HarnessCol({ label, nodes, tone }: { label: string; nodes: readonly string[]; tone: 'muted' | 'dark' }) {
  const dark = tone === 'dark';
  return (
    <div style={{
      background: dark ? '#0A0A0B' : '#FAFAFB',
      color: dark ? '#fff' : '#1A1C1E',
      borderRadius: 14,
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize: 9.5,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        opacity: 0.65,
      }}>{label}</div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 6,
      }}>
        {nodes.map((n, i) => (
          <span key={n} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              padding: '4px 9px',
              borderRadius: 999,
              background: dark ? 'rgba(255,255,255,0.1)' : '#fff',
              border: dark ? 'none' : '0.5px solid rgba(0,0,0,0.08)',
              fontSize: 11,
              fontWeight: 600,
              fontFamily: 'Sora, sans-serif',
            }}>{n}</span>
            {i < nodes.length - 1 && <span style={{ opacity: 0.45, fontSize: 11 }}>→</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
