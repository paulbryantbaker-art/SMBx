/**
 * Haptic feedback utility — works on Android Chrome + some non-Apple devices
 * via the Vibration API. iOS Safari (and iOS PWA) does not implement this;
 * the calls are no-ops there, which is acceptable.
 *
 * Use for short, purposeful acknowledgments of card transitions, swipes,
 * commits. Never for ambient motion.
 */

const isSupported = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

function vibrate(ms: number): void {
  if (!isSupported) return;
  try { navigator.vibrate(ms); } catch { /* ignore */ }
}

/** Light tick — tap confirmation, card lift */
export function tick(): void { vibrate(6); }

/** Medium thud — swipe committed, card cycled */
export function thud(): void { vibrate(12); }

/** Selection click — intermediate state change */
export function selectionClick(): void { vibrate(4); }
