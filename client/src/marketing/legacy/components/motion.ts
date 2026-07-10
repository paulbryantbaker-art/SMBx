/**
 * The Working Paper motion module — one place for the site's two motion
 * physics, so every surface speaks the same language:
 *
 *   · `dataTween`   — exact, weightless easing for FIGURES: numbers settling,
 *     bars filling, hashes resolving, rules drawing. Data is precise; it never
 *     bounces.
 *   · `objectSpring` — light spring with a hint of overshoot for OBJECTS the
 *     visitor touches: knobs, chips, seals, bubbles. Objects have weight.
 *
 * House rule carried over from the audit: numbers never count up from zero —
 * they DERIVE (re-settle from their previous value when an input changes).
 */
export const HOUSE_EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

export const dataTween = (duration = 0.45, delay = 0) =>
  ({ duration, delay, ease: HOUSE_EASE }) as const;

export const objectSpring = {
  type: 'spring',
  stiffness: 380,
  damping: 26,
  mass: 0.7,
} as const;
