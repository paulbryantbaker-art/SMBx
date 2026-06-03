import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import './marketing.css';
import { MarketingNav, MarketingFooter } from './MarketingChrome';
import { YuliaFab } from './YuliaChat';

/**
 * Wraps every logged-out marketing page. Provides the `.mkt` scope (so the
 * design system tokens + component styles apply here and nowhere else), the
 * sticky nav, the footer, and the floating Yulia chat (FAB).
 *
 * `dark` is unused at the shell level — individual sections opt into `.dark`.
 */
export function MarketingShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  // Reset scroll to the top on every route change. wouter reuses this shell
  // instance across marketing routes, and the footer (which holds the nav
  // links) sits at the page bottom — so without this, navigating from the
  // footer would land the next page still scrolled to the bottom.
  // The marketing scroll container is <body> (height:100vh + overflow:auto),
  // NOT the window/<html> — so reset all candidates to be robust.
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, [location]);

  // Marketing pages scroll naturally; the app locks body scroll on desktop,
  // so we release it while a marketing page is mounted.
  useEffect(() => {
    const prevOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    return () => {
      document.documentElement.style.overflow = prevOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  return (
    <div className="mkt">
      <MarketingNav />
      <main>{children}</main>
      <MarketingFooter />
      <YuliaFab />
    </div>
  );
}
