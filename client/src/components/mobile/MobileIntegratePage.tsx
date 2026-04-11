/**
 * MobileIntegratePage.tsx — mobile-native vertical layout for the Integrate journey.
 * Hook → Anna J story → KPI strip → Day180Calendar → 7 mistakes editorial
 * → Slow vs Fast → Sign-off chain → bottom CTA.
 */

import { motion } from 'framer-motion';
import {
  MobileJourneySheet,
  MobileHero,
  MobileSection,
  MobileKpiStrip,
} from './MobileJourneySheet';
import { Day180Calendar } from '../content/Day180Calendar';
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

const MISTAKES = [
  {
    n: '01',
    title: 'Changing too much, too fast.',
    consequence:
      'Three of eight senior engineers walk in month one. Replacement cost: $180K each + 4 months ramp. Real cost: ~$2.4M of disrupted client work.',
  },
  {
    n: '02',
    title: 'Cutting "unnecessary" costs before understanding them.',
    consequence:
      '$4,200/month contractor terminated — turns out he was the only person who knew the legacy CRM integration. Tribal knowledge cost: $180K + a six-week customer onboarding outage.',
  },
  {
    n: '03',
    title: 'Ignoring employee fear in week one.',
    consequence:
      '47% of employees google "what happens when a business gets sold" in the first 14 days. The ones who get answered stay. The ones who don\'t start interviewing.',
  },
  {
    n: '04',
    title: 'Losing top customers during transition.',
    consequence:
      'Your competitors know there\'s a transition and they\'re calling your top 20 this week. One lost top-10 at $800K ARR is 7.3% of EBITDA — flips DSCR from 1.40× to 1.30×.',
  },
  {
    n: '05',
    title: 'Fighting with the seller post-close.',
    consequence:
      'The seller knows the customers, the systems, and the unwritten rules. Treat them well even when the earnout creates tension.',
  },
  {
    n: '06',
    title: 'Squeezing margins instead of investing in growth.',
    consequence:
      'Year-1 cost cuts juice EBITDA by 8-12%. Year-3 you\'re looking at a flat business with no upgrade path. Best operators reinvest 15-20% of FCF into growth in years 1-2.',
  },
  {
    n: '07',
    title: 'No financial reporting on Day 1.',
    consequence:
      "You can't hit a model you can't see. Monthly P&L, weekly cash flow, daily revenue — set up before you change a single thing.",
  },
];

