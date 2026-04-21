import { useState, useRef, useCallback, useEffect } from 'react';
import { authHeaders, type User } from './useAuth';
import { showToast } from '../lib/toast';

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
  business_name?: string | null;
  industry?: string | null;
  gate_status?: string;
  gate_label?: string | null;
  summary?: string;
  is_general?: boolean;
  message_count?: number;
  created_at: string;
  updated_at: string;
}

export interface DealGroup {
  id: number;
  journey_type: string | null;
  current_gate: string | null;
  league: string | null;
  business_name: string | null;
  industry: string | null;
  status: string;
  updated_at: string;
  // Financial fields — BIGINT cents from server (or null when not extracted yet)
  revenue?: number | null;
  sde?: number | null;
  ebitda?: number | null;
  asking_price?: number | null;
  // Scoring fields — composite is 0-100, scores is { financial, team, customers, ... }
  seven_factor_composite?: number | null;
  seven_factor_scores?: Record<string, number> | null;
  // Operating
  employee_count?: number | null;
  naics_code?: string | null;
  conversations: Conversation[];
}

export interface GroupedConversations {
  deals: DealGroup[];
  general: Conversation[];
}

// Human-readable tool names for UX
const TOOL_LABELS: Record<string, string> = {
  create_deal: 'Creating your deal',
  update_deal_field: 'Updating deal info',
  classify_league: 'Classifying deal size',
  get_deal_context: 'Loading deal context',
  advance_gate: 'Advancing to next stage',
  generate_free_deliverable: 'Generating report',
  recommend_providers: 'Finding service providers',
  analyze_buyer_demand: 'Analyzing buyer demand',
  match_franchises: 'Matching franchises',
};

// Preserve chat state across Vite HMR remounts
const _hmr = (import.meta.hot?.data ?? {}) as {
  conversations?: Conversation[];
  activeConversationId?: number | null;
  messages?: AuthMessage[];
  activeDealId?: number | null;
  currentGate?: string;
  grouped?: GroupedConversations | null;
};

