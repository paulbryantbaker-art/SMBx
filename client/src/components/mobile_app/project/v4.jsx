/* ═══════════════════════════════════════════════════════════
   v4.jsx — App root for the Claude-Design-style shell
   Vertical Toolbar · Chat Well · Floating Canvas · Vertical Tab Strip
   ═══════════════════════════════════════════════════════════ */

const V4_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "mode": "desktop",
  "density": "comfortable",
  "railShown": true,
  "chatW": 380,
  "dmOpen": false,
  "toolExpanded": false
}/*EDITMODE-END*/;

function v4LoadState() {
  try { return { ...V4_TWEAK_DEFAULTS, ...JSON.parse(localStorage.getItem('smbx-v4-state') || '{}') }; }
  catch { return V4_TWEAK_DEFAULTS; }
}
function v4SaveState(s) { try { localStorage.setItem('smbx-v4-state', JSON.stringify(s)); } catch {} }

function v4LoadSession() {
  try {
    const s = JSON.parse(localStorage.getItem('smbx-v4-session') || 'null');
    if (s && s.tabs) return s;
  } catch {}
  return {
    portfolioId: 'fund1',
    tabs: [
      { id: 'atlas-deal',    kind: 'deal',    dealId: 'atlas',     label: 'Atlas Air',            sub: 'DD IN PROGRESS' },
      { id: 'atlas-model',   kind: 'model',   dealId: 'atlas',     label: 'Atlas · DCF',          sub: 'IRR 23.4%' },
      { id: 'benchmark-loi', kind: 'loi',     dealId: 'benchmark', label: 'Benchmark · LOI',      sub: 'DRAFTED' },
      { id: 'compare-3',     kind: 'compare', dealIds: ['atlas','summit','benchmark'], label: 'Atlas + Summit + Benchmark', sub: '3 DEALS' },
    ],
    activeTabId: 'atlas-deal',
  };
}
function v4SaveSession(s) { try { localStorage.setItem('smbx-v4-session', JSON.stringify(s)); } catch {} }

function v4LoadChats() {
  try { return JSON.parse(localStorage.getItem('smbx-v4-chats') || '{}'); }
  catch { return {}; }
}
function v4SaveChats(m) { try { localStorage.setItem('smbx-v4-chats', JSON.stringify(m)); } catch {} }

