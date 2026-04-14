/**
 * storyBlocks.tsx
 * Reusable editorial blocks used across all 5 journey pages.
 *  - HookHeader: opinionated hero block (eyebrow + giant H1 + sub)
 *  - StoryBlock: named-protagonist deal story with inline numbers
 *  - BrandedTermCard: Baseline / Blind Equity / The Rundown as visible products
 *  - SlowVsFast: side-by-side contrast — "the way it's been" vs "with Yulia"
 *  - SignOffChain: 5-step deal-operator workflow block (the chain Yulia runs)
 *  - SectionHeader: small label/title combo
 *  - PageCTA: bottom-of-page action
 *
 *  All blocks accept a `dark` prop and use the project palette.
 *  No card grids. No identical shadows. No AI-slop patterns.
 */

import { motion, useInView } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

/* ════════════════════════════════════════════════════════════
   HookHeader — eyebrow + dominant headline + subhead
   Used to open every journey page. The hook is a money question,
   not a feature claim.
   ════════════════════════════════════════════════════════════ */
export function HookHeader({
  eyebrow,
  headline,
  sub,
  dark,
  accent,
}: {
  eyebrow: string;
  headline: ReactNode;
  sub: ReactNode;
  dark: boolean;
  /** Optional per-page accent override. Defaults to brand pink. */
  accent?: string;
}) {
  const accentColor = accent ?? (dark ? PINK_DARK : PINK);
  return (
    <header className="mb-20">
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-[11px] font-bold uppercase tracking-[0.24em] mb-6"
        style={{ color: accentColor }}
      >
        <span className="inline-block w-1.5 h-1.5 rounded-full mr-2 align-middle" style={{ background: accentColor }} />
        smbx.ai · faster, easier M&amp;A · {eyebrow}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="font-headline font-black tracking-[-0.04em] leading-[0.92] mb-8"
        style={{
          fontSize: 'clamp(2.5rem, 7vw, 5.75rem)',
          color: dark ? '#f9f9fc' : '#0f1012',
        }}
      >
        {headline}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl text-[19px] md:text-[21px] leading-[1.55]"
        style={{ color: dark ? 'rgba(218,218,220,0.78)' : '#5d5e61' }}
      >
        {sub}
      </motion.p>
    </header>
  );
}

/* ════════════════════════════════════════════════════════════
   StoryBlock — editorial named-protagonist story
   Not a card. Editorial layout with a left rail "byline" and a
   right column of running text + inline KPI calls.
   ════════════════════════════════════════════════════════════ */
