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

/* In-house analyst team — annual loaded cost scales with deal size.
   A $5M SMB broker runs one analyst; a $1B+ bulge-bracket coverage pod runs
   MD + 2 VPs + 4 associates + 4 analysts. Loaded comp incl. benefits, software,
   real estate, and recruiting. Numbers reflect 2024-2025 street comp surveys. */
function analystTeamAnnual(evMillions: number): { cost: number; shape: string } {
  if (evMillions <= 50) {
    // SMB broker + one analyst, or a solo banker with admin.
    return { cost: 0.4, shape: 'Solo banker + 1 analyst' };
  } else if (evMillions <= 250) {
    // Lower-mid boutique pod.
    return { cost: 1.1, shape: 'VP + 1 associate + 2 analysts' };
  } else if (evMillions <= 1000) {
    // Mid-market bench.
    return { cost: 1.7, shape: 'VP + 2 associates + 2 analysts' };
  } else {
    // Bulge-bracket coverage pod.
    return { cost: 4.2, shape: 'MD + 2 VPs + 4 associates + 4 analysts' };
  }
}

/* Yulia tiers — annual cost (post-Sprint 14B-7 pricing) */
const YULIA_MULTI_ANNUAL = 0.002388;      // $2,388 — Multi-deal $199/mo × 12
const YULIA_FIRM_ANNUAL = 0.023988;       // $23,988 — Firm $1,999/mo × 12
const YULIA_INST_ANNUAL = 0.083988;       // $83,988 — Institutional $6,999/mo × 12

/* Recommended Yulia tier for a given deal size — matches the tier Yulia would
   pick for an operator doing this size of deal. Flat across deal sizes; the
   tier shifts with who's running it, not with the deal's EV. We use the
   deal-size proxy here so the visual comparison is honest: solo operator at
   $10M stays on Multi-deal, a firm running $1B deals is on Firm or higher. */
function yuliaTierFor(evMillions: number): { label: string; annual: number; detail: string } {
  if (evMillions <= 250) {
    return { label: 'Multi-deal', annual: YULIA_MULTI_ANNUAL, detail: '$199/month · flat · unlimited deals' };
  } else if (evMillions <= 1000) {
    return { label: 'Firm', annual: YULIA_FIRM_ANNUAL, detail: '$1,999/month · unlimited seats + SSO' };
  } else {
    return { label: 'Institutional', annual: YULIA_INST_ANNUAL, detail: '$6,999/month · API + SLA + RBAC' };
  }
}

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
  const team = analystTeamAnnual(ev);
  const yulia = yuliaTierFor(ev);

  // Spread = IB fee / recommended Yulia tier annual cost for this deal size
  const spreadVsIB = useMemo(() => Math.round(ib / yulia.annual), [ib, yulia.annual]);
  const spreadVsAnalyst = useMemo(() => Math.round(team.cost / yulia.annual), [team.cost, yulia.annual]);

  // Colors — component is embedded inside an immersive SectionBand on
  // /pricing. Outer bg sits slightly raised off the immersive backdrop
  // (not identical to #0f1012 or we'd merge on dark mode; not cream or
  // we'd clash with the dark stage on light mode).
  const bg = dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)';
  const innerBg = dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.10)';
  const border = dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.14)';
  const headingColor = '#f9f9fc';                         // always light — inside immersive band
  const bodyColor = 'rgba(218,218,220,0.85)';
  const mutedColor = 'rgba(218,218,220,0.55)';
  const accent = dark ? PINK_DARK : PINK;

  return (
    <div
      className="rounded-2xl p-6 md:p-8"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      <div className="mb-6">
        <p
          className="text-[11px] font-semibold mb-2"
          style={{ color: accent, letterSpacing: '0.04em' }}
        >
          Drag to size your deal
        </p>
        <h3
          className="font-headline font-black text-2xl md:text-3xl tracking-tight"
          style={{ color: headingColor }}
        >
          Three ways to pay for the same work.
        </h3>
      </div>

      {/* Slider */}
      <div className="mb-10">
        <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
          <span className="text-[11px] font-semibold" style={{ color: mutedColor, letterSpacing: '0.04em' }}>
            Enterprise value
          </span>
          <span className="text-[11px] font-semibold" style={{ color: accent, letterSpacing: '0.04em' }}>
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
        <div className="flex justify-between text-[10px] font-semibold tabular-nums mt-2" style={{ color: mutedColor, letterSpacing: '0.02em' }}>
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
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-2" style={{ color: mutedColor }}>
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
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-2" style={{ color: mutedColor }}>
            02 · Hire an analyst team
          </p>
          <motion.p
            key={team.cost}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="font-headline font-black tabular-nums tracking-tight mb-2"
            style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', color: headingColor, lineHeight: 0.95 }}
          >
            {fmtMoney(team.cost)}
          </motion.p>
          <p className="text-[11px] mb-3" style={{ color: mutedColor }}>
            Per year · loaded
          </p>
          <motion.p
            key={team.shape}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-[12px] leading-relaxed"
            style={{ color: bodyColor }}
          >
            <strong style={{ color: headingColor }}>{team.shape}.</strong>{' '}
            Cash comp plus benefits, software, real estate, and recruiting. Scales with deal complexity.
          </motion.p>
        </div>

        {/* Yulia */}
        <div
          className="rounded-xl p-6 relative overflow-hidden"
          style={{ background: accent, color: 'white' }}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] opacity-90">
              03 · Run Yulia
            </p>
            <span
              className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.18)', color: 'white', letterSpacing: '0.06em' }}
            >
              Flat · any deal
            </span>
          </div>
          <motion.p
            key={yulia.annual}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="font-headline font-black tabular-nums tracking-tight mb-2"
            style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', lineHeight: 0.95 }}
          >
            {fmtMoney(yulia.annual)}
          </motion.p>
          <motion.p
            key={yulia.label}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-[11px] mb-3 opacity-90"
          >
            Per year · <strong>{yulia.label}</strong> tier
          </motion.p>
          <p className="text-[12px] leading-relaxed opacity-90">
            {yulia.detail}. Yulia picks the right tier for you in chat — this is what she’d pick at this deal size.
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
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-2" style={{ color: mutedColor }}>
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
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-2" style={{ color: mutedColor }}>
            Spread vs in-house team
          </p>
          <motion.p
            key={spreadVsAnalyst}
            initial={{ opacity: 0.4, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="font-headline font-black tabular-nums tracking-tight"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: accent, lineHeight: 0.95 }}
          >
            {spreadVsAnalyst.toLocaleString()}×
          </motion.p>
          <p className="text-sm mt-2" style={{ color: bodyColor }}>
            The analyst team at this deal size runs <strong>{spreadVsAnalyst.toLocaleString()}×</strong> Yulia's annual cost. Same analysis, no headcount.
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
