/**
 * Atlas-mobile Deal cockpit (frame 05) — single-deal command view.
 *
 * Wiring mirrors the desktop sibling `desktop/screens/Cockpit.tsx` exactly (same
 * endpoints, same honest field remap) — re-laid as one stacked mobile column:
 *   GET /api/deals/:id              → deal row (money cents as STRINGS), gates[], deliverableStats
 *   GET /api/agency/deals/:id/brief → verdict / marketRead / taxLegal / nextMoves
 *   GET /api/deals/:id/participants → deal team (owner + participants) for the team row count
 *
 * Honest field remap (per the desktop sibling): there is NO discrete `citations`,
 * `fit`, `read`, or `risks` array on the brief. fit = verdict.score, read =
 * marketRead, risks = taxLegal.signoffFlags + marketRead.researchNeeded,
 * "citations" → marketRead.sourceSignals chips (NEVER fabricate a clause list).
 *
 * The shell renders the back bar (deal name), the scroll area, bottom nav
 * clearance, and the Yulia FAB. This screen returns ONLY body content.
 */
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { AtlasScreenProps } from "../../desktop/atlasNav";
import { useAtlasNav, useAtlasChat } from "../../desktop/atlasNav";
import { authHeaders } from "../../../../hooks/useAuth";
import type { SurfaceContext } from "../../../../lib/yuliaSurfaceContext";
import { T } from "../../desktop/atlasTokens";
import {
  Sparkle,
  Pill,
  Card,
  KpiCard,
  StepperPills,
  ProgressBar,
  SectionLabel,
  StatusDot,
  EmptyState,
  LoadingState,
  fmtCents,
} from "../../desktop/primitives";
import type { StepState } from "../../desktop/primitives";
import { ChevronRightIcon } from "../../desktop/icons";

/* ─── API shapes (honest to the real responses) ─────────────── */

interface DealGate {
  gate: string;
  status: string;
  completed_at: string | null;
}
interface DealRow {
  id: number;
  name?: string | null;
  business_name?: string | null;
  industry?: string | null;
  location?: string | null;
  journey_type?: string | null;
  current_gate?: string | null;
  revenue?: string | number | null;
  sde?: string | number | null;
  ebitda?: string | number | null;
  asking_price?: string | number | null;
  financials?: { multiple?: number | string | null } | null;
}
interface DealDetail {
  deal: DealRow;
  gates: DealGate[];
  deliverableStats: { total: number | string; completed: number | string; in_progress: number | string };
}

interface DealBrief {
  verdict?: { label?: string; score?: number; text?: string };
  marketRead?: { headline?: string; bullets?: string[]; sourceSignals?: string[]; researchNeeded?: string[] };
  taxLegal?: { tax?: string; legal?: string; signoffFlags?: string[] };
  nextMoves?: { title?: string; why?: string; prompt?: string; actionId?: string }[];
  /** True when a cached brief is served while a background refresh runs. */
  stale?: boolean;
}

interface Participant {
  id: number;
  user_id: number;
  role: string;
  access_level?: string;
  email?: string | null;
  display_name?: string | null;
}
interface ParticipantsResponse {
  owner?: { id: number; email?: string | null; display_name?: string | null; role: string };
  participants?: Participant[];
}

/* ─── helpers (verbatim from the desktop sibling) ───────────── */

