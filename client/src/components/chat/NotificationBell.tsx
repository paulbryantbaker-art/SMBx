import { useState, useEffect, useCallback, useRef } from 'react';
import { authHeaders } from '../../hooks/useAuth';

interface Notification {
  id: number;
  deal_id: number | null;
  type: string;
  title: string;
  body: string | null;
  action_url: string | null;
  read_at: string | null;
  created_at: string;
}

const TYPE_ICONS: Record<string, string> = {
  gate_advance: '#D4714E',
  deliverable_ready: '#16a34a',
  invitation: '#2563eb',
  comment: '#7c3aed',
  nudge: '#D4714E',
  system: '#6E6A63',
};

function timeAgo(date: string): string {
  const ms = Date.now() - new Date(date).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=20', { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // Poll every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const markAsRead = async (notifId: number) => {
    try {
      await fetch(`/api/notifications/${notifId}/read`, {
        method: 'PATCH',
        headers: authHeaders(),
      });
      setNotifications(prev => prev.map(n =>
        n.id === notifId ? { ...n, read_at: new Date().toISOString() } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: authHeaders(),
      });
      setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
        className="relative flex items-center justify-center w-9 h-9 rounded-full bg-transparent border-0 cursor-pointer text-[#6E6A63] hover:bg-[#F3F0EA] transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#D4714E] text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-border overflow-hidden z-50" style={{ maxHeight: '24rem' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <span className="text-sm font-semibold text-[#1A1A18]">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] font-semibold text-[#D4714E] bg-transparent border-0 cursor-pointer hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications list */}
          <div className="overflow-y-auto" style={{ maxHeight: '20rem' }}>
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-[#A9A49C] m-0">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => { if (!n.read_at) markAsRead(n.id); }}
                  className={`w-full text-left px-4 py-3 border-0 cursor-pointer transition-colors ${
                    n.read_at ? 'bg-white hover:bg-[#FAFAF8]' : 'bg-[#FFF8F5] hover:bg-[#FFF3ED]'
                  }`}
                  style={{ borderBottom: '1px solid #F3F0EA' }}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                      style={{ backgroundColor: n.read_at ? '#DDD9D1' : (TYPE_ICONS[n.type] || '#6E6A63') }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] m-0 leading-snug ${n.read_at ? 'text-[#6E6A63]' : 'text-[#1A1A18] font-medium'}`}>
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="text-[11px] text-[#A9A49C] m-0 mt-0.5 line-clamp-2">{n.body}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-[#A9A49C] shrink-0">{timeAgo(n.created_at)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
