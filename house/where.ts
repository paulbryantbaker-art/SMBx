/**
 * house/where.ts — WHICH SYSTEM OWNS THIS PROCESS, AS DATA
 *
 * (2026-08-14, Paul: "which system to use, bc going back and forth is hard. I
 * want to build one place to house all of my processes for sourcing all of
 * DEFINITIVE." → "lets give this finding to cowork so it understands
 * completely programatically" → "lets clearly delineate responsibilities and
 * workflows for all processes".)
 *
 * THE SETTLED ANSWER (narrowed by Paul 2026-08-14, and this is the current one):
 *
 *   THE APP IS THE ONE PLACE.
 *   COWORK IS THE INPUT LAYER — research, aggregation, deep search, wrangling.
 *
 * The first cut of this table left the derived documents and the collateral in
 * Cowork, on a "documents are files, pipelines are rows" reading. Paul moved
 * all three across — corp-dev documents, deal memo / diligence plan / term
 * framework, and collateral — and the result is cleaner than the compromise
 * was, because it swaps the axis for one that actually holds:
 *
 *   RAW INPUT being gathered → Cowork.   Practice OUTPUT or STATE → the app.
 *
 * A deal memo is not filed away to be read later, it is written from the model
 * and the gates while the deal is live; a market map is written for a client;
 * collateral is the thing the practice ships. All of that is output, and output
 * belongs where the state it draws on already is. What is left in Cowork is
 * genuinely upstream of the practice: sources nobody has structured yet.
 *
 * Four findings still stand behind the app half, all verified against this tree:
 *
 *  1. DEFINITIVE cannot leave the app. 169 gate/slot references and 132
 *     MODEL.* definitions live in `definitiveDealMechanicsCatalog.ts` and
 *     `v19ModelRuntime.ts`, with 385 conformance cases behind them. It is a
 *     STATEFUL substrate — route map, DealState, gates that advance — and
 *     files are the wrong shape for it.
 *  2. Interactive valuation is a UI problem. "What if EBITDA is $1.5M" wants a
 *     slider, not a CLI regenerating a markdown file. The app has eleven of
 *     those and they call no model. `dealexplorer.html` is the proof: the need
 *     for a UI was real enough to hand-build one.
 *  3. Only ONE path ever cost real money. Research at `deep` is ~$18 a click
 *     (40 searches at $10/1k, 25 fetches re-entering context across up to 12
 *     rounds). Modelling, CRM, deal state, comms, exports and DEFINITIVE all
 *     measure at zero. Yulia is a drip: ~$14 a session uncached, ~$5 cached.
 *  4. Sourcing was never expensive either — Haiku per candidate, and Places on
 *     a separate key that is free under 5k Place Details a month.
 *
 * AND THE LINE THAT MINIMISES SWITCHING. The old split hurt because it cut
 * through work that INTERLEAVES: sourcing → model → memo → deal state → client
 * call happens in one sitting. Research does not interleave — it is a
 * quarterly batch per market, a different season rather than back-and-forth.
 * So `interleaves: true` is a sufficient reason to be in the app, though not a
 * necessary one: collateral does not interleave and is still the app's, because
 * it is output. Cost is a secondary consideration that happens to agree.
 *
 * ONE BLOCKER THIS CREATES, and it is in the app rather than here. `API_LANES`
 * has a single `studio` lane covering BOTH the expensive research paths
 * (`researchAgent.ts`, `researchLanes.ts` synthesis) and the cheap composition
 * paths (`corpDevDocs.ts`, `collateralComposer.ts`, `linkedinAnalytics.ts`).
 * The split above needs the second group ON and the first OFF, which no single
 * value of that variable can express — turning on collateral today also arms
 * the research agent. The lane has to be split (`research` vs `studio`) before
 * this table is enforceable in the app, and `STUDIO_IN_APP` has to flip true.
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
    group: 'sourcing', owner: 'app', cost: 'drip', interleaves: true,
    why: 'Moved to the app 2026-08-14 (Paul). These are practice OUTPUT, and they interleave with the deal and the client they are written for — a thesis is held for one buyer profile.',
    workflow: [
      'App → Studio → the market. corpDevDocs.ts generates all three.',
      'LIVE since 2026-08-14: STUDIO_IN_APP is true and the studio lane is on.',
      'PLAYBOOK.md §1–4 remains the SPEC for what each contains, wherever it renders.',
      'The master these derive from still lives on disk and is read, never copied.',
    ],
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
    id: 'sourcing-pipeline',
    name: 'The 5-stage sourcing engine',
    group: 'sourcing', owner: 'app', cost: 'drip', interleaves: true,
    why: 'Haiku per candidate on a separate Places key that is free under 5k/month. It feeds the deal pipeline directly, so it interleaves.',
    workflow: [
      'App → Sourcing. Needs the `sourcing` lane in API_LANES.',
      'Was switched off for having a local equivalent, not for cost.',
    ],
    aka: ['sourcing engine', 'pipeline', 'enrichment', 'seven factor', 'scoring'],
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
    why: 'Interactive modelling is a UI problem — a what-if wants a slider, not a regenerated file. Eleven canvas models, none of which call a model.',
    workflow: [
      'App → the canvas. Free, instant, and the assumption you change is the point.',
      'For a one-off away from the app, or to put the arithmetic in a document:',
      '  npx tsx $REPO/scripts/studio/deal.mts run deals/<d>/analysis/<t>.deal.mts',
      'Both surfaces run house/deal.ts, and npm run test:deal fails if they ever disagree.',
    ],
    aka: ['valuation', 'model', 'modelling', 'irr', 'dscr', 'lbo', 'dcf', 'sensitivity', 'what if'],
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
    group: 'collateral', owner: 'app', cost: 'drip', interleaves: false,
    why: 'Moved to the app 2026-08-14 (Paul). It is practice output, and the app already has the whole surface — CollateralBuilder, the composers, the media library, the review sheet. Nothing needed porting; Studio was hidden, not removed.',
    workflow: [
      'App → Studio → Collateral. LIVE since 2026-08-14.',
      'FORMATS.md (containers) and DESIGN.md (the look) remain the spec either side.',
      'The local builders still work and stay supported — same house/ design tokens,',
      'so a render away from the app is identical, not an approximation:',
      '  npx tsx $REPO/scripts/studio/build-deck.mts <spec.deck.mts>',
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
  'The app is the one place. Cowork is the input layer — research, aggregation, deep search, data wrangling.';

/**
 * The tiebreak for a process not in the table. Deliberately not a default —
 * a guess is what put the same work in two systems the first time.
 */
export const TIEBREAK = [
  'Is it RAW INPUT being gathered, aggregated or wrangled? → the workspace.',
  'Is it something the practice PRODUCES or TRACKS? → the app.',
  'Can one press spend dollars? → the workspace, and say so out loud.',
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
  L.push('| Process | Where | Cost |');
  L.push('|---|---|---|');
  for (const p of PROCESSES) {
    const cost = p.cost === 'expensive' ? '**can spend dollars**' : p.cost === 'drip' ? 'a drip' : 'free';
    L.push(`| ${p.name} | ${WHERE_LABEL[p.owner]} | ${cost} |`);
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
