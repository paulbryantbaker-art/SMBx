/* V3 — chat thread with three-door welcome, plus document canvas.
   Port of dist/source/v3-chat.jsx. */
import { useState, useEffect, useRef, type CSSProperties, type RefObject } from "react";
import { CanvasPane } from "./Canvas";

export type Mode = "welcome" | "watch" | "explore" | "start" | "learn";

export interface Message {
  who: "y" | "u";
  text: string;
  delay?: number;
}

interface V3WorkspaceProps {
  onSlash: (cmd: string) => void;
}

export function V3Workspace({ onSlash }: V3WorkspaceProps) {
  const [mode, setMode] = useState<Mode>("welcome");
  const [thread, setThread] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [demoStep, setDemoStep] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Demo orchestration when user clicks "Watch"
  useEffect(() => {
    if (mode !== "watch") return;
    const beats: Message[] = [
      { who: "y", text: "I just received a teaser. Industrial services co, East Texas. $5.4M revenue. Watch what I do.", delay: 800 },
      { who: "y", text: "Step 1 — recasting the P&L. Owner comp $740K → market $400K. Personal vehicle. Family payroll. One-time legal. Normalized SDE: $1.80M.", delay: 2400 },
      { who: "y", text: "Step 2 — multi-scenario baseline. SBA-clear at 7.0× SDE = $7.8M. Range $7.2–9.4M. Asset deal beats stock by $340K after-tax.", delay: 2400 },
      { who: "y", text: "Step 3 — flagged. 38% top-5 concentration, but zero churn in 6 years. Reading that as moat, not risk. NWC peg below median — flag for QoE.", delay: 2400 },
      { who: "y", text: "Verdict: PURSUE. Want me to draft the IOI?", delay: 1800 },
    ];
    let mounted = true;
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (!mounted || i >= beats.length) return;
      setThread((p) => [...p, beats[i]]);
      setDemoStep(i + 1);
      i++;
      timer = setTimeout(tick, beats[i]?.delay ?? 1500);
    };
    timer = setTimeout(tick, 600);
    return () => { mounted = false; clearTimeout(timer); };
  }, [mode]);

  useEffect(() => { if (mode === "start") inputRef.current?.focus(); }, [mode]);

  const send = (t?: string) => {
    const msg = (t || draft).trim();
    if (!msg) return;
    setThread((p) => [...p, { who: "u", text: msg }]);
    setDraft("");
    setTimeout(() => {
      setThread((p) => [...p, { who: "y", text: "On it — give me 40 seconds. I'll write back here, the canvas will fill in on the right." }]);
    }, 700);
  };

  // Used by suggestion chips and chrome buttons — posts the user msg + a canned reply.
  const sendPair = (q: string, a: string) => {
    setThread((p) => [...p, { who: "u", text: q }]);
    setTimeout(() => {
      setThread((p) => [...p, { who: "y", text: a }]);
    }, 700);
  };

  return (
    <div style={vw.split}>
      <ChatPane
        mode={mode}
        setMode={setMode}
        thread={thread}
        draft={draft}
        setDraft={setDraft}
        send={send}
        sendPair={sendPair}
        inputRef={inputRef}
        onSlash={onSlash}
      />
      <CanvasPane mode={mode} demoStep={demoStep} sendPair={sendPair} />
    </div>
  );
}

interface ChatPaneProps {
  mode: Mode;
  setMode: (m: Mode) => void;
  thread: Message[];
  draft: string;
  setDraft: (s: string) => void;
  send: (t?: string) => void;
  sendPair: (q: string, a: string) => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onSlash: (cmd: string) => void;
}

