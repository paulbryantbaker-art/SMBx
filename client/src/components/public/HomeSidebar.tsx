import { useEffect, useState, useCallback } from 'react';
import { ALL_GATES, type GateDef } from '../../../../shared/gateRegistry';

interface DealData {
  journey_type?: string;
  business_name?: string;
  industry?: string;
  current_gate?: string;
  seven_factor_composite?: number;
  seven_factor_scores?: Record<string, number>;
}

interface ConversationEntry {
  sessionId: string;
  firstMessage: string;
  timestamp: string;
  data?: DealData;
}

interface HomeSidebarProps {
  open: boolean;
  onClose: () => void;
  onNewConversation: () => void;
  currentSessionId: string | null;
  messages: Array<{ role: string; content: string }>;
  sessionData: DealData | null;
}

const JOURNEY_LABELS: Record<string, { label: string; color: string }> = {
  sell: { label: 'SELL', color: '#D4714E' },
  buy: { label: 'BUY', color: '#4E8BD4' },
  raise: { label: 'RAISE', color: '#6B9E4E' },
  pmi: { label: 'PMI', color: '#9E6B4E' },
};

function getJourneyGatesForType(journeyType: string): GateDef[] {
  return ALL_GATES.filter(g => g.journey === journeyType);
}

function GateStepper({ journeyType, currentGate }: { journeyType: string; currentGate?: string }) {
  const gates = getJourneyGatesForType(journeyType);
  if (gates.length === 0) return null;

  // Determine current gate index
  const currentIdx = currentGate
    ? gates.findIndex(g => g.id === currentGate)
    : 0;

  return (
    <div className="mt-3 px-1">
      <div className="flex items-center gap-0">
        {gates.map((gate, i) => {
          const isCompleted = i < currentIdx;
          const isActive = i === currentIdx;
          const isFuture = i > currentIdx;

          return (
            <div key={gate.id} className="flex items-center flex-1 min-w-0">
              {/* Gate circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                    isCompleted
                      ? 'bg-[#D4714E] text-white'
                      : isActive
                        ? 'border-2 border-[#D4714E] text-[#D4714E]'
                        : 'border border-[#CCC8C0] text-[#A9A49C]'
                  }`}
                  style={isActive ? { animation: 'gatePulse 2s ease infinite' } : undefined}
                >
                  {isCompleted ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
                  ) : isFuture && !gate.free ? (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" /></svg>
                  ) : (
                    gate.id.replace(/[A-Z]+/, '')
                  )}
                </div>
                <span className={`text-[8px] mt-0.5 leading-tight text-center whitespace-nowrap ${isActive ? 'text-[#D4714E] font-semibold' : 'text-[#A9A49C]'}`}>
                  {gate.name}
                </span>
              </div>
              {/* Connector line */}
              {i < gates.length - 1 && (
                <div className={`flex-1 h-px mx-0.5 mt-[-10px] ${isCompleted ? 'bg-[#D4714E]' : 'bg-[#DDD9D1]'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function HomeSidebar({
  open,
  onClose,
  onNewConversation,
  currentSessionId,
  messages,
  sessionData,
}: HomeSidebarProps) {
  const [conversations, setConversations] = useState<ConversationEntry[]>([]);

  // Track current conversation
  useEffect(() => {
    if (!currentSessionId || messages.length === 0) return;

    const firstUserMsg = messages.find(m => m.role === 'user');
    if (!firstUserMsg) return;

    setConversations(prev => {
      const existing = prev.findIndex(c => c.sessionId === currentSessionId);
      const entry: ConversationEntry = {
        sessionId: currentSessionId,
        firstMessage: firstUserMsg.content,
        timestamp: new Date().toISOString(),
        data: sessionData || undefined,
      };

      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = entry;
        return updated;
      }
      return [entry, ...prev];
    });
  }, [currentSessionId, messages, sessionData]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  // Determine deal display info
  const dealName = sessionData?.business_name || sessionData?.industry || null;
  const journeyType = sessionData?.journey_type;
  const journeyInfo = journeyType ? JOURNEY_LABELS[journeyType] : null;
  const hasDeal = !!(dealName || journeyType);

  return (
    <>
      {/* Backdrop (mobile) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={handleBackdropClick}
        />
      )}

      {/* Sidebar panel */}
      <div
        className={`fixed top-0 left-0 h-full z-50 flex flex-col bg-[#FAF9F6] border-r border-[#DDD9D1] w-[280px] transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <span className="text-[22px] font-extrabold tracking-[-0.03em] text-[#1A1A18]">
            smb<span className="text-[#D4714E]">x</span>.ai
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center border-none bg-transparent text-[#6E6A63] cursor-pointer hover:bg-[#EBE7DF] transition-colors"
            type="button"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>

        {/* New Conversation */}
        <div className="px-3 py-2">
          <button
            onClick={() => { onNewConversation(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-[#DDD9D1] bg-white text-sm font-semibold text-[#1A1A18] cursor-pointer hover:bg-[#F3F0EA] transition-colors"
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New conversation
          </button>
        </div>

        {/* Active Deal */}
        {hasDeal && (
          <div className="mx-3 my-2 p-3 bg-white rounded-xl" style={{ boxShadow: '0 1px 3px rgba(26,26,24,.06)' }}>
            <div className="flex items-center gap-2 mb-1">
              {journeyInfo && (
                <span
                  className="text-[10px] font-bold tracking-[.08em] px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: journeyInfo.color }}
                >
                  {journeyInfo.label}
                </span>
              )}
              <span className="text-sm font-semibold text-[#1A1A18] truncate">
                {dealName || 'New Deal'}
              </span>
            </div>

            {sessionData?.seven_factor_composite !== undefined && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[11px] text-[#6E6A63]">Quality Score:</span>
                <span className="text-sm font-bold text-[#D4714E]">{sessionData.seven_factor_composite}/70</span>
              </div>
            )}

            {journeyType && (
              <GateStepper
                journeyType={journeyType}
                currentGate={sessionData?.current_gate || undefined}
              />
            )}
          </div>
        )}

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          {conversations.length > 0 && (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A9A49C] px-2 pt-3 pb-1 m-0">
              Recent
            </p>
          )}
          {conversations.map(c => (
            <button
              key={c.sessionId}
              className={`w-full text-left px-3 py-2 rounded-lg border-none cursor-pointer transition-colors mb-0.5 ${
                c.sessionId === currentSessionId
                  ? 'bg-[#EBE7DF] text-[#1A1A18]'
                  : 'bg-transparent text-[#4A4843] hover:bg-[#F3F0EA]'
              }`}
              style={{ fontFamily: 'inherit' }}
              type="button"
            >
              <span className="block text-sm truncate">{c.firstMessage.substring(0, 50)}</span>
              <span className="block text-[11px] text-[#A9A49C] mt-0.5">
                {new Date(c.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                {c.data?.industry ? ` · ${c.data.industry}` : ''}
              </span>
            </button>
          ))}
          {conversations.length === 0 && (
            <p className="text-sm text-[#A9A49C] text-center py-8 m-0">
              Start chatting to see<br />your conversations here
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#DDD9D1] px-4 py-3">
          <p className="text-[11px] text-[#A9A49C] m-0">
            Free preview · <a href="/signup" className="text-[#D4714E] font-semibold no-underline hover:underline">Sign up</a> for full access
          </p>
        </div>
      </div>
    </>
  );
}
