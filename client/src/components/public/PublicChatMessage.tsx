import Markdown from 'react-markdown';
import type { AnonMessage } from '../../hooks/useAnonymousChat';

interface Props {
  message: AnonMessage;
}

export default function PublicChatMessage({ message }: Props) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{
          maxWidth: '85%',
          background: '#000', color: '#fff',
          padding: '12px 16px',
          borderRadius: '20px 20px 4px 20px',
          fontSize: 15, lineHeight: 1.55, fontWeight: 450,
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <div style={{
          width: 22, height: 22, borderRadius: '50%',
          background: '#000', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 700,
        }}>
          Y
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600, color: '#6B6B6B',
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          Yulia
        </span>
      </div>
      <div
        className="[&_p]:m-0 [&_p+p]:mt-2.5 [&_strong]:font-semibold [&_code]:bg-[rgba(0,0,0,0.05)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[13px] [&_ul]:mt-1.5 [&_ul]:pl-5 [&_ol]:mt-1.5 [&_ol]:pl-5 [&_li]:mt-0.5"
        style={{
          background: '#fff',
          border: '1px solid rgba(0,0,0,0.06)',
          borderRadius: '4px 16px 16px 16px',
          padding: '18px 18px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          fontSize: 15, lineHeight: 1.6, fontWeight: 400,
          color: '#1A1A1A',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        <Markdown>{message.content}</Markdown>
      </div>
    </div>
  );
}
