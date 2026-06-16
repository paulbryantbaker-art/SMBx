/* ============================================================================
   OverviewPage.tsx — the light portfolio dashboard, one click from home.
   Faithful port of Test 33 / source/overview.jsx. Compact and scannable: a
   deals table, a what-needs-you list, and honest KPIs. Not a wall of cards.
   Rows open the deal workspace.

   PRESENTATIONAL ONLY — all data arrives via typed props; the integration
   layer wires real data and callbacks later. Honest-empty states (e.g.
   Portfolio IRR "—" / "No live feed yet") are preserved by design.
   ============================================================================ */
import type { CSSProperties } from "react";
import { Ic, Avatar, YuliaMark, Mono, Chip, Btn, StatusPill } from "../primitives";
import type { PillTone } from "../primitives";

/* ---- Prop data shapes (derived from the design's data arrays) ---- */
export interface OverviewKpi {
  label: string;
  value: string;
  sub?: string;
  /** Render the value in muted ink (honest-empty, e.g. Portfolio IRR "—"). */
  empty?: boolean;
}

export interface OverviewDeal {
  id: string;
  name: string;
  /** Avatar initials/label, e.g. "AT". */
  avatar: string;
  /** Avatar tone key (a|b|c|d). */
  tone?: string;
  /** Secondary line, e.g. "Northwind Logistics · Cold-chain". */
  meta: string;
  journey: string;
  stage: string;
  /** Status pill tone for this row. */
  statusTone: PillTone;
  ev: string;
  openItems: string;
  status: string;
}

export interface OverviewSectorHeat {
  label: string;
  tone: PillTone;
  /** Heat label rendered in the pill, e.g. "Hot". */
  heatLabel: string;
  /** Bar fill width, 0–100. */
  pct: number;
}

export interface OverviewNeedsYou {
  /** real deal id — clicking opens that deal's workspace */
  id?: string;
  title: string;
  /** Deal/stage context line, e.g. "Atlas · Sourcing". */
  deal: string;
  time: string;
  /** Dot tone — risk or warn. */
  kind: "risk" | "warn";
}

export interface OverviewActivity {
  who: string;
  /** What the actor did, e.g. "drafted outreach for 8 targets". */
  act: string;
  ago: string;
  /** "yulia" renders the agent mark; otherwise a person avatar. */
  kind: "yulia" | "person";
}

export interface OverviewPageProps {
  kpis: OverviewKpi[];
  deals: OverviewDeal[];
  sectorHeat: OverviewSectorHeat[];
  needsYou: OverviewNeedsYou[];
  activity: OverviewActivity[];
  onOpenDeal: (id: string) => void;
  onAsk: () => void;
}

/* ---- KPI stat card ---- */
function KpiStat({ k, v, sub, empty }: { k: string; v: string; sub?: string; empty?: boolean }) {
  return (
    <div className="mck-card mck-grow" style={{ padding: "15px 17px" }}>
      <div className="mck-kv">
        <span className="mck-kv-k">{k}</span>
        <span className="mck-kv-v mck-tnum" style={empty ? { color: "var(--ink-4)" } : undefined}>{v}</span>
        {sub && <span style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{sub}</span>}
      </div>
    </div>
  );
}

