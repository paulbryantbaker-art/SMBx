import Markdown from 'react-markdown';
import type { AnonMessage } from '../../hooks/useAnonymousChat';
import { DELIVERABLE_LABELS } from '../chat/Canvas';

interface ChatMessagesProps {
  messages: AnonMessage[];
  streamingText: string;
  sending: boolean;
  activeTool?: string | null;
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

export default function ChatMessages({ messages, streamingText, sending, activeTool, error, onRetry, onOpenDeliverable }: ChatMessagesProps) {
  return (
    <div style={{ width: '100%', padding: '16px 16px 128px 16px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {messages.map((m, i) => {
          const isDeliverable = m.metadata?.type === 'deliverable';
          const deliverableType = m.metadata?.deliverableType as string | undefined;

          if (isDeliverable && deliverableType) {
            return (
              <div key={m.id || i} style={{ display: 'flex', justifyContent: 'flex-start', gap: '10px' }}>
                <div style={{
                  flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
                  background: '#000', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, marginTop: 2,
                }}>
                  Y
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <button
                    onClick={() => onOpenDeliverable?.(m)}
                    type="button"
                    style={{
                      width: '100%', textAlign: 'left', background: '#fff',
                      border: '1.5px solid #E0E0E0', borderRadius: 12,
                      padding: '14px 16px', cursor: 'pointer',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8, background: '#F5F5F5',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, flexShrink: 0,
                      }}>
                        {DELIVERABLE_ICONS[deliverableType] || '\u{1F4C4}'}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#000', margin: '0 0 4px 0' }}>
                          {DELIVERABLE_LABELS[deliverableType] || 'Document Ready'}
                        </p>
                        <p style={{ fontSize: 13, color: '#666', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                          {getDeliverableDescription(deliverableType)}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '5px 12px', borderRadius: 999, background: '#000',
                            color: '#fff', fontSize: 12, fontWeight: 600,
                          }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
                            </svg>
                            View Report
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#22C55E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Free</span>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            );
          }

          if (m.role === 'user') {
            return (
              <div key={m.id || i} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ maxWidth: '85%' }}>
                  <div style={{
                    padding: '10px 16px',
                    background: '#F3F3F3',
                    color: '#000',
                    borderRadius: '18px 18px 4px 18px',
                    fontSize: 15, lineHeight: 1.55, fontWeight: 500,
                  }}>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{m.content}</p>
                  </div>
                  {m.created_at && (
                    <p style={{ fontSize: 10, color: '#999', margin: '4px 0 0', textAlign: 'right' }}>
                      {formatTimestamp(m.created_at)}
                    </p>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div key={m.id || i} style={{ display: 'flex', justifyContent: 'flex-start', gap: 10 }}>
              <div style={{
                flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
                background: '#000', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, marginTop: 2,
              }}>
                Y
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  className="[&_p]:m-0 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mt-1 [&_ul]:mb-1 [&_ul]:pl-5 [&_ol]:mt-1 [&_ol]:mb-1 [&_ol]:pl-5 [&_li]:mb-0.5 [&_strong]:font-bold [&_code]:bg-[rgba(0,0,0,0.05)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[13px]"
                  style={{
                    fontSize: 15, lineHeight: 1.6, fontWeight: 450,
                    color: '#1A1A1A',
                  }}
                >
                  <Markdown>{m.content}</Markdown>
                </div>
                {m.created_at && (
                  <p style={{ fontSize: 10, color: '#999', margin: '4px 0 0' }}>
                    {formatTimestamp(m.created_at)}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Streaming message */}
        {streamingText && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 10 }}>
            <div style={{
              flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
              background: '#000', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, marginTop: 2,
            }}>
              Y
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                className="[&_p]:m-0 [&_p]:mb-2 [&_p:last-child]:mb-0"
                style={{ fontSize: 15, lineHeight: 1.6, fontWeight: 450, color: '#1A1A1A' }}
              >
                <Markdown>{streamingText}</Markdown>
                <span style={{
                  display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                  background: '#000', marginLeft: 4, verticalAlign: 'middle',
                  animation: 'dotPulse 1.4s ease infinite',
                }} />
              </div>
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {sending && !streamingText && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 10 }}>
            <div style={{
              flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
              background: '#000', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, marginTop: 2,
            }}>
              Y
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
              <div style={{ display: 'flex', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#000', animation: 'dotPulse 1.4s ease infinite' }} />
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#000', animation: 'dotPulse 1.4s ease infinite 0.15s' }} />
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#000', animation: 'dotPulse 1.4s ease infinite 0.3s' }} />
              </div>
              {activeTool && (
                <span style={{ fontSize: 13, color: '#999', fontWeight: 500 }}>{activeTool}...</span>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && !sending && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 10 }}>
            <div style={{
              flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
              background: '#FEE2E2', color: '#EF4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, marginTop: 2,
            }}>
              !
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, color: '#DC2626', margin: '0 0 6px' }}>{error}</p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  type="button"
                  style={{
                    fontSize: 13, fontWeight: 600, color: '#000',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: 0, textDecoration: 'underline',
                  }}
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
