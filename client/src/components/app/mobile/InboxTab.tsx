/**
 * InboxTab — a derived feed of "things that need your attention".
 *
 * Layout:
 *   - Hero highlight card (the single most urgent item — flag > warn > ok)
 *     rendered in the gradient-art hero style. Tap opens the chat.
 *   - List card below with the remaining items, dotted by urgency.
 *
 * Empty state: gradient hero card, not a plain "no items" message.
 *
 * v1 synthesizes items directly from the deal list — when a real
 * notifications table lands, only this adapter swaps.
 */

import { useMemo } from 'react';
import type { AppDeal } from '../types';
import { adaptDeals, formatAgo, type MobileDeal } from './adaptDeals';

interface Props {
  deals: AppDeal[];
  onSelectDeal: (dealId: number) => void;
  onOpenChat: () => void;
}

type Dot = 'flag' | 'warn' | 'ok' | 'muted';

interface InboxItem {
  deal: MobileDeal;
  dot: Dot;
  title: string;
  sub: string;
  kicker: string;
  /** Sort weight — lower = more urgent, renders earlier. */
  urgencyRank: number;
}

function dotRank(dot: Dot): number {
  return dot === 'flag' ? 0 : dot === 'warn' ? 1 : dot === 'ok' ? 2 : 3;
}

function inboxItemsFromDeals(deals: MobileDeal[]): InboxItem[] {
  const byRecent = [...deals].sort((a, b) => {
    const aT = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bT = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return bT - aT;
  });

  const items: InboxItem[] = byRecent.map((d) => {
    const latestConv = d.conversations[0];
    const convTitle = latestConv?.title || latestConv?.summary || null;

    let dot: Dot = 'muted';
    let title = `${d.name} · ${d.stageLabel}`;
    let sub = convTitle || `Currently in ${d.stageLabel.toLowerCase()}. Open the conversation to continue.`;

    if (d.tone === 'flag') {
      dot = 'flag';
      title = `${d.name} needs attention`;
      sub = convTitle || `Flagged — Yulia has a recommendation for you.`;
    } else if (d.urgency === 'progress') {
      dot = 'warn';
      title = `${d.name} · ${d.stageLabel}`;
      sub = convTitle || `Active work in ${d.stageLabel.toLowerCase()}.`;
    } else if (d.urgency === 'ready') {
      dot = 'ok';
      title = `${d.name} · ${d.stageLabel}`;
      sub = convTitle || `Closing-phase work — tap to review.`;
    }

    return { deal: d, dot, title, sub, kicker: formatAgo(d.updatedAt), urgencyRank: dotRank(dot) };
  });

  // Sort by urgency first, then by recency (already applied above as secondary).
  return items.sort((a, b) => a.urgencyRank - b.urgencyRank);
}

export default function InboxTab({ deals, onSelectDeal, onOpenChat }: Props) {
  const items = useMemo(() => inboxItemsFromDeals(adaptDeals(deals)), [deals]);

  if (items.length === 0) {
    return (
      <div className="mm-body">
        <div className="mm-today__feed">
          <div className="mm-card mm-card--hero" aria-label="Inbox empty">
            <div className="mm-card__art" aria-hidden />
            <div className="mm-card__body">
              <div className="mm-card__kicker">ALL CAUGHT UP</div>
              <div className="mm-card__t">Nothing needs you right now.</div>
              <div className="mm-card__s">Updates and flagged items will land here as soon as you have deals in flight.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [highlight, ...rest] = items;
  const highlightGetsHero = highlight.dot === 'flag' || highlight.dot === 'warn';

  const openChatForItem = (it: InboxItem) => () => {
    onSelectDeal(it.deal.id);
    onOpenChat();
  };

  return (
    <div className="mm-body">
      <div className="mm-today__feed">
        {highlightGetsHero ? (
          <HighlightHero item={highlight} onOpenChat={openChatForItem(highlight)} />
        ) : null}

        {/* Remaining items — or the full list if no highlight was promoted. */}
        <div className="mm-inbox__list">
          {(highlightGetsHero ? rest : items).map((it) => (
            <button
              key={it.deal.id}
              type="button"
              className="mm-inbox__item"
              onClick={openChatForItem(it)}
            >
              <div className={'mm-inbox__dot ' + it.dot} />
              <div style={{ minWidth: 0 }}>
                <div className="mm-inbox__t">{it.title}</div>
                <div className="mm-inbox__s">{it.sub}</div>
              </div>
              <div className="mm-inbox__k">{it.kicker}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Highlight hero (topmost urgent item) ─────────────── */
function HighlightHero({ item, onOpenChat }: { item: InboxItem; onOpenChat: () => void }) {
  const kicker = item.dot === 'flag' ? 'FLAGGED · REVIEW' : item.dot === 'warn' ? 'ACTIVE · NEEDS YOU' : 'READY · REVIEW';
  return (
    <button
      type="button"
      className="mm-card mm-card--hero"
      onClick={onOpenChat}
      style={{ border: 0, padding: 0, textAlign: 'left', cursor: 'pointer', width: '100%' }}
      aria-label={item.title}
    >
      <div className="mm-card__art" aria-hidden />
      <div className="mm-card__body">
        <div className="mm-card__kicker">{kicker}</div>
        <div className="mm-card__t">{item.title}</div>
        <div className="mm-card__s">{item.sub}</div>
      </div>
    </button>
  );
}
