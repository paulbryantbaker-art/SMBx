/**
 * Deal Messages Panel — internal chat between deal participants.
 *
 * Attorney, CPA, broker, owner — everyone on the deal can message here.
 * Shows participant roles, threaded messages, and timestamps.
 * Sits in the canvas as a tab or alongside documents.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { authHeaders } from '../../hooks/useAuth';

interface Message {
  id: number;
  content: string;
  parent_id: number | null;
  created_at: string;
  email: string;
  display_name: string | null;
  participant_role: string | null;
}

interface DealMessagesPanelProps {
  dealId: number;
  currentUserEmail?: string;
  onClose?: () => void;
}

const ROLE_COLORS: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  owner:       { bg: '#D44A78', text: '#fff', darkBg: '#E8709A', darkText: '#fff' },
  attorney:    { bg: '#2563EB', text: '#fff', darkBg: '#3B82F6', darkText: '#fff' },
  cpa:         { bg: '#059669', text: '#fff', darkBg: '#10B981', darkText: '#fff' },
  broker:      { bg: '#D97706', text: '#fff', darkBg: '#F59E0B', darkText: '#1A1C1E' },
  lender:      { bg: '#7C3AED', text: '#fff', darkBg: '#8B5CF6', darkText: '#fff' },
  consultant:  { bg: '#6B7280', text: '#fff', darkBg: '#9CA3AF', darkText: '#1A1C1E' },
  counterparty:{ bg: '#DC2626', text: '#fff', darkBg: '#EF4444', darkText: '#fff' },
  auditor:     { bg: '#0891B2', text: '#fff', darkBg: '#06B6D4', darkText: '#1A1C1E' },
};

function RoleBadge({ role }: { role: string | null }) {
  if (!role) return null;
  const colors = ROLE_COLORS[role] || { bg: '#6B7280', text: '#fff', darkBg: '#9CA3AF', darkText: '#1A1C1E' };
  return (
    <span
      className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
      style={{ background: colors.bg, color: colors.text }}
    >
      {role}
    </span>
  );
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function DealMessagesPanel({ dealId, currentUserEmail, onClose }: DealMessagesPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/deals/${dealId}/messages`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [dealId]);

  // Initial fetch + poll every 10 seconds
  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 10000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchMessages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    if (!draft.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/deals/${dealId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ content: draft.trim() }),
      });
      if (res.ok) {
        setDraft('');
        fetchMessages();
        textareaRef.current?.focus();
      }
    } catch { /* ignore */ }
    setSending(false);
  };

  const isMe = (email: string) => currentUserEmail && email === currentUserEmail;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#1A1C1E]">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-[#EBE7DF] dark:border-[#3A3C3E]">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D44A78" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          <span className="text-sm font-semibold text-[#0D0D0D] dark:text-[#F5F3EF]">
            Deal Discussion
          </span>
          <span className="text-[10px] text-[#A9A49C]">{messages.length} messages</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-6 h-6 rounded hover:bg-[#F5F5F5] dark:hover:bg-[#2A2C2E] flex items-center justify-center cursor-pointer border-0 bg-transparent"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#D44A78] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-[#A9A49C]">No messages yet</p>
            <p className="text-xs text-[#A9A49C] mt-1">Start a conversation with your deal team</p>
          </div>
        )}

        {messages.map(msg => {
          const mine = isMe(msg.email);
          return (
            <div key={msg.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
              {/* Sender info */}
              <div className={`flex items-center gap-1.5 mb-1 ${mine ? 'flex-row-reverse' : ''}`}>
                <span className="text-[11px] font-semibold text-[#3D3B37] dark:text-[#C8C4BC]">
                  {mine ? 'You' : msg.display_name || msg.email.split('@')[0]}
                </span>
                <RoleBadge role={msg.participant_role} />
                <span className="text-[10px] text-[#A9A49C]">{timeAgo(msg.created_at)}</span>
              </div>

              {/* Message bubble */}
              <div
                className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  mine
                    ? 'bg-[#D44A78] text-white rounded-br-sm'
                    : 'bg-[#F5F5F5] dark:bg-[#2A2C2E] text-[#0D0D0D] dark:text-[#E8E6E3] rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Compose */}
      <div className="shrink-0 px-4 py-3 border-t border-[#EBE7DF] dark:border-[#3A3C3E]">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Message your deal team..."
            rows={1}
            className="flex-1 resize-none text-sm text-[#0D0D0D] dark:text-[#E8E6E3] bg-[#F5F5F5] dark:bg-[#2A2C2E] rounded-xl px-3.5 py-2.5 border-0 outline-none placeholder:text-[#A9A49C]"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim() || sending}
            className={`w-9 h-9 rounded-full flex items-center justify-center border-0 cursor-pointer transition-colors shrink-0 ${
              draft.trim()
                ? 'bg-[#D44A78] text-white hover:bg-[#B03860]'
                : 'bg-[#D8D8DA] text-white cursor-not-allowed'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
