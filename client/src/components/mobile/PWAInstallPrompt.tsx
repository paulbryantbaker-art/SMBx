/**
 * PWAInstallPrompt.tsx
 *
 * PWA LOCK — full-screen interstitial that BLOCKS the mobile app for
 * authenticated users who are NOT in standalone PWA mode.
 *
 * The app is designed as a PWA. On mobile, logged-in users must install
 * it to their home screen. There is no "skip" — the only options are:
 *   1. Follow the install steps → "I've added it — let's go"
 *   2. Sign out and browse the marketing pages in the browser
 *
 * This runs on EVERY render so it catches both fresh signups and returning
 * users who somehow opened the app in a browser tab instead of the PWA.
 *
 * Desktop users are never locked (desktop doesn't need standalone mode).
 * Anonymous users are never locked (they're browsing, not using the app).
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';
const STORAGE_KEY = 'smbx-pwa-installed';

/** Is the app already running as an installed PWA (standalone)? */
function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  if ((navigator as any).standalone === true) return true;
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  return false;
}

/** Is the device iOS? */
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

interface Props {
  isLoggedIn: boolean;
  dark: boolean;
  onSignOut?: () => void;
}

export function PWAInstallPrompt({ isLoggedIn, dark, onSignOut }: Props) {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Listen for the Android install prompt event
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // LOCK: on mobile, logged-in users MUST be in standalone mode.
  // This runs on every render so it catches both fresh signups and
  // returning users who somehow ended up in a browser tab.
  useEffect(() => {
    if (!isMobileDevice()) { setVisible(false); return; }
    if (isStandalone())    { setVisible(false); return; }
    if (!isLoggedIn)       { setVisible(false); return; }

    // User is logged in on mobile but NOT in standalone PWA → lock.
    setVisible(true);
  }, [isLoggedIn]);

  // "I've added it" — check if we're now in standalone
  const handleConfirm = () => {
    // On iOS, the user can't switch to standalone without closing Safari
    // and opening from the home screen icon. So "I've added it" means
    // they claim to have done it — trust them, set the flag, and they'll
    // get the real standalone check on next launch.
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, 'done');
    } catch { /* ignore */ }
  };

  const handleInstallAndroid = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') handleConfirm();
      setDeferredPrompt(null);
    }
  };

  // Colors
  const pinkC    = dark ? PINK_DARK : PINK;
  const bg       = dark ? '#151617' : '#FFFFFF';
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const bodyC    = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedC   = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const stepBg   = dark ? '#1f2123' : '#f5f5f7';

  const ios = isIOS();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          className="fixed inset-0 z-[200] flex flex-col"
          style={{
            background: bg,
            paddingTop: 'env(safe-area-inset-top, 0px)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          {/* Content — centered vertically */}
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
            {/* App icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="w-20 h-20 rounded-[22px] flex items-center justify-center mb-8"
              style={{
                background: dark ? 'rgba(232,112,154,0.10)' : 'rgba(212,74,120,0.08)',
                border: `2px solid ${dark ? 'rgba(232,112,154,0.25)' : 'rgba(212,74,120,0.20)'}`,
                boxShadow: `0 12px 32px -10px ${pinkC}44`,
              }}
            >
              <img
                src="/x.png"
                alt="smbx.ai"
                className="w-12 h-12 object-contain"
                draggable={false}
              />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="font-headline font-black tracking-[-0.03em] text-center mb-3"
              style={{
                fontSize: 'clamp(1.75rem, 7vw, 2.5rem)',
                color: headingC,
                lineHeight: 1,
              }}
            >
              One quick step.
            </motion.h1>

            <motion.p
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="text-center mb-10 max-w-xs"
              style={{ color: bodyC, fontSize: 16, lineHeight: 1.5 }}
            >
              Add smbx.ai to your home screen for the full app experience — no browser bar, instant access, runs like a native app.
            </motion.p>

            {/* Steps */}
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="w-full max-w-sm space-y-3 mb-10"
            >
              {ios ? (
                /* iOS instructions */
                <>
                  <div
                    className="flex items-center gap-4 rounded-2xl p-4"
                    style={{ background: stepBg }}
                  >
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-black shrink-0"
                      style={{ background: pinkC, color: 'white' }}
                    >
                      1
                    </span>
                    <p className="text-[15px] font-medium" style={{ color: headingC }}>
                      Tap{' '}
                      <span className="material-symbols-outlined text-[18px] align-middle" style={{ color: pinkC }}>
                        ios_share
                      </span>{' '}
                      <strong>Share</strong> in the bar below
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-4 rounded-2xl p-4"
                    style={{ background: stepBg }}
                  >
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-black shrink-0"
                      style={{ background: pinkC, color: 'white' }}
                    >
                      2
                    </span>
                    <p className="text-[15px] font-medium" style={{ color: headingC }}>
                      Scroll down and tap <strong>"Add to Home Screen"</strong>
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-4 rounded-2xl p-4"
                    style={{ background: stepBg }}
                  >
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-black shrink-0"
                      style={{ background: pinkC, color: 'white' }}
                    >
                      3
                    </span>
                    <p className="text-[15px] font-medium" style={{ color: headingC }}>
                      Tap <strong>"Add"</strong> — that's it, 10 seconds
                    </p>
                  </div>
                </>
              ) : (
                /* Android: single button */
                <div className="text-center">
                  <button
                    onClick={handleInstallAndroid}
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-[16px] font-bold text-white transition-all active:scale-[0.97]"
                    style={{
                      background: pinkC,
                      border: 'none',
                      cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                      boxShadow: `0 12px 32px -10px ${pinkC}88`,
                    }}
                  >
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    Install smbx.ai
                  </button>
                  <p className="text-[13px] mt-3" style={{ color: mutedC }}>
                    One tap — Chrome handles the rest.
                  </p>
                </div>
              )}
            </motion.div>

            {/* Time estimate */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-[12px] text-center"
              style={{ color: mutedC }}
            >
              Takes about 10 seconds. Your data and conversations are already saved.
            </motion.p>
          </div>

          {/* Bottom actions — NO SKIP. Install or sign out. */}
          <div
            className="shrink-0 px-8 pb-4"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
          >
            <button
              onClick={handleConfirm}
              className="w-full py-4 rounded-2xl text-[15px] font-bold transition-all active:scale-[0.985] mb-3"
              style={{
                background: pinkC,
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                boxShadow: `0 8px 24px -8px ${pinkC}88`,
              }}
            >
              {ios ? "I've added it — let's go" : "I've installed it"}
            </button>
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="w-full py-3 rounded-xl text-[13px] font-medium transition-all active:scale-[0.985]"
                style={{
                  background: 'transparent',
                  color: mutedC,
                  border: 'none',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                Sign out and browse instead
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
