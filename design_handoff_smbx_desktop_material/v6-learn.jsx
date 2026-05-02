/* V6 — How it works + Pricing as a tab inside the Files Workspace.
   Native to V6's Material/Files surface — same card/typography vocabulary. */

const { useRef: m6lR, useEffect: m6lE, useState: m6lS } = React;

function V6LearnView({ section }) {
  // section: "how" | "pricing" — controls which subnav tab is active
  const [active, setActive] = m6lS(section || "how");
  m6lE(() => { if (section) setActive(section); }, [section]);

  return (
    <div className="fade-up" style={{ width: "100%" }}>
      {/* Hero */}
      <header style={{
        background: "linear-gradient(135deg, #DCE7F3 0%, #ECEFF6 100%)",
        borderRadius: 18,
        padding: "32px 36px",
        marginBottom: 22,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -80, right: -60, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(46,92,138,0.18) 0%, transparent 70%)" }}/>
        <div className="mono" style={{ fontSize: 10, color: "var(--m-primary)", letterSpacing: "0.16em", fontWeight: 700, marginBottom: 8 }}>
          ABOUT SMBX · YULIA
        </div>
        <h1 style={{
          fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 38, lineHeight: 1.05,
          letterSpacing: "-0.03em", color: "var(--m-on-surface)", margin: 0,
          maxWidth: 720,
        }}>
          The chat-first M&A workspace built for solo searchers.
        </h1>
        <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "var(--m-on-surface-var)", margin: "12px 0 0", maxWidth: 620 }}>
          Yulia surfaces the right deals, drafts the docs, and runs the math — so you can focus on judgment, not busy-work.
        </p>
      </header>

      {/* Sub-nav */}
      <div style={{ display: "flex", gap: 6, marginBottom: 22, borderBottom: "1px solid var(--m-outline-var)" }}>
        {[
          { id: "how", label: "How it works" },
          { id: "pricing", label: "Pricing" },
        ].map(t => (
          <button key={t.id} onClick={() => setActive(t.id)} className="m-state"
            style={{
              all: "unset", cursor: "pointer",
              padding: "10px 16px",
              fontSize: 13, fontWeight: active === t.id ? 600 : 500,
              color: active === t.id ? "var(--m-primary)" : "var(--m-on-surface-var)",
              borderBottom: active === t.id ? "2px solid var(--m-primary)" : "2px solid transparent",
              marginBottom: -1,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {active === "how" && <V6HowSection/>}
      {active === "pricing" && <V6PricingSection/>}
    </div>
  );
}

/* ──────────────────────────────────────────────
   HOW IT WORKS
   ────────────────────────────────────────────── */
function V6HowSection() {
  return (
    <div>
      {/* Three-step flow */}
      <V6LearnSection eyebrow="THE LOOP" title="How a deal moves through Yulia"
        sub="Source → diligence → decision. Yulia keeps context across all three.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[
            { n: "01", title: "Yulia surfaces deals", body: "She watches the listings you'd watch — BizBuySell, DealStream, broker emails — and ranks what's worth your 10 minutes.", chip: "Business Search" },
            { n: "02", title: "You read, ask, recast", body: "Open a CIM. Yulia drafts a recast P&L, runs comps, and answers questions. Numbers update live as you push assumptions.", chip: "Analysis" },
            { n: "03", title: "Drafts that close", body: "LOIs, NDAs, diligence checklists, deal memos — generated from your context, ready to send.", chip: "Docs" },
          ].map(s => (
            <div key={s.n} className="m-card" style={{ padding: "20px 22px" }}>
              <div className="mono" style={{ fontSize: 11, color: "var(--m-primary)", fontWeight: 700, letterSpacing: "0.1em" }}>{s.n}</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", margin: "8px 0 6px", color: "var(--m-on-surface)" }}>{s.title}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.55, color: "var(--m-on-surface-var)", margin: "0 0 12px" }}>{s.body}</p>
              <span className="mono" style={{ fontSize: 10, padding: "3px 8px", background: "var(--m-surface-2)", borderRadius: 999, color: "var(--m-on-surface-var)", fontWeight: 600, letterSpacing: "0.1em" }}>{s.chip}</span>
            </div>
          ))}
        </div>
      </V6LearnSection>

      {/* What Yulia can do — capability grid */}
      <V6LearnSection eyebrow="CAPABILITIES" title="What Yulia can do" sub="Six things she does better than scrambling in spreadsheets.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { tag: "RECAST",     title: "P&L recast in seconds",     body: "Strip owner perks, normalize comp, expose true SDE. With sources." },
            { tag: "COMPS",      title: "Comparables, on demand",     body: "Pull recent multiples for the sector — geo, size, recency filters." },
            { tag: "VALUATION",  title: "DCF + multiple",             body: "Slider-driven sensitivity. SBA-eligible structures pre-checked." },
            { tag: "QoE",        title: "Quality of earnings",        body: "Flag concentration, working-capital traps, owner dependence." },
            { tag: "BUYER FIT",  title: "Pursue / Watch / Pass",      body: "She knows your thesis. Every deal scored on fit, not just multiples." },
            { tag: "DRAFTING",   title: "LOIs, NDAs, memos",          body: "Templates filled with context — your terms, the deal's specifics." },
          ].map(c => (
            <div key={c.title} className="m-card filled-tonal" style={{ padding: "16px 18px" }}>
              <div className="mono" style={{ fontSize: 9.5, color: "var(--m-primary)", fontWeight: 700, letterSpacing: "0.14em", marginBottom: 8 }}>{c.tag}</div>
              <h4 style={{ fontFamily: "var(--font-display)", fontSize: 14.5, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 5px", color: "var(--m-on-surface)" }}>{c.title}</h4>
              <p style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--m-on-surface-var)", margin: 0 }}>{c.body}</p>
            </div>
          ))}
        </div>
      </V6LearnSection>

      {/* Why we built it */}
      <V6LearnSection eyebrow="WHY" title="Built for searchers, not bankers"
        sub="Most M&A tools assume you have a 12-person team. You don't.">
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
          <div className="m-card" style={{ padding: "24px 28px" }}>
            <p style={{ fontSize: 14.5, lineHeight: 1.65, color: "var(--m-on-surface)", margin: 0, textWrap: "pretty" }}>
              <strong>The solo searcher problem:</strong> you're sourcing 200 deals a year, qualifying 30, going deep on 5, and closing 1.
              Every step costs hours. Every CIM is a different format. Every recast is rebuilt from scratch. Yulia is the analyst, banker, and lawyer
              you can't yet afford — already up to speed on every deal you've touched.
            </p>
          </div>
          <div className="m-card filled-tonal" style={{ padding: "24px 28px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { stat: "10×", label: "more deals reviewed per week" },
                { stat: "2 hrs", label: "saved per CIM, on average" },
                { stat: "$0", label: "spent on a junior analyst" },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, letterSpacing: "-0.03em", color: "var(--m-primary)", minWidth: 72 }}>{s.stat}</div>
                  <div style={{ fontSize: 13, color: "var(--m-on-surface-var)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </V6LearnSection>

      {/* FAQ */}
      <V6LearnSection eyebrow="FAQ" title="The honest answers">
        <div className="m-card" style={{ padding: 0, overflow: "hidden" }}>
          {[
            { q: "Where does the data come from?", a: "Public listings (BizBuySell, DealStream, broker sites), the documents you upload, and your own notes. Yulia never trains on your deals." },
            { q: "Is my deal flow private?", a: "Yes. Your workspace is fully isolated. We don't share, sell, or train on your conversations or files. SOC 2 Type II in progress." },
            { q: "Can Yulia replace a CPA or attorney?", a: "No. She'll draft and flag, but you should still have a real attorney for the close and a CPA for taxes. We'll surface where you need one." },
            { q: "What about LBO models or fancy IRR?", a: "On the roadmap. Today: SDE recast, comps, multiple-based valuation, DSCR with SBA structures. Enough for 95% of search-fund deals." },
            { q: "Does it work on iOS?", a: "Yes — same workspace, optimized for one-handed reading on the go." },
          ].map((f, i, arr) => (
            <V6FaqRow key={f.q} q={f.q} a={f.a} last={i === arr.length - 1}/>
          ))}
        </div>
      </V6LearnSection>
    </div>
  );
}

function V6FaqRow({ q, a, last }) {
  const [open, setOpen] = m6lS(false);
  return (
    <div style={{ borderBottom: last ? "none" : "1px solid var(--m-outline-var)" }}>
      <button onClick={() => setOpen(!open)} className="m-state"
        style={{
          all: "unset", cursor: "pointer",
          width: "100%", boxSizing: "border-box",
          padding: "14px 22px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
        }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: "var(--m-on-surface)", letterSpacing: "-0.01em" }}>{q}</span>
        <span style={{
          width: 20, height: 20, borderRadius: 6, display: "grid", placeItems: "center",
          background: "var(--m-surface-2)", color: "var(--m-on-surface-var)",
          fontSize: 12, fontWeight: 700,
          transform: open ? "rotate(45deg)" : "none",
          transition: "transform 200ms",
        }}>+</span>
      </button>
      {open && (
        <div style={{ padding: "0 22px 18px", fontSize: 13, lineHeight: 1.6, color: "var(--m-on-surface-var)" }}>{a}</div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   PRICING
   ────────────────────────────────────────────── */
function V6PricingSection() {
  const [billing, setBilling] = m6lS("monthly");
  return (
    <div>
      {/* Billing toggle */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
        <div style={{ display: "inline-flex", padding: 4, background: "var(--m-surface-2)", borderRadius: 999 }}>
          {[
            { id: "monthly",  label: "Monthly" },
            { id: "annual",   label: "Annual · save 20%" },
          ].map(t => (
            <button key={t.id} onClick={() => setBilling(t.id)} className="m-state"
              style={{
                all: "unset", cursor: "pointer",
                padding: "8px 16px", borderRadius: 999,
                fontSize: 12.5, fontWeight: 600,
                background: billing === t.id ? "var(--m-surface-on-light)" : "transparent",
                color: billing === t.id ? "var(--m-on-surface)" : "var(--m-on-surface-mid)",
                boxShadow: billing === t.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 36 }}>
        {[
          { id: "starter", name: "Starter",   price: { monthly: 49,  annual: 39  }, sub: "For first-time searchers, kicking the tires.", cta: "Start free 14 days",
            features: ["50 deal reviews/month", "Basic recast + comps", "5 LOI / NDA drafts", "1 active deal at a time", "Email support"] },
          { id: "operator", name: "Operator", price: { monthly: 199, annual: 159 }, sub: "For active searchers running 1–3 deals at a time.", cta: "Start free 14 days", featured: true,
            features: ["Unlimited deal reviews", "Full recast + comps + valuation", "Unlimited drafts (LOI, NDA, memos)", "Up to 5 active deals", "Market intelligence feed", "Priority support · 24h SLA"] },
          { id: "fund", name: "Fund",         price: { monthly: 599, annual: 479 }, sub: "For micro-PE firms and small search funds.", cta: "Talk to sales",
            features: ["Everything in Operator", "Unlimited active deals", "Team workspace · 5 seats", "Custom diligence templates", "API + webhook access", "Dedicated success manager"] },
        ].map(p => (
          <div key={p.id} className={`m-card ${p.featured ? "elevated" : ""}`} style={{
            padding: "24px 24px 22px",
            position: "relative",
            border: p.featured ? "1.5px solid var(--m-primary)" : "1px solid var(--m-outline-var)",
            background: p.featured ? "var(--m-surface-on-light)" : undefined,
          }}>
            {p.featured && (
              <div className="mono" style={{
                position: "absolute", top: -10, left: 24,
                fontSize: 9.5, fontWeight: 700, letterSpacing: "0.14em",
                background: "var(--m-primary)", color: "#fff",
                padding: "3px 9px", borderRadius: 999,
              }}>MOST POPULAR</div>
            )}
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", margin: 0, color: "var(--m-on-surface)" }}>{p.name}</h3>
            <p style={{ fontSize: 12.5, color: "var(--m-on-surface-var)", margin: "5px 0 14px", textWrap: "pretty" }}>{p.sub}</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 16 }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--m-on-surface)" }}>${p.price[billing]}</span>
              <span style={{ fontSize: 13, color: "var(--m-on-surface-mid)" }}>/mo{billing === "annual" ? " · billed annually" : ""}</span>
            </div>
            <button className={`m-btn ${p.featured ? "filled" : "outlined"}`} style={{ width: "100%", marginBottom: 16 }}>{p.cta}</button>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {p.features.map(f => (
                <div key={f} style={{ display: "flex", gap: 8, fontSize: 12.5, color: "var(--m-on-surface-var)" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                    <path d="M3 7.5l2.5 2.5L11 4.5" stroke="var(--m-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Comparison table — full, no scroll */}
      <V6LearnSection eyebrow="DETAILS" title="Compare plans" sub="Everything in one place.">
        <div className="m-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr",
            background: "var(--m-surface-2)",
            padding: "14px 22px",
            fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase",
            fontWeight: 600, color: "var(--m-on-surface-mid)",
          }}>
            <div>Feature</div>
            <div style={{ textAlign: "center" }}>Starter</div>
            <div style={{ textAlign: "center", color: "var(--m-primary)" }}>Operator</div>
            <div style={{ textAlign: "center" }}>Fund</div>
          </div>
          {[
            ["Deal reviews / month",       "50",        "Unlimited", "Unlimited"],
            ["Active deals",                "1",         "5",         "Unlimited"],
            ["Recast P&L",                  "Basic",     "Full",      "Full"],
            ["Comparables",                 "Basic",     "Full",      "Full + custom"],
            ["Valuation + DSCR sliders",    "—",         "✓",         "✓"],
            ["Quality of earnings",         "—",         "✓",         "✓"],
            ["Doc drafting (LOI, NDA…)",    "5/mo",      "Unlimited", "Unlimited + custom"],
            ["Market intelligence feed",    "—",         "✓",         "✓"],
            ["Team seats",                  "1",         "1",         "5 (add seats $99)"],
            ["API + webhooks",              "—",         "—",         "✓"],
            ["Support",                     "Email",     "Priority",  "Dedicated CSM"],
          ].map((row, i, arr) => (
            <div key={row[0]} style={{
              display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr",
              padding: "12px 22px",
              fontSize: 13, color: "var(--m-on-surface)",
              borderBottom: i === arr.length - 1 ? "none" : "1px solid var(--m-outline-var)",
              alignItems: "center",
            }}>
              <div style={{ fontWeight: 500 }}>{row[0]}</div>
              <div style={{ textAlign: "center", color: row[1] === "—" ? "var(--m-on-surface-mid)" : "var(--m-on-surface-var)" }}>{row[1]}</div>
              <div style={{ textAlign: "center", fontWeight: 600, color: "var(--m-primary)" }}>{row[2]}</div>
              <div style={{ textAlign: "center", color: row[3] === "—" ? "var(--m-on-surface-mid)" : "var(--m-on-surface-var)" }}>{row[3]}</div>
            </div>
          ))}
        </div>
      </V6LearnSection>

      {/* Money-back + CTA */}
      <V6LearnSection eyebrow="GUARANTEE" title="Try Yulia for 14 days · no card required" sub="Cancel anytime. Money-back if you do.">
        <div className="m-card filled-tonal" style={{ padding: "28px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", margin: 0, color: "var(--m-on-surface)" }}>
              Start your search this afternoon
            </h3>
            <p style={{ fontSize: 13.5, color: "var(--m-on-surface-var)", margin: "6px 0 0", textWrap: "pretty" }}>
              No card. No setup fee. Bring a deal or use a sample. You'll know within 14 days whether Yulia is worth your $199.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="m-btn outlined">Talk to sales</button>
            <button className="m-btn filled">Start free trial</button>
          </div>
        </div>
      </V6LearnSection>
    </div>
  );
}

/* Section helper */
function V6LearnSection({ eyebrow, title, sub, children }) {
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

Object.assign(window, { V6LearnView });
