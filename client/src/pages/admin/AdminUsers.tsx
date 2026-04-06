import { useState, useEffect, useCallback } from 'react';
import { authHeaders } from '../../hooks/useAuth';

interface User {
  id: number;
  email: string;
  display_name: string | null;
  role: string;
  league: string | null;
  created_at: string;
  last_activity: string | null;
  message_count: number;
  deal_count: number;
  subscription_status: string | null;
  subscription_plan: string | null;
}

interface Conversation {
  id: number;
  title: string;
  journey: string | null;
  current_gate: string | null;
  updated_at: string;
  message_count: number;
}

interface Deliverable {
  id: number;
  type: string;
  status: string;
  created_at: string;
}

interface ExpandedData {
  conversations: Conversation[];
  deliverables: Deliverable[];
}

const LIMIT = 50;

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

function PlanBadge({ plan }: { plan: string | null }) {
  const label = plan || 'Free';
  const normalized = (plan || '').toLowerCase();

  let classes = 'bg-[#f3f3f6] text-[#5d5e61]';
  if (normalized === 'starter') classes = 'bg-[#FBBC04]/10 text-[#FBBC04]';
  else if (normalized === 'professional') classes = 'bg-[#D44A78]/10 text-[#D44A78]';
  else if (normalized === 'enterprise') classes = 'bg-[#1a1c1e] text-white';

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${classes}`}>
      {label}
    </span>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: 7 }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 rounded bg-[#eeeef0] animate-pulse" style={{ width: j === 0 ? '60%' : j === 1 ? '45%' : '30%' }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expandedData, setExpandedData] = useState<ExpandedData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(LIMIT), search: q });
      const res = await fetch(`/api/admin/users?${params}`, { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchUsers(1, search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchUsers]);

  // Page changes (non-search)
  useEffect(() => {
    fetchUsers(page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Fetch expanded data
  useEffect(() => {
    if (expandedId === null) {
      setExpandedData(null);
      return;
    }

    let cancelled = false;

    async function fetchExpanded() {
      try {
        const [convRes, delRes] = await Promise.all([
          fetch(`/api/admin/users/${expandedId}/conversations`, { headers: authHeaders() }),
          fetch(`/api/admin/users/${expandedId}/deliverables`, { headers: authHeaders() }),
        ]);

        if (cancelled) return;

        const convData = convRes.ok ? await convRes.json() : { conversations: [] };
        const delData = delRes.ok ? await delRes.json() : { deliverables: [] };

        if (!cancelled) {
          setExpandedData({
            conversations: convData.conversations || [],
            deliverables: delData.deliverables || [],
          });
        }
      } catch (err) {
        console.error('Error fetching expanded data:', err);
        if (!cancelled) setExpandedData({ conversations: [], deliverables: [] });
      }
    }

    fetchExpanded();
    return () => { cancelled = true; };
  }, [expandedId]);

  const startIndex = (page - 1) * LIMIT + 1;
  const endIndex = Math.min(page * LIMIT, total);
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      {/* Search bar */}
      <div className="relative">
        <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-[#9e9ea0] text-[20px]">
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email or name..."
          className="w-full rounded-xl bg-white border border-[#EEEEF0] pl-10 pr-4 py-3 text-sm outline-none focus:border-[#D44A78] transition-colors"
        />
      </div>

      {/* User table */}
      <div className="rounded-2xl bg-white border border-[#EEEEF0] overflow-hidden mt-4">
        <table className="w-full">
          <thead>
            <tr className="bg-[#f3f3f6]">
              <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-widest font-bold text-[#5d5e61]">Email</th>
              <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-widest font-bold text-[#5d5e61]">Name</th>
              <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-widest font-bold text-[#5d5e61]">Plan</th>
              <th className="text-right px-4 py-2.5 text-[10px] uppercase tracking-widest font-bold text-[#5d5e61]">Messages</th>
              <th className="text-right px-4 py-2.5 text-[10px] uppercase tracking-widest font-bold text-[#5d5e61]">Deals</th>
              <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-widest font-bold text-[#5d5e61]">Created</th>
              <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-widest font-bold text-[#5d5e61]">Last Active</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows />
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-[#9e9ea0]">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <>
                  <tr
                    key={user.id}
                    onClick={() => setExpandedId(expandedId === user.id ? null : user.id)}
                    className="hover:bg-[#fafafa] cursor-pointer transition-all text-sm border-t border-[#EEEEF0] first:border-t-0"
                  >
                    <td className="px-4 py-3 text-[#1a1a18] font-medium truncate max-w-[200px]">{user.email}</td>
                    <td className="px-4 py-3 text-[#5d5e61] truncate max-w-[150px]">{user.display_name || '—'}</td>
                    <td className="px-4 py-3">
                      <PlanBadge plan={user.subscription_plan} />
                    </td>
                    <td className="px-4 py-3 text-right text-[#5d5e61] tabular-nums">{user.message_count.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-[#5d5e61] tabular-nums">{user.deal_count}</td>
                    <td className="px-4 py-3 text-[#5d5e61]">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-[#5d5e61]">{user.last_activity ? timeAgo(user.last_activity) : '—'}</td>
                  </tr>

                  {expandedId === user.id && (
                    <tr key={`${user.id}-expanded`}>
                      <td colSpan={7} className="bg-[#fafafa] border-t border-[#EEEEF0] px-6 py-4">
                        {!expandedData ? (
                          <div className="flex items-center gap-2 text-sm text-[#9e9ea0]">
                            <div className="h-4 w-4 border-2 border-[#D44A78] border-t-transparent rounded-full animate-spin" />
                            Loading...
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Recent Conversations */}
                            <div>
                              <h4 className="text-[11px] uppercase tracking-widest font-bold text-[#5d5e61] mb-2">
                                Recent Conversations
                              </h4>
                              {expandedData.conversations.length === 0 ? (
                                <p className="text-sm text-[#9e9ea0]">No conversations yet</p>
                              ) : (
                                <ul className="space-y-1.5">
                                  {expandedData.conversations.slice(0, 5).map((conv) => (
                                    <li key={conv.id} className="flex items-center justify-between text-sm">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className="truncate text-[#1a1a18]">{conv.title || 'Untitled'}</span>
                                        {conv.journey && (
                                          <span className="shrink-0 text-[10px] uppercase tracking-wide font-semibold text-[#9e9ea0]">
                                            {conv.journey}
                                          </span>
                                        )}
                                      </div>
                                      <span className="shrink-0 text-[#9e9ea0] text-xs ml-2">
                                        {conv.message_count} msgs &middot; {timeAgo(conv.updated_at)}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            {/* Recent Deliverables */}
                            <div>
                              <h4 className="text-[11px] uppercase tracking-widest font-bold text-[#5d5e61] mb-2">
                                Recent Deliverables
                              </h4>
                              {expandedData.deliverables.length === 0 ? (
                                <p className="text-sm text-[#9e9ea0]">No deliverables yet</p>
                              ) : (
                                <ul className="space-y-1.5">
                                  {expandedData.deliverables.slice(0, 5).map((del) => (
                                    <li key={del.id} className="flex items-center justify-between text-sm">
                                      <span className="text-[#1a1a18] capitalize">{del.type.replace(/_/g, ' ')}</span>
                                      <span className="text-[#9e9ea0] text-xs">
                                        {del.status} &middot; {new Date(del.created_at).toLocaleDateString()}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#EEEEF0] bg-[#fafafa]">
            <span className="text-sm text-[#5d5e61]">
              Showing {startIndex}–{endIndex} of {total.toLocaleString()} users
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-[#EEEEF0] text-[#1a1a18] hover:bg-[#f3f3f6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-[#EEEEF0] text-[#1a1a18] hover:bg-[#f3f3f6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
