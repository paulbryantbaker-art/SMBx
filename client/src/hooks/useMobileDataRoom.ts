import { useEffect, useState } from "react";
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
}

interface DealDataRoomResponse {
  folders?: MobileDataRoomFolder[];
  documents?: MobileDataRoomDocument[];
  unfiledDeliverables?: unknown[];
  ndaRequired?: boolean;
  ndaSigned?: boolean;
  dealName?: string;
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

export function useMobileDataRoom(dealId: number | null): MobileDataRoomState {
  const [state, setState] = useState<MobileDataRoomState>({
    loading: dealId != null,
    error: null,
    dealName: null,
    folders: [],
    documents: [],
    groups: [],
  });

  useEffect(() => {
    if (dealId == null) {
      setState({ loading: false, error: null, dealName: null, folders: [], documents: [], groups: [] });
      return;
    }
    let cancelled = false;
    setState(s => ({ ...s, loading: true, error: null }));
    fetch(`/api/deals/${dealId}/data-room`, { headers: authHeaders() })
      .then(async res => {
        const payload = (await res.json().catch(() => ({}))) as DealDataRoomResponse;
        if (!res.ok) throw new Error((payload as any)?.error || `HTTP ${res.status}`);
        return payload;
      })
      .then(payload => {
        if (cancelled) return;
        const folders = payload.folders ?? [];
        const documents = payload.documents ?? [];
        setState({
          loading: false,
          error: null,
          dealName: payload.dealName ?? null,
          folders,
          documents,
          groups: groupByFolder(folders, documents),
        });
      })
      .catch(err => {
        if (cancelled) return;
        setState({
          loading: false,
          error: err?.message || "Failed to load data room",
          dealName: null,
          folders: [],
          documents: [],
          groups: [],
        });
      });
    return () => { cancelled = true; };
  }, [dealId]);

  return state;
}
