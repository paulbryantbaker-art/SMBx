/**
 * THE CAPITAL STACK — what the client's money actually costs.
 *
 * Paul, 2026-08-15: *"we want the client to tell us their capital stack and
 * borrow costs so we can update WACC and we should update the prime rate /
 * What about in the LBO model?"*
 *
 * The screen answers all three at once, because they are one question. The
 * client enters their stack; WACC falls out of it; the LBO's senior and
 * mezzanine tranches fall out of the same stack; and the prime rate shows its
 * own provenance rather than sitting invisible inside somebody's arithmetic.
 *
 * ── WHAT THIS PANEL WILL NOT DO ─────────────────────────────────────────
 * Show a discount rate it cannot source. `house/capital.ts` returns
 * `{ok: false, missing: [...]}` and this renders the list. That is a
 * deliberately worse first-run experience than defaulting to 14% and it is the
 * whole point: the DCF in `deterministicAnalysisEngine.ts` defaults to 0.14 and
 * the canvas DCF to 0.10, and neither tells anyone it did. A discount rate
 * moves enterprise value by tens of percent and reaches a client inside a
 * document claiming every figure is sourced.
 *
 * ── ALL JUDGEMENT LIVES IN house/capital.ts ─────────────────────────────
 * Same contract `ValuationPanel` has with `house/valuation.ts`. This file has
 * no arithmetic in it beyond formatting: the blend, the shield, the tranche
 * mapping and the refusals are all imported, so a Cowork session computes the
 * identical number from the identical stack.
 *
 * ── WHY IT COMPUTES LOCALLY AND SAVES REMOTELY ──────────────────────────
 * Typing a rate should move the WACC on the next keystroke, so the panel runs
 * the engine in the browser. The server runs the SAME engine on read, because
 * anything server-side that wants the discount rate — a generated document,
 * Yulia — must not reimplement the blend. Two callers, one engine.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { T } from "../atlasTokens";
import { authHeaders } from "../../../../hooks/useAuth";
import {
  wacc, lboRatesFrom, sbaChecks, isDebt, indexStatus,
  SOURCE_KINDS, SOURCE_LABEL, RATE_INDEX, WACC_VS_LBO,
  type Stack, type StackLayer, type SourceKind,
} from "../../../../../../house/capital";

/* The persisted document — mirrors CapitalDoc in server/routes/dealCapital.ts. */
interface Doc {
  layers: StackLayer[];
  purchasePriceCents: number | null;
  equity: {
    riskFreePct?: number; equityRiskPremiumPct?: number;
    sizePremiumPct?: number; specificRiskPct?: number; sourceNote?: string;
  };
  marginalTaxRatePct?: number;
  taxRateSource?: string;
  updatedAt?: string;
}

const EMPTY: Doc = { layers: [], purchasePriceCents: null, equity: {} };

/* Sources in the order a stack is built — senior first, equity last, which is
   also waterfall order. A select that listed them alphabetically would put the
   earnout above the SBA loan. */
const KIND_ORDER: SourceKind[] = [
  "sba-7a", "sba-504", "senior-bank", "unitranche", "abl-revolver",
  "mezzanine", "seller-note", "earnout",
  "preferred", "sponsor-equity", "buyer-equity", "rollover-equity",
];

