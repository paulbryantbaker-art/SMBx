import { useCallback, useEffect, useMemo, useState } from "react";
import { DEV_AUTH_BYPASS, authHeaders, type User } from "./useAuth";
import type { ModelPreference } from "../lib/modelPreference";

export interface WorkspaceDeal {
  id: number;
  business_name: string | null;
  industry: string | null;
  location: string | null;
  league: string | null;
  current_gate: string;
  journey_type: string;
  status: string;
  revenue: number | null;
  sde: number | null;
  ebitda: number | null;
  asking_price: number | null;
  financials: Record<string, any> | null;
  updated_at: string;
  created_at: string;
  deliverable_count?: number;
  document_count?: number;
  conversation_id?: number | null;
  seven_factor_composite?: number | null;
}

export interface WorkspaceDeliverable {
  id: number;
  deal_id: number;
  status: string;
  created_at: string;
  completed_at: string | null;
  updated_at?: string;
  slug: string;
  name: string;
  description?: string | null;
  tier?: string | null;
  journey?: string | null;
  gate?: string | null;
  deal_name?: string | null;
  journey_type?: string | null;
  league?: string | null;
  generation_model?: string | null;
}

export interface DataRoomFolder {
  id: number;
  name: string;
  gate: string | null;
  sort_order: number;
}

export interface DataRoomDocument {
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
}

export interface DealDataRoom {
  folders: DataRoomFolder[];
  documents: DataRoomDocument[];
  unfiledDeliverables: WorkspaceDeliverable[];
  ndaRequired?: boolean;
  ndaSigned?: boolean;
  dealName?: string;
}

export interface GenerateDeliverableInput {
  dealId: number;
  menuItemSlug: string;
  modelPreference?: ModelPreference;
}

export function useV6WorkspaceData(user: User | null) {
  const [deals, setDeals] = useState<WorkspaceDeal[]>([]);
  const [deliverables, setDeliverables] = useState<WorkspaceDeliverable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canFetch = !!user && !DEV_AUTH_BYPASS;

  const refresh = useCallback(async () => {
    if (!canFetch) {
      setDeals([]);
      setDeliverables([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [dealRes, deliverableRes] = await Promise.all([
        fetch("/api/deals", { headers: authHeaders() }),
        fetch("/api/deliverables/all", { headers: authHeaders() }),
      ]);
      if (!dealRes.ok) throw new Error(`deals ${dealRes.status}`);
      if (!deliverableRes.ok) throw new Error(`deliverables ${deliverableRes.status}`);
      const [dealRows, deliverableRows] = await Promise.all([dealRes.json(), deliverableRes.json()]);
      setDeals(Array.isArray(dealRows) ? dealRows : []);
      setDeliverables(Array.isArray(deliverableRows) ? deliverableRows : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load workspace data");
      setDeals([]);
      setDeliverables([]);
    } finally {
      setLoading(false);
    }
  }, [canFetch, user?.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const deliverablesByDeal = useMemo(() => {
    const map = new Map<number, WorkspaceDeliverable[]>();
    for (const item of deliverables) {
      const list = map.get(item.deal_id) ?? [];
      list.push(item);
      map.set(item.deal_id, list);
    }
    return map;
  }, [deliverables]);

  return {
    deals,
    deliverables,
    deliverablesByDeal,
    loading,
    error,
    canFetch,
    hasData: deals.length > 0 || deliverables.length > 0,
    refresh,
  };
}

export async function generateDealDeliverable(input: GenerateDeliverableInput) {
  const res = await fetch(`/api/deals/${input.dealId}/deliverables`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      menuItemSlug: input.menuItemSlug,
      modelPreference: input.modelPreference ?? "auto",
    }),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.error || payload.message || `HTTP ${res.status}`);
  return payload as { deliverableId: number; jobId?: string | null; status: string; title?: string };
}

export async function loadDealDataRoom(dealId: number): Promise<DealDataRoom> {
  const res = await fetch(`/api/deals/${dealId}/data-room`, { headers: authHeaders() });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.error || `HTTP ${res.status}`);
  return payload as DealDataRoom;
}

export async function fileDeliverableToDataRoom(
  dealId: number,
  deliverableId: number,
  folderId?: number | null,
) {
  const res = await fetch(`/api/deals/${dealId}/data-room/file`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ deliverableId, folderId: folderId ?? null }),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.error || `HTTP ${res.status}`);
  return payload;
}

export async function updateDataRoomDocumentStatus(docId: number, status: string) {
  const res = await fetch(`/api/data-room/documents/${docId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ status }),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.error || `HTTP ${res.status}`);
  return payload;
}
