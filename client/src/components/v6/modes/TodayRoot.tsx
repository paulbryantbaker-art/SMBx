import { useEffect, useMemo, useState } from "react";
import { authHeaders, type User } from "../../../hooks/useAuth";
import { useHomeDeals, type HomeDeal } from "../../../hooks/useHomeDeals";
import { useNextActions } from "../../../hooks/useNextActions";
import { useNotifications, notifTimeAgo } from "../../../hooks/useNotifications";
import { useTodayOperatingBrief, type TodayDealPulseItem, type TodayDefinitiveDealState } from "../../../hooks/useTodayOperatingBrief";
import { YuliaSkeleton } from "../shared/YuliaSkeleton";
import { useV6WorkspaceData, type WorkspaceDeliverable } from "../../../hooks/useV6WorkspaceData";
import { PIPELINE_STAGES, stageForGate, type PipelineStageId } from "../../../lib/pipelineStages";
import type { OpenTab } from "../types";
import { V6Icon } from "../icons";

type Tone = "gold" | "cactus" | "oat" | "plum" | "charcoal";

interface TodayDeal {
  id: string;
  title: string;
  meta: string;
  thesis: string;
  status: string;
  fit: number;
  sde: string;
  multiple: string;
  tone: Tone;
  definitive?: TodayDefinitiveDealState;
}

// One row in the single "What needs you today" feed.
interface FeedRow {
  key: string;
  title: string;
  sub: string;
  cta: string;
  onClick: () => void;
}

// ── Sample data (logged-out / no-fetch only) ────────────────────────────────
const DEALS: TodayDeal[] = [
  { id: "deal-bigfake", title: "Big Fake Deal", meta: "$5.4M · East Texas · industrial services", thesis: "IOI is ready, but the working-cap target still wants one tighter sentence.", status: "Pursue", fit: 92, sde: "$1.80M", multiple: "7.0x", tone: "cactus" },
  { id: "deal-pest", title: "Pest Control · FL", meta: "$2.1M · recurring route density", thesis: "Monthly contracts look real. Ask for churn by route before you move it up.", status: "Pursue", fit: 88, sde: "$1.40M", multiple: "6.5x", tone: "gold" },
  { id: "deal-hvac", title: "HVAC platform · CO", meta: "$4.8M · service mix under review", thesis: "Clean enough to keep watching. Succession risk is still the story.", status: "Watch", fit: 71, sde: "$0.95M", multiple: "6.8x", tone: "oat" },
];

interface TodayFile {
  kind: "doc" | "chart";
  title: string;
  sub: string;
  status: string;
  tone: Tone;
  id?: string;
}

const FILES: TodayFile[] = [
  { kind: "doc", title: "IOI draft · v3", sub: "Yulia · updated 2 min ago", status: "Review", tone: "gold" },
  { kind: "doc", title: "Buyer fit memo", sub: "You · 1 hr ago · 4 pages", status: "Open", tone: "plum" },
  { kind: "doc", title: "Mutual NDA · seller counsel", sub: "Data room · 2 markups", status: "In review", tone: "cactus" },
  { kind: "chart", title: "2024 P&L · audited", sub: "Data room · locked artifact", status: "View", tone: "oat" },
];

const QUICK_STARTS = [
  "What is worth my next 10 minutes?",
  "Give me the portfolio read — market, buyers, risks.",
  "Which deals are stalling and why?",
  "Show files that need my eye.",
];

// Server brief shapes (enrichment for hero copy + deal/file lists — may be empty,
// never gates the page).
interface PortfolioBriefHero { title: string; lede: string; primaryLabel: string; primaryPrompt?: string; secondaryLabel: string; secondaryDealId?: string; notes: { label: string; text: string }[]; }
interface PortfolioBrief {
  source: "live";
  generatedAt: string;
  hero: PortfolioBriefHero;
  files: TodayFile[];
  deals: TodayDeal[];
}

interface TodayRootProps {
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
  user: User | null;
}

function toneToStatpill(t: Tone): string {
  if (t === "gold") return "review";
  if (t === "cactus") return "diligence";
  if (t === "plum") return "diligence";
  return "missing";
}

