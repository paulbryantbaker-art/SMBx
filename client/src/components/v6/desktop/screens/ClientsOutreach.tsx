/**
 * Atlas CLIENTS — the OUTREACH machine (migration 120), the second mode of
 * the Clients screen. The Board answers "who do I call next"; this answers
 * "what does the PLAN say I owe today" — the 2026-08-05 waves expanded into
 * a queue of touches, each one rendered from its template and one press from
 * sent.
 *
 * ── HONESTY RULES (the board's, carried over) ────────────────────────────
 *  - A draft with unresolved {merge_fields} cannot be sent. The fields are
 *    named in amber; the human fills them or the button stays dead. Blanking
 *    a research field would mail "congratulations on ." to a Tier A fund.
 *  - Blocked touches say WHY (unsubscribed · do-not-pitch · archived) rather
 *    than disappearing — a hidden exclusion looks like a lost record.
 *  - "Sent" is the server's word, stamped only when the mail service accepted
 *    the message. Manual channels get "done", never "sent".
 *  - A load failure names itself; before migration 120 the tables don't
 *    exist and an empty machine would be a lie.
 *
 * THE LINE: one touch, one press, one human. No batch send exists on this
 * surface and none should be added — the automation layer may STAGE, only
 * the practitioner RELEASES.
 *
 * Safari rule: everything absolute sits inside the screen's relative root —
 * never position:fixed.
 */
import { useMemo, useState } from "react";
import type { User } from "../../../../hooks/useAuth";
import {
  useOutreach, type OutreachTouch, type OutreachTemplate, type OutreachWave,
} from "../../../../hooks/useOutreach";
import { EmptyState, LoadingState } from "../primitives";
import { T } from "../atlasTokens";

const UNRESOLVED_RE = /\{[a-z0-9_]+\}/i;

/* ── small pieces ─────────────────────────────────────────────────────── */

function Chip({ text, bg, fg }: { text: string; bg: string; fg: string }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 9px", borderRadius: 99,
      background: bg, color: fg, fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap",
    }}>{text}</span>
  );
}

function channelChip(channel: string | null) {
  const c = channel || "—";
  if (/email/i.test(c)) return <Chip text={c} bg={T.greenBg} fg={T.green} />;
  if (/linkedin/i.test(c)) return <Chip text={c} bg={T.blueBg} fg={T.blue} />;
  return <Chip text={c} bg={T.track} fg={T.muted} />;
}

function statusChip(s: string) {
  switch (s) {
    case "sent": return <Chip text="SENT" bg={T.greenBg} fg={T.green} />;
    case "replied": return <Chip text="REPLIED" bg={T.greenBg} fg={T.green} />;
    case "done": return <Chip text="DONE" bg={T.blueBg} fg={T.blue} />;
    case "skipped": return <Chip text="SKIPPED" bg={T.track} fg={T.faint} />;
    default: return <Chip text="PENDING" bg={T.amberBg} fg={T.amber} />;
  }
}

const btn: React.CSSProperties = {
  padding: "8px 14px", borderRadius: 9, border: `1px solid ${T.border}`,
  background: T.white, color: T.ink, fontSize: 13, fontWeight: 600, cursor: "pointer",
};
const primaryBtn: React.CSSProperties = {
  ...btn, background: T.green, borderColor: T.green, color: "#fff",
};
const deadBtn: React.CSSProperties = { ...primaryBtn, opacity: 0.45, cursor: "default" };

function dueLabelFor(d: string | null): { text: string; color: string } {
  if (!d) return { text: "undated", color: T.faint };
  const today = new Date().toISOString().slice(0, 10);
  const day = String(d).slice(0, 10);
  if (day < today) return { text: `overdue · ${day}`, color: T.amber };
  if (day === today) return { text: "due today", color: T.amber };
  return { text: day, color: T.muted };
}

/* ── the compose / detail pane ────────────────────────────────────────── */

