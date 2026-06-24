/**
 * Atlas-MOBILE — FILES (data room) screen (frame 06).
 *
 * Mobile re-lay of the desktop sibling (desktop/screens/Files.tsx). SAME data
 * layer (useMobileDataRoom(view.dealId)), SAME honest states — re-laid for a
 * single narrow column instead of the desktop sub-list + viewer split:
 *
 *   • Folder LANES — a full-bleed horizontal scroll row of folder chips with the
 *     REAL per-folder document counts (drives the active filter). "All files" +
 *     an "Unfiled" lane only when the room has documents outside any folder.
 *   • Recent-docs LIST — the active folder's documents as tap rows. Each opens
 *     via the existing endpoint GET /api/data-room/documents/:id/download
 *     (auth-safe fetch→blob→open inline, copied verbatim from the desktop sibling).
 *   • "+ Upload" drives room.uploadFile into the open folder (or root).
 *
 * Honesty: every value is a real hook field or an honest "—" (fmtDate/status).
 * Render loading / empty / error. NO demo literals (Project Atlas, the 42/31
 * counts, the "Master_SPA_v7.pdf" row). NO faked cited-clause / page anchor —
 * the design's "CLAUSE 7.3" + "p.12/88" are layout placeholders the data can't
 * back, so they are never ported. Version / Working-Paper provenance render ONLY
 * when the document actually carries them.
 *
 * Shell contract: this screen returns BODY ONLY. The shell renders the header
 * (variant B back-bar), the scroll area + bottom-nav clearance, and the FAB.
 */
import { useCallback, useMemo, useRef, useState } from "react";
import type { AtlasScreenProps } from "../../desktop/atlasNav";
import { useAtlasNav } from "../../desktop/atlasNav";
import {
  useMobileDataRoom,
  type MobileDataRoomDocument,
  type MobileDataRoomFolder,
} from "../../../../hooks/useMobileDataRoom";
import { authHeaders } from "../../../../hooks/useAuth";
import { T } from "../../desktop/atlasTokens";
import { RT } from "../redesign/rt";
import {
  MarkBadge,
  Pill,
  EmptyState,
  LoadingState,
} from "../../desktop/primitives";
import {
  ChevronRightIcon,
  FolderIcon,
  PlusIcon,
} from "../../desktop/icons";
import { ListSection, ListRow } from "../iosKit";
import { DetailSection, Divider } from "../redesign/kit";

/* ─── scope ───────────────────────────────────────────────────
 * The design's scope segments (My files / Shared / Data room · DD) select the
 * "Data room · DD" segment. The data layer carries NO per-document owner or
 * share-status field, so "My files" / "Shared" can't be honestly backed — an
 * inert toggle that filters nothing would mislead. We surface the one real
 * scope as a static label instead. */
const ACTIVE_SCOPE_LABEL = "Data room · Due diligence";

type FolderKey = "all" | "unfiled" | number;

/* ─── status pill tone ────────────────────────────────────── */

function statusTone(status: string | null | undefined): { label: string; bg: string; fg: string } {
  const raw = (status || "").trim();
  const s = raw.toLowerCase();
  if (!raw) return { label: "—", bg: RT.line, fg: RT.muted };
  if (/approv|final|complete|signed|executed|ready/.test(s)) {
    return { label: titleCase(raw), bg: T.greenBg, fg: T.green };
  }
  if (/review|pending|progress|draft|generating/.test(s)) {
    return { label: titleCase(raw), bg: T.amberBg, fg: T.amber };
  }
  if (/reject|fail|error|stale|expired/.test(s)) {
    return { label: titleCase(raw), bg: T.terraBg, fg: T.terra };
  }
  return { label: titleCase(raw), bg: RT.line, fg: RT.muted };
}

function titleCase(s: string): string {
  const t = s.replace(/[_-]+/g, " ").trim();
  if (!t) return s;
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function fileTypeLabel(ft: string | null | undefined): string {
  const t = (ft || "").trim();
  return t ? t.toUpperCase() : "FILE";
}

/* ─── auth-safe download / open (copied from the desktop sibling) ──
 * The backend streams inline (or redirects to a presigned URL), so window.open
 * with an auth header isn't possible — fetch→blob→objectURL is the auth-safe
 * path. We open the blob inline in a new tab and revoke the URL on a delay so
 * the tab has time to load. */
async function openDataRoomDocument(docId: number): Promise<string | null> {
  const res = await fetch(`/api/data-room/documents/${docId}/download`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload?.error || `Couldn’t open this file (HTTP ${res.status})`);
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

/* ─── folder lane chip ────────────────────────────────────── */

function FolderChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number | null;
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
        gap: 8,
        cursor: "pointer",
        padding: "12px 13px",
        borderRadius: 14,
        fontFamily: T.font,
        textAlign: "left",
        minWidth: 122,
        background: RT.card,
      }}
    >
      <span
        style={{
          width: 34,
          height: 34,
          flex: "none",
          borderRadius: 10,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: active ? RT.accentSoft : RT.line,
        }}
      >
        <FolderIcon size={19} c={active ? RT.accent : RT.muted} />
      </span>
      <span style={{ minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontSize: 13.5,
            fontWeight: 600,
            color: active ? RT.accent : RT.ink,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 130,
          }}
        >
          {label}
        </span>
        <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: active ? RT.accent : RT.muted, marginTop: 1 }}>
          {count == null ? "—" : count === 1 ? "1 file" : `${count} files`}
        </span>
      </span>
    </button>
  );
}

