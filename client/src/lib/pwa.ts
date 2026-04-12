/** PWA detection utilities — shared across components */

/** Is the app running as an installed PWA (standalone mode)? */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  if ((navigator as any).standalone === true) return true;
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  return false;
}

/** Is the device mobile? */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 767px)').matches;
}
