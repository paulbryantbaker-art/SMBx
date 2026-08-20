/**
 * FIRMS — the client register, on screen at last.
 *
 * (2026-08-19, Paul, after pressing "Sync register from the repo", watching it
 * report 154 firms, and finding nowhere to read them: "so i guess there is no
 * UI for the register and managing outreach?" There wasn't. The rows have been
 * in Postgres and `/api/crm/accounts` has been mounted and live the whole time
 * — nothing in the shipped shell rendered them. The only register data on
 * screen was firm NAMES in the Leads org typeahead.)
 *
 * GIT OWNS THE FACTS; THE APP OWNS THE STATE (crm-bundle/COLUMNS.md). Who a
 * firm is, what it buys and the URL that proves it are maintained in
 * studio/clients/crm-bundle/02_organizations.csv and pushed here — so they are
 * READ-ONLY on this screen. Stage, next action and logged notes are the app's,
 * are protected from every re-sync, and are the only things editable here.
 * Editing `notes` in-app was deliberately NOT built: the loader takes
 * COALESCE(new, existing) on that column, so an in-app note is silently
 * overwritten by the next press. Notes you write here go to crm_activity,
 * which no sync touches.
 *
 * ?kind=all IS LOAD-BEARING. The endpoint defaults to kind='acquirer', which is
 * 108 of the 154 rows — a screen that opened on 108 the day after a banner said
 * 154 would read as data loss. Everything is requested; the kind rides on the
 * row as a filter chip instead.
 *
 * Honesty grammar, inherited from the retired board: a count over a column
 * nothing writes is "—", never 0; a null figure is "not scored", never 0; a
 * known absence is words ("none set", "Never contacted."); and a fetch that
 * FAILED never renders as a record of "none".
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { authHeaders } from "../../hooks/useAuth";
import { C, input, btnPrimary, btnGhost, mono, chip } from "./tokens";
import { daysUntil, localIso, sinceLabel } from "./Leads";

/* ── the row, as GET /api/crm/accounts returns it ────────────────────── */

export interface FirmRow {
  id: number;
  firm: string;
  kind: string;
  segment: string | null;
  tier: string | null;
  score: number | null;
  score_detail: string | null;
  stage: string;
  hq_city: string | null;
  hq_state: string | null;
  website: string | null;
  trades: string | null;
  sponsor: string | null;
  disqualified: string | null;
  archived: boolean;
  next_action: string | null;
  next_action_on: string | null;
  notes: string | null;
  evidence: string | null;
  source_url: string | null;
  source_key: string | null;
  last_deal_on: string | null;
  loss_reason: string | null;
  /** `::int` in the SQL, so a real number — the bare COUNT(*) that postgres-js
   *  returns as the STRING "0" (truthy) is a bug this endpoint already fixed. */
  contact_count: number;
  activity_count: number;
  last_touch_at: string | null;
}

export interface FirmContact {
  id: number; name: string; title: string | null; email: string | null;
  phone: string | null; linkedin_url: string | null; role: string | null;
  is_primary: boolean; unsubscribed_at: string | null; source_key: string | null;
}
export interface FirmActivity {
  id: number; kind: string; direction: string | null; subject: string | null;
  body: string | null; occurred_at: string;
}
interface FirmDetail {
  account: FirmRow;
  contacts: FirmContact[];
  activity: FirmActivity[];
  deals: { id: number; business_name: string | null; name: string | null; current_gate: string | null }[];
}

/* ── vocabularies ────────────────────────────────────────────────────── */

export const CRM_STAGES = [
  "lead", "contacted", "conversation", "qualified", "proposal", "negotiation",
  "won", "nurture", "lost",
] as const;

export const STAGE_LABEL: Record<string, string> = {
  lead: "Lead", contacted: "Contacted", conversation: "In conversation",
  qualified: "Qualified", proposal: "Proposal out", negotiation: "Negotiation",
  won: "Won — mandate", nurture: "Nurture", lost: "Lost",
};

/** The register's own segment vocabulary (02_organizations.csv), spelled out.
 *  An unmapped value renders VERBATIM rather than being prettified into
 *  something the register never said. */
