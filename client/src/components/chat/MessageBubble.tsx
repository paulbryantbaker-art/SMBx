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
      <div className="flex justify-end">
        <div className="max-w-[82%]">
          <div
            className="bg-[#FFF0EB] text-[#1A1A18] px-[18px] py-3.5 text-base leading-[1.5] break-words border border-[rgba(212,113,78,0.2)]"
            style={{
              borderRadius: '20px 20px 6px 20px',
              overflowWrap: 'break-word',
            }}
          >
            <p className="m-0 whitespace-pre-wrap">{message.content}</p>
          </div>
          <p className="text-[13px] text-[#A9A49C] mt-1 mb-0 text-right font-sans">
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
            className="w-8 h-8 rounded-full bg-[#D4714E] text-white text-xs font-bold flex items-center justify-center mb-2 shrink-0 font-sans"
            style={{ boxShadow: '0 2px 6px rgba(212,113,78,.2)' }}
          >
            Y
          </div>
        )}
        <div
          className="bg-white px-[18px] py-4 text-base leading-[1.65] font-medium home-yt overflow-hidden"
          style={{
            borderRadius: '20px',
            boxShadow: '0 1px 4px rgba(26,26,24,.05)',
            overflowWrap: 'break-word',
          }}
        >
          <Markdown>{message.content}</Markdown>
        </div>
        <p className="text-[13px] text-[#A9A49C] mt-1 mb-0 text-left font-sans">
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  );
}
