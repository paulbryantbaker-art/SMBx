import { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation } from 'wouter';
import Markdown from 'react-markdown';
import { useAnonymousChat } from '../../hooks/useAnonymousChat';
import ChatDock, { type ChatDockHandle } from '../../components/shared/ChatDock';
import InlineSignupCard from '../../components/chat/InlineSignupCard';
import Sidebar from '../../components/chat/Sidebar';

/* ═══ DESIGN TOKENS ═══ */

const T = {
  bg: '#FAF9F7',
  terra: '#D4714E',
  terraHover: '#BE6342',
  terraSoft: '#FFF0EB',
  text: '#1A1A18',
  sub: '#44403C',
  muted: '#6E6A63',
  faint: '#A9A49C',
  border: '#DDD9D1',
};

/* ═══ SUGGESTIONS ═══ */

const SUGGESTIONS = [
  { key: 'sell', label: 'I want to sell my business', message: 'I want to sell my business. Can you help me understand what it might be worth?' },
  { key: 'worth', label: "What's my business worth?", message: 'Help me understand what my business might be worth.' },
  { key: 'buy', label: 'Help me find a business to buy', message: 'I want to buy a business. Can you help me screen targets?' },
  { key: 'raise', label: "I'm raising capital", message: "I'm raising capital for my business. Can you help me build my strategy?" },
];

/* ═══ GREETING ═══ */

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

type Phase = 'home' | 'chat';

