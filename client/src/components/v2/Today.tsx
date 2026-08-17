/**
 * TODAY — the work queue (SMBX_CRM_V2_SPEC.md §6.1). A queue, not a
 * dashboard: no charts, no vanity numbers, just what to touch.
 *
 * Slice 1 carries section 1 whole (LinkedIn follow-ups due, overdue first in
 * red, one-tap log + reschedule inline). Sections 2 and 3 (pipeline next
 * steps, content queued) arrive WITH their builds and say so in one quiet
 * line each — a section that renders machinery before its surface exists is
 * the old front end's mistake.
 */
import { useCallback, useEffect, useState } from "react";
import { authHeaders } from "../../hooks/useAuth";
import { C, mono } from "./tokens";
import { LeadLine, type LeadRow } from "./Leads";

export default function TodayScreen({ onGoLeads }: { onGoLeads: () => void }) {
  const [due, setDue] = useState<LeadRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);

  const load = useCallback(() => {
    fetch("/api/leads?due=1", { headers: authHeaders() })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(d => { setDue(d.leads ?? []); setError(null); })
      .catch(e => setError(e?.message ?? "load failed"));
  }, []);
  useEffect(load, [load]);

  const patch = useCallback(async (id: number, body: Record<string, unknown>) => {
    const r = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (r.ok) load();
    return r.ok;
  }, [load]);

  const touch = useCallback(async (id: number, kind: string) => {
    await fetch(`/api/leads/${id}/touch`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ kind }),
    });
    load();
  }, [load]);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div>
      <h1 style={{ margin: 0, fontFamily: C.display, fontSize: 30, fontWeight: 600, letterSpacing: "-0.01em" }}>
        Today
      </h1>
      <p style={{ margin: "6px 0 0", fontSize: 14, color: C.body }}>{today}</p>

      {/* 1 · LinkedIn follow-ups due */}
      <section style={{ marginTop: 26 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>LinkedIn follow-ups due</h2>
          {due !== null && <span style={mono}>{due.length}</span>}
        </div>

        {error && (
          <p style={{ marginTop: 10, padding: "9px 13px", background: C.dangerTint, fontSize: 13.5, color: C.ink }}>
            Could not load the queue ({error}). Reload the page.
          </p>
        )}
        {due !== null && due.length === 0 && !error && (
          <p style={{ marginTop: 10, fontSize: 14, color: C.muted, lineHeight: 1.6 }}>
            Nothing due. Hunt or rest —{" "}
            <button type="button" onClick={onGoLeads}
                    style={{ font: "inherit", fontSize: 14, fontWeight: 600, color: C.green,
                             background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              add the people you found →
            </button>
          </p>
        )}
        {due !== null && due.length > 0 && (
          <div style={{ marginTop: 12, borderTop: `1px solid ${C.hair}` }}>
            {due.map(l => (
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
      </section>

      {/* 2 & 3 — arrive with their builds, and say so instead of pretending */}
      <section style={{ marginTop: 30, borderTop: `1px solid ${C.hair}`, paddingTop: 14 }}>
        <p style={{ margin: 0, fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
          Pipeline next steps land here with the Pipeline build; content queued
          today lands with the Campaigns build. One surface at a time — each
          earns the next.
        </p>
      </section>
    </div>
  );
}