function ChatPane({ mode, setMode, thread, draft, setDraft, send, sendPair, inputRef, onSlash }: ChatPaneProps) {
  return (
    <div style={vw.chat}>
      <div style={vw.chatHead}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>Yulia</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <span className="pulse-dot" style={{ color: "var(--go)" }} />
              <span className="eyebrow" style={{ fontSize: 9 }}>online · M&amp;A analyst</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            style={vw.headBtn}
            onClick={() => sendPair(
              "Show me deal history.",
              "Here's everything you've worked with me on so far. In a paid workspace this opens the deal sidebar — every deal, every conversation, every deliverable, searchable. (Demo: only the Big Fake Deal is loaded right now.)"
            )}
          >
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4"/><path d="M7 4v3l2 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            History
          </button>
          <button
            style={vw.headBtn}
            onClick={() => sendPair(
              "Share this conversation.",
              "Generated a read-only link. In a paid workspace this would email the link to whoever you choose — analyst, attorney, partner — with redaction options for confidentiality. (Demo: link wouldn't actually resolve.)"
            )}
          >
            Share
          </button>
        </div>
      </div>

      <div className="thin-scroll" style={vw.chatBody}>
        {mode === "welcome" && (
          <Welcome setMode={setMode} />
        )}

        {mode !== "welcome" && (
          <ModeBanner mode={mode} setMode={setMode} />
        )}

        {thread.map((m, i) => (
          <V3Msg key={i} who={m.who} text={m.text} />
        ))}

        {mode === "explore" && thread.length === 0 && (
          <ExploreState sendPair={sendPair} />
        )}

        {mode === "start" && thread.length === 0 && (
          <StartState />
        )}

        {mode === "learn" && thread.length === 0 && (
          <LearnState sendPair={sendPair} />
        )}
      </div>

      <V3Composer
        draft={draft}
        setDraft={setDraft}
        send={send}
        inputRef={inputRef}
        disabled={mode === "watch"}
      />
    </div>
  );
}

// ── Welcome — three doors + LearnDoc door ─────────────────────────────
function Welcome({ setMode }: { setMode: (m: Mode) => void }) {
  return (
    <div className="fade-up" style={vw.welcome}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span className="pulse-dot" style={{ color: "var(--go)" }} />
        <span className="eyebrow eyebrow-go" style={{ fontSize: 9.5 }}>YULIA · M&amp;A ANALYST · ONLINE</span>
      </div>

      <h1 style={vw.welcomeTitle}>
        I make M&amp;A easier and faster.
      </h1>
      <p style={vw.welcomeSub}>
        Hi, I'm Yulia. <strong style={{ color: "var(--ink)", fontWeight: 600 }}>Let's get deals done.</strong>
      </p>
      <p style={{ ...vw.welcomeSub, marginTop: 10, color: "var(--ink-2)", fontSize: 13 }}>
        I lead and manage dealflow, intelligence, and deliverables — so you can focus on the relationships and the outcomes.
      </p>
      <p style={{ ...vw.welcomeSub, marginTop: 12, color: "var(--ink-3)", fontSize: 12.5 }}>
        Pick a card to see dealflow examples. Start chatting anytime.
      </p>

      <div style={vw.doors}>
        <DoorCard
          tag="01"
          title="Watch a demo"
          desc="I'll work a real teaser end-to-end. 90 seconds. Hands off."
          cta="Start demo"
          accent
          onClick={() => setMode("watch")}
        />
        <DoorCard
          tag="02"
          title="Explore a sample deal"
          desc="Open a finished deal I closed last week. Click around at your pace."
          cta="Open sample"
          onClick={() => setMode("explore")}
        />
        <DoorCard
          tag="03"
          title="Start with my own"
          desc="Paste a teaser, a P&L, or describe a deal. I'll begin."
          cta="Open composer"
          onClick={() => setMode("start")}
        />
      </div>

      {/* Learn more — secondary door */}
      <div style={vw.learnSect}>
        <div style={vw.learnSectHead}>
          <span className="eyebrow" style={{ fontSize: 9.5 }}>LEARN MORE</span>
          <span style={vw.learnSectRule} />
        </div>
        <DoorCard
          tag="04"
          title="How it works · Pricing"
          desc="The pattern, the restraint, and what it costs. Opens on the right."
          cta="Open document"
          muted
          onClick={() => setMode("learn")}
        />
      </div>

      <div style={vw.welcomeFoot}>
        <span className="eyebrow" style={{ fontSize: 9.5 }}>FREE · NO CARD · 1 DEAL</span>
        <span style={{ color: "var(--ink-4)" }}>·</span>
        <span className="eyebrow" style={{ fontSize: 9.5 }}>SOC 2 · ENCRYPTED</span>
        <span style={{ color: "var(--ink-4)" }}>·</span>
        <span className="eyebrow" style={{ fontSize: 9.5 }}>$2.4B SCREENED</span>
      </div>
    </div>
  );
}

interface DoorCardProps {
  tag: string;
  title: string;
  desc: string;
  cta: string;
  accent?: boolean;
  muted?: boolean;
  onClick: () => void;
}

