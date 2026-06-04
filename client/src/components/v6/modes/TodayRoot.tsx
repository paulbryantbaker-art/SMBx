/**
 * Desktop Today — mirrors the mobile Today IA (the solved layout) and renders
 * the SUBSTRATE, never app-computed judgment. Card stack:
 *   Daily hero · Market intelligence · Pipeline preview · Library · Analyses · Quick wins
 *
 * Every deal verdict / fit / market read comes from Yulia's analysis
 * (`/api/agency/portfolio-brief`). The app holds NO methodology and computes NO
 * verdict/fit/stage — where Yulia hasn't read yet, we show facts + "Yulia is
 * analyzing…", never a fabricated value.
 */
import { useEffect, useState } from "react";
import { authHeaders, type User } from "../../../hooks/useAuth";
import { useHomeDeals } from "../../../hooks/useHomeDeals";
import { useV6WorkspaceData, type WorkspaceDeliverable } from "../../../hooks/useV6WorkspaceData";
import { YuliaSkeleton } from "../shared/YuliaSkeleton";
import { V6Icon } from "../icons";
import type { OpenTab } from "../types";

// ── Substrate brief shapes (Yulia's analysis — we render, never compute) ──
interface BriefMarketIntel { headline: string; subhead: string; bullets: string[]; sourceCount: number; confidence: string; }
interface BriefHero { title: string; lede: string; primaryLabel: string; primaryPrompt?: string; secondaryLabel?: string; secondaryDealId?: string; }
interface BriefDeal { id: string; title: string; meta: string; status: string; fit: number; }
interface BriefFile { id?: string; title: string; sub: string; status: string; kind: "doc" | "chart"; }
interface PortfolioBrief {
  hero?: BriefHero;
  marketIntelligence?: BriefMarketIntel;
  deals?: BriefDeal[];
  files?: BriefFile[];
}

// Conversation starters (UI affordance — prompts to Yulia, not deal data).
const QUICK_WINS = [
  "What's worth my next 10 minutes?",
  "Give me the portfolio read — market, buyers, risks.",
  "Which deals are stalling and why?",
];

interface TodayRootProps {
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
  user: User | null;
}

