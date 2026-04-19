/**
 * Glass Grok v2 · HowItWorks.tsx — explainer page.
 * 4 sections: operators → IB stack table → formulas → sample conversation.
 * No scripted Yulia arc; rail is "ask anything."
 * Port of new_journey/project/how-it-works.html.
 */
import {
  DealRoomPage, DealStep, DealBench, DealBottom,
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
  { id: 's1', label: 'What Yulia does' },
  { id: 's2', label: 'IB stack' },
  { id: 's3', label: 'The math' },
  { id: 's4', label: 'Sample' },
] as const;

const CHIPS = [
  'Who’s behind Yulia?',
  'How accurate?',
  'Data sources?',
  'IB stack?',
] as const;

const OPERATORS = [
  { n: '01 · Valuation',     name: 'Yulia',  body: 'Parses tax returns + QBs, surfaces add-backs, benchmarks multiples against 14K private-market comps. Output: valuation range + Blind Equity™ memo.' },
  { n: '02 · CIM',           name: 'Marcus', body: 'Writes the confidential information memorandum. 28–42 pages, positioning variants A/B tested against buyer psychology.' },
  { n: '03 · Outreach',      name: 'Priya',  body: 'Builds the buyer universe, sequences outreach, tracks IOIs. Runs the process like a partner at a boutique would.' },
  { n: '04 · Diligence',     name: 'Wei',    body: 'QoE, customer cohort, WC peg, backlog, environmental — 42 workstreams in parallel. A $60K Big-4 pack in 6 days.' },
  { n: '05 · Deal structure', name: 'Arjun', body: 'Models cash/earnout, escrow, rollover, seller note, WC peg. After-tax NPV for both sides. LOI and APA drafts.' },
  { n: '06 · Integration',   name: 'Lena',   body: 'Day-0 checklist, 180-day plan, key-person retention, weekly thesis scorecard. First Monday through first annual.' },
] as const;

const IB_ROWS: readonly [string, string, string, string][] = [
  ['Valuation',       'Builds DCF + comps · 2wk',             'Parses financials + 14K comp private-market database · 20min', '±4.2% vs banker'],
  ['Add-backs',       'Reviews P&L with team · 1wk',          'Line-by-line against IRS + BLS benchmarks',                   '+11% recovery vs median'],
  ['CIM',             'Associate drafts · 3–4wk',             'Generated and revised with owner input · 3 days',              '92% buyer-accept first draft'],
  ['Buyer universe',  'Senior banker’s rolodex',              'Filtered cross-reference of 28K active buyers',                '3.2× more IOIs'],
  ['QoE / diligence', '$45–80K · 6–10wk',                     '42 workstreams in parallel · 6 days',                          '98% concordance w/ Big-4'],
  ['LOI / APA',       'Counsel + banker back-and-forth',      'Drafted with you, red-lined by retained counsel',              '46% fewer reopens'],
];

const FORMULA_VALUATION = `EV_low  = (EBITDA_reported + Σ addbacks_defensible) × mult_p25 × quality_adj
EV_high = (EBITDA_reported + Σ addbacks_defensible) × mult_p75 × quality_adj
quality_adj = 0.7 + 0.006 × readiness_score      // 70 = 1.12×`;

const FORMULA_READINESS = `score = Σ (dim_i × weight_i) × 100 / Σ weight_i
dims  = [rev_quality, margin, concentration, owner_dep,
         mgmt_depth, recurring, growth, working_cap, …]`;

const FORMULA_FCCV = `FCCV(Δ) = (EBITDA × (1 + Δ_ebitda) − capex) / (interest × (1 + Δ_rate) + principal)
breach  if FCCV(Δ) < covenant for any (Δ_ebitda ∈ {-25, -15, 0}, Δ_rate ∈ {0, +100bp, +200bp})`;

type ConvoTurn = { who: 'y' | 'u'; text: React.ReactNode };
const CONVO: readonly ConvoTurn[] = [
  { who: 'u', text: 'landscaping co, tx, ~$6M rev, ebitda maybe $1.1M. whats a quick range' },
  { who: 'y', text: <>Need the last two years of tax returns and a P&L. You can drag a PDF into this window. While we wait — is that EBITDA pre or post owner comp?</> },
  { who: 'u', text: 'pre. i pull $180k plus truck plus insurance' },
  { who: 'y', text: <>OK. Market mgr for a $6M landscaping op is ~$135K. Your truck + insurance run ~$22K blended. That’s a <strong>~$67K add-back</strong> right there — so normalized is closer to $1.17M.</> },
  { who: 'u', text: '<uploads pdf>' },
  { who: 'y', text: <>Got it. Clean books. Three more I can defend: spouse on payroll ($18K), personal legal fees ($6K), seller-financed equipment ($11K). Normalized EBITDA <strong>$1.22M</strong>.</> },
  { who: 'y', text: <>At 4.0×–5.5× for TX landscaping with your recurring mix (67%), preliminary range is <strong>$4.9M – $6.7M</strong>. Want the readiness score and the levers that move you to the top of the band?</> },
  { who: 'u', text: 'yes. also what does selling actually look like start to finish' },
  { who: 'y', text: <>Pulling both now. Should I set up an account so this work survives after you close the tab?</> },
];

