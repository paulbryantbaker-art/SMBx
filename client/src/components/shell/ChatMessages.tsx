import Markdown from 'react-markdown';
import type { AnonMessage } from '../../hooks/useAnonymousChat';
import { DELIVERABLE_LABELS } from '../chat/Canvas';

interface ChatMessagesProps {
  messages: AnonMessage[];
  streamingText: string;
  sending: boolean;
  error?: string | null;
  onRetry?: () => void;
  onOpenDeliverable?: (message: AnonMessage) => void;
}

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch { return ''; }
}

const DELIVERABLE_ICONS: Record<string, string> = {
  value_readiness_report: '\u{1F4CA}',
  thesis_document: '\u{1F3AF}',
  sde_analysis: '\u{1F4B0}',
  valuation_report: '\u{1F4C8}',
  deal_screening_memo: '\u{1F4CB}',
  sba_financing_model: '\u{1F3E6}',
};

export default function ChatMessages({ messages, streamingText, sending, error, onRetry, onOpenDeliverable }: ChatMessagesProps) {
  return (
    <div className="max-w-3xl mx-auto w-full px-4 pt-4 pb-32">
      {/* Messages */}
      <div className="space-y-8">
        {messages.map((m, i) => {
          // Check if this is a deliverable message
          const isDeliverable = m.metadata?.type === 'deliverable';
          const deliverableType = m.metadata?.deliverableType as string | undefined;

          if (isDeliverable && deliverableType) {
            return (
              <div key={m.id || i} className="flex justify-start gap-4">
                {/* Yulia avatar */}
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#D4714E] text-white flex items-center justify-center text-[20px] mt-1" style={{ boxShadow: '0 2px 8px rgba(212,113,78,0.2)' }}>
                  ✦
                </div>

                {/* Deliverable card */}
                <div className="max-w-[80%]">
                  <button
                    onClick={() => onOpenDeliverable?.(m)}
                    className="w-full text-left bg-white border-2 border-[#D4714E]/20 rounded-2xl cursor-pointer hover:border-[#D4714E]/40 hover:shadow-md transition-all group"
                    style={{ padding: '20px 24px' }}
                    type="button"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FFF0EB] flex items-center justify-center text-lg shrink-0">
                        {DELIVERABLE_ICONS[deliverableType] || '\u{1F4C4}'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-bold text-[#1A1A18] m-0 mb-1">
                          {DELIVERABLE_LABELS[deliverableType] || 'Document Ready'}
                        </p>
                        <p className="text-[13px] text-[#6E6A63] m-0 mb-3 line-clamp-2">
                          {getDeliverableDescription(deliverableType)}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D4714E] text-white text-xs font-semibold group-hover:bg-[#BE6342] transition-colors">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
                            </svg>
                            View Report
                          </span>
                          <span className="text-[11px] font-semibold text-[#4ADE80] uppercase tracking-wide">Free</span>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            );
          }

          return (
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
                    ? 'bg-[#FFF0EB] rounded-[40px] rounded-tr-sm text-[#1A1A18]'
                    : 'bg-white border border-[#F3F4F6] rounded-[40px] rounded-tl-sm text-[#1A1A18]'
                }`}
                style={{ padding: '28px 36px', ...(m.role === 'user' ? { border: '1px solid rgba(212,113,78,0.18)' } : {}) }}
              >
                {m.role === 'user' ? (
                  <p className="text-[18px] md:text-[22px] font-medium leading-[1.6] m-0 whitespace-pre-wrap">{m.content}</p>
                ) : (
                  <div className="text-[18px] md:text-[22px] font-medium leading-[1.6] prose prose-lg max-w-none [&_p]:m-0 [&_p]:mb-4 [&_p:last-child]:mb-0 [&_ul]:mt-2 [&_ol]:mt-2 [&_li]:mb-1.5 [&_strong]:font-bold">
                    <Markdown>{m.content}</Markdown>
                  </div>
                )}
              </div>
              {m.created_at && (
                <p className={`text-[10px] text-[#A9A49C] mt-1 m-0 ${m.role === 'user' ? 'text-right' : 'ml-[72px]'}`}>
                  {formatTimestamp(m.created_at)}
                </p>
              )}
            </div>
          );
        })}

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

        {/* Error with retry */}
        {error && !sending && (
          <div className="flex justify-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-[20px] mt-1">
              !
            </div>
            <div className="max-w-[80%] bg-red-50 border border-red-200 rounded-2xl" style={{ padding: '16px 24px' }}>
              <p className="text-sm text-red-700 m-0 mb-2">{error}</p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="text-sm font-semibold text-[#D4714E] bg-transparent border-0 cursor-pointer hover:underline p-0"
                  type="button"
                >
                  Try again
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getDeliverableDescription(type: string): string {
  const descriptions: Record<string, string> = {
    value_readiness_report: 'Your personalized business assessment with value readiness score, preliminary valuation range, and 12-month improvement roadmap.',
    thesis_document: 'Your acquisition thesis with criteria, SBA financing snapshot, and platform match intelligence.',
    sde_analysis: 'Detailed SDE/EBITDA calculation with add-back schedule and preliminary value range estimate.',
    valuation_report: 'Full valuation with comparable transactions, quality score, and defensible multiple recommendation.',
    deal_screening_memo: 'Target evaluation with thesis fit, financial analysis, and risk assessment.',
    sba_financing_model: 'SBA 7(a) financing model with payment schedule, DSCR analysis, and equity requirements.',
  };
  return descriptions[type] || 'Your document is ready to view.';
}
