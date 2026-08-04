/**
 * house/fullEvaluation.ts — the FULL owner evaluation's single source
 * (SELLER_EVALUATION_PLAN.md §P2, 2026-08-04: "plug into DEFINITIVE on the
 * front end… when they're done they have a full thorough report they can
 * bank on").
 *
 * ONE MODULE, FOUR READERS: the chat asks these questions, the circle-back
 * ledger reads them back, the validators cross-check them, and the report
 * gates its own sections on them — all from SECTIONS below. The 16-page
 * sample (SAMPLE-VALUATION-SPEC.md) is the product spec this question set
 * exists to feed.
 *
 * PURE by house doctrine: no db, no API key, no env, no clock. Answers come
 * in, the report data model comes out — persistence (owner_evaluations,
 * under the P2 up-front consent) happens in the server route, never here.
 * The P1 quick valuation stays ephemeral and untouched; this module REUSES
 * its engine (`evaluate()`) for the bridge + band leg rather than forking
 * the math.
 *
 * THE LINE guardrails, carried structurally:
 *  • RANGE, NEVER A NUMBER — every valuation output is a low/high pair; no
 *    field in the report model holds a single point estimate, and the test
 *    suite scans the model's keys to keep it that way. "Bank on" stays a
 *    market read, never an opinion of value (M135 is out of lane).
 *  • Zero hallucination — every threshold or multiple traces to
 *    house/laneBenchmarks.ts or a named published assessment; the ratio
 *    "testing" notes describe what a buyer's diligence DOES, and carry no
 *    industry-average figures because we have none to cite (the 16-pager's
 *    own law: no uncited benchmark column).
 *  • Practice norms that enter arithmetic (transaction costs 4%, escrow
 *    10%) are LABELED as norms in the output itself, so no renderer can
 *    print them as market facts.
 */

import {
  evaluate,
  DISCLAIMER,
  type EvaluationInput,
  type EvaluationResult,
  type UnsupportedLane,
  type OwnerDependence,
  type BooksQuality,
  type RealEstate,
} from './evaluate';
import type { LaneBand } from './laneBenchmarks';

/* ── answers: the three-state ledger ─────────────────────────────────────── */

/** Parking is a first-class answer (Paul: "notes what is missing, what they
 *  need to circle back to") — it creates a ledger entry, never an error. */
export type AnswerState = 'answered' | 'skipped' | 'parked';

export interface EvalAnswer {
  state: AnswerState;
  /** Present only when state === 'answered'. Numbers are USD (money), whole
   *  percents (pct), or counts (int); strings for text/choice. */
  value?: number | string;
  /** The owner's own words — why skipped, or what they went to find. */
  note?: string;
}

/** Keyed by question key. A question absent from the map is 'open'. */
export type EvalAnswers = Record<string, EvalAnswer>;

/* ── the question set ────────────────────────────────────────────────────── */

export type QuestionKind = 'money' | 'pct' | 'int' | 'text' | 'choice';

export interface EvalChoice { value: string; label: string }

export interface EvalQuestion {
  key: string;
  /** The question as the chat asks it. */
  ask: string;
  /** The honest go-get hint — tax return line, QuickBooks report, the
   *  bookkeeper's schedule. Becomes the instruction when parked. */
  whereToFind: string;
  kind: QuestionKind;
  choices?: EvalChoice[];
  optional?: boolean;
  /** Required only under a condition (e.g. rent questions when the real
   *  estate is owned). Evaluated against the whole answer map. */
  requiredIf?: (answers: EvalAnswers) => boolean;
  /** Which report section / model input this answer feeds — the reason the
   *  question earns its place in a 45-question walk. */
  feeds: string[];
  /** Deterministic cross-check, run as answers land. Returns the gentle
   *  message or null — arithmetic and published thresholds only, never an
   *  invented benchmark. */
  validate?: (answers: EvalAnswers) => string | null;
}

export interface EvalSection {
  key: string;
  title: string;
  /** Why the section exists, in the owner's language — the chat says this
   *  before the first question. */
  intro: string;
  questions: EvalQuestion[];
}

const fmtUsd = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

/** Answered numeric value or null. */
function num(answers: EvalAnswers, key: string): number | null {
  const a = answers[key];
  return a?.state === 'answered' && typeof a.value === 'number' && isFinite(a.value) ? a.value : null;
}
/** Answered string value or null. */
function str(answers: EvalAnswers, key: string): string | null {
  const a = answers[key];
  return a?.state === 'answered' && typeof a.value === 'string' && a.value !== '' ? a.value : null;
}

const reOwned = (a: EvalAnswers) => str(a, 'realEstate') === 'owned';

/** Revenue lines must reconcile to the top line before the report prints
 *  them — arithmetic, not judgement (2% or $1K, whichever is looser). */
const revenueMixCheck = (a: EvalAnswers): string | null => {
  const total = num(a, 'ttmRevenueUsd');
  const svc = num(a, 'serviceRevenueUsd');
  const proj = num(a, 'projectRevenueUsd');
  if (total === null || svc === null || proj === null) return null;
  const sum = svc + proj + (num(a, 'otherRevenueUsd') ?? 0);
  if (Math.abs(sum - total) > Math.max(0.02 * total, 1000)) {
    return `Your revenue lines sum to ${fmtUsd(sum)} against ${fmtUsd(total)} total — worth reconciling before the report prints them side by side.`;
  }
  return null;
};

/** Trend sanity — a >5x or <0.2x two-year move is usually a typo, and the
 *  question costs nothing ("that's unusual — worth double-checking"). */
const trendSanityCheck = (a: EvalAnswers): string | null => {
  const ttm = num(a, 'ttmRevenueUsd');
  const fy2 = num(a, 'fy2RevenueUsd');
  if (ttm === null || fy2 === null || fy2 <= 0) return null;
  const ratio = ttm / fy2;
  if (ratio > 5 || ratio < 0.2) {
    return `Revenue moved from ${fmtUsd(fy2)} two years ago to ${fmtUsd(ttm)} TTM — that's a big swing, worth double-checking both figures before the trend page prints.`;
  }
  return null;
};

