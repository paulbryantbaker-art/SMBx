/**
 * MobileSellStory — mobile-native rendering of the /sell journey.
 *
 * Uses MobileJourneyStory (Fibonacci-rhythm layout primitive) with
 * Sarah V.'s story + Baseline calculator + proof KPIs. Same content
 * density as SellBelow (desktop editorial), laid out vertically for
 * thumb-scroll reading on a 6" screen.
 *
 * Rendered from AppShell on mobile for the /sell route. Desktop
 * continues to render SellBelow.
 */

import { bridgeToYulia } from '../content/chatBridge';
import usePageMeta from '../../hooks/usePageMeta';
import { BaselineCalculator } from '../content/LandingCalculators';
import { MultipleMap } from '../content/MultipleMap';
import { MobileJourneyStory, MobileReveal } from './MobileJourneyStory';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

interface Props {
  dark: boolean;
}

export default function MobileSellStory({ dark }: Props) {
  usePageMeta({
    title: 'Win the sell-side mandate · smbx.ai',
    description:
      'Walk into your sell-side pitch with the Baseline already in hand. Show the seller their real number at the first meeting. Win mandates the other brokers lose. Free for verified deal professionals.',
    canonical: 'https://smbx.ai/sell',
    ogImage: 'https://smbx.ai/og-sell.png',
    breadcrumbs: [
      { name: 'Home', url: 'https://smbx.ai/' },
      { name: 'Sell a business', url: 'https://smbx.ai/sell' },
    ],
    faqs: [
      {
        question: 'How does Yulia help me win sell-side pitches?',
        answer:
          'You show the prospect a real Baseline at the first meeting — comp data, add-back schedule, defensible multiple range — instead of "we will come back in two weeks." Engagement conversion lifts from ~35% to ~62% in the practices we work with. Prospects sign because the work is already credible.',
      },
      {
        question: 'What is Blind Equity™?',
        answer:
          'The gap between reported EBITDA and real EBITDA — the legitimate add-backs the CPA optimized away for tax savings. Above-market rent to an owner real-estate LLC, family compensation above market, one-time legal fees, personal vehicles, discontinued product losses. On a $15M+ EBITDA business, Blind Equity is usually $1-3M, which translates to $10-25M of valuation at typical industry multiples.',
      },
      {
        question: 'How much can a business actually sell for?',
        answer:
          'Five drivers: industry comp multiples, real EBITDA (not the tax-return number), customer concentration, growth trajectory, and owner dependency. Yulia runs all five against 2024-2025 mid-market consensus ranges, NAICS benchmarks, and actual deals closing in the sector — and gives you a defensible Baseline range, usually higher than the CPA rule of thumb.',
      },
    ],
  });

  const accent = dark ? PINK_DARK : PINK;
  const headingColor = dark ? '#f9f9fc' : '#0f1012';
  // Shared palette for the child sections composed into MobileJourneyStory
  const headingC = headingColor;
  const bodyC = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedC = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const borderC = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const cardBg = dark ? '#1a1c1e' : '#ffffff';

  return (
    <MobileJourneyStory
      dark={dark}
      journey="sell"
      eyebrow="Sell"
      headline={
        <>
          Walk in with the <em className="not-italic" style={{ color: accent }}>number.</em><br />
          Win the mandate.
        </>
      }
      sub={
        <>
          Sarah's seller thought <strong style={{ color: headingColor }}>$90M</strong>. Sarah walked in with a defensible{' '}
          <strong style={{ color: accent }}>$155M</strong> Baseline in 90 seconds. She won the mandate over two other brokers
          who said "we'll come back to you in two weeks."
        </>
      }
      callout={
        <>
          <strong style={{ color: accent }}>$155M Baseline · 90 seconds.</strong>{' '}
          Closed at <strong style={{ color: headingColor }}>$154.8M</strong> · fee{' '}
          <strong style={{ color: headingColor }}>$2.7M</strong>.
        </>
      }

      primaryInteractiveLabel="Run a Baseline · live"
      primaryInteractive={<BaselineCalculator dark={dark} />}

      story={{
        name: 'Sarah V.',
        role: 'Partner · boutique M&A advisory, Midwest',
        body: (
          <>
            Mark was selling the specialty-distribution business he founded in 1998. Two brokers said they'd come back with a
            number in two weeks. Sarah ran the Baseline in the meeting — pulled the industry comp multiples, normalized the
            EBITDA, found <strong style={{ color: headingColor }}>$1.8M of Blind Equity</strong> hiding in the tax return.
            The number: <strong style={{ color: accent }}>$155M</strong> against Mark's $90M rule-of-thumb guess. Mark signed
            the engagement that day.
          </>
        ),
        outcome: 'Closed $154.8M · $2.7M fee',
      }}

      kpis={[
        { value: '$155M', label: 'defensible Baseline (vs $90M guess)' },
        { value: '90s', label: 'to build the number in the pitch' },
        { value: '62%', label: 'engagement conversion, up from 35%' },
      ]}

      takeaway={<>The broker who walks in with the number wins the mandate. Every time.</>}

      ctaLabel="Run a Baseline"
      ctaSub="Free for verified brokers & deal pros · No card required"
      onCTA={() =>
        bridgeToYulia(
          "Run a Baseline for my next sell-side prospect. The business is in [industry] with about $XM EBITDA. Walk me through the Multiple Map and the add-back schedule."
        )
      }
    >
      {/* ─── Second interactive: Multiple Map ─── */}
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
          Multiple Map · where your seller lands
        </div>
        <div
          style={{
            borderRadius: 16,
            border: `1px solid ${borderC}`,
            background: cardBg,
            overflow: 'hidden',
          }}
        >
          <MultipleMap dark={dark} ebitda={18} />
        </div>
      </MobileReveal>

      {/* ─── Baseline + Blind Equity — two branded terms stacked ─── */}
      <MobileReveal style={{ padding: '8px 16px 22px' }}>
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
          The two numbers your buyer cares about
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <CompactTermCard
            term="Baseline"
            oneLiner="The number you walk into the pitch with."
            body={<>
              Industry comp multiple × real EBITDA, adjusted for the levers that move price: customer concentration,
              growth, owner dependency, recurring revenue. The same math the buyer's IB will run.
            </>}
            example="$18M EBITDA × 8.6× Baseline = $155M. Rule of thumb says $90M. The difference is the comp set you cite at the first meeting."
            accent={accent}
            dark={dark}
          />
          <CompactTermCard
            term="Blind Equity"
            oneLiner="The earnings hiding in your seller's tax return."
            body={<>
              The gap between reported EBITDA and real EBITDA. Above-market rent to an owner LLC, family comp above
              market, one-time legal fees, personal vehicles, discontinued product losses — legitimate add-backs the
              CPA optimized away.
            </>}
            example="Mark's reported EBITDA was $16.2M. Sarah surfaced $1.8M across 5 categories. Real EBITDA: $18M. At 8.6× Baseline, that $1.8M is worth $15.5M to the seller."
            accent={accent}
            dark={dark}
          />
        </div>
      </MobileReveal>

      {/* ─── Compact comparison: the way it's been → with Yulia ─── */}
      <MobileReveal style={{ padding: '8px 22px 22px' }}>
        <div
          style={{
            fontFamily: 'Sora, system-ui',
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: mutedC,
            marginBottom: 14,
          }}
        >
          The way it's been → with Yulia
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <CompactComparison
            label="At the first meeting"
            slow="&quot;We'll come back to you in two weeks.&quot;"
            fast="Defensible Baseline in 90 seconds."
            dark={dark}
            accent={accent}
          />
          <CompactComparison
            label="Engagement conversion"
            slow="~35%"
            fast="~62%"
            dark={dark}
            accent={accent}
          />
          <CompactComparison
            label="Time to produce the first draft"
            slow="2 weeks of analyst time"
            fast="90 seconds of Yulia"
            dark={dark}
            accent={accent}
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
          Yulia runs the workflow
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
          <p
            style={{
              margin: 0,
              fontSize: 14,
              lineHeight: 1.55,
              color: bodyC,
            }}
          >
            Yulia <strong style={{ color: headingC }}>drafts</strong> the Baseline, <strong style={{ color: headingC }}>routes</strong> to counsel and CPA for review,{' '}
            <strong style={{ color: headingC }}>waits</strong> for sign-off, <strong style={{ color: headingC }}>executes</strong> the send-out, and <strong style={{ color: headingC }}>logs</strong>{' '}
            every decision in the audit trail. The buyer's lawyer can ask where any number came from — the answer is in the database.
          </p>
        </div>
      </MobileReveal>
    </MobileJourneyStory>
  );
}

