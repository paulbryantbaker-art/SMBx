/**
 * LiveRundown.tsx
 * Pick a preset deal (or paste your own) and watch The Rundown™
 * score it across 7 dimensions with a final pursue/negotiate/kill verdict.
 *
 * For the public landing page this uses pre-baked scores per preset.
 * The in-app version drives the same UI from real Yulia agentic loop output.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

type Dimension = {
  key: string;
  label: string;
  weight: number;
};

const DIMENSIONS: Dimension[] = [
  { key: 'financial',     label: 'Financial Performance', weight: 20 },
  { key: 'market',        label: 'Market Position',       weight: 15 },
  { key: 'ownerDep',      label: 'Owner Dependency',      weight: 12 },
  { key: 'concentration', label: 'Customer Concentration', weight: 13 },
  { key: 'growth',        label: 'Growth Trajectory',     weight: 15 },
  { key: 'bankability',   label: 'Bankability (DSCR)',    weight: 15 },
  { key: 'opsRisk',       label: 'Operational Risk',      weight: 10 },
];

type DealPreset = {
  id: string;
  title: string;
  blurb: string;
  scores: Record<string, { value: number; note: string }>;
};

const PRESETS: DealPreset[] = [
  {
    id: 'msp-tx',
    title: 'MSP / IT services · Texas',
    blurb: '$48M revenue · $11M EBITDA · 8.2× ask · top-10 customers = 22% · 18% 3-yr CAGR · 14 yrs operating',
    scores: {
      financial:     { value: 88, note: 'EBITDA margin 23%, growing 3pts/yr' },
      market:        { value: 76, note: 'Defensible regional niche, switching costs' },
      ownerDep:      { value: 72, note: 'Founder still in sales — transition risk' },
      concentration: { value: 81, note: '22% top-10 — within healthy band' },
      growth:        { value: 86, note: '18% CAGR vs 9% industry median' },
      bankability:   { value: 84, note: 'DSCR 1.42× at 60% senior debt' },
      opsRisk:       { value: 70, note: 'Three key engineers — retention plan needed' },
    },
  },
  {
    id: 'distrib-tx',
    title: 'Specialty distribution · Dallas',
    blurb: '$112M revenue · $18M EBITDA · 9.4× ask · top-5 = 38% · 4% CAGR · 28 yrs operating',
    scores: {
      financial:     { value: 74, note: 'Stable margins, no recent acceleration' },
      market:        { value: 68, note: 'Mature market, modest moat' },
      ownerDep:      { value: 58, note: 'Heavy founder involvement on key accounts' },
      concentration: { value: 41, note: '38% top-5 — outside comp set tolerance' },
      growth:        { value: 52, note: '4% CAGR — below 8% industry median' },
      bankability:   { value: 78, note: 'DSCR 1.31× — clears with margin' },
      opsRisk:       { value: 80, note: 'Long-tenured staff, low turnover' },
    },
  },
  {
    id: 'saas-bay',
    title: 'Vertical SaaS · Bay Area',
    blurb: '$22M ARR · $6M EBITDA · 18× ask · NRR 118% · top-10 = 14% · 32% YoY · 7 yrs operating',
    scores: {
      financial:     { value: 91, note: 'Rule of 40 = 56 — top quartile' },
      market:        { value: 88, note: 'Vertical leader, network effects' },
      ownerDep:      { value: 85, note: 'Strong second layer in place' },
      concentration: { value: 92, note: '14% top-10 — fully diversified' },
      growth:        { value: 94, note: '32% YoY, NRR 118%' },
      bankability:   { value: 36, note: 'Asset-light · only 1.8× senior leverage available' },
      opsRisk:       { value: 78, note: 'Engineering retention solid' },
    },
  },
];

function bandFor(score: number): { label: string; color: string } {
  if (score >= 75) return { label: 'PURSUE', color: '#1f9d54' };
  if (score >= 55) return { label: 'NEGOTIATE', color: '#d4a44a' };
  return { label: 'KILL', color: '#c44a4a' };
}

function dimensionBandColor(score: number): string {
  if (score >= 75) return '#1f9d54';
  if (score >= 55) return '#d4a44a';
  return '#c44a4a';
}

export function LiveRundown({ dark }: { dark: boolean }) {
  const [presetId, setPresetId] = useState<string>(PRESETS[0].id);
  const [isRunning, setIsRunning] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [showVerdict, setShowVerdict] = useState(false);
  const timeoutsRef = useRef<number[]>([]);

  const preset = PRESETS.find((p) => p.id === presetId)!;

  const totalScore = DIMENSIONS.reduce((sum, d) => {
    const s = preset.scores[d.key].value;
    return sum + (s / 100) * d.weight;
  }, 0);
  const verdict = bandFor(totalScore * (100 / DIMENSIONS.reduce((s, d) => s + d.weight, 0)));

  // Run the animation
  useEffect(() => {
    // Cancel any pending
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    if (!isRunning) return;

    setRevealedCount(0);
    setShowVerdict(false);

    DIMENSIONS.forEach((_, i) => {
      const t = window.setTimeout(() => {
        setRevealedCount(i + 1);
      }, 300 + i * 320);
      timeoutsRef.current.push(t);
    });

    const verdictT = window.setTimeout(() => {
      setShowVerdict(true);
      setIsRunning(false);
    }, 300 + DIMENSIONS.length * 320 + 400);
    timeoutsRef.current.push(verdictT);

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [isRunning]);

  // When preset changes, reset
  useEffect(() => {
    setRevealedCount(0);
    setShowVerdict(false);
    setIsRunning(false);
    timeoutsRef.current.forEach(clearTimeout);
  }, [presetId]);

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
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-[0.22em] mb-2"
            style={{ color: accent }}
          >
            Interactive · The Rundown™
          </p>
          <h3
            className="font-headline font-black text-2xl md:text-3xl tracking-tight"
            style={{ color: headingColor }}
          >
            Score a deal in 8 seconds.
          </h3>
        </div>
      </div>

      {/* Preset selector */}
      <div className="flex flex-wrap gap-2 mb-5">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPresetId(p.id)}
            className="text-xs font-bold px-4 py-2.5 rounded-full transition-all"
            style={{
              background: p.id === presetId ? accent : (dark ? 'rgba(255,255,255,0.06)' : 'white'),
              color: p.id === presetId ? 'white' : headingColor,
              border: `1px solid ${p.id === presetId ? accent : border}`,
              cursor: 'pointer',
            }}
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Selected deal blurb */}
      <div
        className="rounded-xl p-4 mb-5"
        style={{ background: innerBg, border: `1px solid ${border}` }}
      >
        <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: mutedColor }}>
          Deal description
        </p>
        <p className="text-sm font-mono leading-relaxed" style={{ color: bodyColor }}>
          {preset.blurb}
        </p>
      </div>

      {/* Run button */}
      <button
        onClick={() => {
          setIsRunning(true);
        }}
        disabled={isRunning}
        className="w-full mb-6 px-6 py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all"
        style={{
          background: accent,
          color: 'white',
          border: 'none',
          cursor: isRunning ? 'not-allowed' : 'pointer',
          opacity: isRunning ? 0.7 : 1,
        }}
      >
        {isRunning ? (
          <>
            <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
            Running The Rundown...
          </>
        ) : revealedCount > 0 ? (
          <>
            <span className="material-symbols-outlined text-base">refresh</span>
            Run again
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-base">bolt</span>
            Run The Rundown™
          </>
        )}
      </button>

      {/* 7 dimensions */}
      <div className="space-y-3 mb-5">
        {DIMENSIONS.map((d, i) => {
          const isRevealed = i < revealedCount;
          const score = preset.scores[d.key];
          const bandColor = dimensionBandColor(score.value);
          return (
            <motion.div
              key={d.key}
              animate={{
                opacity: isRevealed ? 1 : 0.25,
              }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] font-bold" style={{ color: headingColor }}>
                  {d.label}
                </span>
                <span
                  className="text-[12px] font-mono font-bold tabular-nums"
                  style={{ color: isRevealed ? bandColor : mutedColor }}
                >
                  {isRevealed ? `${score.value}/100` : '— /100'}
                </span>
              </div>
              <div
                className="relative h-1.5 rounded-full overflow-hidden"
                style={{ background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.05)' }}
              >
                <motion.div
                  className="absolute top-0 left-0 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: isRevealed ? `${score.value}%` : 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  style={{ background: bandColor }}
                />
              </div>
              <AnimatePresence>
                {isRevealed && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="text-[11px] mt-1 italic"
                    style={{ color: mutedColor }}
                  >
                    {score.note}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Verdict */}
      <AnimatePresence>
        {showVerdict && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-xl p-5 flex items-center justify-between"
            style={{
              background: verdict.color,
              color: 'white',
            }}
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-80">
                The Rundown verdict
              </p>
              <p
                className="font-headline font-black tracking-tight"
                style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', lineHeight: 1 }}
              >
                {verdict.label}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Composite</p>
              <p
                className="font-headline font-black tabular-nums tracking-tight"
                style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', lineHeight: 1 }}
              >
                {totalScore.toFixed(0)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-xs mt-5" style={{ color: mutedColor }}>
        Public preview uses pre-baked scores. Yulia runs the live version on any deal you bring her — paste a listing URL,
        a CIM excerpt, or a one-line description.
      </p>
    </div>
  );
}
