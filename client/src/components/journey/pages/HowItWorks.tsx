/**
 * Glass Grok · /how-it-works
 * ─────────────────────────────────────────────────────────────────────
 * The "explain yourself" page. The Line (what Yulia does/doesn't) →
 * IB comparison table → 22 formulas → harness argument → sample
 * conversation → data sources → CTA.
 *
 * Spec: Glass Grok/SMBX_SITE_COPY.md (page 7)
 */

import { useState } from 'react';
import {
  Page, Section, H2, Body,
  Card, BottomCta, SectionNav,
  type JourneyTab,
} from '../primitives';

interface Props { onSend: (text: string) => void; onStartFree: () => void; onNavigate?: (d: JourneyTab) => void; }

const DOES = [
  'Generate documents (valuations, CIMs, financial models, DD checklists, LOIs, pitch decks, LP updates)',
  'Draft communications for you to send (buyer outreach, counter-offers, DD follow-ups, attorney briefs)',
  'Score and rank offers against objective criteria',
  'Drive the deal timeline with proactive nudges and status tracking',
  'Coordinate due diligence (checklist generation, item tracking, red flag identification)',
  'Model scenarios (base/bull/bear, sensitivity analysis, capital stacks)',
  'Present market data with sources cited',
  'Handle the math (22 deterministic formulas, not AI estimates)',
];
const DOESNT = [
  'Recommend what you should do (presents options with trade-offs)',
  'Negotiate on your behalf (never contacts counterparties)',
  'Provide legal, tax, or appraisal advice (refers you to licensed professionals)',
  'Represent either side (not your agent, not your fiduciary)',
  'Hold, transfer, or escrow funds',
  'Guarantee outcomes, prices, or timelines',
  'Charge success fees or take-rates',
  'Replace your advisor’s judgment',
];

const IB_ROWS = [
  ['Preliminary valuation range',      '1 week',       '20 minutes'],
  ['Seller readiness assessment',      '2–3 weeks', '15 minutes'],
  ['Full Quality of Earnings analysis', '3–6 weeks', 'refers to specialist'],
  ['Add-back analysis (pre-LOI)',      '1–2 weeks', '15 minutes'],
  ['Comparative transaction analysis', '3 days',        '8 minutes'],
  ['Confidential Information Memorandum', '3–4 weeks', '30 minutes'],
  ['Blind teaser',                     '3 days',        '10 minutes'],
  ['Buyer universe mapping',           '2 weeks',       '20 minutes'],
  ['Outreach strategy & sequencing',   '1 week',        '15 minutes'],
  ['NDA management',                   'ongoing',       'automated'],
  ['Data room setup & management',     '1–2 weeks', '5 minutes'],
  ['IOI analysis & comparison',        '2 days / IOI',  '5 minutes / IOI'],
  ['Management presentation prep',     '1 week',        '30 minutes'],
  ['LOI analysis & counter-drafting',  '1 week',        '4 minutes'],
  ['Working capital peg analysis',     '3–5 days', '3 minutes'],
  ['Due diligence coordination',       '8–12 weeks', 'automated + oversight'],
  ['Funds flow & closing coordination', '2–3 weeks', 'checklist automated'],
  ['Total human touch points',         '200–400 hours', 'Your judgment only'],
];

const YOU_ROWS: [string, string][] = [
  ['Negotiate the deal', 'YOU'],
  ['Sit in the management meeting', 'YOU'],
  ['Make the judgment call', 'YOU'],
  ['Manage the relationship', 'YOU'],
  ['Sign the documents', 'YOU'],
];

const FORMULA_GROUPS: { group: string; items: string[] }[] = [
  { group: 'Valuation (7)',    items: ['SDE calculation', 'EBITDA normalization', 'Comparable transaction multiple', 'Asset-based floor', 'DCF valuation', 'Sensitivity analysis', 'Quality score adjustment'] },
  { group: 'Financing (5)',    items: ['Capital stack optimization', 'DSCR calculation', 'SBA SOP 50 10 8 compliance check', 'Personal guarantee stress test', 'IRR/MOIC modeling'] },
  { group: 'Deal scoring (4)', items: ['7-dimension Rundown', 'Concentration risk calculation', 'Dependency scoring', 'Financial integrity check'] },
  { group: 'Structure (3)',    items: ['Working capital peg', 'Earnout NPV', 'Reps & warranties exposure'] },
  { group: 'Post-close (3)',   items: ['Value creation tracking', 'Variance analysis', 'Thesis confirmation'] },
];

const DATA_SOURCES = [
  'U.S. Census Bureau — County Business Patterns',
  'Bureau of Labor Statistics — QCEW',
  'Federal Reserve Economic Data (FRED)',
  'SEC EDGAR — public company comparables',
  'SBA — loan program data',
  'IRS Statistics of Income — effective tax rates',
];

