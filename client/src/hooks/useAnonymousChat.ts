import { useState, useRef, useCallback } from 'react';

export interface AnonMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface UseAnonymousChatOptions {
  /** Page context passed to Yulia (e.g. "sell", "buy") */
  context?: string;
}

const SESSION_KEY = 'smbx_anon_session';

function getStoredSession(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function storeSession(id: string) {
  try {
    sessionStorage.setItem(SESSION_KEY, id);
  } catch {}
}

export function useAnonymousChat({ context }: UseAnonymousChatOptions = {}) {
  const [messages, setMessages] = useState<AnonMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [messagesRemaining, setMessagesRemaining] = useState(10);
  const [limitReached, setLimitReached] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(getStoredSession());
  const abortRef = useRef<AbortController | null>(null);

  const ensureSession = useCallback(async (): Promise<string | null> => {
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
  }, [context]);

  const sendMessage = useCallback(async (content: string) => {
    setError(null);
    const sessionId = await ensureSession();
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

  const getSessionId = useCallback(() => sessionIdRef.current, []);

  return {
    messages,
    sending,
    streamingText,
    messagesRemaining,
    limitReached,
    error,
    sendMessage,
    getSessionId,
  };
}
