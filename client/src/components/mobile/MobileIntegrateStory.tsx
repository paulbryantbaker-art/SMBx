/**
 * MobileIntegrateStory — mobile-native rendering of the /integrate journey.
 *
 * Fibonacci layout with Anna J.'s 180-day integration story and Day180Calendar
 * as the primary interactive. Plum accent (journey=pmi).
 */

import { bridgeToYulia } from '../content/chatBridge';
import usePageMeta from '../../hooks/usePageMeta';
import { Day180Calendar } from '../content/Day180Calendar';
import { MobileJourneyStory, MobileReveal } from './MobileJourneyStory';

const PLUM = '#8F4A7A';
const PLUM_DARK = '#AE6D9A';

interface Props {
  dark: boolean;
}

export default function MobileIntegrateStory({ dark }: Props) {
  usePageMeta({
    title: 'The deal closed. Now make it pay. · Integrate with smbx.ai',
    description:
      'Hit your model in year 1. Refi at a higher multiple in year 2. The 180-day post-close playbook from search fund principal Anna J — $90M acquisition, 2.7× MOIC in 18 months.',
    canonical: 'https://smbx.ai/integrate',
    ogImage: 'https://smbx.ai/og-integrate.png',
    breadcrumbs: [
      { name: 'Home', url: 'https://smbx.ai/' },
      { name: 'Post-acquisition integration', url: 'https://smbx.ai/integrate' },
    ],
    faqs: [
      {
        question: 'What happens in the first 180 days after closing an acquisition?',
        answer:
          'Day 0-14 stabilization, 15-30 quick wins, 30-90 strengthening, 90-180 acceleration. The plan is the difference between hitting the deal model and tripping a covenant.',
      },
      {
        question: "What's the biggest risk in year 1 of an acquisition?",
        answer:
          'Senior debt covenant trips. Most upper middle market acquisitions close at 1.30-1.50× DSCR with a 1.20× minimum covenant. A 14-20% EBITDA dip in year 1 drops you below the covenant and triggers default.',
      },
      {
        question: 'When can I refinance after an acquisition?',
        answer:
          'Year 2 is typical. By month 18, you should have demonstrated EBITDA growth, paid down 10-15% of senior debt, and proven the deal thesis. A refi at a higher multiple captures multiple expansion as equity value.',
      },
    ],
  });

  const accent = dark ? PLUM_DARK : PLUM;
  const headingColor = dark ? '#f9f9fc' : '#0f1012';
  const bodyC = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedC = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const borderC = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const cardBg = dark ? '#1a1c1e' : '#ffffff';
  const headingC = headingColor;

  return (
    <MobileJourneyStory
      dark={dark}
      journey="pmi"
      eyebrow="Integrate"
      headline={
        <>
          <span className="block">The deal closed.</span>
          <span className="block">Now make it <em className="not-italic" style={{ color: accent }}>pay.</em></span>
        </>
      }
      sub={
        <>
          Anna closed a <strong style={{ color: headingColor }}>$90M acquisition</strong> at $11M EBITDA. Year 1 EBITDA:{' '}
          <strong style={{ color: accent }}>$13.4M</strong>. Year-2 refi: sponsor equity $20M → $54M.{' '}
          <strong style={{ color: accent }}>2.7× MOIC in 18 months.</strong>
        </>
      }
      callout={
        <>
          <strong style={{ color: accent }}>+22% EBITDA · 6 months.</strong>{' '}
          DSCR cushion 1.40× → <strong style={{ color: headingColor }}>1.55×</strong>.
        </>
      }

      primaryInteractiveLabel="180-day plan · drag the marker"
      primaryInteractive={<Day180Calendar dark={dark} accent={accent} />}

      story={{
        name: 'Anna J.',
        role: 'Search fund principal · first acquisition',
        body: (
          <>
            Anna took operational control of a 240-person IT services firm at $48M revenue, $11M EBITDA. Closing
            DSCR 1.40× — 14% headroom before default. 60% of search-fund principals miss year-1 plan in the first 90 days.
            Day 0 she opened a Yulia conversation and didn't close it. Customer health scoring Day 14. Pricing memo Day 45
            (+6.5% on renewals). Three unprofitable accounts terminated Day 60 (gross margin{' '}
            <strong style={{ color: accent }}>+$340K</strong>). Year-1 EBITDA tracking{' '}
            <strong style={{ color: accent }}>$13.4M</strong>.
          </>
        ),
        outcome: 'Y2 refi: $20M sponsor equity → $54M · 2.7× MOIC',
      }}

      kpis={[
        { value: '+22%',  label: 'year-1 EBITDA growth (no new headcount)' },
        { value: '1.55×', label: 'senior DSCR cushion at refi (up from 1.40×)' },
        { value: '2.7×',  label: '18-month MOIC: $20M equity → $54M' },
      ]}

      takeaway={<>Year 1 is when the deal model becomes real — or doesn't. Yulia decides which.</>}

      ctaLabel="Build my 180-day plan"
      ctaSub="From your DD report + cap stack · No signup"
      onCTA={() =>
        bridgeToYulia(
          "Build my 180-day integration plan. I just closed a [deal type] acquisition of about $XM revenue / $XM EBITDA. Key risks I'm watching: [customer concentration / key employees / working capital / covenant headroom]."
        )
      }
    >
      {/* ─── The 7 year-1 mistakes that kill deals (compact top 3) ─── */}
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
          3 of the 7 mistakes that kill year 1
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <MistakeCard
            n="01"
            title="Changing too much, too fast."
            consequence="3 of 8 senior engineers walk in month one. $2.4M of disrupted client work."
            accent={accent}
            dark={dark}
          />
          <MistakeCard
            n="02"
            title='Cutting "unnecessary" costs before understanding them.'
            consequence="$4.2K/mo contractor terminated — turns out he owned the legacy CRM integration. $180K to replace."
            accent={accent}
            dark={dark}
          />
          <MistakeCard
            n="04"
            title="Losing top customers during transition."
            consequence="One lost top-10 customer at $800K ARR is 7.3% of EBITDA — tips DSCR 1.40× → 1.30×."
            accent={accent}
            dark={dark}
          />
        </div>
      </MobileReveal>

      {/* ─── Compact comparison ─── */}
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
          Winging it → with Yulia
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <CompactComparison label="Buyers who miss year-1 plan" slow="~60%" fast="Anna +22%" dark={dark} accent={accent} />
          <CompactComparison label="Avg EBITDA dip in year 1" slow="−14%" fast="+22% growth" dark={dark} accent={accent} />
          <CompactComparison label="Time to first financial close" slow="60–90 days" fast="30 days" dark={dark} accent={accent} />
          <CompactComparison label="Customer health visibility" slow="monthly at best" fast="continuous" dark={dark} accent={accent} />
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
            Yulia <strong style={{ color: headingC }}>drafts</strong> the pricing memo, save scripts, board updates,
            year-2 refi prep. <strong style={{ color: headingC }}>Routes</strong> to the head of sales, CS lead,
            CFO, and lender. <strong style={{ color: headingC }}>Waits</strong> for sign-off on every consequential action.{' '}
            <strong style={{ color: headingC }}>Executes</strong> only after approval.{' '}
            <strong style={{ color: headingC }}>Logs</strong> every decision in the audit trail — the new senior
            lender's "show me the EBITDA build-back" has an answer.
          </p>
        </div>
      </MobileReveal>
    </MobileJourneyStory>
  );
}

/* ───────── Subcomponents ───────── */

function MistakeCard({
  n, title, consequence, accent, dark,
}: {
  n: string;
  title: string;
  consequence: string;
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
          tabularNums: 'auto',
        } as React.CSSProperties}
      >
        {n}
      </span>
      <div>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: headingC, lineHeight: 1.3, marginBottom: 4 }}>
          {title}
        </p>
        <p style={{ margin: 0, fontSize: 13, color: bodyC, lineHeight: 1.45 }}>
          {consequence}
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
