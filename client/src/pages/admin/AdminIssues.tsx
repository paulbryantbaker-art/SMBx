import { useState, useEffect, useCallback } from 'react';
import { authHeaders } from '../../hooks/useAuth';

/* ── types ── */
interface IssueStats {
  open_total: number;
  open_critical: number;
  resolved: number;
  open_features: number;
  errors_24h: number;
}

interface Issue {
  id: number;
  title: string;
  description: string | null;
  user_message: string | null;
  type: string;
  severity: string;
  status: string;
  context: Record<string, unknown> | null;
  resolution: string | null;
  internal_notes: string | null;
  related_service: string | null;
  user_email: string | null;
  user_name: string | null;
  business_name: string | null;
  journey_type: string | null;
  current_gate: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

/* ── helpers ── */
function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'bg-[#EA4335] text-white',
  major: 'bg-[#FBBC04] text-[#1a1c1e]',
  minor: 'bg-[#34A853] text-white',
  enhancement: 'bg-[#f3f3f6] text-[#5d5e61]',
};

const TYPE_STYLES: Record<string, string> = {
  bug: 'bg-red-50 text-[#EA4335]',
  feature_request: 'bg-blue-50 text-[#4E8FD4]',
  feedback: 'bg-green-50 text-[#34A853]',
  system_error: 'bg-yellow-50 text-[#FBBC04]',
};

function formatType(type: string): string {
  return type.replace(/_/g, ' ');
}

