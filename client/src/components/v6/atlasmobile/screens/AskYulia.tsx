/**
 * Ask Yulia (frame 02) — the full-screen Yulia chat surface.
 *
 * Same data layer as the desktop sibling `desktop/chat/AtlasChatRail.tsx`: it
 * consumes the one `MobileChatBridge` (via `useAtlasChat()`) the desktop rail,
 * the YuliaSheet, and V6Mobile all share. ZERO new chat logic — the four
 * renderers (Message / Streaming / StagedActionCard / PaywallCard) are the
 * exact pattern AtlasChatRail + YuliaSheet use, re-laid full-screen for mobile
 * on a solid white field per the design map (frame 02). The composer is the
 * shared ChatDock (variant="dock", isMobile). Staged actions route through THE
 * LINE confirm/cancel — nothing auto-runs.
 *
 * Layout note: the shell owns one scroll area (`.scr`) with bottom padding for
 * the glass nav. This screen has no nav/FAB (it is reached as a full-screen
 * surface), so it fills the scroll area as a flex column: the thread scrolls,
 * the composer pins to the bottom. A negative bottom margin neutralizes the
 * shell's nav clearance (there is no nav here) so the composer sits flush.
 */
import { memo, useEffect, useMemo, useRef, type CSSProperties } from "react";
import ChatDock from "../../../shared/ChatDock";
import type { SurfaceContext } from "../../../../lib/yuliaSurfaceContext";
import type {
  MobileMessage,
  MobilePaywallData,
  StagedAction,
  ToolTraceEntry,
} from "../../mobile/types";
import { useAtlasChat, type AtlasScreenProps, type AtlasView, type AtlasScreen } from "../../desktop/atlasNav";
import { Sparkle } from "../../desktop/primitives";
import { MonitorIcon } from "../../desktop/icons";
import { T } from "../../desktop/atlasTokens";

/* ─── per-screen context label (what screen Yulia "sees") ───── */

const CTX_LABEL: Record<AtlasScreen, string> = {
  today: "Today",
  pipeline: "Pipeline",
  sourcing: "Sourcing",
  deals: "Portfolio",
  studio: "Studio",
  integration: "Integration",
  files: "Data room",
  agent: "Agent",
  cockpit: "Deal",
  canvas: "Canvas",
  settings: "Settings",
};

function ctxLabelFor(view: AtlasView): string {
  if ((view.screen === "cockpit" || view.screen === "canvas") && view.dealName) {
    return view.dealName;
  }
  return CTX_LABEL[view.screen] ?? "Atlas";
}

/** Compact mobile surface context — mirrors AtlasChatRail's builder but tags
 *  the device as mobile. Tells Yulia what Atlas screen the user is on. */
function buildAtlasMobileSurfaceContext(view: AtlasView): SurfaceContext {
  const ctx: SurfaceContext = {
    device: "mobile",
    activeMode: view.screen,
    activeView: view.screen,
    activeTitle: ctxLabelFor(view),
  };
  if (view.dealId != null) ctx.dealId = view.dealId;
  if (view.dealName) ctx.dealTitle = view.dealName;
  return ctx;
}

/* ─── starter prompts (honest empty thread) ─────────────────── */
/* Not demo data — these prefill the composer text via chat.send(). They carry
 * no fabricated numbers/deal names; they are generic openers. */
const STARTERS = [
  "What needs my attention today?",
  "Summarize my pipeline",
  "Help me screen new targets",
];

/* ─── the screen ───────────────────────────────────────────── */

