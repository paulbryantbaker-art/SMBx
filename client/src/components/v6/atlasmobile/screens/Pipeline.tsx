/**
 * Atlas-MOBILE Pipeline (frame 03) — the active funnel for the signed-in user's
 * deals, grouped by the five shared PIPELINE_STAGES (Source → Value → Diligence
 * → Structure → Close). This is the BODY only — the shell renders the header,
 * the scroll area (with bottom nav clearance), the bottom nav, and the Yulia FAB.
 *
 * Data + honesty mirror the desktop sibling `desktop/screens/Deals.tsx` Board
 * view (same hooks, same honest handling), re-laid as a single-column mobile
 * surface per the design map ("FRAME 03 · Pipeline"):
 *   - Stat chips: IN FLOW + FLOW VALUE are real `usePortfolioSummary` fields;
 *     IOI/LOI OUT and STALLED are NOT derivable from the available fields →
 *     honest "—", never fabricated (same gap the desktop Board declares).
 *   - Stage tabs: the five real PIPELINE_STAGES plus "All", with real per-stage
 *     counts. The active tab filters the single card column below.
 *   - Deal cards: MarkBadge + name + verdict pill over a meta row (money · sector
 *     | fit). Money falls through ask → EBITDA → SDE with a `> 0` guard so a
 *     literal 0-cents value never prints "$0". Fit renders ONLY when `fit` is a
 *     real composite (the hook nulls synthetic fits in `all`). Sector is read
 *     from the `sub` line before the first "·", else "—".
 *   - Card tap → openDeal(rawId, name) → cockpit.
 */
import { useMemo, useState } from "react";
import type { AtlasScreenProps } from "../../desktop/atlasNav";
import { useAtlasNav } from "../../desktop/atlasNav";
import { useMobileDeals, type MobileStageRow } from "../../../../hooks/useMobileDeals";
import { usePortfolioSummary } from "../../../../hooks/usePortfolioSummary";
import {
  PIPELINE_STAGES,
  type PipelineStageId,
} from "../../../../lib/pipelineStages";
import type { Verdict } from "../../mobile/types";
import {
  MarkBadge,
  Pill,
  KpiCard,
  EmptyState,
  LoadingState,
  fmtCents,
} from "../../desktop/primitives";
import { T } from "../../desktop/atlasTokens";

/* ─── per-row derivations (honest — ported from desktop Deals) ─── */

/** Sector from the `sub` line: the hook builds `all`'s sub as
 *  `[industry, location].join(" · ")`, so the leading segment is the sector
 *  ONLY when a "·" separator is present. Without it the sub is a bare location
 *  or a buildSub fallback — none of which are sectors — so show "—". */
function sectorOf(row: MobileStageRow): string {
  const sub = (row.sub ?? "").trim();
  if (!sub.includes("·")) return "—";
  const first = sub.split("·")[0]?.trim();
  return first || "—";
}

/** Treat a non-positive cents value as absent — a literal "0" cents must NOT
 *  render "$0"; fall through to the next real figure. Mirrors the hook's guard. */
function pos(cents: number | null): number | null {
  return typeof cents === "number" && cents > 0 ? cents : null;
}
function moneyFor(row: MobileStageRow): number | null {
  return pos(row.askingPrice) ?? pos(row.ebitda) ?? pos(row.sde) ?? null;
}
function moneyLabel(row: MobileStageRow): string {
  if (pos(row.askingPrice) != null) return "Ask";
  if (pos(row.ebitda) != null) return "EBITDA";
  if (pos(row.sde) != null) return "SDE";
  return "";
}

/** Verdict pill palette (per design map: Pursue green, Pass amber, Watch blue). */
function verdictPill(v: Verdict): { label: string; bg: string; fg: string } {
  if (v === "pursue") return { label: "Pursue", bg: T.greenBg, fg: T.green };
  if (v === "pass") return { label: "Pass", bg: T.amberBg, fg: T.amber };
  return { label: "Watch", bg: T.blueBg, fg: T.blue };
}

