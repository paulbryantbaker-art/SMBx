import Markdown from 'react-markdown';
import type { AnonMessage } from '../../hooks/useAnonymousChat';

interface ChatMessagesProps {
  messages: AnonMessage[];
  streamingText: string;
  sending: boolean;
}

export default function ChatMessages({ messages, streamingText, sending }: ChatMessagesProps) {
  return (
    <div className="max-w-3xl mx-auto w-full px-4 pt-4 pb-32">
      {/* Messages */}
      <div className="space-y-8">
        {messages.map((m, i) => (
          <div key={m.id || i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start gap-4'}`}>
            {/* Yulia avatar — 56px circle with sparkle */}
            {m.role === 'assistant' && (
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#D4714E] text-white flex items-center justify-center text-[20px] mt-1" style={{ boxShadow: '0 2px 8px rgba(212,113,78,0.2)' }}>
                ✦
              </div>
            )}

            {/* Bubble */}
            <div
              className={`max-w-[80%] ${
                m.role === 'user'
                  ? 'bg-gray-50 border border-gray-200 rounded-[40px] rounded-tr-sm text-[#1A1A18]'
                  : 'bg-white border border-[#F3F4F6] rounded-[40px] rounded-tl-sm text-[#1A1A18]'
              }`}
              style={{ padding: '28px 36px' }}
            >
              {m.role === 'user' ? (
                <p className="text-[18px] md:text-[22px] font-medium leading-[1.6] m-0 whitespace-pre-wrap">{m.content}</p>
              ) : (
                <div className="text-[18px] md:text-[22px] font-medium leading-[1.6] prose prose-lg max-w-none [&_p]:m-0 [&_p]:mb-4 [&_p:last-child]:mb-0 [&_ul]:mt-2 [&_ol]:mt-2 [&_li]:mb-1.5 [&_strong]:font-bold">
                  <Markdown>{m.content}</Markdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Streaming message */}
        {streamingText && (
          <div className="flex justify-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#D4714E] text-white flex items-center justify-center text-[20px] mt-1" style={{ boxShadow: '0 2px 8px rgba(212,113,78,0.2)' }}>
              ✦
            </div>
            <div className="max-w-[80%] bg-white border border-[#F3F4F6] rounded-[40px] rounded-tl-sm" style={{ padding: '28px 36px' }}>
              <div className="text-[18px] md:text-[22px] font-medium leading-[1.6] prose prose-lg max-w-none [&_p]:m-0 [&_p]:mb-4 [&_p:last-child]:mb-0">
                <Markdown>{streamingText}</Markdown>
                <span className="inline-block w-2 h-2 rounded-full bg-[#D4714E] animate-pulse ml-1 align-middle" />
              </div>
            </div>
          </div>
        )}

        {/* Typing indicator — 3 terra dots */}
        {sending && !streamingText && (
          <div className="flex justify-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#D4714E] text-white flex items-center justify-center text-[20px] mt-1" style={{ boxShadow: '0 2px 8px rgba(212,113,78,0.2)' }}>
              ✦
            </div>
            <div className="bg-white border border-[#F3F4F6] rounded-[40px] rounded-tl-sm flex items-center" style={{ padding: '28px 36px' }}>
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-[#D4714E]" style={{ animation: 'dotPulse 1.4s ease infinite' }} />
                <span className="w-3 h-3 rounded-full bg-[#D4714E]" style={{ animation: 'dotPulse 1.4s ease infinite 0.15s' }} />
                <span className="w-3 h-3 rounded-full bg-[#D4714E]" style={{ animation: 'dotPulse 1.4s ease infinite 0.3s' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
