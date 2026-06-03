import { MarketingShell } from '../MarketingShell';
import { Brand } from '../Brand';
import { enterApp } from '../useEnterApp';

/* Stat band */
const STATS: Array<{ n: string; c: string }> = [
  { n: 'software', c: 'not a broker, adviser, or appraiser' },
  { n: 'open', c: 'methodology you can read and check' },
  { n: '100%', c: 'of figures traceable to their source' },
  { n: '0', c: 'fees tied to your deal’s value or outcome' },
];

/* What we believe */
const BELIEFS: Array<{ n: string; h: string; p: string }> = [
  {
    n: '01',
    h: 'Diligence should be computable.',
    p: 'Most of what a deal team produces in the first weeks of a deal is calculation, not judgment. smbX.ai computes it — fast, traceable, and the same every time.',
  },
  {
    n: '02',
    h: 'The methodology should be open.',
    p: 'We publish The Diligence Standard so anyone can check our work. Trust comes from transparency, not from a black box.',
  },
  {
    n: '03',
    h: 'The line is a feature.',
    p: 'smbX.ai does not advise, recommend, negotiate, or represent. That restraint is what keeps you — and us — on the right side of the line. It is deliberate, and it is permanent.',
  },
];

export default function About() {
  return (
    <MarketingShell>
      {/* HERO */}
      <section style={{ paddingBottom: 'calc(var(--pad-y) * .5)' }}>
        <div className="wrap reveal" style={{ maxWidth: '60ch' }}>
          <span className="eyebrow">About</span>
          <h1
            className="display"
            style={{ fontSize: 'clamp(2.3rem,4.6vw,4rem)', marginTop: 18, maxWidth: '15ch' }}
          >
            We built the diligence work, not the advice.
          </h1>
          <p className="lead" style={{ marginTop: 24, maxWidth: '54ch' }}>
            <Brand /> is software. It computes the analysis that M&amp;A used to require a team to produce
            — and it stops, deliberately, at the line where software ends and licensed judgment
            begins.
          </p>
        </div>
      </section>

      {/* STAT BAND */}
      <section style={{ paddingTop: 0, paddingBottom: 0 }}>
        <div className="wrap">
          <div className="reveal statband">
            {STATS.map((s) => (
              <div className="statband-cell" key={s.c}>
                <div className="statband-num">{s.n}</div>
                <div className="statband-cap">{s.c}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT WE BELIEVE */}
      <section>
        <div className="wrap">
          <div className="reveal" style={{ maxWidth: '52ch', marginBottom: 56 }}>
            <span className="eyebrow">What we believe</span>
            <h2 style={{ marginTop: 18 }}>Three things, held without exception.</h2>
          </div>
          <div className="grid g3">
            {BELIEFS.map((b, i) => (
              <div className="reveal" data-d={i % 3} key={b.n}>
                <div
                  className="mono"
                  style={{ fontSize: '.74rem', color: 'var(--accent-strong)', letterSpacing: '.06em', marginBottom: 14 }}
                >
                  {b.n}
                </div>
                <h3>{b.h}</h3>
                <p style={{ marginTop: 10, color: 'var(--ink-2)' }}>{b.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* WHAT SMBX IS NOT — dark safe-harbor block (reused from Home) */}
      <section className="dark">
        <div className="wrap center">
          <h2 className="reveal" style={{ maxWidth: '20ch', margin: '0 auto' }}><Brand /> is software.</h2>
          <p className="lead reveal measure-wide" data-d="1" style={{ margin: '24px auto 0' }}>
            It is not a broker-dealer, investment adviser, or business broker. It is not
            a law firm, accounting firm, or appraiser. It does not negotiate, sign, file,
            hold funds, recommend transactions, or match buyers and sellers for a fee.
          </p>
          <p className="reveal" data-d="2" style={{ margin: '22px auto 0', fontFamily: 'var(--mono)', letterSpacing: '.04em', color: 'var(--accent)' }}>
            <Brand /> computes. You decide.
          </p>
        </div>
      </section>

      {/* WHO BUILDS IT */}
      <section style={{ background: 'var(--surface-2)' }}>
        <div
          className="wrap"
          style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 48, alignItems: 'start' }}
        >
          <div className="reveal">
            <div
              style={{
                aspectRatio: '1',
                background:
                  'repeating-linear-gradient(135deg,var(--surface-3),var(--surface-3) 8px,var(--surface-2) 8px,var(--surface-2) 16px)',
                borderRadius: 14,
                display: 'flex',
                alignItems: 'flex-end',
                padding: 16,
              }}
            >
              <span className="mono" style={{ fontSize: '.72rem', color: 'var(--ink-3)' }}>founder portrait</span>
            </div>
          </div>
          <div className="reveal" data-d="1">
            <span className="eyebrow">Who builds it</span>
            <h2 style={{ marginTop: 16, fontSize: '1.8rem', maxWidth: '18ch' }}>Built by Paul Bryant Baker.</h2>
            <p style={{ marginTop: 18, color: 'var(--ink-2)', maxWidth: '60ch', fontSize: '1.08rem', lineHeight: 1.65 }}>
              [Founder paragraph — to be written by Paul. Keep it plain; this audience distrusts polish.]
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-tight center">
        <div className="wrap stack reveal" style={{ alignItems: 'center' }}>
          <h2 style={{ maxWidth: '18ch' }}>Bring a deal. See what Yulia builds.</h2>
          <div style={{ marginTop: 26 }}>
            <button className="btn btn-accent btn-lg" onClick={() => enterApp()}>Ask Yulia</button>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