export function V6TodayRoot({ openTab, onTalkToYulia, user }: TodayRootProps) {
  const home = useHomeDeals(user);
  const workspace = useV6WorkspaceData(user);
  const nextActions = useNextActions(user, workspace.canFetch);
  const notif = useNotifications(!!user && workspace.canFetch);
  const [portfolioBrief, setPortfolioBrief] = useState<PortfolioBrief | null>(null);
  const todayOperating = useTodayOperatingBrief(user, workspace.canFetch);

  useEffect(() => {
    if (!workspace.canFetch) {
      setPortfolioBrief(null);
      return;
    }
    let cancelled = false;
    fetch("/api/agency/portfolio-brief", { headers: authHeaders() })
      .then(res => res.ok ? res.json() : Promise.reject(new Error(`brief ${res.status}`)))
      .then((brief: PortfolioBrief) => { if (!cancelled) setPortfolioBrief(brief); })
      .catch(() => { if (!cancelled) setPortfolioBrief(null); });
    return () => { cancelled = true; };
  }, [workspace.canFetch, user?.id]);

  const useSampleData = !home.isAuthed || !workspace.canFetch;
  const showLoggedOutMarketing = !user && useSampleData;
  const realDeals = home.inReview.length > 0 ? home.inReview : home.picks;
  const liveBrief = useSampleData ? null : portfolioBrief;
  const operatingBrief = useSampleData ? null : todayOperating.brief;
  const operatingDeals = operatingBrief?.dealPulse ?? [];
  const operatingDealMap = useMemo(
    () => new Map(operatingDeals.map(item => [item.dealId, item])),
    [operatingDeals],
  );
  const deals = useSampleData
    ? DEALS
    : liveBrief?.deals.length
      ? liveBrief.deals.map(deal => ({ ...deal, definitive: operatingDealMap.get(deal.id)?.definitive }))
      : operatingDeals.length
        ? operatingDeals.slice(0, 5).map(operatingDealToTodayDeal)
        : realDeals.slice(0, 5).map(dealToTodayDeal);
  const files = useMemo<TodayFile[]>(
    () => {
      if (liveBrief?.files?.length) return liveBrief.files;
      return workspace.canFetch
        ? workspace.deliverables.slice(0, 5).map(deliverableToTodayFile)
        : FILES;
    },
    [liveBrief?.files, workspace.canFetch, workspace.deliverables],
  );

  // ── State selection ──
  const activeCount = useSampleData ? deals.length : home.totalActive;
  const closedCount = useSampleData ? 0 : home.totalClosed;
  const firstRun = !useSampleData && !home.loading && home.totalActive === 0;
  const single = !useSampleData && !home.loading && home.totalActive === 1;
  const lead = deals[0] ?? null;
  const leadTitle = lead?.title ?? "your first deal";
  const firstName = ((user as any)?.name || (user as any)?.displayName || "").toString().trim().split(/\s+/)[0] || "";

  // Real portfolio rollups (from /api/deals, always populated when authed)
  // Sum active-deal value (cents). Numeric columns arrive as STRINGS from
  // postgres-js, so coerce per-deal — a raw `+` would string-concatenate the
  // values into a giant string that overflows to Infinity ($InfinityB).
  const pipelineValue = useMemo(() => {
    let sum = 0;
    for (const d of home.all) {
      if (d.status !== "active") continue;
      const v = Number(d.asking_price ?? d.revenue ?? 0);
      if (Number.isFinite(v)) sum += v;
    }
    return sum;
  }, [home.all]);
  const stageCounts = useMemo(() => {
    const counts: Record<PipelineStageId, number> = { source: 0, value: 0, diligence: 0, structure: 0, close: 0 };
    for (const d of home.all) {
      if (d.status !== "active") continue;
      counts[stageForGate(d.current_gate)] += 1;
    }
    return counts;
  }, [home.all]);

  // ── Actions ──
  const ask = (prompt: string) => onTalkToYulia?.(prompt);

  const openDeal = (deal: TodayDeal | null = lead) => {
    if (!deal) { ask("Help me start my first SMBx deal workspace."); return; }
    openTab({ kind: "deal", id: deal.id, title: deal.title });
  };

  const openDoc = (title: string, id?: string) => {
    openTab({ kind: "doc", title, id: id ?? `doc-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` });
  };

  // ── "What needs you today" — the real next-steps feed. Source of truth is the
  // gate-aware next-actions engine (/api/user/next-actions). Deal-derived rows
  // are only a fallback for the brief moment before the engine responds (or if
  // it errors), so the section is never empty when you own deals. ──
  const feed: FeedRow[] = [];
  if (useSampleData) {
    for (const d of deals.slice(0, 3)) {
      feed.push({ key: `s-${d.id}`, title: `Review ${d.title}`, sub: d.thesis, cta: "Open", onClick: () => openDeal(d) });
    }
  } else if (nextActions.actions.length) {
    for (const a of nextActions.actions) {
      feed.push({
        key: a.id,
        title: a.title,
        sub: a.description,
        cta: a.cta,
        onClick: () => {
          if (a.prefill) ask(a.prefill);
          else if (a.dealId) openTab({ kind: "deal", id: String(a.dealId), title: a.dealName || `Deal #${a.dealId}` });
          else ask(a.title);
        },
      });
    }
  } else {
    const src = home.inReview.length ? home.inReview : home.picks;
    for (const d of src) {
      if (feed.length >= 5) break;
      feed.push({
        key: `d-${d.id}`,
        title: `Advance ${d.business_name || d.industry || `Deal #${d.id}`}`,
        sub: stageNextAction(stageForGate(d.current_gate)),
        cta: "Open deal",
        onClick: () => openTab({ kind: "deal", id: String(d.id), title: d.business_name || `Deal #${d.id}` }),
      });
    }
  }
  const feedItems = feed.slice(0, 6);
  const feedLoading = !useSampleData && nextActions.loading && nextActions.actions.length === 0 && feed.length === 0;

  // Updates — real events (reviews, @mentions, completed analyses)
  const updates = notif.notifications.slice(0, 5);

  // Header copy + primary action
  const headerSub = showLoggedOutMarketing
    ? "smbX.ai connects sourcing, diligence, execution, and value creation in one workflow."
    : firstRun
      ? "No live workspace yet. Start with a deal, thesis, or source file."
      : single
        ? `${leadTitle} is your focus today.`
        : `${feedItems.length} need your eye · ${activeCount} active · ${closedCount} closed.`;

  const primaryLabel = liveBrief?.hero.primaryLabel
    || (showLoggedOutMarketing ? "Chat with Yulia" : firstRun ? "Start with Yulia" : single ? `Open ${leadTitle}` : "Open top deal");
  const primaryAction = () => {
    if (liveBrief?.hero.primaryPrompt) { ask(liveBrief.hero.primaryPrompt); return; }
    if (showLoggedOutMarketing || firstRun) { ask("Help me start my first SMBx deal workspace."); return; }
    openDeal(lead);
  };

  const onUpdateClick = (n: typeof updates[number]) => {
    notif.markRead(n.id);
    if (n.deal_id) openTab({ kind: "deal", id: String(n.deal_id), title: `Deal #${n.deal_id}` });
  };

  return (
    <div className="wk-content m-fade-up" style={{ maxWidth: 1180, margin: "0 auto" }}>
      {/* ── Page header ── */}
      <div className="pg-head">
        <div>
          <div className="pg-title">Today</div>
          <p className="pg-sub">{headerSub}</p>
        </div>
        <div className="pg-actions">
          <button className="wkbtn primary" type="button" onClick={primaryAction}>{primaryLabel}</button>
        </div>
      </div>

      {/* ── FIRST RUN (authed, zero deals): journey picker ── */}
      {firstRun && (
        <div className="wkcard" style={{ marginTop: 16, marginBottom: 18, padding: "26px 28px 24px" }}>
          <div style={{ fontSize: "clamp(1.5rem, 2.6vw, 2.05rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.12, color: "var(--ink)", marginBottom: 8 }}>
            {firstName ? `You're set up, ${firstName}. Let's start your first deal.` : "You're set up. Let's start your first deal."}
          </div>
          <p style={{ color: "var(--ink-2)", fontSize: "0.92rem", lineHeight: 1.5, margin: "0 0 22px", maxWidth: 640 }}>
            Yulia runs the deal work end-to-end — sourcing, recasts, valuation, diligence, packaging, and closing support. Tell her what you're working on and she builds the workspace around it.
          </p>
          <div className="wkgrid g2" style={{ gap: 12 }}>
            {[
              { kicker: "SELL", title: "Sell a business", sub: "Recast the financials, set a defensible range, and build the package.", prompt: "I'm exploring selling my business. Walk me through how we start — what you need from me and what you'll build first." },
              { kicker: "BUY", title: "Acquire a business", sub: "Set a thesis, value a target, and run diligence with Yulia.", prompt: "I'm looking to acquire a business. Help me set up my buy-side workspace and first analysis." },
              { kicker: "RAISE", title: "Raise capital", sub: "Build the financial package and investor materials.", prompt: "I want to raise capital for my business. Help me start the raise workspace and investor materials." },
              { kicker: "EVALUATE", title: "Analyze a deal", sub: "Drop in the numbers — Yulia values it and flags the risks.", prompt: "I have a business to analyze. Help me value it and spot the key risks — I'll share the numbers." },
            ].map(j => (
              <button
                key={j.kicker}
                type="button"
                style={{ all: "unset", cursor: "pointer", display: "block", padding: "14px 16px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 12, boxSizing: "border-box" }}
                onClick={() => ask(j.prompt)}
              >
                <div style={{ color: "var(--ink)", fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>{j.title}</div>
                <div style={{ color: "var(--ink-2)", fontSize: "0.84rem", lineHeight: 1.4 }}>{j.sub}</div>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 18, display: "flex", gap: 9, flexWrap: "wrap" }}>
            <button className="wkbtn primary" type="button" onClick={() => ask("Help me start my first SMBx deal workspace. Ask me what I'm working on.")}>Start with Yulia</button>
            <button className="wkbtn" type="button" onClick={() => openTab({ kind: "mode-root", modeId: "search", id: "search-root", title: "Search", pinned: true })}>Explore the market</button>
          </div>
        </div>
      )}

      {/* ── SINGLE DEAL (authed, exactly one active deal): focused desk ── */}
      {!firstRun && single && lead && (
        <div style={{ marginTop: 16 }}>
          <div className="wkcard" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontSize: "clamp(1.4rem, 2.4vw, 1.9rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.12, color: "var(--ink)" }}>{lead.title}</div>
                <div style={{ color: "var(--ink-2)", fontSize: "0.9rem", marginTop: 4 }}>{lead.meta}</div>
              </div>
              <span className={`statpill ${lead.status === "Pursue" ? "good" : lead.status === "Watch" ? "review" : "missing"}`}><span className="d" />{lead.status}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 22 }}>
              <Stat label="SDE" value={lead.sde} />
              <Stat label="Multiple" value={lead.multiple} />
              <Stat label="Fit" value={`${lead.fit}`} />
              {lead.definitive && <Stat label="Readiness" value={`${shortReadiness(lead.definitive.readinessLevel)} · ${lead.definitive.score}%`} />}
            </div>
            <div style={{ display: "flex", gap: 9 }}>
              <button className="wkbtn primary" type="button" onClick={() => openDeal(lead)}>Open deal</button>
              <button className="wkbtn" type="button" onClick={() => ask(`Give me today's read on ${lead.title} — what changed, what's the risk, and the next move.`)}>Ask Yulia for the read</button>
            </div>
          </div>
        </div>
      )}

      {/* ── PORTFOLIO (authed, 2+ deals) or logged-out marketing: KPI tiles ── */}
      {!firstRun && !single && (
        <div className="mhead">
          <div className="mh">
            <span className="l">Deals active</span>
            <span className="v">{activeCount}</span>
            <span className="s">{home.inReview.length || deals.length} in motion</span>
          </div>
          <div className="mh">
            <span className="l">Needs action</span>
            <span className="v" style={{ color: "var(--accent-strong)" }}>{feedItems.length}</span>
            <span className="s">on deck today</span>
          </div>
          <div className="mh">
            <span className="l">Pipeline value</span>
            <span className="v">{pipelineValue > 0 ? fmtPipelineValue(pipelineValue) : "—"}</span>
            <span className="s">active deals</span>
          </div>
          <div className="mh">
            <span className="l">Files</span>
            <span className="v">{files.length}</span>
            <span className="s">need your eye</span>
          </div>
        </div>
      )}

      {/* ── What needs you today — the real next-actions feed ── */}
      <div className="wksec">
        <div className="pg-head" style={{ alignItems: "center", marginBottom: 14 }}>
          <div><div className="wksec-title" style={{ marginBottom: 0 }}>What needs you today</div></div>
          <div className="pg-actions">
            <button className="kebab" type="button" aria-label="More" onClick={() => ask("Walk me through everything that needs my attention across the portfolio, most urgent first.")}>⋯</button>
          </div>
        </div>
        {feedLoading ? (
          <YuliaSkeleton rows={3} label="Reading your deals for the next moves…" />
        ) : feedItems.length === 0 ? (
          <div className="wkcard" style={{ textAlign: "center", color: "var(--ink-2)" }}>
            <div className="wkcard-title">You're clear</div>
            <div className="wkcard-sub">No gate blockers, pending reviews, or stalled deals. Ask Yulia what's worth getting ahead of.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {feedItems.map((row, index) => (
              <button
                key={row.key}
                type="button"
                className="wkcard tap"
                style={{ all: "unset", cursor: "pointer", boxSizing: "border-box", width: "100%", display: "grid", gridTemplateColumns: "auto minmax(0, 1fr) auto", gap: 16, alignItems: "center", padding: "16px 18px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, transition: "border-color .18s, box-shadow .18s, transform .18s" }}
                onClick={row.onClick}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", fontWeight: 600, color: "var(--ink-3)" }}>0{index + 1}</span>
                <span style={{ minWidth: 0 }}>
                  <strong style={{ display: "block", color: "var(--ink)", fontSize: "0.98rem", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.title}</strong>
                  <span style={{ display: "block", color: "var(--ink-2)", fontSize: "0.84rem", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.sub}</span>
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.84rem", fontWeight: 600, color: "var(--accent-strong)", background: "var(--accent-soft)", borderRadius: 8, padding: "6px 12px", whiteSpace: "nowrap" }}>
                  {row.cta} <span aria-hidden="true">›</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Updates — real events (reviews, mentions, completed analyses) ── */}
      {!useSampleData && (
        <div className="wksec">
          <div className="wksec-title" style={{ marginBottom: 12 }}>Updates</div>
          {!notif.loaded ? (
            <YuliaSkeleton rows={2} label={null} />
          ) : updates.length === 0 ? (
            <div className="wkcard" style={{ textAlign: "center", color: "var(--ink-2)" }}>
              <div className="wkcard-title">No new updates</div>
              <div className="wkcard-sub">Review requests, @mentions, and finished analyses land here as they happen.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {updates.map(n => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => onUpdateClick(n)}
                  style={{ all: "unset", cursor: "pointer", boxSizing: "border-box", width: "100%", display: "grid", gridTemplateColumns: "8px minmax(0, 1fr) auto", gap: 12, alignItems: "start", padding: "13px 16px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12 }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: "50%", marginTop: 6, background: n.read_at ? "transparent" : "var(--accent-strong)", border: n.read_at ? "1px solid var(--line-2)" : "none" }} />
                  <span style={{ minWidth: 0 }}>
                    <strong style={{ display: "block", color: "var(--ink)", fontSize: "0.9rem", fontWeight: n.read_at ? 600 : 700, letterSpacing: "-0.01em", lineHeight: 1.3 }}>{n.title}</strong>
                    {n.body && <span style={{ display: "block", color: "var(--ink-2)", fontSize: "0.82rem", lineHeight: 1.4, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.body}</span>}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--ink-3)", whiteSpace: "nowrap", marginTop: 1 }}>{notifTimeAgo(n.created_at)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Portfolio at a glance — active deals by stage (portfolio only) ── */}
      {!firstRun && !single && !useSampleData && home.all.length > 0 && (
        <div className="wksec">
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
            <div className="wksec-title" style={{ marginBottom: 0 }}>Portfolio at a glance</div>
            <button
              type="button"
              onClick={() => openTab({ kind: "mode-root", modeId: "pipeline", id: "pipeline-root", title: "Pipeline", pinned: true })}
              style={{ all: "unset", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.04em", color: "var(--accent-strong)", whiteSpace: "nowrap" }}
            >
              Open pipeline →
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 10 }}>
            {PIPELINE_STAGES.map(stage => (
              <button
                key={stage.id}
                type="button"
                style={{ all: "unset", cursor: "pointer", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 4, padding: "14px 15px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, transition: "border-color .18s, transform .18s" }}
                onClick={() => openTab({ kind: "mode-root", modeId: "pipeline", id: "pipeline-root", title: "Pipeline", pinned: true })}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.5rem", fontWeight: 600, color: "var(--ink)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{stageCounts[stage.id]}</span>
                <span style={{ color: "var(--ink)", fontSize: "0.88rem", fontWeight: 700, letterSpacing: "-0.01em" }}>{stage.title}</span>
                <span style={{ color: "var(--ink-3)", fontSize: "0.76rem", lineHeight: 1.35 }}>{stage.sub}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Deals in motion + Files ── */}
      <div className="wkgrid g2" style={{ gap: 16, marginTop: 34 }}>
        {!single && (
          <div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
              <div className="wksec-title" style={{ marginBottom: 2 }}>Deals in motion</div>
              <button
                type="button"
                onClick={() => openTab({ id: "deals-all", kind: "deals-list", title: "All deals", dealsListView: "all" })}
                style={{ all: "unset", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.04em", color: "var(--accent-strong)", whiteSpace: "nowrap" }}
              >
                See all{!useSampleData && home.all.length ? ` ${home.all.length}` : ""} →
              </button>
            </div>
            <p style={{ color: "var(--ink-2)", fontSize: "0.88rem", margin: "0 0 14px" }}>Not every live deal deserves the same attention.</p>
            {deals.length === 0 ? (
              <div className="wkcard" style={{ textAlign: "center", color: "var(--ink-2)" }}>
                <div className="wkcard-title">No deals yet</div>
                <div className="wkcard-sub">When you add a deal, Yulia will rank it here by urgency, fit, and next action.</div>
              </div>
            ) : (
              <table className="wktable">
                <thead><tr>
                  <th>Deal</th>
                  <th>Status</th>
                  <th className="r">SDE</th>
                  <th className="r">Fit</th>
                </tr></thead>
                <tbody>
                  {deals.map(deal => {
                    const pillCls = deal.status === "Pursue" ? "good" : deal.status === "Watch" ? "review" : "missing";
                    return (
                      <tr key={deal.id} onClick={() => openDeal(deal)}>
                        <td>
                          <div className="cellname">
                            <span className="logo">{dealInitials(deal.title)}</span>
                            <div>
                              <div className="nm">{deal.title}</div>
                              <div className="sub">{deal.meta}</div>
                              {deal.definitive && (
                                <div className="sub" style={{ fontFamily: "var(--font-mono)", color: "var(--accent-strong)", marginTop: 2 }}>
                                  {shortReadiness(deal.definitive.readinessLevel)} · {deal.definitive.score}% · {deal.definitive.lifecyclePosition || "DealState"} · {deal.definitive.packetTypes.length} packets
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td><span className={`statpill ${pillCls}`}><span className="d" />{deal.status}</span></td>
                        <td className="r amt">{deal.sde}</td>
                        <td className="r">
                          <span className="fit">
                            <span className="fitn">{deal.fit}</span>
                            <span className="ft"><span className="ff" style={{ width: `${deal.fit}%` }} /></span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Files */}
        <div style={single ? { gridColumn: "1 / -1" } : undefined}>
          <div className="wksec-title" style={{ marginBottom: 2 }}>Files needing your eye</div>
          <p style={{ color: "var(--ink-2)", fontSize: "0.88rem", margin: "0 0 14px" }}>Docs, data room items, and analyses surfaced from today's work.</p>
          {files.length === 0 ? (
            <div className="wkcard" style={{ textAlign: "center", color: "var(--ink-2)" }}>
              <div className="wkcard-title">No files yet</div>
              <div className="wkcard-sub">Generated docs, analyses, uploaded artifacts, and data-room items will appear here.</div>
            </div>
          ) : (
            <table className="wktable">
              <thead><tr>
                <th>File</th>
                <th>Status</th>
                <th className="r">Action</th>
              </tr></thead>
              <tbody>
                {files.map((file, index) => (
                  <tr key={`${file.id ?? file.title}-${index}`} onClick={() => openDoc(file.title, file.id)}>
                    <td>
                      <div className="cellname">
                        <span className="logo" style={{ color: "var(--ink-2)" }}>
                          <V6Icon name={file.kind === "chart" ? "chart" : "doc"} size={16} />
                        </span>
                        <div>
                          <div className="nm">{file.title}</div>
                          <div className="sub">{file.sub}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`statpill ${toneToStatpill(file.tone)}`}><span className="d" />{file.status}</span></td>
                    <td className="r"><button type="button" className="reviewbtn" onClick={e => { e.stopPropagation(); openDoc(file.title, file.id); }}>Open</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Quick starts ── */}
      <div className="wksec" style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "20px 22px", display: "grid", gridTemplateColumns: "minmax(200px, 0.42fr) minmax(0, 1fr)", gap: 20, alignItems: "center", marginTop: 34 }}>
        <div>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--ink)", lineHeight: 1.1 }}>Give Yulia a clean sentence.</div>
        </div>
        <div className="ynext" style={{ margin: 0 }}>
          {QUICK_STARTS.map(prompt => (
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ color: "var(--ink-3)", fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      <span style={{ color: "var(--ink)", fontSize: "1.05rem", fontWeight: 700, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}

function dealInitials(value: string): string {
  return value.split(/\s+/).filter(Boolean).map(part => part[0]).slice(0, 2).join("").toUpperCase();
}

function fmtCents(cents: number | null | undefined): string {
  if (!cents) return "--";
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (dollars >= 1_000) return `$${Math.round(dollars / 1_000)}K`;
  return `$${Math.round(dollars).toLocaleString()}`;
}

function fmtPipelineValue(cents: number): string {
  if (!Number.isFinite(cents) || cents <= 0) return "—";
  const dollars = cents / 100;
  if (dollars >= 1_000_000_000) return `$${(dollars / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (dollars >= 1_000) return `$${Math.round(dollars / 1_000)}K`;
  return `$${Math.round(dollars).toLocaleString()}`;
}

function stageNextAction(stage: PipelineStageId): string {
  switch (stage) {
    case "source": return "First read — confirm the thesis and pull the financials.";
    case "value": return "Set the valuation range and test the finance fit.";
    case "diligence": return "Work the diligence list and surface the real risks.";
    case "structure": return "Tighten terms, tax treatment, and approvals.";
    case "close": return "Drive the close, then start value creation.";
    default: return "Open the deal and pick up where Yulia left off.";
  }
}

function fitFromEbitda(ebitda: number | null | undefined): number {
  if (!ebitda) return 68;
  const m = ebitda / 100_000_000;
  if (m >= 5) return 92;
  if (m >= 3) return 86;
  if (m >= 2) return 80;
  if (m >= 1) return 74;
  return 68;
}

function dealToTodayDeal(d: HomeDeal, index: number): TodayDeal {
  const tones: Tone[] = ["cactus", "gold", "oat", "plum", "charcoal"];
  const status = /[345]$/.test(d.current_gate) ? "Pursue" : "Watch";
  const sde = fmtCents(d.sde);
  const multiple = d.financials?.multiple ? `${d.financials.multiple.toFixed(1)}x` : "--";
  return {
    id: String(d.id),
    title: d.business_name || d.industry || `Deal #${d.id}`,
    meta: `${fmtCents(d.revenue)} · ${d.location || d.industry || "active deal"}`,
    thesis: d.financials?.notes || `${sde} SDE · ${d.current_gate}`,
    status,
    fit: fitFromEbitda(d.ebitda),
    sde,
    multiple,
    tone: tones[index % tones.length],
  };
}

function operatingDealToTodayDeal(item: TodayDealPulseItem, index: number): TodayDeal {
  const tones: Tone[] = ["cactus", "gold", "oat", "plum", "charcoal"];
  return {
    id: item.dealId,
    title: item.title,
    meta: `${item.metric} · ${item.urgency}`,
    thesis: item.thesis,
    status: item.status,
    fit: item.fit,
    sde: item.metric,
    multiple: "--",
    tone: item.tone || tones[index % tones.length],
    definitive: item.definitive,
  };
}

function deliverableToTodayFile(d: WorkspaceDeliverable): TodayFile {
  const title = d.name || d.slug.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const analysis = /model|valuation|analysis|sba|comp|risk|tax|financial|score/i.test(`${d.slug} ${title}`);
  return {
    kind: analysis ? "chart" : "doc",
    title,
    sub: `${d.deal_name || "Deal"} · ${d.status === "complete" ? "ready" : d.status}`,
    status: d.status === "complete" ? "Open" : d.status.replace(/_/g, " "),
    tone: d.status === "complete" ? "plum" : d.status === "failed" ? "charcoal" : "gold",
    id: String(d.id),
  };
}

function shortReadiness(level: string): string {
  return level.match(/DRL\d+/)?.[0] || "DRL";
}
