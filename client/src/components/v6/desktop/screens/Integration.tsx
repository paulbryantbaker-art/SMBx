/**
 * Atlas Integration — the post-close 100-day PMI value-capture plan (isApp,
 * NO master sub-list). Requires `view.dealId`.
 *
 * One data layer: the sanctioned new hook `useIntegrationPlan(dealId)` over the
 * real PMI routes (server/routes/pmiPlan.ts) — GET /integration-plan,
 * PATCH /workstreams/:id. The "Generate plan" CTA is the only direct fetch and
 * hits the existing POST /integration-plan/generate endpoint (full-access only,
 * 403 surfaced honestly), then refreshes the same hook — never a parallel path.
 *
 * HONESTY (Rule #3 / THE LINE / Critical Rule #10):
 *   - There is NO "Day n / 100" current-day field on the plan. The prototype's
 *     "Day 32 / 100" is a layout placeholder. We show the REAL horizon (100 days)
 *     and the plan's created date — never a fabricated current day.
 *   - Real `milestones[]` are an EVENT TRAIL (plan_created | workstream_completed
 *     | progress_snapshot | quarterly_review) with no Day-0/30/60/100 timeline and
 *     no per-milestone "current/upcoming" status. The prototype's 5 Day nodes are
 *     placeholders. The timeline spine is driven by REAL workstream completion;
 *     the logged events render beneath it (all are 'done' — they already happened).
 *   - There is NO captured/realized synergy $ (needs a finance/GL connector we
 *     don't have). Value-lever TARGETS are illustrative and labeled; captured stays "—".
 *   - updateWorkstream is self-reported EXECUTION (status/%), not a recommendation.
 */
import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { AtlasScreenProps } from "../atlasNav";
import { useAtlasNav } from "../atlasNav";
import { authHeaders } from "../../../../hooks/useAuth";
import { T } from "../atlasTokens";
import {
  Card,
  Pill,
  ProgressBar,
  SectionLabel,
  EmptyState,
  LoadingState,
  fmtCents,
} from "../primitives";
import { CheckIcon, ChevronDownIcon } from "../icons";
import {
  useIntegrationPlan,
  type IntegrationWorkstream,
  type IntegrationMilestone,
} from "../../../../hooks/useIntegrationPlan";

/* ─── status semantics (mirror server STATUS_META) ──────────── */

const STATUS_OPTIONS: { id: string; label: string }[] = [
  { id: "not_started", label: "Not started" },
  { id: "in_progress", label: "In progress" },
  { id: "on_track", label: "On track" },
  { id: "at_risk", label: "At risk" },
  { id: "complete", label: "Complete" },
];

const STATUS_LABEL: Record<string, string> = Object.fromEntries(
  STATUS_OPTIONS.map((o) => [o.id, o.label]),
);

/** Map a workstream status to a pill/dot palette (fg drives the dot; the two agree). */
function statusColors(status: string | null | undefined): { fg: string; bg: string } {
  const s = (status || "").toLowerCase();
  if (s === "complete") return { fg: T.green, bg: T.greenBg };
  if (s === "at_risk") return { fg: T.amber, bg: T.amberBg };
  if (s === "on_track") return { fg: T.green, bg: T.greenBg };
  if (s === "in_progress") return { fg: T.blue, bg: T.blueBg };
  return { fg: T.muted, bg: T.track };
}

/** A workstream row from the read layer exposes `title`; tolerate `name`. */
function wsTitle(w: IntegrationWorkstream): string {
  return (w.title || w.name || "Workstream").toString();
}

/** Coerce the self-reported progress percent to a finite number for the bar. */
function wsPct(w: IntegrationWorkstream): number {
  const n = Number(w.pct);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
}

/* ─── value-lever shape (plan.valueLevers[]) ────────────────── */

interface ValueLever {
  name?: string;
  category?: string;
  target_value_cents?: number | null;
  confidence?: string;
}

const LEVER_CATEGORY_LABEL: Record<string, string> = {
  cost_synergy: "Cost synergy",
  revenue_synergy: "Revenue synergy",
  operational: "Operational",
  integration_risk: "Integration risk",
  working_capital: "Working capital",
  one_time_cost: "One-time cost",
};

const CONFIDENCE_LABEL: Record<string, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

/* ─── milestone-event presentation ──────────────────────────── */

