import { useEffect, useRef } from 'react';
import PublicChatMessage from './PublicChatMessage';
import PublicChatInput from './PublicChatInput';
import YuliaAvatar from './YuliaAvatar';
import type { AnonMessage } from '../../hooks/useAnonymousChat';

interface Props {
  messages: AnonMessage[];
  sending: boolean;
  streamingText: string;
  messagesRemaining: number;
  limitReached: boolean;
  error: string | null;
  onSend: (content: string) => void;
  onSignup?: () => void;
  placeholder?: string;
  className?: string;
}

export default function PublicChatView({
  messages,
  sending,
  streamingText,
  messagesRemaining,
  limitReached,
  error,
  onSend,
  onSignup,
  placeholder,
  className = '',
}: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, sending]);

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map(m => (
          <PublicChatMessage key={m.id} message={m} />
        ))}

        {/* Streaming message */}
        {streamingText && (
          <div className="flex items-start gap-2.5">
            <YuliaAvatar size={28} className="mt-0.5" />
            <div className="max-w-[80%] bg-white border border-[#E0DCD4] rounded-2xl rounded-bl-md px-4 py-3">
              <p className="text-[15px] font-sans text-[#1A1A18] leading-relaxed m-0 whitespace-pre-wrap">
                {streamingText}
              </p>
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {sending && !streamingText && (
          <div className="flex items-start gap-2.5">
            <YuliaAvatar size={28} className="mt-0.5" />
            <div className="bg-white border border-[#E0DCD4] rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5 items-center h-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9B9891] animate-[dotPulse_1s_ease-in-out_infinite]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#9B9891] animate-[dotPulse_1s_ease-in-out_infinite]" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#9B9891] animate-[dotPulse_1s_ease-in-out_infinite]" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Limit reached */}
        {limitReached && (
          <div className="flex items-start gap-2.5">
            <YuliaAvatar size={28} className="mt-0.5" />
            <div className="max-w-[80%] bg-[#FFF0EB] border border-[#DA7756]/20 rounded-2xl rounded-bl-md px-5 py-4">
              <p className="text-[15px] font-sans text-[#1A1A18] leading-relaxed m-0 mb-3">
                You&apos;ve used all your preview messages. Create a free account to continue our conversation &mdash; I&apos;ll pick up right where we left off.
              </p>
              {onSignup && (
                <button
                  onClick={onSignup}
                  className="bg-[#DA7756] text-white border-none rounded-full text-[14px] font-semibold px-6 py-2.5 cursor-pointer hover:bg-[#C4684A] transition-colors"
                >
                  Create free account &rarr;
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center">
            <p className="text-sm text-[#B91C1C] m-0">{error}</p>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input */}
      {!limitReached && (
        <div>
          <PublicChatInput
            onSend={onSend}
            disabled={sending}
            placeholder={placeholder}
            showAvatar={messages.length === 0}
          />
          {messages.length > 0 && messagesRemaining <= 3 && messagesRemaining > 0 && (
            <p className="text-xs text-[#9B9891] text-center mt-2 m-0">
              {messagesRemaining} preview message{messagesRemaining !== 1 ? 's' : ''} remaining
            </p>
          )}
        </div>
      )}
    </div>
  );
}
