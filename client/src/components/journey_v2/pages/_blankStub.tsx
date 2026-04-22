/**
 * _blankStub.tsx — shared empty-state for every retired journey page.
 *
 * The entire journey content library (8 desktop pages, 7 mobile pages,
 * handoff v3/v4 CSS, JourneyPrimitives, SectionNav, StarterChips,
 * LearnDrawer, MobileJourneySheet) was retired on 2026-04-22 after Paul
 * called the previous direction a dead end. Old files live in
 * `client/src/components/_retired/journey_v1/` for reference.
 *
 * This component wraps the same JourneyShell the old pages used so the
 * app chrome (left tool rail, chat column, canvas card) keeps rendering
 * while the new journey direction is built. The only content inside the
 * canvas is a quiet placeholder + a hint that users can still chat.
 */
import type { ReactNode } from 'react';
import type { DealTab } from '../deal-room';
import JourneyShell from '../shell/JourneyShell';

export interface BlankJourneyProps {
  active: DealTab;
  onSend: (text: string) => void;
  onStartFree: () => void;
  onNavigate: (d: DealTab) => void;
  onSignIn?: () => void;
}

interface Props extends BlankJourneyProps {
  title: string;
  kicker?: string;
  badge?: string;
  children?: ReactNode;
}

export default function BlankJourney({
  active, onSend, onStartFree, onNavigate, onSignIn,
  title, kicker, badge, children,
}: Props) {
  return (
    <JourneyShell
      active={active}
      onNavigate={onNavigate}
      onSignIn={onSignIn}
      onStartFree={onStartFree}
      canvasKicker={kicker ?? `smbx.ai / ${active}`}
      canvasTitle={title}
      canvasBadge={badge}
      chat={{
        title: 'Yulia',
        status: 'Ready',
        pswLogo: 'Y',
        pswName: 'Yulia',
        pswMeta: 'READY',
        script: {},
        opening:
          "Hi — I'm <strong>Yulia</strong>. The marketing pages are being rebuilt. Chat with me in the meantime — tell me what you're working on.",
        reply: "Tell me what you need.",
        chips: [] as const,
        placeholder: 'Tell Yulia what you need…',
        onSend,
      }}
    >
      <div
        style={{
          minHeight: 360,
          padding: '96px 32px',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center',
          fontFamily: 'Inter, system-ui, sans-serif',
          color: '#6B6B70',
        }}
      >
        <div style={{ maxWidth: 520 }}>
          <div
            style={{
              fontFamily: 'JetBrains Mono, ui-monospace, monospace',
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontWeight: 700,
              color: '#C7616F',
              marginBottom: 12,
            }}
          >
            Blank canvas
          </div>
          <h1
            style={{
              fontFamily: 'Sora, sans-serif',
              fontWeight: 800,
              fontSize: 44,
              letterSpacing: '-0.025em',
              lineHeight: 1.08,
              color: '#0A0A0B',
              margin: '0 0 14px',
            }}
          >
            {title}
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.55, margin: 0 }}>
            This page is being rebuilt from scratch. Chat with Yulia in the left column — she's fully operational while the new marketing content is in flight.
          </p>
          {children}
        </div>
      </div>
    </JourneyShell>
  );
}