const SEGMENT_LABEL: Record<string, string> = {
  FAMILY_OFFICE: "Family office",
  OPERATOR_ACQUIRER: "Operator acquirer",
  CAPITAL_EQUITY: "Equity capital",
  IND_SPONSOR: "Independent sponsor",
  LMM_PE: "Lower-mid PE",
  CAPITAL_DEBT: "Debt capital",
  CAPITAL_SBA: "SBA capital",
  REFERRAL_BANKING: "Banking referral",
  REFERRAL_ACCOUNTING: "Accounting referral",
  REFERRAL_LEGAL: "Legal referral",
  ECOSYSTEM: "Ecosystem",
};
const segLabel = (s: string | null) => (s ? SEGMENT_LABEL[s] ?? s : null);

const KIND_LABEL: Record<string, string> = {
  acquirer: "Acquirer", service_provider: "Referral & capital",
  target: "Target", other: "Other",
};

type FilterId = "all" | "unnamed" | "due" | "acquirer" | "referral" | "dnp";

const FILTERS: { id: FilterId; label: string; hint: string }[] = [
  { id: "all", label: "Everyone", hint: "Every row the register carries, whatever its kind" },
  { id: "unnamed", label: "Needs a person", hint: "No named contact — nothing can be sent to this firm until someone is named" },
  { id: "due", label: "Due now", hint: "Next action dated today or earlier" },
  { id: "acquirer", label: "Acquirers", hint: "The firms we would run a mandate for" },
  { id: "referral", label: "Referral & capital", hint: "Banks, accountants, lawyers, lenders — the layer around the client" },
  { id: "dnp", label: "Do not pitch", hint: "Disqualified in the register — never contacted" },
];

const matches = (f: FirmRow, id: FilterId): boolean => {
  switch (id) {
    case "unnamed": return f.contact_count === 0;
    case "due": return (daysUntil(f.next_action_on) ?? 1) <= 0;
    case "acquirer": return (f.kind || "acquirer") === "acquirer";
    case "referral": return f.kind === "service_provider";
    case "dnp": return !!f.disqualified;
    default: return true;
  }
};

/** "today" / "in 5 days" / "3 days overdue" / a known absence in words. */
function dueLabel(iso: string | null): { text: string; late: boolean } {
  const d = daysUntil(iso);
  if (d == null) return { text: "none set", late: false };
  if (d === 0) return { text: "today", late: true };
  if (d < 0) return { text: `${-d}d overdue`, late: true };
  return { text: `in ${d}d`, late: false };
}

/* ── the screen ──────────────────────────────────────────────────────── */

