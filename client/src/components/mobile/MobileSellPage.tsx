/**
 * MobileSellPage.tsx
 *
 * Mobile-native version of the Sell journey page.
 * Vertical-first, big editorial typography, generous spacing,
 * one interactive per screen, sticky bottom CTA.
 *
 * Showcase implementation for the mobile rebuild — the pattern
 * the other journey pages will follow.
 */

import { motion } from 'framer-motion';
import {
  MobileJourneySheet,
  MobileHero,
  MobileSection,
  MobileKpiStrip,
} from './MobileJourneySheet';
import { MultipleMap } from '../content/MultipleMap';
import { BaselineCalculator } from '../content/LandingCalculators';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dark: boolean;
  onTalkToYulia: (prefill?: string) => void;
}

export function MobileSellPage({ open, onOpenChange, dark, onTalkToYulia }: Props) {
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const bodyC    = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedC   = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const ruleC    = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.08)';
  const pinkC    = dark ? PINK_DARK : PINK;
  const cardBg   = dark ? '#1f2123' : '#ffffff';

  return (
    <MobileJourneySheet
      open={open}
      onOpenChange={onOpenChange}
      dark={dark}
      eyebrow="Sell"
      topBarTitle="Sell — Win the mandate"
      ctaLabel="Run a Baseline"
      ctaSubLabel="Pre-fills your next conversation with Yulia"
      onCTA={() =>
        onTalkToYulia(
          "Run a Baseline for my next sell-side prospect. The business is in [industry] with about $XM EBITDA."
        )
      }
    >
      {/* HERO */}
      <MobileHero
        dark={dark}
        hook={
          <>
            Walk in with the <em className="not-italic" style={{ color: pinkC }}>number.</em>{' '}
            Win the mandate.
          </>
        }
        sub={
          <>
            Sarah's seller thought <strong style={{ color: headingC }}>$90M</strong>. Sarah walked in with a defensible{' '}
            <strong style={{ color: pinkC }}>$155M</strong> Baseline in 90 seconds. She won the mandate over two other brokers who said
            "we'll come back to you in two weeks." Closed at $154.8M. <strong style={{ color: headingC }}>Fee: $2.7M.</strong>
          </>
        }
      />

      {/* AUDIENCE PILL */}
      <div className="px-6 mb-8">
        <div
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{
            background: dark ? 'rgba(232,112,154,0.06)' : 'rgba(212,74,120,0.04)',
            border: `1px solid ${dark ? 'rgba(232,112,154,0.18)' : 'rgba(212,74,120,0.16)'}`,
          }}
        >
          <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5" style={{ color: pinkC }}>
            workspace_premium
          </span>
          <p className="text-[12px] leading-relaxed" style={{ color: bodyC }}>
            Built for the brokers, M&amp;A advisors, search funders, and family-office deal teams running sell-side mandates.
            <strong style={{ color: headingC }}> Owners can run their own Baseline too.</strong> Verified deal professionals are <strong style={{ color: pinkC }}>free, forever.</strong>
          </p>
        </div>
      </div>

      {/* MULTIPLE MAP */}
      <MobileSection
        dark={dark}
        eyebrow="Step 1 · The Multiple Map"
        title="See where your seller lands."
        sub="Pick the industry. Tap the chart to place the pin. The position tells you whether they're in the premium zone, the middle, or the bottom — and what's holding them back from the next half-turn of multiple."
      >
        <MultipleMap dark={dark} ebitda={18} />
      </MobileSection>

      {/* BASELINE CALCULATOR */}
      <MobileSection
        dark={dark}
        eyebrow="Step 2 · Baseline™"
        title="Run the number now."
        sub="Pick the industry, drag the revenue, watch the multiple range pull from the 2024-2025 mid-market consensus. You'll have a defensible Baseline range in 30 seconds — the same math the buyer's IB will run."
      >
        <BaselineCalculator dark={dark} />
      </MobileSection>

      {/* SARAH V STORY — vertical, big typography */}
      <MobileSection dark={dark} eyebrow="The story">
        <div
          className="rounded-3xl p-6"
          style={{
            background: cardBg,
            border: `1px solid ${ruleC}`,
          }}
        >
          {/* Byline */}
          <div className="mb-5">
            <p
              className="font-headline font-black text-2xl tracking-tight mb-1"
              style={{ color: headingC }}
            >
              Sarah V.*
            </p>
            <p className="text-[12px]" style={{ color: mutedC }}>
              Partner — boutique sell-side M&amp;A advisory, Chicago
            </p>
            <p className="text-[11px] font-mono mt-2" style={{ color: bodyC }}>
              6 partners · sell-side · $50M-$300M EV
            </p>
          </div>

          <div className="space-y-4 text-[15px] leading-[1.65]" style={{ color: bodyC }}>
            <p>
              Mark D. owned a third-generation specialty industrial distributor in the Midwest. <strong style={{ color: headingC }}>$112M revenue, $16.2M reported EBITDA, 28 years operating.</strong> When he started thinking about exit, his CPA's friend gave him the rule of thumb: <em>"5× EBITDA, you're worth $90M."</em>
            </p>
            <p>
              Mark started taking pitch meetings with three brokers. Two of them said the same thing: <em>"Give us two weeks. We'll pull comps and come back with a Baseline range."</em>
            </p>
            <p>
              Sarah didn't. She opened Yulia in the meeting and said <strong style={{ color: headingC }}>"let me run the comps now."</strong>
            </p>
            <p>
              Ninety seconds later: specialty distribution at $15M+ EBITDA trades <strong style={{ color: pinkC }}>7.2× median, 9.4× at the 75th percentile</strong> in the 2024-2025 mid-market consensus. The 5× rule of thumb came from the sub-$5M cohort and didn't apply at Mark's size.
            </p>
            <p>
              In the next 8 minutes, Yulia surfaced <strong style={{ color: pinkC }}>$1.8M of Blind Equity</strong> across 5 categories. Real EBITDA: <strong style={{ color: pinkC }}>$18M flat.</strong>
            </p>
            <p>
              Sarah's screen showed Mark a Baseline of <strong style={{ color: pinkC }}>$154-180M</strong>. <strong style={{ color: headingC }}>Mark signed the engagement letter that afternoon.</strong> Eight months later Sarah closed at 8.6× × $18M = <strong style={{ color: pinkC }}>$154.8M.</strong> Her firm's fee: 1.75% × $154.8M = <strong style={{ color: pinkC }}>$2.7M.</strong>
            </p>
            <p className="italic" style={{ color: mutedC }}>
              The other two brokers won zero of the three pitch meetings they took that month. Sarah won all three.
            </p>
          </div>
        </div>
      </MobileSection>

      {/* KPI STRIP */}
      <MobileKpiStrip
        dark={dark}
        kpis={[
          { label: 'CPA rule-of-thumb', value: '$90M', sub: '5× a wrong EBITDA' },
          { label: "Sarah's Baseline at the pitch", value: '$155M', sub: '8.6× × $18M EBITDA' },
          { label: "Sarah's fee on the close", value: '$2.7M', sub: '1.75% × $154.8M' },
        ]}
      />

      {/* SLOW vs FAST — vertical stack on mobile */}
      <MobileSection dark={dark} eyebrow="Pitching cold vs walking in prepared">
        <div className="grid grid-cols-1 gap-3">
          {[
            { label: 'First-meeting conversion', cold: '~35%', prepared: '~62%' },
            { label: 'Time from prospect → Baseline', cold: '2-3 weeks', prepared: '90 sec' },
            { label: 'Source of the number', cold: 'Rule of thumb', prepared: '2024-2025 comps' },
            { label: 'Add-back schedule', cold: 'Comes later', prepared: 'In the meeting' },
          ].map((row) => (
            <div
              key={row.label}
              className="rounded-2xl p-4"
              style={{ background: cardBg, border: `1px solid ${ruleC}` }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2.5"
                style={{ color: mutedC }}
              >
                {row.label}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p
                    className="font-headline font-black text-lg tracking-tight line-through opacity-50 tabular-nums"
                    style={{ color: headingC }}
                  >
                    {row.cold}
                  </p>
                </div>
                <span className="material-symbols-outlined text-[18px]" style={{ color: pinkC }}>
                  arrow_forward
                </span>
                <div className="flex-1 text-right">
                  <p
                    className="font-headline font-black text-xl tracking-tight tabular-nums"
                    style={{ color: pinkC }}
                  >
                    {row.prepared}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </MobileSection>

      {/* SIGN-OFF CHAIN — vertical numbered list */}
      <MobileSection
        dark={dark}
        eyebrow="Sign-off chain"
        title="Yulia drafts. Routes. Waits. Executes. Logs."
        sub="Sarah doesn't just win the pitch. She runs the deal. After the engagement letter, Yulia takes over the production work."
      >
        <div className="space-y-3">
          {[
            {
              n: '01',
              label: 'Draft',
              text: 'Yulia drafts the CIM + add-back schedule from the verified financials. 4 hours of partner review instead of 60-80.',
            },
            {
              n: '02',
              label: 'Route',
              text: "Routes the add-back schedule to the seller's CPA with focus areas: \"Confirm above-market rent, family comp, one-time legal.\"",
            },
            {
              n: '03',
              label: 'Wait',
              text: "Holds the CIM in 'review' state until both CPA + owner sign off. State machine advances on approvals.",
            },
            {
              n: '04',
              label: 'Execute',
              text: 'Sends the teaser to a ranked buyer pool, CIM behind NDA. Sarah is notified on every view.',
            },
            {
              n: '05',
              label: 'Log',
              text: "Audit trail for the QoE conversation 3 months out. Buyer's QoE asks for line-item source — log answers in 30 seconds.",
            },
          ].map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.45, delay: i * 0.05, ease: [0.32, 0.72, 0, 1] }}
              className="flex gap-4"
            >
              <div className="shrink-0 flex flex-col items-center">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-headline font-black text-[11px] tabular-nums"
                  style={{
                    background: dark ? 'rgba(232,112,154,0.10)' : 'rgba(212,74,120,0.08)',
                    border: `1px solid ${dark ? 'rgba(232,112,154,0.20)' : 'rgba(212,74,120,0.18)'}`,
                    color: pinkC,
                  }}
                >
                  {step.n}
                </div>
                {i < 4 && (
                  <div
                    className="w-px flex-1 mt-1"
                    style={{ background: ruleC, minHeight: 24 }}
                  />
                )}
              </div>
              <div className="flex-1 pb-4">
                <p
                  className="text-[11px] font-bold uppercase tracking-[0.18em] mb-1"
                  style={{ color: pinkC }}
                >
                  {step.label}
                </p>
                <p className="text-[14px] leading-[1.55]" style={{ color: bodyC }}>
                  {step.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </MobileSection>

      {/* Final teaser line */}
      <div className="px-6 mb-4">
        <p
          className="text-[15px] italic leading-[1.55] border-l-4 pl-4"
          style={{ color: bodyC, borderColor: pinkC }}
        >
          The relationship with Mark is still Sarah's. The judgment is still Sarah's. The $2.7M fee is still Sarah's.
          Yulia just removes the production bottleneck — and gives the deal a chain of custody that survives the buyer's lawyer, QoE, and senior bank.
        </p>
      </div>
    </MobileJourneySheet>
  );
}
