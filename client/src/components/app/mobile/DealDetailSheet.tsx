/**
 * DealDetailSheet — the Apple-App-Store "app detail page" for a deal.
 *
 * Opens when a user taps a deal tile in DealsTab or a deal row anywhere.
 * Full-screen portaled overlay (same PWA-safe pattern as ChatFullscreen).
 * Back chevron dismisses. Primary CTA is "Chat with Yulia" — the single
 * unambiguous action, mirroring App Store's big blue "Get/Install" button.
 *
 * Layout (top → bottom):
 *   1. Floating chrome row: back chevron (left), share icon (right)
 *   2. Header block: icon tile + name + subtitle + kicker
 *   3. Primary action: full-width "Chat with Yulia" pill + share icon
 *   4. Stat strip: 4 cells (Score / Revenue / Stage / Journey), Apple divider style
 *   5. Findings rail — horizontal, 2-up cards with kicker + headline
 *   6. What's New — version + recent activity lines
 *   7. Documents — vertical list of deliverables, dummy scaffolds where empty
 *
 * "Dummy data where real data missing" is explicit per user request —
 * findings/what's-new are synthesized from deal shape so the surface looks
 * alive even for fresh S0/S1 deals. Real data (deliverables, scoring,
 * revenue) overrides dummies when present.
 */

import { createPortal } from 'react-dom';
import { useEffect, useMemo } from 'react';
import type { MobileDeal } from './adaptDeals';
import type { AppDeliverable } from '../types';
import { GATE_LABEL } from './adaptDeals';

interface Props {
  open: boolean;
  deal: MobileDeal | null;
  deliverables: AppDeliverable[];
  onBack: () => void;
  onOpenChat: () => void;
  onOpenDeliverable?: (id: number) => void;
}

/* ── Dummy data synth — only used when real data is missing ────────── */

interface Finding {
  kicker: string;
  headline: string;
  summary: string;
  tone: 'ok' | 'warn' | 'flag' | 'neutral';
}

function synthFindings(deal: MobileDeal): Finding[] {
  const findings: Finding[] = [];

  if (deal.score != null) {
    const tone = deal.score >= 70 ? 'ok' : deal.score >= 50 ? 'warn' : 'flag';
    findings.push({
      kicker: 'QUALITY SCORE',
      headline:
        deal.score >= 70 ? `Strong ${deal.score}/100 composite`
        : deal.score >= 50 ? `Mid-range ${deal.score}/100 — upside with cleanup`
        : `Needs diligence — ${deal.score}/100`,
      summary: 'Seven-factor composite across financials, operations, and market fit.',
      tone,
    });
  }

  if (deal.scoreFactors) {
    const entries = Object.entries(deal.scoreFactors);
    const weakest = entries.sort((a, b) => a[1] - b[1])[0];
    const strongest = entries.sort((a, b) => b[1] - a[1])[0];
    if (strongest) {
      findings.push({
        kicker: 'STRONGEST FACTOR',
        headline: `${strongest[0].replace(/_/g, ' ')} leads the pack`.replace(/\b\w/g, (c) => c.toUpperCase()),
        summary: `Scoring ${Math.round(strongest[1])}/100 — this is what makes the deal interesting.`,
        tone: 'ok',
      });
    }
    if (weakest && weakest[0] !== strongest?.[0]) {
      findings.push({
        kicker: 'WATCH-ITEM',
        headline: `${weakest[0].replace(/_/g, ' ')} lags`.replace(/\b\w/g, (c) => c.toUpperCase()),
        summary: `At ${Math.round(weakest[1])}/100 — Yulia can dig in on this in chat.`,
        tone: 'warn',
      });
    }
  }

  if (deal.revenueLabel && deal.sdeLabel) {
    findings.push({
      kicker: 'FINANCIALS',
      headline: `${deal.revenueLabel} revenue · ${deal.sdeLabel} SDE`,
      summary: 'Extracted from deal financials — source docs remain the ground truth.',
      tone: 'neutral',
    });
  }

  if (findings.length === 0) {
    findings.push(
      {
        kicker: 'GETTING STARTED',
        headline: 'Talk to Yulia to build this out',
        summary: 'Upload a CIM, share financials, or describe the business. She takes it from there.',
        tone: 'neutral',
      },
      {
        kicker: 'WHAT WE NEED',
        headline: 'Financials · industry · journey type',
        summary: 'The minimum to produce a first valuation estimate and a scoring composite.',
        tone: 'neutral',
      },
    );
  }

  return findings;
}

