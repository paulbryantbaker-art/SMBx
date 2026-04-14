/**
 * MobileSellPage — Bracket form (Sprint 3).
 *
 * Replaces the editorial multi-section layout with a single-screen hero
 * + Talk-to-Yulia CTA. Rich content (Multiple Map, Baseline calculator,
 * Sarah story) lives on desktop; mobile compresses for iOS coherence
 * with DealStack + chat.
 */

import { MobileJourneySheet } from './MobileJourneySheet';
import { MobileJourneyBracket } from './MobileJourneyBracket';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dark: boolean;
  onTalkToYulia: (prefill?: string) => void;
}

export function MobileSellPage({ open, onOpenChange, dark, onTalkToYulia }: Props) {
  const pinkC = dark ? '#E8709A' : '#D44A78';
  const headingC = dark ? '#f9f9fc' : '#0f1012';

  return (
    <MobileJourneySheet
      open={open}
      onOpenChange={onOpenChange}
      dark={dark}
      eyebrow="Sell"
      topBarTitle="Sell a business"
      ctaLabel="Talk to Yulia"
      ctaSubLabel="She'll run a Baseline and guide the sale"
      onCTA={() =>
        onTalkToYulia(
          "I want to sell my business. It's in [industry] with about $[X]M in revenue and $[Y]M EBITDA."
        )
      }
    >
      <MobileJourneyBracket
        dark={dark}
        eyebrow="Sell"
        icon="sell"
        headline={
          <>
            Walk in with the <em className="not-italic" style={{ color: pinkC }}>number.</em> Win the mandate.
          </>
        }
        sub={
          <>
            Yulia runs a defensible valuation Baseline in minutes — the same math the buyer's investment bank will run. You show up to pitch with a number owners can trust, not a range you hedge.
          </>
        }
        callout={
          <>
            <strong style={{ color: pinkC }}>$155M Baseline · 90 seconds.</strong>{' '}
            Sarah's seller thought $90M. She walked in with the number and won the mandate — closed at <strong style={{ color: headingC }}>$154.8M</strong>, fee <strong style={{ color: headingC }}>$2.7M</strong>.
          </>
        }
      />
    </MobileJourneySheet>
  );
}
