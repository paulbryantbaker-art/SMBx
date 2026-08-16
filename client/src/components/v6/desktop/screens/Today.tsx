/**
 * TODAY — the working surface. NOT a chat home any more.
 *
 * Paul, 2026-08-15, looking at the live screen: *"the huge chat bar can go.. all
 * i need is the sidebar chat in the tool pages"* and then *"i'm looking for
 * complete redesign of the internal app."*
 *
 * WHAT THIS SCREEN WAS. A 100dvh hero holding a 46px serif greeting, a 760px
 * rounded composer with a drop shadow, four starter chips and an animated glow
 * blob — the Gemini-home pattern. Everything a practitioner actually opens the
 * app for (what is overdue, what is at risk, what moved) sat BELOW that fold.
 * So the first screenful of the practice's own instrument was a text box, and
 * you had to scroll past it to find out whether anything needed you.
 *
 * WHAT IT IS NOW. The day, above the fold. A one-line greeting, then the real
 * figures, then what needs you — built on `../kit`, the same grammar Deals
 * runs on: chips that carry their number, a row whose missing figure prints
 * "Not available", an endorsement band that states its grounds, and a footer
 * saying how the list is ordered.
 *
 * THE COMPOSER IS GONE FROM HERE, not deleted. Yulia lives in the right-hand
 * rail on every screen (AtlasApp + AtlasChatRail, 2026-08-15) with a context
 * chip and four per-screen suggestions. One chat surface, summoned, rather
 * than one screen that IS a chat and five that are not.
 *
 * Data unchanged — useMobileDeals / useNextActions / useNotifications /
 * useAdvisorMandates, the same hooks, the same honesty: every figure is real,
 * a partial pipeline sum says it is partial, and a user with no deals gets a
 * first-deal CTA rather than fabricated attention items.
 */
