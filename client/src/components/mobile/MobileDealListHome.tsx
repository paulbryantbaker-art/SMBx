/**
 * MobileDealListHome — the home surface inside the mobile PWA.
 *
 * Supersedes MobileNotionHome. Implements the locked architecture from
 * memory/architecture_mobile_ux.md:
 *   - Empty state: warm Sora greeting + intro + starter chips
 *   - Populated state: Active / Exploring / Archived sections with deal cards
 *   - Sections hide when empty
 *   - Top bar: minimal Glass chrome with bell + account avatar on the right
 *   - No workspace pill, no Notion tree, no ⋯ menu
 *
 * See memory/feedback_mobile_design_rules.md for design patterns
 * (Linear + Superhuman + Notion distilled + Apple Glass).
 */

import { useMemo } from 'react';
import type { AnonMessage } from '../../hooks/useAnonymousChat';
import ChatMessages from '../shell/ChatMessages';
import { StarterChips } from './StarterChips';
import { DealCard } from './DealCard';

interface ConvoItem {
  id: number;
  title: string;
  summary?: string;
  gate_label?: string;
  active?: boolean;
}

interface DealItem {
  id: number;
  business_name: string | null;
  journey_type: string | null;
  current_gate: string | null;
  industry: string | null;
  league?: string | null;
  updated_at: string | null;
  status?: string | null;
  conversations: ConvoItem[];
}

export interface RecentDoc {
  doc_type: string;
  doc_id: string;
  label: string | null;
  deal_id: number | null;
  opened_at: string;
}

interface Props {
  dark: boolean;
  loading: boolean;
  userName?: string | null;
  deals: DealItem[];
  activeConversationId: number | null;
  justCreatedDealId?: number | null;
  recentDocs?: RecentDoc[];

  // Chat integration — unified mobile surface. When messages are present,
  // ChatMessages renders inline in place of the greeting / deal list.
  messages?: AnonMessage[];
  streamingText?: string;
  sending?: boolean;
  activeTool?: string | null;
  chatError?: string | null;
  onRetry?: () => void;
  onOpenDeliverable?: (message: AnonMessage) => void;

  onDealTap: (dealId: number) => void;
  onDealLongPress?: (dealId: number) => void;
  onConversationTap: (convId: number) => void;
  onRecentDocTap?: (doc: RecentDoc) => void;
  onSeeAll: () => void;
  onStartFirstDeal: (fill: string) => void;
  onAccountTap: () => void;
  onMenuTap?: () => void;
  onLearnTap?: () => void;
  onBellTap?: () => void;
  notificationCount?: number;
}

type Bucket = 'active' | 'exploring' | 'archived';

function bucketOf(deal: { current_gate: string | null; status?: string | null }): Bucket {
  const status = (deal.status || '').toLowerCase();
  if (status === 'archived' || status === 'closed' || status === 'dropped') return 'archived';
  const g = deal.current_gate || '';
  if (/^(S0|B0|R0|PMI0)$/.test(g) || !g) return 'exploring';
  return 'active';
}

const SECTION_META: Record<Bucket, { label: string }> = {
  active: { label: 'Active' },
  exploring: { label: 'Exploring' },
  archived: { label: 'Archived' },
};

