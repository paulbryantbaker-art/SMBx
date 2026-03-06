import { useEffect } from 'react';

/**
 * Sets --app-height CSS custom property on <html> to match the visual viewport.
 * Components use `height: var(--app-height, 100vh)` instead of h-dvh.
 *
 * Chat mode (enabled=true):  locks body scroll so iOS can't bounce behind.
 * Landing (enabled=false):   body scroll unlocked, keyboard overlays naturally.
 *
 * The #app-root component is responsible for applying position:fixed in chat
 * mode — this hook only provides the CSS var and body scroll lock.
 */
export function useAppHeight(enabled = true) {
  // Always keep --app-height updated (visual viewport height)
  useEffect(() => {
    const vv = window.visualViewport;

    function update() {
      const h = vv ? vv.height : window.innerHeight;
      document.documentElement.style.setProperty('--app-height', h + 'px');
    }

    if (vv) vv.addEventListener('resize', update);
    window.addEventListener('resize', update);
    update();

    return () => {
      if (vv) vv.removeEventListener('resize', update);
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
