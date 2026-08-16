/**
 * house/where.ts — WHICH SYSTEM OWNS THIS PROCESS, AS DATA
 *
 * (2026-08-14, Paul: "which system to use, bc going back and forth is hard. I
 * want to build one place to house all of my processes for sourcing all of
 * DEFINITIVE." → "lets give this finding to cowork so it understands
 * completely programatically" → "lets clearly delineate responsibilities and
 * workflows for all processes".)
 *
 * THE SETTLED ANSWER — THE IoI SEAM (Paul, 2026-08-15). `THE_IOI_SEAM.md` at
 * the repo root is the governing document; this table implements it, and where
 * the two disagree that file wins and this is the thing to fix.
 *
 *   MARKET-shaped work is the STUDIO.   DEAL-shaped work is the APP.
 *   The IoI is the event that moves a candidate from one to the other.
 *
 * Market-shaped is one-to-many and speculative, with no counterparty yet:
 * research, masters, verification, screens, buy-boxes, collateral, and the
 * preliminary math that decides whether a candidate deserves an IoI.
 * Deal-shaped is one-to-one and counterparty-confidential: deal math on real
 * financials, documents, the data room.
 *
 * It splits on AUDIENCE, which is the same law that already separates
 * `collateral/` from `decks/` in the workspace — and that is why it holds
 * where the previous two attempts did not. This table was written on
 * 2026-08-14 against "raw INPUT vs practice OUTPUT", and before that against
 * "documents are files, pipelines are rows". Both put collateral and the
 * corp-dev documents in the wrong place, from opposite directions. Audience
 * puts them back in the studio and explains why in one word.
 *
 * ONE ASYMMETRY, and it is deliberate: CRM STARTS BEFORE THE IoI. Outreach is
 * app-side from the first touch, so a candidate has a CRM row while its
 * analysis still lives in `markets/<m>/screen/`. The two meet at the promotion.
 *
 * ONE ENGINE, TWO CONSUMERS. `house/deal.ts` holds the formulas once. The app
 * runs them natively for live deals; a studio session runs the same code for
 * pre-IoI screening. `house/__tests__/deal.test.mts` imports BOTH the shared
 * engine and the app's own `core.ts` and asserts they agree — that test is the
 * mechanism this seam depends on, because the disease it prevents is the app
 * saying DSCR 1.31 while a studio analysis says 1.28 and nobody knowing which
 * is right.
 *
 * Four findings still stand behind the app half, all verified against this tree:
 *
 *  1. DEFINITIVE cannot leave the app. 169 gate/slot references and 132
 *     MODEL.* definitions live in `definitiveDealMechanicsCatalog.ts` and
 *     `v19ModelRuntime.ts`, with 385 conformance cases behind them. It is a
 *     STATEFUL substrate — route map, DealState, gates that advance — and
 *     files are the wrong shape for it.
 *  2. Live scenario modelling wants to sit beside the data room. Paul:
 *     "that is where the data room and financial docs will be housed."
 *  3. Only research ever cost real money — ~$18 a press at `deep`. Modelling,
 *     CRM, deal state, comms and exports all measure at zero.
 *  4. Sourcing was never expensive either — Haiku per candidate, and Places on
 *     a separate key that is free under 5k Place Details a month.
 *
 * WHY THIS IS DATA AND NOT PROSE. A paragraph in a doc rots silently, and this
 * repo has three live examples of exactly that — THE_LINE_POLICY.md and
 * DESIGN_LANGUAGE.md pointed at from a workspace that cannot read them, and a
 * fee rule sourced from a file that does not exist. So the routing is a table
 * here, `scripts/studio/where.mts` answers questions from it, and
 * `house/__tests__/where.test.mts` fails if the shipped doc and this table
 * disagree. The app and a Cowork session read the SAME answer.
 *
 * PURE by house doctrine: no db, no API key, no env, no clock.
 */

export type Owner = 'app' | 'workspace' | 'both';

