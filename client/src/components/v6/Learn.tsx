import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ART_HOUSE_TEXTURES, DESKTOP_TEXTURES, STUDIO_TEXTURES } from "../../lib/randomTextures";
import {
  studioCompeteButtonItemStyles,
  studioCompeteCardStyles,
  studioDarkLiquidGlassPill,
  studioGlassBackdrop,
  studioHeroWash,
  studioLiquidGlass,
  studioListButtonRowStyles,
  studioListCardStyles,
  studioTextureCardBackground,
  studioTextureCardStyles,
} from "./styles/studioSurfaces";

type Section = "how" | "pricing";

type HeroConfig = {
  title: string;
  copy: string;
  cta: string;
  prompt: string;
  background: string;
  dock: [string, string][];
};

const LEARN_HERO: Record<Section, HeroConfig> = {
  how: {
    title: "See how the deal desk works.",
    copy: "Yulia turns chat, files, models, and decisions into one live work surface. The canvas shows the work; the chat rail stays the front door.",
    cta: "Ask Yulia to walk the desk",
    prompt: "Walk me through how Yulia runs the deal desk from chat to models, files, Studio, and audit trail.",
    background:
      `linear-gradient(155deg, rgba(15,34,58,0.76) 0%, rgba(54,100,142,0.46) 48%, rgba(14,25,48,0.78) 100%), url('${STUDIO_TEXTURES.navy}')`,
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
    prompt: "Help me choose the right smbX plan based on deal volume, Studio exports, model runs, API/MCP access, and agent usage.",
    background: studioHeroWash,
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

  // Scroll to anchor whenever an anchor arrives — wait one frame so the
  // newly-active section has mounted its DOM before we try to find it.
  useEffect(() => {
    if (!anchor) return;
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(anchor);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(raf);
  }, [anchor, active]);

  return (
    <div className="m-fade-up" style={L.page}>
      <header style={{ ...L.hero, backgroundImage: hero.background }}>
        <div style={L.heroGlow} aria-hidden="true" />
        <div style={L.heroMain}>
          <div>
            <h1 style={L.heroH1}>{hero.title}</h1>
            <p style={L.heroTag}>{hero.copy}</p>
            <button
              className="m-state"
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
            className="m-state"
            style={{
              ...L.subnavBtn,
              fontWeight: active === t.id ? 600 : 500,
              color: active === t.id ? "var(--m-on-surface)" : "var(--m-on-surface-var)",
              background: active === t.id ? "rgba(255,255,255,0.90)" : "transparent",
              border: active === t.id ? "1px solid rgba(214,225,240,0.92)" : "1px solid transparent",
              boxShadow: active === t.id ? "0 10px 24px -18px rgba(26,34,51,0.30), inset 0 1px 0 rgba(255,255,255,0.78)" : "none",
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
    accent: "#6A9BCC",
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
    texture: STUDIO_TEXTURES.green,
  },
  {
    meta: "02",
    title: "Work the deal",
    audience: "Canvas",
    detail: "The answer becomes a model, buyer map, file read, pipeline move, or Studio draft instead of staying trapped in chat.",
    action: "Build context",
    texture: STUDIO_TEXTURES.rose,
  },
  {
    meta: "03",
    title: "Ground the math",
    audience: "V19 models",
    detail: "Numbers come from deterministic models, source files, citations, and versioned assumptions.",
    action: "Verify",
    texture: STUDIO_TEXTURES.navy,
  },
  {
    meta: "04",
    title: "Ship the output",
    audience: "Studio + files",
    detail: "Drafts, pitch books, memos, and exports keep their source trail and audit state.",
    action: "Deliver",
    texture: STUDIO_TEXTURES.blue,
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
            border-radius: 22px !important;
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
              <article style={{ ...L.textureCard, backgroundImage: studioTextureCardBackground(card.texture) }}>
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
                  className="m-state"
                  style={L.competeItem}
                  onClick={() => onTalkToYulia?.(`Explain ${title} in the smbX deal operating layer. ${body}`)}
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
                  className="m-state"
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
        className="m-state"
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
    { background: "rgba(214,232,250,0.92)", color: "#355F89" },
    { background: "rgba(219,241,230,0.92)", color: "#326C55" },
    { background: "rgba(250,235,192,0.92)", color: "#7A5A1F" },
    { background: "rgba(255,255,255,0.22)", color: "#FFFFFF" },
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
      ? "0 24px 58px rgba(31,44,69,0.11), 0 6px 16px rgba(31,44,69,0.06), inset 0 1px 0 rgba(255,255,255,0.90)"
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
    blue: {
      backgroundImage:
        `linear-gradient(145deg, rgba(19,55,92,0.70), rgba(87,137,187,0.42) 54%, rgba(18,35,65,0.66)), url('${DESKTOP_TEXTURES.filesAll}')`,
      color: "#FFFFFF",
    },
    green: {
      backgroundImage:
        `linear-gradient(145deg, rgba(21,79,62,0.64), rgba(74,137,110,0.42) 54%, rgba(19,43,43,0.66)), url('${DESKTOP_TEXTURES.filesDeals}')`,
      color: "#FFFFFF",
    },
    gold: {
      backgroundImage:
        `linear-gradient(145deg, rgba(120,80,28,0.58), rgba(205,159,86,0.34) 52%, rgba(68,45,25,0.58)), url('${DESKTOP_TEXTURES.filesAction}')`,
      color: "#FFFFFF",
    },
    dark: {
      backgroundImage:
        `linear-gradient(145deg, rgba(50,46,108,0.62), rgba(116,108,184,0.40) 52%, rgba(24,30,68,0.66)), url('${DESKTOP_TEXTURES.filesRoom}')`,
      color: "#FFFFFF",
    },
  };

  return {
    ...H.surfaceCard,
    ...recipes[tone],
  };
}

const LEARN_ACCENT_ART = "/textures/desktop/art-house/art-house-03.png?v=20260517-learn-accent-room-2";

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
    borderRadius: 30,
    padding: "38px 40px",
    background:
      "radial-gradient(circle at 14% 0%, rgba(106,155,204,0.14), transparent 34%), linear-gradient(155deg, rgba(255,255,255,0.97), rgba(247,251,255,0.90))",
    border: "1px solid rgba(219,228,241,0.94)",
    boxShadow: "0 34px 84px rgba(31,44,69,0.12), 0 8px 22px rgba(31,44,69,0.06), inset 0 1px 0 rgba(255,255,255,0.94)",
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
    color: "var(--m-on-surface)",
    textWrap: "balance",
  },
  openLead: {
    margin: "20px 0 0",
    maxWidth: 720,
    fontSize: 16,
    lineHeight: 1.62,
    color: "var(--m-on-surface-mid)",
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
    background: "linear-gradient(180deg, rgba(247,251,255,0.96), rgba(233,243,252,0.84))",
    border: "1px solid rgba(211,224,239,0.88)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.92)",
    color: "#355F89",
    fontSize: 12,
    fontWeight: 800,
  },
  artCard: {
    position: "relative",
    minHeight: 430,
    borderRadius: 30,
    overflow: "hidden",
    backgroundImage:
      `linear-gradient(145deg, rgba(16,31,52,0.30), rgba(65,110,143,0.18)), url('${ART_HOUSE_TEXTURES.learn}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid rgba(255,255,255,0.46)",
    boxShadow: "0 44px 110px rgba(31,44,69,0.22), 0 12px 28px rgba(31,44,69,0.10), inset 0 1px 0 rgba(255,255,255,0.30)",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "flex-end",
  },
  artWash: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(9,18,31,0.10), rgba(9,18,31,0.48)), radial-gradient(circle at 18% 0%, rgba(255,255,255,0.22), transparent 42%)",
    pointerEvents: "none",
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
    textShadow: "0 3px 22px rgba(10,22,38,0.40)",
    textWrap: "balance",
  },
  artBody: {
    margin: "12px 0 18px",
    maxWidth: 470,
    fontSize: 14.5,
    lineHeight: 1.55,
    color: "rgba(255,255,255,0.90)",
    textShadow: "0 2px 14px rgba(10,22,38,0.32)",
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
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: 850,
    ...studioDarkLiquidGlassPill,
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
    color: "var(--m-on-surface)",
    textWrap: "balance",
  },
  sectionLead: {
    margin: "9px 0 0",
    maxWidth: 760,
    fontSize: 14.5,
    lineHeight: 1.56,
    color: "var(--m-on-surface-mid)",
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
    borderRadius: 26,
    padding: "24px 26px",
    background: "linear-gradient(155deg, rgba(255,255,255,0.98), rgba(248,251,255,0.92))",
    border: "1px solid rgba(219,228,241,0.94)",
    boxShadow: "0 24px 62px rgba(31,44,69,0.10), 0 6px 16px rgba(31,44,69,0.06), inset 0 1px 0 rgba(255,255,255,0.94)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    color: "var(--m-on-surface)",
  },
  stepCardBlue: {
    background:
      "radial-gradient(circle at 14% 0%, rgba(106,155,204,0.16), transparent 36%), linear-gradient(155deg, rgba(255,255,255,0.98), rgba(235,245,255,0.91))",
    border: "1px solid rgba(176,205,232,0.82)",
  },
  stepCardGreen: {
    background:
      "radial-gradient(circle at 14% 0%, rgba(98,153,135,0.15), transparent 36%), linear-gradient(155deg, rgba(255,255,255,0.98), rgba(235,248,241,0.91))",
    border: "1px solid rgba(181,218,198,0.78)",
  },
  stepCardGold: {
    background:
      "radial-gradient(circle at 14% 0%, rgba(214,163,92,0.18), transparent 36%), linear-gradient(155deg, rgba(255,255,255,0.98), rgba(255,247,225,0.91))",
    border: "1px solid rgba(232,207,146,0.78)",
  },
  stepCardDecision: {
    background:
      "radial-gradient(circle at 14% 0%, rgba(255,255,255,0.22), transparent 38%), linear-gradient(145deg, rgba(35,83,115,0.96), rgba(65,113,143,0.88) 54%, rgba(32,45,79,0.96))",
    border: "1px solid rgba(255,255,255,0.26)",
    color: "#FFFFFF",
    boxShadow: "0 30px 78px rgba(40,88,122,0.22), 0 8px 22px rgba(31,44,69,0.10), inset 0 1px 0 rgba(255,255,255,0.22)",
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
    background: "rgba(255,255,255,0.54)",
    border: "1px solid rgba(255,255,255,0.42)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.78)",
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
    borderRadius: 26,
    padding: "24px 26px",
    background: "linear-gradient(155deg, rgba(255,255,255,0.98), rgba(248,251,255,0.92))",
    border: "1px solid rgba(219,228,241,0.94)",
    boxShadow: "0 24px 62px rgba(31,44,69,0.10), 0 6px 16px rgba(31,44,69,0.06), inset 0 1px 0 rgba(255,255,255,0.94)",
  },
  storyNumber: {
    display: "inline-grid",
    placeItems: "center",
    width: 42,
    height: 42,
    borderRadius: 15,
    background: "linear-gradient(180deg, rgba(232,242,251,0.98), rgba(211,226,242,0.88))",
    color: "#416F9C",
    fontSize: 12,
    fontWeight: 850,
    letterSpacing: "0.1em",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.86), 0 10px 24px rgba(53,95,137,0.10)",
  },
  storyTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 27,
    lineHeight: 1,
    letterSpacing: "-0.04em",
    margin: "18px 0 9px",
    color: "var(--m-on-surface)",
    textWrap: "balance",
  },
  storyBody: {
    margin: 0,
    maxWidth: 780,
    fontSize: 14,
    lineHeight: 1.55,
    color: "var(--m-on-surface-var)",
    textWrap: "pretty",
  },
  storyOutcome: {
    minHeight: 190,
    borderRadius: 26,
    padding: "22px",
    background: "linear-gradient(145deg, rgba(239,247,255,0.92), rgba(249,252,255,0.98))",
    border: "1px solid rgba(211,224,239,0.90)",
    boxShadow: "0 20px 52px rgba(31,44,69,0.08), inset 0 1px 0 rgba(255,255,255,0.94)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    color: "#355F89",
    fontSize: 20,
    lineHeight: 1.05,
    letterSpacing: "-0.025em",
  },
  storyOutcomeLine: {
    width: 46,
    height: 4,
    borderRadius: 999,
    background: "linear-gradient(90deg, #6A9BCC, rgba(106,155,204,0.18))",
  },
  systemPanel: {
    position: "relative",
    marginBottom: 46,
    borderRadius: 30,
    padding: "32px",
    overflow: "hidden",
    color: "#FFFFFF",
    backgroundImage:
      `linear-gradient(145deg, rgba(17,43,73,0.78), rgba(63,112,151,0.46) 54%, rgba(17,32,59,0.74)), url('${DESKTOP_TEXTURES.learnHero}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid rgba(255,255,255,0.32)",
    boxShadow: "0 40px 96px rgba(31,44,69,0.22), 0 10px 24px rgba(31,44,69,0.10), inset 0 1px 0 rgba(255,255,255,0.22)",
  },
  systemVeil: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(115deg, rgba(255,255,255,0.16), transparent 32%, rgba(255,255,255,0.08) 100%)",
    pointerEvents: "none",
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
    textShadow: "0 3px 22px rgba(10,22,38,0.34)",
  },
  systemLead: {
    margin: "11px 0 0",
    maxWidth: 760,
    fontSize: 14.5,
    lineHeight: 1.55,
    color: "rgba(255,255,255,0.86)",
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
    borderRadius: 22,
    background:
      "radial-gradient(circle at 12% 0%, rgba(255,255,255,0.26), transparent 42%), linear-gradient(180deg, rgba(255,255,255,0.17), rgba(255,255,255,0.07))",
    border: "0.5px solid rgba(255,255,255,0.36)",
    boxShadow: "0 20px 50px rgba(10,22,38,0.24), inset 0 1px 0 rgba(255,255,255,0.32)",
    backdropFilter: "blur(8px) saturate(155%) contrast(1.06)",
    WebkitBackdropFilter: "blur(8px) saturate(155%) contrast(1.06)",
  },
  optionRow: {
    minHeight: 50,
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr 1fr 1.2fr",
    gap: 14,
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "0.5px solid rgba(255,255,255,0.22)",
    color: "rgba(255,255,255,0.88)",
    fontSize: 13,
    lineHeight: 1.3,
  },
  systemStep: {
    minHeight: 170,
    borderRadius: 22,
    padding: "18px",
    background:
      "radial-gradient(circle at 12% 0%, rgba(255,255,255,0.26), transparent 42%), linear-gradient(180deg, rgba(255,255,255,0.17), rgba(255,255,255,0.06))",
    border: "0.5px solid rgba(255,255,255,0.34)",
    boxShadow: "0 18px 48px rgba(10,22,38,0.22), inset 0 1px 0 rgba(255,255,255,0.32)",
    backdropFilter: "blur(5px) saturate(155%) contrast(1.08) brightness(1.04)",
    WebkitBackdropFilter: "blur(5px) saturate(155%) contrast(1.08) brightness(1.04)",
  },
  systemNumber: {
    display: "inline-grid",
    placeItems: "center",
    width: 34,
    height: 34,
    borderRadius: 12,
    background: "rgba(255,255,255,0.16)",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: 850,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.34)",
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
    color: "rgba(255,255,255,0.84)",
    textWrap: "pretty",
  },
  surfaceIndex: {
    width: 36,
    height: 36,
    borderRadius: 13,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(180deg, rgba(232,242,251,0.98), rgba(211,226,242,0.86))",
    color: "#416F9C",
    fontSize: 11,
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
  artPanel: {
    position: "relative",
    minHeight: 360,
    borderRadius: 30,
    overflow: "hidden",
    backgroundImage:
      `linear-gradient(145deg, rgba(18,49,82,0.72), rgba(82,132,166,0.44) 54%, rgba(18,32,59,0.70)), url('${DESKTOP_TEXTURES.filesHero}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid rgba(255,255,255,0.48)",
    boxShadow: "0 42px 104px rgba(31,44,69,0.18), 0 12px 28px rgba(31,44,69,0.10), inset 0 1px 0 rgba(255,255,255,0.30)",
  },
  artPanelSheen: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(115deg, rgba(255,255,255,0.30) 0%, transparent 28%, transparent 62%, rgba(255,255,255,0.12) 100%)",
    pointerEvents: "none",
  },
  artAccentTile: {
    position: "absolute",
    top: 24,
    right: 24,
    width: 158,
    height: 124,
    borderRadius: 22,
    backgroundImage:
      `linear-gradient(145deg, rgba(13,30,52,0.18), rgba(255,255,255,0.08)), url('${LEARN_ACCENT_ART}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid rgba(255,255,255,0.34)",
    boxShadow: "0 22px 58px rgba(10,22,38,0.20), inset 0 1px 0 rgba(255,255,255,0.26)",
    opacity: 0.72,
  },
  artGlassMemo: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 24,
    padding: "22px 24px",
    borderRadius: 24,
    background:
      "radial-gradient(circle at 10% 0%, rgba(255,255,255,0.34), transparent 42%), linear-gradient(180deg, rgba(255,255,255,0.24), rgba(31,57,84,0.24))",
    border: "0.5px solid rgba(255,255,255,0.56)",
    boxShadow: "0 28px 64px rgba(10,22,38,0.30), inset 0 1px 0 rgba(255,255,255,0.48), inset 0 -1px 0 rgba(255,255,255,0.12)",
    backdropFilter: "blur(13px) saturate(175%) contrast(1.08) brightness(1.04)",
    WebkitBackdropFilter: "blur(13px) saturate(175%) contrast(1.08) brightness(1.04)",
    color: "#FFFFFF",
  },
  artMemoTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 29,
    lineHeight: 1.02,
    letterSpacing: "-0.035em",
    margin: 0,
    color: "#FFFFFF",
    textShadow: "0 2px 16px rgba(10,22,38,0.34)",
  },
  artMemoBody: {
    margin: "10px 0 0",
    fontSize: 14,
    lineHeight: 1.55,
    color: "rgba(255,255,255,0.90)",
    maxWidth: 560,
    textWrap: "pretty",
  },
  differencePanel: {
    minHeight: 430,
    borderRadius: 30,
    padding: "30px 32px",
    background:
      "radial-gradient(circle at 16% 0%, rgba(106,155,204,0.14), transparent 35%), linear-gradient(155deg, rgba(255,255,255,0.86), rgba(246,250,255,0.72))",
    border: "1px solid rgba(219,228,241,0.92)",
    boxShadow: "0 30px 78px rgba(31,44,69,0.12), 0 8px 20px rgba(31,44,69,0.06), inset 0 1px 0 rgba(255,255,255,0.92)",
    backdropFilter: "blur(10px) saturate(145%)",
    WebkitBackdropFilter: "blur(10px) saturate(145%)",
  },
  sectionH2: {
    fontFamily: "var(--font-display)",
    fontSize: 34,
    lineHeight: 1,
    letterSpacing: "-0.045em",
    margin: 0,
    color: "var(--m-on-surface)",
    textWrap: "balance",
  },
  sectionLead: {
    margin: "8px 0 0",
    maxWidth: 720,
    fontSize: 14.5,
    lineHeight: 1.55,
    color: "var(--m-on-surface-mid)",
    textWrap: "pretty",
  },
  differenceStack: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    marginTop: 22,
    overflow: "hidden",
    borderRadius: 22,
    background: "rgba(255,255,255,0.58)",
    border: "1px solid rgba(225,232,242,0.80)",
  },
  differenceRow: {
    borderBottom: "1px solid rgba(213,225,239,0.72)",
    background: "rgba(255,255,255,0.42)",
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
    boxShadow: "0 8px 18px rgba(31,44,69,0.16)",
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
    color: "var(--m-on-surface)",
  },
  differenceHint: {
    fontSize: 11.5,
    color: "var(--m-on-surface-var)",
  },
  differenceToggle: {
    width: 26,
    height: 26,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    background: "rgba(236,243,251,0.84)",
    color: "#51759B",
    fontSize: 15,
    fontWeight: 800,
    transition: "transform 180ms ease",
  },
  differenceBody: {
    margin: 0,
    padding: "0 56px 17px 42px",
    fontSize: 13,
    lineHeight: 1.58,
    color: "var(--m-on-surface-var)",
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
    borderRadius: 24,
    padding: 18,
    overflow: "hidden",
    backgroundSize: "cover, cover, cover",
    backgroundPosition: "center, center, center",
    border: "1px solid rgba(255,255,255,0.46)",
    boxShadow: "0 34px 86px rgba(31,44,69,0.16), 0 8px 22px rgba(31,44,69,0.08), inset 0 1px 0 rgba(255,255,255,0.28)",
    display: "flex",
    alignItems: "flex-end",
  },
  surfaceGlass: {
    width: "100%",
    minHeight: 122,
    borderRadius: 20,
    padding: "17px 17px 16px",
    background:
      "radial-gradient(circle at 12% 0%, rgba(255,255,255,0.32), transparent 42%), linear-gradient(180deg, rgba(255,255,255,0.22), rgba(23,42,64,0.22))",
    border: "0.5px solid rgba(255,255,255,0.52)",
    boxShadow: "0 22px 52px rgba(10,22,38,0.26), inset 0 1px 0 rgba(255,255,255,0.48), inset 0 -1px 0 rgba(255,255,255,0.10)",
    backdropFilter: "blur(12px) saturate(170%) contrast(1.08) brightness(1.04)",
    WebkitBackdropFilter: "blur(12px) saturate(170%) contrast(1.08) brightness(1.04)",
  },
  surfaceTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 23,
    lineHeight: 1,
    letterSpacing: "-0.035em",
    margin: 0,
    color: "currentColor",
    textShadow: "0 2px 14px rgba(10,22,38,0.32)",
  },
  surfaceBody: {
    margin: "10px 0 0",
    fontSize: 13,
    lineHeight: 1.5,
    color: "currentColor",
    opacity: 0.9,
    textWrap: "pretty",
  },
  flowPanel: {
    position: "relative",
    marginBottom: 42,
    borderRadius: 30,
    padding: "30px 32px",
    overflow: "hidden",
    color: "#FFFFFF",
    backgroundImage:
      `linear-gradient(145deg, rgba(19,48,81,0.76), rgba(80,128,166,0.44) 54%, rgba(22,38,67,0.72)), url('${DESKTOP_TEXTURES.learnHero}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid rgba(255,255,255,0.30)",
    boxShadow: "0 36px 94px rgba(31,44,69,0.20), 0 10px 24px rgba(31,44,69,0.10), inset 0 1px 0 rgba(255,255,255,0.20)",
  },
  flowVeil: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(110deg, rgba(255,255,255,0.13), transparent 34%, rgba(255,255,255,0.07) 100%)",
    pointerEvents: "none",
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
    color: "rgba(255,255,255,0.84)",
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
    borderRadius: 22,
    padding: "18px 18px 17px",
    background:
      "radial-gradient(circle at 12% 0%, rgba(255,255,255,0.28), transparent 42%), linear-gradient(180deg, rgba(255,255,255,0.17), rgba(255,255,255,0.06))",
    border: "0.5px solid rgba(255,255,255,0.34)",
    boxShadow: "0 18px 48px rgba(10,22,38,0.22), inset 0 1px 0 rgba(255,255,255,0.32)",
    backdropFilter: "blur(8px) saturate(155%) contrast(1.05)",
    WebkitBackdropFilter: "blur(8px) saturate(155%) contrast(1.05)",
  },
  flowNumber: {
    display: "inline-grid",
    placeItems: "center",
    width: 34,
    height: 34,
    borderRadius: 12,
    background: "rgba(255,255,255,0.16)",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: 800,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.34)",
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
    color: "rgba(255,255,255,0.82)",
    textWrap: "pretty",
  },
  capabilityLibrary: {
    marginBottom: 42,
    borderRadius: 28,
    padding: 24,
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.94), rgba(247,251,255,0.82))",
    border: "1px solid rgba(219,228,241,0.92)",
    boxShadow: "0 26px 68px rgba(31,44,69,0.10), 0 8px 20px rgba(31,44,69,0.05), inset 0 1px 0 rgba(255,255,255,0.92)",
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
    borderRadius: 20,
    border: "1px solid rgba(224,232,243,0.86)",
    background: "rgba(255,255,255,0.72)",
  },
  capabilityRow: {
    minHeight: 84,
    display: "grid",
    gridTemplateColumns: "54px minmax(0, 1fr)",
    gap: 14,
    alignItems: "center",
    padding: "16px 20px",
    color: "var(--m-on-surface)",
  },
  capabilityIndex: {
    width: 34,
    height: 34,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(180deg, rgba(232,242,251,0.98), rgba(211,226,242,0.86))",
    color: "#416F9C",
    fontSize: 12,
    fontWeight: 850,
    letterSpacing: "0.08em",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.86), 0 10px 24px rgba(53,95,137,0.10)",
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
    color: "var(--m-on-surface)",
  },
  capabilityBody: {
    fontSize: 13,
    lineHeight: 1.48,
    color: "var(--m-on-surface-var)",
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
    borderRadius: 26,
    padding: "28px 30px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    overflow: "hidden",
    background: "linear-gradient(150deg, rgba(255,255,255,0.98) 0%, rgba(248,251,255,0.96) 58%, rgba(235,243,252,0.92) 100%)",
    border: "1px solid rgba(213,225,239,0.92)",
    boxShadow: "0 26px 68px rgba(31,44,69,0.12), 0 8px 20px rgba(31,44,69,0.06), inset 0 1px 0 rgba(255,255,255,0.92)",
    color: "var(--m-on-surface)",
  },
  loopLeadTitle: {
    margin: 0,
    maxWidth: 520,
    fontSize: 32,
    lineHeight: 1.02,
    letterSpacing: "-0.045em",
    color: "var(--m-on-surface)",
  },
  loopLeadBody: {
    margin: "18px 0 0",
    maxWidth: 520,
    fontSize: 15.5,
    lineHeight: 1.58,
    color: "var(--m-on-surface-var)",
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
    background: "radial-gradient(circle at 12% 0%, rgba(255,255,255,0.34), transparent 42%), linear-gradient(180deg, rgba(255,255,255,0.22), rgba(30,45,66,0.22) 48%, rgba(16,28,45,0.28))",
    border: "0.5px solid rgba(255,255,255,0.56)",
    boxShadow: "0 16px 34px -22px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.50), inset 0 -1px 0 rgba(255,255,255,0.14)",
    backdropFilter: "blur(10px) saturate(175%) contrast(1.08) brightness(1.05)",
    WebkitBackdropFilter: "blur(10px) saturate(175%) contrast(1.08) brightness(1.05)",
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
    borderRadius: 22,
    display: "grid",
    gridTemplateColumns: "56px minmax(0, 1fr)",
    gap: 18,
    alignItems: "start",
    background: "rgba(255,255,255,0.96)",
    border: "1px solid rgba(219,228,241,0.92)",
    boxShadow: "0 18px 44px rgba(31,44,69,0.08), 0 4px 12px rgba(31,44,69,0.05), inset 0 1px 0 rgba(255,255,255,0.90)",
    color: "var(--m-on-surface)",
  },
  stepN: {
    width: 44,
    height: 44,
    borderRadius: 15,
    display: "grid",
    placeItems: "center",
    fontSize: 11,
    color: "#355F89",
    background: "linear-gradient(180deg, rgba(232,242,251,0.98), rgba(210,225,241,0.88))",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.86), 0 10px 24px rgba(53,95,137,0.12)",
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
    background: "var(--m-surface-2)", borderRadius: 999,
    color: "var(--m-on-surface-var)", fontWeight: 600, letterSpacing: "0.1em",
  },
  chipDark: {
    background: "rgba(231,241,250,0.84)",
    color: "#426A83",
    opacity: 0.9,
  },
  capabilityMosaic: {
    display: "grid",
    gap: 14,
  },
  capCard: {
    minHeight: 146,
    padding: "22px 22px 20px",
    borderRadius: 22,
    background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(249,251,255,0.94))",
    border: "1px solid rgba(219,228,241,0.92)",
    boxShadow: "0 18px 44px rgba(31,44,69,0.08), 0 4px 12px rgba(31,44,69,0.05), inset 0 1px 0 rgba(255,255,255,0.90)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: 10,
    color: "var(--m-on-surface)",
  },
  capCardWide: {
    background: `linear-gradient(145deg, rgba(20,47,75,0.72) 0%, rgba(82,132,166,0.44) 52%, rgba(18,25,46,0.76) 100%), url('${DESKTOP_TEXTURES.searchFinancing}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid rgba(255,255,255,0.32)",
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
    fontSize: 12.5, lineHeight: 1.55, color: "var(--m-on-surface-var)", margin: 0,
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
    borderRadius: 26,
    padding: "28px 32px",
    background: "#FFFFFF",
    border: "1px solid var(--m-outline-var)",
    boxShadow: "0 24px 64px rgba(31,44,69,0.12), 0 6px 16px rgba(31,44,69,0.07)",
    display: "flex",
    alignItems: "center",
  },
  whyBody: {
    fontSize: 16,
    lineHeight: 1.7,
    color: "var(--m-on-surface)",
    margin: 0,
    textWrap: "pretty",
  },
  statPanel: {
    minHeight: 230,
    borderRadius: 26,
    padding: "24px 26px",
    backgroundImage: `linear-gradient(145deg, rgba(255,255,255,0.94) 0%, rgba(236,244,253,0.84) 52%, rgba(214,229,244,0.76) 100%), url('${DESKTOP_TEXTURES.pipelineCard}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid rgba(188,206,226,0.82)",
    boxShadow: "0 24px 64px rgba(52,84,124,0.13), inset 0 1px 0 rgba(255,255,255,0.84)",
    display: "flex",
    alignItems: "center",
  },
  statRow: {
    display: "grid",
    gridTemplateColumns: "92px minmax(0,1fr)",
    gap: 14,
    alignItems: "baseline",
    padding: "10px 0",
    borderBottom: "1px solid rgba(166,181,210,0.22)",
  },
  stat: {
    fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28,
    letterSpacing: "-0.03em", color: "#274D73", minWidth: 72,
  },
  statLabel: {
    fontSize: 13,
    color: "#52657C",
    opacity: 1,
  },
};

/* ─── PRICING ────────────────────────────────────────────── */

type PriceValue = number | "Free" | "From $2,500";

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
    price: 79,
    sub: "For one operator, one deal at a time.",
    cta: "Choose Solo",
    prompt: "I'm interested in the $79 Solo plan. Walk me through the models, exports, and agent-ready workflow.",
    features: [
      "Unlimited deliverables",
      "Recast, Baseline, buyer engine",
      "One live deal room",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 199,
    sub: "For active dealmakers and full-stack work.",
    cta: "Choose Pro",
    prompt: "I'm interested in Pro at $199. Walk me through QofE Lite, the parallel-deal pipeline, and the audience-variant memos.",
    featured: true,
    features: [
      "QofE Lite pre-read",
      "Unlimited active deals",
      "LBO, DCF, comps, tax, legal",
    ],
  },
  {
    id: "team",
    name: "Team",
    price: 499,
    sub: "For boutiques and partner-led firms.",
    cta: "Choose Team",
    prompt: "I'm interested in Team at $499. How do seats, shared deal vaults, firm templates, and specialist handoffs work?",
    features: [
      "Up to 5 seats",
      "Shared vault and templates",
      "Specialist handoff coordination",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "From $2,500",
    sub: "For larger teams and regulated environments.",
    cta: "Talk to Yulia",
    prompt: "I want to learn more about Enterprise from $2,500 — SSO, single-tenant, SOC 2, custom seat count, API controls, and the named account manager.",
    features: [
      "Custom seat count",
      "SSO, SOC 2, single tenant",
      "MCP and API infrastructure",
    ],
  },
];

const INCLUDED_GROUPS: Capability[] = [
  {
    title: "Every paid tier",
    body: "Unlimited Yulia chat, Recast, Baseline valuation, 28 document generators, buyer-list engine, deal room, brand kit, and 180 days of post-close PMI support.",
  },
  {
    title: "Pro adds the full deal stack",
    body: "QofE Lite, full LBO with DCF and precedent comps, 22-gate scoring, audience-variant memos, sector buyer universes, negotiation drafts, tax/legal structuring, cap table, and API access.",
  },
  {
    title: "Team adds firm infrastructure",
    body: "Up to five seats, a shared deal vault, firm templates, role-based access, per-user audit trail, and specialist handoff coordination across CPA, attorney, banker, lender, and advisor.",
  },
  {
    title: "Enterprise adds governed deployment",
    body: "Custom seats, SSO, single-tenant deployment, SOC 2 path, white-label exports, MCP server access after launch, higher API limits, uptime SLA, and a named account manager.",
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
      { feature: "Buyer-list engine",                 cells: ["preview",    "✓",         "✓",         "✓",         "✓"] },
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
      { feature: "Negotiation tactics + counter drafting",cells: ["—", "—", "✓", "✓", "✓"] },
      { feature: "Cap table + waterfall modeling",        cells: ["—", "—", "✓", "✓", "✓"] },
      { feature: "Owner-readiness scoring · CEPA",        cells: ["—", "—", "✓", "✓", "✓"] },
      { feature: "API access · standard rate limits",     cells: ["—", "—", "✓", "✓", "✓"] },
    ],
  },
  {
    title: "V19 usage — included monthly",
    rows: [
      { feature: "V19 allowance",                    cells: ["30",  "600",   "2,500",  "12,000", "custom"] },
      { feature: "Server model runs",                cells: ["20",  "300",   "1,200",  "6,000",  "custom"] },
      { feature: "Studio books",                     cells: ["1",   "12",    "60",     "300",    "custom"] },
      { feature: "Studio exports",                   cells: ["1",   "30",    "150",    "600",    "custom"] },
      { feature: "API/MCP calls",                    cells: ["—",   "—",     "2,500",  "15,000", "custom"] },
      { feature: "Agent usage",                      cells: ["—",   "—",     "—",      "supervised", "autonomous"] },
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
    body: "Free, Solo, Pro, Team, and Enterprise stay simple. No wallet, no success fee, no per-deal toll.",
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
    title: "Agent access",
    body: "Pro starts API/MCP access. Team adds supervised agent use. Enterprise opens autonomous governed scope.",
  },
];

const PRICING_PLAN_ORDER = ["free", "solo", "pro", "team", "enterprise"] as const;

const PLAN_TEXTURES: Record<string, string> = {
  free: STUDIO_TEXTURES.green,
  solo: STUDIO_TEXTURES.green,
  pro: STUDIO_TEXTURES.navy,
  team: STUDIO_TEXTURES.rose,
  enterprise: ART_HOUSE_TEXTURES.studioPreview,
};

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
            border-color 180ms ease,
            filter 180ms ease;
        }
        .pricing-tier-grid > div {
          min-width: 0;
          height: 100%;
        }
        .pricing-tier-card:hover {
          filter: saturate(1.04) contrast(1.01);
          border-color: rgba(255, 255, 255, 0.54) !important;
        }
        .pricing-tier-card:focus-visible {
          outline: 3px solid rgba(214, 173, 91, 0.70);
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
            border-radius: 22px !important;
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
                    backgroundImage: studioTextureCardBackground(PLAN_TEXTURES[plan.id]),
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
                    {featured && <span style={P.recommendedPill}>Recommended</span>}
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
                    className="m-state"
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
                    className="m-state"
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
      price: "$79/mo",
      builtFor: "Solo, one deal at a time",
      seats: "1",
      deals: "1",
      deliverables: "Unlimited",
    },
    {
      plan: "Pro",
      price: "$199/mo",
      builtFor: "Active dealmakers, full stack",
      seats: "1",
      deals: "Unlimited",
      deliverables: "Unlimited",
    },
    {
      plan: "Team",
      price: "$499/mo",
      builtFor: "Boutiques and partner-led firms",
      seats: "Up to 5",
      deals: "Unlimited",
      deliverables: "Unlimited",
    },
    {
      plan: "Enterprise",
      price: "From $2,500/mo",
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
          transition: background 180ms ease, box-shadow 180ms ease;
        }
        .plan-compare-row:hover {
          background: linear-gradient(90deg, rgba(239,246,255,0.76), rgba(255,255,255,0.92));
          box-shadow: inset 3px 0 0 rgba(106,155,204,0.55);
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
            style={{ ...P.compareRow, borderBottom: index === rows.length - 1 ? "none" : "1px solid var(--m-outline-var)" }}
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
            className="m-state"
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
                      borderBottom: rowIndex === group.rows.length - 1 ? "none" : "1px solid rgba(219,228,241,0.78)",
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
    { background: "rgba(214,232,250,0.88)", color: "#345F85" },
    { background: "rgba(219,241,230,0.88)", color: "#346F58" },
    { background: "rgba(250,235,192,0.90)", color: "#816124" },
    { background: "rgba(229,226,250,0.88)", color: "#5B5796" },
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

const learnHeroWash =
  `radial-gradient(circle at 14% 8%, rgba(255,255,255,0.20), transparent 34%), linear-gradient(110deg, rgba(13,36,62,0.76) 0%, rgba(58,111,148,0.48) 50%, rgba(17,34,61,0.72) 100%), url('${DESKTOP_TEXTURES.learnHero}')`;

const L: Record<string, CSSProperties> = {
  page: {
    width: "min(100%, 1440px)",
    maxWidth: 1440,
    margin: "0 auto",
    boxSizing: "border-box",
  },
  hero: {
    backgroundImage: learnHeroWash,
    backgroundSize: "cover, cover, cover",
    backgroundPosition: "center, center, center",
    border: "1px solid rgba(255,255,255,0.34)",
    boxShadow: "0 46px 116px rgba(23,38,63,0.30), 0 20px 46px rgba(26,34,51,0.16), 0 4px 12px rgba(26,34,51,0.08), inset 0 1px 0 rgba(255,255,255,0.24)",
    borderRadius: 26,
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
  heroGlow: {
    position: "absolute", top: -110, right: -80,
    width: 340, height: 340, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 66%)",
    pointerEvents: "none",
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
    textShadow: "0 3px 24px rgba(10,22,38,0.34), 0 1px 2px rgba(10,22,38,0.26)",
  },
  heroTag: {
    position: "relative",
    fontSize: 15.5, lineHeight: 1.55, color: "rgba(255,255,255,0.90)",
    margin: "14px 0 0", maxWidth: 620, textWrap: "pretty",
    textShadow: "0 2px 16px rgba(10,22,38,0.28)",
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
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: 800,
    ...studioDarkLiquidGlassPill,
  },
  heroDock: {
    width: 360,
    display: "grid",
    gap: 10,
    flexShrink: 0,
  },
  heroDockItem: {
    padding: "14px 15px",
    borderRadius: 18,
    color: "#FFFFFF",
    background:
      "radial-gradient(circle at 12% 0%, rgba(255,255,255,0.28), transparent 44%), linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))",
    border: "0.5px solid rgba(255,255,255,0.42)",
    boxShadow: "0 18px 44px rgba(10,22,38,0.20), inset 0 1px 0 rgba(255,255,255,0.38), inset 0 -1px 0 rgba(255,255,255,0.08)",
    backdropFilter: "blur(9px) saturate(160%) contrast(1.07)",
    WebkitBackdropFilter: "blur(9px) saturate(160%) contrast(1.07)",
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
    color: "rgba(255,255,255,0.78)",
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
    borderRadius: 18,
    background: "radial-gradient(circle at 12% 0%, rgba(255,255,255,0.25), transparent 42%), linear-gradient(180deg, rgba(255,255,255,0.17), rgba(255,255,255,0.06))",
    border: "0.5px solid rgba(255,255,255,0.36)",
    boxShadow: "0 16px 34px -22px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.44), inset 0 -1px 0 rgba(255,255,255,0.10)",
    backdropFilter: "blur(5px) saturate(155%) contrast(1.08) brightness(1.04)",
    WebkitBackdropFilter: "blur(5px) saturate(155%) contrast(1.08) brightness(1.04)",
  },
  heroProofEyebrow: {
    fontSize: 9,
    letterSpacing: "0.15em",
    color: "#FFFFFF",
    opacity: 0.75,
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
    opacity: 0.78,
    fontSize: 12.5,
  },
  subnav: {
    display: "inline-flex", gap: 6, marginBottom: 22,
    padding: 4,
    borderRadius: 999,
    background: "rgba(255,255,255,0.62)",
    border: "1px solid rgba(214,225,240,0.80)",
    boxShadow: "0 14px 30px -24px rgba(31,44,69,0.34), inset 0 1px 0 rgba(255,255,255,0.76)",
    backdropFilter: "blur(8px) saturate(170%) contrast(1.04)",
    WebkitBackdropFilter: "blur(8px) saturate(170%) contrast(1.04)",
  },
  subnavBtn: {
    all: "unset", cursor: "pointer",
    padding: "9px 15px",
    borderRadius: 999,
    fontSize: 13,
    transition: "color 120ms ease, background 120ms ease, box-shadow 120ms ease",
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
    color: "var(--m-on-primary-container)",
    letterSpacing: "0.16em",
    fontWeight: 800,
  },
  sectionTitle: {
    fontFamily: "var(--font-display)",
    fontWeight: 750,
    fontSize: 30,
    lineHeight: 1,
    letterSpacing: "-0.045em",
    margin: 0,
    color: "var(--m-on-surface)",
    textWrap: "balance",
  },
  sectionSub: {
    maxWidth: 720,
    fontSize: 14,
    color: "var(--m-on-surface-mid)",
    lineHeight: 1.45,
  },
  textureGrid: {
    ...studioTextureCardStyles.grid,
  },
  textureCard: {
    ...studioTextureCardStyles.card,
  },
  textureMeta: studioTextureCardStyles.meta,
  textureTitle: {
    ...studioTextureCardStyles.title,
    fontSize: 22,
  },
  textureAudience: studioTextureCardStyles.audience,
  textureDetail: studioTextureCardStyles.detail,
  textureAction: studioTextureCardStyles.action,
  twoColumnGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(360px, 0.88fr)",
    gap: 18,
    alignItems: "stretch",
    marginBottom: 40,
  },
  competePanel: {
    ...studioCompeteCardStyles.panel,
    minHeight: 360,
  },
  listPanel: {
    ...studioListCardStyles.panel,
    minHeight: 360,
  },
  infoTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 32,
    lineHeight: 1,
    letterSpacing: "-0.045em",
    margin: 0,
    color: "var(--m-on-surface)",
    textWrap: "balance",
  },
  competeGrid: {
    ...studioCompeteCardStyles.grid,
  },
  competeItem: {
    ...studioCompeteButtonItemStyles,
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
    background: "rgba(232,238,252,.78)",
    color: "#3B6595",
    fontSize: 12,
    fontWeight: 900,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.72)",
  },
  listStack: {
    ...studioListCardStyles.stack,
  },
  listRow: {
    ...studioListButtonRowStyles,
  },
  listIcon: {
    ...studioListCardStyles.icon,
  },
  listBody: {
    ...studioListCardStyles.body,
  },
  cleanPill: {
    ...studioListCardStyles.cleanPill,
  },
  stepGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
  },
  stepCard: {
    ...studioListCardStyles.panel,
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
  stepNumber: {
    width: 42,
    height: 42,
    borderRadius: 15,
    display: "grid",
    placeItems: "center",
    color: "#FFFFFF",
    fontWeight: 900,
    background: "linear-gradient(135deg, #8A9AE8, #2E5C8A)",
  },
  stepTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 22,
    lineHeight: 1,
    letterSpacing: "-0.035em",
    margin: 0,
    color: "var(--m-on-surface)",
    textWrap: "balance",
  },
  stepBody: {
    margin: "10px 0 0",
    fontSize: 13,
    lineHeight: 1.48,
    color: "var(--m-on-surface-var)",
    textWrap: "pretty",
  },
};

const P: Record<string, CSSProperties> = {
  toggleRow: { display: "flex", justifyContent: "center", marginBottom: 18 },
  toggleWrap: {
    display: "inline-flex", padding: 4,
    background: "rgba(255,255,255,0.68)",
    border: "1px solid rgba(214,225,240,0.78)",
    borderRadius: 999,
    boxShadow: "0 14px 30px -24px rgba(31,44,69,0.34), inset 0 1px 0 rgba(255,255,255,0.76)",
    backdropFilter: "blur(8px) saturate(170%) contrast(1.04)",
    WebkitBackdropFilter: "blur(8px) saturate(170%) contrast(1.04)",
  },
  toggleBtn: {
    all: "unset", cursor: "pointer",
    padding: "8px 16px", borderRadius: 999,
    fontSize: 12.5, fontWeight: 600,
    transition: "background 120ms ease, color 120ms ease, box-shadow 120ms ease",
  },
  pricingTierGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
    gap: 12,
    alignItems: "stretch",
  },
  pricingTierCard: {
    boxSizing: "border-box",
    width: "100%",
    height: "100%",
    minHeight: 286,
    position: "relative",
    textAlign: "left",
    borderRadius: studioTextureCardStyles.card.borderRadius,
    padding: 17,
    border: "1px solid rgba(255,255,255,.28)",
    appearance: "none",
    WebkitAppearance: "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: "#FFFFFF",
    boxShadow: "0 22px 52px rgba(42,65,96,.16), inset 0 1px 0 rgba(255,255,255,.28)",
    font: "inherit",
    ...studioGlassBackdrop,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    overflow: "hidden",
    cursor: "pointer",
  },
  pricingTierFeatured: {
    borderColor: "rgba(255,255,255,.82)",
    boxShadow: "0 28px 68px rgba(31,55,93,.24), inset 0 0 0 1px rgba(255,255,255,.42)",
  },
  pricingTierMeta: {
    color: "rgba(255,255,255,.76)",
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
    textShadow: "0 2px 18px rgba(10,22,38,.28)",
  },
  pricingTierPrice: {
    fontFamily: "var(--font-display)",
    fontSize: 17,
    lineHeight: 1,
    fontWeight: 850,
    color: "rgba(255,255,255,.94)",
  },
  pricingTierSub: {
    color: "rgba(255,255,255,.88)",
    fontSize: 12.5,
    lineHeight: 1.35,
    fontWeight: 700,
  },
  pricingTierFeatures: {
    display: "grid",
    gap: 6,
    marginTop: "auto",
    color: "rgba(236,246,255,.90)",
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
    background: "rgba(255,255,255,.20)",
    color: "#FFFFFF",
    border: "1px solid rgba(255,255,255,.24)",
    fontSize: 12,
    fontWeight: 900,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.24)",
  },
  pricingDarkPill: {
    ...studioTextureCardStyles.action,
    marginTop: 0,
    alignSelf: "auto",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 38,
    padding: "0 15px",
    fontSize: 13,
    fontWeight: 900,
  },
  pricingChoiceGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(360px, 0.86fr)",
    gap: 18,
    alignItems: "stretch",
    marginBottom: 6,
  },
  planListPanel: {
    ...studioListCardStyles.panel,
    minHeight: 0,
  },
  planListStack: {
    ...studioListCardStyles.stack,
  },
  planListRow: {
    boxSizing: "border-box",
    display: "grid",
    gridTemplateColumns: "48px minmax(0, 1fr) auto",
    alignItems: "center",
    gap: 12,
    width: "100%",
    padding: 12,
    borderRadius: 18,
    background: "rgba(247,250,255,.82)",
    border: "1px solid rgba(153,176,209,.32)",
    color: "var(--m-on-surface)",
    font: "inherit",
    appearance: "none",
    WebkitAppearance: "none",
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.76)",
  },
  planListIcon: {
    ...studioListCardStyles.icon,
  },
  planListIconFeatured: {
    ...studioListCardStyles.icon,
    background: studioTextureCardBackground(STUDIO_TEXTURES.navy),
    backgroundSize: "cover",
    backgroundPosition: "center",
    boxShadow: "0 14px 30px rgba(46,92,138,.20), inset 0 1px 0 rgba(255,255,255,.28)",
  },
  planListBody: {
    ...studioListCardStyles.body,
  },
  planListPill: {
    ...studioListCardStyles.cleanPill,
    whiteSpace: "nowrap",
  },
  planFeaturedPill: {
    ...studioListCardStyles.warnPill,
    whiteSpace: "nowrap",
  },
  pricingCompetePanel: {
    ...studioCompeteCardStyles.panel,
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
    border: "1px solid rgba(255,255,255,.55)",
    borderRadius: 24,
    background: studioLiquidGlass,
    boxShadow: "0 18px 44px rgba(42,65,96,.10), inset 0 1px 0 rgba(255,255,255,.72)",
    display: "flex",
    flexDirection: "column",
    color: "var(--m-on-surface)",
    ...studioGlassBackdrop,
  },
  planFeatured: {
    border: "1px solid rgba(255,255,255,.34)",
    background: studioTextureCardBackground(STUDIO_TEXTURES.navy),
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: "#FFFFFF",
    boxShadow: "0 22px 52px rgba(46,92,138,.24), inset 0 1px 0 rgba(255,255,255,.28)",
  },
  popular: {
    position: "absolute", top: -10, left: 24,
    fontSize: 11.5, fontWeight: 800, letterSpacing: 0,
    background: "rgba(255,255,255,0.20)",
    border: "1px solid rgba(255,255,255,0.28)",
    color: "#FFFFFF",
    padding: "4px 10px", borderRadius: 999,
    backdropFilter: "blur(5px) saturate(155%) contrast(1.08)",
    WebkitBackdropFilter: "blur(5px) saturate(155%) contrast(1.08)",
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
    fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800,
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
    ...studioDarkLiquidGlassPill,
    transition: "border-color 180ms ease",
  },
  planActionFeatured: {
    color: "#FFFFFF",
  },
  featureRow: {
    display: "flex", gap: 8,
    fontSize: 12.5, color: "currentColor",
    opacity: 0.76,
    lineHeight: 1.4,
  },
  compareStage: {
    ...studioCompeteCardStyles.panel,
    overflow: "hidden",
    padding: 0,
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
    color: "var(--m-on-primary-container)",
  },
  compareToolbarTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 24,
    lineHeight: 1,
    letterSpacing: "-0.04em",
    color: "var(--m-on-surface)",
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
    fontWeight: 750,
    color: "#345F85",
    background: "rgba(255,255,255,0.64)",
    border: "0.5px solid rgba(255,255,255,0.78)",
    boxShadow: "0 12px 28px -22px rgba(31,44,69,0.36), inset 0 1px 0 rgba(255,255,255,0.86)",
    backdropFilter: "blur(6px) saturate(165%)",
    WebkitBackdropFilter: "blur(6px) saturate(165%)",
  },
  compareCard: {
    padding: 0,
    overflowX: "auto",
    overflowY: "hidden",
    borderRadius: 28,
    background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(153,176,209,0.36)",
    boxShadow: "0 18px 44px rgba(42,65,96,.10), inset 0 1px 0 rgba(255,255,255,.72)",
    ...studioGlassBackdrop,
  },
  compareScroll: {
    overflowX: "auto",
  },
  compareHeader: {
    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
    background: "linear-gradient(180deg, rgba(246,250,255,0.98), rgba(236,244,253,0.92))",
    padding: "15px 18px",
    minWidth: 900,
    fontSize: 12.5,
    letterSpacing: 0,
    fontWeight: 850,
    color: "var(--m-on-surface)",
    borderBottom: "1px solid rgba(214,225,240,0.88)",
  },
  compareGroupHeader: {
    padding: "15px 18px 10px",
    minWidth: 900,
    fontSize: 13,
    letterSpacing: 0,
    fontWeight: 850,
    color: "var(--m-primary)",
    background: "linear-gradient(90deg, rgba(244,249,255,0.92), rgba(255,255,255,0.96))",
    borderTop: "1px solid var(--m-outline-var)",
    borderBottom: "1px solid var(--m-outline-var)",
  },
  compareRow: {
    display: "grid", gridTemplateColumns: "140px 130px minmax(220px, 1.4fr) 100px 120px 140px",
    gap: 18,
    padding: "16px 18px",
    fontSize: 13,
    color: "var(--m-on-surface)",
    alignItems: "center",
    minWidth: 880,
  },
  compareHeaderRow: {
    minHeight: 52,
    background: "linear-gradient(180deg, rgba(246,250,255,0.98), rgba(236,244,253,0.92))",
    color: "var(--m-on-surface-mid)",
    fontSize: 12.5,
    fontWeight: 800,
    letterSpacing: 0,
    borderBottom: "1px solid rgba(214,225,240,0.88)",
  },
  comparePlanCell: {
    display: "grid",
    gap: 4,
    color: "var(--m-on-surface)",
  },
  compareText: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.45,
    color: "var(--m-on-surface-var)",
    textWrap: "pretty",
  },
  compareTextMuted: {
    margin: 0,
    fontSize: 12.5,
    lineHeight: 1.45,
    color: "var(--m-on-surface-mid)",
    textWrap: "pretty",
  },
  compareExpandWrap: {
    borderTop: "1px solid rgba(214,225,240,0.88)",
    padding: 12,
    background: "linear-gradient(180deg, rgba(250,252,255,0.94), rgba(244,249,255,0.88))",
  },
  compareExpandButton: {
    all: "unset",
    boxSizing: "border-box",
    width: "100%",
    minHeight: 48,
    borderRadius: 16,
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 850,
    color: "var(--m-on-surface)",
    background: "rgba(255,255,255,0.74)",
    border: "1px solid rgba(214,225,240,0.86)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.88)",
  },
  compareExpandIcon: {
    width: 28,
    height: 28,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    color: "var(--m-primary)",
    background: "rgba(232,241,252,0.92)",
    transition: "transform 180ms ease",
  },
  compareDetails: {
    overflowX: "auto",
    borderTop: "1px solid rgba(214,225,240,0.88)",
    background: "rgba(255,255,255,0.72)",
  },
  compareFeatureRow: {
    display: "grid",
    gridTemplateColumns: "minmax(260px, 2fr) repeat(5, minmax(98px, 1fr))",
    gap: 12,
    padding: "11px 18px",
    minWidth: 900,
    alignItems: "center",
    fontSize: 13,
    color: "var(--m-on-surface)",
  },
  compareFeatureName: {
    fontSize: 13,
    lineHeight: 1.35,
    color: "var(--m-on-surface)",
  },
  includedGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))",
    gap: 14,
  },
  includedCard: {
    minHeight: 190,
    borderRadius: 24,
    padding: "22px 24px",
    background: "rgba(255,255,255,.68)",
    border: "1px solid rgba(153,176,209,.36)",
    boxShadow: "0 18px 44px rgba(42,65,96,.10), inset 0 1px 0 rgba(255,255,255,.72)",
    ...studioGlassBackdrop,
  },
  includedBlue: {
    background:
      "radial-gradient(circle at 14% 0%, rgba(106,155,204,0.18), transparent 36%), linear-gradient(155deg, rgba(255,255,255,0.98), rgba(235,245,255,0.90))",
    border: "1px solid rgba(176,205,232,0.82)",
  },
  includedGreen: {
    background:
      "radial-gradient(circle at 14% 0%, rgba(98,153,135,0.16), transparent 36%), linear-gradient(155deg, rgba(255,255,255,0.98), rgba(235,248,241,0.90))",
    border: "1px solid rgba(181,218,198,0.78)",
  },
  includedGold: {
    background:
      "radial-gradient(circle at 14% 0%, rgba(214,163,92,0.18), transparent 36%), linear-gradient(155deg, rgba(255,255,255,0.98), rgba(255,247,225,0.90))",
    border: "1px solid rgba(232,207,146,0.78)",
  },
  includedLavender: {
    background:
      "radial-gradient(circle at 14% 0%, rgba(130,125,189,0.15), transparent 36%), linear-gradient(155deg, rgba(255,255,255,0.98), rgba(242,240,255,0.90))",
    border: "1px solid rgba(202,199,235,0.76)",
  },
  includedTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 20,
    lineHeight: 1,
    letterSpacing: "-0.03em",
    margin: "18px 0 8px",
    color: "var(--m-on-surface)",
  },
  includedBody: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.55,
    color: "var(--m-on-surface-var)",
    textWrap: "pretty",
  },
  compareCell: {
    textAlign: "center",
    minHeight: 30,
    display: "grid",
    placeItems: "center",
    borderRadius: 14,
    margin: "0 2px",
    transition: "background 180ms ease",
  },
  compareProCell: {
    background: "linear-gradient(180deg, rgba(239,246,255,0.82), rgba(230,239,252,0.64))",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.88)",
  },
  guaranteeCard: {
    padding: "28px 32px",
    display: "flex", justifyContent: "space-between",
    alignItems: "center", gap: 24, flexWrap: "wrap",
    borderRadius: 26,
    backgroundImage:
      `linear-gradient(145deg, rgba(16,31,52,0.36), rgba(60,92,125,0.22)), url('${ART_HOUSE_TEXTURES.pricing}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid rgba(255,255,255,0.42)",
    boxShadow: "0 34px 88px rgba(31,44,69,0.20), 0 9px 22px rgba(31,44,69,0.09), inset 0 1px 0 rgba(255,255,255,0.22)",
    color: "#FFFFFF",
  },
  guaranteeH3: {
    fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700,
    letterSpacing: "-0.02em", margin: 0, color: "#FFFFFF",
    textShadow: "0 2px 18px rgba(10,22,38,0.34)",
  },
  guaranteeBody: {
    fontSize: 13.5, color: "rgba(255,255,255,0.88)",
    margin: "6px 0 0", textWrap: "pretty",
    textShadow: "0 2px 14px rgba(10,22,38,0.28)",
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
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: 850,
    background:
      "radial-gradient(circle at 18% 0%, rgba(255,255,255,0.22), transparent 40%), linear-gradient(135deg, rgba(14,18,27,0.92), rgba(27,35,51,0.80) 52%, rgba(10,13,20,0.92))",
    border: "0.5px solid rgba(255,255,255,0.52)",
    boxShadow: "0 18px 36px -24px rgba(0,0,0,0.58), inset 0 1px 0 rgba(255,255,255,0.42), inset 0 -1px 0 rgba(255,255,255,0.12)",
    backdropFilter: "blur(7px) saturate(170%) contrast(1.08) brightness(1.04)",
    WebkitBackdropFilter: "blur(7px) saturate(170%) contrast(1.08) brightness(1.04)",
  },
  ctaPrimaryButton: {
    background:
      "radial-gradient(circle at 18% 0%, rgba(255,255,255,0.30), transparent 40%), linear-gradient(135deg, rgba(63,105,148,0.94), rgba(48,88,130,0.86) 52%, rgba(24,43,74,0.94))",
  },
};
