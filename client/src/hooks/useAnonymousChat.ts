import { useState, useRef, useCallback, useEffect } from 'react';

export interface AnonMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface AnonConversation {
  id: number;
  title: string;
  deal_id: number | null;
  journey?: string | null;
  current_gate?: string | null;
  created_at: string;
  updated_at: string;
}

const SESSION_KEY = 'smbx_anon_session';

function getOrCreateSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function useAnonymousChat() {
  const [messages, setMessages] = useState<AnonMessage[]>([]);
  const [conversations, setConversations] = useState<AnonConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef(getOrCreateSessionId());
  const abortRef = useRef<AbortController | null>(null);

  // Kept for AppShell compat — no limits in unified flow
  const limitReached = false;
  const messagesRemaining: number | null = null;

  const sessionHeaders = useCallback((): Record<string, string> => ({
    'x-session-id': sessionIdRef.current,
  }), []);

  // Load conversations for sidebar
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/conversations', {
        headers: sessionHeaders(),
      });
      if (res.ok) setConversations(await res.json());
    } catch {
      // ignore
    }
  }, [sessionHeaders]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Send message via POST /api/chat/message
  const sendMessage = useCallback(async (content: string, journeyContext?: string) => {
    setError(null);

    const userMsg: AnonMessage = {
      id: Date.now(),
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setSending(true);
    setStreamingText('');

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...sessionHeaders(),
        },
        body: JSON.stringify({
          message: content,
          conversationId: activeConversationId,
          journeyContext,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || 'Request failed');
      }

      // Capture conversation ID from header
      const headerConvId = res.headers.get('X-Conversation-Id');
      if (headerConvId) {
        setActiveConversationId(parseInt(headerConvId, 10));
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
                if (parsed.conversationId) {
                  setActiveConversationId(parsed.conversationId);
                }
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
        console.error('Chat error:', err);
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setSending(false);
      setStreamingText('');
      abortRef.current = null;
    }
  }, [activeConversationId, sessionHeaders, loadConversations]);

  // Select a conversation and load its messages
  const selectConversation = useCallback(async (id: number) => {
    setActiveConversationId(id);
    try {
      const res = await fetch(`/api/chat/conversations/${id}/messages`, {
        headers: sessionHeaders(),
      });
      if (res.ok) setMessages(await res.json());
    } catch {
      // ignore
    }
  }, [sessionHeaders]);

  // Start fresh conversation
  const newConversation = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setError(null);
  }, []);

  const getSessionId = useCallback(() => sessionIdRef.current, []);

  const reset = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setMessages([]);
    setConversations([]);
    setActiveConversationId(null);
    setSending(false);
    setStreamingText('');
    setError(null);
  }, []);

  return {
    messages,
    conversations,
    activeConversationId,
    sending,
    streamingText,
    messagesRemaining,
    limitReached,
    error,
    sendMessage,
    selectConversation,
    newConversation,
    getSessionId,
    sessionData: null as Record<string, any> | null,
    reset,
    loadConversations,
  };
}