export default function FirmsScreen() {
  const [rows, setRows] = useState<FirmRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterId>("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const load = useCallback(() => {
    /* kind=all, always — see the header. */
    fetch("/api/crm/accounts?kind=all", { headers: authHeaders() })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(d => { setRows(Array.isArray(d) ? d : []); setError(null); })
      .catch(e => setError(e?.message ?? "load failed"));
  }, []);
  useEffect(load, [load]);

  const patch = useCallback(async (id: number, body: Record<string, unknown>) => {
    const r = await fetch(`/api/crm/accounts/${id}`, {
      method: "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json().catch(() => null);
    if (!r.ok) { setBanner(j?.error ?? `Save failed (${r.status})`); return false; }
    load();
    return true;
  }, [load]);

  const all = rows ?? [];
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter(f => {
      if (!matches(f, filter)) return false;
      if (!needle) return true;
      return [f.firm, f.segment, f.hq_city, f.hq_state, f.trades, f.sponsor, f.notes, f.source_key]
        .some(v => (v ?? "").toLowerCase().includes(needle));
    });
  }, [all, filter, q]);

  /* Grouped by TIER, which is also the server's first sort key — so the
     grouping and the ordering are the same fact rather than two. Stage would
     be one populated bucket and eight empty ones on a freshly synced board. */
  const groups = useMemo(() => {
    const by = new Map<string, FirmRow[]>();
    for (const f of shown) {
      const k = f.tier || "—";
      by.set(k, [...(by.get(k) ?? []), f]);
    }
    return ["A", "B", "C", "D", "—"].filter(t => by.has(t)).map(t => [t, by.get(t)!] as const);
  }, [shown]);

  const unnamed = all.filter(f => f.contact_count === 0).length;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0, fontFamily: C.display, fontSize: 30, fontWeight: 600, letterSpacing: "-0.01em" }}>
          Firms
        </h1>
        <span style={mono}>
          {rows === null ? "loading…" : `${all.length} in the register`}
          {unnamed ? ` · ${unnamed} need a person` : ""}
        </span>
      </div>
      <p style={{ margin: "6px 0 0", fontSize: 14, color: C.body, lineHeight: 1.6, maxWidth: 660 }}>
        The buy-side register — every firm the studio has verified, pushed here from
        git. Who they are and what they buy is maintained in the register and is
        read-only; the stage, the next action and anything you log are yours and
        survive every re-sync.
      </p>

      {/* filters — each carries its own count, so a chip that would return
          nothing says so before it is pressed */}
      <div style={{ marginTop: 16, display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
        {FILTERS.map(f => {
          const n = all.filter(r => matches(r, f.id)).length;
          const on = filter === f.id;
          return (
            <button
              key={f.id} type="button" title={f.hint}
              onClick={() => { setFilter(f.id); setOpenId(null); }}
              style={{
                ...btnGhost, padding: "5px 11px", fontSize: 12.5,
                /* the `border` SHORTHAND, not borderColor: btnGhost sets the
                   shorthand, and React warns that mixing the two on a rerender
                   can leave the old colour behind when the chip deactivates. */
                ...(on ? { border: `1px solid ${C.green}`, color: C.green, background: C.greenTint } : null),
              }}
            >
              {f.label}
              <span style={{ ...mono, fontSize: 11.5, marginLeft: 6, color: on ? C.green : C.muted }}>
                {rows === null ? "—" : n}
              </span>
            </button>
          );
        })}
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Firm, trade, city, sponsor or note"
          aria-label="Search the register"
          style={{ ...input, flex: "1 1 220px", minWidth: 180, padding: "6px 10px", fontSize: 13 }}
        />
      </div>

      {banner && (
        <div style={{ marginTop: 12, padding: "9px 13px", background: C.greenTint, fontSize: 13.5, color: C.ink }}>
          {banner}
        </div>
      )}
      {error && (
        <div style={{ marginTop: 12, padding: "9px 13px", background: C.dangerTint, fontSize: 13.5, color: C.ink }}>
          The register did not load ({error}). Nothing came back, so this is not a
          record of an empty register — reload the page.
        </div>
      )}

      {rows !== null && all.length === 0 && !error && (
        <p style={{ marginTop: 26, fontSize: 14, color: C.muted, lineHeight: 1.6, maxWidth: 640 }}>
          No firms loaded yet. On Leads, press <strong>Sync register from the repo</strong> —
          the server reads the register the current deploy ships and loads it here.
        </p>
      )}

      {rows !== null && all.length > 0 && shown.length === 0 && (
        <p style={{ marginTop: 26, fontSize: 14, color: C.muted, lineHeight: 1.6, maxWidth: 640 }}>
          Nothing matches. {all.length} firms are loaded — clear the search or pick
          a different filter.
        </p>
      )}

      {groups.map(([tier, list]) => (
        <div key={tier} style={{ marginTop: 22 }}>
          <div style={{
            display: "flex", alignItems: "baseline", gap: 10,
            paddingBottom: 6, borderBottom: `1px solid ${C.hair}`,
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.02em" }}>
              {tier === "—" ? "No tier recorded" : `Tier ${tier}`}
            </span>
            <span style={mono}>{list.length}</span>
            <span style={{ flex: 1 }} />
            <span style={{ ...mono, fontSize: 11.5 }}>people · next</span>
          </div>
          {list.map(f => (
            <FirmLine
              key={f.id}
              firm={f}
              open={openId === f.id}
              onToggle={() => setOpenId(openId === f.id ? null : f.id)}
              onPatch={b => patch(f.id, b)}
              onLogged={msg => { setBanner(msg); load(); }}
            />
          ))}
        </div>
      ))}

      <p style={{ marginTop: 24, fontSize: 12.5, color: C.muted, lineHeight: 1.6, maxWidth: 660 }}>
        Grouped by tier, then by score — the register's own order. A firm with no
        named person cannot be mailed or queued to anybody, which is why
        <strong> Needs a person</strong> sits second in the row of filters. Facts
        are corrected in <code>studio/clients/crm-bundle/02_organizations.csv</code> and
        re-synced, never edited here — the app's copy is a copy.
      </p>
    </div>
  );
}

/* ── one firm, and its record when opened ────────────────────────────── */

function FirmLine({ firm, open, onToggle, onPatch, onLogged }: {
  firm: FirmRow;
  open: boolean;
  onToggle: () => void;
  onPatch: (body: Record<string, unknown>) => Promise<boolean>;
  onLogged: (msg: string) => void;
}) {
  const due = dueLabel(firm.next_action_on);
  const where = [firm.hq_city, firm.hq_state].filter(Boolean).join(", ");
  const sub = [segLabel(firm.segment), where || null, firm.sponsor ? `sponsor ${firm.sponsor}` : null]
    .filter(Boolean).join(" · ");

  return (
    <div style={{ borderBottom: `1px solid ${C.hair}` }}>
      <div onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 4px", cursor: "pointer" }}>
        <div style={{ minWidth: 0, flex: "1.6 1 0" }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>{firm.firm}</span>
          {/* Do-not-pitch rides on the ROW, not three clicks in: the entire
              reason it is recorded is that it must be seen BEFORE anyone
              drafts anything. */}
          {firm.disqualified && (
            <span style={{
              ...chip, marginLeft: 8, color: C.danger, background: C.dangerTint,
              fontSize: 11, letterSpacing: "0.04em",
            }}>
              DO NOT PITCH
            </span>
          )}
          {firm.archived && <span style={{ ...mono, marginLeft: 8, fontSize: 11.5 }}>archived</span>}
          {sub && (
            <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {sub}
            </div>
          )}
        </div>
        <span style={{ ...chip, flex: "none" }}>{STAGE_LABEL[firm.stage] ?? firm.stage}</span>
        <span style={{
          ...mono, flex: "none", width: 74, textAlign: "right",
          color: firm.contact_count === 0 ? C.danger : C.muted,
        }}>
          {firm.contact_count === 0 ? "no one" : `${firm.contact_count} ${firm.contact_count === 1 ? "person" : "people"}`}
        </span>
        <span style={{
          ...mono, flex: "none", width: 92, textAlign: "right",
          color: due.late ? C.danger : C.muted, fontWeight: due.late ? 700 : 400,
        }}>
          {due.text}
        </span>
      </div>
      {open && <FirmRecord firm={firm} onPatch={onPatch} onLogged={onLogged} />}
    </div>
  );
}

/**
 * The opened record. Fetches its own detail; the `landed` discipline matters
 * here more than anywhere — the endpoint returns empty arrays for BOTH
 * "loaded, nothing there" and "the request failed", and printing
 * "Never contacted." about a firm we were told nothing about is a wrong
 * attribution, which is the one error this app must not make casually.
 */
function FirmRecord({ firm, onPatch, onLogged }: {
  firm: FirmRow;
  onPatch: (body: Record<string, unknown>) => Promise<boolean>;
  onLogged: (msg: string) => void;
}) {
  const [detail, setDetail] = useState<FirmDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [action, setAction] = useState(firm.next_action ?? "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const loadDetail = useCallback(() => {
    setErr(null);
    fetch(`/api/crm/accounts/${firm.id}`, { headers: authHeaders() })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(d => setDetail(d))
      .catch(e => { setDetail(null); setErr(e?.message ?? "load failed"); });
  }, [firm.id]);
  useEffect(loadDetail, [loadDetail]);
  useEffect(() => { setAction(firm.next_action ?? ""); }, [firm.id, firm.next_action]);

  const landed = detail != null;

  const logNote = async () => {
    if (!note.trim() || busy) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/crm/accounts/${firm.id}/activity`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "note", body: note.trim() }),
      });
      if (!r.ok) { const j = await r.json().catch(() => null); onLogged(j?.error ?? `Note failed (${r.status})`); return; }
      setNote("");
      loadDetail();
      onLogged(`Note logged on ${firm.firm}.`);
    } finally { setBusy(false); }
  };

  return (
    <div style={{ padding: "4px 4px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* the app's own columns — the only editable things here */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 12.5, color: C.muted, width: 54 }}>Stage:</span>
        <select
          value={firm.stage}
          onChange={e => {
            const v = e.target.value;
            /* A lost pursuit must say why — the server refuses `lost` without a
               reason, so ask for it here rather than surfacing a 400. */
            if (v === "lost") {
              const reason = window.prompt(
                "Marking this lost needs a reason — one of:\nno_budget · internal_bd_owns_origination · timing · lost_to_competitor · trigger_evaporated · unresponsive",
                "unresponsive",
              );
              if (!reason) return;
              void onPatch({ stage: v, loss_reason: reason.trim() });
              return;
            }
            void onPatch({ stage: v });
          }}
          style={{ ...input, padding: "6px 9px", fontSize: 13 }}
        >
          {CRM_STAGES.map(s => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
        </select>
        {firm.loss_reason && <span style={{ ...mono, color: C.danger }}>lost — {firm.loss_reason.replace(/_/g, " ")}</span>}
        <span style={{ flex: 1 }} />
        <span style={mono}>
          {firm.score == null ? "not scored" : `score ${firm.score}`}
          {firm.tier ? ` · tier ${firm.tier}` : ""}
        </span>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 12.5, color: C.muted, width: 54 }}>Next:</span>
        <input
          value={action} onChange={e => setAction(e.target.value)}
          placeholder="What you owe them next"
          style={{ ...input, flex: "1 1 260px", padding: "6px 10px", fontSize: 13 }}
        />
        <input
          type="date"
          /* `.slice(0, 10)`: postgres-js parses DATE into a JS Date and it
             serialises as a full ISO timestamp, which <input type="date">
             refuses — the field renders BLANK and the date it shows is never
             the date on the row. Same fix as the Leads follow-up field. */
          defaultValue={(firm.next_action_on ?? "").slice(0, 10)}
          onChange={e => { if (e.target.value) void onPatch({ next_action_on: e.target.value }); }}
          style={{ ...input, padding: "6px 9px", fontSize: 13 }}
        />
        <button
          type="button" style={btnGhost} disabled={action === (firm.next_action ?? "")}
          onClick={() => void onPatch({ next_action: action })}
        >
          Save
        </button>
        {!firm.next_action_on && (
          <button type="button" style={{ ...btnGhost, color: C.muted }}
                  onClick={() => void onPatch({ next_action_on: localIso() })}>
            Due today
          </button>
        )}
      </div>

      {/* people — the count is in the title, so the title is a claim and only
          appears once a payload has landed */}
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: C.body, marginBottom: 5 }}>
          {landed ? `People · ${detail!.contacts.length}` : "People"}
        </div>
        {!landed && !err && <div style={{ fontSize: 13, color: C.muted }}>Loading…</div>}
        {err && (
          <div style={{ fontSize: 13, color: C.danger }}>
            Could not load this firm ({err}). Nothing came back, so this is not a
            record of "none".
          </div>
        )}
        {landed && detail!.contacts.length === 0 && (
          <div style={{ fontSize: 13, color: C.body, lineHeight: 1.6 }}>
            No named person. Nothing can be sent to this firm and every outreach step
            aimed at it stays parked until someone is named — research the person, add
            them to <code>01_contacts.csv</code>, and re-sync.
          </div>
        )}
        {landed && detail!.contacts.map(c => (
          <div key={c.id} style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.7 }}>
            <strong>{c.name}</strong>
            {c.title && <span style={{ color: C.body }}> · {c.title}</span>}
            {c.is_primary && <span style={{ ...mono, marginLeft: 6, fontSize: 11.5 }}>primary</span>}
            <span style={{ color: C.muted }}>
              {c.email ? ` · ${c.email}` : " · no email on file — cannot be mailed"}
              {c.phone ? ` · ${c.phone}` : ""}
            </span>
            {c.unsubscribed_at && (
              <span style={{ color: C.danger }}> · unsubscribed {String(c.unsubscribed_at).slice(0, 10)} — never contacted again</span>
            )}
            {c.linkedin_url && (
              <a href={c.linkedin_url} target="_blank" rel="noreferrer" style={{ marginLeft: 8, color: C.green, fontWeight: 600 }}>
                LinkedIn →
              </a>
            )}
          </div>
        ))}
      </div>

      {/* what the register says — read-only, and labelled as such */}
      <div style={{ background: C.panel, padding: "11px 13px", fontSize: 13, lineHeight: 1.65, color: C.body }}>
        <div style={{ ...mono, fontSize: 11.5, marginBottom: 5 }}>
          FROM THE REGISTER · {KIND_LABEL[firm.kind] ?? firm.kind}
          {firm.source_key ? ` · ${firm.source_key}` : ""}
        </div>
        {firm.trades && <div><strong>Trades:</strong> {firm.trades}</div>}
        {firm.disqualified && <div style={{ color: C.danger }}><strong>Disqualified:</strong> {firm.disqualified}</div>}
        {firm.notes && <div style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>{firm.notes}</div>}
        {firm.evidence && <div style={{ marginTop: 4 }}><strong>Evidence:</strong> {firm.evidence}</div>}
        {firm.last_deal_on && <div><strong>Last dated deal:</strong> {String(firm.last_deal_on).slice(0, 10)}</div>}
        {(firm.website || firm.source_url) && (
          <div style={{ marginTop: 4 }}>
            {firm.website && (
              <a href={/^https?:/.test(firm.website) ? firm.website : `https://${firm.website}`}
                 target="_blank" rel="noreferrer" style={{ color: C.green, fontWeight: 600 }}>
                {firm.website}
              </a>
            )}
            {firm.website && firm.source_url && <span> · </span>}
            {firm.source_url && (
              <a href={firm.source_url} target="_blank" rel="noreferrer" style={{ color: C.green, fontWeight: 600 }}>
                source →
              </a>
            )}
          </div>
        )}
        {!firm.notes && !firm.evidence && !firm.trades && (
          <div style={{ color: C.muted }}>The register carries no notes or evidence on this firm yet.</div>
        )}
      </div>

      {/* activity — the app's own record, never touched by a sync */}
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: C.body, marginBottom: 5 }}>Contact history</div>
        {landed && detail!.activity.length === 0 && (
          <div style={{ fontSize: 13, color: C.body }}>Never contacted.</div>
        )}
        {landed && detail!.activity.slice(0, 6).map(a => (
          <div key={a.id} style={{ fontSize: 13, color: C.body, lineHeight: 1.7 }}>
            <span style={{ ...mono, fontSize: 11.5, marginRight: 8 }}>{sinceLabel(a.occurred_at)}</span>
            <strong>{a.kind.replace(/_/g, " ")}</strong>
            {a.subject && <span> · {a.subject}</span>}
            {a.body && <span style={{ color: C.muted }}> — {a.body.slice(0, 140)}{a.body.length > 140 ? "…" : ""}</span>}
          </div>
        ))}
        {landed && detail!.activity.length > 6 && (
          <div style={{ ...mono, marginTop: 3 }}>{detail!.activity.length - 6} older</div>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "flex-start" }}>
          <textarea
            value={note} onChange={e => setNote(e.target.value)} rows={2}
            placeholder="Log what happened — a call, a reply, what they said…"
            style={{ ...input, flex: 1, resize: "vertical", lineHeight: 1.5, fontSize: 13 }}
          />
          <button type="button" style={btnPrimary} disabled={!note.trim() || busy} onClick={() => void logNote()}>
            {busy ? "Logging…" : "Log"}
          </button>
        </div>
      </div>

      {landed && detail!.deals.length > 0 && (
        <div style={{ fontSize: 13, color: C.body }}>
          <strong>Deals running for them:</strong>{" "}
          {detail!.deals.map(d => d.business_name || d.name || `deal ${d.id}`).join(" · ")}
        </div>
      )}
    </div>
  );
}
