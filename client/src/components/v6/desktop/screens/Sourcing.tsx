/**
 * Atlas — SOURCING screen (isApp, no sub-list).
 *
 * Design: /tmp/atlas_maps/00 "SCREEN 3 — SOURCING" — a 5-stage stepper, a
 * buy-box summary bar, and a candidate table (CANDIDATE · FIT · TIER · YULIA ROUTE).
 *
 * Data layer: NO client hook exists for sourcing, so this file builds ONE small
 * in-file hook (`useSourcing`) that calls the REAL endpoints the chat sourcing
 * panel already uses (see chat/SourcingPanel.tsx + chat/PortfolioCanvas.tsx):
 *   GET  /api/sourcing/theses
 *   GET  /api/sourcing/portfolios?thesisId=:id   → list, take [0]
 *   GET  /api/sourcing/portfolios/:id            → full portfolio (status/stage/tiers)
 *   GET  /api/sourcing/portfolios/:id/candidates → { candidates, total, ... }
 *   POST /api/sourcing/theses/:id/pipeline       → build a sourcing portfolio
 *   GET  /api/sourcing/portfolios/:id/progress   → SSE, via usePipelineProgress
 * Auth via authHeaders(). This reuses the existing endpoints — it does NOT add a
 * parallel data path; it is the sanctioned "endpoint with no hook" case.
 *
 * Honesty: every value is a real field or an honest "—"/EmptyState/LoadingState.
 * No theses → EmptyState with a "Define a buy-box" CTA that routes to Yulia chat.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AtlasScreenProps } from "../atlasNav";
import { useAtlasChat } from "../atlasNav";
import { authHeaders } from "../../../../hooks/useAuth";
import { usePipelineProgress } from "../../../../hooks/usePipelineProgress";
import { T } from "../atlasTokens";
import {
  StepperPills,
  Pill,
  EmptyState,
  LoadingState,
  fmtCents,
  type StepState,
} from "../primitives";
import { ChevronDownIcon } from "../icons";

/* ─── Types (mirror the real endpoint rows; see SourcingPanel/PortfolioCanvas) ── */

interface Thesis {
  id: number;
  name: string;
  industry: string | null;
  /** Real column is `naics_codes` (VARCHAR(10)[] array), NOT a singular string. */
  naics_codes: string[] | null;
  geography: string | null;
  /**
   * Raw DOLLARS (not cents) on the buyer_theses row — coerce, then ×100 for
   * fmtCents. Real column names are revenue_/ebitda_/price_ min|max (see
   * migration 012_sourcing_engine.sql); the GET returns `t.*` straight through.
   */
  revenue_min: number | null;
  revenue_max: number | null;
  ebitda_min: number | null;
  ebitda_max: number | null;
  price_min: number | null;
  price_max: number | null;
  status: string;
  new_matches?: number;
  pursuing_count?: number;
  total_matches?: number;
}

interface Portfolio {
  id: number;
  thesis_id: number;
  name: string;
  pipeline_status: string;
  stage_progress: { stage?: number; pct?: number; message?: string } | null;
  total_candidates: number;
  a_tier_count: number;
  b_tier_count: number;
  c_tier_count: number;
  d_tier_count: number;
}

interface Candidate {
  id: number;
  name: string | null;
  city: string | null;
  state: string | null;
  /** INTEGER DEFAULT 0 in the table, but treat as possibly-null defensively. */
  total_score: number | null;
  tier: string | null;
  pipeline_status: string;
}

/* ─── Stage stepper mapping ───────────────────────────────────────────────────
 * The design's 5 stages: Thesis · Discover · Score / Tier · Route · Outreach.
 * Map the real pipeline_status onto a 0-based current-stage index, honestly.
 *  - no portfolio yet  → stage 0 (Thesis defined, Discover not started)
 *  - initializing / brief_generating / expanding → stage 1 (Discover)
 *  - enriching / scoring → stage 2 (Score / Tier)
 *  - ready → stage 3 (Route) — candidates exist and are awaiting routing/outreach
 *  - failed → stay at whatever we know; show error band separately
 */
const STAGE_LABELS = ["Thesis", "Discover", "Score / Tier", "Route", "Outreach"];

function currentStageIndex(portfolio: Portfolio | null): number {
  if (!portfolio) return 0;
  switch (portfolio.pipeline_status) {
    case "initializing":
    case "brief_generating":
    case "expanding":
      return 1;
    case "enriching":
    case "scoring":
      return 2;
    case "ready":
      return 3;
    default:
      return portfolio.total_candidates > 0 ? 3 : 1;
  }
}

