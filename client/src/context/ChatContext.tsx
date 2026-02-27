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

  // Conversation
  conversationId: number | null;

  // Messages
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;

  // Actions
  sendMessage: (content: string, fromPage?: string) => void;
  resetToPublic: () => void;
}

const ChatCtx = createContext<ChatContextValue | null>(null);

/* ─── Helpers ────────────────────────────────────────────────── */

const CONV_KEY = 'smbx_public_conv';

function getStoredConvId(): number | null {
  try {
    const val = localStorage.getItem(CONV_KEY);
    return val ? parseInt(val, 10) : null;
  } catch { return null; }
}
function storeConvId(id: number) {
  try { localStorage.setItem(CONV_KEY, String(id)); } catch {}
}
function clearStoredConv() {
  try { localStorage.removeItem(CONV_KEY); } catch {}
}

function deriveJourney(page: string): JourneyContext {
  if (page === '/' || page === '/sell') return 'sell';
  if (page === '/buy') return 'buy';
  if (page === '/raise') return 'raise';
  if (page === '/integrate') return 'pmi';
  return 'unknown';
}

function deriveJourneyContextString(page: string): string {
  const map: Record<string, string> = {
    '/': 'sell',
    '/sell': 'sell',
    '/buy': 'buy',
    '/raise': 'raise',
    '/integrate': 'integrate',
    '/how-it-works': 'unknown',
    '/enterprise': 'unknown',
    '/pricing': 'unknown',
  };
  return map[page] || 'unknown';
}

/* ─── Provider ───────────────────────────────────────────────── */

export function ChatProvider({ children }: { children: ReactNode }) {
  const [morphPhase, setMorphPhase] = useState<MorphPhase>('public');
  const [sourcePage, setSourcePage] = useState('/');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const convIdRef = useRef<number | null>(getStoredConvId());
  const abortRef = useRef<AbortController | null>(null);

  const journeyContext = deriveJourney(sourcePage);
  const conversationId = convIdRef.current;

  /* ── Restore conversation on mount ─────────────────────────── */

  useEffect(() => {
    const stored = getStoredConvId();
    if (!stored) return;

    (async () => {
      try {
        const res = await fetch(`/api/chat/conversations/${stored}/messages`);
        if (!res.ok) {
          clearStoredConv();
          convIdRef.current = null;
          return;
        }

        const msgs = await res.json();
        const restored: ChatMessage[] = (msgs || []).map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.created_at,
        }));

        if (restored.length > 0) {
          setMessages(restored);
          setMorphPhase('chat');
          window.history.pushState({ smbxChat: true }, '', location.pathname + '#chat');
        }
      } catch {
        clearStoredConv();
        convIdRef.current = null;
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

  /* ── Send message via POST /api/chat/message ───────────────── */

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

    // 3. Transition to chat after morph animation
    setTimeout(() => {
      setMorphPhase(prev => {
        if (prev === 'morphing') {
          window.history.pushState({ smbxChat: true }, '', location.pathname + '#chat');
          return 'chat';
        }
        return prev;
      });
    }, 200);

    // 4. POST to /api/chat/message with SSE streaming
    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const jCtx = deriveJourneyContextString(page);

      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          conversationId: convIdRef.current,
          journeyContext: jCtx,
        }),
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
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6).trim();
            if (raw === '[DONE]') continue;

            try {
              const parsed = JSON.parse(raw);

              if (parsed.type === 'text_delta') {
                accumulated += parsed.text;
                setStreamingContent(accumulated);
              } else if (parsed.type === 'message_stop') {
                // Save conversation ID for subsequent messages
                if (parsed.conversationId && !convIdRef.current) {
                  convIdRef.current = parsed.conversationId;
                  storeConvId(parsed.conversationId);
                }
              } else if (parsed.type === 'error') {
                accumulated = parsed.error || 'Something went wrong.';
              }
            } catch {
              /* partial chunk — ignore */
            }
          }
        }
      }

      // 5. Finalize assistant message
      setStreamingContent('');
      if (accumulated) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant' as const,
          content: accumulated,
          createdAt: new Date().toISOString(),
        }]);
      }
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
  }, [morphPhase, sourcePage]);

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
        conversationId,
        messages,
        isStreaming,
        streamingContent,
        error,
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
