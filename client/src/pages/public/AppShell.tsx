import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../../hooks/useAuth';
import { useAnonymousChat } from '../../hooks/useAnonymousChat';
import { useAuthChat } from '../../hooks/useAuthChat';
import Logo from '../../components/public/Logo';
import Sidebar, { type TabId, type ViewState } from '../../components/shell/Sidebar';
import InputDock, { SUGGESTION_CHIPS } from '../../components/shell/InputDock';
import ChatMessages from '../../components/shell/ChatMessages';
import HomeContent from '../../components/content/HomeContent';
import SellContent from '../../components/content/SellContent';
import BuyContent from '../../components/content/BuyContent';
import AdvisorsContent from '../../components/content/AdvisorsContent';
import PricingContent from '../../components/content/PricingContent';
import InlineSignupCard from '../../components/chat/InlineSignupCard';
// Authenticated tool components
import PipelinePanel from '../../components/chat/PipelinePanel';
import DataRoom from '../../components/chat/DataRoom';
import SettingsPanel from '../../components/chat/SettingsPanel';
import GateProgress from '../../components/chat/GateProgress';
import PaywallCard from '../../components/chat/PaywallCard';
import Canvas from '../../components/chat/Canvas';
import CanvasShell from '../../components/chat/CanvasShell';

/** Map URL path to initial state */
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

