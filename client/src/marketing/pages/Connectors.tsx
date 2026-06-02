import { MarketingShell } from '../MarketingShell';
import { Brand } from '../Brand';
import { enterApp } from '../useEnterApp';

/* Where-it-runs surfaces */
const SURFACES: Array<{ glyph: 'circle' | 'diamond' | 'square'; h: string; p: string }> = [
  {
    glyph: 'circle',
    h: 'Claude',
    p: 'Install the smbX.ai Custom Connector. Ask Yulia for a valuation or a working capital peg without leaving Claude.',
  },
  {
    glyph: 'diamond',
    h: 'ChatGPT',
    p: 'Add smbX.ai as a GPT Action. Yulia’s tools, available in your GPT.',
  },
  {
    glyph: 'square',
    h: 'Any agent (MCP)',
    p: 'A standards-compliant Model Context Protocol endpoint. 53 deterministic tools, OAuth, and an audit trail on every call.',
  },
];

/* Stat band */
const STATS: Array<{ n: string; c: string }> = [
  { n: '53', c: 'deterministic tools, exposed over MCP' },
  { n: 'OAuth', c: 'scoped access on every connection' },
  { n: '1 : 1', c: 'same output in any surface, same hash' },
  { n: 'every call', c: 'writes an audit record you can verify' },
];

/* The guarantees */
const GUARANTEES: Array<{ label: string; p: string }> = [
  {
    label: 'SAME ARTIFACTS',
    p: 'A valuation built in Claude matches the one built in the app for the same inputs — same numbers, same audit stamp.',
  },
  {
    label: 'AUDIT TRAIL',
    p: 'Every tool call writes an audit record: who called, what methodology version, what inputs, what output hash.',
  },
  {
    label: 'THE LINE HOLDS EVERYWHERE',
    p: 'Yulia refuses the same things in every surface — no recommendations, no negotiation, no counterparty contact.',
  },
];

function SurfaceGlyph({ kind }: { kind: 'circle' | 'diamond' | 'square' }) {
  const base = { width: 14, height: 14, border: '2px solid var(--ink)' } as const;
  const style =
    kind === 'circle'
      ? { ...base, borderRadius: '50%' }
      : kind === 'diamond'
        ? { ...base, transform: 'rotate(45deg)' }
        : base;
  return (
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: 9,
        background: 'var(--surface-2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
      }}
    >
      <span style={style} />
    </div>
  );
}