/** Postgres numerics arrive as strings; coerce → number|null. */
function toNum(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function dealDisplayName(d: DealRow | null | undefined): string {
  if (!d) return "Deal";
  return d.name || d.business_name || d.industry || `Deal #${d.id}`;
}

/** Journey label, from journey_type / gate prefix. */
function journeyLabel(d: DealRow | null | undefined): string | null {
  const j = (d?.journey_type || "").toLowerCase();
  const prefix = (d?.current_gate || "").toString().charAt(0).toUpperCase();
  if (j.includes("buy") || prefix === "B") return "BUY-side";
  if (j.includes("sell") || prefix === "S") return "SELL-side";
  if (j.includes("raise") || prefix === "R") return "RAISE";
  if (j.includes("pmi") || prefix === "P") return "PMI";
  return null;
}

/** The six user-facing journey stages, keyed by gate prefix (CLAUDE.md journeys). */
const JOURNEY_STAGES: Record<string, string[]> = {
  B: ["Thesis", "Sourcing", "Valuation", "Diligence", "Structuring", "Closing"],
  S: ["Intake", "Financials", "Valuation", "Packaging", "Matching", "Closing"],
  R: ["Intake", "Package", "Materials", "Outreach", "Terms", "Closing"],
  P: ["Day 0", "Stabilization", "Assessment", "Optimization"],
};

/** Map the real gates[] (gate_progress rows) to labelled stepper pills. */
function buildGateSteps(deal: DealRow, gates: DealGate[]): { label: string; state: StepState }[] {
  const prefix = (deal.current_gate || gates[0]?.gate || deal.journey_type?.charAt(0) || "B")
    .toString()
    .charAt(0)
    .toUpperCase();
  const labels = JOURNEY_STAGES[prefix] ?? JOURNEY_STAGES.B;

  const idxFromGate = (g: string | null | undefined): number => {
    if (!g) return -1;
    const n = parseInt(g.toString().replace(/[^0-9]/g, ""), 10);
    return Number.isFinite(n) ? n : -1;
  };
  const currentIdx = idxFromGate(deal.current_gate);

  const completed = new Set(
    gates.filter((g) => (g.status || "").toLowerCase() === "complete" || g.completed_at).map((g) => idxFromGate(g.gate)),
  );

  return labels.map((label, i) => {
    let state: StepState = "upcoming";
    if (completed.has(i) || (currentIdx >= 0 && i < currentIdx)) state = "done";
    else if (currentIdx === i) state = "current";
    return { label, state };
  });
}

/** Verdict color family by label (green PURSUE/STRONG FIT, blue WATCH, terra risk). */
function verdictColors(label: string | undefined): { fg: string; bg: string } {
  const l = (label || "").toUpperCase();
  if (l.includes("PURSUE") || l.includes("STRONG")) return { fg: T.green, bg: T.greenBg };
  if (l.includes("WATCH") || l.includes("NEEDS")) return { fg: T.blue, bg: T.blueBg };
  if (l.includes("PASS") || l.includes("HIGH RISK")) return { fg: T.terra, bg: T.terraBg };
  return { fg: T.muted, bg: T.track };
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/* ─── in-file hooks (existing endpoints, no composite hook) ─── */

type LoadState = "idle" | "loading" | "ready" | "error";

function useDealCockpit(dealId: number | undefined) {
  const [detail, setDetail] = useState<DealDetail | null>(null);
  const [brief, setBrief] = useState<DealBrief | null>(null);
  const [detailState, setDetailState] = useState<LoadState>("idle");
  const [briefState, setBriefState] = useState<LoadState>("idle");

  useEffect(() => {
    if (dealId == null) return;
    let alive = true;
    setDetailState("loading");
    setBriefState("loading");

    fetch(`/api/deals/${dealId}`, { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`deal ${r.status}`))))
      .then((d: DealDetail) => {
        if (!alive) return;
        setDetail(d);
        setDetailState("ready");
      })
      .catch(() => {
        if (alive) setDetailState("error");
      });

    fetch(`/api/agency/deals/${dealId}/brief`, { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`brief ${r.status}`))))
      .then((b: DealBrief) => {
        if (!alive) return;
        setBrief(b);
        setBriefState("ready");
      })
      .catch(() => {
        if (alive) setBriefState("error");
      });

    return () => {
      alive = false;
    };
  }, [dealId]);

  return { detail, brief, detailState, briefState };
}

