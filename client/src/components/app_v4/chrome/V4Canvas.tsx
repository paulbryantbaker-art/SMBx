/**
 * V4Canvas — center floating card.
 *
 * Composition:
 *   V4Top           — top-right action bar (Portfolio / Deals dropdown /
 *                     Sourcing / Compare / Library + Search / Notifications)
 *   Breadcrumb      — portfolio / kind / title + optional sub badge
 *   Left + right    — floating pill rails (share/export/print, version |
 *                     fullscreen/more/close)
 *   V4CanvasBody    — dispatched by tab.kind (stub for now; task #35-37)
 *   V4DealMessages  — Gmail-style dock, bottom-right
 *
 * Ported from `claude_design/app/project/v4-shell.jsx`.
 */

import { useEffect, useRef, useState } from 'react';
import { DEALS, type Deal, type Portfolio } from '../data';
import type { Tab } from '../session';
import { RundownCard, DDCard, LOICard, CompareCard, ModelCard, ChartCard, SourcingCard } from '../shared/cards';
import LibraryView from '../canvas/LibraryView';
import '../shared/cards.css';
import '../canvas/library.css';

/* ═══════════════════════════════════════════════════════════════════
   V4Top — top action bar
   ═══════════════════════════════════════════════════════════════════ */

const NOTIFS = [
  { id: 1, unread: true,  who: 'LS', t: '<strong>Lena Sato</strong> shared the Atlas DD pack with you',                            meta: 'Atlas · 4m ago'        },
  { id: 2, unread: true,  who: 'JM', t: '<strong>Jordan Mercer</strong> left 3 comments on Benchmark · LOI',                        meta: 'Benchmark · 28m ago'   },
  { id: 3, unread: false, who: 'KR', t: '<strong>Kira Reyes</strong> approved your Summit memo',                                   meta: 'Summit · 2h ago'       },
  { id: 4, unread: false, who: 'DP', t: '<strong>Diego Park</strong> updated the Ridge forecast · Q4 revised +3.1%',               meta: 'Ridge · yesterday'     },
];

