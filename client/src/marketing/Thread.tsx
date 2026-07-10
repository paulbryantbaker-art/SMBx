/**
 * The conversation thread (wireframes 5j / 4c / 5m "message rendering"):
 *   - user: right-aligned terra-soft bubble — the ONLY terra-soft surface
 *   - Yulia: NO bubble — plain text on the page bg, avatar alongside, and any
 *     money range typographically promoted to display scale (the CashApp
 *     "balance" treatment; result-card variant 1i-i, inline strip)
 *   - quick replies: pill row after her turns; primary pill terra-outlined
 *   - email ask: in-stream card, never a modal; skippable; value never gated
 *
 * Data source is the existing anonymous funnel (useMarketingChat): real
 * computed answers, no scripted demo content.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import type { MktMsg, MktGate } from './useMarketingChat';

/* Promote money ranges inside Yulia's prose. Only the HERO datum of a message
   (the largest range, wireframe 5m: "terra ONLY when it's the hero datum" —
   here: display scale only for the hero) gets the CashApp balance treatment;
   supporting ranges are merely bold. Text stays text — typography, not content. */
const RANGE_RE = /\$\d[\d,.]*\s?[KMB]?\s?[–—-]\s?\$\d[\d,.]*\s?[KMB]?/g;

function rangeMagnitude(range: string): number {
  const m = range.match(/\$(\d[\d,.]*)\s?([KMB])?/);
  if (!m) return 0;
  const n = parseFloat(m[1].replace(/,/g, ''));
  const mult = m[2] === 'B' ? 1e9 : m[2] === 'M' ? 1e6 : m[2] === 'K' ? 1e3 : 1;
  return n * mult;
}

export function renderYuliaText(text: string): ReactNode[] {
  const heroMag = Math.max(0, ...[...text.matchAll(RANGE_RE)].map(m => rangeMagnitude(m[0])));
  const out: ReactNode[] = [];
  const paragraphs = text.split(/\n{2,}/);
  paragraphs.forEach((para, pi) => {
    const nodes: ReactNode[] = [];
    let last = 0;
    for (const m of para.matchAll(RANGE_RE)) {
      const i = m.index ?? 0;
      if (i > last) nodes.push(para.slice(last, i));
      const range = m[0].replace(/\s?[–—-]\s?/, '–');
      const [a, b] = range.split('–');
      const isHero = heroMag > 0 && rangeMagnitude(m[0]) === heroMag;
      nodes.push(
        isHero ? (
          <span className="mk-range" key={`r${pi}-${i}`}>
            {a}
            <span className="dash">–</span>
            {b}
          </span>
        ) : (
          <b key={`r${pi}-${i}`}>{a}–{b}</b>
        ),
      );
      last = i + m[0].length;
    }
    if (last < para.length) nodes.push(para.slice(last));
    out.push(<p key={pi}>{nodes}</p>);
  });
  return out;
}

function YuliaMsg({ children }: { children: ReactNode }) {
  return (
    <div className="mk-msg-yulia">
      <span className="mk-yulia-avatar" aria-hidden="true">Y</span>
      <div className="mk-msg-yulia-body">{children}</div>
    </div>
  );
}

/** In-stream email card — account creation framed as delivery, skippable. */
function EmailCard({ prompt, onSkip }: { prompt: string; onSkip?: () => void }) {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState('');
  const go = () => {
    const v = email.trim();
    if (!v) return;
    navigate(`/signup?email=${encodeURIComponent(v)}`);
  };
  return (
    <div className="mk-stream-card">
      <div style={{ fontSize: 14.5, lineHeight: 1.5 }}>{prompt}</div>
      <div className="mk-email-row">
        <input
          type="email"
          value={email}
          placeholder="you@company.com"
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') go(); }}
        />
        <button type="button" className="mk-email-send" onClick={go} aria-label="Continue with this email">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {onSkip && (
        <button type="button" className="mk-skip" onClick={onSkip}>
          Just show me here
        </button>
      )}
    </div>
  );
}

export interface ThreadProps {
  messages: MktMsg[];
  streamingText: string;
  sending: boolean;
  gate: MktGate;
  error: string | null;
  quickReplies: string[];
  onQuickReply: (text: string) => void;
}

export function Thread({ messages, streamingText, sending, gate, error, quickReplies, onQuickReply }: ThreadProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const [emailSkipped, setEmailSkipped] = useState(false);

  // Follow the stream: keep the newest turn in view.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, streamingText, gate]);

  const lastIsYulia = messages.length > 0 && messages[messages.length - 1].role === 'assistant';
  const showQuick = lastIsYulia && !sending && !gate && quickReplies.length > 0;

  const gatePrompt = useMemo(() => {
    if (gate === 'limit') {
      return 'I can keep going — I’ll put your full Baseline™ together and save everything we’ve covered. Where should I send it?';
    }
    if (gate === 'session') {
      return 'To pick this up and keep your work saved, tell me where to send it.';
    }
    return null;
  }, [gate]);

  return (
    <div className="mk-thread">
      <div className="mk-thread-inner">
        {messages.map(m =>
          m.role === 'user' ? (
            <div className="mk-msg-user" key={m.id}>{m.content}</div>
          ) : (
            <YuliaMsg key={m.id}>{renderYuliaText(m.content)}</YuliaMsg>
          ),
        )}

        {streamingText && <YuliaMsg>{renderYuliaText(streamingText)}</YuliaMsg>}

        {sending && !streamingText && (
          <YuliaMsg>
            <span className="mk-typing" aria-label="Yulia is thinking">
              <span className="dot">●</span> <span className="dot">●</span> <span className="dot">●</span>
            </span>
          </YuliaMsg>
        )}

        {showQuick && (
          <div className="mk-quick">
            {quickReplies.map((q, i) => (
              <button
                type="button"
                key={q}
                className={`mk-chip${i === 0 ? ' is-primary' : ''}`}
                onClick={() => onQuickReply(q)}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {gatePrompt && !emailSkipped && (
          <EmailCard
            prompt={gatePrompt}
            onSkip={gate === 'limit' ? undefined : () => setEmailSkipped(true)}
          />
        )}

        {error && <div className="mk-note" role="alert">{error}</div>}

        <div ref={endRef} />
      </div>
    </div>
  );
}
