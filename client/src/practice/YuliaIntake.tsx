/**
 * The intake card — publicly the "smbX Target Mapping Engine" (Paul's copy
 * update, 2026-07-12: the Yulia name stays app-side; this surface speaks as
 * the firm's system). The landing page's core conversion mechanism.
 *
 * Market Map spec (2026-07-12): the visitor describes a thesis; Yulia
 * delivers an 8-block MARKET MAP that assembles in front of them as the
 * model actually writes it (SSE streaming — the reveal is real work made
 * legible, never a staged spinner; JSON fallback typesets the finished map
 * with a short stagger). The artifact reads as institutional research —
 * titled, dated, funnel numbers at display scale, the insight block last and
 * biggest, sources footer, PDF built for the forward. Email is asked only
 * AFTER the map is visible, framed as delivery; the server closes
 * deterministically (lead persisted, honest lane check) the moment an email
 * appears. Full funnel instrumentation, including dwell time on the artifact.
 */
import { useEffect, useRef, useState } from 'react';
import { bookHref, bookTarget } from './leads';
import { trackEvent } from '../lib/analytics';

interface FunnelStep { n: string; label: string; }
interface MapData {
  title: string;
  thesis: string;
  verdict: 'PROCEED' | 'PUSHBACK';
  answer: string;
  funnel: FunnelStep[];
  econ: string;
  comp: string;
  insight: string;
  kill: string;
  produces: string;
  sources: string;
}
type PartialMap = Partial<Omit<MapData, 'funnel'>> & { funnel: FunnelStep[] };
interface Msg { from: 'y' | 'u'; text?: string; map?: MapData; }

const OPENING =
  "Let's outline your acquisition thesis to generate a preliminary market map. Our engine takes about two minutes to process your criteria. Ready?";

const HINTS = [
  'Sector & Strategy (e.g., "HVAC roll-up in the Southeast")',
  'Size & Geography (e.g., "$2–5M EBITDA, within 4 hours of Atlanta")',
  'Delivery Email (e.g., "director@fund.com")',
  'Generation complete. Your map is being compiled. Book your consultation above.',
];

/** The send button rotates with the step (Paul's copy update, Y-4). */
const SEND_LABELS = ['Continue', 'Generate Map', 'Send', 'Send'];

/** Narration for the block currently being written — shown while the map
 *  streams, so the work is legible without pretending anything. System
 *  voice (Target Mapping Engine), not a persona. */
const NARRATE: Record<string, string> = {
  TITLE: 'Processing your thesis…',
  THESIS: 'Processing your thesis…',
  VERDICT: 'Running the verdict…',
  ANSWER: 'Writing the straight answer…',
  U1: 'Mapping the universe…',
  U2: 'Filtering for your size band…',
  U3: 'Screening for fit…',
  ECON: 'Compiling the economics…',
  COMP: 'Reading the competitive field…',
  INSIGHT: 'Isolating what most buyers miss…',
  KILL: 'Stress-testing the thesis…',
};

const FIELD_RE = /(?:^|\n)\s*(TITLE|THESIS|VERDICT|ANSWER|U1|U2|U3|ECON|COMP|INSIGHT|KILL):/g;

interface StreamView {
  inMap: boolean;
  preText: string;
  partial: PartialMap | null;
  narration: string | null;
}

/** Incremental parse of the accumulating model text: fields render the moment
 *  they complete (the next header has arrived), never mid-sentence. */
