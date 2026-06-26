/**
 * YuliaSheet — the Yulia quick-chat bottom-sheet. Opened from the YuliaFab.
 * Grab-handle + a compact Yulia thread + the shared ChatDock composer. Opens at a
 * MEDIUM detent (not full-screen) and is draggable: swipe the handle/header up to
 * expand, down to collapse, further down to dismiss (and when empty, drag anywhere).
 * Also dismissible via the scrim or the close button. While open, the page behind
 * is scroll-locked so the chat is its own scroll context.
 *
 * ZERO new chat logic: it consumes the same `MobileChatBridge` (via
 * `useAtlasChat()`) the desktop rail + V6Mobile use, and ports the four
 * ChatSheet renderers (Message / Streaming / StagedActionCard / PaywallCard)
 * restyled to T tokens — the exact pattern AtlasChatRail uses. Staged actions
 * route through THE LINE confirm/cancel; nothing auto-runs.
 *
 * The sheet is a small inset panel anchored to the app root (NOT a full-viewport
 * fixed bg div): it uses position:absolute inside the relative app root, with a
 * translucent glass fill — Safari does not read it as the page background.
 */
import { memo, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import ChatDock from "../../shared/ChatDock";
import { CloseIcon, MonitorIcon } from "../desktop/icons";
import { Sparkle } from "../desktop/primitives";
import { T } from "../desktop/atlasTokens";
import { useAtlasChat, useAtlasNav } from "../desktop/atlasNav";
import { RT } from "./redesign/rt";
import type {
  MobileMessage,
  MobilePaywallData,
  StagedAction,
  ToolTraceEntry,
} from "../mobile/types";
import type { SurfaceContext } from "../../../lib/yuliaSurfaceContext";

/* Sheet snap heights (vh). Opens at a comfortable MEDIUM detent (the dimmed
 * screen stays visible above, Cash-App style); drag the handle/top up to expand,
 * down to collapse, further down to dismiss. */
const DEFAULT_VH = 66; // resting (medium) — NOT full-screen
const EXPANDED_VH = 94; // dragged up
const CLOSE_VH = 44; // below this on release → dismiss
const SNAP_EXPAND = 82; // ≥ this on release → snap to expanded, else medium

export function YuliaSheet({
  open,
  onClose,
  surfaceContext,
}: {
  open: boolean;
  onClose: () => void;
  /** What screen the user is on — handed to Yulia as screen-aware context. */
  surfaceContext?: SurfaceContext;
}) {
  const chat = useAtlasChat();
  const nav = useAtlasNav();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const nearBottomRef = useRef(true);

  // ── Draggable sheet: snap between a default height and 95%; a hard drag-down
  // dismisses. Height is in vh; while dragging we drop the transition for 1:1
  // tracking, then animate to the nearest snap on release. ──────────────────
  const [heightVh, setHeightVh] = useState(DEFAULT_VH);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ startY: number; startH: number } | null>(null);

  // Each open starts at the default height.
  useEffect(() => {
    if (open) setHeightVh(DEFAULT_VH);
  }, [open]);

  // Lock the page behind the sheet so the chat is its own scroll context and the
  // background can't move with it. This app BODY-scrolls (the document scrolls,
  // not an inner div). Belt-and-suspenders so it holds on iOS: (1) freeze the body
  // in place via position:fixed + top:-scrollY (the technique that survives iOS),
  // AND (2) overflow:hidden + overscroll:none on BOTH <html> and <body> so any
  // residual scroll/chaining is killed. Restore everything (and the scroll) on close.
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    const body = document.body;
    const docEl = document.documentElement;
    const prevBody = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      overscrollBehavior: body.style.overscrollBehavior,
    };
    const prevHtml = {
      overflow: docEl.style.overflow,
      overscrollBehavior: docEl.style.overscrollBehavior,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    docEl.style.overflow = "hidden";
    docEl.style.overscrollBehavior = "none";
    return () => {
      body.style.position = prevBody.position;
      body.style.top = prevBody.top;
      body.style.left = prevBody.left;
      body.style.right = prevBody.right;
      body.style.width = prevBody.width;
      body.style.overflow = prevBody.overflow;
      body.style.overscrollBehavior = prevBody.overscrollBehavior;
      docEl.style.overflow = prevHtml.overflow;
      docEl.style.overscrollBehavior = prevHtml.overscrollBehavior;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  const onDragStart = (e: ReactPointerEvent) => {
    // Don't start a drag from an interactive control (close button, a chip).
    if ((e.target as HTMLElement).closest("button")) return;
    dragRef.current = { startY: e.clientY, startH: heightVh };
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onDragMove = (e: ReactPointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dyVh = ((d.startY - e.clientY) / window.innerHeight) * 100; // up = +
    setHeightVh(Math.max(30, Math.min(95, d.startH + dyVh)));
  };
  const onDragEnd = () => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setDragging(false);
    setHeightVh((h) => {
      if (h <= CLOSE_VH) {
        onClose();
        return DEFAULT_VH;
      }
      return h >= SNAP_EXPAND ? EXPANDED_VH : DEFAULT_VH;
    });
  };

  // Re-open a canvas artifact Yulia produced, then dismiss the sheet so the
  // canvas surface (behind it) is revealed.
  const openCanvas = (id: string) => {
    const dealId = typeof surfaceContext?.dealId === "number" ? surfaceContext.dealId : undefined;
    nav.openCanvas(id, dealId);
    onClose();
  };

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

  // Land at the bottom on open; pin while the user is reading the tail.
  useEffect(() => {
    if (!open) return;
    nearBottomRef.current = true;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [open]);

  useEffect(() => {
    if (!open || !nearBottomRef.current) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [open, thread.length, streamingText, activeTool, toolTrace, paywallData]);

  const messageRows = useMemo(
    () =>
      thread.map((m, i) => (
        <MessageRow
          key={i}
          message={m}
          onOpenCanvas={openCanvas}
          onConfirmStagedAction={chat?.confirmStagedAction}
          onCancelStagedAction={chat?.cancelStagedAction}
        />
      )),
    // openCanvas closes over stable nav/onClose; exclude to avoid re-mapping
    [thread, chat?.confirmStagedAction, chat?.cancelStagedAction], // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (!open) return null;

  const handleSend = (text: string) => {
    nearBottomRef.current = true;
    chat?.send(text, surfaceContext);
  };

  const showEmpty = thread.length === 0 && !sending && !paywallData;

  return (
    <>
      <div onClick={onClose} style={S.scrim} aria-hidden="true" />
      <div
        role="dialog"
        aria-label="Ask Yulia"
        style={{
          ...S.sheet,
          height: `${heightVh}vh`,
          transition: dragging ? "none" : "height .26s cubic-bezier(.32,.72,0,1)",
        }}
      >
        {/* Drag zone — handle + header. Swipe up → 95%, down → dismiss. */}
        <div
          style={S.dragZone}
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
        >
          <div style={S.handle} aria-hidden="true" />
          <header style={S.header}>
          <Sparkle size={18} />
          <span style={S.headerTitle}>Yulia</span>
          {surfaceContext?.activeTitle && (
            <span style={S.ctxChip} title={`Yulia sees ${surfaceContext.activeTitle}`}>
              <MonitorIcon size={12} c={RT.accentInk} />
              <span style={S.ctxLabel}>sees {surfaceContext.activeTitle}</span>
            </span>
          )}
          <span style={{ flex: 1 }} />
          <button type="button" aria-label="Close" onClick={onClose} style={S.closeBtn}>
            <CloseIcon size={16} c={RT.muted} />
          </button>
          </header>
        </div>

        {/* When empty there's nothing to scroll, so the whole area drags the sheet
            (Cash-App "swipe anywhere"). With a conversation, the list scrolls on its
            own and the handle/header stays the drag affordance. */}
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="scr"
          style={{ ...S.list, ...(showEmpty ? { touchAction: "none" as const } : null) }}
          {...(showEmpty
            ? {
                onPointerDown: onDragStart,
                onPointerMove: onDragMove,
                onPointerUp: onDragEnd,
                onPointerCancel: onDragEnd,
              }
            : {})}
        >
          {showEmpty ? (
            <div style={S.emptyWrap}>
              <Sparkle size={26} />
              <div style={S.emptyTitle}>
                {surfaceContext?.activeTitle
                  ? `Ask Yulia about ${surfaceContext.activeTitle}`
                  : "Ask Yulia anything"}
              </div>
              <div style={S.emptySub}>
                She can pull up a deal, run the numbers, or read a file — just ask.
              </div>
            </div>
          ) : (
            <>
              {messageRows}
              {sending && <Streaming text={streamingText} tool={activeTool} trace={toolTrace} />}
              {paywallData && <PaywallCard data={paywallData} />}
              {error && <div style={S.errorBubble}>{error}</div>}
            </>
          )}
        </div>

        <div style={S.composerWrap}>
          <ChatDock
            variant="dock"
            onSend={handleSend}
            onFileUpload={chat?.uploadFile}
            disabled={sending}
            placeholder="Message Yulia"
            isMobile
            hideStarter
          />
        </div>
      </div>
    </>
  );
}

/* ─── Message bubble (ported from ChatSheet, restyled to T) ─── */

const MessageRow = memo(Message);

function Message({
  message,
  onOpenCanvas,
  onConfirmStagedAction,
  onCancelStagedAction,
}: {
  message: MobileMessage;
  onOpenCanvas: (id: string) => void;
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
          <Sparkle size={17} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={S.yuliaText}>{message.text}</div>
            {message.canvasArtifact?.id && (
              <button
                type="button"
                style={S.canvasBtn}
                onClick={() => onOpenCanvas(message.canvasArtifact!.id)}
              >
                <MonitorIcon size={15} c={RT.accentInk} />
                <span>Open on canvas</span>
                <span aria-hidden="true">→</span>
              </button>
            )}
          </div>
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
      <Sparkle size={17} />
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

const S: Record<string, CSSProperties> = {
  scrim: {
    position: "fixed",
    inset: 0,
    background: "rgba(22,18,34,.40)",
    zIndex: 8,
    touchAction: "none", // a touch on the dimmed area can't scroll the page behind
    animation: "atlas-mobile-scrim-in .16s ease-out",
  },
  // Redesign: a clean WHITE sheet (no glass), taller, so it reads as a surface
  // sliding up over the dimmed screen behind.
  sheet: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9,
    maxHeight: "95vh", // height itself is set inline (draggable)
    display: "flex",
    flexDirection: "column",
    background: RT.card,
    borderRadius: "24px 24px 0 0",
    boxShadow: "0 -12px 40px rgba(20,18,34,.22)",
    paddingBottom: "env(safe-area-inset-bottom, 0px)",
    animation: "atlas-mobile-sheet-up .24s cubic-bezier(.32,.72,0,1)",
  },
  // The drag affordance — handle + header. touch-action:none so the gesture
  // resizes the sheet instead of scrolling the page behind it.
  dragZone: {
    flex: "none",
    touchAction: "none",
    cursor: "grab",
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    background: "#c8c6c0",
    margin: "9px auto 7px",
    flex: "none",
  },
  header: {
    flex: "none",
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "2px 16px 8px",
  },
  headerTitle: { fontSize: 17, fontWeight: 600, color: RT.ink },
  ctxChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    background: RT.accentSoft,
    color: RT.accentInk,
    borderRadius: RT.rPill,
    padding: "5px 11px",
    fontSize: 12,
    fontWeight: 500,
    maxWidth: 170,
  },
  ctxLabel: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  closeBtn: {
    width: 34,
    height: 34,
    flex: "none",
    border: "none",
    background: "rgba(0,0,0,.04)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  },
  list: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    overscrollBehavior: "contain", // the chat scroll can't chain out to the page
    WebkitOverflowScrolling: "touch",
    padding: "4px 16px 8px",
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  emptyWrap: {
    margin: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 9,
    textAlign: "center",
    padding: "24px 16px",
    maxWidth: 240,
  },
  emptyTitle: { fontSize: 18, fontWeight: 600, color: RT.ink, lineHeight: 1.35 },
  emptySub: { fontSize: 14.5, fontWeight: 400, color: RT.muted, lineHeight: 1.5 },
  userBubble: {
    alignSelf: "flex-end",
    maxWidth: "85%",
    background: RT.accent,
    color: RT.onAccent,
    borderRadius: "18px 18px 5px 18px",
    padding: "11px 15px",
    fontSize: 15,
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
  },
  yuliaRow: { display: "flex", gap: 9, alignItems: "flex-start" },
  yuliaText: { fontSize: 15, lineHeight: 1.6, color: RT.ink, whiteSpace: "pre-wrap", minWidth: 0 },
  // Persistent way to the canvas Yulia opened — the reliable destination for
  // her "I opened it on the canvas" turns.
  canvasBtn: {
    marginTop: 10,
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    background: RT.accentSoft,
    border: `1px solid ${RT.line}`,
    borderRadius: RT.rPill,
    padding: "9px 15px",
    color: RT.accentInk,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: RT.font,
    WebkitTapHighlightColor: "transparent",
  },
  errorBubble: {
    padding: "10px 14px",
    background: RT.line,
    color: RT.ink2,
    borderRadius: 12,
    fontSize: 13,
    lineHeight: 1.45,
  },
  composerWrap: { flex: "none", borderTop: `1px solid ${RT.line}` },
  /* staged action */
  stagedCard: {
    background: RT.card,
    border: `1px solid ${RT.line}`,
    borderRadius: 14,
    padding: 14,
  },
  stagedHeader: { fontSize: 13, fontWeight: 600, color: RT.accentInk, marginBottom: 7 },
  stagedTitle: { fontSize: 13.5, fontWeight: 600, color: RT.ink, marginBottom: 4 },
  stagedSummary: { fontSize: 13, lineHeight: 1.45, color: RT.ink2, marginBottom: 12 },
  stagedBtnRow: { display: "flex", gap: 9 },
  stagedConfirm: {
    background: RT.accentStrong,
    color: RT.onAccent,
    border: "none",
    borderRadius: RT.rPill,
    padding: "9px 16px",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: RT.font,
  },
  stagedCancel: {
    background: RT.card,
    color: RT.ink,
    border: `1px solid ${RT.line}`,
    borderRadius: RT.rPill,
    padding: "9px 15px",
    fontSize: 12.5,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: RT.font,
  },
  /* streaming / trace */
  toolPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "3px 10px",
    background: RT.line,
    borderRadius: RT.rPill,
    fontSize: 11,
    color: RT.muted,
    fontWeight: 500,
    marginBottom: 8,
  },
  thinking: { fontSize: 13.5, color: RT.muted },
  trace: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 0,
    fontFamily: "ui-monospace, monospace",
    fontSize: 11.5,
    lineHeight: 1.5,
    color: RT.muted,
  },
  traceLine: { display: "flex", alignItems: "baseline", gap: 6, minWidth: 0 },
  traceName: { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  traceMs: { color: RT.faint, fontVariantNumeric: "tabular-nums", flex: "none", marginLeft: "auto" },
  traceOk: { color: RT.up, fontWeight: 700, flex: "none" },
  traceDim: { color: RT.faint, flex: "none" },
  traceCollapsed: { color: RT.faint, fontSize: 11 },
  /* paywall */
  paywallCard: {
    background: RT.card,
    border: `1px solid ${RT.line}`,
    borderRadius: 16,
    padding: 16,
    boxShadow: T.shCard,
  },
  paywallTitle: { fontSize: 15, fontWeight: 700, color: RT.ink },
  paywallBody: { marginTop: 6, fontSize: 13, lineHeight: 1.5, color: RT.ink2 },
  paywallPrice: { marginTop: 8, fontSize: 15, fontWeight: 700, color: RT.ink },
  paywallBtn: {
    marginTop: 12,
    width: "100%",
    minHeight: 44,
    border: "none",
    borderRadius: 14,
    background: RT.accentStrong,
    color: RT.onAccent,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: RT.font,
  },
};
