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
    <div className="wk-content m-fade-up" style={{ maxWidth: 1180, margin: "0 auto" }}>
      <div className="pg-head">
        <div>
          <div className="pg-title">What's moving</div>
          <p className="pg-sub">Sector reads, deal flow, comps — all synthesized from the sources you watch.</p>
        </div>
        <div className="pg-actions">
          <button className="wkbtn" type="button" onClick={() => watchSector()}>+ Watch a sector</button>
        </div>
      </div>

      {featured.map(f => (
        <div key={f.id} className="wksec" style={{ marginTop: 24 }}>
          <div
            className="wkcard tap"
            onClick={() => openTab({ kind: "feed-item", title: f.title, id: f.id })}
            role="button"
            tabIndex={0}
            aria-label={`Featured: ${f.title}`}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openTab({ kind: "feed-item", title: f.title, id: f.id }); } }}
            style={{ padding: "28px 32px", background: "var(--surface-2)", border: "1px solid var(--line)" }}
          >
            {/* Title leads (eyebrow lock) — sector and recency carry real
                information, so they live in sentence case under the sub. */}
            <h2 style={{ margin: 0, fontWeight: 700, fontSize: "clamp(1.35rem, 2.2vw, 1.75rem)", letterSpacing: "-0.025em", lineHeight: 1.15, color: "var(--ink)" }}>
              {f.title}
            </h2>
            <div style={{ fontSize: "0.9rem", color: "var(--ink-2)", marginTop: 10 }}>{f.sub}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--ink-3)", marginTop: 8 }}>{f.sector} · {f.time}</div>
          </div>
        </div>
      ))}

      <div className="wksec">
        <div className="wksec-title">Activity this week</div>
        <p className="pg-sub" style={{ marginTop: 0, marginBottom: 14 }}>Sectors you watch.</p>
        <div className="wkgrid g4">
          {SECTORS.map(s => (
            <div
              key={s.id}
              className="wkcard tap"
              role="button"
              tabIndex={0}
              aria-label={`${s.name} — ${s.count} new signals, ${s.trend} this week`}
              onClick={() => watchSector(s.name)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); watchSector(s.name); } }}
            >
              <div className="wkcard-title" style={{ fontSize: "0.9rem" }}>{s.name}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 10 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.5rem", fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
                  {s.count}
                </span>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.78rem", fontWeight: 600,
                  // Computed delta wears the computed green (two-greens law).
                  color: s.trend.startsWith("+") ? "var(--st-good-fg)" : "var(--st-risk-fg)",
                }}>{s.trend}</span>
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--ink-3)", marginTop: 4 }}>
                new signals this week
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="wksec">
        <div className="wksec-title">More from Yulia</div>
        <table className="wktable">
          <thead>
            <tr>
              <th>Topic</th>
              <th>Summary</th>
              <th className="r">When</th>
            </tr>
          </thead>
          <tbody>
            {rest.map(f => (
              <tr
                key={f.id}
                onClick={() => openTab({ kind: "feed-item", title: f.title, id: f.id })}
                role="button"
                aria-label={f.title}
              >
                <td>
                  <div className="cellname">
                    <span className="logo"><V6Icon name="feed" size={14} /></span>
                    <div>
                      <div className="nm">{f.title}</div>
                      <div className="sub">{f.sector}</div>
                    </div>
                  </div>
                </td>
                <td><span className="muted">{f.sub}</span></td>
                <td className="r muted">{f.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="tabfoot">
          <span>{rest.length} {rest.length === 1 ? "item" : "items"} in feed</span>
        </div>
      </div>
    </div>
  );
}