/* ─── document tap row ────────────────────────────────────── */

function DocRow({
  doc,
  opening,
  onOpen,
}: {
  doc: MobileDataRoomDocument;
  opening: boolean;
  onOpen: () => void;
}) {
  const tone = statusTone(doc.status);
  return (
    <ListRow
      leading={
        <span style={S.thumb}>{fileTypeLabel(doc.file_type).slice(0, 4)}</span>
      }
      title={doc.name || "Untitled"}
      subtitle={`${fileTypeLabel(doc.file_type)}${doc.version != null ? ` · v${doc.version}` : ""} · Updated ${fmtDate(doc.updated_at)}`}
      trailing={
        <Pill bg={tone.bg} fg={tone.fg} style={{ flex: "none", opacity: opening ? 0.5 : 1 }}>
          {tone.label}
        </Pill>
      }
      onClick={opening ? undefined : onOpen}
    />
  );
}

const S: { thumb: React.CSSProperties } = {
  // File-type thumb — the doc's REAL type, no faked "PDF" literal.
  thumb: {
    width: 30,
    height: 36,
    flex: "none",
    borderRadius: 6,
    background: RT.line,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 8,
    fontWeight: 700,
    color: RT.muted,
    letterSpacing: ".02em",
  },
};

/* ─── the screen ──────────────────────────────────────────── */

