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
  sell: '#D4714E',
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
        <path d="M4 7V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3" /><polyline points="14 2 14 8 20 8" /><line x1="2" y1="15" x2="10" y2="15" /><polyline points="7 12 10 15 7 18" />
      </svg>
    ),
  },
  {
    id: 'buy',
    label: 'Buy a Business',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
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
      className="flex flex-col h-full bg-[#F8F9FA] border-r border-gray-200 select-none"
      style={{ width: isMobile ? 280 : 256 }}
    >
      {/* Brand */}
      <div className="px-5 pt-6 pb-3 flex items-center justify-between">
        <button
          onClick={handleLogoClick}
          className="bg-transparent border-none cursor-pointer p-0 text-left"
          type="button"
        >
          <Logo linked={false} />
        </button>

        {/* Sidebar collapse toggle */}
        {isMobile ? (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-transparent border-none cursor-pointer flex items-center justify-center text-[#9CA3AF] hover:text-[#1A1A18] transition-colors"
            type="button"
            aria-label="Close sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </button>
        ) : (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-transparent border-none cursor-pointer flex items-center justify-center text-[#9CA3AF] hover:text-[#1A1A18] transition-colors"
            type="button"
            aria-label="Collapse sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </button>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* + New Workspace button */}
        <div className="px-3 mb-3">
          <button
            onClick={handleNewChat}
            className="flex items-center justify-center gap-2 w-full bg-white border border-[#EAE6DF] shadow-sm text-[#1A1A18] font-bold text-sm px-3 py-2.5 rounded-lg hover:bg-[#FDFCFB] transition-colors cursor-pointer"
            style={{ fontFamily: 'inherit' }}
            type="button"
          >
            <span className="text-[#D4714E]">+</span> New Workspace
          </button>
        </div>

        {/* Section label */}
        <div className="px-5 pt-2 pb-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4F5D75]">
            Use Cases
          </span>
        </div>

        {/* Nav items */}
        <nav className="px-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id && viewState === 'landing';
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all border-none cursor-pointer ${
                  isActive
                    ? 'bg-white border border-gray-200 shadow-sm text-[#2D3142]'
                    : 'bg-transparent text-[#4F5D75] hover:bg-gray-100'
                }`}
                style={{ fontFamily: 'inherit' }}
                type="button"
              >
                <span className={isActive ? 'text-[#D4714E]' : 'text-[#9CA3AF]'}>{item.icon}</span>
                <span className="text-[14px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Conversation history — authenticated only */}
        {user && conversations.length > 0 && (
          <div className="px-1.5 mt-2">
            {deals.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF] px-2 pt-2 pb-1 m-0">
                  Active Deals
                </p>
                {deals.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleConversationClick(c.id)}
                    className={`w-full text-left border-none cursor-pointer rounded-[10px] px-2 py-2 mb-0.5 transition-colors ${
                      c.id === activeConversationId && viewState === 'chat'
                        ? 'bg-white shadow-sm'
                        : 'bg-transparent hover:bg-gray-100'
                    }`}
                    type="button"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: c.journey ? (JOURNEY_COLORS[c.journey] || '#6E6A63') : '#9CA3AF' }}
                      />
                      <span className="text-[13px] font-medium text-[#2D3142] truncate flex-1 min-w-0">
                        {c.title}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {recent.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF] px-2 pt-2 pb-1 m-0">
                  Recent
                </p>
                {recent.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleConversationClick(c.id)}
                    className={`w-full text-left border-none cursor-pointer rounded-[10px] px-2 py-1.5 mb-0.5 flex items-center gap-2 transition-colors ${
                      c.id === activeConversationId && viewState === 'chat'
                        ? 'bg-white shadow-sm'
                        : 'bg-transparent hover:bg-gray-100'
                    }`}
                    type="button"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: c.journey ? (JOURNEY_COLORS[c.journey] || '#6E6A63') : '#9CA3AF' }}
                    />
                    <span className="text-[13px] font-medium text-[#4F5D75] truncate flex-1 min-w-0">
                      {c.title}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom section */}
      <div className="px-3 pb-4 mt-auto">
        <button
          onClick={() => {
            if (user) {
              handleToolClick('settings');
            } else {
              navigate('/login');
            }
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all border-none cursor-pointer bg-transparent text-[#4F5D75] hover:bg-gray-100"
          style={{ fontFamily: 'inherit' }}
          type="button"
        >
          <span className="text-[#9CA3AF]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </span>
          <span className="text-[14px] font-medium">Account Settings</span>
        </button>
      </div>
    </div>
  );
}
