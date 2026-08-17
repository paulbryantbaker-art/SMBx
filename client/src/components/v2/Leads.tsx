/**
 * LEADS — the LinkedIn stage on one screen (SMBX_CRM_V2_SPEC.md §6.2).
 *
 * QUICK-ADD IS THE HEADLINE FEATURE: the persistent bar at top — name, org
 * (datalist against the pushed universe), URL, status — tab-tab-tab-enter,
 * ≤15 seconds. Name is the only requirement; the follow-up date defaults
 * from the ladder so no open lead is ever dateless. (Paul: "i dont want to
 * type in anyones name etc" — the paste assist returns LATER, as an optional
 * prefill; the fast manual bar is the floor it lands on.)
 *
 * The conversation happens in LinkedIn. This screen is the queue: who's
 * next, how stale, one-tap touches, one-tap reschedules, drop-with-reason.
 * Convert arrives with the Pipeline build (spec §8 step 3) and the ready
 * row says so instead of dangling a dead button.
 *
 * Carta language throughout; overdue reads in the functional danger red —
 * the site has no warning states, a workspace does.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { authHeaders } from "../../hooks/useAuth";
import { C, input, btnPrimary, btnGhost, mono, chip } from "./tokens";

export interface LeadRow {
  id: number;
  name: string;
  account_id: number | null;
  account_firm: string | null;
  account_tier: string | null;
  org_text: string | null;
  linkedin_url: string | null;
  status: string;
  next_follow_up_on: string | null;
  source: string | null;
  notes: string | null;
  dropped_reason: string | null;
  last_touch_at: string | null;
}

export const STATUS_LABEL: Record<string, string> = {
  identified: "Identified", invited: "Invited", connected: "Connected",
  in_thread: "In thread", ready: "Ready", dropped: "Dropped", converted: "Converted",
};

const TOUCHES = [
  { kind: "invited", label: "Invited" },
  { kind: "messaged", label: "Messaged" },
  { kind: "commented", label: "Commented" },
  { kind: "replied", label: "They replied" },
];

const DROP_REASONS = [
  { id: "no_response_x3", label: "No response ×3" },
  { id: "wrong_person", label: "Wrong person" },
  { id: "org_disqualified", label: "Org disqualified" },
  { id: "other", label: "Other" },
];

export function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const t = Date.parse(`${String(iso).slice(0, 10)}T00:00:00Z`);
  if (!Number.isFinite(t)) return null;
  const now = new Date();
  const today = Date.parse(`${now.toISOString().slice(0, 10)}T00:00:00Z`);
  return Math.round((t - today) / 86_400_000);
}

export function sinceLabel(iso: string | null): string {
  if (!iso) return "never";
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
  if (days <= 0) return "today";
  return `${days}d ago`;
}

export default function LeadsScreen() {
  const [rows, setRows] = useState<LeadRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orgs, setOrgs] = useState<string[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/leads", { headers: authHeaders() })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(d => { setRows(d.leads ?? []); setError(null); })
      .catch(e => setError(e?.message ?? "load failed"));
  }, []);
  useEffect(load, [load]);

  /* The org datalist — the pushed universe, for typeahead. Best-effort. */
  useEffect(() => {
    fetch("/api/crm/picker", { headers: authHeaders() })
      .then(r => (r.ok ? r.json() : []))
      .then(list => setOrgs((Array.isArray(list) ? list : []).map((x: any) => x.firm).filter(Boolean)))
      .catch(() => {});
  }, []);

  const patch = useCallback(async (id: number, body: Record<string, unknown>) => {
    const r = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json().catch(() => null);
    if (!r.ok) { setBanner(j?.error ?? `Save failed (${r.status})`); return false; }
    load();
    return true;
  }, [load]);

  const touch = useCallback(async (id: number, kind: string) => {
    const r = await fetch(`/api/leads/${id}/touch`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ kind }),
    });
    const j = await r.json().catch(() => null);
    if (!r.ok) { setBanner(j?.error ?? `Save failed (${r.status})`); return; }
    load();
  }, [load]);

  const all = rows ?? [];
  const overdue = useMemo(() => all.filter(l => (daysUntil(l.next_follow_up_on) ?? 1) <= 0).length, [all]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
        <h1 style={{ margin: 0, fontFamily: C.display, fontSize: 30, fontWeight: 600, letterSpacing: "-0.01em" }}>
          Leads
        </h1>
        <span style={mono}>
          {all.length} open{overdue ? ` · ${overdue} due` : ""}
        </span>
      </div>
      <p style={{ margin: "6px 0 0", fontSize: 14, color: C.body, lineHeight: 1.6, maxWidth: 640 }}>
        The LinkedIn stage. The conversation happens there; the queue lives here —
        every open lead carries its next follow-up date, and Today reads it.
      </p>

      <QuickAdd orgs={orgs} onAdded={l => { setBanner(`${l.name} added — follow up ${l.next_follow_up_on}.`); load(); }} />

      {banner && (
        <div style={{ marginTop: 12, padding: "9px 13px", background: C.greenTint, fontSize: 13.5, color: C.ink }}>
          {banner}
        </div>
      )}
      {error && (
        <div style={{ marginTop: 12, padding: "9px 13px", background: C.dangerTint, fontSize: 13.5, color: C.ink }}>
          The list did not load ({error}). Reload the page.
        </div>
      )}

      {rows !== null && all.length === 0 && !error && (
        <p style={{ marginTop: 26, fontSize: 14, color: C.muted, lineHeight: 1.6 }}>
          Nobody in the hunt yet. Find a person in Sales Navigator, add them
          above — name is enough — and the follow-up queue starts working.
        </p>
      )}

      {all.length > 0 && (
        <div style={{ marginTop: 20, borderTop: `1px solid ${C.hair}` }}>
          {all.map(l => (
            <LeadLine
              key={l.id}
              lead={l}
              open={openId === l.id}
              onToggle={() => setOpenId(openId === l.id ? null : l.id)}
              onTouch={k => touch(l.id, k)}
              onPatch={b => patch(l.id, b)}
            />
          ))}
        </div>
      )}

      <p style={{ marginTop: 22, fontSize: 12.5, color: C.muted, lineHeight: 1.6, maxWidth: 640 }}>
        Ordered by next follow-up, soonest first. Touches are logged here, sent
        nowhere — no automation touches LinkedIn, ever. Converting a Ready lead
        into a contact + pipeline entry arrives with the Pipeline build.
      </p>
    </div>
  );
}

