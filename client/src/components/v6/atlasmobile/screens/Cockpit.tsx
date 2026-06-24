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
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { AtlasScreenProps } from "../../desktop/atlasNav";
import { useAtlasNav, useAtlasChat } from "../../desktop/atlasNav";
import { useMobileShell } from "../mobileShell";
import { useModelStore } from "../../../../lib/modelStore";
import { listCanvasArtifacts } from "../../desktop/screens/Canvas";
import { authHeaders } from "../../../../hooks/useAuth";
import type { SurfaceContext } from "../../../../lib/yuliaSurfaceContext";
import { T } from "../../desktop/atlasTokens";
import { RT } from "../redesign/rt";
import { Hero, SectionHeader, DetailSection, Divider, ActionRow, ButtonRow } from "../redesign/kit";
import { ChevronRightIcon } from "../../desktop/icons";
import {
  Sparkle,
  Pill,
  ProgressBar,
  EmptyState,
  LoadingState,
  fmtCents,
} from "../../desktop/primitives";
import type { StepState } from "../../desktop/primitives";

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

/* ═══════════════════════════════════════════════════════════════
   COCKPIT MOBILE SCREEN
   ═══════════════════════════════════════════════════════════════ */

export default function CockpitMobileScreen({ view, user: _user }: AtlasScreenProps) {
  const nav = useAtlasNav();
  const chat = useAtlasChat();
  const shell = useMobileShell();
  const dealId = view.dealId;

  const { detail, brief, detailState, briefState } = useDealCockpit(dealId);
  const team = useDealTeamCount(dealId);

  // What Yulia has opened on the canvas FOR THIS DEAL — so the user can return to
  // her analyses/models instead of asking her to redo them. Sourced from the live
  // model store + the artifact registry (session). (Cross-reload rehydration from
  // the server's canvas_tabs is the next step — the work is already saved there.)
  const modelTabs = useModelStore((s) => s.tabs);
  // The artifact registry is non-reactive; rehydration/registration fire a
  // window event so we recompute when Yulia's canvas work lands or is restored.
  const [canvasVersion, setCanvasVersion] = useState(0);
  useEffect(() => {
    const onChange = () => setCanvasVersion((v) => v + 1);
    window.addEventListener("atlas:canvas-changed", onChange);
    return () => window.removeEventListener("atlas:canvas-changed", onChange);
  }, []);
  const canvasItems = useMemo(() => {
    if (dealId == null) return [] as { id: string; label: string; kind: string }[];
    const models = Object.values(modelTabs)
      .filter((t) => t.dealId === dealId)
      .map((t) => ({ id: t.id, label: t.title || "Interactive model", kind: "Model" }));
    const analyses = listCanvasArtifacts(dealId).map((a) => ({
      id: a.id,
      label: a.title || "Analysis",
      kind: "Analysis",
    }));
    return [...models, ...analyses];
    // canvasVersion forces a recompute when the (non-reactive) registry changes.
  }, [modelTabs, dealId, canvasVersion]);

  // No deal selected → honest empty.
  if (dealId == null) {
    return (
      <div style={padBody}>
        <EmptyState accent={RT.accent} onAccent={RT.onAccent}
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
        <EmptyState accent={RT.accent} onAccent={RT.onAccent}
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

  // Enterprise value (EV) — the analytical valuation, led with as the hero
  // instead of the seller's asking price (asking is a negotiation input shown as
  // a detail). Implied EV = adj. EBITDA × the implied multiple; falls back to
  // asking → EBITDA → revenue. (When the multiple is only derived from asking,
  // EV ≈ asking — honest until a real valuation lands.)
  const enterpriseValue =
    adjEbitda != null && impliedMultiple != null && impliedMultiple > 0
      ? Math.round(adjEbitda * impliedMultiple)
      : (asking ?? adjEbitda ?? revenue);

  const gateSteps = buildGateSteps(deal, detail.gates);

  // Verdict + fit (fit = verdict.score; only render if real).
  const verdict = brief?.verdict;
  const vColors = verdictColors(verdict?.label);
  const fitScore = typeof verdict?.score === "number" && verdict.score > 0 ? verdict.score : null;
  const jLabel = journeyLabel(deal);

  // Deliverable counts for the Manage row (honest, guarded).
  const dStats = detail.deliverableStats;
  const dTotal = Math.max(0, toNum(dStats.total) ?? 0);
  const dDone = Math.min(Math.max(0, toNum(dStats.completed) ?? 0), dTotal);

  const gateDone = gateSteps.filter((s) => s.state === "done").length;
  const gateTotal = gateSteps.length;
  const gatePct = gateTotal > 0 ? Math.round((gateDone / gateTotal) * 100) : 0;

  // Risk rows: real signoff flags + research-needed (NEVER a fabricated clause list).
  const signoffFlags = brief?.taxLegal?.signoffFlags ?? [];
  const researchNeeded = brief?.marketRead?.researchNeeded ?? [];
  const riskRows = [...signoffFlags, ...researchNeeded];

  // The hero leads with Enterprise Value (the valuation), NOT the asking price.
  // NO sparkline: a deal has no honest time-series, and fabricating a trend would
  // break the zero-hallucination rule.
  const heroFig = { label: "Enterprise value", value: enterpriseValue as number | null };

  const currentStage = gateSteps.find((s) => s.state === "current")?.label ?? null;
  const stageIndex = Math.min(gateDone + 1, gateTotal); // 1-based "stage N of M"
  const nextMove = brief?.nextMoves?.[0];
  const riskCount = riskRows.length;

  // Deal-scoped context so the Yulia sheet opens already knowing this deal.
  const ctx: SurfaceContext = {
    device: "mobile",
    activeMode: "cockpit",
    activeView: "cockpit",
    activeTitle: dealName,
    dealId: dealId ?? undefined,
    dealTitle: dealName,
    dealStage: jLabel ?? undefined,
  };
  const askYulia = (prompt: string) => {
    chat?.send(prompt, ctx);
    shell?.openChat();
  };

  return (
    <div style={col}>
      {/* ── Hero: headline figure + verdict, stage folded into the sub ── */}
      <Hero
        label={heroFig.label}
        value={fmtCents(heroFig.value)}
        trailing={
          briefState === "ready" && verdict?.label ? (
            <Pill bg={vColors.bg} fg={vColors.fg}>{titleCase(verdict.label)}</Pill>
          ) : briefState === "loading" ? (
            <span
              aria-hidden="true"
              style={{ display: "inline-block", width: 92, height: 24, borderRadius: RT.rPill, background: RT.line }}
            />
          ) : null
        }
        sub={
          <>
            {jLabel ?? "Deal"}
            {currentStage && <> · {currentStage}</>}
            {briefState === "ready" && fitScore != null && (
              <>
                {" · "}Fit <b style={{ color: RT.ink2, fontWeight: 600 }}>{fitScore}</b>
              </>
            )}
            {briefState === "loading" && " · reading…"}
          </>
        }
      />

      {/* ── One clean stage indicator (replaces the busy stepper) ── */}
      {gateTotal > 0 && (
        <div>
          <ProgressBar pct={gatePct} color={RT.accentInk} />
          <div style={{ fontSize: 13, color: RT.muted, marginTop: 7 }}>
            Stage {stageIndex} of {gateTotal}
            {currentStage ? ` · ${currentStage}` : ""}
          </div>
        </div>
      )}

      {/* ── Next: the one thing to do — the manage-the-deal driver ── */}
      {briefState === "ready" && nextMove?.title && (
        <button
          type="button"
          onClick={() => askYulia(nextMove.prompt || `What's the next step on ${dealName}?`)}
          style={nextCard}
        >
          <span style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
            <span style={nextEyebrow}>Next</span>
            <span style={nextTitle}>{nextMove.title}</span>
            {nextMove.why && <span style={nextWhy}>{nextMove.why}</span>}
          </span>
          <ChevronRightIcon size={20} c={RT.accentInk} />
        </button>
      )}

      {/* ── Quick surfaces ── */}
      <ButtonRow
        buttons={[
          { label: "Data room", onClick: () => nav.go("files", { dealId, dealName }) },
          { label: "Studio", onClick: () => nav.go("studio", { dealId, dealName }) },
        ]}
      />

      {/* ── Key numbers (asking is the seller's number — a negotiation detail) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
        <Stat label="Revenue" value={fmtCents(revenue)} />
        <Stat label="Adj. EBITDA" value={fmtCents(adjEbitda)} />
        <Stat label="Multiple" value={impliedMultiple != null ? `${impliedMultiple.toFixed(1)}×` : "—"} />
        <Stat label="Asking" value={fmtCents(asking)} />
      </div>

      {/* ── Yulia's read — concise headline + a risk LINK (full read via Yulia) ── */}
      <Divider />
      <SectionHeader
        style={{ display: "flex", alignItems: "center", gap: 8, margin: "26px 0 0", fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}
      >
        <Sparkle size={18} />
        Yulia&rsquo;s read
        {briefState === "ready" && brief?.stale && (
          <span
            style={{ fontSize: 12.5, fontWeight: 500, color: T.amber, background: T.amberBg, borderRadius: RT.rPill, padding: "3px 10px" }}
            title="Showing the last read while Yulia refreshes it."
          >
            Updating…
          </span>
        )}
      </SectionHeader>

      <div style={panel}>
        {briefState === "loading" && <LoadingState label="Reading the deal…" />}

        {briefState === "error" && (
          <div style={{ fontSize: 14.5, color: RT.muted, lineHeight: 1.6 }}>
            Yulia&rsquo;s read isn&rsquo;t available right now.
          </div>
        )}

        {briefState === "ready" && (
          <>
            <div style={{ fontSize: 15.5, lineHeight: 1.65, color: RT.ink2 }}>{brief?.marketRead?.headline || "—"}</div>
            {/* Risks collapse to a link — tap to have Yulia walk them through (no dump) */}
            {riskCount > 0 && (
              <button
                type="button"
                onClick={() => askYulia(`Walk me through the open risks on ${dealName}.`)}
                style={riskLink}
              >
                <span style={{ color: RT.down }} aria-hidden="true">
                  ⚑
                </span>
                {riskCount} {riskCount === 1 ? "thing" : "things"} to check
                <ChevronRightIcon size={15} c={RT.muted} />
              </button>
            )}
          </>
        )}
      </div>

      {/* ── On the canvas — Yulia's analyses for this deal (return, don't redo) ── */}
      {canvasItems.length > 0 && (
        <>
          <Divider />
          <DetailSection title="On the canvas" desc="Models and analyses Yulia opened for this deal — tap to reopen.">
            {canvasItems.map((it) => (
              <ActionRow
                key={it.id}
                leading={<Sparkle size={18} />}
                title={it.label}
                sub={it.kind}
                action={<ChevronRightIcon size={18} c={RT.faint} />}
                onClick={() => nav.openCanvas(it.id, dealId ?? undefined)}
              />
            ))}
          </DetailSection>
        </>
      )}

      {/* ── Manage this deal — the drill-ins ── */}
      <Divider />
      <DetailSection title="Manage">
        <ActionRow
          title="Deliverables"
          sub={dTotal > 0 ? `${dDone} / ${dTotal} complete` : "None yet — draft one in Studio"}
          action={<ChevronRightIcon size={18} c={RT.faint} />}
          onClick={() => nav.go("studio", { dealId, dealName })}
        />
        <ActionRow
          title="Deal team"
          sub={
            team.state === "ready"
              ? team.count != null
                ? `${team.count} ${team.count === 1 ? "member" : "members"}`
                : "—"
              : team.state === "error"
                ? "Members unavailable"
                : "Loading members…"
          }
          action={<ChevronRightIcon size={18} c={RT.faint} />}
          onClick={() => nav.openSettings("members")}
        />
        <ActionRow
          title="Integration"
          action={<ChevronRightIcon size={18} c={RT.faint} />}
          onClick={() => nav.go("integration", { dealId, dealName })}
        />
      </DetailSection>
    </div>
  );
}

/** Flat stat tile (white-on-grey, no card chrome). */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={statTile}>
      <div style={statValue}>{value}</div>
      <div style={statLabel}>{label}</div>
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

/** Flat white panel — separation by tone (no border, no shadow). */
const panel: CSSProperties = {
  background: RT.card,
  borderRadius: RT.rCard,
  padding: 16,
};

/** Flat stat tile (white-on-grey). */
const statTile: CSSProperties = {
  background: RT.card,
  borderRadius: 14,
  padding: "12px 12px 11px",
  minWidth: 0,
};
const statValue: CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  color: RT.ink,
  letterSpacing: "-0.01em",
  lineHeight: 1.15,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};
const statLabel: CSSProperties = { fontSize: 12.5, color: RT.muted, marginTop: 3 };

/** "Next" card — the manage-the-deal driver (pale-green highlight, tappable). */
const nextCard: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  width: "100%",
  background: RT.accentSoft,
  border: "none",
  borderRadius: RT.rCard,
  padding: "14px 16px",
  cursor: "pointer",
  fontFamily: RT.font,
  WebkitTapHighlightColor: "transparent",
};
const nextEyebrow: CSSProperties = { display: "block", fontSize: 12.5, fontWeight: 600, color: RT.accentInk, marginBottom: 3 };
const nextTitle: CSSProperties = { display: "block", fontSize: 17, fontWeight: 600, color: RT.ink, lineHeight: 1.3 };
const nextWhy: CSSProperties = { display: "block", fontSize: 14, color: RT.ink2, lineHeight: 1.4, marginTop: 3 };

/** Risk count → a tappable link (no risk dump in the read). */
const riskLink: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  marginTop: 14,
  background: "transparent",
  border: "none",
  padding: 0,
  cursor: "pointer",
  fontFamily: RT.font,
  fontSize: 14.5,
  fontWeight: 600,
  color: RT.ink,
};