export function CapitalPanel({ dealId, askingCents }: { dealId: number; askingCents: number | null }) {
  const [doc, setDoc] = useState<Doc>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let live = true;
    fetch(`/api/deals/${dealId}/capital`, { headers: authHeaders() })
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (!live) return;
        if (d?.stack) setDoc({ ...EMPTY, ...d.stack, equity: d.stack.equity ?? {} });
        setLoaded(true);
      })
      .catch(() => { if (live) setLoaded(true); });
    return () => { live = false; };
  }, [dealId]);

  const patch = useCallback((next: Partial<Doc>) => {
    setDoc(d => ({ ...d, ...next }));
    setDirty(true);
    setSaveErr(null);
  }, []);

  const setLayer = useCallback((i: number, next: Partial<StackLayer>) => {
    setDoc(d => ({ ...d, layers: d.layers.map((l, j) => (j === i ? { ...l, ...next } : l)) }));
    setDirty(true);
    setSaveErr(null);
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    setSaveErr(null);
    try {
      const r = await fetch(`/api/deals/${dealId}/capital`, {
        method: "PUT",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(doc),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) { setSaveErr(j?.error || `Save failed (${r.status})`); return; }
      if (j?.stack) setDoc({ ...EMPTY, ...j.stack, equity: j.stack.equity ?? {} });
      setDirty(false);
    } catch {
      setSaveErr("Save failed — the network dropped. Nothing was lost; press Save again.");
    } finally {
      setSaving(false);
    }
  }, [dealId, doc]);

  /* ── the engine, run locally for live feedback ──────────────────────── */

  const price = doc.purchasePriceCents ?? askingCents ?? 0;
  const stack: Stack = useMemo(
    () => ({ layers: doc.layers, purchasePriceCents: price }),
    [doc.layers, price],
  );

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const w = useMemo(() => wacc({
    stack,
    equity: {
      riskFreePct: doc.equity.riskFreePct as number,
      equityRiskPremiumPct: doc.equity.equityRiskPremiumPct as number,
      sizePremiumPct: doc.equity.sizePremiumPct as number,
      specificRiskPct: doc.equity.specificRiskPct as number,
      sourceNote: doc.equity.sourceNote as string,
    },
    marginalTaxRatePct: doc.marginalTaxRatePct as number,
    taxRateSource: doc.taxRateSource as string,
    today,
  }), [stack, doc.equity, doc.marginalTaxRatePct, doc.taxRateSource, today]);

  const mapping = useMemo(() => lboRatesFrom(stack, RATE_INDEX, today), [stack, today]);
  const sba = useMemo(() => sbaChecks(stack), [stack]);
  const primeState = useMemo(() => indexStatus(RATE_INDEX.prime, today), [today]);

  const total = doc.layers.reduce((s, l) => s + (l.amountCents || 0), 0);

  if (!loaded) {
    return <div style={{ fontSize: 13, color: T.muted2 }}>Loading the capital stack…</div>;
  }

  return (
    <div>
      <div style={rowBetween}>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>Capital stack</div>
        <button type="button" onClick={() => setOpen(o => !o)} style={ghostBtn}>
          {open ? "Hide" : doc.layers.length ? "Edit" : "Add the client’s stack"}
        </button>
      </div>

      {/* THE HEADLINE — the WACC, or exactly what is missing. Never a default. */}
      <div style={headline}>
        {w.ok ? (
          <>
            <div style={{ fontSize: 24, fontWeight: 800, color: T.ink, letterSpacing: "-0.01em" }}>
              {pctS(w.result.waccPct)} WACC
            </div>
            <div style={{ fontSize: 12.5, color: T.muted, marginTop: 3 }}>
              {pctS(w.result.debtWeight)} debt at {pctS(w.result.afterTaxCostOfDebtPct)} after tax
              {" · "}{pctS(w.result.equityWeight)} equity at {pctS(w.result.costOfEquityPct)}
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink }}>
              No discount rate yet — and no default.
            </div>
            <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.55, marginTop: 5 }}>
              A defaulted WACC moves enterprise value by tens of percent and reads
              as sourced. These are outstanding:
            </div>
            <ul style={missingList}>
              {w.missing.map((m, i) => <li key={i} style={{ marginBottom: 3 }}>{m}</li>)}
            </ul>
          </>
        )}
      </div>

      {w.ok && w.result.warnings.length > 0 && (
        <div style={warnBand}>
          {w.result.warnings.map((x, i) => (
            <div key={i} style={{ fontSize: 13, color: T.ink, lineHeight: 1.5 }}>{x}</div>
          ))}
        </div>
      )}

      {/* THE LAYERS — always visible when present, because the stack is the
          evidence and the WACC is only its summary. */}
      {doc.layers.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {doc.layers.map((l, i) => {
            const line = w.ok ? w.result.lines[i] : null;
            return (
              <div key={i} style={layerRow}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink }}>
                    {l.label || SOURCE_LABEL[l.kind]}
                  </div>
                  <span style={{ ...tag, background: isDebt(l.kind) ? T.blueBg : T.track, color: isDebt(l.kind) ? T.blue : T.muted }}>
                    {isDebt(l.kind) ? "Debt" : "Equity"}
                  </span>
                  <div style={{ marginLeft: "auto", fontSize: 14.5, color: T.ink, fontVariantNumeric: "tabular-nums" }}>
                    {money(l.amountCents)}
                    {total > 0 && <span style={{ color: T.muted2 }}> · {pctS(l.amountCents / total)}</span>}
                  </div>
                </div>
                <div style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.5, marginTop: 3 }}>
                  {line ? line.basis : rateSummary(l)}
                </div>
              </div>
            );
          })}
          <div style={{ ...layerRow, borderBottom: "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, fontWeight: 700, color: T.ink }}>
              <span>Total capital</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{money(total)}</span>
            </div>
            {price > 0 && (
              <div style={{ fontSize: 12.5, color: T.muted, marginTop: 3 }}>
                against a {money(price)} purchase price
              </div>
            )}
          </div>
        </div>
      )}

      {/* THE EDITOR. Collapsed by default — most visits are to read the number,
          not to change the stack. */}
      {open && (
        <div style={editor}>
          <Field
            label="Purchase price"
            hint="What the stack has to fund. Seeded from the asking price; overwrite it with the agreed number."
          >
            <MoneyInput value={doc.purchasePriceCents} onChange={v => patch({ purchasePriceCents: v })} />
          </Field>

          <div style={sectionLabel}>Layers</div>
          {doc.layers.map((l, i) => (
            <div key={i} style={editRow}>
              <select
                value={l.kind}
                onChange={e => setLayer(i, { kind: e.target.value as SourceKind })}
                style={{ ...input, flex: "1 1 150px" }}
                aria-label="Capital source"
              >
                {KIND_ORDER.map(k => <option key={k} value={k}>{SOURCE_LABEL[k]}</option>)}
              </select>
              <MoneyInput
                value={l.amountCents}
                onChange={v => setLayer(i, { amountCents: v ?? 0 })}
                style={{ flex: "0 1 120px" }}
              />
              <PctInput
                value={l.ratePct}
                onChange={v => setLayer(i, { ratePct: v })}
                placeholder="Rate"
                style={{ flex: "0 1 84px" }}
                disabled={!isDebt(l.kind) && l.kind !== "preferred"}
              />
              <input
                type="number"
                value={l.termMonths ?? ""}
                onChange={e => setLayer(i, { termMonths: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Months"
                style={{ ...input, flex: "0 1 84px" }}
                aria-label="Term in months"
              />
              <button
                type="button"
                onClick={() => { setDoc(d => ({ ...d, layers: d.layers.filter((_, j) => j !== i) })); setDirty(true); }}
                style={xBtn}
                aria-label="Remove layer"
              >×</button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => { setDoc(d => ({ ...d, layers: [...d.layers, { kind: "sba-7a", amountCents: 0 }] })); setDirty(true); }}
            style={ghostBtn}
          >+ Add a layer</button>

          {/* Equity is a build-up and every component is argued for separately.
              There is no house default for any of them, on purpose. */}
          <div style={{ ...sectionLabel, marginTop: 16 }}>Cost of equity — build-up</div>
          <div style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.5, marginBottom: 8 }}>
            A build-up, not CAPM. There is no observable beta for a business this
            size, and levering a public comp down to it produces four decimal
            places and no meaning.
          </div>
          <div style={editRow}>
            <LabelledPct label="Risk-free" value={doc.equity.riskFreePct} onChange={v => patch({ equity: { ...doc.equity, riskFreePct: v } })} />
            <LabelledPct label="Equity risk" value={doc.equity.equityRiskPremiumPct} onChange={v => patch({ equity: { ...doc.equity, equityRiskPremiumPct: v } })} />
            <LabelledPct label="Size" value={doc.equity.sizePremiumPct} onChange={v => patch({ equity: { ...doc.equity, sizePremiumPct: v } })} />
            <LabelledPct label="Specific" value={doc.equity.specificRiskPct} onChange={v => patch({ equity: { ...doc.equity, specificRiskPct: v } })} />
          </div>
          <input
            value={doc.equity.sourceNote ?? ""}
            onChange={e => patch({ equity: { ...doc.equity, sourceNote: e.target.value } })}
            placeholder="Where the premia came from — required"
            style={{ ...input, width: "100%", marginTop: 6 }}
          />

          <div style={{ ...sectionLabel, marginTop: 16 }}>Marginal tax rate</div>
          <div style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.5, marginBottom: 8 }}>
            For the interest shield. This is the client’s CPA’s number, not ours —
            THE LINE puts tax opinions out of lane. Ask, record, cite.
          </div>
          <div style={editRow}>
            <PctInput value={doc.marginalTaxRatePct} onChange={v => patch({ marginalTaxRatePct: v })} placeholder="Rate" style={{ flex: "0 1 84px" }} />
            <input
              value={doc.taxRateSource ?? ""}
              onChange={e => patch({ taxRateSource: e.target.value })}
              placeholder="Whose number this is — required"
              style={{ ...input, flex: "1 1 220px" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
            <button type="button" onClick={save} disabled={!dirty || saving} style={primaryBtn(!dirty || saving)}>
              {saving ? "Saving…" : dirty ? "Save stack" : "Saved"}
            </button>
            {doc.updatedAt && !dirty && (
              <span style={{ fontSize: 12.5, color: T.muted2 }}>Last saved {doc.updatedAt}</span>
            )}
            {saveErr && <span style={{ fontSize: 12.5, color: T.amber }}>{saveErr}</span>}
          </div>
        </div>
      )}

      {/* THE LBO TRANCHES — the answer to "what about in the LBO model?".
          Same stack, different job, and the panel says so rather than leaving
          a practitioner to wonder why the numbers differ. */}
      <div style={{ marginTop: 18 }}>
        <div style={sectionLabel}>In the LBO model</div>
        {mapping.ok ? (
          <>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
              <Stat label="Senior" value={`${pctS(mapping.mapping.seniorDebtPct)} of EV`} sub={`${pctS(mapping.mapping.seniorRate)} · ${mapping.mapping.seniorTerm} mo`} />
              <Stat label="Mezzanine" value={`${pctS(mapping.mapping.mezDebtPct)} of EV`} sub={mapping.mapping.mezDebtPct > 0 ? `${pctS(mapping.mapping.mezRate)} · ${mapping.mapping.mezTerm} mo` : "none"} />
              <Stat label="Equity (plug)" value={pctS(Math.max(0, 1 - mapping.mapping.seniorDebtPct - mapping.mapping.mezDebtPct))} sub="derived by the model" />
            </div>
            {mapping.mapping.unmapped.map((u, i) => (
              <div key={i} style={bullet}>
                <span style={{ color: T.amber, flex: "none" }}>·</span>
                <span><b style={{ color: T.ink }}>{u.label} not mapped</b> — {u.why}</span>
              </div>
            ))}
            {mapping.mapping.notes.map((n, i) => (
              <div key={i} style={bullet}>
                <span style={{ color: T.muted2, flex: "none" }}>·</span>
                <span>{n}</span>
              </div>
            ))}
          </>
        ) : (
          <ul style={missingList}>
            {mapping.missing.map((m, i) => <li key={i} style={{ marginBottom: 3 }}>{m}</li>)}
          </ul>
        )}
        <div style={doctrineBand}>{WACC_VS_LBO}</div>
      </div>

      {/* SBA arithmetic, when there is an SBA layer to test. */}
      {(sba.passes.length > 0 || sba.fails.length > 0) && (
        <div style={{ marginTop: 16 }}>
          <div style={sectionLabel}>SBA 7(a)</div>
          {sba.fails.map((f, i) => (
            <div key={`f${i}`} style={bullet}><span style={{ color: T.amber, flex: "none" }}>✕</span><span>{f}</span></div>
          ))}
          {sba.passes.map((p, i) => (
            <div key={`p${i}`} style={bullet}><span style={{ color: T.blue, flex: "none" }}>✓</span><span>{p}</span></div>
          ))}
          {sba.unknown.map((u, i) => (
            <div key={`u${i}`} style={bullet}><span style={{ color: T.muted2, flex: "none" }}>?</span><span>{u}</span></div>
          ))}
        </div>
      )}

      {/* THE PRIME RATE, WITH ITS PROVENANCE. Paul asked for it to be updated;
          the first honest step is showing that nobody knows when it last was.
          It only matters for a floating layer the client has not priced. */}
      {primeState.status !== "fresh" && (
        <div style={{ ...warnBand, marginTop: 14 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".04em", color: T.amber }}>
            PRIME RATE · {primeState.status.toUpperCase()}
          </div>
          <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.55, marginTop: 4 }}>
            Carrying {RATE_INDEX.prime.pct != null ? pctS(RATE_INDEX.prime.pct) : "no value"}. {primeState.note}
            {" "}It is used only where a layer floats and the client has not given an
            all-in rate — a quoted rate always wins.
          </div>
        </div>
      )}

      {/* THE WORKINGS. Collapsed, because they are for the moment somebody
          challenges the number, and that is the moment they must be complete. */}
      {w.ok && (
        <details style={{ marginTop: 14 }}>
          <summary style={summaryStyle}>Workings</summary>
          <div style={{ marginTop: 8 }}>
            {w.result.workings.map((x, i) => (
              <div key={i} style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.6, marginBottom: 3 }}>{x}</div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

/* ── small pieces ─────────────────────────────────────────────────────── */

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: T.muted2 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: T.ink, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>{sub}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={sectionLabel}>{label}</div>
      {hint && <div style={{ fontSize: 11.5, color: T.muted, lineHeight: 1.5, marginBottom: 6 }}>{hint}</div>}
      {children}
    </div>
  );
}

function LabelledPct({ label, value, onChange }: { label: string; value?: number; onChange: (v: number | undefined) => void }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 3, flex: "1 1 84px" }}>
      <span style={{ fontSize: 10.5, color: T.muted2 }}>{label}</span>
      <PctInput value={value} onChange={onChange} placeholder="%" />
    </label>
  );
}

