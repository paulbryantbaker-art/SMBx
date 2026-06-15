/**
 * CDNotifications — the Inbox, ported to the Claude-Design (cool/indigo)
 * language and wired to LIVE data. Mounts under `.cd-root` (cdTokens.css).
 *
 * Visual target is the CD "Ultra Modern Fintech" notifications surface
 * (notifications.jsx): an editorial header, a filter row (All / Unread +
 * per-type), then real notifications grouped by recency as rows — each with an
 * icon-by-type, the title/body, a per-deal color dot, a relative timestamp, and
 * a mark-read toggle. `deal_request` rows keep their inline Accept / Decline.
 *
 * Real data is the SAME path the desktop + mobile bells use — useNotifications()
 * (server/routes/notifications.ts): GET /api/notifications, PATCH /:id/read,
 * POST /read-all, plus respondToDealRequest for inline deal requests. Nothing is
 * fabricated: the type pills, group buckets, and unread counts all derive from
 * the actual rows. Where there's no live feed, we show an honest empty state.
 * The CD mockup's window.MA_* demo seed (Project Atlas/Lumen/Cedar, fake
 * mentions) is NOT copied — layout only.
 *
 * Navigation: a row with a deal_id opens that deal's tab via openTab; a row with
 * an action_url but no deal_id routes its context to Yulia (chat owns routing).
 * Only --cd-* tokens.
 */
import { useEffect, useMemo, useState } from "react";
import { type User } from "../../../hooks/useAuth";
import { useV6WorkspaceData, type WorkspaceDeal } from "../../../hooks/useV6WorkspaceData";
import {
  useNotifications,
  notifTimeAgo,
  type AppNotification,
} from "../../../hooks/useNotifications";
import {
  CDIcon, CDCard, CDPill, CDEyebrow, cdDealColor,
  type CDIconName, type CDTone,
} from "../kit/cdUi";

interface NotificationsProps {
  user: User | null;
  openTab: (t: any) => void;
  onTalkToYulia?: (p: string) => void;
  modelPreference?: any;
}

/* type → icon / human label / tone. Unknown types fall back to a neutral bell
 * so a new server type never crashes the row (honest, forward-compatible). */
