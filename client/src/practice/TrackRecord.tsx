/**
 * /track-record — "About 150 deals. One side of the table." + the
 * attribution shield (Paul, 2026-07-13 final copy). LAW-weighted page.
 *
 * The six standing rules (enforced here and wherever these names appear):
 *  1. Always "led or co-led" — never "deal captain on every one", never
 *     "closed" without qualification.
 *  2. Always "selected transactions" — the wall is a selection, which is what
 *     reconciles it with the 150+ figure.
 *  3. The attribution line appears WHEREVER the deal names appear (this page,
 *     the landing band, any deck/PDF).
 *  4. Names, not logos — logos imply a client relationship that never existed.
 *  5. Never "our clients" for any employer transaction. (2026-07-18: employer
 *     names are anonymized on all public surfaces — Paul: "a Global Investment
 *     Bank and World Class PE Backed Aggregator".)
 *  6. The bank role is integration, not origination (Director of Acquisition
 *     Integration) — do not stretch it.
 * Zero fabrication: every name is group-level fact from Paul's record.
 */
import PracticeShell from './PracticeShell';
import Mark from './Mark';
import { bookHref, bookTarget } from './leads';

/** The shield — reconciles the stat strip with the wall, plainly true, and
 *  makes any accusation of misrepresentation impossible. Rendered wherever
 *  the deal names appear; never a footnote. */
export const ATTRIBUTION =
  'Selected transactions led or co-led by Paul Baker in the course of his employment at a world-class PE-backed aggregator and a global investment bank. These transactions were completed by those firms and were not smbX engagements.';

export function AttributionLine({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      style={{
        fontStyle: 'italic', fontSize: 15, lineHeight: 1.6, color: 'var(--pd-tert)',
        maxWidth: '48em', borderLeft: '2px solid var(--pd-border)', paddingLeft: 16,
        ...style,
      }}
    >
      {ATTRIBUTION}
    </div>
  );
}

const WRENCH_GROUPS: { label: string; names: string[] }[] = [
  { label: 'Founding platforms (2016)', names: ['Coolray', 'Berkeys', 'Abacus', 'Parker & Sons'] },
  {
    label: 'Platform additions',
    names: [
      'Baker Brothers', 'Plumbline Services', 'Florida Cool', 'CoolToday', 'Donovan Heat & Air',
      'Service Champions North', 'Williams Comfort Air', "Boothe's Heating Air & Plumbing",
      'Morris-Jenkins', 'Mountain Air', 'NexGen Air Conditioning & Plumbing',
      'Lindstrom Air Conditioning & Plumbing',
    ],
  },
  {
    label: 'Regional tuck-ins',
    names: [
      'Easy A/C', 'Collins Comfort Masters', "Jarboe's", 'Thomas & Galbraith', 'Buckeye Heating & Cooling',
      'Maine Home Services', 'Atlanta Water Works', 'Superior Service', 'Ragsdale', 'F.H. Furr',
      'R.S. Andrews', 'Haller Enterprises', 'PlumbRight Services', 'Climate Zone',
      'Day & Night Air Conditioning', 'Hometown Plumbing', 'Koolco Mechanical',
      'Bellows Plumbing Heating & Air', 'Blanchard & Son Plumbing',
    ],
  },
  { label: 'Greenfield', names: ['Comfort Wave'] },
];

const JPMC_NAMES = [
  'Bank One', 'Washington Mutual', 'Chase Paymentech (JV and buyout)', 'Collegiate Funding Services',
  'Sears Canada card portfolio', 'Neovest', 'Vastera', 'Xign', 'clearXchange', 'Bloomspot', 'GoPago',
];

