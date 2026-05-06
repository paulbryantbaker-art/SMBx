/**
 * useDeliverableStatus — polls /api/deliverables/:id and surfaces the row's
 * current status + content. Used by the V6 deliverable tab placeholder
 * (B2.7) so a tab opened on canvas_action='open_deliverable' transitions
 * from "generating…" to "ready" without manual refresh.
 *
 * Polling cadence:
 *   - 2s while status is 'generating' (most generators land in 5-60s)
 *   - 8s while 'pending' (queued but not started)
 *   - stops as soon as status is 'complete' or 'failed'
 *
 * Cheap on the server because the endpoint reads a single row by PK.
 */
import { useEffect, useState } from "react";
import { authHeaders } from "./useAuth";

export interface DeliverableStatus {
  id: number;
  deal_id: number | null;
  type: string | null;
  status: "pending" | "generating" | "complete" | "failed" | string;
  content: any;
  created_at: string;
  completed_at: string | null;
}

export function useDeliverableStatus(deliverableId: string | number | null): {
  data: DeliverableStatus | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<DeliverableStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (deliverableId === null || deliverableId === undefined || deliverableId === "") {
      setData(null);
      return;
    }
    let cancelled = false;
    let timer: number | null = null;

    const tick = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/deliverables/${deliverableId}`, { headers: authHeaders() });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const row = await res.json() as DeliverableStatus;
        if (cancelled) return;
        setData(row);
        setError(null);

        if (row.status === "generating") {
          timer = window.setTimeout(tick, 2000);
        } else if (row.status === "pending") {
          timer = window.setTimeout(tick, 8000);
        }
        // 'complete' / 'failed' — stop polling
      } catch (e: any) {
        if (cancelled) return;
        setError(e.message);
        // Back off on errors so we don't hammer a broken endpoint
        timer = window.setTimeout(tick, 5000);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    tick();
    return () => {
      cancelled = true;
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [deliverableId]);

  return { data, loading, error };
}
