/* V6 — Mode root surfaces.
   App Store-style layouts: hero card + horizontally-flowing collections + lists. */

const { useState: m6mS } = React;

/* ──────────────────────────────────────────────
   BUSINESS SEARCH — portfolio overview (was "home")
   ────────────────────────────────────────────── */
function V6SearchRoot({ openTab }) {
  return (
    <div className="fade-up">
      {/* Hero — Today's Brief */}
      <section style={{ marginBottom: 36 }}>
        <div className="m-card elevated tap" onClick={() => openTab({ kind: "deal", title: "Industrial Svc · TX", id: "deal-industrial" })}
          style={{
            position: "relative", overflow: "hidden",
            background: "linear-gradient(135deg, #2E5C8A 0%, #1A3D63 100%)",
            color: "#fff", padding: 0,
            border: "none",
          }}>
          <div style={{ position: "absolute", top: -120, right: -100, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)", pointerEvents: "none" }}/>
          <div style={{ position: "relative", padding: "24px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.85)", letterSpacing: "0.14em", fontWeight: 600 }}>WELCOME TO SMBX · WORKING SAMPLE</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>Friday, March 27</span>
          </div>
          <div style={{ position: "relative", padding: "20px 28px 0" }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 38, letterSpacing: "-0.03em", lineHeight: 1.05, margin: 0, color: "#fff", maxWidth: 760, textWrap: "balance" }}>
              Agentic AI specifically built for buying and selling businesses of all shapes and sizes.
            </h1>
            <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "rgba(255,255,255,0.88)", margin: "12px 0 0", maxWidth: 620, textWrap: "pretty" }}>
              Yulia does all of the hard work — so your deal team can focus on building relationships and making deals better and faster.
            </p>
          </div>
          <div style={{ position: "relative", padding: "16px 28px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", letterSpacing: "0.14em", fontWeight: 600 }}>YULIA'S PICKS · TODAY · 5 DEALS · 14 MIN READ</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>↓ tap any to open</span>
          </div>
          <div style={{ position: "relative", margin: "12px 18px 18px", background: "rgba(255,255,255,0.14)", borderRadius: 14 }}>
            {[
              { rank: 1, name: "Industrial Svc · TX", note: "$1.80M SDE · honest capex story", fit: 92 },
              { rank: 2, name: "Pest Control · FL", note: "92% on monthly contracts", fit: 84 },
              { rank: 3, name: "Electrical · TX", note: "Margins good · concentration risk", fit: 78 },
              { rank: 4, name: "HVAC platform · CO", note: "Family business · clean financials", fit: 74 },
              { rank: 5, name: "Distribution · OH", note: "Asking high · margins thin", fit: 61 },
            ].map((p, i, arr) => (
              <div key={p.rank} style={{
                display: "grid", gridTemplateColumns: "32px 1.4fr 2.4fr 60px",
                alignItems: "center", gap: 16, padding: "11px 22px",
                borderBottom: i === arr.length - 1 ? "none" : "1px solid rgba(255,255,255,0.1)",
              }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "rgba(255,255,255,0.6)", textAlign: "center" }}>{p.rank}</span>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "#fff", letterSpacing: "-0.01em" }}>{p.name}</span>
                <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.75)" }}>{p.note}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 17, fontWeight: 700, color: "#fff", textAlign: "right", fontVariantNumeric: "tabular-nums", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  {p.fit}
                  <span style={{ fontSize: 8, color: "rgba(255,255,255,0.6)", letterSpacing: "0.12em", fontWeight: 600, marginTop: -2 }}>FIT</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* In Review */}
      <V6Section
        eyebrow="PIPELINE · 6 IN REVIEW"
        title="In review"
        sub="Live deals you and Yulia are working"
        action={<button className="m-btn text" style={{ height: 28, fontSize: 12 }}>See all →</button>}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {[
            { verdict: "pursue", id: "deal-industrial", name: "Industrial Svc · TX",     sub: "$5.4M rev · East Texas", fit: 92, sde: "$1.80M", multiple: "7.0×", note: "Recurring revenue. Honest addd-backs. The concentration reads as moat." },
            { verdict: "pursue", id: "deal-pest",       name: "Pest Control · FL",       sub: "$4.1M rev · Orlando",   fit: 84, sde: "$1.40M", multiple: "6.5×", note: "92% on monthly contracts. Add-back rich but legitimate." },
            { verdict: "watch",  id: "deal-electrical", name: "Electrical Contractor · TX", sub: "$8.7M rev · Austin", fit: 78, sde: "$2.10M", multiple: "6.0×", note: "Margins are good, but 60% of revenue is one customer." },
            { verdict: "watch",  id: "deal-hvac",       name: "HVAC platform · CO",      sub: "$3.6M rev · Denver",    fit: 74, sde: "$0.95M", multiple: "6.8×", note: "Family business. Clean financials. Owner wants to retire — succession plan unclear." },
            { verdict: "pass",   id: "deal-dist",       name: "Distribution · OH",       sub: "$11.2M rev · Cleveland",fit: 61, sde: "$1.55M", multiple: "8.5×", note: "Asking is rich, margins are thin, and inventory turns are slowing." },
            { verdict: "pass",   id: "deal-marina",     name: "Marina Holdings · FL",    sub: "$8.2M rev · Tampa Bay", fit: 42, sde: "$1.20M", multiple: "9.0×", note: "Asking is 50% above SBA-clear and the add-backs don't survive scrutiny." },
          ].map(d => (
            <V6DealCard key={d.id} {...d} onClick={() => openTab({ kind: "deal", title: d.name, id: d.id })}/>
          ))}
        </div>
      </V6Section>

      {/* Watching */}
      <V6Section
        eyebrow="YULIA IS WATCHING · 87 SOURCES"
        title="Yulia is watching"
        sub="Sources Yulia revisits weekly. Click to add to pipeline.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 14 }}>
          <div className="m-card" style={{ overflow: "hidden", padding: 0 }}>
            {[
              { tag: "B", name: "BizBuySell · MN distribution", sub: "Updated 2h ago", count: 142 },
              { tag: "L", name: "LoopNet · Marina sales", sub: "Updated yesterday", count: 28 },
              { tag: "A", name: "Axial · Industrial services", sub: "Updated 3d ago", count: 64 },
              { tag: "I", name: "IBBA · Brokered listings", sub: "Updated this week", count: 311 },
            ].map((w, i, arr) => <V6WatchRow key={w.tag} {...w} last={i === arr.length - 1}/>)}
          </div>
          <div className="m-card" style={{ overflow: "hidden", padding: 0 }}>
            {[
              { tag: "D", name: "DealStream · MEP services", sub: "Updated 4h ago", count: 87 },
              { tag: "S", name: "Sunbelt Network · TX/FL", sub: "Updated 2d ago", count: 53 },
              { tag: "M", name: "Murphy Business · Auto repair", sub: "Updated this week", count: 96 },
              { tag: "T", name: "Transworld · HVAC roll-ups", sub: "Updated this week", count: 41 },
            ].map((w, i, arr) => <V6WatchRow key={w.tag} {...w} last={i === arr.length - 1}/>)}
          </div>
        </div>
      </V6Section>

      {/* Recently closed */}
      <V6Section eyebrow="RECENT" title="Recently closed" sub="Reference deals — ask Yulia about any of them">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {[
            { name: "Auto repair · 4-loc", sub: "Closed at $3.2M · 6.4×", date: "MAR 12" },
            { name: "MEP services · NM", sub: "Closed at $9.1M · 7.8×", date: "FEB 28" },
            { name: "HVAC · CO", sub: "Closed at $4.8M · 6.9×", date: "FEB 14" },
            { name: "Pest control · GA", sub: "Closed at $5.3M · 7.2×", date: "FEB 02" },
          ].map(d => (
            <div key={d.name} className="m-card filled-tonal m-state tap"
              onClick={() => openTab({ kind: "deal", title: d.name + " (closed)" })}
              style={{ padding: "14px 16px", cursor: "pointer" }}>
              <div className="mono" style={{ fontSize: 9.5, color: "var(--m-on-surface-mid)", letterSpacing: "0.14em", fontWeight: 600 }}>{d.date}</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em", color: "var(--m-on-surface)", marginTop: 6 }}>{d.name}</div>
              <div style={{ fontSize: 12, color: "var(--m-on-surface-mid)", marginTop: 2 }}>{d.sub}</div>
            </div>
          ))}
        </div>
      </V6Section>
    </div>
  );
}