interface Activity { version: string; date: string; line: string }

function synthActivity(deal: MobileDeal, deliverables: AppDeliverable[]): Activity[] {
  const lines: Activity[] = [];

  const dealDeliverables = deliverables
    .filter((d) => d.deal_id === deal.id && d.status === 'completed')
    .sort((a, b) => new Date(b.completed_at || b.created_at).getTime() - new Date(a.completed_at || a.created_at).getTime())
    .slice(0, 3);

  dealDeliverables.forEach((d, i) => {
    const when = d.completed_at || d.created_at;
    lines.push({
      version: `v1.${dealDeliverables.length - i}`,
      date: formatShortDate(when),
      line: `${d.name} delivered`,
    });
  });

  if (deal.conversations.length > 0 && lines.length < 3) {
    const latest = deal.conversations[0];
    if (latest.updated_at) {
      lines.push({
        version: `v1.${lines.length + 1}`,
        date: formatShortDate(latest.updated_at),
        line: latest.summary || latest.title || 'Conversation updated',
      });
    }
  }

  if (lines.length === 0) {
    lines.push(
      { version: 'v0.1', date: formatShortDate(deal.updatedAt || new Date().toISOString()), line: 'Deal created — Yulia is ready' },
      { version: 'v0.2', date: 'coming up', line: 'First ValueLens estimate after you share financials' },
    );
  }

  return lines;
}

function formatShortDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ── Component ─────────────────────────────────────────────────────── */

