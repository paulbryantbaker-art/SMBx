/**
 * useDeliverables — fetch the user's deliverables list once on mount and on
 * deal-set change. Used by Today's PINNED artifacts strip + Chat's inline
 * artifact rendering.
 *
 * Source: GET /api/deliverables/all (returns ALL deliverables across user's deals).
 *
 * Why fetched here (inside AppShellInner) and not in AppShell.tsx:
 *   - Desktop tree doesn't need this — keep desktop bundle clean.
 *   - Couples lifecycle to mobile-shell mount, so it un-mounts when user
 *     leaves authenticated mobile.
 */

import { useEffect, useState } from 'react';
import { authHeaders } from '../../../hooks/useAuth';
import type { AppDeliverable } from '../types';

interface State {
  deliverables: AppDeliverable[];
  loading: boolean;
  error: string | null;
}

export function useDeliverables(dealCount: number): State {
  const [state, setState] = useState<State>({ deliverables: [], loading: true, error: null });

  useEffect(() => {
    // No deals → no deliverables possible. Skip the fetch.
    if (dealCount === 0) {
      setState({ deliverables: [], loading: false, error: null });
      return;
    }

    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    fetch('/api/deliverables/all', { headers: { ...authHeaders() } })
      .then((res) => {
        if (!res.ok) throw new Error(`Deliverables fetch failed: ${res.status}`);
        return res.json();
      })
      .then((data: AppDeliverable[]) => {
        if (cancelled) return;
        setState({ deliverables: Array.isArray(data) ? data : [], loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        // Soft-fail: empty list, log error. UI just hides the PINNED section.
        console.error('useDeliverables:', err);
        setState({ deliverables: [], loading: false, error: err.message || 'fetch failed' });
      });

    return () => { cancelled = true; };
    // Re-fetch when deal count changes (new deal added → may produce new deliverables soon).
  }, [dealCount]);

  return state;
}
