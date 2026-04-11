/**
 * MobileAdvisorsPage.tsx — mobile-native vertical layout for the Advisors journey.
 * Hook → Reese & Hammond story → 4-job funnel → CapacitySlider
 * → KPI strip → Slow vs Fast → Sign-off chain → bottom CTA.
 */

import { motion } from 'framer-motion';
import {
  MobileJourneySheet,
  MobileHero,
  MobileSection,
  MobileKpiStrip,
} from './MobileJourneySheet';
import { CapacitySlider, SynergyBuilder } from '../content/AdvisorTools';
import {
  MobileStoryCard,
  MobileSignOffChain,
  MobileSlowVsFast,
} from './mobileJourneyShared';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dark: boolean;
  onTalkToYulia: (prefill?: string) => void;
}

const JOBS = [
  {
    n: '01',
    title: 'Win the pitch.',
    pre: '35%',
    post: '62%',
    body:
      'Prospects don\'t buy "we\'ll come back to you in two weeks." They buy a number. Yulia builds the Baseline live during the pitch meeting — comp set, add-back schedule, defensible range. Conversion lifts from ~35% to ~62%.',
  },
  {
    n: '02',
    title: 'Kill the bad deals.',
    pre: '6 wks',
    post: '1 day',
    body:
      'Six weeks of LOI back-and-forth before everyone realizes the deal won\'t pencil = 1 partner-week of dead time per failed deal. The Rundown™ scores the target buyer pool in 24 hours. 70% reduction in dead-deal time.',
  },
  {
    n: '03',
    title: 'Make the killer pitch.',
    pre: '60-80h',
    post: '4h',
    body:
      'Yulia drafts the CIM from verified financials. You review, refine, and ship. Buyer outreach list ranked by sector fit, transaction history, capital availability — 100+ targets in a day.',
  },
  {
    n: '04',
    title: 'Find the synergy.',
    pre: '+0.0×',
    post: '+0.4×',
    body:
      'Yulia builds a synergy capture model into the CIM — cost takeout, cross-sell, working capital release, year-by-year. The buyer underwrites the lift before signing the LOI. Higher LOIs because the upside is on the page.',
  },
];

