/**
 * DealsTab — the full portfolio view. Stage filter pills + list of deals.
 *
 * Stage filters are derived from the actual deals' `current_gate` — we only
 * show buckets that have at least one deal in them. "All" is always first.
 *
 * Buckets group related gates into coarser stages:
 *   - Exploring  — S0/S1/B0/B1/R0/R1
 *   - Valuing    — S2/B2/R2/PMI0/PMI1
 *   - Packaging  — S3/B3/R3/PMI2
 *   - Closing    — S4/S5/B4/B5/R4/R5/PMI3
 */

import { useMemo, useState } from 'react';
import type { AppDeal } from '../types';
import { adaptDeals, type MobileDeal } from './adaptDeals';

interface Props {
  deals: AppDeal[];
  onSelectDeal: (dealId: number) => void;
  onOpenChat: () => void;
}

type Bucket = 'all' | 'exploring' | 'valuing' | 'packaging' | 'closing';

const BUCKETS: Array<{ id: Bucket; label: string; gates: RegExp }> = [
  { id: 'exploring', label: 'Exploring', gates: /^(S0|S1|B0|B1|R0|R1)$/ },
  { id: 'valuing',   label: 'Valuing',   gates: /^(S2|B2|R2|PMI0|PMI1)$/ },
  { id: 'packaging', label: 'Packaging', gates: /^(S3|B3|R3|PMI2)$/ },
  { id: 'closing',   label: 'Closing',   gates: /^(S4|S5|B4|B5|R4|R5|PMI3)$/ },
];

export default function DealsTab({ deals, onSelectDeal, onOpenChat }: Props) {
  const adapted = useMemo(() => adaptDeals(deals), [deals]);
  const [bucket, setBucket] = useState<Bucket>('all');

  // Which buckets have at least one deal?
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

  if (adapted.length === 0) {
    return (
      <div className="mm-body">
        <div className="mm-empty">
          <div className="mm-empty__t">No deals yet</div>
          <div className="mm-empty__s">
            Talk to Yulia about your business and she'll create your first deal.
          </div>
          <button type="button" className="mm-empty__cta" onClick={onOpenChat}>
            Start a deal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mm-body">
      <div className="mm-stages">
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

      <div style={{ padding: '0 16px 20px' }}>
        <div className="mm-card mm-card--list">
          {filtered.map((d) => (
            <DealRow
              key={d.id}
              deal={d}
              onTap={() => { onSelectDeal(d.id); onOpenChat(); }}
            />
          ))}
        </div>
      </div>
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
