import { useState, useEffect, useLayoutEffect, useCallback } from 'react';

type ThemePref = 'light' | 'dark' | 'system';
const STORAGE_KEY = 'smbx-theme';
const LIGHT_COLOR = '#151617'; // body is always dark — JS keeps it dark in both modes
const DARK_COLOR = '#151617';

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
  const color = isDark ? DARK_COLOR : LIGHT_COLOR;

  // Smooth transition during toggle
  root.classList.add('theme-transition');
  setTimeout(() => root.classList.remove('theme-transition'), 350);

  // Toggle .dark class (Tailwind class strategy)
  root.classList.toggle('dark', isDark);

  // Native UI: scrollbars, form controls, over-scroll
  root.style.colorScheme = isDark ? 'dark' : 'light';

  // Safari toolbar via theme-color meta tags
  const metas = document.querySelectorAll('meta[name="theme-color"]');
  if (isManual) {
    metas.forEach(m => {
      m.removeAttribute('media');
      m.setAttribute('content', color);
    });
  } else {
    metas.forEach(m => {
      const media = m.getAttribute('media') || '';
      if (media.includes('dark')) m.setAttribute('content', DARK_COLOR);
      else m.setAttribute('content', LIGHT_COLOR);
    });
  }

  // Safari reads body/html bg for toolbar — must override !important from CSS
  document.body.style.setProperty('background-color', color, 'important');
  root.style.setProperty('background-color', color, 'important');

  // Update color-scheme meta tag
  const csMeta = document.querySelector('meta[name="color-scheme"]') as HTMLMetaElement | null;
  if (csMeta) csMeta.content = isDark ? 'dark' : 'light';

  // Background layers are now position:absolute (not fixed) so Safari
  // reads body/html bg for toolbar, not the background layers.
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
      className={`hidden md:flex fixed z-50 w-10 h-10 rounded-full items-center justify-center border-none cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 ${dark ? 'bg-[#1a1c1e] text-[#E8709A] border border-[#2A2C2E]' : 'bg-[#1a1c1e] text-[#E8709A]'}`}
      style={{ top: 16, right: 16 }}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="material-symbols-outlined text-[22px]">
        {dark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
}