export function MobileAdvisorsPage({ open, onOpenChange, dark, onTalkToYulia }: Props) {
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const bodyC    = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedC   = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const ruleC    = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.08)';
  const cardBg   = dark ? '#1f2123' : '#ffffff';
  const pinkC    = dark ? PINK_DARK : PINK;

  return (
    <MobileJourneySheet
      open={open}
      onOpenChange={onOpenChange}
      dark={dark}
      eyebrow="Advisors"
      topBarTitle="Win the pitch. Win the deal."
      ctaLabel="Start 90-day trial"
      ctaSubLabel="Verified deal pros are free, forever"
      onCTA={() =>
        onTalkToYulia(
          "I'm an M&A advisor / broker / search fund partner. Walk me through how Yulia helps me win pitches and triple my book."
        )
      }
    >
      <MobileHero
        dark={dark}
        hook={
          <>
            Win the pitch.<br />
            Win the deal.<br />
            <em className="not-italic" style={{ color: pinkC }}>Get paid.</em>
          </>
        }
        sub={
          <>
            Show the Baseline at the first meeting. Kill bad deals before LOI. Make the killer CIM. Find the synergy the buyer hadn't priced in.{' '}
            <strong style={{ color: headingC }}>Triple your book without adding partners.</strong>
          </>
        }
      />

      {/* Story */}
      <MobileSection dark={dark} eyebrow="The story">
        <MobileStoryCard
          dark={dark}
          byline="Reese & Hammond*"
          role="Boutique sell-side M&A advisory · 4 partners"
          dealLine="$80M-$300M EV mandates · sell-side · upper middle market"
          body={
            <>
              <p>
                Reese & Hammond ran a 4-partner sell-side practice. Average mandate: <strong style={{ color: headingC }}>$80-300M EV.</strong> Average fee: <strong style={{ color: headingC }}>$1.2M.</strong> The partners were good at relationships, good at negotiation, and bottlenecked everywhere else.
              </p>
              <p>
                The bottleneck wasn't relationships. It was production. Each CIM took 60-80 partner hours. They could carry 8 active mandates, max. At a 50% close rate and a $1.2M average fee, that's <strong style={{ color: headingC }}>$4.8M annual revenue</strong> with a 60% margin.
              </p>
              <p>
                Then the math changed. Yulia builds the Baseline live during the first prospect meeting. Conversion went from <strong style={{ color: pinkC }}>35% to 62%</strong> — because prospects could feel the work was already real.
              </p>
              <p>
                CIM cycle compressed. <strong style={{ color: pinkC }}>4 hours of partner review</strong> instead of 60-80 hours. Yulia drafted from verified financials, the partner reviewed and refined.
              </p>
              <p>
                Synergy thesis went into every CIM. Average close multiple lifted <strong style={{ color: pinkC }}>+0.4×</strong> across the portfolio.
              </p>
              <p>
                Twelve months later: <strong style={{ color: pinkC }}>22 active mandates, 60% close rate, 78% margin. $16.5M revenue. 3.4× the prior year.</strong> Same four partners.
              </p>
              <p className="italic" style={{ color: 'rgba(218,218,220,0.55)' }}>
                The scarce resource was always partner time. Yulia gives it back.
              </p>
            </>
          }
        />
      </MobileSection>

      <MobileKpiStrip
        dark={dark}
        kpis={[
          { label: 'Pre-Yulia annual',   value: '$4.8M', sub: '8 mandates · 50% · 60% margin' },
          { label: 'Post-Yulia annual',  value: '$16.5M', sub: '22 mandates · 60% · 78% margin' },
          { label: 'Same 4 partners',    value: '3.4×',   sub: 'revenue, no headcount added' },
        ]}
      />

      {/* 4-job funnel — vertical editorial */}
      <MobileSection
        dark={dark}
        eyebrow="Your 4 jobs"
        title="Win. Kill. Pitch. Synergize."
        sub="The four things that determine whether you make money this year. Yulia accelerates each one."
      >
        <div className="space-y-5">
          {JOBS.map((job, i) => (
            <motion.div
              key={job.n}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.45, delay: i * 0.05, ease: [0.32, 0.72, 0, 1] }}
              className="rounded-2xl p-5"
              style={{ background: cardBg, border: `1px solid ${ruleC}` }}
            >
              <div className="flex items-baseline gap-3 mb-3">
                <span
                  className="font-headline font-black tabular-nums"
                  style={{ fontSize: '1.5rem', color: pinkC, lineHeight: 0.95 }}
                >
                  {job.n}
                </span>
                <h3
                  className="font-headline font-black tracking-tight flex-1"
                  style={{ fontSize: '1.125rem', color: headingC, lineHeight: 1.15 }}
                >
                  {job.title}
                </h3>
              </div>
              {/* Pre/post compact */}
              <div
                className="flex items-center gap-3 mb-3 px-3 py-2 rounded-lg"
                style={{ background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(15,16,18,0.04)' }}
              >
                <span
                  className="font-headline font-black tabular-nums line-through opacity-50"
                  style={{ fontSize: '1rem', color: headingC }}
                >
                  {job.pre}
                </span>
                <span className="material-symbols-outlined text-[14px]" style={{ color: pinkC }}>
                  arrow_forward
                </span>
                <span
                  className="font-headline font-black tabular-nums"
                  style={{ fontSize: '1.25rem', color: pinkC }}
                >
                  {job.post}
                </span>
              </div>
              <p className="text-[13px] leading-[1.55]" style={{ color: bodyC }}>
                {job.body}
              </p>
            </motion.div>
          ))}
        </div>
      </MobileSection>

      {/* CapacitySlider */}
      <MobileSection
        dark={dark}
        eyebrow="Interactive · capacity"
        title="What does 22 active mandates look like?"
        sub="Drag the slider from 6 to 22 mandates. Watch revenue, margin, partner hours, and capacity utilization update in real time."
      >
        <CapacitySlider dark={dark} />
      </MobileSection>

      {/* SynergyBuilder */}
      <MobileSection
        dark={dark}
        eyebrow="Interactive · synergy"
        title="Show the buyer what they'll capture."
        sub="Model cost takeout, cross-sell, and working capital release for a hypothetical $20M EBITDA target. Watch the buyer's underwritten valuation lift — and your fee with it."
      >
        <SynergyBuilder dark={dark} />
      </MobileSection>

      {/* Slow vs Fast */}
      <MobileSection dark={dark} eyebrow="Pre-Yulia vs With Yulia">
        <MobileSlowVsFast
          dark={dark}
          rows={[
            { label: 'Active mandates',        cold: '6-8',      prepared: '20-22' },
            { label: 'CIM cycle (partner hrs)', cold: '60-80',    prepared: '4' },
            { label: 'Engagement conversion',   cold: '~35%',     prepared: '~62%' },
            { label: 'Annual revenue',          cold: '~$4.8M',   prepared: '~$16.5M' },
          ]}
          takeaway={
            <>
              The relationships are still yours. The judgment is still yours. The fee is still yours. Yulia just removes the production bottleneck. Same 4 partners. 3.4× the revenue.
            </>
          }
        />
      </MobileSection>

      {/* Sign-off chain */}
      <MobileSection dark={dark} eyebrow="Sign-off chain">
        <MobileSignOffChain
          dark={dark}
          intro={
            <>
              Reese & Hammond don't just draft CIMs faster. They run the entire deal chain on Yulia. <strong>And every attorney, CPA, and broker on the deal runs the platform free.</strong>
            </>
          }
          steps={[
            { label: 'Draft',   text: 'Yulia drafts the CIM, teaser, buyer outreach. 4 hours of partner review instead of 60-80.' },
            { label: 'Route',   text: "Routes draft to the seller's CPA + counsel with focus areas. Both pros free on the platform." },
            { label: 'Wait',    text: 'Holds CIM in review until both pros sign off. Two-stage review chain. State machine advances on both approvals.' },
            { label: 'Execute', text: 'Sends teaser to ranked buyer pool, CIM behind NDA. Watermark, view tracking, sharer notified on view.' },
            { label: 'Log',     text: "Buyer's QoE asks for line-item source 3 months out. Audit log answers in 30 seconds." },
          ]}
          bottomNote={
            <>
              The relationships are still yours. The fee is still yours. Yulia removes the production bottleneck — and gives the deal a chain of custody that survives the buyer's lawyer, the buyer's QoE, and the buyer's senior bank.
            </>
          }
        />
      </MobileSection>
    </MobileJourneySheet>
  );
}
