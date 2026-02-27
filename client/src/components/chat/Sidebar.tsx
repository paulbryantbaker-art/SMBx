export interface Conversation {
  id: number;
  title: string;
  deal_id: number | null;
  journey?: string | null;
  current_gate?: string | null;
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

export default function Sidebar({ conversations, activeId, onSelect, onNew, onClose, userName, onSignOut, anonymous, visible = true }: SidebarProps) {
  const deals = conversations.filter(c => c.deal_id != null);
  const recent = conversations.filter(c => c.deal_id == null);

  return (
    <div
      className="flex flex-col h-full bg-[#FAF8F4] overflow-hidden"
      style={{
        width: visible ? 260 : 0,
        minWidth: visible ? 260 : 0,
        borderRight: visible ? '1px solid #DDD9D1' : 'none',
        transition: 'width 0.25s ease, min-width 0.25s ease',
      }}
    >
      {/* Header — just new chat button */}
      <div className="flex items-center justify-end px-3.5 pt-3.5 pb-1.5" style={{ minWidth: 260 }}>
        <button
          onClick={onNew}
          className="w-[34px] h-[34px] rounded-full bg-[#F3F0EA] border-none cursor-pointer flex items-center justify-center text-[#D4714E] hover:bg-[#FFF0EB] transition-colors"
          type="button"
          aria-label="New chat"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-1.5 py-0.5" style={{ minWidth: 260 }}>
        {/* Active Deals */}
        {deals.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#D4714E] font-sans px-2 pt-2.5 pb-1 m-0">
              Active Deals
            </p>
            {deals.map(c => (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={`w-full text-left border-none cursor-pointer rounded-[10px] px-2 py-2 mb-0.5 transition-colors ${
                  c.id === activeId ? 'bg-[#F3F0EA]' : 'bg-transparent hover:bg-[rgba(243,240,234,0.6)]'
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
                    <p className="text-[13px] font-semibold text-[#1A1A18] font-sans m-0 truncate leading-snug">
                      {c.title}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {c.current_gate && (
                        <span className="text-[10px] font-bold text-[#D4714E] bg-[#FFF0EB] px-[5px] py-[1px] rounded-[3px] font-sans">
                          {c.current_gate}
                        </span>
                      )}
                      <span className="text-[11px] text-[#6E6A63] font-sans">
                        {formatShortTime(c.updated_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Recent */}
        {recent.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#6E6A63] font-sans px-2 pt-2.5 pb-1 m-0">
              Recent
            </p>
            {recent.map(c => (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={`w-full text-left border-none cursor-pointer rounded-[10px] px-2 py-1.5 mb-0.5 flex items-center gap-2 transition-colors ${
                  c.id === activeId ? 'bg-[#F3F0EA]' : 'bg-transparent hover:bg-[rgba(243,240,234,0.6)]'
                }`}
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
        <div className="flex items-center justify-between px-3.5 py-2.5" style={{ borderTop: '1px solid #DDD9D1', minWidth: 260 }}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-[26px] h-[26px] rounded-full bg-[#F3F0EA] flex items-center justify-center shrink-0">
              <span className="text-[11px] font-semibold text-[#3D3B37] font-sans">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-[12px] font-medium text-[#1A1A18] font-sans truncate">
              {userName}
            </span>
          </div>
          <button
            onClick={onSignOut}
            className="text-[11px] font-medium text-[#6E6A63] bg-transparent border-none cursor-pointer hover:text-[#D4714E] transition-colors px-0"
            type="button"
          >
            Sign out
          </button>
        </div>
      )}

      {anonymous && (
        <div className="border-t border-border px-4 py-3 text-center">
          <span className="text-[13px] text-[#A9A49C]">
            Free preview · <a href="/signup" className="text-[#D4714E] no-underline hover:underline font-medium">Create account</a> for full access
          </span>
        </div>
      )}
    </div>
  );
}
