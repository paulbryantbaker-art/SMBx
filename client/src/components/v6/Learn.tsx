import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ART_HOUSE_TEXTURES, DESKTOP_TEXTURES } from "../../lib/randomTextures";

type Section = "how" | "pricing";
type Billing = "monthly" | "annual";

interface LearnProps {
  section?: Section;
  anchor?: string;
  onTalkToYulia?: (prompt: string) => void;
}

export function V6LearnView({ section, anchor, onTalkToYulia }: LearnProps) {
  const [active, setActive] = useState<Section>(section ?? "how");
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
    <div className="m-fade-up" style={{ width: "100%" }}>
      <header style={L.hero}>
        <div style={L.heroGlow} aria-hidden="true" />
        <div style={L.heroMain}>
          <div>
            <div className="mono" style={L.heroEyebrow}>ABOUT SMBX · YULIA</div>
            <h1 style={L.heroH1}>A deal team that runs the playbook. So you can run the deal.</h1>
            <p style={L.heroTag}>
              Built for the people who run M&amp;A processes &mdash; bankers, brokers, advisors, searchers, principals. Yulia handles the production work the methodology demands. You bring the judgment, the relationships, and the call.
            </p>
          </div>
          <div style={L.heroProofDeck} aria-label="Yulia operating layer summary">
            {[
              ["METHODOLOGY", "4 journeys", "Sell, buy, raise, PMI"],
              ["MATH", "22 formulas", "Deterministic, auditable"],
              ["OUTPUTS", "28 generators", "Docs, models, reports"],
            ].map((item, index) => (
              <Reveal key={item[0]} delay={120 + index * 80} direction="left">
                <div style={L.heroProofCard}>
                  <div className="mono" style={L.heroProofEyebrow}>{item[0]}</div>
                  <strong style={L.heroProofTitle}>{item[1]}</strong>
                  <span style={L.heroProofText}>{item[2]}</span>
                </div>
              </Reveal>
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

      {active === "how"     && <HowSection />}
      {active === "pricing" && <PricingSection onTalkToYulia={onTalkToYulia} />}
    </div>
  );
}

/* ─── HOW IT WORKS ───────────────────────────────────────── */

interface LoopStep { n: string; title: string; body: string; chip: string }

const LOOP: LoopStep[] = [
  { n: "01", title: "Source",     body: "Census + Places + your own pipeline feed the 5-stage sourcing engine. Every prospect ranked by 6-dimension fit against your thesis or mandate.",                                  chip: "Business Search" },
  { n: "02", title: "Diligence",  body: "Open a CIM. Yulia produces ValueLens, recast P&L, Seven-Factor Analysis, working capital peg, and QoE Lite — all from the documents on the page, with every number traceable.", chip: "Analysis"        },
  { n: "03", title: "Decide",     body: "LOI, counter-proposal, term sheet analysis, IC memo, board pack, LP update — drafted in your voice, ready to review and send.",                                                  chip: "Docs"            },
];

interface Capability { tag: string; title: string; body: string }

const CAPABILITIES: Capability[] = [
  { tag: "VALUELENS",   title: "ValueLens · the first read",       body: "Recast P&L, normalized SDE/EBITDA, blended valuation range — minutes from upload to PDF you can hand a client."         },
  { tag: "SEVEN-FACTOR", title: "Seven-Factor Analysis",            body: "Diversification, dependency, financial integrity, owner role, market position, growth profile, risk concentration."     },
  { tag: "VALUATION",   title: "Valuation engine · 22 formulas",   body: "DCF, LBO, IRR (Newton-Raphson), MOIC, DSCR with SBA structures pre-checked, sensitivity matrix on any 2 vars."          },
  { tag: "QoE LITE",    title: "Quality-of-earnings pre-read",     body: "Add-back defensibility, working-capital traps, customer concentration, key-person risk — the conversation you need first." },
  { tag: "CIM + TEASER", title: "CIM, blind teaser, pitch deck",   body: "10–60 page CIM, league-adapted; 22x-compliant for advisors. Blind teaser for outreach. Deck for the IC meeting."        },
  { tag: "DRAFTING",    title: "LOI, counter, IC memo, LP update", body: "Every legal and communication artifact with the deal's context baked in — never a blank-page restart."                  },
];

interface Stat { stat: string; label: string }

const WHY_STATS: Stat[] = [
  { stat: "4 × 6",  label: "journeys × gates · SELL, BUY, RAISE, PMI"      },
  { stat: "22",     label: "deterministic formulas · sub-16ms · auditable" },
  { stat: "28",     label: "tier-routed deliverable generators"            },
];

interface Faq { q: string; a: string }

const FAQS: Faq[] = [
  { q: "I'm a broker / banker / advisor. Where does Yulia fit in my workflow?",
    a: "Yulia runs the production work — ValueLens, CIM, recast, working capital peg, LOI counter, LP update — so your hours go to the seller meeting, the buyer call, the negotiation, and the relationship. The 22x-compliant Broker Listing Generator and Day Pass tokens for your CPAs, lenders, and counsel are built specifically for advisor workflows. Brokers and bankers are customers, not competitors." },
  { q: "How does Yulia know which playbook to run?",
    a: "Three signals: journey (SELL, BUY, RAISE, or PMI), gate (which of the six steps you're in), and league (deal size, L1 sub-$500K SDE through L6 $50M+ EBITDA). The persona shifts with the league — Coach voice for L1 owner-operator add-back questions, Partner voice for L5 strategic premium, Macro for L6 antitrust. Same engine, different register." },
  { q: "Is the math actually deterministic, or is an LLM doing arithmetic?",
    a: "Deterministic. All 22 formulas live as pure JavaScript — sub-16ms, same inputs → same outputs every time, fully auditable. The LLM owns the narrative (why this multiple, what changes the answer, how to position the counter). The code owns every number." },
  { q: "What deliverables does Yulia actually produce?",
    a: "28 generators across five categories — narrative reports (ValueLens, Seven-Factor, market intel) as PDF; marketing docs (CIM, blind teaser, pitch deck); financial models (pro forma, LBO, SBA, cap table, working capital) as XLSX with live formulas; legal templates (LOI, term sheet, DD checklist) as DOCX; and operational plans (PMI integration, employee comms, day-zero checklist)." },
  { q: "What won't Yulia do?",
    a: "Yulia never represents either side, never contacts your counterparty, never holds funds, and never charges success fees. Every tax analysis ends with \"your CPA should confirm.\" Every legal output ends with \"your M&A attorney will draft the actual documents.\" Every drafted email ends with \"review and send when ready — adjust to match your style.\" Drafts and models, never decisions." },
  { q: "What happens after I hit the free deliverable limit?",
    a: "Chat stays free, unlimited, forever. When you want a second deliverable — another ValueLens, Seven-Factor, recast, draft — you pick a plan. The cap is total, not monthly, and there's no auto-charge. The intent is for you to get one real artifact in your hands before deciding." },
  { q: "Where does my data live and who sees it?",
    a: "PostgreSQL on Railway, isolated per workspace. Anthropic and Google process model calls under their enterprise API terms (no training on your data). On Enterprise, single-tenant deployment and SOC 2 audit trails are available. Day Pass tokens for external advisors are scoped to a single deal and expire in 48 hours." },
  { q: "How is this different from ChatGPT with a custom prompt?",
    a: "ChatGPT is the engine. The methodology — gates, league logic, deterministic formulas, deal memory across sessions, 28 tier-routed generators, sourcing pipeline against Census + Places, audit trail, regulatory guardrails — is the harness. A practitioner can replicate any one capability with a weekend and ChatGPT Plus. They can't replicate twelve, integrated, on the same deal context." },
];

function HowSection() {
  return (
    <div>
      <LearnSection eyebrow="THE LOOP" title="How Yulia moves deals faster and smarter" sub="Source → diligence → decision. Yulia carries the context across all three.">
        <div style={H.loopSpread}>
          <Reveal direction="right">
            <div style={H.loopLead}>
              <div className="mono" style={H.loopLeadEyebrow}>OPERATING LAYER</div>
              <h3 style={H.loopLeadTitle}>The chat is the front door. The work lands on the desk.</h3>
              <p style={H.loopLeadBody}>
                Yulia does not just answer questions. She opens the right surface, keeps the evidence attached, and carries the state from sourcing to diligence to the decision memo.
              </p>
              <div style={H.loopLeadRail}>
                <span>Ask</span>
                <span aria-hidden="true">→</span>
                <span>Analyze</span>
                <span aria-hidden="true">→</span>
                <span>Draft</span>
                <span aria-hidden="true">→</span>
                <span>Review</span>
              </div>
            </div>
          </Reveal>
          <div style={H.stepStack}>
            {LOOP.map((s, index) => (
              <Reveal key={s.n} delay={index * 90} direction="left">
                <div style={stepCardStyle(index)}>
                  <div className="mono" style={stepNumberStyle(index)}>{s.n}</div>
                  <div>
                    <h3 style={H.stepTitle}>{s.title}</h3>
                    <p style={H.stepBody}>{s.body}</p>
                    <span className="mono" style={index === 2 ? { ...H.chip, ...H.chipDark } : H.chip}>{s.chip}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </LearnSection>

      <LearnSection id="capabilities" eyebrow="CAPABILITIES" title="What Yulia does" sub="The production work the methodology demands — for the people running the deal.">
        <div style={H.capabilityMosaic}>
          {CAPABILITIES.map((c, index) => (
            <Reveal key={c.title} delay={(index % 3) * 80} direction={index % 2 === 0 ? "up" : "left"}>
              <div style={capabilityCardStyle(index)}>
                <div className="mono" style={H.capTag}>{c.tag}</div>
                <h4 style={H.capTitle}>{c.title}</h4>
                <p style={H.capBody}>{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </LearnSection>

      <LearnSection eyebrow="WHY" title="Built for the people running the deal" sub="Bankers, brokers, advisors, searchers, principals — same engine, different seat.">
        <div style={H.whyGrid}>
          <Reveal direction="right">
          <div style={H.whyCard}>
            <p style={H.whyBody}>
              <strong>The deal team problem:</strong> every engagement runs on a sequence — what gets diagnosed at S1, what gets produced at S3, what closes at S5. Across SELL, BUY, RAISE, and PMI, that&rsquo;s 24 gates of analysis, modeling, drafting, and coordination. Yulia runs the playbook with you so the production work doesn&rsquo;t pull you off the seller meeting, the buyer call, or the negotiation that only you can do.
            </p>
          </div>
          </Reveal>
          <Reveal direction="left" delay={90}>
          <div style={H.statPanel}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {WHY_STATS.map(s => (
                <div key={s.label} style={H.statRow}>
                  <div style={H.stat}>{s.stat}</div>
                  <div style={H.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          </Reveal>
        </div>
      </LearnSection>

      <LearnSection eyebrow="FAQ" title="The questions practitioners ask">
        <Reveal>
        <div style={H.faqCard}>
          {FAQS.map((f, i) => (
            <FaqRow key={f.q} q={f.q} a={f.a} last={i === FAQS.length - 1} />
          ))}
        </div>
        </Reveal>
      </LearnSection>
    </div>
  );
}

function FaqRow({ q, a, last }: { q: string; a: string; last: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: last ? "none" : "1px solid var(--m-outline-var)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="m-state"
        aria-expanded={open}
        style={H.faqBtn}
      >
        <span style={H.faqQ}>{q}</span>
        <span aria-hidden="true" style={{
          ...H.faqIcon,
          transform: open ? "rotate(45deg)" : "none",
        }}>+</span>
      </button>
      {open && <div style={H.faqA}>{a}</div>}
    </div>
  );
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
  if (index === 1) {
    return {
      ...H.stepCard,
      background: "linear-gradient(135deg, rgba(238,245,253,0.98) 0%, rgba(255,255,255,0.92) 54%, rgba(225,236,248,0.96) 100%)",
      border: "1px solid rgba(203,220,239,0.95)",
      boxShadow: "0 22px 52px rgba(52, 84, 124, 0.12), 0 6px 16px rgba(31,44,69,0.06), inset 0 1px 0 rgba(255,255,255,0.90)",
    };
  }
  if (index === 2) {
    return {
      ...H.stepCard,
      color: "#FFFFFF",
      backgroundImage: `linear-gradient(145deg, rgba(20,28,47,0.82) 0%, rgba(57,68,108,0.58) 52%, rgba(18,24,40,0.88) 100%), url('${DESKTOP_TEXTURES.pipelineCard}')`,
      backgroundSize: "cover, cover",
      backgroundPosition: "center, center",
      border: "1px solid rgba(255,255,255,0.30)",
      boxShadow: "0 24px 60px rgba(19,28,46,0.22), 0 8px 20px rgba(19,28,46,0.10), inset 0 1px 0 rgba(255,255,255,0.20)",
    };
  }
  return {
    ...H.stepCard,
    background: "linear-gradient(150deg, #FFFFFF 0%, rgba(249,251,255,0.96) 54%, rgba(235,242,250,0.90) 100%)",
  };
}

function stepNumberStyle(index: number): CSSProperties {
  if (index === 1) {
    return {
      ...H.stepN,
      color: "#4E61A8",
      background: "linear-gradient(180deg, rgba(235,238,255,0.98), rgba(218,225,252,0.92))",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.88), 0 10px 24px rgba(78,97,168,0.12)",
    };
  }
  if (index === 2) {
    return {
      ...H.stepN,
      color: "#FFFFFF",
      background: "rgba(255,255,255,0.16)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.34), 0 10px 24px rgba(0,0,0,0.18)",
    };
  }
  return H.stepN;
}

function capabilityCardStyle(index: number): CSSProperties {
  const base: CSSProperties = H.capCard;
  const texturedBase: CSSProperties = {
    color: "#FFFFFF",
    border: "1px solid rgba(255,255,255,0.32)",
    boxShadow: "0 24px 62px rgba(31,44,69,0.16), 0 8px 20px rgba(31,44,69,0.08), inset 0 1px 0 rgba(255,255,255,0.20)",
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
  };

  if (index === 0) {
    return {
      ...base,
      color: "#FFFFFF",
      minHeight: 210,
      background:
        "radial-gradient(circle at 18% 12%, rgba(129,190,211,0.34), transparent 36%), linear-gradient(145deg, rgba(20,55,72,0.98) 0%, rgba(43,88,99,0.94) 52%, rgba(17,33,48,0.98) 100%)",
      border: "1px solid rgba(255,255,255,0.22)",
      boxShadow: "0 24px 62px rgba(31,44,69,0.16), 0 8px 20px rgba(31,44,69,0.08), inset 0 1px 0 rgba(255,255,255,0.18)",
    };
  }
  if (index === 1) {
    return {
      ...base,
      background: "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(245,249,254,0.94))",
      borderTop: "5px solid rgba(106,155,204,0.34)",
    };
  }
  if (index === 2) {
    return {
      ...base,
      ...texturedBase,
      minHeight: 210,
      backgroundImage: `linear-gradient(145deg, rgba(36,39,69,0.72) 0%, rgba(77,82,130,0.48) 50%, rgba(18,23,39,0.82) 100%), url('${DESKTOP_TEXTURES.pricingFeatured}')`,
    };
  }
  if (index === 3) {
    return {
      ...base,
      background: "radial-gradient(circle at 18% 14%, rgba(214,163,92,0.16), transparent 34%), linear-gradient(145deg, rgba(255,255,255,0.98), rgba(249,244,234,0.92))",
      border: "1px solid rgba(224,210,188,0.88)",
    };
  }
  if (index === 4) {
    return {
      ...base,
      color: "#FFFFFF",
      background: "linear-gradient(145deg, rgba(44,72,104,0.96), rgba(37,54,80,0.96))",
      border: "1px solid rgba(255,255,255,0.20)",
      boxShadow: "0 24px 60px rgba(24,37,58,0.20), inset 0 1px 0 rgba(255,255,255,0.14)",
    };
  }
  return {
    ...base,
    background: "linear-gradient(145deg, rgba(240,247,250,0.98), rgba(255,255,255,0.94))",
    borderLeft: "5px solid rgba(80,145,118,0.34)",
  };
}

const H: Record<string, CSSProperties> = {
  loopSpread: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(340px, 100%), 1fr))",
    gap: 18,
    alignItems: "stretch",
  },
  loopLead: {
    minHeight: 330,
    borderRadius: 26,
    padding: "28px 30px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    overflow: "hidden",
    backgroundImage: `linear-gradient(145deg, rgba(17,41,63,0.74) 0%, rgba(64,99,119,0.38) 52%, rgba(15,24,42,0.78) 100%), url('${ART_HOUSE_TEXTURES.learn}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid rgba(255,255,255,0.34)",
    boxShadow: "0 28px 74px rgba(23,38,63,0.24), 0 8px 20px rgba(26,34,51,0.10), inset 0 1px 0 rgba(255,255,255,0.22)",
  },
  loopLeadEyebrow: {
    fontSize: 10,
    color: "#FFFFFF",
    letterSpacing: "0.16em",
    fontWeight: 800,
  },
  loopLeadTitle: {
    margin: "18px 0 0",
    maxWidth: 520,
    fontSize: 34,
    lineHeight: 0.98,
    letterSpacing: "-0.055em",
    color: "#FFFFFF",
    textShadow: "0 2px 18px rgba(18,31,54,0.24)",
  },
  loopLeadBody: {
    margin: "14px 0 0",
    maxWidth: 520,
    fontSize: 14.5,
    lineHeight: 1.55,
    color: "#FFFFFF",
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
    background: "radial-gradient(circle at 12% 0%, rgba(255,255,255,0.24), transparent 40%), linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.07))",
    border: "0.5px solid rgba(255,255,255,0.42)",
    boxShadow: "0 16px 34px -22px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.44), inset 0 -1px 0 rgba(255,255,255,0.10)",
    backdropFilter: "blur(5px) saturate(155%) contrast(1.08) brightness(1.04)",
    WebkitBackdropFilter: "blur(5px) saturate(155%) contrast(1.08) brightness(1.04)",
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
    padding: "18px 20px",
    borderRadius: 22,
    display: "grid",
    gridTemplateColumns: "56px minmax(0, 1fr)",
    gap: 18,
    alignItems: "start",
    background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,251,255,0.92))",
    border: "1px solid rgba(219,228,241,0.92)",
    boxShadow: "0 18px 46px rgba(31,44,69,0.10), 0 4px 12px rgba(31,44,69,0.06), inset 0 1px 0 rgba(255,255,255,0.88)",
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
    letterSpacing: "-0.02em", margin: "8px 0 6px", color: "currentColor",
  },
  stepBody: {
    fontSize: 13, lineHeight: 1.55, color: "currentColor", opacity: 0.72,
    margin: "0 0 12px", textWrap: "pretty",
  },
  chip: {
    fontSize: 10, padding: "3px 8px",
    background: "var(--m-surface-2)", borderRadius: 999,
    color: "var(--m-on-surface-var)", fontWeight: 600, letterSpacing: "0.1em",
  },
  chipDark: {
    background: "rgba(255,255,255,0.16)",
    color: "#FFFFFF",
    opacity: 0.9,
  },
  capabilityMosaic: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 12,
  },
  capCard: {
    minHeight: 176,
    padding: "20px 22px",
    borderRadius: 22,
    background: "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(244,248,253,0.90))",
    border: "1px solid rgba(219,228,241,0.92)",
    boxShadow: "0 18px 46px rgba(31,44,69,0.10), 0 4px 12px rgba(31,44,69,0.06), inset 0 1px 0 rgba(255,255,255,0.88)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 14,
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
    fontFamily: "var(--font-display)", fontSize: 14.5, fontWeight: 700,
    letterSpacing: "-0.02em", margin: "0 0 5px", color: "currentColor",
  },
  capBody: {
    fontSize: 12.5, lineHeight: 1.55, color: "currentColor", margin: 0,
    opacity: 0.78,
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
    backgroundImage: `linear-gradient(145deg, rgba(22,28,45,0.80) 0%, rgba(58,68,96,0.52) 52%, rgba(16,20,34,0.86) 100%), url('${DESKTOP_TEXTURES.pipelineCard}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid rgba(255,255,255,0.28)",
    boxShadow: "0 28px 72px rgba(31,44,69,0.20), inset 0 1px 0 rgba(255,255,255,0.18)",
    display: "flex",
    alignItems: "center",
  },
  statRow: {
    display: "grid",
    gridTemplateColumns: "92px minmax(0,1fr)",
    gap: 14,
    alignItems: "baseline",
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.12)",
  },
  stat: {
    fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28,
    letterSpacing: "-0.03em", color: "#FFFFFF", minWidth: 72,
  },
  statLabel: {
    fontSize: 13,
    color: "#FFFFFF",
    opacity: 0.78,
  },
  faqCard: {
    padding: 0,
    overflow: "hidden",
    borderRadius: 24,
    background: "#FFFFFF",
    border: "1px solid var(--m-outline-var)",
    boxShadow: "0 24px 64px rgba(31,44,69,0.12), 0 6px 16px rgba(31,44,69,0.07)",
  },
  faqBtn: {
    all: "unset", cursor: "pointer",
    width: "100%", boxSizing: "border-box",
    padding: "14px 22px",
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
  },
  faqQ: {
    fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600,
    color: "var(--m-on-surface)", letterSpacing: "-0.01em", textWrap: "pretty",
  },
  faqIcon: {
    width: 20, height: 20, borderRadius: 6,
    display: "grid", placeItems: "center",
    background: "var(--m-surface-2)", color: "var(--m-on-surface-var)",
    fontSize: 12, fontWeight: 700,
    transition: "transform 200ms ease",
    flexShrink: 0,
  },
  faqA: {
    padding: "0 22px 18px",
    fontSize: 13, lineHeight: 1.6, color: "var(--m-on-surface-var)",
    textWrap: "pretty",
  },
};

/* ─── PRICING ────────────────────────────────────────────── */

type PriceValue = number | "Free" | "Custom";

interface Plan {
  id: string;
  name: string;
  price: { monthly: PriceValue; annual: PriceValue };
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
    price: { monthly: "Free", annual: "Free" },
    sub: "Use Yulia for as long as you want. One finished deliverable on the house.",
    cta: "Start free",
    prompt: "I'm ready to start with the free tier. What do I need to do?",
    features: [
      "Yulia chat — unlimited",
      "1 finished deliverable, ever",
      "Recast + ValueLens valuation",
      "Buyer-list engine · preview",
      "SBA + structure modeling · preview",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: { monthly: 49, annual: 39 },
    sub: "For first-time searchers running their first deal end-to-end.",
    cta: "Choose Starter",
    prompt: "I'm interested in the $49 Starter plan. Walk me through what I get and how to upgrade.",
    features: [
      "Everything in Free, unlimited",
      "28 document generators",
      "Deal room + diligence tracker · one deal",
      "Brand kit on every deliverable",
      "180 days post-close PMI",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: { monthly: 149, annual: 119 },
    sub: "An in-browser associate desk. Multiple deals, side-by-side.",
    cta: "Choose Pro",
    prompt: "I'm interested in Pro at $149. Walk me through QofE Lite, the parallel-deal pipeline, and the audience-variant memos.",
    featured: true,
    features: [
      "QofE Lite pre-read — the wedge",
      "Parallel-deal pipeline view",
      "Seven-Factor deal scoring",
      "Sector-tuned buyer universes",
      "Audience-variant memos · LP, IC, board",
      "Negotiation tactics + counter drafting",
      "Cap table + waterfall modeling",
      "API access · standard rate limits",
    ],
  },
  {
    id: "team",
    name: "Team",
    price: { monthly: 999, annual: 799 },
    sub: "For firms — partners, associates, and shared deal flow under one vault.",
    cta: "Choose Team",
    prompt: "I'm interested in Team at $999. How do the 5 seats, shared deal vault, and specialist handoff work?",
    features: [
      "Everything in Pro",
      "Up to 5 seats",
      "Shared deal vault + firm templates",
      "Specialist handoff coordination",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: { monthly: "Custom", annual: "Custom" },
    sub: "For regulated environments — fund admins, family offices, banks.",
    cta: "Talk to Yulia",
    prompt: "I want to learn more about Enterprise — SSO, single-tenant, SOC 2, custom seat count, and the named account manager.",
    features: [
      "Everything in Team",
      "Custom seat count",
      "SSO · single-tenant · SOC 2",
      "Higher API rate limits + uptime SLA",
      "Named account manager",
    ],
  },
];

type Cell = string;

type CompareCells = [Cell, Cell, Cell, Cell, Cell]; // Free, Starter, Pro, Team, Enterprise

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

function PricingSection({ onTalkToYulia }: { onTalkToYulia?: (prompt: string) => void }) {
  const [billing, setBilling] = useState<Billing>("monthly");

  const handleCta = (plan: Plan) => {
    onTalkToYulia?.(plan.prompt);
  };

  const fmtPrice = (p: Plan["price"][Billing]) =>
    p === "Free" ? "Free" : p === "Custom" ? "Custom" : `$${p}`;

  return (
    <div>
      <style>{`
        .plan-choice-card {
          cursor: pointer;
          transform: translate3d(0, 0, 0);
          transition:
            transform 180ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 180ms ease,
            border-color 180ms ease,
            filter 180ms ease;
        }
        .plan-choice-card:hover {
          transform: translate3d(0, -5px, 0);
          border-color: rgba(132, 167, 205, 0.66) !important;
          box-shadow:
            0 34px 82px rgba(31,44,69,0.16),
            0 9px 22px rgba(31,44,69,0.08),
            inset 0 1px 0 rgba(255,255,255,0.92) !important;
        }
        .plan-choice-card.is-featured:hover {
          filter: saturate(1.08) contrast(1.03);
          box-shadow:
            0 38px 92px rgba(28,63,107,0.30),
            0 10px 24px rgba(31,44,69,0.14),
            inset 0 1px 0 rgba(255,255,255,0.24) !important;
        }
        .plan-choice-card:focus-visible {
          outline: 3px solid rgba(214, 173, 91, 0.70);
          outline-offset: 4px;
        }
        .plan-choice-card:hover .plan-action-pill {
          transform: translate3d(4px, 0, 0);
          background: rgba(255,255,255,0.90);
        }
        .plan-choice-card.is-featured:hover .plan-action-pill {
          background: rgba(255,255,255,0.24);
        }
        @media (prefers-reduced-motion: reduce) {
          .plan-choice-card,
          .plan-action-pill {
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>
      <div style={P.toggleRow}>
        <div style={P.toggleWrap} role="tablist" aria-label="Billing period">
          {([
            { id: "monthly" as const, label: "Monthly"             },
            { id: "annual"  as const, label: "Annual · save 20%"    },
          ]).map(t => (
            <button
              key={t.id}
              role="tab"
              aria-selected={billing === t.id}
              onClick={() => setBilling(t.id)}
              className="m-state"
              style={{
                ...P.toggleBtn,
                background: billing === t.id ? "var(--m-surface-on-light)" : "transparent",
                color: billing === t.id ? "var(--m-on-surface)" : "var(--m-on-surface-mid)",
                boxShadow: billing === t.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >{t.label}</button>
          ))}
        </div>
      </div>

      <CostBreakdown billing={billing} />

      <div style={P.planGrid}>
        {PLANS.map((p, index) => {
          const featured = p.featured;
          const priceDisplay = fmtPrice(p.price[billing]);
          const priceValue = p.price[billing];
          const showPerMo = priceValue !== "Free" && priceValue !== "Custom";
          return (
            <Reveal key={p.id} delay={index * 65} direction="up">
            <div
              role="button"
              tabIndex={0}
              aria-label={`${p.cta}: ${p.name}`}
              onClick={() => handleCta(p)}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                handleCta(p);
              }}
              className={`plan-choice-card m-card ${featured ? "is-featured elevated" : ""}`}
              style={{
                ...P.planCard,
                ...(featured ? P.planFeatured : {}),
              }}
            >
              {featured && (
                <div className="mono" style={P.popular}>MOST POPULAR</div>
              )}
              <h3 style={P.planName}>{p.name}</h3>
              <p style={P.planSub}>{p.sub}</p>
              <div style={P.priceRow}>
                <span style={P.priceNumber}>{priceDisplay}</span>
                {showPerMo && (
                  <span style={P.priceUnit}>/mo{billing === "annual" ? " · billed annually" : ""}</span>
                )}
              </div>
              <div
                className="plan-action-pill"
                style={{
                  ...P.planAction,
                  ...(featured ? P.planActionFeatured : {}),
                }}
              >
                <span>{p.cta}</span>
                <span aria-hidden="true">→</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {p.features.map((f, i) => {
                  const isWedge = featured && i === 0;
                  return (
                    <div key={f} style={P.featureRow}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }}>
                        <path d="M3 7.5l2.5 2.5L11 4.5" stroke={featured ? "#FFFFFF" : "var(--m-primary)"} strokeWidth={isWedge ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span style={isWedge ? { fontWeight: 700, color: featured ? "#FFFFFF" : "var(--m-primary)" } : undefined}>{f}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            </Reveal>
          );
        })}
      </div>

      <LearnSection id="compare" eyebrow="DETAILS" title="Compare plans" sub="Everything in one place.">
        <Reveal>
          <ComparePlans />
        </Reveal>
      </LearnSection>

      <LearnSection eyebrow="GUARANTEE" title="Use Yulia free · upgrade only when you need more" sub="Unlimited chat. One free deliverable. No credit card.">
        <Reveal>
        <div style={P.guaranteeCard}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <h3 style={P.guaranteeH3}>Start your search this afternoon</h3>
            <p style={P.guaranteeBody}>
              No card. Use the chat as much as you want. When you need more &mdash; recast, valuation, drafting, sourcing &mdash; pick a plan.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="m-btn outlined"
              onClick={() => onTalkToYulia?.("Help me figure out which plan fits me.")}
            >Talk to Yulia</button>
            <button
              className="m-btn filled"
              onClick={() => onTalkToYulia?.("I'm ready to start with the free tier. What do I need to do?")}
            >Start free</button>
          </div>
        </div>
        </Reveal>
      </LearnSection>
    </div>
  );
}

function CostBreakdown({ billing }: { billing: Billing }) {
  const annual = billing === "annual";
  const rows = [
    {
      eyebrow: "START",
      title: "$0",
      body: "Unlimited chat and one finished deliverable. No credit card, no timer.",
      meta: "Use the tool first",
    },
    {
      eyebrow: "INDIVIDUAL",
      title: annual ? "$39 / $119" : "$49 / $149",
      body: "Starter or Pro for live deals, document generation, analysis, sourcing, and post-close work.",
      meta: annual ? "annual monthly equivalent" : "monthly",
    },
    {
      eyebrow: "FIRM",
      title: annual ? "$799+" : "$999+",
      body: "Team vault, shared deal flow, firm templates, specialist handoffs, and enterprise controls.",
      meta: "team and custom",
    },
  ];

  return (
    <Reveal direction="up" delay={80}>
      <div style={P.costPanel}>
        <div style={P.costIntro}>
          <div className="mono" style={P.costEyebrow}>COST BREAKDOWN</div>
          <h3 style={P.costTitle}>Start in the product. Upgrade when the work becomes real.</h3>
        </div>
        <div style={P.costGrid}>
          {rows.map((row, index) => (
            <div key={row.eyebrow} style={{ ...P.costCard, ...(index === 1 ? P.costCardFocus : {}) }}>
              <div className="mono" style={P.costCardEyebrow}>{row.eyebrow}</div>
              <div style={P.costCardTitle}>{row.title}</div>
              <p style={P.costCardBody}>{row.body}</p>
              <span className="mono" style={P.costMeta}>{row.meta}</span>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

function ComparePlans() {
  let visualRow = 0;

  return (
    <div className="plan-compare-stage" style={P.compareStage}>
      <style>{`
        .plan-compare-stage::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(105deg, transparent 0%, transparent 36%, rgba(255,255,255,0.66) 49%, transparent 62%, transparent 100%),
            radial-gradient(circle at 22% 0%, rgba(106,155,204,0.16), transparent 34%);
          transform: translateX(-78%);
          animation: smbxCompareScan 1600ms cubic-bezier(0.22, 1, 0.36, 1) 180ms both;
          mix-blend-mode: screen;
        }
        .plan-compare-card {
          position: relative;
          z-index: 1;
        }
        .plan-compare-toolbar {
          position: relative;
          z-index: 2;
        }
        .plan-compare-table {
          min-width: 860px;
        }
        .plan-compare-row {
          opacity: 0;
          transform: translate3d(0, 10px, 0);
          animation: smbxCompareRowIn 520ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: var(--row-delay, 0ms);
          transition: background 180ms ease, transform 180ms ease, box-shadow 180ms ease;
        }
        .plan-compare-row:hover {
          background: linear-gradient(90deg, rgba(239,246,255,0.76), rgba(255,255,255,0.92));
          transform: translate3d(0, -1px, 0);
          box-shadow: inset 3px 0 0 rgba(106,155,204,0.55);
        }
        .plan-compare-row:hover .plan-pro-cell {
          background: rgba(233,241,255,0.94);
        }
        .plan-compare-value {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 26px;
          min-width: 26px;
          padding: 4px 8px;
          border-radius: 999px;
          color: var(--m-on-surface-var);
          background: transparent;
          transition: transform 180ms ease, background 180ms ease, box-shadow 180ms ease;
        }
        .plan-compare-value.is-check {
          color: #336C92;
          background: rgba(225,239,251,0.72);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.82);
          font-weight: 800;
        }
        .plan-compare-value.is-preview {
          color: #9A6C20;
          background: rgba(255,244,220,0.82);
          font-weight: 750;
        }
        .plan-compare-value.is-empty {
          color: rgba(118,132,154,0.70);
        }
        .plan-pro-cell .plan-compare-value {
          color: var(--m-primary);
          font-weight: 800;
        }
        .plan-pro-cell .plan-compare-value.is-check {
          color: #FFFFFF;
          background: linear-gradient(180deg, #7AA7DA, #4F7FB5);
          box-shadow: 0 10px 22px -16px rgba(65,111,170,0.90), inset 0 1px 0 rgba(255,255,255,0.46);
        }
        .plan-compare-row:hover .plan-compare-value {
          transform: translate3d(0, -1px, 0);
        }
        @keyframes smbxCompareScan {
          0% { transform: translateX(-78%); opacity: 0; }
          18% { opacity: 0.9; }
          100% { transform: translateX(78%); opacity: 0; }
        }
        @keyframes smbxCompareRowIn {
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .plan-compare-stage::before,
          .plan-compare-row {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <div className="plan-compare-toolbar" style={P.compareToolbar}>
        <div>
          <div className="mono" style={P.compareToolbarEyebrow}>PRICING LENS</div>
          <div style={P.compareToolbarTitle}>Scan the plan stack</div>
        </div>
        <div style={P.compareToolbarChips} aria-label="Plan comparison highlights">
          <span style={P.compareChip}>Pro highlighted</span>
          <span style={P.compareChip}>Team ready</span>
          <span style={P.compareChip}>Enterprise controls</span>
        </div>
      </div>

      <div className="plan-compare-card" style={P.compareCard}>
        <div style={P.compareScroll}>
          <div className="plan-compare-table">
            <div style={{ ...P.compareHeader }}>
              <div>Feature</div>
              <div style={{ textAlign: "center" }}>Free</div>
              <div style={{ textAlign: "center" }}>Starter</div>
              <div style={{ textAlign: "center", color: "var(--m-primary)" }}>Pro</div>
              <div style={{ textAlign: "center" }}>Team</div>
              <div style={{ textAlign: "center" }}>Enterprise</div>
            </div>
            {COMPARE.map((group, gi) => (
              <div key={group.title}>
                <div style={P.compareGroupHeader}>{group.title}</div>
                {group.rows.map((row, ri) => {
                  const isLast = gi === COMPARE.length - 1 && ri === group.rows.length - 1;
                  const delay = 220 + visualRow++ * 30;
                  return (
                    <div
                      key={row.feature}
                      className="plan-compare-row"
                      style={{
                        ...P.compareRow,
                        "--row-delay": `${delay}ms`,
                        borderBottom: isLast ? "none" : "1px solid var(--m-outline-var)",
                      } as CSSProperties}
                    >
                      <div style={{ fontWeight: 650, color: "var(--m-on-surface)" }}>{row.feature}</div>
                      {row.cells.map((c, j) => (
                        <div
                          key={j}
                          className={j === 2 ? "plan-pro-cell" : undefined}
                          style={{
                            ...P.compareCell,
                            ...(j === 2 ? P.compareProCell : {}),
                          }}
                        >
                          <span
                            className={[
                              "plan-compare-value",
                              c === "✓" ? "is-check" : "",
                              c === "preview" ? "is-preview" : "",
                              c === "—" ? "is-empty" : "",
                            ].filter(Boolean).join(" ")}
                          >
                            {c}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
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
  `linear-gradient(145deg, rgba(14,28,48,0.72) 0%, rgba(47,90,132,0.44) 52%, rgba(14,22,42,0.74) 100%), url('${DESKTOP_TEXTURES.learnHero}')`;

const L: Record<string, CSSProperties> = {
  hero: {
    backgroundImage: learnHeroWash,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid rgba(255,255,255,0.34)",
    boxShadow: "0 46px 116px rgba(23,38,63,0.30), 0 20px 46px rgba(26,34,51,0.16), 0 4px 12px rgba(26,34,51,0.08), inset 0 1px 0 rgba(255,255,255,0.24)",
    borderRadius: 26,
    padding: "38px 42px",
    marginBottom: 20,
    minHeight: 290,
    position: "relative",
    overflow: "hidden",
  },
  heroMain: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))",
    gap: 30,
    alignItems: "end",
    minHeight: 260,
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
    fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 38,
    lineHeight: 1.05, letterSpacing: "-0.03em",
    color: "#FFFFFF", margin: 0,
    maxWidth: 720, textWrap: "balance",
    textShadow: "0 2px 18px rgba(18,31,54,0.22)",
  },
  heroTag: {
    position: "relative",
    fontSize: 14.5, lineHeight: 1.55, color: "#FFFFFF",
    margin: "12px 0 0", maxWidth: 620, textWrap: "pretty",
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
  planGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: 14,
    marginBottom: 38,
  },
  planCard: {
    minHeight: 430,
    padding: "24px 24px 22px",
    position: "relative",
    border: "1px solid rgba(219,228,241,0.92)",
    borderRadius: 24,
    background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,251,255,0.94))",
    boxShadow: "0 20px 54px rgba(31,44,69,0.10), 0 5px 14px rgba(31,44,69,0.06), inset 0 1px 0 rgba(255,255,255,0.90)",
    display: "flex",
    flexDirection: "column",
    color: "var(--m-on-surface)",
  },
  planFeatured: {
    border: "1px solid rgba(106,155,204,0.42)",
    backgroundImage: `linear-gradient(145deg, rgba(18,32,52,0.76) 0%, rgba(64,76,100,0.42) 52%, rgba(14,21,36,0.84) 100%), url('${ART_HOUSE_TEXTURES.pricing}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    color: "#FFFFFF",
    boxShadow: "0 30px 78px rgba(40,76,122,0.24), 0 8px 22px rgba(31,44,69,0.10), inset 0 1px 0 rgba(255,255,255,0.20)",
  },
  popular: {
    position: "absolute", top: -10, left: 24,
    fontSize: 9.5, fontWeight: 700, letterSpacing: "0.14em",
    background: "rgba(255,255,255,0.20)",
    border: "1px solid rgba(255,255,255,0.28)",
    color: "#FFFFFF",
    padding: "3px 9px", borderRadius: 999,
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
    color: "var(--m-on-surface)",
    background: "linear-gradient(180deg, rgba(248,251,255,0.92), rgba(238,245,253,0.78))",
    border: "1px solid rgba(214,225,240,0.86)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.90)",
    transition: "transform 180ms ease, background 180ms ease",
  },
  planActionFeatured: {
    color: "#FFFFFF",
    background: "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.07))",
    border: "1px solid rgba(255,255,255,0.28)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.32)",
    backdropFilter: "blur(5px) saturate(155%)",
    WebkitBackdropFilter: "blur(5px) saturate(155%)",
  },
  featureRow: {
    display: "flex", gap: 8,
    fontSize: 12.5, color: "currentColor",
    opacity: 0.76,
    lineHeight: 1.4,
  },
  costPanel: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(360px, 100%), 1fr))",
    gap: 14,
    alignItems: "stretch",
    marginBottom: 18,
  },
  costIntro: {
    minHeight: 142,
    borderRadius: 24,
    padding: "22px 24px",
    backgroundImage: `linear-gradient(145deg, rgba(30,64,94,0.72), rgba(76,124,158,0.42)), url('${DESKTOP_TEXTURES.pricingGuarantee}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    color: "#FFFFFF",
    border: "1px solid rgba(255,255,255,0.30)",
    boxShadow: "0 22px 58px rgba(31,44,69,0.13), inset 0 1px 0 rgba(255,255,255,0.22)",
  },
  costEyebrow: {
    fontSize: 9.5,
    letterSpacing: "0.16em",
    fontWeight: 800,
    color: "#FFFFFF",
    opacity: 0.82,
  },
  costTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 23,
    lineHeight: 1.04,
    letterSpacing: "-0.04em",
    margin: "32px 0 0",
    color: "#FFFFFF",
    textWrap: "balance",
  },
  costGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
  },
  costCard: {
    minHeight: 142,
    borderRadius: 24,
    padding: "18px 18px",
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(214,225,240,0.90)",
    boxShadow: "0 20px 50px rgba(31,44,69,0.10), 0 5px 14px rgba(31,44,69,0.06), inset 0 1px 0 rgba(255,255,255,0.94)",
    display: "flex",
    flexDirection: "column",
  },
  costCardFocus: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(235,244,254,0.88))",
    border: "1px solid rgba(133,174,214,0.54)",
  },
  costCardEyebrow: {
    fontSize: 9,
    letterSpacing: "0.14em",
    fontWeight: 800,
    color: "var(--m-on-primary-container)",
  },
  costCardTitle: {
    marginTop: 12,
    fontFamily: "var(--font-display)",
    fontWeight: 820,
    fontSize: 28,
    lineHeight: 1,
    letterSpacing: "-0.04em",
    color: "var(--m-on-surface)",
  },
  costCardBody: {
    margin: "8px 0 12px",
    fontSize: 12.5,
    lineHeight: 1.45,
    color: "var(--m-on-surface-var)",
    textWrap: "pretty",
  },
  costMeta: {
    marginTop: "auto",
    fontSize: 9,
    letterSpacing: "0.12em",
    color: "var(--m-on-surface-mid)",
    fontWeight: 800,
  },
  compareStage: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 30,
    padding: 14,
    background: "radial-gradient(circle at 16% 0%, rgba(255,255,255,0.90), transparent 32%), linear-gradient(145deg, rgba(232,242,253,0.72), rgba(247,250,254,0.92) 42%, rgba(222,233,247,0.72))",
    border: "1px solid rgba(214,225,240,0.90)",
    boxShadow: "0 28px 76px rgba(31,44,69,0.14), 0 8px 18px rgba(31,44,69,0.06), inset 0 1px 0 rgba(255,255,255,0.96)",
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
    overflow: "hidden",
    borderRadius: 24,
    background: "rgba(255,255,255,0.94)",
    border: "1px solid rgba(214,225,240,0.92)",
    boxShadow: "0 24px 64px rgba(31,44,69,0.12), 0 6px 16px rgba(31,44,69,0.07), inset 0 1px 0 rgba(255,255,255,0.90)",
  },
  compareScroll: {
    overflowX: "auto",
  },
  compareHeader: {
    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
    background: "linear-gradient(180deg, rgba(246,250,255,0.98), rgba(236,244,253,0.92))",
    padding: "15px 18px",
    fontSize: 11, fontFamily: "var(--font-mono)",
    letterSpacing: "0.1em", textTransform: "uppercase",
    fontWeight: 600, color: "var(--m-on-surface-mid)",
    borderBottom: "1px solid rgba(214,225,240,0.88)",
  },
  compareGroupHeader: {
    padding: "18px 18px 9px",
    fontSize: 10.5, fontFamily: "var(--font-mono)",
    letterSpacing: "0.14em", textTransform: "uppercase",
    fontWeight: 700, color: "var(--m-primary)",
    background: "linear-gradient(90deg, rgba(244,249,255,0.92), rgba(255,255,255,0.96))",
    borderTop: "1px solid var(--m-outline-var)",
    borderBottom: "1px solid var(--m-outline-var)",
  },
  compareRow: {
    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
    padding: "11px 18px",
    fontSize: 12.5, color: "var(--m-on-surface)",
    alignItems: "center",
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
    backgroundImage: `linear-gradient(145deg, rgba(35,68,102,0.70) 0%, rgba(93,139,174,0.44) 52%, rgba(25,34,58,0.76) 100%), url('${DESKTOP_TEXTURES.pricingGuarantee}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid rgba(255,255,255,0.30)",
    boxShadow: "0 28px 72px rgba(31,44,69,0.20), inset 0 1px 0 rgba(255,255,255,0.20)",
    color: "#FFFFFF",
  },
  guaranteeH3: {
    fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700,
    letterSpacing: "-0.02em", margin: 0, color: "#FFFFFF",
  },
  guaranteeBody: {
    fontSize: 13.5, color: "#FFFFFF",
    opacity: 0.78,
    margin: "6px 0 0", textWrap: "pretty",
  },
};
