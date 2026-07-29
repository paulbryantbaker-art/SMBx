/**
 * The takeaway card — read free, download for an email (2026-07-29).
 *
 * The report itself is never gated: the whole point of putting it on the site
 * is that a visitor can read it, that search can index it, and that the work
 * speaks without a wall in front of it. What the ask protects is the PORTABLE
 * artifact — the PDF that gets forwarded to a partner or dropped in an IC
 * packet.
 *
 * Paul: "they must PROVIDE an email if they want to download it." So the file
 * is released the moment they submit — the server mints the reader cookie in
 * that same response. An earlier pass made them click a link in their inbox
 * first; that verifies the address but sends someone away mid-read, and the
 * ones who don't come back are exactly the buyers worth having. A copy is
 * still emailed (it's how they get it on another device, and a bounce tells
 * Paul the address was junk), but mail never blocks the download.
 *
 * Given once, the reader cookie covers every report — nobody re-enters an
 * address per download. The credential is checked SERVER-side
 * (`/api/practice/reports/:slug/file`); the PDFs no longer sit under
 * `client/public`, so there is no static URL to type around the ask. A team
 * member holding an app JWT skips the whole thing.
 */
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { trackEvent } from '../../lib/analytics';

/** Readable companion to the HttpOnly credential — lets the card render the
 *  unlocked state with no round trip. It grants nothing on its own. */
const HINT_COOKIE = 'smbx_reader_ok';

function hasReaderHint(): boolean {
  try {
    return document.cookie.split(';').some(c => c.trim().startsWith(`${HINT_COOKIE}=`));
  } catch { return false; }
}

function teamToken(): string | null {
  try { return localStorage.getItem('smbx_token'); } catch { return null; }
}

/** One auto-download per page load, even though the page mounts two cards. */
let autoFired = false;

const VALID = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Phase = 'idle' | 'form' | 'sending' | 'fetching' | 'done';

export default function DownloadCard({
  slug, pages, placement,
}: {
  slug: string;
  /** Read-time line, so the ask is honest about what's being downloaded. */
  pages: string;
  /** 'top' | 'end' — instrumentation, and which card owns the auto-download. */
  placement: string;
}) {
  const [unlocked, setUnlocked] = useState(() => hasReaderHint() || !!teamToken());
  const [phase, setPhase] = useState<Phase>('idle');
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const [note, setNote] = useState('');
  /** Whether the emailed copy actually went out — decides the done-state line. */
  const [emailed, setEmailed] = useState(true);

  /** Pull the file with whichever credential this visitor has. */
  const fetchPdf = useCallback(async () => {
    setErr('');
    setPhase('fetching');
    try {
      const token = teamToken();
      const res = await fetch(`/api/practice/reports/${slug}/file`, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.status === 401) {
        // The credential lapsed (180 days, or a cleared cookie jar) — ask again.
        setUnlocked(false);
        setPhase('form');
        setErr('Your access expired. Enter your email again to download.');
        return;
      }
      if (!res.ok) throw new Error(String(res.status));

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Revoke on the next tick — Safari cancels the download if it goes early.
      setTimeout(() => URL.revokeObjectURL(url), 30_000);

      setPhase('done');
      trackEvent('report_download', { slug, placement });
    } catch {
      setPhase('idle');
      setErr('The download didn\'t start. Try again in a moment.');
    }
  }, [slug, placement]);

  // Arriving back from the email link: ?dl=1 means the cookie was just set.
  useEffect(() => {
    if (placement !== 'top' || autoFired) return;
    const params = new URLSearchParams(window.location.search);

    if (params.get('unlock')) {
      const why = params.get('unlock');
      autoFired = true;
      setNote(why === 'expired'
        ? 'That emailed link has expired — links are good for 48 hours. Enter your email to download it now.'
        : 'That link is no longer valid. Enter your email to download it now.');
      setPhase('form');
      params.delete('unlock');
      cleanUrl(params);
      return;
    }

    if (params.get('dl') === '1') {
      autoFired = true;
      setUnlocked(true);
      params.delete('dl');
      cleanUrl(params);
      void fetchPdf();
      trackEvent('report_unlocked', { slug });
    }
  }, [placement, slug, fetchPdf]);

  const onAsk = () => {
    if (unlocked) { void fetchPdf(); return; }
    trackEvent('report_download_prompted', { slug, placement });
    setPhase('form');
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const clean = email.trim();
    if (!VALID.test(clean)) { setErr('That email looks incomplete.'); return; }
    setErr('');
    setNote('');
    setPhase('sending');
    try {
      const res = await fetch('/api/practice/reports/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: clean, slug }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error || 'Could not start the download just now.');
        setPhase('form');
        return;
      }
      // The server minted the reader cookie in that response, so the file is
      // available right now — no inbox trip. `emailed` only decides whether we
      // mention the copy we sent; a mail failure never blocks the download.
      trackEvent('report_email_given', { slug, placement, emailed: data.emailed !== false });
      setUnlocked(true);
      setEmailed(data.emailed !== false);
      await fetchPdf();
    } catch {
      setErr('Could not reach the server. Try again in a moment.');
      setPhase('form');
    }
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

        {note && <p className="rp-dl-note">{note}</p>}

        {phase === 'done' ? (
          <div className="rp-dl-done">
            <p className="rp-dl-thanks">Downloading. Thank you.</p>
            {email && emailed && (
              <p className="rp-dl-fine">
                We also sent a copy to <strong>{email}</strong>, so you have it on
                any device.
              </p>
            )}
            <button type="button" className="rp-dl-again" onClick={() => void fetchPdf()}>
              Download again
            </button>
          </div>
        ) : phase === 'form' || phase === 'sending' ? (
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
                onChange={ev => { setEmail(ev.target.value); if (err) setErr(''); }}
                aria-invalid={!!err}
                aria-describedby={err ? `err-${placement}` : undefined}
                autoFocus
              />
              <button className="pd-pill-primary rp-dl-go" type="submit" disabled={phase === 'sending'}>
                {phase === 'sending' ? 'One moment…' : 'Get the PDF'}
              </button>
            </div>
            {err && <p className="rp-dl-err" id={`err-${placement}`} role="alert">{err}</p>}
            {/* Says only what the code does: the address is confirmed by the
                link, the lead lands in practice_leads and pings Paul. No list,
                no sequence — do not promise a newsletter that doesn't exist. */}
            <p className="rp-dl-fine">
              The download starts as soon as you send this, and we'll email you a
              copy. Goes straight to Paul — no list, no sequence.
            </p>
          </form>
        ) : (
          <>
            <button
              type="button"
              className="pd-pill-primary rp-dl-cta"
              onClick={onAsk}
              disabled={phase === 'fetching'}
            >
              {phase === 'fetching' ? 'Fetching the PDF…' : 'Download the PDF'}
            </button>
            {err && <p className="rp-dl-err" role="alert">{err}</p>}
          </>
        )}
      </div>
    </aside>
  );
}

/** Drop a consumed query param so a refresh doesn't replay the download. */
function cleanUrl(params: URLSearchParams) {
  const q = params.toString();
  window.history.replaceState({}, '', window.location.pathname + (q ? `?${q}` : ''));
}
