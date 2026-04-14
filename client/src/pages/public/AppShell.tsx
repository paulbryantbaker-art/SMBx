import { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import Markdown from 'react-markdown';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { trackEvent } from '../../lib/analytics';
import { useAuth, authHeaders } from '../../hooks/useAuth';
import { useAnonymousChat, type AnonMessage } from '../../hooks/useAnonymousChat';
import { useAuthChat } from '../../hooks/useAuthChat';
import { useAppHeight } from '../../hooks/useAppHeight';
import { useDarkMode } from '../../components/shared/DarkModeToggle';
import ChatDock, { type ChatDockHandle } from '../../components/shared/ChatDock';
import ChatMessages from '../../components/shell/ChatMessages';
// Dot grid now lives on body in index.css — no component needed
// Authenticated tool components
import PipelinePanel from '../../components/chat/PipelinePanel';
import DataRoom from '../../components/chat/DataRoom';
import SettingsPanel from '../../components/chat/SettingsPanel';
import GateProgress from '../../components/chat/GateProgress';
import { ChapterStrip } from '../../components/shared/ChapterStrip';
import PaywallCard from '../../components/chat/PaywallCard';
import Canvas from '../../components/chat/Canvas';
import InlineSignupCard from '../../components/chat/InlineSignupCard';
import SellerDashboard from '../../components/chat/SellerDashboard';
import BuyerPipeline from '../../components/chat/BuyerPipeline';
// Subscription model — no wallet, no per-deal fees
import DocumentLibrary from '../../components/chat/DocumentLibrary';
import AnalyticsView from '../../components/chat/AnalyticsView';
import NDAModal from '../../components/chat/NDAModal';
import SourcingPanel from '../../components/chat/SourcingPanel';
import IntelPanel from '../../components/chat/IntelPanel';
import DealMessagesPanel from '../../components/documents/DealMessagesPanel';
import CanvasToolbar, { type ToolbarAction } from '../../components/canvas/CanvasToolbar';
import FloatingTabBar from '../../components/canvas/FloatingTabBar';
import { ModelRenderer } from '../../components/models';
const SellBelow = lazy(() => import('../../components/content/SellBelow'));
const BuyBelow = lazy(() => import('../../components/content/BuyBelow'));
const RaiseBelow = lazy(() => import('../../components/content/RaiseBelow'));
const IntegrateBelow = lazy(() => import('../../components/content/IntegrateBelow'));
const HowItWorksBelow = lazy(() => import('../../components/content/HowItWorksBelow'));
const AdvisorsBelow = lazy(() => import('../../components/content/AdvisorsBelow'));
const PricingBelow = lazy(() => import('../../components/content/PricingBelow'));

// Mobile rebuild — Claude+ pattern
import { MobileSidebar, type LearnDest, type WorkspaceTool } from '../../components/mobile/MobileSidebar';
import { LearnDrawer } from '../../components/mobile/LearnDrawer';
import { StarterChips } from '../../components/mobile/StarterChips';
import { MobileSellPage } from '../../components/mobile/MobileSellPage';
import { MobileJourneySheet } from '../../components/mobile/MobileJourneySheet';
import { MobileWorkspaceSheet } from '../../components/mobile/MobileWorkspaceSheet';
import { isStandalone } from '../../lib/pwa';
import { NextActionsCards } from '../../components/mobile/NextActionsCards';
import { DealStack, filterRealDeals } from '../../components/mobile/DealStack';
import { ArtifactSheet } from '../../components/mobile/ArtifactSheet';
import { AccountSheet } from '../../components/mobile/AccountSheet';
import { SignInSheet } from '../../components/mobile/SignInSheet';
import { DealActionsSheet } from '../../components/mobile/DealActionsSheet';
import { ToastHost } from '../../components/mobile/ToastHost';
import { HelpSheet } from '../../components/mobile/HelpSheet';
import { DealContextChips } from '../../components/mobile/DealContextChips';
import { MobileBuyPage } from '../../components/mobile/MobileBuyPage';
import { MobileRaisePage } from '../../components/mobile/MobileRaisePage';
import { MobileIntegratePage } from '../../components/mobile/MobileIntegratePage';
import { MobileAdvisorsPage } from '../../components/mobile/MobileAdvisorsPage';
import { MobileHowItWorksPage } from '../../components/mobile/MobileHowItWorksPage';
import { MobilePricingPage } from '../../components/mobile/MobilePricingPage';

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

/* ═══ DYNAMIC GREETING (time-of-day) ═══ */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 3) return 'Hi there, having a good night?';
  if (hour < 12) return 'Hi there, having a good morning?';
  if (hour < 17) return 'Hi there, having a good afternoon?';
  if (hour < 20) return 'Hi there, having a good evening?';
  return 'Hi there, having a good night?';
}

/* ═══ LOGO — Fancy combo (X + smbx.ai text) for hero placement ═══ */
function LogoImg({ height = 28, style, className, dark }: { height?: number; style?: React.CSSProperties; className?: string; dark?: boolean }) {
  return (
    <img
      src={dark ? '/G3D.png' : '/G3L.png'}
      alt="smbx.ai"
      draggable={false}
      className={className}
      style={{ height, objectFit: 'contain', display: 'inline-block', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.06))', ...style }}
      aria-label="smbx.ai"
    />
  );
}

/* ═══ LOGO HERO — sbs (side-by-side X + smbx.ai) for home page ═══ */
function LogoHero({ height = 120, className, dark }: { height?: number; className?: string; dark?: boolean }) {
  return (
    <img
      src={dark ? '/G3D.png' : '/G3L.png'}
      alt="smbx.ai"
      className={className}
      style={{
        height,
        objectFit: 'contain',
        display: 'block',
        filter: dark
          ? 'drop-shadow(0 2px 12px rgba(0,0,0,0.5))'
          : 'drop-shadow(0 2px 8px rgba(0,0,0,0.08))',
      }}
    />
  );
}

