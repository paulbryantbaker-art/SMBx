/**
 * useNotifications — shared notification state for the V6 desktop + mobile bells.
 *
 * Backed by server/routes/notifications.ts:
 *   GET   /api/notifications?limit=N        → { notifications, unreadCount }
 *   PATCH /api/notifications/:id/read       → mark one read
 *   POST  /api/notifications/read-all       → mark all read
 *
 * Polls every POLL_MS so the unread badge stays fresh without a websocket
 * (DT-3 replaced realtime — notifications are row-backed, polled here).
 * markRead / markAllRead update local state optimistically so the badge and
 * unread dots react instantly, then the request fires in the background.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { authHeaders } from './useAuth';

export interface AppNotification {
  id: number;
  deal_id: number | null;
  type: string;
  title: string;
  body: string | null;
  action_url: string | null;
  read_at: string | null;
  created_at: string;
  /** Client-only: set after the user accepts/declines an inline deal_request,
   *  so the row shows a resolved label instead of the action buttons. */
  _responded?: 'accepted' | 'declined';
}

const POLL_MS = 30000;

export function useNotifications(enabled = true) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  // Guards against a poll response landing after an optimistic mark-all-read
  // and resurrecting the badge for a beat. Bumped on every local mutation.
  const mutationRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    const stamp = mutationRef.current;
    try {
      const res = await fetch('/api/notifications?limit=20', { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      // A local mutation happened mid-flight → drop this stale snapshot.
      if (stamp !== mutationRef.current) return;
      const incoming: AppNotification[] = Array.isArray(data.notifications) ? data.notifications : [];
      setNotifications(prev => {
        // Preserve a locally-resolved deal_request across polls — the server row
        // persists after accept/decline, and we don't want the buttons to reappear.
        const responded = new Map(prev.filter(n => n._responded).map(n => [n.id, n._responded!]));
        return responded.size
          ? incoming.map(n => (responded.has(n.id) ? { ...n, _responded: responded.get(n.id) } : n))
          : incoming;
      });
      setUnreadCount(typeof data.unreadCount === 'number' ? data.unreadCount : 0);
    } catch {
      /* network blip — keep last known state, next poll retries */
    } finally {
      setLoaded(true);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    refresh();
    const interval = setInterval(refresh, POLL_MS);
    return () => clearInterval(interval);
  }, [enabled, refresh]);

  const markRead = useCallback(async (id: number) => {
    mutationRef.current += 1;
    let wasUnread = false;
    setNotifications(prev =>
      prev.map(n => {
        if (n.id === id && !n.read_at) wasUnread = true;
        return n.id === id ? { ...n, read_at: n.read_at || new Date().toISOString() } : n;
      }),
    );
    if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH', headers: authHeaders() });
    } catch {
      /* optimistic; next poll reconciles */
    }
  }, []);

  const markAllRead = useCallback(async () => {
    mutationRef.current += 1;
    setNotifications(prev =>
      prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })),
    );
    setUnreadCount(0);
    try {
      await fetch('/api/notifications/read-all', { method: 'POST', headers: authHeaders() });
    } catch {
      /* optimistic; next poll reconciles */
    }
  }, []);

  // Accept / decline an in-app deal request inline from the bell. The
  // deal_request notification carries deal_id; we POST by deal, then resolve the
  // row locally (optimistic) so the buttons swap to a status label immediately.
  const respondToDealRequest = useCallback(
    async (
      notif: AppNotification,
      action: 'accept' | 'decline',
    ): Promise<{ ok: boolean; dealId?: number }> => {
      if (!notif.deal_id) return { ok: false };
      mutationRef.current += 1;
      const resolved = action === 'accept' ? 'accepted' : 'declined';
      setNotifications(prev =>
        prev.map(n =>
          n.id === notif.id
            ? { ...n, _responded: resolved, read_at: n.read_at || new Date().toISOString() }
            : n,
        ),
      );
      if (!notif.read_at) setUnreadCount(prev => Math.max(0, prev - 1));
      try {
        const res = await fetch(`/api/deals/${notif.deal_id}/request/${action}`, {
          method: 'POST',
          headers: authHeaders(),
        });
        if (!res.ok) throw new Error(String(res.status));
        return { ok: true, dealId: notif.deal_id };
      } catch {
        // Roll back the optimistic resolve so the user can retry.
        setNotifications(prev => prev.map(n => (n.id === notif.id ? { ...n, _responded: undefined } : n)));
        return { ok: false };
      }
    },
    [],
  );

  return { notifications, unreadCount, loaded, refresh, markRead, markAllRead, respondToDealRequest };
}

/** "now" / "5m" / "3h" / "2d" relative timestamp for notification rows. */
export function notifTimeAgo(date: string): string {
  const ms = Date.now() - new Date(date).getTime();
  if (!Number.isFinite(ms) || ms < 0) return 'now';
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
}
