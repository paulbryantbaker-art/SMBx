/* ============================================================================
   NDApp — the agent-first desktop shell (the "nd" direction). A state-machine
   router (chat-is-home + Overview, deeper surfaces phased in) over the SAME
   real data + the SAME agent ChatBridge. Mounted behind localStorage
   smbx_shell="nd" at the top of V6AppShell; mobile/anon/marketing untouched.
   AGENT_DESKTOP_CUTOVER_PLAN.md — Phase 1 (flagship: Home + Overview).
   ============================================================================ */
import { useEffect, useMemo, useState } from "react";
import { authHeaders, type User } from "../../hooks/useAuth";
import { useV6WorkspaceData } from "../../hooks/useV6WorkspaceData";
import { useTodayOperatingBrief } from "../../hooks/useTodayOperatingBrief";
import { usePortfolioSummary } from "../../hooks/usePortfolioSummary";
import { realBlockers } from "../v6/shared/operatingPrimitives";
import type { ChatBridge } from "../v6/V6App";
import { Sidebar, type DealRef } from "./chrome";
import { Logo, YuliaMark, IconBtn, Ic, type PillTone } from "./primitives";
import { AskYuliaHome, type NeedItem, type IntelItem, type DealRowItem } from "./surfaces/AskYuliaHome";
import { OverviewPage, type OverviewDeal, type OverviewKpi, type OverviewSectorHeat, type OverviewNeedsYou, type OverviewActivity } from "./surfaces/OverviewPage";
import { NDYuliaChat } from "./NDYuliaChat";

interface MarketHeat { industry: string; score: number; label: string; peActivity?: string; multipleDirection?: string; signals?: string[] }
type Route = "home" | "overview" | "sourcing" | "analysis" | "closing" | "post";

/* ---- honest formatters (real or "—") ---- */
function fmtCents(c?: number | null): string {
  if (c == null || !isFinite(c)) return "—";
  const d = c / 100;
  if (d >= 1e9) return `$${(d / 1e9).toFixed(d >= 1e10 ? 0 : 1)}B`;
  if (d >= 1e6) return `$${(d / 1e6).toFixed(d >= 1e7 ? 0 : 1)}M`;
  if (d >= 1e3) return `$${(d / 1e3).toFixed(0)}K`;
  return `$${Math.round(d)}`;
}
function relTime(iso?: string): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const dy = Math.round(h / 24);
  return dy < 30 ? `${dy}d ago` : new Date(iso).toLocaleDateString();
}
/* map a deal's gate to the BUY lifecycle bucket the sidebar counts by */
function gateBucket(gate: string): "sourcing" | "analysis" | "closing" | "post" {
  const g = (gate || "").toLowerCase();
  if (/pmi|post|stabil|integrat|day\s*0|optimiz/.test(g)) return "post";
  if (/clos|struct|term|sign|fund|b5|b4|s5|r5|r4/.test(g)) return "closing";
  if (/valu|analy|financ|dilig|model|qoe|b2|b3|s2|s3|r2|r3/.test(g)) return "analysis";
  return "sourcing";
}
const BUCKET_IDX: Record<string, number> = { sourcing: 0, analysis: 1, closing: 2, post: 3 };

