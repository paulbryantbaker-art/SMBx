/**
 * Scroll-triggered `.reveal`s.
 *
 * The original `.reveal` animation was MOUNT-triggered: it played as React
 * mounted the page, so every below-the-fold reveal finished animating long
 * before the visitor scrolled to it — most of the site's motion was literally
 * invisible. This module arms each reveal only when it actually enters the
 * viewport.
 *
 * Failure-safe by construction: the CSS only pauses reveals under
 * `.mkt.mkt-io` (animation-play-state), and `.mkt-io` is added here AFTER the
 * IntersectionObserver is live. No JS, no IO support, an exception — and every
 * reveal simply plays on mount exactly as before. Content can never be stuck
 * hidden.
 *
 * A MutationObserver registers reveals that mount later (wouter route changes
 * reuse the persistent MarketingShell; conditional renders add reveals at any
 * time).
 */
export function armRevealObserver(root: HTMLElement): () => void {
  if (typeof IntersectionObserver === 'undefined') return () => {};

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }
    },
    // Fire slightly before the element fully arrives so the motion is seen.
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );

  const register = (scope: ParentNode) => {
    scope.querySelectorAll('.reveal:not(.is-in)').forEach((el) => io.observe(el));
  };

  register(root);
  root.classList.add('mkt-io');

  const mo = new MutationObserver((muts) => {
    for (const m of muts) {
      m.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;
        const el = node as Element;
        if (el.classList?.contains('reveal')) io.observe(el);
        register(el);
      });
    }
  });
  mo.observe(root, { childList: true, subtree: true });

  return () => {
    mo.disconnect();
    io.disconnect();
    root.classList.remove('mkt-io');
  };
}
