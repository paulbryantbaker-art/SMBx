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
      className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full shadow-lg shadow-black/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 border-none cursor-pointer ${
        dark
          ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          : 'bg-[#2f3133] text-white hover:bg-[#1a1c1e]'
      }`}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="material-symbols-outlined text-xl">
        {dark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
}
