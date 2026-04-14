/**
 * DealContextChips — the chip row above the mobile pill, context-aware.
 *
 * Empty portfolio → full journey-starter chips (Sell / Buy / Raise / PMI /
 *   Advisor) matching the pattern prospects expect when discovering the app.
 * Active portfolio → a compact "Start a new deal" chip only. The DealStack
 *   above already handles "resume" via card tap; duplicating it here is
 *   clutter.
 *
 * Mobile only. Renders inside the portaled home pill wrapper above the pill.
 */

import { motion } from 'framer-motion';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

interface ChipSpec {
  icon: string;
  label: string;
  fill: string;
}

const JOURNEY_CHIPS: ChipSpec[] = [
  { icon: 'sell', label: 'Sell my business', fill: 'I want to sell my business — ' },
  { icon: 'shopping_cart', label: 'Buy a business', fill: 'I want to buy a business — ' },
  { icon: 'savings', label: 'Raise capital', fill: 'I need to raise capital — ' },
  { icon: 'merge', label: 'Just closed', fill: 'I just closed an acquisition — ' },
  { icon: 'workspace_premium', label: "I'm an advisor", fill: "I'm an M&A advisor / broker / CPA / attorney — " },
];

const ACTIVE_PORTFOLIO_CHIPS: ChipSpec[] = [
  { icon: 'add', label: 'New deal', fill: 'I want to start a new deal — ' },
  { icon: 'search', label: 'Find a deal', fill: 'Help me find a deal in my portfolio — ' },
  { icon: 'auto_awesome', label: 'Ask anything', fill: '' },
];

interface Props {
  dark: boolean;
  hasDeals: boolean;
  onChipTap: (fill: string) => void;
}

export function DealContextChips({ dark, hasDeals, onChipTap }: Props) {
  const pinkC = dark ? PINK_DARK : PINK;
  const chipBg = dark ? '#1f2123' : '#ffffff';
  const chipBd = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const chipText = dark ? 'rgba(240,240,243,0.92)' : '#1a1c1e';

  const chips = hasDeals ? ACTIVE_PORTFOLIO_CHIPS : JOURNEY_CHIPS;

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1.5"
      style={{
        paddingLeft: 16,
        paddingRight: 16,
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        touchAction: 'pan-x',
      }}
    >
      {chips.map((chip, i) => (
        <motion.button
          key={chip.label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: i * 0.04, ease: [0.32, 0.72, 0, 1] }}
          onClick={() => onChipTap(chip.fill)}
          type="button"
          style={{
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 999,
            background: chipBg,
            border: `1px solid ${chipBd}`,
            fontFamily: 'Inter, system-ui',
            fontSize: 13,
            fontWeight: 600,
            color: chipText,
            cursor: 'pointer',
            scrollSnapAlign: 'start',
            WebkitTapHighlightColor: 'transparent',
            transition: 'transform 120ms, background 160ms, border-color 160ms',
          }}
          whileTap={{ scale: 0.96 }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 16, color: pinkC, fontVariationSettings: "'FILL' 1" }}
            aria-hidden
          >
            {chip.icon}
          </span>
          {chip.label}
        </motion.button>
      ))}
    </div>
  );
}

export default DealContextChips;
