import { useState, useEffect, useLayoutEffect, useCallback } from 'react';

type ThemePref = 'light' | 'dark' | 'system';
const STORAGE_KEY = 'smbx-theme';
// 2026-04-28: body bg is now read from CSS tokens at runtime instead
// of hardcoded constants. This module forces body bg inline (Safari
// toolbar tinting) — previously a constant duplicated --canvas-warm
// from CSS, requiring lockstep updates in 3 places. Now: change the
// token in CSS, the inline body bg follows automatically.
//
// Fallback hexes are kept only for the rare case where CSS hasn't
// resolved yet (very early useLayoutEffect on first paint).
const LIGHT_FALLBACK = '#EFE6D5';
const DARK_FALLBACK  = '#1A1814';

function bodyColorFor(isDark: boolean): string {
  if (typeof window === 'undefined') {
    return isDark ? DARK_FALLBACK : LIGHT_FALLBACK;
  }
  // Read the canonical color from CSS at apply time. For dark mode we
  // use --canvas-deep (defined in :root or html.dark scope), for light
  // we use --canvas-warm. trim() handles the leading space CSS adds.
  const cs = getComputedStyle(document.documentElement);
  const tokenName = isDark ? '--canvas-deep' : '--canvas-warm';
  const fallback = isDark ? DARK_FALLBACK : LIGHT_FALLBACK;
  const value = cs.getPropertyValue(tokenName).trim();
  return value || fallback;
}

function getSystemDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolve(pref: ThemePref): boolean {
  if (pref === 'dark') return true;
  if (pref === 'light') return false;
  return getSystemDark();
}

function applyDark(isDark: boolean, isManual: boolean) {
  const root = document.documentElement;
  const color = bodyColorFor(isDark);

  // Smooth transition during toggle
  root.classList.add('theme-transition');
  setTimeout(() => root.classList.remove('theme-transition'), 350);

  // Toggle .dark class (Tailwind class strategy)
  root.classList.toggle('dark', isDark);

  // Native UI: scrollbars, form controls, over-scroll
  root.style.colorScheme = isDark ? 'dark' : 'light';

  // Safari toolbar via theme-color meta tags — must match the actual body color
  const metas = document.querySelectorAll('meta[name="theme-color"]');
  if (isManual) {
    metas.forEach(m => {
      m.removeAttribute('media');
      m.setAttribute('content', color);
    });
  } else {
    metas.forEach(m => m.setAttribute('content', color));
  }

  // Safari reads body/html bg for toolbar — must override !important from CSS
  document.body.style.setProperty('background-color', color, 'important');
  root.style.setProperty('background-color', color, 'important');

  // Update color-scheme meta tag
  const csMeta = document.querySelector('meta[name="color-scheme"]') as HTMLMetaElement | null;
  if (csMeta) csMeta.content = isDark ? 'dark' : 'light';
}

export function useDarkMode() {
  const [pref, setPref] = useState<ThemePref>(() => {
    if (typeof window === 'undefined') return 'light';
    // Default to light mode — floating elements (sidebar, canvas, journey,
    // bars) are light. Body + chat pane are always dark via forced CSS.
    const stored = localStorage.getItem(STORAGE_KEY) as ThemePref | null;
    return stored || 'light';
  });

  const [dark, setDarkResolved] = useState(() => resolve(pref));

  useLayoutEffect(() => {
    applyDark(dark, pref !== 'system');
  }, [dark, pref]);

  useEffect(() => {
    if (pref !== 'system') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setDarkResolved(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [pref]);

  // Re-apply body bg + meta theme-color when the viewport crosses the
  // mobile breakpoint (rotation, window resize, browser zoom).
  // This is what makes the iOS Safari toolbar match the actual page color.
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const handler = () => applyDark(dark, pref !== 'system');
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [dark, pref]);

  const setDark = useCallback((wantDark: boolean) => {
    const newPref: ThemePref = wantDark ? 'dark' : 'light';
    setPref(newPref);
    setDarkResolved(wantDark);
    localStorage.setItem(STORAGE_KEY, newPref);
    // Swap favicon for dark/light mode
    if ((window as any).__setFavicon) (window as any).__setFavicon(wantDark);
  }, []);

  return [dark, setDark] as const;
}

export function DarkModeToggle({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  return (
    <button
      onClick={() => setDark(!dark)}
      className={`hidden md:flex fixed z-50 w-10 h-10 rounded-full items-center justify-center border-none cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 ${dark ? 'bg-[#1a1918] text-[#ec9d78] border border-[#141413]' : 'bg-[#1a1918] text-[#ec9d78]'}`}
      style={{ top: 16, right: 16 }}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="material-symbols-outlined text-[22px]">
        {dark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
}
