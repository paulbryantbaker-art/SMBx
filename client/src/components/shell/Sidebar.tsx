import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import Logo from '../public/Logo';
import type { User } from '../../hooks/useAuth';
import { authHeaders } from '../../hooks/useAuth';
import type { Conversation } from '../../hooks/useAuthChat';

export type TabId = 'home' | 'sell' | 'buy' | 'advisors' | 'pricing';
export type ViewState = 'landing' | 'chat' | 'pipeline' | 'dataroom' | 'settings';

interface DealGroup {
  dealId: number;
  businessName: string;
  journey: string | null;
  currentGate: string | null;
  active: Conversation[];
  completed: Conversation[];
}

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

// Warm-family palette — teal for buy, ochre for raise, plum for pmi (brand pink for sell).
const JOURNEY_COLORS: Record<string, string> = {
  sell: '#D44A78',
  buy: '#3E8E8E',
  raise: '#C99A3E',
  pmi: '#8F4A7A',
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
    label: 'Pricing',
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

  // Group conversations by deal_id
  const { dealGroups, recent } = useMemo(() => {
    const groupMap = new Map<number, DealGroup>();
    const recent: Conversation[] = [];
    for (const c of conversations) {
      if (c.deal_id == null) { recent.push(c); continue; }
      let group = groupMap.get(c.deal_id);
      if (!group) {
        group = {
          dealId: c.deal_id,
          businessName: c.business_name || c.title || 'Untitled Deal',
          journey: c.journey || null,
          currentGate: c.current_gate || null,
          active: [],
          completed: [],
        };
        groupMap.set(c.deal_id, group);
      }
      if (c.business_name) group.businessName = c.business_name;
      if (c.current_gate) group.currentGate = c.current_gate;
      if (c.gate_status === 'completed') group.completed.push(c);
      else group.active.push(c);
    }
    return { dealGroups: Array.from(groupMap.values()), recent };
  }, [conversations]);

  const [expandedDeals, setExpandedDeals] = useState<Set<number>>(new Set());

  const handleNewDealChat = async (dealId: number) => {
    try {
      const resp = await fetch(`/api/chat/conversations/for-deal/${dealId}`, {
        method: 'POST',
        headers: authHeaders(),
      });
      if (resp.ok) {
        const convo = await resp.json();
        handleConversationClick(convo.id);
      }
    } catch { /* ignore */ }
  };

  return (
    <div
      className="flex flex-col h-full bg-[#FAFAFA] border-r border-[rgba(0,0,0,0.06)] select-none"
      style={{ width: isMobile ? 280 : 240 }}
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
          className="flex items-center justify-center gap-2 w-full bg-white border border-[rgba(0,0,0,0.06)] shadow-sm text-[#0D0D0D] font-bold text-sm px-3 py-2.5 rounded-lg hover:bg-[#FDFCFB] transition-colors cursor-pointer"
          style={{ fontFamily: 'inherit' }}
          type="button"
        >
          <svg className="w-4 h-4 text-[#D44A78]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Workspace
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* 3. USE CASES NAVIGATION */}
        <div className="px-3">
          <div className="text-[11px] font-bold text-[rgba(0,0,0,0.25)] uppercase tracking-wider mb-2 px-3">Use Cases</div>
          <nav className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id && viewState === 'landing';
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#0D0D0D] shadow-sm border border-[rgba(0,0,0,0.06)] font-bold'
                      : 'text-[rgba(0,0,0,0.4)] hover:bg-white hover:text-[#0D0D0D] font-medium border border-transparent'
                  }`}
                  style={{ fontFamily: 'inherit' }}
                  type="button"
                >
                  <span className={isActive ? 'text-[#D44A78]' : 'text-[rgba(0,0,0,0.25)]'}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Conversation history — authenticated only */}
        {user && conversations.length > 0 && (
          <div className="px-3 mt-4">
            {dealGroups.length > 0 && (
              <div>
                <div className="text-[11px] font-bold text-[rgba(0,0,0,0.25)] uppercase tracking-wider mb-2 px-3">Deals</div>
                {dealGroups.map(group => {
                  const color = JOURNEY_COLORS[group.journey || ''] || '#6E6A63';
                  const isExpanded = expandedDeals.has(group.dealId);
                  return (
                    <div key={group.dealId} className="mb-1">
                      {/* Deal header */}
                      <div className="flex items-center gap-2 px-3 py-2">
                        <span
                          className="w-[18px] h-[18px] rounded-[5px] flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                          style={{ backgroundColor: color }}
                        >
                          {(group.journey || '?')[0].toUpperCase()}
                        </span>
                        <span className="text-[12px] font-semibold text-[#0D0D0D] truncate flex-1 min-w-0" style={{ fontFamily: 'inherit' }}>
                          {group.businessName}
                        </span>
                        {group.currentGate && (
                          <span className="text-[9px] font-bold text-[#D44A78] bg-[#FFF0EB] px-[5px] py-[1px] rounded-[3px] shrink-0">
                            {group.currentGate}
                          </span>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleNewDealChat(group.dealId); }}
                          className="w-[20px] h-[20px] rounded-full border-none cursor-pointer flex items-center justify-center text-[rgba(0,0,0,0.25)] hover:text-[#D44A78] hover:bg-[#FFF0EB] transition-colors shrink-0 bg-transparent p-0"
                          type="button"
                          aria-label="New chat in deal"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                        </button>
                      </div>
                      {/* Active conversations */}
                      {group.active.map(c => (
                        <button
                          key={c.id}
                          onClick={() => handleConversationClick(c.id)}
                          className={`flex items-center gap-2 w-full px-3 py-2 ml-1 rounded-lg text-sm transition-all cursor-pointer border ${
                            c.id === activeConversationId && viewState === 'chat'
                              ? 'bg-white text-[#0D0D0D] shadow-sm border-[rgba(0,0,0,0.06)] font-bold'
                              : 'text-[rgba(0,0,0,0.4)] hover:bg-white hover:text-[#0D0D0D] font-medium border-transparent'
                          }`}
                          style={{ fontFamily: 'inherit', width: 'calc(100% - 4px)' }}
                          type="button"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] shrink-0" />
                          <span className="truncate flex-1 min-w-0 text-left">{c.title}</span>
                        </button>
                      ))}
                      {/* Completed toggle */}
                      {group.completed.length > 0 && (
                        <>
                          <button
                            onClick={() => setExpandedDeals(prev => {
                              const next = new Set(prev);
                              if (next.has(group.dealId)) next.delete(group.dealId);
                              else next.add(group.dealId);
                              return next;
                            })}
                            className="w-full text-left border-none cursor-pointer bg-transparent px-3 py-1 ml-1 text-[10px] font-medium text-[rgba(0,0,0,0.3)] hover:text-[rgba(0,0,0,0.5)] transition-colors flex items-center gap-1"
                            style={{ fontFamily: 'inherit', width: 'calc(100% - 4px)' }}
                            type="button"
                          >
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}><path d="M9 18l6-6-6-6" /></svg>
                            {group.completed.length} completed
                          </button>
                          {isExpanded && group.completed.map(c => (
                            <button
                              key={c.id}
                              onClick={() => handleConversationClick(c.id)}
                              className={`flex items-center gap-2 w-full px-3 py-1.5 ml-1 rounded-lg text-sm transition-all cursor-pointer border ${
                                c.id === activeConversationId && viewState === 'chat'
                                  ? 'bg-white text-[#0D0D0D] shadow-sm border-[rgba(0,0,0,0.06)]'
                                  : 'text-[rgba(0,0,0,0.35)] hover:bg-white hover:text-[#0D0D0D] border-transparent'
                              }`}
                              style={{ fontFamily: 'inherit', width: 'calc(100% - 4px)' }}
                              type="button"
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="2.5" className="shrink-0"><path d="M20 6L9 17l-5-5" /></svg>
                              <span className="truncate flex-1 min-w-0 text-left text-[12px]">{c.title}</span>
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {recent.length > 0 && (
              <div className="mt-2">
                <div className="text-[11px] font-bold text-[rgba(0,0,0,0.25)] uppercase tracking-wider mb-2 px-3">Recent</div>
                {recent.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleConversationClick(c.id)}
                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                      c.id === activeConversationId && viewState === 'chat'
                        ? 'bg-white text-[#0D0D0D] shadow-sm border border-[rgba(0,0,0,0.06)] font-medium'
                        : 'text-[rgba(0,0,0,0.4)] hover:bg-white hover:text-[#0D0D0D] font-medium border border-transparent'
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
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer text-[rgba(0,0,0,0.4)] hover:bg-white hover:text-[#0D0D0D] font-medium border border-transparent"
          style={{ fontFamily: 'inherit' }}
          type="button"
        >
          <span className="text-[rgba(0,0,0,0.25)]">
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
