import { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { trackEvent } from '../../lib/analytics';
import { useAuth, authHeaders } from '../../hooks/useAuth';
import { useAnonymousChat, type AnonMessage } from '../../hooks/useAnonymousChat';
import { useAuthChat } from '../../hooks/useAuthChat';
import { useAppHeight } from '../../hooks/useAppHeight';
import { useDarkMode, DarkModeToggle } from '../../components/shared/DarkModeToggle';
import ChatDock, { type ChatDockHandle } from '../../components/shared/ChatDock';
import ChatMessages from '../../components/shell/ChatMessages';
// Dot grid now lives on body in index.css — no component needed
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
// Subscription model — no wallet, no per-deal fees
import DocumentLibrary from '../../components/chat/DocumentLibrary';
import AnalyticsView from '../../components/chat/AnalyticsView';
import NDAModal from '../../components/chat/NDAModal';
import SourcingPanel from '../../components/chat/SourcingPanel';
import IntelPanel from '../../components/chat/IntelPanel';
import DealMessagesPanel from '../../components/documents/DealMessagesPanel';
import CanvasTabBar from '../../components/canvas/CanvasTabBar';
import { ModelRenderer } from '../../components/models';
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
  sell: '#D44A78',
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
  const isChat = viewState === 'chat';
  const { appOffset } = useAppHeight(isChat);   // Only constrain viewport in chat mode
  const [activeTab, setActiveTab] = useState<TabId>(() => pathToTab(location));

  // Toggle chat-mode class on <html> — landing pages use natural body scroll,
  // chat mode uses constrained viewport for keyboard handling
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

  // Conversation id ref — written by an effect later, read by tab callbacks
  const conversationIdRef = useRef<number | null>(null);
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

  // Subscription model — no wallet balance needed

  // Send handler — morph from landing to chat
  const handleSend = useCallback((content: string) => {
    if (viewState === 'landing') {
      if (user) authChat.sendMessage(content);
      else anonChat.sendMessage(content, activeTab);
      if (isMobile) {
        // Mobile: instant swap, no morphing — chat fade-in handles the transition
        setViewState('chat');
        if (window.location.pathname !== '/chat') navigate('/chat'); // push: landing→chat
      } else {
        // Desktop: smooth morph-out then swap
        setMorphing(true);
        setTimeout(() => {
          setViewState('chat');
          setMorphing(false);
          if (window.location.pathname !== '/chat') navigate('/chat'); // push: landing→chat
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

  // Tab click — push so swipe-back returns to where user came from
  const handleTabClick = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setViewState('landing');
    setIsMobileSidebarOpen(false);
    const urlMap: Record<TabId, string> = { home: '/', sell: '/sell', buy: '/buy', raise: '/raise', integrate: '/integrate', 'how-it-works': '/how-it-works', advisors: '/advisors', pricing: '/pricing' };
    if (window.location.pathname !== urlMap[tab]) navigate(urlMap[tab]);
  }, [navigate]);

  // New chat — same-level within chat, replace history
  const handleNewChat = useCallback(() => {
    if (user) authChat.newConversation();
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
    openCanvasTab('markdown', LABELS[type || ''] || 'Document', { content: msg.content });
    window.history.pushState({ artifact: true }, '');
  }, []);

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
    };

    window.addEventListener('smbx:canvas_action', handler);
    return () => window.removeEventListener('smbx:canvas_action', handler);
  }, [openCanvasTab]);

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
      className={`hidden lg:flex flex-col h-screen w-20 fixed left-0 top-0 z-50 items-center py-6 ${dark ? 'bg-zinc-950' : 'bg-white'}`}
      style={{
        borderRight: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
        // Soft lift shadow on the right edge — sidebar floats slightly above the chat
        boxShadow: dark
          ? '4px 0 20px rgba(0,0,0,0.4), 1px 0 0 rgba(255,255,255,0.02)'
          : '4px 0 20px rgba(0,0,0,0.04), 1px 0 0 rgba(0,0,0,0.02)',
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

      {/* Chats section */}
      <div className="flex flex-col items-center gap-1 w-full px-2 flex-1 min-h-0">
        <span className={`text-[9px] font-bold uppercase tracking-widest mb-2 ${dark ? 'text-zinc-500' : 'text-[#5a4044]'}`}>Chats</span>
        {user && (
        <button
          onClick={() => { handleNewChat(); }}
          className={`sidebar-icon-btn w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 border-none cursor-pointer transition-all ${dark ? 'text-rose-500 bg-rose-500/10' : 'text-[#D44A78] bg-[#D44A78]/5'}`}
          title="New Chat"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">add_comment</span>
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
          title="Chat History"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">forum</span>
          <span className="text-[9px] font-semibold">History</span>
        </button>
      </div>

      {/* Bottom: Admin + Account */}
      <div className="flex flex-col items-center gap-1 mt-auto pt-4">
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

  // ─── Mobile swipe gestures with edge guard (gestures from inside viewport, not edges) ───
  useEffect(() => {
    if (!isMobile) return;
    let startX = 0;
    let startY = 0;
    let startT = 0;
    let trackable = false;

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      startT = Date.now();
      // Track swipes that start INSIDE the safe zone (40-120px from edges)
      // This avoids fighting iOS edge back-swipe which lives in 0-30px
      const w = window.innerWidth;
      trackable = (startX > 40 && startX < 120) || (startX > w - 120 && startX < w - 40);
    };

    const onEnd = (e: TouchEvent) => {
      if (!trackable) return;
      trackable = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      const dt = Date.now() - startT;
      if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx) || dt > 600) return;
      if (dx > 0 && startX < 120 && !isMobileSidebarOpen && !isMobileCanvasDrawerOpen) {
        setIsMobileSidebarOpen(true);
      } else if (dx < 0 && startX > window.innerWidth - 120 && !isMobileSidebarOpen && !isMobileCanvasDrawerOpen) {
        setIsMobileCanvasDrawerOpen(true);
      }
    };

    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchend', onEnd);
    };
  }, [isMobile, isMobileSidebarOpen, isMobileCanvasDrawerOpen]);

  return (
    <div
      id="app-root"
      className={`flex font-sans bg-transparent ${dark ? 'text-[#f0f0f3]' : 'text-[#1a1c1e]'}`}
      style={{
        width: '100%',
        ...(isChat ? { height: '100%' } : {}),
        paddingTop: 'env(safe-area-inset-top)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        overscrollBehaviorX: 'contain',
        ...(appOffset ? { transform: `translateY(${appOffset}px)` } : {}),
      }}
    >
      {/* Desktop sidebar — fixed 80px icon rail */}
      {sidebarContent(false)}

      {/* Main canvas — offset by 80px sidebar on desktop */}
      <div className={`flex-1 flex flex-col min-w-0 lg:ml-20 bg-transparent ${isChat ? 'h-full' : ''}`}>
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
        {/* Chat column — resizable on desktop in chat mode, flex on landing/other */}
        <div
          className={`flex flex-col min-w-0 ${viewState === 'chat' ? (dark ? 'bg-[#1a1c1e]' : 'bg-white') : 'bg-transparent'}`}
          style={!isMobile && viewState === 'chat' ? { width: chatWidth, flexShrink: 0 } : { flex: 1 }}
        >
        {/* Scroll area */}
        <div
          ref={scrollRef}
          className={isChat ? 'flex-1 overflow-y-auto min-h-0 bg-transparent' : 'flex-1 bg-transparent'}
          style={isChat ? { WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', paddingBottom: 'env(safe-area-inset-bottom)' } as any : { paddingBottom: 'env(safe-area-inset-bottom)' } as any}
        >
          {/* ════ LANDING MODE ════ */}
          {viewState === 'landing' && (
            <div key={activeTab} style={{ position: 'relative', animation: morphing ? (isMobile ? 'fadeOut 0.2s ease forwards' : 'morphOut 0.3s ease forwards') : activeTab === 'home' ? 'fadeOnly 0.25s ease' : 'slideUp 0.35s ease', pointerEvents: morphing ? 'none' as const : undefined, ...(activeTab === 'home' ? { display: 'flex', flexDirection: 'column' as const, minHeight: '100dvh' } : { minHeight: '100dvh' }) }}>

              {/* ═══ SHARED BACKGROUND — Grok-minimal warm paper ═══
                  Solid cream base only. Film grain comes from html/body (index.css).
                  No gradients, no glows, no atmospheric color — rose gold only
                  appears where it's intentional (H1 accents, chat pill, CTAs). */}
              <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundColor: dark ? '#151617' : '#f8f6f2', pointerEvents: 'none' }} />

              {activeTab === 'home' ? (
              <>
                {/* ═══ HOME PAGE ═══ */}
                <main className="flex-1 flex flex-col relative">
                  {/* Top cluster — centered on desktop; fixed top position on mobile so the
                      logo stays put regardless of cluster content height. Mobile uses pt-[14vh]
                      to pin the logo at ~14% of viewport height. */}
                  <div className={`flex flex-col items-center px-6 relative z-10 ${isMobile ? 'shrink-0 pt-[14vh]' : 'flex-1 justify-center'}`}>
                    <div className={`w-full text-center ${isMobile ? 'max-w-4xl' : 'max-w-3xl space-y-6'}`}>
                      {!isMobile && (
                        <div className="mb-10 flex justify-center">
                          <LogoHero height={60} dark={dark} />
                        </div>
                      )}
                      {isMobile && (
                        <div className="flex justify-center mb-20">
                          <LogoHero height={52} dark={dark} />
                        </div>
                      )}
                      <h1 className={`font-headline font-extrabold tracking-tighter ${isMobile ? 'text-[42px] leading-[1.02] mb-12' : 'text-[50px] leading-[1.05]'}`}>
                        <span className={dark ? 'text-[#E8709A]' : 'text-[#D44A78]'}>Selling</span> your business,<br/>
                        <span className={dark ? 'text-[#E8709A]' : 'text-[#D44A78]'}>buying</span> one, or{' '}
                        <span className={dark ? 'text-[#E8709A]' : 'text-[#D44A78]'}>raising</span> capital?
                      </h1>
                      <p className={`mx-auto font-medium ${isMobile ? 'text-[17px] leading-[1.5] max-w-sm' : 'text-xl'} ${dark ? 'text-zinc-400' : 'text-[#636467]'}`}>
                        Yulia handles the numbers, the documents, and the strategy<br className="hidden md:inline" /> — all by just talking to her.
                      </p>
                      <p className={`mx-auto font-medium ${isMobile ? 'text-[14px] max-w-xs' : 'text-base'} ${dark ? 'text-zinc-500' : 'text-[#636467]/70'}`}>
                        The analytical rigor of a $500K bank engagement. Through a conversation.
                      </p>

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

                  {/* Flex spacer — fills remaining space between cluster and pill zone */}
                  {isMobile && <div className="flex-1" aria-hidden />}

                  {/* Mobile bottom zone: pill + trust line pinned near the bottom.
                      Safe-area padding clears the home indicator */}
                  {isMobile && (
                    <div className="shrink-0 px-4 relative z-10" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}>
                      {/* Tool popup (drops UP from input) */}
                      <div ref={homeToolsRef} className={`home-tools-popup ${homeToolsOpen ? 'open' : ''}`} style={{ bottom: 'calc(100% + 8px)', left: 16, right: 16 }}>
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
                      {/* Gradient-glow input */}
                      <div className="relative group">
                        <div className={`absolute -inset-1 bg-gradient-to-r from-[#D44A78] to-[#E8709A] rounded-full blur transition duration-1000 ${dark ? 'opacity-40 group-hover:opacity-60' : 'opacity-[0.18] group-hover:opacity-[0.28]'}`} />
                        <div className={`relative rounded-full flex items-center p-2 pl-3 ${dark ? 'bg-zinc-900/90 border border-zinc-700 shadow-2xl' : 'bg-white border border-[#e3bdc3] shadow-xl'}`}>
                          <button
                            ref={homePlusMobileRef}
                            type="button"
                            aria-label="Tools menu"
                            aria-expanded={homeToolsOpen}
                            onClick={() => setHomeToolsOpen(p => !p)}
                            className={`h-9 w-9 rounded-full flex items-center justify-center mr-2 transition-all active:scale-95 cursor-pointer border-none ${dark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-[#f3f3f6] text-[#D44A78] hover:bg-[#e3bdc3]/40'}`}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: homeToolsOpen ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>
                              <path d="M12 5v14" /><path d="M5 12h14" />
                            </svg>
                          </button>
                          <input
                            ref={homeInputMobileRef}
                            className={`bg-transparent border-none focus:ring-0 flex-1 py-3 text-base outline-none ${dark ? 'text-white placeholder-zinc-500' : 'text-[#1a1c1e] placeholder-[#5a4044]'}`}
                            placeholder="Tell me about your business..."
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
                            className="hero-send-btn h-10 w-10 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all border-none cursor-pointer"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l7-7 7 7" /><path d="M12 19V5" /></svg>
                          </button>
                        </div>
                      </div>
                      <p className={`text-xs font-medium text-center mt-3 ${dark ? 'text-zinc-600' : 'text-[#636467]/50'}`}>
                        Free analysis · No account required · Your data stays yours
                      </p>
                    </div>
                  )}
                </main>
                {/* Scroll spacer removed — page is exactly 100dvh, pill sits at bottom of
                    visible viewport with safe-area padding for the home indicator. */}
              </>
              ) : ['sell','buy','raise','how-it-works','integrate','advisors','pricing'].includes(activeTab) ? (
              <div className="relative z-10">
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
                dark={dark}
              />

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

        {/* ════ CHATDOCK — chat mode, pinned at bottom ════ */}
        {showDock && viewState === 'chat' && (
          <div className="shrink-0 px-4 pt-2" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))', touchAction: 'manipulation' }}>
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
              width: 2, background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
              borderRadius: 1,
              transition: 'background 0.15s ease',
            }} />
          </div>
        )}

        {/* ════ DESKTOP CANVAS PANEL — tabbed, always visible on desktop ════ */}
        {!isMobile && viewState === 'chat' && (
          <div
            className="flex min-w-0"
            style={{
              flex: 1,
              // The "table" — slightly darker than the chat side, with padding
              background: dark ? '#0E0F11' : '#EDEDEA',
              position: 'relative',
              padding: '14px 16px 14px 4px',
            }}
          >
            {/* Stack hint cards — peek out from behind the active card */}
            {canvasTabs.length > 1 && (
              <>
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    top: 22, right: 24, bottom: 22, left: 12,
                    background: dark ? '#1A1C1E' : '#fff',
                    border: dark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)',
                    borderRadius: 16,
                    boxShadow: dark
                      ? '0 4px 12px rgba(0,0,0,0.3)'
                      : '0 4px 12px rgba(0,0,0,0.04)',
                    opacity: 0.6,
                    pointerEvents: 'none',
                  }}
                />
                {canvasTabs.length > 2 && (
                  <div
                    aria-hidden
                    style={{
                      position: 'absolute',
                      top: 18, right: 20, bottom: 18, left: 8,
                      background: dark ? '#1F2123' : '#fafaf8',
                      border: dark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                      borderRadius: 16,
                      boxShadow: dark
                        ? '0 6px 16px rgba(0,0,0,0.35)'
                        : '0 6px 16px rgba(0,0,0,0.05)',
                      opacity: 0.85,
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </>
            )}

            {/* The active card — the page in front of the stack */}
            <div
              className="flex-1 flex flex-col min-w-0 overflow-hidden relative"
              style={{
                background: canvasTabs.length > 0 ? (dark ? '#1A1C1E' : '#fff') : (dark ? '#151617' : '#F8F6F2'),
                border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                borderRadius: 16,
                boxShadow: dark
                  ? '0 1px 3px rgba(0,0,0,0.2), 0 12px 32px rgba(0,0,0,0.4)'
                  : '0 1px 3px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.08)',
                zIndex: 1,
              }}
            >
              {canvasTabs.length > 0 ? (
                <>
                  {/* Horizontal tab bar — browser/VS Code style */}
                  <CanvasTabBar
                    tabs={canvasTabs}
                    activeTabId={activeCanvasTabId}
                    onSelect={setActiveCanvasTabId}
                    onClose={closeCanvasTab}
                    dark={dark}
                  />
                  {/* All tabs mounted, only active visible */}
                  <div className="flex-1 overflow-y-auto relative">
                    {canvasTabs.map(tab => (
                      <div key={tab.id} className="absolute inset-0 overflow-y-auto" style={{ display: tab.id === activeCanvasTabId ? 'block' : 'none' }}>
                        {renderCanvasTabContent(tab)}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* Empty state */
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
        {canvasTabs.length > 0 && isMobile && (
          <div className={`fixed inset-0 z-50 flex flex-col ${dark ? 'bg-[#1A1C1E]' : 'bg-white'}`} style={{ animation: 'slideUpIn 0.3s ease', overscrollBehavior: 'contain', touchAction: 'manipulation' }}>
            {/* Mobile tab pills — pl-14 clears the floating hamburger button */}
            <div className="shrink-0 flex items-center justify-between pl-14 pr-3 py-2.5" style={{ borderBottom: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-1.5 overflow-x-auto flex-1 mr-2">
                {canvasTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCanvasTabId(tab.id)}
                    className={`canvas-tab-pill shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer active:scale-95 ${
                      tab.id === activeCanvasTabId
                        ? (dark ? 'bg-white text-[#1A1C1E] border-white' : 'bg-[#1A1C1E] text-white border-[#1A1C1E]')
                        : (dark ? 'bg-transparent text-[#A0A0A0] border-[rgba(255,255,255,0.1)]' : 'bg-white text-[#6E6A63] border-[rgba(0,0,0,0.08)]')
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => { if (activeCanvasTab) closeCanvasTab(activeCanvasTab.id); }}
                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-0 bg-transparent cursor-pointer active:scale-90 ${dark ? 'text-[#A0A0A0]' : 'text-[#6E6A63]'}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
              {activeCanvasTab && renderCanvasTabContent(activeCanvasTab)}
            </div>
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
        .resize-handle:hover > div,
        .resize-handle:active > div {
          background: rgba(128,128,128,0.3) !important;
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
            className={`fixed top-0 left-0 bottom-0 z-[61] w-64 flex flex-col py-12 px-6 overflow-y-auto ${dark ? 'bg-[#1a1c1e] border-r border-zinc-800' : 'bg-white border-r border-[#eeeef0] shadow-xl'}`}
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
            <LogoIcon height={40} className="mb-6" dark={dark} />
            {/* Explore — marketing pages, hidden when logged in */}
            {!user && (
            <>
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
                      ? (dark ? 'text-rose-500 bg-rose-500/10' : 'text-[#D44A78] bg-[#D44A78]/5')
                      : (dark ? 'text-zinc-400 hover:text-white bg-transparent' : 'text-[#636467] hover:text-[#1a1c1e] bg-transparent')
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
            </>
            )}
            {/* Workspace tools — shown when logged in */}
            {user && (
            <>
            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-4 ${dark ? 'text-zinc-500' : 'text-[#636467]'}`}>Workspace</span>
            {([
              { action: 'chat', icon: 'forum', label: 'Chat' },
              { action: 'new-chat', icon: 'add_comment', label: 'New Chat' },
              { action: 'library', icon: 'folder_open', label: 'Library' },
              { action: 'dataroom', icon: 'lock', label: 'Data Room' },
              { action: 'pipeline', icon: 'view_kanban', label: 'Pipeline' },
              { action: 'sourcing', icon: 'search', label: 'Sourcing' },
            ]).map(item => (
              <button
                key={item.action}
                onClick={() => {
                  setIsMobileSidebarOpen(false);
                  if (item.action === 'chat') { setViewState('chat'); navigate('/chat'); }
                  else if (item.action === 'new-chat') { handleNewChat(); }
                  else { openCanvasTab(item.action === 'library' ? 'documents' : item.action, item.label); }
                }}
                className={`flex items-center gap-3 py-3 px-3 rounded-xl text-left transition-all border-none cursor-pointer text-sm font-medium ${
                  dark ? 'text-zinc-400 hover:text-white bg-transparent' : 'text-[#636467] hover:text-[#1a1c1e] bg-transparent'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.label}
              </button>
            ))}
            </>
            )}
            <div className="mt-auto flex flex-col gap-2">
              {/* Admin Console — visible only to admins */}
              {user && (user.role === 'admin' || user.email === 'pbaker@smbx.ai') && (
              <button
                onClick={() => { setIsMobileSidebarOpen(false); navigate('/admin'); }}
                className={`flex items-center gap-3 py-3 px-3 rounded-xl text-left transition-all border-none cursor-pointer text-sm font-medium ${dark ? 'text-zinc-400 bg-transparent' : 'text-[#636467] bg-transparent'}`}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                Admin Console
              </button>
              )}
              <button
                onClick={() => { setIsMobileSidebarOpen(false); if (user) { openCanvasTab('settings', 'Settings'); } else navigate('/login'); }}
                className={`flex items-center gap-3 py-3 px-3 rounded-xl text-left transition-all border-none cursor-pointer text-sm font-medium ${dark ? 'text-zinc-400 bg-transparent' : 'text-[#636467] bg-transparent'}`}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">person</span>
                {user ? 'Account & Settings' : 'Account & Settings'}
              </button>
            </div>
          </nav>
        </>
      )}

      {/* ═══ MOBILE CANVAS DRAWER (right side) ═══ */}
      {isMobile && isMobileCanvasDrawerOpen && (
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

      {/* ═══ MOBILE FLOATING BUTTONS — hamburger (left) + account (right) ═══ */}
      {isMobile && (viewState === 'landing' || viewState === 'chat') && (
        <>
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="fixed z-[51] w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer shadow-lg bg-[#1a1c1e] text-[#E8709A]"
            style={{ top: 16, left: 16 }}
            type="button"
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>
          {user && (
            <button
              onClick={() => openCanvasTab('settings', 'Settings')}
              className="fixed z-[51] w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer shadow-lg bg-[#1a1c1e] text-[#E8709A]"
              style={{ top: 16, right: 16 }}
              type="button"
              aria-label="Account & Settings"
            >
              <span className="material-symbols-outlined text-[22px]">person</span>
            </button>
          )}
        </>
      )}

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

      {/* Dark mode toggle */}
      <DarkModeToggle dark={dark} setDark={setDark} />

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
