/**
 * MobileAdvisorsPage — Bracket form (Sprint 3).
 */

import { MobileJourneySheet } from './MobileJourneySheet';
import { MobileJourneyBracket } from './MobileJourneyBracket';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dark: boolean;
  onTalkToYulia: (prefill?: string) => void;
}

export function MobileAdvisorsPage({ open, onOpenChange, dark, onTalkToYulia }: Props) {
  const pinkC = dark ? '#E8709A' : '#D44A78';
  const headingC = dark ? '#f9f9fc' : '#0f1012';

  return (
    <MobileJourneySheet
      open={open}
      onOpenChange={onOpenChange}
      dark={dark}
      eyebrow="Advisors"
      topBarTitle="For advisors"
      ctaLabel="Talk to Yulia"
      ctaSubLabel="Free for verified deal professionals"
      onCTA={() =>
        onTalkToYulia(
          "I'm an M&A advisor / broker / CPA / attorney. My practice focus: [sell-side / buy-side / both / specialty]."
        )
      }
    >
      <MobileJourneyBracket
        dark={dark}
        eyebrow="Advisors"
        icon="workspace_premium"
        headline={
          <>
            Carry <em className="not-italic" style={{ color: pinkC }}>3× the mandates</em> with the same team.
          </>
        }
        sub={
          <>
            Yulia handles the analytical lifting that used to take your associate a week — the Baseline, the buyer pool, the QoE prep, the LOI structure. You stay on relationships, where the fee actually comes from.
          </>
        }
        callout={
          <>
            <strong style={{ color: pinkC }}>Free, forever, for verified pros.</strong>{' '}
            Brokers, M&amp;A advisors, CPAs, attorneys — verified deal professionals get the full platform without a subscription. Bring your client list; the math is on us.
          </>
        }
      />
    </MobileJourneySheet>
  );
}