export const SECTIONS: EvalSection[] = [
  {
    key: 'profile',
    title: 'Company profile',
    intro:
      'First, the shape of the business — the page a buyer reads before any number.',
    questions: [
      {
        key: 'companyName', kind: 'text',
        ask: 'The legal or trade name of the business?',
        whereToFind: 'However you write it on a proposal or invoice.',
        feeds: ['report:cover', 'report:profile'],
      },
      {
        key: 'yearFounded', kind: 'int', optional: true,
        ask: 'What year was it founded?',
        whereToFind: 'Formation documents, or just the year you tell customers.',
        feeds: ['report:profile'],
      },
      {
        key: 'employees', kind: 'int',
        ask: 'Total headcount — field and office together?',
        whereToFind: 'Latest payroll summary; count everyone on payroll, not just techs.',
        feeds: ['report:profile', 'report:ratios.revenuePerEmployee'],
      },
      {
        key: 'statesServed', kind: 'int', optional: true,
        ask: 'How many states do you actively work in?',
        whereToFind: 'Where you held licenses or pulled permits in the last twelve months.',
        feeds: ['report:profile'],
      },
      {
        key: 'timeline', kind: 'choice',
        ask: 'Where is your head on selling?',
        whereToFind: 'Only you know this one — a gut answer is the right answer.',
        choices: [
          { value: 'exploring', label: 'Just curious' },
          { value: '1-3-years', label: 'Thinking about it in 1–3 years' },
          { value: 'ready-12mo', label: 'Ready in the next 12 months' },
        ],
        feeds: ['report:exec-summary', 'report:sequence'],
      },
    ],
  },
  {
    key: 'revenue-lines',
    title: 'Revenue by line',
    intro:
      'Buyers price service revenue and project revenue differently — the published spread between them is measured in full turns of EBITDA, so the split matters more than the total.',
    questions: [
      {
        key: 'ttmRevenueUsd', kind: 'money',
        ask: 'Trailing-twelve-month revenue — the top line?',
        whereToFind: 'QuickBooks: Reports → Profit & Loss, set to the last 12 months; or your latest return, line 1a.',
        feeds: ['report:profile', 'report:trend', 'report:ratios', 'model:basis-tiering'],
      },
      {
        key: 'serviceRevenueUsd', kind: 'money',
        ask: 'Of that, how much is service & maintenance — contract and call-out work, not projects?',
        whereToFind: 'P&L by class/department if you track it; otherwise your service software\'s billing total for the year.',
        feeds: ['report:revenue-lines', 'report:what-moves'],
      },
      {
        key: 'projectRevenueUsd', kind: 'money',
        ask: 'And how much is construction / project work?',
        whereToFind: 'The same P&L by class, or your WIP schedule\'s billed-to-date column summed for the year.',
        feeds: ['report:revenue-lines', 'report:ratios.backlogCoverage'],
        validate: revenueMixCheck,
      },
      {
        key: 'otherRevenueUsd', kind: 'money', optional: true,
        ask: 'Any other revenue line — parts counter, monitoring, rentals? ("0" is fine.)',
        whereToFind: 'Whatever the P&L shows outside service and projects.',
        feeds: ['report:revenue-lines'],
        validate: revenueMixCheck,
      },
      {
        key: 'serviceGmPct', kind: 'pct',
        ask: 'Gross margin on the service book — roughly what percent?',
        whereToFind: 'P&L by class: service gross profit ÷ service revenue. Your bookkeeper can split it if it\'s lumped.',
        feeds: ['report:revenue-lines'],
      },
      {
        key: 'projectGmPct', kind: 'pct',
        ask: 'Gross margin on project work?',
        whereToFind: 'Job-costing reports or the WIP schedule\'s margin column — earned gross profit ÷ earned revenue.',
        feeds: ['report:revenue-lines'],
      },
    ],
  },
  {
    key: 'normalization',
    title: 'Earnings, normalized',
    intro:
      'Buyers don\'t price the tax return — their accountants rebuild it. This walk collects each line the rebuild will need, including the interest and depreciation split the quick valuation skipped.',
    questions: [
      {
        key: 'pretaxIncomeUsd', kind: 'money',
        ask: 'Pre-tax income on the books for the trailing twelve months — the bottom line before adjustments? (A loss year is a real answer.)',
        whereToFind: 'Form 1120-S line 21 / Form 1065 line 22 (ordinary business income), or the P&L net income line.',
        feeds: ['report:bridge', 'model:basis'],
      },
      {
        key: 'interestUsd', kind: 'money',
        ask: 'Interest expense for the same period?',
        whereToFind: 'The P&L interest expense line, or sum the interest column on your loan statements.',
        feeds: ['report:bridge'],
      },
      {
        key: 'daUsd', kind: 'money',
        ask: 'Depreciation & amortization?',
        whereToFind: 'Form 4562, or the P&L depreciation line — ask your CPA for the figure if it\'s buried in cost of sales.',
        feeds: ['report:bridge'],
      },
      {
        key: 'ownerCompUsd', kind: 'money',
        ask: 'Your total owner compensation — W-2 salary plus the distributions you actually take?',
        whereToFind: 'Your W-2 box 1 plus the K-1 distributions line, or the payroll summary plus draws.',
        feeds: ['report:bridge'],
      },
      {
        key: 'addBackOneTimeUsd', kind: 'money', optional: true,
        ask: 'One-time costs that won\'t repeat — a lawsuit, a flood repair, a one-off system implementation? ("0" is a fine answer.)',
        whereToFind: 'Scan the P&L for the lines you\'d footnote; your CPA\'s adjusting entries are the paper trail buyers accept.',
        feeds: ['report:bridge'],
      },
      {
        key: 'addBackPersonalUsd', kind: 'money', optional: true,
        ask: 'Personal expenses run through the business — vehicles you drive personally, family phones, travel?',
        whereToFind: 'The honest sum from the expense accounts you already know; undocumented add-backs typically get chipped in diligence.',
        feeds: ['report:bridge'],
      },
      {
        key: 'addBackFamilyUsd', kind: 'money', optional: true,
        ask: 'Family on payroll who don\'t actually work in the business — their total comp?',
        whereToFind: 'Payroll register — the names you\'d take off the org chart tomorrow.',
        feeds: ['report:bridge'],
      },
    ],
  },
  {
    key: 'trend',
    title: 'Three-year trend',
    intro:
      'A buyer reads three years before believing one — the trend page needs your two prior completed fiscal years next to the trailing twelve months.',
    questions: [
      {
        key: 'fy1RevenueUsd', kind: 'money',
        ask: 'Last completed fiscal year — total revenue?',
        whereToFind: 'That year\'s return, line 1a, or the year-end P&L.',
        feeds: ['report:trend'],
      },
      {
        key: 'fy1EbitdaUsd', kind: 'money',
        ask: 'Same year — EBITDA as reported (pre-tax income plus interest plus depreciation, no add-backs yet)?',
        whereToFind: 'That year\'s P&L bottom line plus its interest and depreciation lines — your CPA can read it off in a minute.',
        feeds: ['report:trend'],
      },
      {
        key: 'fy1ServiceMixPct', kind: 'pct', optional: true,
        ask: 'Roughly what percent of that year\'s revenue was service & maintenance?',
        whereToFind: 'P&L by class for that year, or your service software\'s annual billing report.',
        feeds: ['report:trend'],
      },
      {
        key: 'fy2RevenueUsd', kind: 'money',
        ask: 'The year before that — total revenue?',
        whereToFind: 'The prior year\'s return, line 1a.',
        feeds: ['report:trend', 'report:what-moves'],
        validate: trendSanityCheck,
      },
      {
        key: 'fy2EbitdaUsd', kind: 'money',
        ask: 'And that year\'s EBITDA as reported?',
        whereToFind: 'Same walk on the prior year\'s P&L: bottom line plus interest plus depreciation.',
        feeds: ['report:trend'],
      },
      {
        key: 'fy2ServiceMixPct', kind: 'pct', optional: true,
        ask: 'Service & maintenance share of revenue that year, roughly?',
        whereToFind: 'Same class report, one year further back — skip it if the split wasn\'t tracked yet.',
        feeds: ['report:trend'],
      },
    ],
  },
  {
    key: 'balance-sheet',
    title: 'Balance sheet',
    intro:
      'The ratios a buyer computes before the first call all come off the balance sheet — five figures, all on schedules your bookkeeper already runs.',
    questions: [
      {
        key: 'arUsd', kind: 'money',
        ask: 'Accounts receivable outstanding today?',
        whereToFind: 'QuickBooks: Reports → A/R Aging Summary — the total row.',
        feeds: ['report:ratios.dso', 'model:MODEL.FINANCE.ABL.BORROWING_BASE.v1'],
      },
      {
        key: 'wipOverUnderUsd', kind: 'money',
        ask: 'Net over/under billings on work in progress — positive if overbilled, negative if underbilled?',
        whereToFind: 'The WIP schedule your bookkeeper builds for the bonding company — the net of the over and under columns.',
        feeds: ['report:ratios.wip'],
      },
      {
        key: 'fundedDebtUsd', kind: 'money',
        ask: 'Total funded debt — notes, lines of credit, equipment loans, balances not payments?',
        whereToFind: 'Your debt schedule, or the balance sheet\'s loan balances summed; every loan statement\'s current balance.',
        feeds: ['report:ratios.debt', 'report:waterfall', 'model:MODEL.DSCR.STRESS.v1'],
      },
      {
        key: 'cashUsd', kind: 'money',
        ask: 'Cash on the balance sheet, all accounts?',
        whereToFind: 'Balance sheet cash line, or today\'s bank balances summed.',
        feeds: ['report:ratios.netDebt'],
      },
      {
        key: 'workingCapitalUsd', kind: 'money',
        ask: 'Working capital — current assets minus current liabilities?',
        whereToFind: 'Balance sheet: total current assets minus total current liabilities. Your bookkeeper reads this straight off.',
        feeds: ['report:ratios.workingCapital', 'model:MODEL.STRUCT.NWC.PEG.v1'],
      },
    ],
  },
  {
    key: 'backlog-surety',
    title: 'Backlog & surety',
    intro:
      'For contract work, tomorrow\'s revenue is already on paper — backlog and bonding capacity are how a buyer reads it.',
    questions: [
      {
        key: 'backlogUsd', kind: 'money',
        ask: 'Signed-contract backlog today?',
        whereToFind: 'The backlog report you show your surety; signed contracts minus billed-to-date.',
        feeds: ['report:ratios.backlogCoverage'],
      },
      {
        key: 'backlogContractedPct', kind: 'pct', optional: true,
        ask: 'How much of that backlog is signed contracts, versus awarded-but-not-signed? (percent signed)',
        whereToFind: 'Split the backlog report — buyers only underwrite the signed column.',
        feeds: ['report:ratios.backlogCoverage'],
      },
      {
        key: 'suretySingleUsd', kind: 'money', optional: true,
        ask: 'Surety program — single-job limit? (Skip if you don\'t bond work.)',
        whereToFind: 'Your bond agent\'s program letter — the single and aggregate limits.',
        feeds: ['report:profile', 'report:diligence-preview'],
      },
      {
        key: 'suretyAggregateUsd', kind: 'money', optional: true,
        ask: 'And the aggregate program limit?',
        whereToFind: 'Same letter, second number.',
        feeds: ['report:profile', 'report:diligence-preview'],
      },
    ],
  },
  {
    key: 'customers',
    title: 'Concentration & management',
    intro:
      'The drivers buyers actually price — the same five the quick valuation reads, plus whether the bench stays.',
    questions: [
      {
        key: 'recurringPct', kind: 'pct',
        ask: 'What percent of revenue recurs — maintenance plans, service contracts? (0–100)',
        whereToFind: 'Contract billing ÷ total revenue — your service software\'s agreement report has the numerator.',
        feeds: ['report:readiness', 'model:readiness'],
      },
      {
        key: 'topCustomerPct', kind: 'pct',
        ask: 'Largest single customer — roughly what percent of revenue?',
        whereToFind: 'Sales by customer report, largest total ÷ total revenue.',
        feeds: ['report:readiness', 'model:readiness'],
      },
      {
        key: 'ownerDependence', kind: 'choice',
        ask: 'Who runs the day to day?',
        whereToFind: 'The honest answer, not the org chart — who do customers and crews actually call?',
        choices: [
          { value: 'runs-daily', label: 'I run it day to day' },
          { value: 'manager-in-place', label: 'A manager runs it' },
          { value: 'absentee', label: 'It runs without me' },
        ],
        feeds: ['report:readiness', 'model:readiness'],
      },
      {
        key: 'managersStay', kind: 'choice', optional: true,
        ask: 'Would your key managers stay through an ownership change?',
        whereToFind: 'Your read on the bench — buyers will ask each of them the same question in diligence.',
        choices: [
          { value: 'yes', label: 'Yes, they\'d stay' },
          { value: 'unsure', label: 'Honestly unsure' },
          { value: 'no', label: 'Probably not' },
        ],
        feeds: ['report:diligence-preview'],
      },
      {
        key: 'booksQuality', kind: 'choice',
        ask: 'How are the books kept?',
        whereToFind: 'Ask your bookkeeper which basis the P&L runs on, and whether an outside CPA reviews it.',
        choices: [
          { value: 'cash', label: 'Cash basis' },
          { value: 'accrual', label: 'Accrual' },
          { value: 'reviewed', label: 'Accrual + CPA reviewed' },
        ],
        feeds: ['report:readiness', 'model:readiness'],
      },
      {
        key: 'newConstructionPct', kind: 'pct',
        ask: 'What percent of revenue is new-construction or GC work? (0–100)',
        whereToFind: 'Job list for the year — the share billed to builders and GCs rather than owners.',
        feeds: ['report:readiness', 'model:readiness'],
      },
    ],
  },
  {
    key: 'real-estate',
    title: 'Real estate',
    intro:
      'If you own the property, it\'s a separate asset from the business — and buyers restate your earnings at market rent, so the rent questions move the range.',
    questions: [
      {
        key: 'realEstate', kind: 'choice',
        ask: 'Does the business (or you personally, or a related entity) own the property it operates from?',
        whereToFind: 'The deed — and if a related LLC holds it, that counts as owned for this walk.',
        choices: [
          { value: 'owned', label: 'We own it (any entity)' },
          { value: 'leased', label: 'We lease from a third party' },
        ],
        feeds: ['report:real-estate', 'model:MODEL.RE.OPBUS.BIFURCATION.v1'],
      },
      {
        key: 'reHolder', kind: 'choice', optional: true,
        ask: 'Who holds title — the operating company itself, or a related entity?',
        whereToFind: 'The deed or your attorney; it changes how the deal is structured, not the range.',
        choices: [
          { value: 'operating-company', label: 'The operating company' },
          { value: 'related-entity', label: 'A related entity (mine)' },
        ],
        feeds: ['report:real-estate'],
      },
      {
        key: 'rentPaidUsd', kind: 'money', optional: true,
        requiredIf: reOwned,
        ask: 'What rent does the business currently pay for the space per year? "0" if it pays none.',
        whereToFind: 'The rent expense line on the P&L, or the related-party lease if one exists.',
        feeds: ['report:bridge', 'report:real-estate'],
      },
      {
        key: 'marketRentUsd', kind: 'money', optional: true,
        requiredIf: reOwned,
        ask: 'And market rent for that space — what a landlord would charge a stranger per year?',
        whereToFind: 'A commercial broker\'s one-call opinion, or comparable listings per square foot × your footage.',
        feeds: ['report:bridge', 'report:real-estate'],
      },
    ],
  },
  {
    key: 'what-moves',
    title: 'What moves the number',
    intro:
      'The 24-month page — where the arithmetic shows what shifting the mix is worth, on a growth assumption deliberately set below what you\'ve achieved.',
    questions: [
      {
        key: 'targetServiceMixPct', kind: 'pct',
        ask: 'Where would you push the service & maintenance share of revenue over the next 24 months? (percent of revenue)',
        whereToFind: 'A target, not a fact — the published spread prices mix, so pick the number you\'d manage to.',
        feeds: ['report:what-moves'],
      },
      {
        key: 'growthPct', kind: 'pct', optional: true,
        ask: 'Annual revenue growth to assume for the projection? (Leave it and we default BELOW your achieved rate — conservative by construction.)',
        whereToFind: 'Your own plan; without an answer the report uses half your achieved two-year rate and says so.',
        feeds: ['report:what-moves'],
      },
    ],
  },
];

