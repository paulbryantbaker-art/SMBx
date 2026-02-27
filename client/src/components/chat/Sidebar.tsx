import Button from '../ui/Button';

export interface Conversation {
  id: number;
  title: string;
  deal_id: number | null;
  created_at: string;
  updated_at: string;
}

interface SidebarProps {
  conversations: Conversation[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onNew: () => void;
  onClose: () => void;
  userName: string;
  onSignOut: () => void;
}

function groupByDate(convos: Conversation[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const week = new Date(today.getTime() - 7 * 86400000);
  const month = new Date(today.getTime() - 30 * 86400000);

  const groups: { label: string; items: Conversation[] }[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'Previous 7 Days', items: [] },
    { label: 'Previous 30 Days', items: [] },
    { label: 'Older', items: [] },
  ];

  for (const c of convos) {
    const d = new Date(c.updated_at);
    if (d >= today) groups[0].items.push(c);
    else if (d >= yesterday) groups[1].items.push(c);
    else if (d >= week) groups[2].items.push(c);
    else if (d >= month) groups[3].items.push(c);
    else groups[4].items.push(c);
  }

  return groups.filter(g => g.items.length > 0);
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

export default function Sidebar({ conversations, activeId, onSelect, onNew, onClose, userName, onSignOut }: SidebarProps) {
  const groups = groupByDate(conversations);

  return (
    <div className="flex flex-col h-full w-[280px] min-w-[280px] bg-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-2xl font-bold text-terra font-[Georgia,ui-serif,serif]">
          smbx.ai
        </span>
        <Button variant="icon" onClick={onClose} aria-label="Close sidebar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Button>
      </div>

      {/* New Chat */}
      <div className="px-3 py-2">
        <Button variant="secondary" onClick={onNew} className="!w-full !justify-center !h-10 !px-4 !text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New chat
        </Button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {groups.map(group => (
          <div key={group.label}>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-text-tertiary font-[system-ui,sans-serif] px-2 pt-3 pb-1 m-0">
              {group.label}
            </p>
            {group.items.map(c => (
              <Button
                key={c.id}
                variant="ghost"
                onClick={() => onSelect(c.id)}
                className={`!w-full !text-left !justify-between !rounded-lg !px-3 !py-2 !h-auto group ${
                  c.id === activeId ? '!bg-cream-hover !text-text-primary' : ''
                }`}
              >
                <span className="truncate text-sm">{c.title}</span>
                <span className="text-sm text-text-tertiary font-[system-ui,sans-serif] shrink-0 ml-2">
                  {formatShortTime(c.updated_at)}
                </span>
              </Button>
            ))}
          </div>
        ))}
        {conversations.length === 0 && (
          <p className="text-sm text-text-tertiary font-[system-ui,sans-serif] text-center py-8 m-0">
            No conversations yet
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-medium text-text-primary font-[system-ui,sans-serif] truncate max-w-[140px]">
          {userName}
        </span>
        <Button variant="ghost" onClick={onSignOut} className="!text-sm !px-2 !py-1 !h-auto">
          Sign out
        </Button>
      </div>
    </div>
  );
}
