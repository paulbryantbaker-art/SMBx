/**
 * Global confirm() helper — like window.confirm() but renders our
 * mobile-friendly ConfirmSheet. Returns a Promise that resolves to
 * true on confirm, false on cancel/dismiss.
 */

export interface ConfirmRequest {
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

interface PendingRequest extends ConfirmRequest {
  resolve: (confirmed: boolean) => void;
}

type Listener = (req: PendingRequest | null) => void;

const listeners = new Set<Listener>();
let current: PendingRequest | null = null;

function publish(req: PendingRequest | null) {
  current = req;
  listeners.forEach(l => l(req));
}

export function subscribeConfirms(l: Listener): () => void {
  listeners.add(l);
  l(current);
  return () => { listeners.delete(l); };
}

export function confirm(req: ConfirmRequest): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    if (current) current.resolve(false); // dismiss any in-flight confirm first
    publish({ ...req, resolve });
  });
}

/** Internal — used by the host to settle the current confirm. */
export function settleConfirm(value: boolean): void {
  if (!current) return;
  const r = current;
  publish(null);
  r.resolve(value);
}
