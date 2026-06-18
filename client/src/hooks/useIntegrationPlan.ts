/**
 * useIntegrationPlan — client hook over the real PMI Value-Capture Plan routes
 * (server/routes/pmiPlan.ts). There was no client fetch for these before, so
 * this is the single sanctioned new hook in the Atlas build (it calls existing
 * endpoints — never a parallel data path).
 *
 *   GET   /api/deals/:dealId/integration-plan          → { plan, workstreams, milestones }
 *   PATCH /api/deals/:dealId/workstreams/:wsId          → updated workstream
 *
 * Honest-empty: the GET returns 200 with `{ plan: null, workstreams: [], milestones: [] }`
 * when no plan exists yet — the hook surfaces that as `plan === null` so the
 * screen renders a "No integration plan yet" state rather than fabricating one.
 */
import { useCallback, useEffect, useState } from "react";
import { authHeaders, DEV_AUTH_BYPASS, type User } from "./useAuth";

export interface IntegrationWorkstream {
  id: number;
  deal_id?: number;
  name?: string;
  title?: string;
  owner?: string | null;
  status?: string | null;
  pct?: number | null;
  captured_value_cents?: number | null;
  target_value_cents?: number | null;
  description?: string | null;
  sort_order?: number | null;
  [key: string]: any;
}

export interface IntegrationMilestone {
  id: number;
  deal_id?: number;
  name?: string;
  title?: string;
  due_at?: string | null;
  status?: string | null;
  day?: number | null;
  [key: string]: any;
}

export interface IntegrationPlan {
  id?: number;
  deal_id?: number;
  status?: string | null;
  generated_at?: string | null;
  summary?: string | null;
  [key: string]: any;
}

export interface IntegrationPlanResult {
  plan: IntegrationPlan | null;
  workstreams: IntegrationWorkstream[];
  milestones: IntegrationMilestone[];
}

export interface UseIntegrationPlanResult {
  loading: boolean;
  loaded: boolean;
  error: string | null;
  /** Null when no plan exists yet (honest-empty 200). */
  plan: IntegrationPlan | null;
  workstreams: IntegrationWorkstream[];
  milestones: IntegrationMilestone[];
  refresh: () => Promise<void>;
  /** Self-report execution progress on a workstream (full access only — 403 otherwise). */
  updateWorkstream: (wsId: number, patch: { status?: string; pct?: number }) => Promise<IntegrationWorkstream | null>;
}

const EMPTY: IntegrationPlanResult = { plan: null, workstreams: [], milestones: [] };

function coerceResult(raw: any): IntegrationPlanResult {
  if (!raw || typeof raw !== "object") return EMPTY;
  return {
    plan: raw.plan ?? null,
    workstreams: Array.isArray(raw.workstreams) ? raw.workstreams : [],
    milestones: Array.isArray(raw.milestones) ? raw.milestones : [],
  };
}

export function useIntegrationPlan(dealId: number | null): UseIntegrationPlanResult {
  const [state, setState] = useState<IntegrationPlanResult>(EMPTY);
  const [loading, setLoading] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const canFetch = dealId != null && Number.isFinite(dealId) && !DEV_AUTH_BYPASS;

  const refresh = useCallback(async () => {
    if (!canFetch) {
      setState(EMPTY);
      setLoaded(true);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/deals/${dealId}/integration-plan`, {
        headers: authHeaders(),
      });
      if (!res.ok) {
        // 404 = no deal access; surface honestly without a fabricated plan.
        setState(EMPTY);
        setError(res.status === 404 ? null : `Failed to load integration plan (${res.status})`);
        return;
      }
      const raw = await res.json();
      setState(coerceResult(raw));
    } catch (err: any) {
      setState(EMPTY);
      setError(err?.message || "Failed to load integration plan");
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, [canFetch, dealId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateWorkstream = useCallback(
    async (wsId: number, patch: { status?: string; pct?: number }): Promise<IntegrationWorkstream | null> => {
      if (!canFetch) return null;
      try {
        const res = await fetch(`/api/deals/${dealId}/workstreams/${wsId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify(patch),
        });
        if (!res.ok) return null;
        const updated: IntegrationWorkstream = await res.json();
        // Optimistic-merge the returned row into local state so the screen
        // reflects the change without a full refetch.
        setState(prev => ({
          ...prev,
          workstreams: prev.workstreams.map(w => (w.id === wsId ? { ...w, ...updated } : w)),
        }));
        return updated;
      } catch {
        return null;
      }
    },
    [canFetch, dealId],
  );

  return {
    loading,
    loaded,
    error,
    plan: state.plan,
    workstreams: state.workstreams,
    milestones: state.milestones,
    refresh,
    updateWorkstream,
  };
}

// Convenience re-export so callers can keep the User type local if needed.
export type { User };
