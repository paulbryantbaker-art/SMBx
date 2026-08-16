/**
 * DEALS · LIST — the pilot for the Trainline grammar.
 *
 * Paul, 2026-08-15: *"drop atlas"*, with four thetrainline.com screenshots.
 * Plan: `APP_REDESIGN_TRAINLINE.md`. Primitives: `../kit`.
 *
 * ── WHY DEALS IS THE PILOT ──────────────────────────────────────────────
 * It is the densest screen, the one Paul lives in, and it already has every
 * piece of data the grammar needs — stage buckets, counts, a summary hook, a
 * next-action date. If the grammar does not work here it will not work
 * anywhere, and we learn that in one screen rather than six.
 *
 * ── ADDITIVE, NOT A REPLACEMENT (yet) ───────────────────────────────────
 * This lands as a THIRD view beside Board and Table rather than overwriting
 * the table, for two reasons. The plan's §5 recommends keeping the board one
 * release so the two can be compared honestly rather than from memory. And the
 * table carries bulk archive — real, load-bearing, 11 foreign keys deep — which
 * has nothing to do with the redesign and should not be rewritten in the same
 * change that rewrites the layout.
 *
 * ── WHAT IT DOES THAT THE TABLE DOES NOT ────────────────────────────────
 *   · CHIPS CARRY THEIR NUMBER. `Due · 4`, not `Due`. The reference's first
 *     chip reads "Train · $104.88" and that is the whole idea: the filter
 *     previews its own result, so you can decide not to click it.
 *   · THE STAGE STRIP compares all five stages at once — count and capital —
 *     so you read the shape of the pipeline without opening the board.
 *   · SELECTING A DEAL FILLS A RIGHT PANEL instead of expanding the row.
 *     Row-expansion pushes everything below it down the page, which is why you
 *     lose your place; a panel changes one region.
 *   · THE ENDORSEMENT BAND CARRIES ITS GROUNDS. "Needs you first — overdue by
 *     6 days", never a bare "Recommended".
 *   · A MISSING FIGURE PRINTS "Not available". Never a zero, never a blank.
 *   · THE LIST STATES HOW IT IS ORDERED, at the bottom, in prose.
 *
 * ── NO NEW DATA PATH ────────────────────────────────────────────────────
 * Everything arrives as props from `Deals.tsx`, which already filtered it. This
 * file fetches nothing and decides nothing that is not presentation.
 */
import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { T } from "../atlasTokens";
import {
  CriteriaBar, ChipRow, CompareStrip, ListDetail, GroupHeader, ResultRow,
  Endorsement, Expander, RankingNote, SummaryCard, DetailCard, InfoBanner,
  Page, Sheet,
  type Chip, type CompareItem,
} from "../kit";
import { PIPELINE_STAGES, type PipelineStageId } from "../../../../lib/pipelineStages";
import type { MobileStageRow } from "../../../../hooks/useMobileDeals";
import { ValuationPanel } from "./ValuationPanel";
import { CapitalPanel } from "./CapitalPanel";
import { ScenarioPanel } from "./ScenarioPanel";
import { DealTasksCard } from "./DealTasksCard";
import type { AddressBookContact } from "../../../../hooks/useDealTasks";
import { GateStackPanel } from "./GateStackPanel";
import { KeyDatesCard } from "./KeyDatesCard";
import { daysUntil, dueLabel } from "../../../../lib/crm";

/** How many rows before the window closes. The Expander widens it. */
const WINDOW = 12;

