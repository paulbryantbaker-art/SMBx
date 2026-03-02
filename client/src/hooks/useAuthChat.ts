import { useState, useRef, useCallback, useEffect } from 'react';
import { authHeaders, type User } from './useAuth';

export interface AuthMessage {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface Conversation {
  id: number;
  title: string;
  deal_id: number | null;
  journey?: string | null;
  current_gate?: string | null;
  created_at: string;
  updated_at: string;
}

export function useAuthChat(user: User | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<AuthMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [activeDealId, setActiveDealId] = useState<number | null>(null);
  const [currentGate, setCurrentGate] = useState<string | undefined>();
  const [paywallData, setPaywallData] = useState<any | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load conversation list
  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/chat/conversations', { headers: authHeaders() });
      if (res.ok) setConversations(await res.json());
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadConversations();
  }, [user, loadConversations]);

  // Load messages when conversation changes
  useEffect(() => {
    if (!activeConversationId || !user) {
      setMessages([]);
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `/api/chat/conversations/${activeConversationId}/messages`,
          { headers: authHeaders() },
        );
        if (res.ok) setMessages(await res.json());
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    })();
  }, [activeConversationId, user]);

  // Create a new conversation
  const createConversation = useCallback(async (): Promise<number | null> => {
    if (!user) return null;
    try {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ title: 'New conversation' }),
      });
      if (!res.ok) return null;
      const conv = await res.json();
      setConversations(prev => [conv, ...prev]);
      setActiveConversationId(conv.id);
      setMessages([]);
      return conv.id;
    } catch {
      return null;
    }
  }, [user]);

  // Send message with SSE streaming
  const sendMessage = useCallback(async (content: string) => {
    if (!user) return;

    const tempMsg: AuthMessage = {
      id: Date.now(),
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);
    setSending(true);
    setStreamingText('');

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      // Ensure we have a conversation
      let convId = activeConversationId;
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
              } else if (parsed.type === 'done') {
                if (parsed.dealId) setActiveDealId(parsed.dealId);
                if (parsed.conversationId) setActiveConversationId(parsed.conversationId);
              } else if (parsed.type === 'gate_advance') {
                if (parsed.toGate) setCurrentGate(parsed.toGate);
                loadConversations();
              } else if (parsed.type === 'paywall') {
                setPaywallData(parsed);
              } else if (parsed.type === 'error') {
                accumulated = parsed.error || 'Something went wrong.';
              }
            } catch {
              // ignore partial chunk parse errors
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
  }, [user, activeConversationId, createConversation, loadConversations]);

  // Select a conversation
  const selectConversation = useCallback((id: number) => {
    setActiveConversationId(id);
    setPaywallData(null);
  }, []);

  // Start fresh (new conversation)
  const newConversation = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setPaywallData(null);
    setActiveDealId(null);
    setCurrentGate(undefined);
  }, []);

  return {
    conversations,
    activeConversationId,
    messages,
    sending,
    streamingText,
    activeDealId,
    currentGate,
    paywallData,
    sendMessage,
    selectConversation,
    newConversation,
    createConversation,
    setPaywallData,
    setActiveConversationId,
    loadConversations,
  };
}
