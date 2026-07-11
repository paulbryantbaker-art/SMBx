/**
 * The Yulia intake card — the landing page's core conversion mechanism.
 * Backed by Claude via POST /api/practice/intake (Paul, 2026-07-11): Yulia
 * converses about the visitor's acquisition thesis; the server closes
 * deterministically the moment an email lands in the conversation — persists
 * the lead and returns the fixed close message — then the inline
 * "Book your advisor call" pill appears. A scripted server-side fallback
 * keeps the card alive if the model is unavailable.
 */
import { useEffect, useRef, useState } from 'react';
import { bookHref, bookTarget } from './leads';

interface Msg { from: 'y' | 'u'; text: string; }

const OPENING_1 =
  "I'm Yulia — I do the analytical work here at smbX. Tell me what you're trying to buy and I'll map the market for you, then get you in front of Paul with something real to talk about.";
const OPENING_2 =
  'To start: what kind of business are you looking to acquire, and roughly what size?';

const HINTS = [
  'e.g. "HVAC roll-up in the Southeast"',
  'e.g. "$2–5M EBITDA, within 4 hours of Atlanta"',
  'you@firm.com',
  'Yulia is on it — book your call above',
];

export default function YuliaIntake() {
  const [messages, setMessages] = useState<Msg[]>([
    { from: 'y', text: OPENING_1 },
    { from: 'y', text: OPENING_2 },
  ]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, pending]);

  const userTurns = messages.filter(m => m.from === 'u').length;
  const hint = done ? HINTS[3] : HINTS[Math.min(userTurns, 2)];

  const send = async () => {
    const text = draft.trim();
    if (!text || done || pending) return;
    const next: Msg[] = [...messages, { from: 'u', text }];
    setMessages(next);
    setDraft('');
    setPending(true);
    try {
      const res = await fetch('/api/practice/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map(m => ({ role: m.from === 'y' ? 'assistant' : 'user', content: m.text })),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { reply: string; done: boolean };
      setMessages(m => [...m, { from: 'y', text: data.reply }]);
      if (data.done) setDone(true);
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
        <div className="pd-online"><span className="dot" />online</div>
      </div>
      <div className="pd-msgs" ref={listRef}>
        {messages.map((m, i) => (
          <div className="pd-msgrow" key={i}>
            <div className={`pd-bub ${m.from === 'y' ? 'pd-bub-y' : 'pd-bub-u'}`}>{m.text}</div>
          </div>
        ))}
        {pending && (
          <div className="pd-msgrow">
            <div className="pd-bub pd-bub-y">
              <span className="pd-typing"><span /><span /><span /></span>
            </div>
          </div>
        )}
        {done && (
          <div style={{ display: 'flex', padding: '2px 0 10px' }}>
            <a className="pd-pill-primary" style={{ padding: '13px 26px' }} href={bookHref()} target={bookTarget()} rel={bookTarget() ? 'noreferrer' : undefined}>
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
