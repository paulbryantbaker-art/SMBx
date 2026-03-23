import { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useAnonymousChat, type AnonMessage } from '../../hooks/useAnonymousChat';
import { useAuthChat } from '../../hooks/useAuthChat';
import { useAppHeight } from '../../hooks/useAppHeight';
import { useDarkMode, DarkModeToggle } from '../../components/shared/DarkModeToggle';
import ChatDock, { type ChatDockHandle } from '../../components/shared/ChatDock';
import ChatMessages from '../../components/shell/ChatMessages';
// Authenticated tool components
import PipelinePanel from '../../components/chat/PipelinePanel';
import DataRoom from '../../components/chat/DataRoom';
import SettingsPanel from '../../components/chat/SettingsPanel';
import GateProgress from '../../components/chat/GateProgress';
import PaywallCard from '../../components/chat/PaywallCard';
import Canvas from '../../components/chat/Canvas';
import InlineSignupCard from '../../components/chat/InlineSignupCard';
import SellerDashboard from '../../components/chat/SellerDashboard';
import BuyerPipeline from '../../components/chat/BuyerPipeline';
// WalletPanel removed — platform fee model
import DocumentLibrary from '../../components/chat/DocumentLibrary';
import AnalyticsView from '../../components/chat/AnalyticsView';
import NDAModal from '../../components/chat/NDAModal';
const SellBelow = lazy(() => import('../../components/content/SellBelow'));
const BuyBelow = lazy(() => import('../../components/content/BuyBelow'));
const RaiseBelow = lazy(() => import('../../components/content/RaiseBelow'));
const IntegrateBelow = lazy(() => import('../../components/content/IntegrateBelow'));
const HowItWorksBelow = lazy(() => import('../../components/content/HowItWorksBelow'));
const AdvisorsBelow = lazy(() => import('../../components/content/AdvisorsBelow'));
const PricingBelow = lazy(() => import('../../components/content/PricingBelow'));

/* Minimal skeleton for lazy Below pages */
function BelowSkeleton() {
  return (
    <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto animate-pulse">
      <div className="h-12 w-3/4 bg-current opacity-[0.06] rounded-lg mb-8" />
      <div className="h-4 w-full bg-current opacity-[0.04] rounded mb-3" />
      <div className="h-4 w-5/6 bg-current opacity-[0.04] rounded mb-3" />
      <div className="h-4 w-2/3 bg-current opacity-[0.04] rounded" />
    </div>
  );
}

/* ═══ YULIA WELCOME MESSAGE — shown as first chat message ═══ */
const YULIA_WELCOME_MESSAGE: AnonMessage = {
  id: -1,
  role: 'assistant',
  content: `## Chat with your deals!

Yulia is a chat agent for all things M&A and she can guide you through the entire process of selling or buying a business, all by just chatting with your deals. No deal is too small or too complex.

**Start now completely free!**`,
  created_at: new Date().toISOString(),
};

/* ═══ DYNAMIC GREETING (time-of-day) ═══ */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 3) return 'Hi there, having a good night?';
  if (hour < 12) return 'Hi there, having a good morning?';
  if (hour < 17) return 'Hi there, having a good afternoon?';
  if (hour < 20) return 'Hi there, having a good evening?';
  return 'Hi there, having a good night?';
}

/* ═══ LOGO — transparent PNG with copper X ═══ */
function LogoImg({ height = 28, style, className }: { height?: number; style?: React.CSSProperties; className?: string }) {
  return (
    <img
      src="/logo-smbx.png"
      alt="smbx.ai"
      draggable={false}
      className={className}
      style={{ height, objectFit: 'contain', display: 'inline-block', ...style }}
    />
  );
}