const MILESTONE_LABEL: Record<string, string> = {
  plan_created: "Plan created",
  workstream_completed: "Workstream complete",
  progress_snapshot: "Progress snapshot",
  quarterly_review: "Quarterly review",
};

function milestoneType(m: IntegrationMilestone): string | undefined {
  return (m as any).milestone_type as string | undefined;
}

function milestoneTitle(m: IntegrationMilestone): string {
  const type = milestoneType(m);
  return (m.title || m.name || (type ? MILESTONE_LABEL[type] : undefined) || "Milestone").toString();
}

/**
 * The server description for `workstream_completed` is "Workstream complete: <title>",
 * which duplicates the milestoneTitle header. Strip the redundant lead so the body
 * carries only the workstream name (e.g. header "Workstream complete" + body
 * "Finance & systems"). For other event types the description stands as written.
 */
function milestoneDesc(m: IntegrationMilestone): string | undefined {
  const raw = (m as any).description as string | undefined;
  if (!raw) return undefined;
  const title = milestoneTitle(m);
  if (raw.startsWith(`${title}: `)) {
    const rest = raw.slice(title.length + 2).trim();
    return rest || undefined;
  }
  if (raw.trim() === title) return undefined;
  return raw;
}

function milestoneWhen(m: IntegrationMilestone): string {
  const iso = (m as any).created_at || m.due_at;
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/* ════════════════════════════════════════════════════════════ */

export default function IntegrationScreen({ view }: AtlasScreenProps) {
  const nav = useAtlasNav();
  const dealId = view.dealId ?? null;
  const dealName = view.dealName;

  const { loading, loaded, error, plan, workstreams, milestones, refresh, updateWorkstream } =
    useIntegrationPlan(dealId);

  /* Generate-plan CTA → existing POST endpoint, then refresh the same hook. */
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const generate = async () => {
    if (dealId == null || generating) return;
    setGenerating(true);
    setGenError(null);
    try {
      const res = await fetch(`/api/deals/${dealId}/integration-plan/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
      });
      if (!res.ok) {
        setGenError(
          res.status === 403
            ? "Full deal access is required to build the integration plan."
            : `Couldn't generate the plan (${res.status}).`,
        );
        return;
      }
      await refresh();
    } catch {
      setGenError("Couldn't generate the plan. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  /* ── no deal context ── */
  if (dealId == null) {
    return (
      <Root>
        <EmptyState
          title="Open a deal to see its integration plan"
          hint="The 100-day post-close plan lives on a deal. Pick one from your deals to track Day-0 controls, workstreams, and synergy levers."
          cta="Go to deals"
          onCta={() => nav.go("deals")}
        />
      </Root>
    );
  }

  /* ── loading (first load, before loaded) ── */
  if (loading && !loaded) {
    return (
      <Root>
        <LoadingState label="Loading the integration plan…" />
      </Root>
    );
  }

  /* ── hard error (not a 404 honest-empty) ── */
  if (error) {
    return (
      <Root>
        <EmptyState
          title="Couldn't load the integration plan"
          hint={error}
          cta="Retry"
          onCta={() => void refresh()}
        />
      </Root>
    );
  }

  /* ── honest-empty: loaded, no plan yet ── */
  if (loaded && plan === null) {
    return (
      <Root>
        <Header dealName={dealName} plan={null} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {/* Group the CTA + error so the message flows beneath the button without a
              fragile negative margin against EmptyState's internal padding. */}
          <div style={{ margin: "auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <EmptyState
              title="No integration plan yet"
              hint="Generate a 100-day value-capture plan from this deal's diligence — Day-0 controls, workstreams, owners, and illustrative synergy levers. You can edit execution status after."
              cta={generating ? "Generating…" : "Generate plan"}
              onCta={generating ? undefined : generate}
            />
            {genError && (
              <div style={{ textAlign: "center", color: T.terra, fontSize: 12.5, maxWidth: 420, lineHeight: 1.5 }}>
                {genError}
              </div>
            )}
          </div>
        </div>
      </Root>
    );
  }

  /* ── the plan ── */
  const levers: ValueLever[] = Array.isArray((plan as any)?.valueLevers)
    ? ((plan as any).valueLevers as ValueLever[])
    : [];
  const targetCents =
    (plan as any)?.targetValueCents != null ? Number((plan as any).targetValueCents) : null;

  return (
    <Root>
      <Header
        dealName={dealName}
        plan={plan}
        onRegenerate={generate}
        regenerating={generating}
        regenError={genError}
      />
      <MilestoneTimeline workstreams={workstreams} milestones={milestones} />
      <WorkstreamsSection workstreams={workstreams} onUpdate={updateWorkstream} />
      <ValueLeversSection levers={levers} targetCents={targetCents} />
    </Root>
  );
}

/* ─── root (detail region, right of the rail) ───────────────── */

function Root({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: "22px 24px",
        overflow: "auto",
        fontFamily: T.font,
        color: T.ink,
      }}
    >
      {children}
    </div>
  );
}

/* ─── header ─────────────────────────────────────────────────── */

function Header({
  dealName,
  plan,
  onRegenerate,
  regenerating,
  regenError,
}: {
  dealName?: string;
  plan: any | null;
  /** Present only when a plan exists — re-runs POST /generate (replaces workstreams). */
  onRegenerate?: () => void;
  regenerating?: boolean;
  regenError?: string | null;
}) {
  const horizon: number | null =
    plan?.horizonDays != null && Number.isFinite(Number(plan.horizonDays))
      ? Number(plan.horizonDays)
      : null;
  const created = fmtDate(plan?.createdAt);

  // Regenerate REPLACES the workstream set (discards self-reported status/%), so it
  // takes a two-step inline confirm rather than firing on a single click.
  const [confirming, setConfirming] = useState(false);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <h1 style={{ fontSize: 19, fontWeight: 600, margin: 0, letterSpacing: "-.01em" }}>
        100-Day Integration Plan
      </h1>
      <Pill bg={T.track} fg={T.label} style={{ padding: "4px 11px", fontSize: 12 }}>
        {dealName ? `${dealName} · post-close` : "post-close"}
      </Pill>
      <div style={{ flex: 1 }} />
      {/* Honest: real horizon + created date. NO fabricated "Day n / 100". */}
      {(horizon != null || created) && (
        <div style={{ fontSize: 12.5, color: T.muted, display: "flex", gap: 10, alignItems: "center" }}>
          {horizon != null && (
            <span>
              Horizon <b style={{ color: T.ink }}>{horizon}</b> days
            </span>
          )}
          {created && (
            <>
              <span style={{ color: T.faint }}>·</span>
              <span>Created {created}</span>
            </>
          )}
        </div>
      )}
      {onRegenerate &&
        (confirming ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: T.muted }}>Replace plan &amp; reset progress?</span>
            <button
              type="button"
              disabled={regenerating}
              onClick={() => {
                setConfirming(false);
                onRegenerate();
              }}
              style={headerBtnStyle(true, !!regenerating)}
            >
              {regenerating ? "Regenerating…" : "Replace"}
            </button>
            <button
              type="button"
              disabled={regenerating}
              onClick={() => setConfirming(false)}
              style={headerBtnStyle(false, !!regenerating)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={regenerating}
            onClick={() => setConfirming(true)}
            style={headerBtnStyle(false, !!regenerating)}
          >
            {regenerating ? "Regenerating…" : "Regenerate"}
          </button>
        ))}
      {regenError && !confirming && (
        <div style={{ width: "100%", textAlign: "right", fontSize: 12, color: T.terra }}>{regenError}</div>
      )}
    </div>
  );
}

