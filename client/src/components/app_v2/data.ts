/**
 * Glass Grok v2 · internal app — mock data module.
 * Verbatim port of claude_design/app/project/data.js (window.* globals
 * → named exports). Replace wire-in with real API calls when the
 * backend is ready — component code expects the same shapes.
 */

export type DealTone = 'ok' | 'warn' | 'flag';
export type DealStage = 'sourcing' | 'rundown' | 'dd' | 'loi' | 'closing';
export type DimTone = 'green' | 'amber' | 'red';

export interface Dim {
  label: string;
  value: number;
  tone: DimTone;
}

export interface Deal {
  id: string;
  name: string;
  sub: string;
  stage: DealStage;
  stageIdx: number;
  fit: number;
  score: number | null;
  status: 'pursue' | 'hold' | 'pass';
  tone: DealTone;
  kicker: string;
  summary: string;
  revenue: string;
  ebitda: string;
  industry: string;
  lastUpdate: string;
  dims: Dim[];
}

export interface Portfolio {
  id: string;
  name: string;
  kicker: string;
  dealIds: string[];
}

export interface Pinned {
  id: string;
  t: string;
  s: string;
  kind: string;
  dealId: string | null;
}

export interface Stage {
  id: DealStage;
  label: string;
}

export interface ChatSeedMsg {
  who: 'y' | 'me';
  text: string;
  cards?: string[] | null;
}

export interface DataRoomDoc {
  id: string;
  dealId: string;
  title: string;
  kind: 'spreadsheet' | 'pdf' | 'doc' | 'zip';
  size: string;
  from: string;
  uploaded: string;
  status: 'review' | 'action' | 'sealed';
  folder: string;
}

export interface MyDoc {
  id: string;
  dealId: string | null;
  title: string;
  kind: 'memo' | 'model' | 'analysis' | 'infographic';
  updated: string;
  size: string;
  thumb: string;
}

export interface SharedDoc {
  id: string;
  from: string;
  title: string;
  kind: 'memo' | 'analysis' | 'template';
  dealId: string | null;
  sharedOn: string;
  unread: boolean;
}

export interface Template {
  id: string;
  title: string;
  kind: 'loi' | 'memo' | 'model' | 'legal' | 'deck' | 'doc';
  desc: string;
  tags: string[];
}

/* ═══════════════════════════════════════════════════════════════════
   PORTFOLIOS
   ═══════════════════════════════════════════════════════════════════ */

export const PORTFOLIOS: Portfolio[] = [
  { id: 'fund1',    name: 'Fund I',                 kicker: 'INTERNAL',               dealIds: ['atlas', 'summit', 'benchmark', 'ridge', 'clearwater'] },
  { id: 'harbor',   name: 'Harbor Advisors',        kicker: 'ADVISOR · 3 CLIENTS',    dealIds: ['atlas', 'summit'] },
  { id: 'client-a', name: 'Greene Family Office',   kicker: 'CLIENT',                 dealIds: ['benchmark', 'ridge'] },
];

/* ═══════════════════════════════════════════════════════════════════
   DEALS
   ═══════════════════════════════════════════════════════════════════ */

