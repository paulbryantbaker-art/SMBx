/**
 * Atlas-mobile — AGENT (frame 12). Body content ONLY: the shell renders the
 * header (variant B: back + "Agent"), the scroll area (with bottom-nav
 * clearance), the bottom nav, and the Yulia FAB. This file returns the
 * top-to-bottom Agent body, re-laid for the ~358px mobile column.
 *
 * HONEST BY DESIGN — confirmed BACKEND GAP (mirrors desktop/screens/Agent.tsx):
 *   there is NO persisted/schedulable agent object, no on/off, no run-history
 *   table. The frame-12 prototype ("New listing scanner · Runs daily · 7:00 AM",
 *   "Found 3 new listings · 2 Tier-1", on/off toggles) is FICTION and is NOT
 *   ported. The only real, durable substrate is:
 *     • the in-chat agentic loop — you "configure an agent" by describing it to
 *       Yulia (chat.send);
 *     • the per-ACTION human-approval queue `agency_staged_actions`, surfaced by
 *       GET /api/agency/actions + the chat bridge's confirmStagedAction /
 *       cancelStagedAction (THE LINE — Yulia stages, the user decides).
 *
 * So this screen renders, top to bottom:
 *   (a) a short honest explainer that scheduled agents are set up by describing
 *       them to Yulia, who stages anything irreversible for your approval;
 *   (b) the REAL pending-approval queue from GET /api/agency/actions, each staged
 *       action as a "Needs your approval" card with Approve/Decline wired to
 *       useAtlasChat()?.confirmStagedAction(id) / cancelStagedAction(id);
 *   (c) recent agent-ish next-moves from useNextActions (deterministic, real);
 *   (d) a "Describe what an agent should do" inline composer (shared ChatDock) →
 *       chat.send.
 *
 * Wiring mirrors the DESKTOP sibling exactly (same in-file useStagedActions hook
 * over the existing /api/agency/actions endpoint — the sanctioned "existing
 * endpoint, no client hook" case, NOT a parallel data path; same approve/decline
 * RECONCILE so a server-blocked irreversible action reappears instead of
 * silently vanishing). Every value is a real field or an honest empty/loading/
 * error state.
 */
