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
  /** Small monospace kicker shown above the title (e.g. "SELL · WALK-THROUGH"). */
  kicker?: string;
  /** Big Sora title shown at the top of the card. */
  title?: string;
  children: ReactNode;
}

export default function JourneyCanvas({ kicker, title, children }: Props) {
  return (
    <div
      className="journey-canvas-wrap"
      style={{
        position: 'absolute',
        top: 16, bottom: 16, right: 16,
        left: 'calc(var(--v4-tool-w, 56px) + 28px + var(--v4-chat-w, 380px) + 16px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        className="journey-canvas"
        style={{
          flex: 1,
          background: 'var(--v4-card)',
          border: '1px solid var(--v4-card-line)',
          borderRadius: 18,
          boxShadow: 'var(--v4-shadow-lg)',
          overflowY: 'auto',
          scrollBehavior: 'smooth',
        }}
      >
        {(kicker || title) && (
          <div
            style={{
              padding: '24px 32px 16px',
              borderBottom: '1px solid var(--v4-card-line)',
              position: 'sticky',
              top: 0,
              background: 'var(--v4-card)',
              zIndex: 2,
            }}
          >
            {kicker && (
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  color: 'var(--v4-mute)',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                {kicker}
              </div>
            )}
            {title && (
              <div
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 800,
                  fontSize: 22,
                  letterSpacing: '-0.02em',
                  color: 'var(--v4-ink)',
                }}
              >
                {title}
              </div>
            )}
          </div>
        )}
        <div style={{ padding: '32px 40px 48px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
