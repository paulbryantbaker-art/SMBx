/**
 * TodayTab — Apple-App-Store "Today" pattern, four distinct rail types.
 *
 * The whole point of Today is editorial variety — App Store never runs
 * two consecutive sections in the same shape. Four rails, four patterns:
 *
 *   1. Daily Briefing hero     — full-bleed gradient, kicker + Sora headline
 *   2. Continue (numbered)     — Apple "Now Trending" numbered list 1-5
 *   3. Pinned Artifacts rail   — horizontal scroll of asymmetric tiles
 *   4. Your Deals              — compact list with score + urgency
 *
 * "Dummy data where real data missing" is explicit per user — each rail
 * renders a sensible synthesised version when backing data is thin, so
 * the surface feels inhabited even for fresh-account demos. Real data
 * supersedes dummies whenever present.
 *
 * Tap semantics: every deal tap (hero, numbered, compact) opens the
 * DealDetailSheet. Artifact taps open chat directly (artifacts are
 * live content — the user knows what they want).
 */

import { useMemo } from 'react';
import type { AppDeal, AppDeliverable } from '../types';
import { adaptDeals, type MobileDeal } from './adaptDeals';

interface Props {
  deals: AppDeal[];
  deliverables: AppDeliverable[];
  activeDealId: number | null;
  userName: string | null;
  onSelectDeal: (dealId: number) => void;
  onOpenChat: () => void;
  onOpenHelp: () => void;
  /** Optional — when provided, deal taps open the detail sheet instead
   *  of jumping to chat. Parent owns detail state. */
  onOpenDetail?: (dealId: number) => void;
}

