/**
 * /reports/:slug — a published research report, readable in full (2026-07-29).
 *
 * Why this page exists (Paul, 2026-07-29): the report was already a portable
 * PDF, but a PDF is a bad landing target for LinkedIn traffic — most of that
 * traffic is on a phone, and search can't do much with a PDF. So the WEB page
 * is the destination and the PDF is the takeaway. Both render from the one
 * markdown file in `scripts/studio/reports/`, so they cannot drift.
 *
 * The masthead paints from the statically-imported summary; the ~50 kB body is
 * its own lazy chunk, so the page has a title and a cover before the read
 * arrives rather than showing a spinner over everything.
 *
 * The reading affordances a 37-minute document needs and a PDF can't offer:
 * a sticky contents rail with scroll-spy, a progress bar, and a place-keeper
 * that offers to put you back where you stopped (offers — never jumps on its
 * own; a page that moves under you is hostile).
 *
 * Type + colour come from the `.pd` Ledger scope in practice.css. The prose
 * ladder lives in report.css and deliberately stays inside the site's locked
 * roles rather than inventing per-section sizes.
 */
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'wouter';
import PracticeShell, { PageCrumb } from './PracticeShell';
import { getReport, loadReportBody, type ReportBody } from './reports/registry';
import DownloadCard from './reports/DownloadCard';
import { usePageMeta } from './reports/usePageMeta';
import RailNav from './reports/RailNav';
import AskAgent from './reports/AskAgent';
import { bookHref, bookTarget, bookRel } from './leads';
import { trackEvent } from '../lib/analytics';
import './report.css';

/* ── place-keeper ───────────────────────────────────────────────────────── */

const posKey = (slug: string) => `smbx_report_pos_${slug}`;

function savePos(slug: string, y: number) {
  try {
    if (y > 400) localStorage.setItem(posKey(slug), String(Math.round(y)));
    else localStorage.removeItem(posKey(slug));
  } catch { /* private mode — the place-keeper is a nicety, not a requirement */ }
}

function loadPos(slug: string): number {
  try { return Number(localStorage.getItem(posKey(slug))) || 0; } catch { return 0; }
}

/* ── body: HTML split around the accent-photo markers ───────────────────── */

/**
 * MEMOISED, and the children are built once — both are load-bearing, not
 * micro-optimisation. React 19 compares `dangerouslySetInnerHTML` by prop
 * IDENTITY, so a fresh `{__html}` object on each render re-sets innerHTML.
 * The parent re-renders on every scroll frame (the progress bar), which meant
 * the whole ~250 kB body was re-parsed 60×/sec AND every heading node was
 * replaced — which silently broke the scroll-spy, since a detached node
 * reports top: 0 and therefore always reads as "above the line".
 */
const Body = memo(function Body(
  { html, accents }: { html: string; accents: { img: string; pos: string }[] },
) {
  // The plugin leaves `@@ACCENT<n>@@` where a config `accent:` photo belongs
  // (the same placement the PDF uses). Split on them and drop the framed
  // photo band in between.
  const children = useMemo(() => {
    const parts = html.split(/@@ACCENT(\d+)@@/);
    return parts.map((chunk, i) => {
      if (i % 2 === 1) {
        const a = accents[Number(chunk)];
        return a ? (
          <img
            key={`a${i}`}
            className="rp-accent"
            src={a.img}
            style={{ objectPosition: a.pos }}
            alt=""
            loading="lazy"
            decoding="async"
          />
        ) : null;
      }
      return chunk ? <div key={i} dangerouslySetInnerHTML={{ __html: chunk }} /> : null;
    });
  }, [html, accents]);

  return <div className="rp-prose">{children}</div>;
});

/* ── page ───────────────────────────────────────────────────────────────── */

