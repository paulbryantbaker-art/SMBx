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
    // Sync Safari/mobile browser chrome — force all theme-color metas
    const color = dark ? '#1a1c1e' : '#ffffff';
    document.querySelectorAll('meta[name="theme-color"]').forEach(m => {
      m.setAttribute('content', color);
      m.removeAttribute('media'); // remove media so Safari uses the value unconditionally
    });
    // Sync color-scheme for Safari tab bar + native controls
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
