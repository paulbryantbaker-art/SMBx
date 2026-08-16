/**
 * INTEGRATION · LIST — the PMI surface on the kit (Phase 3 of
 * `APP_REDESIGN_TRAINLINE.md`; primitives in `../kit`, worked reference in
 * `./DealsList.tsx`).
 *
 * The plan's §3 table asks for: criteria bar `deal ⇄ phase`, chips `PMI0–PMI3
 * with open-item counts`, compare strip `the four phases`, list/detail with the
 * `workstream right`. This is that, and it lands additively — the original
 * three-section screen stays reachable behind a toggle, exactly as Deals kept
 * its board.
 *
 * ── THE THING YOU MUST KNOW BEFORE YOU READ THE PHASE CODE ──────────────
 * **A WORKSTREAM DOES NOT CARRY A PHASE.** `pmi_workstreams` (migration 091)
 * has title · detail · owner · first_move · evidence_link · status · pct ·
 * sort_order · due_at, and no phase column; `getIntegrationPlan` returns none;
 * `generateIntegrationPlan` writes none. The four phases are real — PMI0 Day
 * Zero, PMI1 Stabilization, PMI2 Assessment, PMI3 Optimization live in
 * `shared/gateRegistry.ts` and are the app's single source of truth for them —
 * but nothing files a workstream against one.
 *
 * So `phaseOf()` reads an EXPLICIT field off the row and returns null when
 * there isn't one. It does not guess from the title. A keyword map —
 * "Day-0 communications" → PMI0 — would look correct against the five seeded
 * titles in `pmiValueCaptureService.seedPlan` and then silently mis-file every
 * workstream the Claude enrich pass writes, which is a fabricated attribution
 * wearing the costume of a real one. On today's data every phase cell therefore
 * reports "0 filed" and every workstream lands in "Phase not recorded", and the
 * ranking note says so in prose. That is the honest render of a plan that does
 * not record phases.
 *
 * WHAT IT ACTUALLY TAKES TO TURN PHASES ON (corrected 2026-08-15 — this comment
 * previously claimed "the day the generator starts writing one, this screen
 * groups on it with no further change", which was FALSE and would have sent the
 * next reader looking for a bug in this file). `getIntegrationPlan`
 * (`server/services/pmiValueCaptureService.ts`, the `wsRows.map`) rebuilds each
 * row through an EXPLICIT whitelist — id · title · detail · owner · first_move ·
 * evidence_link · status · pct · kind · label — so a new `phase` column would be
 * stripped server-side and never reach `phaseOf`. Three changes, in order:
 * (1) a migration adding the column, (2) the generator writing it, (3) the field
 * added to that server whitelist. Only then does this file need no edit.
 *
 * ── WHERE A ZERO IS EARNED AND WHERE IT IS A LIE ────────────────────────
 * ONE RULE, obeyed by the chips AND the strip (they disagreed until
 * 2026-08-15: the chips printed "0" for an empty set while the strip printed
 * the not-known glyph for the same set, side by side, two opposite answers).
 * **A count over a set we HOLD is a known zero, whatever its size; the
 * not-known mark is reserved for a set we hold and cannot READ.** We always
 * hold every workstream on the plan — nothing here is paginated or partially
 * fetched — so an empty phase is a measured empty, not an unknown one:
 *   · a phase whose workstreams are ALL COMPLETE      → "0 open"  (earned)
 *   · a phase with NOTHING FILED under it             → "0 filed" (earned)
 *   · a phase whose statuses CANNOT BE READ           → not-known glyph
 * "0 filed" rather than "0 open" is what keeps the second case from reading as
 * the first: the noun says what the zero counts, so an empty phase can never be
 * mistaken for a finished one. Only the third case is genuinely unknown, and it
 * carries `unknownWhy` so hovering says which rows could not be read.
 * Same law on progress: `wsPct()` in the original screen coerces a non-finite
 * pct to 0 so the bar always has a width — fine for a BAR, which is a shape,
 * fatal for a PRINTED FIGURE, because "0%" and "nobody recorded progress" are
 * different facts. `pctOrNull()` keeps them apart.
 *
 * ── A FIGURE'S POPULATION MUST MATCH ITS SENTENCE ───────────────────────
 * The trap this screen fell into, and the reason several comments below name
 * their population out loud: a statistic computed over the WINDOWED / CHIPPED /
 * SEARCHED subset and then narrated as a fact about the whole. The group header
 * said "4/4 complete" when it meant "4/4 of the four rows you can currently
 * see" — click the Complete chip and every group claimed to be finished. Every
 * aggregate here now computes over a FULL set and says which set that is; where
 * a visible subset is worth showing it is labelled "showing N of M", never
 * substituted for the whole.
 *
 * ── NO NEW DATA PATH ────────────────────────────────────────────────────
 * Everything arrives as props from `Integration.tsx`, which already holds
 * `useIntegrationPlan(dealId)`. This file fetches nothing. The one write is the
 * same `updateWorkstream` PATCH the original screen uses — self-reported
 * EXECUTION, never a recommendation.
 *
 * ── THE LINE ────────────────────────────────────────────────────────────
 * Nothing here contacts, notifies or sends to anyone. "Next move" is prose the
 * plan already wrote; "Reference" is a descriptive pointer ("Data room /
 * financial model"), NOT a URL and deliberately not rendered as one. Value-lever
 * targets stay labelled illustrative, and there is still no captured figure —
 * that needs a finance/GL connector the practice does not have, so it is absent
 * rather than zero.
 */
import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { T } from "../atlasTokens";
import {
  CriteriaBar, ChipRow, CompareStrip, ListDetail, GroupHeader, ResultRow,
  Endorsement, Expander, RankingNote, SummaryCard, DetailCard, InfoBanner,
  Timeline,
  type Chip, type CompareItem, type CriteriaCell,
} from "../kit";
import { fmtCents } from "../primitives";
import { getJourneyGates } from "@shared/gateRegistry";
import type {
  IntegrationPlan,
  IntegrationWorkstream,
  IntegrationMilestone,
} from "../../../../hooks/useIntegrationPlan";

/** How many workstream rows before the window closes. The Expander widens it. */
const WINDOW = 12;

/** How many mid-trail plan events show before the "earlier" toggle. */
const EVENT_CAP = 6;

/* ── the phase axis ───────────────────────────────────────────────────────
   Straight off the gate register, sorted by its own index so "gate order" in
   the ranking note is a fact about the array and not a hope. PMI0 Day Zero ·
   PMI1 Stabilization · PMI2 Assessment · PMI3 Optimization. */
const PMI_PHASES = [...getJourneyGates("pmi")].sort((a, b) => a.index - b.index);

