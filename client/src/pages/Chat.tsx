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
import ResizeHandle from '../components/chat/ResizeHandle';
import CanvasShell from '../components/chat/CanvasShell';
import PipelinePanel from '../components/chat/PipelinePanel';
import IntelPanel from '../components/chat/IntelPanel';
import SourcingPanel from '../components/chat/SourcingPanel';
import SettingsPanel from '../components/chat/SettingsPanel';
import { authHeaders, type User } from '../hooks/useAuth';

interface ChatProps {
  user: User;
  onLogout: () => void;
  initialConversationId?: number;
}

type CanvasPanel = 'pipeline' | 'intel' | 'sourcing' | 'dataroom' | 'settings' | null;

const NAV_ITEMS: { key: Exclude<CanvasPanel, 'settings' | null>; label: string }[] = [
  { key: 'pipeline', label: 'Pipeline' },
  { key: 'intel', label: 'Intel' },
  { key: 'sourcing', label: 'Sourcing' },
  { key: 'dataroom', label: 'Data Room' },
];

const CANVAS_TITLES: Record<string, [string, string]> = {
  pipeline: ['Pipeline', 'active deals'],
  intel: ['Market Intelligence', 'industry data & reports'],
  sourcing: ['Deal Sourcing', 'buy theses & matches'],
  dataroom: ['Data Room', 'documents & deliverables'],
  settings: ['Settings', 'account & usage'],
};

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
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile only
  const [viewingDeliverable, setViewingDeliverable] = useState<number | null>(null);
  const [activeDealId, setActiveDealId] = useState<number | null>(null);
  const [currentGate, setCurrentGate] = useState<string | undefined>();
  const [paywallData, setPaywallData] = useState<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Canvas state — matches prototype exactly
  const [canvas, setCanvas] = useState<CanvasPanel>(null);
  const [canvasFS, setCanvasFS] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [canvasW, setCanvasW] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const closeCanvas = useCallback(() => {
    setCanvas(null);
    setCanvasFS(false);
    setCanvasW(null);
    setSidebarVisible(true);
    setViewingDeliverable(null);
  }, []);

  const toggleCanvas = useCallback((k: CanvasPanel) => {
    if (canvas === k) { closeCanvas(); return; }
    setCanvas(k);
    setCanvasFS(false);
    setCanvasW(null);
    setSidebarVisible(false);
    setViewingDeliverable(null);
    setSidebarOpen(false); // close mobile sidebar
  }, [canvas, closeCanvas]);

  const toggleFS = useCallback(() => {
    if (canvasFS) {
      setCanvasFS(false);
      // stay in split, sidebar stays hidden
    } else {
      setCanvasFS(true);
      setSidebarVisible(false);
    }
  }, [canvasFS]);

  const handleDrag = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    setCanvasW(Math.max(300, Math.min(r.right - clientX, r.width - 320)));
  }, []);

  // Canvas sizing — matches prototype
  const canvasStyle = (): React.CSSProperties => {
    if (canvasFS) return { flex: 1 };
    if (canvasW) return { width: canvasW, minWidth: 300, maxWidth: '75%', flexShrink: 0 };
    return { width: '42%', minWidth: 340, maxWidth: 560, flexShrink: 0 };
  };

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

  // Send message with SSE streaming
  const handleSend = async (content: string) => {
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
                accumulated += parsed.text;
                setStreamingText(accumulated);
              } else if (parsed.type === 'message_stop') {
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

  const showWelcome = messages.length === 0 && !sending;
  const hasCanvas = canvas !== null;
  const showDeliverableCanvas = viewingDeliverable !== null;
  const showCanvasPanel = hasCanvas || showDeliverableCanvas;

  // Canvas title
  const [cTitle, cSub] = showDeliverableCanvas
    ? ['Deliverable', 'generated document']
    : (canvas ? CANVAS_TITLES[canvas] || ['', ''] : ['', '']);

  // Canvas content renderer
  const renderCanvasContent = () => {
    if (showDeliverableCanvas) {
      return (
        <Canvas
          deliverableId={viewingDeliverable!}
          onClose={() => setViewingDeliverable(null)}
        />
      );
    }

    switch (canvas) {
      case 'pipeline':
        return (
          <PipelinePanel
            onOpenConversation={(convId) => { setActiveId(convId); closeCanvas(); }}
            onNewDeal={() => { closeCanvas(); }}
            isFullscreen={canvasFS}
          />
        );
      case 'intel':
        return <IntelPanel isFullscreen={canvasFS} />;
      case 'sourcing':
        return <SourcingPanel isFullscreen={canvasFS} />;
      case 'settings':
        return <SettingsPanel user={user} onLogout={onLogout} isFullscreen={canvasFS} />;
      case 'dataroom':
        return (
          <>
            <DataRoom dealId={activeDealId} onViewDeliverable={(id) => { setViewingDeliverable(id); }} />
            <div style={{ borderTop: '1px solid #DDD9D1' }}>
              <ParticipantPanel dealId={activeDealId} />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div
      id="app-root"
      ref={containerRef}
      className="flex bg-[#FAF8F4] font-sans"
      style={{ position: 'fixed', left: 0, right: 0, top: 0, height: '100%' }}
    >
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)] z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar — desktop: width-based collapse; mobile: fixed overlay */}
      <div className={`fixed md:relative z-50 md:z-auto transition-transform duration-200 ease-out md:transition-none md:transform-none ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={(id) => { setActiveId(id); setSidebarOpen(false); }}
          onNew={handleNew}
          onClose={() => setSidebarOpen(false)}
          userName={user.display_name || user.email}
          onSignOut={onLogout}
          visible={sidebarVisible}
        />
      </div>

      {/* Main column (topbar + chat/canvas below) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR — single logo lives here */}
        <div
          className="shrink-0 flex items-center justify-between bg-[#FAF8F4]"
          style={{ padding: '10px 20px', borderBottom: '1px solid #DDD9D1' }}
        >
          <div className="flex items-center gap-2.5">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center justify-center w-[34px] h-[34px] rounded-full bg-transparent border-none cursor-pointer text-[#3D3B37] hover:bg-[rgba(212,113,78,.08)] hover:text-[#D4714E] transition-colors md:hidden"
              type="button"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
            {/* Desktop: show sidebar toggle when sidebar is hidden */}
            {!sidebarVisible && (
              <button
                onClick={() => setSidebarVisible(true)}
                className="hidden md:flex items-center justify-center w-[34px] h-[34px] rounded-lg bg-transparent border-none cursor-pointer text-[#6E6A63]"
                type="button"
                title="Show sidebar"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" />
                </svg>
              </button>
            )}
            <div className="text-[22px] font-extrabold tracking-[-0.03em] text-[#1A1A18] font-sans">
              smb<span className="text-[#D4714E]">x</span>.ai
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            {/* Nav items */}
            {NAV_ITEMS.map(n => (
              <button
                key={n.key}
                onClick={() => toggleCanvas(n.key)}
                className={`hidden sm:block px-3.5 py-[7px] rounded-lg bg-transparent border-none cursor-pointer text-sm font-semibold tracking-[-0.01em] transition-colors relative ${
                  canvas === n.key ? 'text-[#D4714E]' : 'text-[#3D3B37] hover:text-[#D4714E]'
                }`}
              >
                {n.label}
                {/* Active dot indicator */}
                {canvas === n.key && (
                  <span
                    className="absolute left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#D4714E]"
                    style={{ bottom: 2 }}
                  />
                )}
              </button>
            ))}

            {/* Divider */}
            <div className="hidden sm:block w-px h-5 bg-[#DDD9D1] mx-1.5" />

            <NotificationBell />
            <WalletBadge />
            <button
              onClick={() => toggleCanvas('settings')}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm transition-colors cursor-pointer border-0 bg-transparent ${
                canvas === 'settings' ? 'text-[#D4714E]' : 'text-[#6E6A63] hover:bg-[#F3F0EA] hover:text-[#1A1A18]'
              }`}
              title="Settings"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </button>
          </div>
        </div>

        {/* Below topbar: chat + resize + canvas */}
        <div className="flex-1 flex min-h-0">
          {/* CHAT column — hidden when canvas is fullscreen */}
          {!canvasFS && (
            <div className="flex-1 flex flex-col" style={{ minWidth: 320 }}>
              {/* Gate progress indicator */}
              <GateProgress dealId={activeDealId} currentGate={currentGate} />

              {/* Messages */}
              <div className="flex-1 overflow-y-auto min-h-0 pt-4 pb-2" style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
                <div className="max-w-[860px] w-full mx-auto px-4 space-y-4">
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

                  {streamingText && (
                    <MessageBubble
                      message={{ id: -1, role: 'assistant', content: streamingText, created_at: new Date().toISOString() }}
                    />
                  )}

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
                        if (deliverableId) {
                          setCanvas('dataroom');
                          setSidebarVisible(false);
                          setViewingDeliverable(deliverableId);
                        }
                      }}
                      onTopUp={() => {
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
          )}

          {/* Resize handle — only when canvas open and not fullscreen */}
          {showCanvasPanel && !canvasFS && (
            <div className="hidden md:block">
              <ResizeHandle onDrag={handleDrag} />
            </div>
          )}

          {/* CANVAS panel — desktop */}
          {showCanvasPanel && (
            <div
              className="hidden md:flex flex-col"
              style={{
                ...canvasStyle(),
                borderLeft: canvasFS ? 'none' : '1px solid #DDD9D1',
                background: '#FAF8F4',
                transition: canvasW ? 'none' : 'all 0.25s ease',
              }}
            >
              {showDeliverableCanvas ? (
                <Canvas
                  deliverableId={viewingDeliverable!}
                  onClose={() => setViewingDeliverable(null)}
                />
              ) : (
                <CanvasShell
                  title={cTitle}
                  subtitle={cSub}
                  onClose={closeCanvas}
                  onFullscreen={toggleFS}
                  isFullscreen={canvasFS}
                >
                  {renderCanvasContent()}
                </CanvasShell>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Canvas panel as full-screen overlay */}
      {showCanvasPanel && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col" style={{ background: '#FAF8F4' }}>
          {showDeliverableCanvas ? (
            <Canvas
              deliverableId={viewingDeliverable!}
              onClose={() => setViewingDeliverable(null)}
            />
          ) : (
            <CanvasShell
              title={cTitle}
              subtitle={cSub}
              onClose={closeCanvas}
            >
              {renderCanvasContent()}
            </CanvasShell>
          )}
        </div>
      )}
    </div>
  );
}
