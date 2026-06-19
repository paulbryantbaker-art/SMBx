/**
 * Atlas-mobile — TODAY (frame 01). Body content ONLY: the shell renders the
 * header (variant A: ✦Atlas + avatar), the scroll area (with bottom nav
 * clearance), the bottom nav, and the Yulia FAB. This file returns the
 * top-to-bottom Today body per /tmp/atlas_mobile_maps/m1 "FRAME 01 · Today":
 *
 *   greeting (real display_name)
 *   "{n} things need you today" (real next-actions count, honest at 0)
 *   "Ask Yulia anything…" inline composer (shared ChatDock → chat.send)
 *   horizontal quick chips (Pitch deck → studio / Screen targets → sourcing /
 *     Summarize → files)
 *   "Needs your attention" (real useNextActions; dealId → openDeal else
 *     chat.send(prefill))
 *   "Yulia & your agents" (real useTodayOperatingBrief; honest-empty)
 *
 * Wiring mirrors the DESKTOP sibling exactly (desktop/screens/Today.tsx) —
 * same hooks, same honest handling — re-laid for the 358px-wide mobile column.
 *
 * Honesty (contract law #4): every value is a real hook field or an honest
 * empty note. The prototype's "3 things need you" / "Approve Atlas comp set" /
 * "Drafted CIM summary … 12m ago" rows are placeholders and are NOT ported —
 * the attention list renders only real next-actions and the agent list renders
 * only what the operating brief returns (and its `!focusDeal` onboarding line
 * is filtered out, same as desktop). An authed user with genuinely no deals
 * keeps the composer + chips but gets a first-deal CTA instead of fabricated
 * attention items.
 */
import { useCallback } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { AtlasScreenProps } from "../../desktop/atlasNav";
import { useAtlasNav, useAtlasChat } from "../../desktop/atlasNav";
import { T } from "../../desktop/atlasTokens";
import { Sparkle } from "../../desktop/primitives";
import { ChevronRightIcon, PlusIcon, SendArrowIcon } from "../../desktop/icons";
import { useMobileShell } from "../mobileShell";
import { useMobileDeals } from "../../../../hooks/useMobileDeals";
import { useNextActions, type NextAction } from "../../../../hooks/useNextActions";
import {
  useTodayOperatingBrief,
  type TodayDealPulseItem,
  type TodayStudioRefreshItem,
} from "../../../../hooks/useTodayOperatingBrief";

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
 * Same mapping as the desktop sibling — keyed off the server's Material-Symbol
 * `icon` ids (nextActions.ts) so each action family lands on its own tile, with
 * a journey-tinted fallback for gate-work actions. */

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

/* ─── agent-activity item (mapped from the operating brief) ── */

type AgentItem = { glyph: string; color: string; text: string; who: string };

function buildAgentItems(
  pulse: TodayDealPulseItem[] | undefined,
  studio: TodayStudioRefreshItem[] | undefined,
  morning: { title: string; lede: string; focusDealId?: string } | undefined,
): AgentItem[] {
  const items: AgentItem[] = [];
  // Only surface the morning brief as "agent activity" when it's tied to a real
  // focus deal — its `!focus` branch returns an onboarding line for every authed
  // user, and presenting that as work Yulia did is an honesty drift (matches the
  // desktop sibling).
  if (morning && morning.focusDealId && (morning.title || morning.lede)) {
    items.push({
      glyph: "✦",
      color: T.violet,
      text: morning.lede || morning.title,
      who: "Yulia · morning brief",
    });
  }
  for (const s of studio ?? []) {
    items.push({
      glyph: "✓",
      color: T.green,
      text: `${s.reason || s.action} — ${s.title}`,
      who: `${s.format || "Studio"} · refresh`,
    });
  }
  for (const p of pulse ?? []) {
    items.push({
      glyph: "▷",
      color: T.blue,
      text: p.nextAction || p.thesis || `${p.title} — ${p.status}`,
      who: `${p.title} · ${p.urgency || p.status}`,
    });
  }
  return items.slice(0, 4);
}

/* ─── screen ──────────────────────────────────────────────── */

