/**
 * Atlas-MOBILE SOURCING (frame 09) — BODY ONLY. The shell renders the header
 * (back bar), the scroll area (with bottom-nav clearance), the bottom nav, and
 * the Yulia FAB. This file returns the body content.
 *
 * Design: /tmp/atlas_mobile_maps/m3_sourcing_studio_integration_agent.md
 * "FRAME 09 · Sourcing" — a buy-box card, a horizontal stepper pill row, and a
 * single-column candidate card list where each candidate carries a Fit chip, a
 * Tier label, and a per-row Yulia route.
 *
 * Data layer: mirrors the DESKTOP sibling `desktop/screens/Sourcing.tsx` — the
 * same in-file `useSourcing` hook over the REAL sourcing endpoints (no parallel
 * fetch path, the sanctioned "endpoint with no shared hook" case):
 *   GET  /api/sourcing/theses
 *   GET  /api/sourcing/portfolios?thesisId=:id        → list, take [0]
 *   GET  /api/sourcing/portfolios/:id                 → full portfolio row
 *   GET  /api/sourcing/portfolios/:id/candidates      → { candidates, ... }
 *   POST /api/sourcing/theses/:id/pipeline            → build a portfolio
 *   GET  /api/sourcing/portfolios/:id/progress        → SSE via usePipelineProgress
 * Auth via authHeaders().
 *
 * Honesty: every value is a real field or an honest "—"/LoadingState/EmptyState.
 * No theses → EmptyState + "Define a buy-box with Yulia" → chat.send. THE LINE:
 * the per-row "route" is descriptive; the only actions route to Yulia (chat).
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AtlasScreenProps } from "../../desktop/atlasNav";
import { useAtlasChat } from "../../desktop/atlasNav";
import { authHeaders } from "../../../../hooks/useAuth";
import { usePipelineProgress } from "../../../../hooks/usePipelineProgress";
import { T } from "../../desktop/atlasTokens";
import {
  StepperPills,
  Pill,
  EmptyState,
  LoadingState,
  fmtCents,
  type StepState,
} from "../../desktop/primitives";
import { ChevronRightIcon } from "../../desktop/icons";

/* ─── Types (mirror the real endpoint rows; see desktop Sourcing) ─────────── */

interface Thesis {
  id: number;
  name: string;
  industry: string | null;
  naics_codes: string[] | null;
  geography: string | null;
  /** Raw DOLLARS on the buyer_theses row — ×100 for fmtCents. */
  revenue_min: number | null;
  revenue_max: number | null;
  ebitda_min: number | null;
  ebitda_max: number | null;
  price_min: number | null;
  price_max: number | null;
  status: string;
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
  total_score: number | null;
  tier: string | null;
  pipeline_status: string;
}

/* ─── Stage stepper mapping (honest, from real pipeline_status) ───────────── */

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

/* ─── FIT chip palette + TIER + ROUTE (per design §FRAME 09) ──────────────── */

function fitChipColors(score: number | null | undefined): { bg: string; fg: string } {
  if (!Number.isFinite(Number(score))) return { bg: T.track, fg: T.muted };
  const n = Number(score);
  if (n >= 80) return { bg: T.greenBg, fg: T.green };
  if (n >= 65) return { bg: T.blueBg, fg: T.blue };
  return { bg: T.track, fg: T.muted };
}

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

/** Yulia route for a candidate — descriptive, plus whether it's a chat action.
 *  THE LINE: routing to outreach is a Yulia hand-off (chat), never an auto-send. */
function routeInfo(
  status: string,
  tier: string | null,
): { label: string; action: boolean } {
  switch (status) {
    case "pursuing":
      return { label: "Pursuing", action: false };
    case "contacted":
      return { label: "Contacted", action: false };
    case "responded":
      return { label: "Responded", action: false };
    case "meeting":
      return { label: "Meeting", action: false };
    case "reviewing":
      return { label: "Reviewing", action: false };
    case "passed":
      return { label: "Passed", action: false };
    case "archived":
      return { label: "Archived", action: false };
    default: {
      const tn = (tier || "").toUpperCase();
      if (tn === "A" || tn === "B") return { label: "Draft outreach", action: true };
      if (tn === "C") return { label: "Watch", action: false };
      return { label: "Park", action: false };
    }
  }
}

/* ─── In-file data hook (mirrors the desktop sibling's useSourcing) ───────── */

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

  // 2) Load the portfolio for the selected thesis (list → [0] → full row).
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
      setPortfolio(fullRes.ok ? await fullRes.json() : null);
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

  // Selected thesis changed → (re)load its portfolio + reset candidates.
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

  // Portfolio present → load its candidates.
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

const PAGE_H = "0 18px"; // shell owns vertical/bottom; we own horizontal 18px

