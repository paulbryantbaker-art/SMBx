/**
 * MobileApp — Apple App Store–inspired mobile shell (port of
 * claude_design/app/project/mobile.jsx).
 *
 * Renders a phone-framed preview on desktop (`.phone` wrapper). In a
 * real iOS PWA deployment this would fill the viewport; the chat tab
 * applies the keyboard-anchoring fixes from
 * memory/feedback_pwa_chat_flex_layout.md so it survives that.
 *
 * Four tabs: Today · Deals · Chat · Inbox.
 */

import { useEffect, useRef, useState } from 'react';
import { DEALS, PINNED, STAGES, CHAT_SEEDS, yuliaReply, type Deal } from '../data';
import { ScoreDonut, Pill, DimRow } from '../shared/cards';
import './mobile.css';

/* ═══════════════════════════════════════════════════════════════════
   Icons
   ═══════════════════════════════════════════════════════════════════ */

const MIC = {
  today:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" /></svg>,
  deals:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7l9-4 9 4M3 7v10l9 4 9-4V7M3 7l9 4 9-4M12 11v10" /></svg>,
  chat:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  inbox:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.5 5h13l3 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z" /></svg>,
  sendBlue: <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" /></svg>,
};

/* ═══════════════════════════════════════════════════════════════════
   StatusBar (iOS-styled simulation)
   ═══════════════════════════════════════════════════════════════════ */

