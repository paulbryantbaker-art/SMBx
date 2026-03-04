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
    h1Line1: 'We take the stress out of buying and selling any business.',
    h1Line2: '',
    subtitle: 'From \u201Cwhat\u2019s it worth?\u201D to \u201Cdeal closed\u201D \u2014 Yulia automates weeks of financial analysis, market intelligence, and deal preparation into a single guided conversation.',
    chips: [
      'Value my plumbing business in Phoenix',
      'Can I finance a $2M acquisition with SBA?',
      "I'm a broker \u2014 show me what Yulia can do",
    ],
    tagline: 'Powered by live U.S. federal data \u00B7 Any deal size \u00B7 Every number is sourced',
    placeholder: 'Tell Yulia about your deal...',
  },
  sell: {
    overline: 'Strengthen & Sell',
    h1Line1: 'Know what you\u2019re worth.',
    h1Line2: '',
    subtitle: 'Yulia finds the hidden value in your financials, builds a defensible number, and maps your path to close.',
    chips: [
      "What's my HVAC company worth in Dallas?",
      "What add-backs am I missing?",
      'Walk me through the process',
    ],
    tagline: 'SDE Normalization \u00B7 Add-back Discovery \u00B7 Defensible Valuations',
    placeholder: 'Tell Yulia about the business you want to sell...',
  },
  buy: {
    overline: 'Search & Acquire',
    h1Line1: 'Find it. Finance it. Close it.',
    h1Line2: '',
    subtitle: 'Define your thesis. Yulia maps the landscape, models the financing, and builds your conviction.',
    chips: [
      'Can I finance a $2M dental practice with SBA?',
      'Show me fragmented markets for home services',
      'Evaluate a target I found on BizBuySell',
    ],
    tagline: 'Thesis-to-Target \u00B7 DSCR Modeling \u00B7 Market Intelligence',
    placeholder: "Tell Yulia what you're looking for...",
  },
  advisors: {
    overline: 'For Deal Professionals',
    h1Line1: 'Close more deals. Faster.',
    h1Line2: '',
    subtitle: 'The intelligence infrastructure of a full-service firm. In your pocket.',
    chips: [
      'Package a new listing for my client',
      'Pre-screen a buyer for SBA eligibility',
      'Generate a CIM from raw financials',
    ],
    tagline: 'White-Label Deliverables \u00B7 Intelligence On-Demand',
    placeholder: "Tell Yulia about your client's deal...",
  },
  pricing: {
    overline: 'Simple Pricing',
    h1Line1: 'Free to start. Pay per deliverable.',
    h1Line2: '',
    subtitle: 'No subscriptions. No retainers. Your wallet, your pace.',
    chips: [
      "What's included for free?",
      'How does the wallet work?',
    ],
    tagline: '$1 = $1 Purchasing Power \u00B7 No Recurring Charges',
    placeholder: 'Ask about pricing or deliverables...',
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

  // Core state
  const [viewState, setViewState] = useState<ViewState>(() => pathToViewState(location));
  useAppHeight(viewState === 'chat');   // Only shrink viewport in chat mode; landing lets keyboard overlay naturally
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

  // Conversations
  const deals = (authChat.conversations || []).filter(c => c.deal_id != null);
  const recent = (authChat.conversations || []).filter(c => c.deal_id == null);

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
              {/* Hero — viewport-height, centered, even gaps */}
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
                  <div
                    className="bg-white shadow-2xl transition-all relative overflow-visible"
                    style={{ borderRadius: isMobile ? '32px' : '40px', border: '2px solid #D1D5DB' }}
                  >
                    <div className="flex items-center gap-2 px-6 pt-4 pb-0">
                      <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                      <span className="text-[12px] font-black uppercase text-[#6E6A63]" style={{ letterSpacing: '0.08em' }}>
                        Federal Data Sync Active
                      </span>
                    </div>
                    <ChatDock
                      ref={dockRef}
                      onSend={handleSend}
                      variant="hero"
                      placeholder={page.placeholder}
                      disabled={sending}
                    />
                  </div>
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
                  {/* Section 1: The One-Liner */}
                  <section className="px-6" style={{ paddingTop: '120px', paddingBottom: '120px' }}>
                    <div className="max-w-4xl mx-auto text-center">
                      <h2 className="text-[36px] md:text-[56px] font-extrabold" style={{ letterSpacing: '-0.04em' }}>
                        The data is public. The intelligence is not.
                      </h2>
                    </div>
                  </section>

                  {/* Section 2: What Happens — 5 Steps */}
                  <section className="px-6" style={{ paddingTop: '80px' }}>
                    <div className="max-w-5xl mx-auto">
                      <div className="text-center mb-16">
                        <h2 className="text-[36px] md:text-[48px] font-extrabold" style={{ letterSpacing: '-0.04em' }}>
                          Here&apos;s what Yulia does in the first five minutes.
                        </h2>
                      </div>
                      <div className="grid md:grid-cols-3 gap-6">
                        {[
                          { step: '01', title: 'She classifies your deal.', body: 'Industry, location, revenue, deal size \u2014 Yulia maps your business to the right financial framework in seconds. SDE or EBITDA. SBA or conventional. Owner-operator or institutional.' },
                          { step: '02', title: 'She finds your hidden value.', body: 'Most owners undervalue their business by $100K\u2013$500K in add-backs they never knew to claim. Personal vehicles. Family cell phones. One-time legal fees. Yulia identifies them line by line.' },
                          { step: '03', title: 'She benchmarks your market.', body: 'How many competitors in your metro? What are they trading at? Which PE firms are actively acquiring in your sector? Yulia pulls live Census, BLS, and transaction data specific to your geography.' },
                        ].map(s => (
                          <div key={s.step} className="bg-[#F9FAFB] p-10" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
                            <span className="text-[48px] font-black text-[#D4714E] leading-none mb-4 block">{s.step}</span>
                            <h3 className="text-[22px] font-extrabold mb-3">{s.title}</h3>
                            <p className="text-[15px] font-medium text-[#6E6A63]" style={{ lineHeight: 1.6 }}>{s.body}</p>
                          </div>
                        ))}
                      </div>
                      <div className="grid md:grid-cols-2 gap-6 mt-6">
                        {[
                          { step: '04', title: 'She gives you a defensible number.', body: 'Not a guess. A multi-methodology valuation backed by real comparable transactions, industry multiples, and local market conditions. Built to withstand buyer scrutiny and lender review.' },
                          { step: '05', title: 'She tells you what to do next.', body: 'Optimize EBITDA before listing? Find SBA-qualified buyers? Engage an advisor? Yulia maps the path forward based on your specific deal, timeline, and goals.' },
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

                  {/* Section 3: Conversation Preview */}
                  <section className="px-6" style={{ paddingTop: '160px' }}>
                    <div className="max-w-4xl mx-auto">
                      <div className="text-center mb-16">
                        <h2 className="text-[36px] md:text-[48px] font-extrabold" style={{ letterSpacing: '-0.04em' }}>
                          See it happen.
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
                              Commercial HVAC in DFW &mdash; that&apos;s a strong combination right now. Let me run this through the methodology...
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
                                  Your 18.6% EBITDA margin is slightly below the 21% sector median. Optimization here before going to market could move your enterprise value $200K&ndash;$400K. Want me to identify the specific cost lines to target?
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
                      {[
                        {
                          title: "I\u2019m selling my business.",
                          body: "This is probably the biggest financial decision you\u2019ll ever make. Yulia makes sure you don\u2019t leave money on the table.\n\nShe finds every add-back in your financials, calculates your true adjusted earnings, benchmarks your margins against the industry, and generates a valuation you can defend at the closing table. Then she helps you find the right buyers and the right advisor.\n\nWhether your business does $500K or $50M in revenue.",
                          action: () => handleTabClick('sell'),
                          actionText: 'Start your valuation \u2192',
                        },
                        {
                          title: "I\u2019m buying a business.",
                          body: "Stop flying blind on targets.\n\nYulia models SBA financing against live federal rates, runs debt service coverage ratios, analyzes competitive density in your target market, and tells you whether the asking price is justified \u2014 before you schedule the first call.\n\nFrom your first acquisition to your twentieth.",
                          action: () => handleTabClick('buy'),
                          actionText: 'Evaluate a target \u2192',
                        },
                        {
                          title: "I\u2019m a broker or advisor.",
                          body: "You close deals. Yulia does the analysis.\n\nPackage a new listing in minutes \u2014 not weeks. Pre-screen buyers for SBA eligibility. Generate institutional-quality valuations, CIMs, and market reports. White-label everything under your brand.\n\nThe deals you used to turn away? Now they\u2019re profitable.",
                          action: () => handleTabClick('advisors'),
                          actionText: 'See advisor tools \u2192',
                        },
                        {
                          title: "I\u2019m an investor or search fund.",
                          body: "Source targets against your thesis. Screen markets by fragmentation and density. Build conviction with localized comps, DSCR modeling, and competitive dynamics.\n\nThe analysis that takes your team 40 hours? Ready in minutes.",
                          action: () => handleChipClick('Tell Yulia your acquisition thesis'),
                          actionText: 'Define your thesis \u2192',
                        },
                      ].map(card => (
                        <div key={card.title} className="bg-[#F9FAFB] p-10" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
                          <h3 className="text-[22px] font-extrabold mb-4">{card.title}</h3>
                          <p className="text-[15px] font-medium text-[#6E6A63] mb-6 whitespace-pre-line" style={{ lineHeight: 1.7 }}>{card.body}</p>
                          <button onClick={card.action} className="text-[#D4714E] text-[14px] font-bold bg-transparent border-none cursor-pointer hover:underline" style={{ fontFamily: 'inherit' }} type="button">
                            {card.actionText}
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Section 5: Seven Layers Engine */}
                  <section className="px-6" style={{ paddingTop: '160px' }}>
                    <div className="max-w-5xl mx-auto">
                      <div className="text-center mb-6">
                        <h2 className="text-[36px] md:text-[48px] font-extrabold mb-6" style={{ letterSpacing: '-0.04em' }}>
                          Seven layers deep. Every time.
                        </h2>
                        <p className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl mx-auto" style={{ lineHeight: 1.65 }}>
                          Every deal Yulia touches runs through the smbX.ai Engine &mdash; a seven-layer intelligence methodology built on live U.S. federal data.
                        </p>
                      </div>
                      <div className="space-y-4 mt-12">
                        {[
                          { n: '1', title: 'Industry Structure', body: 'What sector is this business in? How is it classified? What are the standard financial metrics, risk factors, and value drivers for this specific NAICS code?' },
                          { n: '2', title: 'Regional Economics', body: 'What does this market look like? Competitive density from Census. Wage benchmarks from BLS. Employment trends. Cost of living. Economic health of the MSA.' },
                          { n: '3', title: 'Financial Normalization', body: 'What is this business actually earning? SDE for owner-operators. EBITDA for institutional deals. Add-back identification. Margin benchmarking. Trend analysis across multiple years.' },
                          { n: '4', title: 'Buyer Landscape', body: 'Who buys businesses like this? Individual buyers via SBA? PE roll-up platforms? Strategic acquirers? Search fund operators? Yulia maps the buyer universe for your specific deal.' },
                          { n: '5', title: 'Deal Architecture', body: 'How should this deal be structured? Seller financing vs. SBA vs. conventional. Asset sale vs. stock sale. Earnout modeling. Working capital targets. Sources & uses.' },
                          { n: '6', title: 'Risk Assessment', body: 'What could kill this deal? Customer concentration. Owner dependency. Key person risk. Regulatory exposure. Litigation history. Yulia flags them before the buyer does.' },
                          { n: '7', title: 'Forward Signals', body: 'Where is this market heading? Industry consolidation trends. PE activity. Regulatory changes. Demand signals. The factors that move your multiple up \u2014 or down.' },
                        ].map(layer => (
                          <div key={layer.n} className="flex gap-6 items-start bg-[#F9FAFB] p-8" style={{ borderRadius: '32px', border: '1px solid #F3F4F6' }}>
                            <span className="text-[36px] font-black text-[#D4714E] leading-none shrink-0 w-10">{layer.n}</span>
                            <div>
                              <h3 className="text-[18px] font-extrabold mb-2">{layer.title}</h3>
                              <p className="text-[14px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.6 }}>{layer.body}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Section 6: Data Sources — Trust */}
                  <section className="px-6" style={{ paddingTop: '160px' }}>
                    <div className="max-w-4xl mx-auto text-center">
                      <h2 className="text-[36px] md:text-[48px] font-extrabold mb-6" style={{ letterSpacing: '-0.04em' }}>
                        Every number is sourced.
                      </h2>
                      <p className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl mx-auto mb-12" style={{ lineHeight: 1.65 }}>
                        smbX.ai is built on data from agencies required by law to collect it. The same sources that inform the Federal Reserve and Wall Street research desks. Not estimates. Not predictions. Records.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                        {['U.S. Census Bureau', 'Bureau of Labor Statistics', 'Federal Reserve (FRED)', 'SEC EDGAR', 'SBA', 'IRS SOI'].map(s => (
                          <span key={s} className="text-[11px] font-bold text-[#6E6A63]" style={{ letterSpacing: '0.05em' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Section 7: Deliverables */}
                  <section className="px-6" style={{ paddingTop: '160px' }}>
                    <div className="max-w-5xl mx-auto">
                      <div className="text-center mb-6">
                        <h2 className="text-[36px] md:text-[48px] font-extrabold mb-6" style={{ letterSpacing: '-0.04em' }}>
                          Not advice. Documents.
                        </h2>
                        <p className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl mx-auto" style={{ lineHeight: 1.65 }}>
                          When your deal is ready, Yulia generates the same institutional-grade deliverables that advisory firms charge five figures to produce.
                        </p>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                        {[
                          { title: 'Valuation Reports', body: 'Multi-methodology analysis with comparable transactions, industry benchmarks, and local market context. Defensible. Citable. Ready for lenders and buyers.' },
                          { title: 'Market Intelligence', body: 'Competitive density. Regional economics. PE consolidation activity. Industry multiples. SBA lending volume. All localized to your specific market.' },
                          { title: 'CIMs & Deal Books', body: '25+ page Confidential Information Memorandums \u2014 professionally formatted, data-backed, and ready to distribute to qualified buyers.' },
                          { title: 'SBA & Financing Models', body: 'Debt service coverage ratios. Sources & uses tables. Cash-on-cash returns. Pre-qualification analysis using live federal interest rates.' },
                          { title: 'Buyer Matching', body: 'Your business matched against active buyer theses on the platform. PE firms, search funds, SBA buyers, and strategic acquirers \u2014 filtered by industry, geography, and deal size.' },
                          { title: 'Deal Room', body: 'One secure workspace where your attorney, CPA, broker, and prospective buyers review everything. Role-based access. Version history. Nothing falls through the cracks.' },
                        ].map(card => (
                          <div key={card.title} className="bg-[#F9FAFB] p-8" style={{ borderRadius: '32px', border: '1px solid #F3F4F6' }}>
                            <h3 className="text-[18px] font-extrabold mb-3">{card.title}</h3>
                            <p className="text-[14px] font-medium text-[#6E6A63]" style={{ lineHeight: 1.6 }}>{card.body}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Section 8: Pricing — Simple */}
                  <section className="px-6" style={{ paddingTop: '160px' }}>
                    <div className="max-w-4xl mx-auto">
                      <div className="text-center mb-12">
                        <h2 className="text-[36px] md:text-[48px] font-extrabold mb-6" style={{ letterSpacing: '-0.04em' }}>
                          Free to start. Pay when you&apos;re ready.
                        </h2>
                        <p className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl mx-auto" style={{ lineHeight: 1.65 }}>
                          The conversation is free. Yulia&apos;s intelligence is free. Preliminary analysis, classification, and market overview &mdash; free. When your deal is ready for premium deliverables, you pay per document from your wallet. No subscriptions. No retainers. $1 in your wallet equals $1 of purchasing power.
                        </p>
                      </div>
                      <div className="grid md:grid-cols-3 gap-6">
                        {[
                          { title: 'Market Intelligence Report', price: '$200' },
                          { title: 'Full Valuation Analysis', price: '$350' },
                          { title: 'Confidential Information Memo', price: '$700' },
                        ].map(item => (
                          <div key={item.title} className="bg-[#F9FAFB] p-8 text-center" style={{ borderRadius: '32px', border: '1px solid #F3F4F6' }}>
                            <h3 className="text-[16px] font-extrabold mb-3">{item.title}</h3>
                            <span className="text-[36px] font-black text-[#D4714E]">{item.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Section 9: Closing CTA */}
                  <section className="px-6" style={{ paddingTop: '160px' }}>
                    <div className="max-w-4xl mx-auto text-center">
                      <h2 className="text-[36px] md:text-[48px] font-extrabold mb-6" style={{ letterSpacing: '-0.04em' }}>
                        Your deal is waiting.
                      </h2>
                      <p className="text-[18px] md:text-[20px] font-medium text-[#6E6A63]" style={{ lineHeight: 1.65 }}>
                        No signup. No credit card. Just start talking.
                      </p>
                    </div>
                  </section>

                  {/* Footer */}
                  <footer className="text-center py-24 mt-32">
                    <p className="text-[12px] font-medium text-[#9CA3AF]" style={{ letterSpacing: '0.1em' }}>
                      smbX.ai &mdash; Deal Intelligence Infrastructure
                    </p>
                  </footer>
                </div>
              )}

              {/* ════ SELL BELOW-FOLD ════ */}
              {activeTab === 'sell' && (
                <div>
                  {/* Story: Money on the table */}
                  <section className="px-6" style={{ paddingTop: '120px' }}>
                    <div className="max-w-4xl mx-auto">
                      <h2 className="text-[36px] md:text-[48px] font-extrabold mb-8" style={{ letterSpacing: '-0.04em' }}>
                        Most owners leave money on the table.
                      </h2>
                      <div className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl space-y-6" style={{ lineHeight: 1.65 }}>
                        <p className="m-0">Not because they&apos;re bad at business. Because tax returns are designed to minimize taxes &mdash; not maximize sale price.</p>
                        <p className="m-0">Your personal vehicle. Your family&apos;s cell phones. That one-time legal fee from last year. Your above-market rent to your own LLC. These are all legitimate add-backs that increase your adjusted earnings &mdash; and your sale price.</p>
                        <p className="m-0">Most owners miss $100K&ndash;$500K in add-backs they never knew to claim. Yulia finds them in minutes.</p>
                      </div>
                    </div>
                  </section>

                  {/* 5 Steps */}
                  <section className="px-6" style={{ paddingTop: '160px' }}>
                    <div className="max-w-5xl mx-auto">
                      <div className="text-center mb-16">
                        <h2 className="text-[36px] md:text-[48px] font-extrabold" style={{ letterSpacing: '-0.04em' }}>
                          Here&apos;s what happens when you tell Yulia about your business.
                        </h2>
                      </div>
                      <div className="grid md:grid-cols-3 gap-6">
                        {[
                          { step: '01', title: 'She asks the right questions.', body: 'Industry, location, revenue, owner compensation, years in business. Five minutes of conversation.' },
                          { step: '02', title: 'She classifies your deal.', body: 'SDE or EBITDA? SBA-financeable or institutional? Owner-operator or management-run? The classification determines everything.' },
                          { step: '03', title: 'She finds your add-backs.', body: 'Line by line through your financials. Every personal expense, every one-time cost, every above-market payment \u2014 identified, categorized, and presented for your verification.' },
                        ].map(s => (
                          <div key={s.step} className="bg-[#F9FAFB] p-10" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
                            <span className="text-[48px] font-black text-[#D4714E] leading-none mb-4 block">{s.step}</span>
                            <h3 className="text-[22px] font-extrabold mb-3">{s.title}</h3>
                            <p className="text-[15px] font-medium text-[#6E6A63]" style={{ lineHeight: 1.6 }}>{s.body}</p>
                          </div>
                        ))}
                      </div>
                      <div className="grid md:grid-cols-2 gap-6 mt-6">
                        {[
                          { step: '04', title: 'She calculates your real number.', body: 'Adjusted SDE or EBITDA, multiplied by the right industry multiple for your market, benchmarked against real comparable transactions.' },
                          { step: '05', title: 'She maps the path forward.', body: 'Optimize before selling? List now? Engage a broker? Run a competitive process? The recommendation matches your timeline, your goals, and your deal size.' },
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

                  {/* Broker Callout */}
                  <section className="px-6" style={{ paddingTop: '160px' }}>
                    <div className="max-w-4xl mx-auto bg-[#F9FAFB] p-10 md:p-12" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
                      <h3 className="text-[28px] md:text-[36px] font-extrabold mb-4" style={{ letterSpacing: '-0.03em' }}>
                        Working with a broker? Even better.
                      </h3>
                      <p className="text-[18px] font-medium text-[#6E6A63]" style={{ lineHeight: 1.6 }}>
                        Great brokers close deals faster when the analytical foundation is already built. Bring your smbX.ai analysis to your first advisor meeting. They focus on relationships and negotiations. Yulia handles the data.
                      </p>
                    </div>
                  </section>

                  <footer className="text-center py-24 mt-32">
                    <p className="text-[12px] font-medium text-[#9CA3AF]" style={{ letterSpacing: '0.1em' }}>
                      smbX.ai &mdash; Deal Intelligence Infrastructure
                    </p>
                  </footer>
                </div>
              )}

              {/* ════ BUY BELOW-FOLD ════ */}
              {activeTab === 'buy' && (
                <div>
                  {/* Intelligence Engine Story */}
                  <section className="px-6" style={{ paddingTop: '120px' }}>
                    <div className="max-w-4xl mx-auto">
                      <h2 className="text-[36px] md:text-[48px] font-extrabold mb-8" style={{ letterSpacing: '-0.04em' }}>
                        We&apos;re not a listing site. We&apos;re an intelligence engine.
                      </h2>
                      <div className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl space-y-6" style={{ lineHeight: 1.65 }}>
                        <p className="m-0">BizBuySell has listings. smbX.ai has intelligence.</p>
                        <p className="m-0">How many competitors operate in your target market? Which are PE-held vs. family-owned? Where does fragmentation create roll-up opportunity? What does historical SBA lending volume tell you about deal flow?</p>
                        <p className="m-0">The listing is one data point. The intelligence is the whole picture.</p>
                      </div>
                    </div>
                  </section>

                  {/* 4 Buyer Steps */}
                  <section className="px-6" style={{ paddingTop: '160px' }}>
                    <div className="max-w-5xl mx-auto">
                      <div className="text-center mb-16">
                        <h2 className="text-[36px] md:text-[48px] font-extrabold" style={{ letterSpacing: '-0.04em' }}>
                          What Yulia does for buyers.
                        </h2>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        {[
                          { step: '01', title: 'Models the money.', body: 'SBA eligibility. Debt service coverage ratio. Cash-on-cash returns. Down payment. Monthly payments. All modeled against live federal rates \u2014 before you write the LOI.' },
                          { step: '02', title: 'Maps the market.', body: 'Competitive density from Census data. Regional wage benchmarks from BLS. PE consolidation activity. Industry growth signals. The context that separates a good deal from a great one.' },
                          { step: '03', title: 'Evaluates the target.', body: 'Is the asking price justified? Are the margins sustainable? Is the customer base concentrated? Yulia flags what matters \u2014 before the seller\u2019s broker does.' },
                          { step: '04', title: 'Structures the deal.', body: 'Asset vs. stock. Seller note vs. all-cash. Earnout terms. Working capital peg. Sources & uses. The structure that gets the deal done at the right price.' },
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

                  <footer className="text-center py-24 mt-32">
                    <p className="text-[12px] font-medium text-[#9CA3AF]" style={{ letterSpacing: '0.1em' }}>
                      smbX.ai &mdash; Deal Intelligence Infrastructure
                    </p>
                  </footer>
                </div>
              )}

              {/* ════ ADVISORS BELOW-FOLD ════ */}
              {activeTab === 'advisors' && (
                <div>
                  {/* Expertise Story */}
                  <section className="px-6" style={{ paddingTop: '120px' }}>
                    <div className="max-w-4xl mx-auto">
                      <h2 className="text-[36px] md:text-[48px] font-extrabold mb-8" style={{ letterSpacing: '-0.04em' }}>
                        Your expertise is the moat. Yulia is the multiplier.
                      </h2>
                      <div className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl space-y-6" style={{ lineHeight: 1.65 }}>
                        <p className="m-0">You know how to negotiate. You know how to manage a process. You know how to close.</p>
                        <p className="m-0">What you don&apos;t have is infinite hours. The data assembly, the financial modeling, the document formatting &mdash; that&apos;s what eats your week. Yulia does it in minutes.</p>
                        <p className="m-0">Tell her about the deal. She packages the listing, runs the valuation, pre-qualifies the buyers, and generates the CIM. You review, refine, and present it under your brand.</p>
                      </div>
                    </div>
                  </section>

                  {/* Turned-Away Deals */}
                  <section className="px-6" style={{ paddingTop: '160px' }}>
                    <div className="max-w-4xl mx-auto bg-[#D4714E] text-white p-10 md:p-12" style={{ borderRadius: '48px' }}>
                      <h3 className="text-[28px] md:text-[36px] font-extrabold mb-4" style={{ letterSpacing: '-0.03em' }}>
                        The deals you used to turn away.
                      </h3>
                      <div className="text-[18px] font-medium text-orange-100 space-y-6" style={{ lineHeight: 1.6 }}>
                        <p className="m-0">That $800K landscaping company? The $1.2M cleaning service? The deals that don&apos;t justify 40 hours of manual work &mdash; they become profitable when Yulia handles the intelligence layer.</p>
                        <p className="m-0">White-label everything. Your clients see your deliverables. You know the smbX.ai Engine built the foundation.</p>
                        <p className="m-0">More clients. More deals. More revenue per engagement.</p>
                      </div>
                    </div>
                  </section>

                  {/* Advisor Network CTA */}
                  <section className="px-6" style={{ paddingTop: '160px' }}>
                    <div className="max-w-4xl mx-auto">
                      <h2 className="text-[36px] md:text-[48px] font-extrabold mb-8" style={{ letterSpacing: '-0.04em' }}>
                        We&apos;re building the advisor network.
                      </h2>
                      <div className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl space-y-6 mb-10" style={{ lineHeight: 1.65 }}>
                        <p className="m-0">Verified professional tiers. Volume pricing. Co-branded capabilities. Priority matching with platform buyers.</p>
                        <p className="m-0">If you want to shape how smbX.ai evolves for deal professionals, we want to hear from you.</p>
                      </div>
                      <button
                        onClick={() => handleChipClick("I'm an advisor — tell me about partnerships")}
                        className="bg-[#1A1A18] text-white text-[14px] font-bold px-8 py-4 rounded-full border-none cursor-pointer hover:bg-[#333] transition-colors"
                        style={{ fontFamily: 'inherit' }}
                        type="button"
                      >
                        Talk to our team about partnerships
                      </button>
                    </div>
                  </section>

                  <footer className="text-center py-24 mt-32">
                    <p className="text-[12px] font-medium text-[#9CA3AF]" style={{ letterSpacing: '0.1em' }}>
                      smbX.ai &mdash; Deal Intelligence Infrastructure
                    </p>
                  </footer>
                </div>
              )}

              {/* ════ PRICING BELOW-FOLD ════ */}
              {activeTab === 'pricing' && (
                <div>
                  {/* Free Tier Checklist */}
                  <section className="px-6" style={{ paddingTop: '120px' }}>
                    <div className="max-w-4xl mx-auto">
                      <h2 className="text-[36px] md:text-[48px] font-extrabold mb-10" style={{ letterSpacing: '-0.04em' }}>
                        What&apos;s always free.
                      </h2>
                      <div className="space-y-4">
                        {[
                          'Unlimited conversation with Yulia',
                          'Deal classification and league assignment',
                          'Preliminary valuation range',
                          'SDE vs. EBITDA framework recommendation',
                          'General market overview',
                          'Process guidance and next steps',
                        ].map(item => (
                          <div key={item} className="flex items-center gap-4">
                            <span className="text-[20px] text-[#D4714E] font-black shrink-0">&#10003;</span>
                            <span className="text-[18px] font-medium text-[#1A1A18]">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Premium Pricing Table */}
                  <section className="px-6" style={{ paddingTop: '160px' }}>
                    <div className="max-w-4xl mx-auto">
                      <h2 className="text-[36px] md:text-[48px] font-extrabold mb-10" style={{ letterSpacing: '-0.04em' }}>
                        Premium deliverables &mdash; when your deal is ready.
                      </h2>
                      <div className="space-y-4">
                        {[
                          { title: 'Market Intelligence Report', price: '$200' },
                          { title: 'Full Valuation Analysis', price: '$350' },
                          { title: 'Confidential Information Memo (CIM)', price: '$700' },
                          { title: 'SBA Bankability Model', price: '$150' },
                          { title: 'Buyer Matching Report', price: '$250' },
                          { title: 'Deal Structure Analysis', price: '$300' },
                        ].map(item => (
                          <div key={item.title} className="flex items-center justify-between bg-[#F9FAFB] px-8 py-6" style={{ borderRadius: '24px', border: '1px solid #F3F4F6' }}>
                            <span className="text-[18px] font-bold text-[#1A1A18]">{item.title}</span>
                            <span className="text-[24px] font-black text-[#D4714E] shrink-0 ml-4">{item.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Wallet Explanation */}
                  <section className="px-6" style={{ paddingTop: '160px' }}>
                    <div className="max-w-4xl mx-auto bg-[#F9FAFB] p-10 md:p-12" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
                      <h3 className="text-[28px] md:text-[36px] font-extrabold mb-6" style={{ letterSpacing: '-0.03em' }}>
                        How the wallet works.
                      </h3>
                      <div className="text-[18px] font-medium text-[#6E6A63] space-y-6" style={{ lineHeight: 1.6 }}>
                        <p className="m-0">Add funds when you need a deliverable. Yulia tells you exactly what it costs before you commit. No surprises. No recurring charges.</p>
                        <p className="m-0 text-[#1A1A18] font-bold">$1 in your wallet = $1 of purchasing power.</p>
                        <p className="m-0">Your wallet stays active. Use it on one deal or across many. Add funds whenever you&apos;re ready for the next step.</p>
                      </div>
                    </div>
                  </section>

                  <footer className="text-center py-24 mt-32">
                    <p className="text-[12px] font-medium text-[#9CA3AF]" style={{ letterSpacing: '0.1em' }}>
                      smbX.ai &mdash; Deal Intelligence Infrastructure
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

        {/* ════ CHATDOCK — compact dock variant for chat mode ════ */}
        {showDock && viewState === 'chat' && (
          <ChatDock
            ref={dockRef}
            onSend={handleSend}
            variant="dock"
            placeholder="Reply to Yulia..."
            disabled={sending}
          />
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
