import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import Markdown from 'react-markdown';
import YuliaAvatar from '../public/YuliaAvatar';
import ChatDock from '../shared/ChatDock';
import { useChatContext } from '../../context/ChatContext';

const PLACEHOLDER_MAP: Record<string, string> = {
  '/sell': 'Tell Yulia about your business...',
  '/buy': 'Tell Yulia what you\'re looking for...',
  '/raise': 'Tell Yulia about your raise...',
  '/integrate': 'Tell Yulia about your acquisition...',
};

export default function ChatView() {
  const {
    messages,
    isStreaming,
    streamingContent,
    error,
    sourcePage,
    sendMessage,
  } = useChatContext();
  const [, navigate] = useLocation();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, isStreaming]);

  return (
    <div className="flex-1 flex flex-col min-h-0 max-w-[720px] w-full mx-auto px-5">
      {/* Messages — scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-5 pt-6 pb-4">
        {messages.map(m => {
          if (m.role === 'user') {
            return (
              <div key={m.id} className="flex justify-end">
                <div
                  className="max-w-[75%] rounded-2xl rounded-br-[4px] px-[18px] py-[14px]"
                  style={{ background: '#FFF0EB', border: '1px solid rgba(212,113,78,0.22)', color: '#1A1A18', boxShadow: '0 2px 8px rgba(26,26,24,0.08), 0 0 0 1px rgba(212,113,78,0.06)' }}
                >
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
              <div
                className="max-w-[75%] bg-white px-4 py-3"
                style={{ borderRadius: '18px 18px 18px 4px', border: '1px solid rgba(224,220,212,0.6)', boxShadow: '0 1px 4px rgba(26,26,24,0.04)' }}
              >
                <div className="text-sm font-sans text-[#1A1A18] leading-[1.55] [&_p]:m-0 [&_p+p]:mt-2.5 [&_strong]:font-semibold [&_code]:bg-[rgba(0,0,0,0.04)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_ul]:mt-2 [&_ul]:pl-5 [&_ol]:mt-2 [&_ol]:pl-5 [&_li]:mt-1">
                  <Markdown>{m.content}</Markdown>
                </div>
              </div>
            </div>
          );
        })}

        {/* Streaming */}
        {streamingContent && (
          <div className="flex items-start gap-3">
            <YuliaAvatar size={32} className="mt-0.5" />
            <div
              className="max-w-[75%] bg-white px-4 py-3"
              style={{ borderRadius: '18px 18px 18px 4px', border: '1px solid rgba(224,220,212,0.6)', boxShadow: '0 1px 4px rgba(26,26,24,0.04)' }}
            >
              <div className="text-sm font-sans text-[#1A1A18] leading-[1.55] [&_p]:m-0 [&_p+p]:mt-2.5 [&_strong]:font-semibold">
                <Markdown>{streamingContent}</Markdown>
              </div>
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {isStreaming && !streamingContent && (
          <div className="flex items-start gap-3">
            <YuliaAvatar size={32} className="mt-0.5" />
            <div className="bg-white px-4 py-3" style={{ borderRadius: '18px 18px 18px 4px', border: '1px solid rgba(224,220,212,0.6)', boxShadow: '0 1px 4px rgba(26,26,24,0.04)' }}>
              <div className="flex gap-1.5 items-center h-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9B9891] animate-[dotPulse_1s_ease-in-out_infinite]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#9B9891] animate-[dotPulse_1s_ease-in-out_infinite]" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#9B9891] animate-[dotPulse_1s_ease-in-out_infinite]" style={{ animationDelay: '300ms' }} />
              </div>
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

      {/* Input — pinned at bottom (shared ChatDock) */}
      <div className="shrink-0 pb-2">
        <ChatDock
          onSend={(text) => sendMessage(text)}
          disabled={isStreaming}
          placeholder={PLACEHOLDER_MAP[sourcePage] || 'Message Yulia...'}
        />
      </div>
    </div>
  );
}
