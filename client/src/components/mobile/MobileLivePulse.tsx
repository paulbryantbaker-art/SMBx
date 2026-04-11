/**
 * MobileLivePulse.tsx
 *
 * Subtle ambient indicator on the mobile chat home that rotates through
 * "what Yulia is doing right now" snippets. Grok-style live pulse with
 * fade transitions. Sits in the dead space between the hero and the
 * starter chips, giving the home screen presence and motion without
 * cluttering the chat-first surface.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

const SNIPPETS = [
  'scoring a $48M EBITDA MSP in Texas',
  'modeling a 6× cap stack on a $180M deal',
  'drafting a CIM for a specialty distributor',
  'finding $1.8M of Blind Equity in a P&L',
  'routing an LOI to counsel for sign-off',
  'comping insurance brokerage at 12.5×',
  'building a 180-day plan for a fresh close',
  'running The Rundown on a $260M target',
  'pricing a partial liquidity event with PE',
  'auditing a search fund cap stack model',
];

export function MobileLivePulse({ dark }: { dark: boolean }) {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * SNIPPETS.length));

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((prev) => (prev + 1) % SNIPPETS.length);
    }, 4200);
    return () => clearInterval(id);
  }, []);

  const pinkC = dark ? PINK_DARK : PINK;
  const mutedC = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const headingC = dark ? 'rgba(249,249,252,0.78)' : '#3c3d40';

  return (
    <div className="px-6 mt-6 flex justify-center">
      <div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
        style={{
          background: dark ? 'rgba(232,112,154,0.06)' : 'rgba(212,74,120,0.05)',
          border: `1px solid ${dark ? 'rgba(232,112,154,0.16)' : 'rgba(212,74,120,0.14)'}`,
          maxWidth: '100%',
        }}
      >
        <span
          className="inline-block w-1.5 h-1.5 rounded-full shrink-0 animate-pulse-dot"
          style={{
            background: pinkC,
            boxShadow: `0 0 8px ${pinkC}`,
          }}
        />
        <span
          className="text-[10px] font-bold uppercase tracking-wider shrink-0"
          style={{ color: pinkC }}
        >
          live
        </span>
        <span
          className="text-[11px] font-mono truncate"
          style={{ color: mutedC }}
        >
          Yulia is
        </span>
        <div className="overflow-hidden flex-1 min-w-0" style={{ maxWidth: 240 }}>
          <AnimatePresence mode="wait">
            <motion.span
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="block text-[11px] font-mono truncate"
              style={{ color: headingC }}
            >
              {SNIPPETS[idx]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
