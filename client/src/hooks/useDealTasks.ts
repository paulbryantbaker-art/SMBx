/**
 * Deal tasks — an action a deal needs from someone, often someone outside the
 * practice (migration 115, `server/routes/dealTasks.ts`).
 *
 * The notify call returns `{ sent, reason }` on a 200 even when nothing went
 * out: "no email address on this assignee" and "mail is not configured" are
 * answers, not server faults, and the UI must repeat the reason rather than
 * claim an inbox that will stay empty.
 */
import { useCallback, useEffect, useState } from "react";
import { authHeaders, DEV_AUTH_BYPASS, type User } from "./useAuth";

export const TASK_STATUSES = ["open", "waiting", "done", "cancelled"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

/** `open` = we know it's needed. `waiting` = we've asked and are waiting on
 *  them. That distinction is what makes a chase list possible. */
export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  open: "To ask",
  waiting: "Waiting on them",
  done: "Done",
  cancelled: "Cancelled",
};

export const CONTACT_ROLES = [
  "principal", "cpa", "attorney", "lender", "broker", "banker",
  "insurance", "appraiser", "operator", "other",
] as const;

export const ROLE_LABEL: Record<string, string> = {
  principal: "Principal", cpa: "CPA", attorney: "Attorney", lender: "Lender",
  broker: "Broker", banker: "Banker", insurance: "Insurance",
  appraiser: "Appraiser", operator: "Operator", other: "Other",
};

export interface DealTask {
  id: number;
  deal_id: number;
  title: string;
  detail: string | null;
  assignee_contact_id: number | null;
  assignee_email: string | null;
  assignee_name: string | null;
  assignee_role: string | null;
  due_on: string | null;
  status: string;
  notified_at: string | null;
  notify_count: number;
  last_notify_error: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
}

export interface AddressBookContact {
  id: number;
  name: string;
  title: string | null;
  role: string | null;
  email: string | null;
  is_primary: boolean;
  unsubscribed_at: string | null;
  account_id: number;
  firm: string;
  account_kind: string;
}

async function json<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!r.ok) {
    let detail = "";
    try { detail = (await r.json())?.error || ""; } catch { /* no body */ }
    throw new Error(detail || `HTTP ${r.status}`);
  }
  return r.json() as Promise<T>;
}

export function useDealTasks(dealId: number | null) {
  const [tasks, setTasks] = useState<DealTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (dealId == null) { setTasks([]); setError(null); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    json<DealTask[]>(`/api/deals/${dealId}/tasks`)
      .then(rows => { if (!cancelled) setTasks(Array.isArray(rows) ? rows : []); })
      .catch((e: Error) => {
        if (cancelled) return;
        // Before migration 115 the table does not exist; say so rather than
        // showing an empty task list that implies there is nothing outstanding.
        setTasks([]);
        setError(e.message || "Could not load tasks");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [dealId, nonce]);

  const refresh = useCallback(() => setNonce(n => n + 1), []);

  const create = useCallback(async (body: Record<string, unknown>) => {
    if (dealId == null) return null;
    const row = await json<DealTask & { sent?: boolean; reason?: string }>(
      `/api/deals/${dealId}/tasks`, { method: "POST", body: JSON.stringify(body) },
    );
    refresh();
    return row;
  }, [dealId, refresh]);

  const patch = useCallback(async (taskId: number, body: Record<string, unknown>) => {
    if (dealId == null) return null;
    const row = await json<DealTask>(`/api/deals/${dealId}/tasks/${taskId}`, {
      method: "PATCH", body: JSON.stringify(body),
    });
    refresh();
    return row;
  }, [dealId, refresh]);

  const notify = useCallback(async (taskId: number) => {
    if (dealId == null) return { sent: false, reason: "No deal" };
    const res = await json<{ sent: boolean; reason?: string }>(
      `/api/deals/${dealId}/tasks/${taskId}/notify`, { method: "POST", body: JSON.stringify({}) },
    );
    refresh();
    return res;
  }, [dealId, refresh]);

  return { tasks, loading, error, refresh, create, patch, notify };
}

/** The flat address book — cross-account, because the CPA a deal needs works at
 *  a different firm than the client. */
export function useAddressBook(user: User | null) {
  const [contacts, setContacts] = useState<AddressBookContact[]>([]);

  useEffect(() => {
    if (!user || DEV_AUTH_BYPASS) { setContacts([]); return; }
    let cancelled = false;
    json<AddressBookContact[]>(`/api/crm/contacts`)
      .then(rows => { if (!cancelled) setContacts(Array.isArray(rows) ? rows : []); })
      .catch((e: Error) => {
        if (cancelled) return;
        console.warn("[crm] address book unavailable:", e.message);
        setContacts([]);
      });
    return () => { cancelled = true; };
  }, [user?.id]);

  return contacts;
}