function V4Top({
  portfolio,
  onOpenModule,
  onOpenDeal,
}: {
  portfolio: Portfolio;
  onOpenModule: (m: string) => void;
  onOpenDeal: (d: Deal) => void;
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [dealsOpen, setDealsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const dealsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notifOpen) return;
    const h = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [notifOpen]);

  useEffect(() => {
    if (!dealsOpen) return;
    const h = (e: MouseEvent) => {
      if (dealsRef.current && !dealsRef.current.contains(e.target as Node)) setDealsOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [dealsOpen]);

  const unread = NOTIFS.filter((n) => n.unread).length;
  const portDeals = DEALS.filter((d) => portfolio.dealIds.includes(d.id));

  return (
    <div className="v4-top">
      <div className="v4-top__group">
        <button type="button" className="v4-top__btn" onClick={() => onOpenModule('portfolio')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
          Portfolio
        </button>
        <div ref={dealsRef} style={{ position: 'relative', display: 'inline-flex' }}>
          <button
            type="button"
            className={'v4-top__btn' + (dealsOpen ? ' v4-top__btn--active' : '')}
            onClick={() => setDealsOpen((o) => !o)}
            data-badge={portDeals.length || undefined}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-7l-2-3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" /></svg>
            Deals
          </button>
          {dealsOpen && (
            <div className="v4-deals-pop">
              <div className="v4-deals-pop__head">
                <div className="v4-deals-pop__head-t">Deals in {portfolio.name}</div>
                <div className="v4-deals-pop__head-b">{portDeals.length} ACTIVE</div>
              </div>
              <div className="v4-deals-pop__list">
                {portDeals.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className="v4-deals-pop__row"
                    onClick={() => {
                      onOpenDeal(d);
                      setDealsOpen(false);
                    }}
                  >
                    <div className={`v4-deals-pop__row-dot v4-deals-pop__row-dot--${d.tone || 'ok'}`} />
                    <div className="v4-deals-pop__row-body">
                      <div className="v4-deals-pop__row-t">{d.name}</div>
                      <div className="v4-deals-pop__row-s">{d.kicker || d.stage}</div>
                    </div>
                    {d.score != null && <div className="v4-deals-pop__row-score">{d.score}</div>}
                  </button>
                ))}
              </div>
              <div className="v4-deals-pop__foot">
                <button
                  type="button"
                  className="v4-deals-pop__foot-btn"
                  onClick={() => {
                    onOpenModule('compare');
                    setDealsOpen(false);
                  }}
                >
                  Compare live deals →
                </button>
              </div>
            </div>
          )}
        </div>
        <button type="button" className="v4-top__btn" onClick={() => onOpenModule('sourcing')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          Sourcing
        </button>
        <button type="button" className="v4-top__btn" onClick={() => onOpenModule('compare')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3v18M15 3v18M3 9h18M3 15h18" /></svg>
          Compare
        </button>
        <button type="button" className="v4-top__btn" onClick={() => onOpenModule('library')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
          Library
        </button>
      </div>

      <div className="v4-top__right">
        <div className="v4-top__group" ref={notifRef} style={{ position: 'relative' }}>
          <button type="button" className="v4-top__btn" title="Search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          </button>
          <button
            type="button"
            className="v4-top__btn"
            title="Notifications"
            onClick={() => setNotifOpen((o) => !o)}
            data-badge={unread || undefined}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" /></svg>
          </button>
          {notifOpen && (
            <div className="v4-notif">
              <div className="v4-notif__head">
                <div className="v4-notif__head-t">Notifications</div>
                <div className="v4-notif__head-b">{unread} NEW</div>
              </div>
              <div className="v4-notif__list">
                {NOTIFS.map((n) => (
                  <button key={n.id} type="button" className={'v4-notif__row' + (n.unread ? ' v4-notif__row--unread' : '')}>
                    <div className="v4-notif__row-av">{n.who}</div>
                    <div className="v4-notif__row-body">
                      <div className="v4-notif__row-t" dangerouslySetInnerHTML={{ __html: n.t }} />
                      <div className="v4-notif__row-meta">{n.meta}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   V4DealMessages — bottom-right Gmail-style dock
   ═══════════════════════════════════════════════════════════════════ */

const DM_THREADS = [
  { id: 1, who: 'SK', name: 'Sarah Kim (Atlas Air, CFO)',  unread: true,  sub: '"Happy to share the Q3 figures — attaching the revised deck."',      when: '12m',       tag: 'ATLAS · EMAIL'        },
  { id: 2, who: 'JM', name: 'Jordan Mercer',               unread: true,  sub: 'Left 3 comments on the LOI draft — can you ping back on concentration?', when: '1h',        tag: 'BENCHMARK · IN-APP'   },
  { id: 3, who: 'LS', name: 'Lena Sato',                   unread: false, sub: 'Shared the DD pack — 38/42 items cleared.',                          when: '3h',        tag: 'ATLAS · IN-APP'       },
  { id: 4, who: 'RT', name: 'Robert Tan (Summit, CEO)',    unread: false, sub: '"Let me know what works for a follow-up next Tue."',                 when: 'yesterday', tag: 'SUMMIT · EMAIL'       },
];

function V4DealMessages() {
  const [open, setOpen] = useState(false);
  const unread = DM_THREADS.filter((t) => t.unread).length;
  return (
    <div className={'v4-dm' + (open ? '' : ' v4-dm--mini')}>
      <div className="v4-dm__head" onClick={() => setOpen((o) => !o)} role="button" tabIndex={0}>
        <div className="v4-dm__head-ico">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="m22 6-10 7L2 6" /></svg>
        </div>
        <div className="v4-dm__head-t">Deal messages</div>
        {unread > 0 && <div className="v4-dm__head-b">{unread}</div>}
        <button
          type="button"
          className="v4-dm__head-btn"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="m18 15-6-6-6 6" /> : <path d="m6 9 6 6 6-6" />}
          </svg>
        </button>
      </div>
      {open && (
        <div className="v4-dm__body">
          {DM_THREADS.map((t) => (
            <button key={t.id} type="button" className="v4-dm__thread">
              <div className={'v4-dm__thread-av' + (t.unread ? ' v4-dm__thread-av--unread' : '')}>{t.who}</div>
              <div className="v4-dm__thread-body">
                <div className="v4-dm__thread-line1">
                  <div className="v4-dm__thread-n">{t.name}</div>
                  <div className="v4-dm__thread-w">{t.when}</div>
                </div>
                <div className="v4-dm__thread-sub">{t.sub}</div>
                <div className="v4-dm__thread-tag">{t.tag}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   V4CanvasBody — dispatches per tab.kind. Stub until #35-37 land.
   ═══════════════════════════════════════════════════════════════════ */

function V4CanvasBody({ tab, portfolio }: { tab: Tab | null; portfolio: Portfolio }) {
  if (!tab) {
    return (
      <div className="v4-canvas__empty">
        <div className="v4-canvas__empty-logo">smbx.ai</div>
        <div className="v4-canvas__empty-t">No document open</div>
        <div className="v4-canvas__empty-s">
          Ask Yulia to open a rundown, DCF, LOI or compare — or pick one from the tab strip on the right.
        </div>
      </div>
    );
  }

  const deal = tab.dealId ? DEALS.find((d) => d.id === tab.dealId) : null;

  if (tab.kind === 'rundown' && deal) return <div style={{ maxWidth: 720 }}><RundownCard deal={deal} /></div>;
  if (tab.kind === 'dd' && deal) return <div style={{ maxWidth: 720 }}><DDCard deal={deal} /></div>;
  if (tab.kind === 'loi' && deal) return <div style={{ maxWidth: 720 }}><LOICard deal={deal} /></div>;
  if (tab.kind === 'model' && deal) return <div style={{ maxWidth: 720 }}><ModelCard deal={deal} /></div>;
  if (tab.kind === 'compare') {
    const ids = tab.dealIds ?? [];
    const deals = DEALS.filter((d) => ids.includes(d.id));
    return <CompareCard deals={deals} />;
  }
  if (tab.kind === 'deal' && deal) {
    /* Deal dashboard: stacked RundownCard + ChartCard until we build a
       full DashboardView. Still a legit show-and-tell. */
    return (
      <div style={{ maxWidth: 720 }}>
        <RundownCard deal={deal} />
        <ChartCard deal={deal} />
      </div>
    );
  }
  if (tab.kind === 'portfolio') {
    const portDeals = DEALS.filter((d) => portfolio.dealIds.includes(d.id));
    return <SourcingCard deals={portDeals} />;
  }
  if (tab.kind === 'library') {
    return <LibraryView portfolio={portfolio} />;
  }
  /* scratch, doc, etc. → generic empty */
  return (
    <div className="v4-canvas__empty">
      <div className="v4-canvas__empty-t">{tab.label}</div>
      <div className="v4-canvas__empty-s">{tab.sub || ''}</div>
      <div style={{ marginTop: 24, fontSize: 11, color: 'var(--v4-faint)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>
        VIEW PENDING
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   V4Canvas — root (card + breadcrumb + floating pills + body + dm)
   ═══════════════════════════════════════════════════════════════════ */

interface Props {
  tab: Tab | null;
  portfolio: Portfolio;
  onCloseTab: (id: string) => void;
  onOpenDeal: (d: Deal) => void;
  onOpenModule: (m: string) => void;
}

export default function V4Canvas({ tab, portfolio, onCloseTab, onOpenDeal, onOpenModule }: Props) {
  const crumbKind = tab ? (tab.kind || '').toUpperCase() : 'CANVAS';
  const crumbTitle = tab ? tab.label : 'Nothing open';
  const crumbSub = tab?.sub ?? '';

  return (
    <div className="v4-canvas-wrap">
      <div className="v4-canvas">
        <V4Top portfolio={portfolio} onOpenModule={onOpenModule} onOpenDeal={onOpenDeal} />
        <div className="v4-canvas__head">
          <div className="v4-canvas__crumb">
            <span className="v4-canvas__crumb-k">{portfolio.name}</span>
            <span className="v4-canvas__crumb-sep">/</span>
            <span className="v4-canvas__crumb-k">{crumbKind}</span>
            <span className="v4-canvas__crumb-sep">/</span>
            <span className="v4-canvas__crumb-t">{crumbTitle}</span>
            {crumbSub && <span className="v4-canvas__crumb-badge">{crumbSub}</span>}
          </div>
        </div>

        {tab && (
          <>
            <div className="v4-cpill v4-cpill--left">
              <button type="button" className="v4-cpill__btn" title="Share">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" /></svg>
              </button>
              <button type="button" className="v4-cpill__btn" title="Export">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5-5 5 5M12 5v12" /></svg>
              </button>
              <button type="button" className="v4-cpill__btn" title="Print">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" /></svg>
              </button>
              <span className="v4-cpill__sep" />
              <button type="button" className="v4-cpill__btn v4-cpill__btn--label" title="Version">v1.3</button>
            </div>

            <div className="v4-cpill v4-cpill--right">
              <button type="button" className="v4-cpill__btn" title="Fullscreen">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
              </button>
              <button type="button" className="v4-cpill__btn" title="More">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
              </button>
              <span className="v4-cpill__sep" />
              <button type="button" className="v4-cpill__btn" title="Close" onClick={() => onCloseTab(tab.id)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
          </>
        )}

        <div className="v4-canvas__body">
          <V4CanvasBody tab={tab} portfolio={portfolio} />
        </div>
      </div>
      <V4DealMessages />
    </div>
  );
}