export default function MobileDealListHome({
  dark,
  loading: _loading,
  userName,
  deals,
  activeConversationId: _activeConversationId,
  messages = [],
  streamingText = '',
  sending = false,
  activeTool,
  chatError,
  onRetry,
  onOpenDeliverable,
  onDealTap,
  onConversationTap: _onConversationTap,
  onSeeAll: _onSeeAll,
  onStartFirstDeal,
  onAccountTap,
  onLearnTap,
  onBellTap,
  notificationCount = 0,
  justCreatedDealId: _justCreated,
  recentDocs: _recentDocs = [],
  onRecentDocTap: _onRecentDocTap,
  onMenuTap: _onMenuTap,
  onDealLongPress: _onDealLongPress,
}: Props) {
  // When the user has messages in flight (or streaming), swap the greeting /
  // deal list for the actual conversation. Keeps the mobile flow on one
  // surface — no navigation to a separate chat view.
  const hasActiveChat = messages.length > 0 || !!streamingText;
  const realDeals = useMemo(
    () => deals.filter(d => d.business_name != null && d.business_name.trim().length > 0),
    [deals],
  );

  const { buckets, visible } = useMemo(() => {
    const b: Record<Bucket, DealItem[]> = { active: [], exploring: [], archived: [] };
    for (const d of realDeals) b[bucketOf(d)].push(d);
    for (const k of Object.keys(b) as Bucket[]) {
      b[k].sort((a, b2) => {
        const ta = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const tb = b2.updated_at ? new Date(b2.updated_at).getTime() : 0;
        return tb - ta;
      });
    }
    const order: Bucket[] = ['active', 'exploring', 'archived'];
    return { buckets: b, visible: order.filter(k => b[k].length > 0) };
  }, [realDeals]);

  const isEmpty = realDeals.length === 0;

  const pageBg = dark ? '#0f1012' : '#F9F9FC';
  const heading = dark ? '#F9F9FC' : '#0f1012';
  const body = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const muted = dark ? 'rgba(218,218,220,0.55)' : '#6e6a63';
  const sectionLabel = dark ? 'rgba(218,218,220,0.45)' : '#9ea0a5';
  const border = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.06)';
  // Home top bar: solid, matches page background exactly. Glass here created a
  // shade mismatch against the solid #F9F9FC content below because blur over
  // the body rendered as a different effective color.
  const headerBg = pageBg;
  const accent = dark ? '#E8709A' : '#D44A78';

  const firstInitial = (userName || 'Y').trim().charAt(0).toUpperCase();
  const firstName = userName ? userName.split(' ')[0] : null;

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        background: pageBg,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Top bar — solid, matches page bg exactly. Right-aligned icons (bell + account).
          No border-bottom — content and header share the same color so any
          separator line reads as visual noise. Sticky position keeps icons
          pinned as the user scrolls. */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 5,
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)',
          paddingLeft: 12,
          paddingRight: 12,
          paddingBottom: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 6,
          background: headerBg,
        }}
      >
        {onBellTap && (
          <button
            onClick={onBellTap}
            type="button"
            aria-label={notificationCount > 0 ? `${notificationCount} notifications` : 'Notifications'}
            className="active:scale-90"
            style={{
              position: 'relative',
              width: 40, height: 40, flexShrink: 0,
              borderRadius: 10,
              border: 'none',
              background: 'transparent',
              color: body,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            {notificationCount > 0 && (
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  minWidth: 16,
                  height: 16,
                  padding: '0 4px',
                  borderRadius: 9999,
                  background: accent,
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                  border: `2px solid ${pageBg}`,
                  boxSizing: 'content-box',
                }}
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
        )}
        <button
          onClick={onAccountTap}
          type="button"
          aria-label="Account"
          className="active:scale-[0.96]"
          style={{
            width: 36, height: 36, flexShrink: 0,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${accent}, ${dark ? '#AE6D9A' : '#E8709A'})`,
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Sora', system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 800,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {firstInitial}
        </button>
      </div>

      {/* Scrollable body */}
      <div
        className="mobile-deal-list-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          // Reserve room for the fixed chat pill at bottom.
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 120px)',
        }}
      >
        {hasActiveChat ? (
          <ChatMessages
            messages={messages}
            streamingText={streamingText}
            sending={sending}
            activeTool={activeTool}
            error={chatError}
            onRetry={onRetry}
            onOpenDeliverable={onOpenDeliverable}
            desktop={false}
            dark={dark}
            userName={userName}
            hideEmptyState={true}
          />
        ) : isEmpty ? (
          <div style={{ padding: '56px 0 24px' }}>
            <div style={{ padding: '0 20px', marginBottom: 32 }}>
              <h1
                style={{
                  fontFamily: "'Sora', system-ui, sans-serif",
                  fontSize: 40,
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.02,
                  color: heading,
                  margin: '0 0 10px',
                }}
              >
                {firstName ? `Hi, ${firstName}.` : 'Hi there.'}
              </h1>
              <p
                style={{
                  fontFamily: "'Sora', system-ui, sans-serif",
                  fontSize: 26,
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  color: body,
                  margin: '0 0 20px',
                }}
              >
                What are you working on?
              </p>
              <p
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 15,
                  fontWeight: 400,
                  lineHeight: 1.5,
                  color: muted,
                  margin: 0,
                  maxWidth: 340,
                }}
              >
                Whether you're buying, selling, raising capital, or integrating a business — tell Yulia and we'll start.
              </p>
            </div>

            <p
              style={{
                margin: '0 16px 10px',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: sectionLabel,
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              Jump in
            </p>

            <StarterChips
              dark={dark}
              onChipTap={(fill) => onStartFirstDeal(fill)}
              onLearnTap={onLearnTap || (() => {})}
            />
          </div>
        ) : (
          <>
            {/* Page title for populated state */}
            <div style={{ padding: '20px 16px 4px' }}>
              <h1
                style={{
                  fontFamily: "'Sora', system-ui, sans-serif",
                  fontSize: 32,
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.05,
                  color: heading,
                  margin: 0,
                }}
              >
                {firstName ? `${firstName}'s deals` : 'Your deals'}
              </h1>
            </div>

            {visible.map((bucket) => {
              const items = buckets[bucket];
              const meta = SECTION_META[bucket];
              return (
                <section key={bucket} style={{ padding: '20px 16px 8px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      marginBottom: 12,
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        fontFamily: "'Sora', system-ui, sans-serif",
                        fontSize: 20,
                        fontWeight: 700,
                        letterSpacing: '-0.015em',
                        color: heading,
                      }}
                    >
                      {meta.label}
                    </h2>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: muted,
                        fontFamily: "'Inter', system-ui, sans-serif",
                      }}
                    >
                      {items.length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {items.map((deal) => (
                      <DealCard
                        key={deal.id}
                        deal={{
                          id: deal.id,
                          business_name: deal.business_name,
                          journey_type: deal.journey_type,
                          current_gate: deal.current_gate,
                          industry: deal.industry,
                          league: deal.league || null,
                          updated_at: deal.updated_at || '',
                          status: deal.status || '',
                        }}
                        onTap={() => onDealTap(deal.id)}
                        dark={dark}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </>
        )}
      </div>

      <style>{`
        .mobile-deal-list-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
