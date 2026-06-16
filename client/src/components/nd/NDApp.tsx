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
import { useNextActions } from "../../hooks/useNextActions";
import { usePortfolioSummary } from "../../hooks/usePortfolioSummary";
import { realBlockers } from "../v6/shared/operatingPrimitives";
import type { ChatBridge } from "../v6/V6App";
import { Sidebar, type DealRef } from "./chrome";
import { YuliaMark, IconBtn, Ic, type PillTone, type IcName } from "./primitives";
import { AskYuliaHome, type NeedItem, type IntelItem, type DealRowItem } from "./surfaces/AskYuliaHome";
import { OverviewPage, type OverviewDeal, type OverviewKpi, type OverviewSectorHeat, type OverviewNeedsYou, type OverviewActivity } from "./surfaces/OverviewPage";
import { StageDeals, type StageDealItem } from "./surfaces/StageDeals";
import { NDSourcing } from "./surfaces/NDSourcing";
import { NDCanvas, type NDArtifact } from "./NDCanvas";
import { NDYuliaChat } from "./NDYuliaChat";
import { NDDealWorkspace } from "./NDDealWorkspace";

/** "EnterpriseValue" / "ebitda_multiple" → "Enterprise value" / "Ebitda multiple" */
function humanizeKey(k: string): string {
  return k.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").replace(/^\w/, c => c.toUpperCase()).trim();
}

const STAGE_META: Record<string, { label: string; icon: IcName }> = {
  sourcing: { label: "Sourcing", icon: "st_source" },
  analysis: { label: "Analysis", icon: "st_analyze" },
  closing: { label: "Closing", icon: "st_close" },
  post: { label: "Post-merger", icon: "st_post" },
};

