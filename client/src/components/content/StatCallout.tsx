/* ═══ StatCallout — Key metric highlight ═══
   Big terra number + label + optional description.
   Terra left border accent.
*/

interface StatCalloutProps {
  value: string;
  label: string;
  desc?: string;
}

export default function StatCallout({ value, label, desc }: StatCalloutProps) {
  return (
    <div style={{
      borderLeft: '3px solid #D4714E',
      padding: '16px 20px',
      background: '#FAF9F7',
      borderRadius: '0 12px 12px 0',
    }}>
      <div style={{
        fontSize: 28,
        fontWeight: 700,
        color: '#D4714E',
        letterSpacing: '-0.03em',
        lineHeight: 1.2,
        marginBottom: 4,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 14,
        fontWeight: 600,
        color: '#1A1A18',
        marginBottom: desc ? 4 : 0,
      }}>
        {label}
      </div>
      {desc && (
        <div style={{
          fontSize: 13,
          lineHeight: 1.55,
          color: '#6E6A63',
        }}>
          {desc}
        </div>
      )}
    </div>
  );
}