/** The bucket for workstreams that record no phase. Not a phase — a residual. */
const NO_PHASE = "no-phase";

/* ── status semantics (mirror server STATUS_META) ─────────────────────── */

const STATUS_OPTIONS: { id: string; label: string }[] = [
  { id: "not_started", label: "Not started" },
  { id: "in_progress", label: "In progress" },
  { id: "on_track", label: "On track" },
  { id: "at_risk", label: "At risk" },
  { id: "complete", label: "Complete" },
];
const STATUS_LABEL: Record<string, string> = Object.fromEntries(
  STATUS_OPTIONS.map(o => [o.id, o.label]),
);

/** Progress steps the user can self-report. 100% maps the server to 'complete'. */
const PCT_STEPS = [0, 25, 50, 75, 100];

/* ── reading a workstream, honestly ───────────────────────────────────── */

function wsTitle(w: IntegrationWorkstream): string {
  return (w.title || w.name || "Workstream").toString();
}

/**
 * The status id, normalised, or null when the row does not carry one. A status
 * string we do not recognise is NOT null — it is data the server sent and it
 * gets printed verbatim — but it is not readable for counting, which is what
 * `isKnownStatus` decides.
 */
function statusId(w: IntegrationWorkstream): string | null {
  const s = (w.status ?? "").toString().trim().toLowerCase();
  return s ? s : null;
}
function isKnownStatus(s: string | null): s is string {
  return s != null && s in STATUS_LABEL;
}

/** What to print in the Status column: the label, else the raw string, else null. */
function statusText(w: IntegrationWorkstream): string | null {
  const s = statusId(w);
  if (s == null) return null;
  return STATUS_LABEL[s] ?? s;
}

/**
 * Progress, or null. Migration 091 declares `pct INTEGER NOT NULL DEFAULT 0`, so
 * this returns null only when a row arrives without one — which is exactly the
 * case where printing "0%" would invent a fact. A real 0 still prints "0%".
 *
 * THE ABSENCE IS TESTED BEFORE THE COERCION, and it has to be. `pct` is typed
 * `number | null` (useIntegrationPlan.ts) and the first cut read
 * `Number(w.pct)` — but **`Number(null) === 0` and 0 is finite**, so every row
 * with no recorded progress returned a confident 0 and the screen printed "0%"
 * in the row and as the SummaryCard headline, doing the exact thing this
 * function's own doc comment promised it would not. `Number("")` is 0 too, so
 * an empty string is rejected here as well rather than trusted to `isFinite`.
 */
