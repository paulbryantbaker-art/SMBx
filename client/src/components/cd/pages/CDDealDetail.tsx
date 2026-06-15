/**
 * CDDealDetail — the deal-detail page ported into the Claude Design (CD)
 * cool/indigo language. THE most important page: it is the deal's home.
 *
 * Every value here is REAL or honestly "—":
 *   - GET /api/deals/:id             → the deal record (revenue/SDE/EBITDA/asking/valuation)
 *   - GET /api/deals/:id/deliverables → produced analyses + documents
 *   - GET /api/agency/deals/:id/brief → Yulia's read (verdict, market, tax/legal, next moves)
 *   - useTodayOperatingBrief          → live gate countdown (blockers + next action + DEFINITIVE score)
 *   - getJourneyGates(@shared)        → the stage timeline ("you are here")
 *
 * The CD mockup (ultra-modern-fintech/detail.jsx) is the VISUAL target only —
 * its window.MA_* demo data is never copied. Layout is rebuilt here: a flat CD
 * hero with the deal's color rail (no blue gradient), a stage timeline, KPI
 * stat cards, Yulia's verdict/read under a CDLineNote, a market panel, the
 * structure read, produced work, and a deal-team affordance.
 *
 * Mounts under `.cd-root` (cdTokens.css). Only --cd-* tokens — never bare
 * --ink/--surface/--accent. THE LINE: every action routes to chat or opens a
 * tab; Yulia shows analysis & implications, never a transaction recommendation.
 */
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { authHeaders, type User } from "../../../hooks/useAuth";
import { useTodayOperatingBrief, type TodayGateCountdownItem } from "../../../hooks/useTodayOperatingBrief";
import { realBlockers } from "../../v6/shared/operatingPrimitives";
import type { OpenTab } from "../../v6/types";
import { LEAGUE_MULTIPLES } from "../../../lib/calculations/core";
import { getJourneyGates } from "@shared/gateRegistry";
import {
  CDIcon,
  CDPill,
  CDAvatar,
  CDCard,
  CDSectionTitle,
  CDEyebrow,
  CDStat,
  CDLeagueBadge,
  CDHeatBar,
  CDDirGlyph,
  CDLineNote,
  cdFmtCents,
  cdDealColor,
  type CDTone,
} from "../kit/cdUi";

/* ─── Server response shapes (mirrors V6 DealView's real fetches) ───────── */
interface DealRow {
  id: number;
  business_name: string | null;
  industry: string | null;
  location: string | null;
  league: string | null;
  current_gate: string;
  status: string;
  journey_type: string;
  revenue: number | null;
  sde: number | null;
  ebitda: number | null;
  asking_price: number | null;
  financials: Record<string, unknown> | null;
  updated_at?: string;
  created_at?: string;
}
interface DealDetailResp {
  deal: DealRow;
  gates: { gate: string; status: string; completed_at: string | null }[];
  deliverableStats?: { total: number; completed: number; in_progress: number };
}
interface DealBrief {
  generatedAt?: string;
  verdict?: { label?: string; score?: number; text?: string };
  marketRead?: { headline?: string; bullets?: string[]; researchNeeded?: string[] };
  taxLegal?: { tax?: string; legal?: string };
  nextMoves?: Array<{ title?: string; why?: string; prompt?: string }>;
}
interface DeliverableRow {
  id: number;
  status: string;
  created_at: string;
  completed_at?: string | null;
  slug?: string;
  name?: string;
  folder_category?: string | null;
  artifact_kind?: string | null;
}

/* ─── Derived view types ────────────────────────────────────────────────── */
interface StageCell { id: string; name: string; state: "done" | "current" | "upcoming" }
interface StageProgress {
  journeyLabel: string;
  stages: StageCell[];
  currentIndex: number;
  currentName: string;
  total: number;
  nextName: string | null;
  deliverablesDone: number;
  deliverablesTotal: number;
}
interface KpiCell { label: string; value: string; sub: string; band?: LeagueBandData | null }
interface LeagueBandData { league: string; min: number; max: number; metric: string; pct: number; inRange: boolean }
interface ProducedWork { id: string; title: string; meta: string; kind: "analysis" | "doc" }

const JOURNEY_TONE: Record<string, CDTone> = { BUY: "accent", SELL: "pos", RAISE: "warn", PMI: "neutral" };

