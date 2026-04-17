/**
 * AppShellInner — the Glass Grok post-morph internal app composition.
 *
 * Renders when: mobile PWA user has authed AND the shell has frosted in
 * (progressive reveal — owned by AppShell.tsx).
 *
 * Layout (body is sized to var(--vvh) so scroll is contained; see
 * architecture_ios_pwa_pill.md):
 *
 *   ┌────────────────────────────────────┐
 *   │  TopBar (wordmark + profile)       │
 *   ├────────────────────────────────────┤
 *   │                                    │
 *   │  TabContent (routed: deal / docs / │
 *   │              pipeline / search)    │
 *   │                                    │
 *   │        ┌──────────────────────┐    │
 *   │        │  YuliaAgent (mini)   │    │  ← glass, above tab bar
 *   │        └──────────────────────┘    │
 *   ├────────────────────────────────────┤
 *   │  TabBar (glass, 4 tabs)            │
 *   └────────────────────────────────────┘
 *
 * See memory/architecture_glass_grok.md for the full spec.
 */

import { useState } from 'react';
import TopBar from './chrome/TopBar';
import TabBar from './chrome/TabBar';
import YuliaAgent from './chrome/YuliaAgent';
import DealTab from './tabs/DealTab';
import DocsTab from './tabs/DocsTab';
import PipelineTab from './tabs/PipelineTab';
import SearchTab from './tabs/SearchTab';
import HelpSheet from './sheets/HelpSheet';
import type { AppTab, YuliaState, AppShellInnerProps } from './types';

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
  const [tab, setTab] = useState<AppTab>('deal');
  const [yuliaState, setYuliaState] = useState<YuliaState>('mini');
  const [helpOpen, setHelpOpen] = useState(false);

  // Pipeline tab dims until there's sourcing or watchlist data. For v1,
  // "has deals" is the gate — once the user has any deals, Pipeline is live.
  const pipelineDim = deals.length === 0;

  const isFull = yuliaState === 'full';

  // Log helpers referenced but unused in v1 — keep to avoid lint errors while
  // TypeScript checks the full prop pass-through from AppShell.
  void userName;

  return (
    <div
      style={{
        position: 'relative',
        /* #app-root already applies paddingTop: env(safe-area-inset-top).
           Use 100dvh (dynamic viewport height) so the container extends to
           the actual viewport bottom — --vvh from visualViewport can under-
           report on iOS PWA and leave a gap below the tab bar. Subtract
           safe-top to avoid double-counting the status-bar inset. */
        height: 'calc(100dvh - env(safe-area-inset-top, 0px))',
        minHeight: 'calc(100dvh - env(safe-area-inset-top, 0px))',
        overflow: 'hidden',
        background: 'var(--bg-app)',
        color: 'var(--text-primary)',
        fontFamily: "'Inter', system-ui, sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar — hidden when full chat is open (chat has its own header). */}
      {!isFull && (
        <TopBar
          userInitial={userInitial}
          onAccountTap={onAccountTap}
          onHelpTap={() => setHelpOpen(true)}
        />
      )}

      {/* Tab content — hidden when full chat is open. */}
      {!isFull && (
        <main
          className="gg-tab-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            /* Reserve room for floating TabBar (54 + 10 bottom = 64) +
               floating YuliaAgent mini pill (54 + 8 gap = 62) + top gap (12). */
            paddingBottom: 138,
          }}
        >
          {tab === 'deal' && (
            <DealTab
              deals={deals}
              activeDealId={activeDealId}
              onSelectDeal={onSelectDeal}
              onOpenHelp={() => setHelpOpen(true)}
            />
          )}
          {tab === 'docs' && <DocsTab />}
          {tab === 'pipeline' && (
            <PipelineTab
              deals={deals}
              activeDealId={activeDealId}
              onSelectDeal={(dealId) => {
                onSelectDeal(dealId);
                setTab('deal'); // jump to Deal tab after selection
              }}
            />
          )}
          {tab === 'search' && <SearchTab />}
        </main>
      )}

      {/* Yulia — floats above tab bar in mini or side; covers everything in full. */}
      <YuliaAgent
        state={yuliaState}
        onStateChange={setYuliaState}
        messages={messages}
        streamingText={streamingText}
        sending={sending}
        activeTool={activeTool}
        onSend={onSend}
        chatError={chatError}
        onRetry={onRetry}
      />

      {/* Tab bar — hidden when full chat is open. */}
      {!isFull && <TabBar active={tab} onChange={setTab} pipelineDim={pipelineDim} />}

      {/* Help & glossary bottom sheet — opens from TopBar bell + first-run primer. */}
      <HelpSheet
        open={helpOpen}
        onOpenChange={setHelpOpen}
        onAskYulia={() => setYuliaState('full')}
      />
    </div>
  );
}