function pctOrNull(w: IntegrationWorkstream): number | null {
  const raw = w.pct as unknown;
  if (raw == null) return null;
  if (typeof raw === "string" && raw.trim() === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * THE PHASE ATTRIBUTION. Explicit field or nothing — see the file header for
 * why a title-keyword map is not an option. `IntegrationWorkstream` carries an
 * index signature, so once a `phase` (or `gate`) field actually SURVIVES the
 * server's `getIntegrationPlan` whitelist it is picked up here with no change
 * to this file — but the whitelist is the gate, and it strips unknown columns
 * today. See "WHAT IT ACTUALLY TAKES TO TURN PHASES ON" in the file header.
 */
function phaseOf(w: IntegrationWorkstream): string | null {
  const raw = (w.phase ?? w.pmi_phase ?? w.gate ?? w.gate_id ?? "")
    .toString().trim().toUpperCase();
  if (!raw) return null;
  return PMI_PHASES.some(p => p.id === raw) ? raw : null;
}

/* ── tallies ──────────────────────────────────────────────────────────── */

interface Tally {
  total: number;
  /** Not complete. null when any status in the set could not be read. */
  open: number | null;
  atRisk: number | null;
  complete: number | null;
  unreadable: number;
}

/**
 * One pass over a set of workstreams. THE NULLS ARE THE POINT: if even one row
 * in the set carries a status we cannot read, the open/at-risk/complete counts
 * are not statable — a count that silently omits a row it could not classify is
 * a wrong number that looks right. In practice `status` is NOT NULL in the
 * table, so this branch is a guard, not a common path.
 */
function tally(list: IntegrationWorkstream[]): Tally {
  let unreadable = 0, open = 0, atRisk = 0, complete = 0;
  for (const w of list) {
    const s = statusId(w);
    if (!isKnownStatus(s)) { unreadable++; continue; }
    if (s === "complete") complete++; else open++;
    if (s === "at_risk") atRisk++;
  }
  const readable = unreadable === 0;
  return {
    total: list.length,
    open: readable ? open : null,
    atRisk: readable ? atRisk : null,
    complete: readable ? complete : null,
    unreadable,
  };
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/* ── plan-event presentation ──────────────────────────────────────────────
   Restated locally rather than imported from Integration.tsx: that file's
   helpers are not exported, and its exports are a moving surface while Phase 3
   runs. Fold the two together when Phase 4 retires the old view. */

const MILESTONE_LABEL: Record<string, string> = {
  plan_created: "Plan created",
  workstream_completed: "Workstream complete",
  progress_snapshot: "Progress snapshot",
  quarterly_review: "Quarterly review",
};

function eventTitle(m: IntegrationMilestone): string {
  const type = (m as any).milestone_type as string | undefined;
  return (m.title || m.name || (type ? MILESTONE_LABEL[type] : undefined) || "Milestone").toString();
}

/** The server writes "Workstream complete: <title>", which repeats the header. */
function eventDesc(m: IntegrationMilestone): string | undefined {
  const raw = (m as any).description as string | undefined;
  if (!raw) return undefined;
  const title = eventTitle(m);
  if (raw.startsWith(`${title}: `)) return raw.slice(title.length + 2).trim() || undefined;
  if (raw.trim() === title) return undefined;
  return raw;
}

function eventWhen(m: IntegrationMilestone): string {
  return fmtDate((m as any).created_at || m.due_at);
}

/* ── value levers (plan.valueLevers[]) ────────────────────────────────── */

interface ValueLever {
  name?: string;
  category?: string;
  target_value_cents?: number | null;
  confidence?: string;
}

const LEVER_CATEGORY_LABEL: Record<string, string> = {
  cost_synergy: "Cost synergy",
  revenue_synergy: "Revenue synergy",
  operational: "Operational",
  integration_risk: "Integration risk",
  working_capital: "Working capital",
  one_time_cost: "One-time cost",
};
const CONFIDENCE_LABEL: Record<string, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

/* ════════════════════════════════════════════════════════════════════════ */

type StatusFilter = "all" | "open" | "at_risk" | "complete";

export function IntegrationList({
  dealName, plan, workstreams, milestones, onUpdate,
}: {
  dealName?: string;
  /** Null is handled upstream by Integration.tsx's honest-empty state. */
  plan: IntegrationPlan | null;
  workstreams: IntegrationWorkstream[];
  milestones: IntegrationMilestone[];
  /** The same self-report PATCH the original screen uses. null = 403 or failure. */
  onUpdate: (wsId: number, patch: { status?: string; pct?: number }) => Promise<IntegrationWorkstream | null>;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [phase, setPhase] = useState<string>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  /* `limit`, NOT `window`: the state was called `window` and shadowed the DOM
     global for the whole component body, so the first `window.matchMedia` /
     `window.scrollTo` anyone added in here would have thrown a TypeError on a
     number. Inert until it wasn't — renamed rather than left as a tripwire. */
  const [limit, setLimit] = useState(WINDOW);

  /* ── the searched set. Everything downstream counts over THIS, never over
        the current selection, so a strip cell or a chip previews what it holds
        before you narrow to it — the reference's "Train · $104.88" idea. The
        ranking note states it, because a count whose denominator is invisible
        is the kind of quiet ordering P9 exists to disclose. */
  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return workstreams;
    return workstreams.filter(w =>
      [wsTitle(w), w.owner, w.detail, w.description, w.first_move]
        .some(v => (v ?? "").toString().toLowerCase().includes(q)),
    );
  }, [workstreams, query]);

  /** Workstreams filed under each phase, plus the residual. */
  const byPhase = useMemo(() => groupByPhase(searched), [searched]);

  /* THE SAME GROUPING OVER THE WHOLE PLAN — no search, no chip, no window.
     This is the population the GROUP HEADERS *and* THE STRIP count over.

     THE TRAP, TWICE (2026-08-15). The first cut computed the group header over
     the visible slice, so the Complete chip made a four-row group narrate
     itself as "Phase not recorded — 4/4 complete". The fix moved the header
     here and left the STRIP on `byPhase` (the searched set) while its copy kept
     describing the plan — so typing a word no PMI1 row matched printed
     "PMI1 · Stabilization / 0 filed" over six workstreams that ARE filed under
     PMI1. And because the same fix had just replaced the not-known glyph with
     the literal string "0 filed", the cell went from declining to answer to
     making a false affirmative claim. Strictly worse.

     FILING IS NOT A SEARCH RESULT. Which phase a workstream sits under is a
     property of the plan; a text query cannot change it. So the strip counts
     the plan, full stop, and the ranking note says the list below it is
     narrowed. `byPhase` survives for one job only — deciding whether the
     residual GROUP renders — and is named for the searched set it is. */
  const phasePopulation = useMemo(() => groupByPhase(workstreams), [workstreams]);

  /** Unfiled workstreams on the WHOLE plan. The strip and the caveats read
      this; the residual group's rows come from `byPhase` further down. */
  const unattributedAll = phasePopulation.get(NO_PHASE) ?? [];
  const unattributed = byPhase.get(NO_PHASE) ?? [];
  /** True once ANY workstream on this plan records a phase. Changes what an
      empty phase means: "nothing filed here" versus "this plan files nothing".
      Computed over the PLAN — it gates a sentence about the plan, and reading
      it off the search made an empty search result claim the PMI table has no
      phase column. */
  const anyPhaseRecorded = workstreams.length > 0 && unattributedAll.length < workstreams.length;

  /** Over the plan, for the strip and the chips. */
  const planTally = useMemo(() => tally(workstreams), [workstreams]);
  const allTally = useMemo(() => tally(searched), [searched]);

  /* ── P2 · THE CHIPS, CARRYING THEIR COUNTS ────────────────────────────
     A zero here prints "0", not a dash: a plan with nothing at risk is a real
     and good state, and the dash is reserved for statuses we could not read.
     (DealsList maps its zero to null; that is right for "we have not counted
     watchers" and wrong for "nothing is at risk", so this screen differs on
     purpose.) The strip below now obeys the SAME rule — see `openValue` and the
     file header; the two used to answer an empty set differently. */
  /* Over the PLAN, matching the strip beside them. A status chip answers
     "how much of this plan is at risk", which the search box does not change;
     and two controls an inch apart counting different populations is how the
     reader stops trusting either. */
  const chips: Chip[] = [
    { id: "all", label: "All", value: String(planTally.total) },
    { id: "open", label: "Open", value: planTally.open == null ? null : String(planTally.open) },
    { id: "at_risk", label: "At risk", value: planTally.atRisk == null ? null : String(planTally.atRisk) },
    { id: "complete", label: "Complete", value: planTally.complete == null ? null : String(planTally.complete) },
  ];

  /* ── P3 · THE COMPARISON STRIP — the four PMI phases ──────────────────
     Value = the OPEN-ITEM count for that phase, over THE WHOLE PLAN. Not the
     search: see `phasePopulation` above for why, and for the two-step way this
     got it wrong before.

     "0 filed" is now a true measurement rather than a glyph, because the
     population it is over is one we genuinely hold whole — the endpoint returns
     every workstream on the plan, nothing is paginated. The glyph is left for
     the one case we cannot answer: statuses we cannot read. */
  const strip: CompareItem[] = [
    {
      id: "all",
      label: `All workstreams · ${planTally.total}`,
      value: openValue(planTally),
      unknownWhy: unknownWhy(planTally, "this plan"),
    },
    ...PMI_PHASES.map(p => {
      const group = phasePopulation.get(p.id) ?? [];
      const t = tally(group);
      return {
        id: p.id,
        label: `${p.id} · ${p.name}`,
        value: openValue(t),
        // Only reached when the value is null, which is now ONLY the unreadable
        // case — the kit shows `unknownWhy` in place of the glyph's tooltip. The
        // old empty-phase copy that used to live here is gone with the glyph;
        // "this plan records no phase on any workstream" is still stated, once,
        // in the ranking note below, where it belongs.
        unknownWhy: unknownWhy(t, p.name),
      } satisfies CompareItem;
    }),
    /* The residual is a cell only when it holds something. It is not a fifth
       phase — it is the honest home of every workstream whose phase nobody
       wrote down, and on today's data that is all of them, so hiding it would
       hide the list. */
    ...(unattributedAll.length
      ? [{
          id: NO_PHASE,
          label: `Phase not recorded · ${unattributedAll.length}`,
          value: openValue(tally(unattributedAll)),
          unknownWhy: unknownWhy(tally(unattributedAll), "the unfiled workstreams"),
        } satisfies CompareItem]
      : []),
  ];

  /* ── the visible set: phase ∩ status ∩ search ─────────────────────── */
  const visible = useMemo(() => {
    const base = phase === "all" ? searched : (byPhase.get(phase) ?? []);
    if (status === "all") return base;
    return base.filter(w => {
      const s = statusId(w);
      // An unreadable status matches no status chip. It is not "open" and it is
      // not "complete"; pretending otherwise is where a wrong count comes from.
      if (!isKnownStatus(s)) return false;
      if (status === "open") return s !== "complete";
      return s === status;
    });
  }, [searched, byPhase, phase, status]);

  const shown = visible.slice(0, limit);
  /* Membership test for the group render below. A Set of ids, not
     `shown.includes(w)`: the slice is taken on the FLAT pre-group order, so
     every group has to be intersected with it, and identity `includes` over a
     growing window is quadratic for no reason. */
  const shownIds = new Set(shown.map(w => w.id));
  /* Resolved against the FULL set, not the visible one: flipping a chip should
     narrow the list, not silently empty the panel you were reading. */
  const selected = workstreams.find(w => w.id === selectedId) ?? null;

  /* ── P6 · THE ENDORSEMENT. Grounds, never a bare judgement.
     The least-progressed workstream reported at risk. Every clause is checkable
     against the row: the status is on it, the percent is on it.

     THE POPULATION IS THE WHOLE PLAN, and both halves of the claim are computed
     over it. It used to be computed over `shown` — the windowed slice — while
     the sentence read "the least-progressed of N flagged at risk", so with 8 at
     risk and 3 inside the window it asserted "of 3", and pressing "Show more"
     changed a stated fact. Ranking over the window was the worse half of that
     bug: the row it crowned was only the worst one that happened to fit.
     Selecting and counting over `workstreams` makes the sentence true as
     written. The consequence is deliberate — when the plan-wide worst row is
     filtered or windowed out, NO band renders, which is right: we would rather
     show nothing than promote the runner-up while claiming it is the worst. */
  const endorsed = useMemo(() => {
    const risky = workstreams.filter(w => statusId(w) === "at_risk");
    if (!risky.length) return null;
    let worst = risky[0];
    for (const w of risky) {
      const a = pctOrNull(w), b = pctOrNull(worst);
      // A row with no recorded progress outranks one that has some: we cannot
      // claim it is further along, so it stays the one to look at.
      if (a == null && b != null) worst = w;
      else if (a != null && b != null && a < b) worst = w;
    }
    return { row: worst, count: risky.length };
  }, [workstreams]);

  /* ── P1 · THE CRITERIA BAR — deal ⇄ phase, per the plan's §3 ────────── */
  const horizon = plan?.horizonDays != null && Number.isFinite(Number(plan.horizonDays))
    ? Number(plan.horizonDays) : null;
  const created = fmtDate(plan?.createdAt);
  const activePhase = PMI_PHASES.find(p => p.id === phase);

  const cells: CriteriaCell[] = [
    {
      label: "Looking at",
      grow: 1.2,
      value: dealName ? `${dealName} · post-close` : "Post-close",
    },
    {
      label: "Phase",
      grow: 1,
      value: phase === "all"
        ? "Any"
        : phase === NO_PHASE ? "Phase not recorded" : `${activePhase?.id} · ${activePhase?.name}`,
      // Cycles the same axis the strip drives, so the bar is editable in place
      // (P1: no settings screen, no modal) and the two never disagree.
      onClick: () => {
        const order = ["all", ...PMI_PHASES.map(p => p.id), ...(unattributed.length ? [NO_PHASE] : [])];
        const i = order.indexOf(phase);
        setPhase(order[(i + 1) % order.length] ?? "all");
        setLimit(WINDOW);
      },
    },
    // Honest: the REAL horizon and the plan's created date. There is no
    // "Day 32 / 100" field anywhere in the data and this screen does not
    // manufacture one — the original screen's header carries the same note.
    { label: "Horizon", grow: 0.7, value: horizon != null ? `${horizon} days` : "Not recorded" },
    { label: "Plan written", grow: 0.8, value: created || "Not recorded" },
    {
      label: "Search",
      grow: 1.3,
      value: (
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setLimit(WINDOW); }}
          placeholder="Workstream, owner or move"
          style={searchInput}
          aria-label="Search workstreams"
        />
      ),
    },
  ];

  const levers: ValueLever[] = Array.isArray((plan as any)?.valueLevers)
    ? ((plan as any).valueLevers as ValueLever[]) : [];
  const targetCents = (plan as any)?.targetValueCents != null
    ? Number((plan as any).targetValueCents) : null;

  /* Which groups render, in gate order, residual last. */
  const groups = phase === "all"
    ? [
        ...PMI_PHASES.map(p => ({ id: p.id, title: `${p.id} · ${p.name}` })),
        { id: NO_PHASE, title: "Phase not recorded" },
      ]
    : [{
        id: phase,
        title: phase === NO_PHASE
          ? "Phase not recorded"
          : `${activePhase?.id} · ${activePhase?.name}`,
      }];

  return (
    <div style={wrap}>
      <CriteriaBar cells={cells} />
      <ChipRow
        chips={chips}
        activeId={status}
        onPick={id => { setStatus(id as StatusFilter); setLimit(WINDOW); }}
      />
      <CompareStrip
        items={strip}
        activeId={phase}
        onPick={id => { setPhase(id); setLimit(WINDOW); }}
      />

      <div style={{ marginTop: 16 }}>
        <ListDetail
          list={
            <div>
              {groups.map(g => {
                const rows = (byPhase.get(g.id) ?? []).filter(w => shownIds.has(w.id));
                if (!rows.length) return null;
                /* TWO SETS GO TO THE GROUP, ON PURPOSE. `rows` is what renders —
                   phase ∩ status ∩ search, cut to the window. `population` is
                   every workstream on the plan filed under this phase, and it is
                   what the header's completion fraction counts, because the
                   header narrates the PHASE and not the current filter. Passing
                   only `rows` is what made the header claim "4/4 complete" the
                   moment you pressed the Complete chip. */
                return (
                  <PhaseGroup
                    key={g.id}
                    title={g.title}
                    rows={rows}
                    population={phasePopulation.get(g.id) ?? []}
                    endorsed={endorsed}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                  />
                );
              })}

              {visible.length === 0 && (
                <div style={noRows}>
                  {workstreams.length === 0
                    ? "This plan has no workstreams yet."
                    : `Nothing matches. ${workstreams.length} workstream${workstreams.length === 1 ? "" : "s"} on this plan — widen the search or clear a chip.`}
                </div>
              )}

              {visible.length > limit && (
                <Expander
                  dir="down"
                  label={`Show ${Math.min(WINDOW, visible.length - limit)} more of ${visible.length}`}
                  onClick={() => setLimit(n => n + WINDOW)}
                />
              )}

              {/* P9 · THE HONEST FOOTER. It must describe the board that is
                  actually on screen — the note used to describe a four-groups-
                  plus-residual render that does not happen when a phase is
                  selected, and it never mentioned that the list is a filtered,
                  windowed subset at all. Both are stated below, and the
                  subset sentence is built from the live filter state so it
                  cannot drift from what the controls are doing. */}
              <RankingNote
                ordering={
                  (phase === "all"
                    ? "Grouped by the PMI phase recorded on each workstream — PMI0 through PMI3 in gate-register order, then every workstream with no phase recorded; a group with no matching row is left out entirely. "
                    : "You have picked a phase on the strip, so this is a single group — the other phases are not rendered at all rather than rendered empty. ") +
                  "Inside a group nothing is re-ranked: rows stay in the order the plan wrote them, which is the order the server returns (sort_order, then id)."
                }
                caveats={[
                  `This list is a subset, not the plan. ${subsetNote(
                    { phase, status, query, activePhase, visibleCount: visible.length, total: workstreams.length },
                  )}`,
                  ...(visible.length > limit ? [
                    `Only the first ${limit} of those ${visible.length} rows are shown. The cut is taken on the flat list BEFORE it is grouped, so “Show more” does not simply add rows at the bottom — it can drop rows into groups higher up the page, above where you are reading.`,
                  ] : []),
                  "Each group header counts the whole phase — every workstream on the plan filed under it, ignoring the chip, the search and the window — so the completion fraction does not move when you filter. Where the two differ the header also says how many of that phase you can currently see.",
                  ...(anyPhaseRecorded ? [] : [
                    "No workstream on this plan records a phase — the PMI workstream table has no phase column — so all of them sit under “Phase not recorded” and the four phase cells read “0 filed”. The phases themselves are real; they come from the gate register.",
                  ]),
                  "The phase strip and the status chips count THE WHOLE PLAN — not your search, not the current selection — so each cell previews what it holds before you narrow to it, and the numbers do not move as you type. Which phase a workstream is filed under is a property of the plan; a text query cannot change it.",
                  "A phase whose workstreams are all complete prints “0 open”; a phase with nothing filed under it prints “0 filed”. Both are measured — we hold every workstream on this plan — and the noun says which zero it is, so an empty phase can never read as a finished one. The not-known mark appears only where statuses could not be read.",
                  "Status and progress are self-reported execution. Nothing here is verified against the books, and none of it is an assessment of the deal.",
                  "Value-lever figures are illustrative targets. There is no captured or realised number — that needs a finance connector the practice does not have — so captured value is absent rather than shown as zero.",
                  "The highlighted workstream is the least-progressed of those reported at risk anywhere on this plan — the whole plan, not this filtered list. If it is filtered out, no workstream is highlighted at all. It is not a judgement.",
                  "Nothing here is sponsored or promoted. There is nobody to promote it for.",
                ]}
              />
            </div>
          }
          /* The detail column always renders: the selected workstream on top
             (or a line saying what a selection gives you), then the PLAN-level
             blocks — execution progress, the event trail, the value levers.
             Those three are properties of the plan, not of a workstream, so
             hiding them behind a selection would lose them; the column scrolls
             on its own, which is what makes carrying both affordable. */
          detail={
            <div style={detailScroll}>
              {selected
                ? <WorkstreamDetail key={selected.id} ws={selected} onUpdate={onUpdate} />
                : <div style={pickHint}>
                    Pick a workstream to see its items, its owner and its
                    self-reported progress here — the list stays where it is.
                  </div>}

              <PlanProgress workstreams={workstreams} tallyAll={tally(workstreams)} />
              <PlanEvents milestones={milestones} />
              <ValueLevers levers={levers} targetCents={targetCents} />
            </div>
          }
        />
      </div>
    </div>
  );
}