export default function TodayTab({
  deals,
  deliverables,
  activeDealId,
  userName,
  onSelectDeal,
  onOpenChat,
  onOpenHelp,
  onOpenDetail,
}: Props) {
  // ALL hooks before any early return — rules of hooks.
  const adapted = useMemo(() => adaptDeals(deals), [deals]);

  const sorted = useMemo(() => {
    return [...adapted].sort((a, b) => {
      if (a.id === activeDealId) return -1;
      if (b.id === activeDealId) return 1;
      const aT = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bT = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return bT - aT;
    });
  }, [adapted, activeDealId]);

  const firstName = (userName || '').trim().split(/\s+/)[0] || 'there';

  // Tap handler: open detail if caller supports it, otherwise fall back
  // to straight-to-chat (preserves behavior for AppShell paths that don't
  // have the detail sheet wired).
  const openDeal = (id: number) => {
    if (onOpenDetail) onOpenDetail(id);
    else { onSelectDeal(id); onOpenChat(); }
  };

  // Empty state — no deals at all.
  if (adapted.length === 0) {
    return <EmptyToday firstName={firstName} onOpenChat={onOpenChat} onOpenHelp={onOpenHelp} />;
  }

  const leadDeal = sorted[0];

  return (
    <div className="mm-body">
      <div className="mm-today2">
        {/* Rail 1: Daily Briefing hero */}
        <HeroRail deal={leadDeal} onTap={() => openDeal(leadDeal.id)} />

        {/* Rail 2: Continue (numbered) */}
        <ContinueRail deals={sorted.slice(0, 5)} onTap={openDeal} />

        {/* Rail 3: Pinned Artifacts (horizontal) */}
        <ArtifactsRail
          deliverables={deliverables}
          deals={adapted}
          onTap={(dealId) => { onSelectDeal(dealId); onOpenChat(); }}
        />

        {/* Rail 4: Your Deals (compact list) */}
        <DealsRail deals={sorted} onTap={openDeal} />

        {/* Tail spacer so the last rail clears the NowYuliaBar + tab bar. */}
        <div style={{ height: 80 }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Rail 1 — Daily Briefing hero.
   Full-bleed gradient card. Kicker → headline → subtitle → deal chip.
   ═══════════════════════════════════════════════════════════════════ */

function synthBriefing(deal: MobileDeal): { kicker: string; headline: string; sub: string } {
  const latestConv = deal.conversations[0];

  if (latestConv?.summary) {
    return {
      kicker: 'LATEST · FROM YULIA',
      headline: latestConv.summary.length > 80 ? latestConv.summary.slice(0, 78) + '…' : latestConv.summary,
      sub: `${deal.name} · ${deal.stageLabel}`,
    };
  }

  if (deal.score != null) {
    const tone = deal.score >= 70 ? 'Strong' : deal.score >= 55 ? 'Mid-range' : 'Needs work';
    return {
      kicker: 'TODAY · QUALITY SIGNAL',
      headline: `${tone} ${deal.score}/100 on ${deal.name}`,
      sub: `${deal.industry || 'Unclassified'} · ${deal.stageLabel}`,
    };
  }

  if (deal.revenueLabel) {
    return {
      kicker: 'TODAY · READY FOR REVIEW',
      headline: `${deal.name} at ${deal.revenueLabel}`,
      sub: `Yulia is ready to score this — pick it up in chat.`,
    };
  }

  return {
    kicker: 'TODAY · JUST GETTING GOING',
    headline: `${deal.name} — start a conversation`,
    sub: `Add financials or a CIM and Yulia builds your first valuation.`,
  };
}

function HeroRail({ deal, onTap }: { deal: MobileDeal; onTap: () => void }) {
  const brief = synthBriefing(deal);
  return (
    <button type="button" className="mm-today2__hero" onClick={onTap} aria-label={`Open ${deal.name}`}>
      <div className="mm-today2__hero-art" aria-hidden />
      <div className="mm-today2__hero-body">
        <div className="mm-today2__hero-kicker">{brief.kicker}</div>
        <div className="mm-today2__hero-head">{brief.headline}</div>
        <div className="mm-today2__hero-sub">{brief.sub}</div>
        <div className="mm-today2__hero-chip">
          <span className="mm-today2__hero-chip-icon">{deal.initials}</span>
          <span className="mm-today2__hero-chip-name">{deal.name}</span>
          <span className="mm-today2__hero-chip-chev" aria-hidden>›</span>
        </div>
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Rail 2 — Continue (Apple "Now Trending" numbered list, 1-5).
   Huge Sora 800 numerals at 32px, direct on canvas, 0.5px dividers.
   ═══════════════════════════════════════════════════════════════════ */

function ContinueRail({ deals, onTap }: { deals: MobileDeal[]; onTap: (id: number) => void }) {
  if (deals.length === 0) return null;
  return (
    <section>
      <div className="mm-sec"><div><div className="mm-sec__k">RECENT</div><div className="mm-sec__t">Continue</div></div></div>
      <div className="mm-today2__numlist">
        {deals.map((d, i) => (
          <button key={d.id} type="button" className="mm-today2__numrow" onClick={() => onTap(d.id)}>
            <div className="mm-today2__numidx">{i + 1}</div>
            <div className="mm-today2__numbody">
              <div className="mm-today2__numt">{d.name}</div>
              <div className="mm-today2__nums">{d.kicker}</div>
            </div>
            <div className="mm-today2__numstage">{d.stage}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Rail 3 — Pinned Artifacts (horizontal scroll, asymmetric heights).
   Real deliverables when present; placeholder tiles otherwise so the
   rail exists visually.
   ═══════════════════════════════════════════════════════════════════ */

interface ArtifactTile {
  id: string;
  kind: 'real' | 'dummy';
  slug: string;
  name: string;
  dealId: number | null;
  dealName: string;
  /** Tile height variant — drives the asymmetric rhythm. */
  height: 'tall' | 'short';
  /** Display label for the art area. */
  bigLabel: string;
}

function makeTilesFromDeliverables(deliverables: AppDeliverable[], deals: MobileDeal[]): ArtifactTile[] {
  const dealById = new Map(deals.map((d) => [d.id, d]));
  return deliverables
    .filter((x) => x.status === 'completed' || x.completed_at != null)
    .slice(0, 8)
    .map((art): ArtifactTile => {
      const deal = dealById.get(art.deal_id) ?? null;
      const slug = art.slug.toLowerCase();
      let bigLabel = art.name.slice(0, 4).toUpperCase();
      let height: 'tall' | 'short' = 'short';
      if (/rundown|score/.test(slug) && deal?.score != null) { bigLabel = String(deal.score); height = 'short'; }
      else if (/baseline/.test(slug) && deal?.revenueLabel) { bigLabel = deal.revenueLabel; height = 'tall'; }
      else if (/cim/.test(slug)) { bigLabel = 'CIM'; height = 'tall'; }
      else if (/loi/.test(slug) && deal?.askingPriceLabel) { bigLabel = deal.askingPriceLabel; height = 'short'; }
      else if (/model|dcf|lbo/.test(slug) && deal?.ebitdaLabel) { bigLabel = deal.ebitdaLabel; height = 'tall'; }
      else if (/dd|diligence/.test(slug)) { bigLabel = 'DD'; height = 'short'; }
      return {
        id: `real-${art.id}`,
        kind: 'real',
        slug: art.slug,
        name: art.name,
        dealId: art.deal_id,
        dealName: deal?.name ?? 'Deal',
        bigLabel,
        height,
      };
    });
}

/** Placeholder tiles when no real artifacts exist yet — shows the user
 *  what kinds of things will live here. Marked kind:'dummy' so we style
 *  them differently (dashed border, muted). */
function makePlaceholderTiles(deals: MobileDeal[]): ArtifactTile[] {
  const leadDeal = deals[0];
  if (!leadDeal) return [];
  return [
    { id: 'dummy-baseline', kind: 'dummy', slug: 'baseline', name: 'Baseline Report', dealId: leadDeal.id, dealName: leadDeal.name, height: 'tall',  bigLabel: leadDeal.revenueLabel || '—' },
    { id: 'dummy-rundown',  kind: 'dummy', slug: 'rundown',  name: 'Daily Rundown',   dealId: leadDeal.id, dealName: leadDeal.name, height: 'short', bigLabel: leadDeal.score != null ? String(leadDeal.score) : '—' },
    { id: 'dummy-cim',      kind: 'dummy', slug: 'cim',      name: 'CIM Draft',       dealId: leadDeal.id, dealName: leadDeal.name, height: 'tall',  bigLabel: 'CIM' },
  ];
}

function ArtifactsRail({
  deliverables,
  deals,
  onTap,
}: {
  deliverables: AppDeliverable[];
  deals: MobileDeal[];
  onTap: (dealId: number) => void;
}) {
  const tiles = useMemo(() => {
    const real = makeTilesFromDeliverables(deliverables, deals);
    return real.length > 0 ? real : makePlaceholderTiles(deals);
  }, [deliverables, deals]);

  if (tiles.length === 0) return null;

  const eyebrow = tiles[0].kind === 'real' ? 'PINNED' : 'WHAT YULIA PRODUCES';
  const title = tiles[0].kind === 'real' ? 'Your artifacts' : 'Coming from Yulia';

  return (
    <section>
      <div className="mm-sec"><div><div className="mm-sec__k">{eyebrow}</div><div className="mm-sec__t">{title}</div></div></div>
      <div className="mm-today2__artrail">
        {tiles.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`mm-today2__arttile mm-today2__arttile--${t.height} ${t.kind === 'dummy' ? 'mm-today2__arttile--dummy' : ''}`}
            onClick={() => { if (t.dealId != null) onTap(t.dealId); }}
          >
            <div className="mm-today2__arttile-art">
              <div className="mm-today2__arttile-big">{t.bigLabel}</div>
            </div>
            <div className="mm-today2__arttile-body">
              <div className="mm-today2__arttile-t">{t.name}</div>
              <div className="mm-today2__arttile-s">{t.dealName}</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Rail 4 — Your Deals (compact list, canvas-direct, score + urgency).
   ═══════════════════════════════════════════════════════════════════ */

function DealsRail({ deals, onTap }: { deals: MobileDeal[]; onTap: (id: number) => void }) {
  if (deals.length === 0) return null;
  return (
    <section>
      <div className="mm-sec"><div><div className="mm-sec__k">PORTFOLIO · {deals.length}</div><div className="mm-sec__t">Your deals</div></div></div>
      <div className="mm-today2__dlist">
        {deals.map((d) => {
          const toneClass =
            d.tone === 'ok' ? 'mm-listrow__icon--ok'
            : d.tone === 'warn' ? 'mm-listrow__icon--warn'
            : d.tone === 'flag' ? 'mm-listrow__icon--flag'
            : '';
          const urgencyClass =
            d.urgency === 'ready' ? 'mm-today2__urg--ok'
            : d.urgency === 'progress' ? 'mm-today2__urg--warn'
            : d.urgency === 'flag' ? 'mm-today2__urg--flag'
            : 'mm-today2__urg--muted';
          return (
            <button key={d.id} type="button" className="mm-today2__drow" onClick={() => onTap(d.id)}>
              <div className={`mm-today2__dicon ${toneClass}`}>{d.initials}</div>
              <div className="mm-today2__dbody">
                <div className="mm-today2__dt">{d.name}</div>
                <div className="mm-today2__ds">
                  {[d.industry, d.revenueLabel, d.stageLabel].filter(Boolean).join(' · ')}
                </div>
              </div>
              <div className="mm-today2__dscore">
                {d.score != null ? (
                  <div className="mm-today2__dscore-num">{d.score}</div>
                ) : (
                  <div className={`mm-today2__urg ${urgencyClass}`} />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Empty state — no deals yet.
   ═══════════════════════════════════════════════════════════════════ */

function EmptyToday({ firstName, onOpenChat, onOpenHelp }: { firstName: string; onOpenChat: () => void; onOpenHelp: () => void }) {
  return (
    <div className="mm-body">
      <div className="mm-today2">
        <button
          type="button"
          className="mm-today2__hero"
          onClick={onOpenChat}
          aria-label="Start your first deal"
        >
          <div className="mm-today2__hero-art" aria-hidden />
          <div className="mm-today2__hero-body">
            <div className="mm-today2__hero-kicker">YULIA · READY</div>
            <div className="mm-today2__hero-head">Let's start a deal, {firstName}.</div>
            <div className="mm-today2__hero-sub">Tell Yulia about your business and she'll guide you from valuation to CIM.</div>
            <div className="mm-today2__hero-chip">
              <span className="mm-today2__hero-chip-name">Start chatting</span>
              <span className="mm-today2__hero-chip-chev" aria-hidden>›</span>
            </div>
          </div>
        </button>

        <div className="mm-sec"><div><div className="mm-sec__k">HOW THIS WORKS</div><div className="mm-sec__t">Three steps to a CIM</div></div></div>
        <div className="mm-today2__numlist">
          <HowRow n={1} t="Tell Yulia about your business" s="Revenue, industry, your role — the basics." />
          <HowRow n={2} t="Get a baseline report" s="Add-backs, SDE, multiples — all in plain English." />
          <HowRow n={3} t="Generate your CIM" s="The document buyers read first. 10–15 pages." />
        </div>

        <div style={{ padding: '0 20px 20px' }}>
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
        <div style={{ height: 80 }} />
      </div>
    </div>
  );
}

function HowRow({ n, t, s }: { n: number; t: string; s: string }) {
  return (
    <div className="mm-today2__numrow" style={{ cursor: 'default' }}>
      <div className="mm-today2__numidx">{n}</div>
      <div className="mm-today2__numbody">
        <div className="mm-today2__numt">{t}</div>
        <div className="mm-today2__nums">{s}</div>
      </div>
      <div className="mm-today2__numstage" />
    </div>
  );
}
