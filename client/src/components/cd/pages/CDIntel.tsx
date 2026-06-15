/**
 * CDIntel — Portfolio › Market intel, ported to the Claude Design (cool/indigo)
 * language and wired to LIVE data. Mounts under `.cd-root` (cdTokens.css).
 *
 * The page leads with the COMPUTED answer (a heat-posture hero band: hottest
 * sector + how many of your sectors run hot / which way multiples move), then
 * per-sector temperature cards — each carrying the real CDHeatBar + direction
 * glyph + Yulia's market-state implication, plus the deals that live in that
 * sector (click → open the deal tab).
 *
 * Real market heat is /api/intelligence/portfolio-heat (getMarketHeat: curated
 * PE roll-up verticals + live buyer-thesis counts), score 1–5. Sectors derive
 * from the industries in the user's ACTUAL active deals — never fabricated.
 * Where a sector has no heat row yet, we show an honest "—", never an invented
 * temperature. The CD mockup (marketintel.jsx) is the visual target only; its
 * window.MA_* demo data is NOT copied. Zero hallucination.
 *
 * THE LINE: heat is a DESCRIPTIVE market temperature, not a verdict or advice.
 * Every action routes to chat via onTalkToYulia(...) or opens a deal tab.
 */
import { useEffect, useMemo, useState } from "react";
import { authHeaders, type User } from "../../../hooks/useAuth";
import { useV6WorkspaceData, type WorkspaceDeal } from "../../../hooks/useV6WorkspaceData";
import {
  CDIcon, CDCard, CDPill, CDEyebrow, CDDivider, CDHeatBar, CDDirGlyph, CDLineNote,
  cdDealColor,
} from "../kit/cdUi";

/* Real per-industry market heat from /api/intelligence/portfolio-heat.
 * score is 1–5 (Cold..Super-Hot); CDHeatBar wants 0–100, so we scale ×20. */
interface MarketHeat {
  industry: string;
  score: number;                                               // 1–5
  label: string;                                               // Cold..Super-Hot
  peActivity: string;
  multipleDirection: "expanding" | "stable" | "contracting";
  signals: string[];
}

/* heat → tone for the score word / pill (warm→hot; cool when cold). Mirrors
 * the operatingPrimitives heat ramp so Today and Intel read identically. */
function heatTone(score: number): { tone: "neutral" | "accent" | "warn" | "pos"; color: string } {
  if (score >= 5) return { tone: "pos", color: "var(--cd-pos)" };
  if (score >= 4) return { tone: "warn", color: "var(--cd-warn)" };
  if (score >= 3) return { tone: "accent", color: "var(--cd-accent)" };
  return { tone: "neutral", color: "var(--cd-ink-4)" };
}

const DIRECTION_WORD: Record<string, string> = {
  expanding: "expanding multiples",
  stable: "stable multiples",
  contracting: "contracting multiples",
};

/* A sector rollup over the user's real active deals (industry-grouped). */
interface SectorRollup {
  industry: string;
  deals: WorkspaceDeal[];
  fitSum: number;
  fitCount: number;
  states: string[];
}

/* One stat cell in the heat-posture hero band. */
function HeatStatCell({ n, label, sub, color }: { n: number; label: string; sub?: string; color?: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0, padding: "0 22px", borderLeft: "1px solid var(--cd-line)" }}>
      <div className="cd-num" style={{ fontSize: 26, fontWeight: 700, lineHeight: 1, color: color || "var(--cd-ink)", letterSpacing: "-0.02em" }}>{n}</div>
      <div style={{ fontSize: 11.5, color: "var(--cd-ink-3)", marginTop: 5 }}>{label}{sub ? <span style={{ color: "var(--cd-ink-4)" }}> {sub}</span> : null}</div>
    </div>
  );
}