export function DealsList({
  rows, allCount, query, onQuery, filter, onFilter, clientCut, clientFirms,
  onClientCut, onOpen, scopeLabel, addressBook,
}: {
  /** Already filtered by Deals.tsx — one filter pass, shared with the board. */
  rows: MobileStageRow[];
  allCount: number;
  query: string;
  onQuery: (q: string) => void;
  filter: "all" | "watch" | "due";
  onFilter: (f: "all" | "watch" | "due") => void;
  clientCut: string;
  clientFirms: string[];
  onClientCut: (c: string) => void;
  onOpen: (row: MobileStageRow) => void;
  scopeLabel: string;
  /** The CRM contact book — who a deal task can be assigned and emailed to. */
  addressBook: AddressBookContact[];
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [stage, setStage] = useState<PipelineStageId | "all">("all");
  const [window, setWindow] = useState(WINDOW);

  /* ── the numbers the chips and the strip carry ──────────────────────
     Computed here because they are presentation of the set this component
     was handed — not judgements. Nothing here decides what a deal is worth;
     that is house/valuation.ts, reached through the panels below. */

  const dueCount = useMemo(
    () => rows.filter(r => (daysUntil(r.nextActionOn) ?? 1) <= 0).length,
    [rows],
  );
  const watchCount = useMemo(() => rows.filter(r => r.verdict === "watch").length, [rows]);

  const byStage = useMemo(() => {
    const m = new Map<PipelineStageId, MobileStageRow[]>();
    for (const s of PIPELINE_STAGES) m.set(s.id, []);
    for (const r of rows) m.get(r.stageId)?.push(r);
    return m;
  }, [rows]);

  const chips: Chip[] = [
    { id: "all", label: "All", value: String(rows.length) },
    { id: "watch", label: "Watch", value: watchCount ? String(watchCount) : null },
    { id: "due", label: "Due", value: dueCount ? String(dueCount) : null },
  ];

  /* THE STAGE STRIP. Each stage carries its count and its capital.
     A stage with deals but no priced deals shows `null` — which the strip
     renders as a visible "not known" mark rather than "$0". A pipeline stage
     full of unpriced targets is a real and common state, and printing $0 for
     it would be a fabricated figure in the most-read place on the screen. */
  const strip: CompareItem[] = [
    {
      id: "all",
      label: "All stages",
      value: String(rows.length),
    },
    ...PIPELINE_STAGES.map(s => {
      const group = byStage.get(s.id) ?? [];
      const priced = group.filter(r => (r.askingPrice ?? 0) > 0);
      const total = priced.reduce((sum, r) => sum + (r.askingPrice ?? 0), 0);
      return {
        id: s.id,
        label: `${s.title} · ${group.length}`,
        value: priced.length ? money(total) : null,
        prefix: priced.length ? "" : undefined,
        unknownWhy: group.length
          ? `${group.length} deal${group.length === 1 ? "" : "s"} here, none with an asking price yet.`
          : "No deals at this stage.",
      } satisfies CompareItem;
    }),
  ];

  const visible = useMemo(() => {
    const set = stage === "all" ? rows : (byStage.get(stage) ?? []);
    return set;
  }, [rows, byStage, stage]);

  const shown = visible.slice(0, window);
  const selected = rows.find(r => r.rawId === selectedId) ?? null;

  /* THE ENDORSEMENT. The most-overdue deal, and it says by how much.
     Never rendered without its grounds — the kit makes that structural (the
     `grounds` prop is required), because "Recommended" alone is an opinion and
     "overdue by 6 days" is a claim you can check. */
  const endorsed = useMemo(() => {
    let worst: MobileStageRow | null = null;
    let worstDays = 0;
    for (const r of shown) {
      const d = daysUntil(r.nextActionOn);
      if (d == null || d > 0) continue;
      if (worst == null || -d > worstDays) { worst = r; worstDays = -d; }
    }
    return worst ? { row: worst, days: worstDays } : null;
  }, [shown]);

  /* ── the criteria bar ── */
  const cells = [
    { label: "Looking at", value: scopeLabel, grow: 1 },
    {
      label: "Run for",
      value: clientCut === "all" ? "Every client" : clientCut === "none" ? "Unassigned" : clientCut,
      grow: 1,
      onClick: () => {
        const order = ["all", "none", ...clientFirms];
        const i = order.indexOf(clientCut);
        onClientCut(order[(i + 1) % order.length] ?? "all");
      },
    },
    { label: "Stage", value: stage === "all" ? "Any" : (PIPELINE_STAGES.find(s => s.id === stage)?.title ?? "Any"), grow: 1 },
    {
      label: "Search",
      grow: 1.4,
      value: (
        <input
          value={query}
          onChange={e => onQuery(e.target.value)}
          placeholder="Business, sector or client"
          style={searchInput}
          aria-label="Search deals"
        />
      ),
    },
  ];

  return (
    <Page>
      <CriteriaBar cells={cells} />
      <ChipRow chips={chips} activeId={filter} onPick={id => onFilter(id as typeof filter)} />
      <CompareStrip items={strip} activeId={stage} onPick={id => { setStage(id as PipelineStageId | "all"); setWindow(WINDOW); }} />

      <div style={{ marginTop: 16 }}>
        <ListDetail
          detailEmpty={
            <>
              Pick a deal to see its valuation and capital stack here — the list
              stays where it is.
            </>
          }
          detail={selected ? (
            <div style={detailScroll}>
              <SummaryCard
                kicker={selected.clientFirm ? `Run for ${selected.clientFirm}` : "Unassigned"}
                value={selected.askingPrice ? money(selected.askingPrice) : "No asking price"}
                badge={selected.gate}
                sub={selected.sub || undefined}
                actionLabel="Open the cockpit"
                onAction={() => onOpen(selected)}
              />

              {selected.nextAction && (
                <div style={{ marginTop: 12 }}>
                  <InfoBanner tone={(daysUntil(selected.nextActionOn) ?? 1) <= 0 ? "caution" : "info"}>
                    <b>Next:</b> {selected.nextAction}
                    {selected.nextActionOn && ` · ${dueLabel(selected.nextActionOn)}`}
                  </InfoBanner>
                </div>
              )}

              {/* THE SPECIALISTS SURFACE. First after the summary, because the
                  first question after "what is this deal" is "what needs doing
                  and by whom" — the CPA's QoE scope, counsel's redline, the
                  appraiser's site visit. Assign, email on a press, remind.
                  Third parties are corresponded with, never onboarded. */}
              <DetailCard title="Actions & specialists">
                <DealTasksCard dealId={selected.rawId} addressBook={addressBook} framed={false} />
              </DetailCard>

              {/* KEY DATES sit between the tasks and the money: after "what
                  needs doing" comes "by when" — the three deadlines here are
                  what Today's countdown reads. */}
              <DetailCard title="Key dates">
                <KeyDatesCard dealId={selected.rawId} />
              </DetailCard>

              {/* Valuation and Capital SELF-title (they also mount in the
                  cockpit, headerless) — an outer DetailCard title would print
                  the word twice, so these two cards carry none. */}
              <DetailCard>
                <ValuationPanel dealId={selected.rawId} sde={selected.sde} ebitda={selected.ebitda} />
              </DetailCard>

              <DetailCard>
                <CapitalPanel dealId={selected.rawId} askingCents={selected.askingPrice ?? null} />
              </DetailCard>

              {/* SCENARIOS sit after Capital because they RUN on it — debt
                  service comes from the client's stack, so the reading order
                  is worth → cost of money → what the returns look like. */}
              <DetailCard title="Scenarios">
                <ScenarioPanel
                  dealId={selected.rawId}
                  ebitda={selected.ebitda}
                  revenue={selected.revenue}
                  askingCents={selected.askingPrice ?? null}
                />
              </DetailCard>

              {/* THE GATE STACK (Phase D). DEFINITIVE rendered — see
                  GateStackPanel's header. It sits LAST in the detail column
                  because valuation and capital answer "what is it worth and
                  what does the money cost" before the stack answers "what
                  machinery runs on it". */}
              <DetailCard title="DEFINITIVE — the gate stack">
                <GateStackPanel dealId={selected.rawId} />
              </DetailCard>
            </div>
          ) : null}
          list={
            <div>
              <Sheet>
              {stage === "all" ? (
                PIPELINE_STAGES.map(s => {
                  const group = (byStage.get(s.id) ?? []).filter(r => shown.includes(r));
                  if (!group.length) return null;
                  return (
                    <StageGroup
                      key={s.id}
                      title={s.title}
                      rows={group}
                      endorsed={endorsed}
                      selectedId={selectedId}
                      onSelect={setSelectedId}
                      onOpen={onOpen}
                    />
                  );
                })
              ) : (
                <StageGroup
                  title={PIPELINE_STAGES.find(x => x.id === stage)?.title ?? "Stage"}
                  rows={shown}
                  endorsed={endorsed}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onOpen={onOpen}
                />
              )}

              </Sheet>
              {visible.length === 0 && (
                <div style={noRows}>
                  Nothing matches. {allCount} deal{allCount === 1 ? "" : "s"} in
                  total — widen the search or clear a chip.
                </div>
              )}

              {visible.length > window && (
                <Expander
                  dir="down"
                  label={`Show ${Math.min(WINDOW, visible.length - window)} more of ${visible.length}`}
                  onClick={() => setWindow(w => w + WINDOW)}
                />
              )}

              {/* P9 — the honest footer. Every ranked list in this app applies
                  an ordering nobody can see; this one says what it is. */}
              <RankingNote
                ordering={
                  stage === "all"
                    ? "Grouped by pipeline stage in deal order, then by the order the portfolio returns them — most recently touched first. Within a group nothing is re-ranked."
                    : "Shown in the order the portfolio returns them, most recently touched first. Nothing is re-ranked."
                }
                caveats={[
                  "The highlighted deal is simply the one whose next action is furthest overdue. It is not a judgement about the deal.",
                  "Stage capital sums only deals that carry an asking price. A stage with unpriced targets shows no total rather than a low one.",
                  "Nothing here is sponsored or promoted. There is nobody to promote it for.",
                ]}
              />
            </div>
          }
        />
      </div>
    </Page>
  );
}

/* ── one stage group ──────────────────────────────────────────────────── */

function StageGroup({ title, rows, endorsed, selectedId, onSelect, onOpen }: {
  title: string;
  rows: MobileStageRow[];
  endorsed: { row: MobileStageRow; days: number } | null;
  selectedId: number | null;
  onSelect: (id: number) => void;
  onOpen: (row: MobileStageRow) => void;
}) {
  return (
    <div style={{ marginBottom: 2 }}>
      <GroupHeader title={title} columns={["Ask", "EBITDA", "Next"]} />
      {rows.map(r => {
        const isEndorsed = endorsed?.row.rawId === r.rawId;
        const d = daysUntil(r.nextActionOn);
        return (
          <div key={r.rawId}>
            {isEndorsed && (
              <Endorsement
                claim="Needs you first."
                grounds={`Overdue by ${endorsed!.days} day${endorsed!.days === 1 ? "" : "s"} — ${r.nextAction ?? "no action recorded"}.`}
              />
            )}
            <ResultRow
              anchor={r.name}
              sub={r.sub || undefined}
              subLink={r.clientFirm ?? undefined}
              endorsed={isEndorsed}
              selected={selectedId === r.rawId}
              onClick={() => onSelect(r.rawId)}
              values={[
                { text: r.askingPrice ? money(r.askingPrice) : null, lead: selectedId === r.rawId },
                { text: r.ebitda ? money(r.ebitda) : null },
                {
                  text: r.nextActionOn ? dueLabel(r.nextActionOn) : null,
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

/* ── helpers ──────────────────────────────────────────────────────────── */

/** Cents in, short dollars out. House rule 10 — nothing here holds a float. */
function money(cents: number): string {
  const d = cents / 100;
  if (Math.abs(d) >= 1_000_000) return `$${(d / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (Math.abs(d) >= 1_000) return `$${Math.round(d / 1_000)}K`;
  return `$${Math.round(d)}`;
}

/* ── styles ───────────────────────────────────────────────────────────── */


const searchInput: CSSProperties = {
  font: "inherit", fontSize: 14, fontWeight: 700, color: T.ink,
  background: "transparent", border: "none", outline: "none",
  padding: 0, width: "100%", minWidth: 0,
};

/* The detail panel scrolls independently of the list. `100vh - 150` clears the
   header and the criteria block above it; the panel is sticky, so without a
   height cap a long valuation + capital stack would run past the fold with no
   way to reach its end. */
const detailScroll: CSSProperties = {
  maxHeight: "calc(100vh - 150px)",
  overflowY: "auto",
  paddingRight: 4,
};

const noRows: CSSProperties = {
  padding: "26px 16px", border: `1px solid ${T.border}`, borderRadius: 8, background: T.white,
  fontSize: 12.5, color: T.muted, lineHeight: 1.6,
};
