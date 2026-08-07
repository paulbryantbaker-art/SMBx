/**
 * Atlas MOBILE — OUTREACH (the campaign machine, migration 120), the second
 * mode of mobile Clients. Same grammar as ClientsM: shell owns vertical,
 * PAGE_H owns horizontal, white cards on the warm page, tone not borders.
 *
 * PHONE SCOPE: the queue — see what's due, open a touch, read the rendered
 * draft, send it or mark it done between meetings. Editing the PLAN (step
 * statuses, templates, wave dates) stays on desktop, like CSV import does.
 *
 * THE LINE: one touch, one press, one human — identical to desktop. The
 * send gate refuses drafts still carrying {merge_fields}; blocked records
 * (unsubscribed · do-not-pitch) say so instead of disappearing.
 */
import { useMemo, useState } from "react";
import type { User } from "../../../../hooks/useAuth";
import { useOutreach, type OutreachTouch } from "../../../../hooks/useOutreach";
import { EmptyState, LoadingState } from "../../desktop/primitives";
import { RT } from "../redesign/rt";

const PAGE_H = "0 18px";
const AMBER = { fg: "#9a6b00", bg: "#fdf0d5" }; // desktop T.amber pair — RT has no warn tone
const UNRESOLVED_RE = /\{[a-z0-9_]+\}/i;

function DuePill({ due }: { due: string | null }) {
  const today = new Date().toISOString().slice(0, 10);
  const day = due ? String(due).slice(0, 10) : null;
  const late = day != null && day <= today;
  return (
    <span style={{
      fontSize: 11.5, fontWeight: 700, padding: "2px 9px", borderRadius: 99,
      background: late ? AMBER.bg : RT.line, color: late ? AMBER.fg : RT.muted,
      whiteSpace: "nowrap",
    }}>
      {day == null ? "undated" : day === today ? "due today" : day < today ? `overdue ${day}` : day}
    </span>
  );
}