/** Flat views the ledger and validators use. */
export const ALL_QUESTIONS: EvalQuestion[] = SECTIONS.flatMap(s => s.questions);
const QUESTION_SECTION: Record<string, EvalSection> = Object.fromEntries(
  SECTIONS.flatMap(s => s.questions.map(q => [q.key, s])),
);

/* ── the circle-back ledger ──────────────────────────────────────────────── */

export function questionState(answers: EvalAnswers, key: string): AnswerState | 'open' {
  return answers[key]?.state ?? 'open';
}

export function answeredCount(answers: EvalAnswers): {
  answered: number; skipped: number; parked: number; open: number; total: number;
} {
  let answered = 0, skipped = 0, parked = 0;
  for (const q of ALL_QUESTIONS) {
    const s = questionState(answers, q.key);
    if (s === 'answered') answered++;
    else if (s === 'skipped') skipped++;
    else if (s === 'parked') parked++;
  }
  return { answered, skipped, parked, open: ALL_QUESTIONS.length - answered - skipped - parked, total: ALL_QUESTIONS.length };
}

export interface ParkedItem {
  key: string;
  ask: string;
  /** The go-get instruction — the hint is the errand. */
  whereToFind: string;
  sectionKey: string;
  sectionTitle: string;
  /** The owner's own note, when they left one. */
  note: string | null;
}