export default function TodayMobileScreen({ user }: AtlasScreenProps) {
  const nav = useAtlasNav();
  const chat = useAtlasChat();
  const shell = useMobileShell();
  const canFetch = !!user;

  const deals = useMobileDeals(user);
  const next = useNextActions(user, canFetch);
  const {
    brief,
    loading: briefLoading,
    error: briefError,
  } = useTodayOperatingBrief(user, canFetch);

  const first = firstNameOf(user?.display_name);
  const greeting = user
    ? `${timeGreeting()}, ${first ?? "there"}.`
    : `${timeGreeting()}.`;

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

  const agentItems = buildAgentItems(
    brief?.dealPulse,
    brief?.studioRefreshNeeds,
    brief?.morningBrief,
  );

  // Authed user with genuinely no deals → keep composer + chips, swap the
  // attention list for a first-deal CTA (never fabricate attention items). Gate
  // on next-actions ALSO returning nothing so a failed /api/deals fetch (which
  // also reads as hasData=false) doesn't hide a real next-actions feed.
  const noDeals =
    canFetch &&
    deals.loaded &&
    !deals.hasData &&
    next.loaded &&
    next.actions.length === 0;

  // Subtitle: honest count from the real next-actions feed. Only assert a count
  // once the feed has loaded; render nothing pre-load so we never flash "0".
  const attnCount = next.actions.length;
  const subtitle = next.loaded
    ? attnCount === 0
      ? "You're all caught up."
      : `${attnCount} ${attnCount === 1 ? "thing needs" : "things need"} you today.`
    : null;

  const startFirstDeal = useCallback(() => {
    if (chat) {
      chat.send("I want to start a new deal — help me set it up.");
    } else {
      nav.go("deals");
    }
  }, [chat, nav]);

  return (
    <div style={{ padding: "0 18px", fontFamily: T.font, color: T.ink }}>
      {/* HERO — the Yulia composer is the focal point of Today (mirrors the
          desktop Gemini home: a centered greeting over the hero composer, with a
          soft glow behind it; the rest of the day is supporting content below). */}
      <div
        style={{
          position: "relative",
          minHeight: "calc(100dvh - 250px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        {/* soft glow behind the composer — decorative; absolute-in-relative, NOT
            a fixed full-viewport bg div (Safari toolbar rule). Centered on the
            hero (greeting + composer) via translate(-50%,-50%); no animation here
            so the transform-centering holds. */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "54%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 470,
            height: 344,
            background:
              "radial-gradient(ellipse at center, rgba(66,133,244,.35), rgba(155,114,203,.21) 46%, transparent 72%)",
            filter: "blur(16px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* greeting — centered hero; display_name is unbounded so wrap+clamp */}
          <h1
            style={{
              fontSize: 33,
              fontWeight: 600,
              letterSpacing: "-.025em",
              lineHeight: 1.08,
              textAlign: "center",
              margin: "4px 0 7px",
              overflowWrap: "anywhere",
              color: T.ink,
            }}
          >
            {greeting}
          </h1>

          {/* subtitle — honest next-actions count (or caught-up / pre-load) */}
          {subtitle && (
            <div
              style={{
                fontSize: 14.5,
                color: T.muted2,
                textAlign: "center",
                marginBottom: 28,
              }}
            >
              {subtitle}
            </div>
          )}

          {/* the hero composer — enlarged; tap to open the full Ask Yulia chat */}
          <button
            type="button"
            onClick={() => shell?.openChat()}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: T.white,
              border: `1px solid ${T.border}`,
              borderRadius: 33,
              boxShadow: "0 16px 42px rgba(31,41,55,.17)",
              padding: "13px 13px 13px 22px",
              cursor: "pointer",
              fontFamily: T.font,
              textAlign: "left",
            }}
          >
            <PlusIcon size={24} c={T.muted} />
            <span style={{ flex: 1, color: T.muted, fontSize: 17 }}>
              Ask Yulia anything…
            </span>
            <span
              style={{
                width: 46,
                height: 46,
                flex: "none",
                borderRadius: "50%",
                background: T.blue,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SendArrowIcon size={20} c="#fff" />
            </span>
          </button>

          {/* quick-action chips — edge-bleed scroll row under the composer */}
          <div
            className="scr"
            style={{
              display: "flex",
              gap: 9,
              margin: "14px -18px 0",
              padding: "0 18px",
              overflowX: "auto",
            }}
          >
            <QuickChip emoji="📊" label="Pitch deck" onClick={() => nav.go("studio")} />
            <QuickChip emoji="🔍" label="Screen targets" onClick={() => nav.go("sourcing")} />
            <QuickChip emoji="📂" label="Summarize" onClick={() => nav.go("files")} />
          </div>
        </div>
      </div>

      {/* Needs your attention */}
      <SectionHeading>Needs your attention</SectionHeading>
      <AttentionList
        noDeals={noDeals}
        loading={next.loading || deals.loading}
        actions={next.actions}
        onAction={onAction}
        onStartDeal={startFirstDeal}
      />

      {/* Yulia & your agents */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          margin: "22px 0 10px",
        }}
      >
        <Sparkle size={14} />
        <span style={{ fontSize: 13, fontWeight: 600, color: T.label }}>
          Yulia &amp; your agents
        </span>
      </div>
      <AgentList loading={briefLoading} error={briefError} items={agentItems} />
    </div>
  );
}

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
        flex: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        background: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        padding: "10px 13px",
        fontSize: 13,
        fontWeight: 500,
        color: T.ink,
        boxShadow: T.shCard,
        cursor: "pointer",
        whiteSpace: "nowrap",
        fontFamily: T.font,
      }}
    >
      <span aria-hidden="true" style={{ fontSize: 14, lineHeight: 1 }}>
        {emoji}
      </span>
      {label}
    </button>
  );
}

