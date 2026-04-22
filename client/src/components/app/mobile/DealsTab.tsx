/**
 * DealsTab — the full portfolio view.
 *
 * Layout: stage filter pills (horizontal scroll) + List⇄Grid segmented
 * toggle (top-right of stages row) + filtered collection below.
 *
 * List mode: Apple-App-Store row with icon + name + kicker + stage badge.
 * Grid mode: 2-col tiled cards with tinted gradient art, initials in the
 * art area, optional score badge top-right. Matches the mockup's
 * browseMode. Tone drives the gradient color (ok/warn/flag).
 *
 * Empty state: gradient hero card (same art as Today's hero) pointing the
 * user into a new conversation with Yulia. No "no items" textcard.
 */

import { useMemo, useState } from 'react';
import type { AppDeal } from '../types';
import { adaptDeals, type MobileDeal } from './adaptDeals';

interface Props {
  deals: AppDeal[];
  onSelectDeal: (dealId: number) => void;
  onOpenChat: () => void;
  /** Optional — if provided, tapping a deal tile/row opens the detail
   *  sheet instead of jumping straight into chat (App Store pattern). */
  onOpenDetail?: (dealId: number) => void;
}

type Bucket = 'all' | 'exploring' | 'valuing' | 'packaging' | 'closing';
type ViewMode = 'list' | 'grid';

const BUCKETS: Array<{ id: Bucket; label: string; gates: RegExp }> = [
  { id: 'exploring', label: 'Exploring', gates: /^(S0|S1|B0|B1|R0|R1)$/ },
  { id: 'valuing',   label: 'Valuing',   gates: /^(S2|B2|R2|PMI0|PMI1)$/ },
  { id: 'packaging', label: 'Packaging', gates: /^(S3|B3|R3|PMI2)$/ },
  { id: 'closing',   label: 'Closing',   gates: /^(S4|S5|B4|B5|R4|R5|PMI3)$/ },
];

export default function DealsTab({ deals, onSelectDeal, onOpenChat, onOpenDetail }: Props) {
  const adapted = useMemo(() => adaptDeals(deals), [deals]);
  const [bucket, setBucket] = useState<Bucket>('all');
  const [view, setView] = useState<ViewMode>('list');

  const availableBuckets = useMemo(
    () => BUCKETS.filter((b) => adapted.some((d) => b.gates.test(d.stage))),
    [adapted],
  );

  const filtered = useMemo(() => {
    if (bucket === 'all') return adapted;
    const b = BUCKETS.find((x) => x.id === bucket);
    if (!b) return adapted;
    return adapted.filter((d) => b.gates.test(d.stage));
  }, [adapted, bucket]);

  /* Empty state — gradient hero, same pattern as Today's empty. */
  if (adapted.length === 0) {
    return (
      <div className="mm-body">
        <div className="mm-today__feed">
          <button
            type="button"
            className="mm-card mm-card--hero"
            onClick={onOpenChat}
            style={{ border: 0, padding: 0, textAlign: 'left', cursor: 'pointer', width: '100%' }}
          >
            <div className="mm-card__art" aria-hidden />
            <div className="mm-card__body">
              <div className="mm-card__kicker">YULIA · READY</div>
              <div className="mm-card__t">Your deals live here.</div>
              <div className="mm-card__s">Tell Yulia about a business you want to buy, sell, or raise for and she'll open your first deal.</div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Tile/row tap — Apple App Store behavior: open detail page, not chat.
  // Fallback to old behavior (go straight to chat) when no onOpenDetail.
  const openDeal = (dealId: number) => {
    if (onOpenDetail) {
      onOpenDetail(dealId);
    } else {
      onSelectDeal(dealId);
      onOpenChat();
    }
  };

  return (
    <div className="mm-body">
      {/* Stage pills + view toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 16px 0' }}>
        <div className="mm-stages" style={{ padding: 0, flex: 1 }}>
          <button
            type="button"
            className={'mm-stage' + (bucket === 'all' ? ' active' : '')}
            onClick={() => setBucket('all')}
          >
            All · {adapted.length}
          </button>
          {availableBuckets.map((b) => (
            <button
              key={b.id}
              type="button"
              className={'mm-stage' + (bucket === b.id ? ' active' : '')}
              onClick={() => setBucket(b.id)}
            >
              {b.label}
            </button>
          ))}
        </div>
        <div className="mm-toggle" style={{ flexShrink: 0 }}>
          <button
            type="button"
            className={'mm-toggle__btn' + (view === 'list' ? ' active' : '')}
            onClick={() => setView('list')}
            aria-label="List view"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <button
            type="button"
            className={'mm-toggle__btn' + (view === 'grid' ? ' active' : '')}
            onClick={() => setView('grid')}
            aria-label="Grid view"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </button>
        </div>
      </div>
      <div style={{ height: 12 }} />

      {/* Collection */}
      {view === 'list' ? (
        <div style={{ padding: '0 16px 20px' }}>
          <div className="mm-card mm-card--list">
            {filtered.map((d) => (
              <DealRow key={d.id} deal={d} onTap={() => openDeal(d.id)} />
            ))}
          </div>
        </div>
      ) : (
        <div className="mm-grid">
          {filtered.map((d) => (
            <DealGridTile key={d.id} deal={d} onTap={() => openDeal(d.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function DealRow({ deal, onTap }: { deal: MobileDeal; onTap: () => void }) {
  const toneClass =
    deal.tone === 'ok' ? 'mm-listrow__icon--ok'
    : deal.tone === 'warn' ? 'mm-listrow__icon--warn'
    : deal.tone === 'flag' ? 'mm-listrow__icon--flag'
    : '';
  return (
    <button type="button" className="mm-listrow" onClick={onTap}>
      <div className={`mm-listrow__icon ${toneClass}`}>{deal.initials}</div>
      <div className="mm-listrow__body">
        <div className="mm-listrow__t">{deal.name}</div>
        <div className="mm-listrow__s">{deal.kicker}</div>
      </div>
      <span className="mm-listrow__btn">{deal.stage}</span>
    </button>
  );
}

function DealGridTile({ deal, onTap }: { deal: MobileDeal; onTap: () => void }) {
  const artClass =
    deal.tone === 'ok' ? 'mm-gcard__art--ok'
    : deal.tone === 'warn' ? 'mm-gcard__art--warn'
    : deal.tone === 'flag' ? 'mm-gcard__art--flag'
    : '';
  return (
    <button type="button" className="mm-gcard" onClick={onTap}>
      <div className={`mm-gcard__art ${artClass}`}>
        <div className="mm-gcard__initials">{deal.initials}</div>
        {deal.score != null && <div className="mm-gcard__score">{deal.score}</div>}
      </div>
      <div className="mm-gcard__body">
        <div className="mm-gcard__t">{deal.name}</div>
        <div className="mm-gcard__s">
          {[deal.industry, deal.revenueLabel].filter(Boolean).join(' · ') || deal.stageLabel}
        </div>
      </div>
    </button>
  );
}