export default function HowItWorks({ active, onSend, onStartFree, onNavigate, onSignIn }: Props) {
  return (
    <DealRoomPage
      active={active}
      sectionNav={SECTION_NAV}
      onNavigate={onNavigate}
      onSignIn={onSignIn}
      onStartFree={onStartFree}
      rail={{
        name: 'Yulia',
        status: 'Ask me anything',
        script: {},   /* explainer — no scripted arc */
        opening: 'Hi — I’m <strong>Yulia</strong>. This page explains what I actually do and how. Scroll through, or ask me anything in the box.',
        reply: 'Try a specific question — "what’s my add-back range for a $4M plumbing shop?" works better than "how does it work?".',
        chips: CHIPS,
        onSend,
      }}
    >
      {/* Step 01 · Operators */}
      <DealStep
        n={1}
        id="s1"
        idx="What Yulia does"
        title="Yulia is a banker, a diligence team, and an integration manager — in one chat window."
        lede={<>Every feature on smbX maps to a workstream a mid-market bank or boutique would run for a mandate — we’ve just given each one a named operator. You talk to them like you’d talk to an associate. They return artifacts, not summaries.</>}
      >
        <div className="hiw-grid">
          {OPERATORS.map(o => (
            <div key={o.n} className="hiw-card">
              <div className="hiw-card__n">{o.n}</div>
              <div className="hiw-card__t">{o.name}</div>
              <div className="hiw-card__b">{o.body}</div>
            </div>
          ))}
        </div>
      </DealStep>

      {/* Step 02 · IB stack */}
      <DealStep
        n={2}
        id="s2"
        idx="The IB stack"
        title="Every job a sell-side banker does. Stacked against what Yulia does."
        lede={<>We’re not asking you to trust us. We’re asking you to look at the table. For each workstream a sell-side banker charges for, this is what Yulia produces and how we benchmark quality.</>}
      >
        <DealBench title="Banker vs. Yulia" meta="SIX WORKSTREAMS">
          <div style={{ padding: 22 }}>
            <table className="hiw-ib">
              <thead>
                <tr>
                  <th>Workstream</th>
                  <th>What a banker does</th>
                  <th>What Yulia does</th>
                  <th style={{ textAlign: 'right' }}>Benchmark</th>
                </tr>
              </thead>
              <tbody>
                {IB_ROWS.map(([ws, banker, yulia, bench]) => (
                  <tr key={ws}>
                    <td style={{ fontWeight: 600 }}>{ws}</td>
                    <td>{banker}</td>
                    <td>{yulia}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{bench}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DealBench>
      </DealStep>

      {/* Step 03 · Math */}
      <DealStep
        n={3}
        id="s3"
        idx="The math"
        title="How we price, how we score, how we stress-test."
        lede={<>Three formulas power most of what Yulia outputs. They’re not secret. If you want to argue with a number, argue with the math — and Yulia will show you her work.</>}
      >
        <div style={{ display: 'grid', gap: 16, marginTop: 18 }}>
          <FormulaBlock label="Valuation range" sub="Normalized EBITDA × multiple band · adjusted for quality score and macro position." code={FORMULA_VALUATION} />
          <FormulaBlock label="Readiness score" sub="17 dimensions, each 0–10, weighted by what moves multiple in the sector." code={FORMULA_READINESS} />
          <FormulaBlock label="Cap stack stress test" sub="Fixed-charge coverage ratio across a 3×3 grid of EBITDA and rate shocks." code={FORMULA_FCCV} />
        </div>
      </DealStep>

      {/* Step 04 · Sample conversation */}
      <DealStep
        n={4}
        id="s4"
        idx="Sample conversation"
        title="What 20 minutes with Yulia actually looks like."
        lede={<>Verbatim from an owner who wanted a preliminary range on a $6M-revenue landscaping business. Not a demo, not a power user — a first-time seller.</>}
      >
        <DealBench title="Verbatim transcript" meta="~20 MINUTES">
          <div style={{ padding: 22 }}>
            <div className="hiw-convo">
              {CONVO.map((m, i) => (
                <div key={i} className={`hiw-msg hiw-msg--${m.who}`}>{m.text}</div>
              ))}
            </div>
          </div>
        </DealBench>
      </DealStep>

      <DealBottom
        heading="Still reading? Start a real conversation instead."
        sub="Drop a question, paste a P&L, or just describe what you’re thinking about. Yulia does the rest."
        placeholder="Ask Yulia anything — or paste your situation…"
        onSend={onSend}
      />
    </DealRoomPage>
  );
}

function FormulaBlock({ label, sub, code }: { label: string; sub: string; code: string }) {
  return (
    <div className="hiw-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '18px 22px' }}>
        <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 12.5, color: '#6B6B70' }}>{sub}</div>
      </div>
      <pre className="hiw-formula" style={{ borderRadius: 0 }}>{code}</pre>
    </div>
  );
}
