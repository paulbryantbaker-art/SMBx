/**
 * Desktop Today — SAME information as mobile Today, in desktop UI.
 * Pulls from the IDENTICAL data hooks mobile uses so the two cannot diverge:
 *   - useMobileDeals (featured hero deal + today pipeline rows)
 *   - copyFor(audience).todayTips (the quick-win chips)
 *   - /api/agency/portfolio-brief (market intelligence)
 *   - useV6WorkspaceData (recent work)
 * Same card set / order as mobile: Daily hero · Market intelligence ·
 * Today's quick wins · Recent work · Analyses · Deals in motion.
 */
import { useEffect, useState } from "react";
import { authHeaders, type User } from "../../../hooks/useAuth";
import { useMobileDeals, type MobilePipelineRow } from "../../../hooks/useMobileDeals";
import { useAudience } from "../../../hooks/useAudience";
import { copyFor } from "../../../lib/copy";
import { useV6WorkspaceData, type WorkspaceDeliverable } from "../../../hooks/useV6WorkspaceData";
import { useDerivedDisplay } from "../shared/useDerivedDisplay";
import { YuliaSkeleton } from "../shared/YuliaSkeleton";
import { V6Icon } from "../icons";
import type { OpenTab } from "../types";

interface BriefMarketIntel { headline: string; subhead: string; bullets: string[]; sourceCount: number; confidence: string; }
interface PortfolioBrief { marketIntelligence?: BriefMarketIntel }

interface TodayRootProps {
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
  user: User | null;
}

