/**
 * StarterChips.tsx
 *
 * Horizontal scrollable chip row above the chat input on mobile.
 * Each chip pre-fills the chat input with a journey opener.
 * Below the chips: a "How can Yulia help me?" link that opens
 * the LearnDrawer (Vaul bottom sheet).
 *
 * Grok-meets-Canva: dark, soft pink-tinted chip backgrounds,
 * spring entrance animations, generous touch targets, mono accents.
 */

import { motion } from 'framer-motion';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

export interface StarterChip {
  icon: string;        // material-symbols-outlined name
  label: string;
  fill: string;        // text to pre-fill the input with
}

const CHIPS: StarterChip[] = [
  {
    icon: 'sell',
    label: 'Sell my business',
    fill: 'I want to sell my business — ',
  },
  {
    icon: 'shopping_cart',
    label: 'Buy a business',
    fill: 'I want to buy a business — ',
  },
  {
    icon: 'savings',
    label: 'Raise capital',
    fill: 'I need to raise capital — ',
  },
  {
    icon: 'merge',
    label: 'Just closed',
    fill: 'I just closed an acquisition — ',
  },
  {
    icon: 'workspace_premium',
    label: "I'm an advisor",
    fill: "I'm an M&A advisor / broker / CPA / attorney — ",
  },
];

interface Props {
  dark: boolean;
  onChipTap: (fill: string) => void;
  onLearnTap: () => void;
}

export function StarterChips({ dark, onChipTap, onLearnTap }: Props) {
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const bodyC    = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedC   = dark ? 'rgba(218,218,220,0.55)'  : '#7c7d80';
  const pinkC    = dark ? PINK_DARK : PINK;
  const chipBg   = dark ? '#1f2123' : '#ffffff';
  const chipBd   = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const tintBd   = dark ? 'rgba(232,112,154,0.20)' : 'rgba(212,74,120,0.18)';

  return (
    <div className="w-full">
      {/* Horizontal scrolling chip row */}
      <div
        className="flex gap-2 overflow-x-auto pb-1.5 mobile-scroll-x"
        style={{
          paddingLeft: 16,
          paddingRight: 16,
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',           /* Firefox */
          msOverflowStyle: 'none',          /* IE/Edge */
        }}
      >
        {CHIPS.map((chip, i) => (
          <motion.button
            key={chip.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.05, ease: [0.32, 0.72, 0, 1] }}
            onClick={() => onChipTap(chip.fill)}
            className="flex items-center gap-1.5 px-4 h-10 rounded-full shrink-0 active:scale-[0.96] transition-transform"
            style={{
              background: chipBg,
              border: `1px solid ${chipBd}`,
              color: bodyC,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              scrollSnapAlign: 'start',
              boxShadow: dark
                ? '0 2px 8px -2px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.2)'
                : '0 2px 8px -2px rgba(15,16,18,0.06), 0 1px 2px rgba(15,16,18,0.04)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = tintBd;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = chipBd;
            }}
          >
            <span className="material-symbols-outlined text-[16px]" style={{ color: pinkC }}>
              {chip.icon}
            </span>
            <span className="text-[13px] font-bold tracking-tight whitespace-nowrap" style={{ color: headingC }}>
              {chip.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* "How can Yulia help me?" link — opens the LearnDrawer */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45, ease: [0.32, 0.72, 0, 1] }}
        className="flex items-center justify-center mt-3 mb-2"
      >
        <button
          onClick={onLearnTap}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold tracking-tight transition-all active:scale-[0.97]"
          style={{
            background: 'transparent',
            color: mutedC,
            border: 'none',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <span className="material-symbols-outlined text-[14px]" style={{ color: pinkC }}>
            auto_awesome
          </span>
          How can Yulia help me?
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </button>
      </motion.div>
    </div>
  );
}
