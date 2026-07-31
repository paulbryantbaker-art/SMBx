/**
 * Atlas DEALS — the merged portfolio screen (design map 00 §"SCREEN 4 — DEALS"
 * folded together with the former Pipeline kanban).
 *
 * ONE tab, board-first. A Board/Table toggle picks the view; both read the SAME
 * filtered slice of `useMobileDeals(user).all` (the shared search box +
 * All/Buy/Sell/Watchlist chips apply to both):
 *   - BOARD (default): the active funnel — KPI tiles (usePortfolioSummary) + a
 *     kanban grouped by the five shared PIPELINE_STAGES (Source→Value→Diligence→
 *     Structure→Close).
 *   - TABLE (the dense workhorse — scales to hundreds of deals): the real
 *     portfolio table — search, filter chips, columns, pager.
 *
 * Honesty notes:
 *  - SECTOR: MobileStageRow has no `industry`. The `sub` line is built from
 *    `[industry, location]` upstream, so we read the segment before the first
 *    "·" as the sector and fall back to "—".
 *  - FIT: rendered ONLY when `fit` is a real composite (the hook already nulls
 *    synthetic fits in `all`) — board cards only; the table dropped the column.
 *  - RUN FOR: null is the honest default and prints "unassigned", because an
 *    unassigned deal cannot be checked against one-buyer-per-target.
 *  - KPIs: IN FLOW / FLOW VALUE are real summary fields; IOI/LOI and STALLED are
 *    not derivable from the available fields → honest "—".
 *  - MONEY: a literal 0-cents "Ask" must not print "$0 Ask"; the board card
 *    falls through ask → EBITDA → SDE via a `> 0` guard.
 *
 * ── ARCHIVE (2026-07-31, migration 112) ──────────────────────────────────
 * The TABLE view is the bulk-management surface: tick rows (or the header box
 * to take the whole filtered set) and archive them in one PATCH /api/deals.
 * ARCHIVE, NOT DELETE — 11 foreign keys reference deals(id) with no ON DELETE
 * clause, so Postgres RESTRICTs a real delete; archiving hides the deal from
 * every board and leaves its conversations/deliverables/gates intact.
 * "Archived" is a SCOPE, not a filter chip: the archive and the board are two
 * views of different rows, never one mixed list. Archived scope forces the
 * table (a kanban of retired deals says nothing) and swaps Archive → Restore.
 *
 * ── DEAL MANAGEMENT (2026-07-31, migration 114) ──────────────────────────
 * Paul: "I need it to be a CRM tool and then a deal management tool." The table
 * gained RUN FOR (which acquirer client the deal is run for) and NEXT (what is
 * owed, and when), and LOST two columns that were honest but useless: OWNER
 * printed the signed-in user on every row — a constant is not a column — and
 * ACTIVITY was a hardcoded "—". The per-deal owner moved to the detail pane
 * where it can be set.
 *
 * Assigning a client runs THE LINE's one-buyer-per-target check server-side
 * (`targetConflicts`). It WARNS, never blocks: target identity is a name match,
 * and a false block on a collision would be worse than a flag someone reads.
 * The pane surfaces that warning verbatim.
 */
import { useMemo, useState } from "react";
import type { AtlasScreenProps } from "../atlasNav";
import { useAtlasNav, useAtlasChat } from "../atlasNav";
import { authHeaders } from "../../../../hooks/useAuth";
import { useMobileDeals, type MobileStageRow } from "../../../../hooks/useMobileDeals";
import { useAdvisorMandates } from "../../../../hooks/useAdvisorMandates";
import { usePortfolioSummary } from "../../../../hooks/usePortfolioSummary";
import {
  PIPELINE_STAGES,
  type PipelineStageId,
} from "../../../../lib/pipelineStages";
import type { Verdict } from "../../mobile/types";
import type { User } from "../../../../hooks/useAuth";
import {
  MarkBadge,
  Pill,
  KpiCard,
  EmptyState,
  LoadingState,
  fmtCents,
} from "../primitives";
import { SearchIcon, BackIcon, ChevronRightIcon } from "../icons";
import { useCrmPicker } from "../../../../hooks/useCrmAccounts";
import {
  useDealTasks, useAddressBook, TASK_STATUS_LABEL, ROLE_LABEL,
  type AddressBookContact, type DealTask,
} from "../../../../hooks/useDealTasks";
import { dueLabel, daysUntil } from "../../../../lib/crm";
import { useDraft } from "../../../../hooks/useDraft";
import { T } from "../atlasTokens";

const PAGE_SIZE = 25;

// Buy-side only (2026-07-31). "All" and "Buy-side" became the same list and
// "Sell-side" can never match, so both are gone — the practice does not take
// sell-side mandates (THE LINE §perimeter). Due now is a real filter instead.
type FilterId = "all" | "watch" | "due";
type ViewId = "board" | "table";
/** Which SET of deals we're looking at. Not a filter — a different row set. */
type ScopeId = "active" | "archived";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "watch", label: "Watchlist" },
  // Client-side, deliberately: every row is already in memory, so this is
  // instant. The server's `?due=1` exists for other callers.
  { id: "due", label: "Due now" },
];

/* ─── per-row derivations (honest) ─────────────────────────── */

/** One source of truth for a stage's name — PIPELINE_STAGES. */
function stageTitle(id: PipelineStageId): string {
  return PIPELINE_STAGES.find(s => s.id === id)?.title ?? "—";
}

