import { useEffect } from 'react';

/**
 * Shrinks #app-root to visualViewport.height so the bottom dock
 * sits above the iOS keyboard.  Pass `enabled = false` on screens
 * where the keyboard should simply overlay (e.g. landing page hero).
 */
export function useAppHeight(enabled = true) {
  useEffect(() => {
    const app = document.getElementById('app-root');
    if (!enabled) {
      // Remove any inline height so CSS 100dvh takes over
      if (app) app.style.removeProperty('height');
      return;
    }

    const vv = window.visualViewport;

    function onViewportChange() {
      const h = vv ? vv.height : window.innerHeight;

      document.documentElement.style.setProperty('--app-height', h + 'px');

      const el = document.getElementById('app-root');
      if (el) {
        el.style.height = h + 'px';
      }
    }

    if (vv) {
      vv.addEventListener('resize', onViewportChange);
      vv.addEventListener('scroll', onViewportChange);
    }
    window.addEventListener('resize', onViewportChange);
    onViewportChange();

    return () => {
      if (vv) {
        vv.removeEventListener('resize', onViewportChange);
        vv.removeEventListener('scroll', onViewportChange);
      }
      window.removeEventListener('resize', onViewportChange);
    };
  }, [enabled]);
}
