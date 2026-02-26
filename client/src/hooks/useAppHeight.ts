import { useEffect } from 'react';

export function useAppHeight() {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    let rafId: number;
    const update = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const root = document.documentElement;
        root.style.setProperty('--app-height', `${viewport.height}px`);
        const keyboardOffset = window.innerHeight - viewport.height;
        root.style.setProperty('--keyboard-offset', `${Math.max(0, keyboardOffset)}px`);
      });
    };

    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    update();

    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);
}
