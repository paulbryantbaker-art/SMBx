import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import './index.css';

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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
