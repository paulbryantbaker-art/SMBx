import { Link } from 'wouter';
import { MarketingShell } from '../MarketingShell';
import { Brand } from '../Brand';
import { enterApp } from '../useEnterApp';
import { ClosingCTA } from '../components/ClosingCTA';
import {
  StatRail,
  GateModelExplorer,
  ModelAnatomy,
  ConformanceConsole,
} from '../components/StandardInteractive';

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* The four defensibility pillars (§5). Copy is verbatim from the spec. */
const PILLARS: Array<{ title: string; body: string }> = [
  {
    title: 'Deterministic.',
    body: 'No language model touches the math path. Same inputs, same version, same output — always.',
  },
  {
    title: 'Cited.',
    body: 'Every figure resolves to a controlling authority — IRC section, case, or market study — from a 233-source register. Unverifiable claims are stripped before delivery.',
  },
  {
    title: 'Verifiable.',
    body: 'Each output carries an input hash, an output hash, its model version, and its methodology pin. Reproduce it or audit it.',
  },
  {
    title: 'Bounded.',
    body: 'THE LINE is enforced in code: the Standard computes; it never advises, negotiates, brokers, or opines. Every output is labeled deterministic, professional-handoff, or research-only.',
  },
];

export default function Standard() {
  return (
    <MarketingShell>
      {/* ============================================================
          1 · HERO — dark band, version tag, count-up stat rail
          ============================================================ */}
      <section className="dark std-hero-sec">
        <div className="wrap">
          <div className="reveal std-hero">
            <span className="std-vtag mono">DEFINITIVE v1.1 · METHODOLOGY V19</span>
            <h1 className="display std-hero-h1">The Diligence Standard.</h1>
            <p className="std-hero-sub">
              An open specification for computational M&amp;A diligence.
            </p>
            <p className="lead std-hero-lead">
              Every model, gate, and authority behind Yulia&rsquo;s numbers —
              published, versioned, and conformance-tested. Read it, run it,
              build against it. No account required.
            </p>
          </div>
          <div className="reveal" data-d="1">
            <StatRail />
          </div>
        </div>
      </section>

      {/* ============================================================
          2 · WHAT IT IS — not a black box
          ============================================================ */}
      <section className="std-what">
        <div className="wrap">
          <div className="reveal std-what-grid">
            <h2 className="std-what-h2">Not a black box. A computational substrate.</h2>
            <p className="lead std-what-body">
              <Brand /> computes M&amp;A diligence — it doesn&rsquo;t advise. The
              Standard is the deterministic engine underneath: 123 models across
              30 decision gates, every output traced to a controlling authority
              and reproducible from its inputs. Same inputs, same methodology
              version, same numbers — every time.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          3 · HOW · INTERACTIVE #1 — gate → model explorer
          ============================================================ */}
      <section className="std-browse">
        <div className="wrap">
          <div className="reveal std-sec-head">
            <h2>Browse the substrate.</h2>
            <p className="lead std-sec-intro">
              Thirty gates route a deal to the models it needs. Pick a domain to
              see what&rsquo;s inside — and how each model is classified.
            </p>
          </div>
          <div className="reveal" data-d="1">
            <GateModelExplorer />
          </div>
        </div>
      </section>

      {/* ============================================================
          4 · HOW · INTERACTIVE #2 — anatomy of a model
          ============================================================ */}
      <section className="std-anat-sec">
        <div className="wrap">
          <div className="reveal std-sec-head">
            <h2>Anatomy of a model.</h2>
            <p className="lead std-sec-intro">
              Open one up. Every model declares its inputs, its computation, the
              authorities that govern it, a worked example, and an audit packet
              you can verify.
            </p>
          </div>
          <div className="reveal" data-d="1">
            <ModelAnatomy />
          </div>
          <div className="reveal std-anat-more" data-d="2">
            <Link href="/standard/working-capital-peg" className="link-arrow">
              See the full worked example <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          5 · WHY — defensibility + why use it
          ============================================================ */}
      <section className="std-why">
        <div className="wrap">
          <div className="reveal std-sec-head">
            <h2>Why you can trust the number — and build on it.</h2>
          </div>
          <div className="reveal std-pillars" data-d="1">
            {PILLARS.map((p) => (
              <div className="std-pillar" key={p.title}>
                <span className="std-pillar-mark" aria-hidden="true" />
                <h3 className="std-pillar-title">{p.title}</h3>
                <p className="std-pillar-body">{p.body}</p>
              </div>
            ))}
          </div>
          <p className="reveal std-why-foot" data-d="2">
            For a deal team, that&rsquo;s analyst-grade work in minutes —
            auditable and portable. For an agent, it&rsquo;s a substrate you can
            call, conform to, and trust.
          </p>
        </div>
      </section>

      {/* ============================================================
          6 · OPEN SPEC · INTERACTIVE #3 — proposal + conformance + discovery
          ============================================================ */}
      <section className="dark std-open">
        <div className="wrap">
          <div className="reveal std-open-head">
            <h2>Published, versioned, and yours to run.</h2>
            <p className="lead std-open-lead">
              We publish The Diligence Standard as an open specification — and
              propose it as the shared reference for computational M&amp;A
              diligence. Not a manifesto: a spec you can read, a conformance
              suite you can run, and reference implementations you can clone.
            </p>
          </div>

          <div className="reveal" data-d="1">
            <ConformanceConsole />
          </div>

          <p className="reveal std-open-caveat mono" data-d="2">
            Reference implementations cover four core models today (M109, M139,
            M199, M206); the full corpus is rolling out. We&rsquo;re proposing a
            standard, not claiming an industry.
          </p>

          <div className="reveal std-open-actions" data-d="2">
            <button className="btn btn-accent" onClick={() => enterApp()}>
              Ask Yulia
            </button>
            <Link href="/connectors" className="link-arrow std-open-buildlink">
              Build against the Standard <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          7 · Closing CTA (unchanged)
          ============================================================ */}
      <ClosingCTA heading="Read the method. Then watch Yulia run it on your numbers." />
    </MarketingShell>
  );
}
