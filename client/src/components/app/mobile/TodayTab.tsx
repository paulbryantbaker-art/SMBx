/**
 * TodayTab — Apple-App-Store "Today" pattern, wired to real backend data.
 *
 * Five sections, each gracefully hides when the backing data isn't
 * available for the current user:
 *
 *   1. Hero card           — always renders (default greeting if no active deal)
 *   2. Feature card        — active deal's ScoreDonut (only if score != null)
 *   3. Top picks list      — deals sorted by recency, secondary to active
 *   4. PINNED artifacts    — user's deliverables feed (horizontal scroll)
 *   5. Stack-ranked list   — deals with scores, ordered desc (only if ≥2)
 *
 * Data comes from two props:
 *   - deals         → from /chat/conversations/grouped (widened in Phase A)
 *   - deliverables  → from /api/deliverables/all (via useDeliverables hook)
 */

import { useMemo } from 'react';
import type { AppDeal, AppDeliverable } from '../types';
import { adaptDeals, type MobileDeal } from './adaptDeals';
import { ScoreDonut, Pill } from './atoms';

interface Props {
  deals: AppDeal[];
  deliverables: AppDeliverable[];
  activeDealId: number | null;
  userName: string | null;
  onSelectDeal: (dealId: number) => void;
  onOpenChat: () => void;
  onOpenHelp: () => void;
}

