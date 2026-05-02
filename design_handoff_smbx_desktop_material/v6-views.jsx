/* V6 — Item-tab views: Deal, Doc editor, Analysis with sliders. */

const { useState: m6iS } = React;

/* ──────────────────────────────────────────────
   DEAL VIEW — opens when a deal card is clicked
   ────────────────────────────────────────────── */
function V6DealView({ title, openTab }) {
  return (
    <div className="fade-up" style={{ maxWidth: 1180 }}>
      {/* Hero strip */}
      <section style={{ marginBottom: 28 }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--m-on-surface-mid)", letterSpacing: "0.14em", fontWeight: 600, marginBottom: 6 }}>
          DEAL · UPDATED 12 MIN AGO
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 36, letterSpacing: "-0.025em", margin: 0, color: "var(--m-on-surface)" }}>{title}</h1>
            <div style={{ fontSize: 14, color: "var(--m-on-surface-var)", marginTop: 6 }}>$5.4M revenue · East Texas · industrial services rollup target</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="m-btn outlined">Export</button>
            <button className="m-btn outlined">Share</button>
            <button className="m-btn filled">Draft IOI</button>
          </div>
        </div>
      </section>

      {/* Verdict banner */}
      <section style={{ marginBottom: 32 }}>
        <div className="m-card" style={{
          padding: "20px 24px",
          background: "var(--m-pursue-container)",
          color: "var(--m-pursue-on-cont)",
          border: "none",
          display: "flex", alignItems: "center", gap: 24,
        }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--m-pursue)", color: "#fff", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M5 11l4 4 8-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", fontWeight: 700, opacity: 0.7 }}>VERDICT · PURSUE</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", marginTop: 2 }}>
              Recurring revenue, honest add-backs. The concentration reads as a moat, not a risk.
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 28, letterSpacing: "-0.02em" }}>92</div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", fontWeight: 600, opacity: 0.7 }}>FIT</div>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {[
            { k: "Revenue",  v: "$5.4M", sub: "TTM" },
            { k: "SDE",      v: "$1.80M", sub: "33% margin" },
            { k: "Asking",   v: "$12.6M", sub: "7.0× SDE" },
            { k: "EBITDA",   v: "$1.45M", sub: "Recast" },
            { k: "Customers",v: "47",     sub: "Top 3 = 38%" },
          ].map(s => (
            <div key={s.k} className="m-card" style={{ padding: "14px 18px" }}>
              <div className="mono" style={{ fontSize: 10, color: "var(--m-on-surface-mid)", letterSpacing: "0.14em", fontWeight: 600 }}>{s.k.toUpperCase()}</div>
              <div className="mono" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", color: "var(--m-on-surface)", marginTop: 4 }}>{s.v}</div>
              <div style={{ fontSize: 11.5, color: "var(--m-on-surface-mid)", marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Linked work */}
      <V6Section eyebrow="LINKED WORK" title="Files Yulia produced" sub="Click any to open in a new tab.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { kind: "doc",      title: "LOI v3",          status: "draft", sub: "Last edited 3 days ago" },
            { kind: "doc",      title: "QoE Lite report", status: "live",  sub: "Auto-updated last night" },
            { kind: "analysis", title: "Recast P&L",      status: "live",  sub: "5 add-backs surfaced" },
            { kind: "analysis", title: "Comps · 7 deals", status: "saved", sub: "Range: 5.8× — 7.2×" },
            { kind: "analysis", title: "Buyer fit",       status: "live",  sub: "92 against your thesis" },
            { kind: "doc",      title: "Memo v2",         status: "draft", sub: "Awaiting your read" },
          ].map(f => (
            <div key={f.title} className="m-card m-state tap"
              onClick={() => openTab && openTab({ kind: f.kind, title: `${title} · ${f.title}` })}
              style={{ padding: "14px 16px", cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <V6Icon name={f.kind === "doc" ? "doc" : "chart"} size={14}/>
                <V6DocStatus status={f.status}/>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13.5, letterSpacing: "-0.01em", color: "var(--m-on-surface)", marginTop: 12 }}>{f.title}</div>
              <div style={{ fontSize: 11.5, color: "var(--m-on-surface-mid)", marginTop: 2 }}>{f.sub}</div>
            </div>
          ))}
        </div>
      </V6Section>

      {/* Yulia's read */}
      <V6Section eyebrow="YULIA'S READ" title="Why pursue">
        <div className="m-card" style={{ padding: "24px 28px" }}>
          <div style={{ fontSize: 14.5, lineHeight: 1.65, color: "var(--m-on-surface-var)", textWrap: "pretty" }}>
            <p style={{ margin: "0 0 14px" }}>The recurring revenue holds up. <strong style={{ color: "var(--m-on-surface)" }}>78% of revenue</strong> comes from monthly service contracts averaging 4.3 years tenure. Add-backs are unusually honest — owner's salary, family member on payroll, and a one-time legal expense from a 2023 dispute. None of the AI-flag stuff (boats, "consulting", phantom mileage).</p>
            <p style={{ margin: "0 0 14px" }}>The customer concentration looks like a problem on paper. <strong style={{ color: "var(--m-on-surface)" }}>The top three customers are 38% of revenue.</strong> But two of them are decade-long relationships embedded in their operations — switching costs are real, not hypothetical. Read it as a moat.</p>
            <p style={{ margin: 0 }}>At <strong style={{ color: "var(--m-on-surface)" }}>$12.6M asking · 7.0× recast SDE</strong>, you're paying market for a clean operator. SBA-clears at 78% LTV with $200k working capital reserve. I'd start at 6.5× and meet at 6.8×.</p>
          </div>
        </div>
      </V6Section>
    </div>
  );
}

