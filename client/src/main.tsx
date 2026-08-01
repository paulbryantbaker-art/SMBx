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

/* ─── Recover from a stale chunk after a deploy (2026-08-01) ───
   Every route in this app is a lazy import, so a page left open across a
   deploy is holding an index.html that names chunks which no longer exist —
   the build rehashes all of them. Tap a link and the import 404s. React
   propagates that to the error boundary and the visitor gets "Something went
   wrong" for what is really just an out-of-date tab.

   Vite fires `vite:preloadError` for exactly this. Reloading picks up the new
   index.html and the new chunk names, so the correct response is to do it
   silently rather than to explain it.

   THE GUARD IS THE LOAD-BEARING PART. If the chunk is missing for any reason
   OTHER than a deploy — a bad upload, a CDN hole — reloading fails the same
   way, and an unguarded handler turns one broken import into an infinite
   reload loop that is far worse than the error screen. One attempt per
   session, recorded before the reload so the flag survives it; if the reload
   does not fix it, the boundary shows and the visitor sees the real problem.
   preventDefault stops Vite from also throwing the error we just handled. */
window.addEventListener('vite:preloadError', (e) => {
  const KEY = 'smbx_chunk_reload';
  if (sessionStorage.getItem(KEY)) return; // already tried — let it surface
  try { sessionStorage.setItem(KEY, String(Date.now())); } catch { /* private mode */ }
  e.preventDefault();
  window.location.reload();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