/** The go-get checklist: every parked question, with where to find it —
 *  read back at section ends, emailed on save-and-leave, greeted with on
 *  return. */
export function parkedList(answers: EvalAnswers): ParkedItem[] {
  return ALL_QUESTIONS
    .filter(q => questionState(answers, q.key) === 'parked')
    .map(q => ({
      key: q.key,
      ask: q.ask,
      whereToFind: q.whereToFind,
      sectionKey: QUESTION_SECTION[q.key].key,
      sectionTitle: QUESTION_SECTION[q.key].title,
      note: answers[q.key]?.note || null,
    }));
}

/* ── section gating ──────────────────────────────────────────────────────── */

export interface SectionStatus {
  key: string;
  title: string;
  complete: boolean;
  /** Required questions not yet answered, with their state and go-get hint —
   *  the material of the "built without…" gap sentences. */
  missing: Array<{ key: string; ask: string; whereToFind: string; state: AnswerState | 'open' }>;
}

function isRequired(q: EvalQuestion, answers: EvalAnswers): boolean {
  if (q.requiredIf) return q.requiredIf(answers);
  return !q.optional;
}

export function sectionStatus(answers: EvalAnswers): SectionStatus[] {
  return SECTIONS.map(s => {
    const missing = s.questions
      .filter(q => isRequired(q, answers) && questionState(answers, q.key) !== 'answered')
      .map(q => ({ key: q.key, ask: q.ask, whereToFind: q.whereToFind, state: questionState(answers, q.key) }));
    return { key: s.key, title: s.title, complete: missing.length === 0, missing };
  });
}

/* ── the report data model ───────────────────────────────────────────────── */

export interface FullBridgeLine {
  label: string;
  amountUsd: number;
  kind: 'start' | 'line' | 'subtotal' | 'total';
  note?: string;
}

export interface RevenueLine {
  key: string;
  label: string;
  revenueUsd: number;
  gmPct: number | null;
  grossProfitUsd: number | null;
}

export interface RevenueLines {
  lines: RevenueLine[];
  totalUsd: number;
  serviceMixPct: number | null;
  blendedGmPct: number | null;
}

export interface TrendRow {
  period: 'FY-2' | 'FY-1' | 'TTM';
  revenueUsd: number;
  /** Growth vs the prior row; null on the first row. */
  growthPct: number | null;
  serviceMixPct: number | null;
  ebitdaUsd: number | null;
  ebitdaMarginPct: number | null;
}

export interface Trend {
  rows: TrendRow[];
  /** Two-year compound annual rate, FY-2 → TTM. */
  achievedCagrPct: number | null;
  note: string;
}

export interface BuyerRatio {
  key: string;
  label: string;
  value: number | null;
  display: string;
  /** What a buyer's diligence tests with this ratio — qualitative deal
   *  mechanics, deliberately carrying NO industry-average figure (nothing
   *  citable to print). */
  testing: string;
  /** Question keys still needed when value is null. */
  missing: string[];
}

export interface WhatMoves {
  horizonMonths: 24;
  growthPctUsed: number;
  /** Names the arithmetic behind the default — half the achieved rate,
   *  deliberately below it — or "your assumption" when the owner set one. */
  growthNote: string;
  achievedCagrPct: number | null;
  revenueAt24moUsd: number;
  serviceMix: {
    currentPct: number | null;
    targetPct: number;
    serviceRevenueAt24moUsd: number;
    /** Additional annual service revenue the target implies; null when the
     *  current split is unknown. */
    serviceRevenueGapUsd: number | null;
  };
  /** One turn of the band on today's basis — pure arithmetic (1 × basis). */
  perTurnUsd: number;
  marginHeldPct: number;
  rangeAt24moUsd: { low: number; marketLow: number; marketHigh: number; high: number };
  note: string;
}

export interface WaterfallLine {
  label: string;
  lowUsd: number;
  highUsd: number;
}

export interface ProceedsWaterfall {
  /** Which EV endpoints the walk runs on. */
  evBasis: 'where the market clears';
  lines: WaterfallLine[];
  cashAtCloseUsd: { low: number; high: number };
  /** Set when the low leg went negative and was floored at zero. */
  shortfallNote: string | null;
  costsNote: string;
  escrowNote: string;
}

export interface FullEvaluationReport {
  lane: string;
  sections: SectionStatus[];
  ledger: ReturnType<typeof answeredCount>;
  parked: ParkedItem[];
  /** The report's own "what we don't know yet" — one sentence per withheld
   *  leg, naming the questions and where to find them. */
  gaps: string[];
  profile: {
    companyName: string | null;
    yearFounded: number | null;
    employees: number | null;
    statesServed: number | null;
    timeline: string | null;
    suretyLine: string | null;
  };
  revenueLines: RevenueLines | null;
  /** The P1 engine's leg, reused verbatim: band, range, readiness, RE note. */
  quick: EvaluationResult | UnsupportedLane | null;
  /** The full walk with the interest/D&A split the quick valuation lumps. */
  bridge: FullBridgeLine[] | null;
  trend: Trend | null;
  ratios: BuyerRatio[];
  whatMoves: WhatMoves | null;
  waterfall: ProceedsWaterfall | null;
  disclaimer: string;
}

/** Practice norms that enter the waterfall arithmetic — labeled as norms in
 *  the output, never printed as market facts. */
export const TRANSACTION_COSTS_PCT = 4;
export const ESCROW_PCT = 10;

const round1k = (n: number) => Math.round(n / 1000) * 1000;
const pct1 = (n: number) => Math.round(n * 10) / 10;

/* ── pure assembly ───────────────────────────────────────────────────────── */

