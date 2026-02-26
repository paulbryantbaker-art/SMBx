import { useEffect } from 'react';

export function useAppHeight() {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    let rafId: number;
    const update = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          '--app-height',
          `${viewport.height}px`
        );
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
