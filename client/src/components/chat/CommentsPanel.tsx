import { useState, useEffect, useRef } from 'react';
import { authHeaders } from '../../hooks/useAuth';

interface Comment {
  id: number;
  content: string;
  section_ref: string | null;
  resolved: boolean;
  created_at: string;
  display_name: string;
  email: string;
  participant_role: string | null;
}

interface CommentsPanelProps {
  deliverableId: number;
  onClose: () => void;
}

export default function CommentsPanel({ deliverableId, onClose }: CommentsPanelProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [sectionRef, setSectionRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showResolved, setShowResolved] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/deliverables/${deliverableId}/comments`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchComments(); }, [deliverableId]);

  const handleSubmit = async () => {
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/deliverables/${deliverableId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ content: newComment.trim(), sectionRef: sectionRef.trim() || null }),
      });
      if (res.ok) {
        setNewComment('');
        setSectionRef('');
        await fetchComments();
      }
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  const handleResolve = async (commentId: number) => {
    try {
      await fetch(`/api/deliverable-comments/${commentId}/resolve`, {
        method: 'PATCH',
        headers: authHeaders(),
      });
      await fetchComments();
    } catch { /* ignore */ }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const active = comments.filter(c => !c.resolved);
  const resolved = comments.filter(c => c.resolved);
  const displayed = showResolved ? comments : active;

  return (
    <div className="flex flex-col h-full bg-white" style={{ borderLeft: '1px solid rgba(0,0,0,0.08)', width: 320 }}>
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4687A" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          <span className="text-sm font-semibold text-[#0D0D0D]">Comments</span>
          {active.length > 0 && (
            <span className="text-[10px] font-bold bg-[#C4687A] text-white rounded-full w-5 h-5 flex items-center justify-center">
              {active.length}
            </span>
          )}
        </div>
        <button onClick={onClose} className="w-6 h-6 rounded hover:bg-[#F5F5F5] flex items-center justify-center cursor-pointer border-0 bg-transparent">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Filter toggle */}
      {resolved.length > 0 && (
        <div className="shrink-0 px-4 py-2" style={{ borderBottom: '1px solid #EBE7DF' }}>
          <button
            onClick={() => setShowResolved(!showResolved)}
            className="text-[11px] font-medium text-[#6E6A63] bg-transparent border-0 cursor-pointer hover:text-[#C4687A] transition-colors p-0"
          >
            {showResolved ? 'Hide resolved' : `Show ${resolved.length} resolved`}
          </button>
        </div>
      )}

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3 space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-[#C4687A] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && displayed.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-[#A9A49C]">No comments yet</p>
            <p className="text-xs text-[rgba(0,0,0,0.06)] mt-1">Add a comment to start a discussion</p>
          </div>
        )}

        {displayed.map(comment => (
          <div
            key={comment.id}
            className={`rounded-lg p-3 ${comment.resolved ? 'opacity-60 bg-[#FAFAF8]' : 'bg-[#F9F8F5]'}`}
            style={{ border: '1px solid #EBE7DF' }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-[#C4687A] text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                  {(comment.display_name || comment.email)[0].toUpperCase()}
                </div>
                <span className="text-[11px] font-semibold text-[#0D0D0D]">
                  {comment.display_name || comment.email.split('@')[0]}
                </span>
                {comment.participant_role && (
                  <span className="text-[9px] font-medium uppercase px-1.5 py-0.5 rounded bg-[#EBE7DF] text-[#6E6A63]">
                    {comment.participant_role}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#A9A49C]">
                {formatTimeAgo(comment.created_at)}
              </span>
            </div>

            {comment.section_ref && (
              <div className="text-[10px] font-medium text-[#C4687A] mb-1">
                Re: {comment.section_ref}
              </div>
            )}

            <p className="text-[12px] text-[#3D3B37] leading-relaxed m-0 whitespace-pre-wrap">
              {comment.content}
            </p>

            {!comment.resolved && (
              <button
                onClick={() => handleResolve(comment.id)}
                className="mt-2 text-[10px] font-medium text-[#6E6A63] bg-transparent border-0 cursor-pointer hover:text-[#C4687A] p-0"
              >
                Resolve
              </button>
            )}
            {comment.resolved && (
              <div className="mt-1.5 flex items-center gap-1 text-[10px] text-green-600 font-medium">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                Resolved
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New comment input */}
      <div className="shrink-0 p-3" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
          <textarea
            ref={inputRef}
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment..."
            rows={2}
            className="w-full px-3 py-2 text-[12px] text-[#0D0D0D] bg-white border-0 outline-none resize-none"
            style={{ fontFamily: 'inherit' }}
          />
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#FAFAF8]" style={{ borderTop: '1px solid #EBE7DF' }}>
            <input
              value={sectionRef}
              onChange={e => setSectionRef(e.target.value)}
              placeholder="Section (optional)"
              className="text-[10px] text-[#6E6A63] bg-transparent border-0 outline-none w-32"
              style={{ fontFamily: 'inherit' }}
            />
            <button
              onClick={handleSubmit}
              disabled={!newComment.trim() || submitting}
              className="text-[11px] font-semibold text-white bg-[#C4687A] px-3 py-1 rounded border-0 cursor-pointer hover:bg-[#A85568] transition-colors disabled:opacity-40 disabled:cursor-default"
            >
              {submitting ? '...' : 'Send'}
            </button>
          </div>
        </div>
        <p className="text-[9px] text-[rgba(0,0,0,0.06)] mt-1 text-center m-0">Cmd+Enter to send</p>
      </div>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
