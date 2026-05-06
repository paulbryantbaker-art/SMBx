import { useState, type CSSProperties, type RefObject, type KeyboardEvent, type FormEvent } from "react";
import type { Message, OpenTab } from "./types";
import { V6GateStrip } from "./GateStrip";

interface ChatProps {
  thread: Message[];
  draft: string;
  setDraft: (v: string) => void;
  send: (text?: string) => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  modeLabel: string;
  onOpenTab: OpenTab;
  isAnon: boolean;
  sending?: boolean;
  streamingText?: string;
  activeTool?: string | null;
  error?: string | null;
  /** When a deal is in scope, the GateStrip in the chat header renders. */
  activeDealId?: number | null;
}

export function V6Chat({
  thread, draft, setDraft, send, inputRef, modeLabel, onOpenTab,
  isAnon, sending, streamingText, activeTool, error, activeDealId,
}: ChatProps) {
  const [shareLabel, setShareLabel] = useState<"Share" | "Copied">("Share");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send();
  };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const openHistory = () => {
    onOpenTab({ id: "tab-history", kind: "history", title: "Conversation history" });
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareLabel("Copied");
      setTimeout(() => setShareLabel("Share"), 1600);
    } catch {
      // Clipboard write rejected (Safari without user gesture, perms, etc).
      // Fall back to a visible label change so user knows the click registered.
      setShareLabel("Copied");
      setTimeout(() => setShareLabel("Share"), 1600);
    }
  };

  return (
    <div style={C.chat}>
      <div style={C.chatHead}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={C.yMark}>Y</div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--m-on-surface)", letterSpacing: "-0.01em" }}>Yulia</div>
            <div className="mono" style={{ fontSize: 10, color: "var(--m-on-surface-mid)", letterSpacing: "0.06em" }}>
              {isAnon ? "SAMPLE · " : ""}{modeLabel.toUpperCase()}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          <button
            className="m-btn text"
            style={{ height: 28, fontSize: 11.5 }}
            onClick={openHistory}
            type="button"
          >
            History
          </button>
          <button
            className="m-btn text"
            style={{ height: 28, fontSize: 11.5 }}
            onClick={copyShareLink}
            type="button"
            aria-label="Copy share link"
          >
            {shareLabel}
          </button>
        </div>
      </div>

      {/* UX-03: gate progress strip. Renders only when a deal is in scope.
          Pulls from /api/chat/deals/:dealId/gates and re-fetches on
          smbx:gate_advance_refresh window events. */}
      {activeDealId && <V6GateStrip dealId={activeDealId} />}

      <div className="thin-scroll" style={C.chatBody}>
        {thread.length === 0 && !sending ? (
          <V6ChatEmpty modeLabel={modeLabel} onPick={(t) => send(t)} onOpenTab={onOpenTab} />
        ) : (
          <>
            {thread.map((m, i) => <V6Msg key={i} {...m} />)}
            {sending && (streamingText || activeTool) && (
              <V6Streaming text={streamingText ?? ""} tool={activeTool ?? null} />
            )}
            {error && <V6Error message={error} />}
          </>
        )}
      </div>

      <form style={C.composer} onSubmit={onSubmit}>
        <textarea
          ref={inputRef}
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message Yulia · she's aware of what's open"
          style={C.composerInput}
          onKeyDown={onKey}
          aria-label="Message Yulia"
        />
        <div style={C.composerFoot}>
          <span className="mono" style={{ fontSize: 10, color: "var(--m-on-surface-mid)" }}>
            ↵ send · ⇧↵ newline · / commands
          </span>
          <button type="submit" className="m-fab" aria-label="Send" disabled={!draft.trim()}>
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 11.5V2.5M7 2.5L3 6.5M7 2.5L11 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