function V6DealCard({ verdict, name, sub, fit, sde, multiple, note, onClick }) {
  const verdictColor = {
    pursue: { bg: "var(--m-pursue-container)", fg: "var(--m-pursue-on-cont)", chip: "var(--m-pursue)" },
    watch:  { bg: "var(--m-watch-container)",  fg: "#3F2E00",                 chip: "var(--m-watch)" },
    pass:   { bg: "var(--m-pass-container)",   fg: "#4A1410",                 chip: "var(--m-pass)" },
  }[verdict];
  const labelMap = { pursue: "PURSUE", watch: "WATCH", pass: "PASS" };
  return (
    <div onClick={onClick} className="m-card m-state tap" style={{ padding: "16px 18px", cursor: "pointer" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, letterSpacing: "-0.015em", color: "var(--m-on-surface)" }}>{name}</div>
          <div style={{ fontSize: 11.5, color: "var(--m-on-surface-mid)", marginTop: 2 }}>{sub}</div>
        </div>
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10,
          letterSpacing: "0.12em",
          color: verdictColor.fg, background: verdictColor.bg,
          padding: "4px 9px", borderRadius: 999, flexShrink: 0,
        }}>{labelMap[verdict]}</span>
      </div>
      <div style={{ display: "flex", gap: 18, marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--m-outline-var)" }}>
        <V6Stat label="SDE" val={sde}/>
        <V6Stat label="Mult." val={multiple}/>
        <V6Stat label="Fit" val={fit} accent={verdictColor.chip}/>
      </div>
      <div style={{ fontSize: 12, color: "var(--m-on-surface-var)", lineHeight: 1.5, marginTop: 10, textWrap: "pretty" }}>{note}</div>
    </div>
  );
}

