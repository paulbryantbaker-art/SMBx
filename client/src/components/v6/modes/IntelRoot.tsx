import { type CSSProperties } from "react";
import { V6Section } from "../Canvas";
import { V6Icon } from "../icons";
import type { OpenTab } from "../types";

interface FeedItem {
  id: string;
  sector: string;
  title: string;
  sub: string;
  time: string;
  featured?: boolean;
}

const FEED: FeedItem[] = [
  { id: "f1", sector: "Industrial services", title: "Three platforms quietly raised in TX/OK",                          sub: "Yulia · synthesized from 6 sources · 18 min read", time: "2h ago",   featured: true },
  { id: "f2", sector: "Pest control",        title: "Margin compression continues — but recurring still trades premium", sub: "Yulia · 4 min read",  time: "Today"     },
  { id: "f3", sector: "HVAC",                title: "Two strategics on the prowl in CO and the PNW",                    sub: "Yulia · 6 min read",  time: "Yesterday" },
  { id: "f4", sector: "Distribution",        title: "OH + IN: family-owned distributors with succession headwinds",     sub: "Yulia · 11 min read", time: "2d ago"    },
  { id: "f5", sector: "Electrical",          title: "Customer concentration is the sector's quiet ceiling",             sub: "Yulia · 5 min read",  time: "3d ago"    },
];

interface Sector { id: string; name: string; count: number; trend: string }

const SECTORS: Sector[] = [
  { id: "sec-ind",  name: "Industrial services", count: 24, trend: "+12%" },
  { id: "sec-pest", name: "Pest control",        count: 8,  trend: "-3%"  },
  { id: "sec-hvac", name: "HVAC",                count: 17, trend: "+8%"  },
  { id: "sec-elec", name: "Electrical",          count: 11, trend: "+6%"  },
  { id: "sec-dist", name: "Distribution",        count: 22, trend: "+1%"  },
];