function headerBtnStyle(primary: boolean, busy: boolean): CSSProperties {
  return {
    border: `1px solid ${primary ? T.blue : T.inputBd}`,
    borderRadius: T.rPill,
    padding: "6px 13px",
    fontSize: 12.5,
    fontWeight: 600,
    color: primary ? "#fff" : T.muted,
    background: primary ? T.blue : T.white,
    cursor: busy ? "default" : "pointer",
    opacity: busy ? 0.7 : 1,
    fontFamily: T.font,
  };
}

/* ─── milestone timeline ─────────────────────────────────────
 * The spine is REAL overall workstream completion (a tracked signal). The
 * logged milestone events render below it as an honest event trail — there
 * is no synthetic Day-0/30/60/100 ladder in the data.
 * ─────────────────────────────────────────────────────────── */

const MILESTONE_VISIBLE_CAP = 6;

function MilestoneTimeline({
  workstreams,
  milestones,
}: {
  workstreams: IntegrationWorkstream[];
  milestones: IntegrationMilestone[];
}) {
  const total = workstreams.length;
  const complete = workstreams.filter((w) => (w.status || "").toLowerCase() === "complete").length;
  const pct = total > 0 ? Math.round((complete / total) * 100) : 0;

  // Every completed workstream appends a milestone row; cap the inline trail so a
  // fully-executed plan doesn't push the rest of the page down. Newest events sit at
  // the top of the revealed list (the array is created-ascending from the server).
  const [expanded, setExpanded] = useState(false);
  const ordered = [...milestones].reverse();
  const overflow = Math.max(0, ordered.length - MILESTONE_VISIBLE_CAP);
  const shown = expanded ? ordered : ordered.slice(0, MILESTONE_VISIBLE_CAP);

  return (
    <Card pad="16px 20px" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* progress spine */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
          <SectionLabel>Execution progress</SectionLabel>
          <div style={{ fontSize: 12.5, color: T.muted }}>
            {total > 0 ? (
              <>
                <b style={{ color: T.ink }}>{complete}</b> of {total} workstreams complete
              </>
            ) : (
              "No workstreams yet"
            )}
          </div>
        </div>
        <ProgressBar pct={pct} color={pct >= 100 ? T.green : T.blue} />
      </div>

      {/* real milestone events (the event trail) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 2 }}>
        {ordered.length === 0 ? (
          <div style={{ fontSize: 12.5, color: T.muted2 }}>
            No milestones logged yet — they appear here as workstreams complete.
          </div>
        ) : (
          shown.map((m, i) => {
            const when = milestoneWhen(m);
            const wc = (m as any).workstreams_complete;
            const wt = (m as any).workstreams_total;
            const counts =
              wc != null && wt != null && Number.isFinite(Number(wt)) && Number(wt) > 0
                ? `${Number(wc)}/${Number(wt)} workstreams`
                : null;
            const desc = milestoneDesc(m);
            return (
              <div
                key={m.id ?? i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 11,
                  padding: "9px 0",
                  borderTop: i === 0 ? "none" : `1px solid ${T.rowDiv}`,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 18,
                    height: 18,
                    flex: "none",
                    marginTop: 1,
                    borderRadius: "50%",
                    background: T.green,
                    color: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckIcon size={10} c="#fff" />
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>
                      {milestoneTitle(m)}
                    </span>
                    {when && <span style={{ fontSize: 11.5, color: T.faint }}>{when}</span>}
                  </div>
                  {desc && (
                    <div
                      style={{
                        fontSize: 12.5,
                        color: T.muted,
                        marginTop: 2,
                        lineHeight: 1.45,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {desc}
                    </div>
                  )}
                  {counts && (
                    <div style={{ fontSize: 11.5, color: T.muted2, marginTop: 2 }}>{counts}</div>
                  )}
                </div>
              </div>
            );
          })
        )}
        {overflow > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            style={{
              alignSelf: "flex-start",
              marginTop: 6,
              background: "none",
              border: "none",
              padding: 0,
              fontSize: 12,
              fontWeight: 600,
              color: T.blue,
              cursor: "pointer",
              fontFamily: T.font,
            }}
          >
            {expanded ? "Show fewer" : `Show ${overflow} earlier event${overflow === 1 ? "" : "s"}`}
          </button>
        )}
      </div>
    </Card>
  );
}

/* ─── workstreams ────────────────────────────────────────────── */

function WorkstreamsSection({
  workstreams,
  onUpdate,
}: {
  workstreams: IntegrationWorkstream[];
  onUpdate: (wsId: number, patch: { status?: string; pct?: number }) => Promise<IntegrationWorkstream | null>;
}) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      <SectionLabel>Workstreams</SectionLabel>
      {workstreams.length === 0 ? (
        <Card pad={16}>
          <div style={{ fontSize: 13, color: T.muted }}>
            This plan has no workstreams yet.
          </div>
        </Card>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 13,
          }}
        >
          {workstreams.map((w) => (
            <WorkstreamCard key={w.id} ws={w} onUpdate={onUpdate} />
          ))}
        </div>
      )}
    </section>
  );
}

