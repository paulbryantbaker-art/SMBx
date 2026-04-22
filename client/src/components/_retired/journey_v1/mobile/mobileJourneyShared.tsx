/**
 * mobileJourneyShared.tsx
 *
 * Shared editorial primitives for mobile journey pages.
 * Vertical-first, big editorial typography, pink accents, spring entrances.
 */

import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

/* ────────────────────────────────────────────────────────── */

/** Editorial story card with byline + role + body + KPIs */
export function MobileStoryCard({
  byline,
  role,
  dealLine,
  body,
  dark,
}: {
  byline: string;
  role: string;
  dealLine: string;
  body: ReactNode;
  dark: boolean;
}) {
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const bodyC    = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedC   = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const ruleC    = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.08)';
  const cardBg   = dark ? '#1f2123' : '#ffffff';

  return (
    <div
      className="rounded-3xl p-6"
      style={{ background: cardBg, border: `1px solid ${ruleC}` }}
    >
      <div className="mb-5">
        <p
          className="font-headline font-black text-2xl tracking-tight mb-1"
          style={{ color: headingC }}
        >
          {byline}
        </p>
        <p className="text-[12px]" style={{ color: mutedC }}>{role}</p>
        <p className="text-[11px] font-mono mt-2" style={{ color: bodyC }}>{dealLine}</p>
      </div>
      <div className="space-y-4 text-[15px] leading-[1.65]" style={{ color: bodyC }}>
        {body}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */

/** Vertical sign-off chain — 5 numbered steps with rule between */
export function MobileSignOffChain({
  intro,
  steps,
  bottomNote,
  dark,
}: {
  intro: ReactNode;
  steps: { label: string; text: string }[];
  bottomNote?: ReactNode;
  dark: boolean;
}) {
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const bodyC    = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedC   = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const ruleC    = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.08)';
  const pinkC    = dark ? PINK_DARK : PINK;

  return (
    <div>
      <p className="text-[15px] leading-[1.6] mb-6" style={{ color: bodyC }}>
        {intro}
      </p>
      <div className="space-y-0">
        {steps.map((step, i) => {
          const n = String(i + 1).padStart(2, '0');
          return (
            <motion.div
              key={n}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.45, delay: i * 0.05, ease: [0.32, 0.72, 0, 1] }}
              className="flex gap-4"
            >
              <div className="shrink-0 flex flex-col items-center">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-headline font-black text-[11px] tabular-nums"
                  style={{
                    background: dark ? 'rgba(232,112,154,0.10)' : 'rgba(212,74,120,0.08)',
                    border: `1px solid ${dark ? 'rgba(232,112,154,0.20)' : 'rgba(212,74,120,0.18)'}`,
                    color: pinkC,
                  }}
                >
                  {n}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className="w-px flex-1 mt-1"
                    style={{ background: ruleC, minHeight: 24 }}
                  />
                )}
              </div>
              <div className="flex-1 pb-4">
                <p
                  className="text-[11px] font-bold uppercase tracking-[0.18em] mb-1"
                  style={{ color: pinkC }}
                >
                  {step.label}
                </p>
                <p className="text-[14px] leading-[1.55]" style={{ color: bodyC }}>
                  {step.text}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
      {bottomNote && (
        <p
          className="mt-4 text-[14px] italic leading-[1.55] border-l-4 pl-4"
          style={{ color: mutedC, borderColor: pinkC }}
        >
          {bottomNote}
        </p>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */

/** Vertical slow-vs-fast comparison rows */
export function MobileSlowVsFast({
  rows,
  takeaway,
  dark,
}: {
  rows: { label: string; cold: string; prepared: string }[];
  takeaway?: ReactNode;
  dark: boolean;
}) {
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const bodyC    = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedC   = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const ruleC    = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.08)';
  const cardBg   = dark ? '#1f2123' : '#ffffff';
  const pinkC    = dark ? PINK_DARK : PINK;

  return (
    <div>
      <div className="grid grid-cols-1 gap-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="rounded-2xl p-4"
            style={{ background: cardBg, border: `1px solid ${ruleC}` }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2.5"
              style={{ color: mutedC }}
            >
              {row.label}
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p
                  className="font-headline font-black text-lg tracking-tight line-through opacity-50 tabular-nums"
                  style={{ color: headingC }}
                >
                  {row.cold}
                </p>
              </div>
              <span className="material-symbols-outlined text-[18px]" style={{ color: pinkC }}>
                arrow_forward
              </span>
              <div className="flex-1 text-right">
                <p
                  className="font-headline font-black text-xl tracking-tight tabular-nums"
                  style={{ color: pinkC }}
                >
                  {row.prepared}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {takeaway && (
        <p
          className="mt-5 text-[14px] italic leading-[1.55] border-l-4 pl-4"
          style={{ color: bodyC, borderColor: pinkC }}
        >
          {takeaway}
        </p>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */

/** Mobile-native ChatGPT vs Yulia — vertical card stack */
export function MobileChatGPTvsYulia({ dark }: { dark: boolean }) {
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const bodyC    = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedC   = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const ruleC    = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.08)';
  const cardBg   = dark ? '#1f2123' : '#ffffff';
  const pinkC    = dark ? PINK_DARK : PINK;

  const ROWS: { feature: string; detail: string; chatgpt: 'yes' | 'no' }[] = [
    { feature: 'Drafts a CIM',                                  detail: '25-40 pages, sector-specific, real comp data',      chatgpt: 'yes' },
    { feature: 'Remembers your deal next week',                detail: 'Persistent state, gate progression',                 chatgpt: 'no' },
    { feature: 'Routes documents to your attorney',             detail: 'request_review with focus areas',                   chatgpt: 'no' },
    { feature: 'Holds the LOI until counsel signs off',         detail: 'State machine: draft → review → approved → executed', chatgpt: 'no' },
    { feature: 'Sends teasers to your buyer pool',              detail: 'share_document with watermarks + view tracking',     chatgpt: 'no' },
    { feature: 'SHA-256 hashes the executed legal doc',         detail: 'Notarized in the database, immutable forever',       chatgpt: 'no' },
    { feature: "Survives the buyer's lawyer in DD",             detail: 'Audit log answers provenance in 30 seconds',         chatgpt: 'no' },
  ];

  return (
    <div className="space-y-3">
      {ROWS.map((row, i) => (
        <motion.div
          key={row.feature}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4, delay: i * 0.04, ease: [0.32, 0.72, 0, 1] }}
          className="rounded-2xl p-4"
          style={{ background: cardBg, border: `1px solid ${ruleC}` }}
        >
          <p className="text-[14px] font-bold mb-1" style={{ color: headingC }}>
            {row.feature}
          </p>
          <p className="text-[11px] mb-3" style={{ color: mutedC }}>
            {row.detail}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2">
              <span
                className="material-symbols-outlined text-[16px]"
                style={{ color: row.chatgpt === 'yes' ? mutedC : (dark ? 'rgba(218,218,220,0.25)' : '#d1d5db') }}
              >
                {row.chatgpt === 'yes' ? 'check' : 'close'}
              </span>
              <span className="text-[11px] font-bold" style={{ color: mutedC }}>ChatGPT</span>
            </div>
            <div className="flex-1 flex items-center gap-2 justify-end">
              <span className="text-[11px] font-bold" style={{ color: pinkC }}>Yulia</span>
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: pinkC }}
              >
                <span className="material-symbols-outlined text-[14px]" style={{ color: 'white' }}>
                  check
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
      <p className="text-[14px] italic leading-[1.55] mt-4 px-1" style={{ color: bodyC }}>
        ChatGPT writes paragraphs. <strong style={{ color: pinkC }}>Yulia runs the chain.</strong>{' '}
        Drafts, routes, reviews, signs, executes, audits.
      </p>
    </div>
  );
}
