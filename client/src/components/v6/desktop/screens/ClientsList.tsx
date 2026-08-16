/**
 * CLIENTS · LIST — the client pipeline on the Trainline grammar.
 *
 * Plan: `APP_REDESIGN_TRAINLINE.md` Phase 3. Primitives: `../kit`. Worked
 * reference: `./DealsList.tsx`. The screen it re-presents is `./Clients.tsx`
 * (the Board), which stays exactly as it was — this lands as a THIRD mode
 * beside Board and Outreach, defaulted on, additive.
 *
 * ── WHAT THIS IS ────────────────────────────────────────────────────────
 * The acquirers the practice SERVES — `crm_accounts`, migration 113. Two
 * questions, in this order, unchanged from the Board:
 *   1. Who do I call next?   → the ranked list, grouped by tier
 *   2. What did I say last?  → the detail panel: people, touches, buy signal
 *
 * ── THE TWO DEAD COLUMNS, AND WHAT HAPPENED TO THEM ─────────────────────
 * The Board's table carries five columns. On a real board two of them print
 * the same value on every single row, and A COLUMN THAT IS CONSTANT IS NOT A
 * COLUMN — it is five hundred pixels spent saying nothing. They are not the
 * same kind of constant, though, and that difference decided where each went.
 *
 * BUY SIGNAL (`buyer_moment`) is constant AND UNREACHABLE. It has no default
 * in migration 113, `crmOutreachSeed.ts` never writes it, none of the seven
 * shipped `content/crm-seed/*.csv` files carries the column, and — the part
 * that matters — `PATCH /api/crm/accounts/:id` does not accept it. It appears
 * in the importer's `IMPORTABLE` set and NOWHERE else, so the only way to move
 * it is a CSV re-import with a `buyer_moment` column that does not currently
 * exist. Every firm therefore reads `unknown`, and since `NEED` in
 * `house/leads.ts` is 35 of the ~100 available points, every firm on the board
 * is sitting on the same `unknown: 8` floor and the ranking is being decided
 * by the other 65. That is worth SAYING, not worth a column, so it became a
 * detail card that states the gap and names the only way to close it. The
 * "Flow-constrained" chip stays — a chip that shows you its result so you can
 * decide not to press it is the whole point of P2 — but it carries a `—`, not
 * a `0`: see `countKnown`. A count of zero over a column nothing writes is not
 * a measurement, and `dfw` is in exactly the same state.
 *
 * STAGE is constant but LIVE. `DEFAULT 'prospect'` in migration 113, never
 * written by the seeder and not importable — but the Board's stage chips
 * PATCH it, so it stops being constant the first time a firm is moved. A live
 * field with nothing in it yet is not a dead column; it is an empty one. So it
 * kept its place in the summary card (per the brief) and gained a criteria-bar
 * cell that can narrow by it — which the Board's own toolbar never offered,
 * even though `CrmFilters.stage` and the server filter have always been there.
 *
 * The three columns that replace them all vary: SCORE, PEOPLE, NEXT.
 *
 * ── THE STRIP AXIS IS TIER ──────────────────────────────────────────────
 * The brief offered TIER or STAGE. Stage is single-valued on any board that
 * has been seeded and not yet worked, so a stage strip is one populated cell
 * and five zeroes. Tier genuinely varies — the shipped plan is 17 A / 36 B /
 * 28 C across 81 organisations, and `scoreLead` adds D for anything a human
 * has disqualified. Tier is also the FIRST key the server sorts by, so the
 * strip's axis and the list's order are the same fact rather than two.
 *
 * ── WHERE THE KPI CARDS WENT ────────────────────────────────────────────
 * Nothing was cut. THE CALL LIST (tier A+B) is the first two strip cells;
 * FLOW-CONSTRAINED and DUE NOW are chips carrying their counts (or, where the
 * column has no writer, their honest "not known" dash); NEED A CONTACT
 * is the strip's second number, stated as its positive ("n named"), so you
 * read reachability per tier instead of one number for the whole board.
 * They are counted off the ROWS ON SCREEN rather than off `/api/crm/summary`,
 * which counts every kind and ignores the layer filter — a KPI that disagrees
 * with the list under it is worse than no KPI.
 *
 * ── NO NEW DATA PATH ────────────────────────────────────────────────────
 * The rows arrive as props from `Clients.tsx`, which already called
 * `useCrmAccounts`. The detail panel calls `useCrmAccount` — the same hook the
 * Board's `DetailPane` calls. Nothing here fetches anything else.
 *
 * ── THE LINE ────────────────────────────────────────────────────────────
 * This screen TRACKS a relationship and drafts nothing. No band, chip or
 * button here sends, schedules a send, or proposes contacting anybody: the
 * endorsement is worded as an observation about a DATE, not as an instruction
 * to call. A firm the register marks do-not-pitch says so on its own row, in
 * amber, before you ever open it.
 */
import { useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { T } from "../atlasTokens";
import {
  CriteriaBar, ChipRow, CompareStrip, ListDetail, GroupHeader, ResultRow,
  Endorsement, Expander, RankingNote, SummaryCard, DetailCard, InfoBanner,
  type Chip, type CompareItem, type CriteriaCell,
} from "../kit";
import { EngagementCard } from "./EngagementCard";
import { LeadsPanel } from "./LeadsPanel";
import {
  CRM_STAGES, STAGE_LABEL, MOMENT_LABEL, MOMENT_WHY, SEGMENT_LABEL,
  PITCH_LABEL, GRADE_LABEL, LOSS_LABEL, dueLabel, touchLabel, daysUntil,
  stageAging, needsNextStep,
  type CrmAccount, type CrmStage,
} from "../../../../lib/crm";
import { useCrmAccount, type CrmFilters } from "../../../../hooks/useCrmAccounts";
import { authHeaders } from "../../../../hooks/useAuth";
import { ROLE_LABEL } from "../../../../hooks/useDealTasks";

/** How many rows before the window closes. The Expander widens it. */
const WINDOW = 14;

/** The tier scale, in the order the server sorts it. `scoreLead` emits exactly
 *  these four and nothing else; a row with no tier at all sorts after them
 *  (`ORDER BY (a.tier IS NULL)` puts false — i.e. has a tier — first). */
const TIERS = ["A", "B", "C", "D"] as const;
type TierId = (typeof TIERS)[number];
type StripId = TierId | "all" | "none";

/** The layer the board is looking at. Mirrors the `kind` filter the server
 *  applies, whose default is `acquirer` — see `GET /api/crm/accounts`. */
const LAYERS = [
  { kind: undefined as string | undefined, label: "Acquirers" },
  { kind: "service_provider", label: "Capital & referral" },
  { kind: "all", label: "Everyone on file" },
];

export function ClientsList({
  accounts, allCount, query, onQuery, filters, onToggle,
  onOpenBoard, onOpenDeal, onOpenSourcing, onLeadConverted,
}: {
  /** Already server-filtered and search-filtered by `Clients.tsx`. */
  accounts: CrmAccount[];
  /** Rows the server returned before the search box narrowed them. */
  allCount: number;
  query: string;
  onQuery: (v: string) => void;
  filters: CrmFilters;
  onToggle: (k: keyof CrmFilters, v: string | boolean) => void;
  /** The full editable dossier lives on the Board; this hands off to it. */
  onOpenBoard: (id: number) => void;
  /** Called after a funnel lead converts, so the parent refetches the board
   *  and the new account appears in the list without a reload. */
  onLeadConverted: () => void;
  onOpenDeal: (dealId: number, name?: string) => void;
  onOpenSourcing: () => void;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [tier, setTier] = useState<StripId>("all");
  const [window, setWindow] = useState(WINDOW);

  /* ── the numbers the chips and the strip carry ──────────────────────
     Counted off the rows this component was handed. Nothing here scores,
     ranks or decides — `house/leads.ts` did that on the server and the SQL
     ordered by its result. */

  const dueCount = useMemo(
    () => accounts.filter(a => (daysUntil(a.next_action_on) ?? 1) <= 0).length,
    [accounts],
  );
  /* THE TWO UNWRITTEN COLUMNS — why these two chips count differently.
     `buyer_moment` and `dfw` both print a hard 0 on every board shipped so
     far, and NOT because nobody is flow-constrained or in DFW: nothing in the
     app writes either field. `crmOutreachSeed.ts` sets neither, none of the
     seven `content/crm-seed/*.csv` files carries the column, and
     `PATCH /api/crm/accounts/:id` accepts neither — the sole writer is a CSV
     re-import through `IMPORTABLE`, with a column the shipped sheets do not
     have. "Flow-constrained · 0" therefore asserts a measured zero for a
     column that has never been measured.
     The row beside it already draws exactly this distinction correctly — a
     null score prints "Not available", a 0 score prints "0" and means a human
     disqualified the firm — so the chips copy it: count only when at least one
     loaded row carries the field, and hand the chip `null` (the kit's "—",
     "not known") when none does. An empty board still prints 0, because zero
     out of zero rows is something we know. */
  const flowValue = useMemo(
    () => countKnown(accounts, a => a.buyer_moment, "thesis_no_flow"),
    [accounts],
  );
  const dfwValue = useMemo(() => countKnown(accounts, a => a.dfw, "yes"), [accounts]);

  const byTier = useMemo(() => {
    const m = new Map<StripId, CrmAccount[]>();
    for (const t of TIERS) m.set(t, []);
    m.set("none", []);
    for (const a of accounts) {
      const key: StripId = (TIERS as readonly string[]).includes(a.tier ?? "")
        ? (a.tier as TierId) : "none";
      m.get(key)?.push(a);
    }
    return m;
  }, [accounts]);

  const unranked = byTier.get("none") ?? [];

  /* CHIPS CARRY THEIR CONSEQUENCE — and only where we can honestly count it.
     `Archived` and the layer switches change WHICH ROWS THE SERVER RETURNS, so
     while they are off, their result set is simply not in the browser: those
     chips carry `null`, which the kit renders as a dash meaning "not known",
     rather than a `0` that would read as "there is nothing there". The moment
     the scope is on, the answer is in front of us and the number appears. */
  const chips: Chip[] = [
    // `dueCount` keeps its number: `next_action_on` IS written inside the app
    // (the Board's next-action editor, and PATCH accepts it), so a 0 there is
    // a real "nothing is overdue" rather than an unwritten column.
    { id: "due", label: "Due now", value: String(dueCount), kind: "boolean" },
    { id: "moment", label: "Flow-constrained", value: flowValue, kind: "boolean" },
    { id: "dfw", label: "DFW", value: dfwValue, kind: "boolean" },
    {
      id: "archived",
      label: "Archived",
      value: filters.archived ? String(accounts.length) : null,
      kind: "boolean",
    },
  ];

  const activeChips = useMemo(() => {
    const s = new Set<string>();
    if (filters.due) s.add("due");
    if (filters.moment === "thesis_no_flow") s.add("moment");
    if (filters.dfw === "yes") s.add("dfw");
    if (filters.archived) s.add("archived");
    return s;
  }, [filters]);

  const pickChip = (id: string) => {
    if (id === "due") onToggle("due", true);
    else if (id === "moment") onToggle("moment", "thesis_no_flow");
    else if (id === "dfw") onToggle("dfw", "yes");
    else if (id === "archived") onToggle("archived", true);
  };

  /* THE TIER STRIP. Label carries the head count; the value carries how many
     of them you could actually start a conversation with today.

     `contact_count` arrives from a bare `SELECT COUNT(*)` with no `::int`, and
     postgres-js hands int8 back as a STRING — so it is coerced rather than
     trusted, and a row that carries no count at all yields `null` instead of
     being silently counted as zero. That distinction is the reason the strip
     value can be `null`: "we counted and none of them have a named person" and
     "the payload did not tell us" are different facts, and only the second one
     gets the not-known glyph. An EMPTY tier still prints `0 named`, because
     zero out of zero is something we know, not something we are missing. */
  const strip: CompareItem[] = [
    { id: "all", label: `All tiers · ${accounts.length}`, value: namedValue(accounts) },
    ...TIERS.map(t => {
      const group = byTier.get(t) ?? [];
      return {
        id: t,
        label: `Tier ${t} · ${group.length}`,
        value: namedValue(group),
        unknownWhy: "The board did not return contact counts for these firms, so how many carry a named person is not known.",
      } satisfies CompareItem;
    }),
    // Only shown when it exists. A permanently empty sixth cell would be
    // chrome; a populated one is a real state — the seeder leaves `tier` NULL
    // for any firm the outreach plan did not tier, and the server sorts those
    // to the very bottom where they are easy to miss.
    ...(unranked.length
      ? [{
          id: "none" as const,
          label: `No tier · ${unranked.length}`,
          value: namedValue(unranked),
          unknownWhy: "The board did not return contact counts for these firms.",
        } satisfies CompareItem]
      : []),
  ];

  const visible = tier === "all" ? accounts : (byTier.get(tier) ?? []);
  const shown = visible.slice(0, window);
  const shownIds = useMemo(() => new Set(shown.map(a => a.id)), [shown]);
  const selected = accounts.find(a => a.id === selectedId) ?? null;

  /* THE ENDORSEMENT. The firm whose next action is furthest past its date, and
     it says by how many days — a claim you can check against the row.

     Worded as an OBSERVATION, never as an instruction. THE LINE: this app does
     not tell anyone to contact anyone; it reports that a date recorded by a
     human has passed. A do-not-pitch firm is excluded outright — putting the
     register's own "never pitch this one" record at the top of the board under
     an accent border is exactly the mistake the flag exists to prevent.

     ITS POPULATION IS THE WHOLE SCOPE (`visible`), NOT THE WINDOW (`shown`).
     The first cut ranged over `shown`, so the unqualified claim "Furthest past
     its date." actually meant "furthest past its date of the 14 rows above the
     fold" — press Show more on a 35-firm acquirer layer and a firm forty days
     later can appear beneath it wearing nothing. A figure's population has to
     match the sentence around it: this sentence names no subset, so it is
     computed over the scope the criteria bar, the chips and the strip already
     state, and the caveat below says exactly that.
     The cost of choosing the full population is that the winner can now sit
     past the window, where its band cannot render because its row is not on
     screen. That is handled rather than tolerated — `endorsedOffWindow` puts
     the firm and the gap on the expander, so the endorsement is never silently
     missing; it is either on its row or named at the fold. */
  const endorsed = useMemo(() => {
    let worst: CrmAccount | null = null;
    let worstDays = 0;
    for (const a of visible) {
      if ((a.disqualified ?? "").trim()) continue;
      const d = daysUntil(a.next_action_on);
      if (d == null || d > 0) continue;
      if (worst == null || -d > worstDays) { worst = a; worstDays = -d; }
    }
    return worst ? { row: worst, days: worstDays } : null;
  }, [visible]);

  const endorsedOffWindow = endorsed != null && !shownIds.has(endorsed.row.id);

  /* ── the criteria bar ── */

  const layerIdx = filters.kind === "service_provider" ? 1 : filters.kind === "all" ? 2 : 0;
  const cycleLayer = () => {
    // `onToggle` clears a key when the value already matches, so the last step
    // of the cycle re-presses "all" to return to the default acquirer layer.
    if (layerIdx === 0) onToggle("kind", "service_provider");
    else if (layerIdx === 1) onToggle("kind", "all");
    else onToggle("kind", "all");
  };

  const stageIdx = filters.stage ? CRM_STAGES.indexOf(filters.stage as CrmStage) : -1;
  const cycleStage = () => {
    const next = CRM_STAGES[stageIdx + 1];
    if (next) onToggle("stage", next);
    else if (filters.stage) onToggle("stage", filters.stage); // past the end → clear
  };

  const cells: CriteriaCell[] = [
    {
      label: "Looking at",
      grow: 1.1,
      value: `${LAYERS[layerIdx].label}${filters.archived ? " · archived" : ""}`,
      onClick: cycleLayer,
    },
    {
      label: "Stage",
      grow: 1,
      value: filters.stage ? (STAGE_LABEL[filters.stage as CrmStage] ?? filters.stage) : "Any",
      onClick: cycleStage,
    },
    {
      label: "Tier",
      grow: 0.9,
      // A tier filter set over on the Board narrows what the SERVER returns,
      // which would leave every other cell in the strip reading 0 for a reason
      // that is not visible here. So the cell names it and clicking clears it.
      value: filters.tier
        ? `${filters.tier} — board filter`
        : tier === "all" ? "Any" : tier === "none" ? "No tier" : tier,
      onClick: filters.tier ? () => onToggle("tier", filters.tier as string) : undefined,
    },
    {
      label: "Search",
      grow: 1.5,
      value: (
        <input
          value={query}
          onChange={e => onQuery(e.target.value)}
          placeholder="Firm, trade, city or note"
          style={searchInput}
          aria-label="Search client firms"
        />
      ),
    },
  ];

  const anyFilter = activeChips.size > 0 || !!filters.tier || !!filters.stage || !!filters.kind;

  return (
    <div style={wrap}>
      <CriteriaBar cells={cells} />
      <ChipRow
        chips={chips}
        activeIds={activeChips}
        onPick={pickChip}
        right={anyFilter ? (
          <button
            type="button"
            style={clearBtn}
            onClick={() => {
              if (filters.due) onToggle("due", true);
              if (filters.moment) onToggle("moment", filters.moment);
              if (filters.dfw) onToggle("dfw", filters.dfw);
              if (filters.archived) onToggle("archived", true);
              if (filters.tier) onToggle("tier", filters.tier);
              if (filters.stage) onToggle("stage", filters.stage);
              if (filters.kind) onToggle("kind", filters.kind);
              setTier("all");
              setWindow(WINDOW);
            }}
          >
            Clear the scope
          </button>
        ) : undefined}
      />
      <CompareStrip
        items={strip}
        activeId={tier}
        onPick={id => { setTier(id as StripId); setWindow(WINDOW); }}
      />

      <div style={{ marginTop: 16 }}>
        <ListDetail
          detailEmpty={
            /* THE EMPTY PANEL IS THE FUNNEL INBOX (2026-08-16). "Select a row"
               was a slot with nothing to say; the leads the practice site has
               been capturing into a table nobody worked (§3 gap 2) are the
               right thing to say. Converting selects nothing automatically —
               the practitioner lands on a fresh account by finding it in the
               list, which also proves the conversion actually wrote a row. */
            <div>
              <p style={{ margin: "0 0 10px", fontSize: 12.5, color: T.muted, lineHeight: 1.6 }}>
                Pick a firm to see who is named there, what was said last, and
                why it ranks where it does. Meanwhile — what the Acquisition
                Engine has brought in:
              </p>
              <LeadsPanel onConverted={() => onLeadConverted()} />
            </div>
          }
          detail={selected ? (
            <div style={detailScroll}>
              {/* Keyed by id so switching firms REMOUNTS. Without it the hook
                  keeps the previous firm's contacts and touches on screen
                  under the new firm's summary card until the fetch lands —
                  a wrong attribution, which is the one error this app cannot
                  make casually. */}
              <ClientDetail
                key={selected.id}
                account={selected}
                onOpenBoard={onOpenBoard}
                onOpenDeal={onOpenDeal}
                onOpenSourcing={onOpenSourcing}
              />
            </div>
          ) : null}
          list={
            <div>
              {tier === "all" ? (
                [...TIERS, "none" as const].map(t => {
                  const group = (byTier.get(t) ?? []).filter(a => shownIds.has(a.id));
                  if (!group.length) return null;
                  return (
                    <TierGroup
                      key={t}
                      title={t === "none" ? "No tier recorded" : `Tier ${t}`}
                      rows={group}
                      endorsed={endorsed}
                      selectedId={selectedId}
                      onSelect={setSelectedId}
                    />
                  );
                })
              ) : (
                <TierGroup
                  title={tier === "none" ? "No tier recorded" : `Tier ${tier}`}
                  rows={shown}
                  endorsed={endorsed}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              )}

              {visible.length === 0 && (
                <div style={noRows}>
                  Nothing matches this scope. {allCount} firm{allCount === 1 ? "" : "s"}{" "}
                  loaded in total — widen the search, clear a chip, or pick a
                  different tier on the strip.
                </div>
              )}

              {/* The endorsement is computed over the whole scope, so it can
                  land on a row the window has not reached. Naming it here is
                  what keeps the unqualified claim honest: the band is either
                  on its row or stated at the fold, never quietly absent. */}
              {endorsedOffWindow && (
                <div style={offWindowNote}>
                  Furthest past its date in this scope is{" "}
                  <strong style={{ color: T.ink }}>{endorsed!.row.firm}</strong>, due{" "}
                  {endorsed!.days} day{endorsed!.days === 1 ? "" : "s"} ago — below the
                  window. Show more to reach its row.
                </div>
              )}

              {visible.length > window && (
                <Expander
                  dir="down"
                  label={`Show ${Math.min(WINDOW, visible.length - window)} more of ${visible.length}`}
                  onClick={() => setWindow(w => w + WINDOW)}
                />
              )}
              {window > WINDOW && (
                <Expander
                  dir="up"
                  label={`Collapse back to ${WINDOW}`}
                  onClick={() => setWindow(WINDOW)}
                />
              )}

              {/* P9 — the honest footer. The ordering below is read off
                  `GET /api/crm/accounts`, not off what would sound tidy. */}
              <RankingNote
                ordering={
                  "The server orders the whole board by tier — A, then B, C, D, with any firm that has no tier last — then by score highest first, then by firm name. " +
                  (tier === "all"
                    ? "This view groups those rows under their tier heading and keeps the server's order inside each group. Nothing is re-ranked here."
                    : "One tier is showing; the rows keep the server's order — score highest first, then firm name. Nothing is re-ranked here.")
                }
                caveats={[
                  "Tier is not always a computed tier. The shipped outreach plan writes its own A/B/C conviction grade straight into the column, and a re-score only overwrites it once you press Re-score on the Board — which is also why a firm can carry a tier and no score.",
                  "Score comes from house/leads.ts. A firm that has never been scored prints “Not available”, never a zero — a zero score is a real value here and means a human disqualified the firm.",
                  /* CONDITIONAL, and it has to be. `countKnown` was added so
                     the chips stop asserting a fact about a column nothing has
                     measured — and then this sentence went on asserting it
                     unconditionally, three inches away. IMPORTABLE in
                     server/routes/crm.ts DOES include buyer_moment, so a CSV
                     import populates it; after one, "Flow-constrained · 4"
                     would sit directly above a caveat swearing the field is
                     never populated. The screen would be refuting itself. */
                  flowValue === null
                    ? "Buy signal (buyer_moment) is 35 of the ~100 points in that score, and not one loaded firm carries it — nothing in the app writes it except a CSV import with that column. So every firm here is sitting on the unknown floor of 8, and the ranking you are reading is being decided by the other 65 points."
                    : "Buy signal (buyer_moment) is 35 of the ~100 points in that score. Some firms here carry one and some do not; the ones that do not sit on the unknown floor of 8, so the ranking mixes measured and unmeasured firms. Only a CSV import with a buyer_moment column writes it.",
                  "The highlighted firm is simply the one whose recorded next-action date is furthest in the past — measured across every firm in the scope you are looking at, not only the rows above the fold. If it falls below the window it is named on the “Show more” row instead of being dropped. It is not a judgement about the firm, and firms the register marks do-not-pitch are never highlighted.",
                  "Chip and strip numbers count the rows currently loaded, so they narrow as you narrow the scope: with “Due now” on, every other number is a count within the due set.",
                  "A chip showing “—” is never a zero, but the two dashes here mean different things. On Flow-constrained and DFW it means no loaded row carries that field at all, so there is nothing to count. On Archived it means the archived rows were not requested from the server, so they are simply not in this browser — turn the scope on and the count appears.",
                  "Nothing here is sponsored or promoted, and nothing here contacts anybody. The board records a relationship; every message is still written and sent by a person.",
                ]}
              />
            </div>
          }
        />
      </div>
    </div>
  );
}

/* ── one tier group ───────────────────────────────────────────────────── */

function TierGroup({ title, rows, endorsed, selectedId, onSelect }: {
  title: string;
  rows: CrmAccount[];
  endorsed: { row: CrmAccount; days: number } | null;
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <div style={{ marginBottom: 2 }}>
      <GroupHeader title={title} columns={["Score", "People", "Next"]} />
      {rows.map(a => {
        const isEndorsed = endorsed?.row.id === a.id;
        const d = daysUntil(a.next_action_on);
        const people = contactCount(a);
        const blocked = (a.disqualified ?? "").trim();

        return (
          <div key={a.id}>
            {isEndorsed && (
              <Endorsement
                claim="Furthest past its date."
                grounds={`Next action was due ${endorsed!.days} day${endorsed!.days === 1 ? "" : "s"} ago — ${a.next_action ?? "no action text recorded"}.`}
              />
            )}
            <ResultRow
              /* Law 3 (CRM_WORKFLOW_SPEC.md): an open pursuit with no dated
                 next step is flagged where it appears — the dot, not a word,
                 because the row's words belong to the firm. */
              anchor={needsNextStep(a)
                ? <><span style={redDot} title="No next step set" aria-label="No next step set" />{a.firm}</>
                : a.firm}
              sub={subLine(a)}
              // The register's own do-not-pitch mark, on the row rather than
              // three clicks in — the whole reason it is recorded is that it
              // must be seen BEFORE anyone drafts anything.
              //
              // WHERE IT CAN ACTUALLY APPEAR, corrected: an earlier note here
              // claimed "11 of the 81 shipped organisations carry it", which is
              // true of the seed and misleading about this screen.
              // `crmOutreachSeed.ts` sets `disqualified` only for the
              // ECOSYSTEM_DO_NOT_PITCH bucket, and `kindFor()` files that
              // bucket as kind 'other' — while this screen's layers are
              // acquirer (the default), service_provider and all. So NONE of
              // those 11 is reachable from the default board; they appear only
              // under "Everyone on file". On the acquirer and capital layers
              // the pill means something narrower and more recent: a human
              // pressed Disqualify on the Board, the one other writer of the
              // column (`PATCH /api/crm/accounts/:id`), which also drops the
              // firm's score to 0.
              identity={blocked ? <span style={blockPill}>Do not pitch</span> : undefined}
              endorsed={isEndorsed}
              selected={selectedId === a.id}
              onClick={() => onSelect(a.id)}
              values={[
                {
                  // null = never scored. 0 = scored and disqualified. The kit
                  // prints "Not available" for the first and "0" for the
                  // second, which is the whole difference.
                  text: a.score == null ? null : String(a.score),
                  lead: selectedId === a.id,
                  note: a.score === 0 ? "disqualified" : undefined,
                },
                {
                  text: people == null ? null : String(people),
                  note: people === 0 ? "research first" : undefined,
                },
                {
                  // `next_action_on` NULL is a KNOWN absence — nobody has put a
                  // date on this firm — not a missing figure, so it says so in
                  // words rather than borrowing the "Not available" state that
                  // means "we could not find out".
                  text: a.next_action_on ? dueLabel(a.next_action_on) : "none set",
                  note: d != null && d <= 0 ? "overdue" : undefined,
                },
              ]}
            />
          </div>
        );
      })}
    </div>
  );
}

/* ── the detail panel ─────────────────────────────────────────────────── */

/**
 * Reuses `useCrmAccount` — the same hook the Board's `DetailPane` calls, so no
 * second data path exists for the same record.
 *
 * READ, plus the two hand-offs that keep the chain alive (a deal, a search).
 * Every EDIT — stage, next action, last evidenced deal, adding a person,
 * logging a touch, disqualifying — stays on the Board, one button away, rather
 * than being implemented a second time here where the two copies could drift.
 */
function ClientDetail({ account, onOpenBoard, onOpenDeal, onOpenSourcing }: {
  account: CrmAccount;
  onOpenBoard: (id: number) => void;
  onOpenDeal: (dealId: number, name?: string) => void;
  onOpenSourcing: () => void;
}) {
  const { account: fetched, contacts, activity, deals, searches, error } = useCrmAccount(account.id);

  /* THE TRAP THIS `landed` FLAG EXISTS FOR — and it was live in the first cut.
     `useCrmAccount` returns `{...(data ?? {account:null, contacts:[], activity:[],
     deals:[], searches:[]}), loading, error}` (useCrmAccounts.ts:250), so EMPTY
     ARRAYS are what it hands back for THREE different facts: the fetch
     succeeded and the firm genuinely has nobody on file; the fetch FAILED (its
     `.catch` does `setData(null)`); and the first render before the effect has
     even fired. On the failure path `loading` is already false, so a
     `loading && !contacts.length` guard falls straight through to the empty
     branch and the panel titles itself "People · 0" and prints "No named
     contact" — a confident negative about a firm we were told nothing about.
     The Board never showed this because `Clients.tsx` gates its whole detail
     body on the fetched `account`; this panel takes `account` from the LIST ROW,
     so everything below renders whether or not the request came back.

     `fetched` — the hook's own `account`, which is null unless a payload landed —
     is the ONLY field that separates the three. Count and state nothing until
     it is non-null. */
  const landed = fetched != null;

  const blocked = (account.disqualified ?? "").trim();
  const d = daysUntil(account.next_action_on);
  const moment = account.buyer_moment ?? "unknown";
  const place = [account.hq_city, account.hq_state].filter(Boolean).join(", ");

  return (
    <>
      <SummaryCard
        kicker={SEGMENT_LABEL[account.segment ?? "unknown"] ?? account.segment ?? "Segment not recorded"}
        value={account.firm}
        badge={STAGE_LABEL[account.stage as CrmStage] ?? account.stage}
        sub={[
          account.tier ? `Tier ${account.tier}` : "No tier",
          // Never a bare "0" standing in for "we never ran the scorer".
          account.score == null ? "not yet scored" : `score ${account.score}`,
          place || null,
          (() => {
            const ag = stageAging(account.stage, account.stage_entered_at);
            return ag ? `${ag.days}d in stage` : null;
          })(),
          account.stage === "lost" && account.loss_reason
            ? `lost — ${LOSS_LABEL[account.loss_reason as never] ?? account.loss_reason}`
            : null,
        ].filter(Boolean).join(" · ")}
        actionLabel="Open the full dossier"
        onAction={() => onOpenBoard(account.id)}
      />

      {blocked && (
        <div style={{ marginTop: 12 }}>
          <InfoBanner tone="caution">
            <b>Do not pitch.</b> {blocked}
          </InfoBanner>
        </div>
      )}

      {account.next_action && (
        <div style={{ marginTop: 12 }}>
          <InfoBanner tone={d != null && d <= 0 ? "caution" : "info"}>
            <b>Next:</b> {account.next_action}
            {account.next_action_on
              ? ` · ${dueLabel(account.next_action_on)}`
              : " · no date set"}
          </InfoBanner>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 12 }}>
          <InfoBanner tone="caution">
            Could not load this firm’s people and history: {error}
          </InfoBanner>
        </div>
      )}

      {/* THE BUY SIGNAL — the column that came out of the table. It is here
          rather than on the row because on every board in existence it reads
          the same, and because the useful thing to say about it is a paragraph,
          not a pill. */}
      {/* THE ENGAGEMENT — the relationship's most load-bearing fact, so it
          reads before the diagnostics: is this firm a mandate or a prospect,
          and what does the retainer stand at. */}
      <DetailCard title="Engagement">
        <EngagementCard accountId={account.id} />
      </DetailCard>

      <DetailCard title="Buy signal">
        <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink }}>
          {MOMENT_LABEL[moment] ?? "Unknown"}
        </div>
        <p style={p}>{MOMENT_WHY[moment] ?? "not yet diagnosed"}</p>
        {account.buyer_moment == null && (
          <p style={{ ...p, color: T.muted2 }}>
            {/* "like every other firm on the board" was a whole-population
                claim inferred from ONE row's null — the same defect the chips
                were just fixed for, left standing in a sentence. This card can
                only see this firm, so it only speaks about this firm. */}
            Not recorded for this firm. It is worth 35 of the ~100 points in the
            score, so this firm is carrying the unknown floor of 8. The only
            writer is a CSV import with a <code style={code}>buyer_moment</code>{" "}
            column; the outreach plan’s sheets do not have one.
          </p>
        )}
      </DetailCard>

      {/* Required by the Board's own honesty rule: the score is never shown
          bare. It is shown on the row, so its working has to be reachable. */}
      <DetailCard title="Why it ranks here">
        {account.score_detail ? (
          <p style={p}>{account.score_detail}</p>
        ) : (
          <p style={p}>
            No scoring detail on file — this firm has not been through the
            scorer. Its tier is whichever grade the register itself asserted.
          </p>
        )}
        <p style={{ ...p, color: T.muted2, marginBottom: 0 }}>
          Pitch: <strong style={{ color: T.ink3 }}>{PITCH_LABEL[account.pitch ?? "unknown"]}</strong>
          {" · "}Evidence: {GRADE_LABEL[account.grade ?? "unknown"]}
          {account.last_deal_on
            ? ` · last evidenced deal ${String(account.last_deal_on).slice(0, 10)}`
            : " · no dated deal evidence"}
        </p>
      </DetailCard>

      {/* The count is part of the title, so the title itself is a claim: it
          appears only once a payload has landed. */}
      <DetailCard title={`People${landed ? ` · ${contacts.length}` : ""}`}>
        {!landed ? (
          <Unresolved error={error} what="the people on this firm" />
        ) : contacts.length === 0 ? (
          <p style={p}>
            No named contact. This is a research task before it is a lead — and
            it is the cheapest way to move the firm up the board.
          </p>
        ) : contacts.map(c => (
          <div key={c.id} style={line}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>
              {c.name}
              {c.role && (
                <span style={{ color: T.blue, fontWeight: 600 }}> · {ROLE_LABEL[c.role] ?? c.role}</span>
              )}
              {c.is_primary && <span style={{ color: T.muted2, fontWeight: 400 }}> · primary</span>}
            </div>
            {c.title && <div style={{ fontSize: 12, color: T.muted }}>{c.title}</div>}
            {(c.email || c.phone) && (
              <div style={{ fontSize: 12, color: T.muted2 }}>
                {[c.email, c.phone].filter(Boolean).join(" · ")}
              </div>
            )}
            {!c.email && (
              <div style={{ fontSize: 11.5, color: T.faint }}>
                no email on file — cannot be mailed or assigned
              </div>
            )}
            {/* An unsubscribe is permanent and set once. The outreach queue
                already refuses these; saying so here means you learn it while
                reading the firm rather than when a send is blocked. */}
            {c.unsubscribed_at && (
              <div style={{ fontSize: 11.5, color: T.amber, fontWeight: 600 }}>
                unsubscribed {String(c.unsubscribed_at).slice(0, 10)} — never contacted again
              </div>
            )}
          </div>
        ))}
      </DetailCard>

      <DetailCard title="Recent activity">
        {!landed ? (
          // "Never contacted" is the strongest negative on this panel, so it is
          // the one that must never be printed off an unanswered request.
          <Unresolved error={error} what="this firm’s touch history" />
        ) : activity.length === 0 ? (
          // Stated outright, never a dash — the Board's rule, kept.
          <p style={p}>Never contacted.</p>
        ) : (
          <>
            {activity.slice(0, 6).map(v => (
              <div key={v.id} style={line}>
                <div style={{ fontSize: 11.5, color: T.muted2 }}>
                  {v.kind}{v.direction ? ` · ${v.direction}` : ""} ·{" "}
                  {touchLabel(v.occurred_at) ?? String(v.occurred_at).slice(0, 10)}
                </div>
                {v.subject && <div style={{ fontSize: 12.5, fontWeight: 600 }}>{v.subject}</div>}
                {v.body && <div style={{ fontSize: 12.5, color: T.ink3, lineHeight: 1.55 }}>{v.body}</div>}
              </div>
            ))}
            {activity.length > 6 && (
              <p style={{ ...p, marginBottom: 0 }}>
                {activity.length - 6} older touch{activity.length - 6 === 1 ? "" : "es"} —
                the full history is in the dossier.
              </p>
            )}
          </>
        )}
      </DetailCard>

      {/* The chain the Board already had: client → deal, client → search. Read
          only here; both hand off to the surface that owns them.

          Same `landed` gate. This card had NO loading branch of any kind, so on
          a failed fetch it asserted two negatives at once — no deals opened and
          no buy-box set up — about a firm that may well have both. */}
      <DetailCard title="Work running for them">
        {!landed ? (
          <Unresolved error={error} what="the work running for this firm" />
        ) : (<>
        {deals.length === 0 ? (
          <p style={p}>No deals opened for them yet.</p>
        ) : deals.map(dl => (
          <button
            key={dl.id}
            type="button"
            onClick={() => onOpenDeal(dl.id, dl.business_name || dl.name || undefined)}
            style={linkRow}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: T.blue }}>
              {dl.business_name || dl.name} →
            </div>
            <div style={{ fontSize: 11.5, color: T.muted2 }}>
              {[dl.current_gate, dl.status, dl.next_action].filter(Boolean).join(" · ")}
            </div>
          </button>
        ))}

        {searches.length === 0 ? (
          <p style={{ ...p, marginBottom: 0 }}>
            No buy-box set up for them. Target screening lives in the local
            workspace now (scripts/studio/screen.mts) — a buy-box built there
            lands its candidates here when the deals are created.
          </p>
        ) : /* NOT A LINK ANY MORE (2026-08-16). These rows used to
               nav.go("sourcing"), and Phase A deleted that screen — target
               discovery lives in the local workspace (screen.mts) now. A
               button routing to a deleted screen falls through to the default
               view and reads as a broken app, so each thesis renders as a
               RECORD: the name, the shape, the counts. */
        searches.map(s => (
          <div key={s.id} style={linkRow}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{s.name}</div>
            <div style={{ fontSize: 11.5, color: T.muted2 }}>
              {[
                s.industry, s.geography,
                `${s.candidate_count} candidate${Number(s.candidate_count) === 1 ? "" : "s"}`,
                s.is_active === false ? "paused" : null,
              ].filter(Boolean).join(" · ")}
            </div>
          </div>
        ))}

        {/* THE HANDOFF, PROMOTED TO A CEREMONY (2026-08-16 late, Paul adopted
            the spec whole: deals are created only at the IoI). Naming a target
            here no longer opens a B0 deal — it files the company as a TARGET
            under this client (sourced), and the Targets tab walks it
            Sourced → … → IoI decision → Promote, where the deal is born at B2
            with the record frozen behind it. */}
        <NewTargetRow accountId={account.id} />
        </>)}
      </DetailCard>

      {(account.evidence || account.source_url) && (
        <DetailCard title="Evidence">
          {account.evidence && <p style={p}>{account.evidence}</p>}
          {account.source_url && (
            <a
              href={account.source_url}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 12, color: T.blue, wordBreak: "break-all" }}
            >
              {account.source_url}
            </a>
          )}
        </DetailCard>
      )}
    </>
  );
}

