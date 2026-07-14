/**
 * The five buyer-segment pages — content per Paul's reworked copy deck
 * (2026-07-11): answers are The work / The practitioner / Your side, with the
 * buy-side loyalty stated once, warmly, in "Your side" — never as a repeated
 * oath. Structure: hero → pain ledger → answers → CTA (no pledge strip).
 *
 * Detail expansion (Paul, 2026-07-13: "these need more detail… give an
 * overview for the multiple scenarios for the various customer types… we sell
 * corp dev as a service and need to be faster and more nimble than the next
 * group"): each segment now carries a `scenario` — how a deal actually runs
 * for that buyer type, mapped onto the engagement and threaded with the speed
 * edge — plus `gets`, the concrete deliverables. The scenario drives both the
 * segment page's full walkthrough and the landing's per-type How-it-works
 * overview. Every line stays inside THE LINE: the client decides and signs, we
 * coordinate the licensed specialists, buy-side only, one client per target.
 */
export interface SegmentPain { name: string; body: string; tag: string; }
export interface SegmentAnswer { k: string; v: string; }
export interface ScenarioStep { k: string; v: string; }
export interface Segment {
  slug: string;
  footerLabel: string;
  cardTitle: string;
  cardBody: string;
  cardLink: string;
  h1: string;
  sub: string;
  /** The segment's bind at display scale — always a restatement of an
   *  approved copy line, never a new factual claim. */
  stat: { n: string; l: string };
  painTitle: string;
  pains: SegmentPain[];
  answers: SegmentAnswer[];
  /** How a deal runs for this buyer type — one tailored sentence, speed-forward,
   *  used as the scenario intro on the segment page and the landing overview. */
  scenarioLede: string;
  /** The engagement mapped to this buyer's situation: five phases, tailored. */
  scenario: ScenarioStep[];
  /** What you walk away with — the concrete deliverables of an engagement. */
  gets: string[];
  /** Tailored close (Paul's clean master, 2026-07-13) — replaces the generic
   *  segment CTA. The engine is named "acquisition engine" per the standing
   *  naming law (Paul's master said "Target Mapping Engine"; retired name). */
  ctaH: string;
  ctaBody: string;
}