export function V6TodayRoot({ openTab, onTalkToYulia, user }: TodayRootProps) {
  const home = useHomeDeals(user);
  const workspace = useV6WorkspaceData(user);
  const [brief, setBrief] = useState<PortfolioBrief | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);

  useEffect(() => {
    if (!workspace.canFetch) { setBrief(null); setBriefLoading(false); return; }
    let cancelled = false;
    setBriefLoading(true);
    fetch("/api/agency/portfolio-brief", { headers: authHeaders() })
      .then(res => res.ok ? res.json() : Promise.reject(new Error(`brief ${res.status}`)))
      .then((next: PortfolioBrief) => { if (!cancelled) setBrief(next); })
      .catch(() => { if (!cancelled) setBrief(null); })
      .finally(() => { if (!cancelled) setBriefLoading(false); });
    return () => { cancelled = true; };
  }, [workspace.canFetch, user?.id]);

  const ask = (prompt: string) => onTalkToYulia?.(prompt);
  const openDeal = (id: string, title: string) => openTab({ kind: "deal", id, title });

  const hero = brief?.hero ?? null;
  const intel = brief?.marketIntelligence ?? null;
  const briefDeals = brief?.deals ?? [];
  const recentFiles = workspace.deliverables.slice(0, 4);
  // Loading window: authed, brief not yet resolved → Yulia is still reading.
  const analyzing = workspace.canFetch && briefLoading && !brief;

  return (
    <div className="wk-content m-fade-up" style={{ maxWidth: 1180, margin: "0 auto" }}>
      <div className="pg-head">
        <div>
          <div className="pg-title">Today</div>
          <p className="pg-sub">
            {hero?.lede || (analyzing ? "Yulia is reading your portfolio…" : "Your live deal desk.")}
          </p>
        </div>
      </div>

      {/* ── Hero + Market intelligence (Yulia's read) ── */}
      <div className="wkgrid g2" style={{ gap: 16, marginTop: 4 }}>
        {/* Daily hero — Yulia's lead for today */}
        <div className="wkcard" style={{ display: "flex", flexDirection: "column", gap: 16, minHeight: 200 }}>
          {analyzing ? (
            <YuliaSkeleton rows={2} label="Yulia is choosing today's focus…" />
          ) : hero ? (
            <>
              <div style={{ fontSize: "clamp(1.4rem, 2.4vw, 1.95rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.12, color: "var(--ink)" }}>
                {hero.title}
              </div>
              <div style={{ display: "flex", gap: 9, marginTop: "auto" }}>
                <button className="wkbtn primary" type="button" onClick={() => hero.primaryPrompt ? ask(hero.primaryPrompt) : ask("Give me today's read.")}>
                  {hero.primaryLabel || "Ask Yulia"}
                </button>
                {hero.secondaryDealId && (
                  <button className="wkbtn" type="button" onClick={() => openDeal(hero.secondaryDealId!, hero.secondaryLabel || "Deal")}>
                    {hero.secondaryLabel || "Open deal"}
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, color: "var(--ink)" }}>
                Ask Yulia for today's read.
              </div>
              <p style={{ color: "var(--ink-2)", fontSize: "0.9rem", lineHeight: 1.5, margin: 0 }}>
                She'll pull together what matters across your deals — the strongest source, the risks, and the next move.
              </p>
              <button className="wkbtn primary" type="button" style={{ marginTop: "auto", alignSelf: "flex-start" }} onClick={() => ask("Give me today's read across my portfolio: the strongest deal, the risks, and what needs me first.")}>
                Get today's read
              </button>
            </>
          )}
        </div>

        {/* Market intelligence — Yulia's portfolio read */}
        <div className="wkcard" style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 200 }}>
          <div style={{ fontSize: "1.15rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--ink)", lineHeight: 1.1 }}>Market intelligence</div>
          {analyzing ? (
            <YuliaSkeleton rows={3} label="Yulia is reading the market…" />
          ) : intel ? (
            <>
              <button
                type="button"
                style={{ all: "unset", display: "block", cursor: "pointer", padding: "12px 14px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 10, width: "100%", boxSizing: "border-box" }}
                onClick={() => ask("Show me the market intelligence behind today's read — buyer universe, financing climate, tax/legal, and source gaps.")}
              >
                <strong style={{ display: "block", color: "var(--ink)", fontSize: "0.94rem", lineHeight: 1.3, fontWeight: 700 }}>{intel.headline}</strong>
                <span style={{ display: "block", marginTop: 5, color: "var(--ink-2)", fontSize: "0.82rem", lineHeight: 1.42 }}>{intel.subhead}</span>
              </button>
              {intel.bullets.slice(0, 3).map((bullet, i) => (
                <button
                  key={bullet}
                  type="button"
                  style={{ all: "unset", cursor: "pointer", display: "grid", gridTemplateColumns: "auto 1fr", gap: 10, alignItems: "start", padding: "9px 12px", background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 9, width: "100%", boxSizing: "border-box" }}
                  onClick={() => ask(`Unpack this market signal: ${bullet}`)}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 600, color: "var(--ink-3)" }}>{i + 1}</span>
                  <span style={{ color: "var(--ink-2)", fontSize: "0.83rem", lineHeight: 1.38 }}>{bullet}</span>
                </button>
              ))}
            </>
          ) : (
            <>
              <p style={{ color: "var(--ink-2)", fontSize: "0.88rem", lineHeight: 1.5, margin: 0 }}>
                Yulia hasn't built a market read yet. Ask her to analyze buyers, financing climate, and the risks across your portfolio.
              </p>
              <button className="wkbtn" type="button" style={{ marginTop: "auto", alignSelf: "flex-start" }} onClick={() => ask("Build my portfolio market intelligence read: buyer universe, financing climate, tax/legal structure, and source gaps.")}>
                Ask Yulia for the read
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Pipeline preview — Yulia's analyzed deals, else facts + "analyzing" ── */}
      <div className="wksec">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
          <div className="wksec-title" style={{ marginBottom: 2 }}>Deals in motion</div>
          <button
            type="button"
            onClick={() => openTab({ id: "deals-all", kind: "deals-list", title: "All deals", dealsListView: "all" })}
            style={{ all: "unset", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.04em", color: "var(--accent-strong)", whiteSpace: "nowrap" }}
          >
            See all{home.all.length ? ` ${home.all.length}` : ""} →
          </button>
        </div>
        <p style={{ color: "var(--ink-2)", fontSize: "0.88rem", margin: "0 0 14px" }}>
          {briefDeals.length ? "Yulia's read on the deals moving right now." : "Yulia is analyzing your pipeline — her verdict appears as she reads each deal."}
        </p>

        {analyzing && briefDeals.length === 0 && home.all.length === 0 ? (
          <YuliaSkeleton rows={3} label="Yulia is reading your deals…" />
        ) : briefDeals.length > 0 ? (
          <table className="wktable">
            <thead><tr><th>Deal</th><th>Verdict</th><th className="r">Fit</th></tr></thead>
            <tbody>
              {briefDeals.map(d => (
                <tr key={d.id} onClick={() => openDeal(d.id, d.title)}>
                  <td>
                    <div className="cellname">
                      <span className="logo">{initials(d.title)}</span>
                      <div><div className="nm">{d.title}</div><div className="sub">{d.meta}</div></div>
                    </div>
                  </td>
                  <td><span className={`statpill ${verdictClass(d.status)}`}><span className="d" />{d.status}</span></td>
                  <td className="r"><span className="fit"><span className="fitn">{d.fit}</span><span className="ft"><span className="ff" style={{ width: `${d.fit}%` }} /></span></span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : home.all.length > 0 ? (
          // Facts only (name/revenue/gate) — Yulia hasn't read these yet. No app verdict.
          <table className="wktable">
            <thead><tr><th>Deal</th><th className="r">Revenue</th><th>Yulia</th></tr></thead>
            <tbody>
              {home.all.slice(0, 6).map(d => (
                <tr key={d.id} onClick={() => openDeal(String(d.id), d.business_name || `Deal #${d.id}`)}>
                  <td>
                    <div className="cellname">
                      <span className="logo">{initials(d.business_name || d.industry || `D${d.id}`)}</span>
                      <div><div className="nm">{d.business_name || d.industry || `Deal #${d.id}`}</div><div className="sub">{d.location || d.industry || "active deal"}</div></div>
                    </div>
                  </td>
                  <td className="r amt">{fmtCents(d.revenue)}</td>
                  <td><span className="muted" style={{ fontSize: "0.8rem" }}>Analyzing…</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="wkcard" style={{ textAlign: "center", color: "var(--ink-2)" }}>
            <div className="wkcard-title">No deals yet</div>
            <div className="wkcard-sub">Start with a deal, thesis, or source file and Yulia will read it here.</div>
            <button className="wkbtn dark" type="button" style={{ marginTop: 14 }} onClick={() => ask("Help me start my first deal.")}>Start with Yulia</button>
          </div>
        )}
      </div>

      {/* ── Library + Analyses launcher ── */}
      <div className="wkgrid g2" style={{ gap: 16, marginTop: 34 }}>
        {/* Library — recent work product */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
            <div className="wksec-title" style={{ marginBottom: 2 }}>Recent work</div>
            <button type="button" onClick={() => openTab({ kind: "mode-root", modeId: "files", id: "files-root", title: "Files", pinned: true })} style={{ all: "unset", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.04em", color: "var(--accent-strong)" }}>Open Files →</button>
          </div>
          <p style={{ color: "var(--ink-2)", fontSize: "0.88rem", margin: "0 0 14px" }}>Docs and analyses Yulia produced.</p>
          {workspace.loading ? (
            <YuliaSkeleton rows={3} label="Loading files…" />
          ) : recentFiles.length === 0 ? (
            <div className="wkcard" style={{ textAlign: "center", color: "var(--ink-2)" }}>
              <div className="wkcard-title">Nothing yet</div>
              <div className="wkcard-sub">Generated docs and analyses will collect here.</div>
            </div>
          ) : (
            <div className="wkcard" style={{ padding: 0, overflow: "hidden" }}>
              {recentFiles.map((f, i) => (
                <button
                  key={f.id}
                  type="button"
                  style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, width: "100%", boxSizing: "border-box", padding: "13px 16px", borderBottom: i === recentFiles.length - 1 ? "none" : "1px solid var(--line)" }}
                  onClick={() => openFile(f, openTab)}
                >
                  <span style={{ flex: "none", width: 32, height: 32, borderRadius: 9, background: "var(--surface-2)", display: "grid", placeItems: "center", color: "var(--ink-2)" }}>
                    <V6Icon name={isAnalysis(f) ? "chart" : "doc"} size={16} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", color: "var(--ink)", fontSize: "0.9rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name || prettySlug(f.slug)}</span>
                    <span style={{ display: "block", color: "var(--ink-3)", fontSize: "0.78rem" }}>{f.deal_name || "Deal"} · {statusLabel(f.status)}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Analyses launcher */}
        <div>
          <div className="wksec-title" style={{ marginBottom: 2 }}>Run an analysis</div>
          <p style={{ color: "var(--ink-2)", fontSize: "0.88rem", margin: "0 0 14px" }}>Valuation, QoE, LBO, working capital, and more.</p>
          <button
            type="button"
            onClick={() => openTab({ kind: "mode-root", modeId: "analysis", id: "analysis-root", title: "Analyses", pinned: true })}
            style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 13, width: "100%", boxSizing: "border-box", padding: "16px 18px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14 }}
          >
            <span style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: "grid", placeItems: "center", background: "var(--accent-soft)", color: "var(--accent-strong)" }}>
              <V6Icon name="chart" size={18} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontWeight: 700, fontSize: "0.98rem", color: "var(--ink)" }}>Analyses</span>
              <span style={{ display: "block", fontSize: "0.82rem", color: "var(--ink-3)", marginTop: 1 }}>Open the analyses hub</span>
            </span>
            <span style={{ color: "var(--accent-strong)" }} aria-hidden="true">›</span>
          </button>
        </div>
      </div>

      {/* ── Quick wins — conversation starters ── */}
      <div className="wksec" style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "20px 22px", display: "grid", gridTemplateColumns: "minmax(200px, 0.42fr) minmax(0, 1fr)", gap: 20, alignItems: "center", marginTop: 34 }}>
        <div style={{ fontSize: "1.2rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--ink)", lineHeight: 1.1 }}>Ask Yulia.</div>
        <div className="ynext" style={{ margin: 0 }}>
          {QUICK_WINS.map(prompt => (
            <button key={prompt} type="button" className="yn" onClick={() => ask(prompt)}>
              <span className="yn-t"><b>{prompt}</b></span>
              <span aria-hidden="true" style={{ marginLeft: "auto", color: "var(--accent-strong)" }}>↗</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function openFile(f: WorkspaceDeliverable, openTab: OpenTab) {
  if (f.analysis_run_id) {
    openTab({ kind: "analysis", id: `analysis-${f.analysis_run_id}`, title: f.name || prettySlug(f.slug), analysisRunId: f.analysis_run_id, tool: f.analysis_type ?? undefined, status: f.analysis_status ?? undefined });
    return;
  }
  openTab({ kind: "doc", id: String(f.id), title: f.name || prettySlug(f.slug) });
}

function isAnalysis(f: WorkspaceDeliverable): boolean {
  return !!f.analysis_run_id || /model|valuation|analysis|sba|comp|score|risk|tax|financial|qoe/i.test(`${f.slug || ""} ${f.name || ""}`);
}

function initials(value: string): string {
  return String(value || "").split(/\s+/).filter(Boolean).map(p => p[0]).slice(0, 2).join("").toUpperCase() || "··";
}

function verdictClass(status: string): string {
  const s = (status || "").toLowerCase();
  if (s.includes("pursue")) return "good";
  if (s.includes("pass") || s.includes("hold")) return "flag";
  return "review";
}

function fmtCents(cents: number | null | undefined): string {
  if (!cents) return "—";
  const d = cents / 100;
  if (d >= 1_000_000) return `$${(d / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (d >= 1_000) return `$${Math.round(d / 1_000)}K`;
  return `$${Math.round(d).toLocaleString()}`;
}

function prettySlug(slug: string): string {
  return (slug || "Untitled").replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function statusLabel(status: string): string {
  return (status || "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
