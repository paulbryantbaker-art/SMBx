/* V3 — chat thread with three-door welcome, plus document canvas. */
const { useState: v3cS, useEffect: v3cE, useRef: v3cR } = React;

function V3Workspace({ onSlash }) {
  const [mode, setMode] = v3cS("welcome"); // welcome | watch | explore | start
  const [thread, setThread] = v3cS([]);
  const [draft, setDraft] = v3cS("");
  const [demoStep, setDemoStep] = v3cS(0);
  const inputRef = v3cR(null);

  // Demo orchestration when user clicks "Watch"
  v3cE(() => {
    if (mode !== "watch") return;
    const beats = [
      { who: "y", text: "I just received a teaser. Industrial services co, East Texas. $5.4M revenue. Watch what I do." , delay: 800 },
      { who: "y", text: "Step 1 — recasting the P&L. Owner comp $740K → market $400K. Personal vehicle. Family payroll. One-time legal. Normalized SDE: $1.80M.", delay: 2400 },
      { who: "y", text: "Step 2 — multi-scenario baseline. SBA-clear at 7.0× SDE = $7.8M. Range $7.2–9.4M. Asset deal beats stock by $340K after-tax.", delay: 2400 },
      { who: "y", text: "Step 3 — flagged. 38% top-5 concentration, but zero churn in 6 years. Reading that as moat, not risk. NWC peg below median — flag for QoE.", delay: 2400 },
      { who: "y", text: "Verdict: PURSUE. Want me to draft the IOI?", delay: 1800 },
    ];
    let mounted = true;
    let i = 0;
    let timer;
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

  v3cE(() => { if (mode === "start") inputRef.current?.focus(); }, [mode]);

  const send = (t) => {
    const msg = (t || draft).trim();
    if (!msg) return;
    setThread((p) => [...p, { who: "u", text: msg }]);
    setDraft("");
    setTimeout(() => {
      setThread((p) => [...p, { who: "y", text: "On it — give me 40 seconds. I'll write back here, the canvas will fill in on the right." }]);
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
        inputRef={inputRef}
        onSlash={onSlash}
      />
      <CanvasPane mode={mode} demoStep={demoStep} />
    </div>
  );
}

function ChatPane({ mode, setMode, thread, draft, setDraft, send, inputRef, onSlash }) {
  return (
    <div style={vw.chat}>
      <div style={vw.chatHead}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={vw.yAvatar}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 11L7 3L12 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="7" cy="3" r="1.4" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>Yulia</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <span className="pulse-dot" style={{ color: "var(--accent)" }} />
              <span className="eyebrow" style={{ fontSize: 9 }}>online · M&amp;A analyst</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button style={vw.headBtn}>
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4"/><path d="M7 4v3l2 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            History
          </button>
          <button style={vw.headBtn}>Share</button>
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
          <ExploreState onSlash={onSlash} />
        )}

        {mode === "start" && thread.length === 0 && (
          <StartState />
        )}

        {mode === "learn" && thread.length === 0 && (
          <LearnState />
        )}
      </div>

      <V3Composer
        mode={mode}
        draft={draft}
        setDraft={setDraft}
        send={send}
        inputRef={inputRef}
        disabled={mode === "watch"}
      />
    </div>
  );
}

// ── Welcome — three doors ─────────────────────────────────────────────
function Welcome({ setMode }) {
  const hour = new Date().getHours();
  const greet =
    hour < 5 ? "Working late?" :
    hour < 12 ? "Good morning." :
    hour < 18 ? "Good afternoon." : "Good evening.";

  return (
    <div className="fade-up" style={vw.welcome}>
      <div style={vw.welcomeAvatar}>
        <svg width="22" height="22" viewBox="0 0 14 14" fill="none">
          <path d="M2 11L7 3L12 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="7" cy="3" r="1.4" fill="currentColor"/>
        </svg>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, marginBottom: 6 }}>
        <span className="pulse-dot" style={{ color: "var(--accent)" }} />
        <span className="eyebrow eyebrow-accent" style={{ fontSize: 9.5 }}>YULIA · M&amp;A ANALYST · ONLINE</span>
      </div>

      <h1 style={vw.welcomeTitle}>
        {greet}<br/>
        <span style={vw.welcomeTitleEm}>I'm Yulia.</span>
      </h1>
      <p style={vw.welcomeSub}>
        I run M&amp;A deal work end-to-end — screen teasers, recast P&amp;Ls, build buyer lists, model structures, draft IOIs. <strong style={{ color: "var(--ink)", fontWeight: 600 }}>$149/mo, flat. No success fees, ever.</strong>
      </p>
      <p style={{ ...vw.welcomeSub, marginTop: 12, color: "var(--ink-3)", fontSize: 12.5 }}>
        Pick a door, or just start typing — I'll meet you wherever.
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

function DoorCard({ tag, title, desc, cta, accent, muted, onClick }) {
  const [hover, setHover] = v3cS(false);
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
          fontSize: 10.5, color: accent ? "var(--accent)" : "var(--ink-4)",
          letterSpacing: "0.1em",
        }}>
          {tag}
        </span>
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" style={{
          color: accent ? "var(--accent)" : "var(--ink-3)",
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
        color: accent ? "var(--accent)" : "var(--ink-2)",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        {cta}
        <span aria-hidden>→</span>
      </div>
    </button>
  );
}

