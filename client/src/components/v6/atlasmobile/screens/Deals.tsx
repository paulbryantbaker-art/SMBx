/**
 * Atlas MOBILE — DEALS portfolio (frame 04 · "Deals (portfolio)").
 *
 * Re-lays the desktop Deals sibling (desktop/screens/Deals.tsx) for mobile:
 * the SAME data layer (`useMobileDeals(user).all`), the SAME honest per-row
 * derivations (sector / stage / EV / fit / side), but the mobile design map's
 * vertical list instead of the desktop table+board+pager.
 *
 * Mobile layout (m1 §"FRAME 04"):
 *   - search field (pill) over the filtered set
 *   - filter chips: All / Buy-side / Sell-side / Watchlist
 *   - vertical list of deal rows: MarkBadge + name over "sector · EV",
 *     right column stage pill + "Fit NN" (fit only when real) → openDeal
 *
 * Honesty (mirrors the desktop sibling):
 *  - SECTOR: read the segment before the first "·" in `sub`; else "—".
 *  - EV: asking price ONLY (never EBITDA/SDE under an EV label) → fmtCents.
 *  - FIT: rendered only when `fit` is a real composite (the hook nulls
 *    synthetic fits in `all`). Otherwise no fit line.
 *  - No owner / activity columns: the mobile row has no room and the hook
 *    carries no honest value for either.
 */
import { useMemo, useState } from "react";
import type { AtlasScreenProps } from "../../desktop/atlasNav";
import { useAtlasNav, useAtlasChat } from "../../desktop/atlasNav";
import {
  useMobileDeals,
  type MobileStageRow,
} from "../../../../hooks/useMobileDeals";
import {
  MarkBadge,
  Pill,
  EmptyState,
  LoadingState,
  fmtCents,
} from "../../desktop/primitives";
import { SearchIcon } from "../../desktop/icons";
import { T } from "../../desktop/atlasTokens";

type FilterId = "all" | "buy" | "sell" | "watch";

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

/* ─── screen ───────────────────────────────────────────────── */

export default function DealsMobileScreen({ user }: AtlasScreenProps) {
  const nav = useAtlasNav();
  const chat = useAtlasChat();
  const { all, loading, loaded } = useMobileDeals(user);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");

  // Client-side filter: search over name + sub, chips over side/watchlist.
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

  const openDeal = (row: MobileStageRow) => nav.openDeal(row.rawId, row.name);

  return (
    <div style={{ padding: "6px 18px 4px", color: T.ink, fontFamily: T.font }}>
      {/* title row */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-.02em" }}>
          Deals
        </div>
        {loaded && all.length > 0 && (
          <div style={{ fontSize: 13, color: T.muted2 }}>{all.length}</div>
        )}
      </div>

      {/* search field */}
      <label
        style={{
          height: 40,
          background: T.white,
          border: `1px solid ${T.border}`,
          borderRadius: T.rPill,
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          gap: 9,
          marginBottom: 11,
        }}
      >
        <SearchIcon size={17} c={T.muted2} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search deals"
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            background: "transparent",
            outline: "none",
            fontSize: 14,
            color: T.ink,
            fontFamily: T.font,
          }}
        />
      </label>

      {/* filter chips — edge-bleed horizontal scroll */}
      <div
        className="scr"
        style={{
          display: "flex",
          gap: 7,
          margin: "0 -18px 10px",
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
              onClick={() => setFilter(f.id)}
              style={{
                flex: "none",
                fontSize: 12.5,
                fontWeight: 600,
                padding: "7px 14px",
                borderRadius: T.rPill,
                cursor: "pointer",
                fontFamily: T.font,
                border: `1px solid ${active ? T.blue : T.border}`,
                background: active ? T.blue : T.white,
                color: active ? "#fff" : T.muted,
                whiteSpace: "nowrap",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* list / loading / empty */}
      {loading && !loaded ? (
        <div style={{ padding: "32px 0" }}>
          <LoadingState label="Loading your deals…" />
        </div>
      ) : loaded && all.length === 0 ? (
        <div style={{ padding: "24px 0" }}>
          <EmptyState
            title="No deals yet"
            hint="Talk to Yulia to add a target, evaluate a business, or import a deal. She is the front door to everything in Atlas."
            cta="Add your first deal"
            onCta={() => chat?.send("I want to add a new deal.")}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "24px 0" }}>
          <EmptyState
            title="No deals match"
            hint="Try a different search or filter."
          />
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 9,
            paddingTop: 4,
          }}
        >
          {filtered.map((row) => (
            <DealRow key={row.id} row={row} onOpen={() => openDeal(row)} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── deal row ─────────────────────────────────────────────── */

function DealRow({ row, onOpen }: { row: MobileStageRow; onOpen: () => void }) {
  const sector = sectorOf(row);
  const stage = stageMeta(row);
  const ev = fmtCents(evCents(row));
  const tint = markTint(row.rawId);
  const fitReal = typeof row.fit === "number";

  // "sector · EV" — drop an absent half so we never print a bare "·".
  const meta = [sector !== "—" ? sector : null, ev !== "—" ? ev : null]
    .filter(Boolean)
    .join(" · ");

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
        borderRadius: 14,
        padding: 13,
        display: "flex",
        alignItems: "center",
        gap: 11,
        cursor: "pointer",
        outline: "none",
      }}
    >
      <MarkBadge letter={row.name} bg={tint.bg} fg={tint.fg} size={34} radius={9} />

      {/* name + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
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
          {meta || "—"}
        </div>
      </div>

      {/* stage pill + fit (fit only when real) */}
      <div
        style={{
          flex: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 5,
        }}
      >
        <Pill bg={stage.bg} fg={stage.fg} style={{ fontSize: 11, padding: "3px 8px" }}>
          {stage.label}
        </Pill>
        {fitReal && (
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              color: fitMeta(row.fit as number).fg,
            }}
          >
            Fit {row.fit}
          </span>
        )}
      </div>
    </div>
  );
}
