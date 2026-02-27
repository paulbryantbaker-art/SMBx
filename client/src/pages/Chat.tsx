import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useAppHeight } from '../hooks/useAppHeight';
import Sidebar, { type Conversation } from '../components/chat/Sidebar';
import MessageBubble, { type Message } from '../components/chat/MessageBubble';
import ChatDock from '../components/shared/ChatDock';
import TypingIndicator from '../components/chat/TypingIndicator';
import WalletBadge from '../components/chat/WalletBadge';
import GateProgress from '../components/chat/GateProgress';
import PaywallCard from '../components/chat/PaywallCard';
import DataRoom from '../components/chat/DataRoom';
import Canvas from '../components/chat/Canvas';
import ParticipantPanel from '../components/chat/ParticipantPanel';
import NotificationBell from '../components/chat/NotificationBell';
import { authHeaders, type User } from '../hooks/useAuth';

interface ChatProps {
  user: User;
  onLogout: () => void;
  initialConversationId?: number;
}

const JOURNEY_CARDS = [
  { id: 'sell', title: 'Sell My Business', description: "I'll value your business, prepare it for market, find qualified buyers, and guide you through closing.", prompt: 'I want to sell my business.' },
  { id: 'buy', title: 'Buy a Business', description: "I'll help you define your thesis, source targets, run diligence, and structure the deal.", prompt: 'I want to buy a business.' },
  { id: 'raise', title: 'Raise Capital', description: "I'll build your investor materials, model your cap table, and manage the outreach process.", prompt: 'I want to raise capital for my business.' },
  { id: 'pmi', title: 'Post-Acquisition', description: "I'll build your 100-day integration plan, track synergies, and stabilize operations.", prompt: 'I just acquired a business and need help with integration.' },
];