/**
 * Percentages are typed the way people say them (9.75) and stored the way the
 * engine wants them (0.0975). The conversion is HERE and nowhere else — the
 * route rejects an out-of-range decimal rather than helpfully dividing, because
 * a typed 0.5 could be 50% or 0.5% and guessing would be an invented number.
 */
function PctInput({ value, onChange, placeholder, style, disabled }: {
  value?: number; onChange: (v: number | undefined) => void;
  placeholder?: string; style?: CSSProperties; disabled?: boolean;
}) {
  const [text, setText] = useState(value == null ? "" : String(round4(value * 100)));
  useEffect(() => { setText(value == null ? "" : String(round4(value * 100))); }, [value]);
  return (
    <input
      type="text"
      inputMode="decimal"
      value={text}
      disabled={disabled}
      onChange={e => {
        setText(e.target.value);
        const n = Number(e.target.value);
        onChange(e.target.value.trim() === "" || !Number.isFinite(n) ? undefined : n / 100);
      }}
      placeholder={placeholder}
      style={{ ...input, ...(disabled ? { opacity: 0.5 } : null), ...style }}
    />
  );
}

/** Dollars in, cents out. House rule 10 — a float dollar never reaches state. */
function MoneyInput({ value, onChange, style }: {
  value: number | null | undefined; onChange: (v: number | null) => void; style?: CSSProperties;
}) {
  const [text, setText] = useState(value == null ? "" : String(value / 100));
  useEffect(() => { setText(value == null ? "" : String(value / 100)); }, [value]);
  return (
    <input
      type="text"
      inputMode="decimal"
      value={text}
      onChange={e => {
        const raw = e.target.value.replace(/[$,\s]/g, "");
        setText(e.target.value);
        const n = Number(raw);
        onChange(raw.trim() === "" || !Number.isFinite(n) ? null : Math.round(n * 100));
      }}
      placeholder="$"
      style={{ ...input, ...style }}
    />
  );
}