/* ── quick-add: the ≤15-second bar ───────────────────────────────────── */

function QuickAdd({ orgs, onAdded }: { orgs: string[]; onAdded: (l: LeadRow) => void }) {
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("identified");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const add = async () => {
    if (busy || !name.trim()) return;
    setBusy(true); setErr(null);
    try {
      const r = await fetch("/api/leads", {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(), org: org.trim() || undefined,
          linkedin_url: url.trim() || undefined, status,
        }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) { setErr(j?.error ?? `Add failed (${r.status})`); return; }
      onAdded(j);
      setName(""); setOrg(""); setUrl("");
    } catch {
      setErr("The network dropped — nothing was saved.");
    } finally { setBusy(false); }
  };

  const onKey = (e: React.KeyboardEvent) => { if (e.key === "Enter" && name.trim()) add(); };

  return (
    <div style={{
      marginTop: 18, padding: "14px 16px", background: C.panel,
      display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center",
    }}>
      <input value={name} onChange={e => setName(e.target.value)} onKeyDown={onKey}
             placeholder="Name" autoFocus style={{ ...input, flex: "1 1 170px" }} />
      <input value={org} onChange={e => setOrg(e.target.value)} onKeyDown={onKey}
             placeholder="Org" list="v2-orgs" style={{ ...input, flex: "1 1 170px" }} />
      <datalist id="v2-orgs">{orgs.map(o => <option key={o} value={o} />)}</datalist>
      <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={onKey}
             placeholder="LinkedIn URL" style={{ ...input, flex: "1 1 200px" }} />
      <select value={status} onChange={e => setStatus(e.target.value)} style={{ ...input, flex: "0 1 130px" }}>
        {["identified", "invited", "connected", "in_thread", "ready"].map(s => (
          <option key={s} value={s}>{STATUS_LABEL[s]}</option>
        ))}
      </select>
      <button type="button" onClick={add} disabled={busy || !name.trim()}
              style={{ ...btnPrimary, opacity: name.trim() && !busy ? 1 : 0.5 }}>
        {busy ? "Adding…" : "Add lead"}
      </button>
      {err && <span style={{ fontSize: 13, color: C.danger, flexBasis: "100%" }}>{err}</span>}
    </div>
  );
}

/* ── one lead line + its expanded thin record ────────────────────────── */