import { useCallback, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { AtlasScreenProps } from "../atlasNav";
import { useAtlasNav, useAtlasChat } from "../atlasNav";
import { T } from "../atlasTokens";
import { MarkBadge, fmtCents } from "../primitives";
import { PlusIcon, ChevronRightIcon, SendArrowIcon } from "../icons";
import { CompareStrip, RankingNote } from "../kit";
import { useMobileDeals } from "../../../../hooks/useMobileDeals";
import { useNextActions, type NextAction } from "../../../../hooks/useNextActions";
import { useNotifications, notifTimeAgo, type AppNotification } from "../../../../hooks/useNotifications";
import { useAdvisorMandates } from "../../../../hooks/useAdvisorMandates";
import MandatesBand from "./MandatesBand";

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

/* ─── attention-item icon tile (tinted by action semantics) ──
 *
 * Keyed off the server's known Material-Symbol `icon` ids (nextActions.ts) so
 * every action type lands on a distinct tile — not a regex over free text that
 * collapses nearly everything to the default blue/`›` (the design wants the
 * three semantic families: review ⚑ blue, nudge/stale ✎ terra, draft 📝 green).
 *
 *   rate_review        → ⚑ blue  (someone is blocked on your review — urgent)
 *   schedule           → ✎ terra (stale deal, needs a nudge)
 *   arrow_circle_right → 📝 green (ready to advance — the "done, move on" case)
 *   sell/shopping_cart/savings/merge/auto_awesome → journey-tinted gate work
 */

type AttentionKind = { bg: string; fg: string; glyph: string };

function attentionKind(a: NextAction): AttentionKind {
  switch (a.icon) {
    case "rate_review":
      return { bg: T.blueBg3, fg: T.blue, glyph: "⚑" };
    case "schedule":
      return { bg: T.terraBg, fg: T.terra, glyph: "✎" };
    case "arrow_circle_right":
      return { bg: T.greenBg, fg: T.green, glyph: "📝" };
    default:
      break;
  }
  // Gate-work actions (icon = journeyIcon) — tint by journey so buy/sell/raise
  // read distinctly instead of an identical blue tile.
  switch (a.journeyType) {
    case "sell":
      return { bg: T.amberBg, fg: T.amber, glyph: "▲" };
    case "raise":
      return { bg: T.violetBg, fg: T.violet, glyph: "◆" };
    case "pmi":
      return { bg: T.greenBg, fg: T.green, glyph: "⤢" };
    case "buy":
    default:
      return { bg: T.blueBg3, fg: T.blue, glyph: "▸" };
  }
}

/* ─── screen ──────────────────────────────────────────────── */

export default function TodayScreen({ user }: AtlasScreenProps) {
  const nav = useAtlasNav();
  const chat = useAtlasChat();
  const canFetch = !!user;

  const deals = useMobileDeals(user);
  const next = useNextActions(user, canFetch);
  const mandates = useAdvisorMandates(user);
  const notifs = useNotifications(canFetch);

  const first = firstNameOf(user?.display_name);
  const greeting = user
    ? `${timeGreeting()}, ${first ?? "there"}.`
    : `${timeGreeting()}.`;

  /* The figures behind the day strip. Hoisted out of the render because the
     strip needs them and so does the honest "partial sum" label — computing
     them twice is how the label and the number drift apart. */
  const valued = deals.all.filter((d) => d.askingPrice != null);
  const pipelineCents = valued.reduce((sum, d) => sum + (d.askingPrice as number), 0);

  /* The date line. Plain, and it replaces nothing — the old screen never said
     what day it was, which a screen called Today probably should. */
  const dayLine = new Date().toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric",
  });

  const onAction = useCallback(
    (a: NextAction) => {
      if (a.dealId != null) {
        nav.openDeal(a.dealId, a.dealName);
      } else if (chat) {
        chat.send(a.prefill || a.title);
      }
    },
    [nav, chat],
  );

  // Starred deals → quick-access band. Real `isFavorite` from /api/deals.
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

  // Authed user with genuinely no deals → keep composer + chips, swap the
  // attention column for a first-deal CTA (never fabricate attention items).
  // Gate on next-actions ALSO returning nothing: useMobileDeals can't tell a
  // failed /api/deals fetch from a truly empty account (both → hasData=false,
  // loaded=true), so on a deals error next.actions still carries the real feed
  // and we render it rather than a misleading "No deals yet" card.
  const noDeals =
    canFetch &&
    deals.loaded &&
    !deals.hasData &&
    next.loaded &&
    next.actions.length === 0;

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        position: "relative",
        overflow: "auto",
        fontFamily: T.font,
        color: T.ink,
      }}
    >
      {/* The animated glow blob is GONE. It was centred on the composer that no
          longer exists, and an animating radial gradient behind a list of
          overdue work is decoration competing with the content it sits under. */}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          /* Was a 920px CENTRED column with `alignItems: center`, which is a
             reading layout — right for a chat home, wrong for a working
             surface where the eye should start at a fixed left edge on every
             row. Left-aligned and wider, matching the Deals list. */
          width: 1180,
          maxWidth: "94%",
          margin: "0 auto",
          padding: "18px 0 64px",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          gap: 18,
        }}
      >
        {/* THE DAY, ABOVE THE FOLD.
            One line of greeting — not a 46px serif in a 100dvh block. The
            practitioner opens this screen to find out whether anything needs
            them, and that answer must not be below a text box. */}
        <div style={{ width: "100%", marginTop: 8 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: T.ink, letterSpacing: "-.01em" }}>
            {greeting}
          </div>
          <div style={{ fontSize: 12.5, color: T.muted, marginTop: 3 }}>
            {dayLine}
          </div>
        </div>

        {/* THE FIGURES, as a comparison strip rather than three centred
            numerals. Same kit primitive the Deals stage strip uses, so the two
            screens read as one instrument.

            EVERY CELL CAN BE UNKNOWN, and unknown is not zero. A pipeline with
            no priced deals renders the not-known glyph, never "$0" — a book
            full of unpriced targets is a real and common state, and printing
            $0 for it would be a fabricated figure in the most-read place on
            the screen. Same for attention before useNextActions has loaded:
            "nothing needs you" and "we have not checked yet" are different
            facts and must not look alike. */}
        <div style={{ width: "100%" }}>
          <CompareStrip
            items={[
              {
                id: "pipeline",
                label: valued.length === deals.all.length
                  ? "Pipeline · asking"
                  : `Pipeline · ${valued.length} of ${deals.all.length} valued`,
                value: valued.length > 0 ? fmtCents(pipelineCents) : null,
                unknownWhy: deals.loaded
                  ? "No deal on the board carries an asking price yet."
                  : "Still loading the board.",
              },
              {
                id: "deals",
                label: deals.all.length === 1 ? "Deal in motion" : "Deals in motion",
                value: deals.loaded ? String(deals.all.length) : null,
                unknownWhy: "Still loading the board.",
              },
              {
                id: "attention",
                label: "Needs you",
                value: next.loaded ? String(next.actions.length) : null,
                unknownWhy: "Still checking what is due.",
              },
              {
                id: "unread",
                label: "Unread",
                value: notifs.loaded ? String(notifs.notifications.length) : null,
                unknownWhy: "Still loading notifications.",
              },
            ]}
          />
        </div>

        {/* Multi-mandate roll-up — full-width band, advisors with 2+ sell-side
            mandates only; otherwise Today is unchanged (band never mounts). */}
        {mandates.mandates.length >= 2 && (
          <div style={{ width: "100%", paddingTop: 30 }}>
            <MandatesBand
              mandates={mandates.mandates}
              totals={mandates.totals}
              loading={mandates.loading}
              error={mandates.error}
              onOpenDeal={(id, name) => nav.openDeal(id, name)}
            />
          </div>
        )}

        {/* Favorites — starred deals, quick access (full-width band, only when
            the user has pinned any). A horizontal row of compact deal cards. */}
        {deals.loaded && favorites.length > 0 && (
          <div style={{ width: "100%", paddingTop: 30 }}>
            <ColumnHeading>Favorites</ColumnHeading>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {favorites.map((d) => (
                <FavoriteCard
                  key={d.id}
                  name={d.name}
                  sub={d.sub}
                  onOpen={() => nav.openDeal(d.rawId, d.name)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ONE CALM COLUMN below the hero (the Aurora × Cash App pass,
            2026-08-02 — was a two-column band, each list squeezed to ~450px
            beside the other). Cash App stacks: attention first because it is
            actionable, the activity feed second because it is ambient. The
            stack is capped at a readable width and centered — full-bleed 920px
            rows read as a spreadsheet, not a feed. */}
        {/* Was `maxWidth: 680, margin: 0 auto` — a centred reading column under
            a centred hero. With the hero gone the page has a left edge, and a
            narrow centred stack under a full-width strip reads as a different
            page. Two columns at this width: what needs you (actionable) beside
            what happened (ambient), which is the Trainline list/detail split
            applied to a dashboard. */}
        <div
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1.38fr 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          <div>
            <ColumnHeading>Needs your attention</ColumnHeading>
            <AttentionColumn
              noDeals={noDeals}
              loading={next.loading || deals.loading}
              actions={next.actions}
              onAction={onAction}
              onStartDeal={() =>
                chat
                  ? chat.send("I want to start a new deal — help me set it up.")
                  : nav.go("deals")
              }
            />
          </div>

          <div>
            <ColumnHeading>Notifications</ColumnHeading>
            <NotificationColumn
              loaded={notifs.loaded}
              notifications={notifs.notifications}
              onOpen={onNotif}
            />
          </div>
        </div>

        {/* P9 — the honest footer. This screen ranks two lists and neither said
            how. `useNextActions` decides what "needs you" means, and a reader
            is entitled to know that before acting on the order. */}
        <RankingNote
          title="How Today is assembled"
          ordering="Needs you is whatever the next-actions service returns for your deals — overdue gate work, stale deals and pending reviews — in the order it returns them. Nothing on this screen is re-ranked here."
          caveats={[
            "The pipeline figure sums only deals that carry an asking price, and its label says how many of the book that is. A board with no priced deals shows no total rather than a low one.",
            "A figure that has not loaded yet shows as not-known, not as zero. Nothing needing you and nothing checked yet are different states.",
          ]}
        />
      </div>
    </div>
  );
}

/* HeroComposer lived here — a 760px rounded composer with a 36px drop shadow,
   the focal point of the old chat home. Deleted 2026-08-15 with the redesign:
   Yulia is the right-hand rail on every screen now, so a second composer that
   exists on exactly one screen is a second place to type the same thing. Git
   history has it if the rail ever needs a wide variant. */

/* ─── quick-action chip ───────────────────────────────────── */

function QuickChip({
  emoji,
  label,
  onClick,
}: {
  emoji: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        background: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: 13,
        padding: "11px 16px",
        fontSize: 13.5,
        fontWeight: 500,
        color: T.ink,
        boxShadow: T.shCard,
        cursor: "pointer",
        fontFamily: T.font,
        transition: "background .15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = T.hover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = T.white;
      }}
    >
      <span aria-hidden="true" style={{ fontSize: 15, lineHeight: 1 }}>
        {emoji}
      </span>
      {label}
    </button>
  );
}

/* ─── shared column heading ───────────────────────────────── */

function ColumnHeading({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontSize: 14,
        fontWeight: 600,
        color: T.label,
        marginBottom: 11,
      }}
    >
      {children}
    </div>
  );
}

