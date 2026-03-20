import { useEffect, useState } from 'react';

/**
 * Sets --app-height CSS custom property on <html>.
 * Returns appOffset so the root div can conditionally apply transform
 * (only when keyboard is open — avoids iOS GPU compositing color shift).
 */
export function useAppHeight(enabled = true) {
  const [appOffset, setAppOffset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;

    function update() {
      const h = vv ? vv.height : window.innerHeight;
      const offset = vv ? vv.offsetTop : 0;
      document.documentElement.style.setProperty('--app-height', h + 'px');
      setAppOffset(offset);
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

  return appOffset;
}
