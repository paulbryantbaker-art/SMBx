import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Section = "how" | "pricing";

type HeroConfig = {
  title: string;
  copy: string;
  cta: string;
  prompt: string;
  dock: [string, string][];
};

const LEARN_HERO: Record<Section, HeroConfig> = {
  how: {
    title: "See how the deal desk works.",
    copy: "Yulia turns chat, files, models, and decisions into one live work surface. The canvas shows the work; the chat rail stays the front door.",
    cta: "Ask Yulia to walk the desk",
    prompt: "Walk me through how Yulia runs the deal desk from chat to models, files, Studio, and audit trail.",
    dock: [
      ["Chat opens the work", "A question becomes a route into Today, Pipeline, Search, Files, Studio, or a deal detail page."],
      ["Models stay grounded", "Financial outputs come from deterministic V19 models, uploaded files, and cited sources."],
      ["Outputs carry proof", "Memos, books, and exports keep their source trail, model links, and audit state."],
    ],
  },
  pricing: {
    title: "Start free. Scale with governed deal work.",
    copy: "Monthly plans stay simple. Credits and tollgates control expensive model runs, Studio exports, API/MCP calls, and agent usage without wallets or success fees.",
    cta: "Ask Yulia which plan fits",
    prompt: "Help me choose the right smbX.ai plan based on deal volume, Studio exports, model runs, API/MCP access, and agent usage.",
    dock: [
      ["Monthly plans", "Free, Solo, Pro, Team, and Enterprise map to how much real deal work needs to move."],
      ["Included credits", "Model runs, exports, Studio books, and API/tool calls are metered inside monthly allowances."],
      ["Agent-ready gates", "Higher-scope actions can require credit budget, human approval, or enterprise permission."],
    ],
  },
};

interface LearnProps {
  section?: Section;
  anchor?: string;
  onTalkToYulia?: (prompt: string) => void;
}

export function V6LearnView({ section, anchor, onTalkToYulia }: LearnProps) {
  const [active, setActive] = useState<Section>(section ?? "how");
  const hero = LEARN_HERO[active];
  useEffect(() => { if (section) setActive(section); }, [section]);

  useEffect(() => {
    if (!anchor) return;
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(anchor);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(raf);
  }, [anchor, active]);

  return (
    <div className="wk-content m-fade-up" style={L.page}>
      {/* ── Hero ── flat dark ink block */}
      <header style={L.hero}>
        <div style={L.heroMain}>
          <div>
            <h1 style={L.heroH1}>{hero.title}</h1>
            <p style={L.heroTag}>{hero.copy}</p>
            <button
              className="m-nudge-soft"
              style={L.heroCta}
              onClick={() => onTalkToYulia?.(hero.prompt)}
            >
              <span>{hero.cta}</span>
              <span aria-hidden="true">↗</span>
            </button>
          </div>
          <div style={L.heroDock} aria-label="Yulia system summary">
            {hero.dock.map(([title, body]) => (
              <div key={title} style={L.heroDockItem}>
                <strong style={L.heroDockTitle}>{title}</strong>
                <span style={L.heroDockText}>{body}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── Section tabs ── */}
      <div role="tablist" aria-label="Learn sections" style={L.subnav}>
        {([
          { id: "how" as const,     label: "How it works" },
          { id: "pricing" as const, label: "Pricing"      },
        ]).map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            onClick={() => setActive(t.id)}
            className="m-nudge-soft"
            style={{
              ...L.subnavBtn,
              fontWeight: active === t.id ? 600 : 500,
              color: active === t.id ? "var(--ink)" : "var(--ink-3)",
              background: active === t.id ? "var(--surface)" : "transparent",
              border: active === t.id ? "1px solid var(--line)" : "1px solid transparent",
              boxShadow: active === t.id ? "0 1px 3px rgba(25,24,19,.06)" : "none",
            }}
          >{t.label}</button>
        ))}
      </div>

      {active === "how"     && <HowSection onTalkToYulia={onTalkToYulia} />}
      {active === "pricing" && <PricingSection onTalkToYulia={onTalkToYulia} />}
    </div>
  );
}

/* ─── HOW IT WORKS ───────────────────────────────────────── */

interface StepStory { n: string; title: string; body: string; outcome: string }

interface Capability { title: string; body: string }

interface TimelineRow { time: string; title: string; body: string }

interface Difference { title: string; body: string; accent: string }

const DIFFERENCES: Difference[] = [
  {
    title: "A methodology engine, not a prompt trick",
    body: "Yulia carries journey, stage, deal size, role, documents, and prior work into the next move. We do not need to label the version on the website; the point is that the playbook is deep, mature, and deal-specific.",
    accent: "var(--accent-strong)",
  },
  {
    title: "Outputs built to survive third-party review",
    body: "The work product is designed for the people who challenge it: LPs, lenders, CPAs, counsel, ICs, boards, and regulators. Numbers need provenance. Claims need receipts.",
    accent: "#629987",
  },
  {
    title: "Legal and tax boundaries in the product",
    body: "Yulia can show options, implications, diligence questions, and documents to review. She does not represent you, negotiate for you, or turn software into transaction compensation.",
    accent: "#D6A35C",
  },
  {
    title: "Ready for the agent economy",
    body: "The desk is being shaped so other agents can call specialist M&A workflows with permission, identity, rate limits, and an audit trail. Agents can change; the deal record stays anchored.",
    accent: "#827DBD",
  },
];

interface WorkSurface { title: string; body: string; tone: "blue" | "green" | "gold" | "dark" }

const WORK_SURFACES: WorkSurface[] = [
  {
    title: "Deal Pack",
    body: "From LOI context to memo, lender view, outreach kit, data-room index, and 100-day plan.",
    tone: "blue",
  },
  {
    title: "EBITDA Bridge",
    body: "A defensible normalization waterfall with add-back logic, evidence anchors, and lender-facing notes.",
    tone: "gold",
  },
  {
    title: "Data-room Read",
    body: "Cross-file diligence, red flags, source citations, and board-ready follow-up questions.",
    tone: "green",
  },
  {
    title: "Yulia Agent Surface",
    body: "A specialist M&A layer that can be called by your own tools, copilots, and future agent workflows.",
    tone: "dark",
  },
];

const FOUR_STEPS: StepStory[] = [
  {
    n: "01",
    title: "She analyzes the deal.",
    body: "Drop in the financials, tax returns, CIM, LOI thread, diligence requests, contracts, and support files. Yulia parses line items against source documents, flags add-backs that do not trace, normalizes owner comp, pegs working capital, and scores concentration.",
    outcome: "The recast",
  },
  {
    n: "02",
    title: "She lays out the options.",
    body: "Yulia models three or four real paths: price, structure, timing, tax, close certainty, buyer fit, and your role at close. No strawman options. No buried recommendation. The math stays reproducible.",
    outcome: "The paths",
  },
  {
    n: "03",
    title: "She makes the implications clear.",
    body: "The board shows the dollar translation: R&W premium, allocation effects, earnout scenarios, NOL limits, state-tax leakage, indemnification exposure, and the claims that need citations before anyone relies on them.",
    outcome: "The tradeoffs",
  },
  {
    n: "04",
    title: "You pick the path.",
    body: "Yulia drafts the next move: counter, engagement letter, CIM section, buyer outreach, diligence response, funds-flow update, or board note. You read it, mark it up, and send it.",
    outcome: "Your judgment",
  },
];

const SESSION_TIMELINE: TimelineRow[] = [
  {
    time: "9:14",
    title: "Forensic audit starts",
    body: "Yulia checks the seller's support files and returns NOT FOUND on add-backs that do not trace to source.",
  },
  {
    time: "9:15",
    title: "The recast is complete",
    body: "Reported EBITDA moves to defended run-rate EBITDA. Unattested add-backs are flagged instead of silently accepted.",
  },
  {
    time: "9:16",
    title: "Working capital and concentration are read",
    body: "The peg, re-trade range, top-customer exposure, and diligence treatment land on the same board.",
  },
  {
    time: "9:17",
    title: "The Baseline runs",
    body: "Multiple-based valuation, DCF cross-check, comps, and precedent transactions produce a defended enterprise-value range.",
  },
  {
    time: "9:18",
    title: "Three structures are costed",
    body: "Limited financial buyer, PE platform, and strategic consolidator paths show after-tax outcome, certainty, timing, and founder role.",
  },
];

const OPTION_ROWS = [
  ["Financial buyer", "High certainty", "4-6 months", "Clean transition"],
  ["PE platform", "Balanced path", "6-9 months", "Cash plus rollover"],
  ["Strategic", "Highest headline", "8-14 months", "More diligence"],
] as const;

const HOW_TEXTURE_CARDS = [
  {
    meta: "01",
    title: "Ask in chat",
    audience: "Front door",
    detail: "Start with a question, file, target, buyer, or open decision. Yulia routes it to the right surface.",
    action: "Open work",
  },
  {
    meta: "02",
    title: "Work the deal",
    audience: "Canvas",
    detail: "The answer becomes a model, buyer map, file read, pipeline move, or Studio draft instead of staying trapped in chat.",
    action: "Build context",
  },
  {
    meta: "03",
    title: "Ground the math",
    audience: "V19 models",
    detail: "Numbers come from deterministic models, source files, citations, and versioned assumptions.",
    action: "Verify",
  },
  {
    meta: "04",
    title: "Ship the output",
    audience: "Studio + files",
    detail: "Drafts, pitch books, memos, and exports keep their source trail and audit state.",
    action: "Deliver",
  },
];

const HOW_COMPETE_ITEMS = [
  ["Unified record", "The same deal context feeds Today, Pipeline, Files, Search, Studio, and chat."],
  ["Methodology gates", "Yulia tracks deal stage, league, required models, citations, and halt triggers."],
  ["Deterministic models", "Valuation, QoE, LBO, tax, legal issue spotting, DSCR, NWC, and structure runs stay reproducible."],
  ["Audit trail", "Every model-backed answer and export can carry sources, hashes, approvals, and deferrals."],
];

const HOW_LIST_ROWS = [
  ["TH", "Thesis to target map", "Search lanes create buyer, lender, provider, and target maps from one mandate.", "Search"],
  ["QO", "QoE Preview wedge", "Files become normalized earnings, add-back defense, NWC issues, and Studio books.", "Studio"],
  ["IC", "IC and board work", "Models and citations become pitch books, board updates, memos, and decision asks.", "Export"],
  ["AG", "Agent-ready substrate", "API/MCP callers get governed tools, tollgates, audit writes, and source-grounded outputs.", "V19"],
];

