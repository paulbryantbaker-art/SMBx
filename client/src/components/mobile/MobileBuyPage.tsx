/**
 * MobileBuyPage — Bracket form (Sprint 3).
 */

import { MobileJourneySheet } from './MobileJourneySheet';
import { MobileJourneyBracket } from './MobileJourneyBracket';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dark: boolean;
  onTalkToYulia: (prefill?: string) => void;
}

export function MobileBuyPage({ open, onOpenChange, dark, onTalkToYulia }: Props) {
  const pinkC = dark ? '#E8709A' : '#D44A78';
  const headingC = dark ? '#f9f9fc' : '#0f1012';

  return (
    <MobileJourneySheet
      open={open}
      onOpenChange={onOpenChange}
      dark={dark}
      eyebrow="Buy"
      topBarTitle="Buy a business"
      ctaLabel="Talk to Yulia"
      ctaSubLabel="Sharpen your thesis and start sourcing"
      onCTA={() =>
        onTalkToYulia(
          "I want to buy a business. My thesis: [industry / size / geography / criteria]."
        )
      }
    >
      <MobileJourneyBracket
        dark={dark}
        eyebrow="Buy"
        icon="shopping_cart"
        headline={
          <>
            Thesis first. <em className="not-italic" style={{ color: pinkC }}>Then the right deal.</em>
          </>
        }
        sub={
          <>
            Yulia helps you sharpen the thesis, source candidates that fit, and carry the deal through due diligence, LOI, and structuring — with the math ready the moment you need it.
          </>
        }
        callout={
          <>
            <strong style={{ color: pinkC }}>One funnel, end to end.</strong>{' '}
            Sourcing, valuation, DSCR checks, SBA eligibility, tax-impact modeling — in one conversation instead of <strong style={{ color: headingC }}>ten tabs</strong>.
          </>
        }
      />
    </MobileJourneySheet>
  );
}