function TransactionGroups({ groups }: { groups: { label: string; names: string[] }[] }) {
  return (
    <>
      <div className="pd-mono" style={{ marginTop: 30, color: 'var(--pd-tert)' }}>SELECTED TRANSACTIONS</div>
      <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {groups.map(g => (
          <div key={g.label}>
            <div className="pd-mono" style={{ color: 'var(--pd-coral-link)' }}>{g.label.toUpperCase()}</div>
            <div className="pd-body" style={{ marginTop: 8, maxWidth: '52em' }}>{g.names.join(' · ')}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function TrackRecord() {
  return (
    <PracticeShell>
      {/* ── Hero ── */}
      <section className="pd-hero" style={{ paddingBottom: 'clamp(40px, 5vw, 70px)' }}>
        <div style={{ position: 'relative', maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
          <div className="pd-seclabel" style={{ marginBottom: 16 }}>Selected transaction experience</div>
          <h1 className="pd-h1 pd-h1-seg" style={{ margin: '0 auto', maxWidth: '15em' }}>About 150 deals. One side of the table.</h1>
          <div className="pd-sub" style={{ margin: '30px auto 0', maxWidth: 640 }}>
            A selection of the acquisitions Paul Baker led or co-led over two decades in corporate
            development.
          </div>
          <AttributionLine style={{ margin: '28px auto 0', textAlign: 'left' }} />
        </div>
      </section>

      {/* ── Stat strip ── */}
      <section className="pd-wrap">
        <div className="pd-stats" style={{ marginTop: 'clamp(30px, 4vw, 60px)' }}>
          <div className="pd-stat"><div className="n">150</div><div className="l">Acquisitions</div></div>
          <div className="pd-stat"><div className="n">$5B+</div><div className="l">Revenue added</div></div>
          <div className="pd-stat"><div className="n">~$21B</div><div className="l">In transaction value touched</div></div>
          <div className="pd-stat accent"><div className="n">0</div><div className="l">Sell-side transactions. Ever.</div></div>
        </div>
      </section>

      {/* ── The aggregator (employer anonymized, Paul 2026-07-18) ── */}
      <section className="pd-wrap pd-section" style={{ paddingTop: 'clamp(90px, 10vw, 150px)' }}>
        <div className="pd-seclabel">A World-Class PE-Backed Aggregator</div>
        <div className="pd-mono" style={{ marginTop: 2 }}>2016–2025 · DIRECTOR, CORPORATE DEVELOPMENT &amp; M&amp;A INTEGRATION</div>
        <div className="pd-body" style={{ marginTop: 22, maxWidth: '48em' }}>
          Recruited to build the M&amp;A pipeline and execution engine for a new essential-services
          platform. Over nine years Paul led or co-led 36 acquisitions representing roughly $2.9B in
          enterprise value — then built the integration playbook that made them work.
        </div>
        <TransactionGroups groups={WRENCH_GROUPS} />
      </section>

      {/* ── The bank (employer anonymized, Paul 2026-07-18) ── */}
      <section className="pd-wrap pd-section" style={{ paddingTop: 'clamp(70px, 8vw, 120px)' }}>
        <div className="pd-seclabel">A Global Investment Bank</div>
        <div className="pd-mono" style={{ marginTop: 2 }}>2005–2015 · DIRECTOR, ACQUISITION INTEGRATION</div>
        <div className="pd-body" style={{ marginTop: 22, maxWidth: '48em' }}>
          Led integration on the bank's largest platform and fintech acquisitions, delivering over
          $2B in synergies across 100+ stakeholder touchpoints.
        </div>
        <TransactionGroups groups={[{ label: 'Selected transactions', names: JPMC_NAMES }]} />
      </section>

      {/* ── Deloitte ── */}
      <section className="pd-wrap pd-section" style={{ paddingTop: 'clamp(70px, 8vw, 120px)' }}>
        <div className="pd-seclabel">Deloitte Consulting</div>
        <div className="pd-mono" style={{ marginTop: 2 }}>2010–2011 · ENGAGEMENT MANAGER, STRATEGY &amp; OPERATIONS</div>
        <div className="pd-body" style={{ marginTop: 22, maxWidth: '48em' }}>
          Advised Fortune 500 clients on inorganic growth strategy, target operating models, and
          post-merger integration.
        </div>
      </section>

      {/* ── Closer ── */}
      <section className="pd-wrap pd-section" style={{ paddingTop: 'clamp(70px, 8vw, 120px)', paddingBottom: 'clamp(30px, 4vw, 60px)' }}>
        <div className="pd-statement" style={{ maxWidth: '16em' }}>
          Every transaction above was done for a buyer. That hasn't&nbsp;changed.
        </div>
        <div style={{ marginTop: 32 }}>
          <a className="pd-pill-primary pd-pill-lg" href={bookHref()} target={bookTarget()} rel={bookTarget() ? 'noreferrer' : undefined}>
            Confidential consultation
          </a>
        </div>
      </section>
    </PracticeShell>
  );
}
