import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

/* ─── Types ──────────────────────────────────────────────────── */

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export type MorphPhase = 'public' | 'morphing' | 'chat';
export type JourneyContext = 'sell' | 'buy' | 'raise' | 'pmi' | 'unknown';

interface ChatContextValue {
  // View state
  morphPhase: MorphPhase;
  sourcePage: string;
  journeyContext: JourneyContext;

  // Session
  anonymousSessionId: string | null;

  // Messages
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingContent: string;
  messageCount: number;
  messagesRemaining: number;
  limitReached: boolean;
  error: string | null;

  // Flags
  showSaveProgress: boolean;

  // Actions
  sendMessage: (content: string, fromPage?: string) => void;
  resetToPublic: () => void;
}

const ChatCtx = createContext<ChatContextValue | null>(null);

/* ─── Helpers ────────────────────────────────────────────────── */

const STORAGE_KEY = 'smbx_anonymous_session';

function getStoredSessionId(): string | null {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}
function storeSessionId(id: string) {
  try { localStorage.setItem(STORAGE_KEY, id); } catch {}
}
function clearStoredSession() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

function deriveJourney(page: string): JourneyContext {
  if (page === '/sell') return 'sell';
  if (page === '/buy') return 'buy';
  if (page === '/raise') return 'raise';
  if (page === '/integrate') return 'pmi';
  return 'unknown';
}

// Map sourcePage to the context string the backend expects
function pageToBackendContext(page: string): string {
  const map: Record<string, string> = {
    '/sell': 'sell',
    '/buy': 'buy',
    '/raise': 'raise',
    '/integrate': 'integrate',
    '/how-it-works': 'how-it-works',
    '/enterprise': 'enterprise',
    '/pricing': 'unknown',
  };
  return map[page] || 'home';
}

/* ─── Provider ───────────────────────────────────────────────── */

export function ChatProvider({ children }: { children: ReactNode }) {
  const [morphPhase, setMorphPhase] = useState<MorphPhase>('public');
  const [sourcePage, setSourcePage] = useState('/');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [messageCount, setMessageCount] = useState(0);
  const [messagesRemaining, setMessagesRemaining] = useState(20);
  const [limitReached, setLimitReached] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSaveProgress, setShowSaveProgress] = useState(false);

  const sessionIdRef = useRef<string | null>(getStoredSessionId());
  const abortRef = useRef<AbortController | null>(null);

  const journeyContext = deriveJourney(sourcePage);
  const anonymousSessionId = sessionIdRef.current;

  /* ── Restore session on mount ────────────────────────────── */

  useEffect(() => {
    const stored = getStoredSessionId();
    if (!stored) return;

    (async () => {
      try {
        const res = await fetch(`/api/chat/anonymous/${stored}`);
        if (!res.ok) {
          clearStoredSession();
          sessionIdRef.current = null;
          return;
        }

        const data = await res.json();
        const restored: ChatMessage[] = (data.messages || []).map((m: any, i: number) => ({
          id: i + 1,
          role: m.role,
          content: m.content,
          createdAt: new Date().toISOString(),
        }));

        if (restored.length > 0) {
          setMessages(restored);
          setMessagesRemaining(data.messagesRemaining ?? 20);
          setLimitReached(data.limitReached ?? false);
          setSourcePage(data.sourcePage ? `/${data.sourcePage}` : '/');
          const userCount = restored.filter(m => m.role === 'user').length;
          setMessageCount(userCount);
          if (userCount >= 10) setShowSaveProgress(true);
          setMorphPhase('chat');
          window.history.pushState({ smbxChat: true }, '', location.pathname + '#chat');
        }
      } catch {
        clearStoredSession();
        sessionIdRef.current = null;
      }
    })();
  }, []);

  /* ── Browser back button ─────────────────────────────────── */

  useEffect(() => {
    const onPop = () => {
      if (morphPhase === 'chat') setMorphPhase('public');
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [morphPhase]);

  /* ── Ensure backend session exists ───────────────────────── */

  const ensureSession = useCallback(async (ctx: string): Promise<string | null> => {
    if (sessionIdRef.current) return sessionIdRef.current;

    try {
      const res = await fetch('/api/chat/anonymous', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: ctx }),
      });

      if (res.status === 429) {
        setError('Session limit reached. Sign up for unlimited access.');
        return null;
      }
      if (!res.ok) return null;

      const data = await res.json();
      sessionIdRef.current = data.sessionId;
      storeSessionId(data.sessionId);
      setMessagesRemaining(data.messagesRemaining);
      return data.sessionId;
    } catch {
      setError('Failed to start session. Please try again.');
      return null;
    }
  }, []);

  /* ── Send message (core) ─────────────────────────────────── */

  const sendMessage = useCallback(async (content: string, fromPage?: string) => {
    // Determine source page — use fromPage if provided (first message), else current
    const page = fromPage || sourcePage;
    if (fromPage) setSourcePage(fromPage);

    // 1. Start morph if we're in public view
    if (morphPhase === 'public') {
      setMorphPhase('morphing');
    }

    // 2. Optimistic user message
    setError(null);
    const userMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);
    setStreamingContent('');

    // 3. Ensure session
    const backendCtx = pageToBackendContext(page);
    const sessionId = await ensureSession(backendCtx);
    if (!sessionId) {
      setIsStreaming(false);
      return;
    }

    // 4. Transition to chat after morph animation
    setTimeout(() => {
      setMorphPhase(prev => {
        if (prev === 'morphing') {
          window.history.pushState({ smbxChat: true }, '', location.pathname + '#chat');
          return 'chat';
        }
        return prev;
      });
    }, 200);

    // 5. POST message and read SSE stream
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
        setIsStreaming(false);
        return;
      }

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
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6).trim();
            if (raw === '[DONE]') continue;

            try {
              const parsed = JSON.parse(raw);

              if (parsed.type === 'done') {
                if (typeof parsed.messagesRemaining === 'number') {
                  setMessagesRemaining(parsed.messagesRemaining);
                  if (parsed.messagesRemaining <= 0) setLimitReached(true);
                }
              } else if (parsed.type === 'error') {
                accumulated = parsed.error || 'Something went wrong.';
              } else if (parsed.text) {
                accumulated += parsed.text;
                setStreamingContent(accumulated);
              }
            } catch {
              /* partial chunk — ignore */
            }
          }
        }
      }

      // 6. Finalize assistant message
      setStreamingContent('');
      if (accumulated) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant' as const,
          content: accumulated,
          createdAt: new Date().toISOString(),
        }]);
      }

      // 7. Track message count
      setMessageCount(prev => {
        const next = prev + 1;
        if (next >= 10) setShowSaveProgress(true);
        return next;
      });
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Chat error:', err);
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
      abortRef.current = null;
    }
  }, [morphPhase, sourcePage, ensureSession]);

  /* ── Reset to public ─────────────────────────────────────── */

  const resetToPublic = useCallback(() => {
    setMorphPhase('public');
    if (location.hash === '#chat') {
      window.history.replaceState(null, '', location.pathname);
    }
  }, []);

  return (
    <ChatCtx.Provider
      value={{
        morphPhase,
        sourcePage,
        journeyContext,
        anonymousSessionId,
        messages,
        isStreaming,
        streamingContent,
        messageCount,
        messagesRemaining,
        limitReached,
        error,
        showSaveProgress,
        sendMessage,
        resetToPublic,
      }}
    >
      {children}
    </ChatCtx.Provider>
  );
}

export function useChatContext(): ChatContextValue {
  const ctx = useContext(ChatCtx);
  if (!ctx) throw new Error('useChatContext must be used within ChatProvider');
  return ctx;
}
