/**
 * InboxTab — a derived feed of "things that need your attention".
 *
 * Since we don't yet have a real notification table, v1 synthesizes items
 * from the deal list:
 *   - flag  — deals with status === 'flagged' / 'flag'
 *   - warn  — deals at progress gates (S2/S3/B2/B3/R2/R3/PMI1/PMI2)
 *   - ok    — deals at closing-adjacent gates (S4/S5/B4/B5/R4/R5/PMI3)
 *   - muted — deals at early gates (S0/S1/B0/B1/R0/R1) — background
 *
 * Tap any row → onSelectDeal + onOpenChat.
 *
 * When we add a real notifications feed, this adapter is the boundary to swap.
 */

import { useMemo } from 'react';
import type { AppDeal } from '../types';
import { adaptDeals, formatAgo, type MobileDeal } from './adaptDeals';

interface Props {
  deals: AppDeal[];
  onSelectDeal: (dealId: number) => void;
  onOpenChat: () => void;
}

type InboxItem = {
  deal: MobileDeal;
  dot: 'flag' | 'warn' | 'ok' | 'muted';
  title: string;
  sub: string;
  kicker: string;
};

function inboxItemsFromDeals(deals: MobileDeal[]): InboxItem[] {
  // Sort by most recent update first — we want fresh state on top.
  const byRecent = [...deals].sort((a, b) => {
    const aT = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bT = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return bT - aT;
  });

  return byRecent.map((d) => {
    const latestConv = d.conversations[0];
    const convTitle = latestConv?.title || latestConv?.summary || null;

    let dot: InboxItem['dot'] = 'muted';
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

    return { deal: d, dot, title, sub, kicker: formatAgo(d.updatedAt) };
  });
}

export default function InboxTab({ deals, onSelectDeal, onOpenChat }: Props) {
  const items = useMemo(() => inboxItemsFromDeals(adaptDeals(deals)), [deals]);

  if (items.length === 0) {
    return (
      <div className="mm-body">
        <div className="mm-empty">
          <div className="mm-empty__t">You're all caught up</div>
          <div className="mm-empty__s">
            Updates and flagged items will land here once you have deals in flight.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mm-body">
      <div className="mm-inbox__list">
        {items.map((it) => (
          <button
            key={it.deal.id}
            type="button"
            className="mm-inbox__item"
            onClick={() => { onSelectDeal(it.deal.id); onOpenChat(); }}
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
  );
}
