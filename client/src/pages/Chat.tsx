import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import Sidebar, { type Conversation } from '../components/chat/Sidebar';
import MessageBubble, { type Message } from '../components/chat/MessageBubble';
import ChatDock from '../components/shared/ChatDock';
import TypingIndicator from '../components/chat/TypingIndicator';

import GateProgress from '../components/chat/GateProgress';
import PaywallCard from '../components/chat/PaywallCard';
import DataRoom from '../components/chat/DataRoom';
import Canvas from '../components/chat/Canvas';
import ParticipantPanel from '../components/chat/ParticipantPanel';
import NotificationBell from '../components/chat/NotificationBell';
import ResizeHandle from '../components/chat/ResizeHandle';
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

// ─── Tab System ─────────────────────────────────────────────────────

interface CanvasTab {
  id: string;
  type: string;       // 'pipeline' | 'intel' | 'sourcing' | 'dataroom' | 'settings' | 'deliverable'
  label: string;
  icon: string;       // material symbol name or svg key
  closable: boolean;
  props?: Record<string, any>;
}

const TAB_REGISTRY: Record<string, { label: string; icon: string }> = {
  pipeline: { label: 'Pipeline', icon: 'monitoring' },
  intel: { label: 'Intel', icon: 'insights' },
  sourcing: { label: 'Sourcing', icon: 'search' },
  dataroom: { label: 'Data Room', icon: 'folder_open' },
  settings: { label: 'Settings', icon: 'settings' },
};

const NAV_ITEMS: { key: string; label: string }[] = [
  { key: 'pipeline', label: 'Pipeline' },
  { key: 'intel', label: 'Intel' },
  { key: 'sourcing', label: 'Sourcing' },
  { key: 'dataroom', label: 'Data Room' },
];

const JOURNEY_CARDS = [
  { id: 'sell', title: 'Sell My Business', description: "I'll value your business, prepare it for market, find qualified buyers, and guide you through closing.", prompt: 'I want to sell my business.' },
  { id: 'buy', title: 'Buy a Business', description: "I'll help you define your thesis, source targets, run diligence, and structure the deal.", prompt: 'I want to buy a business.' },
  { id: 'raise', title: 'Raise Capital', description: "I'll build your investor materials, model your cap table, and manage the outreach process.", prompt: 'I want to raise capital for my business.' },
  { id: 'pmi', title: 'Post-Acquisition', description: "I'll build your 100-day integration plan, track synergies, and stabilize operations.", prompt: 'I just acquired a business and need help with integration.' },
];

