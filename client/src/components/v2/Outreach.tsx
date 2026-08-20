/**
 * OUTREACH — the queue the register's campaign plan expands into.
 *
 * (2026-08-19. The seed has been writing `crm_touches` since migration 120 and
 * `/api/outreach/queue` has been mounted the whole time; nothing in the shipped
 * shell read it back. Paul's sync reported "88 touches queued" and there was
 * nowhere in the app to see one of them.)
 *
 * THE LINE, STRUCTURAL: one touch, one press, one human. There is no batch send
 * on this surface and none may be added — no select-all, no "send the wave", no
 * client loop over /send. The server has no batch endpoint either, and that
 * absence is the design. An automation layer may ASSEMBLE work; only the
 * practitioner RELEASES it.
 *
 * COPY IS THE PRIMARY VERB, NOT SEND. Of the 88 touches the plan queued, ~51 are
 * in-person, 24 LinkedIn DM, 3 warm intro, 2 web and 2 email — and both emails
 * still carry merge fields no table can fill. A screen built around a Send
 * button would optimise for 2 rows out of 88. So every touch that carries a
 * draft offers Copy; Send appears only on the ones the server says can be
 * mailed.
 *
 * THE HONEST-SEND LAW. "Sent" is the SERVER's word, stamped only when the mail
 * service accepted the message; a refusal 502s, records `last_send_error`, and
 * leaves the touch pending. So nothing here is optimistic — every mutation
 * awaits and re-reads. There is nothing to roll back because nothing is
 * guessed.
 *
 * Exclusions are DISPLAYED WITH THEIR REASON, never filtered out: a hidden
 * do-not-pitch row looks like a lost record. `blocked` and `canEmail` are
 * computed server-side and ride on the row; the client re-tests only the live
 * textarea for surviving {merge_fields}.
 */
import { useMemo, useState } from "react";
import type { User } from "../../hooks/useAuth";
import { useOutreach, type OutreachTouch } from "../../hooks/useOutreach";
import { C, input, btnPrimary, btnGhost, mono, chip } from "./tokens";
import { localIso } from "./Leads";

/** A merge field the render could not fill, or one typed back in. */
const UNRESOLVED_RE = /\{[a-z0-9_]+\}/i;

type StatusId = "due" | "pending" | "sent" | "done" | "skipped" | "replied" | "all";

const STATUSES: { id: StatusId; label: string; query: string }[] = [
  { id: "due", label: "Due now", query: "pending" },
  { id: "pending", label: "Pending", query: "pending" },
  { id: "sent", label: "Sent", query: "sent" },
  { id: "done", label: "Done", query: "done" },
  { id: "skipped", label: "Skipped", query: "skipped" },
  { id: "replied", label: "Replied", query: "replied" },
  { id: "all", label: "All", query: "all" },
];

/** Due, as a lexicographic day compare — no Date parsing, no zone to get wrong. */
function dueCell(iso: string | null): { text: string; late: boolean; faint: boolean } {
  if (!iso) return { text: "undated", late: false, faint: true };
  const day = String(iso).slice(0, 10);
  const today = localIso();
  if (day < today) return { text: `overdue · ${day.slice(5)}`, late: true, faint: false };
  if (day === today) return { text: "due today", late: true, faint: false };
  return { text: day.slice(5), late: false, faint: false };
}