/** Sector from the `sub` line. The hook builds `all`'s sub as
 *  `[industry, location].join(" · ")`, so the leading segment is the sector
 *  ONLY when a "·" separator is present (industry AND location both exist).
 *  Without the separator the sub is just a location, or a buildSub fallback
 *  like "$680K SDE" / "Active deal" — none of which are sectors, so we show
 *  "—" rather than mislabel a non-sector value as one. */
function sectorOf(row: MobileStageRow): string {
  const sub = (row.sub ?? "").trim();
  if (!sub.includes("·")) return "—";
  const first = sub.split("·")[0]?.trim();
  return first || "—";
}

/** Stage label + pill palette, keyed off the gate-derived stageId (map 00).
 *  The real taxonomy (source/value/diligence/structure/close) is an honest
 *  remap of the demo's gate names, but we keep the design's full tint ladder
 *  so each stage reads distinctly: Sourcing→Screening grey, Valuation→amber
 *  (the demo's IOI tier), Diligence→blue, Structuring→terra, Close→green. */
function stageMeta(row: MobileStageRow): { label: string; bg: string; fg: string } {
  switch (row.stageId) {
    // Labels come from PIPELINE_STAGES so the pill and the kanban column header
    // can never disagree; only the tint ladder lives here.
    case "source":
      return { label: stageTitle("source"), bg: T.track, fg: T.muted };
    case "value":
      return { label: stageTitle("value"), bg: T.amberBg2, fg: T.amber };
    case "diligence":
      return { label: stageTitle("diligence"), bg: T.blueBg, fg: T.blue };
    case "structure":
      return { label: stageTitle("structure"), bg: T.terraBg, fg: T.terra };
    case "close":
      return { label: stageTitle("close"), bg: T.greenBg, fg: T.green };
    default:
      return { label: "—", bg: T.track, fg: T.muted };
  }
}

/** Enterprise value = the asking price ONLY (integer cents). We do NOT fall
 *  back to EBITDA/SDE here: an earnings figure under an "EV" header would
 *  mislabel it as enterprise value. No asking price → "—" via fmtCents. */
function evCents(row: MobileStageRow): number | null {
  return row.askingPrice ?? null;
}

/** Mark-tile palette — stable per row so the table reads as a set, not noise. */
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

/** Owner identity from the signed-in user (these are the user's own deals). */
function ownerOf(user: User | null): { initials: string; name: string } | null {
  if (!user) return null;
  const name = (user.display_name ?? "").trim() || (user.email ?? "").trim();
  if (!name) return null;
  const parts = name.replace(/@.*/, "").split(/[\s._-]+/).filter(Boolean);
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[1][0])
      : name.slice(0, 2);
  return { initials: initials.toUpperCase(), name };
}

/* ─── board money helpers (ported from Pipeline) ───────────── */

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

/** Verdict pill palette (per design map). */
function verdictPill(v: Verdict): { label: string; bg: string; fg: string } {
  if (v === "pursue") return { label: "Pursue", bg: T.greenBg, fg: T.green };
  if (v === "pass") return { label: "Pass", bg: T.amberBg, fg: T.amber };
  return { label: "Watch", bg: T.blueBg, fg: T.blue };
}

/* ─── column layout (flex weights from map 00) ─────────────── */

// Deal management (2026-07-31, migration 114) rebalanced these. OWNER and
// ACTIVITY are gone from the table: OWNER printed the signed-in user on every
// single row (a constant is not a column) and ACTIVITY was a hardcoded "—"
// because MobileStageRow carried no timestamp. Both were honest and useless.
// CLIENT — which acquirer the deal is run FOR — and NEXT replace them, and the
// per-deal owner moved to the detail pane where it can actually be set.
const COLS = {
  deal: 2.2,
  client: 1.5,
  sector: 1.2,
  stage: 1.2,
  ev: 1,
  next: 1.7,
} as const;

const ROW_PAD = "11px 22px";

/* ─── screen ───────────────────────────────────────────────── */