/* League multiple bands use the REAL source of truth (LEAGUE_MULTIPLES from
   core.ts — 6 leagues, L1-L6, each with its metric SDE/EBITDA). Deals above L6
   (no published band) correctly produce no band rather than an invented one. */

/* ─── Helpers (pure; honest "—" when a value is absent) ──────────────────── */
function leagueNum(league: string | null): number {
  return parseInt(String(league || "").replace(/\D/g, ""), 10) || 1;
}
function fmtRelative(iso?: string | null): string {
  if (!iso) return "";
  try {
    const ms = Date.now() - new Date(iso).getTime();
    const min = Math.round(ms / 60_000);
    if (min < 1) return "just now";
    if (min < 60) return `${min}m ago`;
    const hr = Math.round(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const d = Math.round(hr / 24);
    if (d < 30) return `${d}d ago`;
    return new Date(iso).toLocaleDateString();
  } catch { return ""; }
}
function buildStats(d: DealRow): KpiCell[] {
  const sdeMargin = d.revenue && d.sde ? `${Math.round((d.sde / d.revenue) * 100)}% of revenue` : "Owner earnings";
  const ebitdaMargin = d.revenue && d.ebitda ? `${Math.round((d.ebitda / d.revenue) * 100)}% margin` : "Operating earnings";
  const earnings = d.ebitda || d.sde || null;
  const askingMultiple = d.asking_price && earnings ? `${(d.asking_price / earnings).toFixed(1)}× earnings` : "Not set";
  const fin = d.financials || {};
  const valuation = (fin.valuation_midpoint ?? fin.valuation ?? fin.enterprise_value ?? null) as number | null;
  const band = d.asking_price && earnings && d.league ? buildLeagueBand(d.league, d.asking_price, earnings) : null;
  return [
    { label: "Revenue", value: cdFmtCents(d.revenue), sub: "Trailing twelve months" },
    { label: "SDE", value: cdFmtCents(d.sde), sub: sdeMargin },
    { label: "EBITDA", value: cdFmtCents(d.ebitda), sub: ebitdaMargin },
    { label: "Asking price", value: cdFmtCents(d.asking_price), sub: askingMultiple, band },
    { label: "Modeled valuation", value: valuation ? cdFmtCents(valuation) : "—", sub: valuation ? "From Yulia's model" : "Not modeled yet" },
  ];
}
function buildLeagueBand(league: string, askingCents: number, earningsCents: number): LeagueBandData | null {
  const entry = LEAGUE_MULTIPLES[`L${leagueNum(league)}`];
  if (!entry || earningsCents <= 0 || entry.max <= entry.min) return null;
  const implied = askingCents / earningsCents;
  const pct = Math.max(0, Math.min(100, ((implied - entry.min) / (entry.max - entry.min)) * 100));
  return { league, min: entry.min, max: entry.max, metric: entry.metric, pct, inRange: implied >= entry.min && implied <= entry.max };
}
function buildStageProgress(
  d: DealRow,
  gates: { gate: string; status: string; completed_at: string | null }[],
  stats?: { total: number; completed: number; in_progress: number },
): StageProgress | null {
  const journeyGates = getJourneyGates(d.journey_type);
  if (journeyGates.length === 0) return null;
  const completedSet = new Set(gates.filter(g => g.completed_at || /complete|done|passed/i.test(g.status)).map(g => g.gate));
  const currentIndex = Math.max(0, journeyGates.findIndex(g => g.id === d.current_gate));
  const stages: StageCell[] = journeyGates.map((g, i) => ({
    id: g.id,
    name: g.name,
    state: completedSet.has(g.id) || i < currentIndex ? "done" : i === currentIndex ? "current" : "upcoming",
  }));
  return {
    journeyLabel: d.journey_type.toUpperCase(),
    stages,
    currentIndex,
    currentName: journeyGates[currentIndex]?.name ?? "—",
    total: journeyGates.length,
    nextName: journeyGates[currentIndex + 1]?.name ?? null,
    deliverablesDone: stats?.completed ?? 0,
    deliverablesTotal: stats?.total ?? 0,
  };
}
const ANALYSIS_RE = /valuation|dcf|lbo|capital[-\s]?structure|working[-\s]?capital|\bqoe\b|sensitivity|earnout|\bsba\b|dscr|comps?\b|scorecard|\bmodel\b|recast|tax[-\s]?impact|financial[-\s]?spread|cap[-\s]?table|covenant|analysis/i;
function isAnalysis(d: DeliverableRow): boolean {
  if (d.artifact_kind && /model|analysis|snapshot|comparison/i.test(d.artifact_kind)) return true;
  if (d.folder_category && /model|analys/i.test(d.folder_category)) return true;
  return ANALYSIS_RE.test(`${d.slug || ""} ${d.name || ""}`);
}
function titleCase(s: string): string {
  return s.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
function splitWork(rows: DeliverableRow[]): { analyses: ProducedWork[]; documents: ProducedWork[] } {
  const analyses: ProducedWork[] = [];
  const documents: ProducedWork[] = [];
  for (const d of rows) {
    const name = d.name || titleCase(d.slug || "deliverable");
    const item: ProducedWork = {
      id: String(d.id),
      title: name,
      meta: `${titleCase(d.status)} · ${fmtRelative(d.completed_at || d.created_at)}`,
      kind: isAnalysis(d) ? "analysis" : "doc",
    };
    if (item.kind === "analysis") analyses.push(item);
    else documents.push(item);
  }
  return { analyses, documents };
}
function primaryDeliverable(journey?: string | null): { label: string } {
  switch (journey) {
    case "sell": return { label: "CIM" };
    case "raise": return { label: "Pitch deck" };
    case "pmi": return { label: "100-day plan" };
    default: return { label: "LOI" };
  }
}

/* ════════════════════════════════════════════════════════════════════════
   The page
   ════════════════════════════════════════════════════════════════════════ */
export function CDDealDetail({
  id,
  title,
  user,
  openTab,
  onTalkToYulia,
}: {
  id: string;
  title: string;
  user: User | null;
  openTab: OpenTab;
  onTalkToYulia?: (p: string) => void;
  modelPreference?: unknown;
}) {
  const numericId = /^\d+$/.test(id) ? parseInt(id, 10) : null;
  const [data, setData] = useState<DealDetailResp | null>(null);
  const [linked, setLinked] = useState<DeliverableRow[] | null>(null);
  const [brief, setBrief] = useState<DealBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const operating = useTodayOperatingBrief(user ?? null, !!user && numericId !== null);

  useEffect(() => {
    if (numericId === null) { setData(null); setLinked([]); setBrief(null); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setBrief(null);
    // The deal record + deliverables gate the page — show them the instant they
    // land. Only these two flip `loading` off.
    Promise.all([
      fetch(`/api/deals/${numericId}`, { headers: authHeaders() }).then(r => r.ok ? r.json() : Promise.reject(new Error(`deal ${r.status}`))),
      fetch(`/api/deals/${numericId}/deliverables`, { headers: authHeaders() }).then(r => r.ok ? r.json() : []),
    ])
      .then(([detail, dels]) => {
        if (cancelled) return;
        setData(detail as DealDetailResp);
        setLinked(Array.isArray(dels) ? dels : []);
      })
      .catch((e: Error) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    // Yulia's read is an AI endpoint (seconds) — it must NEVER block the deal
    // record. It fills in independently; until then the page shows the honest
    // "Yulia is analyzing this deal" state.
    fetch(`/api/agency/deals/${numericId}/brief`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then(b => { if (!cancelled) setBrief(b as DealBrief | null); })
      .catch(() => { if (!cancelled) setBrief(null); });
    return () => { cancelled = true; };
  }, [numericId]);

  const real = data?.deal;
  const dealName = real?.business_name || title;
  const color = cdDealColor(numericId ?? id);
  const journey = (real?.journey_type || "buy").toUpperCase();
  const league = leagueNum(real?.league ?? null);

  // Live gate countdown for THIS deal (blockers, next action, DEFINITIVE score).
  const gate: TodayGateCountdownItem | undefined = useMemo(
    () => (operating.brief?.gateCountdown ?? []).find(g => g.dealId === String(numericId)),
    [operating.brief, numericId],
  );
  const blockers = gate ? realBlockers(gate.blockers) : [];
  const definitiveScore = typeof gate?.definitive?.score === "number" ? gate.definitive.score : null;

  const stats = real ? buildStats(real) : [];
  const stageProgress = real ? buildStageProgress(real, data?.gates ?? [], data?.deliverableStats) : null;
  const work = splitWork(linked ?? []);
  const primary = primaryDeliverable(real?.journey_type);

  // Honest subline — never fabricate revenue / location / gate before the deal
  // record loads (matches DealView's no-fiction fix; was a hardcoded string).
  const heroSub = real
    ? [
        real.revenue ? `${cdFmtCents(real.revenue)} revenue` : null,
        real.location || null,
        real.industry || null,
        `${journey} · gate ${real.current_gate}`,
        real.status && real.status !== "active" ? titleCase(real.status) : null,
      ].filter(Boolean).join("  ·  ")
    : "Loading deal…";

  // Yulia's read — straight from the deal brief (substrate). No app-computed
  // verdict; honest "analyzing" when her read isn't ready.
  const verdict = brief?.verdict;
  const hasVerdict = !!(verdict?.label || verdict?.text);
  const marketHeadline = brief?.marketRead?.headline;
  const marketBullets = (brief?.marketRead?.bullets ?? []).filter(Boolean).slice(0, 3);
  const researchNeeded = (brief?.marketRead?.researchNeeded ?? []).filter(Boolean).slice(0, 3);
  const taxRead = brief?.taxLegal?.tax;
  const legalRead = brief?.taxLegal?.legal;
  const nextMoves = (brief?.nextMoves ?? []).filter(m => m.title).slice(0, 3);

  const askYulia = (prompt: string) => onTalkToYulia?.(prompt);
  const openModel = (w: ProducedWork) => openTab({ kind: w.kind === "analysis" ? "analysis" : "doc", id: w.id, title: `${dealName} · ${w.title}` });
  const openTeam = () => openTab({ kind: "deal-team", id: `deal-team-${id}`, title: `${dealName} · Team`, dealId: numericId ?? id, dealTitle: dealName });
  const openFiles = (scope: "all" | "data-room") => openTab({ kind: "deal", id, title: dealName, dealId: numericId ?? id, fileScope: scope });

  return (
    <div
      className="cd-root cd-scrollable"
      style={{ background: "var(--cd-canvas)", height: "100%", overflow: "auto", padding: "30px 34px 60px", display: "flex", flexDirection: "column", gap: "var(--cd-gap)" }}
    >
      {/* ── Hero — flat CD header with deal color rail (NO blue gradient) ── */}
      <div
        style={{
          position: "relative",
          background: `linear-gradient(100deg, color-mix(in oklch, ${color}, transparent 90%), var(--cd-surface) 55%)`,
          border: "1px solid var(--cd-line)",
          borderRadius: "var(--cd-r-lg)",
          boxShadow: "var(--cd-shadow-md)",
          padding: "22px 26px",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <span style={{ width: 11, height: 46, borderRadius: 4, background: color, flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontFamily: "var(--cd-serif)", fontWeight: 600, fontSize: 30, letterSpacing: "-0.02em", lineHeight: 1.05 }}>{dealName}</h1>
              {/* Only a real, assigned league — never fabricate "L1" for an unset league. */}
              {real?.league && <CDLeagueBadge league={league} />}
              <CDPill tone={JOURNEY_TONE[journey] || "neutral"}>{journey}</CDPill>
              {real && (
                <span className="cd-num" style={{ fontSize: 11.5, color: "var(--cd-ink-3)", background: "var(--cd-surface-2)", border: "1px solid var(--cd-line)", borderRadius: 6, padding: "2px 8px", whiteSpace: "nowrap" }}>
                  {real.current_gate}{gate?.gateName ? ` · ${gate.gateName}` : ""}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--cd-ink-2)", marginTop: 7 }}>{heroSub}</div>
          </div>
          {definitiveScore != null && (
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div className="cd-num" style={{ fontSize: 30, fontWeight: 700, lineHeight: 1, color: definitiveScore >= 80 ? "var(--cd-pos)" : definitiveScore >= 55 ? "var(--cd-accent)" : "var(--cd-warn)" }}>{definitiveScore}</div>
              <div className="cd-eyebrow" style={{ fontSize: 9, marginTop: 4 }}>Readiness</div>
            </div>
          )}
        </div>
        {/* action row — ghost pills, every action routes to a tab or chat */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 }}>
          <HeroPill onClick={() => openFiles("all")}>Open files</HeroPill>
          <HeroPill onClick={() => openFiles("data-room")}>Data room</HeroPill>
          <HeroPill onClick={openTeam}><CDIcon name="comment" size={13} color="var(--cd-ink-2)" />Team</HeroPill>
          <HeroPill
            onClick={() => askYulia(`On ${dealName}: create the ${primary.label} from the current deal context and open it as work product.`)}
            accent
          >
            <CDIcon name="sparkle" size={13} color="white" />Generate {primary.label}
          </HeroPill>
        </div>
      </div>

      {loading && <div className="cd-num" style={{ fontSize: 11, color: "var(--cd-ink-3)" }}>LOADING DEAL…</div>}
      {error && (
        <CDCard style={{ borderColor: "var(--cd-neg-soft)", color: "var(--cd-neg)", fontSize: 13 }}>
          Couldn't load this deal ({error}). It may not exist or you may not have access.
        </CDCard>
      )}

      {/* ── Stage timeline — "you are here" in the journey methodology ── */}
      {stageProgress && (
        <CDCard>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
            <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, letterSpacing: "-0.01em" }}>
              Stage {stageProgress.currentIndex + 1} of {stageProgress.total} — {stageProgress.currentName}
            </h3>
            <div style={{ fontSize: 12, color: "var(--cd-ink-3)", textAlign: "right", lineHeight: 1.5 }}>
              <div>{stageProgress.journeyLabel} methodology</div>
              {stageProgress.nextName ? <div>Next: <strong style={{ color: "var(--cd-ink)" }}>{stageProgress.nextName}</strong></div> : <div>Final stage</div>}
              {stageProgress.deliverablesTotal > 0 && (
                <div style={{ marginTop: 2 }}>{stageProgress.deliverablesDone} of {stageProgress.deliverablesTotal} deliverables complete</div>
              )}
            </div>
          </div>
          <StageTrack stages={stageProgress.stages} color={color} />
        </CDCard>
      )}

      {/* ── Yulia's verdict / read — her call, under THE LINE note ── */}
      {hasVerdict ? (
        <CDCard style={{ background: "linear-gradient(180deg, var(--cd-accent-soft), var(--cd-surface))", borderColor: "var(--cd-accent-ring)" }}>
          <div style={{ display: "flex", gap: 14 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "var(--cd-accent)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <CDIcon name="sparkle" size={17} color="white" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em" }}>{verdict?.label || "Yulia's read"}</span>
                {typeof verdict?.score === "number" && (
                  <span className="cd-num" style={{ fontSize: 12, fontWeight: 700, color: "var(--cd-accent-strong)", background: "var(--cd-surface)", border: "1px solid var(--cd-accent-ring)", borderRadius: 6, padding: "2px 8px" }}>Fit {verdict.score}</span>
                )}
              </div>
              {verdict?.text && <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--cd-ink)", maxWidth: 760 }}>{verdict.text}</p>}
              <CDLineNote style={{ marginTop: 9 }} />
              {brief?.generatedAt && fmtRelative(brief.generatedAt) && (
                <div className="cd-num" style={{ fontSize: 10.5, color: "var(--cd-ink-4)", marginTop: 3 }}>Read {fmtRelative(brief.generatedAt)}</div>
              )}
            </div>
          </div>
        </CDCard>
      ) : numericId !== null && !loading ? (
        <CDCard style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Yulia is analyzing this deal</div>
            <p style={{ margin: "6px 0 0", color: "var(--cd-ink-2)", fontSize: 13, lineHeight: 1.5 }}>Her verdict, market read, and next moves appear once she's read it.</p>
          </div>
          <button style={btnDark} onClick={() => askYulia(`Give me your read on ${dealName}: your verdict, the key risks, and the next move.`)}>
            <CDIcon name="sparkle" size={14} color="white" />Ask for the read
          </button>
        </CDCard>
      ) : null}

      {/* ── KPI stat cards — revenue / SDE / EBITDA / asking / valuation ── */}
      {real ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "var(--cd-gap)" }}>
          {stats.map(s => (
            <div key={s.label}>
              <CDStat label={s.label} value={s.value} sub={s.sub} />
              {s.band && (
                <div style={{ marginTop: 8, padding: "0 2px" }}>
                  <div style={{ position: "relative", height: 4, borderRadius: 2, background: "var(--cd-surface-3)" }}>
                    <span style={{ position: "absolute", top: "50%", left: `${s.band.pct}%`, transform: "translate(-50%,-50%)", width: 7, height: 7, borderRadius: "50%", background: s.band.inRange ? "var(--cd-pos)" : "var(--cd-neg)" }} />
                  </div>
                  <div className="cd-num" style={{ fontSize: 9.5, color: "var(--cd-ink-4)", marginTop: 4 }}>
                    {s.band.league}: {s.band.min}–{s.band.max}× {s.band.metric}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : !loading && numericId === null ? (
        <CDCard style={{ textAlign: "center", color: "var(--cd-ink-2)", fontSize: 13 }}>Open a deal from the portfolio to see its full profile.</CDCard>
      ) : null}

      {/* ── Main grid: market intelligence + structure read / next moves ── */}
      {real && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)", gap: "var(--cd-gap)", alignItems: "start" }}>
          {/* Market intelligence (CDHeatBar) */}
          <CDCard>
            <CDSectionTitle>Market intelligence</CDSectionTitle>
            <p style={{ margin: "0 0 14px", fontSize: 13.5, lineHeight: 1.5, color: "var(--cd-ink-2)" }}>
              {marketHeadline || `Yulia hasn't built a market read for ${dealName} yet.`}
            </p>
            {/* deal facts — from the record, not judgment */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 9 }}>
              {[
                { label: "Industry", value: real.industry || "—" },
                { label: "Geography", value: real.location || "—" },
                { label: "Revenue", value: cdFmtCents(real.revenue) },
                { label: "Earnings", value: cdFmtCents(real.ebitda ?? real.sde ?? null) },
              ].map(t => (
                <div key={t.label} style={{ borderRadius: 10, padding: "11px 12px", background: "var(--cd-surface-2)", border: "1px solid var(--cd-line)" }}>
                  <div style={{ fontSize: 11, color: "var(--cd-ink-3)", fontWeight: 600 }}>{t.label}</div>
                  <div className="cd-num" style={{ marginTop: 6, fontSize: 14, fontWeight: 700, lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.value}</div>
                </div>
              ))}
            </div>
            {/* Yulia's market signals — each opens a deeper read */}
            {marketBullets.length > 0 ? (
              <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
                <CDEyebrow>Yulia's signals · tap to go deeper</CDEyebrow>
                {marketBullets.map(b => (
                  <button key={b} style={bulletBtn} onClick={() => askYulia(`On ${dealName}: use this market-intelligence note as the trigger for a deeper analysis: "${b}". Combine live deal facts and market intelligence, then open the right analysis canvas.`)}>
                    {b}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
                <CDHeatBar heat={definitiveScore ?? 0} />
                <span style={{ fontSize: 12, color: "var(--cd-ink-3)" }}>No live market read for this deal yet — ask Yulia to run one.</span>
              </div>
            )}
            {researchNeeded.length > 0 && (
              <div style={{ marginTop: 14, display: "grid", gap: 4, borderRadius: 10, padding: "12px 13px", background: "var(--cd-warn-soft)", fontSize: 12.5, lineHeight: 1.35, color: "var(--cd-ink-2)" }}>
                <strong style={{ fontSize: 12.5 }}>Source gaps</strong>
                {researchNeeded.map(g => <span key={g}>{g}</span>)}
              </div>
            )}
            {(marketBullets.length > 0 || marketHeadline) && <CDLineNote style={{ marginTop: 12 }} />}
          </CDCard>

          {/* right column — structure read, next moves, deal team */}
          <div style={{ display: "grid", gap: "var(--cd-gap)" }}>
            <CDCard>
              <CDSectionTitle>Structure read</CDSectionTitle>
              <p style={{ margin: "0 0 14px", fontSize: 12.5, lineHeight: 1.45, color: "var(--cd-ink-2)" }}>How structure, tax, and legal shape this deal before documents move.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <CDEyebrow style={{ display: "block", marginBottom: 5 }}>Tax</CDEyebrow>
                  <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.4, color: "var(--cd-ink-2)" }}>{taxRead || "Ask Yulia to run the tax & structure read for this deal."}</p>
                </div>
                <div>
                  <CDEyebrow style={{ display: "block", marginBottom: 5 }}>Legal</CDEyebrow>
                  <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.4, color: "var(--cd-ink-2)" }}>{legalRead || "Ask Yulia to run the legal issue read for this deal."}</p>
                </div>
              </div>
              {(taxRead || legalRead) && <CDLineNote style={{ marginTop: 12 }} />}
            </CDCard>

            <CDCard pad={false}>
              <div style={{ padding: "var(--cd-pad)", paddingBottom: 6 }}>
                <CDSectionTitle>Yulia's next moves</CDSectionTitle>
              </div>
              {nextMoves.length > 0 ? (
                nextMoves.map((m, i) => (
                  <button
                    key={m.title}
                    style={{ ...nextMoveRow, borderTop: i === 0 ? "1px solid var(--cd-line)" : "1px solid var(--cd-line)" }}
                    onClick={() => askYulia(m.prompt || `On ${dealName}: ${m.title}`)}
                  >
                    <span style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 3, textAlign: "left" }}>
                      <strong style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--cd-ink)" }}>{m.title}</strong>
                      {m.why && <small style={{ fontSize: 12, lineHeight: 1.35, color: "var(--cd-ink-2)" }}>{m.why}</small>}
                    </span>
                    <CDIcon name="chevright" size={16} color="var(--cd-ink-4)" />
                  </button>
                ))
              ) : (
                <button style={{ ...nextMoveRow, borderTop: "1px solid var(--cd-line)" }} onClick={() => askYulia(`On ${dealName}: read this deal and tell me the next moves.`)}>
                  <span style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 3, textAlign: "left" }}>
                    <strong style={{ fontSize: 13.5, fontWeight: 700, color: "var(--cd-ink)" }}>Ask Yulia for the next moves</strong>
                    <small style={{ fontSize: 12, lineHeight: 1.35, color: "var(--cd-ink-2)" }}>She surfaces the next actions once she's read the deal.</small>
                  </span>
                  <CDIcon name="chevright" size={16} color="var(--cd-ink-4)" />
                </button>
              )}
            </CDCard>

            {/* Deal team / chat affordance */}
            <CDCard>
              <CDSectionTitle action={<button style={btnGhost} onClick={openTeam}><CDIcon name="comment" size={13} color="var(--cd-accent)" />Open chat</button>}>Deal team</CDSectionTitle>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CDAvatar initials={(user?.email || "You").slice(0, 2).toUpperCase()} size={30} color="var(--cd-accent)" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>You</div>
                  <div style={{ fontSize: 11, color: "var(--cd-ink-3)" }}>Lead · smbx.ai</div>
                </div>
                <button style={iconBtn} onClick={openTeam} title="Message the deal team"><CDIcon name="comment" size={14} color="var(--cd-ink-3)" /></button>
              </div>
              <button style={teamCta} onClick={openTeam}>
                <CDIcon name="comment" size={14} color="var(--cd-accent)" />Open team chat & invite advisors
              </button>
            </CDCard>
          </div>
        </div>
      )}

      {/* ── Produced work — analyses / models, then documents ── */}
      {real && (
        <>
          <CDSectionTitle>Analyses Yulia has run</CDSectionTitle>
          {work.analyses.length > 0 ? (
            <div style={workGrid}>
              {work.analyses.map(w => <WorkCard key={w.id} item={w} onOpen={() => openModel(w)} />)}
            </div>
          ) : (
            <CDCard style={{ fontSize: 13, color: "var(--cd-ink-2)", lineHeight: 1.5 }}>
              No DCF, LBO, or valuation modeled for this deal yet. Run one from <strong>Yulia's next moves</strong> above, or ask Yulia to value it.
            </CDCard>
          )}

          {work.documents.length > 0 && (
            <>
              <CDSectionTitle>Documents Yulia has drafted</CDSectionTitle>
              <div style={workGrid}>
                {work.documents.map(w => <WorkCard key={w.id} item={w} onOpen={() => openModel(w)} />)}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Stage track — CD stage nodes (done ✓ / current / upcoming) ────────── */
function StageTrack({ stages, color }: { stages: StageCell[]; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      {stages.map((s, i) => {
        const done = s.state === "done";
        const cur = s.state === "current";
        const nodeBg = done ? color : cur ? "var(--cd-surface)" : "var(--cd-surface)";
        return (
          <div key={s.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
              <div style={{ flex: 1, height: 2, borderRadius: 2, background: i === 0 ? "transparent" : (stages[i - 1].state === "done" ? color : "var(--cd-line-2)") }} />
              <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", background: nodeBg, border: done ? "none" : cur ? `2px solid ${color}` : "2px solid var(--cd-line-2)", boxShadow: cur ? `0 0 0 4px color-mix(in oklch, ${color}, transparent 84%)` : "none" }}>
                {done ? <CDIcon name="check" size={13} color="white" sw={2.6} /> : cur ? <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} /> : <span className="cd-num" style={{ fontSize: 10, fontWeight: 700, color: "var(--cd-ink-4)" }}>{i + 1}</span>}
              </div>
              <div style={{ flex: 1, height: 2, borderRadius: 2, background: i === stages.length - 1 ? "transparent" : (done ? color : "var(--cd-line-2)") }} />
            </div>
            <div style={{ fontSize: 11, fontWeight: cur ? 700 : 500, color: cur ? "var(--cd-ink)" : done ? "var(--cd-ink-2)" : "var(--cd-ink-4)", textAlign: "center", lineHeight: 1.25, padding: "0 2px" }}>{s.name}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── A produced-work card (analysis/model or document) ─────────────────── */
function WorkCard({ item, onOpen }: { item: ProducedWork; onOpen: () => void }) {
  return (
    <button onClick={onOpen} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "block", width: "100%", background: "var(--cd-surface)", border: "1px solid var(--cd-line)", borderRadius: "var(--cd-r-md)", boxShadow: "var(--cd-shadow-sm)", padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--cd-surface-2)", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <CDIcon name={item.kind === "analysis" ? "model" : "doc"} size={15} color="var(--cd-ink-2)" />
        </div>
        <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</span>
        <CDIcon name="chevright" size={15} color="var(--cd-ink-4)" />
      </div>
      <div className="cd-num" style={{ fontSize: 11.5, color: "var(--cd-ink-3)", marginTop: 8 }}>{item.meta}</div>
    </button>
  );
}

/* ─── Hero action pill ──────────────────────────────────────────────────── */
function HeroPill({ children, onClick, accent }: { children: ReactNode; onClick: () => void; accent?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 14px",
        borderRadius: "var(--cd-r-md)",
        border: accent ? "none" : "1px solid var(--cd-line-2)",
        background: accent ? "var(--cd-accent)" : "var(--cd-surface)",
        color: accent ? "white" : "var(--cd-ink-2)",
        fontSize: 12.5,
        fontWeight: 600,
        fontFamily: "var(--cd-sans)",
        cursor: "pointer",
        boxShadow: "var(--cd-shadow-sm)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

/* ─── Inline button styles ──────────────────────────────────────────────── */
const btnDark: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: "var(--cd-r-md)", border: "none", background: "var(--cd-ink)", color: "white", fontSize: 12.5, fontWeight: 600, fontFamily: "var(--cd-sans)", cursor: "pointer", whiteSpace: "nowrap" };
const btnGhost: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--cd-line-2)", background: "var(--cd-surface)", color: "var(--cd-ink-2)", fontSize: 11.5, fontWeight: 600, fontFamily: "var(--cd-sans)", cursor: "pointer" };
const iconBtn: CSSProperties = { width: 30, height: 30, borderRadius: 8, border: "1px solid var(--cd-line)", background: "var(--cd-surface)", display: "grid", placeItems: "center", cursor: "pointer" };
const bulletBtn: CSSProperties = { all: "unset", boxSizing: "border-box", display: "block", width: "100%", borderRadius: 10, padding: "11px 13px", background: "var(--cd-surface)", border: "1px solid var(--cd-line-2)", color: "var(--cd-ink-2)", fontSize: 13, lineHeight: 1.35, cursor: "pointer" };
const nextMoveRow: CSSProperties = { all: "unset", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, width: "100%", padding: "13px var(--cd-pad)", cursor: "pointer" };
const teamCta: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", marginTop: 13, padding: "9px", borderRadius: "var(--cd-r-md)", border: "1px solid var(--cd-line)", background: "var(--cd-surface-2)", cursor: "pointer", fontFamily: "var(--cd-sans)", fontSize: 12.5, fontWeight: 600, color: "var(--cd-ink-2)" };
const workGrid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "var(--cd-gap)" };