function rateSummary(l: StackLayer): string {
  if (typeof l.ratePct === "number") return `${pctS(l.ratePct)} quoted`;
  if (l.floating) return `${l.floating.index.toUpperCase()} + ${pctS(l.floating.spreadPct)}`;
  return isDebt(l.kind) ? "No rate yet" : "Priced off the equity build-up";
}

function pctS(v: number): string {
  return `${round4(v * 100)}%`;
}
function round4(v: number): number {
  return Math.round(v * 10000) / 10000;
}
function money(cents: number): string {
  const d = cents / 100;
  if (Math.abs(d) >= 1_000_000) return `$${(d / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (Math.abs(d) >= 1_000) return `$${Math.round(d / 1_000)}K`;
  return `$${Math.round(d)}`;
}

/* ── styles ───────────────────────────────────────────────────────────── */

const rowBetween: CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
};

/* THE TRANSCRIPTION'S SHAPES (2026-08-16): filled radius-8 bands with no
   hairline, radius-8 inputs, the filled-green primary action, 13–14.5px
   working type. See the kit styles block for the sanction. */
const headline: CSSProperties = {
  marginTop: 10, padding: "12px 14px",
  background: T.track, borderRadius: 8,
};

const warnBand: CSSProperties = {
  marginTop: 10, padding: "10px 14px",
  background: T.amberBg, borderLeft: `3px solid ${T.amber}`, borderRadius: 8,
};

const doctrineBand: CSSProperties = {
  marginTop: 10, padding: "10px 14px",
  background: T.track, borderRadius: 8,
  fontSize: 12.5, color: T.muted, lineHeight: 1.6,
};

const layerRow: CSSProperties = {
  padding: "10px 0", borderBottom: `1px solid ${T.border}`,
};

const editor: CSSProperties = {
  marginTop: 14, padding: "14px", background: T.white,
  border: `1px solid ${T.border}`, borderRadius: 8,
};

const editRow: CSSProperties = {
  display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 6,
};

const input: CSSProperties = {
  font: "inherit", fontSize: 13.5, color: T.ink, background: T.track,
  border: "none", borderRadius: 8, padding: "8px 10px", minWidth: 0,
};

const ghostBtn: CSSProperties = {
  font: "inherit", fontSize: 13, fontWeight: 600, color: T.blue,
  background: T.white, border: `1px solid ${T.inputBd}`,
  borderRadius: 999, padding: "7px 14px", cursor: "pointer",
};

/* The one primary action wears the reference's filled green. */
function primaryBtn(disabled: boolean): CSSProperties {
  return {
    font: "inherit", fontSize: 13.5, fontWeight: 700,
    color: "#fff", background: disabled ? T.muted2 : T.blue,
    border: "none", borderRadius: 8, padding: "9px 16px",
    cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.6 : 1,
  };
}

const xBtn: CSSProperties = {
  font: "inherit", fontSize: 15, lineHeight: 1, color: T.muted2,
  background: "transparent", border: "none", cursor: "pointer", padding: "4px 6px",
};

const tag: CSSProperties = {
  fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase",
  padding: "2px 7px", flex: "none", borderRadius: 4,
};

const sectionLabel: CSSProperties = {
  fontSize: 11.5, fontWeight: 700, letterSpacing: ".05em",
  textTransform: "uppercase", color: T.muted2, marginBottom: 6,
};

const bullet: CSSProperties = {
  display: "flex", gap: 7, fontSize: 13, color: T.muted,
  lineHeight: 1.55, marginTop: 5,
};

const missingList: CSSProperties = {
  margin: "6px 0 0", paddingLeft: 18, fontSize: 13, color: T.muted, lineHeight: 1.55,
};

const summaryStyle: CSSProperties = {
  fontSize: 13, fontWeight: 700, color: T.blue, cursor: "pointer",
};