export function useAuthChat(user: User | null) {
  const [conversations, setConversations] = useState<Conversation[]>(_hmr.conversations ?? []);
  const [grouped, setGrouped] = useState<GroupedConversations | null>(_hmr.grouped ?? null);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(_hmr.activeConversationId ?? null);
  const [messages, setMessages] = useState<AuthMessage[]>(_hmr.messages ?? []);
  const [sending, setSending] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [activeDealId, setActiveDealId] = useState<number | null>(_hmr.activeDealId ?? null);
  const [currentGate, setCurrentGate] = useState<string | undefined>(_hmr.currentGate);
  const [paywallData, setPaywallData] = useState<any | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // True while sendMessage is mid-flight. The "load messages on conversation
  // change" effect MUST skip reload during a send — otherwise when sendMessage
  // creates a fresh conversation, the resulting setActiveConversationId fires
  // the effect, which fetches an empty server-side list and wipes the
  // optimistic user message that was just appended. (User-reported bug:
  // "I send a message but only see Yulia's response.")
  const sendingRef = useRef(false);
  // Tracks which conversation IDs we've already loaded — prevents the reload
  // effect from re-fetching the SAME conversation when the ID is set after
  // it was already locally populated.
  const loadedConvIdRef = useRef<number | null>(null);

  // Sync critical state to HMR data so it survives hot reloads
  useEffect(() => {
    if (import.meta.hot) {
      import.meta.hot.data.conversations = conversations;
      import.meta.hot.data.activeConversationId = activeConversationId;
      import.meta.hot.data.messages = messages;
      import.meta.hot.data.activeDealId = activeDealId;
      import.meta.hot.data.currentGate = currentGate;
      import.meta.hot.data.grouped = grouped;
    }
  }, [conversations, activeConversationId, messages, activeDealId, currentGate, grouped]);

  // Clean up in-flight requests on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // Stable ref to sendMessage so error-toast retry handlers can call the
  // current implementation without closing over a stale function.
  const sendMessageRef = useRef<((content: string) => Promise<void>) | null>(null);

  // Load conversation list (flat for backward compat + grouped for new sidebar)
  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const [flatRes, groupedRes] = await Promise.all([
        fetch('/api/chat/conversations', { headers: authHeaders() }),
        fetch('/api/chat/conversations/grouped', { headers: authHeaders() }),
      ]);
      if (flatRes.ok) setConversations(await flatRes.json());
      if (groupedRes.ok) setGrouped(await groupedRes.json());
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadConversations();
  }, [user, loadConversations]);

  // Load messages when conversation changes.
  // SKIP when:
  //   1. sendingRef is true — a send is in flight that may have already
  //      added an optimistic user message; reloading would wipe it.
  //   2. We've already loaded this conversation ID locally — prevents
  //      a re-fetch when sendMessage's createConversation flips the ID.
  useEffect(() => {
    if (!activeConversationId || !user) {
      setMessages([]);
      loadedConvIdRef.current = null;
      return;
    }
    if (sendingRef.current) {
      // The send flow will populate the server with the user message.
      // Mark this convId as loaded so a future re-render doesn't refetch.
      loadedConvIdRef.current = activeConversationId;
      return;
    }
    if (loadedConvIdRef.current === activeConversationId) return;
    loadedConvIdRef.current = activeConversationId;
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
      // Mark this conv as already loaded so the activeConversationId-change
      // effect doesn't re-fetch (and doesn't wipe optimistic messages
      // appended by an in-flight sendMessage).
      loadedConvIdRef.current = conv.id;
      // Only reset messages if no send is in flight. When sendMessage
      // creates a fresh conversation, it has already appended an optimistic
      // user message — wiping it here causes "I see Yulia's reply but not
      // my own message."
      if (!sendingRef.current) setMessages([]);
      return conv.id;
    } catch {
      return null;
    }
  }, [user]);

  // Open or create the general (non-deal) conversation
  const openGeneral = useCallback(async (): Promise<number | null> => {
    if (!user) return null;
    try {
      const res = await fetch('/api/chat/conversations/general', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
      });
      if (!res.ok) return null;
      const conv = await res.json();
      setActiveConversationId(conv.id);
      // Messages will load via the activeConversationId effect
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
    sendingRef.current = true;
    setStreamingText('');

    let retried = false;
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
      let sseBuffer = '';

      if (reader) {
        // Stale-connection timeout: abort if no data arrives for 120s
        // (agentic tool loops can take 60s+ with multiple Claude calls)
        let staleTimer: ReturnType<typeof setTimeout> | null = null;
        const resetStaleTimer = () => {
          if (staleTimer) clearTimeout(staleTimer);
          staleTimer = setTimeout(() => {
            controller.abort();
          }, 120000);
        };
        resetStaleTimer();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            resetStaleTimer();

            const chunk = decoder.decode(value, { stream: true });
            sseBuffer += chunk;
            const lines = sseBuffer.split('\n');
            // Keep the last (possibly incomplete) line in the buffer
            sseBuffer = lines.pop() || '';

            for (const line of lines) {
              // Skip SSE comments (heartbeats)
              if (line.startsWith(':')) continue;
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);

                if (parsed.type === 'text_delta') {
                  setActiveTool(null);
                  accumulated += parsed.text;
                  setStreamingText(accumulated);
                } else if (parsed.type === 'tool_start') {
                  setActiveTool(TOOL_LABELS[parsed.tool] || 'Working');
                } else if (parsed.type === 'tool_done') {
                  setActiveTool(null);
                  // Handle canvas_action from model tools
                  if (parsed.result) {
                    try {
                      const result = typeof parsed.result === 'string' ? JSON.parse(parsed.result) : parsed.result;
                      if (result.canvas_action) {
                        window.dispatchEvent(new CustomEvent('smbx:canvas_action', { detail: result }));
                      }
                    } catch { /* not JSON, ignore */ }
                  }
                } else if (parsed.type === 'done') {
                  if (parsed.dealId) setActiveDealId(parsed.dealId);
                  if (parsed.conversationId) setActiveConversationId(parsed.conversationId);
                } else if (parsed.type === 'gate_advance') {
                  if (parsed.toGate) setCurrentGate(parsed.toGate);
                  loadConversations();
                  if (parsed.newConversationId) {
                    setActiveConversationId(parsed.newConversationId);
                    window.history.replaceState(null, '', `/chat/${parsed.newConversationId}`);
                  }
                } else if (parsed.type === 'paywall') {
                  setPaywallData(parsed);
                } else if (parsed.type === 'error') {
                  accumulated = parsed.error || 'Something went wrong.';
                }
              } catch {
                // ignore malformed JSON
              }
            }
          }
        } finally {
          if (staleTimer) clearTimeout(staleTimer);
        }

        // Flush remaining buffer after stream ends
        if (sseBuffer.startsWith('data: ')) {
          const data = sseBuffer.slice(6).trim();
          if (data && data !== '[DONE]') {
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'text_delta') {
                accumulated += parsed.text;
                setStreamingText(accumulated);
              }
            } catch { /* ignore */ }
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
      if (err.name === 'AbortError') {
        // Stale-connection timeout — auto-retry once
        if (!retried) {
          retried = true;
          setStreamingText('');
          setActiveTool('Reconnecting');
          // Retry after a brief pause
          try {
            const retryCtrl = new AbortController();
            abortRef.current = retryCtrl;
            const retryRes = await fetch(`/api/chat/conversations/${activeConversationId}/messages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...authHeaders() },
              body: JSON.stringify({ content }),
              signal: retryCtrl.signal,
            });
            if (retryRes.ok) {
              const retryReader = retryRes.body?.getReader();
              if (retryReader) {
                const retryDecoder = new TextDecoder();
                let retryAccum = '';
                while (true) {
                  const { done, value } = await retryReader.read();
                  if (done) break;
                  const chunk = retryDecoder.decode(value, { stream: true });
                  for (const line of chunk.split('\n')) {
                    if (!line.startsWith('data: ')) continue;
                    const data = line.slice(6).trim();
                    if (data === '[DONE]') continue;
                    try {
                      const parsed = JSON.parse(data);
                      if (parsed.type === 'text_delta') {
                        setActiveTool(null);
                        retryAccum += parsed.text;
                        setStreamingText(retryAccum);
                      } else if (parsed.type === 'done') {
                        if (parsed.dealId) setActiveDealId(parsed.dealId);
                      } else if (parsed.type === 'error') {
                        retryAccum = parsed.error || 'Something went wrong.';
                      }
                    } catch { /* ignore */ }
                  }
                }
                setStreamingText('');
                if (retryAccum) {
                  setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    role: 'assistant' as const,
                    content: retryAccum,
                    created_at: new Date().toISOString(),
                  }]);
                }
                loadConversations();
                return;
              }
            }
          } catch { /* retry failed, fall through */ }
        }
        // If retry also failed or was already retried, show timeout message
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant' as const,
          content: 'The connection timed out. Please try sending your message again.',
          created_at: new Date().toISOString(),
        }]);
      } else {
        console.error('Send error:', err);
        // Use server error message if available (e.g. rate limit messages)
        const msg = err.message?.includes('high demand')
          ? err.message
          : err.message?.includes('try again')
            ? err.message
            : 'Something went wrong. Please try again.';
        // Bottom toast with one-tap retry
        showToast("Couldn't send your message", {
          tone: 'error',
          action: { label: 'Retry', handler: () => sendMessageRef.current?.(content) },
        });
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant' as const,
          content: msg,
          created_at: new Date().toISOString(),
        }]);
      }
    } finally {
      setSending(false);
      sendingRef.current = false;
      setStreamingText('');
      setActiveTool(null);
      abortRef.current = null;
    }
  }, [user, activeConversationId, createConversation, loadConversations]);

  // Keep the ref pointing at the latest sendMessage so toast retry handlers
  // never call a stale implementation.
  useEffect(() => { sendMessageRef.current = sendMessage; }, [sendMessage]);

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
    grouped,
    activeConversationId,
    messages,
    sending,
    streamingText,
    activeTool,
    activeDealId,
    currentGate,
    paywallData,
    sendMessage,
    selectConversation,
    newConversation,
    createConversation,
    openGeneral,
    setPaywallData,
    setActiveConversationId,
    loadConversations,
  };
}
