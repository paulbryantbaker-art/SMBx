import React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global error boundary — catches React component crashes, reports to the
 * backend `support_issues` table, shows recovery UI.
 *
 * It wraps EVERYTHING, app and public site alike, which has two consequences
 * that were both wrong until 2026-08-01:
 *
 *   - It was still painted in the terra-cotta wireframe palette (#D4714E on
 *     #faf9f5, in Figtree) — a system retired in July 2026 and listed in
 *     DESIGN.md's dead table. `npm run test:design` did not catch it because
 *     that suite reads the practice stylesheets, and this is a component with
 *     inline styles. So the one screen a visitor sees when the site breaks was
 *     the only screen still wearing a dead brand.
 *   - Its copy was written for a logged-in practitioner ("Yulia has been
 *     notified. Your work is saved") and shown verbatim to a stranger reading
 *     a research report, where it names a person they have never heard of and
 *     promises to save work they never did.
 *
 * Tokens are inlined rather than imported from house/tokens.ts on purpose:
 * this component has to render when the app is broken, and an import is one
 * more thing that can be the reason it is broken. The values are checked
 * against the tokens by the design suite instead.
 */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);

    // Report to backend — fire and forget
    fetch('/api/support/client-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        componentStack: info.componentStack,
        url: window.location.href,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        userAgent: navigator.userAgent,
      }),
    }).catch(() => {});
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
          background: '#FFFFFF',
          color: '#16181A',
        }}>
          <div style={{ maxWidth: 440, textAlign: 'center' }}>
            <h1 style={{
              fontFamily: "'Fraunces', Georgia, serif", fontOpticalSizing: 'auto', fontWeight: 545,
              fontSize: 30, letterSpacing: '-0.01em', marginBottom: 14,
            }}>
              Something went wrong
            </h1>
            {/* True for a practitioner and for a stranger reading a report,
                which the old copy was not — and specifically true of the most
                common cause, a tab left open across a deploy. */}
            <p style={{ fontSize: 16, color: '#4A4F54', marginBottom: 26, lineHeight: 1.65 }}>
              This page hit an error and it has been reported. Refreshing usually fixes it.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '14px 30px',
                borderRadius: 999,
                background: '#B8431E',
                color: '#fff',
                border: 'none',
                fontSize: 15.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Refresh the page
            </button>
            <p style={{ fontSize: 12, color: '#7C8187', marginTop: 18, lineHeight: 1.5 }}>
              {this.state.error?.message}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
