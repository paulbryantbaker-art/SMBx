/**
 * SCENARIOS — the return space, priced like the reference prices a journey.
 *
 * Paul, 2026-08-16: *"we need to put extra focus on deal valuation and model
 * and scenario analysis"* — and the where doc already fixed the venue
 * (`house/where.ts` 'valuation': "in-app scenario modeling is going to be much
 * more advantageous than a Google Sheet").
 *
 * THE TRAINLINE MOVE, APPLIED TO RETURNS. The reference prices the alternative
 * as a DELTA ("Semi-flexible + $3.21") so you read the cost of a choice without
 * subtracting two numbers. Here the base case carries the absolute IRR and the
 * stressed cases carry their distance from it in basis points — the cost of
 * being wrong about growth and exit, read directly. The sensitivity grid below
 * is the same idea widened: the scenarios' neighbourhood, not a second model.
 *
 * ALL JUDGEMENT LIVES IN `house/scenarios.ts` — the same contract the panels
 * above it have with their house modules. This file formats and draws.
 * Notably: an IRR that never converged renders as "Not available", because
 * `irrLabel()` returns null for it and there is no other path to the screen.
 *
 * DEBT SERVICE COMES FROM THE CLIENT'S STACK — the same document the Capital
 * panel edits. No stack, no scenarios; the refusal says to add it there.
 */
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { T } from "../atlasTokens";
import { authHeaders } from "../../../../hooks/useAuth";
import { useDraft } from "../../../../hooks/useDraft";
import { OptionPair, type PricedOption } from "../kit";
import {
  assemble, runScenarios, sensitivityGrid,
  irrLabel, irrDeltaLabel, moicLabel, minDscr,
  HOLD_YEARS_DEFAULT, SCENARIO_ORDERING, type ScenarioId,
} from "../../../../../../house/scenarios";
import {
  lboRatesFrom, RATE_INDEX, SBA_DSCR_MIN, type Stack, type StackLayer,
} from "../../../../../../house/capital";
import { money, pct, mult } from "../../../../../../house/deal";

interface CapitalDoc {
  layers: StackLayer[];
  purchasePriceCents: number | null;
}

