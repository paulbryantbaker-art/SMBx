/**
 * V4App — root of the Claude Design rebuild.
 *
 * Owns session state, mode (desktop/mobile), and composes the shell.
 * Individual region contents (V4Tool, V4Chat, V4Canvas, V4Rail) come
 * from `./chrome/*`. Mobile lives in `./mobile/MobileApp.tsx`.
 */

import { useEffect, useMemo, useState } from 'react';
import { useV4Session } from './session';
import V4Shell from './chrome/V4Shell';
import V4Tool from './chrome/V4Tool';
import V4Chat from './chrome/V4Chat';
import V4Rail from './chrome/V4Rail';
import V4Canvas from './chrome/V4Canvas';
import { PORTFOLIOS, DEALS, yuliaReply } from './data';
import type { ChatMessage } from './session';
import './tokens.css';
import './chrome/shell.css';

export default function V4App() {
  const session = useV4Session();
  const { ui, setUI, workspace, chats, appendMessage, changePortfolio, openTab, switchTab, closeTab, reorderTabs } = session;
  const [typing, setTyping] = useState(false);

  const portfolio = useMemo(
    () => PORTFOLIOS.find((p) => p.id === workspace.portfolioId) ?? PORTFOLIOS[0],
    [workspace.portfolioId],
  );
  const activeTab = workspace.tabs.find((t) => t.id === workspace.activeTabId) ?? null;
  const messages: ChatMessage[] = chats[portfolio.id] ?? [];

  const nextAction = useMemo(() => {
    if (activeTab?.kind === 'deal') {
      const d = DEALS.find((x) => x.id === activeTab.dealId);
      if (d) return { label: `Run a Rundown on ${d.name}`, kicker: 'YULIA SUGGESTS · NEXT' };
    }
    if (activeTab?.kind === 'loi') return { label: 'Draft counter-terms for concentration risk', kicker: 'YULIA SUGGESTS · NEXT' };
    if (activeTab?.kind === 'compare') return { label: 'Generate a memo comparing these three', kicker: 'YULIA SUGGESTS · NEXT' };
    return { label: 'Review what needs your attention today', kicker: 'YULIA SUGGESTS · NEXT' };
  }, [activeTab]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    appendMessage(portfolio.id, { who: 'me', text });
    setTyping(true);
    setTimeout(() => {
      const deal = activeTab?.dealId ? DEALS.find((d) => d.id === activeTab.dealId) ?? null : null;
      const reply = yuliaReply(text, deal, portfolio);
      setTyping(false);
      appendMessage(portfolio.id, {
        who: 'y',
        text: reply.text,
        progress: reply.progress,
      });
      if (reply.spawnTabs) {
        reply.spawnTabs.forEach((sp, i) =>
          setTimeout(
            () =>
              openTab({
                id: `${sp.kind}-${sp.dealId ?? sp.dealIds?.join('_') ?? Date.now()}`,
                kind: sp.kind as any,
                dealId: sp.dealId,
                dealIds: sp.dealIds,
                label: sp.label,
              }),
            250 + i * 180,
          ),
        );
      }
    }, 750);
  };

  // Read initial mode from query string on first mount.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const q = new URLSearchParams(window.location.search).get('mode');
    if (q === 'mobile' || q === 'desktop') setUI({ mode: q });
  }, [setUI]);

  // 'd' / 'm' keyboard shortcut to flip modes (dev convenience).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'd') setUI({ mode: 'desktop' });
      if (e.key === 'm') setUI({ mode: 'mobile' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setUI]);

  return (
    <div className={`app-v4 app-v4--${ui.mode}`} data-density={ui.density}>
      <ModeSwitcher mode={ui.mode} onChange={(mode) => setUI({ mode })} />
      {ui.mode === 'desktop' ? (
        <V4Shell
          ui={ui}
          tool={
            <V4Tool
              expanded={ui.toolExpanded}
              onToggle={() => setUI({ toolExpanded: !ui.toolExpanded })}
              nextAction={nextAction}
              onNextGo={() => handleSend(nextAction.label)}
            />
          }
          chat={
            <V4Chat
              portfolio={portfolio}
              onPortfolioChange={changePortfolio}
              messages={messages}
              onSend={handleSend}
              isTyping={typing}
              width={ui.chatW}
              onWidthChange={(w) => setUI({ chatW: w })}
            />
          }
          canvas={
            <V4Canvas
              tab={activeTab}
              portfolio={portfolio}
              onCloseTab={closeTab}
              onOpenDeal={(d) =>
                openTab({ id: `${d.id}-deal`, kind: 'deal', dealId: d.id, label: d.name, sub: d.kicker || d.stage })
              }
              onOpenModule={(m) => {
                if (m === 'compare') {
                  openTab({
                    id: 'compare',
                    kind: 'compare',
                    dealIds: DEALS.filter((d) => portfolio.dealIds.includes(d.id) && d.score).slice(0, 3).map((d) => d.id),
                    label: 'Compare · Live deals',
                    sub: '3 DEALS',
                  });
                } else if (m === 'portfolio') {
                  openTab({ id: 'portfolio', kind: 'portfolio', label: `${portfolio.name} · Overview`, sub: 'PORTFOLIO' });
                } else if (m === 'library') {
                  openTab({ id: 'library', kind: 'library', label: 'Library', sub: 'DOCS · DATA ROOMS · TEMPLATES' });
                } else if (m === 'sourcing') {
                  openTab({ id: 'sourcing', kind: 'doc', label: 'Sourcing feed', sub: 'NEW TARGETS' });
                }
              }}
            />
          }
          rail={
            <V4Rail
              tabs={workspace.tabs}
              activeTabId={workspace.activeTabId}
              expanded={ui.railShown}
              onSwitch={switchTab}
              onClose={closeTab}
              onReorder={reorderTabs}
              onCollapse={() => setUI({ railShown: !ui.railShown })}
              onNewTab={() => openTab({ id: `doc-${Date.now()}`, kind: 'doc', label: 'Untitled', sub: 'DRAFT' })}
            />
          }
        />
      ) : (
        <MobileStub />
      )}
    </div>
  );
}

/* ─── Dev-only mode switcher (bottom-right pill). ─────────────────── */
function ModeSwitcher({ mode, onChange }: { mode: 'desktop' | 'mobile'; onChange: (m: 'desktop' | 'mobile') => void }) {
  const btn = (active: boolean): React.CSSProperties => ({
    padding: '6px 12px',
    borderRadius: 999,
    border: 'none',
    background: active ? 'var(--v4-ink)' : 'transparent',
    color: active ? 'var(--v4-on-ink)' : 'var(--v4-mute)',
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.15s ease, color 0.15s ease',
  });
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        padding: 4,
        background: 'var(--v4-card)',
        border: '0.5px solid var(--v4-card-line)',
        borderRadius: 999,
        boxShadow: 'var(--v4-shadow-md)',
        display: 'flex',
        gap: 2,
      }}
    >
      <button type="button" onClick={() => onChange('desktop')} style={btn(mode === 'desktop')}>
        Desktop
      </button>
      <button type="button" onClick={() => onChange('mobile')} style={btn(mode === 'mobile')}>
        Mobile
      </button>
    </div>
  );
}

function MobileStub() {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div>
        <div style={{ fontFamily: "'Sora', system-ui, sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', color: 'var(--v4-ink)' }}>
          Mobile shell — pending
        </div>
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: 'var(--v4-mute)', marginTop: 4 }}>
          Today · Deals · Chat · Inbox
        </div>
      </div>
    </div>
  );
}
