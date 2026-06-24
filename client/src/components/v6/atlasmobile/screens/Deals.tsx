/**
 * Atlas MOBILE — DEALS (the merged portfolio screen). The former Pipeline frame
 * is folded in as a Board/List Segmented toggle, exactly like the desktop Deals
 * merge (desktop/screens/Deals.tsx):
 *
 *   - LIST (default): the vertical portfolio list — search + All/Buy/Sell/
 *     Watchlist chips over the filtered set; MarkBadge + name over "sector · EV",
 *     stage pill + "Fit NN" (fit only when real).
 *   - BOARD: the active funnel ported from Pipeline.tsx — stat chips
 *     (usePortfolioSummary) + stage-filter tabs + per-stage deal cards, grouped
 *     by the five shared PIPELINE_STAGES.
 *
 * BOTH views read the SAME data layer (`useMobileDeals(user).all`) — one fetch,
 * one filter pass shared between them (search + chips apply to both).
 *
 * Honesty (mirrors the desktop sibling):
 *  - SECTOR: read the segment before the first "·" in `sub`; else "—".
 *  - EV: asking price ONLY (never EBITDA/SDE under an EV label) → fmtCents.
 *  - BOARD money: ask → EBITDA → SDE with a `> 0` guard so a literal 0-cents
 *    value never prints "$0".
 *  - FIT: rendered only when `fit` is a real composite (the hook nulls
 *    synthetic fits in `all`). Otherwise no fit line.
 *  - KPIs: IN FLOW / FLOW VALUE are real summary fields; IOI/LOI and STALLED are
 *    not derivable from the available fields → honest "—".
 */
import { useMemo, useState } from "react";
import type { AtlasScreenProps } from "../../desktop/atlasNav";
import { useAtlasNav, useAtlasChat } from "../../desktop/atlasNav";
import {
  useMobileDeals,
  type MobileStageRow,
} from "../../../../hooks/useMobileDeals";
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
  Segmented,
  EmptyState,
  LoadingState,
  fmtCents,
} from "../../desktop/primitives";
import { SearchIcon } from "../../desktop/icons";
import { T } from "../../desktop/atlasTokens";
import { RT } from "../redesign/rt";
import { ActionRow, MarkBadge as RMarkBadge } from "../redesign/kit";

type FilterId = "all" | "buy" | "sell" | "watch";
type LayoutId = "list" | "board";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "buy", label: "Buy-side" },
  { id: "sell", label: "Sell-side" },
  { id: "watch", label: "Watchlist" },
];

/* ─── per-row derivations (copied wiring from the desktop sibling) ── */

/** Sector from the `sub` line — the hook builds `all`'s sub as
 *  `[industry, location].join(" · ")`, so the leading segment is the sector
 *  ONLY when a "·" separator is present. Without it the sub is a location or a
 *  non-sector fallback, so we show "—" rather than mislabel it. */
function sectorOf(row: MobileStageRow): string {
  const sub = (row.sub ?? "").trim();
  if (!sub.includes("·")) return "—";
  const first = sub.split("·")[0]?.trim();
  return first || "—";
}

/** Stage label + pill palette, keyed off the gate-derived stageId. */
function stageMeta(row: MobileStageRow): { label: string; bg: string; fg: string } {
  switch (row.stageId) {
    case "source":
      return { label: "Sourcing", bg: T.track, fg: T.muted };
    case "value":
      return { label: "Valuation", bg: T.amberBg2, fg: T.amber };
    case "diligence":
      return { label: "Diligence", bg: T.blueBg, fg: T.blue };
    case "structure":
      return { label: "Structuring", bg: T.terraBg, fg: T.terra };
    case "close":
      return { label: "Close / PMI", bg: T.greenBg, fg: T.green };
    default:
      return { label: "—", bg: T.track, fg: T.muted };
  }
}

/** Enterprise value = asking price ONLY (integer cents). No EBITDA/SDE
 *  fallback — that would mislabel earnings as EV. No ask → "—" via fmtCents. */
function evCents(row: MobileStageRow): number | null {
  return row.askingPrice ?? null;
}

