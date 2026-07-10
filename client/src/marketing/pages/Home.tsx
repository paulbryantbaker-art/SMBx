/**
 * Homepage `/` — wireframes 5a (desktop) / 5b (mobile).
 * Greeting + one pill input + persona chips; sample ticker; the fee anchor
 * stated once, big; three steps; the shell adds the footer dock.
 */
import { useEffect, useState } from 'react';
import { MarketingShell, HeroDock, useShell } from '../MarketingShell';
import { FeeAnchorBand } from '../feeAnchor';

const TICKER = [
  { num: ['$1.08M', '$1.89M'], note: 'what a $1.8M-revenue cleaning co is worth · sample seller Baseline™' },
  { num: ['6.58×', null], note: 'an HVAC ask against a 2.5–3.5× market · sample buyer deal check' },
  { num: ['CIM in days', null], note: 'not weeks · what a broker hands off to Yulia' },
] as const;

function Ticker() {
  const { phase } = useShell();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    // Don't tick while morphed away — the landing is hidden, nobody can see it.
    if (paused || phase === 'chat') return;
    const t = setInterval(() => setI(v => (v + 1) % TICKER.length), 4000);
    return () => clearInterval(t);
  }, [paused, phase]);
  const item = TICKER[i];
  return (
    <div
      className="mk-ticker"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-live="polite"
    >
      <span className="mk-num mk-num-md">
        {item.num[0]}
        {item.num[1] && (
          <>
            <span className="dash">–</span>
            {item.num[1]}
          </>
        )}
      </span>
      <span className="mk-note">{item.note}</span>
    </div>
  );
}

export default function Home() {
  return (
    <MarketingShell
      page="home"
      placeholder="Tell Yulia about your deal…"
      quickReplies={['How did you get this?', 'What moves this number most?']}
    >
      <section className="mk-hero">
        <div className="mk-wrap mk-center" style={{ gap: 16 }}>
          <span className="mk-mark" aria-hidden="true" />
          <h1 className="mk-h1">What's your business worth?</h1>
          <p className="mk-hero-sub">
            Real numbers in your first minute. No signup. <em>No success fees, ever.</em>
          </p>
          <HeroDock
            chips={[
              { label: "I'm selling", seed: "I'm selling my business — it's a " },
              { label: "I'm buying", seed: "I'm looking to buy a business — " },
              { label: "I'm a broker", seed: "I'm a broker working a listing — " },
            ]}
          />
        </div>
      </section>

      <div className="mk-wrap">
        <Ticker />
      </div>

      <FeeAnchorBand />

      <div className="mk-wrap">
        <div className="mk-steps">
          <div>
            <b>1 · Tell her</b>
            <p>One sentence about your business or your target. That's enough to start.</p>
          </div>
          <div>
            <b>2 · Get your Baseline™</b>
            <p>A real valuation range — computed, sourced, and shown with its math.</p>
          </div>
          <div>
            <b>3 · She runs the deal</b>
            <p>Documents, diligence, buyers. She does the analyst work; you make the decisions.</p>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
