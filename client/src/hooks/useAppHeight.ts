import { useEffect } from 'react';

export function useAppHeight() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const app = document.getElementById('app-root');
    if (!app) return;

    function onViewportChange() {
      app!.style.height = vv!.height + 'px';
      app!.style.top = vv!.offsetTop + 'px';
    }

    vv.addEventListener('resize', onViewportChange);
    vv.addEventListener('scroll', onViewportChange);
    onViewportChange();

    return () => {
      vv.removeEventListener('resize', onViewportChange);
      vv.removeEventListener('scroll', onViewportChange);
    };
  }, []);
}
