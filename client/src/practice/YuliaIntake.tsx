/**
 * The Yulia intake card — the landing page's core conversion mechanism.
 * Claude-backed via POST /api/practice/intake, value-before-ask: Yulia
 * delivers a directional first read of the visitor's market, rendered as a
 * titled DOCUMENT (visual brief: "the market map must look like a
 * deliverable, not a chat message"), then asks for the email; the server
 * closes deterministically (lead persisted, fixed close) the moment an email
 * appears. Dignified progress ("Step n of 4"), calm working indicator (no
 * bouncing dots), full funnel instrumentation.
 */
import { useEffect, useRef, useState } from 'react';
import { bookHref, bookTarget } from './leads';
import { trackEvent } from '../lib/analytics';

interface Read { title: string; thesis: string; market: string; buyers: string; fullmap: string; }
interface Msg { from: 'y' | 'u'; text?: string; read?: Read; }

const OPENING_1 =
  "I'm Yulia — I do the analytical work here at smbX. Tell me what you're trying to buy and I'll give you my first read on the market, then get you in front of Paul with something real to talk about.";
const OPENING_2 =
  'To start: what kind of business are you looking to acquire, and roughly what size?';

const HINTS = [
  'e.g. "HVAC roll-up in the Southeast"',
  'e.g. "$2–5M EBITDA, within 4 hours of Atlanta"',
  'you@firm.com',
  'Yulia is on it — book your call above',
];

// Fallback funnel heuristic when the read arrives unstructured.
const READ_LENGTH_THRESHOLD = 350;

function ReadDoc({ read }: { read: Read }) {
  return (
    <div className="pd-doc">
      <div className="doc-head">
        <span className="doc-mark">smb<span style={{ color: 'var(--pd-coral)' }}>X</span></span>
        <span className="doc-label">PRELIMINARY MARKET READ</span>
      </div>
      <div className="doc-title">{read.title}</div>
      {read.thesis && <div className="doc-thesis">{read.thesis}</div>}
      <div className="doc-sec"><div className="k">MARKET</div><div className="v">{read.market}</div></div>
      {read.buyers && <div className="doc-sec"><div className="k">WHO ELSE IS BUYING</div><div className="v">{read.buyers}</div></div>}
      {read.fullmap && <div className="doc-sec"><div className="k">WHAT THE FULL MAP ADDS</div><div className="v">{read.fullmap}</div></div>}
      <div className="doc-foot">PRELIMINARY &amp; DIRECTIONAL — THE FULL MAP FOLLOWS WITHIN 24 HOURS</div>
    </div>
  );
}

export default function YuliaIntake() {
  const [messages, setMessages] = useState<Msg[]>([
    { from: 'y', text: OPENING_1 },
    { from: 'y', text: OPENING_2 },
  ]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const readTracked = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, pending]);

  const userTurns = messages.filter(m => m.from === 'u').length;
  const step = done ? 4 : Math.min(userTurns + 1, 3);
  const hint = done ? HINTS[3] : HINTS[Math.min(userTurns, 2)];

  const trackRead = () => {
    if (readTracked.current) return;
    readTracked.current = true;
    trackEvent('practice_read_delivered');
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
    try {
      const res = await fetch('/api/practice/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next
            .filter(m => m.text)
            .map(m => ({ role: m.from === 'y' ? 'assistant' : 'user', content: m.text as string })),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { reply: string; done: boolean; read: Read | null };
      setMessages(m => {
        const out = [...m];
        if (data.read) out.push({ from: 'y', read: data.read });
        out.push({ from: 'y', text: data.reply });
        return out;
      });
      if (data.read) trackRead();
      else if (!data.done && data.reply.length >= READ_LENGTH_THRESHOLD) trackRead();
      if (data.done) {
        setDone(true);
        trackEvent('practice_email_captured');
      }
    } catch {
      setMessages(m => [...m, {
        from: 'y',
        text: 'Hit a connection hiccup on my side — mind sending that once more?',
      }]);
    } finally {
      setPending(false);
    }
  };

  return (
    <div id="yulia" className="pd-chat">
      <div className="pd-chat-head">
        <div className="pd-avatar">Y</div>
        <div style={{ fontWeight: 700, fontSize: 15 }}>Yulia</div>
        <div className="pd-online">
          <span style={{ color: 'var(--pd-tert)', marginRight: 12 }}>Step {step} of 4</span>
          <span className="dot" />online
        </div>
      </div>
      <div className="pd-msgs" ref={listRef}>
        {messages.map((m, i) => (
          m.read ? (
            <div className="pd-msgrow" key={i}>
              <ReadDoc read={m.read} />
            </div>
          ) : (
            <div className="pd-msgrow" key={i}>
              <div className={`pd-bub ${m.from === 'y' ? 'pd-bub-y' : 'pd-bub-u'}`}>{m.text}</div>
            </div>
          )
        ))}
        {pending && (
          <div className="pd-msgrow">
            <div className="pd-working">{userTurns >= 2 ? 'Yulia is reading the market…' : 'Yulia is working…'}</div>
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
              onClick={() => trackEvent('practice_booking_clicked', { placement: 'chat-pill' })}
            >
              Book your advisor call →
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
          aria-label="Message Yulia"
        />
        <button type="button" className="pd-send" onClick={send} disabled={done || pending}>Send</button>
      </div>
    </div>
  );
}
