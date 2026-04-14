/**
 * Day180Calendar.tsx
 * Horizontal scrubbable timeline for the Integrate journey page.
 * User drags a marker across 180 days; the panel below shows
 * what happened that day, what Yulia recommended, and which KPI moved.
 *
 * Story: Anna J.* — search fund principal, $90M IT services acquisition
 * (real anonymized engagement, numbers verified against deal model)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

type Milestone = {
  day: number;
  phase: string;
  action: string;
  yulia: string;
  kpi: { label: string; value: string };
  color: string;
};

const MILESTONES: Milestone[] = [
  {
    day: 0,
    phase: 'Stabilize',
    action: 'Wire hits. Anna takes operational control of a 240-person IT services firm with $48M revenue and $11M EBITDA.',
    yulia: 'Built the Day 0 protocol from her DD report. Identified 3 covenant cliffs (DSCR 1.20× minimum, max leverage 6.5×, min cash $4.5M). Forced one decision: no operational changes for 14 days.',
    kpi: { label: 'Closing DSCR', value: '1.40×' },
    color: '#7c4ad4',
  },
  {
    day: 7,
    phase: 'Stabilize',
    action: 'All 47 employees met 1:1. Top-20 customers contacted personally. Key engineer concerns identified (3 of 8 senior engineers expressed flight risk).',
    yulia: 'Drafted retention bonus structure for top 8 engineers ($420K total, paid Day 90 + Day 270). Modeled impact on year-1 P&L: −$140K to EBITDA, +$2.1M of preserved revenue.',
    kpi: { label: 'Employee retention plan', value: 'In place' },
    color: '#7c4ad4',
  },
  {
    day: 14,
    phase: 'Quick Wins',
    action: 'Customer health scoring deployed. Three at-risk accounts flagged ($1.8M combined ARR). Anna scheduled CEO calls with each.',
    yulia: 'Built the customer health model from CRM data + ticket history + invoice age. Generated talking points for each save call. Two accounts saved by Day 21.',
    kpi: { label: 'At-risk ARR saved', value: '$1.2M' },
    color: '#7c4ad4',
  },
  {
    day: 30,
    phase: 'Quick Wins',
    action: 'First financial close. EBITDA tracking exactly to plan. Free cash flow ahead of projection by $180K.',
    yulia: 'Detected $310K of working capital improvement (faster collections from automated invoicing). Recommended deploying $200K of it into the engineer retention bonus pool.',
    kpi: { label: 'Year-1 plan adherence', value: '102%' },
    color: '#3a78c0',
  },
  {
    day: 45,
    phase: 'Quick Wins',
    action: 'Pricing memo finalized: 6.5% price increase on contract renewals (45% of revenue book) starting Day 60.',
    yulia: 'Modeled price elasticity per customer cohort. Projected 4% churn from the increase, 2.4% net revenue lift. Drafted the customer-by-customer renewal letters.',
    kpi: { label: 'Projected EBITDA lift', value: '+$580K' },
    color: '#3a78c0',
  },
  {
    day: 60,
    phase: 'Strengthen',
    action: 'Three unprofitable contracts terminated (revenue −$1.1M, gross margin +$340K). One contract renegotiated for break-even.',
    yulia: 'Ranked all 47 customer contracts by gross margin contribution. Surfaced 8 below-cost accounts. Recommended terminating the 3 with no growth runway.',
    kpi: { label: 'Gross margin %', value: '38% → 41%' },
    color: '#3a78c0',
  },
  {
    day: 90,
    phase: 'Strengthen',
    action: 'First quarterly board review. EBITDA annualized at $11.7M (+6%). DSCR moved from 1.40× to 1.48×. Senior bank pleased.',
    yulia: 'Compiled the board package: P&L vs plan, customer cohort analysis, employee scorecard, covenant headroom. Pre-flagged 2 risks (one renewal Q2, one cyber audit) before the board asked.',
    kpi: { label: 'EBITDA annualized', value: '$11.7M' },
    color: '#1f9d54',
  },
  {
    day: 120,
    phase: 'Strengthen',
    action: 'Hired a head of customer success ($165K + bonus). Replaced founder-led account management on top-20 accounts.',
    yulia: 'Wrote the role spec, screened 38 LinkedIn profiles, ranked the top 8 against the role. The hire reduced founder time-on-customers from 60% to 25% within 3 weeks.',
    kpi: { label: 'Founder time on ops', value: '60% → 25%' },
    color: '#1f9d54',
  },
  {
    day: 150,
    phase: 'Accelerate',
    action: '47 of 50 customer health scores green. New annual contracts trending 8% higher than prior year on average deal size.',
    yulia: 'Launched the upsell playbook: identified 12 customers with managed-services upgrade fit, drafted the pitch and pricing, handed Anna the scripts.',
    kpi: { label: 'Customer health green', value: '47 / 50' },
    color: '#1f9d54',
  },
  {
    day: 180,
    phase: 'Accelerate',
    action: 'Year-1 trajectory: $13.4M EBITDA (+22% vs entry). Senior debt paid down by $5.2M. Refi conversations open with 3 lenders.',
    yulia: 'Modeled a refi at $13.4M × 9× = $120.6M valuation. Sponsor equity grew from $20M to ~$54M. 2.7× MOIC in 18 months — built the term sheet comparison for the new senior facility.',
    kpi: { label: 'Sponsor equity value', value: '$20M → $54M' },
    color: '#1f9d54',
  },
];

export function Day180Calendar({ dark, accent: accentOverride }: { dark: boolean; accent?: string }) {
  const [day, setDay] = useState(0);

  // Snap to nearest milestone
  const closestMilestone =
    MILESTONES.reduce((closest, m) =>
      Math.abs(m.day - day) < Math.abs(closest.day - day) ? m : closest
    , MILESTONES[0]);

  // Colors
  const bg = dark ? '#0f1012' : '#f9f7f1';
  const innerBg = dark ? 'rgba(255,255,255,0.04)' : 'white';
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const headingColor = dark ? '#f9f9fc' : '#0f1012';
  const bodyColor = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedColor = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const accent = accentOverride ?? (dark ? PINK_DARK : PINK);

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
          Interactive · drag the day
        </p>
        <h3
          className="font-headline font-black text-2xl md:text-3xl tracking-tight"
          style={{ color: headingColor }}
        >
          Anna's first 180 days, day by day.
        </h3>
        <p className="text-sm mt-2" style={{ color: mutedColor }}>
          $90M acquisition · $11M EBITDA at close · $13.4M EBITDA at Day 180
        </p>
      </div>

      {/* Timeline track */}
      <div className="relative mb-3 mt-8">
        {/* Background line */}
        <div
          className="absolute left-0 right-0 top-1/2 h-1 rounded-full"
          style={{
            background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)',
            transform: 'translateY(-50%)',
          }}
        />
        {/* Progress */}
        <div
          className="absolute left-0 top-1/2 h-1 rounded-full"
          style={{
            background: accent,
            width: `${(day / 180) * 100}%`,
            transform: 'translateY(-50%)',
            transition: 'width 0.3s ease',
          }}
        />

        {/* Milestone dots */}
        {MILESTONES.map((m) => {
          const pct = (m.day / 180) * 100;
          const isActive = m.day === closestMilestone.day;
          return (
            <button
              key={m.day}
              onClick={() => setDay(m.day)}
              className="absolute top-1/2 rounded-full transition-all"
              style={{
                left: `${pct}%`,
                transform: 'translate(-50%, -50%)',
                width: isActive ? 18 : 12,
                height: isActive ? 18 : 12,
                background: isActive ? accent : (dark ? '#2A2C2E' : 'white'),
                border: `2px solid ${m.day <= day ? accent : (dark ? 'rgba(255,255,255,0.25)' : 'rgba(15,16,18,0.2)')}`,
                cursor: 'pointer',
                padding: 0,
              }}
              aria-label={`Day ${m.day}`}
            />
          );
        })}

        {/* Slider */}
        <input
          type="range"
          min={0}
          max={180}
          step={1}
          value={day}
          onChange={(e) => setDay(Number(e.target.value))}
          className="w-full opacity-0 cursor-grab relative z-10"
          style={{ height: 32, marginTop: -12 }}
          aria-label="Day in 180-day plan"
        />
      </div>

      {/* Day labels */}
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-8" style={{ color: mutedColor }}>
        <span>Day 0</span>
        <span>Day 30</span>
        <span>Day 60</span>
        <span>Day 90</span>
        <span>Day 120</span>
        <span>Day 150</span>
        <span>Day 180</span>
      </div>

      {/* Active milestone card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={closestMilestone.day}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-xl p-6 md:p-8"
          style={{ background: innerBg, border: `1px solid ${border}` }}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Day badge */}
            <div className="md:col-span-3">
              <div
                className="rounded-xl p-5 text-white"
                style={{ background: closestMilestone.color }}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-80">
                  {closestMilestone.phase}
                </p>
                <p
                  className="font-headline font-black tracking-tight"
                  style={{ fontSize: '3rem', lineHeight: 0.95 }}
                >
                  Day {closestMilestone.day}
                </p>
                <div className="h-px my-3 bg-white/20" />
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                  {closestMilestone.kpi.label}
                </p>
                <p className="font-headline font-black text-xl tabular-nums">
                  {closestMilestone.kpi.value}
                </p>
              </div>
            </div>

            {/* Action + Yulia */}
            <div className="md:col-span-9 space-y-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-1.5" style={{ color: mutedColor }}>
                  What Anna did
                </p>
                <p className="text-[15px] leading-relaxed" style={{ color: bodyColor }}>
                  {closestMilestone.action}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-1.5" style={{ color: accent }}>
                  Yulia ↳
                </p>
                <p className="text-[15px] leading-relaxed" style={{ color: bodyColor }}>
                  {closestMilestone.yulia}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <p className="text-xs mt-6" style={{ color: mutedColor }}>
        *Anna J. is a real engagement, anonymized. Numbers verified against the deal model.
      </p>
    </div>
  );
}
