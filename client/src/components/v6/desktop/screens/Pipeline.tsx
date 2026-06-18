/**
 * Atlas — PIPELINE screen (view 1, isApp, NO sub-list).
 *
 * Kanban board of every deal the user owns, grouped into the five shared
 * pipeline stages (source / value / diligence / structure / close) from
 * `useMobileDeals.all`. KPI row reads `usePortfolioSummary`. Board/Table
 * toggle reuses the same data. Owner/sector filter chips run client-side.
 *
 * Honesty:
 *  - IN FLOW = portfolio totalActive; FLOW VALUE = weightedEvCents.
 *  - IOI/LOI and STALLED are NOT derivable from the available fields, so they
 *    render an honest "—" with an explanatory delta rather than a fabricated
 *    count.
 *  - Fit numerals render only when the row carries a real composite (fit != null).
 *  - No prototype literals (Project Atlas/$48M/248 deals) — every value is a
 *    real hook field or "—". Loading / empty / error states all rendered.
 */
import { useMemo, useState } from "react";
import type { AtlasScreenProps } from "../atlasNav";
import { useAtlasNav } from "../atlasNav";
import {
  Card,
  KpiCard,
  MarkBadge,
  Pill,
  Segmented,
  EmptyState,
  LoadingState,
  fmtCents,
} from "../primitives";
import { ChevronDownIcon } from "../icons";
import { T } from "../atlasTokens";
import { useMobileDeals, type MobileStageRow } from "../../../../hooks/useMobileDeals";
import { usePortfolioSummary } from "../../../../hooks/usePortfolioSummary";
import {
  PIPELINE_STAGES,
  type PipelineStageId,
} from "../../../../lib/pipelineStages";
import type { Verdict } from "../../mobile/types";

/* ─── verdict pill palette (per design map) ──────────────── */

function verdictPill(v: Verdict): { label: string; bg: string; fg: string } {
  if (v === "pursue") return { label: "Pursue", bg: T.greenBg, fg: T.green };
  if (v === "pass") return { label: "Pass", bg: T.amberBg, fg: T.amber };
  return { label: "Watch", bg: T.blueBg, fg: T.blue };
}

/* ─── mark-tile tint, deterministic per deal (no fabricated data) ── */

const MARK_TINTS: { bg: string; fg: string }[] = [
  { bg: T.blueBg, fg: T.blue },
  { bg: T.greenBg, fg: T.green },
  { bg: T.violetBg, fg: T.violet },
  { bg: T.terraBg, fg: T.terra },
  { bg: T.amberBg, fg: T.amber },
];
function markTint(rawId: number) {
  return MARK_TINTS[Math.abs(rawId) % MARK_TINTS.length];
}

/* ─── client-side filter chips over `.all` ───────────────── */

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: `1px solid ${active ? T.blue : T.border}`,
        background: active ? T.blue : T.white,
        color: active ? "#fff" : T.muted,
        borderRadius: T.rPill,
        padding: "6px 13px",
        fontSize: 12.5,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: T.font,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

/* ─── sort control (design's "Sort: Fit score ▾") ─────────── */

function SortControl({
  value,
  onChange,
}: {
  value: SortId;
  onChange: (id: SortId) => void;
}) {
  const current = SORT_OPTIONS.find((o) => o.id === value) ?? SORT_OPTIONS[0];
  return (
    <label
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 13,
        color: T.muted,
        cursor: "pointer",
        flex: "none",
      }}
    >
      <span>Sort: {current.label}</span>
      <ChevronDownIcon size={13} c={T.muted} />
      {/* Real, accessible select layered transparently over the label text. */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortId)}
        aria-label="Sort deals"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          cursor: "pointer",
          fontFamily: T.font,
        }}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/* ─── deal card ──────────────────────────────────────────── */

/** Treat a non-positive cents value as absent — a literal "0" cents (toNum
 *  returns 0, not null) must NOT render "$0 Ask"; fall through to the next real
 *  figure. Mirrors useMobileDeals.fmtMoney's `cents <= 0` guard. */
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