export function OverviewPage({ kpis, deals, sectorHeat, needsYou, activity, onOpenDeal, onAsk }: OverviewPageProps) {
  return (
    <div className="mck-col mck-grow" style={{ minWidth: 0, height: "100%" }}>
      <div className="mck-row" style={{ gap: 12, height: 54, flex: "0 0 54px", padding: "0 26px", borderBottom: "1px solid var(--line)" }}>
        <Ic name="grid" size={17} />
        <span style={{ fontWeight: 600, fontSize: 14 }}>Overview</span>
        <div className="mck-grow" />
        <Chip icon="filter">All journeys</Chip>
        <Btn variant="ghost" size="sm" icon="agent" onClick={onAsk}>Ask Yulia</Btn>
      </div>

      <div className="mck-grow mck-scrollfade" style={{ overflow: "auto", padding: "24px 26px 40px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexDirection: "column", gap: 26 }}>
          {/* KPI strip — honest where no backend */}
          <div className="mck-row" style={{ gap: 14 }}>
            {kpis.map((kpi) => (
              <KpiStat key={kpi.label} k={kpi.label} v={kpi.value} sub={kpi.sub} empty={kpi.empty} />
            ))}
          </div>

          <div className="mck-row" style={{ gap: 24, alignItems: "flex-start" }}>
            {/* deals table */}
            <div className="mck-col mck-grow" style={{ gap: 13, minWidth: 0 }}>
              <div className="mck-row" style={{ gap: 9 }}>
                <span className="mck-eyebrow">Active deals</span>
                <span className="mck-pill mck-pill-neutral" style={{ height: 18, padding: "0 7px", fontSize: 10 }}>{deals.length}</span>
                <div className="mck-grow" />
                <Chip icon="chevUpDown">Sort · Stage</Chip>
              </div>
              <div className="mck-card" style={{ overflow: "hidden" }}>
                <table className="mck-tbl">
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: 16 }}>Deal</th>
                      <th>Journey</th>
                      <th>Stage</th>
                      <th>EV</th>
                      <th>Open items</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {deals.map((d) => (
                      <tr key={d.id} onClick={() => onOpenDeal(d.id)} style={{ cursor: "pointer" }}>
                        <td style={{ paddingLeft: 16 }}>
                          <div className="mck-row" style={{ gap: 11 }}>
                            <Avatar name={d.avatar} tone={d.tone} size={28} />
                            <span className="mck-col" style={{ gap: 1 }}>
                              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{d.name}</span>
                              <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{d.meta}</span>
                            </span>
                          </div>
                        </td>
                        <td><Mono style={{ fontSize: 11, color: "var(--ink-2)" }}>{d.journey}</Mono></td>
                        <td><span className="mck-pill mck-pill-neutral">{d.stage}</span></td>
                        <td><Mono className="mck-tnum" style={{ color: d.ev === "—" ? "var(--ink-4)" : "var(--ink)" }}>{d.ev}</Mono></td>
                        <td style={{ color: "var(--ink-2)", fontSize: 12.5 }}>{d.openItems}</td>
                        <td><StatusPill tone={d.statusTone} dot={d.statusTone !== "neutral"}>{d.status}</StatusPill></td>
                        <td style={{ width: 36 }}><Ic name="chevRight" size={15} style={{ color: "var(--ink-4)" }} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* sector heat — honest, not fake tickers */}
              <div className="mck-row" style={{ gap: 9, marginTop: 6 }}>
                <span className="mck-eyebrow">Sector heat · last 90 days</span>
              </div>
              <div className="mck-card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 11 }}>
                {sectorHeat.map((s) => (
                  <div key={s.label} className="mck-row" style={{ gap: 13 }}>
                    <span style={{ width: 160, flex: "0 0 160px", fontSize: 12.5 }}>{s.label}</span>
                    <div className="mck-grow" style={{ height: 6, borderRadius: 3, background: "var(--surface-3)", position: "relative" }}>
                      <span style={{ position: "absolute", left: 0, top: 0, height: "100%", width: s.pct + "%", borderRadius: 3, background: s.tone === "ok" ? "var(--ok)" : s.tone === "warn" ? "var(--warn)" : "var(--ink-3)" }} />
                    </div>
                    <span style={{ width: 64, flex: "0 0 64px", textAlign: "right" }}><StatusPill tone={s.tone} dot={s.tone !== "neutral"}>{s.heatLabel}</StatusPill></span>
                  </div>
                ))}
              </div>
            </div>

            {/* what needs you */}
            <div className="mck-col" style={{ width: 320, flex: "0 0 320px", gap: 13 }}>
              <div className="mck-row" style={{ gap: 9 }}>
                <span className="mck-eyebrow">What needs you</span>
                <span className="mck-pill mck-pill-yulia" style={{ height: 18, padding: "0 7px", fontSize: 10 }}><span className="mck-pdot" />{needsYou.length}</span>
              </div>
              <div className="mck-card" style={{ overflow: "hidden" }}>
                {needsYou.map((n, i) => (
                  <button key={n.id ?? n.title} onClick={() => n.id && onOpenDeal(n.id)} className="mck-row" style={{ width: "100%", textAlign: "left", gap: 11, padding: "13px 15px", borderTop: i ? "1px solid var(--line-2)" : "none", background: "none", cursor: n.id ? "pointer" : "default" } as CSSProperties}>
                    <span className="mck-pdot" style={{ width: 7, height: 7, borderRadius: "50%", marginTop: 5, flex: "0 0 auto", background: n.kind === "risk" ? "var(--risk)" : "var(--warn)" }} />
                    <span className="mck-col" style={{ gap: 2, minWidth: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{n.title}</span>
                      <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{n.deal}</span>
                    </span>
                    <span className="mck-msg-time" style={{ marginLeft: "auto" }}>{n.time}</span>
                  </button>
                ))}
              </div>

              <div className="mck-row" style={{ gap: 9, marginTop: 6 }}>
                <span className="mck-eyebrow">Recent activity</span>
              </div>
              <div className="mck-card" style={{ padding: "6px 0" }}>
                {activity.map((a, i) => (
                  <div key={i} className="mck-row" style={{ gap: 10, padding: "9px 15px", alignItems: "flex-start" }}>
                    {a.kind === "yulia" ? <YuliaMark size={22} /> : <Avatar name={a.who} tone="c" size={22} />}
                    <span className="mck-grow" style={{ fontSize: 12.5, lineHeight: 1.45 }}><b>{a.who}</b> <span style={{ color: "var(--ink-2)" }}>{a.act}</span></span>
                    <span className="mck-msg-time">{a.ago}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
