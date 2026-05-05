/* useAudience — single hook the UI uses to know which audience the current
   visitor belongs to. Drives copy, capability shortcuts, sample data,
   and (eventually) per-audience screen variants.

   Sources, in priority order:
   1. Authed user's `audience` field (when the server adds it).
   2. localStorage (anon test drive switcher).
   3. DEFAULT_AUDIENCE.

   Cross-tab sync via storage events so the anon switcher updates other
   open tabs without a page reload. */

import { useCallback, useEffect, useState } from "react";
import { type Audience, AUDIENCES, DEFAULT_AUDIENCE } from "../lib/audience";
import type { User } from "./useAuth";

const STORAGE_KEY = "smbx-mobile-audience";

function readAnonAudience(): Audience {
  if (typeof window === "undefined") return DEFAULT_AUDIENCE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw && (AUDIENCES as string[]).includes(raw)) {
      return raw as Audience;
    }
  } catch { /* private mode / quota — fall through */ }
  return DEFAULT_AUDIENCE;
}

/** Custom event so multiple useAudience hook instances in the same tab
    sync immediately. Native `storage` events only fire in OTHER tabs,
    which is the wrong behavior here — we have V6Mobile and Today both
    consuming the hook simultaneously. */
const AUDIENCE_CHANGE_EVENT = "smbx-audience-change";

function writeAnonAudience(audience: Audience): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, audience);
    window.dispatchEvent(new CustomEvent(AUDIENCE_CHANGE_EVENT));
  } catch { /* noop */ }
}

/** Read the audience for the current visitor.
    @param user - authed user or null. If user.audience is set, it wins. */
export function useAudience(user: User | null = null): {
  audience: Audience;
  setAudience: (a: Audience) => void;
  isAuthedAudience: boolean;
} {
  // User type doesn't carry audience yet — when the server adds it, this
  // narrows. Until then, all audiences come from localStorage.
  const userAudience = (user as User & { audience?: Audience } | null)?.audience;

  const [anonAudience, setAnonAudience] = useState<Audience>(readAnonAudience);

  // In-tab sync (custom event) AND cross-tab sync (storage event).
  useEffect(() => {
    const onChange = () => setAnonAudience(readAnonAudience());
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      onChange();
    };
    window.addEventListener(AUDIENCE_CHANGE_EVENT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(AUDIENCE_CHANGE_EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setAudience = useCallback((a: Audience) => {
    // Authed users would write to the server — until that exists, anon
    // localStorage is the only persistence layer.
    writeAnonAudience(a);
    setAnonAudience(a);
  }, []);

  const audience = userAudience ?? anonAudience;
  return {
    audience,
    setAudience,
    isAuthedAudience: Boolean(userAudience),
  };
}
