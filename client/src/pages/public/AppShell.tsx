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
import HomeBelow from '../../components/content/HomeBelow';
import SellBelow from '../../components/content/SellBelow';
import BuyBelow from '../../components/content/BuyBelow';
import AdvisorsBelow from '../../components/content/AdvisorsBelow';
import PricingBelow from '../../components/content/PricingBelow';

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
      'Model SBA financing on a $2M target',
      "I'm a broker \u2014 show me what Yulia can do",
    ],
    tagline: 'Live federal data \u00B7 Census \u00B7 BLS \u00B7 SBA \u00B7 SEC',
    placeholder: 'Tell Yulia about your deal...',
  },
  sell: {
    overline: 'Strengthen & Sell',
    h1Line1: 'Know what you\u2019re worth.',
    h1Line2: 'Then get it.',
    subtitle: 'Yulia finds the hidden value in your financials, builds a defensible number, and walks you through every step to close \u2014 whether you\u2019re working with a broker or navigating it yourself.',
    chips: [
      "What's my HVAC company worth in Dallas?",
      "What add-backs am I missing on my P&L?",
      'Walk me through the selling process from start to finish',
    ],
    tagline: 'SDE Normalization \u00B7 Add-back Discovery \u00B7 Defensible Valuations',
    placeholder: 'Tell Yulia about the business you\u2019re selling...',
  },
  buy: {
    overline: 'Search & Acquire',
    h1Line1: 'Find the right deal.',
    h1Line2: 'Know it\u2019s the right deal.',
    subtitle: 'Yulia maps the landscape, models the financing, evaluates the target, and builds your conviction \u2014 so you move fast with confidence, not anxiety.',
    chips: [
      'Can I finance a $2M dental practice with SBA?',
      'Show me fragmented markets for home services in Texas',
      'Evaluate a listing I found \u2014 is the price justified?',
    ],
    tagline: 'Thesis-to-Target \u00B7 DSCR Modeling \u00B7 Market Intelligence',
    placeholder: "Tell Yulia what you're looking for...",
  },
  advisors: {
    overline: 'For Deal Professionals',
    h1Line1: 'Your expertise closes deals.',
    h1Line2: 'Now close more of them.',
    subtitle: 'The intelligence infrastructure of a full-service advisory firm. Package listings in minutes. Qualify buyers instantly. Generate institutional-grade deliverables. White-label everything.',
    chips: [
      "Package a new listing for my client's business",
      'Pre-screen a buyer for SBA eligibility',
      'Generate a CIM from raw financials I have',
    ],
    tagline: 'White-Label Deliverables \u00B7 Intelligence On-Demand',
    placeholder: "Tell Yulia about the deal you're working on...",
  },
  pricing: {
    overline: 'Simple Pricing',
    h1Line1: 'Free to start.',
    h1Line2: 'Pay when your deal is ready.',
    subtitle: 'The conversation is free. The intelligence is free. When you need institutional-grade deliverables, pay per document. No subscriptions. No retainers. No surprises.',
    chips: [
      'What can I do for free?',
      'How does the wallet work?',
    ],
    tagline: '$1 = $1 Purchasing Power \u00B7 No Recurring Charges',
    placeholder: 'Ask Yulia about pricing...',
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
    <div id="app-root" className="flex bg-white font-sans overflow-hidden h-[100dvh]">
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
          style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' } as any}
        >
          {/* ════ LANDING MODE ════ */}
          {viewState === 'landing' && (
            <div key={activeTab} style={{ animation: morphing ? 'morphOut 0.45s ease forwards' : 'fadeIn 0.4s ease', pointerEvents: morphing ? 'none' as const : undefined }}>
              {activeTab === 'home' ? (
              <>
                {/* ═══ HOME PAGE — Gemini × Uber layout ═══ */}

                {/* ═══ MOBILE HERO ═══ */}
                <div className="md:hidden">
                  <div className="pt-9 px-6">
                    <p className="text-[16px] font-medium text-[#6E6A63] mb-1">Meet Yulia</p>
                    <h1 className="text-[32px] font-extrabold leading-[1.12]" style={{ letterSpacing: '-0.03em' }}>
                      {page.h1Line1}
                    </h1>
                    <p className="text-[16px] font-normal leading-[1.5] text-[#6E6A63] mt-3.5">
                      {page.subtitle}
                    </p>
                  </div>
                  <div className="px-6 pt-5">
                    <div className="flex flex-col gap-2.5">
                      {[
                        { text: page.chips[0], emoji: '\uD83D\uDCCA', bg: 'rgba(212,113,78,0.1)' },
                        { text: page.chips[1], emoji: '\uD83C\uDFE6', bg: 'rgba(74,144,226,0.1)' },
                        { text: page.chips[2], emoji: '\uD83E\uDD1D', bg: 'rgba(74,222,128,0.1)' },
                      ].map(chip => (
                        <button key={chip.text} onClick={() => handleChipClick(chip.text)} className="flex items-center gap-2.5 w-full text-left text-[15px] font-medium text-[#1A1A18] bg-[#F7F7F7] border border-[#E5E5E5] rounded-2xl cursor-pointer transition-colors hover:bg-[#F0F0F0]" style={{ padding: '14px 16px', fontFamily: 'inherit' }} type="button">
                          <span className="w-7 h-7 rounded-full flex items-center justify-center text-[14px] shrink-0" style={{ background: chip.bg }}>{chip.emoji}</span>
                          {chip.text}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-6 pt-5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" style={{ boxShadow: '0 0 4px rgba(74,222,128,0.5)', animation: 'statusPulse 2s ease infinite' }} />
                    <span className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#A8A49C]">Live federal data &middot; Census &middot; BLS &middot; SBA &middot; SEC</span>
                  </div>
                  <div className="mx-6 mt-5 mb-10">
                    <div className="home-input-wrap bg-white relative overflow-visible" style={{ borderRadius: '20px', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)' }}>
                      <ChatDock ref={dockRef} onSend={handleSend} variant="hero" rows={1} placeholder="Tell Yulia about your deal..." disabled={sending} />
                    </div>
                  </div>
                </div>

                {/* ═══ DESKTOP HERO — matches Sell/Buy page layout ═══ */}
                <div className="hidden md:flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-6" style={{ gap: '7vh' }}>
                  {/* Headline group */}
                  <div className="w-full max-w-5xl text-center">
                    <p className="text-[18px] font-medium text-[#6E6A63]" style={{ marginBottom: '12px' }}>Meet Yulia</p>
                    <h1
                      className="text-[56px] font-extrabold leading-[1.08]"
                      style={{ letterSpacing: '-0.04em', marginBottom: '20px' }}
                    >
                      {page.h1Line1}
                    </h1>
                    <p className="text-[20px] font-medium text-[#6E6A63] max-w-3xl mx-auto" style={{ lineHeight: 1.65 }}>
                      {page.subtitle}
                    </p>
                  </div>

                  {/* Chat bar — same card as Sell/Buy pages */}
                  <div className="w-full max-w-[860px]">
                    <div
                      className="home-input-wrap bg-white shadow-2xl transition-all relative overflow-visible"
                      style={{ borderRadius: '40px', border: '2px solid #D1D5DB' }}
                    >
                      <div className="flex items-center gap-2 px-6 pt-4 pb-0">
                        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                        <span className="text-[12px] font-black uppercase text-[#6E6A63]" style={{ letterSpacing: '0.08em' }}>
                          Federal Data Sync Active
                        </span>
                      </div>
                      <ChatDock ref={dockRef} onSend={handleSend} variant="hero" rows={1} placeholder="Tell Yulia about your deal..." disabled={sending} />
                    </div>
                  </div>

                  {/* Chips + data status */}
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
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" style={{ boxShadow: '0 0 4px rgba(74,222,128,0.5)', animation: 'statusPulse 2s ease infinite' }} />
                      <span className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#A8A49C]">Live federal data &middot; Census &middot; BLS &middot; SBA &middot; SEC</span>
                    </div>
                  </div>
                </div>

                {/* ═══ BELOW-FOLD ═══ */}
                <HomeBelow onChipClick={handleChipClick} />
              </>
              ) : (
              <>
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
              {activeTab === 'sell' && <SellBelow onChipClick={handleChipClick} />}
              {activeTab === 'buy' && <BuyBelow onChipClick={handleChipClick} />}
              {activeTab === 'advisors' && <AdvisorsBelow onChipClick={handleChipClick} />}
              {activeTab === 'pricing' && <PricingBelow onChipClick={handleChipClick} />}
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

        {/* ════ CHATDOCK — new-skin card, single-line, auto-expands ════ */}
        {showDock && viewState === 'chat' && (
          <div className="shrink-0 px-4 pt-2" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))', touchAction: 'manipulation' }}>
            <div className="max-w-[860px] mx-auto">
              <div
                className="bg-white shadow-lg relative overflow-visible"
                style={{ borderRadius: '32px', border: '2px solid #D1D5DB' }}
              >
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
