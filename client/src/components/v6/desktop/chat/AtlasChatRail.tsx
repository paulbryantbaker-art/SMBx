/**
 * AtlasChatRail — the 300px Yulia rail, RIGHT of every app screen, collapsed
 * by default.
 *
 * Was 340px pinned LEFT and always open. Paul, 2026-08-15, with a screenshot of
 * the Neo browser: *"the huge chat bar can go.. all i need is the sidebar chat
 * in the tool pages. like the last image."* The width was only half the
 * complaint — the real problem was that it was UNCONDITIONAL: the first thing
 * on every screen, at the same size, whether or not you wanted it. So it moved
 * right, narrowed, and now opens on request (AtlasApp owns the open state and
 * renders the edge tab). See `APP_REDESIGN_TRAINLINE.md` §2.
 *
 * ZERO new chat logic, still. It consumes the MobileChatBridge built in AtlasApp from
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
import { Mark } from "../Logo";
import { MonitorIcon } from "../icons";
import { T } from "../atlasTokens";

/* ─── per-view context label + composer hint (design map 00 screen 5) ── */

const CTX_LABEL: Record<AtlasScreen, string> = {
  today: "Today",
  pipeline: "Pipeline",
  sourcing: "Sourcing",
  deals: "Portfolio",
  clients: "Clients",
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
  clients: "Ask about a buyer or the call list",
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

/* ─── per-screen suggestions (2026-08-15, the Neo reference) ───────────────
 * Paul sent a screenshot of the Neo browser's assistant sidebar and said the
 * app needs "the sidebar chat in the tool pages. like the last image." Two
 * things that reference does which the rail did not:
 *
 *   1. A CONTEXT CHIP naming what the assistant can currently see ("1 Context").
 *      We have the vocabulary for this already — `yuliaSurfaceContext.ts` is
 *      the agent↔UI contract — so the chip names the REAL surface rather than
 *      being decoration. `UI_RETOOL_READINESS.md` lists that vocabulary as a
 *      preservation contract; this consumes it, it does not change it.
 *
 *   2. A SUGGESTED FOR THIS PAGE grid, four per page.
 *
 * These are the openings a practitioner actually has on each screen, phrased
 * as the thing they would type. THE LINE governs them like any other prompt:
 * every one below asks Yulia to ANALYSE or DRAFT. None instructs her to send,
 * negotiate, or contact a counterparty — an outreach suggestion here would be
 * the batch-send button the outreach machine deliberately does not have. */

const SUGGESTIONS: Record<AtlasScreen, string[]> = {
  today: ["What needs me today", "What slipped this week", "Summarise the pipeline", "Draft my week"],
  pipeline: ["Where is this stalling", "What is overdue", "Compare the stages", "What closes this quarter"],
  sourcing: ["Tighten the buy-box", "Why did this rank here", "What is missing", "Draft the screen note"],
  deals: ["Which deals need me", "Compare these two", "What is missing for an IoI", "Explain this valuation"],
  clients: ["Who is owed a touch", "Draft the next note", "Which accounts went quiet", "Summarise this firm"],
  studio: ["Draft the next post", "Restyle this", "What does the master say", "Check the citations"],
  integration: ["What is at risk", "Draft the day-30 update", "Which workstreams slipped", "Summarise progress"],
  files: ["What is in here", "What is missing for diligence", "Summarise this document", "Find the LOI"],
  agent: ["What can this do", "Draft the instruction", "Show recent runs", "Explain the last result"],
  cockpit: ["Draft the next touch", "What is missing for the IoI", "Explain the WACC", "Compare to the last three"],
  canvas: ["Explain this model", "What if EBITDA is lower", "Which assumption moves it most", "Sanity-check this"],
  settings: ["What does this change", "Who is on the team", "Explain practice mode", "Show my entitlements"],
};

function suggestionsFor(view: AtlasView): string[] {
  return SUGGESTIONS[view.screen] ?? SUGGESTIONS.today;
}

/* ─── the rail ─────────────────────────────────────────────── */

export function AtlasChatRail({ onClose }: { onClose?: () => void } = {}) {
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

  const openCanvas = (id: string) => nav.openCanvas(id, view.dealId ?? undefined);

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
    // openCanvas closes over nav identity + the active deal id (stable per view)
    [thread, view.dealId, chat?.confirmStagedAction, chat?.cancelStagedAction], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleSend = (text: string) => {
    nearBottomRef.current = true;
    chat?.send(text, surfaceContext);
  };

  const showEmpty = thread.length === 0 && !sending && !paywallData;

  return (
    <aside style={S.rail}>
      {/* Header */}
      {/* The old "Deal"/"Canvas" context pill is gone — the header tab strip now
          shows what's open (and which is active), so the pill was redundant. */}
      <header style={S.header}>
        <Mark height={18} />
        <span style={S.headerTitle}>Yulia</span>
        {onClose && (
          <button type="button" onClick={onClose} style={S.railClose} aria-label="Close Yulia">
            ✕
          </button>
        )}
      </header>

      {/* Message list */}
      <div ref={scrollRef} onScroll={onConversationScroll} style={S.list}>
        {showEmpty ? (
          <RailEmpty
            contextLabel={ctxLabelFor(view)}
            suggestions={suggestionsFor(view)}
            onPick={handleSend}
          />
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
/**
 * The empty rail is now the Neo reference's opening: what Yulia can see, then
 * four openings for THIS page.
 *
 * The context chip is not decoration — it reads `ctxLabelFor(view)`, the same
 * derivation that feeds the surface context actually sent with every message.
 * If the chip and the payload could disagree, the chip would be a lie about
 * what the model knows, which is worse than showing nothing.
 */
function RailEmpty({ contextLabel, suggestions, onPick }: {
  contextLabel: string;
  suggestions: string[];
  onPick: (text: string) => void;
}) {
  return (
    <div style={S.emptyWrap}>
      <div style={S.ctxChip}>
        <MonitorIcon size={12} />
        <span>Reading <b>{contextLabel}</b></span>
      </div>
      <div style={S.suggestLabel}>Suggested for this page</div>
      <div style={S.suggestGrid}>
        {suggestions.map(s => (
          <button key={s} type="button" onClick={() => onPick(s)} style={S.suggestCard}>
            {s}
          </button>
        ))}
      </div>
    </div>
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
          <Mark height={17} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={S.yuliaText}>{message.text}</div>
            {message.canvasArtifact?.id && (
              <button
                type="button"
                style={S.canvasBtn}
                onClick={() => onOpenCanvas(message.canvasArtifact!.id)}
              >
                <MonitorIcon size={14} c={T.blue} />
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
      <Mark height={17} />
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
    // 340 -> 300 (2026-08-15). Paul: "the huge chat bar can go." The width was
    // only half of it -- the rail was pinned LEFT on every app screen and
    // opened unconditionally, so it was the first thing on the page whether or
    // not you wanted it. AtlasApp now renders it on the RIGHT and closed by
    // default; this is the open width.
    width: 300,
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
  list: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "18px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  // The empty rail is top-aligned now, not centred: it carries a context chip
  // and a suggestion grid rather than one line, and a centred block of four
  // cards floats oddly in a 300px column.
  emptyWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: "4px 14px 16px",
  },
  emptyTitle: { fontSize: 13.5, fontWeight: 500, color: T.muted, lineHeight: 1.45 },
  ctxChip: {
    alignSelf: "flex-start",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 11.5,
    color: T.muted,
    background: T.track,
    border: `1px solid ${T.border}`,
    borderRadius: 10,
    padding: "4px 9px",
  },
  suggestLabel: {
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: ".06em",
    textTransform: "uppercase",
    color: T.muted2,
    marginTop: 4,
  },
  // Two-up, matching the reference's 2x2. Radius 10 because these are buttons
  // -- Carta's one exception to radius 0.
  suggestGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 7,
  },
  suggestCard: {
    font: "inherit",
    fontSize: 12,
    fontWeight: 600,
    color: T.ink,
    textAlign: "left",
    lineHeight: 1.35,
    background: T.white,
    border: `1px solid ${T.border}`,
    borderRadius: 10,
    padding: "10px 10px",
    cursor: "pointer",
    minHeight: 56,
  },
  railClose: {
    marginLeft: "auto",
    font: "inherit",
    fontSize: 13,
    lineHeight: 1,
    color: T.muted2,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 4,
  },
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
  // Persistent way back to a canvas Yulia opened — rendered on the turn that
  // produced it so "I opened it on the canvas" always has a real destination.
  canvasBtn: {
    marginTop: 9,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: T.blueBg3,
    border: `1px solid ${T.approvalBd}`,
    borderRadius: T.rPill,
    padding: "7px 13px",
    color: T.blue,
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: T.font,
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