export function V6TodayRoot({ openTab, onTalkToYulia, user }: TodayRootProps) {
  const deals = useMobileDeals(user);
  const { audience } = useAudience(user);
  const C = copyFor(audience);
  const workspace = useV6WorkspaceData(user);
  const [brief, setBrief] = useState<PortfolioBrief | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);

  useEffect(() => {
    if (!user) { setBrief(null); setBriefLoading(false); return; }
    let cancelled = false;
    setBriefLoading(true);
    fetch("/api/agency/portfolio-brief", { headers: authHeaders() })
      .then(res => res.ok ? res.json() : Promise.reject(new Error(`brief ${res.status}`)))
      .then((next: PortfolioBrief) => { if (!cancelled) setBrief(next); })
      .catch(() => { if (!cancelled) setBrief(null); })
      .finally(() => { if (!cancelled) setBriefLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id]);

  const ask = (prompt: string) => onTalkToYulia?.(prompt);
  const openDeal = (rawId: number, title: string) => openTab({ kind: "deal", id: String(rawId), title });
  const openAllDeals = () => openTab({ id: "deals-all", kind: "deals-list", title: "All deals", dealsListView: "all" });

  const featured = deals.featured;           // strongest source this week (same as mobile)
  // DERIVE: the FIT score never hard-swaps — it settles via useDerivedDisplay
  // and flashes the one-shot .wk-tick when the skeleton resolves into data or
  // the fit changes. Empty string while loading = nothing animates from zero.
  // Honesty gate: synthetic (id-hash) fits may order deals but never display.
  const fitDisplay = useDerivedDisplay(featured && featured.fitIsReal ? String(featured.fit) : "");
  const todayRows = deals.today;             // pipeline rows (same as mobile)
  const intel = brief?.marketIntelligence ?? null;
  const recentFiles = workspace.deliverables.slice(0, 4);
  const dealsLoading = deals.isAuthed && deals.loading && !deals.loaded;
  const briefAnalyzing = !!user && briefLoading && !brief;

  return (
    <div className="wk-content m-fade-up m-page-flow" style={{ maxWidth: 1180, margin: "0 auto" }}>
      <div className="pg-head">
        <div>
          <div className="pg-title">Today</div>
          <p className="pg-sub">{C.todayHeroTag}</p>
        </div>
      </div>

      {/* ── Daily hero + Market intelligence ── */}
      <div className="wkgrid g2" style={{ gap: 16, marginTop: 4 }}>
        {/* Daily hero — the strongest source this week (deals.featured) */}
        <div className="wkcard" style={{ display: "flex", flexDirection: "column", gap: 16, minHeight: 200 }}>
          {/* Working Paper inversion: the deal name is the masthead, not this label */}
          <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--ink-2)", lineHeight: 1.2 }}>Strongest source this week</div>
          {dealsLoading ? (
            <YuliaSkeleton rows={2} label="Yulia is reading your deals…" />
          ) : featured ? (
            <>
              <button
                type="button"
                style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 13, padding: "14px 16px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 14, boxSizing: "border-box" }}
                onClick={() => openDeal(featured.rawId, featured.name)}
              >
                <span className="logo" style={{ width: 44, height: 44 }}>{initials(featured.name)}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="wk-masthead" style={{ display: "block", color: "var(--ink)", fontSize: 30, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{featured.name}</span>
                  <span style={{ display: "block", color: "var(--ink-3)", fontSize: "0.82rem", marginTop: 3 }}>{featured.sub}</span>
                </span>
                {featured.fitIsReal && (
                  <span style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={{ display: "block", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-strong)", fontSize: 32, lineHeight: 1 }}>
                      {fitDisplay.text}
                      <i className={`wk-tick${fitDisplay.justSettled ? " on" : ""}`} aria-hidden="true">✓</i>
                    </span>
                    <span style={{ display: "block", fontSize: "0.66rem", color: "var(--ink-3)", fontWeight: 600 }}>Fit</span>
                  </span>
                )}
              </button>
              <div style={{ display: "flex", gap: 9, marginTop: "auto" }}>
                <button className="wkbtn primary" type="button" onClick={() => openDeal(featured.rawId, featured.name)}>Open deal</button>
                <button className="wkbtn" type="button" onClick={() => ask(`Give me your read on ${featured.name}: verdict, risks, and the next move.`)}>Ask Yulia</button>
              </div>
            </>
          ) : (
            <>
              <p style={{ color: "var(--ink-2)", fontSize: "0.9rem", lineHeight: 1.5, margin: 0 }}>
                Yulia will surface your strongest source here once you have deals in motion.
              </p>
              <button className="wkbtn primary" type="button" style={{ marginTop: "auto", alignSelf: "flex-start" }} onClick={() => ask("Help me start or source my first deal.")}>Start with Yulia</button>
            </>
          )}
        </div>

        {/* Market intelligence */}
        <div className="wkcard" style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 200 }}>
          <div style={{ fontSize: "1.15rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--ink)", lineHeight: 1.1 }}>Market intelligence</div>
          {briefAnalyzing ? (
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

      {/* ── Today's quick wins (copyFor(audience).todayTips) + Recent work ── */}
      <div className="wkgrid g2" style={{ gap: 16, marginTop: 16 }}>
        <div className="wkcard" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: "1.15rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--ink)", lineHeight: 1.1 }}>Today's quick wins</div>
          <p style={{ color: "var(--ink-2)", fontSize: "0.84rem", margin: "4px 0 10px" }}>Things Yulia can do for you right now.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {C.todayTips.map(tip => (
              <button
                key={tip.label}
                type="button"
                style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 10, boxSizing: "border-box" }}
                onClick={() => ask(tip.prompt)}
              >
                <span style={{ flex: 1, minWidth: 0, color: "var(--ink)", fontWeight: 600, fontSize: "0.9rem" }}>{tip.label}</span>
                <span style={{ color: "var(--accent-strong)" }} aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
        </div>

        <div className="wkcard" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
            <div style={{ fontSize: "1.15rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--ink)", lineHeight: 1.1 }}>Recent work</div>
            <button type="button" onClick={() => openTab({ kind: "mode-root", modeId: "files", id: "files-root", title: "Files", pinned: true })} style={{ all: "unset", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.04em", color: "var(--accent-strong)" }}>Open Files →</button>
          </div>
          <p style={{ color: "var(--ink-2)", fontSize: "0.84rem", margin: "4px 0 10px" }}>Docs and analyses Yulia produced.</p>
          {workspace.loading ? (
            <YuliaSkeleton rows={3} label="Loading files…" />
          ) : recentFiles.length === 0 ? (
            <div style={{ color: "var(--ink-2)", fontSize: "0.85rem", padding: "8px 0" }}>Generated docs and analyses will collect here.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {recentFiles.map(f => (
                <button
                  key={f.id}
                  type="button"
                  style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, padding: "10px 4px", boxSizing: "border-box", borderBottom: "1px solid var(--line)" }}
                  onClick={() => openFile(f, openTab)}
                >
                  <span style={{ flex: "none", width: 30, height: 30, borderRadius: 8, background: "var(--surface-2)", display: "grid", placeItems: "center", color: "var(--ink-2)" }}>
                    <V6Icon name={isAnalysis(f) ? "chart" : "doc"} size={15} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", color: "var(--ink)", fontSize: "0.88rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name || prettySlug(f.slug)}</span>
                    <span style={{ display: "block", color: "var(--ink-3)", fontSize: "0.76rem" }}>{f.deal_name || "Deal"} · {statusLabel(f.status)}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Analyses launcher ── */}
      <div className="wksec">
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
            <span style={{ display: "block", fontSize: "0.82rem", color: "var(--ink-3)", marginTop: 1 }}>Valuation, QoE, LBO, working capital &amp; more</span>
          </span>
          <span style={{ color: "var(--accent-strong)" }} aria-hidden="true">›</span>
        </button>
      </div>

      {/* ── Deals in motion (deals.today — same 10 rows as mobile) ──
          The HEADER itself is the affordance into the full deals list
          (same destination as the See all link), mirroring mobile's
          tappable SectionHeader-with-chevron. */}
      <div className="wksec">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
          <button
            type="button"
            onClick={openAllDeals}
            aria-label="See all deals"
            style={{ all: "unset", cursor: "pointer", display: "inline-flex", alignItems: "baseline", gap: 7, minWidth: 0 }}
          >
            <span className="wksec-title" style={{ marginBottom: 2 }}>{C.todayIntelTitle}</span>
            <span aria-hidden="true" style={{ color: "var(--accent-strong)", fontWeight: 600 }}>›</span>
          </button>
          <button
            type="button"
            onClick={openAllDeals}
            style={{ all: "unset", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.04em", color: "var(--accent-strong)", whiteSpace: "nowrap" }}
          >
            See all →
          </button>
        </div>
        <p style={{ color: "var(--ink-2)", fontSize: "0.88rem", margin: "0 0 14px" }}>{C.todayIntelSub}</p>

        {dealsLoading ? (
          <YuliaSkeleton rows={3} label="Yulia is reading your deals…" />
        ) : todayRows.length === 0 ? (
          <div className="wkcard" style={{ textAlign: "center", color: "var(--ink-2)" }}>
            <div className="wkcard-title">No deals yet</div>
            <div className="wkcard-sub">Start with a deal, thesis, or source file and Yulia will read it here.</div>
            <button className="wkbtn dark" type="button" style={{ marginTop: 14 }} onClick={() => ask("Help me start my first deal.")}>Start with Yulia</button>
          </div>
        ) : (
          <div className="wkcard" style={{ padding: 0, overflow: "hidden" }}>
            {todayRows.map((row, i) => (
              <PipelineRow key={row.id} row={row} last={i === todayRows.length - 1} onOpen={() => openDeal(row.rawId, row.name)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PipelineRow({ row, last, onOpen }: { row: MobilePipelineRow; last: boolean; onOpen: () => void }) {
  const verdict = (row as any).verdict as string | undefined;
  return (
    <button
      type="button"
      style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, width: "100%", boxSizing: "border-box", padding: "14px 18px", borderBottom: last ? "none" : "1px solid var(--line)" }}
      onClick={onOpen}
    >
      <span className="logo">{initials(row.name)}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", color: "var(--ink)", fontWeight: 600, fontSize: "0.92rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.name}</span>
        <span style={{ display: "block", color: "var(--ink-3)", fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.sub}</span>
      </span>
      {verdict
        ? <span className={`statpill ${verdictClass(verdict)}`}><span className="d" />{capitalize(verdict)}</span>
        : (row as any).price
          ? <span className="statpill review"><span className="d" />{(row as any).price}</span>
          : null}
    </button>
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

function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function verdictClass(status: string): string {
  const s = (status || "").toLowerCase();
  if (s.includes("pursue")) return "good";
  if (s.includes("pass") || s.includes("hold")) return "flag";
  return "review";
}

function prettySlug(slug: string): string {
  return (slug || "Untitled").replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function statusLabel(status: string): string {
  return (status || "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