export function V6IntelRoot({ openTab, onTalkToYulia }: { openTab: OpenTab; onTalkToYulia?: (prompt: string) => void }) {
  const featured = FEED.filter(f => f.featured);
  const rest = FEED.filter(f => !f.featured);
  const watchSector = (sector?: string) => {
    if (sector) {
      openTab({ id: "search-root", kind: "mode-root", modeId: "search", title: "Search" });
      onTalkToYulia?.(`Watch ${sector}. Surface buyer movement, comps, new targets, capital signals, and deal professionals weekly.`);
      return;
    }
    onTalkToYulia?.("Help me choose which sectors to watch based on my current thesis and pipeline.");
  };

  return (
    <div className="m-fade-up" style={I.page}>
      <V6Section
        eyebrow="MARKET INTELLIGENCE"
        title="What's moving"
        sub="Sector reads, deal flow, comps — all synthesized from the sources you watch."
        action={<button className="m-btn outlined" style={{ height: 32 }} onClick={() => watchSector()} type="button">+ Watch a sector</button>}
      >
        <div />
      </V6Section>

      {featured.map(f => (
        <section key={f.id} style={{ marginBottom: 28 }}>
          <div
            className="m-card elevated tap"
            onClick={() => openTab({ kind: "feed-item", title: f.title, id: f.id })}
            role="button"
            tabIndex={0}
            aria-label={`Featured: ${f.title}`}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openTab({ kind: "feed-item", title: f.title, id: f.id }); } }}
            style={{
              padding: "32px 36px",
              background: "linear-gradient(135deg, #DCE7F3 0%, #B8CCE3 100%)",
              border: "none",
              cursor: "pointer",
            }}
          >
            <div className="mono" style={I.featuredEyebrow}>
              FEATURED · {f.sector.toUpperCase()} · {f.time.toUpperCase()}
            </div>
            <h2 style={I.featuredH2}>{f.title}</h2>
            <div style={I.featuredSub}>{f.sub}</div>
          </div>
        </section>
      ))}

      <V6Section eyebrow="SECTORS YOU WATCH" title="Activity this week">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
          {SECTORS.map(s => (
            <div
              key={s.id}
              className="m-card filled-tonal m-state tap"
              role="button"
              tabIndex={0}
              aria-label={`${s.name} — ${s.count} new signals, ${s.trend} this week`}
              onClick={() => watchSector(s.name)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); watchSector(s.name); } }}
              style={{ padding: "14px 16px", cursor: "pointer" }}
            >
              <div style={I.sectorName}>{s.name}</div>
              <div style={I.sectorBody}>
                <span className="mono" style={I.sectorCount}>{s.count}</span>
                <span className="mono" style={{
                  fontSize: 11, fontWeight: 600,
                  color: s.trend.startsWith("+") ? "var(--m-pursue)" : "var(--m-pass)",
                }}>{s.trend}</span>
              </div>
              <div className="mono" style={I.sectorSub}>NEW SIGNALS</div>
            </div>
          ))}
        </div>
      </V6Section>

      <V6Section eyebrow="FEED" title="More from Yulia">
        <div className="m-card" style={{ overflow: "hidden", padding: 0 }}>
          {rest.map((f, i) => (
            <div
              key={f.id}
              className="m-state"
              onClick={() => openTab({ kind: "feed-item", title: f.title, id: f.id })}
              role="button"
              tabIndex={0}
              aria-label={f.title}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openTab({ kind: "feed-item", title: f.title, id: f.id }); } }}
              style={{
                padding: "16px 22px",
                borderBottom: i === rest.length - 1 ? "none" : "1px solid var(--m-outline-var)",
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: 18,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="mono" style={I.feedEyebrow}>{f.sector.toUpperCase()} · {f.time.toUpperCase()}</div>
                <div style={I.feedTitle}>{f.title}</div>
                <div style={I.feedSub}>{f.sub}</div>
              </div>
              <span style={{ transform: "rotate(180deg)", display: "inline-flex", color: "var(--m-on-surface-mid)" }} aria-hidden="true">
                <V6Icon name="back" size={12} />
              </span>
            </div>
          ))}
        </div>
      </V6Section>
    </div>
  );
}

const I: Record<string, CSSProperties> = {
  page: {
    width: "min(100%, 1440px)",
    maxWidth: 1440,
    margin: "0 auto",
    boxSizing: "border-box",
  },
  featuredEyebrow: {
    fontSize: 10, color: "var(--m-on-primary-container)",
    letterSpacing: "0.14em", fontWeight: 600, marginBottom: 14,
  },
  featuredH2: {
    fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28,
    letterSpacing: "-0.025em", lineHeight: 1.15, margin: 0,
    color: "var(--m-on-primary-container)", textWrap: "balance",
  },
  featuredSub: {
    fontSize: 13.5, color: "var(--m-on-primary-container)",
    opacity: 0.78, marginTop: 10,
  },
  sectorName: {
    fontSize: 12.5, fontWeight: 600, color: "var(--m-on-surface)",
    letterSpacing: "-0.01em",
  },
  sectorBody: {
    display: "flex", justifyContent: "space-between", alignItems: "baseline",
    marginTop: 8,
  },
  sectorCount: {
    fontSize: 18, fontWeight: 700, color: "var(--m-on-surface)",
    letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums",
  },
  sectorSub: {
    fontSize: 9.5, color: "var(--m-on-surface-mid)",
    letterSpacing: "0.1em", marginTop: 2,
  },
  feedEyebrow: {
    fontSize: 9.5, color: "var(--m-on-surface-mid)",
    letterSpacing: "0.14em", fontWeight: 600, marginBottom: 6,
  },
  feedTitle: {
    fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16,
    letterSpacing: "-0.02em", color: "var(--m-on-surface)", textWrap: "pretty",
  },
  feedSub: { fontSize: 12, color: "var(--m-on-surface-mid)", marginTop: 3 },
};
