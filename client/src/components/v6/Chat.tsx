import { useRef, useState, type CSSProperties, type RefObject, type KeyboardEvent, type FormEvent, type ReactNode, type ChangeEvent } from "react";
import type { Message, OpenTab, StagedAction } from "./types";
import { MODEL_PREFERENCE_LABELS, type ModelPreference } from "../../lib/modelPreference";
import { V6Icon } from "./icons";

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
  showLearnLinks?: boolean;
  showEmptySuggestions?: boolean;
  onFileUpload?: (file: File) => Promise<{ name: string; size: string } | null>;
  onConfirmStagedAction?: (id: number, summary?: string) => void | Promise<void>;
  onCancelStagedAction?: (id: number) => void | Promise<void>;
}

export function V6Chat({
  thread, draft, setDraft, send, inputRef, modeLabel, onOpenTab,
  sending, streamingText, activeTool, error, modelPreference = "auto", setModelPreference,
  showLearnLinks = true, showEmptySuggestions = true, onFileUpload, onConfirmStagedAction, onCancelStagedAction,
}: ChatProps) {
  const [shareLabel, setShareLabel] = useState<"Share" | "Copied">("Share");
  const [uploading, setUploading] = useState(false);
  const [attachment, setAttachment] = useState<{ name: string; size: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isEmpty = thread.length === 0 && !sending;

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

  const openSettings = () => {
    onOpenTab({ id: "tab-settings", kind: "settings", title: "Settings" });
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

  const handleFilePick = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !onFileUpload || uploading) return;
    setUploading(true);
    try {
      const result = await onFileUpload(file);
      if (result) {
        setAttachment(result);
        setDraft(draft.trim() ? draft : `Review ${result.name} and tell me what matters.`);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={C.chat}>
      <div className="thin-scroll" style={{ ...C.chatBody, ...(isEmpty ? C.chatBodyEmpty : undefined) }}>
        {isEmpty ? (
          <V6ChatEmpty modeLabel={modeLabel} onPick={(t) => send(t)} onOpenTab={onOpenTab} showLearnLinks={showLearnLinks} showSuggestions={showEmptySuggestions} />
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
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.rtf,.md,.xlsx,.xls,.csv,.pptx,.ppt,.png,.jpg,.jpeg,.webp,.gif,.heic,.json"
          onChange={handleFilePick}
          style={{ display: "none" }}
        />
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
        {attachment && (
          <div style={C.attachmentChip}>
            <span style={C.attachmentIcon}><V6Icon name="doc" size={12} /></span>
            <span style={C.attachmentName}>{attachment.name}</span>
            <span style={C.attachmentSize}>{attachment.size}</span>
            <button type="button" style={C.attachmentRemove} onClick={() => setAttachment(null)} aria-label={`Remove ${attachment.name}`}>
              <V6Icon name="close" size={10} />
            </button>
          </div>
        )}
        <div style={C.composerFoot}>
          <div style={C.composerTools}>
            <button
              type="button"
              style={C.composerTool}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || !onFileUpload}
              title={onFileUpload ? "Upload a file" : "Sign in to upload files"}
            >
              <V6Icon name="plus" size={13} />
              <span>{uploading ? "Uploading" : "Upload"}</span>
            </button>
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
            <button type="button" style={{ ...C.composerTool, ...C.composerIconTool }} onClick={openHistory} aria-label="History" title="History">
              <V6Icon name="history" size={13} />
            </button>
            <button type="button" style={C.composerTool} onClick={copyShareLink} aria-label="Copy share link" title="Copy share link">
              <span>{shareLabel}</span>
            </button>
            <button type="button" style={{ ...C.composerTool, ...C.composerIconTool }} onClick={openSettings} aria-label="Settings" title="Settings">
              <V6Icon name="settings" size={13} />
            </button>
          </div>
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
        background: isY ? "var(--accent-soft)" : "var(--surface-2)",
        color: isY ? "var(--accent-strong)" : "var(--ink-3)",
        display: "grid", placeItems: "center",
        fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 10,
      }}>{isY ? "Y" : ">"}</div>
      <div style={{ flex: 1, minWidth: 0, paddingTop: 3 }}>
        <div style={{
          fontSize: 12.5, lineHeight: 1.55,
          color: "var(--ink)",
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
          className="wkbtn"
          style={C.stagedConfirm}
          disabled={!canAct}
          onClick={onConfirm}
        >
          Confirm
        </button>
        <button
          type="button"
          className="wkbtn"
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
        background: "var(--accent-soft)", color: "var(--accent-strong)",
        display: "grid", placeItems: "center",
        fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 10,
      }}>Y</div>
      <div style={{ flex: 1, minWidth: 0, paddingTop: 3 }}>
        {tool && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "3px 9px",
            background: "var(--surface-2)", borderRadius: 999,
            fontSize: 11, color: "var(--ink-3)", fontWeight: 500,
            marginBottom: 8,
          }}>
            <span className="pulse-dot" style={{ color: "var(--accent)" }} aria-hidden="true" />
            <span>{tool}…</span>
          </div>
        )}
        {text && (
          <div style={{
            fontSize: 12.5, lineHeight: 1.55, color: "var(--ink)",
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
      background: "var(--st-risk-bg)", color: "#4A1410",
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
  showLearnLinks: boolean;
  showSuggestions: boolean;
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
  "Studio": [
    "Create a buyer pitch book",
    "Turn open files into a QoE Preview Book",
    "Draft an IC deck from Big Fake Deal",
    "Refresh this book from models",
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
  { label: "How it works", section: "how"     },
  { label: "Pricing",      section: "pricing" },
];

function V6ChatEmpty({ modeLabel, onPick, onOpenTab, showLearnLinks, showSuggestions }: ChatEmptyProps) {
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
    <div className="m-fade-up" style={C.emptyState}>
      <div style={C.emptyIntro}>
        <h1 style={{
          fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700,
          letterSpacing: "-0.02em", lineHeight: 1.2, margin: "0 0 8px", color: "var(--ink)",
          textWrap: "balance",
        }}>
          {copy.title}
        </h1>
        <p style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--ink-3)", margin: 0, textWrap: "pretty" }}>
          {copy.body}
        </p>
      </div>

      {showSuggestions && (
        <div style={C.emptyActions}>
          <div style={C.emptySuggestionStack}>
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => onPick(s)}
                className="m-nudge-soft"
                style={C.suggestionChip}
              >
                <span style={{ color: "var(--accent)", fontSize: 11 }}>→</span>
                <span>{s}</span>
              </button>
            ))}
          </div>

          {showLearnLinks && (
            <div style={C.learnStack}>
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
          )}
        </div>
      )}
    </div>
  );
}

