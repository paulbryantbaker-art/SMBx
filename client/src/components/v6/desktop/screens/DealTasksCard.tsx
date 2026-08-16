/**
 * DEAL TASKS — the specialists surface, extracted (2026-08-16).
 *
 * Paul, same night: *"Is it salesforce.com worthy of allowing me to track
 * clients and use the Dealflow tool once a client is landed or we bring in
 * experts like accountants or real estate?"* The machinery for exactly that
 * has existed since migration 115 — a task assigned to anyone in the address
 * book (CPA, counsel, appraiser, lender), emailed on a human press, document
 * by token share link, the assignee NEVER onboarded — but it rendered only in
 * the legacy cockpit pane. This extraction puts it in the Deals detail column,
 * where the deal is actually worked.
 *
 * One component, two mounts: the cockpit pane (framed — its own rule and
 * label) and the DealsList DetailCard (unframed — the card titles it).
 *
 * ── THE LINE (unchanged from dealTasks.ts) ──────────────────────────────
 * The email is a request for work from the practitioner to a professional
 * they engaged: sent only on a human press, names the practice, states the
 * action/deal/date and nothing else, never negotiates or quotes a fee. The
 * "asked n×" counter and `sent: false` honesty both come from the route.
 */
import { useState } from "react";
import type { CSSProperties } from "react";
import { T } from "../atlasTokens";
import { useDraft } from "../../../../hooks/useDraft";
import {
  useDealTasks, TASK_STATUS_LABEL, ROLE_LABEL,
  type AddressBookContact, type DealTask,
} from "../../../../hooks/useDealTasks";
import { daysUntil, dueLabel } from "../../../../lib/crm";