function parseStreaming(acc: string): StreamView {
  const mapStart = acc.indexOf('===MAP===');
  if (mapStart === -1) {
    // Strip a possibly half-arrived marker so it never flashes as prose.
    const preText = acc.replace(/\n?=+[A-Z]*=*\s*$/, '').trim();
    return { inMap: false, preText, partial: null, narration: null };
  }
  const preText = acc.slice(0, mapStart).trim();
  const endIdx = acc.indexOf('===END===');
  const closed = endIdx !== -1;
  const block = closed ? acc.slice(mapStart + 9, endIdx) : acc.slice(mapStart + 9);

  const found: { name: string; start: number; valStart: number }[] = [];
  const re = new RegExp(FIELD_RE.source, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(block))) found.push({ name: m[1], start: m.index, valStart: m.index + m[0].length });

  const vals: Record<string, string> = {};
  found.forEach((f, i) => {
    const isLast = i === found.length - 1;
    if (isLast && !closed) return; // still being written
    const raw = block.slice(f.valStart, isLast ? undefined : found[i + 1].start);
    vals[f.name] = raw.trim().replace(/\s+/g, ' ');
  });

  const step = (name: string): FunnelStep | null => {
    const raw = vals[name];
    if (!raw) return null;
    const bar = raw.indexOf('|');
    if (bar === -1) return { n: '—', label: raw };
    return { n: raw.slice(0, bar).trim() || '—', label: raw.slice(bar + 1).trim() };
  };
  const partial: PartialMap = {
    title: vals.TITLE,
    thesis: vals.THESIS,
    verdict: vals.VERDICT?.toUpperCase() === 'PUSHBACK' ? 'PUSHBACK' : 'PROCEED',
    answer: vals.ANSWER,
    funnel: [step('U1'), step('U2'), step('U3')].filter((s): s is FunnelStep => s !== null && !!s.label),
    econ: vals.ECON,
    comp: vals.COMP,
    insight: vals.INSIGHT,
    kill: vals.KILL,
  };
  const current = !closed && found.length > 0 ? found[found.length - 1].name : null;
  const narration = closed ? null : (current ? NARRATE[current] : 'Assembling your market read…');
  return { inMap: true, preText, partial, narration };
}

/** Consume the SSE intake stream. Returns the authoritative final payload,
 *  or null if the transport failed before any content arrived (safe to fall
 *  back to the JSON endpoint). Throws after partial content. */
async function streamIntake(
  payload: { role: string; content: string }[],
  onAccum: (acc: string) => void,
): Promise<{ reply: string; done: boolean; map: MapData | null }> {
  const res = await fetch('/api/practice/intake/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: payload }),
  });
  if (!res.ok || !res.body) throw Object.assign(new Error('transport'), { clean: true });
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let acc = '';
  let gotContent = false;
  let final: { reply: string; done: boolean; map: MapData | null } | null = null;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split('\n\n');
    buffer = frames.pop() || '';
    for (const frame of frames) {
      const eventLine = frame.split('\n').find(l => l.startsWith('event:'));
      const dataLine = frame.split('\n').find(l => l.startsWith('data:'));
      if (!eventLine || !dataLine) continue;
      const event = eventLine.slice(6).trim();
      let data: any;
      try { data = JSON.parse(dataLine.slice(5)); } catch { continue; }
      if (event === 'delta' && typeof data.t === 'string') {
        gotContent = true;
        acc += data.t;
        onAccum(acc);
      } else if (event === 'final') {
        final = data;
      } else if (event === 'error') {
        throw Object.assign(new Error('server'), { clean: !gotContent });
      }
    }
  }
  if (!final) throw Object.assign(new Error('incomplete'), { clean: !gotContent });
  return final;
}

const DOC_DATE = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

