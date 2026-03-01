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
  { key: 'value', label: 'What would a buyer pay for my business?', message: 'What would a buyer pay for my business? I want to understand what it might be worth in today\u2019s market.' },
  { key: 'sell', label: 'Walk me through selling my company', message: 'Walk me through selling my company. I want to understand the full process from start to close.' },
  { key: 'buy', label: 'Find acquisition targets in my industry', message: 'Help me find acquisition targets in my industry. I\u2019m looking at potential businesses to buy.' },
  { key: 'broker', label: "I'm a broker \u2014 show me what you can do", message: "I'm a business broker. Show me how you can help me with my practice \u2014 valuations, CIMs, buyer matching, deal management." },
];

const TRUST_SOURCES = ['U.S. Census Bureau', 'Bureau of Labor Statistics', 'Federal Reserve', 'SEC EDGAR', 'SBA'];

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

  useEffect(() => {
    if (window.location.hash.includes('chat') && hasMessages && phase === 'home') {
      setPhase('chat');
    }
  }, [hasMessages, phase]);

  // Auto-send context when arriving from entry-ramp pages (?advisor=1, ?sell=1, ?buy=1)
  const contextHandled = useRef(false);
  useEffect(() => {
    if (contextHandled.current) return;
    const params = new URLSearchParams(window.location.search);
    let msg = '';
    if (params.get('advisor') === '1') {
      msg = "I'm a business broker evaluating SMBX for my practice. What can you do for advisors?";
    } else if (params.get('sell') === '1') {
      msg = 'I\u2019m thinking about selling my business. Help me understand what it might be worth and walk me through the process.';
    } else if (params.get('buy') === '1') {
      msg = 'I\u2019m looking to buy a business. Help me evaluate opportunities and understand the acquisition process.';
    }
    if (msg && !hasMessages) {
      contextHandled.current = true;
      window.history.replaceState(null, '', '/');
      enterChat();
      sendMessage(msg);
    }
  }, [hasMessages, enterChat, sendMessage]);

  useEffect(() => {
    const onPop = () => {
      if (!window.location.hash.includes('chat')) setPhase('home');
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (phase === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingText, phase]);

  const handleSend = useCallback((text: string) => {
    enterChat();
    sendMessage(text);
    dockRef.current?.clear();
  }, [enterChat, sendMessage]);

  const handleHeroSend = useCallback(() => {
    const text = heroText.trim();
    if (!text) return;
    setHeroText('');
    enterChat();
    sendMessage(text);
  }, [heroText, enterChat, sendMessage]);

  const handleSuggestion = useCallback((message: string) => {
    enterChat();
    sendMessage(message);
  }, [enterChat, sendMessage]);

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

  const scrollToChat = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => heroInputRef.current?.focus(), 400);
  };

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
          .home-topbar.hidden:not(.home-topbar-sticky) { transform: translateY(-100%); opacity: 0; margin-top: -56px; }
        }
        .home-root:not(.in-chat) .home-topbar {
          position: sticky; top: 0; z-index: 50;
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

        .home-topbar-link {
          font-size: 14px; font-weight: 500; color: ${T.muted};
          text-decoration: none; transition: color 0.15s;
          padding: 6px 10px; border-radius: 8px;
        }
        .home-topbar-link:hover { color: ${T.text}; background: rgba(26,26,24,0.03); }

        /* ── Home state: scrollable page ── */
        .home-scroll {
          flex: 1; overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        /* ── Hero ambient glow ── */
        .home-hero-wrap {
          position: relative;
          overflow: hidden;
        }
        .home-hero-wrap::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 50% 40% at 50% 55%, rgba(212,113,78,0.05) 0%, transparent 100%);
          pointer-events: none; z-index: 0;
        }

        /* ── Hero section ── */
        .home-hero {
          position: relative; z-index: 1;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
          min-height: calc(100dvh - 56px);
          padding: 40px 24px 40px;
          max-width: 700px; margin: 0 auto; width: 100%;
        }
        @media (max-width: 768px) {
          .home-hero {
            min-height: calc(100dvh - 56px);
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
          letter-spacing: -0.03em; color: ${T.muted};
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
          box-shadow:
            0 4px 16px rgba(26,26,24,0.08),
            0 1px 3px rgba(26,26,24,0.06),
            0 12px 40px rgba(26,26,24,0.04);
          padding: 0;
          animation: fadeUp 0.5s ease 0.12s both;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .home-hero-input:focus-within {
          border-color: rgba(212,113,78,0.35);
          box-shadow:
            0 4px 16px rgba(26,26,24,0.10),
            0 1px 3px rgba(26,26,24,0.06),
            0 12px 40px rgba(26,26,24,0.06),
            0 0 0 3px rgba(212,113,78,0.10);
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

        /* ── Trust bar ── */
        .home-trust {
          margin-top: 24px; text-align: center;
          font-size: 12px; color: ${T.faint}; font-weight: 400;
          animation: fadeUp 0.5s ease 0.28s both;
        }
        @media (max-width: 768px) { .home-trust { font-size: 11px; margin-top: 20px; } }

        /* ═══ BELOW-FOLD SECTIONS ═══ */

        .home-below-fold {
          background: linear-gradient(to bottom, ${T.bg} 0%, #F0EDE8 100%);
        }

        .home-section {
          max-width: 960px; margin: 0 auto; width: 100%;
          padding: 80px 32px;
        }
        @media (max-width: 768px) { .home-section { padding: 56px 20px; } }

        .home-section-divider {
          max-width: 960px; margin: 0 auto;
          border: none; border-top: 1px solid ${T.border};
        }

        .home-overline {
          font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.12em; color: ${T.terra}; margin: 0 0 12px;
        }

        .home-section-heading {
          font-size: 28px; font-weight: 700; letter-spacing: -0.03em;
          color: ${T.text}; margin: 0 0 20px; line-height: 1.2;
        }
        @media (max-width: 768px) { .home-section-heading { font-size: 24px; } }

        .home-section-body {
          font-size: 16px; line-height: 1.7; color: ${T.sub};
          margin: 0 0 16px; max-width: 640px;
        }
        @media (max-width: 768px) { .home-section-body { font-size: 15px; } }

        /* ── Three pillars ── */
        .home-pillars {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 768px) { .home-pillars { grid-template-columns: 1fr; gap: 12px; } }

        .home-pillar {
          background: #FFFFFF; border-radius: 16px;
          border: 1px solid rgba(26,26,24,0.08);
          padding: 24px; box-shadow: 0 2px 8px rgba(26,26,24,0.07);
        }
        .home-pillar h3 {
          font-size: 16px; font-weight: 700; color: ${T.text};
          margin: 0 0 10px; letter-spacing: -0.01em;
        }
        .home-pillar p {
          font-size: 14px; line-height: 1.65; color: ${T.sub}; margin: 0;
        }

        /* ── Experience preview ── */
        .home-preview {
          max-width: 720px; margin: 0 auto;
          background: #FFFFFF; border-radius: 20px;
          border: 1px solid rgba(26,26,24,0.08);
          box-shadow: 0 2px 12px rgba(26,26,24,0.08);
          padding: 28px 24px;
        }
        @media (max-width: 768px) { .home-preview { padding: 20px 16px; border-radius: 16px; } }

        .home-preview-user {
          display: flex; justify-content: flex-end; margin-bottom: 20px;
        }
        .home-preview-user-bubble {
          max-width: 85%; padding: 12px 18px;
          background: ${T.terraSoft}; color: ${T.text};
          border: 1px solid rgba(212,113,78,0.18);
          border-radius: 18px 18px 4px 18px;
          font-size: 14px; line-height: 1.55;
        }
        .home-preview-ai {
          display: flex; gap: 12px; align-items: flex-start;
        }
        .home-preview-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: ${T.terra}; color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 2px;
        }
        .home-preview-body {
          flex: 1; min-width: 0;
        }
        .home-preview-name {
          font-size: 13px; font-weight: 600; color: ${T.sub}; margin-bottom: 6px;
        }
        .home-preview-text {
          font-size: 14px; line-height: 1.7; color: ${T.text};
        }
        .home-preview-text p { margin: 0 0 12px; }
        .home-preview-text p:last-child { margin-bottom: 0; }
        .home-preview-text strong { font-weight: 600; }

        .home-preview-note {
          margin-top: 20px; padding-top: 16px;
          border-top: 1px solid rgba(26,26,24,0.06);
          font-size: 13px; line-height: 1.6; color: ${T.muted};
          font-style: italic;
        }

        /* ── Persona cards ── */
        .home-personas {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 640px) { .home-personas { grid-template-columns: 1fr; } }

        .home-persona {
          background: #FFFFFF; border-radius: 16px;
          border: 1px solid rgba(26,26,24,0.08);
          padding: 24px; box-shadow: 0 2px 8px rgba(26,26,24,0.07);
          transition: all 0.15s;
        }
        .home-persona:hover {
          box-shadow: 0 2px 8px rgba(26,26,24,0.07);
          transform: translateY(-1px);
        }
        .home-persona h3 {
          font-size: 15px; font-weight: 700; color: ${T.text};
          margin: 0 0 8px;
        }
        .home-persona p {
          font-size: 14px; line-height: 1.6; color: ${T.sub}; margin: 0 0 14px;
        }
        .home-persona-cta {
          font-size: 13px; font-weight: 600; color: ${T.terra};
          text-decoration: none; cursor: pointer;
          background: none; border: none; padding: 0;
          font-family: inherit;
        }
        .home-persona-cta:hover { text-decoration: underline; }

        /* ── Steps ── */
        .home-steps {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 24px; counter-reset: step;
        }
        @media (max-width: 768px) { .home-steps { grid-template-columns: 1fr; gap: 20px; } }

        .home-step {
          counter-increment: step;
        }
        .home-step::before {
          content: counter(step);
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 10px;
          background: ${T.terraSoft}; color: ${T.terra};
          font-size: 14px; font-weight: 700;
          margin-bottom: 14px;
        }
        .home-step h3 {
          font-size: 16px; font-weight: 700; color: ${T.text};
          margin: 0 0 8px;
        }
        .home-step p {
          font-size: 14px; line-height: 1.6; color: ${T.sub}; margin: 0;
        }

        /* ── Trust section (expanded) ── */
        .home-trust-bar {
          display: flex; flex-wrap: wrap; justify-content: center;
          gap: 6px 16px; margin-top: 24px;
          font-size: 13px; color: ${T.muted};
        }

        /* ── Final CTA ── */
        .home-final-cta {
          text-align: center; max-width: 600px;
          margin: 0 auto; padding: 80px 32px;
        }
        @media (max-width: 768px) { .home-final-cta { padding: 56px 20px; } }

        .home-cta-heading {
          font-size: 28px; font-weight: 700; letter-spacing: -0.03em;
          color: ${T.text}; margin: 0 0 12px; line-height: 1.2;
        }
        @media (max-width: 768px) { .home-cta-heading { font-size: 24px; } }

        .home-cta-sub {
          font-size: 16px; color: ${T.muted}; margin: 0 0 28px;
        }

        .home-cta-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 32px; border-radius: 12px;
          background: ${T.terra}; color: #fff;
          font-size: 15px; font-weight: 600; border: none;
          cursor: pointer; font-family: inherit;
          box-shadow: 0 2px 8px rgba(212,113,78,0.3);
          transition: all 0.15s;
        }
        .home-cta-btn:hover { background: ${T.terraHover}; }

        /* ── Footer ── */
        .home-footer {
          border-top: 1px solid ${T.border};
          padding: 40px 32px;
          max-width: 960px; margin: 0 auto; width: 100%;
        }
        @media (max-width: 768px) { .home-footer { padding: 32px 20px; } }

        .home-footer-logo {
          font-size: 18px; font-weight: 800; letter-spacing: -0.03em;
          margin-bottom: 20px;
        }

        .home-footer-links {
          display: flex; flex-wrap: wrap; gap: 8px 20px;
          margin-bottom: 12px;
        }
        .home-footer-links a {
          font-size: 13px; color: ${T.muted}; text-decoration: none;
          transition: color 0.15s;
        }
        .home-footer-links a:hover { color: ${T.text}; }

        .home-footer-copy {
          font-size: 12px; color: ${T.faint}; margin: 0;
        }

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
          padding: 0 16px 16px;
          max-width: 900px; margin: 0 auto; width: 100%;
          box-sizing: border-box;
        }
        @media (min-width: 769px) {
          .home-dock-bottom { padding: 0 40px 20px; }
        }
        .home-dock-bottom > div {
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
        }
        .home-dock-bottom .home-dock-card {
          border-radius: 20px;
          border: 1px solid rgba(26,26,24,0.10) !important;
          background: #FFFFFF;
          box-shadow:
            0 4px 16px rgba(26,26,24,0.08),
            0 1px 3px rgba(26,26,24,0.06),
            0 12px 40px rgba(26,26,24,0.04);
        }
        @media (max-width: 768px) {
          .home-dock-bottom { transition: transform 0.3s ease, opacity 0.3s ease; }
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
          <button className="home-topbar-btn" onClick={() => setSidebarOpen(v => !v)} aria-label="Toggle sidebar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

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
            <>
              <nav className="hidden md:flex items-center gap-1">
                <a href="/sell" className="home-topbar-link">Sell</a>
                <a href="/buy" className="home-topbar-link">Buy</a>
                <a href="/advisors" className="home-topbar-link">Advisors</a>
                <a href="/pricing" className="home-topbar-link">Pricing</a>
              </nav>
              <button
                className="home-topbar-btn"
                onClick={() => navigate('/login')}
                aria-label="Sign in"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </button>
            </>
          )}
        </header>

        {/* ═══ HOME STATE ═══ */}
        {phase === 'home' && (
          <div className="home-scroll">
            {/* ── SECTION 0: HERO ── */}
            <div className="home-hero-wrap">
            <section className="home-hero">
              <h1 className="home-greeting">{getGreeting()}.</h1>
              <p className="home-greeting-sub">Tell me about your deal.</p>

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

              <div className="home-suggestions">
                {SUGGESTIONS.map(s => (
                  <button key={s.key} className="home-suggestion" onClick={() => handleSuggestion(s.message)}>
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="home-trust">
                Powered by {TRUST_SOURCES.join(' \u00B7 ')}
              </div>
            </section>
            </div>

            <div className="home-below-fold">
            {/* ── SECTION 1: INTELLIGENCE STORY ── */}
            <hr className="home-section-divider" />
            <section className="home-section">
              <p className="home-overline">The SMBX methodology</p>
              <h2 className="home-section-heading">The data is public. The intelligence is not.</h2>
              <p className="home-section-body">
                The same market data that powers Wall Street &mdash; Census Bureau demographics, Bureau of Labor Statistics industry reports, Federal Reserve economic indicators, SEC filings, SBA lending records &mdash; is technically available to anyone.
              </p>
              <p className="home-section-body">
                What isn&apos;t available is someone who can synthesize all of it into a deal-specific analysis in minutes. What your industry&apos;s multiples are doing. How many competitors operate in your market. Whether a buyer can finance this deal through SBA. What add-backs you&apos;re missing. Which PE firms are actively consolidating your space.
              </p>
              <p className="home-section-body">
                That&apos;s what Yulia does. Not generic answers &mdash; localized, industry-specific, deal-size-calibrated intelligence grounded in authoritative data. Every number is sourced. Every analysis shows its work.
              </p>
            </section>

            {/* ── SECTION 2: THREE PILLARS ── */}
            <hr className="home-section-divider" />
            <section className="home-section">
              <div className="home-pillars">
                <div className="home-pillar">
                  <h3>Seven layers of analysis</h3>
                  <p>Every deal gets evaluated across seven dimensions: industry structure, regional economics, financial normalization, buyer landscape, deal architecture, risk factors, and forward signals. Not a checklist &mdash; a methodology built from real transaction experience.</p>
                </div>
                <div className="home-pillar">
                  <h3>Localized to your market</h3>
                  <p>National averages hide what matters. A plumbing company in Phoenix and a plumbing company in rural Pennsylvania are fundamentally different deals. SMBX intelligence is specific to your metro, your industry, and your competitive environment.</p>
                </div>
                <div className="home-pillar">
                  <h3>Calibrated to every deal size</h3>
                  <p>The right analysis for a $400K landscaping company is different from a $40M manufacturing platform. Different metrics, different buyers, different structures. Yulia adapts her methodology, vocabulary, and deliverables to the deal in front of her.</p>
                </div>
              </div>
            </section>

            {/* ── SECTION 3: EXPERIENCE PREVIEW ── */}
            <hr className="home-section-divider" />
            <section className="home-section">
              <h2 className="home-section-heading" style={{ textAlign: 'center', marginBottom: 32 }}>See Yulia in action</h2>
              <div className="home-preview">
                <div className="home-preview-user">
                  <div className="home-preview-user-bubble">
                    I&apos;m thinking about selling my commercial HVAC company. We&apos;re in Dallas-Fort Worth, about $4.2M in revenue and $780K in adjusted EBITDA last year.
                  </div>
                </div>
                <div className="home-preview-ai">
                  <div className="home-preview-avatar">Y</div>
                  <div className="home-preview-body">
                    <div className="home-preview-name">Yulia</div>
                    <div className="home-preview-text">
                      <p>Commercial HVAC in DFW &mdash; strong combination right now. Let me run this against current market data.</p>
                      <p>Your $780K EBITDA puts you in what we call the lower middle market, which means we&apos;re looking at EBITDA-based multiples rather than seller&apos;s discretionary earnings. For commercial HVAC in the Dallas-Fort Worth MSA, current multiples are running 4.8x&ndash;6.2x based on comparable transactions and active PE interest in the sector.</p>
                      <p>That gives you a preliminary enterprise value range of <strong>$3.7M&ndash;$4.8M.</strong></p>
                      <p>A few things I&apos;m seeing that affect where you land in that range:</p>
                      <p><strong>Working for you:</strong> DFW is a high-demand market. I&apos;m tracking 14 PE-backed HVAC platforms actively acquiring in Texas. Commercial-focused operations like yours are only about 12% of the 847 HVAC businesses in the metro &mdash; that scarcity drives premiums.</p>
                      <p><strong>Worth examining:</strong> Your EBITDA margin of 18.6% is solid but below the 21% industry median. There may be add-backs or operational improvements we can identify that would push your valuation meaningfully higher before you go to market.</p>
                      <p>Want me to dig into the value drivers? I can model specific improvements and show you what they&apos;d mean for your sale price.</p>
                    </div>
                  </div>
                </div>
                <div className="home-preview-note">
                  Every number in that analysis is sourced from authoritative data. Competitive density from Census Bureau. Industry multiples from market transaction data. PE activity tracked in real time. That&apos;s not a guess &mdash; it&apos;s intelligence.
                </div>
              </div>
            </section>

            {/* ── SECTION 4: PERSONA ROUTING ── */}
            <hr className="home-section-divider" />
            <section className="home-section">
              <h2 className="home-section-heading">Built for everyone in the deal.</h2>
              <div className="home-personas">
                <div className="home-persona">
                  <h3>Selling, buying, or raising capital</h3>
                  <p>Whether you&apos;re a first-time seller who needs to understand the process or a serial acquirer evaluating your next target &mdash; start with the intelligence that makes every decision clearer.</p>
                  <button className="home-persona-cta" onClick={() => { scrollToChat(); }}>Tell Yulia about your deal &rarr;</button>
                </div>
                <div className="home-persona">
                  <h3>Brokers &amp; M&amp;A advisors</h3>
                  <p>Package listings faster. Qualify buyers instantly. Walk into every pitch with localized market intelligence that demonstrates your analytical depth.</p>
                  <button className="home-persona-cta" onClick={() => handleSuggestion("I'm a business broker. Show me how you can help me with my practice \u2014 valuations, CIMs, buyer matching, deal management.")}>See how advisors use SMBX &rarr;</button>
                </div>
                <div className="home-persona">
                  <h3>PE, family offices &amp; search funds</h3>
                  <p>Screen industries, model acquisitions, and build conviction at deal-flow speed. Analysis that takes your team hours, ready in minutes.</p>
                  <button className="home-persona-cta" onClick={() => handleSuggestion('I\u2019m evaluating acquisition targets for a PE platform. Help me screen industries and model deals.')}>Explore investor tools &rarr;</button>
                </div>
                <div className="home-persona">
                  <h3>Attorneys &amp; CPAs</h3>
                  <p>Walk into every engagement with the financials, market position, and competitive landscape already organized and analyzed. Less ramp-up. Better diligence.</p>
                  <button className="home-persona-cta" onClick={() => { scrollToChat(); }}>Start with Yulia &rarr;</button>
                </div>
              </div>
            </section>

            {/* ── SECTION 5: HOW IT WORKS ── */}
            <hr className="home-section-divider" />
            <section className="home-section">
              <h2 className="home-section-heading">How it works</h2>
              <div className="home-steps">
                <div className="home-step">
                  <h3>Tell Yulia about your deal.</h3>
                  <p>Describe what you&apos;re working on &mdash; selling a business, evaluating a target, packaging a listing, screening a market. Yulia asks smart follow-ups to understand the full picture.</p>
                </div>
                <div className="home-step">
                  <h3>Get real intelligence, fast.</h3>
                  <p>Yulia synthesizes market data, industry benchmarks, and financial analysis into insights specific to your deal. Localized. Sourced. Actionable. Not generic &mdash; yours.</p>
                </div>
                <div className="home-step">
                  <h3>Go deeper when you&apos;re ready.</h3>
                  <p>From preliminary analysis to full deliverables &mdash; valuations, confidential memorandums, buyer matching, deal structuring, diligence prep &mdash; the intelligence scales with your deal.</p>
                </div>
              </div>
            </section>

            {/* ── SECTION 6: METHODOLOGY / TRUST ── */}
            <hr className="home-section-divider" />
            <section className="home-section">
              <h2 className="home-section-heading">Every insight is traceable. Every analysis is explainable.</h2>
              <p className="home-section-body">
                SMBX is built on data from agencies required by law to collect it &mdash; the same sovereign data sources that inform the Federal Reserve, Wall Street research desks, and the world&apos;s largest financial institutions.
              </p>
              <p className="home-section-body">
                Yulia doesn&apos;t generate plausible-sounding text about your deal. She runs a structured methodology against authoritative data and delivers traceable conclusions. When she says there are 847 HVAC companies in your metro, that number comes from Census Bureau County Business Patterns data. When she cites an industry multiple, it&apos;s grounded in comparable transaction analysis.
              </p>
              <p className="home-section-body">
                That&apos;s the difference between a chatbot and an intelligence engine.
              </p>
              <div className="home-trust-bar">
                <span style={{ fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Built on:</span>
                {['U.S. Census Bureau', 'Bureau of Labor Statistics', 'Federal Reserve (FRED)', 'SEC EDGAR', 'IRS Statistics of Income', 'SBA Lending Data'].map((src, i, arr) => (
                  <span key={src}>
                    {src}{i < arr.length - 1 ? ' \u00B7' : ''}
                  </span>
                ))}
              </div>
            </section>

            {/* ── SECTION 7: FINAL CTA ── */}
            <div className="home-final-cta">
              <h2 className="home-cta-heading">Your next deal starts with a conversation.</h2>
              <p className="home-cta-sub">No retainer. No meeting. Just intelligence.</p>
              <button className="home-cta-btn" onClick={scrollToChat}>
                Talk to Yulia
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            </div>{/* end home-below-fold */}

            {/* ── FOOTER ── */}
            <footer className="home-footer">
              <div className="home-footer-logo">
                <span style={{ color: T.text }}>smb</span>
                <span style={{ color: T.terra }}>x</span>
                <span style={{ color: T.text }}>.ai</span>
              </div>
              <div className="home-footer-links">
                <a href="/legal/privacy">Privacy</a>
                <a href="/legal/terms">Terms</a>
              </div>
              <p className="home-footer-copy">&copy; 2026 SMBX.ai &mdash; Deal intelligence for every dealmaker.</p>
            </footer>
          </div>
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

              {messagesRemaining !== null && messagesRemaining <= 10 && messagesRemaining > 0 && (
                <div className="home-remaining">
                  {messagesRemaining} message{messagesRemaining !== 1 ? 's' : ''} remaining &mdash; sign up to continue
                </div>
              )}

              {showSignup && (
                <div style={{ maxWidth: 400, margin: '12px auto 20px' }}>
                  <InlineSignupCard sessionId={getSessionId()} canDismiss={!limitReached} />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

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
