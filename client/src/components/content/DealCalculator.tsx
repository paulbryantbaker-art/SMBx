/**
 * DealCalculator.tsx
 * /buy page cinematic anchor.
 *
 * Drag four sliders → see the deal economics come alive:
 *   1. Enterprise Value ($1M–$100M)
 *   2. Entry multiple (3.0× – 9.0× EBITDA)
 *   3. Equity down (10% – 50%)
 *   4. EBITDA growth (0% – 15% / yr)
 *
 * Live read-out in three columns:
 *   01 · At close       — equity check, debt, year-1 DSCR
 *   02 · Year 5         — grown EBITDA, exit EV, debt remaining
 *   03 · Your return    — equity back, MOIC
 *
 * Spread headline: 5-year IRR.
 *
 * Assumptions: 10% blended interest, 10-year amortization, 20% EBITDA
 * capex reserve, exit at entry multiple (conservative). Flagged below
 * the calc so sophisticated users know they're in a teaser, not a full
 * LBO model (the full model lives in the app at /buy tools).
 */

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  dark: boolean;
  /** Journey-specific accent. Defaults to the /buy teal. */
  accent?: string;
}

function fmtMoney(m: number): string {
  if (m >= 1000) return `$${(m / 1000).toFixed(1)}B`;
  if (m >= 1) return `$${m.toFixed(2).replace(/\.00$/, '')}M`;
  if (m >= 0.001) return `$${(m * 1000).toFixed(0)}K`;
  return `$${Math.round(m * 1_000_000).toLocaleString()}`;
}

function fmtPercent(v: number, digits = 1): string {
  return `${(v * 100).toFixed(digits)}%`;
}