function ModeBanner({ mode, setMode }) {
  const labels = {
    watch: { tag: "Demo running", note: "Yulia is working — sit back" },
    explore: { tag: "Sample deal", note: "Industrial Svc · TX · closed" },
    start: { tag: "New deal", note: "Composer is yours" },
    learn: { tag: "Learn more", note: "How it works · Pricing — open on the right" },
  };
  const l = labels[mode];
  return (
    <div style={vw.banner}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className="pulse-dot" style={{ color: "var(--accent)" }} />
        <span className="eyebrow eyebrow-accent" style={{ fontSize: 9.5 }}>{l.tag}</span>
        <span style={{ color: "var(--ink-4)" }}>·</span>
        <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{l.note}</span>
      </div>
      <button onClick={() => setMode("welcome")} style={vw.bannerBack}>← back</button>
    </div>
  );
}

function ExploreState({ onSlash }) {
  return (
    <div className="fade-up">
      <V3Msg who="y" text="Sample deal loaded on the right — Industrial Services · East Texas. $5.4M revenue. Closed at $7.8M last month. Ask me anything about it, or try one of these:" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginLeft: 32, marginTop: 4 }}>
        {[
          "Why pursue?",
          "How did you handle the concentration risk?",
          "Show the buyer list",
          "Walk me through the recast",
        ].map((s) => (
          <button key={s} style={vw.suggestion}>{s}</button>
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

function LearnState() {
  return (
    <div className="fade-up">
      <V3Msg who="y" text="Opened the doc on the right — the whole pattern, what I will and won't do, a real redacted deal, and the four pricing tiers. Skim it, or ask me anything below. The Pursue/Pass on Industrial Svc is also still here when you're ready." />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginLeft: 32, marginTop: 4 }}>
        {[
          "What's the difference between Starter and Pro?",
          "What won't you do?",
          "Show the example deal",
          "Why no success fees?",
        ].map((s) => (
          <button key={s} style={vw.suggestion}>{s}</button>
        ))}
      </div>
    </div>
  );
}

function V3Msg({ who, text }) {
  const isY = who === "y";
  return (
    <div className="fade-up" style={{ display: "flex", gap: 10, marginBottom: 16 }}>
      <div style={{
        width: 22, height: 22, flexShrink: 0,
        borderRadius: 5,
        background: isY ? "var(--accent-soft)" : "var(--surface-2)",
        border: isY ? "1px solid var(--accent-ring)" : "1px solid var(--line-2)",
        color: isY ? "var(--accent)" : "var(--ink-3)",
        display: "grid", placeItems: "center",
        fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 10,
        marginTop: 1,
      }}>
        {isY ? "Y" : ">"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <span className="eyebrow" style={{ fontSize: 9, color: isY ? "var(--accent)" : "var(--ink-3)" }}>
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
    </div>
  );
}

function V3Composer({ mode, draft, setDraft, send, inputRef, disabled }) {
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
          <button type="submit" disabled={disabled} className="btn btn-accent" style={{ padding: "6px 12px", fontSize: 12, opacity: disabled ? 0.4 : 1 }}>
            Send
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </form>
  );
}

const vw = {
  split: {
    display: "grid",
    gridTemplateColumns: "minmax(380px, 480px) minmax(0, 1fr)",
    flex: 1, minHeight: 0,
  },
  chat: {
    background: "var(--bg)",
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
  yAvatar: {
    width: 28, height: 28, borderRadius: 6,
    background: "var(--accent-soft)",
    border: "1px solid var(--accent-ring)",
    color: "var(--accent)",
    display: "grid", placeItems: "center",
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
    background: "linear-gradient(135deg, var(--accent-soft), transparent 60%), var(--surface)",
    borderColor: "var(--accent-ring)",
  },
  doorHover: {
    background: "var(--surface-2)",
    borderColor: "var(--line-2)",
  },
  doorMuted: {
    background: "transparent",
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

Object.assign(window, { V3Workspace });
