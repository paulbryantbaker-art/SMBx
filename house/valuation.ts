/**
 * VALUATION BY DEAL TYPE — which methods apply, which do not, and why.
 *
 * Paul, 2026-08-15: *"the one place i am most interested in is the valuation
 * tools for different deal types."*
 *
 * WHAT WAS MISSING. `house/deal.ts` already has the arithmetic — SDE, EBITDA,
 * league bands, DCF, LBO, SBA sizing, earnout. `v19ModelRuntime` has 132
 * `MODEL.*` definitions. What nothing had was the ROUTING: given a deal, which
 * of those methods are the right ones to run, and which would produce a number
 * that is worse than no number.
 *
 * The DEFINITIVE catalog looks like it answers this and does not. Its 134 slots
 * carry 132 distinct `dealTypes` strings between them — effectively one
 * free-text tag per slot, mixing structures (`asset deal`, `carve-out`,
 * `sale-leaseback`), buyer types (`search fund`, `independent sponsor`, `ESOP`),
 * sectors (`software M&A`, `crypto M&A`), jurisdictions (`UK M&A`, `EU target`)
 * and workstreams (`IP diligence`, `title diligence`). Useful as tags for
 * retrieval; useless as a taxonomy, because nothing can route on a dimension
 * that mixes four kinds of thing.
 *
 * So this is a SMALL taxonomy of the structural situations that genuinely change
 * how a business is valued, scoped to what this practice does: buy-side, one
 * buyer per target, targets under $250M revenue.
 *
 * THE LAW THAT SHAPES IT. A method that does not apply is not omitted — it is
 * returned with its reason. Three of the failures this practice most needs to
 * avoid are all "a number was produced by the wrong method and looked fine":
 * an earnings multiple on a distressed business, a going-concern value on an
 * OpCo/PropCo where the property is most of the worth, and an opinion of value
 * on an ESOP sale, which is a regulated appraisal and not ours to sign.
 *
 * Pure: no db, no fs, no env, no clock, no model. Same contract as
 * `house/deal.ts`, so the app and a Cowork session route identically.
 */
import { LEAGUE_MULTIPLES, type ValuationResult } from './deal.js';

/* ─── the taxonomy ─────────────────────────────────────────────────────── */

/**
 * The structural situations that change the answer.
 *
 * Deliberately eight. Each earns its place by changing WHICH METHOD APPLIES —
 * not by being a different sector, a different jurisdiction or a different kind
 * of buyer, none of which do. A ninth should only be added when someone can
 * name the method it turns on or off.
 */
export type DealType =
  | 'going-concern'   // the ordinary case: a healthy operating business
  | 'platform'        // the first acquisition in a market
  | 'add-on'          // a bolt-on to an existing platform
  | 'carve-out'       // a division separated from a parent
  | 'opco-propco'     // the business and its real property, valued apart
  | 'distressed'      // earnings do not support a going-concern value
  | 'minority-recap'  // a stake, not control
  | 'esop';           // an employee-ownership transition

export const DEAL_TYPES: readonly DealType[] = [
  'going-concern', 'platform', 'add-on', 'carve-out',
  'opco-propco', 'distressed', 'minority-recap', 'esop',
] as const;

/** The valuation approaches this practice can actually run. */
export type Method =
  | 'sde-multiple'    // owner-operator earnings x a league band
  | 'ebitda-multiple' // institutional earnings x a league band
  | 'dcf'             // discounted forecast
  | 'asset-floor'     // orderly liquidation / net asset value
  | 'sotp'            // sum of the parts — business plus property, separately
  | 'lbo-afford'      // what CAN a buyer pay for a target return
  | 'synergy-adjusted'// standalone value plus the acquirer's own synergies
  | 'appraisal';      // a signed opinion of value — a licensed act

export interface MethodVerdict {
  method: Method;
  /**
   * `primary`   run it, and lead with it.
   * `secondary` run it as a cross-check on the primary.
   * `n/a`       do not run it — `why` says what it would get wrong.
   * `refer`     THE LINE: this is a licensed act. Coordinate the specialist.
   */
  status: 'primary' | 'secondary' | 'n/a' | 'refer';
  why: string;
}

