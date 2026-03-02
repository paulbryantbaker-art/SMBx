import { useLocation } from 'wouter';
import Logo from '../public/Logo';
import WalletBadge from '../chat/WalletBadge';
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
    id: 'home',
    label: 'How it Works',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
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
    label: 'Pricing & Free Tier',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
];

const TOOL_ITEMS: { id: ViewState; label: string; icon: JSX.Element }[] = [
  {
    id: 'pipeline',
    label: 'Pipeline',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    id: 'dataroom',
    label: 'Data Room',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
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

        {/* New chat button — authenticated only */}
        {user && (
          <button
            onClick={handleNewChat}
            className="w-8 h-8 rounded-full bg-[#F3F0EA] border-none cursor-pointer flex items-center justify-center text-[#D4714E] hover:bg-[#FFF0EB] transition-colors"
            type="button"
            aria-label="New chat"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        )}
      </div>

      {/* Chat session indicator */}
      {viewState === 'chat' && (
        <div className="mx-4 mb-3 px-3 py-2.5 rounded-xl bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4714E] animate-pulse" />
            <span className="text-[13px] font-semibold text-[#2D3142]">Chat with Yulia</span>
          </div>
          <p className="text-[11px] text-[#4F5D75] mt-0.5 ml-4 m-0">Intelligence engine active</p>
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Conversation history — authenticated only */}
        {user && conversations.length > 0 && (
          <div className="px-1.5 mb-2">
            {deals.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#D4714E] px-2 pt-2 pb-1 m-0">
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
                    <div className="flex items-start gap-2">
                      {c.journey && (
                        <span
                          className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                          style={{ backgroundColor: JOURNEY_COLORS[c.journey] || '#6E6A63' }}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-[#2D3142] m-0 truncate leading-snug">
                          {c.title}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {c.current_gate && (
                            <span className="text-[10px] font-bold text-[#D4714E] bg-[#FFF0EB] px-[5px] py-[1px] rounded-[3px]">
                              {c.current_gate}
                            </span>
                          )}
                          <span className="text-[11px] text-[#9CA3AF]">
                            {formatShortTime(c.updated_at)}
                          </span>
                        </div>
                      </div>
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
                    {c.journey && (
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: JOURNEY_COLORS[c.journey] || '#6E6A63' }}
                      />
                    )}
                    <span className="text-[13px] font-medium text-[#4F5D75] truncate flex-1 min-w-0">
                      {c.title}
                    </span>
                    <span className="text-[11px] text-[#9CA3AF] shrink-0">
                      {formatShortTime(c.updated_at)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Section label — Methodology */}
        <div className="px-5 pt-2 pb-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4F5D75]">
            The Methodology
          </span>
        </div>

        {/* Educational nav items */}
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

        {/* Tool nav — authenticated only */}
        {user && (
          <>
            <div className="px-5 pt-4 pb-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4F5D75]">
                Your Deals
              </span>
            </div>
            <nav className="px-3 space-y-0.5">
              {TOOL_ITEMS.map((item) => {
                const isActive = viewState === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleToolClick(item.id)}
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
          </>
        )}
      </div>

      {/* Wallet — authenticated only */}
      {user && (
        <div className="px-3 pb-2">
          <WalletBadge />
        </div>
      )}

      {/* Bottom section */}
      <div className="px-3 pb-4 mt-auto">
        {user ? (
          /* Authenticated: user info + sign out */
          <div className="flex items-center justify-between px-2 py-2 border-t border-gray-200">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#F3F0EA] flex items-center justify-center shrink-0">
                <span className="text-[11px] font-semibold text-[#2D3142]">
                  {(user.display_name || user.email).charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-[12px] font-medium text-[#2D3142] truncate">
                {user.display_name || user.email}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="text-[11px] font-medium text-[#9CA3AF] bg-transparent border-none cursor-pointer hover:text-[#D4714E] transition-colors px-0"
              type="button"
            >
              Sign out
            </button>
          </div>
        ) : (
          /* Anonymous: sign-in card */
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-[14px] font-semibold text-[#2D3142] m-0">Have an account?</p>
            <p className="text-[12px] text-[#4F5D75] mt-0.5 mb-3">Sign in to access your deal rooms.</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2.5 rounded-lg bg-[#2D3142] text-white text-[14px] font-semibold border-none cursor-pointer hover:bg-[#D4714E] transition-colors"
              style={{ fontFamily: 'inherit' }}
              type="button"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
