import { type CSSProperties } from "react";
import { V6Section } from "../Canvas";
import { V6DealCard, V6WatchRow, type Verdict } from "./cards";
import type { OpenTab } from "../types";

const HERO_DATE = "Friday, March 27";

interface Pick {
  rank: number;
  name: string;
  note: string;
  fit: number;
  id: string;
}

const PICKS: Pick[] = [
  { rank: 1, name: "Big Fake Deal · sample",   note: "$1.80M SDE · honest capex story",       fit: 92, id: "deal-bigfake" },
  { rank: 2, name: "Pest Control · FL",        note: "92% on monthly contracts",              fit: 84, id: "deal-pest"    },
  { rank: 3, name: "Electrical · TX",          note: "Margins good · concentration risk",     fit: 78, id: "deal-electrical" },
  { rank: 4, name: "HVAC platform · CO",       note: "Family business · clean financials",    fit: 74, id: "deal-hvac"    },
  { rank: 5, name: "Distribution · OH",        note: "Asking high · margins thin",            fit: 61, id: "deal-dist"    },
];

interface InReviewDeal {
  verdict: Verdict;
  id: string;
  name: string;
  sub: string;
  fit: number;
  sde: string;
  multiple: string;
  note: string;
}

const IN_REVIEW: InReviewDeal[] = [
  { verdict: "pursue", id: "deal-bigfake",    name: "Big Fake Deal · sample",     sub: "$5.4M rev · East Texas",  fit: 92, sde: "$1.80M", multiple: "7.0×", note: "Recurring revenue. Honest add-backs. The concentration reads as moat." },
  { verdict: "pursue", id: "deal-pest",       name: "Pest Control · FL",          sub: "$4.1M rev · Orlando",     fit: 84, sde: "$1.40M", multiple: "6.5×", note: "92% on monthly contracts. Add-back rich but legitimate." },
  { verdict: "watch",  id: "deal-electrical", name: "Electrical Contractor · TX", sub: "$8.7M rev · Austin",      fit: 78, sde: "$2.10M", multiple: "6.0×", note: "Margins are good, but 60% of revenue is one customer." },
  { verdict: "watch",  id: "deal-hvac",       name: "HVAC platform · CO",         sub: "$3.6M rev · Denver",      fit: 74, sde: "$0.95M", multiple: "6.8×", note: "Family business. Clean financials. Owner wants to retire — succession plan unclear." },
  { verdict: "pass",   id: "deal-dist",       name: "Distribution · OH",          sub: "$11.2M rev · Cleveland",  fit: 61, sde: "$1.55M", multiple: "8.5×", note: "Asking is rich, margins are thin, and inventory turns are slowing." },
  { verdict: "pass",   id: "deal-marina",     name: "Marina Holdings · FL",       sub: "$8.2M rev · Tampa Bay",   fit: 42, sde: "$1.20M", multiple: "9.0×", note: "Asking is 50% above SBA-clear and the add-backs don't survive scrutiny." },
];

interface WatchSource { tag: string; name: string; sub: string; count: number }

const WATCHING_LEFT: WatchSource[] = [
  { tag: "B", name: "BizBuySell · MN distribution",    sub: "Updated 2h ago",       count: 142 },
  { tag: "L", name: "LoopNet · Marina sales",          sub: "Updated yesterday",    count: 28  },
  { tag: "A", name: "Axial · Industrial services",     sub: "Updated 3d ago",       count: 64  },
  { tag: "I", name: "IBBA · Brokered listings",        sub: "Updated this week",    count: 311 },
];

const WATCHING_RIGHT: WatchSource[] = [
  { tag: "D", name: "DealStream · MEP services",       sub: "Updated 4h ago",       count: 87 },
  { tag: "S", name: "Sunbelt Network · TX/FL",         sub: "Updated 2d ago",       count: 53 },
  { tag: "M", name: "Murphy Business · Auto repair",   sub: "Updated this week",    count: 96 },
  { tag: "T", name: "Transworld · HVAC roll-ups",      sub: "Updated this week",    count: 41 },
];

interface ClosedDeal { name: string; sub: string; date: string }

const CLOSED: ClosedDeal[] = [
  { name: "Auto repair · 4-loc",  sub: "Closed at $3.2M · 6.4×", date: "MAR 12" },
  { name: "MEP services · NM",    sub: "Closed at $9.1M · 7.8×", date: "FEB 28" },
  { name: "HVAC · CO",            sub: "Closed at $4.8M · 6.9×", date: "FEB 14" },
  { name: "Pest control · GA",    sub: "Closed at $5.3M · 7.2×", date: "FEB 02" },
];

