/**
 * Atlas — TODAY (view 0, full-bleed Gemini home, NO rail).
 *
 * Design: /tmp/atlas_maps/00 "SCREEN 1 — TODAY". Centered 920px column on
 * #fafbfd with a decorative glow blob, a 50px greeting, a hero composer that
 * sends to Yulia, four quick-action chips, and a two-column lower band:
 *   - "Needs your attention"  ← useNextActions (real gate/stale/review actions)
 *   - "Yulia & your agents"   ← useTodayOperatingBrief (agent/Yulia activity)
 *
 * Honesty: every value is a real hook field or an honest empty note. The
 * prototype's "New listing scanner 7:00 AM" / "$1,200" rows are NOT ported —
 * the agent column renders only what the operating brief actually returns, and
 * shows an honest empty note when the brief is null/empty. An authed user with
 * no deals keeps the composer + chips but gets a first-deal CTA instead of
 * fabricated attention items.
 */
import { useCallback, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { AtlasScreenProps } from "../atlasNav";
import { useAtlasNav, useAtlasChat } from "../atlasNav";
import { T } from "../atlasTokens";
import { Sparkle, LoadingState } from "../primitives";
import { PlusIcon, ChevronDownIcon, ChevronRightIcon, SendArrowIcon } from "../icons";
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

/* ─── attention-item icon tile (tinted by action type) ────── */

type Tile = { bg: string; fg: string };

function tileForAction(a: NextAction): Tile {
  const k = `${a.icon} ${a.title} ${a.cta}`.toLowerCase();
  if (/review|approve|pending|wait/.test(k)) return { bg: T.blueBg3, fg: T.blue };
  if (/stale|idle|nudge|overdue|stall/.test(k)) return { bg: T.terraBg, fg: T.terra };
  if (/draft|cim|summary|memo|deck/.test(k)) return { bg: T.greenBg, fg: T.green };
  return { bg: T.blueBg3, fg: T.blue };
}

function glyphForAction(a: NextAction): string {
  const k = `${a.icon} ${a.title} ${a.cta}`.toLowerCase();
  if (/review|approve|pending/.test(k)) return "⚑";
  if (/stale|idle|nudge|overdue|stall/.test(k)) return "✎";
  if (/draft|cim|summary|memo/.test(k)) return "📝";
  return "›";
}

/* ─── agent-activity item (mapped from the operating brief) ── */

type AgentItem = { glyph: string; color: string; text: string; who: string };

function buildAgentItems(
  pulse: TodayDealPulseItem[] | undefined,
  studio: TodayStudioRefreshItem[] | undefined,
  morning: { title: string; lede: string } | undefined,
): AgentItem[] {
  const items: AgentItem[] = [];
  if (morning && (morning.title || morning.lede)) {
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

export default function TodayScreen({ user }: AtlasScreenProps) {
  const nav = useAtlasNav();
  const chat = useAtlasChat();
  const canFetch = !!user;

  const deals = useMobileDeals(user);
  const next = useNextActions(user, canFetch);
  const { brief, loading: briefLoading } = useTodayOperatingBrief(user, canFetch);

  const [composerValue, setComposerValue] = useState("");

  const sendComposer = useCallback(() => {
    const text = composerValue.trim();
    if (!text || !chat) return;
    chat.send(text);
    setComposerValue("");
  }, [composerValue, chat]);

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

  // Authed user with no deals → keep composer + chips, swap the attention
  // column for a first-deal CTA (never fabricate attention items).
  const noDeals = canFetch && deals.loaded && !deals.hasData;

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        position: "relative",
        overflow: "auto",
        background: T.surface,
        fontFamily: T.font,
        color: T.ink,
      }}
    >
      {/* decorative glow blob — pointer-events none, behind content */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 140,
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 420,
          background:
            "radial-gradient(ellipse at center, rgba(66,133,244,.24), rgba(155,114,203,.13) 45%, transparent 70%)",
          filter: "blur(10px)",
          animation: "atlas-glow 6s ease-in-out infinite",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: 920,
          maxWidth: "92%",
          margin: "0 auto",
          padding: "92px 0 56px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* greeting */}
        <h1
          style={{
            fontSize: 50,
            fontWeight: 600,
            letterSpacing: "-.025em",
            margin: "0 0 32px",
            whiteSpace: "nowrap",
            color: T.ink,
          }}
        >
          {greeting}
        </h1>

        {/* hero composer */}
        <HeroComposer
          value={composerValue}
          onChange={setComposerValue}
          onSend={sendComposer}
          disabled={!chat || chat.sending}
        />

        {/* quick-action chips */}
        <div
          style={{
            display: "flex",
            gap: 11,
            marginTop: 22,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <QuickChip emoji="📊" label="Build a pitch deck" onClick={() => nav.go("studio")} />
          <QuickChip emoji="🔍" label="Screen new targets" onClick={() => nav.go("sourcing")} />
          <QuickChip emoji="📂" label="Summarize a data room" onClick={() => nav.go("files")} />
          <QuickChip emoji="🤖" label="Set up an agent" onClick={() => nav.go("agent")} />
        </div>

        {/* two-column lower band */}
        <div
          style={{
            width: "100%",
            display: "flex",
            gap: 18,
            marginTop: 62,
            paddingTop: 30,
            borderTop: `1px solid ${T.hair}`,
          }}
        >
          {/* LEFT — Needs your attention */}
          <div style={{ flex: 1, minWidth: 0 }}>
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

          {/* RIGHT — Yulia & your agents */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                marginBottom: 11,
              }}
            >
              <Sparkle size={15} />
              <span style={{ fontSize: 14, fontWeight: 600, color: T.label }}>
                Yulia &amp; your agents
              </span>
            </div>
            <AgentColumn loading={briefLoading} items={agentItems} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── hero composer ───────────────────────────────────────── */

function HeroComposer({
  value,
  onChange,
  onSend,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled: boolean;
}) {
  return (
    <div
      style={{
        width: 760,
        maxWidth: "100%",
        background: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: 34,
        boxShadow: "0 12px 36px rgba(31,41,55,.13)",
        padding: "8px 10px 8px 24px",
        display: "flex",
        alignItems: "center",
        gap: 13,
      }}
    >
      <PlusIcon size={24} c={T.muted} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        placeholder="Ask Yulia about a deal, or start something new"
        aria-label="Ask Yulia"
        style={{
          flex: 1,
          minWidth: 0,
          border: "none",
          outline: "none",
          background: "transparent",
          fontFamily: T.font,
          fontSize: 17.5,
          color: T.ink,
          padding: "18px 0",
        }}
      />
      {/* static model label (per design) */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          color: T.label,
          fontSize: 14,
          fontWeight: 500,
          padding: "0 8px",
          flex: "none",
          whiteSpace: "nowrap",
        }}
      >
        Yulia Pro
        <ChevronDownIcon size={16} c={T.label} />
      </span>
      <button
        type="button"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        aria-label="Send to Yulia"
        style={{
          width: 50,
          height: 50,
          flex: "none",
          borderRadius: "50%",
          border: "none",
          background: T.blue,
          color: "#fff",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: disabled || !value.trim() ? "default" : "pointer",
          opacity: disabled || !value.trim() ? 0.55 : 1,
          transition: "opacity .15s ease",
        }}
      >
        <SendArrowIcon size={22} c="#fff" />
      </button>
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
    return <LoadingState label="Checking what needs you…" />;
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
        const tile = tileForAction(a);
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
                background: tile.bg,
                color: tile.fg,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
              }}
            >
              {glyphForAction(a)}
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

/* ─── agent column ────────────────────────────────────────── */

function AgentColumn({ loading, items }: { loading: boolean; items: AgentItem[] }) {
  if (loading) {
    return <LoadingState label="Catching up on agent activity…" />;
  }
  if (items.length === 0) {
    return (
      <NoteCard text="No agent activity yet. Yulia will post updates here as she works your deals." />
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {items.map((it, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 11,
            background: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: 13,
            padding: "13px 15px",
            boxShadow: T.shSoft,
          }}
        >
          <AgentGlyph glyph={it.glyph} color={it.color} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, color: T.ink, lineHeight: 1.45 }}>{it.text}</div>
            <div
              style={{
                fontSize: 12,
                color: T.muted2,
                marginTop: 3,
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
  // The Gemini sparkle uses the gradient clip; other glyphs use a flat color.
  if (glyph === "✦") {
    return (
      <span style={{ marginTop: 1, flex: "none" }}>
        <Sparkle size={15} />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      style={{
        flex: "none",
        marginTop: 1,
        fontSize: 14,
        lineHeight: 1.45,
        color,
        fontWeight: 700,
      }}
    >
      {glyph}
    </span>
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