/* ── helpers ──────────────────────────────────────────────────────────── */

/**
 * What a detail card says when it has NOT been told the answer.
 *
 * Two states, one component, because they must never be confused with the
 * third: a failed request says it failed and names the reason; a request still
 * in flight says so. NEITHER of them is allowed to borrow the vocabulary of
 * "none on file" — which is what this panel did before, because the hook hands
 * back the same empty array for all three.
 */
/**
 * One input, one button: name a target COMPANY and it files under this client
 * as Sourced on the Targets tab. Deals are created only at the IoI decision
 * (the promotion — CRM_WORKFLOW_SPEC.md), so nothing here opens a deal; the
 * server still owns every refusal (no firm name → 400).
 */
function NewTargetRow({ accountId }: { accountId: number }) {
  const [target, setTarget] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const create = async () => {
    if (busy) return;
    setBusy(true); setErr(null); setDone(null);
    try {
      const r = await fetch(`/api/crm/targets`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ firm: target.trim(), client_account_id: accountId }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) { setErr(j?.error || `Could not add the target (${r.status})`); return; }
      setDone(`${j.firm} filed under this client as Sourced — work it on the Targets tab, promote it to a deal at the IoI.`);
      setTarget("");
    } catch {
      setErr("The network dropped — nothing was created. Try again.");
    } finally { setBusy(false); }
  };

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", gap: 6 }}>
        <input
          value={target}
          onChange={e => setTarget(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && target.trim()) create(); }}
          placeholder="Target company — files under this client on the Targets tab"
          style={newDealInput}
        />
        <button
          type="button"
          onClick={create}
          disabled={busy || !target.trim()}
          style={{ ...newDealBtn, opacity: target.trim() && !busy ? 1 : 0.5 }}
        >
          {busy ? "Adding…" : "Add a target"}
        </button>
      </div>
      {err && <p style={{ margin: "6px 0 0", fontSize: 12.5, color: T.amber }}>{err}</p>}
      {done && <p style={{ margin: "6px 0 0", fontSize: 12.5, color: T.green }}>{done}</p>}
    </div>
  );
}