export default function DealsScreen({ user }: AtlasScreenProps) {
  const nav = useAtlasNav();
  const chat = useAtlasChat();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");
  const [page, setPage] = useState(0);
  const [view, setView] = useState<ViewId>("board");
  const [scope, setScope] = useState<ScopeId>("active");
  // Selected rawIds. Survives paging (the selection is over the filtered set,
  // not the visible page) and is cleared on every scope/filter/search change so
  // an off-screen tick can never be archived by surprise.
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  // The deal being managed in the side pane (client / next action / owner).
  const [managing, setManaging] = useState<MobileStageRow | null>(null);

  const { all, loading, loaded, isAuthed, refresh } = useMobileDeals(user, {
    archived: scope === "archived",
  });
  const { summary } = usePortfolioSummary(user, isAuthed);
  const mandates = useAdvisorMandates(user);
  const { clients } = useCrmPicker(user);
  // Cross-account: the CPA a deal needs an action from works at a different firm
  // than the client, so the assignee picker cannot be scoped to one account.
  const addressBook = useAddressBook(user);

  // A kanban of retired deals communicates nothing, so the archive is always
  // the table.
  const effectiveView: ViewId = scope === "archived" ? "table" : view;

  // Client-side filter: search over name + sub, chips over side/watchlist.
  // Drives BOTH the table and the board (same `all` set, one filter pass).
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((row) => {
      if (q) {
        const hay = `${row.name} ${row.sub ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filter === "watch") return row.verdict === "watch";
      if (filter === "due") return (daysUntil(row.nextActionOn) ?? 1) <= 0;
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

  // Clamp page when the filtered set shrinks.
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  const clearSelection = () => setSelected(new Set());

  const onSearch = (v: string) => {
    setQuery(v);
    setPage(0);
    clearSelection();
  };
  const onFilter = (id: FilterId) => {
    setFilter(id);
    setPage(0);
    clearSelection();
  };
  const onScope = (id: ScopeId) => {
    setScope(id);
    setPage(0);
    clearSelection();
    setBulkError(null);
  };

  const openDeal = (row: MobileStageRow) => nav.openDeal(row.rawId, row.name);

  const toggleRow = (rawId: number) =>
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(rawId)) next.delete(rawId);
      else next.add(rawId);
      return next;
    });

  // The header box takes the WHOLE filtered set, not just the visible page —
  // that's the point of it when clearing out a board full of test rows.
  const allFilteredSelected = filtered.length > 0 && filtered.every(r => selected.has(r.rawId));
  const toggleAll = () =>
    setSelected(allFilteredSelected ? new Set() : new Set(filtered.map(r => r.rawId)));

  /** Archive (or restore) every selected deal in one request. */
  const applyArchive = async (archived: boolean) => {
    const ids = [...selected];
    if (ids.length === 0 || busy) return;
    setBusy(true);
    setBulkError(null);
    try {
      const r = await fetch("/api/deals", {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ ids, archived }),
      });
      if (!r.ok) {
        let detail = "";
        try {
          detail = (await r.json())?.error || "";
        } catch {
          /* no body */
        }
        throw new Error(detail || `HTTP ${r.status}`);
      }
      clearSelection();
      refresh();
    } catch (e: any) {
      // Say WHY rather than silently leaving the rows on screen.
      setBulkError(e?.message || "Could not update those deals");
    } finally {
      setBusy(false);
    }
  };

  /* ── KPIs (real fields or honest "—") ──────────────────── */
  const inFlow = summary ? String(summary.totalActive) : "—";
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
    fontFamily: T.font,
    color: T.ink,
    overflow: "hidden",
  };

  // One toolbar instance for all three render paths (loading / empty / list),
  // so the view + scope controls never disappear — reaching an empty archive
  // and being unable to get back to the board would be a trap.
  const toolbar = (
    <Toolbar
      query={query}
      onSearch={onSearch}
      filter={filter}
      onFilter={onFilter}
      count={loaded ? all.length : 0}
      view={effectiveView}
      onView={setView}
      viewLocked={scope === "archived"}
      scope={scope}
      onScope={onScope}
      onAdd={() => chat?.send("I want to add a new deal.")}
    />
  );

  /* ── loading / empty ── */
  if (loading && !loaded) {
    return (
      <div style={root}>
        {toolbar}
        <div style={{ flex: 1, display: "flex" }}>
          <LoadingState label={scope === "archived" ? "Loading the archive…" : "Loading your deals…"} />
        </div>
      </div>
    );
  }

  if (loaded && all.length === 0) {
    return (
      <div style={root}>
        {toolbar}
        <div style={{ flex: 1, display: "flex" }}>
          {scope === "archived" ? (
            <EmptyState
              title="Nothing archived"
              hint="Archived deals are hidden from the board but never deleted. Select rows in the table view and archive them to retire them from your working set."
              cta="Back to the board"
              onCta={() => onScope("active")}
            />
          ) : (
            <EmptyState
              title="No deals yet"
              hint="Talk to Yulia to add a target, evaluate a business, or import a deal. She is the front door to everything in Atlas."
              cta="Add your first deal"
              onCta={() => chat?.send("I want to add a new deal.")}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={root}>
      {toolbar}

      {selected.size > 0 && (
        <BulkBar
          count={selected.size}
          total={filtered.length}
          scope={scope}
          busy={busy}
          error={bulkError}
          onApply={() => applyArchive(scope !== "archived")}
          onClear={clearSelection}
        />
      )}

      {effectiveView === "board" ? (
        <BoardView
          byStage={byStage}
          matchCount={filtered.length}
          inFlow={inFlow}
          inFlowDelta={inFlowDelta}
          flowValue={flowValue}
          flowDelta={flowDelta}
          liveOffers={mandates.totals?.liveOffers ?? null}
          mandateCount={mandates.mandates.length}
          onOpen={openDeal}
          onClear={() => {
            setQuery("");
            setFilter("all");
          }}
        />
      ) : (
        <TableView
          rows={pageRows}
          total={filtered.length}
          start={start}
          end={Math.min(start + PAGE_SIZE, filtered.length)}
          canPrev={safePage > 0}
          canNext={safePage < pageCount - 1}
          onPrev={() => setPage(p => Math.max(0, p - 1))}
          onNext={() => setPage(p => Math.min(pageCount - 1, p + 1))}
          selected={selected}
          allSelected={allFilteredSelected}
          onToggleRow={toggleRow}
          onToggleAll={toggleAll}
          onOpen={openDeal}
          onManage={setManaging}
          onClear={() => {
            setQuery("");
            setFilter("all");
          }}
        />
      )}

      {managing && (
        <DealPane
          key={managing.rawId}
          row={managing}
          user={user}
          clients={clients}
          addressBook={addressBook}
          onClose={() => setManaging(null)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}

/* ─── toolbar ──────────────────────────────────────────────── */

function Toolbar({
  query,
  onSearch,
  filter,
  onFilter,
  count,
  view,
  onView,
  viewLocked,
  scope,
  onScope,
  onAdd,
}: {
  query: string;
  onSearch: (v: string) => void;
  filter: FilterId;
  onFilter: (id: FilterId) => void;
  count: number;
  view: ViewId;
  onView: (v: ViewId) => void;
  /** True in archived scope, where the table is the only sensible view. */
  viewLocked: boolean;
  scope: ScopeId;
  onScope: (s: ScopeId) => void;
  onAdd: () => void;
}) {
  return (
    <div
      style={{
        padding: "18px 22px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
        flex: "none",
      }}
    >
      {/* search field */}
      <label
        style={{
          width: 300,
          height: 38,
          background: T.track,
          borderRadius: T.rPill,
          padding: "0 14px",
          display: "flex",
          alignItems: "center",
          gap: 9,
        }}
      >
        <SearchIcon size={16} c={T.muted2} />
        <input
          value={query}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={
            count > 0
              ? `Search ${count} ${scope === "archived" ? "archived deals" : "deals"}`
              : scope === "archived"
                ? "Search the archive"
                : "Search deals"
          }
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            background: "transparent",
            outline: "none",
            fontSize: 13,
            color: T.ink,
            fontFamily: T.font,
          }}
        />
      </label>

      {/* filter chips */}
      <div style={{ display: "flex", gap: 7 }}>
        {FILTERS.map((f) => {
          const active = f.id === filter;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilter(f.id)}
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                padding: "7px 13px",
                borderRadius: T.rPill,
                cursor: "pointer",
                fontFamily: T.font,
                border: `1px solid ${active ? T.blue : T.border}`,
                background: active ? T.blue : T.white,
                color: active ? "#fff" : T.muted,
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      {/* No "Sort: Last activity ▾" control: MobileStageRow carries no
          updated_at, so the rows can't honestly be sorted by last activity and
          there's no sort menu behind it. An inert chevron asserting a sort that
          doesn't exist is misleading, so we omit it rather than fake it. */}

      {/* Board / Table — the table is the bulk-management surface */}
      <div
        style={{
          display: "flex",
          border: `1px solid ${T.border}`,
          borderRadius: T.rPill,
          overflow: "hidden",
          opacity: viewLocked ? 0.55 : 1,
        }}
        title={viewLocked ? "The archive is always the table view" : undefined}
      >
        {(["board", "table"] as ViewId[]).map((v) => {
          const active = v === view;
          return (
            <button
              key={v}
              type="button"
              disabled={viewLocked}
              onClick={() => onView(v)}
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                padding: "7px 14px",
                border: "none",
                cursor: viewLocked ? "default" : "pointer",
                fontFamily: T.font,
                background: active ? T.track : T.white,
                color: active ? T.ink : T.muted,
              }}
            >
              {v === "board" ? "Board" : "Table"}
            </button>
          );
        })}
      </div>

      {/* Archived scope toggle — a different row set, not a filter */}
      <button
        type="button"
        onClick={() => onScope(scope === "archived" ? "active" : "archived")}
        style={{
          fontSize: 12.5,
          fontWeight: 600,
          padding: "7px 13px",
          borderRadius: T.rPill,
          cursor: "pointer",
          fontFamily: T.font,
          border: `1px solid ${scope === "archived" ? T.ink3 : T.border}`,
          background: scope === "archived" ? T.ink3 : T.white,
          color: scope === "archived" ? "#fff" : T.muted,
        }}
      >
        {scope === "archived" ? "← Back to board" : "Archived"}
      </button>

      {/* + Add deal → Yulia */}
      <button
        type="button"
        onClick={onAdd}
        style={{
          background: T.blue,
          color: "#fff",
          border: "none",
          borderRadius: T.rPill,
          padding: "8px 15px",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: T.font,
        }}
      >
        + Add deal
      </button>
    </div>
  );
}

/* ─── bulk action bar ──────────────────────────────────────── */

/** Appears only while rows are ticked. One verb: Archive in the working set,
 *  Restore in the archive. Archiving is reversible, so it needs no confirm
 *  dialog — the Archived scope is one click away and Restore undoes it. */
function BulkBar({
  count,
  total,
  scope,
  busy,
  error,
  onApply,
  onClear,
}: {
  count: number;
  total: number;
  scope: ScopeId;
  busy: boolean;
  error: string | null;
  onApply: () => void;
  onClear: () => void;
}) {
  const verb = scope === "archived" ? "Restore" : "Archive";
  return (
    <div
      style={{
        margin: "0 22px 10px",
        padding: "10px 14px",
        background: T.blueBg,
        border: `1px solid ${T.border}`,
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
        flex: "none",
        fontSize: 13,
      }}
    >
      <span style={{ fontWeight: 600, color: T.ink }}>
        {count} of {total} selected
      </span>

      {error && (
        <span style={{ color: T.amber, fontSize: 12.5 }}>{error}</span>
      )}

      <div style={{ flex: 1 }} />

      <button
        type="button"
        onClick={onClear}
        disabled={busy}
        style={{
          fontSize: 12.5,
          fontWeight: 600,
          padding: "7px 13px",
          borderRadius: T.rPill,
          border: `1px solid ${T.border}`,
          background: T.white,
          color: T.muted,
          cursor: busy ? "default" : "pointer",
          fontFamily: T.font,
        }}
      >
        Clear
      </button>
      <button
        type="button"
        onClick={onApply}
        disabled={busy}
        style={{
          fontSize: 12.5,
          fontWeight: 600,
          padding: "7px 15px",
          borderRadius: T.rPill,
          border: "none",
          background: busy ? T.muted2 : T.blue,
          color: "#fff",
          cursor: busy ? "default" : "pointer",
          fontFamily: T.font,
        }}
      >
        {busy ? `${verb.slice(0, -1)}ing…` : `${verb} ${count}`}
      </button>
    </div>
  );
}

/* ─── table view ───────────────────────────────────────────── */

function TableView({
  rows,
  total,
  start,
  end,
  canPrev,
  canNext,
  onPrev,
  onNext,
  selected,
  allSelected,
  onToggleRow,
  onToggleAll,
  onOpen,
  onManage,
  onClear,
}: {
  rows: MobileStageRow[];
  total: number;
  start: number;
  end: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  selected: Set<number>;
  allSelected: boolean;
  onToggleRow: (rawId: number) => void;
  onToggleAll: () => void;
  onOpen: (row: MobileStageRow) => void;
  onManage: (row: MobileStageRow) => void;
  onClear: () => void;
}) {
  if (total === 0) {
    return (
      <div style={{ flex: 1, display: "flex" }}>
        <EmptyState
          title="No deals match"
          hint="Clear the search and filters to see your full pipeline."
          cta="Clear filters"
          onCta={onClear}
        />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      {/* header — the box takes the whole filtered set, hence the count label */}
      <div
        style={{
          padding: ROW_PAD,
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: `1px solid ${T.border}`,
          background: T.surface,
          fontSize: 11.5,
          fontWeight: 700,
          letterSpacing: "0.05em",
          color: T.muted2,
          flex: "none",
        }}
      >
        <SelectBox
          checked={allSelected}
          onChange={onToggleAll}
          label={allSelected ? `Deselect all ${total}` : `Select all ${total}`}
        />
        <div style={{ flex: COLS.deal, minWidth: 0 }}>DEAL</div>
        <div style={{ flex: COLS.client, minWidth: 0 }}>RUN FOR</div>
        <div style={{ flex: COLS.sector, minWidth: 0 }}>SECTOR</div>
        <div style={{ flex: COLS.stage, minWidth: 0 }}>STAGE</div>
        <div style={{ flex: COLS.ev, minWidth: 0 }}>EV</div>
        <div style={{ flex: COLS.next, minWidth: 0 }}>NEXT</div>
        <span style={{ width: 66, flex: "none" }} />
      </div>

      {/* rows */}
      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        {rows.map((row) => (
          <DealRow
            key={row.id}
            row={row}
            selected={selected.has(row.rawId)}
            onToggleSelect={() => onToggleRow(row.rawId)}
            onOpen={() => onOpen(row)}
            onManage={() => onManage(row)}
          />
        ))}
      </div>

      <Pager
        total={total}
        start={start}
        end={end}
        canPrev={canPrev}
        canNext={canNext}
        onPrev={onPrev}
        onNext={onNext}
      />
    </div>
  );
}

/** Native checkbox in the Atlas accent — no custom control, so keyboard and
 *  screen-reader behaviour comes for free. */
function SelectBox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <span
      style={{ width: 22, flex: "none", display: "flex", alignItems: "center" }}
      // The row behind this cell opens the deal; a tick must never do that too.
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={label}
        title={label}
        style={{ width: 15, height: 15, accentColor: T.blue, cursor: "pointer", margin: 0 }}
      />
    </span>
  );
}

/* ─── board view (KPI tiles + kanban, ported from Pipeline) ── */

function BoardView({
  byStage,
  matchCount,
  inFlow,
  inFlowDelta,
  flowValue,
  flowDelta,
  liveOffers,
  mandateCount,
  onOpen,
  onClear,
}: {
  byStage: Record<PipelineStageId, MobileStageRow[]>;
  matchCount: number;
  inFlow: string;
  inFlowDelta?: string;
  flowValue: string;
  flowDelta?: string;
  liveOffers: number | null;
  mandateCount: number;
  onOpen: (row: MobileStageRow) => void;
  onClear: () => void;
}) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        overflow: "auto",
        padding: "4px 22px 22px",
      }}
    >
      {/* KPI row */}
      <div style={{ display: "flex", gap: 14 }}>
        <KpiCard label="IN FLOW" value={inFlow} delta={inFlowDelta} />
        <KpiCard
          label="FLOW VALUE"
          value={flowValue}
          delta={flowDelta}
          deltaColor={T.muted2}
        />
        {/* LIVE OFFERS — inbound IOI/LOI offers in play across the advisor's
            sell-side mandates (deal_offers received/under_review/countered).
            Honest "—" until there are any. STALLED has no backing metric → "—". */}
        {liveOffers != null && liveOffers > 0 ? (
          <KpiCard
            label="LIVE OFFERS"
            value={String(liveOffers)}
            delta={`across ${mandateCount} mandate${mandateCount === 1 ? "" : "s"}`}
            deltaColor={T.muted2}
          />
        ) : (
          <KpiCard label="LIVE OFFERS" value="—" delta="not yet tracked" deltaColor={T.muted2} />
        )}
        <KpiCard label="STALLED >30d" value="—" delta="not yet tracked" deltaColor={T.muted2} />
      </div>

      {/* Kanban — the active funnel across the five shared stages */}
      {matchCount === 0 ? (
        <EmptyState
          title="No deals match"
          hint="Clear the search and filters to see your full pipeline."
          cta="Clear filters"
          onCta={onClear}
        />
      ) : (
        <div style={{ flex: 1, display: "flex", gap: 13, minHeight: 0 }}>
          {PIPELINE_STAGES.map((stage) => (
            <KanbanColumn
              key={stage.id}
              title={stage.title}
              rows={byStage[stage.id]}
              onOpen={onOpen}
            />
          ))}
        </div>
      )}
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

/* ─── deal card (board) ──────────────────────────────────── */

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
        boxShadow: T.shSoft,
        transition: "box-shadow .15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = T.shHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = T.shSoft;
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

/* ─── deal management pane ─────────────────────────────────── */

/**
 * Assign the client, set what's next, name the owner. Deliberately NOT the deal
 * cockpit — that is where the analysis lives; this is the three fields that make
 * the board a pipeline, reachable without leaving it.
 *
 * position:absolute inside the screen's relative root — never fixed with a
 * background colour (Safari toolbar rule).
 */
function DealPane({
  row, user, clients, addressBook, onClose, onSaved,
}: {
  row: MobileStageRow;
  user: User | null;
  clients: { id: number; firm: string; stage: string }[];
  addressBook: AddressBookContact[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [clientId, setClientId] = useState<string>(row.crmAccountId ? String(row.crmAccountId) : "");
  // Drafts keyed by deal id — closing the pane or navigating away no longer
  // throws away what was typed.
  const [action, setAction, clearAction] = useDraft(`deal:${row.rawId}:action`, row.nextAction ?? "");
  const [on, setOn, clearOn] = useDraft(`deal:${row.rawId}:when`, row.nextActionOn ?? "");
  const [ownerEmail, setOwnerEmail, clearOwner] = useDraft(`deal:${row.rawId}:owner`, row.ownerEmail ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // THE LINE's one-buyer-per-target warning, surfaced verbatim from the server.
  const [lineWarning, setLineWarning] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const fallbackOwner = ownerOf(user);

  const save = async () => {
    setSaving(true); setError(null); setLineWarning(null); setSaved(false);
    try {
      const r = await fetch(`/api/deals/${row.rawId}`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          crm_account_id: clientId === "" ? null : Number(clientId),
          next_action: action,
          next_action_on: on || null,
          owner_email: ownerEmail,
        }),
      });
      if (!r.ok) {
        let detail = "";
        try { detail = (await r.json())?.error || ""; } catch { /* no body */ }
        throw new Error(detail || `HTTP ${r.status}`);
      }
      const body = await r.json();
      if (body?.lineWarning) setLineWarning(body.lineWarning);
      // Committed — the drafts have served their purpose.
      clearAction(); clearOn(); clearOwner();
      setSaved(true);
      onSaved();
    } catch (e: any) {
      setError(e?.message ?? "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: "absolute", top: 0, right: 0, bottom: 0, width: 460, maxWidth: "94%",
      background: T.white, borderLeft: `1px solid ${T.border}`,
      boxShadow: "-14px 0 40px rgba(16,24,40,0.10)",
      display: "flex", flexDirection: "column", zIndex: 5,
    }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 12, flex: "none" }}>
        <span style={{ flex: 1, minWidth: 0, fontWeight: 700, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {row.name}
        </span>
        <button type="button" onClick={onClose} style={paneGhost}>Close</button>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {error && <p style={{ margin: 0, color: T.amber, fontSize: 13 }}>{error}</p>}
        {lineWarning && (
          <p style={{
            margin: 0, padding: "10px 12px", background: T.amberBg, borderRadius: 8,
            color: T.amber, fontSize: 12.5, lineHeight: 1.55,
          }}>
            {lineWarning}
          </p>
        )}
        {saved && !lineWarning && !error && (
          <p style={{ margin: 0, color: T.green, fontSize: 12.5 }}>Saved.</p>
        )}

        <label style={{ display: "block" }}>
          <span style={paneLabel}>Run for</span>
          <select value={clientId} onChange={e => setClientId(e.target.value)} style={paneInput}>
            <option value="">Unassigned</option>
            {clients.map(c => <option key={c.id} value={String(c.id)}>{c.firm}</option>)}
          </select>
          <span style={{ display: "block", fontSize: 12, color: T.muted2, marginTop: 5, lineHeight: 1.5 }}>
            {clients.length === 0
              ? "No clients yet — import the buy-side register on the Clients tab."
              : "Which acquirer client this deal is run for. One buyer per target is checked on save."}
          </span>
        </label>

        <label style={{ display: "block" }}>
          <span style={paneLabel}>Next action</span>
          <input
            value={action}
            onChange={e => setAction(e.target.value)}
            placeholder="e.g. send the LOI draft to counsel"
            style={paneInput}
          />
        </label>

        <label style={{ display: "block" }}>
          <span style={paneLabel}>When</span>
          <input type="date" value={on} onChange={e => setOn(e.target.value)} style={paneInput} />
        </label>

        <label style={{ display: "block" }}>
          <span style={paneLabel}>Owner</span>
          <input
            value={ownerEmail}
            onChange={e => setOwnerEmail(e.target.value)}
            placeholder={fallbackOwner?.name ?? "email"}
            style={paneInput}
          />
          <span style={{ display: "block", fontSize: 12, color: T.muted2, marginTop: 5 }}>
            Blank means you. Set it when a partner is carrying the deal.
          </span>
        </label>

        <button
          type="button"
          disabled={saving}
          onClick={save}
          style={{
            ...paneGhost, borderColor: T.blue, color: "#fff",
            background: saving ? T.muted2 : T.blue, fontSize: 13,
          }}
        >
          {saving ? "Saving…" : "Save"}
        </button>

        <TaskBlock dealId={row.rawId} addressBook={addressBook} />

        <div style={{ borderTop: `1px solid ${T.rowDiv}`, paddingTop: 14 }}>
          <p style={{ margin: 0, fontSize: 12, color: T.muted2, lineHeight: 1.5 }}>
            Analysis, documents and the data room live in the deal cockpit — click
            the row itself to open it.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Actions this deal needs from someone — often someone outside the practice.
 *
 * Two buttons, deliberately not one. "Add" records that the action is needed;
 * "Ask" emails the assignee. Creating a task and telling a CPA about it are
 * different decisions, and a note typed while thinking must never mail anybody.
 *
 * The send reports itself honestly: `{sent:false, reason}` arrives on a 200 when
 * there is no email address or no mail key, and the reason is repeated verbatim
 * rather than shown as a success.
 */
function TaskBlock({ dealId, addressBook }: { dealId: number; addressBook: AddressBookContact[] }) {
  const { tasks, error, create, patch, notify } = useDealTasks(dealId);
  const [who, setWho] = useState("");
  const [due, setDue] = useState("");
  // A half-typed ask survives leaving the pane.
  const [title, setTitle, clearTitle] = useDraft(`deal:${dealId}:tasktitle`);
  const [detail, setDetail, clearDetail] = useDraft(`deal:${dealId}:taskdetail`);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const mailable = addressBook.filter(c => c.email && !c.unsubscribed_at);

  const add = async (andAsk: boolean) => {
    if (!title.trim() || busy) return;
    setBusy(true); setNote(null);
    try {
      const r = await create({
        title: title.trim(),
        detail: detail.trim() || null,
        assignee_contact_id: who || null,
        due_on: due || null,
        notify: andAsk,
      });
      clearTitle(); clearDetail(); setDue("");
      if (andAsk) {
        setNote(r?.sent ? "Emailed." : (r?.reason ?? "Nothing was sent."));
      }
    } catch (e: any) {
      setNote(e?.message ?? "Could not save");
    } finally { setBusy(false); }
  };

  const ask = async (t: DealTask) => {
    setBusy(true); setNote(null);
    try {
      const r = await notify(t.id);
      setNote(r.sent ? `Emailed ${t.assignee_email}.` : (r.reason ?? "Nothing was sent."));
    } catch (e: any) {
      setNote(e?.message ?? "Could not send");
    } finally { setBusy(false); }
  };

  return (
    <div style={{ borderTop: `1px solid ${T.rowDiv}`, paddingTop: 14 }}>
      <span style={paneLabel}>Actions needed</span>

      {error && <p style={{ margin: "0 0 10px", fontSize: 12.5, color: T.amber }}>{error}</p>}
      {note && <p style={{ margin: "0 0 10px", fontSize: 12.5, color: T.ink3 }}>{note}</p>}

      {tasks.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          {tasks.map(t => {
            const overdue = (daysUntil(t.due_on) ?? 1) <= 0 && t.status !== "done";
            return (
              <div key={t.id} style={{ padding: "8px 0", borderBottom: `1px solid ${T.rowDiv}` }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{t.title}</div>
                <div style={{ fontSize: 12, color: T.muted2, marginTop: 2 }}>
                  {[
                    TASK_STATUS_LABEL[t.status as never] ?? t.status,
                    t.assignee_name || t.contact_name || t.assignee_email || "unassigned",
                    t.assignee_role ? ROLE_LABEL[t.assignee_role] ?? t.assignee_role : null,
                    t.due_on ? dueLabel(t.due_on) : null,
                    t.notify_count > 0 ? `asked ${t.notify_count}×` : null,
                  ].filter(Boolean).join(" · ")}
                </div>
                {overdue && (
                  <div style={{ fontSize: 12, color: T.amber, marginTop: 2 }}>
                    {dueLabel(t.due_on)}
                  </div>
                )}
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  {t.status !== "done" && (
                    <>
                      <button
                        type="button" disabled={busy || !t.assignee_email}
                        title={t.assignee_email ? `Email ${t.assignee_email}` : "No email on this assignee"}
                        onClick={() => ask(t)}
                        style={{ ...paneGhost, padding: "4px 10px", fontSize: 12, opacity: t.assignee_email ? 1 : 0.5 }}
                      >
                        {t.notify_count > 0 ? "Remind" : "Ask"}
                      </button>
                      <button
                        type="button" disabled={busy}
                        onClick={() => patch(t.id, { status: "done" })}
                        style={{ ...paneGhost, padding: "4px 10px", fontSize: 12 }}
                      >
                        Done
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="What's needed? e.g. QoE scope for the Sept close"
        style={{ ...paneInput, marginBottom: 8 }}
      />
      <textarea
        value={detail}
        onChange={e => setDetail(e.target.value)}
        rows={2}
        placeholder="Any detail they need (optional)"
        style={{ ...paneInput, marginBottom: 8, resize: "vertical", lineHeight: 1.5 }}
      />
      <select value={who} onChange={e => setWho(e.target.value)} style={{ ...paneInput, marginBottom: 8 }}>
        <option value="">Unassigned</option>
        {mailable.map(c => (
          <option key={c.id} value={String(c.id)}>
            {c.name}{c.role ? ` — ${ROLE_LABEL[c.role] ?? c.role}` : ""} · {c.firm}
          </option>
        ))}
      </select>
      <input type="date" value={due} onChange={e => setDue(e.target.value)} style={{ ...paneInput, marginBottom: 8 }} />

      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" disabled={busy || !title.trim()} onClick={() => add(false)}
                style={{ ...paneGhost, opacity: title.trim() ? 1 : 0.5 }}>
          Add
        </button>
        <button
          type="button"
          disabled={busy || !title.trim() || !who}
          title={who ? "Add it and email them now" : "Pick an assignee to email"}
          onClick={() => add(true)}
          style={{
            ...paneGhost, borderColor: T.blue, color: "#fff",
            background: T.blue, opacity: title.trim() && who ? 1 : 0.5,
          }}
        >
          Add &amp; ask
        </button>
      </div>
      {mailable.length === 0 && (
        <p style={{ margin: "8px 0 0", fontSize: 12, color: T.muted2, lineHeight: 1.5 }}>
          No mailable contacts yet. Add people — CPAs, counsel, lenders — under
          Clients, and they become assignable here.
        </p>
      )}
    </div>
  );
}

const paneGhost: React.CSSProperties = {
  fontSize: 12.5, fontWeight: 600, padding: "8px 14px", borderRadius: T.rPill,
  border: `1px solid ${T.border}`, background: T.white, color: T.muted,
  cursor: "pointer", fontFamily: T.font,
};
const paneLabel: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
  color: T.muted2, marginBottom: 5, textTransform: "uppercase",
};
const paneInput: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: "9px 11px", fontSize: 13,
  fontFamily: T.font, color: T.ink, background: T.white,
  border: `1px solid ${T.border}`, borderRadius: 8, outline: "none",
};

/* ─── row (table) ──────────────────────────────────────────── */

function DealRow({
  row,
  selected,
  onToggleSelect,
  onOpen,
  onManage,
}: {
  row: MobileStageRow;
  selected: boolean;
  onToggleSelect: () => void;
  /** Row click — the full deal cockpit. */
  onOpen: () => void;
  /** Manage — the quick pipeline pane, without leaving the board. */
  onManage: () => void;
}) {
  const sector = sectorOf(row);
  const stage = stageMeta(row);
  const ev = evCents(row);
  const tint = markTint(row.rawId);
  const due = dueLabel(row.nextActionOn);
  const overdue = (daysUntil(row.nextActionOn) ?? 1) <= 0;
  // A selected row keeps its wash through mouseleave/blur, so the inline hover
  // handlers below restore the selected tint rather than "transparent".
  const restBg = selected ? T.blueBg3 : "transparent";

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
        padding: ROW_PAD,
        borderBottom: `1px solid ${T.rowDiv}`,
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontSize: 13.5,
        cursor: "pointer",
        outline: "none",
        background: restBg,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = T.hover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = restBg;
      }}
      // Keyboard focus ring — these rows are role=button/tabIndex=0, so give
      // keyboard users a visible focus state (inline, matching the hover wash).
      onFocus={(e) => {
        e.currentTarget.style.background = T.hover;
        e.currentTarget.style.boxShadow = `inset 0 0 0 2px ${T.stageActiveBd}`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.background = restBg;
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <SelectBox
        checked={selected}
        onChange={onToggleSelect}
        label={`Select ${row.name}`}
      />

      {/* DEAL */}
      <div style={{ flex: COLS.deal, minWidth: 0, display: "flex", alignItems: "center", gap: 11 }}>
        <MarkBadge letter={row.name} bg={tint.bg} fg={tint.fg} size={26} radius={7} />
        <span
          style={{
            fontWeight: 600,
            color: T.ink,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {row.name}
        </span>
      </div>

      {/* RUN FOR — the acquirer client. Unassigned is the honest default and
          says so rather than printing a dash: an unassigned deal cannot be
          checked against THE LINE's one-buyer-per-target rule. */}
      <div style={{ flex: COLS.client, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {row.clientFirm ? (
          <span style={{ color: T.ink3 }}>{row.clientFirm}</span>
        ) : (
          <span style={{ color: T.faint }}>unassigned</span>
        )}
      </div>

      {/* SECTOR */}
      <div
        style={{
          flex: COLS.sector,
          minWidth: 0,
          color: T.muted,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {sector}
      </div>

      {/* STAGE */}
      <div style={{ flex: COLS.stage, minWidth: 0 }}>
        <Pill bg={stage.bg} fg={stage.fg}>{stage.label}</Pill>
      </div>

      {/* EV */}
      <div style={{ flex: COLS.ev, minWidth: 0, color: T.ink3, fontWeight: 500 }}>
        {fmtCents(ev)}
      </div>

      {/* NEXT — what is owed, and when. The one thing that makes this a
          pipeline rather than a list. */}
      <div style={{ flex: COLS.next, minWidth: 0, fontSize: 12.5 }}>
        {row.nextAction ? (
          <>
            <span style={{ display: "block", color: T.ink3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {row.nextAction}
            </span>
            {due && <span style={{ color: overdue ? T.amber : T.muted2 }}>{due}</span>}
          </>
        ) : (
          <span style={{ color: T.faint }}>no next action</span>
        )}
      </div>

      <span style={{ width: 66, flex: "none", display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onManage(); }}
          title="Assign a client, set what's next"
          style={{
            fontSize: 12, fontWeight: 600, padding: "4px 9px", borderRadius: T.rPill,
            border: `1px solid ${T.border}`, background: T.white, color: T.muted,
            cursor: "pointer", fontFamily: T.font,
          }}
        >
          Manage
        </button>
      </span>
    </div>
  );
}

/* ─── pager ────────────────────────────────────────────────── */

function Pager({
  total,
  start,
  end,
  canPrev,
  canNext,
  onPrev,
  onNext,
}: {
  total: number;
  start: number;
  end: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  const lo = total === 0 ? 0 : start + 1;
  return (
    <div
      style={{
        padding: "11px 22px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontSize: 12.5,
        color: T.muted2,
        flex: "none",
      }}
    >
      <span>
        {lo}–{end} of {total}
      </span>
      <div style={{ flex: 1 }} />
      <PagerBtn dir="prev" disabled={!canPrev} onClick={onPrev} />
      <PagerBtn dir="next" disabled={!canNext} onClick={onNext} />
    </div>
  );
}

function PagerBtn({
  dir,
  disabled,
  onClick,
}: {
  dir: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={dir === "prev" ? "Previous page" : "Next page"}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: 28,
        height: 28,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        background: T.white,
        cursor: disabled ? "default" : "pointer",
        color: disabled ? T.faint : T.ink3,
        padding: 0,
      }}
    >
      {dir === "prev" ? <BackIcon size={16} c="currentColor" /> : <ChevronRightIcon size={16} c="currentColor" />}
    </button>
  );
}
