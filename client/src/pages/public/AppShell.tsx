import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
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
import SellBelow from '../../components/content/SellBelow';
import BuyBelow from '../../components/content/BuyBelow';
import HowItWorksBelow from '../../components/content/HowItWorksBelow';
import AdvisorsBelow from '../../components/content/AdvisorsBelow';
import PricingBelow from '../../components/content/PricingBelow';

/* ═══ ROTATING PLACEHOLDER TEXTS (home page) ═══ */
const ROTATING_PLACEHOLDERS = [
  'I want to sell my pest control business...',
  'Is this $2M listing worth pursuing?',
  "What's my cleaning company worth?",
  'Can this deal get SBA financing?',
  'Help me find add-backs on my P&L...',
  "I'm a broker with a new listing...",
  'What should I offer for this HVAC company?',
  'Walk me through selling my business...',
];

/* ═══ TYPES ═══ */

export type TabId = 'home' | 'sell' | 'buy' | 'how-it-works' | 'advisors' | 'pricing';
export type ViewState = 'landing' | 'chat' | 'pipeline' | 'dataroom' | 'settings' | 'seller-dashboard' | 'buyer-pipeline';

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
    headline: 'What deal are you working on?',
    terraWord: 'deal',
    tagline: '',
    chips: [],
    placeholder: 'Tell Yulia about your deal...',
  },
  sell: {
    overline: 'Strengthen & Sell',
    headline: 'Your exit. Your way. Your timeline.',
    terraWord: 'timeline.',
    tagline: 'Selling a business is the biggest financial event of most owners\u2019 lives. It takes 6 to 24 months. Every month of preparation can move your sale price 5\u201315%. Yulia is with you for every one of them.',
    chips: [
      "What's my business worth right now?",
      "What add-backs am I missing on my tax returns?",
      "My partner wants out \u2014 what are our options?",
      'Walk me through a 12-month exit plan',
    ],
    placeholder: 'Tell Yulia about your business...',
  },
  buy: {
    overline: 'Search & Acquire',
    headline: 'Find it. Evaluate it. Close it. Grow it.',
    terraWord: 'Grow it.',
    tagline: 'Bring any deal from anywhere \u2014 a BizBuySell listing, a broker\u2019s teaser, something you heard about at a conference. Yulia runs institutional analysis on it and tells you the one thing you need to know: pursue or pass.',
    chips: [
      "I found a listing \u2014 is the asking price justified?",
      'Can I finance a $2M dental practice with SBA?',
      'What should I look for in home services markets?',
      'I just closed \u2014 help me build a 90-day plan',
    ],
    placeholder: "Tell Yulia what you're looking for...",
  },
  'how-it-works': {
    overline: 'Deal Intelligence',
    headline: 'The data is public. The intelligence is not.',
    terraWord: 'not.',
    tagline: 'Every number Yulia gives you is traceable to authoritative federal data \u2014 the same sources that power the Federal Reserve and Wall Street research desks. The difference is what we do with it.',
    chips: [
      'How is this different from ChatGPT?',
      'What data sources do you use?',
      'Show me the methodology',
      'What does a valuation look like?',
    ],
    placeholder: 'Ask how the intelligence works...',
  },
  advisors: {
    overline: 'For Deal Professionals',
    headline: 'Your first 3 client journeys are free.',
    terraWord: 'free.',
    tagline: 'Run a full deal through the platform \u2014 valuation, CIM, market intelligence, buyer qualification \u2014 without committing a dollar. See what takes 30 minutes instead of 12 hours.',
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
    headline: 'Start free. Go deeper when you\u2019re ready.',
    terraWord: 'ready.',
    tagline: 'Everything you need to understand your deal is free. When you\u2019re ready for premium deliverables, you pay per document \u2014 the right intelligence at the right stage of your deal.',
    chips: [
      "What's free?",
      'How does the wallet work?',
      'See full pricing',
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
      <span style={{ color: '#D4714E' }}>{terraWord}</span>
      {text.substring(idx + terraWord.length)}
    </>
  );
}

/* ═══ NAV ITEMS ═══ */