function HowSection({ onTalkToYulia }: { onTalkToYulia?: (prompt: string) => void }) {
  return (
    <div>
      <style>{`
        @media (max-width: 1080px) {
          .learn-two-column,
          .learn-step-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 760px) {
          .learn-info-panel {
            border-radius: 14px !important;
            padding: 18px !important;
          }
        }
      `}</style>

      <LearnSection
        title="Work starts in chat. It does not stay there."
        sub="The canvas is where Yulia turns intent into deal work: tabs, models, source reads, drafts, and audit-ready deliverables."
      >
        <div style={L.textureGrid}>
          {HOW_TEXTURE_CARDS.map((card, index) => (
            <Reveal key={card.title} delay={index * 60}>
              <article style={L.flatCard}>
                <span style={L.textureMeta}>{card.meta}</span>
                <strong style={L.textureTitle}>{card.title}</strong>
                <span style={L.textureAudience}>{card.audience}</span>
                <span style={L.textureDetail}>{card.detail}</span>
                <span style={L.textureAction}>{card.action}</span>
              </article>
            </Reveal>
          ))}
        </div>
      </LearnSection>

      <section className="learn-two-column" style={L.twoColumnGrid}>
        <Reveal direction="right">
          <div className="learn-info-panel" style={L.competePanel}>
            <h2 style={L.infoTitle}>Built as a deal operating layer.</h2>
            <div style={L.competeGrid}>
              {HOW_COMPETE_ITEMS.map(([title, body]) => (
                <button
                  key={title}
                  type="button"
                  className="m-nudge-soft"
                  style={L.competeItem}
                  onClick={() => onTalkToYulia?.(`Explain ${title} in the smbX.ai deal operating layer. ${body}`)}
                >
                  <strong>{title}</strong>
                  <span>{body}</span>
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal direction="left" delay={90}>
          <div className="learn-info-panel" style={L.listPanel}>
            <div style={L.panelHeader}>
              <h2 style={L.infoTitle}>What Yulia keeps organized</h2>
              <span style={L.softPill}>V19</span>
            </div>
            <div style={L.listStack}>
              {HOW_LIST_ROWS.map(([icon, title, body, pill]) => (
                <button
                  key={title}
                  type="button"
                  className="m-nudge-soft"
                  style={L.listRow}
                  onClick={() => onTalkToYulia?.(`Explain ${title}. ${body}`)}
                >
                  <span style={L.listIcon}>{icon}</span>
                  <span style={L.listBody}>
                    <strong>{title}</strong>
                    <small>{body}</small>
                  </span>
                  <span style={L.cleanPill}>{pill}</span>
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <LearnSection
        title="Four steps, every deal."
        sub="Yulia can do the mechanical work, but the decision stays with the user."
      >
        <div className="learn-step-grid" style={L.stepGrid}>
          {FOUR_STEPS.map((step, index) => (
            <Reveal key={step.title} delay={index * 60}>
              <article style={L.stepCard}>
                <div style={L.stepTopline}>
                  <span style={L.stepNumber}>{step.n}</span>
                  <span style={L.softPill}>{step.outcome}</span>
                </div>
                <h3 style={L.stepTitle}>{step.title}</h3>
                <p style={L.stepBody}>{step.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </LearnSection>

    </div>
  );
}

function DifferenceDisclosure({ item, defaultOpen = false }: { item: Difference; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="learn-difference-row" style={H.differenceRow}>
      <button
        type="button"
        className="m-nudge-soft"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        style={H.differenceButton}
      >
        <span style={{ ...H.differenceDot, background: item.accent }} aria-hidden="true" />
        <span style={H.differenceButtonText}>
          <strong style={H.differenceTitle}>{item.title}</strong>
          <span style={H.differenceHint}>{open ? "Hide the read" : "Open the read"}</span>
        </span>
        <span
          aria-hidden="true"
          style={{
            ...H.differenceToggle,
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          +
        </span>
      </button>
      {open && <p style={H.differenceBody}>{item.body}</p>}
    </div>
  );
}

function stepBoardCardStyle(index: number): CSSProperties {
  const tones: CSSProperties[] = [
    A.stepCardBlue,
    A.stepCardGreen,
    A.stepCardGold,
    A.stepCardDecision,
  ];
  return {
    ...A.stepBoardCard,
    ...(tones[index % tones.length] ?? {}),
  };
}

function stepBadgeStyle(index: number): CSSProperties {
  const tones = [
    { background: "var(--accent-soft)", color: "var(--accent-strong)" },
    { background: "#DBF1E6", color: "#326C55" },
    { background: "#FAF1D6", color: "#7A5A1F" },
    { background: "var(--surface-2)", color: "var(--ink-2)" },
  ];
  return {
    ...A.storyNumber,
    ...(tones[index % tones.length] ?? {}),
  };
}

function Reveal({
  children,
  delay = 0,
  direction = "up",
}: {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right";
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const translate =
    direction === "left" ? "translate3d(18px, 0, 0)" :
    direction === "right" ? "translate3d(-18px, 0, 0)" :
    "translate3d(0, 18px, 0)";

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate3d(0, 0, 0)" : translate,
        transition: "opacity 520ms cubic-bezier(0.22, 1, 0.36, 1), transform 520ms cubic-bezier(0.22, 1, 0.36, 1)",
        transitionDelay: visible ? `${delay}ms` : "0ms",
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

function stepCardStyle(index: number): CSSProperties {
  return {
    ...H.stepCard,
    boxShadow: index === 0
      ? "0 2px 8px rgba(25,24,19,.08)"
      : H.stepCard.boxShadow,
  };
}

function stepNumberStyle(index: number): CSSProperties {
  return {
    ...H.stepN,
    opacity: index === 0 ? 1 : 0.78,
  };
}

function surfaceCardStyle(tone: WorkSurface["tone"]): CSSProperties {
  const recipes: Record<WorkSurface["tone"], CSSProperties> = {
    blue:  { background: "var(--surface-2)", color: "var(--ink)" },
    green: { background: "var(--surface-2)", color: "var(--ink)" },
    gold:  { background: "var(--surface-2)", color: "var(--ink)" },
    dark:  { background: "var(--ink)",       color: "#fff"       },
  };
  return {
    ...H.surfaceCard,
    ...recipes[tone],
  };
}

/* ─── "A" style block — story / system / art panels ── */
const A: Record<string, CSSProperties> = {
  openGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(min(560px, 100%), 1.02fr) minmax(min(420px, 100%), 0.78fr)",
    gap: 18,
    alignItems: "stretch",
    marginBottom: 46,
  },
  openPanel: {
    minHeight: 430,
    borderRadius: 16,
    padding: "38px 40px",
    background: "var(--surface)",
    border: "1px solid var(--line)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  massiveTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 48,
    lineHeight: 0.96,
    letterSpacing: "-0.055em",
    margin: 0,
    maxWidth: 720,
    color: "var(--ink)",
    textWrap: "balance",
  },
  openLead: {
    margin: "20px 0 0",
    maxWidth: 720,
    fontSize: 16,
    lineHeight: 1.62,
    color: "var(--ink-2)",
    textWrap: "pretty",
  },
  statRail: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 26,
  },
  statPill: {
    minHeight: 34,
    display: "inline-flex",
    alignItems: "center",
    padding: "0 12px",
    borderRadius: 999,
    background: "var(--surface-2)",
    border: "1px solid var(--line)",
    color: "var(--ink-2)",
    fontSize: 12,
    fontFamily: "var(--font-mono)",
    fontWeight: 800,
  },
  /* flat dark card — replaces photo art card */
  artCard: {
    position: "relative",
    minHeight: 430,
    borderRadius: 16,
    overflow: "hidden",
    background: "var(--ink)",
    border: "1px solid var(--line)",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "flex-end",
  },
  artWash: {
    display: "none", /* removed — no overlay needed on flat dark */
  },
  artContent: {
    position: "relative",
    zIndex: 1,
    padding: "28px 30px",
    width: "100%",
  },
  artTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 36,
    lineHeight: 0.98,
    letterSpacing: "-0.05em",
    margin: 0,
    maxWidth: 460,
    color: "#FFFFFF",
    textWrap: "balance",
  },
  artBody: {
    margin: "12px 0 18px",
    maxWidth: 470,
    fontSize: 14.5,
    lineHeight: 1.55,
    color: "rgba(255,255,255,0.84)",
    textWrap: "pretty",
  },
  darkGlassPill: {
    all: "unset",
    cursor: "pointer",
    minHeight: 42,
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "0 16px",
    color: "var(--on-accent)",
    fontSize: 13,
    fontWeight: 850,
    background: "var(--accent)",
    borderRadius: 999,
  },
  storySection: {
    marginBottom: 46,
  },
  sectionHead: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 36,
    lineHeight: 1,
    letterSpacing: "-0.05em",
    margin: 0,
    color: "var(--ink)",
    textWrap: "balance",
  },
  sectionLead: {
    margin: "9px 0 0",
    maxWidth: 760,
    fontSize: 14.5,
    lineHeight: 1.56,
    color: "var(--ink-2)",
    textWrap: "pretty",
  },
  storyStack: {
    display: "grid",
    gap: 14,
  },
  stepBoard: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 14,
    alignItems: "stretch",
  },
  stepBoardCard: {
    minHeight: 238,
    borderRadius: 14,
    padding: "24px 26px",
    background: "var(--surface)",
    border: "1px solid var(--line)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    color: "var(--ink)",
  },
  stepCardBlue: {
    background: "var(--surface-2)",
    border: "1px solid var(--line)",
  },
  stepCardGreen: {
    background: "var(--surface-2)",
    border: "1px solid var(--line)",
  },
  stepCardGold: {
    background: "var(--surface-2)",
    border: "1px solid var(--line)",
  },
  stepCardDecision: {
    background: "var(--ink)",
    border: "1px solid var(--line)",
    color: "#FFFFFF",
  },
  stepTopline: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  stepOutcomePill: {
    minHeight: 32,
    display: "inline-flex",
    alignItems: "center",
    padding: "0 11px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.22)",
    color: "currentColor",
    fontSize: 12,
    fontWeight: 850,
  },
  stepBoardTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 28,
    lineHeight: 1,
    letterSpacing: "-0.04em",
    margin: 0,
    color: "currentColor",
    textWrap: "balance",
  },
  stepBoardBody: {
    margin: "12px 0 0",
    maxWidth: 760,
    fontSize: 14,
    lineHeight: 1.55,
    color: "currentColor",
    opacity: 0.76,
    textWrap: "pretty",
  },
  storyRow: {
    display: "grid",
    gridTemplateColumns: "minmax(min(540px, 100%), 0.78fr) minmax(240px, 0.22fr)",
    gap: 14,
    alignItems: "stretch",
  },
  storyNode: {
    minHeight: 190,
    borderRadius: 14,
    padding: "24px 26px",
    background: "var(--surface)",
    border: "1px solid var(--line)",
  },
  storyNumber: {
    display: "inline-grid",
    placeItems: "center",
    width: 42,
    height: 42,
    borderRadius: 15,
    background: "var(--surface-2)",
    color: "var(--ink-2)",
    fontSize: 12,
    fontFamily: "var(--font-mono)",
    fontWeight: 850,
    letterSpacing: "0.1em",
  },
  storyTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 27,
    lineHeight: 1,
    letterSpacing: "-0.04em",
    margin: "18px 0 9px",
    color: "var(--ink)",
    textWrap: "balance",
  },
  storyBody: {
    margin: 0,
    maxWidth: 780,
    fontSize: 14,
    lineHeight: 1.55,
    color: "var(--ink-3)",
    textWrap: "pretty",
  },
  storyOutcome: {
    minHeight: 190,
    borderRadius: 14,
    padding: "22px",
    background: "var(--surface-2)",
    border: "1px solid var(--line)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    color: "var(--ink)",
    fontSize: 20,
    lineHeight: 1.05,
    letterSpacing: "-0.025em",
  },
  storyOutcomeLine: {
    width: 46,
    height: 4,
    borderRadius: 999,
    background: "var(--accent)",
  },
  /* flat dark "system" block — replaces learnHero photo wash */
  systemPanel: {
    position: "relative",
    marginBottom: 46,
    borderRadius: 16,
    padding: "32px",
    overflow: "hidden",
    color: "#FFFFFF",
    background: "var(--ink)",
    border: "1px solid var(--line)",
  },
  systemVeil: {
    display: "none",
  },
  systemIntro: {
    position: "relative",
    maxWidth: 820,
    marginBottom: 22,
  },
  systemTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 40,
    lineHeight: 0.98,
    letterSpacing: "-0.05em",
    margin: 0,
    color: "#FFFFFF",
  },
  systemLead: {
    margin: "11px 0 0",
    maxWidth: 760,
    fontSize: 14.5,
    lineHeight: 1.55,
    color: "rgba(255,255,255,0.78)",
    textWrap: "pretty",
  },
  systemGrid: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
  },
  optionBoard: {
    position: "relative",
    marginTop: 14,
    overflow: "hidden",
    borderRadius: 12,
    background: "rgba(255,255,255,0.08)",
    border: "0.5px solid rgba(255,255,255,0.18)",
  },
  optionRow: {
    minHeight: 50,
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr 1fr 1.2fr",
    gap: 14,
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "0.5px solid rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.84)",
    fontSize: 13,
    lineHeight: 1.3,
  },
  systemStep: {
    minHeight: 170,
    borderRadius: 12,
    padding: "18px",
    background: "rgba(255,255,255,0.08)",
    border: "0.5px solid rgba(255,255,255,0.14)",
  },
  systemNumber: {
    display: "inline-grid",
    placeItems: "center",
    width: 34,
    height: 34,
    borderRadius: 12,
    background: "rgba(255,255,255,0.12)",
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "var(--font-mono)",
    fontWeight: 850,
  },
  systemStepTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 22,
    lineHeight: 1,
    letterSpacing: "-0.035em",
    margin: "17px 0 8px",
    color: "#FFFFFF",
  },
  systemStepBody: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.5,
    color: "rgba(255,255,255,0.78)",
    textWrap: "pretty",
  },
  surfaceIndex: {
    width: 36,
    height: 36,
    borderRadius: 13,
    display: "grid",
    placeItems: "center",
    background: "var(--surface-2)",
    color: "var(--ink-2)",
    fontSize: 11,
    fontFamily: "var(--font-mono)",
    fontWeight: 850,
    letterSpacing: "0.09em",
  },
};

const H: Record<string, CSSProperties> = {
  artStorySection: {
    marginBottom: 42,
  },
  artStoryGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(min(360px, 100%), 0.72fr) minmax(min(480px, 100%), 1.28fr)",
    gap: 18,
    alignItems: "stretch",
  },
  /* flat dark panel — replaces photo art panel */
  artPanel: {
    position: "relative",
    minHeight: 360,
    borderRadius: 16,
    overflow: "hidden",
    background: "var(--ink)",
    border: "1px solid var(--line)",
  },
  artPanelSheen: {
    display: "none",
  },
  /* removed texture tile — replaced with a flat accent dot */
  artAccentTile: {
    position: "absolute",
    top: 24,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 14,
    background: "var(--accent)",
    opacity: 0.72,
  },
  artGlassMemo: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 24,
    padding: "22px 24px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.10)",
    border: "0.5px solid rgba(255,255,255,0.18)",
    color: "#FFFFFF",
  },
  artMemoTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 29,
    lineHeight: 1.02,
    letterSpacing: "-0.035em",
    margin: 0,
    color: "#FFFFFF",
  },
  artMemoBody: {
    margin: "10px 0 0",
    fontSize: 14,
    lineHeight: 1.55,
    color: "rgba(255,255,255,0.84)",
    maxWidth: 560,
    textWrap: "pretty",
  },
  differencePanel: {
    minHeight: 430,
    borderRadius: 16,
    padding: "30px 32px",
    background: "var(--surface)",
    border: "1px solid var(--line)",
  },
  sectionH2: {
    fontFamily: "var(--font-display)",
    fontSize: 34,
    lineHeight: 1,
    letterSpacing: "-0.045em",
    margin: 0,
    color: "var(--ink)",
    textWrap: "balance",
  },
  sectionLead: {
    margin: "8px 0 0",
    maxWidth: 720,
    fontSize: 14.5,
    lineHeight: 1.55,
    color: "var(--ink-2)",
    textWrap: "pretty",
  },
  differenceStack: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    marginTop: 22,
    overflow: "hidden",
    borderRadius: 12,
    background: "var(--surface)",
    border: "1px solid var(--line)",
  },
  differenceRow: {
    borderBottom: "1px solid var(--line)",
    background: "var(--surface)",
  },
  differenceButton: {
    all: "unset",
    boxSizing: "border-box",
    width: "100%",
    cursor: "pointer",
    display: "grid",
    gridTemplateColumns: "12px minmax(0, 1fr) 28px",
    gap: 14,
    alignItems: "center",
    padding: "16px 16px",
  },
  differenceDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
  },
  differenceButtonText: {
    minWidth: 0,
    display: "grid",
    gap: 3,
  },
  differenceTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 17,
    fontWeight: 750,
    letterSpacing: "-0.02em",
    margin: 0,
    color: "var(--ink)",
  },
  differenceHint: {
    fontSize: 11.5,
    color: "var(--ink-3)",
  },
  differenceToggle: {
    width: 26,
    height: 26,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    background: "var(--surface-2)",
    color: "var(--ink-2)",
    fontSize: 15,
    fontWeight: 800,
    transition: "transform 180ms ease",
  },
  differenceBody: {
    margin: 0,
    padding: "0 56px 17px 42px",
    fontSize: 13,
    lineHeight: 1.58,
    color: "var(--ink-3)",
    textWrap: "pretty",
  },
  surfaceSection: {
    marginBottom: 42,
  },
  surfaceHeader: {
    display: "flex",
    alignItems: "end",
    justifyContent: "space-between",
    gap: 24,
    marginBottom: 16,
  },
  surfaceGrid: {
    display: "grid",
    gap: 14,
  },
  surfaceCard: {
    position: "relative",
    minHeight: 220,
    borderRadius: 14,
    padding: 18,
    overflow: "hidden",
    border: "1px solid var(--line)",
    display: "flex",
    alignItems: "flex-end",
  },
  surfaceGlass: {
    width: "100%",
    minHeight: 122,
    borderRadius: 12,
    padding: "17px 17px 16px",
    background: "rgba(255,255,255,0.10)",
    border: "0.5px solid rgba(255,255,255,0.18)",
  },
  surfaceTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 23,
    lineHeight: 1,
    letterSpacing: "-0.035em",
    margin: 0,
    color: "currentColor",
  },
  surfaceBody: {
    margin: "10px 0 0",
    fontSize: 13,
    lineHeight: 1.5,
    color: "currentColor",
    opacity: 0.9,
    textWrap: "pretty",
  },
  /* flat dark "flow" block — replaces learnHero photo wash */
  flowPanel: {
    position: "relative",
    marginBottom: 42,
    borderRadius: 16,
    padding: "30px 32px",
    overflow: "hidden",
    color: "#FFFFFF",
    background: "var(--ink)",
    border: "1px solid var(--line)",
  },
  flowVeil: {
    display: "none",
  },
  flowIntro: {
    position: "relative",
    display: "flex",
    alignItems: "end",
    justifyContent: "space-between",
    gap: 22,
    marginBottom: 20,
  },
  flowH2: {
    fontFamily: "var(--font-display)",
    fontSize: 34,
    lineHeight: 1,
    letterSpacing: "-0.045em",
    margin: 0,
    color: "#FFFFFF",
  },
  flowLead: {
    margin: 0,
    maxWidth: 420,
    fontSize: 14,
    lineHeight: 1.5,
    color: "rgba(255,255,255,0.78)",
    textWrap: "pretty",
  },
  flowSteps: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },
  flowStep: {
    minHeight: 178,
    borderRadius: 12,
    padding: "18px 18px 17px",
    background: "rgba(255,255,255,0.08)",
    border: "0.5px solid rgba(255,255,255,0.14)",
  },
  flowNumber: {
    display: "inline-grid",
    placeItems: "center",
    width: 34,
    height: 34,
    borderRadius: 12,
    background: "rgba(255,255,255,0.12)",
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "var(--font-mono)",
    fontWeight: 800,
  },
  flowTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 21,
    lineHeight: 1,
    letterSpacing: "-0.025em",
    margin: "18px 0 8px",
    color: "#FFFFFF",
  },
  flowBody: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.5,
    color: "rgba(255,255,255,0.78)",
    textWrap: "pretty",
  },
  capabilityLibrary: {
    marginBottom: 42,
    borderRadius: 16,
    padding: 24,
    background: "var(--surface)",
    border: "1px solid var(--line)",
  },
  capabilityLibraryHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "end",
    gap: 20,
    marginBottom: 12,
  },
  capabilityRows: {
    display: "grid",
    overflow: "hidden",
    borderRadius: 12,
    border: "1px solid var(--line)",
    background: "var(--surface)",
  },
  capabilityRow: {
    minHeight: 84,
    display: "grid",
    gridTemplateColumns: "54px minmax(0, 1fr)",
    gap: 14,
    alignItems: "center",
    padding: "16px 20px",
    color: "var(--ink)",
  },
  capabilityIndex: {
    width: 34,
    height: 34,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    background: "var(--surface-2)",
    color: "var(--ink-2)",
    fontSize: 12,
    fontFamily: "var(--font-mono)",
    fontWeight: 850,
    letterSpacing: "0.08em",
  },
  capabilityText: {
    display: "grid",
    gap: 4,
    minWidth: 0,
  },
  capabilityTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 16,
    fontWeight: 760,
    letterSpacing: "-0.02em",
    color: "var(--ink)",
  },
  capabilityBody: {
    fontSize: 13,
    lineHeight: 1.48,
    color: "var(--ink-3)",
    textWrap: "pretty",
  },
  loopSpread: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(340px, 100%), 1fr))",
    gap: 18,
    alignItems: "stretch",
  },
  loopLead: {
    minHeight: 300,
    borderRadius: 16,
    padding: "28px 30px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    overflow: "hidden",
    background: "var(--surface)",
    border: "1px solid var(--line)",
    color: "var(--ink)",
  },
  loopLeadTitle: {
    margin: 0,
    maxWidth: 520,
    fontSize: 32,
    lineHeight: 1.02,
    letterSpacing: "-0.045em",
    color: "var(--ink)",
  },
  loopLeadBody: {
    margin: "18px 0 0",
    maxWidth: 520,
    fontSize: 15.5,
    lineHeight: 1.58,
    color: "var(--ink-3)",
    textWrap: "pretty",
  },
  loopLeadRail: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
    width: "fit-content",
    padding: "10px 12px",
    borderRadius: 999,
    background: "var(--ink)",
    border: "0.5px solid rgba(255,255,255,0.12)",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: 750,
  },
  stepStack: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  stepCard: {
    minHeight: 96,
    padding: "20px 22px",
    borderRadius: 14,
    display: "grid",
    gridTemplateColumns: "56px minmax(0, 1fr)",
    gap: 18,
    alignItems: "start",
    background: "var(--surface)",
    border: "1px solid var(--line)",
    color: "var(--ink)",
  },
  stepN: {
    width: 44,
    height: 44,
    borderRadius: 15,
    display: "grid",
    placeItems: "center",
    fontSize: 11,
    color: "var(--ink-2)",
    background: "var(--surface-2)",
    fontFamily: "var(--font-mono)",
    fontWeight: 800,
    letterSpacing: "0.1em",
  },
  stepTitle: {
    fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700,
    letterSpacing: "-0.02em", margin: "5px 0 7px", color: "currentColor",
  },
  stepBody: {
    fontSize: 13, lineHeight: 1.55, color: "currentColor", opacity: 0.72,
    margin: 0, textWrap: "pretty",
  },
  chip: {
    fontSize: 10, padding: "3px 8px",
    background: "var(--surface-2)", borderRadius: 999,
    color: "var(--ink-3)", fontWeight: 600, letterSpacing: "0.1em",
  },
  chipDark: {
    background: "var(--surface-2)",
    color: "var(--ink-2)",
    opacity: 0.9,
  },
  capabilityMosaic: {
    display: "grid",
    gap: 14,
  },
  capCard: {
    minHeight: 146,
    padding: "22px 22px 20px",
    borderRadius: 14,
    background: "var(--surface)",
    border: "1px solid var(--line)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: 10,
    color: "var(--ink)",
  },
  capCardWide: {
    background: "var(--ink)",
    border: "1px solid var(--line)",
    color: "#FFFFFF",
  },
  capTag: {
    fontSize: 9.5, color: "currentColor",
    fontWeight: 700, letterSpacing: "0.14em", marginBottom: 8,
    opacity: 0.74,
  },
  capTitle: {
    fontFamily: "var(--font-display)", fontSize: 15.5, fontWeight: 750,
    letterSpacing: "-0.02em", margin: 0, color: "currentColor",
  },
  capBody: {
    fontSize: 12.5, lineHeight: 1.55, color: "var(--ink-3)", margin: 0,
    opacity: 0.92,
    textWrap: "pretty",
  },
  whyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))",
    gap: 18,
    alignItems: "stretch",
  },
  whyCard: {
    minHeight: 230,
    borderRadius: 16,
    padding: "28px 32px",
    background: "var(--surface)",
    border: "1px solid var(--line)",
    display: "flex",
    alignItems: "center",
  },
  whyBody: {
    fontSize: 16,
    lineHeight: 1.7,
    color: "var(--ink)",
    margin: 0,
    textWrap: "pretty",
  },
  statPanel: {
    minHeight: 230,
    borderRadius: 16,
    padding: "24px 26px",
    background: "var(--surface-2)",
    border: "1px solid var(--line)",
    display: "flex",
    alignItems: "center",
  },
  statRow: {
    display: "grid",
    gridTemplateColumns: "92px minmax(0,1fr)",
    gap: 14,
    alignItems: "baseline",
    padding: "10px 0",
    borderBottom: "1px solid var(--line)",
  },
  stat: {
    fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: 28,
    letterSpacing: "-0.03em", color: "var(--ink)", minWidth: 72,
  },
  statLabel: {
    fontSize: 13,
    color: "var(--ink-2)",
    opacity: 1,
  },
};

