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
import { RT } from "../redesign/rt";
import { SectionHeader, DetailSection, ActionRow, ButtonRow } from "../redesign/kit";
import { ChevronRightIcon, BackIcon } from "../../desktop/icons";
import {
  Sparkle,
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

/** Verdict color family (rationed: green PURSUE/STRONG, grey-neutral WATCH, terra risk). */
function verdictColors(label: string | undefined): { fg: string; bg: string } {
  const l = (label || "").toUpperCase();
  if (l.includes("PURSUE") || l.includes("STRONG")) return { fg: RT.accentInk, bg: RT.accentSoft };
  if (l.includes("WATCH") || l.includes("NEEDS")) return { fg: RT.muted, bg: RT.line };
  if (l.includes("PASS") || l.includes("HIGH RISK")) return { fg: RT.down, bg: RT.line };
  return { fg: RT.muted, bg: RT.line };
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
  // The cockpit IS the top-level deal surface (the shell renders no header for it),
  // so it owns a full-bleed textured header with its own back button + deal name.
  // When embedded as the Canvas fallback (view.screen === "canvas"), the Canvas
  // header handles nav, so the banner skips the back row + the full-bleed top.
  const ownHeader = view.screen === "cockpit";

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

  // Enterprise value (EV) = adj. EBITDA × multiple. Prefer an EXPLICIT valuation
  // multiple (financials.multiple); when none exists, use the asking-IMPLIED
  // multiple so EV shows the implied valuation at the current ask rather than a
  // blank "—". (Honest: it's a derivation of real EBITDA + ask, not a fabricated
  // figure — and it lines up with the Multiple shown in the financials card.)
  const evMultiple = multipleRaw != null && multipleRaw > 0 ? multipleRaw : impliedMultiple;
  const enterpriseValue =
    adjEbitda != null && evMultiple != null && evMultiple > 0
      ? Math.round(adjEbitda * evMultiple)
      : null;

  const gateSteps = buildGateSteps(deal, detail.gates);

  // Verdict + fit (fit = verdict.score; only render if real).
  const verdict = brief?.verdict;
  const vColors = verdictColors(verdict?.label);
  const fitScore = typeof verdict?.score === "number" && verdict.score > 0 ? verdict.score : null;
  const jLabel = journeyLabel(deal);
  // Header texture by journey: BUY-side reads BLUE (texture-hero-2), everything else
  // the teal-green SELL wash (texture-hero-1) — paired with a matching dark scrim.
  const headerBg = jLabel === "BUY-side" ? HEADER_BG_BUY : HEADER_BG_SELL;

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
  const bullets = brief?.marketRead?.bullets ?? [];
  const sourceSignals = brief?.marketRead?.sourceSignals ?? [];

  // The hero leads with Enterprise Value (the valuation), NOT the asking price.
  // NO sparkline: a deal has no honest time-series, and fabricating a trend would
  // break the zero-hallucination rule.
  const heroFig = { label: "Enterprise value", value: enterpriseValue as number | null };

  const currentStage = gateSteps.find((s) => s.state === "current")?.label ?? null;
  const stageIndex = Math.min(gateDone + 1, gateTotal); // 1-based "stage N of M"
  const nextMove = brief?.nextMoves?.[0];

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
      {/* ── Artful header banner: the deal headline (EV + verdict + stage) over a
            brand texture — the Cash App "colored hero" moment. White text on a
            green-scrimmed teal wash; full-bleed to the very top with its own back
            button + deal name when this is the standalone cockpit surface. ── */}
      <div style={{ ...(ownHeader ? heroBannerFull : heroBanner), background: headerBg }}>
        {ownHeader && (
          <div style={heroNav}>
            <button type="button" aria-label="Back" onClick={() => nav.go("deals")} style={heroBackBtn}>
              <BackIcon size={22} c="#fff" />
            </button>
            <span style={heroNavTitle}>{dealName}</span>
            <span style={{ width: 40, flex: "none" }} aria-hidden="true" />
          </div>
        )}
        <div style={heroLabelLight}>{heroFig.label}</div>
        <div style={heroValRow}>
          <span style={heroValueLight}>
            {heroFig.value == null ? (
              <span style={{ opacity: 0.6, fontWeight: 600, fontSize: 36 }}>—</span>
            ) : (
              fmtCents(heroFig.value)
            )}
          </span>
          {briefState === "ready" && verdict?.label ? (
            <span style={{ ...heroVerdict, color: vColors.fg }}>{titleCase(verdict.label)}</span>
          ) : briefState === "loading" ? (
            <span
              aria-hidden="true"
              style={{ display: "inline-block", width: 88, height: 26, borderRadius: RT.rPill, background: "rgba(255,255,255,.25)", marginBottom: 4 }}
            />
          ) : null}
        </div>
        <div style={heroSubLight}>
          {jLabel ?? "Deal"}
          {currentStage && <> · {currentStage}</>}
          {briefState === "ready" && fitScore != null && (
            <>
              {" · "}Fit <b style={{ color: "#fff", fontWeight: 700 }}>{fitScore}</b>
            </>
          )}
          {briefState === "loading" && " · reading…"}
        </div>
        {gateTotal > 0 && (
          <div style={{ marginTop: 18 }}>
            <div style={heroStageTrack}>
              <div style={{ ...heroStageFill, width: `${gatePct}%` }} />
            </div>
            <div style={heroStageLabel}>
              Stage {stageIndex} of {gateTotal}
              {currentStage ? ` · ${currentStage}` : ""}
            </div>
          </div>
        )}
      </div>

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

      {/* ── Key numbers → one clean card of rows (asking is the seller's number) ── */}
      <div style={finCard}>
        <FinRow label="Revenue" value={fmtCents(revenue)} />
        <FinRow label="Adj. EBITDA" value={fmtCents(adjEbitda)} />
        <FinRow label="Multiple" value={impliedMultiple != null ? `${impliedMultiple.toFixed(1)}×` : "—"} />
        <FinRow label="Asking" value={fmtCents(asking)} last />
      </div>

      {/* ── Yulia's read — concise headline + a risk LINK (full read via Yulia) ── */}
      <SectionHeader
        style={{ display: "flex", alignItems: "center", gap: 9, margin: "38px 0 0", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}
      >
        <Sparkle size={20} />
        Yulia&rsquo;s read
        {briefState === "ready" && brief?.stale && (
          <span
            style={{ fontSize: 12.5, fontWeight: 500, color: RT.muted, background: RT.line, borderRadius: RT.rPill, padding: "3px 10px" }}
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
            {/* Structured synopsis (NOT a verbose dump): the read, key points, and
                what still needs confirming — all from the persisted brief. */}
            <div style={readSummary}>{brief?.marketRead?.headline || "—"}</div>

            {bullets.length > 0 && (
              <div style={{ marginTop: 16 }}>
                {bullets.map((b, i) => (
                  <div key={i} style={readPoint}>
                    <span style={readDot} aria-hidden="true" />
                    <span style={readPointText}>{b}</span>
                  </div>
                ))}
              </div>
            )}

            {sourceSignals.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={readSubLabel}>Market signals</div>
                {sourceSignals.map((s, i) => (
                  <div key={i} style={readPoint}>
                    <span style={{ ...readDot, background: RT.up }} aria-hidden="true" />
                    <span style={readPointText}>{s}</span>
                  </div>
                ))}
              </div>
            )}

            {riskRows.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={readSubLabel}>Needs confirming</div>
                {riskRows.map((r, i) => (
                  <div key={i} style={readPoint}>
                    <span style={{ color: RT.down, flex: "none", fontSize: 13, marginTop: 1 }} aria-hidden="true">
                      ⚑
                    </span>
                    <span style={readPointText}>{r}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Interact — the full read lives here + the chat already knows it. */}
            <button type="button" onClick={() => askYulia(`Let's talk through your read on ${dealName}.`)} style={readDiscuss}>
              Discuss with Yulia
              <ChevronRightIcon size={15} c={RT.accentInk} />
            </button>
          </>
        )}
      </div>

      {/* ── On the canvas — Yulia's analyses for this deal (return, don't redo) ── */}
      {canvasItems.length > 0 && (
        <>
          <DetailSection card title="On the canvas" desc="Models and analyses Yulia opened for this deal — tap to reopen.">
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
      <DetailSection card title="Manage">
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

/** One financial metric as a card row: label left (muted), value right (big, dark). */
function FinRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div style={{ ...finRow, borderBottom: last ? "none" : "1px solid rgba(0,0,0,.05)" }}>
      <span style={finRowLabel}>{label}</span>
      <span style={finRowValue}>{value}</span>
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

/* ─── Artful header banner (texture-backed hero) ───────────────── */

/** Textured header: a teal brand wash (texture-hero-1) under a deep-green scrim so
 *  the white EV reads. Square corners, edge-to-edge. `heroBanner` is the embedded
 *  (Canvas-fallback) variant that sits below the shell header. */
/** Header washes by journey (texture + matching dark scrim for white text). */
const HEADER_BG_SELL =
  "linear-gradient(164deg, rgba(11,58,42,0.34) 0%, rgba(6,32,23,0.84) 100%), url(/textures/texture-hero-1.jpg) center / cover no-repeat";
const HEADER_BG_BUY =
  "linear-gradient(164deg, rgba(13,40,74,0.32) 0%, rgba(7,20,44,0.85) 100%), url(/textures/texture-hero-2.jpg) center / cover no-repeat";

const heroBannerBase: CSSProperties = {
  margin: "-10px -18px 0", // cancel the col's top + side padding → edge-to-edge
  padding: "16px 20px 22px",
  position: "relative",
  color: "#fff",
  background: HEADER_BG_SELL, // default; overridden per-journey inline
  overflow: "hidden",
};
const heroBanner: CSSProperties = heroBannerBase;
/** Standalone cockpit: full-bleed to the very top (no shell header above), so the
 *  texture goes behind the status bar. The safe-area inset clears the notch. */
const heroBannerFull: CSSProperties = {
  ...heroBannerBase,
  paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)",
};
/** In-banner nav row (white back button + centered deal name) over the texture. */
const heroNav: CSSProperties = { display: "flex", alignItems: "center", marginBottom: 16 };
const heroBackBtn: CSSProperties = {
  width: 40,
  height: 40,
  marginLeft: -8,
  flex: "none",
  border: "none",
  background: "transparent",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  borderRadius: "50%",
  WebkitTapHighlightColor: "transparent",
};
const heroNavTitle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  textAlign: "center",
  fontSize: 17,
  fontWeight: 600,
  color: "#fff",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};
const heroLabelLight: CSSProperties = { fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.82)" };
const heroValRow: CSSProperties = { display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginTop: 4 };
const heroValueLight: CSSProperties = { fontSize: 53, fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1, color: "#fff" };
const heroVerdict: CSSProperties = {
  flex: "none",
  background: "rgba(255,255,255,0.96)",
  borderRadius: RT.rPill,
  padding: "5px 14px",
  fontSize: 13.5,
  fontWeight: 700,
  whiteSpace: "nowrap",
  marginBottom: 4,
};
const heroSubLight: CSSProperties = { fontSize: 14.5, color: "rgba(255,255,255,0.8)", marginTop: 10 };
const heroStageTrack: CSSProperties = { height: 5, borderRadius: 999, background: "rgba(255,255,255,0.26)", overflow: "hidden" };
const heroStageFill: CSSProperties = { height: "100%", background: "#fff", borderRadius: 999 };
const heroStageLabel: CSSProperties = { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 9 };

/** White content card — separation by tone (no border, no shadow). Padding matches
 *  the financials / Manage cards (18px horizontal) so every card aligns. */
const panel: CSSProperties = {
  background: RT.card,
  borderRadius: RT.rCard,
  padding: "18px 18px",
};

/** Financials card + rows (the Cash App balance-widget pattern: grouped rows). */
const finCard: CSSProperties = { background: RT.card, borderRadius: RT.rCard, padding: "2px 18px" };
const finRow: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: 12,
  padding: "15px 0",
};
const finRowLabel: CSSProperties = { fontSize: 15.5, color: RT.ink2, fontWeight: 500 };
const finRowValue: CSSProperties = { fontSize: 19, fontWeight: 600, color: RT.ink, letterSpacing: "-0.01em" };

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

/** Yulia's read — structured synopsis styles (Cash App DL). */
const readSummary: CSSProperties = { fontSize: 16.5, lineHeight: 1.6, color: RT.ink, fontWeight: 500 };
const readSubLabel: CSSProperties = { fontSize: 13.5, fontWeight: 700, color: RT.ink, marginBottom: 7 };
const readPoint: CSSProperties = { display: "flex", gap: 11, alignItems: "flex-start", padding: "6px 0" };
const readPointText: CSSProperties = { fontSize: 15.5, lineHeight: 1.5, color: RT.ink2 };
const readDot: CSSProperties = { width: 6, height: 6, borderRadius: "50%", background: RT.accentInk, marginTop: 7, flex: "none" };
const readDiscuss: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  marginTop: 16,
  background: "transparent",
  border: "none",
  padding: 0,
  cursor: "pointer",
  fontFamily: RT.font,
  fontSize: 14.5,
  fontWeight: 600,
  color: RT.accentInk,
};
