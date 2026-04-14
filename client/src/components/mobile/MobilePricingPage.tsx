/**
 * MobilePricingPage — Bracket form (Sprint 3).
 */

import { MobileJourneySheet } from './MobileJourneySheet';
import { MobileJourneyBracket } from './MobileJourneyBracket';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dark: boolean;
  onTalkToYulia: (prefill?: string) => void;
}

export function MobilePricingPage({ open, onOpenChange, dark, onTalkToYulia }: Props) {
  const pinkC = dark ? '#E8709A' : '#D44A78';
  const headingC = dark ? '#f9f9fc' : '#0f1012';

  return (
    <MobileJourneySheet
      open={open}
      onOpenChange={onOpenChange}
      dark={dark}
      eyebrow="Pricing"
      topBarTitle="Pricing"
      ctaLabel="Talk to Yulia"
      ctaSubLabel="Free to start — Yulia tells you when to upgrade"
      onCTA={() => onTalkToYulia("What plan should I be on? Here's what I'm working on: ")}
    >
      <MobileJourneyBracket
        dark={dark}
        eyebrow="Pricing"
        icon="payments"
        headline={
          <>
            Start free. <em className="not-italic" style={{ color: pinkC }}>Pay when you ship.</em>
          </>
        }
        sub={
          <>
            Unlimited chat with Yulia is free. One free deliverable per account — Baseline, deal screening memo, valuation, your call. Subscriptions kick in only when you're using us as a tool, not just trying us.
          </>
        }
        callout={
          <>
            <strong style={{ color: pinkC }}>Free</strong> · unlimited Yulia chat + 1 deliverable.{' '}
            <strong style={{ color: headingC }}>$49 Single deal</strong>.{' '}
            <strong style={{ color: headingC }}>$199 Multi-deal</strong> (most chosen).{' '}
            <strong style={{ color: headingC }}>$399 Team</strong> · 5 seats.{' '}
            <strong style={{ color: headingC }}>$1,999 Firm</strong> · unlimited seats + SSO.{' '}
            <strong style={{ color: headingC }}>$6,999 Institutional</strong> · API + SLA.
          </>
        }
      />
    </MobileJourneySheet>
  );
}