function TouchDetail({ touch, busy, onBack, onSend, onStatus }: {
  touch: OutreachTouch;
  busy: boolean;
  onBack: () => void;
  onSend: (subject: string, body: string) => void;
  onStatus: (status: string) => void;
}) {
  const [subject, setSubject] = useState(touch.draft?.subject ?? "");
  const [body, setBody] = useState(touch.draft?.body ?? "");
  const unresolved = UNRESOLVED_RE.test(subject) || UNRESOLVED_RE.test(body);
  const sendable = touch.canEmail && !unresolved && !busy && subject.trim() && body.trim();
  const isEvent = !!touch.event_id && !touch.account_id;

  const share = async () => {
    const text = `${subject}\n\n${body}`;
    if (navigator.share) { try { await navigator.share({ text }); return; } catch { /* cancelled */ } }
    await navigator.clipboard?.writeText(text);
  };

  const btn: React.CSSProperties = {
    height: 44, borderRadius: 12, border: "none", background: RT.card,
    color: RT.ink, fontSize: 14, fontWeight: 700, cursor: "pointer", padding: "0 16px",
  };

  return (
    <div style={{ color: RT.ink, fontFamily: RT.font, display: "flex", flexDirection: "column", gap: 11, padding: PAGE_H }}>
      <button type="button" onClick={onBack} style={{ ...btn, alignSelf: "flex-start", background: "transparent", padding: 0, height: 36, color: RT.accentInk }}>
        ← Queue
      </button>
      <div style={{ background: RT.card, borderRadius: 16, padding: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>
          {isEvent ? touch.event_name : touch.contact_name ? `${touch.contact_name}` : touch.firm}
        </div>
        {!isEvent && touch.contact_name && <div style={{ fontSize: 13, color: RT.muted, marginTop: 2 }}>{touch.firm}</div>}
        <div style={{ fontSize: 12.5, color: RT.muted, marginTop: 6 }}>{touch.step_key} · {touch.step_action}</div>
        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
          <DuePill due={touch.due_on} />
          {touch.channel && <span style={{ fontSize: 11.5, fontWeight: 700, padding: "2px 9px", borderRadius: 99, background: RT.accentSoft, color: RT.accentInk }}>{touch.channel}</span>}
        </div>
      </div>

      {touch.blocked && (
        <div style={{ background: AMBER.bg, color: AMBER.fg, borderRadius: 14, padding: "11px 14px", fontSize: 13, fontWeight: 700 }}>
          Blocked: {touch.blocked}. The machine never mails this record.
        </div>
      )}

      {isEvent ? (
        <div style={{ background: RT.card, borderRadius: 16, padding: 16, fontSize: 13.5, lineHeight: 1.6, color: RT.ink2 }}>
          {touch.event_date && <div><b>When:</b> {touch.event_date}</div>}
          {touch.registration_status && <div><b>Registration:</b> {touch.registration_status}</div>}
          {touch.prep_deadline && <div><b>Prep by:</b> {touch.prep_deadline}</div>}
        </div>
      ) : touch.draft ? (
        <div style={{ background: RT.card, borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          {touch.draft.unresolved.length > 0 && (
            <div style={{ fontSize: 12.5, fontWeight: 700, color: AMBER.fg }}>
              Fill before sending: {touch.draft.unresolved.map(f => `{${f}}`).join(" · ")}
            </div>
          )}
          <input
            value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject"
            style={{ height: 44, borderRadius: 12, border: "none", background: RT.line, padding: "0 14px", fontSize: 14, fontWeight: 700, fontFamily: RT.font, color: RT.ink }}
          />
          <textarea
            value={body} onChange={e => setBody(e.target.value)} rows={12}
            style={{ borderRadius: 12, border: "none", background: RT.line, padding: 14, fontSize: 14, lineHeight: 1.6, fontFamily: RT.font, color: RT.ink, resize: "vertical" }}
          />
          {touch.template_guardrails && (
            <div style={{ fontSize: 12, color: RT.muted, lineHeight: 1.55 }}><b>Guardrails:</b> {touch.template_guardrails}</div>
          )}
        </div>
      ) : (
        <div style={{ background: RT.card, borderRadius: 16, padding: 16, fontSize: 13.5, color: RT.muted, lineHeight: 1.6 }}>
          No template on this touch — do the step's action by hand and mark it done.
        </div>
      )}

      {touch.status === "pending" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {touch.canEmail && (
            <button
              type="button"
              disabled={!sendable}
              onClick={() => onSend(subject, body)}
              style={{ ...btn, background: RT.accent, color: RT.onAccent, opacity: sendable ? 1 : 0.45 }}
            >
              {busy ? "Sending…" : `Send to ${touch.contact_email}`}
            </button>
          )}
          {!isEvent && !touch.blocked && touch.draft && (
            <button type="button" style={btn} onClick={share}>Share / copy the draft</button>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" style={{ ...btn, flex: 1 }} disabled={busy} onClick={() => onStatus("done")}>Mark done</button>
            <button type="button" style={{ ...btn, flex: 1 }} disabled={busy} onClick={() => onStatus("skipped")}>Skip</button>
          </div>
        </div>
      )}
      {(touch.status === "sent" || touch.status === "done") && (
        <button type="button" style={btn} disabled={busy} onClick={() => onStatus("replied")}>They replied</button>
      )}
    </div>
  );
}

export default function OutreachMobile({ user }: { user: User | null }) {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [openId, setOpenId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const o = useOutreach(user, statusFilter);
  const open = useMemo(() => o.touches.find(t => t.id === openId) ?? null, [o.touches, openId]);

  if (open) {
    return (
      <>
        {banner && (
          <div style={{ margin: "0 18px 10px", background: RT.accentSoft, color: RT.accentInk, borderRadius: 14, padding: "11px 14px", fontSize: 13, fontWeight: 600 }}>{banner}</div>
        )}
        <TouchDetail
          key={open.id}
          touch={open}
          busy={busy}
          onBack={() => { setOpenId(null); setBanner(null); }}
          onSend={async (s, b) => {
            setBusy(true);
            try { await o.sendTouch(open.id, s, b); setBanner(`Sent to ${open.contact_email}.`); }
            catch (e: any) { setBanner(`Not sent: ${e?.message ?? "unknown error"}`); }
            finally { setBusy(false); }
          }}
          onStatus={async st => {
            setBusy(true);
            try { await o.setTouchStatus(open.id, st); setOpenId(null); }
            catch (e: any) { setBanner(`Update failed: ${e?.message ?? "unknown error"}`); }
            finally { setBusy(false); }
          }}
        />
      </>
    );
  }

  if (o.loading && !o.loaded) {
    return <div style={{ padding: "32px 18px", display: "flex", minHeight: 200 }}><LoadingState label="Loading the queue…" /></div>;
  }
  if (o.error) {
    return (
      <div style={{ padding: "24px 18px", display: "flex", minHeight: 260 }}>
        <EmptyState accent={RT.accent} onAccent={RT.onAccent} title="Could not load the queue" hint={o.error} cta="Try again" onCta={o.refresh} />
      </div>
    );
  }
  if (o.machine && o.machine.waves.length === 0) {
    return (
      <div style={{ padding: "24px 18px", display: "flex", minHeight: 260 }}>
        <EmptyState
          accent={RT.accent} onAccent={RT.onAccent}
          title="The campaign isn't loaded yet"
          hint="Seed the outreach plan from the Board — it loads the waves, steps, templates, events and the touch queue in one press."
        />
      </div>
    );
  }

  const q = o.machine?.queue;

  return (
    <div style={{ color: RT.ink, fontFamily: RT.font, display: "flex", flexDirection: "column" }}>
      {/* status chips, edge-bleed scroll like the board's */}
      <div style={{ display: "flex", gap: 7, overflowX: "auto", padding: "2px 18px 12px", WebkitOverflowScrolling: "touch" }}>
        {["pending", "sent", "done", "replied", "all"].map(s => (
          <button key={s} type="button" onClick={() => { setStatusFilter(s); setOpenId(null); }}
            style={{
              height: 34, padding: "0 15px", borderRadius: 99, border: "none", whiteSpace: "nowrap",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              background: statusFilter === s ? RT.ink : RT.card,
              color: statusFilter === s ? "#fff" : RT.ink,
            }}>
            {s}{s === "pending" && q?.due ? ` · ${q.due} due` : ""}
          </button>
        ))}
      </div>

      {banner && (
        <div style={{ margin: "0 18px 10px", background: RT.accentSoft, color: RT.accentInk, borderRadius: 14, padding: "11px 14px", fontSize: 13, fontWeight: 600 }}>{banner}</div>
      )}

      <div style={{ padding: PAGE_H, display: "flex", flexDirection: "column", gap: 11 }}>
        {o.touches.length === 0 ? (
          <div style={{ padding: "16px 0", display: "flex", minHeight: 200 }}>
            <EmptyState accent={RT.accent} onAccent={RT.onAccent} title="Queue clear" hint={`Nothing ${statusFilter === "all" ? "here" : statusFilter} right now.`} />
          </div>
        ) : o.touches.map(t => {
          const isEvent = !!t.event_id && !t.account_id;
          return (
            <button key={t.id} type="button" onClick={() => setOpenId(t.id)}
              style={{ textAlign: "left", background: RT.card, border: "none", borderRadius: 16, padding: 14, cursor: "pointer", fontFamily: RT.font }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 800, color: RT.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {isEvent ? t.event_name : t.contact_name ? `${t.contact_name} — ${t.firm}` : t.firm}
                </span>
                <DuePill due={t.due_on} />
              </div>
              <div style={{ fontSize: 12.5, color: RT.muted, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {t.step_key} · {t.step_action}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 7, flexWrap: "wrap" }}>
                {t.channel && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: RT.accentSoft, color: RT.accentInk }}>{t.channel}</span>}
                {t.blocked && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: AMBER.bg, color: AMBER.fg }}>{t.blocked}</span>}
                {t.draft && t.draft.unresolved.length > 0 && !t.blocked && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: AMBER.bg, color: AMBER.fg }}>{t.draft.unresolved.length} to fill</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