/* ─── section heading ─────────────────────────────────────── */

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 600, color: T.label, marginBottom: 10 }}>
      {children}
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
  if (loading) {
    return <ListLoading rows={2} />;
  }

  if (noDeals) {
    return <FirstDealCard onStartDeal={onStartDeal} />;
  }

  if (actions.length === 0) {
    return <NoteCard text="You're all caught up — nothing needs you right now." />;
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
              width: "100%",
              textAlign: "left",
              background: T.white,
              border: `1px solid ${T.border}`,
              borderRadius: 14,
              padding: 13,
              cursor: "pointer",
              fontFamily: T.font,
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
                fontSize: 14,
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
        borderRadius: 14,
        padding: "16px 15px",
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

/* ─── agent list ──────────────────────────────────────────── */

function AgentList({
  loading,
  error,
  items,
}: {
  loading: boolean;
  error: string | null;
  items: AgentItem[];
}) {
  if (loading) {
    return <ListLoading rows={2} />;
  }
  // The operating-brief route 500s on failure → the hook nulls the brief, which
  // would otherwise read as the "no activity" empty note. Surface it honestly.
  if (error) {
    return (
      <NoteCard text="Couldn't load agent activity right now. Refresh to try again." />
    );
  }
  if (items.length === 0) {
    return (
      <NoteCard text="No agent activity yet. Yulia will post updates here as she works your deals." />
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {items.map((it, i) => (
        // Non-interactive read-only log: white card, default cursor, no chevron —
        // distinct from the clickable attention rows above.
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 9,
            background: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: 13,
          }}
        >
          <AgentGlyph glyph={it.glyph} color={it.color} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                color: T.ink,
                lineHeight: 1.45,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {it.text}
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: T.muted2,
                marginTop: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {it.who}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AgentGlyph({ glyph, color }: { glyph: string; color: string }) {
  if (glyph === "✦") {
    return (
      <span style={{ marginTop: 1, flex: "none" }}>
        <Sparkle size={14} />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      style={{
        flex: "none",
        marginTop: 1,
        fontSize: 13,
        lineHeight: 1.45,
        color,
        fontWeight: 700,
      }}
    >
      {glyph}
    </span>
  );
}

/* ─── list skeleton ───────────────────────────────────────── */

function ListLoading({ rows }: { rows: number }) {
  return (
    <div aria-busy="true" style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 58,
            background: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            opacity: 0.7,
          }}
        />
      ))}
    </div>
  );
}

/* ─── honest note card ────────────────────────────────────── */

function NoteCard({ text, style }: { text: string; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
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
