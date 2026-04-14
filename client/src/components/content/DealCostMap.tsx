/**
 * DealCostMap.tsx
 * Pricing page hero interactive.
 * Slider: deal enterprise value, $5M to $2B.
 * Live read-out (3 ways to pay for the same analytical work):
 *   1. Hire an investment bank (Lehman scale + retainer)
 *   2. Build an in-house analyst team (VP + 2 associates + 2 analysts, loaded)
 *   3. Run Yulia (flat software subscription)
 *
 * The spread is the headline.
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

/* ────────────────────────────────────────────────────────────
   IB fee — piecewise function reflecting 2024-2025 market norms.
   Sources: Lehman scale for sub-$50M, Capstone Partners + Axial
   median fee surveys for mid-market, GS/Lazard public M&A advisory
   disclosures for $1B+.
   ──────────────────────────────────────────────────────────── */
function ibFee(evMillions: number): number {
  // Returns fee in $M
  if (evMillions <= 50) {
    // SMB / lower mid-market: Lehman scale + small retainer
    let fee = 0;
    fee += Math.min(1, evMillions) * 0.08;
    fee += Math.max(0, Math.min(1, evMillions - 1)) * 0.06;
    fee += Math.max(0, Math.min(1, evMillions - 2)) * 0.04;
    fee += Math.max(0, Math.min(1, evMillions - 3)) * 0.02;
    fee += Math.max(0, evMillions - 4) * 0.01;
    return fee + 0.05; // $50K retainer
  } else if (evMillions <= 250) {
    // Lower mid-market boutique: 1.75% + $250K retainer
    return evMillions * 0.0175 + 0.25;
  } else if (evMillions <= 1000) {
    // Mid-market IB: 1.1% + $750K retainer
    return evMillions * 0.011 + 0.75;
  } else {
    // Bulge-bracket / large mid-market: 0.7% + $1.5M retainer
    return evMillions * 0.007 + 1.5;
  }
}

/* In-house analyst team — annual loaded cost */
const ANALYST_TEAM_ANNUAL = 1.7; // $M

/* Yulia tiers — annual cost (post-Sprint 14B-7 pricing) */
const YULIA_MULTI_ANNUAL = 0.002388;      // $2,388 — Multi-deal $199/mo × 12
const YULIA_FIRM_ANNUAL = 0.023988;       // $23,988 — Firm $1,999/mo × 12

/** Stops for the slider — discrete deal sizes that ladder cleanly */
const STOPS = [5, 10, 25, 50, 100, 200, 350, 500, 750, 1000, 1500, 2000];

function tierLabelFor(ev: number): string {
  if (ev <= 25) return 'Lower middle market';
  if (ev <= 100) return 'Lower middle market';
  if (ev <= 250) return 'Core middle market';
  if (ev <= 1000) return 'Upper middle market';
  return 'Large cap';
}

function fmtMoney(m: number): string {
  if (m >= 1) return `$${m.toFixed(2).replace(/\.00$/, '')}M`;
  if (m >= 0.001) return `$${(m * 1000).toFixed(0)}K`;
  return `$${Math.round(m * 1_000_000).toLocaleString()}`;
}