/** What the process costs to run, in the only terms that mattered. */
export type Cost =
  | 'free'        // calls no model at all
  | 'drip'        // Haiku or a bounded Sonnet turn — cents
  | 'expensive';  // can spend dollars on one press

export interface Process {
  id: string;
  /** What a person would call it. */
  name: string;
  group: 'sourcing' | 'deal' | 'crm' | 'collateral' | 'ops';
  owner: Owner;
  cost: Cost;
  /**
   * Does this work sit inside a sitting with other work? The load-bearing
   * field: interleaved work must not be split across systems.
   */
  interleaves: boolean;
  /** One sentence. Why this owner and not the other. */
  why: string;
  /** How it is actually run, in order. Commands where there are commands. */
  workflow: string[];
  /** Words a person might use when asking where this goes. */
  aka: string[];
  /**
   * What the owner CANNOT do yet, when the routing decision has outrun the
   * implementation.
   *
   * Added 2026-08-14 after this table shipped saying corp-dev documents and
   * deal documents were live in the app. Both were marked app-owned on Paul's
   * instruction, the lane was switched on, and neither claim survived a look at
   * the code: `corpDevDocs.ts` generates three of PLAYBOOK's four (no target
   * map), and nothing in the app produces PLAYBOOK §5's deal memo, diligence
   * plan or term framework at all.
   *
   * A routing table that says "the app" for something the app cannot produce is
   * worse than no table — it sends the work somewhere it dies. So a decided
   * destination and a working implementation are now two different fields, and
   * the gap is printed next to the answer rather than discovered later.
   */
  gap?: string;
}

/* `$REPO` in a workflow line means the engine checkout; the workspace laws
   define it. App entries name the surface, since there is no command to give. */

