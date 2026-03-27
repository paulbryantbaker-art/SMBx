import { useEffect, useState } from 'react';

/**
 * Sets --app-height CSS custom property on <html>.
 * Returns { appOffset, keyboardOpen } so the root div can conditionally
 * apply height + transform only when the virtual keyboard is visible.
 * When keyboard is closed, the shell uses inset:0 to fill the full viewport.
 */
export function useAppHeight(enabled = true) {
  const [appOffset, setAppOffset] = useState(0);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    // Capture the initial viewport height to detect keyboard
    let baseHeight = vv ? vv.height : window.innerHeight;

    function update() {
      const h = vv ? vv.height : window.innerHeight;
      const offset = vv ? vv.offsetTop : 0;
      document.documentElement.style.setProperty('--app-height', h + 'px');
      setAppOffset(offset);

      // Keyboard is open when viewport shrinks significantly (>15% smaller)
      // or when there's a vertical offset (Safari scrolls page up for keyboard)
      const isKeyboard = offset > 0 || h < baseHeight * 0.85;
      setKeyboardOpen(isKeyboard);

      // Update base height when viewport grows (toolbar collapse, orientation)
      // but only when keyboard is NOT open
      if (!isKeyboard && h > baseHeight) {
        baseHeight = h;
      }
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

  return { appOffset, keyboardOpen };
}