/** Roster count for the deal-team row (honest — no faked names/messages). */
function useDealTeamCount(dealId: number | undefined) {
  const [count, setCount] = useState<number | null>(null);
  const [state, setState] = useState<LoadState>("idle");

  useEffect(() => {
    if (dealId == null) return;
    let alive = true;
    setState("loading");
    fetch(`/api/deals/${dealId}/participants`, { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`participants ${r.status}`))))
      .then((p: ParticipantsResponse) => {
        if (!alive) return;
        const n = (p.owner ? 1 : 0) + (Array.isArray(p.participants) ? p.participants.length : 0);
        setCount(n);
        setState("ready");
      })
      .catch(() => {
        if (alive) setState("error");
      });
    return () => {
      alive = false;
    };
  }, [dealId]);

  return { count, state };
}

/* ─── small inline UI atoms ─────────────────────────────────── */

function SignalChip({ children }: { children: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: T.blueBg,
        color: T.blue,
        borderRadius: T.rPill,
        padding: "4px 11px",
        fontSize: 11.5,
        fontWeight: 500,
      }}
    >
      {children}
    </span>
  );
}

/** THIS-DEAL chip — a full-width row that routes a section into this deal's
 *  context via nav.go(screen, { dealId, dealName }). */
function ThisDealRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        background: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: T.rChip,
        boxShadow: T.shCard,
        padding: "13px 14px",
        fontSize: 14,
        fontWeight: 500,
        color: T.ink,
        cursor: "pointer",
        fontFamily: T.font,
        textAlign: "left",
      }}
    >
      <span style={{ flex: 1, minWidth: 0 }}>{label}</span>
      <ChevronRightIcon size={16} c={T.faint} />
    </button>
  );
}

/* ─── workflow card (honest progress from gates / deliverableStats) ─ */

