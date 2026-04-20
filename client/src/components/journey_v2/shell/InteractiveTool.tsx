/**
 * InteractiveTool — a prominent wrapper that signals "this is a tool
 * you can play with." Redesigned 2026-04-20 per Paul's critique notes:
 * drop the decorative gradient shine + bouncing arrow (both read as
 * AI-slop). Replace with a substantive structure:
 *
 *   ┌─ DARK HEADER BAR ───────────────────────────────────┐
 *   │ ● TRY IT · <kicker>                   <counter> ↗   │
 *   ├─ ROSE LEFT ACCENT + WHITE BODY ──────────────────────┤
 *   │                                                       │
 *   │   <sub copy>                                          │
 *   │                                                       │
 *   │   <tool>                                              │
 *   │                                                       │
 *   └───────────────────────────────────────────────────────┘
 *
 * Commands from `.impeccable.md`: "rose gold functional only, never
 * decorative" + "no bounce, no elastic — this is finance."
 */
import type { ReactNode } from 'react';

interface Props {
  kicker: string;
  sub?: string;
  children: ReactNode;
  /** Optional right-side counter (e.g. "3 samples" or "60 SEC"). */
  tag?: string;
}

export default function InteractiveTool({ kicker, sub, children, tag }: Props) {
  return (
    <div
      className="j-tool"
      style={{
        position: 'relative',
        marginTop: 26,
        background: '#fff',
        border: '0.5px solid rgba(0,0,0,0.1)',
        borderLeft: '3px solid #D44A78',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(10,10,11,0.05), 0 1px 2px rgba(10,10,11,0.04)',
      }}
    >
      {/* Dark header bar — unmissable */}
      <div style={{
        background: '#0A0A0B',
        color: '#fff',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            background: '#D44A78',
            color: '#fff',
            padding: '5px 11px',
            borderRadius: 999,
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}>
            <span className="j-tool-dot" style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: '#fff',
              animation: 'j-tool-pulse 2s ease-in-out infinite',
            }} />
            Try it
          </span>
          <span style={{
            fontFamily: 'Sora, sans-serif',
            fontWeight: 700,
            fontSize: 14.5,
            letterSpacing: '-0.01em',
          }}>{kicker}</span>
        </div>
        {tag && (
          <span style={{
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            fontSize: 10,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            opacity: 0.55,
          }}>{tag}</span>
        )}
      </div>
      <div style={{ padding: '22px 24px' }}>
        {sub && (
          <div style={{
            fontSize: 13.5,
            lineHeight: 1.55,
            color: '#3A3A3E',
            marginBottom: 18,
          }}>{sub}</div>
        )}
        {children}
      </div>
      <style>{`
        @keyframes j-tool-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}
