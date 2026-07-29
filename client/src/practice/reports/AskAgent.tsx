/**
 * "Ask about this report" — the right-hand FAB and its panel (2026-07-29).
 *
 * Paul: "to the right in the right FAB let's add a Ask Agent about the report
 * or help answer any questions."
 *
 * The answer comes from `/api/practice/reports/:slug/ask`, which grounds it in
 * that report's own markdown and is required to say when the report does not
 * cover something. So the UI's job is small and mostly about not overclaiming:
 * the placeholder asks about THIS report, the starters are questions the
 * document can actually answer, and a failure says the agent could not reach
 * the report rather than pretending the report is silent.
 *
 * Positioned `absolute` inside the page, never `fixed` with a background —
 * the Safari toolbar-tint rule. The launcher itself is fixed but is a small
 * pill, not a full-viewport coloured surface, the same exemption the reading
 * progress hairline takes.
 */
import { useEffect, useRef, useState } from 'react';
import { trackEvent } from '../../lib/analytics';

interface Turn { role: 'user' | 'assistant'; content: string }

const STARTERS = [
  'What are the headline findings?',
  'What changed since the last edition?',
  'Where are the best remaining opportunities?',
];

export default function AskAgent({ slug, title }: { slug: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, busy]);

  // Escape closes, matching every other overlay on the site.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setError('');
    setDraft('');
    const history = turns.slice(-8);
    setTurns(t => [...t, { role: 'user', content: q }]);
    setBusy(true);
    trackEvent('report_ask', { slug });
    try {
      const res = await fetch(`/api/practice/reports/${encodeURIComponent(slug)}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, history }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.answer) {
        setError(data.error || "The agent can't reach the report just now.");
      } else {
        setTurns(t => [...t, { role: 'assistant', content: data.answer }]);
      }
    } catch {
      setError('That did not go through. Try again in a moment.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          className="rp-ask-fab"
          onClick={() => { setOpen(true); trackEvent('report_ask_opened', { slug }); }}
          aria-label="Ask about this report"
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M3.4 15.2A7.6 7.6 0 1 1 6.6 17l-3.3.9.9-2.7z"
              fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
            />
          </svg>
          <span>Ask about this report</span>
        </button>
      )}

      {open && (
        <div className="rp-ask" role="dialog" aria-label="Ask about this report">
          <div className="rp-ask-top">
            <div className="rp-ask-t">
              <div className="rp-ask-h">Ask about this report</div>
              <div className="rp-ask-s">Answers come from “{title}” — and say so when it doesn’t cover something.</div>
            </div>
            <button type="button" className="rp-ask-x" onClick={() => setOpen(false)} aria-label="Close">×</button>
          </div>

          <div className="rp-ask-scroll" ref={scrollRef}>
            {turns.length === 0 && !busy && (
              <div className="rp-ask-starters">
                {STARTERS.map(s => (
                  <button key={s} type="button" className="rp-ask-chip" onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            )}
            {turns.map((t, i) => (
              <div key={i} className={`rp-ask-turn ${t.role}`}>
                {t.content.split('\n').filter(Boolean).map((p, j) => <p key={j}>{p}</p>)}
              </div>
            ))}
            {busy && <div className="rp-ask-turn assistant rp-ask-wait"><p>Reading the report…</p></div>}
            {error && <div className="rp-ask-err">{error}</div>}
          </div>

          <form
            className="rp-ask-form"
            onSubmit={e => { e.preventDefault(); send(draft); }}
          >
            <textarea
              ref={inputRef}
              className="rp-ask-in"
              value={draft}
              rows={1}
              placeholder="Ask anything in this report"
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(draft); }
              }}
            />
            <button type="submit" className="rp-ask-send" disabled={!draft.trim() || busy} aria-label="Send">↑</button>
          </form>
        </div>
      )}
    </>
  );
}
