/**
 * NotificationBell — bell icon with unread badge + dropdown panel.
 * Polls every 30s. Clicking a notification navigates to its action_url.
 * Dark-mode aware. Works on both mobile and desktop.
 */
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

const TYPE_META: Record<string, { color: string; icon: string }> = {
  gate_advance:     { color: '#D44A78', icon: 'arrow_circle_right' },
  deliverable_ready:{ color: '#16a34a', icon: 'description' },
  review_request:   { color: '#f59e0b', icon: 'rate_review' },
  review_approved:  { color: '#16a34a', icon: 'check_circle' },
  review_changes:   { color: '#ef4444', icon: 'edit_note' },
  new_document:     { color: '#2563eb', icon: 'upload_file' },
  deal_comment:     { color: '#7c3aed', icon: 'chat' },
  share_viewed:     { color: '#6366f1', icon: 'visibility' },
  thesis_match:     { color: '#D44A78', icon: 'travel_explore' },
  new_listing_match:{ color: '#D44A78', icon: 'storefront' },
  invitation:       { color: '#2563eb', icon: 'person_add' },
  nudge:            { color: '#D44A78', icon: 'notifications_active' },
  system:           { color: '#6E6A63', icon: 'info' },
};

function timeAgo(date: string): string {
  const ms = Date.now() - new Date(date).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

interface Props {
  dark?: boolean;
  onNavigate?: (url: string) => void;
}

export default function NotificationBell({ dark = false, onNavigate }: Props) {
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
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click/tap
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
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

  const handleNotificationClick = (n: Notification) => {
    if (!n.read_at) markAsRead(n.id);
    if (n.action_url && onNavigate) {
      onNavigate(n.action_url);
      setOpen(false);
    }
  };

  // Colors
  const bg = dark ? '#1f2123' : '#fff';
  const headerBg = dark ? '#1a1c1e' : '#fafafa';
  const borderC = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const textC = dark ? '#f0f0f3' : '#0f1012';
  const mutedC = dark ? 'rgba(218,218,220,0.5)' : '#9ea0a5';
  const unreadBg = dark ? 'rgba(232,112,154,0.08)' : '#FFF8F5';
  const unreadHover = dark ? 'rgba(232,112,154,0.12)' : '#FFF3ED';
  const readHover = dark ? 'rgba(255,255,255,0.04)' : '#fafaf8';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
        className="relative flex items-center justify-center w-10 h-10 rounded-full border-0 cursor-pointer transition-all active:scale-95"
        style={{
          background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.04)',
          WebkitTapHighlightColor: 'transparent',
        }}
        aria-label="Notifications"
      >
        <span className="material-symbols-outlined text-[20px]" style={{ color: dark ? 'rgba(218,218,220,0.7)' : '#636467' }}>
          notifications
        </span>
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1"
            style={{ background: '#D44A78' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-[min(340px,90vw)] rounded-2xl overflow-hidden z-50"
          style={{
            background: bg,
            border: `1px solid ${borderC}`,
            boxShadow: dark
              ? '0 8px 32px rgba(0,0,0,0.5)'
              : '0 8px 32px rgba(0,0,0,0.08)',
            maxHeight: '70vh',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ background: headerBg, borderBottom: `1px solid ${borderC}` }}
          >
            <span className="text-[13px] font-bold" style={{ color: textC }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] font-semibold border-0 cursor-pointer bg-transparent"
                style={{ color: '#D44A78', WebkitTapHighlightColor: 'transparent' }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 48px)' }}>
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <span className="material-symbols-outlined text-[28px] mb-2 block" style={{ color: mutedC }}>
                  notifications_none
                </span>
                <p className="text-[13px] m-0" style={{ color: mutedC }}>All caught up</p>
              </div>
            ) : (
              notifications.map(n => {
                const meta = TYPE_META[n.type] || TYPE_META.system;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className="w-full text-left px-4 py-3 border-0 cursor-pointer transition-colors"
                    style={{
                      background: n.read_at ? 'transparent' : unreadBg,
                      borderBottom: `1px solid ${borderC}`,
                      WebkitTapHighlightColor: 'transparent',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = n.read_at ? readHover : unreadHover; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = n.read_at ? 'transparent' : unreadBg; }}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="material-symbols-outlined text-[18px] mt-0.5 shrink-0"
                        style={{ color: n.read_at ? mutedC : meta.color }}
                      >
                        {meta.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] m-0 leading-snug" style={{
                          color: n.read_at ? mutedC : textC,
                          fontWeight: n.read_at ? 400 : 600,
                        }}>
                          {n.title}
                        </p>
                        {n.body && (
                          <p className="text-[11px] m-0 mt-0.5 line-clamp-2" style={{ color: mutedC }}>
                            {n.body}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] shrink-0 mt-0.5" style={{ color: mutedC }}>
                        {timeAgo(n.created_at)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
