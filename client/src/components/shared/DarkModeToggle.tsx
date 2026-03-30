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
  const color = isDark ? DARK_COLOR : LIGHT_COLOR;

  // Smooth transition
  root.classList.add('theme-transition');
  setTimeout(() => root.classList.remove('theme-transition'), 350);

  // 1. Toggle .dark class
  root.classList.toggle('dark', isDark);

  // 2. Native UI
  root.style.colorScheme = isDark ? 'dark' : 'light';

  // 3. color-scheme meta
  const csMeta = document.querySelector('meta[name="color-scheme"]') as HTMLMetaElement | null;
  if (csMeta) csMeta.content = isDark ? 'dark' : 'light';

  // 4. body + html background — Safari 26 reads this for toolbar
  document.body.style.setProperty('background-color', color, 'important');
  root.style.setProperty('background-color', color, 'important');

  // 5. theme-color meta tags — Safari 15-18 (remove + recreate for reliability)
  document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.remove());
  if (isManual) {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = color;
    document.head.appendChild(meta);
  } else {
    const lightMeta = document.createElement('meta');
    lightMeta.name = 'theme-color';
    lightMeta.content = LIGHT_COLOR;
    lightMeta.setAttribute('media', '(prefers-color-scheme: light)');
    document.head.appendChild(lightMeta);
    const darkMeta = document.createElement('meta');
    darkMeta.name = 'theme-color';
    darkMeta.content = DARK_COLOR;
    darkMeta.setAttribute('media', '(prefers-color-scheme: dark)');
    document.head.appendChild(darkMeta);
  }

  // 6. Safari 26 toolbar sentinel — fixed element near viewport edge
  let sentinel = document.getElementById('safari-tint-sentinel');
  if (!sentinel) {
    sentinel = document.createElement('div');
    sentinel.id = 'safari-tint-sentinel';
    sentinel.setAttribute('aria-hidden', 'true');
    Object.assign(sentinel.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '1px',
      pointerEvents: 'none',
      zIndex: '99999',
    });
    document.body.appendChild(sentinel);
  }
  sentinel.style.setProperty('background-color', color, 'important');
}

export function useDarkMode() {
  const [pref, setPref] = useState<ThemePref>(() => {
    if (typeof window === 'undefined') return 'system';
    return (localStorage.getItem(STORAGE_KEY) as ThemePref) || 'system';
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