function V6Msg({ who, text, meta }: Message) {
  // System messages with structured payload render as styled cards.
  // Today only one kind: gate_advance.
  if (who === "system" && meta?.kind === "gate_advance") {
    return <V6GateAdvanceCard meta={meta} fallbackText={text} />;
  }

  const isY = who === "y";
  return (
    <div className="m-fade-up" style={{ display: "flex", gap: 10, marginBottom: 14 }}>
      <div style={{
        width: 24, height: 24, flexShrink: 0, borderRadius: 7,
        background: isY ? "var(--m-primary-container)" : "var(--m-surface-2)",
        color: isY ? "var(--m-on-primary-container)" : "var(--m-on-surface-var)",
        display: "grid", placeItems: "center",
        fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 10,
      }}>{isY ? "Y" : ">"}</div>
      <div style={{
        flex: 1, minWidth: 0, fontSize: 12.5, lineHeight: 1.55,
        color: "var(--m-on-surface)", paddingTop: 3,
        whiteSpace: "pre-wrap", textWrap: "pretty",
      }}>{text}</div>
    </div>
  );
}

/**
 * Gate-advance receipt card. Renders inline in the chat thread when the
 * server emits an SSE `gate_advance` event. Surfaces the new gate + the
 * completion deliverable Yulia just kicked off, with an "Open in canvas"
 * action that fires the same canvas_action the model tools use.
 *
 * Design: V6 desktop tokens only. Primary-container background ties it to
 * Yulia's voice (her avatars use the same swatch). Subtle entrance via
 * .m-fade-up (cubic-bezier deceleration). No bounce, no celebration emoji
 * — the artifact itself is the celebration.
 */
function V6GateAdvanceCard({ meta, fallbackText }: { meta: NonNullable<Message["meta"]>; fallbackText: string }) {
  const hasDeliverable = !!meta.completionDeliverableId;
  const deliverableReady = meta.completionDeliverableStatus === "complete";
  const deliverableFailed = meta.completionDeliverableStatus === "failed";

  const openDeliverable = () => {
    if (!meta.completionDeliverableId) return;
    window.dispatchEvent(new CustomEvent("smbx:canvas_action", {
      detail: {
        canvas_action: "open_deliverable",
        deliverableId: meta.completionDeliverableId,
        tabTitle: meta.completionDeliverableTitle ?? `Deliverable · ${meta.completionDeliverableId}`,
      },
    }));
  };

  // Fallback when meta arrived malformed — degrade gracefully to plain text.
  if (!meta.toGate) {
    return (
      <div className="m-fade-up" style={GA.fallback}>
        {fallbackText}
      </div>
    );
  }

  return (
    <div className="m-fade-up" style={GA.row}>
      <div style={GA.icon} aria-hidden="true">
        {/* Checkmark for the gate completion. Single SVG, no fill animation —
            the row's fade-up is the only motion. */}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6.2 L5 8.5 L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={GA.card}>
        <div className="mono" style={GA.eyebrow}>
          ADVANCED TO {meta.toGate.toUpperCase()}
          {meta.gateName && (
            <span style={{ color: "var(--m-on-primary-container)", opacity: 0.6, marginLeft: 6 }}>
              · {meta.gateName}
            </span>
          )}
        </div>
        {meta.completionDeliverableTitle && (
          <div style={GA.title}>{meta.completionDeliverableTitle}</div>
        )}
        {hasDeliverable && (
          <div style={GA.body}>
            {deliverableReady && "Ready in your canvas. Yulia can walk you through it."}
            {!deliverableReady && !deliverableFailed && "Yulia's preparing it now — opens in your canvas in a moment."}
            {deliverableFailed && "Couldn't generate this one. Ask Yulia to retry in chat."}
          </div>
        )}
        {hasDeliverable && !deliverableFailed && (
          <button
            type="button"
            className="m-fade-up"
            onClick={openDeliverable}
            style={GA.cta}
            onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
            onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ""; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ""; }}
          >
            Open in canvas
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ marginLeft: 6 }}>
              <path d="M3.5 8.5 L8.5 3.5 M8.5 3.5 H4 M8.5 3.5 V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