export function DealCostMap({ dark }: { dark: boolean }) {
  const [stopIndex, setStopIndex] = useState(4); // default $100M

  const ev = STOPS[stopIndex];
  const ib = ibFee(ev);
  const analystTeam = ANALYST_TEAM_ANNUAL;
  const yuliaMulti = YULIA_MULTI_ANNUAL;
  const yuliaFirm = YULIA_FIRM_ANNUAL;

  // Spread = IB fee / Yulia Multi-deal annual
  const spreadVsIB = useMemo(() => Math.round(ib / yuliaMulti), [ib, yuliaMulti]);
  const spreadVsAnalyst = useMemo(() => Math.round(analystTeam / yuliaMulti), [analystTeam, yuliaMulti]);

  // Colors
  const bg = dark ? '#0f1012' : '#f9f7f1';
  const innerBg = dark ? 'rgba(255,255,255,0.04)' : 'white';
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const headingColor = dark ? '#f9f9fc' : '#0f1012';
  const bodyColor = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
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
          Interactive · drag the deal size
        </p>
        <h3
          className="font-headline font-black text-2xl md:text-3xl tracking-tight"
          style={{ color: headingColor }}
        >
          Three ways to pay for the same work.
        </h3>
        <p className="text-sm mt-2" style={{ color: mutedColor }}>
          The math an IB analyst team runs is the same math Yulia runs. The cost isn't.
        </p>
      </div>

      {/* Slider */}
      <div className="mb-10">
        <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: mutedColor }}>
            Your deal · Enterprise Value
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: accent }}>
            {tierLabelFor(ev)}
          </span>
        </div>
        <div className="flex items-baseline justify-between mb-4">
          <span
            className="font-headline font-black tabular-nums tracking-tight"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: headingColor, lineHeight: 0.95 }}
          >
            ${ev >= 1000 ? `${(ev / 1000).toFixed(1)}B` : `${ev}M`}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={STOPS.length - 1}
          step={1}
          value={stopIndex}
          onChange={(e) => setStopIndex(Number(e.target.value))}
          className="w-full"
          style={{ accentColor: accent }}
        />
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mt-2" style={{ color: mutedColor }}>
          <span>$5M</span>
          <span>$100M</span>
          <span>$500M</span>
          <span>$2B</span>
        </div>
      </div>

      {/* The three columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Hire an IB */}
        <div
          className="rounded-xl p-6 relative overflow-hidden"
          style={{ background: innerBg, border: `1px solid ${border}` }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-2" style={{ color: mutedColor }}>
            01 · Hire an investment bank
          </p>
          <motion.p
            key={ib}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="font-headline font-black tabular-nums tracking-tight mb-2"
            style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', color: headingColor, lineHeight: 0.95 }}
          >
            {fmtMoney(ib)}
          </motion.p>
          <p className="text-[11px] mb-3" style={{ color: mutedColor }}>
            One-time success fee + retainer
          </p>
          <p className="text-[12px] leading-relaxed" style={{ color: bodyColor }}>
            {ev <= 50
              ? 'Lehman scale (8/6/4/2/1%) plus a ~$50K retainer. SMB broker territory.'
              : ev <= 250
              ? '1.75% of EV plus a $250K retainer. Lower mid-market boutique standard.'
              : ev <= 1000
              ? '1.10% of EV plus a $750K retainer. Mid-market IB fee.'
              : '0.70% of EV plus a $1.5M retainer. Bulge-bracket pricing.'}
          </p>
        </div>

        {/* In-house analyst team */}
        <div
          className="rounded-xl p-6"
          style={{ background: innerBg, border: `1px solid ${border}` }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-2" style={{ color: mutedColor }}>
            02 · Hire an analyst team
          </p>
          <p
            className="font-headline font-black tabular-nums tracking-tight mb-2"
            style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', color: headingColor, lineHeight: 0.95 }}
          >
            $1.7M
          </p>
          <p className="text-[11px] mb-3" style={{ color: mutedColor }}>
            Per year · loaded
          </p>
          <p className="text-[12px] leading-relaxed" style={{ color: bodyColor }}>
            One VP, two associates, two analysts. Cash comp $1.2M; benefits, software, real estate, recruiting bring it to ~$1.7M loaded.
          </p>
        </div>

        {/* Yulia */}
        <div
          className="rounded-xl p-6 relative overflow-hidden"
          style={{
            background: accent,
            color: 'white',
          }}
        >
          {/* Subtle gleam */}
          <div
            aria-hidden
            className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.18), transparent 60%)' }}
          />
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-2 opacity-90 relative">
            03 · Run Yulia
          </p>
          <p
            className="font-headline font-black tabular-nums tracking-tight mb-2 relative"
            style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', lineHeight: 0.95 }}
          >
            $2,388
          </p>
          <p className="text-[11px] mb-3 opacity-80 relative">
            Per year · Multi-deal · flat
          </p>
          <p className="text-[12px] leading-relaxed opacity-90 relative">
            $199/month, regardless of deal size. Or $1,999/month for the whole firm on the Firm plan — $23,988/yr loaded, unlimited seats and SSO.
          </p>
        </div>
      </div>

      {/* The spread */}
      <div
        className="rounded-xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        style={{
          background: dark ? 'rgba(255,255,255,0.04)' : 'white',
          border: `1px solid ${border}`,
        }}
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-2" style={{ color: mutedColor }}>
            Spread vs IB fee
          </p>
          <motion.p
            key={spreadVsIB}
            initial={{ opacity: 0.4, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="font-headline font-black tabular-nums tracking-tight"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: accent, lineHeight: 0.95 }}
          >
            {spreadVsIB.toLocaleString()}×
          </motion.p>
          <p className="text-sm mt-2" style={{ color: bodyColor }}>
            For every dollar Yulia costs this year, the IB on this deal charges <strong>{spreadVsIB.toLocaleString()}</strong> at close.
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-2" style={{ color: mutedColor }}>
            Spread vs in-house analyst team
          </p>
          <p
            className="font-headline font-black tabular-nums tracking-tight"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: accent, lineHeight: 0.95 }}
          >
            {spreadVsAnalyst.toLocaleString()}×
          </p>
          <p className="text-sm mt-2" style={{ color: bodyColor }}>
            A five-person analyst pod runs <strong>{spreadVsAnalyst.toLocaleString()}×</strong> Yulia's annual cost. Yulia runs the same analysis deterministically, in seconds, no headcount.
          </p>
        </div>
      </div>

      <p className="text-xs mt-6 leading-relaxed" style={{ color: mutedColor }}>
        Yulia is a flat-rate software subscription. She is not a broker-dealer, does not earn success fees, and is not your fiduciary.
        For the relationships, the closing-table seat, and the regulated work, you still want your bankers, brokers, lawyers, and CPAs.
        Yulia gives them — and you — a 1,000× faster analytical engine.
      </p>
    </div>
  );
}