/* ── one phase group ──────────────────────────────────────────────────── */

function PhaseGroup({ title, rows, population, endorsed, selectedId, onSelect }: {
  title: string;
  /** What renders: phase ∩ status chip ∩ search, cut to the window. */
  rows: IntegrationWorkstream[];
  /** Every workstream on the PLAN filed under this phase. The header counts these. */
  population: IntegrationWorkstream[];
  endorsed: { row: IntegrationWorkstream; count: number } | null;
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  /* P7 — the group header names the phase AND the columns in one row, and it
     carries the phase's completion.

     THE FRACTION IS COUNTED OVER `population`, NEVER OVER `rows`. It used to be
     `tally(rows)` with a comment claiming it "carries the phase's completion",
     and it did not: `rows` is the status-chipped, searched, windowed slice, so
     pressing the Complete chip rendered "Phase not recorded — 4/4 complete" and
     pressing Open rendered "0/5 complete" over the SAME plan, and expanding the
     window silently changed the number. A fraction whose denominator is the
     filter is not a fact about anything. Counting the phase makes the sentence
     ("this phase is 2/9 complete") true whatever the controls are set to.

     The visible count is kept, but LABELLED as the subset it is — that is the
     other half of the rule: state the whole, or say which part you mean; never
     compute a part and narrate the whole.

     When a status in the phase is unreadable the completion is NOT stated:
     "3/5 complete" computed over 4 readable rows is a wrong number that looks
     right. */
  const t = tally(population);
  const fraction = t.complete == null
    ? "completion not recorded"
    : `${t.complete}/${t.total} complete`;
  const head = rows.length < t.total
    ? `${title} — ${fraction} · showing ${rows.length}`
    : `${title} — ${fraction}`;

  return (
    <div style={{ marginBottom: 2 }}>
      <GroupHeader title={head} columns={["Progress", "Status"]} />
      {rows.map(w => {
        const isEndorsed = endorsed?.row.id === w.id;
        const pct = pctOrNull(w);
        const s = statusId(w);
        return (
          <div key={w.id}>
            {isEndorsed && (
              <Endorsement
                claim="Look here first."
                /* Every clause is checkable, and the peer count names its
                   population out loud ("on this plan") because it is counted
                   over the plan — not over the window, which is what it used to
                   say "of 3" about while 8 sat at risk past the Expander. */
                grounds={
                  /* UNKNOWN IS NOT LESS THAN KNOWN. The selection loop promotes
                     a null pct above any recorded percentage — a defensible
                     triage rule (a workstream at risk that nobody has scored is
                     exactly the one to look at) — but "least-progressed" is a
                     COMPARISON, and no comparison was made for a row with no
                     number. So the sentence changes with the row: an unscored
                     row is surfaced because it is unscored, and says that. */
                  pct == null
                    ? `Self-reported at risk with no progress recorded${
                        endorsed!.count === 1
                          ? " — the only workstream on this plan flagged at risk."
                          : ` — one of ${endorsed!.count} flagged at risk on this plan, and the first with nothing recorded against it.`
                      }`
                    : `Self-reported at risk at ${pct}% complete${
                        endorsed!.count === 1
                          ? " — the only workstream on this plan flagged at risk."
                          : ` — the least-progressed of ${endorsed!.count} flagged at risk on this plan.`
                      }`
                }
              />
            )}
            <ResultRow
              anchor={wsTitle(w)}
              sub={(w.owner as string | undefined) || undefined}
              endorsed={isEndorsed}
              selected={selectedId === w.id}
              onClick={() => onSelect(w.id)}
              values={[
                // null, never "0%", when the row carries no pct — see pctOrNull.
                { text: pct == null ? null : `${pct}%`, lead: selectedId === w.id },
                {
                  text: statusText(w),
                  note: s === "at_risk" ? "at risk" : undefined,
                },
              ]}
            />
          </div>
        );
      })}
    </div>
  );
}

/* ── the selected workstream ──────────────────────────────────────────── */

function WorkstreamDetail({ ws, onUpdate }: {
  ws: IntegrationWorkstream;
  onUpdate: (wsId: number, patch: { status?: string; pct?: number }) => Promise<IntegrationWorkstream | null>;
}) {
  const [busy, setBusy] = useState(false);
  const [denied, setDenied] = useState(false);

  const s = statusId(ws);
  const pct = pctOrNull(ws);
  const phase = phaseOf(ws);
  const phaseDef = PMI_PHASES.find(p => p.id === phase);

  const detail = (ws.detail as string | undefined) || ws.description || undefined;
  const firstMove = (ws.first_move as string | undefined) || undefined;
  // evidence_link is descriptive prose ("Data room / financial model"), NOT a
  // URL — the original screen made the same call and it still holds: rendering
  // it as a link would promise a destination the field does not carry.
  const evidence = (ws.evidence_link as string | undefined) || undefined;
  const owner = (ws.owner as string | undefined) || undefined;

  /** Single PATCH path for the stepper, the select and the headline action. */
  const apply = async (patch: { status?: string; pct?: number }) => {
    if (busy) return;
    setBusy(true);
    setDenied(false);
    const res = await onUpdate(ws.id, patch);
    // null = 403 (no full access) or a transient failure. Surfaced honestly —
    // the controlled values snap back from hook state, never a fake success.
    if (res === null) setDenied(true);
    setBusy(false);
  };

  return (
    <>
      <SummaryCard
        kicker={
          phaseDef ? `${phaseDef.id} · ${phaseDef.name}` : "Phase not recorded"
        }
        // The headline is the progress figure — and when there is no figure it
        // says so in words rather than rendering a confident 0%.
        value={pct == null ? "Progress not recorded" : `${pct}%`}
        badge={statusText(ws) ?? undefined}
        sub={owner ? `Owner · ${owner}` : "No owner recorded"}
        actionLabel={s === "complete" || busy ? undefined : "Mark complete"}
        onAction={() => void apply({ status: "complete" })}
      />

      {/* The at-risk banner the phase strip points you at. */}
      {s === "at_risk" && (
        <div style={{ marginTop: 12 }}>
          <InfoBanner tone="caution">
            <b>Reported at risk.</b> This is the owner&rsquo;s self-reported
            execution status — it is not an assessment of the deal, and nothing
            has been verified against the books.
          </InfoBanner>
        </div>
      )}

      {/* An unreadable status is its own caution: the counts above exclude this
          row, and saying so beats letting it sit silently uncounted. */}
      {!isKnownStatus(s) && (
        <div style={{ marginTop: 12 }}>
          <InfoBanner tone="caution">
            {s == null
              ? "No status recorded on this workstream, so it is not counted as open or complete anywhere on this screen."
              : `Status "${s}" is not one this app recognises, so this workstream is not counted as open or complete anywhere on this screen.`}
          </InfoBanner>
        </div>
      )}

      {denied && (
        <div style={{ marginTop: 12 }}>
          <InfoBanner tone="caution">
            Couldn&rsquo;t save that change. Full deal access is required to
            update a workstream — nothing was recorded.
          </InfoBanner>
        </div>
      )}

      <DetailCard title="Items">
        {detail || firstMove || evidence ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {detail && <ItemRow label="What it covers" value={detail} />}
            {firstMove && <ItemRow label="Next move" value={firstMove} accent />}
            {evidence && <ItemRow label="Reference" value={evidence} />}
          </div>
        ) : (
          <div style={quiet}>
            No detail, next move or reference recorded on this workstream.
          </div>
        )}
      </DetailCard>

      <DetailCard title="Owner">
        {owner ? (
          <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.5 }}>
            {owner}
            <div style={{ ...quiet, marginTop: 4 }}>
              A role on the plan, self-assigned. The app does not notify anyone.
            </div>
          </div>
        ) : (
          <div style={quiet}>No owner recorded on this workstream.</div>
        )}
      </DetailCard>

      <DetailCard title="Self-reported progress">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 5 }}>
            {PCT_STEPS.map(step => {
              const active = pct === step;
              return (
                <button
                  key={step}
                  type="button"
                  disabled={busy || active}
                  onClick={() => void apply({ pct: step })}
                  style={stepBtn(active, busy)}
                >
                  {step}%
                </button>
              );
            })}
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={quiet}>Execution status</span>
            <select
              value={isKnownStatus(s) ? s : ""}
              disabled={busy}
              onChange={e => { if (e.target.value) void apply({ status: e.target.value }); }}
              style={selectStyle(busy)}
            >
              {/* An unrecognised or absent status keeps a blank first option so
                  the control never silently claims the row is "Not started". */}
              {!isKnownStatus(s) && <option value="">Not recorded</option>}
              {STATUS_OPTIONS.map(o => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </label>
        </div>
      </DetailCard>
    </>
  );
}

function ItemRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ fontSize: 12.5, lineHeight: 1.5, minWidth: 0, overflowWrap: "anywhere" }}>
      <span style={{ color: accent ? T.blue : T.muted2, fontWeight: 700 }}>{label}: </span>
      <span style={{ color: T.ink }}>{value}</span>
    </div>
  );
}

/* ── plan-level blocks ────────────────────────────────────────────────── */

function PlanProgress({ workstreams, tallyAll }: {
  workstreams: IntegrationWorkstream[];
  tallyAll: Tally;
}) {
  return (
    <DetailCard title="Execution progress">
      {workstreams.length === 0 ? (
        <div style={quiet}>This plan has no workstreams yet.</div>
      ) : tallyAll.complete == null ? (
        // Some status could not be read, so the fraction is not statable. The
        // original screen would print "0 of 5 complete" here; that is a figure,
        // and a figure computed over rows it could not classify is invented.
        <div style={quiet}>
          {tallyAll.unreadable} of {tallyAll.total} workstream
          {tallyAll.total === 1 ? "" : "s"} carry no readable status, so overall
          completion is not stated.
        </div>
      ) : (
        <div style={{ fontSize: 13, color: T.ink }}>
          <b>{tallyAll.complete}</b> of {tallyAll.total} workstream
          {tallyAll.total === 1 ? "" : "s"} complete
          <div style={{ ...quiet, marginTop: 4 }}>
            Self-reported. There is no verified capture figure behind it.
          </div>
        </div>
      )}
    </DetailCard>
  );
}