export default function TodayTab({ deals, deliverables, activeDealId, userName, onSelectDeal, onOpenChat, onOpenHelp }: Props) {
  const adapted = useMemo(() => adaptDeals(deals), [deals]);
  const firstName = (userName || '').trim().split(/\s+/)[0] || 'there';

  /* Empty state — user has no deals yet. */
  if (adapted.length === 0) {
    return <EmptyToday firstName={firstName} onOpenChat={onOpenChat} onOpenHelp={onOpenHelp} />;
  }

  /* Sort deals with active pinned first, rest by updated_at desc. */
  const sorted = useMemo(() => {
    return [...adapted].sort((a, b) => {
      if (a.id === activeDealId) return -1;
      if (b.id === activeDealId) return 1;
      const aT = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bT = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return bT - aT;
    });
  }, [adapted, activeDealId]);

  const leadDeal = sorted[0];
  const pickList = sorted.slice(1, 5);  // next 4 after the hero deal
  const scoredDeals = useMemo(
    () => adapted.filter((d) => typeof d.score === 'number').sort((a, b) => (b.score ?? 0) - (a.score ?? 0)),
    [adapted],
  );
  const featureDeal = scoredDeals[0] ?? null;
  const stackRanked = scoredDeals.slice(0, 3);

  const openChatForDeal = (d: MobileDeal) => () => { onSelectDeal(d.id); onOpenChat(); };

  return (
    <div className="mm-body">
      <div className="mm-today__feed">
        {/* 1. Hero */}
        <HeroCard deal={leadDeal} onOpenChat={openChatForDeal(leadDeal)} />

        {/* 2. Feature ScoreDonut — only when at least one deal is scored */}
        {featureDeal && <FeatureScoreCard deal={featureDeal} onOpenChat={openChatForDeal(featureDeal)} />}

        {/* 3. Top picks */}
        {pickList.length > 0 && (
          <div className="mm-card mm-card--list">
            <div className="mm-card__head">
              <div className="mm-card__kicker">CONTINUE</div>
              <div className="mm-card__t">Pick up where you left off</div>
            </div>
            {pickList.map((d) => (
              <DealRow key={d.id} deal={d} onTap={openChatForDeal(d)} />
            ))}
          </div>
        )}

        {/* 4. PINNED artifacts — horizontal scroll of user's deliverables */}
        {deliverables.length > 0 && (
          <ArtifactsScroll
            deliverables={deliverables}
            deals={adapted}
            onTap={(dealId) => { onSelectDeal(dealId); onOpenChat(); }}
          />
        )}

        {/* 5. Stack-ranked — only when 2+ deals have scores */}
        {stackRanked.length >= 2 && (
          <div className="mm-card mm-card--list">
            <div className="mm-card__head">
              <div className="mm-card__kicker">STACK-RANKED</div>
              <div className="mm-card__t">
                {stackRanked.length === 2 ? 'Your 2 scored deals' : `Your top ${stackRanked.length} deals`}
              </div>
            </div>
            {stackRanked.map((d, i) => (
              <button key={d.id} type="button" className="mm-listrow" onClick={openChatForDeal(d)}>
                <div className="mm-listrow__icon mm-listrow__icon--ink">#{i + 1}</div>
                <div className="mm-listrow__body">
                  <div className="mm-listrow__t">{d.name}</div>
                  <div className="mm-listrow__s">
                    {d.score}/100
                    {d.revenueLabel ? ` · ${d.revenueLabel} rev` : ''}
                    {d.industry ? ` · ${d.industry}` : ''}
                  </div>
                </div>
                <span className="mm-listrow__btn ink">OPEN</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── 1. Hero card ──────────────────────────────────── */
function HeroCard({ deal, onOpenChat }: { deal: MobileDeal; onOpenChat: () => void }) {
  const latestConv = deal.conversations[0];
  const convTitle = latestConv?.title || latestConv?.summary || null;
  const headline = convTitle
    ? `${deal.name} · ${deal.stageLabel}`
    : `${deal.name} is in ${deal.stageLabel}`;
  const sub = convTitle
    ? convTitle
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

/* ─── 2. Feature ScoreDonut card ────────────────────── */
function FeatureScoreCard({ deal, onOpenChat }: { deal: MobileDeal; onOpenChat: () => void }) {
  const score = deal.score ?? 0;
  const status = score >= 70 ? 'Pursue' : score >= 55 ? 'Hold' : 'Pass';
  const statusTone = score >= 70 ? 'ok' : score >= 55 ? 'warn' : 'flag';
  return (
    <button
      type="button"
      className="mm-card mm-card--feat"
      onClick={onOpenChat}
      style={{ border: 0, padding: 0, textAlign: 'left', cursor: 'pointer', width: '100%' }}
      aria-label={`Open rundown for ${deal.name}`}
    >
      <div className="mm-card__art">
        <ScoreDonut score={score} size={160} />
      </div>
      <div className="mm-card__body">
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
          <div className="mm-card__kicker">RUNDOWN</div>
          <Pill tone={statusTone}>{status}</Pill>
        </div>
        <div className="mm-card__t">{deal.name} · {score}/100</div>
        <div className="mm-card__s">
          {deal.industry ? `${deal.industry}` : null}
          {deal.revenueLabel ? `${deal.industry ? ' · ' : ''}${deal.revenueLabel} rev` : null}
          {deal.ebitdaLabel ? ` · ${deal.ebitdaLabel} EBITDA` : null}
        </div>
      </div>
    </button>
  );
}

/* ─── 4. PINNED artifacts horizontal scroll ────────── */
function ArtifactsScroll({
  deliverables,
  deals,
  onTap,
}: {
  deliverables: AppDeliverable[];
  deals: MobileDeal[];
  onTap: (dealId: number) => void;
}) {
  const dealById = useMemo(() => new Map(deals.map((d) => [d.id, d])), [deals]);

  // Top 8 most-recent completed deliverables — hero scroll density.
  const top = useMemo(
    () => deliverables
      .filter((x) => x.status === 'completed' || x.completed_at != null)
      .slice(0, 8),
    [deliverables],
  );
  if (top.length === 0) return null;

  return (
    <div>
      <div className="mm-sec" style={{ padding: '0 20px 8px' }}>
        <div>
          <div className="mm-sec__k">PINNED</div>
          <div className="mm-sec__t">Your artifacts</div>
        </div>
      </div>
      <div className="mm-hscroll">
        {top.map((art) => {
          const deal = dealById.get(art.deal_id);
          return (
            <button
              key={art.id}
              type="button"
              className="mm-hcard"
              style={{ border: 0, padding: 0, textAlign: 'left' }}
              onClick={() => onTap(art.deal_id)}
              aria-label={`Open ${art.name} for ${deal?.name ?? 'deal'}`}
            >
              <div className="mm-hcard__art">
                <ArtifactMetric slug={art.slug} deal={deal ?? null} artifactName={art.name} />
              </div>
              <div className="mm-hcard__body">
                <div className="mm-listrow__t" style={{ fontSize: 13 }}>{art.name}</div>
                <div className="mm-listrow__s" style={{ fontSize: 11 }}>
                  {deal?.name ?? 'Deal'}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* Maps a deliverable slug to a big-numeral visual — the signature Sora
   44px compressed type the mockup uses. We pull the metric from the
   parent deal where possible; for slugs without a numeric proxy, we
   fall back to a short label badge. */
function ArtifactMetric({ slug, deal, artifactName }: { slug: string; deal: MobileDeal | null; artifactName: string }) {
  const big = (text: string) => (
    <div style={{
      fontFamily: "'Sora', system-ui, sans-serif",
      fontWeight: 800,
      fontSize: 44,
      letterSpacing: '-0.03em',
      color: 'var(--text-primary)',
      lineHeight: 1,
    }}>{text}</div>
  );
  const badge = (text: string) => (
    <div style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      fontWeight: 700,
      fontSize: 13,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
    }}>{text}</div>
  );

  if (/rundown|score/i.test(slug) && deal?.score != null) return big(String(deal.score));
  if (/baseline/i.test(slug) && deal?.revenueLabel) return big(deal.revenueLabel);
  if (/cim/i.test(slug)) return big('CIM');
  if (/loi/i.test(slug) && deal?.askingPriceLabel) return big(deal.askingPriceLabel);
  if (/dd|diligence/i.test(slug)) return badge('DD');
  if (/compare/i.test(slug)) return big('3');
  if (/model|dcf|lbo/i.test(slug) && deal?.ebitdaLabel) return big(deal.ebitdaLabel);
  // Fallback — artifact name as a short label
  return badge(artifactName.slice(0, 4).toUpperCase());
}

/* ─── 3/5. Deal row ─────────────────────────────────── */
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

/* ─── Empty state ───────────────────────────────────── */
function EmptyToday({ firstName, onOpenChat, onOpenHelp }: { firstName: string; onOpenChat: () => void; onOpenHelp: () => void }) {
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
            <div className="mm-card__t">Let's start a deal, {firstName}.</div>
            <div className="mm-card__s">Tell Yulia about your business (revenue, industry, your role) and she'll guide you from valuation to CIM.</div>
          </div>
        </button>

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
