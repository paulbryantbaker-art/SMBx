/**
 * The takeaway card — read free, download for an email (2026-07-29).
 *
 * The report itself is never gated: the whole point of putting it on the site
 * is that a visitor can read it, that search can index it, and that the work
 * speaks without a wall in front of it. What the email buys is the PORTABLE
 * artifact — the PDF that gets forwarded to a partner or dropped in an IC
 * packet. Someone who reads 8,000 words and then asks for the file is telling
 * you something; a wall on a cold click is not.
 *
 * The email persists through the existing practice-lead rail
 * (`/api/practice/leads` → practice_leads + the practitioner ping), tagged
 * `report:<slug>` so report leads are separable from intake leads.
 *
 * The gate is deliberately soft: it remembers a visitor who has already given
 * an email, and the PDF is a plain static file. It is a courtesy ask, not
 * access control — treat anything published here as public.
 */
import { useState, type FormEvent } from 'react';
import { postPracticeLead } from '../leads';
import { trackEvent } from '../../lib/analytics';

const UNLOCK_KEY = 'smbx_report_reader';

function readUnlocked(): string | null {
  try { return localStorage.getItem(UNLOCK_KEY); } catch { return null; }
}

function remember(email: string) {
  try { localStorage.setItem(UNLOCK_KEY, email); } catch { /* private mode — ask again next time */ }
}

const VALID = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function DownloadCard({
  slug, pdf, pages, placement,
}: {
  slug: string;
  pdf: string;
  /** Read-time line so the ask is honest about what's being downloaded. */
  pages: string;
  /** 'top' | 'end' — instrumentation only. */
  placement: string;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  const start = (url: string) => {
    // A real navigation, not fetch — lets the browser stream the file and
    // keeps the back button clean.
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const onAsk = () => {
    const known = readUnlocked();
    if (known) {
      trackEvent('report_download', { slug, placement, returning: true });
      start(pdf);
      setDone(true);
      return;
    }
    trackEvent('report_download_prompted', { slug, placement });
    setOpen(true);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const clean = email.trim();
    if (!VALID.test(clean)) { setErr('That email looks incomplete.'); return; }
    setErr('');
    setBusy(true);
    // Never let the download hang on the network — the lead post is
    // fire-and-forget by design, the file is the promise we made.
    void postPracticeLead({ email: clean, source: `report:${slug}` });
    remember(clean);
    trackEvent('report_download', { slug, placement, returning: false });
    start(pdf);
    setBusy(false);
    setDone(true);
  };

  return (
    <aside className="rp-dl" aria-labelledby={`dl-${placement}`}>
      <div className="rp-dl-body">
        <div className="rp-dl-lead">
          <h3 id={`dl-${placement}`} className="rp-dl-h">Take the report with you</h3>
          <p className="rp-dl-p">
            The full assessment as a formatted PDF — {pages}, every figure attributed,
            built to forward.
          </p>
        </div>

        {done ? (
          <div className="rp-dl-done">
            <p className="rp-dl-thanks">Downloading. Thank you.</p>
            <button type="button" className="rp-dl-again" onClick={() => start(pdf)}>
              Download again
            </button>
          </div>
        ) : open ? (
          // noValidate: `type="email"` still gives phones the right keyboard,
          // but the browser's own validation bubble would block submit before
          // our styled inline message ever rendered.
          <form className="rp-dl-form" onSubmit={onSubmit} noValidate>
            <label className="rp-dl-label" htmlFor={`em-${placement}`}>
              Where should we send it?
            </label>
            <div className="rp-dl-row">
              <input
                id={`em-${placement}`}
                className="rp-dl-input"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => { setEmail(e.target.value); if (err) setErr(''); }}
                aria-invalid={!!err}
                aria-describedby={err ? `err-${placement}` : undefined}
                autoFocus
              />
              <button className="pd-pill-primary rp-dl-go" type="submit" disabled={busy}>
                {busy ? 'One moment…' : 'Get the PDF'}
              </button>
            </div>
            {err && <p className="rp-dl-err" id={`err-${placement}`} role="alert">{err}</p>}
            {/* Says only what the code actually does: the lead row lands in
                practice_leads and pings Paul. No list, no sequence — do not
                promise a newsletter that does not exist. */}
            <p className="rp-dl-fine">Goes straight to Paul. No list, no sequence.</p>
          </form>
        ) : (
          <button type="button" className="pd-pill-primary rp-dl-cta" onClick={onAsk}>
            Download the PDF
          </button>
        )}
      </div>
    </aside>
  );
}
