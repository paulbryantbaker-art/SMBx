import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useAnonymousChat, type AnonMessage } from '../../hooks/useAnonymousChat';
import { useAuthChat } from '../../hooks/useAuthChat';
import { useAppHeight } from '../../hooks/useAppHeight';
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
import WalletPanel from '../../components/chat/WalletPanel';
import DocumentLibrary from '../../components/chat/DocumentLibrary';
import AnalyticsView from '../../components/chat/AnalyticsView';
import NDAModal from '../../components/chat/NDAModal';
import SellBelow from '../../components/content/SellBelow';
import BuyBelow from '../../components/content/BuyBelow';
import RaiseBelow from '../../components/content/RaiseBelow';
import IntegrateBelow from '../../components/content/IntegrateBelow';
import HowItWorksBelow from '../../components/content/HowItWorksBelow';
import AdvisorsBelow from '../../components/content/AdvisorsBelow';
import PricingBelow from '../../components/content/PricingBelow';

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
export type ViewState = 'landing' | 'chat' | 'pipeline' | 'dataroom' | 'settings' | 'seller-dashboard' | 'buyer-pipeline' | 'wallet' | 'documents' | 'analytics';

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
    headline: '[PAUL TO WRITE]',
    terraWord: '',
    tagline: '',
    chips: [],
    placeholder: 'Tell Yulia about your deal...',
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
      <span style={{ color: '#C96B4F' }}>{terraWord}</span>
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
  if (path === '/wallet') return 'wallet';
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
  sell: '#C96B4F',
  buy: '#4E8FD4',
  raise: '#6B8F4E',
  pmi: '#8F6BD4',
};

/* ═══ COMPONENT ═══ */

