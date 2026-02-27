import { useChatContext } from '../../context/ChatContext';
import ChatView from './ChatView';
import Sidebar from './Sidebar';

interface Props {
  children: React.ReactNode;
}

export default function ChatMorph({ children }: Props) {
  const {
    morphPhase,
    conversations,
    activeConversationId,
    sidebarOpen,
    loadConversation,
    startNewConversation,
    setSidebarOpen,
  } = useChatContext();

  if (morphPhase === 'chat') {
    return (
      <main className="flex-1 flex min-h-0 morph-fade-in">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-[rgba(0,0,0,0.2)] z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed md:relative z-50 md:z-auto h-full
          transition-transform duration-200 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <Sidebar
            conversations={conversations}
            activeId={activeConversationId}
            onSelect={loadConversation}
            onNew={startNewConversation}
            onClose={() => setSidebarOpen(false)}
            anonymous
          />
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile hamburger */}
          <div className="shrink-0 flex items-center px-4 py-2 md:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-transparent border-none cursor-pointer text-[#3D3B37] hover:bg-[rgba(212,113,78,.08)] hover:text-[#D4714E] transition-colors"
              type="button"
              aria-label="Open sidebar"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
          </div>
          <ChatView />
        </div>
      </main>
    );
  }

  return (
    <main className={`flex-1 ${morphPhase === 'morphing' ? 'morph-fade-out pointer-events-none' : ''}`}>
      {children}
    </main>
  );
}
