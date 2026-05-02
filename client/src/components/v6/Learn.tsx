import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

type Section = "how" | "pricing";
type Billing = "monthly" | "annual";

interface LearnProps {
  section?: Section;
  onTalkToYulia?: (prompt: string) => void;
}

export function V6LearnView({ section, onTalkToYulia }: LearnProps) {
  const [active, setActive] = useState<Section>(section ?? "how");
  useEffect(() => { if (section) setActive(section); }, [section]);

  return (
    <div className="m-fade-up" style={{ width: "100%" }}>
      <header style={L.hero}>
        <div style={L.heroGlow} aria-hidden="true" />
        <div className="mono" style={L.heroEyebrow}>ABOUT SMBX · YULIA</div>
        <h1 style={L.heroH1}>The chat-first M&amp;A workspace built for solo searchers.</h1>
        <p style={L.heroTag}>
          Yulia surfaces the right deals, drafts the docs, and runs the math &mdash; so you can focus on judgment, not busy-work.
        </p>
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
              color: active === t.id ? "var(--m-primary)" : "var(--m-on-surface-var)",
              borderBottom: active === t.id ? "2px solid var(--m-primary)" : "2px solid transparent",
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
  { n: "01", title: "Yulia surfaces deals",   body: "She watches the listings you'd watch — BizBuySell, DealStream, broker emails — and ranks what's worth your 10 minutes.", chip: "Business Search" },
  { n: "02", title: "You read, ask, recast",  body: "Open a CIM. Yulia drafts a recast P&L, runs comps, and answers questions. Numbers update live as you push assumptions.", chip: "Analysis" },
  { n: "03", title: "Drafts that close",      body: "LOIs, NDAs, diligence checklists, deal memos — generated from your context, ready to send.", chip: "Docs" },
];

interface Capability { tag: string; title: string; body: string }

const CAPABILITIES: Capability[] = [
  { tag: "RECAST",    title: "P&L recast in seconds",   body: "Strip owner perks, normalize comp, expose true SDE. With sources." },
  { tag: "COMPS",     title: "Comparables, on demand",  body: "Pull recent multiples for the sector — geo, size, recency filters." },
  { tag: "VALUATION", title: "DCF + LBO + IRR",         body: "Slider-driven sensitivity. SBA structures pre-checked. Newton-Raphson IRR." },
  { tag: "QoE",       title: "Quality of earnings",     body: "Flag concentration, working-capital traps, owner dependence." },
  { tag: "BUYER FIT", title: "Pursue / Watch / Pass",   body: "She knows your thesis. Every deal scored on fit, not just multiples." },
  { tag: "DRAFTING",  title: "LOIs, NDAs, memos",       body: "Templates filled with context — your terms, the deal's specifics." },
];

interface Stat { stat: string; label: string }

const WHY_STATS: Stat[] = [
  { stat: "10×",   label: "more deals reviewed per week" },
  { stat: "2 hrs", label: "saved per CIM, on average"    },
  { stat: "$0",    label: "spent on a junior analyst"    },
];

interface Faq { q: string; a: string }

const FAQS: Faq[] = [
  { q: "Where does the data come from?",
    a: "Public listings (BizBuySell, DealStream, broker sites), the documents you upload, and your own notes. Yulia never trains on your deals." },
  { q: "Is my deal flow private?",
    a: "Yes. Your workspace is fully isolated. We don't share, sell, or train on your conversations or files. SOC 2 Type II in progress." },
  { q: "Can Yulia replace a CPA or attorney?",
    a: "No. She'll draft and flag, but you should still have a real attorney for the close and a CPA for taxes. We'll surface where you need one." },
  { q: "What about LBO models or fancy IRR?",
    a: "All shipping. SDE recast, comps, LBO, DCF + IRR (Newton-Raphson), DSCR with SBA structures, sensitivity matrices, cap-table dilution + exit waterfall — 22 formula types in the calc engine." },
  { q: "What happens when I hit the free deliverable limit?",
    a: "Chat stays free forever. When you want a second deliverable — another ValueLens, deal score, recast, or draft — you pick a plan. No surprises, no auto-charge." },
  { q: "Does it work on mobile?",
    a: "Yes. Mobile is a separate experience optimized for one-handed reading on the go." },
  { q: "Can I cancel anytime?",
    a: "Yes. Cancel from the workspace. No penalty, no proration confusion." },
];

function HowSection() {
  return (
    <div>
      <LearnSection eyebrow="THE LOOP" title="How a deal moves through Yulia" sub="Source → diligence → decision. Yulia keeps context across all three.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {LOOP.map(s => (
            <div key={s.n} className="m-card" style={{ padding: "20px 22px" }}>
              <div className="mono" style={H.stepN}>{s.n}</div>
              <h3 style={H.stepTitle}>{s.title}</h3>
              <p style={H.stepBody}>{s.body}</p>
              <span className="mono" style={H.chip}>{s.chip}</span>
            </div>
          ))}
        </div>
      </LearnSection>

      <LearnSection eyebrow="CAPABILITIES" title="What Yulia can do" sub="Six things she does better than scrambling in spreadsheets.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          {CAPABILITIES.map(c => (
            <div key={c.title} className="m-card filled-tonal" style={{ padding: "16px 18px" }}>
              <div className="mono" style={H.capTag}>{c.tag}</div>
              <h4 style={H.capTitle}>{c.title}</h4>
              <p style={H.capBody}>{c.body}</p>
            </div>
          ))}
        </div>
      </LearnSection>

      <LearnSection eyebrow="WHY" title="Built for searchers, not bankers" sub="Most M&A tools assume you have a 12-person team. You don't.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
          <div className="m-card" style={{ padding: "24px 28px" }}>
            <p style={H.whyBody}>
              <strong>The solo searcher problem:</strong> you&rsquo;re sourcing 200 deals a year, qualifying 30, going deep on 5, and closing 1.
              Every step costs hours. Every CIM is a different format. Every recast is rebuilt from scratch. Yulia is the analyst, banker, and lawyer
              you can&rsquo;t yet afford &mdash; already up to speed on every deal you&rsquo;ve touched.
            </p>
          </div>
          <div className="m-card filled-tonal" style={{ padding: "24px 28px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {WHY_STATS.map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                  <div style={H.stat}>{s.stat}</div>
                  <div style={{ fontSize: 13, color: "var(--m-on-surface-var)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </LearnSection>

      <LearnSection eyebrow="FAQ" title="The honest answers">
        <div className="m-card" style={{ padding: 0, overflow: "hidden" }}>
          {FAQS.map((f, i) => (
            <FaqRow key={f.q} q={f.q} a={f.a} last={i === FAQS.length - 1} />
          ))}
        </div>
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

const H: Record<string, CSSProperties> = {
  stepN: {
    fontSize: 11, color: "var(--m-primary)",
    fontWeight: 700, letterSpacing: "0.1em",
  },
  stepTitle: {
    fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700,
    letterSpacing: "-0.02em", margin: "8px 0 6px", color: "var(--m-on-surface)",
  },
  stepBody: {
    fontSize: 13, lineHeight: 1.55, color: "var(--m-on-surface-var)",
    margin: "0 0 12px", textWrap: "pretty",
  },
  chip: {
    fontSize: 10, padding: "3px 8px",
    background: "var(--m-surface-2)", borderRadius: 999,
    color: "var(--m-on-surface-var)", fontWeight: 600, letterSpacing: "0.1em",
  },
  capTag: {
    fontSize: 9.5, color: "var(--m-primary)",
    fontWeight: 700, letterSpacing: "0.14em", marginBottom: 8,
  },
  capTitle: {
    fontFamily: "var(--font-display)", fontSize: 14.5, fontWeight: 700,
    letterSpacing: "-0.02em", margin: "0 0 5px", color: "var(--m-on-surface)",
  },
  capBody: {
    fontSize: 12.5, lineHeight: 1.55, color: "var(--m-on-surface-var)", margin: 0,
    textWrap: "pretty",
  },
  whyBody: {
    fontSize: 14.5, lineHeight: 1.65, color: "var(--m-on-surface)", margin: 0,
    textWrap: "pretty",
  },
  stat: {
    fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28,
    letterSpacing: "-0.03em", color: "var(--m-primary)", minWidth: 72,
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
      "Recast + Baseline™ valuation",
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
      "22-gate deal scoring",
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
      { feature: "Recast + Baseline™ valuation", cells: ["✓",          "✓",         "✓",         "✓",         "✓"] },
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
      { feature: "22-gate deal scoring",                  cells: ["—", "—", "✓", "✓", "✓"] },
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 36 }}>
        {PLANS.map(p => {
          const featured = p.featured;
          const priceDisplay = fmtPrice(p.price[billing]);
          const priceValue = p.price[billing];
          const showPerMo = priceValue !== "Free" && priceValue !== "Custom";
          return (
            <div
              key={p.id}
              className={`m-card ${featured ? "elevated" : ""}`}
              style={{
                padding: "24px 24px 22px",
                position: "relative",
                border: featured ? "1.5px solid var(--m-primary)" : "1px solid var(--m-outline-var)",
                background: featured ? "var(--m-surface-on-light)" : undefined,
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
              <button
                className={`m-btn ${featured ? "filled" : "outlined"}`}
                style={{ width: "100%", marginBottom: 16 }}
                onClick={() => handleCta(p)}
              >{p.cta}</button>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {p.features.map((f, i) => {
                  const isWedge = featured && i === 0;
                  return (
                    <div key={f} style={P.featureRow}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }}>
                        <path d="M3 7.5l2.5 2.5L11 4.5" stroke="var(--m-primary)" strokeWidth={isWedge ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span style={isWedge ? { fontWeight: 600, color: "var(--m-primary)" } : undefined}>{f}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <LearnSection eyebrow="DETAILS" title="Compare plans" sub="Everything in one place.">
        <div className="m-card" style={{ padding: 0, overflow: "hidden" }}>
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
                return (
                  <div
                    key={row.feature}
                    style={{
                      ...P.compareRow,
                      borderBottom: isLast ? "none" : "1px solid var(--m-outline-var)",
                    }}
                  >
                    <div style={{ fontWeight: 500 }}>{row.feature}</div>
                    {row.cells.map((c, j) => (
                      <div
                        key={j}
                        style={{
                          textAlign: "center",
                          color: c === "—" ? "var(--m-on-surface-mid)"
                            : j === 2 ? "var(--m-primary)"
                            : "var(--m-on-surface-var)",
                          fontWeight: j === 2 && c !== "—" ? 600 : 500,
                        }}
                      >{c}</div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </LearnSection>

      <LearnSection eyebrow="GUARANTEE" title="Use Yulia free · upgrade only when you need more" sub="Unlimited chat. One free deliverable. No credit card.">
        <div className="m-card filled-tonal" style={P.guaranteeCard}>
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
      </LearnSection>
    </div>
  );
}

/* ─── SECTION HELPER ─────────────────────────────────────── */

function LearnSection({ eyebrow, title, sub, children }: {
  eyebrow?: string; title: string; sub?: string; children: ReactNode;
}) {
  return (
    <section style={{ marginBottom: 32 }}>
      <div style={{ marginBottom: 14 }}>
        {eyebrow && <div className="mono" style={{ fontSize: 9.5, color: "var(--m-on-surface-mid)", letterSpacing: "0.14em", fontWeight: 600 }}>{eyebrow}</div>}
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, letterSpacing: "-0.025em", margin: "4px 0 0", color: "var(--m-on-surface)" }}>{title}</h2>
        {sub && <div style={{ fontSize: 13, color: "var(--m-on-surface-mid)", marginTop: 3 }}>{sub}</div>}
      </div>
      {children}
    </section>
  );
}

const L: Record<string, CSSProperties> = {
  hero: {
    background: "linear-gradient(135deg, #DCE7F3 0%, #ECEFF6 100%)",
    borderRadius: 18,
    padding: "32px 36px",
    marginBottom: 22,
    position: "relative", overflow: "hidden",
  },
  heroGlow: {
    position: "absolute", top: -80, right: -60,
    width: 280, height: 280, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(46,92,138,0.18) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  heroEyebrow: {
    fontSize: 10, color: "var(--m-primary)",
    letterSpacing: "0.16em", fontWeight: 700, marginBottom: 8,
  },
  heroH1: {
    fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 38,
    lineHeight: 1.05, letterSpacing: "-0.03em",
    color: "var(--m-on-surface)", margin: 0,
    maxWidth: 720, textWrap: "balance",
  },
  heroTag: {
    fontSize: 14.5, lineHeight: 1.55, color: "var(--m-on-surface-var)",
    margin: "12px 0 0", maxWidth: 620, textWrap: "pretty",
  },
  subnav: {
    display: "flex", gap: 6, marginBottom: 22,
    borderBottom: "1px solid var(--m-outline-var)",
  },
  subnavBtn: {
    all: "unset", cursor: "pointer",
    padding: "10px 16px",
    fontSize: 13,
    marginBottom: -1,
    transition: "color 120ms ease, border-color 120ms ease",
  },
};

const P: Record<string, CSSProperties> = {
  toggleRow: { display: "flex", justifyContent: "center", marginBottom: 18 },
  toggleWrap: {
    display: "inline-flex", padding: 4,
    background: "var(--m-surface-2)", borderRadius: 999,
  },
  toggleBtn: {
    all: "unset", cursor: "pointer",
    padding: "8px 16px", borderRadius: 999,
    fontSize: 12.5, fontWeight: 600,
    transition: "background 120ms ease, color 120ms ease, box-shadow 120ms ease",
  },
  popular: {
    position: "absolute", top: -10, left: 24,
    fontSize: 9.5, fontWeight: 700, letterSpacing: "0.14em",
    background: "var(--m-primary)", color: "#fff",
    padding: "3px 9px", borderRadius: 999,
  },
  planName: {
    fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700,
    letterSpacing: "-0.02em", margin: 0, color: "var(--m-on-surface)",
  },
  planSub: {
    fontSize: 12.5, color: "var(--m-on-surface-var)",
    margin: "5px 0 14px", textWrap: "pretty",
  },
  priceRow: {
    display: "flex", alignItems: "baseline", gap: 4, marginBottom: 16,
  },
  priceNumber: {
    fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800,
    letterSpacing: "-0.03em", color: "var(--m-on-surface)",
  },
  priceUnit: { fontSize: 13, color: "var(--m-on-surface-mid)" },
  featureRow: {
    display: "flex", gap: 8,
    fontSize: 12.5, color: "var(--m-on-surface-var)",
    lineHeight: 1.4,
  },
  compareHeader: {
    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
    background: "var(--m-surface-2)",
    padding: "14px 18px",
    fontSize: 11, fontFamily: "var(--font-mono)",
    letterSpacing: "0.1em", textTransform: "uppercase",
    fontWeight: 600, color: "var(--m-on-surface-mid)",
  },
  compareGroupHeader: {
    padding: "16px 18px 8px",
    fontSize: 10.5, fontFamily: "var(--font-mono)",
    letterSpacing: "0.14em", textTransform: "uppercase",
    fontWeight: 700, color: "var(--m-primary)",
    background: "var(--m-surface-2)",
    borderTop: "1px solid var(--m-outline-var)",
    borderBottom: "1px solid var(--m-outline-var)",
  },
  compareRow: {
    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
    padding: "12px 18px",
    fontSize: 12.5, color: "var(--m-on-surface)",
    alignItems: "center",
  },
  guaranteeCard: {
    padding: "28px 32px",
    display: "flex", justifyContent: "space-between",
    alignItems: "center", gap: 24, flexWrap: "wrap",
  },
  guaranteeH3: {
    fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700,
    letterSpacing: "-0.02em", margin: 0, color: "var(--m-on-surface)",
  },
  guaranteeBody: {
    fontSize: 13.5, color: "var(--m-on-surface-var)",
    margin: "6px 0 0", textWrap: "pretty",
  },
};
