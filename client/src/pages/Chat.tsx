import { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar, { type Conversation } from '../components/chat/Sidebar';
import MessageBubble, { type Message } from '../components/chat/MessageBubble';
import InputBar from '../components/chat/InputBar';
import TypingIndicator from '../components/chat/TypingIndicator';
import Button from '../components/ui/Button';
import { authHeaders, type User } from '../hooks/useAuth';

interface ChatProps {
  user: User;
  onLogout: () => void;
}

export default function Chat({ user, onLogout }: ChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

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
    } catch {
      return null;
    }
  };

  const handleNew = async () => { await createConversation(); };

  // Send message
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

    try {
      const res = await fetch(`/api/chat/conversations/${convId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev.slice(0, -1), data.userMessage, data.assistantMessage]);
        loadConversations();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-dvh bg-cream overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.2)] z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — always visible on desktop, overlay on mobile */}
      <div className={`
        fixed md:relative z-50 md:z-auto
        transition-transform duration-200 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
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

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-white">
          <Button variant="icon" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar" className="md:hidden">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </Button>
          <h1 className="text-lg font-semibold text-text-primary font-[Georgia,ui-serif,serif] m-0">
            Yulia
          </h1>
          <div className="w-9 md:hidden" />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-20 px-6">
                <h2 className="text-2xl font-semibold text-terra font-[Georgia,ui-serif,serif] m-0 mb-3">
                  Welcome to smbx.ai
                </h2>
                <p className="text-base text-text-secondary font-[system-ui,sans-serif] m-0 max-w-md mx-auto leading-relaxed">
                  I'm Yulia, your M&A advisor. Start a conversation to get guidance on selling, buying, raising capital, or post-merger integration.
                </p>
              </div>
            )}
            {messages.map(m => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {sending && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <InputBar onSend={handleSend} disabled={sending} />
      </div>
    </div>
  );
}
