/**
 * /legal/privacy — practice-era copy (rewritten 2026-08-07 on Paul's
 * instruction: "How is there still copy from the old product pages. The app
 * as a 3rd party product was retired."). The February-2026 text described
 * the retired product — it named Yulia, promised a "deal room", and told
 * visitors how to "delete your account" on a site that no longer offers
 * accounts. This copy describes what the site ACTUALLY does now, aligned
 * with the Terms page's data story (same tools, same stored-data list, same
 * removal promise — the two pages must not disagree):
 *   · market-map engine: conversation processed to build the map; a lead
 *     (who asked, about what) is kept once an email is given; the
 *     conversation itself lives in the visitor's own browser (sessionStorage).
 *   · owner valuation: Google sign-in yields name + email only
 *     (server/services/ownerFunnel.ts verifyIdToken → email/name/sub);
 *     stored set mirrors Terms §2 verbatim.
 *   · report/brochure delivery: email in, PDF mailed; the reader cookie
 *     (smbx_reader, reportAccess.ts) is named because it persists 180 days.
 * No claim here goes beyond verified mechanics — "encrypted at rest" was
 * dropped (unverifiable from this repo), HTTPS-in-transit kept.
 * CARTA chrome via LegalFrame (2026-08-07).
 */
import { LegalFrame, LegalH2 } from './Terms';

const strong = { color: '#16181A', fontWeight: 600 } as const;

export default function Privacy() {
  return (
    <LegalFrame crumb="PRIVACY" title="Privacy Policy">
      <p style={{ margin: 0 }}><strong style={strong}>Last updated:</strong> August 7, 2026</p>

      <p style={{ margin: 0 }}>
        smbX.ai is the site of a buy-side corporate development practice. There is nothing here
        to sign up for — no customer accounts, no subscriptions. This notice covers what the
        site collects when you use its tools, what happens to it, and how to have it removed.
      </p>

      <div>
        <LegalH2>What we collect</LegalH2>
        <p style={{ margin: 0 }}>
          What you choose to share with the site's tools: your conversation with the market-map
          engine, and the figures and answers you provide to the owner valuation. Contact
          information you give us — the email address you ask a report, brochure, or valuation
          to be delivered to, and, if you sign in with Google to run the full valuation, the
          name and email address Google provides. We also keep standard technical data such as
          IP address and browser type in our server logs.
        </p>
        <p style={{ margin: '10px 0 0' }}>
          We also count page loads so we know how many people read the site. Each one records
          the page, the referring site, your browser family, and a keyed hash derived from your
          IP address and browser — the address itself is not stored, the hash cannot be reversed
          without our server's secret, it changes daily so it does not follow you between days,
          and these rows are deleted after 180 days. No third-party analytics and no advertising
          identifiers. No cookie is set on your browser for this; the practice's own signed-in
          browsers carry one, so our visits are excluded from the count rather than yours.
        </p>
      </div>

      <div>
        <LegalH2>How we use it</LegalH2>
        <p style={{ margin: 0 }}>
          To run the tool you asked for and deliver what it produced to the address you gave,
          to respond to your request, and to count how many people read the site — nothing
          else. When you ask for a market read or a brochure, the practice keeps the request
          itself: who asked, and about what. We do not sell your information, and we run no
          third-party advertising.
        </p>
      </div>

      <div>
        <LegalH2>What we store</LegalH2>
        <p style={{ margin: 0 }}>
          From the owner valuation, the same set the terms name: the output report, your
          general company information (trade, area, coarse size band, readiness read), and
          your contact information. Answers you save to your workspace are held only until
          your report is built or you delete them. We do not store confidential or proprietary
          business data beyond producing your output. Your engine conversation stays in your
          own browser so you can pick it back up — it is not kept as an account.
        </p>
      </div>

      <div>
        <LegalH2>AI processing</LegalH2>
        <p style={{ margin: 0 }}>
          The market-map engine and the owner valuation are built on AI language models. What
          you share with them is processed to produce your output — the market read, the
          valuation — and is not used to train AI models.
        </p>
      </div>

      <div>
        <LegalH2>Cookies</LegalH2>
        <p style={{ margin: 0 }}>
          Essential cookies only. When a report is delivered to your email and you open it,
          a reader cookie lets us send your next report in one click — it holds a signed
          delivery record, nothing more, and expires after 180 days. Signing in for the owner
          valuation sets a similar cookie for that session. No advertising cookies, no
          tracking pixels.
        </p>
      </div>

      <div>
        <LegalH2>Your right to removal</LegalH2>
        <p style={{ margin: 0 }}>
          At any time you may have us remove your information — report, company information,
          contact details, workspace — using the delete controls in the valuation itself or
          by contacting us. Removal is complete.
        </p>
      </div>

      <div>
        <LegalH2>Contact</LegalH2>
        <p style={{ margin: 0 }}>
          Questions or removal requests:{' '}
          <a href="mailto:hello@smbx.ai" className="ca-h-deepgreen" style={{ color: '#B8431E', borderBottom: '1px solid #B8431E', paddingBottom: 1 }}>hello@smbx.ai</a>.
          Our terms are at <a href="/legal/terms" className="ca-h-deepgreen" style={{ color: '#B8431E', borderBottom: '1px solid #B8431E', paddingBottom: 1 }}>/legal/terms</a>.
        </p>
      </div>
    </LegalFrame>
  );
}