function DoorCard({ tag, title, desc, cta, accent, muted, onClick }: DoorCardProps) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...vw.door,
        ...(accent ? vw.doorAccent : null),
        ...(muted ? vw.doorMuted : null),
        ...(hover ? vw.doorHover : null),
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span className="mono" style={{
          fontSize: 10.5,
          color: accent ? "var(--go)" : muted ? "var(--cta)" : "var(--ink-4)",
          letterSpacing: "0.1em",
        }}>
          {tag}
        </span>
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" style={{
          color: accent ? "var(--go)" : muted ? "var(--cta)" : "var(--ink-3)",
          transform: hover ? "translate(2px, -2px)" : "translate(0, 0)",
          transition: "transform 180ms cubic-bezier(0.2,0.7,0.2,1)",
        }}>
          <path d="M3 11L11 3M11 3H5M11 3V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={{
        fontFamily: "var(--font-display)",
        fontWeight: 600, fontSize: 15,
        letterSpacing: "-0.01em",
        color: "var(--ink)",
        marginBottom: 4,
      }}>{title}</div>
      <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5, marginBottom: 12 }}>
        {desc}
      </div>
      <div style={{
        fontSize: 11.5, fontWeight: 500,
        color: accent ? "var(--go)" : muted ? "var(--cta)" : "var(--ink-2)",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        {cta}
        <span aria-hidden>→</span>
      </div>
    </button>
  );
}

function ModeBanner({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  const labels: Record<Exclude<Mode, "welcome">, { tag: string; note: string }> = {
    watch: { tag: "Demo running", note: "Yulia is working — sit back" },
    explore: { tag: "Big Fake Deal", note: "Sample · industrial services · closed" },
    start: { tag: "New deal", note: "Composer is yours" },
    learn: { tag: "Learn more", note: "How it works · Pricing — open on the right" },
  };
  if (mode === "welcome") return null;
  const l = labels[mode];
  return (
    <div style={vw.banner}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className="pulse-dot" style={{ color: "var(--go)" }} />
        <span className="eyebrow eyebrow-go" style={{ fontSize: 9.5 }}>{l.tag}</span>
        <span style={{ color: "var(--ink-4)" }}>·</span>
        <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{l.note}</span>
      </div>
      <button onClick={() => setMode("welcome")} style={vw.bannerBack}>← back</button>
    </div>
  );
}

function ExploreState({ sendPair }: { sendPair: (q: string, a: string) => void }) {
  const prompts: Array<[string, string]> = [
    [
      "Why pursue?",
      "Three reasons. (1) Recast EBITDA at $1.80M is real — $740K of owner comp normalized to a $400K market wage, $180K in personal vehicle and family payroll backed out, $60K of one-time legal. Defensible against six years of returns. (2) The concentration looks worse than it is — 38% top-5 by revenue, but zero customer churn over six years and the largest account is 22 months into a five-year MSA. Reading that as moat, not risk. (3) SBA-clear at 7.0× SDE, $7.8M ask. Range $7.2–9.4M. Asset deal beats stock by $340K after-tax assuming buyer can use the §197 amortization."
    ],
    [
      "How did you handle the concentration risk?",
      "Two-part answer. In the diligence framing, I led with the contract length and the zero-churn history — that flips the lender narrative from \"single-customer risk\" to \"defensible book.\" In the structure, I pegged a 25% holdback for 18 months tied to renewal of the top-3 contracts, with a sliding-scale earnout if any one of them doesn't renew. Buyer gets protection. Seller gets paid the day the contracts re-up."
    ],
    [
      "Show the buyer list",
      "Built the universe across three lanes. Tier-1 financial: 14 PE platforms in industrial services with sub-$10M EBITDA platform mandates — eight already own a portfolio company in an adjacent vertical. Tier-2 strategic: six regional consolidators in East Texas / Louisiana / Arkansas. Tier-3 SBA-eligible operators: four searchers actively in market. Pursuit-rate scoring on each based on their last six closes. Top of the buyer tree is on the canvas right →"
    ],
    [
      "Walk me through the recast",
      "Started with the trailing-twelve P&L: $5.41M revenue, reported EBITDA $1.06M. Three normalization buckets. Bucket one — owner comp: founder pulled $740K (W-2 + S-corp distributions), market replacement is a $380–420K GM, settled on $400K. +$340K. Bucket two — personal: vehicle lease ($14K), spouse on payroll non-working ($72K), country club ($18K), legal one-time for the partnership unwind ($58K), seller's CPA recast fees ($24K). +$186K, all defended against the actual invoices. Bucket three — run-rate adjustments: lost a customer in month 8 last year, one-time write-off of receivable, LIFO-to-FIFO normalization. +$210K. Recast SDE lands at $1.80M. Working capital pegged at $740K against a 13-month average."
    ],
  ];
  return (
    <div className="fade-up">
      <V3Msg who="y" text="Big Fake Deal loaded on the right — sample industrial services co, East Texas. $5.4M revenue, closed at $7.8M. Names changed; numbers preserved. Ask me anything about it, or try one of these:" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
        {prompts.map(([q, a]) => (
          <button key={q} style={vw.suggestion} onClick={() => sendPair(q, a)}>{q}</button>
        ))}
      </div>
    </div>
  );
}

function StartState() {
  return (
    <div className="fade-up">
      <V3Msg who="y" text="Empty workspace ready. Paste anything — a teaser PDF, a tax return, a P&L, a few sentences describing a deal. I'll figure it out from there." />
    </div>
  );
}

function LearnState({ sendPair }: { sendPair: (q: string, a: string) => void }) {
  const prompts: Array<[string, string]> = [
    [
      "What's the difference between Starter and Pro?",
      "Starter is $49/mo — one live deal at a time, every paid feature, no QofE Lite, no parallel-deal pipeline view, no API. For a solo operator running one deal at a time. Pro is $149/mo — unlimited concurrent deals, the full associate desk (QofE Lite, 22-gate scoring, sector-tuned buyer universes, audience-variant memos, cap table + waterfall, CEPA scoring), API access. For an active dealmaker. The product is the same Yulia in both — Pro just unlocks the heavier work."
    ],
    [
      "What won't you do?",
      "Three things. (1) I won't sign or send anything on your behalf — every document goes back to you for review, every send is your finger on the trigger. (2) I won't run escrow or hold funds — that goes through your attorney, always. (3) I won't give you a single number when the honest answer is a range. Every output comes with the methodology behind it. We sit on the software side of SEC Rule 15(b)(13); the rest is your judgment, your relationships, your call."
    ],
    [
      "Show the example deal",
      "Switch to the sample deal — top of the sidebar, \"Big Fake Deal\". I've got the recast, the buyer tree, the structure model, and the Pursue verdict ready to walk through. Or stay on this doc and I'll narrate the pieces from here."
    ],
    [
      "Why no success fees?",
      "Two reasons. Practical: success fees create perverse incentives — I'd push you toward the deal that closes, not the deal that's right for you. Yours might be \"don't do this deal\" and I should be willing to say it. Structural: I'm not a broker-dealer and I don't want to be — that's what your attorney and your advisor are for. The subscription is the entire cost; the work is the same whether the deal closes, breaks, or restructures three times before close."
    ],
  ];
  return (
    <div className="fade-up">
      <V3Msg who="y" text="Opened the How it works · Pricing doc on the right. Skim it, or ask me anything below. The Big Fake Deal is also still here when you're ready." />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
        {prompts.map(([q, a]) => (
          <button key={q} style={vw.suggestion} onClick={() => sendPair(q, a)}>{q}</button>
        ))}
      </div>
    </div>
  );
}

function V3Msg({ who, text }: { who: "y" | "u"; text: string }) {
  const isY = who === "y";
  return (
    <div className="fade-up" style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
        <span className="eyebrow" style={{ fontSize: 9, color: isY ? "var(--go)" : "var(--ink-3)" }}>
          {isY ? "YULIA" : "YOU"}
        </span>
        <span className="mono" style={{ fontSize: 9.5, color: "var(--ink-4)" }}>
          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
      <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--ink)" }}>
        {text}
      </div>
    </div>
  );
}