const TYPE_META: Record<string, { icon: CDIconName; label: string; tone: CDTone }> = {
  deal_request:  { icon: "share",   label: "Request",  tone: "accent" },
  mention:       { icon: "comment", label: "Mention",  tone: "accent" },
  comment:       { icon: "comment", label: "Comment",  tone: "neutral" },
  deal_comment:  { icon: "comment", label: "Comment",  tone: "neutral" },
  dm:            { icon: "comment", label: "Message",  tone: "neutral" },
  message:       { icon: "comment", label: "Message",  tone: "neutral" },
  connection:    { icon: "share",   label: "Connect",  tone: "accent" },
  friend_request:{ icon: "share",   label: "Connect",  tone: "accent" },
  gate_advance:  { icon: "bolt",    label: "Gate",     tone: "pos" },
  deadline:      { icon: "flag",    label: "Deadline", tone: "neg" },
  new_document:  { icon: "docs",    label: "Document", tone: "neutral" },
  document:      { icon: "docs",    label: "Document", tone: "neutral" },
  analysis:      { icon: "analysis",label: "Analysis", tone: "neutral" },
  deliverable:   { icon: "doc",     label: "Deliverable", tone: "neutral" },
};
function metaFor(type: string): { icon: CDIconName; label: string; tone: CDTone } {
  return TYPE_META[type] || { icon: "bell", label: prettyType(type), tone: "neutral" };
}
function prettyType(type: string): string {
  return (type || "Update").replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

/* recency bucket from a real created_at — never invented. */
type Bucket = "today" | "week" | "earlier";
function bucketFor(createdAt: string): Bucket {
  const ms = Date.now() - new Date(createdAt).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "today";
  const days = ms / 86_400_000;
  if (days < 1) return "today";
  if (days < 7) return "week";
  return "earlier";
}
const BUCKET_LABEL: Record<Bucket, string> = { today: "Today", week: "This week", earlier: "Earlier" };
const BUCKET_ORDER: Bucket[] = ["today", "week", "earlier"];

export function CDNotifications({ user, openTab, onTalkToYulia }: NotificationsProps) {
  const {
    notifications, unreadCount, loaded, refresh,
    markRead, markAllRead, respondToDealRequest,
  } = useNotifications(!!user);
  const workspace = useV6WorkspaceData(user);
  const [filter, setFilter] = useState<string>("all");

  // Freshen on mount so the inbox is current the moment it opens.
  useEffect(() => { if (user) refresh(); }, [user, refresh]);

  // Deal name lookup so a row can show the business it belongs to (real).
  const dealById = useMemo(() => {
    const m = new Map<number, WorkspaceDeal>();
    for (const d of workspace.deals) m.set(Number(d.id), d);
    return m;
  }, [workspace.deals]);

  const openDeal = (dealId: number) => {
    const d = dealById.get(dealId);
    openTab({ kind: "deal", id: String(dealId), title: d?.business_name || `Deal #${dealId}` });
  };

  // A row's primary click — mark it read, then route. Deal rows open the deal;
  // a row that only carries an action_url hands its context to Yulia (chat owns
  // hash routing in this surface), so we never dead-end.
  const onRowOpen = (n: AppNotification) => {
    if (!n.read_at) markRead(n.id);
    if (n.deal_id) { openDeal(n.deal_id); return; }
    if (n.action_url) onTalkToYulia?.(`Open this for me: ${n.title}${n.body ? ` — ${n.body}` : ""}`);
  };

  const onAccept = async (n: AppNotification) => {
    const res = await respondToDealRequest(n, "accept");
    if (res.ok && res.dealId) openDeal(res.dealId);
  };

  // Filter set is DERIVED from the types actually present — no empty buckets.
  const filters = useMemo(() => {
    const present = new Set(notifications.map(n => n.type));
    const base: { k: string; label: string }[] = [
      { k: "all", label: "All" },
      { k: "unread", label: "Unread" },
    ];
    const typeOrder = ["deal_request", "mention", "deadline", "gate_advance", "new_document"];
    for (const t of typeOrder) if (present.has(t)) base.push({ k: t, label: pluralLabel(t) });
    return base;
  }, [notifications]);

  const shown = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter(n => !n.read_at);
    return notifications.filter(n => n.type === filter);
  }, [notifications, filter]);

  const groups = useMemo(() => {
    const m: Record<Bucket, AppNotification[]> = { today: [], week: [], earlier: [] };
    for (const n of shown) m[bucketFor(n.created_at)].push(n);
    return m;
  }, [shown]);

  const sub = unreadCount > 0
    ? `${unreadCount} unread across your mandates`
    : loaded ? "You're all caught up." : "Loading your inbox…";

  return (
    <div className="cd-root cd-scrollable" style={{ background: "var(--cd-canvas)", height: "100%", overflow: "auto", padding: "30px 34px 60px", display: "flex", flexDirection: "column", gap: "var(--cd-gap)" }}>
      {/* editorial header */}
      <div>
        <h1 style={{ margin: 0, fontFamily: "var(--cd-serif)", fontWeight: 600, fontSize: 40, lineHeight: 1.02, letterSpacing: "-0.02em" }}>
          Notifications
        </h1>
        <p style={{ margin: "10px 0 0", color: "var(--cd-ink-2)", fontSize: 14.5 }}>{sub}</p>
      </div>

      {/* filter row + mark-all */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 3, background: "var(--cd-surface-2)", border: "1px solid var(--cd-line)", borderRadius: 10, padding: 3 }}>
          {filters.map(f => {
            const on = filter === f.k;
            return (
              <button
                key={f.k}
                onClick={() => setFilter(f.k)}
                style={{ padding: "6px 13px", borderRadius: 7, fontSize: 12.5, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "var(--cd-sans)", background: on ? "var(--cd-surface)" : "transparent", color: on ? "var(--cd-ink)" : "var(--cd-ink-3)", boxShadow: on ? "var(--cd-shadow-sm)" : "none" }}
              >
                {f.label}{f.k === "unread" && unreadCount > 0 ? ` · ${unreadCount}` : ""}
              </button>
            );
          })}
        </div>
        <button
          onClick={markAllRead}
          disabled={unreadCount === 0}
          style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, border: "1px solid var(--cd-line)", background: "var(--cd-surface)", borderRadius: "var(--cd-r-md)", padding: "7px 13px", fontSize: 12.5, fontWeight: 600, cursor: unreadCount ? "pointer" : "default", fontFamily: "var(--cd-sans)", color: unreadCount ? "var(--cd-ink-2)" : "var(--cd-ink-4)" }}
        >
          <CDIcon name="check" size={14} color={unreadCount ? "var(--cd-accent)" : "var(--cd-ink-4)"} />Mark all read
        </button>
      </div>

      {/* body */}
      {!loaded && notifications.length === 0 ? (
        <CDCard><div className="cd-skel" style={{ height: 180 }} /></CDCard>
      ) : shown.length === 0 ? (
        <CDCard style={{ textAlign: "center", padding: "52px 0", color: "var(--cd-ink-3)" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--cd-surface-2)", border: "1px solid var(--cd-line)", display: "grid", placeItems: "center", margin: "0 auto 14px" }}>
            <CDIcon name="bell" size={20} color="var(--cd-ink-4)" />
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--cd-ink-2)" }}>
            {filter === "all" ? "Nothing here — you're all caught up." : "Nothing matches this filter."}
          </div>
          {filter !== "all" && (
            <button onClick={() => setFilter("all")} style={{ marginTop: 12, border: "1px solid var(--cd-line)", background: "var(--cd-surface)", borderRadius: "var(--cd-r-md)", padding: "7px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--cd-sans)", color: "var(--cd-ink-2)" }}>Show all</button>
          )}
        </CDCard>
      ) : (
        BUCKET_ORDER.map(b => (
          <NotifGroup
            key={b}
            label={BUCKET_LABEL[b]}
            items={groups[b]}
            dealById={dealById}
            onOpen={onRowOpen}
            onToggleRead={markRead}
            onAccept={onAccept}
            onDecline={(n) => respondToDealRequest(n, "decline")}
          />
        ))
      )}
    </div>
  );
}