export function computeFullEvaluation(answers: EvalAnswers, lane: string): FullEvaluationReport {
  const sections = sectionStatus(answers);
  const byKey = Object.fromEntries(sections.map(s => [s.key, s]));
  const complete = (k: string) => byKey[k]?.complete === true;
  const gaps: string[] = [];
  const gapFor = (k: string, withheld: string) => {
    const s = byKey[k];
    if (!s || s.complete) return;
    gaps.push(
      `${withheld} withheld — still needed: ` +
      s.missing.map(m => `${m.ask} (find it: ${m.whereToFind})`).join(' · '),
    );
  };

  const n = (k: string) => num(answers, k);
  const s = (k: string) => str(answers, k);

  /* profile — prose renders whatever is present; no gating needed. */
  const suretySingle = n('suretySingleUsd');
  const suretyAgg = n('suretyAggregateUsd');
  const profile = {
    companyName: s('companyName'),
    yearFounded: n('yearFounded'),
    employees: n('employees'),
    statesServed: n('statesServed'),
    timeline: s('timeline'),
    suretyLine: suretySingle !== null && suretyAgg !== null
      ? `${fmtUsd(suretySingle)} single / ${fmtUsd(suretyAgg)} aggregate`
      : null,
  };

  /* revenue lines */
  const totalRev = n('ttmRevenueUsd');
  const svcRev = n('serviceRevenueUsd');
  const projRev = n('projectRevenueUsd');
  let revenueLines: RevenueLines | null = null;
  if (complete('revenue-lines') && totalRev !== null && svcRev !== null && projRev !== null) {
    const otherRev = n('otherRevenueUsd') ?? 0;
    const svcGm = n('serviceGmPct');
    const projGm = n('projectGmPct');
    const lines: RevenueLine[] = [
      { key: 'service', label: 'Service & maintenance', revenueUsd: svcRev, gmPct: svcGm, grossProfitUsd: svcGm !== null ? Math.round(svcRev * svcGm / 100) : null },
      { key: 'project', label: 'Construction / projects', revenueUsd: projRev, gmPct: projGm, grossProfitUsd: projGm !== null ? Math.round(projRev * projGm / 100) : null },
    ];
    if (otherRev) lines.push({ key: 'other', label: 'Other', revenueUsd: otherRev, gmPct: null, grossProfitUsd: null });
    const gpKnown = lines.filter(l => l.grossProfitUsd !== null);
    const gpRev = gpKnown.reduce((t, l) => t + l.revenueUsd, 0);
    revenueLines = {
      lines,
      totalUsd: totalRev,
      serviceMixPct: totalRev > 0 ? pct1(svcRev / totalRev * 100) : null,
      blendedGmPct: gpRev > 0 ? pct1(gpKnown.reduce((t, l) => t + (l.grossProfitUsd || 0), 0) / gpRev * 100) : null,
    };
  } else {
    gapFor('revenue-lines', 'The revenue-lines table');
  }

  /* the quick leg — evaluate() reused verbatim. EBITDA is rebuilt from the
   * split (pre-tax + interest + D&A) and passed as the engine's earnings, so
   * the band/readiness/range math is IDENTICAL to P1 on richer inputs. */
  const pretax = n('pretaxIncomeUsd');
  const interest = n('interestUsd');
  const da = n('daUsd');
  const ownerComp = n('ownerCompUsd');
  const realEstate = s('realEstate') as RealEstate | null;
  const quickReady =
    totalRev !== null && pretax !== null && interest !== null && da !== null &&
    ownerComp !== null && complete('customers') && complete('real-estate');

  let quick: EvaluationResult | UnsupportedLane | null = null;
  let bridge: FullBridgeLine[] | null = null;
  if (quickReady) {
    const input: EvaluationInput = {
      lane,
      revenueUsd: totalRev,
      earningsUsd: pretax + interest + da,
      ownerCompUsd: ownerComp,
      addBackOneTimeUsd: n('addBackOneTimeUsd') ?? 0,
      addBackPersonalUsd: n('addBackPersonalUsd') ?? 0,
      addBackFamilyUsd: n('addBackFamilyUsd') ?? 0,
      realEstate: realEstate ?? 'leased',
      rentPaidUsd: n('rentPaidUsd') ?? 0,
      marketRentUsd: n('marketRentUsd') ?? 0,
      recurringPct: n('recurringPct') ?? 0,
      ownerDependence: (s('ownerDependence') ?? 'runs-daily') as OwnerDependence,
      topCustomerPct: n('topCustomerPct') ?? 0,
      booksQuality: (s('booksQuality') ?? 'cash') as BooksQuality,
      newConstructionPct: n('newConstructionPct') ?? 0,
    };
    quick = evaluate(input);
    if (quick.laneSupported) {
      const ebitda = pretax + interest + da;
      const marginNote = totalRev > 0 ? `${pct1(ebitda / totalRev * 100)}% of revenue` : undefined;
      bridge = [
        { label: 'Pre-tax income (per books)', amountUsd: pretax, kind: 'start' },
        { label: 'Interest expense', amountUsd: interest, kind: 'line' },
        { label: 'Depreciation & amortization', amountUsd: da, kind: 'line' },
        { label: 'EBITDA', amountUsd: ebitda, kind: 'subtotal', note: marginNote },
        // The engine's own bridge, minus its combined first line (our three
        // lines above sum to exactly that amount — the invariant the tests
        // assert).
        ...quick.bridge.slice(1).map(l => ({ label: l.label, amountUsd: l.amountUsd, kind: 'line' as const })),
        {
          label: `Normalized ${quick.basisType}`, amountUsd: quick.basisUsd, kind: 'total',
          note: totalRev > 0 ? `${pct1(quick.basisUsd / totalRev * 100)}% of revenue` : undefined,
        },
      ];
    } else {
      gaps.push(quick.message);
    }
  } else {
    gapFor('normalization', 'The normalized-earnings bridge and the valuation range');
    gapFor('customers', 'The readiness read');
    gapFor('real-estate', 'The market-rent restatement (and with it the range)');
    if (totalRev === null) gapFor('revenue-lines', 'The valuation range (it needs the top line)');
  }

  /* trend */
  let trend: Trend | null = null;
  const fy1Rev = n('fy1RevenueUsd'), fy2Rev = n('fy2RevenueUsd');
  if (complete('trend') && fy1Rev !== null && fy2Rev !== null && totalRev !== null) {
    const rows: TrendRow[] = [
      {
        period: 'FY-2', revenueUsd: fy2Rev, growthPct: null,
        serviceMixPct: n('fy2ServiceMixPct'),
        ebitdaUsd: n('fy2EbitdaUsd'),
        ebitdaMarginPct: n('fy2EbitdaUsd') !== null && fy2Rev > 0 ? pct1((n('fy2EbitdaUsd') as number) / fy2Rev * 100) : null,
      },
      {
        period: 'FY-1', revenueUsd: fy1Rev,
        growthPct: fy2Rev > 0 ? pct1((fy1Rev / fy2Rev - 1) * 100) : null,
        serviceMixPct: n('fy1ServiceMixPct'),
        ebitdaUsd: n('fy1EbitdaUsd'),
        ebitdaMarginPct: n('fy1EbitdaUsd') !== null && fy1Rev > 0 ? pct1((n('fy1EbitdaUsd') as number) / fy1Rev * 100) : null,
      },
      {
        period: 'TTM', revenueUsd: totalRev,
        growthPct: fy1Rev > 0 ? pct1((totalRev / fy1Rev - 1) * 100) : null,
        serviceMixPct: revenueLines?.serviceMixPct ?? null,
        ebitdaUsd: pretax !== null && interest !== null && da !== null ? pretax + interest + da : null,
        ebitdaMarginPct: pretax !== null && interest !== null && da !== null && totalRev > 0
          ? pct1((pretax + interest + da) / totalRev * 100) : null,
      },
    ];
    const achievedCagrPct = fy2Rev > 0 && totalRev > 0 ? pct1((Math.sqrt(totalRev / fy2Rev) - 1) * 100) : null;
    trend = {
      rows,
      achievedCagrPct,
      note: 'EBITDA rows are as reported (pre-tax income + interest + depreciation), before the add-backs the bridge page walks — the trend shows trajectory, the bridge shows the basis.',
    };
  } else {
    gapFor('trend', 'The three-year trend page');
    if (complete('trend') && totalRev === null) {
      gaps.push('The three-year trend page withheld — it needs the TTM top line from the revenue section.');
    }
  }

  /* buyer's ratios — computed independently, each naming what it still
   * needs, so a half-answered balance sheet still shows its work. */
  const basis = quick?.laneSupported && quick.basisUsd > 0 ? quick.basisUsd : null;
  const basisLabel = quick?.laneSupported ? quick.basisType : 'normalized earnings';
  const ar = n('arUsd'), wip = n('wipOverUnderUsd'), debt = n('fundedDebtUsd');
  const cash = n('cashUsd'), wc = n('workingCapitalUsd'), backlog = n('backlogUsd');
  const employees = n('employees');

  const ratio = (
    key: string, label: string, testing: string,
    needs: Array<[string, number | null]>,
    compute: () => { value: number; display: string },
  ): BuyerRatio => {
    const missing = needs.filter(([, v]) => v === null).map(([k]) => k);
    if (missing.length > 0) return { key, label, value: null, display: '—', testing, missing };
    const { value, display } = compute();
    return { key, label, value, display, testing, missing: [] };
  };

  const ratios: BuyerRatio[] = [
    ratio('dso', 'Days sales outstanding (DSO)',
      'How fast the book collects — diligence walks the A/R aging for receivables that are really loans, and slow collection becomes a working-capital deduction at the peg.',
      [['arUsd', ar], ['ttmRevenueUsd', totalRev]],
      () => {
        const days = (ar as number) / ((totalRev as number) / 365);
        return { value: Math.round(days), display: `${Math.round(days)} days` };
      }),
    ratio('wip', 'WIP position (net over/under billings)',
      'Whether margin is borrowed from tomorrow — overbilling is cash discipline, underbilling means earnings arrived before the cash; a quality-of-earnings review rebuilds the POC schedule either way.',
      [['wipOverUnderUsd', wip]],
      () => ({
        value: wip as number,
        display: (wip as number) > 0 ? `net overbilled ${fmtUsd(wip as number)}`
          : (wip as number) < 0 ? `net underbilled ${fmtUsd(-(wip as number))}`
          : 'billed level',
      })),
    ratio('debtToEbitda', `Funded debt / ${basisLabel}`,
      'How much of the price is already spoken for — funded debt is repaid or assumed at close, and lenders size new leverage against normalized earnings.',
      [['fundedDebtUsd', debt], ['normalized basis', basis]],
      () => {
        const x = (debt as number) / (basis as number);
        return { value: pct1(x * 100) / 100, display: `${(Math.round(x * 10) / 10).toFixed(1)}x` };
      }),
    ratio('netDebtToEbitda', `Net debt / ${basisLabel}`,
      'The same test after your cash — buyers price cash-free, debt-free, so cash and funded debt net against each other at close.',
      [['fundedDebtUsd', debt], ['cashUsd', cash], ['normalized basis', basis]],
      () => {
        const x = ((debt as number) - (cash as number)) / (basis as number);
        return { value: pct1(x * 100) / 100, display: `${(Math.round(x * 10) / 10).toFixed(1)}x` };
      }),
    ratio('backlogCoverage', 'Backlog coverage (months of project work)',
      'How much of next year is already sold — a buyer tests whether backlog is signed, funded, and at margins consistent with the history on the trend page.',
      [['backlogUsd', backlog], ['projectRevenueUsd', projRev]],
      () => {
        const months = (projRev as number) > 0 ? (backlog as number) / ((projRev as number) / 12) : 0;
        return { value: pct1(months), display: `${pct1(months)} months` };
      }),
    ratio('revenuePerEmployee', 'Revenue per employee',
      'Labor productivity — buyers compare it against their own operations to underwrite the integration plan; it is a comparison they make, not a threshold we publish.',
      [['ttmRevenueUsd', totalRev], ['employees', employees]],
      () => {
        const v = (totalRev as number) / Math.max(1, employees as number);
        return { value: Math.round(v), display: `${fmtUsd(Math.round(v))} per employee` };
      }),
    ratio('workingCapitalPct', 'Working capital, % of revenue',
      'What it takes to fund the work — the working-capital peg is set off this base, and a business that runs heavier than the peg gives the difference back in proceeds.',
      [['workingCapitalUsd', wc], ['ttmRevenueUsd', totalRev]],
      () => {
        const v = (totalRev as number) > 0 ? (wc as number) / (totalRev as number) * 100 : 0;
        return { value: pct1(v), display: `${pct1(v)}% of revenue` };
      }),
  ];
  if (!complete('balance-sheet')) gapFor('balance-sheet', "Parts of the buyer's-ratios table");
  if (!complete('backlog-surety')) gapFor('backlog-surety', 'The backlog-coverage ratio');

  /* what moves the number — 24-month arithmetic, growth DEFAULTED BELOW the
   * achieved rate (half of it, floored at zero — named in the output). */
  let whatMoves: WhatMoves | null = null;
  const targetMix = n('targetServiceMixPct');
  if (quick?.laneSupported && basis !== null && totalRev !== null && totalRev > 0 && targetMix !== null) {
    const achieved = trend?.achievedCagrPct ?? null;
    const ownGrowth = n('growthPct');
    const growthPctUsed = ownGrowth !== null
      ? ownGrowth
      : achieved !== null ? Math.max(0, pct1(achieved / 2)) : 0;
    const growthNote = ownGrowth !== null
      ? 'Your assumption, as entered.'
      : achieved !== null
        ? `Planning default: half your achieved ${achieved}% two-year rate — deliberately below it. Override it in the chat if you have a basis for more.`
        : 'No growth assumed — the projection holds revenue flat until your prior-year figures land and an achieved rate exists to discount.';
    const g = growthPctUsed / 100;
    const revenueAt24moUsd = Math.round(totalRev * (1 + g) * (1 + g));
    const marginHeldPct = pct1(basis / totalRev * 100);
    const basisAt24mo = basis * (1 + g) * (1 + g);
    const serviceRevenueAt24moUsd = Math.round(revenueAt24moUsd * targetMix / 100);
    whatMoves = {
      horizonMonths: 24,
      growthPctUsed,
      growthNote,
      achievedCagrPct: achieved,
      revenueAt24moUsd,
      serviceMix: {
        currentPct: revenueLines?.serviceMixPct ?? null,
        targetPct: targetMix,
        serviceRevenueAt24moUsd,
        serviceRevenueGapUsd: svcRev !== null ? serviceRevenueAt24moUsd - svcRev : null,
      },
      perTurnUsd: basis,
      marginHeldPct,
      rangeAt24moUsd: {
        low: Math.max(0, round1k(basisAt24mo * quick.band.low)),
        marketLow: Math.max(0, round1k(basisAt24mo * quick.band.marketLow)),
        marketHigh: Math.max(0, round1k(basisAt24mo * quick.band.marketHigh)),
        high: Math.max(0, round1k(basisAt24mo * quick.band.high)),
      },
      note:
        `Arithmetic, not a forecast: revenue grown at ${growthPctUsed}% for two years, the normalized margin ` +
        `(${marginHeldPct}%) held constant, the published band reapplied. Each full turn of the band is worth ` +
        `${fmtUsd(basis)} on today's basis — that is 1 × your normalized ${quick.basisType}, nothing more.`,
    };
  } else if (targetMix === null) {
    gapFor('what-moves', 'The 24-month what-moves page');
  }

  /* proceeds waterfall — EV range less funded debt, less costs at the
   * labeled practice norm, less the labeled escrow → cash at close RANGE. */
  let waterfall: ProceedsWaterfall | null = null;
  if (quick?.laneSupported && basis !== null && debt !== null) {
    const evLow = quick.rangeUsd.marketLow;
    const evHigh = quick.rangeUsd.marketHigh;
    const costsLow = Math.round(evLow * TRANSACTION_COSTS_PCT / 100);
    const costsHigh = Math.round(evHigh * TRANSACTION_COSTS_PCT / 100);
    const escrowLow = Math.round(evLow * ESCROW_PCT / 100);
    const escrowHigh = Math.round(evHigh * ESCROW_PCT / 100);
    const rawLow = evLow - debt - costsLow - escrowLow;
    const rawHigh = evHigh - debt - costsHigh - escrowHigh;
    waterfall = {
      evBasis: 'where the market clears',
      lines: [
        { label: 'Enterprise value (where the market clears)', lowUsd: evLow, highUsd: evHigh },
        { label: 'Less: funded debt (repaid at close)', lowUsd: -debt, highUsd: -debt },
        { label: `Less: transaction costs at ${TRANSACTION_COSTS_PCT}% (practice norm)`, lowUsd: -costsLow, highUsd: -costsHigh },
        { label: `Less: escrow / holdback at ${ESCROW_PCT}% (held, not lost)`, lowUsd: -escrowLow, highUsd: -escrowHigh },
      ],
      cashAtCloseUsd: { low: Math.max(0, rawLow), high: Math.max(0, rawHigh) },
      shortfallNote: rawLow < 0
        ? 'At the low end of the range, funded debt plus costs exceed enterprise value — the walk floors at zero rather than print a negative check.'
        : null,
      costsNote:
        `Transaction costs held at ${TRANSACTION_COSTS_PCT}% of enterprise value — a practice planning norm, not a quote; ` +
        'actual legal, accounting, and advisory costs are engagement-specific.',
      escrowNote:
        `Escrow / holdback held at ${ESCROW_PCT}% — a structure the practice plans around, negotiated deal by deal. ` +
        'It is deferred, not lost: released on the escrow schedule net of any claims.',
    };
  } else if (quick?.laneSupported && debt === null) {
    gaps.push(
      'The proceeds waterfall withheld — still needed: total funded debt ' +
      '(find it: your debt schedule, or the balance sheet\'s loan balances summed).',
    );
  }

  return {
    lane,
    sections,
    ledger: answeredCount(answers),
    parked: parkedList(answers),
    gaps,
    profile,
    revenueLines,
    quick,
    bridge,
    trend,
    ratios,
    whatMoves,
    waterfall,
    disclaimer: DISCLAIMER,
  };
}

