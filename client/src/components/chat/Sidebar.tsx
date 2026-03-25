import { useState, useMemo } from 'react';
import { authHeaders } from '../../hooks/useAuth';

export interface Conversation {
  id: number;
  title: string;
  deal_id: number | null;
  journey?: string | null;
  current_gate?: string | null;
  business_name?: string | null;
  industry?: string | null;
  gate_status?: string;
  summary?: string;
  created_at: string;
  updated_at: string;
}

interface SidebarProps {
  conversations: Conversation[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onNew: () => void;
  onClose: () => void;
  userName?: string;
  onSignOut?: () => void;
  anonymous?: boolean;
  visible?: boolean;
}

const JOURNEY_COLORS: Record<string, string> = {
  sell: '#BA3C60',
  buy: '#4E8FD4',
  raise: '#6B8F4E',
  pmi: '#8F6BD4',
};

const JOURNEY_ICONS: Record<string, string> = {
  sell: 'S',
  buy: 'B',
  raise: 'R',
  pmi: 'P',
};

interface DealGroup {
  dealId: number;
  businessName: string;
  journey: string | null;
  currentGate: string | null;
  active: Conversation[];
  completed: Conversation[];
}

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

function DealCard({
  group,
  activeId,
  onSelect,
  onNewChat,
}: {
  group: DealGroup;
  activeId: number | null;
  onSelect: (id: number) => void;
  onNewChat: (dealId: number) => void;
}) {
  const [showHistory, setShowHistory] = useState(false);
  const color = JOURNEY_COLORS[group.journey || ''] || '#6E6A63';

  return (
    <div className="mb-1">
      {/* Deal header */}
      <div className="flex items-center gap-1.5 px-2 py-1.5">
        <span
          className="w-[18px] h-[18px] rounded-[5px] flex items-center justify-center text-[9px] font-bold text-white shrink-0"
          style={{ backgroundColor: color }}
        >
          {JOURNEY_ICONS[group.journey || ''] || '?'}
        </span>
        <span className="text-[12px] font-semibold text-[#0D0D0D] font-sans truncate flex-1 min-w-0">
          {group.businessName}
        </span>
        {group.currentGate && (
          <span className="text-[9px] font-bold text-[#BA3C60] bg-[#FFF0EB] px-[5px] py-[1px] rounded-[3px] font-sans shrink-0">
            {group.currentGate}
          </span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onNewChat(group.dealId); }}
          className="w-[20px] h-[20px] rounded-full border-none cursor-pointer flex items-center justify-center text-[rgba(0,0,0,0.3)] hover:text-[#BA3C60] hover:bg-[#FFF0EB] transition-colors shrink-0 bg-transparent p-0"
          type="button"
          aria-label="New chat in deal"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {/* Active conversations */}
      {group.active.map(c => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={`w-full text-left border-none cursor-pointer rounded-[8px] px-2 py-1.5 mb-0.5 ml-1 transition-colors ${
            c.id === activeId ? '' : 'bg-transparent'
          }`}
          style={{
            background: c.id === activeId ? 'rgba(255,255,255,0.55)' : undefined,
            width: 'calc(100% - 4px)',
          }}
          type="button"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] shrink-0" />
            <span className={`text-[12px] font-sans truncate flex-1 min-w-0 ${
              c.id === activeId ? 'font-semibold text-[#0D0D0D]' : 'font-medium text-[#3D3B37]'
            }`}>
              {c.title}
            </span>
            <span className="text-[10px] text-[rgba(0,0,0,0.35)] font-sans shrink-0">
              {formatShortTime(c.updated_at)}
            </span>
          </div>
        </button>
      ))}

      {/* Completed conversations */}
      {group.completed.length > 0 && (
        <>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full text-left border-none cursor-pointer bg-transparent px-2 py-1 ml-1 text-[10px] font-medium text-[rgba(0,0,0,0.35)] hover:text-[rgba(0,0,0,0.6)] transition-colors font-sans flex items-center gap-1"
            type="button"
            style={{ width: 'calc(100% - 4px)' }}
          >
            <svg
              width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{ transform: showHistory ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
            {group.completed.length} completed gate{group.completed.length !== 1 ? 's' : ''}
          </button>
          {showHistory && group.completed.map(c => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`w-full text-left border-none cursor-pointer rounded-[8px] px-2 py-1 mb-0.5 ml-1 transition-colors ${
                c.id === activeId ? '' : 'bg-transparent'
              }`}
              style={{
                background: c.id === activeId ? 'rgba(255,255,255,0.55)' : undefined,
                width: 'calc(100% - 4px)',
              }}
              type="button"
            >
              <div className="flex items-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="2.5" className="shrink-0">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span className="text-[11px] font-sans truncate flex-1 min-w-0 text-[rgba(0,0,0,0.4)]">
                  {c.title}
                </span>
              </div>
            </button>
          ))}
        </>
      )}
    </div>
  );
}

