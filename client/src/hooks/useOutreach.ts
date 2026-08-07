/**
 * The outreach machine, client-side (migration 120). One hook for both
 * platforms, same conventions as useCrmAccounts: server does the joins and
 * the RENDERING (house/outreach.ts runs server-side so drafts are identical
 * everywhere); the client filters nothing it didn't ask for.
 *
 * THE LINE rides in the shape: `sendTouch` takes the practitioner's FINAL
 * subject/body — there is no "send all" here and never will be. The server
 * re-checks unsubscribe/do-not-pitch and refuses drafts with unresolved
 * {merge_fields}; the hook surfaces those refusals verbatim.
 */
import { useCallback, useEffect, useState } from "react";
import { authHeaders, DEV_AUTH_BYPASS, type User } from "./useAuth";

export interface OutreachStep {
  id: number; step_key: string; wave_id: number | null; week_of: string | null;
  action: string; channel: string | null; template_id: number | null;
  target_records: string | null; objective: string | null; owner: string | null;
  success_metric: string | null; notes: string | null; status: string;
  touches: Record<string, number>;
}
export interface OutreachWave {
  id: number; wave_key: string; name: string; start_on: string | null; end_on: string | null;
  objective: string | null; segments: string | null; target_contacts: string | null;
  anchor_event: string | null; success_metric: string | null; dependency: string | null;
  status: string; steps: OutreachStep[];
}
export interface OutreachEvent {
  id: number; event_key: string; name: string; date_text: string | null; on_date: string | null;
  location: string | null; registration_status: string | null; priority: string | null;
  objective: string | null; prep_deadline: string | null; notes: string | null;
}
export interface OutreachTemplate {
  id: number; template_key: string; segment: string | null; channel: string | null;
  purpose: string | null; subject: string | null; body: string; cta: string | null;
  guardrails: string | null;
}
export interface OutreachTouch {
  id: number; status: string; due_on: string | null; channel: string | null;
  sent_at: string | null; subject_sent: string | null; body_sent: string | null;
  last_send_error: string | null;
  step_id: number; step_key: string; step_action: string; week_of: string | null;
  step_objective: string | null; wave_key: string | null; wave_name: string | null;
  account_id: number | null; firm: string | null; stage: string | null;
  hq_city: string | null; hq_state: string | null;
  contact_id: number | null; contact_name: string | null; contact_title: string | null;
  contact_email: string | null; unsubscribed_at: string | null;
  event_id: number | null; event_key: string | null; event_name: string | null;
  event_date: string | null; registration_status: string | null; prep_deadline: string | null;
  template_key: string | null; template_cta: string | null; template_guardrails: string | null;
  draft: { subject: string; body: string; unresolved: string[] } | null;
  blocked: string | null;
  canEmail: boolean;
}
export interface OutreachMachine {
  waves: OutreachWave[];
  unwavedSteps: OutreachStep[];
  events: OutreachEvent[];
  templates: OutreachTemplate[];
  queue: { pending: number; due: number; sent: number; replied: number };
}

async function json<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!r.ok) {
    let detail = "";
    try { detail = (await r.json())?.error || ""; } catch { /* no body */ }
    throw new Error(detail || `HTTP ${r.status}`);
  }
  return r.json() as Promise<T>;
}

export function useOutreach(user: User | null, touchStatus: string) {
  const [machine, setMachine] = useState<OutreachMachine | null>(null);
  const [touches, setTouches] = useState<OutreachTouch[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!user || DEV_AUTH_BYPASS) {
      setMachine(null); setTouches([]); setLoaded(true); setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      json<OutreachMachine>(`/api/outreach`),
      json<{ touches: OutreachTouch[] }>(`/api/outreach/queue?status=${encodeURIComponent(touchStatus)}`),
    ])
      .then(([m, q]) => {
        if (cancelled) return;
        setMachine(m);
        setTouches(q.touches);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        // Say WHY — before migration 120 runs these tables do not exist, and
        // an empty "no outreach yet" would be a lie.
        console.error("[outreach] load failed:", e.message);
        setMachine(null); setTouches([]);
        setError(e.message || "Could not load the outreach machine");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false); setLoaded(true);
      });
    return () => { cancelled = true; };
  }, [user?.id, touchStatus, nonce]);

  const refresh = useCallback(() => setNonce(n => n + 1), []);

  const sendTouch = useCallback(async (id: number, subject: string, body: string) => {
    const res = await json<{ touch: unknown }>(`/api/outreach/touches/${id}/send`, {
      method: "POST", body: JSON.stringify({ subject, body }),
    });
    refresh();
    return res;
  }, [refresh]);

  const setTouchStatus = useCallback(async (id: number, status: string) => {
    const res = await json<{ touch: unknown }>(`/api/outreach/touches/${id}`, {
      method: "PATCH", body: JSON.stringify({ status }),
    });
    refresh();
    return res;
  }, [refresh]);

  const setStepStatus = useCallback(async (id: number, status: string) => {
    const res = await json<{ step: unknown }>(`/api/outreach/steps/${id}`, {
      method: "PATCH", body: JSON.stringify({ status }),
    });
    refresh();
    return res;
  }, [refresh]);

  return { machine, touches, loading, loaded, error, refresh, sendTouch, setTouchStatus, setStepStatus };
}