/** The sector token, or null. Only "industry · location" subs carry one — a
 *  location-only sub (no "·") must NOT be read as a sector. */
function sectorOf(row: MobileStageRow): string | null {
  const sub = row.sub || "";
  if (!sub.includes("·")) return null;
  return sub.split("·")[0]?.trim() || null;
}

/* ─── sort (the design's "Sort: Fit score ▾") ───────────────── */

type SortId = "fit" | "value" | "name";
const SORT_OPTIONS: { id: SortId; label: string }[] = [
  { id: "fit", label: "Fit score" },
  { id: "value", label: "Deal value" },
  { id: "name", label: "Name" },
];
const SORTERS: Record<SortId, (a: MobileStageRow, b: MobileStageRow) => number> = {
  // Real composites first (desc); rows without a fit fall to the bottom.
  fit: (a, b) => (b.fit ?? -1) - (a.fit ?? -1),
  // Largest money first; rows without a figure fall to the bottom.
  value: (a, b) => (moneyFor(b) ?? -1) - (moneyFor(a) ?? -1),
  name: (a, b) => a.name.localeCompare(b.name),
};

function DealCard({ row, onOpen }: { row: MobileStageRow; onOpen: () => void }) {
  const tint = markTint(row.rawId);
  const vp = verdictPill(row.verdict);
  const money = fmtCents(moneyFor(row));
  const label = moneyLabel(row);
  return (
    <div
      onClick={onOpen}
      style={{
        background: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        padding: 12,
        cursor: "pointer",
        boxShadow: "0 1px 2px rgba(60,64,67,.05)",
        transition: "box-shadow .15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 14px rgba(60,64,67,.13)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 2px rgba(60,64,67,.05)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
        <MarkBadge letter={row.name} bg={tint.bg} fg={tint.fg} size={23} radius={7} />
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 600,
            color: T.ink,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
          }}
          title={row.name}
        >
          {row.name}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginTop: 10,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: T.muted,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
          }}
          title={row.sub}
        >
          {money !== "—" ? (
            <>
              {money}
              {label && <span style={{ color: T.faint }}> {label}</span>}
            </>
          ) : (
            row.sub || "—"
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flex: "none" }}>
          {/* Fit numeral renders ONLY when backed by a real composite. */}
          {row.fit != null && (
            <span style={{ fontSize: 11.5, fontWeight: 700, color: T.ink3 }}>
              {row.fit}
              <span style={{ color: T.faint, fontWeight: 600 }}> fit</span>
            </span>
          )}
          <Pill bg={vp.bg} fg={vp.fg} style={{ fontSize: 10.5, padding: "2px 8px" }}>
            {vp.label}
          </Pill>
        </div>
      </div>
    </div>
  );
}

/* ─── kanban column ──────────────────────────────────────── */

const COLUMN_CAP = 12; // overflow rows fold under a "+N more" footer