export default function Sidebar({ conversations, activeId, onSelect, onNew, onClose, userName, onSignOut, anonymous, visible = true }: SidebarProps) {
  // Group conversations by deal_id
  const { dealGroups, recent } = useMemo(() => {
    const groupMap = new Map<number, DealGroup>();
    const recent: Conversation[] = [];

    for (const c of conversations) {
      if (c.deal_id == null) {
        recent.push(c);
        continue;
      }

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

      // Update deal-level info from most recent conversation
      if (c.business_name) group.businessName = c.business_name;
      if (c.current_gate) group.currentGate = c.current_gate;

      if (c.gate_status === 'completed') {
        group.completed.push(c);
      } else {
        group.active.push(c);
      }
    }

    return { dealGroups: Array.from(groupMap.values()), recent };
  }, [conversations]);

  const handleNewDealChat = async (dealId: number) => {
    try {
      const resp = await fetch(`/api/chat/conversations/for-deal/${dealId}`, {
        method: 'POST',
        headers: authHeaders(),
      });
      if (resp.ok) {
        const convo = await resp.json();
        onSelect(convo.id);
      }
    } catch { /* ignore */ }
  };

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{
        width: visible ? 240 : 0,
        minWidth: visible ? 240 : 0,
        background: '#FAFAFA',
        borderRight: visible ? '1px solid rgba(0,0,0,0.06)' : 'none',
        transition: 'width 0.25s ease, min-width 0.25s ease',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-end px-3.5 pt-3.5 pb-1.5" style={{ minWidth: 240 }}>
        <button
          onClick={onNew}
          className="w-[34px] h-[34px] rounded-full border-none cursor-pointer flex items-center justify-center text-[#BA3C60] hover:bg-[#FFF0EB] transition-colors"
          style={{ background: 'rgba(255,255,255,0.5)' }}
          type="button"
          aria-label="New chat"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-1.5 py-0.5" style={{ minWidth: 240 }}>
        {/* Deal Groups */}
        {dealGroups.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#BA3C60] font-sans px-2 pt-2.5 pb-1 m-0">
              Deals
            </p>
            {dealGroups.map(group => (
              <DealCard
                key={group.dealId}
                group={group}
                activeId={activeId}
                onSelect={onSelect}
                onNewChat={handleNewDealChat}
              />
            ))}
          </div>
        )}

        {/* Recent */}
        {recent.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[rgba(0,0,0,0.4)] font-sans px-2 pt-2.5 pb-1 m-0">
              Recent
            </p>
            {recent.map(c => (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={`w-full text-left border-none cursor-pointer rounded-[10px] px-2 py-1.5 mb-0.5 flex items-center gap-2 transition-colors ${
                  c.id === activeId ? '' : 'bg-transparent'
                }`}
                style={{ background: c.id === activeId ? 'rgba(255,255,255,0.55)' : undefined }}
                type="button"
              >
                {c.journey && (
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: JOURNEY_COLORS[c.journey] || '#6E6A63' }}
                  />
                )}
                <span className="text-[13px] font-medium text-[#3D3B37] font-sans truncate flex-1 min-w-0">
                  {c.title}
                </span>
                <span className="text-[11px] text-[#A9A49C] font-sans shrink-0">
                  {formatShortTime(c.updated_at)}
                </span>
              </button>
            ))}
          </div>
        )}

        {conversations.length === 0 && (
          <p className="text-sm text-[#A9A49C] font-sans text-center py-8 m-0">
            No conversations yet
          </p>
        )}
      </div>

      {/* Footer */}
      {!anonymous && userName && onSignOut && (
        <div className="flex items-center justify-between px-3.5 py-2.5" style={{ borderTop: '1px solid rgba(0,0,0,0.06)', minWidth: 260 }}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.5)' }}>
              <span className="text-[11px] font-semibold text-[#3D3B37] font-sans">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-[12px] font-medium text-[#0D0D0D] font-sans truncate">
              {userName}
            </span>
          </div>
          <button
            onClick={onSignOut}
            className="text-[11px] font-medium text-[rgba(0,0,0,0.4)] bg-transparent border-none cursor-pointer hover:text-[#BA3C60] transition-colors px-0"
            type="button"
          >
            Sign out
          </button>
        </div>
      )}

      {anonymous && (
        <div className="border-t border-border px-4 py-3 text-center">
          <span className="text-[13px] text-[#A9A49C]">
            Free preview · <a href="/signup" className="text-[#BA3C60] no-underline hover:underline font-medium">Create account</a> for full access
          </span>
        </div>
      )}
    </div>
  );
}
