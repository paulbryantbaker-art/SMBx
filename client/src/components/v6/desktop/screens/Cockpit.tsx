/**
 * Atlas Cockpit — single-deal command view (isApp, no master sub-list).
 *
 * Requires `view.dealId`. Wires FOUR real endpoints (no hook exists for the
 * cockpit composite, so this file owns small in-file hooks that call existing
 * endpoints — never a parallel data path):
 *   GET /api/deals/:id                         → deal row (money cents as STRINGS),
 *                                                gates[], deliverableStats
 *   GET /api/agency/deals/:id/brief            → verdict / marketRead / taxLegal / nextMoves
 *   GET /api/deals/:id/participants            → deal team (owner + participants)
 *   GET/POST /api/deals/:id/messages           → deal-team thread (polling)
 *
 * Field remap per /tmp/atlas_maps/05 §1: there is NO discrete `citations`,
 * `fit`, `read`, or `risks` array on the deal brief. fit = verdict.score,
 * read = marketRead, risks = taxLegal.signoffFlags + marketRead.researchNeeded,
 * "citations" → marketRead.sourceSignals chips (NEVER fabricate a clause list).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { AtlasScreenProps } from "../atlasNav";
import { useAtlasNav, useAtlasChat } from "../atlasNav";
import { authHeaders } from "../../../../hooks/useAuth";
import { T } from "../atlasTokens";
import {
  Sparkle,
  MarkBadge,
  Avatar,
  Pill,
  Card,
  KpiCard,
  StepperPills,
  ProgressBar,
  SectionLabel,
  EmptyState,
  LoadingState,
  StatusDot,
  fmtCents,
} from "../primitives";
import type { StepState } from "../primitives";
import {
  MonitorIcon,
  SendArrowIcon,
  ChevronRightIcon,
} from "../icons";

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
interface DealMessage {
  id: number;
  content: string;
  parent_id: number | null;
  created_at: string;
  email?: string | null;
  display_name?: string | null;
  participant_role?: string | null;
}

/* ─── helpers ───────────────────────────────────────────────── */

