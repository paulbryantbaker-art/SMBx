/**
 * MobileHowItWorksPage — Bracket form (Sprint 3).
 */

import { MobileJourneySheet } from './MobileJourneySheet';
import { MobileJourneyBracket } from './MobileJourneyBracket';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dark: boolean;
  onTalkToYulia: (prefill?: string) => void;
}

export function MobileHowItWorksPage({ open, onOpenChange, dark, onTalkToYulia }: Props) {
  const pinkC = dark ? '#E8709A' : '#D44A78';
  const headingC = dark ? '#f9f9fc' : '#0f1012';

  return (
    <MobileJourneySheet
      open={open}
      onOpenChange={onOpenChange}
      dark={dark}
      eyebrow="How it works"
      topBarTitle="How smbx.ai works"
      ctaLabel="Talk to Yulia"
      ctaSubLabel="The fastest way to see it is to use it"
      onCTA={() => onTalkToYulia('Show me how Yulia works — walk me through your most powerful demo.')}
    >
      <MobileJourneyBracket
        dark={dark}
        eyebrow="How it works"
        icon="auto_awesome"
        headline={
          <>
            One conversation. <em className="not-italic" style={{ color: pinkC }}>Twenty-two gates.</em> The whole deal.
          </>
        }
        sub={
          <>
            Yulia carries your deal across every stage — sourcing, valuation, due diligence, structuring, closing — in a single conversation. No re-briefing every time. No tools that don't talk to each other.
          </>
        }
        callout={
          <>
            <strong style={{ color: pinkC }}>Six engines under one chat.</strong>{' '}
            Valuation, sourcing, DD, financing model, tax-impact, integration plan. All running together so the answer to "what's next?" already has the math behind it.
          </>
        }
      />
    </MobileJourneySheet>
  );
}
