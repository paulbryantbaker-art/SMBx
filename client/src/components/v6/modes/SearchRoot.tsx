import { type CSSProperties } from "react";
import { V6Section } from "../Canvas";
import { V6DealCard, V6WatchRow, type Verdict } from "./cards";
import type { OpenTab } from "../types";
import type { User } from "../../../hooks/useAuth";
import { useHomeDeals, type HomeDeal } from "../../../hooks/useHomeDeals";
import { V6PortfolioOverviewCard } from "../PortfolioOverviewCard";

const HERO_DATE = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

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

interface SearchRootProps {
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
  user: User | null;
}

export function V6SearchRoot({ openTab, onTalkToYulia, user }: SearchRootProps) {
  const home = useHomeDeals(user);

  // UX-01 fix: an authed user with zero deals previously saw the marketing
  // sample arrays — fake "Big Fake Deal · sample" rows that read like the
  // platform pre-populated their account. Now they get a real chat-first
  // empty state with starter chips that pre-fill the composer with a journey
  // intent. Anon visitors keep the sample-data fallback (it's marketing).
  if (home.isAuthed && !home.loading && !home.hasData) {
    return <V6EmptyHome onTalkToYulia={onTalkToYulia} />;
  }

  // When the user is authenticated AND we have real deals, render their data.
  // Otherwise fall back to the polished sample arrays for anon visitors and
  // the brief loading window so the page never flashes empty.
  const useReal = home.isAuthed && home.hasData;
  const picks: Pick[]          = useReal ? home.picks.map(dealToPick)         : PICKS;
  const inReview: InReviewDeal[] = useReal && home.inReview.length > 0 ? home.inReview.map(dealToInReview) : IN_REVIEW;
  const closed: ClosedDeal[]   = useReal && home.closed.length > 0 ? home.closed.map(dealToClosed)     : CLOSED;

  const openTopPick = () => {
    const top = picks[0];
    if (top) openTab({ kind: "deal", title: top.name, id: top.id });
  };

  const askYulia = (prompt: string) => {
    if (onTalkToYulia) onTalkToYulia(prompt);
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
            <span style={{ fontSize: 11, color: "#fff" }}>{HERO_DATE}</span>
          </div>

          <div style={H.headBlock}>
            <h1 style={H.h1}>Agentic AI specifically built for buying and selling businesses of all shapes and sizes.</h1>
            <p style={H.tag}>Yulia does all of the hard work &mdash; so your deal team can focus on building relationships and making deals better and faster.</p>
          </div>

          <div style={H.picksHead}>
            <span className="mono" style={H.picksEyebrow}>YULIA&rsquo;S PICKS · TODAY · {picks.length} DEALS · 14 MIN READ</span>
            <span style={{ fontSize: 11, color: "#fff" }}>↓ tap any to open</span>
          </div>

          <div style={H.picksList}>
            {picks.map((p, i) => (
              <div
                key={p.rank}
                onClick={(e) => { e.stopPropagation(); openTab({ kind: "deal", title: p.name, id: p.id }); }}
                style={{
                  ...H.pickRow,
                  borderBottom: i === picks.length - 1 ? "none" : "1px solid rgba(255,255,255,0.1)",
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

      {/* B2.8: Portfolio rollup card. Shows aggregations (weighted EV,
          deals by gate, expected close window) — NOT individual deals.
          Hides for anon and for authed users with zero deals. Lives
          between the Yulia brief hero and the per-deal lists below. */}
      <V6PortfolioOverviewCard user={user} />

      {/* In Review */}
      <V6Section
        eyebrow={`PIPELINE · ${inReview.length} IN REVIEW`}
        title="In review"
        sub="Live deals you and Yulia are working"
        action={
          <button
            className="m-btn text"
            style={{ height: 28, fontSize: 12 }}
            onClick={() => askYulia("Show me every deal currently in review across my pipeline.")}
            type="button"
          >
            See all &rarr;
          </button>
        }
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {inReview.map(d => (
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
                <V6WatchRow
                  key={w.tag}
                  {...w}
                  last={i === col.length - 1}
                  onClick={() => askYulia(`Walk me through the latest from ${w.name} — what's worth a closer look?`)}
                />
              ))}
            </div>
          ))}
        </div>
      </V6Section>

      {/* Recently closed */}
      <V6Section eyebrow="RECENT" title="Recently closed" sub="Reference deals — ask Yulia about any of them.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {closed.map(d => (
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
    fontSize: 10, color: "#fff",
    letterSpacing: "0.14em", fontWeight: 600,
  },
  headBlock: { position: "relative", padding: "20px 28px 0" },
  h1: {
    fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 38,
    letterSpacing: "-0.03em", lineHeight: 1.05, margin: 0, color: "#fff",
    maxWidth: 760, textWrap: "balance",
  },
  tag: {
    fontSize: 14.5, lineHeight: 1.55, color: "#fff",
    margin: "12px 0 0", maxWidth: 620, textWrap: "pretty",
  },
  picksHead: {
    position: "relative", padding: "16px 28px 0",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  picksEyebrow: {
    fontSize: 10, color: "#fff",
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
    color: "#fff", textAlign: "center",
  },
  pickName: {
    fontSize: 13.5, fontWeight: 600, color: "#fff", letterSpacing: "-0.01em",
  },
  pickNote: { fontSize: 12.5, color: "#fff" },
  pickFit: {
    fontFamily: "var(--font-mono)", fontSize: 17, fontWeight: 700,
    color: "#fff", textAlign: "right", fontVariantNumeric: "tabular-nums",
    display: "flex", flexDirection: "column", alignItems: "flex-end",
  },
  pickFitLabel: {
    fontSize: 8, color: "#fff",
    letterSpacing: "0.12em", fontWeight: 600, marginTop: -2,
  },
};

/* ─── Real-deal → display adapters ───────────────────────────────────
   Convert HomeDeal records (revenue/sde/ebitda in cents) into the shape
   the existing SearchRoot UI consumes. The synthetic fit score is a
   quintile of EBITDA across the user's pipeline so the home page has
   a visible signal until a real fit_score column lands on the deal row.
*/

function fmtCents(cents: number | null | undefined): string {
  if (!cents) return "—";
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (dollars >= 1_000) return `$${Math.round(dollars / 1_000)}K`;
  return `$${Math.round(dollars).toLocaleString()}`;
}

function fmtMonth(d: string): string {
  try {
    const date = new Date(d);
    return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" }).toUpperCase();
  } catch { return ""; }
}

function fitFromEbitda(ebitda: number | null | undefined): number {
  // Crude proxy until a real fit score column exists. Maps EBITDA in cents
  // onto a 60-92 range so the picks list isn't all 0.
  if (!ebitda) return 60;
  const m = ebitda / 100_000_000; // millions
  if (m >= 5) return 92;
  if (m >= 3) return 86;
  if (m >= 2) return 80;
  if (m >= 1) return 74;
  return 65;
}

function verdictFromGate(gate: string): Verdict {
  // Late-stage gates → pursue; early/exploratory → watch; stalled handled separately.
  if (/[345]$/.test(gate)) return "pursue";
  if (/[12]$/.test(gate)) return "watch";
  return "watch";
}

function dealToPick(d: HomeDeal, i: number): Pick {
  const sde = fmtCents(d.sde);
  const note = (d.financials?.notes || `${sde} SDE · ${d.industry || "—"}`).slice(0, 80);
  return {
    rank: i + 1,
    name: d.business_name || d.industry || `Deal #${d.id}`,
    note,
    fit: fitFromEbitda(d.ebitda),
    id: String(d.id),
  };
}

function dealToInReview(d: HomeDeal): InReviewDeal {
  const rev = fmtCents(d.revenue);
  const loc = d.location || d.industry || "—";
  const mult = d.financials?.multiple ? `${d.financials.multiple.toFixed(1)}×` : "—";
  return {
    verdict: verdictFromGate(d.current_gate),
    id: String(d.id),
    name: d.business_name || `Deal #${d.id}`,
    sub: `${rev} rev · ${loc}`,
    fit: fitFromEbitda(d.ebitda),
    sde: fmtCents(d.sde),
    multiple: mult,
    note: d.financials?.notes || `${d.industry || "Business"} at ${d.current_gate}`,
  };
}

function dealToClosed(d: HomeDeal): ClosedDeal {
  const price = fmtCents(d.asking_price);
  const mult = d.financials?.multiple ? ` · ${d.financials.multiple.toFixed(1)}×` : "";
  return {
    name: d.business_name || `Deal #${d.id}`,
    sub: `Closed at ${price}${mult}`,
    date: fmtMonth(d.updated_at),
  };
}

/* ─── Empty home — authed user with zero deals ─────────────────────
 * Chat-first onboarding. Four chips that pre-fill the chat composer
 * with a journey-starter prompt. Tapping a chip "talks to Yulia" — no
 * Buy/Sell/Raise/Integrate page-jumping, just the conversation that
 * actually advances the deal.
 *
 * Phase 1 baseline. Phase 1.10 (Today authed action queue) replaces the
 * static chips with a dynamic "what needs your attention" surface once
 * the user has deals in flight.
 */

interface EmptyHomeProps {
  onTalkToYulia?: (prompt: string) => void;
}

const EMPTY_CHIPS: { label: string; prompt: string; eyebrow: string }[] = [
  { label: "Buy",       prompt: "I want to buy a business. Help me sketch the thesis.",                          eyebrow: "Acquire" },
  { label: "Sell",      prompt: "I'm thinking about selling my business. Help me figure out where to start.",    eyebrow: "Exit" },
  { label: "Raise",     prompt: "I'm raising capital. Help me build the materials.",                             eyebrow: "Capital" },
  { label: "Integrate", prompt: "I just closed a deal and need to plan post-merger integration.",                eyebrow: "PMI" },
];

function V6EmptyHome({ onTalkToYulia }: EmptyHomeProps) {
  return (
    <div className="m-fade-up" style={E.wrap}>
      <div style={E.cardWrap}>
        <div className="mono" style={E.eyebrow}>WELCOME</div>
        <h1 style={E.headline}>Tell Yulia what you want to do.</h1>
        <p style={E.body}>
          She'll handle the deal — sourcing, modeling, due diligence, paperwork.
          Pick a starting point or just type in chat.
        </p>
        <div style={E.chips}>
          {EMPTY_CHIPS.map(c => (
            <button
              key={c.label}
              type="button"
              className="m-state"
              style={E.chip}
              onClick={() => onTalkToYulia?.(c.prompt)}
              onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
              onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ""; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ""; }}
            >
              <span className="mono" style={E.chipEyebrow}>{c.eyebrow}</span>
              <span style={E.chipLabel}>{c.label}</span>
            </button>
          ))}
        </div>
        <div style={E.subline}>
          Or upload financials in chat to get started faster.
        </div>
      </div>
    </div>
  );
}

const E: Record<string, CSSProperties> = {
  wrap: {
    minHeight: "60vh",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "40px 20px",
  },
  cardWrap: {
    maxWidth: 560, width: "100%",
    background: "var(--m-surface-on-light)",
    border: "1px solid var(--m-outline-var)",
    borderRadius: 16,
    padding: "32px 36px 28px",
    boxShadow: "var(--m-elev-1)",
  },
  eyebrow: {
    fontSize: 9.5, letterSpacing: "0.14em", fontWeight: 600,
    color: "var(--m-primary)",
  },
  headline: {
    fontFamily: "var(--font-display)",
    fontSize: 28, fontWeight: 700,
    letterSpacing: "-0.025em",
    margin: "8px 0 10px",
    color: "var(--m-on-surface)",
  },
  body: {
    fontSize: 14, lineHeight: 1.55,
    color: "var(--m-on-surface-mid)",
    margin: "0 0 22px",
    maxWidth: "55ch",
  },
  chips: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
    gap: 10,
  },
  chip: {
    all: "unset",
    display: "flex", flexDirection: "column", gap: 4,
    padding: "12px 14px",
    background: "var(--m-primary-container)",
    color: "var(--m-on-primary-container)",
    borderRadius: 10,
    cursor: "pointer",
    transition: "transform 160ms cubic-bezier(0.23, 1, 0.32, 1), background 160ms ease",
  },
  chipEyebrow: {
    fontSize: 9, letterSpacing: "0.14em", fontWeight: 600,
    opacity: 0.65,
  },
  chipLabel: {
    fontFamily: "var(--font-display)",
    fontSize: 16, fontWeight: 600, letterSpacing: "-0.015em",
  },
  subline: {
    marginTop: 18,
    paddingTop: 14,
    borderTop: "1px solid var(--m-outline-var)",
    fontSize: 12.5,
    color: "var(--m-on-surface-mid)",
  },
};
