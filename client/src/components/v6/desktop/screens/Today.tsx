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
import { useCallback, useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { AtlasScreenProps } from "../atlasNav";
import { useAtlasNav, useAtlasChat } from "../atlasNav";
import { T } from "../atlasTokens";
import { MarkBadge, fmtCents } from "../primitives";
import { PlusIcon, ChevronRightIcon, SendArrowIcon } from "../icons";
import { CompareStrip, RankingNote, GroupHeader, ResultRow, Endorsement, Sheet } from "../kit";
import { useMobileDeals } from "../../../../hooks/useMobileDeals";
import { useNextActions, type NextAction } from "../../../../hooks/useNextActions";
import { useNotifications, notifTimeAgo, type AppNotification } from "../../../../hooks/useNotifications";
import { useAdvisorMandates } from "../../../../hooks/useAdvisorMandates";
import { authHeaders } from "../../../../hooks/useAuth";
import MandatesBand from "./MandatesBand";

/* ─── the countdown feed (deal key dates, migration 131) ──────────────────
   One row per (deal, deadline) within a fortnight — INCLUDING overdue, since
   an expired exclusivity is the loudest fact on the board. Records (IoI,
   LOI) never appear here: the server excludes them by construction. */

interface KeyDateItem {
  dealId: number;
  businessName: string;
  clientFirm: string | null;
  kind: string;
  label: string;
  on: string;
  daysLeft: number;
}

function useKeyDates(canFetch: boolean): KeyDateItem[] {
  const [items, setItems] = useState<KeyDateItem[]>([]);
  useEffect(() => {
    if (!canFetch) return;
    let live = true;
    fetch("/api/deals/key-dates?within=14", { headers: authHeaders() })
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (live && Array.isArray(d?.items)) setItems(d.items); })
      .catch(() => { /* a failed fetch renders as silence, same as empty —
                        the section never fabricates a deadline */ });
    return () => { live = false; };
  }, [canFetch]);
  return items;
}

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

/* ── the kit-era styles for this screen ─────────────────────────────────── */

/* ONE BORDERED CONTAINER, hairline-divided. Radius 0 — Carta's exception is
   buttons and inputs, and a list is neither. The old rows were radius-13 cards
   with a 9px gap between them, which is the single biggest reason the screen
   read as Atlas rather than as the reference. */
const listBox: CSSProperties = {
  border: `1px solid ${T.border}`,
  borderRadius: 8,
  overflow: "hidden",
  background: T.white,
};
const emptyBox: CSSProperties = {
  border: `1px solid ${T.border}`, borderRadius: 8, background: T.white,
  padding: "22px 16px", fontSize: 12.5, color: T.muted, lineHeight: 1.6,
};
const moreRow: CSSProperties = {
  padding: "10px 12px", borderTop: `1px solid ${T.border}`,
  fontSize: 11.5, color: T.muted2,
};
const noteSummary: CSSProperties = {
  fontSize: 11.5, fontWeight: 700, color: T.blue, cursor: "pointer",
  marginBottom: 4,
};
/* Countdown rows — hairline-divided like every list on this screen. */
const countdownRow: CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  gap: 14, padding: "10px 12px", borderTop: `1px solid ${T.border}`,
};
const countdownWhen: CSSProperties = {
  marginLeft: 10, fontSize: 13, fontWeight: 700,
  fontVariantNumeric: "tabular-nums",
};

/* ─── screen ──────────────────────────────────────────────── */