function V6Stat({ label, val, accent }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 9, color: "var(--m-on-surface-mid)", letterSpacing: "0.12em", fontWeight: 600 }}>{label.toUpperCase()}</div>
      <div className="mono" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em", color: accent || "var(--m-on-surface)", marginTop: 1, fontVariantNumeric: "tabular-nums" }}>{val}</div>
    </div>
  );
}

function V6WatchRow({ tag, name, sub, count, last }) {
  return (
    <div className="m-state" style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 16px",
      borderBottom: last ? "none" : "1px solid var(--m-outline-var)",
      cursor: "pointer", color: "var(--m-on-surface-var)",
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 9,
        background: "var(--m-surface-2)",
        display: "grid", placeItems: "center",
        fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 12, color: "var(--m-on-surface-var)",
      }}>{tag}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--m-on-surface)", letterSpacing: "-0.01em" }}>{name}</div>
        <div style={{ fontSize: 11.5, color: "var(--m-on-surface-mid)", marginTop: 1 }}>{sub}</div>
      </div>
      <span className="mono" style={{
        fontSize: 10.5, color: "var(--m-on-surface-var)",
        padding: "3px 9px", background: "var(--m-surface-2)", borderRadius: 999,
        fontWeight: 600,
      }}>{count}</span>
    </div>
  );
}

/* ──────────────────────────────────────────────
   DOCS — recent, folders, templates
   ────────────────────────────────────────────── */
