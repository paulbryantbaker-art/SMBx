/**
 * DealStackHints — first-session-only animated cue overlay teaching users
 * the two hidden gestures on the top DealCard:
 *   - Swipe up → cycle to the next deal
 *   - Long-press → open quick-actions sheet
 *
 * Stored in localStorage so it never re-appears after dismissal or first
 * interaction. Honors prefers-reduced-motion.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'smbx-deal-stack-hint-seen-v1';

interface Props {
  /** True when there's a top card visible — only show hints if there's something to act on. */
  hasTopCard: boolean;
  dark?: boolean;
}

export function DealStackHints({ hasTopCard, dark = false }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasTopCard) return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === 'true') return;
    } catch { /* ignore */ }
    // Defer 800ms so the user sees the cards land first
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, [hasTopCard]);

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch { /* ignore */ }
    setVisible(false);
  };

  if (!visible) return null;

  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const bodyC = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const bg = dark ? 'rgba(31,33,35,0.96)' : 'rgba(255,255,255,0.96)';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.24 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }}
        onClick={dismiss}
      >
        <motion.div
          initial={{ scale: 0.92, y: 16 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.96, y: 8 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: bg,
            borderRadius: 20,
            padding: '24px 22px 18px',
            maxWidth: 320,
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}
        >
          <h3 style={{
            margin: 0,
            fontFamily: 'Sora, system-ui',
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: '-0.01em',
            color: headingC,
            marginBottom: 14,
          }}>
            Two quick tips
          </h3>

          <Tip
            icon="swipe_up"
            title="Swipe up on the top card"
            sub="Cycles to your next deal — useful when you have several active."
            color={headingC}
            sub_color={bodyC}
          />

          <Tip
            icon="touch_app"
            title="Long-press a card"
            sub="Opens quick actions: pin, share, mute, archive."
            color={headingC}
            sub_color={bodyC}
          />

          <button
            onClick={dismiss}
            type="button"
            style={{
              marginTop: 18,
              width: '100%',
              padding: '12px 16px',
              borderRadius: 12,
              border: 'none',
              background: '#D44A78',
              color: '#fff',
              fontFamily: 'Inter, system-ui',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Got it
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Tip({ icon, title, sub, color, sub_color }: { icon: string; title: string; sub: string; color: string; sub_color: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
      <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#D44A78', flexShrink: 0, marginTop: 1 }}>
        {icon}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: 'Inter, system-ui',
          fontSize: 14,
          fontWeight: 700,
          color,
          marginBottom: 2,
        }}>
          {title}
        </div>
        <div style={{
          fontFamily: 'Inter, system-ui',
          fontSize: 12,
          fontWeight: 500,
          color: sub_color,
          lineHeight: 1.4,
        }}>
          {sub}
        </div>
      </div>
    </div>
  );
}

export default DealStackHints;
