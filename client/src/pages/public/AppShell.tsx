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

/* ═══ TYPES ═══ */

export type TabId = 'home' | 'sell' | 'buy' | 'advisors' | 'pricing';
export type ViewState = 'landing' | 'chat' | 'pipeline' | 'dataroom' | 'settings';

/* ═══ PAGE COPY ═══ */

const PAGE_COPY: Record<TabId, {
  overline: string;
  h1Line1: string;
  h1Line2: string;
  subtitle: string;
  chips: string[];
  tagline: string;
  placeholder: string;
}> = {
  home: {
    overline: '',
    h1Line1: 'What deal are we working on?',
    h1Line2: '',
    subtitle: "Tell Yulia your industry, location, and revenue — and watch. In minutes, she\u2019ll classify your deal, run a seven-layer analysis against live federal data, calculate your adjusted earnings, benchmark your market, model financing scenarios, and tell you exactly where you stand. Valuations. Market intelligence. SBA modeling. Full deal documents. Any deal size.",
    chips: [
      'Value my $2M revenue plumbing business in Phoenix',
      'Model SBA financing for a $1.5M acquisition target',
      "I'm a broker with 12 active listings — how can Yulia help?",
    ],
    tagline: 'Seven Layers of Intelligence\u2122 · Live Federal Data · Any Deal Size',
    placeholder: 'Tell Yulia about your deal — industry, location, revenue...',
  },
  sell: {
    overline: 'Strengthen & Sell',
    h1Line1: 'Know your number',
    h1Line2: 'before you negotiate.',
    subtitle: 'Most owners undervalue their business by $100K–$500K in hidden add-backs they never knew to claim. Yulia finds them in minutes — then calculates your true adjusted earnings, benchmarks your margins against the industry, and generates a defensible valuation backed by real transaction comps. Not a guess. A number you can defend at the closing table.',
    chips: [
      'What would a buyer pay for my HVAC company in Dallas?',
      'What add-backs am I missing on my P&L?',
      'Walk me through the selling process step by step',
    ],
    tagline: 'SDE Normalization · Add-back Discovery · Defensible Valuations · SBA Pre-qualification',
    placeholder: 'Tell Yulia about the business you want to sell — what you do, where, and approximate revenue...',
  },
  buy: {
    overline: 'Search & Acquire',
    h1Line1: 'Find the right deal.',
    h1Line2: "Know it\u2019s the right deal.",
    subtitle: "smbX.ai isn\u2019t a listing site — it\u2019s an intelligence engine. Define your acquisition thesis and Yulia maps your competitive landscape, models SBA financing against live federal rates, runs debt service coverage ratios, and identifies targets that match your criteria. From first-time SBA buyers to PE platform strategies. Conviction before you write the check.",
    chips: [
      'Can I finance a $2.4M dental practice target with an SBA 7(a) loan?',
      'Find highly fragmented markets for home services in the Sun Belt',
      'Evaluate this listing: [paste URL]',
    ],
    tagline: 'Thesis-to-Target Pipeline · Competitive Density · DSCR Modeling · Deal Structuring',
    placeholder: "Tell Yulia what you\u2019re looking for — industry, geography, deal size, or paste a listing URL...",
  },
  advisors: {
    overline: 'For Deal Professionals',
    h1Line1: 'Your expertise closes deals.',
    h1Line2: 'Now close more of them.',
    subtitle: "The intelligence infrastructure of a mega-firm — without the headcount. Package a new listing in minutes instead of weeks. Pre-screen SBA bankability before you waste time on unqualified buyers. Generate institutional-quality CIMs, valuations, and market reports from a conversation. White-label everything. Your brand, your client relationship — Yulia does the analytical heavy lifting.",
    chips: [
      "Package a new listing for my client\u2019s cleaning company",
      "Pre-screen a buyer\u2019s financials for SBA eligibility",
      'Generate a CIM from these raw financials',
    ],
    tagline: 'White-Label Deliverables · Serve More Clients · Intelligence On-Demand',
    placeholder: "Tell Yulia about your client\u2019s deal or your practice...",
  },
  pricing: {
    overline: 'Wallet & Pricing',
    h1Line1: 'If you could Google it,',
    h1Line2: 'it should be free.',
    subtitle: 'The advisory conversation is always free — because the underlying data comes from sovereign public sources. You invest only when you need personalized intelligence: contextualized analysis, localized market reports, and institutional-grade documents built for your specific deal. Free: what the data says. Premium: what the data means for your deal.',
    chips: [
      "What\u2019s included for free vs. premium?",
      'How does the wallet system work?',
    ],
    tagline: 'No Retainer · No Subscription · $1 = $1 Purchasing Power',
    placeholder: 'Ask Yulia about pricing, deliverables, or how the wallet works...',
  },
};

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
  if (path === '/advisors' || path === '/enterprise') return 'advisors';
  if (path === '/pricing') return 'pricing';
  return 'home';
}

