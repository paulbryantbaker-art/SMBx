import { useState, useRef, useCallback, useEffect } from 'react';
import { authHeaders, type User } from './useAuth';
import { showToast } from '../lib/toast';
import type { SurfaceContext } from '../lib/yuliaSurfaceContext';
import type { ModelPreference } from '../lib/modelPreference';
import type { ToolTraceEntry } from '../components/v6/types';
import {
  chatArtifactStreamingMessage,
  dispatchCanvasActionResult,
  routeChatArtifactToCanvas,
  shouldRouteChatArtifact,
  type CanvasArtifactRef,
} from '../lib/chatArtifactRouting';

export interface AuthMessage {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  metadata?: Record<string, any>;
}

interface StagedAction {
  id?: number | null;
  toolName: string;
  label: string;
  summary: string;
  permissionLevel?: string;
  riskLevel?: string;
  writeScope?: string;
  confirmEndpoint?: string | null;
  cancelEndpoint?: string | null;
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
  generate_deal_deliverable: 'Generating deliverable',
  run_analysis: 'Running analysis',
  file_deliverable_to_data_room: 'Filing to data room',
  compare_deals: 'Comparing deals',
  find_providers: 'Finding service providers',
  analyze_buyer_demand: 'Analyzing buyer demand',
  match_franchises: 'Matching franchises',
};

// Computation trace — keep only the most recent N tool calls per response.
const TOOL_TRACE_CAP = 12;

function pushTraceEntry(prev: ToolTraceEntry[], entry: ToolTraceEntry): ToolTraceEntry[] {
  const next = [...prev, entry];
  return next.length > TOOL_TRACE_CAP ? next.slice(next.length - TOOL_TRACE_CAP) : next;
}