/** Standard amortization payment (PMT). Rate/year · term/years · principal. */
function pmt(annualRate: number, years: number, principal: number): number {
  if (principal <= 0) return 0;
  const r = annualRate;
  const n = years;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

/** Debt balance remaining after `yearsElapsed` of amortized payments. */
function debtBalance(
  annualRate: number,
  termYears: number,
  principal: number,
  yearsElapsed: number,
): number {
  if (yearsElapsed >= termYears) return 0;
  const r = annualRate;
  const remaining = termYears - yearsElapsed;
  // FV of annuity: principal grown at rate minus payments grown at rate
  const payment = pmt(annualRate, termYears, principal);
  if (r === 0) return principal - payment * yearsElapsed;
  return (
    principal * Math.pow(1 + r, yearsElapsed) -
    payment * ((Math.pow(1 + r, yearsElapsed) - 1) / r)
  );
}

export function DealCalculator({ dark, accent: accentOverride }: Props) {
  // Slider state
  const [ev, setEv] = useState(8); // $M — classic lower-mid SMB target
  const [multiple, setMultiple] = useState(5); // × EBITDA
  const [equityPct, setEquityPct] = useState(30); // %
  const [growth, setGrowth] = useState(6); // % / yr

  // Assumptions — locked, surfaced in the footnote.
  const RATE = 0.10;       // blended senior + seller note
  const TERM = 10;         // years
  const CAPEX_PCT = 0.20;  // of EBITDA
  const HOLD = 5;          // years to exit

  const math = useMemo(() => {
    const ebitda = ev / multiple;
    const equity = ev * (equityPct / 100);
    const debt = ev - equity;
    const annualDebtService = pmt(RATE, TERM, debt);
    const capex = ebitda * CAPEX_PCT;
    const dscr = annualDebtService > 0 ? ebitda / annualDebtService : Infinity;
    const y1FCF = ebitda - annualDebtService - capex;

    // Year-5 projection
    const y5Ebitda = ebitda * Math.pow(1 + growth / 100, HOLD);
    const y5Exit = y5Ebitda * multiple;           // conservative: exit at entry multiple
    const y5Debt = debtBalance(RATE, TERM, debt, HOLD);
    const y5Equity = y5Exit - y5Debt;
    const moic = equity > 0 ? y5Equity / equity : 0;
    const irr = equity > 0 && moic > 0 ? Math.pow(moic, 1 / HOLD) - 1 : 0;

    return {
      ebitda, equity, debt, annualDebtService, capex, dscr, y1FCF,
      y5Ebitda, y5Exit, y5Debt, y5Equity, moic, irr,
    };
  }, [ev, multiple, equityPct, growth]);

  // Colors — the calc sits INSIDE an immersive dark SectionBand, so the
  // whole thing reads as a light "sheet of paper" on a dark stage
  // (Apple's cinematic move). Sub-cards are soft grey; the teal "return"
  // card is the one accented moment that stops the eye.
  const outerBg = '#ffffff';
  const outerBorder = 'rgba(15,16,18,0.08)';
  const innerBg = '#f6f5f2';                        // warm off-white
  const innerBorder = 'rgba(15,16,18,0.06)';
  const headingColor = '#0f1012';
  const bodyColor = '#3c3d40';
  const mutedColor = '#6e6a63';
  const accent = accentOverride ?? '#3E8E8E';        // /buy teal (single variant — card is always light)
  const sbaEligible = math.dscr >= 1.25;

  return (
    <div
      className="rounded-2xl p-6 md:p-8"
      style={{
        background: outerBg,
        border: `1px solid ${outerBorder}`,
        boxShadow: '0 24px 60px -24px rgba(0,0,0,0.45)',
      }}
    >
      <div className="mb-6">
        <p
          className="text-[11px] font-semibold mb-2"
          style={{ color: accent, letterSpacing: '0.04em' }}
        >
          Drag to model any deal
        </p>
        <h3
          className="font-headline font-black text-2xl md:text-3xl tracking-tight"
          style={{ color: headingColor }}
        >
          The deal, in four sliders.
        </h3>
      </div>

      {/* Sliders — 2×2 grid on desktop, 1-col on narrow */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <Slider
          label="Enterprise Value"
          display={ev >= 100 ? `$${ev.toFixed(0)}M` : `$${ev.toFixed(1)}M`}
          min={1}
          max={100}
          step={0.5}
          value={ev}
          onChange={setEv}
          accent={accent}
          mutedColor={mutedColor}
          headingColor={headingColor}
          axisLabels={['$1M', '$25M', '$100M']}
        />
        <Slider
          label="Entry multiple"
          display={`${multiple.toFixed(1)}× EBITDA`}
          min={3}
          max={9}
          step={0.1}
          value={multiple}
          onChange={setMultiple}
          accent={accent}
          mutedColor={mutedColor}
          headingColor={headingColor}
          axisLabels={['3×', '6×', '9×']}
        />
        <Slider
          label="Equity down"
          display={`${equityPct.toFixed(0)}%`}
          min={10}
          max={50}
          step={1}
          value={equityPct}
          onChange={setEquityPct}
          accent={accent}
          mutedColor={mutedColor}
          headingColor={headingColor}
          axisLabels={['10% SBA', '30%', '50%']}
        />
        <Slider
          label="EBITDA growth / yr"
          display={`${growth.toFixed(0)}%`}
          min={0}
          max={15}
          step={0.5}
          value={growth}
          onChange={setGrowth}
          accent={accent}
          mutedColor={mutedColor}
          headingColor={headingColor}
          axisLabels={['0%', '7.5%', '15%']}
        />
      </div>

      {/* Implied EBITDA — derived from EV / multiple */}
      <div
        className="rounded-xl p-4 mb-6 flex items-baseline justify-between flex-wrap gap-3"
        style={{ background: innerBg, border: `1px solid ${innerBorder}` }}
      >
        <div>
          <p
            className="text-[10px] font-semibold uppercase mb-1"
            style={{ color: mutedColor, letterSpacing: '0.08em' }}
          >
            Implied EBITDA
          </p>
          <motion.p
            key={math.ebitda.toFixed(2)}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="font-headline font-black tabular-nums tracking-tight"
            style={{
              fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
              color: headingColor,
              lineHeight: 1,
            }}
          >
            {fmtMoney(math.ebitda)}
          </motion.p>
        </div>
        <span
          className="text-[11px] font-semibold uppercase px-3 py-1.5 rounded-full"
          style={{
            letterSpacing: '0.08em',
            background: sbaEligible ? `${accent}22` : 'rgba(200,106,46,0.10)',
            color: sbaEligible ? accent : '#c86a2e',
            border: `1px solid ${sbaEligible ? `${accent}55` : 'rgba(200,106,46,0.30)'}`,
          }}
        >
          {sbaEligible ? 'SBA eligible · DSCR ≥ 1.25' : 'Stress · DSCR below SBA minimum'}
        </span>
      </div>

      {/* The three columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* 01 · At close */}
        <div
          className="rounded-xl p-6"
          style={{ background: innerBg, border: `1px solid ${innerBorder}` }}
        >
          <p
            className="text-[10px] font-semibold uppercase mb-3"
            style={{ color: mutedColor, letterSpacing: '0.08em' }}
          >
            01 · At close
          </p>
          <Stat
            label="Equity check"
            valueKey={math.equity.toFixed(2)}
            value={fmtMoney(math.equity)}
            color={headingColor}
            mutedColor={mutedColor}
            emphasis
          />
          <Stat
            label="Debt"
            valueKey={math.debt.toFixed(2)}
            value={fmtMoney(math.debt)}
            color={bodyColor}
            mutedColor={mutedColor}
          />
          <Stat
            label="Annual debt service"
            valueKey={math.annualDebtService.toFixed(2)}
            value={fmtMoney(math.annualDebtService)}
            color={bodyColor}
            mutedColor={mutedColor}
          />
          <Stat
            label="Year-1 DSCR"
            valueKey={math.dscr.toFixed(2)}
            value={math.dscr === Infinity ? 'n/a' : `${math.dscr.toFixed(2)}×`}
            color={sbaEligible ? accent : '#c86a2e'}
            mutedColor={mutedColor}
          />
        </div>

        {/* 02 · Year 5 */}
        <div
          className="rounded-xl p-6"
          style={{ background: innerBg, border: `1px solid ${innerBorder}` }}
        >
          <p
            className="text-[10px] font-semibold uppercase mb-3"
            style={{ color: mutedColor, letterSpacing: '0.08em' }}
          >
            02 · Year 5 (projected)
          </p>
          <Stat
            label="EBITDA"
            valueKey={math.y5Ebitda.toFixed(2)}
            value={fmtMoney(math.y5Ebitda)}
            color={bodyColor}
            mutedColor={mutedColor}
          />
          <Stat
            label="Enterprise value at exit"
            valueKey={math.y5Exit.toFixed(2)}
            value={fmtMoney(math.y5Exit)}
            color={headingColor}
            mutedColor={mutedColor}
            emphasis
          />
          <Stat
            label="Debt remaining"
            valueKey={math.y5Debt.toFixed(2)}
            value={fmtMoney(math.y5Debt)}
            color={bodyColor}
            mutedColor={mutedColor}
          />
          <Stat
            label="Equity value at exit"
            valueKey={math.y5Equity.toFixed(2)}
            value={fmtMoney(math.y5Equity)}
            color={accent}
            mutedColor={mutedColor}
            emphasis
          />
        </div>

        {/* 03 · Your return — accent-filled card */}
        <div
          className="rounded-xl p-6 relative overflow-hidden"
          style={{ background: accent, color: 'white' }}
        >
          <div className="relative">
            <p
              className="text-[10px] font-semibold uppercase mb-3 opacity-85"
              style={{ letterSpacing: '0.08em' }}
            >
              03 · Your return
            </p>
            <Stat
              label="Initial equity"
              valueKey={math.equity.toFixed(2)}
              value={fmtMoney(math.equity)}
              color="rgba(255,255,255,0.85)"
              mutedColor="rgba(255,255,255,0.65)"
            />
            <Stat
              label="Equity back at exit"
              valueKey={math.y5Equity.toFixed(2)}
              value={fmtMoney(math.y5Equity)}
              color="white"
              mutedColor="rgba(255,255,255,0.65)"
              emphasis
            />
            <Stat
              label="MOIC"
              valueKey={math.moic.toFixed(2)}
              value={`${math.moic.toFixed(2)}×`}
              color="white"
              mutedColor="rgba(255,255,255,0.65)"
              emphasis
            />
          </div>
        </div>
      </div>

      {/* The spread — 5-year IRR as the headline */}
      <div
        className="rounded-xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-center"
        style={{ background: innerBg, border: `1px solid ${innerBorder}` }}
      >
        <div>
          <p
            className="text-[10px] font-semibold uppercase mb-2"
            style={{ color: mutedColor, letterSpacing: '0.08em' }}
          >
            5-year IRR
          </p>
          <motion.p
            key={math.irr.toFixed(3)}
            initial={{ opacity: 0.4, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="font-headline font-black tabular-nums tracking-tight"
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              color: accent,
              lineHeight: 0.95,
            }}
          >
            {math.irr <= 0 ? '—' : fmtPercent(math.irr, 1)}
          </motion.p>
          <p className="text-sm mt-2" style={{ color: bodyColor }}>
            {math.irr >= 0.25
              ? 'Top-quartile return. The deal pencils if the growth rate holds.'
              : math.irr >= 0.15
              ? 'Solid mid-market return. Acceptable for most LPs.'
              : math.irr > 0
              ? 'Below the hurdle most sponsors underwrite to. Raise growth, lower multiple, or raise equity.'
              : 'Equity impaired under these assumptions. Structurally unbankable.'}
          </p>
        </div>
        <div>
          <p
            className="text-[10px] font-semibold uppercase mb-2"
            style={{ color: mutedColor, letterSpacing: '0.08em' }}
          >
            Year-1 free cash flow
          </p>
          <motion.p
            key={math.y1FCF.toFixed(2)}
            initial={{ opacity: 0.4, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="font-headline font-black tabular-nums tracking-tight"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: math.y1FCF >= 0 ? headingColor : '#c86a2e',
              lineHeight: 0.95,
            }}
          >
            {fmtMoney(math.y1FCF)}
          </motion.p>
          <p className="text-sm mt-2" style={{ color: bodyColor }}>
            EBITDA less debt service less {Math.round(CAPEX_PCT * 100)}% capex reserve.
            {math.y1FCF < 0 ? ' Deal starves in year one under these assumptions.' : ' Cash to the sponsor for distributions, retention bonuses, or reinvestment.'}
          </p>
        </div>
      </div>

      <p className="text-xs mt-6 leading-relaxed" style={{ color: mutedColor }}>
        Simplified LBO teaser. Assumes blended rate {fmtPercent(RATE, 0)}, {TERM}-yr amortization,
        {' '}{Math.round(CAPEX_PCT * 100)}% EBITDA capex reserve, exit at entry multiple (no multiple expansion baked in),
        {' '}and ratable EBITDA growth. The full model in-app layers in working capital, tax,
        sensitivity, sources &amp; uses, and sponsor promote.
      </p>
    </div>
  );
}

/* ───────── Subcomponents ───────── */

function Slider({
  label, display, min, max, step, value, onChange,
  accent, mutedColor, headingColor, axisLabels,
}: {
  label: string;
  display: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  accent: string;
  mutedColor: string;
  headingColor: string;
  axisLabels: [string, string, string];
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2 flex-wrap gap-2">
        <span
          className="text-[10px] font-semibold uppercase"
          style={{ color: mutedColor, letterSpacing: '0.08em' }}
        >
          {label}
        </span>
        <motion.span
          key={display}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="font-headline font-black tabular-nums"
          style={{ fontSize: '1.25rem', color: headingColor, letterSpacing: '-0.01em' }}
        >
          {display}
        </motion.span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        aria-label={label}
        style={{ accentColor: accent }}
      />
      <div
        className="flex justify-between text-[10px] font-semibold tabular-nums mt-1.5"
        style={{ color: mutedColor, letterSpacing: '0.02em' }}
      >
        <span>{axisLabels[0]}</span>
        <span>{axisLabels[1]}</span>
        <span>{axisLabels[2]}</span>
      </div>
    </div>
  );
}

function Stat({
  label, valueKey, value, color, mutedColor, emphasis,
}: {
  label: string;
  valueKey: string;
  value: string;
  color: string;
  mutedColor: string;
  emphasis?: boolean;
}) {
  return (
    <div className="mb-2 last:mb-0">
      <p className="text-[11px]" style={{ color: mutedColor }}>
        {label}
      </p>
      <motion.p
        key={valueKey}
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="font-headline font-black tabular-nums tracking-tight"
        style={{
          fontSize: emphasis ? '1.375rem' : '1.125rem',
          color,
          lineHeight: 1,
        }}
      >
        {value}
      </motion.p>
    </div>
  );
}

