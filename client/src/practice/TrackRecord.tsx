/**
 * /track-record — "About 150 deals. One side of the table." (Paul's copy
 * additions, 2026-07-11) + the explorable deal sheet (intensity pass,
 * 2026-07-12): the evidence as a thing a deal person can filter, search, and
 * hover — every second spent in it is trust being built. Role precision is
 * load-bearing: deal captain at Wrench, integration lead at JPMC — do not
 * blur. Zero fabrication: every entry and every rationale is group-level
 * fact from Paul's record; no invented years, sizes, or sectors.
 */
import { useMemo, useState } from 'react';
import PracticeShell from './PracticeShell';
import Mark from './Mark';
import { bookHref, bookTarget } from './leads';
import { trackEvent } from '../lib/analytics';

type DealGroup = 'founding' | 'addition' | 'tuckin' | 'greenfield' | 'jpmc';

const GROUPS: { key: DealGroup; label: string; tag: string; why: string }[] = [
  {
    key: 'founding',
    label: 'Founding platforms',
    tag: 'FOUNDING PLATFORM · 2016',
    why: 'One of the four founding companies that formed Wrench Group at close in 2016.',
  },
  {
    key: 'addition',
    label: 'Platform additions',
    tag: 'PLATFORM ADDITION',
    why: 'A new-market entry — acquired to anchor the platform in a new region.',
  },
  {
    key: 'tuckin',
    label: 'Regional tuck-ins',
    tag: 'REGIONAL TUCK-IN',
    why: 'A density play — folded into an existing regional anchor to deepen the market.',
  },
  {
    key: 'greenfield',
    label: 'Greenfield',
    tag: 'GREENFIELD LAUNCH',
    why: 'Not an acquisition — a de novo brand built inside the platform.',
  },
  {
    key: 'jpmc',
    label: 'JPMorgan Chase',
    tag: 'JPMC INTEGRATION',
    why: 'Integration led at JPMorgan Chase — bank-scale systems, people, and stakeholder work.',
  },
];

const NAMES: Record<DealGroup, string[]> = {
  founding: ['Coolray', 'Parker & Sons', 'Abacus', 'Berkeys'],
  addition: [
    'Morris-Jenkins', 'NexGen Air', 'Service Champions', 'Williams Comfort Air', 'CoolToday',
    'Lindstrom', 'Baker Brothers', "Boothe's", 'Mountain Air', 'Plumbline Services',
    'Florida Cool', 'Donovan Heat & Air',
  ],
  tuckin: [
    'Ragsdale', 'F.H. Furr', 'R.S. Andrews', 'Haller', 'Thomas & Galbraith', "Jarboe's",
    'Buckeye', 'Easy A/C', 'Collins Comfort Masters', 'Bellows', 'Day & Night', 'Climate Zone',
    'Koolco', 'Superior Service', 'Atlanta Water Works', 'Maine Home Services', 'PlumbRight',
    'Hometown Plumbing', 'Blanchard & Son',
  ],
  greenfield: ['Comfort Wave'],
  jpmc: [
    'Bank One', 'Washington Mutual', 'Chase Paymentech (JV and buyout)', 'Collegiate Funding Services',
    'Sears Canada card portfolio', 'Neovest', 'Vastera', 'Xign', 'clearXchange', 'Bloomspot', 'GoPago',
  ],
};

interface Deal { name: string; group: DealGroup; }
const DEALS: Deal[] = GROUPS.flatMap(g => NAMES[g.key].map(name => ({ name, group: g.key })));
const groupOf = (key: DealGroup) => GROUPS.find(g => g.key === key)!;