function stepStates(currentIdx: number): { label: string; state: StepState }[] {
  return STAGE_LABELS.map((label, i) => ({
    label,
    state: (i < currentIdx ? "done" : i === currentIdx ? "current" : "upcoming") as StepState,
  }));
}

/* ─── Buy-box summary from a thesis ───────────────────────────────────────── */

/** Thesis revenue/price are raw dollars; convert to cents for fmtCents. */
function dollarRange(lo: number | null | undefined, hi: number | null | undefined): string | null {
  const l = lo != null && Number.isFinite(Number(lo)) ? Number(lo) : null;
  const h = hi != null && Number.isFinite(Number(hi)) ? Number(hi) : null;
  if (l == null && h == null) return null;
  if (l != null && h != null) return `${fmtCents(l * 100)}–${fmtCents(h * 100)}`;
  if (l != null) return `${fmtCents(l * 100)}+`;
  return `up to ${fmtCents(h! * 100)}`;
}

function buyBoxParts(t: Thesis): string[] {
  const parts: string[] = [];
  if (t.industry) parts.push(t.industry);
  if (t.geography) parts.push(t.geography);
  // Prefer EBITDA (design's buy-box sample leads with it); fall back to revenue.
  const ebitda = dollarRange(t.ebitda_min, t.ebitda_max);
  if (ebitda) {
    parts.push(`EBITDA ${ebitda}`);
  } else {
    const rev = dollarRange(t.revenue_min, t.revenue_max);
    if (rev) parts.push(`Revenue ${rev}`);
  }
  const price = dollarRange(t.price_min, t.price_max);
  if (price) parts.push(`Check ${price}`);
  return parts;
}

/* ─── FIT pill palette (by score, per design §SCREEN 3) ───────────────────── */

function fitPillColors(score: number | null | undefined): { bg: string; fg: string } {
  // Non-finite scores (null / pre-scoring) fall to the neutral bucket so the
  // "—" pill is never inconsistently colored by the >=80/>=65 branches.
  if (!Number.isFinite(Number(score))) return { bg: T.track, fg: T.muted };
  const n = Number(score);
  if (n >= 80) return { bg: T.greenBg, fg: T.green };
  if (n >= 65) return { bg: T.blueBg, fg: T.blue };
  return { bg: T.track, fg: T.muted };
}

/** Tier text color (design uses tier-fg only; Tier 1/A green, 2/B blue, 3/C+ gray). */
function tierColor(tier: string | null): string {
  switch ((tier || "").toUpperCase()) {
    case "A":
      return T.green;
    case "B":
      return T.blue;
    default:
      return T.muted2;
  }
}

/** Render the real letter tier as the design's "Tier 1/2/3" label. */
function tierLabel(tier: string | null): string {
  switch ((tier || "").toUpperCase()) {
    case "A":
      return "Tier 1";
    case "B":
      return "Tier 2";
    case "C":
      return "Tier 3";
    case "D":
      return "Tier 4";
    default:
      return "—";
  }
}

/** Map candidate pipeline_status → the "YULIA ROUTE" column copy (descriptive). */
function routeLabel(status: string, tier: string | null): string {
  switch (status) {
    case "pursuing":
      return "Pursuing";
    case "contacted":
      return "Contacted";
    case "responded":
      return "Responded";
    case "meeting":
      return "Meeting";
    case "reviewing":
      return "Reviewing";
    case "passed":
      return "Passed";
    case "archived":
      return "Archived";
    default: {
      // 'new' / unrouted — suggest a route by tier (descriptive, not an action).
      const tn = (tier || "").toUpperCase();
      if (tn === "A" || tn === "B") return "Draft outreach";
      if (tn === "C") return "Watch";
      return "Park";
    }
  }
}

/* ─── In-file data hook (the sanctioned no-hook-yet endpoint case) ─────────── */

interface SourcingState {
  theses: Thesis[];
  thesesLoading: boolean;
  thesesError: boolean;
  selectedThesisId: number | null;
  selectThesis: (id: number) => void;
  portfolio: Portfolio | null;
  portfolioLoading: boolean;
  candidates: Candidate[];
  candidatesLoading: boolean;
  building: boolean;
  buildError: string | null;
  buildPipeline: () => void;
  reloadPortfolio: () => void;
}

