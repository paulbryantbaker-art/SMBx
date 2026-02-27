import { useRef, useCallback, useState, useEffect } from 'react';
import { useLocation } from 'wouter';

const T = {
  cream: "#FAF8F4", fill: "#F3F0EA", white: "#FFFFFF",
  terra: "#D4714E", terraHover: "#BE6342", terraSoft: "#FFF0EB",
  text: "#1A1A18", textMid: "#3D3B37", muted: "#6E6A63", faint: "#A9A49C",
  border: "#DDD9D1",
  shadowCard: "0 1px 4px rgba(26, 26, 24, 0.05)",
  shadowLg: "0 4px 20px rgba(26, 26, 24, 0.08), 0 1px 3px rgba(26, 26, 24, 0.05)",
  shadowXl: "0 8px 32px rgba(26, 26, 24, 0.1), 0 2px 6px rgba(26, 26, 24, 0.05)",
};

const ACTIONS = [
  { key: "sell", label: "Sell my business", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg> },
  { key: "buy", label: "Buy a business", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg> },
  { key: "raise", label: "Raise capital", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" /></svg> },
  { key: "value", label: "Valuation", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> },
  { key: "sba", label: "SBA check", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
];

export default function Home() {
  const [, navigate] = useLocation();
  const [barsVisible, setBarsVisible] = useState(true);
  const lastY = useRef(0);

  // Scroll-direction detection for mobile topbar/dock hide
  const handleScroll = useCallback(() => {
    const y = window.scrollY;
    if (y < 10) {
      setBarsVisible(true);
    } else if (y - lastY.current > 6) {
      setBarsVisible(false);
    } else if (lastY.current - y > 6) {
      setBarsVisible(true);
    }
    lastY.current = y;
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="home-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        .home-root {
          font-family: 'Inter', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          background: ${T.cream};
          min-height: 100dvh;
          position: relative;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── Topbar ── */
        .home-topbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 40;
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 48px;
          background: rgba(250,248,244,0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: transform 0.3s ease;
        }
        @media (max-width: 768px) {
          .home-topbar { padding: 12px 16px; }
        }

        /* ── Logo ── */
        .home-logo {
          font-size: 26px; font-weight: 800; letter-spacing: -0.03em; color: ${T.text};
        }
        @media (max-width: 768px) {
          .home-logo { font-size: 22px; }
        }

        /* ── Icon button ── */
        .home-icon-btn {
          width: 36px; height: 36px; border-radius: 50%;
          background: transparent; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: ${T.textMid}; transition: background 0.15s;
        }
        .home-icon-btn:hover { background: ${T.fill}; }

        /* ── Hero section ── */
        .home-hero {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
          min-height: 100dvh;
          padding: 60px 40px 40px;
          max-width: 1200px; margin: 0 auto; width: 100%;
        }
        @media (max-width: 1100px) {
          .home-hero { padding: 60px 40px 24px; }
        }
        @media (max-width: 768px) {
          .home-hero { padding: 60px 20px 24px; }
        }

        /* ── Headline ── */
        .home-h1 {
          font-size: 88px; font-weight: 800; line-height: 1.06;
          letter-spacing: -0.035em; color: ${T.text};
          margin-bottom: 32px;
          animation: fadeUp 0.5s ease both;
        }
        @media (max-width: 1100px) {
          .home-h1 { font-size: 64px; margin-bottom: 20px; }
        }
        @media (max-width: 768px) {
          .home-h1 { font-size: 40px; margin-bottom: 16px; }
        }

        /* ── Subtitle ── */
        .home-sub {
          font-size: 23px; color: ${T.muted}; line-height: 1.5;
          font-weight: 400; max-width: 540px;
          margin-bottom: 72px;
          animation: fadeUp 0.5s ease 0.08s both;
        }
        @media (max-width: 1100px) {
          .home-sub { font-size: 19px; max-width: 440px; margin-bottom: 40px; }
        }
        @media (max-width: 768px) {
          .home-sub { font-size: 17px; max-width: 320px; margin-bottom: 28px; }
        }

        /* ── Dock wrapper ── */
        .home-dock-wrap {
          width: 100%; max-width: 680px;
          animation: fadeUp 0.5s ease 0.16s both;
        }
        @media (max-width: 1100px) {
          .home-dock-wrap { max-width: 540px; }
        }
        @media (max-width: 768px) {
          .home-dock-wrap { max-width: 100%; }
        }

        /* ── Dock card ── */
        .home-dock {
          background: ${T.white};
          border-radius: 26px;
          box-shadow: ${T.shadowXl};
          border: 1.5px solid rgba(212,113,78,0.3);
          cursor: pointer;
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        .home-dock:hover {
          box-shadow: ${T.shadowXl}, 0 0 0 2px rgba(212,113,78,0.15);
        }
        @media (max-width: 1100px) {
          .home-dock { border-radius: 22px; }
        }
        @media (max-width: 768px) {
          .home-dock { border-radius: 20px; }
        }

        .home-dock-placeholder {
          padding: 24px 28px 12px;
          font-size: 20px; color: ${T.faint}; line-height: 1.5;
        }
        @media (max-width: 1100px) {
          .home-dock-placeholder { padding: 18px 22px 10px; font-size: 17px; }
        }
        @media (max-width: 768px) {
          .home-dock-placeholder { padding: 16px 20px 8px; font-size: 16px; }
        }

        .home-dock-actions {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 20px 18px;
        }
        @media (max-width: 1100px) {
          .home-dock-actions { padding: 0 16px 14px; }
        }
        @media (max-width: 768px) {
          .home-dock-actions { padding: 0 14px 12px; }
        }

        .home-dock-plus {
          width: 36px; height: 36px; border-radius: 50%;
          background: ${T.fill}; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #8C877D; transition: background 0.15s;
        }
        .home-dock-plus:hover { background: ${T.border}; }

        /* ── Chips ── */
        .home-chips {
          display: flex; flex-wrap: wrap; justify-content: center;
          gap: 10px; margin-top: 48px;
          animation: fadeUp 0.5s ease 0.28s both;
        }
        @media (max-width: 1100px) {
          .home-chips { gap: 8px; margin-top: 28px; }
        }
        @media (max-width: 768px) {
          .home-chips { gap: 6px; margin-top: 20px; }
        }

        .home-chips-label {
          font-size: 15px; color: ${T.faint}; font-weight: 500;
          padding: 7px 0; margin-right: 2px;
        }
        @media (max-width: 1100px) {
          .home-chips-label { font-size: 13px; }
        }
        @media (max-width: 768px) {
          .home-chips-label { display: none; }
        }

        .home-chip {
          display: flex; align-items: center; gap: 5px;
          padding: 9px 18px; border-radius: 100px;
          background: transparent;
          border: 1px solid rgba(221,217,209,0.6);
          cursor: pointer;
          font-size: 14px; font-weight: 500; color: ${T.muted};
          font-family: 'Inter', system-ui, sans-serif;
          transition: all 0.2s; white-space: nowrap;
        }
        .home-chip:hover {
          background: ${T.white};
          border-color: ${T.border};
          box-shadow: ${T.shadowCard};
          color: ${T.text};
        }
        @media (max-width: 1100px) {
          .home-chip { padding: 7px 14px; font-size: 13px; }
        }
        @media (max-width: 768px) {
          .home-chip { padding: 6px 12px; font-size: 12px; }
        }

        /* ── Mobile scroll-hide for topbar ── */
        @media (max-width: 768px) {
          .home-topbar.hidden { transform: translateY(-100%); }
        }
      `}</style>

      {/* ═══ TOPBAR ═══ */}
      <header className={`home-topbar${!barsVisible ? ' hidden' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button className="home-icon-btn" aria-label="Menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          </button>
          <div className="home-logo">
            smb<span style={{ color: T.terra }}>x</span>.ai
          </div>
        </div>
        <button className="home-icon-btn" onClick={() => navigate('/login')} aria-label="Sign in">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
        </button>
      </header>

      {/* ═══ HERO ═══ */}
      <main className="home-hero">
        <h1 className="home-h1">
          Sell a business.<br />Buy a business.<br />Raise capital.
        </h1>

        <p className="home-sub">
          AI-powered M&A advisory. From first question to closing day.
        </p>

        {/* Dock */}
        <div className="home-dock-wrap">
          <div className="home-dock" onClick={() => navigate('/chat')}>
            <div className="home-dock-placeholder">
              Tell Yulia about your deal...
            </div>
            <div className="home-dock-actions">
              <button className="home-dock-plus" aria-label="Attach">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </button>
              <div style={{ width: 36, height: 36 }} />
            </div>
          </div>
        </div>

        {/* Chips */}
        <div className="home-chips">
          <span className="home-chips-label">Try:</span>
          {ACTIONS.map(c => (
            <button key={c.key} className="home-chip" onClick={() => navigate('/chat')}>
              <span style={{ color: T.terra, display: 'flex' }}>{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