export default function OutreachScreen({ user }: { user: User | null }) {
  const [status, setStatus] = useState<StatusId>("due");
  const [openId, setOpenId] = useState<number | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const query = STATUSES.find(s => s.id === status)!.query;
  const o = useOutreach(user, query);

  /* "Due now" is the pending list narrowed to today-or-earlier. The server
     supports ?due=1, but the shared hook does not pass it, and narrowing a
     list we already hold is one fewer request and one fewer thing to keep in
     step. The count in the chip comes from the server's own tally. */
  const touches = useMemo(
    () => (status === "due" ? o.touches.filter(t => t.due_on && String(t.due_on).slice(0, 10) <= localIso()) : o.touches),
    [o.touches, status],
  );

  const tally = o.machine?.queue;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0, fontFamily: C.display, fontSize: 30, fontWeight: 600, letterSpacing: "-0.01em" }}>
          Outreach
        </h1>
        <span style={mono}>
          {tally
            ? `${tally.due} due · ${tally.pending} pending · ${tally.sent} sent · ${tally.replied} replied`
            : o.loading ? "loading…" : ""}
        </span>
      </div>
      <p style={{ margin: "6px 0 0", fontSize: 14, color: C.body, lineHeight: 1.6, maxWidth: 660 }}>
        The campaign plan, expanded into one work item per person. Most of these are
        things you do somewhere else — a conversation at an event, a LinkedIn note, a
        call — so the verb here is copy the draft, do it, mark it done. Email sends
        from here only where the plan says email and the person has an address.
      </p>

      <div style={{ marginTop: 16, display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
        {STATUSES.map(s => {
          const on = status === s.id;
          const n = s.id === "due" ? tally?.due
            : s.id === "pending" ? tally?.pending
            : s.id === "sent" ? tally?.sent
            : s.id === "replied" ? tally?.replied
            : undefined;
          return (
            <button
              key={s.id} type="button"
              onClick={() => { setStatus(s.id); setOpenId(null); setBanner(null); }}
              style={{
                ...btnGhost, padding: "5px 11px", fontSize: 12.5,
                /* the `border` SHORTHAND — see Firms.tsx: mixing it with
                   borderColor makes React warn and can strand the old colour. */
                ...(on ? { border: `1px solid ${C.green}`, color: C.green, background: C.greenTint } : null),
              }}
            >
              {s.label}
              {/* A tally exists for four of the seven; the other three would be a
                  guess, so they carry no number rather than a zero. */}
              {n != null && (
                <span style={{ ...mono, fontSize: 11.5, marginLeft: 6, color: on ? C.green : C.muted }}>{n}</span>
              )}
            </button>
          );
        })}
      </div>

      {banner && (
        <div style={{ marginTop: 12, padding: "9px 13px", background: C.greenTint, fontSize: 13.5, color: C.ink, display: "flex", gap: 10 }}>
          <span style={{ flex: 1 }}>{banner}</span>
          <button type="button" onClick={() => setBanner(null)}
                  style={{ font: "inherit", fontSize: 12.5, fontWeight: 600, color: C.green, background: "none", border: "none", cursor: "pointer" }}>
            Dismiss
          </button>
        </div>
      )}

      {o.error && (
        <div style={{ marginTop: 12, padding: "11px 13px", background: C.dangerTint, fontSize: 13.5, color: C.ink, lineHeight: 1.6 }}>
          Could not load the outreach queue ({o.error}). Nothing came back, so this is
          not a record of an empty queue.{" "}
          <button type="button" onClick={o.refresh}
                  style={{ font: "inherit", fontSize: 13, fontWeight: 700, color: C.green, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            Try again
          </button>
        </div>
      )}

      {o.loaded && !o.error && !o.machine?.waves?.length && (
        <p style={{ marginTop: 26, fontSize: 14, color: C.body, lineHeight: 1.6, maxWidth: 640 }}>
          The campaign plan isn't loaded yet. On <strong>Leads</strong>, press
          <strong> Sync register from the repo</strong> — it loads the whole machine:
          the waves, their steps, the message templates, the events, and every step's
          targets expanded into this queue.
        </p>
      )}

      {o.loaded && !o.error && !!o.machine?.waves?.length && touches.length === 0 && (
        <p style={{ marginTop: 26, fontSize: 14, color: C.muted, lineHeight: 1.6 }}>
          Nothing {status === "all" ? "here" : STATUSES.find(s => s.id === status)!.label.toLowerCase()} — the queue is clear.
        </p>
      )}

      {touches.length > 0 && (
        <div style={{ marginTop: 20, borderTop: `1px solid ${C.hair}` }}>
          {touches.map(t => (
            <TouchLine
              key={t.id}
              touch={t}
              showStatus={status === "all"}
              open={openId === t.id}
              onToggle={() => setOpenId(openId === t.id ? null : t.id)}
              onBanner={setBanner}
              send={o.sendTouch}
              setTouchStatus={o.setTouchStatus}
            />
          ))}
        </div>
      )}

      <p style={{ marginTop: 24, fontSize: 12.5, color: C.muted, lineHeight: 1.6, maxWidth: 660 }}>
        One touch, one press, one human — there is no send-all here and there never
        will be. A blocked row stays visible and says why rather than disappearing.
        Replies are not detected: <em>Replied</em> is a status you set, not a signal
        the app reads.
      </p>
    </div>
  );
}

/* ── one touch, and its draft when opened ────────────────────────────── */

function TouchLine({ touch, open, showStatus, onToggle, onBanner, send, setTouchStatus }: {
  touch: OutreachTouch;
  open: boolean;
  showStatus: boolean;
  onToggle: () => void;
  onBanner: (s: string | null) => void;
  send: (id: number, subject: string, body: string, style?: "personal" | "letterhead") => Promise<unknown>;
  setTouchStatus: (id: number, status: string) => Promise<unknown>;
}) {
  const due = dueCell(touch.due_on);
  const isEvent = !!touch.event_id && !touch.account_id;
  const who = isEvent
    ? (touch.event_name ?? "event")
    : touch.contact_name
      ? `${touch.contact_name} — ${touch.firm ?? ""}`.replace(/ — $/, "")
      : (touch.firm ?? "—");

  return (
    <div style={{ borderBottom: `1px solid ${C.hair}` }}>
      <div onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 4px", cursor: "pointer" }}>
        {/* nowrap: "overdue · 08-18" is wider than a comfortable fixed cell and
            wrapped mid-token into two lines, which made the row two lines tall
            and the date unreadable (seen driving it, 2026-08-19). */}
        <span style={{
          ...mono, flex: "none", width: 116, whiteSpace: "nowrap",
          color: due.late ? C.danger : due.faint ? C.chipBd : C.muted,
          fontWeight: due.late ? 700 : 400,
        }}>
          {due.text}
        </span>
        <div style={{ minWidth: 0, flex: "1.6 1 0" }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {who}
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {touch.step_key} · {touch.step_action}
          </div>
        </div>
        {touch.blocked && (
          <span style={{ ...chip, flex: "none", color: C.danger, background: C.dangerTint, fontSize: 11, letterSpacing: "0.04em" }}>
            {touch.blocked.toUpperCase()}
          </span>
        )}
        {!touch.blocked && touch.draft && touch.draft.unresolved.length > 0 && (
          <span style={{
            ...mono, flex: "none", fontSize: 11.5, color: C.ink,
            border: `1px solid ${C.chipBd}`, padding: "2px 7px",
          }}>
            {touch.draft.unresolved.length} to fill
          </span>
        )}
        {/* The plan's channels are PROSE ("LinkedIn DM / email", "Email
            (published address)"), so this cell always needs to truncate — with
            an ellipsis and the full string on hover, never a hard cut that
            reads as a different channel ("LinkedIn +"). */}
        <span
          title={touch.channel ?? undefined}
          style={{
            ...mono, flex: "none", width: 124, textAlign: "right", fontSize: 11.5,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}
        >
          {touch.channel ?? "—"}
        </span>
        {showStatus && (
          <span style={{ ...mono, flex: "none", width: 62, textAlign: "right", fontSize: 11.5 }}>
            {touch.status}
          </span>
        )}
      </div>
      {open && (
        <TouchPane
          /* Keyed by id at the call site's map, and the pane owns its own draft
             state — a half-typed message must never leak onto the next person. */
          key={touch.id}
          touch={touch}
          isEvent={isEvent}
          onBanner={onBanner}
          send={send}
          setTouchStatus={setTouchStatus}
        />
      )}
    </div>
  );
}

function TouchPane({ touch, isEvent, onBanner, send, setTouchStatus }: {
  touch: OutreachTouch;
  isEvent: boolean;
  onBanner: (s: string | null) => void;
  send: (id: number, subject: string, body: string, style?: "personal" | "letterhead") => Promise<unknown>;
  setTouchStatus: (id: number, status: string) => Promise<unknown>;
}) {
  const [subject, setSubject] = useState(touch.draft?.subject ?? "");
  const [body, setBody] = useState(touch.draft?.body ?? "");
  const [style, setStyle] = useState<"personal" | "letterhead">("personal");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  /* The server's `draft.unresolved` says what the RENDER could not fill; this
     regex says what is STILL in the box. Fill them and the gate opens; paste a
     {field} back in and it closes again. Both are needed — they answer
     different questions. */
  const unresolved = UNRESOLVED_RE.test(subject) || UNRESOLVED_RE.test(body);
  /* EVERY reason the button is dead has a sentence. Driving this found a
     LinkedIn-first template with no subject line: the merge fields were filled,
     the tooltip cleared, and the button stayed grey saying nothing — which is
     the failure a visible-but-dead button exists to avoid. The server refuses a
     subjectless send (`if (!subject || !body)`), so the UI must say which one
     is missing rather than leaving the reader to guess. */
  const cannotSend =
    !touch.contact_email ? "No email on the contact."
    : unresolved ? "The draft still carries {merge_fields} — fill them before sending."
    : !subject.trim() ? "This template carries no subject line — write one before it can go as an email."
    : !body.trim() ? "The message is empty."
    : null;
  const sendable = touch.canEmail && !cannotSend && !busy;

  const doSend = async () => {
    setBusy(true);
    try {
      await send(touch.id, subject, body, style);
      onBanner(`Sent to ${touch.contact_email} — logged on ${touch.firm}.`);
    } catch (e: any) {
      /* The server's own sentence, verbatim — no error taxonomy, no re-wording,
         no "something went wrong". */
      onBanner(`Not sent: ${e?.message ?? "unknown error"}`);
    } finally { setBusy(false); }
  };

  const mark = async (s: string) => {
    setBusy(true);
    try { await setTouchStatus(touch.id, s); onBanner(null); }
    catch (e: any) { onBanner(`Update failed: ${e?.message ?? "unknown error"}`); }
    finally { setBusy(false); }
  };

  const copy = async () => {
    const text = subject.trim() ? `${subject}\n\n${body}` : body;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      onBanner("The browser refused clipboard access — select the draft and copy it by hand.");
    }
  };

  return (
    <div style={{ padding: "4px 4px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
      {/* `wave_name` comes off a LEFT JOIN and is legitimately null on a step
          whose wave row is missing — interpolating it printed the literal
          "null" on screen (seen driving the mock, 2026-08-19). Every field on
          this line is joined, so every one of them is filtered, not
          interpolated. */}
      <div style={{ ...mono, fontSize: 11.5 }}>
        {[
          [touch.wave_key, touch.wave_name].filter(Boolean).join(" — ") || "no wave",
          touch.week_of ? `week of ${touch.week_of}` : null,
          touch.contact_title,
        ].filter(Boolean).join(" · ")}
      </div>

      {touch.step_objective && (
        <div style={{ fontSize: 13, color: C.body, lineHeight: 1.6 }}>{touch.step_objective}</div>
      )}

      {touch.blocked && (
        <div style={{ padding: "9px 12px", background: C.dangerTint, fontSize: 13.5, color: C.ink }}>
          <strong>Blocked: {touch.blocked}.</strong> The machine never mails this record.
        </div>
      )}

      {/* an event touch is a diary entry, not a message */}
      {isEvent && (
        <div style={{ fontSize: 13.5, color: C.body, lineHeight: 1.8 }}>
          {touch.event_date && <div><strong>When:</strong> {touch.event_date}</div>}
          {touch.registration_status && <div><strong>Registration:</strong> {touch.registration_status}</div>}
          {touch.prep_deadline && touch.prep_deadline !== "N/A" && <div><strong>Prep by:</strong> {touch.prep_deadline}</div>}
        </div>
      )}

      {/* the sent audit copy — the words that actually went out, not a re-render */}
      {touch.status === "sent" && touch.subject_sent && (
        <div style={{ background: C.panel, padding: "10px 12px", fontSize: 13, lineHeight: 1.6 }}>
          <div style={{ ...mono, fontSize: 11.5, marginBottom: 4 }}>
            SENT {String(touch.sent_at ?? "").slice(0, 10)} — THE AUDIT COPY
          </div>
          <div style={{ fontWeight: 700 }}>{touch.subject_sent}</div>
          <div style={{ whiteSpace: "pre-wrap", color: C.body, marginTop: 4 }}>{touch.body_sent}</div>
        </div>
      )}

      {/* the draft */}
      {!isEvent && touch.draft && touch.status === "pending" && (
        <>
          {touch.draft.unresolved.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", fontSize: 12.5, color: C.body }}>
              <span><strong>Fill before sending:</strong></span>
              {/* braces kept, so the chip IS the string to hunt for in the box */}
              {touch.draft.unresolved.map(f => (
                <span key={f} style={{ ...mono, fontSize: 11.5, color: C.ink, border: `1px solid ${C.chipBd}`, padding: "2px 7px" }}>
                  {`{${f}}`}
                </span>
              ))}
            </div>
          )}
          <input
            value={subject} onChange={e => setSubject(e.target.value)}
            placeholder="Subject"
            style={{ ...input, fontWeight: 700, fontSize: 13.5 }}
          />
          <textarea
            value={body} onChange={e => setBody(e.target.value)} rows={12}
            style={{ ...input, resize: "vertical", lineHeight: 1.6, minHeight: 200, fontSize: 13.5 }}
          />
          {touch.template_guardrails && (
            <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6 }}>
              <strong>Guardrails ({touch.template_key}):</strong> {touch.template_guardrails}
            </div>
          )}
          {touch.last_send_error && (
            <div style={{ fontSize: 12.5, color: C.danger }}>Last attempt: {touch.last_send_error}</div>
          )}
        </>
      )}

      {!isEvent && !touch.draft && touch.status === "pending" && (
        <div style={{ fontSize: 13.5, color: C.body, lineHeight: 1.6 }}>
          No template on this touch — it's a task, not a message. Do the step's action
          by hand and mark it done.
        </div>
      )}

      {/* the voice, only where a send is possible */}
      {touch.canEmail && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12.5, color: C.muted }}>Send as:</span>
          {([["personal", "Personal note"], ["letterhead", "House letterhead"]] as const).map(([id, label]) => (
            <button key={id} type="button" onClick={() => setStyle(id)}
                    style={{ ...btnGhost, ...(style === id ? { border: `1px solid ${C.green}`, color: C.green } : null) }}>
              {label}
            </button>
          ))}
          <span style={{ fontSize: 12.5, color: C.muted, flex: "1 1 240px" }}>
            {style === "personal"
              ? "Bare text, as if typed — the right read for a cold first touch."
              : "The same words on the site's chrome: rule, wordmark, signature. For readers who already know you."}
          </span>
        </div>
      )}

      {/* the presses */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {touch.canEmail && touch.status === "pending" && (
          <button
            type="button" onClick={() => void doSend()} disabled={!sendable}
            title={cannotSend ?? undefined}
            style={{ ...btnPrimary, opacity: sendable ? 1 : 0.45, cursor: sendable ? "pointer" : "default" }}
          >
            {busy ? "Sending…" : `Send to ${touch.contact_email}`}
          </button>
        )}
        {/* Copy is offered on every draft the machine will not mail — which is
            most of them. A BLOCKED touch gets no path to a message at all, not
            even a copy button. */}
        {!touch.canEmail && !touch.blocked && !isEvent && touch.draft && touch.status === "pending" && (
          <button
            type="button" onClick={() => void copy()} style={btnPrimary}
            title={touch.contact_email ? `Channel is "${touch.channel}"` : "No email on this contact"}
          >
            {copied ? "Copied" : "Copy draft"}
          </button>
        )}
        {touch.status === "pending" && (
          <>
            <button type="button" style={btnGhost} disabled={busy} onClick={() => void mark("done")}>Mark done</button>
            <button type="button" style={{ ...btnGhost, color: C.muted }} disabled={busy} onClick={() => void mark("skipped")}>Skip</button>
          </>
        )}
        {(touch.status === "sent" || touch.status === "done") && (
          <button type="button" style={btnGhost} disabled={busy} onClick={() => void mark("replied")}>They replied</button>
        )}
        {touch.status !== "pending" && touch.status !== "sent" && (
          <button type="button" style={{ ...btnGhost, color: C.muted }} disabled={busy} onClick={() => void mark("pending")}>
            Put back in the queue
          </button>
        )}
        {touch.account_id && (
          <span style={{ ...mono, fontSize: 11.5, marginLeft: "auto" }}>
            {touch.firm}{touch.stage ? ` · ${touch.stage}` : ""}
          </span>
        )}
      </div>

      {/* the reason in words, not only in a tooltip — a title attribute is
          invisible on a touch device and easy to miss on a desktop */}
      {touch.canEmail && touch.status === "pending" && cannotSend && (
        <div style={{ fontSize: 12.5, color: C.muted, marginTop: -4 }}>{cannotSend}</div>
      )}
    </div>
  );
}