interface V3ComposerProps {
  draft: string;
  setDraft: (s: string) => void;
  send: () => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  disabled: boolean;
}

function V3Composer({ draft, setDraft, send, inputRef, disabled }: V3ComposerProps) {
  return (
    <form style={vw.composer} onSubmit={(e) => { e.preventDefault(); send(); }}>
      <div style={vw.composerBody}>
        <textarea
          ref={inputRef}
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={disabled ? "Demo running — back when she's done" : "Message Yulia, paste a deal, or type / for commands…"}
          disabled={disabled}
          style={{
            ...vw.composerInput,
            opacity: disabled ? 0.5 : 1,
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
          }}
        />
        <div style={vw.composerFoot}>
          <div style={{ display: "flex", gap: 4 }}>
            <button type="button" style={vw.cBtn} title="Attach">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M9 4v6a2 2 0 01-4 0V3.5a1.5 1.5 0 013 0V9a1 1 0 01-2 0V4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </button>
            <button type="button" style={vw.cBtn} title="Commands">
              <span className="mono" style={{ fontSize: 11 }}>/</span>
            </button>
            <span style={vw.cDivider} />
            <span className="mono" style={{ fontSize: 10, color: "var(--ink-4)", padding: "0 6px", display: "flex", alignItems: "center" }}>
              ↵ send · ⇧↵ newline
            </span>
          </div>
          <button
            type="submit"
            disabled={disabled}
            className="btn btn-ghost"
            style={{
              padding: "6px 12px",
              fontSize: 12,
              background: "var(--surface-2)",
              borderColor: "var(--line-2)",
              color: "var(--ink-2)",
              opacity: disabled ? 0.4 : 1,
            }}
          >
            Send
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </form>
  );
}

