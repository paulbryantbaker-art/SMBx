/**
 * Practice-site lead capture. The README's rule: persist the captured
 * thesis/size/email as a lead even if the visitor never books. Fire-and-forget
 * POST — conversion UX must never block on it.
 */
export interface PracticeLead {
  persona?: string;
  thesis?: string;
  size?: string;
  email?: string;
  source: string;
}

export function postPracticeLead(lead: PracticeLead): Promise<boolean> {
  return fetch('/api/practice/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead),
  })
    .then(r => r.ok)
    .catch(() => false);
}

/** The founder's scheduling link — Paul's Google Calendar booking page,
 *  shipped with the v3 design (2026-07-16). VITE_BOOKING_URL still wins when
 *  set, so the link can rotate without a deploy. */
const DEFAULT_BOOKING_URL = 'https://calendar.app.google/rA9vC7RRdR2wLJbV6';
export const BOOKING_URL: string = (import.meta as any).env?.VITE_BOOKING_URL || DEFAULT_BOOKING_URL;

export function bookHref(): string {
  return BOOKING_URL;
}

export function bookTarget(): string | undefined {
  return '_blank';
}

/**
 * The `rel` that MUST accompany `bookTarget()`.
 *
 * Six call sites open the booking link in a new tab and each wrote its own
 * `rel` by hand; two of them ended up with `noreferrer` alone. In a current
 * browser that is nearly harmless — `noreferrer` implies `noopener` — but it
 * is only nearly, and the real problem is that the pairing was six chances to
 * forget rather than one. `target` and `rel` travel together now.
 */
export function bookRel(): string | undefined {
  return bookTarget() ? 'noopener noreferrer' : undefined;
}