/* ── THE NARROWED BAND (§P2, Paul 2026-08-04: "it's kind of bullshit on
 * evaluations where they give you this big range — we should be able to
 * narrow it down") ─────────────────────────────────────────────────────────
 *
 * The published tier band (marketLow–marketHigh) is the STARTING band, not
 * the deliverable. Each narrowing step below is EVIDENCE, never opinion:
 * it moves an endpoint only on a threshold already published in the driver
 * notes (house/evaluate.ts) or the lane register (house/laneBenchmarks.ts),
 * and every step carries that source with it. Where a published figure is a
 * range (20–30% owner discount, 5–15% QofE haircut, 1–2 turn premium), the
 * CONSERVATIVE endpoint moves the band — the narrowing never overstates.
 *
 * Construction, documented once: a verified driver removes the slice of the
 * REMAINING band width its published discount occupies at the bottom (the
 * band's floor is where the discounted profiles clear; your evidence says
 * you are not one of them). The service/recurring re-rate moves the floor
 * into the upper half of the tier — the plan's own sentence, because the
 * published mix spread IS the tier spread. The SBA financing test caps the
 * ceiling only when the SBA rail actually reaches the deal size (implied
 * loan inside the 7(a) program maximum) — above that, the buyer set is
 * platforms and funded groups whose demonstrated pricing IS the published
 * band, and arithmetic about a loan nobody would write caps nothing.
 *
 * Parked / skipped / unanswered driver questions leave their width IN, and
 * say so — the narrowing engine is the incentive to finish the walk.
 *
 * Always a range, floor ≤ ceiling, endpoints quantized to 0.1x / $100k.
 */

