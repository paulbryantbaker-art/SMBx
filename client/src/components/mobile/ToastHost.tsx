/**
 * ToastHost — mounts once at the root of AppShell. Subscribes to the
 * global toast bus and renders the current toast at the bottom of the
 * screen above the chat pill (z-index above everything but modals).
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { dismissToast, subscribeToasts, type ToastSpec } from '../../lib/toast';

const TONE_BG: Record<string, string> = {
  info: '#1A1C1E',
  success: '#2F7A4E',
  error: '#9E3232',
};

interface Props {
  /** Lifts the toast above the portaled chat pill. ~120px clears the pill + safe-area. */
  bottomOffset?: number;
}

export function ToastHost({ bottomOffset = 110 }: Props) {
  const [toast, setToast] = useState<ToastSpec | null>(null);

  useEffect(() => subscribeToasts(setToast), []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ type: 'spring', stiffness: 360, damping: 32 }}
          style={{
            position: 'fixed',
            left: 16,
            right: 16,
            bottom: `calc(${bottomOffset}px + env(safe-area-inset-bottom))`,
            zIndex: 95,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderRadius: 14,
            background: TONE_BG[toast.tone],
            color: '#FFFFFF',
            fontFamily: 'Inter, system-ui',
            fontSize: 14,
            fontWeight: 500,
            boxShadow: '0 10px 28px rgba(0,0,0,0.30), 0 2px 6px rgba(0,0,0,0.18)',
            pointerEvents: 'auto',
          }}
          role="status"
          aria-live="polite"
        >
          <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
          {toast.action && (
            <button
              onClick={() => { toast.action?.handler(); dismissToast(); }}
              type="button"
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                border: 'none',
                background: 'rgba(255,255,255,0.18)',
                color: '#FFFFFF',
                fontFamily: 'Inter, system-ui',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {toast.action.label}
            </button>
          )}
          <button
            onClick={dismissToast}
            type="button"
            aria-label="Dismiss"
            style={{
              width: 24, height: 24, padding: 0,
              borderRadius: '50%',
              border: 'none',
              background: 'transparent',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export default ToastHost;
