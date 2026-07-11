/**
 * The Yulia intake card — the landing page's core conversion mechanism.
 * Scripted 3-step intake exactly per the corpdevservices README (thesis →
 * size/geography → email), with a typing indicator, then the inline
 * "Book your advisor call" pill. The captured lead persists via
 * /api/practice/leads the moment the email lands (even if they never book).
 * A real LLM-backed intake can replace the script later without changing
 * this card's shape.
 */
import { useEffect, useRef, useState } from 'react';
import { postPracticeLead, bookHref, bookTarget } from './leads';

interface Msg { from: 'y' | 'u'; text: string; }

const OPENING = "Hi — I'm Yulia. Tell me what you're looking to acquire and I'll start mapping the market tonight. What's the thesis?";

const REPLIES = [
  'Got it. What size are you targeting — revenue or EBITDA range — and any geography?',
  'Perfect. Last one: best email for your first market map?',
  "Done — I'm starting on your thesis now. You'll have a first pass within 24 hours. Want to lock in time with your advisor?",
];

const HINTS = [
  'e.g. "HVAC roll-up in the Southeast"',
  'e.g. "$2–5M EBITDA, within 4 hours of Atlanta"',
  'you@firm.com',
  'Yulia is on it — book your call above',
];

export default function YuliaIntake() {
  const [messages, setMessages] = useState<Msg[]>([{ from: 'y', text: OPENING }]);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const answersRef = useRef<string[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  const send = () => {
    const text = draft.trim();
    if (!text || step >= 3 || typing) return;
    answersRef.current[step] = text;
    setMessages(m => [...m, { from: 'u', text }]);
    setDraft('');
    setTyping(true);
    const current = step;
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { from: 'y', text: REPLIES[current] }]);
      setStep(current + 1);
      if (current === 2) {
        // Email captured → persist the full lead, whether or not they book.
        const [thesis, size, email] = answersRef.current;
        postPracticeLead({ thesis, size, email, source: 'landing-yulia' });
      }
    }, 550);
  };

  return (
    <div id="yulia" className="pd-chat">
      <div className="pd-chat-head">
        <div className="pd-avatar">Y</div>
        <div style={{ fontWeight: 700, fontSize: 15 }}>Yulia</div>
        <div className="pd-mono" style={{ fontSize: 11 }}>smbX INTAKE</div>
        <div className="pd-online"><span className="dot" />online</div>
      </div>
      <div className="pd-msgs" ref={listRef}>
        {messages.map((m, i) => (
          <div className="pd-msgrow" key={i}>
            <div className={`pd-bub ${m.from === 'y' ? 'pd-bub-y' : 'pd-bub-u'}`}>{m.text}</div>
          </div>
        ))}
        {typing && (
          <div className="pd-msgrow">
            <div className="pd-bub pd-bub-y">
              <span className="pd-typing"><span /><span /><span /></span>
            </div>
          </div>
        )}
        {step >= 3 && (
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
          placeholder={HINTS[Math.min(step, 3)]}
          disabled={step >= 3}
          aria-label="Message Yulia"
        />
        <button type="button" className="pd-send" onClick={send} disabled={step >= 3}>Send</button>
      </div>
    </div>
  );
}
