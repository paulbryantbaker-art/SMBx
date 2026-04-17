/**
 * MobileHowStory — mobile-native rendering of /how-it-works.
 *
 * Fibonacci layout with LiveClassifier as the primary interactive (same
 * component /how-it-works desktop uses, responsive). Pink accent. Educates
 * skeptics; opens with the interactive demo, then gates + engines compact,
 * then sign-off chain.
 */

import { bridgeToYulia } from '../content/chatBridge';
import usePageMeta from '../../hooks/usePageMeta';
import { LiveClassifier } from '../content/LiveClassifier';
import { MobileJourneyStory, MobileReveal } from './MobileJourneyStory';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

interface Props {
  dark: boolean;
}

export default function MobileHowStory({ dark }: Props) {
  usePageMeta({
    title: 'How Yulia runs a deal · smbx.ai',
    description:
      'Watch the operating system run on a real sentence. Six engines, 22 enforced gates, one audited workflow from first message to close.',
    canonical: 'https://smbx.ai/how-it-works',
    ogImage: 'https://smbx.ai/og-how.png',
    breadcrumbs: [
      { name: 'Home', url: 'https://smbx.ai/' },
      { name: 'How it works', url: 'https://smbx.ai/how-it-works' },
    ],
    faqs: [
      {
        question: 'How is Yulia different from ChatGPT for M&A?',
        answer:
          'ChatGPT generates plausible text. Yulia is the deal operating system — she remembers your deal, routes documents to your attorney with focus areas, holds the LOI in queue until counsel signs off, transmits to the buyer pool from your account, and logs every action in the audit trail.',
      },
      {
        question: 'What is the 22-gate methodology?',
        answer:
          'Each of the 4 journeys (Sell, Buy, Raise, Integrate) has specific gates with completion triggers Yulia verifies from your conversation and data. No valuation until financials are normalized. No LOI until DSCR clears. The gates prevent the mistakes that kill deals.',
      },
      {
        question: 'What are the six engines that run under the hood?',
        answer:
          'Financial Extraction, Market Intelligence, Legal Auditor, Deal Modeling, Cap Table & Waterfall, Document Generator. Each engine is deterministic and leaves an audit trail.',
      },
    ],
  });

  const accent = dark ? PINK_DARK : PINK;
  const headingColor = dark ? '#f9f9fc' : '#0f1012';
  const bodyC = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedC = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const borderC = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const cardBg = dark ? '#1a1c1e' : '#ffffff';
  const headingC = headingColor;

  const engines = [
    { n: '01', title: 'Financial Extraction', claim: 'Pulls exact numbers from tax returns + P&Ls. Never rounds. Cites every source line.' },
    { n: '02', title: 'Market Intelligence',  claim: 'Live comp multiples and recent deal activity. Not training data — current market.' },
    { n: '03', title: 'Legal Auditor',         claim: 'Only cites what\u2019s in your documents. Returns "NOT FOUND" rather than guess.' },
    { n: '04', title: 'Deal Modeling',         claim: 'DSCR, IRR, MOIC, cap-stack, sensitivity. Deterministic math, not AI guesses.' },
    { n: '05', title: 'Cap Table & Waterfall', claim: 'Ownership, dilution, liquidation waterfall across rounds and exit scenarios.' },
    { n: '06', title: 'Document Generator',    claim: 'CIMs, LOIs, IC memos — drafted from verified numbers, routed through sign-off.' },
  ];

  return (
    <MobileJourneyStory
      dark={dark}
      journey="brand"
      eyebrow="How it works"
      headline={
        <>
          <span className="block">Watch Yulia run</span>
          <span className="block">a <em className="not-italic" style={{ color: accent }}>real deal.</em></span>
        </>
      }
      sub={
        <>
          Six engines. 22 enforced gates. One audited workflow from first message to close.
          Pick a preset or type a sentence — the reveal runs in ~4 seconds.
        </>
      }
      callout={
        <>
          <strong style={{ color: accent }}>4 seconds here.</strong>{' '}
          ~90 seconds with your real numbers.
        </>
      }

      primaryInteractiveLabel="Live classifier · try a sentence"
      primaryInteractive={<LiveClassifier dark={dark} accent={accent} />}

      story={{
        name: 'Under the hood',
        role: 'Six engines · 22 gates · one audited workflow',
        body: (
          <>
            Every conversation with Yulia moves through an operating system — not a chatbot wrapper.
            The six engines below run in parallel; the 22 gates prevent the moves that kill deals
            (no valuation before financials are normalized, no LOI until DSCR clears, no outreach
            until the structure passes covenant math). Every action is logged. The buyer's lawyer
            can ask where any number came from three years later — the answer is in the database.
          </>
        ),
        outcome: 'Deterministic math · cited sources · chain of custody',
      }}

      kpis={[
        { value: '6',  label: 'engines running under every conversation' },
        { value: '22', label: 'enforced gates across Sell/Buy/Raise/Integrate' },
        { value: '1',  label: 'audited workflow, first message to close' },
      ]}

      takeaway={<>When the buyer's lawyer asks "where did that number come from?" — the answer is in the database.</>}

      ctaLabel="Run it on my deal"
      ctaSub="No signup · no card · stop whenever"
      onCTA={() =>
        bridgeToYulia(
          "I just watched the How It Works demo. Run the same chain on my situation: [describe your deal, target, or capital need]. Pull the comps, build the model, and show me the gates you'd open."
        )
      }
    >
      {/* ─── The 22 gates compact (by journey) ─── */}
      <MobileReveal style={{ padding: '14px 16px 22px' }}>
        <div
          style={{
            padding: '0 6px 10px',
            fontFamily: 'Sora, system-ui',
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: accent,
          }}
        >
          22 gates · Yulia won't let you skip steps
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <GateRow journey="Sell" count={6} lock="No valuation until financials are normalized." accent={accent} dark={dark} />
          <GateRow journey="Buy" count={6} lock="No LOI until the cap stack clears DSCR at current rates." accent={accent} dark={dark} />
          <GateRow journey="Raise" count={6} lock="No outreach until the structure clears against DSCR + dilution." accent={accent} dark={dark} />
          <GateRow journey="Integrate" count={4} lock="No 180-day plan until DD findings are real and the deal has closed." accent={accent} dark={dark} />
        </div>
      </MobileReveal>

      {/* ─── 6 engines compact ─── */}
      <MobileReveal style={{ padding: '14px 16px 22px' }}>
        <div
          style={{
            padding: '0 6px 10px',
            fontFamily: 'Sora, system-ui',
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: accent,
          }}
        >
          6 engines under the hood
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {engines.map((e) => (
            <div
              key={e.n}
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                background: cardBg,
                border: `1px solid ${borderC}`,
                fontFamily: 'Inter, system-ui',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}
            >
              <span
                style={{
                  fontFamily: 'Sora, system-ui',
                  fontSize: 16,
                  fontWeight: 900,
                  color: accent,
                  lineHeight: 1,
                  flexShrink: 0,
                  minWidth: 20,
                }}
              >
                {e.n}
              </span>
              <div>
                <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: headingC, lineHeight: 1.3, marginBottom: 3 }}>
                  {e.title}
                </p>
                <p style={{ margin: 0, fontSize: 12.5, color: bodyC, lineHeight: 1.45 }}>
                  {e.claim}
                </p>
              </div>
            </div>
          ))}
        </div>
      </MobileReveal>

      {/* ─── Author vs Auditor compact ─── */}
      <MobileReveal style={{ padding: '8px 22px 22px' }}>
        <div
          style={{
            fontFamily: 'Sora, system-ui',
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: accent,
            marginBottom: 12,
          }}
        >
          Two modes · one Yulia
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ModeCard
            mode="Author · creative"
            title="She writes the documents that close."
            body="CIMs, IC memos, board decks, valuation narratives. Synthesizes from multiple sources. Every sentence traceable."
            accent={accent}
            dark={dark}
          />
          <ModeCard
            mode="Auditor · forensic"
            title="She refuses to guess."
            body='Verifies add-backs, extracts contract clauses, reviews tax returns. Returns "NOT FOUND" when the answer isn\u2019t there.'
            accent={accent}
            dark={dark}
          />
        </div>
      </MobileReveal>

      {/* ─── Sign-off chain compact ─── */}
      <MobileReveal style={{ padding: '8px 22px 22px' }}>
        <div
          style={{
            fontFamily: 'Sora, system-ui',
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: accent,
            marginBottom: 12,
          }}
        >
          The sign-off chain
        </div>
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 14,
            background: cardBg,
            border: `1px solid ${borderC}`,
            fontFamily: 'Inter, system-ui',
          }}
        >
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: bodyC }}>
            Yulia <strong style={{ color: headingC }}>drafts</strong> documents from verified numbers,{' '}
            <strong style={{ color: headingC }}>routes</strong> to your attorney or CPA with focus areas,{' '}
            <strong style={{ color: headingC }}>waits</strong> in queue until counsel attests,{' '}
            <strong style={{ color: headingC }}>executes</strong> only after approval, and{' '}
            <strong style={{ color: headingC }}>logs</strong> every action — SHA-256 hashed on legal docs
            at execution. The buyer's lawyer's "where did that number come from?" has an answer, three years later.
          </p>
        </div>
      </MobileReveal>
    </MobileJourneyStory>
  );
}

