/**
 * /reports — the published research shelf (2026-07-29).
 *
 * Deliberately plain: a header, then one card per assessment. The reports are
 * the proof, so the page's job is to get out of their way. Each card states
 * what the read costs in minutes — a 37-minute document should say so before
 * someone commits to it.
 */
import { Link } from 'wouter';
import PracticeShell from './PracticeShell';
import { REPORT_LIST } from './reports/registry';
import { bookHref, bookTarget, bookRel } from './leads';
import { trackEvent } from '../lib/analytics';
import './report.css';

export default function ReportsIndex() {
  return (
    <PracticeShell footerCompact>
      <div className="rp-idx">
        <header className="pd-wrap rp-idx-head">
          <h1 className="pd-h2">Research</h1>
          <p className="pd-sub rp-idx-sub">
            The market assessments we run before taking a mandate. Every figure is
            attributed to its source, and where analysts disagree we show both
            numbers rather than picking the flattering one.
          </p>
        </header>

        <div className="pd-wrap rp-idx-list">
          {REPORT_LIST.map(r => (
            <article className="rp-card" key={r.slug}>
              <div className="rp-card-top">
                <span className="rp-kicker">{r.kicker}</span>
                <span className="rp-card-date">{r.publishedLabel}</span>
              </div>
              <h2 className="rp-card-h">
                <Link
                  href={`/research/${r.slug}`}
                  onClick={() => trackEvent('report_card_clicked', { slug: r.slug })}
                >
                  {r.shortTitle}
                </Link>
              </h2>
              <p className="rp-card-p">{r.abstract}</p>

              {r.summary.stats.length > 0 && (
                <div className="rp-card-stats">
                  {r.summary.stats.slice(0, 3).map((s, i) => (
                    <div className="rp-card-stat" key={i}>
                      <span className="n">{s.n}</span>
                      <span className="l">{s.l}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="rp-card-foot">
                <Link className="pd-pill-primary rp-card-cta" href={`/research/${r.slug}`}>
                  Read the assessment
                </Link>
                <span className="rp-card-meta">
                  {r.summary.minutes} min · {r.summary.words.toLocaleString()} words · PDF available
                </span>
              </div>
            </article>
          ))}
        </div>

        <section className="rp-cta">
          <div className="pd-wrap rp-cta-in">
            <h2 className="pd-cta-h">Want this run on your lane?</h2>
            <p className="pd-body rp-cta-p">
              We build the same register for a client's specific market before the
              first approach goes out. If you're buying, start with a conversation.
            </p>
            <a
              className="pd-pill-primary pd-pill-lg"
              href={bookHref()}
              target={bookTarget()}
              rel={bookRel()}
              onClick={() => trackEvent('practice_cta_clicked', { placement: 'reports-index' })}
            >
              Book a confidential call
            </a>
          </div>
        </section>
      </div>
    </PracticeShell>
  );
}
