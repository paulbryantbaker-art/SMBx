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
    overline: 'Deal intelligence infrastructure',
    h1Line1: 'The data is public.',
    h1Line2: 'The intelligence is not.',
    subtitle: 'SMBX synthesizes sovereign U.S. government data — Census, BLS, FRED, SEC EDGAR — into institutional-grade M\u200d&A intelligence. From a $400K landscaping company to a $40M manufacturing platform. One methodology. One conversation.',
    chips: ['Value my $2M plumbing business in Phoenix', 'Walk me through selling my company'],
    tagline: 'Seven Layers of Intelligence™ · Sovereign Data · Institutional Methodology',
    placeholder: 'Tell Yulia about your deal...',
  },
  sell: {
    overline: 'You built it. Now own the exit.',
    h1Line1: 'Know your number.',
    h1Line2: 'Before you negotiate.',
    subtitle: 'Most owners undervalue their business by $100K–$500K in hidden add-backs. Yulia finds them in minutes, calculates your true adjusted earnings, and generates a defensible valuation backed by real market comps — not guesswork.',
    chips: ['Value my $1.4M pest control business', 'What add-backs am I missing?'],
    tagline: 'SDE Normalization · Add-back Discovery · Defensible Valuations',
    placeholder: 'Tell Yulia about the business you want to sell...',
  },
  buy: {
    overline: 'Acquire with conviction',
    h1Line1: 'Find the right deal.',
    h1Line2: "Know it\u2019s the right deal.",
    subtitle: 'National averages hide what matters. A plumbing company in Phoenix and a plumbing company in rural Pennsylvania are fundamentally different deals. SMBX delivers intelligence specific to your market, your industry, and your competitive environment.',
    chips: ['Find HVAC targets in Dallas under $3M', 'Model SBA financing for a $2M acquisition'],
    tagline: 'Competitive Density · DSCR Modeling · Thesis-to-Target Pipeline',
    placeholder: "Tell Yulia what you\u2019re looking for...",
  },
  advisors: {
    overline: 'Built to make great advisors unstoppable',
    h1Line1: 'Your expertise. Our intelligence.',
    h1Line2: 'Better outcomes.',
    subtitle: 'Package listings in minutes, not weeks. Pre-screen SBA bankability before you waste time. Generate institutional-quality CIMs from a conversation. White-label everything — your brand, your client relationship, our engine.',
    chips: ['Package a new listing for my client', 'Pre-screen a buyer for SBA eligibility'],
    tagline: 'White-Label Deliverables · Verified Network · Intelligence On-Demand',
    placeholder: "Tell Yulia about your client\u2019s deal...",
  },
  pricing: {
    overline: 'Transparent. Progressive. Built for how deals work.',
    h1Line1: 'If you could Google it,',
    h1Line2: 'it should be free.',
    subtitle: 'Foundational analysis is free because the underlying data comes from sovereign public sources. You only pay for personalized intelligence — contextualized, localized, and built for your specific deal. Free: what the data says. Premium: what the data means for your deal.',
    chips: ['How does the wallet work?', 'What does a valuation report cost?'],
    tagline: 'No Retainer · No Subscription · $1 = $1 Purchasing Power',
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
        <span className="w-2 h-2 rounded-full bg-[#D4714E] shrink-0" />
        <span className="text-[12px] font-black uppercase text-[#6E6A63]" style={{ letterSpacing: '0.08em' }}>
          smbx.ai Engine 7
          <span className="text-[#9CA3AF] font-normal mx-1.5">|</span>
          <span className="text-[#9CA3AF] font-medium normal-case" style={{ letterSpacing: 0 }}>
            Proprietary M&amp;A Intelligence
          </span>
        </span>
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
          smb<span className="text-[#D4714E]">x</span><span className="text-[#D4714E]">.ai</span>
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
            <span className="text-[10px] font-black uppercase text-[#6E6A63]" style={{ letterSpacing: '0.2em' }}>
              {page.overline}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {!user && (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="text-[14px] font-semibold text-[#1A1A18] bg-transparent border-none cursor-pointer hover:text-[#D4714E] transition-colors px-3 py-2"
                  style={{ fontFamily: 'inherit' }}
                  type="button"
                >
                  Log in
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-[#1A1A18] text-white text-[14px] font-bold px-5 py-2.5 rounded-full border-none cursor-pointer hover:bg-[#333] transition-colors"
                  style={{ fontFamily: 'inherit' }}
                  type="button"
                >
                  Sign up
                </button>
              </>
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
              {/* Hero */}
              <section className="max-w-5xl mx-auto px-6 pt-20 md:pt-28 pb-12 text-center">
                <div
                  className="inline-block px-5 py-2 rounded-full bg-[#FFF0EB] text-[#D4714E] mb-10"
                  style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}
                >
                  {page.overline}
                </div>
                <h1
                  className="text-[36px] md:text-[64px] font-extrabold leading-[1.05] mb-8"
                  style={{ letterSpacing: '-0.04em' }}
                >
                  {page.h1Line1}<br />
                  <span className="text-[#D4714E]">{page.h1Line2}</span>
                </h1>
                <p className="text-[18px] md:text-[22px] font-medium text-[#6E6A63] max-w-3xl mx-auto" style={{ lineHeight: 1.6 }}>
                  {page.subtitle}
                </p>
              </section>

              {/* Dock — inline in hero */}
              <div className="max-w-[860px] mx-auto px-6 mt-2 mb-10">
                {dockCard}
              </div>

              {/* Suggestion chips */}
              <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto px-6 mb-4">
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

              {/* Tagline */}
              <div
                className="text-center text-[#9CA3AF] mb-16 px-6"
                style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}
              >
                {page.tagline}
              </div>

              {/* ════ HOME BELOW-FOLD SECTIONS ════ */}
              {activeTab === 'home' && (
                <div>
                  {/* Section 1: The Information Desert */}
                  <section className="px-6" style={{ paddingTop: '160px' }}>
                    <div className="max-w-4xl mx-auto text-center">
                      <div
                        className="inline-block px-5 py-2 rounded-full bg-[#FFF0EB] text-[#D4714E] mb-10"
                        style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}
                      >
                        The Information Desert
                      </div>
                      <h2 className="text-[36px] md:text-[64px] font-extrabold leading-[1.05] mb-8" style={{ letterSpacing: '-0.04em' }}>
                        Between $300K and $50M,<br />
                        <span className="text-[#D4714E]">nobody has good data.</span>
                      </h2>
                      <p className="text-[18px] md:text-[22px] font-medium text-[#6E6A63] max-w-3xl mx-auto" style={{ lineHeight: 1.6 }}>
                        The largest institutions have Bloomberg, PitchBook, and armies of analysts. Business owners selling a $3M company have Google and gut instinct. Brokers managing 15 listings are pulling comps from memory. The data exists — in Census records, BLS reports, FRED economic series, SBA lending databases. But nobody has synthesized it into intelligence that&apos;s useful for making deal decisions. Until now.
                      </p>
                    </div>
                  </section>

                  {/* Section 2: Methodology Bento */}
                  <section className="px-6" style={{ paddingTop: '256px' }}>
                    <div className="max-w-5xl mx-auto">
                      <div className="grid md:grid-cols-3 gap-6">
                        {/* Large card — 2/3 */}
                        <div className="md:col-span-2 bg-[#F9FAFB] p-10 md:p-12" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
                          <div className="flex items-center gap-3 mb-6">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4714E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
                            </svg>
                            <span className="text-[10px] font-black uppercase text-[#6E6A63]" style={{ letterSpacing: '0.15em' }}>
                              Engine Architecture: smbx.ai
                            </span>
                          </div>
                          <h3 className="text-[28px] md:text-[36px] font-extrabold mb-4" style={{ letterSpacing: '-0.03em' }}>
                            Seven Layers of Intelligence&trade;
                          </h3>
                          <p className="text-[18px] font-medium text-[#6E6A63] mb-8" style={{ lineHeight: 1.6 }}>
                            Every deal is evaluated through Industry Structure, Regional Economics, Financial Normalization, Buyer Landscape, Deal Architecture, Risk Assessment, and Forward Signals. Not a checklist — a methodology.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {['SDE Normalization', 'Competitive Density', 'Add-back Discovery', 'SBA 7(a) Modeling'].map(tag => (
                              <span
                                key={tag}
                                className="bg-white border border-[#F3F4F6] text-[#6E6A63] px-3 py-1.5"
                                style={{ borderRadius: '12px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Small card — 1/3, terra soft */}
                        <div className="bg-[#FFF0EB] p-10 md:p-12 flex flex-col justify-center" style={{ borderRadius: '48px', border: '1px solid rgba(212,113,78,0.1)' }}>
                          <h3 className="text-[24px] font-extrabold mb-4" style={{ letterSpacing: '-0.02em' }}>
                            Every number is sourced.
                          </h3>
                          <p className="text-[16px] font-medium text-[#6E6A63]" style={{ lineHeight: 1.6 }}>
                            Real multiples from real transactions. Exact competitor counts from Census data. Regional wage benchmarks from BLS. Not estimates — records that sovereign agencies are required by law to collect.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Section 3: Demo Conversation */}
                  <section className="px-6" style={{ paddingTop: '256px' }}>
                    <div className="max-w-4xl mx-auto">
                      <div className="text-center mb-16">
                        <div
                          className="text-[#D4714E] mb-4"
                          style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}
                        >
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

                            {/* Valuation card */}
                            <div className="bg-[#F9FAFB] border border-[#F3F4F6] p-8 mb-6" style={{ borderRadius: '24px' }}>
                              <div className="text-[12px] font-bold uppercase text-[#6E6A63] mb-1" style={{ letterSpacing: '0.1em' }}>
                                Preliminary Enterprise Value
                              </div>
                              <div className="text-[36px] font-black text-[#1A1A18]">$3.7M &ndash; $4.8M</div>
                            </div>

                            {/* Insights */}
                            <div className="space-y-4">
                              <div className="flex items-start gap-3 bg-green-50 p-5" style={{ borderRadius: '16px', border: '1px solid rgba(34,197,94,0.15)' }}>
                                <span className="text-green-600 font-black text-[18px] mt-0.5">&#10003;</span>
                                <p className="text-[16px] font-medium text-[#1A1A18] m-0" style={{ lineHeight: 1.6 }}>
                                  DFW has 847 HVAC businesses per Census, but only ~12% are commercial-focused. 14 active PE roll-ups in Texas. You&apos;re in a seller&apos;s market.
                                </p>
                              </div>
                              <div className="flex items-start gap-3 bg-amber-50 p-5" style={{ borderRadius: '16px', border: '1px solid rgba(245,158,11,0.15)' }}>
                                <span className="text-amber-600 font-black text-[18px] mt-0.5">!</span>
                                <p className="text-[16px] font-medium text-[#1A1A18] m-0" style={{ lineHeight: 1.6 }}>
                                  Your 18.6% EBITDA margin is slightly below the 21% sector median — optimization here could move your price $200K–$400K.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Section 4: Audience Grid */}
                  <section className="px-6" style={{ paddingTop: '256px' }}>
                    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
                      {/* Card 1: Owners */}
                      <div className="bg-[#F9FAFB] p-10" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
                        <div className="w-12 h-12 rounded-2xl bg-[#FFF0EB] flex items-center justify-center mb-6">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4714E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
                          </svg>
                        </div>
                        <h3 className="text-[22px] font-extrabold mb-3">Owners &amp; Acquirers</h3>
                        <p className="text-[16px] font-medium text-[#6E6A63] mb-6" style={{ lineHeight: 1.6 }}>
                          Know your number before you negotiate. Find hidden add-backs. Model SBA financing. Get a defensible valuation in minutes — not months.
                        </p>
                        <button
                          onClick={() => handleTabClick('sell')}
                          className="text-[#D4714E] text-[14px] font-bold bg-transparent border-none cursor-pointer hover:underline"
                          style={{ fontFamily: 'inherit' }}
                          type="button"
                        >
                          Tell Yulia about your deal &rarr;
                        </button>
                      </div>

                      {/* Card 2: Advisors */}
                      <div className="bg-[#F9FAFB] p-10" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
                        <div className="w-12 h-12 rounded-2xl bg-[#FFF0EB] flex items-center justify-center mb-6">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4714E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                          </svg>
                        </div>
                        <h3 className="text-[22px] font-extrabold mb-3">Brokers &amp; Advisors</h3>
                        <p className="text-[16px] font-medium text-[#6E6A63] mb-6" style={{ lineHeight: 1.6 }}>
                          The intelligence infrastructure of a mega-firm in your pocket. Package listings in minutes, qualify buyers instantly, and serve deals you&apos;d otherwise turn away.
                        </p>
                        <button
                          onClick={() => handleTabClick('advisors')}
                          className="text-[#D4714E] text-[14px] font-bold bg-transparent border-none cursor-pointer hover:underline"
                          style={{ fontFamily: 'inherit' }}
                          type="button"
                        >
                          See how advisors use SMBX &rarr;
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Section 5: Traceability */}
                  <section className="px-6" style={{ paddingTop: '256px' }}>
                    <div className="max-w-4xl mx-auto text-center">
                      <h2 className="text-[36px] md:text-[48px] font-extrabold mb-8" style={{ letterSpacing: '-0.04em' }}>
                        Every insight is traceable.
                      </h2>
                      <p className="text-[18px] md:text-[22px] font-medium text-[#6E6A63] max-w-3xl mx-auto mb-12" style={{ lineHeight: 1.6 }}>
                        SMBX is built on sovereign data — the same sources that inform the Federal Reserve and Wall Street research desks. Census Bureau, BLS, FRED, SEC EDGAR, SBA lending data. That&apos;s the difference between a chatbot and an intelligence platform.
                      </p>
                      <div className="inline-block bg-[#F9FAFB] border border-[#F3F4F6] px-8 py-5" style={{ borderRadius: '24px' }}>
                        <span className="text-[18px] font-bold text-[#1A1A18]">
                          The OS for the largest wealth transfer in American history.
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

              {/* Non-home pages: simple spacer at bottom */}
              {activeTab !== 'home' && <div className="pb-32" />}
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