function KanbanColumn({
  title,
  rows,
  onOpen,
}: {
  title: string;
  rows: MobileStageRow[];
  onOpen: (row: MobileStageRow) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? rows : rows.slice(0, COLUMN_CAP);
  const hidden = rows.length - visible.length;
  return (
    <div
      style={{
        flex: 1,
        // A floor keeps the deal-card bottom row (money + fit + verdict pill)
        // from crushing when five columns share a narrow 1024px viewport.
        minWidth: 176,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        background: T.hover,
        borderRadius: 13,
        padding: 9,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
          padding: "3px 5px 9px",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: T.label }}>{title}</div>
        <span
          style={{
            fontSize: 11.5,
            color: T.muted2,
            background: T.white,
            border: `1px solid ${T.hair}`,
            borderRadius: T.rPill,
            padding: "2px 9px",
            flex: "none",
          }}
        >
          {rows.length}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 9,
          overflow: "auto",
          flex: 1,
          minHeight: 0,
        }}
      >
        {rows.length === 0 ? (
          <div
            style={{
              fontSize: 12,
              color: T.faint,
              textAlign: "center",
              padding: "16px 8px",
            }}
          >
            No deals
          </div>
        ) : (
          <>
            {visible.map((row) => (
              <DealCard key={row.id} row={row} onOpen={() => onOpen(row)} />
            ))}
            {(hidden > 0 || expanded) && rows.length > COLUMN_CAP && (
              <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 12,
                  color: T.blue,
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 8,
                  fontFamily: T.font,
                }}
              >
                {expanded ? "Show less" : `+${hidden} more`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── table view (same data, simple rows) ────────────────── */

function TableView({
  rows,
  onOpen,
}: {
  rows: MobileStageRow[];
  onOpen: (row: MobileStageRow) => void;
}) {
  const stageTitle = useMemo(() => {
    const m: Record<PipelineStageId, string> = {} as Record<PipelineStageId, string>;
    for (const s of PIPELINE_STAGES) m[s.id] = s.title;
    return m;
  }, []);
  return (
    <Card pad={0} style={{ overflow: "hidden" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 130px 110px 90px 90px",
          gap: 12,
          padding: "11px 16px",
          borderBottom: `1px solid ${T.hair}`,
          fontSize: 11.5,
          fontWeight: 600,
          letterSpacing: ".03em",
          color: T.muted2,
        }}
      >
        <div>DEAL</div>
        <div>STAGE</div>
        <div style={{ textAlign: "right" }}>VALUE</div>
        <div style={{ textAlign: "right" }}>FIT</div>
        <div style={{ textAlign: "right" }}>VERDICT</div>
      </div>
      {rows.map((row, i) => {
        const tint = markTint(row.rawId);
        const vp = verdictPill(row.verdict);
        return (
          <div
            key={row.id}
            onClick={() => onOpen(row)}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 130px 110px 90px 90px",
              gap: 12,
              alignItems: "center",
              padding: "11px 16px",
              borderBottom: i < rows.length - 1 ? `1px solid ${T.rowDiv}` : undefined,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = T.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
              <MarkBadge letter={row.name} bg={tint.bg} fg={tint.fg} size={24} radius={7} />
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13.5,
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
                {row.sub && (
                  <div
                    style={{
                      fontSize: 12,
                      color: T.muted,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.sub}
                  </div>
                )}
              </div>
            </div>
            <div style={{ fontSize: 12.5, color: T.muted }}>{stageTitle[row.stageId]}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.ink3, textAlign: "right" }}>
              {fmtCents(moneyFor(row))}
            </div>
            <div style={{ fontSize: 13, color: T.ink3, textAlign: "right" }}>
              {row.fit != null ? row.fit : "—"}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Pill bg={vp.bg} fg={vp.fg} style={{ fontSize: 10.5, padding: "2px 8px" }}>
                {vp.label}
              </Pill>
            </div>
          </div>
        );
      })}
    </Card>
  );
}

/* ─── screen ─────────────────────────────────────────────── */

export default function PipelineScreen({ user }: AtlasScreenProps) {
  const nav = useAtlasNav();
  const deals = useMobileDeals(user);
  const { summary } = usePortfolioSummary(user, deals.isAuthed);

  const [layout, setLayout] = useState<"board" | "table">("board");
  const [sector, setSector] = useState<string>("__all__");
  const [sort, setSort] = useState<SortId>("fit");

  // Sector chips are derived from the real deal data, never hardcoded. Only the
  // "industry · location" rows carry a sector — a location-only sub (no "·")
  // would otherwise leak a place name into the sector filter, so we require the
  // separator before treating the head token as an industry.
  const sectors = useMemo(() => {
    const set = new Set<string>();
    for (const row of deals.all) {
      const head = sectorOf(row);
      if (head) set.add(head);
    }
    return Array.from(set).slice(0, 6);
  }, [deals.all]);

  const filtered = useMemo(() => {
    const base =
      sector === "__all__"
        ? deals.all
        : deals.all.filter((row) => sectorOf(row) === sector);
    // Stable, explicit ordering (the design implies a Sort affordance; the raw
    // hook order is arbitrary insertion order).
    return [...base].sort(SORTERS[sort]);
  }, [deals.all, sector, sort]);

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
  // Gate IN FLOW's delta on summary too — without it the value shows "—" so a
  // "active deals" caption would read "— · active deals".
  const inFlowDelta = summary ? "active deals" : undefined;
  const flowValue = summary ? fmtCents(summary.weightedEvCents) : "—";
  const flowDelta =
    summary && Number.isFinite(summary.totalEvCents)
      ? `of ${fmtCents(summary.totalEvCents)} total EV`
      : undefined;

  const root: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "auto",
    padding: "22px 24px",
    gap: 18,
    fontFamily: T.font,
  };

  /* ── loading / error / empty ───────────────────────────── */
  if (deals.loading || !deals.loaded) {
    return (
      <div style={root}>
        <LoadingState label="Loading pipeline…" />
      </div>
    );
  }

  if (!deals.isAuthed) {
    return (
      <div style={root}>
        <EmptyState
          title="Sign in to see your pipeline"
          hint="Your deals appear here once you're signed in."
        />
      </div>
    );
  }

  if (deals.all.length === 0) {
    return (
      <div style={root}>
        <EmptyState
          title="No deals in your pipeline yet"
          hint="Talk to Yulia to source your first deal or add one you're already tracking — it'll show up here across the five stages."
        />
      </div>
    );
  }

  return (
    <div style={root}>
      {/* KPI row */}
      <div style={{ display: "flex", gap: 14 }}>
        <KpiCard label="IN FLOW" value={inFlow} delta={inFlowDelta} />
        <KpiCard
          label="FLOW VALUE"
          value={flowValue}
          delta={flowDelta}
          deltaColor={T.muted2}
        />
        {/* Honest "—": LOI-out and stalled counts are not derivable from the
            available fields, so we show the gap rather than fabricate. */}
        <KpiCard label="IOI / LOI OUT" value="—" delta="not yet tracked" deltaColor={T.muted2} />
        <KpiCard label="STALLED >30d" value="—" delta="not yet tracked" deltaColor={T.muted2} />
      </div>

      {/* Controls row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Segmented
          options={[
            { id: "board", label: "Board" },
            { id: "table", label: "Table" },
          ]}
          value={layout}
          onChange={setLayout}
        />
        {/* Sector chips — derived from real "industry · location" subs only.
            Owner filtering is intentionally absent: RawDeal carries no owner
            field, so a "My deals / All owners" chip would be a no-op. */}
        {sectors.length > 0 && (
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            <FilterChip
              label="All sectors"
              active={sector === "__all__"}
              onClick={() => setSector("__all__")}
            />
            {sectors.map((s) => (
              <FilterChip
                key={s}
                label={s}
                active={sector === s}
                onClick={() => setSector(s)}
              />
            ))}
          </div>
        )}
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 13, color: T.muted }}>
          {filtered.length} of {deals.all.length} deals
        </div>
        {/* Sort: design map §2 — right-aligned "Sort: … ▾". */}
        <SortControl value={sort} onChange={setSort} />
      </div>

      {/* Board / Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No deals match this filter"
          hint="Clear the sector filter to see your full pipeline."
          cta="Clear filter"
          onCta={() => setSector("__all__")}
        />
      ) : layout === "board" ? (
        <div style={{ flex: 1, display: "flex", gap: 13, minHeight: 0 }}>
          {PIPELINE_STAGES.map((stage) => (
            <KanbanColumn
              key={stage.id}
              title={stage.title}
              rows={byStage[stage.id]}
              onOpen={openDeal}
            />
          ))}
        </div>
      ) : (
        <TableView rows={filtered} onOpen={openDeal} />
      )}
    </div>
  );
}
