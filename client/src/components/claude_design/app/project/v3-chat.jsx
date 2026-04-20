/* ═══════════════════════════════════════════════════════════
   v3-chat.jsx — LEFT PANE (dark chat with Yulia)
   Portfolio switcher · Icon rail · Chat thread · Composer
   ═══════════════════════════════════════════════════════════ */

const { useState: cUseState, useRef: cUseRef, useEffect: cUseEffect, useMemo: cUseMemo } = React;

/* Dark-friendly icons */
const V3_IC = {
  new:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  chats:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  deals:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-3V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v3H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/></svg>,
  source: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>,
  lib:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5H6.5A2.5 2.5 0 0 0 4 19.5z"/></svg>,
  set:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  caret:  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>,
  plus:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  send:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10"/></svg>,
  edit:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  notif:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  logo:   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M4 4l16 16M20 4L4 20"/></svg>,
};

const RAIL_TOP = [
  { id: 'new-chat',   label: 'New',     icon: V3_IC.new    },
  { id: 'chats',      label: 'Chats',   icon: V3_IC.chats  },
  { id: 'deals',      label: 'Deals',   icon: V3_IC.deals  },
  { id: 'sourcing',   label: 'Sourcing',icon: V3_IC.source },
  { id: 'library',    label: 'Library', icon: V3_IC.lib    },
  { id: 'settings',   label: 'Settings',icon: V3_IC.set    },
];