export default function SourcingMobileScreen({ user }: AtlasScreenProps) {
  const chat = useAtlasChat();
  const canFetch = !!user;
  const s = useSourcing(canFetch);

  // Live SSE progress while a portfolio is mid-pipeline.
  const isActive =
    !!s.portfolio && !["ready", "failed"].includes(s.portfolio.pipeline_status);
  const { progress } = usePipelineProgress(isActive ? s.portfolio!.id : null);

  // Reload candidates once the pipeline reaches "ready".
  const reloadPortfolio = s.reloadPortfolio;
  useEffect(() => {
    if (progress?.pipelineStatus === "ready") reloadPortfolio();
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

  if (!canFetch) {
    return (
      <Body>
        <EmptyState
          title="Sign in to use sourcing"
          hint="Buy-boxes and off-market candidates live behind your account."
        />
      </Body>
    );
  }

  if (s.thesesLoading) {
    return (
      <Body>
        <LoadingState label="Loading your buy-boxes…" />
      </Body>
    );
  }

  if (s.thesesError) {
    return (
      <Body>
        <EmptyState
          title="Couldn't load sourcing"
          hint="There was a problem reaching the sourcing service. Ask Yulia to help, or try again shortly."
          cta="Ask Yulia"
          onCta={askYuliaForBuyBox}
        />
      </Body>
    );
  }

  if (s.theses.length === 0) {
    return (
      <Body>
        <EmptyState
          title="No buy-box defined yet"
          hint="Tell Yulia what you're looking for — industry, geography, size — and she'll search Google Places and score off-market targets against it."
          cta="Define a buy-box with Yulia"
          onCta={askYuliaForBuyBox}
        />
      </Body>
    );
  }

  const stageIdx = currentStageIndex(livePortfolio);
  const steps = stepStates(stageIdx);

  return (
    <Body>
      {/* Thesis selector (only when more than one) — own block, edge-bleed scroll. */}
      {s.theses.length > 1 && (
        <div
          className="scr"
          style={{
            margin: "2px -18px 0",
            padding: PAGE_H,
            overflowX: "auto",
            display: "flex",
            gap: 8,
          }}
        >
          {s.theses.map((t) => {
            const active = t.id === s.selectedThesisId;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => s.selectThesis(t.id)}
                style={{
                  flex: "none",
                  border: "none",
                  borderRadius: T.rPill,
                  padding: "7px 14px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: T.font,
                  background: active ? T.blueBg : T.white,
                  color: active ? T.blue : T.muted,
                  boxShadow: active ? "none" : T.shSoft,
                  whiteSpace: "nowrap",
                }}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Buy-box card. */}
      {selectedThesis && (
        <div
          style={{
            background: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: 15,
            padding: 14,
            boxShadow: T.shSoft,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 10,
              marginBottom: 6,
            }}
          >
            <span style={{ fontSize: 15.5, fontWeight: 700, color: T.ink }}>
              {selectedThesis.name}
            </span>
            <button
              type="button"
              onClick={() =>
                chat?.send(
                  `Let's refine my buy-box for "${selectedThesis.name}" and rescore the targets.`,
                )
              }
              style={{
                flex: "none",
                border: "none",
                background: "transparent",
                color: T.blue,
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: T.font,
                padding: 0,
              }}
            >
              Edit
            </button>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.5, color: T.ink3 }}>
            {buyBoxParts(selectedThesis).join(" · ") || "Buy-box details not set yet."}
          </div>
        </div>
      )}

      {/* Stepper — horizontal edge-bleed scroll. */}
      <div
        className="scr"
        style={{
          margin: "0 -18px",
          padding: PAGE_H,
          overflowX: "auto",
          display: "flex",
        }}
      >
        <StepperPills steps={steps} />
      </div>

      {/* Live pipeline progress (SSE) when mid-flight. */}
      {livePortfolio && isActive && (
        <div
          style={{
            background: T.blueBg3,
            border: `1px solid ${T.approvalBd}`,
            borderRadius: 14,
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 7,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 14, color: T.ink }}>
            <span
              aria-hidden="true"
              style={{
                width: 14,
                height: 14,
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
            <div style={{ fontSize: 14, color: T.muted, fontWeight: 600 }}>
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
            borderRadius: 14,
            padding: "11px 14px",
            fontSize: 13.5,
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
              flex: "none",
              border: "none",
              background: "transparent",
              color: T.terra,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "underline",
              cursor: "pointer",
              fontFamily: T.font,
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Candidate region. */}
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
        onRoute={(c) =>
          chat?.send(
            `Draft outreach for ${c.name || "this target"}${
              selectedThesis ? ` from my "${selectedThesis.name}" buy-box` : ""
            }.`,
          )
        }
      />
    </Body>
  );
}

/* ─── Candidate region: build / loading / empty / list states ─────────────── */

function CandidateRegion({
  portfolioPresent,
  portfolioLoading,
  candidatesLoading,
  building,
  isActive,
  candidates,
  onBuild,
  onAskYulia,
  onRoute,
}: {
  portfolioPresent: boolean;
  portfolioLoading: boolean;
  candidatesLoading: boolean;
  building: boolean;
  isActive: boolean;
  candidates: Candidate[];
  onBuild: () => void;
  onAskYulia: () => void;
  onRoute: (c: Candidate) => void;
}) {
  if (portfolioLoading) {
    return (
      <div style={{ display: "flex", minHeight: 200 }}>
        <LoadingState label="Loading candidates…" />
      </div>
    );
  }

  // Thesis defined, but no portfolio built yet → offer to run discovery.
  if (!portfolioPresent) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 11,
          padding: "40px 18px",
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 600, color: T.ink }}>
          No candidates sourced yet
        </div>
        <div style={{ fontSize: 14, color: T.muted, lineHeight: 1.5, maxWidth: 320 }}>
          Run discovery to search Google Places and score off-market targets against
          this buy-box, or ask Yulia to source for you.
        </div>
        <div style={{ display: "flex", gap: 9, marginTop: 2, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            type="button"
            onClick={onBuild}
            disabled={building}
            style={{
              background: T.blue,
              color: "#fff",
              border: "none",
              borderRadius: T.rPill,
              padding: "10px 18px",
              fontSize: 14,
              fontWeight: 700,
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
              padding: "10px 16px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: T.font,
            }}
          >
            Ask Yulia
          </button>
        </div>
      </div>
    );
  }

  if (candidatesLoading) {
    return (
      <div style={{ display: "flex", minHeight: 200 }}>
        <LoadingState label="Loading candidates…" />
      </div>
    );
  }

  // Portfolio exists but no candidates yet.
  if (candidates.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 9,
          padding: "40px 18px",
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, color: T.ink }}>
          {isActive ? "Scoring in progress" : "No candidates yet"}
        </div>
        <div style={{ fontSize: 14, color: T.muted, lineHeight: 1.5, maxWidth: 320 }}>
          {isActive
            ? "Yulia is searching and scoring targets — they'll appear here as they're found."
            : "Try broadening the buy-box geography or industry, or ask Yulia to widen the search."}
        </div>
      </div>
    );
  }

  // The real candidate card list.
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          fontSize: 15.5,
          fontWeight: 700,
          color: T.ink,
          letterSpacing: "-0.01em",
          padding: "0 2px",
        }}
      >
        {candidates.length} {candidates.length === 1 ? "candidate" : "candidates"}
        <span style={{ color: T.muted, fontWeight: 600 }}> · Google Places</span>
      </div>
      {candidates.map((c) => (
        <CandidateCard key={c.id} c={c} onRoute={() => onRoute(c)} />
      ))}
    </div>
  );
}

