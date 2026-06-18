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

type FilterId = string;
const OWNER_FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All deals" },
];

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

/* ─── deal card ──────────────────────────────────────────── */

function moneyFor(row: MobileStageRow): number | null {
  return row.askingPrice ?? row.ebitda ?? row.sde ?? null;
}
function moneyLabel(row: MobileStageRow): string {
  if (row.askingPrice != null) return "Ask";
  if (row.ebitda != null) return "EBITDA";
  if (row.sde != null) return "SDE";
  return "";
}

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
        minWidth: 0,
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
            {hidden > 0 && (
              <button
                type="button"
                onClick={() => setExpanded(true)}
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
                +{hidden} more
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
  const [owner, setOwner] = useState<FilterId>("all");
  const [sector, setSector] = useState<string>("__all__");

  // Sector chips are derived from the real deal data, never hardcoded.
  const sectors = useMemo(() => {
    const set = new Set<string>();
    for (const row of deals.all) {
      // sub is "industry · location" — take the leading industry token.
      const head = (row.sub || "").split("·")[0]?.trim();
      if (head) set.add(head);
    }
    return Array.from(set).slice(0, 6);
  }, [deals.all]);

  const filtered = useMemo(() => {
    if (sector === "__all__") return deals.all;
    return deals.all.filter((row) => {
      const head = (row.sub || "").split("·")[0]?.trim();
      return head === sector;
    });
  }, [deals.all, sector]);

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
        <KpiCard label="IN FLOW" value={inFlow} delta="active deals" />
        <KpiCard
          label="FLOW VALUE"
          value={flowValue}
          delta={flowDelta}
          deltaColor={T.green}
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
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {OWNER_FILTERS.map((f) => (
            <FilterChip
              key={f.id}
              label={f.label}
              active={owner === f.id}
              onClick={() => setOwner(f.id)}
            />
          ))}
          {sectors.length > 0 && (
            <FilterChip
              label="All sectors"
              active={sector === "__all__"}
              onClick={() => setSector("__all__")}
            />
          )}
          {sectors.map((s) => (
            <FilterChip
              key={s}
              label={s}
              active={sector === s}
              onClick={() => setSector(s)}
            />
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 13, color: T.muted }}>
          {filtered.length} of {deals.all.length} deals
        </div>
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
