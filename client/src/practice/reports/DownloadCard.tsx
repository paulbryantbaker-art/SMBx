/**
 * The takeaway card — read free, download with a verified email (2026-07-29).
 *
 * The report itself is never gated: the whole point of putting it on the site
 * is that a visitor can read it, that search can index it, and that the work
 * speaks without a wall in front of it. What the gate protects is the PORTABLE
 * artifact — the PDF that gets forwarded to a partner or dropped in an IC
 * packet.
 *
 * Paul asked for "must be signed in to download." Practice mode restricts real
 * accounts to the team allowlist, so a literal login would mean nobody but the
 * team could ever download it. This is the equivalent that works for an outside
 * acquirer: they give an address, we mail a one-click link, and clicking it
 * proves the address before the file is released. Verified once, the reader
 * cookie covers every report — nobody re-verifies per download.
 *
 * The credential is checked SERVER-side (`/api/practice/reports/:slug/file`);
 * the PDFs no longer sit under `client/public`, so there is no static URL to
 * type around the gate. A team member holding an app JWT skips the whole thing.
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

type Phase = 'idle' | 'form' | 'sending' | 'sent' | 'fetching' | 'done';

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
        // The cookie lapsed (or was never really there) — ask again.
        setUnlocked(false);
        setPhase('form');
        setErr('That link has expired. Send yourself a fresh one.');
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
        ? 'That link has expired — links are good for 48 hours. Send yourself a new one.'
        : 'That link is no longer valid. Send yourself a new one.');
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
        setErr(data.error || 'Could not send the link just now.');
        setPhase('form');
        return;
      }
      // `emailed: false` means the mail transport isn't configured and the
      // link was only logged server-side. Never tell someone to check an inbox
      // nothing was sent to.
      if (data.emailed === false) {
        setErr('We couldn\'t send the email just now. Book a call and Paul will send the report directly.');
        setPhase('form');
        return;
      }
      setPhase('sent');
      trackEvent('report_link_sent', { slug, placement });
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

        {phase === 'sent' ? (
          <div className="rp-dl-done">
            <p className="rp-dl-thanks">Check your inbox.</p>
            <p className="rp-dl-fine">
              We sent a one-click link to <strong>{email}</strong>. It opens the PDF
              and is good for 48 hours.
            </p>
            <button
              type="button"
              className="rp-dl-again"
              onClick={() => { setPhase('form'); setErr(''); }}
            >
              Use a different address
            </button>
          </div>
        ) : phase === 'done' ? (
          <div className="rp-dl-done">
            <p className="rp-dl-thanks">Downloading. Thank you.</p>
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
                {phase === 'sending' ? 'Sending…' : 'Send me the link'}
              </button>
            </div>
            {err && <p className="rp-dl-err" id={`err-${placement}`} role="alert">{err}</p>}
            {/* Says only what the code does: the address is confirmed by the
                link, the lead lands in practice_leads and pings Paul. No list,
                no sequence — do not promise a newsletter that doesn't exist. */}
            <p className="rp-dl-fine">
              We'll email the link to confirm the address. Goes straight to Paul —
              no list, no sequence.
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
