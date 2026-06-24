/**
 * Atlas-mobile — TODAY (redesign / Cash App language; see /MOBILE_REDESIGN.md).
 * Body content only — the shell renders the header, scroll area, nav, and the
 * Yulia FAB.
 *
 *   Pipeline HERO — real usePortfolioSummary.weightedEvCents + totalActive
 *     (honest: no fabricated delta). No deals → greeting + first-deal CTA.
 *   "Needs you"   — real useNextActions as action-rows (tap → openDeal / chat).
 *   "Yulia & your agents" — real useTodayOperatingBrief; honest-empty.
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
import {
  useTodayOperatingBrief,
  type TodayDealPulseItem,
  type TodayStudioRefreshItem,
} from "../../../../hooks/useTodayOperatingBrief";
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

/* ─── agent-activity items (mapped from the operating brief) ── */

type AgentItem = { text: string; who: string };

function buildAgentItems(
  pulse: TodayDealPulseItem[] | undefined,
  studio: TodayStudioRefreshItem[] | undefined,
  morning: { title: string; lede: string; focusDealId?: string } | undefined,
): AgentItem[] {
  const items: AgentItem[] = [];
  // Only surface the morning brief when it's tied to a real focus deal — its
  // `!focus` branch is an onboarding line for every authed user (honesty drift).
  if (morning && morning.focusDealId && (morning.title || morning.lede)) {
    items.push({ text: morning.lede || morning.title, who: "Yulia · morning brief" });
  }
  for (const s of studio ?? []) {
    items.push({ text: `${s.reason || s.action} — ${s.title}`, who: `${s.format || "Studio"} · refresh` });
  }
  for (const p of pulse ?? []) {
    items.push({
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
  const canFetch = !!user;

  const deals = useMobileDeals(user);
  const next = useNextActions(user, canFetch);
  const { summary } = usePortfolioSummary(user, canFetch);
  const { brief, loading: briefLoading, error: briefError } = useTodayOperatingBrief(user, canFetch);

  const first = firstNameOf(user?.display_name);
  const greeting = user ? `${timeGreeting()}, ${first ?? "there"}.` : `${timeGreeting()}.`;

  const onAction = useCallback(
    (a: NextAction) => {
      if (a.dealId != null) nav.openDeal(a.dealId, a.dealName);
      else if (chat) chat.send(a.prefill || a.title);
    },
    [nav, chat],
  );

  const agentItems = buildAgentItems(brief?.dealPulse, brief?.studioRefreshNeeds, brief?.morningBrief);

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

      {/* Yulia & your agents */}
      <SectionHeader>Yulia &amp; your agents</SectionHeader>
      <AgentList loading={briefLoading} error={briefError} items={agentItems} />
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

/* ─── agent list (read-only log) ──────────────────────────── */

function AgentList({ loading, error, items }: { loading: boolean; error: string | null; items: AgentItem[] }) {
  if (loading) return <Skeleton rows={2} />;
  if (error) return <Note text="Couldn't load agent activity right now. Refresh to try again." />;
  if (items.length === 0)
    return <Note text="No agent activity yet. Yulia will post updates here as she works your deals." />;
  return (
    <div>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", gap: 11, padding: "11px 0", alignItems: "flex-start" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: RT.accent, marginTop: 7, flex: "none" }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={S.agentText}>{it.text}</div>
            <div style={S.agentWho}>{it.who}</div>
          </div>
        </div>
      ))}
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
    color: "#fff",
    border: "none",
    borderRadius: RT.rPill,
    padding: "11px 18px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: RT.font,
  },
  agentText: {
    fontSize: 15,
    color: RT.ink,
    lineHeight: 1.4,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  agentWho: { fontSize: 13, color: RT.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
};
