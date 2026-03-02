import { useEffect } from 'react';

export function useAppHeight() {
  useEffect(() => {
    const vv = window.visualViewport;

    function onViewportChange() {
      const h = vv ? vv.height : window.innerHeight;
      const t = vv ? vv.offsetTop : 0;

      document.documentElement.style.setProperty('--app-height', h + 'px');
      document.documentElement.style.setProperty('--app-top', t + 'px');
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
  }, []);
}
