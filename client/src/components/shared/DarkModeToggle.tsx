import { useState, useEffect, useCallback } from 'react';

type ThemePref = 'light' | 'dark' | 'system';
const STORAGE_KEY = 'smbx-theme';
const LIGHT_COLOR = '#f9f9fc';
const DARK_COLOR = '#0f1012';

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

  // Toggle .dark class (Tailwind class strategy)
  root.classList.toggle('dark', isDark);

  // Native UI: scrollbars, form controls, over-scroll
  root.style.colorScheme = isDark ? 'dark' : 'light';

  // Safari toolbar via theme-color meta tags
  const metas = document.querySelectorAll('meta[name="theme-color"]');
  if (isManual) {
    // Manual override: set both to the same color
    const color = isDark ? DARK_COLOR : LIGHT_COLOR;
    metas.forEach(m => m.setAttribute('content', color));
  } else {
    // System mode: restore media queries so Safari auto-switches
    metas.forEach(m => {
      const media = m.getAttribute('media') || '';
      if (media.includes('dark')) m.setAttribute('content', DARK_COLOR);
      else m.setAttribute('content', LIGHT_COLOR);
      // Re-add media attrs if they were stripped by a previous manual override
      if (!m.hasAttribute('media')) {
        // Can't reliably restore, so just set the current color
        m.setAttribute('content', isDark ? DARK_COLOR : LIGHT_COLOR);
      }
    });
  }

  // Safari uses body background for bottom toolbar / over-scroll
  document.body.style.backgroundColor = isDark ? DARK_COLOR : LIGHT_COLOR;

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
  useEffect(() => {
    applyDark(dark, pref !== 'system');
  }, [dark, pref]);

  // Persist preference
  useEffect(() => {
    if (pref === 'system') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, pref);
    }
  }, [pref]);

  // Listen for OS-level mode changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      // Only follow OS if user hasn't set a manual preference
      if (pref === 'system') {
        setDarkResolved(e.matches);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [pref]);

  // Simple toggle: dark ↔ light (sets manual preference)
  const setDark = useCallback((v: boolean) => {
    const next: ThemePref = v ? 'dark' : 'light';
    setPref(next);
    setDarkResolved(v);
  }, []);

  return [dark, setDark] as const;
}

export function DarkModeToggle({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  return (
    <button
      onClick={() => setDark(!dark)}
      className="fixed z-50 w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 bg-[#1a1c1e] text-[#d81b60]"
      style={{ top: 16, right: 16 }}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="material-symbols-outlined text-[22px]">
        {dark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
}
