/**
 * useDealGates — fetches a deal's gate progress for the V6 GateStrip.
 *
 * Reads GET /api/chat/deals/:dealId/gates which returns:
 *   { dealId, journeyType, currentGate, gates: [{gate, status, completed_at}, …] }
 *
 * Re-fetches whenever a `smbx:gate_advance` window event fires for the deal.
 * Cheap — the strip is small chrome and the endpoint is fast.
 */
import { useEffect, useState } from "react";
import { authHeaders } from "./useAuth";

export interface GateRow {
  gate: string;
  status: "pending" | "active" | "complete" | "failed" | string;
  completed_at: string | null;
}

export interface DealGates {
  dealId: number;
  journeyType: "buy" | "sell" | "raise" | "pmi";
  currentGate: string;
  gates: GateRow[];
}

export function useDealGates(dealId: number | null): {
  data: DealGates | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<DealGates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch on mount + when dealId changes + when a gate advances anywhere.
  useEffect(() => {
    if (!dealId) { setData(null); return; }
    let cancelled = false;

    const fetchGates = () => {
      setLoading(true);
      setError(null);
      fetch(`/api/chat/deals/${dealId}/gates`, { headers: authHeaders() })
        .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
        .then((d: DealGates) => {
          if (cancelled) return;
          setData(d);
        })
        .catch((e: Error) => {
          if (cancelled) return;
          setError(e.message);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };
    fetchGates();

    // useAuthChat dispatches a synthetic gate-advance card via setMessages
    // and fires no window event. Listen for the canvas_action that goes
    // out at the same moment (from completion-deliverable open) — close
    // enough to refetch the strip, and any caller can dispatch the same
    // event to manually refresh.
    const onAction = () => fetchGates();
    window.addEventListener("smbx:gate_advance_refresh", onAction as EventListener);
    return () => {
      cancelled = true;
      window.removeEventListener("smbx:gate_advance_refresh", onAction as EventListener);
    };
  }, [dealId]);

  return { data, loading, error };
}

/** Canonical gate sequence per journey type. Matches the methodology. */
export function gatesForJourney(journey: DealGates["journeyType"]): string[] {
  switch (journey) {
    case "buy":   return ["B0", "B1", "B2", "B3", "B4", "B5"];
    case "sell":  return ["S0", "S1", "S2", "S3", "S4", "S5"];
    case "raise": return ["R0", "R1", "R2", "R3", "R4", "R5"];
    case "pmi":   return ["PMI0", "PMI1", "PMI2", "PMI3"];
    default:      return [];
  }
}

export function gateStatusForRow(
  gate: string,
  current: string,
  rows: GateRow[],
): "complete" | "current" | "pending" {
  const row = rows.find(r => r.gate === gate);
  if (row?.status === "complete") return "complete";
  if (gate === current) return "current";
  return "pending";
}