export const PROCESSES: Process[] = [
  /* ── sourcing ─────────────────────────────────────────────────────── */
  {
    id: 'market-research',
    name: 'Market research — build a master from scratch',
    group: 'sourcing', owner: 'workspace', cost: 'expensive', interleaves: false,
    why: 'The only path that spends dollars per press, and it is a quarterly batch rather than something you do mid-deal.',
    workflow: [
      'Read RESEARCH.md § B. A full hunt is ~20 runs over several hours.',
      'Sources land in markets/<m>/research/, logged in _log.md — it is resumable.',
      'Never run this in the app: the studio lane is off precisely because of this path.',
    ],
    aka: ['research', 'market master', 'hunt', 'gather sources', 'new market'],
  },
  {
    id: 'master-synthesis',
    name: 'Fold research into the market master',
    group: 'sourcing', owner: 'workspace', cost: 'expensive', interleaves: false,
    why: 'Every source\'s full text in one call, plus a retry when the citation audit fails. Document-shaped and wants a diff.',
    workflow: [
      'Synthesize into markets/<m>/master.md, version into versions/master-vN.md.',
      'npx tsx $REPO/scripts/studio/audit.mts markets/<m>/master.md',
      'The master is the source of truth. Never copy it — derive from it.',
    ],
    aka: ['synthesis', 'fold in', 'update master', 'rebuild master'],
  },
  {
    id: 'corp-dev-documents',
    name: 'Market map · who\'s who · target map · thesis',
    group: 'sourcing', owner: 'workspace', cost: 'free', interleaves: false,
    why: 'MARKET-shaped: derived from the master, written before any counterparty exists. THE_IOI_SEAM.md returns these to the studio with research and verification, which is where the master and the citation audit already live.',
    workflow: [
      'App → Studio → the market. corpDevDocs.ts generates all three.',
      'LIVE since 2026-08-14: STUDIO_IN_APP is true and the studio lane is on.',
      'PLAYBOOK.md §1–4 remains the SPEC for what each contains, wherever it renders.',
      'The master these derive from still lives on disk and is read, never copied.',
    ],
    gap: 'The app CAN generate three of these (corpDevDocs.ts: market map, who\'s who, thesis) but not the target map — and under the IoI seam that no longer matters much, because all four are studio work now. Noted so nobody re-discovers the missing generator and reads it as a bug.',
    aka: ['market map', 'who\'s who', 'thesis', 'target map', 'client document'],
  },
  {
    id: 'target-screen',
    name: 'Build the candidate list for a market',
    group: 'sourcing', owner: 'workspace', cost: 'free', interleaves: false,
    why: 'A CSV Paul manages in Sheets. Discovery, not commitment — it becomes app rows only when a target goes live.',
    workflow: [
      'npx tsx $REPO/scripts/studio/screen.mts init <market>',
      'npx tsx $REPO/scripts/studio/screen.mts pull <market>   # needs GOOGLE_PLACES_API_KEY',
      'npx tsx $REPO/scripts/studio/screen.mts rank <market>   # free, offline',
      'Places is DISCOVERY, not evidence — verify against the licence registry before a name reaches a client.',
    ],
    aka: ['screen', 'candidates', 'target list', 'candidate board'],
  },
  {
    id: 'data-wrangling',
    name: 'Data wrangling — messy input into something structured',
    group: 'sourcing', owner: 'workspace', cost: 'free', interleaves: false,
    why: 'Named by Paul 2026-08-14 as Cowork work. Reading a messy sheet, reconciling exports, mapping columns, bucketing records — judgement over unstructured input, which is what a session is good at and what a form is bad at.',
    workflow: [
      'Do the reading and the mapping here, where the raw files are.',
      'Push the RESULT into the app rather than working the app by hand:',
      '  npx tsx $REPO/scripts/studio/push-crm.mts',
      'The endpoint calls no model — the intelligence is the mapping, and it',
      'happens on your own subscription rather than the metered org key.',
      'Never invent a row to fill a column. A fabricated CRM contact gets EMAILED.',
    ],
    aka: ['data wrangling', 'wrangling', 'messy data', 'spreadsheet', 'import', 'mapping', 'reconcile', 'csv'],
  },
  {
    id: 'pre-ioi-math',
    name: 'Pre-IoI screening math — is this candidate worth an IoI?',
    group: 'sourcing', owner: 'workspace', cost: 'free', interleaves: false,
    why: 'MARKET-shaped. Screening thirty candidates off a register must not require thirty deal records in the app — it requires the same formulas the app would use, run over a list.',
    workflow: [
      'npx tsx $REPO/scripts/studio/deal.mts run <spec.deal.mts>   # same engine as the app',
      'Output is a DELIVERABLE — a document or workbook you can hand someone —',
      'never a live modelling surface. Live scenario work is in-app, full stop.',
      'At the IoI the candidate is PROMOTED and its runs move with it: see ioi-promotion.',
    ],
    aka: ['screening math', 'pre-ioi', 'candidate math', 'workbench', 'quick model', 'triage'],
    gap: 'The engine is NOT vendored yet. Today this reads $REPO directly, which is always-current but carries NO provenance stamp — an output cannot say which engine version produced it, and it breaks if the clone is missing or stale. THE_IOI_SEAM.md requires a vendored copy at a pinned commit with ENGINE_PROVENANCE.md. Open item.',
  },
  {
    id: 'sourcing-pipeline',
    name: 'Target sourcing and screening',
    group: 'sourcing', owner: 'workspace', cost: 'free', interleaves: false,
    why: 'PRE-IoI, therefore market-shaped (Paul, 2026-08-15: "there will be no sourcing in the app the app is internal now IoI to integration"). Finding candidates is one-to-many and speculative with no counterparty — the definition the seam splits on. The app begins at the IoI, when a named target becomes a deal.',
    workflow: [
      'npx tsx $REPO/scripts/studio/screen.mts init   — buy-box, queries x geographies',
      'npx tsx $REPO/scripts/studio/screen.mts pull   — Places, cost printed before it spends',
      'npx tsx $REPO/scripts/studio/screen.mts rank   — free and offline',
      'The board is markets/<m>/screen/candidates.csv, managed in Google Sheets.',
      'A promoted candidate enters the app as a deal — that is the IoI.',
    ],
    aka: ['sourcing', 'sourcing engine', 'screen', 'candidates', 'targets', 'buy box', 'enrichment', 'seven factor', 'scoring', 'places'],
    gap: 'THE APP\'S ENGINE IS RETIRED, NOT PORTED, and the difference matters because the app version had TWO CITATION-LAW DEFECTS: its deep-analysis prompt estimated revenue by asking a model to guess from Google review counts ("<10 reviews typically = <$500K rev"), and NOTHING in it decided whether a business was independent, so a franchise location could rank as a target — the expensive error, because it sends a client into diligence on a business a sponsor already owns. house/screen.ts is the CORRECTED reimplementation: affiliation is a register lookup, revenue is a band with its arithmetic attached, and neither guess can happen. The app-side engine, its scorer, its prompt, both Sourcing screens and Yulia\'s two sourcing tools were DELETED on 2026-08-16 (Phase A of FRONT_END_REBUILD.md). The standing "do not delete anything yet" rule was lifted for this sweep because house/screen.ts is a CORRECTED reimplementation rather than a port — keeping the original meant maintaining two screens, one of which can invent a revenue figure. The sourcing_candidates rows survive: they are a Places content cache with a retention rule, so read PLACES_CONTENT in house/screen.ts before dropping any.',
  },

  /* ── deal ─────────────────────────────────────────────────────────── */
  {
    id: 'definitive',
    name: 'DEFINITIVE — gates, model slots, DealState',
    group: 'deal', owner: 'app', cost: 'free', interleaves: true,
    why: 'App-only and not portable: 169 gate/slot references, 132 MODEL.* definitions, 385 conformance cases. A stateful substrate, not a document.',
    workflow: [
      'App → the deal. Gates advance as the deal advances.',
      'Calls no model — verified, no API key reference in v19ModelRuntime.ts.',
      'There is no local equivalent and building one is not a project, it is a year.',
    ],
    aka: ['definitive', 'gates', 'model slots', 'dealstate', 'substrate', 'conformance'],
  },
  {
    id: 'valuation',
    name: 'Valuation and deal modelling',
    group: 'deal', owner: 'app', cost: 'free', interleaves: true,
    why: 'DEAL-shaped, and post-IoI. Paul: "in-app scenario modeling is going to be much more advantageous than a Google Sheet — plus that is where the data room and financial docs will be housed." A what-if wants a slider, and it wants to sit beside the documents it is priced from.',
    workflow: [
      'App → the canvas, beside the data room and the financial documents.',
      'FROM THE IoI ONWARD. Before that it is screening math — see pre-ioi-math.',
      'Both surfaces run house/deal.ts and npm run test:deal fails if they disagree,',
      'so a pre-IoI figure and its post-promotion re-run are comparable by construction.',
    ],
    aka: ['valuation', 'model', 'modelling', 'irr', 'dscr', 'lbo', 'dcf', 'sensitivity', 'what if', 'scenario'],
  },
  {
    id: 'data-room',
    name: 'The data room and financial documents',
    group: 'deal', owner: 'app', cost: 'free', interleaves: true,
    why: 'DEAL-shaped and counterparty-confidential by definition. It is also the reason the modelling is app-side: the figures are priced from these documents, and separating the two is what made the old split painful.',
    workflow: [
      'App → the deal → data room. Files, share links, and the audit trail.',
      'Third parties receive documents by token link and never get an account.',
      'Nothing here crosses back into the studio repo after promotion.',
    ],
    aka: ['data room', 'dataroom', 'documents', 'financials', 'diligence files', 'uploads'],
  },
  {
    id: 'ioi-promotion',
    name: 'The IoI promotion — a candidate becomes a deal',
    group: 'deal', owner: 'both', cost: 'free', interleaves: false,
    why: 'THE SEAM ITSELF. A defined event with a packet and a receipt on both sides — not a migration, and not a gradual drift of files across the boundary.',
    workflow: [
      'MOVES: the deal profile (deal.json, every figure carrying a source; add-backs',
      '  only when verified with evidence), documents so far, the screen record, and',
      '  the pre-IoI model runs (engine-stamped, so the app can verify continuity).',
      'LINKS but does not move: the market master. The app records master@commit,',
      '  so the deal knows what market context priced it. The master stays put.',
      'NEVER crosses back: nothing counterparty-confidential enters the studio repo.',
      'STUDIO/deals/<d>/ then goes read-only — stop writing, keep reading, drop nothing.',
    ],
    aka: ['ioi', 'promotion', 'promote', 'letter of intent', 'handoff', 'becomes a deal'],
    gap: 'NOT BUILT. There is no deal.json packet, no master@commit pointer on a deal, no receipt either side, and no read-only flip of the staging folder. The largest unbuilt piece of the seam.',
  },
  {
    id: 'deal-state',
    name: 'Deal pipeline — stage, owner, next action',
    group: 'deal', owner: 'app', cost: 'free', interleaves: true,
    why: '"What stage is this at" is a question, and a question needs rows and SQL. A folder cannot answer it.',
    workflow: ['App → Deals. Forms and SQL; nothing metered.'],
    aka: ['pipeline', 'deal stage', 'next action', 'deal board', 'tasks'],
  },
  {
    id: 'deal-documents',
    name: 'Deal memo · diligence plan · term framework',
    group: 'deal', owner: 'app', cost: 'drip', interleaves: true,
    why: 'Moved to the app 2026-08-14 (Paul). These sit inside the deal sitting — written from the model, the gates and the diligence state, all of which are app rows. Exporting to write them elsewhere was the back-and-forth.',
    workflow: [
      'App → the deal → documents, alongside the model they are written from.',
      'PLAYBOOK.md §5b–5d remains the SPEC for what each one contains.',
      'Never restate the model\'s figures by hand — reference the model.',
      'Confidential to the engagement: never a source for anything public.',
    ],
    gap: 'NOT IMPLEMENTED ANYWHERE IN THE APP YET. The nearest deliverables are buy_deal_screening_memo (pre-LOI screening, not the §5b memo) and an LOI draft (which §5d deliberately is NOT — drafting is counsel\'s). Write all three HERE to PLAYBOOK §5 until the app has them.',
    aka: ['memo', 'ic packet', 'diligence plan', 'term sheet', 'terms', 'loi framework'],
  },

  /* ── crm and comms ────────────────────────────────────────────────── */
  {
    id: 'crm',
    name: 'Client register and pipeline',
    group: 'crm', owner: 'app', cost: 'free', interleaves: true,
    why: 'A CRM is forms and SQL and calls no model at all. "Who owes a touch this week" is a query.',
    workflow: [
      'App → Clients. crm_accounts / crm_contacts / crm_activity.',
      'Research the register in Cowork, push it in:',
      '  npx tsx $REPO/scripts/studio/push-crm.mts',
    ],
    aka: ['crm', 'clients', 'accounts', 'contacts', 'prospects', 'register'],
  },
  {
    id: 'outreach',
    name: 'Outreach queue and sends',
    group: 'crm', owner: 'app', cost: 'free', interleaves: true,
    why: 'The queue is rows. THE LINE is structural here: one touch, one press, one human — there is no batch-send endpoint and there must not be.',
    workflow: [
      'App → Clients → Outreach.',
      'A human presses send on every touch. The worker may assemble; it must never release.',
    ],
    aka: ['outreach', 'touches', 'campaign', 'sequence', 'email campaign'],
  },
  {
    id: 'counterparty-comms',
    name: 'Lawyers, CPAs, lenders, sellers\' advisors',
    group: 'crm', owner: 'app', cost: 'free', interleaves: true,
    why: 'Email out plus token share links — free, and it keeps third parties corresponded with rather than onboarded. Never build this on direct_threads.',
    workflow: [
      'App → email + document share links. sendEmail / documentShareService.',
      'service_providers + service_referrals is the typed register for these people.',
      'Nobody outside the team ever gets an account.',
    ],
    aka: ['counterparty', 'lawyer', 'attorney', 'cpa', 'lender', 'specialist', 'share link'],
  },

  /* ── collateral ───────────────────────────────────────────────────── */
  {
    id: 'collateral',
    name: 'LinkedIn carousels, one-pagers, reports',
    group: 'collateral', owner: 'workspace', cost: 'free', interleaves: false,
    why: 'MARKET-shaped: one-to-many and speculative, with no counterparty. THE_IOI_SEAM.md returns it to the studio — it was briefly app-owned on 2026-08-14 under a different axis (input vs output), and the audience axis is the one that holds.',
    workflow: [
      'Read FORMATS.md (containers) and DESIGN.md (the look) first, every time.',
      'npx tsx $REPO/scripts/studio/build-deck.mts <spec.deck.mts>',
      'npx tsx $REPO/scripts/studio/build-onepager.mts <spec.post.mts>',
      'npx tsx $REPO/scripts/studio/build-report.mts <report.md>',
      'Rendered by the engine on the Mac. Client-direct work files to decks/, never collateral/.',
    ],
    aka: ['carousel', 'deck', 'one-pager', 'onepager', 'report pdf', 'linkedin', 'post'],
  },
  {
    id: 'website',
    name: 'The public site and published research',
    group: 'collateral', owner: 'app', cost: 'free', interleaves: false,
    why: 'Front end and marketing — the half that was never in question. Railway deploys on push to main.',
    workflow: [
      'Engine repo → client/src/practice/.',
      'A report publishes by dropping the .md in scripts/studio/reports/ and registering it.',
    ],
    aka: ['website', 'site', 'marketing', 'landing', 'published report', 'smbx.ai'],
  },
  {
    id: 'linkedin-analytics',
    name: 'LinkedIn analytics import',
    group: 'collateral', owner: 'app', cost: 'free', interleaves: false,
    why: 'THE STANDING EXCEPTION — the XLSX parser has no local equivalent. It calls no model, so importing works whatever the lanes say.',
    workflow: [
      'App → Studio → Performance → import the .xlsx.',
      'The mechanical parse is the part worth porting one day. The read is a session\'s job anyway.',
    ],
    aka: ['analytics', 'linkedin export', 'xlsx', 'performance'],
  },

  /* ── ops ──────────────────────────────────────────────────────────── */
  {
    id: 'weekly-sweep',
    name: 'The Saturday research sweep',
    group: 'ops', owner: 'workspace', cost: 'expensive', interleaves: false,
    why: 'Research on a schedule, so it belongs where research belongs. A quarterly rotation, one market a week.',
    workflow: [
      'node weekly.mts due       # whose turn it is; exits 0 when nobody is',
      'WEEKLY.md is the standing prompt. It WRITES but never PUBLISHES.',
      'Everything lands in a pull request — that is the review gate.',
    ],
    aka: ['weekly', 'saturday', 'sweep', 'digest', 'scheduled research'],
  },
  {
    id: 'citation-audit',
    name: 'The citation audit',
    group: 'ops', owner: 'both', cost: 'free', interleaves: false,
    why: 'house/audit.ts is pure and shared, so both sides compute an identical answer. Run it wherever the document is.',
    workflow: [
      'npx tsx $REPO/scripts/studio/audit.mts <doc.md> --against <master.md>',
      'Exit 0 clean · 1 not clean · 2 NOT AUDITED (no machine-readable source).',
      'The honest limit: it checks NUMBERS, not prose. A fabricated claim with no figure passes.',
    ],
    aka: ['audit', 'citations', 'check figures', 'verify'],
  },
];

