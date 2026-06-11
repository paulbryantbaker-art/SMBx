import { useCallback, useEffect, useRef, useState } from "react";
import { authHeaders } from "./useAuth";

/* Mobile data-room read hook — the mobile-parity twin of the desktop
   `loadDealDataRoom(dealId)` in useV6WorkspaceData.ts. Fetches the REAL
   data room for a deal and returns folders + documents grouped by folder.
   Mirrors the DealDataRoom / DataRoomFolder / DataRoomDocument response
   typing 1:1 so the mobile LibraryDetail screen renders the same backend
   data the desktop DealView scope rail does, instead of sample rows.

   No fetch happens when `dealId` is null (anon / no-deal context). In that
   case the screen keeps its sample experience. */

export interface MobileDataRoomFolder {
  id: number;
  name: string;
  gate: string | null;
  sort_order: number;
}

export interface MobileDataRoomDocument {
  id: number;
  folder_id: number | null;
  name: string;
  file_type: string;
  status: string;
  version?: number;
  deliverable_id: number | null;
  created_at: string;
  updated_at: string;
  deliverable_status?: string | null;
  deliverable_completed_at?: string | null;
  deliverable_is_stale?: boolean | null;
  deliverable_stale_reason?: string | null;
  deliverable_folder_category?: string | null;
  /* Working Paper provenance — the model execution the deliverable was
     generated from (server-side lateral join on model_executions). Present
     only when the document's deliverable snapshot matches a real signed run.
     `model_output_hash` is the REAL substrate hash; never fabricated. */
  model_execution_id?: number | null;
  model_execution_type?: string | null;
  model_execution_title?: string | null;
  model_execution_version_number?: number | null;
  model_output_hash?: string | null;
  model_input_hash?: string | null;
  model_execution_created_at?: string | null;
}

/** A deliverable that exists for the deal but has NOT yet been filed into the
 *  data room. The backend returns these only to the deal owner. Filing one
 *  (POST /data-room/file) creates a data_room_document that references it. */
export interface MobileUnfiledDeliverable {
  id: number;
  status: string;
  created_at: string;
  completed_at?: string | null;
  name: string;
  slug?: string | null;
  tier?: string | null;
  gate?: string | null;
  journey?: string | null;
}

interface DealDataRoomResponse {
  folders?: MobileDataRoomFolder[];
  documents?: MobileDataRoomDocument[];
  unfiledDeliverables?: MobileUnfiledDeliverable[];
  ndaRequired?: boolean;
  ndaSigned?: boolean;
  dealName?: string;
  /** Latest completed CIM-family deliverable for the deal — share-link
   *  creation is anchored to it. null when no CIM has been generated yet. */
  livingCimId?: number | null;
}

/** One folder plus the documents filed under it. Documents whose folder_id
 *  doesn't match any returned folder (or is null) collect under a synthetic
 *  "Unfiled" group so nothing real is silently dropped. */
export interface MobileDataRoomGroup {
  folder: MobileDataRoomFolder | null;
  documents: MobileDataRoomDocument[];
}

export interface MobileDataRoomState {
  loading: boolean;
  error: string | null;
  dealName: string | null;
  folders: MobileDataRoomFolder[];
  documents: MobileDataRoomDocument[];
  /** Documents grouped by folder, in folder sort order, unfiled last. */
  groups: MobileDataRoomGroup[];
  /** Deliverables generated for the deal that haven't been filed into the room
   *  yet (owner-only). Empty in the read-only / non-owner case. */
  unfiledDeliverables: MobileUnfiledDeliverable[];
  /** The deal's living CIM (latest completed CIM-family deliverable), or null
   *  when none exists yet. Share-link CREATE is gated on this. */
  livingCimId: number | null;
  /** Re-fetch the data room from the backend. Resolves once state is updated. */
  refresh: () => Promise<void>;
  /** File an existing deliverable into the room (optionally into a folder).
   *  Refreshes the room on success. Throws on failure. */
  fileToRoom: (deliverableId: number, folderId?: number | null) => Promise<unknown>;
  /** Upload a raw file (multipart). Refreshes the room on success. Throws on
   *  failure. `folderId` null files into root/unfiled. */
  uploadFile: (file: File, folderId?: number | null, docClass?: string) => Promise<unknown>;
  /** Advance a document's lifecycle status. Refreshes on success. Throws (with
   *  the backend's message) when the transition is rejected. */
  setDocStatus: (docId: number, status: string) => Promise<unknown>;
}

