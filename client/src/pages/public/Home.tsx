import { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import Markdown from 'react-markdown';
import { useAnonymousChat } from '../../hooks/useAnonymousChat';
import ChatDock, { type ChatDockHandle } from '../../components/shared/ChatDock';
import InlineSignupCard from '../../components/chat/InlineSignupCard';
import Logo from '../../components/public/Logo';

/* ═══ DESIGN TOKENS ═══ */

const T = {
  bg: '#F6F5F1', fill: '#F3F0EA', white: '#FFFFFF',
  terra: '#D4714E', terraHover: '#BE6342', terraSoft: '#FFF0EB',
  text: '#1A1A18', sub: '#525252', muted: '#6E6A63', faint: '#A9A49C',
  border: '#DDD9D1',
};

/* ═══ PROMPT CHIPS ═══ */

const PROMPT_CHIPS = [
  { key: 'buy-services', label: 'I want to buy a home services business in Texas.', fill: 'I want to buy a home services business in Texas.' },
  { key: 'valuation', label: 'Help me understand what my company might be worth.', fill: 'Help me understand what my company might be worth.' },
  { key: 'sba', label: 'Screen this deal for SBA financing fit.', fill: 'Screen this deal for SBA financing fit.' },
  { key: 'prepare', label: 'Show me what I should prepare before going to market.', fill: 'Show me what I should prepare before going to market.' },
];

/* ═══ LEARN CARDS ═══ */

const LEARN_CARDS = [
  {
    title: 'How Yulia works',
    desc: 'Four steps from conversation to deliverables.',
    cta: 'See how it works',
    href: '/how-it-works',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
  },
  {
    title: 'Intelligence engine',
    desc: '80+ verticals, real transaction data, live market conditions.',
    cta: 'Explore the data',
    href: '/how-it-works',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  },
  {
    title: 'Deal workspace',
    desc: 'One place for every document, every party.',
    cta: 'See the workspace',
    href: '/enterprise',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    title: 'Every journey',
    desc: 'Sell, buy, raise, integrate — any deal size.',
    cta: 'View journeys',
    href: '/sell',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
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

  /* Hero standalone textarea state */
  const [heroText, setHeroText] = useState('');
  const heroInputRef = useRef<HTMLTextAreaElement>(null);
  const [inputActive, setInputActive] = useState(false);
  const activeTimer = useRef<ReturnType<typeof setTimeout>>();

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

  // Chat-phase dock send handler
  const handleSend = useCallback((text: string) => {
    enterChat();
    sendMessage(text);
    dockRef.current?.clear();
  }, [enterChat, sendMessage]);

  // Hero textarea send handler
  const handleHeroSend = useCallback(() => {
    const text = heroText.trim();
    if (!text) return;
    setHeroText('');
    enterChat();
    sendMessage(text);
  }, [heroText, enterChat, sendMessage]);

  // Chip click — fill textarea and focus (don't auto-send)
  const handleChipClick = useCallback((fill: string) => {
    setHeroText(fill);
    setInputActive(true);
    clearTimeout(activeTimer.current);
    activeTimer.current = setTimeout(() => setInputActive(false), 900);
    setTimeout(() => heroInputRef.current?.focus(), 50);
  }, []);

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
          background: ${T.bg};
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
          align-items: center; text-align: center;
          padding: 140px 40px 80px;
          max-width: 80rem; margin: 0 auto; width: 100%;
          position: relative; z-index: 1;
        }
        @media (max-width: 1100px) { .home-hero { padding: 120px 40px 60px; } }
        @media (max-width: 768px)  { .home-hero { padding: 100px 20px 48px; } }

        .home-h1 {
          font-size: 72px; font-weight: 600; line-height: 1.05;
          letter-spacing: -0.05em; color: ${T.text};
          margin: 0 0 24px; animation: fadeUp 0.6s ease both;
        }
        @media (max-width: 1100px) { .home-h1 { font-size: 56px; margin-bottom: 20px; } }
        @media (max-width: 768px)  { .home-h1 { font-size: 40px; margin-bottom: 18px; } }

        .home-sub {
          font-size: 18px; color: ${T.sub}; line-height: 1.75;
          font-weight: 400; max-width: 560px; margin: 0 0 56px;
          animation: fadeUp 0.6s ease 0.08s both;
        }
        @media (max-width: 1100px) { .home-sub { font-size: 17px; max-width: 480px; margin-bottom: 44px; } }
        @media (max-width: 768px)  { .home-sub { font-size: 16px; max-width: 360px; margin-bottom: 36px; } }

        /* ── 3-Layer chat card ── */
        .home-card-outer {
          width: 100%; max-width: 900px;
          border-radius: 34px;
          border: 1px solid rgba(0,0,0,0.10);
          background: rgba(255,255,255,0.84);
          backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
          box-shadow: 0 24px 80px rgba(0,0,0,0.07);
          padding: 20px;
          animation: fadeUp 0.6s ease 0.16s both;
        }
        @media (max-width: 768px) { .home-card-outer { border-radius: 28px; padding: 14px; } }

        .home-card-inner {
          border-radius: 28px;
          border: 1px solid rgba(0,0,0,0.10);
          background: #FAFAF8;
          padding: 24px;
        }
        @media (max-width: 768px) { .home-card-inner { border-radius: 22px; padding: 18px; } }

        .home-card-label {
          font-size: 14px; font-weight: 600; color: #0a0a0a;
          text-align: left; margin-bottom: 16px; display: block;
        }

        .home-input-card {
          border-radius: 26px;
          border: 1px solid rgba(0,0,0,0.10);
          background: #FFFFFF;
          box-shadow: 0 12px 32px rgba(0,0,0,0.05);
          padding: 24px;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .home-input-card.active {
          border-color: rgba(212,113,78,0.45);
          box-shadow: 0 0 0 4px rgba(212,113,78,0.10);
        }
        @media (max-width: 768px) { .home-input-card { border-radius: 22px; padding: 18px; } }

        .home-hero-textarea {
          width: 100%; min-height: 160px; resize: none;
          background: transparent; border: none; outline: none;
          font-size: 17px; line-height: 2; color: #171717;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .home-hero-textarea::placeholder { color: #a3a3a3; }
        @media (max-width: 768px) { .home-hero-textarea { min-height: 130px; font-size: 16px; } }

        .home-hero-send-row {
          border-top: 1px solid rgba(0,0,0,0.10);
          margin-top: 16px; padding-top: 16px;
          display: flex; justify-content: flex-end;
        }
        .home-hero-send {
          width: 48px; height: 48px; border-radius: 9999px;
          background: ${T.terra}; color: #fff; border: none;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(212,113,78,0.3);
          transition: all 0.15s;
          font-family: inherit;
        }
        .home-hero-send:hover { background: ${T.terraHover}; transform: scale(1.02); }
        .home-hero-send:disabled { opacity: 0.5; cursor: default; transform: none; }
        .home-hero-send:disabled:hover { background: ${T.terra}; }

        /* ── Prompt chips ── */
        .home-chips {
          display: flex; flex-wrap: wrap; justify-content: center;
          gap: 8px; margin-top: 24px; max-width: 900px;
          animation: fadeUp 0.6s ease 0.28s both;
        }

        .home-chip {
          padding: 10px 16px; border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.10);
          background: rgba(255,255,255,0.88);
          cursor: pointer; font-size: 14px; font-weight: 400;
          color: ${T.sub};
          font-family: 'Inter', system-ui, sans-serif;
          transition: all 0.15s;
          white-space: normal; text-align: left;
        }
        .home-chip:hover { background: #fff; color: #0a0a0a; }
        .home-chip:active { transform: scale(0.97); }

        /* ── Learn cards ── */
        .home-learn {
          width: 100%; max-width: 900px;
          margin-top: 64px; padding: 0 0 60px;
          animation: fadeUp 0.6s ease 0.4s both;
        }
        @media (max-width: 1100px) { .home-learn { margin-top: 48px; max-width: 720px; } }
        @media (max-width: 768px)  { .home-learn { margin-top: 40px; max-width: 100%; } }

        .home-learn-card {
          display: flex; flex-direction: column;
          height: 100%;
          border-radius: 24px;
          border: 1px solid rgba(0,0,0,0.10);
          background: rgba(255,255,255,0.84);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.05);
          padding: 20px;
          text-align: left; text-decoration: none; color: inherit;
          transition: all 0.2s;
        }
        .home-learn-card:hover {
          transform: translateY(-2px);
          background: #fff;
        }

        .home-learn-inner {
          display: flex; flex-direction: column;
          flex: 1;
          border-radius: 20px;
          border: 1px solid rgba(0,0,0,0.08);
          background: #FFFFFF;
          padding: 16px;
        }

        .home-learn-icon {
          width: 44px; height: 44px; border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.10);
          background: white;
          display: flex; align-items: center; justify-content: center;
          color: #0a0a0a;
        }

        .home-learn-title {
          font-size: 18px; font-weight: 600;
          letter-spacing: -0.02em;
          color: #0a0a0a;
          margin: 20px 0 0; line-height: 1.3;
        }

        .home-learn-desc {
          font-size: 14px; line-height: 1.75;
          color: ${T.sub};
          margin: 12px 0 0; flex: 1;
        }

        .home-learn-cta {
          display: flex; align-items: center; justify-content: space-between;
          border-top: 1px solid rgba(0,0,0,0.10);
          padding-top: 16px; margin-top: 20px;
        }
        .home-learn-cta-text {
          font-size: 14px; font-weight: 500;
          color: #0a0a0a; padding-right: 12px;
        }
        .home-learn-cta-btn {
          width: 40px; height: 40px; border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.10);
          background: white;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; color: #0a0a0a;
          transition: background 0.15s;
        }
        .home-learn-card:hover .home-learn-cta-btn {
          background: rgba(0,0,0,0.05);
        }

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

      {/* ═══ AMBIENT BACKGROUND ═══ */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', left: '-10%', top: '-10%',
          width: '28rem', height: '28rem', borderRadius: '9999px',
          background: 'rgba(255,255,255,0.70)', filter: 'blur(48px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-12%', right: '-8%',
          width: '34rem', height: '34rem', borderRadius: '9999px',
          background: 'rgba(233,228,218,0.70)', filter: 'blur(48px)',
        }} />
      </div>

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
          <h1 className="home-h1">Start with the deal.</h1>
          <p className="home-sub">
            AI-powered M&A advisory. From first question to closing day.
          </p>

          {/* 3-layer card-in-card chat input */}
          <div className="home-card-outer">
            <div className="home-card-inner">
              <span className="home-card-label">Talk through the deal</span>
              <div className={`home-input-card${inputActive ? ' active' : ''}`}>
                <textarea
                  ref={heroInputRef}
                  value={heroText}
                  onChange={e => setHeroText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleHeroSend(); }
                  }}
                  placeholder="Tell Yulia about your deal..."
                  rows={5}
                  className="home-hero-textarea"
                />
                <div className="home-hero-send-row">
                  <button
                    onClick={handleHeroSend}
                    className="home-hero-send"
                    disabled={!heroText.trim()}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M5 12l7-7 7 7" /><path d="M12 19V5" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Prompt chips */}
          <div className="home-chips">
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
                  <div className="home-learn-inner">
                    <div className="home-learn-icon">{card.icon}</div>
                    <h3 className="home-learn-title">{card.title}</h3>
                    <p className="home-learn-desc">{card.desc}</p>
                    <div className="home-learn-cta">
                      <span className="home-learn-cta-text">{card.cta}</span>
                      <span className="home-learn-cta-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </span>
                    </div>
                  </div>
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