export interface DealTypeSpec {
  type: DealType;
  name: string;
  /** One sentence a practitioner would recognise the situation from. */
  tell: string;
  methods: MethodVerdict[];
  /**
   * What has to be true before any number is quoted. These are the questions
   * that change the answer by more than the multiple does.
   */
  mustEstablish: string[];
  /** THE LINE, where this type tests it. Empty when it does not. */
  line?: string;
}

/* ─── the table ────────────────────────────────────────────────────────── */

const M = (method: Method, status: MethodVerdict['status'], why: string): MethodVerdict =>
  ({ method, status, why });

export const DEAL_TYPE_SPECS: readonly DealTypeSpec[] = [
  {
    type: 'going-concern',
    name: 'Going concern',
    tell: 'A healthy operating business bought whole, run on after close much as it is run now.',
    methods: [
      M('sde-multiple', 'primary', 'The owner-operator case (L1–L2). SDE is the right earnings base when one person\'s compensation and discretion dominate the P&L.'),
      M('ebitda-multiple', 'primary', 'The institutional case (L3+). Above roughly $1M of earnings the owner\'s package stops being the swing factor.'),
      M('dcf', 'secondary', 'A cross-check, never the lead. A DCF on an SMB is a forecast built on one owner\'s history, and the terminal value carries most of the answer.'),
      M('lbo-afford', 'secondary', 'Answers a different question — what you CAN pay for a target return — and the gap between that and the multiple range is the negotiating room.'),
      M('asset-floor', 'secondary', 'Worth knowing as a floor. If the asset value exceeds the earnings value, this is not a going concern and the type is wrong.'),
      M('sotp', 'n/a', 'Nothing to split. Use opco-propco if the business owns its real property.'),
      M('synergy-adjusted', 'n/a', 'No platform to synergise with. Use add-on.'),
      M('appraisal', 'refer', 'A signed opinion of value is a licensed act — coordinate a credentialed appraiser. We produce a range and its basis.'),
    ],
    mustEstablish: [
      'Which earnings base — SDE or EBITDA — and therefore which league band.',
      'Every add-back, with the document it comes from. Add-backs are where a seller\'s number and a defended one diverge by 15–30%.',
      'Whether the owner\'s role is replaceable, and at what cost. That cost is an add-back in reverse.',
    ],
  },
  {
    type: 'platform',
    name: 'Platform',
    tell: 'The first acquisition in a market — the base everything after it bolts onto.',
    methods: [
      M('ebitda-multiple', 'primary', 'The standalone value, which is what you are actually buying. A platform is priced as itself.'),
      M('lbo-afford', 'primary', 'Load-bearing here in a way it is not elsewhere: the platform carries the debt for the add-ons that follow, so what it can service determines the whole programme.'),
      M('dcf', 'secondary', 'More defensible than usual — a platform is held long enough for a forecast to mean something.'),
      M('sde-multiple', 'secondary', 'Only if the platform is genuinely owner-operator scale, which is unusual for a platform.'),
      M('synergy-adjusted', 'n/a', 'A platform HAS no platform to synergise with. Paying a synergy premium for the first deal is paying for a programme that does not exist yet.'),
      M('asset-floor', 'secondary', 'A floor. A platform trading below its asset value is telling you the earnings thesis is wrong.'),
      M('sotp', 'n/a', 'Nothing to split unless it owns its property — use opco-propco.'),
      M('appraisal', 'refer', 'A signed opinion of value is a licensed act. We produce a range and its basis; a credentialed appraiser signs.'),
    ],
    mustEstablish: [
      'What the add-on pipeline actually is. A platform multiple justified by a roll-up thesis needs the roll-up to be real.',
      'Whether the management team survives close and can absorb integrations.',
      'Debt capacity at the platform, because that is the constraint on everything after it.',
    ],
  },
  {
    type: 'add-on',
    name: 'Add-on',
    tell: 'A bolt-on to a platform the client already owns.',
    methods: [
      M('synergy-adjusted', 'primary', 'The whole point. Standalone value plus the acquirer\'s OWN synergies — overhead the platform already carries, routes that overlap, purchasing that consolidates.'),
      M('ebitda-multiple', 'primary', 'Establishes the standalone floor first. Never quote the synergised number as the value; it is the ceiling of what the buyer could rationally pay.'),
      M('sde-multiple', 'secondary', 'Common at add-on scale — many bolt-ons are owner-operator businesses.'),
      M('lbo-afford', 'secondary', 'Against the COMBINED entity, not the target alone.'),
      M('dcf', 'n/a', 'A standalone forecast for a business about to stop being standalone answers a question nobody asked.'),
      M('asset-floor', 'secondary', 'A floor on the standalone business, before any synergy is added.'),
      M('sotp', 'n/a', 'Nothing to split unless it owns its property — use opco-propco.'),
      M('appraisal', 'refer', 'A signed opinion of value is a licensed act. We produce a range and its basis; a credentialed appraiser signs.'),
    ],
    mustEstablish: [
      'WHOSE synergies. Cost synergies the buyer creates belong to the buyer and should not be paid away in the price — this is the single most common way an add-on gets overpaid for.',
      'Which specific overheads actually disappear, with the line item. "Corporate overhead" is not a synergy.',
      'Integration cost and how long it runs. A synergy arriving in year three is worth its discount.',
    ],
  },
  {
    type: 'carve-out',
    name: 'Carve-out',
    tell: 'A division being separated from a parent that currently provides it with services.',
    methods: [
      M('ebitda-multiple', 'primary', 'On STANDALONE earnings, which are not the earnings in the parent\'s segment reporting.'),
      M('dcf', 'secondary', 'Useful because the standalone cost structure has to be built up anyway, and that build-up is the forecast.'),
      M('lbo-afford', 'secondary', 'Run it on the STANDALONE cost structure, not the parent\'s reported segment earnings — the dis-synergies below change what the deal can service.'),
      M('synergy-adjusted', 'secondary', 'Only where the buyer already has the functions the parent was providing.'),
      M('sde-multiple', 'n/a', 'A carved-out division has no owner-operator, so there is no SDE to compute.'),
      M('asset-floor', 'secondary', 'A floor, and unusually informative here: a division often carries assets the parent never allocated to it.'),
      M('sotp', 'n/a', 'Nothing to split unless real property comes with the division — use opco-propco.'),
      M('appraisal', 'refer', 'A signed opinion of value is a licensed act. We produce a range and its basis; a credentialed appraiser signs.'),
    ],
    mustEstablish: [
      'DIS-SYNERGIES — the standalone cost of everything the parent supplied: finance, HR, IT, insurance, procurement terms. This runs 3–8% of revenue and it comes OFF the earnings the parent reports.',
      'The TSA: what the parent provides after close, for how long, at what price, and what happens when it ends.',
      'Which contracts and licences actually transfer, and which need consent. A carve-out that loses its key contract at close is a different deal.',
      'Whether the division has ever had its own audited financials. Usually it has not.',
    ],
  },
  {
    type: 'opco-propco',
    name: 'OpCo / PropCo',
    tell: 'The business owns the real property it operates from.',
    methods: [
      M('sotp', 'primary', 'The only correct frame. The operating business and the real property are two assets with two buyer pools and two multiples; one blended number hides which one you are paying for.'),
      M('ebitda-multiple', 'primary', 'On the OpCo, AFTER charging it a market rent. A business occupying its own building rent-free shows earnings that will not survive a sale-leaseback.'),
      M('sde-multiple', 'secondary', 'Same rent adjustment, at owner-operator scale.'),
      M('asset-floor', 'primary', 'Here the property IS a large part of the answer, not a floor.'),
      M('lbo-afford', 'secondary', 'Financing differs by leg — property debt and business debt are different instruments on different terms.'),
      M('dcf', 'secondary', 'On the OpCo leg only.'),
      M('synergy-adjusted', 'n/a', 'Unless it is also an add-on, in which case run both types.'),
      M('appraisal', 'refer', 'THE PROPERTY LEG NEEDS A REAL APPRAISAL, and that is a licensed act in every state. Our number is a placeholder until it lands.'),
    ],
    mustEstablish: [
      'MARKET RENT, from a source. Every dollar of the difference between actual and market rent moves the OpCo value by the multiple.',
      'Whether the client wants the property at all. Many buyers do not, and a sale-leaseback changes the financing and the price.',
      'Environmental condition. On a trade business — HVAC, plumbing, auto — this is not a formality.',
      'Title, easements, and whether the property can legally continue its current use.',
    ],
    line: 'Real property valuation is a licensed appraisal in every state, and so is an opinion on title. THE_LINE.md §3c routes both. We model the legs and name the specialists; we do not sign either number.',
  },
  {
    type: 'distressed',
    name: 'Distressed',
    tell: 'Earnings do not support a going-concern value — losses, covenant breach, or a forced timeline.',
    methods: [
      M('asset-floor', 'primary', 'The governing method. When earnings do not support a value, what the assets fetch in an orderly liquidation is the value.'),
      M('sotp', 'primary', 'Distressed businesses are usually worth more in pieces, and finding out is the work.'),
      M('lbo-afford', 'secondary', 'Reframed: what can be paid such that the turnaround still clears a return.'),
      M('ebitda-multiple', 'n/a', 'THE DANGEROUS ONE. A multiple on depressed or negative earnings produces a number that looks like a valuation and is not one. If earnings are the wrong base, no multiple fixes it.'),
      M('sde-multiple', 'n/a', 'Same failure as the EBITDA multiple, at owner-operator scale: SDE on a business that is not covering its costs is a multiple of the wrong base.'),
      M('dcf', 'n/a', 'A forecast for a business whose survival is the open question is a forecast of the assumption, not of the business.'),
      M('synergy-adjusted', 'n/a', 'Synergies on top of a going-concern value that does not exist.'),
      M('appraisal', 'refer', 'Licensed act, and here it is usually needed rather than optional.'),
    ],
    mustEstablish: [
      'Whether this is a going concern at all. That question comes before any method.',
      'The capital structure and who is actually impaired — the answer is negotiated with creditors, not derived from earnings.',
      'Whether it is a §363 sale, an Article 9 foreclosure, an ABC, or an out-of-court deal. Each has a different process, timeline and set of protections.',
      'What normalised earnings would be if the distress were fixed, and what fixing it costs.',
    ],
    line: 'Insolvency structuring is counsel\'s — §363, Article 9, preference and fraudulent-conveyance exposure all turn on law, not arithmetic. THE_LINE.md §3b. G28 in the DEFINITIVE catalog covers the mechanics.',
  },
  {
    type: 'minority-recap',
    name: 'Minority / recap',
    tell: 'Buying a stake rather than control, or the owner is rolling equity and staying.',
    methods: [
      M('ebitda-multiple', 'primary', 'Establishes enterprise value first — the stake is priced off it, not instead of it.'),
      M('dcf', 'secondary', 'More relevant than usual: a minority holder is buying a cash-flow stream, not an asset to reshape.'),
      M('sde-multiple', 'secondary', 'At owner-operator scale.'),
      M('lbo-afford', 'n/a', 'A minority holder does not control the capital structure, so what the deal can service is not their decision to model.'),
      M('asset-floor', 'secondary', 'A floor on the enterprise, not on the stake.'),
      M('synergy-adjusted', 'n/a', 'No control, no ability to realise synergies.'),
      M('sotp', 'n/a', 'Use opco-propco if property is involved.'),
      M('appraisal', 'refer', 'Licensed act — and minority discounts are exactly where an appraiser\'s judgement is the defensible one.'),
    ],
    mustEstablish: [
      'The governance package. A minority stake with board control and a veto is worth materially more than one without, and the difference is not a multiple adjustment.',
      'Exit mechanics — drag, tag, put/call, and on what timetable. A minority stake with no exit is not an investment.',
      'Whether a discount for lack of control and marketability applies, and on what basis. This is where an appraiser earns the fee.',
      'What the rolling owner is actually rolling, at what valuation, and whether it is the same one the buyer is paying.',
    ],
  },
  {
    type: 'esop',
    name: 'ESOP transition',
    tell: 'The owner is selling to an employee stock ownership plan.',
    methods: [
      M('appraisal', 'refer', 'AN INDEPENDENT APPRAISAL IS THE TRANSACTION, not an input to it. ERISA requires the trustee to obtain one from a qualified independent appraiser, and the price is what that appraisal supports.'),
      M('ebitda-multiple', 'n/a', 'Not because the arithmetic is wrong — because a number we produce here has no standing and could be read as influencing a price a fiduciary is required to set independently.'),
      M('sde-multiple', 'n/a', 'No earnings multiple, by us, on an ESOP. The trustee\'s independent appraiser sets the price; a second number in circulation is the problem, whatever base it uses.'),
      M('dcf', 'n/a', 'A forecast is an input to the appraisal the trustee commissions, not a parallel answer for the buy side to hold.'),
      M('lbo-afford', 'n/a', 'There is no buyer affordability question — the plan is the buyer, and its capacity is part of the appraisal and the lender\'s test.'),
      M('asset-floor', 'n/a', 'Even a floor is a value, and a value from us is the thing to avoid here.'),
      M('sotp', 'n/a', 'Splitting the parts is still valuing them. Same standing problem, more numbers.'),
      M('synergy-adjusted', 'n/a', 'No acquirer, no synergies — the employees are the buyer and the business is unchanged.'),
    ],
    mustEstablish: [
      'That this is genuinely an ESOP and not a management buyout being described loosely. They are not the same transaction and only one of them is off-limits.',
      'Who the trustee is and whether an appraiser is already engaged.',
    ],
    line: 'NOT OUR LANE, and the sharpest case in the taxonomy. ESOP valuation is an ERISA-governed independent appraisal; the trustee owes a fiduciary duty to the plan, and a buy-side adviser producing a value here is the kind of fact pattern the "never even accused" test exists to avoid. Decline the number, explain why, and coordinate the appraiser. THE_LINE.md §3d.',
  },
];

