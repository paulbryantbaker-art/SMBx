/**
 * LiveClassifier.tsx
 * The signature demo for /how-it-works.
 *
 * Pick a preset sentence (or type your own) and watch the scripted reveal:
 *   1. Classify   — NAICS + journey + league badge
 *   2. Gates set  — journey-specific gate track lights advance
 *   3. Comps      — 3-tile KPI grid with market multiples
 *   4. Verdict    — headline Baseline or pursue/kill call
 *
 * No API call. Everything is deterministic and pre-baked per preset so the
 * demo always lands in under 4 seconds. A user-typed sentence falls back to
 * a generic "classifying…" state with a nudge to open chat for the real run.
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { bridgeToYulia } from './chatBridge';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

type Stage = 0 | 1 | 2 | 3 | 4;

type PresetReveal = {
  id: 'sell' | 'buy' | 'raise';
  input: string;
  classify: {
    naics: string;
    sector: string;
    league: string;
    journey: 'Sell' | 'Buy' | 'Raise';
    journeyColor: string;
  };
  gates: { label: string; state: 'done' | 'active' | 'pending' }[];
  comps: { label: string; value: string; sub?: string }[];
  verdict: {
    label: string;
    value: string;
    sub: string;
  };
};

const PRESETS: PresetReveal[] = [
  {
    id: 'sell',
    input:
      "I run an HVAC business doing $4M revenue, $600K SDE. I'm thinking about selling in the next 12 months.",
    classify: {
      naics: 'NAICS 238220',
      sector: 'HVAC services',
      league: 'SBA league · Lower-market',
      journey: 'Sell',
      journeyColor: '#D44A78',
    },
    gates: [
      { label: 'S0 · Profile',   state: 'done' },
      { label: 'S1 · Financials', state: 'done' },
      { label: 'S2 · Valuation', state: 'active' },
      { label: 'S3 · Prepare',   state: 'pending' },
      { label: 'S4 · Negotiate', state: 'pending' },
      { label: 'S5 · Close',     state: 'pending' },
    ],
    comps: [
      { label: 'SDE',            value: '$600K',      sub: 'verified from P&L + returns' },
      { label: 'Multiple range', value: '2.8–3.5×',   sub: '2024-2025 comp set' },
      { label: 'SBA-eligible',   value: 'Yes',        sub: '10% down · 10-yr amort' },
    ],
    verdict: {
      label: 'Baseline',
      value: '$1.68M – $2.10M',
      sub: 'Top quartile for owner-operator HVAC at this SDE. Cash at close $1.5–1.9M after fees.',
    },
  },
  {
    id: 'buy',
    input:
      "I'm looking at a $12M EBITDA specialty chemicals company, asking $84M. I have a sponsor and a senior lender lined up.",
    classify: {
      naics: 'NAICS 325199',
      sector: 'Specialty chemicals',
      league: 'Lower middle market',
      journey: 'Buy',
      journeyColor: '#3E8E8E',
    },
    gates: [
      { label: 'B0 · Thesis',     state: 'done' },
      { label: 'B1 · Source',     state: 'done' },
      { label: 'B2 · Underwrite', state: 'active' },
      { label: 'B3 · Diligence',  state: 'pending' },
      { label: 'B4 · Negotiate',  state: 'pending' },
      { label: 'B5 · Close',      state: 'pending' },
    ],
    comps: [
      { label: 'Ask multiple',   value: '7.0×',        sub: '$84M on $12M EBITDA' },
      { label: 'Comp range',     value: '6.0–8.0×',    sub: '2024-2025 specialty chem set' },
      { label: 'DSCR @ 65/35',   value: '1.42×',       sub: 'SOFR+475 · 5-yr amort' },
    ],
    verdict: {
      label: 'The Rundown™',
      value: 'Pursue · at market',
      sub: '7.0× sits mid-band. DSCR clears. Customer concentration + WC needs verification in DD.',
    },
  },
  {
    id: 'raise',
    input:
      "I need $25M senior + mezz to close on a $52M target at 2.0× TTM revenue. What's my best stack?",
    classify: {
      naics: 'NAICS (buyer-agnostic)',
      sector: 'Capital stack · acquisition',
      league: 'Independent sponsor',
      journey: 'Raise',
      journeyColor: '#C99A3E',
    },
    gates: [
      { label: 'R0 · Capital need', state: 'done' },
      { label: 'R1 · Structure',    state: 'active' },
      { label: 'R2 · Materials',    state: 'pending' },
      { label: 'R3 · Outreach',     state: 'pending' },
      { label: 'R4 · Term sheet',   state: 'pending' },
      { label: 'R5 · Close',        state: 'pending' },
    ],
    comps: [
      { label: 'Senior',    value: '$18M',   sub: 'SOFR+450 · 1.30× DSCR floor' },
      { label: 'Mezz',      value: '$7M',    sub: '12% cash + 3% PIK' },
      { label: 'Sponsor + rollover', value: '$27M', sub: '$9M cash · $18M rollover' },
    ],
    verdict: {
      label: 'Year-1 DSCR',
      value: '1.38×',
      sub: 'Clears both covenants. Headroom supports modest EBITDA dip in year 1.',
    },
  },
];

type LiveClassifierProps = {
  dark?: boolean;
  accent?: string;
};

export function LiveClassifier({ dark = true, accent: accentOverride }: LiveClassifierProps) {
  const accent = accentOverride ?? (dark ? PINK_DARK : PINK);
  const [input, setInput] = useState('');
  const [activePreset, setActivePreset] = useState<PresetReveal | null>(null);
  const [stage, setStage] = useState<Stage>(0);
  const [isCustom, setIsCustom] = useState(false);
  const timeoutsRef = useRef<number[]>([]);

  const clearTimers = () => {
    timeoutsRef.current.forEach((t) => window.clearTimeout(t));
    timeoutsRef.current = [];
  };

  const runReveal = (preset: PresetReveal | null, customText = '') => {
    clearTimers();
    setStage(0);
    setIsCustom(preset === null);
    setActivePreset(preset);
    if (preset) setInput(preset.input);
    else setInput(customText);

    // Cadence: 600ms → 900ms → 1200ms → 1500ms (cumulative)
    const schedule = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms);
      timeoutsRef.current.push(id);
    };
    schedule(() => setStage(1), 600);
    if (preset) {
      schedule(() => setStage(2), 1500);
      schedule(() => setStage(3), 2700);
      schedule(() => setStage(4), 4200);
    }
  };

  const reset = () => {
    clearTimers();
    setStage(0);
    setActivePreset(null);
    setInput('');
    setIsCustom(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    // Try to match against a preset by substring
    const match = PRESETS.find((p) => p.input.trim() === input.trim());
    runReveal(match ?? null, input);
  };

  // Theme
  const panelBg = '#0f1012';
  const panelBorder = 'rgba(255,255,255,0.08)';
  const softBg = 'rgba(255,255,255,0.04)';
  const softBorder = 'rgba(255,255,255,0.10)';
  const mutedText = 'rgba(218,218,220,0.55)';
  const bodyText = 'rgba(218,218,220,0.85)';

  return (
    <div
      className="rounded-3xl p-6 md:p-10 relative overflow-hidden"
      style={{ background: panelBg, border: `1px solid ${panelBorder}`, color: '#f9f9fc' }}
    >
      {/* accent glow */}
      <div
        aria-hidden
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accent}22, transparent 65%)` }}
      />

      <div className="relative z-10">
        {/* ── Input row ── */}
        <form onSubmit={handleSubmit} className="mb-5">
          <label
            className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3 block"
            style={{ color: accent }}
          >
            Try a sentence
          </label>
          <div
            className="flex items-center gap-2 p-2 rounded-2xl"
            style={{ background: softBg, border: `1px solid ${softBorder}` }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. I'm selling my HVAC business, $600K SDE…"
              className="flex-1 bg-transparent border-none outline-none text-white text-[14px] px-3 py-2 placeholder:text-white/30"
              style={{ fontFamily: 'inherit' }}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="cta-press h-10 px-4 rounded-xl text-[12px] font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: accent, border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed' }}
            >
              Run it
            </button>
          </div>
        </form>

        {/* ── Preset chips ── */}
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="text-[11px] font-bold uppercase tracking-wider self-center mr-2" style={{ color: mutedText }}>
            or pick a preset
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => runReveal(p)}
              className="text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all hover:bg-white/5"
              style={{
                background: activePreset?.id === p.id ? `${p.classify.journeyColor}20` : 'transparent',
                borderColor: activePreset?.id === p.id ? p.classify.journeyColor : softBorder,
                color: activePreset?.id === p.id ? p.classify.journeyColor : bodyText,
                cursor: 'pointer',
              }}
            >
              {p.classify.journey} · {p.classify.sector.split(' ')[0]}
            </button>
          ))}
          {(activePreset || isCustom) && (
            <button
              type="button"
              onClick={reset}
              className="text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all hover:bg-white/5"
              style={{ borderColor: softBorder, color: mutedText, background: 'transparent', cursor: 'pointer' }}
            >
              Reset
            </button>
          )}
        </div>

        {/* ── Reveal stages ── */}
        <AnimatePresence mode="wait">
          {stage >= 1 && (
            <motion.div
              key="classify"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-6"
            >
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] mb-2" style={{ color: mutedText }}>
                Step 1 · Classify
              </p>
              {activePreset ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: `${activePreset.classify.journeyColor}22`, color: activePreset.classify.journeyColor }}
                  >
                    {activePreset.classify.journey} journey
                  </span>
                  <span className="text-[12px] font-mono" style={{ color: bodyText }}>
                    {activePreset.classify.naics}
                  </span>
                  <span className="text-[12px]" style={{ color: bodyText }}>·</span>
                  <span className="text-[12px]" style={{ color: bodyText }}>{activePreset.classify.sector}</span>
                  <span className="text-[12px]" style={{ color: bodyText }}>·</span>
                  <span className="text-[12px]" style={{ color: mutedText }}>{activePreset.classify.league}</span>
                </div>
              ) : (
                <p className="text-[13px] italic" style={{ color: mutedText }}>
                  Classifying your sentence… for a live run against a real NAICS set, <button type="button" onClick={() => bridgeToYulia(input)} className="underline" style={{ color: accent, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>open this in chat →</button>
                </p>
              )}
            </motion.div>
          )}

          {stage >= 2 && activePreset && (
            <motion.div
              key="gates"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-6"
            >
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] mb-3" style={{ color: mutedText }}>
                Step 2 · Gates set
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {activePreset.gates.map((g, i) => {
                  const isDone = g.state === 'done';
                  const isActive = g.state === 'active';
                  return (
                    <motion.span
                      key={g.label}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.08 }}
                      className="text-[11px] font-mono px-2.5 py-1.5 rounded-full border"
                      style={{
                        background: isActive ? `${activePreset.classify.journeyColor}22` : isDone ? softBg : 'transparent',
                        borderColor: isActive ? activePreset.classify.journeyColor : softBorder,
                        color: isActive ? activePreset.classify.journeyColor : isDone ? bodyText : mutedText,
                        opacity: isDone ? 0.75 : 1,
                      }}
                    >
                      {isDone && <span className="mr-1">✓</span>}
                      {g.label}
                    </motion.span>
                  );
                })}
              </div>
            </motion.div>
          )}

          {stage >= 3 && activePreset && (
            <motion.div
              key="comps"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-6"
            >
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] mb-3" style={{ color: mutedText }}>
                Step 3 · Pull the comps
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activePreset.comps.map((c, i) => (
                  <motion.div
                    key={c.label}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.12 }}
                    className="rounded-xl p-4"
                    style={{ background: softBg, border: `1px solid ${softBorder}` }}
                  >
                    <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: mutedText }}>
                      {c.label}
                    </p>
                    <p className="text-[1.5rem] font-black tabular-nums tracking-tight" style={{ color: '#f9f9fc', lineHeight: 1 }}>
                      {c.value}
                    </p>
                    {c.sub && (
                      <p className="text-[11px] mt-1.5 leading-snug" style={{ color: mutedText }}>
                        {c.sub}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {stage >= 4 && activePreset && (
            <motion.div
              key="verdict"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl p-6 mb-2"
              style={{
                background: `linear-gradient(135deg, ${activePreset.classify.journeyColor}1a, ${activePreset.classify.journeyColor}06)`,
                border: `1px solid ${activePreset.classify.journeyColor}44`,
              }}
            >
              <p
                className="text-[9px] font-bold uppercase tracking-[0.22em] mb-2"
                style={{ color: activePreset.classify.journeyColor }}
              >
                Step 4 · {activePreset.verdict.label}
              </p>
              <p
                className="font-headline font-black tracking-[-0.02em] mb-2"
                style={{
                  fontSize: 'clamp(1.75rem, 3.2vw, 2.5rem)',
                  color: activePreset.classify.journeyColor,
                  lineHeight: 1,
                }}
              >
                {activePreset.verdict.value}
              </p>
              <p className="text-[14px] leading-relaxed" style={{ color: bodyText }}>
                {activePreset.verdict.sub}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => bridgeToYulia(activePreset.input)}
                  className="cta-press inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-bold text-white"
                  style={{ background: activePreset.classify.journeyColor, border: 'none', cursor: 'pointer' }}
                >
                  Run this for real in chat
                  <span aria-hidden className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
                <span className="text-[12px] self-center" style={{ color: mutedText }}>
                  ~4 seconds here · ~90 seconds with your real numbers
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {stage === 0 && (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ background: softBg, border: `1px dashed ${softBorder}` }}
          >
            <p className="text-[13px]" style={{ color: mutedText }}>
              Pick a preset or type a sentence above. The reveal runs in ~4 seconds.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LiveClassifier;