function useSourcing(canFetch: boolean): SourcingState {
  const [theses, setTheses] = useState<Thesis[]>([]);
  const [thesesLoading, setThesesLoading] = useState(true);
  const [thesesError, setThesesError] = useState(false);

  const [selectedThesisId, setSelectedThesisId] = useState<number | null>(null);

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);

  const [building, setBuilding] = useState(false);
  const [buildError, setBuildError] = useState<string | null>(null);

  // 1) Load theses.
  useEffect(() => {
    if (!canFetch) {
      setThesesLoading(false);
      return;
    }
    let alive = true;
    (async () => {
      setThesesLoading(true);
      setThesesError(false);
      try {
        const res = await fetch("/api/sourcing/theses", { headers: authHeaders() });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        if (!alive) return;
        const list: Thesis[] = Array.isArray(data) ? data : [];
        setTheses(list);
        // Auto-select the first thesis so the screen lands on real content.
        setSelectedThesisId((prev) => prev ?? (list.length > 0 ? list[0].id : null));
      } catch {
        if (alive) setThesesError(true);
      } finally {
        if (alive) setThesesLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [canFetch]);

  // 2) Load the portfolio for the selected thesis (list → take [0] → full row).
  const loadPortfolio = useCallback(async (thesisId: number) => {
    setPortfolioLoading(true);
    try {
      const listRes = await fetch(
        `/api/sourcing/portfolios?thesisId=${thesisId}`,
        { headers: authHeaders() },
      );
      if (!listRes.ok) {
        setPortfolio(null);
        return;
      }
      const list = await listRes.json();
      if (!Array.isArray(list) || list.length === 0) {
        setPortfolio(null);
        return;
      }
      const fullRes = await fetch(
        `/api/sourcing/portfolios/${list[0].id}`,
        { headers: authHeaders() },
      );
      if (fullRes.ok) {
        setPortfolio(await fullRes.json());
      } else {
        setPortfolio(null);
      }
    } catch {
      setPortfolio(null);
    } finally {
      setPortfolioLoading(false);
    }
  }, []);

  // 3) Load candidates for a portfolio.
  const loadCandidates = useCallback(async (portfolioId: number) => {
    setCandidatesLoading(true);
    try {
      const res = await fetch(
        `/api/sourcing/portfolios/${portfolioId}/candidates?limit=100`,
        { headers: authHeaders() },
      );
      if (res.ok) {
        const data = await res.json();
        setCandidates(Array.isArray(data?.candidates) ? data.candidates : []);
      } else {
        setCandidates([]);
      }
    } catch {
      setCandidates([]);
    } finally {
      setCandidatesLoading(false);
    }
  }, []);

  // When the selected thesis changes, (re)load its portfolio + reset candidates.
  useEffect(() => {
    setPortfolio(null);
    setCandidates([]);
    setBuildError(null);
    if (selectedThesisId == null) {
      setPortfolioLoading(false);
      return;
    }
    void loadPortfolio(selectedThesisId);
  }, [selectedThesisId, loadPortfolio]);

  // When a portfolio is present, load its candidates.
  useEffect(() => {
    if (portfolio?.id != null) {
      void loadCandidates(portfolio.id);
    }
  }, [portfolio?.id, loadCandidates]);

  const selectThesis = useCallback((id: number) => {
    setSelectedThesisId(id);
  }, []);

  const reloadPortfolio = useCallback(() => {
    if (selectedThesisId != null) void loadPortfolio(selectedThesisId);
  }, [selectedThesisId, loadPortfolio]);

  // Build a pipeline (real POST) for the selected thesis when none exists.
  const buildPipeline = useCallback(async () => {
    if (selectedThesisId == null) return;
    setBuilding(true);
    setBuildError(null);
    try {
      const res = await fetch(
        `/api/sourcing/theses/${selectedThesisId}/pipeline`,
        { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() } },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setBuildError(err?.error || "Could not start sourcing. Please try again.");
        return;
      }
      const result = await res.json();
      if (result?.status === "failed") {
        setBuildError(result?.error || "Sourcing pipeline failed to start.");
        return;
      }
      if (result?.portfolioId != null) {
        const fullRes = await fetch(
          `/api/sourcing/portfolios/${result.portfolioId}`,
          { headers: authHeaders() },
        );
        if (fullRes.ok) setPortfolio(await fullRes.json());
      } else {
        // Fall back to re-reading via the thesis.
        void loadPortfolio(selectedThesisId);
      }
    } catch {
      setBuildError("Could not start sourcing. Please try again.");
    } finally {
      setBuilding(false);
    }
  }, [selectedThesisId, loadPortfolio]);

  return {
    theses,
    thesesLoading,
    thesesError,
    selectedThesisId,
    selectThesis,
    portfolio,
    portfolioLoading,
    candidates,
    candidatesLoading,
    building,
    buildError,
    buildPipeline,
    reloadPortfolio,
  };
}

/* ─── Screen ──────────────────────────────────────────────────────────────── */

export default function SourcingScreen({ user }: AtlasScreenProps) {
  const chat = useAtlasChat();
  const canFetch = !!user;
  const s = useSourcing(canFetch);

  // Live SSE progress while a portfolio is mid-pipeline.
  const isActive =
    !!s.portfolio && !["ready", "failed"].includes(s.portfolio.pipeline_status);
  const { progress } = usePipelineProgress(isActive ? s.portfolio!.id : null);

  // Fold SSE progress into the local portfolio, and reload candidates on ready.
  const reloadPortfolio = s.reloadPortfolio;
  useEffect(() => {
    if (progress?.pipelineStatus === "ready") {
      reloadPortfolio();
    }
  }, [progress?.pipelineStatus, reloadPortfolio]);

  const livePortfolio: Portfolio | null = useMemo(() => {
    if (!s.portfolio) return null;
    if (!progress) return s.portfolio;
    return {
      ...s.portfolio,
      pipeline_status: progress.pipelineStatus,
      stage_progress: progress.stageProgress,
      total_candidates: progress.totalCandidates,
      a_tier_count: progress.aTier,
      b_tier_count: progress.bTier,
    };
  }, [s.portfolio, progress]);

  const selectedThesis = useMemo(
    () => s.theses.find((t) => t.id === s.selectedThesisId) ?? null,
    [s.theses, s.selectedThesisId],
  );

  const askYuliaForBuyBox = () =>
    chat?.send("Help me define a buy-box and find off-market targets.");

  /* ── Honest top-level states ────────────────────────────────────────────── */

  // Not signed in → can't read sourcing.
  if (!canFetch) {
    return (
      <Shell>
        <EmptyState
          title="Sign in to use sourcing"
          hint="Theses and off-market candidates live behind your account."
        />
      </Shell>
    );
  }

  // First load.
  if (s.thesesLoading) {
    return (
      <Shell>
        <LoadingState label="Loading your buy-boxes…" />
      </Shell>
    );
  }

  // Error reading theses.
  if (s.thesesError) {
    return (
      <Shell>
        <EmptyState
          title="Couldn't load sourcing"
          hint="There was a problem reaching the sourcing service. Ask Yulia to help, or try again shortly."
          cta="Ask Yulia"
          onCta={askYuliaForBuyBox}
        />
      </Shell>
    );
  }

  // No theses → the honest "define a buy-box" empty state.
  if (s.theses.length === 0) {
    return (
      <Shell>
        <EmptyState
          title="No buy-box defined yet"
          hint="Tell Yulia what you're looking for — industry, geography, size — and she'll search Google Places and score off-market targets against it."
          cta="Define a buy-box with Yulia"
          onCta={askYuliaForBuyBox}
        />
      </Shell>
    );
  }

  const stageIdx = currentStageIndex(livePortfolio);
  const steps = stepStates(stageIdx);

  return (
    <Shell>
      {/* Thesis selector (only when more than one) + stage stepper. */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <StepperPills steps={steps} />
        {s.theses.length > 1 && (
          <ThesisSelect
            theses={s.theses}
            selectedId={s.selectedThesisId}
            onSelect={s.selectThesis}
          />
        )}
      </div>

      {/* Buy-box bar from the selected thesis. */}
      {selectedThesis && (
        <div
          style={{
            borderRadius: 12,
            padding: "11px 15px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 13,
            color: T.label,
          }}
        >
          <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
            {buyBoxParts(selectedThesis).join(" · ") || selectedThesis.name}
          </span>
          <span style={{ flex: 1 }} />
          <button
            type="button"
            onClick={() =>
              chat?.send(
                `Let's refine my buy-box for "${selectedThesis.name}" and rescore the targets.`,
              )
            }
            style={{
              border: "none",
              background: "transparent",
              color: T.blue,
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: T.font,
              flex: "none",
            }}
          >
            Edit
          </button>
        </div>
      )}

      {/* Live pipeline progress (SSE) when mid-flight. */}
      {livePortfolio && isActive && (
        <div
          style={{
            background: T.blueBg3,
            border: `1px solid ${T.approvalBd}`,
            borderRadius: 12,
            padding: "12px 15px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: T.ink }}>
            <span
              aria-hidden="true"
              style={{
                width: 13,
                height: 13,
                borderRadius: "50%",
                border: `2px solid ${T.progTrack}`,
                borderTopColor: T.blue,
                animation: "atlas-glow 1s linear infinite",
                flex: "none",
              }}
            />
            {livePortfolio.stage_progress?.message || "Scoring candidates against your buy-box…"}
          </div>
          {livePortfolio.total_candidates > 0 && (
            <div style={{ fontSize: 12, color: T.muted }}>
              {livePortfolio.total_candidates} candidates found
              {livePortfolio.a_tier_count > 0 && ` · ${livePortfolio.a_tier_count} Tier 1`}
              {livePortfolio.b_tier_count > 0 && ` · ${livePortfolio.b_tier_count} Tier 2`}
            </div>
          )}
        </div>
      )}

      {/* Build error band. */}
      {s.buildError && (
        <div
          style={{
            background: T.terraBg,
            borderRadius: 12,
            padding: "11px 15px",
            fontSize: 12.5,
            color: T.terra,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ flex: 1 }}>{s.buildError}</span>
          <button
            type="button"
            onClick={s.buildPipeline}
            style={{
              border: "none",
              background: "transparent",
              color: T.terra,
              fontWeight: 600,
              fontSize: 12.5,
              textDecoration: "underline",
              cursor: "pointer",
              fontFamily: T.font,
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Candidate table region. */}
      <CandidateRegion
        portfolioPresent={!!s.portfolio}
        portfolioLoading={s.portfolioLoading}
        candidatesLoading={s.candidatesLoading}
        building={s.building}
        isActive={isActive}
        candidates={s.candidates}
        onBuild={s.buildPipeline}
        onAskYulia={() =>
          chat?.send(
            selectedThesis
              ? `Find off-market targets for my "${selectedThesis.name}" buy-box.`
              : "Help me find off-market targets.",
          )
        }
      />
    </Shell>
  );
}

/* ─── Candidate region: handles the build / loading / empty / table states ── */

function CandidateRegion({
  portfolioPresent,
  portfolioLoading,
  candidatesLoading,
  building,
  isActive,
  candidates,
  onBuild,
  onAskYulia,
}: {
  portfolioPresent: boolean;
  portfolioLoading: boolean;
  candidatesLoading: boolean;
  building: boolean;
  isActive: boolean;
  candidates: Candidate[];
  onBuild: () => void;
  onAskYulia: () => void;
}) {
  // Row hover is state-driven (see Rows below) to avoid a stuck-shaded row when
  // the candidate list re-renders mid-hover during a live SSE refresh.
  const [hoverId, setHoverId] = useState<number | null>(null);

  // Still resolving whether a portfolio exists for this thesis.
  if (portfolioLoading) {
    return (
      <TableShell>
        <LoadingState label="Loading candidates…" />
      </TableShell>
    );
  }

  // Thesis defined, but no portfolio built yet → offer to run discovery.
  if (!portfolioPresent) {
    return (
      <TableShell>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: 10,
            padding: "48px 24px",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600, color: T.ink }}>
            No candidates sourced yet
          </div>
          <div style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.5, maxWidth: 420 }}>
            Run discovery to search Google Places and score off-market targets against
            this buy-box, or ask Yulia to source for you.
          </div>
          <div style={{ display: "flex", gap: 9, marginTop: 4 }}>
            <button
              type="button"
              onClick={onBuild}
              disabled={building}
              style={{
                background: T.blue,
                color: "#fff",
                border: "none",
                borderRadius: T.rPill,
                padding: "9px 18px",
                fontSize: 13,
                fontWeight: 600,
                cursor: building ? "default" : "pointer",
                opacity: building ? 0.6 : 1,
                fontFamily: T.font,
              }}
            >
              {building ? "Starting…" : "Run discovery"}
            </button>
            <button
              type="button"
              onClick={onAskYulia}
              style={{
                background: T.white,
                color: T.ink,
                border: `1px solid ${T.inputBd}`,
                borderRadius: T.rPill,
                padding: "9px 16px",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: T.font,
              }}
            >
              Ask Yulia
            </button>
          </div>
        </div>
      </TableShell>
    );
  }

  // Portfolio exists; candidates still loading.
  if (candidatesLoading) {
    return (
      <TableShell>
        <LoadingState label="Loading candidates…" />
      </TableShell>
    );
  }

  // Portfolio exists but no candidates yet.
  if (candidates.length === 0) {
    return (
      <TableShell>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: 8,
            padding: "48px 24px",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 600, color: T.ink }}>
            {isActive ? "Scoring in progress" : "No candidates yet"}
          </div>
          <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.5, maxWidth: 400 }}>
            {isActive
              ? "Yulia is searching and scoring targets — they'll appear here as they're found."
              : "Try broadening the buy-box geography or industry, or ask Yulia to widen the search."}
          </div>
        </div>
      </TableShell>
    );
  }

  // The real candidate table.
  return (
    <TableShell>
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "13px 18px",
          borderBottom: `1px solid ${T.hair}`,
          fontSize: 11.5,
          fontWeight: 600,
          color: T.muted2,
          letterSpacing: ".03em",
        }}
      >
        <div style={{ flex: 2, minWidth: 0 }}>CANDIDATE · GOOGLE PLACES</div>
        <div style={{ flex: 1 }}>FIT</div>
        <div style={{ flex: 1 }}>TIER</div>
        <div style={{ flex: 1 }}>YULIA ROUTE</div>
      </div>

      {/* Rows */}
      <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
        {candidates.map((c) => {
          const fit = fitPillColors(c.total_score);
          const fitIsReal = Number.isFinite(Number(c.total_score));
          const loc = [c.city, c.state].filter(Boolean).join(", ");
          // Hover via React state (not direct style mutation) so a row caught
          // mid-hover during an SSE candidate refresh can't get stuck shaded.
          const hovered = hoverId === c.id;
          return (
            <div
              key={c.id}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "13px 18px",
                borderBottom: `1px solid ${T.rowDiv2}`,
                fontSize: 13.5,
                background: hovered ? T.hover : "transparent",
                transition: "background .12s ease",
              }}
              onMouseEnter={() => setHoverId(c.id)}
              onMouseLeave={() => setHoverId((id) => (id === c.id ? null : id))}
            >
              <div style={{ flex: 2, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 500,
                    color: T.ink,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.name || "Unnamed business"}
                </div>
                {loc && (
                  <div
                    style={{
                      fontSize: 12,
                      color: T.muted2,
                      marginTop: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {loc}
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <Pill bg={fit.bg} fg={fit.fg} style={{ fontSize: 12, padding: "3px 10px" }}>
                  {fitIsReal ? Number(c.total_score) : "—"}
                </Pill>
              </div>
              <div style={{ flex: 1, fontWeight: 600, color: tierColor(c.tier) }}>
                {tierLabel(c.tier)}
              </div>
              <div style={{ flex: 1, color: T.muted }}>
                {routeLabel(c.pipeline_status, c.tier)}
              </div>
            </div>
          );
        })}
      </div>
    </TableShell>
  );
}

/* ─── Thesis selector dropdown (native select, themed) ────────────────────── */

function ThesisSelect({
  theses,
  selectedId,
  onSelect,
}: {
  theses: Thesis[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <label
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: T.rPill,
        padding: "6px 10px 6px 13px",
        fontSize: 13,
        color: T.label,
        cursor: "pointer",
      }}
    >
      <select
        value={selectedId ?? ""}
        onChange={(e) => onSelect(Number(e.target.value))}
        style={{
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
          border: "none",
          background: "transparent",
          fontSize: 13,
          fontWeight: 500,
          color: T.label,
          fontFamily: T.font,
          cursor: "pointer",
          paddingRight: 4,
          outline: "none",
        }}
      >
        {theses.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      <ChevronDownIcon size={14} c={T.muted} />
    </label>
  );
}

/* ─── Layout shells ───────────────────────────────────────────────────────── */

/** Root detail-region panel (right of the chat rail). Owns its padding. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
        padding: "22px 24px",
        gap: 16,
        fontFamily: T.font,
        color: T.ink,
      }}
    >
      {children}
    </div>
  );
}

/** White card frame that holds the candidate table / its states. */
function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 220,
        background: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: T.rCardLg,
        boxShadow: T.shCard,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </div>
  );
}
