import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import Markdown from 'react-markdown';
import PublicChatInput from './PublicChatInput';
import YuliaAvatar from './YuliaAvatar';
import { useChatContext } from '../../contexts/ChatContext';

export default function MorphChatView() {
  const {
    messages,
    sending,
    streamingText,
    messagesRemaining,
    limitReached,
    error,
    sendMessage,
  } = useChatContext();
  const [, navigate] = useLocation();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, sending]);

  return (
    <div className="flex-1 flex flex-col max-w-[720px] w-full mx-auto px-5">
      {/* Messages area — scrollable */}
      <div className="flex-1 overflow-y-auto space-y-5 pt-6 pb-4">
        {messages.map(m => {
          const isUser = m.role === 'user';
          if (isUser) {
            return (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[75%] bg-[#1A1A18] text-white rounded-2xl rounded-br-[4px] px-[18px] py-[14px]">
                  <p className="text-sm font-sans leading-[1.55] m-0 whitespace-pre-wrap">
                    {m.content}
                  </p>
                </div>
              </div>
            );
          }
          return (
            <div key={m.id} className="flex items-start gap-3">
              <YuliaAvatar size={32} className="mt-0.5" />
              <div className="max-w-[75%] bg-[#FAF8F4] border border-[#E0DCD4] rounded-2xl rounded-bl-[4px] px-[18px] py-[14px]">
                <div className="text-sm font-sans text-[#1A1A18] leading-[1.55] [&_p]:m-0 [&_p+p]:mt-2.5 [&_strong]:font-semibold [&_code]:bg-[rgba(0,0,0,0.04)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_ul]:mt-2 [&_ul]:pl-5 [&_ol]:mt-2 [&_ol]:pl-5 [&_li]:mt-1">
                  <Markdown>{m.content}</Markdown>
                </div>
              </div>
            </div>
          );
        })}

        {/* Streaming message */}
        {streamingText && (
          <div className="flex items-start gap-3">
            <YuliaAvatar size={32} className="mt-0.5" />
            <div className="max-w-[75%] bg-[#FAF8F4] border border-[#E0DCD4] rounded-2xl rounded-bl-[4px] px-[18px] py-[14px]">
              <div className="text-sm font-sans text-[#1A1A18] leading-[1.55] [&_p]:m-0 [&_p+p]:mt-2.5 [&_strong]:font-semibold">
                <Markdown>{streamingText}</Markdown>
              </div>
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {sending && !streamingText && (
          <div className="flex items-start gap-3">
            <YuliaAvatar size={32} className="mt-0.5" />
            <div className="bg-[#FAF8F4] border border-[#E0DCD4] rounded-2xl rounded-bl-[4px] px-[18px] py-[14px]">
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
          <div className="flex items-start gap-3">
            <YuliaAvatar size={32} className="mt-0.5" />
            <div className="max-w-[75%] bg-[#FFF0EB] border border-[#DA7756]/20 rounded-2xl rounded-bl-[4px] px-5 py-4">
              <p className="text-sm font-sans text-[#1A1A18] leading-relaxed m-0 mb-3">
                You&apos;ve used all your preview messages. Create a free account to continue our conversation &mdash; I&apos;ll pick up right where we left off.
              </p>
              <button
                onClick={() => navigate('/signup')}
                className="bg-[#DA7756] text-white border-none rounded-full text-sm font-semibold px-6 py-2.5 cursor-pointer hover:bg-[#C4684A] transition-colors"
              >
                Create free account &rarr;
              </button>
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

      {/* Input — pinned at bottom */}
      {!limitReached && (
        <div className="pb-6 pt-2">
          <PublicChatInput
            onSend={sendMessage}
            disabled={sending}
            placeholder="Message Yulia..."
          />
          {messages.length > 0 && messagesRemaining <= 5 && messagesRemaining > 0 && (
            <p className="text-xs text-[#9B9891] text-center mt-2 m-0">
              {messagesRemaining} preview message{messagesRemaining !== 1 ? 's' : ''} remaining
            </p>
          )}
        </div>
      )}
    </div>
  );
}
