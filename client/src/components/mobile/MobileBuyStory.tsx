/**
 * MobileBuyStory — mobile-native rendering of the /buy journey.
 *
 * Uses MobileJourneyStory with Priya S.'s story + LiveRundown as the primary
 * interactive. Same content density as BuyBelow, laid out vertically for
 * thumb-scroll reading on a 6" screen.
 *
 * Rendered from AppShell on mobile for the /buy route. Desktop continues
 * to render BuyBelow.
 */

import { bridgeToYulia } from '../content/chatBridge';
import usePageMeta from '../../hooks/usePageMeta';
import { LiveRundown } from '../content/LiveRundown';
import { DealCalculator } from '../content/DealCalculator';
import { MobileJourneyStory, MobileReveal } from './MobileJourneyStory';

const TEAL = '#3E8E8E';
const TEAL_DARK = '#52A8A8';

interface Props {
  dark: boolean;
}

export default function MobileBuyStory({ dark }: Props) {
  usePageMeta({
    title: 'Kill 100 bad deals before lunch · Buy with smbx.ai',
    description:
      'Score every deal in 8 seconds. Kill the losers, find the one that pays. The Rundown™ runs 7 dimensions on any deal — for SBA buyers to $1B funds.',
    canonical: 'https://smbx.ai/buy',
    ogImage: 'https://smbx.ai/og-buy.png',
    breadcrumbs: [
      { name: 'Home', url: 'https://smbx.ai/' },
      { name: 'Buy a business', url: 'https://smbx.ai/buy' },
    ],
    faqs: [
      {
        question: 'How do I screen acquisition targets fast?',
        answer:
          'The Rundown™ scores any deal across seven dimensions in 8 seconds: financial performance, market position, owner dependency, customer concentration, growth trajectory, bankability (DSCR), and operational risk. Each dimension gets 0-100, with a one-line justification. The composite gives you a pursue / negotiate / kill verdict before you spend an hour reading the CIM.',
      },
      {
        question: 'What size deals does smbx.ai support?',
        answer:
          'From $1M SBA acquisitions to $500M+ private equity buyouts. Yulia adapts the analysis depth and the cap stack model to the deal size.',
      },
      {
        question: 'Can Yulia model the capital stack for a deal?',
        answer:
          'Yes. Senior debt, unitranche, mezzanine, sponsor equity, seller rollover, earnouts — all modeled against current 2024-2025 market rates, with year-1 DSCR and sponsor MOIC at exit.',
      },
    ],
  });

  const accent = dark ? TEAL_DARK : TEAL;
  const headingColor = dark ? '#f9f9fc' : '#0f1012';
  const bodyC = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedC = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const borderC = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const cardBg = dark ? '#1a1c1e' : '#ffffff';
  const headingC = headingColor;

  return (
    <MobileJourneyStory
      dark={dark}
      journey="buy"
      eyebrow="Buy"
      headline={
        <>
          Kill <em className="not-italic" style={{ color: accent }}>100</em><br />
          bad deals before lunch.
        </>
      }
      sub={
        <>
          $1B in dry powder doesn't matter if you can't find the one that pays. Priya ran <strong style={{ color: headingColor }}>12 CIMs a week</strong>.
          With Yulia she runs <strong style={{ color: accent }}>300</strong>. Same principal, same fund, no headcount.
        </>
      }
      callout={
        <>
          <strong style={{ color: accent }}>8 seconds per deal.</strong>{' '}
          7 dimensions · pursue, negotiate, or kill before you open the CIM.
        </>
      }

      primaryInteractiveLabel="The deal, in four sliders"
      primaryInteractive={<DealCalculator dark={dark} accent={accent} />}

      secondaryLabel="The Rundown™ · preset cases"
      secondary={<LiveRundown dark={dark} />}

      story={{
        name: 'Priya S.',
        role: 'Principal · $2.5B mid-market PE fund',
        body: (
          <>
            Priya's fund had $2.5B of committed capital, a sharp thesis on vertical SaaS and tech-enabled services,
            and a single bottleneck: <strong style={{ color: headingColor }}>inbound CIM volume</strong>. Yulia changed the
            math at the top of the funnel. The Rundown runs all seven dimensions in 8 seconds — composite score, verdict,
            and a one-line justification per dimension. Priya now screens <strong style={{ color: accent }}>300 CIMs a week</strong>.
            The folder is empty by Tuesday.
          </>
        ),
        outcome: '~$400M → ~$3.2B annual deployed · 8× throughput',
      }}

      kpis={[
        { value: '300', label: 'CIMs screened per week (vs 12 pre-Yulia)' },
        { value: '8s',  label: 'to score a deal across 7 dimensions' },
        { value: '8×',  label: 'annual capital deployed, no new headcount' },
      ]}

      takeaway={<>Find the one-in-a-hundred. Kill the other ninety-nine before lunch.</>}

      ctaLabel="Score my next deal"
      ctaSub="For SBA buyers to $1B funds · No card required"
      onCTA={() =>
        bridgeToYulia(
          "Run The Rundown on a deal I'm evaluating. It's a [industry] business at roughly $XM revenue / $XM EBITDA, asking around $XM. Score it across the seven dimensions and tell me pursue, negotiate, or kill."
        )
      }
    >
      {/* ─── The Rundown as a branded term ─── */}
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
          The number your IC cares about
        </div>
        <CompactTermCard
          term="The Rundown"
          oneLiner="Score any deal in 8 seconds. Pursue, negotiate, or kill."
          body={
            <>
              Seven dimensions: financial performance, market position, owner dependency, customer concentration,
              growth trajectory, bankability (DSCR at proposed structure), and operational risk. Each dimension
              gets 0-100 with a one-line justification. The composite picks the verdict.
            </>
          }
          example="$24M EBITDA cybersecurity SaaS at 18× ask, NRR 132%, 32% YoY growth: composite 83/100 → PURSUE. A $58M EBITDA defense manufacturer at 9.5× ask, 71% DoD concentration, 11% CAGR: composite 71/100 → NEGOTIATE."
          accent={accent}
          dark={dark}
        />
      </MobileReveal>

      {/* ─── Compact comparison: old CIM screen → The Rundown ─── */}
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
            label="CIM screen velocity"
            slow="4-6 hours of analyst time"
            fast="8 seconds"
            dark={dark}
            accent={accent}
          />
          <CompactComparison
            label="CIMs screened per week"
            slow="5–12"
            fast="300"
            dark={dark}
            accent={accent}
          />
          <CompactComparison
            label="Annual capital deployed"
            slow="~$400M"
            fast="~$3.2B"
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
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: bodyC }}>
            Yulia <strong style={{ color: headingC }}>drafts</strong> the IC memo from the CIM,{' '}
            <strong style={{ color: headingC }}>routes</strong> to the deal team for review,{' '}
            <strong style={{ color: headingC }}>waits</strong> for partner sign-off, models the cap stack against
            live lender quotes, <strong style={{ color: headingC }}>executes</strong> the LOI send, and{' '}
            <strong style={{ color: headingC }}>logs</strong> every decision in the audit trail.
            The seller's lawyer can ask where any number came from — the answer is in the database.
          </p>
        </div>
      </MobileReveal>
    </MobileJourneyStory>
  );
}

/* ───────── Subcomponents ───────── */

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
      <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
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
        >
          {slow}
        </span>
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
        >
          {fast}
        </span>
      </div>
    </div>
  );
}