import { useCallback, useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { AtlasScreenProps } from "../../desktop/atlasNav";
import { useAtlasNav, useAtlasChat } from "../../desktop/atlasNav";
import { authHeaders } from "../../../../hooks/useAuth";
import { useNextActions, type NextAction } from "../../../../hooks/useNextActions";
import { T } from "../../desktop/atlasTokens";
import { Sparkle, Pill, Card } from "../../desktop/primitives";
import { CheckIcon, CloseIcon, ChevronRightIcon } from "../../desktop/icons";
import ChatDock from "../../../shared/ChatDock";

/* ────────────────────────────────────────────────────────────────────────────
 * In-file hook over the existing /api/agency/actions endpoint (no client hook
 * exists). Sanctioned "existing endpoint, no hook" case — NOT a parallel data
 * path. Shape mirrors the server AgencyStagedAction exactly, identical to the
 * desktop sibling.
 * ──────────────────────────────────────────────────────────────────────────── */
interface StagedAction {
  id: number;
  conversation_id: number | null;
  tool_name: string;
  action_label: string;
  permission_level: string | null;
  risk_level: string | null;
  write_scope: string | null;
  input: Record<string, any>;
  status: string;
  created_at: string;
}

function useStagedActions(canFetch: boolean) {
  const [actions, setActions] = useState<StagedAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resolves with the fresh list (or rejects) so callers that mutate the server
  // (approve/decline) can RECONCILE — a server-blocked action that the confirm
  // path swallowed reappears instead of silently staying removed.
  const fetchOnce = useCallback(async (): Promise<StagedAction[]> => {
    const r = await fetch("/api/agency/actions", { headers: authHeaders() });
    if (!r.ok) throw new Error(`actions ${r.status}`);
    const data: { actions?: StagedAction[] } = await r.json();
    return Array.isArray(data.actions) ? data.actions : [];
  }, []);

  // Initial / "Try again" load — owns the loading + error UI state.
  const load = useCallback(() => {
    if (!canFetch) {
      setActions([]);
      setLoading(false);
      setLoaded(false);
      setError(null);
      return () => {};
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchOnce()
      .then((next) => {
        if (!cancelled) setActions(next);
      })
      .catch((e: any) => {
        if (!cancelled) {
          setActions([]);
          setError(e?.message || "Failed to load");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [canFetch, fetchOnce]);

  useEffect(() => {
    const cleanup = load();
    return cleanup;
  }, [load]);

  // Silent reconcile — does NOT flip the full-screen loading/error state, so it
  // can run after every approve/decline and on manual refresh without flashing
  // the loader. On failure it leaves the optimistic state untouched (the chat
  // rail already surfaced the error) rather than wiping the queue.
  const reconcile = useCallback(async () => {
    if (!canFetch) return;
    setRefreshing(true);
    try {
      const next = await fetchOnce();
      setActions(next);
      setError(null);
    } catch {
      /* keep current optimistic state; chat rail owns the error message */
    } finally {
      setRefreshing(false);
    }
  }, [canFetch, fetchOnce]);

  // Optimistic local removal once the user approves/declines, so the card leaves
  // immediately; reconcile() then reconciles with the server.
  const remove = useCallback((id: number) => {
    setActions((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { actions, loading, loaded, refreshing, error, refresh: load, reconcile, remove };
}

/* ── small helpers (verbatim semantics from the desktop sibling) ── */
function riskTone(risk: string | null): { bg: string; fg: string } {
  switch ((risk || "").toLowerCase()) {
    case "high":
      return { bg: T.terraBg, fg: T.terra };
    case "medium":
    case "moderate":
      return { bg: T.amberBg, fg: T.amber };
    case "low":
      return { bg: T.greenBg, fg: T.green };
    default:
      return { bg: T.track, fg: T.muted };
  }
}

function titleizeTool(tool: string): string {
  return tool
    .replace(/[_.]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function relTime(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  const diff = Date.now() - t;
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.round(hr / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(t).toLocaleDateString();
}

/* ── robot glyph (violet) — the agent mark, matches the design icon tile ── */
function RobotGlyph({ size = 18, c = T.violet }: { size?: number; c?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="8" width="16" height="11" rx="3" stroke={c} strokeWidth="2" />
      <path d="M12 4v4" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="4" r="1.4" fill={c} />
      <circle cx="9" cy="13" r="1.2" fill={c} />
      <circle cx="15" cy="13" r="1.2" fill={c} />
      <path d="M2 12v3M22 12v3" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ── inline spinner (matches LoadingState's ring) ── */
function Spinner({ c, size = 13 }: { c: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        flex: "none",
        borderRadius: "50%",
        border: `2px solid ${c}`,
        borderTopColor: "transparent",
        opacity: 0.85,
        animation: "atlas-glow 1s linear infinite",
      }}
    />
  );
}

/* ── section heading (mobile body convention — Today.tsx) ── */
function SectionHeading({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ fontSize: 15.5, fontWeight: 700, color: T.ink, letterSpacing: "-0.01em", marginBottom: 10, ...style }}>
      {children}
    </div>
  );
}

/* ── honest note card ── */
function NoteCard({ title, text }: { title?: string; text: string }) {
  return (
    <div
      style={{
        background: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: "16px 15px",
      }}
    >
      {title && (
        <div style={{ fontSize: 15.5, fontWeight: 600, color: T.ink, marginBottom: 5 }}>
          {title}
        </div>
      )}
      <div style={{ fontSize: 14, color: T.muted, lineHeight: 1.55 }}>{text}</div>
    </div>
  );
}

/* ── list skeleton ── */
function ListLoading({ rows = 2 }: { rows?: number }) {
  return (
    <div aria-busy="true" style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 92,
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

/* ── one staged action = one "Needs your approval" card (THE LINE) ── */
function ApprovalCard({
  action,
  onApprove,
  onDecline,
  pending,
}: {
  action: StagedAction;
  onApprove: () => void;
  onDecline: () => void;
  pending: "approve" | "decline" | null;
}) {
  const tone = riskTone(action.risk_level);
  const label = action.action_label || titleizeTool(action.tool_name);
  const busy = pending !== null;
  return (
    <Card pad="14px 15px" style={{ borderColor: T.approvalBd }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
        <div
          style={{
            width: 32,
            height: 32,
            flex: "none",
            borderRadius: 9,
            background: T.violetBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RobotGlyph size={17} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: T.muted2,
              letterSpacing: ".04em",
              marginBottom: 4,
            }}
          >
            NEEDS YOUR APPROVAL
          </div>
          <div
            style={{
              fontSize: 15.5,
              fontWeight: 600,
              color: T.ink,
              lineHeight: 1.4,
              overflowWrap: "anywhere",
            }}
          >
            {label}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 9 }}>
            <Pill
              bg={T.track}
              fg={T.muted}
              style={{
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "inline-block",
              }}
            >
              {titleizeTool(action.tool_name)}
            </Pill>
            {action.risk_level && (
              <Pill bg={tone.bg} fg={tone.fg}>
                {action.risk_level} risk
              </Pill>
            )}
            {action.write_scope && (
              <Pill
                bg={T.track}
                fg={T.muted}
                style={{
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "inline-block",
                }}
              >
                {action.write_scope}
              </Pill>
            )}
            {action.permission_level && (
              <Pill bg={T.track} fg={T.muted}>
                {action.permission_level}
              </Pill>
            )}
          </div>
          {action.created_at && (
            <div style={{ fontSize: 14, color: T.muted, marginTop: 8 }}>
              Staged {relTime(action.created_at)}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 9, marginTop: 13 }}>
        <button
          type="button"
          disabled={busy}
          onClick={onApprove}
          style={{
            flex: 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            border: "none",
            background: T.blue,
            color: T.white,
            borderRadius: T.rPill,
            padding: "9px 16px",
            fontFamily: T.font,
            fontSize: 14,
            fontWeight: 700,
            cursor: busy ? "default" : "pointer",
            opacity: busy ? 0.6 : 1,
          }}
        >
          {pending === "approve" ? <Spinner c={T.white} /> : <CheckIcon size={14} c={T.white} />}
          {pending === "approve" ? "Approving…" : "Approve"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onDecline}
          style={{
            flex: 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            border: `1px solid ${T.border}`,
            background: T.white,
            color: T.ink3,
            borderRadius: T.rPill,
            padding: "9px 16px",
            fontFamily: T.font,
            fontSize: 14,
            fontWeight: 700,
            cursor: busy ? "default" : "pointer",
            opacity: busy ? 0.6 : 1,
          }}
        >
          {pending === "decline" ? <Spinner c={T.ink3} /> : <CloseIcon size={14} c={T.ink3} />}
          {pending === "decline" ? "Declining…" : "Decline"}
        </button>
      </div>
    </Card>
  );
}

/* ── screen ─────────────────────────────────────────────────── */

export default function AgentMobileScreen({ user }: AtlasScreenProps) {
  const nav = useAtlasNav();
  const chat = useAtlasChat();
  const canFetch = !!user;

  // Setting up an agent means starting a real, persisted Yulia conversation —
  // that needs BOTH a live chat bridge AND a signed-in user. An anonymous
  // visitor has a chat bridge (the sample one) but no account, so the composer
  // must read as not-yet-available, not live (matches the desktop sibling).
  const agentSetupReady = !!chat && canFetch;

  const { actions, loading, loaded, refreshing, error, refresh, reconcile, remove } =
    useStagedActions(canFetch);
  const next = useNextActions(user, canFetch);

  // Which action is mid-flight, and whether it's an approve or a decline.
  const [busy, setBusy] = useState<{ id: number; kind: "approve" | "decline" } | null>(null);

  const sendToYulia = useCallback(
    (text: string) => {
      const t = text.trim();
      if (!t || !agentSetupReady || !chat) return;
      chat.send(t);
    },
    [agentSetupReady, chat],
  );

  // The inline composer's raw text → an explicit "set up an agent" ask so Yulia
  // routes into configuration rather than a generic chat turn.
  const submitDraft = useCallback(
    (raw: string) => {
      const t = raw.trim();
      if (!t) return;
      sendToYulia(
        `I want to set up an agent that does the following: ${t}. Walk me through how to configure it and what you'll need from me.`,
      );
    },
    [sendToYulia],
  );

  // IMPORTANT: confirmStagedAction / cancelStagedAction swallow every error
  // internally (toast + chat-rail message, never re-thrown — useAuthChat.ts).
  // They also resolve on HTTP 200 with status 'blocked' / 'failed'. So an
  // optimistic remove() alone could make a BLOCKED irreversible action vanish
  // from this queue as if it were approved. After the mutation we reconcile()
  // against /api/agency/actions — anything the server did NOT actually clear
  // reappears, keeping this surface honest and in sync with the chat-rail card.
  const approve = useCallback(
    async (a: StagedAction) => {
      if (!chat?.confirmStagedAction || busy) return;
      setBusy({ id: a.id, kind: "approve" });
      try {
        await chat.confirmStagedAction(a.id, a.action_label || a.tool_name);
        remove(a.id);
      } finally {
        setBusy(null);
        await reconcile();
      }
    },
    [chat, busy, remove, reconcile],
  );

  const decline = useCallback(
    async (a: StagedAction) => {
      if (!chat?.cancelStagedAction || busy) return;
      setBusy({ id: a.id, kind: "decline" });
      try {
        await chat.cancelStagedAction(a.id);
        remove(a.id);
      } finally {
        setBusy(null);
        await reconcile();
      }
    },
    [chat, busy, remove, reconcile],
  );

  const onNextAction = useCallback(
    (act: NextAction) => {
      if (act.prefill && chat) chat.send(act.prefill);
      else if (act.dealId != null) nav.openDeal(act.dealId, act.dealName);
    },
    [chat, nav],
  );

  // Both honest-empty sections empty at once (brand-new user) → de-emphasize the
  // second one to a single quiet line so we don't stack two near-identical
  // empty cards (matches the desktop sibling's reasoning).
  const approvalsEmpty = loaded && !error && actions.length === 0;

  return (
    <div style={{ padding: "0 18px", fontFamily: T.font, color: T.ink }}>
      {/* (a) honest explainer — what an "agent" actually is here */}
      <Card
        pad="15px 16px"
        style={{ background: T.blueBg3, borderColor: T.approvalBd, marginTop: 4, marginBottom: 20 }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <span style={{ paddingTop: 1, flex: "none" }}>
            <Sparkle size={16} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15.5, fontWeight: 600, color: T.ink, marginBottom: 5 }}>
              Set up agents by describing them to Yulia
            </div>
            <div style={{ fontSize: 14, color: T.muted, lineHeight: 1.6 }}>
              Tell Yulia what you want watched, scored, or drafted on a recurring basis —
              scanning for new listings against your buy-box, or refreshing a valuation when
              financials change. Yulia does the work and stages anything irreversible here for
              your approval before it runs. Nothing that writes or commits happens without your
              explicit go-ahead.
            </div>
          </div>
        </div>
      </Card>

      {/* (b) the REAL pending-approval queue (THE LINE) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <SectionHeading style={{ marginBottom: 0 }}>Pending approvals</SectionHeading>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {loaded && actions.length > 0 && (
            <span style={{ fontSize: 14, color: T.muted, fontWeight: 600 }}>
              {actions.length} waiting
            </span>
          )}
          {/* Manual reconcile — no polling, but a staged action created while the
              user sits here can be pulled in on demand. */}
          {loaded && !error && (
            <button
              type="button"
              disabled={refreshing}
              onClick={() => void reconcile()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                border: "none",
                background: "transparent",
                cursor: refreshing ? "default" : "pointer",
                fontFamily: T.font,
                fontSize: 14,
                fontWeight: 700,
                color: T.blue,
                padding: 0,
                opacity: refreshing ? 0.5 : 1,
              }}
            >
              {refreshing ? <Spinner c={T.blue} size={13} /> : null}
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
          )}
        </div>
      </div>

      {loading && !loaded ? (
        <ListLoading rows={2} />
      ) : error ? (
        <div
          style={{
            background: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: "16px 15px",
          }}
        >
          <div style={{ fontSize: 15.5, fontWeight: 600, color: T.ink, marginBottom: 4 }}>
            Couldn't load approvals
          </div>
          <div style={{ fontSize: 14, color: T.muted, lineHeight: 1.55, marginBottom: 12 }}>
            {error}
          </div>
          <button
            type="button"
            onClick={() => void refresh()}
            style={{
              background: T.blue,
              color: "#fff",
              border: "none",
              borderRadius: T.rPill,
              padding: "9px 16px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: T.font,
            }}
          >
            Try again
          </button>
        </div>
      ) : actions.length === 0 ? (
        <NoteCard
          title="Nothing waiting on you"
          text="When Yulia needs your sign-off on an irreversible step, it shows up here. There's nothing awaiting approval right now."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {actions.map((a) => (
            <ApprovalCard
              key={a.id}
              action={a}
              pending={busy?.id === a.id ? busy.kind : null}
              onApprove={() => void approve(a)}
              onDecline={() => void decline(a)}
            />
          ))}
        </div>
      )}

      {/* (c) recent agent-ish next-moves (deterministic, real) */}
      <SectionHeading style={{ margin: "22px 0 10px" }}>What needs your attention</SectionHeading>
      {next.loading && !next.loaded ? (
        <ListLoading rows={1} />
      ) : next.actions.length === 0 ? (
        approvalsEmpty ? (
          <div style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.55, padding: "2px 2px" }}>
            No open items right now — next moves appear here as your deals progress.
          </div>
        ) : (
          <NoteCard text="No open items right now. As your deals progress, the next moves Yulia surfaces will appear here." />
        )
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {next.actions.map((act) => (
            <button
              key={act.id}
              type="button"
              onClick={() => onNextAction(act)}
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
              <span style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    fontSize: 15.5,
                    fontWeight: 600,
                    color: T.ink,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: 1.3,
                  }}
                >
                  {act.title}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: T.muted,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: 1.45,
                    marginTop: 2,
                  }}
                >
                  {act.description || act.cta}
                </span>
                {act.dealName && (
                  <span style={{ display: "inline-block", marginTop: 7 }}>
                    <Pill bg={T.track} fg={T.muted}>
                      {act.dealName}
                    </Pill>
                  </span>
                )}
              </span>
              <ChevronRightIcon size={18} c={T.muted2} />
            </button>
          ))}
        </div>
      )}

      {/* (d) "Describe what an agent should do" → chat.send (shared ChatDock) */}
      <SectionHeading style={{ margin: "22px 0 10px" }}>
        Describe what an agent should do
      </SectionHeading>
      <ChatDock
        variant="dock"
        isMobile
        hideStarter
        placeholder="e.g. Each week, score newly listed industrial-services businesses against my buy-box."
        disabled={!agentSetupReady || (chat?.sending ?? false)}
        onSend={submitDraft}
        onFileUpload={chat?.uploadFile}
      />
      <div style={{ fontSize: 14, color: T.muted, marginTop: 8, lineHeight: 1.5 }}>
        {agentSetupReady
          ? "Yulia will help you configure it, then stage anything irreversible here for your approval."
          : "Sign in to set up an agent with Yulia."}
      </div>
    </div>
  );
}