function groupByFolder(
  folders: MobileDataRoomFolder[],
  documents: MobileDataRoomDocument[],
): MobileDataRoomGroup[] {
  const sorted = [...folders].sort((a, b) => a.sort_order - b.sort_order);
  const byFolder = new Map<number, MobileDataRoomDocument[]>();
  const unfiled: MobileDataRoomDocument[] = [];
  for (const doc of documents) {
    if (doc.folder_id != null && folders.some(f => f.id === doc.folder_id)) {
      const list = byFolder.get(doc.folder_id) ?? [];
      list.push(doc);
      byFolder.set(doc.folder_id, list);
    } else {
      unfiled.push(doc);
    }
  }
  const groups: MobileDataRoomGroup[] = sorted
    .map(folder => ({ folder, documents: byFolder.get(folder.id) ?? [] }))
    .filter(group => group.documents.length > 0);
  if (unfiled.length > 0) groups.push({ folder: null, documents: unfiled });
  return groups;
}

/** The data-only slice of state the loader writes. The hook wraps this with the
 *  stable mutation/refresh callbacks before returning it to consumers. */
type DataRoomData = Pick<
  MobileDataRoomState,
  "loading" | "error" | "dealName" | "folders" | "documents" | "groups" | "unfiledDeliverables" | "livingCimId"
>;

const EMPTY_DATA: DataRoomData = {
  loading: false,
  error: null,
  dealName: null,
  folders: [],
  documents: [],
  groups: [],
  unfiledDeliverables: [],
  livingCimId: null,
};

/** Parse a fetch Response, throwing the backend `error` string when present so
 *  the UI can surface a real message instead of a bare HTTP code. */
async function readJsonOrThrow(res: Response): Promise<any> {
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload?.error || `HTTP ${res.status}`);
  return payload;
}

export function useMobileDataRoom(dealId: number | null): MobileDataRoomState {
  const [data, setData] = useState<DataRoomData>(() => ({
    ...EMPTY_DATA,
    loading: dealId != null,
  }));
  // Tracks the latest in-flight load so a stale fetch can't clobber a newer one.
  const loadSeq = useRef(0);

  const load = useCallback(async (): Promise<void> => {
    if (dealId == null) {
      loadSeq.current += 1;
      setData({ ...EMPTY_DATA });
      return;
    }
    const seq = ++loadSeq.current;
    setData(s => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch(`/api/deals/${dealId}/data-room`, { headers: authHeaders() });
      const payload = (await readJsonOrThrow(res)) as DealDataRoomResponse;
      if (seq !== loadSeq.current) return; // superseded
      const folders = payload.folders ?? [];
      const documents = payload.documents ?? [];
      setData({
        loading: false,
        error: null,
        dealName: payload.dealName ?? null,
        folders,
        documents,
        groups: groupByFolder(folders, documents),
        unfiledDeliverables: payload.unfiledDeliverables ?? [],
        livingCimId: payload.livingCimId ?? null,
      });
    } catch (err: any) {
      if (seq !== loadSeq.current) return;
      setData({ ...EMPTY_DATA, error: err?.message || "Failed to load data room" });
    }
  }, [dealId]);

  useEffect(() => {
    void load();
    return () => { loadSeq.current += 1; }; // cancel any in-flight load on unmount/dep change
  }, [load]);

  const refresh = useCallback(() => load(), [load]);

  const fileToRoom = useCallback(
    async (deliverableId: number, folderId?: number | null) => {
      if (dealId == null) throw new Error("No deal context");
      const res = await fetch(`/api/deals/${dealId}/data-room/file`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ deliverableId, folderId: folderId ?? null }),
      });
      const payload = await readJsonOrThrow(res);
      await load();
      return payload;
    },
    [dealId, load],
  );

  const uploadFile = useCallback(
    async (file: File, folderId?: number | null, docClass?: string) => {
      if (dealId == null) throw new Error("No deal context");
      const form = new FormData();
      form.append("file", file);
      if (folderId != null) form.append("folderId", String(folderId));
      if (docClass) form.append("docClass", docClass);
      // NOTE: do not set Content-Type — the browser sets the multipart boundary.
      const res = await fetch(`/api/data-room/${dealId}/upload`, {
        method: "POST",
        headers: authHeaders(),
        body: form,
      });
      const payload = await readJsonOrThrow(res);
      await load();
      return payload;
    },
    [dealId, load],
  );

  const setDocStatus = useCallback(
    async (docId: number, status: string) => {
      const res = await fetch(`/api/data-room/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ status }),
      });
      const payload = await readJsonOrThrow(res);
      await load();
      return payload;
    },
    [load],
  );

  return { ...data, refresh, fileToRoom, uploadFile, setDocStatus };
}
