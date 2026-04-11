import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  calculateDSCRFull,
  calculateStockSaleTax,
  FEDERAL_RATES,
} from '../../lib/calculations/core';
import { MagneticButton, AnimatedCounter } from './animations';
import { bridgeToYulia } from './chatBridge';

/* ═══════════════════════════════════════════════
   SHARED STYLES
   ═══════════════════════════════════════════════ */

const sliderThumb = `
  [&::-webkit-slider-thumb]:appearance-none
  [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#D44A78]
  [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md
  [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5
  [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#D44A78]
  [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0
`;

function Slider({ value, min, max, step, onChange, label, displayValue, dark }: {
  value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; label: string; displayValue: string; dark?: boolean;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1.5">
        <span className={dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}>{label}</span>
        <span className={`font-bold tabular-nums ${dark ? 'text-[#f9f9fc]' : 'text-[#1a1c1e]'}`}>{displayValue}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className={`w-full h-1.5 rounded-full appearance-none cursor-pointer ${sliderThumb}`}
        style={{
          background: `linear-gradient(to right, #D44A78 0%, #D44A78 ${pct}%, ${dark ? '#3f4245' : '#e5e5e7'} ${pct}%, ${dark ? '#3f4245' : '#e5e5e7'} 100%)`,
        }}
      />
    </div>
  );
}