export function V6SearchRoot({ openTab }: { openTab: OpenTab }) {
  const openTopPick = () => {
    const top = PICKS[0];
    openTab({ kind: "deal", title: top.name, id: top.id });
  };

  return (
    <div className="m-fade-up">
      {/* Hero — Today's Brief */}
      <section style={{ marginBottom: 36 }}>
        <div
          className="m-card elevated tap"
          onClick={openTopPick}
          role="button"
          tabIndex={0}
          aria-label="Today's brief — open top pick"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openTopPick(); } }}
          style={{
            position: "relative", overflow: "hidden",
            background: "linear-gradient(135deg, #2E5C8A 0%, #1A3D63 100%)",
            color: "#fff", padding: 0,
            border: "none",
          }}
        >
          <div style={H.glow} aria-hidden="true" />

          <div style={H.headerRow}>
            <span className="mono" style={H.eyebrow}>WELCOME TO SMBX · WORKING SAMPLE</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{HERO_DATE}</span>
          </div>

          <div style={H.headBlock}>
            <h1 style={H.h1}>Agentic AI specifically built for buying and selling businesses of all shapes and sizes.</h1>
            <p style={H.tag}>Yulia does all of the hard work &mdash; so your deal team can focus on building relationships and making deals better and faster.</p>
          </div>

          <div style={H.picksHead}>
            <span className="mono" style={H.picksEyebrow}>YULIA&rsquo;S PICKS · TODAY · {PICKS.length} DEALS · 14 MIN READ</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>↓ tap any to open</span>
          </div>

          <div style={H.picksList}>
            {PICKS.map((p, i) => (
              <div
                key={p.rank}
                onClick={(e) => { e.stopPropagation(); openTab({ kind: "deal", title: p.name, id: p.id }); }}
                style={{
                  ...H.pickRow,
                  borderBottom: i === PICKS.length - 1 ? "none" : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <span style={H.pickRank}>{p.rank}</span>
                <span style={H.pickName}>{p.name}</span>
                <span style={H.pickNote}>{p.note}</span>
                <span style={H.pickFit}>
                  {p.fit}
                  <span style={H.pickFitLabel}>FIT</span>
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
        action={<button className="m-btn text" style={{ height: 28, fontSize: 12 }}>See all &rarr;</button>}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {IN_REVIEW.map(d => (
            <V6DealCard
              key={d.id}
              verdict={d.verdict}
              name={d.name}
              sub={d.sub}
              fit={d.fit}
              sde={d.sde}
              multiple={d.multiple}
              note={d.note}
              onClick={() => openTab({ kind: "deal", title: d.name, id: d.id })}
            />
          ))}
        </div>
      </V6Section>

      {/* Yulia is watching */}
      <V6Section
        eyebrow="YULIA IS WATCHING · 87 SOURCES"
        title="Yulia is watching"
        sub="Sources Yulia revisits weekly. Click to add to pipeline."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 14 }}>
          {[WATCHING_LEFT, WATCHING_RIGHT].map((col, idx) => (
            <div key={idx} className="m-card" style={{ overflow: "hidden", padding: 0 }}>
              {col.map((w, i) => (
                <V6WatchRow key={w.tag} {...w} last={i === col.length - 1} />
              ))}
            </div>
          ))}
        </div>
      </V6Section>

      {/* Recently closed */}
      <V6Section eyebrow="RECENT" title="Recently closed" sub="Reference deals — ask Yulia about any of them.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {CLOSED.map(d => (
            <div
              key={d.name}
              className="m-card filled-tonal m-state tap"
              onClick={() => openTab({ kind: "deal", title: `${d.name} (closed)` })}
              role="button"
              tabIndex={0}
              aria-label={`${d.name} ${d.sub}`}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openTab({ kind: "deal", title: `${d.name} (closed)` }); } }}
              style={{ padding: "14px 16px", cursor: "pointer" }}
            >
              <div className="mono" style={{ fontSize: 9.5, color: "var(--m-on-surface-mid)", letterSpacing: "0.14em", fontWeight: 600 }}>{d.date}</div>
              <div style={{
                fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14,
                letterSpacing: "-0.01em", color: "var(--m-on-surface)", marginTop: 6,
              }}>{d.name}</div>
              <div style={{ fontSize: 12, color: "var(--m-on-surface-mid)", marginTop: 2 }}>{d.sub}</div>
            </div>
          ))}
        </div>
      </V6Section>
    </div>
  );
}

const H: Record<string, CSSProperties> = {
  glow: {
    position: "absolute", top: -120, right: -100,
    width: 380, height: 380, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  headerRow: {
    position: "relative", padding: "24px 28px 0",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  eyebrow: {
    fontSize: 10, color: "rgba(255,255,255,0.85)",
    letterSpacing: "0.14em", fontWeight: 600,
  },
  headBlock: { position: "relative", padding: "20px 28px 0" },
  h1: {
    fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 38,
    letterSpacing: "-0.03em", lineHeight: 1.05, margin: 0, color: "#fff",
    maxWidth: 760, textWrap: "balance",
  },
  tag: {
    fontSize: 14.5, lineHeight: 1.55, color: "rgba(255,255,255,0.88)",
    margin: "12px 0 0", maxWidth: 620, textWrap: "pretty",
  },
  picksHead: {
    position: "relative", padding: "16px 28px 0",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  picksEyebrow: {
    fontSize: 10, color: "rgba(255,255,255,0.7)",
    letterSpacing: "0.14em", fontWeight: 600,
  },
  picksList: {
    position: "relative", margin: "12px 18px 18px",
    background: "rgba(255,255,255,0.14)", borderRadius: 14,
  },
  pickRow: {
    display: "grid", gridTemplateColumns: "32px 1.4fr 2.4fr 60px",
    alignItems: "center", gap: 16, padding: "11px 22px",
    cursor: "pointer",
  },
  pickRank: {
    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18,
    color: "rgba(255,255,255,0.6)", textAlign: "center",
  },
  pickName: {
    fontSize: 13.5, fontWeight: 600, color: "#fff", letterSpacing: "-0.01em",
  },
  pickNote: { fontSize: 12.5, color: "rgba(255,255,255,0.75)" },
  pickFit: {
    fontFamily: "var(--font-mono)", fontSize: 17, fontWeight: 700,
    color: "#fff", textAlign: "right", fontVariantNumeric: "tabular-nums",
    display: "flex", flexDirection: "column", alignItems: "flex-end",
  },
  pickFitLabel: {
    fontSize: 8, color: "rgba(255,255,255,0.6)",
    letterSpacing: "0.12em", fontWeight: 600, marginTop: -2,
  },
};