export default function AskYuliaScreen({ view }: AtlasScreenProps) {
  const chat = useAtlasChat();

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const nearBottomRef = useRef(true);

  const surfaceContext = useMemo(
    () => buildAtlasMobileSurfaceContext(view),
    [view.screen, view.dealId, view.dealName],
  );

  const thread = chat?.thread ?? [];
  const streamingText = chat?.streamingText ?? "";
  const activeTool = chat?.activeTool ?? null;
  const toolTrace = chat?.toolTrace ?? [];
  const paywallData = chat?.paywallData ?? null;
  const sending = chat?.sending ?? false;
  const error = chat?.error ?? null;

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  };

  // Pin to the bottom while the user is reading the tail (never yank them up).
  useEffect(() => {
    if (!nearBottomRef.current) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thread.length, streamingText, activeTool, toolTrace, paywallData]);

  const messageRows = useMemo(
    () =>
      thread.map((m, i) => (
        <MessageRow
          key={i}
          message={m}
          onConfirmStagedAction={chat?.confirmStagedAction}
          onCancelStagedAction={chat?.cancelStagedAction}
        />
      )),
    [thread, chat?.confirmStagedAction, chat?.cancelStagedAction],
  );

  const handleSend = (text: string) => {
    nearBottomRef.current = true;
    chat?.send(text, surfaceContext);
  };

  const showEmpty = thread.length === 0 && !sending && !paywallData && !error;

  return (
    <div style={S.screen}>
      {/* In-body screen-aware context chip. The shell's variant-B bar already
          shows "Yulia" above; this chip signals what screen Yulia is reading. */}
      <div style={S.ctxBar}>
        <span style={S.ctxPill} title={ctxLabelFor(view)}>
          <MonitorIcon size={13} c={T.blue} />
          <span style={S.ctxLabel}>Yulia sees {ctxLabelFor(view)}</span>
        </span>
      </div>

      {/* Thread */}
      <div ref={scrollRef} onScroll={onScroll} className="scr" style={S.list}>
        {showEmpty ? (
          <EmptyThread onPick={handleSend} disabled={sending} />
        ) : (
          <>
            {messageRows}
            {sending && <Streaming text={streamingText} tool={activeTool} trace={toolTrace} />}
            {paywallData && <PaywallCard data={paywallData} />}
            {error && <div style={S.errorBubble}>{error}</div>}
          </>
        )}
      </div>

      {/* Composer — shared ChatDock. ChatDock's dock-outer draws its own top
          border + padding, so the wrapper adds none (avoids a double hairline). */}
      <div style={S.composerWrap}>
        <ChatDock
          variant="dock"
          isMobile
          hideStarter
          onSend={handleSend}
          onFileUpload={chat?.uploadFile}
          disabled={sending}
          placeholder="Message Yulia…"
        />
        <div style={S.disclaimer}>Yulia sees your current screen · check important info</div>
      </div>
    </div>
  );
}

/* ─── empty thread (honest) ─────────────────────────────────── */