const SECNAV = [
  { id: 'the-line',            label: 'The line' },
  { id: 'ib-comparison',       label: 'IB comparison' },
  { id: 'the-math',            label: 'The math' },
  { id: 'the-harness',         label: 'The harness' },
  { id: 'sample-conversation', label: 'Sample' },
  { id: 'data-sources',        label: 'Sources' },
];

export default function HowItWorks({ onSend, onStartFree, onNavigate }: Props) {
  return (
    <Page active="how-it-works" onNavigate={onNavigate} onStartFree={onStartFree}>
      <SectionNav items={SECNAV} />
      {/* ─── Hero — centered, no peek (explanatory page) ─── */}
      <section
        className="gg-enter"
        style={{
          position: 'relative',
          padding: 'clamp(56px, 8vw, 120px) clamp(20px, 5vw, 72px)',
          maxWidth: 1520, margin: '0 auto', width: '100%',
          textAlign: 'center',
        }}
      >
        <div className="gg-grid-bg" />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 980, margin: '0 auto' }}>
          <div className="gg-eyebrow gg-eyebrow--plain" style={{ marginBottom: 24, justifyContent: 'center' }}>How it works</div>
          <h1 className="gg-h1 gg-h1--journey" style={{ marginBottom: 28 }}>
            <span style={{ display: 'block' }}>90% of what an investment bank does.</span>
            <span style={{ display: 'block' }}>Everything that doesn’t require a license.</span>
          </h1>
          <Body lead style={{ maxWidth: 780, marginLeft: 'auto', marginRight: 'auto' }}>
            Yulia handles the production work of a deal team &mdash; valuations, CIMs, financial models, deal scoring, due diligence, LOIs, integration plans. You keep the judgment, the relationships, and the authority to sign.
          </Body>
        </div>
      </section>

      {/* ─── The line ──────────────────────────────────────────────── */}
      <Section variant="tint" label="The line">
        <H2>What Yulia does. What Yulia doesn’t.</H2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginTop: 28 }}>
          <Card padding={24}>
            <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 11, color: 'var(--gg-band-hi-fg)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
              Yulia does
            </div>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
              {DOES.map((item, i) => (
                <li key={i} style={{ paddingLeft: 18, position: 'relative', fontSize: 14, lineHeight: 1.55, color: 'var(--gg-text-secondary)', marginBottom: 10 }}>
                  <span style={{ position: 'absolute', left: 0, top: 2, color: 'var(--gg-dot-ready)', fontWeight: 800 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>
          <Card padding={24}>
            <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 11, color: 'var(--gg-band-flag-fg)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
              Yulia doesn’t
            </div>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
              {DOESNT.map((item, i) => (
                <li key={i} style={{ paddingLeft: 18, position: 'relative', fontSize: 14, lineHeight: 1.55, color: 'var(--gg-text-secondary)', marginBottom: 10 }}>
                  <span style={{ position: 'absolute', left: 0, top: 2, color: 'var(--gg-dot-flag)', fontWeight: 800 }}>✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <p className="gg-body" style={{ marginTop: 24, maxWidth: 760, fontSize: 14, color: 'var(--gg-text-muted)' }}>
          Every drafted communication ends with: &ldquo;Review and send when ready &mdash; adjust the tone and details to match your style.&rdquo; You sign every document. You make every call. Yulia does the work that leads up to the decision.
        </p>
      </Section>

      {/* ─── IB comparison table ───────────────────────────────────── */}
      <Section label="IB comparison">
        <H2>What an investment bank delivers on a $30M sell-side engagement.</H2>
        <Body lead style={{ marginBottom: 28, maxWidth: 720 }}>
          Yulia produces all of it. The 10% she doesn’t do is where your expertise lives.
        </Body>
        <div style={{ overflowX: 'auto', borderRadius: 'var(--gg-r-card-s)', border: '0.5px solid var(--gg-border)', background: 'var(--gg-bg-card)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--gg-body)', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--gg-bg-subtle)' }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Deliverable</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>IB timeline</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Yulia</th>
              </tr>
            </thead>
            <tbody>
              {IB_ROWS.map(([del, ib, yulia], i) => (
                <tr key={i} style={{ borderTop: '0.5px solid var(--gg-border)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--gg-text-primary)' }}>{del}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--gg-text-muted)' }}>{ib}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--gg-text-primary)' }}>{yulia}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <H2 style={{ marginTop: 48 }}>The 10% Yulia doesn’t do.</H2>
        <div style={{ marginTop: 20, overflowX: 'auto', borderRadius: 'var(--gg-r-card-s)', border: '0.5px solid var(--gg-border)', background: 'var(--gg-bg-card)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--gg-body)', fontSize: 13 }}>
            <tbody>
              {YOU_ROWS.map(([activity, who], i) => (
                <tr key={i} style={{ borderTop: i === 0 ? 'none' : '0.5px solid var(--gg-border)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--gg-text-primary)' }}>{activity}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 14, letterSpacing: '0.1em' }}>{who}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="gg-body" style={{ marginTop: 28, maxWidth: 760 }}>
          A boutique IB charges $150K retainer plus 4% success fee. Same deliverables from Yulia: $199/month. Not a toy. Institutional quality. The difference isn’t what gets produced &mdash; it’s who produces it and what it costs.
        </p>
      </Section>

      {/* ─── The math ──────────────────────────────────────────────── */}
      <Section variant="tint" label="The math">
        <H2>22 deterministic formulas. Not AI estimates.</H2>
        <Body>
          Large language models hallucinate arithmetic. They compute 2+2=5 with confidence. That’s unacceptable in M&amp;A, where every number is audited and every decision has consequences.
        </Body>
        <Body>
          Yulia doesn’t ask an LLM to calculate your SDE. The numbers come from code &mdash; 22 deterministic formulas, same output every time, auditable, reproducible, defensible.
        </Body>
        <Body>The LLM handles the narrative. The code handles the math. You can challenge any number and trace it to the formula.</Body>

        <div style={{ marginTop: 28, display: 'grid', gap: 16 }}>
          {FORMULA_GROUPS.map(g => (
            <FormulaGroupCard key={g.group} group={g.group} items={g.items} />
          ))}
        </div>
      </Section>

      {/* ─── The harness ───────────────────────────────────────────── */}
      <Section label="The harness">
        <H2>ChatGPT is the engine. smbX is the harness.</H2>
        <Body>
          A resourceful practitioner with ChatGPT Plus and a weekend can replicate any one of Yulia’s capabilities. Draft a CIM. Estimate add-backs. Score a deal. Build a capital stack.
        </Body>
        <Body>They can do any one of these. They can’t do twelve.</Body>
        <Body>
          Building the harness that makes these capabilities fast, reliable, auditable, team-shareable, and integrated with each other is 2&ndash;12 weeks of real engineering work per capability. Multiply by twelve capabilities and you’re at 2+ years of build.
        </Body>
        <Body>
          The 80% of shops that don’t have a full-time AI engineer aren’t debating ChatGPT versus smbX. They’re debating &ldquo;do we want to spend 2 years building this ourselves, or pay $199/month.&rdquo;
        </Body>

        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <Card padding={24}>
            <div className="gg-label" style={{ marginBottom: 12 }}>ChatGPT alone</div>
            <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 14, color: 'var(--gg-text-secondary)' }}>
              [Chat] &rarr; [Output]
            </div>
          </Card>
          <Card padding={24} style={{ borderColor: 'var(--gg-text-primary)' }}>
            <div className="gg-label" style={{ marginBottom: 12 }}>smbX</div>
            <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 13, color: 'var(--gg-text-primary)', lineHeight: 1.8 }}>
              [Conversation] &rarr; [Deal memory] &rarr; [22 formulas] &rarr; [Document generation] &rarr; [Team sharing] &rarr; [Audit trail] &rarr; [Regulatory guardrails] &rarr; [Output]
            </div>
          </Card>
        </div>
        <p className="gg-body" style={{ marginTop: 24, maxWidth: 760 }}>
          ChatGPT can do any one of these. smbX does all of them, together, with your deal’s context, at a price you don’t have to defend.
        </p>
      </Section>

      {/* ─── Sample conversation ──────────────────────────────────── */}
      <Section variant="tint" label="Sample conversation">
        <H2>Ninety seconds with Yulia.</H2>
        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 680 }}>
          <ChatBubble role="user" paragraphs={[
            'I’m looking at a pest control company in Phoenix. $1.2M revenue, asking $2.8M. Got the CIM yesterday.',
          ]} />
          <ChatBubble role="yulia" paragraphs={[
            <>Pest control in Phoenix &mdash; a market I know well. At $1.2M revenue, preliminary SDE range is $240K&ndash;$360K depending on owner comp and add-backs. That puts the typical value range at $720K&ndash;$1.26M using industry multiples of 3.0&times;&ndash;3.5&times; SDE.</>,
            <>The asking price of $2.8M is more than 2&times; above that range. Before diving deeper, three specific things to check:</>,
            <>1. Route density &mdash; Phoenix pest control companies with dense route coverage (&gt;25 stops/day) trade at premium multiples. Low density trades at a discount.</>,
            <>2. Service contract mix &mdash; recurring contract revenue gets 4&times;&ndash;5&times; SDE. One-time service revenue gets 2&times;&ndash;2.5&times;.</>,
            <>3. Owner involvement &mdash; does the owner run routes, manage techs, handle customer relationships, or all three?</>,
            <>What’s the revenue breakdown between recurring contracts and one-time services?</>,
          ]} />
          <ChatBubble role="user" paragraphs={[
            'About 70% recurring contracts. Owner manages everyone, does the estimates, and handles the top 10 commercial accounts.',
          ]} />
          <ChatBubble role="yulia" paragraphs={[
            <>That’s helpful. The 70% recurring revenue justifies a premium to straight SDE multiples &mdash; call it 4.2&times;&ndash;4.7&times; for the contract portion and 2.5&times; for the one-time. Blended gets you to roughly $1.1M&ndash;$1.4M valuation.</>,
            <>But the owner involvement is the bigger issue. Running the estimates, managing the team, AND holding the top 10 commercial relationships means three separate transition problems. Each takes 12&ndash;18 months to solve properly.</>,
            <>On a $1.2M deal, that owner dependency risk typically discounts multiples by 0.5&times;&ndash;1.0&times;. Fair value probably closes to $900K&ndash;$1.2M.</>,
            <>Asking $2.8M isn’t an aggressive negotiation position. It’s a different business than the one the fundamentals support.</>,
            <>Want to run the Rundown to get the full scoring? Or should we model what would need to be true for this to make sense at $2.8M?</>,
          ]} />
        </div>
        <p className="gg-body" style={{ marginTop: 24, maxWidth: 680, fontSize: 14, color: 'var(--gg-text-muted)' }}>
          This is one conversation. The real ones run hours or days. Yulia remembers everything. Every number is auditable. Every document is ready when you need it.
        </p>
      </Section>

      {/* ─── Data sources ──────────────────────────────────────────── */}
      <Section label="Data sources">
        <H2>Where Yulia’s data comes from.</H2>
        <Body lead style={{ maxWidth: 720 }}>Public sources, cited every time.</Body>
        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
          {DATA_SOURCES.map(src => (
            <Card key={src} padding={18}>
              <span style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 14, color: 'var(--gg-text-primary)' }}>{src}</span>
            </Card>
          ))}
        </div>
        <Body style={{ marginTop: 24, maxWidth: 760 }}>
          Industry multiples come from closed transaction data, not asking prices. Comparable transactions are filtered by size, geography, and business model &mdash; not by whatever shows up in a Google search.
        </Body>
        <Body><strong style={{ color: 'var(--gg-text-primary)' }}>When Yulia gives you a number, you can trace where it came from.</strong></Body>
      </Section>

      <BottomCta
        heading="Start a conversation. See for yourself."
        subhead="Paste a deal, describe a business, ask a question. One deliverable free, no credit card."
        chatPlaceholder="Ask Yulia anything…"
        onSend={onSend}
      />
    </Page>
  );
}