function StatusBar() {
  return (
    <div className="phone__status">
      <span>9:41</span>
      <div className="phone__status-r">
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="2.5" height="4" rx="0.5" /><rect x="4" y="5" width="2.5" height="6" rx="0.5" /><rect x="8" y="3" width="2.5" height="8" rx="0.5" /><rect x="12" y="0" width="2.5" height="11" rx="0.5" /></svg>
        <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor"><path d="M7.5 2C4.5 2 2 3.5 0 5.5l1.5 1.5C3 5.5 5 4 7.5 4s4.5 1.5 6 3l1.5-1.5C13 3.5 10.5 2 7.5 2zM3 7.5L4.5 9 7.5 6l3 3L12 7.5l-4.5-4.5z" /></svg>
        <svg width="24" height="11" viewBox="0 0 24 11" fill="none"><rect x="0.5" y="0.5" width="20" height="10" rx="2.5" stroke="currentColor" /><rect x="2" y="2" width="15" height="7" rx="1.5" fill="currentColor" /><rect x="21" y="4" width="1.5" height="3" rx="0.5" fill="currentColor" /></svg>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   InlineArtifact — mini previews for chat messages
   ═══════════════════════════════════════════════════════════════════ */

function InlineArtifact({ kind, deal }: { kind: string; deal: Deal | null }) {
  if (!deal && kind !== 'compare') return null;
  if (kind === 'rundown' && deal && deal.dims.length > 0) {
    return (
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <ScoreDonut score={deal.score || 0} size={88} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <Pill tone={deal.status === 'pursue' ? 'ok' : 'warn'}>{deal.status}</Pill>
            <Pill tone="ink">Fit {deal.fit}</Pill>
          </div>
          {deal.dims.slice(0, 3).map((d) => <DimRow key={d.label} {...d} />)}
        </div>
      </div>
    );
  }
  if (kind === 'dd') {
    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Pill tone="ok">38 cleared</Pill>
        <Pill tone="warn">3 today</Pill>
        <Pill tone="flag">1 flagged</Pill>
      </div>
    );
  }
  if (kind === 'loi') {
    return (
      <div>
        <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em' }}>
          $16.8M<span style={{ fontSize: 11, color: 'var(--gg-mute)', marginLeft: 8, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em' }}>70/20/10 · REC</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--gg-ink-2)', marginTop: 6, lineHeight: 1.5 }}>
          Cash / seller note / rollover. Maximizes after-tax NPV.
        </div>
      </div>
    );
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════════════
   Today tab
   ═══════════════════════════════════════════════════════════════════ */

function MobileToday({ onOpenChat }: { onOpenChat: () => void }) {
  const top = DEALS.filter((d) => d.score != null).sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 3);

  return (
    <div>
      <div className="m-today__head">
        <div className="m-today__date">Friday · Apr 19</div>
        <div className="m-today__title">
          Today
          <div className="m-today__avatar">M</div>
        </div>
      </div>

      <div className="m-today__feed">
        <div className="m-card m-card--hero" onClick={onOpenChat}>
          <div className="m-card__art" />
          <div className="m-card__body">
            <div className="m-card__kicker">YULIA · LIVE</div>
            <div className="m-card__t">Atlas cleared QoE. One yellow you should know about.</div>
            <div className="m-card__s">38% top-3 concentration, but two are 8+ year MSAs. Tap to walk through it.</div>
          </div>
        </div>

        <div className="m-card m-card--feat">
          <div className="m-card__art">
            <div style={{ position: 'relative', width: 160, height: 160 }}>
              <ScoreDonut score={76} size={160} />
            </div>
          </div>
          <div className="m-card__body">
            <div className="m-card__kicker">RUNDOWN READY</div>
            <div className="m-card__t">Summit Climate — 76/100, Pursue</div>
            <div className="m-card__s">$4.1M rev · solo owner exploring exit. Owner dependency is the one red flag.</div>
          </div>
        </div>

        <div className="m-card m-card--list">
          <div className="m-card__head">
            <div className="m-card__kicker">NEW THIS WEEK</div>
            <div className="m-card__t">Top picks from your thesis</div>
          </div>
          {DEALS.filter((d) => d.fit >= 70).slice(0, 4).map((d) => (
            <div key={d.id} className="m-listrow" onClick={onOpenChat}>
              <div className={`m-listrow__icon m-listrow__icon--${d.tone === 'ok' ? 'ok' : 'warn'}`}>
                {d.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
              </div>
              <div className="m-listrow__body">
                <div className="m-listrow__t">{d.name}</div>
                <div className="m-listrow__s">{d.sub.split(' · ')[0]} · Fit {d.fit}</div>
              </div>
              <button type="button" className="m-listrow__btn">OPEN</button>
            </div>
          ))}
        </div>

        <div>
          <div className="m-sec" style={{ padding: '0 20px 8px' }}>
            <div>
              <div className="m-sec__k">PINNED</div>
              <div className="m-sec__t">Your artifacts</div>
            </div>
            <button type="button" className="m-sec__more">See all</button>
          </div>
          <div className="m-hscroll">
            {PINNED.map((p) => (
              <div key={p.id} className="m-hcard" onClick={onOpenChat}>
                <div className="m-hcard__art">
                  <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 44, letterSpacing: '-0.03em', color: '#0A0A0B' }}>
                    {p.kind === 'rundown' ? '83' : p.kind === 'loi' ? '$16.8M' : p.kind === 'dd' ? '38/42' : p.kind === 'compare' ? '3' : '1.24M'}
                  </div>
                </div>
                <div className="m-hcard__body">
                  <div className="m-listrow__t" style={{ fontSize: 13 }}>{p.t}</div>
                  <div className="m-listrow__s" style={{ fontSize: 11 }}>{p.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="m-card m-card--list">
          <div className="m-card__head">
            <div className="m-card__kicker">STACK-RANKED</div>
            <div className="m-card__t">Your 3 live deals</div>
          </div>
          {top.map((d, i) => (
            <div key={d.id} className="m-listrow" onClick={onOpenChat}>
              <div className="m-listrow__icon m-listrow__icon--ink">#{i + 1}</div>
              <div className="m-listrow__body">
                <div className="m-listrow__t">{d.name}</div>
                <div className="m-listrow__s">{d.score}/100 · {d.industry} · {d.revenue}</div>
              </div>
              <button type="button" className="m-listrow__btn ink">COMPARE</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Deals tab
   ═══════════════════════════════════════════════════════════════════ */

function MobileDeals({ onOpenChat }: { onOpenChat: () => void }) {
  const [stage, setStage] = useState<string>('all');
  const filtered = stage === 'all' ? DEALS : DEALS.filter((d) => d.stage === stage);

  return (
    <div>
      <div className="m-deals__head">
        <h1>Deals</h1>
        <div style={{ fontSize: 22, color: 'var(--gg-faint)' }}>⌕</div>
      </div>
      <div className="m-stages">
        <button type="button" className={'m-stage' + (stage === 'all' ? ' active' : '')} onClick={() => setStage('all')}>
          All · {DEALS.length}
        </button>
        {STAGES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={'m-stage' + (stage === s.id ? ' active' : '')}
            onClick={() => setStage(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="m-today__feed">
        <div className="m-card m-card--list">
          {filtered.map((d) => (
            <div key={d.id} className="m-listrow" onClick={onOpenChat}>
              <div className={`m-listrow__icon m-listrow__icon--${d.tone === 'ok' ? 'ok' : 'warn'}`}>
                {d.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
              </div>
              <div className="m-listrow__body">
                <div className="m-listrow__t">{d.name}</div>
                <div className="m-listrow__s">{d.kicker} · {d.revenue} · Fit {d.fit}</div>
              </div>
              <button type="button" className="m-listrow__btn">{d.score ?? 'NEW'}</button>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: 20 }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Chat tab — APPLIES the PWA chat-pill + chin fixes from memory
   (feedback_pwa_chat_flex_layout.md):
     - Three-layer iMessage architecture: conversation as back layer
       (absolute inset:0), composer as front layer (absolute bottom:
       kbHeight), header as front layer (absolute top:0)
     - kbHeight = window.innerHeight - visualViewport.height, clamped
     - Only listen to `resize` on visualViewport (not `scroll`)
     - When rendered in iOS PWA, parent is expected to add
       html.yulia-chat-open so body is un-fixed per the memory's CSS.
   ═══════════════════════════════════════════════════════════════════ */

function MobileChat({ initialDealId = 'atlas' }: { initialDealId?: string }) {
  const [dealId, setDealId] = useState(initialDealId);
  const deal = DEALS.find((d) => d.id === dealId) ?? DEALS[0];
  const [msgs, setMsgs] = useState(() => {
    const seed = CHAT_SEEDS[dealId];
    if (seed) return [...seed];
    return [{ who: 'y' as const, text: `I'm up to speed on <strong>${deal.name}</strong>. What do you want to work on?`, cards: null }];
  });
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  /* kbHeight tracking — canonical fix from the PWA saga. */
  const [kbHeight, setKbHeight] = useState(0);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const raw = window.innerHeight - vv.height;
      const clamped = Math.max(0, Math.min(window.innerHeight * 0.75, raw));
      setKbHeight(clamped);
    };
    update();
    vv.addEventListener('resize', update);
    return () => vv.removeEventListener('resize', update);
  }, []);

  /* Auto-scroll to bottom when msgs change. */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [msgs, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { who: 'me', text, cards: null }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const reply = yuliaReply(text, deal, null);
      setTyping(false);
      setMsgs((m) => [...m, { who: 'y', text: reply.text, cards: reply.cards ?? null }]);
    }, 900);
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      {/* BACK LAYER — conversation scrolls freely */}
      <div
        className="m-chat__body"
        ref={scrollRef}
        style={{
          position: 'absolute',
          inset: 0,
          overflowY: 'auto',
          padding: `96px 16px ${72 + kbHeight}px`,
        }}
      >
        {msgs.map((m, i) => (
          <div key={i} className={'m-msg m-msg--' + m.who}>
            <div className="m-msg__meta">{m.who === 'y' ? 'YULIA' : 'YOU'}</div>
            <div className="m-msg__bubble" dangerouslySetInnerHTML={{ __html: m.text }} />
            {m.cards && m.cards.map((k: string) => (
              <div key={k} className="m-msg__card">
                <InlineArtifact kind={k} deal={deal} />
              </div>
            ))}
          </div>
        ))}
        {typing && (
          <div className="m-msg">
            <div className="m-msg__meta">YULIA</div>
            <div className="typing" style={{ display: 'inline-flex' }}>
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </div>

      {/* FRONT LAYER TOP — header floats above conversation */}
      <div
        className="m-chat__head"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 2,
          background: 'rgba(255,255,255,0.86)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          padding: '14px 16px',
          borderBottom: '0.5px solid var(--gg-border-soft)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div className="m-chat__avatar">Y</div>
        <div style={{ flex: 1 }}>
          <div className="m-chat__who">Yulia</div>
          <div className="m-chat__status">Working on {deal.name}</div>
        </div>
        <select
          value={dealId}
          onChange={(e) => {
            const nextId = e.target.value;
            setDealId(nextId);
            const seed = CHAT_SEEDS[nextId];
            const nextDeal = DEALS.find((d) => d.id === nextId) ?? DEALS[0];
            setMsgs(seed ? [...seed] : [{ who: 'y' as const, text: `Switched to ${nextDeal.name}.`, cards: null }]);
          }}
          style={{ fontFamily: 'inherit', fontSize: 12, padding: '4px 8px', borderRadius: 8, border: '0.5px solid var(--gg-border)', background: '#fff' }}
        >
          {DEALS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      {/* FRONT LAYER BOTTOM — composer anchored above the keyboard */}
      <div
        className="m-compose"
        style={{
          position: 'absolute',
          bottom: kbHeight,
          left: 0,
          right: 0,
          zIndex: 2,
          transition: 'bottom 0.15s ease-out',
          padding: '8px 12px',
          paddingBottom: kbHeight > 0 ? '8px' : 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderTop: '0.5px solid var(--gg-border-soft)',
        }}
      >
        <form
          className="m-compose__box"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <input
            placeholder={`Ask Yulia about ${deal.name}…`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ fontSize: 16 /* 16px to prevent iOS auto-zoom */ }}
          />
          <button type="submit" className="m-compose__send" disabled={!input.trim()}>
            {MIC.sendBlue}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Inbox tab
   ═══════════════════════════════════════════════════════════════════ */

const INBOX = [
  { dot: 'flag',  t: 'Concentration flag · Clearwater Electric', s: '62% revenue from single GC on month-to-month MSA. Yulia recommends walking.', k: '2H' },
  { dot: 'ok',    t: 'QoE cleared · Atlas Air',                  s: 'Adjusted EBITDA $1.24M, margin 20.0% after owner comp add-back.',             k: '6H' },
  { dot: 'warn',  t: 'Key-person + enviro landing today',        s: 'Atlas DD workstreams on track. Expecting Phase I by 6pm.',                    k: '9H' },
  { dot: 'ok',    t: 'LOI drafted · Benchmark Mechanical',       s: 'Three structures modeled. Rec: $16.8M, 70/20/10. Ready for your review.',     k: '1D' },
  { dot: 'muted', t: 'New match · Ridge Plumbing',               s: '$2.8M rev · first-gen owner in OKC. Outreach sent Tue.',                      k: '3D' },
  { dot: 'muted', t: 'Weekly thesis recap',                      s: '47 new named targets this week. 12 at Fit ≥ 70.',                             k: '4D' },
];

function MobileInbox() {
  return (
    <div>
      <div className="m-inbox__head">
        <h1>Inbox</h1>
      </div>
      <div className="m-inbox__list">
        {INBOX.map((it, i) => (
          <div key={i} className="m-inbox__item">
            <div className={'m-inbox__dot ' + it.dot} />
            <div>
              <div className="m-inbox__t">{it.t}</div>
              <div className="m-inbox__s">{it.s}</div>
            </div>
            <div className="m-inbox__k">{it.k}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Root MobileApp
   ═══════════════════════════════════════════════════════════════════ */

type MobileTab = 'today' | 'deals' | 'chat' | 'inbox';

export default function MobileApp() {
  const [tab, setTab] = useState<MobileTab>('today');

  return (
    <div className="phone">
      <div className="phone__screen">
        <StatusBar />
        <div className="phone__notch" />
        <div className="m-app">
          <div className="m-body">
            {tab === 'today' && <MobileToday onOpenChat={() => setTab('chat')} />}
            {tab === 'deals' && <MobileDeals onOpenChat={() => setTab('chat')} />}
            {tab === 'chat' && <MobileChat />}
            {tab === 'inbox' && <MobileInbox />}
          </div>
          <div className="m-tabs">
            <button type="button" className={'m-tab' + (tab === 'today' ? ' active' : '')} onClick={() => setTab('today')}>
              <div className="m-tab-ic">{MIC.today}</div>Today
            </button>
            <button type="button" className={'m-tab' + (tab === 'deals' ? ' active' : '')} onClick={() => setTab('deals')}>
              <div className="m-tab-ic">{MIC.deals}</div>Deals
            </button>
            <button type="button" className={'m-tab' + (tab === 'chat' ? ' active' : '')} onClick={() => setTab('chat')}>
              <div className="m-tab-ic">{MIC.chat}</div>Chat
            </button>
            <button type="button" className={'m-tab' + (tab === 'inbox' ? ' active' : '')} onClick={() => setTab('inbox')}>
              <div className="m-tab-ic">{MIC.inbox}</div>Inbox
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
