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
  text: '#1A1A18', textMid: '#3D3B37', sub: '#525252', muted: '#6E6A63', faint: '#A9A49C',
  border: '#DDD9D1',
  shadowCard: '0 1px 4px rgba(26, 26, 24, 0.05)',
};

/* ═══ PROMPT CHIPS ═══ */

const PROMPT_CHIPS = [
  { key: 'sell', label: 'I want to sell my business' },
  { key: 'value', label: "What's my business worth?" },
  { key: 'buy', label: 'Help me find a business to buy' },
  { key: 'raise', label: "I'm raising capital" },
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
  const [heroInputActive, setHeroInputActive] = useState(false);

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
    enterChat();
    sendMessage(text);
    setHeroText('');
  }, [heroText, enterChat, sendMessage]);

  // Hero textarea keydown — Enter sends, Shift+Enter newline
  const handleHeroKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleHeroSend();
    }
  }, [handleHeroSend]);

  // Chip click — fill textarea and focus (don't auto-send)
  const handleChipClick = useCallback((label: string) => {
    setHeroText(label);
    heroInputRef.current?.focus();
    setHeroInputActive(true);
    setTimeout(() => setHeroInputActive(false), 900);
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

        /* ── Ambient blur circles ── */
        .home-ambient {
          position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
        }
        .home-ambient-1 {
          position: absolute; border-radius: 50%;
          width: 600px; height: 600px; top: -120px; right: -100px;
          background: radial-gradient(circle, rgba(212,113,78,0.06) 0%, transparent 70%);
        }
        .home-ambient-2 {
          position: absolute; border-radius: 50%;
          width: 500px; height: 500px; bottom: -80px; left: -120px;
          background: radial-gradient(circle, rgba(120,120,180,0.04) 0%, transparent 70%);
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
          padding: 90px 24px 60px;
          max-width: 1200px; margin: 0 auto; width: 100%;
          position: relative; z-index: 1;
        }
        @media (max-width: 1100px) { .home-hero { padding: 90px 24px 48px; } }
        @media (max-width: 768px)  { .home-hero { padding: 80px 20px 40px; } }

        .home-h1 {
          font-size: 72px; font-weight: 600; line-height: 1.05;
          letter-spacing: -0.05em; color: ${T.text};
          margin: 0 0 20px; animation: fadeUp 0.6s ease both;
        }
        @media (max-width: 1100px) { .home-h1 { font-size: 52px; margin-bottom: 16px; } }
        @media (max-width: 768px)  { .home-h1 { font-size: 36px; margin-bottom: 14px; } }

        .home-sub {
          font-size: 19px; color: ${T.sub}; line-height: 1.75;
          font-weight: 400; max-width: 560px; margin: 0 0 40px;
          animation: fadeUp 0.6s ease 0.08s both;
        }
        @media (max-width: 1100px) { .home-sub { font-size: 17px; max-width: 480px; margin-bottom: 32px; } }
        @media (max-width: 768px)  { .home-sub { font-size: 16px; max-width: 340px; margin-bottom: 28px; } }

        /* ── 3-Layer chat card ── */
        .home-card-outer {
          width: 100%; max-width: 720px;
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(255,255,255,0.5);
          border-radius: 28px;
          box-shadow: 0 8px 40px rgba(26,26,24,.07), 0 2px 8px rgba(26,26,24,.03);
          padding: 16px;
          animation: fadeUp 0.6s ease 0.16s both;
        }
        @media (max-width: 1100px) { .home-card-outer { max-width: 580px; } }
        @media (max-width: 768px)  { .home-card-outer { max-width: 100%; border-radius: 22px; padding: 10px; } }

        .home-card-mid {
          background: ${T.fill};
          border-radius: 20px;
          padding: 20px;
        }
        @media (max-width: 768px) { .home-card-mid { border-radius: 16px; padding: 14px; } }

        .home-card-input {
          background: ${T.white};
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 1px 4px rgba(26,26,24,.05);
          border: 1.5px solid transparent;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .home-card-input:focus-within,
        .home-card-input.active {
          border-color: rgba(212,113,78,0.45);
          box-shadow: 0 1px 4px rgba(26,26,24,.05), 0 0 0 4px rgba(212,113,78,0.10);
        }
        @media (max-width: 768px) { .home-card-input { border-radius: 14px; padding: 14px; } }

        .home-textarea {
          width: 100%; min-height: 80px; max-height: 200px;
          border: none; outline: none; resize: none;
          font-size: 15px; line-height: 1.6; color: ${T.text};
          background: transparent; font-family: 'Inter', system-ui, sans-serif;
          display: block;
        }
        .home-textarea::placeholder { color: ${T.faint}; }

        .home-input-divider { height: 1px; background: #E8E4DC; margin: 12px 0; }

        .home-send-row { display: flex; justify-content: flex-end; }

        .home-send-btn {
          width: 48px; height: 48px; border-radius: 50%;
          background: ${T.terra}; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s, opacity 0.2s, transform 0.15s;
          color: #fff;
        }
        .home-send-btn:hover { background: ${T.terraHover}; }
        .home-send-btn:active { transform: scale(0.95); }
        .home-send-btn:disabled { opacity: 0.35; cursor: default; }
        .home-send-btn:disabled:hover { background: ${T.terra}; }
        .home-send-btn:disabled:active { transform: none; }

        /* ── Prompt chips ── */
        .home-chips {
          display: flex; flex-wrap: wrap; justify-content: center;
          gap: 10px; margin-top: 28px;
          animation: fadeUp 0.6s ease 0.28s both;
        }
        @media (max-width: 1100px) { .home-chips { gap: 8px; margin-top: 22px; } }
        @media (max-width: 768px)  { .home-chips { gap: 6px; margin-top: 18px; } }

        .home-chip {
          padding: 10px 18px; border-radius: 16px;
          background: ${T.white}; border: 1px solid rgba(221,217,209,0.5);
          cursor: pointer; font-size: 14px; font-weight: 500; color: ${T.muted};
          font-family: 'Inter', system-ui, sans-serif;
          transition: all 0.2s; white-space: nowrap;
          box-shadow: 0 1px 3px rgba(26,26,24,.03);
        }
        .home-chip:hover { border-color: ${T.border}; box-shadow: ${T.shadowCard}; color: ${T.text}; }
        .home-chip:active { transform: scale(0.97); }
        @media (max-width: 1100px) { .home-chip { padding: 8px 14px; font-size: 13px; } }
        @media (max-width: 768px)  { .home-chip { padding: 8px 12px; font-size: 12px; border-radius: 12px; } }

        /* ── Learn cards ── */
        .home-learn {
          width: 100%; max-width: 900px;
          margin-top: 72px; padding: 0 0 40px;
          animation: fadeUp 0.6s ease 0.4s both;
        }
        @media (max-width: 1100px) { .home-learn { margin-top: 56px; max-width: 600px; } }
        @media (max-width: 768px)  { .home-learn { margin-top: 44px; max-width: 100%; } }

        .home-learn-shell {
          display: flex; flex-direction: column;
          background: rgba(255,255,255,0.5);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(221,217,209,0.35);
          border-radius: 20px; padding: 6px;
          text-decoration: none; color: inherit;
          transition: all 0.25s;
        }
        .home-learn-shell:hover {
          box-shadow: 0 4px 20px rgba(26,26,24,.06);
          transform: translateY(-2px);
        }

        .home-learn-inner {
          background: ${T.white};
          border-radius: 16px;
          padding: 22px;
          display: flex; flex-direction: column;
          flex: 1;
        }

        .home-learn-icon {
          width: 40px; height: 40px; border-radius: 12px;
          background: ${T.fill};
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 14px; color: ${T.muted};
        }

        .home-learn-title {
          font-size: 15px; font-weight: 700; color: ${T.text};
          margin: 0 0 4px;
        }

        .home-learn-desc {
          font-size: 13px; color: ${T.muted}; line-height: 1.5;
          margin: 0 0 16px; flex: 1;
        }

        .home-learn-cta {
          display: flex; align-items: center; justify-content: space-between;
        }

        .home-learn-cta-text {
          font-size: 13px; font-weight: 600; color: ${T.terra};
        }

        .home-learn-arrow-btn {
          width: 32px; height: 32px; border-radius: 50%;
          border: 1px solid ${T.border}; background: transparent;
          display: flex; align-items: center; justify-content: center;
          color: ${T.muted}; transition: all 0.2s;
        }
        .home-learn-shell:hover .home-learn-arrow-btn {
          border-color: ${T.terra}; color: ${T.terra};
          background: ${T.terraSoft};
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

      {/* ═══ AMBIENT BLUR CIRCLES ═══ */}
      <div className="home-ambient">
        <div className="home-ambient-1" />
        <div className="home-ambient-2" />
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
            <div className="home-card-mid">
              <div className={`home-card-input${heroInputActive ? ' active' : ''}`}>
                <textarea
                  ref={heroInputRef}
                  className="home-textarea"
                  placeholder="Tell Yulia about your deal..."
                  value={heroText}
                  onChange={e => setHeroText(e.target.value)}
                  onKeyDown={handleHeroKeyDown}
                  disabled={sending || limitReached}
                  rows={3}
                />
                <div className="home-input-divider" />
                <div className="home-send-row">
                  <button
                    className="home-send-btn"
                    onClick={handleHeroSend}
                    disabled={!heroText.trim() || sending || limitReached}
                    aria-label="Send message"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Prompt suggestion chips */}
          <div className="home-chips">
            {PROMPT_CHIPS.map(c => (
              <button key={c.key} className="home-chip" onClick={() => handleChipClick(c.label)}>
                {c.label}
              </button>
            ))}
          </div>

          {/* Learn cards */}
          <section className="home-learn">
            <div className="learn-cards">
              {LEARN_CARDS.map(card => (
                <Link key={card.title} href={card.href} className="home-learn-shell">
                  <div className="home-learn-inner">
                    <div className="home-learn-icon">{card.icon}</div>
                    <h3 className="home-learn-title">{card.title}</h3>
                    <p className="home-learn-desc">{card.desc}</p>
                    <div className="home-learn-cta">
                      <span className="home-learn-cta-text">{card.cta}</span>
                      <span className="home-learn-arrow-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
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
