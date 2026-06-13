/**
 * Desktop Market Intelligence — REAL portfolio-sector composition.
 *
 * The old version shipped hardcoded fiction (fake feed items, fabricated
 * sector counts + trends, "synthesized from 6 sources" bylines) to every
 * authed user. That's deleted. This page now derives its sectors from the
 * industries in the user's ACTUAL deals, and routes each to a real,
 * source-grounded market read via Yulia. No fabricated counts or trends —
 * real market density/heat is the DI-3 follow-up (getMarketHeat/CBP/FRED).
 */
import { useEffect, useMemo, useState } from "react";
import type { OpenTab } from "../types";
import { authHeaders, type User } from "../../../hooks/useAuth";
import { useV6WorkspaceData } from "../../../hooks/useV6WorkspaceData";
import { YuliaSkeleton } from "../shared/YuliaSkeleton";
import { journeyTone, VERDICT_MATERIAL } from "../shared/verdictMaterial";

interface SectorRollup {
  industry: string;
  count: number;
  fitSum: number;   // accumulate sum + count → TRUE mean, divided once at render
  fitCount: number;
  topDealId: number;
  topDealName: string;
  states: string[];
}

/** Real per-industry market heat from /api/intelligence/portfolio-heat
 *  (getMarketHeat: curated PE roll-up verticals + live buyer-thesis counts). */
interface MarketHeat {
  industry: string;
  score: number;      // 1-5
  label: string;      // Cold..Super-Hot
  peActivity: string;
  multipleDirection: "expanding" | "stable" | "contracting";
  signals: string[];
}

/** Temperature ramp — NOT a verdict. Higher heat = more PE/buyer activity, a
 *  descriptive market-temperature fact (THE LINE: never "good/bad to act").
 *  Warm tones for hot markets, cool neutral for cold; reuses on-system trios
 *  so no bespoke palette is invented. */
const HEAT_TONE: Record<number, { soft: string; ink: string; mid: string }> = {
  5: VERDICT_MATERIAL.watch.tone,                                  // Super-Hot → amber/gold
  4: VERDICT_MATERIAL.watch.tone,                                  // Hot → amber/gold
  3: { soft: "#F1EEE6", ink: "#7A7256", mid: "#B8AE97" },          // Warm → oat neutral
  2: { soft: "#EDEFF2", ink: "#4A5260", mid: "#8B92A0" },          // Cool → charcoal neutral
  1: { soft: "#EDEFF2", ink: "#4A5260", mid: "#8B92A0" },          // Cold → charcoal neutral
};
function heatTone(score: number) {
  return HEAT_TONE[Math.max(1, Math.min(5, Math.round(score)))] ?? HEAT_TONE[2];
}
const DIRECTION_GLYPH: Record<string, string> = { expanding: "↗", stable: "→", contracting: "↘" };

