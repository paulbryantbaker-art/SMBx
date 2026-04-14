/**
 * Toast — a tiny global event-bus + state for transient notifications.
 *
 * Usage:
 *   import { showToast } from '../lib/toast';
 *   showToast('Couldn\'t send', { tone: 'error', action: { label: 'Retry', handler: retrySend } });
 *
 * Mount <ToastHost /> exactly once near the root.
 */

export type ToastTone = 'info' | 'success' | 'error';

export interface ToastAction {
  label: string;
  handler: () => void;
}

export interface ToastSpec {
  id: number;
  message: string;
  tone: ToastTone;
  durationMs: number;
  action?: ToastAction;
}

type Listener = (toast: ToastSpec | null) => void;

const listeners = new Set<Listener>();
let nextId = 1;
let dismissTimer: ReturnType<typeof setTimeout> | null = null;
let current: ToastSpec | null = null;

function publish(toast: ToastSpec | null) {
  current = toast;
  listeners.forEach(l => l(toast));
}

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  // Replay current state on subscribe so newly-mounted hosts catch up
  listener(current);
  return () => { listeners.delete(listener); };
}

export function dismissToast(): void {
  if (dismissTimer) { clearTimeout(dismissTimer); dismissTimer = null; }
  publish(null);
}

interface ShowOptions {
  tone?: ToastTone;
  durationMs?: number;
  action?: ToastAction;
}

export function showToast(message: string, opts: ShowOptions = {}): void {
  const toast: ToastSpec = {
    id: nextId++,
    message,
    tone: opts.tone ?? 'info',
    durationMs: opts.durationMs ?? 6000,
    action: opts.action,
  };
  if (dismissTimer) clearTimeout(dismissTimer);
  publish(toast);
  dismissTimer = setTimeout(() => publish(null), toast.durationMs);
}