export default function FilesMobileScreen({ view }: AtlasScreenProps) {
  const nav = useAtlasNav();
  const dealId = view.dealId ?? null;
  const room = useMobileDataRoom(dealId);

  const [folderKey, setFolderKey] = useState<FolderKey>("all");
  const [openingId, setOpeningId] = useState<number | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Per-folder document counts (drive the lane badges).
  const counts = useMemo(() => {
    const byFolder = new Map<number, number>();
    let unfiled = 0;
    const folderIds = new Set(room.folders.map((f) => f.id));
    for (const doc of room.documents) {
      if (doc.folder_id != null && folderIds.has(doc.folder_id)) {
        byFolder.set(doc.folder_id, (byFolder.get(doc.folder_id) ?? 0) + 1);
      } else {
        unfiled += 1;
      }
    }
    return { byFolder, unfiled };
  }, [room.folders, room.documents]);

  // Documents shown in the active folder.
  const visibleDocs = useMemo(() => {
    if (folderKey === "all") return room.documents;
    if (folderKey === "unfiled") {
      const folderIds = new Set(room.folders.map((f) => f.id));
      return room.documents.filter(
        (d) => d.folder_id == null || !folderIds.has(d.folder_id),
      );
    }
    return room.documents.filter((d) => d.folder_id === folderKey);
  }, [folderKey, room.documents, room.folders]);

  const activeFolderName = useMemo(() => {
    if (folderKey === "all") return "All files";
    if (folderKey === "unfiled") return "Unfiled";
    return room.folders.find((f) => f.id === folderKey)?.name ?? "Folder";
  }, [folderKey, room.folders]);

  const handleOpen = useCallback(async (doc: MobileDataRoomDocument) => {
    setOpenError(null);
    setOpeningId(doc.id);
    try {
      const url = await openDataRoomDocument(doc.id);
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
        // Give the new tab time to read the blob before revoking.
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      }
    } catch (err: any) {
      setOpenError(err?.message || "Couldn’t open this file");
    } finally {
      setOpeningId(null);
    }
  }, []);

  const selectFolder = useCallback((key: FolderKey) => {
    setFolderKey(key);
    setOpenError(null);
  }, []);

  // Upload a raw file into the room — into the open folder when one is selected,
  // otherwise root/unfiled. Additive (creates a data_room_document); not an
  // irreversible/regulated action, so no staged-action confirm is required.
  const handleUploadPick = useCallback(
    async (file: File | null | undefined) => {
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
    },
    [folderKey, room],
  );

  // ── No deal context: nothing to scope a data room to ──────────────
  if (dealId == null) {
    return (
      <div style={padX}>
        <EmptyState accent={RT.accent} onAccent={RT.onAccent}
          title="Open a deal to see its data room"
          hint="The data room organizes a single deal’s documents into review folders. Open a deal from Deals or Pipeline to file, review, and download its files."
          cta="Go to Deals"
          onCta={() => nav.go("deals")}
        />
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────
  if (room.loading) {
    return (
      <div style={padX}>
        <LoadingState label="Loading data room…" />
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────
  if (room.error) {
    return (
      <div style={padX}>
        <EmptyState accent={RT.accent} onAccent={RT.onAccent}
          title="Couldn’t load the data room"
          hint={room.error}
          cta="Retry"
          onCta={() => void room.refresh()}
        />
      </div>
    );
  }

  const dealLabel = view.dealName || room.dealName || "Deal";

  // ── Loaded ────────────────────────────────────────────────────────
  return (
    <div style={padX}>
      {/* Breadcrumb + scope + Upload */}
      <div style={{ paddingTop: 6, paddingBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <MarkBadge letter={(dealLabel || "?").slice(0, 1)} size={24} radius={7} />
          <span style={{ fontSize: 18, fontWeight: 600, color: RT.ink }}>Files</span>
          <ChevronRightIcon size={16} c={RT.faint} />
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: RT.muted,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {dealLabel}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Scope label — non-interactive (no honest owner/share field). */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: RT.accentSoft,
              borderRadius: T.rPill,
              padding: "7px 13px",
              fontSize: 14,
              fontWeight: 600,
              color: RT.accentInk,
            }}
          >
            {ACTIVE_SCOPE_LABEL}
          </span>
          <span style={{ flex: 1 }} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              borderRadius: T.rPill,
              background: RT.card,
              cursor: uploading ? "default" : "pointer",
              fontFamily: T.font,
              fontSize: 14,
              fontWeight: 700,
              color: RT.accentInk,
              padding: "7px 13px",
              opacity: uploading ? 0.6 : 1,
            }}
          >
            <PlusIcon size={16} c={RT.accentInk} /> {uploading ? "Uploading…" : "Upload"}
          </button>
          {/* Hidden picker — drives room.uploadFile into the open folder (or root). */}
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              void handleUploadPick(file);
              // Reset so re-picking the same file fires onChange again.
              e.target.value = "";
            }}
          />
        </div>

        {uploadError && (
          <div
            style={{
              marginTop: 10,
              background: T.terraBg,
              borderRadius: 10,
              padding: "9px 12px",
              fontSize: 13.5,
              color: T.terra,
              lineHeight: 1.4,
            }}
          >
            {uploadError}
          </div>
        )}
      </div>

      {/* Empty data room — no documents at all */}
      {room.documents.length === 0 ? (
        <EmptyState accent={RT.accent} onAccent={RT.onAccent}
          title="No documents in the data room yet"
          hint="Generate a deliverable or upload files and Yulia will file them into review folders. Ask Yulia to draft what you need."
        />
      ) : (
        <>
          {/* Folder LANES — full-bleed horizontal scroll row, real counts */}
          <div
            className="scr"
            style={{
              display: "flex",
              gap: 9,
              overflowX: "auto",
              margin: "0 -18px 18px",
              padding: "2px 18px",
            }}
          >
            <FolderChip
              label="All files"
              count={room.documents.length}
              active={folderKey === "all"}
              onClick={() => selectFolder("all")}
            />
            {room.folders.map((f: MobileDataRoomFolder) => (
              <FolderChip
                key={f.id}
                label={f.name}
                count={counts.byFolder.get(f.id) ?? 0}
                active={folderKey === f.id}
                onClick={() => selectFolder(f.id)}
              />
            ))}
            {counts.unfiled > 0 && (
              <FolderChip
                label="Unfiled"
                count={counts.unfiled}
                active={folderKey === "unfiled"}
                onClick={() => selectFolder("unfiled")}
              />
            )}
          </div>

          <Divider />

          {/* Active-folder documents — big bold detail header (Cash App pattern) */}
          <DetailSection
            title={activeFolderName}
            desc="Documents filed in this folder. Tap a row to open one."
          >
            {/* Open error — surfaced above the list so a tap failure is visible. */}
            {openError && (
              <div
                style={{
                  marginTop: 10,
                  background: T.terraBg,
                  borderRadius: 10,
                  padding: "9px 12px",
                  fontSize: 13.5,
                  color: T.terra,
                  lineHeight: 1.4,
                }}
              >
                {openError}
              </div>
            )}

            {/* Document list — or an honest per-folder empty */}
            {visibleDocs.length === 0 ? (
              <div style={{ marginTop: 14 }}>
                <EmptyState accent={RT.accent} onAccent={RT.onAccent}
                  title="This folder is empty"
                  hint="No documents are filed here yet. Pick another folder, or ask Yulia to file a deliverable into it."
                />
              </div>
            ) : (
              <ListSection style={{ marginTop: 14, marginBottom: 4 }}>
                {visibleDocs.map((doc) => (
                  <DocRow
                    key={doc.id}
                    doc={doc}
                    opening={openingId === doc.id}
                    onOpen={() => void handleOpen(doc)}
                  />
                ))}
              </ListSection>
            )}
          </DetailSection>
        </>
      )}
    </div>
  );
}

/* ─── horizontal-pad root (shell owns vertical scroll + nav clearance) ── */

const padX: React.CSSProperties = {
  padding: "0 18px",
};
