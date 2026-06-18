/**
 * Atlas — FILES (data room) screen (isApp, 198px "DATA ROOM" sub-list + detail).
 *
 * DATA ROOM sub-list = REAL folders from useMobileDataRoom(dealId).folders
 *                      (label = folder.name, badge = # documents filed under it).
 *                      "All files" pseudo-folder on top; an "Unfiled" group when
 *                      the room has documents that don't match a folder.
 * Detail header       = breadcrumb (dealName › Files) + a non-interactive
 *                      scope label "Data room · Due diligence". The design's
 *                      My files / Shared with team segments aren't honestly
 *                      backable (no per-doc owner/share field), so they're
 *                      collapsed to the one real scope rather than shown inert.
 *                      "+ Upload" in the sub-list header drives room.uploadFile.
 * Document toolbar    = selected document name + status Pill (In review/Approved
 *                      colored) + "· v{n}" version ONLY when the doc carries one.
 *                      The "p.n / N" page counter is rendered ONLY if the doc has
 *                      real page metadata — the hook returns none, so it is omitted
 *                      (NEVER a fabricated "p.12 / 88").
 * Viewer              = the selected document's REAL metadata (type, status,
 *                      version, dates, model-execution provenance when present)
 *                      + Download → GET /api/data-room/documents/:id/download
 *                      (auth-safe fetch→blob→open inline / anchor download).
 *
 * Cited-clause highlight (page-anchored §7.3 box) is a GAP — no page-anchored
 * citation lives in this data. It is rendered ONLY when a real citation is present
 * on the document; otherwise the document is shown without a clause box. The
 * prototype's "CLAUSE 7.3 — CHANGE OF CONTROL" is a layout placeholder, never ported.
 *
 * Honesty: every value is a real hook field or an honest "—" / empty / loading /
 * error state. No demo literals (Project Atlas, the SPA, the 42/31 counts).
 */
import { useCallback, useMemo, useRef, useState } from "react";
import type { AtlasScreenProps } from "../atlasNav";
import { useAtlasNav } from "../atlasNav";
import {
  useMobileDataRoom,
  type MobileDataRoomDocument,
  type MobileDataRoomFolder,
} from "../../../../hooks/useMobileDataRoom";
import { authHeaders } from "../../../../hooks/useAuth";
import { T } from "../atlasTokens";
import {
  MarkBadge,
  Pill,
  EmptyState,
  LoadingState,
  Sparkle,
} from "../primitives";
import { ChevronRightIcon, DownloadIcon, PlusIcon } from "../icons";

/* ─── scope ───────────────────────────────────────────────────
 * The design's scope toggle (My files / Shared with team / Data room ·
 * Due diligence) selects the 3rd ("Data room · Due diligence") segment.
 * The data layer carries NO per-document owner or share-status field, so
 * "My files" and "Shared with team" cannot be honestly backed — an inert
 * toggle that animates but filters nothing (and implies sharing the screen
 * cannot deliver) would be misleading. We render the selected scope as a
 * non-interactive label instead. */
const ACTIVE_SCOPE_LABEL = "Data room · Due diligence";

/* ─── status pill tone ────────────────────────────────────── */

