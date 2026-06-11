import { useEffect, useMemo, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'framer-motion';
import { calculateSDE, calculateValuation, type AddBack } from '../../lib/calculations/core';
import { ProvenanceSeal } from './ProvenanceSeal';
import { dataTween } from './motion';

/**
 * AddBackLedger — Sell's flagship Working Paper exhibit: the $612k → $1.31M
 * normalization as a LIVE ledger. Every line is one of the eight add-backs a
 * buyer's diligence team will examine; click a line to exclude it (the way a
 * buyer's QoE team might contest it) and the normalized SDE, the lift, and
 * the valuation range below all re-derive — through the product's actual
 * calculateSDE / calculateValuation in client/src/lib/calculations/core.ts.
 *
 * The fiction reconciles by construction: 612,000 + Σ(add-backs) = 1,310,000
 * exactly, asserted in scripts/marketing-math-reconcile.ts (CI gate).
 * THE LINE: descriptive only — the exhibit derives numbers, it never advises.
 */

export const SELL_NET_INCOME = 612_000;

/** The eight add-backs. Sum = 698,000 → SDE 1,310,000 ($1.31M, 2.1× lift). */
export const SELL_ADDBACKS: AddBack[] = [
  { label: "Owner's salary", amount: 310_000, verified: true },
  { label: 'Above-market rent to related party', amount: 72_600, verified: true },
  { label: 'One-time legal settlement', amount: 92_000, verified: true },
  { label: 'Family member on payroll (non-working)', amount: 64_000, verified: true },
  { label: 'One-time equipment write-off', amount: 58_000, verified: true },
  { label: 'Owner health & auto', amount: 38_500, verified: true },
  { label: 'Discretionary sponsorships', amount: 35_500, verified: true },
  { label: 'Personal travel & meals', amount: 27_400, verified: true },
] as AddBack[];

const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;
const fmtM = (n: number, dp = 1) => `$${(n / 1_000_000).toFixed(dp)}M`;

export function AddBackLedger() {
  const reduce = !!useReducedMotion();
  const [included, setIncluded] = useState<boolean[]>(() => SELL_ADDBACKS.map(() => true));

  const activeAddbacks = useMemo(
    () => SELL_ADDBACKS.filter((_, i) => included[i]),
    [included],
  );
  // The real model runs: normalization, then the price that follows from it.
  const { sde } = useMemo(() => calculateSDE(SELL_NET_INCOME, 0, activeAddbacks), [activeAddbacks]);
  const valuation = useMemo(() => calculateValuation(sde, 'L2'), [sde]);
  const lift = sde / SELL_NET_INCOME;
  const includedCount = activeAddbacks.length;

  // SDE settles from its previous value (Working Paper motion rule).
  const [sdeShown, setSdeShown] = useState(sde);
  const prev = useRef(sde);
  useEffect(() => {
    if (reduce) { prev.current = sde; setSdeShown(sde); return; }
    const controls = animate(prev.current, sde, { ...dataTween(0.35), onUpdate: (v) => setSdeShown(v) });
    prev.current = sde;
    return () => controls.stop();
  }, [sde, reduce]);

  const toggle = (i: number) =>
    setIncluded((arr) => arr.map((v, j) => (j === i ? !v : v)));

  return (
    <div className="sched" style={{ boxShadow: '0 30px 60px -42px rgba(25,24,19,.4)' }}>
      <div className="sched-hd">
        <span className="sched-no">Schedule 1 — Seller&rsquo;s discretionary earnings</span>
        <span className="sched-sub">normalization · computed in your browser</span>
      </div>

      {/* before → after, after derived live */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 20, padding: '34px 28px 26px' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: '.72rem', letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Reported profit</div>
          <div className="mono num" style={{ fontSize: 'clamp(1.8rem,3.6vw,2.7rem)', fontWeight: 500, color: 'var(--ink-3)', marginTop: 8 }}>{fmt(SELL_NET_INCOME).replace(',000', 'k')}</div>
          <p className="body" style={{ fontSize: '.9rem', marginTop: 10 }}>What the tax return shows</p>
        </div>
        <div className="mkt-liftarrow" style={{ color: 'var(--ink-3)' }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: '.72rem', letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--accent-strong)' }}>Normalized SDE</div>
          <div className="num" style={{ fontFamily: 'var(--serif)', fontOpticalSizing: 'auto', fontWeight: 560, fontSize: 'clamp(2rem,4.2vw,3.1rem)', letterSpacing: '-.02em', color: 'var(--accent-strong)', marginTop: 6, lineHeight: 1 }} aria-live="polite">
            {fmtM(sdeShown, 2)}
          </div>
          <p className="body" style={{ fontSize: '.9rem', marginTop: 10 }}>What a buyer underwrites to</p>
        </div>
      </div>

      {/* the ledger itself — toggleable lines */}
      <div className="sched-body" style={{ paddingTop: 0 }}>
        <table className="ledger" aria-label="Add-back ledger — click a line to exclude it">
          <tbody>
            <tr className="lg-row">
              <td className="lg-tick" aria-hidden="true" />
              <td className="lg-label">Net income (reported)</td>
              <td className="lg-amt">{fmt(SELL_NET_INCOME)}</td>
            </tr>
            {SELL_ADDBACKS.map((ab, i) => (
              <tr
                key={ab.label}
                className={`lg-row lg-toggle${included[i] ? '' : ' is-off'}`}
                onClick={() => toggle(i)}
                role="checkbox"
                aria-checked={included[i]}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(i); } }}
              >
                <td className="lg-tick" aria-hidden="true">{included[i] ? '✓' : '·'}</td>
                <td className="lg-label">{ab.label}</td>
                <td className="lg-amt">{fmt(ab.amount)}</td>
              </tr>
            ))}
            <tr className="lg-total">
              <td />
              <td className="lg-label rule-over">Seller&rsquo;s discretionary earnings</td>
              <td className="lg-amt rule-over rule-double-under num">{fmt(sde)}</td>
            </tr>
          </tbody>
        </table>
        <p className="lg-note mono" style={{ marginTop: 10 }}>
          {includedCount} of {SELL_ADDBACKS.length} add-backs included · {lift.toFixed(1)}× lift ·
          click a line to see what happens if a buyer&rsquo;s team contests it
        </p>

        {/* the price that follows — derived from the live SDE */}
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="mono" style={{ fontSize: '.7rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
              Valuation that follows · {valuation.multipleMin.toFixed(1)}–{valuation.multipleMax.toFixed(1)}× SDE
            </div>
            <div className="mono num" style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: 6 }}>
              {fmtM(valuation.low)} – {fmtM(valuation.high)}
              <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}> · midpoint {fmtM(valuation.mid)}</span>
            </div>
          </div>
          <ProvenanceSeal
            inputs={{ model: 'calculateSDE+calculateValuation', netIncome: SELL_NET_INCOME, addBacks: activeAddbacks, league: 'L2' }}
            modelId="MODEL.VAL.SDE.v1"
            note="computed in your browser just now"
          />
        </div>
      </div>
    </div>
  );
}