export const SEGMENTS: Segment[] = [
  {
    slug: 'family-offices',
    footerLabel: 'Family offices',
    cardTitle: 'Family offices',
    cardBody: 'Direct-deal control without building a deal team. Institutional-grade diligence and a disciplined price — on demand.',
    cardLink: 'For family offices →',
    h1: 'Direct‑deal control. No deal‑team build.',
    sub: 'Your thesis, our team on it — no blind pools, no club-deal compromises. Institutional-grade diligence and a disciplined price, on demand, deal by deal.',
    stat: { n: '0', l: 'standing overhead — deal capacity that switches on when you need it, and costs nothing when you don’t' },
    painTitle: 'Direct deals reward a standing team. You shouldn’t have to build one.',
    pains: [
      {
        name: 'Bandwidth',
        body: 'Direct deals compete with everything else on the family’s plate. Diligence gaps can get papered over — or the deal dies of slowness.',
        tag: 'DILIGENCE GAPS',
      },
      {
        name: 'Price discipline',
        body: 'Without a full-time deal function, it’s easy to pay for the story instead of the numbers — and nobody in the room is paid to say so.',
        tag: 'OVERPAYING RISK',
      },
      {
        name: 'Speed',
        body: 'Institutional buyers with standing teams see more, move first, and win the targets worth owning.',
        tag: 'LOSING TO FASTER BUYERS',
      },
    ],
    answers: [
      { k: 'The work', v: 'We generate comprehensive market maps and execute off-market sourcing specifically tailored to your family’s investment mandate. Within days, we deliver actionable CIM triage, financial recasts, and diligence checklists — giving your family office the execution capacity of a top-tier PE firm, switching on exactly when you need it, and costing nothing when you don’t.' },
      { k: 'The practitioner', v: 'A senior deal captain runs the process — the analysis, the seller conversations, and the negotiation — while maintaining strict price discipline.' },
      { k: 'Your side', v: 'Buy-side is all we do, and we take one client per target — so your thesis is never resold or shared, and your deal has our full attention.' },
    ],
    scenarioLede: 'You bring the thesis; we switch on a full deal team for it, then switch it off when the deal is done. Institutional discipline, no standing overhead — and fast enough to win the target worth owning.',
    scenario: [
      { k: 'Thesis', v: 'We turn your investment thesis into a target profile a search can run against — sector, size, geography, the economics you actually want to own.' },
      { k: 'Sourcing', v: 'We map the whole market and make discreet, direct approaches to owners who were never for sale — so you see proprietary deals, not the brokered slice everyone else is bidding on.' },
      { k: 'The read', v: 'We recast the financials, build the model, and give you the disciplined number — the one the story doesn’t support. Nobody in the room is paid to talk you into it.' },
      { k: 'Structure & diligence', v: 'We structure the offer and financing, run diligence, and coordinate the attorneys, CPAs, and lenders your deal needs. You approve every move.' },
      { k: 'Close & hold', v: 'We drive the negotiation to signing — you sign — and stay through the first 180 days, where a good purchase becomes a functioning asset.' },
    ],
    gets: [
      'A market map of your segment',
      'An off-market target list with owner research',
      'A financial recast and valuation model',
      'A diligence checklist with the specialists coordinated',
      'The offer and financing structure',
      'A 100-day integration plan',
    ],
    ctaH: 'Ready to map your direct-deal mandate?',
    ctaBody: 'Enter your family office’s investment criteria into our acquisition engine. Within two minutes, we will generate a preliminary market read on your thesis.',
  },
  {
    slug: 'independent-sponsors',
    footerLabel: 'Independent sponsors',
    cardTitle: 'Independent sponsors',
    cardBody: 'Control the deal before you raise a dollar — with diligence and models that make capital partners say yes.',
    cardLink: 'For sponsors →',
    h1: 'Control the deal before you raise a dollar.',
    sub: 'Investor-grade diligence and models that make capital partners say yes — without burning uncompensated months on deals that fade.',
    stat: { n: '1', l: 'conversation — what a dead deal costs you here, instead of a quarter' },
    painTitle: 'The sponsor’s trap: prove the deal to raise the money, spend the money to prove the deal.',
    pains: [
      {
        name: 'Credibility',
        body: 'Capital partners want a locked-up deal with real diligence behind it. Sellers want proof of funds. You’re asked to show both before anyone pays for anything.',
        tag: 'CHICKEN AND EGG',
      },
      {
        name: 'Dead-deal cost',
        body: 'Every broken deal is months of sourcing, reading, and modeling — uncompensated. The economics only work if the research phase costs you almost nothing.',
        tag: 'UNCOMPENSATED TIME',
      },
      {
        name: 'Focus',
        body: 'You can’t source the next deal, run diligence on this one, and court capital partners at the same time. Something slips — usually the pipeline.',
        tag: 'PIPELINE STALLS',
      },
    ],
    answers: [
      { k: 'The work', v: 'We compress the research and packaging timeline. We deliver rapid CIM triage, highly defensible financial models, and comprehensive diligence checklists in days, not weeks. We provide the institutional-grade collateral required to confidently lock up the target with an LOI and immediately satisfy your capital partners.' },
      { k: 'The practitioner', v: 'A senior deal team packages the deal exactly how capital partners expect to see it — and keeps the seller engaged while you finalize funding.' },
      { k: 'Your side', v: 'We take one client per target — so the deal you worked to find stays yours to close, never shopped to another sponsor.' },
    ],
    scenarioLede: 'You control the deal before you raise a dollar. We produce the investor-grade package in days — so a dead deal costs you a conversation, not an uncompensated quarter.',
    scenario: [
      { k: 'Thesis', v: 'We sharpen your thesis into a target profile and a market map, so you’re chasing the deals worth locking up — not everything that moves.' },
      { k: 'Sourcing', v: 'Off-market outreach in our name finds proprietary targets and keeps the seller engaged while you line up capital.' },
      { k: 'The package', v: 'CIM triage, the recast, and the model — built in days, exactly how capital partners expect to see them.' },
      { k: 'Structure & diligence', v: 'We structure the deal and run diligence to the standard your capital partners and lenders will underwrite, so you present a locked-up deal with real work behind it.' },
      { k: 'Close', v: 'We drive the process to signing while you finalize funding. The deal you found stays yours — never shopped to another sponsor.' },
    ],
    gets: [
      'A sharpened thesis and market map',
      'An off-market target list',
      'CIM triage, recast, and model',
      'An investor-grade diligence package',
      'The deal structure and financing model',
      'Negotiation support to signing',
    ],
    ctaH: 'Let’s build your investor-ready target profile.',
    ctaBody: 'Run your thesis through our acquisition engine. Get a preliminary read on the universe, the economics, and the risks in two minutes so you can pitch capital partners with confidence.',
  },
  {
    slug: 'pe-firms',
    footerLabel: 'PE firms',
    cardTitle: 'Lower-middle-market PE',
    cardBody: 'Proprietary add-on flow and senior execution capacity that flexes with your pipeline — without a million-dollar BD build.',
    cardLink: 'For PE firms →',
    h1: 'Proprietary add‑on flow. No million‑dollar BD build.',
    sub: 'Senior execution capacity that flexes with your pipeline — sourcing, triage, and models on demand, for the platform and every add-on after it.',
    stat: { n: '~1/5', l: 'of its addressable market is all a typical LMM fund actually reaches. We map the rest.' },
    painTitle: 'The math of LMM coverage doesn’t work with people alone.',
    pains: [
      {
        name: 'Coverage',
        body: 'A typical LMM fund actually reaches a sliver of its addressable market — call it a fifth on a good year. The best targets never hit a process at all.',
        tag: 'DEAL-FLOW GAP',
      },
      {
        name: 'Partner time',
        body: 'Partners spend a third or more of their week sourcing — the most expensive hours in the firm spent on work that shouldn’t need them.',
        tag: '30–40% ON SOURCING',
      },
      {
        name: 'Add-on capacity',
        body: 'Every platform thesis promises add-ons; execution capacity is what runs out. Deals queue behind the deals already in flight.',
        tag: 'EXECUTION BOTTLENECK',
      },
    ],
    answers: [
      { k: 'The work', v: 'We build complete, off-market maps of your entire target segment — capturing the operators who will never hire a broker. We deliver rapid target triage, detailed financial models, and Investment Committee-ready memos generated at the exact pace of your pipeline. Your partners stop sourcing, and start closing.' },
      { k: 'The practitioner', v: 'Senior execution capacity that flexes deal by deal — outreach, process, and negotiation managed at the pace of your pipeline.' },
      { k: 'Your side', v: 'One client per target — your add-on pipeline is yours alone, never shared with a competing buyer.' },
    ],
    scenarioLede: 'Proprietary add-on flow and senior execution capacity that flexes with your pipeline — for the platform and every add-on after it, without a million-dollar BD build.',
    scenario: [
      { k: 'Thesis', v: 'We take your platform thesis and define the add-on profile — then map the whole segment, not the fifth of it that reaches a broker.' },
      { k: 'Sourcing', v: 'Off-market outreach surfaces proprietary targets at the pace your pipeline moves, so partners stop spending a third of the week sourcing.' },
      { k: 'The read', v: 'Triage, models, and IC-ready memos generated as fast as deals come in — the analysis keeps up instead of queuing behind the deals already in flight.' },
      { k: 'Structure & diligence', v: 'We run process and diligence deal by deal and coordinate the specialists — so capacity flexes up when you have three add-ons in flight at once.' },
      { k: 'Close & integrate', v: 'We drive each deal to signing and support the first 180 days, so the add-on thesis actually compounds.' },
    ],
    gets: [
      'An add-on profile and full-segment map',
      'A proprietary target pipeline',
      'Triage, models, and IC-ready memos',
      'Diligence run with specialists coordinated',
      'The deal structure',
      'Integration support',
    ],
    ctaH: 'Ready to map your next platform add-on?',
    ctaBody: 'Feed your add-on criteria into our acquisition engine. Bypass the brokered auctions and get a preliminary read on the off-market landscape in about two minutes.',
  },
  {
    slug: 'searchers',
    footerLabel: 'Searchers',
    cardTitle: 'Searchers & solo acquirers',
    cardBody: 'A senior deal team in your corner for your first — and biggest — acquisition. Level the field against the seller’s broker.',
    cardLink: 'For searchers →',
    h1: 'Level the field against the seller’s broker.',
    sub: 'A senior deal team in your corner for your first — and biggest — acquisition. We run the diligence and the model so your SBA lender and your instincts both say go.',
    stat: { n: '1st', l: 'your first deal is the other side’s hundredth. We even the odds.' },
    painTitle: 'Your first deal is the other side’s hundredth.',
    pains: [
      {
        name: 'Information gap',
        body: 'The seller’s broker prices deals every week. You’re seeing your first recast, your first working-capital peg, your first earnout — live, with your savings on the table.',
        tag: 'ASYMMETRY',
      },
      {
        name: 'Walking away',
        body: 'The hardest skill in acquisitions is killing a deal you’ve fallen for — before diligence costs, lender fees, and sunk months make the choice for you.',
        tag: 'KNOW WHEN TO WALK',
      },
      {
        name: 'The SBA clock',
        body: 'SBA timelines, lender checklists, and a personal guarantee at the end of it. Miss a step and the deal slips; sign too fast and you own the mistake — personally.',
        tag: 'PERSONAL GUARANTEE',
      },
    ],
    answers: [
      { k: 'The work', v: 'We level the information asymmetry. We deliver precise financial recasts, bulletproof valuation models, comprehensive diligence checklists, and highly structured SBA lender packages. We verify every number against what the market actually pays, and we explicitly tell you when it’s time to walk away.' },
      { k: 'The practitioner', v: 'A senior deal team that has seen the broker playbook, tells you when the price is wrong, and explicitly advises you to walk when the numbers demand it.' },
      { k: 'Your side', v: 'We work for you, and only you — your interests are the only ones we’re paid to look after, start to finish.' },
    ],
    scenarioLede: 'A senior deal team in your corner for your first — and biggest — acquisition. We run the recast, the model, and the diligence so your SBA lender and your instincts both say go.',
    scenario: [
      { k: 'Thesis', v: 'We turn what you want to buy into a real target profile and map the market, so you’re not searching blind.' },
      { k: 'Sourcing', v: 'Off-market outreach opens doors a first-time buyer can’t — and puts you in front of owners before a broker runs an auction.' },
      { k: 'The read', v: 'Your first recast, working-capital peg, and earnout are our thousandth. We build the model, check it against what the market actually pays, and tell you when the price is wrong.' },
      { k: 'Structure & diligence', v: 'We assemble the lender package, run diligence to the SBA’s checklist, and coordinate your attorney and CPA — and we tell you to walk when the numbers demand it.' },
      { k: 'Close', v: 'We drive the negotiation to signing — you sign, with a personal guarantee you understand — informed, not rushed.' },
    ],
    gets: [
      'A target profile and market map',
      'Off-market introductions',
      'A recast, valuation model, and earnout/working-capital reads',
      'An SBA-ready lender package',
      'A diligence checklist with attorney and CPA coordinated',
      'A straight answer on when to walk',
    ],
    ctaH: 'Let’s stress-test your first acquisition thesis.',
    ctaBody: 'Put your criteria into our acquisition engine. In two minutes, we’ll show you the real market economics, competitive landscape, and potential blind spots to protect your capital.',
  },
  {
    slug: 'operators',
    footerLabel: 'Operators',
    cardTitle: 'Operators buying competitors',
    cardBody: 'Discreet third-party approaches that protect your position, objective pricing, and a repeatable playbook — run for you, deal by deal.',
    cardLink: 'For operators →',
    h1: 'Inorganic growth, without tipping your hand.',
    sub: 'Discreet third-party approaches that protect your position, objective pricing, and a repeatable playbook — run for you, deal by deal, while you run the business.',
    stat: { n: '0', l: 'whispers reach your market before you decide otherwise' },
    painTitle: 'Buying a competitor is the deal you can’t be seen doing.',
    pains: [
      {
        name: 'Confidentiality',
        body: 'The moment you approach a competitor directly, you’ve shown your strategy — to them, their broker, and eventually your market.',
        tag: 'POSITION EXPOSED',
      },
      {
        name: 'Objectivity',
        body: 'You know the target too well. Familiarity prices in synergies you’ll create — which means paying the seller for value that’s yours.',
        tag: 'DON’T PAY FOR YOUR OWN SYNERGIES',
      },
      {
        name: 'Distraction',
        body: 'Your team runs the business. A months-long deal process run in-house is a tax on the operation the deal is supposed to grow.',
        tag: 'INTEGRATION BANDWIDTH',
      },
    ],
    answers: [
      { k: 'The work', v: 'Total operational discretion. We execute quiet market mapping and target reads without a whisper reaching your competitors. We deliver objective valuation models that price the business exactly as it is today — ensuring you never pay the seller a premium for the operational synergies your team will create post-close.' },
      { k: 'The practitioner', v: 'Discreet third-party approaches made in our firm’s name, maintaining a disciplined process and a repeatable playbook — while your executive team stays focused on the core business.' },
      { k: 'Your side', v: 'Total discretion — your interest stays private until you decide otherwise — and one client per target, so your strategy is never shared.' },
    ],
    scenarioLede: 'Grow by acquisition without tipping your hand. Discreet third-party approaches, objective pricing, and a repeatable playbook — run for you while you run the business.',
    scenario: [
      { k: 'Thesis', v: 'We define the target profile and quietly map your market — every operator worth owning — without a whisper reaching a competitor.' },
      { k: 'Sourcing', v: 'Approaches are made in our firm’s name, so your interest stays private until you decide otherwise.' },
      { k: 'The read', v: 'We price the business as it is — not as you’ll make it — so you don’t pay the seller for the synergies you’ll create.' },
      { k: 'Structure & diligence', v: 'We structure the deal, run diligence, and coordinate the specialists — keeping the whole process off your team’s plate.' },
      { k: 'Close & integrate', v: 'We drive to signing — you sign — and support the first 180 days, so the deal grows the business instead of taxing it.' },
    ],
    gets: [
      'A quiet market map',
      'Third-party approaches made in our name',
      'An objective valuation, priced as-is',
      'The deal structure and financing',
      'Diligence run with specialists coordinated',
      'An integration plan',
    ],
    ctaH: 'Ready to quietly map your competitors?',
    ctaBody: 'Tell our acquisition engine what kind of regional operator you want to absorb. We will generate a confidential preliminary market read in two minutes, without tipping your hand.',
  },
];

export function getSegment(slug: string): Segment | undefined {
  return SEGMENTS.find(s => s.slug === slug);
}