function V6DocsRoot({ openTab }) {
  const recents = [
    { id: "doc-loi-isvc", title: "Industrial Svc · LOI v3", deal: "Industrial Svc · TX", updated: "3 days ago", status: "draft" },
    { id: "doc-nda-acme", title: "Acme NDA · executed",     deal: "Acme acquisition",    updated: "Mar 18",     status: "final" },
    { id: "doc-memo-q1",  title: "Q1 thesis memo",          deal: "Strategic",           updated: "Feb 28",     status: "final" },
    { id: "doc-loi-pest", title: "Pest Control · LOI v1",   deal: "Pest Control · FL",   updated: "Mar 22",     status: "draft" },
    { id: "doc-qoe-isvc", title: "Industrial Svc · QoE",    deal: "Industrial Svc · TX", updated: "Mar 24",     status: "live" },
    { id: "doc-ioi-elec", title: "Electrical · IOI",        deal: "Electrical · TX",     updated: "Mar 20",     status: "sent" },
  ];
  const templates = [
    { id: "t-nda",  name: "NDA",          sub: "Mutual · light",       icon: "🔒" },
    { id: "t-loi",  name: "LOI",          sub: "Letter of intent",     icon: "📝" },
    { id: "t-ioi",  name: "IOI",          sub: "Indication of interest", icon: "✉" },
    { id: "t-memo", name: "Investment memo", sub: "Internal thesis",   icon: "📄" },
    { id: "t-qoe",  name: "QoE Lite",     sub: "Quality of earnings",  icon: "🔍" },
    { id: "t-apa",  name: "APA",          sub: "Asset purchase",       icon: "📋" },
  ];
  const folders = [
    { id: "f-isvc", name: "Industrial Svc · TX", count: 8 },
    { id: "f-pest", name: "Pest Control · FL", count: 4 },
    { id: "f-elec", name: "Electrical · TX", count: 5 },
    { id: "f-archive", name: "Closed deals · 2025", count: 47 },
  ];
  return (
    <div className="fade-up">
      <V6Section
        eyebrow="DOCS"
        title="Documents"
        sub="Drafts, final versions, and signed paper."
        action={<button className="m-btn filled"><V6Icon name="plus" size={12}/><span style={{ marginLeft: 6 }}>New doc</span></button>}>
        <div/>
      </V6Section>

      <V6Section eyebrow="QUICK" title="Start from a template">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
          {templates.map(t => (
            <div key={t.id} className="m-card filled-tonal m-state tap"
              onClick={() => openTab({ kind: "doc", title: `New ${t.name}`, template: t.id })}
              style={{ padding: "16px 14px", cursor: "pointer", textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{t.icon}</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--m-on-surface)", letterSpacing: "-0.01em" }}>{t.name}</div>
              <div style={{ fontSize: 10.5, color: "var(--m-on-surface-mid)", marginTop: 1 }}>{t.sub}</div>
            </div>
          ))}
        </div>
      </V6Section>

      <V6Section eyebrow="RECENT" title="Recently edited" sub="Open any to keep working — Yulia stays in context.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {recents.map(d => (
            <div key={d.id} className="m-card m-state tap"
              onClick={() => openTab({ kind: "doc", title: d.title, id: d.id })}
              style={{ padding: "16px 18px", cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <V6Icon name="doc" size={16}/>
                <V6DocStatus status={d.status}/>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em", color: "var(--m-on-surface)", marginTop: 14 }}>{d.title}</div>
              <div style={{ fontSize: 11.5, color: "var(--m-on-surface-mid)", marginTop: 2 }}>{d.deal}</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--m-on-surface-mid)", letterSpacing: "0.1em", marginTop: 10 }}>{d.updated.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </V6Section>

      <V6Section eyebrow="FOLDERS" title="By deal">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
          {folders.map(f => (
            <div key={f.id} className="m-card m-state tap" style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--m-tertiary-container)", color: "var(--m-on-tertiary-container)", display: "grid", placeItems: "center" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 4.5c0-0.83 0.67-1.5 1.5-1.5h2.5L7 4.5h3.5c0.83 0 1.5 0.67 1.5 1.5v4.5c0 0.83-0.67 1.5-1.5 1.5H3.5C2.67 12 2 11.33 2 10.5V4.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--m-on-surface)", letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--m-on-surface-mid)" }}>{f.count} files</div>
              </div>
            </div>
          ))}
        </div>
      </V6Section>
    </div>
  );
}

function V6DocStatus({ status }) {
  const map = {
    draft: { label: "DRAFT", bg: "var(--m-watch-container)", fg: "#3F2E00" },
    final: { label: "FINAL", bg: "var(--m-pursue-container)", fg: "var(--m-pursue-on-cont)" },
    live:  { label: "LIVE",  bg: "var(--m-primary-container)", fg: "var(--m-on-primary-container)" },
    sent:  { label: "SENT",  bg: "var(--m-secondary-container)", fg: "var(--m-on-secondary-container)" },
  }[status] || { label: status.toUpperCase(), bg: "var(--m-surface-2)", fg: "var(--m-on-surface-var)" };
  return (
    <span className="mono" style={{
      fontSize: 9, fontWeight: 700, letterSpacing: "0.14em",
      color: map.fg, background: map.bg,
      padding: "3px 7px", borderRadius: 4,
    }}>{map.label}</span>
  );
}

