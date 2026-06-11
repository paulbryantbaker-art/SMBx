/* V6 Mobile — Fullscreen Yulia chat sheet.
   Three-layer iMessage architecture per feedback_pwa_chat_flex_layout.md:
   - Conversation (back layer, position:absolute inset:0, scroll)
   - Header (front top, position:absolute top:0)
   - Composer (front bottom, position:absolute bottom: kbHeight)

   Why three layers and not flex column: iOS Safari PWA does NOT resize
   the layout viewport on keyboard open; flex column never recomputes and
   the composer sits behind the keyboard. The three-layer pattern lets the
   composer track keyboard height via JS visualViewport while the
   conversation scroll never moves with the keyboard. */

import { useEffect, useLayoutEffect, useRef, useState, type ChangeEvent, type CSSProperties, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { MobileIcon } from "./icons";
import { CHAT_COMPOSER_STYLES } from "./ChatStarterPill";
import type { MobileChatBridge, MobileMessage, MobilePaywallData, StagedAction, ToolTraceEntry } from "./types";

interface ChatSheetProps {
  open: boolean;
  onClose: () => void;
  chat: MobileChatBridge;
}

export function ChatSheet({ open, onClose, chat }: ChatSheetProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [kbHeight, setKbHeight] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [attachment, setAttachment] = useState<{ name: string; size: string } | null>(null);

  // Toggle html.yulia-chat-open while sheet is mounted
  useLayoutEffect(() => {
    if (!open) return;
    document.documentElement.classList.add("yulia-chat-open");
    return () => document.documentElement.classList.remove("yulia-chat-open");
  }, [open]);

  // Track keyboard height via visualViewport
  useEffect(() => {
    if (!open) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const raw = window.innerHeight - vv.height;
      const clamped = Math.max(0, Math.min(window.innerHeight * 0.75, raw));
      setKbHeight(clamped);
    };
    update();
    vv.addEventListener("resize", update);
    return () => vv.removeEventListener("resize", update);
  }, [open]);

  // Scroll to bottom on new messages or open. toolTrace and paywallData are
  // identity-stable per update, so they keep the ledger / paywall card in view.
  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [open, chat.thread.length, chat.streamingText, chat.activeTool, chat.toolTrace, chat.paywallData]);

  // Autofocus textarea on open
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 200);
    return () => clearTimeout(t);
  }, [open]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendDraft();
  };
  const sendDraft = () => {
    const msg = draft.trim();
    if (!msg) return;
    chat.send(msg);
    setDraft("");
    setAttachment(null);
    inputRef.current?.focus();
  };
  const onKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendDraft();
    }
  };

  // Upload — mirrors desktop Chat.tsx: upload first, then pre-draft a review
  // prompt so one tap sends the file into the conversation.
  const handleFilePick = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !chat.uploadFile || uploading) return;
    setUploading(true);
    try {
      const result = await chat.uploadFile(file);
      if (result) {
        setAttachment(result);
        setDraft(d => d.trim() ? d : `Review ${result.name} and tell me what matters.`);
      }
    } finally {
      setUploading(false);
    }
  };

  const showEmpty = chat.thread.length === 0 && !chat.sending && !chat.paywallData;

  return createPortal(
    <div
      role="dialog"
      aria-label="Chat with Yulia"
      aria-modal="true"
      className="mobile-root mb-slide-up"
      style={S.dialog}
    >
      {/* FRONT TOP — header */}
      <div style={S.headerLayer}>
        <div style={S.headerRow}>
          <button
            type="button"
            aria-label="Close chat"
            onClick={onClose}
            style={S.headerBtn}
          >
            <MobileIcon name="back" size={14} c="var(--mb-ink-1)" />
          </button>
          <div style={S.headerTitleWrap}>
            <div style={S.headerTitle}>Yulia</div>
            {chat.activeTool ? <div className="mb-mono" style={S.headerMeta}>{chat.activeTool}</div> : null}
          </div>
          <button
            type="button"
            aria-label="Close chat"
            onClick={onClose}
            style={S.headerBtn}
          >
            <MobileIcon name="close" size={16} c="var(--mb-ink-1)" />
          </button>
        </div>
      </div>

      {/* BACK — scrolling conversation */}
      <div
        ref={scrollRef}
        className="mb-hide-scroll"
        style={{
          ...S.conversation,
          paddingBottom: `${72 + kbHeight + 16}px`,
        }}
      >
        {showEmpty ? (
          <ChatEmpty onPick={(t) => { chat.send(t); }} />
        ) : (
          <>
            {chat.thread.map((m, i) => (
              <Message
                key={i}
                message={m}
                onConfirmStagedAction={chat.confirmStagedAction}
                onCancelStagedAction={chat.cancelStagedAction}
              />
            ))}
            {chat.sending && (
              <Streaming text={chat.streamingText} tool={chat.activeTool} trace={chat.toolTrace} />
            )}
            {chat.paywallData && <PaywallCard data={chat.paywallData} />}
            {chat.error && (
              <div style={S.errorBubble}>{chat.error}</div>
            )}
          </>
        )}
      </div>

      {/* FRONT BOTTOM — composer */}
      <form
        onSubmit={onSubmit}
        style={{
          ...S.composer,
          bottom: kbHeight,
          paddingBottom: kbHeight > 0 ? 8 : "max(env(safe-area-inset-bottom, 0px), 14px)",
        }}
      >
        {attachment && (
          <div style={S.attachChip}>
            <span style={S.attachName}>{attachment.name}</span>
            <span style={S.attachSize}>{attachment.size}</span>
            <button
              type="button"
              aria-label={`Remove ${attachment.name}`}
              onClick={() => setAttachment(null)}
              style={S.attachRemove}
            >
              <MobileIcon name="close" size={12} c="var(--mb-ink-2)" />
            </button>
          </div>
        )}
        <div style={{ ...CHAT_COMPOSER_STYLES.pill, paddingLeft: 4 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.rtf,.md,.xlsx,.xls,.csv,.pptx,.ppt,.png,.jpg,.jpeg,.webp,.gif,.heic,.json"
            onChange={handleFilePick}
            style={{ display: "none" }}
          />
          <button
            type="button"
            aria-label={chat.uploadFile ? (uploading ? "Uploading" : "Upload a file") : "Sign in to upload files"}
            aria-busy={uploading}
            disabled={uploading || !chat.uploadFile}
            onClick={() => fileInputRef.current?.click()}
            style={{
              ...S.uploadBtn,
              opacity: chat.uploadFile && !uploading ? 1 : 0.35,
            }}
          >
            {/* No plus glyph in MobileIcon — inline the same stroke style. */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="var(--mb-ink-1)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Message Yulia"
            aria-label="Message Yulia"
            style={CHAT_COMPOSER_STYLES.input}
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!draft.trim()}
            style={{
              ...CHAT_COMPOSER_STYLES.send,
              opacity: draft.trim() ? 1 : 0.4,
            }}
          >
            <MobileIcon name="arrowUp" size={16} c="#fff" />
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}

/* ─── Empty state ───────────────────────────────────────── */

const SUGGESTIONS = [
  "What's worth my time today?",
  "Walk me through Big Fake Deal",
  "Read me the brief",
  "Compare my top 3 picks",
];

function ChatEmpty({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="mb-fade-up" style={S.emptyWrap}>
      <h2 style={S.emptyH2}>Hi there. Tell me what you&rsquo;re working on.</h2>
      <p style={S.emptyP}>
        Or try one of these &mdash; you&rsquo;re inside a working sample.
      </p>
      <div style={S.suggestColumn}>
        {SUGGESTIONS.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            style={S.suggestChip}
          >
            <span style={{ color: "var(--mb-accent-ink)", fontSize: 11, marginRight: 6 }}>&rarr;</span>
            <span>{s}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Message bubble ────────────────────────────────────── */

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
    <div className="mb-fade-up" style={{ marginBottom: 10 }}>
      <div style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}>
        <div style={{
          maxWidth: "78%",
          padding: "10px 14px",
          borderRadius: 18,
          background: isUser ? "var(--mb-accent-ink)" : "var(--mb-card-2)",
          color: isUser ? "#fff" : "var(--mb-ink)",
          fontSize: 14.5, lineHeight: 1.45,
          whiteSpace: "pre-wrap",
          textWrap: "pretty",
        }}>{message.text}</div>
      </div>
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

/* Governed-write approval card (THE LINE: descriptive copy only — the action
   is staged server-side and runs ONLY when the user confirms). Mirrors the
   desktop Chat.tsx StagedActionCard semantics with mobile touch sizing. */
function StagedActionCard({
  action,
  onConfirm,
  onCancel,
}: {
  action: StagedAction;
  onConfirm?: (id: number, summary?: string) => void | Promise<void>;
  onCancel?: (id: number) => void | Promise<void>;
}) {
  // Historic staged actions reloaded without a persisted id can't be acted on.
  const canAct = !!action.id && !!onConfirm && !!onCancel;
  return (
    <div style={S.stagedCard}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
        <div style={{ minWidth: 0 }}>
          <div style={S.stagedTitle}>{action.label}</div>
          <div style={S.stagedSummary}>{action.summary}</div>
        </div>
        <span style={S.stagedRisk}>{(action.riskLevel || "approval").replace(/_/g, " ")}</span>
      </div>
      <div style={S.stagedBtnRow}>
        <button
          type="button"
          disabled={!canAct}
          style={{ ...S.stagedConfirm, opacity: canAct ? 1 : 0.45 }}
          onClick={() => { if (action.id) void onConfirm?.(action.id, action.summary); }}
        >
          Confirm
        </button>
        <button
          type="button"
          disabled={!canAct}
          style={{ ...S.stagedCancel, opacity: canAct ? 1 : 0.45 }}
          onClick={() => { if (action.id) void onCancel?.(action.id); }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ─── Streaming bubble with computation trace ───────────── */

// Cap the visible ledger; older completed steps collapse into one summary line.
const TRACE_VISIBLE_MAX = 6;

function Streaming({ text, tool, trace }: { text: string; tool: string | null; trace: ToolTraceEntry[] }) {
  // Real telemetry only: the ledger renders entries sourced from SSE
  // tool_start/tool_done events. With no trace, fall back to the single pill.
  const hasTrace = trace.length > 0;
  const visible = trace.slice(-TRACE_VISIBLE_MAX);
  const hiddenCount = trace.length - visible.length;
  return (
    <div className="mb-fade-up" style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10 }}>
      <div style={{
        maxWidth: "78%",
        padding: "10px 14px",
        borderRadius: 18,
        background: "var(--mb-card-2)",
        color: "var(--mb-ink)",
        fontSize: 14.5, lineHeight: 1.45,
      }}>
        {hasTrace ? (
          <div aria-label="Yulia's tool activity" style={{ ...S.trace, marginBottom: text ? 8 : 0 }}>
            {hiddenCount > 0 && (
              <div style={S.traceCollapsed}>{hiddenCount} earlier step{hiddenCount === 1 ? "" : "s"} ✓</div>
            )}
            {visible.map(t => (
              <div key={t.id} style={S.traceLine}>
                <span style={S.traceDim}>→</span>
                <span style={S.traceName}>{t.label}</span>
                {t.status === "done"
                  ? <><span style={S.traceMs}>{((t.ms ?? 0) / 1000).toFixed(1)}s</span><span style={S.traceOk}>✓</span></>
                  : <span style={S.traceDim}>running…</span>}
              </div>
            ))}
          </div>
        ) : tool ? (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "3px 10px",
            background: "rgba(0,0,0,0.06)",
            borderRadius: 999,
            fontSize: 11, color: "var(--mb-ink-2)", fontWeight: 500,
            marginBottom: text ? 8 : 0,
          }}>
            <span className="pulse-dot" style={{ color: "var(--mb-accent-ink)" }} aria-hidden="true" />
            <span>{tool}…</span>
          </div>
        ) : null}
        {text && (
          <span style={{ whiteSpace: "pre-wrap", textWrap: "pretty" }}>
            {text}
            <span style={{ opacity: 0.5 }}>▍</span>
          </span>
        )}
        {!hasTrace && !tool && !text && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "var(--mb-ink-2)" }}>
            <span className="pulse-dot" style={{ color: "var(--mb-accent-ink)" }} aria-hidden="true" />
            Yulia is thinking…
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Paywall card ──────────────────────────────────────── */

function PaywallCard({ data }: { data: MobilePaywallData }) {
  const planName = typeof data.requiredPlan === "string" && data.requiredPlan
    ? data.requiredPlan.charAt(0).toUpperCase() + data.requiredPlan.slice(1)
    : null;
  const message =
    (typeof data.message === "string" && data.message)
    || (typeof data.callToAction === "string" && data.callToAction)
    || (planName ? `This deliverable is included in the ${planName} plan.` : "This deliverable is included in a paid plan.");
  const checkoutUrl = typeof data.checkoutUrl === "string" && data.checkoutUrl ? data.checkoutUrl : null;
  return (
    <div className="mb-fade-up" style={S.paywallCard}>
      <div style={S.paywallTitle}>{planName ? `Upgrade to ${planName}` : "Upgrade to continue"}</div>
      <div style={S.paywallBody}>{message}</div>
      {typeof data.priceDisplay === "string" && data.priceDisplay && (
        <div style={S.paywallPrice}>{data.priceDisplay}</div>
      )}
      <button
        type="button"
        style={S.paywallBtn}
        onClick={() => window.location.assign(checkoutUrl ?? "/pricing")}
      >
        {checkoutUrl ? "Upgrade" : "See pricing"}
      </button>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  dialog: {
    /* Position retuned 2026-05-05 (eve) — was `absolute` which resolves to
       the initial containing block in static-bodied Safari Tab mode and can
       break when body has scrolled. Fixed always anchors to the visual
       viewport in both PWA standalone and Safari Tab — no more "header
       offscreen above, composer mid-page, tab bar visible behind." */
    position: "fixed",
    inset: 0,
    background: "var(--mb-bg)",
    overflow: "hidden",
    zIndex: 9999,
  },
  headerLayer: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    zIndex: 2,
    paddingTop: "calc(env(safe-area-inset-top, 0px) + 6px)",
    pointerEvents: "none",
    background: "linear-gradient(to bottom, var(--mb-bg) 0%, var(--mb-bg) 70%, transparent 100%)",
  },
  headerRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "8px 14px 10px",
    pointerEvents: "auto",
  },
  headerBtn: {
    width: 36, height: 36, borderRadius: "50%",
    background: "rgba(0,0,0,0.04)", border: "none",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },
  headerTitleWrap: { textAlign: "center", flex: 1, minWidth: 0 },
  headerTitle: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700,
    fontSize: 16, letterSpacing: "-0.2px",
    color: "var(--mb-ink)",
  },
  headerMeta: {
    fontSize: 10, color: "var(--mb-ink-3)",
    letterSpacing: "0.06em", marginTop: 1, fontWeight: 500,
  },
  conversation: {
    position: "absolute", inset: 0, zIndex: 1,
    overflowY: "auto",
    padding: "calc(env(safe-area-inset-top, 0px) + 60px) 16px 0",
    display: "flex", flexDirection: "column",
    justifyContent: "flex-end",
  },
  emptyWrap: {
    flex: 1,
    display: "flex", flexDirection: "column",
    justifyContent: "center", alignItems: "stretch",
    padding: "20px 6px",
  },
  emptyH2: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700,
    fontSize: 22, letterSpacing: "-0.4px", lineHeight: 1.2,
    margin: "0 0 8px", color: "var(--mb-ink)",
    textWrap: "balance",
  },
  emptyP: {
    fontSize: 14, color: "var(--mb-ink-3)", lineHeight: 1.45,
    margin: "0 0 18px",
    textWrap: "pretty",
  },
  suggestColumn: { display: "flex", flexDirection: "column", gap: 6 },
  suggestChip: {
    background: "var(--mb-card-2)", border: "none",
    borderRadius: 14,
    padding: "12px 14px",
    fontSize: 14, fontWeight: 500,
    color: "var(--mb-ink-2)",
    textAlign: "left",
    fontFamily: "var(--mb-font-body)",
    cursor: "pointer",
    transition: "opacity 120ms",
  },
  composer: {
    position: "absolute",
    left: 0, right: 0,
    zIndex: 2,
    paddingLeft: 14, paddingRight: 14, paddingTop: 8,
    transition: "bottom 0.15s ease-out",
  },
  composerPill: {
    background: "rgba(255,255,255,0.92)",
    border: "1px solid var(--mb-line-2)",
    borderRadius: 20,
    padding: 6,
    paddingLeft: 14,
    display: "flex", alignItems: "flex-end", gap: 8,
    boxShadow: "0 6px 20px -6px rgba(0,0,0,0.12)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },
  composerInput: {
    flex: 1, minWidth: 0,
    border: "none", background: "transparent",
    outline: "none",
    resize: "none",
    fontFamily: "var(--mb-font-body)",
    fontSize: 16, lineHeight: 1.4,
    color: "var(--mb-ink)",
    padding: "8px 4px",
    maxHeight: 160,
  },
  sendBtn: {
    width: 32, height: 32,
    borderRadius: "50%",
    background: "var(--mb-action)",
    border: "none",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    transition: "opacity 120ms",
  },
  errorBubble: {
    margin: "10px 0",
    padding: "10px 14px",
    background: "var(--mb-danger-soft)", color: "var(--mb-danger-ink)",
    borderRadius: 12,
    fontSize: 13.5, lineHeight: 1.45,
  },

  /* Composer upload affordance (≥44px touch target) + attachment chip. */
  uploadBtn: {
    width: 44, height: 44,
    flexShrink: 0,
    border: "none", background: "transparent",
    borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  },
  attachChip: {
    margin: "0 2px 8px",
    minHeight: 36,
    boxSizing: "border-box",
    padding: "2px 2px 2px 12px",
    borderRadius: 12,
    display: "flex", alignItems: "center", gap: 8,
    background: "rgba(255,255,255,0.92)",
    border: "1px solid var(--mb-line-2)",
    boxShadow: "0 4px 14px -6px rgba(0,0,0,0.12)",
  },
  attachName: {
    minWidth: 0,
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
    color: "var(--mb-ink)", fontSize: 13, fontWeight: 600,
  },
  attachSize: {
    flexShrink: 0,
    color: "var(--mb-ink-3)", fontSize: 11.5,
  },
  attachRemove: {
    marginLeft: "auto",
    width: 32, height: 32, flexShrink: 0,
    border: "none", background: "transparent",
    borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  },

  /* Staged-action approval card — full-width under the message bubble. */
  stagedCard: {
    marginTop: 8,
    padding: 14,
    borderRadius: 16,
    background: "rgba(255,255,255,0.92)",
    border: "1px solid var(--mb-line-2)",
    boxShadow: "0 8px 22px -10px rgba(0,0,0,0.14)",
  },
  stagedTitle: {
    fontFamily: "var(--mb-font-display)",
    fontSize: 15, fontWeight: 700,
    color: "var(--mb-ink)", lineHeight: 1.25,
  },
  stagedSummary: {
    marginTop: 4,
    fontSize: 13, lineHeight: 1.45,
    color: "var(--mb-ink-2)",
    textWrap: "pretty",
  },
  stagedRisk: {
    flexShrink: 0,
    padding: "4px 9px",
    borderRadius: 999,
    background: "var(--mb-card-2)",
    color: "var(--mb-ink-2)",
    fontSize: 11, fontWeight: 600,
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  },
  stagedBtnRow: {
    display: "flex", gap: 8, marginTop: 12,
  },
  stagedConfirm: {
    flex: 1, minHeight: 46,
    border: "none", borderRadius: 14,
    background: "var(--mb-action)", color: "#fff",
    fontFamily: "var(--mb-font-display)",
    fontSize: 15, fontWeight: 700,
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  },
  stagedCancel: {
    flex: 1, minHeight: 46,
    border: "1px solid var(--mb-line-2)", borderRadius: 14,
    background: "var(--mb-card-2)", color: "var(--mb-ink)",
    fontFamily: "var(--mb-font-display)",
    fontSize: 15, fontWeight: 600,
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  },

  /* Computation trace ledger — inline-styled (workspace.css .wk-trace* is
     desktop-scoped; mobile keeps the same look via --mb tokens + mono). */
  trace: {
    display: "flex", flexDirection: "column", gap: 4,
    minWidth: 0,
    fontFamily: "var(--mb-font-mono)",
    fontSize: 11.5, lineHeight: 1.5,
    color: "var(--mb-ink-2)",
  },
  traceLine: {
    display: "flex", alignItems: "baseline", gap: 6,
    minWidth: 0,
  },
  traceName: {
    minWidth: 0,
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  traceMs: {
    color: "var(--mb-ink-3)",
    fontVariantNumeric: "tabular-nums",
    flex: "none",
    marginLeft: "auto",
  },
  traceOk: {
    color: "#2E8C5A", fontWeight: 700, flex: "none",
  },
  traceDim: {
    color: "var(--mb-ink-3)", flex: "none",
  },
  traceCollapsed: {
    color: "var(--mb-ink-3)", fontSize: 10.5,
  },

  /* Paywall card — plan gate in the thread. Descriptive copy; the user
     decides whether to upgrade. */
  paywallCard: {
    margin: "4px 0 10px",
    padding: 16,
    borderRadius: 16,
    background: "rgba(255,255,255,0.92)",
    border: "1px solid var(--mb-line-2)",
    boxShadow: "0 8px 22px -10px rgba(0,0,0,0.14)",
  },
  paywallTitle: {
    fontFamily: "var(--mb-font-display)",
    fontSize: 16, fontWeight: 700,
    color: "var(--mb-ink)", lineHeight: 1.25,
  },
  paywallBody: {
    marginTop: 6,
    fontSize: 13.5, lineHeight: 1.5,
    color: "var(--mb-ink-2)",
    textWrap: "pretty",
  },
  paywallPrice: {
    marginTop: 8,
    fontFamily: "var(--mb-font-display)",
    fontSize: 15, fontWeight: 700,
    color: "var(--mb-ink)",
  },
  paywallBtn: {
    marginTop: 12,
    width: "100%", minHeight: 46,
    border: "none", borderRadius: 14,
    background: "var(--mb-action)", color: "#fff",
    fontFamily: "var(--mb-font-display)",
    fontSize: 15, fontWeight: 700,
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  },
};
