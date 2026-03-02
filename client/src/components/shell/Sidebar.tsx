import { useLocation } from 'wouter';

export type TabId = 'home' | 'sell' | 'buy' | 'advisors' | 'pricing';
export type ViewState = 'landing' | 'chat';

interface SidebarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  viewState: ViewState;
  setViewState: (vs: ViewState) => void;
  isMobile: boolean;
  onClose?: () => void;
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

export default function Sidebar({
  activeTab,
  setActiveTab,
  viewState,
  setViewState,
  isMobile,
  onClose,
}: SidebarProps) {
  const [, navigate] = useLocation();

  const handleTabClick = (tab: TabId) => {
    setActiveTab(tab);
    if (viewState === 'chat') setViewState('landing');
    if (isMobile && onClose) onClose();
    // Update URL to match tab
    const urlMap: Record<TabId, string> = {
      home: '/',
      sell: '/sell',
      buy: '/buy',
      advisors: '/advisors',
      pricing: '/pricing',
    };
    window.history.replaceState(null, '', urlMap[tab]);
  };

  const handleLogoClick = () => {
    setActiveTab('home');
    if (viewState === 'chat') setViewState('landing');
    if (isMobile && onClose) onClose();
    window.history.replaceState(null, '', '/');
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA] border-r border-gray-200 select-none" style={{ width: isMobile ? 280 : 256 }}>
      {/* Brand */}
      <div className="px-5 pt-6 pb-4">
        <button
          onClick={handleLogoClick}
          className="bg-transparent border-none cursor-pointer p-0 text-left"
          type="button"
        >
          <span className="text-[20px] font-extrabold tracking-tight" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <span className="text-[#2D3142]">smbx</span>
            <span className="text-[#2D3142]">.</span>
            <span className="text-[#2D3142]">ai</span>
          </span>
        </button>
      </div>

      {/* Chat session indicator */}
      {viewState === 'chat' && (
        <div className="mx-4 mb-3 px-3 py-2.5 rounded-xl bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4714E] animate-pulse" />
            <span className="text-[13px] font-semibold text-[#2D3142]">Chat with Yulia</span>
          </div>
          <p className="text-[11px] text-[#4F5D75] mt-0.5 ml-4">Intelligence engine active</p>
        </div>
      )}

      {/* Section label */}
      <div className="px-5 pt-1 pb-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4F5D75]">
          The Methodology
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
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

      {/* Bottom sign-in card */}
      <div className="px-3 pb-4 mt-auto">
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
      </div>
    </div>
  );
}
