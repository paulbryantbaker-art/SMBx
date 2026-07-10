/**
 * `/sell` — wireframe 5c. Calm, principal voice: hero + sample Baseline™
 * card, then the anxiety-first FAQ (not features). Context piped: Yulia
 * opens seller/valuation-first from this page.
 */
import { useState } from 'react';
import { MarketingShell, HeroDock } from '../MarketingShell';

const FAQ = [
  {
    q: 'What happens to my employees?',
    a: 'That depends on the buyer you choose — and you choose. Yulia models how different buyer types treat teams, flags it in diligence, and keeps your priorities in the deal file. Nothing is committed without your decision.',
  },
  {
    q: 'Do I have to tell anyone I’m selling?',
    a: 'No. Everything starts confidential. When it’s time to go to market, buyers see a blind profile first — no name, no address — and nothing goes out without your approval.',
  },
  {
    q: 'What if I’m not ready yet?',
    a: 'Most owners start about a year before they mean to sell. Your Baseline™ is free — get the number now, see what moves it, and let it grow while you run the business.',
  },
];

export default function Sell() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <MarketingShell
      page="sell"
      placeholder="Tell Yulia about your business…"
      quickReplies={['How did you get this?', 'What would sharpen my number?']}
    >
      <section className="mk-hero">
        <div className="mk-wrap">
          <div className="mk-split">
            <div className="mk-split-copy">
              <span className="mk-seclabel">For owners</span>
              <h1 className="mk-h1" style={{ maxWidth: '14ch' }}>
                You built it. Find out what it's worth — today.
              </h1>
              <p className="mk-hero-sub">Yulia runs your deal. You make the decisions.</p>
              <HeroDock />
            </div>
            <div className="mk-split-aside">
              <div className="mk-card mk-sample">
                <span className="mk-seclabel">The Baseline™ · sample</span>
                <span className="mk-num mk-num-lg">
                  $1.08M<span className="dash">–</span>$1.89M
                </span>
                <div className="mk-rows">
                  <div><span>Revenue</span><b>$1.8M</b></div>
                  <div><span>SDE est.</span><b>$360–540K</b></div>
                  <div><span>Multiple</span><b>3.0–3.5×</b></div>
                </div>
                <span className="mk-note">every number sourced · sample deal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap">
          <h2 className="mk-h2">The questions that actually keep owners up</h2>
          <div className="mk-faq">
            {FAQ.map((item, i) => (
              <div className={`mk-faq-item${open === i ? ' open' : ''}`} key={item.q}>
                <button
                  type="button"
                  className="mk-faq-q"
                  aria-expanded={open === i}
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  {item.q}
                  <span className="pm">{open === i ? '–' : '+'}</span>
                </button>
                <div className="mk-faq-a"><p>{item.a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-band">
        <div className="mk-wrap">
          <p className="mk-band-line">
            A broker's cut on a $2M sale: <s>~$180K</s>. Ours: <em>$0.</em>
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