/**
 * The plan's REAL event trail. There is no Day-0/30/60/100 ladder in the data —
 * these are logged events (plan created, workstream completed, snapshots) and
 * every one of them already happened, so the Timeline's two ends are the first
 * and the most recent event rather than a schedule.
 */
function PlanEvents({ milestones }: { milestones: IntegrationMilestone[] }) {
  const [expanded, setExpanded] = useState(false);
  // The server returns them created-ascending, which is the direction the
  // Timeline reads: oldest at the top rail, newest at the bottom.
  const ordered = milestones;

  if (ordered.length === 0) {
    return (
      <DetailCard title="Plan events">
        <div style={quiet}>
          No milestones logged yet — they appear here as workstreams complete.
        </div>
      </DetailCard>
    );
  }

  if (ordered.length === 1) {
    return (
      <DetailCard title="Plan events">
        <EventLine m={ordered[0]} />
      </DetailCard>
    );
  }

  const first = ordered[0];
  const last = ordered[ordered.length - 1];
  const middle = ordered.slice(1, -1);
  const hidden = Math.max(0, middle.length - EVENT_CAP);
  const shownMiddle = expanded ? middle : middle.slice(hidden);

  return (
    <DetailCard title="Plan events">
      <Timeline
        from={{ time: eventWhen(first) || "Date not recorded", place: eventTitle(first) }}
        to={{ time: eventWhen(last) || "Date not recorded", place: eventTitle(last) }}
        middle={
          middle.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {hidden > 0 && (
                <button type="button" onClick={() => setExpanded(v => !v)} style={linkBtn}>
                  {expanded ? "Show fewer" : `Show ${hidden} earlier event${hidden === 1 ? "" : "s"}`}
                </button>
              )}
              {shownMiddle.map((m, i) => <EventLine key={m.id ?? i} m={m} />)}
            </div>
          ) : undefined
        }
      />
    </DetailCard>
  );
}

