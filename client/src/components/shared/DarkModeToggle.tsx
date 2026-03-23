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
  }, [dark]);

  return [dark, setDark] as const;
}

export function DarkModeToggle({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  return (
    <button
      onClick={() => setDark(!dark)}
      className={`fixed z-50 bg-transparent border-none cursor-pointer p-0 hover:scale-110 active:scale-95 transition-all duration-200 ${
        dark ? 'text-[#f0f0f3]/70' : 'text-[#1a1c1e]/70'
      }`}
      style={{ top: 48, right: 20 }}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="material-symbols-outlined text-[28px]">
        {dark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
}