function pathToViewState(path: string): ViewState {
  if (path === '/chat' || path.startsWith('/chat/')) return 'chat';
  if (path === '/pipeline') return 'pipeline';
  if (path === '/dataroom') return 'dataroom';
  if (path === '/settings') return 'settings';
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
  useAppHeight();

  // Core state
  const [viewState, setViewState] = useState<ViewState>(() => pathToViewState(location));
  const [activeTab, setActiveTab] = useState<TabId>(() => pathToTab(location));
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [viewingDeliverable, setViewingDeliverable] = useState<number | null>(null);
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
    if (convId && user) authChat.selectConversation(convId);
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
      if (convId && user) authChat.selectConversation(convId);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll on new messages
  useEffect(() => {
    if (viewState === 'chat') messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, viewState]);

  // Send handler — morph from landing to chat
  const handleSend = useCallback((content: string) => {
    if (viewState === 'landing') {
      setMorphing(true);
      if (user) authChat.sendMessage(content);
      else anonChat.sendMessage(content);
      setTimeout(() => {
        setViewState('chat');
        setMorphing(false);
        if (window.location.pathname !== '/chat') navigate('/chat');
      }, 450);
      return;
    }
    if (user) authChat.sendMessage(content);
    else anonChat.sendMessage(content);
  }, [viewState, user, authChat, anonChat, navigate]);

  // Chip click
  const handleChipClick = useCallback((text: string) => {
    dockRef.current?.clear();
    handleSend(text);
  }, [handleSend]);

  // Back to landing
  const handleBack = useCallback(() => {
    setViewState('landing');
    const urlMap: Record<TabId, string> = { home: '/', sell: '/sell', buy: '/buy', advisors: '/advisors', pricing: '/pricing' };
    navigate(urlMap[activeTab]);
  }, [activeTab, navigate]);

  // Tab click
  const handleTabClick = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setViewState('landing');
    setIsMobileSidebarOpen(false);
    const urlMap: Record<TabId, string> = { home: '/', sell: '/sell', buy: '/buy', advisors: '/advisors', pricing: '/pricing' };
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

  // Signup prompt
  const showSignup = !user && (
    anonChat.limitReached ||
    (anonChat.messagesRemaining !== null && anonChat.messagesRemaining <= 5 && anonChat.messages.length > 0)
  );

  // Redirect unauth from tool views
  useEffect(() => {
    if (['pipeline', 'dataroom', 'settings'].includes(viewState) && !user) navigate('/login');
  }, [viewState, user, navigate]);

  // Show dock
  const showDock = (viewState === 'landing' || viewState === 'chat') && !(!user && anonChat.limitReached);

  // Current page copy
  const page = PAGE_COPY[activeTab];
  const dockPlaceholder = viewState === 'chat' ? 'Reply to Yulia...' : page.placeholder;

  // Conversations
  const deals = (authChat.conversations || []).filter(c => c.deal_id != null);
  const recent = (authChat.conversations || []).filter(c => c.deal_id == null);

  /* ═══ DOCK CARD (shared between inline hero + bottom chat) ═══ */

  const dockCard = (
    <div
      className="bg-white shadow-2xl transition-all relative overflow-visible"
      style={{
        borderRadius: isMobile ? '32px' : '40px',
        border: '2px solid #D1D5DB',
      }}
    >
      <div className="flex items-center gap-2 px-6 pt-4 pb-0">
        {viewState === 'landing' ? (
          <>
            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <span className="text-[12px] font-black uppercase text-[#6E6A63]" style={{ letterSpacing: '0.08em' }}>
              Federal Data Sync Active
            </span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-[#D4714E] shrink-0" />
            <span className="text-[12px] font-black text-[#6E6A63]" style={{ letterSpacing: '0.08em' }}>
              smb<span className="text-[#D4714E]">X</span>.ai <span className="text-[#D4714E]">Engine</span>
              <span className="text-[#9CA3AF] font-medium mx-1.5">&middot;</span>
              <span className="text-[#9CA3AF] font-medium normal-case" style={{ letterSpacing: 0 }}>
                Proprietary M&amp;A Intelligence
              </span>
            </span>
          </>
        )}
      </div>
      <ChatDock
        ref={dockRef}
        onSend={handleSend}
        variant="hero"
        placeholder={dockPlaceholder}
        disabled={sending}
      />
    </div>
  );

  /* ═══ SIDEBAR JSX ═══ */

  const sidebarContent = (mobile: boolean) => (
    <aside
      className="flex flex-col h-full bg-[#F9FAFB] select-none"
      style={{ width: mobile ? 288 : 288, borderRight: '1px solid #F3F4F6' }}
    >
      {/* Logo */}
      <div className="px-6 pt-6 pb-2">
        <span className="text-[24px] font-black tracking-tight leading-none" style={{ letterSpacing: '-0.03em' }}>
          smb<span className="text-[#D4714E]">X</span>.ai
        </span>
      </div>

      {/* New Workspace */}
      <div className="px-4 pt-4 pb-4">
        <button
          onClick={() => {
            if (user) { authChat.newConversation(); setViewState('chat'); navigate('/chat'); }
            else { setViewState('chat'); navigate('/chat'); }
            setIsMobileSidebarOpen(false);
          }}
          className="w-full bg-[#1A1A18] text-white font-bold text-[14px] px-4 py-3 rounded-xl cursor-pointer border-none hover:bg-[#333] transition-colors"
          style={{ fontFamily: 'inherit' }}
          type="button"
        >
          + New Workspace
        </button>
      </div>

      {/* Nav */}
      <div className="px-3">
        <div className="text-[10px] font-black uppercase text-[#6E6A63] px-4 mb-2" style={{ letterSpacing: '0.25em' }}>
          Use Cases
        </div>
        <nav className="space-y-0.5">
          {NAV_ITEMS.map(item => {
            const isActive = activeTab === item.id && viewState === 'landing';
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[14px] cursor-pointer border-none transition-all ${
                  isActive
                    ? 'bg-white shadow-sm text-[#1A1A18] font-bold'
                    : 'bg-transparent text-[#6E6A63] hover:bg-white font-medium'
                }`}
                style={{ fontFamily: 'inherit' }}
                type="button"
              >
                <span className={isActive ? 'text-[#D4714E]' : 'text-[#9CA3AF]'}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 mt-4">
        {user && deals.length > 0 && (
          <div className="mb-3">
            <div className="text-[10px] font-black uppercase text-[#D4714E] px-4 mb-2" style={{ letterSpacing: '0.25em' }}>
              Active Deals
            </div>
            {deals.map(c => (
              <button
                key={c.id}
                onClick={() => {
                  authChat.selectConversation(c.id);
                  setViewState('chat');
                  navigate(`/chat/${c.id}`);
                  setIsMobileSidebarOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[13px] cursor-pointer border-none transition-all ${
                  c.id === authChat.activeConversationId && viewState === 'chat'
                    ? 'bg-white shadow-sm font-semibold text-[#1A1A18]'
                    : 'bg-transparent text-[#6E6A63] hover:bg-white font-medium'
                }`}
                style={{ fontFamily: 'inherit' }}
                type="button"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: c.journey ? (JOURNEY_COLORS[c.journey] || '#6E6A63') : '#9CA3AF' }}
                />
                <span className="truncate flex-1 min-w-0 text-left">{c.title}</span>
              </button>
            ))}
          </div>
        )}

        {user && recent.length > 0 && (
          <div>
            <div className="text-[10px] font-black uppercase text-[#6E6A63] px-4 mb-2" style={{ letterSpacing: '0.25em' }}>
              Recent
            </div>
            {recent.map(c => (
              <button
                key={c.id}
                onClick={() => {
                  authChat.selectConversation(c.id);
                  setViewState('chat');
                  navigate(`/chat/${c.id}`);
                  setIsMobileSidebarOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-4 py-2 rounded-xl text-[13px] cursor-pointer border-none transition-all ${
                  c.id === authChat.activeConversationId && viewState === 'chat'
                    ? 'bg-white shadow-sm font-medium text-[#1A1A18]'
                    : 'bg-transparent text-[#6E6A63] hover:bg-white font-medium'
                }`}
                style={{ fontFamily: 'inherit' }}
                type="button"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: c.journey ? (JOURNEY_COLORS[c.journey] || '#6E6A63') : '#9CA3AF' }}
                />
                <span className="truncate flex-1 min-w-0 text-left">{c.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto border-t px-4 py-3 space-y-1" style={{ borderColor: '#F3F4F6' }}>
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
    <div id="app-root" className="flex bg-white font-sans overflow-hidden" style={{ height: '100dvh' }}>
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
        {/* Header — 80px, backdrop-blur */}
        <header
          className="flex-shrink-0 flex items-center justify-between h-20 px-6 z-20"
          style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid #F3F4F6' }}
        >
          <div className="flex items-center gap-3">
            {isMobile && (
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-transparent border-none cursor-pointer text-[#6E6A63] hover:bg-gray-50"
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            )}
            {isMobile ? (
              <span className="text-[22px] font-black tracking-tight leading-none" style={{ letterSpacing: '-0.03em' }}>
                smb<span className="text-[#D4714E]">X</span>.ai
              </span>
            ) : (
              <>
                <span className="w-[3px] h-5 bg-[#D4714E] rounded-full" />
                <span className="text-[10px] font-black uppercase text-[#6E6A63]" style={{ letterSpacing: '0.2em' }}>
                  M&amp;A OS / {activeTab === 'home' ? 'Home' : activeTab === 'sell' ? 'Sell' : activeTab === 'buy' ? 'Buy' : activeTab === 'advisors' ? 'Advisors' : 'Pricing'}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!user && (
              <button
                onClick={() => navigate('/login')}
                className="bg-[#1A1A18] text-white text-[14px] font-bold px-5 py-2.5 rounded-full border-none cursor-pointer hover:bg-[#333] transition-colors"
                style={{ fontFamily: 'inherit' }}
                type="button"
              >
                Log in
              </button>
            )}
            {user && (
              <span className="text-[13px] font-medium text-[#6E6A63]">{user.display_name || user.email}</span>
            )}
          </div>
        </header>

        {/* Scroll area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto min-h-0"
          style={{ WebkitOverflowScrolling: 'touch' } as any}
        >
          {/* ════ LANDING MODE ════ */}
          {viewState === 'landing' && (
            <div key={activeTab} style={{ animation: morphing ? 'morphOut 0.45s ease forwards' : 'fadeIn 0.4s ease', pointerEvents: morphing ? 'none' as const : undefined }}>
              {/* Hero — viewport-height, centered in middle 2/3, even gaps */}
              <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6" style={{ gap: '7vh' }}>
                {/* Headline group */}
                <div className="w-full max-w-5xl text-center">
                  {page.overline && (
                    <div
                      className="inline-block px-5 py-2 rounded-full bg-[#FFF0EB] text-[#D4714E]"
                      style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '24px' }}
                    >
                      {page.overline}
                    </div>
                  )}
                  <h1
                    className="text-[36px] md:text-[56px] font-extrabold leading-[1.08]"
                    style={{ letterSpacing: '-0.04em', marginBottom: '20px' }}
                  >
                    {page.h1Line1}
                    {page.h1Line2 && (<><br /><span className="text-[#D4714E]">{page.h1Line2}</span></>)}
                  </h1>
                  <p className="text-[16px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl mx-auto" style={{ lineHeight: 1.65 }}>
                    {page.subtitle}
                  </p>
                </div>

                {/* Chat bar */}
                <div className="w-full max-w-[860px]">
                  {dockCard}
                </div>

                {/* Chips + tagline */}
                <div className="flex flex-col items-center">
                  <div className="flex flex-wrap justify-center gap-3 max-w-3xl" style={{ marginBottom: '16px' }}>
                    {page.chips.map(chip => (
                      <button
                        key={chip}
                        onClick={() => handleChipClick(chip)}
                        className="bg-white border border-[#F3F4F6] px-5 py-3 cursor-pointer hover:border-[#D4714E] hover:text-[#D4714E] transition-all text-[#6E6A63]"
                        style={{ borderRadius: '12px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'inherit' }}
                        type="button"
                      >
                        &ldquo;{chip}&rdquo;
                      </button>
                    ))}
                  </div>
                  <div
                    className="text-center text-[#9CA3AF]"
                    style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}
                  >
                    {page.tagline}
                  </div>
                </div>
              </div>

              {/* ════ BELOW-FOLD SECTIONS ════ */}
              {activeTab === 'home' && (
                <div>
                  {/* Trust Bar */}
                  <section className="px-6 pt-24">
                    <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                      <span className="text-[10px] font-black uppercase text-[#9CA3AF]" style={{ letterSpacing: '0.15em' }}>Powered by</span>
                      {['U.S. Census Bureau', 'Bureau of Labor Statistics', 'Federal Reserve (FRED)', 'SEC EDGAR', 'SBA'].map(s => (
                        <span key={s} className="text-[11px] font-bold text-[#6E6A63]">{s}</span>
                      ))}
                    </div>
                  </section>

                  {/* Section 2: Intelligence Advantage Bento */}
                  <section className="px-6" style={{ paddingTop: '160px' }}>
                    <div className="max-w-5xl mx-auto">
                      <div className="text-center mb-16">
                        <div className="text-[#D4714E] mb-4" style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                          Why it works
                        </div>
                        <h2 className="text-[36px] md:text-[48px] font-extrabold mb-6" style={{ letterSpacing: '-0.04em' }}>
                          The data is public. The intelligence is not.
                        </h2>
                        <p className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl mx-auto" style={{ lineHeight: 1.65 }}>
                          Census records, BLS wage data, SBA lending rates, SEC filings — it&apos;s all publicly available. What doesn&apos;t exist is someone who can synthesize all of it into a deal-specific analysis in minutes. That&apos;s what Yulia does. Through the smbX.ai Engine.
                        </p>
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        {/* Large card — Seven Layers */}
                        <div className="md:col-span-2 bg-[#F9FAFB] p-10 md:p-12" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
                          <div className="flex items-center gap-3 mb-6">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4714E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
                            </svg>
                            <span className="text-[10px] font-black uppercase text-[#6E6A63]" style={{ letterSpacing: '0.15em' }}>
                              Proprietary Tech &middot; smbX.ai Engine
                            </span>
                          </div>
                          <h3 className="text-[28px] md:text-[36px] font-extrabold mb-4" style={{ letterSpacing: '-0.03em' }}>
                            Seven Layers of Intelligence&trade;
                          </h3>
                          <p className="text-[18px] font-medium text-[#6E6A63] mb-8" style={{ lineHeight: 1.6 }}>
                            Every deal Yulia touches is analyzed across seven dimensions: Industry Structure, Regional Economics, Financial Normalization, Buyer Landscape, Deal Architecture, Risk Assessment, and Forward Signals. She adapts her methodology, her metrics, and her deliverables to the deal in front of you — whether it&apos;s a $400K service business or a $400M platform acquisition.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {['Add-back Discovery', 'Competitive Density', 'SBA 7(a) Modeling', 'Multiple Calibration', 'DSCR Analysis', 'Market Fragmentation'].map(tag => (
                              <span key={tag} className="bg-white border border-[#F3F4F6] text-[#6E6A63] px-3 py-1.5" style={{ borderRadius: '12px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Small card 1 — Localized */}
                        <div className="bg-[#F9FAFB] p-10 md:p-12 flex flex-col justify-between" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
                          <span className="text-[48px] font-black text-[#D4714E] leading-none mb-4">01</span>
                          <h3 className="text-[22px] font-extrabold mb-3" style={{ letterSpacing: '-0.02em' }}>
                            Localized to your market
                          </h3>
                          <p className="text-[15px] font-medium text-[#6E6A63]" style={{ lineHeight: 1.6 }}>
                            National averages hide what matters. Yulia delivers intelligence down to your MSA — exact competitor counts from Census, regional wage benchmarks from BLS, and PE consolidation activity in your geography. Your deal. Your market. Your data.
                          </p>
                        </div>
                      </div>

                      {/* Second row */}
                      <div className="grid md:grid-cols-3 gap-6 mt-6">
                        {/* Small card 2 — Deal size */}
                        <div className="bg-[#F9FAFB] p-10 md:p-12 flex flex-col justify-between" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
                          <span className="text-[48px] font-black text-[#D4714E] leading-none mb-4">02</span>
                          <h3 className="text-[22px] font-extrabold mb-3" style={{ letterSpacing: '-0.02em' }}>
                            Adapts to every deal size
                          </h3>
                          <p className="text-[15px] font-medium text-[#6E6A63]" style={{ lineHeight: 1.6 }}>
                            The right analysis for a $400K landscaping company is fundamentally different from a $40M manufacturing platform. Yulia knows when to use SDE vs. EBITDA, when to model SBA vs. conventional financing, and when to shift from owner-operator metrics to institutional methodology.
                          </p>
                        </div>

                        {/* Terra accent card */}
                        <div className="md:col-span-2 bg-[#D4714E] text-white p-10 md:p-12" style={{ borderRadius: '48px' }}>
                          <h3 className="text-[28px] md:text-[36px] font-extrabold mb-4" style={{ letterSpacing: '-0.03em' }}>
                            The analytical firepower of a full advisory team. In your pocket.
                          </h3>
                          <p className="text-[18px] font-medium text-orange-100" style={{ lineHeight: 1.6 }}>
                            Defensible valuations. 25-page CIMs. Localized market intelligence reports. SBA bankability models with live federal rates. Buyer qualification screening. Deal structuring. All generated from a conversation.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Section 3: Conversation Preview */}
                  <section className="px-6" style={{ paddingTop: '160px' }}>
                    <div className="max-w-4xl mx-auto">
                      <div className="text-center mb-16">
                        <div className="text-[#D4714E] mb-4" style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                          See Yulia in Action
                        </div>
                        <h2 className="text-[36px] md:text-[48px] font-extrabold" style={{ letterSpacing: '-0.04em' }}>
                          Five minutes. Real intelligence.
                        </h2>
                      </div>

                      <div className="space-y-8">
                        {/* User message */}
                        <div className="flex justify-end">
                          <div className="max-w-[80%] bg-gray-50 border border-gray-200 text-[#1A1A18]" style={{ borderRadius: '40px', borderTopRightRadius: '4px', padding: '28px 36px' }}>
                            <p className="text-[18px] md:text-[22px] font-medium m-0" style={{ lineHeight: 1.6 }}>
                              I&apos;m thinking about selling my commercial HVAC company. We&apos;re in Dallas-Fort Worth, about $4.2M in revenue and $780K in adjusted EBITDA last year.
                            </p>
                          </div>
                        </div>

                        {/* Yulia response */}
                        <div className="flex justify-start gap-4">
                          <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#D4714E] text-white flex items-center justify-center text-[20px] mt-1" style={{ boxShadow: '0 2px 8px rgba(212,113,78,0.2)' }}>
                            ✦
                          </div>
                          <div className="max-w-[85%] bg-white border border-[#F3F4F6]" style={{ borderRadius: '40px', borderTopLeftRadius: '4px', padding: '28px 36px' }}>
                            <p className="text-[18px] md:text-[22px] font-medium text-[#1A1A18] mb-6" style={{ lineHeight: 1.6 }}>
                              Commercial HVAC in DFW — that&apos;s a strong combination right now. Let me run this through the methodology...
                            </p>
                            <p className="text-[16px] font-medium text-[#6E6A63] mb-6" style={{ lineHeight: 1.6 }}>
                              Your $780K EBITDA puts you in the institutional range, which means we&apos;re working with EBITDA-based multiples rather than SDE. For commercial HVAC in the Dallas-Fort Worth MSA, current multiples are running 4.8&times;&ndash;6.2&times; based on comparable transactions and PE activity in the space.
                            </p>

                            {/* Valuation card */}
                            <div className="bg-[#F9FAFB] border border-[#F3F4F6] p-8 mb-6" style={{ borderRadius: '24px' }}>
                              <div className="text-[12px] font-bold uppercase text-[#6E6A63] mb-1" style={{ letterSpacing: '0.1em' }}>
                                Preliminary Enterprise Value
                              </div>
                              <div className="text-[36px] font-black text-[#1A1A18] mb-2">$3.7M &ndash; $4.8M</div>
                              <div className="text-[12px] font-medium text-[#9CA3AF]">EBITDA &times; Industry Multiple (4.8&ndash;6.2&times;)</div>
                              <div className="text-[11px] font-medium text-[#9CA3AF] mt-1">Census CBP &middot; BLS QCEW &middot; PE Transaction Comps</div>
                            </div>

                            {/* Insights */}
                            <div className="space-y-4">
                              <div className="flex items-start gap-3 bg-green-50 p-5" style={{ borderRadius: '16px', border: '1px solid rgba(34,197,94,0.15)' }}>
                                <span className="text-green-600 font-black text-[18px] mt-0.5">&#10003;</span>
                                <p className="text-[16px] font-medium text-[#1A1A18] m-0" style={{ lineHeight: 1.6 }}>
                                  DFW has 847 HVAC businesses per Census data, but only ~12% are commercial-focused. I&apos;m tracking 14 active PE roll-up platforms in Texas alone. You&apos;re in a seller&apos;s market.
                                </p>
                              </div>
                              <div className="flex items-start gap-3 bg-amber-50 p-5" style={{ borderRadius: '16px', border: '1px solid rgba(245,158,11,0.15)' }}>
                                <span className="text-amber-600 font-black text-[18px] mt-0.5">!</span>
                                <p className="text-[16px] font-medium text-[#1A1A18] m-0" style={{ lineHeight: 1.6 }}>
                                  Your 18.6% EBITDA margin is slightly below the 21% sector median. Optimization here before going to market could move your enterprise value $200K–$400K. Want me to identify the specific cost lines to target?
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Section 4: Audience Grid */}
                  <section className="px-6" style={{ paddingTop: '160px' }}>
                    <div className="max-w-5xl mx-auto text-center mb-12">
                      <h2 className="text-[36px] md:text-[48px] font-extrabold" style={{ letterSpacing: '-0.04em' }}>
                        Built for everyone in the deal.
                      </h2>
                    </div>
                    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
                      {/* Card 1: Owners */}
                      <div className="bg-[#F9FAFB] p-10" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
                        <div className="w-12 h-12 rounded-2xl bg-[#FFF0EB] flex items-center justify-center mb-6">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4714E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
                          </svg>
                        </div>
                        <h3 className="text-[22px] font-extrabold mb-3">Owners &amp; Acquirers</h3>
                        <p className="text-[16px] font-medium text-[#6E6A63] mb-6" style={{ lineHeight: 1.6 }}>
                          Know your number before you negotiate. Find hidden add-backs. Model SBA financing. Get a defensible valuation — in minutes, not months. Whether you&apos;re selling a $500K service business or acquiring a $30M platform.
                        </p>
                        <button onClick={() => handleChipClick('Tell Yulia about your deal')} className="text-[#D4714E] text-[14px] font-bold bg-transparent border-none cursor-pointer hover:underline" style={{ fontFamily: 'inherit' }} type="button">
                          Tell Yulia about your deal &rarr;
                        </button>
                      </div>

                      {/* Card 2: Brokers */}
                      <div className="bg-[#F9FAFB] p-10" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
                        <div className="w-12 h-12 rounded-2xl bg-[#FFF0EB] flex items-center justify-center mb-6">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4714E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                          </svg>
                        </div>
                        <h3 className="text-[22px] font-extrabold mb-3">Brokers &amp; Advisors</h3>
                        <p className="text-[16px] font-medium text-[#6E6A63] mb-6" style={{ lineHeight: 1.6 }}>
                          The intelligence infrastructure of a mega-firm — in your pocket. Package listings in minutes, qualify buyers instantly, generate institutional-quality deliverables, and serve deals at every price point. Your expertise. Our engine.
                        </p>
                        <button onClick={() => handleTabClick('advisors')} className="text-[#D4714E] text-[14px] font-bold bg-transparent border-none cursor-pointer hover:underline" style={{ fontFamily: 'inherit' }} type="button">
                          See how advisors use smbX &rarr;
                        </button>
                      </div>

                      {/* Card 3: PE / Search Funds */}
                      <div className="bg-[#F9FAFB] p-10" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
                        <div className="w-12 h-12 rounded-2xl bg-[#FFF0EB] flex items-center justify-center mb-6">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4714E" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                        </div>
                        <h3 className="text-[22px] font-extrabold mb-3">PE, Search Funds &amp; Family Offices</h3>
                        <p className="text-[16px] font-medium text-[#6E6A63] mb-6" style={{ lineHeight: 1.6 }}>
                          Source targets against your thesis. Screen markets by fragmentation and density. Build conviction with localized comps, DSCR modeling, and competitive dynamics — at the speed your deal flow demands.
                        </p>
                        <button onClick={() => handleChipClick('Tell Yulia your acquisition thesis')} className="text-[#D4714E] text-[14px] font-bold bg-transparent border-none cursor-pointer hover:underline" style={{ fontFamily: 'inherit' }} type="button">
                          Tell Yulia your acquisition thesis &rarr;
                        </button>
                      </div>

                      {/* Card 4: Attorneys, CPAs */}
                      <div className="bg-[#F9FAFB] p-10" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
                        <div className="w-12 h-12 rounded-2xl bg-[#FFF0EB] flex items-center justify-center mb-6">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4714E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
                          </svg>
                        </div>
                        <h3 className="text-[22px] font-extrabold mb-3">Attorneys, CPAs &amp; Lenders</h3>
                        <p className="text-[16px] font-medium text-[#6E6A63] mb-6" style={{ lineHeight: 1.6 }}>
                          Walk into every engagement with complete deal context. Financials, market position, competitive landscape, SBA eligibility — organized, sourced, and ready for diligence. Referral partnerships available.
                        </p>
                        <button onClick={() => handleTabClick('advisors')} className="text-[#D4714E] text-[14px] font-bold bg-transparent border-none cursor-pointer hover:underline" style={{ fontFamily: 'inherit' }} type="button">
                          See professional tools &rarr;
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Section 5: Traceability */}
                  <section className="px-6" style={{ paddingTop: '160px' }}>
                    <div className="max-w-4xl mx-auto text-center">
                      <h2 className="text-[36px] md:text-[48px] font-extrabold mb-8" style={{ letterSpacing: '-0.04em' }}>
                        Every insight is traceable. Every analysis is explainable.
                      </h2>
                      <p className="text-[18px] md:text-[22px] font-medium text-[#6E6A63] max-w-3xl mx-auto mb-12" style={{ lineHeight: 1.6 }}>
                        smbX.ai is built on data from agencies required by law to collect it — the same sovereign data sources that power the Federal Reserve, Wall Street research desks, and the world&apos;s largest financial institutions. We don&apos;t guess. We synthesize, cite, and show our work. That&apos;s the difference between a chatbot and an intelligence platform.
                      </p>
                      <div className="inline-block bg-[#D4714E] text-white px-8 py-5" style={{ borderRadius: '24px' }}>
                        <span className="text-[18px] font-bold">
                          The operating system for the largest wealth transfer in American history.
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Footer */}
                  <footer className="text-center py-24 mt-32">
                    <p className="text-[12px] font-medium text-[#9CA3AF]" style={{ letterSpacing: '0.1em' }}>
                      Established MMXXIV — Deal Intelligence Infrastructure
                    </p>
                  </footer>
                </div>
              )}

              {/* ════ SELL BELOW-FOLD ════ */}
              {activeTab === 'sell' && (
                <div>
                  {/* Trust Bar */}
                  <section className="px-6 pt-24">
                    <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                      <span className="text-[10px] font-black uppercase text-[#9CA3AF]" style={{ letterSpacing: '0.15em' }}>Powered by</span>
                      {['U.S. Census', 'BLS', 'SBA', 'FRED'].map(s => (
                        <span key={s} className="text-[11px] font-bold text-[#6E6A63]">{s}</span>
                      ))}
                    </div>
                  </section>

                  {/* Seller's Problem */}
                  <section className="px-6" style={{ paddingTop: '160px' }}>
                    <div className="max-w-5xl mx-auto">
                      <div className="text-center mb-16">
                        <h2 className="text-[36px] md:text-[48px] font-extrabold mb-6" style={{ letterSpacing: '-0.04em' }}>
                          Stop guessing. Start proving.
                        </h2>
                        <p className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl mx-auto" style={{ lineHeight: 1.65 }}>
                          Selling a business is the most consequential financial decision most owners make. Your tax return isn&apos;t your valuation — it&apos;s designed to minimize taxes, not maximize sale price. Yulia reverses that: she identifies every legitimate add-back, normalizes your earnings, and builds the defensible case that justifies your asking price.
                        </p>
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        {/* Large card — Add-backs */}
                        <div className="md:col-span-2 bg-[#F9FAFB] p-10 md:p-12" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
                          <div className="flex items-center gap-3 mb-6">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4714E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                            <span className="text-[10px] font-black uppercase text-[#6E6A63]" style={{ letterSpacing: '0.15em' }}>
                              Valuation Engine &middot; SDE &amp; EBITDA Math
                            </span>
                          </div>
                          <h3 className="text-[28px] md:text-[36px] font-extrabold mb-4" style={{ letterSpacing: '-0.03em' }}>
                            Find the hidden money in your financials
                          </h3>
                          <p className="text-[18px] font-medium text-[#6E6A63]" style={{ lineHeight: 1.6 }}>
                            Your tax return suppresses value. Owner&apos;s salary, personal vehicles, family cell phones, one-time legal expenses, above-market rent to yourself — these are all legitimate add-backs that increase your Seller&apos;s Discretionary Earnings. Most owners miss $100K–$500K. Yulia identifies them systematically, then asks you to verify each one before it touches your valuation. The math is yours to own.
                          </p>
                        </div>

                        {/* Small card — SBA Pre-qual */}
                        <div className="bg-[#F9FAFB] p-10 md:p-12 flex flex-col justify-between" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
                          <div className="w-12 h-12 rounded-2xl bg-[#FFF0EB] flex items-center justify-center mb-6">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4714E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                          </div>
                          <h3 className="text-[22px] font-extrabold mb-3">SBA Pre-qualification</h3>
                          <p className="text-[15px] font-medium text-[#6E6A63]" style={{ lineHeight: 1.6 }}>
                            Can a buyer actually finance your asking price? Before you list, Yulia models live SBA 7(a) rates and calculates the Debt Service Coverage Ratio. A DSCR below 1.25&times; means the deal doesn&apos;t pencil for SBA — and 80%+ of deals under $5M use SBA lending. Know before you list.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Deliverables */}
                  <section className="px-6" style={{ paddingTop: '160px' }}>
                    <div className="max-w-5xl mx-auto">
                      <div className="text-center mb-16">
                        <div className="text-[#D4714E] mb-4" style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                          What you actually walk away with
                        </div>
                        <h2 className="text-[36px] md:text-[48px] font-extrabold mb-6" style={{ letterSpacing: '-0.04em' }}>
                          Not advice. Deliverables.
                        </h2>
                        <p className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl mx-auto" style={{ lineHeight: 1.65 }}>
                          You don&apos;t get chat suggestions. You get the same institutional-grade collateral that $25,000 advisory engagements produce — generated from your conversation with Yulia, backed by real data, ready to present to buyers, lenders, and your own advisors.
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        {[
                          { tag: 'Valuations', title: 'Defensible Valuation Reports', body: 'Multi-methodology analysis (SDE, EBITDA, DCF where applicable) with comparable transaction data, industry multiple benchmarks, and local market context. Built to withstand buyer scrutiny and lender review.' },
                          { tag: 'Marketing', title: 'Blind Teasers & CIMs', body: 'Anonymous blind teasers to test the market without revealing your identity. Full 25-page Confidential Information Memorandums for verified buyers — professionally formatted, data-backed, and presentation-ready.' },
                          { tag: 'Financing', title: 'SBA Bankability Models', body: 'Prove to buyers that your deal is financeable. Pre-filled Debt Service Coverage Ratio models using live federal interest rates. Sources & uses tables. Down payment estimates. The math lenders need to say yes.' },
                          { tag: 'Collaboration', title: 'Multi-Party Deal Rooms', body: 'One secure workspace where your attorney, CPA, broker, and prospective buyers can review everything Yulia generated. Role-based access. Version history. Nothing falls through the cracks.' },
                        ].map(card => (
                          <div key={card.tag} className="bg-[#F9FAFB] p-10" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
                            <span className="inline-block px-3 py-1 rounded-full bg-[#FFF0EB] text-[#D4714E] mb-4" style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                              {card.tag}
                            </span>
                            <h3 className="text-[22px] font-extrabold mb-3">{card.title}</h3>
                            <p className="text-[15px] font-medium text-[#6E6A63]" style={{ lineHeight: 1.6 }}>{card.body}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Broker Callout */}
                  <section className="px-6" style={{ paddingTop: '160px' }}>
                    <div className="max-w-4xl mx-auto bg-[#F9FAFB] p-10 md:p-12" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
                      <h3 className="text-[28px] md:text-[36px] font-extrabold mb-4" style={{ letterSpacing: '-0.03em' }}>
                        Working with a broker? Even better.
                      </h3>
                      <p className="text-[18px] font-medium text-[#6E6A63]" style={{ lineHeight: 1.6 }}>
                        Great brokers close deals faster when the analytical foundation is already built. Bring your smbX.ai valuation and market intelligence to your first advisor meeting. Your broker focuses on what they do best — relationships, negotiations, and strategic counsel. Yulia handles the data assembly they&apos;d otherwise spend weeks on manually.
                      </p>
                    </div>
                  </section>

                  <footer className="text-center py-24 mt-32">
                    <p className="text-[12px] font-medium text-[#9CA3AF]" style={{ letterSpacing: '0.1em' }}>
                      Established MMXXIV — Deal Intelligence Infrastructure
                    </p>
                  </footer>
                </div>
              )}

              {/* ════ BUY BELOW-FOLD ════ */}
              {activeTab === 'buy' && (
                <div>
                  {/* Trust Bar */}
                  <section className="px-6 pt-24">
                    <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                      <span className="text-[10px] font-black uppercase text-[#9CA3AF]" style={{ letterSpacing: '0.15em' }}>Powered by</span>
                      {['Federal Reserve (FRED)', 'SEC EDGAR', 'SBA', 'U.S. Census', 'BLS'].map(s => (
                        <span key={s} className="text-[11px] font-bold text-[#6E6A63]">{s}</span>
                      ))}
                    </div>
                  </section>

                  {/* Buyer's Advantage */}
                  <section className="px-6" style={{ paddingTop: '160px' }}>
                    <div className="max-w-5xl mx-auto">
                      <div className="text-center mb-16">
                        <h2 className="text-[36px] md:text-[48px] font-extrabold mb-6" style={{ letterSpacing: '-0.04em' }}>
                          Institutional intelligence. Zero wait time.
                        </h2>
                        <p className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl mx-auto" style={{ lineHeight: 1.65 }}>
                          The smbX.ai Engine evaluates targets the way a deal team does — competitive landscape, financial normalization, financing feasibility, and risk factors — but in minutes instead of weeks. Whether you&apos;re evaluating your first SBA acquisition or running a multi-state roll-up strategy.
                        </p>
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 bg-[#F9FAFB] p-10 md:p-12" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
                          <h3 className="text-[28px] md:text-[36px] font-extrabold mb-4" style={{ letterSpacing: '-0.03em' }}>
                            Instant SBA bankability &amp; DSCR
                          </h3>
                          <p className="text-[18px] font-medium text-[#6E6A63]" style={{ lineHeight: 1.6 }}>
                            SBA financing feasibility, debt service coverage ratios, cash-on-cash return projections, and capital stack optimization — modeled side by side using live federal rates from FRED. Know which deal structures work before you draft the LOI. Know which targets are bankable before you schedule the call.
                          </p>
                        </div>
                        <div className="bg-[#F9FAFB] p-10 md:p-12 flex flex-col justify-between" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
                          <h3 className="text-[22px] font-extrabold mb-3">Target Evaluation</h3>
                          <p className="text-[15px] font-medium text-[#6E6A63]" style={{ lineHeight: 1.6 }}>
                            Valuation benchmarking against comparable transactions. Red-flag identification — customer concentration, owner dependency, margin compression. Competitive density analysis from Census data. Is the asking price justified? Yulia shows the math.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Buyer Journey Steps */}
                  <section className="px-6" style={{ paddingTop: '160px' }}>
                    <div className="max-w-5xl mx-auto">
                      <div className="text-center mb-16">
                        <h2 className="text-[36px] md:text-[48px] font-extrabold mb-6" style={{ letterSpacing: '-0.04em' }}>
                          Move with the speed of an institutional fund.
                        </h2>
                        <p className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl mx-auto" style={{ lineHeight: 1.65 }}>
                          Whether you&apos;re a solo searcher evaluating your first acquisition or a platform running a buy-and-build strategy, smbX.ai scales with your thesis.
                        </p>
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        {[
                          { step: '01', title: 'Instant Conviction', body: "Stop wasting weeks on targets that don\u2019t pencil out. Run the math — multiples, DSCR, SBA eligibility, cash-on-cash returns — before you ever schedule the first call. If it doesn\u2019t work at these rates, move on." },
                          { step: '02', title: 'Capital Stack Clarity', body: "Know exactly how you\u2019ll fund the deal. Yulia models the senior debt, seller financing, equity injection, and earnout required to hit your target return. Sources & uses tables generated in seconds." },
                          { step: '03', title: 'Negotiation Leverage', body: 'Sellers respect buyers who know the market. Walk into negotiations armed with exact competitor counts from Census data, regional wage benchmarks from BLS, and PE roll-up activity in the target\u2019s geography. Data wins deals.' },
                        ].map(s => (
                          <div key={s.step} className="bg-[#F9FAFB] p-10" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
                            <span className="text-[48px] font-black text-[#D4714E] leading-none mb-4 block">{s.step}</span>
                            <h3 className="text-[22px] font-extrabold mb-3">{s.title}</h3>
                            <p className="text-[15px] font-medium text-[#6E6A63]" style={{ lineHeight: 1.6 }}>{s.body}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Search Intelligence Story */}
                  <section className="px-6" style={{ paddingTop: '160px' }}>
                    <div className="max-w-4xl mx-auto bg-[#D4714E] text-white p-10 md:p-12" style={{ borderRadius: '48px' }}>
                      <h3 className="text-[28px] md:text-[36px] font-extrabold mb-4" style={{ letterSpacing: '-0.03em' }}>
                        We don&apos;t list businesses. We find intelligence.
                      </h3>
                      <p className="text-[18px] font-medium text-orange-100" style={{ lineHeight: 1.6 }}>
                        BizBuySell has listings. smbX.ai has intelligence. Define your acquisition thesis — industry, geography, deal size, financial profile — and Yulia maps the entire landscape. How many operators exist in your target market. Which are PE-held vs. family-owned. Where fragmentation creates roll-up opportunity. What the historical SBA lending volume tells you about deal flow. The listings are one data point. The intelligence is the whole picture.
                      </p>
                    </div>
                  </section>

                  <footer className="text-center py-24 mt-32">
                    <p className="text-[12px] font-medium text-[#9CA3AF]" style={{ letterSpacing: '0.1em' }}>
                      Established MMXXIV — Deal Intelligence Infrastructure
                    </p>
                  </footer>
                </div>
              )}

              {/* ════ ADVISORS BELOW-FOLD ════ */}
              {activeTab === 'advisors' && (
                <div>
                  {/* Advisor Advantage */}
                  <section className="px-6" style={{ paddingTop: '160px' }}>
                    <div className="max-w-5xl mx-auto">
                      <div className="text-center mb-16">
                        <div className="text-[#D4714E] mb-4" style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                          The Advisor Advantage
                        </div>
                        <h2 className="text-[36px] md:text-[48px] font-extrabold mb-6" style={{ letterSpacing: '-0.04em' }}>
                          Intelligence on demand for every engagement.
                        </h2>
                        <p className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl mx-auto" style={{ lineHeight: 1.65 }}>
                          Great advisors are limited by the same constraint: hours in the day. The smbX.ai Engine handles data assembly, financial modeling, and document formatting — so you can focus on what earns your fee: negotiations, relationships, and strategic counsel. This doesn&apos;t replace your expertise. It multiplies it.
                        </p>
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 bg-[#F9FAFB] p-10 md:p-12" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
                          <h3 className="text-[28px] md:text-[36px] font-extrabold mb-4" style={{ letterSpacing: '-0.03em' }}>
                            Package a new listing in minutes
                          </h3>
                          <p className="text-[18px] font-medium text-[#6E6A63]" style={{ lineHeight: 1.6 }}>
                            A new seller engagement used to mean days of manual research — pulling comps from memory, building a CIM in Word, estimating a valuation from experience. Tell Yulia about the business and get instant market intelligence, preliminary valuations, add-back identification, and SBA pre-qualification. Your listing is packaged before the engagement letter dries.
                          </p>
                        </div>
                        <div className="bg-[#F9FAFB] p-10 md:p-12 flex flex-col justify-between" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
                          <h3 className="text-[22px] font-extrabold mb-3">Qualify buyers instantly</h3>
                          <p className="text-[15px] font-medium text-[#6E6A63]" style={{ lineHeight: 1.6 }}>
                            Pre-screen buyer financials against live SBA requirements. Model DSCR and assess financing feasibility before you schedule a call. Stop wasting time on buyers who can&apos;t close.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* What Advisors Get */}
                  <section className="px-6" style={{ paddingTop: '160px' }}>
                    <div className="max-w-4xl mx-auto bg-[#D4714E] text-white p-10 md:p-12" style={{ borderRadius: '48px' }}>
                      <h3 className="text-[28px] md:text-[36px] font-extrabold mb-4" style={{ letterSpacing: '-0.03em' }}>
                        Serve deals you&apos;d otherwise turn away.
                      </h3>
                      <p className="text-[18px] font-medium text-orange-100" style={{ lineHeight: 1.6 }}>
                        The $500K–$2M deals that don&apos;t justify 40 hours of manual analysis become profitable when Yulia handles the intelligence layer. White-label everything — valuations, CIMs, market reports — under your brand. Your clients see your deliverables. You know the smbX.ai Engine built the foundation.
                      </p>
                    </div>
                  </section>

                  {/* Partnership CTA */}
                  <section className="px-6" style={{ paddingTop: '160px' }}>
                    <div className="max-w-4xl mx-auto text-center">
                      <h2 className="text-[36px] md:text-[48px] font-extrabold mb-6" style={{ letterSpacing: '-0.04em' }}>
                        Built with advisors. Growing with advisors.
                      </h2>
                      <p className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl mx-auto mb-10" style={{ lineHeight: 1.65 }}>
                        We&apos;re actively developing our advisor program — partnership tiers, volume pricing, co-branded capabilities, and a verified professional network. If you want to shape how this platform evolves for deal professionals, we want to hear from you.
                      </p>
                      <button
                        onClick={() => handleChipClick("I'm an advisor — tell me about the partnership program")}
                        className="bg-[#1A1A18] text-white text-[14px] font-bold px-8 py-4 rounded-full border-none cursor-pointer hover:bg-[#333] transition-colors"
                        style={{ fontFamily: 'inherit' }}
                        type="button"
                      >
                        Talk to our team
                      </button>
                    </div>
                  </section>

                  <footer className="text-center py-24 mt-32">
                    <p className="text-[12px] font-medium text-[#9CA3AF]" style={{ letterSpacing: '0.1em' }}>
                      Established MMXXIV — Deal Intelligence Infrastructure
                    </p>
                  </footer>
                </div>
              )}

              {/* ════ PRICING BELOW-FOLD ════ */}
              {activeTab === 'pricing' && (
                <div>
                  {/* Free Tier */}
                  <section className="px-6" style={{ paddingTop: '160px' }}>
                    <div className="max-w-5xl mx-auto">
                      <div className="text-center mb-16">
                        <h2 className="text-[36px] md:text-[48px] font-extrabold mb-6" style={{ letterSpacing: '-0.04em' }}>
                          Start here. It&apos;s on us.
                        </h2>
                        <p className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl mx-auto" style={{ lineHeight: 1.65 }}>
                          No credit card. No signup wall. Just tell Yulia about your deal.
                        </p>
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        {[
                          { title: 'Unlimited Advisory Conversation', body: "Ask anything about your deal, your market, or the process. Yulia\u2019s intelligence is always available. No message limits. No session caps." },
                          { title: 'Business Classification & League Assignment', body: "Yulia identifies your deal\u2019s financial framework — SDE vs. EBITDA — and maps the applicable buyer pool, methodology, and deal structure. Instantly." },
                          { title: 'Preliminary Valuation Range', body: 'An initial estimate based on industry multiples, your financial profile, and current market conditions. The starting point for every deal — yours in minutes.' },
                        ].map(card => (
                          <div key={card.title} className="bg-[#F9FAFB] p-10" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
                            <span className="text-[24px] text-[#D4714E] font-black mb-4 block">&#10003;</span>
                            <h3 className="text-[22px] font-extrabold mb-3">{card.title}</h3>
                            <p className="text-[15px] font-medium text-[#6E6A63]" style={{ lineHeight: 1.6 }}>{card.body}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Premium Deliverables */}
                  <section className="px-6" style={{ paddingTop: '160px' }}>
                    <div className="max-w-5xl mx-auto">
                      <div className="text-center mb-16">
                        <h2 className="text-[36px] md:text-[48px] font-extrabold mb-6" style={{ letterSpacing: '-0.04em' }}>
                          Go deeper when your deal is ready.
                        </h2>
                        <p className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl mx-auto" style={{ lineHeight: 1.65 }}>
                          Premium deliverables are generated when you need them. No subscriptions. No retainers. Your investment grows with your deal — and Yulia tells you exactly what it costs before you commit.
                        </p>
                      </div>

                      <div className="grid md:grid-cols-5 gap-6">
                        {/* Left column — deliverables */}
                        <div className="md:col-span-3 space-y-6">
                          <div className="text-[10px] font-black uppercase text-[#6E6A63] mb-2" style={{ letterSpacing: '0.15em' }}>
                            Premium Deliverables
                          </div>
                          {[
                            { title: 'Market Intelligence Report', desc: 'Comprehensive analysis of your industry, competitive landscape, and buyer activity — localized to your metro area. Census density, BLS wages, PE activity, and deal flow trends.', price: '$200' },
                            { title: 'Full Valuation Analysis', desc: 'Multi-methodology valuation (SDE/EBITDA/DCF) built to withstand buyer and lender scrutiny. Comparable transactions. Industry benchmarks. Defensible methodology.', price: '$350' },
                            { title: 'Confidential Information Memo (CIM)', desc: 'A professional 25+ page deal book presenting your business to potential buyers. Financial summary, market position, growth thesis, and competitive advantages — formatted and ready to distribute.', price: '$700' },
                          ].map(item => (
                            <div key={item.title} className="bg-[#F9FAFB] p-8" style={{ borderRadius: '32px', border: '1px solid #F3F4F6' }}>
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <h3 className="text-[18px] font-extrabold mb-2">{item.title}</h3>
                                  <p className="text-[14px] font-medium text-[#6E6A63]" style={{ lineHeight: 1.6 }}>{item.desc}</p>
                                </div>
                                <span className="text-[24px] font-black text-[#D4714E] shrink-0">{item.price}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Right column — wallet */}
                        <div className="md:col-span-2 bg-[#F9FAFB] p-10" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
                          <h3 className="text-[24px] font-extrabold mb-4">How the Wallet works.</h3>
                          <p className="text-[15px] font-medium text-[#6E6A63] mb-8" style={{ lineHeight: 1.6 }}>
                            smbX.ai uses a transparent wallet system. Add funds when you&apos;re ready for a premium deliverable. Yulia tells you exactly what it costs before you commit. No recurring charges. No hidden fees. $1 in your wallet equals $1 of purchasing power.
                          </p>
                          <div className="space-y-3">
                            {['No recurring charges', 'No hidden fees', '$1 in = $1 of purchasing power'].map(b => (
                              <div key={b} className="flex items-center gap-3">
                                <span className="text-[#D4714E] font-black">&#10003;</span>
                                <span className="text-[14px] font-bold text-[#1A1A18]">{b}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <footer className="text-center py-24 mt-32">
                    <p className="text-[12px] font-medium text-[#9CA3AF]" style={{ letterSpacing: '0.1em' }}>
                      Established MMXXIV — Deal Intelligence Infrastructure
                    </p>
                  </footer>
                </div>
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
                onBack={handleBack}
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

          {viewState === 'settings' && user && (
            <div className="max-w-3xl mx-auto px-4 py-6">
              <SettingsPanel user={user} onLogout={handleLogout} isFullscreen={true} />
            </div>
          )}
        </div>

        {/* ════ CHATDOCK — flex-shrink-0, iOS-safe ════ */}
        {showDock && viewState === 'chat' && (
          <div className="shrink-0 bg-white px-4 pt-2" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
            <div className="max-w-[860px] mx-auto">
              {dockCard}
            </div>
          </div>
        )}

        {/* Deliverable viewer overlay */}
        {viewingDeliverable !== null && (
          <div className="fixed inset-0 z-50 bg-white flex flex-col">
            <Canvas deliverableId={viewingDeliverable} onClose={() => setViewingDeliverable(null)} />
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
      `}</style>
    </div>
  );
}