function Unresolved({ error, what }: { error: string | null; what: string }) {
  return (
    <p style={p}>
      {error
        ? `Could not load ${what}: ${error}. Nothing came back, so this is not a record of “none” — reopen the firm, or open the full dossier.`
        : "Loading…"}
    </p>
  );
}

/**
 * How many contacts a firm has, or `null` when the payload did not say.
 *
 * `GET /api/crm/accounts` computes this as a bare `SELECT COUNT(*)` with no
 * `::int` cast, and postgres-js returns int8 as a STRING to avoid precision
 * loss — so the value arriving here is `"0"`, which is truthy. Coercing is not
 * defensive tidiness; a plain falsiness test on this field reads "no contacts"
 * as "has contacts" and hides the single cheapest fix on the whole board.
 *
 * Absent stays `null` rather than collapsing to 0: "we counted, there are
 * none" and "we were not told" must not render alike.
 */
function contactCount(a: CrmAccount): number | null {
  const raw = a.contact_count as unknown;
  if (raw === null || raw === undefined || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/**
 * How many loaded rows match a value in a column — or `null` when NOT ONE row
 * carries that column at all.
 *
 * The same shape as `namedValue` below, and for the same reason: a count of
 * zero over a field nobody has ever written is not a measurement, and printing
 * it as `0` states a fact about the world that we have not established. Blank
 * and whitespace both read as absent, because the CSV importer writes `''` for
 * an empty cell and a `''` is not a recorded answer.
 */
function countKnown(
  rows: CrmAccount[],
  read: (a: CrmAccount) => string | null | undefined,
  match: string,
): string | null {
  let known = 0;
  let hit = 0;
  for (const a of rows) {
    const v = (read(a) ?? "").trim();
    if (!v) continue;
    known++;
    if (v === match) hit++;
  }
  if (rows.length > 0 && known === 0) return null;
  return String(hit);
}

/**
 * The strip's second number: how many firms in a group carry a named person.
 * `null` only when NOT ONE row in the group carried a count — the genuine
 * "we were not told" case. A group where every count is a real 0 prints `0
 * named`, because that is a fact we hold.
 */
function namedValue(group: CrmAccount[]): string | null {
  let known = 0;
  let named = 0;
  for (const a of group) {
    const n = contactCount(a);
    if (n == null) continue;
    known++;
    if (n > 0) named++;
  }
  if (group.length > 0 && known === 0) return null;
  return `${named} named`;
}

/** The consequence line under the firm name: what it is, where it is, and the
 *  two research gaps worth seeing without opening anything. */
function subLine(a: CrmAccount): ReactNode {
  const bits = [
    SEGMENT_LABEL[a.segment ?? "unknown"] ?? a.segment,
    [a.hq_city, a.hq_state].filter(Boolean).join(", ") || null,
    a.dfw === "yes" ? "DFW" : null,
    a.grade === "directory" ? "directory only" : null,
    a.trades || null,
  ].filter(Boolean) as string[];
  /* Aging (law 6): days-in-stage on every row, coloured only when it means
     something — quiet grey under 14d, amber to 28d, red past that. A passed
     pursuit shows its verdict instead; closed stages never age. */
  const ag = stageAging(a.stage, a.stage_entered_at);
  const lost = a.stage === "lost" && a.loss_reason
    ? (LOSS_LABEL[a.loss_reason as never] ?? a.loss_reason) : null;
  return (
    <>
      {bits.join(" · ")}
      {ag && (
        <span style={{ color: ag.tone === "red" ? T.terra : ag.tone === "amber" ? T.amber : undefined }}>
          {bits.length ? " · " : ""}{ag.days}d in stage
        </span>
      )}
      {lost && <span>{bits.length ? " · " : ""}lost — {lost}</span>}
    </>
  );
}

/* ── styles ───────────────────────────────────────────────────────────── */

const wrap: CSSProperties = { padding: "16px 22px 40px", minWidth: 0 };

const searchInput: CSSProperties = {
  font: "inherit", fontSize: 14, fontWeight: 700, color: T.ink,
  background: "transparent", border: "none", outline: "none",
  padding: 0, width: "100%", minWidth: 0,
};

/* The detail panel scrolls independently of the list. `100vh - 150` clears the
   header, the mode tabs and the criteria block above it; the panel is sticky,
   so without a height cap a firm with a long touch history would run past the
   fold with no way to reach its end. */
const detailScroll: CSSProperties = {
  maxHeight: "calc(100vh - 190px)",
  overflowY: "auto",
  paddingRight: 4,
};

const noRows: CSSProperties = {
  padding: "26px 14px", border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden", background: T.white,
  fontSize: 12.5, color: T.muted, lineHeight: 1.6,
};

/* The line that carries the endorsement when its row is past the window. Sits
   directly above the expander, so the claim and the way to reach it read as
   one thing. */
const offWindowNote: CSSProperties = {
  padding: "10px 14px", borderLeft: `3px solid ${T.blue}`, background: T.blueBg,
  fontSize: 12, color: T.muted, lineHeight: 1.55,
};

/* Radius 10 — the Carta exception is buttons and inputs, and this is a button. */
const clearBtn: CSSProperties = {
  font: "inherit", fontSize: 12, fontWeight: 600, color: T.muted,
  background: T.white, border: `1px solid ${T.inputBd}`, borderRadius: 10,
  padding: "6px 12px", cursor: "pointer",
};

const blockPill: CSSProperties = {
  fontSize: 9.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase",
  background: T.amberBg, color: T.amber, padding: "2px 6px", whiteSpace: "nowrap",
};

/* Law 3's indicator: an open pursuit with no dated next step. Inline-block so
   it rides the anchor's baseline without disturbing the ellipsis. */
const redDot: CSSProperties = {
  display: "inline-block", width: 8, height: 8, borderRadius: 999,
  background: T.terra, marginRight: 7, verticalAlign: "baseline", flex: "none",
};

const p: CSSProperties = { margin: "0 0 8px", fontSize: 12.5, color: T.muted, lineHeight: 1.6 };

/* The transcription's control pair: filled cell + filled-green action. */
const newDealInput: CSSProperties = {
  flex: 1, minWidth: 0, font: "inherit", fontSize: 13.5, color: T.ink,
  background: T.track, border: "none", borderRadius: 8, padding: "9px 11px",
  outline: "none",
};
const newDealBtn: CSSProperties = {
  font: "inherit", fontSize: 13.5, fontWeight: 700, color: "#fff",
  background: T.blue, border: "none", borderRadius: 8, padding: "9px 15px",
  cursor: "pointer", flex: "none",
};

const code: CSSProperties = { fontSize: 11.5, background: T.track, padding: "1px 4px" };

const line: CSSProperties = { padding: "7px 0", borderBottom: `1px solid ${T.rowDiv}` };

const linkRow: CSSProperties = {
  display: "block", width: "100%", textAlign: "left", cursor: "pointer",
  background: "transparent", border: "none", font: "inherit",
  padding: "7px 0", borderBottom: `1px solid ${T.rowDiv}`,
};
