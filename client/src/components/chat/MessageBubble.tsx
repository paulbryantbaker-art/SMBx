import Markdown from 'react-markdown';

export interface Message {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
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
      <div className="flex justify-end">
        <div className="max-w-[82%]">
          <div
            className="bg-[#D4714E] text-white px-[18px] py-3.5 text-base leading-[1.5] break-words"
            style={{
              borderRadius: '20px 20px 6px 20px',
              boxShadow: '0 2px 8px rgba(212,113,78,.2)',
              fontFamily: "'Inter', system-ui, sans-serif",
              overflowWrap: 'break-word',
            }}
          >
            <p className="m-0 whitespace-pre-wrap">{message.content}</p>
          </div>
          <p className="text-[13px] text-[#A9A49C] mt-1 mb-0 text-right" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            {formatTime(message.created_at)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] min-w-0">
        {showAvatar && (
          <div
            className="w-8 h-8 rounded-full bg-[#D4714E] text-white text-xs font-bold flex items-center justify-center mb-2 shrink-0"
            style={{ boxShadow: '0 2px 6px rgba(212,113,78,.2)', fontFamily: "'Inter', system-ui, sans-serif" }}
          >
            Y
          </div>
        )}
        <div
          className="bg-white px-[18px] py-4 text-base leading-[1.65] font-medium home-yt overflow-hidden"
          style={{
            borderRadius: '20px',
            boxShadow: '0 1px 4px rgba(26,26,24,.05)',
            fontFamily: "'Inter', system-ui, sans-serif",
            overflowWrap: 'break-word',
          }}
        >
          <Markdown>{message.content}</Markdown>
        </div>
        <p className="text-[13px] text-[#A9A49C] mt-1 mb-0 text-left" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  );
}
