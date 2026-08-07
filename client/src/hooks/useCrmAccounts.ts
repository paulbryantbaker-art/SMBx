/**
 * The client pipeline, client-side. One hook for both platforms.
 *
 * Reads `/api/crm/accounts` (already ranked by the server — `house/leads.ts`
 * computed the score, the SQL ordered by it) plus `/api/crm/summary` for the
 * counts. Every mutation refreshes both, because a stage move changes the board
 * and a re-score changes the order.
 *
 * Filtering is SERVER-SIDE for tier/stage/dfw/moment/due and CLIENT-SIDE for
 * the search box: the filters map onto indexed columns and should not ship 77+
 * rows to be thrown away, while search-as-you-type should not fire a request per
 * keystroke.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { authHeaders, DEV_AUTH_BYPASS, type User } from "./useAuth";
import type {
  CrmAccount, CrmActivity, CrmContact, CrmSummary,
} from "../lib/crm";

export interface CrmFilters {
  tier?: string;
  stage?: string;
  dfw?: string;
  moment?: string;
  /** Only rows whose next action is today or earlier. */
  due?: boolean;
  archived?: boolean;
  /** The layer: default = ranked acquirers; 'service_provider' = the
   *  capital/referral address book; 'all' = every firm on file. */
  kind?: string;
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

function queryFor(f: CrmFilters): string {
  const p = new URLSearchParams();
  if (f.tier) p.set("tier", f.tier);
  if (f.stage) p.set("stage", f.stage);
  if (f.dfw) p.set("dfw", f.dfw);
  if (f.moment) p.set("moment", f.moment);
  if (f.due) p.set("due", "1");
  if (f.archived) p.set("archived", "1");
  if (f.kind) p.set("kind", f.kind);
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function useCrmAccounts(user: User | null, filters: CrmFilters, query: string) {
  const [accounts, setAccounts] = useState<CrmAccount[]>([]);
  const [summary, setSummary] = useState<CrmSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const qs = queryFor(filters);

  useEffect(() => {
    if (!user || DEV_AUTH_BYPASS) {
      setAccounts([]); setSummary(null); setLoaded(true); setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      json<CrmAccount[]>(`/api/crm/accounts${qs}`),
      json<CrmSummary>(`/api/crm/summary`),
    ])
      .then(([rows, sum]) => {
        if (cancelled) return;
        setAccounts(Array.isArray(rows) ? rows : []);
        setSummary(sum);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        // Say WHY. Before migration 113 runs, these tables do not exist and the
        // endpoint 500s — an empty "no clients yet" would be a lie.
        console.error("[crm] load failed:", e.message);
        setAccounts([]); setSummary(null);
        setError(e.message || "Could not load the client pipeline");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false); setLoaded(true);
      });
    return () => { cancelled = true; };
  }, [user?.id, qs, nonce]);

  const refresh = useCallback(() => setNonce(n => n + 1), []);

  /** Search over the fields a person actually remembers a firm by. */
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter(a =>
      `${a.firm} ${a.trades ?? ""} ${a.hq_city ?? ""} ${a.hq_state ?? ""} ${a.notes ?? ""} ${a.sponsor ?? ""}`
        .toLowerCase().includes(q));
  }, [accounts, query]);

  const patch = useCallback(async (id: number, body: Record<string, unknown>) => {
    const row = await json<CrmAccount>(`/api/crm/accounts/${id}`, {
      method: "PATCH", body: JSON.stringify(body),
    });
    refresh();
    return row;
  }, [refresh]);

  const importCsv = useCallback(async (csv: string) => {
    const res = await json<{
      imported: number; created: number; updated: number; contactsAdded: number;
      ignoredColumns: string[];
    }>(`/api/crm/accounts/import`, { method: "POST", body: JSON.stringify({ csv }) });
    refresh();
    return res;
  }, [refresh]);

  const rescore = useCallback(async () => {
    const res = await json<{ rescored: number }>(`/api/crm/accounts/rescore`, {
      method: "POST", body: JSON.stringify({}),
    });
    refresh();
    return res;
  }, [refresh]);

  // The 2026-08-05 outreach plan shipped in the repo (content/crm-seed/) —
  // one click seeds 81 orgs + 75 named contacts + hooks/research notes, AND
  // (since migration 120) the whole campaign machine: waves, steps,
  // templates, events, and the expanded touch queue.
  // Idempotent server-side; safe to press twice.
  const seedOutreach = useCallback(async () => {
    const res = await json<{
      accountsCreated: number; accountsUpdated: number; contactsAdded: number;
      activitiesAdded: number; unnamedParked: number; doNotPitch: number;
      wavesLoaded: number; templatesLoaded: number; stepsLoaded: number;
      eventsLoaded: number; touchesQueued: number; touchesExcluded: number;
      targetsUnmatched: string[];
    }>(`/api/crm/seed-outreach`, { method: "POST", body: JSON.stringify({}) });
    refresh();
    return res;
  }, [refresh]);

  const logActivity = useCallback(async (id: number, body: Record<string, unknown>) => {
    const row = await json<CrmActivity>(`/api/crm/accounts/${id}/activity`, {
      method: "POST", body: JSON.stringify(body),
    });
    refresh();
    return row;
  }, [refresh]);

  return {
    accounts: visible, all: accounts, summary, loading, loaded, error,
    refresh, patch, importCsv, rescore, seedOutreach, logActivity,
  };
}

export interface CrmPickerRow { id: number; firm: string; stage: string; tier: string | null }

/**
 * The id+firm list a deal's "run for" selector needs. Deliberately its own tiny
 * endpoint rather than reusing the board: a picker that shipped every column
 * would move ~80 rows of evidence prose to render a dropdown.
 */
export function useCrmPicker(user: User | null) {
  const [clients, setClients] = useState<CrmPickerRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || DEV_AUTH_BYPASS) { setClients([]); return; }
    let cancelled = false;
    json<CrmPickerRow[]>(`/api/crm/picker`)
      .then(rows => { if (!cancelled) setClients(Array.isArray(rows) ? rows : []); })
      .catch((e: Error) => {
        if (cancelled) return;
        // A missing picker must not break the deals board — the selector just
        // says it cannot load rather than the screen failing.
        console.warn("[crm] picker unavailable:", e.message);
        setClients([]);
        setError(e.message);
      });
    return () => { cancelled = true; };
  }, [user?.id]);

  return { clients, error };
}

/** One account with its people and its history — the detail pane. */
export interface CrmAccountSearch {
  id: number;
  name: string;
  industry: string | null;
  geography: string | null;
  is_active: boolean | null;
  candidate_count: number;
}

export interface CrmAccountDeal {
  id: number;
  business_name: string | null;
  name: string | null;
  current_gate: string | null;
  status: string | null;
  next_action: string | null;
  next_action_on: string | null;
}

export function useCrmAccount(id: number | null, nonce = 0) {
  const [data, setData] = useState<{
    account: CrmAccount; contacts: CrmContact[]; activity: CrmActivity[];
    deals: CrmAccountDeal[]; searches: CrmAccountSearch[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id == null) { setData(null); setError(null); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    json<{
      account: CrmAccount; contacts: CrmContact[]; activity: CrmActivity[];
      deals: CrmAccountDeal[]; searches: CrmAccountSearch[];
    }>(`/api/crm/accounts/${id}`)
      .then(d => { if (!cancelled) setData(d); })
      .catch((e: Error) => {
        if (cancelled) return;
        setData(null);
        setError(e.message || "Could not load that account");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, nonce]);

  return {
    ...(data ?? { account: null, contacts: [], activity: [], deals: [], searches: [] }),
    loading, error,
  };
}
