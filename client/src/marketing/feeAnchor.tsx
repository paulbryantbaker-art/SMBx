/**
 * The broker-fee anchor — one computation, every surface.
 *
 * doubleLehman works in INTEGER CENTS (CLAUDE.md money law): 10% of the first
 * $1M, 8% of the second, 6% of the third, 4% of the fourth, 2% above. This is
 * an ILLUSTRATIVE market anchor (what a broker would charge) — smbX's own
 * price never varies with deal size or outcome.
 */
export function doubleLehmanCents(dealCents: number): number {
  const M = 100_000_000; // $1M in cents
  const bands = [10, 8, 6, 4]; // percent per successive $1M band
  let fee = 0;
  let left = dealCents;
  for (const pct of bands) {
    const slice = Math.min(left, M);
    fee += Math.round((slice * pct) / 100);
    left -= slice;
    if (left <= 0) return fee;
  }
  return fee + Math.round((left * 2) / 100);
}

/** Compact display for anchor amounts: "$180K", "$2.0M". */
export function fmtAnchorCents(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(dollars / 1000)}K`;
}

const ANCHOR_DEAL_CENTS = 200_000_000; // the $2M reference sale
const anchorFee = fmtAnchorCents(doubleLehmanCents(ANCHOR_DEAL_CENTS));

/** The cream fee-anchor band (wireframe 5a) — Home and Sell render this;
 *  Pricing computes the same figure live from its slider. */
export function FeeAnchorBand() {
  return (
    <section className="mk-band">
      <div className="mk-wrap">
        <p className="mk-band-line">
          A broker's cut on a $2M sale: <s>~{anchorFee}</s>. Ours: <em>$0.</em>
        </p>
      </div>
    </section>
  );
}
