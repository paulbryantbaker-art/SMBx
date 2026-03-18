import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useAnonymousChat } from '../../hooks/useAnonymousChat';
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

/* ═══ DYNAMIC GREETING (time-of-day) ═══ */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning.';
  if (hour < 17) return 'Good afternoon.';
  return 'Good evening.';
}

/* ═══ TYPEWRITER HINT POOL (home page) ═══ */
const TYPEWRITER_PREFIX = "Hello, I'm Yulia. ";
const TYPEWRITER_HINTS = [
  // Sellers — the first question
  "What's my business worth?",
  "I want to sell my landscaping company in Austin...",
  "What add-backs am I missing on $600K revenue?",
  "Asset sale vs stock sale \u2014 what do I actually keep?",
  "How do I prepare my HVAC company for sale?",
  "My partner wants out. What are our options?",
  // Buyers — speed to conviction
  "I found a listing for $285K \u2014 is that fair?",
  "Can I finance a $1.8M deal with SBA?",
  "Screen this deal: $2.1M revenue, $380K SDE...",
  "What's the DSCR on this acquisition?",
  "Looking for my first deal \u2014 home services under $800K...",
  // Middle market
  "We're doing $5M EBITDA in commercial roofing...",
  "Evaluating a platform acquisition at 7.2x...",
  "Model SBA vs. conventional on a $6M deal...",
  // Capital raise
  "I need $500K for a second location...",
  "Model the dilution on a $2M equity raise...",
  "Walk me through ESOP conversion...",
  // Integration
  "I just closed \u2014 what's my 90-day plan?",
  "Employee retention is my top concern...",
  // Tax & structure
  "I'm a C-Corp. How bad is double taxation?",
  "Walk me through purchase price allocation...",
  // Advisors
  "I'm a broker. Help me package a new listing...",
  "Generate a CIM from raw financials...",
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
  useAppHeight(true);   // Always track visual viewport + lock body scroll (inner divs handle scrolling)
  const [activeTab, setActiveTab] = useState<TabId>(() => pathToTab(location));
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [viewingDeliverable, setViewingDeliverable] = useState<number | null>(null);
  const [canvasMarkdown, setCanvasMarkdown] = useState<{ content: string; title: string } | null>(null);
  const [morphing, setMorphing] = useState(false);
  const [heroFocused, setHeroFocused] = useState(false); // tracks when hero input is focused — controls logo position
  const [ndaRequired, setNdaRequired] = useState<{ dealId: number; dealName?: string } | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  // Chat hooks (always called for hook order)
  const anonChat = useAnonymousChat();
  const authChat = useAuthChat(user);

  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<ChatDockHandle>(null);

  // Set initial conversation ID from URL
  useEffect(() => {
    const convId = getInitialConversationId(window.location.pathname);
    if (convId) {
      if (user) authChat.selectConversation(convId);
      else anonChat.selectConversation(convId);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Unified message interface
  const messages = user ? authChat.messages : anonChat.messages;
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

  // Mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

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
      {/* Logo — hidden when center logo is visible on home landing */}
      <div className="px-5 pt-5 pb-2" style={{ opacity: (activeTab === 'home' && viewState === 'landing' && !heroFocused && !morphing) ? 0 : 1, transition: 'opacity 0.2s ease' }}>
        <button
          onClick={() => { handleTabClick('home'); if (mobile) setIsMobileSidebarOpen(false); }}
          className="bg-transparent border-none cursor-pointer p-0 text-[22px] leading-none"
          style={{ letterSpacing: '-0.03em', fontFamily: 'inherit', fontWeight: 700, color: '#0D0D0D' }}
          type="button"
        >
          smb<span style={{ color: '#C96B4F', display: 'inline-block', transform: 'rotate(-8deg) scaleY(1.15) scaleX(1.1)', fontWeight: 900, fontSize: '25px', lineHeight: 1, verticalAlign: 'baseline', marginLeft: -1, marginRight: -1 }}>X</span><span style={{ color: '#0D0D0D' }}>.ai</span>
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
                  color: isActive ? '#0D0D0D' : 'rgba(0,0,0,0.4)',
                  background: isActive ? 'rgba(0,0,0,0.04)' : 'transparent',
                  borderRadius: '10px',
                  border: 'none',
                }}
                type="button"
              >
                <span style={{ color: isActive ? '#0D0D0D' : 'rgba(0,0,0,0.3)' }}>{item.icon}</span>
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
                  color: isActive ? '#0D0D0D' : 'rgba(0,0,0,0.4)',
                  background: isActive ? 'rgba(0,0,0,0.04)' : 'transparent',
                  borderRadius: '10px',
                  border: 'none',
                }}
                type="button"
              >
                <span style={{ color: isActive ? '#C96B4F' : 'rgba(0,0,0,0.25)' }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Conversations — Recent */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 mt-4">
        <div className="px-4 mb-2" style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#C96B4F' }}>Recent</div>
        {(allConversations || []).map(c => (
          <button
            key={c.id}
            onClick={() => {
              if (user) authChat.selectConversation(c.id);
              else anonChat.selectConversation(c.id);
              setViewState('chat');
              navigate(`/chat/${c.id}`);
              setIsMobileSidebarOpen(false);
            }}
            className={`flex items-center w-full px-4 py-2 text-[14px] cursor-pointer transition-all conv-item-hover`}
            style={{
              fontFamily: 'inherit',
              fontWeight: c.id === activeConvId && viewState === 'chat' ? 600 : 400,
              color: c.id === activeConvId && viewState === 'chat' ? '#0D0D0D' : 'rgba(0,0,0,0.45)',
              background: c.id === activeConvId && viewState === 'chat' ? 'rgba(0,0,0,0.04)' : 'transparent',
              borderRadius: '10px',
              border: 'none',
            }}
            type="button"
          >
            <span className="truncate flex-1 min-w-0 text-left">{c.title}</span>
          </button>
        ))}
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
        transform: 'translateY(var(--app-offset, 0px))',
      }}
    >
      {/* Desktop sidebar */}
      {!isMobile && sidebarContent(false)}

      {/* Mobile sidebar overlay */}
      {isMobile && isMobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 animate-[slideInLeft_0.25s_ease]">
            {sidebarContent(true)}
          </div>
        </>
      )}

      {/* Main canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Offline banner */}
        {isOffline && (
          <div className="shrink-0 bg-yellow-50 border-b border-yellow-200 px-4 py-2 flex items-center justify-center gap-2 z-30">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-xs font-semibold text-yellow-800">You appear to be offline. Messages will send when you reconnect.</span>
          </div>
        )}
        {/* Header — 56px */}
        <header
          className="flex-shrink-0 flex items-center justify-between h-14 px-6 z-20 bg-[#FAFAFA]"
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
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#0D0D0D' }}>Chat with Yulia</span>
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
                    onClick={() => handleTabClick('home')}
                    className="bg-transparent border-none cursor-pointer p-0 leading-none"
                    style={{ letterSpacing: '-0.03em', fontFamily: 'inherit', fontSize: '20px', fontWeight: 700, color: '#0D0D0D', opacity: (activeTab === 'home' && viewState === 'landing' && !heroFocused && !morphing) ? 0 : 1, transition: 'opacity 0.3s ease' }}
                    type="button"
                  >
                    smb<span style={{ color: '#C96B4F', display: 'inline-block', transform: 'rotate(-8deg) scaleY(1.15) scaleX(1.1)', fontWeight: 900, fontSize: '23px', lineHeight: 1, verticalAlign: 'baseline', marginLeft: -1, marginRight: -1 }}>X</span><span style={{ color: '#0D0D0D' }}>.ai</span>
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
        <div className="flex-1 flex min-h-0">
        {/* Chat column */}
        <div className="flex-1 flex flex-col min-w-0">
        {/* Scroll area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto min-h-0"
          style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' } as any}
        >
          {/* ════ LANDING MODE ════ */}
          {viewState === 'landing' && (
            <div key={activeTab} style={{ animation: morphing ? 'morphOut 0.3s ease forwards' : 'slideUp 0.35s ease', pointerEvents: morphing ? 'none' as const : undefined, ...(activeTab === 'home' ? { overflow: 'hidden', display: 'flex', flexDirection: 'column' as const, height: '100%' } : {}) }}>
              {activeTab === 'home' ? (
              <>
                {/* ═══ HOME PAGE — Paper Design: centered wordmark + hero chat bar + chips ═══ */}

                {/* MOBILE HOME */}
                <div className="flex flex-col h-full md:hidden">
                  <div className="flex-1 flex flex-col items-center justify-center px-5 gap-7" style={{ position: 'relative' }}>
                    {/* Logo mark — flash-moves to sidebar when input focused */}
                    <motion.div
                      initial={{ opacity: 0, y: -12, scale: 0.9 }}
                      animate={(heroFocused || morphing)
                        ? { opacity: 0, scale: 0.5, transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } }
                        : { opacity: 1, y: 0, x: 0, scale: 1, transition: { duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] } }
                      }
                    >
                      <span style={{ fontSize: '34px', fontWeight: 700, letterSpacing: '-0.03em', color: '#0D0D0D' }}>
                        smb<span style={{ color: '#C96B4F', display: 'inline-block', transform: 'rotate(-8deg) scaleY(1.15) scaleX(1.1)', fontWeight: 900, fontSize: '39px', lineHeight: 1, verticalAlign: 'baseline', marginLeft: -1, marginRight: -1 }}>X</span><span style={{ opacity: 0.6 }}>.ai</span>
                      </span>
                    </motion.div>
                    {/* Heading */}
                    <motion.h1
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", fontSize: '36px', fontWeight: 900, letterSpacing: '-0.02em', color: '#0D0D0D', textAlign: 'center', margin: 0, lineHeight: 1.15 }}
                    >
                      {getGreeting()}
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                      style={{ fontSize: '16px', color: '#545454', fontWeight: 500, textAlign: 'center', margin: '0 0 12px', lineHeight: 1.5 }}
                    >
                      How can we help you grow your business today?
                    </motion.p>
                    {/* Hero chat bar */}
                    <motion.div
                      className="w-full"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <ChatDock
                        ref={dockRef}
                        onSend={handleSend}
                        variant="hero"
                        rows={1}
                        placeholder="Ask smbx.ai anything..."
                        disabled={sending}
                        typewriterHints={TYPEWRITER_HINTS}
                        typewriterPrefix={TYPEWRITER_PREFIX}
                        onInputFocus={() => setHeroFocused(true)}
                        onInputBlur={(hasText) => { if (!hasText) setHeroFocused(false); }}
                      />
                    </motion.div>
                    {/* Suggestion chips — 3 with icons */}
                    <div className="flex flex-wrap justify-center gap-2">
                      {[
                        { label: 'Prepare to sell', icon: null, message: "I'm thinking about selling my business. Help me understand what it's worth and what the process looks like." },
                        { label: 'Prepare to buy', icon: null, message: "I'm looking to buy a business. Help me evaluate deals and find the right acquisition." },
                        { label: 'Raise capital', icon: null, message: "I need to raise capital for my business. Walk me through the options." },
                        { label: 'Market research', icon: null, message: "I want to understand the market landscape for my industry." },
                      ].map((chip, i) => (
                        <motion.button
                          key={chip.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.45, delay: 0.35 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                          onClick={() => handleChipClick(chip.message)}
                          className="bg-white cursor-pointer transition-all chip-hover flex items-center gap-1.5"
                          style={{ borderRadius: 100, fontSize: '14px', fontWeight: 600, fontFamily: 'inherit', color: '#000', border: '1px solid #EEEEEE', padding: '10px 20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                          type="button"
                        >
                          {chip.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  {/* Security footer */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    style={{ textAlign: 'center', padding: '16px 20px', fontSize: '12px', color: 'rgba(0,0,0,0.25)', fontWeight: 400, margin: 0 }}
                  >
                    AI-Powered Business Intelligence
                  </motion.p>
                </div>

                {/* DESKTOP HOME */}
                <div className="hidden md:flex flex-col h-full items-center justify-center">
                  <div className="flex flex-col items-center" style={{ marginTop: '-40px', width: '100%', maxWidth: 640 }}>
                    {/* Logo mark — flash-moves to sidebar when input focused */}
                    <motion.div
                      initial={{ opacity: 0, y: -16, scale: 0.85 }}
                      animate={(heroFocused || morphing)
                        ? { opacity: 0, scale: 0.5, transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } }
                        : { opacity: 1, y: 0, x: 0, scale: 1, transition: { duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] } }
                      }
                      style={{ marginBottom: 28 }}
                    >
                      <span style={{ fontSize: '42px', fontWeight: 700, letterSpacing: '-0.03em', color: '#0D0D0D' }}>
                        smb<span style={{ color: '#C96B4F', display: 'inline-block', transform: 'rotate(-8deg) scaleY(1.15) scaleX(1.1)', fontWeight: 900, fontSize: '48px', lineHeight: 1, verticalAlign: 'baseline', marginLeft: -1, marginRight: -1 }}>X</span><span style={{ opacity: 0.6 }}>.ai</span>
                      </span>
                    </motion.div>
                    {/* Heading */}
                    <motion.h1
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", fontSize: '60px', fontWeight: 900, letterSpacing: '-0.02em', color: '#0D0D0D', textAlign: 'center', margin: '0 0 20px', lineHeight: 1.1 }}
                    >
                      {getGreeting()}
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                      style={{ fontSize: '20px', color: '#545454', fontWeight: 500, textAlign: 'center', margin: '0 0 40px', lineHeight: 1.5 }}
                    >
                      How can we help you grow your business today?
                    </motion.p>
                    {/* Hero chat bar — search style with icon */}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                      style={{ width: '100%', maxWidth: 640 }}
                    >
                      <ChatDock
                        ref={dockRef}
                        onSend={handleSend}
                        variant="hero"
                        rows={1}
                        placeholder="Ask smbx.ai anything..."
                        disabled={sending}
                        typewriterHints={TYPEWRITER_HINTS}
                        typewriterPrefix={TYPEWRITER_PREFIX}
                        onInputFocus={() => setHeroFocused(true)}
                        onInputBlur={(hasText) => { if (!hasText) setHeroFocused(false); }}
                      />
                    </motion.div>
                    {/* Suggestion chips — 3 chips with icons */}
                    <div className="flex flex-wrap justify-center gap-3" style={{ marginTop: 32 }}>
                      {[
                        { label: 'Prepare to sell', message: "I'm thinking about selling my business. Help me understand what it's worth and what the process looks like." },
                        { label: 'Prepare to buy', message: "I'm looking to buy a business. Help me evaluate deals and find the right acquisition." },
                        { label: 'Raise capital', message: "I need to raise capital for my business. Walk me through the options." },
                        { label: 'Market research', message: "I want to understand the market landscape for my industry." },
                      ].map((chip, i) => (
                        <motion.button
                          key={chip.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.45, delay: 0.4 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                          onClick={() => handleChipClick(chip.message)}
                          className="cursor-pointer transition-all chip-hover flex items-center"
                          style={{ borderRadius: 100, fontSize: '15px', fontWeight: 600, fontFamily: 'inherit', color: '#000', border: '1px solid #EEEEEE', padding: '12px 24px', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                          type="button"
                        >
                          {chip.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  {/* Security footer */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    style={{ position: 'absolute', bottom: 24, fontSize: '13px', color: 'rgba(0,0,0,0.3)', fontWeight: 400 }}
                  >
                    AI-Powered Business Intelligence
                  </motion.p>
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

        {/* ════ DESKTOP CANVAS PANEL — always visible on desktop ════ */}
        {!isMobile && viewState === 'chat' && (
          <div
            className="shrink-0 flex flex-col"
            style={{
              borderLeft: '1px solid rgba(0,0,0,0.06)',
              width: canvasOpen ? 520 : 48,
              transition: 'width 0.25s ease',
              background: canvasOpen ? '#fff' : '#F5F5F5',
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
              /* Collapsed empty state — greyed out rail */
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                paddingTop: 16, gap: 8, height: '100%',
              }}>
                <div style={{
                  writingMode: 'vertical-rl', textOrientation: 'mixed',
                  fontSize: 10, fontWeight: 600, color: 'rgba(0,0,0,0.25)',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  marginTop: 8,
                }}>
                  Canvas
                </div>
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
      `}</style>
    </div>
  );
}
