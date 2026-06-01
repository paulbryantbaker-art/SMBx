/* V6 Mobile — Notifications sheet (Liquid-Glass bottom sheet).
   Lists @mention + deal notifications from /api/notifications. Tapping a row
   marks it read and navigates via its action_url (resolved to a mobile view
   by the caller). "Mark all read" clears the badge. Matches the App Store
   glass aesthetic + --mb-* tokens, mirroring the account sheet's surface. */

import { type CSSProperties } from "react";
import { MobileIcon } from "./icons";
import { notifTimeAgo, type AppNotification } from "../../../hooks/useNotifications";

interface Props {
  open: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  unreadCount: number;
  onRow: (n: AppNotification) => void;
  onMarkAllRead: () => void;
}

export function NotificationsSheet({
  open,
  onClose,
  notifications,
  unreadCount,
  onRow,
  onMarkAllRead,
}: Props) {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={S.scrim} aria-hidden="true" />
      <div style={S.sheet} role="dialog" aria-label="Notifications">
        <div style={S.grab} />
        <div style={S.head}>
          <div style={S.title}>Notifications</div>
          {unreadCount > 0 && (
            <button type="button" style={S.allRead} onClick={onMarkAllRead}>
              Mark all read
            </button>
          )}
        </div>
        <div style={S.list}>
          {notifications.length === 0 ? (
            <div style={S.empty}>
              <MobileIcon name="bellOff" size={26} c="var(--mb-ink-4)" />
              <span style={S.emptyText}>You&rsquo;re all caught up</span>
            </div>
          ) : (
            notifications.map((n) => {
              const unread = !n.read_at;
              return (
                <button
                  key={n.id}
                  type="button"
                  style={{ ...S.row, ...(unread ? S.rowUnread : null) }}
                  onClick={() => onRow(n)}
                >
                  <span
                    style={{
                      ...S.dot,
                      background: unread ? "#C0562F" : "transparent",
                    }}
                    aria-hidden="true"
                  />
                  <div style={S.body}>
                    <div style={{ ...S.rowTitle, fontWeight: unread ? 700 : 600, color: unread ? "var(--mb-ink)" : "var(--mb-ink-2)" }}>
                      {n.title}
                    </div>
                    {n.body && <div style={S.rowSub}>{n.body}</div>}
                  </div>
                  <span style={S.time}>{notifTimeAgo(n.created_at)}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

const S: Record<string, CSSProperties> = {
  scrim: { position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.28)" },
  sheet: {
    position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 9999,
    maxHeight: "72vh", display: "flex", flexDirection: "column",
    background: "linear-gradient(180deg, rgba(255,255,255,.92), rgba(255,255,255,.84))",
    WebkitBackdropFilter: "blur(30px) saturate(190%)", backdropFilter: "blur(30px) saturate(190%)",
    borderTop: "1px solid rgba(255,255,255,.7)", borderRadius: "22px 22px 0 0",
    boxShadow: "0 -22px 54px -20px rgba(25,24,19,.42)",
    padding: "10px 0 calc(env(safe-area-inset-bottom, 0px) + 8px)",
  },
  grab: { width: 38, height: 4, borderRadius: 2, background: "var(--mb-ink-5)", margin: "0 auto 10px", flex: "none" },
  head: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "2px 18px 12px", flex: "none",
  },
  title: { fontFamily: "var(--mb-font-display)", fontWeight: 700, fontSize: 17, color: "var(--mb-ink)" },
  allRead: {
    border: 0, background: "transparent", color: "var(--mb-accent-2)",
    fontFamily: "var(--mb-font-display)", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0,
  },
  list: { overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "0 6px" },
  empty: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
    padding: "34px 16px 40px", color: "var(--mb-ink-3)",
  },
  emptyText: { fontFamily: "var(--mb-font-display)", fontSize: 14, color: "var(--mb-ink-3)" },
  row: {
    display: "flex", alignItems: "flex-start", gap: 9, width: "100%", textAlign: "left",
    padding: "13px 12px", border: 0, borderRadius: 14, background: "transparent",
  },
  rowUnread: { background: "rgba(43,255,119,.07)" },
  dot: { flex: "none", width: 7, height: 7, marginTop: 5, borderRadius: "50%" },
  body: { flex: 1, minWidth: 0 },
  rowTitle: { fontFamily: "var(--mb-font-display)", fontSize: 14, lineHeight: 1.35 },
  rowSub: {
    fontFamily: "var(--mb-font-display)", fontSize: 12.5, color: "var(--mb-ink-3)",
    lineHeight: 1.35, marginTop: 2,
    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
  },
  time: { flex: "none", fontFamily: "var(--mb-font-mono)", fontSize: 11, color: "var(--mb-ink-4)", marginTop: 1 },
};
