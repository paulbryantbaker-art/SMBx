/**
 * The conversation thread (wireframes 5j / 4c / 5m "message rendering"):
 *   - user: right-aligned terra-soft bubble — the ONLY terra-soft surface
 *   - Yulia: NO bubble — plain text on the page bg, avatar alongside, and the
 *     hero money range typographically promoted to display scale (the CashApp
 *     "balance" treatment; result-card variant 1i-i, inline strip)
 *   - quick replies: pill row after her turns; primary pill terra-outlined
 *   - gate: an in-stream card, never a modal. Signup is Google-one-click
 *     (email/password was deliberately removed), so the card routes to
 *     /signup rather than collecting an email nothing can use.
 *
 * Data source is the existing anonymous funnel (useMarketingChat): real
 * computed answers, no scripted demo content.
 */
import { memo, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import type { MktMsg, MktGate } from './useMarketingChat';

/* Promote money ranges inside Yulia's prose. The dash must be UNSPACED —
   "$1.08M–$1.89M" is a range; "put down $150K — $1.2M is the loan" is a
   clause break between two unrelated figures and must not be fused into a
   fake range. Only the HERO datum of a message (largest bound; ties → the
   last occurrence, since her estimate lands at the end of the beat) gets
   display scale; supporting ranges are merely bold. Typography, not content. */
const RANGE_RE = /\$\d[\d,.]*\s?[KMB]?[–—-]\$\d[\d,.]*\s?[KMB]?/g;

function moneyValue(token: string): number {
  const m = token.match(/\$(\d[\d,.]*)\s?([KMB])?/);
  if (!m) return 0;
  const n = parseFloat(m[1].replace(/,/g, ''));
  const mult = m[2] === 'B' ? 1e9 : m[2] === 'M' ? 1e6 : m[2] === 'K' ? 1e3 : 1;
  return n * mult;
}

function rangeMagnitude(range: string): number {
  const parts = range.split(/[–—-]/);
  return Math.max(moneyValue(parts[0] ?? ''), moneyValue(parts[1] ?? ''));
}

export function renderYuliaText(text: string): ReactNode[] {
  // One hero per message: the last range carrying the maximum magnitude.
  const all = [...text.matchAll(RANGE_RE)].map(m => rangeMagnitude(m[0]));
  const heroMag = all.length ? Math.max(...all) : 0;
  const heroOccurrence = all.lastIndexOf(heroMag);

  const out: ReactNode[] = [];
  let occurrence = -1;
  const paragraphs = text.split(/\n{2,}/);
  paragraphs.forEach((para, pi) => {
    const nodes: ReactNode[] = [];
    let last = 0;
    for (const m of para.matchAll(RANGE_RE)) {
      const i = m.index ?? 0;
      occurrence += 1;
      if (i > last) nodes.push(para.slice(last, i));
      const [a, b] = m[0].split(/[–—-]/);
      nodes.push(
        occurrence === heroOccurrence ? (
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

/** Completed messages never change — parse once per content string, not once
 *  per streamed chunk of the message after them. */
const YuliaMsgMemo = memo(function YuliaMsgMemo({ content }: { content: string }) {
  const nodes = useMemo(() => renderYuliaText(content), [content]);
  return <YuliaMsg>{nodes}</YuliaMsg>;
});

/** In-stream gate card. Honest about the actual auth: one-click Google. */
function GateCard({ gate }: { gate: Exclude<MktGate, null> }) {
  const [, navigate] = useLocation();
  const prompt =
    gate === 'limit'
      ? 'I can keep going — create your account and I’ll put your full Baseline™ together with everything we’ve covered saved to it.'
      : 'To pick this up and keep your work saved, create your account — this conversation comes with you.';
  return (
    <div className="mk-stream-card mk-glass">
      <div style={{ fontSize: 14.5, lineHeight: 1.5 }}>{prompt}</div>
      <button type="button" className="mk-chip is-primary" onClick={() => navigate('/signup')}>
        Continue — one click with Google
      </button>
      <span className="mk-note">No forms, no password. Your conversation follows you in.</span>
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
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Follow the stream — but only when the reader is already near the bottom
  // (scrolling up to re-read must not be hijacked), and only by moving THIS
  // container (never document scroll: the thread stays mounted, invisible,
  // in the landing phase).
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 140;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [messages.length, streamingText, gate]);

  const lastIsYulia = messages.length > 0 && messages[messages.length - 1].role === 'assistant';
  const showQuick = lastIsYulia && !sending && !gate && quickReplies.length > 0;

  return (
    <div className="mk-thread" ref={scrollerRef}>
      <div className="mk-thread-inner">
        {messages.map(m =>
          m.role === 'user' ? (
            <div className="mk-msg-user" key={m.id}>{m.content}</div>
          ) : (
            <YuliaMsgMemo key={m.id} content={m.content} />
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

        {gate && <GateCard gate={gate} />}

        {error && <div className="mk-note" role="alert">{error}</div>}
      </div>
    </div>
  );
}
