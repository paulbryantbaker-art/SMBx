/**
 * THE ENGAGEMENT CARD — the contract between a client and the practice,
 * finally a thing on the screen.
 *
 * FRONT_END_REBUILD.md §3: the app could record a firm and a target but not
 * the contract between them — which client engaged us, when the letter was
 * signed, what retainer stands paid. Migration 129 stores those FACTS;
 * `house/engagement.ts` computes what the published schedule says about them;
 * this renders both and edits the facts.
 *
 * ── WHAT IS EDITABLE, AND WHAT DELIBERATELY IS NOT ──────────────────────
 * Dates, retainer received, Premium, status — the facts. The RATES are not on
 * this card and not in the API: one schedule, every client, no negotiated
 * pricing. A rate field would be the negotiation the schedule forbids,
 * rendered as an input.
 *
 * ── THE LINE ────────────────────────────────────────────────────────────
 * Internal book-keeping of a schedule papered by the engagement letter. This
 * card mails nothing, quotes nothing to anybody, and the close-preview is
 * arithmetic the practitioner runs for themselves — it writes no row.
 */
import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { T } from "../atlasTokens";
import { authHeaders } from "../../../../hooks/useAuth";
import { InfoBanner } from "../kit";

interface Engagement {
  id: number;
  status: string;
  letterSignedOn: string | null;
  startedOn: string | null;
  quarterRateCents: number;
  retainerPaidCents: number;
  premium: boolean;
  notes: string | null;
  quartersCovered: number;
  creditRule: string | null;
}

export function EngagementCard({ accountId }: { accountId: number }) {
  const [rows, setRows] = useState<Engagement[] | null>(null);
  const [schedule, setSchedule] = useState<string>("");
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [payDraft, setPayDraft] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch(`/api/crm/accounts/${accountId}/engagements`, { headers: authHeaders() })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(d => { setRows(d.engagements ?? []); setSchedule(d.schedule ?? ""); })
      .catch(() => setFailed(true));
  }, [accountId]);

  useEffect(() => {
    setRows(null); setFailed(false); setErr(null); setPayDraft("");
    load();
  }, [load]);

  const create = useCallback(async () => {
    setBusy(true); setErr(null);
    try {
      const r = await fetch(`/api/crm/accounts/${accountId}/engagements`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => null))?.error || String(r.status));
      load();
    } catch (e: any) {
      setErr(e?.message || "Could not create the engagement.");
    } finally { setBusy(false); }
  }, [accountId, load]);

  const recordPayment = useCallback(async (eng: Engagement) => {
    const dollars = Number(payDraft.replace(/[$,\s]/g, ""));
    if (!Number.isFinite(dollars) || dollars <= 0) { setErr("Enter the amount received, in dollars."); return; }
    setBusy(true); setErr(null);
    try {
      const r = await fetch(`/api/crm/engagements/${eng.id}`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        /* Cents on the wire, house rule 10 — the conversion happens exactly
           here and nowhere else. ADDS to the running total: the field is
           "what came in", not "set the balance". */
        body: JSON.stringify({ retainerPaidCents: eng.retainerPaidCents + Math.round(dollars * 100) }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => null))?.error || String(r.status));
      setPayDraft("");
      load();
    } catch (e: any) {
      setErr(e?.message || "Could not record the payment.");
    } finally { setBusy(false); }
  }, [payDraft, load]);

  if (failed) return <InfoBanner tone="caution">The engagement record did not load. Retry by reselecting the firm.</InfoBanner>;
  if (rows === null) return <div style={quiet}>Loading the engagement…</div>;

  const eng = rows.find(e => e.status === "active") ?? rows[0] ?? null;

  if (!eng) {
    return (
      <div>
        <p style={para}>
          No engagement on file. A firm without one is a prospect — the
          engagement letter is what turns the relationship into a mandate.
        </p>
        <button type="button" onClick={create} disabled={busy} style={primaryBtn}>
          {busy ? "Creating…" : "Open a draft engagement"}
        </button>
        {err && <p style={errText}>{err}</p>}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
        <Stat label="Status" value={eng.status} />
        <Stat label="Retainer received" value={money(eng.retainerPaidCents)} />
        <Stat
          label="Quarters covered"
          value={String(eng.quartersCovered)}
          sub={`at ${money(eng.quarterRateCents)} / quarter`}
        />
        {eng.premium && <Stat label="Premium" value="yes" sub="retainer continues through integration" />}
      </div>

      {/* The credit rule, in the schedule's own words — house/engagement.ts
          wrote this sentence, the card only repeats it. */}
      {eng.creditRule && <p style={{ ...para, marginTop: 10 }}>{eng.creditRule}</p>}

      <div style={{ display: "flex", gap: 6, marginTop: 10, alignItems: "center" }}>
        <input
          value={payDraft}
          onChange={e => setPayDraft(e.target.value)}
          placeholder="Record a payment ($)"
          inputMode="decimal"
          style={input}
        />
        <button type="button" onClick={() => recordPayment(eng)} disabled={busy || !payDraft.trim()} style={primaryBtn}>
          {busy ? "Saving…" : "Record"}
        </button>
      </div>
      {err && <p style={errText}>{err}</p>}

      {/* The schedule itself, collapsed — reference, not a quote. */}
      {schedule && (
        <details style={{ marginTop: 10 }}>
          <summary style={summaryStyle}>The schedule</summary>
          <p style={{ ...para, marginTop: 6 }}>{schedule}</p>
        </details>
      )}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div style={statLabel}>{label}</div>
      <div style={statValue}>{value}</div>
      {sub && <div style={statSub}>{sub}</div>}
    </div>
  );
}

function money(cents: number): string {
  const d = cents / 100;
  if (Math.abs(d) >= 1_000_000) return `$${(d / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (Math.abs(d) >= 1_000) return `$${Math.round(d / 1_000)}K`;
  return `$${Math.round(d)}`;
}

const para: CSSProperties = { margin: 0, fontSize: 12, color: T.muted, lineHeight: 1.55 };
const quiet: CSSProperties = { fontSize: 12, color: T.muted2 };
const errText: CSSProperties = { margin: "6px 0 0", fontSize: 11.5, color: T.amber };
const statLabel: CSSProperties = {
  fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: T.muted2,
};
const statValue: CSSProperties = { fontSize: 15, fontWeight: 700, color: T.ink, marginTop: 2 };
const statSub: CSSProperties = { fontSize: 11, color: T.muted, marginTop: 1 };
const input: CSSProperties = {
  font: "inherit", fontSize: 12.5, color: T.ink, background: T.white,
  border: `1px solid ${T.inputBd}`, borderRadius: 10, padding: "6px 9px", width: 170,
};
const primaryBtn: CSSProperties = {
  font: "inherit", fontSize: 12.5, fontWeight: 700, color: "#fff", background: T.ink,
  border: "none", borderRadius: 10, padding: "7px 13px", cursor: "pointer",
};
const summaryStyle: CSSProperties = { fontSize: 11.5, fontWeight: 700, color: T.blue, cursor: "pointer" };
