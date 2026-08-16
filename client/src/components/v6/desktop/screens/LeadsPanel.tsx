/**
 * THE LEADS WORKLIST — the public funnel finally reaches the CRM.
 *
 * FRONT_END_REBUILD.md §3, gap 2, measured: `practice_leads` had ZERO
 * references in the CRM — the Acquisition Engine on the practice site
 * captured leads into a table nobody worked. This is the missing flow:
 * see what came in, convert it to an account, or dismiss it with the row
 * kept (the funnel's history is data).
 *
 * ── WHY CONVERT ASKS FOR A FIRM NAME ────────────────────────────────────
 * The funnel captures a persona, a thesis and an email — not a company. The
 * server refuses to convert without a firm name rather than inventing one
 * from the email domain, because a fabricated CRM identity is the workspace
 * law's worst failure: a fabricated contact gets EMAILED. The one field on
 * this panel is the practitioner supplying the one fact the funnel could not.
 *
 * ── THE LINE ────────────────────────────────────────────────────────────
 * Converting creates a ROW. It sends nothing — the first touch still goes
 * through the outreach machine's one-touch-one-press rule.
 */
import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { T } from "../atlasTokens";
import { authHeaders } from "../../../../hooks/useAuth";
import { GroupHeader, ResultRow, InfoBanner } from "../kit";

export interface FunnelLead {
  id: number;
  persona: string | null;
  thesis: string | null;
  size_geo: string | null;
  email: string | null;
  source: string | null;
  created_at: string;
}

export function LeadsPanel({ onConverted }: { onConverted: (accountId: number) => void }) {
  const [leads, setLeads] = useState<FunnelLead[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [firmDraft, setFirmDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/crm/leads", { headers: authHeaders() })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(d => setLeads(d.leads ?? []))
      .catch(() => setFailed(true));
  }, []);

  useEffect(load, [load]);

  const convert = useCallback(async (lead: FunnelLead) => {
    setBusy(true); setErr(null);
    try {
      const r = await fetch(`/api/crm/leads/${lead.id}/convert`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ firm: firmDraft.trim() }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) throw new Error(j?.error || String(r.status));
      setOpenId(null); setFirmDraft("");
      load();
      onConverted(j.accountId);
    } catch (e: any) {
      setErr(e?.message || "Conversion failed.");
    } finally { setBusy(false); }
  }, [firmDraft, load, onConverted]);

  const dismiss = useCallback(async (lead: FunnelLead) => {
    setBusy(true); setErr(null);
    try {
      const r = await fetch(`/api/crm/leads/${lead.id}/dismiss`, {
        method: "POST", headers: authHeaders(),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => null))?.error || String(r.status));
      load();
    } catch (e: any) {
      setErr(e?.message || "Dismiss failed.");
    } finally { setBusy(false); }
  }, [load]);

  if (failed) return <InfoBanner tone="caution">The leads list did not load — retry from the Leads chip.</InfoBanner>;
  if (leads === null) return <div style={quiet}>Loading the funnel…</div>;
  if (leads.length === 0) {
    return (
      <div style={emptyBox}>
        No unworked leads. Everything the Acquisition Engine has captured is
        either converted or dismissed — the funnel is clear.
      </div>
    );
  }

  return (
    <div style={{ border: `1px solid ${T.border}`, background: T.white }}>
      <GroupHeader title={`Funnel leads · ${leads.length}`} columns={["Captured"]} />
      {leads.map(l => (
        <div key={l.id}>
          <ResultRow
            anchor={l.persona || "(no persona captured)"}
            sub={l.thesis ? l.thesis.slice(0, 140) : undefined}
            subLink={l.email ?? undefined}
            selected={openId === l.id}
            onClick={() => { setOpenId(openId === l.id ? null : l.id); setErr(null); }}
            values={[{ text: l.created_at ? String(l.created_at).slice(0, 10) : null }]}
          />
          {openId === l.id && (
            <div style={convertRow}>
              {l.size_geo && <p style={meta}>Size / geo: {l.size_geo}</p>}
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  value={firmDraft}
                  onChange={e => setFirmDraft(e.target.value)}
                  placeholder="Firm name — the funnel does not capture one"
                  style={input}
                />
                <button type="button" onClick={() => convert(l)} disabled={busy || !firmDraft.trim()} style={primaryBtn}>
                  {busy ? "Converting…" : "Convert to account"}
                </button>
                <button type="button" onClick={() => dismiss(l)} disabled={busy} style={ghostBtn}>
                  Dismiss
                </button>
              </div>
              {err && <p style={errText}>{err}</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const quiet: CSSProperties = { fontSize: 12, color: T.muted2 };
const emptyBox: CSSProperties = {
  border: `1px solid ${T.border}`, background: T.white,
  padding: "18px 14px", fontSize: 12.5, color: T.muted, lineHeight: 1.6,
};
const convertRow: CSSProperties = {
  padding: "10px 12px", borderTop: `1px solid ${T.border}`, background: T.track,
};
const meta: CSSProperties = { margin: "0 0 8px", fontSize: 11.5, color: T.muted };
const input: CSSProperties = {
  font: "inherit", fontSize: 12.5, color: T.ink, background: T.white,
  border: `1px solid ${T.inputBd}`, borderRadius: 10, padding: "6px 9px", minWidth: 260,
};
const primaryBtn: CSSProperties = {
  font: "inherit", fontSize: 12.5, fontWeight: 700, color: "#fff", background: T.ink,
  border: "none", borderRadius: 10, padding: "7px 13px", cursor: "pointer",
};
const ghostBtn: CSSProperties = {
  font: "inherit", fontSize: 12.5, fontWeight: 600, color: T.muted,
  background: "transparent", border: `1px solid ${T.inputBd}`,
  borderRadius: 10, padding: "7px 12px", cursor: "pointer",
};
const errText: CSSProperties = { margin: "6px 0 0", fontSize: 11.5, color: T.amber };
