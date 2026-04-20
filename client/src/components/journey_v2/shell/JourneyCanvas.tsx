/**
 * JourneyCanvas — floating content card on the right, holds the journey
 * deal-steps. Matches V4Canvas shape but simpler (no breadcrumb pills,
 * no tab strip — journey is linear scroll).
 *
 * Positioned absolute to the right of the chat well using the shared
 * `--v4-tool-w` and `--v4-chat-w` CSS custom properties. Scrolls
 * vertically; the inner card has rounded corners + shadow matching the
 * v4 canvas.
 */
import type { ReactNode } from 'react';

interface Props {
  /** Unused — kept for call-site compatibility. Deal-step titles carry
      the page heading, so a second sticky header created double-H1 weird
      space under the hero. Paul flagged this 2026-04-20. */
  kicker?: string;
  title?: string;
  children: ReactNode;
}

export default function JourneyCanvas({ kicker, title, children }: Props) {
  void kicker; void title;
  return (
    <div
      className="journey-canvas v4-canvas"
      style={{
        position: 'absolute',
        top: 14, bottom: 14, right: 14,
        left: 'calc(var(--v4-tool-w, 56px) + 14px + var(--v4-chat-w, 380px) + 14px)',
        background: 'var(--v4-card)',
        border: '0.5px solid var(--v4-card-line)',
        borderRadius: 20,
        boxShadow: 'var(--v4-shadow-md)',
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollBehavior: 'smooth',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="dr-stage">
        {children}
      </div>
    </div>
  );
}