export default function Home() {
  const [, navigate] = useLocation();
  const [phase, setPhase] = useState<Phase>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [barsVisible, setBarsVisible] = useState(true);
  const lastY = useRef(0);
  const dockRef = useRef<ChatDockHandle>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* Hero standalone textarea state */
  const [heroText, setHeroText] = useState('');
  const heroInputRef = useRef<HTMLTextAreaElement>(null);

  const goHome = useCallback(() => {
    if (phase === 'chat') {
      window.history.replaceState(null, '', window.location.pathname);
      setPhase('home');
    }
  }, [phase]);

  const {
    messages, sending, streamingText, messagesRemaining,
    limitReached, sendMessage, getSessionId,
  } = useAnonymousChat();

  const hasMessages = messages.length > 0;

  const enterChat = useCallback(() => {
    if (phase !== 'chat') {
      window.history.pushState({ homeChat: true }, '', window.location.pathname + '#chat');
      setPhase('chat');
    }
  }, [phase]);

  // If user lands on /#chat with existing messages, show chat
  useEffect(() => {
    if (window.location.hash.includes('chat') && hasMessages && phase === 'home') {
      setPhase('chat');
    }
  }, [hasMessages, phase]);

  // Browser back — return to home
  useEffect(() => {
    const onPop = () => {
      if (!window.location.hash.includes('chat')) {
        setPhase('home');
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

  // Suggestion card click — send immediately
  const handleSuggestion = useCallback((message: string) => {
    enterChat();
    sendMessage(message);
  }, [enterChat, sendMessage]);

  // Scroll-hide topbar on mobile
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

  const showSignup = limitReached || (messagesRemaining !== null && messagesRemaining <= 5 && hasMessages);

  return (
    <div className={`home-root${phase === 'chat' ? ' in-chat' : ''}`}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadePulse { 0%, 100% { opacity: .4; } 50% { opacity: 1; } }

        .home-root {
          font-family: 'Inter', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          background: ${T.bg};
          display: flex; flex-direction: row;
          min-height: 100dvh;
        }
        .home-root.in-chat {
          height: 100dvh;
          overflow: hidden;
        }

        .home-main {
          flex: 1; min-width: 0;
          display: flex; flex-direction: column;
        }

        /* ── Topbar ── */
        .home-topbar {
          flex-shrink: 0;
          height: 56px;
          padding: 0 20px;
          padding-top: env(safe-area-inset-top, 0px);
          display: flex; align-items: center; gap: 16px;
          background: ${T.bg};
          border-bottom: 1px solid rgba(26,26,24,0.06);
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        @media (max-width: 768px) {
          .home-topbar.hidden { transform: translateY(-100%); opacity: 0; margin-top: -56px; }
        }

        .home-topbar-btn {
          width: 36px; height: 36px; border-radius: 10px;
          border: none; background: transparent; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: ${T.muted}; transition: background 0.15s;
        }
        .home-topbar-btn:hover { background: rgba(26,26,24,0.04); }

        .home-topbar-logo {
          font-size: 18px; font-weight: 800; letter-spacing: -0.03em;
          font-family: 'Inter', system-ui, sans-serif;
          display: flex; align-items: center; gap: 6px;
        }

        /* ── Home state hero ── */
        .home-hero {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
          padding: 40px 24px 40px;
          max-width: 700px; margin: 0 auto; width: 100%;
        }
        @media (max-width: 768px) {
          .home-hero {
            justify-content: center;
            padding: 24px 18px 28px;
          }
        }

        .home-greeting {
          font-size: 32px; font-weight: 600; line-height: 1.2;
          letter-spacing: -0.03em; color: ${T.text};
          margin: 0 0 6px;
          animation: fadeUp 0.5s ease both;
        }
        @media (max-width: 768px) { .home-greeting { font-size: 26px; } }

        .home-greeting-sub {
          font-size: 32px; font-weight: 600; line-height: 1.2;
          letter-spacing: -0.03em; color: ${T.faint};
          margin: 0 0 36px;
          animation: fadeUp 0.5s ease 0.06s both;
        }
        @media (max-width: 768px) { .home-greeting-sub { font-size: 26px; margin-bottom: 28px; } }

        /* ── Hero input ── */
        .home-hero-input {
          width: 100%; max-width: 620px;
          border-radius: 20px;
          border: 1px solid rgba(26,26,24,0.08);
          background: #FFFFFF;
          box-shadow: 0 2px 12px rgba(26,26,24,0.06);
          padding: 0;
          animation: fadeUp 0.5s ease 0.12s both;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .home-hero-input:focus-within {
          border-color: rgba(212,113,78,0.35);
          box-shadow: 0 2px 12px rgba(26,26,24,0.06), 0 0 0 3px rgba(212,113,78,0.10);
        }

        .home-hero-textarea {
          width: 100%; min-height: 100px; resize: none;
          background: transparent; border: none; outline: none;
          font-size: 16px; line-height: 1.6; color: ${T.text};
          font-family: 'Inter', system-ui, sans-serif;
          padding: 18px 20px 8px;
          box-sizing: border-box;
        }
        .home-hero-textarea::placeholder { color: ${T.faint}; }
        @media (max-width: 768px) { .home-hero-textarea { min-height: 80px; font-size: 15px; padding: 14px 16px 6px; } }

        .home-hero-toolbar {
          display: flex; justify-content: flex-end;
          padding: 8px 16px 14px;
        }
        .home-hero-send {
          width: 36px; height: 36px; border-radius: 9999px;
          background: ${T.terra}; color: #fff; border: none;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(212,113,78,0.3);
          transition: all 0.15s;
          opacity: 0; transform: scale(0.8); pointer-events: none;
        }
        .home-hero-send.visible { opacity: 1; transform: scale(1); pointer-events: auto; }
        .home-hero-send:hover { background: ${T.terraHover}; }

        /* ── Suggestion cards ── */
        .home-suggestions {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 10px; max-width: 620px; width: 100%;
          margin-top: 20px;
          animation: fadeUp 0.5s ease 0.2s both;
        }
        @media (max-width: 480px) {
          .home-suggestions { grid-template-columns: 1fr; gap: 8px; }
        }

        .home-suggestion {
          padding: 14px 16px; border-radius: 14px;
          border: 1px solid rgba(26,26,24,0.07);
          background: #FFFFFF; cursor: pointer;
          font-size: 14px; font-weight: 500; color: ${T.sub};
          font-family: 'Inter', system-ui, sans-serif;
          text-align: left; transition: all 0.15s;
          box-shadow: 0 1px 3px rgba(26,26,24,0.03);
        }
        .home-suggestion:hover {
          background: #FFFFFF; border-color: rgba(212,113,78,0.25);
          box-shadow: 0 2px 8px rgba(26,26,24,0.06);
          color: ${T.text};
        }
        .home-suggestion:active { transform: scale(0.98); }

        /* ── Chat phase ── */
        .home-chat {
          flex: 1; display: flex; flex-direction: column;
          min-height: 0;
        }
        .home-messages {
          flex: 1; overflow-y: auto;
          padding: 20px 16px 8px;
          min-height: 0;
          max-width: 860px; margin: 0 auto; width: 100%;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }
        @media (min-width: 768px) { .home-messages { padding: 24px 40px 8px; } }

        .home-msg {
          margin-bottom: 24px; animation: fadeUp 0.25s ease both;
        }

        /* User message — right-aligned bubble */
        .home-msg-user {
          display: flex; justify-content: flex-end;
        }
        .home-msg-user-bubble {
          max-width: 80%; padding: 12px 18px;
          background: ${T.terraSoft}; color: ${T.text};
          border: 1px solid rgba(212,113,78,0.18);
          border-radius: 20px 20px 4px 20px;
          box-shadow: 0 1px 3px rgba(26,26,24,0.06);
          font-size: 15px; line-height: 1.55; word-break: break-word;
        }

        /* AI message — flat, no bubble */
        .home-msg-ai {
          display: flex; gap: 12px; align-items: flex-start;
        }
        .home-msg-ai-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: ${T.terra}; color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 2px;
        }
        .home-msg-ai-body {
          flex: 1; min-width: 0;
        }
        .home-msg-ai-name {
          font-size: 13px; font-weight: 600; color: ${T.sub};
          margin-bottom: 4px;
        }
        .home-msg-ai-text {
          font-size: 15px; line-height: 1.65; color: ${T.text};
        }
        .home-msg-ai-text p { margin: 0 0 12px; }
        .home-msg-ai-text p:last-child { margin-bottom: 0; }
        .home-msg-ai-text strong { font-weight: 600; }
        .home-msg-ai-text ul, .home-msg-ai-text ol { margin: 0 0 12px; padding-left: 20px; }
        .home-msg-ai-text li { margin-bottom: 4px; }
        .home-msg-ai-text code { background: #F3F0EA; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
        .home-msg-ai-text pre { background: #F3F0EA; padding: 12px 16px; border-radius: 8px; overflow-x: auto; }
        .home-msg-ai-text pre code { background: none; padding: 0; }

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
          flex-shrink: 0;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        @media (max-width: 768px) {
          .home-dock-bottom.hidden { transform: translateY(100%); opacity: 0; }
        }
      `}</style>

      {/* ═══ SIDEBAR ═══ */}
      <Sidebar
        conversations={[]}
        activeId={null}
        onSelect={() => {}}
        onNew={() => { goHome(); setSidebarOpen(false); }}
        onClose={() => setSidebarOpen(false)}
        anonymous={true}
        visible={sidebarOpen}
      />

      {/* ═══ MAIN ═══ */}
      <div className="home-main">
        {/* ── Topbar ── */}
        <header className={`home-topbar${!barsVisible ? ' hidden' : ''}`}>
          {/* Sidebar toggle */}
          <button className="home-topbar-btn" onClick={() => setSidebarOpen(v => !v)} aria-label="Toggle sidebar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {phase === 'chat' && (
            <button className="home-topbar-btn" onClick={goHome} aria-label="Back to home">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <div className="home-topbar-logo">
            <a
              href="/"
              onClick={(e) => { if (phase === 'chat') { e.preventDefault(); goHome(); } }}
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
            >
              <span style={{ color: T.text }}>smb</span>
              <span style={{ color: T.terra }}>x</span>
              <span style={{ color: T.text }}>.ai</span>
            </a>
            {phase === 'chat' && (
              <span style={{ color: T.faint, fontWeight: 400, fontSize: 15 }}>· Yulia</span>
            )}
          </div>

          <div style={{ flex: 1 }} />

          {phase === 'home' && (
            <button
              className="home-topbar-btn"
              onClick={() => navigate('/login')}
              aria-label="Sign in"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </button>
          )}
        </header>

        {/* ═══ HOME STATE ═══ */}
        {phase === 'home' && (
          <main className="home-hero">
            <h1 className="home-greeting">{getGreeting()},</h1>
            <p className="home-greeting-sub">what deal are we working on?</p>

            {/* Input */}
            <div className="home-hero-input">
              <textarea
                ref={heroInputRef}
                value={heroText}
                onChange={e => setHeroText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleHeroSend(); }
                }}
                placeholder="Tell Yulia about your deal..."
                rows={4}
                className="home-hero-textarea"
              />
              <div className="home-hero-toolbar">
                <button
                  onClick={handleHeroSend}
                  className={`home-hero-send${heroText.trim() ? ' visible' : ''}`}
                  disabled={!heroText.trim()}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12l7-7 7 7" /><path d="M12 19V5" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Suggestion cards */}
            <div className="home-suggestions">
              {SUGGESTIONS.map(s => (
                <button key={s.key} className="home-suggestion" onClick={() => handleSuggestion(s.message)}>
                  {s.label}
                </button>
              ))}
            </div>
          </main>
        )}

        {/* ═══ CHAT STATE ═══ */}
        {phase === 'chat' && (
          <div className="home-chat">
            <div className="home-messages" ref={scrollRef}>
              {messages.map((m, i) => (
                <div key={i} className={`home-msg ${m.role === 'user' ? 'home-msg-user' : 'home-msg-ai'}`}>
                  {m.role === 'assistant' && <div className="home-msg-ai-avatar">Y</div>}
                  {m.role === 'user' ? (
                    <div className="home-msg-user-bubble">{m.content}</div>
                  ) : (
                    <div className="home-msg-ai-body">
                      <div className="home-msg-ai-name">Yulia</div>
                      <div className="home-msg-ai-text">
                        <Markdown>{m.content}</Markdown>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming response */}
              {streamingText && (
                <div className="home-msg home-msg-ai">
                  <div className="home-msg-ai-avatar">Y</div>
                  <div className="home-msg-ai-body">
                    <div className="home-msg-ai-name">Yulia</div>
                    <div className="home-msg-ai-text">
                      <Markdown>{streamingText}</Markdown>
                      <span className="home-streaming-dot" />
                    </div>
                  </div>
                </div>
              )}

              {/* Sending indicator */}
              {sending && !streamingText && (
                <div className="home-msg home-msg-ai">
                  <div className="home-msg-ai-avatar">Y</div>
                  <div className="home-msg-ai-body">
                    <div className="home-msg-ai-name">Yulia</div>
                    <div className="home-msg-ai-text">
                      <span className="home-streaming-dot" />
                    </div>
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
    </div>
  );
}