function ResultCard({ label, value, highlight, dark }: {
  label: string; value: string; highlight?: boolean; dark?: boolean;
}) {
  return (
    <div className={`rounded-xl p-4 text-center ${highlight
      ? 'bg-[#D44A78]/10 border border-[#D44A78]/20'
      : dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-[#f3f3f6] border border-[#eeeef0]'
    }`}>
      <p className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${dark ? 'text-[#dadadc]/60' : 'text-[#5d5e61]'}`}>{label}</p>
      <p className={`text-xl font-black tabular-nums ${highlight ? 'text-[#D44A78]' : dark ? 'text-[#f9f9fc]' : 'text-[#1a1c1e]'}`}>{value}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   1. BASELINE CALCULATOR — /sell
   "What is my business worth?"
   ═══════════════════════════════════════════════ */

/**
 * Industry consensus ranges, $5M-$100M EBITDA segment, 2024-2025 mid-market data.
 * Each entry: ebitdaMargin (revenue → EBITDA), multipleMin/Max (EBITDA × multiple).
 */
const INDUSTRIES = [
  { label: 'Tech-enabled services',          ebitdaMargin: 0.22, multipleMin: 9,    multipleMax: 13   },
  { label: 'Vertical SaaS at scale',         ebitdaMargin: 0.28, multipleMin: 12,   multipleMax: 20   },
  { label: 'Healthcare services',            ebitdaMargin: 0.18, multipleMin: 9,    multipleMax: 12   },
  { label: 'Insurance brokerage',            ebitdaMargin: 0.25, multipleMin: 10,   multipleMax: 14   },
  { label: 'Wealth management / RIA',        ebitdaMargin: 0.30, multipleMin: 10,   multipleMax: 15   },
  { label: 'MSP / IT services',              ebitdaMargin: 0.22, multipleMin: 8,    multipleMax: 12   },
  { label: 'Specialty distribution',         ebitdaMargin: 0.13, multipleMin: 6,    multipleMax: 9    },
  { label: 'HVAC / contractors (PE rollup)', ebitdaMargin: 0.18, multipleMin: 7,    multipleMax: 10   },
  { label: 'Industrial manufacturing',       ebitdaMargin: 0.14, multipleMin: 6,    multipleMax: 9    },
  { label: 'Building products',              ebitdaMargin: 0.15, multipleMin: 7,    multipleMax: 10   },
  { label: 'Specialty chemicals',            ebitdaMargin: 0.16, multipleMin: 7,    multipleMax: 10   },
  { label: 'Logistics / 3PL',                ebitdaMargin: 0.12, multipleMin: 6,    multipleMax: 9    },
  { label: 'Pharma services / CRO',          ebitdaMargin: 0.20, multipleMin: 11,   multipleMax: 14   },
  { label: 'Food & beverage specialty',      ebitdaMargin: 0.14, multipleMin: 8,    multipleMax: 12   },
  { label: 'Defense manufacturing',          ebitdaMargin: 0.14, multipleMin: 6,    multipleMax: 9    },
];

/** Revenue stops for stop-indexed slider — $1M to $1B */
const REVENUE_STOPS = [
  1_000_000, 5_000_000, 10_000_000, 25_000_000, 50_000_000, 100_000_000,
  200_000_000, 350_000_000, 500_000_000, 750_000_000, 1_000_000_000,
];

export function BaselineCalculator({ dark }: { dark?: boolean }) {
  const [industry, setIndustry] = useState(0); // Tech-enabled services default
  const [revenueIdx, setRevenueIdx] = useState(4); // $50M revenue default

  const ind = INDUSTRIES[industry];
  const revenue = REVENUE_STOPS[revenueIdx];
  const ebitda = Math.round(revenue * ind.ebitdaMargin);
  const valuationLow = Math.round(ebitda * ind.multipleMin);
  const valuationHigh = Math.round(ebitda * ind.multipleMax);

  const fmt = (n: number) => {
    if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '')}B`;
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n.toLocaleString()}`;
  };

  return (
    <div className={`rounded-2xl p-8 ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
      <p className="text-[#D44A78] font-bold uppercase tracking-widest text-xs mb-6">Baseline Calculator · 2024-2025 mid-market consensus</p>

      <div className="mb-6">
        <label className={`text-sm font-medium mb-2 block ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>Industry</label>
        <select
          value={industry}
          onChange={e => setIndustry(Number(e.target.value))}
          className={`w-full rounded-xl px-4 py-3 text-sm font-medium border cursor-pointer ${
            dark ? 'bg-[#1a1c1e] border-zinc-700 text-[#f9f9fc]' : 'bg-[#f3f3f6] border-[#eeeef0] text-[#1a1c1e]'
          }`}
        >
          {INDUSTRIES.map((i, idx) => (
            <option key={i.label} value={idx}>
              {i.label} · {i.multipleMin}-{i.multipleMax}× EBITDA
            </option>
          ))}
        </select>
      </div>

      <Slider
        value={revenueIdx}
        min={0}
        max={REVENUE_STOPS.length - 1}
        step={1}
        onChange={setRevenueIdx}
        label="Annual revenue"
        displayValue={fmt(revenue)}
        dark={dark}
      />

      <div className={`mt-6 pt-6 ${dark ? 'border-t border-zinc-700' : 'border-t border-[#eeeef0]'}`}>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <ResultCard label="Est. EBITDA" value={fmt(ebitda)} dark={dark} />
          <ResultCard
            label="Multiple range"
            value={`${ind.multipleMin}-${ind.multipleMax}×`}
            dark={dark}
          />
          <ResultCard
            label="Baseline range"
            value={`${fmt(valuationLow)}–${fmt(valuationHigh)}`}
            highlight
            dark={dark}
          />
        </div>
        <p className={`text-xs mb-4 ${dark ? 'text-[#dadadc]/60' : 'text-[#5d5e61]'}`}>
          {ind.label} at {fmt(revenue)} revenue and ~{Math.round(ind.ebitdaMargin * 100)}% EBITDA margin trades {ind.multipleMin}-{ind.multipleMax}× EBITDA in the 2024-2025 mid-market consensus. Add-backs (Blind Equity™), customer concentration, growth, and recurring revenue mix move you within the range.
        </p>
      </div>

      <MagneticButton
        onClick={() => bridgeToYulia(
          `I'm looking at a ${ind.label} business with about ${fmt(revenue)} in annual revenue. ` +
          `The calculator estimated EBITDA at ${fmt(ebitda)} and a Baseline range of ${fmt(valuationLow)}–${fmt(valuationHigh)} ` +
          `(${ind.multipleMin}-${ind.multipleMax}× EBITDA). ` +
          `Can you find the Blind Equity I'm missing and pin down where in the range we should land?`
        )}
        className="w-full mt-2 px-6 py-3.5 bg-gradient-to-r from-[#D44A78] to-[#E8709A] text-white rounded-full font-bold text-sm hover:scale-[1.02] transition-all shadow-md border-none cursor-pointer"
      >
        Get the full Baseline from Yulia
      </MagneticButton>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   2. LANDING SBA / DSCR CALC — /buy
   "Is this deal SBA bankable?"
   ═══════════════════════════════════════════════ */