const GA: Record<string, CSSProperties> = {
  row: {
    display: "flex", gap: 10, marginBottom: 14,
  },
  icon: {
    width: 24, height: 24, flexShrink: 0, borderRadius: 7,
    background: "var(--m-pursue-container)",
    color: "var(--m-pursue-on-cont)",
    display: "grid", placeItems: "center",
  },
  card: {
    flex: 1, minWidth: 0,
    background: "var(--m-primary-container)",
    color: "var(--m-on-primary-container)",
    borderRadius: 10,
    padding: "10px 14px 12px",
    boxShadow: "var(--m-elev-1)",
  },
  eyebrow: {
    fontSize: 9.5, letterSpacing: "0.14em", fontWeight: 600,
    color: "var(--m-on-primary-container)",
  },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: 14.5, fontWeight: 600,
    letterSpacing: "-0.01em",
    margin: "4px 0 4px",
  },
  body: {
    fontSize: 12, lineHeight: 1.5, opacity: 0.78, margin: 0,
  },
  cta: {
    marginTop: 8,
    display: "inline-flex", alignItems: "center",
    background: "var(--m-primary)",
    color: "var(--m-on-primary)",
    border: "none",
    fontFamily: "var(--font-display)",
    fontSize: 12, fontWeight: 600,
    padding: "5px 11px",
    borderRadius: 999,
    cursor: "pointer",
    transition: "transform 160ms cubic-bezier(0.23, 1, 0.32, 1)",
  },
  fallback: {
    fontSize: 12, color: "var(--m-on-surface-mid)",
    padding: "6px 10px", marginBottom: 14,
    background: "var(--m-surface-1)", borderRadius: 6,
  },
};

function V6Streaming({ text, tool }: { text: string; tool: string | null }) {
  return (
    <div className="m-fade-up" style={{ display: "flex", gap: 10, marginBottom: 14 }}>
      <div style={{
        width: 24, height: 24, flexShrink: 0, borderRadius: 7,
        background: "var(--m-primary-container)", color: "var(--m-on-primary-container)",
        display: "grid", placeItems: "center",
        fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 10,
      }}>Y</div>
      <div style={{ flex: 1, minWidth: 0, paddingTop: 3 }}>
        {tool && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "3px 9px",
            background: "var(--m-surface-2)", borderRadius: 999,
            fontSize: 11, color: "var(--m-on-surface-var)", fontWeight: 500,
            marginBottom: 8,
          }}>
            <span className="pulse-dot" style={{ color: "var(--m-primary)" }} aria-hidden="true" />
            <span>{tool}…</span>
          </div>
        )}
        {text && (
          <div style={{
            fontSize: 12.5, lineHeight: 1.55, color: "var(--m-on-surface)",
            whiteSpace: "pre-wrap", textWrap: "pretty",
          }}>{text}<span style={{ opacity: 0.5 }}>▍</span></div>
        )}
      </div>
    </div>
  );
}

function V6Error({ message }: { message: string }) {
  return (
    <div className="m-fade-up" style={{
      padding: "10px 12px", borderRadius: 8,
      background: "var(--m-pass-container)", color: "#4A1410",
      fontSize: 12.5, marginBottom: 14,
    }}>
      {message}
    </div>
  );
}

interface ChatEmptyProps {
  modeLabel: string;
  onPick: (text: string) => void;
  onOpenTab: OpenTab;
}

const SUGGESTIONS_BY_MODE: Record<string, string[]> = {
  "Business Search": [
    "What's worth my time today?",
    "Filter pipeline by recurring revenue",
    "Pest Control · FL — quick read",
    "Find HVAC deals in TX under $5M",
    "Compare my top 3 pursue picks",
  ],
  "Docs": [
    "Draft an LOI for Big Fake Deal",
    "What's in our latest NDA?",
    "Recast the P&L on the open deal",
    "Summarize this CIM in 5 bullets",
    "Pull diligence checklist for SBA close",
  ],
  "Analysis": [
    "Run comps on Pest Control · FL",
    "Re-run valuation with 6.0× multiple",
    "What do these numbers tell me?",
    "Stress-test DSCR if rates rise 1pt",
    "Build a 3-scenario sensitivity",
  ],
  "Market Intelligence": [
    "Pest control trends, last 30 days",
    "Who's buying HVAC in CO?",
    "What sectors are heating up?",
    "Multiples — landscaping vs. pest",
    "Who closed in TX last month?",
  ],
  "Library": [
    "Find the Q1 thesis memo",
    "Pull every closed deal in TX",
    "Show me everything I starred",
    "Last 5 docs I edited",
    "Find that note about owner financing",
  ],
};