/* ─── lookups ──────────────────────────────────────────────────────────── */

export function specFor(type: DealType): DealTypeSpec {
  const s = DEAL_TYPE_SPECS.find(d => d.type === type);
  if (!s) throw new Error(`unknown deal type: ${type}`);
  return s;
}

/** The methods to actually run, in the order to run them. */
export function methodsToRun(type: DealType): Method[] {
  const s = specFor(type);
  return [
    ...s.methods.filter(m => m.status === 'primary').map(m => m.method),
    ...s.methods.filter(m => m.status === 'secondary').map(m => m.method),
  ];
}

/**
 * Why a method is not being run — the string a UI shows in place of a number.
 *
 * Returns null when the method IS being run. The Trainline cue this borrows is
 * the "Not available" cell: the row still appears, so the reader learns the
 * option exists and why it is closed, rather than wondering what was hidden.
 */
export function whyNot(type: DealType, method: Method): string | null {
  const v = specFor(type).methods.find(m => m.method === method);
  if (!v) return `${method} is not in the method set.`;
  return v.status === 'n/a' || v.status === 'refer' ? v.why : null;
}

/** Everything this type must hand to a licensed specialist. */
export function referrals(type: DealType): MethodVerdict[] {
  return specFor(type).methods.filter(m => m.status === 'refer');
}

