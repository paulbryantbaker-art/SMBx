import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useAnonymousChat } from '../../hooks/useAnonymousChat';
import { useAppHeight } from '../../hooks/useAppHeight';
import Sidebar, { type TabId, type ViewState } from '../../components/shell/Sidebar';
import InputDock, { SUGGESTION_CHIPS } from '../../components/shell/InputDock';
import ChatMessages from '../../components/shell/ChatMessages';
import HomeContent from '../../components/content/HomeContent';
import SellContent from '../../components/content/SellContent';
import BuyContent from '../../components/content/BuyContent';
import AdvisorsContent from '../../components/content/AdvisorsContent';
import PricingContent from '../../components/content/PricingContent';
import InlineSignupCard from '../../components/chat/InlineSignupCard';

/** Map URL path to tab */
function pathToTab(path: string): TabId {
  if (path === '/sell') return 'sell';
  if (path === '/buy') return 'buy';
  if (path === '/advisors' || path === '/enterprise') return 'advisors';
  if (path === '/pricing') return 'pricing';
  return 'home';
}

export default function AppShell() {
  const [location] = useLocation();
  useAppHeight();

  // Core state
  const [viewState, setViewState] = useState<ViewState>('landing');
  const [activeTab, setActiveTab] = useState<TabId>(pathToTab(location));
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Chat state — reuse existing anonymous chat hook
  const {
    messages, sending, streamingText, messagesRemaining,
    limitReached, sendMessage, getSessionId,
  } = useAnonymousChat();

  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync URL changes to activeTab
  useEffect(() => {
    const tab = pathToTab(location);
    if (tab !== activeTab && viewState === 'landing') {
      setActiveTab(tab);
    }
  }, [location]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (viewState === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingText, viewState]);

  // Handle send — morph to chat
  const handleSend = useCallback((content: string) => {
    if (viewState === 'landing') setViewState('chat');
    sendMessage(content);
  }, [viewState, sendMessage]);

  // Handle back to guide
  const handleBack = useCallback(() => {
    setViewState('landing');
  }, []);

  // Detect mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const showSignup = limitReached || (messagesRemaining !== null && messagesRemaining <= 5 && messages.length > 0);

  // Content map
  const contentMap: Record<TabId, JSX.Element> = {
    home: <HomeContent />,
    sell: <SellContent />,
    buy: <BuyContent />,
    advisors: <AdvisorsContent />,
    pricing: <PricingContent />,
  };

  return (
    <div
      className="flex bg-white text-[#2D3142] font-sans overflow-hidden selection:bg-[#D4714E] selection:text-white"
      style={{ height: 'var(--app-height, 100dvh)', overscrollBehavior: 'none', position: 'fixed', inset: 0 }}
    >
      {/* ── Desktop sidebar ── */}
      {!isMobile && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          viewState={viewState}
          setViewState={setViewState}
          isMobile={false}
        />
      )}

      {/* ── Mobile sidebar overlay ── */}
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
            />
          </div>
        </>
      )}

      {/* ── Main area ── */}
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
            <span className="text-[16px] font-extrabold tracking-tight">
              <span className="text-[#2D3142]">smbx</span>
              <span className="text-[#2D3142]">.ai</span>
            </span>
          </header>
        )}

        {/* Scrollable content area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto min-h-0"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {viewState === 'landing' ? (
            <div key={activeTab} className="transition-opacity duration-500">
              {contentMap[activeTab]}

              {/* Suggestion chips — inside scroll area so they scroll naturally */}
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

              {/* Spacer so content clears the fixed input dock */}
              <div className="h-24" />
            </div>
          ) : (
            <>
              <ChatMessages
                messages={messages}
                streamingText={streamingText}
                sending={sending}
                onBack={handleBack}
              />

              {showSignup && (
                <div className="max-w-md mx-auto px-4 mb-4">
                  <InlineSignupCard sessionId={getSessionId()} canDismiss={!limitReached} />
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Persistent input dock */}
        {!limitReached && (
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
