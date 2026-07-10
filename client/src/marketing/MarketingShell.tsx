/**
 * MarketingShell — the 2026-07 terra surface. One room, two phases:
 *
 *   landing(page) ──send──▶ chat        (CSS crossfade ~300ms, NO navigation)
 *   chat ──back──▶ landing              (exact page + scroll restored)
 *
 * Locked mechanics (wireframes 5h/5i/5m):
 *   - crossfade only; nothing slides; the logo NEVER moves
 *   - nav links fade out ~200ms; "←" fades in 200ms @100ms delay
 *   - mobile: ONE dock, fixed at the bottom in both phases — the same DOM
 *     node through the morph, so the keyboard is never dismissed
 *   - chat containers size from --app-height (visualViewport), never 100dvh
 *   - conversations run on the real anonymous funnel (useMarketingChat);
 *     context is piped from the origin page at session creation
 *
 * Desktop renders in-flow docks (hero/footer/chat) that share one send path;
 * the crossfade covers the hand-off and the chat dock autofocuses.
 */
import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode,
} from 'react';
import { Link, useLocation } from 'wouter';
import './marketing.css';
import { Brand } from './Brand';
import { Dock, type DockHandle } from './Dock';
import { Thread } from './Thread';
import { useMarketingChat } from './useMarketingChat';

export type MkPage = 'home' | 'sell' | 'buy' | 'brokers' | 'how' | 'pricing';

interface ShellCtxValue {
  /** Returns true if the message was accepted (docks keep the text on false). */
  send: (text: string) => boolean;
  seed: (text: string) => void;
  placeholder: string;
  phase: 'landing' | 'chat';
  /** True when the anonymous gate is closed — docks hard-disable so typed
   *  text is never silently swallowed by the gate guard. */
  dockDisabled: boolean;
}
const ShellCtx = createContext<ShellCtxValue | null>(null);

export function useShell(): ShellCtxValue {
  const ctx = useContext(ShellCtx);
  if (!ctx) throw new Error('useShell must be used inside MarketingShell');
  return ctx;
}

/** The in-hero dock. Desktop: a live dock instance. Mobile: a dock-shaped
 *  proxy that focuses the single fixed bottom dock (one real input per
 *  viewport). Persona chips pre-load Yulia's context by seeding the dock —
 *  they never navigate and never auto-send (wireframe 4d). */
