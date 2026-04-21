/**
 * AppShellInner — the Glass Grok mobile internal app, Apple-App-Store pattern.
 *
 * Renders when: mobile PWA user has authed AND the shell has frosted in
 * (progressive reveal — owned by AppShell.tsx).
 *
 * Four tabs: Today · Deals · Chat · Inbox. Chat is implemented as a
 * portaled full-screen overlay (Messages.app / WhatsApp pattern) rather
 * than an inline tab body — this lets the proven PWA keyboard infrastructure
 * stay honest (portal escapes transform ancestors; body is sized to
 * var(--vvh) so the overlay sees the visible viewport). When Chat is
 * active, the top bar and tab bar both hide; a back chevron inside the
 * chat header returns to the previous tab.
 *
 * See memory/architecture_glass_grok.md for the design spec and
 * memory/feedback_pwa_chat_flex_layout.md for the chat infrastructure saga.
 */

import { useMemo, useState } from 'react';
import MobileTopBar from './mobile/chrome/MobileTopBar';
import MobileTabBar from './mobile/chrome/MobileTabBar';
import TodayTab from './mobile/TodayTab';
import DealsTab from './mobile/DealsTab';
import InboxTab from './mobile/InboxTab';
import ChatFullscreen from './mobile/ChatFullscreen';
import HelpSheet from './sheets/HelpSheet';
import { adaptDeals } from './mobile/adaptDeals';
import { useDeliverables } from './mobile/useDeliverables';
import type { MobileTab } from './mobile/types';
import type { AppShellInnerProps } from './types';
import './mobile/mobile.css';

export default function AppShellInner({
  userName,
  userInitial,
  deals,
  activeDealId,
  activeConversationId: _activeConversationId,
  messages,
  streamingText,
  sending,
  activeTool,
  chatError,
  onRetry,
  onSend,
  onSelectDeal,
  onOpenDeliverable: _onOpenDeliverable,
  onAccountTap,
  onBack: _onBack,
}: AppShellInnerProps) {
  // Active content tab (Today / Deals / Inbox). When user taps the Chat tab,
  // we open ChatFullscreen as an overlay instead of switching content; the
  // last non-chat tab is remembered so the back chevron returns here.
  const [contentTab, setContentTab] = useState<Exclude<MobileTab, 'chat'>>('today');
  const [chatOpen, setChatOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // Which tab reads as "active" in the bottom tab bar — 'chat' when the
  // chat overlay is up, else the current content tab.
  const activeTab: MobileTab = chatOpen ? 'chat' : contentTab;

  const adapted = useMemo(() => adaptDeals(deals), [deals]);
  const activeDeal = useMemo(
    () => adapted.find((d) => d.id === activeDealId) ?? null,
    [adapted, activeDealId],
  );

  // Deliverables feed — powers Today's PINNED artifacts strip and
  // Chat's inline artifact cards. Fetched on mount, on deal-count change,
  // and after every assistant message completes (messages.length tracks
  // both user + assistant turns, so it increments when Yulia replies —
  // which is when a new deliverable would have just been produced).
  const { deliverables } = useDeliverables(deals.length, messages.length);

  const handleTabChange = (next: MobileTab) => {
    if (next === 'chat') {
      setChatOpen(true);
    } else {
      setChatOpen(false);
      setContentTab(next);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        background: 'var(--bg-app)',
        color: 'var(--text-primary)',
        fontFamily: "'Inter', system-ui, sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* TopBar — hidden while chat overlay is up (chat has its own header). */}
      {!chatOpen && (
        <MobileTopBar
          tab={contentTab}
          userInitial={userInitial}
          onHelpTap={() => setHelpOpen(true)}
          onAccountTap={onAccountTap}
        />
      )}

      {/* Tab content — single scrollable region. Padding-bottom reserves
          room for the floating tab bar (54 + 10 bottom = 64) + breathing (16). */}
      {!chatOpen && (
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            paddingBottom: 80,
          }}
        >
          {contentTab === 'today' && (
            <TodayTab
              deals={deals}
              deliverables={deliverables}
              activeDealId={activeDealId}
              userName={userName}
              onSelectDeal={onSelectDeal}
              onOpenChat={() => setChatOpen(true)}
              onOpenHelp={() => setHelpOpen(true)}
            />
          )}
          {contentTab === 'deals' && (
            <DealsTab
              deals={deals}
              onSelectDeal={onSelectDeal}
              onOpenChat={() => setChatOpen(true)}
            />
          )}
          {contentTab === 'inbox' && (
            <InboxTab
              deals={deals}
              onSelectDeal={onSelectDeal}
              onOpenChat={() => setChatOpen(true)}
            />
          )}
        </main>
      )}

      {/* Tab bar — portaled to body. Hidden while chat is open. */}
      {!chatOpen && <MobileTabBar active={activeTab} onChange={handleTabChange} />}

      {/* Chat overlay — portaled to body. Only renders when chatOpen. */}
      <ChatFullscreen
        open={chatOpen}
        deal={activeDeal}
        deliverables={deliverables}
        messages={messages}
        streamingText={streamingText}
        sending={sending}
        activeTool={activeTool}
        chatError={chatError}
        onRetry={onRetry}
        onSend={onSend}
        onBack={() => setChatOpen(false)}
      />

      {/* Help & Glossary bottom sheet — opens from TopBar bell + Today primer. */}
      <HelpSheet
        open={helpOpen}
        onOpenChange={setHelpOpen}
        onAskYulia={() => { setHelpOpen(false); setChatOpen(true); }}
      />
    </div>
  );
}