function MapDoc({
  map, final = false, staggered = false, onPdf, pdfState,
}: {
  map: PartialMap;
  final?: boolean;
  staggered?: boolean;
  onPdf?: () => void;
  pdfState?: 'idle' | 'busy' | 'error';
}) {
  const pushback = map.verdict === 'PUSHBACK';
  let blockIndex = 0;
  const rise = () => (staggered ? { animationDelay: `${blockIndex++ * 110}ms` } : undefined);

  return (
    <div className="pd-map">
      <div className="map-head" style={rise()}>
        <span className="map-mark">smb<span style={{ color: 'var(--pd-coral)' }}>X</span></span>
        <span className="map-label">PRELIMINARY MARKET READ · {DOC_DATE.toUpperCase()}</span>
      </div>
      {map.title && <div className="map-title" style={rise()}>{map.title}</div>}
      {map.thesis && <div className="map-thesis" style={rise()}>{map.thesis}</div>}
      {pushback && map.answer && (
        <div className="map-answer" style={rise()}>
          <div className="k">STRAIGHT ANSWER</div>
          <div className="v">{map.answer}</div>
        </div>
      )}
      {map.funnel.length > 0 && (
        <div className="map-funnel" style={rise()}>
          <div className="k">{pushback ? 'THE EVIDENCE' : 'THE UNIVERSE'}</div>
          {map.funnel.map((s, i) => (
            <div className="map-step" key={i} style={staggered ? { animationDelay: `${blockIndex * 110 + i * 110}ms` } : undefined}>
              <div className="n">{s.n}</div>
              <div className="l">{s.label}</div>
            </div>
          ))}
        </div>
      )}
      {map.econ && (
        <div className="map-sec" style={rise()}>
          <div className="k">THE ECONOMICS</div>
          <div className="v">{map.econ}</div>
        </div>
      )}
      {map.comp && (
        <div className="map-sec" style={rise()}>
          <div className="k">THE COMPETITIVE PICTURE</div>
          <div className="v">{map.comp}</div>
        </div>
      )}
      {map.insight && (
        <div className="map-insight" style={rise()}>
          <div className="k">{pushback ? 'WHERE CAPITAL WORKS BETTER' : 'WHAT MOST BUYERS MISS'}</div>
          <div className="v">{map.insight}</div>
        </div>
      )}
      {map.kill && (
        <div className="map-sec" style={rise()}>
          <div className="k">WHAT WOULD KILL THIS THESIS</div>
          <div className="v">{map.kill}</div>
        </div>
      )}
      {final && map.produces && (
        <div className="map-sec" style={rise()}>
          <div className="k">WHAT AN ENGAGEMENT PRODUCES</div>
          <div className="v">{map.produces}</div>
        </div>
      )}
      {final && (
        <div className="map-foot" style={rise()}>
          <div className="src">{map.sources}</div>
          {onPdf && (
            <button type="button" className="map-pdf" onClick={onPdf} disabled={pdfState === 'busy'}>
              {pdfState === 'busy' ? 'Preparing…' : pdfState === 'error' ? 'Try the download again' : 'Download the PDF'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function YuliaIntake() {
  const [messages, setMessages] = useState<Msg[]>([{ from: 'y', text: OPENING }]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [live, setLive] = useState<StreamView | null>(null);
  const [done, setDone] = useState(false);
  const [pdfState, setPdfState] = useState<'idle' | 'busy' | 'error'>('idle');
  const mapTracked = useRef(false);
  const dwell = useRef<{ start: number; verdict: string } | null>(null);
  const dwellFired = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);

  const fireDwell = () => {
    if (!dwell.current || dwellFired.current) return;
    dwellFired.current = true;
    trackEvent('practice_map_dwell', {
      seconds: Math.min(600, Math.round((Date.now() - dwell.current.start) / 1000)),
      verdict: dwell.current.verdict,
    });
  };

  useEffect(() => {
    const onHide = () => { if (document.visibilityState === 'hidden') fireDwell(); };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', fireDwell);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', fireDwell);
    };
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    // While the map streams, follow the newest block; once it lands, present
    // the document from its title — not its tail.
    if (!pending && messages.slice(-2).some(m => m.map)) {
      const docs = el.querySelectorAll<HTMLElement>('.pd-map');
      const doc = docs[docs.length - 1];
      if (doc) {
        el.scrollTop += doc.getBoundingClientRect().top - el.getBoundingClientRect().top - 6;
        return;
      }
    }
    el.scrollTop = el.scrollHeight;
  }, [messages, pending, live]);

  const userTurns = messages.filter(m => m.from === 'u').length;
  const step = done ? 3 : Math.min(userTurns, 2);
  const hint = HINTS[step];
  const sendLabel = SEND_LABELS[step];

  const trackMap = (verdict: string) => {
    if (mapTracked.current) return;
    mapTracked.current = true;
    dwell.current = { start: Date.now(), verdict };
    trackEvent('practice_map_delivered', { verdict });
  };

  const applyFinal = (data: { reply: string; done: boolean; map: MapData | null }, streamed: boolean) => {
    setMessages(m => {
      const out = [...m];
      if (data.map) out.push({ from: 'y', map: data.map });
      if (data.reply) out.push({ from: 'y', text: data.reply });
      return out;
    });
    if (data.map) trackMap(data.map.verdict);
    if (data.done) {
      setDone(true);
      trackEvent('practice_email_captured');
    }
    void streamed;
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || done || pending) return;
    if (userTurns === 0) trackEvent('practice_intake_started');
    trackEvent('practice_intake_step', { step: userTurns + 1 });
    const next: Msg[] = [...messages, { from: 'u', text }];
    setMessages(next);
    setDraft('');
    setPending(true);
    setLive(null);
    const payload = next
      .filter(m => m.text)
      .map(m => ({ role: m.from === 'y' ? 'assistant' : 'user', content: m.text as string }));
    try {
      const data = await streamIntake(payload, acc => setLive(parseStreaming(acc)));
      applyFinal(data, true);
    } catch (err: any) {
      if (err?.clean) {
        // Transport failed before content — the plain JSON endpoint still works.
        try {
          const res = await fetch('/api/practice/intake', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: payload }),
          });
          if (!res.ok) throw new Error(String(res.status));
          applyFinal(await res.json(), false);
        } catch {
          setMessages(m => [...m, { from: 'y', text: 'Connection interrupted — please submit your criteria once more.' }]);
        }
      } else {
        setMessages(m => [...m, { from: 'y', text: 'Connection interrupted — please submit your criteria once more.' }]);
      }
    } finally {
      setPending(false);
      setLive(null);
    }
  };

  const downloadPdf = async (map: MapData) => {
    if (pdfState === 'busy') return;
    setPdfState('busy');
    try {
      const res = await fetch('/api/practice/map-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ map }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'smbX-market-map.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      trackEvent('practice_map_pdf_downloaded');
      setPdfState('idle');
    } catch {
      setPdfState('error');
    }
  };

  // The map streams into view before the final payload confirms it — count
  // delivery from the first fully-assembled streaming render too.
  const liveMapVisible = pending && live?.inMap && live.partial;

  return (
    <div id="yulia" className="pd-chat">
      <div className="pd-chat-head">
        <div style={{ fontWeight: 800, fontSize: 17 }}>
          smb<span style={{ color: 'var(--pd-coral)' }}>X</span> Target Mapping Engine
        </div>
      </div>
      <div className="pd-msgs" ref={listRef}>
        {messages.map((m, i) => (
          m.map ? (
            <div className="pd-msgrow" key={i}>
              <MapDoc map={m.map} final staggered={false} onPdf={() => downloadPdf(m.map!)} pdfState={pdfState} />
            </div>
          ) : (
            <div className="pd-msgrow" key={i}>
              <div className={`pd-bub ${m.from === 'y' ? 'pd-bub-y' : 'pd-bub-u'}`}>
                {m.from === 'y' && m.text
                  ? m.text.split('\n\n').map((p, j) => <p key={j} style={{ margin: j === 0 ? 0 : '10px 0 0' }}>{p}</p>)
                  : m.text}
              </div>
            </div>
          )
        ))}
        {pending && live?.preText && (
          <div className="pd-msgrow">
            <div className="pd-bub pd-bub-y">{live.preText}</div>
          </div>
        )}
        {liveMapVisible && (
          <div className="pd-msgrow">
            <MapDoc map={live!.partial!} />
          </div>
        )}
        {pending && (
          <div className="pd-msgrow">
            <div className="pd-working">{live?.narration || 'Compiling market data…'}</div>
          </div>
        )}
        {done && (
          <div style={{ display: 'flex', padding: '2px 0 10px' }}>
            <a
              className="pd-pill-primary"
              style={{ padding: '13px 26px' }}
              href={bookHref()}
              target={bookTarget()}
              rel={bookTarget() ? 'noreferrer' : undefined}
              onClick={() => { fireDwell(); trackEvent('practice_booking_clicked', { placement: 'chat-pill' }); }}
            >
              Book your consultation →
            </a>
          </div>
        )}
      </div>
      <div className="pd-chat-inputrow">
        <input
          className="pd-chat-input"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send(); }}
          placeholder={hint}
          disabled={done}
          aria-label="Describe your acquisition criteria"
        />
        <button type="button" className="pd-send" onClick={send} disabled={done || pending}>{sendLabel}</button>
      </div>
    </div>
  );
}
