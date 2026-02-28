import { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import Markdown from 'react-markdown';
import { useAnonymousChat } from '../../hooks/useAnonymousChat';
import ChatDock, { type ChatDockHandle } from '../../components/shared/ChatDock';
import InlineSignupCard from '../../components/chat/InlineSignupCard';
import Logo from '../../components/public/Logo';

/* ═══ DESIGN TOKENS ═══ */

const T = {
  cream: '#FAF8F4', fill: '#F3F0EA', white: '#FFFFFF',
  terra: '#D4714E', terraHover: '#BE6342', terraSoft: '#FFF0EB',
  text: '#1A1A18', textMid: '#3D3B37', muted: '#6E6A63', faint: '#A9A49C',
  border: '#DDD9D1',
  shadowCard: '0 1px 4px rgba(26, 26, 24, 0.05)',
  shadowXl: '0 8px 32px rgba(26, 26, 24, 0.1), 0 2px 6px rgba(26, 26, 24, 0.05)',
};

/* ═══ PROMPT CHIPS ═══ */

const PROMPT_CHIPS = [
  { key: 'sell', label: 'I want to sell my business', fill: 'I want to sell my business — ' },
  { key: 'value', label: "What's my business worth?", fill: "What's my business worth? I own a " },
  { key: 'buy', label: 'Help me find businesses to buy', fill: "Help me find businesses to buy — I'm looking for " },
  { key: 'raise', label: "I'm raising capital", fill: "I'm raising capital for my " },
];

/* ═══ LEARN CARDS ═══ */

const LEARN_CARDS = [
  {
    title: 'How Yulia works',
    desc: 'Tell her about your deal. She handles analysis, documents, and strategy. Four steps from conversation to deliverables.',
    href: '/how-it-works',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
  },
  {
    title: 'Intelligence engine',
    desc: '80+ industry verticals, real transaction data, Census economics, live market conditions. Analysis, not guesses.',
    href: '/how-it-works',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  },
  {
    title: 'Your deal workspace',
    desc: 'Invite your broker, attorney, CPA. One place for every document, every party, every decision.',
    href: '/enterprise',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    title: 'Every deal journey',
    desc: 'Sell, buy, raise capital, integrate. From $400K landscaping exits to $40M PE roll-ups.',
    href: '/sell',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
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
    if (phase !== 'chat') {
      window.history.pushState({ homeChat: true }, '', window.location.pathname + '#chat');
      setPhase('chat');
    }
  }, [phase]);

  // If user lands on /#chat with existing messages, show chat
  useEffect(() => {
    if (window.location.hash.includes('chat') && hasMessages && phase === 'landing') {
      setPhase('chat');
    }
  }, [hasMessages, phase]);

  // Browser back — return to landing
  useEffect(() => {
    const onPop = () => {
      if (!window.location.hash.includes('chat')) {
        setPhase('landing');
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

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

  // Chip click — fill and send
  const handleChipClick = useCallback((fill: string) => {
    enterChat();
    sendMessage(fill);
  }, [enterChat, sendMessage]);

  // Scroll-hide topbar on mobile — listen to messages container in chat, window on landing
  const handleScroll = useCallback((e?: Event) => {
    const target = e?.target as HTMLElement | null;
    const y = target && target !== document.documentElement ? target.scrollTop : window.scrollY;
    if (y < 10) setBarsVisible(true);
    else if (y - lastY.current > 6) setBarsVisible(false);
    else if (lastY.current - y > 6) setBarsVisible(true);
    lastY.current = y;
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (phase === 'chat' && el) {
      el.addEventListener('scroll', handleScroll, { passive: true });
      return () => el.removeEventListener('scroll', handleScroll);
    } else {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll, phase]);

  // Show signup card when messages are running low or limit reached
  const showSignup = limitReached || (messagesRemaining !== null && messagesRemaining <= 5 && hasMessages);

  return (
    <div className={`home-root${phase === 'chat' ? ' in-chat' : ''}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadePulse { 0%, 100% { opacity: .4; } 50% { opacity: 1; } }

        .home-root {
          font-family: 'Inter', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          background: ${T.cream};
          min-height: 100dvh;
          display: flex; flex-direction: column;
        }
        .home-root.in-chat {
          height: 100dvh;
          max-height: 100dvh;
          overflow: hidden;
        }

        /* ── Floating pill nav ── */
        .home-pill {
          position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
          z-index: 50; width: auto;
          backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
          background: rgba(255,255,255,0.85);
          border: 1px solid rgba(221,217,209,0.5);
          box-shadow: 0 4px 20px rgba(26,26,24,.06), 0 1px 3px rgba(26,26,24,.04);
          border-radius: 100px;
          padding: 10px 24px;
          display: flex; align-items: center; gap: 20px;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        @media (max-width: 768px) {
          .home-pill { padding: 10px 16px; gap: 12px; }
          .home-pill.hidden { transform: translateX(-50%) translateY(-120%); opacity: 0; }
        }

        /* ── Landing hero ── */
        .home-hero {
          display: flex; flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 100px 40px 60px;
          max-width: 1200px; margin: 0 auto; width: 100%;
        }
        @media (max-width: 1100px) { .home-hero { padding: 90px 40px 40px; } }
        @media (max-width: 768px)  { .home-hero { padding: 80px 20px 32px; } }

        .home-h1 {
          font-size: 80px; font-weight: 700; line-height: 1.05;
          letter-spacing: -0.04em; color: ${T.text};
          margin: 0 0 20px; animation: fadeUp 0.6s ease both;
        }
        @media (max-width: 1100px) { .home-h1 { font-size: 56px; margin-bottom: 16px; } }
        @media (max-width: 768px)  { .home-h1 { font-size: 38px; margin-bottom: 14px; } }

        .home-sub {
          font-size: 20px; color: ${T.muted}; line-height: 1.6;
          font-weight: 400; max-width: 480px; margin: 0 0 48px;
          animation: fadeUp 0.6s ease 0.08s both;
        }
        @media (max-width: 1100px) { .home-sub { font-size: 18px; max-width: 420px; margin-bottom: 36px; } }
        @media (max-width: 768px)  { .home-sub { font-size: 16px; max-width: 320px; margin-bottom: 28px; } }

        /* ── Card-in-card ── */
        .home-card-outer {
          width: 100%; max-width: 720px;
          background: ${T.white};
          border-radius: 34px;
          box-shadow: 0 8px 40px rgba(26,26,24,.08), 0 2px 8px rgba(26,26,24,.04);
          padding: 12px;
          animation: fadeUp 0.6s ease 0.16s both;
        }
        @media (max-width: 1100px) { .home-card-outer { max-width: 580px; } }
        @media (max-width: 768px)  { .home-card-outer { max-width: 100%; border-radius: 28px; padding: 8px; } }

        .home-card-inner {
          background: ${T.cream};
          border-radius: 26px;
          padding: 24px 24px 8px;
          position: relative;
        }
        @media (max-width: 768px) { .home-card-inner { border-radius: 22px; padding: 16px 16px 4px; } }

        .home-card-label {
          font-size: 11px; font-weight: 600; letter-spacing: 0.12em;
          text-transform: uppercase; color: ${T.faint};
          margin-bottom: 8px; display: block;
        }

        /* ── Prompt chips ── */
        .home-chips {
          display: flex; flex-wrap: wrap; justify-content: center;
          gap: 10px; margin-top: 32px;
          animation: fadeUp 0.6s ease 0.28s both;
        }
        @media (max-width: 1100px) { .home-chips { gap: 8px; margin-top: 24px; } }
        @media (max-width: 768px)  { .home-chips { gap: 6px; margin-top: 20px; } }

        .home-chips-label { font-size: 14px; color: ${T.faint}; font-weight: 500; padding: 9px 0; }
        @media (max-width: 768px)  { .home-chips-label { display: none; } }

        .home-chip {
          padding: 10px 20px; border-radius: 100px;
          background: transparent; border: 1px solid rgba(221,217,209,0.6);
          cursor: pointer; font-size: 14px; font-weight: 500; color: ${T.muted};
          font-family: 'Inter', system-ui, sans-serif;
          transition: all 0.2s; white-space: nowrap;
        }
        .home-chip:hover { background: ${T.white}; border-color: ${T.border}; box-shadow: ${T.shadowCard}; color: ${T.text}; }
        .home-chip:active { transform: scale(0.97); }
        @media (max-width: 1100px) { .home-chip { padding: 8px 16px; font-size: 13px; } }
        @media (max-width: 768px)  { .home-chip { padding: 8px 14px; font-size: 12px; } }

        /* ── Learn cards ── */
        .home-learn {
          width: 100%; max-width: 780px;
          margin-top: 80px; padding: 0 0 40px;
          animation: fadeUp 0.6s ease 0.4s both;
        }
        @media (max-width: 1100px) { .home-learn { margin-top: 60px; max-width: 580px; } }
        @media (max-width: 768px)  { .home-learn { margin-top: 48px; max-width: 100%; } }

        .home-learn-card {
          display: flex; flex-direction: column;
          background: ${T.white}; border: 1px solid rgba(221,217,209,0.4);
          border-radius: 24px; padding: 28px;
          text-decoration: none; color: inherit;
          transition: all 0.2s;
        }
        .home-learn-card:hover {
          box-shadow: 0 4px 20px rgba(26,26,24,.07), 0 1px 3px rgba(26,26,24,.04);
          transform: translateY(-2px);
          border-color: ${T.border};
        }

        .home-learn-icon {
          width: 44px; height: 44px; border-radius: 14px;
          background: ${T.terraSoft};
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px; color: ${T.terra};
        }

        .home-learn-title {
          font-size: 17px; font-weight: 700; color: ${T.text};
          margin: 0 0 6px;
        }

        .home-learn-desc {
          font-size: 14px; color: ${T.muted}; line-height: 1.55;
          margin: 0 0 16px; flex: 1;
        }

        .home-learn-arrow {
          display: flex; align-items: center; gap: 4px;
          font-size: 13px; font-weight: 600; color: ${T.terra};
          transition: transform 0.2s;
        }
        .home-learn-card:hover .home-learn-arrow { transform: translateX(4px); }

        /* ── Chat phase ── */
        .home-chat {
          flex: 1; display: flex; flex-direction: column;
          min-height: 0;
        }
        .home-messages {
          flex: 1; overflow-y: auto; padding: 72px 16px 8px;
          min-height: 0;
          max-width: 860px; margin: 0 auto; width: 100%;
          -webkit-overflow-scrolling: touch;
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

        .home-dock-bottom {
          transition: transform 0.3s ease;
        }
        @media (max-width: 768px) { .home-dock-bottom.hidden { transform: translateY(100%); } }
      `}</style>

      {/* ═══ FLOATING PILL NAV ═══ */}
      <header className={`home-pill${!barsVisible ? ' hidden' : ''}`}>
        <Logo />
        <button
          className="bg-transparent border-none cursor-pointer p-1 text-[#3D3B37] flex items-center"
          onClick={() => navigate('/login')}
          aria-label="Sign in"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </header>

      {/* ═══ LANDING PHASE ═══ */}
      {phase === 'landing' && (
        <main className="home-hero">
          <h1 className="home-h1">
            Start with<br />the deal.
          </h1>
          <p className="home-sub">
            AI-powered M&A advisory. From first question to closing day.
          </p>

          {/* Card-in-card chat input */}
          <div className="home-card-outer">
            <div className="home-card-inner">
              <span className="home-card-label">Talk through the deal</span>
              <ChatDock ref={dockRef} onSend={handleSend} disabled={sending || limitReached} variant="hero" />
            </div>
          </div>

          {/* Prompt suggestion chips */}
          <div className="home-chips">
            <span className="home-chips-label">Suggested:</span>
            {PROMPT_CHIPS.map(c => (
              <button key={c.key} className="home-chip" onClick={() => handleChipClick(c.fill)}>
                {c.label}
              </button>
            ))}
          </div>

          {/* Learn cards */}
          <section className="home-learn">
            <div className="learn-cards">
              {LEARN_CARDS.map(card => (
                <Link key={card.title} href={card.href} className="home-learn-card">
                  <div className="home-learn-icon">{card.icon}</div>
                  <h3 className="home-learn-title">{card.title}</h3>
                  <p className="home-learn-desc">{card.desc}</p>
                  <span className="home-learn-arrow">
                    Learn more
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                  </span>
                </Link>
              ))}
            </div>
          </section>
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
            <div className={`home-dock-bottom${!barsVisible ? ' hidden' : ''}`}>
              <ChatDock ref={dockRef} onSend={handleSend} disabled={sending} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
