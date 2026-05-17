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
  analysis_run_id?: number | null;
  analysis_type?: string | null;
  analysis_status?: string | null;
  canvas_tab_id?: string | null;
  folder_category?: string | null;
  artifact_kind?: string | null;
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

export interface RunAnalysisInput {
  dealId: number;
  analysisType: string;
  menuItemSlug?: string;
  modelPreference?: ModelPreference;
  requestedFrom?: string;
  assumptionOverrides?: Record<string, any>;
}

export interface CompareDealsInput {
  dealIds: number[];
  title?: string;
  modelPreference?: ModelPreference;
  requestedFrom?: string;
}

export interface SavedModelArtifact {
  id: number;
  dealId: number;
  title: string;
  status: string;
  savedAt: string;
  exportUrls?: {
    pdf?: string;
    pptx?: string;
  };
}

export interface SaveModelArtifactInput {
  analysisRunId: number;
  title?: string;
  dealIds?: number[];
  menuItemSlug?: string;
  artifactPayload?: Record<string, any>;
}

export interface ExportModelArtifactPreviewInput {
  title: string;
  format: "pdf" | "pptx";
  artifactPayload: Record<string, any>;
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

export async function runDealAnalysis(input: RunAnalysisInput) {
  const res = await fetch(`/api/deals/${input.dealId}/analysis`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      analysisType: input.analysisType,
      menuItemSlug: input.menuItemSlug,
      modelPreference: input.modelPreference ?? "auto",
      requestedFrom: input.requestedFrom ?? "ui_action",
      assumptionOverrides: input.assumptionOverrides ?? {},
    }),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.error || payload.message || `HTTP ${res.status}`);
  return payload as {
    ok?: boolean;
    canvas_action?: "open_tab";
    tab?: {
      id?: string;
      kind: "analysis";
      title: string;
      tool?: string;
      analysisRunId?: number | null;
      resolvedMenuItemSlug?: string;
      status?: string;
      markdown?: string;
      analysisData?: Record<string, any>;
    };
    analysisRunId?: number | null;
    analysisStatus?: string;
    analysisType?: string;
    resolvedMenuItemSlug?: string;
    analysisData?: Record<string, any>;
    message?: string;
  };
}

export async function compareDealsAnalysis(input: CompareDealsInput) {
  const res = await fetch("/api/deals/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      dealIds: input.dealIds,
      title: input.title,
      modelPreference: input.modelPreference ?? "auto",
      requestedFrom: input.requestedFrom ?? "ui_action",
    }),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.error || payload.message || `HTTP ${res.status}`);
  return payload as {
    ok?: boolean;
    canvas_action?: "open_tab";
    tab?: {
      id?: string;
      kind: "analysis";
      title: string;
      tool?: string;
      analysisRunId?: number | null;
      status?: string;
      markdown?: string;
      comparisonData?: Record<string, any>[];
      analysisData?: Record<string, any>;
    };
    analysisRunId?: number | null;
    analysisStatus?: string;
    analysisType?: string;
    analysisData?: Record<string, any>;
    message?: string;
  };
}

export async function saveAnalysisModelArtifact(input: SaveModelArtifactInput) {
  const res = await fetch(`/api/analysis-runs/${input.analysisRunId}/save-model-artifact`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      title: input.title,
      dealIds: input.dealIds ?? [],
      menuItemSlug: input.menuItemSlug,
      artifactPayload: input.artifactPayload ?? {},
    }),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.error || payload.message || `HTTP ${res.status}`);
  return payload as {
    ok: boolean;
    analysisRunId: number;
    artifactTitle: string;
    folder: string;
    dataRoomFiled: boolean;
    deliverables: SavedModelArtifact[];
    message: string;
  };
}

export async function exportDeliverableFile(deliverableId: number, format: "pdf" | "pptx" | "docx" | "xlsx") {
  const res = await fetch(`/api/deliverables/${deliverableId}/export/${format}`, {
    method: "POST",
    headers: authHeaders(),
  });
  const blob = await res.blob();
  if (!res.ok) {
    const text = await blob.text().catch(() => "");
    let message = text || `HTTP ${res.status}`;
    try {
      const parsed = JSON.parse(text);
      message = parsed.error || parsed.message || message;
    } catch {}
    throw new Error(message);
  }
  const disposition = res.headers.get("content-disposition") || "";
  const match = disposition.match(/filename="?([^"]+)"?/i);
  return {
    blob,
    filename: match?.[1] || `smbx-model-artifact.${format}`,
  };
}

export async function exportModelArtifactPreview(input: ExportModelArtifactPreviewInput) {
  const res = await fetch(`/api/model-artifacts/export/${input.format}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      title: input.title,
      artifactPayload: input.artifactPayload,
    }),
  });
  const blob = await res.blob();
  if (!res.ok) {
    const text = await blob.text().catch(() => "");
    let message = text || `HTTP ${res.status}`;
    try {
      const parsed = JSON.parse(text);
      message = parsed.error || parsed.message || message;
    } catch {}
    throw new Error(message);
  }
  const disposition = res.headers.get("content-disposition") || "";
  const match = disposition.match(/filename="?([^"]+)"?/i);
  return {
    blob,
    filename: match?.[1] || `smbx-model-export.${input.format}`,
  };
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