const NAV_ITEMS: { id: TabId; label: string; icon: JSX.Element }[] = [
  {
    id: 'home',
    label: 'Chat',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
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
  sell: '#D4714E',
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
      }, 450);
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
    const urlMap: Record<TabId, string> = { home: '/', sell: '/sell', buy: '/buy', 'how-it-works': '/how-it-works', advisors: '/advisors', pricing: '/pricing' };
    navigate(urlMap[activeTab]);
  }, [activeTab, navigate]);

  // Tab click
  const handleTabClick = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setViewState('landing');
    setIsMobileSidebarOpen(false);
    const urlMap: Record<TabId, string> = { home: '/', sell: '/sell', buy: '/buy', 'how-it-works': '/how-it-works', advisors: '/advisors', pricing: '/pricing' };
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
    if (['pipeline', 'dataroom', 'settings', 'seller-dashboard', 'buyer-pipeline'].includes(viewState) && !user) navigate('/login');
  }, [viewState, user, navigate]);

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
      style={{ width: mobile ? 280 : 220, background: '#F5F5F3', borderRight: '1px solid rgba(26,26,24,0.06)' }}
    >
      {/* Logo */}
      <div className="px-5 pt-5 pb-2">
        <button
          onClick={() => { handleTabClick('home'); if (mobile) setIsMobileSidebarOpen(false); }}
          className="bg-transparent border-none cursor-pointer p-0 text-[22px] leading-none"
          style={{ letterSpacing: '-0.03em', fontFamily: 'inherit', fontWeight: 700, color: '#1A1A18' }}
          type="button"
        >
          smb<span style={{ color: '#D4714E' }}>X</span>.ai
        </button>
      </div>

      {/* New Workspace — authenticated only */}
      {user && (
        <div className="px-4 pt-4 pb-4">
          <button
            onClick={() => {
              authChat.newConversation();
              setViewState('chat');
              navigate('/chat');
              setIsMobileSidebarOpen(false);
            }}
            className="w-full text-white text-[14px] px-4 py-3 cursor-pointer border-none hover:opacity-90 transition-opacity"
            style={{ fontFamily: 'inherit', fontWeight: 600, background: '#1A1A18', borderRadius: '100px' }}
            type="button"
          >
            + New Workspace
          </button>
        </div>
      )}

      {/* Nav */}
      <div className="px-3">
        <nav className="space-y-0.5">
          {NAV_ITEMS.map(item => {
            const isActive = activeTab === item.id && viewState === 'landing';
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className="flex items-center gap-3 w-full px-4 py-2.5 cursor-pointer border-none transition-all"
                style={{
                  fontFamily: 'inherit',
                  fontSize: '15px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#1A1A18' : 'rgba(26,26,24,0.65)',
                  background: isActive ? '#FFFFFF' : 'transparent',
                  borderRadius: '100px',
                  border: isActive ? '1px solid rgba(26,26,24,0.1)' : '1px solid transparent',
                }}
                type="button"
              >
                <span style={{ color: isActive ? '#D4714E' : 'rgba(26,26,24,0.45)' }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Conversations — grouped by deal or date */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 mt-4">
        {conversationGroups.map(group => (
          <div key={group.label} className="mb-3">
            <div className="flex items-center gap-2 px-4 mb-2" style={{ fontSize: '10px', fontWeight: groupMode === 'deal' ? 800 : 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#D4714E' }}>
              {groupMode === 'deal' && group.journey && (
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: JOURNEY_COLORS[group.journey] || 'rgba(26,26,24,0.3)' }}
                />
              )}
              {group.label}
            </div>
            {group.items.map(c => (
              <button
                key={c.id}
                onClick={() => {
                  if (user) authChat.selectConversation(c.id);
                  else anonChat.selectConversation(c.id);
                  setViewState('chat');
                  navigate(`/chat/${c.id}`);
                  setIsMobileSidebarOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] cursor-pointer transition-all"
                style={{
                  fontFamily: 'inherit',
                  fontWeight: c.id === activeConvId && viewState === 'chat' ? 600 : 500,
                  color: c.id === activeConvId && viewState === 'chat' ? '#1A1A18' : 'rgba(26,26,24,0.65)',
                  background: c.id === activeConvId && viewState === 'chat' ? '#FFFFFF' : 'transparent',
                  borderRadius: '12px',
                  border: c.id === activeConvId && viewState === 'chat' ? '1px solid rgba(26,26,24,0.1)' : '1px solid transparent',
                }}
                type="button"
              >
                {groupMode === 'date' && (
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: c.journey ? (JOURNEY_COLORS[c.journey] || 'rgba(26,26,24,0.3)') : 'rgba(26,26,24,0.2)' }}
                  />
                )}
                <span className="truncate flex-1 min-w-0 text-left">{c.title}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto px-4 py-3 space-y-1" style={{ borderTop: '1px solid rgba(26,26,24,0.06)' }}>
        {user && (
          <button
            onClick={() => {
              setViewState('seller-dashboard');
              navigate('/seller');
              setIsMobileSidebarOpen(false);
            }}
            className={`flex items-center gap-2 w-full text-left text-[11px] font-bold uppercase bg-transparent border-none cursor-pointer transition-colors py-1 ${
              viewState === 'seller-dashboard' ? 'text-[#D4714E]' : 'text-[#6E6A63] hover:text-[#1A1A18]'
            }`}
            style={{ fontFamily: 'inherit', letterSpacing: '0.15em' }}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" />
            </svg>
            Seller
          </button>
        )}
        {user && (
          <button
            onClick={() => {
              setViewState('buyer-pipeline');
              navigate('/buyer');
              setIsMobileSidebarOpen(false);
            }}
            className={`flex items-center gap-2 w-full text-left text-[11px] font-bold uppercase bg-transparent border-none cursor-pointer transition-colors py-1 ${
              viewState === 'buyer-pipeline' ? 'text-[#D4714E]' : 'text-[#6E6A63] hover:text-[#1A1A18]'
            }`}
            style={{ fontFamily: 'inherit', letterSpacing: '0.15em' }}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            Buyer
          </button>
        )}
        {user && (
          <button
            onClick={() => {
              setViewState('dataroom');
              navigate('/dataroom');
              setIsMobileSidebarOpen(false);
            }}
            className={`flex items-center gap-2 w-full text-left text-[11px] font-bold uppercase bg-transparent border-none cursor-pointer transition-colors py-1 ${
              viewState === 'dataroom' ? 'text-[#D4714E]' : 'text-[#6E6A63] hover:text-[#1A1A18]'
            }`}
            style={{ fontFamily: 'inherit', letterSpacing: '0.15em' }}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
            </svg>
            Documents
          </button>
        )}
        <button
          onClick={() => {
            if (user) { setViewState('settings'); navigate('/settings'); }
            else navigate('/login');
            setIsMobileSidebarOpen(false);
          }}
          className="block w-full text-left text-[11px] font-bold uppercase text-[#6E6A63] bg-transparent border-none cursor-pointer hover:text-[#1A1A18] transition-colors py-1"
          style={{ fontFamily: 'inherit', letterSpacing: '0.15em' }}
          type="button"
        >
          Account
        </button>
        {user && (
          <button
            onClick={handleLogout}
            className="block w-full text-left text-[11px] font-bold uppercase text-[#6E6A63] bg-transparent border-none cursor-pointer hover:text-[#D4714E] transition-colors py-1"
            style={{ fontFamily: 'inherit', letterSpacing: '0.15em' }}
            type="button"
          >
            Log out
          </button>
        )}
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
          className="flex-shrink-0 flex items-center justify-between h-14 px-6 z-20 bg-white"
          style={{ borderBottom: '1px solid rgba(26,26,24,0.06)' }}
        >
          <div className="flex items-center gap-3">
            {viewState === 'chat' ? (
              /* ── Chat mode: back arrow + "Chat with Yulia" ── */
              <div className="flex items-center gap-3" style={{ animation: 'fadeIn 0.3s ease' }}>
                <button
                  onClick={handleBack}
                  className="w-10 h-10 flex items-center justify-center bg-transparent border-none cursor-pointer"
                  style={{ borderRadius: 12, color: 'rgba(26,26,24,0.45)' }}
                  type="button"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
                  </svg>
                </button>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A18' }}>Chat with Yulia</span>
              </div>
            ) : (
              /* ── Landing mode: hamburger + logo / page label ── */
              <>
                {isMobile && (
                  <button
                    onClick={() => setIsMobileSidebarOpen(true)}
                    className="w-10 h-10 flex items-center justify-center bg-transparent border-none cursor-pointer"
                    style={{ borderRadius: 12, color: 'rgba(26,26,24,0.7)' }}
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
                    style={{ letterSpacing: '-0.03em', fontFamily: 'inherit', fontSize: '20px', fontWeight: 700, color: '#1A1A18' }}
                    type="button"
                  >
                    smb<span style={{ color: '#D4714E' }}>X</span>.ai
                  </button>
                ) : (
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(26,26,24,0.35)' }}>
                    {activeTab === 'home' ? 'Chat' : activeTab === 'sell' ? 'Sell' : activeTab === 'buy' ? 'Buy' : activeTab === 'how-it-works' ? 'How It Works' : activeTab === 'advisors' ? 'Advisors' : 'Pricing'}
                  </span>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!user && activeTab !== 'home' && viewState === 'landing' && (
              <button
                onClick={() => navigate('/login')}
                className="text-white border-none cursor-pointer hover:opacity-90 transition-opacity"
                style={{ fontFamily: 'inherit', fontSize: '13px', fontWeight: 600, background: '#1A1A18', borderRadius: '100px', padding: '9px 20px' }}
                type="button"
              >
                Start chatting
              </button>
            )}
            {!user && (activeTab === 'home' || viewState === 'chat') && (
              <button
                onClick={() => navigate('/login')}
                className="bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity"
                style={{ fontFamily: 'inherit', fontSize: '13px', fontWeight: 600, color: 'rgba(26,26,24,0.55)' }}
                type="button"
              >
                Sign in
              </button>
            )}
            {user && (
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(26,26,24,0.45)' }}>{user.display_name || user.email}</span>
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
                {/* ═══ HOME PAGE — ChatGPT-Minimal ═══ */}

                {/* MOBILE HOME */}
                <div className="flex flex-col h-full md:hidden">
                  <div className="flex-1 flex items-center justify-center px-6">
                    <h1 style={{ fontSize: '34px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, textAlign: 'center' }}>
                      {renderHeadline(page.headline, page.terraWord)}
                    </h1>
                  </div>
                  <div className="shrink-0 px-4" style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}>
                    <ChatDock
                      ref={dockRef}
                      onSend={handleSend}
                      variant="hero"
                      rows={1}
                      placeholder={page.placeholder}
                      disabled={sending}
                      rotatingPlaceholders={ROTATING_PLACEHOLDERS}
                    />
                  </div>
                </div>

                {/* DESKTOP HOME */}
                <div className="hidden md:flex flex-col h-full">
                  <div className="flex-1 flex items-center justify-center px-6">
                    <h1 style={{ fontSize: '48px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, textAlign: 'center' }}>
                      {renderHeadline(page.headline, page.terraWord)}
                    </h1>
                  </div>
                  <div className="shrink-0 px-8" style={{ paddingBottom: 32 }}>
                    <div className="max-w-4xl mx-auto">
                      <ChatDock
                        ref={dockRef}
                        onSend={handleSend}
                        variant="hero"
                        rows={1}
                        placeholder={page.placeholder}
                        disabled={sending}
                        rotatingPlaceholders={ROTATING_PLACEHOLDERS}
                      />
                    </div>
                  </div>
                </div>
              </>
              ) : (
              <>
              {/* ═══ SUB-PAGE MOBILE HERO ═══ */}
              <div className="md:hidden">
                <div className="mx-4 mt-4" style={{ background: '#F7F6F4', borderRadius: 28, border: '1px solid rgba(26,26,24,0.05)', padding: '40px 24px' }}>
                  {page.overline && (
                    <div
                      className="inline-flex items-center gap-1.5 bg-white mb-5"
                      style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(26,26,24,0.55)', borderRadius: 100, padding: '6px 14px', border: '1px solid rgba(26,26,24,0.08)' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4714E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"/></svg>
                      {page.overline}
                    </div>
                  )}
                  <h1 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.03em', color: '#1A1A18', lineHeight: 1.12, marginBottom: 16 }}>
                    {renderHeadline(page.headline, page.terraWord)}
                  </h1>
                  <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.6, marginBottom: 24 }}>
                    {page.tagline}
                  </p>
                  {/* Chips */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {page.chips.map(chip => (
                      <button
                        key={chip}
                        onClick={() => handleChipClick(chip)}
                        className="bg-white cursor-pointer transition-all"
                        style={{ borderRadius: 100, fontSize: '14px', fontWeight: 500, fontFamily: 'inherit', color: 'rgba(26,26,24,0.55)', border: '1px solid rgba(26,26,24,0.08)', padding: '8px 16px' }}
                        type="button"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ═══ SUB-PAGE DESKTOP HERO ═══ */}
              <div className="hidden md:block">
                <div className="mx-6 mt-6" style={{ background: '#F7F6F4', borderRadius: 28, border: '1px solid rgba(26,26,24,0.05)', padding: '56px 52px' }}>
                  <div className="max-w-4xl mx-auto">
                    {page.overline && (
                      <div
                        className="inline-flex items-center gap-2 bg-white mb-6"
                        style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(26,26,24,0.55)', borderRadius: 100, padding: '7px 16px', border: '1px solid rgba(26,26,24,0.08)' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4714E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"/></svg>
                        {page.overline}
                      </div>
                    )}
                    <h1 style={{ fontSize: '52px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.1, marginBottom: 20 }}>
                      {renderHeadline(page.headline, page.terraWord)}
                    </h1>
                    <p style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65, marginBottom: 32 }}>
                      {page.tagline}
                    </p>
                    {/* Chips */}
                    <div className="flex flex-wrap gap-2.5 mb-6">
                      {page.chips.map(chip => (
                        <button
                          key={chip}
                          onClick={() => handleChipClick(chip)}
                          className="bg-white cursor-pointer transition-all hover:text-[#D4714E]"
                          style={{ borderRadius: 100, fontSize: '14px', fontWeight: 500, fontFamily: 'inherit', color: 'rgba(26,26,24,0.55)', border: '1px solid rgba(26,26,24,0.08)', padding: '9px 20px' }}
                          type="button"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ═══ BELOW-FOLD + FOOTER ═══ */}
              {activeTab === 'sell' && <SellBelow onChipClick={handleChipClick} />}
              {activeTab === 'buy' && <BuyBelow onChipClick={handleChipClick} />}
              {activeTab === 'how-it-works' && <HowItWorksBelow onChipClick={handleChipClick} />}
              {activeTab === 'advisors' && <AdvisorsBelow onChipClick={handleChipClick} />}
              {activeTab === 'pricing' && <PricingBelow onChipClick={handleChipClick} />}

              {/* Footer */}
              <footer className="px-6 py-12 text-center" style={{ borderTop: '1px solid rgba(26,26,24,0.06)' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A18', letterSpacing: '-0.03em', marginBottom: 8 }}>
                  smb<span style={{ color: '#D4714E' }}>X</span>.ai
                </div>
                <p style={{ fontSize: '14px', color: 'rgba(26,26,24,0.45)', marginBottom: 16 }}>Deal intelligence for every dealmaker.</p>
                <div className="flex justify-center gap-6" style={{ fontSize: '13px', color: 'rgba(26,26,24,0.35)' }}>
                  <a href="/legal/privacy" className="hover:underline" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a>
                  <a href="/legal/terms" className="hover:underline" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</a>
                </div>
              </footer>
              </>
              )}
            </div>
          )}

          {/* ════ CHAT MODE ════ */}
          {viewState === 'chat' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              {user && authChat.activeDealId && (
                <GateProgress dealId={authChat.activeDealId} currentGate={authChat.currentGate} />
              )}

              <ChatMessages
                messages={messages}
                streamingText={streamingText}
                sending={sending}
                error={user ? null : anonChat.error}
                onRetry={!user ? () => {
                  const last = anonChat.messages.filter(m => m.role === 'user').pop();
                  if (last) anonChat.sendMessage(last.content);
                } : undefined}
                onOpenDeliverable={handleOpenDeliverable}
              />

              {user && authChat.paywallData && authChat.activeDealId && (
                <div className="max-w-3xl mx-auto px-4 mb-4">
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
                <div className="max-w-md mx-auto px-4 mb-4">
                  <InlineSignupCard sessionId={anonChat.getSessionId()} canDismiss={!anonChat.limitReached} />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
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
        </div>

        {/* ════ CHATDOCK — chat mode, pinned at bottom ════ */}
        {showDock && viewState === 'chat' && (
          <div className="shrink-0 px-4 pt-2" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))', touchAction: 'manipulation' }}>
            <div className="max-w-[860px] mx-auto">
              <ChatDock
                ref={dockRef}
                onSend={handleSend}
                variant="hero"
                rows={1}
                placeholder="Reply to Yulia..."
                disabled={sending}
              />
            </div>
          </div>
        )}

        </div>{/* end chat column */}

        {/* ════ DESKTOP CANVAS PANEL — split view ════ */}
        {canvasOpen && !isMobile && (
          <div
            className="shrink-0 flex flex-col"
            style={{ borderLeft: '1px solid rgba(26,26,24,0.06)', width: 480, animation: 'slideInRight 0.25s ease' }}
          >
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
