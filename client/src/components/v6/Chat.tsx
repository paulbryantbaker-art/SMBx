import { useState, type CSSProperties, type RefObject, type KeyboardEvent, type FormEvent, type ReactNode } from "react";
import type { Message, OpenTab, StagedAction } from "./types";
import { MODEL_PREFERENCE_LABELS, type ModelPreference } from "../../lib/modelPreference";

interface ChatProps {
  thread: Message[];
  draft: string;
  setDraft: (v: string) => void;
  send: (text?: string) => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  modeLabel: string;
  onOpenTab: OpenTab;
  sending?: boolean;
  streamingText?: string;
  activeTool?: string | null;
  error?: string | null;
  modelPreference?: ModelPreference;
  setModelPreference?: (value: ModelPreference) => void;
  onConfirmStagedAction?: (id: number, summary?: string) => void | Promise<void>;
  onCancelStagedAction?: (id: number) => void | Promise<void>;
}

export function V6Chat({
  thread, draft, setDraft, send, inputRef, modeLabel, onOpenTab,
  sending, streamingText, activeTool, error, modelPreference = "auto", setModelPreference,
  onConfirmStagedAction, onCancelStagedAction,
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
        <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
          {setModelPreference && (
            <select
              value={modelPreference}
              onChange={(e) => setModelPreference(e.target.value as ModelPreference)}
              aria-label="Yulia model preference"
              title="Yulia model preference"
              style={C.modelSelect}
            >
              {(Object.keys(MODEL_PREFERENCE_LABELS) as ModelPreference[]).map(key => (
                <option key={key} value={key}>{MODEL_PREFERENCE_LABELS[key]}</option>
              ))}
            </select>
          )}
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

      <div className="thin-scroll" style={C.chatBody}>
        {thread.length === 0 && !sending ? (
          <V6ChatEmpty modeLabel={modeLabel} onPick={(t) => send(t)} onOpenTab={onOpenTab} />
        ) : (
          <>
            {thread.map((m, i) => (
              <V6Msg
                key={i}
                who={m.who}
                text={m.text}
                stagedAction={m.stagedAction}
                onConfirmStagedAction={onConfirmStagedAction}
                onCancelStagedAction={onCancelStagedAction}
              />
            ))}
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

function V6Msg({
  who,
  text,
  stagedAction,
  onConfirmStagedAction,
  onCancelStagedAction,
}: Message & {
  onConfirmStagedAction?: (id: number, summary?: string) => void | Promise<void>;
  onCancelStagedAction?: (id: number) => void | Promise<void>;
}) {
  const isY = who === "y";
  const canAct = !!stagedAction?.id;
  return (
    <div className="m-fade-up" style={{ display: "flex", gap: 10, marginBottom: 14 }}>
      <div style={{
        width: 24, height: 24, flexShrink: 0, borderRadius: 7,
        background: isY ? "var(--m-primary-container)" : "var(--m-surface-2)",
        color: isY ? "var(--m-on-primary-container)" : "var(--m-on-surface-var)",
        display: "grid", placeItems: "center",
        fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 10,
      }}>{isY ? "Y" : ">"}</div>
      <div style={{ flex: 1, minWidth: 0, paddingTop: 3 }}>
        <div style={{
          fontSize: 12.5, lineHeight: 1.55,
          color: "var(--m-on-surface)",
          whiteSpace: "pre-wrap", textWrap: "pretty",
        }}>{text}</div>
        {stagedAction && (
          <StagedActionCard
            action={stagedAction}
            canAct={canAct}
            onConfirm={() => {
              if (stagedAction.id) void onConfirmStagedAction?.(stagedAction.id, stagedAction.summary);
            }}
            onCancel={() => {
              if (stagedAction.id) void onCancelStagedAction?.(stagedAction.id);
            }}
          />
        )}
      </div>
    </div>
  );
}

function StagedActionCard({
  action,
  canAct,
  onConfirm,
  onCancel,
}: {
  action: StagedAction;
  canAct: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div style={C.stagedCard}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
        <div style={{ minWidth: 0 }}>
          <div style={C.stagedEyebrow}>STAGED ACTION</div>
          <div style={C.stagedTitle}>{action.label}</div>
          <div style={C.stagedSummary}>{action.summary}</div>
        </div>
        <span style={C.stagedRisk}>{(action.riskLevel || "approval").replace(/_/g, " ")}</span>
      </div>
      <div style={C.stagedActions}>
        <button
          type="button"
          className="m-btn"
          style={C.stagedConfirm}
          disabled={!canAct}
          onClick={onConfirm}
        >
          Confirm
        </button>
        <button
          type="button"
          className="m-btn text"
          style={C.stagedCancel}
          disabled={!canAct}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

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
  "Today": [
    "What is worth my next 10 minutes?",
    "Review the IOI draft with me",
    "Show files that need my eye",
    "What changed in the pipeline today?",
    "Draft my buyer follow-up",
  ],
  "Pipeline": [
    "Rank my pipeline by what matters today",
    "Which deals should I pursue, watch, or pass?",
    "Open the files behind Big Fake Deal",
    "What changed in Pest Control FL?",
    "Prepare the next buyer touch",
  ],
  "Search": [
    "Find buyers for Big Fake Deal",
    "Build a target list from my HVAC thesis",
    "Map PE firms active in pest control",
    "Find SBA and senior debt lenders",
    "Find M&A attorneys near Austin",
  ],
  "Files": [
    "Show files that need my eye",
    "Open Big Fake Deal's data room",
    "What is private versus shared?",
    "Find executed documents",
    "List active data rooms",
  ],
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
  const copy = emptyCopy(modeLabel);

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
        {copy.title}
      </h1>
      <p style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--m-on-surface-var)", margin: "0 0 14px", textWrap: "pretty" }}>
        {copy.body}
      </p>

      <div className="mono" style={C.eyebrow}>{copy.eyebrow} · {modeLabel.toUpperCase()}</div>
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
          >
            <span style={{ fontSize: 10, opacity: 0.85 }}>↗</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function emptyCopy(modeLabel: string): { title: string; body: ReactNode; eyebrow: string } {
  if (modeLabel === "Today") {
    return {
      title: "The desk is ready.",
      body: "Ask for the next move, open a draft, or turn this page into a tighter action list.",
      eyebrow: "TODAY PROMPTS",
    };
  }
  if (modeLabel === "Pipeline") {
    return {
      title: "Rank the pipeline.",
      body: "Ask what moved, what deserves attention, or which deal should be pursue, watch, or pass.",
      eyebrow: "PIPELINE PROMPTS",
    };
  }
  if (modeLabel === "Search") {
    return {
      title: "Search the market.",
      body: "Find buyers, buyer pools, targets, PE firms, lenders, and deal professionals from a plain-language thesis.",
      eyebrow: "SEARCH IDEAS",
    };
  }
  if (modeLabel === "Files") {
    return {
      title: "Find the right file.",
      body: "Ask what is private, what is in a data room, what needs review, or which executed docs are locked.",
      eyebrow: "FILE PROMPTS",
    };
  }
  return {
    title: "Hi there. Yulia can walk you through one of your deals right now - for free.",
    body: <>Start using the app completely for free. Use the <strong style={{ color: "var(--m-on-surface)" }}>Search Ideas</strong> below to explore, or just start chatting. Feel free to learn more about the app too.</>,
    eyebrow: "SEARCH IDEAS",
  };
}

const C: Record<string, CSSProperties> = {
  chat: {
    /* Card chrome (own gradient bg, border, radius, inset highlights)
       moved up to V6App's A.leftRail — Sidebar + chat share one surface
       now. This column is transparent so the rail bg shows through.
       Only layout properties (flex/overflow/min-height) remain. */
    background: "transparent",
    overflow: "hidden",
    display: "flex", flexDirection: "column", minHeight: 0, height: "100%",
  },
  chatHead: {
    height: 58, flexShrink: 0, padding: "0 14px",
    display: "flex", alignItems: "center", justifyContent: "flex-end",
    /* Frosted backdrop + bottom border removed — sidebar + chat now sit
       directly on the page bg (Canva pattern). The Auto/History/Share
       buttons float on the page gradient like everything else. */
    background: "transparent",
  },
  chatBody: { flex: 1, overflowY: "auto", padding: "18px 14px" },
  composer: {
    margin: 12,
    background: "var(--m-surface-on-light)",
    borderRadius: 18,
    padding: 10,
    border: "1px solid #D9E3EF",
    boxShadow: "0 20px 42px rgba(31, 55, 84, 0.11), inset 0 1px 0 rgba(255,255,255,0.72)",
  },
  composerInput: {
    width: "100%", boxSizing: "border-box",
    border: "none", background: "transparent",
    fontSize: 13, lineHeight: 1.5, color: "var(--m-on-surface)",
    resize: "none", outline: "none", padding: "4px 6px",
    fontFamily: "var(--font-body)",
  },
  composerFoot: { marginTop: 4, display: "flex", justifyContent: "flex-end", alignItems: "center" },
  modelSelect: {
    height: 28,
    maxWidth: 94,
    border: "1px solid var(--m-outline-var)",
    borderRadius: 999,
    background: "var(--m-surface-1)",
    color: "var(--m-on-surface)",
    padding: "0 8px",
    fontSize: 11.5,
    fontWeight: 700,
    outline: "none",
  },
  eyebrow: {
    fontSize: 9.5, color: "var(--m-on-surface-mid)",
    letterSpacing: "0.14em", fontWeight: 600,
    margin: "0 0 8px",
  },
  suggestionChip: {
    all: "unset",
    display: "flex", alignItems: "center", gap: 8,
    padding: "8px 12px",
    background: "#FFFFFF",
    borderRadius: 12,
    fontSize: 12.5, color: "var(--m-on-surface-var)",
    cursor: "pointer", boxSizing: "border-box", width: "100%",
    border: "1px solid rgba(215,222,236,0.72)",
  },
  learnPill: {
    all: "unset",
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "7px 12px",
    background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(214,225,240,0.86)",
    borderRadius: 999,
    fontSize: 11.5, fontWeight: 700, color: "var(--m-on-surface)",
    cursor: "pointer",
    boxShadow: "0 10px 22px -18px rgba(31,44,69,0.32), inset 0 1px 0 rgba(255,255,255,0.74)",
    backdropFilter: "blur(8px) saturate(170%) contrast(1.04)",
    WebkitBackdropFilter: "blur(8px) saturate(170%) contrast(1.04)",
    transition: "background 120ms ease, transform 120ms ease, box-shadow 120ms ease",
  },
  stagedCard: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    background: "linear-gradient(180deg, #FFFFFF 0%, #F8FBFF 100%)",
    border: "1px solid #D9E4F1",
    boxShadow: "0 12px 28px rgba(31, 44, 69, 0.10)",
  },
  stagedEyebrow: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    letterSpacing: "0.15em",
    fontWeight: 700,
    color: "var(--m-primary)",
    marginBottom: 5,
  },
  stagedTitle: {
    fontSize: 13.5,
    fontWeight: 750,
    color: "var(--m-on-surface)",
    lineHeight: 1.2,
  },
  stagedSummary: {
    marginTop: 4,
    fontSize: 11.5,
    lineHeight: 1.45,
    color: "var(--m-on-surface-var)",
  },
  stagedRisk: {
    flexShrink: 0,
    padding: "4px 8px",
    borderRadius: 999,
    background: "#EEF3FA",
    color: "#5D6A7D",
    fontSize: 10.5,
    fontWeight: 700,
    textTransform: "capitalize",
  },
  stagedActions: {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
    marginTop: 12,
  },
  stagedConfirm: {
    height: 30,
    padding: "0 13px",
    borderRadius: 999,
    background: "#D6A653",
    color: "#fff",
    border: "none",
    fontSize: 11.5,
    fontWeight: 800,
  },
  stagedCancel: {
    height: 30,
    padding: "0 10px",
    borderRadius: 999,
    fontSize: 11.5,
    fontWeight: 700,
  },
};
