/* ═══ StepCard — Numbered visual step ═══
   Number in terra circle + title + short description.
*/

interface StepCardProps {
  num: number;
  title: string;
  desc: string;
}

export default function StepCard({ num, title, desc }: StepCardProps) {
  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: 16,
      border: '1px solid rgba(26,26,24,0.08)',
      padding: 24,
      boxShadow: '0 2px 8px rgba(26,26,24,0.07)',
    }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: '#D4714E',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 15,
        fontWeight: 700,
        marginBottom: 14,
      }}>
        {num}
      </div>
      <div style={{
        fontSize: 16,
        fontWeight: 700,
        color: '#1A1A18',
        marginBottom: 8,
        letterSpacing: '-0.01em',
      }}>
        {title}
      </div>
      <div style={{
        fontSize: 14,
        lineHeight: 1.65,
        color: '#44403C',
      }}>
        {desc}
      </div>
    </div>
  );
}