function emptyCopy(modeLabel: string): { title: string; body: ReactNode; eyebrow: string } {
  if (modeLabel === "Today") {
    return {
      title: "Hi, I'm Yulia, your deal desk is ready.",
      body: <>Start using the app completely for free. Use the shortcuts below to explore, or just start chatting. Feel free to learn more about the app too.</>,
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
  if (modeLabel === "Studio") {
    return {
      title: "Hi, I'm Yulia, your deal desk is ready.",
      body: "Ask me to create a pitch book, memo, model pack, or source-grounded draft from the files and deals you already have open.",
      eyebrow: "STUDIO PROMPTS",
    };
  }
  return {
    title: "Hi, I'm Yulia, your deal desk is ready.",
    body: <>Start using the app completely for free. Use the <strong style={{ color: "var(--ink)" }}>Search Ideas</strong> below to explore, or just start chatting. Feel free to learn more about the app too.</>,
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
  chatBody: { flex: 1, overflowY: "auto", padding: "8px 8px 10px" },
  chatBodyEmpty: {
    display: "flex",
    minHeight: 0,
  },
  composer: {
    margin: 8,
    background: "var(--surface)",
    borderRadius: 18,
    padding: 10,
    border: "1px solid rgba(166, 186, 212, 0.82)",
    boxShadow: [
      "0 0 0 1px rgba(255,255,255,0.58)",
      "inset 0 1px 0 rgba(255,255,255,0.96)",
      "0 12px 26px rgba(31, 55, 84, 0.075)",
      "0 2px 7px rgba(31, 55, 84, 0.065)",
    ].join(", "),
  },
  composerInput: {
    width: "100%", boxSizing: "border-box",
    border: "none", background: "transparent",
    fontSize: 13, lineHeight: 1.5, color: "var(--ink)",
    resize: "none", outline: "none", padding: "4px 6px",
    fontFamily: "var(--font-body)",
  },
  composerFoot: {
    marginTop: 6,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 8,
  },
  composerTools: {
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    flexWrap: "nowrap",
    gap: 4,
  },
  composerTool: {
    all: "unset",
    height: 26,
    boxSizing: "border-box",
    padding: "0 8px",
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    color: "var(--ink-2)",
    background: "rgba(236, 242, 249, 0.72)",
    border: "1px solid rgba(204, 217, 232, 0.72)",
    fontSize: 11,
    fontWeight: 750,
    cursor: "pointer",
  },
  composerIconTool: {
    width: 26,
    justifyContent: "center",
    padding: 0,
  },
  attachmentChip: {
    marginTop: 6,
    maxWidth: "100%",
    minHeight: 30,
    boxSizing: "border-box",
    padding: "5px 6px 5px 7px",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#F3F1EA",
    border: "1px solid rgba(198, 214, 230, 0.82)",
  },
  attachmentIcon: {
    width: 18,
    height: 18,
    borderRadius: 6,
    display: "grid",
    placeItems: "center",
    color: "#8B867A",
    background: "#FFFFFF",
  },
  attachmentName: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "var(--ink)",
    fontSize: 11.5,
    fontWeight: 800,
  },
  attachmentSize: {
    flexShrink: 0,
    color: "var(--ink-2)",
    fontSize: 10.5,
    fontWeight: 650,
  },
  attachmentRemove: {
    all: "unset",
    width: 18,
    height: 18,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    color: "var(--ink-2)",
    cursor: "pointer",
  },
  modelSelect: {
    height: 26,
    maxWidth: 92,
    border: "1px solid rgba(204, 217, 232, 0.72)",
    borderRadius: 999,
    background: "rgba(236, 242, 249, 0.72)",
    color: "var(--ink)",
    padding: "0 7px",
    fontSize: 11,
    fontWeight: 800,
    outline: "none",
  },
  eyebrow: {
    fontSize: 9.5, color: "var(--ink-2)",
    letterSpacing: "0.14em", fontWeight: 600,
    margin: "0 0 8px",
  },
  emptyState: {
    width: "100%",
    minHeight: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  emptyIntro: {
    flex: "0 0 auto",
  },
  emptyActions: {
    marginTop: "auto",
    display: "grid",
    gap: 10,
    paddingTop: 12,
  },
  emptySuggestionStack: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  learnStack: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  suggestionChip: {
    all: "unset",
    display: "flex", alignItems: "center", gap: 8,
    padding: "8px 12px",
    background: "#FFFFFF",
    borderRadius: 12,
    fontSize: 12.5, color: "var(--ink-3)",
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
    fontSize: 11.5, fontWeight: 700, color: "var(--ink)",
    cursor: "pointer",
    boxShadow: "0 10px 22px -18px rgba(31,44,69,0.32), inset 0 1px 0 rgba(255,255,255,0.74)",
    backdropFilter: "none",
    WebkitBackdropFilter: "none",
    transition: "background 120ms ease, transform 120ms ease, box-shadow 120ms ease",
  },
  stagedCard: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    background: "var(--surface)",
    border: "1px solid #ECE9DF",
    boxShadow: "0 12px 28px rgba(31, 44, 69, 0.10)",
  },
  stagedEyebrow: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    letterSpacing: "0.15em",
    fontWeight: 700,
    color: "var(--accent)",
    marginBottom: 5,
  },
  stagedTitle: {
    fontSize: 13.5,
    fontWeight: 750,
    color: "var(--ink)",
    lineHeight: 1.2,
  },
  stagedSummary: {
    marginTop: 4,
    fontSize: 11.5,
    lineHeight: 1.45,
    color: "var(--ink-3)",
  },
  stagedRisk: {
    flexShrink: 0,
    padding: "4px 8px",
    borderRadius: 999,
    background: "#F3F1EA",
    color: "#57534A",
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
    background: "#2BFF77",
    color: "#00210F",
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