/* ─── attention column ────────────────────────────────────── */

function AttentionColumn({
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
  if (loading) {
    return <ColumnLoading rows={3} />;
  }

  if (noDeals) {
    return (
      <FirstDealCard onStartDeal={onStartDeal} />
    );
  }

  if (actions.length === 0) {
    return (
      <NoteCard text="You're all caught up — nothing needs you right now." />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {actions.map((a) => {
        const kind = attentionKind(a);
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => onAction(a)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              textAlign: "left",
              background: T.white,
              border: `1px solid ${T.border}`,
              borderRadius: 13,
              padding: "13px 15px",
              cursor: "pointer",
              boxShadow: T.shSoft,
              fontFamily: T.font,
              transition: "box-shadow .15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = T.shHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = T.shSoft;
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 30,
                height: 30,
                flex: "none",
                borderRadius: 9,
                background: kind.bg,
                color: kind.fg,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
              }}
            >
              {kind.glyph}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span
                style={{
                  display: "block",
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: T.ink,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {/* The client line, when there is one: TIER · FIRM — why this
                    row jumped the queue is visible, not just computed (the
                    server orders same-urgency rows by tier). */}
                {a.client && (
                  <span style={{ color: T.blue, fontWeight: 700 }}>
                    {a.clientTier ? `${a.clientTier} · ` : ""}{a.client}
                    <span style={{ color: T.faint, fontWeight: 400 }}> › </span>
                  </span>
                )}
                {a.title}
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: 12,
                  color: T.muted2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {a.description || a.cta}
              </span>
            </span>
            <ChevronRightIcon size={16} c={T.faint} />
          </button>
        );
      })}
    </div>
  );
}

function FirstDealCard({ onStartDeal }: { onStartDeal: () => void }) {
  return (
    <div
      style={{
        background: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: 13,
        padding: "18px 16px",
        boxShadow: T.shSoft,
      }}
    >
      <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink, marginBottom: 4 }}>
        No deals yet
      </div>
      <div style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.5, marginBottom: 12 }}>
        Tell Yulia what you're buying, selling, or raising for, and she'll open
        your first deal and start the work.
      </div>
      <button
        type="button"
        onClick={onStartDeal}
        style={{
          background: T.blue,
          color: "#fff",
          border: "none",
          borderRadius: T.rPill,
          padding: "9px 16px",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: T.font,
        }}
      >
        Start your first deal
      </button>
    </div>
  );
}