export function StoryBlock({
  byline,
  role,
  dealLine,
  body,
  kpis,
  dark,
}: {
  byline: string;          // "Mark D.*"
  role: string;            // "Owner — specialty industrial distribution"
  dealLine: string;        // "$112M revenue · $18M EBITDA · Midwest"
  body: ReactNode;         // Running editorial text with <strong> for emphasis
  kpis: { label: string; value: string; sub?: string }[];  // 3 KPIs
  dark: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const headingColor = dark ? '#f9f9fc' : '#0f1012';
  const bodyColor = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedColor = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const ruleColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const accent = dark ? PINK_DARK : PINK;

  return (
    <section ref={ref} className="mb-28">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        {/* Left rail — byline */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="md:col-span-3"
        >
          <p
            className="text-[10px] font-bold uppercase tracking-[0.24em] mb-3"
            style={{ color: accent }}
          >
            The Story
          </p>
          <p className="font-headline font-black text-2xl tracking-tight leading-tight" style={{ color: headingColor }}>
            {byline}
          </p>
          <p className="text-sm mt-1" style={{ color: mutedColor }}>
            {role}
          </p>
          <div className="h-px my-4" style={{ background: ruleColor }} />
          <p className="text-[13px] font-mono leading-relaxed" style={{ color: bodyColor }}>
            {dealLine}
          </p>
        </motion.div>

        {/* Right — running text */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="md:col-span-9"
        >
          <div
            className="text-[19px] md:text-[20px] leading-[1.65] editorial"
            style={{ color: bodyColor }}
          >
            {body}
          </div>

          {/* KPI strip */}
          <div className="mt-10 grid grid-cols-3 gap-6 md:gap-8">
            {kpis.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="border-t pt-4"
                style={{ borderColor: ruleColor }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
                  style={{ color: mutedColor }}
                >
                  {kpi.label}
                </p>
                <p
                  className="font-headline font-black tracking-tight"
                  style={{
                    fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                    color: i === kpis.length - 1 ? accent : headingColor,
                    lineHeight: 1,
                  }}
                >
                  {kpi.value}
                </p>
                {kpi.sub && (
                  <p className="text-xs mt-2" style={{ color: mutedColor }}>
                    {kpi.sub}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   BrandedTermCard — Baseline™ / Blind Equity™ / The Rundown™
   These are visible PRODUCTS with definition + example + CTA.
   Not a card grid item — designed to stand alone or paired.
   ════════════════════════════════════════════════════════════ */
export function BrandedTermCard({
  term,
  trademark = '™',
  oneLiner,
  definition,
  example,
  onCTA,
  ctaLabel = 'Talk to Yulia',
  variant = 'light',
  dark,
}: {
  term: string;            // "Baseline" — no trademark, that's added separately
  trademark?: string;
  oneLiner: string;
  definition: string;
  example: string;
  onCTA?: () => void;
  ctaLabel?: string;
  variant?: 'light' | 'dark';
  dark: boolean;
}) {
  const isDark = variant === 'dark';
  const bg = isDark ? '#0f1012' : (dark ? '#1a1c1e' : '#f9f7f1');
  const border = isDark ? 'rgba(255,255,255,0.08)' : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.08)');
  const headingColor = isDark || dark ? '#f9f9fc' : '#0f1012';
  const bodyColor = isDark || dark ? 'rgba(218,218,220,0.78)' : '#3c3d40';
  const mutedColor = isDark || dark ? 'rgba(218,218,220,0.5)' : '#7c7d80';
  const accent = dark || isDark ? PINK_DARK : PINK;

  return (
    <div
      className="rounded-2xl p-8 md:p-10 relative overflow-hidden"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      {/* Subtle accent corner */}
      <div
        aria-hidden
        className="absolute top-0 right-0 w-32 h-32 opacity-[0.06] pointer-events-none"
        style={{
          background: `radial-gradient(circle at top right, ${accent}, transparent 70%)`,
        }}
      />

      <p
        className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3"
        style={{ color: accent }}
      >
        smbx.ai product
      </p>

      <h3
        className="font-headline font-black tracking-[-0.02em] mb-4"
        style={{
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          color: headingColor,
          lineHeight: 1,
        }}
      >
        {term}
        <span
          className="text-base font-bold align-top ml-1"
          style={{ color: accent, fontSize: '0.4em' }}
        >
          {trademark}
        </span>
      </h3>

      <p
        className="text-lg md:text-xl font-medium mb-6"
        style={{ color: headingColor, lineHeight: 1.4 }}
      >
        {oneLiner}
      </p>

      <p className="text-[15px] leading-relaxed mb-5" style={{ color: bodyColor }}>
        {definition}
      </p>

      <div
        className="rounded-xl p-4 mb-6 text-[13px] leading-relaxed"
        style={{
          background: dark || isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,16,18,0.04)',
          color: bodyColor,
        }}
      >
        <span className="font-bold uppercase tracking-wider text-[10px] block mb-1.5" style={{ color: mutedColor }}>
          Example
        </span>
        {example}
      </div>

      {onCTA && (
        <button
          onClick={onCTA}
          className="text-sm font-bold inline-flex items-center gap-2 group"
          style={{ color: accent, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          {ctaLabel}
          <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-0.5">
            arrow_forward
          </span>
        </button>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   SlowVsFast — visual contrast block
   Asymmetric (not 50/50). Slow side is desaturated, Fast is bold.
   No card grid. Editorial layout with running rule between.
   ════════════════════════════════════════════════════════════ */
export function SlowVsFast({
  slowLabel,
  slowItems,
  fastLabel,
  fastItems,
  takeaway,
  dark,
}: {
  slowLabel: string;
  slowItems: { metric: string; value: string }[];
  fastLabel: string;
  fastItems: { metric: string; value: string }[];
  takeaway: ReactNode;
  dark: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const headingColor = dark ? '#f9f9fc' : '#0f1012';
  const mutedColor = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const ruleColor = dark ? 'rgba(255,255,255,0.1)' : 'rgba(15,16,18,0.12)';
  const accent = dark ? PINK_DARK : PINK;

  return (
    <section ref={ref} className="mb-28">
      <p
        className="text-[10px] font-bold uppercase tracking-[0.24em] mb-10"
        style={{ color: accent }}
      >
        The way it's been &nbsp;→&nbsp; with Yulia
      </p>

      <div className="grid grid-cols-1 md:grid-cols-11 gap-8 md:gap-8">
        {/* Slow side — 5 of 11 cols (symmetric with fast side) */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="md:col-span-5"
        >
          <p
            className="text-xs font-bold uppercase tracking-[0.18em] mb-6 opacity-50"
            style={{ color: headingColor }}
          >
            {slowLabel}
          </p>
          <div className="space-y-5">
            {slowItems.map((item) => (
              <div key={item.metric} className="opacity-50">
                <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: mutedColor }}>
                  {item.metric}
                </p>
                <p
                  className="font-headline font-black line-through decoration-2"
                  style={{
                    fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
                    color: headingColor,
                    lineHeight: 1.1,
                    textDecorationColor: dark ? 'rgba(218,218,220,0.4)' : 'rgba(15,16,18,0.3)',
                  }}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Vertical rule (desktop only) */}
        <div className="hidden md:flex md:col-span-1 justify-center">
          <div className="w-px h-full" style={{ background: ruleColor }} />
        </div>

        {/* Fast side — 5 of 11 cols (symmetric with slow side) */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="md:col-span-5"
        >
          <p
            className="text-xs font-bold uppercase tracking-[0.18em] mb-6"
            style={{ color: accent }}
          >
            {fastLabel}
          </p>
          <div className="space-y-5">
            {fastItems.map((item, i) => (
              <motion.div
                key={item.metric}
                initial={{ opacity: 0, y: 8 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.25 + i * 0.08 }}
              >
                <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: mutedColor }}>
                  {item.metric}
                </p>
                <p
                  className="font-headline font-black"
                  style={{
                    fontSize: 'clamp(1.75rem, 3.2vw, 2.5rem)',
                    color: headingColor,
                    lineHeight: 1.1,
                  }}
                >
                  {item.value}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Takeaway */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-12 max-w-2xl text-[17px] md:text-[19px] font-medium leading-snug"
        style={{ color: headingColor }}
      >
        {takeaway}
      </motion.p>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   SignOffChain — the deal-operator workflow block
   Renders 5 numbered chain steps that show how Yulia drafts → routes →
   waits → executes → logs. Used on every journey page to back the
   "Yulia runs your deal" claim with the actual chain that exists in code.
   ════════════════════════════════════════════════════════════ */
export function SignOffChain({
  intro,
  steps,
  bottomNote,
  dark,
}: {
  intro: ReactNode;
  steps: { label: string; yulia: string; chain: string }[];
  bottomNote: ReactNode;
  dark: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const headingColor = dark ? '#f9f9fc' : '#0f1012';
  const bodyColor = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedColor = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const ruleColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const accent = dark ? PINK_DARK : PINK;

  return (
    <section ref={ref} className="mb-28">
      <p
        className="text-[10px] font-bold uppercase tracking-[0.24em] mb-4"
        style={{ color: accent }}
      >
        Sign-off chain · Yulia runs the workflow
      </p>
      <h2
        className="font-headline font-black tracking-[-0.025em] leading-[1] mb-4 max-w-3xl"
        style={{
          fontSize: 'clamp(1.875rem, 4vw, 3rem)',
          color: headingColor,
        }}
      >
        Yulia drafts. Routes. Waits. Executes. Logs.
      </h2>
      <p
        className="max-w-3xl text-[16px] md:text-[18px] leading-[1.6] mb-12"
        style={{ color: bodyColor }}
      >
        {intro}
      </p>

      {/* The 5 steps as a horizontal timeline on desktop, vertical on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-0 mb-10">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative md:border-r md:last:border-r-0 px-0 md:px-5 first:pl-0 last:pr-0 py-4 md:py-0"
            style={{ borderRightColor: ruleColor, borderTop: i > 0 ? `1px solid ${ruleColor}` : 'none' }}
          >
            {/* Step number */}
            <div className="flex items-baseline gap-2 mb-3">
              <span
                className="font-headline font-black tabular-nums"
                style={{
                  fontSize: '1.5rem',
                  color: accent,
                  lineHeight: 0.95,
                }}
              >
                0{i + 1}
              </span>
              <span
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: mutedColor }}
              >
                {step.label}
              </span>
            </div>
            {/* Yulia action */}
            <p
              className="text-[14px] font-bold mb-2"
              style={{ color: headingColor, lineHeight: 1.3 }}
            >
              {step.yulia}
            </p>
            {/* Chain detail */}
            <p
              className="text-[12px] leading-relaxed"
              style={{ color: mutedColor }}
            >
              {step.chain}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Bottom note */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="max-w-3xl text-[15px] md:text-[16px] italic leading-relaxed border-l-4 pl-5"
        style={{ color: bodyColor, borderColor: accent }}
      >
        {bottomNote}
      </motion.p>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   SectionHeader — small reusable label/heading combo
   ════════════════════════════════════════════════════════════ */
export function SectionHeader({
  label,
  title,
  sub,
  dark,
}: {
  label: string;
  title: ReactNode;
  sub?: ReactNode;
  dark: boolean;
}) {
  const accent = dark ? PINK_DARK : PINK;
  const headingColor = dark ? '#f9f9fc' : '#0f1012';
  const mutedColor = dark ? 'rgba(218,218,220,0.7)' : '#5d5e61';
  return (
    <div className="mb-12">
      <p
        className="text-[10px] font-bold uppercase tracking-[0.24em] mb-4"
        style={{ color: accent }}
      >
        {label}
      </p>
      <h2
        className="font-headline font-black tracking-[-0.025em] leading-[1] mb-4"
        style={{
          fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
          color: headingColor,
        }}
      >
        {title}
      </h2>
      {sub && (
        <p
          className="max-w-2xl text-[17px] md:text-[19px] leading-[1.55]"
          style={{ color: mutedColor }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   PageCTA — bottom-of-page action.
   Each page passes its own action verb so they're not all
   "Talk to Yulia" gradient buttons.
   ════════════════════════════════════════════════════════════ */
export function PageCTA({
  headline,
  sub,
  buttonLabel,
  onClick,
  dark,
}: {
  headline: ReactNode;
  sub: string;
  buttonLabel: string;
  onClick: () => void;
  dark: boolean;
}) {
  const accent = dark ? PINK_DARK : PINK;
  return (
    <section className="mb-12 mt-12">
      <div
        className="rounded-3xl p-10 md:p-16 relative overflow-hidden"
        style={{
          background: dark ? '#0f1012' : '#0f1012',
          border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'transparent'}`,
        }}
      >
        {/* Soft glow */}
        <div
          aria-hidden
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${accent}33, transparent 60%)`,
            filter: 'blur(20px)',
          }}
        />

        <div className="relative z-10 max-w-3xl">
          <h2
            className="font-headline font-black text-white tracking-[-0.03em] leading-[0.98] mb-5"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)' }}
          >
            {headline}
          </h2>
          <p className="text-[17px] md:text-[19px] mb-10 max-w-xl" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {sub}
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <button
              onClick={onClick}
              className="group inline-flex items-center gap-3 px-7 py-4 rounded-full font-bold text-base text-white transition-all"
              style={{
                background: accent,
                border: 'none',
                cursor: 'pointer',
                boxShadow: `0 10px 30px -10px ${accent}aa`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              }}
            >
              {buttonLabel}
              <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-0.5">
                arrow_forward
              </span>
            </button>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Free · No account required · Your data stays yours
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
