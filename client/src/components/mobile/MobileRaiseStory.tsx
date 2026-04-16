/**
 * MobileRaiseStory — mobile-native rendering of the /raise journey.
 *
 * Fibonacci layout via MobileJourneyStory. Ed K.'s sponsor story is the
 * primary hero (it's the more unique smbx positioning and aligns with the
 * StackBuilder interactive's default $180M / $20M EBITDA). James L.'s
 * owner-raise story appears as a compact comparison card in children.
 */

import { bridgeToYulia } from '../content/chatBridge';
import usePageMeta from '../../hooks/usePageMeta';
import { StackBuilder } from '../content/StackBuilder';
import { MobileJourneyStory, MobileReveal } from './MobileJourneyStory';

const OCHRE = '#C99A3E';
const OCHRE_DARK = '#DDB25E';

interface Props {
  dark: boolean;
}

export default function MobileRaiseStory({ dark }: Props) {
  usePageMeta({
    title: 'Build the stack that closes · Raise with smbx.ai',
    description:
      'Senior, unitranche, mezz, equity, rollover — all modeled against current rates. The capital structure that gets your deal closed in an afternoon instead of a month.',
    canonical: 'https://smbx.ai/raise',
    ogImage: 'https://smbx.ai/og-raise.png',
    breadcrumbs: [
      { name: 'Home', url: 'https://smbx.ai/' },
      { name: 'Raise capital', url: 'https://smbx.ai/raise' },
    ],
    faqs: [
      {
        question: 'How does Yulia model a capital stack for an acquisition?',
        answer:
          'Senior debt, unitranche, mezz, sponsor equity, seller rollover — all modeled against current 2024-2025 market rates. Year-1 DSCR, blended cost of capital, founder retention or sponsor MOIC at exit. Full stack in an afternoon, not a month.',
      },
      {
        question: "I'm an owner raising growth capital, not a sponsor. Does this work for me?",
        answer:
          "Yes — Yulia runs the same math for both paths. Owner-operators raising growth capital get modeled on dilution vs. debt service, ownership preserved at exit, and multiple exit scenarios. James L.'s 3PL raise is a good case study.",
      },
      {
        question: 'How fast can you actually build the stack?',
        answer:
          'Ed K. built the $180M stack for his specialty chemicals acquisition in one afternoon. Traditional timeline: 4-6 weeks of analyst and banker time modeling alternatives. The speed comes from Yulia running five layers in parallel against live lender quotes.',
      },
    ],
  });

  const accent = dark ? OCHRE_DARK : OCHRE;
  const headingColor = dark ? '#f9f9fc' : '#0f1012';
  const bodyC = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedC = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const borderC = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const cardBg = dark ? '#1a1c1e' : '#ffffff';
  const headingC = headingColor;

  return (
    <MobileJourneyStory
      dark={dark}
      journey="raise"
      eyebrow="Raise"
      headline={
        <>
          Build the stack.<br />
          Close the <em className="not-italic" style={{ color: accent }}>deal.</em>
        </>
      }
      sub={
        <>
          Ed had <strong style={{ color: headingColor }}>$25M of LP capital</strong> and a $180M target under LOI.
          Yulia built the full 5-layer cap stack in <strong style={{ color: accent }}>one afternoon</strong>.
          Closed in 4.5 months — half the industry norm for a first fundless-sponsor deal.
        </>
      }
      callout={
        <>
          <strong style={{ color: accent }}>$180M stack · 5 layers.</strong>{' '}
          Year-1 DSCR <strong style={{ color: headingColor }}>1.35×</strong> ·
          Closed in <strong style={{ color: headingColor }}>4.5 months</strong>.
        </>
      }

      primaryInteractiveLabel="Stack Builder · drag the sliders"
      primaryInteractive={<StackBuilder dark={dark} audience="sponsor" ev={180} ebitda={20} />}

      story={{
        name: 'Ed K.',
        role: 'Independent sponsor · fundless',
        body: (
          <>
            Ed had $25M of committed LP capital and a specialty chemicals distribution target under LOI at $180M EV
            on $20M EBITDA. Yulia built the full stack in one afternoon:{' '}
            <strong style={{ color: headingColor }}>$80M senior at SOFR+450</strong>,{' '}
            <strong style={{ color: headingColor }}>$40M unitranche at 10%</strong>,{' '}
            <strong style={{ color: headingColor }}>$25M mezz at 13% cash + 3% PIK + 5% warrants</strong>,{' '}
            <strong style={{ color: headingColor }}>$25M sponsor equity</strong>,{' '}
            <strong style={{ color: headingColor }}>$10M seller rollover</strong>. Year-1 DSCR{' '}
            <strong style={{ color: accent }}>1.35×</strong>. Clears the senior covenant with cushion.
          </>
        ),
        outcome: 'Closed 4.5 mo · vs 9-11 mo industry norm',
      }}

      kpis={[
        { value: '$180M', label: '5-layer stack, built in one afternoon' },
        { value: '1.35×', label: 'year-1 DSCR (vs 1.20× covenant floor)' },
        { value: '4.5mo', label: 'time to close (vs 9-11mo norm)' },
      ]}

      takeaway={<>Cap stack is the part where deals die. Yulia builds it in an afternoon.</>}

      ctaLabel="Build my stack"
      ctaSub="Sponsor, owner-operator, or SBA buyer · All modeled the same"
      onCTA={() =>
        bridgeToYulia(
          "Build my capital stack. Target EV about $XM, EBITDA $XM, sector [industry]. I'm a [sponsor / owner raising growth / SBA buyer]. Model 2-3 alternative stacks and flag the covenant risk."
        )
      }
    >
      {/* ─── Owner path: James L. compact ─── */}
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
          Raising growth capital? The math is different.
        </div>
        <div
          style={{
            padding: '18px 16px',
            borderRadius: 14,
            background: cardBg,
            border: `1px solid ${borderC}`,
            fontFamily: 'Inter, system-ui',
          }}
        >
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: accent, marginBottom: 6, letterSpacing: '0.05em' }}>
            JAMES L. · 3PL OWNER · $15M EBITDA
          </p>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: headingC, lineHeight: 1.3, marginBottom: 10 }}>
            Three offers. $50M delta at exit. Kept 100%.
          </p>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: bodyC, marginBottom: 10 }}>
            James had a PE offer (33% dilution), a senior + mezz blend (no dilution, higher debt service),
            and an SBA path (slowest). Yulia modeled all three against a 5-year exit. Delta between PE and
            debt-mezz: <strong style={{ color: accent }}>$50M to James</strong>. He took the debt route and still
            owns the company.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8,
              marginTop: 4,
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: mutedC, textTransform: 'uppercase', marginBottom: 2 }}>
                PE path
              </p>
              <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: headingC }}>$140M</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: mutedC, textTransform: 'uppercase', marginBottom: 2 }}>
                Debt-mezz
              </p>
              <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: accent }}>$190M</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: mutedC, textTransform: 'uppercase', marginBottom: 2 }}>
                Delta
              </p>
              <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: accent }}>+$50M</p>
            </div>
          </div>
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
          The way it's been → with Yulia
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <CompactComparison label="Time to model the stack" slow="4–6 weeks" fast="one afternoon" dark={dark} accent={accent} />
          <CompactComparison label="Alternative structures considered" slow="1–2 (what the banker pitches)" fast="5–10 (every viable blend)" dark={dark} accent={accent} />
          <CompactComparison label="Time to close (first fundless deal)" slow="9–11 months" fast="4.5 months" dark={dark} accent={accent} />
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
            Yulia <strong style={{ color: headingC }}>drafts</strong> the stack against live lender quotes,{' '}
            <strong style={{ color: headingC }}>routes</strong> to your CFO or banker for review,{' '}
            <strong style={{ color: headingC }}>waits</strong> for sign-off, models alternatives,{' '}
            <strong style={{ color: headingC }}>executes</strong> the term-sheet transmission, and{' '}
            <strong style={{ color: headingC }}>logs</strong> every assumption in the audit trail.
            The mezz fund's counsel can ask where any number came from — the answer is in the database.
          </p>
        </div>
      </MobileReveal>
    </MobileJourneyStory>
  );
}

/* ───────── Subcomponents ───────── */

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
