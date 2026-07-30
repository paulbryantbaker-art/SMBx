/**
 * The contents rail — a navigator rather than a list of links (2026-07-29).
 *
 * Paul: "let's make the left hand menu look a little more interesting be a
 * more useful navigator and include a search function."
 *
 * Search covers the BODY, not just the headings. On a 19,000-word assessment
 * the heading you want is rarely the one that contains your word — you search
 * "refrigerant" or "Blackstone" and you want the section that discusses it,
 * which may be titled "7.1 A2L transition". So the index is built from the
 * rendered prose and each hit reports how many times its section mentions the
 * term, which doubles as a signal of where the real discussion is.
 *
 * The index is built from the DOM rather than the markdown because the DOM is
 * what is already here — the body arrives as pre-rendered HTML from the build
 * plugin, so re-parsing markdown in the browser would mean shipping a parser
 * to do work that is already done.
 *
 * DELIBERATELY NOT highlighting matches inside the body. That would mean
 * rewriting the prose HTML, and this page has a documented hazard there: the
 * body is memoised precisely because re-setting innerHTML replaces every
 * heading node, and a detached heading reports top: 0, which silently breaks
 * the scroll-spy. Jumping to the section is the affordance; the count tells
 * you whether it is worth the jump.
 */
import { useEffect, useMemo, useRef, useState } from 'react';

export interface TocItem { id: string; text: string; level: number }

/** Section id → its body text, lowercased once for repeated matching. */
function buildIndex(root: HTMLElement | null): Map<string, string> {
  const idx = new Map<string, string>();
  if (!root) return idx;
  // Document order regardless of the `display: contents` chunk wrappers.
  const nodes = root.querySelectorAll('h1, h2, h3, p, li, td, th, blockquote, pre');
  let current = '';
  const buf: string[] = [];
  const flush = () => { if (current) idx.set(current, buf.join(' ').toLowerCase()); buf.length = 0; };
  nodes.forEach(el => {
    if (/^H[123]$/.test(el.tagName)) {
      flush();
      current = el.id || '';
      if (current) buf.push(el.textContent || '');
      return;
    }
    if (current) buf.push(el.textContent || '');
  });
  flush();
  return idx;
}

function countOf(haystack: string, needle: string): number {
  if (!needle) return 0;
  let n = 0, i = 0;
  for (;;) {
    const at = haystack.indexOf(needle, i);
    if (at === -1) return n;
    n++; i = at + needle.length;
  }
}

export default function RailNav({
  toc, active, top, bodyRef, onPick, onClose,
}: {
  toc: TocItem[];
  active: string;
  top: number;
  /** The rendered prose, for the body index. */
  bodyRef: React.RefObject<HTMLDivElement | null>;
  onPick?: () => void;
  /** Mobile only. When given, the close control rides INSIDE the pinned header
   *  rather than sitting in its own row above it — which is what lets the whole
   *  header be one sticky element with no hand-tuned offset between two. */
  onClose?: () => void;
}) {
  const [q, setQ] = useState('');
  const [index, setIndex] = useState<Map<string, string>>(new Map());
  const inputRef = useRef<HTMLInputElement>(null);

  // Build once the prose is on the page. `toc` changing means a new report.
  useEffect(() => {
    if (!toc.length) return;
    const t = window.setTimeout(() => setIndex(buildIndex(bodyRef.current)), 0);
    return () => window.clearTimeout(t);
  }, [toc, bodyRef]);

  const needle = q.trim().toLowerCase();

  const hits = useMemo(() => {
    if (!needle) return null;
    const out: { item: TocItem; n: number }[] = [];
    for (const item of toc) {
      const inHeading = item.text.toLowerCase().includes(needle);
      const n = countOf(index.get(item.id) || '', needle);
      if (n > 0 || inHeading) out.push({ item, n });
    }
    return out;
  }, [needle, toc, index]);

  const total = hits ? hits.reduce((a, h) => a + h.n, 0) : 0;
  const shown = hits ? hits.map(h => h.item) : toc;

  return (
    <>
      {/* Header and search are ONE element so the mobile sheet can pin them as a
          single sticky block. Two sticky siblings would need the second offset
          by the first's measured height — a hand-tuned number that goes wrong
          the moment the label wraps. */}
      <div className="rp-rail-top">
      <div className="rp-rail-h">
        Contents
        {onClose && (
          <button type="button" className="rp-toc-close" onClick={onClose} aria-label="Close contents">×</button>
        )}
      </div>

      <div className="rp-find">
        <svg className="rp-find-i" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M10.6 10.6L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          className="rp-find-in"
          type="search"
          value={q}
          placeholder="Search this report"
          aria-label="Search this report"
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Escape') { setQ(''); inputRef.current?.blur(); }
            if (e.key === 'Enter' && shown.length) {
              document.getElementById(shown[0].id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              onPick?.();
            }
          }}
        />
        {q && (
          <button className="rp-find-x" onClick={() => { setQ(''); inputRef.current?.focus(); }} aria-label="Clear search">
            ×
          </button>
        )}
      </div>

      {hits && (
        <div className="rp-find-n" role="status">
          {total === 0
            ? <>Nothing in this report matches “{q.trim()}”.</>
            : <>{total} mention{total === 1 ? '' : 's'} across {hits.length} section{hits.length === 1 ? '' : 's'}</>}
        </div>
      )}
      </div>{/* /rp-rail-top — the match count stays pinned with the field it
                describes, so the tally is still readable while you scroll the
                results it is counting. */}

      <nav className="rp-toc-list" aria-label="Report contents">
        {shown.map(h => {
          const hit = hits?.find(x => x.item.id === h.id);
          return (
            <a
              key={h.id}
              href={`#${h.id}`}
              className={`rp-toc-a lvl${h.level - top}${!hits && active === h.id ? ' on' : ''}`}
              aria-current={!hits && active === h.id ? 'location' : undefined}
              onClick={onPick}
            >
              <span className="rp-toc-t">{h.text}</span>
              {hit && hit.n > 0 && <span className="rp-toc-n">{hit.n}</span>}
            </a>
          );
        })}
      </nav>
    </>
  );
}
