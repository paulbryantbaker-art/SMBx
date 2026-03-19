import { useState } from 'react';
import Markdown from 'react-markdown';
import type { AnonMessage } from '../../hooks/useAnonymousChat';
import { DELIVERABLE_LABELS } from '../chat/Canvas';

/* ─── Shortcut tools for the empty-state help area ─── */
const SHORTCUT_TOOLS = [
  { group: 'journey', label: 'Sell my business', desc: 'Valuation, packaging, buyer matching', fill: 'I want to sell my business — ' },
  { group: 'journey', label: 'Buy a business', desc: 'Thesis, sourcing, diligence, structuring', fill: 'I want to buy a business — ' },
  { group: 'tool', label: 'Business valuation', desc: 'Multi-methodology estimate', fill: 'I need a business valuation — I own a ' },
  { group: 'tool', label: 'SBA loan check', desc: 'Eligibility and DSCR analysis', fill: "Can this deal get SBA financing? I'm looking at a " },
  { group: 'tool', label: 'Capital structure', desc: 'SBA, seller note, equity, mezzanine', fill: 'Help me figure out financing for a ' },
  { group: 'tool', label: 'Search for a business', desc: 'Define criteria, evaluate opportunities', fill: "Help me find a business — I'm looking for " },
  { group: 'tool', label: 'Post-acquisition help', desc: '100-day plan, integration, synergies', fill: "I just acquired a business and need help with " },
] as const;

interface ChatMessagesProps {
  messages: AnonMessage[];
  streamingText: string;
  sending: boolean;
  activeTool?: string | null;
  error?: string | null;
  onRetry?: () => void;
  onOpenDeliverable?: (message: AnonMessage) => void;
  onShortcutClick?: (fill: string) => void;
  desktop?: boolean;
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

/* ─── Yulia label row (above message, not beside) ────────── */
function YuliaLabel() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
      <div style={{
        width: 20, height: 20, borderRadius: '50%',
        background: '#000', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 8, fontWeight: 700,
      }}>
        Y
      </div>
      <span style={{
        fontSize: 12, fontWeight: 700, color: '#000',
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        Yulia
      </span>
    </div>
  );
}

/* ─── Markdown prose styles (shared) ─────────────────────── */
const PROSE_CLASSES = [
  '[&_p]:m-0 [&_p]:mb-2 [&_p:last-child]:mb-0',
  '[&_ul]:mt-1 [&_ul]:mb-1.5 [&_ul]:pl-5 [&_ol]:mt-1 [&_ol]:mb-1.5 [&_ol]:pl-5 [&_li]:mb-0.5',
  '[&_strong]:font-bold',
  '[&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-2 [&_h1]:mt-3',
  '[&_h2]:text-base [&_h2]:font-bold [&_h2]:mb-1.5 [&_h2]:mt-2.5',
  '[&_h3]:text-sm [&_h3]:font-bold [&_h3]:mb-1 [&_h3]:mt-2',
  '[&_code]:bg-[rgba(0,0,0,0.05)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[13px]',
  '[&_pre]:bg-[#F5F5F5] [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:text-[13px]',
  '[&_blockquote]:border-l-2 [&_blockquote]:border-[#E0E0E0] [&_blockquote]:pl-3 [&_blockquote]:text-[#555] [&_blockquote]:italic',
  '[&_table]:w-full [&_table]:text-left [&_table]:text-sm',
  '[&_th]:px-2.5 [&_th]:py-1.5 [&_th]:font-bold [&_th]:border-b [&_th]:border-[rgba(0,0,0,0.08)]',
  '[&_td]:px-2.5 [&_td]:py-1.5 [&_td]:border-b [&_td]:border-[rgba(0,0,0,0.04)]',
  '[&_a]:text-[#000] [&_a]:underline [&_a]:underline-offset-2',
].join(' ');

export default function ChatMessages({ messages, streamingText, sending, activeTool, error, onRetry, onOpenDeliverable, onShortcutClick, desktop }: ChatMessagesProps) {
  const [helpExpanded, setHelpExpanded] = useState(false);

  /* Desktop label: tiny uppercase, muted — matches Stitch mockup */
  const Label = ({ text }: { text: string }) => (
    <p style={{
      fontSize: 10, fontWeight: 700, color: text === 'You' ? '#C96B4F' : '#94a3b8',
      textTransform: 'uppercase', letterSpacing: '0.15em',
      margin: '0 0 6px 0',
    }}>{text}</p>
  );

  const textStyle: React.CSSProperties = {
    fontSize: 14, lineHeight: 1.65, fontWeight: 400,
    color: desktop ? '#1e293b' : '#1A1A1A',
    userSelect: 'text', WebkitUserSelect: 'text', cursor: 'text',
    textAlign: desktop ? 'justify' : undefined,
  };

  const isEmpty = messages.length === 0 && !streamingText && !sending;

  return (
    <div style={{
      width: '100%',
      padding: desktop ? '24px 24px 128px 24px' : '12px 16px 128px 16px',
      fontFamily: "'Inter', system-ui, sans-serif",
      userSelect: 'text',
      WebkitUserSelect: 'text',
    } as React.CSSProperties}>

      {/* ─── Empty state: help area ─── */}
      {isEmpty && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: desktop ? 300 : 200, gap: 16, padding: '40px 20px' }}>
          <img src="/logo-smbx.png" alt="smbx.ai" draggable={false} style={{ height: 32, objectFit: 'contain', opacity: 0.3 }} />
          <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.4)', textAlign: 'center', margin: 0, lineHeight: 1.6, maxWidth: 360 }}>
            Drop any files here to upload, or just start typing to chat with Yulia.
          </p>

