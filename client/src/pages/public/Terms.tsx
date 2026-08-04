/**
 * /legal/terms — the practice's terms (rewritten 2026-08-04, Paul: "the terms
 * of service obviously just needs to be for our data privacy and
 * acknowledgment that our evaluation is an estimate based on our
 * methodologies… we need to not talk about the app at all because we will not
 * be selling the app to third parties"). The product-era terms (subscription
 * ladder, software service language) are GONE — the app is the practice's
 * private instrument and no third party is ever onboarded to it.
 *
 * The owner-evaluation section is the text OWNER_EVAL_TERMS_VERSION
 * (server/services/ownerFullEval.ts) records acceptance of — rewording it
 * BUMPS THE VERSION, or the recorded acceptance stops meaning anything.
 */
import PublicLayout from '../../components/public/PublicLayout';

export default function Terms() {
  const h2 = 'font-sans text-xl font-bold text-[#1a1918] mb-3 m-0';
  return (
    <PublicLayout>
      <section className="max-w-[800px] mx-auto px-10 pt-20 pb-20 max-md:px-5 max-md:pt-12 max-md:pb-12">
        <h1 className="font-sans text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.03em] mb-10 m-0">
          Terms of Use
        </h1>
        <div className="space-y-8 text-[15px] text-[#4A4843] leading-[1.7]">
          <p className="m-0"><strong className="text-[#1a1918]">Last updated:</strong> August 4, 2026</p>

          <p className="m-0">
            smbX.ai is the site of a buy-side corporate development practice. These terms cover the
            site's tools — the market-map engine and the owner valuation — what you share with them,
            and what their outputs are and are not.
          </p>

          <div id="owner-evaluation">
            <h2 className={h2}>The owner valuation — terms version 2026-08-04</h2>
            <p className="m-0 mb-3">
              <strong className="text-[#1a1918]">1 · It is an estimate.</strong> The valuation is a
              market-data estimate produced by our methodologies: published transaction ranges for
              your trade, applied to figures you provide, with the drivers buyers price. It is not
              an appraisal, not an opinion of value, not an offer, and not an engagement. Nothing
              is concrete until a formal process runs under its own written engagement. By running
              the valuation you agree to this.
            </p>
            <p className="m-0 mb-3">
              <strong className="text-[#1a1918]">2 · How your data is used.</strong> You agree that
              the figures and answers you provide are used to run the evaluation process. We do not
              store confidential or proprietary business data beyond that use. What we store: the
              output report, your general company information (trade, area, coarse size band,
              readiness read), and your contact information. In the full evaluation, answers you
              save to your workspace are held only until your report is built or you delete them.
            </p>
            <p className="m-0">
              <strong className="text-[#1a1918]">3 · Your right to removal.</strong> At any time you
              may have us remove your information — report, company information, contact details,
              workspace — using the delete controls in the evaluation itself or by contacting us.
              Removal is complete.
            </p>
          </div>

          <div>
            <h2 className={h2}>The practice</h2>
            <p className="m-0">
              We advise buyers only, and we never take a fee from an owner. We are not a
              broker-dealer, investment adviser, law firm, or accounting firm, and nothing on this
              site is securities, legal, tax, or appraisal advice — where a matter needs a licensed
              specialist, we say so and coordinate one.
            </p>
          </div>

          <p className="m-0 text-[13.5px] text-[#8A8681]">
            Questions or removal requests: use the contact in this site's footer. Our privacy notice
            is at <a href="/legal/privacy" className="underline">/legal/privacy</a>.
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
