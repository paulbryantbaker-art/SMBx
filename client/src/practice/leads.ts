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

/** The founder's scheduling link (Calendly or similar). Until it's configured,
 *  every "Book a call" affordance falls back to the on-page form (#book). */
export const BOOKING_URL: string = (import.meta as any).env?.VITE_BOOKING_URL || '';

export function bookHref(): string {
  return BOOKING_URL || '#book';
}

export function bookTarget(): string | undefined {
  return BOOKING_URL ? '_blank' : undefined;
}
