/**
 * MobileRaisePage — Bracket form (Sprint 3).
 */

import { MobileJourneySheet } from './MobileJourneySheet';
import { MobileJourneyBracket } from './MobileJourneyBracket';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dark: boolean;
  onTalkToYulia: (prefill?: string) => void;
}

export function MobileRaisePage({ open, onOpenChange, dark, onTalkToYulia }: Props) {
  const pinkC = dark ? '#E8709A' : '#D44A78';
  const headingC = dark ? '#f9f9fc' : '#0f1012';

  return (
    <MobileJourneySheet
      open={open}
      onOpenChange={onOpenChange}
      dark={dark}
      eyebrow="Raise"
      topBarTitle="Raise capital"
      ctaLabel="Talk to Yulia"
      ctaSubLabel="Build the package and start LP outreach"
      onCTA={() =>
        onTalkToYulia(
          "I need to raise capital for [a deal / a fund / a search]. Target raise size: $[X]M."
        )
      }
    >
      <MobileJourneyBracket
        dark={dark}
        eyebrow="Raise"
        icon="savings"
        headline={
          <>
            The package, the list, <em className="not-italic" style={{ color: pinkC }}>and the meetings.</em>
          </>
        }
        sub={
          <>
            Yulia builds your financial package, frames the investor materials, and helps you target the LPs and capital partners most likely to actually write a check at your stage.
          </>
        }
        callout={
          <>
            <strong style={{ color: pinkC }}>Most raises die in outreach.</strong>{' '}
            Yulia keeps the funnel moving — investor list, intro materials, follow-ups, term-sheet review — so your <strong style={{ color: headingC }}>process</strong> beats your competition's hustle.
          </>
        }
      />
    </MobileJourneySheet>
  );
}