/* ── lookup ───────────────────────────────────────────────────────────── */

export const byId = (id: string): Process | undefined =>
  PROCESSES.find(p => p.id === id);

/**
 * Answer a free-text question — "where does the deal memo go", "irr", "crm".
 * Scored rather than first-match, because "deal model" should reach valuation
 * and not deal-documents just because "deal" appears in both.
 *
 * Returns every process that matched, best first. An EMPTY result is a real
 * answer and the CLI says so plainly: an unrecognised process is one nobody
 * has decided about, and guessing a home for it is how the split blurs again.
 */
export function resolve(query: string): Process[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const words = q.split(/[^a-z0-9]+/).filter(w => w.length > 2);

  const scored = PROCESSES.map(p => {
    let score = 0;
    const hay = `${p.id} ${p.name} ${p.aka.join(' ')}`.toLowerCase();

    if (p.id === q) score += 100;
    for (const a of p.aka) {
      if (a === q) score += 50;
      else if (q.includes(a)) score += 20;
      else if (a.includes(q)) score += 10;
    }
    for (const w of words) if (hay.includes(w)) score += 3;
    return { p, score };
  }).filter(s => s.score > 0);

  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.p);
}

/**
 * The rule, in one line, for a header or a prompt.
 *
 * Narrowed 2026-08-14 on Paul's instruction. The first cut left the derived
 * documents and collateral in Cowork; he moved them to the app, which makes
 * the division cleaner than the compromise was: Cowork is the INPUT layer —
 * gathering, aggregating, wrangling — and everything the practice PRODUCES or
 * TRACKS is the app. "Documents are files, pipelines are rows" was the wrong
 * axis; the right one is raw input versus practice output.
 */