          {/* Expandable shortcuts */}
          <button
            onClick={() => setHelpExpanded(h => !h)}
            className="bg-transparent border-none cursor-pointer"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: '#C96B4F', fontFamily: 'inherit', padding: '4px 8px', borderRadius: 8 }}
            type="button"
          >
            Quick starts
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: helpExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {helpExpanded && (
            <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 4, animation: 'fadeIn 0.2s ease' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(0,0,0,0.3)', padding: '8px 12px 4px', marginTop: 4 }}>Journeys</div>
              {SHORTCUT_TOOLS.filter(t => t.group === 'journey').map(tool => (
                <button
                  key={tool.label}
                  onClick={() => onShortcutClick?.(tool.fill)}
                  className="bg-transparent border-none cursor-pointer"
                  style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '8px 12px', borderRadius: 10, fontFamily: 'inherit', textAlign: 'left', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  type="button"
                >
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#0D0D0D' }}>{tool.label}</span>
                  <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{tool.desc}</span>
                </button>
              ))}
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(0,0,0,0.3)', padding: '12px 12px 4px' }}>Tools</div>
              {SHORTCUT_TOOLS.filter(t => t.group === 'tool').map(tool => (
                <button
                  key={tool.label}
                  onClick={() => onShortcutClick?.(tool.fill)}
                  className="bg-transparent border-none cursor-pointer"
                  style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '8px 12px', borderRadius: 10, fontFamily: 'inherit', textAlign: 'left', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  type="button"
                >
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#0D0D0D' }}>{tool.label}</span>
                  <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{tool.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: desktop ? 40 : 20 }}>
        {messages.map((m, i) => {
          const isDeliverable = m.metadata?.type === 'deliverable';
          const deliverableType = m.metadata?.deliverableType as string | undefined;

          /* ─── Deliverable card ─────────────────────────── */
          if (isDeliverable && deliverableType) {
            return (
              <div key={m.id || i}>
                {desktop ? <Label text="Yulia AI" /> : <YuliaLabel />}
                <button
                  onClick={() => onOpenDeliverable?.(m)}
                  type="button"
                  style={{
                    width: '100%', textAlign: 'left', background: '#fff',
                    border: '1px solid rgba(0,0,0,0.06)', borderRadius: 12,
                    padding: '14px 16px', cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, background: '#F5F5F5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15, flexShrink: 0,
                    }}>
                      {DELIVERABLE_ICONS[deliverableType] || '\u{1F4C4}'}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#000', margin: '0 0 3px 0' }}>
                        {DELIVERABLE_LABELS[deliverableType] || 'Document Ready'}
                      </p>
                      <p style={{ fontSize: 12, color: '#6B6B6B', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                        {getDeliverableDescription(deliverableType)}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '4px 10px', borderRadius: 999, background: '#000',
                          color: '#fff', fontSize: 11, fontWeight: 600,
                        }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
                          </svg>
                          View Report
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#22C55E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Free</span>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            );
          }

          /* ─── User message ─────────────────────────────── */
          if (m.role === 'user') {
            /* Desktop: plain text with "You" label, no bubble */
            if (desktop) {
              return (
                <div key={m.id || i}>
                  <Label text="You" />
                  <div className={PROSE_CLASSES} style={textStyle}>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{m.content}</p>
                  </div>
                </div>
              );
            }
            /* Mobile: black pill, right-aligned */
            return (
              <div key={m.id || i} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{
                  maxWidth: '85%',
                  background: '#000', color: '#fff',
                  padding: '10px 14px',
                  borderRadius: '16px 16px 4px 16px',
                  fontSize: 14, lineHeight: 1.5, fontWeight: 450,
                }}>
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{m.content}</p>
                </div>
              </div>
            );
          }

          /* ─── Assistant message ─────────────────────────── */
          return (
            <div key={m.id || i}>
              {desktop ? <Label text="Yulia AI" /> : <YuliaLabel />}
              <div className={PROSE_CLASSES} style={textStyle}>
                <Markdown>{m.content}</Markdown>
              </div>
              {m.created_at && (
                <p style={{ fontSize: 10, color: '#AAA', margin: '3px 0 0' }}>
                  {formatTimestamp(m.created_at)}
                </p>
              )}
            </div>
          );
        })}

        {/* ─── Streaming message ─────────────────────────── */}
        {streamingText && (
          <div>
            {desktop ? <Label text="Yulia AI" /> : <YuliaLabel />}
            <div className={PROSE_CLASSES} style={textStyle}>
              <Markdown>{streamingText}</Markdown>
              <span style={{
                display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
                background: '#000', marginLeft: 3, verticalAlign: 'middle',
                animation: 'dotPulse 1.4s ease infinite',
              }} />
            </div>
          </div>
        )}

        {/* ─── Typing indicator ──────────────────────────── */}
        {sending && !streamingText && (
          <div>
            {desktop ? <Label text="Yulia AI" /> : <YuliaLabel />}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
              <div style={{ display: 'flex', gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#000', animation: 'dotPulse 1.4s ease infinite' }} />
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#000', animation: 'dotPulse 1.4s ease infinite 0.15s' }} />
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#000', animation: 'dotPulse 1.4s ease infinite 0.3s' }} />
              </div>
              {activeTool && (
                <span style={{ fontSize: 12, color: '#999', fontWeight: 500 }}>{activeTool}...</span>
              )}
            </div>
          </div>
        )}

        {/* ─── Error ─────────────────────────────────────── */}
        {error && !sending && (
          <div>
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: 10,
              padding: '10px 14px',
            }}>
              <p style={{ fontSize: 13, color: '#DC2626', margin: '0 0 4px' }}>{error}</p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  type="button"
                  style={{
                    fontSize: 12, fontWeight: 600, color: '#000',
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