function TouchPane({ touch, onSend, onStatus, busy }: {
  touch: OutreachTouch;
  onSend: (subject: string, body: string, style: "personal" | "letterhead") => void;
  onStatus: (status: string) => void;
  busy: boolean;
}) {
  // Drafts start from the server render and are the human's from then on.
  // Keyed remount (see call site) resets them when the selection changes.
  const [subject, setSubject] = useState(touch.draft?.subject ?? "");
  const [body, setBody] = useState(touch.draft?.body ?? "");
  // The message's VOICE (2026-08-07, Paul): personal = bare note, the right
  // read for a cold first touch; letterhead = the same words on the site's
  // Aurora chrome (jade rule, wordmark, signature block) for a reader who
  // already knows the name. Per-message, defaulting personal.
  const [style, setStyle] = useState<"personal" | "letterhead">("personal");
  const unresolved = UNRESOLVED_RE.test(subject) || UNRESOLVED_RE.test(body);
  const sendable = touch.canEmail && !unresolved && !busy && subject.trim() && body.trim();

  const isEvent = !!touch.event_id && !touch.account_id;
  const who = isEvent
    ? touch.event_name
    : touch.contact_name
      ? `${touch.contact_name} · ${touch.firm}`
      : touch.firm;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 18, overflow: "auto", height: "100%" }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 800 }}>{who}</div>
        <div style={{ fontSize: 12.5, color: T.muted, marginTop: 3 }}>
          {touch.step_key} · {touch.step_action}
        </div>
        {touch.wave_name && (
          <div style={{ fontSize: 12, color: T.faint, marginTop: 2 }}>
            {touch.wave_key} — {touch.wave_name}
          </div>
        )}
      </div>

      {touch.blocked && (
        <div style={{ padding: "9px 12px", borderRadius: 9, background: T.amberBg, color: T.amber, fontSize: 12.5, fontWeight: 700 }}>
          Blocked: {touch.blocked}. The machine never mails this record.
        </div>
      )}

      {touch.status === "sent" && touch.subject_sent && (
        <div style={{ padding: "10px 12px", borderRadius: 9, background: T.greenBg, fontSize: 12.5 }}>
          <div style={{ fontWeight: 700, color: T.green }}>Sent {touch.sent_at ? String(touch.sent_at).slice(0, 10) : ""} — the audit copy:</div>
          <div style={{ marginTop: 6, fontWeight: 700 }}>{touch.subject_sent}</div>
          <div style={{ marginTop: 4, whiteSpace: "pre-wrap", color: T.muted }}>{touch.body_sent}</div>
        </div>
      )}

      {isEvent ? (
        <div style={{ fontSize: 13, lineHeight: 1.6, color: T.muted }}>
          {touch.event_date && <div><b style={{ color: T.ink }}>When:</b> {touch.event_date}</div>}
          {touch.registration_status && <div><b style={{ color: T.ink }}>Registration:</b> {touch.registration_status}</div>}
          {touch.prep_deadline && <div><b style={{ color: T.ink }}>Prep deadline:</b> {touch.prep_deadline}</div>}
          {touch.step_objective && <div style={{ marginTop: 6 }}>{touch.step_objective}</div>}
        </div>
      ) : touch.draft ? (
        <>
          {touch.draft.unresolved.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.amber }}>Fill before sending:</span>
              {touch.draft.unresolved.map(f => <Chip key={f} text={`{${f}}`} bg={T.amberBg} fg={T.amber} />)}
            </div>
          )}
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Subject"
            style={{
              padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`,
              fontSize: 13.5, fontWeight: 700, fontFamily: T.font, color: T.ink, background: T.white,
            }}
          />
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={14}
            style={{
              padding: "12px 12px", borderRadius: 9, border: `1px solid ${T.border}`,
              fontSize: 13.5, lineHeight: 1.6, fontFamily: T.font, color: T.ink,
              background: T.white, resize: "vertical", minHeight: 220,
            }}
          />
          {touch.template_guardrails && (
            <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.55 }}>
              <b>Guardrails ({touch.template_key}):</b> {touch.template_guardrails}
            </div>
          )}
          {touch.canEmail && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.muted }}>Send as:</span>
              {(["personal", "letterhead"] as const).map(k => (
                <button key={k} type="button" onClick={() => setStyle(k)}
                  style={{ ...btn, padding: "4px 12px", fontSize: 12, ...(style === k ? { background: T.track, fontWeight: 800 } : {}) }}>
                  {k === "personal" ? "Personal note" : "House letterhead"}
                </button>
              ))}
              <span style={{ fontSize: 11.5, color: T.faint, flexBasis: "100%" }}>
                {style === "personal"
                  ? "Bare text, as if typed — the right read for a cold first touch."
                  : "Same words on the site's chrome: jade rule, wordmark, signature. For readers who already know you."}
              </span>
            </div>
          )}
        </>
      ) : (
        <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.6 }}>
          No template on this touch — it's a task, not a message. Do the step's
          action by hand and mark it done.
        </div>
      )}

      {touch.last_send_error && touch.status === "pending" && (
        <div style={{ fontSize: 12.5, color: T.amber }}>Last attempt: {touch.last_send_error}</div>
      )}

      {touch.status === "pending" && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {touch.canEmail ? (
            <button
              type="button"
              style={sendable ? primaryBtn : deadBtn}
              disabled={!sendable}
              title={unresolved ? "The draft still carries {merge_fields}" : !touch.contact_email ? "No email on the contact" : undefined}
              onClick={() => onSend(subject, body, style)}
            >
              {busy ? "Sending…" : `Send to ${touch.contact_email}`}
            </button>
          ) : !isEvent && !touch.blocked && touch.draft ? (
            <button
              type="button"
              style={btn}
              onClick={() => { navigator.clipboard?.writeText(`${subject}\n\n${body}`); }}
              title={touch.contact_email ? `Channel is "${touch.channel}"` : "No email on this contact"}
            >
              Copy draft
            </button>
          ) : null}
          <button type="button" style={btn} disabled={busy} onClick={() => onStatus("done")}>Mark done</button>
          <button type="button" style={btn} disabled={busy} onClick={() => onStatus("skipped")}>Skip</button>
        </div>
      )}
      {(touch.status === "sent" || touch.status === "done") && (
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" style={btn} disabled={busy} onClick={() => onStatus("replied")}>They replied</button>
        </div>
      )}
    </div>
  );
}

/* ── the plan tab ─────────────────────────────────────────────────────── */

function WaveCard({ wave, onStep }: { wave: OutreachWave; onStep: (id: number, status: string) => void }) {
  return (
    <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 15, fontWeight: 800 }}>{wave.wave_key} — {wave.name}</span>
        <span style={{ fontSize: 12.5, color: T.muted }}>
          {wave.start_on ? String(wave.start_on).slice(0, 10) : "?"} → {wave.end_on ? String(wave.end_on).slice(0, 10) : "?"}
        </span>
      </div>
      {wave.objective && <div style={{ fontSize: 13, color: T.muted, marginTop: 6, lineHeight: 1.55 }}>{wave.objective}</div>}
      <div style={{ marginTop: 10, display: "flex", flexDirection: "column" }}>
        {wave.steps.map(s => {
          const t = s.touches;
          const total = Object.values(t).reduce((a, b) => a + b, 0);
          const doneish = (t.sent ?? 0) + (t.done ?? 0) + (t.replied ?? 0);
          return (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: `1px solid ${T.border}` }}>
              <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11.5, color: T.faint, width: 46, flex: "none" }}>{s.step_key}</span>
              <span style={{ fontSize: 13, flex: 1, minWidth: 0, color: s.status === "done" ? T.faint : T.ink, textDecoration: s.status === "done" ? "line-through" : "none" }}>
                {s.action}
              </span>
              {s.week_of && <span style={{ fontSize: 12, color: T.muted, flex: "none" }}>{String(s.week_of).slice(0, 10)}</span>}
              {total > 0 && (
                <span style={{ fontSize: 12, color: doneish === total ? T.green : T.muted, flex: "none" }}>
                  {doneish}/{total} touched
                </span>
              )}
              <select
                value={s.status}
                onChange={e => onStep(s.id, e.target.value)}
                style={{ fontSize: 12, padding: "3px 6px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.white, color: T.ink, flex: "none" }}
              >
                <option value="pending">pending</option>
                <option value="in_progress">in progress</option>
                <option value="done">done</option>
                <option value="skipped">skipped</option>
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TemplateRow({ tpl }: { tpl: OutreachTemplate }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop: `1px solid ${T.border}`, padding: "10px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setOpen(o => !o)}>
        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11.5, color: T.faint, width: 30, flex: "none" }}>{tpl.template_key}</span>
        <span style={{ fontSize: 13, fontWeight: 700, flex: 1, minWidth: 0 }}>{tpl.subject || tpl.purpose || "(no subject)"}</span>
        {tpl.channel && channelChip(tpl.channel)}
        <span style={{ fontSize: 12, color: T.faint }}>{open ? "▴" : "▾"}</span>
      </div>
      {open && (
        <div style={{ marginTop: 8, paddingLeft: 40 }}>
          <div style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.6, color: T.muted, maxWidth: "60em" }}>{tpl.body}</div>
          {tpl.guardrails && <div style={{ marginTop: 8, fontSize: 12, color: T.amber }}><b>Guardrails:</b> {tpl.guardrails}</div>}
          <button type="button" style={{ ...btn, marginTop: 8, padding: "5px 11px", fontSize: 12 }}
            onClick={() => navigator.clipboard?.writeText(`${tpl.subject ?? ""}\n\n${tpl.body}`)}>
            Copy template
          </button>
        </div>
      )}
    </div>
  );
}

/* ── the panel ────────────────────────────────────────────────────────── */

export default function OutreachPanel({ user }: { user: User | null }) {
  const [tab, setTab] = useState<"queue" | "plan">("queue");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [openId, setOpenId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const o = useOutreach(user, statusFilter);
  const open = useMemo(() => o.touches.find(t => t.id === openId) ?? null, [o.touches, openId]);

  const doSend = async (t: OutreachTouch, subject: string, body: string, style: "personal" | "letterhead") => {
    setBusy(true);
    try {
      await o.sendTouch(t.id, subject, body, style);
      setBanner(`Sent to ${t.contact_email} — logged on ${t.firm}.`);
    } catch (e: any) {
      setBanner(`Not sent: ${e?.message ?? "unknown error"}`);
    } finally {
      setBusy(false);
    }
  };
  const doStatus = async (t: OutreachTouch, status: string) => {
    setBusy(true);
    try { await o.setTouchStatus(t.id, status); }
    catch (e: any) { setBanner(`Update failed: ${e?.message ?? "unknown error"}`); }
    finally { setBusy(false); }
  };

  if (o.loading && !o.loaded) {
    return <div style={{ flex: 1, display: "flex" }}><LoadingState label="Loading the outreach machine…" /></div>;
  }
  if (o.error) {
    return <div style={{ flex: 1, display: "flex" }}>
      <EmptyState
        title="Could not load the outreach machine"
        hint={`${o.error}. If this is the first deploy carrying migration 120, the campaign tables may not exist yet — check the boot log for "[migrations] Applied: 120_outreach_campaign.sql".`}
        cta="Try again"
        onCta={o.refresh}
      />
    </div>;
  }
  const m = o.machine;
  if (m && m.waves.length === 0) {
    return <div style={{ flex: 1, display: "flex" }}>
      <EmptyState
        title="The campaign isn't loaded yet"
        hint="Press “Seed the outreach plan” on the Board tab — since migration 120 it loads the whole machine: 6 waves, 27 steps, 12 templates, 4 events, and every step's targets expanded into a touch queue."
      />
    </div>;
  }

  const q = m?.queue;

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", padding: "0 22px 22px", gap: 12 }}>
      {/* headline + tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", flex: "none" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {(["queue", "plan"] as const).map(k => (
            <button key={k} type="button" onClick={() => setTab(k)}
              style={{ ...btn, ...(tab === k ? { background: T.ink, borderColor: T.ink, color: "#fff" } : {}) }}>
              {k === "queue" ? "Queue" : "Plan & templates"}
            </button>
          ))}
        </div>
        {q && (
          <div style={{ display: "flex", gap: 14, marginLeft: "auto", fontSize: 12.5, color: T.muted }}>
            <span><b style={{ color: q.due ? T.amber : T.ink }}>{q.due}</b> due</span>
            <span><b style={{ color: T.ink }}>{q.pending}</b> pending</span>
            <span><b style={{ color: T.green }}>{q.sent}</b> sent</span>
            <span><b style={{ color: T.green }}>{q.replied}</b> replied</span>
          </div>
        )}
      </div>

      {banner && (
        <div style={{ padding: "9px 13px", background: T.blueBg, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, display: "flex", gap: 12, alignItems: "center", flex: "none" }}>
          <span style={{ flex: 1 }}>{banner}</span>
          <button type="button" style={{ ...btn, padding: "4px 10px", fontSize: 12 }} onClick={() => setBanner(null)}>Dismiss</button>
        </div>
      )}

      {tab === "queue" ? (
        <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 14 }}>
          {/* list */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", display: "flex", gap: 6, borderBottom: `1px solid ${T.border}`, flex: "none", flexWrap: "wrap" }}>
              {["pending", "sent", "done", "skipped", "replied", "all"].map(s => (
                <button key={s} type="button" onClick={() => { setStatusFilter(s); setOpenId(null); }}
                  style={{
                    ...btn, padding: "4px 11px", fontSize: 12,
                    ...(statusFilter === s ? { background: T.track, fontWeight: 800 } : {}),
                  }}>
                  {s}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, overflow: "auto" }}>
              {o.touches.length === 0 && (
                <div style={{ padding: 24, fontSize: 13.5, color: T.muted }}>
                  Nothing {statusFilter === "all" ? "here" : statusFilter} — the queue is clear.
                </div>
              )}
              {o.touches.map(t => {
                const due = dueLabelFor(t.due_on);
                const isEvent = !!t.event_id && !t.account_id;
                return (
                  <div key={t.id}
                    onClick={() => setOpenId(t.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                      borderBottom: `1px solid ${T.border}`, cursor: "pointer",
                      background: openId === t.id ? T.track : "transparent",
                    }}>
                    <span style={{ fontSize: 12, color: due.color, width: 96, flex: "none" }}>{due.text}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {isEvent ? t.event_name : t.contact_name ? `${t.contact_name} — ${t.firm}` : t.firm}
                      </div>
                      <div style={{ fontSize: 12, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>
                        {t.step_key} · {t.step_action}
                      </div>
                    </div>
                    {t.blocked && <Chip text={t.blocked.toUpperCase()} bg={T.amberBg} fg={T.amber} />}
                    {t.draft && t.draft.unresolved.length > 0 && !t.blocked && (
                      <Chip text={`${t.draft.unresolved.length} TO FILL`} bg={T.amberBg} fg={T.amber} />
                    )}
                    {channelChip(t.channel)}
                    {statusFilter === "all" && statusChip(t.status)}
                  </div>
                );
              })}
            </div>
          </div>
          {/* pane */}
          <div style={{ width: 440, flex: "none", background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
            {open ? (
              <TouchPane
                key={open.id}
                touch={open}
                busy={busy}
                onSend={(s, b, st) => doSend(open, s, b, st)}
                onStatus={st => doStatus(open, st)}
              />
            ) : (
              <div style={{ padding: 24, fontSize: 13.5, color: T.muted }}>
                Pick a touch. Email touches open as an editable draft with the
                merge fields filled from the register; anything the register
                can't know is flagged for you to fill. One press sends and
                logs it on the account.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, overflow: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
          {m?.waves.map(w => <WaveCard key={w.id} wave={w} onStep={(id, st) => { o.setStepStatus(id, st).catch((e: any) => setBanner(`Step update failed: ${e?.message}`)); }} />)}
          {m && m.events.length > 0 && (
            <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>Events</div>
              {m.events.map(e => (
                <div key={e.id} style={{ display: "flex", gap: 10, padding: "8px 0", borderTop: `1px solid ${T.border}`, fontSize: 13, alignItems: "baseline", flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11.5, color: T.faint }}>{e.event_key}</span>
                  <span style={{ fontWeight: 700 }}>{e.name}</span>
                  <span style={{ color: T.muted }}>{e.date_text}</span>
                  {e.registration_status && <Chip text={e.registration_status} bg={/immediat/i.test(e.registration_status) ? T.amberBg : T.track} fg={/immediat/i.test(e.registration_status) ? T.amber : T.muted} />}
                  {e.prep_deadline && e.prep_deadline !== "N/A" && <span style={{ color: T.muted, fontSize: 12 }}>prep by {e.prep_deadline}</span>}
                </div>
              ))}
            </div>
          )}
          {m && m.templates.length > 0 && (
            <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>Message templates</div>
              {m.templates.map(t => <TemplateRow key={t.id} tpl={t} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
