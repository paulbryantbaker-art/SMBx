/**
 * MobileRaisePage.tsx — mobile-native vertical layout for the Raise journey.
 * Hook → Audience picker → Story (Ed K) → StackBuilder → KPI strip
 * → Slow vs Fast → Sign-off chain → bottom CTA.
 */

import { useState } from 'react';
import {
  MobileJourneySheet,
  MobileHero,
  MobileSection,
  MobileKpiStrip,
} from './MobileJourneySheet';
import { StackBuilder, AudiencePicker, type Audience } from '../content/StackBuilder';
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

export function MobileRaisePage({ open, onOpenChange, dark, onTalkToYulia }: Props) {
  const [audience, setAudience] = useState<Audience>('sponsor');

  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const pinkC    = dark ? PINK_DARK : PINK;

  return (
    <MobileJourneySheet
      open={open}
      onOpenChange={onOpenChange}
      dark={dark}
      eyebrow="Raise"
      topBarTitle="Get the capital. Keep the company."
      ctaLabel="Build my stack"
      ctaSubLabel="Pre-fills your next conversation with Yulia"
      onCTA={() =>
        onTalkToYulia(
          "I need to raise capital. Can you model the cap stack and show me what I'd keep at exit?"
        )
      }
    >
      <MobileHero
        dark={dark}
        hook={
          <>
            Get the capital.<br />
            <em className="not-italic" style={{ color: pinkC }}>Keep</em> the company.
          </>
        }
        sub={
          <>
            $1B in dry powder is chasing your deal. Take the slice that doesn't cost you the upside. Yulia models every stack — senior,
            unitranche, mezz, equity, seller rollover — against your real EBITDA and live market rates.
          </>
        }
      />

      {/* Audience picker */}
      <MobileSection dark={dark} eyebrow="Pick your path">
        <AudiencePicker value={audience} onChange={setAudience} dark={dark} />
      </MobileSection>

      {/* Story — switches based on audience */}
      <MobileSection dark={dark} eyebrow="The story">
        {audience === 'sponsor' ? (
          <MobileStoryCard
            dark={dark}
            byline="Ed K.*"
            role="Independent sponsor — fundless"
            dealLine="$180M acquisition · $20M EBITDA · specialty chemicals distribution"
            body={
              <>
                <p>
                  Ed had <strong style={{ color: headingC }}>$25M of committed LP capital</strong>, a target under LOI, and the part of every fundless deal that dies first: <strong>the cap stack.</strong>
                </p>
                <p>
                  $180M EV. $20M EBITDA. Specialty chemicals — asset-heavy, recurring contracts, the kind banks and credit funds love.
                </p>
                <p>
                  Yulia built the full stack in <strong style={{ color: pinkC }}>one afternoon</strong>: $80M senior at SOFR+450 (4× leverage), $40M unitranche at 10% (push to 6× total), $25M mezz at 13%+3% PIK + 5% warrants, $25M sponsor equity, $10M seller rollover (5.5% ongoing stake).
                </p>
                <p>
                  Year-1 cash debt service: $14.85M against $20M EBITDA = <strong style={{ color: pinkC }}>1.35× DSCR</strong>. Clears the senior covenant of 1.20× with cushion.
                </p>
                <p>
                  Yulia modeled 3 alternative stacks, surfaced 2 mezz funds from Ed's existing LP base, and closed in <strong style={{ color: pinkC }}>4.5 months</strong> — vs. the 9-11 months most independent sponsors quote for first deals at this size.
                </p>
                <p className="italic" style={{ color: 'rgba(218,218,220,0.55)' }}>
                  Cap stacks die in modeling. Yulia builds them in an afternoon.
                </p>
              </>
            }
          />
        ) : (
          <MobileStoryCard
            dark={dark}
            byline="James L.*"
            role="Owner — third-party logistics (3PL)"
            dealLine="$92M revenue · $15M EBITDA · Pacific Northwest · 11 yrs"
            body={
              <>
                <p>
                  James needed <strong style={{ color: headingC }}>$40M of growth capital</strong> for a fleet expansion and a regional acquisition. He had three offers and one nagging question: which one would let him keep the most of his company?
                </p>
                <p>
                  <strong>PE growth equity:</strong> $40M for 33% post-money at $80M pre. 1× participating preferred. 5-year exit horizon.
                </p>
                <p>
                  <strong>Senior + mezz blend:</strong> $25M senior at SOFR+450, $15M mezz at 12%+2% PIK. No dilution. PG on the senior.
                </p>
                <p>
                  Yulia modeled both against a 5-year exit at $250M (12.5× on $20M EBITDA after the expansion):
                </p>
                <p>
                  <strong style={{ color: pinkC }}>PE path:</strong> $140M to James (66.7% × $210M residual after the $40M liquidation pref).<br />
                  <strong style={{ color: pinkC }}>Debt-mezz path:</strong> $190M to James (after ~$60M debt payoff).
                </p>
                <p>
                  Delta: <strong style={{ color: pinkC }}>$50M.</strong> James took the debt-mezz blend. He still owns 100%.
                </p>
                <p className="italic" style={{ color: 'rgba(218,218,220,0.55)' }}>
                  Both paths fund the deal. Only one keeps the company.
                </p>
              </>
            }
          />
        )}
      </MobileSection>

      {/* KPI strip — varies by audience */}
      {audience === 'sponsor' ? (
        <MobileKpiStrip
          dark={dark}
          kpis={[
            { label: 'Total cap stack',  value: '$180M', sub: '5 layers, modeled in 1 afternoon' },
            { label: 'Year-1 DSCR',      value: '1.35×', sub: 'comfortable above 1.20× minimum' },
            { label: 'Time to close',    value: '4.5 mo', sub: 'vs 9-11 mo industry average' },
          ]}
        />
      ) : (
        <MobileKpiStrip
          dark={dark}
          kpis={[
            { label: 'PE path · 5-yr exit',     value: '$140M', sub: '66.7% × $210M residual' },
            { label: 'Debt-mezz path',          value: '$190M', sub: 'after ~$60M debt payoff' },
            { label: 'Capital preserved',       value: '+$50M', sub: 'and James still owns 100%' },
          ]}
        />
      )}

      {/* Stack builder */}
      <MobileSection
        dark={dark}
        eyebrow="The Stack · interactive"
        title="Drag the layers. Watch the math."
        sub="Five layers of capital. Move any slider, the others rebalance. Read-out shows your blended cost of capital, year-1 DSCR, and how much of the company you keep."
      >
        <StackBuilder dark={dark} audience={audience} ev={180} ebitda={20} />
      </MobileSection>

      {/* Slow vs Fast */}
      <MobileSection dark={dark} eyebrow="Conventional raise vs Yulia">
        <MobileSlowVsFast
          dark={dark}
          rows={[
            { label: 'Time to model the stack',           cold: '5-9 wks', prepared: '1 afternoon' },
            { label: 'Lender meetings before terms',      cold: '8-15',     prepared: '3-5' },
            { label: 'Stacks compared side by side',      cold: '1-2',      prepared: '7+' },
            { label: 'Time to close (sponsor first deal)', cold: '9-11 mo',  prepared: '4-5 mo' },
          ]}
          takeaway={
            <>
              Cap stacks die in the modeling phase. Yulia compresses modeling from weeks to hours. The deal you'd have walked away from is the deal you close.
            </>
          }
        />
      </MobileSection>

      {/* Sign-off chain */}
      <MobileSection dark={dark} eyebrow="Sign-off chain" title="Yulia routes the LP deck and term sheets.">
        <MobileSignOffChain
          dark={dark}
          intro={
            <>
              Ed didn't just model the cap stack. He closed it. Yulia drafted the LP pitch deck from the modeled stack, routed it to deal counsel, sent the structure deck to the senior bank and mezz fund in parallel, and tracked every term-sheet response.
            </>
          }
          steps={[
            { label: 'Draft',   text: 'Yulia drafts the LP pitch deck + structure memo from the modeled stack. Senior, unitranche, mezz, equity, rollover all itemized.' },
            { label: 'Route',   text: 'Routes the structure memo to deal counsel: "Verify the mezz warrant terms and the seller rollover mechanics."' },
            { label: 'Wait',    text: 'Holds the LP deck in review until counsel signs off. Comments inline. State machine advances on approval.' },
            { label: 'Execute', text: 'Sends structure deck to senior bank + mezz fund in parallel. Watermark, view tracking, term-sheet responses logged.' },
            { label: 'Log',     text: "Six months in, when LPs ask 'show me the deal narrative,' the chain of custody is in the database." },
          ]}
        />
      </MobileSection>
    </MobileJourneySheet>
  );
}