function pluralLabel(type: string): string {
  switch (type) {
    case "deal_request": return "Requests";
    case "mention": return "Mentions";
    case "deadline": return "Deadlines";
    case "gate_advance": return "Gates";
    case "new_document": return "Documents";
    default: return prettyType(type);
  }
}

/* ─── group ─────────────────────────────────────────────────── */
function NotifGroup({
  label, items, dealById, onOpen, onToggleRead, onAccept, onDecline,
}: {
  label: string;
  items: AppNotification[];
  dealById: Map<number, WorkspaceDeal>;
  onOpen: (n: AppNotification) => void;
  onToggleRead: (id: number) => void;
  onAccept: (n: AppNotification) => void;
  onDecline: (n: AppNotification) => void;
}) {
  if (items.length === 0) return null;
  return (
    <CDCard pad={false}>
      <div style={{ padding: "13px 18px 11px", display: "flex", alignItems: "center", gap: 9 }}>
        <CDEyebrow>{label}</CDEyebrow>
        <span className="cd-num" style={{ fontSize: 11, color: "var(--cd-ink-4)" }}>{items.length}</span>
      </div>
      {items.map(n => (
        <NotifRow
          key={n.id}
          n={n}
          dealName={n.deal_id ? dealById.get(n.deal_id)?.business_name ?? undefined : undefined}
          onOpen={onOpen}
          onToggleRead={onToggleRead}
          onAccept={onAccept}
          onDecline={onDecline}
        />
      ))}
    </CDCard>
  );
}

