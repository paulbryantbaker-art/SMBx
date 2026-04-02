import React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global error boundary — catches React component crashes,
 * reports to backend support_issues table, shows recovery UI.
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
          fontFamily: 'Inter, system-ui, sans-serif',
          background: '#F9F9FC',
          color: '#1A1A18',
        }}>
          <div style={{ maxWidth: 420, textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'Sora, system-ui', fontSize: 24, fontWeight: 800, marginBottom: 12 }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: 15, color: '#6E6A63', marginBottom: 24, lineHeight: 1.6 }}>
              Yulia has been notified. Your work is saved — try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 28px',
                borderRadius: 999,
                background: '#D44A78',
                color: '#fff',
                border: 'none',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Refresh Page
            </button>
            <p style={{ fontSize: 11, color: '#A9A49C', marginTop: 16 }}>
              {this.state.error?.message}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
