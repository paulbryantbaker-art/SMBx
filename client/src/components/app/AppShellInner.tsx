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

import { useMemo, useState } from 'react';
import TopBar from './chrome/TopBar';
import TabBar from './chrome/TabBar';
import YuliaAgent from './chrome/YuliaAgent';
import DealTab from './tabs/DealTab';
import DocsTab from './tabs/DocsTab';
import PipelineTab from './tabs/PipelineTab';
import SearchTab from './tabs/SearchTab';
import type { AppTab, YuliaState, AppShellInnerProps, AppDeal } from './types';

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
  onSelectDeal: _onSelectDeal,
  onOpenDeliverable: _onOpenDeliverable,
  onAccountTap,
  onBack: _onBack,
}: AppShellInnerProps) {
  const [tab, setTab] = useState<AppTab>('deal');
  const [yuliaState, setYuliaState] = useState<YuliaState>('mini');

  const activeDeal: AppDeal | null = useMemo(() => {
    if (!activeDealId) return null;
    return deals.find((d) => d.id === activeDealId) || null;
  }, [deals, activeDealId]);

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
        /* #app-root already applies paddingTop: env(safe-area-inset-top),
           so we subtract it here or the tab bar (position:absolute bottom:0)
           gets pushed below the visible viewport by the status-bar height. */
        height: 'calc(var(--vvh, 100dvh) - env(safe-area-inset-top, 0px))',
        overflow: 'hidden',
        background: 'var(--bg-app)',
        color: 'var(--text-primary)',
        fontFamily: "'Inter', system-ui, sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar — hidden when full chat is open (chat has its own header). */}
      {!isFull && <TopBar userInitial={userInitial} onAccountTap={onAccountTap} />}

      {/* Tab content — hidden when full chat is open. */}
      {!isFull && (
        <main
          className="gg-tab-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            /* Reserve room for TabBar (74) + YuliaAgent mini (50) + gap (24). */
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 148px)',
          }}
        >
          {tab === 'deal' && <DealTab deal={activeDeal} />}
          {tab === 'docs' && <DocsTab />}
          {tab === 'pipeline' && <PipelineTab />}
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
    </div>
  );
}