export function CDIntel({ user, openTab, onTalkToYulia }: {
  user: User | null;
  openTab: (t: any) => void;
  onTalkToYulia?: (p: string) => void;
  modelPreference?: any;
}) {
  const workspace = useV6WorkspaceData(user);
  const ask = (prompt: string) => onTalkToYulia?.(prompt);

  // Real market heat per industry — keyed lower-cased for a forgiving lookup.
  const [heatByIndustry, setHeatByIndustry] = useState<Record<string, MarketHeat>>({});
  useEffect(() => {
    if (!user || !workspace.canFetch) { setHeatByIndustry({}); return; }
    let cancelled = false;
    fetch("/api/intelligence/portfolio-heat", { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`heat ${r.status}`)))
      .then((data: { heat?: MarketHeat[] }) => {
        if (cancelled) return;
        const map: Record<string, MarketHeat> = {};
        for (const h of data.heat ?? []) map[h.industry.toLowerCase().trim()] = h;
        setHeatByIndustry(map);
      })
      .catch(() => { if (!cancelled) setHeatByIndustry({}); });
    return () => { cancelled = true; };
  }, [user?.id, workspace.canFetch]);

  // Group the user's real ACTIVE deals by industry → honest sector rollups.
  const sectors = useMemo<SectorRollup[]>(() => {
    const map = new Map<string, SectorRollup>();
    for (const d of workspace.deals) {
      if ((d.status || "").toLowerCase() !== "active") continue;
      const ind = (d.industry || "").trim();
      if (!ind) continue;
      const fit = typeof d.seven_factor_composite === "number" && Number.isFinite(d.seven_factor_composite) ? d.seven_factor_composite : null;
      const st = (d.location || "").split(",").pop()?.trim();
      const cur = map.get(ind);
      if (!cur) {
        map.set(ind, { industry: ind, deals: [d], fitSum: fit ?? 0, fitCount: fit != null ? 1 : 0, states: st ? [st] : [] });
      } else {
        cur.deals.push(d);
        if (fit != null) { cur.fitSum += fit; cur.fitCount += 1; }
        if (st && !cur.states.includes(st)) cur.states.push(st);
      }
    }
    // Order hottest-first when heat is known, else by deal count.
    return [...map.values()].sort((a, b) => {
      const ha = heatByIndustry[a.industry.toLowerCase().trim()]?.score ?? -1;
      const hb = heatByIndustry[b.industry.toLowerCase().trim()]?.score ?? -1;
      if (hb !== ha) return hb - ha;
      return b.deals.length - a.deals.length;
    });
  }, [workspace.deals, heatByIndustry]);

  // Portfolio-wide heat posture — the page's computed lead.
  const scored = useMemo(() => Object.values(heatByIndustry).filter(h => h.score > 0), [heatByIndustry]);
  const hottest = useMemo(() => [...scored].sort((a, b) => b.score - a.score)[0] ?? null, [scored]);
  const posture = useMemo(() => ({
    total: scored.length,
    hot: scored.filter(h => h.score >= 4).length,
    expanding: scored.filter(h => h.multipleDirection === "expanding").length,
    contracting: scored.filter(h => h.multipleDirection === "contracting").length,
  }), [scored]);

  const sectorDealCount = sectors.reduce((n, s) => n + s.deals.length, 0);
  const loading = workspace.canFetch && workspace.loading && sectors.length === 0;

  const watchSector = (industry?: string) => ask(industry
    ? `Build a market read for ${industry}: buyer movement, comps, recent exits, capital signals, and the deal professionals active in the sector. Ground it in sources.`
    : "Help me choose which sectors to watch based on my current thesis and pipeline.");

  return (
    <div className="cd-root cd-scrollable" style={{ background: "var(--cd-canvas)", height: "100%", overflow: "auto", padding: "30px 34px 60px", display: "flex", flexDirection: "column", gap: "var(--cd-gap)" }}>
      {/* editorial header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "var(--cd-serif)", fontWeight: 600, fontSize: 36, lineHeight: 1.04, letterSpacing: "-0.02em" }}>
            Market <span style={{ fontStyle: "italic" }}>intel</span>
          </h1>
          <p style={{ margin: "9px 0 0", color: "var(--cd-ink-2)", fontSize: 14.5, maxWidth: 640 }}>
            {hottest
              ? <>Hottest now: <strong style={{ color: "var(--cd-ink)" }}>{hottest.industry} — {hottest.label} ({hottest.score}/5).</strong>{" "}The sectors your portfolio is actually in, and the market read behind each.</>
              : "The sectors your portfolio is actually in — and the market read behind each."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => watchSector()}
          style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--cd-surface)", color: "var(--cd-ink-2)", border: "1px solid var(--cd-line-2)", borderRadius: "var(--cd-r-md)", padding: "9px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--cd-sans)", flexShrink: 0 }}
        >
          <CDIcon name="sparkle" size={14} color="var(--cd-accent)" />Ask Yulia what to watch
        </button>
      </div>

      {/* heat-posture hero band — leads with the computed answer */}
      {posture.total > 0 && hottest && (
        <CDCard pad={false} style={{ display: "flex", alignItems: "center", padding: "18px 0" }}>
          <div style={{ padding: "0 22px", flexShrink: 0 }}>
            <CDEyebrow style={{ marginBottom: 6 }}>Hottest now</CDEyebrow>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 16, fontWeight: 700, whiteSpace: "nowrap" }}>{hottest.industry}</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: heatTone(hottest.score).color, whiteSpace: "nowrap" }}>{hottest.label}</span>
              <CDHeatBar heat={hottest.score * 20} />
              <span className="cd-num" style={{ fontSize: 11.5, color: "var(--cd-ink-3)" }}>{hottest.score}/5</span>
            </div>
          </div>
          <HeatStatCell n={posture.hot} label="sectors running hot" sub={`of ${posture.total}`} color={posture.hot > 0 ? "var(--cd-warn)" : "var(--cd-ink-3)"} />
          <HeatStatCell n={posture.expanding} label="multiples expanding" color={posture.expanding > 0 ? "var(--cd-pos)" : "var(--cd-ink-3)"} />
          <HeatStatCell n={posture.contracting} label="multiples contracting" color={posture.contracting > 0 ? "var(--cd-neg)" : "var(--cd-ink-3)"} />
        </CDCard>
      )}

      {/* section label */}
      <CDDivider label="Your sectors" />

      {loading ? (
        <CDCard><div className="cd-skel" style={{ height: 120 }} /></CDCard>
      ) : sectors.length === 0 ? (
        <CDCard style={{ textAlign: "center", color: "var(--cd-ink-2)", padding: "32px 22px" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--cd-ink)" }}>No sectors yet</div>
          <div style={{ fontSize: 13, color: "var(--cd-ink-3)", marginTop: 6, maxWidth: 420, marginInline: "auto" }}>
            Add a deal with an industry and Yulia will build the market read for that sector here.
          </div>
          <button
            type="button"
            onClick={() => ask("Help me source a deal and define the sector to watch.")}
            style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 7, background: "var(--cd-ink)", color: "var(--cd-surface)", border: "none", borderRadius: "var(--cd-r-md)", padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--cd-sans)" }}
          >
            <CDIcon name="sparkle" size={14} color="var(--cd-surface)" />Start with Yulia
          </button>
        </CDCard>
      ) : (
        <>
          <p style={{ margin: "-4px 0 2px", fontSize: 12.5, color: "var(--cd-ink-3)" }}>
            {sectorDealCount} active deal{sectorDealCount === 1 ? "" : "s"} across {sectors.length} sector{sectors.length === 1 ? "" : "s"}.
            {posture.total < sectors.length && <> Market heat scored for {posture.total} of {sectors.length} — the rest show “—” until a read lands.</>}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "var(--cd-gap)" }}>
            {sectors.map(s => {
              const heat = heatByIndustry[s.industry.toLowerCase().trim()];
              const ht = heat ? heatTone(heat.score) : null;
              // The strongest real signal Yulia computed: top buyer-thesis signal, else PE-activity read.
              const signal = heat ? (heat.signals?.[0] || heat.peActivity) : null;
              return (
                <CDCard key={s.industry} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {/* sector + count */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.01em" }}>{s.industry}</div>
                      <div style={{ fontSize: 11.5, color: "var(--cd-ink-3)", marginTop: 4 }}>
                        {s.deals.length} deal{s.deals.length === 1 ? "" : "s"}
                        {s.fitCount > 0 && <> · avg fit <span className="cd-num" style={{ color: "var(--cd-pos)", fontWeight: 700 }}>{Math.round(s.fitSum / s.fitCount)}</span></>}
                      </div>
                    </div>
                    {ht && heat ? <CDPill tone={ht.tone}>{heat.label}</CDPill> : <CDPill tone="neutral">no read yet</CDPill>}
                  </div>

                  {/* real market heat — the lead signal (descriptive, not a verdict) */}
                  {heat ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <CDHeatBar heat={heat.score * 20} />
                      <span className="cd-num" style={{ fontSize: 11.5, fontWeight: 700, color: ht!.color }}>{heat.score}/5</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: "var(--cd-ink-2)" }}>
                        <CDDirGlyph dir={heat.multipleDirection} />{DIRECTION_WORD[heat.multipleDirection] || heat.multipleDirection}
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: "var(--cd-ink-3)" }}>
                      <CDHeatBar heat={0} />
                      <span>Heat read pending</span>
                    </div>
                  )}

                  {/* top signal — Yulia's market-state read, or honest geography fallback */}
                  <div style={{ fontSize: 12, color: "var(--cd-ink-2)", lineHeight: 1.45, borderTop: "1px solid var(--cd-line)", paddingTop: 11, minHeight: 34 }}>
                    {signal
                      ? <><span style={{ color: "var(--cd-ink-4)", fontWeight: 600 }}>Top signal · </span>{signal}</>
                      : (s.states.length > 0
                        ? <><span style={{ color: "var(--cd-ink-4)", fontWeight: 600 }}>Geography · </span>{s.states.slice(0, 3).join(" · ")}</>
                        : <span style={{ color: "var(--cd-ink-3)" }}>—</span>)}
                  </div>

                  {/* the deals living in this sector — click to open the deal tab */}
                  {s.deals.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {s.deals.slice(0, 4).map(d => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => openTab({ kind: "deal", id: String(d.id), title: d.business_name || `Deal #${d.id}` })}
                          style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 9px", borderRadius: 9, border: "1px solid var(--cd-line)", background: "var(--cd-surface-2)", cursor: "pointer", fontFamily: "var(--cd-sans)", textAlign: "left", width: "100%" }}
                        >
                          <span style={{ width: 7, height: 7, borderRadius: 2, background: cdDealColor(d.id), flexShrink: 0 }} />
                          <span style={{ fontSize: 12, fontWeight: 600, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--cd-ink)" }}>{d.business_name || `Deal #${d.id}`}</span>
                          {d.current_gate && <span className="cd-num" style={{ fontSize: 10.5, color: "var(--cd-ink-4)", flexShrink: 0 }}>{d.current_gate}</span>}
                          <CDIcon name="chevright" size={13} color="var(--cd-ink-4)" />
                        </button>
                      ))}
                      {s.deals.length > 4 && <span style={{ fontSize: 11, color: "var(--cd-ink-4)", paddingLeft: 9 }}>+{s.deals.length - 4} more in this sector</span>}
                    </div>
                  )}

                  {/* get the source-grounded read via Yulia */}
                  <button
                    type="button"
                    onClick={() => watchSector(s.industry)}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--cd-sans)", fontSize: 12.5, fontWeight: 700, color: "var(--cd-accent-strong)", padding: 0, marginTop: "auto" }}
                  >
                    Get the market read<CDIcon name="chevright" size={13} color="var(--cd-accent)" />
                  </button>
                </CDCard>
              );
            })}
          </div>

          <CDLineNote style={{ marginTop: 4 }} />
        </>
      )}
    </div>
  );
}
