/**
 * MultipleMap.tsx
 * 2D interactive: click anywhere on the chart to position the pin.
 *   X = customer concentration (%)
 *   Y = 3-year revenue CAGR (%)
 * The pin's position picks an EBITDA multiple from the industry curve.
 * Industry selector determines the comp set and base multiple range.
 *
 * Industry multiples reflect 2024-2025 mid-market deal consensus ranges
 * for $5M-$100M EBITDA businesses. Sourced from public deal databases,
 * SBA 7(a) lending data, NAICS benchmarks, and aggregated investor reports.
 */

import { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

type Industry = {
  id: string;
  name: string;
  base: number;       // multiple at 15% concentration, 5% growth
  floor: number;
  ceiling: number;
};

const INDUSTRIES: Industry[] = [
  { id: 'tech-services', name: 'Tech-Enabled Services',  base: 11.0, floor: 9.0,  ceiling: 14.0 },
  { id: 'saas',          name: 'SaaS / Subscription',     base: 14.5, floor: 11.0, ceiling: 20.0 },
  { id: 'healthcare',    name: 'Healthcare Services',    base: 10.5, floor: 9.0,  ceiling: 13.0 },
  { id: 'insurance',     name: 'Insurance Brokerage',    base: 12.0, floor: 10.0, ceiling: 15.0 },
  { id: 'msp',           name: 'MSP / IT Services',      base: 10.0, floor: 8.0,  ceiling: 12.5 },
  { id: 'distribution',  name: 'Specialty Distribution', base: 7.8,  floor: 6.0,  ceiling: 9.5 },
  { id: 'hvac',          name: 'HVAC / Contractors',     base: 8.5,  floor: 7.0,  ceiling: 10.5 },
  { id: 'industrial',    name: 'Industrial Manufacturing', base: 7.5, floor: 6.0, ceiling: 9.5 },
];

/** compute multiple from concentration % and CAGR % for an industry */
function computeMultiple(industry: Industry, concentration: number, cagr: number): number {
  // Base
  let m = industry.base;

  // Concentration adjustment: every 5% above 15% = -0.25x, below = +0.18x
  const concDelta = concentration - 15;
  if (concDelta > 0) {
    m -= (concDelta / 5) * 0.25;
  } else {
    m += (Math.abs(concDelta) / 5) * 0.18;
  }

  // Growth adjustment: every 1% above 5% = +0.18x, below = -0.22x
  const growthDelta = cagr - 5;
  if (growthDelta > 0) {
    m += growthDelta * 0.18;
  } else {
    m += growthDelta * 0.22; // negative
  }

  // Clamp to floor / ceiling
  return Math.max(industry.floor, Math.min(industry.ceiling, m));
}

/** color band for multiple */
function bandFor(multiple: number, industry: Industry): { label: string; color: string } {
  const range = industry.ceiling - industry.floor;
  const pct = (multiple - industry.floor) / range;
  if (pct < 0.33) return { label: 'Bottom of range', color: '#c44a4a' };
  if (pct < 0.66) return { label: 'Middle of range', color: '#d4a44a' };
  return { label: 'Top of range', color: '#4ac478' };
}

export function MultipleMap({
  dark,
  ebitda = 18,           // default $18M EBITDA — changeable
}: {
  dark: boolean;
  ebitda?: number;
}) {
  const [industryId, setIndustryId] = useState<string>('distribution');
  const [pinPct, setPinPct] = useState({ x: 0.18, y: 0.55 }); // 18% concentration, ~5.5% CAGR

  const chartRef = useRef<HTMLDivElement>(null);

  const industry = INDUSTRIES.find((i) => i.id === industryId)!;

  // X axis: 5% to 50% concentration. Y axis: -5% to 25% CAGR (inverted in pixels)
  const concentration = 5 + pinPct.x * 45;
  const cagr = -5 + (1 - pinPct.y) * 30;

  const multiple = computeMultiple(industry, concentration, cagr);
  const valuationM = ebitda * multiple;
  const band = bandFor(multiple, industry);

  // For comp dots: compute a few sample positions across the chart for this industry
  const compDots = useMemo(() => {
    const dots: { x: number; y: number; opacity: number }[] = [];
    for (let i = 0; i < 18; i++) {
      const cx = 0.05 + Math.random() * 0.9;
      const cy = 0.1 + Math.random() * 0.8;
      // Comp dots cluster around the "good" zone (lower-left)
      const distFromGood = Math.sqrt(cx * cx + (1 - cy) * (1 - cy));
      const opacity = Math.max(0.18, 0.6 - distFromGood * 0.35);
      dots.push({ x: cx, y: cy, opacity });
    }
    return dots;
  }, [industryId]);

  const handleChartInteract = (clientX: number, clientY: number) => {
    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    setPinPct({ x, y });
  };

  // Colors
  const bg = dark ? '#0f1012' : '#f9f7f1';
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const headingColor = dark ? '#f9f9fc' : '#0f1012';
  const mutedColor = dark ? 'rgba(218,218,220,0.65)' : '#7c7d80';
  const gridColor = dark ? 'rgba(255,255,255,0.04)' : 'rgba(15,16,18,0.05)';
  const accent = dark ? PINK_DARK : PINK;

  return (
    <div
      className="rounded-2xl p-6 md:p-8"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-[0.22em] mb-2"
            style={{ color: accent }}
          >
            Interactive · click the chart to place the pin
          </p>
          <h3
            className="font-headline font-black text-2xl md:text-3xl tracking-tight"
            style={{ color: headingColor }}
          >
            Where does your business land?
          </h3>
        </div>

        {/* Industry selector */}
        <select
          value={industryId}
          onChange={(e) => setIndustryId(e.target.value)}
          className="rounded-lg px-4 py-2.5 text-sm font-bold cursor-pointer focus:outline-none"
          style={{
            background: dark ? 'rgba(255,255,255,0.06)' : 'white',
            color: headingColor,
            border: `1px solid ${border}`,
          }}
        >
          {INDUSTRIES.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart — 8 cols */}
        <div className="lg:col-span-8">
          <div className="relative" style={{ paddingTop: '70%' }}>
            <div
              ref={chartRef}
              className="absolute inset-0 rounded-xl cursor-crosshair select-none"
              style={{
                background: dark
                  ? 'linear-gradient(135deg, rgba(232,112,154,0.04), rgba(255,255,255,0.02))'
                  : 'linear-gradient(135deg, rgba(212,74,120,0.04), rgba(15,16,18,0.02))',
                border: `1px solid ${border}`,
              }}
              onClick={(e) => handleChartInteract(e.clientX, e.clientY)}
            >
              {/* Grid lines */}
              {[0.25, 0.5, 0.75].map((p) => (
                <div
                  key={`v${p}`}
                  className="absolute top-0 bottom-0 w-px"
                  style={{ left: `${p * 100}%`, background: gridColor }}
                />
              ))}
              {[0.25, 0.5, 0.75].map((p) => (
                <div
                  key={`h${p}`}
                  className="absolute left-0 right-0 h-px"
                  style={{ top: `${p * 100}%`, background: gridColor }}
                />
              ))}

              {/* Sweet-spot zone (lower-left = low concentration, high growth) */}
              <div
                className="absolute rounded-2xl pointer-events-none"
                style={{
                  left: '4%',
                  top: '4%',
                  width: '32%',
                  height: '38%',
                  background: `radial-gradient(ellipse at top left, ${accent}22, transparent 75%)`,
                  border: `1px dashed ${accent}55`,
                }}
              />
              <p
                className="absolute text-[10px] font-bold uppercase tracking-wider pointer-events-none"
                style={{
                  left: '6%',
                  top: '6%',
                  color: accent,
                }}
              >
                Premium zone
              </p>

              {/* Comp dots */}
              {compDots.map((dot, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full pointer-events-none"
                  style={{
                    left: `${dot.x * 100}%`,
                    top: `${dot.y * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    background: dark ? 'rgba(255,255,255,0.4)' : 'rgba(15,16,18,0.35)',
                    opacity: dot.opacity,
                  }}
                />
              ))}

              {/* The pin — click chart anywhere to reposition */}
              <motion.div
                className="absolute z-10 pointer-events-none"
                animate={{
                  left: `${pinPct.x * 100}%`,
                  top: `${pinPct.y * 100}%`,
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                style={{
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Pulse halo */}
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: 44,
                    height: 44,
                    left: -22,
                    top: -22,
                    background: `radial-gradient(circle, ${accent}88, transparent 70%)`,
                    animation: 'multipleMapPulse 2.4s ease-out infinite',
                  }}
                />
                <div
                  className="rounded-full"
                  style={{
                    width: 18,
                    height: 18,
                    background: accent,
                    border: '3px solid white',
                    boxShadow: `0 4px 12px ${accent}88`,
                  }}
                />
              </motion.div>

              {/* Axis labels */}
              <p
                className="absolute bottom-2 left-0 right-0 text-center text-[10px] font-bold uppercase tracking-wider pointer-events-none"
                style={{ color: mutedColor }}
              >
                ← lower customer concentration · higher concentration →
              </p>
              <div
                className="absolute top-0 bottom-0 left-1 flex items-center pointer-events-none"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: mutedColor }}>
                  ← lower growth · higher growth →
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Read-out — 4 cols */}
        <div className="lg:col-span-4 flex flex-col justify-center">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.22em] mb-2"
            style={{ color: mutedColor }}
          >
            Your read-out
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: mutedColor }}>
                Customer concentration
              </p>
              <p className="font-headline font-black text-2xl" style={{ color: headingColor }}>
                {concentration.toFixed(0)}%
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: mutedColor }}>
                3-yr revenue CAGR
              </p>
              <p className="font-headline font-black text-2xl" style={{ color: headingColor }}>
                {cagr >= 0 ? '+' : ''}
                {cagr.toFixed(1)}%
              </p>
            </div>
          </div>

          <div
            className="rounded-xl p-5 mb-3"
            style={{
              background: dark ? 'rgba(255,255,255,0.04)' : 'white',
              border: `1px solid ${border}`,
            }}
          >
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: mutedColor }}>
              EBITDA multiple
            </p>
            <p
              className="font-headline font-black tracking-tight"
              style={{
                fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                color: accent,
                lineHeight: 1,
              }}
            >
              {multiple.toFixed(1)}×
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider mt-2" style={{ color: band.color }}>
              {band.label} · {industry.floor.toFixed(1)}–{industry.ceiling.toFixed(1)}×
            </p>
          </div>

          <div
            className="rounded-xl p-5"
            style={{
              background: accent,
              color: 'white',
            }}
          >
            <p className="text-[10px] uppercase tracking-wider opacity-80 mb-1">
              Implied valuation · ${ebitda}M EBITDA
            </p>
            <p
              className="font-headline font-black tracking-tight"
              style={{
                fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                lineHeight: 1,
              }}
            >
              ${valuationM.toFixed(0)}M
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs mt-6" style={{ color: mutedColor }}>
        2024-2025 mid-market consensus ranges, $5M-$100M EBITDA segment. Yulia runs the real Baseline against your verified financials,
        Census + SBA + NAICS benchmark data, and the actual deals closed in your sector this year.
      </p>

      <style>{`
        @keyframes multipleMapPulse {
          0% { transform: scale(0.7); opacity: 0.7; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
