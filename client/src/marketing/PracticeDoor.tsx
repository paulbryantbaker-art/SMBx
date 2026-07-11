/**
 * The practice front door — the only logged-out surface after the 2026-07-11
 * pivot (THE LINE v2): smbX.ai is a private buy-side corp-dev practice, not a
 * public product. No funnel, no pricing page, no anonymous chat — one quiet
 * page and the team sign-in. The retired product-marketing pages remain in
 * marketing/pages/ (unrouted) as a repurposing pool for a future practice site.
 */
import { useLocation } from 'wouter';
import './marketing.css';

export default function PracticeDoor() {
  const [, navigate] = useLocation();
  return (
    <div className="mk">
      <div className="mk-blob mk-blob-green" aria-hidden />
      <div className="mk-blob mk-blob-blue" aria-hidden />

      <header className="mk-navwrap">
        <div className="mk-nav" style={{ maxWidth: 720 }}>
          <img src="/logo-green-x.png" alt="smbX.ai" className="mk-logo-img" />
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{
              background: 'var(--mk-ink-glass)',
              color: '#fff',
              border: '1px solid var(--mk-ink-bd)',
              borderRadius: 999,
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Sign in
          </button>
        </div>
      </header>

      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(36px, 7vw, 80px) 20px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ width: 'min(700px, 100%)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 className="mk-h1" style={{ fontSize: 'clamp(32px, 4.4vw, 54px)' }}>
            Buy-side corp development,
            <br />
            <em>as a service.</em>
          </h1>
          <p className="mk-lead" style={{ marginTop: 26, maxWidth: '40em' }}>
            smbX.ai is a private acquisition practice. We run buy-side deals for acquirers,
            through close — sourcing, analysis, modeling, diligence coordination, and driving
            the negotiation to signing — with an AI deal team doing the work of a full
            analyst bench.
          </p>
          <p style={{ margin: '26px 0 0', fontSize: 16, fontWeight: 700, color: 'var(--mk-ink)' }}>
            Buy-side only. One buyer per target. Never both sides of a deal.
          </p>
          <p style={{ margin: '14px 0 0', fontSize: 14.5, lineHeight: 1.65, color: 'var(--mk-ink-3)', maxWidth: '40em' }}>
            We serve individual buyers, family offices, private equity, and strategic
            acquirers on targets under $250M revenue. Engagements are by referral.
          </p>
        </div>
      </main>

      <footer
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '22px 20px 30px',
          textAlign: 'center',
          fontSize: 12.5,
          color: 'var(--mk-faint)',
        }}
      >
        <a href="/legal/terms" style={{ color: 'var(--mk-ink-3)' }}>Terms</a>
        <span style={{ margin: '0 8px' }}>·</span>
        <a href="/legal/privacy" style={{ color: 'var(--mk-ink-3)' }}>Privacy</a>
        <span style={{ margin: '0 8px' }}>·</span>
        © 2026 smbX.ai
      </footer>
    </div>
  );
}