export function ScenarioPanel({ dealId, ebitda, revenue, askingCents }: {
  dealId: number;
  ebitda: number | null;
  revenue: number | null;
  askingCents: number | null;
}) {
  /* The stack is the Capital panel's document — read, never edited here. */
  const [doc, setDoc] = useState<CapitalDoc | null>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let live = true;
    fetch(`/api/deals/${dealId}/capital`, { headers: authHeaders() })
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (!live) return;
        if (d?.stack) setDoc({ layers: d.stack.layers ?? [], purchasePriceCents: d.stack.purchasePriceCents ?? null });
        setLoaded(true);
      })
      .catch(() => { if (live) setLoaded(true); });
    return () => { live = false; };
  }, [dealId]);

  /* The three assumptions that are the practitioner's to set. Drafted per
     deal, same as the valuation type — a migration can promote them once the
     shape has earned it. Growth starts EMPTY: flat is a real plan and must be
     typed, never assumed (house/scenarios.ts refuses a null plan). */
  const [growthTxt, setGrowthTxt] = useDraft(`deal:${dealId}:scn-growth`, "");
  const [exitTxt, setExitTxt] = useDraft(`deal:${dealId}:scn-exit`, "");
  const [holdTxt, setHoldTxt] = useDraft(`deal:${dealId}:scn-hold`, "");
  const [picked, setPicked] = useState<ScenarioId>("base");

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const price = doc?.purchasePriceCents ?? askingCents ?? null;

  const stack: Stack | null = useMemo(
    () => (doc && doc.layers.length > 0 && price
      ? { layers: doc.layers, purchasePriceCents: price }
      : null),
    [doc, price],
  );
  const mapping = useMemo(
    () => (stack ? lboRatesFrom(stack, RATE_INDEX, today) : null),
    [stack, today],
  );

  const asm = useMemo(() => assemble({
    purchasePriceCents: price,
    ebitdaCents: ebitda,
    revenueCents: revenue,
    growthPct: numOrNull(growthTxt, 1 / 100),
    exitMultiple: numOrNull(exitTxt, 1),
    holdYears: numOrNull(holdTxt, 1),
    rates: mapping?.ok ? mapping.mapping : null,
  }), [price, ebitda, revenue, growthTxt, exitTxt, holdTxt, mapping]);

  /* When the stack EXISTS but a layer lacks a rate, the useful refusal is the
     rate-level one from lboRatesFrom, not the generic "add a stack". */
  const missing = useMemo(() => {
    if (asm.ok) return [];
    let list = asm.missing;
    if (mapping && !mapping.ok) {
      list = list
        .filter(m => !m.includes("capital stack"))
        .concat(mapping.missing.map(m => `${m} — on the capital stack`));
    }
    return list;
  }, [asm, mapping]);

  const runs = useMemo(() => (asm.ok ? runScenarios(asm.base.assumptions) : null), [asm]);
  const grid = useMemo(() => (asm.ok ? sensitivityGrid(asm.base.assumptions) : null), [asm]);

  const baseRun = runs?.find(r => r.def.id === "base") ?? null;
  const pickedRun = runs?.find(r => r.def.id === picked) ?? null;

  const options: PricedOption[] | null = runs
    ? runs.map(r => {
        const isBase = r.def.id === "base";
        if (r.blocked) return { id: r.def.id, label: r.def.label, delta: "—", note: r.blocked };
        const label = isBase
          ? irrLabel(r.result)
          : irrDeltaLabel(baseRun?.result ?? null, r.result);
        return {
          id: r.def.id,
          label: r.def.label,
          absolute: isBase ? (label ?? "IRR n/a") : undefined,
          delta: isBase ? undefined : (label ?? "IRR n/a"),
          note: `${moicLabel(r.result) ?? "—"} MOIC · ${r.def.note}`,
        };
      })
    : null;

  if (!loaded) {
    return <div style={{ fontSize: 13, color: T.muted2 }}>Loading the scenario inputs…</div>;
  }

  return (
    <div>
      {/* THE ASSUMPTION CELLS — the criteria-bar shape: filled cells, small
          label over a bold value, editable in place. These three are the
          practitioner's; everything else is derived or from the stack. */}
      <div style={{ display: "flex", gap: 8 }}>
        <AssumptionCell label="Growth / yr" unit="%" placeholder="required"
          value={growthTxt} onChange={setGrowthTxt} />
        <AssumptionCell label="Exit multiple" unit="x"
          placeholder={asm.ok ? undefined : "entry"}
          derived={asm.ok && exitTxt.trim() === "" ? mult(asm.base.assumptions.exitMultiple) : undefined}
          value={exitTxt} onChange={setExitTxt} />
        <AssumptionCell label="Hold" unit="yrs" placeholder={String(HOLD_YEARS_DEFAULT)}
          value={holdTxt} onChange={setHoldTxt} />
      </div>

      {!asm.ok && (
        <div style={refuseBand}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink }}>
            No scenarios yet — and no defaults.
          </div>
          <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.55, marginTop: 4 }}>
            A scenario run on invented inputs reads as sourced. Still outstanding:
          </div>
          <ul style={missingList}>
            {missing.map((m, i) => <li key={i} style={{ marginBottom: 4 }}>{m}</li>)}
          </ul>
        </div>
      )}

      {asm.ok && options && (
        <>
          {/* THE PRICED CHOICE — base absolute, stresses as deltas. */}
          <div style={{ marginTop: 14 }}>
            <OptionPair options={options} activeId={picked} onPick={id => setPicked(id as ScenarioId)} />
          </div>

          {/* THE PICKED CASE, in numbers a lender or an IC would ask for. */}
          {pickedRun && pickedRun.result && (
            <div style={statRow}>
              <Stat label="Equity in" value={money(pickedRun.result.equityInvested)} />
              <Stat label="Exit equity" value={money(pickedRun.result.exitEquity)} />
              <Stat label="MOIC" value={moicLabel(pickedRun.result) ?? "Not available"} />
              <Stat label="IRR" value={irrLabel(pickedRun.result) ?? "Not available"} />
              <Stat
                label="Min DSCR"
                value={fmtDscr(minDscr(pickedRun.result))}
                caution={(minDscr(pickedRun.result) ?? Infinity) < SBA_DSCR_MIN}
              />
              <Stat label="Payback" value={`${pickedRun.result.paybackYears} yrs`} />
            </div>
          )}
          {pickedRun?.blocked && (
            <div style={{ ...refuseBand, marginTop: 12 }}>
              <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.55 }}>{pickedRun.blocked}</div>
            </div>
          )}

          {/* THE NEIGHBOURHOOD — growth × exit, IRR in every cell, the base
              case ringed. An unconverged cell prints a dash, not a number. */}
          {grid && (
            <div style={{ marginTop: 16, overflowX: "auto" }}>
              <table style={gridTable}>
                <thead>
                  <tr>
                    <th style={gridCorner}>Growth ↓ · Exit →</th>
                    {grid.cols.map((c, i) => (
                      <th key={i} style={{ ...gridHead, ...(i === grid.baseCol ? gridBaseHead : null) }}>
                        {mult(c)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grid.rows.map((g, ri) => (
                    <tr key={ri}>
                      <td style={{ ...gridRowHead, ...(ri === grid.baseRow ? gridBaseHead : null) }}>
                        {pct(g, 0)}
                      </td>
                      {grid.cells[ri].map((cell, ci) => {
                        const isBase = ri === grid.baseRow && ci === grid.baseCol;
                        return (
                          <td key={ci} style={{ ...gridCell, ...(isBase ? gridBaseCell : null) }}>
                            {cell.converged ? pct(cell.irr, 0) : "—"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {grid.dropped && (
                <div style={{ fontSize: 12, color: T.muted2, marginTop: 6 }}>{grid.dropped}</div>
              )}
            </div>
          )}

          {/* THE WORKINGS — every input's provenance, for the moment the
              number is challenged. */}
          <details style={{ marginTop: 12 }}>
            <summary style={summaryStyle}>Where each input came from</summary>
            <div style={{ marginTop: 8 }}>
              {asm.base.basis.map((b, i) => (
                <div key={i} style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.6, marginBottom: 3 }}>{b}</div>
              ))}
            </div>
          </details>
        </>
      )}

      <div style={orderingNote}>{SCENARIO_ORDERING}</div>
    </div>
  );
}

/* ── pieces ───────────────────────────────────────────────────────────── */

/** The criteria-cell shape carrying an input: filled, radius 8, bold value. */
function AssumptionCell({ label, unit, value, onChange, placeholder, derived }: {
  label: string; unit: string;
  value: string; onChange: (v: string) => void;
  placeholder?: string;
  /** Shown as the value when empty and a derived answer exists ("6.00x"). */
  derived?: string;
}) {
  return (
    <label style={cellWrap}>
      <span style={cellLabel}>{label}</span>
      <span style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={derived ?? placeholder}
          style={cellInput}
        />
        <span style={cellUnit}>{unit}</span>
      </span>
    </label>
  );
}

function Stat({ label, value, caution }: { label: string; value: string; caution?: boolean }) {
  return (
    <div style={{ minWidth: 86 }}>
      <div style={statLabel}>{label}</div>
      <div style={{ ...statValue, color: caution ? T.amber : T.ink }}>{value}</div>
    </div>
  );
}

function numOrNull(txt: string, scale: number): number | null {
  const t = txt.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n * scale : null;
}

function fmtDscr(d: number | null): string {
  return d == null ? "Not available" : `${d.toFixed(2)}x`;
}

/* ── styles — the transcription's scale ───────────────────────────────── */

const cellWrap: CSSProperties = {
  flex: "1 1 0", background: T.track, borderRadius: 8, padding: "9px 14px",
  display: "flex", flexDirection: "column", gap: 2, minWidth: 0, cursor: "text",
};
const cellLabel: CSSProperties = { fontSize: 12, color: T.muted };
const cellInput: CSSProperties = {
  font: "inherit", fontSize: 15, fontWeight: 700, color: T.ink,
  background: "transparent", border: "none", outline: "none",
  padding: 0, width: "100%", minWidth: 0,
};
const cellUnit: CSSProperties = { fontSize: 13, fontWeight: 600, color: T.muted, flex: "none" };

const refuseBand: CSSProperties = {
  marginTop: 14, padding: "12px 14px", background: T.track, borderRadius: 8,
};
const missingList: CSSProperties = {
  margin: "8px 0 0", paddingLeft: 18, fontSize: 13, color: T.muted, lineHeight: 1.55,
};

const statRow: CSSProperties = {
  display: "flex", gap: 18, flexWrap: "wrap", marginTop: 14,
  padding: "12px 14px", background: T.track, borderRadius: 8,
};
const statLabel: CSSProperties = { fontSize: 12, color: T.muted };
const statValue: CSSProperties = {
  fontSize: 15, fontWeight: 700, marginTop: 2, fontVariantNumeric: "tabular-nums",
};

const gridTable: CSSProperties = {
  borderCollapse: "collapse", fontSize: 13, fontVariantNumeric: "tabular-nums",
  width: "100%",
};
const gridCorner: CSSProperties = {
  fontSize: 11.5, fontWeight: 600, color: T.muted, textAlign: "left",
  padding: "6px 8px", borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap",
};
const gridHead: CSSProperties = {
  fontSize: 12.5, fontWeight: 700, color: T.muted, textAlign: "right",
  padding: "6px 8px", borderBottom: `1px solid ${T.border}`,
};
const gridRowHead: CSSProperties = {
  fontSize: 12.5, fontWeight: 700, color: T.muted, textAlign: "left",
  padding: "6px 8px", borderBottom: `1px solid ${T.border}`,
};
const gridCell: CSSProperties = {
  textAlign: "right", padding: "6px 8px", color: T.ink,
  borderBottom: `1px solid ${T.border}`,
};
const gridBaseCell: CSSProperties = {
  background: T.blueBg, fontWeight: 700, color: T.blue, borderRadius: 4,
};
const gridBaseHead: CSSProperties = { color: T.blue };

const summaryStyle: CSSProperties = {
  fontSize: 13, fontWeight: 700, color: T.blue, cursor: "pointer",
};

const orderingNote: CSSProperties = {
  marginTop: 14, fontSize: 12.5, color: T.muted, lineHeight: 1.6,
};
