import Markdown from 'react-markdown';

export interface Message {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

interface MessageBubbleProps {
  message: Message;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[80%]">
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-terra text-white'
              : 'bg-cream text-text-primary'
          }`}
        >
          {isUser ? (
            <p className="text-base font-[system-ui,sans-serif] leading-relaxed m-0 whitespace-pre-wrap">
              {message.content}
            </p>
          ) : (
            <div className="text-base font-[system-ui,sans-serif] leading-relaxed prose-sm [&_p]:m-0 [&_p+p]:mt-3 [&_strong]:font-semibold [&_code]:bg-[rgba(0,0,0,0.05)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_ul]:mt-2 [&_ul]:pl-5 [&_ol]:mt-2 [&_ol]:pl-5 [&_li]:mt-1">
              <Markdown>{message.content}</Markdown>
            </div>
          )}
        </div>
        <p className={`text-sm text-text-tertiary font-[system-ui,sans-serif] mt-1 mb-0 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  );
}