function FormulaGroupCard({ group, items }: { group: string; items: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Card padding={20}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        style={{
          width: '100%', textAlign: 'left',
          background: 'transparent', border: 0, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 15,
          color: 'var(--gg-text-primary)', padding: 0,
        }}
      >
        {group}
        <span style={{ fontSize: 16, color: 'var(--gg-text-muted)', transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 200ms var(--gg-ease-snap)' }}>+</span>
      </button>
      {open && (
        <ul style={{ margin: '12px 0 0', paddingLeft: 16, fontSize: 14, color: 'var(--gg-text-secondary)', lineHeight: 1.7 }}>
          {items.map(i => <li key={i}>{i}</li>)}
        </ul>
      )}
    </Card>
  );
}

function ChatBubble({ role, paragraphs }: { role: 'user' | 'yulia'; paragraphs: React.ReactNode[] }) {
  const body = paragraphs.map((p, i) => (
    <p key={i} style={{ margin: i === 0 ? 0 : '10px 0 0', padding: 0 }}>{p}</p>
  ));
  if (role === 'user') {
    return (
      <div style={{ alignSelf: 'flex-end', maxWidth: '80%', background: 'var(--gg-bg-muted)', border: '0.5px solid var(--gg-border)', padding: '12px 16px', borderRadius: '16px 16px 4px 16px', fontSize: 14, lineHeight: 1.6 }}>
        {body}
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', gap: 12, maxWidth: '92%' }}>
      <div className="gg-yulia" style={{ width: 32, height: 32, borderRadius: 10, fontSize: 13, flexShrink: 0 }}>Y</div>
      <div style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--gg-text-secondary)' }}>{body}</div>
    </div>
  );
}
