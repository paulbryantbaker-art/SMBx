import { createContext, useContext, useState, useRef, useCallback, useEffect, type ReactNode } from 'react';

export interface AnonMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export type MorphPhase = 'public' | 'morphing' | 'chat';

interface ChatContextValue {
  morphPhase: MorphPhase;
  messages: AnonMessage[];
  sending: boolean;
  streamingText: string;
  messagesRemaining: number;
  limitReached: boolean;
  error: string | null;
  sourcePage: string | null;
  triggerMorph: (message: string, sourcePage: string) => void;
  sendMessage: (content: string) => void;
  exitChat: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

const STORAGE_KEY = 'smbx_anon_session';

function getStoredSession(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeSession(id: string) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {}
}

function clearStoredSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [morphPhase, setMorphPhase] = useState<MorphPhase>('public');
  const [messages, setMessages] = useState<AnonMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [messagesRemaining, setMessagesRemaining] = useState(20);
  const [limitReached, setLimitReached] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourcePage, setSourcePage] = useState<string | null>(null);

  const sessionIdRef = useRef<string | null>(getStoredSession());
  const abortRef = useRef<AbortController | null>(null);

  // ─── Restore session on mount ──────────────────────────────
  useEffect(() => {
    const storedId = getStoredSession();
    if (!storedId) return;

    (async () => {
      try {
        const res = await fetch(`/api/chat/anonymous/${storedId}`);
        if (!res.ok) {
          clearStoredSession();
          sessionIdRef.current = null;
          return;
        }

        const data = await res.json();
        const restoredMsgs: AnonMessage[] = (data.messages || []).map((m: any, i: number) => ({
          id: i + 1,
          role: m.role,
          content: m.content,
          created_at: new Date().toISOString(),
        }));

        if (restoredMsgs.length > 0) {
          setMessages(restoredMsgs);
          setMessagesRemaining(data.messagesRemaining);
          setLimitReached(data.limitReached || false);
          setSourcePage(data.sourcePage || null);
          setMorphPhase('chat');

          // Push history state for back button
          window.history.pushState({ smbxChat: true }, '', location.pathname + '#chat');
        }
      } catch {
        clearStoredSession();
        sessionIdRef.current = null;
      }
    })();
  }, []);

  // ─── Back button handler ───────────────────────────────────
  useEffect(() => {
    const handlePopstate = (e: PopStateEvent) => {
      if (morphPhase === 'chat') {
        setMorphPhase('public');
      }
    };

    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, [morphPhase]);

  // ─── Ensure session exists ─────────────────────────────────
  const ensureSession = useCallback(async (context?: string): Promise<string | null> => {
    if (sessionIdRef.current) return sessionIdRef.current;

    try {
      const res = await fetch('/api/chat/anonymous', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context }),
      });

      if (res.status === 429) {
        setError('You\u2019ve reached the session limit. Sign up for unlimited access.');
        return null;
      }

      if (!res.ok) return null;

      const data = await res.json();
      sessionIdRef.current = data.sessionId;
      storeSession(data.sessionId);
      setMessagesRemaining(data.messagesRemaining);
      return data.sessionId;
    } catch {
      setError('Failed to start session. Please try again.');
      return null;
    }
  }, []);

  // ─── Send message (core SSE logic) ─────────────────────────
  const doSendMessage = useCallback(async (content: string, context?: string) => {
    setError(null);
    const sessionId = await ensureSession(context);
    if (!sessionId) return;

    // Optimistic user message
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

      const res = await fetch(`/api/chat/anonymous/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
        signal: controller.signal,
      });

      if (res.status === 403) {
        setLimitReached(true);
        setSending(false);
        return;
      }

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

              if (parsed.type === 'done') {
                if (typeof parsed.messagesRemaining === 'number') {
                  setMessagesRemaining(parsed.messagesRemaining);
                  if (parsed.messagesRemaining <= 0) setLimitReached(true);
                }
              } else if (parsed.type === 'error') {
                accumulated = parsed.error || 'Something went wrong.';
              } else if (parsed.text) {
                accumulated += parsed.text;
                setStreamingText(accumulated);
              }
            } catch {
              // ignore partial chunk parse errors
            }
          }
        }
      }

      // Finalize assistant message
      setStreamingText('');
      if (accumulated) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant' as const,
          content: accumulated,
          created_at: new Date().toISOString(),
        }]);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Anonymous chat error:', err);
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setSending(false);
      setStreamingText('');
      abortRef.current = null;
    }
  }, [ensureSession]);

  // ─── Trigger morph (from journey pages) ────────────────────
  const triggerMorph = useCallback((message: string, page: string) => {
    setSourcePage(page);
    setMorphPhase('morphing');

    // After fade-out animation, switch to chat phase and send the message
    setTimeout(() => {
      setMorphPhase('chat');

      // Push history state for back button
      window.history.pushState({ smbxChat: true }, '', location.pathname + '#chat');

      // Send the message
      doSendMessage(message, page);
    }, 400);
  }, [doSendMessage]);

  // ─── Public sendMessage (for Home page / MorphChatView) ────
  const sendMessage = useCallback((content: string) => {
    doSendMessage(content, sourcePage || 'home');
  }, [doSendMessage, sourcePage]);

  // ─── Exit chat (back to public) ────────────────────────────
  const exitChat = useCallback(() => {
    setMorphPhase('public');
    // Remove hash without triggering popstate
    if (location.hash === '#chat') {
      window.history.replaceState(null, '', location.pathname);
    }
  }, []);

  return (
    <ChatContext.Provider value={{
      morphPhase,
      messages,
      sending,
      streamingText,
      messagesRemaining,
      limitReached,
      error,
      sourcePage,
      triggerMorph,
      sendMessage,
      exitChat,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used within ChatProvider');
  return ctx;
}
