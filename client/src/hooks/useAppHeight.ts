import { useEffect } from 'react';

/**
 * Sets --app-height and --app-offset CSS custom properties on <html>.
 * --app-height  = visualViewport.height (shrinks when iOS keyboard opens)
 * --app-offset  = visualViewport.offsetTop (iOS scrolls the page when keyboard
 *                 opens inside a fixed container — we compensate with translateY)
 *
 * Chat mode (enabled=true):  locks body scroll so iOS can't bounce behind.
 * Landing (enabled=false):   body scroll unlocked, keyboard overlays naturally.
 */
export function useAppHeight(enabled = true) {
  // Always keep --app-height and --app-offset updated
  useEffect(() => {
    const vv = window.visualViewport;

    function update() {
      const h = vv ? vv.height : window.innerHeight;
      const offset = vv ? vv.offsetTop : 0;
      document.documentElement.style.setProperty('--app-height', h + 'px');
      document.documentElement.style.setProperty('--app-offset', offset + 'px');
    }

    if (vv) {
      vv.addEventListener('resize', update);
      vv.addEventListener('scroll', update);
    }
    window.addEventListener('resize', update);
    update();

    return () => {
      if (vv) {
        vv.removeEventListener('resize', update);
        vv.removeEventListener('scroll', update);
      }
      window.removeEventListener('resize', update);
    };
  }, []);

  // Body scroll lock in chat mode only
  useEffect(() => {
    if (enabled) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.removeProperty('overflow');
      };
    }
  }, [enabled]);
}