/** Progress steps the user can self-report. 100% maps the server to 'complete'. */
const PCT_STEPS = [0, 25, 50, 75, 100];

function WorkstreamCard({
  ws,
  onUpdate,
}: {
  ws: IntegrationWorkstream;
  onUpdate: (wsId: number, patch: { status?: string; pct?: number }) => Promise<IntegrationWorkstream | null>;
}) {
  const [busy, setBusy] = useState(false);
  const [denied, setDenied] = useState(false);
  const status = (ws.status || "not_started").toString();
  const pct = wsPct(ws);
  const colors = statusColors(status);

  /** Single PATCH path for both the status select and the progress stepper. */
  const apply = async (patch: { status?: string; pct?: number }) => {
    if (busy) return;
    setBusy(true);
    setDenied(false);
    const res = await onUpdate(ws.id, patch);
    // null = 403 (no full access) OR a transient failure — surface honestly,
    // no fake success. The controlled value snaps back from hook state.
    if (res === null) setDenied(true);
    setBusy(false);
  };

  const changeStatus = (next: string) => {
    if (next !== status) void apply({ status: next });
  };
  const changePct = (next: number) => {
    if (next !== pct) void apply({ pct: next });
  };

  const firstMove = (ws.first_move as string | undefined) || undefined;
  const detail = (ws.detail as string | undefined) || ws.description || undefined;
  const owner = (ws.owner as string | undefined) || undefined;
  // evidence_link is descriptive prose ("Data room / financial model"), not a URL.
  const evidence = (ws.evidence_link as string | undefined) || undefined;

  return (
    <Card pad={13} style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
        {/* Dot color tracks statusColors so it never disagrees with the pill. */}
        <span
          aria-hidden="true"
          style={{
            width: 16,
            height: 16,
            flex: "none",
            marginTop: 1,
            borderRadius: "50%",
            background: status.toLowerCase() === "complete" ? colors.fg : colors.bg,
            border: status.toLowerCase() === "complete" ? "none" : `2px solid ${colors.fg}`,
            color: "#fff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {status.toLowerCase() === "complete" && <CheckIcon size={10} c="#fff" />}
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink, lineHeight: 1.3, overflowWrap: "anywhere" }}>
            {wsTitle(ws)}
          </div>
          {owner && (
            <div style={{ fontSize: 11.5, color: T.muted2, marginTop: 2, overflowWrap: "anywhere" }}>{owner}</div>
          )}
        </div>
        <Pill bg={colors.bg} fg={colors.fg} style={{ padding: "3px 9px", fontSize: 11 }}>
          {STATUS_LABEL[status] || status}
        </Pill>
      </div>

      {detail && (
        <div style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.45, overflowWrap: "anywhere" }}>{detail}</div>
      )}

      {/* lever-style rows: real fields only */}
      {(firstMove || evidence) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {firstMove && (
            <LeverRow glyph="▷" glyphColor={T.blue} label="Next move" value={firstMove} />
          )}
          {/* "Reference" — honest prose pointer, NOT framed as a clickable artifact. */}
          {evidence && (
            <LeverRow glyph="○" glyphColor={T.muted2} label="Reference" value={evidence} />
          )}
        </div>
      )}

      {/* progress — self-reported, editable via the stepper below */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: T.muted2 }}>
          <span>Progress</span>
          <span style={{ color: T.ink, fontWeight: 600 }}>{pct}%</span>
        </div>
        <ProgressBar pct={pct} color={status.toLowerCase() === "complete" ? T.green : T.blue} />
        <div style={{ display: "flex", gap: 5, marginTop: 2 }}>
          {PCT_STEPS.map((step) => {
            const active = pct === step;
            return (
              <button
                key={step}
                type="button"
                disabled={busy || active}
                onClick={() => changePct(step)}
                style={{
                  flex: 1,
                  border: `1px solid ${active ? T.blue : T.inputBd}`,
                  borderRadius: 7,
                  padding: "4px 0",
                  fontSize: 11,
                  fontWeight: 600,
                  color: active ? T.blue : T.muted,
                  background: active ? T.blueBg : T.white,
                  cursor: busy || active ? "default" : "pointer",
                  fontFamily: T.font,
                }}
              >
                {step}%
              </button>
            );
          })}
        </div>
      </div>

      {/* execution status control → updateWorkstream */}
      <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: 10.5, color: T.muted2, fontWeight: 600, letterSpacing: ".03em", textTransform: "uppercase" }}>
          Status
        </span>
        <div style={{ position: "relative" }}>
          <select
            value={status}
            disabled={busy}
            onChange={(e) => changeStatus(e.target.value)}
            style={{
              appearance: "none",
              WebkitAppearance: "none",
              width: "100%",
              border: `1px solid ${T.inputBd}`,
              borderRadius: 9,
              padding: "7px 30px 7px 10px",
              fontSize: 12.5,
              fontWeight: 600,
              color: T.ink,
              background: busy ? T.hover : T.white,
              cursor: busy ? "default" : "pointer",
              fontFamily: T.font,
            }}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              right: 9,
              top: "50%",
              transform: "translateY(-50%)",
              display: "inline-flex",
              pointerEvents: "none",
            }}
          >
            {busy ? (
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  border: `2px solid ${T.progTrack}`,
                  borderTopColor: T.blue,
                  display: "inline-block",
                  animation: "atlas-glow 1s linear infinite",
                }}
              />
            ) : (
              <ChevronDownIcon size={15} c={T.muted2} />
            )}
          </span>
        </div>
      </label>
      {denied && (
        <div style={{ fontSize: 11.5, color: T.terra, lineHeight: 1.4 }}>
          Couldn't update — please try again.
        </div>
      )}
    </Card>
  );
}

