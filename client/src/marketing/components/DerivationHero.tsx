import { useEffect, useMemo, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'framer-motion';
import { calculateValuation } from '../../lib/calculations/core';
import { ProvenanceSeal } from './ProvenanceSeal';
import { dataTween } from './motion';
import { enterApp } from '../useEnterApp';

/**
 * DerivationHero — the Working Paper signature: a single oversized compute
 * line under the headline, typeset like a worked equation —
 *
 *     EBITDA $8.4M  ×  5.5×  →  EV $46.2M
 *
 * and it is REAL: edit the EBITDA, drag (or step / arrow-key) the multiple,
 * and the enterprise value re-derives through the product's actual
 * calculateValuation in client/src/lib/calculations/core.ts — then the
 * ProvenanceSeal re-digests the inputs with SubtleCrypto. Every figure a
 * visitor sees here was computed in their own tab. Numbers never count from
 * zero; they settle from their previous value (motion.ts "data" physics).
 *
 * THE LINE: the instrument stays descriptive ("computed", "illustrative") —
 * it derives a number, it never recommends an action.
 */

const MULT_MIN = 3.0;
const MULT_MAX = 9.0;
const EBITDA_MIN = 0.5; // $M
const EBITDA_MAX = 50;  // $M
/** Range half-width: the displayed range is ±1.0× around the chosen multiple. */
const RANGE_BAND = 1.0;
const DRAG_PX_PER_TENTH = 2.4; // 24px per 1.0× — firm but quick

const fmtM = (n: number, dp = 1) => `$${(n / 1_000_000).toFixed(dp)}M`;

export function DerivationHero() {
  const reduce = !!useReducedMotion();
  const [ebitdaM, setEbitdaM] = useState(8.4); // $M
  const [multiple, setMultiple] = useState(5.5);

  // The real model run — same pure function the product ships.
  const valuation = useMemo(
    () =>
      calculateValuation(ebitdaM * 1_000_000, 'L4', {
        min: Math.max(0.5, multiple - RANGE_BAND),
        max: multiple + RANGE_BAND,
      }),
    [ebitdaM, multiple],
  );

  // EV settles from its previous value when an input changes (never from 0).
  const [evShown, setEvShown] = useState(valuation.mid);
  const evPrev = useRef(valuation.mid);
  useEffect(() => {
    if (reduce) {
      evPrev.current = valuation.mid;
      setEvShown(valuation.mid);
      return;
    }
    const controls = animate(evPrev.current, valuation.mid, {
      ...dataTween(0.35),
      onUpdate: (v) => setEvShown(v),
    });
    evPrev.current = valuation.mid;
    return () => controls.stop();
  }, [valuation.mid, reduce]);

  /* ── multiple: drag / steppers / arrow keys ── */
  const drag = useRef<{ x: number; m: number } | null>(null);
  const setMult = (m: number) =>
    setMultiple(Math.round(Math.min(MULT_MAX, Math.max(MULT_MIN, m)) * 10) / 10);

  const onPointerDown = (e: React.PointerEvent<HTMLSpanElement>) => {
    drag.current = { x: e.clientX, m: multiple };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    setMult(drag.current.m + (dx / DRAG_PX_PER_TENTH) * 0.01);
  };
  const onPointerUp = () => { drag.current = null; };
  const onKnobKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); setMult(multiple + 0.1); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); setMult(multiple - 0.1); }
  };

  /* ── EBITDA: editable figure ── */
  const ebitdaRef = useRef<HTMLSpanElement>(null);
  const commitEbitda = () => {
    const el = ebitdaRef.current;
    if (!el) return;
    const parsed = parseFloat((el.textContent || '').replace(/[^0-9.]/g, ''));
    const next = Number.isFinite(parsed)
      ? Math.round(Math.min(EBITDA_MAX, Math.max(EBITDA_MIN, parsed)) * 10) / 10
      : ebitdaM;
    setEbitdaM(next);
    el.textContent = `$${next.toFixed(1)}M`;
  };
  const onEbitdaKey = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); (e.currentTarget as HTMLSpanElement).blur(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); bumpEbitda(0.1); }
    if (e.key === 'ArrowDown') { e.preventDefault(); bumpEbitda(-0.1); }
  };
  const bumpEbitda = (d: number) => {
    const next = Math.round(Math.min(EBITDA_MAX, Math.max(EBITDA_MIN, ebitdaM + d)) * 10) / 10;
    setEbitdaM(next);
    if (ebitdaRef.current) ebitdaRef.current.textContent = `$${next.toFixed(1)}M`;
  };

  const askYulia = () =>
    enterApp(
      `Value a business doing $${ebitdaM.toFixed(1)}M EBITDA at a ${multiple.toFixed(1)}× multiple — walk me through the range and what moves it.`,
    );

  return (
    <div className="dh">
      <div className="dh-eq" role="group" aria-label="Live valuation derivation — edit the inputs">
        <span className="dh-term">
          <span className="dh-lbl mono">EBITDA</span>
          <span
            ref={ebitdaRef}
            className="dh-val dh-edit mono num"
            contentEditable
            suppressContentEditableWarning
            inputMode="decimal"
            role="textbox"
            aria-label="EBITDA in millions — editable"
            spellCheck={false}
            onBlur={commitEbitda}
            onKeyDown={onEbitdaKey}
          >
            {`$${ebitdaM.toFixed(1)}M`}
          </span>
        </span>

        <span className="dh-op" aria-hidden="true">×</span>

        <span className="dh-term">
          <span className="dh-lbl mono">multiple</span>
          <span className="dh-knobrow">
            <button type="button" className="dh-step mono" aria-label="Decrease multiple" onClick={() => setMult(multiple - 0.1)}>−</button>
            <span
              className="dh-val dh-knob mono num"
              role="slider"
              tabIndex={0}
              aria-label="Entry multiple — drag or use arrow keys"
              aria-valuemin={MULT_MIN}
              aria-valuemax={MULT_MAX}
              aria-valuenow={multiple}
              aria-valuetext={`${multiple.toFixed(1)} times`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onKeyDown={onKnobKey}
            >
              {multiple.toFixed(1)}×
            </span>
            <button type="button" className="dh-step mono" aria-label="Increase multiple" onClick={() => setMult(multiple + 0.1)}>+</button>
          </span>
        </span>

        <span className="dh-op" aria-hidden="true">→</span>

        <span className="dh-term dh-out">
          <span className="dh-lbl mono">enterprise value</span>
          <span className="dh-ev num" aria-live="polite">{fmtM(evShown)}</span>
        </span>
      </div>

      <div className="dh-under">
        <span className="dh-range mono num">
          range {fmtM(valuation.low, 0)} – {fmtM(valuation.high, 0)} · ±{RANGE_BAND.toFixed(1)}× band · illustrative
        </span>
        <ProvenanceSeal
          dark
          inputs={{ model: 'calculateValuation', ebitda: ebitdaM * 1_000_000, multiple, band: RANGE_BAND }}
          modelId="MODEL.valuation.v1"
          note="computed in your browser just now"
        />
      </div>

      <button type="button" className="dh-yulia" onClick={askYulia}>
        Yulia can run this on your numbers →
      </button>
    </div>
  );
}