export interface NarrowStep {
  /** The evidence, in a sentence — names the owner's own figure AND the
   *  published threshold it clears. */
  label: string;
  /** The published source the threshold traces to. Never empty. */
  source: string;
  moved: 'floor' | 'ceiling';
  fromX: number;
  toX: number;
}

/** The financing-ceiling leg's inputs, computed by the caller from
 *  MODEL.DSCR.STRESS.v1 + MODEL.LBO.SBA.v1 outputs (house stays pure — the
 *  server owns the SOP constants and supplies the citation string). */
export interface NarrowBandFinancing {
  /** DSCR at `pricedAtX` under the SOP structure (10% equity, ceiling rate). */
  baseDscr: number;
  /** The lender DSCR standard the SOP publishes. */
  lenderFloor: number;
  /** The multiple of the SAME basis the debt service was priced at. */
  pricedAtX: number;
  /** Whether the implied loan fits the 7(a) program maximum — the cap only
   *  binds when the SBA buyer actually exists at this deal size. */
  loanWithin7aCap: boolean;
  /** The published citation (SBA SOP 50 10 8 …), supplied by the caller. */
  source: string;
}

export interface NarrowBandModels {
  financing?: NarrowBandFinancing | null;
}

export interface NarrowedBand {
  lowX: number;
  highX: number;
  lowUsd: number;
  highUsd: number;
  steps: NarrowStep[];
  /** One sentence per driver whose width stayed IN the band — parked,
   *  skipped, or unanswered ("your band is Nx wider because X is
   *  unverified"). Empty on a complete, clean profile. */
  widthNotes: string[];
  /** The starting band and the basis it applies to — carried so the band
   *  page can render the narrowed band self-contained, including in DRAFT
   *  mode when the readiness legs haven't run yet. */
  band: LaneBand;
  basisType: 'SDE' | 'Adjusted EBITDA';
  basisUsd: number;
}

/** The band + basis leg WITHOUT the readiness drivers — what the narrowed
 *  band needs in a draft whose driver questions are still parked or open.
 *  The basis (normalization + market-rent restatement) is exactly the
 *  engine's own bridge; the neutral driver placeholders below touch only
 *  readiness, which this helper deliberately discards. null until the
 *  normalization answers + the real-estate treatment are in — a basis
 *  computed against a rent we don't have would be a wrong number, not a
 *  draft. */
export function bandBasisFor(
  answers: EvalAnswers,
  lane: string,
): Pick<EvaluationResult, 'band' | 'basisUsd' | 'basisType'> | null {
  const totalRev = num(answers, 'ttmRevenueUsd');
  const pretax = num(answers, 'pretaxIncomeUsd');
  const interest = num(answers, 'interestUsd');
  const da = num(answers, 'daUsd');
  const ownerComp = num(answers, 'ownerCompUsd');
  const reComplete = sectionStatus(answers).find(s => s.key === 'real-estate')?.complete === true;
  if (totalRev === null || pretax === null || interest === null || da === null || ownerComp === null || !reComplete) {
    return null;
  }
  const r = evaluate({
    lane,
    revenueUsd: totalRev,
    earningsUsd: pretax + interest + da,
    ownerCompUsd: ownerComp,
    addBackOneTimeUsd: num(answers, 'addBackOneTimeUsd') ?? 0,
    addBackPersonalUsd: num(answers, 'addBackPersonalUsd') ?? 0,
    addBackFamilyUsd: num(answers, 'addBackFamilyUsd') ?? 0,
    realEstate: (str(answers, 'realEstate') ?? 'leased') as RealEstate,
    rentPaidUsd: num(answers, 'rentPaidUsd') ?? 0,
    marketRentUsd: num(answers, 'marketRentUsd') ?? 0,
    // Readiness placeholders — narrowBand reads the REAL driver answers
    // itself; these feed only the readiness score this helper throws away.
    recurringPct: 0,
    ownerDependence: 'runs-daily',
    topCustomerPct: 0,
    booksQuality: 'cash',
    newConstructionPct: 0,
  });
  return r.laneSupported ? { band: r.band, basisUsd: r.basisUsd, basisType: r.basisType } : null;
}

/** The published register the readiness thresholds are carried from — the
 *  same attribution line the report prints under the drivers table. */
export const READINESS_THRESHOLD_SOURCE =
  'smbX published assessments: "Home Services — State of the Market" (Aug 2026) · ' +
  '"Commercial MEP Buy-Side Assessment" (Aug 2026)';

const q1x = (n: number) => Math.round(n * 10) / 10;
const round100k = (n: number) => Math.round(n / 100_000) * 100_000;

