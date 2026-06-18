/**
 * Atlas DEALS — the portfolio table (design map 00 §"SCREEN 4 — DEALS").
 *
 * isApp screen, NO 198px sub-list. Renders a real table over
 * useMobileDeals(user).all (MobileStageRow[]). Search + filter chips filter
 * client-side; rows open the deal cockpit; "+ Add deal" routes to Yulia (the
 * front door). Pager paginates the array.
 *
 * Honesty notes:
 *  - SECTOR: MobileStageRow has no `industry`. The `sub` line is built from
 *    `[industry, location]` upstream, so we read the segment before the first
 *    "·" as the sector and fall back to "—".
 *  - OWNER: the deal hook has no owner-name field. These are the signed-in
 *    user's deals, so we render the current user's initials/name (honest) —
 *    never a fabricated teammate.
 *  - ACTIVITY: MobileStageRow carries no updated_at → "—".
 *  - FIT: rendered ONLY when `fit` is a real composite (the hook already nulls
 *    synthetic fits in `all`). Otherwise "—".
 */
import { useMemo, useState } from "react";
import type { AtlasScreenProps } from "../atlasNav";
import { useAtlasNav, useAtlasChat } from "../atlasNav";
import { useMobileDeals, type MobileStageRow } from "../../../../hooks/useMobileDeals";
import type { User } from "../../../../hooks/useAuth";
import {
  MarkBadge,
  Avatar,
  Pill,
  EmptyState,
  LoadingState,
  fmtCents,
} from "../primitives";
import { SearchIcon, BackIcon, ChevronRightIcon } from "../icons";
import { T } from "../atlasTokens";

const PAGE_SIZE = 25;

type FilterId = "all" | "buy" | "sell" | "watch";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "buy", label: "Buy-side" },
  { id: "sell", label: "Sell-side" },
  { id: "watch", label: "Watchlist" },
];

/* ─── per-row derivations (honest) ─────────────────────────── */

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

/** Enterprise value = the asking price ONLY (integer cents). We do NOT fall
 *  back to EBITDA/SDE here: an earnings figure under an "EV" header would
 *  mislabel it as enterprise value. No asking price → "—" via fmtCents. */
function evCents(row: MobileStageRow): number | null {
  return row.askingPrice ?? null;
}

