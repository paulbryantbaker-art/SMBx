/**
 * AppShellInner — the mobile internal-app shell (post-strip, 2026-04-22).
 *
 * Scope after the mobile UI reset: this is now a near-empty container.
 * All prior tabs (Today / Deals / Inbox), chrome (MobileTopBar, MobileTabBar),
 * detail sheet, and NowYuliaBar were deleted. The next design drop will
 * repopulate this surface. Until then, the landing is a single centered
 * "Chat with Yulia" button that opens the (preserved) ChatFullscreen
 * overlay — the chat + PWA keyboard infrastructure is load-bearing and
 * stays.
 *
 * Load-bearing pieces preserved:
 *   - ChatFullscreen portaled overlay with PWA keyboard handling
 *   - InlineArtifact cards inside chat
 *   - useDeliverables hook (feeds ChatFullscreen's temporal matching)
 *   - yulia-chat-open mount-time safety net (index.css line 439 interaction)
 */

import { useEffect, useMemo, useState } from 'react';
import ChatFullscreen, { type ChatDeal } from './mobile/ChatFullscreen';
import HelpSheet from './sheets/HelpSheet';
import { useDeliverables } from './mobile/useDeliverables';
import type { AppShellInnerProps } from './types';

export default function AppShellInner({
  userName,
  userInitial: _userInitial,
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
  onAccountTap: _onAccountTap,
  onBack: _onBack,
}: AppShellInnerProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  /* SAFETY NET — `html.yulia-chat-open` applies `#root { display: none !important }`
     per index.css:439. If a prior session (React StrictMode remount, any other
     path) ever left the class on <html>, the entire app appears blank because
     the theme-color body bg shows through. Force-clear on mount — cheap no-op
     when the class isn't present. */
  useEffect(() => {
    document.documentElement.classList.remove('yulia-chat-open');
  }, []);

  // ChatDeal for the chat layer. Active deal or first deal as fallback.
  // Money fields (BIGINT cents on AppDeal) are formatted to display
  // strings here — InlineArtifact renders the already-formatted values.
  const chatDeal: ChatDeal | null = useMemo(() => {
    const source = deals.find((d) => d.id === activeDealId) ?? deals[0] ?? null;
    if (!source) return null;
    return {
      id: source.id,
      name: source.business_name || 'Untitled deal',
      stageLabel: stageLabelFor(source.current_gate),
      industry: source.industry ?? null,
      score: typeof source.seven_factor_composite === 'number' ? source.seven_factor_composite : null,
      revenueLabel: formatMoney(source.revenue ?? null),
      sdeLabel: formatMoney(source.sde ?? null),
      ebitdaLabel: formatMoney(source.ebitda ?? null),
      askingPriceLabel: formatMoney(source.asking_price ?? null),
    };
  }, [deals, activeDealId]);

  // Deliverables feed — ChatFullscreen's inline artifact matching uses this.
  const { deliverables } = useDeliverables(deals.length, messages.length);

  const firstName = (userName || '').trim().split(/\s+/)[0] || 'there';

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
      {/* Blank-canvas landing — one button. Next design drop will replace
          this block. Everything else on the page intentionally absent. */}
      {!chatOpen && (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 28px',
            gap: 16,
          }}
        >
          <div
            style={{
              fontFamily: "'Sora', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 28,
              letterSpacing: '-0.025em',
              color: 'var(--text-primary)',
              textAlign: 'center',
              lineHeight: 1.15,
            }}
          >
            Hi {firstName}.
          </div>
          <div
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 15,
              color: 'var(--text-muted)',
              textAlign: 'center',
              lineHeight: 1.45,
              maxWidth: 280,
            }}
          >
            New mobile coming soon. Yulia is still here whenever you want to talk.
          </div>
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            style={{
              marginTop: 8,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '-0.005em',
              color: '#fff',
              background: 'linear-gradient(180deg, #1A1A1E 0%, #000 100%)',
              border: 0,
              padding: '14px 28px',
              borderRadius: 999,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              boxShadow:
                'inset 0 0.5px 0 rgba(255,255,255,0.15), 0 4px 14px rgba(0,0,0,0.22)',
              transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1)',
            }}
            onPointerDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
            onPointerUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            onPointerLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            Chat with Yulia
          </button>
        </div>
      )}

      {/* Chat overlay — preserved verbatim. Portaled to body, PWA-safe. */}
      <ChatFullscreen
        open={chatOpen}
        deal={chatDeal}
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

      {/* Help & Glossary bottom sheet — kept for future callers. */}
      <HelpSheet
        open={helpOpen}
        onOpenChange={setHelpOpen}
        onAskYulia={() => { setHelpOpen(false); setChatOpen(true); }}
      />
    </div>
  );
}

/** Map a gate code → human label. Previously came from adaptDeals.GATE_LABEL;
 *  inlined here so AppShellInner has no dependency on deleted mobile files. */
function stageLabelFor(gate: string | null): string {
  const g = (gate || 'S0').toUpperCase();
  const map: Record<string, string> = {
    S0: 'Getting started', S1: 'Financials', S2: 'Valuation', S3: 'Packaging', S4: 'Matching', S5: 'Closing',
    B0: 'Thesis', B1: 'Sourcing', B2: 'Valuation', B3: 'Due diligence', B4: 'Structuring', B5: 'Closing',
    R0: 'Getting started', R1: 'Package', R2: 'Materials', R3: 'Outreach', R4: 'Terms', R5: 'Closing',
    PMI0: 'Day zero', PMI1: 'Stabilization', PMI2: 'Assessment', PMI3: 'Optimization',
  };
  return map[g] || 'Getting started';
}

/** Format BIGINT cents → compact dollar string. Previously adaptDeals.formatMoney. */
function formatMoney(cents: number | null | undefined): string | null {
  if (cents == null || !Number.isFinite(cents) || cents <= 0) return null;
  const dollars = cents / 100;
  if (dollars >= 1_000_000_000) return `$${(dollars / 1_000_000_000).toFixed(1)}B`;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(0)}K`;
  return `$${Math.round(dollars).toLocaleString()}`;
}