/* ═══ LOGO ICON — just the X for sidebar/compact spaces ═══ */
function LogoIcon({ height = 28, className, style, dark }: { height?: number; className?: string; style?: React.CSSProperties; dark?: boolean }) {
  return (
    <img
      src={dark ? '/X-white.png' : '/X.png'}
      alt="smbx.ai"
      draggable={false}
      className={className}
      style={{ height, width: height, objectFit: 'contain', display: 'inline-block', ...style }}
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

/* ═══ HOME HERO TOOLS — opens from + button, mirrors ChatDock pattern ═══ */
interface HomeToolItem {
  label: string;
  desc: string;
  fill: string;
  group: 'journey' | 'tool';
  icon: JSX.Element;
}
const HOME_TOOLS: HomeToolItem[] = [
  { group: 'journey', label: 'Sell my business', desc: 'Valuation, packaging, buyer matching, and closing', fill: 'I want to sell my business — ',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
  { group: 'journey', label: 'Buy a business', desc: 'Thesis, sourcing, diligence, and deal structuring', fill: 'I want to buy a business — ',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> },
  { group: 'journey', label: 'Raise capital', desc: 'Model dilution, find the right structure, build materials', fill: 'I need to raise capital — ',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
  { group: 'journey', label: 'Just closed — what now?', desc: '180-day integration plan, value creation roadmap', fill: 'I just closed an acquisition — ',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg> },
  { group: 'tool', label: 'Business valuation', desc: 'Multi-methodology estimate with defensible range', fill: 'I need a business valuation — I own a ',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-5"/></svg> },
  { group: 'tool', label: 'SBA loan check', desc: 'Eligibility, DSCR analysis, and equity injection modeling', fill: "Can this deal get SBA financing? I'm looking at a ",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { group: 'tool', label: 'Search for a business', desc: 'Define criteria and evaluate opportunities', fill: "Help me find a business — I'm looking for ",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
  { group: 'tool', label: 'Upload financials', desc: 'P&L, tax return, or balance sheet — continue in chat', fill: 'I want to upload my financials for analysis',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 12 15 15"/></svg> },
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
      <span style={{ color: '#D44A78' }}>{terraWord}</span>
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
  sell: '#D44A78', // brand pink — unchanged
  buy: '#3E8E8E',  // muted teal — warmer counterpoint to pink than tech-blue
  raise: '#C99A3E', // warm ochre — reads as capital / gold
  pmi: '#8F4A7A',  // plum — warmer purple, rhymes with the brand pink
};

/* ═══ COMPONENT ═══ */

export default function AppShell() {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const [dark, setDark] = useDarkMode();

  // Core state
  const [viewState, setViewState] = useState<ViewState>(() => pathToViewState(location));
  const isChat = viewState === 'chat';
  const { appOffset } = useAppHeight(isChat);   // Only constrain viewport in chat mode
  const [activeTab, setActiveTab] = useState<TabId>(() => pathToTab(location));

  // Toggle chat-mode class on <html> — landing pages use natural body scroll,
  // chat mode uses constrained viewport for keyboard handling. The CSS rules keyed
  // on `html.chat-mode` are gated to desktop only in index.css — on mobile we rely
  // on the portaled pill + visualViewport-driven --kb-inset-bottom to handle keyboard.
  useEffect(() => {
    const root = document.documentElement;
    if (isChat) {
      root.classList.add('chat-mode');
    } else {
      root.classList.remove('chat-mode');
    }
    return () => root.classList.remove('chat-mode');
  }, [isChat]);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileCanvasDrawerOpen, setIsMobileCanvasDrawerOpen] = useState(false);
  // Mobile rebuild state — LearnDrawer + journey sheets + workspace tool sheets
  const [learnDrawerOpen, setLearnDrawerOpen] = useState(false);
  const [mobileJourneyOpen, setMobileJourneyOpen] = useState<LearnDest | null>(null);
  const [mobileWorkspaceOpen, setMobileWorkspaceOpen] = useState<WorkspaceTool | null>(null);
  // PWA standalone detection — when true, strip all marketing/journey content
  const isPWA = isStandalone();
  // Mobile canvas overlay visibility — separate from canvasTabs.length so tabs persist
  // when user navigates back to chat
  const [mobileCanvasVisible, setMobileCanvasVisible] = useState(false);
  const [viewingDeliverable, setViewingDeliverable] = useState<number | null>(null);
  const [canvasMarkdown, setCanvasMarkdown] = useState<{ content: string; title: string } | null>(null);

  // ─── Tabbed Canvas System ───────────────────────────────────
  interface CanvasTab {
    id: string;
    type: string;
    label: string;
    closable: boolean;
    props?: Record<string, any>;
  }
  const [canvasTabs, setCanvasTabs] = useState<CanvasTab[]>([]);
  const [activeCanvasTabId, setActiveCanvasTabId] = useState<string | null>(null);
  const activeCanvasTab = canvasTabs.find(t => t.id === activeCanvasTabId) || null;
  // Auto-hide mobile canvas overlay when all tabs are closed
  useEffect(() => {
    if (canvasTabs.length === 0) setMobileCanvasVisible(false);
  }, [canvasTabs.length]);

  // Conversation id ref — written by an effect later, read by tab callbacks
  const conversationIdRef = useRef<number | null>(null);
  // Canvas card ref — used by floating tab bar for hover proximity detection
  const canvasCardRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<typeof user>(user);
  useEffect(() => { userRef.current = user; }, [user]);

  // Persist a tab to the server (fire-and-forget, no-op if not signed in)
  const persistTab = useCallback(async (tab: CanvasTab, position: number, isActive: boolean) => {
    const convId = conversationIdRef.current;
    if (!convId || !userRef.current) return;
    try {
      await fetch(`/api/conversations/${convId}/canvas-tabs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ tabId: tab.id, type: tab.type, label: tab.label, props: tab.props || {}, position, isActive }),
      });
    } catch { /* non-critical */ }
  }, []);

  const persistTabClose = useCallback(async (tabId: string) => {
    const convId = conversationIdRef.current;
    if (!convId || !userRef.current) return;
    try {
      await fetch(`/api/conversations/${convId}/canvas-tabs/${encodeURIComponent(tabId)}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
    } catch { /* non-critical */ }
  }, []);

  const persistActiveTab = useCallback(async (tabId: string | null) => {
    const convId = conversationIdRef.current;
    if (!convId || !userRef.current) return;
    try {
      await fetch(`/api/conversations/${convId}/canvas-tabs/active`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ tabId }),
      });
    } catch { /* non-critical */ }
  }, []);

  const openCanvasTab = useCallback((type: string, label: string, props?: Record<string, any>) => {
    trackEvent('tab_opened', { tabType: type, label });
    let newTab: CanvasTab | null = null;
    let newId: string;

    // Deliverables get unique tabs
    if (type === 'deliverable' && props?.deliverableId) {
      newId = `deliverable-${props.deliverableId}`;
      setCanvasTabs(prev => {
        if (prev.find(t => t.id === newId)) { setActiveCanvasTabId(newId); return prev; }
        newTab = { id: newId, type, label: props.label || label, closable: true, props };
        const next = [...prev, newTab];
        persistTab(newTab, next.length - 1, true);
        return next;
      });
      setActiveCanvasTabId(newId);
    } else if (type === 'markdown' && props?.content) {
      newId = `md-${Date.now()}`;
      newTab = { id: newId, type, label, closable: true, props };
      setCanvasTabs(prev => {
        const next = [...prev, newTab!];
        persistTab(newTab!, next.length - 1, true);
        return next;
      });
      setActiveCanvasTabId(newId);
    } else {
      // Panel types reuse existing tab
      newId = type;
      setCanvasTabs(prev => {
        if (prev.find(t => t.id === newId)) { setActiveCanvasTabId(newId); return prev; }
        newTab = { id: newId, type, label, closable: true };
        const next = [...prev, newTab];
        persistTab(newTab, next.length - 1, true);
        return next;
      });
      setActiveCanvasTabId(newId);
    }

    // If we're in landing mode, switch to chat so the canvas panel appears
    if (viewState === 'landing') {
      setViewState('chat');
      navigate('/chat');
    }
    // On mobile, surface the canvas overlay when a tab is opened
    setMobileCanvasVisible(true);
  }, [viewState, navigate, persistTab]);

  const closeCanvasTab = useCallback((tabId: string) => {
    setCanvasTabs(prev => {
      const idx = prev.findIndex(t => t.id === tabId);
      const next = prev.filter(t => t.id !== tabId);
      if (activeCanvasTabId === tabId) {
        if (next.length === 0) {
          setActiveCanvasTabId(null);
        } else {
          setActiveCanvasTabId(next[Math.min(idx, next.length - 1)].id);
        }
      }
      return next;
    });
    persistTabClose(tabId);
  }, [activeCanvasTabId, persistTabClose]);
  const [morphing, setMorphing] = useState(false);
  const [heroFocused, setHeroFocused] = useState(false); // tracks when hero input is focused — controls logo position
  const [chatWidth, setChatWidth] = useState(520); // resizable chat column width
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop sidebar collapse
  const [ndaRequired, setNdaRequired] = useState<{ dealId: number; dealName?: string } | null>(null);
  // Subscription model handles pricing
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Home hero tool popup (+ button menu with journey shortcuts + tools)
  // Declared AFTER isMobile because fillHomeInput depends on it (TDZ safety)
  const [homeToolsOpen, setHomeToolsOpen] = useState(false);
  const homeInputRef = useRef<HTMLInputElement>(null);
  const homeInputMobileRef = useRef<HTMLInputElement>(null);
  const homeToolsRef = useRef<HTMLDivElement>(null);
  const homePlusRef = useRef<HTMLButtonElement>(null);
  const homePlusMobileRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!homeToolsOpen) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (homeToolsRef.current?.contains(t)) return;
      if (homePlusRef.current?.contains(t)) return;
      if (homePlusMobileRef.current?.contains(t)) return;
      setHomeToolsOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [homeToolsOpen]);
  const fillHomeInput = useCallback((text: string) => {
    const ref = isMobile ? homeInputMobileRef : homeInputRef;
    if (ref.current) {
      ref.current.value = text;
      ref.current.focus();
    }
    setHomeToolsOpen(false);
  }, [isMobile]);
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
  const messages: AnonMessage[] = rawMessages as AnonMessage[];
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
    const onPopState = (e: PopStateEvent) => {
      // If an artifact/canvas is open, swipe-back closes it instead of navigating
      if (canvasMarkdown || viewingDeliverable !== null) {
        setCanvasMarkdown(null);
        setViewingDeliverable(null);
        return;
      }
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
  }, [user, canvasMarkdown, viewingDeliverable]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll on new messages. Use direct scrollTop on the scroll container
  // instead of scrollIntoView — iOS Safari's scrollIntoView inside flex+overflow
  // containers is unreliable, which was hiding newly sent user messages below
  // the visible area.
  const chatEnteredAt = useRef(0);
  useEffect(() => {
    if (viewState === 'chat') chatEnteredAt.current = Date.now();
  }, [viewState]);
  useEffect(() => {
    if (viewState !== 'chat' || !scrollRef.current) return;
    const el = scrollRef.current;
    const justEntered = Date.now() - chatEnteredAt.current < 1500;
    const doScroll = () => {
      el.scrollTo({ top: el.scrollHeight, behavior: justEntered ? 'instant' as ScrollBehavior : 'smooth' });
    };
    // Two rAFs: first for React paint, second for iOS to settle layout.
    requestAnimationFrame(() => requestAnimationFrame(doScroll));
  }, [messages, streamingText, viewState]);

  // Reset scroll to top when landing page renders or tab changes
  useEffect(() => {
    if (viewState === 'landing' && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [viewState, activeTab]);

  // Subscription model — no wallet balance needed

  // Send handler — morph from landing to chat
  const handleSend = useCallback((content: string) => {
    if (viewState === 'landing') {
      if (user) authChat.sendMessage(content);
      else anonChat.sendMessage(content, activeTab);
      // Logged-out morph: from /home, default the canvas to Sell so the user
      // doesn't see "home" content duplicated in the canvas position.
      if (!user && activeTab === 'home') {
        setActiveTab('sell');
      }
      // Instant swap to chat mode — the journey card stays visible in the canvas position
      setViewState('chat');
      if (window.location.pathname !== '/chat') navigate('/chat');
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

  // Tab click — push so swipe-back returns to where user came from
  const handleTabClick = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
    // If user has already engaged (in chat mode), keep them in chat mode and just
    // change the canvas content. Don't snap back to landing.
    // Exception: clicking "home" while in chat mode → go back to landing/home
    if (viewState === 'chat' && tab !== 'home') {
      // Stay in chat; the canvas card will pick up the new active journey
      return;
    }
    setViewState('landing');
    const urlMap: Record<TabId, string> = { home: '/', sell: '/sell', buy: '/buy', raise: '/raise', integrate: '/integrate', 'how-it-works': '/how-it-works', advisors: '/advisors', pricing: '/pricing' };
    if (window.location.pathname !== urlMap[tab]) navigate(urlMap[tab]);
  }, [navigate, viewState]);

  // New deal — starts a fresh conversation that becomes a deal when Yulia identifies one
  const handleNewChat = useCallback(() => {
    if (user) authChat.newConversation();
    // Clear any open mobile sheets/drawers so we land on clean chat
    setMobileWorkspaceOpen(null);
    setMobileJourneyOpen(null);
    setLearnDrawerOpen(false);
    setViewState('chat');
    navigate('/chat', { replace: true });
  }, [user, authChat, navigate]);

  // Logout — replace history, don't push back to authenticated views
  const handleLogout = useCallback(() => {
    logout();
    setViewState('landing');
    setActiveTab('home');
    navigate('/', { replace: true });
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
      openCanvasTab('markdown', LABELS[type] || 'Document', { content: msg.content });
      anonChat.setPendingDeliverable(null);
    }
  }, [user, anonChat.pendingDeliverable]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mobile artifact sheet state — Vaul drawer replaces the canvas tab on mobile.
  const [artifactSheet, setArtifactSheet] = useState<{
    title: string;
    subtitle?: string;
    content: string;
    type: string;
  } | null>(null);

  // Mobile account sheet state — replaces the hamburger for user/settings access.
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);
  // Mobile sign-in sheet — shown when logged-out users tap the top-right login icon.
  const [signInSheetOpen, setSignInSheetOpen] = useState(false);
  // Mobile deal actions sheet — opened by long-press on a deal card.
  const [dealActionsTargetId, setDealActionsTargetId] = useState<number | null>(null);
  // Mobile help sheet — opened from AccountSheet, SignInSheet, or chat empty state.
  const [helpSheetOpen, setHelpSheetOpen] = useState(false);

  // Just-created deal highlight — when the user finishes a journey-page CTA
  // and a new deal appears in their stack, that card pulses for ~6s on return
  // to home. Closes the loop "your action just became portfolio state."
  const prevDealIdsRef = useRef<Set<number>>(new Set());
  const [justCreatedDealId, setJustCreatedDealId] = useState<number | null>(null);
  useEffect(() => {
    if (!authChat.grouped) return;
    const currentIds = new Set(authChat.grouped.deals.map(d => d.id));
    if (prevDealIdsRef.current.size > 0) {
      const newIds = [...currentIds].filter(id => !prevDealIdsRef.current.has(id));
      if (newIds.length > 0) {
        setJustCreatedDealId(newIds[0]);
        const t = setTimeout(() => setJustCreatedDealId(null), 6000);
        prevDealIdsRef.current = currentIds;
        return () => clearTimeout(t);
      }
    }
    prevDealIdsRef.current = currentIds;
  }, [authChat.grouped]);

  // Handler: open deliverable from chat message click.
  // Desktop → canvas tab. Mobile → Vaul ArtifactSheet.
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
    const title = LABELS[type || ''] || 'Document';
    if (isMobile) {
      setArtifactSheet({
        title,
        subtitle: 'Generated by Yulia',
        content: msg.content,
        type: type || 'document',
      });
    } else {
      openCanvasTab('markdown', title, { content: msg.content });
      window.history.pushState({ artifact: true }, '');
    }
  }, [isMobile]); // eslint-disable-line react-hooks/exhaustive-deps

  const closeCanvas = useCallback(() => {
    setCanvasMarkdown(null);
    setViewingDeliverable(null);
  }, []);

  const canvasOpen = canvasTabs.length > 0 || canvasMarkdown !== null || viewingDeliverable !== null;

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

  // ─── Canvas Action Handler (from Yulia's tools) ────────────
  // Yulia shows, doesn't just tell. Tools return canvas_action to open tabs.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail?.canvas_action) return;

      const action = detail.canvas_action;

      // Model tabs (valuation, LBO, SBA, etc.)
      if (action === 'create_model_tab') {
        import('../../lib/modelStore').then(({ useModelStore }) => {
          const store = useModelStore.getState();
          const modelTabId = store.createTab(detail.modelType, detail.title, detail.initialAssumptions);
          openCanvasTab('model', detail.title, { modelTabId });
        });
      } else if (action === 'update_model') {
        import('../../lib/modelStore').then(({ useModelStore }) => {
          const store = useModelStore.getState();
          const tabId = detail.tabId === 'active' ? store.activeTabId : detail.tabId;
          if (tabId && detail.updates) {
            store.updateAssumptions(tabId, detail.updates);
          }
        });
      }
      // Open sourcing portfolio
      else if (action === 'open_sourcing') {
        openCanvasTab('sourcing', detail.title || 'Sourcing Pipeline', detail.props);
      }
      // Open buyer pipeline
      else if (action === 'open_buyer_pipeline') {
        openCanvasTab('buyer-pipeline', detail.title || 'Buyer Pipeline', detail.props);
      }
      // Open a deliverable in canvas
      else if (action === 'open_deliverable') {
        openCanvasTab('deliverable', detail.title || 'Document', {
          deliverableId: detail.deliverableId,
        });
      }
      // Open data room
      else if (action === 'open_dataroom') {
        openCanvasTab('dataroom', detail.title || 'Data Room', detail.props);
      }
      // Open pipeline view
      else if (action === 'open_pipeline') {
        openCanvasTab('pipeline', detail.title || 'Deal Pipeline', detail.props);
      }
      // Open seller dashboard
      else if (action === 'open_seller_dashboard') {
        openCanvasTab('seller-dashboard', detail.title || 'Seller Dashboard', detail.props);
      }
      // Open deal messages (participant chat)
      else if (action === 'open_deal_messages') {
        openCanvasTab('deal-messages', detail.title || 'Deal Discussion', { dealId: detail.dealId });
      }
      // Render markdown/analysis in a new tab
      else if (action === 'show_content') {
        openCanvasTab('markdown', detail.title || 'Analysis', {
          content: detail.content,
        });
      }
      // Chapter started — Yulia created a new chapter, switch to it
      else if (action.type === 'chapter_started' && action.newConversationId) {
        authChat.selectConversation(action.newConversationId);
        authChat.loadConversations();
        navigate(`/chat/${action.newConversationId}`, { replace: true });
      }
    };

    window.addEventListener('smbx:canvas_action', handler);
    return () => window.removeEventListener('smbx:canvas_action', handler);
  }, [openCanvasTab]);

  // ─── Canvas Toolbar Actions — context-aware floating toolbar ──
  const getToolbarActionsFor = (tab: { id: string; type: string; label: string; props?: Record<string, any> }): ToolbarAction[] => {
    switch (tab.type) {
      case 'deliverable':
        return [
          { id: 'edit', label: 'Edit', icon: 'edit', onClick: () => { /* TODO: open editor */ } },
          { id: 'export', label: 'Export', icon: 'download', onClick: () => {
            const id = tab.props?.deliverableId;
            if (id) window.open(`/api/deliverables/${id}/export?format=pdf`, '_blank');
          }, divider: true },
          { id: 'share', label: 'Share', icon: 'share', onClick: () => { /* TODO: share modal */ } },
        ];
      case 'model':
        return [
          { id: 'reset', label: 'Reset', icon: 'restart_alt', onClick: () => { /* TODO: reset model */ } },
          { id: 'compare', label: 'Compare', icon: 'compare_arrows', onClick: () => { /* TODO: compare scenarios */ }, divider: true },
          { id: 'export', label: 'Export', icon: 'download', onClick: () => { /* TODO: export model */ } },
        ];
      case 'markdown':
        return [
          { id: 'copy', label: 'Copy', icon: 'content_copy', onClick: () => {
            if (tab.props?.content) navigator.clipboard.writeText(tab.props.content);
          } },
          { id: 'export', label: 'Export', icon: 'download', onClick: () => { /* TODO: export markdown */ }, divider: true },
        ];
      case 'dataroom':
        return [
          { id: 'upload', label: 'Upload', icon: 'upload_file', onClick: () => { /* TODO: trigger upload */ }, primary: true },
          { id: 'invite', label: 'Invite', icon: 'person_add', onClick: () => { /* TODO: invite */ }, divider: true },
        ];
      // Panels with their own internal controls (Library, Pipeline, Sourcing, Settings) — no floating toolbar
      default:
        return [];
    }
  };

  // ─── Canvas Tab Content Renderer ──────────────────────────────
  const renderCanvasTabContent = (tab: { id: string; type: string; label: string; props?: Record<string, any> }) => {
    switch (tab.type) {
      case 'pipeline':
        return (
          <PipelinePanel
            onOpenConversation={(convId: number) => { authChat.selectConversation(convId); setViewState('chat'); navigate(`/chat/${convId}`); }}
            onNewDeal={() => { authChat.newConversation(); setViewState('chat'); navigate('/chat'); }}
            isFullscreen={false}
          />
        );
      case 'dataroom':
        return (
          <DataRoom
            dealId={authChat.activeDealId}
            onViewDeliverable={(id: number) => { openCanvasTab('deliverable', `Document #${id}`, { deliverableId: id }); }}
          />
        );
      case 'documents':
        return (
          <DocumentLibrary onViewDeliverable={(id: number) => { openCanvasTab('deliverable', `Document #${id}`, { deliverableId: id }); }} />
        );
      case 'sourcing':
        return <SourcingPanel isFullscreen={false} />;
      case 'settings':
        return <SettingsPanel user={user!} onLogout={handleLogout} isFullscreen={false} />;
      case 'seller-dashboard':
        return <SellerDashboard />;
      case 'buyer-pipeline':
        return <BuyerPipeline />;
      case 'analytics':
        return (
          <AnalyticsView
            onOpenConversation={(convId: number) => { authChat.selectConversation(convId); setViewState('chat'); navigate(`/chat/${convId}`); }}
            onNewDeal={() => { authChat.newConversation(); setViewState('chat'); navigate('/chat'); }}
          />
        );
      case 'deliverable':
        return (
          <Canvas
            deliverableId={tab.props?.deliverableId}
            dealId={user ? authChat.activeDealId : null}
            onClose={() => closeCanvasTab(tab.id)}
          />
        );
      case 'markdown':
        return (
          <Canvas
            markdownContent={tab.props?.content}
            title={tab.label}
            onClose={() => closeCanvasTab(tab.id)}
          />
        );
      case 'model':
        return <ModelRenderer tabId={tab.props?.modelTabId} />;
      case 'deal-messages':
        return (
          <DealMessagesPanel
            dealId={tab.props?.dealId || authChat.activeDealId}
            currentUserEmail={user?.email}
            onClose={() => closeCanvasTab(tab.id)}
          />
        );
      default:
        return null;
    }
  };

  // Current page copy
  const page = PAGE_COPY[activeTab];

  // Conversations — unified across auth and anonymous
  const allConversations = user ? authChat.conversations : anonChat.conversations;
  const activeConvId = user ? authChat.activeConversationId : anonChat.activeConversationId;

  // ─── Canvas Tab Persistence ───
  // 1. Update ref so persist callbacks see the current conversation
  useEffect(() => {
    conversationIdRef.current = (user ? authChat.activeConversationId : null) as number | null;
  }, [user, authChat.activeConversationId]);

  // 2. Hydrate canvas tabs from server when conversation changes
  useEffect(() => {
    if (!user || !authChat.activeConversationId) {
      // No conversation = no persisted tabs
      return;
    }
    const convId = authChat.activeConversationId;
    let cancelled = false;
    fetch(`/api/conversations/${convId}/canvas-tabs`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : { tabs: [] })
      .then(async ({ tabs }) => {
        if (cancelled) return;
        if (!Array.isArray(tabs) || tabs.length === 0) return;

        // Restore model tabs into the zustand modelStore so they actually render
        const modelTabs = tabs.filter((t: any) => t.type === 'model');
        if (modelTabs.length > 0) {
          const { useModelStore } = await import('../../lib/modelStore');
          const store = useModelStore.getState();
          for (const t of modelTabs) {
            const props = t.props || {};
            // Use the canvas tab_id as the zustand model id
            // (deterministic — client and server agree)
            const modelId = t.tab_id;
            if (props.modelType) {
              store.restoreTab(modelId, props.modelType, t.label, props.initialAssumptions || props.assumptions || {});
              props.modelTabId = modelId;
              t.props = props;
            }
          }
        }

        const restored: CanvasTab[] = tabs.map((t: any) => ({
          id: t.tab_id,
          type: t.type,
          label: t.label,
          closable: true,
          props: t.props || undefined,
        }));
        setCanvasTabs(restored);
        const active = tabs.find((t: any) => t.is_active);
        if (active) setActiveCanvasTabId(active.tab_id);
        else if (restored.length > 0) setActiveCanvasTabId(restored[0].id);
      })
      .catch(() => { /* non-critical */ });
    return () => { cancelled = true; };
  }, [user, authChat.activeConversationId]);

  // 3. Sync active tab changes to server
  useEffect(() => {
    if (!user || !authChat.activeConversationId) return;
    persistActiveTab(activeCanvasTabId);
  }, [user, authChat.activeConversationId, activeCanvasTabId, persistActiveTab]);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!activeConvId || !user) return null;
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`/api/chat/conversations/${activeConvId}/upload`, {
      method: 'POST',
      headers: authHeaders(),
      body: form,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { name: data.file.name, size: data.file.sizeFormatted };
  }, [activeConvId, user]);

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
      className={`hidden lg:flex flex-col w-[72px] fixed left-0 top-0 z-50 items-center py-6 ${dark ? 'bg-[#151617]' : 'bg-white'}`}
      style={{
        top: 16,
        left: 16,
        bottom: 16,
        height: 'auto',
        borderRadius: 14,
        border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #E5E1D9',
        boxShadow: dark
          ? '0 1px 2px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.25)'
          : '0 1px 2px rgba(60,55,45,0.06), 0 4px 8px rgba(60,55,45,0.04)',
      }}
    >
      {/* Logo — X mark, always visible */}
      <div className="flex flex-col items-center mb-3" ref={sidebarLogoRef as any}>
        <button
          onClick={() => {
            if (user) {
              setViewState('chat'); navigate('/chat');
            } else {
              setViewState('landing'); setActiveTab('home'); navigate('/'); setCanvasTabs([]); setActiveCanvasTabId(null);
            }
          }}
          className="sidebar-x-btn border-0 bg-transparent cursor-pointer p-1 rounded-xl"
          title={user ? 'Chat' : 'Home'}
          type="button"
        >
          <img src={dark ? '/X-white.png' : '/X.png'} alt="smbx.ai" width={42} height={42} className="sidebar-x-img" style={{ display: 'block' }} />
        </button>
      </div>

      {/* Explore section — marketing pages, hidden when logged in */}
      {!user && (
      <>
      <div className="flex flex-col items-center gap-1 w-full px-2">
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
              className={`sidebar-icon-btn w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all border-none cursor-pointer ${
                isActive
                  ? (dark ? 'text-rose-500 bg-rose-500/10' : 'text-[#D44A78] bg-[#D44A78]/5')
                  : (dark ? 'text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10' : 'text-[#636467] hover:text-[#D44A78] hover:bg-[#D44A78]/5')
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
      </>
      )}

      {/* Tools section — logged-in user features */}
      {user && (
      <div className="flex flex-col items-center gap-1 w-full px-2">
        <span className={`text-[9px] font-bold uppercase tracking-widest mb-2 ${dark ? 'text-zinc-500' : 'text-[#5a4044]'}`}>Tools</span>
        {([
          { type: 'documents', icon: 'folder_open', label: 'Library' },
          { type: 'dataroom', icon: 'lock', label: 'Data Rm' },
          { type: 'pipeline', icon: 'view_kanban', label: 'Pipeline' },
          { type: 'sourcing', icon: 'search', label: 'Sourcing' },
        ]).map(item => {
          const isActive = activeCanvasTabId === item.type;
          return (
            <button
              key={item.type}
              onClick={() => openCanvasTab(item.type, item.label)}
              className={`sidebar-icon-btn w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all border-none cursor-pointer ${
                isActive
                  ? (dark ? 'text-rose-500 bg-rose-500/10' : 'text-[#D44A78] bg-[#D44A78]/5')
                  : (dark ? 'text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10' : 'text-[#636467] hover:text-[#D44A78] hover:bg-[#D44A78]/5')
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

      {/* Deals section */}
      <div className="flex flex-col items-center gap-1 w-full px-2">
        <span className={`text-[9px] font-bold uppercase tracking-widest mb-2 ${dark ? 'text-zinc-500' : 'text-[#5a4044]'}`}>Deals</span>
        {user && (
        <button
          onClick={() => { handleNewChat(); }}
          className={`sidebar-icon-btn w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 border-none cursor-pointer transition-all ${dark ? 'text-rose-500 bg-rose-500/10' : 'text-[#D44A78] bg-[#D44A78]/5'}`}
          title="New Deal"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">add_business</span>
          <span className="text-[9px] font-semibold">New</span>
        </button>
        )}
        <button
          onClick={() => { setViewState('chat'); navigate('/chat', { replace: viewState === 'chat' }); }}
          className={`sidebar-icon-btn w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all border-none cursor-pointer ${
            viewState === 'chat'
              ? (dark ? 'text-rose-500 bg-rose-500/10' : 'text-[#D44A78] bg-[#D44A78]/5')
              : (dark ? 'text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10' : 'text-[#636467] hover:text-[#D44A78] hover:bg-[#D44A78]/5')
          }`}
          title="All Deals"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">business_center</span>
          <span className="text-[9px] font-semibold">All</span>
        </button>
      </div>

      {/* Spacer to push admin/account to bottom */}
      <div className="flex-1" />

      {/* Bottom: Theme + Admin + Account */}
      <div className="flex flex-col items-center gap-1 mt-auto pt-4">
        {/* Theme toggle — always visible (logged in or out) */}
        <button
          onClick={() => setDark(!dark)}
          className={`sidebar-icon-btn flex flex-col items-center gap-0.5 bg-transparent border-none cursor-pointer transition-colors mb-2 p-1 rounded-lg ${dark ? 'text-zinc-500 hover:text-rose-500' : 'text-[#636467] hover:text-[#D44A78]'}`}
          type="button"
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span className="material-symbols-outlined text-[22px]">{dark ? 'light_mode' : 'dark_mode'}</span>
          <span className="text-[9px] font-semibold">{dark ? 'Light' : 'Dark'}</span>
        </button>
        {/* Admin Console — visible only to admins */}
        {user && (user.role === 'admin' || user.email === 'pbaker@smbx.ai') && (
          <button
            onClick={() => navigate('/admin')}
            className={`sidebar-icon-btn flex flex-col items-center gap-0.5 bg-transparent border-none cursor-pointer transition-colors mb-2 p-1 rounded-lg ${dark ? 'text-zinc-500 hover:text-rose-500' : 'text-[#636467] hover:text-[#D44A78]'}`}
            type="button"
            title="Admin Console"
          >
            <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
            <span className="text-[9px] font-semibold">Admin</span>
          </button>
        )}
        <button
          onClick={() => { if (user) { openCanvasTab('settings', 'Settings'); } else window.location.href = '/login'; }}
          className={`sidebar-icon-btn flex flex-col items-center gap-0.5 bg-transparent border-none cursor-pointer transition-colors p-1 rounded-lg ${dark ? 'text-zinc-500 hover:text-rose-500' : 'text-[#636467] hover:text-[#D44A78]'}`}
          type="button"
        >
          <span className="material-symbols-outlined text-[22px]">{user ? 'person' : 'login'}</span>
          <span className="text-[9px] font-semibold">{user ? 'Account' : 'Sign In'}</span>
        </button>
      </div>
    </aside>
  );

  /* ═══ RENDER ═══ */

  // Custom mobile swipe gestures removed — we lean into iOS's native
  // swipe-from-left-edge = history.back() gesture instead of fighting it.
  // The sidebar is opened via the hamburger button (explicit, accessible,
  // no gesture conflict). See memory/architecture_ios_pwa_pill.md for the
  // philosophy: work WITH the platform, not AGAINST it.

  return (
    <div
      id="app-root"
      className={`flex font-sans ${dark ? 'text-[#f0f0f3]' : 'text-[#1a1c1e]'}`}
      style={{
        width: '100%',
        // No background here — body provides the warm paper back layer with noise.
        // Setting bg here would create a solid patch that doesn't match the body's textured cream.
        background: 'transparent',
        ...(isChat ? { height: '100%' } : {}),
        paddingTop: 'env(safe-area-inset-top)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        overscrollBehaviorX: 'contain',
        // Desktop: keyboard-lift transform from useAppHeight. Mobile: never apply —
        // portaled pill uses --kb-inset-bottom instead, and a transformed ancestor
        // would create a containing block that broke position:fixed.
        ...(!isMobile && appOffset ? { transform: `translateY(${appOffset}px)` } : {}),
      }}
    >
      {/* Desktop sidebar — fixed 80px icon rail */}
      {sidebarContent(false)}

      {/* Main canvas — offset by sidebar (16 left + 72 width + 16 gap = 104px) */}
      <div className={`flex-1 flex flex-col min-w-0 lg:ml-[104px] bg-transparent ${isChat ? 'h-full' : ''}`}>
        {/* Offline banner */}
        {isOffline && (
          <div className="shrink-0 bg-yellow-50 border-b border-yellow-200 px-4 py-2 flex items-center justify-center gap-2 z-30">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-xs font-semibold text-yellow-800">You appear to be offline. Messages will send when you reconnect.</span>
          </div>
        )}
        {/* No header bar — sidebar handles navigation, floating buttons handle actions */}

        {/* Main row: chat + canvas split */}
        <div className="flex-1 flex min-h-0 bg-transparent">
        {/* Chat column — transparent, lets the back layer show through */}
        <div
          className="flex flex-col min-w-0"
          style={{
            background: 'transparent',
            ...(!isMobile && viewState === 'chat'
              ? { width: chatWidth, flexShrink: 0 }
              : { flex: 1 }),
          }}
        >
        {/* Scroll area */}
        <div
          ref={scrollRef}
          className={isChat ? 'flex-1 overflow-y-auto min-h-0 bg-transparent' : 'flex-1 bg-transparent'}
          style={isChat ? { WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', paddingBottom: isMobile ? 'calc(env(safe-area-inset-bottom) + 76px)' : 'env(safe-area-inset-bottom)' } as any : {} as any}
        >
          {/* ════ LANDING MODE ════ */}
          {viewState === 'landing' && (
            <div key={activeTab} style={{
              /* HOME desktop: position:fixed full-viewport wrapper (unchanged).
                 HOME mobile: natural flow (relative + minHeight) so iOS computes the same
                 ICB as the chat page, which normalizes the portaled pill's bottom anchor
                 (home was reporting iH=873, chat iH=932 — the fixed wrapper was the cause).
                 Other tabs: relative with minHeight. */
              position: (activeTab === 'home' && !isMobile) ? 'fixed' as const : 'relative' as const,
              animation: morphing ? (isMobile ? 'fadeOut 0.2s ease forwards' : 'morphOut 0.3s ease forwards') : activeTab === 'home' ? 'fadeOnly 0.25s ease' : 'slideUp 0.35s ease',
              pointerEvents: morphing ? 'none' as const : undefined,
              ...(activeTab === 'home' && !isMobile
                ? { top: 0, right: 0, bottom: 0, left: 104, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', overscrollBehavior: 'none' as const }
                : activeTab === 'home' && isMobile
                ? { minHeight: '100dvh', display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', overscrollBehavior: 'none' as const, touchAction: 'none' as const }
                : { minHeight: '100dvh' }
              ),
            }}>

              {/* No background layer here — body (#E8DFC9 warm beige in index.css)
                  provides the back-layer color. Adding an absolute-positioned div
                  here was painting a lighter rectangle over the body, creating a
                  visible mismatch between sidebar/journey cards and the body. */}

              {activeTab === 'home' ? (
              <div className="relative z-10 flex-1 flex flex-col" style={{ padding: !isMobile ? '16px' : '0' }}>
                {/* ═══ HOME PAGE ═══ Floating card on desktop, edge-to-edge on mobile */}
                <div
                  className="flex-1 flex flex-col"
                  style={{
                    background: dark ? '#151617' : '#FFFFFF',
                    border: !isMobile ? (dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #E5E1D9') : 'none',
                    borderRadius: !isMobile ? 14 : 0,
                    boxShadow: !isMobile ? (dark
                      ? '0 1px 2px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.25)'
                      : '0 1px 2px rgba(60,55,45,0.06), 0 4px 8px rgba(60,55,45,0.04)') : 'none',
                    overflow: 'hidden',
                  }}
                >
                <main className="flex-1 flex flex-col relative">
                  {/* Mobile + logged-in + has deals → Wallet-style deal stack.
                      Replaces the greeting block with glanceable portfolio state.
                      Desktop + logged-out always see the hero/greeting block. */}
                  {isMobile && user ? (
                    <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                      <div className="flex justify-center pt-6">
                        <LogoHero height={32} dark={dark} />
                      </div>
                      <DealStack
                        loading={!authChat.grouped}
                        deals={(authChat.grouped?.deals ?? []).map(d => ({
                          id: d.id,
                          business_name: d.business_name,
                          journey_type: d.journey_type,
                          current_gate: d.current_gate,
                          industry: d.industry,
                          league: d.league,
                          updated_at: d.updated_at,
                          status: d.status,
                        }))}
                        onDealTap={(dealId) => {
                          const deal = authChat.grouped?.deals.find(d => d.id === dealId);
                          const latestConv = deal?.conversations[0];
                          if (latestConv) {
                            authChat.selectConversation(latestConv.id);
                            navigate(`/chat/${latestConv.id}`);
                            setViewState('chat');
                          }
                        }}
                        onStartFirstDeal={(fill) => fillHomeInput(fill)}
                        onDealLongPress={(dealId) => setDealActionsTargetId(dealId)}
                        justCreatedDealId={justCreatedDealId}
                        dark={dark}
                      />
                    </div>
                  ) : (
                  <div className="flex flex-col items-center px-6 relative z-10 flex-[1.618] justify-center">
                    <div className={`w-full text-center ${isMobile ? 'max-w-4xl' : 'max-w-3xl space-y-6'}`}>
                      {!isMobile && (
                        <div className="mb-10 flex justify-center">
                          <LogoHero height={60} dark={dark} />
                        </div>
                      )}
                      {isMobile && (
                        <div className="flex justify-center mb-10">
                          <LogoHero height={42} dark={dark} />
                        </div>
                      )}
                      {user ? (
                        /* ─── Logged in: personal greeting + next steps ─── */
                        <>
                          <h1 className={`font-headline font-black tracking-[-0.04em] ${isMobile ? 'text-[36px] leading-[1] mb-4' : 'text-[52px] leading-[1] mb-4'}`}>
                            Welcome back,{' '}
                            <span className={dark ? 'text-[#E8709A]' : 'text-[#D44A78]'}>
                              {user.display_name?.split(' ')[0] || 'there'}
                            </span>!
                          </h1>
                          <p className={`mx-auto font-medium ${isMobile ? 'text-[15px] leading-[1.5] max-w-[300px]' : 'text-lg max-w-xl'} ${dark ? 'text-zinc-400' : 'text-[#636467]'}`}>
                            Here's how we can keep moving forward — tell me what you're working on and I'll pick up where we left off.
                          </p>
                        </>
                      ) : (
                        /* ─── Not logged in: landing page hook ─── */
                        <>
                          <h1 className={`font-headline font-black tracking-[-0.04em] ${isMobile ? 'text-[42px] leading-[0.95] mb-6' : 'text-[64px] leading-[0.95] mb-4'}`}>
                            Close deals <span className={dark ? 'text-[#E8709A]' : 'text-[#D44A78]'}>faster</span><br/>
                            and smarter.
                          </h1>
                          <p className={`mx-auto font-medium ${isMobile ? 'text-[15px] leading-[1.5] max-w-[300px]' : 'text-xl max-w-2xl'} ${dark ? 'text-zinc-400' : 'text-[#636467]'}`}>
                            Yulia guides the entire M&amp;A process from beginning to end, empowering your team with superior deal intelligence, at the speed&nbsp;of&nbsp;AI.
                          </p>
                        </>
                      )}

                      {/* Next actions cards — logged-in users see Yulia's suggestions.
                          Desktop only — mobile keeps Grok-like simplicity (greeting + pill, no cards). */}
                      {user && !isMobile && (
                        <div className="w-full mt-6 max-w-xl mx-auto">
                          <NextActionsCards
                            dark={dark}
                            onAction={(prefill) => {
                              const ref = homeInputRef.current;
                              if (ref) { ref.value = prefill; ref.focus(); }
                            }}
                            authHeaders={authHeaders}
                          />
                        </div>
                      )}

                      {/* Desktop: input + micro-copy */}
                      {!isMobile && (
                        <>
                          <div className="w-full max-w-3xl mx-auto mt-8">
                            <div className="relative group">
                              <div className={`absolute -inset-1 bg-gradient-to-r from-[#D44A78] to-[#E8709A] rounded-full blur transition duration-1000 ${dark ? 'opacity-40 group-hover:opacity-60' : 'opacity-[0.18] group-hover:opacity-[0.28]'}`} />
                              <div className={`relative rounded-full flex items-center p-2 pl-4 ${dark ? 'bg-zinc-900/90 border border-zinc-700 shadow-2xl' : 'bg-white border border-[#e3bdc3] shadow-xl'}`}>
                                {/* + Tools button */}
                                <button
                                  ref={homePlusRef}
                                  type="button"
                                  aria-label="Tools menu"
                                  aria-expanded={homeToolsOpen}
                                  onClick={() => setHomeToolsOpen(p => !p)}
                                  className={`h-10 w-10 rounded-full flex items-center justify-center mr-2 transition-all active:scale-95 cursor-pointer border-none ${dark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-[#f3f3f6] text-[#D44A78] hover:bg-[#e3bdc3]/40'}`}
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: homeToolsOpen ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>
                                    <path d="M12 5v14" /><path d="M5 12h14" />
                                  </svg>
                                </button>
                                <input
                                  ref={homeInputRef}
                                  className={`bg-transparent border-none focus:ring-0 flex-1 py-4 text-lg outline-none ${dark ? 'text-white placeholder-zinc-500' : 'text-[#1a1c1e] placeholder-[#5a4044]'}`}
                                  placeholder="Tell me about your business..."
                                  type="search"
                                  autoComplete="off"
                                  data-1p-ignore="true"
                                  data-lpignore="true"
                                  data-form-type="other"
                                  name="yulia-chat-desktop"
                                  enterKeyHint="send"
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
                                  className="hero-send-btn h-12 w-12 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all border-none cursor-pointer"
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l7-7 7 7" /><path d="M12 19V5" /></svg>
                                </button>
                              </div>

                              {/* Tool popup (drops UP from input) */}
                              {!isMobile && (
                                <div ref={homeToolsRef} className={`home-tools-popup ${homeToolsOpen ? 'open' : ''}`} style={{ bottom: 'calc(100% + 12px)' }}>
                                  <div className="px-4 pt-3 pb-2">
                                    <span className="text-[12px] font-semibold tracking-wide uppercase" style={{ color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.35)' }}>Start with Yulia</span>
                                  </div>
                                  {HOME_TOOLS.filter(t => t.group === 'journey').map(t => (
                                    <button key={t.label} className="home-tp-item" onClick={() => fillHomeInput(t.fill)} type="button">
                                      {t.icon}
                                      <div>
                                        <div className={`text-[15px] font-semibold leading-[1.3] ${dark ? 'text-[#f0f0f3]' : 'text-[#1a1c1e]'}`}>{t.label}</div>
                                        <div className="text-[13px] leading-[1.4] mt-0.5" style={{ color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}>{t.desc}</div>
                                      </div>
                                    </button>
                                  ))}
                                  <div className="mx-4 my-1" style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }} />
                                  <div className="px-4 pt-2 pb-1">
                                    <span className="text-[12px] font-semibold tracking-wide uppercase" style={{ color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.35)' }}>Tools</span>
                                  </div>
                                  {HOME_TOOLS.filter(t => t.group === 'tool').map(t => (
                                    <button key={t.label} className="home-tp-item" onClick={() => fillHomeInput(t.fill)} type="button">
                                      {t.icon}
                                      <div>
                                        <div className={`text-[15px] font-semibold leading-[1.3] ${dark ? 'text-[#f0f0f3]' : 'text-[#1a1c1e]'}`}>{t.label}</div>
                                        <div className="text-[13px] leading-[1.4] mt-0.5" style={{ color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}>{t.desc}</div>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Trust line */}
                          <p className={`text-xs font-medium ${dark ? 'text-zinc-600' : 'text-[#636467]/50'}`}>
                            Free analysis · No account required · Your data stays yours
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  )}

                  {/* Golden-ratio spacer — content above takes 1.618 units, this empty
                      spacer takes 1 unit. Content lands in the upper 61.8% of the card,
                      breathing room in the lower 38.2%, and the portaled pill floats over
                      the bottom of that breathing room. Grok-like simplicity. Mobile only,
                      and only when NOT showing the deal stack (stack manages its own scroll). */}
                  {isMobile && !(user && authChat.grouped) && <div className="flex-1" aria-hidden />}

                  {/* ╔══════════════════════════════════════════════════════════════════════╗
                      ║ iOS PWA mobile home pill — LOAD-BEARING SETUP, see                   ║
                      ║ memory/architecture_ios_pwa_pill.md before modifying.                ║
                      ║ Portaled to document.body + position:fixed bottom:0 +                ║
                      ║ env(safe-area-inset-bottom) padding. No JS viewport tracking —       ║
                      ║ trust interactive-widget=resizes-content in the viewport meta.       ║
                      ║ The min-height:100lvh/-webkit-fill-available trio in index.css is    ║
                      ║ what makes bottom:0 actually reach the screen edge on iOS standalone.║
                      ╚══════════════════════════════════════════════════════════════════════╝ */}
                  {isMobile && createPortal(
                    <div
                      id="mobile-home-pill-portal"
                      className="fixed left-0 right-0 bottom-0 z-10"
                      style={{ paddingTop: 12, paddingBottom: 'env(safe-area-inset-bottom)' }}
                    >
                      {/* Context-aware chip row — journey chips when empty portfolio,
                          single "Start a new deal" chip when user has deals. Always shown
                          on mobile home (not just browser). */}
                      <DealContextChips
                        dark={dark}
                        hasDeals={!!(user && isMobile && authChat.grouped)}
                        onChipTap={(fill) => fillHomeInput(fill)}
                      />

                      <div className={isPWA ? 'px-3' : 'px-4'} style={{ touchAction: 'auto' }}>
                      {/* Gradient-glow input with + button for file uploads / utilities */}
                      <form autoComplete="off" onSubmit={(e) => e.preventDefault()} role="presentation" data-form-type="other">
                      <div className="relative group">
                        <div className={`absolute -inset-1 bg-gradient-to-r from-[#D44A78] to-[#E8709A] rounded-full blur transition duration-1000 ${dark ? 'opacity-40 group-hover:opacity-60' : 'opacity-[0.18] group-hover:opacity-[0.28]'}`} />
                        <div className={`relative rounded-full flex items-center p-2 pl-3 ${dark ? 'bg-zinc-900/90 border border-zinc-700 shadow-2xl' : 'bg-white border border-[#e3bdc3] shadow-xl'}`}>
                          {/* + button — opens tools/upload drawer */}
                          <button
                            type="button"
                            aria-label="Attach files or tools"
                            onClick={() => setHomeToolsOpen(p => !p)}
                            className={`h-9 w-9 rounded-full flex items-center justify-center mr-2 transition-all active:scale-95 cursor-pointer border-none ${dark ? 'bg-zinc-800 text-zinc-300' : 'bg-[#f3f3f6] text-[#D44A78]'}`}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: homeToolsOpen ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>
                              <path d="M12 5v14" /><path d="M5 12h14" />
                            </svg>
                          </button>
                          <input
                            ref={homeInputMobileRef}
                            className={`bg-transparent border-none focus:ring-0 flex-1 py-3 text-base outline-none ${dark ? 'text-white placeholder-zinc-500' : 'text-[#1a1c1e] placeholder-[#5a4044]'}`}
                            placeholder="Tell me about your business..."
                            type="search"
                            autoComplete="off"
                            data-1p-ignore="true"
                            data-lpignore="true"
                            data-form-type="other"
                            name="yulia-chat-mobile"
                            enterKeyHint="send"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                                e.preventDefault();
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
                            className="hero-send-btn h-10 w-10 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all border-none cursor-pointer"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l7-7 7 7" /><path d="M12 19V5" /></svg>
                          </button>
                        </div>
                      </div>
                      </form>
                      {!isPWA && !user && (
                        <p className={`text-xs font-medium text-center mt-3 ${dark ? 'text-zinc-600' : 'text-[#636467]/50'}`}>
                          Free analysis · No account required · Your data stays yours
                        </p>
                      )}
                      </div>
                    </div>,
                    document.body
                  )}
                </main>
                </div>
                {/* Scroll spacer removed — page is exactly 100dvh, pill sits at bottom of
                    visible viewport with safe-area padding for the home indicator. */}
              </div>
              ) : ['sell','buy','raise','how-it-works','integrate','advisors','pricing'].includes(activeTab) ? (
              <div className="relative z-10" style={{ padding: !isMobile ? '16px 16px 16px 16px' : '0' }}>
                {/* Floating card — matches the canvas card style in the workspace */}
                <div
                  style={{
                    background: dark ? '#151617' : '#FFFFFF',
                    border: !isMobile ? (dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #E5E1D9') : 'none',
                    borderRadius: !isMobile ? 14 : 0,
                    boxShadow: !isMobile ? (dark
                      ? '0 1px 2px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.25)'
                      : '0 1px 2px rgba(60,55,45,0.06), 0 4px 8px rgba(60,55,45,0.04)') : 'none',
                    overflow: 'hidden',
                  }}
                >
                  <Suspense fallback={<BelowSkeleton />}>
                    {activeTab === 'sell' ? <SellBelow dark={dark} /> :
                     activeTab === 'buy' ? <BuyBelow dark={dark} /> :
                     activeTab === 'raise' ? <RaiseBelow dark={dark} /> :
                     activeTab === 'how-it-works' ? <HowItWorksBelow dark={dark} /> :
                     activeTab === 'integrate' ? <IntegrateBelow dark={dark} /> :
                     activeTab === 'advisors' ? <AdvisorsBelow dark={dark} /> :
                     activeTab === 'pricing' ? <PricingBelow dark={dark} /> : null}
                  </Suspense>
                  <footer className={`py-12 flex justify-center ${dark ? 'border-t border-zinc-800/50' : 'border-t border-[#eeeef0]'}`}>
                    <LogoIcon height={44} dark={dark} />
                  </footer>
                </div>
              </div>
              ) : null}
            </div>
          )}

          {/* ════ CHAT MODE ════ */}
          {viewState === 'chat' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                minHeight: '100%',
                ...(isMobile ? { paddingTop: 48 } : {}),
              }}
            >
              {/* Mobile scope indicator — tells the user which deal this chat is about.
                  Small, unobtrusive, tappable to return to the stack. Replaces the
                  chapter strip we hid on mobile. */}
              {isMobile && user && authChat.grouped && authChat.activeDealId && (() => {
                const deal = authChat.grouped.deals.find(d => d.id === authChat.activeDealId);
                if (!deal || !deal.business_name) return null;
                const journey = (deal.journey_type || 'sell').toLowerCase();
                const color = JOURNEY_COLORS[journey] || '#D44A78';
                return (
                  <button
                    onClick={() => { setViewState('landing'); setActiveTab('home'); navigate('/'); }}
                    type="button"
                    style={{
                      alignSelf: 'center',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 12px 6px 8px',
                      marginBottom: 10,
                      borderRadius: 999,
                      border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                      background: dark ? '#1F2123' : '#FFFFFF',
                      color: dark ? '#F0F0F3' : '#1A1C1E',
                      fontFamily: 'Inter, system-ui',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                      boxShadow: dark ? 'none' : '0 1px 2px rgba(0,0,0,0.04)',
                    }}
                    aria-label={`Scoped to ${deal.business_name}. Tap to return to deals.`}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.55 }}>
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {deal.business_name}
                    </span>
                  </button>
                );
              })()}

              {/* Chapter strip — shows deal's conversation chapters as horizontal timeline.
                  Desktop only — on mobile the DealStack + single-conversation-per-card
                  model replaces this; a horizontal breadcrumb above the chat feels like
                  noise when the user just tapped into a scoped chat. */}
              {!isMobile && user && authChat.grouped && authChat.activeDealId && (() => {
                const dealGroup = authChat.grouped.deals.find(d => d.id === authChat.activeDealId);
                if (!dealGroup || dealGroup.conversations.length < 2) return null;
                return (
                  <ChapterStrip
                    chapters={dealGroup.conversations.map((c: any) => ({
                      id: c.id,
                      title: c.title || 'Chapter',
                      gate_label: c.gate_label,
                      gate_status: c.gate_status,
                      summary: c.summary,
                    }))}
                    activeChapterId={activeConvId}
                    onChapterTap={(id) => {
                      authChat.selectConversation(id);
                      navigate(`/chat/${id}`, { replace: true });
                    }}
                    dark={dark}
                  />
                );
              })()}

              {user && authChat.activeDealId && (
                <GateProgress dealId={authChat.activeDealId} currentGate={authChat.currentGate} />
              )}

              {/* Chat pane: on DESKTOP body is always dark charcoal, so chat must
                  always be force-dark. On MOBILE, body matches the theme (white in
                  light mode, dark in dark mode), so we only force dark when dark===true. */}
              <div className={(!isMobile || dark) ? 'force-chat-dark' : ''}>
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
                dark={!isMobile ? true : dark}
              />
              </div>

              {user && authChat.paywallData && authChat.activeDealId && (
                <div className="px-4 mb-4">
                  <PaywallCard
                    paywall={authChat.paywallData}
                    dealId={authChat.activeDealId}
                    onUnlocked={(toGate, deliverableId) => {
                      authChat.setPaywallData(null);
                      if (deliverableId) { openCanvasTab('deliverable', 'Deliverable', { deliverableId }); window.history.pushState({ artifact: true }, ''); }
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

          {/* NDA Modal */}
          {ndaRequired && (
            <NDAModal
              dealId={ndaRequired.dealId}
              dealName={ndaRequired.dealName}
              onAccept={() => setNdaRequired(null)}
              onDecline={() => { setNdaRequired(null); setViewState('chat'); navigate('/chat'); }}
            />
          )}

          {/* Tool views now render as canvas tabs */}
        </div>

        {/* ════ CHATDOCK — chat mode ════
            Desktop: flex sibling at bottom of chat column, forced dark.
            Mobile: portaled to document.body so ancestor transforms (keyboard handling,
            future backdrop-filter glass, etc.) can't yank the fixed pill off the viewport.

            ╔══════════════════════════════════════════════════════════════════════╗
            ║ iOS PWA mobile chat dock — LOAD-BEARING SETUP, see                   ║
            ║ memory/architecture_ios_pwa_pill.md before modifying.                ║
            ║ Same rules as the home pill: portal + fixed bottom:0 + safe-area     ║
            ║ padding + no JS viewport tracking.                                   ║
            ╚══════════════════════════════════════════════════════════════════════╝ */}
        {showDock && viewState === 'chat' && !isMobile && (
          <div
            className="force-chat-dark shrink-0 px-4 pt-2"
            style={{ paddingBottom: 16, touchAction: 'manipulation' }}
          >
            <ChatDock
              ref={dockRef}
              onSend={handleSend}
              onFileUpload={user ? handleFileUpload : undefined}
              variant="hero"
              rows={1}
              placeholder="Reply to Yulia..."
              disabled={sending}
            />
          </div>
        )}
        {showDock && viewState === 'chat' && isMobile && createPortal(
          <div
            id="mobile-chat-dock-portal"
            className={`${dark ? 'force-chat-dark' : ''} px-3 pt-3`}
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
              paddingBottom: 'env(safe-area-inset-bottom)',
              touchAction: 'manipulation',
            }}
          >
            {/* Pink gradient halo for depth — matches the home mobile pill.
                Wrapped in .relative group so the absolute glow positions to the pill rect. */}
            <div className="relative group">
              <div className={`absolute -inset-1 bg-gradient-to-r from-[#D44A78] to-[#E8709A] rounded-full blur transition duration-1000 ${dark ? 'opacity-40 group-hover:opacity-60' : 'opacity-[0.18] group-hover:opacity-[0.28]'} pointer-events-none`} />
              <div className="relative">
                <ChatDock
                  ref={dockRef}
                  onSend={handleSend}
                  onFileUpload={user ? handleFileUpload : undefined}
                  variant="hero"
                  rows={1}
                  placeholder="Reply to Yulia..."
                  disabled={sending}
                />
              </div>
            </div>
          </div>,
          document.body
        )}

        </div>{/* end chat column */}

        {/* ════ RESIZE HANDLE — vertical dots on the canvas card edge ════ */}
        {!isMobile && viewState === 'chat' && (
          <div
            className="resize-handle group"
            onMouseDown={handleResizeStart}
            style={{
              width: 14,
              cursor: 'col-resize',
              background: 'transparent',
              flexShrink: 0,
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              className="resize-dots"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                opacity: 0.35,
                transition: 'opacity 0.15s ease',
              }}
            >
              <div style={{ width: 3, height: 3, borderRadius: '50%', background: dark ? '#A0A0A0' : '#7A766E' }} />
              <div style={{ width: 3, height: 3, borderRadius: '50%', background: dark ? '#A0A0A0' : '#7A766E' }} />
              <div style={{ width: 3, height: 3, borderRadius: '50%', background: dark ? '#A0A0A0' : '#7A766E' }} />
              <div style={{ width: 3, height: 3, borderRadius: '50%', background: dark ? '#A0A0A0' : '#7A766E' }} />
            </div>
          </div>
        )}

        {/* ════ DESKTOP CANVAS PANEL — tabbed, always visible on desktop ════ */}
        {!isMobile && viewState === 'chat' && (
          <div
            className="flex min-w-0"
            style={{
              flex: 1,
              background: 'transparent',
              position: 'relative',
              padding: '16px 16px 16px 16px',
            }}
          >
            {/* The active card — sharp 1px border + tight defined shadow */}
            <div
              ref={canvasCardRef}
              className="flex-1 flex flex-col min-w-0 overflow-hidden relative"
              style={{
                background: dark ? '#151617' : '#FFFFFF',
                border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #E5E1D9',
                borderRadius: 14,
                boxShadow: dark
                  ? '0 1px 2px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.25)'
                  : '0 1px 2px rgba(60,55,45,0.06), 0 4px 8px rgba(60,55,45,0.04)',
                zIndex: 1,
              }}
            >
              {canvasTabs.length > 0 ? (
                <>
                  {/* Floating toolbar — appears for tab types that need actions */}
                  {activeCanvasTab && (() => {
                    const actions = getToolbarActionsFor(activeCanvasTab);
                    return actions.length > 0 ? <CanvasToolbar actions={actions} dark={dark} /> : null;
                  })()}
                  {/* All tabs mounted, only active visible */}
                  <div className="flex-1 overflow-y-auto relative">
                    {canvasTabs.map(tab => (
                      <div key={tab.id} className="absolute inset-0 overflow-y-auto" style={{ display: tab.id === activeCanvasTabId ? 'block' : 'none' }}>
                        {renderCanvasTabContent(tab)}
                      </div>
                    ))}
                  </div>
                  {/* Floating tab bar — content tabs only, hover-near to show */}
                  {(() => {
                    const PANEL_TYPES = new Set(['pipeline', 'dataroom', 'documents', 'sourcing', 'settings', 'seller-dashboard', 'buyer-pipeline']);
                    const contentTabs = canvasTabs.filter(t => !PANEL_TYPES.has(t.type));
                    return (
                      <FloatingTabBar
                        tabs={contentTabs}
                        activeTabId={activeCanvasTabId}
                        onSelect={setActiveCanvasTabId}
                        onClose={closeCanvasTab}
                        containerRef={canvasCardRef}
                        dark={dark}
                      />
                    );
                  })()}
                </>
              ) : !user ? (
                /* Logged-out: render the active journey page in the canvas */
                <div className="flex-1 overflow-y-auto relative">
                  <Suspense fallback={<BelowSkeleton />}>
                    {(() => {
                      // Default to 'sell' if activeTab is 'home' (no canvas content for home post-morph)
                      const journey = activeTab === 'home' ? 'sell' : activeTab;
                      switch (journey) {
                        case 'sell': return <SellBelow dark={dark} />;
                        case 'buy': return <BuyBelow dark={dark} />;
                        case 'raise': return <RaiseBelow dark={dark} />;
                        case 'integrate': return <IntegrateBelow dark={dark} />;
                        case 'advisors': return <AdvisorsBelow dark={dark} />;
                        case 'how-it-works': return <HowItWorksBelow dark={dark} />;
                        case 'pricing': return <PricingBelow dark={dark} />;
                        default: return <SellBelow dark={dark} />;
                      }
                    })()}
                  </Suspense>
                </div>
              ) : (
                /* Logged-in empty state */
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 24 }}>
                  <img
                    src={dark ? '/G3D.png' : '/G3L.png'}
                    alt="smbx.ai"
                    draggable={false}
                    style={{ height: 48, objectFit: 'contain', opacity: 0.35 }}
                  />
                  <p className="font-body text-[15px] font-medium" style={{ color: dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)', margin: 0 }}>
                    Ask Yulia to open a tool
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        </div>{/* end main row */}

        {/* ════ MOBILE CANVAS OVERLAY ════ */}
        {canvasTabs.length > 0 && isMobile && mobileCanvasVisible && (
          <div
            className={`fixed inset-0 z-40 flex flex-col ${dark ? 'bg-[#151617]' : 'bg-white'}`}
            style={{
              animation: 'slideUpIn 0.3s ease',
              overscrollBehavior: 'contain',
              touchAction: 'manipulation',
              paddingTop: 'calc(env(safe-area-inset-top) + 64px)', // clear floating hamburger
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            {/* Active tab content — no header, swipe back to return to chat */}
            <div
              className="flex-1 overflow-y-auto"
              style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
            >
              {activeCanvasTab && renderCanvasTabContent(activeCanvasTab)}
            </div>
            {/* Mobile floating tab bar — only when there are content tabs */}
            {(() => {
              const PANEL_TYPES = new Set(['pipeline', 'dataroom', 'documents', 'sourcing', 'settings', 'seller-dashboard', 'buyer-pipeline']);
              const contentTabs = canvasTabs.filter(t => !PANEL_TYPES.has(t.type));
              if (contentTabs.length === 0) return null;
              return (
                <div
                  className="shrink-0 flex justify-center"
                  style={{
                    padding: '8px 12px max(12px, env(safe-area-inset-bottom)) 12px',
                    borderTop: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <div
                    className="flex items-center gap-1 overflow-x-auto"
                    style={{
                      maxWidth: '100%',
                      scrollbarWidth: 'none',
                      background: dark ? '#151617' : '#FFFFFF',
                      border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #E5E1D9',
                      borderRadius: 100,
                      padding: '4px',
                    }}
                  >
                    {contentTabs.map(tab => {
                      const isActive = tab.id === activeCanvasTabId;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveCanvasTabId(tab.id)}
                          className="shrink-0 active:scale-95"
                          style={{
                            padding: '6px 14px',
                            borderRadius: 100,
                            border: 'none',
                            background: isActive
                              ? (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)')
                              : 'transparent',
                            color: isActive
                              ? (dark ? '#F0F0F3' : '#1A1C1E')
                              : (dark ? '#A0A0A0' : '#5D5E61'),
                            fontSize: 12,
                            fontWeight: isActive ? 600 : 500,
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            fontFamily: "'Inter', system-ui, sans-serif",
                          }}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Global keyframe animations */}
      <style>{`
        .hero-send-btn {
          background: #D8D8DA;
          color: rgba(0,0,0,0.3);
          pointer-events: none;
        }
        input:not(:placeholder-shown) + .hero-send-btn,
        input:focus:not(:placeholder-shown) + .hero-send-btn {
          background: #D44A78;
          color: #fff;
          pointer-events: auto;
        }
        /* X logo button: hover highlight + spin-once on click */
        .sidebar-x-btn {
          position: relative;
          transition: background 0.2s ease;
        }
        .sidebar-x-btn::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 14px;
          background: radial-gradient(circle at center, rgba(212,74,120,0.18), rgba(212,74,120,0) 70%);
          opacity: 0;
          transition: opacity 0.25s ease;
          pointer-events: none;
        }
        .sidebar-x-btn:hover::before { opacity: 1; }
        .sidebar-x-img {
          transition: transform 0.6s cubic-bezier(0.34, 1.2, 0.64, 1);
          position: relative;
          z-index: 1;
        }
        .sidebar-x-btn:hover .sidebar-x-img {
          transform: scale(1.08);
        }
        .sidebar-x-btn:active .sidebar-x-img {
          animation: xSpin 0.6s cubic-bezier(0.34, 1.2, 0.64, 1);
        }
        @keyframes xSpin {
          from { transform: rotate(0deg) scale(1.08); }
          to { transform: rotate(360deg) scale(1.08); }
        }

        /* Sidebar icon buttons: subtle press feedback with brief flash */
        .sidebar-icon-btn {
          position: relative;
          transition: transform 0.12s ease, background-color 0.18s ease, color 0.18s ease;
        }
        .sidebar-icon-btn:active:not(:disabled) {
          transform: scale(0.9);
        }
        .sidebar-icon-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: currentColor;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s ease;
        }
        .sidebar-icon-btn:active::after {
          opacity: 0.10;
          transition: opacity 0.05s ease;
        }
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
        .resize-handle:hover .resize-dots,
        .resize-handle:active .resize-dots {
          opacity: 0.8 !important;
        }
      `}</style>

      {/* ═══ NEW MOBILE SIDEBAR — Vaul-powered, Claude+ pattern ═══ */}
      {isMobile && (
        <MobileSidebar
          open={isMobileSidebarOpen}
          onOpenChange={setIsMobileSidebarOpen}
          dark={dark}
          isLoggedIn={!!user}
          onHomeTap={() => {
            setMobileWorkspaceOpen(null);
            setMobileJourneyOpen(null);
            setLearnDrawerOpen(false);
            setViewState('landing');
            setActiveTab('home');
            navigate('/');
          }}
          dealGroups={user && authChat.grouped
            ? authChat.grouped.deals.map(d => ({
                id: d.id,
                journey_type: d.journey_type,
                current_gate: d.current_gate,
                business_name: d.business_name,
                industry: d.industry,
                conversations: d.conversations.map((c: any) => ({
                  id: c.id,
                  title: c.title || 'Conversation',
                  summary: c.summary || undefined,
                  gate_label: c.gate_label || undefined,
                  gate_status: c.gate_status || undefined,
                  active: c.id === activeConvId,
                })),
              }))
            : []
          }
          generalChats={user && authChat.grouped
            ? authChat.grouped.general.map((c: any) => ({
                id: c.id,
                title: c.title || 'General Q&A',
                active: c.id === activeConvId,
              }))
            : []
          }
          chats={[]}
          activeConversationId={activeConvId}
          userName={user?.display_name}
          userEmail={user?.email}
          onNewDeal={handleNewChat}
          onNewChat={handleNewChat}
          onChatTap={(id) => {
            setMobileCanvasVisible(false);
            setViewState('chat');
            if (user) authChat.selectConversation(id);
            navigate(`/chat/${id}`);
          }}
          onGeneralChat={async () => {
            const id = await authChat.openGeneral();
            if (id) {
              setViewState('chat');
              navigate(`/chat/${id}`);
            }
          }}
          onWorkspaceTap={(tool) => setMobileWorkspaceOpen(tool)}
          onLearnTap={(dest) => setMobileJourneyOpen(dest)}
          onProfileTap={() => {
            if (user) openCanvasTab('settings', 'Settings');
            else window.location.href = '/login';
          }}
          onSettingsTap={() => {
            if (user) openCanvasTab('settings', 'Settings');
            else window.location.href = '/login';
          }}
          onSignIn={() => { window.location.href = '/login'; }}
          onDarkModeToggle={() => setDark(!dark)}
        />
      )}

      {/* ═══ MOBILE ACCOUNT SHEET — replaces the hamburger menu ═══ */}
      {isMobile && user && (
        <AccountSheet
          open={accountSheetOpen}
          onOpenChange={setAccountSheetOpen}
          dark={dark}
          user={{
            display_name: user.display_name,
            email: user.email,
            plan: (user as any).plan,
          }}
          onToggleDark={() => setDark(!dark)}
          onSignOut={handleLogout}
          onOpenSupport={() => { setAccountSheetOpen(false); setHelpSheetOpen(true); }}
        />
      )}

      {/* ═══ MOBILE HELP SHEET — Yulia overview + M&A glossary ═══ */}
      {isMobile && (
        <HelpSheet
          open={helpSheetOpen}
          onOpenChange={setHelpSheetOpen}
          dark={dark}
        />
      )}

      {/* ═══ MOBILE SIGN-IN SHEET — top-right login icon opens this for guests ═══ */}
      {isMobile && !user && (
        <SignInSheet
          open={signInSheetOpen}
          onOpenChange={setSignInSheetOpen}
          dark={dark}
          onSignIn={() => { window.location.href = '/login'; }}
        />
      )}

      {/* ═══ MOBILE TOAST HOST — singleton, lifts above the portaled chat pill ═══ */}
      {isMobile && <ToastHost />}

      {/* ═══ MOBILE DEAL ACTIONS SHEET — long-press on a deal card opens this ═══ */}
      {isMobile && user && (
        <DealActionsSheet
          open={dealActionsTargetId !== null}
          onOpenChange={(o) => { if (!o) setDealActionsTargetId(null); }}
          dark={dark}
          dealName={(() => {
            const d = authChat.grouped?.deals.find(x => x.id === dealActionsTargetId);
            return d?.business_name || null;
          })()}
          onShare={typeof navigator !== 'undefined' && (navigator as any).share ? () => {
            const d = authChat.grouped?.deals.find(x => x.id === dealActionsTargetId);
            if (!d) return;
            (navigator as any).share({
              title: d.business_name || 'smbx.ai deal',
              url: window.location.origin + '/chat',
            }).catch(() => {});
          } : undefined}
        />
      )}

      {/* ═══ MOBILE ARTIFACT SHEET — Vaul full-screen viewer for Yulia deliverables ═══ */}
      {isMobile && (
        <ArtifactSheet
          open={!!artifactSheet}
          onOpenChange={(o) => { if (!o) setArtifactSheet(null); }}
          dark={dark}
          title={artifactSheet?.title || ''}
          subtitle={artifactSheet?.subtitle}
          icon="description"
          onAskYulia={(prefill) => {
            dockRef.current?.clear();
            handleSend(prefill);
          }}
          onShare={typeof navigator !== 'undefined' && (navigator as any).share ? () => {
            (navigator as any).share({
              title: artifactSheet?.title,
              text: artifactSheet?.content?.slice(0, 500),
            }).catch(() => {});
          } : undefined}
        >
          {artifactSheet?.content ? (
            <Markdown>{artifactSheet.content}</Markdown>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px 24px',
              minHeight: 320,
              textAlign: 'center',
              gap: 12,
              color: dark ? 'rgba(240,240,243,0.55)' : 'rgba(26,28,30,0.55)',
            }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <p style={{ margin: 0, fontSize: 14 }}>
                Yulia hasn't written this yet.
              </p>
            </div>
          )}
        </ArtifactSheet>
      )}

      {/* ═══ NEW MOBILE LEARN DRAWER — browser only, NOT in PWA ═══ */}
      {isMobile && !isPWA && (
        <LearnDrawer
          open={learnDrawerOpen}
          onOpenChange={setLearnDrawerOpen}
          dark={dark}
          onPick={(dest) => setMobileJourneyOpen(dest)}
        />
      )}

      {/* ═══ MOBILE JOURNEY SHEETS — browser only, stripped from PWA ═══ */}
      {isMobile && !isPWA && (
        <MobileSellPage
          open={mobileJourneyOpen === 'sell'}
          onOpenChange={(o) => !o && setMobileJourneyOpen(null)}
          dark={dark}
          onTalkToYulia={(prefill) => {
            setMobileJourneyOpen(null);
            if (prefill) {
              setTimeout(() => fillHomeInput(prefill), 350);
            }
          }}
        />
      )}

      {/* ═══ NEW MOBILE WORKSPACE SHEETS ═══ */}
      {isMobile && mobileWorkspaceOpen && (
        <MobileWorkspaceSheet
          open={true}
          onOpenChange={(o) => !o && setMobileWorkspaceOpen(null)}
          dark={dark}
          icon={
            mobileWorkspaceOpen === 'documents' ? 'lock' :
            mobileWorkspaceOpen === 'library'   ? 'auto_awesome' :
            mobileWorkspaceOpen === 'analysis'  ? 'analytics' :
            mobileWorkspaceOpen === 'sourcing'  ? 'travel_explore' :
            'view_kanban'
          }
          title={
            mobileWorkspaceOpen === 'documents' ? 'Data Room' :
            mobileWorkspaceOpen === 'library'   ? 'Deliverables' :
            mobileWorkspaceOpen === 'analysis'  ? 'Market Intel' :
            mobileWorkspaceOpen === 'sourcing'  ? 'Sourcing' :
            'Pipeline'
          }
          subtitle={
            mobileWorkspaceOpen === 'documents' ? 'Uploaded files, shared access, NDA gates' :
            mobileWorkspaceOpen === 'library'   ? 'CIMs, valuations, term sheets Yulia built' :
            mobileWorkspaceOpen === 'analysis'  ? 'Census, SBA, comps, economic indicators' :
            mobileWorkspaceOpen === 'sourcing'  ? 'Acquisition targets, scored & ranked' :
            'Active deals across all your journeys'
          }
        >
          {user ? (
            <>
              {mobileWorkspaceOpen === 'documents' && <DataRoom dealId={null} onViewDeliverable={() => {}} />}
              {mobileWorkspaceOpen === 'library'   && <DocumentLibrary />}
              {mobileWorkspaceOpen === 'analysis'  && <IntelPanel isFullscreen />}
              {mobileWorkspaceOpen === 'sourcing'  && <SourcingPanel isFullscreen />}
              {mobileWorkspaceOpen === 'pipeline'  && <PipelinePanel isFullscreen />}
            </>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-sm" style={{ color: dark ? 'rgba(218,218,220,0.6)' : '#7c7d80' }}>
                Sign in to access this workspace.
              </p>
            </div>
          )}
        </MobileWorkspaceSheet>
      )}

      {/* All 7 mobile journey pages — browser only, stripped from PWA.
          By the time the user is in PWA, they're signed up and don't need
          marketing content. The journey pages live in the browser experience. */}
      {isMobile && !isPWA && (
        <>
          <MobileBuyPage
            open={mobileJourneyOpen === 'buy'}
            onOpenChange={(o) => !o && setMobileJourneyOpen(null)}
            dark={dark}
            onTalkToYulia={(prefill) => {
              setMobileJourneyOpen(null);
              if (prefill) setTimeout(() => fillHomeInput(prefill), 350);
            }}
          />
          <MobileRaisePage
            open={mobileJourneyOpen === 'raise'}
            onOpenChange={(o) => !o && setMobileJourneyOpen(null)}
            dark={dark}
            onTalkToYulia={(prefill) => {
              setMobileJourneyOpen(null);
              if (prefill) setTimeout(() => fillHomeInput(prefill), 350);
            }}
          />
          <MobileIntegratePage
            open={mobileJourneyOpen === 'integrate'}
            onOpenChange={(o) => !o && setMobileJourneyOpen(null)}
            dark={dark}
            onTalkToYulia={(prefill) => {
              setMobileJourneyOpen(null);
              if (prefill) setTimeout(() => fillHomeInput(prefill), 350);
            }}
          />
          <MobileAdvisorsPage
            open={mobileJourneyOpen === 'advisors'}
            onOpenChange={(o) => !o && setMobileJourneyOpen(null)}
            dark={dark}
            onTalkToYulia={(prefill) => {
              setMobileJourneyOpen(null);
              if (prefill) setTimeout(() => fillHomeInput(prefill), 350);
            }}
          />
          <MobileHowItWorksPage
            open={mobileJourneyOpen === 'how-it-works'}
            onOpenChange={(o) => !o && setMobileJourneyOpen(null)}
            dark={dark}
            onTalkToYulia={(prefill) => {
              setMobileJourneyOpen(null);
              if (prefill) setTimeout(() => fillHomeInput(prefill), 350);
            }}
          />
          <MobilePricingPage
            open={mobileJourneyOpen === 'pricing'}
            onOpenChange={(o) => !o && setMobileJourneyOpen(null)}
            dark={dark}
            onTalkToYulia={(prefill) => {
              setMobileJourneyOpen(null);
              if (prefill) setTimeout(() => fillHomeInput(prefill), 350);
            }}
          />
        </>
      )}

      {/* ═══ MOBILE CANVAS DRAWER (right side) — DISABLED on mobile.
          The left sidebar's Workspace section replaces it. Keeping the code
          but gating it so it never renders on mobile. Desktop canvas drawer
          is separate and unaffected. ═══ */}
      {false && isMobile && isMobileCanvasDrawerOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/40"
            onClick={() => setIsMobileCanvasDrawerOpen(false)}
            style={{ animation: 'fadeOnly 0.2s ease' }}
          />
          <nav
            className={`fixed top-0 right-0 bottom-0 z-[61] w-64 flex flex-col py-12 px-6 overflow-y-auto ${dark ? 'bg-[#1a1c1e] border-l border-zinc-800' : 'bg-white border-l border-[#eeeef0] shadow-xl'}`}
            style={{ animation: 'slideInRight 0.25s ease' }}
          >
            <button
              onClick={() => setIsMobileCanvasDrawerOpen(false)}
              className={`absolute top-4 left-4 bg-transparent border-none cursor-pointer p-0 ${dark ? 'text-[#f0f0f3]/70' : 'text-[#1a1c1e]/70'}`}
              type="button"
              aria-label="Close canvas menu"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-4 mt-2 ${dark ? 'text-zinc-500' : 'text-[#636467]'}`}>Canvas Tools</span>
            {user ? (
              <>
                {([
                  { type: 'documents', icon: 'folder_open', label: 'Library' },
                  { type: 'dataroom', icon: 'lock', label: 'Data Room' },
                  { type: 'pipeline', icon: 'view_kanban', label: 'Pipeline' },
                  { type: 'sourcing', icon: 'search', label: 'Sourcing' },
                ]).map(item => (
                  <button
                    key={item.type}
                    onClick={() => { setIsMobileCanvasDrawerOpen(false); openCanvasTab(item.type, item.label); }}
                    className={`flex items-center gap-3 py-3 px-3 rounded-xl text-left transition-all border-none cursor-pointer text-sm font-medium ${dark ? 'text-zinc-400 hover:text-white bg-transparent' : 'text-[#636467] hover:text-[#1a1c1e] bg-transparent'}`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
                {canvasTabs.length > 0 && (
                  <>
                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-2 mt-6 ${dark ? 'text-zinc-500' : 'text-[#636467]'}`}>Open Tabs</span>
                    {canvasTabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => { setIsMobileCanvasDrawerOpen(false); setActiveCanvasTabId(tab.id); }}
                        className={`flex items-center gap-3 py-3 px-3 rounded-xl text-left transition-all border-none cursor-pointer text-sm font-medium ${
                          tab.id === activeCanvasTabId
                            ? (dark ? 'text-rose-500 bg-rose-500/10' : 'text-[#D44A78] bg-[#D44A78]/5')
                            : (dark ? 'text-zinc-400 hover:text-white bg-transparent' : 'text-[#636467] hover:text-[#1a1c1e] bg-transparent')
                        }`}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[20px]">tab</span>
                        <span className="truncate">{tab.label}</span>
                      </button>
                    ))}
                  </>
                )}
              </>
            ) : (
              <p className={`text-sm ${dark ? 'text-zinc-500' : 'text-[#636467]'}`}>Sign in to access canvas tools.</p>
            )}
          </nav>
        </>
      )}

      {/* Mobile hamburger removed per Wallet-home plan — deals live on the home
          surface, not in a drawer menu. Account actions (sign out, dark mode,
          subscription, settings) now accessible via the top-right avatar button
          below → AccountSheet (Vaul). Only rendered when user is logged in. */}
      {isMobile && user && (
        <button
          onClick={() => setAccountSheetOpen(true)}
          type="button"
          aria-label="Account"
          className="active:scale-90"
          style={{
            position: 'fixed',
            top: 'calc(env(safe-area-inset-top) + 12px)',
            right: 16,
            zIndex: 55,
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${dark ? '#E8709A' : '#D44A78'}, #E8709A)`,
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Sora, system-ui',
            fontSize: 14,
            fontWeight: 800,
            boxShadow: '0 4px 12px rgba(212,74,120,0.28)',
            transition: 'transform 120ms',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {(user.display_name || user.email || 'Y').trim().charAt(0).toUpperCase()}
        </button>
      )}

      {/* Logged-out mirror: iOS-convention login icon top-right → SignInSheet.
          Same placement as the avatar so users find the account affordance in
          the same spot regardless of auth state. */}
      {isMobile && !user && (
        <button
          onClick={() => setSignInSheetOpen(true)}
          type="button"
          aria-label="Sign in"
          className="active:scale-90"
          style={{
            position: 'fixed',
            top: 'calc(env(safe-area-inset-top) + 12px)',
            right: 16,
            zIndex: 55,
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: dark ? '#1f2123' : '#ffffff',
            color: dark ? '#E8709A' : '#D44A78',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)'}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: dark ? 'none' : '0 1px 4px rgba(26,28,30,0.06)',
            transition: 'transform 120ms',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>person</span>
        </button>
      )}

      {/* PWA install lock removed — users can install to home screen if they want,
          but we no longer force it. Too many downsides: share-links break, first-run
          friction, Apple nerfs PWAs anyway. See memory/feedback_lean_into_ios.md. */}

      {/* Floating logo removed — X logo now lives in sidebar permanently */}

      {/* ═══ FLOATING CTA — "Start chatting" ═══ */}
      {!user && viewState === 'landing' && activeTab !== 'home' && (
        isMobile ? (
          /* Mobile: bottom-right FAB — only on landing pages, not chat */
          <button
            onClick={() => handleTabClick('home')}
            className="fixed z-50 flex items-center gap-2 border-none cursor-pointer text-white font-headline text-[14px] font-bold shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
            style={{ bottom: 'calc(24px + env(safe-area-inset-bottom))', right: 16, background: 'linear-gradient(135deg, #D44A78, #E8709A)', borderRadius: '100px', padding: '14px 22px' }}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
            Start chatting
          </button>
        ) : (
          /* Desktop: pill next to dark mode toggle, top-right */
          <button
            onClick={() => handleTabClick('home')}
            className="fixed z-50 flex items-center gap-2 border-none cursor-pointer text-white font-headline text-[13px] font-bold shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
            style={{ top: 16, right: 64, background: 'linear-gradient(135deg, #D44A78, #E8709A)', borderRadius: '100px', padding: '9px 20px' }}
            type="button"
          >
            Start chatting
          </button>
        )
      )}

      {/* Dark mode toggle lives in the sidebar (desktop + mobile menu) for all users.
          The floating top-right toggle was removed — it kept overlapping content. */}

      {flyingLogo && (() => {
        const letters = [
          { ch: 's', color: '#1A1A18', weight: 700 },
          { ch: 'm', color: '#1A1A18', weight: 700 },
          { ch: 'b', color: '#1A1A18', weight: 700 },
          { ch: 'x', color: '#D44A78', weight: 800 },
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

// ─── Canvas Tab Icon ────────────────────────────────────────────────

function CircuitSparks({ dark }: { dark: boolean }) {
  const sparkColor = dark ? '#E8709A' : '#D44A78';
  const sparks = [
    { left: '14%', top: '72%', delay: '0s', duration: '4.5s' },
    { left: '82%', top: '18%', delay: '2.2s', duration: '5.8s' },
    { left: '88%', top: '78%', delay: '3.8s', duration: '6.2s' },
  ];
  return (
    <>
      <style>{`
        @keyframes circuit-spark {
          0%, 85%, 100% { opacity: 0; transform: scale(0.5); }
          90% { opacity: 0.8; transform: scale(1); }
          95% { opacity: 0.3; transform: scale(1.6); }
        }
      `}</style>
      {sparks.map((s, i) => (
        <div key={i} style={{
          position: 'absolute', left: s.left, top: s.top, width: 6, height: 6,
          borderRadius: '50%', background: sparkColor, zIndex: 2, pointerEvents: 'none',
          boxShadow: `0 0 8px 3px ${sparkColor}40, 0 0 20px 6px ${sparkColor}20`,
          animation: `circuit-spark ${s.duration} ${s.delay} ease-in-out infinite`, opacity: 0,
        }} />
      ))}
    </>
  );
}

function CanvasTabIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    pipeline: 'view_kanban',
    dataroom: 'lock',
    documents: 'folder_open',
    sourcing: 'search',
    settings: 'settings',
    'seller-dashboard': 'storefront',
    'buyer-pipeline': 'shopping_bag',
    analytics: 'bar_chart',
    deliverable: 'description',
    markdown: 'article',
  };
  return (
    <span className="material-symbols-outlined text-[18px]">
      {icons[type] || 'tab'}
    </span>
  );
}