const LEARN_CHIPS: { label: string; section: "how" | "pricing"; anchor?: string }[] = [
  { label: "How it works",       section: "how"                               },
  { label: "Pricing",            section: "pricing"                           },
  { label: "What can Yulia do?", section: "how",     anchor: "capabilities"   },
  { label: "Compare plans",      section: "pricing", anchor: "compare"        },
];

function V6ChatEmpty({ modeLabel, onPick, onOpenTab }: ChatEmptyProps) {
  const suggestions = SUGGESTIONS_BY_MODE[modeLabel] ?? [
    "What can you do?",
    "Walk me through a deal",
    "Show me what's possible",
  ];

  const openLearn = (section: "how" | "pricing", anchor?: string) => {
    onOpenTab({ id: "tab-learn", kind: "learn", title: "How it works · Pricing", section, anchor });
  };

  return (
    <div className="m-fade-up">
      <h1 style={{
        fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700,
        letterSpacing: "-0.02em", lineHeight: 1.2, margin: "0 0 8px", color: "var(--m-on-surface)",
        textWrap: "balance",
      }}>
        Hi there. Yulia can walk you through one of your deals right now &mdash; for free.
      </h1>
      <p style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--m-on-surface-var)", margin: "0 0 14px", textWrap: "pretty" }}>
        Start using the app completely for free. Use the <strong style={{ color: "var(--m-on-surface)" }}>Search Ideas</strong> below to explore, or just start chatting. Feel free to learn more about the app too.
      </p>

      <div className="mono" style={C.eyebrow}>SEARCH IDEAS · {modeLabel.toUpperCase()}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 16 }}>
        {suggestions.map(s => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="m-state"
            style={C.suggestionChip}
          >
            <span style={{ color: "var(--m-primary)", fontSize: 11 }}>→</span>
            <span>{s}</span>
          </button>
        ))}
      </div>

      <div className="mono" style={C.eyebrow}>ABOUT SMBX</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {LEARN_CHIPS.map(c => (
          <button
            key={c.label}
            onClick={() => openLearn(c.section, c.anchor)}
            style={C.learnPill}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#234975"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--m-primary)"; }}
          >
            <span style={{ fontSize: 10, opacity: 0.85 }}>↗</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const C: Record<string, CSSProperties> = {
  chat: {
    background: "var(--m-surface)",
    borderRight: "1px solid var(--m-outline-var)",
    display: "flex", flexDirection: "column", minHeight: 0, height: "100%",
  },
  chatHead: {
    height: 56, flexShrink: 0, padding: "0 14px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    borderBottom: "1px solid var(--m-outline-var)",
  },
  yMark: {
    width: 28, height: 28, borderRadius: 8,
    background: "var(--m-primary-container)",
    color: "var(--m-on-primary-container)",
    display: "grid", placeItems: "center",
    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13,
  },
  chatBody: { flex: 1, overflowY: "auto", padding: "16px 14px" },
  composer: {
    margin: 12,
    background: "var(--m-surface-on-light)",
    borderRadius: 14,
    padding: 10,
    border: "1px solid var(--m-outline-var)",
  },
  composerInput: {
    width: "100%", boxSizing: "border-box",
    border: "none", background: "transparent",
    fontSize: 13, lineHeight: 1.5, color: "var(--m-on-surface)",
    resize: "none", outline: "none", padding: "4px 6px",
    fontFamily: "var(--font-body)",
  },
  composerFoot: { marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center" },
  eyebrow: {
    fontSize: 9.5, color: "var(--m-on-surface-mid)",
    letterSpacing: "0.14em", fontWeight: 600,
    margin: "0 0 8px",
  },
  suggestionChip: {
    all: "unset",
    display: "flex", alignItems: "center", gap: 8,
    padding: "8px 12px",
    background: "var(--m-surface-2)",
    borderRadius: 10,
    fontSize: 12.5, color: "var(--m-on-surface-var)",
    cursor: "pointer", boxSizing: "border-box", width: "100%",
  },
  learnPill: {
    all: "unset",
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "7px 12px",
    background: "var(--m-primary)",
    borderRadius: 999,
    fontSize: 11.5, fontWeight: 600, color: "var(--m-on-primary)",
    cursor: "pointer",
    transition: "background 120ms ease, transform 120ms ease",
  },
};
