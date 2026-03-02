import Markdown from 'react-markdown';
import type { AnonMessage } from '../../hooks/useAnonymousChat';
import type { ViewState } from './Sidebar';

interface ChatMessagesProps {
  messages: AnonMessage[];
  streamingText: string;
  sending: boolean;
  onBack: () => void;
}

export default function ChatMessages({ messages, streamingText, sending, onBack }: ChatMessagesProps) {
  return (
    <div className="max-w-3xl mx-auto w-full px-4 pt-4 pb-8">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] font-medium text-[#4F5D75] hover:text-[#D4714E] bg-transparent border-none cursor-pointer transition-colors"
          style={{ fontFamily: 'inherit' }}
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Guide
        </button>
        <span className="text-[12px] text-[#9CA3AF] font-medium">Intelligence Engine Active</span>
      </div>

      {/* Messages */}
      <div className="space-y-6">
        {messages.map((m, i) => (
          <div key={m.id || i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start gap-3'}`}>
            {/* Yulia avatar */}
            {m.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#D4714E] text-white flex items-center justify-center text-[12px] font-bold mt-1">
                Y
              </div>
            )}

            {/* Bubble */}
            <div
              className={`max-w-[80%] px-4 py-3 ${
                m.role === 'user'
                  ? 'bg-gray-50 border border-gray-200 rounded-2xl rounded-tr-sm text-[#2D3142]'
                  : 'bg-white border border-gray-200 rounded-2xl rounded-tl-sm text-[#2D3142]'
              }`}
            >
              {m.role === 'user' ? (
                <p className="text-[15px] leading-relaxed m-0 whitespace-pre-wrap">{m.content}</p>
              ) : (
                <div className="text-[15px] leading-relaxed prose prose-sm max-w-none [&_p]:m-0 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:mt-1 [&_ol]:mt-1 [&_li]:mb-1 [&_strong]:font-semibold">
                  <Markdown>{m.content}</Markdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Streaming message */}
        {streamingText && (
          <div className="flex justify-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#D4714E] text-white flex items-center justify-center text-[12px] font-bold mt-1">
              Y
            </div>
            <div className="max-w-[80%] px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-tl-sm">
              <div className="text-[15px] leading-relaxed prose prose-sm max-w-none [&_p]:m-0 [&_p]:mb-3 [&_p:last-child]:mb-0">
                <Markdown>{streamingText}</Markdown>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#D4714E] animate-pulse ml-1 align-middle" />
              </div>
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {sending && !streamingText && (
          <div className="flex justify-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#D4714E] text-white flex items-center justify-center text-[12px] font-bold mt-1">
              Y
            </div>
            <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