/** Postgres numerics arrive as strings; coerce → number|null (never floats for money keep cents). */
function toNum(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function dealDisplayName(d: DealRow | null | undefined): string {
  if (!d) return "Deal";
  return d.name || d.business_name || d.industry || `Deal #${d.id}`;
}

/** Journey label for the header pill, from journey_type / gate prefix. */
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

  // Index of the current gate within the labelled journey.
  const idxFromGate = (g: string | null | undefined): number => {
    if (!g) return -1;
    const n = parseInt(g.toString().replace(/[^0-9]/g, ""), 10);
    return Number.isFinite(n) ? n : -1;
  };
  const currentIdx = idxFromGate(deal.current_gate);

  // Completed set from gate_progress statuses.
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

/** Verdict color family by label (green PURSUE/STRONG FIT, blue WATCH, amber/terra risk). */
function verdictColors(label: string | undefined): { fg: string; bg: string } {
  const l = (label || "").toUpperCase();
  if (l.includes("PURSUE") || l.includes("STRONG")) return { fg: T.green, bg: T.greenBg };
  if (l.includes("WATCH") || l.includes("NEEDS")) return { fg: T.blue, bg: T.blueBg };
  if (l.includes("PASS") || l.includes("HIGH RISK")) return { fg: T.terra, bg: T.terraBg };
  return { fg: T.muted, bg: T.track };
}

function initialsOf(name: string | null | undefined, email: string | null | undefined): string {
  const src = (name || email || "?").trim();
  const parts = src.split(/[\s@.]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

const TEAM_AVATAR_BG = [T.greenAv, T.amberAv, T.violetBg, T.blueBg];

function relTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const diff = Date.now() - t;
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/* ─── in-file hooks (existing endpoints, no hook yet) ───────── */

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

function useDealTeam(dealId: number | undefined) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [owner, setOwner] = useState<ParticipantsResponse["owner"] | null>(null);
  const [messages, setMessages] = useState<DealMessage[]>([]);
  const [teamState, setTeamState] = useState<LoadState>("idle");
  const [msgState, setMsgState] = useState<LoadState>("idle");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadMessages = useCallback(async () => {
    if (dealId == null) return;
    try {
      const r = await fetch(`/api/deals/${dealId}/messages`, { headers: authHeaders() });
      if (!r.ok) throw new Error(`messages ${r.status}`);
      const m: DealMessage[] = await r.json();
      setMessages(Array.isArray(m) ? m : []);
      setMsgState("ready");
    } catch {
      setMsgState((s) => (s === "ready" ? "ready" : "error"));
    }
  }, [dealId]);

  useEffect(() => {
    if (dealId == null) return;
    let alive = true;
    setTeamState("loading");
    setMsgState("loading");

    fetch(`/api/deals/${dealId}/participants`, { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`participants ${r.status}`))))
      .then((p: ParticipantsResponse) => {
        if (!alive) return;
        setOwner(p.owner ?? null);
        setParticipants(Array.isArray(p.participants) ? p.participants : []);
        setTeamState("ready");
      })
      .catch(() => {
        if (alive) setTeamState("error");
      });

    loadMessages();
    // Deal chat is polling-only (no realtime transport).
    pollRef.current = setInterval(loadMessages, 12000);

    return () => {
      alive = false;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [dealId, loadMessages]);

  const send = useCallback(
    async (content: string) => {
      if (dealId == null || !content.trim()) return false;
      try {
        const r = await fetch(`/api/deals/${dealId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({ content: content.trim() }),
        });
        if (!r.ok) return false;
        await loadMessages();
        return true;
      } catch {
        return false;
      }
    },
    [dealId, loadMessages],
  );

  return { participants, owner, messages, teamState, msgState, send };
}

/* ─── small inline UI atoms ─────────────────────────────────── */

function ThisDealChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: 11,
        padding: "10px 14px",
        fontSize: 13,
        fontWeight: 500,
        color: T.ink,
        cursor: "pointer",
        fontFamily: T.font,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = T.hover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = T.white;
      }}
    >
      <ChevronRightIcon size={14} c={T.blue} />
      {label}
    </button>
  );
}

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
    <Card pad={16} style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{title}</div>
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

/* ═══════════════════════════════════════════════════════════════
   COCKPIT SCREEN
   ═══════════════════════════════════════════════════════════════ */

export default function CockpitScreen({ view }: AtlasScreenProps) {
  const nav = useAtlasNav();
  const chat = useAtlasChat();
  const dealId = view.dealId;

  const { detail, brief, detailState, briefState } = useDealCockpit(dealId);
  const team = useDealTeam(dealId);

  // No deal selected → honest empty.
  if (dealId == null) {
    return (
      <div style={rootStyle}>
        <EmptyState
          title="No deal open"
          hint="Open a deal from Pipeline or Deals to see its cockpit — verdict, gates, financials, workflows, and the deal team."
          cta="Go to Pipeline"
          onCta={() => nav.go("pipeline")}
        />
      </div>
    );
  }

  const loading = detailState === "loading" || detailState === "idle";
  if (loading && !detail) {
    return (
      <div style={rootStyle}>
        <LoadingState label="Loading deal cockpit…" />
      </div>
    );
  }

  if (detailState === "error" || !detail) {
    return (
      <div style={rootStyle}>
        <EmptyState
          title="Couldn’t load this deal"
          hint="The deal cockpit failed to load. It may not exist or you may not have access."
          cta="Back to Pipeline"
          onCta={() => nav.go("pipeline")}
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
  const impliedMultiple =
    multipleRaw != null
      ? multipleRaw
      : asking != null && adjEbitda != null && adjEbitda > 0
        ? asking / adjEbitda
        : null;

  const gateSteps = buildGateSteps(deal, detail.gates);

  // Verdict + fit (fit = verdict.score; only render if real).
  const verdict = brief?.verdict;
  const vColors = verdictColors(verdict?.label);
  const fitScore = typeof verdict?.score === "number" && verdict.score > 0 ? verdict.score : null;

  // Deliverable + gate progress for workflow cards (honest counts).
  const dStats = detail.deliverableStats;
  const dTotal = toNum(dStats.total) ?? 0;
  const dDone = toNum(dStats.completed) ?? 0;
  const dProg = toNum(dStats.in_progress) ?? 0;
  const deliverablePct = dTotal > 0 ? Math.round((dDone / dTotal) * 100) : 0;

  const gateDone = gateSteps.filter((s) => s.state === "done").length;
  const gateTotal = gateSteps.length;
  const gatePct = gateTotal > 0 ? Math.round((gateDone / gateTotal) * 100) : 0;

  // Risk rows: real signoff flags + research-needed (NEVER a fabricated clause list).
  const signoffFlags = brief?.taxLegal?.signoffFlags ?? [];
  const researchNeeded = brief?.marketRead?.researchNeeded ?? [];
  const riskRows = [...signoffFlags, ...researchNeeded];

  const sourceSignals = brief?.marketRead?.sourceSignals ?? [];

  return (
    <div style={rootStyle}>
      {/* ── A. Deal header ────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 11,
          flexWrap: "wrap",
          padding: "2px 0 14px",
        }}
      >
        <MarkBadge letter={name} size={38} radius={11} />
        <div style={{ fontSize: 22, fontWeight: 600, color: T.ink, minWidth: 0 }}>{name}</div>
        {journeyLabel(deal) && (
          <Pill bg={T.track} fg={T.label}>
            {journeyLabel(deal)}
          </Pill>
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

      {/* ── B. Journey gate pills ─────────────────────── */}
      <div style={{ paddingBottom: 14, overflowX: "auto" }}>
        <StepperPills steps={gateSteps} />
      </div>

      {/* ── C. KPI cards ──────────────────────────────── */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <KpiCard label="REVENUE" value={fmtCents(revenue)} />
        <KpiCard label="ADJ. EBITDA" value={fmtCents(adjEbitda)} />
        <KpiCard label="ASKING" value={fmtCents(asking)} />
        <KpiCard
          label="IMPLIED MULTIPLE"
          value={impliedMultiple != null ? `${impliedMultiple.toFixed(1)}×` : "—"}
        />
      </div>

      {/* ── D. Two-column body ────────────────────────── */}
      <div style={{ display: "flex", gap: 18, marginTop: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* LEFT column */}
        <div style={{ flex: 1, minWidth: 320, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Yulia's read */}
          <Card pad={18} style={{ borderRadius: T.rCardLg }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Sparkle size={16} />
              <span style={{ fontSize: 14.5, fontWeight: 600, color: T.ink }}>Yulia’s read</span>
            </div>

            {briefState === "loading" && <LoadingState label="Reading the deal…" />}

            {briefState === "error" && (
              <div style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.6 }}>
                Yulia’s read isn’t available right now.
              </div>
            )}

            {briefState === "ready" && (
              <>
                <div style={{ fontSize: 13.5, lineHeight: 1.75, color: T.ink2 }}>
                  {brief?.marketRead?.headline || "—"}
                </div>
                {(brief?.marketRead?.bullets?.length ?? 0) > 0 && (
                  <ul style={{ margin: "12px 0 0", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
                    {brief!.marketRead!.bullets!.map((b, i) => (
                      <li key={i} style={{ fontSize: 13, lineHeight: 1.6, color: T.ink3 }}>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Key risks — real signoff flags + research gaps, never fabricated clauses */}
                {riskRows.length > 0 && (
                  <div style={{ marginTop: 16 }}>
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
                  <div style={{ marginTop: 16 }}>
                    <SectionLabel>Source signals</SectionLabel>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 8 }}>
                      {sourceSignals.map((s, i) => (
                        <SignalChip key={i}>{s}</SignalChip>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>

          {/* Workflows (honest: deliverable + gate progress) */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <WorkflowCard
              title="Deliverables"
              meta={`${dDone} / ${dTotal} complete`}
              pct={deliverablePct}
              barColor={T.blue}
              cta="Open files"
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
              cta="Open studio"
              onCta={() => nav.go("studio", { dealId, dealName })}
              items={gateSteps.map((s) => ({
                label: s.label,
                state: s.state === "done" ? "done" : s.state === "current" ? "prog" : "open",
              }))}
            />
          </div>

          {dTotal === 0 && (
            <div style={{ fontSize: 12.5, color: T.muted2 }}>
              No deliverables yet — ask Yulia to draft the first one for this deal.
            </div>
          )}

          {/* THIS DEAL chips */}
          <div style={{ marginTop: 2 }}>
            <SectionLabel>This deal</SectionLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 9 }}>
              <ThisDealChip label="Files" onClick={() => nav.go("files", { dealId, dealName })} />
              <ThisDealChip label="Studio" onClick={() => nav.go("studio", { dealId, dealName })} />
              <ThisDealChip label="Pipeline" onClick={() => nav.go("pipeline", { dealId, dealName })} />
              <ThisDealChip label="Integration" onClick={() => nav.go("integration", { dealId, dealName })} />
              <ThisDealChip label="Sourcing" onClick={() => nav.go("sourcing", { dealId, dealName })} />
            </div>
          </div>
        </div>

        {/* RIGHT column — Deal team */}
        <DealTeamPanel
          team={team}
          onAskYulia={(prompt) => chat?.send(prompt)}
          dealName={dealName}
        />
      </div>
    </div>
  );
}

/* ─── Deal team panel (participants + messages + composer) ──── */

function DealTeamPanel({
  team,
  onAskYulia,
  dealName,
}: {
  team: ReturnType<typeof useDealTeam>;
  onAskYulia: (prompt: string) => void;
  dealName: string;
}) {
  const [draft, setDraft] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Owner + participants → avatar stack and a name lookup for messages.
  const roster: { name: string; email: string | null; role: string }[] = [];
  if (team.owner) {
    roster.push({
      name: team.owner.display_name || team.owner.email || "Owner",
      email: team.owner.email ?? null,
      role: "owner",
    });
  }
  for (const p of team.participants) {
    roster.push({
      name: p.display_name || p.email || "Member",
      email: p.email ?? null,
      role: p.role,
    });
  }

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [team.messages.length]);

  const submit = async () => {
    const text = draft.trim();
    if (!text || sendingMsg) return;
    setSendingMsg(true);
    const ok = await team.send(text);
    setSendingMsg(false);
    if (ok) setDraft("");
  };

  return (
    <div
      style={{
        width: 374,
        flex: "none",
        maxWidth: "100%",
        background: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: T.rCardLg,
        boxShadow: T.shCard,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        maxHeight: 620,
      }}
    >
      {/* header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "13px 16px",
          borderBottom: `1px solid ${T.railDiv}`,
        }}
      >
        <span style={{ fontSize: 14.5, fontWeight: 600, color: T.ink }}>Deal team</span>
        {team.teamState === "ready" && roster.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", marginLeft: 4 }}>
            {roster.slice(0, 5).map((m, i) => (
              <span
                key={i}
                style={{
                  marginLeft: i === 0 ? 0 : -7,
                  borderRadius: "50%",
                  border: `2px solid ${T.white}`,
                  display: "inline-flex",
                }}
                title={`${m.name} · ${m.role}`}
              >
                <Avatar
                  initials={initialsOf(m.name, m.email)}
                  size={25}
                  gradient={m.role === "owner"}
                  bg={TEAM_AVATAR_BG[i % TEAM_AVATAR_BG.length]}
                />
              </span>
            ))}
          </div>
        )}
        <span style={{ flex: 1 }} />
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 11.5,
            color: T.muted,
            background: T.track,
            borderRadius: T.rPill,
            padding: "4px 10px",
            maxWidth: 150,
          }}
        >
          <MonitorIcon size={12} c={T.blue} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{dealName}</span>
        </span>
      </div>

      {/* message stream */}
      <div
        ref={listRef}
        style={{
          flex: 1,
          minHeight: 180,
          overflow: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: 15,
          background: T.surface,
        }}
      >
        {team.msgState === "loading" && team.messages.length === 0 && <LoadingState label="Loading thread…" />}

        {team.msgState === "error" && team.messages.length === 0 && (
          <div style={{ fontSize: 13, color: T.muted, padding: "8px 0" }}>Couldn’t load the team thread.</div>
        )}

        {(team.msgState === "ready" || team.messages.length > 0) && team.messages.length === 0 && (
          <EmptyState
            title="No messages yet"
            hint="Coordinate diligence, doc updates, and approvals with your deal team here."
          />
        )}

        {team.messages.map((m, i) => {
          const who = m.display_name || m.email || "Member";
          const idx = roster.findIndex((r) => r.email && r.email === m.email);
          const bg = TEAM_AVATAR_BG[(idx >= 0 ? idx : i) % TEAM_AVATAR_BG.length];
          return (
            <div key={m.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <Avatar initials={initialsOf(who, m.email)} size={30} bg={bg} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{who}</span>
                  <span style={{ fontSize: 11, color: T.faint }}>{relTime(m.created_at)}</span>
                </div>
                <div
                  style={{
                    marginTop: 4,
                    background: T.white,
                    border: `1px solid ${T.hair}`,
                    borderRadius: "4px 12px 12px 12px",
                    padding: "9px 12px",
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: T.ink3,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {m.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* composer */}
      <div style={{ padding: "11px 14px", borderTop: `1px solid ${T.railDiv}` }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: `1px solid ${T.inputBd}`,
            borderRadius: T.rComposer,
            padding: "5px 5px 5px 14px",
            background: T.white,
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Message the team…"
            disabled={team.teamState === "error"}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 13,
              color: T.ink,
              fontFamily: T.font,
            }}
          />
          <button
            type="button"
            onClick={submit}
            disabled={!draft.trim() || sendingMsg}
            aria-label="Send message"
            style={{
              width: 30,
              height: 30,
              flex: "none",
              borderRadius: "50%",
              border: "none",
              background: draft.trim() ? T.blue : T.inputBd,
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: draft.trim() && !sendingMsg ? "pointer" : "default",
            }}
          >
            <SendArrowIcon size={15} c="#fff" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => onAskYulia(`Give me your read on ${dealName}.`)}
          style={{
            marginTop: 8,
            width: "100%",
            textAlign: "center",
            border: "none",
            background: "none",
            fontSize: 11.5,
            color: T.muted2,
            cursor: "pointer",
            fontFamily: T.font,
          }}
        >
          Ask Yulia about this deal →
        </button>
      </div>
    </div>
  );
}

/* ─── styles / utils ────────────────────────────────────────── */

const rootStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
  padding: "22px 24px",
};

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}