export function NDApp({ user, chat, onSignOut: _onSignOut }: { user: User | null; chat: ChatBridge; onSignOut: () => void }) {
  const [route, setRoute] = useState<Route>("home");
  const [railOpen, setRailOpen] = useState(false);

  const workspace = useV6WorkspaceData(user);
  const operating = useTodayOperatingBrief(user, !!user);
  const { summary } = usePortfolioSummary(user, !!user);
  const [heat, setHeat] = useState<MarketHeat[]>([]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetch("/api/intelligence/portfolio-heat", { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject(new Error()))
      .then((d: { heat?: MarketHeat[] }) => { if (!cancelled) setHeat(d.heat ?? []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.id]);

  // ⌘K toggles the Yulia rail
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setRailOpen(o => !o); }
      if (e.key === "Escape") setRailOpen(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const active = useMemo(() => workspace.deals.filter(d => (d.status || "").toLowerCase() === "active"), [workspace.deals]);
  const dealNameById = useMemo(() => { const m = new Map<string, string>(); for (const d of active) m.set(String(d.id), d.business_name || `Deal #${d.id}`); return m; }, [active]);
  const gateCountdown = operating.brief?.gateCountdown ?? [];

  /* real per-stage counts for the sidebar (never the prototype's sample numbers) */
  const counts = useMemo(() => {
    const c: Record<string, number> = { sourcing: 0, analysis: 0, closing: 0, post: 0 };
    for (const d of active) c[gateBucket(d.current_gate)]++;
    return c;
  }, [active]);

  const sidebarDeals: DealRef[] = active.slice(0, 8).map(d => ({
    name: d.business_name || `Deal #${d.id}`,
    sub: [d.industry, fmtCents(d.asking_price)].filter(Boolean).join(" · ") || "—",
    journey: (d.journey_type || "buy").toUpperCase(),
  }));

  /* ── HOME briefing (real) ── */
  const needs: NeedItem[] = gateCountdown.slice(0, 4).map(g => {
    const open = realBlockers(g.blockers);
    return { icon: "check", title: g.nextAction || `Advance ${g.gateName}`, deal: dealNameById.get(g.dealId) || `Deal ${g.dealId}`, stage: g.gateName || "—", sub: open.length ? `${open.length} open item${open.length === 1 ? "" : "s"}` : undefined, time: "", action: "Open", id: g.dealId };
  });
  const intel: IntelItem[] = heat.slice().sort((a, b) => b.score - a.score).slice(0, 2).map(h => ({
    title: `${h.industry} — ${h.label}`,
    sub: h.peActivity || (h.signals && h.signals[0]) || `${h.label} sector conditions`,
    affects: active.filter(d => (d.industry || "").toLowerCase().includes(h.industry.toLowerCase())).slice(0, 3).map(d => d.business_name).filter(Boolean).join(" · ") || "your portfolio",
    action: "See impact",
  }));
  const homeDeals: DealRowItem[] = active.slice(0, 4).map(d => ({
    name: d.business_name || `Deal #${d.id}`,
    target: d.industry || "—",
    idx: BUCKET_IDX[gateBucket(d.current_gate)] ?? 0,
    last: "Last updated",
    lastTime: relTime(d.updated_at),
    id: String(d.id),
  }));

  /* ── OVERVIEW (real; honest "—" where no backend) ── */
  const kpis: OverviewKpi[] = [
    { label: "Active mandates", value: summary ? String(summary.totalActive) : "—" },
    { label: "Aggregate EV", value: summary ? fmtCents(summary.totalEvCents) : "—" },
    { label: "Tasks due", value: String(gateCountdown.length), sub: gateCountdown.length ? "needs your sign-off" : undefined },
    { label: "Portfolio IRR", value: "—", empty: true, sub: "No live feed yet" },
  ];
  const ovDeals: OverviewDeal[] = active.slice(0, 12).map(d => {
    const oc = gateCountdown.find(g => g.dealId === String(d.id));
    const open = oc ? realBlockers(oc.blockers).length : 0;
    return {
      id: String(d.id), name: d.business_name || `Deal #${d.id}`,
      avatar: (d.business_name || "D").slice(0, 2).toUpperCase(), tone: "b",
      meta: [d.industry, d.location].filter(Boolean).join(" · ") || "—",
      journey: (d.journey_type || "buy").toUpperCase(),
      stage: oc?.gateName || d.current_gate || "—",
      statusTone: (open > 0 ? "warn" : "ok") as PillTone,
      ev: fmtCents(d.asking_price), openItems: `${open} open`,
      status: open > 0 ? "Needs you" : "On track",
    };
  });
  const sectorHeat: OverviewSectorHeat[] = heat.slice().sort((a, b) => b.score - a.score).slice(0, 5).map(h => ({
    label: h.industry,
    tone: (h.score >= 66 ? "ok" : h.score >= 33 ? "warn" : "neutral") as PillTone,
    heatLabel: h.label,
    pct: Math.max(6, Math.min(100, h.score)),
  }));
  const needsYou: OverviewNeedsYou[] = gateCountdown.slice(0, 4).map(g => ({
    title: g.nextAction || `Advance ${g.gateName}`,
    deal: `${dealNameById.get(g.dealId) || g.dealId} · ${g.gateName || "—"}`,
    time: "today",
    kind: realBlockers(g.blockers).length > 0 ? "warn" : "risk",
  }));
  // honest: a unified activity feed is a net-new backend → derive what's real (completed deliverables) or empty.
  const activity: OverviewActivity[] = (workspace.deliverables || [])
    .filter(d => (d.status || "").toLowerCase() === "complete")
    .slice(0, 5)
    .map(d => ({ who: "Yulia", act: "completed", obj: (d.name || d.slug || "an analysis").replace(/[-_]/g, " "), deal: dealNameById.get(String(d.deal_id)) || "", ago: "", kind: "yulia" as const }));

  const openDeal = (id: string) => { /* Phase 2: route to deal workspace */ chat.send(`Open the deal workspace for deal ${id} and give me your read.`); setRailOpen(true); setRoute("home"); };
  const ask = (prompt: string) => { chat.send(prompt); setRailOpen(true); };

  const scopeLabel = route === "home" ? "your portfolio" : route === "overview" ? "your portfolio" : route;

  return (
    <div className="nd-root">
      <Sidebar
        active={route}
        journey="BUY"
        counts={counts}
        deals={sidebarDeals}
        user={{ name: user?.email?.split("@")[0] || "Workspace", sub: "smbx.ai", live: true }}
        onHome={() => setRoute("home")}
        onNav={(key) => {
          if (key === "overview") setRoute("overview");
          else if (key === "sourcing" || key === "analysis" || key === "closing" || key === "post") setRoute(key);
          else if (key === "new") ask("I want to start a new deal — walk me through it.");
          else setRoute("home");
        }}
      />

      <div className="mck-grow" style={{ position: "relative", display: "flex", flexDirection: "column", minWidth: 0 }}>
        {route === "home" && (
          <AskYuliaHome
            userName={(user?.email?.split("@")[0] || "there").replace(/\b\w/, c => c.toUpperCase())}
            needs={needs}
            intel={intel}
            deals={homeDeals}
            suggestions={["Review what needs me", "What moved on my deals?", "Find new targets", "Draft a teaser"]}
            onAsk={ask}
            onOpenDeal={openDeal}
            onReview={() => setRailOpen(true)}
            onNav={(dest) => { if (dest === "overview") setRoute("overview"); }}
          />
        )}
        {route === "overview" && (
          <OverviewPage kpis={kpis} deals={ovDeals} sectorHeat={sectorHeat} needsYou={needsYou} activity={activity} onOpenDeal={openDeal} onAsk={() => setRailOpen(true)} />
        )}
        {(route === "sourcing" || route === "analysis" || route === "closing" || route === "post") && (
          <PhasePlaceholder route={route} onAsk={() => setRailOpen(true)} />
        )}

        {/* Yulia launcher (closed) */}
        {!railOpen && (
          <div className="mck-dock">
            <button className="mck-dock-pill" onClick={() => setRailOpen(true)}>
              <YuliaMark size={32} />
              <span className="mck-dock-label">Ask Yulia</span>
              <span className="mck-dock-kbd">⌘K</span>
            </button>
          </div>
        )}
      </div>

      {/* Yulia rail (open) — the live agent in the nd language */}
      {railOpen && (
        <>
          <div className="mck-scrim" onClick={() => setRailOpen(false)} />
          <div className="mck-ypanel">
            <div className="mck-row" style={{ gap: 10, padding: "14px 16px", borderBottom: "1px solid var(--line)" }}>
              <YuliaMark size={26} />
              <span style={{ fontWeight: 600, fontSize: 13.5 }}>Yulia</span>
              <span className="mck-grow" />
              <IconBtn name="x" size={16} onClick={() => setRailOpen(false)} title="Close" />
            </div>
            <div className="mck-grow" style={{ minHeight: 0 }}>
              <NDYuliaChat chat={chat} scope={scopeLabel} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PhasePlaceholder({ route, onAsk }: { route: string; onAsk: () => void }) {
  const label = { sourcing: "Sourcing", analysis: "Analysis", closing: "Closing", post: "Post-merger" }[route] || route;
  return (
    <div className="mck-grow mck-row" style={{ justifyContent: "center", padding: 40 }}>
      <div className="mck-empty" style={{ maxWidth: 420 }}>
        <span className="mck-empty-ic"><Ic name="agent" size={18} /></span>
        <div className="mck-empty-t">{label} lands next</div>
        <div className="mck-empty-s">This surface is on the cutover roadmap. In the meantime, ask Yulia to work on {label.toLowerCase()} for any deal.</div>
        <button className="mck-btn mck-btn-ink mck-btn-sm" style={{ marginTop: 4 }} onClick={onAsk}><Ic name="agent" size={14} />Ask Yulia</button>
      </div>
    </div>
  );
}
