/**
 * MobileBuyPage.tsx — mobile-native vertical layout for the Buy journey.
 * Hook → Yulia conversation demo → Priya story → KPI strip → LiveRundown
 * → Slow vs Fast → Sign-off chain → bottom CTA.
 */

import {
  MobileJourneySheet,
  MobileHero,
  MobileSection,
  MobileKpiStrip,
} from './MobileJourneySheet';
import { LiveRundown } from '../content/LiveRundown';
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

export function MobileBuyPage({ open, onOpenChange, dark, onTalkToYulia }: Props) {
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const bodyC    = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const pinkC    = dark ? PINK_DARK : PINK;

  return (
    <MobileJourneySheet
      open={open}
      onOpenChange={onOpenChange}
      dark={dark}
      eyebrow="Buy"
      topBarTitle="Kill 100 bad deals before lunch"
      ctaLabel="Run The Rundown"
      ctaSubLabel="Pre-fills your next conversation with Yulia"
      onCTA={() =>
        onTalkToYulia(
          "I'm evaluating an acquisition target. Can you run The Rundown on it?"
        )
      }
    >
      <MobileHero
        dark={dark}
        hook={
          <>
            Kill <em className="not-italic" style={{ color: pinkC }}>100</em> bad deals before lunch.
          </>
        }
        sub={
          <>
            $1B in dry powder doesn't matter if you can't find the one that pays. The Rundown™ scores any deal in 8 seconds —
            from a $1M SBA listing to a $500M sponsor target. The 99 you kill take seconds. The one that survives is yours to close.
          </>
        }
      />

      {/* Yulia conversation demo — small, scrollable inline preview */}
      <MobileSection dark={dark} eyebrow="Yulia screens">
        <div
          className="rounded-3xl p-5"
          style={{
            background: '#0f1012',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="space-y-3">
            <div className="flex justify-end">
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tr-none text-white text-[13px] leading-relaxed max-w-[85%]">
                Cybersecurity SaaS in Boston. $88M ARR, $24M EBITDA, asking 18×. NRR 132%, 32% YoY, 9 yrs. Should I dig in?
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <div className="w-7 h-7 rounded-full bg-[#D44A78] flex items-center justify-center text-white text-[10px] font-bold shrink-0">Y</div>
              <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none text-white text-[13px] leading-relaxed">
                Cybersecurity SaaS at $24M EBITDA — running The Rundown.{' '}
                <span className="text-[#ffb2bf] font-bold">Composite 83/100 — PURSUE.</span>{' '}
                Rule of 40 = 64 (top decile), NRR 132% (best in class), 16% top-10. Asset-light, sponsor-equity heavy.
              </div>
            </div>
          </div>
          <p className="text-[#dadadc]/40 text-[10px] text-center mt-4">
            8 seconds. No signup. Real comps.
          </p>
        </div>
      </MobileSection>

      {/* Priya story */}
      <MobileSection dark={dark} eyebrow="The story">
        <MobileStoryCard
          dark={dark}
          byline="Priya S.*"
          role="Principal — $2.5B mid-market PE fund"
          dealLine="Coverage: vertical SaaS · cybersecurity · healthcare · $25-100M EBITDA · $200M avg equity check"
          body={
            <>
              <p>
                Priya's fund had $2.5B of committed capital, a sharp thesis on vertical SaaS and tech-enabled services, and a single
                bottleneck: <strong style={{ color: headingC }}>inbound CIM volume.</strong>
              </p>
              <p>
                Sell-side advisors were sending her <strong style={{ color: pinkC }}>40-60 CIMs a week</strong>. Reading and modeling each
                one took 4-6 hours. At capacity she screened 12 a week — out of 50. The other 38 sat in a folder.
              </p>
              <p>
                Industry conversion screen → live diligence is ~3%. From 624 screens a year, that's <strong style={{ color: headingC }}>~19 live deals</strong>,
                ~2 closes — at $200M average EV, <strong>$400M deployed per principal per year.</strong>
              </p>
              <p>
                Yulia changed the math at the top of the funnel. The Rundown™ runs all 7 dimensions in 8 seconds. Priya now screens{' '}
                <strong style={{ color: pinkC }}>300 CIMs a week</strong>. The folder is empty by Tuesday.
              </p>
              <p>
                More selective: 1% conversion on 15,600 annual screens = <strong style={{ color: pinkC }}>156 live deals</strong>, 16 closes/year, ≈{' '}
                <strong style={{ color: pinkC }}>$3.2B of deal flow per principal per year.</strong> Same fund, same thesis, 8× the throughput.
              </p>
              <p className="italic" style={{ color: 'rgba(218,218,220,0.55)' }}>
                The unlock isn't "buy faster." It's "kill faster, so you can find the one that pays."
              </p>
            </>
          }
        />
      </MobileSection>

      <MobileKpiStrip
        dark={dark}
        kpis={[
          { label: 'Pre-Yulia · annual deployed',  value: '~$400M', sub: '12 CIMs/wk × 3% × 10% × $200M' },
          { label: 'Post-Yulia · annual deployed', value: '~$3.2B', sub: '300 CIMs/wk × 1% × 10% × $200M' },
          { label: 'Throughput multiplier',         value: '8×',     sub: 'same principal, same fund' },
        ]}
      />

      {/* LiveRundown — try it yourself */}
      <MobileSection
        dark={dark}
        eyebrow="Try it"
        title="Pick a deal. Watch The Rundown run."
        sub="Three real preview cases. Tap run — the seven dimensions reveal one at a time, then the verdict lands."
      >
        <LiveRundown dark={dark} />
      </MobileSection>

      {/* Slow vs Fast */}
      <MobileSection dark={dark} eyebrow="The old velocity vs the new">
        <MobileSlowVsFast
          dark={dark}
          rows={[
            { label: 'Deals screened / week',     cold: '5-12',     prepared: '300+' },
            { label: 'Time per CIM screen',       cold: '4-6 hrs',  prepared: '8 sec' },
            { label: 'Live deals / yr',           cold: '~19',      prepared: '~156' },
            { label: 'Closes / yr / analyst',     cold: '~2',       prepared: '~16' },
          ]}
          takeaway={
            <>
              The bottleneck was never "find more deals" — it was "kill bad deals faster." Yulia kills the 99 in eight seconds each.
              You spend the saved time on the one that pays.
            </>
          }
        />
      </MobileSection>

      {/* Sign-off chain */}
      <MobileSection
        dark={dark}
        eyebrow="Sign-off chain"
        title="Yulia closes the deal end-to-end."
      >
        <MobileSignOffChain
          dark={dark}
          intro={
            <>
              Priya doesn't just screen deals. She closes them. Yulia builds the IC memo, routes it to the deal team, holds the LOI in
              queue until the partner signs off, transmits it to the seller's broker, and logs every action. Year-2 refi conversations
              start with a clean audit trail.
            </>
          }
          steps={[
            { label: 'Draft',   text: 'Yulia drafts the IC memo + LOI from the CIM excerpt + your thesis. The Rundown score baked in.' },
            { label: 'Route',   text: 'Routes the IC memo to your partners with focus areas: "Verify the comp set and DSCR assumption."' },
            { label: 'Wait',    text: 'Holds LOI in review until partner sign-off + your attorney redlines. Two-stage chain.' },
            { label: 'Execute', text: "Sends LOI to the seller's broker via share_document. Every view tracked." },
            { label: 'Log',     text: 'Year-2 refi conversation starts with the lender asking for the audit trail. It is there.' },
          ]}
          bottomNote={
            <>
              The 99 deals you killed take seconds. The 1 you closed has a chain of custody that survives the buyer's lawyer, the senior bank's covenant review, and the year-2 refi.
            </>
          }
        />
      </MobileSection>
    </MobileJourneySheet>
  );
}
