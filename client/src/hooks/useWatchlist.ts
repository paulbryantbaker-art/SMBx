/* Client-side watch list. Anonymous users browsing the sample app can
   tap "Watch" on any deal and have it persist in localStorage so the
   app feels alive on a test drive. Authed users will eventually have
   server-backed lists; this hook only deals with the local case. */

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "smbx-mobile-watchlist";

export interface WatchedDeal {
  id: string;
  title: string;
  /** ISO timestamp the user watched it. Used to sort newest first. */
  addedAt: string;
}

function read(): WatchedDeal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((d): d is WatchedDeal =>
      d && typeof d.id === "string" && typeof d.title === "string"
    );
  } catch {
    return [];
  }
}

function write(deals: WatchedDeal[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
  } catch { /* quota / private mode — fail silently */ }
}

export function useWatchlist() {
  const [watched, setWatched] = useState<WatchedDeal[]>(read);

  // Cross-tab sync: if user watches in another tab, this tab updates too.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      setWatched(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const watch = useCallback((id: string, title: string) => {
    setWatched(prev => {
      if (prev.some(d => d.id === id)) return prev;
      const next = [{ id, title, addedAt: new Date().toISOString() }, ...prev];
      write(next);
      return next;
    });
  }, []);

  const unwatch = useCallback((id: string) => {
    setWatched(prev => {
      const next = prev.filter(d => d.id !== id);
      write(next);
      return next;
    });
  }, []);

  const toggle = useCallback((id: string, title: string) => {
    setWatched(prev => {
      const exists = prev.some(d => d.id === id);
      const next = exists
        ? prev.filter(d => d.id !== id)
        : [{ id, title, addedAt: new Date().toISOString() }, ...prev];
      write(next);
      return next;
    });
  }, []);

  const isWatched = useCallback(
    (id: string) => watched.some(d => d.id === id),
    [watched]
  );

  return { watched, watch, unwatch, toggle, isWatched };
}