/* ─── Candidate card (single column) ──────────────────────────────────────── */

function CandidateCard({ c, onRoute }: { c: Candidate; onRoute: () => void }) {
  const fit = fitChipColors(c.total_score);
  const fitIsReal = Number.isFinite(Number(c.total_score));
  const loc = [c.city, c.state].filter(Boolean).join(", ");
  const route = routeInfo(c.pipeline_status, c.tier);

  return (
    <div
      style={{
        background: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: 13,
        boxShadow: T.shSoft,
      }}
    >
      {/* Row 1: name + fit chip */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: loc ? 5 : 9 }}>
        <span
          style={{
            flex: 1,
            minWidth: 0,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            fontSize: 15.5,
            fontWeight: 700,
            color: T.ink,
            overflow: "hidden",
            lineHeight: 1.3,
          }}
          title={c.name || undefined}
        >
          {c.name || "Unnamed business"}
        </span>
        <Pill bg={fit.bg} fg={fit.fg} style={{ flex: "none", fontSize: 13, padding: "3px 10px" }}>
          {fitIsReal ? `Fit ${Number(c.total_score)}` : "Fit —"}
        </Pill>
      </div>

      {/* Optional location line */}
      {loc && (
        <div
          style={{
            fontSize: 14,
            color: T.muted,
            marginBottom: 9,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.45,
          }}
        >
          {loc}
        </div>
      )}

      {/* Row 2: tier (left) + route (right) */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: tierColor(c.tier) }}>
          {tierLabel(c.tier)}
        </span>
        {route.action ? (
          <button
            type="button"
            onClick={onRoute}
            style={{
              flex: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 2,
              border: "none",
              background: "transparent",
              color: T.blue,
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: T.font,
              padding: 0,
            }}
          >
            {route.label}
            <ChevronRightIcon size={15} c={T.blue} />
          </button>
        ) : (
          <span style={{ fontSize: 14, fontWeight: 600, color: T.muted }}>{route.label}</span>
        )}
      </div>
    </div>
  );
}

/* ─── Body wrapper (horizontal padding only; shell owns vertical + clearance) ── */

function Body({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: PAGE_H,
        paddingTop: 14,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        fontFamily: T.font,
        color: T.ink,
      }}
    >
      {children}
    </div>
  );
}