export default function TodayScreen({ user }: AtlasScreenProps) {
  const nav = useAtlasNav();
  const chat = useAtlasChat();
  const canFetch = !!user;

  const deals = useMobileDeals(user);
  const next = useNextActions(user, canFetch);
  const mandates = useAdvisorMandates(user);
  const notifs = useNotifications(canFetch);
  const keyDates = useKeyDates(canFetch);

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
          width: 1128,
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

        {/* THE COUNTDOWN — deal deadlines within a fortnight, overdue first.
            When nothing is inside the window it renders NOTHING: Today is a
            queue, and an empty countdown is silence, not a card claiming
            "all clear" about dates that may simply not be set. */}
        {keyDates.length > 0 && (
          <div style={{ width: "100%" }}>
            <div style={listBox}>
              <GroupHeader title={`Countdown · ${keyDates.length}`} columns={["When"]} />
              {keyDates.map(k => {
                const tone = k.daysLeft < 0 ? T.terra : k.daysLeft <= 7 ? T.amber : T.ink;
                const when =
                  k.daysLeft < 0 ? `expired ${-k.daysLeft}d ago`
                  : k.daysLeft === 0 ? "today"
                  : `in ${k.daysLeft}d`;
                return (
                  <div key={`${k.dealId}-${k.kind}`} style={countdownRow}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>
                        {k.businessName}
                      </div>
                      {k.clientFirm && (
                        <div style={{ fontSize: 11.5, color: T.muted2, marginTop: 1 }}>
                          {k.clientFirm}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: "none", textAlign: "right" }}>
                      <span style={{ fontSize: 12.5, color: T.muted }}>{k.label}</span>
                      <span style={{ ...countdownWhen, color: tone }}>{when}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
        {/* THE BODY IS THE KIT NOW (2026-08-16).

            Paul, looking at the deployed screen: *"it is a far cry from the
            cool sophistication of trainline UI, which is what i thought we
            were doing."* He was right, and the reason was visible in the
            markup: the STRIP was the kit and everything under it was still
            Atlas — `AttentionColumn` rendering `borderRadius: 13` cards
            floating in a 9px gap, five of them, each saying the same
            "your next step is due."

            Three things separate that from the reference, and none of them is
            colour:
              · DENSITY. One bordered container with hairline dividers, not
                cards with gaps. A gap says "these are separate things"; a
                rule says "these are rows of one thing", which is what they are.
              · COLUMNS. The reference's prices sit in fixed right-aligned
                columns under a header, so the eye compares straight down. Ours
                had every value inline in a sentence, so there was nothing to
                compare.
              · A ROW THAT SAYS SOMETHING. "your next step is due" on all five
                rows is not information. The client, what is owed, and its tier
                are all on the record and none of them were rendered. */}
        <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1.62fr 1fr", gap: 26, alignItems: "start" }}>
          <div>
            {noDeals && next.actions.length === 0 ? (
              <div style={emptyBox}>
                Nothing is waiting on you. When a gate goes overdue or a client
                is owed a touch, it lands here.
              </div>
            ) : (
              <div style={listBox}>
                <GroupHeader
                  title={`Needs you${next.loaded ? ` · ${next.actions.length}` : ""}`}
                  columns={["Client", "Tier"]}
                />
                {next.actions.slice(0, 8).map((a, idx) => (
                  <div key={a.id}>
                    {/* The endorsement goes on the FIRST row only, and its
                        grounds are `because` — the traceable reason the
                        service gives, never generated prose. If the service
                        did not supply one, no band: a claim with no grounds
                        is exactly what the kit refuses to render. */}
                    {idx === 0 && a.because && (
                      <Endorsement claim="Start here." grounds={a.because} />
                    )}
                    <ResultRow
                      anchor={a.action || a.title}
                      sub={a.currentGate ? `${a.journeyType ?? "deal"} · ${a.currentGate}` : (a.journeyType ?? undefined)}
                      subLink={a.dealName || undefined}
                      onSubLink={() => onAction(a)}
                      onClick={() => onAction(a)}
                      endorsed={idx === 0 && !!a.because}
                      values={[
                        { text: a.client ?? null },
                        { text: a.clientTier ?? null },
                      ]}
                    />
                  </div>
                ))}
                {next.actions.length > 8 && (
                  <div style={moreRow}>
                    {next.actions.length - 8} more waiting — open Deals to work the rest.
                  </div>
                )}
              </div>
            )}
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

        {/* P9 — the honest footer, COLLAPSED. It was three paragraphs of prose
            sitting open at the bottom of the page, which on the deployed
            screen was the largest block of text on it. The reference's
            equivalent is four quiet lines. It is for the moment somebody
            challenges the order, so it has to be complete and it does not have
            to be loud. */}
        <details style={{ marginTop: 4 }}>
          <summary style={noteSummary}>How Today is assembled</summary>
          <div style={{ marginTop: -12 }}>
            <RankingNote
              title=""
              ordering="Needs you is whatever the next-actions service returns for your deals — overdue gate work, stale deals and pending reviews — in the order it returns them. Nothing on this screen is re-ranked here, and only the first eight are shown."
              caveats={[
                "The pipeline figure sums only deals that carry an asking price, and its label says how many of the book that is. A board with no priced deals shows no total rather than a low one.",
                "A figure that has not loaded yet shows as not-known, not as zero. Nothing needing you and nothing checked yet are different states.",
                "The highlighted row is simply the first one the service returned, and its reason is the service's own — not a judgement made here.",
              ]}
            />
          </div>
        </details>
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
        /* Radius 0. Carta's one exception is buttons and inputs; a card is
           neither, and radius-13 cards in a gapped stack are the Atlas
           grammar this screen was rebuilt to leave. */
        borderRadius: 0,
        padding: "11px 16px",
        fontSize: 13.5,
        fontWeight: 500,
        color: T.ink,
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

/* AttentionColumn lived here — radius-13 cards in a 9px gap, each with a
   30px tinted glyph tile. Deleted 2026-08-16: the kit's GroupHeader +
   ResultRow render that list now, as one bordered container with hairline
   dividers and right-aligned columns. Its `attentionKind` tile palette went
   with it; a per-journey tint on a 30px square was carrying no information a
   reader could act on, and it was five different colours on a screen whose
   design system has one accent. */


function FirstDealCard({ onStartDeal }: { onStartDeal: () => void }) {
  return (
    <div
      style={{
        background: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: 0,
        padding: "18px 16px",
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
          borderRadius: 10,
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
        borderRadius: 0,
        padding: "11px 14px",
        cursor: "pointer",
        fontFamily: T.font,
        flex: "1 1 220px",
        minWidth: 200,
        maxWidth: 300,
        transition: "box-shadow .15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = T.track;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = T.white;
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
  if (!loaded) return <ColumnLoading rows={3} />;
  if (notifications.length === 0) {
    return (
      <div style={emptyBox}>
        You&rsquo;re all caught up. Updates from your deal team show here.
      </div>
    );
  }
  /* THE SAME CONTAINER AS THE LEFT COLUMN. It used to be radius-13 cards in a
     9px gap with a 30px tinted glyph tile each; beside a hairline-divided list
     the two columns read as two different products. An unread row is marked by
     a 3px accent bar on its leading edge rather than by a coloured tile —
     one accent, and the mark sits where the eye enters the row. */
  return (
    <div style={listBox}>
      {notifications.slice(0, 6).map((n) => {
        const unread = !n.read_at;
        return (
          <button
            key={n.id}
            type="button"
            onClick={() => onOpen(n)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              background: T.white,
              border: "none",
              borderTop: `1px solid ${T.border}`,
              borderLeft: `3px solid ${unread ? T.blue : "transparent"}`,
              padding: "10px 12px",
              cursor: "pointer",
              fontFamily: T.font,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = T.track; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = T.white; }}
          >
            <div style={{ fontSize: 12.5, fontWeight: unread ? 700 : 500, color: T.ink }}>
              {n.title}
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
              {notifTimeAgo(n.created_at)}
              {n.body ? ` · ${n.body}` : ""}
            </div>
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
            borderRadius: 0,
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
        borderRadius: 0,
        padding: "16px 15px",
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