/* ───────── Subcomponents used in the children slot ───────── */

function CompactTermCard({
  term, oneLiner, body, example, accent, dark,
}: {
  term: string;
  oneLiner: string;
  body: React.ReactNode;
  example: string;
  accent: string;
  dark: boolean;
}) {
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const bodyC = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedC = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const borderC = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const cardBg = dark ? '#1a1c1e' : '#ffffff';
  const exampleBg = dark ? 'rgba(255,255,255,0.04)' : 'rgba(15,16,18,0.04)';

  return (
    <div
      style={{
        padding: '18px 16px',
        borderRadius: 14,
        background: cardBg,
        border: `1px solid ${borderC}`,
        fontFamily: 'Inter, system-ui',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'baseline',
          gap: 4,
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontFamily: 'Sora, system-ui',
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: headingC,
          }}
        >
          {term}
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, color: accent }}>™</span>
      </div>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: headingC, lineHeight: 1.35, marginBottom: 10 }}>
        {oneLiner}
      </p>
      <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: bodyC, marginBottom: 10 }}>
        {body}
      </p>
      <div
        style={{
          padding: '10px 12px',
          borderRadius: 10,
          background: exampleBg,
          fontSize: 12,
          lineHeight: 1.5,
          color: bodyC,
        }}
      >
        <span
          style={{
            display: 'block',
            fontFamily: 'Sora, system-ui',
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: mutedC,
            marginBottom: 4,
          }}
        >
          Example
        </span>
        {example}
      </div>
    </div>
  );
}

function CompactComparison({
  label, slow, fast, dark, accent,
}: {
  label: string;
  slow: string;
  fast: string;
  dark: boolean;
  accent: string;
}) {
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const mutedC = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const borderC = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';

  return (
    <div
      style={{
        padding: '12px 14px',
        borderRadius: 12,
        border: `1px solid ${borderC}`,
        fontFamily: 'Inter, system-ui',
      }}
    >
      <div
        style={{
          fontFamily: 'Sora, system-ui',
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: mutedC,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            flex: 1,
            fontSize: 13,
            color: mutedC,
            textDecoration: 'line-through',
            textDecorationThickness: 1.5,
          }}
          dangerouslySetInnerHTML={{ __html: slow }}
        />
        <span
          className="material-symbols-outlined"
          aria-hidden
          style={{ fontSize: 16, color: accent, flexShrink: 0 }}
        >
          arrow_forward
        </span>
        <span
          style={{
            flex: 1,
            fontSize: 13.5,
            fontWeight: 700,
            color: headingC,
            textAlign: 'right',
          }}
          dangerouslySetInnerHTML={{ __html: fast }}
        />
      </div>
    </div>
  );
}