/**
 * Does an earnings multiple apply at all?
 *
 * The one-line guard worth having on its own, because "multiply earnings by a
 * band" is the reflex, and the two types where it is wrong — distressed and
 * ESOP — are the two where being wrong costs the most.
 */
export function earningsMultipleApplies(type: DealType): boolean {
  return specFor(type).methods.some(
    m => (m.method === 'sde-multiple' || m.method === 'ebitda-multiple')
      && (m.status === 'primary' || m.status === 'secondary'),
  );
}

/**
 * The league band for an earnings figure, refusing where the type forbids it.
 *
 * A thin wrapper over `house/deal.ts` valuation() whose only job is to make the
 * refusal impossible to skip: calling valuation() directly on a distressed deal
 * returns a confident number.
 */
export function bandFor(
  type: DealType,
  earnings: number,
  league: keyof typeof LEAGUE_MULTIPLES | string,
): { ok: true; run: { earnings: number; league: string } } | { ok: false; why: string } {
  if (!earningsMultipleApplies(type)) {
    const v = specFor(type).methods.find(m => m.method === 'ebitda-multiple');
    return { ok: false, why: v?.why ?? 'An earnings multiple does not apply to this deal type.' };
  }
  return { ok: true, run: { earnings, league: String(league) } };
}

/** Re-exported so a caller needs one import to route AND compute. */
export type { ValuationResult };