export default function DealDetailSheet({
  open,
  deal,
  deliverables,
  onBack,
  onOpenChat,
  onOpenDeliverable,
}: Props) {
  // Guard body scroll while open (matches ChatFullscreen pattern).
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => { document.documentElement.style.overflow = prev; };
  }, [open]);

  const findings = useMemo(() => (deal ? synthFindings(deal) : []), [deal]);
  const activity = useMemo(() => (deal ? synthActivity(deal, deliverables) : []), [deal, deliverables]);
  const dealDocs = useMemo(
    () => (deal ? deliverables.filter((d) => d.deal_id === deal.id) : []),
    [deal, deliverables],
  );

  if (!open || !deal) return null;

  const iconToneClass =
    deal.tone === 'ok'   ? 'mm-dd__icon--ok'
    : deal.tone === 'warn' ? 'mm-dd__icon--warn'
    : deal.tone === 'flag' ? 'mm-dd__icon--flag'
    : '';

  return createPortal(
    <div className="mm-dd" role="dialog" aria-modal="true" aria-label={`${deal.name} details`}>
      {/* Floating chrome — back + share */}
      <div className="mm-dd__chrome">
        <button type="button" className="mm-dd__iconbtn" onClick={onBack} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button type="button" className="mm-dd__iconbtn" aria-label="Share">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>
      </div>

      {/* Scrollable body */}
      <div className="mm-dd__scroll">
        {/* Header: icon + title block */}
        <div className="mm-dd__head">
          <div className={`mm-dd__icon ${iconToneClass}`}>{deal.initials}</div>
          <div className="mm-dd__titles">
            <div className="mm-dd__name">{deal.name}</div>
            <div className="mm-dd__sub">{deal.industry || 'Unclassified industry'}</div>
            <div className="mm-dd__meta">{deal.stageLabel}{deal.journeyType ? ` · ${deal.journeyType}` : ''}</div>
          </div>
        </div>

        {/* Primary action row */}
        <div className="mm-dd__actions">
          <button type="button" className="mm-dd__cta" onClick={onOpenChat}>
            Chat with Yulia
          </button>
          <button type="button" className="mm-dd__iconbtn mm-dd__iconbtn--solid" aria-label="Share">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
        </div>

        {/* Stat strip — 4 cells, Apple divider style */}
        <div className="mm-dd__stats">
          <Stat label="Score" value={deal.score != null ? String(deal.score) : '—'} sub={deal.score != null ? '/100' : 'pending'} />
          <Stat label="Revenue" value={deal.revenueLabel || '—'} sub={deal.revenueLabel ? 'annual' : 'not set'} />
          <Stat label="Stage" value={deal.stage} sub={GATE_LABEL[deal.stage] || 'Starting'} />
          <Stat label="Journey" value={(deal.journeyType || '—').toUpperCase()} sub="deal" />
        </div>

        {/* Findings rail — horizontal 2-up cards */}
        <div className="mm-sec"><div><div className="mm-sec__k">HAPPENING NOW</div><div className="mm-sec__t">Findings</div></div></div>
        <div className="mm-hscroll mm-dd__rail">
          {findings.map((f, i) => (
            <div key={i} className={`mm-hcard mm-dd__finding mm-dd__finding--${f.tone}`}>
              <div className="mm-dd__finding-art">
                <div className="mm-dd__finding-kicker">{f.kicker}</div>
                <div className="mm-dd__finding-head">{f.headline}</div>
              </div>
              <div className="mm-hcard__body">
                <div className="mm-dd__finding-sum">{f.summary}</div>
              </div>
            </div>
          ))}
        </div>

        {/* What's New */}
        <div className="mm-sec"><div className="mm-sec__t">What's New</div></div>
        <div className="mm-dd__news">
          {activity.map((a, i) => (
            <div key={i} className="mm-dd__news-row">
              <div className="mm-dd__news-v">{a.version}</div>
              <div className="mm-dd__news-line">{a.line}</div>
              <div className="mm-dd__news-d">{a.date}</div>
            </div>
          ))}
        </div>

        {/* Documents */}
        <div className="mm-sec"><div className="mm-sec__t">Documents</div></div>
        <div className="mm-dd__docs">
          {dealDocs.length === 0 ? (
            <div className="mm-dd__docs-empty">
              <div className="mm-dd__docs-empty-t">No documents yet</div>
              <div className="mm-dd__docs-empty-s">Yulia produces CIMs, ValueLens reports, and LOIs as you work through gates.</div>
            </div>
          ) : (
            dealDocs.map((d) => (
              <button
                key={d.id}
                type="button"
                className="mm-dd__doc"
                onClick={() => onOpenDeliverable?.(d.id)}
                disabled={d.status !== 'completed'}
              >
                <div className="mm-dd__doc-icon">{docIcon(d.slug)}</div>
                <div className="mm-dd__doc-body">
                  <div className="mm-dd__doc-t">{d.name}</div>
                  <div className="mm-dd__doc-s">
                    {d.status === 'completed' ? formatShortDate(d.completed_at) : d.status.replace(/^\w/, (c) => c.toUpperCase())}
                    {d.tier ? ` · ${d.tier}` : ''}
                  </div>
                </div>
                <div className="mm-dd__doc-chev" aria-hidden>›</div>
              </button>
            ))
          )}
        </div>

        <div style={{ height: 120 }} />
      </div>
    </div>,
    document.body,
  );
}

/* ── Inner atoms ───────────────────────────────────────────────────── */

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="mm-dd__stat">
      <div className="mm-dd__stat-label">{label}</div>
      <div className="mm-dd__stat-value">{value}</div>
      <div className="mm-dd__stat-sub">{sub}</div>
    </div>
  );
}

function docIcon(slug: string): string {
  const k = slug.toLowerCase();
  if (k.includes('cim')) return 'C';
  if (k.includes('loi')) return 'L';
  if (k.includes('dd')) return 'D';
  if (k.includes('model') || k.includes('valuelens') || k.includes('baseline')) return 'V';
  if (k.includes('rundown')) return 'R';
  return '◦';
}