/* ─── row ───────────────────────────────────────────────────── */
function NotifRow({
  n, dealName, onOpen, onToggleRead, onAccept, onDecline,
}: {
  n: AppNotification;
  dealName?: string;
  onOpen: (n: AppNotification) => void;
  onToggleRead: (id: number) => void;
  onAccept: (n: AppNotification) => void;
  onDecline: (n: AppNotification) => void;
}) {
  const meta = metaFor(n.type);
  const unread = !n.read_at;
  const deadline = n.type === "deadline";
  const dealColor = n.deal_id != null ? cdDealColor(n.deal_id) : null;
  const clickable = n.deal_id != null || !!n.action_url;

  const iconWrap = (
    <div style={{ width: 34, height: 34, borderRadius: 9, background: deadline ? "var(--cd-neg-soft)" : "var(--cd-surface-2)", border: "1px solid var(--cd-line)", display: "grid", placeItems: "center", flexShrink: 0 }}>
      <CDIcon name={meta.icon} size={16} color={deadline ? "var(--cd-neg)" : "var(--cd-ink-2)"} />
    </div>
  );

  const head = (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--cd-ink)" }}>{n.title}</span>
      {dealColor && <span style={{ width: 6, height: 6, borderRadius: 2, background: dealColor, flexShrink: 0 }} />}
      {dealName && <span style={{ fontSize: 10.5, color: "var(--cd-accent-strong)", background: "var(--cd-accent-soft)", borderRadius: 5, padding: "1px 7px", fontWeight: 600, whiteSpace: "nowrap" }}>{dealName}</span>}
      <CDPill tone={meta.tone}>{meta.label}</CDPill>
      <span className="cd-num" style={{ fontSize: 10.5, color: "var(--cd-ink-4)" }}>{notifTimeAgo(n.created_at)}</span>
    </div>
  );

  // A deal_request is actionable inline (Accept / Decline) — render as a div so
  // its action buttons don't nest inside a clickable row button.
  if (n.type === "deal_request") {
    const responded = n._responded;
    return (
      <div style={{ display: "flex", gap: 13, padding: "13px 18px", borderTop: "1px solid var(--cd-line)", background: unread ? "color-mix(in oklch, var(--cd-accent-soft), transparent 55%)" : "transparent" }}>
        {iconWrap}
        <div style={{ flex: 1, minWidth: 0 }}>
          {head}
          {n.body && <div style={{ fontSize: 12.5, color: "var(--cd-ink-2)", lineHeight: 1.45, marginTop: 3 }}>{n.body}</div>}
          {responded ? (
            <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 8, color: responded === "accepted" ? "var(--cd-pos)" : "var(--cd-ink-3)" }}>
              {responded === "accepted" ? "✓ Joined the deal" : "Declined"}
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8, marginTop: 9 }}>
              <button
                type="button"
                onClick={() => onAccept(n)}
                style={{ background: "var(--cd-accent)", color: "white", border: "none", borderRadius: "var(--cd-r-md)", padding: "6px 15px", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "var(--cd-sans)" }}
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => onDecline(n)}
                style={{ background: "var(--cd-surface)", color: "var(--cd-ink-2)", border: "1px solid var(--cd-line)", borderRadius: "var(--cd-r-md)", padding: "6px 15px", fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "var(--cd-sans)" }}
              >
                Decline
              </button>
            </div>
          )}
        </div>
        <ReadToggle unread={unread} onClick={() => onToggleRead(n.id)} />
      </div>
    );
  }

  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? () => onOpen(n) : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(n); } } : undefined}
      style={{ display: "flex", gap: 13, padding: "13px 18px", borderTop: "1px solid var(--cd-line)", cursor: clickable ? "pointer" : "default", background: unread ? "color-mix(in oklch, var(--cd-accent-soft), transparent 55%)" : "transparent" }}
    >
      {iconWrap}
      <div style={{ flex: 1, minWidth: 0 }}>
        {head}
        {n.body && <div style={{ fontSize: 12.5, color: "var(--cd-ink-2)", lineHeight: 1.45, marginTop: 3 }}>{n.body}</div>}
      </div>
      <ReadToggle unread={unread} onClick={(e) => { e.stopPropagation(); onToggleRead(n.id); }} />
    </div>
  );
}

/* mark-read toggle — accent dot when unread, ✓ glyph when read. */
function ReadToggle({ unread, onClick }: { unread: boolean; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={unread ? "Mark read" : "Read"}
      aria-label={unread ? "Mark read" : "Read"}
      style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 7, border: "1px solid var(--cd-line)", background: "var(--cd-surface)", display: "grid", placeItems: "center", cursor: unread ? "pointer" : "default", alignSelf: "center" }}
    >
      {unread
        ? <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--cd-accent)" }} />
        : <CDIcon name="check" size={13} color="var(--cd-ink-4)" />}
    </button>
  );
}
