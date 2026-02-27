import { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation } from 'wouter';
import Markdown from 'react-markdown';
import { useAnonymousChat } from '../../hooks/useAnonymousChat';
import ChatDock, { type ChatDockHandle } from '../../components/shared/ChatDock';
import InlineSignupCard from '../../components/chat/InlineSignupCard';

/* ═══ DESIGN TOKENS ═══ */

const T = {
  cream: '#FAF8F4', fill: '#F3F0EA', white: '#FFFFFF',
  terra: '#D4714E', terraHover: '#BE6342', terraSoft: '#FFF0EB',
  text: '#1A1A18', textMid: '#3D3B37', muted: '#6E6A63', faint: '#A9A49C',
  border: '#DDD9D1',
  shadowCard: '0 1px 4px rgba(26, 26, 24, 0.05)',
  shadowXl: '0 8px 32px rgba(26, 26, 24, 0.1), 0 2px 6px rgba(26, 26, 24, 0.05)',
};

const CHIPS = [
  { key: 'sell', label: 'Sell my business', fill: 'I want to sell my business — ', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg> },
  { key: 'buy', label: 'Buy a business', fill: 'I want to buy a business — ', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg> },
  { key: 'raise', label: 'Raise capital', fill: 'I need to raise capital for my business — ', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" /></svg> },
  { key: 'value', label: 'Valuation', fill: 'I need a business valuation — I own a ', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> },
  { key: 'sba', label: 'SBA check', fill: "Can this deal get SBA financing? I'm looking at a ", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
];

type Phase = 'landing' | 'chat';

export default function Home() {
  const [, navigate] = useLocation();
  const [phase, setPhase] = useState<Phase>('landing');
  const [barsVisible, setBarsVisible] = useState(true);
  const lastY = useRef(0);
  const dockRef = useRef<ChatDockHandle>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages, sending, streamingText, messagesRemaining,
    limitReached, sendMessage, getSessionId,
  } = useAnonymousChat();

  const hasMessages = messages.length > 0;

  // Enter chat phase — push history so browser back returns to landing
  const enterChat = useCallback(() => {
    if (phase === 'landing') {
      window.history.pushState({ homeChat: true }, '', window.location.pathname + '#chat');
      setPhase('chat');
    }
  }, [phase]);

  // Transition to chat phase on first message
  useEffect(() => {
    if (hasMessages && phase === 'landing') enterChat();
  }, [hasMessages, phase, enterChat]);

  // Browser back — return to landing
  useEffect(() => {
    const onPop = () => {
      if (phase === 'chat' && !window.location.hash.includes('chat')) {
        setPhase('landing');
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [phase]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (phase === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingText, phase]);

  // Send handler
  const handleSend = useCallback((text: string) => {
    enterChat();
    sendMessage(text);
    dockRef.current?.clear();
  }, [enterChat, sendMessage]);

  // Chip click — fill dock and focus
  const handleChipClick = useCallback((fill: string) => {
    enterChat();
    sendMessage(fill);
  }, [enterChat, sendMessage]);

  // Scroll-hide topbar on mobile
  const handleScroll = useCallback(() => {
    const y = window.scrollY;
    if (y < 10) setBarsVisible(true);
    else if (y - lastY.current > 6) setBarsVisible(false);
    else if (lastY.current - y > 6) setBarsVisible(true);
    lastY.current = y;
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Show signup card when messages are running low or limit reached
  const showSignup = limitReached || (messagesRemaining !== null && messagesRemaining <= 5 && hasMessages);

  return (
    <div className="home-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadePulse { 0%, 100% { opacity: .4; } 50% { opacity: 1; } }

        .home-root {
          font-family: 'Inter', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          background: ${T.cream};
          min-height: 100dvh;
          display: flex; flex-direction: column;
        }

        /* ── Topbar ── */
        .home-topbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 40;
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 48px;
          background: rgba(250,248,244,0.95);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          transition: transform 0.3s ease;
        }
        @media (max-width: 768px) { .home-topbar { padding: 12px 16px; } }
        @media (max-width: 768px) { .home-topbar.hidden { transform: translateY(-100%); } }

        .home-logo { font-size: 26px; font-weight: 800; letter-spacing: -0.03em; color: ${T.text}; }
        @media (max-width: 768px) { .home-logo { font-size: 22px; } }

        .home-icon-btn {
          width: 36px; height: 36px; border-radius: 50%;
          background: transparent; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: ${T.textMid}; transition: background 0.15s;
        }
        .home-icon-btn:hover { background: ${T.fill}; }

        /* ── Landing hero ── */
        .home-hero {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
          flex: 1; min-height: 100dvh;
          padding: 60px 40px 40px;
          max-width: 1200px; margin: 0 auto; width: 100%;
        }
        @media (max-width: 1100px) { .home-hero { padding: 60px 40px 24px; } }
        @media (max-width: 768px)  { .home-hero { padding: 60px 20px 24px; } }

        .home-h1 {
          font-size: 88px; font-weight: 800; line-height: 1.06;
          letter-spacing: -0.035em; color: ${T.text};
          margin: 0 0 32px; animation: fadeUp 0.5s ease both;
        }
        @media (max-width: 1100px) { .home-h1 { font-size: 64px; margin-bottom: 20px; } }
        @media (max-width: 768px)  { .home-h1 { font-size: 40px; margin-bottom: 16px; } }

        .home-sub {
          font-size: 23px; color: ${T.muted}; line-height: 1.5;
          font-weight: 400; max-width: 540px; margin: 0 0 72px;
          animation: fadeUp 0.5s ease 0.08s both;
        }
        @media (max-width: 1100px) { .home-sub { font-size: 19px; max-width: 440px; margin-bottom: 40px; } }
        @media (max-width: 768px)  { .home-sub { font-size: 17px; max-width: 320px; margin-bottom: 28px; } }

        .home-dock-wrap {
          width: 100%; max-width: 680px;
          animation: fadeUp 0.5s ease 0.16s both;
        }
        @media (max-width: 1100px) { .home-dock-wrap { max-width: 540px; } }
        @media (max-width: 768px)  { .home-dock-wrap { max-width: 100%; } }

        .home-chips {
          display: flex; flex-wrap: wrap; justify-content: center;
          gap: 10px; margin-top: 48px;
          animation: fadeUp 0.5s ease 0.28s both;
        }
        @media (max-width: 1100px) { .home-chips { gap: 8px; margin-top: 28px; } }
        @media (max-width: 768px)  { .home-chips { gap: 6px; margin-top: 20px; } }

        .home-chips-label { font-size: 15px; color: ${T.faint}; font-weight: 500; padding: 7px 0; margin-right: 2px; }
        @media (max-width: 1100px) { .home-chips-label { font-size: 13px; } }
        @media (max-width: 768px)  { .home-chips-label { display: none; } }

        .home-chip {
          display: flex; align-items: center; gap: 5px;
          padding: 9px 18px; border-radius: 100px;
          background: transparent; border: 1px solid rgba(221,217,209,0.6);
          cursor: pointer; font-size: 14px; font-weight: 500; color: ${T.muted};
          font-family: 'Inter', system-ui, sans-serif;
          transition: all 0.2s; white-space: nowrap;
        }
        .home-chip:hover { background: ${T.white}; border-color: ${T.border}; box-shadow: ${T.shadowCard}; color: ${T.text}; }
        @media (max-width: 1100px) { .home-chip { padding: 7px 14px; font-size: 13px; } }
        @media (max-width: 768px)  { .home-chip { padding: 6px 12px; font-size: 12px; } }

        /* ── Chat phase ── */
        .home-chat {
          flex: 1; display: flex; flex-direction: column;
          min-height: 100dvh;
        }
        .home-messages {
          flex: 1; overflow-y: auto; padding: 72px 16px 8px;
          max-width: 860px; margin: 0 auto; width: 100%;
        }
        @media (min-width: 768px) { .home-messages { padding: 72px 40px 8px; } }

        .home-msg {
          margin-bottom: 20px; animation: fadeUp 0.25s ease both;
        }
        .home-msg-user {
          display: flex; justify-content: flex-end;
        }
        .home-msg-user-bubble {
          max-width: 85%; padding: 12px 18px;
          background: ${T.terraSoft}; color: ${T.text};
          border: 1px solid rgba(212,113,78,0.18);
          border-radius: 20px 20px 4px 20px;
          box-shadow: 0 1px 3px rgba(26,26,24,.06);
          font-size: 15px; line-height: 1.55; word-break: break-word;
        }
        .home-msg-ai {
          display: flex; gap: 10px; align-items: flex-start;
        }
        .home-msg-ai-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: ${T.terra}; color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 2px;
        }
        .home-msg-ai-bubble {
          max-width: 85%; font-size: 15px; line-height: 1.6; color: ${T.text};
        }
        .home-msg-ai-bubble p { margin: 0 0 12px; }
        .home-msg-ai-bubble p:last-child { margin-bottom: 0; }
        .home-msg-ai-bubble strong { font-weight: 600; }
        .home-msg-ai-bubble ul, .home-msg-ai-bubble ol { margin: 0 0 12px; padding-left: 20px; }
        .home-msg-ai-bubble li { margin-bottom: 4px; }

        .home-streaming-dot {
          display: inline-block; width: 6px; height: 6px;
          background: ${T.terra}; border-radius: 50%;
          animation: fadePulse 1s ease-in-out infinite;
          margin-left: 2px; vertical-align: middle;
        }

        .home-remaining {
          text-align: center; padding: 8px; margin-bottom: 12px;
          font-size: 12px; color: ${T.faint}; font-weight: 500;
        }
      `}</style>

      {/* ═══ TOPBAR ═══ */}
      <header className={`home-topbar${!barsVisible ? ' hidden' : ''}`}>
        <div className="home-logo">
          smb<span style={{ color: T.terra }}>x</span>.ai
        </div>
        <button className="home-icon-btn" onClick={() => navigate('/login')} aria-label="Sign in">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
        </button>
      </header>

      {/* ═══ LANDING PHASE ═══ */}
      {phase === 'landing' && (
        <main className="home-hero">
          <h1 className="home-h1">
            Sell a business.<br />Buy a business.<br />Raise capital.
          </h1>
          <p className="home-sub">
            AI-powered M&A advisory. From first question to closing day.
          </p>

          <div className="home-dock-wrap">
            <ChatDock ref={dockRef} onSend={handleSend} disabled={sending || limitReached} />
          </div>

          <div className="home-chips">
            <span className="home-chips-label">Try:</span>
            {CHIPS.map(c => (
              <button key={c.key} className="home-chip" onClick={() => handleChipClick(c.fill)}>
                <span style={{ color: T.terra, display: 'flex' }}>{c.icon}</span>
                {c.label}
              </button>
            ))}
          </div>
        </main>
      )}

      {/* ═══ CHAT PHASE ═══ */}
      {phase === 'chat' && (
        <div className="home-chat">
          {/* Messages */}
          <div className="home-messages" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`home-msg ${m.role === 'user' ? 'home-msg-user' : 'home-msg-ai'}`}>
                {m.role === 'assistant' && <div className="home-msg-ai-avatar">Y</div>}
                {m.role === 'user' ? (
                  <div className="home-msg-user-bubble">{m.content}</div>
                ) : (
                  <div className="home-msg-ai-bubble">
                    <Markdown>{m.content}</Markdown>
                  </div>
                )}
              </div>
            ))}

            {/* Streaming response */}
            {streamingText && (
              <div className="home-msg home-msg-ai">
                <div className="home-msg-ai-avatar">Y</div>
                <div className="home-msg-ai-bubble">
                  <Markdown>{streamingText}</Markdown>
                  <span className="home-streaming-dot" />
                </div>
              </div>
            )}

            {/* Sending indicator */}
            {sending && !streamingText && (
              <div className="home-msg home-msg-ai">
                <div className="home-msg-ai-avatar">Y</div>
                <div className="home-msg-ai-bubble">
                  <span className="home-streaming-dot" />
                </div>
              </div>
            )}

            {/* Messages remaining indicator */}
            {messagesRemaining !== null && messagesRemaining <= 10 && messagesRemaining > 0 && (
              <div className="home-remaining">
                {messagesRemaining} message{messagesRemaining !== 1 ? 's' : ''} remaining — sign up to continue
              </div>
            )}

            {/* Inline signup card */}
            {showSignup && (
              <div style={{ maxWidth: 400, margin: '12px auto 20px' }}>
                <InlineSignupCard sessionId={getSessionId()} canDismiss={!limitReached} />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Dock — pinned to bottom */}
          {!limitReached && (
            <ChatDock ref={dockRef} onSend={handleSend} disabled={sending} />
          )}
        </div>
      )}
    </div>
  );
}
