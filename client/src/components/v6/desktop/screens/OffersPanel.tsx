/**
 * Atlas — OFFERS panel (advisor sell-side cockpit, Phase 2).
 *
 * Captures each buyer's structured IOI/LOI terms and compares them side by side.
 * A sibling Card to BuyerFunnel on the SELL-side Cockpit. Real data via
 * useDealOffers; buyer names resolved via useDealBuyers.
 *
 * THE LINE (load-bearing): this SHOWS the structured terms and their structural
 * implications and STOPS. No best-offer highlight, no score, no ranking, no
 * accept/sign action. The "Draft a counter" action routes to Yulia with explicit
 * "do not send" phrasing — the agent drafts, the human sends. Money is integer
 * cents end-to-end; dollar entry converts at submit; un-stated terms render "—".
 * The comparison breakdown is PRE-TAX and STRUCTURAL only — never an after-tax
 * "net to seller", never a tax/valuation opinion.
 *
 * Polish standard: floats on the canvas, T.border + shCard, tone not lines.
 */
import { useMemo, useState } from "react";
import type { User } from "../../../../hooks/useAuth";
import {
  useDealOffers,
  OFFER_TYPES,
  OFFER_STATUSES,
  type DealOffer,
  type OfferType,
  type OfferStatus,
  type OfferInput,
} from "../../../../hooks/useDealOffers";
import { useDealBuyers } from "../../../../hooks/useDealBuyers";
import { T } from "../atlasTokens";
import { Pill, Segmented, fmtCents } from "../primitives";
import { PlusIcon, CloseIcon, SendArrowIcon } from "../icons";

const TYPE_TONE: Record<OfferType, { bg: string; fg: string }> = {
  ioi: { bg: T.blueBg, fg: T.blue },
  loi: { bg: T.violetBg, fg: T.violet },
};
const STATUS_TONE: Record<OfferStatus, { bg: string; fg: string }> = {
  received: { bg: T.track, fg: T.muted2 },
  under_review: { bg: T.amberBg, fg: T.amber },
  countered: { bg: T.blueBg, fg: T.blue },
  accepted: { bg: T.greenBg, fg: T.green },
  declined: { bg: T.track, fg: T.muted2 },
  expired: { bg: T.track, fg: T.muted2 },
  withdrawn: { bg: T.track, fg: T.muted2 },
};

const DECISION_LINE =
  "Atlas shows the structured terms and their implications. You decide which offer to accept.";

type View = "list" | "compare";