function EmptyThread({ onPick, disabled }: { onPick: (text: string) => void; disabled: boolean }) {
  return (
    <div style={S.emptyWrap}>
      {/* soft glow centered behind the hero — mirrors the Today composer glow.
          Sibling (not z-index:-1) so it layers correctly over the white screen
          bg: glow zIndex 0, content zIndex 1. Absolute-in-relative, no animation
          (Safari toolbar rule). */}
      <div aria-hidden="true" style={S.emptyGlow} />
      <div style={S.emptyInner}>
        <Sparkle size={26} />
        <div style={S.emptyTitle}>Ask Yulia anything</div>
        <div style={S.emptySub}>
          Yulia reads the screen you came from and your deal context.
        </div>
        <div style={S.starterRow}>
          {STARTERS.map((s) => (
            <button
              key={s}
              type="button"
              disabled={disabled}
              style={{ ...S.starterChip, opacity: disabled ? 0.5 : 1 }}
              onClick={() => onPick(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Message bubble (ported from AtlasChatRail / YuliaSheet) ── */

const MessageRow = memo(Message);

function Message({
  message,
  onConfirmStagedAction,
  onCancelStagedAction,
}: {
  message: MobileMessage;
  onConfirmStagedAction?: (id: number, summary?: string) => void | Promise<void>;
  onCancelStagedAction?: (id: number) => void | Promise<void>;
}) {
  const isUser = message.who === "u";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {isUser ? (
        <div style={S.userBubble}>{message.text}</div>
      ) : (
        <div style={S.yuliaRow}>
          <Sparkle size={18} />
          <div style={S.yuliaText}>{message.text}</div>
        </div>
      )}
      {message.stagedAction && (
        <StagedActionCard
          action={message.stagedAction}
          onConfirm={onConfirmStagedAction}
          onCancel={onCancelStagedAction}
        />
      )}
    </div>
  );
}

/* ─── Staged-action approval card (THE LINE) ────────────────── */

function StagedActionCard({
  action,
  onConfirm,
  onCancel,
}: {
  action: StagedAction;
  onConfirm?: (id: number, summary?: string) => void | Promise<void>;
  onCancel?: (id: number) => void | Promise<void>;
}) {
  const canAct = !!action.id && !!onConfirm && !!onCancel;
  return (
    <div style={S.stagedCard}>
      <div style={S.stagedHeader}>⏸ Needs your approval</div>
      <div style={S.stagedTitle}>{action.label}</div>
      <div style={S.stagedSummary}>{action.summary}</div>
      <div style={S.stagedBtnRow}>
        <button
          type="button"
          disabled={!canAct}
          style={{ ...S.stagedConfirm, opacity: canAct ? 1 : 0.45 }}
          onClick={() => {
            if (action.id) void onConfirm?.(action.id, action.summary);
          }}
        >
          Confirm
        </button>
        <button
          type="button"
          disabled={!canAct}
          style={{ ...S.stagedCancel, opacity: canAct ? 1 : 0.45 }}
          onClick={() => {
            if (action.id) void onCancel?.(action.id);
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ─── Streaming bubble + computation trace ──────────────────── */

const TRACE_VISIBLE_MAX = 6;

function Streaming({ text, tool, trace }: { text: string; tool: string | null; trace: ToolTraceEntry[] }) {
  const hasTrace = trace.length > 0;
  const visible = trace.slice(-TRACE_VISIBLE_MAX);
  const hiddenCount = trace.length - visible.length;
  return (
    <div style={S.yuliaRow}>
      <Sparkle size={18} />
      <div style={{ minWidth: 0, flex: 1 }}>
        {hasTrace ? (
          <div style={{ ...S.trace, marginBottom: text ? 8 : 0 }}>
            {hiddenCount > 0 && (
              <div style={S.traceCollapsed}>
                {hiddenCount} earlier step{hiddenCount === 1 ? "" : "s"} ✓
              </div>
            )}
            {visible.map((t) => (
              <div key={t.id} style={S.traceLine}>
                <span style={S.traceDim}>→</span>
                <span style={S.traceName}>{t.label}</span>
                {t.status === "done" ? (
                  <>
                    <span style={S.traceMs}>{((t.ms ?? 0) / 1000).toFixed(1)}s</span>
                    <span style={S.traceOk}>✓</span>
                  </>
                ) : (
                  <span style={S.traceDim}>running…</span>
                )}
              </div>
            ))}
          </div>
        ) : tool ? (
          <div style={S.toolPill}>
            <span>{tool}…</span>
          </div>
        ) : null}
        {text ? (
          <div style={S.yuliaText}>
            {text}
            <span style={{ opacity: 0.5 }}>▍</span>
          </div>
        ) : (
          !hasTrace && !tool && <div style={S.thinking}>Yulia is thinking…</div>
        )}
      </div>
    </div>
  );
}

/* ─── Paywall card ──────────────────────────────────────────── */

function PaywallCard({ data }: { data: MobilePaywallData }) {
  const planName =
    typeof data.requiredPlan === "string" && data.requiredPlan
      ? data.requiredPlan.charAt(0).toUpperCase() + data.requiredPlan.slice(1)
      : null;
  const message =
    (typeof data.message === "string" && data.message) ||
    (typeof data.callToAction === "string" && data.callToAction) ||
    (planName ? `This is included in the ${planName} plan.` : "This is included in a paid plan.");
  const checkoutUrl = typeof data.checkoutUrl === "string" && data.checkoutUrl ? data.checkoutUrl : null;
  return (
    <div style={S.paywallCard}>
      <div style={S.paywallTitle}>{planName ? `Upgrade to ${planName}` : "Upgrade to continue"}</div>
      <div style={S.paywallBody}>{message}</div>
      {typeof data.priceDisplay === "string" && data.priceDisplay && (
        <div style={S.paywallPrice}>{data.priceDisplay}</div>
      )}
      <button type="button" style={S.paywallBtn} onClick={() => window.location.assign(checkoutUrl ?? "/pricing")}>
        {checkoutUrl ? "Upgrade" : "See pricing"}
      </button>
    </div>
  );
}

/* ─── styles ───────────────────────────────────────────────── */

const S: Record<string, CSSProperties> = {
  // Fill the shell's scroll area as a flex column. The negative bottom margin
  // cancels the shell's glass-nav clearance (there is no nav on this screen), so
  // the composer sits flush at the true viewport bottom.
  screen: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    background: "#fff",
    marginBottom: "calc(-1 * (62px + env(safe-area-inset-bottom, 0px) + 28px))",
  },
  ctxBar: {
    flex: "none",
    display: "flex",
    justifyContent: "flex-end",
    padding: "8px 18px 2px",
  },
  ctxPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: T.track,
    borderRadius: T.rPill,
    padding: "5px 11px",
    fontSize: 11.5,
    color: T.muted,
    maxWidth: "100%",
  },
  ctxLabel: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  list: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "14px 18px 10px",
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  /* empty thread */
  emptyWrap: {
    position: "relative",
    margin: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "24px 8px",
    maxWidth: 300,
  },
  /* soft glow behind the empty hero (matches Today's composer glow) */
  emptyGlow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 390,
    height: 300,
    background:
      "radial-gradient(ellipse at center, rgba(66,133,244,.30), rgba(155,114,203,.18) 46%, transparent 72%)",
    filter: "blur(16px)",
    pointerEvents: "none",
    zIndex: 0,
  },
  emptyInner: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: { fontSize: 17, fontWeight: 600, color: T.ink, marginTop: 2 },
  emptySub: { fontSize: 13, lineHeight: 1.5, color: T.muted, marginBottom: 6 },
  starterRow: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  starterChip: {
    border: `1px solid ${T.border}`,
    background: T.white,
    borderRadius: T.rPill,
    padding: "8px 14px",
    fontSize: 13,
    fontWeight: 500,
    color: T.ink3,
    cursor: "pointer",
    fontFamily: T.font,
    WebkitTapHighlightColor: "transparent",
  },
  /* bubbles */
  userBubble: {
    alignSelf: "flex-end",
    maxWidth: "85%",
    background: T.blue,
    color: "#fff",
    borderRadius: "18px 18px 5px 18px",
    padding: "11px 14px",
    fontSize: 14,
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
  },
  yuliaRow: { display: "flex", gap: 9, alignItems: "flex-start" },
  yuliaText: { fontSize: 14, lineHeight: 1.6, color: T.ink, whiteSpace: "pre-wrap", minWidth: 0 },
  errorBubble: {
    padding: "10px 14px",
    background: T.terraBg,
    color: T.terra,
    borderRadius: 12,
    fontSize: 13,
    lineHeight: 1.45,
  },
  composerWrap: { flex: "none", paddingBottom: "env(safe-area-inset-bottom, 0px)" },
  disclaimer: {
    textAlign: "center",
    fontSize: 10.5,
    color: T.faint,
    lineHeight: 1.4,
    padding: "0 14px 10px",
  },
  /* staged action */
  stagedCard: {
    background: T.blueBg3,
    border: `1px solid ${T.approvalBd}`,
    borderRadius: 14,
    padding: 14,
  },
  stagedHeader: { fontSize: 13, fontWeight: 600, color: T.blue, marginBottom: 7 },
  stagedTitle: { fontSize: 13.5, fontWeight: 600, color: T.ink, marginBottom: 4 },
  stagedSummary: { fontSize: 13, lineHeight: 1.45, color: T.ink3, marginBottom: 12 },
  stagedBtnRow: { display: "flex", gap: 9 },
  stagedConfirm: {
    background: T.blue,
    color: "#fff",
    border: "none",
    borderRadius: T.rPill,
    padding: "9px 16px",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: T.font,
  },
  stagedCancel: {
    background: T.white,
    color: T.ink,
    border: `1px solid ${T.inputBd}`,
    borderRadius: T.rPill,
    padding: "9px 15px",
    fontSize: 12.5,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: T.font,
  },
  /* streaming / trace */
  toolPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "3px 10px",
    background: T.track,
    borderRadius: T.rPill,
    fontSize: 11,
    color: T.muted,
    fontWeight: 500,
    marginBottom: 8,
  },
  thinking: { fontSize: 13.5, color: T.muted },
  trace: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 0,
    fontFamily: "ui-monospace, monospace",
    fontSize: 11.5,
    lineHeight: 1.5,
    color: T.muted,
  },
  traceLine: { display: "flex", alignItems: "baseline", gap: 6, minWidth: 0 },
  traceName: { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  traceMs: { color: T.faint, fontVariantNumeric: "tabular-nums", flex: "none", marginLeft: "auto" },
  traceOk: { color: T.green, fontWeight: 700, flex: "none" },
  traceDim: { color: T.faint, flex: "none" },
  traceCollapsed: { color: T.faint, fontSize: 10.5 },
  /* paywall */
  paywallCard: {
    background: T.white,
    border: `1px solid ${T.border}`,
    borderRadius: 16,
    padding: 16,
    boxShadow: T.shCard,
  },
  paywallTitle: { fontSize: 15, fontWeight: 700, color: T.ink },
  paywallBody: { marginTop: 6, fontSize: 13, lineHeight: 1.5, color: T.ink3 },
  paywallPrice: { marginTop: 8, fontSize: 15, fontWeight: 700, color: T.ink },
  paywallBtn: {
    marginTop: 12,
    width: "100%",
    minHeight: 44,
    border: "none",
    borderRadius: 14,
    background: T.blue,
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: T.font,
  },
};