export function narrowBand(
  result: Pick<EvaluationResult, 'band' | 'basisUsd' | 'basisType'>,
  answers: EvalAnswers,
  models?: NarrowBandModels,
): NarrowedBand {
  const band = result.band;
  // The starting band: the published tier (where the market clears).
  let floor = band.marketLow;
  let ceiling = band.marketHigh;
  const steps: NarrowStep[] = [];
  const widthNotes: string[] = [];

  const width = () => ceiling - floor;
  const state = (k: string): AnswerState | 'open' => answers[k]?.state ?? 'open';
  const unverified = (k: string) =>
    state(k) === 'parked' ? 'parked on your go-get list'
      : state(k) === 'skipped' ? 'skipped'
      : 'unanswered';
  const step = (label: string, source: string, moved: 'floor' | 'ceiling', fromX: number, toX: number) => {
    steps.push({ label, source, moved, fromX: q1x(fromX), toX: q1x(toX) });
  };
  /** "Nx wider" when the slice rounds to a printable tenth; plain "wider"
   *  when it doesn't — never a fabricated 0.1x. */
  const widerPhrase = (sliceX: number) => (q1x(sliceX) >= 0.1 ? `${q1x(sliceX)}x wider` : 'wider');

  const recurring = num(answers, 'recurringPct');
  const svcRev = num(answers, 'serviceRevenueUsd');
  const ttmRev = num(answers, 'ttmRevenueUsd');
  const serviceMixPct = svcRev !== null && ttmRev !== null && ttmRev > 0 ? (svcRev / ttmRev) * 100 : null;
  // The lane's own band publishes the mix spread (commercial mechanical:
  // "the spread is the service-mix arbitrage" / "8–11x with a real service
  // book") — only then does the service-mix reading move the band on the
  // band's own source.
  const bandPublishesMix = /service/i.test(band.basisNote + ' ' + band.scopeNote);

  /* 1 · Service / recurring mix — lifts the floor. */
  if (bandPublishesMix && serviceMixPct !== null && serviceMixPct >= 45) {
    const to = q1x(floor + 0.5 * width());
    step(
      `Service & maintenance book at ${pct1(serviceMixPct)}% of revenue — the published mix spread is the tier ` +
      'spread; the floor moves into the upper half of the band.',
      band.source,
      'floor', floor, to,
    );
    floor = to;
  } else if (recurring !== null && recurring >= 40) {
    const to = q1x(floor + 0.5 * width());
    step(
      `Recurring revenue at ${recurring}% — clears the published ≈40% re-rate threshold; the floor moves into ` +
      'the upper half of the band.',
      READINESS_THRESHOLD_SOURCE,
      'floor', floor, to,
    );
    floor = to;
  } else if (recurring !== null && recurring >= 30) {
    // Published: books above 30% command a 1–2 turn premium over peers
    // under 15%. The conservative single turn lifts the floor, capped at
    // the mid-band (the weaker threshold never buys more than the ≥40 one).
    const lift = Math.min(1.0, 0.5 * width());
    const to = q1x(floor + lift);
    step(
      `Recurring revenue at ${recurring}% — above the published 30% line (a 1–2 turn premium); the conservative ` +
      'single turn lifts the floor.',
      READINESS_THRESHOLD_SOURCE,
      'floor', floor, to,
    );
    floor = to;
  } else if (recurring === null && !(bandPublishesMix && serviceMixPct !== null && serviceMixPct >= 45)) {
    widthNotes.push(
      `Your band is ${widerPhrase(0.5 * width())} because the recurring-revenue share is ${unverified('recurringPct')} — ` +
      'verified at or above the published ≈40% re-rate threshold, it lifts the floor into the upper half of the band.',
    );
  }

  /* 2 · Owner dependence — removes the bottom width the published 20–30%
   *     owner-dependency discount occupies (conservative 20% share). */
  const dep = str(answers, 'ownerDependence');
  if (dep === 'manager-in-place' || dep === 'absentee') {
    const to = q1x(floor + 0.20 * width());
    step(
      (dep === 'absentee'
        ? 'Runs without the owner'
        : 'A manager runs the day to day') +
      ' — the published 20–30% owner-dependency discount comes off the bottom (conservative 20% share).',
      READINESS_THRESHOLD_SOURCE,
      'floor', floor, to,
    );
    floor = to;
  } else if (dep === null) {
    widthNotes.push(
      `Your band is ${widerPhrase(0.20 * width())} because owner dependence is ${unverified('ownerDependence')} — ` +
      'a manager in place (or a business that runs without you) removes the published 20–30% owner-dependency ' +
      'discount from the bottom of the band.',
    );
  }

  /* 3 · Books quality — reviewed books remove the QofE-haircut width
   *     (published 5–15% of headline earnings; conservative 5% share). */
  const books = str(answers, 'booksQuality');
  if (books === 'reviewed') {
    const to = q1x(floor + 0.05 * width());
    step(
      'Reviewed accrual books — the published 5–15% QofE haircut comes off the floor (conservative 5% share).',
      READINESS_THRESHOLD_SOURCE,
      'floor', floor, to,
    );
    floor = to;
  } else if (books === null) {
    widthNotes.push(
      `Your band is ${widerPhrase(0.05 * width())} because the books basis is ${unverified('booksQuality')} — ` +
      'accrual books with outside review remove the published 5–15% quality-of-earnings haircut from the floor.',
    );
  }

  /* 4 · Concentration — inside the published 15–20% line HOLDS the ceiling.
   *     Above it, the published data says "discounts hard" without a number,
   *     so the ceiling is simply not held — nothing is invented either way. */
  const conc = num(answers, 'topCustomerPct');
  if (conc !== null && conc <= 15) {
    step(
      `Top customer at ${conc}% — inside the published 15–20% concentration line; the ceiling holds.`,
      READINESS_THRESHOLD_SOURCE,
      'ceiling', ceiling, ceiling,
    );
  } else if (conc === null) {
    widthNotes.push(
      `The top of your band is unheld because customer concentration is ${unverified('topCustomerPct')} — ` +
      'verified inside the published 15–20% line, the ceiling holds where the market clears.',
    );
  }

  /* 5 · The financing ceiling — a buyer cannot pay what the earnings cannot
   *     service, and that is arithmetic, not opinion. DSCR scales linearly
   *     with price at a fixed structure, so the maximum financeable multiple
   *     is exact: pricedAtX × baseDscr ÷ lenderFloor. It binds only when the
   *     SBA rail reaches the deal size (loan inside the 7(a) maximum). */
  const fin = models?.financing;
  if (fin && fin.baseDscr > 0 && fin.lenderFloor > 0 && fin.pricedAtX > 0 && fin.loanWithin7aCap) {
    const capX = fin.pricedAtX * fin.baseDscr / fin.lenderFloor;
    if (capX < ceiling) {
      // Never below the running floor — the floor rests on the published
      // band + verified drivers; when the SBA arithmetic lands under it,
      // the structure story (equity buyers, seller notes) lives on the
      // buyer-types page, and the band stays a band.
      const to = q1x(Math.max(floor, capX));
      step(
        `SBA financing ceiling — your earnings finance ${q1x(capX)}x at most at the ${fin.lenderFloor.toFixed(2)}x ` +
        'lender DSCR standard' +
        (capX < floor ? '; held at the profile floor (the structure story is on the buyer-types page)' : '') +
        '; the top comes down to meet it.',
        fin.source,
        'ceiling', ceiling, to,
      );
      ceiling = to;
    } else {
      step(
        'SBA financing test — the top of the band finances on your own cash flow at the lender DSCR standard; ' +
        'the ceiling holds.',
        fin.source,
        'ceiling', ceiling, ceiling,
      );
    }
  }

  /* Endpoints: 0.1x / $100k, and ALWAYS a range. */
  if (ceiling < floor) ceiling = floor;
  let lowX = q1x(floor);
  let highX = q1x(ceiling);
  if (highX - lowX < 0.1) lowX = Math.max(0, q1x(highX - 0.1));
  const basis = Math.max(0, result.basisUsd);
  let lowUsd = Math.max(0, round100k(lowX * basis));
  let highUsd = Math.max(0, round100k(highX * basis));
  if (highUsd <= lowUsd) highUsd = lowUsd + 100_000;

  return {
    lowX, highX, lowUsd, highUsd, steps, widthNotes,
    band, basisType: result.basisType, basisUsd: result.basisUsd,
  };
}