// Mark the most recent matching running entry done. Falls back to the most
// recent running entry when the tool name is absent or doesn't match.
function completeTraceEntry(prev: ToolTraceEntry[], tool?: string): ToolTraceEntry[] {
  let idx = -1;
  for (let i = prev.length - 1; i >= 0; i--) {
    if (prev[i].status !== 'running') continue;
    if (idx === -1) idx = i;
    if (tool && prev[i].tool === tool) { idx = i; break; }
  }
  if (idx === -1) return prev;
  const entry = prev[idx];
  const next = [...prev];
  next[idx] = { ...entry, status: 'done', ms: performance.now() - entry.startedAt };
  return next;
}

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
  // Computation trace — real tool calls from SSE tool_start/tool_done events,
  // never synthesized. Cleared when a new user message is sent.
  const [toolTrace, setToolTrace] = useState<ToolTraceEntry[]>([]);
  const toolTraceIdRef = useRef(0);
  const [activeDealId, setActiveDealId] = useState<number | null>(_hmr.activeDealId ?? null);
  const [currentGate, setCurrentGate] = useState<string | undefined>(_hmr.currentGate);
  const [paywallData, setPaywallData] = useState<any | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const artifactHistoryBatchRef = useRef('');
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

  useEffect(() => {
    const batchKey = messages.map(message => message.id).join(':');
    if (!batchKey || artifactHistoryBatchRef.current === batchKey) return;
    const candidate = [...messages].reverse().find(message =>
      message.role === 'assistant'
      && !message.metadata?.canvasArtifact
      && shouldRouteChatArtifact(message.content),
    );
    if (!candidate) return;

    artifactHistoryBatchRef.current = batchKey;
    const routed = routeChatArtifactToCanvas(candidate.content, 'auth_chat_history');
    if (!routed.opened) return;
    setMessages(prev => prev.map(message => message.id === candidate.id ? {
      ...message,
      content: routed.chatMessage,
      metadata: { ...(message.metadata ?? {}), canvasArtifact: { id: routed.id, title: routed.title, source: 'auth_chat_history' } },
    } : message));
  }, [messages]);

  // Clean up in-flight requests on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // Stable ref to sendMessage so error-toast retry handlers can call the
  // current implementation without closing over a stale function.
  const sendMessageRef = useRef<((content: string, surfaceContext?: SurfaceContext, modelPreference?: ModelPreference) => Promise<void>) | null>(null);

  // Load conversation list (flat for backward compat + grouped for new sidebar).
  // Returns whether BOTH fetches succeeded so history surfaces can tell a real
  // empty list from a failed refresh (honesty: never claim "no conversations"
  // when the truth is "couldn't check").
  const loadConversations = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    try {
      const [flatRes, groupedRes] = await Promise.all([
        fetch('/api/chat/conversations', { headers: authHeaders() }),
        fetch('/api/chat/conversations/grouped', { headers: authHeaders() }),
      ]);
      if (flatRes.ok) setConversations(await flatRes.json());
      if (groupedRes.ok) setGrouped(await groupedRes.json());
      return flatRes.ok && groupedRes.ok;
    } catch (err) {
      console.error('Failed to load conversations:', err);
      return false;
    }
  }, [user]);

  useEffect(() => {
    if (user) loadConversations();
  }, [user, loadConversations]);

  // Fetch one conversation's messages. Owns loadedConvIdRef:
  //   - STALE GUARD: only the fetch whose id still matches loadedConvIdRef
  //     when the response lands may setMessages — rapid A→B selection can't
  //     paint A's thread under B's identity.
  //   - FAILURE RECOVERY: on error the ref resets to null (so re-selecting
  //     refetches instead of no-opping) and a toast offers Retry.
  const loadMessagesRef = useRef<(id: number) => void>(() => {});
  const loadMessages = useCallback((id: number) => {
    loadedConvIdRef.current = id;
    void (async () => {
      try {
        const res = await fetch(
          `/api/chat/conversations/${id}/messages`,
          { headers: authHeaders() },
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (loadedConvIdRef.current === id) setMessages(data);
      } catch (err) {
        console.error('Failed to load messages:', err);
        if (loadedConvIdRef.current === id) {
          loadedConvIdRef.current = null;
          showToast("Couldn't load that conversation", {
            tone: 'error',
            action: { label: 'Retry', handler: () => loadMessagesRef.current(id) },
          });
        }
      }
    })();
  }, []);
  useEffect(() => { loadMessagesRef.current = loadMessages; }, [loadMessages]);

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
    loadMessages(activeConversationId);
  }, [activeConversationId, user, loadMessages]);

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

  const uploadFile = useCallback(async (file: File): Promise<{ name: string; size: string } | null> => {
    if (!user) return null;
    let convId = activeConversationId;
    if (!convId) {
      convId = await createConversation();
      if (!convId) return null;
    }
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`/api/chat/conversations/${convId}/upload`, {
      method: 'POST',
      headers: authHeaders(),
      body: form,
    });
    if (!res.ok) return null;
    const data = await res.json();
    loadConversations();
    return data.file ? { name: data.file.name, size: data.file.sizeFormatted } : null;
  }, [user, activeConversationId, createConversation, loadConversations]);

  // Send message with SSE streaming
  const sendMessage = useCallback(async (content: string, surfaceContext?: SurfaceContext, modelPreference?: ModelPreference) => {
    if (!user) return;
    // Drop a send while one is already streaming. Programmatic triggers (the
    // cockpit "Ask Yulia about this deal" button, Today quick-chips) bypass the
    // composer's disabled state, so a rapid double-tap would otherwise post the
    // same prompt twice — exactly the duplicate the user hit.
    if (sendingRef.current) return;

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
    setToolTrace([]);

    // Trace recorders shared by all parse branches below (main, flush, retry).
    // HONESTY: entries come only from real SSE tool_start/tool_done events.
    const beginTraceEntry = (tool: unknown) => {
      if (typeof tool !== 'string' || !tool) return;
      const entry: ToolTraceEntry = {
        id: ++toolTraceIdRef.current,
        tool,
        label: TOOL_LABELS[tool] || tool,
        status: 'running',
        startedAt: performance.now(),
      };
      setToolTrace(prev => pushTraceEntry(prev, entry));
    };
    const finishTraceEntry = (tool: unknown) => {
      setToolTrace(prev => completeTraceEntry(prev, typeof tool === 'string' ? tool : undefined));
    };

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
        body: JSON.stringify({ content, surfaceContext, modelPreference }),
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
      // The canvas tab a server tool opened this turn (id+title), so the final
      // message can carry an "Open on canvas" control back to it. Last one wins.
      let canvasArtifact: CanvasArtifactRef | null = null;

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
                  setStreamingText(shouldRouteChatArtifact(accumulated) ? chatArtifactStreamingMessage(accumulated) : accumulated);
                } else if (parsed.type === 'tool_start') {
                  setActiveTool(TOOL_LABELS[parsed.tool] || 'Working');
                  beginTraceEntry(parsed.tool);
                } else if (parsed.type === 'tool_done') {
                  setActiveTool(null);
                  finishTraceEntry(parsed.tool);
                  canvasArtifact = dispatchCanvasActionResult(parsed.result) ?? canvasArtifact;
                } else if (parsed.type === 'staged_action') {
                  setActiveTool(null);
                  const action = parsed.action as StagedAction | undefined;
                  setMessages(prev => [...prev, {
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    role: 'assistant' as const,
                    content: parsed.message || 'I staged this action for your approval.',
                    metadata: { stagedAction: action },
                    created_at: new Date().toISOString(),
                  }]);
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
                setStreamingText(shouldRouteChatArtifact(accumulated) ? chatArtifactStreamingMessage(accumulated) : accumulated);
              } else if (parsed.type === 'tool_done') {
                finishTraceEntry(parsed.tool);
                canvasArtifact = dispatchCanvasActionResult(parsed.result) ?? canvasArtifact;
              }
            } catch { /* ignore */ }
          }
        }
      }

      setStreamingText('');
      if (accumulated) {
        // A server tool already opened the canvas → keep Yulia's own narration as
        // the message and attach the canvas ref so it gets an "Open on canvas"
        // control. Otherwise fall back to client-side routing of long analyses.
        const routed = canvasArtifact
          ? { opened: true, id: canvasArtifact.id, title: canvasArtifact.title, chatMessage: accumulated }
          : routeChatArtifactToCanvas(accumulated, 'auth_chat_fallback', surfaceContext?.dealTitle);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant' as const,
          content: routed.chatMessage,
          created_at: new Date().toISOString(),
          metadata: routed.opened ? { canvasArtifact: { id: routed.id, title: routed.title, source: 'auth_chat_fallback' } } : undefined,
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
          // Drop entries from the aborted stream — the retry re-sends the
          // message, so the trace restarts from the retry's real events.
          setToolTrace([]);
          // Retry after a brief pause
          try {
            const retryCtrl = new AbortController();
            abortRef.current = retryCtrl;
            const retryRes = await fetch(`/api/chat/conversations/${activeConversationId}/messages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...authHeaders() },
              body: JSON.stringify({ content, surfaceContext, modelPreference }),
              signal: retryCtrl.signal,
            });
            if (retryRes.ok) {
              const retryReader = retryRes.body?.getReader();
              if (retryReader) {
                const retryDecoder = new TextDecoder();
                let retryAccum = '';
                let retryCanvasArtifact: CanvasArtifactRef | null = null;
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
                        setStreamingText(shouldRouteChatArtifact(retryAccum) ? chatArtifactStreamingMessage(retryAccum) : retryAccum);
                      } else if (parsed.type === 'tool_start') {
                        beginTraceEntry(parsed.tool);
                      } else if (parsed.type === 'tool_done') {
                        finishTraceEntry(parsed.tool);
                        retryCanvasArtifact = dispatchCanvasActionResult(parsed.result) ?? retryCanvasArtifact;
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
                  const routed = retryCanvasArtifact
                    ? { opened: true, id: retryCanvasArtifact.id, title: retryCanvasArtifact.title, chatMessage: retryAccum }
                    : routeChatArtifactToCanvas(retryAccum, 'auth_chat_retry_fallback', surfaceContext?.dealTitle);
                  setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    role: 'assistant' as const,
                    content: routed.chatMessage,
                    created_at: new Date().toISOString(),
                    metadata: routed.opened ? { canvasArtifact: { id: routed.id, title: routed.title, source: 'auth_chat_retry_fallback' } } : undefined,
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
          action: { label: 'Retry', handler: () => sendMessageRef.current?.(content, surfaceContext, modelPreference) },
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

  const confirmStagedAction = useCallback(async (id: number, summary?: string) => {
    try {
      const res = await fetch(`/api/agency/actions/${id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ confirmationSummary: summary || `Confirmed staged action ${id}` }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not confirm action');

      const result = data.result || {};
      if (result.canvas_action) {
        window.dispatchEvent(new CustomEvent('smbx:canvas_action', { detail: result }));
      }
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant' as const,
        content: data.status === 'executed'
          ? 'Confirmed. I executed the staged action.'
          : `Confirmed, but the action is ${data.status}. ${result.message || result.error || ''}`.trim(),
        created_at: new Date().toISOString(),
      }]);
      loadConversations();
    } catch (err: any) {
      showToast("Couldn't confirm action", { tone: 'error' });
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant' as const,
        content: err.message || 'I could not confirm that action.',
        created_at: new Date().toISOString(),
      }]);
    }
  }, [loadConversations]);

  const cancelStagedAction = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/agency/actions/${id}/cancel`, {
        method: 'POST',
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not cancel action');
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant' as const,
        content: 'Canceled. I did not execute that staged action.',
        created_at: new Date().toISOString(),
      }]);
    } catch (err: any) {
      showToast("Couldn't cancel action", { tone: 'error' });
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant' as const,
        content: err.message || 'I could not cancel that action.',
        created_at: new Date().toISOString(),
      }]);
    }
  }, []);

  // Keep the ref pointing at the latest sendMessage so toast retry handlers
  // never call a stale implementation.
  useEffect(() => { sendMessageRef.current = sendMessage; }, [sendMessage]);

  // Select a conversation
  const selectConversation = useCallback((id: number) => {
    setActiveConversationId(id);
    setPaywallData(null);
    // Re-selecting the already-active thread after its load failed: the id
    // state doesn't change so the load effect won't re-fire — fetch directly.
    // (loadMessages sets loadedConvIdRef first, so when the id DID change the
    // effect sees it already claimed and doesn't double-fetch.)
    if (!sendingRef.current && loadedConvIdRef.current !== id) {
      loadMessagesRef.current(id);
    }
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
    toolTrace,
    activeDealId,
    currentGate,
    paywallData,
    sendMessage,
    uploadFile,
    confirmStagedAction,
    cancelStagedAction,
    selectConversation,
    newConversation,
    createConversation,
    openGeneral,
    setPaywallData,
    setActiveConversationId,
    loadConversations,
  };
}