export function MobileIntegratePage({ open, onOpenChange, dark, onTalkToYulia }: Props) {
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const bodyC    = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const ruleC    = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.08)';
  const pinkC    = dark ? PINK_DARK : PINK;

  return (
    <MobileJourneySheet
      open={open}
      onOpenChange={onOpenChange}
      dark={dark}
      eyebrow="Integrate"
      topBarTitle="Make the deal pay"
      ctaLabel="Build my 180-day plan"
      ctaSubLabel="Pre-fills your next conversation with Yulia"
      onCTA={() =>
        onTalkToYulia(
          "I just closed an acquisition. Can you build a 180-day post-close plan from my deal financials and DD report?"
        )
      }
    >
      <MobileHero
        dark={dark}
        hook={
          <>
            The deal closed.<br />
            Now make it <em className="not-italic" style={{ color: pinkC }}>pay</em>.
          </>
        }
        sub={
          <>
            Anna closed a $90M acquisition at $11M EBITDA. Year 1: <strong style={{ color: headingC }}>$13.4M EBITDA</strong>. Year-2 refi: sponsor equity went from $20M to{' '}
            <strong style={{ color: pinkC }}>$54M</strong>. <strong>2.7× MOIC in 18 months.</strong>
          </>
        }
      />

      {/* Anna J story */}
      <MobileSection dark={dark} eyebrow="The story">
        <MobileStoryCard
          dark={dark}
          byline="Anna J.*"
          role="Search fund principal — first acquisition"
          dealLine="$90M EV · $11M EBITDA · IT services · Atlanta · 240 employees"
          body={
            <>
              <p>
                Anna had spent two years searching. When the wire hit, she took operational control of a 240-person IT services firm with $48M revenue and a debt covenant that left her 14% of EBITDA headroom before things got bad.
              </p>
              <p>
                The cap stack: <strong style={{ color: headingC }}>$50M senior</strong> at SOFR+475, <strong style={{ color: headingC }}>$20M mezz</strong> at 12%+3% PIK, <strong style={{ color: headingC }}>$20M sponsor equity</strong>. Senior covenant: minimum DSCR 1.20×. Closing DSCR: <strong>1.40×</strong>. A 14% EBITDA dip would trip her into default.
              </p>
              <p>
                <strong>60% of search fund principals miss year-1 plan in the first 90 days.</strong> The math is unforgiving.
              </p>
              <p>
                Day 0, Anna opened a Yulia conversation and didn't close it. Yulia built the 180-day plan from her DD report. Customer health scoring deployed Day 14. Pricing memo Day 45 (6.5% lift on contract renewals). Three unprofitable accounts terminated Day 60 (revenue −$1.1M, gross margin <strong style={{ color: pinkC }}>+$340K</strong>). New head of customer success hired Day 120.
              </p>
              <p>
                By Day 90, EBITDA was annualized at $11.7M (+6%). By Day 180: <strong style={{ color: pinkC }}>$13.4M</strong> — a 22% lift in 6 months without adding headcount. Senior bank moved DSCR cushion from 1.40× to 1.55×.
              </p>
              <p>
                Year-2 refi at <strong style={{ color: pinkC }}>9× × $13.4M = $120.6M</strong>. Anna's $20M sponsor equity worth ~$54M after debt paydown. <strong style={{ color: pinkC }}>2.7× MOIC in 18 months.</strong>
              </p>
              <p className="italic" style={{ color: 'rgba(218,218,220,0.55)' }}>
                The deal model was real. Yulia made it real.
              </p>
            </>
          }
        />
      </MobileSection>

      <MobileKpiStrip
        dark={dark}
        kpis={[
          { label: 'Closing EBITDA · DSCR',  value: '$11M · 1.40×', sub: '14% covenant headroom' },
          { label: 'Day-180 EBITDA',         value: '$13.4M',       sub: '+22% in 6 months' },
          { label: '18-month sponsor MOIC',  value: '2.7×',          sub: '$20M → $54M equity value' },
        ]}
      />

      {/* Day 180 Calendar */}
      <MobileSection
        dark={dark}
        eyebrow="The 180-day plan · interactive"
        title="Day by day. Drag the marker."
        sub="Ten milestones across Anna's first 180 days. For each: what she did, what Yulia recommended, the KPI that moved."
      >
        <Day180Calendar dark={dark} />
      </MobileSection>

      {/* 7 mistakes — vertical editorial */}
      <MobileSection
        dark={dark}
        eyebrow="What kills year 1"
        title="The 7 mistakes that destroy post-close value."
        sub="Each one has a dollar consequence. The full set is what tips a 1.40× DSCR into a 1.15× covenant trip."
      >
        <div className="space-y-5">
          {MISTAKES.map((m, i) => (
            <motion.div
              key={m.n}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.45, delay: i * 0.04, ease: [0.32, 0.72, 0, 1] }}
              className="grid grid-cols-12 gap-3 pt-5"
              style={{ borderTop: `1px solid ${ruleC}` }}
            >
              <div className="col-span-2">
                <span
                  className="font-headline font-black tabular-nums"
                  style={{ fontSize: '1.625rem', color: pinkC, lineHeight: 1 }}
                >
                  {m.n}
                </span>
              </div>
              <div className="col-span-10">
                <h3
                  className="font-headline font-black mb-2 tracking-tight"
                  style={{ fontSize: '1.0625rem', color: headingC, lineHeight: 1.2 }}
                >
                  {m.title}
                </h3>
                <p className="text-[13px] leading-[1.55]" style={{ color: bodyC }}>
                  {m.consequence}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </MobileSection>

      {/* Slow vs Fast */}
      <MobileSection dark={dark} eyebrow="Winging it vs with Yulia">
        <MobileSlowVsFast
          dark={dark}
          rows={[
            { label: 'Buyers who miss year-1 plan',      cold: '~60%',     prepared: '+22% above plan' },
            { label: 'Avg EBITDA dip in year 1',          cold: '−14%',     prepared: '+22%' },
            { label: 'Time to first financial close',     cold: '60-90 d',  prepared: '30 days' },
            { label: 'Customer health visibility',        cold: 'monthly',  prepared: 'continuous' },
          ]}
          takeaway={
            <>
              The plan isn't a binder. It's a daily conversation with someone watching the numbers while you run the business. Year 1 is when the deal model becomes real — or doesn't.
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
              Anna's first 180 days were not 180 days of guesswork. They were 180 days of decisions Yulia drafted, routed to the right human, waited for sign-off, executed, and logged.
            </>
          }
          steps={[
            { label: 'Draft',   text: 'Yulia drafts the pricing memo, save scripts, board updates from the deal model + customer health data.' },
            { label: 'Route',   text: 'Routes pricing memo to head of sales: "Confirm pricing elasticity assumption on top-20."' },
            { label: 'Wait',    text: 'Holds rate-card change in queue until sign-off. Sales head reviews, comments, approves. State machine advances.' },
            { label: 'Execute', text: 'Sends customer-by-customer renewal letters, tracks responses. Every customer interaction logged.' },
            { label: 'Log',     text: 'Year-2 refi conversation: new senior lender asks "show me the EBITDA build-back." Audit log = the answer.' },
          ]}
        />
      </MobileSection>
    </MobileJourneySheet>
  );
}
