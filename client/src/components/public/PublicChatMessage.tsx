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
          maxWidth: '85%', padding: '10px 16px',
          background: '#F3F3F3', color: '#000',
          borderRadius: '18px 18px 4px 18px',
          fontSize: 15, lineHeight: 1.55, fontWeight: 500,
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{
        flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
        background: '#000', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, marginTop: 2,
      }}>
        Y
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className="[&_p]:m-0 [&_p+p]:mt-2 [&_strong]:font-semibold [&_code]:bg-[rgba(0,0,0,0.05)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[13px] [&_ul]:mt-1 [&_ul]:pl-5 [&_ol]:mt-1 [&_ol]:pl-5 [&_li]:mt-0.5"
          style={{
            fontSize: 15, lineHeight: 1.6, fontWeight: 450,
            color: '#1A1A1A',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          <Markdown>{message.content}</Markdown>
        </div>
      </div>
    </div>
  );
}
