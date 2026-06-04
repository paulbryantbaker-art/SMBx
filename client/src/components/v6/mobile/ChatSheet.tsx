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

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { MobileIcon } from "./icons";
import { CHAT_COMPOSER_STYLES } from "./ChatStarterPill";
import type { MobileChatBridge } from "./types";

interface ChatSheetProps {
  open: boolean;
  onClose: () => void;
  chat: MobileChatBridge;
}

export function ChatSheet({ open, onClose, chat }: ChatSheetProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [kbHeight, setKbHeight] = useState(0);

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

  // Scroll to bottom on new messages or open
  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [open, chat.thread.length, chat.streamingText, chat.activeTool]);

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
    inputRef.current?.focus();
  };
  const onKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendDraft();
    }
  };

  const showEmpty = chat.thread.length === 0 && !chat.sending;

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
              <Message key={i} who={m.who} text={m.text} />
            ))}
            {chat.sending && (
              <Streaming text={chat.streamingText} tool={chat.activeTool} />
            )}
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
        <div style={CHAT_COMPOSER_STYLES.pill}>
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

function Message({ who, text }: { who: "u" | "y"; text: string }) {
  const isUser = who === "u";
  return (
    <div className="mb-fade-up" style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 10,
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
      }}>{text}</div>
    </div>
  );
}

function Streaming({ text, tool }: { text: string; tool: string | null }) {
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
        {tool && (
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
        )}
        {text && (
          <span style={{ whiteSpace: "pre-wrap", textWrap: "pretty" }}>
            {text}
            <span style={{ opacity: 0.5 }}>▍</span>
          </span>
        )}
        {!tool && !text && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "var(--mb-ink-2)" }}>
            <span className="pulse-dot" style={{ color: "var(--mb-accent-ink)" }} aria-hidden="true" />
            Yulia is thinking…
          </span>
        )}
      </div>
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
};