/** Fit pill palette by score: ≥80 green, 65–79 blue, <65 gray. */
function fitMeta(fit: number): { bg: string; fg: string } {
  if (fit >= 80) return { bg: T.greenBg, fg: T.green };
  if (fit >= 65) return { bg: T.blueBg, fg: T.blue };
  return { bg: T.track, fg: T.muted2 };
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

/** Buy/sell side from the gate letter prefix (B → buy, S → sell, R → raise). */
function sideOf(row: MobileStageRow): "buy" | "sell" | "raise" {
  const c = (row.gate ?? "").trim().charAt(0).toUpperCase();
  if (c === "S") return "sell";
  if (c === "R") return "raise";
  return "buy";
}

/* ─── board money helpers (ported from Pipeline) ───────────── */

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

/* ─── stage-filter ladder (board) ──────────────────────────── */

type StageFilterId = "all" | PipelineStageId;

const PAGE_H = "0 18px"; // shell owns vertical/bottom; we own horizontal 18px

/* ─── screen ───────────────────────────────────────────────── */

export default function DealsMobileScreen({ user }: AtlasScreenProps) {
  const nav = useAtlasNav();
  const chat = useAtlasChat();
  const { all, loading, loaded, isAuthed } = useMobileDeals(user);
  const { summary } = usePortfolioSummary(user, isAuthed);

  const [layout, setLayout] = useState<LayoutId>("list");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");
  const [stageFilter, setStageFilter] = useState<StageFilterId>("all");

  // Client-side filter: search over name + sub, chips over side/watchlist.
  // Drives BOTH the list and the board (same `all` set, one filter pass).
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((row) => {
      if (q) {
        const hay = `${row.name} ${row.sub ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filter === "watch") return row.verdict === "watch";
      if (filter === "buy") return sideOf(row) === "buy";
      if (filter === "sell") return sideOf(row) === "sell";
      return true;
    });
  }, [all, query, filter]);

  // Board grouping — the same filtered slice, bucketed into the five stages.
  const byStage = useMemo(() => {
    const groups: Record<PipelineStageId, MobileStageRow[]> = {
      source: [],
      value: [],
      diligence: [],
      structure: [],
      close: [],
    };
    for (const row of filtered) groups[row.stageId].push(row);
    return groups;
  }, [filtered]);

  const openDeal = (row: MobileStageRow) => nav.openDeal(row.rawId, row.name);

  /* ── KPIs (real fields or honest "—") ──────────────────── */
  const inFlow = summary ? String(summary.totalActive) : "—";
  const flowValue = summary ? fmtCents(summary.weightedEvCents) : "—";

  const toolbar = (
    <Toolbar
      layout={layout}
      onLayout={setLayout}
      query={query}
      onSearch={setQuery}
      filter={filter}
      onFilter={setFilter}
      count={loaded ? all.length : 0}
    />
  );

  /* ── loading / empty (shared by both layouts) ──────────── */
  if (loading && !loaded) {
    return (
      <div style={S.root}>
        {toolbar}
        <div style={{ padding: "32px 18px", display: "flex", minHeight: 200 }}>
          <LoadingState label="Loading your deals…" />
        </div>
      </div>
    );
  }

  if (loaded && all.length === 0) {
    return (
      <div style={S.root}>
        {toolbar}
        <div style={{ padding: "24px 18px", display: "flex", minHeight: 260 }}>
          <EmptyState
            title="No deals yet"
            hint="Talk to Yulia to add a target, evaluate a business, or import a deal. She is the front door to everything in Atlas."
            cta="Add your first deal"
            onCta={() => chat?.send("I want to add a new deal.")}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={S.root}>
      {toolbar}
      {layout === "board" ? (
        <BoardView
          byStage={byStage}
          matchCount={filtered.length}
          stageFilter={stageFilter}
          onStageFilter={setStageFilter}
          inFlow={inFlow}
          flowValue={flowValue}
          onOpen={openDeal}
        />
      ) : (
        <ListView filtered={filtered} onOpen={openDeal} />
      )}
    </div>
  );
}

/* ─── toolbar (Board/List toggle + search + filter chips) ──── */

function Toolbar({
  layout,
  onLayout,
  query,
  onSearch,
  filter,
  onFilter,
  count,
}: {
  layout: LayoutId;
  onLayout: (id: LayoutId) => void;
  query: string;
  onSearch: (v: string) => void;
  filter: FilterId;
  onFilter: (id: FilterId) => void;
  count: number;
}) {
  return (
    <div style={{ padding: "6px 18px 0" }}>
      {/* Board/List toggle — the shell header already shows the "Deals" title, so
          we don't repeat it here. (Full tab-header model lands in the nav rework.) */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Segmented
          options={[
            { id: "list", label: "List" },
            { id: "board", label: "Board" },
          ]}
          value={layout}
          onChange={onLayout}
        />
      </div>

      {/* search field */}
      <label
        style={{
          height: 44,
          background: RT.card,
          borderRadius: RT.rPill,
          display: "flex",
          alignItems: "center",
          padding: "0 15px",
          gap: 9,
          marginBottom: 11,
        }}
      >
        <SearchIcon size={19} c={RT.faint} />
        <input
          value={query}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={count > 0 ? `Search ${count} deals` : "Search deals"}
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            background: "transparent",
            outline: "none",
            fontSize: 15,
            color: RT.ink,
            fontFamily: RT.font,
          }}
        />
      </label>

      {/* filter chips — edge-bleed horizontal scroll */}
      <div
        className="scr"
        style={{
          display: "flex",
          gap: 7,
          margin: "0 -18px",
          padding: "0 18px",
          overflowX: "auto",
        }}
      >
        {FILTERS.map((f) => {
          const active = f.id === filter;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilter(f.id)}
              style={{
                flex: "none",
                fontSize: 14,
                fontWeight: 600,
                padding: "8px 15px",
                borderRadius: RT.rPill,
                cursor: "pointer",
                fontFamily: RT.font,
                border: "none",
                background: active ? RT.accent : RT.card,
                color: active ? "#fff" : RT.muted,
                whiteSpace: "nowrap",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── list view (the vertical portfolio list) ──────────────── */

function ListView({
  filtered,
  onOpen,
}: {
  filtered: MobileStageRow[];
  onOpen: (row: MobileStageRow) => void;
}) {
  if (filtered.length === 0) {
    return (
      <div style={{ padding: "24px 18px" }}>
        <EmptyState title="No deals match" hint="Try a different search or filter." />
      </div>
    );
  }
  // Whitespace-separated rows on the grey page (no card, no dividers) — tap to
  // open. Per-deal actions live in the cockpit + the Yulia sheet, not a "⋯" here.
  return (
    <div style={{ padding: "8px 18px 4px" }}>
      {filtered.map((row) => (
        <DealRow key={row.id} row={row} onOpen={() => onOpen(row)} />
      ))}
    </div>
  );
}

/* ─── board view (stat chips + stage tabs + cards, from Pipeline) ── */

function BoardView({
  byStage,
  matchCount,
  stageFilter,
  onStageFilter,
  inFlow,
  flowValue,
  onOpen,
}: {
  byStage: Record<PipelineStageId, MobileStageRow[]>;
  matchCount: number;
  stageFilter: StageFilterId;
  onStageFilter: (id: StageFilterId) => void;
  inFlow: string;
  flowValue: string;
  onOpen: (row: MobileStageRow) => void;
}) {
  // The card column: a single selected stage, or every stage in section order.
  const sections =
    stageFilter === "all"
      ? PIPELINE_STAGES.map((s) => ({ stage: s, rows: byStage[s.id] }))
      : PIPELINE_STAGES.filter((s) => s.id === stageFilter).map((s) => ({
          stage: s,
          rows: byStage[s.id],
        }));

  const visibleCount =
    stageFilter === "all" ? matchCount : byStage[stageFilter].length;

  return (
    <div
      style={{
        fontFamily: T.font,
        color: T.ink,
        display: "flex",
        flexDirection: "column",
        marginTop: 12,
      }}
    >
      {/* ── Stat chips (edge-bleed horizontal scroll) ───────── */}
      <div
        className="scr"
        style={{
          margin: "0 0 6px",
          padding: "0 18px",
          overflowX: "auto",
          display: "flex",
          gap: 10,
        }}
      >
        <StatChip>
          <KpiCard label="IN FLOW" value={inFlow} delta="active deals" deltaColor={T.muted} />
        </StatChip>
        <StatChip>
          <KpiCard label="FLOW VALUE" value={flowValue} delta="weighted EV" deltaColor={T.muted} />
        </StatChip>
        {/* Honest "—": LOI-out and stalled counts are not derivable from the
            available deal fields, so we show the gap rather than fabricate —
            the exact gap the desktop Board declares. */}
        <StatChip>
          <KpiCard label="IOI / LOI" value="—" delta="not yet tracked" deltaColor={T.muted} />
        </StatChip>
        <StatChip>
          <KpiCard label="STALLED" value="—" delta="not yet tracked" deltaColor={T.muted} />
        </StatChip>
      </div>

      {/* ── Stage filter tabs (edge-bleed horizontal scroll) ── */}
      <div
        className="scr"
        style={{
          margin: "0 0 14px",
          padding: "0 18px",
          overflowX: "auto",
          display: "flex",
          gap: 8,
        }}
      >
        <StageTab
          label="All"
          count={matchCount}
          active={stageFilter === "all"}
          onClick={() => onStageFilter("all")}
        />
        {PIPELINE_STAGES.map((s) => (
          <StageTab
            key={s.id}
            label={s.title}
            count={byStage[s.id].length}
            active={stageFilter === s.id}
            onClick={() => onStageFilter(s.id)}
          />
        ))}
      </div>

      {/* ── Deal card column ─────────────────────────────────── */}
      <div style={{ padding: PAGE_H, display: "flex", flexDirection: "column", gap: 14 }}>
        {visibleCount === 0 ? (
          <div style={{ display: "flex", minHeight: 200 }}>
            <EmptyState
              title="No deals in this stage"
              hint="Switch stages above or clear the search to see the rest of your pipeline."
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
                    <span style={{ fontSize: 15.5, fontWeight: 700, color: T.ink, letterSpacing: "-0.01em" }}>
                      {stage.title}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: T.muted }}>{rows.length}</span>
                  </div>
                )}
                {rows.map((row) => (
                  <DealCard key={row.id} row={row} onOpen={() => onOpen(row)} />
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

/* ─── stage filter tab (board) ─────────────────────────────── */

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
        fontSize: 14,
        fontWeight: 700,
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
          fontSize: 14,
          fontWeight: 600,
          color: active ? T.blue : T.muted,
        }}
      >
        {count}
      </span>
    </button>
  );
}

/* ─── deal row (list) ──────────────────────────────────────── */

function DealRow({ row, onOpen }: { row: MobileStageRow; onOpen: () => void }) {
  const sector = sectorOf(row);
  const stage = stageMeta(row);
  const ev = fmtCents(evCents(row));
  const fitReal = typeof row.fit === "number";

  // "sector · EV [· Fit NN]" — drop absent halves so we never print a bare "·".
  const meta = [
    sector !== "—" ? sector : null,
    ev !== "—" ? ev : null,
    fitReal ? `Fit ${row.fit}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <ActionRow
      leading={<RMarkBadge label={row.name} seed={row.rawId} size={40} />}
      title={row.name}
      sub={meta || "—"}
      action={
        <Pill bg={stage.bg} fg={stage.fg} style={{ fontSize: 12, padding: "5px 11px" }}>
          {stage.label}
        </Pill>
      }
      onClick={onOpen}
    />
  );
}

/* ─── deal card (board · single column, ported from Pipeline) ── */

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
            fontSize: 15.5,
            fontWeight: 700,
            color: T.ink,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.3,
          }}
          title={row.name}
        >
          {row.name}
        </div>
        <Pill bg={vp.bg} fg={vp.fg} style={{ fontSize: 11, padding: "3px 9px", flex: "none" }}>
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
          fontSize: 14,
          color: T.muted,
        }}
      >
        <span
          style={{
            minWidth: 0,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.45,
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

const S: Record<string, React.CSSProperties> = {
  root: { color: RT.ink, fontFamily: RT.font, display: "flex", flexDirection: "column" },
};
