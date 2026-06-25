/**
 * Atlas-mobile — TODAY (redesign / Cash App language; see /MOBILE_REDESIGN.md).
 * Body content only — the shell renders the header, scroll area, nav, and the
 * Yulia FAB.
 *
 *   Pipeline HERO — real usePortfolioSummary.weightedEvCents + totalActive
 *     (honest: no fabricated delta). No deals → greeting + first-deal CTA.
 *   "Needs you"   — real useNextActions as action-rows (tap → openDeal / chat).
 *   "Favorites"   — real starred deals (deals.all where isFavorite); tap → cockpit.
 *   "Notifications" — real useNotifications feed (deal-team comments, invites,
 *                     deliverables, gate moves); tap → markRead + open the deal.
 *
 * The big "Ask Yulia" composer + quick chips are GONE — Yulia is the FAB / the
 * slide-up sheet now. Honesty (contract law #4): every value is a real hook
 * field or an honest empty note.
 */
import { useCallback } from "react";
import type { CSSProperties } from "react";
import type { AtlasScreenProps } from "../../desktop/atlasNav";
import { useAtlasNav, useAtlasChat } from "../../desktop/atlasNav";
import { fmtCents } from "../../desktop/primitives";
import { ChevronRightIcon } from "../../desktop/icons";
import { useMobileDeals } from "../../../../hooks/useMobileDeals";
import { useNextActions, type NextAction } from "../../../../hooks/useNextActions";
import { usePortfolioSummary } from "../../../../hooks/usePortfolioSummary";
import { useNotifications, notifTimeAgo, type AppNotification } from "../../../../hooks/useNotifications";
import { RT } from "../redesign/rt";
import { Hero, SectionHeader, ActionRow, MarkBadge } from "../redesign/kit";

/* ─── greeting ────────────────────────────────────────────── */

function firstNameOf(displayName: string | null | undefined): string | null {
  const trimmed = (displayName ?? "").trim();
  if (!trimmed) return null;
  return trimmed.split(/\s+/)[0] || null;
}

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/* ─── screen ──────────────────────────────────────────────── */

export default function TodayMobileScreen({ user }: AtlasScreenProps) {
  const nav = useAtlasNav();
  const chat = useAtlasChat();
  const canFetch = !!user;

  const deals = useMobileDeals(user);
  const next = useNextActions(user, canFetch);
  const { summary } = usePortfolioSummary(user, canFetch);
  const notifs = useNotifications(canFetch);

  const first = firstNameOf(user?.display_name);
  const greeting = user ? `${timeGreeting()}, ${first ?? "there"}.` : `${timeGreeting()}.`;

  const onAction = useCallback(
    (a: NextAction) => {
      if (a.dealId != null) nav.openDeal(a.dealId, a.dealName);
      else if (chat) chat.send(a.prefill || a.title);
    },
    [nav, chat],
  );

  // Starred deals → quick-access pinned row. Real `isFavorite` from /api/deals.
  const favorites = deals.all.filter((d) => d.isFavorite);

  // Tapping a notification marks it read and, when it's tied to a deal, opens
  // that deal's cockpit (carrying the real deal name from the loaded list).
  const onNotif = useCallback(
    (n: AppNotification) => {
      notifs.markRead(n.id);
      if (n.deal_id != null) {
        const deal = deals.all.find((d) => d.rawId === n.deal_id);
        nav.openDeal(n.deal_id, deal?.name);
      }
    },
    [notifs, deals.all, nav],
  );

  const noDeals =
    canFetch && deals.loaded && !deals.hasData && next.loaded && next.actions.length === 0;

  // Real, honest pipeline figure — only shown when the summary actually has it.
  const hasPipeline = !!summary && summary.totalActive > 0 && summary.weightedEvCents > 0;

  const startFirstDeal = useCallback(() => {
    if (chat) chat.send("I want to start a new deal — help me set it up.");
    else nav.go("deals");
  }, [chat, nav]);

  return (
    <div style={{ padding: "6px 18px 0", fontFamily: RT.font, color: RT.ink }}>
      {/* HERO — the one big number, or a greeting when there's no pipeline yet. */}
      {hasPipeline ? (
        <Hero
          label={
            <span
              role="button"
              tabIndex={0}
              onClick={() => nav.go("deals")}
              style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 2 }}
            >
              Pipeline <ChevronRightIcon size={13} c={RT.muted} />
            </span>
          }
          value={fmtCents(summary!.weightedEvCents)}
          sub={`${summary!.totalActive} active ${summary!.totalActive === 1 ? "deal" : "deals"}`}
        />
      ) : (
        <div style={{ paddingTop: 4 }}>
          <div style={S.greet}>{greeting}</div>
          {next.loaded && (
            <div style={{ fontSize: 14, color: RT.muted, marginTop: 8 }}>
              {next.actions.length === 0
                ? "You're all caught up."
                : `${next.actions.length} ${next.actions.length === 1 ? "thing needs" : "things need"} you today.`}
            </div>
          )}
        </div>
      )}

      {/* Needs you */}
      <SectionHeader>Needs you</SectionHeader>
      <AttentionList
        noDeals={noDeals}
        loading={next.loading || deals.loading}
        actions={next.actions}
        onAction={onAction}
        onStartDeal={startFirstDeal}
      />

      {/* Favorites — starred deals, quick access (only when the user has pinned any) */}
      {deals.loaded && favorites.length > 0 && (
        <>
          <SectionHeader>Favorites</SectionHeader>
          <div>
            {favorites.map((d) => (
              <ActionRow
                key={d.id}
                leading={<MarkBadge label={d.name} seed={d.rawId} size={40} />}
                title={
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <span aria-hidden="true" style={{ color: RT.accentInk }}>★</span>
                    {d.name}
                  </span>
                }
                sub={d.sub}
                action="Open"
                onClick={() => nav.openDeal(d.rawId, d.name)}
              />
            ))}
          </div>
        </>
      )}

      {/* Notifications — the real deal-team / deal-activity feed (same rows as the bell) */}
      <SectionHeader>Notifications</SectionHeader>
      <NotificationList
        loaded={notifs.loaded}
        notifications={notifs.notifications}
        onOpen={onNotif}
      />
    </div>
  );
}