export default function Chat({ user, onLogout, initialConversationId }: ChatProps) {
  const [, navigate] = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(initialConversationId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeDealId, setActiveDealId] = useState<number | null>(null);
  const [currentGate, setCurrentGate] = useState<string | undefined>();
  const [paywallData, setPaywallData] = useState<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ─── Tabbed Canvas State ────────────────────────────────────────
  const [tabs, setTabs] = useState<CanvasTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [canvasFS, setCanvasFS] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [canvasW, setCanvasW] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeTab = tabs.find(t => t.id === activeTabId) || null;
  const hasTabs = tabs.length > 0;

  // Open a tab (or switch to existing)
  const openTab = useCallback((type: string, props?: Record<string, any>) => {
    const reg = TAB_REGISTRY[type];

    // For deliverables, always create a new tab (each deliverable is unique)
    if (type === 'deliverable' && props?.deliverableId) {
      const tabId = `deliverable-${props.deliverableId}`;
      setTabs(prev => {
        const existing = prev.find(t => t.id === tabId);
        if (existing) {
          setActiveTabId(tabId);
          return prev;
        }
        return [...prev, {
          id: tabId,
          type: 'deliverable',
          label: props.label || 'Document',
          icon: 'description',
          closable: true,
          props,
        }];
      });
      setActiveTabId(tabId);
    } else {
      // For panel types, reuse existing tab
      const tabId = type;
      setTabs(prev => {
        const existing = prev.find(t => t.id === tabId);
        if (existing) {
          setActiveTabId(tabId);
          return prev;
        }
        return [...prev, {
          id: tabId,
          type,
          label: reg?.label || type,
          icon: reg?.icon || 'tab',
          closable: true,
          props,
        }];
      });
      setActiveTabId(tabId);
    }

    setSidebarVisible(false);
    setSidebarOpen(false);
    setCanvasFS(false);
  }, []);

  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const idx = prev.findIndex(t => t.id === tabId);
      const next = prev.filter(t => t.id !== tabId);

      // Switch to adjacent tab if closing the active one
      if (activeTabId === tabId) {
        if (next.length === 0) {
          setActiveTabId(null);
          setSidebarVisible(true);
          setCanvasFS(false);
          setCanvasW(null);
        } else {
          const newIdx = Math.min(idx, next.length - 1);
          setActiveTabId(next[newIdx].id);
        }
      }
      return next;
    });
  }, [activeTabId]);

  const closeAllTabs = useCallback(() => {
    setTabs([]);
    setActiveTabId(null);
    setSidebarVisible(true);
    setCanvasFS(false);
    setCanvasW(null);
  }, []);

  const toggleFS = useCallback(() => {
    setCanvasFS(prev => !prev);
    if (!canvasFS) setSidebarVisible(false);
  }, [canvasFS]);

  const handleDrag = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    setCanvasW(Math.max(300, Math.min(r.right - clientX, r.width - 320)));
  }, []);

  const canvasStyle = (): React.CSSProperties => {
    if (canvasFS) return { flex: 1 };
    if (canvasW) return { width: canvasW, minWidth: 300, maxWidth: '75%', flexShrink: 0 };
    return { width: '42%', minWidth: 340, maxWidth: 560, flexShrink: 0 };
  };

  // ─── Data Loading ─────────────────────────────────────────────────

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/conversations', { headers: authHeaders() });
      if (res.ok) setConversations(await res.json());
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, sending]);

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

  // Pre-filled message from query param
  const prefillHandled = useRef(false);
  useEffect(() => {
    if (prefillHandled.current) return;
    const params = new URLSearchParams(window.location.search);
    const prefill = params.get('message');
    if (prefill) {
      prefillHandled.current = true;
      window.history.replaceState(null, '', window.location.pathname);
      setTimeout(() => handleSend(prefill), 500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Send Message (SSE) ───────────────────────────────────────────

  const handleSend = async (content: string) => {
    const tempMsg: Message = { id: Date.now(), role: 'user', content, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);
    setSending(true);
    setStreamingText('');

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      let convId = activeId;
      if (!convId) {
        convId = await createConversation();
        if (!convId) throw new Error('Failed to create conversation');
      }

      const res = await fetch(`/api/chat/conversations/${convId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ content }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error('Send failed');
      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6);
          if (raw === '[DONE]') continue;
          try {
            const evt = JSON.parse(raw);
            if (evt.type === 'text_delta') {
              assistantText += evt.text;
              setStreamingText(assistantText);
            }
            if (evt.type === 'done') {
              setMessages(prev => [...prev, {
                id: evt.messageId || Date.now() + 1,
                role: 'assistant',
                content: assistantText,
                created_at: new Date().toISOString(),
                metadata: evt.metadata,
              }]);
              assistantText = '';
              setStreamingText('');
            }
            if (evt.type === 'gate_advance') {
              setCurrentGate(evt.toGate);
              if (evt.dealId) setActiveDealId(evt.dealId);
            }
            if (evt.type === 'paywall') {
              setPaywallData(evt);
            }
            if (evt.type === 'deal_created' && evt.dealId) {
              setActiveDealId(evt.dealId);
            }
          } catch { /* ignore parse errors */ }
        }
      }

      // If there's remaining text
      if (assistantText) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          content: assistantText,
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

  // ─── Canvas Content Renderer ──────────────────────────────────────

  const renderTabContent = (tab: CanvasTab) => {
    switch (tab.type) {
      case 'pipeline':
        return (
          <PipelinePanel
            onOpenConversation={(convId) => { setActiveId(convId); }}
            onNewDeal={() => {}}
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
            <DataRoom dealId={activeDealId} onViewDeliverable={(id) => {
              openTab('deliverable', { deliverableId: id, label: `Document #${id}` });
            }} />
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <ParticipantPanel dealId={activeDealId} />
            </div>
          </>
        );
      case 'deliverable':
        return (
          <Canvas
            deliverableId={tab.props?.deliverableId}
            onClose={() => closeTab(tab.id)}
          />
        );
      default:
        return null;
    }
  };

  const showWelcome = messages.length === 0 && !sending;

  return (
    <div
      ref={containerRef}
      className="flex h-dvh overflow-hidden bg-[#FAFAFA] font-sans"
    >
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)] z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
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

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR */}
        <div
          className="shrink-0 flex items-center justify-between bg-[#FAFAFA]"
          style={{ padding: '10px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center justify-center w-[34px] h-[34px] rounded-full bg-transparent border-none cursor-pointer text-[#3D3B37] hover:bg-[rgba(186,60,96,.08)] hover:text-[#BA3C60] transition-colors md:hidden"
              type="button"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
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
            <div className="text-[22px] font-extrabold tracking-[-0.03em] text-[#0D0D0D] font-sans">
              smb<span className="text-[#BA3C60]">x</span>.ai
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            {NAV_ITEMS.map(n => {
              const isOpen = tabs.some(t => t.id === n.key);
              const isActive = activeTabId === n.key;
              return (
                <button
                  key={n.key}
                  onClick={() => openTab(n.key)}
                  className={`hidden sm:block px-3.5 py-[7px] rounded-lg bg-transparent border-none cursor-pointer text-sm font-semibold tracking-[-0.01em] transition-colors relative ${
                    isActive ? 'text-[#BA3C60]' : isOpen ? 'text-[#0D0D0D]' : 'text-[#3D3B37] hover:text-[#BA3C60]'
                  }`}
                >
                  {n.label}
                  {isActive && (
                    <span className="absolute left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#BA3C60]" style={{ bottom: 2 }} />
                  )}
                  {isOpen && !isActive && (
                    <span className="absolute left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#6E6A63]" style={{ bottom: 2 }} />
                  )}
                </button>
              );
            })}

            <div className="hidden sm:block w-px h-5 bg-[rgba(0,0,0,0.06)] mx-1.5" />

            <NotificationBell />

            <button
              onClick={() => openTab('settings')}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm transition-colors cursor-pointer border-0 bg-transparent ${
                activeTabId === 'settings' ? 'text-[#BA3C60]' : 'text-[#6E6A63] hover:bg-[rgba(0,0,0,0.04)] hover:text-[#0D0D0D]'
              }`}
              title="Settings"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </button>
          </div>
        </div>

        {/* Below topbar: chat + resize + canvas area */}
        <div className="flex-1 flex min-h-0">
          {/* CHAT column — hidden when canvas is fullscreen */}
          {!canvasFS && (
            <div className="flex-1 flex flex-col" style={{ minWidth: 320 }}>
              <GateProgress dealId={activeDealId} currentGate={currentGate} />

              <div className="flex-1 overflow-y-auto min-h-0 pt-4 pb-2" style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
                <div className="max-w-[860px] w-full mx-auto px-4 space-y-4">
                  {showWelcome && (
                    <div className="py-12 px-2">
                      <h2 className="text-[26px] font-extrabold tracking-[-0.03em] text-[#0D0D0D] font-sans m-0 mb-2 text-center">
                        smb<span className="text-[#BA3C60]">x</span>.ai
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
                            style={{ boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}
                            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.07), 0 1px 2px rgba(0,0,0,.04)')}
                            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.05)')}
                          >
                            <p className="text-[19px] font-bold text-[#0D0D0D] font-sans m-0 mb-1">{card.title}</p>
                            <p className="text-[15px] text-[#3D3B37] font-sans m-0 leading-[1.55]">{card.description}</p>
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
                          openTab('deliverable', { deliverableId, label: 'Deliverable' });
                        }
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

          {/* Resize handle */}
          {hasTabs && !canvasFS && (
            <div className="hidden md:block">
              <ResizeHandle onDrag={handleDrag} />
            </div>
          )}

          {/* CANVAS AREA — tab content + vertical tab strip */}
          {hasTabs && (
            <div
              className="hidden md:flex"
              style={{
                ...canvasStyle(),
                borderLeft: canvasFS ? 'none' : '1px solid rgba(0,0,0,0.06)',
                background: '#FFFFFF',
                transition: canvasW ? 'none' : 'all 0.25s ease',
              }}
            >
              {/* Active tab content */}
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Tab content header */}
                {activeTab && (
                  <div
                    className="shrink-0 flex items-center justify-between"
                    style={{ padding: '10px 16px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}
                  >
                    <h2 className="font-sans m-0 truncate text-sm font-bold text-[#0D0D0D]">
                      {activeTab.label}
                    </h2>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={toggleFS}
                        title={canvasFS ? 'Exit fullscreen' : 'Fullscreen'}
                        className="flex items-center justify-center cursor-pointer border-0 w-7 h-7 rounded-md bg-transparent text-[#6E6A63] hover:bg-[rgba(0,0,0,0.04)]"
                      >
                        {canvasFS ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => closeTab(activeTab.id)}
                        className="flex items-center justify-center cursor-pointer border-0 w-7 h-7 rounded-md bg-transparent text-[#6E6A63] hover:bg-[rgba(0,0,0,0.04)]"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab content — all tabs mounted, only active visible */}
                <div className="flex-1 overflow-y-auto relative">
                  {tabs.map(tab => (
                    <div
                      key={tab.id}
                      className="absolute inset-0 overflow-y-auto"
                      style={{ display: tab.id === activeTabId ? 'block' : 'none' }}
                    >
                      {renderTabContent(tab)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Vertical tab strip — right edge (Dia-style) */}
              {tabs.length > 1 && (
                <div
                  className="shrink-0 flex flex-col items-center py-2 gap-1"
                  style={{
                    width: 44,
                    borderLeft: '1px solid rgba(0,0,0,0.06)',
                    background: '#FAFAFA',
                  }}
                >
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTabId(tab.id)}
                      title={tab.label}
                      className={`relative flex items-center justify-center w-9 h-9 rounded-lg border-0 cursor-pointer transition-all ${
                        tab.id === activeTabId
                          ? 'bg-[#BA3C60]/10 text-[#BA3C60]'
                          : 'bg-transparent text-[#6E6A63] hover:bg-[rgba(0,0,0,0.04)] hover:text-[#0D0D0D]'
                      }`}
                    >
                      <TabIcon type={tab.type} />
                      {/* Close button on hover */}
                      {tab.closable && (
                        <span
                          onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                          className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#6E6A63] text-white flex items-center justify-center text-[8px] font-bold opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity"
                          style={{ lineHeight: 1 }}
                        >
                          ×
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Canvas as full-screen overlay */}
      {hasTabs && activeTab && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col" style={{ background: '#FFFFFF' }}>
          {/* Mobile tab header */}
          <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-[rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                    tab.id === activeTabId
                      ? 'bg-[#BA3C60] text-white border-[#BA3C60]'
                      : 'bg-white text-[#6E6A63] border-[rgba(0,0,0,0.08)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => closeTab(activeTab.id)}
              className="shrink-0 ml-2 w-8 h-8 rounded-full flex items-center justify-center border-0 bg-transparent text-[#6E6A63] cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {renderTabContent(activeTab)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab Icon Component ─────────────────────────────────────────────

function TabIcon({ type }: { type: string }) {
  switch (type) {
    case 'pipeline':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 3v18h18" /><path d="M7 16l4-8 4 4 4-8" />
        </svg>
      );
    case 'intel':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
        </svg>
      );
    case 'sourcing':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
      );
    case 'dataroom':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
        </svg>
      );
    case 'settings':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      );
    case 'deliverable':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
        </svg>
      );
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
      );
  }
}