export default function Chat({ user, onLogout, initialConversationId }: ChatProps) {
  useAppHeight();
  const [, navigate] = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(initialConversationId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dataRoomOpen, setDataRoomOpen] = useState(false);
  const [viewingDeliverable, setViewingDeliverable] = useState<number | null>(null);
  const [activeDealId, setActiveDealId] = useState<number | null>(null);
  const [currentGate, setCurrentGate] = useState<string | undefined>();
  const [paywallData, setPaywallData] = useState<any | null>(null);
  const [showTransactions, setShowTransactions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/conversations', { headers: authHeaders() });
      if (res.ok) setConversations(await res.json());
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Load messages when conversation changes
  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    (async () => {
      try {
        const res = await fetch(`/api/chat/conversations/${activeId}/messages`, { headers: authHeaders() });
        if (res.ok) setMessages(await res.json());
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    })();
  }, [activeId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, sending]);

  // Create conversation
  const createConversation = async (): Promise<number | null> => {
    try {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ title: 'New conversation' }),
      });
      if (!res.ok) return null;
      const conv = await res.json();
      setConversations(prev => [conv, ...prev]);
      setActiveId(conv.id);
      setMessages([]);
      setSidebarOpen(false);
      return conv.id;
    } catch { return null; }
  };

  const handleNew = async () => { await createConversation(); };

  // Send message with SSE streaming via POST /api/chat/message
  const handleSend = async (content: string) => {
    // Optimistic user message
    const tempMsg: Message = { id: Date.now(), role: 'user', content, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);
    setSending(true);
    setStreamingText('');

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ message: content, conversationId: activeId }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || 'Request failed');
      }

      // Read SSE stream
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === 'text_delta') {
                // Streaming text chunk from Anthropic
                accumulated += parsed.text;
                setStreamingText(accumulated);
              } else if (parsed.type === 'message_stop') {
                // Stream complete — set conversationId if new
                if (parsed.conversationId && !activeId) {
                  setActiveId(parsed.conversationId);
                }
              } else if (parsed.type === 'error') {
                accumulated = parsed.error || 'Something went wrong.';
              }
            } catch {
              // ignore parse errors on partial chunks
            }
          }
        }
      }

      // Replace streaming text with final message
      setStreamingText('');
      if (accumulated) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant' as const,
          content: accumulated,
          created_at: new Date().toISOString(),
        }]);
      }

      loadConversations();
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Send error:', err);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant' as const,
          content: 'Something went wrong. Please try again.',
          created_at: new Date().toISOString(),
        }]);
      }
    } finally {
      setSending(false);
      setStreamingText('');
      abortRef.current = null;
    }
  };

  // Welcome screen with journey cards
  const showWelcome = messages.length === 0 && !sending;

  return (
    <div
      id="app-root"
      className="flex bg-cream"
      style={{ position: 'fixed', left: 0, right: 0, top: 0, height: '100%' }}
    >
      {sidebarOpen && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)] z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={`fixed md:relative z-50 md:z-auto transition-transform duration-200 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={(id) => { setActiveId(id); setSidebarOpen(false); }}
          onNew={handleNew}
          onClose={() => setSidebarOpen(false)}
          userName={user.display_name || user.email}
          onSignOut={onLogout}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-[#FAF8F4]">
        {/* Top bar */}
        <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-[#FAF8F4]" style={{ borderBottom: '1px solid #DDD9D1' }}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-transparent border-none cursor-pointer text-[#3D3B37] hover:bg-[rgba(212,113,78,.08)] hover:text-[#D4714E] transition-colors md:hidden"
              type="button"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
            <div className="text-[22px] font-extrabold tracking-[-0.03em] text-[#1A1A18] font-sans m-0">
              smb<span className="text-[#D4714E]">x</span>.ai
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/pipeline')}
              className="hidden sm:block px-3.5 py-2 rounded-lg bg-transparent border-none cursor-pointer text-sm font-semibold tracking-[-0.01em] text-[#3D3B37] hover:text-[#D4714E] transition-colors"
            >
              Pipeline
            </button>
            <button
              onClick={() => navigate('/intelligence')}
              className="hidden sm:block px-3.5 py-2 rounded-lg bg-transparent border-none cursor-pointer text-sm font-semibold tracking-[-0.01em] text-[#3D3B37] hover:text-[#D4714E] transition-colors"
            >
              Intel
            </button>
            <button
              onClick={() => navigate('/sourcing')}
              className="hidden lg:block px-3.5 py-2 rounded-lg bg-transparent border-none cursor-pointer text-sm font-semibold tracking-[-0.01em] text-[#3D3B37] hover:text-[#D4714E] transition-colors"
            >
              Sourcing
            </button>
            <button
              onClick={() => setDataRoomOpen(!dataRoomOpen)}
              className={`hidden sm:block px-3.5 py-2 rounded-lg border-none cursor-pointer text-sm font-semibold tracking-[-0.01em] transition-colors ${
                dataRoomOpen ? 'bg-transparent text-[#D4714E]' : 'bg-transparent text-[#3D3B37] hover:text-[#D4714E]'
              }`}
            >
              Data Room
            </button>
            <NotificationBell />
            <WalletBadge />
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center justify-center w-8 h-8 rounded-full text-sm transition-colors cursor-pointer border-0 bg-transparent text-[#6E6A63] hover:bg-[#F3F0EA] hover:text-[#1A1A18]"
              title="Settings"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </button>
          </div>
        </div>

        {/* Gate progress indicator */}
        <GateProgress dealId={activeDealId} currentGate={currentGate} />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4" style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
          <div className="max-w-[860px] w-full mx-auto space-y-4">
            {showWelcome && (
              <div className="py-12 px-2">
                <h2 className="text-[26px] font-extrabold tracking-[-0.03em] text-[#1A1A18] font-sans m-0 mb-2 text-center">
                  smb<span className="text-[#D4714E]">x</span>.ai
                </h2>
                <p className="text-base text-[#6E6A63] font-sans m-0 mb-8 text-center max-w-md mx-auto leading-relaxed">
                  I'm Yulia, your M&A advisor. I handle the entire process — from first conversation to closing. What are we working on?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-xl mx-auto">
                  {JOURNEY_CARDS.map(card => (
                    <button
                      key={card.id}
                      onClick={() => handleSend(card.prompt)}
                      className="text-left bg-white rounded-[20px] p-7 border-none cursor-pointer transition-all duration-200 hover:-translate-y-px"
                      style={{ boxShadow: '0 1px 4px rgba(26,26,24,.05)' }}
                      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(26,26,24,.07), 0 1px 2px rgba(26,26,24,.04)')}
                      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(26,26,24,.05)')}
                    >
                      <p className="text-[19px] font-bold text-[#1A1A18] font-sans m-0 mb-1">
                        {card.title}
                      </p>
                      <p className="text-[15px] text-[#3D3B37] font-sans m-0 leading-[1.55]">
                        {card.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(m => (
              <MessageBubble key={m.id} message={m} />
            ))}

            {/* Streaming assistant message */}
            {streamingText && (
              <MessageBubble
                message={{ id: -1, role: 'assistant', content: streamingText, created_at: new Date().toISOString() }}
              />
            )}

            {/* Paywall card */}
            {paywallData && activeDealId && (
              <PaywallCard
                paywall={paywallData}
                dealId={activeDealId}
                onUnlocked={(toGate, deliverableId) => {
                  setCurrentGate(toGate);
                  setPaywallData(null);
                  setMessages(prev => [...prev, {
                    id: Date.now() + 3,
                    role: 'assistant' as const,
                    content: deliverableId
                      ? `**Gate unlocked** — generating your deliverable now. This takes 30-60 seconds.`
                      : `**Gate unlocked** — advancing to the next phase. Let's continue.`,
                    created_at: new Date().toISOString(),
                    metadata: { type: 'gate_transition' },
                  }]);
                  // Auto-open canvas if deliverable was triggered
                  if (deliverableId) {
                    setDataRoomOpen(true);
                    setViewingDeliverable(deliverableId);
                  }
                }}
                onTopUp={() => {
                  // Trigger wallet top-up via the WalletBadge
                  const walletBtn = document.querySelector('[data-wallet-toggle]') as HTMLButtonElement;
                  if (walletBtn) walletBtn.click();
                }}
              />
            )}

            {sending && !streamingText && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <ChatDock onSend={handleSend} disabled={sending} />
      </div>

      {/* Right Panel: Canvas (deliverable open) or Data Room (list) */}
      {dataRoomOpen && (
        <div className="hidden md:flex flex-col border-l border-border bg-white shrink-0" style={{ width: viewingDeliverable ? '50%' : '18rem', maxWidth: viewingDeliverable ? '50%' : '18rem', transition: 'width .2s ease, max-width .2s ease' }}>
          {viewingDeliverable ? (
            <Canvas
              deliverableId={viewingDeliverable}
              onClose={() => setViewingDeliverable(null)}
            />
          ) : (
            <>
              <div className="px-4 py-3 border-b border-border shrink-0">
                <h2 className="text-sm font-semibold text-text-primary m-0">Data Room</h2>
                <p className="text-xs text-text-secondary m-0 mt-0.5">Documents & team</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                <DataRoom dealId={activeDealId} onViewDeliverable={setViewingDeliverable} />
                <div className="border-t border-border">
                  <ParticipantPanel dealId={activeDealId} />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Mobile: Data Room sheet (no deliverable selected) */}
      {dataRoomOpen && !viewingDeliverable && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col">
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)]" onClick={() => setDataRoomOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[70vh] flex flex-col shadow-xl z-10">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <div>
                <h2 className="text-sm font-semibold text-text-primary m-0">Data Room</h2>
                <p className="text-xs text-text-secondary m-0 mt-0.5">Your generated deliverables</p>
              </div>
              <button onClick={() => setDataRoomOpen(false)} className="w-7 h-7 rounded-full hover:bg-[#F3F0EA] flex items-center justify-center cursor-pointer border-0 bg-transparent">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <DataRoom dealId={activeDealId} onViewDeliverable={(id) => { setViewingDeliverable(id); setDataRoomOpen(false); }} />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Canvas: full-screen sheet */}
      {viewingDeliverable !== null && (
        <div className="fixed inset-0 z-50 bg-white md:hidden flex flex-col">
          <Canvas
            deliverableId={viewingDeliverable}
            onClose={() => setViewingDeliverable(null)}
          />
        </div>
      )}
    </div>
  );
}
