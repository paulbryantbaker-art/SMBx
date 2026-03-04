import { useEffect } from 'react';

/**
 * Chat mode (enabled=true):  pins #app-root with position:fixed and
 * shrinks height to visualViewport.height so the dock sits above the
 * iOS keyboard.  Body scroll is locked to prevent page-level bouncing.
 *
 * Landing (enabled=false):  removes all inline styles so CSS 100dvh
 * takes over and the keyboard simply overlays the page.
 */
export function useAppHeight(enabled = true) {
  useEffect(() => {
    const app = document.getElementById('app-root');
    if (!app) return;

    if (!enabled) {
      app.style.removeProperty('height');
      app.style.removeProperty('position');
      app.style.removeProperty('top');
      app.style.removeProperty('left');
      app.style.removeProperty('right');
      app.style.removeProperty('bottom');
      document.body.style.removeProperty('overflow');
      return;
    }

    // Lock body scroll so iOS can't bounce the page behind the fixed container
    document.body.style.overflow = 'hidden';

    const vv = window.visualViewport;

    function onResize() {
      const el = document.getElementById('app-root');
      if (!el) return;

      // position:fixed keeps the container anchored to the layout viewport —
      // no transform needed.  Just shrink height to the visible area.
      el.style.position = 'fixed';
      el.style.top = '0';
      el.style.left = '0';
      el.style.right = '0';
      el.style.bottom = 'auto';
      el.style.height = (vv ? vv.height : window.innerHeight) + 'px';
    }

    // Only listen to resize (keyboard open/close), NOT scroll
    if (vv) vv.addEventListener('resize', onResize);
    window.addEventListener('resize', onResize);
    onResize();

    return () => {
      if (vv) vv.removeEventListener('resize', onResize);
      window.removeEventListener('resize', onResize);

      const el = document.getElementById('app-root');
      if (el) {
        el.style.removeProperty('height');
        el.style.removeProperty('position');
        el.style.removeProperty('top');
        el.style.removeProperty('left');
        el.style.removeProperty('right');
        el.style.removeProperty('bottom');
      }
      document.body.style.removeProperty('overflow');
    };
  }, [enabled]);
}
