/**
 * DealContextChips — the chip row above the mobile pill, context-aware.
 *
 * Empty portfolio → 5 journey-navigation chips (Sell / Buy / Raise /
 *   Integrate / Advisors). Each chip navigates to its mobile journey page
 *   where the full story + interactive demo live. The pill + DealCard
 *   combo owns the chat-starter job now, not chips.
 * Active portfolio → compact chat-starter chips ("New deal", "Find a deal",
 *   "Ask anything"). DealStack above handles resume via card tap.
 *
 * Mobile only. Renders inside the portaled home pill wrapper above the pill.
 */

import { motion } from 'framer-motion';

const JOURNEY_ACCENTS: Record<string, { light: string; dark: string }> = {
  sell:  { light: '#D44A78', dark: '#E8709A' },
  buy:   { light: '#3E8E8E', dark: '#52A8A8' },
  raise: { light: '#C99A3E', dark: '#DDB25E' },
  pmi:   { light: '#8F4A7A', dark: '#AE6D9A' },
  brand: { light: '#D44A78', dark: '#E8709A' },
};

export type ChipAction =
  | { kind: 'nav'; path: string; journey: keyof typeof JOURNEY_ACCENTS }
  | { kind: 'fill'; fill: string; journey?: keyof typeof JOURNEY_ACCENTS };

export interface ChipSpec {
  icon: string;
  label: string;
  action: ChipAction;
}

const JOURNEY_CHIPS: ChipSpec[] = [
  { icon: 'sell', label: 'Sell my business', action: { kind: 'nav', path: '/sell', journey: 'sell' } },
  { icon: 'shopping_cart', label: 'Buy a business', action: { kind: 'nav', path: '/buy', journey: 'buy' } },
  { icon: 'savings', label: 'Raise capital', action: { kind: 'nav', path: '/raise', journey: 'raise' } },
  { icon: 'merge', label: 'Just closed', action: { kind: 'nav', path: '/integrate', journey: 'pmi' } },
  { icon: 'workspace_premium', label: "I'm an advisor", action: { kind: 'nav', path: '/advisors', journey: 'brand' } },
];

const ACTIVE_PORTFOLIO_CHIPS: ChipSpec[] = [
  { icon: 'add', label: 'New deal', action: { kind: 'fill', fill: 'I want to start a new deal — ' } },
  { icon: 'search', label: 'Find a deal', action: { kind: 'fill', fill: 'Help me find a deal in my portfolio — ' } },
  { icon: 'auto_awesome', label: 'Ask anything', action: { kind: 'fill', fill: '' } },
];

interface Props {
  dark: boolean;
  hasDeals: boolean;
  onChipSelect: (action: ChipAction) => void;
}

export function DealContextChips({ dark, hasDeals, onChipSelect }: Props) {
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
      {chips.map((chip, i) => {
        // Journey chips carry per-chip accent color; fill chips use the
        // brand pink so the "start a conversation" affordance stays clearly
        // tied to Yulia rather than any specific journey.
        const journeyKey = chip.action.kind === 'nav' ? chip.action.journey : chip.action.journey || 'brand';
        const accent = JOURNEY_ACCENTS[journeyKey];
        const iconColor = dark ? accent.dark : accent.light;

        return (
          <motion.button
            key={chip.label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: i * 0.04, ease: [0.32, 0.72, 0, 1] }}
            onClick={() => onChipSelect(chip.action)}
            type="button"
            aria-label={chip.action.kind === 'nav' ? `Open ${chip.label} journey page` : chip.label}
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
              style={{ fontSize: 16, color: iconColor, fontVariationSettings: "'FILL' 1" }}
              aria-hidden
            >
              {chip.icon}
            </span>
            {chip.label}
          </motion.button>
        );
      })}
    </div>
  );
}

export default DealContextChips;