/* ──────────────────────────────────────────────
   DOC VIEW — full editor with inline comment rail
   ────────────────────────────────────────────── */
function V6DocView({ title }) {
  return (
    <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 32, alignItems: "flex-start", maxWidth: 1180 }}>
      <article style={{
        background: "var(--m-surface-on-light)",
        borderRadius: 16,
        boxShadow: "var(--m-elev-1)",
        padding: "56px 64px",
        minHeight: 600,
      }}>
        {/* Toolbar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 4, marginBottom: 32,
          paddingBottom: 16, borderBottom: "1px solid var(--m-outline-var)",
          marginLeft: -64, marginRight: -64, paddingLeft: 64, paddingRight: 64, marginTop: -56, paddingTop: 18,
        }}>
          {[
            { l: "Heading", v: "H2 ▾" },
            { l: "Bold", v: "B" },
            { l: "Italic", v: "I" },
            { l: "Underline", v: "U" },
            { l: "Link", v: "🔗" },
            { l: "List", v: "≣" },
            { l: "Quote", v: "❝" },
          ].map((b, i) => (
            <React.Fragment key={i}>
              {i === 1 && <div style={{ width: 1, height: 18, background: "var(--m-outline-var)", margin: "0 6px" }}/>}
              {i === 4 && <div style={{ width: 1, height: 18, background: "var(--m-outline-var)", margin: "0 6px" }}/>}
              <button className="m-state" style={{
                all: "unset",
                padding: "5px 10px", borderRadius: 6,
                fontSize: 12, color: "var(--m-on-surface-var)", cursor: "pointer",
                fontWeight: i === 1 ? 700 : i === 2 ? 400 : 500,
                fontStyle: i === 2 ? "italic" : "normal",
                textDecoration: i === 3 ? "underline" : "none",
              }}>{b.v}</button>
            </React.Fragment>
          ))}
          <div style={{ flex: 1 }}/>
          <span className="mono" style={{ fontSize: 10.5, color: "var(--m-on-surface-mid)", letterSpacing: "0.1em" }}>SAVED · 12 MIN AGO</span>
          <V6DocStatus status="draft"/>
        </div>

        {/* Document body */}
        <div style={{ fontFamily: "Iowan Old Style, Charter, Georgia, serif", color: "var(--m-on-surface)" }}>
          <div className="mono" style={{ fontSize: 10, color: "var(--m-on-surface-mid)", letterSpacing: "0.14em", fontWeight: 600, marginBottom: 12 }}>
            LETTER OF INTENT · DRAFT v3
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, letterSpacing: "-0.02em", margin: "0 0 20px", lineHeight: 1.15 }}>{title.replace(" · LOI v3", "")}</h1>
          <p style={{ fontSize: 13.5, color: "var(--m-on-surface-mid)", marginBottom: 28, fontFamily: "var(--font-body)" }}>
            From: Apex SMB Holdings &nbsp;·&nbsp; To: J. Marston, Owner &nbsp;·&nbsp; Re: Acquisition of Industrial Svc &nbsp;·&nbsp; Date: March 27, 2026
          </p>

          <p style={{ fontSize: 16, lineHeight: 1.7, marginBottom: 18 }}>
            We are pleased to submit this non-binding letter of intent ("<strong>LOI</strong>") to acquire substantially all of the assets and operating business of Industrial Svc, LLC (the "<strong>Company</strong>"), subject to the terms summarized below.
          </p>

          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, letterSpacing: "-0.015em", margin: "32px 0 12px", lineHeight: 1.3 }}>1. Purchase Price &amp; Structure</h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, marginBottom: 14 }}>
            Total enterprise value of <strong>$11.4M</strong> on a debt-free, cash-free basis, comprised of:
          </p>
          <ul style={{ fontSize: 16, lineHeight: 1.75, paddingLeft: 24, margin: "0 0 18px" }}>
            <li><strong>$8.6M</strong> cash at closing, financed via SBA 7(a) loan and equity contribution</li>
            <li><strong>$1.8M</strong> seller note, 5-year amortization at 7.5% interest</li>
            <li><strong>$1.0M</strong> earn-out tied to 2026 EBITDA targets, paid quarterly in 2027</li>
          </ul>

          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, letterSpacing: "-0.015em", margin: "32px 0 12px", lineHeight: 1.3 }}>2. Diligence &amp; Conditions</h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, marginBottom: 14 }}>
            <span style={{ background: "rgba(195, 139, 0, 0.16)", padding: "1px 4px", borderRadius: 3, position: "relative" }}>
              45-day exclusivity period commencing on signature of this LOI
              <span style={{ position: "absolute", top: -4, right: -4, width: 8, height: 8, borderRadius: 999, background: "var(--m-watch)", boxShadow: "0 0 0 2px var(--m-surface-on-light)" }}/>
            </span>, during which the Buyer will conduct customary due diligence including financial review, legal/contractual review, and customer interviews (with prior approval).
          </p>

          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, letterSpacing: "-0.015em", margin: "32px 0 12px", lineHeight: 1.3 }}>3. Working Capital</h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, marginBottom: 14 }}>
            The Company shall be delivered with a normalized level of working capital, defined as the trailing 12-month average less ordinary cash distributions to the Seller. A target of <strong>$420,000</strong> in net working capital shall be agreed upon prior to closing.
          </p>

          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, letterSpacing: "-0.015em", margin: "32px 0 12px", lineHeight: 1.3 }}>4. Transition &amp; Non-Compete</h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, marginBottom: 14 }}>
            The Seller agrees to a 90-day transition period at full salary, with consulting availability for an additional 9 months at a reduced rate. A 4-year non-compete covering the East Texas service region will be executed at closing.
          </p>
        </div>
      </article>

      {/* Right rail — comments + Yulia */}
      <aside style={{ position: "sticky", top: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="m-card" style={{ padding: "14px 16px", background: "var(--m-primary-container)", color: "var(--m-on-primary-container)", border: "none" }}>
          <div className="mono" style={{ fontSize: 9.5, letterSpacing: "0.14em", fontWeight: 600, opacity: 0.7 }}>YULIA · LIVE</div>
          <div style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "-0.01em", marginTop: 4 }}>I'm watching this draft</div>
          <div style={{ fontSize: 11.5, marginTop: 4, lineHeight: 1.45, opacity: 0.85 }}>
            Section 2 — your 45-day exclusivity is on the long side. Comparable LOIs in this sector are 30 days. Want me to flag that?
          </div>
        </div>

        <div className="m-card" style={{ padding: "14px 16px" }}>
          <div className="mono" style={{ fontSize: 9.5, color: "var(--m-on-surface-mid)", letterSpacing: "0.14em", fontWeight: 600, marginBottom: 10 }}>COMMENTS · 3</div>
          {[
            { who: "JM", color: "var(--m-tertiary-container)", txt: "Earn-out should be tied to gross margin not EBITDA — too easy to game.", time: "1d" },
            { who: "Y",  color: "var(--m-primary-container)",  txt: "Working cap target looks light vs trailing 12 ($487k avg). Suggest $460k.", time: "today" },
            { who: "JM", color: "var(--m-tertiary-container)", txt: "Agree. Update before sending.", time: "2h" },
          ].map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, paddingBottom: 10, borderBottom: i === 2 ? "none" : "1px solid var(--m-outline-var)" }}>
              <div style={{ width: 22, height: 22, borderRadius: 7, background: c.color, display: "grid", placeItems: "center", flexShrink: 0, fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 9.5, color: "var(--m-on-surface)" }}>{c.who}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: "var(--m-on-surface)", lineHeight: 1.5 }}>{c.txt}</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--m-on-surface-mid)", letterSpacing: "0.06em", marginTop: 3 }}>{c.time.toUpperCase()}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="m-card" style={{ padding: "14px 16px" }}>
          <div className="mono" style={{ fontSize: 9.5, color: "var(--m-on-surface-mid)", letterSpacing: "0.14em", fontWeight: 600, marginBottom: 8 }}>VERSION HISTORY</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { v: "v3", date: "Today, 12 min ago", current: true },
              { v: "v2", date: "Mar 24 · 4:18 PM" },
              { v: "v1", date: "Mar 22 · 10:04 AM" },
            ].map(v => (
              <div key={v.v} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5, color: v.current ? "var(--m-on-surface)" : "var(--m-on-surface-mid)" }}>
                <span style={{ fontWeight: v.current ? 600 : 400 }}>{v.v} {v.current && "· current"}</span>
                <span className="mono" style={{ fontSize: 10 }}>{v.date}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ──────────────────────────────────────────────
   ANALYSIS VIEW — sliders + computed outputs
   ────────────────────────────────────────────── */
