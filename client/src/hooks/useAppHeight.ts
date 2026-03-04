import { useEffect } from 'react';

/**
 * In chat mode (enabled=true):  pins #app-root with position:fixed,
 * shrinks height to visualViewport.height, and offsets by offsetTop
 * so the dock sits above the iOS keyboard.
 *
 * On landing (enabled=false):  removes all inline styles so CSS 100dvh
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
      app.style.removeProperty('transform');
      return;
    }

    const vv = window.visualViewport;

    function onViewportChange() {
      const el = document.getElementById('app-root');
      if (!el) return;

      if (vv) {
        el.style.position = 'fixed';
        el.style.left = '0';
        el.style.right = '0';
        el.style.top = '0';
        el.style.bottom = 'auto';
        el.style.height = vv.height + 'px';
        // offsetTop accounts for iOS scrolling the page when keyboard opens
        el.style.transform = `translateY(${vv.offsetTop}px)`;
      } else {
        el.style.height = window.innerHeight + 'px';
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
      // Clean up inline styles
      const el = document.getElementById('app-root');
      if (el) {
        el.style.removeProperty('height');
        el.style.removeProperty('position');
        el.style.removeProperty('top');
        el.style.removeProperty('left');
        el.style.removeProperty('right');
        el.style.removeProperty('bottom');
        el.style.removeProperty('transform');
      }
    };
  }, [enabled]);
}