function V4App() {
  const [state, setState] = React.useState(v4LoadState);
  const set = patch => setState(s => { const n = { ...s, ...patch }; v4SaveState(n); return n; });

  const [session, setSession] = React.useState(v4LoadSession);

  const portfolio = React.useMemo(
    () => window.PORTFOLIOS.find(p => p.id === session.portfolioId) || window.PORTFOLIOS[0],
    [session.portfolioId]
  );
  const activeTab = session.tabs.find(t => t.id === session.activeTabId) || null;

  const [chatsByPortfolio, setChatsByPortfolio] = React.useState(() => {
    const saved = v4LoadChats();
    const next = { ...saved };
    window.PORTFOLIOS.forEach(p => {
      if (!next[p.id]) {
        next[p.id] = [
          { who: 'y', text: `Morning — working in <strong>${p.name}</strong>. ${p.dealIds.length} deals active. <strong>Atlas Air</strong> is top of pile — DD 38/42 cleared, one yellow flag on concentration. <strong>Benchmark</strong>'s LOI is drafted and waiting on you. What do you want first?`, artifacts: null },
        ];
      }
    });
    return next;
  });
  const messages = chatsByPortfolio[portfolio.id] || [];
  const [typing, setTyping] = React.useState(false);

  const appendMessage = msg => {
    setChatsByPortfolio(m => {
      const next = { ...m, [portfolio.id]: [...(m[portfolio.id] || []), msg] };
      v4SaveChats(next);
      return next;
    });
  };

  const openTab = spec => {
    const id = spec.id || `${spec.kind}-${spec.dealId || (spec.dealIds || []).join('_') || Date.now()}`;
    setSession(s => {
      if (s.tabs.some(t => t.id === id)) { const n = { ...s, activeTabId: id }; v4SaveSession(n); return n; }
      const n = { ...s, tabs: [...s.tabs, { ...spec, id }], activeTabId: id };
      v4SaveSession(n); return n;
    });
    return id;
  };
  const switchTab = id => setSession(s => { const n = { ...s, activeTabId: id }; v4SaveSession(n); return n; });
  const closeTab = id => setSession(s => {
    const next = s.tabs.filter(t => t.id !== id);
    const newActive = s.activeTabId === id
      ? (next.length ? next[Math.max(0, next.length - 1)].id : null)
      : s.activeTabId;
    const n = { ...s, tabs: next, activeTabId: newActive };
    v4SaveSession(n); return n;
  });
  const reorderTabs = (draggedId, overId) => setSession(s => {
    const from = s.tabs.findIndex(t => t.id === draggedId);
    const to = s.tabs.findIndex(t => t.id === overId);
    if (from < 0 || to < 0 || from === to) return s;
    const next = s.tabs.slice();
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    const n = { ...s, tabs: next };
    v4SaveSession(n); return n;
  });
  const changePortfolio = pid => {
    const port = window.PORTFOLIOS.find(p => p.id === pid);
    setSession(s => {
      const keep = s.tabs.filter(t => !t.dealId || port.dealIds.includes(t.dealId));
      const n = {
        portfolioId: pid,
        tabs: keep,
        activeTabId: keep.some(t => t.id === s.activeTabId) ? s.activeTabId : (keep[0] && keep[0].id) || null,
      };
      v4SaveSession(n); return n;
    });
  };

  /* Yulia's next action suggestion (persistent pill) */
  const nextAction = React.useMemo(() => {
    if (activeTab && activeTab.kind === 'deal') {
      const d = window.DEALS.find(x => x.id === activeTab.dealId);
      if (d) return { label: `Run a Rundown on ${d.name}`, kicker: 'YULIA SUGGESTS · NEXT' };
    }
    if (activeTab && activeTab.kind === 'loi') return { label: 'Draft counter-terms for concentration risk', kicker: 'YULIA SUGGESTS · NEXT' };
    if (activeTab && activeTab.kind === 'compare') return { label: 'Generate a memo comparing these three', kicker: 'YULIA SUGGESTS · NEXT' };
    return { label: 'Review what needs your attention today', kicker: 'YULIA SUGGESTS · NEXT' };
  }, [activeTab]);

  const handleSend = text => {
    appendMessage({ who: 'me', text });
    setTyping(true);
    setTimeout(() => {
      const reply = window.yuliaReply(text, activeTab && activeTab.dealId ? window.DEALS.find(d => d.id === activeTab.dealId) : null, portfolio);
      setTyping(false);

      const artifacts = [];
      if (reply.spawnTabs) {
        reply.spawnTabs.forEach(sp => artifacts.push({ label: sp.label, sub: sp.sub || (sp.kind || '').toUpperCase(), icon: '◆', _spec: sp }));
      } else if (reply.cards && reply.cards.length > 0) {
        const k = reply.cards[0];
        const dealForCard = activeTab && activeTab.dealId ? window.DEALS.find(d => d.id === activeTab.dealId) : null;
        if (k === 'compare') {
          const live = window.DEALS.filter(d => portfolio.dealIds.includes(d.id) && d.score).slice(0, 3);
          artifacts.push({ label: 'Compare · Live deals', sub: '3 DEALS', icon: '◆', _spec: { kind: 'compare', dealIds: live.map(d => d.id), label: 'Compare · Live deals', sub: '3 DEALS' } });
        } else if (dealForCard) {
          const labelMap = { rundown: 'Rundown', dd: 'DD pack', loi: 'LOI', model: 'DCF', chart: 'Revenue' };
          artifacts.push({ label: `${dealForCard.name} · ${labelMap[k] || k}`, sub: dealForCard.kicker, icon: '◆', _spec: { kind: k === 'model' ? 'model' : (k === 'chart' ? 'deal' : k), dealId: dealForCard.id, label: `${dealForCard.name} · ${labelMap[k] || k}`, sub: dealForCard.kicker } });
        }
      }

      appendMessage({ who: 'y', text: reply.text, progress: reply.progress, artifacts });

      if (reply.spawnTabs) {
        reply.spawnTabs.forEach((sp, i) => setTimeout(() => openTab(sp), 250 + i * 180));
      } else if (artifacts.length > 0 && artifacts[0]._spec) {
        setTimeout(() => openTab(artifacts[0]._spec), 350);
      }
    }, 750);
  };

  /* Edit mode */
  const [tweaksOpen, setTweaksOpen] = React.useState(false);
  React.useEffect(() => {
    const onMsg = e => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === '__activate_edit_mode') setTweaksOpen(true);
      if (e.data.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const [activeTool, setActiveTool] = React.useState('chat');

  return (
    <div className="host" data-density={state.density}>
      <div className="host__bar">
        <div className="host__brand">smbx.ai <span>· internal</span></div>
        <div className="host__toggle">
          <button className={state.mode === 'desktop' ? 'active' : ''} onClick={() => set({ mode: 'desktop' })}>Desktop</button>
          <button className={state.mode === 'mobile' ? 'active' : ''} onClick={() => set({ mode: 'mobile' })}>Mobile</button>
        </div>
        <div style={{ width: 200, textAlign: 'right', fontSize: 11, color: '#9A9A9F', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>
          {state.mode === 'desktop' ? 'CHAT · CANVAS · STRIP' : 'MOBILE APP'}
        </div>
      </div>

      <div className="host__stage">
        {state.mode === 'desktop' ? (
          <div
            className="v4"
            data-rail={state.railShown ? 'shown' : 'hidden'}
            data-tool={state.toolExpanded ? 'expanded' : 'collapsed'}
            style={{ '--v4-chat-w': state.chatW + 'px', '--v4-rail-w': (state.railShown ? 240 : 72) + 'px', '--v4-tool-w': (state.toolExpanded ? 184 : 56) + 'px' }}
          >
            <V4Tool
              active={activeTool}
              onPick={setActiveTool}
              expanded={state.toolExpanded}
              onToggle={() => set({ toolExpanded: !state.toolExpanded })}
              nextAction={nextAction}
              onNextGo={() => handleSend(nextAction.label)}
            />

            <V4Chat
              portfolio={portfolio}
              onPortfolioChange={changePortfolio}
              messages={messages}
              onSend={handleSend}
              isTyping={typing}
              onOpenArtifact={a => a._spec && openTab(a._spec)}
              nextAction={nextAction}
              onNextGo={() => handleSend(nextAction.label)}
              width={state.chatW}
              onWidthChange={w => set({ chatW: w })}
            />

            <V4Canvas
              tab={activeTab}
              portfolio={portfolio}
              onCloseTab={closeTab}
              onFullscreen={() => {}}
              onOpenDeal={d => openTab({ kind: 'deal', dealId: d.id, label: d.name, sub: d.kicker || d.stage })}
              onOpenModule={m => {
                if (m === 'compare') {
                  openTab({ id: 'compare', kind: 'compare', dealIds: window.DEALS.filter(d => portfolio.dealIds.includes(d.id) && d.score).slice(0, 3).map(d => d.id), label: 'Compare · Live deals', sub: '3 DEALS' });
                } else if (m === 'deals') {
                  openTab({ id: 'deals', kind: 'deals', label: 'Deals', sub: `${portfolio.dealIds.length} IN ${portfolio.name.toUpperCase()}` });
                } else if (m === 'portfolio') {
                  openTab({ id: 'portfolio', kind: 'portfolio', label: `${portfolio.name} · Overview`, sub: 'PORTFOLIO' });
                } else if (m === 'sourcing') {
                  openTab({ id: 'sourcing', kind: 'sourcing', label: 'Sourcing feed', sub: 'NEW TARGETS' });
                } else if (m === 'library') {
                  openTab({ id: 'library', kind: 'library', label: 'Library', sub: 'DOCS · DATA ROOMS · TEMPLATES' });
                }
              }}
            />

            <V4Rail
              tabs={session.tabs}
              activeTabId={session.activeTabId}
              onSwitch={switchTab}
              onClose={closeTab}
              onReorder={reorderTabs}
              expanded={state.railShown}
              onCollapse={() => set({ railShown: !state.railShown })}
              onNewTab={() => openTab({ kind: 'doc', label: 'Untitled', sub: 'DRAFT' })}
              onFullscreen={() => {}}
            />
          </div>
        ) : (
          <div className="mobile-host">
            <MobileApp browseMode={false} />
          </div>
        )}
      </div>

      {tweaksOpen && (
        <div className="tweaks">
          <div className="tweaks__head">
            <div className="tweaks__t">Tweaks</div>
            <button className="tweaks__x" onClick={() => setTweaksOpen(false)}>×</button>
          </div>
          <div className="tweaks__body">
            <div className="tweaks__row">
              <div className="tweaks__lbl">Mode</div>
              <div className="tweaks__seg">
                <button className={state.mode === 'desktop' ? 'active' : ''} onClick={() => set({ mode: 'desktop' })}>Desktop</button>
                <button className={state.mode === 'mobile' ? 'active' : ''} onClick={() => set({ mode: 'mobile' })}>Mobile</button>
              </div>
            </div>
            {state.mode === 'desktop' && <>
              <div className="tweaks__row">
                <div className="tweaks__lbl">Chat well width · {state.chatW}px</div>
                <div className="tweaks__seg">
                  <button className={state.chatW <= 340 ? 'active' : ''} onClick={() => set({ chatW: 320 })}>Narrow</button>
                  <button className={state.chatW > 340 && state.chatW < 440 ? 'active' : ''} onClick={() => set({ chatW: 380 })}>Normal</button>
                  <button className={state.chatW >= 440 ? 'active' : ''} onClick={() => set({ chatW: 460 })}>Wide</button>
                </div>
              </div>
              <div className="tweaks__row">
                <div className="tweaks__lbl">Tab strip</div>
                <div className="tweaks__seg">
                  <button className={state.railShown ? 'active' : ''} onClick={() => set({ railShown: true })}>Shown</button>
                  <button className={!state.railShown ? 'active' : ''} onClick={() => set({ railShown: false })}>Hidden</button>
                </div>
              </div>
              <div className="tweaks__row">
                <div className="tweaks__lbl">Density</div>
                <div className="tweaks__seg">
                  <button className={state.density === 'comfortable' ? 'active' : ''} onClick={() => set({ density: 'comfortable' })}>Comfortable</button>
                  <button className={state.density === 'compact' ? 'active' : ''} onClick={() => set({ density: 'compact' })}>Compact</button>
                </div>
              </div>
              <div className="tweaks__row">
                <div className="tweaks__lbl">Session</div>
                <div className="tweaks__seg">
                  <button onClick={() => { localStorage.removeItem('smbx-v4-session'); localStorage.removeItem('smbx-v4-chats'); location.reload(); }}>Reset</button>
                </div>
              </div>
            </>}
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<V4App />);