interface MarketHeat { industry: string; score: number; label: string; peActivity?: string; multipleDirection?: string; signals?: string[] }
type Route = "home" | "overview" | "deal" | "sourcing" | "analysis" | "closing" | "post";

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
  const [dealId, setDealId] = useState<string | null>(null);
  const [railOpen, setRailOpen] = useState(false);
  const [artifacts, setArtifacts] = useState<NDArtifact[]>([]);
  const [activeArtifact, setActiveArtifact] = useState<string>("surface");
  // Sourcing nav has two views: the off-market engine (theses→candidates) and the in-pipeline deal list
  const [sourcingView, setSourcingView] = useState<"engine" | "pipeline">("engine");

  const workspace = useV6WorkspaceData(user);
  const operating = useTodayOperatingBrief(user, !!user);
  const { actions: nextActions } = useNextActions(user, !!user);
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
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  /* ── canvas_action bus: when Yulia opens an artifact, render it on the canvas
     beside the chat. show_content → markdown doc/analysis; model verbs → the real
     assumptions she set (read-only). Honest: nothing is fabricated. ── */
  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail as Record<string, any> | undefined;
      if (!d || !d.canvas_action) return;
      const upsert = (art: NDArtifact) => {
        setArtifacts(prev => {
          const i = prev.findIndex(a => a.key === art.key);
          if (i >= 0) { const next = [...prev]; next[i] = art; return next; }
          return [...prev, art];
        });
        setActiveArtifact(art.key);
        setRailOpen(true);
      };
      const verb = d.canvas_action;
      if (verb === "show_content") {
        const key = String(d.tabId || d.title || `doc-${Date.now()}`);
        const kind: NDArtifact["kind"] = /analysis|brief|memo|valuation/i.test(String(d.title || d.kind || "")) ? "analysis" : "doc";
        upsert({ key, kind, title: String(d.title || "Yulia artifact"), markdown: String(d.content || d.markdown || d.message || "") });
      } else if (verb === "create_model_tab" || verb === "update_model" || verb === "open_tab") {
        const key = String(d.tabId || d.tab || `model-${Date.now()}`);
        const assumptions = (d.initialAssumptions && typeof d.initialAssumptions === "object" ? d.initialAssumptions
          : d.updates && typeof d.updates === "object" ? d.updates
          : d.state && typeof d.state === "object" ? d.state : {}) as Record<string, unknown>;
        const kv = Object.entries(assumptions).slice(0, 14).map(([k, v]) => ({ k: humanizeKey(k), v: String(v) }));
        upsert({
          key, kind: "model",
          title: String(d.title || d.modelType || "Model"),
          kv,
          note: "Yulia maintains this model. The assumptions she set are shown above; the fully interactive model (live sliders) opens in the deal's Model tab.",
        });
      }
    };
    window.addEventListener("smbx:canvas_action", handler);
    return () => window.removeEventListener("smbx:canvas_action", handler);
  }, []);

  const closeArtifact = (key: string) => {
    setArtifacts(prev => {
      const next = prev.filter(a => a.key !== key);
      setActiveArtifact(cur => (cur === key ? (next.length ? next[next.length - 1].key : "surface") : cur));
      return next;
    });
  };

  const active = useMemo(() => workspace.deals.filter(d => (d.status || "").toLowerCase() === "active"), [workspace.deals]);
  const dealNameById = useMemo(() => { const m = new Map<string, string>(); for (const d of active) m.set(String(d.id), d.business_name || `Deal #${d.id}`); return m; }, [active]);
  const gateCountdown = operating.brief?.gateCountdown ?? [];

  /* ── "Needs you" is computed from TWO engines, not one. The operating brief's
     gateCountdown only surfaces blockers for deals that already have DEFINITIVE
     DealState snapshots or model runs; an ordinary app-created deal (e.g. a fresh
     SELL deal sitting at S0) has neither, so its blockers collapse to the
     server's 'No blocker surfaced' placeholder and the deal wrongly reads
     "On track" / "0 things need you". GET /api/user/next-actions is the
     deterministic gate-readiness engine (already used on mobile): it reads each
     deal's real missing gate inputs (industry, revenue, thesis, capital…) plus
     pending reviews — no DealState required. We treat it as authoritative per
     deal and fall back to the brief's blockers only for deals it didn't rank. ── */
  const dealActions = useMemo(
    () => nextActions.filter(a => a.dealId != null && !a.id.endsWith("-advance")),
    [nextActions],
  );
  // per-deal count of real open work from the engine (an "-advance" action = ready to advance → 0 open)
  const actionCountByDeal = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of nextActions) {
      if (a.dealId == null) continue;
      const id = String(a.dealId);
      m.set(id, (m.get(id) ?? 0) + (a.id.endsWith("-advance") ? 0 : 1));
    }
    return m;
  }, [nextActions]);
  // deals the engine spoke for at all — so we never double-count brief blockers for them
  const engineDeals = useMemo(
    () => new Set(nextActions.filter(a => a.dealId != null).map(a => String(a.dealId))),
    [nextActions],
  );
  const gateNameByDeal = useMemo(() => {
    const m = new Map<string, string>();
    for (const g of gateCountdown) m.set(g.dealId, g.gateName || g.gateId);
    return m;
  }, [gateCountdown]);
  // open-work count for one deal: engine-authoritative, else the brief's real blockers
  const openCountFor = (id: string): number => {
    const fromEngine = actionCountByDeal.get(id);
    if (fromEngine != null) return fromEngine;
    const g = gateCountdown.find(x => x.dealId === id);
    return g ? realBlockers(g.blockers).length : 0;
  };
  const totalOpen = useMemo(
    () => active.reduce((sum, d) => sum + openCountFor(String(d.id)), 0),
    [active, actionCountByDeal, gateCountdown],
  );

  /* real per-stage counts for the sidebar (never the prototype's sample numbers) */
  const counts = useMemo(() => {
    const c: Record<string, number> = { sourcing: 0, analysis: 0, closing: 0, post: 0 };
    for (const d of active) c[gateBucket(d.current_gate)]++;
    return c;
  }, [active]);

  const sidebarDeals: DealRef[] = active.slice(0, 8).map(d => ({
    id: String(d.id),
    name: d.business_name || `Deal #${d.id}`,
    sub: [d.industry, fmtCents(d.asking_price)].filter(Boolean).join(" · ") || "—",
    journey: (d.journey_type || "buy").toUpperCase(),
  }));

  /* ── HOME briefing (real) ── */
  /* "Needs your attention" — the gate-readiness engine's concrete items first
     (real missing inputs / pending reviews), then any agent-driven blockers
     for deals the engine didn't rank (DealState gaps, model reruns). */
  const needs: NeedItem[] = useMemo(() => {
    const fromActions: NeedItem[] = dealActions.map(a => {
      const id = a.dealId != null ? String(a.dealId) : undefined;
      return {
        icon: "check" as IcName,
        title: a.title,
        deal: a.dealName || (id ? dealNameById.get(id) : undefined) || `Deal ${a.dealId}`,
        stage: (id && gateNameByDeal.get(id)) || a.currentGate || "—",
        sub: a.description || undefined,
        time: "",
        action: a.cta || "Open",
        id,
      };
    });
    const fromBlockers: NeedItem[] = gateCountdown
      .filter(g => !engineDeals.has(g.dealId) && realBlockers(g.blockers).length > 0)
      .map(g => {
        const open = realBlockers(g.blockers);
        return {
          icon: "check" as IcName,
          title: g.nextAction || `Advance ${g.gateName}`,
          deal: dealNameById.get(g.dealId) || `Deal ${g.dealId}`,
          stage: g.gateName || "—",
          sub: `${open.length} open item${open.length === 1 ? "" : "s"}`,
          time: "",
          action: "Open",
          id: g.dealId,
        };
      });
    return [...fromActions, ...fromBlockers].slice(0, 4);
  }, [dealActions, gateCountdown, engineDeals, dealNameById, gateNameByDeal]);
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
    { label: "Tasks due", value: String(totalOpen), sub: totalOpen ? "across your pipeline" : undefined },
    { label: "Portfolio IRR", value: "—", empty: true, sub: "No live feed yet" },
  ];
  const ovDeals: OverviewDeal[] = active.slice(0, 12).map(d => {
    const oc = gateCountdown.find(g => g.dealId === String(d.id));
    const open = openCountFor(String(d.id));
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
  // Same two-engine union as the home "needs" list, in the overview's shape.
  const needsYou: OverviewNeedsYou[] = useMemo(() => {
    const fromActions: OverviewNeedsYou[] = dealActions.map(a => {
      const id = a.dealId != null ? String(a.dealId) : undefined;
      return {
        id,
        title: a.title,
        deal: `${a.dealName || (id ? dealNameById.get(id) : undefined) || a.dealId} · ${(id && gateNameByDeal.get(id)) || a.currentGate || "—"}`,
        time: "today",
        // a blocked review → red "risk"; a missing-input next action → amber "warn"
        kind: a.id.startsWith("review-") ? "risk" : "warn",
      };
    });
    const fromBlockers: OverviewNeedsYou[] = gateCountdown
      .filter(g => !engineDeals.has(g.dealId) && realBlockers(g.blockers).length > 0)
      .map(g => ({
        id: g.dealId,
        title: g.nextAction || `Advance ${g.gateName}`,
        deal: `${dealNameById.get(g.dealId) || g.dealId} · ${g.gateName || "—"}`,
        time: "today",
        kind: "risk" as const,
      }));
    return [...fromActions, ...fromBlockers].slice(0, 4);
  }, [dealActions, gateCountdown, engineDeals, dealNameById, gateNameByDeal]);
  // honest: a unified activity feed is a net-new backend → derive what's real (completed deliverables) or empty.
  const activity: OverviewActivity[] = (workspace.deliverables || [])
    .filter(d => (d.status || "").toLowerCase() === "complete")
    .slice(0, 5)
    .map(d => ({ who: "Yulia", act: "completed", obj: (d.name || d.slug || "an analysis").replace(/[-_]/g, " "), deal: dealNameById.get(String(d.deal_id)) || "", ago: "", kind: "yulia" as const }));

  /* ── LIFECYCLE STAGE (real deals filtered to the stage bucket, needs-you first) ── */
  const stageDeals: StageDealItem[] = useMemo(() => {
    if (!(route === "sourcing" || route === "analysis" || route === "closing" || route === "post")) return [];
    return active
      .filter(d => gateBucket(d.current_gate) === route)
      .map(d => {
        const oc = gateCountdown.find(g => g.dealId === String(d.id));
        const open = openCountFor(String(d.id));
        return {
          id: String(d.id),
          name: d.business_name || `Deal #${d.id}`,
          avatar: (d.business_name || "D").slice(0, 2).toUpperCase(),
          tone: "b",
          meta: [d.industry, d.location].filter(Boolean).join(" · ") || "—",
          journey: (d.journey_type || "buy").toUpperCase(),
          stage: oc?.gateName || d.current_gate || "—",
          ev: fmtCents(d.asking_price),
          openItems: open > 0 ? `${open} open` : "—",
          status: open > 0 ? "Needs you" : "On track",
          statusTone: (open > 0 ? "warn" : "ok") as PillTone,
        };
      })
      .sort((a, b) => (a.status === "Needs you" ? 0 : 1) - (b.status === "Needs you" ? 0 : 1));
  }, [route, active, gateCountdown, actionCountByDeal]);

  const openDeal = (id: string) => { setDealId(id); setRoute("deal"); };
  const ask = (prompt: string) => { chat.send(prompt); setRailOpen(true); };

  const scopeLabel = route === "home" ? "your portfolio" : route === "overview" ? "your portfolio" : route;
  const surfaceLabel = route === "home" ? "Ask Yulia" : route === "overview" ? "Overview" : route === "deal" ? "Deal" : STAGE_META[route]?.label || "Workspace";

  /* the current surface, rendered either full-width or as the canvas-left in the split */
  const surfaceNode = (
    <>
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
      {route === "deal" && dealId && (
        <NDDealWorkspace dealId={dealId} user={user} chat={chat} onAsk={ask} />
      )}
      {route === "sourcing" && (
        sourcingView === "pipeline" ? (
          <div className="mck-col mck-grow" style={{ minWidth: 0, height: "100%" }}>
            <div className="mck-row" style={{ gap: 12, height: 48, flex: "0 0 48px", padding: "0 20px", borderBottom: "1px solid var(--line)" }}>
              <button className="mck-btn mck-btn-ghost mck-btn-sm" onClick={() => setSourcingView("engine")}><Ic name="back" size={13} />Off-market sourcing</button>
              <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>Deals already in the sourcing stage</span>
            </div>
            <StageDeals
              label={STAGE_META.sourcing.label}
              icon={STAGE_META.sourcing.icon}
              lede={stageDeals.length ? `${stageDeals.length} ${stageDeals.length === 1 ? "deal is" : "deals are"} in the sourcing stage${stageDeals.some(d => d.status === "Needs you") ? " — ranked by what needs you first." : "."}` : undefined}
              deals={stageDeals}
              onOpenDeal={openDeal}
              onAsk={ask}
            />
          </div>
        ) : (
          <NDSourcing user={user} onAsk={ask} stageDealsCount={stageDeals.length} onOpenStageDeals={() => setSourcingView("pipeline")} />
        )
      )}
      {(route === "analysis" || route === "closing" || route === "post") && (
        <StageDeals
          label={STAGE_META[route].label}
          icon={STAGE_META[route].icon}
          lede={stageDeals.length
            ? `${stageDeals.length} ${stageDeals.length === 1 ? "deal is" : "deals are"} in the ${STAGE_META[route].label.toLowerCase()} stage${stageDeals.some(d => d.status === "Needs you") ? " — ranked by what needs you first." : "."}`
            : undefined}
          deals={stageDeals}
          onOpenDeal={openDeal}
          onAsk={ask}
        />
      )}
    </>
  );

  const hasCanvas = railOpen && artifacts.length > 0;

  return (
    <div className="nd-root">
      <Sidebar
        active={route}
        journey="BUY"
        counts={counts}
        deals={sidebarDeals}
        user={{ name: user?.email?.split("@")[0] || "Workspace", sub: "smbx.ai", live: true }}
        onHome={() => setRoute("home")}
        onOpenDeal={openDeal}
        onNav={(key) => {
          if (key === "overview") setRoute("overview");
          else if (key === "sourcing") { setSourcingView("engine"); setRoute("sourcing"); }
          else if (key === "analysis" || key === "closing" || key === "post") setRoute(key);
          else if (key === "new") ask("I want to start a new deal — walk me through it.");
          else setRoute("home");
        }}
      />

      {/* main region: canvas (left) + Yulia chat (right rail, inline when open).
          Plain stretch-row — NOT .mck-row, which centers children vertically. */}
      <div className="mck-grow" style={{ display: "flex", flexDirection: "row", alignItems: "stretch", minWidth: 0, minHeight: 0 }}>
        <div className="mck-grow" style={{ position: "relative", display: "flex", flexDirection: "column", minWidth: 0 }}>
          {hasCanvas
            ? <NDCanvas surfaceLabel={surfaceLabel} surface={surfaceNode} artifacts={artifacts} active={activeArtifact} onSelect={setActiveArtifact} onClose={closeArtifact} />
            : surfaceNode}

          {/* Yulia launcher (rail closed) */}
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

        {/* Yulia chat rail (inline) */}
        {railOpen && (
          <div className="mck-ychat">
            <div className="mck-row" style={{ gap: 10, padding: "14px 16px", borderBottom: "1px solid var(--line)", flex: "0 0 auto" }}>
              <YuliaMark size={26} />
              <span style={{ fontWeight: 600, fontSize: 13.5 }}>Yulia</span>
              <span className="mck-pill mck-pill-neutral" style={{ marginLeft: 2 }}>{surfaceLabel}</span>
              <span className="mck-grow" />
              <IconBtn name="x" size={16} onClick={() => setRailOpen(false)} title="Close" />
            </div>
            <div className="mck-grow" style={{ minHeight: 0 }}>
              <NDYuliaChat chat={chat} scope={scopeLabel} userName={(user?.email?.split("@")[0] || "You").replace(/\b\w/, c => c.toUpperCase())} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