/* ═══ ANIMATED LOGO — plays once, rests at final frame, re-cycles every 30s until interaction ═══ */
function AnimatedLogo({ height = 56, style, className, stopped }: { height?: number; style?: React.CSSProperties; className?: string; stopped?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInteracted = useRef(false);

  useEffect(() => {
    if (stopped) hasInteracted.current = true;
  }, [stopped]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    vid.play().catch(() => {});

    const onEnded = () => {
      vid.pause();
      if (!hasInteracted.current) {
        timerRef.current = setTimeout(() => {
          if (!hasInteracted.current && vid) {
            vid.currentTime = 0;
            vid.play().catch(() => {});
          }
        }, 30000);
      }
    };

    vid.addEventListener('ended', onEnded);
    return () => {
      vid.removeEventListener('ended', onEnded);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src="/logo-intro.mp4"
      muted
      playsInline
      className={className}
      style={{ height, objectFit: 'contain', display: 'inline-block', mixBlendMode: 'multiply', filter: 'brightness(1.08) contrast(1.05)', ...style }}
    />
  );
}

/* ═══ TYPEWRITER HINT POOL (home page) — Yulia speaking ═══ */
const TYPEWRITER_PREFIX = "";
const TYPEWRITER_HINTS = [
  "Hi, I'm Yulia. I can help you buy or sell any company by walking you through the complete process \u2014 documents, tax, and legal.",
  "I'm Yulia. I can walk you through the complete M&A process, from valuation to closing day.",
  "I'm Yulia. I can help you manage your deal portfolio and track every milestone across your transactions.",
  "I'm Yulia. I work with businesses of all types and sizes \u2014 from Main Street shops to middle-market companies.",
  "I'm Yulia. I can prepare your financials, build your CIM, and get your business ready for market.",
  "I'm Yulia. I can screen acquisition targets, model the financing, and tell you if the deal makes sense.",
  "I'm Yulia. I can help you raise capital \u2014 SBA loans, equity rounds, seller financing, or creative structures.",
  "I'm Yulia. I can generate valuations, LOIs, due diligence packages, and closing checklists on demand.",
  "I'm Yulia. I can analyze buyer demand in your market and identify who's actively looking to acquire.",
  "I'm Yulia. I can model tax impact, purchase price allocation, and help you keep more of what you earn.",
];

/* ═══ TYPES ═══ */

export type TabId = 'home' | 'sell' | 'buy' | 'raise' | 'integrate' | 'how-it-works' | 'advisors' | 'pricing';
export type ViewState = 'landing' | 'chat' | 'pipeline' | 'dataroom' | 'settings' | 'seller-dashboard' | 'buyer-pipeline' | 'documents' | 'analytics';

/* ═══ PAGE COPY ═══ */

interface PageCopy {
  overline: string;
  headline: string;
  terraWord: string;
  tagline: string;
  chips: string[];
  placeholder: string;
}

const PAGE_COPY: Record<TabId, PageCopy> = {
  home: {
    overline: '',
    headline: "What's the deal?",
    terraWord: 'deal?',
    tagline: "Tell Yulia about your business. She'll tell you what it's worth.",
    chips: [
      'I want to sell my business',
      'Looking to buy a business',
      'Need to raise capital',
      'Just closed — what now?',
    ],
    placeholder: 'Message Yulia...',
  },
  sell: {
    overline: '',
    headline: '',
    terraWord: '',
    tagline: '',
    chips: [],
    placeholder: 'Tell Yulia about your business...',
  },
  buy: {
    overline: 'Search & Acquire',
    headline: 'Find the right deal. Know it\u2019s the right deal.',
    terraWord: 'right deal.',
    tagline: 'Paste a listing. Describe a deal. Yulia tells you: pursue or pass \u2014 with the data to back it up.',
    chips: [
      "I found a listing \u2014 is the price fair?",
      'Can I finance this with SBA?',
      'Screen this deal in 5 minutes',
      "What's the DSCR on a $1.8M acquisition?",
      'Build my acquisition thesis',
    ],
    placeholder: "Tell Yulia what you're looking for...",
  },
  raise: {
    overline: 'Raise Capital',
    headline: 'The wrong capital costs more than the wrong price.',
    terraWord: 'wrong price.',
    tagline: 'Debt, equity, SBA, revenue-based financing \u2014 Yulia models every structure so you see what you keep and what you give up.',
    chips: [
      'I need $500K for a second location',
      'Equity vs. debt \u2014 which fits?',
      'Model the dilution on a $2M raise',
      'Build my pitch deck from financials',
    ],
    placeholder: 'Tell Yulia about your raise...',
  },
  integrate: {
    overline: 'Post-Acquisition',
    headline: 'The first 100 days determine everything.',
    terraWord: 'everything.',
    tagline: 'The first 100 days determine everything. Yulia\u2019s plan is built from your deal intelligence \u2014 not a template.',
    chips: [
      'I just closed \u2014 give me a 90-day plan',
      'Employee retention strategy',
      'What should I NOT change in month one?',
      'Build my value creation roadmap',
    ],
    placeholder: 'Tell Yulia about your acquisition...',
  },
  'how-it-works': {
    overline: 'HOW IT WORKS',
    headline: 'The $24,000 problem.',
    terraWord: '$24,000',
    tagline: 'Bloomberg Terminal runs $24,000/year. PitchBook runs $24,000/year. Neither was built for your deal.',
    chips: [
      'How is this different from ChatGPT?',
      'What data sources do you use?',
      'Show me the Seven Layers',
      'What does a valuation look like?',
    ],
    placeholder: 'Ask how the intelligence works...',
  },
  advisors: {
    overline: 'FOR ADVISORS & BROKERS',
    headline: '12 listings. 480 hours.',
    terraWord: '480 hours.',
    tagline: 'The average M&A advisor spends 40 hours per listing on analytical work alone. That\u2019s 480 hours a year that could be spent closing deals instead of building spreadsheets.',
    chips: [
      'Package a new listing for my client',
      'Pre-screen a buyer for SBA eligibility',
      "Map a market for my client's buy mandate",
      'Generate a CIM from raw financials',
    ],
    placeholder: "Tell Yulia about the deal you're working on...",
  },
  pricing: {
    overline: 'Pricing',
    headline: 'Start free. Stay because it works.',
    terraWord: 'works.',
    tagline: 'One conversation with Yulia surfaces the right plan for your deal. No sales calls. No commitment.',
    chips: [
      "What's included free?",
      'Compare plans',
      'How does Discovery work?',
      'Start a free analysis',
    ],
    placeholder: 'Ask about pricing...',
  },
};

/* Helper: highlight terra word in headline */
function renderHeadline(text: string, terraWord: string) {
  const idx = text.indexOf(terraWord);
  if (idx === -1) return text;
  return (
    <>
      {text.substring(0, idx)}
      <span style={{ color: '#b0004a' }}>{terraWord}</span>
      {text.substring(idx + terraWord.length)}
    </>
  );
}

/* ═══ NAV ITEMS ═══ */

const NAV_ITEMS: { id: TabId; label: string; icon: JSX.Element }[] = [
  {
    id: 'home',
    label: 'Home',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
];

/* Journey pages — still accessible via URL but not in sidebar nav */
const JOURNEY_NAV_ITEMS: { id: TabId; label: string; icon: JSX.Element }[] = [
  {
    id: 'sell',
    label: 'Sell',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      </svg>
    ),
  },
  {
    id: 'buy',
    label: 'Buy',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    id: 'raise' as TabId,
    label: 'Raise',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    id: 'integrate' as TabId,
    label: 'Integrate',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" />
      </svg>
    ),
  },
  {
    id: 'how-it-works' as TabId,
    label: 'How It Works',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    id: 'advisors',
    label: 'Advisors',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    id: 'pricing',
    label: 'Pricing',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
];

/* ═══ HELPERS ═══ */

function pathToTab(path: string): TabId {
  if (path === '/sell') return 'sell';
  if (path === '/buy') return 'buy';
  if (path === '/raise') return 'raise';
  if (path === '/integrate') return 'integrate';
  if (path === '/how-it-works') return 'how-it-works';
  if (path === '/advisors' || path === '/enterprise') return 'advisors';
  if (path === '/pricing') return 'pricing';
  return 'home';
}

function pathToViewState(path: string): ViewState {
  if (path === '/chat' || path.startsWith('/chat/')) return 'chat';
  if (path === '/pipeline') return 'pipeline';
  if (path === '/dataroom') return 'dataroom';
  if (path === '/settings') return 'settings';
  if (path === '/seller') return 'seller-dashboard';
  if (path === '/buyer') return 'buyer-pipeline';
  if (path === '/documents') return 'documents';
  if (path === '/analytics') return 'analytics';
  return 'landing';
}

function getInitialConversationId(path: string): number | null {
  if (path.startsWith('/chat/')) {
    const id = parseInt(path.split('/')[2], 10);
    return isNaN(id) ? null : id;
  }
  return null;
}

const JOURNEY_COLORS: Record<string, string> = {
  sell: '#b0004a',
  buy: '#4E8FD4',
  raise: '#6B8F4E',
  pmi: '#8F6BD4',
};

/* ═══ COMPONENT ═══ */

export default function AppShell() {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const [dark, setDark] = useDarkMode();

  // Core state
  const [viewState, setViewState] = useState<ViewState>(() => pathToViewState(location));
  const appOffset = useAppHeight(true);   // Always track visual viewport + lock body scroll (inner divs handle scrolling)
  const [activeTab, setActiveTab] = useState<TabId>(() => pathToTab(location));
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [viewingDeliverable, setViewingDeliverable] = useState<number | null>(null);
  const [canvasMarkdown, setCanvasMarkdown] = useState<{ content: string; title: string } | null>(null);
  const [morphing, setMorphing] = useState(false);
  const [heroFocused, setHeroFocused] = useState(false); // tracks when hero input is focused — controls logo position
  const [chatWidth, setChatWidth] = useState(520); // resizable chat column width
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop sidebar collapse
  const [ndaRequired, setNdaRequired] = useState<{ dealId: number; dealName?: string } | null>(null);
  // walletBalance removed — platform fee model
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  // Chat hooks (always called for hook order)
  const anonChat = useAnonymousChat();
  const authChat = useAuthChat(user);

  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<ChatDockHandle>(null);
  const sidebarLogoRef = useRef<HTMLDivElement>(null);
  const mobileHeaderLogoRef = useRef<HTMLButtonElement>(null);
  const heroLogoRef = useRef<HTMLDivElement>(null);       // desktop hero logo
  const mobileHeroLogoRef = useRef<HTMLDivElement>(null);  // mobile hero logo

  // Flying logo state — letters fly between center and sidebar/header
  const [flyingLogo, setFlyingLogo] = useState<{
    fromX: number; fromY: number; toX: number; toY: number; direction: 'to-sidebar' | 'to-center';
  } | null>(null);
  const prevHeroFocused = useRef(false);

  useEffect(() => {
    const goingSidebar = heroFocused && !prevHeroFocused.current;
    const goingCenter = !heroFocused && prevHeroFocused.current;
    prevHeroFocused.current = heroFocused;

    // On mobile, skip flying letters entirely — use simple crossfade instead
    if (isMobile) return;

    const targetRef = sidebarLogoRef.current;
    const sourceRef = heroLogoRef.current;

    if ((goingSidebar || goingCenter) && sourceRef && targetRef) {
      const hero = sourceRef.getBoundingClientRect();
      const side = targetRef.getBoundingClientRect();
      const cx = hero.left + hero.width / 2;
      const cy = hero.top + hero.height / 2;
      const sx = side.left + side.width / 2;
      const sy = side.top + side.height / 2;

      if (goingSidebar) {
        setFlyingLogo({ fromX: cx, fromY: cy, toX: sx, toY: sy, direction: 'to-sidebar' });
      } else {
        setFlyingLogo({ fromX: sx, fromY: sy, toX: cx, toY: cy, direction: 'to-center' });
      }
    }
  }, [heroFocused, isMobile]);

  // Drag-to-resize chat/canvas split
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = chatWidth;
    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX;
      const newWidth = Math.min(Math.max(startWidth + delta, 320), window.innerWidth - 400);
      setChatWidth(newWidth);
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [chatWidth]);

  // Set initial conversation ID from URL
  useEffect(() => {
    const convId = getInitialConversationId(window.location.pathname);
    if (convId) {
      if (user) authChat.selectConversation(convId);
      else anonChat.selectConversation(convId);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Unified message interface
  const rawMessages = user ? authChat.messages : anonChat.messages;
  // Show Yulia's welcome message only when chat has no messages yet
  const messages: AnonMessage[] = rawMessages.length === 0 ? [YULIA_WELCOME_MESSAGE] : rawMessages as AnonMessage[];
  const sending = user ? authChat.sending : anonChat.sending;
  const streamingText = user ? authChat.streamingText : anonChat.streamingText;
  const activeTool = user ? authChat.activeTool : null;

  // Sync URL → state
  useEffect(() => {
    const tab = pathToTab(location);
    if (tab !== activeTab && viewState === 'landing') setActiveTab(tab);
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

  // Browser back/forward
  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname;
      setViewState(pathToViewState(path));
      setActiveTab(pathToTab(path));
      const convId = getInitialConversationId(path);
      if (convId) {
        if (user) authChat.selectConversation(convId);
        else anonChat.selectConversation(convId);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll on new messages — instant on first entry, smooth after
  const chatEnteredAt = useRef(0);
  useEffect(() => {
    if (viewState === 'chat') chatEnteredAt.current = Date.now();
  }, [viewState]);
  useEffect(() => {
    if (viewState === 'chat') {
      const justEntered = Date.now() - chatEnteredAt.current < 1500;
      messagesEndRef.current?.scrollIntoView({ behavior: justEntered ? 'instant' as ScrollBehavior : 'smooth' });
    }
  }, [messages, streamingText, viewState]);

  // Reset scroll to top when landing page renders or tab changes
  useEffect(() => {
    if (viewState === 'landing' && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [viewState, activeTab]);

  // Wallet balance fetch removed — platform fee model (no wallet)

  // Send handler — morph from landing to chat
  const handleSend = useCallback((content: string) => {
    if (viewState === 'landing') {
      if (user) authChat.sendMessage(content);
      else anonChat.sendMessage(content, activeTab);
      if (isMobile) {
        // Mobile: instant swap, no morphing — chat fade-in handles the transition
        setViewState('chat');
        if (window.location.pathname !== '/chat') navigate('/chat');
      } else {
        // Desktop: smooth morph-out then swap
        setMorphing(true);
        setTimeout(() => {
          setViewState('chat');
          setMorphing(false);
          if (window.location.pathname !== '/chat') navigate('/chat');
        }, 300);
      }
      return;
    }
    if (user) authChat.sendMessage(content);
    else anonChat.sendMessage(content, activeTab);
  }, [viewState, user, authChat, anonChat, navigate, activeTab, isMobile]);

  // Chip click
  const handleChipClick = useCallback((text: string) => {
    dockRef.current?.clear();
    handleSend(text);
  }, [handleSend]);

  // Back to landing
  const handleBack = useCallback(() => {
    setHeroFocused(false);
    setViewState('landing');
    const urlMap: Record<TabId, string> = { home: '/', sell: '/sell', buy: '/buy', raise: '/raise', integrate: '/integrate', 'how-it-works': '/how-it-works', advisors: '/advisors', pricing: '/pricing' };
    navigate(urlMap[activeTab]);
  }, [activeTab, navigate]);

  // Tab click
  const handleTabClick = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setViewState('landing');
    setIsMobileSidebarOpen(false);
    const urlMap: Record<TabId, string> = { home: '/', sell: '/sell', buy: '/buy', raise: '/raise', integrate: '/integrate', 'how-it-works': '/how-it-works', advisors: '/advisors', pricing: '/pricing' };
    if (window.location.pathname !== urlMap[tab]) navigate(urlMap[tab]);
  }, [navigate]);

  // New chat
  const handleNewChat = useCallback(() => {
    if (user) authChat.newConversation();
    setViewState('chat');
    navigate('/chat');
  }, [user, authChat, navigate]);

  // Logout
  const handleLogout = useCallback(() => {
    logout();
    setViewState('landing');
    setActiveTab('home');
    navigate('/');
  }, [logout, navigate]);


  // Offline detection
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => { window.removeEventListener('offline', goOffline); window.removeEventListener('online', goOnline); };
  }, []);

  // Auto-open canvas when anonymous deliverable is detected
  useEffect(() => {
    if (!user && anonChat.pendingDeliverable) {
      const msg = anonChat.pendingDeliverable;
      const type = msg.metadata?.deliverableType as string;
      const LABELS: Record<string, string> = {
        value_readiness_report: 'Value Readiness Report',
        thesis_document: 'Acquisition Thesis',
        sde_analysis: 'SDE Analysis',
      };
      setCanvasMarkdown({ content: msg.content, title: LABELS[type] || 'Document' });
      anonChat.setPendingDeliverable(null);
    }
  }, [user, anonChat.pendingDeliverable]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handler: open deliverable from chat message click
  const handleOpenDeliverable = useCallback((msg: { content: string; metadata?: Record<string, any> | null }) => {
    const type = msg.metadata?.deliverableType as string | undefined;
    const LABELS: Record<string, string> = {
      value_readiness_report: 'Value Readiness Report',
      thesis_document: 'Acquisition Thesis',
      sde_analysis: 'SDE Analysis',
      valuation_report: 'Valuation Report',
      deal_screening_memo: 'Deal Screening Memo',
      sba_financing_model: 'SBA Financing Model',
    };
    setCanvasMarkdown({ content: msg.content, title: LABELS[type || ''] || 'Document' });
  }, []);

  const closeCanvas = useCallback(() => {
    setCanvasMarkdown(null);
    setViewingDeliverable(null);
  }, []);

  const canvasOpen = canvasMarkdown !== null || viewingDeliverable !== null;

  // Auto-collapse sidebar when canvas opens
  useEffect(() => {
    if (canvasOpen && !isMobile) setSidebarCollapsed(true);
  }, [canvasOpen, isMobile]);

  // Signup prompt
  const showSignup = !user && (
    anonChat.limitReached ||
    (anonChat.messagesRemaining !== null && anonChat.messagesRemaining <= 5 && anonChat.messages.length > 0)
  );

  // Redirect unauth from tool views
  useEffect(() => {
    if (['pipeline', 'dataroom', 'settings', 'seller-dashboard', 'buyer-pipeline'].includes(viewState) && !user) navigate('/login');
  }, [viewState, user, navigate]);

  // NDA check when entering data room
  useEffect(() => {
    if (viewState !== 'dataroom' || !user || !authChat.activeDealId) return;
    (async () => {
      try {
        const res = await fetch(`/api/deals/${authChat.activeDealId}/data-room`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('smbx_token') || ''}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.ndaRequired && !data.ndaSigned) {
          setNdaRequired({ dealId: authChat.activeDealId!, dealName: data.dealName });
        }
      } catch { /* ignore */ }
    })();
  }, [viewState, user, authChat.activeDealId]);

  // Show dock
  const showDock = (viewState === 'landing' || viewState === 'chat') && !(!user && anonChat.limitReached);

  // Current page copy
  const page = PAGE_COPY[activeTab];

  // Conversations — unified across auth and anonymous
  const allConversations = user ? authChat.conversations : anonChat.conversations;
  const activeConvId = user ? authChat.activeConversationId : anonChat.activeConversationId;

  // Group conversations by date (fallback)
  const groupByDate = (convos: typeof allConversations) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const lastWeek = new Date(today.getTime() - 7 * 86400000);

    const groups: { label: string; items: typeof convos; journey?: string | null }[] = [
      { label: 'Today', items: [] },
      { label: 'Yesterday', items: [] },
      { label: 'Last 7 Days', items: [] },
      { label: 'Older', items: [] },
    ];

    for (const c of convos || []) {
      const d = new Date(c.updated_at);
      if (d >= today) groups[0].items.push(c);
      else if (d >= yesterday) groups[1].items.push(c);
      else if (d >= lastWeek) groups[2].items.push(c);
      else groups[3].items.push(c);
    }

    return groups.filter(g => g.items.length > 0);
  };

  // Smart grouping: by deal when 2+ distinct deals, otherwise by date
  const groupConversations = (convos: typeof allConversations) => {
    const distinctDeals = new Set((convos || []).map(c => c.deal_id).filter(Boolean));
    if (distinctDeals.size < 2) return { mode: 'date' as const, groups: groupByDate(convos) };

    const dealGroups = new Map<string, { label: string; journey: string | null; items: typeof convos }>();
    const general: typeof convos = [];

    for (const c of convos || []) {
      if (!c.deal_id) {
        general.push(c);
        continue;
      }
      const key = String(c.deal_id);
      if (!dealGroups.has(key)) {
        const journeyLabel = c.journey ? c.journey.charAt(0).toUpperCase() + c.journey.slice(1) : null;
        const label = c.business_name || (journeyLabel && c.industry ? `${journeyLabel} — ${c.industry}` : null) || 'Deal';
        dealGroups.set(key, { label, journey: c.journey || null, items: [] });
      }
      dealGroups.get(key)!.items.push(c);
    }

    // Sort groups by most recent updated_at DESC
    const sorted = [...dealGroups.values()].sort((a, b) => {
      const aMax = Math.max(...a.items.map(i => new Date(i.updated_at).getTime()));
      const bMax = Math.max(...b.items.map(i => new Date(i.updated_at).getTime()));
      return bMax - aMax;
    });

    const groups = sorted.map(g => ({ label: g.label, journey: g.journey, items: g.items }));
    if (general.length > 0) groups.push({ label: 'General', journey: null, items: general });

    return { mode: 'deal' as const, groups };
  };

  const { mode: groupMode, groups: conversationGroups } = groupConversations(allConversations);

  // Session restore: auto-open most recent conversation on mount
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    if (restored) return;
    setRestored(true);
    // Only restore if we're on /chat or /chat/:id, or if there's no explicit landing page
    const path = window.location.pathname;
    if (path === '/chat' || path.startsWith('/chat/')) {
      const convId = getInitialConversationId(path);
      if (convId) return; // already handled by existing useEffect
      // /chat with no ID: load most recent conversation
      if (!user && allConversations.length > 0) {
        const most = allConversations[0]; // sorted by updated_at DESC
        anonChat.selectConversation(most.id);
        setViewState('chat');
      }
    }
  }, [restored, allConversations]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ═══ SIDEBAR JSX — 80px icon rail (new design) ═══ */

  const sidebarContent = (_mobile: boolean) => (
    <aside
      className={`hidden lg:flex flex-col h-screen w-20 fixed left-0 top-0 z-50 items-center py-6 ${dark ? 'bg-zinc-950 border-r border-zinc-800/50' : 'bg-white border-r border-[#eeeef0] shadow-sm'}`}
    >
      {/* Explore section */}
      <div className="flex flex-col items-center gap-1 w-full px-2 mt-2" ref={sidebarLogoRef as any}>
        <span className={`text-[9px] font-bold uppercase tracking-widest mb-2 ${dark ? 'text-zinc-500' : 'text-[#5a4044]'}`}>Explore</span>
        {([
          { id: 'sell' as TabId, icon: 'storefront', label: 'Sell' },
          { id: 'buy' as TabId, icon: 'shopping_bag', label: 'Buy' },
          { id: 'raise' as TabId, icon: 'trending_up', label: 'Raise' },
          { id: 'integrate' as TabId, icon: 'merge', label: 'Integrate' },
          { id: 'advisors' as TabId, icon: 'handshake', label: 'Advisors' },
          { id: 'how-it-works' as TabId, icon: 'help_outline', label: 'How' },
          { id: 'pricing' as TabId, icon: 'sell', label: 'Pricing' },
        ]).map(item => {
          const isActive = activeTab === item.id && viewState === 'landing';
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all border-none cursor-pointer ${
                isActive
                  ? (dark ? 'text-rose-500 bg-rose-500/10' : 'text-[#b0004a] bg-[#b0004a]/5')
                  : (dark ? 'text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10' : 'text-[#636467] hover:text-[#b0004a] hover:bg-[#b0004a]/5')
              }`}
              title={item.label}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="text-[9px] font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className={`w-10 my-4 ${dark ? 'border-t border-zinc-800/50' : 'border-t border-[#eeeef0]'}`} />

      {/* Tools section — logged-in user features */}
      {user && (
      <div className="flex flex-col items-center gap-1 w-full px-2">
        <span className={`text-[9px] font-bold uppercase tracking-widest mb-2 ${dark ? 'text-zinc-500' : 'text-[#5a4044]'}`}>Tools</span>
        {([
          { view: 'documents' as ViewState, icon: 'folder_open', label: 'Library', route: '/documents' },
          { view: 'dataroom' as ViewState, icon: 'lock', label: 'Data Rm', route: '/dataroom' },
          { view: 'pipeline' as ViewState, icon: 'view_kanban', label: 'Pipeline', route: '/pipeline' },
        ]).map(item => {
          const isActive = viewState === item.view;
          return (
            <button
              key={item.view}
              onClick={() => { setViewState(item.view); navigate(item.route); }}
              className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all border-none cursor-pointer ${
                isActive
                  ? (dark ? 'text-rose-500 bg-rose-500/10' : 'text-[#b0004a] bg-[#b0004a]/5')
                  : (dark ? 'text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10' : 'text-[#636467] hover:text-[#b0004a] hover:bg-[#b0004a]/5')
              }`}
              title={item.label}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="text-[9px] font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>
      )}

      {/* Divider */}
      <div className={`w-10 my-4 ${dark ? 'border-t border-zinc-800/50' : 'border-t border-[#eeeef0]'}`} />

      {/* Chats section */}
      <div className="flex flex-col items-center gap-1 w-full px-2 flex-1 min-h-0">
        <span className={`text-[9px] font-bold uppercase tracking-widest mb-2 ${dark ? 'text-zinc-500' : 'text-[#5a4044]'}`}>Chats</span>
        <button
          onClick={() => { handleNewChat(); }}
          className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 border-none cursor-pointer ${dark ? 'text-rose-500 bg-rose-500/10' : 'text-[#b0004a] bg-[#b0004a]/5'}`}
          title="New Chat"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">add_comment</span>
          <span className="text-[9px] font-semibold">New</span>
        </button>
        <button
          onClick={() => { setViewState('chat'); navigate('/chat'); }}
          className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all border-none cursor-pointer ${
            viewState === 'chat'
              ? (dark ? 'text-rose-500 bg-rose-500/10' : 'text-[#b0004a] bg-[#b0004a]/5')
              : (dark ? 'text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10' : 'text-[#636467] hover:text-[#b0004a] hover:bg-[#b0004a]/5')
          }`}
          title="Chat History"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">forum</span>
          <span className="text-[9px] font-semibold">History</span>
        </button>
      </div>

      {/* Bottom: Settings + Profile */}
      <div className="flex flex-col items-center gap-3 mt-auto pt-4">
        <button
          onClick={() => { if (user) { setViewState('settings'); navigate('/settings'); } else navigate('/login'); }}
          className={`material-symbols-outlined transition-colors text-[22px] bg-transparent border-none cursor-pointer ${dark ? 'text-zinc-500 hover:text-rose-500' : 'text-[#636467] hover:text-[#b0004a]'}`}
          type="button"
        >settings</button>
        <button
          onClick={() => { if (user) { setViewState('settings'); navigate('/settings'); } else navigate('/login'); }}
          className={`h-9 w-9 rounded-xl overflow-hidden flex items-center justify-center border-none cursor-pointer ${dark ? 'bg-zinc-800 border border-zinc-700' : 'bg-[#eeeef0] border border-[#e3bdc3]'}`}
          type="button"
        >
          <span className={`material-symbols-outlined text-[18px] ${dark ? 'text-zinc-500' : 'text-[#5a4044]'}`}>person</span>
        </button>
      </div>
    </aside>
  );

  /* ═══ RENDER ═══ */

  return (
    <div
      id="app-root"
      className={`flex font-sans ${dark ? 'bg-[#1a1c1e] text-[#f0f0f3]' : 'bg-white text-[#1a1c1e]'}`}
      style={{
        height: 'var(--app-height, 100vh)',
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        ...(appOffset ? { transform: `translateY(${appOffset}px)` } : {}),
      }}
    >
      {/* Desktop sidebar — fixed 80px icon rail */}
      {sidebarContent(false)}

      {/* Main canvas — offset by 80px sidebar on desktop */}
      <div className={`flex-1 flex flex-col min-w-0 h-full lg:ml-20 ${dark ? 'bg-[#1a1c1e]' : 'bg-white'}`}>
        {/* Offline banner */}
        {isOffline && (
          <div className="shrink-0 bg-yellow-50 border-b border-yellow-200 px-4 py-2 flex items-center justify-center gap-2 z-30">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-xs font-semibold text-yellow-800">You appear to be offline. Messages will send when you reconnect.</span>
          </div>
        )}
        {/* Header — hidden on mobile (floating icons replace it), shown on desktop */}
        {!isMobile && (viewState !== 'landing' || activeTab !== 'home') && (
        <header
          className={`flex-shrink-0 flex items-center justify-between h-14 px-6 z-20 ${dark ? 'border-b border-zinc-800/50' : 'border-b border-[#eeeef0]'}`}
          style={{ background: dark ? 'rgba(26,28,30,0.80)' : 'rgba(255,255,255,0.80)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        >
          <div className="flex items-center gap-3">
            {viewState === 'chat' ? (
              <div className="flex items-center gap-3" style={{ animation: 'fadeIn 0.3s ease' }}>
                <button
                  onClick={handleBack}
                  className={`w-10 h-10 flex items-center justify-center bg-transparent border-none cursor-pointer ${dark ? 'text-zinc-400' : 'text-[#5d5e61]'}`}
                  style={{ borderRadius: 12 }}
                  type="button"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
                  </svg>
                </button>
                <LogoImg height={20} />
              </div>
            ) : (
              <>
                {isMobile && (
                  <button
                    ref={mobileHeaderLogoRef}
                    onClick={() => handleTabClick('home')}
                    className="bg-transparent border-none cursor-pointer p-0 leading-none"
                    type="button"
                  >
                    <LogoImg height={22} />
                  </button>
                )}
                {!isMobile && (
                  <button
                    onClick={() => handleTabClick('home')}
                    className="bg-transparent border-none cursor-pointer p-0 leading-none"
                    type="button"
                  >
                    <LogoImg height={22} />
                  </button>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!user && (
              <button
                onClick={() => navigate('/login')}
                className="text-white border-none cursor-pointer hover:opacity-90 transition-all font-headline text-[13px] font-bold"
                style={{ background: 'linear-gradient(135deg, #b0004a, #d81b60)', borderRadius: '100px', padding: '9px 20px' }}
                type="button"
              >
                Start chatting
              </button>
            )}
            {user && (
              <span className={`text-[13px] font-semibold font-headline ${dark ? 'text-zinc-400' : 'text-[#5d5e61]'}`}>{user.display_name || user.email}</span>
            )}
          </div>
        </header>
        )}

        {/* Main row: chat + canvas split */}
        <div className={`flex-1 flex min-h-0 ${dark ? 'bg-[#1a1c1e]' : (viewState === 'landing' && activeTab !== 'home' ? 'bg-[#f9f9fc]' : 'bg-white')}`}>
        {/* Chat column — resizable on desktop in chat mode, flex on landing/other */}
        <div
          className={`flex flex-col min-w-0 ${dark ? 'bg-[#1a1c1e]' : (viewState === 'landing' && activeTab !== 'home' ? 'bg-[#f9f9fc]' : 'bg-white')}`}
          style={!isMobile && viewState === 'chat' ? { width: chatWidth, flexShrink: 0 } : { flex: 1 }}
        >
        {/* Scroll area */}
        <div
          ref={scrollRef}
          className={`flex-1 overflow-y-auto min-h-0 ${dark ? 'bg-[#1a1c1e]' : (viewState === 'landing' && activeTab !== 'home' ? 'bg-[#f9f9fc]' : 'bg-white')}`}
          style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' } as any}
        >
          {/* ════ LANDING MODE ════ */}
          {viewState === 'landing' && (
            <div key={activeTab} style={{ animation: morphing ? (isMobile ? 'fadeOut 0.2s ease forwards' : 'morphOut 0.3s ease forwards') : activeTab === 'home' ? 'fadeOnly 0.25s ease' : 'slideUp 0.35s ease', pointerEvents: morphing ? 'none' as const : undefined, ...(activeTab === 'home' ? { overflow: 'hidden', display: 'flex', flexDirection: 'column' as const, height: '100%' } : {}) }}>
              {activeTab === 'home' ? (
              <>
                {/* ═══ HOME PAGE — New Design ═══ */}
                <main className="flex-1 flex flex-col relative">
                  {/* Background blur orbs */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className={`absolute -top-[10%] -left-[10%] w-[40%] h-[40%] blur-[120px] rounded-full ${dark ? 'bg-[#b0004a]/10' : 'bg-[#b0004a]/5'}`} />
                    <div className={`absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] blur-[120px] rounded-full ${dark ? 'bg-[#d81b60]/10' : 'bg-[#d81b60]/5'}`} />
                  </div>

                  {/* Center zone — hero text (vertically centered) */}
                  <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
                    <div className="max-w-4xl w-full text-center space-y-6">
                      <LogoImg height={isMobile ? 32 : 32} className="mx-auto mb-2" />
                      <h1 className="font-headline text-5xl md:text-6xl lg:text-8xl font-extrabold leading-tight tracking-tighter">
                        What's the <span className={dark ? 'text-[#d81b60]' : 'text-[#b0004a]'}>deal?</span>
                      </h1>
                      <p className={`text-base md:text-xl max-w-[320px] md:max-w-2xl mx-auto font-medium ${dark ? 'text-zinc-400' : 'text-[#636467]'}`}>
                        Tell Yulia about your business. She'll tell you what it's worth.
                      </p>
                    </div>

                    {/* Desktop: gradient-glow input + chips inline below hero */}
                    {!isMobile && (
                      <div className="max-w-4xl w-full text-center mt-12 relative z-10">
                        <div className="w-full max-w-3xl mx-auto">
                          <div className="relative group">
                            <div className={`absolute -inset-1 bg-gradient-to-r from-[#b0004a] to-[#d81b60] rounded-full blur transition duration-1000 ${dark ? 'opacity-40 group-hover:opacity-60' : 'opacity-10 group-hover:opacity-20'}`} />
                            <div className={`relative rounded-full flex items-center p-2 pl-6 ${dark ? 'bg-zinc-900/90 border border-zinc-700 shadow-2xl' : 'bg-white border border-[#e3bdc3] shadow-xl'}`}>
                              <span className={`material-symbols-outlined mr-4 ${dark ? 'text-rose-500' : 'text-[#b0004a]'}`}>bolt</span>
                              <input
                                className={`bg-transparent border-none focus:ring-0 flex-1 py-4 text-lg outline-none ${dark ? 'text-white placeholder-zinc-500' : 'text-[#1a1c1e] placeholder-[#5a4044]'}`}
                                placeholder="Message Yulia..."
                                type="text"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                                    handleSend((e.target as HTMLInputElement).value.trim());
                                    (e.target as HTMLInputElement).value = '';
                                  }
                                }}
                              />
                              <button
                                onClick={(e) => {
                                  const input = (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement);
                                  if (input?.value.trim()) { handleSend(input.value.trim()); input.value = ''; }
                                }}
                                className="bg-gradient-to-br from-[#b0004a] to-[#d81b60] text-white h-12 w-12 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform border-none cursor-pointer"
                              >
                                <span className="material-symbols-outlined">arrow_forward</span>
                              </button>
                            </div>
                          </div>

                          {/* Desktop suggestion chips */}
                          <div className="mt-6 flex flex-wrap justify-center gap-3">
                            {['I want to sell my business', 'Looking to buy a business', 'Need to raise capital', 'Just closed — what now?'].map(chip => (
                              <button
                                key={chip}
                                onClick={() => handleSend(chip)}
                                className={`px-4 py-2 rounded-full text-sm cursor-pointer transition-all border-none ${
                                  dark
                                    ? 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                                    : 'bg-white text-[#636467] shadow-sm hover:border-[#b0004a] hover:text-[#b0004a]'
                                }`}
                                style={{ border: dark ? '1px solid rgba(63,63,70,0.5)' : '1px solid #e3bdc3' }}
                                type="button"
                              >
                                {chip}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Desktop trust line */}
                        <p className={`text-xs font-medium mt-8 ${dark ? 'text-zinc-600' : 'text-[#636467]/50'}`}>
                          Free analysis · No account required · Your data stays yours
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Mobile bottom zone: chips + gradient input + micro-copy */}
                  {isMobile && (
                    <div className="shrink-0 px-4 pb-2 relative z-10" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
                      {/* Mobile chips */}
                      <div className="flex flex-wrap justify-center gap-2 mb-4">
                        {['I want to sell my business', 'Looking to buy a business', 'Need to raise capital', 'Just closed — what now?'].map(chip => (
                          <button
                            key={chip}
                            onClick={() => handleSend(chip)}
                            className={`px-3 py-1.5 rounded-full text-xs cursor-pointer transition-all border-none ${
                              dark
                                ? 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                                : 'bg-white text-[#636467] shadow-sm hover:border-[#b0004a] hover:text-[#b0004a]'
                            }`}
                            style={{ border: dark ? '1px solid rgba(63,63,70,0.5)' : '1px solid #e3bdc3' }}
                            type="button"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                      {/* Gradient-glow input (same as desktop) */}
                      <div className="relative group">
                        <div className={`absolute -inset-1 bg-gradient-to-r from-[#b0004a] to-[#d81b60] rounded-full blur transition duration-1000 ${dark ? 'opacity-40 group-hover:opacity-60' : 'opacity-10 group-hover:opacity-20'}`} />
                        <div className={`relative rounded-full flex items-center p-2 pl-5 ${dark ? 'bg-zinc-900/90 border border-zinc-700 shadow-2xl' : 'bg-white border border-[#e3bdc3] shadow-xl'}`}>
                          <span className={`material-symbols-outlined mr-3 ${dark ? 'text-rose-500' : 'text-[#b0004a]'}`}>bolt</span>
                          <input
                            className={`bg-transparent border-none focus:ring-0 flex-1 py-3 text-base outline-none ${dark ? 'text-white placeholder-zinc-500' : 'text-[#1a1c1e] placeholder-[#5a4044]'}`}
                            placeholder="Message Yulia..."
                            type="text"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                                handleSend((e.target as HTMLInputElement).value.trim());
                                (e.target as HTMLInputElement).value = '';
                              }
                            }}
                          />
                          <button
                            onClick={(e) => {
                              const input = (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement);
                              if (input?.value.trim()) { handleSend(input.value.trim()); input.value = ''; }
                            }}
                            className="bg-gradient-to-br from-[#b0004a] to-[#d81b60] text-white h-10 w-10 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform border-none cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                          </button>
                        </div>
                      </div>
                      <p className={`text-[10px] font-medium text-center mt-3 ${dark ? 'text-zinc-600' : 'text-[#636467]/50'}`}>
                        Free analysis · No account required · Your data stays yours
                      </p>
                    </div>
                  )}
                </main>
              </>
              ) : activeTab === 'sell' ? (
              <Suspense fallback={<BelowSkeleton />}>
              <SellBelow />
              </Suspense>
              ) : activeTab === 'buy' ? (
              <Suspense fallback={<BelowSkeleton />}>
              <BuyBelow />
              </Suspense>
              ) : activeTab === 'raise' ? (
              <Suspense fallback={<BelowSkeleton />}>
              <RaiseBelow />
              </Suspense>
              ) : activeTab === 'how-it-works' ? (
              <Suspense fallback={<BelowSkeleton />}>
              <HowItWorksBelow />
              </Suspense>
              ) : activeTab === 'integrate' ? (
              <Suspense fallback={<BelowSkeleton />}>
              <IntegrateBelow />
              </Suspense>
              ) : activeTab === 'advisors' ? (
              <Suspense fallback={<BelowSkeleton />}>
              <AdvisorsBelow />
              </Suspense>
              ) : activeTab === 'pricing' ? (
              <Suspense fallback={<BelowSkeleton />}>
              <PricingBelow />
              </Suspense>
              ) : null}
            </div>
          )}

          {/* ════ CHAT MODE ════ */}
          {viewState === 'chat' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={isMobile ? { paddingTop: 48 } : undefined}
            >
              {user && authChat.activeDealId && (
                <GateProgress dealId={authChat.activeDealId} currentGate={authChat.currentGate} />
              )}

              <ChatMessages
                messages={messages}
                streamingText={streamingText}
                sending={sending}
                activeTool={activeTool}
                error={user ? null : anonChat.error}
                onRetry={!user ? () => {
                  const last = anonChat.messages.filter(m => m.role === 'user').pop();
                  if (last) anonChat.sendMessage(last.content);
                } : undefined}
                onOpenDeliverable={handleOpenDeliverable}
                onShortcutClick={(fill) => {
                  dockRef.current?.clear();
                  handleSend(fill);
                }}
                desktop={!isMobile}
              />

              {user && authChat.paywallData && authChat.activeDealId && (
                <div className="px-4 mb-4">
                  <PaywallCard
                    paywall={authChat.paywallData}
                    dealId={authChat.activeDealId}
                    onUnlocked={(toGate, deliverableId) => {
                      authChat.setPaywallData(null);
                      if (deliverableId) setViewingDeliverable(deliverableId);
                    }}
                  />
                </div>
              )}

              {showSignup && (
                <div className="px-4 mb-4" style={{ maxWidth: 480 }}>
                  <InlineSignupCard sessionId={anonChat.getSessionId()} canDismiss={!anonChat.limitReached} />
                </div>
              )}

              <div ref={messagesEndRef} />
            </motion.div>
          )}

          {/* ════ TOOL VIEWS ════ */}
          {viewState === 'pipeline' && user && (
            <div className="max-w-5xl mx-auto px-4 py-6">
              <PipelinePanel
                onOpenConversation={(convId) => { authChat.selectConversation(convId); setViewState('chat'); navigate(`/chat/${convId}`); }}
                onNewDeal={() => { authChat.newConversation(); setViewState('chat'); navigate('/chat'); }}
                isFullscreen={true}
              />
            </div>
          )}

          {viewState === 'dataroom' && user && (
            <div className="max-w-5xl mx-auto px-4 py-6">
              <DataRoom dealId={authChat.activeDealId} onViewDeliverable={(id) => setViewingDeliverable(id)} />
            </div>
          )}

          {/* NDA Modal */}
          {ndaRequired && (
            <NDAModal
              dealId={ndaRequired.dealId}
              dealName={ndaRequired.dealName}
              onAccept={() => setNdaRequired(null)}
              onDecline={() => { setNdaRequired(null); setViewState('chat'); navigate('/chat'); }}
            />
          )}

          {viewState === 'seller-dashboard' && user && (
            <div className="max-w-5xl mx-auto px-4 py-6">
              <SellerDashboard />
            </div>
          )}

          {viewState === 'buyer-pipeline' && user && (
            <div className="max-w-5xl mx-auto px-4 py-6">
              <BuyerPipeline />
            </div>
          )}

          {viewState === 'settings' && user && (
            <div className="max-w-3xl mx-auto px-4 py-6">
              <SettingsPanel user={user} onLogout={handleLogout} isFullscreen={true} />
            </div>
          )}

          {/* Wallet view removed — platform fee model (no wallet) */}

          {viewState === 'documents' && user && (
            <DocumentLibrary onViewDeliverable={(id) => setViewingDeliverable(id)} />
          )}

          {viewState === 'analytics' && user && (
            <AnalyticsView
              onOpenConversation={(convId) => { authChat.selectConversation(convId); setViewState('chat'); navigate(`/chat/${convId}`); }}
              onNewDeal={() => { authChat.newConversation(); setViewState('chat'); navigate('/chat'); }}
            />
          )}
        </div>

        {/* ════ CHATDOCK — chat mode, pinned at bottom ════ */}
        {showDock && viewState === 'chat' && (
          <div className="shrink-0 px-4 pt-2" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))', touchAction: 'manipulation' }}>
            <ChatDock
              ref={dockRef}
              onSend={handleSend}
              variant="hero"
              rows={1}
              placeholder="Reply to Yulia..."
              disabled={sending}
            />
          </div>
        )}

        </div>{/* end chat column */}

        {/* ════ RESIZE HANDLE ════ */}
        {!isMobile && viewState === 'chat' && (
          <div
            className="resize-handle"
            onMouseDown={handleResizeStart}
            style={{
              width: 6,
              cursor: 'col-resize',
              background: 'transparent',
              flexShrink: 0,
              position: 'relative',
              zIndex: 10,
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0, bottom: 0, left: 2,
              width: 2, background: 'rgba(0,0,0,0.08)',
              borderRadius: 1,
              transition: 'background 0.15s ease',
            }} />
          </div>
        )}

        {/* ════ DESKTOP CANVAS PANEL — always visible on desktop ════ */}
        {!isMobile && viewState === 'chat' && (
          <div
            className="flex flex-col min-w-0"
            style={{
              flex: 1,
              background: canvasOpen ? '#fff' : '#EDEDEA',
              position: 'relative',
            }}
          >
            {canvasOpen ? (
              <>
                {canvasMarkdown ? (
                  <Canvas
                    markdownContent={canvasMarkdown.content}
                    title={canvasMarkdown.title}
                    onClose={closeCanvas}
                  />
                ) : viewingDeliverable !== null ? (
                  <Canvas
                    deliverableId={viewingDeliverable}
                    dealId={user ? authChat.activeDealId : null}
                    onClose={closeCanvas}
                  />
                ) : null}
              </>
            ) : (
              /* Empty state — logo + message */
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                height: '100%', gap: 16, opacity: 0.4,
              }}>
                <LogoImg height={36} />
                <p className="font-headline text-sm font-medium" style={{ color: dark ? '#f0f0f3' : '#1a1c1e', margin: 0 }}>
                  Nothing to see here
                </p>
              </div>
            )}
          </div>
        )}

        </div>{/* end main row */}

        {/* ════ MOBILE CANVAS OVERLAY ════ */}
        {canvasOpen && isMobile && (
          <div className="fixed inset-0 z-50 bg-white flex flex-col" style={{ animation: 'slideUpIn 0.3s ease' }}>
            {canvasMarkdown ? (
              <Canvas
                markdownContent={canvasMarkdown.content}
                title={canvasMarkdown.title}
                onClose={closeCanvas}
              />
            ) : viewingDeliverable !== null ? (
              <Canvas
                deliverableId={viewingDeliverable}
                dealId={user ? authChat.activeDealId : null}
                onClose={closeCanvas}
              />
            ) : null}
          </div>
        )}
      </div>

      {/* Global keyframe animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOnly {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .logo-intro {
          animation: logoReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes logoReveal {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes morphOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(28px); }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideUpIn {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .resize-handle:hover > div,
        .resize-handle:active > div {
          background: rgba(0,0,0,0.2) !important;
        }
      `}</style>

      {/* ═══ MOBILE SIDEBAR DRAWER ═══ */}
      {isMobile && isMobileSidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60] bg-black/40"
            onClick={() => setIsMobileSidebarOpen(false)}
            style={{ animation: 'fadeOnly 0.2s ease' }}
          />
          {/* Drawer */}
          <nav
            className={`fixed top-0 left-0 bottom-0 z-[61] w-64 flex flex-col py-12 px-6 ${dark ? 'bg-[#1a1c1e] border-r border-zinc-800' : 'bg-white border-r border-[#eeeef0] shadow-xl'}`}
            style={{ animation: 'slideInLeft 0.25s ease' }}
          >
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className={`absolute top-4 right-4 bg-transparent border-none cursor-pointer p-0 ${dark ? 'text-[#f0f0f3]/70' : 'text-[#1a1c1e]/70'}`}
              type="button"
              aria-label="Close menu"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
            <LogoImg height={22} className="mb-8" />
            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-4 ${dark ? 'text-zinc-500' : 'text-[#636467]'}`}>Explore</span>
            {([
              { id: 'home' as TabId, icon: 'home', label: 'Home' },
              { id: 'sell' as TabId, icon: 'storefront', label: 'Sell' },
              { id: 'buy' as TabId, icon: 'shopping_bag', label: 'Buy' },
              { id: 'raise' as TabId, icon: 'trending_up', label: 'Raise' },
              { id: 'integrate' as TabId, icon: 'merge', label: 'Integrate' },
              { id: 'advisors' as TabId, icon: 'handshake', label: 'Advisors' },
              { id: 'how-it-works' as TabId, icon: 'help_outline', label: 'How It Works' },
              { id: 'pricing' as TabId, icon: 'sell', label: 'Pricing' },
            ]).map(item => {
              const isActive = activeTab === item.id && viewState === 'landing';
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-3 py-3 px-3 rounded-xl text-left transition-all border-none cursor-pointer text-sm font-medium ${
                    isActive
                      ? (dark ? 'text-rose-500 bg-rose-500/10' : 'text-[#b0004a] bg-[#b0004a]/5')
                      : (dark ? 'text-zinc-400 hover:text-white bg-transparent' : 'text-[#636467] hover:text-[#1a1c1e] bg-transparent')
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
            <div className="mt-auto flex flex-col gap-2">
              <button
                onClick={() => { setIsMobileSidebarOpen(false); handleNewChat(); }}
                className={`flex items-center gap-3 py-3 px-3 rounded-xl text-left transition-all border-none cursor-pointer text-sm font-medium ${dark ? 'text-rose-500 bg-rose-500/10' : 'text-[#b0004a] bg-[#b0004a]/5'}`}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">add_comment</span>
                New Chat
              </button>
              <button
                onClick={() => { setIsMobileSidebarOpen(false); if (user) { setViewState('settings'); navigate('/settings'); } else navigate('/login'); }}
                className={`flex items-center gap-3 py-3 px-3 rounded-xl text-left transition-all border-none cursor-pointer text-sm font-medium ${dark ? 'text-zinc-400 bg-transparent' : 'text-[#636467] bg-transparent'}`}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">person</span>
                {user ? 'Settings' : 'Sign In'}
              </button>
            </div>
          </nav>
        </>
      )}

      {/* ═══ MOBILE FLOATING HAMBURGER — top left ═══ */}
      {isMobile && viewState === 'landing' && (
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="fixed z-50 w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer shadow-lg bg-[#1a1c1e] text-[#d81b60]"
          style={{ top: 16, left: 16 }}
          type="button"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>
      )}

      {/* ═══ MOBILE FLOATING BACK ARROW — top left in chat mode ═══ */}
      {isMobile && viewState === 'chat' && (
        <button
          onClick={handleBack}
          className="fixed z-50 w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer shadow-lg bg-[#1a1c1e] text-[#d81b60]"
          style={{ top: 16, left: 16 }}
          type="button"
          aria-label="Back"
        >
          <span className="material-symbols-outlined text-[22px]">arrow_back</span>
        </button>
      )}

      {/* Dark mode toggle */}
      <DarkModeToggle dark={dark} setDark={setDark} />

      {flyingLogo && (() => {
        const letters = [
          { ch: 's', color: '#1A1A18', weight: 700 },
          { ch: 'm', color: '#1A1A18', weight: 700 },
          { ch: 'b', color: '#1A1A18', weight: 700 },
          { ch: 'x', color: '#b0004a', weight: 800 },
          { ch: '.', color: '#1A1A18', weight: 700 },
          { ch: 'a', color: '#1A1A18', weight: 700 },
          { ch: 'i', color: '#1A1A18', weight: 700 },
        ];
        const toSidebar = flyingLogo.direction === 'to-sidebar';
        const heroSource = heroLogoRef.current;
        const sideTarget = sidebarLogoRef.current;
        const heroRect = heroSource?.getBoundingClientRect();
        const sideRect = sideTarget?.getBoundingClientRect();
        if (!heroRect || !sideRect) return null;

        // Letter positions at hero — spread across roughly where text sits in the logo
        const heroCenter = heroRect.left + heroRect.width / 2;
        const heroCY = heroRect.top + heroRect.height / 2;
        const heroSpread = 250;
        const heroLetterW = heroSpread / letters.length;
        const heroStartX = heroCenter - heroSpread / 2;

        // Letter positions at sidebar/header — converge to center of the target logo
        const sideCenter = sideRect.left + sideRect.width / 2;
        const sideCY = sideRect.top + sideRect.height / 2;
        const sideSpread = sideRect.width * 0.7;
        const sideLetterW = sideSpread / letters.length;
        const sideStartX = sideCenter - sideSpread / 2;

        // Scale: ratio of target text size to 48px source
        const sidebarScale = 0.25;

        const yJitter = [-80, 50, -110, 90, -60, 70, -40];
        const rotEnd = [15, -20, 25, -15, 10, -25, 12];
        const delays = [0, 0.03, 0.07, 0.11, 0.05, 0.09, 0.13];

        let completed = 0;
        return letters.map((l, i) => {
          const hx = heroStartX + i * heroLetterW + heroLetterW / 2;
          const sx = sideStartX + i * sideLetterW + sideLetterW / 2;

          const startX = toSidebar ? hx : sx;
          const endX = toSidebar ? sx : hx;
          const sideYShift = 8;
          const heroYShift = 20;
          const startY = toSidebar ? heroCY - heroYShift : sideCY - sideYShift;
          const endY = toSidebar ? sideCY - sideYShift : heroCY - heroYShift;
          const startScale = toSidebar ? 1 : sidebarScale;
          const endScale = toSidebar ? sidebarScale : 1;
          // Arc peaks at 30% of the journey, then swoops down to target
          const arcT = 0.3;
          const midX = startX + (endX - startX) * arcT;
          const midY = startY + (endY - startY) * arcT + yJitter[i];

          return (
            <motion.span
              key={`${flyingLogo.direction}-${i}`}
              initial={{
                left: startX,
                top: startY,
                scale: startScale,
                opacity: 1,
                rotate: 0,
              }}
              animate={{
                left: [startX, midX, endX],
                top: [startY, midY, endY],
                scale: [startScale, (startScale + endScale) * 0.6, endScale],
                rotate: [0, rotEnd[i], 0],
              }}
              transition={{
                duration: 0.6,
                delay: delays[i],
                times: [0, 0.15, 1],
                ease: 'linear',
                left: { duration: 0.6, delay: delays[i], times: [0, 0.15, 1], ease: [0, 0, 0.5, 1] },
                top: { duration: 0.6, delay: delays[i], times: [0, 0.15, 1], ease: [0, 0, 0.5, 1] },
                scale: { duration: 0.6, delay: delays[i], times: [0, 0.15, 1], ease: [0, 0, 0.5, 1] },
                rotate: { duration: 0.6, delay: delays[i], times: [0, 0.15, 1], ease: [0, 0, 0.5, 1] },
                opacity: { duration: 0.2, delay: delays[i] + 0.3, ease: 'easeOut' },
              }}
              onAnimationComplete={() => { completed++; if (completed >= letters.length) setFlyingLogo(null); }}
              style={{
                position: 'fixed',
                zIndex: 9999,
                pointerEvents: 'none',
                fontFamily: "'Sora', sans-serif",
                fontSize: 48,
                fontWeight: l.weight,
                color: l.color,
                lineHeight: 1,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {l.ch}
            </motion.span>
          );
        });
      })()}
    </div>
  );
}