export default function AppShell() {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();

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
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
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

    // On mobile, use the mobile header logo as the target; on desktop, use sidebar logo
    const targetRef = isMobile ? mobileHeaderLogoRef.current : sidebarLogoRef.current;
    const sourceRef = isMobile ? mobileHeroLogoRef.current : heroLogoRef.current;

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
  // Prepend Yulia's welcome message when chat has no messages yet
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

  // Auto-scroll on new messages
  useEffect(() => {
    if (viewState === 'chat') messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, viewState]);

  // Reset scroll to top when landing page renders or tab changes
  useEffect(() => {
    if (viewState === 'landing' && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [viewState, activeTab]);

  // Fetch wallet balance for sidebar badge
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('smbx_token');
    if (!token) return;
    fetch('/api/stripe/wallet', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setWalletBalance(data.balance_cents ?? 0); })
      .catch(() => {});
  }, [user]);

  // Send handler — morph from landing to chat
  const handleSend = useCallback((content: string) => {
    if (viewState === 'landing') {
      setMorphing(true);
      if (user) authChat.sendMessage(content);
      else anonChat.sendMessage(content, activeTab);
      setTimeout(() => {
        setViewState('chat');
        setMorphing(false);
        if (window.location.pathname !== '/chat') navigate('/chat');
      }, 300);
      return;
    }
    if (user) authChat.sendMessage(content);
    else anonChat.sendMessage(content, activeTab);
  }, [viewState, user, authChat, anonChat, navigate, activeTab]);

  // Chip click
  const handleChipClick = useCallback((text: string) => {
    dockRef.current?.clear();
    handleSend(text);
  }, [handleSend]);

  // Back to landing
  const handleBack = useCallback(() => {
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
    if (['pipeline', 'dataroom', 'settings', 'seller-dashboard', 'buyer-pipeline', 'wallet'].includes(viewState) && !user) navigate('/login');
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

  /* ═══ SIDEBAR JSX ═══ */

  const sidebarContent = (mobile: boolean) => (
    <aside
      className="flex flex-col h-full select-none"
      style={{ width: mobile ? 280 : 256, background: '#FAFAFA', borderRight: '1px solid rgba(0,0,0,0.06)' }}
    >
      {/* Logo — centered, hidden when center logo is visible on home landing */}
      <div className="pt-5 pb-2 flex items-center justify-center" style={{ opacity: (activeTab === 'home' && viewState === 'landing' && !heroFocused && !morphing) ? 0 : 1, transition: heroFocused ? 'opacity 0.3s ease-out 0.5s' : 'opacity 0.15s ease 0s' }}>
        <button
          ref={!mobile ? sidebarLogoRef as any : undefined}
          onClick={() => { handleTabClick('home'); if (mobile) setIsMobileSidebarOpen(false); }}
          className="bg-transparent border-none cursor-pointer p-0 leading-none"
          type="button"
        >
          <LogoImg height={32} />
        </button>
      </div>

      {/* + New Chat button — outline style */}
      <div className="px-4 pt-3 pb-3">
        <button
          onClick={() => {
            if (user) {
              authChat.newConversation();
              setViewState('chat');
              navigate('/chat');
            } else {
              handleTabClick('home');
            }
            if (mobile) setIsMobileSidebarOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2 text-[14px] px-4 py-2.5 cursor-pointer hover:opacity-90 transition-all"
          style={{ fontFamily: 'inherit', fontWeight: 500, background: '#0D0D0D', borderRadius: '10px', border: 'none', color: '#fff' }}
          type="button"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          New Chat
        </button>
      </div>

      {/* Primary nav — Chat, Data Room, Analytics, Settings */}
      <div className="px-3">
        <nav className="space-y-0.5">
          {([
            { id: 'chat' as const, label: 'Chat', viewId: 'chat' as ViewState, route: '/', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg> },
            { id: 'dataroom' as const, label: 'Data Room', viewId: 'documents' as ViewState, route: '/documents', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg> },
            { id: 'analytics' as const, label: 'Analytics', viewId: 'analytics' as ViewState, route: '/analytics', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> },
            { id: 'settings' as const, label: 'Settings', viewId: 'settings' as ViewState, route: '/settings', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg> },
          ]).map(item => {
            const isActive = item.id === 'chat'
              ? ((activeTab === 'home' && viewState === 'landing') || viewState === 'chat')
              : viewState === item.viewId;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'chat') { handleTabClick('home'); }
                  else if (user) { setViewState(item.viewId); navigate(item.route); }
                  else navigate('/login');
                  if (mobile) setIsMobileSidebarOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-4 py-2.5 cursor-pointer border-none transition-all ${!isActive ? 'nav-item-hover' : ''}`}
                style={{
                  fontFamily: 'inherit',
                  fontSize: '15px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#0D0D0D' : 'rgba(0,0,0,0.7)',
                  background: isActive ? 'rgba(0,0,0,0.04)' : 'transparent',
                  borderRadius: '10px',
                  border: 'none',
                }}
                type="button"
              >
                <span style={{ color: isActive ? '#0D0D0D' : 'rgba(0,0,0,0.5)' }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ─── Explore — journey page navigation ─── */}
      <div className="px-3 mt-5">
        <div className="px-4 mb-2" style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#C96B4F' }}>Explore</div>
        <nav className="space-y-0.5">
          {([
            { id: 'sell' as TabId, label: 'Sell a Business', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" /></svg> },
            { id: 'buy' as TabId, label: 'Buy a Business', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg> },
            { id: 'raise' as TabId, label: 'Raise Capital', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg> },
            { id: 'how-it-works' as TabId, label: 'How It Works', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg> },
            { id: 'advisors' as TabId, label: 'For Advisors', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg> },
            { id: 'pricing' as TabId, label: 'Pricing', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> },
          ]).map(item => {
            const isActive = activeTab === item.id && viewState === 'landing';
            return (
              <button
                key={item.id}
                onClick={() => { handleTabClick(item.id); if (mobile) setIsMobileSidebarOpen(false); }}
                className={`flex items-center gap-3 w-full px-4 py-2 cursor-pointer border-none transition-all ${!isActive ? 'nav-item-hover' : ''}`}
                style={{
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#0D0D0D' : 'rgba(0,0,0,0.7)',
                  background: isActive ? 'rgba(0,0,0,0.04)' : 'transparent',
                  borderRadius: '10px',
                  border: 'none',
                }}
                type="button"
              >
                <span style={{ color: isActive ? '#C96B4F' : 'rgba(0,0,0,0.4)' }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Cabinet — artifacts & analysis (logged-in only) */}
      {user && (
        <div className="px-3 mt-4">
          <div className="px-4 mb-2" style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#C96B4F' }}>Cabinet</div>
          <button
            onClick={() => {
              setViewState('documents');
              navigate('/documents');
              if (mobile) setIsMobileSidebarOpen(false);
            }}
            className="flex items-center gap-3 w-full px-4 py-2 cursor-pointer border-none transition-all nav-item-hover"
            style={{ fontFamily: 'inherit', fontSize: '14px', fontWeight: viewState === 'documents' ? 600 : 400, color: viewState === 'documents' ? '#0D0D0D' : 'rgba(0,0,0,0.7)', background: viewState === 'documents' ? 'rgba(0,0,0,0.04)' : 'transparent', borderRadius: '10px', border: 'none' }}
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
            Artifacts & Analysis
          </button>
        </div>
      )}

      {/* Conversations — Recent (grouped by deal when multi-deal) */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 mt-4">
        <div className="px-4 mb-2" style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#C96B4F' }}>Recent</div>
        {(() => {
          const convs = allConversations || [];
          const uniqueDeals = new Set(convs.filter(c => c.deal_id).map(c => c.deal_id));
          const isMultiDeal = uniqueDeals.size > 1;

          if (!isMultiDeal) {
            // Simple flat list
            return convs.map(c => (
              <button
                key={c.id}
                onClick={() => {
                  if (user) authChat.selectConversation(c.id);
                  else anonChat.selectConversation(c.id);
                  setViewState('chat');
                  navigate(`/chat/${c.id}`);
                  setIsMobileSidebarOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-[14px] cursor-pointer transition-all conv-item-hover"
                style={{
                  fontFamily: 'inherit',
                  fontWeight: c.id === activeConvId && viewState === 'chat' ? 600 : 400,
                  color: c.id === activeConvId && viewState === 'chat' ? '#0D0D0D' : 'rgba(0,0,0,0.65)',
                  background: c.id === activeConvId && viewState === 'chat' ? 'rgba(0,0,0,0.04)' : 'transparent',
                  borderRadius: '10px', border: 'none',
                }}
                type="button"
              >
                <span className="truncate flex-1 min-w-0 text-left">{c.title}</span>
              </button>
            ));
          }

          // Group by deal
          const grouped: Record<string, typeof convs> = {};
          const ungrouped: typeof convs = [];
          for (const c of convs) {
            const key = c.deal_id ? `${c.deal_id}` : null;
            if (key) {
              if (!grouped[key]) grouped[key] = [];
              grouped[key].push(c);
            } else {
              ungrouped.push(c);
            }
          }

          return (
            <>
              {Object.entries(grouped).map(([dealId, dealConvs]) => {
                const sample = dealConvs[0];
                const dealLabel = sample.business_name || sample.journey?.toUpperCase() || `Deal ${dealId}`;
                return (
                  <div key={dealId} style={{ marginBottom: 8 }}>
                    <div className="px-4 py-1" style={{ fontSize: 11, fontWeight: 600, color: 'rgba(0,0,0,0.45)' }}>
                      {dealLabel}
                    </div>
                    {dealConvs.map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          if (user) authChat.selectConversation(c.id);
                          else anonChat.selectConversation(c.id);
                          setViewState('chat');
                          navigate(`/chat/${c.id}`);
                          setIsMobileSidebarOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-1.5 text-[13px] cursor-pointer transition-all conv-item-hover"
                        style={{
                          fontFamily: 'inherit',
                          fontWeight: c.id === activeConvId && viewState === 'chat' ? 600 : 400,
                          color: c.id === activeConvId && viewState === 'chat' ? '#0D0D0D' : 'rgba(0,0,0,0.6)',
                          background: c.id === activeConvId && viewState === 'chat' ? 'rgba(0,0,0,0.04)' : 'transparent',
                          borderRadius: '10px', border: 'none', paddingLeft: 24,
                        }}
                        type="button"
                      >
                        <span className="truncate flex-1 min-w-0 text-left">{c.title}</span>
                      </button>
                    ))}
                  </div>
                );
              })}
              {ungrouped.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    if (user) authChat.selectConversation(c.id);
                    else anonChat.selectConversation(c.id);
                    setViewState('chat');
                    navigate(`/chat/${c.id}`);
                    setIsMobileSidebarOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-[14px] cursor-pointer transition-all conv-item-hover"
                  style={{
                    fontFamily: 'inherit',
                    fontWeight: c.id === activeConvId && viewState === 'chat' ? 600 : 400,
                    color: c.id === activeConvId && viewState === 'chat' ? '#0D0D0D' : 'rgba(0,0,0,0.65)',
                    background: c.id === activeConvId && viewState === 'chat' ? 'rgba(0,0,0,0.04)' : 'transparent',
                    borderRadius: '10px', border: 'none',
                  }}
                  type="button"
                >
                  <span className="truncate flex-1 min-w-0 text-left">{c.title}</span>
                </button>
              ))}
            </>
          );
        })()}
      </div>

      {/* Yulia status + User Profile — bottom of sidebar */}
      <div className="mt-auto px-5 pb-4 pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        {/* Yulia is online */}
        <div className="flex items-center gap-2 mb-3 px-1">
          <span className="w-[7px] h-[7px] rounded-full shrink-0 status-pulse" style={{ background: '#4CAF50' }} />
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(0,0,0,0.5)' }}>Yulia is online</span>
        </div>

        {/* User profile */}
        <button
          onClick={() => {
            if (user) { setViewState('settings'); navigate('/settings'); }
            else navigate('/login');
            setIsMobileSidebarOpen(false);
          }}
          className="flex items-center gap-3 w-full bg-transparent border-none cursor-pointer p-0 text-left"
          type="button"
        >
          <div
            className="flex items-center justify-center rounded-full text-white text-[12px] font-bold"
            style={{ width: 32, height: 32, background: '#0D0D0D', flexShrink: 0 }}
          >
            {user ? (user.display_name || user.email || '?').charAt(0).toUpperCase() : 'G'}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span style={{ fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, color: '#0D0D0D' }} className="truncate">
              {user ? (user.display_name || user.email || 'Account') : 'Sign in'}
            </span>
            {user && walletBalance !== null && (
              <span style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(0,0,0,0.4)' }}>
                ${(walletBalance / 100).toFixed(2)} balance
              </span>
            )}
          </div>
        </button>
      </div>
    </aside>
  );

  /* ═══ RENDER ═══ */

  return (
    <div
      id="app-root"
      className="flex bg-white font-sans"
      style={{
        height: 'var(--app-height, 100vh)',
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        ...(appOffset ? { transform: `translateY(${appOffset}px)` } : {}),
      }}
    >
      {/* Desktop sidebar — collapsible */}
      {!isMobile && (
        <div style={{ position: 'relative', width: sidebarCollapsed ? 0 : 256, overflow: 'hidden', transition: 'width 0.25s ease', flexShrink: 0 }}>
          {sidebarContent(false)}
          {/* Collapse/expand toggle */}
          <button
            onClick={() => setSidebarCollapsed(c => !c)}
            className="bg-transparent border-none cursor-pointer hover:opacity-80"
            style={{
              position: 'absolute', top: 20, right: 8,
              width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 6, color: 'rgba(0,0,0,0.35)',
            }}
            type="button"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {sidebarCollapsed
                ? <><line x1="3" y1="12" x2="21" y2="12" /><polyline points="15 6 21 12 15 18" /></>
                : <><line x1="21" y1="12" x2="3" y2="12" /><polyline points="9 18 3 12 9 6" /></>
              }
            </svg>
          </button>
        </div>
      )}
      {/* Sidebar expand button when collapsed */}
      {!isMobile && sidebarCollapsed && (
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="bg-transparent border-none cursor-pointer hover:opacity-80"
          style={{
            position: 'absolute', top: 20, left: 12, zIndex: 20,
            width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 8, color: 'rgba(0,0,0,0.4)', background: 'rgba(0,0,0,0.04)',
          }}
          type="button"
          title="Expand sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      )}

      {/* Mobile sidebar overlay */}
      {isMobile && isMobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 animate-[slideInLeft_0.25s_ease]">
            {sidebarContent(true)}
          </div>
        </>
      )}

      {/* Main canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-full bg-white">
        {/* Offline banner */}
        {isOffline && (
          <div className="shrink-0 bg-yellow-50 border-b border-yellow-200 px-4 py-2 flex items-center justify-center gap-2 z-30">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-xs font-semibold text-yellow-800">You appear to be offline. Messages will send when you reconnect.</span>
          </div>
        )}
        {/* Header — 56px */}
        <header
          className="flex-shrink-0 flex items-center justify-between h-14 px-6 z-20 bg-white"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center gap-3">
            {viewState === 'chat' ? (
              /* ── Chat mode: back arrow + "Chat with Yulia" ── */
              <div className="flex items-center gap-3" style={{ animation: 'fadeIn 0.3s ease' }}>
                <button
                  onClick={handleBack}
                  className="w-10 h-10 flex items-center justify-center bg-transparent border-none cursor-pointer"
                  style={{ borderRadius: 12, color: 'rgba(0,0,0,0.45)' }}
                  type="button"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
                  </svg>
                </button>
                <LogoImg height={20} />
              </div>
            ) : (
              /* ── Landing mode: hamburger + logo / page label ── */
              <>
                {isMobile && (
                  <button
                    onClick={() => setIsMobileSidebarOpen(true)}
                    className="w-10 h-10 flex items-center justify-center bg-transparent border-none cursor-pointer"
                    style={{ borderRadius: 12, color: 'rgba(0,0,0,0.7)' }}
                    type="button"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                  </button>
                )}
                {isMobile ? (
                  <button
                    ref={mobileHeaderLogoRef}
                    onClick={() => handleTabClick('home')}
                    className="bg-transparent border-none cursor-pointer p-0 leading-none"
                    style={{ opacity: (activeTab === 'home' && viewState === 'landing' && !heroFocused && !morphing) ? 0 : 1, transition: 'opacity 0.3s ease' }}
                    type="button"
                  >
                    <LogoImg height={22} />
                  </button>
                ) : (
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(0,0,0,0.35)' }}>
                    {viewState === 'documents' ? 'Documents' : viewState === 'analytics' ? 'Analytics' : viewState === 'settings' ? 'Settings' : viewState === 'pipeline' ? 'Pipeline' : viewState === 'dataroom' ? 'Data Room' : viewState === 'wallet' ? 'Wallet' : activeTab === 'home' ? 'Chat' : activeTab === 'sell' ? 'Sell' : activeTab === 'buy' ? 'Buy' : activeTab === 'how-it-works' ? 'How It Works' : activeTab === 'advisors' ? 'Advisors' : 'Pricing'}
                  </span>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!user && activeTab !== 'home' && viewState === 'landing' && (
              <button
                onClick={() => navigate('/login')}
                className="text-white border-none cursor-pointer hover:opacity-90 transition-all"
                style={{ fontFamily: 'inherit', fontSize: '13px', fontWeight: 600, background: '#0D0D0D', borderRadius: '100px', padding: '9px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}
                type="button"
              >
                Start chatting
              </button>
            )}
            {!user && (activeTab === 'home' || viewState === 'chat') && (
              <button
                onClick={() => navigate('/login')}
                className="bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity"
                style={{ fontFamily: 'inherit', fontSize: '13px', fontWeight: 600, color: 'rgba(0,0,0,0.55)' }}
                type="button"
              >
                Sign in
              </button>
            )}
            {user && (
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(0,0,0,0.45)' }}>{user.display_name || user.email}</span>
            )}
          </div>
        </header>

        {/* Main row: chat + canvas split */}
        <div className="flex-1 flex min-h-0 bg-white">
        {/* Chat column — resizable on desktop in chat mode, flex on landing/other */}
        <div
          className="flex flex-col min-w-0 bg-white"
          style={!isMobile && viewState === 'chat' ? { width: chatWidth, flexShrink: 0 } : { flex: 1 }}
        >
        {/* Scroll area — bg-white required: -webkit-overflow-scrolling creates a separate compositing layer on mobile Safari */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto min-h-0 bg-white"
          style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' } as any}
        >
          {/* ════ LANDING MODE ════ */}
          {viewState === 'landing' && (
            <div key={activeTab} style={{ animation: morphing ? 'morphOut 0.3s ease forwards' : 'slideUp 0.35s ease', pointerEvents: morphing ? 'none' as const : undefined, ...(activeTab === 'home' ? { overflow: 'hidden', display: 'flex', flexDirection: 'column' as const, height: '100%' } : {}) }}>
              {activeTab === 'home' ? (
              <>
                {/* ═══ HOME PAGE — Paper Design: centered wordmark + hero chat bar + chips ═══ */}

                {/* MOBILE HOME — logo + chat bar, tap to fly-and-chat */}
                <div className="flex flex-col h-full md:hidden">
                  <div className="flex-1 flex flex-col items-center justify-center px-5" style={{ marginTop: '-40px' }}>
                    <motion.div
                      ref={mobileHeroLogoRef}
                      style={{ marginBottom: 32, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                      animate={{ opacity: heroFocused ? 0 : 1, scale: heroFocused ? 0.95 : 1 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                    >
                      <LogoImg height={80} />
                    </motion.div>
                    <motion.div
                      className="w-full"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <ChatDock
                        ref={dockRef}
                        onSend={handleSend}
                        variant="hero"
                        rows={1}
                        placeholder="What's on your mind?"
                        disabled={sending}
                        typewriterHints={TYPEWRITER_HINTS}
                        typewriterPrefix={TYPEWRITER_PREFIX}
                        onInputFocus={() => {}}
                        onInputBlur={() => {}}
                      />
                    </motion.div>
                  </div>
                </div>

                {/* DESKTOP HOME — Grok-style: logo + chat bar, centered */}
                <div className="hidden md:flex flex-col h-full items-center justify-center">
                  <div className="flex flex-col items-center" style={{ marginTop: '-60px', width: '100%', maxWidth: 780 }}>
                    <div style={{ position: 'relative', marginBottom: 36, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200, width: '100%', maxWidth: 720 }}>
                      {/* Animated Logo — flies to sidebar on focus */}
                      <motion.div
                        ref={heroLogoRef}
                        animate={{ opacity: heroFocused ? 0 : 1, scale: heroFocused ? 0.95 : 1 }}
                        transition={{ duration: heroFocused ? 0.15 : 0.3, delay: heroFocused ? 0 : 0.5, ease: 'easeOut' }}
                        style={{ position: 'absolute' }}
                      >
                        <AnimatedLogo height={160} stopped={heroFocused} />
                      </motion.div>
                      {/* Hero text — fades in */}
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: heroFocused ? 1 : 0, y: heroFocused ? 0 : 12 }}
                        transition={{ duration: heroFocused ? 0.5 : 0.25, delay: heroFocused ? 0.2 : 0, ease: [0.4, 0, 0.2, 1] }}
                        style={{ textAlign: 'center', width: '100%', pointerEvents: heroFocused ? 'auto' : 'none' }}
                      >
                        <span
                          className="text-5xl"
                          style={{ display: 'block', fontFamily: "'General Sans', 'Inter', system-ui, sans-serif", fontWeight: 700, color: '#000', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 12 }}
                        >
                          Chat with your deals!
                        </span>
                        <span style={{ display: 'block', fontFamily: "'General Sans', 'Inter', system-ui, sans-serif", fontSize: 15, lineHeight: 1.65, color: 'rgba(0,0,0,0.55)', letterSpacing: '-0.01em' }}>
                          Yulia is a chat agent for all things M&A and she can guide you through the entire process of selling or buying a business, all by just chatting with your deals. No deal is too small or too complex.<br /><span style={{ fontWeight: 600 }}>Start now completely free!</span>
                        </span>
                      </motion.div>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                      style={{ width: '100%', maxWidth: 640 }}
                    >
                      <ChatDock
                        ref={dockRef}
                        onSend={handleSend}
                        variant="hero"
                        rows={1}
                        placeholder="What's on your mind?"
                        disabled={sending}
                        typewriterHints={TYPEWRITER_HINTS}
                        typewriterPrefix={TYPEWRITER_PREFIX}
                        onInputFocus={() => setHeroFocused(true)}
                        onInputBlur={(hasText) => { if (!hasText) setHeroFocused(false); }}
                      />
                    </motion.div>
                  </div>
                </div>
              </>
              ) : activeTab === 'sell' ? (
              <>
              {/* ═══ SELL PAGE — Full custom layout ═══ */}
              <SellBelow onChipClick={handleChipClick} />
              </>
              ) : activeTab === 'buy' ? (
              <>
              {/* ═══ BUY PAGE — Full custom layout ═══ */}
              <BuyBelow onChipClick={handleChipClick} />
              </>
              ) : activeTab === 'raise' ? (
              <>
              {/* ═══ RAISE PAGE — Full custom layout ═══ */}
              <RaiseBelow onChipClick={handleChipClick} />
              </>
              ) : activeTab === 'how-it-works' ? (
              <>
              {/* ═══ HOW IT WORKS PAGE — Full custom layout ═══ */}
              <HowItWorksBelow onChipClick={handleChipClick} />
              </>
              ) : activeTab === 'integrate' ? (
              <>
              {/* ═══ INTEGRATE PAGE — Full custom layout ═══ */}
              <IntegrateBelow onChipClick={handleChipClick} />
              </>
              ) : activeTab === 'advisors' ? (
              <>
              {/* ═══ ADVISORS PAGE — Full custom layout ═══ */}
              <AdvisorsBelow onChipClick={handleChipClick} />
              </>
              ) : activeTab === 'pricing' ? (
              <>
              {/* ═══ PRICING PAGE — Full custom layout ═══ */}
              <PricingBelow onChipClick={handleChipClick} />
              </>
              ) : null}
            </div>
          )}

          {/* ════ CHAT MODE ════ */}
          {viewState === 'chat' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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
                    onTopUp={() => {
                      const walletBtn = document.querySelector('[data-wallet-toggle]') as HTMLButtonElement;
                      if (walletBtn) walletBtn.click();
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

          {viewState === 'wallet' && user && (
            <div className="max-w-3xl mx-auto px-4 py-6">
              <WalletPanel />
            </div>
          )}

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
                <p style={{ fontFamily: "'General Sans', 'Inter', system-ui, sans-serif", fontSize: 14, fontWeight: 500, color: '#0D0D0D', margin: 0 }}>
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

      {/* ═══ FLYING LETTERS — each letter flies whimsically between center and sidebar ═══ */}
      {flyingLogo && (() => {
        const letters = [
          { ch: 's', color: '#1A1A18', weight: 700 },
          { ch: 'm', color: '#1A1A18', weight: 700 },
          { ch: 'b', color: '#1A1A18', weight: 700 },
          { ch: 'x', color: '#C96B4F', weight: 800 },
          { ch: '.', color: '#1A1A18', weight: 700 },
          { ch: 'a', color: '#1A1A18', weight: 700 },
          { ch: 'i', color: '#1A1A18', weight: 700 },
        ];
        const toSidebar = flyingLogo.direction === 'to-sidebar';
        const heroSource = isMobile ? mobileHeroLogoRef.current : heroLogoRef.current;
        const sideTarget = isMobile ? mobileHeaderLogoRef.current : sidebarLogoRef.current;
        const heroRect = heroSource?.getBoundingClientRect();
        const sideRect = sideTarget?.getBoundingClientRect();
        if (!heroRect || !sideRect) return null;

        // Letter positions at hero — spread across roughly where text sits in the video
        const heroCenter = heroRect.left + heroRect.width / 2;
        const heroCY = heroRect.top + heroRect.height / 2;
        // 48px font, 7 letters ≈ 250px wide at hero scale
        const heroSpread = 250;
        const heroLetterW = heroSpread / letters.length;
        const heroStartX = heroCenter - heroSpread / 2;

        // Letter positions at sidebar — converge to center of the sidebar logo
        const sideCenter = sideRect.left + sideRect.width / 2;
        const sideCY = sideRect.top + sideRect.height / 2;
        // At sidebar scale (0.25), letters are tiny — spread just enough to not overlap
        const sideSpread = sideRect.width * 0.7;
        const sideLetterW = sideSpread / letters.length;
        const sideStartX = sideCenter - sideSpread / 2;

        // Scale ratio: sidebar logo ~32px, hero font 48px
        const sidebarScale = 0.25;

        const yJitter = [-80, 50, -110, 90, -60, 70, -40]; // random vertical arcs mid-flight
        const rotEnd = [15, -20, 25, -15, 10, -25, 12];
        const delays = [0, 0.03, 0.07, 0.11, 0.05, 0.09, 0.13];

        let completed = 0;
        return letters.map((l, i) => {
          const hx = heroStartX + i * heroLetterW + heroLetterW / 2;
          const sx = sideStartX + i * sideLetterW + sideLetterW / 2;

          const startX = toSidebar ? hx : sx;
          const endX = toSidebar ? sx : hx;
          // Y corrections: sidebar logo is small/tight, hero video has padding in the frame
          const sideYShift = 8;   // small nudge for sidebar
          const heroYShift = 20;  // bigger nudge — text sits inside a padded video frame
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
                fontFamily: "'General Sans', 'Inter', system-ui, sans-serif",
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
