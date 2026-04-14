/**
 * DealContextChips — horizontal chip row above the mobile pill.
 *
 * Role: journey-page navigation. Each chip takes the user to the mobile
 * editorial for a journey (Sell / Buy / Raise / Integrate / Advisors),
 * colored to match that journey's brand accent.
 *
 * Role split (set in Sprint 13A):
 *   - Chips = education (navigate to journey pages)
 *   - + button in the pill = chat starter prefills ("I want to sell...")
 *   - Pill input = free-text conversation
 *
 * Mobile only. Renders inside the portaled home pill wrapper above the pill.
 */

import { motion } from 'framer-motion';

interface JourneyChip {
  icon: string;
  label: string;
  path: string;
  /** Light / dark accent — matches DealCard + Workspace color system. */
  light: string;
  dark: string;
}

const JOURNEY_CHIPS: JourneyChip[] = [
  { icon: 'sell',                 label: 'Sell',      path: '/sell',         light: '#D44A78', dark: '#E8709A' },
  { icon: 'shopping_cart',        label: 'Buy',       path: '/buy',          light: '#3E8E8E', dark: '#52A8A8' },
  { icon: 'savings',              label: 'Raise',     path: '/raise',        light: '#C99A3E', dark: '#DDB25E' },
  { icon: 'merge',                label: 'Integrate', path: '/integrate',    light: '#8F4A7A', dark: '#AE6D9A' },
  { icon: 'workspace_premium',    label: 'Advisors',  path: '/advisors',     light: '#D44A78', dark: '#E8709A' },
  { icon: 'help_outline',         label: 'How it works', path: '/how-it-works', light: '#D44A78', dark: '#E8709A' },
  { icon: 'paid',                 label: 'Pricing',   path: '/pricing',      light: '#D44A78', dark: '#E8709A' },
];

interface Props {
  dark: boolean;
  onNavigate: (path: string) => void;
}

export function DealContextChips({ dark, onNavigate }: Props) {
  const chipBg = dark ? '#1f2123' : '#ffffff';
  const chipBd = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const chipText = dark ? 'rgba(240,240,243,0.92)' : '#1a1c1e';

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
      {JOURNEY_CHIPS.map((chip, i) => {
        const iconColor = dark ? chip.dark : chip.light;
        return (
          <motion.button
            key={chip.path}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: i * 0.04, ease: [0.32, 0.72, 0, 1] }}
            onClick={() => onNavigate(chip.path)}
            type="button"
            aria-label={`Open ${chip.label} journey page`}
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