export default function AppShell() {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();

  // Core state
  const [viewState, setViewState] = useState<ViewState>(() => pathToViewState(location));
  const [activeTab, setActiveTab] = useState<TabId>(() => pathToTab(location));
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Canvas/deliverable state (within chat view)
  const [viewingDeliverable, setViewingDeliverable] = useState<number | null>(null);

  // Anonymous chat hook (always called for hook order consistency)
  const anonChat = useAnonymousChat();

  // Authenticated chat hook (always called for hook order consistency)
  const authChat = useAuthChat(user);

  // Set initial conversation ID from URL
  useEffect(() => {
    const convId = getInitialConversationId(window.location.pathname);
    if (convId && user) {
      authChat.selectConversation(convId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Unified message interface — pick based on auth state
  const messages = user ? authChat.messages : anonChat.messages;
  const sending = user ? authChat.sending : anonChat.sending;
  const streamingText = user ? authChat.streamingText : anonChat.streamingText;

  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync URL changes to state (covers initial load + programmatic navigate)
  useEffect(() => {
    const tab = pathToTab(location);
    if (tab !== activeTab && viewState === 'landing') {
      setActiveTab(tab);
    }
  }, [location]);

  // Handle browser back/forward — sync tab and return to landing if in chat
  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname;
      const newViewState = pathToViewState(path);
      const newTab = pathToTab(path);
      setViewState(newViewState);
      setActiveTab(newTab);

      // If navigating to a conversation via back/forward
      const convId = getInitialConversationId(path);
      if (convId && user) {
        authChat.selectConversation(convId);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [user]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (viewState === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingText, viewState]);

  // Handle send — morph to chat
  const handleSend = useCallback((content: string) => {
    if (viewState === 'landing') {
      setViewState('chat');
      if (window.location.pathname !== '/chat') {
        navigate('/chat');
      }
    }
    if (user) {
      authChat.sendMessage(content);
    } else {
      anonChat.sendMessage(content);
    }
  }, [viewState, user, authChat, anonChat, navigate]);

  // Handle back to guide
  const handleBack = useCallback(() => {
    setViewState('landing');
    const tab = activeTab;
    const urlMap: Record<TabId, string> = {
      home: '/', sell: '/sell', buy: '/buy', advisors: '/advisors', pricing: '/pricing',
    };
    navigate(urlMap[tab]);
  }, [activeTab, navigate]);

  // Handle logout
  const handleLogout = useCallback(() => {
    logout();
    setViewState('landing');
    setActiveTab('home');
    navigate('/');
  }, [logout, navigate]);

  // Detect mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Anonymous signup prompt
  const showSignup = !user && (
    anonChat.limitReached ||
    (anonChat.messagesRemaining !== null && anonChat.messagesRemaining <= 5 && anonChat.messages.length > 0)
  );

  // Redirect unauthenticated users from tool views
  useEffect(() => {
    if (['pipeline', 'dataroom', 'settings'].includes(viewState) && !user) {
      navigate('/login');
    }
  }, [viewState, user, navigate]);

  // Content map for educational tabs
  const contentMap: Record<TabId, JSX.Element> = {
    home: <HomeContent onSend={handleSend} />,
    sell: <SellContent onSend={handleSend} />,
    buy: <BuyContent onSend={handleSend} />,
    advisors: <AdvisorsContent onSend={handleSend} />,
    pricing: <PricingContent onSend={handleSend} />,
  };

  // Should we show the input dock?
  const showInputDock = (viewState === 'landing' || viewState === 'chat') &&
    !((!user && anonChat.limitReached));

  return (
    <div
      className="flex h-dvh bg-white text-[#2D3142] font-sans overflow-hidden selection:bg-[#D4714E] selection:text-white"
    >
      {/* Desktop sidebar */}
      {!isMobile && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          viewState={viewState}
          setViewState={setViewState}
          isMobile={false}
          user={user}
          onLogout={handleLogout}
          conversations={authChat.conversations}
          activeConversationId={authChat.activeConversationId}
          onSelectConversation={(id) => {
            authChat.selectConversation(id);
            setViewState('chat');
            navigate(`/chat/${id}`);
          }}
          onNewConversation={() => {
            authChat.newConversation();
            setViewState('chat');
            navigate('/chat');
          }}
        />
      )}

      {/* Mobile sidebar overlay */}
      {isMobile && isMobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 animate-[slideInLeft_0.25s_ease]">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              viewState={viewState}
              setViewState={setViewState}
              isMobile={true}
              onClose={() => setIsMobileSidebarOpen(false)}
              user={user}
              onLogout={handleLogout}
              conversations={authChat.conversations}
              activeConversationId={authChat.activeConversationId}
              onSelectConversation={(id) => {
                authChat.selectConversation(id);
                setViewState('chat');
                navigate(`/chat/${id}`);
              }}
              onNewConversation={() => {
                authChat.newConversation();
                setViewState('chat');
                navigate('/chat');
              }}
            />
          </div>
        </>
      )}

      {/* Main area */}
      <main className="flex-1 flex flex-col relative min-w-0 h-full bg-white">
        {/* Mobile header */}
        {isMobile && (
          <header className="flex-shrink-0 flex items-center gap-3 px-4 h-14 border-b border-gray-100 bg-white sticky top-0 z-30">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="w-9 h-9 rounded-lg flex items-center justify-center bg-transparent border-none cursor-pointer text-[#4F5D75] hover:bg-gray-100"
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <Logo linked={false} />
          </header>
        )}

        {/* Scrollable content area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto min-h-0"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* Landing — educational content */}
          {viewState === 'landing' && (
            <div key={activeTab} className="transition-opacity duration-500">
              {contentMap[activeTab]}

              {/* Suggestion chips — inside scroll area */}
              {(SUGGESTION_CHIPS[activeTab] || []).length > 0 && (
                <div className="max-w-3xl mx-auto px-4 pb-8">
                  <div className="flex flex-wrap gap-2.5 justify-center">
                    {(SUGGESTION_CHIPS[activeTab] || []).map((chip) => (
                      <button
                        key={chip.label}
                        onClick={() => handleSend(chip.prompt)}
                        className="px-5 py-2.5 rounded-full border-2 border-gray-200 bg-white text-[14px] font-medium text-[#2D3142] hover:border-[#D4714E] hover:bg-[#FFF8F4] hover:text-[#D4714E] transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-[0.97]"
                        style={{ fontFamily: 'inherit' }}
                        type="button"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Spacer for input dock clearance */}
              <div className="h-24" />
            </div>
          )}

          {/* Chat view */}
          {viewState === 'chat' && (
            <>
              {/* Gate progress — authenticated only */}
              {user && authChat.activeDealId && (
                <GateProgress dealId={authChat.activeDealId} currentGate={authChat.currentGate} />
              )}

              <ChatMessages
                messages={messages}
                streamingText={streamingText}
                sending={sending}
                onBack={handleBack}
              />

              {/* Paywall card — authenticated only */}
              {user && authChat.paywallData && authChat.activeDealId && (
                <div className="max-w-3xl mx-auto px-4 mb-4">
                  <PaywallCard
                    paywall={authChat.paywallData}
                    dealId={authChat.activeDealId}
                    onUnlocked={(toGate, deliverableId) => {
                      authChat.setPaywallData(null);
                      if (deliverableId) {
                        setViewingDeliverable(deliverableId);
                      }
                    }}
                    onTopUp={() => {
                      const walletBtn = document.querySelector('[data-wallet-toggle]') as HTMLButtonElement;
                      if (walletBtn) walletBtn.click();
                    }}
                  />
                </div>
              )}

              {/* Anonymous signup prompt */}
              {showSignup && (
                <div className="max-w-md mx-auto px-4 mb-4">
                  <InlineSignupCard sessionId={anonChat.getSessionId()} canDismiss={!anonChat.limitReached} />
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}

          {/* Pipeline — authenticated */}
          {viewState === 'pipeline' && user && (
            <div className="max-w-5xl mx-auto px-4 py-6">
              <PipelinePanel
                onOpenConversation={(convId) => {
                  authChat.selectConversation(convId);
                  setViewState('chat');
                  navigate(`/chat/${convId}`);
                }}
                onNewDeal={() => {
                  authChat.newConversation();
                  setViewState('chat');
                  navigate('/chat');
                }}
                isFullscreen={true}
              />
            </div>
          )}

          {/* Data Room — authenticated */}
          {viewState === 'dataroom' && user && (
            <div className="max-w-5xl mx-auto px-4 py-6">
              <DataRoom
                dealId={authChat.activeDealId}
                onViewDeliverable={(id) => setViewingDeliverable(id)}
              />
            </div>
          )}

          {/* Settings — authenticated */}
          {viewState === 'settings' && user && (
            <div className="max-w-3xl mx-auto px-4 py-6">
              <SettingsPanel
                user={user}
                onLogout={handleLogout}
                isFullscreen={true}
              />
            </div>
          )}
        </div>

        {/* Deliverable viewer overlay */}
        {viewingDeliverable !== null && (
          <div className="fixed inset-0 z-50 bg-white flex flex-col">
            <Canvas
              deliverableId={viewingDeliverable}
              onClose={() => setViewingDeliverable(null)}
            />
          </div>
        )}

        {/* Persistent input dock — only on landing and chat views */}
        {showInputDock && (
          <InputDock
            viewState={viewState}
            activeTab={activeTab}
            onSend={handleSend}
            disabled={sending}
          />
        )}
      </main>

      {/* Global keyframe animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
