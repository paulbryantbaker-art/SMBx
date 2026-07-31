/**
 * A text field that survives leaving the screen.
 *
 * Paul: "go back but commit data so we don't lose anything on swipe."
 *
 * On a phone, backing out of a screen unmounts it, and an iOS back-swipe can
 * happen by accident mid-sentence. Anything typed and not yet saved is gone.
 * This keeps in-progress text in sessionStorage so returning to the screen finds
 * it still there.
 *
 * WHY sessionStorage AND NOT localStorage: a draft is for the trip, not forever.
 * A note half-typed three weeks ago reappearing under a client's name is worse
 * than losing it — it reads as a saved record. sessionStorage clears with the
 * tab, which is the right lifetime for "I was in the middle of something".
 *
 * The key MUST include the record id. Keyed only by field name, a draft typed
 * against one client would surface under the next one — the same class of bug as
 * a stale figure appearing without its correction.
 *
 * This is NOT a substitute for saving. `clear()` is called on a successful
 * commit, and the UI still shows an explicit Save.
 */
import { useCallback, useEffect, useRef, useState } from "react";

const PREFIX = "smbx_draft:";

function read(key: string): string | null {
  try {
    return sessionStorage.getItem(PREFIX + key);
  } catch {
    // Private-mode Safari throws on storage access. A draft is a convenience —
    // never let it break the screen.
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    if (value) sessionStorage.setItem(PREFIX + key, value);
    else sessionStorage.removeItem(PREFIX + key);
  } catch {
    /* storage unavailable — the field still works, it just won't persist */
  }
}

/**
 * @param key      stable, and MUST include the record id (e.g. `client:12:note`)
 * @param initial  the saved server value; used when there is no draft
 *
 * Returns `[value, setValue, clear, isDraft]`.
 * `isDraft` is true when what's on screen came from a draft and differs from
 * `initial` — so the UI can say "unsaved" rather than implying it's committed.
 */
export function useDraft(
  key: string,
  initial: string = "",
): [string, (v: string) => void, () => void, boolean] {
  // Read synchronously on first render so the field never flashes empty.
  const [value, setValue] = useState<string>(() => read(key) ?? initial);
  const keyRef = useRef(key);

  // Switching records (a different client, a different deal) must load THAT
  // record's draft rather than carrying the previous one across.
  useEffect(() => {
    if (keyRef.current === key) return;
    keyRef.current = key;
    setValue(read(key) ?? initial);
  }, [key, initial]);

  const set = useCallback((v: string) => {
    setValue(v);
    write(keyRef.current, v);
  }, []);

  const clear = useCallback(() => {
    write(keyRef.current, "");
    setValue(initial);
  }, [initial]);

  return [value, set, clear, value !== initial && read(key) != null];
}

/** Drop every draft for a record once its edits are committed. */
export function clearDrafts(prefix: string): void {
  try {
    const doomed: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(PREFIX + prefix)) doomed.push(k);
    }
    doomed.forEach(k => sessionStorage.removeItem(k));
  } catch {
    /* storage unavailable */
  }
}