function LeverRow({
  glyph,
  glyphColor,
  label,
  value,
}: {
  glyph: string;
  glyphColor: string;
  label: string;
  value: string;
}) {
  const rowStyle: CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    border: `1px solid ${T.hair}`,
    borderRadius: 9,
    padding: "8px 10px",
    fontSize: 12.5,
    minWidth: 0,
  };
  return (
    <div style={rowStyle}>
      <span aria-hidden="true" style={{ color: glyphColor, fontSize: 12, lineHeight: 1.4, flex: "none" }}>
        {glyph}
      </span>
      <div style={{ minWidth: 0, flex: 1, overflowWrap: "anywhere" }}>
        <span style={{ color: T.muted2, fontWeight: 600 }}>{label}: </span>
        <span style={{ color: T.ink }}>{value}</span>
      </div>
    </div>
  );
}

/* ─── value levers (plan-level, illustrative targets) ───────── */

function ValueLeversSection({
  levers,
  targetCents,
}: {
  levers: ValueLever[];
  targetCents: number | null;
}) {
  const hasLevers = levers.length > 0;
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <SectionLabel>Value levers</SectionLabel>
        <div style={{ fontSize: 12, color: T.muted2 }}>
          Illustrative targets · captured value not tracked
        </div>
      </div>

      <Card pad={0} style={{ overflow: "hidden" }}>
        {/* total target row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "13px 16px",
            borderBottom: hasLevers ? `1px solid ${T.rowDiv}` : "none",
            background: T.surface,
          }}
        >
          <span style={{ fontSize: 12.5, color: T.muted, fontWeight: 600 }}>
            Total illustrative target
          </span>
          <span style={{ fontSize: 15, fontWeight: 600, color: T.ink }}>
            {fmtCents(targetCents)}
          </span>
        </div>

        {!hasLevers ? (
          <div style={{ padding: "16px", fontSize: 12.5, color: T.muted }}>
            No value levers on this plan.
          </div>
        ) : (
          levers.map((l, i) => {
            const target =
              l.target_value_cents != null ? Number(l.target_value_cents) : null;
            const cat = l.category ? LEVER_CATEGORY_LABEL[l.category] || l.category : null;
            const conf = l.confidence ? CONFIDENCE_LABEL[l.confidence] || l.confidence : null;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "12px 16px",
                  borderTop: i === 0 ? "none" : `1px solid ${T.rowDiv}`,
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>
                    {l.name || "Value lever"}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
                    {cat && (
                      <Pill bg={T.track} fg={T.muted} style={{ padding: "2px 8px", fontSize: 10.5 }}>
                        {cat}
                      </Pill>
                    )}
                    {conf && (
                      <span style={{ fontSize: 11, color: T.muted2 }}>{conf}</span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: "right", flex: "none" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: target != null ? T.ink : T.muted2 }}>
                    {fmtCents(target)}
                  </div>
                  <div style={{ fontSize: 10.5, color: T.faint }}>target</div>
                </div>
              </div>
            );
          })
        )}
      </Card>
    </section>
  );
}
