/**
 * FILES · LIST — the data room on the kit. Phase 3 of `APP_REDESIGN_TRAINLINE.md`.
 *
 * Primitives: `../kit`. Worked reference: `./DealsList.tsx`. Skin: CARTA.
 *
 * ── WHAT THIS RE-PRESENTS ───────────────────────────────────────────────
 * Every capability of the 198px-rail `Files.tsx` survives: folder scoping with
 * counts, upload into the open folder, the document list, the selected
 * document's real metadata, working-paper provenance, and the auth-safe
 * download. Nothing was cut. What changes is the grammar — you now read the
 * shape of the room before you open anything in it.
 *
 * ── THE COMPARE STRIP: THE PLAN SAID "NO NATURAL AXIS". THERE IS ONE. ────
 * §3 of the plan writes Files' compare-strip cell as "— (no natural axis)",
 * and for the axes it had in mind that is right: KIND is already the chip row
 * (P2), DEAL is not an axis at all here (the hook fetches
 * `/api/deals/:id/data-room`, so the room is one deal by construction), and a
 * RECENCY BAND would be a bucketing we invented rather than one the data
 * carries.
 *
 * But the data does carry an ordered axis with a deciding number on it: the
 * room's own REVIEW FOLDERS. They arrive `ORDER BY sort_order`, each one
 * gate-linked — that is a diligence sequence, structurally the same shape as
 * the pipeline stages the strip carries on Deals. And the decision it exposes
 * is the one that matters in a data room: WHICH PARTS OF DILIGENCE ARE STILL
 * EMPTY. A folder reading 0 is the gap; you see it without opening it.
 *
 * ── THE STRIP COUNTS THE WHOLE ROOM. IT USED TO COUNT THE FILTER. ───────
 * The first cut of this screen computed every strip cell over the searched +
 * chip-filtered set and then told the reader, underneath, that "a folder
 * showing 0 is a measured zero". That was true at rest and false one keystroke
 * later: with a chip on, a 0 meant "none of THIS FILE TYPE is filed here",
 * which is not a gap in diligence at all. Two things were wrong at once — the
 * caveat described a population the number was not computed over, and a
 * comparison strip that re-filters alongside the chips is comparing nothing,
 * because every cell moves together and the shape of the room stops showing.
 *
 * So the strip is now computed over `room.documents`: the whole room, always,
 * whatever the chips and the search are doing. It is the one figure on this
 * screen that does not move when you filter, and that is the entire point of
 * it. A ZERO HERE IS THEREFORE A MEASURED ZERO, and that is why it prints as
 * `0` rather than through the kit's not-known glyph. The room returns its
 * complete document list in one response, so "this folder holds nothing" is a
 * fact we hold, not a number we failed to fetch. Contrast `DealsList`, where a
 * stage's capital is `null` because an unpriced target genuinely has no figure
 * to sum. Both laws are the same law: print what you know, and make what you do
 * not know look different from zero.
 *
 * ── THE POPULATION RULE ─────────────────────────────────────────────────
 * The trap above is one instance of a general one: a statistic computed over
 * the windowed / filtered / searched subset and then presented as a fact about
 * the whole set. Every count on this screen must either cover the WHOLE set or
 * name the subset it covers, and each is commented with which of the two it
 * chose and why:
 *   · folder strip  → the whole room, never filtered (above).
 *   · kind chips    → the open folder plus the search, and the footer says so,
 *     because a chip's job is to preview the cut that clicking it would give.
 *   · group headers → the whole filtered list for that group, with the row
 *     window stated as "showing n of m" instead of silently truncating.
 *   · endorsement's peer count → only the stale documents that carry a date,
 *     because "the oldest of N" is a claim about an ordering and a document
 *     with no date has no position in that ordering.
 *
 * ── WHERE UNKNOWN IS STILL UNKNOWN ──────────────────────────────────────
 *   · `file_type` empty → the kind is NOT RECORDED. The old screen printed
 *     `FILE` for this, which reads like a real kind; it is a missing field.
 *     The count of such documents is known, so the chip carries a real number
 *     under an honest label.
 *   · `version` absent → "Not recorded". Never `v0`, never `v1`.
 *   · `created_at` / `updated_at` unparseable → "Not available" in the column
 *     and "Not recorded" in the detail. Never today's date.
 *   · A document with no folder is UNFILED — a known state, not a missing
 *     field — so it says "Not filed into a folder", not "Not recorded".
 *   · `name` empty → "Name not recorded". A row needs an anchor to be clicked,
 *     so SOMETHING must print; what must not happen is printing a plausible
 *     label. "Untitled" (what this file said first) reads as a document that
 *     was named nothing, which is a claim about the document. The row is
 *     reporting a missing FIELD, so it says the field is missing.
 *   · No page counter. The room carries no page metadata, so `p.12 / 88` would
 *     have to be invented. The prototype's clause box is not ported for the
 *     same reason: no page-anchored citation exists in this data.
 *
 * ── THE LINE ────────────────────────────────────────────────────────────
 * Read, analyse, upload, download. No action here sends, shares or offers a
 * document to a counterparty, and none was added while rebuilding the screen.
 *
 * ── NO NEW DATA PATH ────────────────────────────────────────────────────
 * The room arrives as the `useMobileDataRoom` state `Files.tsx` already holds,
 * and the download helper arrives as a prop — this file opens no fetch of its
 * own, adds no route and decides nothing that is not presentation.
 */