export const DEALS: Deal[] = [
  {
    id: 'atlas', name: 'Atlas Air', sub: 'Commercial HVAC · Fort Worth, TX',
    stage: 'dd', stageIdx: 2, fit: 94, score: 83, status: 'pursue', tone: 'ok',
    kicker: 'DD IN PROGRESS',
    summary: '$6.2M rev · 18% EBITDA · 2nd-gen owner, 58yo. 42 workstreams running.',
    revenue: '$6.2M', ebitda: '18%', industry: 'HVAC', lastUpdate: '6m',
    dims: [
      { label: 'Financial quality',         value: 9.1, tone: 'green' },
      { label: 'Margin stability',          value: 8.4, tone: 'green' },
      { label: 'Customer concentration',    value: 6.2, tone: 'amber' },
      { label: 'Recurring revenue',         value: 7.8, tone: 'green' },
      { label: 'Owner dependency',          value: 5.9, tone: 'amber' },
      { label: 'Integration fit',           value: 8.7, tone: 'green' },
    ],
  },
  {
    id: 'summit', name: 'Summit Climate', sub: 'Residential HVAC · Tulsa, OK',
    stage: 'rundown', stageIdx: 1, fit: 91, score: 76, status: 'pursue', tone: 'ok',
    kicker: 'RUNDOWN READY',
    summary: '$4.1M rev · solo owner exploring exit. Clean books, 12% recurring.',
    revenue: '$4.1M', ebitda: '14%', industry: 'HVAC', lastUpdate: '2h',
    dims: [
      { label: 'Financial quality',         value: 7.2, tone: 'green' },
      { label: 'Margin stability',          value: 6.8, tone: 'amber' },
      { label: 'Customer concentration',    value: 8.3, tone: 'green' },
      { label: 'Recurring revenue',         value: 5.4, tone: 'amber' },
      { label: 'Owner dependency',          value: 4.1, tone: 'red' },
      { label: 'Integration fit',           value: 8.1, tone: 'green' },
    ],
  },
  {
    id: 'benchmark', name: 'Benchmark Mechanical', sub: 'Service HVAC · Dallas, TX',
    stage: 'loi', stageIdx: 3, fit: 88, score: 81, status: 'pursue', tone: 'warn',
    kicker: 'LOI DRAFTED',
    summary: '$9.4M rev · 22% EBITDA · two partners, one retiring. LOI at $16.8M.',
    revenue: '$9.4M', ebitda: '22%', industry: 'HVAC', lastUpdate: '1d',
    dims: [
      { label: 'Financial quality',         value: 8.8, tone: 'green' },
      { label: 'Margin stability',          value: 8.9, tone: 'green' },
      { label: 'Customer concentration',    value: 7.4, tone: 'green' },
      { label: 'Recurring revenue',         value: 6.2, tone: 'amber' },
      { label: 'Owner dependency',          value: 7.8, tone: 'green' },
      { label: 'Integration fit',           value: 8.5, tone: 'green' },
    ],
  },
  {
    id: 'ridge', name: 'Ridge Plumbing', sub: 'Residential plumbing · Oklahoma City',
    stage: 'sourcing', stageIdx: 0, fit: 72, score: null, status: 'hold', tone: 'warn',
    kicker: 'NEW MATCH',
    summary: '$2.8M rev · first-gen owner · outreach sent Tue.',
    revenue: '$2.8M', ebitda: '11%', industry: 'Plumbing', lastUpdate: '3d',
    dims: [],
  },
  {
    id: 'clearwater', name: 'Clearwater Electric', sub: 'Commercial electrical · Austin, TX',
    stage: 'rundown', stageIdx: 1, fit: 79, score: 64, status: 'hold', tone: 'warn',
    kicker: 'CONCENTRATION FLAG',
    summary: '$5.1M rev · 62% revenue from single GC. Walk?',
    revenue: '$5.1M', ebitda: '9%', industry: 'Electrical', lastUpdate: '5d',
    dims: [
      { label: 'Financial quality',         value: 6.8, tone: 'amber' },
      { label: 'Margin stability',          value: 5.2, tone: 'amber' },
      { label: 'Customer concentration',    value: 2.8, tone: 'red' },
      { label: 'Recurring revenue',         value: 4.5, tone: 'red' },
      { label: 'Owner dependency',          value: 7.1, tone: 'green' },
      { label: 'Integration fit',           value: 7.3, tone: 'green' },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════
   PINNED · STAGES
   ═══════════════════════════════════════════════════════════════════ */

export const PINNED: Pinned[] = [
  { id: 'p1', t: 'Atlas · Rundown',     s: '83/100 · Pursue',              kind: 'rundown',  dealId: 'atlas' },
  { id: 'p2', t: 'Atlas · DD pack',     s: '42 workstreams · 38 cleared',  kind: 'dd',       dealId: 'atlas' },
  { id: 'p3', t: 'Benchmark · LOI',     s: '$16.8M · 70/20/10',            kind: 'loi',      dealId: 'benchmark' },
  { id: 'p4', t: 'Portfolio compare',   s: '3 deals · stack-ranked',       kind: 'compare',  dealId: null },
  { id: 'p5', t: 'QoE · Atlas',         s: 'WC peg landed',                kind: 'model',    dealId: 'atlas' },
];

export const STAGES: Stage[] = [
  { id: 'sourcing', label: 'Sourcing' },
  { id: 'rundown',  label: 'Rundown' },
  { id: 'dd',       label: 'Diligence' },
  { id: 'loi',      label: 'LOI' },
  { id: 'closing',  label: 'Closing' },
];

/* ═══════════════════════════════════════════════════════════════════
   CHAT_SEEDS (per-deal canned first messages)
   ═══════════════════════════════════════════════════════════════════ */

export const CHAT_SEEDS: Record<string, ChatSeedMsg[]> = {
  atlas: [
    { who: 'y', text: 'Morning. Your <strong>Atlas Air</strong> diligence hit a milestone — QoE cleared, WC peg landed. Concentration is the one yellow I want to walk you through.', cards: null },
    { who: 'me', text: 'Show me the rundown again, and pull up the concentration risk detail.' },
    { who: 'y', text: 'Rundown snapshot below. <strong>83/100, Pursue.</strong> Concentration sits at 6.2 — 38% top-3 on month-to-month MSAs. Two of three are 8+ year tenure, so the actual switching risk is lower than the line suggests.', cards: ['rundown', 'dd'] },
  ],
  summit: [
    { who: 'y', text: 'Summit just cleared Rundown. <strong>76/100, Pursue</strong> — caveat: owner dependency is a 4.1, the lowest I\u2019ve seen this month. The whole business runs through him.', cards: ['rundown'] },
  ],
  benchmark: [
    { who: 'y', text: 'Benchmark LOI is ready. Three structures modeled — recommended: <strong>$16.8M, 70/20/10</strong>. Maximizes their after-tax NPV, keeps your check under $12M.', cards: ['loi'] },
  ],
  ridge: [
    { who: 'y', text: 'Ridge Plumbing is a new match — <strong>fit 72</strong>. First-gen owner in OKC, sent outreach Tuesday. Not off-market yet; wait 3 more days before nudging.', cards: null },
  ],
  clearwater: [
    { who: 'y', text: 'Clearwater has a real problem. <strong>62% of revenue</strong> runs through one GC, and the MSA is month-to-month with a 30-day out. My recommendation is to walk unless seller indemnifies on retention.', cards: ['rundown'] },
  ],
  compare: [
    { who: 'y', text: 'Stack-ranked your three live deals side-by-side. <strong>Atlas</strong> leads on scorecard quality, <strong>Benchmark</strong> on margin, <strong>Summit</strong> on concentration but suffers on owner risk.', cards: ['compare'] },
  ],
};

/* ═══════════════════════════════════════════════════════════════════
   yuliaReply — mock reply generator (keyword-matched).
   Returns { text, cards?, spawnTabs?, progress? }.
   Swap with a real async API call when the backend is wired.
   ═══════════════════════════════════════════════════════════════════ */

export interface TabSpec {
  kind: string;
  dealId?: string;
  dealIds?: string[];
  label: string;
  sub?: string;
  id?: string;
}
export interface YuliaReply {
  text: string;
  cards?: string[] | null;
  spawnTabs?: TabSpec[];
  progress?: string[];
}

export function yuliaReply(text: string, deal: Deal | null, portfolio: Portfolio | null): YuliaReply {
  const t = text.toLowerCase();
  const port = portfolio || PORTFOLIOS[0];
  const portDeals = DEALS.filter(d => port.dealIds.includes(d.id));

  /* Multi-deal + model intent */
  const mentioned = portDeals.filter(d =>
    t.includes(d.name.toLowerCase().split(' ')[0]) || t.includes(d.id),
  );
  const wantsModel = /(\bdcf\b|\bmodel\b|\bqoe\b)/.test(t);
  const wantsCompare = /(\bcompare\b|\bside[- ]?by[- ]?side\b|\bvs\b|\bversus\b|\bstack\b|\ball\b)/.test(t);

  if (wantsModel && (mentioned.length >= 2 || (wantsCompare && mentioned.length === 0))) {
    const targets = mentioned.length >= 2 ? mentioned : portDeals.filter(d => d.score != null).slice(0, 3);
    const spawnTabs: TabSpec[] = targets.map(d => ({ kind: 'model', dealId: d.id, label: `${d.name} · DCF` }));
    if (wantsCompare) {
      spawnTabs.push({
        kind: 'compare',
        dealIds: targets.map(d => d.id),
        label: `Compare · ${targets.map(d => d.name.split(' ')[0]).join(' + ')}`,
      });
    }
    return {
      text: `Got it. Modeling DCF on <strong>${targets.map(d => d.name).join(', ')}</strong>${wantsCompare ? ' and opening a comparison' : ''}. Spawning ${spawnTabs.length} tabs — you can switch between them on the left.`,
      cards: null,
      spawnTabs,
      progress: spawnTabs.map(x => x.label),
    };
  }

  if (t.includes('compare') || t.includes('portfolio') || t.includes('stack')) {
    return { text: 'Here\u2019s the stack-rank across your three live deals. Atlas wins overall — but if you\u2019re optimizing for <strong>margin</strong>, Benchmark is the pick.', cards: ['compare'] };
  }
  if (t.includes('loi') || t.includes('offer') || t.includes('price')) {
    return { text: 'Three LOI structures modeled. Recommended: <strong>$16.8M, 70/20/10</strong> — cash / seller note / rollover. The rollover aligns them through year 3.', cards: ['loi'] };
  }
  if (t.includes('dd') || t.includes('diligence') || t.includes('workstream')) {
    return { text: '42 workstreams live. <strong>38 cleared</strong>, 3 in progress, 1 flagged (customer concentration). Key-person + enviro landing EOD.', cards: ['dd'] };
  }
  if (t.includes('model') || t.includes('ebitda') || t.includes('qoe') || t.includes('financial') || t.includes('dcf')) {
    return { text: 'Pulled the model. Adjusted EBITDA of <strong>$1.24M</strong>, WC peg at $620K. Margin normalizes to 20.0% after owner comp add-back.', cards: ['model'] };
  }
  if (t.includes('chart') || t.includes('revenue') || t.includes('trend')) {
    return { text: 'Revenue trend for Atlas below — 5 years. 2022 dip was COVID timing on commercial retrofit; recovered in 2023.', cards: ['chart'] };
  }
  if (t.includes('rundown') || t.includes('score')) {
    return { text: 'Rundown below. Happy to drill into any dimension — just say which one.', cards: ['rundown'] };
  }
  if (t.includes('concentration') || t.includes('risk')) {
    return { text: 'Concentration flag detail: <strong>38% top-3</strong>. Two on 8+ year tenure (low actual risk), one is a 2-year with a rotating procurement lead (watch).', cards: ['rundown'] };
  }
  /* silence unused `deal` warning — API signature preserved for real wire-in later */
  void deal;
  return { text: 'On it. Want me to pull the rundown, DD pack, LOI scenarios, or run a DCF across multiple deals?', cards: null };
}

/* ═══════════════════════════════════════════════════════════════════
   Library data — data rooms / user docs / shared docs / templates
   ═══════════════════════════════════════════════════════════════════ */

export const DATA_ROOMS: DataRoomDoc[] = [
  { id: 'dr-a-01', dealId: 'atlas', title: 'QoE_Atlas_final.xlsx',            kind: 'spreadsheet', size: '2.4 MB',  from: 'Pantera CPA',     uploaded: 'Apr 18', status: 'review', folder: 'Financial' },
  { id: 'dr-a-02', dealId: 'atlas', title: 'Atlas_TTM_financials.xlsx',       kind: 'spreadsheet', size: '1.8 MB',  from: 'Atlas CFO',       uploaded: 'Apr 16', status: 'review', folder: 'Financial' },
  { id: 'dr-a-03', dealId: 'atlas', title: 'Customer_concentration_detail.pdf', kind: 'pdf',       size: '420 KB',  from: 'Atlas CFO',       uploaded: 'Apr 15', status: 'action', folder: 'Commercial' },
  { id: 'dr-a-04', dealId: 'atlas', title: 'Top10_MSA_copies.zip',            kind: 'zip',         size: '18 MB',   from: 'Atlas legal',     uploaded: 'Apr 14', status: 'action', folder: 'Commercial' },
  { id: 'dr-a-05', dealId: 'atlas', title: 'Fleet_maintenance_logs_2022-24.pdf', kind: 'pdf',      size: '6.2 MB',  from: 'Atlas ops',       uploaded: 'Apr 12', status: 'sealed', folder: 'Operations' },
  { id: 'dr-a-06', dealId: 'atlas', title: 'Environmental_Phase1.pdf',        kind: 'pdf',         size: '3.1 MB',  from: 'Terracon',        uploaded: 'Apr 10', status: 'sealed', folder: 'Legal' },
  { id: 'dr-a-07', dealId: 'atlas', title: 'NDA_countersigned.pdf',           kind: 'pdf',         size: '180 KB',  from: 'Atlas legal',     uploaded: 'Apr 01', status: 'sealed', folder: 'Legal' },
  { id: 'dr-a-08', dealId: 'atlas', title: 'Organizational_chart.pdf',        kind: 'pdf',         size: '240 KB',  from: 'Atlas HR',        uploaded: 'Apr 08', status: 'review', folder: 'HR' },
  { id: 'dr-a-09', dealId: 'atlas', title: 'Working_capital_schedule.xlsx',   kind: 'spreadsheet', size: '580 KB',  from: 'Pantera CPA',     uploaded: 'Apr 18', status: 'review', folder: 'Financial' },
  { id: 'dr-a-10', dealId: 'atlas', title: 'Insurance_policies_2024.pdf',     kind: 'pdf',         size: '1.1 MB',  from: 'Atlas broker',    uploaded: 'Apr 09', status: 'sealed', folder: 'Legal' },
  { id: 'dr-s-01', dealId: 'summit', title: 'Summit_teaser.pdf',              kind: 'pdf',         size: '1.4 MB',  from: 'Harbor Advisors', uploaded: 'Apr 11', status: 'sealed', folder: 'General' },
  { id: 'dr-s-02', dealId: 'summit', title: 'Summit_CIM.pdf',                 kind: 'pdf',         size: '8.2 MB',  from: 'Harbor Advisors', uploaded: 'Apr 12', status: 'review', folder: 'General' },
  { id: 'dr-s-03', dealId: 'summit', title: 'Summit_tax_returns_21-23.pdf',   kind: 'pdf',         size: '6.1 MB',  from: 'Summit CPA',      uploaded: 'Apr 12', status: 'review', folder: 'Financial' },
  { id: 'dr-s-04', dealId: 'summit', title: 'Owner_dependency_memo.docx',     kind: 'doc',         size: '48 KB',   from: 'Yulia',           uploaded: 'Apr 13', status: 'action', folder: 'Commercial' },
  { id: 'dr-b-01', dealId: 'benchmark', title: 'LOI_Benchmark_v2.docx',       kind: 'doc',         size: '95 KB',   from: 'Yulia',           uploaded: 'Apr 18', status: 'action', folder: 'Deal docs' },
  { id: 'dr-b-02', dealId: 'benchmark', title: 'Seller_counter_markup.pdf',   kind: 'pdf',         size: '210 KB',  from: 'Benchmark counsel', uploaded: 'Apr 19', status: 'action', folder: 'Deal docs' },
  { id: 'dr-b-03', dealId: 'benchmark', title: 'Benchmark_QoE.xlsx',          kind: 'spreadsheet', size: '1.9 MB',  from: 'Plante Moran',    uploaded: 'Apr 10', status: 'sealed', folder: 'Financial' },
  { id: 'dr-b-04', dealId: 'benchmark', title: 'Service_contract_portfolio.xlsx', kind: 'spreadsheet', size: '720 KB', from: 'Benchmark GM', uploaded: 'Apr 09', status: 'sealed', folder: 'Commercial' },
  { id: 'dr-b-05', dealId: 'benchmark', title: 'Lease_summary.pdf',           kind: 'pdf',         size: '340 KB',  from: 'Benchmark counsel', uploaded: 'Apr 08', status: 'sealed', folder: 'Legal' },
  { id: 'dr-r-01', dealId: 'ridge', title: 'Ridge_intro_deck.pdf',            kind: 'pdf',         size: '2.1 MB',  from: 'Ridge owner',     uploaded: 'Apr 16', status: 'review', folder: 'General' },
  { id: 'dr-c-01', dealId: 'clearwater', title: 'Clearwater_CIM.pdf',         kind: 'pdf',         size: '5.4 MB',  from: 'Seller broker',   uploaded: 'Apr 07', status: 'sealed', folder: 'General' },
  { id: 'dr-c-02', dealId: 'clearwater', title: 'Revenue_by_customer.xlsx',   kind: 'spreadsheet', size: '420 KB', from: 'Clearwater CFO', uploaded: 'Apr 09', status: 'action', folder: 'Commercial' },
];

export const MY_DOCS: MyDoc[] = [
  { id: 'md-01', dealId: 'atlas',     title: 'Atlas · IC memo draft',             kind: 'memo',       updated: '2h ago',    size: '3 pp',    thumb: 'Sora' },
  { id: 'md-02', dealId: 'atlas',     title: 'Atlas DCF · base + downside',       kind: 'model',      updated: 'yesterday', size: '12 tabs', thumb: 'Model' },
  { id: 'md-03', dealId: 'atlas',     title: 'Concentration risk · scenarios',    kind: 'analysis',   updated: '3 d',       size: '6 pp',    thumb: 'Notes' },
  { id: 'md-04', dealId: 'summit',    title: 'Summit · Rundown notes',            kind: 'analysis',   updated: '1 d',       size: '2 pp',    thumb: 'Notes' },
  { id: 'md-05', dealId: 'benchmark', title: 'Benchmark · LOI scenarios',         kind: 'model',      updated: '4 h',       size: '3 tabs',  thumb: 'Model' },
  { id: 'md-06', dealId: 'benchmark', title: 'Benchmark · structure infographic', kind: 'infographic',updated: '2 d',       size: '1 pg',    thumb: 'Fig' },
  { id: 'md-07', dealId: null,        title: 'Fund I · pipeline snapshot',        kind: 'analysis',   updated: '5 d',       size: '4 pp',    thumb: 'Notes' },
  { id: 'md-08', dealId: null,        title: 'HVAC thesis · v3',                  kind: 'memo',       updated: '2 wk',      size: '6 pp',    thumb: 'Sora' },
  { id: 'md-09', dealId: 'ridge',     title: 'Ridge · quick-look',                kind: 'analysis',   updated: '3 d',       size: '1 pg',    thumb: 'Notes' },
];

export const SHARED_DOCS: SharedDoc[] = [
  { id: 'sh-01', from: 'Jess Kim (Harbor Advisors)', title: 'HVAC market scan · Q1 2025',      kind: 'memo',     dealId: null,        sharedOn: 'Apr 17', unread: true },
  { id: 'sh-02', from: 'Marcus Tran (co-investor)',  title: 'Atlas · my rundown markup',       kind: 'analysis', dealId: 'atlas',     sharedOn: 'Apr 16', unread: true },
  { id: 'sh-03', from: 'Ops partner · Rob Healy',    title: 'Fleet routing benchmark study',   kind: 'analysis', dealId: 'atlas',     sharedOn: 'Apr 14', unread: false },
  { id: 'sh-04', from: 'Lender · Capital One',       title: 'Term sheet · Benchmark draft',    kind: 'memo',     dealId: 'benchmark', sharedOn: 'Apr 13', unread: false },
  { id: 'sh-05', from: 'Jess Kim (Harbor Advisors)', title: 'Summit owner interview notes',    kind: 'memo',     dealId: 'summit',    sharedOn: 'Apr 12', unread: false },
  { id: 'sh-06', from: 'Counsel · Wilkinson Barker', title: 'Standard HVAC reps & warranties', kind: 'template', dealId: null,        sharedOn: 'Apr 08', unread: false },
];

export const TEMPLATES: Template[] = [
  { id: 'tpl-loi',       title: 'Letter of Intent',        kind: 'loi',    desc: 'Terms, price, structure, exclusivity — fill from deal context',     tags: ['legal', 'deal'] },
  { id: 'tpl-memo',      title: 'IC Memo',                 kind: 'memo',   desc: 'Thesis, sources & uses, risks, returns — populated from rundown',   tags: ['writeup'] },
  { id: 'tpl-qoe',       title: 'QoE workpaper',           kind: 'model',  desc: 'EBITDA bridge, adjustment schedule, tie-outs',                       tags: ['financial'] },
  { id: 'tpl-dcf',       title: 'DCF · 5yr projection',    kind: 'model',  desc: 'Base / upside / downside cases, IRR, MoIC, sensitivity',             tags: ['financial'] },
  { id: 'tpl-nda',       title: 'Mutual NDA',              kind: 'legal',  desc: 'Standard 3-yr mutual NDA, info-seg clauses, residual knowledge',     tags: ['legal'] },
  { id: 'tpl-icdeck',    title: 'IC Deck · 12 slides',     kind: 'deck',   desc: 'Cover, thesis, market, financials, risks, ask, appendix',            tags: ['writeup'] },
  { id: 'tpl-wgl',       title: 'Working Group List',      kind: 'doc',    desc: 'Deal team, advisors, counsel, accounting — with contacts',           tags: ['admin'] },
  { id: 'tpl-checklist', title: 'DD Checklist',            kind: 'doc',    desc: 'Commercial / financial / legal / ops — standard 120-line checklist', tags: ['admin'] },
  { id: 'tpl-rollup',    title: 'Monthly portfolio roll-up', kind: 'memo', desc: 'Per-deal status + aggregate pipeline summary',                       tags: ['writeup'] },
  { id: 'tpl-100day',    title: '100-day plan',            kind: 'memo',   desc: 'Post-close operating playbook · KPI scorecard · quick wins',         tags: ['writeup'] },
];