export const ONE_LINE =
  'The seam is the IoI. Market-shaped work is the studio; deal-shaped work is the app. CRM is app-side from the first touch.';

/**
 * The tiebreak for a process not in the table. Deliberately not a default —
 * a guess is what put the same work in two systems the first time.
 */
export const TIEBREAK = [
  'Is it MARKET-shaped — one-to-many, speculative, no counterparty? → the studio.',
  'Is it DEAL-shaped — one-to-one and counterparty-confidential? → the app.',
  'Is it before the IoI or after it? Before is the studio, after is the app.',
  'CRM is the exception and runs app-side from the first touch.',
  'Still unclear? Ask Paul and add a row here. Do not decide it twice.',
];

/* ── the document ─────────────────────────────────────────────────────── */

const GROUPS = [
  ['sourcing',   'Sourcing — finding markets and targets'],
  ['deal',       'The deal — from a live target to close'],
  ['crm',        'CRM and communication — clients, and everyone else'],
  ['collateral', 'Collateral — what goes out'],
  ['ops',        'Ops — the standing jobs'],
] as const;

const WHERE_LABEL: Record<Owner, string> = {
  app: '**The app**',
  workspace: '**Here** — this workspace',
  both: '**Either** — identical either side',
};

/**
 * Render the table as the document a Claude Desktop session reads.
 *
 * GENERATED, because Cowork is Claude Desktop rather than a terminal: a
 * session there reads files and cannot be relied on to run a CLI, so the
 * document IS the interface and the CLI is the convenience. Generating it
 * from the same array the CLI answers from is what keeps them one source
 * rather than two that agree today.
 */
