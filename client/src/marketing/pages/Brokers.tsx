/**
 * `/brokers` — wireframe 5e. Terse, practitioner voice: no definitions,
 * no hand-holding; capability chips, not narrative. Context piped: Yulia
 * opens in density mode from this page.
 *
 * The wireframe's throughput stats ([18 hrs] / [3×] / [days]) are flagged
 * "need real sourcing" — they are intentionally NOT rendered until sourced
 * (honesty rule: no fabricated metrics).
 */
import { MarketingShell, HeroDock } from '../MarketingShell';

const CAPS = [
  'Valuation + comps memo',
  'CIM / teaser drafts',
  'Buyer screening',
  'Data-room prep',
  'Q&A grunt work',
];

export default function Brokers() {
  return (
    <MarketingShell
      page="brokers"
      placeholder="Tell Yulia about the deal you're working…"
      quickReplies={['Draft a CIM outline', 'What do you need from me?']}
    >
      <section className="mk-hero">
        <div className="mk-wrap">
          <div className="mk-split-copy" style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
            <span className="mk-seclabel">For brokers · advisors · sponsors</span>
            <h1 className="mk-h1" style={{ maxWidth: '16ch' }}>
              Yulia does the analyst work. You run the deal.
            </h1>
            <div className="mk-cap-chips">
              {CAPS.map(c => <span className="mk-chip" key={c} style={{ cursor: 'default' }}>{c}</span>)}
            </div>
            <div style={{ width: 'min(520px, 100%)' }}>
              <HeroDock />
            </div>
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap">
          <div className="mk-steps" style={{ paddingTop: 0 }}>
            <div>
              <b>Hand her the grunt work</b>
              <p>Recasts, comps memos, CIM drafts, buyer lists, data-room prep, Q&amp;A responses.</p>
            </div>
            <div>
              <b>Keep the relationship</b>
              <p>Your listing, your client, your close. She never contacts a counterparty for you.</p>
            </div>
            <div>
              <b>Flat software pricing</b>
              <p>No referral cut, no share of your commission. Ever.</p>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
