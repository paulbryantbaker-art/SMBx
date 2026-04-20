/**
 * TodayTab — Apple-App-Store "Today" pattern wired to real deals.
 *
 * Sections (rendered only when there's data):
 *   - Hero card                 — always (prompts first deal if deals.length===0)
 *   - "Continue your work"      — top 3 by updated_at, list card
 *   - "All your deals"          — remaining deals list
 *
 * We intentionally SKIP mock-only sections from the Claude Design v4 reference
 * (PINNED artifacts scroll, ScoreDonut "rundown ready" feature card,
 * stack-ranked by-score list) until we have real artifact and scoring data.
 * Better to ship a clean Today that works with real data than a fake one.
 */

import { useMemo } from 'react';
import type { AppDeal } from '../types';
import { adaptDeals, type MobileDeal } from './adaptDeals';

interface Props {
  deals: AppDeal[];
  activeDealId: number | null;
  userName: string | null;
  onSelectDeal: (dealId: number) => void;
  onOpenChat: () => void;
  onOpenHelp: () => void;
}

export default function TodayTab({ deals, activeDealId, userName, onSelectDeal, onOpenChat, onOpenHelp }: Props) {
  const adapted = useMemo(() => adaptDeals(deals), [deals]);
  const firstName = (userName || '').trim().split(/\s+/)[0] || 'there';

  if (adapted.length === 0) {
    return <EmptyToday firstName={firstName} onOpenChat={onOpenChat} onOpenHelp={onOpenHelp} />;
  }

  // Sort by updated_at desc. Active deal pinned first.
  const sorted = [...adapted].sort((a, b) => {
    if (a.id === activeDealId) return -1;
    if (b.id === activeDealId) return 1;
    const aT = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bT = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return bT - aT;
  });

  const [lead, ...rest] = sorted;
  const continueList = rest.slice(0, 3);
  const restList = rest.slice(3);

  return (
    <div className="mm-body">
      <div className="mm-today__feed">
        <HeroCard deal={lead} onOpenChat={() => { onSelectDeal(lead.id); onOpenChat(); }} />

        {continueList.length > 0 && (
          <div className="mm-card mm-card--list">
            <div className="mm-card__head">
              <div className="mm-card__kicker">CONTINUE</div>
              <div className="mm-card__t">Pick up where you left off</div>
            </div>
            {continueList.map((d) => (
              <DealRow
                key={d.id}
                deal={d}
                onTap={() => { onSelectDeal(d.id); onOpenChat(); }}
              />
            ))}
          </div>
        )}

        {restList.length > 0 && (
          <div className="mm-card mm-card--list">
            <div className="mm-card__head">
              <div className="mm-card__kicker">YOUR DEALS</div>
              <div className="mm-card__t">All {adapted.length} deals</div>
            </div>
            {restList.map((d) => (
              <DealRow
                key={d.id}
                deal={d}
                onTap={() => { onSelectDeal(d.id); onOpenChat(); }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Hero card ─────────────────────────────────────────── */
function HeroCard({ deal, onOpenChat }: { deal: MobileDeal; onOpenChat: () => void }) {
  const lastConvTitle = deal.conversations[0]?.title || deal.conversations[0]?.summary || null;
  const headline = lastConvTitle
    ? `${deal.name} · ${deal.stageLabel}`
    : `${deal.name} is in ${deal.stageLabel}`;
  const sub = lastConvTitle
    ? lastConvTitle
    : `Open the conversation — Yulia is ready to pick up where you left off.`;

  return (
    <button
      type="button"
      className="mm-card mm-card--hero"
      onClick={onOpenChat}
      style={{ border: 0, padding: 0, textAlign: 'left', cursor: 'pointer', width: '100%' }}
      aria-label={`Open conversation for ${deal.name}`}
    >
      <div className="mm-card__art" aria-hidden />
      <div className="mm-card__body">
        <div className="mm-card__kicker">YULIA · LIVE</div>
        <div className="mm-card__t">{headline}</div>
        <div className="mm-card__s">{sub}</div>
      </div>
    </button>
  );
}

/* ─── Deal row ──────────────────────────────────────────── */
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

/* ─── Empty state ───────────────────────────────────────── */
function EmptyToday({ firstName, onOpenChat, onOpenHelp }: { firstName: string; onOpenChat: () => void; onOpenHelp: () => void }) {
  return (
    <div className="mm-body">
      <div className="mm-today__feed">
        <div
          className="mm-card mm-card--hero"
          onClick={onOpenChat}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenChat(); }}
          style={{ cursor: 'pointer' }}
        >
          <div className="mm-card__art" aria-hidden />
          <div className="mm-card__body">
            <div className="mm-card__kicker">YULIA · READY</div>
            <div className="mm-card__t">Let's start a deal, {firstName}.</div>
            <div className="mm-card__s">Tell Yulia about your business (revenue, industry, your role) and she'll guide you from valuation to CIM.</div>
          </div>
        </div>

        <div className="mm-card mm-card--list">
          <div className="mm-card__head">
            <div className="mm-card__kicker">HOW THIS WORKS</div>
            <div className="mm-card__t">Three steps to a CIM</div>
          </div>
          <HowStep n={1} t="Tell Yulia about your business" s="Revenue, industry, your role — the basics." />
          <HowStep n={2} t="Yulia values it and produces a baseline report" s="Add-backs, SDE, multiples — all in plain English." />
          <HowStep n={3} t="Review, refine, and generate your CIM" s="The document buyers read first. 10–15 pages." />
          <div style={{ padding: '12px 18px 16px', borderTop: '0.5px solid var(--border)' }}>
            <button
              type="button"
              onClick={onOpenHelp}
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-muted)',
                background: 'transparent',
                border: 0,
                padding: 0,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              Learn the vocabulary →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HowStep({ n, t, s }: { n: number; t: string; s: string }) {
  return (
    <div className="mm-listrow" style={{ cursor: 'default' }}>
      <div className="mm-listrow__icon mm-listrow__icon--ink">{n}</div>
      <div className="mm-listrow__body">
        <div className="mm-listrow__t" style={{ whiteSpace: 'normal' }}>{t}</div>
        <div className="mm-listrow__s" style={{ whiteSpace: 'normal' }}>{s}</div>
      </div>
      <span />
    </div>
  );
}
