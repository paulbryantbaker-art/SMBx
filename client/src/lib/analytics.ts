/**
 * Analytics — lightweight event tracking via sendBeacon.
 * No third-party analytics. Everything stays in PostgreSQL.
 */

export function trackEvent(type: string, data?: Record<string, any>) {
  try {
    const sessionId = localStorage.getItem('smbx_anon_session') || localStorage.getItem('smbx_session_id');
    const token = localStorage.getItem('smbx_token');
    const payload = JSON.stringify({
      event_type: type,
      event_data: {
        ...data,
        url: window.location.pathname,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
      },
      session_id: sessionId,
      token,
    });

    // sendBeacon is fire-and-forget, doesn't block navigation
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/event', new Blob([payload], { type: 'application/json' }));
    } else {
      // Fallback for older browsers
      fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Analytics should never crash the app
  }
}
