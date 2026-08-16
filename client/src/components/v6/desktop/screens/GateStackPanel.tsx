/**
 * THE GATE STACK — DEFINITIVE, rendered. The deal page's centerpiece.
 *
 * FRONT_END_REBUILD.md §4: 30 gates × 134 model slots, each either computed,
 * refer-to-a-specialist, research-only, or reserved, is a field of options
 * where every one carries either a number or a reason there isn't one — which
 * is precisely the grammar the kit was built for. Nobody else can render this
 * page, because nobody else has the catalog. Until today it did not exist in
 * any form: DEFINITIVE was an engine Yulia calls, invisible to the person
 * whose practice it encodes.
 *
 * ── THE TRAINLINE READING OF THIS SCREEN ────────────────────────────────
 * The reference shows a field of trains: a strip that summarises, chips that
 * carry their counts, a sheet of rows grouped under headers that double as
 * column labels, and "Not available" printed in grey rather than hidden.
 * Substitute slots for trains and the grammar transfers whole:
 *   · the strip buckets the 134 slots by what they can DO for you
 *   · a chip's number is its consequence — you can decide not to click
 *   · each gate is a group header; its slots are the rows beneath it
 *   · a slot with no wired runtime prints "Not available" in the runtime
 *     column — a true statement, made visibly rather than omitted
 *
 * ── WHAT "APPLIES" MEANS, SAID OUT LOUD ─────────────────────────────────
 * The server matches slots to this deal with the DEFINITIVE route map — a
 * deterministic token match over the deal's recorded journey/league/industry.
 * That is ROUTING, not a judgement, and the screen's ranking note says so in
 * the server's own words (`applicableBasis` travels with the data). A bare
 * "applies to your deal" would claim an analysis nobody ran.
 *
 * ── THE LINE, VISIBLE (§5 of the plan) ──────────────────────────────────
 * A `professional_handoff` slot renders as **Refer** and its gate's
 * `lineNotes` — which name what DEFINITIVE sizes and what belongs to counsel
 * — are one click away on the group header. The perimeter is drawn on the
 * screen instead of discovered by being refused.
 *
 * NO MODEL CALL anywhere on this surface. One fetch, then local filtering.
 */
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { T } from "../atlasTokens";
import { authHeaders } from "../../../../hooks/useAuth";
import {
  ChipRow, CompareStrip, GroupHeader, ResultRow, RankingNote, InfoBanner,
  Expander, type Chip, type CompareItem,
} from "../kit";

/* ── the wire shapes (mirrors server/routes/dealGates.ts) ── */

interface GateSlot {
  slotId: string;
  name: string;
  lineCategory: "deterministic" | "professional_handoff" | "research_only" | "reserved";
  status: string;
  dealTypes: string[];
  deterministicComputation: string;
  runtimeModelId: string | null;
}
interface Gate {
  gateId: string;
  name: string;
  purpose: string;
  lineNotes: string;
  slots: GateSlot[];
}
interface GatesPayload {
  catalogVersion: string;
  deal: { id: number; name: string; journey: string | null; currentGate: string | null; league: string | null; industry: string | null };
  journeyGates: { gate: string; status: string; completedAt: string | null }[];
  stack: { version: number; composedAt: string; league: string; runtimeModels: string[] } | null;
  applicable: { slotId: string; gates: string[]; appliesWhen: string; boundary: string }[];
  applicableBasis: string;
  gates: Gate[];
}

type FilterId = "applies" | "computed" | "refer" | "research" | "all";

/* The category, in the words a practitioner acts on. "deterministic" is the
   catalog's vocabulary; "Computed" is the screen's, because the question a
   reader is asking is "can I have the number", and the answer set is: yes /
   yes-via-a-specialist / research-frame-only / not-yet. */
const CATEGORY_LABEL: Record<GateSlot["lineCategory"], string> = {
  deterministic: "Computed",
  professional_handoff: "Refer",
  research_only: "Research",
  reserved: "Reserved",
};

const GATE_WINDOW = 6; // gates shown before the Expander widens the window