/* ── component ── */
export default function AdminIssues() {
  const [stats, setStats] = useState<IssueStats | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [resolveText, setResolveText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showResolveInput, setShowResolveInput] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const headers = authHeaders();
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('type', typeFilter);
      params.set('limit', '50');

      const [statsRes, issuesRes] = await Promise.all([
        fetch('/api/admin/issues/stats', { headers }),
        fetch(`/api/admin/issues?${params.toString()}`, { headers }),
      ]);

      const [statsData, issuesData] = await Promise.all([
        statsRes.json(),
        issuesRes.json(),
      ]);

      setStats(statsData);
      setIssues(issuesData.issues ?? []);
    } catch (err) {
      console.error('AdminIssues fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleResolve = async (id: number) => {
    if (!resolveText.trim()) return;
    try {
      await fetch(`/api/admin/issues/${id}`, {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved', resolution: resolveText }),
      });
      setResolveText('');
      setShowResolveInput(false);
      fetchData();
    } catch (err) {
      console.error('Resolve error:', err);
    }
  };

  const handleAddNote = async (id: number) => {
    if (!noteText.trim()) return;
    try {
      await fetch(`/api/admin/issues/${id}`, {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ internal_notes: noteText }),
      });
      setNoteText('');
      setShowNoteInput(false);
      fetchData();
    } catch (err) {
      console.error('Add note error:', err);
    }
  };

  const handleToggleExpand = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      setShowResolveInput(false);
      setShowNoteInput(false);
      setResolveText('');
      setNoteText('');
    }
  };

  /* ── loading skeleton ── */
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-20 bg-[#EEEEF0] rounded-xl" />
            ))}
        </div>
        <div className="h-12 bg-[#EEEEF0] rounded-xl mt-6" />
        <div className="space-y-3 mt-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-16 bg-[#EEEEF0] rounded-2xl" />
            ))}
        </div>
      </div>
    );
  }

  /* ── render ── */
  return (
    <div>
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl p-4 bg-white border border-[#EEEEF0] text-center">
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#5d5e61] mb-1">
            Open
          </p>
          <p className="text-2xl font-black text-[#1a1c1e]">
            {stats?.open_total ?? 0}
          </p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-[#EA4335] text-center">
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#EA4335] mb-1">
            Critical
          </p>
          <p className="text-2xl font-black text-[#EA4335]">
            {stats?.open_critical ?? 0}
          </p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-[#34A853] text-center">
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#34A853] mb-1">
            Resolved
          </p>
          <p className="text-2xl font-black text-[#34A853]">
            {stats?.resolved ?? 0}
          </p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-[#FBBC04] text-center">
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#FBBC04] mb-1">
            Errors (24h)
          </p>
          <p className="text-2xl font-black text-[#FBBC04]">
            {stats?.errors_24h ?? 0}
          </p>
        </div>
      </div>

      {/* Filter row */}
      <div className="mt-6 flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg bg-white border border-[#EEEEF0] px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg bg-white border border-[#EEEEF0] px-3 py-2 text-sm"
        >
          <option value="">All Types</option>
          <option value="bug">Bug</option>
          <option value="feature_request">Feature Request</option>
          <option value="feedback">Feedback</option>
          <option value="system_error">System Error</option>
        </select>
      </div>

      {/* Issue list */}
      <div className="mt-4 space-y-3">
        {issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#5d5e61]">
            <svg
              className="w-10 h-10 mb-3 text-[#34A853]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium">No issues found</p>
          </div>
        ) : (
          issues.map((issue) => (
            <div
              key={issue.id}
              className="rounded-2xl bg-white border border-[#EEEEF0] overflow-hidden"
            >
              {/* Card header */}
              <button
                type="button"
                onClick={() => handleToggleExpand(issue.id)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#fafafa] transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase shrink-0 ${
                      SEVERITY_STYLES[issue.severity] ?? SEVERITY_STYLES.enhancement
                    }`}
                  >
                    {issue.severity}
                  </span>
                  <span className="text-sm font-semibold text-[#1a1c1e] truncate">
                    {issue.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-medium lowercase ${
                      TYPE_STYLES[issue.type] ?? 'bg-[#f3f3f6] text-[#5d5e61]'
                    }`}
                  >
                    {formatType(issue.type)}
                  </span>
                  <span className="text-xs text-[#5d5e61] whitespace-nowrap">
                    {timeAgo(issue.created_at)}
                  </span>
                </div>
              </button>

              {/* Expanded view */}
              {expandedId === issue.id && (
                <div className="bg-[#fafafa] px-5 py-4 border-t border-[#EEEEF0]">
                  {/* Meta info */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
                    {issue.user_email && (
                      <div>
                        <span className="font-bold text-[#5d5e61] uppercase tracking-wider text-[10px]">
                          User
                        </span>
                        <p className="text-[#1a1c1e] mt-0.5">{issue.user_email}</p>
                      </div>
                    )}
                    {issue.business_name && (
                      <div>
                        <span className="font-bold text-[#5d5e61] uppercase tracking-wider text-[10px]">
                          Business
                        </span>
                        <p className="text-[#1a1c1e] mt-0.5">{issue.business_name}</p>
                      </div>
                    )}
                    {issue.journey_type && (
                      <div>
                        <span className="font-bold text-[#5d5e61] uppercase tracking-wider text-[10px]">
                          Journey
                        </span>
                        <p className="text-[#1a1c1e] mt-0.5 capitalize">{issue.journey_type}</p>
                      </div>
                    )}
                    {issue.current_gate && (
                      <div>
                        <span className="font-bold text-[#5d5e61] uppercase tracking-wider text-[10px]">
                          Gate
                        </span>
                        <p className="text-[#1a1c1e] mt-0.5">{issue.current_gate}</p>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {issue.description && (
                    <div className="mb-3">
                      <p className="font-bold text-[#5d5e61] uppercase tracking-wider text-[10px] mb-1">
                        Description
                      </p>
                      <p className="text-sm text-[#1a1c1e]">{issue.description}</p>
                    </div>
                  )}

                  {/* User message */}
                  {issue.user_message && (
                    <div className="mb-3">
                      <p className="font-bold text-[#5d5e61] uppercase tracking-wider text-[10px] mb-1">
                        User Message
                      </p>
                      <p className="text-sm text-[#1a1c1e]">{issue.user_message}</p>
                    </div>
                  )}

                  {/* Context JSON */}
                  {issue.context && Object.keys(issue.context).length > 0 && (
                    <div className="mb-3">
                      <p className="font-bold text-[#5d5e61] uppercase tracking-wider text-[10px] mb-1">
                        Context
                      </p>
                      <pre className="bg-[#f3f3f6] rounded-lg p-3 text-xs overflow-x-auto">
                        {JSON.stringify(issue.context, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Resolution */}
                  {issue.resolution && (
                    <div className="mb-3">
                      <p className="font-bold text-[#34A853] uppercase tracking-wider text-[10px] mb-1">
                        Resolution
                      </p>
                      <p className="text-sm text-[#1a1c1e]">{issue.resolution}</p>
                    </div>
                  )}

                  {/* Internal notes */}
                  {issue.internal_notes && (
                    <div className="mb-3">
                      <p className="font-bold text-[#5d5e61] uppercase tracking-wider text-[10px] mb-1">
                        Internal Notes
                      </p>
                      <p className="text-sm text-[#1a1c1e]">{issue.internal_notes}</p>
                    </div>
                  )}

                  {/* Quick actions */}
                  <div className="flex gap-2 mt-4">
                    {issue.status !== 'resolved' && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowResolveInput(!showResolveInput);
                          setShowNoteInput(false);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#34A853] text-white"
                      >
                        Resolve
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setShowNoteInput(!showNoteInput);
                        setShowResolveInput(false);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#f3f3f6] text-[#5d5e61]"
                    >
                      Add Note
                    </button>
                  </div>

                  {/* Resolve input */}
                  {showResolveInput && (
                    <div className="mt-3">
                      <textarea
                        value={resolveText}
                        onChange={(e) => setResolveText(e.target.value)}
                        placeholder="Describe the resolution..."
                        className="w-full rounded-lg border border-[#EEEEF0] px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-[#34A853]"
                      />
                      <button
                        type="button"
                        onClick={() => handleResolve(issue.id)}
                        className="mt-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#34A853] text-white"
                      >
                        Submit Resolution
                      </button>
                    </div>
                  )}

                  {/* Note input */}
                  {showNoteInput && (
                    <div className="mt-3">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add an internal note..."
                        className="w-full rounded-lg border border-[#EEEEF0] px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-[#EEEEF0]"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddNote(issue.id)}
                        className="mt-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#f3f3f6] text-[#5d5e61]"
                      >
                        Save Note
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