function DealSheet() {
  const [group, setGroup] = useState<'all' | DealGroup>('all');
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return DEALS.filter(d =>
      (group === 'all' || d.group === group) &&
      (!needle || d.name.toLowerCase().includes(needle)),
    );
  }, [group, q]);

  const pick = (g: 'all' | DealGroup) => {
    setGroup(g);
    trackEvent('practice_dealsheet_filtered', { group: g });
  };

  return (
    <div>
      <div className="pd-filters">
        <button type="button" className={`pd-fpill${group === 'all' ? ' on' : ''}`} onClick={() => pick('all')} aria-pressed={group === 'all'}>
          All · {DEALS.length}
        </button>
        {GROUPS.map(g => (
          <button
            type="button"
            key={g.key}
            className={`pd-fpill${group === g.key ? ' on' : ''}`}
            onClick={() => pick(g.key)}
            aria-pressed={group === g.key}
          >
            {g.label} · {NAMES[g.key].length}
          </button>
        ))}
        <input
          className="pd-dealsearch"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search the sheet"
          aria-label="Search the deal sheet"
        />
      </div>
      <div className="pd-dealcount">{filtered.length} OF {DEALS.length} ENTRIES</div>
      <div className="pd-dealgrid">
        {filtered.map(d => {
          const g = groupOf(d.group);
          return (
            <div className="pd-dealcard" key={`${d.group}-${d.name}`} tabIndex={0}>
              <div className="nm">{d.name}</div>
              <div className="tag">{g.tag}</div>
              <div className="why">{g.why}</div>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <div style={{ marginTop: 20, fontSize: 15, color: 'var(--pd-body)' }}>
          Nothing by that name on the sheet — try a shorter fragment.
        </div>
      )}
    </div>
  );
}

export default function TrackRecord() {
  return (
    <PracticeShell>
      {/* ── Hero ── */}
      <section className="pd-hero" style={{ paddingBottom: 'clamp(40px, 5vw, 70px)' }}>
        <div style={{ position: 'relative', maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
          <h1 className="pd-h1 pd-h1-seg" style={{ margin: 0 }}>About 150 deals. One side of the table.</h1>
          <div className="pd-sub" style={{ margin: '38px auto 0', maxWidth: 660 }}>
            A selection of the acquisitions our firm's leadership has captained — sourced,
            negotiated, closed, and integrated — prior to <Mark />.
          </div>
        </div>
      </section>

      {/* ── Stat strip ── */}
      <section className="pd-wrap">
        <div className="pd-stats" style={{ marginTop: 'clamp(30px, 4vw, 60px)' }}>
          <div className="pd-stat"><div className="n">150+</div><div className="l">Acquisitions closed</div></div>
          <div className="pd-stat"><div className="n">$5B+</div><div className="l">Revenue added</div></div>
          <div className="pd-stat"><div className="n">~$21B</div><div className="l">In transaction value touched</div></div>
          <div className="pd-stat"><div className="n">20</div><div className="l">Years on the buy side</div></div>
        </div>
      </section>

      {/* ── Wrench Group ── */}
      <section className="pd-wrap pd-section" style={{ paddingTop: 'clamp(90px, 10vw, 150px)' }}>
        <div className="pd-seclabel">Wrench Group — building a national platform</div>
        <div className="pd-mono" style={{ fontSize: 12.5, marginTop: 2 }}>2016–2025 · DIRECTOR, CORPORATE DEVELOPMENT &amp; M&amp;A INTEGRATION</div>
        <div style={{ marginTop: 22, fontSize: 17, lineHeight: 1.7, color: 'var(--pd-body)', maxWidth: '48em' }}>
          Recruited to build the M&amp;A engine for a new essential-services platform. Over nine
          years: four founding companies, 36 acquisitions, roughly $2.9B in enterprise value, and a
          national footprint — with Paul as deal captain on every one.
        </div>
      </section>

      {/* ── The deal sheet ── */}
      <section className="pd-wrap" style={{ paddingTop: 'clamp(50px, 6vw, 80px)' }}>
        <h2 className="pd-h2" style={{ fontSize: 'clamp(28px, 3.2vw, 40px)' }}>The deal sheet.</h2>
        <div style={{ marginTop: 14, fontSize: 16.5, lineHeight: 1.65, color: 'var(--pd-body)', maxWidth: '44em' }}>
          Filter it, search it, hover any entry for what it was. Deal-level terms stay
          confidential — the pattern doesn't.
        </div>
        <DealSheet />
      </section>

      {/* ── JPMorgan Chase ── */}
      <section className="pd-wrap pd-section" style={{ paddingTop: 'clamp(70px, 8vw, 120px)' }}>
        <div className="pd-seclabel">JPMorgan Chase — integration at scale</div>
        <div className="pd-mono" style={{ fontSize: 12.5, marginTop: 2 }}>2005–2015 · DIRECTOR, ACQUISITION INTEGRATION</div>
        <div style={{ marginTop: 22, fontSize: 17, lineHeight: 1.7, color: 'var(--pd-body)', maxWidth: '48em' }}>
          Led integration on the bank's largest platform and fintech acquisitions, delivering $2B+
          in synergies across 100+ stakeholder touchpoints.
        </div>
      </section>

      {/* ── Deloitte ── */}
      <section className="pd-wrap pd-section" style={{ paddingTop: 'clamp(70px, 8vw, 120px)' }}>
        <div className="pd-seclabel">Deloitte Consulting</div>
        <div className="pd-mono" style={{ fontSize: 12.5, marginTop: 2 }}>2010–2011 · ENGAGEMENT MANAGER, STRATEGY &amp; OPERATIONS</div>
        <div style={{ marginTop: 22, fontSize: 17, lineHeight: 1.7, color: 'var(--pd-body)', maxWidth: '48em' }}>
          Advised Fortune 500 clients on inorganic growth strategy, target operating models, and
          post-merger integration.
        </div>
      </section>

      {/* ── Closer ── */}
      <section className="pd-wrap pd-section" style={{ paddingTop: 'clamp(70px, 8vw, 120px)', paddingBottom: 'clamp(30px, 4vw, 60px)' }}>
        <div style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--pd-body)' }}>
          Thirty minutes with our team. Confidential, no retainer.
        </div>
        <div style={{ marginTop: 28 }}>
          <a className="pd-pill-primary pd-pill-lg" href={bookHref()} target={bookTarget()} rel={bookTarget() ? 'noreferrer' : undefined}>
            Confidential consultation
          </a>
        </div>
      </section>
    </PracticeShell>
  );
}