export function GateStackPanel({ dealId }: { dealId: number }) {
  const [data, setData] = useState<GatesPayload | null>(null);
  const [failed, setFailed] = useState(false);
  const [filter, setFilter] = useState<FilterId | null>(null);
  const [window, setWindow] = useState(GATE_WINDOW);

  useEffect(() => {
    let live = true;
    setData(null); setFailed(false); setFilter(null); setWindow(GATE_WINDOW);
    fetch(`/api/deals/${dealId}/gates`, { headers: authHeaders() })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(d => { if (live) setData(d); })
      .catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, [dealId]);

  const appliesSet = useMemo(
    () => new Set((data?.applicable ?? []).map(a => a.slotId)),
    [data],
  );

  /* Every count below is over the UNIQUE slot set, not the gate-grouped view —
     a slot serving three gates appears three times in the sheet and once in a
     number. The ranking note states both facts; computing the counts off the
     grouped view would triple-count exactly the slots the catalog considers
     most load-bearing. */
  const uniqueSlots = useMemo(() => {
    const m = new Map<string, GateSlot>();
    for (const g of data?.gates ?? []) for (const s of g.slots) m.set(s.slotId, s);
    return [...m.values()];
  }, [data]);

  const counts = useMemo(() => ({
    all: uniqueSlots.length,
    applies: appliesSet.size,
    computed: uniqueSlots.filter(s => s.lineCategory === "deterministic").length,
    wired: uniqueSlots.filter(s => s.runtimeModelId).length,
    refer: uniqueSlots.filter(s => s.lineCategory === "professional_handoff").length,
    research: uniqueSlots.filter(s => s.lineCategory === "research_only").length,
    reserved: uniqueSlots.filter(s => s.lineCategory === "reserved").length,
  }), [uniqueSlots, appliesSet]);

  if (failed) {
    return (
      <InfoBanner tone="caution">
        The gate stack did not load. Nothing is wrong with the deal — retry, or
        reopen it.
      </InfoBanner>
    );
  }
  if (!data) {
    return <div style={{ fontSize: 12, color: T.muted2 }}>Loading the gate stack…</div>;
  }

  /* The default filter is the narrowest honest view: route-matched slots when
     the route map produced any, the whole catalog when it could not. Chosen at
     render rather than stored, so a deal that gains a journey later opens on
     the better default without a stale preference in the way. */
  const active: FilterId = filter ?? (appliesSet.size > 0 ? "applies" : "all");

  const chips: Chip[] = [
    { id: "applies", label: "Routed to this deal", value: appliesSet.size ? String(counts.applies) : null },
    { id: "computed", label: "Computed", value: String(counts.computed) },
    { id: "refer", label: "Refer", value: String(counts.refer) },
    { id: "research", label: "Research", value: String(counts.research) },
    { id: "all", label: "Whole catalog", value: String(counts.all) },
  ];

  const strip: CompareItem[] = [
    { id: "slots", label: "Model slots", value: String(counts.all) },
    {
      id: "wired",
      label: "Wired to a runtime",
      value: String(counts.wired),
    },
    {
      id: "stack",
      label: "This deal's stack",
      value: data.stack ? `v${data.stack.version}` : null,
      unknownWhy: "No model stack has been composed for this deal yet — ask Yulia to compose one, or run it from the cockpit.",
    },
    {
      id: "journey",
      label: "Journey position",
      value: data.deal.currentGate ?? null,
      unknownWhy: "The deal has no recorded journey gate.",
    },
  ];

  const keep = (s: GateSlot): boolean => {
    switch (active) {
      case "applies": return appliesSet.has(s.slotId);
      case "computed": return s.lineCategory === "deterministic";
      case "refer": return s.lineCategory === "professional_handoff";
      case "research": return s.lineCategory === "research_only";
      default: return true;
    }
  };

  const visibleGates = data.gates
    .map(g => ({ ...g, slots: g.slots.filter(keep) }))
    .filter(g => g.slots.length > 0);
  const shownGates = visibleGates.slice(0, window);

  return (
    <div>
      <CompareStrip items={strip} />
      <ChipRow chips={chips} activeId={active} onPick={id => { setFilter(id as FilterId); setWindow(GATE_WINDOW); }} />

      {data.stack === null && (
        <div style={{ marginTop: 10 }}>
          <InfoBanner tone="info">
            <b>No model stack composed yet.</b> The catalog below is the whole
            substrate; composing a stack records which runtime models this deal
            actually runs.
          </InfoBanner>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        {shownGates.map(g => (
          <div key={g.gateId} style={{ marginBottom: 2 }}>
            <GroupHeader
              title={`${g.gateId} · ${g.name}`}
              columns={["Status", "Runtime"]}
            />
            {/* THE LINE, on the gate itself: what DEFINITIVE sizes and what
                belongs to counsel, in the catalog's own words. Rendered as a
                quiet row rather than a tooltip — a boundary you must hover to
                find is not drawn. */}
            <div style={lineNote}>{g.lineNotes}</div>
            {g.slots.map(s => (
              <ResultRow
                key={`${g.gateId}-${s.slotId}`}
                anchor={`${s.slotId} · ${s.name}`}
                sub={s.deterministicComputation}
                values={[
                  {
                    text: CATEGORY_LABEL[s.lineCategory],
                    badge: appliesSet.has(s.slotId) ? "routed" : undefined,
                    note: s.lineCategory === "professional_handoff" ? "specialist" : undefined,
                  },
                  /* null → the kit prints "Not available", which is the true
                     sentence: this slot has no wired runtime model yet. */
                  { text: s.runtimeModelId ? "wired" : null },
                ]}
              />
            ))}
          </div>
        ))}

        {visibleGates.length > window && (
          <Expander
            dir="down"
            label={`Show ${Math.min(GATE_WINDOW, visibleGates.length - window)} more of ${visibleGates.length} gates`}
            onClick={() => setWindow(w => w + GATE_WINDOW)}
          />
        )}

        {visibleGates.length === 0 && (
          <div style={emptyNote}>
            Nothing in the catalog matches this filter for this deal.
          </div>
        )}
      </div>

      <RankingNote
        title="How this stack is assembled"
        ordering="Gates render in DEFINITIVE catalog order (G1–G30) and slots in catalog order inside each gate. Nothing is re-ranked here, and only the first gates are shown until you expand."
        caveats={[
          data.applicableBasis,
          "A slot serving several gates appears under each of them; every count above is over unique slots, so the sheet can show more rows than the numbers.",
          `Catalog ${data.catalogVersion}. "Computed" means the catalog defines a deterministic computation; "wired" means a runtime model implements it today. The two are different facts and both columns say which.`,
          "Refer means a licensed specialist owns the answer — DEFINITIVE sizes the architecture and the gate note above names the boundary. That is THE LINE drawn on the screen, not a capability gap.",
        ]}
      />
    </div>
  );
}

/* ── styles ── */

const lineNote: CSSProperties = {
  padding: "6px 12px",
  fontSize: 11,
  color: T.muted2,
  lineHeight: 1.5,
  borderBottom: `1px solid ${T.border}`,
  background: T.white,
};

const emptyNote: CSSProperties = {
  padding: "18px 14px",
  border: `1px solid ${T.border}`,
  background: T.white,
  fontSize: 12.5,
  color: T.muted,
};
