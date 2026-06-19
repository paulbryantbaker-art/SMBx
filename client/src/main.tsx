import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import './index.css';
// cdTokens is the CD token layer — still imported because the interactive
// canvas models (components/models/*) consume its --cd-* tokens on mobile.
import './styles/cdTokens.css';
// nd.css (.nd-root desktop shell layer) removed with the desktop UI on
// 2026-06-16 — nothing mounts that scope anymore.

/* ─── Global run-to-completion click feedback ───
   :active in CSS only fires while the button is physically held. Fast
   clicks release before the animation plays. We pair the CSS :active
   rule with a JS-added .just-clicked class that triggers a 240ms
   "punch" keyframe from clickPunch — runs to completion regardless of
   how fast the click happens. Self-cleans via animationend. */
if (typeof window !== 'undefined') {
  const attachPunch = (el: Element) => {
    el.classList.remove('just-clicked');
    void (el as HTMLElement).offsetWidth; // reflow so a rapid second click retriggers
    el.classList.add('just-clicked');
    const onEnd = () => {
      el.classList.remove('just-clicked');
      el.removeEventListener('animationend', onEnd);
    };
    el.addEventListener('animationend', onEnd);
  };
  const isInteractive = (el: Element): Element | null => {
    // Walk up 4 ancestors max looking for a click target
    let cur: Element | null = el;
    for (let i = 0; i < 5 && cur; i++) {
      const tag = cur.tagName;
      const role = cur.getAttribute('role');
      const ariaDisabled = cur.getAttribute('aria-disabled');
      const isDisabled = (cur as HTMLButtonElement).disabled === true || ariaDisabled === 'true';
      if (!isDisabled && (tag === 'BUTTON' || role === 'button' || cur.classList.contains('btn'))) {
        return cur;
      }
      cur = cur.parentElement;
    }
    return null;
  };
  document.addEventListener('pointerdown', (e) => {
    const target = e.target as Element | null;
    if (!target) return;
    const btn = isInteractive(target);
    if (btn) attachPunch(btn);
  });
}

/* ─── Stale back-forward-cache guard ───
   The legacy "mobile-everywhere" app (V6Mobile) pushed #tab history entries, so a
   back/forward swipe could restore a stale bfcache snapshot of the OLD mobile UI
   on top of the new Atlas shell. The Atlas shells (desktop + mobile) use internal
   state, not browser history — so if the browser restores a page from the
   back-forward cache (pageshow.persisted), reload to render the CURRENT build
   instead of a stale snapshot. reload() loads fresh (not from bfcache), so this
   does not loop (the next pageshow has persisted === false). */
if (typeof window !== 'undefined') {
  window.addEventListener('pageshow', (e) => {
    if ((e as PageTransitionEvent).persisted) window.location.reload();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
