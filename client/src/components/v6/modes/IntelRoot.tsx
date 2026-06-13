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
import { useMemo } from "react";
import type { OpenTab } from "../types";
import type { User } from "../../../hooks/useAuth";
import { useV6WorkspaceData } from "../../../hooks/useV6WorkspaceData";
import { YuliaSkeleton } from "../shared/YuliaSkeleton";
import { journeyTone, VERDICT_MATERIAL } from "../shared/verdictMaterial";

interface SectorRollup {
  industry: string;
  count: number;
  avgFit: number | null;
  topDealId: number;
  topDealName: string;
  states: string[];
}

export function V6IntelRoot({ openTab, onTalkToYulia, user }: { openTab: OpenTab; onTalkToYulia?: (prompt: string) => void; user?: User | null }) {
  const workspace = useV6WorkspaceData(user ?? null);
  const ask = (prompt: string) => onTalkToYulia?.(prompt);

  // Group the user's real deals by industry → honest sector rollups.
  const sectors = useMemo<SectorRollup[]>(() => {
    const map = new Map<string, SectorRollup>();
    for (const d of workspace.deals) {
      const ind = (d.industry || "").trim();
      if (!ind) continue;
      const fit = typeof d.seven_factor_composite === "number" ? d.seven_factor_composite : null;
      const st = (d.location || "").split(",").pop()?.trim();
      const cur = map.get(ind);
      if (!cur) {
        map.set(ind, { industry: ind, count: 1, avgFit: fit, topDealId: d.id, topDealName: d.business_name || `Deal #${d.id}`, states: st ? [st] : [] });
      } else {
        cur.count += 1;
        if (fit != null) cur.avgFit = cur.avgFit == null ? fit : (cur.avgFit + fit) / 2;
        if (st && !cur.states.includes(st)) cur.states.push(st);
      }
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [workspace.deals]);

  const loading = workspace.canFetch && workspace.loading;
  const totalDeals = workspace.deals.length;

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
            {totalDeals} active deal{totalDeals === 1 ? "" : "s"} across {sectors.length} sector{sectors.length === 1 ? "" : "s"}. Open any for the source-grounded read.
          </p>
          <div className="wkgrid g3" style={{ gap: 12 }}>
            {sectors.map(s => {
              const tone = journeyTone("buy") ?? VERDICT_MATERIAL.baseline.tone;
              return (
                <div
                  key={s.industry}
                  className="wkcard tap wk-ascard"
                  role="button"
                  tabIndex={0}
                  aria-label={`${s.industry} — ${s.count} deals — get the market read`}
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
                  <div style={{ fontSize: "0.82rem", color: "var(--ink-2)", lineHeight: 1.4 }}>
                    {s.states.length > 0 ? s.states.slice(0, 3).join(" · ") : "—"}
                    {s.avgFit != null && <> · avg fit <span style={{ color: "var(--st-good-fg)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>{Math.round(s.avgFit)}</span></>}
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