const vw: Record<string, CSSProperties> = {
  split: {
    display: "grid",
    gridTemplateColumns: "minmax(380px, 480px) minmax(0, 1fr)",
    flex: 1, minHeight: 0,
  },
  chat: {
    background: "var(--surface-2)",
    borderRight: "1px solid var(--line)",
    display: "flex", flexDirection: "column",
    minHeight: 0,
  },
  chatHead: {
    padding: "11px 16px",
    borderBottom: "1px solid var(--line)",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: "var(--panel)",
  },
  headBtn: {
    all: "unset", padding: "5px 10px",
    border: "1px solid var(--line-2)", borderRadius: 5,
    background: "var(--surface)",
    fontSize: 11.5, color: "var(--ink-2)", cursor: "pointer",
    display: "inline-flex", alignItems: "center", gap: 5,
  },
  chatBody: { flex: 1, overflowY: "auto", padding: "20px 18px" },

  welcome: {
    paddingBottom: 8,
  },
  welcomeTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 24, fontWeight: 600,
    letterSpacing: "-0.025em",
    color: "var(--ink)",
    margin: "0 0 8px",
  },
  welcomeSub: {
    fontSize: 13.5, lineHeight: 1.6,
    color: "var(--ink-2)",
    margin: 0,
    textWrap: "pretty",
  },
  doors: {
    display: "flex", flexDirection: "column", gap: 8,
    marginTop: 18,
  },
  door: {
    all: "unset",
    display: "block", boxSizing: "border-box",
    width: "100%",
    textAlign: "left",
    background: "var(--surface)",
    border: "1px solid var(--line)",
    borderRadius: 8,
    padding: "14px 16px",
    cursor: "pointer",
    transition: "border-color 120ms, background 120ms, transform 120ms",
  },
  doorAccent: {
    background: "linear-gradient(135deg, var(--go-soft), transparent 70%), var(--surface)",
    borderColor: "var(--go-ring)",
  },
  doorHover: {
    background: "var(--surface-2)",
    borderColor: "var(--line-2)",
  },
  doorMuted: {
    background: "linear-gradient(135deg, var(--cta-soft), transparent 70%), var(--surface)",
    borderColor: "var(--cta-ring)",
    borderStyle: "dashed",
  },
  learnSect: {
    marginTop: 16,
    width: "100%",
    display: "block",
  },
  learnSectHead: {
    display: "flex", alignItems: "center", gap: 10,
    marginBottom: 8,
  },
  learnSectRule: {
    flex: 1, height: 1,
    background: "var(--line)",
  },
  welcomeFoot: {
    marginTop: 18, paddingTop: 14,
    borderTop: "1px dashed var(--line)",
    display: "flex", alignItems: "center", gap: 10,
    color: "var(--ink-3)",
  },

  banner: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "8px 12px",
    background: "var(--surface)",
    border: "1px solid var(--line)",
    borderRadius: 6,
    marginBottom: 16,
  },
  bannerBack: {
    all: "unset", fontSize: 11, color: "var(--ink-3)",
    cursor: "pointer", padding: "3px 7px",
    borderRadius: 4,
  },

  suggestion: {
    all: "unset", padding: "5px 10px",
    background: "var(--surface)", border: "1px solid var(--line-2)",
    borderRadius: 999,
    fontSize: 11.5, color: "var(--ink-2)", cursor: "pointer",
  },

  composer: {
    margin: 12,
    background: "var(--surface)",
    border: "1px solid var(--line-2)",
    borderRadius: 8,
    transition: "border-color 120ms",
  },
  composerBody: { padding: 10 },
  composerInput: {
    width: "100%", boxSizing: "border-box",
    border: "none", background: "transparent",
    fontSize: 13.5, lineHeight: 1.5,
    color: "var(--ink)", resize: "none", outline: "none",
    padding: "4px 6px",
  },
  composerFoot: {
    marginTop: 6, display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  cBtn: {
    all: "unset", padding: "4px 8px",
    color: "var(--ink-3)", cursor: "pointer",
    borderRadius: 4,
    display: "inline-flex", alignItems: "center",
  },
  cDivider: {
    width: 1, alignSelf: "stretch", margin: "2px 4px",
    background: "var(--line)",
  },
};
