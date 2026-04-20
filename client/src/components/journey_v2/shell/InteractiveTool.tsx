/**
 * InteractiveTool — a prominent wrapper that signals "this is a tool
 * you can play with." Addresses Paul's 2026-04-20 note that the page
 * tools weren't reading as interactive — they looked like static
 * display cards.
 *
 * Usage:
 *   <InteractiveTool
 *     kicker="Try the add-back estimator"
 *     sub="Pick three things — see your hidden value in 3 seconds."
 *   >
 *     <AddBackEstimator />
 *   </InteractiveTool>
 *
 * Visual language:
 *   - Pulsing orange "TRY IT" badge top-left
 *   - Bold kicker + sub headline
 *   - Subtle animated border-glow (rose) that draws the eye
 *   - ↓ arrow pointing down into the tool
 */
import type { ReactNode } from 'react';

interface Props {
  kicker: string;
  sub?: string;
  children: ReactNode;
}

export default function InteractiveTool({ kicker, sub, children }: Props) {
  return (
    <div
      className="j-tool"
      style={{
        position: 'relative',
        marginTop: 22,
        padding: 2,
        borderRadius: 18,
        background: 'linear-gradient(120deg, #D44A78 0%, #E8A033 50%, #D44A78 100%)',
        backgroundSize: '200% 100%',
        animation: 'j-tool-shine 4s linear infinite',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: '22px 24px',
        }}
      >
        {/* TRY IT badge + kicker row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 6,
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#D44A78',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: 999,
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}>
            <span className="j-tool-dot" style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#fff',
              animation: 'j-tool-pulse 1.5s ease-in-out infinite',
            }} />
            Try it
          </div>
          <div style={{
            fontFamily: 'Sora, sans-serif',
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: '-0.015em',
            color: '#0A0A0B',
          }}>{kicker}</div>
        </div>
        {sub && (
          <div style={{
            fontSize: 13,
            lineHeight: 1.5,
            color: '#3A3A3E',
            marginBottom: 18,
          }}>
            {sub}
            <span style={{
              display: 'inline-block',
              marginLeft: 6,
              animation: 'j-tool-arrow 1.2s ease-in-out infinite',
            }}>↓</span>
          </div>
        )}
        {children}
      </div>
      <style>{`
        @keyframes j-tool-shine {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes j-tool-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes j-tool-arrow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(3px); }
        }
      `}</style>
    </div>
  );
}
