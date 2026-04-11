/**
 * StackBuilder.tsx + AudiencePicker
 * Raise journey page interactives.
 *
 * AudiencePicker — top of page, two segments:
 *   - owner: owner-operator raising growth capital
 *   - sponsor: independent sponsor raising for an acquisition
 *
 * StackBuilder — drag layered capital structure
 *   - Senior debt, Unitranche, Mezz, Equity, Seller Rollover
 *   - Sliders rebalance to keep total at 100%
 *   - Live read-out: cost of capital, DSCR, founder retention at exit
 */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

/* ────────────────────────────────────────────────────────────
   AudiencePicker
   ──────────────────────────────────────────────────────────── */
export type Audience = 'owner' | 'sponsor';

export function AudiencePicker({
  value,
  onChange,
  dark,
}: {
  value: Audience;
  onChange: (a: Audience) => void;
  dark: boolean;
}) {
  const headingColor = dark ? '#f9f9fc' : '#0f1012';
  const mutedColor = dark ? 'rgba(218,218,220,0.65)' : '#7c7d80';
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const accent = dark ? PINK_DARK : PINK;

  const segments: { id: Audience; title: string; sub: string; example: string }[] = [
    {
      id: 'owner',
      title: 'I own the company',
      sub: 'Raising growth capital, recap, or a partial liquidity event.',
      example: '$5M-$50M EBITDA business · $25M-$200M raise',
    },
    {
      id: 'sponsor',
      title: "I'm raising for a deal",
      sub: 'Independent sponsor, deal team, or fundless GP raising the stack.',
      example: '$50M-$500M EV target · $30M-$150M equity check',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {segments.map((seg) => {
        const selected = value === seg.id;
        return (
          <button
            key={seg.id}
            onClick={() => onChange(seg.id)}
            className="text-left rounded-2xl p-7 transition-all relative overflow-hidden"
            style={{
              background: selected
                ? (dark ? '#1f1416' : '#fef0f4')
                : (dark ? '#0f1012' : 'white'),
              border: `2px solid ${selected ? accent : border}`,
              cursor: 'pointer',
            }}
          >
            {selected && (
              <motion.div
                layoutId="audience-marker"
                className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: accent }}
              >
                <span className="material-symbols-outlined text-white text-base">check</span>
              </motion.div>
            )}
            <p
              className="text-[10px] font-bold uppercase tracking-[0.22em] mb-2"
              style={{ color: accent }}
            >
              Path {seg.id === 'owner' ? 'A' : 'B'}
            </p>
            <h3
              className="font-headline font-black text-xl md:text-2xl tracking-tight mb-2"
              style={{ color: headingColor }}
            >
              {seg.title}
            </h3>
            <p className="text-sm leading-relaxed mb-3" style={{ color: mutedColor }}>
              {seg.sub}
            </p>
            <p className="text-[12px] font-mono" style={{ color: mutedColor }}>
              {seg.example}
            </p>
          </button>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   StackBuilder
   ──────────────────────────────────────────────────────────── */
type Layer = {
  key: string;
  label: string;
  rate: number;        // effective annual cost %
  rateLabel: string;
  cashCost: number;    // % paid in cash annually (for DSCR)
  color: string;
  description: string;
};

const LAYERS: Layer[] = [
  {
    key: 'senior',
    label: 'Senior debt',
    rate: 9.5,
    rateLabel: 'SOFR+450',
    cashCost: 9.5,
    color: '#1d4d8a',
    description: 'Bank or credit fund. Cheapest. Strong covenants. Personal guarantee for SBA.',
  },
  {
    key: 'unitranche',
    label: 'Unitranche',
    rate: 10.5,
    rateLabel: '10.5%',
    cashCost: 10.5,
    color: '#3a78c0',
    description: 'Single-tranche from a private credit fund. Higher leverage. Looser covenants.',
  },
  {
    key: 'mezz',
    label: 'Mezzanine',
    rate: 16,
    rateLabel: '13% + 3% PIK + warrants',
    cashCost: 13,
    color: '#7c4ad4',
    description: 'Subordinated debt with equity kicker. Fills the gap when senior taps out.',
  },
  {
    key: 'equity',
    label: 'Equity (sponsor + LPs)',
    rate: 0,
    rateLabel: 'no cash cost',
    cashCost: 0,
    color: '#d44a78',
    description: 'Sponsor + LP capital. No cash cost. Dilutes upside at exit.',
  },
  {
    key: 'rollover',
    label: 'Seller rollover',
    rate: 0,
    rateLabel: 'paid at exit',
    cashCost: 0,
    color: '#e89460',
    description: 'Seller keeps a minority equity stake. Aligns incentives through transition.',
  },
];

const DEFAULT_PCTS = {
  senior: 44,
  unitranche: 22,
  mezz: 14,
  equity: 14,
  rollover: 6,
};

export function StackBuilder({
  dark,
  audience = 'sponsor',
  ev = 180,           // $180M enterprise value
  ebitda = 20,        // $20M EBITDA
}: {
  dark: boolean;
  audience?: Audience;
  ev?: number;
  ebitda?: number;
}) {
  const [pcts, setPcts] = useState<Record<string, number>>(DEFAULT_PCTS);

  const updateLayer = useCallback((key: string, newPct: number) => {
    setPcts((prev) => {
      const clamped = Math.max(0, Math.min(80, newPct));
      const others = Object.keys(prev).filter((k) => k !== key);
      const otherTotal = others.reduce((s, k) => s + prev[k], 0);
      const remaining = 100 - clamped;
      // Rebalance others proportionally
      const next: Record<string, number> = { [key]: clamped };
      if (otherTotal > 0) {
        others.forEach((k) => {
          next[k] = Math.max(0, (prev[k] / otherTotal) * remaining);
        });
      } else {
        others.forEach((k) => {
          next[k] = remaining / others.length;
        });
      }
      return next;
    });
  }, []);

  // Compute metrics
  const totalCash = LAYERS.reduce((sum, l) => sum + (pcts[l.key] / 100) * ev * (l.cashCost / 100), 0);
  const totalCost = LAYERS.reduce((sum, l) => sum + (pcts[l.key] / 100) * ev * (l.rate / 100), 0);
  const wacc = (totalCost / ev) * 100;
  const dscr = ebitda / Math.max(totalCash, 0.01);
  const equityPct = pcts.equity + pcts.rollover;
  // Founder retention at exit (assumes seller rollover stays as founder %)
  const founderRetention = pcts.rollover / Math.max(equityPct, 0.01);
  const sponsorEquity = pcts.equity;
  const totalEquityDollars = (equityPct / 100) * ev;

  const dscrOK = dscr >= 1.20;
  const dscrTight = dscr >= 1.20 && dscr < 1.30;

  // Colors
  const bg = dark ? '#0f1012' : '#f9f7f1';
  const innerBg = dark ? 'rgba(255,255,255,0.04)' : 'white';
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const headingColor = dark ? '#f9f9fc' : '#0f1012';
  const bodyColor = dark ? 'rgba(218,218,220,0.78)' : '#3c3d40';
  const mutedColor = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const accent = dark ? PINK_DARK : PINK;

  return (
    <div
      className="rounded-2xl p-6 md:p-8"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      <div className="mb-6">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.22em] mb-2"
          style={{ color: accent }}
        >
          Interactive · drag the layers
        </p>
        <h3
          className="font-headline font-black text-2xl md:text-3xl tracking-tight"
          style={{ color: headingColor }}
        >
          Build the stack. Watch the math.
        </h3>
        <p className="text-sm mt-2" style={{ color: mutedColor }}>
          ${ev}M enterprise value · ${ebitda}M EBITDA · move any slider, the others rebalance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: stack visualization (4 cols) */}
        <div className="lg:col-span-4">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3"
            style={{ color: mutedColor }}
          >
            The stack
          </p>
          <div
            className="rounded-xl overflow-hidden flex flex-col h-[300px] md:h-[380px]"
            style={{ border: `1px solid ${border}` }}
          >
            {LAYERS.map((l) => {
              const pct = pcts[l.key];
              if (pct < 0.5) return null;
              return (
                <motion.div
                  key={l.key}
                  layout
                  className="relative flex flex-col justify-center px-4 text-white text-xs font-bold"
                  animate={{ flexBasis: `${pct}%` }}
                  transition={{ type: 'spring', stiffness: 200, damping: 28 }}
                  style={{
                    background: l.color,
                    minHeight: 24,
                    flexGrow: 0,
                    flexShrink: 0,
                  }}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px]">{l.label}</span>
                    <span className="font-mono text-[11px]">{pct.toFixed(0)}%</span>
                  </div>
                  <span className="text-[10px] opacity-80 font-normal mt-0.5">
                    ${(ev * pct / 100).toFixed(0)}M
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Middle: sliders (4 cols) */}
        <div className="lg:col-span-4">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3"
            style={{ color: mutedColor }}
          >
            Adjust
          </p>
          <div className="space-y-4">
            {LAYERS.map((l) => (
              <div key={l.key}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-[12px] font-bold flex items-center gap-1.5" style={{ color: headingColor }}>
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{ background: l.color }}
                    />
                    {l.label}
                  </span>
                  <span className="text-[10px] font-mono" style={{ color: mutedColor }}>
                    {l.rateLabel}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={80}
                  step={1}
                  value={Math.round(pcts[l.key])}
                  onChange={(e) => updateLayer(l.key, Number(e.target.value))}
                  className="w-full"
                  style={{
                    accentColor: l.color,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right: read-out (4 cols) */}
        <div className="lg:col-span-4">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3"
            style={{ color: mutedColor }}
          >
            Read-out
          </p>
          <div className="space-y-3">
            {/* WACC */}
            <div
              className="rounded-xl p-4"
              style={{ background: innerBg, border: `1px solid ${border}` }}
            >
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: mutedColor }}>
                Blended cost of capital
              </p>
              <p
                className="font-headline font-black tracking-tight tabular-nums"
                style={{ fontSize: '2rem', color: headingColor, lineHeight: 1 }}
              >
                {wacc.toFixed(1)}%
              </p>
              <p className="text-[11px] mt-1" style={{ color: mutedColor }}>
                ${(totalCost / 1).toFixed(1)}M annual cost
              </p>
            </div>

            {/* DSCR */}
            <div
              className="rounded-xl p-4"
              style={{
                background: innerBg,
                border: `1px solid ${dscrOK ? (dscrTight ? '#d4a44a' : '#1f9d54') : '#c44a4a'}`,
              }}
            >
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: mutedColor }}>
                Year-1 DSCR
              </p>
              <p
                className="font-headline font-black tracking-tight tabular-nums"
                style={{
                  fontSize: '2rem',
                  color: dscrOK ? (dscrTight ? '#d4a44a' : '#1f9d54') : '#c44a4a',
                  lineHeight: 1,
                }}
              >
                {dscr.toFixed(2)}×
              </p>
              <p className="text-[11px] mt-1" style={{ color: mutedColor }}>
                {dscrOK ? (dscrTight ? 'Clears with thin margin' : 'Comfortable cushion') : 'Below 1.20× — covenant trips'}
              </p>
            </div>

            {/* Audience-specific stat */}
            {audience === 'owner' ? (
              <div
                className="rounded-xl p-4"
                style={{ background: accent, color: 'white' }}
              >
                <p className="text-[10px] uppercase tracking-wider opacity-80 mb-1">
                  Founder retention
                </p>
                <p
                  className="font-headline font-black tracking-tight tabular-nums"
                  style={{ fontSize: '2rem', lineHeight: 1 }}
                >
                  {(founderRetention * 100).toFixed(0)}%
                </p>
                <p className="text-[11px] mt-1 opacity-80">
                  of post-close equity (rollover)
                </p>
              </div>
            ) : (
              <div
                className="rounded-xl p-4"
                style={{ background: accent, color: 'white' }}
              >
                <p className="text-[10px] uppercase tracking-wider opacity-80 mb-1">
                  Sponsor equity check
                </p>
                <p
                  className="font-headline font-black tracking-tight tabular-nums"
                  style={{ fontSize: '2rem', lineHeight: 1 }}
                >
                  ${(sponsorEquity / 100 * ev).toFixed(0)}M
                </p>
                <p className="text-[11px] mt-1 opacity-80">
                  ${(totalEquityDollars).toFixed(0)}M total equity layer
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs mt-6" style={{ color: mutedColor }}>
        Rates reflect 2024-2025 mid-market conditions. Yulia models the actual stack against your verified financials and live debt-fund quotes.
      </p>
    </div>
  );
}