/* ─── favorite deal card (compact, clickable) ─────────────── */

function FavoriteCard({
  name,
  sub,
  onOpen,
}: {
  name: string;
  sub: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        textAlign: "left",
        background: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: 13,
        padding: "11px 14px",
        cursor: "pointer",
        boxShadow: T.shSoft,
        fontFamily: T.font,
        flex: "1 1 220px",
        minWidth: 200,
        maxWidth: 300,
        transition: "box-shadow .15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = T.shHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = T.shSoft;
      }}
    >
      <MarkBadge letter={name} size={30} radius={8} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 13.5,
            fontWeight: 600,
            color: T.ink,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          <span aria-hidden="true" style={{ color: T.amber, flex: "none" }}>★</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>
        </span>
        <span
          style={{
            display: "block",
            fontSize: 12,
            color: T.muted2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {sub}
        </span>
      </span>
    </button>
  );
}

/* ─── notifications column (real /api/notifications, clickable) ── */

function NotificationColumn({
  loaded,
  notifications,
  onOpen,
}: {
  loaded: boolean;
  notifications: AppNotification[];
  onOpen: (n: AppNotification) => void;
}) {
  if (!loaded) {
    return <ColumnLoading rows={3} />;
  }
  if (notifications.length === 0) {
    return (
      <NoteCard text="You're all caught up — no new notifications. Updates from your deal team show here." />
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {notifications.slice(0, 6).map((n) => {
        const unread = !n.read_at;
        return (
          <button
            key={n.id}
            type="button"
            onClick={() => onOpen(n)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              textAlign: "left",
              background: T.white,
              border: `1px solid ${T.border}`,
              borderRadius: 13,
              padding: "13px 15px",
              cursor: "pointer",
              boxShadow: T.shSoft,
              fontFamily: T.font,
              transition: "box-shadow .15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = T.shHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = T.shSoft;
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 30,
                height: 30,
                flex: "none",
                borderRadius: 9,
                background: unread ? T.greenBg : T.hair,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: unread ? T.green : T.faint,
                }}
              />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span
                style={{
                  display: "block",
                  fontSize: 13.5,
                  fontWeight: unread ? 700 : 600,
                  color: T.ink,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {n.title}
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: 12,
                  color: T.muted2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {n.body ? `${n.body} · ` : ""}
                <span style={{ color: T.faint }}>{notifTimeAgo(n.created_at)}</span>
              </span>
            </span>
            {n.deal_id != null && <ChevronRightIcon size={16} c={T.faint} />}
          </button>
        );
      })}
    </div>
  );
}

/* ─── compact column skeleton ─────────────────────────────── */

/**
 * Card-stack-sized skeleton for the two lower columns. The shared LoadingState
 * centers a spinner with 48px vertical padding, which makes the two columns
 * very tall and unequal while their independent fetches resolve at different
 * times. This matches the resting card stack height so the columns stay
 * balanced during load.
 */
function ColumnLoading({ rows }: { rows: number }) {
  return (
    <div
      aria-busy="true"
      style={{ display: "flex", flexDirection: "column", gap: 9 }}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 58,
            background: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: 13,
            boxShadow: T.shSoft,
            opacity: 0.7,
            animation: "atlas-glow 1.4s ease-in-out infinite",
          }}
        />
      ))}
    </div>
  );
}

/* ─── shared honest note card ─────────────────────────────── */

function NoteCard({ text, style }: { text: string; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: 13,
        padding: "16px 15px",
        boxShadow: T.shSoft,
        fontSize: 13,
        color: T.muted,
        lineHeight: 1.5,
        ...style,
      }}
    >
      {text}
    </div>
  );
}
