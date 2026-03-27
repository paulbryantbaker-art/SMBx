import { useEffect, useState } from 'react';

/**
 * Sets --app-height CSS custom property on <html>, which #root uses
 * for its height (see index.css). This handles keyboard resize on iOS.
 * Returns appOffset for translateY when keyboard pushes content up.
 */
export function useAppHeight(_enabled = true) {
  const [appOffset, setAppOffset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;

    function update() {
      const fullHeight = window.innerHeight;
      const vvHeight = vv ? vv.height : fullHeight;
      const offset = vv ? vv.offsetTop : 0;

      // Only constrain height when keyboard is open (>100px shrinkage).
      // Otherwise remove --app-height so CSS fallback (100dvh) fills
      // the full viewport including behind iOS 26 Liquid Glass bars.
      const keyboardOpen = (fullHeight - vvHeight) > 100;
      if (keyboardOpen) {
        document.documentElement.style.setProperty('--app-height', vvHeight + 'px');
      } else {
        document.documentElement.style.removeProperty('--app-height');
      }
      setAppOffset(keyboardOpen ? offset : 0);
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

  // Body overflow: hidden is now in index.css (always applied)
  // No need for runtime toggle

  return { appOffset };
}
