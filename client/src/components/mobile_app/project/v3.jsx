/* ═══════════════════════════════════════════════════════════
   v3.jsx — App root for the chat-first layout
   LEFT (dark) Chat · CENTER (white) Canvas · RIGHT (cream) Tab rail
   ═══════════════════════════════════════════════════════════ */

const V3_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "mode": "desktop",
  "density": "comfortable",
  "layout": "three-pane",
  "railShown": true,
  "chatWidth": "normal"
}/*EDITMODE-END*/;

function v3LoadState() {
  try { return { ...V3_TWEAK_DEFAULTS, ...JSON.parse(localStorage.getItem('smbx-v3-state') || '{}') }; }
  catch { return V3_TWEAK_DEFAULTS; }
}
function v3SaveState(s) { try { localStorage.setItem('smbx-v3-state', JSON.stringify(s)); } catch {} }

function v3LoadSession() {
  try {
    const s = JSON.parse(localStorage.getItem('smbx-v3-session') || 'null');
    if (s && s.tabs) return s;
  } catch {}
  return {
    portfolioId: 'fund1',
    tabs: [
      { id: 'atlas-deal',    kind: 'deal',    dealId: 'atlas',     label: 'Atlas Air',            sub: 'DD IN PROGRESS' },
      { id: 'benchmark-loi', kind: 'loi',     dealId: 'benchmark', label: 'Benchmark · LOI',      sub: 'LOI DRAFTED' },
      { id: 'compare-3',     kind: 'compare', dealIds: ['atlas','summit','benchmark'], label: 'Compare · Atlas + Summit + Benchmark', sub: '3 DEALS' },
    ],
    activeTabId: 'atlas-deal',
  };
}
function v3SaveSession(s) { try { localStorage.setItem('smbx-v3-session', JSON.stringify(s)); } catch {} }

/* Persistent chat per portfolio */
function v3LoadChats() {
  try { return JSON.parse(localStorage.getItem('smbx-v3-chats') || '{}'); }
  catch { return {}; }
}
function v3SaveChats(m) { try { localStorage.setItem('smbx-v3-chats', JSON.stringify(m)); } catch {} }

