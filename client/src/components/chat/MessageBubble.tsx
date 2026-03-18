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
        <div style={{ maxWidth: '85%' }}>
          <div style={{
            padding: '10px 16px',
            background: '#F3F3F3',
            color: '#000',
            borderRadius: '18px 18px 4px 18px',
            fontSize: 15, lineHeight: 1.55, fontWeight: 500,
            fontFamily: "'Inter', system-ui, sans-serif",
            overflowWrap: 'break-word' as const,
          }}>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{message.content}</p>
          </div>
          <p style={{ fontSize: 10, color: '#999', margin: '4px 0 0', textAlign: 'right' }}>
            {formatTime(message.created_at)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 10 }}>
      {showAvatar && (
        <div style={{
          flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
          background: '#000', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, marginTop: 2,
        }}>
          Y
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className="home-yt [&_p]:m-0 [&_p]:mb-2 [&_p:last-child]:mb-0"
          style={{
            fontSize: 15, lineHeight: 1.6, fontWeight: 450,
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
    </div>
  );
}