/** Fit pill palette by score (map 00): ≥80 green, 65–79 blue, <65 gray. */
function fitMeta(fit: number): { bg: string; fg: string } {
  if (fit >= 80) return { bg: T.greenBg, fg: T.green };
  if (fit >= 65) return { bg: T.blueBg, fg: T.blue };
  return { bg: T.track, fg: T.muted2 };
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

/** Buy/sell side from the gate letter prefix (B → buy, S → sell, R → raise). */
function sideOf(row: MobileStageRow): "buy" | "sell" | "raise" {
  const c = (row.gate ?? "").trim().charAt(0).toUpperCase();
  if (c === "S") return "sell";
  if (c === "R") return "raise";
  return "buy";
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

/* ─── column layout (flex weights from map 00) ─────────────── */

const COLS = {
  deal: 2.4,
  sector: 1.4,
  stage: 1.3,
  ev: 1,
  fit: 1,
  owner: 1.3,
  activity: 1.2,
} as const;

const ROW_PAD = "11px 22px";

/* ─── screen ───────────────────────────────────────────────── */

export default function DealsScreen({ user }: AtlasScreenProps) {
  const nav = useAtlasNav();
  const chat = useAtlasChat();
  const { all, loading, loaded } = useMobileDeals(user);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");
  const [page, setPage] = useState(0);

  const owner = ownerOf(user);

  // Client-side filter: search over name + sector, chips over side/watchlist.
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

  // Clamp page when the filtered set shrinks.
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  const onSearch = (v: string) => {
    setQuery(v);
    setPage(0);
  };
  const onFilter = (id: FilterId) => {
    setFilter(id);
    setPage(0);
  };

  const root: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    fontFamily: T.font,
    color: T.ink,
    overflow: "hidden",
  };

  /* ── loading / empty ── */
  if (loading && !loaded) {
    return (
      <div style={root}>
        <Toolbar
          query={query}
          onSearch={onSearch}
          filter={filter}
          onFilter={onFilter}
          count={0}
          onAdd={() => chat?.send("I want to add a new deal.")}
        />
        <div style={{ flex: 1, display: "flex" }}>
          <LoadingState label="Loading your deals…" />
        </div>
      </div>
    );
  }

  if (loaded && all.length === 0) {
    return (
      <div style={root}>
        <Toolbar
          query={query}
          onSearch={onSearch}
          filter={filter}
          onFilter={onFilter}
          count={0}
          onAdd={() => chat?.send("I want to add a new deal.")}
        />
        <div style={{ flex: 1, display: "flex" }}>
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
    <div style={root}>
      <Toolbar
        query={query}
        onSearch={onSearch}
        filter={filter}
        onFilter={onFilter}
        count={all.length}
        onAdd={() => chat?.send("I want to add a new deal.")}
      />

      {/* table */}
      <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
        {/* sticky header */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            background: T.white,
            padding: "10px 22px",
            borderTop: `1px solid ${T.hair}`,
            borderBottom: `1px solid ${T.hair}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 11,
            fontWeight: 600,
            color: T.muted2,
            letterSpacing: ".04em",
          }}
        >
          <span style={{ flex: COLS.deal, minWidth: 0 }}>DEAL</span>
          <span style={{ flex: COLS.sector, minWidth: 0 }}>SECTOR</span>
          <span style={{ flex: COLS.stage, minWidth: 0 }}>STAGE</span>
          <span style={{ flex: COLS.ev, minWidth: 0 }}>EV</span>
          <span style={{ flex: COLS.fit, minWidth: 0 }}>FIT</span>
          <span style={{ flex: COLS.owner, minWidth: 0 }}>OWNER</span>
          <span style={{ flex: COLS.activity, minWidth: 0 }}>ACTIVITY</span>
        </div>

        {/* rows */}
        {pageRows.length === 0 ? (
          <div style={{ padding: "40px 22px" }}>
            <EmptyState
              title="No deals match"
              hint="Try a different search or filter."
            />
          </div>
        ) : (
          pageRows.map((row) => (
            <DealRow key={row.id} row={row} owner={owner} onOpen={() => nav.openDeal(row.rawId, row.name)} />
          ))
        )}
      </div>

      {/* pager */}
      <Pager
        total={filtered.length}
        start={start}
        end={Math.min(start + PAGE_SIZE, filtered.length)}
        canPrev={safePage > 0}
        canNext={safePage < pageCount - 1}
        // Step off safePage (the clamped, rendered page), not the raw page, so
        // a stale out-of-range `page` can't desync the first prev/next click.
        onPrev={() => setPage(Math.max(0, safePage - 1))}
        onNext={() => setPage(Math.min(pageCount - 1, safePage + 1))}
      />
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
  onAdd,
}: {
  query: string;
  onSearch: (v: string) => void;
  filter: FilterId;
  onFilter: (id: FilterId) => void;
  count: number;
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
          placeholder={count > 0 ? `Search ${count} deals` : "Search deals"}
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

/* ─── row ──────────────────────────────────────────────────── */

function DealRow({
  row,
  owner,
  onOpen,
}: {
  row: MobileStageRow;
  owner: { initials: string; name: string } | null;
  onOpen: () => void;
}) {
  const sector = sectorOf(row);
  const stage = stageMeta(row);
  const ev = evCents(row);
  const tint = markTint(row.rawId);
  const fitReal = typeof row.fit === "number";

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
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = T.hover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
      // Keyboard focus ring — these rows are role=button/tabIndex=0, so give
      // keyboard users a visible focus state (inline, matching the hover wash).
      onFocus={(e) => {
        e.currentTarget.style.background = T.hover;
        e.currentTarget.style.boxShadow = `inset 0 0 0 2px ${T.stageActiveBd}`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
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

      {/* FIT — only when real */}
      <div style={{ flex: COLS.fit, minWidth: 0 }}>
        {fitReal ? (
          <Pill
            bg={fitMeta(row.fit as number).bg}
            fg={fitMeta(row.fit as number).fg}
            style={{ padding: "3px 9px" }}
          >
            {row.fit}
          </Pill>
        ) : (
          <span style={{ color: T.faint }}>—</span>
        )}
      </div>

      {/* OWNER — the signed-in user (these are their deals) */}
      <div style={{ flex: COLS.owner, minWidth: 0, display: "flex", alignItems: "center", gap: 8 }}>
        {owner ? (
          <>
            {/* Owner is the signed-in user on every row, so the avatar uses a
                single stable blue tint — the Avatar primitive renders initials
                in T.blue, so a rotating non-blue tile would print blue text on
                amber/green/terra (off-palette, low contrast). */}
            <Avatar initials={owner.initials} size={22} bg={T.blueBg} />
            <span
              style={{
                color: T.muted,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {owner.name}
            </span>
          </>
        ) : (
          <span style={{ color: T.faint }}>—</span>
        )}
      </div>

      {/* ACTIVITY — no updated_at on stage rows → honest dash */}
      <div style={{ flex: COLS.activity, minWidth: 0, color: T.faint, fontSize: 12.5 }}>—</div>
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
        borderTop: `1px solid ${T.hair}`,
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