/* ──────────────────────────────────────────────
   ANALYSIS — recent + run new
   ────────────────────────────────────────────── */
function V6AnalysisRoot({ openTab }) {
  const recents = [
    { id: "an-recast", title: "Industrial Svc · Recast",   deal: "Industrial Svc · TX", updated: "Mar 25", status: "live"   },
    { id: "an-comps",  title: "Pest Control · Comps",      deal: "Pest Control · FL",   updated: "Mar 20", status: "saved"  },
    { id: "an-val",    title: "Electrical · Valuation",    deal: "Electrical · TX",     updated: "Mar 18", status: "saved"  },
    { id: "an-buyer",  title: "Industrial Svc · Buyer fit",deal: "Industrial Svc · TX", updated: "Mar 24", status: "live"   },
  ];
  const tools = [
    { id: "tool-recast",  name: "Recast P&L",      sub: "Find honest add-backs",      icon: "📊", color: "tertiary" },
    { id: "tool-comps",   name: "Comps",           sub: "Public + private benchmarks",icon: "⚖",  color: "primary"  },
    { id: "tool-val",     name: "Valuation model", sub: "DCF, multiples, structure",  icon: "💰", color: "pursue"   },
    { id: "tool-qoe",     name: "QoE Lite",        sub: "Quality of earnings sweep",  icon: "🔍", color: "primary"  },
    { id: "tool-buyer",   name: "Buyer fit",       sub: "Score against your thesis",  icon: "🎯", color: "secondary"},
    { id: "tool-sba",     name: "SBA structure",   sub: "Model leverage scenarios",   icon: "🏦", color: "watch"    },
  ];
  return (
    <div className="fade-up">
      <V6Section
        eyebrow="ANALYSIS"
        title="Run an analysis"
        sub="Yulia handles the math. You read the result."
        action={<button className="m-btn filled"><V6Icon name="plus" size={12}/><span style={{ marginLeft: 6 }}>New analysis</span></button>}>
        <div/>
      </V6Section>

      <V6Section eyebrow="TOOLS" title="What can I run">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {tools.map(t => (
            <div key={t.id} className="m-card m-state tap"
              onClick={() => openTab({ kind: "analysis", title: `New ${t.name}`, tool: t.id })}
              style={{ padding: "18px 20px", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `var(--m-${t.color}-container)`, color: `var(--m-on-${t.color}-container, var(--m-${t.color}-on-cont))`, display: "grid", placeItems: "center", fontSize: 18 }}>
                  {t.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em", color: "var(--m-on-surface)" }}>{t.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--m-on-surface-mid)", marginTop: 1 }}>{t.sub}</div>
                </div>
                <V6Icon name="back" size={11}/>
              </div>
            </div>
          ))}
        </div>
      </V6Section>

      <V6Section eyebrow="RECENT" title="Recently run" sub="Open any to keep iterating.">
        <div className="m-card" style={{ overflow: "hidden", padding: 0 }}>
          {recents.map((r, i, arr) => (
            <div key={r.id} className="m-state" onClick={() => openTab({ kind: "analysis", title: r.title, id: r.id })}
              style={{
                display: "grid", gridTemplateColumns: "32px 2fr 2fr 80px 80px",
                alignItems: "center", gap: 16,
                padding: "14px 18px",
                borderBottom: i === arr.length - 1 ? "none" : "1px solid var(--m-outline-var)",
                cursor: "pointer",
              }}>
              <V6Icon name="chart" size={14}/>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--m-on-surface)", letterSpacing: "-0.01em" }}>{r.title}</div>
              <div style={{ fontSize: 12, color: "var(--m-on-surface-mid)" }}>{r.deal}</div>
              <V6DocStatus status={r.status}/>
              <div className="mono" style={{ fontSize: 10.5, color: "var(--m-on-surface-mid)", letterSpacing: "0.1em", textAlign: "right" }}>{r.updated.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </V6Section>
    </div>
  );
}

/* ──────────────────────────────────────────────
   MARKET INTELLIGENCE — feed
   ────────────────────────────────────────────── */
function V6IntelRoot({ openTab }) {
  const feed = [
    { id: "f1", sector: "Industrial services", title: "Three platforms quietly raised in TX/OK", sub: "Yulia · synthesized from 6 sources · 18 min read", time: "2h ago", featured: true },
    { id: "f2", sector: "Pest control",        title: "Margin compression continues — but recurring still trades premium", sub: "Yulia · 4 min read", time: "Today" },
    { id: "f3", sector: "HVAC",                title: "Two strategics on the prowl in CO and the PNW", sub: "Yulia · 6 min read", time: "Yesterday" },
    { id: "f4", sector: "Distribution",        title: "OH + IN: family-owned distributors with succession headwinds", sub: "Yulia · 11 min read", time: "2d ago" },
    { id: "f5", sector: "Electrical",          title: "Customer concentration is the sector's quiet ceiling", sub: "Yulia · 5 min read", time: "3d ago" },
  ];
  const sectors = [
    { id: "sec-ind", name: "Industrial services", count: 24, trend: "+12%" },
    { id: "sec-pest", name: "Pest control", count: 8, trend: "-3%" },
    { id: "sec-hvac", name: "HVAC", count: 17, trend: "+8%" },
    { id: "sec-elec", name: "Electrical", count: 11, trend: "+6%" },
    { id: "sec-dist", name: "Distribution", count: 22, trend: "+1%" },
  ];
  return (
    <div className="fade-up">
      <V6Section
        eyebrow="MARKET INTELLIGENCE"
        title="What's moving"
        sub="Sector reads, deal flow, comps — all synthesized from the sources you watch."
        action={<button className="m-btn outlined" style={{ height: 32 }}>+ Watch a sector</button>}>
        <div/>
      </V6Section>

      {/* Featured feed item */}
      {feed.filter(f => f.featured).map(f => (
        <section key={f.id} style={{ marginBottom: 28 }}>
          <div className="m-card elevated tap" onClick={() => openTab({ kind: "feed-item", title: f.title, id: f.id })}
            style={{
              padding: "32px 36px",
              background: "linear-gradient(135deg, #DCE7F3 0%, #B8CCE3 100%)",
              border: "none",
              cursor: "pointer",
            }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--m-on-primary-container)", letterSpacing: "0.14em", fontWeight: 600, marginBottom: 14 }}>
              FEATURED · {f.sector.toUpperCase()} · {f.time.toUpperCase()}
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, letterSpacing: "-0.025em", lineHeight: 1.15, margin: 0, color: "var(--m-on-primary-container)" }}>
              {f.title}
            </h2>
            <div style={{ fontSize: 13.5, color: "var(--m-on-primary-container)", opacity: 0.78, marginTop: 10 }}>{f.sub}</div>
          </div>
        </section>
      ))}

      {/* Sectors strip */}
      <V6Section eyebrow="SECTORS YOU WATCH" title="Activity this week">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
          {sectors.map(s => (
            <div key={s.id} className="m-card filled-tonal m-state tap" style={{ padding: "14px 16px", cursor: "pointer" }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--m-on-surface)", letterSpacing: "-0.01em" }}>{s.name}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 8 }}>
                <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: "var(--m-on-surface)", letterSpacing: "-0.02em" }}>{s.count}</span>
                <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: s.trend.startsWith("+") ? "var(--m-pursue)" : "var(--m-pass)" }}>{s.trend}</span>
              </div>
              <div className="mono" style={{ fontSize: 9.5, color: "var(--m-on-surface-mid)", letterSpacing: "0.1em", marginTop: 2 }}>NEW SIGNALS</div>
            </div>
          ))}
        </div>
      </V6Section>

      {/* Feed list */}
      <V6Section eyebrow="FEED" title="More from Yulia">
        <div className="m-card" style={{ overflow: "hidden", padding: 0 }}>
          {feed.filter(f => !f.featured).map((f, i, arr) => (
            <div key={f.id} className="m-state" onClick={() => openTab({ kind: "feed-item", title: f.title, id: f.id })}
              style={{
                padding: "16px 22px",
                borderBottom: i === arr.length - 1 ? "none" : "1px solid var(--m-outline-var)",
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: 18,
              }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="mono" style={{ fontSize: 9.5, color: "var(--m-on-surface-mid)", letterSpacing: "0.14em", fontWeight: 600, marginBottom: 6 }}>{f.sector.toUpperCase()} · {f.time.toUpperCase()}</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, letterSpacing: "-0.02em", color: "var(--m-on-surface)" }}>{f.title}</div>
                <div style={{ fontSize: 12, color: "var(--m-on-surface-mid)", marginTop: 3 }}>{f.sub}</div>
              </div>
              <V6Icon name="back" size={12}/>
            </div>
          ))}
        </div>
      </V6Section>
    </div>
  );
}

