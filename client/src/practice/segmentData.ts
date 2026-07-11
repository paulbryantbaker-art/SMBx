/**
 * The five buyer-segment pages — content assembled from the corpdevservices
 * README "Segment Pages" guidance (messaging hooks + pain points per segment;
 * structure: hero → pain ledger → how smbX answers → pledge strip → CTA).
 * Copy is strong-draft per the handoff — iterate freely.
 */
export interface SegmentPain { name: string; body: string; tag: string; }
export interface SegmentAnswer { k: string; v: string; }
export interface Segment {
  slug: string;
  footerLabel: string;
  cardTitle: string;
  cardBody: string;
  cardLink: string;
  h1: string;
  sub: string;
  painTitle: string;
  pains: SegmentPain[];
  answers: SegmentAnswer[];
}

export const SEGMENTS: Segment[] = [
  {
    slug: 'family-offices',
    footerLabel: 'Family offices',
    cardTitle: 'Family offices',
    cardBody: 'Direct-deal control without building a deal team. Institutional-grade diligence and a disciplined price — on demand.',
    cardLink: 'For family offices →',
    h1: 'Direct-deal control. No deal-team build.',
    sub: 'Your thesis, our engine, no blind pools, no club-deal compromises. Institutional-grade diligence and a disciplined price — on demand, deal by deal.',
    painTitle: 'Direct deals reward a standing team. You shouldn’t have to build one.',
    pains: [
      {
        name: 'Bandwidth',
        body: 'Direct deals compete with everything else on the family’s plate. Diligence gaps get papered over — or the deal dies of slowness.',
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
      { k: 'The engine', v: 'Market maps and off-market sourcing on your thesis, with models and diligence checklists in days — deal capacity that switches on when you need it and costs nothing when you don’t.' },
      { k: 'The practitioner', v: 'A senior operator runs the process, keeps the price disciplined, and handles every seller conversation — no junior hand-offs, no committee lag.' },
      { k: 'The pledge', v: 'One buyer per target, never the sell side, never two-sided. Your mandate is never resold, shopped, or shared.' },
    ],
  },
  {
    slug: 'independent-sponsors',
    footerLabel: 'Independent sponsors',
    cardTitle: 'Independent sponsors',
    cardBody: 'Control the deal before you raise a dollar — with diligence and models that make capital partners say yes.',
    cardLink: 'For sponsors →',
    h1: 'Control the deal before you raise a dollar.',
    sub: 'Investor-grade diligence and models that make capital partners say yes — without burning uncompensated months on deals that die.',
    painTitle: 'The sponsor’s trap: prove the deal to raise the money, spend the money to prove the deal.',
    pains: [
      {
        name: 'Credibility',
        body: 'Capital partners want a locked-up deal with real diligence behind it. Sellers want proof of funds. You’re asked to show both before anyone pays for anything.',
        tag: 'CHICKEN AND EGG',
      },
      {
        name: 'Dead-deal cost',
        body: 'Every broken deal is months of sourcing, reading, and modeling — uncompensated. The economics only work if the grind costs you almost nothing.',
        tag: 'UNCOMPENSATED TIME',
      },
      {
        name: 'Focus',
        body: 'You can’t source the next deal, run diligence on this one, and court capital partners at the same time. Something slips — usually the pipeline.',
        tag: 'PIPELINE STALLS',
      },
    ],
    answers: [
      { k: 'The engine', v: 'CIM triage, models, and diligence checklists produced in days, not weeks — so a dead deal costs you a conversation, not a quarter.' },
      { k: 'The practitioner', v: 'A senior operator packages the deal the way capital partners expect to see it — and keeps the seller warm while you raise.' },
      { k: 'The pledge', v: 'One buyer per target. Your deal is never shopped to another sponsor — it’s in the engagement letter.' },
    ],
  },
  {
    slug: 'pe-firms',
    footerLabel: 'PE firms',
    cardTitle: 'Lower-middle-market PE',
    cardBody: 'Proprietary add-on flow and senior execution capacity that flexes with your pipeline — without a million-dollar BD build.',
    cardLink: 'For PE firms →',
    h1: 'Proprietary add-on flow. No million-dollar BD build.',
    sub: 'Senior execution capacity that flexes with your pipeline — sourcing, triage, and models on demand, for the platform and every add-on after it.',
    painTitle: 'The math of LMM coverage doesn’t work with people alone.',
    pains: [
      {
        name: 'Coverage',
        body: 'A typical LMM fund actually reaches a sliver of its addressable market — call it a fifth on a good year. The best targets never hit a process at all.',
        tag: 'DEAL-FLOW GAP',
      },
      {
        name: 'Partner time',
        body: 'Partners spend a third or more of their week sourcing — the most expensive hours in the firm doing work an engine should be doing.',
        tag: '30–40% ON SOURCING',
      },
      {
        name: 'Add-on capacity',
        body: 'Every platform thesis promises add-ons; execution capacity is what runs out. Deals queue behind the deals already in flight.',
        tag: 'EXECUTION BOTTLENECK',
      },
    ],
    answers: [
      { k: 'The engine', v: 'Off-market maps of the whole segment — not the brokered slice — with triage, models, and memos generated as fast as your pipeline moves.' },
      { k: 'The practitioner', v: 'Senior execution that flexes deal by deal: outreach, process, and negotiation run by an operator, not a junior BD hire you have to manage.' },
      { k: 'The pledge', v: 'One buyer per target and never two-sided — your add-on pipeline never leaks to a competing sponsor.' },
    ],
  },
  {
    slug: 'searchers',
    footerLabel: 'Searchers',
    cardTitle: 'Searchers & solo acquirers',
    cardBody: 'A senior deal team in your corner for your first — and biggest — acquisition. Level the field against the seller’s broker.',
    cardLink: 'For searchers →',
    h1: 'Level the field against the seller’s broker.',
    sub: 'A senior deal team in your corner for your first — and biggest — acquisition. We run the diligence and the model so your SBA lender and your gut both say go.',
    painTitle: 'Your first deal is the other side’s hundredth.',
    pains: [
      {
        name: 'Information gap',
        body: 'The seller’s broker prices deals every week. You’re seeing your first recast, your first working-capital peg, your first earnout — live, with your savings on the table.',
        tag: 'ASYMMETRY',
      },
      {
        name: 'Walking away',
        body: 'The hardest skill in acquisitions is killing a deal you’ve fallen for — before diligence costs, lender fees, and sunk months make the bad choice for you.',
        tag: 'KNOW WHEN TO WALK',
      },
      {
        name: 'The SBA clock',
        body: 'SBA timelines, lender checklists, and a personal guarantee at the end of it. Miss a step and the deal slips; sign too fast and you own the mistake — personally.',
        tag: 'PERSONAL GUARANTEE',
      },
    ],
    answers: [
      { k: 'The engine', v: 'The recast, the model, the diligence checklist, and the lender package — built in days and checked against what the market actually pays.' },
      { k: 'The practitioner', v: 'A senior operator who has seen the broker playbook, tells you when the price is wrong, and says “walk” out loud when the numbers say so.' },
      { k: 'The pledge', v: 'Aligned to you and only you — never the sell side, never a fee from anyone else in your deal.' },
    ],
  },
  {
    slug: 'operators',
    footerLabel: 'Operators',
    cardTitle: 'Operators buying competitors',
    cardBody: 'Discreet third-party approaches that protect your position, objective pricing, and a repeatable playbook — run for you, deal by deal.',
    cardLink: 'For operators →',
    h1: 'Inorganic growth, without tipping your hand.',
    sub: 'Discreet third-party approaches that protect your position, objective pricing, and a repeatable playbook — run for you, deal by deal, while you run the business.',
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
      { k: 'The engine', v: 'Quiet market mapping and target reads without a whisper reaching your competitors — plus models that price the business as it is, not as you’ll make it.' },
      { k: 'The practitioner', v: 'Third-party approaches in the practice’s name, a disciplined process, and a repeatable playbook for the next one — while your team stays on the business.' },
      { k: 'The pledge', v: 'One buyer per target and total discretion — your interest is never revealed until you say so.' },
    ],
  },
];

export function getSegment(slug: string): Segment | undefined {
  return SEGMENTS.find(s => s.slug === slug);
}