function WorkflowCard({
  title,
  meta,
  pct,
  barColor,
  cta,
  onCta,
  items,
}: {
  title: string;
  meta: string;
  pct: number;
  barColor: string;
  cta?: string;
  onCta?: () => void;
  items: { label: string; state: "done" | "prog" | "open"; meta?: string }[];
}) {
  return (
    <Card pad={15} style={{ borderRadius: T.rCardLg }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: T.ink }}>{title}</div>
          <div style={{ fontSize: 11.5, color: T.muted2, fontWeight: 600 }}>{meta}</div>
        </div>
        {cta && onCta && (
          <button
            type="button"
            onClick={onCta}
            style={{
              border: "none",
              background: "none",
              padding: 0,
              fontSize: 12,
              fontWeight: 600,
              color: T.blue,
              cursor: "pointer",
              fontFamily: T.font,
              whiteSpace: "nowrap",
            }}
          >
            {cta} →
          </button>
        )}
      </div>
      <div style={{ marginTop: 11 }}>
        <ProgressBar pct={pct} color={barColor} />
      </div>
      {items.length > 0 && (
        <div style={{ marginTop: 6 }}>
          {items.map((it, i) => (
            <div
              key={`${it.label}-${i}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "7px 0",
                borderTop: `1px solid ${T.rowDiv2}`,
              }}
            >
              <StatusDot state={it.state} />
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: 13,
                  color: T.ink3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {it.label}
              </span>
              {it.meta && <span style={{ fontSize: 11.5, color: T.faint, flex: "none" }}>{it.meta}</span>}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/** Deal-scoped surface context (mirror of the desktop sibling). */
function dealSurfaceContext(
  dealId: number | undefined,
  dealName: string,
  deal: DealRow,
): SurfaceContext {
  const ctx: SurfaceContext = {
    device: "mobile",
    activeMode: "cockpit",
    activeView: "cockpit",
    activeTitle: dealName,
  };
  if (dealId != null) ctx.dealId = dealId;
  if (dealName) ctx.dealTitle = dealName;
  const stage = journeyLabel(deal);
  if (stage) ctx.dealStage = stage;
  return ctx;
}

/* ═══════════════════════════════════════════════════════════════
   COCKPIT MOBILE SCREEN
   ═══════════════════════════════════════════════════════════════ */

export default function CockpitMobileScreen({ view, user: _user }: AtlasScreenProps) {
  const nav = useAtlasNav();
  const chat = useAtlasChat();
  const dealId = view.dealId;

  const { detail, brief, detailState, briefState } = useDealCockpit(dealId);
  const team = useDealTeamCount(dealId);

  // No deal selected → honest empty.
  if (dealId == null) {
    return (
      <div style={padBody}>
        <EmptyState
          title="No deal open"
          hint="Open a deal from Deals to see its cockpit — verdict, gates, financials, workflows, and the deal team."
          cta="Go to Deals"
          onCta={() => nav.go("deals")}
        />
      </div>
    );
  }

  const loading = detailState === "loading" || detailState === "idle";
  if (loading && !detail) {
    return (
      <div style={padBody}>
        <LoadingState label="Loading deal cockpit…" />
      </div>
    );
  }

  if (detailState === "error" || !detail) {
    return (
      <div style={padBody}>
        <EmptyState
          title="Couldn’t load this deal"
          hint="The deal cockpit failed to load. It may not exist or you may not have access."
          cta="Back to Deals"
          onCta={() => nav.go("deals")}
        />
      </div>
    );
  }

  const deal = detail.deal;
  const name = dealDisplayName(deal);
  const dealName = view.dealName || name;

  // Money — integer cents arrive as strings on the deal row.
  const revenue = toNum(deal.revenue);
  const adjEbitda = toNum(deal.ebitda) ?? toNum(deal.sde);
  const asking = toNum(deal.asking_price);
  const multipleRaw = toNum(deal.financials?.multiple);
  const EBITDA_FLOOR_CENTS = 100_000; // $1,000 — below this a ratio is noise
  const derived =
    asking != null && adjEbitda != null && adjEbitda >= EBITDA_FLOOR_CENTS ? asking / adjEbitda : null;
  const impliedMultiple =
    multipleRaw != null ? multipleRaw : derived != null && derived > 0 && derived <= 50 ? derived : null;

  const gateSteps = buildGateSteps(deal, detail.gates);

  // Verdict + fit (fit = verdict.score; only render if real).
  const verdict = brief?.verdict;
  const vColors = verdictColors(verdict?.label);
  const fitScore = typeof verdict?.score === "number" && verdict.score > 0 ? verdict.score : null;
  const jLabel = journeyLabel(deal);

  // Deliverable + gate progress for workflow cards (honest counts, guarded).
  const dStats = detail.deliverableStats;
  const dTotalRaw = Math.max(0, toNum(dStats.total) ?? 0);
  const dDoneRaw = Math.max(0, toNum(dStats.completed) ?? 0);
  const dProgRaw = Math.max(0, toNum(dStats.in_progress) ?? 0);
  const dTotal = dTotalRaw;
  const dDone = Math.min(dDoneRaw, dTotal);
  const dProg = Math.min(dProgRaw, Math.max(0, dTotal - dDone));
  const deliverablePct = dTotal > 0 ? Math.round((dDone / dTotal) * 100) : 0;

  const gateDone = gateSteps.filter((s) => s.state === "done").length;
  const gateTotal = gateSteps.length;
  const gatePct = gateTotal > 0 ? Math.round((gateDone / gateTotal) * 100) : 0;

  // Risk rows: real signoff flags + research-needed (NEVER a fabricated clause list).
  const signoffFlags = brief?.taxLegal?.signoffFlags ?? [];
  const researchNeeded = brief?.marketRead?.researchNeeded ?? [];
  const riskRows = [...signoffFlags, ...researchNeeded];
  const sourceSignals = brief?.marketRead?.sourceSignals ?? [];

  const askYulia = (prompt: string) => chat?.send(prompt, dealSurfaceContext(dealId, dealName, deal));

  return (
    <div style={col}>
      {/* ── A. Verdict / fit / journey (shell renders the back bar w/ deal name) ── */}
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, paddingTop: 2 }}>
        {jLabel && (
          <Pill bg={T.track} fg={T.label}>
            {jLabel}
          </Pill>
        )}
        {briefState === "loading" && (
          <span
            aria-hidden="true"
            style={{ display: "inline-block", width: 118, height: 22, borderRadius: T.rPill, background: T.track }}
          />
        )}
        {briefState === "ready" && verdict?.label && (
          <Pill bg={vColors.bg} fg={vColors.fg}>
            Verdict · {titleCase(verdict.label)}
          </Pill>
        )}
        {briefState === "ready" && fitScore != null && (
          <span style={{ fontSize: 12.5, color: T.muted }}>
            Fit <b style={{ color: T.ink }}>{fitScore}</b>/100
          </span>
        )}
      </div>

      {/* ── B. Journey gate pills (edge-bleed horizontal scroll) ── */}
      <div className="scr" style={edgeBleed}>
        <StepperPills steps={gateSteps} />
      </div>

      {/* ── C. KPI cards (2-up grid, stacked) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
        <KpiCard label="REVENUE" value={fmtCents(revenue)} />
        <KpiCard label="ADJ. EBITDA" value={fmtCents(adjEbitda)} />
        <KpiCard label="ASKING" value={fmtCents(asking)} />
        <KpiCard
          label="IMPLIED MULTIPLE"
          value={impliedMultiple != null ? `${impliedMultiple.toFixed(1)}×` : "—"}
        />
      </div>

      {/* ── D. Yulia's read ── */}
      <Card pad={15} style={{ borderRadius: T.rCardLg }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Sparkle size={15} />
          <span style={{ fontSize: 14.5, fontWeight: 600, color: T.ink }}>Yulia’s read</span>
          {briefState === "ready" && brief?.stale && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: T.amber,
                background: T.amberBg,
                borderRadius: T.rPill,
                padding: "2px 9px",
              }}
              title="Showing the last read while Yulia refreshes it."
            >
              Updating…
            </span>
          )}
        </div>

        {briefState === "loading" && <LoadingState label="Reading the deal…" />}

        {briefState === "error" && (
          <div style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.6 }}>
            Yulia’s read isn’t available right now.
          </div>
        )}

        {briefState === "ready" && (
          <>
            <div style={{ fontSize: 13.5, lineHeight: 1.7, color: T.ink2 }}>
              {brief?.marketRead?.headline || "—"}
            </div>
            {(brief?.marketRead?.bullets?.length ?? 0) > 0 && (
              <ul style={{ margin: "12px 0 0", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
                {brief!.marketRead!.bullets!.map((b, i) => (
                  <li key={i} style={{ fontSize: 13, lineHeight: 1.55, color: T.ink3 }}>
                    {b}
                  </li>
                ))}
              </ul>
            )}

            {/* Key risks — real signoff flags + research gaps, never fabricated clauses */}
            {riskRows.length > 0 && (
              <div style={{ marginTop: 15 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 4 }}>Key risks</div>
                {riskRows.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 9,
                      alignItems: "flex-start",
                      borderTop: `1px solid ${T.rowDiv}`,
                      padding: "7px 0",
                      fontSize: 13,
                      color: T.ink3,
                      lineHeight: 1.5,
                    }}
                  >
                    <span style={{ color: T.terra, flex: "none", fontSize: 13 }} aria-hidden="true">
                      ⚑
                    </span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Source signals (the honest stand-in for a discrete "citations" list) */}
            {sourceSignals.length > 0 && (
              <div style={{ marginTop: 15 }}>
                <SectionLabel>Source signals</SectionLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 8 }}>
                  {sourceSignals.map((s, i) => (
                    <SignalChip key={i}>{s}</SignalChip>
                  ))}
                </div>
              </div>
            )}

            {chat != null && (
              <button
                type="button"
                onClick={() => askYulia(`Give me your read on ${dealName}.`)}
                style={{
                  marginTop: 15,
                  width: "100%",
                  textAlign: "center",
                  border: `1px solid ${T.border}`,
                  background: T.white,
                  borderRadius: T.rPill,
                  padding: "9px 14px",
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: T.blue,
                  cursor: "pointer",
                  fontFamily: T.font,
                }}
              >
                Ask Yulia about this deal →
              </button>
            )}
          </>
        )}
      </Card>

      {/* ── E. Workflows (honest: deliverable + gate progress) ── */}
      <WorkflowCard
        title="Deliverables"
        meta={`${dDone} / ${dTotal} complete`}
        pct={deliverablePct}
        barColor={T.blue}
        cta="Files"
        onCta={() => nav.go("files", { dealId, dealName })}
        items={
          dTotal > 0
            ? [
                { label: "Completed", state: "done", meta: String(dDone) },
                ...(dProg > 0 ? [{ label: "In progress", state: "prog" as const, meta: String(dProg) }] : []),
                ...(dTotal - dDone - dProg > 0
                  ? [{ label: "Not started", state: "open" as const, meta: String(dTotal - dDone - dProg) }]
                  : []),
              ]
            : []
        }
      />
      <WorkflowCard
        title="Journey progress"
        meta={`${gateDone} / ${gateTotal} stages`}
        pct={gatePct}
        barColor={T.green}
        cta="Studio"
        onCta={() => nav.go("studio", { dealId, dealName })}
        items={gateSteps.map((s) => ({
          label: s.label,
          state: s.state === "done" ? "done" : s.state === "current" ? "prog" : "open",
        }))}
      />

      {dTotal === 0 && (
        <div style={{ fontSize: 12.5, color: T.muted2, marginTop: -4 }}>
          No deliverables yet — ask Yulia to draft the first one for this deal.
        </div>
      )}

      {/* ── F. Deal team row (honest count → Members) ── */}
      <button
        type="button"
        onClick={() => nav.openSettings("members")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 11,
          width: "100%",
          background: T.white,
          border: `1px solid ${T.border}`,
          borderRadius: T.rCardLg,
          boxShadow: T.shCard,
          padding: 14,
          cursor: "pointer",
          fontFamily: T.font,
          textAlign: "left",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>Deal team</div>
          <div style={{ fontSize: 12, color: T.muted2, marginTop: 2 }}>
            {team.state === "ready"
              ? team.count != null
                ? `${team.count} ${team.count === 1 ? "member" : "members"}`
                : "—"
              : team.state === "error"
                ? "Members unavailable"
                : "Loading members…"}
          </div>
        </div>
        <ChevronRightIcon size={16} c={T.faint} />
      </button>

      {/* ── G. THIS DEAL chips → nav.go(..., { dealId }) ── */}
      <div style={{ marginTop: 2 }}>
        <SectionLabel>This deal</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 9 }}>
          <ThisDealRow label="Files" onClick={() => nav.go("files", { dealId, dealName })} />
          <ThisDealRow label="Studio" onClick={() => nav.go("studio", { dealId, dealName })} />
          <ThisDealRow label="Deals" onClick={() => nav.go("deals", { dealId, dealName })} />
          <ThisDealRow label="Integration" onClick={() => nav.go("integration", { dealId, dealName })} />
          <ThisDealRow label="Sourcing" onClick={() => nav.go("sourcing", { dealId, dealName })} />
        </div>
      </div>
    </div>
  );
}

/* ─── styles ────────────────────────────────────────────────── */

/** The stacked body column. Horizontal padding 0 18px (shell owns the scroll +
 *  bottom nav clearance). */
const col: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  padding: "10px 18px 8px",
};

/** Padding wrapper for the empty / loading / error states. */
const padBody: CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  padding: "10px 18px",
};

/** Edge-bleed horizontal scroller (full-width gate-pill row). */
const edgeBleed: CSSProperties = {
  margin: "0 -18px",
  padding: "2px 18px 4px",
  overflowX: "auto",
};