/* ── Portfolio switcher (in dark chat) ───────── */
function V3PortfolioSwitch({ portfolio, onChange }) {
  const [open, setOpen] = cUseState(false);
  const ref = cUseRef(null);
  cUseEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div className="v3-psw" ref={ref}>
      <button className="v3-psw__btn" onClick={() => setOpen(v => !v)}>
        <span className="v3-psw__logo">s</span>
        <span className="v3-psw__body">
          <span className="v3-psw__n">{portfolio.name}</span>
          <span className="v3-psw__k">{portfolio.kicker}</span>
        </span>
        <span className="v3-psw__caret">{V3_IC.caret}</span>
      </button>
      {open && (
        <div className="v3-psw__pop">
          <div className="v3-psw__pop-h">PORTFOLIOS</div>
          {window.PORTFOLIOS.map(p => (
            <button
              key={p.id}
              className={'v3-psw__pop-row' + (p.id === portfolio.id ? ' active' : '')}
              onClick={() => { onChange(p.id); setOpen(false); }}
            >
              <span className="v3-psw__pop-logo">{p.name[0]}</span>
              <span className="v3-psw__pop-body">
                <span className="v3-psw__pop-n">{p.name}</span>
                <span className="v3-psw__pop-k">{p.kicker} · {p.dealIds.length} deals</span>
              </span>
              {p.id === portfolio.id && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 12l5 5 10-10"/></svg>
              )}
            </button>
          ))}
          <div className="v3-psw__pop-sep" />
          <button className="v3-psw__pop-row">
            <span className="v3-psw__pop-logo v3-psw__pop-logo--new">+</span>
            <span className="v3-psw__pop-body">
              <span className="v3-psw__pop-n">New portfolio</span>
              <span className="v3-psw__pop-k">Create a new workspace</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Icon rail — horizontal row under portfolio switcher ─── */
function V3IconRail({ activeId, onPick }) {
  return (
    <div className="v3-irail" role="toolbar">
      {RAIL_TOP.map(r => (
        <button
          key={r.id}
          className={'v3-irail__btn' + (activeId === r.id ? ' v3-irail__btn--active' : '')}
          onClick={() => onPick(r.id)}
          title={r.label}
        >
          {r.icon}
          <span className="v3-irail__lbl">{r.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ── Message bubble (dark) ───────────────────── */
function V3Msg({ who, text, progress, spawnTabs, onOpenArtifact }) {
  return (
    <div className={'v3-msg v3-msg--' + who}>
      <div className="v3-msg__meta">
        {who === 'y'
          ? <><span className="v3-msg__meta-av">Y</span> Yulia</>
          : 'You'}
      </div>
      <div className="v3-msg__bubble" dangerouslySetInnerHTML={{ __html: text }} />
      {progress && (
        <div className="v3-msg__progress">
          {progress.map((p, i) => (
            <div key={i} className="v3-msg__progress-row">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22A755" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 10-10"/></svg>
              <span>{p}</span>
            </div>
          ))}
        </div>
      )}
      {spawnTabs && spawnTabs.length > 0 && (
        <div className="v3-msg__spawn">
          <div className="v3-msg__spawn-h">Opened {spawnTabs.length} {spawnTabs.length === 1 ? 'tab' : 'tabs'}</div>
          <div className="v3-msg__spawn-chips">
            {spawnTabs.map((s, i) => (
              <button key={i} className="v3-msg__spawn-chip" onClick={() => onOpenArtifact && onOpenArtifact(s)}>
                <span className="v3-msg__spawn-chip-dot" />
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function V3Typing() {
  return (
    <div className="v3-msg">
      <div className="v3-msg__meta"><span className="v3-msg__meta-av">Y</span> Yulia</div>
      <div className="v3-typing"><span /><span /><span /></div>
    </div>
  );
}

/* ── Chat history overlay ─────────────────────── */
function V3ChatHistory({ threads, activeThreadId, onPick, onClose, onNew }) {
  return (
    <div className="v3-hist">
      <div className="v3-hist__head">
        <div className="v3-hist__t">Chat history</div>
        <button className="v3-hist__x" onClick={onNew} title="New chat">{V3_IC.new}</button>
        <button className="v3-hist__x" onClick={onClose} title="Close">×</button>
      </div>
      <div className="v3-hist__list">
        {threads.map(t => (
          <button
            key={t.id}
            className={'v3-hist__row' + (t.id === activeThreadId ? ' v3-hist__row--active' : '')}
            onClick={() => { onPick(t.id); onClose(); }}
          >
            <span className="v3-hist__row-t">{t.title}</span>
            <span className="v3-hist__row-s">{t.preview}</span>
            <span className="v3-hist__row-k">{t.when} · {t.msgCount} msg</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Chat pane (dark) ────────────────────────── */
function V3Chat({
  portfolio, onPortfolioChange,
  activeRailId, onRailPick,
  threads, activeThreadId, onPickThread, onNewThread,
  messages, onSend, isTyping,
  onOpenArtifact,
  tabsCount,
  user = 'Paul',
}) {
  const [input, setInput] = cUseState('');
  const [historyOpen, setHistoryOpen] = cUseState(false);
  const scrollRef = cUseRef(null);

  cUseEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const submit = e => {
    e && e.preventDefault();
    const t = input.trim();
    if (!t) return;
    setInput('');
    onSend(t);
  };

  const handleRail = id => {
    if (id === 'new-chat') {
      onNewThread();
    } else if (id === 'chats') {
      setHistoryOpen(true);
    } else {
      onRailPick(id);
    }
  };

  const thread = threads.find(t => t.id === activeThreadId) || null;

  /* Contextual chips */
  const chips = cUseMemo(() => {
    if (tabsCount === 0) {
      return [
        'Find live deals in plumbing',
        'Compare my 3 open deals',
        'Model DCF on Atlas',
        'What moved this week?',
      ];
    }
    return [
      'Compare what\u2019s open',
      'Run sensitivity',
      'Share rundown',
      'What would kill this deal?',
    ];
  }, [tabsCount]);

  const empty = messages.length === 0 && !isTyping;

  return (
    <section className="v3-chat">
      <V3PortfolioSwitch portfolio={portfolio} onChange={onPortfolioChange} />
      <V3IconRail activeId={activeRailId} onPick={handleRail} />

      {!empty && (
        <div className="v3-chat__head">
          <div className="v3-chat__head-t">{thread ? thread.title : 'Yulia'}</div>
          <span className="v3-chat__head-k">{portfolio.name.split(' ')[0].toUpperCase()}</span>
          <button className="v3-chat__head-btn" onClick={() => setHistoryOpen(true)} title="Chat history">
            {V3_IC.chats}
          </button>
          <button className="v3-chat__head-btn" onClick={onNewThread} title="New chat">{V3_IC.edit}</button>
        </div>
      )}

      <div className="v3-chat__scroll" ref={scrollRef}>
        {empty ? (
          <div className="v3-chat__empty">
            <div className="v3-chat__empty-logo">{V3_IC.logo}</div>
            <div className="v3-chat__empty-t">What are you working on, {user}?</div>
            <div className="v3-chat__empty-s">
              Tell me what you need — or type <kbd>/</kbd> to log a deal, <kbd>?</kbd> to see prompt ideas, or pick a starter prompt.
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, i) => (
              <V3Msg key={i} {...m} onOpenArtifact={onOpenArtifact} />
            ))}
            {isTyping && <V3Typing />}
          </>
        )}
      </div>

      <div className="v3-comp">
        <form className="v3-comp__box" onSubmit={submit}>
          <button type="button" className="v3-comp__plus" title="Attach">{V3_IC.plus}</button>
          <textarea
            rows="1"
            className="v3-comp__input"
            placeholder="Ready to think…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(e); } }}
          />
          <button type="submit" className="v3-comp__send" disabled={!input.trim()}>{V3_IC.send}</button>
        </form>
        {empty && (
          <div className="v3-comp__chips">
            {chips.map(c => (
              <button key={c} className="v3-comp__chip" onClick={() => onSend(c)}>{c}</button>
            ))}
          </div>
        )}
      </div>

      <div className="v3-chat__footer">
        <div className="v3-chat__avatar">{user[0]}</div>
        <div className="v3-chat__user">
          <div className="v3-chat__user-t">{user} Delgado</div>
          <div className="v3-chat__user-s">PRO · {portfolio.name}</div>
        </div>
        <button className="v3-chat__footer-btn" title="Notifications">{V3_IC.notif}</button>
      </div>

      {historyOpen && (
        <V3ChatHistory
          threads={threads}
          activeThreadId={activeThreadId}
          onPick={onPickThread}
          onClose={() => setHistoryOpen(false)}
          onNew={() => { onNewThread(); setHistoryOpen(false); }}
        />
      )}
    </section>
  );
}

Object.assign(window, { V3Chat, V3Msg, V3Typing, V3_IC });
