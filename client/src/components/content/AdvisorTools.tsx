/**
 * AdvisorTools.tsx
 * Two interactive tools for the Advisors journey page.
 *
 * CapacitySlider — drag deals managed from 6 → 22, watch revenue,
 * partner hours, margin, and capacity utilization update.
 *
 * SynergyBuilder — model cost takeout / cross-sell / WC release
 * for a hypothetical buyer's acquisition; show EBITDA lift,
 * valuation lift at the close multiple, and the corresponding
 * sell-side fee uplift.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

/* ────────────────────────────────────────────────────────────
   CapacitySlider
   ──────────────────────────────────────────────────────────── */
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function CapacitySlider({ dark }: { dark: boolean }) {
  const [deals, setDeals] = useState(8);

  // t goes from 0 (6 deals) to 1 (22 deals)
  const t = Math.max(0, Math.min(1, (deals - 6) / 16));

  const closeRate = lerp(0.50, 0.60, t);            // 50% → 60%
  const avgFee = lerp(1_200_000, 1_250_000, t);     // $1.2M → $1.25M
  const hoursPerDeal = lerp(70, 8, t);              // 70 → 8 partner hours per CIM
  const marginPct = lerp(0.60, 0.78, t);            // 60% → 78%

  const annualRevenue = deals * closeRate * avgFee;
  const annualMargin = annualRevenue * marginPct;
  const totalPartnerHours = deals * hoursPerDeal * 0.7;  // 0.7x because not every screened deal becomes a CIM
  const partnersOnTeam = 4;
  const hoursPerPartner = totalPartnerHours / partnersOnTeam;
  const utilizationPct = Math.min(1, hoursPerPartner / 1800); // 1800 = 36 hrs/wk × 50 wks

  // Colors
  const bg = dark ? '#0f1012' : '#f9f7f1';
  const innerBg = dark ? 'rgba(255,255,255,0.04)' : 'white';
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const headingColor = dark ? '#f9f9fc' : '#0f1012';
  const mutedColor = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const accent = dark ? PINK_DARK : PINK;

  const fmt$M = (v: number) => `$${(v / 1_000_000).toFixed(1)}M`;

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
          Interactive · drag the deal count
        </p>
        <h3
          className="font-headline font-black text-2xl md:text-3xl tracking-tight"
          style={{ color: headingColor }}
        >
          What does {deals} active mandates look like?
        </h3>
        <p className="text-sm mt-2" style={{ color: mutedColor }}>
          4-partner advisory · average mandate $80M-$300M EV · sell-side
        </p>
      </div>

      {/* Slider */}
      <div className="mb-10">
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: mutedColor }}>
            Active mandates
          </span>
          <span
            className="font-headline font-black tabular-nums"
            style={{ fontSize: '2.5rem', color: accent, lineHeight: 1 }}
          >
            {deals}
          </span>
        </div>
        <input
          type="range"
          min={6}
          max={22}
          step={1}
          value={deals}
          onChange={(e) => setDeals(Number(e.target.value))}
          className="w-full"
          style={{ accentColor: accent }}
        />
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mt-2" style={{ color: mutedColor }}>
          <span>6 (pre-Yulia)</span>
          <span>22 (post-Yulia)</span>
        </div>
      </div>

      {/* Read-out grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          className="rounded-xl p-5"
          style={{ background: innerBg, border: `1px solid ${border}` }}
        >
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: mutedColor }}>
            Annual revenue
          </p>
          <motion.p
            key={annualRevenue}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="font-headline font-black tabular-nums tracking-tight"
            style={{ fontSize: '2rem', color: headingColor, lineHeight: 1 }}
          >
            {fmt$M(annualRevenue)}
          </motion.p>
          <p className="text-[11px] mt-1" style={{ color: mutedColor }}>
            {(closeRate * 100).toFixed(0)}% close × {fmt$M(avgFee)} avg
          </p>
        </div>

        <div
          className="rounded-xl p-5"
          style={{ background: innerBg, border: `1px solid ${border}` }}
        >
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: mutedColor }}>
            Margin $
          </p>
          <p
            className="font-headline font-black tabular-nums tracking-tight"
            style={{ fontSize: '2rem', color: headingColor, lineHeight: 1 }}
          >
            {fmt$M(annualMargin)}
          </p>
          <p className="text-[11px] mt-1" style={{ color: mutedColor }}>
            {(marginPct * 100).toFixed(0)}% margin
          </p>
        </div>

        <div
          className="rounded-xl p-5"
          style={{ background: innerBg, border: `1px solid ${border}` }}
        >
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: mutedColor }}>
            Hrs/CIM (partner)
          </p>
          <p
            className="font-headline font-black tabular-nums tracking-tight"
            style={{ fontSize: '2rem', color: headingColor, lineHeight: 1 }}
          >
            {hoursPerDeal.toFixed(0)}
          </p>
          <p className="text-[11px] mt-1" style={{ color: mutedColor }}>
            Yulia drafts; partner reviews
          </p>
        </div>

        <div
          className="rounded-xl p-5"
          style={{ background: accent, color: 'white' }}
        >
          <p className="text-[10px] uppercase tracking-wider opacity-80 mb-1">
            Partner utilization
          </p>
          <p
            className="font-headline font-black tabular-nums tracking-tight"
            style={{ fontSize: '2rem', lineHeight: 1 }}
          >
            {(utilizationPct * 100).toFixed(0)}%
          </p>
          <p className="text-[11px] mt-1 opacity-80">
            {hoursPerPartner.toFixed(0)} hrs/yr each
          </p>
        </div>
      </div>

      <p className="text-xs mt-6" style={{ color: mutedColor }}>
        Math anchored to a real 4-partner sell-side practice. Pre-Yulia: 8 mandates, 50% close, 60% margin. Post-Yulia: 22, 60%, 78%.
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   SynergyBuilder
   ──────────────────────────────────────────────────────────── */
export function SynergyBuilder({ dark }: { dark: boolean }) {
  const [costTakeout, setCostTakeout] = useState(8);   // % of opex
  const [crossSell, setCrossSell] = useState(6);       // % of revenue
  const [wcRelease, setWcRelease] = useState(4);       // % of revenue

  // Hypothetical target deal: $20M EBITDA, $120M revenue, $80M opex, 8.5x close
  const targetEbitda = 20;            // $M
  const targetRevenue = 120;          // $M
  const targetOpex = 80;              // $M
  const closeMultiple = 8.5;          // ×

  const costTakeoutEbitda = (costTakeout / 100) * targetOpex;       // $M
  const crossSellEbitda = (crossSell / 100) * targetRevenue * 0.30; // assume 30% incremental margin
  const wcReleaseCash = (wcRelease / 100) * targetRevenue;          // $M one-time cash, not EBITDA

  const totalIncrementalEbitda = costTakeoutEbitda + crossSellEbitda;
  const valuationLift = totalIncrementalEbitda * closeMultiple;
  const newDealValue = (targetEbitda + totalIncrementalEbitda) * closeMultiple;

  // Sell-side fee math: typical Lehman scale ~1.5% on deals this size
  const baseFeeRate = 0.015;
  const baseFee = targetEbitda * closeMultiple * baseFeeRate;
  const newFee = newDealValue * baseFeeRate;
  const feeLift = newFee - baseFee;

  // Colors
  const bg = dark ? '#0f1012' : '#f9f7f1';
  const innerBg = dark ? 'rgba(255,255,255,0.04)' : 'white';
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const headingColor = dark ? '#f9f9fc' : '#0f1012';
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
          Interactive · model the synergy
        </p>
        <h3
          className="font-headline font-black text-2xl md:text-3xl tracking-tight"
          style={{ color: headingColor }}
        >
          Show the buyer what they'll capture.
        </h3>
        <p className="text-sm mt-2" style={{ color: mutedColor }}>
          ${targetRevenue}M revenue · ${targetEbitda}M EBITDA · {closeMultiple}× close target · sell-side mandate
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders — 6 cols */}
        <div className="lg:col-span-6 space-y-6">
          {/* Cost takeout */}
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-[12px] font-bold" style={{ color: headingColor }}>
                Cost takeout
              </span>
              <span className="text-[12px] font-mono font-bold" style={{ color: accent }}>
                {costTakeout}% of opex
              </span>
            </div>
            <input
              type="range" min={0} max={20} step={1}
              value={costTakeout}
              onChange={(e) => setCostTakeout(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: accent }}
            />
            <p className="text-[11px] mt-1" style={{ color: mutedColor }}>
              Shared services, eliminated overlap, vendor consolidation
            </p>
          </div>

          {/* Cross-sell */}
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-[12px] font-bold" style={{ color: headingColor }}>
                Revenue cross-sell
              </span>
              <span className="text-[12px] font-mono font-bold" style={{ color: accent }}>
                {crossSell}% revenue lift
              </span>
            </div>
            <input
              type="range" min={0} max={20} step={1}
              value={crossSell}
              onChange={(e) => setCrossSell(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: accent }}
            />
            <p className="text-[11px] mt-1" style={{ color: mutedColor }}>
              Buyer's existing book × target's product set (30% incremental margin)
            </p>
          </div>

          {/* WC release */}
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-[12px] font-bold" style={{ color: headingColor }}>
                Working capital release
              </span>
              <span className="text-[12px] font-mono font-bold" style={{ color: accent }}>
                {wcRelease}% of revenue
              </span>
            </div>
            <input
              type="range" min={0} max={15} step={1}
              value={wcRelease}
              onChange={(e) => setWcRelease(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: accent }}
            />
            <p className="text-[11px] mt-1" style={{ color: mutedColor }}>
              Faster collections, supplier terms, inventory rationalization
            </p>
          </div>
        </div>

        {/* Read-out — 6 cols */}
        <div className="lg:col-span-6 space-y-3">
          <div
            className="rounded-xl p-5"
            style={{ background: innerBg, border: `1px solid ${border}` }}
          >
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: mutedColor }}>
              Synergized EBITDA
            </p>
            <p
              className="font-headline font-black tabular-nums tracking-tight"
              style={{ fontSize: '2rem', color: headingColor, lineHeight: 1 }}
            >
              ${(targetEbitda + totalIncrementalEbitda).toFixed(1)}M
            </p>
            <p className="text-[11px] mt-1" style={{ color: mutedColor }}>
              ${targetEbitda}M base + ${totalIncrementalEbitda.toFixed(1)}M synergy
            </p>
          </div>

          <div
            className="rounded-xl p-5"
            style={{ background: innerBg, border: `1px solid ${border}` }}
          >
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: mutedColor }}>
              Buyer's underwritten valuation
            </p>
            <p
              className="font-headline font-black tabular-nums tracking-tight"
              style={{ fontSize: '2rem', color: headingColor, lineHeight: 1 }}
            >
              ${newDealValue.toFixed(0)}M
            </p>
            <p className="text-[11px] mt-1" style={{ color: mutedColor }}>
              +${valuationLift.toFixed(0)}M vs base (${(targetEbitda * closeMultiple).toFixed(0)}M)
              {wcReleaseCash > 0 && ` · +${wcReleaseCash.toFixed(0)}M WC unlock`}
            </p>
          </div>

          <div
            className="rounded-xl p-5"
            style={{ background: accent, color: 'white' }}
          >
            <p className="text-[10px] uppercase tracking-wider opacity-80 mb-1">
              Your sell-side fee uplift
            </p>
            <p
              className="font-headline font-black tabular-nums tracking-tight"
              style={{ fontSize: '2rem', lineHeight: 1 }}
            >
              +${(feeLift * 1000).toFixed(0)}K
            </p>
            <p className="text-[11px] mt-1 opacity-80">
              ${(baseFee * 1000).toFixed(0)}K base → ${(newFee * 1000).toFixed(0)}K fee at the higher mark
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs mt-6" style={{ color: mutedColor }}>
        Yulia bakes the synergy thesis into the CIM so the buyer underwrites the lift before they sign the LOI. Higher LOIs = higher fees.
      </p>
    </div>
  );
}