export default function OffersPanel({
  user,
  dealId,
  dealName,
  onAskYulia,
}: {
  user: User | null;
  dealId: number;
  dealName: string;
  onAskYulia: (prompt: string) => void;
}) {
  const { offers, loading, error, canFetch, addOffer, updateOffer, removeOffer } = useDealOffers(user, dealId);
  const { buyers } = useDealBuyers(user, dealId);
  const [view, setView] = useState<View>("list");
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const buyerName = useMemo(() => {
    const m = new Map<number, string>();
    for (const b of buyers) m.set(b.id, b.name);
    return (o: DealOffer) => (o.buyer_id != null && m.get(o.buyer_id)) || o.buyer_name || "Unnamed buyer";
  }, [buyers]);

  const sorted = useMemo(
    () => [...offers].sort((a, b) => (b.created_at || "").localeCompare(a.created_at || "")),
    [offers],
  );

  const editing = editId != null ? offers.find((o) => o.id === editId) ?? null : null;

  const submit = async (input: OfferInput) => {
    if (editId != null) await updateOffer(editId, input);
    else await addOffer(input);
    setAdding(false);
    setEditId(null);
  };

  const canCompare = offers.length >= 2;
  const showForm = adding || editing != null;

  return (
    <div style={S.card}>
      {/* header */}
      <div style={S.head}>
        <div style={S.title}>Offers</div>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          {canCompare && (
            <Segmented<View>
              options={[
                { id: "list", label: "List" },
                { id: "compare", label: "Compare" },
              ]}
              value={view}
              onChange={setView}
            />
          )}
          <button
            type="button"
            style={S.addBtn}
            onClick={() => {
              setEditId(null);
              setAdding((v) => !v);
            }}
          >
            <PlusIcon size={14} c={T.blue} /> Add offer
          </button>
        </div>
      </div>

      {offers.length > 0 && <div style={S.decision}>{DECISION_LINE}</div>}

      {/* add / edit form */}
      {showForm && (
        <OfferForm
          key={editing?.id ?? "new"}
          buyers={buyers.map((b) => ({ id: b.id, name: b.name }))}
          initial={editing}
          onSubmit={submit}
          onCancel={() => {
            setAdding(false);
            setEditId(null);
          }}
        />
      )}

      {/* body / states */}
      {!canFetch ? (
        <div style={S.empty}>Sign in to capture and compare the offers on this deal.</div>
      ) : loading ? (
        <div style={S.empty}>Loading offers…</div>
      ) : error ? (
        <div style={S.empty}>{error}</div>
      ) : offers.length === 0 ? (
        !showForm && (
          <div style={S.empty}>
            No offers logged yet. Add an IOI or LOI as it comes in for {dealName} — or{" "}
            <button
              type="button"
              style={S.linkBtn}
              onClick={() => onAskYulia(`Help me log the latest offer on ${dealName} — I'll give you the terms.`)}
            >
              ask Yulia to log the latest offer →
            </button>
          </div>
        )
      ) : view === "compare" && canCompare ? (
        <CompareTable offers={sorted} buyerName={buyerName} />
      ) : (
        <div style={S.list}>
          {sorted.map((o) => (
            <OfferRow
              key={o.id}
              offer={o}
              name={buyerName(o)}
              onStatus={(status) => updateOffer(o.id, { status })}
              onEdit={() => {
                setAdding(false);
                setEditId(o.id);
              }}
              onDraftCounter={() =>
                onAskYulia(
                  `Draft a counter to ${buyerName(o)}'s ${o.offer_type.toUpperCase()} for ${dealName}. ` +
                    `Do not send it — I'll review it first.`,
                )
              }
              onRemove={() => removeOffer(o.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── List row ───────────────────────────────────────────────── */

function OfferRow({
  offer,
  name,
  onStatus,
  onEdit,
  onDraftCounter,
  onRemove,
}: {
  offer: DealOffer;
  name: string;
  onStatus: (status: OfferStatus) => void;
  onEdit: () => void;
  onDraftCounter: () => void;
  onRemove: () => void;
}) {
  const tType = TYPE_TONE[offer.offer_type];
  const c = certainty(offer);
  // One denominator for both the headline and the % at-risk so they never disagree.
  const denom = offer.total_price_cents ?? (c.base || null);
  return (
    <div style={S.row}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={S.rowTop}>
          <span style={S.name}>{name}</span>
          <Pill bg={tType.bg} fg={tType.fg}>{offer.offer_type.toUpperCase()}</Pill>
          {expiryNote(offer.expires_at)}
        </div>
        <div style={S.rowSub}>
          <span style={S.headline}>{fmtCents(denom)}</span>
          <span style={S.sep}>·</span>
          <span>{fmtCents(c.certain || null)} cash</span>
          {c.atRisk > 0 && denom != null && (
            <>
              <span style={S.sep}>·</span>
              <span>{pct(c.atRisk, denom)} at risk</span>
            </>
          )}
        </div>
      </div>
      <select
        value={offer.status}
        onChange={(e) => onStatus(e.target.value as OfferStatus)}
        style={S.statusSelect}
        aria-label="Status"
      >
        {OFFER_STATUSES.map((s) => (
          <option key={s.id} value={s.id}>{s.label}</option>
        ))}
      </select>
      <button type="button" title="Edit terms" style={S.iconBtn} onClick={onEdit}>
        <span style={{ fontSize: 12.5, color: T.muted2 }}>Edit</span>
      </button>
      <button type="button" title="Draft a counter with Yulia (you send)" style={S.iconBtn} onClick={onDraftCounter}>
        <SendArrowIcon size={14} c={T.blue} />
      </button>
      <button type="button" title="Remove" style={S.iconBtn} onClick={onRemove}>
        <CloseIcon size={13} c={T.muted2} />
      </button>
    </div>
  );
}

/* ─── Compare table ──────────────────────────────────────────── */

function CompareTable({ offers, buyerName }: { offers: DealOffer[]; buyerName: (o: DealOffer) => string }) {
  const rows: { label: string; cell: (o: DealOffer) => React.ReactNode; sub?: (o: DealOffer) => string | null }[] = [
    { label: "Total price", cell: (o) => fmtCents(o.total_price_cents) },
    { label: "Cash at close", cell: (o) => fmtCents(o.cash_at_close_cents) },
    {
      label: "Seller note",
      cell: (o) => fmtCents(o.seller_note_cents),
      sub: (o) => noteSub(o),
    },
    {
      label: "Earnout (max)",
      cell: (o) => fmtCents(o.earnout_cents),
      sub: (o) => (o.earnout_term_months ? `over ${o.earnout_term_months} mo` : o.earnout_basis || null),
    },
    { label: "Rollover", cell: (o) => fmtCents(o.rollover_cents) },
    { label: "Escrow / holdback", cell: (o) => fmtCents(o.escrow_holdback_cents) },
    { label: "Exclusivity", cell: (o) => (o.exclusivity_days ? `${o.exclusivity_days} days` : "—") },
    { label: "Expires", cell: (o) => expiryText(o.expires_at) },
  ];

  return (
    <div style={S.compareWrap}>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={{ ...S.th, ...S.frozen }} />
            {offers.map((o) => {
              const t = TYPE_TONE[o.offer_type];
              return (
                <th key={o.id} style={S.th}>
                  <div style={S.colName} title={buyerName(o)}>{buyerName(o)}</div>
                  <Pill bg={t.bg} fg={t.fg} style={{ marginTop: 4 }}>{o.offer_type.toUpperCase()}</Pill>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td style={{ ...S.tdLabel, ...S.frozen }}>{r.label}</td>
              {offers.map((o) => {
                const sub = r.sub?.(o);
                return (
                  <td key={o.id} style={S.td}>
                    <div style={S.cellVal}>{r.cell(o)}</div>
                    {sub && <div style={S.cellSub}>{sub}</div>}
                  </td>
                );
              })}
            </tr>
          ))}

          {/* Structural breakdown — pre-tax certainty triad. No ranking, no "best". */}
          <tr>
            <td style={{ ...S.tdLabel, ...S.frozen, ...S.groupLabel }} colSpan={1}>
              Structure (pre-tax)
            </td>
            {offers.map((o) => (
              <td key={o.id} style={{ ...S.td, ...S.groupLabel }} />
            ))}
          </tr>
          <tr>
            <td style={{ ...S.tdLabel, ...S.frozen }}>Composition</td>
            {offers.map((o) => (
              <td key={o.id} style={S.td}>
                <CompositionBar o={o} />
              </td>
            ))}
          </tr>
          <tr>
            <td style={{ ...S.tdLabel, ...S.frozen }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Dot c={T.green} /> Cash (certain)
              </span>
            </td>
            {offers.map((o) => (
              <td key={o.id} style={S.td}>{fmtCents(certainty(o).certain || null)}</td>
            ))}
          </tr>
          <tr>
            <td style={{ ...S.tdLabel, ...S.frozen }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Dot c={T.blue} /> Note (deferred)
              </span>
            </td>
            {offers.map((o) => (
              <td key={o.id} style={S.td}>{fmtCents(certainty(o).deferred || null)}</td>
            ))}
          </tr>
          <tr>
            <td style={{ ...S.tdLabel, ...S.frozen }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Dot c={T.amber} /> Earnout + escrow (at risk)
              </span>
            </td>
            {offers.map((o) => (
              <td key={o.id} style={S.td}>{fmtCents(certainty(o).earnoutEscrow || null)}</td>
            ))}
          </tr>
          <tr>
            <td style={{ ...S.tdLabel, ...S.frozen }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Dot c={T.violet} /> Rollover (equity)
              </span>
            </td>
            {offers.map((o) => (
              <td key={o.id} style={S.td}>{fmtCents(certainty(o).rollover || null)}</td>
            ))}
          </tr>
          <tr>
            <td style={{ ...S.tdLabel, ...S.frozen }}>% at risk</td>
            {offers.map((o) => {
              const c = certainty(o);
              return (
                <td key={o.id} style={S.td}>{c.base > 0 ? pct(c.atRisk, c.base) : "—"}</td>
              );
            })}
          </tr>
        </tbody>
      </table>
      <div style={S.compareNote}>
        Pre-tax structural split of stated consideration into certain cash, fixed deferred (note), and at-risk
        (earnout, escrow, equity rollover). “% at risk” is a share of the summed structural legs. Not an after-tax
        net, a valuation, or a recommendation.
      </div>
    </div>
  );
}

function CompositionBar({ o }: { o: DealOffer }) {
  const c = certainty(o);
  if (c.base <= 0) return <span style={{ color: T.faint, fontSize: 12 }}>—</span>;
  const seg = (v: number, color: string) =>
    v > 0 ? <span style={{ width: `${(v / c.base) * 100}%`, background: color, display: "block" }} /> : null;
  return (
    <div style={S.bar}>
      {seg(c.certain, T.green)}
      {seg(c.deferred, T.blue)}
      {seg(c.earnoutEscrow, T.amber)}
      {seg(c.rollover, T.violet)}
    </div>
  );
}

function Dot({ c }: { c: string }) {
  return <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, flex: "none", display: "inline-block" }} />;
}

/* ─── Offer form (add / edit) ────────────────────────────────── */

type FormState = Record<string, string>;

function OfferForm({
  buyers,
  initial,
  onSubmit,
  onCancel,
}: {
  buyers: { id: number; name: string }[];
  initial: DealOffer | null;
  onSubmit: (input: OfferInput) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [f, setF] = useState<FormState>(() => ({
    buyer_id: initial?.buyer_id != null ? String(initial.buyer_id) : "",
    buyer_name: initial?.buyer_name ?? "",
    offer_type: initial?.offer_type ?? "ioi",
    total_price: centsToStr(initial?.total_price_cents),
    cash_at_close: centsToStr(initial?.cash_at_close_cents),
    seller_note: centsToStr(initial?.seller_note_cents),
    seller_note_rate: bpsToStr(initial?.seller_note_rate_bps),
    seller_note_term: intToStr(initial?.seller_note_term_months),
    earnout: centsToStr(initial?.earnout_cents),
    earnout_term: intToStr(initial?.earnout_term_months),
    earnout_basis: initial?.earnout_basis ?? "",
    rollover: centsToStr(initial?.rollover_cents),
    escrow: centsToStr(initial?.escrow_holdback_cents),
    exclusivity_days: intToStr(initial?.exclusivity_days),
    expires_at: dateToStr(initial?.expires_at),
    contingencies: initial?.contingencies ?? "",
    notes: initial?.notes ?? "",
  }));
  const [saving, setSaving] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  const save = async () => {
    if (saving) return;
    const input: OfferInput = {
      buyer_id: f.buyer_id ? Number(f.buyer_id) : null,
      buyer_name: f.buyer_id ? null : f.buyer_name.trim() || null,
      offer_type: f.offer_type as OfferType,
      total_price_cents: toCents(f.total_price),
      cash_at_close_cents: toCents(f.cash_at_close),
      seller_note_cents: toCents(f.seller_note),
      seller_note_rate_bps: toBps(f.seller_note_rate),
      seller_note_term_months: toInt(f.seller_note_term),
      earnout_cents: toCents(f.earnout),
      earnout_term_months: toInt(f.earnout_term),
      earnout_basis: f.earnout_basis.trim() || null,
      rollover_cents: toCents(f.rollover),
      escrow_holdback_cents: toCents(f.escrow),
      exclusivity_days: toInt(f.exclusivity_days),
      expires_at: f.expires_at || null,
      contingencies: f.contingencies.trim() || null,
      notes: f.notes.trim() || null,
    };
    setSaving(true);
    try {
      await onSubmit(input);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={S.form}>
      <div style={S.formGrid}>
        <Field label="Buyer">
          {buyers.length > 0 ? (
            <select value={f.buyer_id} onChange={set("buyer_id")} style={S.input}>
              <option value="">— Other / not in funnel —</option>
              {buyers.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          ) : (
            <input value={f.buyer_name} onChange={set("buyer_name")} placeholder="Buyer name" style={S.input} />
          )}
        </Field>
        {buyers.length > 0 && !f.buyer_id && (
          <Field label="Buyer name">
            <input value={f.buyer_name} onChange={set("buyer_name")} placeholder="Buyer name" style={S.input} />
          </Field>
        )}
        <Field label="Type">
          <select value={f.offer_type} onChange={set("offer_type")} style={S.input}>
            {OFFER_TYPES.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Total price ($)"><input value={f.total_price} onChange={set("total_price")} placeholder="—" style={S.input} inputMode="decimal" /></Field>
        <Field label="Cash at close ($)"><input value={f.cash_at_close} onChange={set("cash_at_close")} placeholder="—" style={S.input} inputMode="decimal" /></Field>
        <Field label="Seller note ($)"><input value={f.seller_note} onChange={set("seller_note")} placeholder="—" style={S.input} inputMode="decimal" /></Field>
        <Field label="Note rate (%)"><input value={f.seller_note_rate} onChange={set("seller_note_rate")} placeholder="—" style={S.input} inputMode="decimal" /></Field>
        <Field label="Note term (mo)"><input value={f.seller_note_term} onChange={set("seller_note_term")} placeholder="—" style={S.input} inputMode="numeric" /></Field>
        <Field label="Earnout max ($)"><input value={f.earnout} onChange={set("earnout")} placeholder="—" style={S.input} inputMode="decimal" /></Field>
        <Field label="Earnout term (mo)"><input value={f.earnout_term} onChange={set("earnout_term")} placeholder="—" style={S.input} inputMode="numeric" /></Field>
        <Field label="Earnout basis"><input value={f.earnout_basis} onChange={set("earnout_basis")} placeholder="e.g. EBITDA" style={S.input} /></Field>
        <Field label="Rollover ($)"><input value={f.rollover} onChange={set("rollover")} placeholder="—" style={S.input} inputMode="decimal" /></Field>
        <Field label="Escrow / holdback ($)"><input value={f.escrow} onChange={set("escrow")} placeholder="—" style={S.input} inputMode="decimal" /></Field>
        <Field label="Exclusivity (days)"><input value={f.exclusivity_days} onChange={set("exclusivity_days")} placeholder="—" style={S.input} inputMode="numeric" /></Field>
        <Field label="Expires"><input type="date" value={f.expires_at} onChange={set("expires_at")} style={S.input} /></Field>
      </div>
      <div style={{ marginTop: 10 }}>
        <Field label="Contingencies"><input value={f.contingencies} onChange={set("contingencies")} placeholder="Financing, due-diligence, etc." style={{ ...S.input, width: "100%" }} /></Field>
      </div>
      <div style={{ marginTop: 10 }}>
        <Field label="Notes"><input value={f.notes} onChange={set("notes")} placeholder="Anything else worth tracking" style={{ ...S.input, width: "100%" }} /></Field>
      </div>
      <div style={S.formActions}>
        <button
          type="button"
          style={{ ...S.saveBtn, opacity: saving ? 0.6 : 1, cursor: saving ? "default" : "pointer" }}
          onClick={save}
          disabled={saving}
        >
          {saving ? "Saving…" : initial ? "Save offer" : "Add offer"}
        </button>
        <button type="button" style={S.cancelBtn} onClick={onCancel} disabled={saving}>Cancel</button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={S.field}>
      <span style={S.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

/* ─── helpers (pure, pre-tax, integer cents) ─────────────────── */

/** Pre-tax structural split of the stated consideration into certain cash, fixed
 *  deferred (seller note), and at-risk (earnout + escrow + equity rollover).
 *  Plain integer-cent sums — no tax, no PV, no ranking. Rollover is included in
 *  the base so the composition, headline, and % at-risk all reconcile. */
function certainty(o: DealOffer) {
  const certain = o.cash_at_close_cents ?? 0; // cash at close
  const deferred = o.seller_note_cents ?? 0; // fixed but paid later
  const earnoutEscrow = (o.earnout_cents ?? 0) + (o.escrow_holdback_cents ?? 0);
  const rollover = o.rollover_cents ?? 0; // equity, value uncertain
  const atRisk = earnoutEscrow + rollover;
  return { certain, deferred, earnoutEscrow, rollover, atRisk, base: certain + deferred + atRisk };
}

function noteSub(o: DealOffer): string | null {
  const parts: string[] = [];
  if (o.seller_note_rate_bps != null) parts.push(`${(o.seller_note_rate_bps / 100).toFixed(2).replace(/\.?0+$/, "")}%`);
  if (o.seller_note_term_months != null) parts.push(`${o.seller_note_term_months} mo`);
  return parts.length ? parts.join(" · ") : null;
}

function pct(part: number, whole: number): string {
  if (!(whole > 0)) return "—";
  return `${Math.round((part / whole) * 100)}%`;
}

function toCents(s: string): number | null {
  const n = parseFloat(s);
  return s.trim() === "" || !Number.isFinite(n) ? null : Math.max(0, Math.round(n * 100));
}
function toBps(s: string): number | null {
  const n = parseFloat(s);
  return s.trim() === "" || !Number.isFinite(n) ? null : Math.max(0, Math.round(n * 100));
}
function toInt(s: string): number | null {
  const n = parseInt(s, 10);
  return s.trim() === "" || !Number.isFinite(n) ? null : Math.max(0, n);
}
function centsToStr(c: number | null | undefined): string {
  return c == null ? "" : String(c / 100);
}
function bpsToStr(c: number | null | undefined): string {
  return c == null ? "" : String(c / 100);
}
function intToStr(n: number | null | undefined): string {
  return n == null ? "" : String(n);
}
function dateToStr(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

function expiryText(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  // Stored as date-only (UTC midnight); render in UTC so it doesn't slip a day in western zones.
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function expiryNote(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const days = Math.ceil((d.getTime() - Date.now()) / 86_400_000);
  if (days < 0) return <Pill bg={T.track} fg={T.muted2}>Expired</Pill>;
  if (days <= 7) return <Pill bg={T.amberBg} fg={T.amber}>Expires in {days}d</Pill>;
  return null;
}

const S: Record<string, React.CSSProperties> = {
  card: { background: T.white, border: `1px solid ${T.border}`, borderRadius: T.rCardLg, boxShadow: T.shCard, padding: "16px 18px" },
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  title: { fontSize: 15, fontWeight: 600, color: T.ink },
  decision: { fontSize: 12, color: T.muted2, marginTop: 8, lineHeight: 1.45 },
  addBtn: { display: "inline-flex", alignItems: "center", gap: 6, background: T.blueBg, color: T.blue, border: "none", borderRadius: T.rPill, padding: "6px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: T.font },

  empty: { fontSize: 13, color: T.muted, lineHeight: 1.5, marginTop: 14 },
  linkBtn: { background: "transparent", border: "none", color: T.blue, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: T.font, padding: 0 },

  list: { marginTop: 12, display: "flex", flexDirection: "column", gap: 2 },
  row: { display: "flex", alignItems: "center", gap: 10, padding: "10px 4px", borderTop: `1px solid ${T.rowDiv2}` },
  rowTop: { display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" },
  rowSub: { display: "flex", alignItems: "center", gap: 7, marginTop: 3, fontSize: 12, color: T.muted2, flexWrap: "wrap" },
  name: { fontSize: 13.5, fontWeight: 600, color: T.ink },
  headline: { fontSize: 13, fontWeight: 600, color: T.ink3 },
  sep: { color: T.faint },
  statusSelect: { height: 30, borderRadius: 8, border: `1px solid ${T.inputBd}`, background: T.white, padding: "0 6px", fontSize: 12, color: T.ink, fontFamily: T.font, flex: "none" },
  iconBtn: { minWidth: 28, height: 28, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", borderRadius: 7, cursor: "pointer", padding: "0 4px" },

  // compare
  compareWrap: { marginTop: 12, overflowX: "auto" },
  table: { borderCollapse: "collapse", width: "100%", fontFamily: T.font },
  th: { textAlign: "left", padding: "0 14px 10px", verticalAlign: "bottom", minWidth: 130 },
  colName: { fontSize: 13, fontWeight: 600, color: T.ink, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  tdLabel: { fontSize: 12.5, color: T.muted, padding: "9px 14px 9px 0", whiteSpace: "nowrap", borderTop: `1px solid ${T.rowDiv2}` },
  td: { fontSize: 13, color: T.ink3, padding: "9px 14px", whiteSpace: "nowrap", borderTop: `1px solid ${T.rowDiv2}` },
  frozen: { position: "sticky", left: 0, background: T.white, zIndex: 1 },
  cellVal: { fontWeight: 600, color: T.ink },
  cellSub: { fontSize: 11, color: T.muted2, marginTop: 2 },
  groupLabel: { fontSize: 11.5, fontWeight: 600, color: T.muted2, paddingTop: 13 },
  bar: { display: "flex", height: 7, width: 96, borderRadius: 4, overflow: "hidden", background: T.track },
  compareNote: { fontSize: 11.5, color: T.muted2, marginTop: 10, lineHeight: 1.45 },

  // form
  form: { marginTop: 14, padding: 14, background: T.surface, borderRadius: T.rCard, border: `1px solid ${T.hair}` },
  formGrid: { display: "flex", flexWrap: "wrap", gap: 10 },
  field: { display: "flex", flexDirection: "column", gap: 4, flex: "1 1 140px", minWidth: 120 },
  fieldLabel: { fontSize: 11, color: T.muted2, fontWeight: 600 },
  input: { height: 34, borderRadius: 8, border: `1px solid ${T.inputBd}`, background: T.white, padding: "0 10px", fontSize: 13, color: T.ink, fontFamily: T.font },
  formActions: { display: "flex", gap: 8, marginTop: 14 },
  saveBtn: { background: T.blue, color: "#fff", border: "none", borderRadius: 9, padding: "0 18px", height: 36, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: T.font },
  cancelBtn: { background: "transparent", color: T.muted, border: `1px solid ${T.inputBd}`, borderRadius: 9, padding: "0 16px", height: 36, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: T.font },
};
