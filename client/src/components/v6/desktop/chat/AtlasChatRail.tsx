/**
 * AtlasChatRail — the persistent 340px Yulia rail (left of every isApp screen).
 *
 * ZERO new chat logic. It consumes the MobileChatBridge built in AtlasApp from
 * the unchanged useAuthChat/useAnonymousChat hooks, and ports the four
 * ChatSheet renderers (Message / Streaming / StagedActionCard / PaywallCard)
 * restyled to T tokens — same props they read. The composer is the shared
 * ChatDock (variant="dock"). Staged actions route through THE LINE confirm.
 */
import { memo, useEffect, useMemo, useRef, type CSSProperties } from "react";
import ChatDock from "../../../shared/ChatDock";
import { buildDesktopSurfaceContext } from "../../../../lib/yuliaSurfaceContext";
import type { SurfaceContext } from "../../../../lib/yuliaSurfaceContext";
import type {
  MobileChatBridge,
  MobileMessage,
  MobilePaywallData,
  StagedAction,
  ToolTraceEntry,
} from "../../mobile/types";
import { useAtlasChat, useAtlasNav, type AtlasView, type AtlasScreen } from "../atlasNav";
import { Sparkle } from "../primitives";
import { MonitorIcon } from "../icons";
import { T } from "../atlasTokens";

/* ─── per-view context label + composer hint (design map 00 screen 5) ── */

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

const COMPOSER_HINT: Record<AtlasScreen, string> = {
  today: "Ask Yulia anything",
  pipeline: "Ask about your pipeline",
  sourcing: "Refine the search or buy-box",
  deals: "Filter or ask about the portfolio",
  studio: "Ask Yulia to draft or restyle",
  integration: "Ask about the integration",
  files: "Ask about the data room",
  agent: "Describe what this agent should do",
  cockpit: "Ask about this deal",
  canvas: "Ask Yulia about this",
  settings: "Ask Yulia",
};

function ctxLabelFor(view: AtlasView): string {
  // A deal cockpit / canvas keyed to a deal shows the deal name when present.
  if ((view.screen === "cockpit" || view.screen === "canvas") && view.dealName) {
    return view.dealName;
  }
  return CTX_LABEL[view.screen] ?? "Yulia";
}

function composerHintFor(view: AtlasView): string {
  return COMPOSER_HINT[view.screen] ?? "Ask Yulia";
}

/* ─── the rail ─────────────────────────────────────────────── */

export function AtlasChatRail() {
  const chat = useAtlasChat();
  const nav = useAtlasNav();
  const view = nav.view;

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const nearBottomRef = useRef(true);

  // Surface context: tell Yulia what Atlas screen the user is looking at. The
  // desktop builder keys to canvas tabs; here we pass a compact view-derived
  // context so it works for every screen (not only the tabbed canvas).
  const surfaceContext: SurfaceContext = useMemo(
    () => buildAtlasSurfaceContext(view),
    [view.screen, view.dealId, view.dealName, view.canvasTabId],
  );

  const thread = chat?.thread ?? [];
  const streamingText = chat?.streamingText ?? "";
  const activeTool = chat?.activeTool ?? null;
  const toolTrace = chat?.toolTrace ?? [];
  const paywallData = chat?.paywallData ?? null;
  const sending = chat?.sending ?? false;
  const error = chat?.error ?? null;

  const onConversationScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  };

  // Pin to bottom while the user is reading the tail (never yank them up).
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

  const showEmpty = thread.length === 0 && !sending && !paywallData;

  return (
    <aside style={S.rail}>
      {/* Header */}
      <header style={S.header}>
        <Sparkle size={18} />
        <span style={S.headerTitle}>Yulia</span>
        <span style={{ flex: 1 }} />
        {/* Context pill = which screen Yulia is reading. On a deal cockpit the
            deal-detail header already names the deal (avatar + title), so the
            pill stays the GENERIC screen label ("Deal") to avoid showing the
            same name twice. The deal name lives in the tooltip + surface context
            (Yulia still knows it), just not duplicated on-screen. */}
        <span style={S.ctxPill} title={ctxLabelFor(view)}>
          <MonitorIcon size={13} c={T.blue} />
          <span style={S.ctxLabel}>{CTX_LABEL[view.screen] ?? "Yulia"}</span>
        </span>
      </header>

      {/* Message list */}
      <div ref={scrollRef} onScroll={onConversationScroll} style={S.list}>
        {showEmpty ? (
          <RailEmpty />
        ) : (
          <>
            {messageRows}
            {sending && <Streaming text={streamingText} tool={activeTool} trace={toolTrace} />}
            {paywallData && <PaywallCard data={paywallData} />}
            {error && <div style={S.errorBubble}>{error}</div>}
          </>
        )}
      </div>

      {/* Composer — shared ChatDock, dock variant. The rail constrains width.
          ChatDock's dock-outer already draws its own top border + padding, so
          the wrapper adds none (avoids a double hairline). */}
      <div style={S.composerWrap}>
        <ChatDock
          variant="dock"
          onSend={handleSend}
          onFileUpload={chat?.uploadFile}
          disabled={sending}
          placeholder={composerHintFor(view)}
          hideStarter
        />
        <div style={S.disclaimer}>Yulia sees this screen · check important info</div>
      </div>
    </aside>
  );
}