export function DealTasksCard({ dealId, addressBook, framed = true }: {
  dealId: number;
  addressBook: AddressBookContact[];
  /** true = the cockpit pane look (top rule + label); false = inside a DetailCard. */
  framed?: boolean;
}) {
  const { tasks, error, create, patch, notify } = useDealTasks(dealId);
  const [who, setWho] = useState("");
  const [due, setDue] = useState("");
  // A half-typed ask survives leaving the pane.
  const [title, setTitle, clearTitle] = useDraft(`deal:${dealId}:tasktitle`);
  const [detail, setDetail, clearDetail] = useDraft(`deal:${dealId}:taskdetail`);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const mailable = addressBook.filter(c => c.email && !c.unsubscribed_at);

  const add = async (andAsk: boolean) => {
    if (!title.trim() || busy) return;
    setBusy(true); setNote(null);
    try {
      const r = await create({
        title: title.trim(),
        detail: detail.trim() || null,
        assignee_contact_id: who || null,
        due_on: due || null,
        notify: andAsk,
      });
      clearTitle(); clearDetail(); setDue("");
      if (andAsk) {
        setNote(r?.sent ? "Emailed." : (r?.reason ?? "Nothing was sent."));
      }
    } catch (e: any) {
      setNote(e?.message ?? "Could not save");
    } finally { setBusy(false); }
  };

  const ask = async (t: DealTask) => {
    setBusy(true); setNote(null);
    try {
      const r = await notify(t.id);
      setNote(r.sent ? `Emailed ${t.assignee_email}.` : (r.reason ?? "Nothing was sent."));
    } catch (e: any) {
      setNote(e?.message ?? "Could not send");
    } finally { setBusy(false); }
  };

  return (
    <div style={framed ? { borderTop: `1px solid ${T.rowDiv}`, paddingTop: 14 } : undefined}>
      {framed && <span style={paneLabel}>Actions needed</span>}

      {error && <p style={{ margin: "0 0 10px", fontSize: 13, color: T.amber }}>{error}</p>}
      {note && <p style={{ margin: "0 0 10px", fontSize: 13, color: T.ink3 }}>{note}</p>}

      {tasks.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          {tasks.map(t => {
            const overdue = (daysUntil(t.due_on) ?? 1) <= 0 && t.status !== "done";
            return (
              <div key={t.id} style={{ padding: "9px 0", borderBottom: `1px solid ${T.rowDiv}` }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink }}>{t.title}</div>
                <div style={{ fontSize: 12.5, color: T.muted2, marginTop: 2 }}>
                  {[
                    TASK_STATUS_LABEL[t.status as never] ?? t.status,
                    t.assignee_name || t.contact_name || t.assignee_email || "unassigned",
                    t.assignee_role ? ROLE_LABEL[t.assignee_role] ?? t.assignee_role : null,
                    t.due_on ? dueLabel(t.due_on) : null,
                    t.notify_count > 0 ? `asked ${t.notify_count}×` : null,
                  ].filter(Boolean).join(" · ")}
                </div>
                {overdue && (
                  <div style={{ fontSize: 12.5, color: T.amber, marginTop: 2 }}>
                    {dueLabel(t.due_on)}
                  </div>
                )}
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  {t.status !== "done" && (
                    <>
                      <button
                        type="button" disabled={busy || !t.assignee_email}
                        title={t.assignee_email ? `Email ${t.assignee_email}` : "No email on this assignee"}
                        onClick={() => ask(t)}
                        style={{ ...ghostBtn, opacity: t.assignee_email ? 1 : 0.5 }}
                      >
                        {t.notify_count > 0 ? "Remind" : "Ask"}
                      </button>
                      <button
                        type="button" disabled={busy}
                        onClick={() => patch(t.id, { status: "done" })}
                        style={ghostBtn}
                      >
                        Done
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="What's needed? e.g. QoE scope for the Sept close"
        style={{ ...input, marginBottom: 8 }}
      />
      <textarea
        value={detail}
        onChange={e => setDetail(e.target.value)}
        rows={2}
        placeholder="Any detail they need (optional)"
        style={{ ...input, marginBottom: 8, resize: "vertical", lineHeight: 1.5 }}
      />
      <select value={who} onChange={e => setWho(e.target.value)} style={{ ...input, marginBottom: 8 }}>
        <option value="">Unassigned</option>
        {mailable.map(c => (
          <option key={c.id} value={String(c.id)}>
            {c.name}{c.role ? ` — ${ROLE_LABEL[c.role] ?? c.role}` : ""} · {c.firm}
          </option>
        ))}
      </select>
      <input type="date" value={due} onChange={e => setDue(e.target.value)} style={{ ...input, marginBottom: 8 }} />

      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" disabled={busy || !title.trim()} onClick={() => add(false)}
                style={{ ...ghostBtn, padding: "9px 15px", opacity: title.trim() ? 1 : 0.5 }}>
          Add
        </button>
        <button
          type="button"
          disabled={busy || !title.trim() || !who}
          title={who ? "Add it and email them now" : "Pick an assignee to email"}
          onClick={() => add(true)}
          style={{ ...primaryBtn, opacity: title.trim() && who ? 1 : 0.5 }}
        >
          Add &amp; ask
        </button>
      </div>
      {mailable.length === 0 && (
        <p style={{ margin: "8px 0 0", fontSize: 12.5, color: T.muted2, lineHeight: 1.5 }}>
          No mailable contacts yet. Add people — CPAs, counsel, lenders — under
          Clients, and they become assignable here.
        </p>
      )}
    </div>
  );
}

/* ── styles — the transcription's shapes ─────────────────────────────── */

const paneLabel: CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
  color: T.muted2, marginBottom: 5, textTransform: "uppercase",
};

/* Filled control cells — the fill is the boundary. */
const input: CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: "9px 11px", fontSize: 13.5,
  fontFamily: T.font, color: T.ink, background: T.track,
  border: "none", borderRadius: 8, outline: "none",
};

const ghostBtn: CSSProperties = {
  fontSize: 13, fontWeight: 600, padding: "6px 12px", borderRadius: 999,
  border: `1px solid ${T.inputBd}`, background: T.white, color: T.muted,
  cursor: "pointer", fontFamily: T.font,
};

/* The one primary action wears the filled green. */
const primaryBtn: CSSProperties = {
  fontSize: 13.5, fontWeight: 700, padding: "9px 16px", borderRadius: 8,
  border: "none", background: T.blue, color: "#fff",
  cursor: "pointer", fontFamily: T.font,
};