/** Mark-tile palette — stable per row so the list reads as a set, not noise. */
const MARK_TINTS: { bg: string; fg: string }[] = [
  { bg: T.blueBg, fg: T.blue },
  { bg: T.greenBg, fg: T.green },
  { bg: T.violetBg, fg: T.violet },
  { bg: T.amberBg, fg: T.amber },
  { bg: T.terraBg, fg: T.terra },
];
function markTint(rawId: number) {
  return MARK_TINTS[Math.abs(rawId) % MARK_TINTS.length];
}

/* ─── stage-filter ladder ──────────────────────────────────── */

type StageFilterId = "all" | PipelineStageId;

const PAGE_H = "0 18px"; // shell owns vertical/bottom; we own horizontal 18px

/* ─── screen ───────────────────────────────────────────────── */

export default function PipelineMobileScreen({ user }: AtlasScreenProps) {
  const nav = useAtlasNav();
  const { all, loading, loaded, isAuthed } = useMobileDeals(user);
  const { summary } = usePortfolioSummary(user, isAuthed);

  const [stageFilter, setStageFilter] = useState<StageFilterId>("all");

  // Per-stage buckets (real grouping, same taxonomy as desktop Board).
  const byStage = useMemo(() => {
    const groups: Record<PipelineStageId, MobileStageRow[]> = {
      source: [],
      value: [],
      diligence: [],
      structure: [],
      close: [],
    };
    for (const row of all) groups[row.stageId].push(row);
    return groups;
  }, [all]);

  const openDeal = (row: MobileStageRow) => nav.openDeal(row.rawId, row.name);

  /* ── KPIs (real fields or honest "—") ──────────────────── */
  const inFlow = summary ? String(summary.totalActive) : "—";
  const flowValue = summary ? fmtCents(summary.weightedEvCents) : "—";

  /* ── loading / empty ───────────────────────────────────── */
  if (loading && !loaded) {
    return (
      <div style={{ padding: PAGE_H, display: "flex", minHeight: 240 }}>
        <LoadingState label="Loading your pipeline…" />
      </div>
    );
  }

  if (loaded && all.length === 0) {
    return (
      <div style={{ padding: PAGE_H, display: "flex", minHeight: 280 }}>
        <EmptyState
          title="No deals in flight"
          hint="Talk to Yulia to add a target, evaluate a business, or import a deal. She is the front door to everything in Atlas."
        />
      </div>
    );
  }

  // The card column: a single selected stage, or every stage in section order.
  const sections =
    stageFilter === "all"
      ? PIPELINE_STAGES.map((s) => ({ stage: s, rows: byStage[s.id] }))
      : PIPELINE_STAGES.filter((s) => s.id === stageFilter).map((s) => ({
          stage: s,
          rows: byStage[s.id],
        }));

  const visibleCount =
    stageFilter === "all" ? all.length : byStage[stageFilter].length;

  return (
    <div
      style={{
        fontFamily: T.font,
        color: T.ink,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Stat chips (edge-bleed horizontal scroll) ───────── */}
      <div
        className="scr"
        style={{
          margin: "4px -18px 6px",
          padding: "0 18px",
          overflowX: "auto",
          display: "flex",
          gap: 10,
        }}
      >
        <StatChip>
          <KpiCard label="IN FLOW" value={inFlow} delta="active deals" deltaColor={T.muted2} />
        </StatChip>
        <StatChip>
          <KpiCard label="FLOW VALUE" value={flowValue} delta="weighted EV" deltaColor={T.muted2} />
        </StatChip>
        {/* Honest "—": LOI-out and stalled counts are not derivable from the
            available deal fields, so we show the gap rather than fabricate —
            the exact gap the desktop Board declares. */}
        <StatChip>
          <KpiCard label="IOI / LOI" value="—" delta="not yet tracked" deltaColor={T.muted2} />
        </StatChip>
        <StatChip>
          <KpiCard label="STALLED" value="—" delta="not yet tracked" deltaColor={T.muted2} />
        </StatChip>
      </div>

      {/* ── Stage filter tabs (edge-bleed horizontal scroll) ── */}
      <div
        className="scr"
        style={{
          margin: "0 -18px 14px",
          padding: "0 18px",
          overflowX: "auto",
          display: "flex",
          gap: 8,
        }}
      >
        <StageTab
          label="All"
          count={all.length}
          active={stageFilter === "all"}
          onClick={() => setStageFilter("all")}
        />
        {PIPELINE_STAGES.map((s) => (
          <StageTab
            key={s.id}
            label={s.title}
            count={byStage[s.id].length}
            active={stageFilter === s.id}
            onClick={() => setStageFilter(s.id)}
          />
        ))}
      </div>

      {/* ── Deal card column ─────────────────────────────────── */}
      <div style={{ padding: PAGE_H, display: "flex", flexDirection: "column", gap: 14 }}>
        {visibleCount === 0 ? (
          <div style={{ display: "flex", minHeight: 200 }}>
            <EmptyState
              title="No deals in this stage"
              hint="Switch stages above to see the rest of your pipeline."
            />
          </div>
        ) : (
          sections.map(({ stage, rows }) => {
            if (rows.length === 0) return null;
            return (
              <section key={stage.id} style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {/* Only label sections in the "All" overview — a single filtered
                    stage already names itself via the active tab above. */}
                {stageFilter === "all" && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 8,
                      padding: "2px 2px 0",
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.label }}>
                      {stage.title}
                    </span>
                    <span style={{ fontSize: 12, color: T.faint }}>{rows.length}</span>
                  </div>
                )}
                {rows.map((row) => (
                  <DealCard key={row.id} row={row} onOpen={() => openDeal(row)} />
                ))}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ─── stat chip wrapper — fixes the KpiCard width for horizontal scroll ── */

function StatChip({ children }: { children: React.ReactNode }) {
  // KpiCard is flex:1 by design; in a horizontal scroller we give it a fixed
  // min width so the chips don't collapse.
  return <div style={{ flex: "none", width: 138, display: "flex" }}>{children}</div>;
}

/* ─── stage filter tab ─────────────────────────────────────── */

function StageTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        fontWeight: 600,
        padding: active ? "7px 14px" : "7px 12px",
        borderRadius: T.rPill,
        border: "none",
        cursor: "pointer",
        fontFamily: T.font,
        background: active ? T.blueBg : "transparent",
        color: active ? T.blue : T.muted,
        whiteSpace: "nowrap",
      }}
    >
      {label}
      <span
        style={{
          fontSize: 11.5,
          fontWeight: 600,
          color: active ? T.blue : T.faint,
        }}
      >
        {count}
      </span>
    </button>
  );
}

/* ─── deal card (single column) ────────────────────────────── */

function DealCard({ row, onOpen }: { row: MobileStageRow; onOpen: () => void }) {
  const tint = markTint(row.rawId);
  const vp = verdictPill(row.verdict);
  const money = fmtCents(moneyFor(row));
  const label = moneyLabel(row);
  const sector = sectorOf(row);

  // Meta line (left): "money · sector", but only the parts that are real.
  const metaParts: string[] = [];
  if (money !== "—") metaParts.push(label ? `${money} ${label}` : money);
  if (sector !== "—") metaParts.push(sector);
  const metaLeft = metaParts.length ? metaParts.join(" · ") : row.sub || "—";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      style={{
        background: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: 15,
        padding: 15,
        cursor: "pointer",
        boxShadow: T.shSoft,
        outline: "none",
        transition: "box-shadow .15s ease",
      }}
    >
      {/* header row: monogram + name + verdict pill */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}>
        <MarkBadge letter={row.name} bg={tint.bg} fg={tint.fg} size={30} radius={8} />
        <div
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 15,
            fontWeight: 600,
            color: T.ink,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={row.name}
        >
          {row.name}
        </div>
        <Pill bg={vp.bg} fg={vp.fg} style={{ fontSize: 10.5, padding: "3px 9px", flex: "none" }}>
          {vp.label}
        </Pill>
      </div>

      {/* meta row: money · sector (left) | fit (right) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          fontSize: 12.5,
          color: T.muted,
        }}
      >
        <span
          style={{
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={metaLeft}
        >
          {metaLeft}
        </span>
        {/* Fit numeral renders ONLY when backed by a real composite. */}
        {row.fit != null && (
          <span style={{ flex: "none", color: T.ink3, fontWeight: 600 }}>
            Fit {row.fit}
          </span>
        )}
      </div>
    </div>
  );
}
