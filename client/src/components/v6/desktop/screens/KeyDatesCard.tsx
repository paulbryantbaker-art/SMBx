/**
 * KEY DATES — the deal's calendar commitments, editable in place.
 *
 * CRM_WORKFLOW_SPEC.md build order §2 (migration 131). Five DATE columns,
 * two kinds of fact, and the card says so out loud:
 *   · RECORDS — IoI sent, LOI signed. They date the file; nothing counts
 *     down to a thing that already happened.
 *   · DEADLINES — exclusivity expiry, financing commitment, target close.
 *     These drive Today's countdown, and a PAST deadline still binds — an
 *     expired exclusivity is the loudest fact on the board, so it renders
 *     terra rather than disappearing.
 *
 * THE CELL IS THE CRITERIA-CELL SHAPE (ScenarioPanel's AssumptionCell):
 * filled T.track, radius 8, small label over a bold value — here the value
 * is a transparent-styled `<input type="date">`, so the cell IS the editor
 * and there is no separate edit mode.
 *
 * SAVES ON CHANGE, one field per PATCH. A cleared input PATCHes null —
 * clearing is legal (a walked-back LOI un-dates the file). A refused save
 * shows the server's error verbatim; this file invents no message and no
 * date. Missing ≠ zero: an unset date is an empty cell, never "today".
 */
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { T } from "../atlasTokens";
import { authHeaders } from "../../../../hooks/useAuth";
import { daysUntil, dueLabel } from "../../../../lib/crm";

/** Mirrors DATE_KEYS / LABEL in server/routes/dealDates.ts. `deadline` marks
 *  the three that count down; the two records carry no countdown line. */
const KEY_DATES = [
  { key: "ioi_sent_on", label: "IoI sent", deadline: false },
  { key: "loi_signed_on", label: "LOI signed", deadline: false },
  { key: "exclusivity_expires_on", label: "Exclusivity expires", deadline: true },
  { key: "financing_commitment_on", label: "Financing commitment", deadline: true },
  { key: "target_close_on", label: "Target close", deadline: true },
] as const;
type DateKey = (typeof KEY_DATES)[number]["key"];

type Dates = Record<DateKey, string | null>;

export function KeyDatesCard({ dealId }: { dealId: number }) {
  const [dates, setDates] = useState<Dates | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setLoaded(false); setError(null); setDates(null);
    fetch(`/api/deals/${dealId}/dates`, { headers: authHeaders() })
      .then(r => (r.ok ? r.json() : r.json().then((d: any) => Promise.reject(d?.error ?? `HTTP ${r.status}`))))
      .then(d => { if (live) setDates(d.dates); })
      .catch(e => { if (live) setError(typeof e === "string" ? e : "Could not load the key dates"); })
      .finally(() => { if (live) setLoaded(true); });
    return () => { live = false; };
  }, [dealId]);

  /* One field per PATCH — the single changed key, nothing else. The server's
     refusal (a malformed date names its field) is shown verbatim. */
  const save = async (key: DateKey, value: string) => {
    const next = value || null;
    const prev = dates;
    setError(null);
    setDates(d => (d ? { ...d, [key]: next } : d));
    try {
      const r = await fetch(`/api/deals/${dealId}/dates`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: next }),
      });
      const d = await r.json().catch(() => null);
      if (!r.ok) throw new Error(d?.error ?? `HTTP ${r.status}`);
      setDates(d.dates);
    } catch (e: any) {
      setDates(prev);
      setError(e?.message ?? "Could not save");
    }
  };

  if (!loaded) {
    return <div style={{ fontSize: 13, color: T.muted2 }}>Loading the key dates…</div>;
  }
  if (!dates) {
    return <div style={{ fontSize: 13, color: T.terra }}>{error ?? "Could not load the key dates"}</div>;
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {KEY_DATES.map(k => (
          <DateCell
            key={k.key}
            label={k.label}
            deadline={k.deadline}
            value={dates[k.key]}
            onSave={v => save(k.key, v)}
          />
        ))}
      </div>

      {error && <div style={errorLine}>{error}</div>}

      <div style={caption}>
        Records (IoI, LOI) date the file; deadlines (exclusivity, financing,
        close) drive Today&rsquo;s countdown.
      </div>
    </div>
  );
}

/* ── one cell ─────────────────────────────────────────────────────────── */

/** The criteria-cell shape carrying a date input. Deadlines that are set also
 *  carry their countdown — amber inside a week, terra once past, quiet
 *  otherwise. Records never count down. */
function DateCell({ label, deadline, value, onSave }: {
  label: string;
  deadline: boolean;
  value: string | null;
  onSave: (v: string) => void;
}) {
  const d = deadline && value ? daysUntil(value) : null;
  const tone = d == null ? null : d < 0 ? T.terra : d <= 7 ? T.amber : T.muted;
  return (
    <label style={cellWrap}>
      <span style={cellLabel}>{label}</span>
      <input
        type="date"
        value={value ?? ""}
        onChange={e => onSave(e.target.value)}
        style={cellInput}
        aria-label={label}
      />
      {d != null && (
        <span style={{ ...countLine, color: tone ?? T.muted }}>
          {dueLabel(value)}
        </span>
      )}
    </label>
  );
}

/* ── styles — the criteria-cell scale ─────────────────────────────────── */

const cellWrap: CSSProperties = {
  flex: "1 1 150px", background: T.track, borderRadius: 8, padding: "9px 14px",
  display: "flex", flexDirection: "column", gap: 2, minWidth: 0, cursor: "text",
};
const cellLabel: CSSProperties = { fontSize: 12, color: T.muted };
const cellInput: CSSProperties = {
  font: "inherit", fontSize: 14, fontWeight: 700, color: T.ink,
  background: "transparent", border: "none", outline: "none",
  padding: 0, width: "100%", minWidth: 0, colorScheme: "light",
};
const countLine: CSSProperties = {
  fontSize: 13, fontWeight: 600, fontVariantNumeric: "tabular-nums",
};
const errorLine: CSSProperties = {
  marginTop: 10, fontSize: 13, color: T.terra, lineHeight: 1.5,
};
const caption: CSSProperties = {
  marginTop: 10, fontSize: 12.5, color: T.muted2, lineHeight: 1.55,
};
