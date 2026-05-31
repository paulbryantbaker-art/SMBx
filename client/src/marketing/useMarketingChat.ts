/**
 * useMarketingChat — anonymous Yulia, in the marketing bubble.
 *
 * A logged-out visitor who talks to Yulia gets *Yulia*, not a sign-in wall.
 * This hook drives the purpose-built anonymous funnel backend:
 *   POST /api/chat/anonymous/             → create a per-IP session
 *   POST /api/chat/anonymous/:id/messages → SSE-streamed reply (20-msg cap)
 *
 * The session id is stored under `smbx_anon_session`, which `App.tsx` reads
 * after signup/login and hands to `/convert` — so the conversation follows
 * the visitor into their new account. The signup CTA only appears at the cap
 * (HTTP 403) or per-device session limit (HTTP 429); everything before that
 * is real conversation. See server/routes/anonymous.ts.
 */
import { useCallback, useRef, useState } from 'react';

const ANON_KEY = 'smbx_anon_session';

export interface MktMsg {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

/** null = open; 'limit' = hit the 20-message cap; 'session' = per-device limit. */
export type MktGate = null | 'limit' | 'session';

function readSession(): string | null {
  try {
    return sessionStorage.getItem(ANON_KEY);
  } catch {
    return null;
  }
}

function writeSession(id: string): void {
  // App.tsx's convert flow reads sessionStorage; analytics reads localStorage.
  // Write both so the transcript migrates on signup and events attribute right.
  try { sessionStorage.setItem(ANON_KEY, id); } catch { /* unavailable */ }
  try { localStorage.setItem(ANON_KEY, id); } catch { /* unavailable */ }
}

function clearSession(): void {
  try { sessionStorage.removeItem(ANON_KEY); } catch { /* unavailable */ }
  try { localStorage.removeItem(ANON_KEY); } catch { /* unavailable */ }
}

export function useMarketingChat() {
  const [messages, setMessages] = useState<MktMsg[]>([]);
  const [streamingText, setStreamingText] = useState('');
  const [sending, setSending] = useState(false);
  const [gate, setGate] = useState<MktGate>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef(0);
  const nextId = () => (idRef.current += 1);

  /** Lazily create (or reuse) the anonymous session. Returns null if gated. */
  const ensureSession = useCallback(async (): Promise<string | null> => {
    const existing = readSession();
    if (existing) return existing;
    try {
      const res = await fetch('/api/chat/anonymous/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: typeof location !== 'undefined' ? location.pathname : null }),
      });
      if (res.status === 429) { setGate('session'); return null; }
      if (!res.ok) { setError('Could not start a chat just now. Please try again.'); return null; }
      const data = await res.json();
      if (data?.sessionId) { writeSession(data.sessionId); return data.sessionId as string; }
      return null;
    } catch {
      setError('Network error. Please try again.');
      return null;
    }
  }, []);

  const send = useCallback(async (raw: string) => {
    const content = raw.trim();
    if (!content || sending || gate) return;
    setError(null);
    setMessages(prev => [...prev, { id: nextId(), role: 'user', content }]);
    setSending(true);
    setStreamingText('');

    const post = (sessionId: string) =>
      fetch(`/api/chat/anonymous/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

    try {
      let sessionId = await ensureSession();
      if (!sessionId) { setSending(false); return; }

      let res = await post(sessionId);

      // Session expired/cleared server-side — mint a fresh one and retry once.
      if (res.status === 404) {
        clearSession();
        sessionId = await ensureSession();
        if (!sessionId) { setSending(false); return; }
        res = await post(sessionId);
      }

      if (res.status === 403) { setGate('limit'); setSending(false); return; }
      if (res.status === 429) { setGate('session'); setSending(false); return; }
      if (!res.ok || !res.body) {
        setError('Something went wrong. Please try again.');
        setSending(false);
        return;
      }

      // Parse the SSE stream (type: text_delta | done | error).
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (!payload || payload === '[DONE]') continue;
          try {
            const p = JSON.parse(payload);
            if (p.type === 'text_delta') {
              acc += p.text;
              setStreamingText(acc);
            } else if (p.type === 'done' && typeof p.messagesRemaining === 'number') {
              setRemaining(p.messagesRemaining);
            } else if (p.type === 'error') {
              acc = p.error || 'Something went wrong.';
            }
          } catch { /* ignore malformed line */ }
        }
      }

      setStreamingText('');
      if (acc) setMessages(prev => [...prev, { id: nextId(), role: 'assistant', content: acc }]);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSending(false);
      setStreamingText('');
    }
  }, [ensureSession, sending, gate]);

  return { messages, streamingText, sending, gate, remaining, error, send };
}
