/* ═══ ComparisonBlock — Side-by-side comparison ═══
   Left panel: neutral (gray). Right panel: terra-tinted.
   Each side has a heading and a list of items with check/x marks.
*/

interface ComparisonSide {
  heading: string;
  items: string[];
}

interface ComparisonBlockProps {
  left: ComparisonSide;
  right: ComparisonSide;
}

export default function ComparisonBlock({ left, right }: ComparisonBlockProps) {
  return (
    <>
      <style>{`
        .cb-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(26,26,24,0.08);
          box-shadow: 0 2px 8px rgba(26,26,24,0.07);
        }
        @media (max-width: 640px) {
          .cb-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="cb-grid">
        {/* Left — neutral */}
        <div style={{
          background: '#F3F0EA',
          padding: 28,
        }}>
          <div style={{
            fontSize: 15,
            fontWeight: 700,
            color: '#6E6A63',
            marginBottom: 16,
            letterSpacing: '-0.01em',
          }}>
            {left.heading}
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {left.items.map((item, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.55, color: '#6E6A63' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A9A49C" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right — terra-tinted */}
        <div style={{
          background: '#FFF0EB',
          padding: 28,
        }}>
          <div style={{
            fontSize: 15,
            fontWeight: 700,
            color: '#D4714E',
            marginBottom: 16,
            letterSpacing: '-0.01em',
          }}>
            {right.heading}
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {right.items.map((item, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.55, color: '#1A1A18' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4714E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