/* ─── surface context for any Atlas view ─────────────────────── */

function buildAtlasSurfaceContext(view: AtlasView): SurfaceContext {
  // When a canvas tab is active we can lean on the canonical desktop builder
  // (it keys off tab id); otherwise hand-build a compact context from the view.
  if (view.screen === "canvas" && view.canvasTabId) {
    return buildDesktopSurfaceContext("workspace" as any, view.canvasTabId, []);
  }
  const ctx: SurfaceContext = {
    device: "desktop",
    activeMode: view.screen,
    activeView: view.screen,
    activeTitle: ctxLabelFor(view),
  };
  if (view.dealId != null) ctx.dealId = view.dealId;
  if (view.dealName) ctx.dealTitle = view.dealName;
  return ctx;
}

/* ─── empty state ──────────────────────────────────────────── */

/** Compact, on-brand empty state sized for the 340px rail: one sparkle + one
 *  short line. (The reused mobile ChatSheet empty state is full-screen and its
 *  illustrations overflow this width — it is deliberately NOT used here.) */
function RailEmpty() {
  return (
    <div style={S.emptyWrap}>
      <Sparkle size={20} />
      <div style={S.emptyTitle}>Ask Yulia about this screen</div>
    </div>
  );
}

/* ─── Message bubble (ported from ChatSheet, restyled to T) ─── */

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
          <Sparkle size={17} />
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

/* ─── styles ───────────────────────────────────────────────── */

const S: Record<string, CSSProperties> = {
  rail: {
    width: 340,
    flex: "none",
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    // No right border — the white rail reads against the faintly-tinted canvas
    // (AtlasApp detailRegion = T.surface). Separation by tone, not a line.
    background: T.white,
  },
  header: {
    height: 50,
    flex: "none",
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "0 16px",
    // No underline — the header floats in the clean rail column.
  },
  headerTitle: { fontSize: 15, fontWeight: 600, color: T.ink },
  ctxPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: T.track,
    borderRadius: T.rPill,
    padding: "4px 10px",
    fontSize: 11.5,
    color: T.muted,
    maxWidth: 172,
  },
  ctxLabel: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  list: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "18px 16px",
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
  emptyTitle: { fontSize: 13.5, fontWeight: 500, color: T.muted, lineHeight: 1.45 },
  userBubble: {
    alignSelf: "flex-end",
    maxWidth: "85%",
    background: T.track,
    borderRadius: "18px 18px 4px 18px",
    padding: "10px 14px",
    fontSize: 13.5,
    lineHeight: 1.5,
    color: T.ink,
    whiteSpace: "pre-wrap",
  },
  yuliaRow: { display: "flex", gap: 9, alignItems: "flex-start" },
  yuliaText: {
    fontSize: 13.5,
    lineHeight: 1.62,
    color: T.ink,
    whiteSpace: "pre-wrap",
    minWidth: 0,
  },
  errorBubble: {
    padding: "10px 14px",
    background: T.terraBg,
    color: T.terra,
    borderRadius: 12,
    fontSize: 13,
    lineHeight: 1.45,
  },
  // ChatDock's dock-outer brings its own top border + 12px/16px padding, so the
  // wrapper adds neither (a second border here would double the hairline).
  composerWrap: { flex: "none" },
  disclaimer: {
    textAlign: "center",
    fontSize: 11,
    color: T.faint,
    lineHeight: 1.4,
    padding: "0 14px 12px",
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
    padding: "8px 16px",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: T.font,
    transition: "opacity .12s ease",
  },
  stagedCancel: {
    background: T.white,
    color: T.ink,
    border: `1px solid ${T.inputBd}`,
    borderRadius: T.rPill,
    padding: "8px 15px",
    fontSize: 12.5,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: T.font,
    transition: "background .12s ease",
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
    minHeight: 42,
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

export default AtlasChatRail;