function V3App() {
  const [state, setState] = React.useState(v3LoadState);
  const set = patch => setState(s => { const n = { ...s, ...patch }; v3SaveState(n); return n; });

  const [session, setSession] = React.useState(v3LoadSession);
  const updateSession = patch => setSession(s => { const n = { ...s, ...patch }; v3SaveSession(n); return n; });

  const portfolio = React.useMemo(
    () => window.PORTFOLIOS.find(p => p.id === session.portfolioId) || window.PORTFOLIOS[0],
    [session.portfolioId]
  );
  const activeTab = session.tabs.find(t => t.id === session.activeTabId) || null;

  /* Chat state — ONE chat per portfolio */
  const [chatsByPortfolio, setChatsByPortfolio] = React.useState(() => {
    const saved = v3LoadChats();
    /* Seed first time for each portfolio */
    const next = { ...saved };
    window.PORTFOLIOS.forEach(p => {
      if (!next[p.id]) {
        next[p.id] = [
          { who: 'y', text: `Morning — this is your <strong>${p.name}</strong> workspace. ${p.dealIds.length} deals in play. I've kept <strong>Atlas Air</strong> at the top of the pile; their DD is 38/42 cleared and the one yellow flag is customer concentration. Want me to walk through it or pull something else up?`, cards: null },
        ];
      }
    });
    return next;
  });
  const messages = chatsByPortfolio[portfolio.id] || [];
  const [typing, setTyping] = React.useState(false);

  const appendMessage = (msg) => {
    setChatsByPortfolio(m => {
      const next = { ...m, [portfolio.id]: [...(m[portfolio.id] || []), msg] };
      v3SaveChats(next);
      return next;
    });
  };

  /* Tab ops */
  const openTab = (spec) => {
    const id = spec.id || `${spec.kind}-${spec.dealId || (spec.dealIds || []).join('_') || Date.now()}`;
    setSession(s => {
      if (s.tabs.some(t => t.id === id)) return { ...s, activeTabId: id };
      const nt = { ...spec, id };
      const nextS = { ...s, tabs: [...s.tabs, nt], activeTabId: id };
      v3SaveSession(nextS);
      return nextS;
    });
    return id;
  };
  const switchTab = (id) => updateSession({ activeTabId: id });
  const closeTab = (id) => {
    setSession(s => {
      const next = s.tabs.filter(t => t.id !== id);
      const newActive = s.activeTabId === id
        ? (next.length ? next[Math.max(0, next.length - 1)].id : null)
        : s.activeTabId;
      const nextS = { ...s, tabs: next, activeTabId: newActive };
      v3SaveSession(nextS);
      return nextS;
    });
  };
  const reorderTabs = (draggedId, overId) => {
    setSession(s => {
      const from = s.tabs.findIndex(t => t.id === draggedId);
      const to = s.tabs.findIndex(t => t.id === overId);
      if (from < 0 || to < 0 || from === to) return s;
      const next = s.tabs.slice();
      const [m] = next.splice(from, 1);
      next.splice(to, 0, m);
      const nextS = { ...s, tabs: next };
      v3SaveSession(nextS);
      return nextS;
    });
  };
  const changePortfolio = (pid) => {
    const port = window.PORTFOLIOS.find(p => p.id === pid);
    setSession(s => {
      const keep = s.tabs.filter(t => !t.dealId || port.dealIds.includes(t.dealId));
      const nextS = {
        portfolioId: pid,
        tabs: keep,
        activeTabId: keep.some(t => t.id === s.activeTabId) ? s.activeTabId : (keep[0] && keep[0].id) || null,
      };
      v3SaveSession(nextS);
      return nextS;
    });
  };

  /* Yulia's send */
  const handleSend = (text) => {
    appendMessage({ who: 'me', text });
    setTyping(true);
    setTimeout(() => {
      const reply = window.yuliaReply(text, activeTab && activeTab.dealId ? window.DEALS.find(d => d.id === activeTab.dealId) : null, portfolio);
      setTyping(false);
      appendMessage({ who: 'y', text: reply.text, cards: reply.cards, progress: reply.progress, spawnTabs: reply.spawnTabs });
      /* Spawn tabs + open the LAST one in canvas */
      if (reply.spawnTabs) {
        reply.spawnTabs.forEach((sp, i) => {
          setTimeout(() => openTab(sp), 200 + i * 180);
        });
      } else if (reply.cards && reply.cards.length > 0) {
        /* If Yulia produced a card, also open it in canvas automatically */
        const k = reply.cards[0];
        const dealForCard = activeTab && activeTab.dealId ? window.DEALS.find(d => d.id === activeTab.dealId) : null;
        if (k === 'compare') {
          const live = window.DEALS.filter(d => portfolio.dealIds.includes(d.id) && d.score).slice(0, 3);
          setTimeout(() => openTab({ kind: 'compare', dealIds: live.map(d => d.id), label: 'Compare · Live deals' }), 350);
        } else if (dealForCard) {
          const labelMap = { rundown: 'Rundown', dd: 'DD pack', loi: 'LOI', model: 'DCF', chart: 'Revenue' };
          setTimeout(() => openTab({
            kind: k === 'model' ? 'model' : (k === 'chart' ? 'deal' : k),
            dealId: dealForCard.id,
            label: `${dealForCard.name} · ${labelMap[k] || k}`,
            sub: dealForCard.kicker,
          }), 350);
        }
      }
    }, 800);
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

  return (
    <div className="host" data-density={state.density}>
      <div className="host__bar">
        <div className="host__brand">smbx.ai <span>· internal</span></div>
        <div className="host__toggle">
          <button className={state.mode === 'desktop' ? 'active' : ''} onClick={() => set({ mode: 'desktop' })}>Desktop</button>
          <button className={state.mode === 'mobile' ? 'active' : ''} onClick={() => set({ mode: 'mobile' })}>Mobile</button>
        </div>
        <div style={{ width: 160, textAlign: 'right', fontSize: 11, color: '#9A9A9F', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>
          {state.mode === 'desktop' ? 'CHAT-FIRST · 3 PANE' : 'MOBILE APP'}
        </div>
      </div>

      <div className="host__stage">
        {state.mode === 'desktop' ? (
          <div className="v3" data-layout={state.layout} data-rail={state.railShown ? 'shown' : 'hidden'} data-chat-width={state.chatWidth}>
            <V3Chat
              portfolio={portfolio}
              onPortfolioChange={changePortfolio}
              activeRailId="chat"
              onRailPick={() => {}}
              threads={[{ id: 'main', title: `${portfolio.name} · Main`, preview: messages[messages.length - 1]?.text?.replace(/<[^>]+>/g, '').slice(0, 60) || '—', when: 'now', msgCount: messages.length }]}
              activeThreadId="main"
              onPickThread={() => {}}
              onNewThread={() => { setChatsByPortfolio(m => { const n = { ...m, [portfolio.id]: [] }; v3SaveChats(n); return n; }); }}
              messages={messages}
              onSend={handleSend}
              isTyping={typing}
              onOpenArtifact={openTab}
              tabsCount={session.tabs.length}
            />

            <V3Canvas
              tab={activeTab}
              portfolio={portfolio}
              onCloseTab={closeTab}
              onSend={handleSend}
              onOpenTab={openTab}
            />

            {state.railShown && (
              <V3Rail
                tabs={session.tabs}
                activeTabId={session.activeTabId}
                onSwitch={switchTab}
                onClose={closeTab}
                onReorder={reorderTabs}
                onHide={() => set({ railShown: false })}
                portfolio={portfolio}
              />
            )}
            {!state.railShown && (
              <button className="v3-rail__stub" onClick={() => set({ railShown: true })} title="Show documents">
                <span>DOCUMENTS</span>
                <span className="v3-rail__stub-c">{session.tabs.length}</span>
              </button>
            )}
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
                <div className="tweaks__lbl">Layout</div>
                <div className="tweaks__seg tweaks__seg--stack">
                  <button className={state.layout === 'three-pane' ? 'active' : ''} onClick={() => set({ layout: 'three-pane' })}>3-pane (Chat · Canvas · Tabs)</button>
                  <button className={state.layout === 'chat-sidebar' ? 'active' : ''} onClick={() => set({ layout: 'chat-sidebar' })}>Chat sidebar + tabs above canvas</button>
                  <button className={state.layout === 'floating-tabs' ? 'active' : ''} onClick={() => set({ layout: 'floating-tabs' })}>Floating tab dock (right overlay)</button>
                </div>
              </div>
              <div className="tweaks__row">
                <div className="tweaks__lbl">Chat width</div>
                <div className="tweaks__seg">
                  <button className={state.chatWidth === 'narrow' ? 'active' : ''} onClick={() => set({ chatWidth: 'narrow' })}>Narrow</button>
                  <button className={state.chatWidth === 'normal' ? 'active' : ''} onClick={() => set({ chatWidth: 'normal' })}>Normal</button>
                  <button className={state.chatWidth === 'wide' ? 'active' : ''} onClick={() => set({ chatWidth: 'wide' })}>Wide</button>
                </div>
              </div>
              <div className="tweaks__row">
                <div className="tweaks__lbl">Docs rail</div>
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
                  <button onClick={() => { localStorage.removeItem('smbx-v3-session'); localStorage.removeItem('smbx-v3-chats'); location.reload(); }}>Reset</button>
                </div>
              </div>
            </>}
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<V3App />);