export function HeroDock({ chips }: { chips?: Array<{ label: string; seed: string }> }) {
  const { placeholder, seed, send, dockDisabled } = useShell();
  const deskRef = useRef<DockHandle>(null);
  const seedNearest = (text: string) => {
    if (window.matchMedia('(min-width: 768px)').matches) deskRef.current?.seed(text);
    else seed(text);
  };
  return (
    <>
      <div className="mk-dock-wrap">
        <span className="mk-desktop-only" style={{ display: 'block' }}>
          <Dock ref={deskRef} placeholder={placeholder} onSend={send} disabled={dockDisabled} />
        </span>
        <button
          type="button"
          className="mk-dock mk-dock-proxy mk-mobile-only"
          onClick={() => seed('')}
          aria-label={placeholder}
        >
          <span className="mk-dock-proxy-text">{placeholder}</span>
        </button>
      </div>
      {chips && chips.length > 0 && (
        <div className="mk-chips">
          {chips.map(c => (
            <button type="button" key={c.label} className="mk-chip" onClick={() => seedNearest(c.seed)}>
              {c.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

const NAV: Array<{ href: string; label: string; page: MkPage }> = [
  { href: '/sell', label: 'Sell', page: 'sell' },
  { href: '/buy', label: 'Buy', page: 'buy' },
  { href: '/brokers', label: 'Brokers', page: 'brokers' },
  { href: '/how-it-works', label: 'How it works', page: 'how' },
  { href: '/pricing', label: 'Pricing', page: 'pricing' },
];

interface ShellProps {
  page: MkPage;
  placeholder: string;
  /** Contextual quick replies offered after Yulia's early turns. */
  quickReplies?: string[];
  children: ReactNode;
}

export function MarketingShell({ page, placeholder, quickReplies = [], children }: ShellProps) {
  const [location] = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);
  const mobileDockRef = useRef<DockHandle>(null);
  const chatDockRef = useRef<DockHandle>(null);
  const savedScroll = useRef(0);
  const [phase, setPhase] = useState<'landing' | 'chat'>('landing');
  const [menuOpen, setMenuOpen] = useState(false);
  const chat = useMarketingChat();

  // Hero typeface A/B (handoff open decision ①): ?hero=sora | ?hero=inter
  const heroSora = useMemo(() => {
    try { return new URLSearchParams(window.location.search).get('hero') === 'sora'; }
    catch { return false; }
  }, []);

  // --app-height from visualViewport (locked iOS rule — never 100dvh), plus
  // --kb-inset so the fixed mobile dock rides ABOVE the software keyboard
  // (iOS keeps position:fixed anchored to the unshrunken layout viewport).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const vv = window.visualViewport;
    const set = () => {
      const h = vv?.height ?? window.innerHeight;
      root.style.setProperty('--app-height', `${Math.round(h)}px`);
      const inset = vv ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop) : 0;
      root.style.setProperty('--kb-inset', `${Math.round(inset)}px`);
    };
    set();
    vv?.addEventListener('resize', set);
    vv?.addEventListener('scroll', set);
    window.addEventListener('resize', set);
    return () => {
      vv?.removeEventListener('resize', set);
      vv?.removeEventListener('scroll', set);
      window.removeEventListener('resize', set);
    };
  }, []);

  // Fresh page = top of page (the shell instance is per-page; belt & braces).
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, [location]);

  // The app (index.css) locks html/body scrolling; marketing pages scroll
  // naturally. Release the lock while mounted — except in the chat phase,
  // where the shell owns its own scroller (.mk-thread) and the page behind
  // must hold still.
  useEffect(() => {
    const html = document.documentElement.style;
    const body = document.body.style;
    const prevHtml = html.overflow;
    const prevBody = body.overflow;
    const free = phase === 'landing';
    html.overflow = free ? 'auto' : 'hidden';
    body.overflow = free ? 'auto' : 'hidden';
    return () => {
      html.overflow = prevHtml;
      body.overflow = prevBody;
    };
  }, [phase]);

  // Depend on the stable chat.send, not the per-render chat object — the ctx
  // must NOT churn on every SSE chunk (it feeds every useShell consumer).
  const { send: chatSend, sending: chatSending, gate: chatGate } = chat;

  const send = useCallback((text: string): boolean => {
    // The hook's own guard would silently drop these — reject loudly instead
    // (docks keep the typed text; gate docks are disabled with a clear label).
    if (chatSending || chatGate) return false;
    setMenuOpen(false);
    if (phase === 'landing') {
      savedScroll.current = window.scrollY || document.body.scrollTop || document.documentElement.scrollTop || 0;
      setPhase('chat');
      // Desktop hands focus to the chat dock; mobile keeps the same node.
      requestAnimationFrame(() => {
        if (window.matchMedia('(min-width: 768px)').matches) chatDockRef.current?.focus();
      });
    }
    void chatSend(text);
    return true;
  }, [phase, chatSend, chatSending, chatGate]);

  const seed = useCallback((text: string) => {
    // Mobile: seed + focus the single bottom dock. Desktop: hero dock is live.
    mobileDockRef.current?.seed(text);
  }, []);

  const back = useCallback(() => {
    setMenuOpen(false);
    setPhase('landing');
    requestAnimationFrame(() => {
      window.scrollTo(0, savedScroll.current);
      document.body.scrollTop = savedScroll.current;
      document.documentElement.scrollTop = savedScroll.current;
    });
  }, []);

  // Quick replies retire once the visitor is clearly conversing.
  const userTurns = chat.messages.filter(m => m.role === 'user').length;
  const activeQuick = userTurns < 3 ? quickReplies : [];

  const dockDisabled = !!chatGate;
  const ctx = useMemo<ShellCtxValue>(
    () => ({ send, seed, placeholder, phase, dockDisabled }),
    [send, seed, placeholder, phase, dockDisabled],
  );

  return (
    <ShellCtx.Provider value={ctx}>
      <div className={`mk${heroSora ? ' mk-hero-sora' : ''}${phase === 'chat' ? ' is-chat' : ''}`} ref={rootRef}>
        {/* nav — the logo is the fixed anchor; links ⇄ back-arrow crossfade */}
        <header className="mk-nav">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <button type="button" className="mk-back" onClick={back} aria-label="Back to the page">
              ←
            </button>
            <Link href="/" onClick={() => setMenuOpen(false)}><Brand /></Link>
          </span>
          <nav className="mk-nav-links" aria-label="Site">
            {NAV.map(n => (
              <Link key={n.href} href={n.href} className={n.page === page ? 'is-active' : ''}>{n.label}</Link>
            ))}
            <Link href="/login" className="mk-signin">Sign in</Link>
          </nav>
          <button type="button" className="mk-menu-btn" aria-label="Menu" onClick={() => setMenuOpen(v => !v)}>
            ≡
          </button>
          <span className="mk-nav-right-chat">Yulia</span>
          {menuOpen && (
            <div className="mk-menu" role="menu">
              {NAV.map(n => (
                <Link key={n.href} href={n.href} onClick={() => setMenuOpen(false)}>{n.label}</Link>
              ))}
              <Link href="/login" onClick={() => setMenuOpen(false)}>Sign in</Link>
            </div>
          )}
        </header>

        <div className="mk-main">
          {/* LANDING */}
          <div className="mk-landing" aria-hidden={phase === 'chat'}>
            {children}
            <footer className="mk-footer">
              <div className="mk-wrap">
                <div className="mk-footer-cta mk-desktop-only">
                  <p className="mk-footer-cta-line">Still reading? Just ask her.</p>
                  <div className="mk-dock-wrap">
                    <Dock placeholder={placeholder} onSend={send} disabled={dockDisabled} />
                  </div>
                </div>
                <div className="mk-footer-grid">
                  {NAV.map(n => <Link key={n.href} href={n.href}>{n.label}</Link>)}
                  <Link href="/standard">The Diligence Standard</Link>
                  <Link href="/connectors">Connectors</Link>
                  <Link href="/integrate">Integrate</Link>
                  <Link href="/raise">Raise</Link>
                  <Link href="/legal/terms">Terms</Link>
                  <Link href="/legal/privacy">Privacy</Link>
                  <Link href="/login">Sign in</Link>
                </div>
                <p className="mk-footer-legal">
                  smbX.ai is software. It computes the diligence work — valuations, models,
                  allocations, and documents. It does not broker, advise, negotiate, or
                  represent any party, and it never takes a success fee.
                </p>
              </div>
            </footer>
          </div>

          {/* CHAT */}
          <div className="mk-chat" aria-hidden={phase === 'landing'}>
            <Thread
              messages={chat.messages}
              streamingText={chat.streamingText}
              sending={chat.sending}
              gate={chat.gate}
              error={chat.error}
              quickReplies={activeQuick}
              onQuickReply={send}
            />
            <div className="mk-chat-dock mk-desktop-only">
              <div className="mk-dock-wrap">
                <Dock
                  ref={chatDockRef}
                  placeholder={chatGate ? 'Create your account to keep chatting' : 'Message Yulia…'}
                  onSend={send}
                  disabled={dockDisabled}
                />
              </div>
              <div className="mk-chat-hint">Yulia computes and cites — check important numbers.</div>
            </div>
          </div>
        </div>

        {/* the ONE mobile dock — same DOM node in both phases (keyboard law) */}
        <div className="mk-mobile-dock mk-mobile-only">
          <Dock
            ref={mobileDockRef}
            placeholder={chatGate ? 'Create your account to keep chatting' : phase === 'chat' ? 'Message Yulia…' : placeholder}
            onSend={send}
            disabled={dockDisabled}
          />
        </div>
      </div>
    </ShellCtx.Provider>
  );
}
