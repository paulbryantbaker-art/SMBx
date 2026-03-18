import Markdown from 'react-markdown';

export interface Message {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  metadata?: Record<string, any>;
}

interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function MessageBubble({ message, showAvatar = true }: MessageBubbleProps) {
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
          overflowWrap: 'break-word' as const,
        }}>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {showAvatar && (
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
      )}
      <div
        className="home-yt [&_p]:m-0 [&_p]:mb-2.5 [&_p:last-child]:mb-0 [&_strong]:font-bold"
        style={{
          background: '#fff',
          border: '1px solid rgba(0,0,0,0.06)',
          borderRadius: '4px 16px 16px 16px',
          padding: '18px 18px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          fontSize: 15, lineHeight: 1.6, fontWeight: 400,
          color: '#1A1A1A',
          fontFamily: "'Inter', system-ui, sans-serif",
          overflowWrap: 'break-word' as const,
        }}
      >
        <Markdown>{message.content}</Markdown>
      </div>
      <p style={{ fontSize: 10, color: '#999', margin: '4px 0 0' }}>
        {formatTime(message.created_at)}
      </p>
    </div>
  );
}