function V6AnalysisView({ title }) {
  const [multiple, setMultiple] = m6iS(7.0);
  const [sde, setSde] = m6iS(1.80);
  const [downPct, setDownPct] = m6iS(20);
  const [interest, setInterest] = m6iS(11.5);
  const [growth, setGrowth] = m6iS(4);

  const purchase = +(sde * multiple).toFixed(2);
  const down = +(purchase * downPct / 100).toFixed(2);
  const loan = +(purchase - down).toFixed(2);
  const monthlyDebt = +((loan * (interest/100/12) * Math.pow(1+interest/100/12, 120)) / (Math.pow(1+interest/100/12, 120) - 1)).toFixed(3);
  const annualDebt = +(monthlyDebt * 12).toFixed(2);
  const cashFlow = +(sde - annualDebt).toFixed(2);
  const dscr = +(sde / annualDebt).toFixed(2);

  return (
    <div className="fade-up" style={{ maxWidth: 1180 }}>
      {/* Hero */}
      <section style={{ marginBottom: 24 }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--m-on-surface-mid)", letterSpacing: "0.14em", fontWeight: 600, marginBottom: 6 }}>
          ANALYSIS · LIVE · YULIA RECOMPUTES AS YOU MOVE
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 32, letterSpacing: "-0.025em", margin: 0, color: "var(--m-on-surface)" }}>{title}</h1>
            <div style={{ fontSize: 13.5, color: "var(--m-on-surface-var)", marginTop: 6 }}>SBA 7(a) leverage scenario · 10-year amortization · 78% LTV</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="m-btn outlined">Reset</button>
            <button className="m-btn outlined">Save scenario</button>
            <button className="m-btn filled">Add to deal</button>
          </div>
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 24, alignItems: "flex-start" }}>
        {/* Inputs */}
        <div className="m-card" style={{ padding: "20px 22px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em", color: "var(--m-on-surface)", marginBottom: 18 }}>Inputs</div>

          <V6Slider label="Multiple of SDE" val={multiple} setVal={setMultiple} min={5} max={9} step={0.1} fmt={v => `${v.toFixed(1)}×`}/>
          <V6Slider label="SDE ($M)" val={sde} setVal={setSde} min={1.0} max={3.0} step={0.05} fmt={v => `$${v.toFixed(2)}M`}/>
          <V6Slider label="Down payment (%)" val={downPct} setVal={setDownPct} min={10} max={40} step={1} fmt={v => `${v}%`}/>
          <V6Slider label="Interest rate (%)" val={interest} setVal={setInterest} min={8} max={14} step={0.25} fmt={v => `${v.toFixed(2)}%`}/>
          <V6Slider label="Year-1 growth assumption" val={growth} setVal={setGrowth} min={-5} max={15} step={0.5} fmt={v => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`}/>

          <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--m-outline-var)" }}>
            <div className="mono" style={{ fontSize: 9.5, color: "var(--m-on-surface-mid)", letterSpacing: "0.14em", fontWeight: 600, marginBottom: 10 }}>SCENARIOS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { l: "Conservative",   m: 6.5, s: 1.65, d: 25, i: 11.5 },
                { l: "Base case",      m: 7.0, s: 1.80, d: 20, i: 11.5 },
                { l: "Aggressive",     m: 7.5, s: 1.85, d: 15, i: 11.5 },
              ].map(sc => (
                <button key={sc.l} className="m-state" onClick={() => { setMultiple(sc.m); setSde(sc.s); setDownPct(sc.d); setInterest(sc.i); }}
                  style={{
                    all: "unset",
                    padding: "8px 12px", borderRadius: 8,
                    fontSize: 12, color: "var(--m-on-surface-var)", cursor: "pointer",
                    background: "var(--m-surface-2)",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                  <span style={{ fontWeight: 600 }}>{sc.l}</span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--m-on-surface-mid)" }}>{sc.m}× · ${sc.s}M · {sc.d}%</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div>
          {/* Big result cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
            <V6OutputCard label="Purchase price" value={`$${purchase.toFixed(2)}M`} sub={`${multiple.toFixed(1)}× × $${sde.toFixed(2)}M SDE`} accent="primary"/>
            <V6OutputCard label="Cash to close" value={`$${down.toFixed(2)}M`} sub={`${downPct}% down · $${loan.toFixed(2)}M financed`} accent="tertiary"/>
            <V6OutputCard label="DSCR" value={dscr.toFixed(2)} sub={dscr >= 1.25 ? "Bank-clear (≥1.25)" : dscr >= 1.15 ? "Marginal" : "Tight"} accent={dscr >= 1.25 ? "pursue" : dscr >= 1.15 ? "watch" : "pass"}/>
          </div>

          {/* Cash flow waterfall */}
          <div className="m-card" style={{ padding: "20px 24px", marginBottom: 20 }}>
            <div className="mono" style={{ fontSize: 9.5, color: "var(--m-on-surface-mid)", letterSpacing: "0.14em", fontWeight: 600, marginBottom: 14 }}>CASH FLOW · YEAR 1</div>
            <V6FlowRow label="SDE (cash earnings)"   val={sde}                 sign="+" big/>
            <V6FlowRow label="Annual debt service"   val={annualDebt}          sign="−"/>
            <V6FlowRow label="Working capital reserve" val={0.20}              sign="−"/>
            <V6FlowRow label="Owner draw / cushion"  val={0.15}                sign="−"/>
            <div style={{ borderTop: "1px solid var(--m-outline-var)", margin: "12px 0 8px" }}/>
            <V6FlowRow label="Free cash flow" val={+(cashFlow - 0.35).toFixed(2)} sign="=" total accent={cashFlow > 0.5 ? "pursue" : cashFlow > 0.2 ? "watch" : "pass"}/>
          </div>

          {/* Yulia's read */}
          <div className="m-card" style={{ padding: "20px 24px", background: "var(--m-primary-container)", color: "var(--m-on-primary-container)", border: "none" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--m-primary)", color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>Y</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="mono" style={{ fontSize: 9.5, letterSpacing: "0.14em", fontWeight: 600, opacity: 0.7 }}>YULIA'S READ</div>
                <div style={{ fontSize: 13, lineHeight: 1.55, marginTop: 4 }}>
                  At <strong>{multiple.toFixed(1)}× × ${sde.toFixed(2)}M</strong>, you're paying <strong>${purchase.toFixed(2)}M</strong>. With {downPct}% down at {interest}%, DSCR lands at <strong>{dscr.toFixed(2)}</strong> — {dscr >= 1.25 ? "comfortably above SBA's 1.25 threshold" : dscr >= 1.15 ? "marginal; banks will push back" : "below bank-clear; this won't close as structured"}. {cashFlow >= 0.6 && "Year-1 owner cash is healthy after debt service."}{cashFlow > 0 && cashFlow < 0.6 && "Year-1 cash is tight after debt service — leave room for surprises."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function V6Slider({ label, val, setVal, min, max, step, fmt }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "var(--m-on-surface-var)", fontWeight: 500 }}>{label}</span>
        <span className="mono" style={{ fontSize: 13, color: "var(--m-on-surface)", fontWeight: 700, letterSpacing: "-0.01em" }}>{fmt(val)}</span>
      </div>
      <input type="range" className="m-slider" min={min} max={max} step={step} value={val} onChange={(e) => setVal(parseFloat(e.target.value))}/>
    </div>
  );
}

function V6OutputCard({ label, value, sub, accent }) {
  const accentMap = {
    primary:  { bg: "var(--m-primary-container)",  fg: "var(--m-on-primary-container)" },
    tertiary: { bg: "var(--m-tertiary-container)", fg: "var(--m-on-tertiary-container)" },
    pursue:   { bg: "var(--m-pursue-container)",   fg: "var(--m-pursue-on-cont)" },
    watch:    { bg: "var(--m-watch-container)",    fg: "#3F2E00" },
    pass:     { bg: "var(--m-pass-container)",     fg: "#4A1410" },
  }[accent] || { bg: "var(--m-surface-2)", fg: "var(--m-on-surface)" };
  return (
    <div className="m-card" style={{ padding: "16px 18px", background: accentMap.bg, color: accentMap.fg, border: "none" }}>
      <div className="mono" style={{ fontSize: 9.5, letterSpacing: "0.14em", fontWeight: 600, opacity: 0.7 }}>{label.toUpperCase()}</div>
      <div className="mono" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, letterSpacing: "-0.025em", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div style={{ fontSize: 11.5, marginTop: 4, opacity: 0.78 }}>{sub}</div>
    </div>
  );
}

function V6FlowRow({ label, val, sign, big, total, accent }) {
  const color = accent === "pursue" ? "var(--m-pursue)" : accent === "watch" ? "var(--m-watch)" : accent === "pass" ? "var(--m-pass)" : "var(--m-on-surface)";
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "6px 0", fontSize: total ? 14 : 12.5, fontWeight: total || big ? 700 : 500, color: total ? color : "var(--m-on-surface-var)" }}>
      <span>{label}</span>
      <span className="mono" style={{ fontSize: total ? 18 : 13.5, fontWeight: total ? 800 : 600, letterSpacing: "-0.01em", color: total ? color : "var(--m-on-surface)", fontVariantNumeric: "tabular-nums" }}>
        <span style={{ color: "var(--m-on-surface-mid)", marginRight: 6 }}>{sign}</span>${val.toFixed(2)}M
      </span>
    </div>
  );
}

Object.assign(window, { V6DealView, V6DocView, V6AnalysisView, V6Slider, V6OutputCard, V6FlowRow });