export function renderMarkdown(): string {
  const L: string[] = [];
  L.push('# Which system does this — the settled answer');
  L.push('');
  L.push('> **GENERATED from `house/where.ts` by `scripts/studio/where.mts render`.**');
  L.push('> Do not hand-edit: a test fails when this file and the table disagree.');
  L.push('> To change a routing decision, change the table and re-render.');
  L.push('');
  L.push(`**${ONE_LINE}**`);
  L.push('');
  L.push('> **Not to be confused with `WHAT_LIVES_WHERE.md`**, which answers a');
  L.push('> different question. That file maps the two REPOSITORIES on the Mac —');
  L.push('> engine vs workspace, and which clones are debris. This file decides');
  L.push('> which SYSTEM does a piece of work — this workspace or the app.');
  L.push('> Repo question → that file. Process question → this one.');
  L.push('');
  L.push('> **Switched on 2026-08-14.** Corp-dev documents, deal documents and');
  L.push('> collateral moved to the app and the app now serves them: `STUDIO_IN_APP`');
  L.push('> is true, and `API_LANES` gained a separate `research` lane so the cheap');
  L.push('> composition paths could be enabled WITHOUT arming the ~$18-a-press');
  L.push('> research agent. One lane could not say that, which is why the move was');
  L.push('> blocked for a day. The local builders still work and stay supported.');
  L.push('');
  L.push('Cowork is the INPUT layer: gathering sources, aggregating them into a');
  L.push('master, deep search, and wrangling messy data into something structured.');
  L.push('Everything the practice PRODUCES or TRACKS — the deal, the CRM, the');
  L.push('documents, the collateral — is the app, in one place, because that is');
  L.push('the work that interleaves and splitting it is what made moving between');
  L.push('systems painful.');
  L.push('');
  L.push('## Why, in four measured findings');
  L.push('');
  L.push('1. **DEFINITIVE cannot leave the app** — 169 gate/slot references, 132');
  L.push('   `MODEL.*` definitions, 385 conformance cases, and no local equivalent.');
  L.push('   It is a stateful substrate; files are the wrong shape for it.');
  L.push('2. **Interactive valuation is a UI problem.** A what-if wants a slider, not');
  L.push('   a regenerated file. The app has eleven canvas models and they call no');
  L.push('   model at all.');
  L.push('3. **Only research ever cost real money** — ~$18 a press at `deep`.');
  L.push('   Modelling, CRM, deal state, comms and exports all measure at zero.');
  L.push('4. **Sourcing was never expensive either** — Haiku per candidate, and');
  L.push('   Places on a separate key, free under 5k lookups a month.');
  L.push('');
  L.push('## The table');
  L.push('');
  L.push('| Process | Where | Cost | Ready? |');
  L.push('|---|---|---|---|');
  for (const p of PROCESSES) {
    const cost = p.cost === 'expensive' ? '**can spend dollars**' : p.cost === 'drip' ? 'a drip' : 'free';
    L.push(`| ${p.name} | ${WHERE_LABEL[p.owner]} | ${cost} | ${p.gap ? '⚠️ partly — see below' : 'yes'} |`);
  }
  L.push('');

  for (const [g, heading] of GROUPS) {
    const rows = PROCESSES.filter(p => p.group === g);
    if (!rows.length) continue;
    L.push(`## ${heading}`);
    L.push('');
    for (const p of rows) {
      L.push(`### ${p.name}`);
      L.push('');
      L.push(`**${WHERE_LABEL[p.owner].replace(/\*\*/g, '')}** · ${
        p.cost === 'expensive' ? 'one press can spend dollars'
        : p.cost === 'drip' ? 'a drip — cents' : 'free, calls no model'
      }`);
      L.push('');
      L.push(p.why);
      L.push('');
      if (p.gap) {
        L.push(`> ⚠️ **Not fully there yet.** ${p.gap}`);
        L.push('');
      }
      for (const step of p.workflow) L.push(`- ${step}`);
      L.push('');
    }
  }

  L.push('## Something not on this list');
  L.push('');
  L.push('An unlisted process is one nobody has decided about. **Do not pick a side');
  L.push('by feel** — that is how the same work ended up in two systems the first');
  L.push('time. The tiebreak:');
  L.push('');
  for (const t of TIEBREAK) L.push(`- ${t}`);
  L.push('');
  L.push('`where.json` beside this file is the same data, machine-readable.');
  L.push('');
  return L.join('\n');
}
