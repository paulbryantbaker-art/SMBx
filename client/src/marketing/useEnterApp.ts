/**
 * The marketing → app threshold.
 *
 * A logged-out visitor who talks to Yulia gets *Yulia*, right there on the
 * marketing page — not a sign-in wall. So "Ask Yulia" / submitting a chat
 * opens the marketing chat bubble (the FAB) and, if they typed something,
 * sends it for a real anonymous answer. The signup ask comes later, from
 * inside the bubble, once Yulia has shown value (or at the preview cap).
 *
 * The bubble runs on `/api/chat/anonymous/*` (see useMarketingChat.ts) and
 * stores its session under `smbx_anon_session`; App.tsx migrates that
 * transcript into the account on signup, so the conversation follows them.
 *
 * `PENDING_MESSAGE_KEY` / `consumePendingMessage` are kept for compatibility
 * with any flow that still stashes a first message, but the bubble no longer
 * needs them.
 */
export const PENDING_MESSAGE_KEY = 'smbx_pending_message';
export const APP_ENTERED_KEY = 'smbx_app_entered';

export function hasEnteredApp(): boolean {
  try {
    return sessionStorage.getItem(APP_ENTERED_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Custom event that opens the marketing chat bubble (FAB) from anywhere.
 * `detail.message` (optional) is auto-sent to Yulia once the bubble opens.
 */
export const YULIA_OPEN_EVENT = 'smbx:yulia-open';

export interface YuliaOpenDetail {
  message?: string;
}

/**
 * Marketing CTA handler. Opens the in-page Yulia bubble; a typed question is
 * carried along and answered anonymously. No redirect, no sign-in wall — the
 * app lives behind auth, but the *conversation* starts here.
 */
export function enterApp(message?: string): void {
  const msg = message?.trim();
  try {
    window.dispatchEvent(
      new CustomEvent<YuliaOpenDetail>(YULIA_OPEN_EVENT, {
        detail: msg ? { message: msg } : {},
      }),
    );
  } catch { /* no window */ }
}

/** Read + clear the pending first message. Call once from the app on mount. */
export function consumePendingMessage(): string | null {
  try {
    const msg = sessionStorage.getItem(PENDING_MESSAGE_KEY);
    if (msg) sessionStorage.removeItem(PENDING_MESSAGE_KEY);
    return msg;
  } catch {
    return null;
  }
}