import { useCallback, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { T } from "../atlasTokens";
import {
  CriteriaBar, ChipRow, CompareStrip, ListDetail, GroupHeader, ResultRow,
  Endorsement, Expander, RankingNote, SummaryCard, DetailCard, InfoBanner, Timeline,
  type Chip, type CompareItem, type CriteriaCell,
} from "../kit";
import type {
  MobileDataRoomDocument,
  MobileDataRoomState,
} from "../../../../hooks/useMobileDataRoom";

/* How many rows PER GROUP before the window closes. The Expander widens every
   group by the same step.

   IT WINDOWS PER GROUP, NOT OVER THE FLAT LIST, and that is a correctness fix
   rather than a taste one. The first cut sliced `visible` to 14 rows and THEN
   grouped what survived, so at the default "all folders" scope the groups were
   a re-presentation of the 14 most recent documents room-wide: the strip could
   read "Closing · 9" one inch above a list carrying no Closing group at all,
   and the footer's ordering sentence claimed a grouping the list was not doing.
   Grouping first and windowing inside each group means every group with a
   match is always on screen, so the strip and the list describe the same room;
   the only thing hidden is rows, and each header says how many. */
const GROUP_WINDOW = 8;

/* The design's scope toggle (My files / Shared with team / Data room · Due
   diligence) selects the third segment. Carried over verbatim from the screen
   this replaces, including its reason: the data layer has NO per-document
   owner or share field, so the first two cannot be honestly backed. An inert
   toggle that animates but filters nothing — and implies a sharing capability
   the screen cannot deliver — would be worse than a plain statement of scope,
   so the criteria bar states the one real scope instead. */
const ACTIVE_SCOPE_LABEL = "Data room · Due diligence";

/** Chip/group id for documents whose `file_type` was never recorded. */
const KIND_UNKNOWN = "__kind_unrecorded__";

type FolderKey = "all" | "unfiled" | number;
type GroupBy = "folder" | "kind";

/* ─── honest formatters ───────────────────────────────────────
 * Each returns `null` for absent, and every caller renders that null as words.
 * None of them substitutes a plausible value. */

/** `null` when the field is absent or unparseable — never a fabricated date. */
function fmtDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/** Sort key for a timestamp. An unrecorded date sorts LAST, so a document with
 *  no date can never be picked as "the least recently updated" over one that
 *  has a real date — the endorsement's grounds must stay checkable. */
function tsOf(iso: string | null | undefined): number {
  const v = Date.parse(iso ?? "");
  return Number.isNaN(v) ? Number.POSITIVE_INFINITY : v;
}

/** The document's name, or a statement that the room holds none.
 *
 *  This is the ONE place the file substitutes a string for an absent field, and
 *  it is deliberate: a row has to have an anchor to be clickable and a summary
 *  card has to have a heading. What it must not do is substitute a PLAUSIBLE
 *  one — "Untitled" reads as a document that was saved without a title, which
 *  is a claim about the document rather than about our record of it. The
 *  substitute therefore names the missing field, in the same words the detail
 *  stack uses for every other gap. */
function docName(doc: MobileDataRoomDocument): string {
  const n = (doc.name || "").trim();
  return n || "Name not recorded";
}

/** The document's kind, or `null` when the room recorded none. */
function kindOf(doc: MobileDataRoomDocument): string | null {
  const t = (doc.file_type || "").trim();
  return t ? t.toUpperCase() : null;
}

function kindLabel(kind: string | null): string {
  return kind ?? "Type not recorded";
}

function titleCase(s: string): string {
  const t = s.replace(/[_-]+/g, " ").trim();
  if (!t) return s;
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

/** `null` when no status is recorded — the caller then says so in words rather
 *  than rendering a tag containing a dash, which reads as a real state. */
function statusTone(status: string | null | undefined): { label: string; bg: string; fg: string } | null {
  const raw = (status || "").trim();
  if (!raw) return null;
  const s = raw.toLowerCase();
  if (/approv|final|complete|signed|executed|ready/.test(s)) {
    return { label: titleCase(raw), bg: T.greenBg, fg: T.green };
  }
  if (/review|pending|progress|draft|generating/.test(s)) {
    return { label: titleCase(raw), bg: T.amberBg, fg: T.amber };
  }
  if (/reject|fail|error|stale|expired/.test(s)) {
    return { label: titleCase(raw), bg: T.terraBg, fg: T.terra };
  }
  return { label: titleCase(raw), bg: T.track, fg: T.muted2 };
}

/* ─── the screen ──────────────────────────────────────────── */

export function FilesList({ room, dealLabel, openDocument, onClassicView }: {
  /** The loaded room, from the `useMobileDataRoom` call `Files.tsx` already makes. */
  room: MobileDataRoomState;
  dealLabel: string;
  /** The auth-safe fetch→blob opener owned by `Files.tsx`. Passed rather than
   *  re-implemented so this screen adds no second copy of that request. */
  openDocument: (docId: number) => Promise<string | null>;
  /** Back to the original folder-rail view (plan §5 Q2: compare honestly). */
  onClassicView?: () => void;
}) {
  const [folderKey, setFolderKey] = useState<FolderKey>("all");
  const [kind, setKind] = useState<string>("all");
  const [groupBy, setGroupBy] = useState<GroupBy>("folder");
  const [query, setQuery] = useState("");
  const [win, setWin] = useState(GROUP_WINDOW);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [opening, setOpening] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* ── folder identity ──────────────────────────────────────────────
     A document whose folder_id points at a folder the room did not return
     (role-filtered, or deleted) counts as UNFILED rather than being dropped —
     the same rule `useMobileDataRoom.groupByFolder` applies, so nothing real
     disappears from the board. */
  const folderIds = useMemo(() => new Set(room.folders.map(f => f.id)), [room.folders]);
  const folderOf = useCallback(
    (d: MobileDataRoomDocument): number | null =>
      d.folder_id != null && folderIds.has(d.folder_id) ? d.folder_id : null,
    [folderIds],
  );
  const sortedFolders = useMemo(
    () => [...room.folders].sort((a, b) => a.sort_order - b.sort_order),
    [room.folders],
  );
  const folderName = useCallback(
    (id: number | null): string | null => (id == null ? null : room.folders.find(f => f.id === id)?.name ?? null),
    [room.folders],
  );

  /* ── the two facets, and the two DIFFERENT populations they count over ──
     The kind chips PREVIEW A CUT: their job is to answer "what would clicking
     this give me", so they count inside the open folder and the current search
     (the reference's "Train · $104.88" idea), and the footer states that
     subset in words. The folder strip COMPARES A WHOLE: its job is to show
     which parts of diligence are still empty, so it counts the entire room and
     ignores both controls — see the header. Making both behave the same way
     was the original defect; they are asking different questions. */
  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return room.documents;
    return room.documents.filter(d =>
      (d.name || "").toLowerCase().includes(q) || (d.file_type || "").toLowerCase().includes(q));
  }, [room.documents, query]);

  const matchFolder = useCallback(
    (d: MobileDataRoomDocument, key: FolderKey) =>
      key === "all" ? true : key === "unfiled" ? folderOf(d) == null : folderOf(d) === key,
    [folderOf],
  );
  const matchKind = useCallback(
    (d: MobileDataRoomDocument, k: string) =>
      k === "all" ? true : k === KIND_UNKNOWN ? kindOf(d) == null : kindOf(d) === k,
    [],
  );

  const forChips = useMemo(
    () => searched.filter(d => matchFolder(d, folderKey)),
    [searched, matchFolder, folderKey],
  );
  const visible = useMemo(
    () => searched.filter(d => matchFolder(d, folderKey) && matchKind(d, kind)),
    [searched, matchFolder, matchKind, folderKey, kind],
  );

  /* ── P2 · the chips carry their count ─────────────────────────────
     Kinds are derived FROM the documents, so a kind with no documents has no
     chip at all rather than a chip reading 0 — except the ACTIVE one, which is
     kept visible at its real count (which may be a measured 0) so a filter can
     never strand you on an empty list with nothing to clear.

     POPULATION: the open folder + the current search, chosen deliberately —
     a chip previews the cut it would produce, and a chip promising 30 PDFs
     that resolves to 4 inside the open folder would be the same lie in the
     other direction. The footer names this subset, which is what the rule
     requires of a figure computed over one. */
  const chips = useMemo<Chip[]>(() => {
    const counts = new Map<string, number>();
    for (const d of forChips) {
      const k = kindOf(d) ?? KIND_UNKNOWN;
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    const keys = [...counts.keys()].filter(k => k !== KIND_UNKNOWN).sort();
    if (counts.has(KIND_UNKNOWN)) keys.push(KIND_UNKNOWN);
    if (kind !== "all" && !counts.has(kind)) keys.push(kind);
    return [
      { id: "all", label: "All files", value: String(forChips.length) },
      ...keys.map(k => ({
        id: k,
        label: k === KIND_UNKNOWN ? "Type not recorded" : k,
        value: String(counts.get(k) ?? 0),
      })),
    ];
  }, [forChips, kind]);

  /* ── P3 · the folder strip ────────────────────────────────────────
     The room's own diligence sequence, in its own sort order, each cell
     carrying the number of documents filed there.

     POPULATION: THE WHOLE ROOM — `room.documents`, not `searched`, not the
     chip cut. This is the fix for the screen's worst defect. These cells used
     to count inside the current chip and search while the footer underneath
     called a 0 "a measured zero: an empty folder is a gap in the room". One
     chip click later that 0 meant "nothing of this type is filed here" and the
     sentence was simply false. Counting the whole room makes the sentence true
     again, and it makes the strip do the job a comparison strip exists for:
     the numbers hold still while you filter, so you can see which parts of
     diligence are empty rather than watching every cell fall together.

     `0` is printed, not glyphed: the room returns its complete document list
     in one response, so an empty folder is a fact and not a failed fetch. */
  const roomUnfiled = useMemo(
    () => room.documents.filter(d => folderOf(d) == null).length,
    [room.documents, folderOf],
  );
  const strip = useMemo<CompareItem[]>(() => {
    const cells: CompareItem[] = [
      { id: "all", label: "All files", value: String(room.documents.length) },
      ...sortedFolders.map(f => ({
        id: String(f.id),
        label: f.name,
        value: String(room.documents.filter(d => folderOf(d) === f.id).length),
      })),
    ];
    // The Unfiled cell exists whenever the ROOM has unfiled documents — which
    // is now the same population every other cell counts, so it can no longer
    // disagree with them.
    if (roomUnfiled > 0) {
      cells.push({ id: "unfiled", label: "Unfiled", value: String(roomUnfiled) });
    }
    return cells;
  }, [room.documents, sortedFolders, folderOf, roomUnfiled]);

  const stripActive = folderKey === "all" ? "all" : folderKey === "unfiled" ? "unfiled" : String(folderKey);

  /* ── the groups ───────────────────────────────────────────────────
     By folder: the room's sort order, unfiled last. By kind: alphabetical,
     with the unrecorded-type group last. Rows are never re-sorted inside a
     group — they keep the order the room returned them in (created_at DESC).
     "By deal" is not offered because the room is a single deal by
     construction; kind is the only second axis this data actually has.

     GROUP FIRST, WINDOW SECOND — see GROUP_WINDOW for why the other order was
     wrong. `total` is the group's whole population inside the current filter;
     `docs` is the slice actually rendered. The header prints both whenever
     they differ, so a truncated group states its truncation rather than
     reading as a complete group that happens to be short. */
  const groups = useMemo(() => {
    type Group = { key: string; title: string; docs: MobileDataRoomDocument[]; total: number };
    const out: Group[] = [];
    const push = (key: string, title: string, all: MobileDataRoomDocument[]) => {
      if (all.length) out.push({ key, title, docs: all.slice(0, win), total: all.length });
    };
    if (groupBy === "folder") {
      for (const f of sortedFolders) push(`f${f.id}`, f.name, visible.filter(d => folderOf(d) === f.id));
      push("unfiled", "Unfiled", visible.filter(d => folderOf(d) == null));
    } else {
      const byKind = new Map<string, MobileDataRoomDocument[]>();
      for (const d of visible) {
        const k = kindOf(d) ?? KIND_UNKNOWN;
        const list = byKind.get(k) ?? [];
        list.push(d);
        byKind.set(k, list);
      }
      const keys = [...byKind.keys()].filter(k => k !== KIND_UNKNOWN).sort();
      if (byKind.has(KIND_UNKNOWN)) keys.push(KIND_UNKNOWN);
      for (const k of keys) push(k, k === KIND_UNKNOWN ? "Type not recorded" : k, byKind.get(k) ?? []);
    }
    return out;
  }, [groupBy, sortedFolders, visible, folderOf, win]);

  /* Every row actually on screen, in render order, plus what the window is
     holding back. Anything that describes "what you are looking at" — the
     endorsement, the expander's arithmetic — counts over THESE rather than
     over `visible`, so no claim can point at a row the reader cannot see. */
  const rendered = useMemo(() => groups.flatMap(g => g.docs), [groups]);
  const hiddenRows = useMemo(
    () => groups.reduce((n, g) => n + (g.total - g.docs.length), 0),
    [groups],
  );
  const truncatedGroups = useMemo(
    () => groups.filter(g => g.docs.length < g.total).length,
    [groups],
  );

  /* ── P6 · the endorsement, with grounds ───────────────────────────
     The only claim this data can support that is a FACT rather than an
     opinion: a filed document whose source deliverable the backend has marked
     stale no longer matches the run it came from. Among those, the one least
     recently updated. It is computed over the rows actually RENDERED, not over
     the whole filtered list, because the band prints inline above its own row —
     endorsing a document the window is hiding would put a claim on screen with
     nothing beneath it. If nothing rendered is stale the band does not appear —
     an endorsement with nothing checkable behind it is exactly what the kit's
     required `grounds` prop exists to prevent. */
  const endorsed = useMemo(() => {
    const stale = rendered.filter(d => d.deliverable_is_stale === true);
    if (!stale.length) return null;
    let worst = stale[0];
    for (const d of stale) if (tsOf(d.updated_at) < tsOf(worst.updated_at)) worst = d;
    /* POPULATION: the peer count is the stale documents on screen THAT CARRY A
       DATE — not every stale document. The grounds say "the oldest of the N",
       which is a claim about an ordering by update date, and a document whose
       `updated_at` is absent or unparseable has no position in that ordering.
       (That is precisely why `tsOf` sends it to +Infinity so it can never be
       picked as the oldest — but the count was still including it, so the
       ranked-among-N sentence covered documents that were not ranked at all.)
       The undated ones are reported separately rather than dropped: they are
       still stale, and omitting them would understate the problem. */
    const dated = stale.filter(d => Number.isFinite(tsOf(d.updated_at))).length;
    return { doc: worst, dated, undated: stale.length - dated };
  }, [rendered]);

  const selected = useMemo(
    () => room.documents.find(d => d.id === selectedDocId) ?? null,
    [room.documents, selectedDocId],
  );

  /* ── actions ──────────────────────────────────────────────────────
     Both existed on the screen this replaces and are unchanged in behaviour:
     the download is the auth-safe fetch→blob→new-tab path (the backend streams
     inline or redirects to a presigned URL, so `window.open` with an auth
     header is not possible), and the upload files into the open folder, or
     root when the strip is on All / Unfiled. */
  const handleOpen = useCallback(async (doc: MobileDataRoomDocument) => {
    setOpenError(null);
    setOpening(true);
    try {
      const url = await openDocument(doc.id);
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
        // Give the new tab time to read the blob before revoking.
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      }
    } catch (err: any) {
      setOpenError(err?.message || "Couldn’t open this file");
    } finally {
      setOpening(false);
    }
  }, [openDocument]);

  const handleUploadPick = useCallback(async (file: File | null | undefined) => {
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const folderId = typeof folderKey === "number" ? folderKey : null;
      await room.uploadFile(file, folderId);
    } catch (err: any) {
      setUploadError(err?.message || "Couldn’t upload this file");
    } finally {
      setUploading(false);
    }
  }, [folderKey, room]);

  const selectFolder = useCallback((key: FolderKey) => {
    setFolderKey(key);
    setSelectedDocId(null);
    setOpenError(null);
    setWin(GROUP_WINDOW);
  }, []);

  /* ── P1 · the criteria bar ────────────────────────────────────── */
  const activeFolderLabel =
    folderKey === "all" ? "Every folder"
      : folderKey === "unfiled" ? "Unfiled"
        : folderName(folderKey) ?? "Every folder";

  const cells: CriteriaCell[] = [
    { label: "Looking at", value: ACTIVE_SCOPE_LABEL, grow: 1.1 },
    { label: "Deal", value: dealLabel, grow: 1 },
    { label: "Folder", value: activeFolderLabel, grow: 1 },
    {
      label: "Group by",
      value: groupBy === "folder" ? "Folder" : "File type",
      grow: 0.8,
      onClick: () => setGroupBy(g => (g === "folder" ? "kind" : "folder")),
    },
    {
      label: "Search",
      grow: 1.4,
      value: (
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setWin(GROUP_WINDOW); }}
          placeholder="Document name or type"
          style={searchInput}
          aria-label="Search documents in this data room"
        />
      ),
    },
  ];

  const uploadFolderNote =
    typeof folderKey === "number" ? `Uploads file into ${folderName(folderKey) ?? "this folder"}.` : "Uploads file into the room root.";

  return (
    <div style={wrap}>
      <CriteriaBar cells={cells} />

      <ChipRow
        chips={chips}
        activeId={kind}
        onPick={id => { setKind(id); setSelectedDocId(null); setWin(GROUP_WINDOW); }}
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {onClassicView && (
              <button type="button" onClick={onClassicView} style={ghostBtn}>
                Folder view
              </button>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title={uploadFolderNote}
              style={{ ...uploadBtn, opacity: uploading ? 0.6 : 1, cursor: uploading ? "default" : "pointer" }}
            >
              {uploading ? "Uploading…" : "Upload"}
            </button>
            {/* Hidden picker — drives room.uploadFile into the open folder (or root). */}
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: "none" }}
              onChange={e => {
                const file = e.target.files?.[0];
                void handleUploadPick(file);
                // Reset so re-picking the same file fires onChange again.
                e.target.value = "";
              }}
            />
          </div>
        }
      />

      {uploadError && (
        <div style={{ marginTop: 10 }}>
          <InfoBanner tone="caution">{uploadError}</InfoBanner>
        </div>
      )}

      <CompareStrip
        items={strip}
        activeId={stripActive}
        onPick={id => selectFolder(id === "all" ? "all" : id === "unfiled" ? "unfiled" : Number(id))}
      />

      <div style={{ marginTop: 16 }}>
        <ListDetail
          detailEmpty={
            <>
              Pick a document to see what it is, where it came from and when it
              last moved — the list stays where it is.
            </>
          }
          detail={selected ? (
            <DocDetail
              doc={selected}
              folder={folderName(folderOf(selected))}
              opening={opening}
              openError={openError}
              onOpen={() => { if (!opening) void handleOpen(selected); }}
            />
          ) : null}
          list={
            <div>
              {groups.map(g => (
                <div key={g.key} style={{ marginBottom: 2 }}>
                  {/* P7 — the group name and the column names in one row.
                      The header states the group's WHOLE population inside the
                      current filter whenever the window is holding rows back
                      ("Closing · showing 8 of 21"), so the reader is never
                      shown a short group that looks complete. When nothing is
                      held back the count is omitted rather than printed as
                      "8 of 8", which would be noise on every group. */}
                  <GroupHeader
                    title={g.docs.length < g.total ? `${g.title} · showing ${g.docs.length} of ${g.total}` : g.title}
                    columns={["Added", "Updated"]}
                  />
                  {g.docs.map(d => {
                    const isEndorsed = endorsed?.doc.id === d.id;
                    const tone = statusTone(d.status);
                    const k = kindOf(d);
                    const bits = [kindLabel(k), d.version != null ? `v${d.version}` : null]
                      .filter(Boolean).join(" · ");
                    const fname = folderName(folderOf(d));
                    return (
                      <div key={d.id}>
                        {isEndorsed && (
                          <Endorsement
                            claim="Look at this one first."
                            grounds={staleGrounds(endorsed!.doc, endorsed!.dated, endorsed!.undated)}
                          />
                        )}
                        <ResultRow
                          anchor={docName(d)}
                          sub={bits}
                          /* The folder is the group header when grouping by
                             folder, so it only earns a place on the row in the
                             kind grouping — where it is the fact you are
                             missing. Clicking it scopes the strip to it. */
                          subLink={groupBy === "kind" ? fname ?? undefined : undefined}
                          onSubLink={
                            groupBy === "kind" && folderOf(d) != null
                              ? () => selectFolder(folderOf(d) as number)
                              : undefined
                          }
                          identity={tone ? <StatusTag tone={tone} /> : undefined}
                          endorsed={isEndorsed}
                          selected={selectedDocId === d.id}
                          onClick={() => { setSelectedDocId(d.id); setOpenError(null); }}
                          values={[
                            { text: fmtDate(d.created_at) },
                            { text: fmtDate(d.updated_at), lead: selectedDocId === d.id },
                          ]}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* THE EMPTY STATE CANNOT CLAIM THE ROOM IS EMPTY.
                  `GET /deals/:id/data-room` filters folders by role and then
                  returns `documents: []` outright whenever no folder is visible
                  (dataRoom.ts — the documents query is skipped when
                  `visibleFolderIds.length === 0`). So an empty response means
                  EITHER an empty room OR a full room none of which is in your
                  scope, and the old copy ("No documents in the data room yet")
                  asserted the first while the second was live.

                  The response does distinguish them, just not through the
                  document list: folders are role-filtered the same way, and the
                  backend auto-creates a folder set for every deal, so zero
                  folders back means zero folders VISIBLE TO YOU rather than a
                  deal without any. Zero documents with folders present is the
                  genuinely empty case and still invites the upload. */}
              {visible.length === 0 && (
                <div style={noRows}>
                  {room.documents.length === 0 ? (
                    sortedFolders.length === 0 ? (
                      <>
                        This room returned no folders, so there is nothing here to
                        show you — and that is not the same as the room being
                        empty. The data room only returns the folders your role
                        may see; if you expect documents in this deal, ask the
                        deal owner to check your folder access.
                      </>
                    ) : (
                      <>
                        No documents in any folder you can see. Generate a
                        deliverable or upload a file and Yulia will file it into a
                        review folder. The strip above shows the folders the room
                        is waiting to fill.
                      </>
                    )
                  ) : (
                    <>
                      Nothing matches. {room.documents.length} document
                      {room.documents.length === 1 ? "" : "s"} in this room — clear
                      the search, the file-type chip, or pick another folder.
                    </>
                  )}
                </div>
              )}

              {/* P8 — the list admits it is a window onto something larger.
                  The count is the rows held back ACROSS THE GROUPS ON SCREEN,
                  which is the same population the group headers report; it is
                  not "N of the flat list", because the flat list is no longer
                  what gets truncated. */}
              {hiddenRows > 0 && (
                <Expander
                  dir="down"
                  label={`Show more — ${hiddenRows} row${hiddenRows === 1 ? "" : "s"} hidden in ${truncatedGroups} group${truncatedGroups === 1 ? "" : "s"}`}
                  onClick={() => setWin(w => w + GROUP_WINDOW)}
                />
              )}

              {/* P9 — the honest footer. Every ranked list in this app applies
                  an ordering nobody can see; this one says what it is, and the
                  claims below are all readable off the code above. */}
              <RankingNote
                ordering={
                  /* The sentence has to survive the window, which is why it
                     now says where the window bites. Grouping happens over
                     everything that matches, so every group with a match is
                     here; only rows inside a group are held back, and the
                     group's own header says how many. */
                  groupBy === "folder"
                    ? `Grouped by the room's own review folders, in the folder order the room defines, with unfiled documents last. Every folder holding a matching document appears; inside a folder at most the first ${win} rows are shown, and any group holding more says so in its header. Nothing is re-ranked inside a group — documents keep the order the data room returned them in, most recently added first.`
                    : `Grouped by file type, alphabetically, with documents whose type was never recorded last. Every type holding a matching document appears; inside a type at most the first ${win} rows are shown, and any group holding more says so in its header. Nothing is re-ranked inside a group — documents keep the order the data room returned them in, most recently added first.`
                }
                caveats={[
                  "The folder strip counts the whole room — every document in each folder, whatever the search box and the file-type chip are set to. It is meant for comparing the shape of the room, so it deliberately holds still while you filter, and it will often total more than the list below it.",
                  "The file-type chips are the other way round: they count inside the folder you have open and the search you have typed, because a chip's job is to preview the cut that clicking it would give you.",
                  "A folder showing 0 in the strip is a measured zero: the room returns its whole document list in one response, so an empty folder is a gap in the room rather than a number we failed to fetch. A file type with no documents has no chip at all, and a document whose type was never recorded is counted under “Type not recorded” rather than guessed at.",
                  "When a document is highlighted it is simply the least recently updated one, among the rows shown here, whose source deliverable the backend has marked stale. Stale documents with no recorded update date cannot be placed in that order, so they are named separately rather than counted in it. It is not a judgement about what the document says.",
                  "The room returns only the folders your role may see, so a folder you cannot open is absent here rather than shown as empty — and so are the documents inside it. Every count on this screen, the strip included, is a count of what your role can see.",
                  "Nothing here is promoted or sponsored. Every row is a document filed into this deal's room.",
                ]}
              />
            </div>
          }
        />
      </div>
    </div>
  );
}

/* ── the endorsement's grounds ────────────────────────────────────────
   Every clause is checkable against a field on the row: the stale flag, the
   backend's own stale reason, the filed copy's update date, and the count of
   stale documents on screen. Never a bare "needs attention".

   `dated` and `undated` arrive SPLIT rather than as one total because the
   "oldest of N" clause can only speak for documents that have a date. Saying
   "the oldest of the 5" when two of those five carry no date claims an
   ordering over documents that were never in it. So N is the dated count, and
   the undated stale documents get their own sentence — visible, uncounted in
   the ranking, and not quietly dropped. */
function staleGrounds(doc: MobileDataRoomDocument, dated: number, undated: number): string {
  const reason = (doc.deliverable_stale_reason || "").trim();
  const when = fmtDate(doc.updated_at);
  const head = `Its source deliverable is marked stale${reason ? ` — ${reason}` : " (no reason recorded)"}.`;

  if (!when) {
    // This document has no date, so `tsOf` put every stale document at
    // +Infinity — i.e. none of them has one, and `undated` includes this row.
    const others = undated - 1;
    const alsoNone = others > 0
      ? ` ${others} other stale document${others === 1 ? "" : "s"} here record${others === 1 ? "s" : ""} no update date either, so none of them can be ordered by recency.`
      : "";
    return `${head} The room records no update date for the filed copy.${alsoNone}`;
  }

  const tail = dated > 1 ? `, the oldest of the ${dated} stale documents shown here that carry one` : "";
  const alsoUndated = undated > 0
    ? ` A further ${undated} stale document${undated === 1 ? "" : "s"} shown here record${undated === 1 ? "s" : ""} no update date and so ${undated === 1 ? "sits" : "sit"} outside that ordering.`
    : "";
  return `${head} The filed copy has not been updated since ${when}${tail}.${alsoUndated}`;
}

/* ── P10 · the detail stack ───────────────────────────────────────── */

function DocDetail({ doc, folder, opening, openError, onOpen }: {
  doc: MobileDataRoomDocument;
  /** `null` = the document is not in a folder. A known state, not a gap. */
  folder: string | null;
  opening: boolean;
  openError: string | null;
  onOpen: () => void;
}) {
  const tone = statusTone(doc.status);
  const kind = kindOf(doc);
  const added = fmtDate(doc.created_at);
  const updated = fmtDate(doc.updated_at);
  const hasProvenance = doc.model_execution_id != null && !!doc.model_output_hash;
  const staleReason = (doc.deliverable_stale_reason || "").trim();

  const sub = [
    doc.version != null ? `v${doc.version}` : null,
    added ? `Added ${added}` : null,
    updated ? `Updated ${updated}` : null,
  ].filter(Boolean).join(" · ");

  return (
    <div style={detailScroll}>
      {/* The dark card carries the document's identity and the ONE action.
          The badge is the kind, not the status: the kit's badge is a fixed
          green tint, and a rejected document wearing an approving colour
          would be a lie told by a style. Status keeps its own toned tag below. */}
      <SummaryCard
        kicker={folder ? `Filed in ${folder}` : "Not filed into a folder"}
        value={docName(doc)}
        badge={kind ?? undefined}
        sub={sub || undefined}
        actionLabel={opening ? "Opening…" : "Download"}
        onAction={onOpen}
      />

      {openError && (
        <div style={{ marginTop: 12 }}>
          <InfoBanner tone="caution">{openError}</InfoBanner>
        </div>
      )}

      {doc.deliverable_is_stale === true && (
        <div style={{ marginTop: 12 }}>
          <InfoBanner tone="caution">
            <b>Stale source.</b> The deliverable this document was generated from
            is marked stale{staleReason ? ` — ${staleReason}` : " (no reason recorded)"}.
            Regenerate it before relying on the figures inside.
          </InfoBanner>
        </div>
      )}

      <DetailCard title="Document">
        <MetaRows
          rows={[
            { label: "Status", value: tone ? <StatusTag tone={tone} /> : null },
            { label: "File type", value: kind },
            { label: "Version", value: doc.version != null ? `v${doc.version}` : null },
            /* Unfiled is a FACT about the document, not a missing field, so it
               is stated rather than rendered through the unknown path. */
            { label: "Filed in", value: folder ?? "Not filed into a folder" },
            { label: "Added", value: added },
            { label: "Last updated", value: updated },
            ...(doc.deliverable_id != null
              ? [{
                label: "Source",
                value: doc.deliverable_is_stale
                  ? `Generated deliverable · stale${staleReason ? ` (${staleReason})` : ""}`
                  : "Generated deliverable",
              }]
              : []),
          ]}
        />
      </DetailCard>

      {/* The timeline card, carrying the only two-point history this document
          has. Both endpoints are real timestamps; an absent one says so. */}
      <DetailCard title="History">
        <Timeline
          from={{ time: added ?? "Not recorded", place: "Added to the data room" }}
          to={{ time: updated ?? "Not recorded", place: "Last updated" }}
          middle={
            doc.deliverable_completed_at
              ? `Source deliverable completed ${fmtDate(doc.deliverable_completed_at) ?? "on an unrecorded date"}`
              : undefined
          }
        />
      </DetailCard>

      {/* Working-Paper provenance — the REAL substrate run hash, only when the
          backend's lateral join found one. This is the honest, data-backed
          analogue of a citation chip; it is never synthesised here. */}
      {hasProvenance && (
        <DetailCard title="Working paper provenance">
          {doc.model_execution_title && (
            <div style={{ fontSize: 13.5, color: T.ink, marginBottom: 5 }}>
              {doc.model_execution_title}
              {doc.model_execution_version_number != null ? ` · v${doc.model_execution_version_number}` : ""}
            </div>
          )}
          <div style={hashLine}>output {doc.model_output_hash}</div>
          {doc.model_input_hash && <div style={hashLine}>input {doc.model_input_hash}</div>}
          <div style={{ ...caption, marginTop: 8 }}>
            The substrate run this document was generated from. The hashes are the
            run's own; nothing is recomputed on this screen.
          </div>
        </DetailCard>
      )}

      {/* No page counter and no cited-clause box. The room carries no page
          metadata and no page-anchored citation, so "p.12 / 88" and
          "CLAUSE 7.3" would both be layout placeholders presented as fact. */}
      <div style={{ ...caption, marginTop: 14 }}>
        Open the file to read its full contents — the download opens in a new tab.
        No page preview or clause anchor is shown because the room records
        neither, and neither will be invented here.
      </div>
    </div>
  );
}

/* ── small parts ──────────────────────────────────────────────────── */

/** Flat status tag — radius 0, Carta. `null` values never reach it: the caller
 *  renders words instead, so this component cannot print a dash as a state. */
function StatusTag({ tone }: { tone: { label: string; bg: string; fg: string } }) {
  return <span style={{ ...tagStyle, background: tone.bg, color: tone.fg }}>{tone.label}</span>;
}

/** A metadata table where `value: null` prints "Not recorded" — the one place
 *  a missing field is allowed to be quiet is nowhere. */
function MetaRows({ rows }: { rows: { label: string; value: ReactNode | null }[] }) {
  return (
    <div>
      {rows.map((r, i) => (
        <div
          key={r.label}
          style={{
            display: "flex", gap: 12, padding: "9px 0", fontSize: 13,
            borderBottom: i === rows.length - 1 ? "none" : `1px solid ${T.rowDiv2}`,
          }}
        >
          <span style={{ width: 122, flex: "none", color: T.muted2 }}>{r.label}</span>
          <span style={{ flex: 1, minWidth: 0, color: T.ink, wordBreak: "break-word" }}>
            {r.value == null ? <span style={{ color: T.muted2 }}>Not recorded</span> : r.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── styles ───────────────────────────────────────────────────────────
   Radius 0 throughout except buttons and inputs at 10 — Carta's one
   exception. Every colour is a T token; no hex literal lives here. */

const wrap: CSSProperties = { padding: "16px 22px 40px", minWidth: 0 };

const searchInput: CSSProperties = {
  font: "inherit", fontSize: 14, fontWeight: 700, color: T.ink,
  background: "transparent", border: "none", outline: "none",
  padding: 0, width: "100%", minWidth: 0,
};

const uploadBtn: CSSProperties = {
  font: "inherit", fontSize: 12.5, fontWeight: 700, color: T.white,
  background: T.blue, border: "none", borderRadius: 10, padding: "7px 14px",
};

const ghostBtn: CSSProperties = {
  font: "inherit", fontSize: 12.5, fontWeight: 600, color: T.ink,
  background: T.white, border: `1px solid ${T.inputBd}`, borderRadius: 10,
  padding: "6px 12px", cursor: "pointer",
};

const tagStyle: CSSProperties = {
  display: "inline-block", fontSize: 10.5, fontWeight: 700,
  letterSpacing: ".02em", padding: "3px 7px", whiteSpace: "nowrap",
};

/* The detail panel scrolls independently of the list. `100vh - 150` clears the
   header and the criteria block above it; the panel is sticky, so without a
   height cap a long provenance stack would run past the fold with no way to
   reach its end. */
const detailScroll: CSSProperties = {
  maxHeight: "calc(100vh - 150px)",
  overflowY: "auto",
  paddingRight: 4,
};

const noRows: CSSProperties = {
  padding: "26px 14px", border: `1px solid ${T.border}`, background: T.white,
  fontSize: 12.5, color: T.muted, lineHeight: 1.6,
};

const hashLine: CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: 11.5, color: T.muted, wordBreak: "break-all",
};

const caption: CSSProperties = { fontSize: 11.5, color: T.muted2, lineHeight: 1.6 };