export default function Connectors() {
  return (
    <MarketingShell>
      {/* HERO */}
      <section style={{ paddingBottom: 'calc(var(--pad-y) * .55)' }}>
        <div className="wrap center reveal" style={{ maxWidth: '54ch', margin: '0 auto' }}>
          <span className="eyebrow" style={{ justifyContent: 'center' }}>Connectors</span>
          <h1
            className="display"
            style={{ fontSize: 'clamp(2.3rem,4.6vw,4rem)', margin: '18px auto 0', maxWidth: '15ch' }}
          >
            <Brand /> is the substrate. Use it anywhere.
          </h1>
          <p className="lead" style={{ margin: '22px auto 0', maxWidth: '52ch' }}>
            Yulia lives in the <Brand /> app — and inside Claude, ChatGPT, and any agent that speaks MCP.
            Same diligence tools, same hash-verifiable artifacts, same audit trail, wherever you
            already work.
          </p>
        </div>
      </section>

      {/* WHERE IT RUNS */}
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="grid g3">
            {SURFACES.map((s, i) => (
              <div className="card hoverable reveal" data-d={i % 3} key={s.h}>
                <SurfaceGlyph kind={s.glyph} />
                <h3>{s.h}</h3>
                <p style={{ marginTop: 8 }}>{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STAT BAND */}
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div
            className="reveal grid g4"
            style={{
              gap: 0,
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
            }}
          >
            {STATS.map((s, i) => (
              <div
                key={s.n}
                style={{
                  padding: '28px 26px',
                  borderLeft: i === 0 ? 'none' : '1px solid var(--line)',
                }}
              >
                <div
                  className="mono"
                  style={{ fontSize: '1.7rem', fontWeight: 500, letterSpacing: '-.02em' }}
                >
                  {s.n}
                </div>
                <div style={{ marginTop: 8, fontSize: '.92rem', color: 'var(--ink-2)' }}>{s.c}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SETUP FLOW */}
      <section style={{ paddingTop: 'calc(var(--pad-y) * .5)' }}>
        <div
          className="wrap"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 56, alignItems: 'center' }}
        >
          <div className="reveal">
            <span className="eyebrow">Setup</span>
            <h2 style={{ marginTop: 18, maxWidth: '13ch' }}>Connected in three steps.</h2>
            <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 22 }}>
              {[
                { n: '1', h: 'Add the connector', p: 'Drop in the smbX.ai endpoint and authorize with OAuth.' },
                { n: '2', h: 'Scope what it can touch', p: 'Choose the deals, tools, and data the agent may access.' },
                { n: '3', h: 'Ask Yulia, anywhere', p: 'Request a valuation or a peg from inside your agent — same artifacts, same audit trail.' },
              ].map(step => (
                <div key={step.n} style={{ position: 'relative', paddingLeft: 46, minHeight: 38 }}>
                  <span
                    className="mono"
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      border: '2px solid var(--ink)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '.82rem',
                      fontWeight: 600,
                    }}
                  >
                    {step.n}
                  </span>
                  <h3 style={{ fontSize: '1.12rem' }}>{step.h}</h3>
                  <p style={{ marginTop: 4, color: 'var(--ink-2)', fontSize: '.97rem' }}>{step.p}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mock reveal" data-d="1">
            <div className="mock-bar">
              <span className="mock-dot" /><span className="mock-dot" /><span className="mock-dot" />
              <span className="mock-title">~/.mcp/smbx.json</span>
              <span className="mock-tag">mcp</span>
            </div>
            <div className="mock-body" style={{ background: 'var(--dk)', margin: -20, padding: 22 }}>
              <pre
                className="mono"
                style={{ fontSize: '.84rem', lineHeight: 1.85, color: 'rgba(255,255,255,.85)', margin: 0, whiteSpace: 'pre-wrap' }}
              >
{`{
  "server": "https://mcp.smbx.com",
  "auth":   "oauth",
  "scope":  ["valuation","working_capital"],
  "tools":  53
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* THE GUARANTEES */}
      <section className="dark">
        <div className="wrap">
          <div className="reveal" style={{ maxWidth: '50ch', marginBottom: 52 }}>
            <span className="eyebrow">The guarantees</span>
            <h2 style={{ marginTop: 18 }}>The same work, verifiable across surfaces.</h2>
          </div>
          <div className="grid g3">
            {GUARANTEES.map((g, i) => (
              <div className="reveal" data-d={i % 3} key={g.label}>
                <div
                  className="mono"
                  style={{ fontSize: '.74rem', color: 'var(--accent)', letterSpacing: '.06em', marginBottom: 12 }}
                >
                  {g.label}
                </div>
                <p>{g.p}</p>
              </div>
            ))}
          </div>
          <div
            className="mock reveal"
            style={{ marginTop: 44, background: 'var(--dk-2)', borderColor: 'var(--dk-line)', maxWidth: 620 }}
          >
            <div className="mock-bar" style={{ background: 'var(--dk-2)', borderColor: 'var(--dk-line)' }}>
              <span className="mock-title" style={{ color: 'rgba(255,255,255,.5)' }}>audit record</span>
              <span className="mock-tag" style={{ color: 'rgba(255,255,255,.4)' }}>mcp · tool call</span>
            </div>
            <div className="mock-body">
              <pre
                className="mono"
                style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.82)', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}
              >
{`tool      working_capital.peg
surface   claude · custom connector
method    v2.4
output    $486,200
hash      0x9f3a…d21  ✓ matches app`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-tight center">
        <div className="wrap stack reveal" style={{ alignItems: 'center' }}>
          <h2 style={{ maxWidth: '18ch' }}>Want Yulia where you already work?</h2>
          <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn btn-ink btn-lg" onClick={() => enterApp()}>
              See connector setup
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button className="btn btn-accent btn-lg" onClick={() => enterApp()}>Ask Yulia</button>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
