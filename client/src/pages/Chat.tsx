import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppHeight } from '../hooks/useAppHeight';
import Sidebar, { type Conversation } from '../components/chat/Sidebar';
import MessageBubble, { type Message } from '../components/chat/MessageBubble';
import InputBar from '../components/chat/InputBar';
import TypingIndicator from '../components/chat/TypingIndicator';
import WalletBadge from '../components/chat/WalletBadge';
import DataRoom from '../components/chat/DataRoom';
import DeliverableViewer from '../components/chat/DeliverableViewer';
import Button from '../components/ui/Button';
import { authHeaders, type User } from '../hooks/useAuth';

interface ChatProps {
  user: User;
  onLogout: () => void;
}

const JOURNEY_CARDS = [
  { id: 'sell', title: 'Sell My Business', description: "I'll value your business, prepare it for market, find qualified buyers, and guide you through closing.", prompt: 'I want to sell my business.' },
  { id: 'buy', title: 'Buy a Business', description: "I'll help you define your thesis, source targets, run diligence, and structure the deal.", prompt: 'I want to buy a business.' },
  { id: 'raise', title: 'Raise Capital', description: "I'll build your investor materials, model your cap table, and manage the outreach process.", prompt: 'I want to raise capital for my business.' },
  { id: 'pmi', title: 'Post-Acquisition', description: "I'll build your 100-day integration plan, track synergies, and stabilize operations.", prompt: 'I just acquired a business and need help with integration.' },
];

export default function Chat({ user, onLogout }: ChatProps) {
  useAppHeight();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dataRoomOpen, setDataRoomOpen] = useState(false);
  const [viewingDeliverable, setViewingDeliverable] = useState<number | null>(null);
  const [activeDealId, setActiveDealId] = useState<number | null>(null);
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

  // Send message with SSE streaming
  const handleSend = async (content: string) => {
    let convId = activeId;
    if (!convId) {
      convId = await createConversation();
      if (!convId) return;
    }

    // Optimistic user message
    const tempMsg: Message = { id: Date.now(), role: 'user', content, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);
    setSending(true);
    setStreamingText('');

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch(`/api/chat/conversations/${convId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ content }),
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
      let finalAssistantMsg: Message | null = null;

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

              if (parsed.type === 'user_message') {
                // Replace optimistic message with real one
                setMessages(prev => [...prev.slice(0, -1), parsed.message]);
              } else if (parsed.type === 'done') {
                finalAssistantMsg = parsed.message;
                if (parsed.dealId) setActiveDealId(parsed.dealId);
              } else if (parsed.type === 'error') {
                accumulated = parsed.error || 'Something went wrong.';
              } else if (parsed.text) {
                // Streaming text chunk
                accumulated += parsed.text;
                setStreamingText(accumulated);
              }
            } catch {
              // ignore parse errors on partial chunks
            }
          }
        }
      }

      // Replace streaming text with final message
      setStreamingText('');
      if (finalAssistantMsg) {
        setMessages(prev => [...prev, finalAssistantMsg!]);
      } else if (accumulated) {
        // Fallback: create message from accumulated text
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
    <>
    <div className="flex bg-cream" style={{ height: 'var(--app-height)' }}>
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

      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-white">
          <div className="flex items-center gap-2">
            <Button variant="icon" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar" className="md:hidden">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </Button>
            <h1 className="text-lg font-semibold text-text-primary font-[Georgia,ui-serif,serif] m-0">Yulia</h1>
          </div>
          <div className="flex items-center gap-2">
            <WalletBadge />
            <button
              onClick={() => setDataRoomOpen(!dataRoomOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer border-0 ${
                dataRoomOpen ? 'bg-terra text-white' : 'bg-cream text-text-primary hover:bg-cream-dark'
              }`}
              aria-label="Toggle data room"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
              <span className="hidden sm:inline">Data Room</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {showWelcome && (
              <div className="py-12 px-2">
                <h2 className="text-2xl font-semibold text-terra font-[Georgia,ui-serif,serif] m-0 mb-2 text-center">
                  smbx.ai
                </h2>
                <p className="text-base text-text-secondary font-[system-ui,sans-serif] m-0 mb-8 text-center max-w-md mx-auto leading-relaxed">
                  I'm Yulia, your M&A advisor. I handle the entire process — from first conversation to closing. What are we working on?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                  {JOURNEY_CARDS.map(card => (
                    <button
                      key={card.id}
                      onClick={() => handleSend(card.prompt)}
                      className="text-left bg-white rounded-2xl border border-border p-4 hover:bg-cream-dark transition-colors duration-150 cursor-pointer"
                    >
                      <p className="text-base font-semibold text-text-primary font-[system-ui,sans-serif] m-0 mb-1">
                        {card.title}
                      </p>
                      <p className="text-sm text-text-secondary font-[system-ui,sans-serif] m-0 leading-snug">
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

            {sending && !streamingText && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
          {/* Spacer for fixed input bar */}
          <div className="h-[70px] shrink-0" />
        </div>
      </div>

      {/* Data Room Panel */}
      {dataRoomOpen && (
        <div className="hidden md:flex flex-col w-72 border-l border-border bg-white shrink-0">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-text-primary m-0">Data Room</h2>
            <p className="text-xs text-text-secondary m-0 mt-0.5">Your generated deliverables</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <DataRoom dealId={activeDealId} onViewDeliverable={setViewingDeliverable} />
          </div>
        </div>
      )}

      {/* Deliverable Viewer Modal */}
      {viewingDeliverable !== null && (
        <DeliverableViewer
          deliverableId={viewingDeliverable}
          onClose={() => setViewingDeliverable(null)}
        />
      )}
    </div>

    <InputBar onSend={handleSend} disabled={sending} />
    </>
  );
}
