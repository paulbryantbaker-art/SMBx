import { useEffect, type ReactNode } from 'react';
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
