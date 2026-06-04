/**
 * useNextActions — the real "important next steps" feed for the logged-in user.
 *
 * Backed by server/routes/nextActions.ts: GET /api/user/next-actions returns
 * 2-5 ranked, gate-aware actions computed from active deals (what's actually
 * missing to advance a gate), stale-deal detection (>7d idle), and pending
 * review requests (where THIS user is the reviewer — those block other people,
 * so they rank first). Each action carries a `prefill` that drops the user into
 * the right Yulia conversation.
 *
 * This is the engine the Today page should use — NOT the AI briefing service,
 * which can return empty. Deterministic, always real when you own deals.
 */
import { useEffect, useState } from "react";
import { authHeaders, type User } from "./useAuth";

export interface NextAction {
  id: string;
  dealId: number | null;
  dealName: string;
  journeyType: string | null;
  currentGate: string | null;
  icon: string;
  title: string;
  description: string;
  cta: string;
  priority: number;
  prefill?: string;
}

export function useNextActions(user: User | null, canFetch: boolean) {
  const [actions, setActions] = useState<NextAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user || !canFetch) {
      setActions([]);
      setLoading(false);
      setLoaded(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch("/api/user/next-actions", { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`next-actions ${r.status}`)))
      .then((data: { actions?: NextAction[] }) => {
        if (!cancelled) setActions(Array.isArray(data.actions) ? data.actions : []);
      })
      .catch(() => { if (!cancelled) setActions([]); })
      .finally(() => { if (!cancelled) { setLoading(false); setLoaded(true); } });
    return () => { cancelled = true; };
  }, [user?.id, canFetch]);

  return { actions, loading, loaded };
}
