/**
 * V6NotificationBell — desktop nav-foot notifications bell (CD "Ramp" chrome).
 *
 * Sits in `.wknav-foot` beside the New (+) button and the account avatar.
 * Renders a bell button with an unread-count badge; clicking opens a popover
 * listing recent notifications. Because it's anchored to the nav foot, the
 * popover opens UPWARD (`bottom: 100%`) and to the RIGHT (see `.wknotif-pop`
 * in workspace.css). Clicking a row marks it read and navigates via its
 * action_url. "Mark all read" clears the badge.
 *
 * Navigation: action_url is a V6 hash route (e.g.
 * `/#mode=pipeline&tab=deal-team-123`). The V6App hashchange listener already
 * decodes `#mode=...&tab=...` into the right canvas tab, so onNavigate just
 * needs to apply the URL's hash — done by the parent (V6App) so it owns the
 * single source of routing truth.
 *
 * Tokens only (--surface / --line / --ink*). No position:fixed full-viewport
 * background (Safari toolbar-tint rule); the backdrop is a transparent
 * click-catcher, the panel is position:absolute anchored to the bell.
 */
import { useEffect, useRef, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useNotifications, notifTimeAgo, type AppNotification } from '../../hooks/useNotifications';

interface Props {
  /** Apply a notification's action_url. V6App routes it through the hash. */
  onNavigate: (actionUrl: string) => void;
}

export default function V6NotificationBell({ onNavigate }: Props) {
  const { notifications, unreadCount, markRead, markAllRead, refresh, respondToDealRequest } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on Escape (outside click handled by the transparent backdrop).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const onRowClick = (n: AppNotification) => {
    if (!n.read_at) markRead(n.id);
    if (n.action_url) {
      onNavigate(n.action_url);
      setOpen(false);
    }
  };

  return (
    <div className="wknotif-wrap" ref={wrapRef}>
      <button
        className="wkicon wknotif-btn wk-tap"
        title="Notifications"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        onClick={() => {
          setOpen(o => {
            const next = !o;
            if (next) refresh();
            return next;
          });
        }}
      >
        <Bell size={18} strokeWidth={2.15} absoluteStrokeWidth aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="wknotif-badge" aria-hidden="true">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="wkacct-backdrop" onClick={() => setOpen(false)} />
          <div className="wknotif-pop" role="menu" aria-label="Notifications">
            <div className="wknotif-head">
              <span className="wknotif-title">Notifications</span>
              {unreadCount > 0 && (
                <button className="wknotif-allread" onClick={markAllRead}>
                  Mark all read
                </button>
              )}
            </div>
            <div className="wknotif-list">
              {notifications.length === 0 ? (
                <div className="wknotif-empty">
                  <BellOff size={22} strokeWidth={1.8} aria-hidden="true" />
                  <span>You're all caught up</span>
                </div>
              ) : (
                notifications.map(n => {
                  const unread = !n.read_at;
                  // A deal request is actionable inline (Accept / Decline). Render
                  // it as a div — the action controls are buttons, and buttons
                  // can't nest inside a button row.
                  if (n.type === 'deal_request') {
                    const responded = n._responded;
                    return (
                      <div key={n.id} className={`wknotif-row${unread ? ' unread' : ''}`} role="menuitem">
                        {unread && <span className="wknotif-dot" aria-hidden="true" />}
                        <div className="wknotif-body">
                          <div className="wknotif-row-title">{n.title}</div>
                          {responded ? (
                            <div
                              className="wknotif-row-sub"
                              style={{ color: responded === 'accepted' ? 'var(--cta, #10E060)' : 'var(--ink-3, #9a968c)', fontWeight: 600 }}
                            >
                              {responded === 'accepted' ? '✓ Joined the deal' : 'Declined'}
                            </div>
                          ) : (
                            <>
                              {n.body && <div className="wknotif-row-sub">{n.body}</div>}
                              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                <button
                                  type="button"
                                  onClick={() => respondToDealRequest(n, 'accept')}
                                  style={{ background: 'var(--cta, #10E060)', color: '#00210F', border: 'none', borderRadius: 8, padding: '5px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                                >
                                  Accept
                                </button>
                                <button
                                  type="button"
                                  onClick={() => respondToDealRequest(n, 'decline')}
                                  style={{ background: 'transparent', color: 'var(--ink-2, #55524c)', border: '1px solid var(--line, #e3e0d8)', borderRadius: 8, padding: '5px 14px', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}
                                >
                                  Decline
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                        <span className="wknotif-time">{notifTimeAgo(n.created_at)}</span>
                      </div>
                    );
                  }
                  return (
                    <button
                      key={n.id}
                      className={`wknotif-row${unread ? ' unread' : ''}${n.action_url ? ' clickable' : ''}`}
                      role="menuitem"
                      onClick={() => onRowClick(n)}
                    >
                      {unread && <span className="wknotif-dot" aria-hidden="true" />}
                      <div className="wknotif-body">
                        <div className="wknotif-row-title">{n.title}</div>
                        {n.body && <div className="wknotif-row-sub">{n.body}</div>}
                      </div>
                      <span className="wknotif-time">{notifTimeAgo(n.created_at)}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