/* ─── PRICING ────────────────────────────────────────────── */
// Pricing source of truth: client/src/lib/pricing.ts -> SMBX_PRICING_LOCKED.md.
// When tiers change, update the lock doc first, then PRICING_TIERS in lib/pricing.ts, then mirror here.

type PriceValue = number | "Free" | "From $3,000";

interface Plan {
  id: string;
  name: string;
  price: PriceValue;
  sub: string;
  cta: string;
  prompt: string;
  featured?: boolean;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "Free",
    sub: "Try Yulia on one real deal.",
    cta: "Start free",
    prompt: "I'm ready to start with the free tier. What do I need to do?",
    features: [
      "Unlimited chat",
      "One active deal",
      "One finished deliverable, ever",
    ],
  },
  {
    id: "solo",
    name: "Solo",
    price: 99,
    sub: "For one operator, one deal at a time.",
    cta: "Choose Solo",
    prompt: "I'm interested in the $99 Solo plan. Walk me through the models, exports, and supervised MCP workflow.",
    features: [
      "Unlimited deliverables",
      "1 MCP / agent key · 1,000 calls",
      "Recast, Baseline, market map",
      "One live deal room",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 249,
    sub: "For active dealmakers and full-stack work.",
    cta: "Choose Pro",
    prompt: "I'm interested in Pro at $249. Walk me through QofE Lite, the parallel-deal pipeline, and the audience-variant memos.",
    featured: true,
    features: [
      "QofE Lite pre-read",
      "3 MCP / agent keys · 6,000 calls",
      "Unlimited active deals",
      "LBO, DCF, comps, tax, legal",
    ],
  },
  {
    id: "team",
    name: "Team",
    price: 749,
    sub: "For boutiques and partner-led firms.",
    cta: "Choose Team",
    prompt: "I'm interested in Team at $749. How do seats, shared deal vaults, firm templates, specialist handoffs, and supervised agent workflows work?",
    features: [
      "Up to 5 seats",
      "Supervised agents · 15,000 calls",
      "Shared vault and templates",
      "Specialist handoff coordination",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "From $3,000",
    sub: "For larger teams and regulated environments.",
    cta: "Talk to Yulia",
    prompt: "I want to learn more about Enterprise from $3,000 — SSO, single-tenant, SOC 2, custom seat count, API controls, governed agent scope, and audit exports.",
    features: [
      "Governed autonomous agents",
      "Custom seat count + MCP scope",
      "SSO, SOC 2, single tenant",
      "Custom API/MCP rate limits",
    ],
  },
];

const INCLUDED_GROUPS: Capability[] = [
  {
    title: "Every paid tier",
    body: "Unlimited Yulia chat, Recast, Baseline valuation, 28 document generators, buyer-universe analysis, deal room, brand kit, and 180 days of post-close PMI support.",
  },
  {
    title: "Pro adds the full deal stack",
    body: "QofE Lite, full LBO with DCF and precedent comps, 22-gate scoring, audience-variant memos, sector buyer universes, negotiation-prep scaffolds, tax/legal scenario models, cap table, and three supervised MCP/agent keys at 6,000 monthly API/MCP calls.",
  },
  {
    title: "Team adds firm infrastructure",
    body: "Up to five seats, a shared deal vault, firm templates, role-based access, per-user audit trail, and specialist handoff coordination across CPA, attorney, banker, lender, and advisor.",
  },
  {
    title: "Enterprise adds governed deployment",
    body: "Custom seats, SSO, single-tenant deployment, SOC 2 path, white-label exports, governed autonomous agent scope, custom API/MCP rate limits, uptime SLA, and a named account manager.",
  },
];

type Cell = string;

type CompareCells = [Cell, Cell, Cell, Cell, Cell]; // Free, Solo, Pro, Team, Enterprise

interface CompareGroup {
  title: string;
  rows: { feature: string; cells: CompareCells }[];
}

const COMPARE: CompareGroup[] = [
  {
    title: "The basics — every paid tier",
    rows: [
      { feature: "Yulia chat — unlimited",            cells: ["✓",          "✓",         "✓",         "✓",         "✓"] },
      { feature: "Recast + ValueLens valuation", cells: ["✓",          "✓",         "✓",         "✓",         "✓"] },
      { feature: "28 document generators",            cells: ["✓",          "✓",         "✓",         "✓",         "✓"] },
      { feature: "Buyer-universe analysis",           cells: ["preview",    "✓",         "✓",         "✓",         "✓"] },
      { feature: "SBA + structure modeling",          cells: ["preview",    "✓",         "✓",         "✓",         "✓"] },
      { feature: "Deal room + diligence tracker",     cells: ["—",          "one deal",  "✓",         "✓",         "✓"] },
      { feature: "Brand kit on every deliverable",    cells: ["—",          "✓",         "✓",         "✓",         "✓"] },
      { feature: "180 days post-close PMI",           cells: ["—",          "✓",         "✓",         "✓",         "✓"] },
      { feature: "Active deals",                      cells: ["1",          "1",         "unlimited", "unlimited", "unlimited"] },
      { feature: "Finished deliverables",             cells: ["1 (ever)",   "unlimited", "unlimited", "unlimited", "unlimited"] },
    ],
  },
  {
    title: "Pro adds — the associate desk",
    rows: [
      { feature: "QofE Lite pre-read · the wedge",        cells: ["—", "—", "✓", "✓", "✓"] },
      { feature: "Parallel-deal pipeline view",           cells: ["—", "—", "✓", "✓", "✓"] },
      { feature: "Seven-Factor deal scoring",                  cells: ["—", "—", "✓", "✓", "✓"] },
      { feature: "Sector-tuned buyer universes",          cells: ["—", "—", "✓", "✓", "✓"] },
      { feature: "Audience-variant memos · LP, IC, board",cells: ["—", "—", "✓", "✓", "✓"] },
      { feature: "Negotiation prep + option scaffolds",cells: ["—", "—", "✓", "✓", "✓"] },
      { feature: "Cap table + waterfall modeling",        cells: ["—", "—", "✓", "✓", "✓"] },
      { feature: "Owner-readiness scoring · CEPA",        cells: ["—", "—", "✓", "✓", "✓"] },
      { feature: "Higher API/MCP rate limits",            cells: ["—", "—", "✓", "✓", "✓"] },
    ],
  },
  {
    title: "V19 usage — included monthly",
    rows: [
      { feature: "Included credits",                 cells: ["100", "2,000", "6,000",  "25,000", "custom"] },
      { feature: "Server model runs",                cells: ["20",  "300",   "1,200",  "6,000",  "custom"] },
      { feature: "Studio books",                     cells: ["1",   "12",    "60",     "300",    "custom"] },
      { feature: "Studio exports",                   cells: ["1",   "30",    "150",    "600",    "custom"] },
      { feature: "API/MCP calls",                    cells: ["—",   "1,000", "6,000",  "15,000", "custom"] },
      { feature: "Agent usage",                      cells: ["—",   "1 key", "3 keys", "supervised", "autonomous"] },
    ],
  },
  {
    title: "Agent / MCP access — call smbX.ai from any assistant",
    rows: [
      { feature: "MCP server endpoint /mcp",          cells: ["—", "✓", "✓", "✓", "✓"] },
      { feature: "Claude Connector",                  cells: ["—", "✓", "✓", "✓", "✓"] },
      { feature: "ChatGPT GPT Actions",               cells: ["—", "✓", "✓", "✓", "✓"] },
      { feature: "Copilot · Agentforce · Bedrock",    cells: ["—", "✓", "✓", "✓", "✓"] },
      { feature: "Direct MCP client (any agent)",     cells: ["—", "✓", "✓", "✓", "✓"] },
      { feature: "Supervised agent governance",       cells: ["—", "✓", "✓", "✓", "✓"] },
      { feature: "Autonomous governed scope",         cells: ["—", "—", "—", "—", "✓"] },
      { feature: "Audit trail + mandate chain",       cells: ["—", "✓", "✓", "✓", "✓"] },
      { feature: "Beneficial-customer billing",       cells: ["—", "✓", "✓", "✓", "✓"] },
    ],
  },
  {
    title: "Team adds — for firms",
    rows: [
      { feature: "Up to 5 seats",                       cells: ["—", "—", "—", "✓", "✓"] },
      { feature: "Shared deal vault + firm templates",  cells: ["—", "—", "—", "✓", "✓"] },
      { feature: "Specialist handoff coordination",     cells: ["—", "—", "—", "✓", "✓"] },
    ],
  },
  {
    title: "Enterprise adds — for regulated environments",
    rows: [
      { feature: "Custom seat count",                       cells: ["—", "—", "—", "—", "✓"] },
      { feature: "SSO · single-tenant · SOC 2",             cells: ["—", "—", "—", "—", "✓"] },
      { feature: "Higher API rate limits + uptime SLA",     cells: ["—", "—", "—", "—", "✓"] },
      { feature: "Named account manager",                   cells: ["—", "—", "—", "—", "✓"] },
    ],
  },
];

const PRICING_CONTROL_ITEMS = [
  {
    title: "Monthly subscription",
    body: "Free, Solo, Pro, Team, and Enterprise stay simple. No wallet, no success fee, no referral fee, no deal-value fee.",
  },
  {
    title: "Included credits",
    body: "Model runs, Studio books, exports, tool calls, and API/MCP calls are measured against monthly allowances.",
  },
  {
    title: "Tollgate states",
    body: "Expensive or sensitive actions can return credit budget, human approval, or enterprise-scope requirements.",
  },
  {
    title: "MCP / agent access",
    body: "Solo includes 1 supervised key and 1,000 API/MCP calls. Pro: 3 keys + 6,000 calls. Team: shared firm scope + 15,000 calls. Enterprise: autonomous governed scope, custom limits.",
  },
];

const ACCESS_CHANNELS = [
  {
    title: "Inside Claude",
    body: "Add smbX.ai as a custom connector. Streamable HTTP MCP at /mcp, OAuth 2.1 with PKCE. Yulia's tools, DealState, and audit packets are callable from Claude Code or Claude.ai.",
    prompt: "How do I use smbX.ai from inside Claude? Walk me through the connector setup, OAuth scopes, and what calls count against my API/MCP allowance.",
  },
  {
    title: "Inside ChatGPT",
    body: "Import the OpenAPI at /api/definitive/gpt-actions/openapi.json into a custom GPT. Confidential OAuth client. Same Yulia, same deterministic models, same audit trail.",
    prompt: "How do I wire smbX.ai into a ChatGPT GPT Action? What OAuth client config do I need and how do calls bill?",
  },
  {
    title: "Copilot · Agentforce · Bedrock",
    body: "MCP discovery at /.well-known/mcp plus enterprise allow-list templates for GitHub Copilot, AWS Q/Kiro, VS Code, and Bedrock AgentCore. Same /mcp endpoint, scoped tokens.",
    prompt: "How does smbX.ai integrate with Microsoft Copilot, Salesforce Agentforce, or AWS Bedrock AgentCore from an enterprise allow-list?",
  },
  {
    title: "Any MCP client",
    body: "Any MCP-aware agent can list tools, call them with structured inputs, and receive structured outputs plus citations, audit IDs, and the THE LINE invariant. OAuth bearer tokens.",
    prompt: "I want to call smbX.ai from my own MCP client. Walk me through tool discovery, OAuth, and how outputs come back.",
  },
];

const MCP_RULES = [
  {
    icon: "$0",
    title: "Bundled, never metered against your deal",
    body: "MCP calls count against your plan's monthly API/MCP allowance. No success fee, no fee tied to deal value or closing. Same THE LINE doctrine as in-app use.",
    pill: "THE LINE",
  },
  {
    icon: "ID",
    title: "Beneficial-customer billing",
    body: "Every call carries agent identity, beneficial-customer ID, and mandate chain. Calls are billed and audited to you, not to the platform that routed them.",
    pill: "Audited",
  },
  {
    icon: "GV",
    title: "Supervised vs autonomous governance",
    body: "Solo, Pro, and Team operate in supervised mode — agent calls need identity, scope, and tollgate awareness. Enterprise opens autonomous governed scope with custom guardrails.",
    pill: "Governed",
  },
  {
    icon: "DT",
    title: "Deterministic + cited outputs",
    body: "Every tool response includes input/output hashes, model version pins, citation refs, and a structured refusal envelope when THE LINE applies. Same outputs the app gets.",
    pill: "Substrate",
  },
];

const PRICING_PLAN_ORDER = ["free", "solo", "pro", "team", "enterprise"] as const;

const PLAN_AUDIENCES: Record<string, string> = {
  free: "Test-drive Yulia",
  solo: "One operator",
  pro: "Active dealmaker",
  team: "Boutique or firm",
  enterprise: "Governed deployment",
};

const PRICING_FAQS = [
  {
    icon: "NO",
    title: "No wallet, success fee, or per-deal toll",
    body: "Plans are monthly. Credits only meter expensive model runs, exports, Studio books, and API/tool usage inside the plan.",
    pill: "Simple",
  },
  {
    icon: "FR",
    title: "Free is a real trial",
    body: "Free users can talk to Yulia and complete one deliverable so they can feel the product on a real deal.",
    pill: "Low risk",
  },
  {
    icon: "CR",
    title: "Credits create guardrails",
    body: "When an action needs more budget, approval, or enterprise scope, Yulia returns a clear tollgate instead of failing silently.",
    pill: "Governed",
  },
  {
    icon: "MC",
    title: "MCP and agent calls are bundled",
    body: "Calls from Claude, ChatGPT, Copilot, Agentforce, or any direct MCP client count against your monthly API/MCP allowance. No separate per-call fee. No fee tied to deal closing.",
    pill: "Substrate",
  },
  {
    icon: "EN",
    title: "Enterprise is custom by design",
    body: "Single-tenant, SSO, higher limits, API/MCP controls, and audit needs vary by firm and agent scope.",
    pill: "Custom",
  },
];

function planPriceLabel(plan: Plan): string {
  if (plan.price === "Free") return "$0/mo";
  if (typeof plan.price === "number") return `$${plan.price}/mo`;
  return `${plan.price}/mo`;
}

function planById(id: string): Plan {
  const plan = PLANS.find((item) => item.id === id);
  if (!plan) throw new Error(`Missing plan ${id}`);
  return plan;
}

function PricingSection({ onTalkToYulia }: { onTalkToYulia?: (prompt: string) => void }) {
  const handleCta = (plan: Plan) => {
    onTalkToYulia?.(plan.prompt);
  };

  return (
    <div>
      <style>{`
        .pricing-tier-card {
          cursor: pointer;
          transform: translate3d(0, 0, 0);
          transition:
            box-shadow 180ms ease,
            border-color 180ms ease;
        }
        .pricing-tier-grid > div {
          min-width: 0;
          height: 100%;
        }
        .pricing-tier-card:hover {
          border-color: var(--accent) !important;
        }
        .pricing-tier-card:focus-visible {
          outline: 3px solid var(--accent);
          outline-offset: 4px;
        }
        @media (max-width: 1280px) {
          .pricing-tier-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 1080px) {
          .pricing-choice-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .pricing-choice-grid > div {
          min-width: 0;
          height: 100%;
        }
        .pricing-info-panel {
          box-sizing: border-box;
          height: 100%;
        }
        @media (max-width: 760px) {
          .pricing-tier-grid {
            grid-template-columns: 1fr !important;
          }
          .pricing-info-panel {
            border-radius: 14px !important;
            padding: 18px !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .pricing-tier-card {
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>

      <LearnSection
        title="Choose a plan."
        sub="Start free, move to Pro for active deal work, or add Team when the work becomes shared."
      >
        <div className="pricing-tier-grid" style={P.pricingTierGrid}>
          {PRICING_PLAN_ORDER.map((id, index) => {
            const plan = planById(id);
            const featured = Boolean(plan.featured);
            return (
              <Reveal key={plan.id} delay={index * 70} direction="up">
                <button
                  type="button"
                  className="pricing-tier-card"
                  aria-label={`${plan.cta}: ${plan.name}`}
                  onClick={() => handleCta(plan)}
                  style={{
                    ...P.pricingTierCard,
                    ...(featured ? P.pricingTierFeatured : {}),
                  }}
                >
                  <span style={P.pricingTierMeta}>{PLAN_AUDIENCES[plan.id]}</span>
                  <span style={P.pricingTierName}>{plan.name}</span>
                  <span style={P.pricingTierPrice}>{planPriceLabel(plan)}</span>
                  <span style={P.pricingTierSub}>{plan.sub}</span>
                  <span style={P.pricingTierFeatures}>
                    {plan.features.slice(0, 2).map((feature) => (
                      <span key={feature}>{feature}</span>
                    ))}
                  </span>
                  <span style={P.pricingTierFooter}>
                    {featured && <span style={P.recommendedPill}>Most used</span>}
                    <span style={P.pricingDarkPill}>{plan.cta}</span>
                  </span>
                </button>
              </Reveal>
            );
          })}
        </div>
      </LearnSection>

      <LearnSection id="compare" title="Compare plans" sub="Open the full matrix when you need exact allowance, agent access, and governance details.">
        <Reveal>
          <ComparePlans />
        </Reveal>
      </LearnSection>

      <LearnSection
        id="mcp-agent-access"
        title="Use smbX.ai from any AI assistant."
        sub="Your subscription includes /mcp access, OAuth-scoped agent tokens, and audit-trail recording. Call from Claude, ChatGPT, Copilot, Agentforce, or any direct MCP client — no extra charge, no fee tied to closing."
      >
        <div className="pricing-choice-grid" style={P.pricingChoiceGrid}>
          <Reveal direction="right">
            <div className="pricing-info-panel" style={P.pricingCompetePanel}>
              <h2 style={L.infoTitle}>Callable from any assistant.</h2>
              <div style={L.competeGrid}>
                {ACCESS_CHANNELS.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    className="m-nudge-soft"
                    style={L.competeItem}
                    onClick={() => onTalkToYulia?.(item.prompt)}
                  >
                    <strong>{item.title}</strong>
                    <span>{item.body}</span>
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal direction="left" delay={90}>
            <div className="pricing-info-panel" style={P.planListPanel}>
              <div style={L.panelHeader}>
                <h2 style={L.infoTitle}>MCP / agent rules</h2>
                <span style={L.softPill}>Substrate</span>
              </div>
              <div style={L.listStack}>
                {MCP_RULES.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    className="m-nudge-soft"
                    style={L.listRow}
                    onClick={() => onTalkToYulia?.(`Explain this MCP / agent rule: ${item.title}. ${item.body}`)}
                  >
                    <span style={L.listIcon}>{item.icon}</span>
                    <span style={L.listBody}>
                      <strong>{item.title}</strong>
                      <small>{item.body}</small>
                    </span>
                    <span style={L.cleanPill}>{item.pill}</span>
                  </button>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </LearnSection>

      <LearnSection
        title="Pricing has guardrails, not gotchas."
        sub="The page should answer the objections before they become a reason to stall."
      >
        <div className="pricing-choice-grid" style={P.pricingChoiceGrid}>
          <Reveal direction="right">
            <div className="pricing-info-panel" style={P.pricingCompetePanel}>
              <h2 style={L.infoTitle}>What pricing controls.</h2>
              <div style={L.competeGrid}>
                {PRICING_CONTROL_ITEMS.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    className="m-nudge-soft"
                    style={L.competeItem}
                    onClick={() => onTalkToYulia?.(`Explain this pricing control: ${item.title}. ${item.body}`)}
                  >
                    <strong>{item.title}</strong>
                    <span>{item.body}</span>
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal direction="left" delay={90}>
            <div className="pricing-info-panel" style={P.planListPanel}>
              <div style={L.panelHeader}>
                <h2 style={L.infoTitle}>Questions to clear</h2>
                <span style={L.softPill}>FAQ</span>
              </div>
              <div style={L.listStack}>
                {PRICING_FAQS.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    className="m-nudge-soft"
                    style={L.listRow}
                    onClick={() => onTalkToYulia?.(`Explain this pricing question: ${item.title}. ${item.body}`)}
                  >
                    <span style={L.listIcon}>{item.icon}</span>
                    <span style={L.listBody}>
                      <strong>{item.title}</strong>
                      <small>{item.body}</small>
                    </span>
                    <span style={L.cleanPill}>{item.pill}</span>
                  </button>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </LearnSection>
    </div>
  );
}

function ComparePlans() {
  const [expanded, setExpanded] = useState(false);
  const detailId = "plan-compare-details";
  const rows = [
    {
      plan: "Free",
      price: "$0",
      builtFor: "Trying Yulia on a real deal",
      seats: "1",
      deals: "1",
      deliverables: "1 ever",
    },
    {
      plan: "Solo",
      price: "$99/mo",
      builtFor: "Solo, one deal at a time",
      seats: "1",
      deals: "1",
      deliverables: "Unlimited",
    },
    {
      plan: "Pro",
      price: "$249/mo",
      builtFor: "Active dealmakers, full stack",
      seats: "1",
      deals: "Unlimited",
      deliverables: "Unlimited",
    },
    {
      plan: "Team",
      price: "$749/mo",
      builtFor: "Boutiques and partner-led firms",
      seats: "Up to 5",
      deals: "Unlimited",
      deliverables: "Unlimited",
    },
    {
      plan: "Enterprise",
      price: "From $3,000/mo",
      builtFor: "Larger teams and regulated environments",
      seats: "Custom",
      deals: "Unlimited",
      deliverables: "Unlimited",
    },
  ];

  return (
    <div style={P.compareStage}>
      <style>{`
        .plan-compare-row {
          transition: background 180ms ease;
        }
        .plan-compare-row:hover {
          background: var(--surface-2) !important;
        }
        @media (max-width: 900px) {
          .plan-compare-row {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            min-width: 0 !important;
            gap: 12px !important;
          }
          .plan-compare-row > :first-child,
          .plan-compare-row > :nth-child(3) {
            grid-column: 1 / -1;
          }
        }
      `}</style>
      <div style={P.compareCard}>
        <div className="plan-compare-row" style={{ ...P.compareRow, ...P.compareHeaderRow }}>
          <span>Plan</span>
          <span>Price</span>
          <span>Built for</span>
          <span>Seats</span>
          <span>Deals</span>
          <span>Deliverables</span>
        </div>
        {rows.map((row, index) => (
          <div
            key={row.plan}
            className="plan-compare-row"
            style={{ ...P.compareRow, borderBottom: index === rows.length - 1 ? "none" : "1px solid var(--line)" }}
          >
            <div style={P.comparePlanCell}>
              <strong>{row.plan}</strong>
            </div>
            <p style={P.compareText}>{row.price}</p>
            <p style={P.compareText}>{row.builtFor}</p>
            <p style={P.compareText}>{row.seats}</p>
            <p style={P.compareText}>{row.deals}</p>
            <p style={P.compareText}>{row.deliverables}</p>
          </div>
        ))}
        <div style={P.compareExpandWrap}>
          <button
            type="button"
            className="m-nudge-soft"
            aria-expanded={expanded}
            aria-controls={detailId}
            onClick={() => setExpanded(!expanded)}
            style={P.compareExpandButton}
          >
            <span>{expanded ? "Hide full feature comparison" : "Expand full feature comparison"}</span>
            <span aria-hidden="true" style={{ ...P.compareExpandIcon, transform: expanded ? "rotate(45deg)" : "rotate(0deg)" }}>+</span>
          </button>
        </div>
        {expanded && (
          <div id={detailId} style={P.compareDetails}>
            <div style={P.compareHeader}>
              <span>Feature</span>
              <span>Free</span>
              <span>Solo</span>
              <span>Pro</span>
              <span>Team</span>
              <span>Enterprise</span>
            </div>
            {COMPARE.map(group => (
              <div key={group.title}>
                <div style={P.compareGroupHeader}>{group.title}</div>
                {group.rows.map((row, rowIndex) => (
                  <div
                    key={`${group.title}-${row.feature}`}
                    className="plan-compare-row"
                    style={{
                      ...P.compareFeatureRow,
                      borderBottom: rowIndex === group.rows.length - 1 ? "none" : "1px solid var(--line)",
                    }}
                  >
                    <strong style={P.compareFeatureName}>{row.feature}</strong>
                    {row.cells.map((cell, cellIndex) => (
                      <span
                        key={`${row.feature}-${cellIndex}`}
                        style={{
                          ...P.compareCell,
                          ...(cellIndex === 2 ? P.compareProCell : undefined),
                        }}
                      >
                        {cell}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function IncludedPlans() {
  return (
    <div style={P.includedGrid}>
      {INCLUDED_GROUPS.map((group, index) => (
        <div key={group.title} style={includedCardStyle(index)}>
          <span style={includedBadgeStyle(index)}>{String(index + 1).padStart(2, "0")}</span>
          <h3 style={P.includedTitle}>{group.title}</h3>
          <p style={P.includedBody}>{group.body}</p>
        </div>
      ))}
    </div>
  );
}

function includedCardStyle(index: number): CSSProperties {
  const tones: CSSProperties[] = [
    P.includedBlue,
    P.includedGreen,
    P.includedGold,
    P.includedLavender,
  ];
  return {
    ...P.includedCard,
    ...(tones[index % tones.length] ?? {}),
  };
}

function includedBadgeStyle(index: number): CSSProperties {
  const tones = [
    { background: "var(--accent-soft)", color: "var(--accent-strong)" },
    { background: "#DBF1E6", color: "#346F58" },
    { background: "#FAF1D6", color: "#816124" },
    { background: "var(--surface-2)", color: "var(--ink-2)" },
  ];
  return {
    ...A.surfaceIndex,
    ...(tones[index % tones.length] ?? {}),
  };
}

/* ─── SECTION HELPER ─────────────────────────────────────── */

function LearnSection({ id, eyebrow, title, sub, children }: {
  id?: string; eyebrow?: string; title: string; sub?: string; children: ReactNode;
}) {
  return (
    <section id={id} style={L.learnSection}>
      <Reveal>
        <div style={L.sectionIntro}>
          {eyebrow && <div className="mono" style={L.sectionEyebrow}>{eyebrow}</div>}
          <h2 style={L.sectionTitle}>{title}</h2>
          {sub && <div style={L.sectionSub}>{sub}</div>}
        </div>
      </Reveal>
      {children}
    </section>
  );
}

const L: Record<string, CSSProperties> = {
  page: {
    width: "min(100%, 1440px)",
    maxWidth: 1440,
    margin: "0 auto",
    boxSizing: "border-box",
  },
  /* flat dark hero — replaces multi-layer photo wash */
  hero: {
    background: "var(--ink)",
    border: "1px solid var(--line)",
    borderRadius: 16,
    padding: "38px 46px 32px",
    marginBottom: 20,
    minHeight: 390,
    position: "relative",
    overflow: "hidden",
  },
  heroMain: {
    position: "relative",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: 22,
    minHeight: 320,
  },
  heroEyebrow: {
    position: "relative",
    fontSize: 10, color: "#FFFFFF",
    letterSpacing: "0.16em", fontWeight: 700, marginBottom: 8,
  },
  heroH1: {
    position: "relative",
    fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 58,
    lineHeight: 0.94, letterSpacing: "-0.048em",
    color: "#FFFFFF", margin: 0,
    maxWidth: 720, textWrap: "balance",
  },
  heroTag: {
    position: "relative",
    fontSize: 15.5, lineHeight: 1.55, color: "rgba(255,255,255,0.78)",
    margin: "14px 0 0", maxWidth: 620, textWrap: "pretty",
  },
  heroCta: {
    all: "unset",
    cursor: "pointer",
    marginTop: 20,
    minHeight: 44,
    width: "fit-content",
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    padding: "0 18px",
    borderRadius: 999,
    color: "var(--on-accent)",
    background: "var(--accent)",
    fontSize: 13,
    fontWeight: 800,
  },
  heroDock: {
    width: 360,
    display: "grid",
    gap: 10,
    flexShrink: 0,
  },
  heroDockItem: {
    padding: "14px 15px",
    borderRadius: 12,
    color: "#FFFFFF",
    background: "rgba(255,255,255,0.08)",
    border: "0.5px solid rgba(255,255,255,0.14)",
  },
  heroDockTitle: {
    display: "block",
    fontFamily: "var(--font-display)",
    fontSize: 18,
    lineHeight: 1,
    letterSpacing: "-0.025em",
    color: "#FFFFFF",
  },
  heroDockText: {
    display: "block",
    marginTop: 7,
    fontSize: 12.5,
    lineHeight: 1.35,
    color: "rgba(255,255,255,0.72)",
    textWrap: "pretty",
  },
  heroProofDeck: {
    display: "grid",
    gap: 10,
    alignSelf: "stretch",
    alignContent: "end",
  },
  heroProofCard: {
    padding: "15px 16px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.08)",
    border: "0.5px solid rgba(255,255,255,0.14)",
  },
  heroProofEyebrow: {
    fontSize: 9,
    letterSpacing: "0.15em",
    color: "#FFFFFF",
    opacity: 0.65,
    fontWeight: 800,
  },
  heroProofTitle: {
    display: "block",
    marginTop: 6,
    color: "#FFFFFF",
    fontSize: 18,
    lineHeight: 1,
    letterSpacing: "-0.025em",
  },
  heroProofText: {
    display: "block",
    marginTop: 6,
    color: "#FFFFFF",
    opacity: 0.72,
    fontSize: 12.5,
  },
  subnav: {
    display: "inline-flex", gap: 6, marginBottom: 22,
    padding: 4,
    borderRadius: 999,
    background: "var(--surface)",
    border: "1px solid var(--line)",
  },
  subnavBtn: {
    all: "unset", cursor: "pointer",
    padding: "9px 15px",
    borderRadius: 999,
    fontSize: 13,
    transition: "color 120ms ease, background 120ms ease",
  },
  learnSection: {
    marginBottom: 40,
    scrollMarginTop: 12,
  },
  sectionIntro: {
    marginBottom: 16,
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: 4,
  },
  sectionEyebrow: {
    fontSize: 9.5,
    color: "var(--accent-strong)",
    letterSpacing: "0.16em",
    fontWeight: 800,
    fontFamily: "var(--font-mono)",
  },
  sectionTitle: {
    fontFamily: "var(--font-display)",
    fontWeight: 750,
    fontSize: 30,
    lineHeight: 1,
    letterSpacing: "-0.045em",
    margin: 0,
    color: "var(--ink)",
    textWrap: "balance",
  },
  sectionSub: {
    maxWidth: 720,
    fontSize: 14,
    color: "var(--ink-2)",
    lineHeight: 1.45,
  },
  /* flat card grid replacing studioTextureCardStyles */
  textureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: 12,
    marginTop: 16,
  },
  /* flat surface card — replaces photo-texture card */
  flatCard: {
    minHeight: 220,
    position: "relative",
    textAlign: "left",
    borderRadius: 14,
    padding: 17,
    border: "1px solid var(--line)",
    background: "var(--surface)",
    color: "var(--ink)",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    overflow: "hidden",
  },
  textureMeta: { color: "var(--ink-3)", fontFamily: "var(--font-mono)", fontWeight: 850, fontSize: 12 },
  textureTitle: { fontSize: 19, lineHeight: 1.05, color: "var(--ink)", fontFamily: "var(--font-display)" },
  textureAudience: { color: "var(--ink-2)", fontWeight: 850, fontSize: 12 },
  textureDetail: { color: "var(--ink-3)", fontSize: 13, lineHeight: 1.35, marginTop: "auto" },
  textureAction: {
    marginTop: 12,
    alignSelf: "flex-start",
    padding: "7px 12px",
    fontSize: 12,
    fontWeight: 850,
    borderRadius: 999,
    background: "var(--accent)",
    color: "var(--on-accent)",
  },
  twoColumnGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(360px, 0.88fr)",
    gap: 18,
    alignItems: "stretch",
    marginBottom: 40,
  },
  /* flat compete panel — replaces studioCompeteCardStyles.panel (photo texture) */
  competePanel: {
    borderRadius: 16,
    padding: 22,
    background: "var(--surface)",
    border: "1px solid var(--line)",
    minHeight: 360,
  },
  /* flat list panel — replaces studioListCardStyles.panel (glass) */
  listPanel: {
    borderRadius: 16,
    padding: 20,
    background: "var(--surface)",
    border: "1px solid var(--line)",
    minHeight: 360,
  },
  infoTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 32,
    lineHeight: 1,
    letterSpacing: "-0.045em",
    margin: 0,
    color: "var(--ink)",
    textWrap: "balance",
  },
  /* flat compete item grid */
  competeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))",
    gap: 12,
    marginTop: 20,
  },
  competeItem: {
    all: "unset",
    boxSizing: "border-box",
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
    font: "inherit",
    minHeight: 118,
    borderRadius: 14,
    padding: 14,
    background: "var(--surface-2)",
    border: "1px solid var(--line)",
    display: "grid",
    gap: 8,
    alignContent: "start",
    color: "var(--ink-2)",
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  softPill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 34,
    padding: "0 12px",
    borderRadius: 999,
    background: "var(--accent-soft)",
    color: "var(--accent-strong)",
    fontSize: 12,
    fontWeight: 900,
  },
  /* list stack */
  listStack: {
    display: "grid", gap: 10, marginTop: 18,
  },
  /* flat list row — replaces studioListButtonRowStyles */
  listRow: {
    all: "unset",
    boxSizing: "border-box",
    display: "grid",
    gridTemplateColumns: "48px minmax(0, 1fr) auto",
    alignItems: "center",
    gap: 12,
    width: "100%",
    padding: 12,
    borderRadius: 14,
    background: "var(--surface-2)",
    border: "1px solid var(--line)",
    textAlign: "left",
    cursor: "pointer",
    font: "inherit",
    color: "var(--ink)",
  },
  /* flat list icon — replaces gradient #8A9AE8→#2E5C8A with accent */
  listIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    color: "var(--on-accent)",
    fontFamily: "var(--font-mono)",
    fontWeight: 900,
    background: "var(--accent-strong)",
    fontSize: 12,
  },
  listBody: { display: "grid", gap: 3, minWidth: 0 },
  cleanPill: {
    padding: "7px 10px",
    borderRadius: 999,
    background: "var(--accent-soft)",
    color: "var(--accent-strong)",
    fontWeight: 900,
    fontSize: 12,
  },
  stepGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
  },
  stepCard: {
    borderRadius: 16,
    padding: 20,
    background: "var(--surface)",
    border: "1px solid var(--line)",
    minHeight: 260,
    display: "flex",
    flexDirection: "column",
  },
  stepTopline: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 18,
  },
  /* step number badge — replaces retired #8A9AE8/#2E5C8A gradient */
  stepNumber: {
    width: 42,
    height: 42,
    borderRadius: 15,
    display: "grid",
    placeItems: "center",
    color: "var(--on-accent)",
    fontFamily: "var(--font-mono)",
    fontWeight: 900,
    background: "var(--accent-strong)",
    fontSize: 12,
  },
  stepTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 22,
    lineHeight: 1,
    letterSpacing: "-0.035em",
    margin: 0,
    color: "var(--ink)",
    textWrap: "balance",
  },
  stepBody: {
    margin: "10px 0 0",
    fontSize: 13,
    lineHeight: 1.48,
    color: "var(--ink-3)",
    textWrap: "pretty",
  },
};

const P: Record<string, CSSProperties> = {
  toggleRow: { display: "flex", justifyContent: "center", marginBottom: 18 },
  toggleWrap: {
    display: "inline-flex", padding: 4,
    background: "var(--surface)",
    border: "1px solid var(--line)",
    borderRadius: 999,
  },
  toggleBtn: {
    all: "unset", cursor: "pointer",
    padding: "8px 16px", borderRadius: 999,
    fontSize: 12.5, fontWeight: 600,
    transition: "background 120ms ease, color 120ms ease",
  },
  pricingTierGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
    gap: 12,
    alignItems: "stretch",
  },
  /* flat tier card — replaces texture card with ink dark */
  pricingTierCard: {
    boxSizing: "border-box",
    width: "100%",
    height: "100%",
    minHeight: 286,
    position: "relative",
    textAlign: "left",
    borderRadius: 14,
    padding: 17,
    border: "1px solid var(--line)",
    appearance: "none",
    WebkitAppearance: "none",
    background: "var(--ink)",
    color: "#FFFFFF",
    font: "inherit",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    overflow: "hidden",
    cursor: "pointer",
  },
  pricingTierFeatured: {
    borderColor: "var(--accent)",
    boxShadow: "0 0 0 2px var(--accent)",
  },
  pricingTierMeta: {
    color: "rgba(255,255,255,.62)",
    fontFamily: "var(--font-mono)",
    fontWeight: 900,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  pricingTierName: {
    fontFamily: "var(--font-display)",
    fontSize: 25,
    lineHeight: 1,
    letterSpacing: "-0.045em",
    fontWeight: 850,
    color: "#FFFFFF",
  },
  pricingTierPrice: {
    fontFamily: "var(--font-mono)",
    fontSize: 17,
    lineHeight: 1,
    fontWeight: 850,
    color: "var(--accent)",
  },
  pricingTierSub: {
    color: "rgba(255,255,255,.78)",
    fontSize: 12.5,
    lineHeight: 1.35,
    fontWeight: 700,
  },
  pricingTierFeatures: {
    display: "grid",
    gap: 6,
    marginTop: "auto",
    color: "rgba(255,255,255,.72)",
    fontSize: 12.5,
    lineHeight: 1.32,
  },
  pricingTierFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 12,
    flexWrap: "wrap",
  },
  recommendedPill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 34,
    padding: "0 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,.10)",
    color: "#FFFFFF",
    border: "1px solid rgba(255,255,255,.14)",
    fontSize: 12,
    fontWeight: 900,
  },
  pricingDarkPill: {
    marginTop: 0,
    alignSelf: "auto",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 38,
    padding: "0 15px",
    fontSize: 13,
    fontWeight: 900,
    borderRadius: 999,
    background: "var(--accent)",
    color: "var(--on-accent)",
  },
  pricingChoiceGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(360px, 0.86fr)",
    gap: 18,
    alignItems: "stretch",
    marginBottom: 6,
  },
  planListPanel: {
    borderRadius: 16,
    padding: 20,
    background: "var(--surface)",
    border: "1px solid var(--line)",
    minHeight: 0,
  },
  planListStack: {
    display: "grid", gap: 10, marginTop: 18,
  },
  planListRow: {
    boxSizing: "border-box",
    display: "grid",
    gridTemplateColumns: "48px minmax(0, 1fr) auto",
    alignItems: "center",
    gap: 12,
    width: "100%",
    padding: 12,
    borderRadius: 14,
    background: "var(--surface-2)",
    border: "1px solid var(--line)",
    color: "var(--ink)",
    font: "inherit",
    appearance: "none",
    WebkitAppearance: "none",
    textAlign: "left",
    cursor: "pointer",
  },
  planListIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    color: "var(--on-accent)",
    fontFamily: "var(--font-mono)",
    fontWeight: 900,
    background: "var(--accent-strong)",
    fontSize: 12,
  },
  planListIconFeatured: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    color: "var(--on-accent)",
    fontFamily: "var(--font-mono)",
    fontWeight: 900,
    background: "var(--ink)",
    fontSize: 12,
  },
  planListBody: {
    display: "grid", gap: 3, minWidth: 0,
  },
  planListPill: {
    padding: "7px 10px",
    borderRadius: 999,
    background: "var(--accent-soft)",
    color: "var(--accent-strong)",
    fontWeight: 900,
    fontSize: 12,
    whiteSpace: "nowrap",
  },
  planFeaturedPill: {
    padding: "7px 10px",
    borderRadius: 999,
    background: "#FAF1D6",
    color: "#816124",
    fontWeight: 900,
    fontSize: 12,
    whiteSpace: "nowrap",
  },
  pricingCompetePanel: {
    borderRadius: 16,
    padding: 22,
    background: "var(--surface)",
    border: "1px solid var(--line)",
    minHeight: 0,
  },
  planGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: 14,
    marginBottom: 38,
  },
  planCard: {
    minHeight: 330,
    padding: "24px 24px 22px",
    position: "relative",
    border: "1px solid var(--line)",
    borderRadius: 16,
    background: "var(--surface)",
    display: "flex",
    flexDirection: "column",
    color: "var(--ink)",
  },
  planFeatured: {
    border: "2px solid var(--accent)",
    background: "var(--ink)",
    color: "#FFFFFF",
  },
  popular: {
    position: "absolute", top: -10, left: 24,
    fontSize: 11.5, fontWeight: 800, letterSpacing: 0,
    background: "var(--accent)",
    color: "var(--on-accent)",
    padding: "4px 10px", borderRadius: 999,
  },
  planName: {
    fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700,
    letterSpacing: "-0.02em", margin: 0, color: "currentColor",
  },
  planSub: {
    fontSize: 12.5, color: "currentColor",
    opacity: 0.72,
    margin: "5px 0 14px", textWrap: "pretty",
  },
  priceRow: {
    display: "flex", alignItems: "baseline", gap: 4, marginBottom: 16,
  },
  priceNumber: {
    fontFamily: "var(--font-mono)", fontSize: 36, fontWeight: 800,
    letterSpacing: "-0.03em", color: "currentColor",
  },
  priceUnit: { fontSize: 13, color: "currentColor", opacity: 0.62 },
  planAction: {
    marginBottom: 16,
    minHeight: 40,
    borderRadius: 999,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "0 14px 0 16px",
    fontSize: 12.5,
    fontWeight: 800,
    background: "var(--accent)",
    color: "var(--on-accent)",
    transition: "opacity 180ms ease",
  },
  planActionFeatured: {
    color: "var(--on-accent)",
  },
  featureRow: {
    display: "flex", gap: 8,
    fontSize: 12.5, color: "currentColor",
    opacity: 0.76,
    lineHeight: 1.4,
  },
  compareStage: {
    overflow: "hidden",
    padding: 0,
    borderRadius: 16,
    border: "1px solid var(--line)",
    background: "var(--surface)",
  },
  compareToolbar: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "6px 8px 14px",
    flexWrap: "wrap",
  },
  compareToolbarEyebrow: {
    fontSize: 9.5,
    letterSpacing: "0.16em",
    fontWeight: 800,
    color: "var(--accent-strong)",
    fontFamily: "var(--font-mono)",
  },
  compareToolbarTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 24,
    lineHeight: 1,
    letterSpacing: "-0.04em",
    color: "var(--ink)",
    marginTop: 4,
    fontWeight: 760,
  },
  compareToolbarChips: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  compareChip: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: 30,
    padding: "0 11px",
    borderRadius: 999,
    fontSize: 11,
    fontFamily: "var(--font-mono)",
    fontWeight: 750,
    color: "var(--ink-2)",
    background: "var(--surface-2)",
    border: "1px solid var(--line)",
  },
  compareCard: {
    padding: 0,
    overflowX: "auto",
    overflowY: "hidden",
    borderRadius: 14,
    background: "var(--surface)",
    border: "1px solid var(--line)",
  },
  compareScroll: {
    overflowX: "auto",
  },
  compareHeader: {
    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
    background: "var(--surface-2)",
    padding: "15px 18px",
    minWidth: 900,
    fontSize: 12.5,
    letterSpacing: 0,
    fontWeight: 850,
    color: "var(--ink)",
    borderBottom: "1px solid var(--line)",
  },
  compareGroupHeader: {
    padding: "15px 18px 10px",
    minWidth: 900,
    fontSize: 13,
    letterSpacing: 0,
    fontWeight: 850,
    color: "var(--accent-strong)",
    fontFamily: "var(--font-mono)",
    background: "var(--surface-2)",
    borderTop: "1px solid var(--line)",
    borderBottom: "1px solid var(--line)",
  },
  compareRow: {
    display: "grid", gridTemplateColumns: "140px 130px minmax(220px, 1.4fr) 100px 120px 140px",
    gap: 18,
    padding: "16px 18px",
    fontSize: 13,
    color: "var(--ink)",
    alignItems: "center",
    minWidth: 880,
  },
  compareHeaderRow: {
    minHeight: 52,
    background: "var(--surface-2)",
    color: "var(--ink-2)",
    fontSize: 12.5,
    fontWeight: 800,
    letterSpacing: 0,
    borderBottom: "1px solid var(--line)",
  },
  comparePlanCell: {
    display: "grid",
    gap: 4,
    color: "var(--ink)",
  },
  compareText: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.45,
    color: "var(--ink-3)",
    textWrap: "pretty",
  },
  compareTextMuted: {
    margin: 0,
    fontSize: 12.5,
    lineHeight: 1.45,
    color: "var(--ink-2)",
    textWrap: "pretty",
  },
  compareExpandWrap: {
    borderTop: "1px solid var(--line)",
    padding: 12,
    background: "var(--surface-2)",
  },
  compareExpandButton: {
    all: "unset",
    boxSizing: "border-box",
    width: "100%",
    minHeight: 48,
    borderRadius: 12,
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 850,
    color: "var(--ink)",
    background: "var(--surface)",
    border: "1px solid var(--line)",
  },
  compareExpandIcon: {
    width: 28,
    height: 28,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    color: "var(--accent-strong)",
    background: "var(--accent-soft)",
    transition: "transform 180ms ease",
  },
  compareDetails: {
    overflowX: "auto",
    borderTop: "1px solid var(--line)",
    background: "var(--surface)",
  },
  compareFeatureRow: {
    display: "grid",
    gridTemplateColumns: "minmax(260px, 2fr) repeat(5, minmax(98px, 1fr))",
    gap: 12,
    padding: "11px 18px",
    minWidth: 900,
    alignItems: "center",
    fontSize: 13,
    color: "var(--ink)",
  },
  compareFeatureName: {
    fontSize: 13,
    lineHeight: 1.35,
    color: "var(--ink)",
  },
  compareCell: {
    textAlign: "center",
    minHeight: 30,
    display: "grid",
    placeItems: "center",
    borderRadius: 8,
    margin: "0 2px",
    transition: "background 180ms ease",
  },
  compareProCell: {
    background: "var(--accent-soft)",
  },
  includedGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))",
    gap: 14,
  },
  includedCard: {
    minHeight: 190,
    borderRadius: 16,
    padding: "22px 24px",
    background: "var(--surface)",
    border: "1px solid var(--line)",
  },
  includedBlue: {
    background: "var(--surface-2)",
    border: "1px solid var(--line)",
  },
  includedGreen: {
    background: "var(--surface-2)",
    border: "1px solid var(--line)",
  },
  includedGold: {
    background: "var(--surface-2)",
    border: "1px solid var(--line)",
  },
  includedLavender: {
    background: "var(--surface-2)",
    border: "1px solid var(--line)",
  },
  includedTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 20,
    lineHeight: 1,
    letterSpacing: "-0.03em",
    margin: "18px 0 8px",
    color: "var(--ink)",
  },
  includedBody: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.55,
    color: "var(--ink-3)",
    textWrap: "pretty",
  },
  /* flat guarantee block — was a photo-texture card, now flat ink dark */
  guaranteeCard: {
    padding: "28px 32px",
    display: "flex", justifyContent: "space-between",
    alignItems: "center", gap: 24, flexWrap: "wrap",
    borderRadius: 16,
    background: "var(--ink)",
    border: "1px solid var(--line)",
    color: "#FFFFFF",
  },
  guaranteeH3: {
    fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700,
    letterSpacing: "-0.02em", margin: 0, color: "#FFFFFF",
  },
  guaranteeBody: {
    fontSize: 13.5, color: "rgba(255,255,255,0.78)",
    margin: "6px 0 0", textWrap: "pretty",
  },
  ctaGlassButton: {
    all: "unset",
    cursor: "pointer",
    minHeight: 42,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 16px",
    borderRadius: 999,
    color: "var(--on-accent)",
    fontSize: 13,
    fontWeight: 850,
    background: "var(--accent)",
  },
  ctaPrimaryButton: {
    background: "var(--accent-strong)",
    color: "#FFFFFF",
  },
};
