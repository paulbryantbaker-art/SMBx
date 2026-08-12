/**
 * /legal/terms — the practice's terms (copy rewritten 2026-08-04; CARTA
 * chrome 2026-08-07 — these pages were the last public surfaces still
 * wearing the retired product-era PublicLayout, linked from the new footer).
 *
 * The owner-evaluation section is the text OWNER_EVAL_TERMS_VERSION
 * (server/services/ownerFullEval.ts) records acceptance of — rewording it
 * BUMPS THE VERSION, or the recorded acceptance stops meaning anything.
 * The Carta pass changed ZERO copy here for exactly that reason.
 */
import { Link } from 'wouter';
import PracticeShell from '../../practice/PracticeShell';

const SERIF = "'Source Serif 4', Georgia, serif";
const MONO = "'IBM Plex Mono', monospace";

export function LegalFrame({ crumb, title, children }: { crumb: string; title: string; children: React.ReactNode }) {
  return (
    <PracticeShell>
      <main style={{ background: '#FFFFFF', overflow: 'clip' }}>
        <section style={{ maxWidth: 820, margin: '0 auto', padding: 'clamp(80px, 8vw, 130px) 32px clamp(100px, 10vw, 160px)' }}>
          <nav data-hs="0" aria-label="Breadcrumb" style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.12em', color: '#7C8187' }}>
            <Link href="/" className="ca-h-deepgreen" style={{ color: '#0A7A58' }}>SMBX</Link>
            <span style={{ margin: '0 10px' }}>/</span>
            <span style={{ color: '#16181A' }}>{crumb}</span>
          </nav>
          <h1 data-hs="1" style={{ margin: '30px 0 0', fontFamily: SERIF, fontWeight: 550, fontSize: 'clamp(36px, 3.8vw, 56px)', lineHeight: 1.08, letterSpacing: '-0.013em' }}>{title}</h1>
          <div data-hs="2" style={{ marginTop: 'clamp(32px, 4vw, 48px)', fontSize: 15.5, lineHeight: 1.7, color: '#4A4F54', display: 'flex', flexDirection: 'column', gap: 28 }}>
            {children}
          </div>
        </section>
      </main>
    </PracticeShell>
  );
}

export function LegalH2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ margin: '0 0 12px', fontFamily: SERIF, fontWeight: 600, fontSize: 22, lineHeight: 1.25, color: '#16181A' }}>{children}</h2>;
}

const strong = { color: '#16181A', fontWeight: 600 } as const;

export default function Terms() {
  return (
    <LegalFrame crumb="TERMS" title="Terms of Use">
      <p style={{ margin: 0 }}><strong style={strong}>Last updated:</strong> August 4, 2026</p>

      <p style={{ margin: 0 }}>
        smbX.ai is the site of a buy-side corporate development practice. These terms cover the
        site's tools — the market-map engine and the owner valuation — what you share with them,
        and what their outputs are and are not.
      </p>

      <div id="owner-evaluation">
        <LegalH2>The owner valuation — terms version 2026-08-04</LegalH2>
        <p style={{ margin: '0 0 12px' }}>
          <strong style={strong}>1 · It is an estimate.</strong> The valuation is a
          market-data estimate produced by our methodologies: published transaction ranges for
          your trade, applied to figures you provide, with the drivers buyers price. It is not
          an appraisal, not an opinion of value, not an offer, and not an engagement. Nothing
          is concrete until a formal process runs under its own written engagement. By running
          the valuation you agree to this.
        </p>
        <p style={{ margin: '0 0 12px' }}>
          <strong style={strong}>2 · How your data is used.</strong> You agree that
          the figures and answers you provide are used to run the evaluation process. We do not
          store confidential or proprietary business data beyond that use. What we store: the
          output report, your general company information (trade, area, coarse size band,
          readiness read), and your contact information. In the full evaluation, answers you
          save to your workspace are held only until your report is built or you delete them.
        </p>
        <p style={{ margin: 0 }}>
          <strong style={strong}>3 · Your right to removal.</strong> At any time you
          may have us remove your information — report, company information, contact details,
          workspace — using the delete controls in the evaluation itself or by contacting us.
          Removal is complete.
        </p>
      </div>

      <div>
        <LegalH2>The practice</LegalH2>
        <p style={{ margin: 0 }}>
          We advise buyers only, and we never take a fee from an owner. We are not a
          broker-dealer, investment adviser, law firm, or accounting firm, and nothing on this
          site is securities, legal, tax, or appraisal advice — where a matter needs a licensed
          specialist, we say so and coordinate one.
        </p>
      </div>

      <p style={{ margin: 0, fontSize: 13.5, color: '#7C8187' }}>
        Questions or removal requests: hello@smbx.ai. Our privacy notice
        is at <a href="/legal/privacy" className="ca-h-deepgreen" style={{ color: '#0A7A58', borderBottom: '1px solid #0A7A58', paddingBottom: 1 }}>/legal/privacy</a>.
      </p>
    </LegalFrame>
  );
}
