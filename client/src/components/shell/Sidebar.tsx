import { useLocation } from 'wouter';
import Logo from '../public/Logo';
import type { User } from '../../hooks/useAuth';
import type { Conversation } from '../../hooks/useAuthChat';

export type TabId = 'home' | 'sell' | 'buy' | 'advisors' | 'pricing';
export type ViewState = 'landing' | 'chat' | 'pipeline' | 'dataroom' | 'settings';

interface SidebarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  viewState: ViewState;
  setViewState: (vs: ViewState) => void;
  isMobile: boolean;
  onClose?: () => void;
  // Auth
  user: User | null;
  onLogout?: () => void;
  // Conversations (authenticated only)
  conversations?: Conversation[];
  activeConversationId?: number | null;
  onSelectConversation?: (id: number) => void;
  onNewConversation?: () => void;
}

const JOURNEY_COLORS: Record<string, string> = {
  sell: '#C96B4F',
  buy: '#4E8FD4',
  raise: '#6B8F4E',
  pmi: '#8F6BD4',
};

function formatShortTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const NAV_ITEMS: { id: TabId; label: string; icon: JSX.Element }[] = [
  {
    id: 'sell',
    label: 'Sell a Business',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      </svg>
    ),
  },
  {
    id: 'buy',
    label: 'Buy a Business',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="22" x2="21" y2="22" /><line x1="6" y1="18" x2="6" y2="11" /><line x1="10" y1="18" x2="10" y2="11" /><line x1="14" y1="18" x2="14" y2="11" /><line x1="18" y1="18" x2="18" y2="11" /><polygon points="12 2 20 7 4 7" /><line x1="2" y1="18" x2="22" y2="18" />
      </svg>
    ),
  },
  {
    id: 'advisors',
    label: 'For Advisors',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    id: 'pricing',
    label: 'Pricing & Wallet',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  viewState,
  setViewState,
  isMobile,
  onClose,
  user,
  onLogout,
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onNewConversation,
}: SidebarProps) {
  const [, navigate] = useLocation();

  const handleTabClick = (tab: TabId) => {
    setActiveTab(tab);
    setViewState('landing');
    if (isMobile && onClose) onClose();
    const urlMap: Record<TabId, string> = {
      home: '/',
      sell: '/sell',
      buy: '/buy',
      advisors: '/advisors',
      pricing: '/pricing',
    };
    const target = urlMap[tab];
    if (window.location.pathname !== target) navigate(target);
  };

  const handleToolClick = (tool: ViewState) => {
    setViewState(tool);
    if (isMobile && onClose) onClose();
    const urlMap: Record<string, string> = {
      pipeline: '/pipeline',
      dataroom: '/dataroom',
      settings: '/settings',
    };
    const target = urlMap[tool];
    if (target && window.location.pathname !== target) navigate(target);
  };

  const handleLogoClick = () => {
    setActiveTab('home');
    setViewState('landing');
    if (isMobile && onClose) onClose();
    if (window.location.pathname !== '/') navigate('/');
  };

  const handleNewChat = () => {
    if (onNewConversation) onNewConversation();
    setViewState('chat');
    if (isMobile && onClose) onClose();
    if (window.location.pathname !== '/chat') navigate('/chat');
  };

  const handleConversationClick = (id: number) => {
    if (onSelectConversation) onSelectConversation(id);
    setViewState('chat');
    if (isMobile && onClose) onClose();
    navigate(`/chat/${id}`);
  };

  // Split conversations for authenticated users
  const deals = conversations.filter(c => c.deal_id != null);
  const recent = conversations.filter(c => c.deal_id == null);

  return (
    <div
      className="flex flex-col h-full bg-[#F5F5F0] border-r border-[#E8E5DE] select-none"
      style={{ width: isMobile ? 280 : 256 }}
    >
      {/* 1. BRAND HEADER */}
      <div className="p-4 pt-5 flex items-center justify-between">
        <button
          onClick={handleLogoClick}
          className="bg-transparent border-none cursor-pointer p-0 text-left"
          type="button"
        >
          <Logo linked={false} />
        </button>
      </div>

      {/* 2. NEW WORKSPACE BUTTON */}
      <div className="px-4 mb-6 mt-2">
        <button
          onClick={handleNewChat}
          className="flex items-center justify-center gap-2 w-full bg-white border border-[#EAE6DF] shadow-sm text-[#1A1A18] font-bold text-sm px-3 py-2.5 rounded-lg hover:bg-[#FDFCFB] transition-colors cursor-pointer"
          style={{ fontFamily: 'inherit' }}
          type="button"
        >
          <svg className="w-4 h-4 text-[#C96B4F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Workspace
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* 3. USE CASES NAVIGATION */}
        <div className="px-3">
          <div className="text-[11px] font-bold text-[#A9A49C] uppercase tracking-wider mb-2 px-3">Use Cases</div>
          <nav className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id && viewState === 'landing';
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#1A1A18] shadow-sm border border-[#EAE6DF] font-bold'
                      : 'text-[#6E6A63] hover:bg-white hover:text-[#1A1A18] font-medium border border-transparent'
                  }`}
                  style={{ fontFamily: 'inherit' }}
                  type="button"
                >
                  <span className={isActive ? 'text-[#C96B4F]' : 'text-[#A9A49C]'}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Conversation history — authenticated only */}
        {user && conversations.length > 0 && (
          <div className="px-3 mt-4">
            {deals.length > 0 && (
              <div>
                <div className="text-[11px] font-bold text-[#A9A49C] uppercase tracking-wider mb-2 px-3">Active Deals</div>
                {deals.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleConversationClick(c.id)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                      c.id === activeConversationId && viewState === 'chat'
                        ? 'bg-white text-[#1A1A18] shadow-sm border border-[#EAE6DF] font-bold'
                        : 'text-[#6E6A63] hover:bg-white hover:text-[#1A1A18] font-medium border border-transparent'
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

            {recent.length > 0 && (
              <div className="mt-2">
                <div className="text-[11px] font-bold text-[#A9A49C] uppercase tracking-wider mb-2 px-3">Recent</div>
                {recent.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleConversationClick(c.id)}
                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                      c.id === activeConversationId && viewState === 'chat'
                        ? 'bg-white text-[#1A1A18] shadow-sm border border-[#EAE6DF] font-medium'
                        : 'text-[#6E6A63] hover:bg-white hover:text-[#1A1A18] font-medium border border-transparent'
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
        )}
      </div>

      {/* Bottom — Account Settings */}
      <div className="px-3 pb-4 mt-auto">
        <button
          onClick={() => {
            if (user) {
              handleToolClick('settings');
            } else {
              navigate('/login');
            }
          }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer text-[#6E6A63] hover:bg-white hover:text-[#1A1A18] font-medium border border-transparent"
          style={{ fontFamily: 'inherit' }}
          type="button"
        >
          <span className="text-[#A9A49C]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </span>
          Account Settings
        </button>
      </div>
    </div>
  );
}