export function V6IntelRoot({ openTab, onTalkToYulia, user }: { openTab: OpenTab; onTalkToYulia?: (prompt: string) => void; user?: User | null }) {
  const workspace = useV6WorkspaceData(user ?? null);
  const ask = (prompt: string) => onTalkToYulia?.(prompt);

  // Real market heat per industry — computed server-side from PE activity +
  // live buyer theses. Keyed lower-cased for a forgiving sector-card lookup.
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
        map.set(ind, { industry: ind, count: 1, fitSum: fit ?? 0, fitCount: fit != null ? 1 : 0, topDealId: d.id, topDealName: d.business_name || `Deal #${d.id}`, states: st ? [st] : [] });
      } else {
        cur.count += 1;
        if (fit != null) { cur.fitSum += fit; cur.fitCount += 1; }
        if (st && !cur.states.includes(st)) cur.states.push(st);
      }
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [workspace.deals]);

  const loading = workspace.canFetch && workspace.loading;
  // Count only deals that actually landed in a sector, so the headline
  // matches the grid (no industry-less or non-active deals overstated).
  const sectorDealCount = sectors.reduce((n, s) => n + s.count, 0);
  // The hottest of the user's OWN sectors — leads the subhead with the
  // computed answer (the card order stays count-stable, no async reorder).
  const hottest = useMemo(() => {
    const vals = Object.values(heatByIndustry).filter(h => h.score > 0);
    return vals.sort((a, b) => b.score - a.score)[0] ?? null;
  }, [heatByIndustry]);

  const watchSector = (industry?: string) => {
    openTab({ id: "search-root", kind: "mode-root", modeId: "search", title: "Search" });
    ask(industry
      ? `Build a market read for ${industry}: buyer movement, comps, recent exits, capital signals, and the deal professionals active in the sector. Ground it in sources.`
      : "Help me choose which sectors to watch based on my current thesis and pipeline.");
  };

  return (
    <div className="wk-content m-fade-up" style={{ maxWidth: 1180, margin: "0 auto" }}>
      <div className="pg-head">
        <div>
          <div className="pg-title">Market intelligence</div>
          <p className="pg-sub">The sectors your portfolio is actually in — and the market read behind each.</p>
        </div>
        <div className="pg-actions">
          <button className="wkbtn" type="button" onClick={() => watchSector()}>Ask Yulia what to watch</button>
        </div>
      </div>

      {loading ? (
        <div style={{ marginTop: 16 }}><YuliaSkeleton rows={4} label="Yulia is reading your portfolio…" /></div>
      ) : sectors.length === 0 ? (
        <div className="wkcard" style={{ marginTop: 16, textAlign: "center", color: "var(--ink-2)" }}>
          <div className="wkcard-title">No sectors yet</div>
          <div className="wkcard-sub">Add a deal with an industry and Yulia will build the market read for that sector here.</div>
          <button className="wkbtn dark" type="button" style={{ marginTop: 14 }} onClick={() => ask("Help me source a deal and define the sector to watch.")}>Start with Yulia</button>
        </div>
      ) : (
        <div className="wksec">
          <div className="wksec-title" style={{ marginBottom: 4 }}>Your sectors</div>
          <p className="pg-sub" style={{ marginTop: 0, marginBottom: 14 }}>
            {hottest && <><strong style={{ color: "var(--ink)" }}>Hottest now: {hottest.industry} — {hottest.label} ({hottest.score}/5).</strong>{" "}</>}
            {sectorDealCount} active deal{sectorDealCount === 1 ? "" : "s"} across {sectors.length} sector{sectors.length === 1 ? "" : "s"}. Open any for the source-grounded read.
          </p>
          <div className="wkgrid g3" style={{ gap: 12 }}>
            {sectors.map(s => {
              const tone = journeyTone("buy") ?? VERDICT_MATERIAL.baseline.tone;
              const heat = heatByIndustry[s.industry.toLowerCase().trim()];
              const ht = heat ? heatTone(heat.score) : null;
              // The strongest real signal Yulia computed for this sector — the
              // top buyer-thesis / consolidation signal, else the PE-activity read.
              const signal = heat ? (heat.signals[0] || heat.peActivity) : null;
              return (
                <div
                  key={s.industry}
                  className="wkcard tap wk-ascard"
                  role="button"
                  tabIndex={0}
                  aria-label={`${s.industry} — ${s.count} deals${heat ? ` — market heat ${heat.label} ${heat.score} of 5` : ""} — get the market read`}
                  onClick={() => watchSector(s.industry)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); watchSector(s.industry); } }}
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div className="wkcard-title" style={{ fontSize: "1rem", lineHeight: 1.2, minWidth: 0 }}>{s.industry}</div>
                    <span style={{ flexShrink: 0, padding: "2px 9px", borderRadius: 999, background: tone.soft, color: tone.ink, fontSize: "0.72rem", fontWeight: 700 }}>
                      {s.count} deal{s.count === 1 ? "" : "s"}
                    </span>
                  </div>
                  {/* Real market heat — the page's lead signal. Temperature ramp,
                      not a verdict (THE LINE: descriptive market state only). */}
                  {heat && ht && (
                    <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, background: ht.soft, color: ht.ink, fontSize: "0.74rem", fontWeight: 700 }}>
                        <span aria-hidden style={{ width: 6, height: 6, borderRadius: "50%", background: ht.mid }} />
                        {heat.label} · {heat.score}/5
                      </span>
                      <span style={{ fontSize: "0.74rem", fontWeight: 600, color: "var(--ink-3)" }}>
                        {DIRECTION_GLYPH[heat.multipleDirection] || "→"} {heat.multipleDirection} multiples
                      </span>
                    </div>
                  )}
                  <div style={{ fontSize: "0.82rem", color: "var(--ink-2)", lineHeight: 1.4 }}>
                    {signal || (s.states.length > 0 ? s.states.slice(0, 3).join(" · ") : "—")}
                    {s.fitCount > 0 && <> · avg fit <span style={{ color: "var(--st-good-fg)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>{Math.round(s.fitSum / s.fitCount)}</span></>}
                  </div>
                  <div style={{ marginTop: "auto", paddingTop: 6, fontSize: "0.8rem", fontWeight: 700, color: tone.ink }}>
                    Get the market read ›
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
