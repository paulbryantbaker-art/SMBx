/**
 * Client-side practice-mode flag (THE LINE v2 pivot, 2026-07-11).
 * Sourced from GET /api/config { practiceMode } and cached for the session —
 * used to swap product-billing UI for the practice notice.
 */
import { useEffect, useState } from 'react';

let cached: boolean | null = null;

export function usePracticeMode(): boolean | null {
  const [pm, setPm] = useState<boolean | null>(cached);
  useEffect(() => {
    if (cached !== null) return;
    let alive = true;
    fetch('/api/config')
      .then(r => r.json())
      .then(c => {
        cached = !!c.practiceMode;
        if (alive) setPm(cached);
      })
      .catch(() => { if (alive) setPm(false); });
    return () => { alive = false; };
  }, []);
  return pm;
}
