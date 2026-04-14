/**
 * MobileIntegratePage — Bracket form (Sprint 3).
 */

import { MobileJourneySheet } from './MobileJourneySheet';
import { MobileJourneyBracket } from './MobileJourneyBracket';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dark: boolean;
  onTalkToYulia: (prefill?: string) => void;
}

export function MobileIntegratePage({ open, onOpenChange, dark, onTalkToYulia }: Props) {
  const pinkC = dark ? '#E8709A' : '#D44A78';
  const headingC = dark ? '#f9f9fc' : '#0f1012';

  return (
    <MobileJourneySheet
      open={open}
      onOpenChange={onOpenChange}
      dark={dark}
      eyebrow="Integrate"
      topBarTitle="Just closed"
      ctaLabel="Talk to Yulia"
      ctaSubLabel="Get your 100-day plan running"
      onCTA={() =>
        onTalkToYulia(
          "I just closed an acquisition. The business is in [industry] with about $[X]M revenue. I need to start integration."
        )
      }
    >
      <MobileJourneyBracket
        dark={dark}
        eyebrow="Integrate"
        icon="merge"
        headline={
          <>
            Day&nbsp;0 to Day&nbsp;100 <em className="not-italic" style={{ color: pinkC }}>without the chaos.</em>
          </>
        }
        sub={
          <>
            Most acquisitions die in the first six months — not because the deal was wrong, but because nobody owned the integration plan. Yulia keeps the day-by-day moving so synergies actually land.
          </>
        }
        callout={
          <>
            <strong style={{ color: pinkC }}>The 7 mistakes that kill PMI.</strong>{' '}
            Customer attrition. Key-person flight. Comms vacuum. IT collisions. Yulia flags each one before it bites — with your <strong style={{ color: headingC }}>specific</strong> deal context.
          </>
        }
      />
    </MobileJourneySheet>
  );
}