/* ───────── Subcomponents ───────── */

function GateRow({
  journey, count, lock, accent, dark,
}: {
  journey: string;
  count: number;
  lock: string;
  accent: string;
  dark: boolean;
}) {
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const bodyC = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedC = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const borderC = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const cardBg = dark ? '#1a1c1e' : '#ffffff';

  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: 12,
        background: cardBg,
        border: `1px solid ${borderC}`,
        fontFamily: 'Inter, system-ui',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <p style={{ margin: 0, fontFamily: 'Sora, system-ui', fontSize: 18, fontWeight: 800, color: headingC, letterSpacing: '-0.01em' }}>
          {journey}
        </p>
        <span style={{ fontSize: 11, fontWeight: 700, color: mutedC, letterSpacing: '0.05em' }}>
          {count} gates
        </span>
      </div>
      <p style={{ margin: 0, fontSize: 12.5, color: bodyC, fontStyle: 'italic', lineHeight: 1.45 }}>
        <span style={{ color: accent, fontWeight: 700, fontStyle: 'normal' }}>The gate that matters: </span>
        {lock}
      </p>
    </div>
  );
}

function ModeCard({
  mode, title, body, accent, dark,
}: {
  mode: string;
  title: string;
  body: string;
  accent: string;
  dark: boolean;
}) {
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const bodyC = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const borderC = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const cardBg = dark ? '#1a1c1e' : '#ffffff';

  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: 12,
        background: cardBg,
        border: `1px solid ${borderC}`,
        fontFamily: 'Inter, system-ui',
      }}
    >
      <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: accent, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
        {mode}
      </p>
      <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: headingC, lineHeight: 1.3, marginBottom: 6 }}>
        {title}
      </p>
      <p style={{ margin: 0, fontSize: 13, color: bodyC, lineHeight: 1.45 }}>
        {body}
      </p>
    </div>
  );
}
