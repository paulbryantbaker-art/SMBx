import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('smbx-dark') === '1';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('smbx-dark', '1');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('smbx-dark', '0');
    }
    // Force Safari to re-read theme-color by removing and re-inserting the meta
    const color = dark ? '#1a1c1e' : '#ffffff';
    document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.remove());
    const fresh = document.createElement('meta');
    fresh.name = 'theme-color';
    fresh.content = color;
    document.head.appendChild(fresh);
    // Force body background (Safari reads this for bottom toolbar)
    document.body.style.backgroundColor = color;
    // Sync color-scheme meta (Safari reads this for system-level chrome)
    let csMeta = document.querySelector('meta[name="color-scheme"]') as HTMLMetaElement;
    if (!csMeta) {
      csMeta = document.createElement('meta');
      csMeta.name = 'color-scheme';
      document.head.appendChild(csMeta);
    }
    csMeta.content = dark ? 'dark' : 'light';
    // Sync color-scheme CSS property on root
    root.style.colorScheme = dark ? 'dark' : 'light';
  }, [dark]);

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