/** EBITDA stops — log-ish progression from SBA to upper middle market to mega-cap */
const EBITDA_STOPS = [
  200_000, 500_000, 1_000_000, 2_500_000, 5_000_000, 10_000_000, 20_000_000,
  40_000_000, 75_000_000, 150_000_000, 300_000_000,
];

function fmtBig(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2).replace(/\.00$/, '')}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

/** Choose a sensible default rate for the deal scale */
function defaultRateFor(ev: number): number {
  if (ev <= 5_000_000) return 10.75;       // SBA 7(a)
  if (ev <= 50_000_000) return 9.5;        // Bank senior + unitranche blend
  if (ev <= 250_000_000) return 9.0;       // Mid-market senior
  return 8.5;                              // Large-cap senior
}

/** What kind of debt this deal would actually use */
function debtTypeFor(ev: number): string {
  if (ev <= 5_000_000) return 'SBA 7(a)';
  if (ev <= 25_000_000) return 'Conventional senior';
  if (ev <= 100_000_000) return 'Senior + unitranche';
  if (ev <= 500_000_000) return 'Senior + unitranche + mezz';
  return 'Multi-tranche structured';
}

export function LandingSBACalc({ dark }: { dark?: boolean }) {
  // Stop-indexed sliders make a 1500x range manageable
  const [ebitdaIdx, setEbitdaIdx] = useState(4); // $5M EBITDA default
  const [multiple, setMultiple] = useState(8);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(9.5);
  const [termYears, setTermYears] = useState(7);

  const ebitda = EBITDA_STOPS[ebitdaIdx];
  const purchasePrice = Math.round(ebitda * multiple);
  const equity = Math.round(purchasePrice * (downPct / 100));
  const loanAmount = purchasePrice - equity;
  const result = calculateDSCRFull(ebitda, loanAmount, rate / 100, termYears * 12);

  const dscrColor = result.dscr >= 1.5 ? '#34A853' : result.dscr >= 1.25 ? '#FBBC04' : '#EA4335';
  const dscrLabel =
    result.dscr >= 1.5 ? 'COMFORTABLE CUSHION' :
    result.dscr >= 1.25 ? 'CLEARS WITH MARGIN' :
    result.dscr >= 1.20 ? 'TIGHT — NEGOTIATE TERMS' :
    'BELOW COVENANT';

  const debtType = debtTypeFor(purchasePrice);

  return (
    <div className={`rounded-2xl p-8 ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
      <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
        <p className="text-[#D44A78] font-bold uppercase tracking-widest text-xs">Acquisition capital calculator</p>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${dark ? 'text-[#dadadc]/55' : 'text-[#7c7d80]'}`}>
          {debtType}
        </span>
      </div>

      <Slider
        value={ebitdaIdx}
        min={0}
        max={EBITDA_STOPS.length - 1}
        step={1}
        onChange={setEbitdaIdx}
        label="Annual EBITDA"
        displayValue={fmtBig(ebitda)}
        dark={dark}
      />
      <Slider
        value={multiple}
        min={3}
        max={18}
        step={0.5}
        onChange={setMultiple}
        label="Multiple"
        displayValue={`${multiple}×`}
        dark={dark}
      />
      <Slider
        value={downPct}
        min={5}
        max={50}
        step={1}
        onChange={setDownPct}
        label="Equity / Down"
        displayValue={`${downPct}%`}
        dark={dark}
      />
      <Slider
        value={rate}
        min={5}
        max={15}
        step={0.25}
        onChange={setRate}
        label="Blended debt rate"
        displayValue={`${rate}%`}
        dark={dark}
      />
      <Slider
        value={termYears}
        min={5}
        max={25}
        step={1}
        onChange={setTermYears}
        label="Loan term"
        displayValue={`${termYears} yrs`}
        dark={dark}
      />

      <div className={`mt-6 pt-6 ${dark ? 'border-t border-zinc-700' : 'border-t border-[#eeeef0]'}`}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <ResultCard label="Purchase price" value={fmtBig(purchasePrice)} dark={dark} />
          <ResultCard label="Equity required" value={fmtBig(equity)} dark={dark} />
          <ResultCard label="Annual debt svc" value={fmtBig(result.annualDebtService)} dark={dark} />
          <ResultCard
            label="Year-1 DSCR"
            value={result.dscr === Infinity ? '—' : `${result.dscr.toFixed(2)}×`}
            highlight
            dark={dark}
          />
        </div>

        <motion.div
          key={dscrLabel}
          initial={{ scale: 0.95, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-xl p-4 text-center mb-4"
          style={{ background: `${dscrColor}20`, border: `1px solid ${dscrColor}40` }}
        >
          <span className="material-symbols-outlined text-2xl mb-1 block" style={{ color: dscrColor }}>
            {result.dscr >= 1.25 ? 'check_circle' : 'warning'}
          </span>
          <p className="font-bold text-sm" style={{ color: dscrColor }}>{dscrLabel}</p>
          <p className={`text-xs mt-1 ${dark ? 'text-[#dadadc]/60' : 'text-[#5d5e61]'}`}>
            Senior covenant typical minimum: 1.20× · Your DSCR: {result.dscr === Infinity ? '—' : `${result.dscr.toFixed(2)}×`}
          </p>
        </motion.div>
      </div>

      <MagneticButton
        onClick={() => bridgeToYulia(
          `Modeling a ${fmtBig(purchasePrice)} acquisition: ${fmtBig(ebitda)} EBITDA at ${multiple}× multiple. ` +
          `With ${downPct}% equity (${fmtBig(equity)}) at ${rate}% blended rate, year-1 DSCR is ${result.dscr.toFixed(2)}×. ` +
          `Can you model the full capital stack — senior, unitranche, mezz, equity, rollover — and show me what closes?`
        )}
        className="w-full mt-2 px-6 py-3.5 bg-gradient-to-r from-[#D44A78] to-[#E8709A] text-white rounded-full font-bold text-sm hover:scale-[1.02] transition-all shadow-md border-none cursor-pointer"
      >
        Build the full capital stack with Yulia
      </MagneticButton>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   3. LANDING TAX CALC — /sell
   "Asset sale vs stock sale"
   ═══════════════════════════════════════════════ */

export function LandingTaxCalc({ dark }: { dark?: boolean }) {
  const [salePrice, setSalePrice] = useState(2400000);
  const [basis, setBasis] = useState(400000);
  const [stateRate, setStateRate] = useState(5);

  // Stock sale: all capital gains
  const stock = calculateStockSaleTax(salePrice, basis, stateRate / 100);

  // Asset sale simplified: assume 60% goodwill (cap gains), 25% equipment (ordinary), 15% inventory (ordinary)
  const goodwillGain = Math.max(0, salePrice * 0.6 - basis * 0.6);
  const equipGain = Math.max(0, salePrice * 0.25 - basis * 0.25);
  const invGain = Math.max(0, salePrice * 0.15 - basis * 0.15);
  const assetFederal = Math.round(goodwillGain * FEDERAL_RATES.effectiveCapGains + equipGain * FEDERAL_RATES.deprecRecapture + invGain * FEDERAL_RATES.ordinaryMax);
  const assetState = Math.round((goodwillGain + equipGain + invGain) * stateRate / 100);
  const assetNet = salePrice - assetFederal - assetState;

  const diff = stock.netProceeds - assetNet;
  const fmt = (n: number) => n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : `$${Math.round(n / 1_000).toLocaleString()}K`;

  return (
    <div className={`rounded-2xl p-8 ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
      <p className="text-[#D44A78] font-bold uppercase tracking-widest text-xs mb-6">Tax Impact: Asset Sale vs Stock Sale</p>

      <Slider value={salePrice} min={500000} max={10000000} step={50000}
        onChange={setSalePrice} label="Sale Price" displayValue={fmt(salePrice)} dark={dark} />
      <Slider value={basis} min={0} max={salePrice * 0.5} step={25000}
        onChange={setBasis} label="Your Cost Basis" displayValue={fmt(basis)} dark={dark} />
      <Slider value={stateRate} min={0} max={13} step={0.5}
        onChange={setStateRate} label="State Tax Rate" displayValue={`${stateRate}%`} dark={dark} />

      <div className={`mt-6 pt-6 ${dark ? 'border-t border-zinc-700' : 'border-t border-[#eeeef0]'}`}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className={`rounded-xl p-5 ${dark ? 'bg-[#1a1c1e] border border-zinc-700' : 'bg-[#f3f3f6] border border-[#eeeef0]'}`}>
            <p className={`text-[10px] uppercase tracking-widest font-bold mb-2 ${dark ? 'text-[#dadadc]/60' : 'text-[#5d5e61]'}`}>Stock Sale</p>
            <p className={`text-xs mb-1 ${dark ? 'text-[#dadadc]/60' : 'text-[#5d5e61]'}`}>Total Tax: {fmt(stock.federalTax + stock.stateTax)}</p>
            <p className={`text-2xl font-black tabular-nums ${dark ? 'text-[#f9f9fc]' : 'text-[#1a1c1e]'}`}>{fmt(stock.netProceeds)}</p>
            <p className={`text-[10px] ${dark ? 'text-[#dadadc]/50' : 'text-[#5d5e61]'}`}>net proceeds</p>
          </div>
          <div className={`rounded-xl p-5 ${dark ? 'bg-[#1a1c1e] border border-zinc-700' : 'bg-[#f3f3f6] border border-[#eeeef0]'}`}>
            <p className={`text-[10px] uppercase tracking-widest font-bold mb-2 ${dark ? 'text-[#dadadc]/60' : 'text-[#5d5e61]'}`}>Asset Sale</p>
            <p className={`text-xs mb-1 ${dark ? 'text-[#dadadc]/60' : 'text-[#5d5e61]'}`}>Total Tax: {fmt(assetFederal + assetState)}</p>
            <p className={`text-2xl font-black tabular-nums ${dark ? 'text-[#f9f9fc]' : 'text-[#1a1c1e]'}`}>{fmt(assetNet)}</p>
            <p className={`text-[10px] ${dark ? 'text-[#dadadc]/50' : 'text-[#5d5e61]'}`}>net proceeds</p>
          </div>
        </div>
        <div className={`rounded-xl p-4 text-center ${diff > 0 ? 'bg-[#34A853]/10 border border-[#34A853]/20' : 'bg-[#D44A78]/10 border border-[#D44A78]/20'}`}>
          <p className={`text-sm font-bold ${diff > 0 ? 'text-[#34A853]' : 'text-[#D44A78]'}`}>
            {diff > 0
              ? `Stock sale saves you ${fmt(Math.abs(diff))}`
              : `Asset sale saves you ${fmt(Math.abs(diff))}`
            }
          </p>
          <p className={`text-xs mt-1 ${dark ? 'text-[#dadadc]/60' : 'text-[#5d5e61]'}`}>
            Simplified estimate. Actual impact depends on purchase price allocation under IRC §1060.
          </p>
        </div>
      </div>

      <MagneticButton
        onClick={() => bridgeToYulia(
          `I'm considering selling my business for ${fmt(salePrice)} with a cost basis of ${fmt(basis)}. ` +
          `The calculator shows a ${fmt(Math.abs(diff))} difference between stock and asset sale structures. ` +
          `Can you model the full tax implications including goodwill amortization and state-specific considerations?`
        )}
        className="w-full mt-4 px-6 py-3.5 bg-gradient-to-r from-[#D44A78] to-[#E8709A] text-white rounded-full font-bold text-sm hover:scale-[1.02] transition-all shadow-md border-none cursor-pointer"
      >
        Model your exact tax impact with Yulia
      </MagneticButton>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   4. LANDING CAP TABLE CALC — /raise
   "Know your dilution"
   ═══════════════════════════════════════════════ */

export function LandingCapTableCalc({ dark }: { dark?: boolean }) {
  const [preMoney, setPreMoney] = useState(10000000);
  const [investment, setInvestment] = useState(2000000);
  const [liquidationPref, setLiquidationPref] = useState(1.0);

  const postMoney = preMoney + investment;
  const founderPct = preMoney / postMoney;
  const investorPct = investment / postMoney;

  // Exit waterfall: what founders get at different exit values with participating preferred
  const exits = [5_000_000, 20_000_000, 50_000_000].map(exitVal => {
    const prefReturn = investment * liquidationPref;
    if (exitVal <= prefReturn) {
      return { exit: exitVal, founderGets: 0, founderPctOfExit: 0 };
    }
    const remaining = exitVal - prefReturn;
    const founderGets = remaining * founderPct;
    return { exit: exitVal, founderGets, founderPctOfExit: founderGets / exitVal };
  });

  const fmt = (n: number) => n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${(n / 1_000).toFixed(0)}K`;

  return (
    <div className={`rounded-2xl p-8 ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
      <p className="text-[#D44A78] font-bold uppercase tracking-widest text-xs mb-6">Dilution Calculator</p>

      <Slider value={preMoney} min={1000000} max={50000000} step={500000}
        onChange={setPreMoney} label="Pre-Money Valuation" displayValue={fmt(preMoney)} dark={dark} />
      <Slider value={investment} min={100000} max={preMoney} step={100000}
        onChange={setInvestment} label="Investment Amount" displayValue={fmt(investment)} dark={dark} />
      <Slider value={liquidationPref} min={1.0} max={3.0} step={0.5}
        onChange={setLiquidationPref} label="Liquidation Preference" displayValue={`${liquidationPref}x`} dark={dark} />

      <div className={`mt-6 pt-6 ${dark ? 'border-t border-zinc-700' : 'border-t border-[#eeeef0]'}`}>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <ResultCard label="Your Ownership" value={`${(founderPct * 100).toFixed(1)}%`} highlight dark={dark} />
          <ResultCard label="Investor" value={`${(investorPct * 100).toFixed(1)}%`} dark={dark} />
          <ResultCard label="Post-Money" value={fmt(postMoney)} dark={dark} />
        </div>

        <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${dark ? 'text-[#dadadc]/60' : 'text-[#5d5e61]'}`}>
          What you actually receive at exit (after {liquidationPref}x participating preferred)
        </p>
        <div className="space-y-2 mb-4">
          {exits.map(e => (
            <div key={e.exit} className={`flex justify-between items-center py-2 px-3 rounded-lg text-sm ${dark ? 'bg-[#1a1c1e]' : 'bg-[#f3f3f6]'}`}>
              <span className={dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}>{fmt(e.exit)} exit</span>
              <span>
                <span className={`font-bold ${dark ? 'text-[#f9f9fc]' : 'text-[#1a1c1e]'}`}>{fmt(e.founderGets)}</span>
                <span className={`text-xs ml-2 ${dark ? 'text-[#dadadc]/50' : 'text-[#5d5e61]'}`}>
                  ({(e.founderPctOfExit * 100).toFixed(0)}% — not {(founderPct * 100).toFixed(0)}%)
                </span>
              </span>
            </div>
          ))}
        </div>
        <p className={`text-xs ${dark ? 'text-[#dadadc]/60' : 'text-[#5d5e61]'}`}>
          {(founderPct * 100).toFixed(0)}% ownership doesn't mean {(founderPct * 100).toFixed(0)}% of proceeds. Preferences eat your upside at lower exits.
        </p>
      </div>

      <MagneticButton
        onClick={() => bridgeToYulia(
          `I'm raising ${fmt(investment)} at a ${fmt(preMoney)} pre-money valuation with ${liquidationPref}x participating preferred. ` +
          `The calculator shows I'd only get ${(exits[0].founderPctOfExit * 100).toFixed(0)}% at a ${fmt(exits[0].exit)} exit despite owning ${(founderPct * 100).toFixed(0)}%. ` +
          `Can you model the full cap table with multiple rounds and show me what different term structures would actually cost me?`
        )}
        className="w-full mt-4 px-6 py-3.5 bg-gradient-to-r from-[#D44A78] to-[#E8709A] text-white rounded-full font-bold text-sm hover:scale-[1.02] transition-all shadow-md border-none cursor-pointer"
      >
        Model your full cap table with Yulia
      </MagneticButton>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   5. ADVISOR ROI CALC — /advisors
   ═══════════════════════════════════════════════ */

export function AdvisorROICalc({ dark }: { dark?: boolean }) {
  const [dealsPerYear, setDealsPerYear] = useState(5);
  const [avgCommission, setAvgCommission] = useState(40000);

  const currentRevenue = dealsPerYear * avgCommission;
  const withYulia = Math.round(dealsPerYear * 3.5) * avgCommission; // 3-4x leverage
  const gain = withYulia - currentRevenue;
  const cost = 149 * 12; // annual Professional cost

  const fmt = (n: number) => n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${(n / 1_000).toFixed(0)}K`;

  return (
    <div className={`rounded-2xl p-8 ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
      <p className="text-[#D44A78] font-bold uppercase tracking-widest text-xs mb-6">Practice Revenue Calculator</p>

      <Slider value={dealsPerYear} min={1} max={15} step={1}
        onChange={setDealsPerYear} label="Deals Closed Per Year" displayValue={`${dealsPerYear}`} dark={dark} />
      <Slider value={avgCommission} min={10000} max={150000} step={5000}
        onChange={setAvgCommission} label="Average Commission" displayValue={fmt(avgCommission)} dark={dark} />

      <div className={`mt-6 pt-6 ${dark ? 'border-t border-zinc-700' : 'border-t border-[#eeeef0]'}`}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className={`rounded-xl p-5 ${dark ? 'bg-[#1a1c1e] border border-zinc-700' : 'bg-[#f3f3f6] border border-[#eeeef0]'}`}>
            <p className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${dark ? 'text-[#dadadc]/60' : 'text-[#5d5e61]'}`}>Current Revenue</p>
            <p className={`text-2xl font-black tabular-nums ${dark ? 'text-[#dadadc]/60' : 'text-[#5d5e61]'}`}>{fmt(currentRevenue)}</p>
            <p className={`text-xs ${dark ? 'text-[#dadadc]/50' : 'text-[#5d5e61]'}`}>{dealsPerYear} deals/year</p>
          </div>
          <div className="rounded-xl p-5 bg-[#D44A78]/10 border border-[#D44A78]/20">
            <p className="text-[10px] uppercase tracking-widest font-bold mb-1 text-[#D44A78]">With Yulia</p>
            <p className="text-2xl font-black tabular-nums text-[#D44A78]">{fmt(withYulia)}</p>
            <p className={`text-xs ${dark ? 'text-[#dadadc]/50' : 'text-[#5d5e61]'}`}>{Math.round(dealsPerYear * 3.5)} deals/year</p>
          </div>
        </div>
        <div className={`rounded-xl p-4 text-center bg-[#34A853]/10 border border-[#34A853]/20`}>
          <p className="text-sm font-bold text-[#34A853]">+{fmt(gain)} annual revenue at {fmt(cost)}/year cost</p>
          <p className={`text-xs mt-1 ${dark ? 'text-[#dadadc]/60' : 'text-[#5d5e61]'}`}>{Math.round(gain / cost)}x ROI on your subscription</p>
        </div>
      </div>

      <MagneticButton
        onClick={() => bridgeToYulia(
          `I'm an advisor closing ${dealsPerYear} deals per year at ${fmt(avgCommission)} average commission. ` +
          `I'd like to try the Professional plan and see how Yulia can help me scale my practice.`
        )}
        className="w-full mt-4 px-6 py-3.5 bg-gradient-to-r from-[#D44A78] to-[#E8709A] text-white rounded-full font-bold text-sm hover:scale-[1.02] transition-all shadow-md border-none cursor-pointer"
      >
        Start your free 30-day trial
      </MagneticButton>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   6. COST SAVINGS CALC — /pricing
   ═══════════════════════════════════════════════ */

export function CostSavingsCalc({ dark }: { dark?: boolean }) {
  const [dealSize, setDealSize] = useState(2000000);

  // Traditional IB: Modified Lehman scale + $15K retainer
  const ibRetainer = 15_000;
  const ibSuccess = dealSize <= 1_000_000 ? dealSize * 0.10
    : dealSize <= 2_000_000 ? 100_000 + (dealSize - 1_000_000) * 0.08
    : dealSize <= 5_000_000 ? 180_000 + (dealSize - 2_000_000) * 0.06
    : 360_000 + (dealSize - 5_000_000) * 0.04;
  const ibTotal = ibRetainer + ibSuccess;

  // M&A Advisory / Boutique underwriting: similar Lehman but smaller retainer
  const advisoryRetainer = 10_000;
  const advisorySuccess = dealSize <= 1_000_000 ? dealSize * 0.08
    : dealSize <= 3_000_000 ? 80_000 + (dealSize - 1_000_000) * 0.06
    : 200_000 + (dealSize - 3_000_000) * 0.04;
  const advisoryTotal = advisoryRetainer + advisorySuccess;

  // smbx: $149/mo × 12 months avg deal
  const smbxTotal = 149 * 12;
  const savings = ibTotal - smbxTotal;

  const fmt = (n: number) => n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${(n / 1_000).toFixed(0)}K`;

  return (
    <div className={`rounded-2xl p-8 ${dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]'}`}>
      <p className="text-[#D44A78] font-bold uppercase tracking-widest text-xs mb-6">Advisory Cost Comparison</p>

      <Slider value={dealSize} min={500000} max={10000000} step={100000}
        onChange={setDealSize} label="Deal Size" displayValue={fmt(dealSize)} dark={dark} />

      <div className={`mt-6 pt-6 ${dark ? 'border-t border-zinc-700' : 'border-t border-[#eeeef0]'}`}>
        <div className="space-y-3 mb-4">
          <div className={`flex justify-between items-center p-4 rounded-xl ${dark ? 'bg-[#1a1c1e]' : 'bg-[#f3f3f6]'}`}>
            <div>
              <span className={`text-sm block ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>Investment Bank</span>
              <span className={`text-[10px] ${dark ? 'text-[#dadadc]/40' : 'text-[#5d5e61]/50'}`}>Modified Lehman + retainer</span>
            </div>
            <span className={`font-bold text-lg tabular-nums line-through ${dark ? 'text-[#dadadc]/40' : 'text-[#5d5e61]/40'}`}>{fmt(ibTotal)}</span>
          </div>
          <div className={`flex justify-between items-center p-4 rounded-xl ${dark ? 'bg-[#1a1c1e]' : 'bg-[#f3f3f6]'}`}>
            <div>
              <span className={`text-sm block ${dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]'}`}>M&A Advisory Firm</span>
              <span className={`text-[10px] ${dark ? 'text-[#dadadc]/40' : 'text-[#5d5e61]/50'}`}>Boutique Lehman + retainer</span>
            </div>
            <span className={`font-bold text-lg tabular-nums line-through ${dark ? 'text-[#dadadc]/40' : 'text-[#5d5e61]/40'}`}>{fmt(advisoryTotal)}</span>
          </div>
          <div className="flex justify-between items-center p-4 rounded-xl bg-[#D44A78]/10 border border-[#D44A78]/20">
            <span className="text-sm font-bold text-[#D44A78]">smbx.ai Professional</span>
            <span className="font-black text-lg tabular-nums text-[#D44A78]">${smbxTotal.toLocaleString()}/yr</span>
          </div>
        </div>
        <div className="rounded-xl p-4 text-center bg-[#34A853]/10 border border-[#34A853]/20">
          <p className="text-sm font-bold text-[#34A853]">Save {fmt(savings)} vs investment bank fees</p>
          <p className={`text-xs mt-1 ${dark ? 'text-[#dadadc]/60' : 'text-[#5d5e61]'}`}>
            Same analytical coverage. You handle the relationships. Yulia prepares everything.
          </p>
        </div>
      </div>

      <MagneticButton
        onClick={() => bridgeToYulia(`I'd like to start with a free analysis of my deal. The deal size is approximately ${fmt(dealSize)}.`)}
        className="w-full mt-4 px-6 py-3.5 bg-gradient-to-r from-[#D44A78] to-[#E8709A] text-white rounded-full font-bold text-sm hover:scale-[1.02] transition-all shadow-md border-none cursor-pointer"
      >
        Start your free analysis
      </MagneticButton>
    </div>
  );
}
