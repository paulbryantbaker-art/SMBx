/**
 * Atlas — AGENT screen (isApp, 198px "MY AGENTS" sub-list + detail).
 *
 * HONEST BY DESIGN — this is a confirmed BACKEND GAP (atlas_maps/05 §10):
 *   there is NO persisted/schedulable agent object, no on/off, and no run-history
 *   table. The only real, durable substrate is:
 *     • the in-chat agentic loop (you configure an "agent" by describing it to Yulia)
 *     • the per-ACTION human-approval queue `agency_staged_actions`, surfaced by
 *       GET /api/agency/actions + POST /api/agency/actions/:id/{confirm,cancel}.
 *
 * So this screen does NOT fabricate "New listing scanner / 7:00 AM / run history".
 * Instead:
 *   • Sub-list "MY AGENTS" → honest EmptyState (no saved agents persist yet).
 *   • Main panel:
 *       (a) a short honest explainer that scheduled agents are set up by describing
 *           them to Yulia, who stages irreversible steps for your approval;
 *       (b) the REAL pending-approval queue from GET /api/agency/actions, each staged
 *           action rendered as a "Needs your approval" card with Approve/Decline wired
 *           to useAtlasChat()?.confirmStagedAction(id) / cancelStagedAction(id) (THE LINE);
 *       (c) recent agent-ish activity from useNextActions (deterministic, real);
 *       (d) a "Describe what this agent should do" composer → chat.send.
 *
 * Every value is a real field or an honest "—" / empty / loading / error state.
 * The only new fetch is to an existing endpoint (/api/agency/actions) that has no
 * client hook — implemented as a small in-file hook, never a parallel data path.
 */
import { useCallback, useEffect, useState } from "react";
import type { AtlasScreenProps } from "../atlasNav";
import { useAtlasNav, useAtlasChat } from "../atlasNav";
import { authHeaders } from "../../../../hooks/useAuth";
import { useNextActions } from "../../../../hooks/useNextActions";
import { T } from "../atlasTokens";
import {
  Sparkle,
  Pill,
  Card,
  SectionLabel,
  EmptyState,
  LoadingState,
} from "../primitives";
import { PlusIcon, CheckIcon, CloseIcon, ChevronRightIcon } from "../icons";

/* ────────────────────────────────────────────────────────────────────────────
 * In-file hook over the existing /api/agency/actions endpoint (no client hook
 * exists). This is the sanctioned "existing endpoint, no hook" case — NOT a
 * parallel data path. Shape mirrors server AgencyStagedAction exactly.
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

  // Resolves with the fresh actions list (or rejects) so callers that mutate the
  // server (approve/decline) can RECONCILE — a server-blocked action that the
  // confirm path swallowed will reappear instead of silently staying removed.
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

/* ── small helpers ── */
function riskTone(risk: string | null): { bg: string; fg: string; border?: string } {
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

/* ── robot glyph (violet) — the agent mark, matches design icon tile ── */
function RobotGlyph({ size = 19, c = T.violet }: { size?: number; c?: string }) {
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

/* ── inline button spinner (matches LoadingState's ring) ── */
function Spinner({ c }: { c: string }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 13,
        height: 13,
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

/* ── one staged action = one "Needs your approval" card ── */
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
    <Card pad="15px 17px" style={{ borderColor: T.approvalBd }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
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
              fontSize: 11,
              fontWeight: 700,
              color: T.muted2,
              letterSpacing: ".04em",
              marginBottom: 4,
            }}
          >
            NEEDS YOUR APPROVAL
          </div>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: T.ink, lineHeight: 1.4 }}>
            {label}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 9 }}>
            <Pill
              bg={T.track}
              fg={T.muted}
              style={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", display: "inline-block" }}
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
                style={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", display: "inline-block" }}
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
            <div style={{ fontSize: 11.5, color: T.faint, marginTop: 8 }}>
              Staged {relTime(action.created_at)}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 9, marginTop: 14 }}>
        <button
          type="button"
          disabled={busy}
          onClick={onApprove}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            border: "none",
            background: T.blue,
            color: T.white,
            borderRadius: T.rPill,
            padding: "7px 16px",
            fontFamily: T.font,
            fontSize: 13,
            fontWeight: 600,
            cursor: busy ? "default" : "pointer",
            opacity: busy ? 0.6 : 1,
          }}
        >
          {pending === "approve" ? <Spinner c={T.white} /> : <CheckIcon size={13} c={T.white} />}
          {pending === "approve" ? "Approving…" : "Approve"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onDecline}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            border: `1px solid ${T.border}`,
            background: T.white,
            color: T.ink3,
            borderRadius: T.rPill,
            padding: "7px 16px",
            fontFamily: T.font,
            fontSize: 13,
            fontWeight: 600,
            cursor: busy ? "default" : "pointer",
            opacity: busy ? 0.6 : 1,
          }}
        >
          {pending === "decline" ? <Spinner c={T.ink3} /> : <CloseIcon size={13} c={T.ink3} />}
          {pending === "decline" ? "Declining…" : "Decline"}
        </button>
      </div>
    </Card>
  );
}