function EventLine({ m }: { m: IntegrationMilestone }) {
  const when = eventWhen(m);
  const desc = eventDesc(m);
  const wc = (m as any).workstreams_complete;
  const wt = (m as any).workstreams_total;
  // Only when BOTH counts arrived — a "3/" fragment is worse than nothing.
  const counts = wc != null && wt != null && Number.isFinite(Number(wt)) && Number(wt) > 0
    ? `${Number(wc)}/${Number(wt)} workstreams`
    : null;
  return (
    <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5, minWidth: 0, overflowWrap: "anywhere" }}>
      <span style={{ color: T.ink, fontWeight: 600 }}>{eventTitle(m)}</span>
      {when && <span style={{ color: T.faint }}> · {when}</span>}
      {desc && <div>{desc}</div>}
      {counts && <div style={{ color: T.muted2 }}>{counts}</div>}
    </div>
  );
}

function ValueLevers({ levers, targetCents }: { levers: ValueLever[]; targetCents: number | null }) {
  return (
    <DetailCard
      title="Value levers"
      action={<span style={quiet}>Illustrative · captured not tracked</span>}
    >
      <div style={leverTotal}>
        <span style={{ fontSize: 12.5, color: T.muted, fontWeight: 600 }}>
          Total illustrative target
        </span>
        {/* fmtCents prints an em dash for null — the not-known mark, which is
            correct here: a plan with no target has no target, not a $0 one. */}
        <span style={{ fontSize: 15, fontWeight: 700, color: targetCents == null ? T.muted2 : T.ink }}>
          {fmtCents(targetCents)}
        </span>
      </div>

      {levers.length === 0 ? (
        <div style={{ ...quiet, marginTop: 10 }}>No value levers on this plan.</div>
      ) : (
        levers.map((l, i) => {
          const target = l.target_value_cents != null ? Number(l.target_value_cents) : null;
          const cat = l.category ? LEVER_CATEGORY_LABEL[l.category] || l.category : null;
          const conf = l.confidence ? CONFIDENCE_LABEL[l.confidence] || l.confidence : null;
          return (
            <div key={i} style={leverRow}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: T.ink }}>
                  {l.name || "Value lever"}
                </div>
                <div style={{ ...quiet, marginTop: 2 }}>
                  {[cat, conf].filter(Boolean).join(" · ") || "Category not recorded"}
                </div>
              </div>
              <div style={{ textAlign: "right", flex: "none" }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: target == null ? T.muted2 : T.ink, fontVariantNumeric: "tabular-nums" }}>
                  {fmtCents(target)}
                </div>
                <div style={{ fontSize: 10.5, color: T.faint }}>target</div>
              </div>
            </div>
          );
        })
      )}
    </DetailCard>
  );
}

/* ── the view toggle, exported so the wiring in Integration.tsx is one line ── */

export type IntegrationViewId = "list" | "plan";

/**
 * List is the default; the original three-section plan view stays reachable,
 * the way Deals kept its board. Plan §5 Q2: keep the old surface one release so
 * the two can be compared honestly rather than from memory.
 */
export function IntegrationViewToggle({ view, onView }: {
  view: IntegrationViewId;
  onView: (v: IntegrationViewId) => void;
}) {
  return (
    <div style={toggleWrap}>
      {(["list", "plan"] as IntegrationViewId[]).map(v => (
        <button
          key={v}
          type="button"
          onClick={() => onView(v)}
          style={{
            font: "inherit", fontSize: 12.5, fontWeight: 600, padding: "7px 14px",
            border: "none", cursor: "pointer", fontFamily: T.font,
            background: v === view ? T.track : T.white,
            color: v === view ? T.ink : T.muted,
          }}
        >
          {v === "list" ? "List" : "Plan"}
        </button>
      ))}
    </div>
  );
}

/* ── helpers ──────────────────────────────────────────────────────────── */