/* ─── attention list ──────────────────────────────────────── */

function AttentionList({
  noDeals,
  loading,
  actions,
  onAction,
  onStartDeal,
}: {
  noDeals: boolean;
  loading: boolean;
  actions: NextAction[];
  onAction: (a: NextAction) => void;
  onStartDeal: () => void;
}) {
  if (loading) return <Skeleton rows={2} />;
  if (noDeals) return <FirstDealCard onStartDeal={onStartDeal} />;
  if (actions.length === 0) return <Note text="You're all caught up — nothing needs you right now." />;

  return (
    <div>
      {actions.map((a) => (
        <ActionRow
          key={a.id}
          leading={<MarkBadge label={a.dealName || a.title} seed={a.dealId ?? a.id} size={40} />}
          title={a.title}
          sub={a.description || a.cta}
          action="Open"
          onClick={() => onAction(a)}
        />
      ))}
    </div>
  );
}

function FirstDealCard({ onStartDeal }: { onStartDeal: () => void }) {
  return (
    <div style={S.card}>
      <div style={{ fontSize: 17, fontWeight: 600, color: RT.ink, marginBottom: 4 }}>No deals yet</div>
      <div style={{ fontSize: 14, color: RT.muted, lineHeight: 1.5, marginBottom: 14 }}>
        Tell Yulia what you're buying, selling, or raising for, and she'll open your first deal and
        start the work.
      </div>
      <button type="button" onClick={onStartDeal} style={S.cta}>
        Start your first deal
      </button>
    </div>
  );
}

/* ─── notifications feed (real /api/notifications rows) ───── */

function NotificationList({
  loaded,
  notifications,
  onOpen,
}: {
  loaded: boolean;
  notifications: AppNotification[];
  onOpen: (n: AppNotification) => void;
}) {
  if (!loaded) return <Skeleton rows={2} />;
  if (notifications.length === 0)
    return (
      <Note text="You're all caught up — no new notifications. Updates from your deal team show here." />
    );

  return (
    <div>
      {notifications.slice(0, 6).map((n) => {
        const unread = !n.read_at;
        return (
          <ActionRow
            key={n.id}
            leading={
              <span style={S.notifLead}>
                <span style={{ ...S.notifDot, background: unread ? RT.accentStrong : RT.line }} />
              </span>
            }
            title={<span style={{ fontWeight: unread ? 700 : 600 }}>{n.title}</span>}
            sub={
              <span>
                {n.body ? `${n.body} · ` : ""}
                <span style={{ color: RT.faint }}>{notifTimeAgo(n.created_at)}</span>
              </span>
            }
            action={n.deal_id != null ? "Open" : undefined}
            onClick={() => onOpen(n)}
          />
        );
      })}
    </div>
  );
}

/* ─── shared bits ─────────────────────────────────────────── */

function Skeleton({ rows }: { rows: number }) {
  return (
    <div aria-busy="true" style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 6 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ height: 56, background: RT.card, borderRadius: RT.rCard, opacity: 0.7 }} />
      ))}
    </div>
  );
}

function Note({ text }: { text: string }) {
  return <div style={{ ...S.card, fontSize: 14, color: RT.muted, lineHeight: 1.5 }}>{text}</div>;
}

const S: Record<string, CSSProperties> = {
  greet: { fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, color: RT.ink },
  card: { background: RT.card, borderRadius: RT.rCard, padding: "16px 16px", marginTop: 4 },
  cta: {
    background: RT.accent,
    color: RT.onAccent,
    border: "none",
    borderRadius: RT.rPill,
    padding: "11px 18px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: RT.font,
  },
  notifLead: { width: 40, display: "flex", alignItems: "center", justifyContent: "center" },
  notifDot: { width: 10, height: 10, borderRadius: "50%", flex: "none" },
};