export default function ReportPage({ slug }: { slug: string }) {
  const report = getReport(slug);
  const s = report?.summary;

  const [body, setBody] = useState<ReportBody | null>(null);
  const [bodyFailed, setBodyFailed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState('');
  const [resumeY, setResumeY] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Stable identity for the same reason Body is memoised — a fresh
  // `{__html}` object re-sets innerHTML on every scroll frame.
  const introHtml = useMemo(
    () => (body?.intro ? { __html: body.intro } : null),
    [body],
  );

  usePageMeta(report);

  // Fetch the read itself. Guarded against a slug change mid-flight.
  useEffect(() => {
    if (!report) return;
    let live = true;
    setBody(null);
    setBodyFailed(false);
    loadReportBody(slug)
      .then(r => { if (live) r ? setBody(r) : setBodyFailed(true); })
      .catch(() => { if (live) setBodyFailed(true); });
    return () => { live = false; };
  }, [slug, report]);

  // Offer the place-keeper on arrival; never move the page unasked.
  useEffect(() => {
    if (!report) return;
    trackEvent('report_view', { slug });
    const y = loadPos(slug);
    if (y > 400) setResumeY(y);
    // A fresh visit starts at the top even if the browser wants to restore.
    window.scrollTo(0, 0);
  }, [slug, report]);

  // Progress + place-keeping, both off one passive scroll listener.
  useEffect(() => {
    if (!body) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const el = bodyRef.current;
        const y = window.scrollY;
        if (el) {
          const start = el.offsetTop;
          const span = el.offsetHeight - window.innerHeight * 0.6;
          setProgress(span > 0 ? Math.min(1, Math.max(0, (y - start) / span)) : 0);
        }
        savePos(slug, y);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [slug, body]);

  // Scroll-spy: the last heading to have crossed the top band wins, so the
  // rail tracks what you're reading rather than what's merely on screen.
  useEffect(() => {
    if (!body) return;
    // Look the headings up by id each pass rather than caching the nodes: a
    // cached node that React later replaces reports top: 0 and quietly pins
    // the rail to the last section. getElementById is a hash lookup — 38 of
    // them per animation frame costs nothing.
    const ids = body.toc.map(h => h.id);
    if (!ids.length) return;
    let frame = 0;
    const pick = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const line = 140;
        let current = ids[0];
        for (const id of ids) {
          const el = document.getElementById(id);
          if (!el) continue;
          if (el.getBoundingClientRect().top <= line) current = id;
          else break;
        }
        setActive(current);
      });
    };
    pick();
    window.addEventListener('scroll', pick, { passive: true });
    return () => {
      window.removeEventListener('scroll', pick);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [body]);

  // Lock the page behind the mobile contents sheet (absolute, never fixed
  // full-viewport with a background — the Safari toolbar rule).
  useEffect(() => {
    if (!tocOpen) return;
    const html = document.documentElement.style;
    const prev = html.overflow;
    html.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setTocOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { html.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [tocOpen]);

  if (!report || !s) {
    return (
      <PracticeShell footerCompact>
        <div className="pd-wrap rp-missing">
          <h1 className="pd-h2">That report isn't here.</h1>
          <p className="pd-body">
            It may have moved. <Link href="/research">See the published research</Link>.
          </p>
        </div>
      </PracticeShell>
    );
  }

  const topLevel = body?.toc.length ? Math.min(...body.toc.map(h => h.level)) : 2;
  const pagesLine = `${s.minutes} minutes, ${s.words.toLocaleString()} words`;

  return (
    <PracticeShell footerCompact>
      {/* Reading progress — a hairline, not a decoration. */}
      <div className="rp-progress" aria-hidden="true">
        <div className="rp-progress-bar" style={{ transform: `scaleX(${progress})` }} />
      </div>

      <article className="rp">
        {/* ── masthead ─────────────────────────────────────────────── */}
        <header className="rp-head">
          <div className="pd-wrap rp-head-in">
            <PageCrumb parent={{ label: 'Research', href: '/research' }} here={report.shortTitle} />
            <div className="rp-kicker">{report.kicker}</div>
            <h1 className="rp-title">{s.title}</h1>
            {s.subtitle && <p className="rp-sub">{s.subtitle}</p>}

            <div className="rp-meta">
              {s.headshot && <img className="rp-face" src={s.headshot} alt="" loading="lazy" />}
              <div className="rp-meta-t">
                <div className="rp-by">{s.byline}</div>
                <div className="rp-role">{s.role}</div>
              </div>
              <div className="rp-meta-dot" aria-hidden="true" />
              <div className="rp-meta-t">
                <div className="rp-by">{report.publishedLabel}</div>
                <div className="rp-role">{pagesLine}</div>
              </div>
            </div>

            {s.coverImage && (
              <img
                className="rp-cover"
                src={s.coverImage}
                style={{ objectPosition: s.coverPos }}
                alt=""
                fetchPriority="high"
                decoding="async"
              />
            )}
          </div>
        </header>

        {/* ── key findings — the numerals the report leads on ───────── */}
        {s.stats.length > 0 && (
          <section className="rp-stats" aria-label="Key findings">
            <div className="pd-wrap rp-stats-in">
              <h2 className="rp-stats-h">By the numbers</h2>
              <div className="rp-stats-grid">
                {s.stats.map((st, i) => (
                  <div className="rp-stat" key={i}>
                    <div className="rp-stat-n">{st.n}</div>
                    <div className="rp-stat-l">{st.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── the read ─────────────────────────────────────────────── */}
        <div className="pd-wrap rp-main">
          <aside className="rp-rail">
            {body && (
              <div className="rp-rail-sticky">
                <RailNav toc={body.toc} active={active} top={topLevel} bodyRef={bodyRef} />
              </div>
            )}
          </aside>

          <div className="rp-col">
            {introHtml && <div className="rp-intro" dangerouslySetInnerHTML={introHtml} />}

            <DownloadCard slug={report.slug} placement="top" />

            <div ref={bodyRef}>
              {body ? (
                <Body html={body.html} accents={body.accents} />
              ) : bodyFailed ? (
                <p className="rp-bodyfail">
                  The report didn't load.{' '}
                  <button type="button" onClick={() => window.location.reload()}>Try again</button>.
                </p>
              ) : (
                <p className="rp-bodywait" role="status">Loading the report…</p>
              )}
            </div>

            {body && (
              <DownloadCard slug={report.slug} placement="end" />
            )}
          </div>
        </div>

        {/* ── the ask ──────────────────────────────────────────────── */}
        <section className="rp-cta" id="cta">
          <div className="pd-wrap rp-cta-in">
            <h2 className="pd-cta-h">Buying in this market?</h2>
            <p className="pd-body rp-cta-p">
              This is the research we run before a mandate. If you're building a
              platform or adding to one, a conversation costs nothing and we'll
              tell you plainly whether the lane is open.
            </p>
            <a
              className="pd-pill-primary pd-pill-lg"
              href={bookHref()}
              target={bookTarget()}
              rel={bookRel()}
              onClick={() => trackEvent('practice_cta_clicked', { placement: 'report', slug })}
            >
              Book a confidential call
            </a>
          </div>
        </section>
      </article>

      {/* ── place-keeper (offers; never jumps) ───────────────────────── */}
      {resumeY > 0 && body && (
        <div className="rp-resume" role="status">
          <span className="rp-resume-t">You were partway through.</span>
          <button
            type="button"
            className="rp-resume-go"
            onClick={() => {
              window.scrollTo({ top: resumeY, behavior: 'smooth' });
              setResumeY(0);
              trackEvent('report_resume', { slug });
            }}
          >
            Pick up where you left off
          </button>
          <button
            type="button"
            className="rp-resume-x"
            aria-label="Dismiss"
            onClick={() => setResumeY(0)}
          >
            ×
          </button>
        </div>
      )}

      {/* ── mobile contents ──────────────────────────────────────────── */}
      {body && (
        <button
          type="button"
          className="rp-toc-fab"
          onClick={() => setTocOpen(true)}
          aria-expanded={tocOpen}
        >
          Contents
        </button>
      )}
      {tocOpen && body && (
        <div className="rp-toc-sheet" role="dialog" aria-modal="true" aria-label="Report contents">
          <button type="button" className="rp-toc-scrim" aria-label="Close" onClick={() => setTocOpen(false)} />
          <div className="rp-toc-panel">
            {/* No separate close row: the × rides inside RailNav's header so the
                header + search + match count pin as ONE sticky block (Paul,
                2026-07-30: "I can't search if I'm scrolled down"). */}
            <RailNav
              toc={body.toc} active={active} top={topLevel} bodyRef={bodyRef}
              onPick={() => setTocOpen(false)}
              onClose={() => setTocOpen(false)}
            />
          </div>
        </div>
      )}

      <AskAgent slug={report.slug} title={report.shortTitle} />
    </PracticeShell>
  );
}
