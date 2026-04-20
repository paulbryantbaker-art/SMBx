/* ═══════════════════════════════════════════════════════════
   Desktop shared — icons, Msg, ChatPane
   Rail + Workbench have been replaced by Dealbar + Workspace (tabs)
   ═══════════════════════════════════════════════════════════ */

const { useState, useEffect, useRef, useMemo } = React;

const IC = {
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>,
  search: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>,
  send: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10" /></svg>,
  attach: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 11l-9 9a5 5 0 0 1-7-7l9-9a3 3 0 0 1 4 4l-9 9a1 1 0 0 1-2-2l8-8" /></svg>,
  spark: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>,
  collapse: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></svg>,
  chart: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3v18h18M8 15V9M13 15V5M18 15v-4" /></svg>,
  doc: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6" /></svg>,
  stack: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" /></svg>,
};

const CARD_LABEL = {
  rundown: 'Rundown',
  dd: 'DD pack',
  loi: 'LOI structures',
  model: 'DCF model',
  compare: 'Portfolio compare',
  chart: 'Revenue trend',
};

const CARD_ICON = {
  rundown: IC.chart,
  dd: IC.doc,
  loi: IC.doc,
  model: IC.chart,
  compare: IC.stack,
  chart: IC.chart,
};

/* ── Message bubble ───────────────────────────── */
function Msg({ who, text, cards: cardKinds, deal, onOpenArtifact, progress, spawnTabs }) {
  const cards = cardKinds || [];
  return (
    <div className={'msg msg--' + who}>
      <div className="msg__meta">
        {who === 'y' ? <><span className="msg__meta-avatar">Y</span> Yulia</> : 'You'}
      </div>
      <div className="msg__bubble" dangerouslySetInnerHTML={{ __html: text }} />
      {progress && (
        <div className="msg__progress">
          {progress.map((p, i) => (
            <div key={i} className="msg__progress-row">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22A755" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 10-10"/></svg>
              <span>{p}</span>
            </div>
          ))}
        </div>
      )}
      {spawnTabs && (
        <div className="msg__spawn">
          <div className="msg__spawn-h">Opened {spawnTabs.length} tabs</div>
          <div className="msg__spawn-chips">
            {spawnTabs.map((s, i) => (
              <button key={i} className="msg__spawn-chip" onClick={() => onOpenArtifact && onOpenArtifact(s)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {cards.map(k => (
        <div key={k} className="msg__card">
          <div className="msg__card-head">
            <div className="msg__card-t">
              {CARD_ICON[k]}
              {CARD_LABEL[k]}{deal && k !== 'compare' ? ` · ${deal.name}` : ''}
            </div>
            {onOpenArtifact && (
              <button className="msg__card-open" onClick={() => onOpenArtifact({ kind: k, dealId: deal ? deal.id : null, label: deal ? `${deal.name} · ${CARD_LABEL[k]}` : CARD_LABEL[k] })}>Open as tab →</button>
            )}
          </div>
          <div className="msg__card-body">
            <InlineArtifact kind={k} deal={deal} />
          </div>
        </div>
      ))}
    </div>
  );
}

function InlineArtifact({ kind, deal }) {
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
          {deal.dims.slice(0, 3).map(d => <DimRow key={d.label} {...d} />)}
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
        <span style={{ fontSize: 12, color: 'var(--gg-mute)', marginLeft: 'auto' }}>Concentration · 38% top-3</span>
      </div>
    );
  }
  if (kind === 'loi') {
    return (
      <div>
        <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em' }}>
          $16.8M
          <span style={{ fontSize: 11, color: 'var(--gg-mute)', marginLeft: 8, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em' }}>70/20/10 · REC</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--gg-ink-2)', marginTop: 6, lineHeight: 1.5 }}>
          Cash / seller note / rollover. Maximizes after-tax NPV.
        </div>
      </div>
    );
  }
  if (kind === 'compare') {
    return <CompareCard deals={window.DEALS.filter(d => d.score).slice(0, 3)} />;
  }
  if (kind === 'model' && deal) {
    return (
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11.5, color: 'var(--gg-ink-2)', lineHeight: 1.6 }}>
        Adjusted EBITDA: <strong style={{ color: 'var(--gg-ink)' }}>$1.24M</strong> · Margin: <strong style={{ color: 'var(--gg-ink)' }}>{deal.ebitda}</strong> · WC peg: <strong style={{ color: 'var(--gg-ink)' }}>$620K</strong>
      </div>
    );
  }
  if (kind === 'chart' && deal) {
    return <ChartCard deal={deal} />;
  }
  return null;
}

function Typing() {
  return (
    <div className="msg">
      <div className="msg__meta"><span className="msg__meta-avatar">Y</span> Yulia</div>
      <div className="typing"><span /><span /><span /></div>
    </div>
  );
}

/* ── Chat pane ────────────────────────────────── */
function ChatPane({ portfolio, activeTab, messages, onSend, isTyping, onOpenArtifact, onCollapse }) {
  const scrollRef = useRef(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const submit = e => {
    e.preventDefault();
    const t = input.trim();
    if (!t) return;
    setInput('');
    onSend(t);
  };

  const deal = activeTab && activeTab.dealId ? window.DEALS.find(d => d.id === activeTab.dealId) : null;

  const chips = useMemo(() => {
    if (!activeTab) return ['Show my portfolio', 'Find new deals', 'Compare all live deals', 'Model DCF on top 3'];
    if (activeTab.kind === 'compare') return ['Which wins on margin?', 'Sensitivity on WACC', 'Export to PDF'];
    if (activeTab.kind === 'portfolio') return ['Flags this week', 'Stack-rank all', 'Which to kill?'];
    if (activeTab.kind === 'model') return ['Change WACC to 12%', 'Sensitivity table', 'Compare to comps'];
    if (deal && deal.stage === 'rundown') return ['Show rundown', 'Drill concentration', 'Run DCF', 'Kill or pursue?'];
    if (deal && deal.stage === 'dd')      return ['DD status', 'Concentration flag', 'Pull QoE', 'Run DCF'];
    if (deal && deal.stage === 'loi')     return ['LOI scenarios', 'Model rollover', 'Compare to Atlas'];
    return ['Run DCF', 'Show rundown', 'Compare to siblings'];
  }, [activeTab, deal]);

  const title = activeTab ? activeTab.label : `${portfolio.name}`;
  const subtitle = activeTab
    ? (deal ? deal.sub : (activeTab.kind === 'compare' ? `${(activeTab.dealIds || []).length} deals` : portfolio.kicker))
    : portfolio.kicker;

  return (
    <section className="center pane">
      <div className="center__head pane__toolbar">
        <div className="center__crumb">
          <strong>{title}</strong>
          <span className="sep">·</span>
          <span>{subtitle}</span>
        </div>
        <div className="center__pills">
          <button className="center__pill pane__collapse-btn" onClick={onCollapse} title="Collapse chat">◱</button>
        </div>
      </div>

      <div className="center__scroll" ref={scrollRef}>
        <div className="chat">
          {messages.map((m, i) => (
            <Msg key={i} {...m} deal={deal} onOpenArtifact={onOpenArtifact} />
          ))}
          {isTyping && <Typing />}
        </div>
      </div>

      <div className="composer">
        <div className="composer__wrap">
          <form className="composer__box" onSubmit={submit}>
            <textarea
              rows="1"
              placeholder={activeTab ? `Ask Yulia about ${activeTab.label}…` : `Ask Yulia about ${portfolio.name}…`}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(e); } }}
            />
            <div className="composer__tools">
              <div className="composer__tool-left">
                <button type="button" className="composer__tool">{IC.attach}<span>Attach</span></button>
                <button type="button" className="composer__tool">{IC.spark}<span>Research</span></button>
              </div>
              <button type="submit" className="composer__send" disabled={!input.trim()}>{IC.send}</button>
            </div>
          </form>
          <div className="composer__chips">
            {chips.map(c => (
              <button key={c} className="composer__chip" onClick={() => onSend(c)}>{c}</button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { ChatPane, IC, CARD_LABEL, CARD_ICON, Msg });
