import { useEffect } from 'react';

export function useAppHeight() {
  useEffect(() => {
    const vv = window.visualViewport;

    function onViewportChange() {
      const h = vv ? vv.height : window.innerHeight;

      // Set CSS variable for any component that needs it (e.g. PublicLayout)
      document.documentElement.style.setProperty('--app-height', h + 'px');

      // Also target #app-root directly (Home page uses this)
      const app = document.getElementById('app-root');
      if (app) {
        app.style.height = h + 'px';
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
  }, []);
}
