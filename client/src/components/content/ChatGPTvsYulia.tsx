/**
 * ChatGPTvsYulia.tsx
 * Side-by-side comparison block.
 * Header: "ChatGPT can answer your questions. Yulia can close your deal."
 *
 * Used on the pricing page as the deal-operator differentiation argument.
 * Every row reflects a feature that EXISTS in the SMBx codebase today
 * (review_requests, document state machine, deal_activity_log, share_links,
 * multi-party participants). No aspirational claims.
 */

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

type Row = {
  feature: string;
  detail: string;
  chatgpt: 'yes' | 'no';
  yulia: 'yes';
};

const ROWS: Row[] = [
  {
    feature: 'Drafts a CIM from your financials',
    detail: '25-40 pages, sector-specific structure, real comp data',
    chatgpt: 'yes',
    yulia: 'yes',
  },
  {
    feature: 'Remembers your deal next week',
    detail: 'Persistent deal state, gate progression, document register',
    chatgpt: 'no',
    yulia: 'yes',
  },
  {
    feature: 'Routes the CIM to your attorney with focus areas',
    detail: '"Look at non-compete in §4.2, working capital peg in §3.1"',
    chatgpt: 'no',
    yulia: 'yes',
  },
  {
    feature: 'Holds the LOI in queue until your attorney signs off',
    detail: 'State machine: draft → review → approved → agreed → executed',
    chatgpt: 'no',
    yulia: 'yes',
  },
  {
    feature: 'Tracks which add-back schedule your CPA approved',
    detail: 'review_requests record with reviewer notes and timestamps',
    chatgpt: 'no',
    yulia: 'yes',
  },
  {
    feature: 'Sends the teaser to your buyer pool from your account',
    detail: 'share_document with watermarks, expiration, NDA gates, view tracking',
    chatgpt: 'no',
    yulia: 'yes',
  },
  {
    feature: 'SHA-256 hashes the executed legal doc',
    detail: 'Notarized in the database, immutable forever, third-party verifiable',
    chatgpt: 'no',
    yulia: 'yes',
  },
  {
    feature: "Shows the buyer's lawyer the chain of custody",
    detail: 'Every action in deal_activity_log with actor, timestamp, IP',
    chatgpt: 'no',
    yulia: 'yes',
  },
  {
    feature: 'Manages your CPA, attorney, broker, and lender on one deal',
    detail: 'Three-circle model, role-based access, NDA tracking, day passes',
    chatgpt: 'no',
    yulia: 'yes',
  },
  {
    feature: 'Survives "where did this number come from?" in DD',
    detail: 'Full provenance trail back to source documents and reviewers',
    chatgpt: 'no',
    yulia: 'yes',
  },
];

export function ChatGPTvsYulia({ dark }: { dark: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  // Colors
  const bg = dark ? '#0f1012' : '#f9f7f1';
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const ruleColor = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.07)';
  const headingColor = dark ? '#f9f9fc' : '#0f1012';
  const bodyColor = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedColor = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const accent = dark ? PINK_DARK : PINK;

  return (
    <div
      ref={ref}
      className="rounded-2xl p-6 md:p-10"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      {/* Header */}
      <div className="mb-10 max-w-3xl">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3"
          style={{ color: accent }}
        >
          The actual difference
        </p>
        <h3
          className="font-headline font-black tracking-[-0.02em] leading-[1.02]"
          style={{
            fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
            color: headingColor,
          }}
        >
          ChatGPT can answer your questions.<br />
          Yulia can <em className="not-italic" style={{ color: accent }}>close your deal.</em>
        </h3>
        <p
          className="mt-4 text-[16px] md:text-[17px] leading-relaxed"
          style={{ color: bodyColor }}
        >
          ChatGPT is a stateless thinking partner — no memory of your deal, no participants,
          no audit trail, no enforcement of sign-offs, no chain of custody when the buyer's
          lawyer asks where a number came from. Yulia is a deal operator with the workflow baked in.
        </p>
      </div>

      {/* Header row */}
      <div
        className="grid grid-cols-12 gap-4 pb-4 mb-2"
        style={{ borderBottom: `2px solid ${ruleColor}` }}
      >
        <div className="col-span-6 md:col-span-7">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ color: mutedColor }}
          >
            Feature
          </p>
        </div>
        <div className="col-span-3 md:col-span-2 text-center">
          <p
            className="text-[12px] md:text-[14px] font-bold"
            style={{ color: mutedColor }}
          >
            ChatGPT
          </p>
        </div>
        <div className="col-span-3 md:col-span-3 text-center">
          <p
            className="text-[12px] md:text-[14px] font-bold"
            style={{ color: accent }}
          >
            Yulia
          </p>
        </div>
      </div>

      {/* Rows */}
      <div>
        {ROWS.map((row, i) => (
          <motion.div
            key={row.feature}
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-12 gap-4 py-4"
            style={{ borderTop: `1px solid ${ruleColor}` }}
          >
            {/* Feature + detail */}
            <div className="col-span-6 md:col-span-7">
              <p
                className="text-[14px] md:text-[15px] font-bold mb-1"
                style={{ color: headingColor }}
              >
                {row.feature}
              </p>
              <p
                className="text-[11px] md:text-[12px] leading-relaxed"
                style={{ color: mutedColor }}
              >
                {row.detail}
              </p>
            </div>

            {/* ChatGPT cell */}
            <div className="col-span-3 md:col-span-2 flex items-start justify-center pt-1">
              {row.chatgpt === 'yes' ? (
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{ color: dark ? 'rgba(218,218,220,0.5)' : '#9ca3af' }}
                >
                  check
                </span>
              ) : (
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{ color: dark ? 'rgba(218,218,220,0.25)' : '#d1d5db' }}
                >
                  close
                </span>
              )}
            </div>

            {/* Yulia cell */}
            <div className="col-span-3 md:col-span-3 flex items-start justify-center pt-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: accent }}
              >
                <span
                  className="material-symbols-outlined text-[16px]"
                  style={{ color: 'white' }}
                >
                  check
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom takeaway */}
      <div
        className="mt-10 pt-8"
        style={{ borderTop: `2px solid ${ruleColor}` }}
      >
        <p
          className="font-headline font-black leading-[1.15] max-w-2xl"
          style={{
            fontSize: 'clamp(1.5rem, 2.4vw, 2rem)',
            color: headingColor,
            letterSpacing: '-0.02em',
          }}
        >
          ChatGPT writes paragraphs. Yulia <em className="not-italic" style={{ color: accent }}>runs the chain</em> —
          drafts, routes, reviews, signs, executes, audits. The thing your buyer's lawyer asks about
          three years from now is in the database, not in someone's email.
        </p>
      </div>
    </div>
  );
}