export function LeadLine({ lead, open, onToggle, onTouch, onPatch }: {
  lead: LeadRow;
  open: boolean;
  onToggle: () => void;
  onTouch: (kind: string) => void;
  onPatch: (body: Record<string, unknown>) => Promise<boolean>;
}) {
  const d = daysUntil(lead.next_follow_up_on);
  const late = d != null && d <= 0;
  const org = lead.account_firm ?? lead.org_text;
  const [dropping, setDropping] = useState(false);
  const [notes, setNotes] = useState(lead.notes ?? "");
  useEffect(() => { setNotes(lead.notes ?? ""); }, [lead.id, lead.notes]);

  return (
    <div style={{ borderBottom: `1px solid ${C.hair}` }}>
      <div
        onClick={onToggle}
        style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 4px", cursor: "pointer" }}
      >
        <div style={{ minWidth: 0, flex: "1.4 1 0" }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>{lead.name}</span>
          {org && <span style={{ fontSize: 13.5, color: C.body }}> · {org}</span>}
          {lead.account_tier && <span style={{ ...mono, marginLeft: 6 }}>tier {lead.account_tier}</span>}
        </div>
        <span style={{ ...chip, flex: "none" }}>{STATUS_LABEL[lead.status] ?? lead.status}</span>
        <span style={{
          ...mono, flex: "none", width: 92, textAlign: "right",
          color: late ? C.danger : C.muted, fontWeight: late ? 700 : 400,
        }}>
          {lead.next_follow_up_on
            ? (d === 0 ? "today" : d != null && d < 0 ? `${-d}d late` : `in ${d}d`)
            : "—"}
        </span>
        <span style={{ ...mono, flex: "none", width: 76, textAlign: "right" }}>
          {sinceLabel(lead.last_touch_at)}
        </span>
      </div>

      {open && (
        <div style={{ padding: "2px 4px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {/* touches — one tap, logged, date re-defaulted */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12.5, color: C.muted }}>Log:</span>
            {TOUCHES.map(t => (
              <button key={t.kind} type="button" onClick={() => onTouch(t.kind)} style={btnGhost}>
                {t.label}
              </button>
            ))}
            {lead.linkedin_url && (
              <a href={lead.linkedin_url} target="_blank" rel="noreferrer"
                 style={{ fontSize: 13.5, fontWeight: 600, color: C.green, marginLeft: "auto" }}>
                Open profile →
              </a>
            )}
          </div>

          {/* reschedule — the defaults are prompts; these are the taps */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12.5, color: C.muted }}>Follow up:</span>
            {[2, 4, 7].map(n => (
              <button key={n} type="button" style={btnGhost}
                      onClick={() => onPatch({ next_follow_up_on: plusDaysLocal(n) })}>
                +{n}d
              </button>
            ))}
            <input type="date" defaultValue={lead.next_follow_up_on ?? ""} style={{ ...input, padding: "6px 9px" }}
                   onChange={e => { if (e.target.value) onPatch({ next_follow_up_on: e.target.value }); }} />
          </div>

          {/* status ladder — explicit moves, incl. Ready */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12.5, color: C.muted }}>Status:</span>
            {["identified", "invited", "connected", "in_thread", "ready"].map(s => (
              <button key={s} type="button"
                      onClick={() => onPatch({ status: s })}
                      style={{ ...btnGhost, ...(lead.status === s ? { borderColor: C.green, color: C.green } : null) }}>
                {STATUS_LABEL[s]}
              </button>
            ))}
            {lead.status === "ready" && (
              <span style={{ fontSize: 12.5, color: C.muted }}>
                Ready → conversion ships with the Pipeline build; capture their email in notes meanwhile.
              </span>
            )}
          </div>

          {/* notes — thread highlights, pasted or typed */}
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                      placeholder="Thread highlights, context, their email when it shows up…"
                      style={{ ...input, flex: 1, resize: "vertical", lineHeight: 1.5 }} />
            <button type="button" style={btnGhost} disabled={notes === (lead.notes ?? "")}
                    onClick={() => onPatch({ notes })}>
              Save
            </button>
          </div>

          {/* drop — with its reason, always */}
          {!dropping ? (
            <button type="button" onClick={() => setDropping(true)}
                    style={{ ...btnGhost, alignSelf: "flex-start", color: C.muted }}>
              Drop…
            </button>
          ) : (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 12.5, color: C.muted }}>Why:</span>
              {DROP_REASONS.map(r => (
                <button key={r.id} type="button" style={btnGhost}
                        onClick={async () => { if (await onPatch({ status: "dropped", dropped_reason: r.id })) setDropping(false); }}>
                  {r.label}
                </button>
              ))}
              <button type="button" style={{ ...btnGhost, color: C.muted }} onClick={() => setDropping(false)}>
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function plusDaysLocal(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
