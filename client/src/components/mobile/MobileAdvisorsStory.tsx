/**
 * MobileAdvisorsStory — mobile-native rendering of the /advisors journey.
 *
 * Fibonacci layout with Reese & Hammond's 3.4× revenue story and the
 * BaselineCalculator as the primary interactive (advisors pitch the
 * Baseline at the first meeting — that's the core product claim).
 * Pink accent (brand default).
 */

import { bridgeToYulia } from '../content/chatBridge';
import usePageMeta from '../../hooks/usePageMeta';
import { BaselineCalculator } from '../content/LandingCalculators';
import { MobileJourneyStory } from './MobileJourneyStory';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

interface Props {
  dark: boolean;
}

export default function MobileAdvisorsStory({ dark }: Props) {
  usePageMeta({
    title: 'Triple your book without adding partners · Advisors & smbx.ai',
    description:
      "For M&A advisors, brokers, fundless sponsors, search-fund advisors, and PE deal teams. Win pitches with live Baselines. Draft CIMs in hours not weeks. Find the synergy the buyer hadn't priced in.",
    canonical: 'https://smbx.ai/advisors',
    ogImage: 'https://smbx.ai/og-advisors.png',
    breadcrumbs: [
      { name: 'Home', url: 'https://smbx.ai/' },
      { name: 'For advisors', url: 'https://smbx.ai/advisors' },
    ],
    faqs: [
      {
        question: 'How does Yulia help advisors win more mandates?',
        answer:
          'You show the prospect a real Baseline at the first meeting — comp data, add-back schedule, defensible multiple range — instead of "we will come back in two weeks." Engagement conversion lifts from ~35% to ~62%.',
      },
      {
        question: 'What do my attorneys and CPAs pay to join the deal?',
        answer:
          'Nothing. Service professionals (attorneys, CPAs, appraisers, RWI brokers, wealth managers, estate planners) run free on any deal workflow you bring them onto — they\'re on your deal, not their own book.',
      },
      {
        question: "I'm a fundless sponsor, not a sell-side broker. Does this work for me?",
        answer:
          'Yes. The platform is built for M&A advisors, brokers, fundless sponsors, search-fund advisors, family-office deal teams, and small PE shops. Same tooling across the deal cycle — sourcing, scoring, structuring, closing, integration.',
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

  return (
    <MobileJourneyStory
      dark={dark}
      journey="brand"
      eyebrow="Advisors"
      headline={
        <>
          Triple your book.<br />
          <em className="not-italic" style={{ color: accent }}>Same four partners.</em>
        </>
      }
      sub={
        <>
          Reese & Hammond went from <strong style={{ color: headingColor }}>$4.8M</strong> to{' '}
          <strong style={{ color: accent }}>$16.5M</strong> in 12 months. 8 mandates → 22. Same four partners.
          No new hires. The bottleneck wasn't relationships — it was production.
        </>
      }
      callout={
        <>
          <strong style={{ color: accent }}>3.4× revenue · 12 months.</strong>{' '}
          Close rate 50% → 60% · margin 60% → 78%.
        </>
      }

      primaryInteractiveLabel="Run a Baseline · live"
      primaryInteractive={<BaselineCalculator dark={dark} />}

      story={{
        name: 'Reese & Hammond',
        role: 'Boutique sell-side M&A · 4 partners',
        body: (
          <>
            Each CIM took 60-80 partner hours. Each buyer research cycle took 40. Eight active mandates was the
            ceiling. Yulia changed two things: the Baseline lands in the first prospect meeting (conversion{' '}
            <strong style={{ color: accent }}>35% → 62%</strong>), and the CIM cycle compressed to{' '}
            <strong style={{ color: accent }}>4 hours of partner review</strong> from 60-80 partner hours.
            Then synergy theses went into every CIM — buyers signed at higher multiples (close multiple{' '}
            <strong style={{ color: accent }}>+0.4×</strong>).
          </>
        ),
        outcome: '8 mandates → 22 · $4.8M → $16.5M · same 4 partners',
      }}

      kpis={[
        { value: '62%',   label: 'prospect → engagement conversion (up from 35%)' },
        { value: '15×',   label: 'CIM throughput (4hr partner vs 60-80hr)' },
        { value: '+0.4×', label: 'close multiple lift from synergy thesis' },
      ]}

      takeaway={<>The bottleneck was never relationships. It was production. Yulia ends the bottleneck.</>}

      ctaLabel="Run Yulia for my practice"
      ctaSub="Free to start · Service pros on your deal run free forever"
      onCTA={() =>
        bridgeToYulia(
          "I run an advisory practice — [sell-side M&A / fundless sponsor / search-fund / family office / small PE]. Walk me through what the first 30 days with Yulia look like for my practice. I have [#] mandates open right now."
        )
      }
    >
      {/* ─── 4 jobs compact ─── */}
      <section style={{ padding: '14px 16px 22px' }}>
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
          Your 4 jobs, Yulia accelerates each
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <JobCard n="01" title="Win the pitch." detail="Live Baseline in the first prospect meeting. Conversion 35% → 62%." accent={accent} dark={dark} />
          <JobCard n="02" title="Kill bad deals before LOI." detail="The Rundown™ scores any deal in 8 seconds across 7 dimensions." accent={accent} dark={dark} />
          <JobCard n="03" title="Make the killer CIM." detail="4 hours of partner review vs 60-80 partner hours. Same quality." accent={accent} dark={dark} />
          <JobCard n="04" title="Find the synergy." detail="Cost takeout, cross-sell, WC release — priced into every pitch. +0.4× close multiple." accent={accent} dark={dark} />
        </div>
      </section>

      {/* ─── Pricing for advisors — honest & direct ─── */}
      <section style={{ padding: '8px 22px 22px' }}>
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
          Pricing · for advisors
        </div>
        <div
          style={{
            padding: '16px',
            borderRadius: 14,
            background: dark ? 'rgba(232,112,154,0.08)' : 'rgba(212,74,120,0.05)',
            border: dark ? '1px solid rgba(232,112,154,0.22)' : '1px solid rgba(212,74,120,0.16)',
            fontFamily: 'Inter, system-ui',
          }}
        >
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55, color: headingColor }}>
            You pay for the platform. <strong>Your clients don't</strong> unless they engage Yulia directly.
            The attorneys, CPAs, appraisers, and wealth managers who join your deal workflow{' '}
            <strong style={{ color: accent }}>run free forever</strong> — they're on your deal, not their own book.
          </p>
        </div>
      </section>

      {/* ─── Compact comparison ─── */}
      <section style={{ padding: '8px 22px 22px' }}>
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
          Before → after Yulia
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <CompactComparison label="Mandates carried, 4-partner practice" slow="8 active (the ceiling)" fast="22 active" dark={dark} accent={accent} />
          <CompactComparison label="CIM cycle time" slow="60–80 partner hours" fast="4 partner hours" dark={dark} accent={accent} />
          <CompactComparison label="Annual revenue, same team" slow="$4.8M" fast="$16.5M" dark={dark} accent={accent} />
          <CompactComparison label="Practice margin" slow="60%" fast="78%" dark={dark} accent={accent} />
        </div>
      </section>

      {/* ─── Sign-off chain compact ─── */}
      <section style={{ padding: '8px 22px 22px' }}>
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
          Yulia runs the deal, not just the analysis
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
            Yulia <strong style={{ color: headingC }}>drafts</strong> the Baseline, CIM, LOI, synergy memo,{' '}
            <strong style={{ color: headingC }}>routes</strong> to your partners + service pros for review,{' '}
            <strong style={{ color: headingC }}>waits</strong> for sign-off,{' '}
            <strong style={{ color: headingC }}>executes</strong> the buyer outreach and negotiation, and{' '}
            <strong style={{ color: headingC }}>logs</strong> every decision. The buyer's lawyer can ask where any
            number came from three years later — the answer is in the database.
          </p>
        </div>
      </section>
    </MobileJourneyStory>
  );
}

/* ───────── Subcomponents ───────── */

function JobCard({
  n, title, detail, accent, dark,
}: {
  n: string;
  title: string;
  detail: string;
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
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
      }}
    >
      <span
        style={{
          fontFamily: 'Sora, system-ui',
          fontSize: 22,
          fontWeight: 900,
          color: accent,
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        {n}
      </span>
      <div>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: headingC, lineHeight: 1.3, marginBottom: 4 }}>
          {title}
        </p>
        <p style={{ margin: 0, fontSize: 13, color: bodyC, lineHeight: 1.45 }}>
          {detail}
        </p>
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