/** Bucket a list of workstreams by recorded phase, residual last. */
function groupByPhase(list: IntegrationWorkstream[]): Map<string, IntegrationWorkstream[]> {
  const m = new Map<string, IntegrationWorkstream[]>();
  for (const p of PMI_PHASES) m.set(p.id, []);
  m.set(NO_PHASE, []);
  for (const w of list) m.get(phaseOf(w) ?? NO_PHASE)?.push(w);
  return m;
}

/**
 * The strip's value. THE ONLY PATH THAT RETURNS NULL is a set whose statuses
 * cannot all be read — the one question we hold the data for and still cannot
 * answer — so that is the only place the kit's not-known mark appears.
 *
 * An empty set is a KNOWN zero and says so: we hold every workstream on the
 * plan, nothing here is paged or partially fetched, so "nothing is filed under
 * PMI2" is a measurement. It prints "0 filed" rather than "0 open" because
 * "nothing is filed here" and "everything here is done" are opposite facts and
 * the noun is what keeps them apart. This is the same rule the status chips
 * follow (an empty chip prints "0"); until 2026-08-15 it was not — the chips
 * printed "0" and the strip printed the glyph for the same empty set, side by
 * side, and a reader had no way to tell which answer to believe.
 */
function openValue(t: Tally): string | null {
  if (t.total === 0) return "0 filed";
  if (t.open == null) return null;
  return `${t.open} open`;
}

/** Only consulted when `openValue` returned null, i.e. unreadable statuses. */
function unknownWhy(t: Tally, what: string): string | undefined {
  if (t.total === 0) return undefined;
  if (t.open == null) {
    return `${t.unreadable} of ${t.total} workstream${t.total === 1 ? "" : "s"} under ${what} carry no readable status, so the open count cannot be stated.`;
  }
  return undefined;
}

/**
 * The RankingNote's subset sentence, assembled from the LIVE control state so
 * it always names the filters that are actually narrowing the board. The note
 * previously described only the ordering and left the reader to guess that the
 * list was filtered and cut at all.
 */
function subsetNote(s: {
  phase: string;
  status: StatusFilter;
  query: string;
  activePhase: { id: string; name: string } | undefined;
  visibleCount: number;
  total: number;
}): string {
  const narrowed: string[] = [];
  if (s.phase !== "all") {
    narrowed.push(
      s.phase === NO_PHASE
        ? "the strip’s “Phase not recorded” cell"
        : `the strip’s ${s.activePhase?.id ?? s.phase} cell`,
    );
  }
  if (s.status !== "all") narrowed.push(`the “${STATUS_CHIP_LABEL[s.status]}” chip`);
  if (s.query.trim()) narrowed.push(`the search for “${s.query.trim()}”`);

  if (!narrowed.length) {
    return `All ${s.total} workstream${s.total === 1 ? "" : "s"} on this plan match — no phase cell, status chip or search is narrowing it.`;
  }
  const joined = narrowed.length === 1
    ? narrowed[0]
    : `${narrowed.slice(0, -1).join(", ")} and ${narrowed[narrowed.length - 1]}`;
  // The unreadable-status clause is attached ONLY when a status chip is what is
  // narrowing, because that is the only filter it is true of.
  const chipClause = s.status === "all"
    ? ""
    : " A row whose status this app does not recognise matches no status chip at all, so it drops out of the list here while still counting in every group header.";
  return `${s.visibleCount} of the ${s.total} workstream${s.total === 1 ? "" : "s"} on this plan match ${joined}.${chipClause}`;
}

/** Chip labels for the subset sentence. `all` never reaches it. */
const STATUS_CHIP_LABEL: Record<Exclude<StatusFilter, "all">, string> = {
  open: "Open",
  at_risk: "At risk",
  complete: "Complete",
};

/* ── styles ───────────────────────────────────────────────────────────── */

/* No outer padding: this renders inside Integration.tsx's `Root`, which already
   pads 22/24 and owns the scroll. Adding our own would double it. `flex: none`
   because Root is a COLUMN flex container with `overflow: auto` — the default
   `flex-shrink: 1` applies to height there, and a tall list/detail would be
   squeezed instead of scrolling its parent. */
const wrap: CSSProperties = { minWidth: 0, flex: "none" };

const searchInput: CSSProperties = {
  font: "inherit", fontSize: 14, fontWeight: 700, color: T.ink,
  background: "transparent", border: "none", outline: "none",
  padding: 0, width: "100%", minWidth: 0,
};

/* The detail column scrolls independently of the list. It carries the selected
   workstream AND the three plan-level blocks, so without a cap the levers would
   run past the fold with no way to reach them. */
const detailScroll: CSSProperties = {
  maxHeight: "calc(100vh - 190px)",
  overflowY: "auto",
  paddingRight: 4,
};

const pickHint: CSSProperties = {
  padding: "18px 16px", border: `1px solid ${T.border}`, background: T.white,
  fontSize: 12.5, color: T.muted, lineHeight: 1.6,
};

const noRows: CSSProperties = {
  padding: "26px 14px", border: `1px solid ${T.border}`, background: T.white,
  fontSize: 12.5, color: T.muted, lineHeight: 1.6,
};

const quiet: CSSProperties = { fontSize: 11.5, color: T.muted2, lineHeight: 1.5 };

const leverTotal: CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
  paddingBottom: 10, borderBottom: `1px solid ${T.rowDiv}`,
};
const leverRow: CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
  padding: "10px 0 0",
};

const linkBtn: CSSProperties = {
  alignSelf: "flex-start", background: "none", border: "none", padding: 0,
  font: "inherit", fontSize: 11.5, fontWeight: 600, color: T.blue, cursor: "pointer",
};

/* Radius 10 — Carta's one exception is buttons and inputs. */
function stepBtn(active: boolean, busy: boolean): CSSProperties {
  return {
    flex: 1, font: "inherit", fontSize: 11, fontWeight: 600,
    border: `1px solid ${active ? T.blue : T.inputBd}`, borderRadius: 10,
    padding: "5px 0",
    color: active ? T.blue : T.muted,
    background: active ? T.blueBg : T.white,
    cursor: busy || active ? "default" : "pointer",
  };
}

function selectStyle(busy: boolean): CSSProperties {
  return {
    font: "inherit", width: "100%", fontSize: 12.5, fontWeight: 600, color: T.ink,
    border: `1px solid ${T.inputBd}`, borderRadius: 10, padding: "7px 10px",
    background: busy ? T.hover : T.white,
    cursor: busy ? "default" : "pointer",
  };
}

const toggleWrap: CSSProperties = {
  display: "flex", border: `1px solid ${T.border}`, borderRadius: 10,
  overflow: "hidden", alignSelf: "flex-start", flex: "none",
};