function statusTone(status: string | null | undefined): { label: string; bg: string; fg: string } {
  const raw = (status || "").trim();
  const s = raw.toLowerCase();
  if (!raw) return { label: "—", bg: T.track, fg: T.muted2 };
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

function titleCase(s: string): string {
  const t = s.replace(/[_-]+/g, " ").trim();
  if (!t) return s;
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function fileTypeLabel(ft: string | null | undefined): string {
  const t = (ft || "").trim();
  return t ? t.toUpperCase() : "FILE";
}

/* ─── auth-safe download / open ───────────────────────────────
 * The backend streams the file inline (or redirects to a presigned S3 URL), so
 * window.open with an auth header isn't possible — fetch→blob→objectURL is the
 * auth-safe path. We open the blob inline in a new tab (the design shows a viewer)
 * and revoke the URL on a delay so the tab has time to load. */
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

/* ─── sub-list folder row ─────────────────────────────────── */

function FolderRow({
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
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "100%",
        textAlign: "left",
        border: "none",
        cursor: "pointer",
        padding: "9px 11px",
        borderRadius: 9,
        fontFamily: T.font,
        fontSize: 13.5,
        fontWeight: active ? 600 : 500,
        background: active ? T.navActive : "transparent",
        color: active ? T.blue : T.ink3,
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = T.tabHover;
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      <span
        style={{
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      {count != null && (
        <span
          style={{
            flex: "none",
            fontSize: 11,
            fontWeight: 600,
            borderRadius: T.rPill,
            padding: "2px 8px",
            background: active ? T.blueBg : T.track,
            color: active ? T.blue : T.muted2,
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/* ─── document list row ───────────────────────────────────── */

function DocRow({
  doc,
  active,
  onClick,
}: {
  doc: MobileDataRoomDocument;
  active: boolean;
  onClick: () => void;
}) {
  const tone = statusTone(doc.status);
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        width: "100%",
        textAlign: "left",
        border: "none",
        borderBottom: `1px solid ${T.rowDiv}`,
        cursor: "pointer",
        padding: "11px 18px",
        fontFamily: T.font,
        background: active ? T.blueBg3 : "transparent",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = T.hover;
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      <MarkBadge letter={fileTypeLabel(doc.file_type).slice(0, 1)} size={28} radius={7} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 600,
            color: T.ink,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {doc.name || "Untitled"}
        </div>
        <div style={{ fontSize: 12, color: T.muted2, marginTop: 2 }}>
          {fileTypeLabel(doc.file_type)}
          {doc.version != null ? ` · v${doc.version}` : ""} · Updated {fmtDate(doc.updated_at)}
        </div>
      </div>
      <Pill bg={tone.bg} fg={tone.fg} style={{ flex: "none" }}>
        {tone.label}
      </Pill>
    </button>
  );
}

/* ─── viewer metadata row ─────────────────────────────────── */

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "11px 0",
        borderBottom: `1px solid ${T.rowDiv2}`,
        fontSize: 13.5,
      }}
    >
      <span style={{ width: 150, flex: "none", color: T.muted2, fontWeight: 500 }}>{label}</span>
      <span style={{ flex: 1, minWidth: 0, color: T.ink }}>{value}</span>
    </div>
  );
}

/* ─── the screen ──────────────────────────────────────────── */

export default function FilesScreen({ view }: AtlasScreenProps) {
  const nav = useAtlasNav();
  const dealId = view.dealId ?? null;
  const room = useMobileDataRoom(dealId);

  // The active folder filter: "all" | folder.id | "unfiled".
  const [folderKey, setFolderKey] = useState<"all" | "unfiled" | number>("all");
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [opening, setOpening] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Per-folder document counts (drive the sub-list badges).
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

  const selectedDoc = useMemo(
    () => room.documents.find((d) => d.id === selectedDocId) ?? null,
    [room.documents, selectedDocId],
  );

  const handleOpen = useCallback(
    async (doc: MobileDataRoomDocument) => {
      setSelectedDocId(doc.id);
      setOpenError(null);
      setOpening(true);
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
        setOpening(false);
      }
    },
    [],
  );

  const selectFolder = useCallback((key: "all" | "unfiled" | number) => {
    setFolderKey(key);
    setSelectedDocId(null);
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
      <div style={rootStyle}>
        <EmptyState
          title="Open a deal to see its data room"
          hint="The data room organizes a single deal’s documents into review folders. Open a deal from Deals or Pipeline to file, review, and share its files."
          cta="Go to Deals"
          onCta={() => nav.go("deals")}
        />
      </div>
    );
  }

  const dealLabel = view.dealName || room.dealName || "Deal";

  // ── Loading ───────────────────────────────────────────────────────
  if (room.loading) {
    return (
      <div style={rootStyle}>
        <LoadingState label="Loading data room…" />
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────
  if (room.error) {
    return (
      <div style={rootStyle}>
        <EmptyState
          title="Couldn’t load the data room"
          hint={room.error}
          cta="Retry"
          onCta={() => void room.refresh()}
        />
      </div>
    );
  }

  // ── Loaded: 198px sub-list + detail ───────────────────────────────
  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", overflow: "hidden" }}>
      {/* Master sub-list — DATA ROOM folders */}
      <div
        style={{
          width: 198,
          flex: "none",
          borderRight: `1px solid ${T.hair}`,
          background: T.white,
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
          padding: "14px 9px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 7px 10px",
          }}
        >
          <span style={{ fontSize: 11.5, fontWeight: 700, color: T.muted2, letterSpacing: ".05em" }}>
            DATA ROOM
          </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              border: "none",
              background: "transparent",
              cursor: uploading ? "default" : "pointer",
              fontFamily: T.font,
              fontSize: 12,
              fontWeight: 600,
              color: T.blue,
              padding: 0,
              opacity: uploading ? 0.6 : 1,
            }}
          >
            <PlusIcon size={13} c={T.blue} /> {uploading ? "Uploading…" : "Upload"}
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
              margin: "0 4px 8px",
              background: T.terraBg,
              borderRadius: 8,
              padding: "8px 10px",
              fontSize: 12,
              color: T.terra,
              lineHeight: 1.4,
            }}
          >
            {uploadError}
          </div>
        )}

        <FolderRow
          label="All files"
          count={room.documents.length}
          active={folderKey === "all"}
          onClick={() => selectFolder("all")}
        />
        {room.folders.map((f: MobileDataRoomFolder) => {
          const n = counts.byFolder.get(f.id) ?? 0;
          return (
            <FolderRow
              key={f.id}
              label={f.name}
              // Hide the badge on empty folders — a "0" pill reads as noise.
              count={n > 0 ? n : null}
              active={folderKey === f.id}
              onClick={() => selectFolder(f.id)}
            />
          );
        })}
        {counts.unfiled > 0 && (
          <FolderRow
            label="Unfiled"
            count={counts.unfiled}
            active={folderKey === "unfiled"}
            onClick={() => selectFolder("unfiled")}
          />
        )}
      </div>

      {/* Detail */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Breadcrumb + scope */}
        <div style={{ padding: "14px 18px 12px", flex: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
            <MarkBadge letter={(dealLabel || "?").slice(0, 1)} size={24} radius={7} />
            <span style={{ fontSize: 15, fontWeight: 600, color: T.ink }}>{dealLabel}</span>
            <ChevronRightIcon size={15} c={T.faint} />
            <span style={{ fontSize: 13.5, color: T.muted }}>Files</span>
          </div>
          {/* Scope label — non-interactive. The data layer has no owner/share
              field, so "My files" / "Shared with team" can't be honestly
              backed; we surface only the real scope rather than an inert toggle. */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: T.track,
              borderRadius: T.rPill,
              padding: "6px 14px",
              fontSize: 12.5,
              fontWeight: 600,
              color: T.ink,
            }}
          >
            {ACTIVE_SCOPE_LABEL}
          </span>
        </div>

        {/* Body: document list + viewer */}
        {room.documents.length === 0 ? (
          <EmptyState
            title="No documents in the data room yet"
            hint="Generate a deliverable or upload files and Yulia will file them into review folders. Ask Yulia to draft what you need."
          />
        ) : visibleDocs.length === 0 ? (
          <EmptyState
            title="This folder is empty"
            hint="No documents are filed here yet. Pick another folder, or ask Yulia to file a deliverable into it."
          />
        ) : (
          <div style={{ flex: 1, minWidth: 0, display: "flex", overflow: "hidden" }}>
            {/* Document list */}
            <div
              style={{
                width: 360,
                flex: "none",
                borderRight: `1px solid ${T.hair}`,
                overflow: "auto",
              }}
            >
              {visibleDocs.map((doc) => (
                <DocRow
                  key={doc.id}
                  doc={doc}
                  active={doc.id === selectedDocId}
                  onClick={() => setSelectedDocId(doc.id)}
                />
              ))}
            </div>

            {/* Viewer */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {selectedDoc ? (
                <DocViewer
                  doc={selectedDoc}
                  opening={opening}
                  openError={openError}
                  onOpen={() => void handleOpen(selectedDoc)}
                />
              ) : (
                <EmptyState
                  title="Select a document"
                  hint="Choose a file from the list to see its details and open it."
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── viewer ──────────────────────────────────────────────── */

function DocViewer({
  doc,
  opening,
  openError,
  onOpen,
}: {
  doc: MobileDataRoomDocument;
  opening: boolean;
  openError: string | null;
  onOpen: () => void;
}) {
  const tone = statusTone(doc.status);
  const hasProvenance = doc.model_execution_id != null && doc.model_output_hash;

  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Document toolbar / status bar */}
      <div
        style={{
          minHeight: 46,
          flex: "none",
          borderBottom: `1px solid ${T.hair}`,
          padding: "0 18px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            fontSize: 13.5,
            fontWeight: 600,
            color: T.ink,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {doc.name || "Untitled"}
        </span>
        <Pill bg={tone.bg} fg={tone.fg} style={{ flex: "none" }}>
          {tone.label}
        </Pill>
        <span style={{ flex: 1 }} />
        {/* Open error surfaces next to the button so a user who hasn't scrolled
            the viewer body still sees why the open failed. */}
        {openError && (
          <span
            style={{
              fontSize: 12,
              color: T.terra,
              flex: "none",
              maxWidth: 220,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={openError}
          >
            {openError}
          </span>
        )}
        {/* "p.n / N" page counter is OMITTED — the hook carries no page metadata.
            We never fabricate "p.12 / 88". Version is real when present. */}
        {doc.version != null && (
          <span style={{ fontSize: 12.5, color: T.muted2, flex: "none" }}>v{doc.version}</span>
        )}
        <button
          type="button"
          onClick={onOpen}
          disabled={opening}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            border: "none",
            borderRadius: T.rPill,
            padding: "7px 14px",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: T.font,
            cursor: opening ? "default" : "pointer",
            background: T.blueBg,
            color: T.blue,
            opacity: opening ? 0.6 : 1,
            flex: "none",
          }}
        >
          <DownloadIcon size={15} c={T.blue} />
          {opening ? "Opening…" : "Download"}
        </button>
      </div>

      {/* Metadata "viewer" — the document's REAL fields. No page-anchored clause
          box is rendered because no real page-anchored citation exists in this data. */}
      <div style={{ flex: 1, overflow: "auto", background: T.track, padding: "26px 0", display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: 540,
            maxWidth: "92%",
            background: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: T.rCard,
            boxShadow: T.shCard,
            padding: "28px 30px",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 600, color: T.ink, letterSpacing: "-.01em" }}>
            {doc.name || "Untitled"}
          </div>
          <div style={{ marginTop: 18 }}>
            <MetaRow label="Status" value={<Pill bg={tone.bg} fg={tone.fg}>{tone.label}</Pill>} />
            <MetaRow label="File type" value={fileTypeLabel(doc.file_type)} />
            {doc.version != null && <MetaRow label="Version" value={`v${doc.version}`} />}
            <MetaRow label="Added" value={fmtDate(doc.created_at)} />
            <MetaRow label="Last updated" value={fmtDate(doc.updated_at)} />
            {doc.deliverable_id != null && (
              <MetaRow
                label="Source"
                value={
                  doc.deliverable_is_stale
                    ? `Generated deliverable · stale${doc.deliverable_stale_reason ? ` (${doc.deliverable_stale_reason})` : ""}`
                    : "Generated deliverable"
                }
              />
            )}
          </div>

          {/* Working-Paper provenance — REAL substrate run hash, only when present.
              This is the honest, data-backed analogue of a citation chip. */}
          {hasProvenance && (
            <div
              style={{
                marginTop: 18,
                background: T.blueBg3,
                border: `1px solid ${T.approvalBd}`,
                borderRadius: T.rCard,
                padding: "13px 15px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: T.blue,
                  letterSpacing: ".03em",
                  marginBottom: 7,
                }}
              >
                <Sparkle size={13} />
                WORKING PAPER PROVENANCE
              </div>
              {doc.model_execution_title && (
                <div style={{ fontSize: 13.5, color: T.ink, marginBottom: 4 }}>
                  {doc.model_execution_title}
                  {doc.model_execution_version_number != null
                    ? ` · v${doc.model_execution_version_number}`
                    : ""}
                </div>
              )}
              <div
                style={{
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: 11.5,
                  color: T.muted,
                  wordBreak: "break-all",
                }}
              >
                output {doc.model_output_hash}
              </div>
            </div>
          )}

          {openError && (
            <div
              style={{
                marginTop: 16,
                background: T.terraBg,
                borderRadius: 8,
                padding: "10px 13px",
                fontSize: 13,
                color: T.terra,
              }}
            >
              {openError}
            </div>
          )}

          <div style={{ marginTop: 20, fontSize: 12.5, color: T.muted2, lineHeight: 1.6 }}>
            Open the file to view its full contents. Inline preview opens in a new tab.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── shared root for the no-rail-detail states ───────────── */

const rootStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
  padding: "22px 24px",
};