/* ──────────────────────────────────────────────
   LIBRARY — saved + recent
   ────────────────────────────────────────────── */
function V6LibraryRoot({ openTab }) {
  const tags = ["All · 143", "Starred · 12", "Deals · 87", "Docs · 24", "Analyses · 11", "Memos · 9"];
  const [active, setActive] = m6mS(0);
  const items = [
    { kind: "deal",     title: "Industrial Svc · TX",      sub: "Pursue · 92 fit",          updated: "Today",    starred: true },
    { kind: "doc",      title: "Industrial Svc · LOI v3",  sub: "Draft",                    updated: "3d ago",   starred: true },
    { kind: "analysis", title: "Industrial Svc · Recast",  sub: "Live",                     updated: "Yesterday",starred: false },
    { kind: "doc",      title: "Q1 thesis memo",           sub: "Final",                    updated: "Feb 28",   starred: true },
    { kind: "deal",     title: "Pest Control · FL",        sub: "Pursue · 84 fit",          updated: "2d ago",   starred: false },
    { kind: "analysis", title: "Pest Control · Comps",     sub: "Saved",                    updated: "Mar 20",   starred: false },
    { kind: "deal",     title: "Auto repair · 4-loc",      sub: "Closed at $3.2M",          updated: "MAR 12",   starred: true },
    { kind: "doc",      title: "Acme NDA · executed",      sub: "Final",                    updated: "Mar 18",   starred: false },
  ];
  return (
    <div className="fade-up">
      <V6Section
        eyebrow="LIBRARY"
        title="Everything you've touched"
        sub="One place for deals, docs, analyses, and memos.">
        <div/>
      </V6Section>

      {/* Tag filter strip */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {tags.map((t, i) => (
          <button key={t} onClick={() => setActive(i)} className="m-state"
            style={{
              all: "unset",
              padding: "7px 14px",
              borderRadius: 999,
              fontSize: 12, fontWeight: 500,
              background: active === i ? "var(--m-primary-container)" : "var(--m-surface-2)",
              color: active === i ? "var(--m-on-primary-container)" : "var(--m-on-surface-var)",
              cursor: "pointer",
            }}>{t}</button>
        ))}
      </div>

      <div className="m-card" style={{ overflow: "hidden", padding: 0 }}>
        {items.map((it, i, arr) => (
          <div key={i} className="m-state"
            onClick={() => openTab({ kind: it.kind, title: it.title })}
            style={{
              display: "grid",
              gridTemplateColumns: "32px 2fr 1.4fr 100px 24px",
              alignItems: "center", gap: 16,
              padding: "12px 18px",
              borderBottom: i === arr.length - 1 ? "none" : "1px solid var(--m-outline-var)",
              cursor: "pointer",
            }}>
            <V6Icon name={it.kind === "deal" ? "deal" : it.kind === "doc" ? "doc" : "chart"} size={14}/>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--m-on-surface)", letterSpacing: "-0.01em" }}>{it.title}</div>
            <div style={{ fontSize: 12, color: "var(--m-on-surface-mid)" }}>{it.sub}</div>
            <div className="mono" style={{ fontSize: 10.5, color: "var(--m-on-surface-mid)", letterSpacing: "0.1em" }}>{it.updated.toUpperCase()}</div>
            <span style={{ color: it.starred ? "var(--m-watch)" : "var(--m-outline)", fontSize: 14 }}>{it.starred ? "★" : "☆"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, {
  V6SearchRoot, V6DocsRoot, V6AnalysisRoot, V6IntelRoot, V6LibraryRoot,
  V6DealCard, V6Stat, V6WatchRow, V6DocStatus,
});
