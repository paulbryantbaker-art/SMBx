/**
 * LearnDrawer.tsx
 *
 * Bottom-up Vaul drawer that lists the 7 learn-more destinations.
 * Triggered by the "How can Yulia help me?" link below the chat home chips.
 *
 * Each destination is a tap target that opens the corresponding
 * mobile journey sheet (Sell / Buy / Raise / Integrate / Advisors / How / Pricing).
 *
 * Grok-meets-Canva: dark, big editorial typography, mono accents,
 * subtle pink-tinted dividers, spring-physics drag.
 */

import { Drawer } from 'vaul';
import { motion } from 'framer-motion';
import type { LearnDest } from './MobileSidebar';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dark: boolean;
  onPick: (dest: LearnDest) => void;
}

interface LearnEntry {
  id: LearnDest;
  label: string;
  hook: string;
  icon: string;
}

const ENTRIES: LearnEntry[] = [
  {
    id: 'sell',
    label: 'Sell',
    hook: 'Walk in with the number. Win the mandate.',
    icon: 'sell',
  },
  {
    id: 'buy',
    label: 'Buy',
    hook: 'Kill 100 bad deals before lunch.',
    icon: 'shopping_cart',
  },
  {
    id: 'raise',
    label: 'Raise',
    hook: 'Get the capital. Keep the company.',
    icon: 'savings',
  },
  {
    id: 'integrate',
    label: 'Integrate',
    hook: 'The deal closed. Now make it pay.',
    icon: 'merge',
  },
  {
    id: 'advisors',
    label: 'Advisors',
    hook: 'Win the pitch. Win the deal. Get paid.',
    icon: 'workspace_premium',
  },
  {
    id: 'how-it-works',
    label: 'How it works',
    hook: 'Six engines. 22 gates. One conversation.',
    icon: 'auto_awesome',
  },
  {
    id: 'pricing',
    label: 'Pricing',
    hook: 'Investment bank power. Software pricing.',
    icon: 'payments',
  },
];

export function LearnDrawer({ open, onOpenChange, dark, onPick }: Props) {
  const bg       = dark ? '#151617' : '#fefefe';
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const bodyC    = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedC   = dark ? 'rgba(218,218,220,0.55)'  : '#7c7d80';
  const ruleC    = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.06)';
  const pinkC    = dark ? PINK_DARK : PINK;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} shouldScaleBackground>
      <Drawer.Portal>
        <Drawer.Overlay
          className="fixed inset-0 z-[100]"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
        />
        <Drawer.Content
          className="fixed left-0 right-0 bottom-0 z-[101] outline-none flex flex-col"
          style={{
            background: bg,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: '92vh',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            boxShadow: '0 -20px 60px -20px rgba(0,0,0,0.6)',
          }}
        >
          <Drawer.Title className="sr-only">How Yulia helps</Drawer.Title>
          <Drawer.Description className="sr-only">
            Pick a journey to learn how Yulia runs that part of your deal
          </Drawer.Description>

          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2 shrink-0">
            <div
              className="w-12 h-1.5 rounded-full"
              style={{ background: dark ? 'rgba(255,255,255,0.18)' : 'rgba(15,16,18,0.18)' }}
            />
          </div>

          {/* Header */}
          <div className="px-7 pt-3 pb-5 shrink-0">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.22em] mb-2"
              style={{ color: pinkC }}
            >
              How Yulia helps
            </p>
            <h2
              className="font-headline font-black tracking-[-0.025em] leading-[1] mb-3"
              style={{
                fontSize: 'clamp(1.875rem, 7vw, 2.75rem)',
                color: headingC,
              }}
            >
              Pick a job. <br />
              <em className="not-italic" style={{ color: pinkC }}>I'll show you.</em>
            </h2>
            <p className="text-[14px] leading-relaxed" style={{ color: bodyC }}>
              Whatever you came here to do, Yulia handles the analytical layer end-to-end.
              Tap a journey for the full breakdown — or just start a chat from the home screen.
            </p>
          </div>

          {/* Entries */}
          <div className="flex-1 overflow-y-auto px-4 pb-6 mobile-scroll">
            {ENTRIES.map((entry, i) => (
              <motion.button
                key={entry.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: 0.15 + i * 0.06,
                  ease: [0.32, 0.72, 0, 1],
                }}
                onClick={() => {
                  onPick(entry.id);
                  onOpenChange(false);
                }}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl mb-1 transition-all active:scale-[0.985]"
                style={{
                  background: 'transparent',
                  border: `1px solid ${ruleC}`,
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: dark ? 'rgba(232,112,154,0.10)' : 'rgba(212,74,120,0.08)',
                    border: `1px solid ${dark ? 'rgba(232,112,154,0.20)' : 'rgba(212,74,120,0.18)'}`,
                  }}
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ color: pinkC }}>
                    {entry.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p
                    className="font-headline font-black text-[16px] tracking-tight mb-0.5"
                    style={{ color: headingC, lineHeight: 1.15 }}
                  >
                    {entry.label}
                  </p>
                  <p className="text-[12px] leading-snug" style={{ color: mutedC }}>
                    {entry.hook}
                  </p>
                </div>
                <span className="material-symbols-outlined text-[18px] shrink-0" style={{ color: mutedC }}>
                  arrow_forward
                </span>
              </motion.button>
            ))}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
