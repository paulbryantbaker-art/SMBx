import { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import Markdown from 'react-markdown';
import { useAnonymousChat } from '../../hooks/useAnonymousChat';
import ChatDock, { type ChatDockHandle } from '../../components/shared/ChatDock';
import InlineSignupCard from '../../components/chat/InlineSignupCard';
import { useAppHeight } from '../../hooks/useAppHeight';

/* ═══ DESIGN TOKENS ═══ */

const T = {
  bg: '#F4F2ED',
  fill: '#F3F0EA',
  white: '#FFFFFF',
  terra: '#B5522F',          // was #D4714E — deeper, richer
  terraHover: '#9A4526',     // was #BE6342
  terraLight: '#E8845E',     // NEW — bright accent for gradients
  terraSoft: '#FFF0EB',
  text: '#0C0A09',           // was #1A1A18 — near-black for max contrast
  body: '#292524',           // NEW — stone-800 for body text
  sub: '#44403C',            // was #525252 — stone-700
  muted: '#6E6A63',
  faint: '#A8A29E',
  border: '#DDD9D1',
};

/* ═══ PROMPT CHIPS ═══ */

const PROMPT_CHIPS = [
  { key: 'sell', label: 'I want to sell my business', fill: 'I want to sell my business.' },
  { key: 'worth', label: "What's my company worth?", fill: 'Help me understand what my company might be worth.' },
  { key: 'buy', label: 'Find me a business to buy', fill: 'I want to buy a business.' },
  { key: 'raise', label: "I'm raising capital", fill: "I'm raising capital for my business." },
];

/* ═══ LEARN CARDS ═══ */

const LEARN_CARDS = [
  {
    title: 'How it works',
    desc: 'Four steps from prompt to finished deliverables.',
    cta: 'See the flow',
    href: '/how-it-works',
    badgeBg: 'linear-gradient(135deg, #E07A4E 0%, #D4914E 100%)',
    badgeGlow: '0 6px 20px rgba(224,122,78,0.30)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="rgba(255,255,255,0.3)" stroke="white"/></svg>,
  },
  {
    title: 'Intelligence',
    desc: '80+ verticals, live data, real comparables.',
    cta: 'Explore data',
    href: '/how-it-works',
    badgeBg: 'linear-gradient(135deg, #C47A52 0%, #D49A5E 100%)',
    badgeGlow: '0 6px 20px rgba(196,122,82,0.30)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" fill="rgba(255,255,255,0.2)"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  },
  {
    title: 'Workspace',
    desc: 'Every document, every party, one space.',
    cta: 'See workspace',
    href: '/enterprise',
    badgeBg: 'linear-gradient(135deg, #B5522F 0%, #D4714E 100%)',
    badgeGlow: '0 6px 20px rgba(181,82,47,0.30)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" fill="rgba(255,255,255,0.25)"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5" fill="rgba(255,255,255,0.25)"/></svg>,
  },
  {
    title: 'Every journey',
    desc: 'Sell, buy, raise, integrate — any size.',
    cta: 'View journeys',
    href: '/sell',
    badgeBg: 'linear-gradient(135deg, #D4735E 0%, #E8945E 100%)',
    badgeGlow: '0 6px 20px rgba(212,115,94,0.30)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="5" cy="6" r="2.5" fill="rgba(255,255,255,0.3)"/><circle cx="12" cy="18" r="2.5" fill="rgba(255,255,255,0.3)"/><circle cx="19" cy="10" r="2.5" fill="rgba(255,255,255,0.3)"/><path d="M6.5 7.5L10.5 16"/><path d="M13.5 16.5L17 11.5"/></svg>,
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
  useAppHeight();

  // Navigate from chat back to landing
  const goHome = useCallback(() => {
    if (phase === 'chat') {
      window.history.replaceState(null, '', window.location.pathname);
      setPhase('landing');
    }
  }, [phase]);

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

  // Lock body scroll when entering chat (iOS Safari fix)
  useEffect(() => {
    if (phase === 'chat') {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = '0';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [phase]);

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
    <div
      id={phase === 'chat' ? 'app-root' : undefined}
      className={`home-root${phase === 'chat' ? ' in-chat' : ''}`}
    >
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
        /* Chat phase: PROVEN iOS PATTERN from Chat.tsx
           position:fixed + useAppHeight sets height via visualViewport.
           Everything inside is flex children — NO position:fixed on pill or dock. */
        .home-root.in-chat {
          position: fixed;
          left: 0; right: 0; top: 0;
          height: 100%;
          overflow: hidden;
        }

        /* ── Pill nav ── */
        .home-pill {
          position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
          z-index: 50; width: auto;
          backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
          background: rgba(255,255,255,0.95);
          border: 1px solid rgba(12,10,9,0.06);
          box-shadow:
            0 4px 20px rgba(12,10,9,0.08),
            0 1px 3px rgba(12,10,9,0.04),
            0 0 0 1px rgba(255,255,255,0.7) inset;
          border-radius: 100px;
          padding: 10px 24px;
          display: flex; align-items: center; gap: 20px;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        @media (max-width: 768px) {
          .home-pill {
            position: sticky; top: 0;
            left: auto; transform: none;
            margin: 0 auto; width: fit-content;
            padding: 10px 20px; gap: 12px;
            top: 12px; z-index: 50;
          }
          .home-pill.hidden { transform: translateY(-120%); opacity: 0; }
        }

        /* ── Chat phase: pill becomes a flex-child header, NOT fixed ── */
        .in-chat .home-pill {
          position: static !important;
          left: auto; top: auto; transform: none !important;
          flex-shrink: 0;
          width: 100%;
          justify-content: center;
          border-radius: 0;
          padding: 12px 24px;
          padding-top: calc(12px + env(safe-area-inset-top, 0px));
          border: none;
          border-bottom: 1px solid rgba(12,10,9,0.06);
          box-shadow: 0 1px 4px rgba(12,10,9,0.04);
          background: rgba(244,242,237,0.95);
          backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
        }
        @media (max-width: 768px) {
          .in-chat .home-pill { padding: 10px 20px; padding-top: calc(10px + env(safe-area-inset-top, 0px)); }
          .in-chat .home-pill.hidden { transform: translateY(-100%) !important; opacity: 0; margin-top: -80px; }
        }

        /* ── Landing hero ── */
        .home-hero {
          display: flex; flex-direction: column;
          align-items: center; text-align: center;
          justify-content: center;
          min-height: calc(100dvh - 140px);
          padding: 80px 40px 20px;
          max-width: 80rem; margin: 0 auto; width: 100%;
          position: relative; z-index: 1;
        }
        @media (max-width: 1100px) { .home-hero { padding: 60px 40px 20px; } }
        @media (max-width: 768px) {
          .home-hero {
            min-height: auto;
            justify-content: flex-start;
            padding: 36px 18px 28px;
          }
        }

        .home-h1 {
          font-size: 64px; font-weight: 700; line-height: 1.06;
          letter-spacing: -0.04em; color: ${T.text};
          margin: 0 0 20px; animation: fadeUp 0.6s ease both;
        }
        @media (max-width: 1100px) { .home-h1 { font-size: 52px; margin-bottom: 18px; } }
        @media (max-width: 768px) { .home-h1 { font-size: 34px; margin-bottom: 12px; } }

        .home-sub {
          font-size: 17px; color: ${T.body}; line-height: 1.6;
          font-weight: 400; max-width: 480px; margin: 0 0 48px;
          animation: fadeUp 0.6s ease 0.08s both;
        }
        @media (max-width: 1100px) { .home-sub { font-size: 16px; max-width: 400px; margin-bottom: 36px; } }
        @media (max-width: 768px) { .home-sub { font-size: 14px; max-width: 280px; margin-bottom: 24px; } }

        /* ── 2-Layer chat card ── */
        .home-card-outer {
          width: 100%; max-width: 680px;
          border-radius: 28px;
          border: 1px solid rgba(12,10,9,0.06);
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px);
          box-shadow: 0 4px 10px rgba(12,10,9,0.02), 0 16px 48px rgba(12,10,9,0.06);
          padding: 18px;
          animation: fadeUp 0.6s ease 0.16s both;
          position: relative; z-index: 1;
        }
        @media (max-width: 768px) { .home-card-outer { border-radius: 20px; padding: 12px; max-width: 100%; } }

        .home-card-label {
          font-size: 14px; font-weight: 600; color: ${T.text};
          text-align: left; margin-bottom: 12px; display: block;
        }

        .home-input-card {
          border-radius: 20px;
          border: 1px solid rgba(12,10,9,0.07);
          background: #FFFFFF;
          padding: 18px;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .home-input-card.active {
          border-color: rgba(181,82,47,0.40);
          box-shadow: 0 0 0 4px rgba(181,82,47,0.08);
        }
        @media (max-width: 768px) { .home-input-card { border-radius: 14px; padding: 12px; } }

        .home-hero-textarea {
          width: 100%; min-height: 72px; resize: none;
          background: transparent; border: none; outline: none;
          font-size: 16px; line-height: 1.75; color: ${T.text};
          font-family: 'Inter', system-ui, sans-serif;
        }
        .home-hero-textarea::placeholder { color: ${T.faint}; }
        @media (max-width: 768px) { .home-hero-textarea { min-height: 48px; font-size: 14.5px; } }

        .home-hero-send-row {
          border-top: 1px solid rgba(12,10,9,0.06);
          margin-top: 12px; padding-top: 12px;
          display: flex; justify-content: flex-end;
        }
        .home-hero-send {
          width: 42px; height: 42px; border-radius: 9999px;
          background: linear-gradient(135deg, ${T.terra} 0%, ${T.terraLight} 100%);
          color: #fff; border: none;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(181,82,47,0.28);
          transition: all 0.15s;
          font-family: inherit;
        }
        .home-hero-send:hover { filter: brightness(1.05); transform: scale(1.02); }
        .home-hero-send:disabled { opacity: 0.5; cursor: default; transform: none; }
        .home-hero-send:disabled:hover { filter: none; }
        @media (max-width: 768px) { .home-hero-send { width: 36px; height: 36px; } }

        /* ── Prompt chips ── */
        .home-chips {
          display: flex; flex-wrap: wrap; justify-content: center;
          gap: 8px; margin-top: 28px; max-width: 680px;
          animation: fadeUp 0.6s ease 0.28s both;
        }

        .home-chip {
          padding: 7px 18px; border-radius: 100px;
          border: 1px solid rgba(12,10,9,0.07);
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          cursor: pointer; font-size: 13px; font-weight: 550;
          color: ${T.sub};
          font-family: 'Inter', system-ui, sans-serif;
          transition: all 0.15s;
          box-shadow: 0 2px 10px rgba(12,10,9,0.04);
        }
        .home-chip:hover { background: #fff; color: ${T.text}; }
        .home-chip:active { transform: scale(0.97); }
        @media (max-width: 768px) { .home-chip { padding: 6px 13px; font-size: 12px; } }

        /* ── Learn cards ── */
        .home-learn {
          width: 100%; max-width: 1100px;
          margin: 0 auto;
          padding: 0 40px 100px;
          position: relative; z-index: 1;
          animation: fadeUp 0.6s ease 0.4s both;
        }
        @media (max-width: 1100px) { .home-learn { max-width: 720px; padding: 0 20px 80px; } }
        @media (max-width: 768px)  { .home-learn { max-width: 100%; padding: 8px 20px 64px; } }

        .home-learn-card {
          display: flex; flex-direction: column;
          height: 100%;
          border-radius: 22px;
          border: 1px solid rgba(12,10,9,0.06);
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 2px 6px rgba(12,10,9,0.03), 0 10px 36px rgba(12,10,9,0.04);
          padding: 14px;
          text-align: left; text-decoration: none; color: inherit;
          transition: all 0.2s;
        }
        .home-learn-card:hover {
          transform: translateY(-2px);
          background: #fff;
        }
        @media (max-width: 768px) { .home-learn-card { border-radius: 16px; padding: 8px; } }

        .home-learn-inner {
          display: flex; flex-direction: column;
          flex: 1;
          border-radius: 18px;
          border: 1px solid rgba(12,10,9,0.04);
          background: #FFFFFF;
          padding: 16px;
          height: 210px;
        }
        @media (max-width: 768px) { .home-learn-inner { height: 186px; padding: 12px; border-radius: 12px; } }

        .home-learn-icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          /* background and box-shadow set inline per-card */
        }
        @media (max-width: 768px) { .home-learn-icon { width: 36px; height: 36px; border-radius: 10px; } }

        .home-learn-title {
          font-size: 16px; font-weight: 700;
          letter-spacing: -0.02em;
          color: ${T.text};
          margin: 16px 0 0; line-height: 1.25;
        }
        @media (max-width: 768px) { .home-learn-title { font-size: 14px; margin-top: 12px; } }

        .home-learn-desc {
          font-size: 13px; line-height: 1.55;
          color: ${T.body};
          margin: 8px 0 0; flex: 1;
        }
        @media (max-width: 768px) { .home-learn-desc { font-size: 11.5px; margin-top: 5px; } }

        .home-learn-cta {
          display: flex; align-items: center; justify-content: space-between;
          border-top: 1px solid rgba(12,10,9,0.06);
          padding-top: 12px; margin-top: auto;
        }
        .home-learn-cta-text {
          font-size: 12.5px; font-weight: 600;
          color: ${T.terra}; padding-right: 12px;
        }
        @media (max-width: 768px) { .home-learn-cta-text { font-size: 11px; } }
        .home-learn-cta-btn {
          width: 30px; height: 30px; border-radius: 9px;
          border: 1px solid rgba(181,82,47,0.12);
          background: linear-gradient(135deg, rgba(181,82,47,0.08), rgba(232,132,94,0.08));
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; color: ${T.terra};
          transition: background 0.15s;
        }
        @media (max-width: 768px) { .home-learn-cta-btn { width: 24px; height: 24px; border-radius: 7px; } }
        .home-learn-card:hover .home-learn-cta-btn {
          background: rgba(181,82,47,0.12);
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
        @media (min-width: 768px) { .home-messages { padding: 20px 40px 8px; } }

        .home-msg {
          margin-bottom: 20px; animation: fadeUp 0.25s ease both;
        }
        .home-msg-user {
          display: flex; justify-content: flex-end;
        }
        .home-msg-user-bubble {
          max-width: 85%; padding: 12px 18px;
          background: ${T.terraSoft}; color: ${T.text};
          border: 1px solid rgba(181,82,47,0.18);
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
          flex-shrink: 0;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        @media (max-width: 768px) {
          .home-dock-bottom.hidden { transform: translateY(100%); opacity: 0; }
        }
      `}</style>

      {/* ═══ AMBIENT BACKGROUND ═══ */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', left: '-5%', top: '-8%',
          width: '34rem', height: '34rem', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(224,122,78,0.07) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', left: '40%', top: '25%',
          width: '44rem', height: '30rem', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(181,82,47,0.05) 0%, transparent 60%)',
        }} />
        <div style={{
          position: 'absolute', right: '-8%', bottom: '-10%',
          width: '28rem', height: '28rem', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(240,235,225,0.5) 0%, transparent 65%)',
          filter: 'blur(30px)',
        }} />
      </div>

      {/* ═══ FLOATING PILL NAV ═══ */}
      <header className={`home-pill${!barsVisible ? ' hidden' : ''}`}>
        <a
          href="/"
          onClick={(e) => {
            if (phase === 'chat') {
              e.preventDefault();
              goHome();
            }
          }}
          style={{ textDecoration: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <span style={{ color: T.text }}>smb</span>
            <span style={{ color: T.terra }}>x</span>
            <span style={{ color: T.text }}>.ai</span>
          </span>
        </a>
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
        <>
          <main className="home-hero">
            <h1 className="home-h1">
              Start with{' '}
              <span style={{
                background: `linear-gradient(135deg, ${T.terra}, ${T.terraLight})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>the deal.</span>
            </h1>
            <p className="home-sub">
              AI-powered M&A advisory. From first question to closing day.
            </p>

            {/* 2-layer chat card */}
            <div className="home-card-outer">
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

            {/* Prompt chips */}
            <div className="home-chips">
              {PROMPT_CHIPS.map(c => (
                <button key={c.key} className="home-chip" onClick={() => handleChipClick(c.fill)}>
                  {c.label}
                </button>
              ))}
            </div>
          </main>

          {/* Learn cards — OUTSIDE hero so they scroll below the fold */}
          <section className="home-learn">
            <div className="learn-cards">
              {LEARN_CARDS.map(card => (
                <Link key={card.title} href={card.href} className="home-learn-card">
                  <div className="home-learn-inner">
                    <div
                      className="home-learn-icon"
                      style={{ background: card.badgeBg, boxShadow: card.badgeGlow }}
                    >
                      {card.icon}
                    </div>
                    <h3 className="home-learn-title">{card.title}</h3>
                    <p className="home-learn-desc">{card.desc}</p>
                    <div className="home-learn-cta">
                      <span className="home-learn-cta-text">{card.cta}</span>
                      <span className="home-learn-cta-btn">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </>
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
            <div className="home-dock-bottom">
              <ChatDock ref={dockRef} onSend={handleSend} disabled={sending} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
