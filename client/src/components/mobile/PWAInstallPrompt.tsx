/**
 * PWAInstallPrompt.tsx
 *
 * Organic PWA install prompt that shows at the conversion moment — when
 * the user creates an account or logs in for the first time. Not before.
 *
 * Rules:
 *   - Only shows on mobile (no need on desktop)
 *   - Only shows when NOT already running in standalone mode
 *   - Only shows when the user is logged in (has an account)
 *   - Only shows once per 14-day window (dismissable, respects localStorage)
 *   - Detects iOS vs Android and shows the right instructions
 *   - Feels like part of the onboarding, not a browser popup
 *
 * Design: a small card that slides in below the chat area, matching
 * the Grok+Canva aesthetic. Pink accent, minimal, no logo spam.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';
const STORAGE_KEY = 'smbx-pwa-prompted';
const COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

/** Is the app already running as an installed PWA (standalone)? */
function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  // iOS: navigator.standalone
  if ((navigator as any).standalone === true) return true;
  // Android / desktop: display-mode media query
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  return false;
}

/** Is the device iOS (for Apple-specific install instructions)? */
function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/** Is the device mobile? */
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 767px)').matches;
}

/** Should we show the prompt? (all conditions met) */
function shouldShow(isLoggedIn: boolean): boolean {
  if (!isMobileDevice()) return false;
  if (isStandalone()) return false;
  if (!isLoggedIn) return false;

  // Check cooldown
  try {
    const lastPrompted = localStorage.getItem(STORAGE_KEY);
    if (lastPrompted) {
      const elapsed = Date.now() - parseInt(lastPrompted, 10);
      if (elapsed < COOLDOWN_MS) return false;
    }
  } catch { /* localStorage unavailable */ }

  return true;
}

interface Props {
  isLoggedIn: boolean;
  dark: boolean;
  /** Delay in ms before the prompt slides in (give the user a moment to orient) */
  delayMs?: number;
}

export function PWAInstallPrompt({ isLoggedIn, dark, delayMs = 3000 }: Props) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  // Android: capture the beforeinstallprompt event
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Listen for the Android install prompt event
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault(); // Prevent auto-show
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Show with delay after conditions are met
  useEffect(() => {
    if (!shouldShow(isLoggedIn) || dismissed) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(timer);
  }, [isLoggedIn, dismissed, delayMs]);

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch { /* ignore */ }
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Android: trigger native install
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        handleDismiss();
      }
      setDeferredPrompt(null);
    }
    // iOS: the card shows instructions — no programmatic install
  };

  // Colors
  const pinkC    = dark ? PINK_DARK : PINK;
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const bodyC    = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedC   = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const cardBg   = dark ? '#1f2123' : '#ffffff';
  const border   = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';

  const ios = isIOS();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          className="fixed left-4 right-4 z-[90]"
          style={{
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
          }}
        >
          <div
            className="rounded-2xl p-5 relative"
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              boxShadow: dark
                ? '0 16px 48px -12px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.3)'
                : '0 16px 48px -12px rgba(15,16,18,0.12), 0 4px 12px rgba(15,16,18,0.06)',
            }}
          >
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
              style={{
                background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.05)',
                border: 'none',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
              aria-label="Dismiss"
            >
              <span className="material-symbols-outlined text-[14px]" style={{ color: mutedC }}>
                close
              </span>
            </button>

            <div className="flex items-start gap-4 pr-6">
              {/* App icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: dark ? 'rgba(232,112,154,0.10)' : 'rgba(212,74,120,0.08)',
                  border: `1px solid ${dark ? 'rgba(232,112,154,0.20)' : 'rgba(212,74,120,0.16)'}`,
                }}
              >
                <img
                  src="/x.png"
                  alt="smbx.ai"
                  className="w-7 h-7 object-contain"
                  draggable={false}
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3
                  className="font-headline font-black text-[15px] tracking-tight mb-1"
                  style={{ color: headingC }}
                >
                  Add smbx.ai to your home screen
                </h3>
                <p className="text-[12px] leading-relaxed mb-3" style={{ color: bodyC }}>
                  {ios
                    ? 'Get the full app experience — no browser bar, instant access, runs like a native app.'
                    : 'Install smbx.ai for instant access, no browser chrome, and native-app performance.'
                  }
                </p>

                {ios ? (
                  /* iOS: manual instructions */
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                        style={{ background: pinkC, color: 'white' }}
                      >
                        1
                      </span>
                      <p className="text-[12px]" style={{ color: bodyC }}>
                        Tap <span className="material-symbols-outlined text-[14px] align-middle" style={{ color: pinkC }}>ios_share</span>{' '}
                        <strong>Share</strong> in Safari's bottom bar
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                        style={{ background: pinkC, color: 'white' }}
                      >
                        2
                      </span>
                      <p className="text-[12px]" style={{ color: bodyC }}>
                        Tap <strong>"Add to Home Screen"</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                        style={{ background: pinkC, color: 'white' }}
                      >
                        3
                      </span>
                      <p className="text-[12px]" style={{ color: bodyC }}>
                        Done — smbx.ai runs like a native app
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Android: native install button */
                  <button
                    onClick={handleInstall}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-bold text-white transition-all active:scale-[0.97]"
                    style={{
                      background: pinkC,
                      border: 'none',
                      cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                      boxShadow: `0 6px 20px -6px ${pinkC}88`,
                    }}
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    Install app
                  </button>
                )}

                {/* Dismiss link */}
                <button
                  onClick={handleDismiss}
                  className="block mt-3 text-[11px] font-medium"
                  style={{
                    color: mutedC,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