export default function AgentScreen({ user }: AtlasScreenProps) {
  const nav = useAtlasNav();
  const chat = useAtlasChat();
  const canFetch = !!user;
  // Setting up an agent means starting a real, persisted Yulia conversation —
  // that needs BOTH a live chat bridge AND a signed-in user. An anonymous
  // visitor has a chat bridge (the sample one) but no account, so the "New" /
  // "Set up with Yulia" affordances must read as not-yet-available, not live.
  const agentSetupReady = !!chat && canFetch;

  const { actions, loading, loaded, refreshing, error, refresh, reconcile, remove } =
    useStagedActions(canFetch);
  const next = useNextActions(user, canFetch);

  // Which action is mid-flight, and whether it's an approve or a decline — drives
  // the per-card spinner/label.
  const [busy, setBusy] = useState<{ id: number; kind: "approve" | "decline" } | null>(null);

  const [draft, setDraft] = useState("");

  const sendToYulia = useCallback(
    (text: string) => {
      const t = text.trim();
      // Gate on agentSetupReady (chat bridge AND signed-in) so the no-op matches
      // the dimmed affordances — an anon visitor's click does nothing, the same
      // way the button reads as not-yet-available.
      if (!t || !agentSetupReady || !chat) return;
      chat.send(t);
    },
    [agentSetupReady, chat],
  );

  const submitDraft = useCallback(() => {
    const t = draft.trim();
    if (!t) return;
    sendToYulia(
      `I want to set up an agent that does the following: ${t}. Walk me through how to configure it and what you'll need from me.`,
    );
    setDraft("");
  }, [draft, sendToYulia]);

  // IMPORTANT: confirmStagedAction / cancelStagedAction swallow every error
  // internally (toast + chat-rail message, never re-thrown — useAuthChat.ts).
  // They also resolve on HTTP 200 with status 'blocked' / 'failed'. So an
  // optimistic remove() alone could make a BLOCKED irreversible action vanish
  // from this queue as if it were approved. After the mutation we reconcile()
  // against /api/agency/actions — anything the server did NOT actually clear
  // reappears in the queue, keeping this surface honest and in sync with the
  // chat-rail StagedActionCard.
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

  /* ── MY AGENTS sub-list — honestly empty (no agent persists) ── */
  const subList = (
    <div
      style={{
        width: 198,
        flex: "none",
        borderRight: `1px solid ${T.hair}`,
        padding: "16px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        overflow: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 11px 8px",
        }}
      >
        <span style={{ fontSize: 11.5, fontWeight: 700, color: T.muted2, letterSpacing: ".05em" }}>
          MY AGENTS
        </span>
        <button
          type="button"
          disabled={!agentSetupReady}
          onClick={() =>
            sendToYulia("I'd like to set up an agent. What can you automate for me?")
          }
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            border: "none",
            background: "transparent",
            cursor: agentSetupReady ? "pointer" : "default",
            fontFamily: T.font,
            fontSize: 12,
            fontWeight: 600,
            color: T.blue,
            padding: 0,
            opacity: agentSetupReady ? 1 : 0.5,
          }}
        >
          <PlusIcon size={13} c={T.blue} /> New
        </button>
      </div>

      <div
        style={{
          margin: "8px 4px 0",
          padding: "16px 13px",
          borderRadius: 12,
          background: T.surface,
          border: `1px dashed ${T.border}`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            margin: "0 auto 10px",
            borderRadius: 9,
            background: T.violetBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RobotGlyph size={18} />
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: T.ink3, lineHeight: 1.45 }}>
          No saved agents yet
        </div>
        <div style={{ fontSize: 11.5, color: T.faint, lineHeight: 1.5, marginTop: 5 }}>
          Set one up by describing it to Yulia.
        </div>
      </div>
    </div>
  );

  /* ── detail (main panel) ── */
  const detail = (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
        padding: "22px 24px",
        gap: 16,
      }}
    >
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div
          style={{
            width: 38,
            height: 38,
            flex: "none",
            borderRadius: 11,
            background: T.violetBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RobotGlyph size={21} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 600, color: T.ink }}>Agents</div>
      </div>

      {/* (a) honest explainer */}
      <Card pad="16px 18px" style={{ background: T.blueBg3, borderColor: T.approvalBd }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ paddingTop: 1 }}>
            <Sparkle size={17} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, marginBottom: 5 }}>
              Set up agents by describing them to Yulia
            </div>
            <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.6 }}>
              Tell Yulia what you want watched, scored, or drafted on a recurring basis —
              for example scanning for new listings against your buy-box, or refreshing a
              valuation when financials change. Yulia does the work and stages anything
              irreversible here for your approval before it runs. You stay in control;
              nothing that writes or commits happens without your explicit go-ahead.
            </div>
          </div>
        </div>
      </Card>

      {/* (b) the REAL pending-approval queue */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <SectionLabel>Pending approvals</SectionLabel>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {loaded && actions.length > 0 && (
              <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>
                {actions.length} waiting
              </span>
            )}
            {/* Manual reconcile — no polling, but a staged action created while
                the user sits here can be pulled in on demand. */}
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
                  fontSize: 12,
                  fontWeight: 600,
                  color: T.blue,
                  padding: 0,
                  opacity: refreshing ? 0.5 : 1,
                }}
              >
                {refreshing ? <Spinner c={T.blue} /> : null}
                {refreshing ? "Refreshing…" : "Refresh"}
              </button>
            )}
          </div>
        </div>

        {loading && !loaded ? (
          <LoadingState label="Loading approvals…" />
        ) : error ? (
          <EmptyState
            title="Couldn't load approvals"
            hint={error}
            cta="Try again"
            onCta={() => void refresh()}
          />
        ) : actions.length === 0 ? (
          <Card pad="22px 20px">
            <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink3 }}>
              Nothing waiting on you
            </div>
            <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.55, marginTop: 5 }}>
              When Yulia needs your sign-off on an irreversible step, it shows up here. There
              are no actions awaiting approval right now.
            </div>
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
      </div>

      {/* (c) recent agent-ish activity (deterministic, real) */}
      <div>
        <div style={{ marginBottom: 10 }}>
          <SectionLabel>What needs your attention</SectionLabel>
        </div>
        {next.loading && !next.loaded ? (
          <LoadingState label="Loading…" />
        ) : next.actions.length === 0 ? (
          // When the approvals queue above is ALSO empty (brand-new user), this
          // would stack a second near-identical empty card — so de-emphasize it
          // to a single quiet line. When there's an approvals card above, keep
          // the fuller empty card so the section doesn't read as broken.
          loaded && !error && actions.length === 0 ? (
            <div style={{ fontSize: 13, color: T.faint, lineHeight: 1.55, padding: "2px 2px" }}>
              No open items right now — next moves appear here as your deals progress.
            </div>
          ) : (
            <Card pad="18px 20px">
              <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.55 }}>
                No open items right now. As your deals progress, the next moves Yulia surfaces
                will appear here.
              </div>
            </Card>
          )
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {next.actions.map((act) => (
              <Card
                key={act.id}
                pad="13px 16px"
                hover
                onClick={() => {
                  if (act.prefill && chat) chat.send(act.prefill);
                  else if (act.dealId) nav.openDeal(act.dealId, act.dealName);
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>
                      {act.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12.5,
                        color: T.muted,
                        lineHeight: 1.5,
                        marginTop: 3,
                      }}
                    >
                      {act.description}
                    </div>
                    {act.dealName && (
                      <div style={{ marginTop: 7 }}>
                        <Pill bg={T.track} fg={T.muted}>
                          {act.dealName}
                        </Pill>
                      </div>
                    )}
                  </div>
                  <ChevronRightIcon size={16} c={T.faint} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* (d) "Describe what this agent should do" composer → chat.send */}
      <div>
        <div style={{ marginBottom: 10 }}>
          <SectionLabel>Describe what this agent should do</SectionLabel>
        </div>
        <div
          style={{
            border: `1px solid ${T.inputBd}`,
            borderRadius: 14,
            background: T.white,
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                submitDraft();
              }
            }}
            placeholder="e.g. Every week, score newly listed industrial-services businesses against my buy-box and surface the top matches."
            rows={3}
            style={{
              border: "none",
              outline: "none",
              resize: "vertical",
              minHeight: 56,
              fontFamily: T.font,
              fontSize: 13.5,
              lineHeight: 1.55,
              color: T.ink,
              background: "transparent",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11.5, color: T.faint }}>
              {agentSetupReady ? "Yulia will help you configure it." : "Sign in to talk to Yulia."}
            </span>
            <button
              type="button"
              disabled={!agentSetupReady || !draft.trim()}
              onClick={submitDraft}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                border: "none",
                background: T.blue,
                color: T.white,
                borderRadius: T.rPill,
                padding: "8px 18px",
                fontFamily: T.font,
                fontSize: 13,
                fontWeight: 600,
                cursor: !agentSetupReady || !draft.trim() ? "default" : "pointer",
                opacity: !agentSetupReady || !draft.trim() ? 0.5 : 1,
              }}
            >
              <Sparkle size={14} /> Set up with Yulia
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", overflow: "hidden" }}>
      {subList}
      {detail}
    </div>
  );
}
