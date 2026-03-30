import { useState, useEffect, useLayoutEffect, useCallback } from 'react';

type ThemePref = 'light' | 'dark' | 'system';
const STORAGE_KEY = 'smbx-theme';
const LIGHT_COLOR = '#f9f9fc';
const DARK_COLOR = '#1a1c1e';

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

  // Smooth transition during toggle — temporary class removed after animation
  root.classList.add('theme-transition');
  setTimeout(() => root.classList.remove('theme-transition'), 350);

  // Toggle .dark class (Tailwind class strategy)
  root.classList.toggle('dark', isDark);

  // Native UI: scrollbars, form controls, over-scroll
  root.style.colorScheme = isDark ? 'dark' : 'light';

  // Safari toolbar via theme-color meta tags
  const color = isDark ? DARK_COLOR : LIGHT_COLOR;
  const metas = document.querySelectorAll('meta[name="theme-color"]');

  if (isManual) {
    // Manual override: remove media attrs and set both to same color
    metas.forEach(m => {
      m.removeAttribute('media');
      m.setAttribute('content', color);
    });
  } else {
    // System mode: restore media queries so Safari auto-switches
    metas.forEach(m => {
      const media = m.getAttribute('media') || '';
      if (media.includes('dark')) m.setAttribute('content', DARK_COLOR);
      else m.setAttribute('content', LIGHT_COLOR);
    });
  }

  // Safari uses body + html background for toolbar colors
  document.body.style.setProperty('background-color', color, 'important');
  root.style.setProperty('background-color', color, 'important');

  // Update color-scheme meta tag
  const csMeta = document.querySelector('meta[name="color-scheme"]') as HTMLMetaElement | null;
  if (csMeta) csMeta.content = isDark ? 'dark' : 'light';
}

export function useDarkMode() {
  const [pref, setPref] = useState<ThemePref>(() => {
    if (typeof window === 'undefined') return 'system';
    return (localStorage.getItem(STORAGE_KEY) as ThemePref) || 'system';
  });

  const [dark, setDarkResolved] = useState(() => resolve(pref));

  // Apply to DOM whenever resolved state changes
  useLayoutEffect(() => {
    applyDark(dark, pref !== 'system');
  }, [dark, pref]);

  // Listen for system changes
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
  }, []);

  return [dark, setDark] as const;
}

export function DarkModeToggle({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  return (
    <button
      onClick={() => setDark(!dark)}
      className={`fixed z-50 w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 ${dark ? 'bg-white/10 backdrop-blur-sm border border-white/10 text-[#f9f9fc]' : 'bg-[#1a1c1e] text-[#E8709A]'}`}
      style={{ top: 16, right: 16 }}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="material-symbols-outlined text-[22px]">
        {dark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
}
