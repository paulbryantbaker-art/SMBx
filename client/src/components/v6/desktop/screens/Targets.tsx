/**
 * Atlas TARGETS — the deal funnel's pre-IoI half (CRM_WORKFLOW_SPEC.md §3.1;
 * server/routes/targets.ts; migration 131).
 *
 * A target is a `crm_accounts` row with kind='target': a company being
 * originated toward an IoI decision FOR a client (client_account_id null =
 * the house mandate). Two modes:
 *
 *   Board — the origination pipeline on the Trainline grammar (kit/index.tsx):
 *           Sourced → In wave → Contacted → Conversation → NDA →
 *           Financials in → IoI decision, then PROMOTE. Promotion creates the
 *           deal at B2 and FREEZES the target: promoted_deal_id is both the
 *           pointer and the read-only flag, and the server refuses every write
 *           on a frozen row. Frozen rows stay VISIBLE — the spec freezes,
 *           never hides.
 *   Waves — the outreach schema (migration 120) read for targets: which wave
 *           holds which touches, and where each stands. READ-ONLY here;
 *           sending stays in Clients → Outreach (one touch, one press, one
 *           human), and this mode links there in prose rather than growing a
 *           second send path.
 *
 * ── THE SEAM, KEPT NARROW ───────────────────────────────────────────────
 * Enumeration, enrichment, screening and pre-IoI MATH live in the Cowork
 * workspace — targets ARRIVE here via push-crm.mts (or the client card's
 * Add-a-target) and are never found here. Workbench numbers land as stamped
 * notes; nothing on this screen recomputes or edits research.
 *
 * ── HONESTY RULES ───────────────────────────────────────────────────────
 *  - A target in no wave prints "Not available", never a blank; a firm never
 *    touched prints "never", never a dash.
 *  - Aging runs from stage_entered_at with the TARGET thresholds (amber ≥10d,
 *    red ≥20d — hotter than the client funnel, spec law 6). Frozen and
 *    disqualified rows never age: neither is waiting on anyone.
 *  - Server refusals (the 409 on a frozen row, the 400 on a premature
 *    promotion) are surfaced verbatim — the server owns the rule, this screen
 *    only repeats it.
 *  - A load failure must not read as an empty pipeline.
 *
 * Safari rule: nothing here is position:fixed; the shell scrolls this screen
 * inside its own relative parent.
 */
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { AtlasScreenProps } from "../atlasNav";
import { T } from "../atlasTokens";
import {
  Page, Sheet, CriteriaBar, ChipRow, CompareStrip, GroupHeader, ResultRow,
  ListDetail, DetailCard, InfoBanner, RankingNote, SummaryCard,
  type Chip, type CompareItem, type CriteriaCell,
} from "../kit";
import {
  TARGET_STAGES, TARGET_STAGE_LABEL, TARGET_AMBER_DAYS, TARGET_RED_DAYS,
  daysInStage, touchLabel, dueLabel, type TargetStage,
} from "../../../../lib/crm";
import { authHeaders, DEV_AUTH_BYPASS, type User } from "../../../../hooks/useAuth";
import { useOutreach, type OutreachWave, type OutreachTouch } from "../../../../hooks/useOutreach";

/* ── the row the server returns (targets.ts GET) ──────────────────────── */

interface TargetRow {
  id: number;
  firm: string;
  domain: string | null;
  hq_city: string | null;
  hq_state: string | null;
  trades: string | null;
  notes: string | null;
  target_stage: string | null;
  client_account_id: number | null;
  /** Non-null = FROZEN. The pointer and the read-only flag are one column. */
  promoted_deal_id: number | null;
  stage_entered_at: string | null;
  disqualified: string | null;
  tier: string | null;
  score: number | null;
  client_firm: string | null;
  last_touch_at: string | null;
  wave_name: string | null;
  touches_pending: number | null;
  /** Carried by the board fetch (targets.ts selects both), so the editor
   *  seeds from the saved record rather than starting blank. */
  next_action?: string | null;
  next_action_on?: string | null;
}

function isFrozen(t: TargetRow): boolean { return t.promoted_deal_id != null; }
function isDq(t: TargetRow): boolean { return (t.disqualified ?? "").trim().length > 0; }

/** Aging with the TARGET thresholds. Frozen rows never age (the work moved to
 *  the deal) and disqualified rows never age (nothing is owed on a verdict). */
function targetAging(t: TargetRow): { days: number; tone: "quiet" | "amber" | "red" } | null {
  if (isFrozen(t) || isDq(t)) return null;
  const days = daysInStage(t.stage_entered_at);
  if (days == null) return null;
  return {
    days,
    tone: days >= TARGET_RED_DAYS ? "red" : days >= TARGET_AMBER_DAYS ? "amber" : "quiet",
  };
}

function stageLabelOf(s: string | null): string {
  if (!s) return "Stage not recorded";
  return TARGET_STAGE_LABEL[s as TargetStage] ?? s;
}

async function jsonOrThrow(r: Response): Promise<any> {
  let j: any = null;
  try { j = await r.json(); } catch { /* no body */ }
  if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
  return j;
}

/* ── screen ───────────────────────────────────────────────────────────── */

type ChipId = "all" | "ready" | "stalled" | "disqualified" | "promoted";

export default function TargetsScreen({ user }: AtlasScreenProps) {
  const [mode, setMode] = useState<"board" | "waves">("board");

  const [rows, setRows] = useState<TargetRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  // Board scope. The fetch is always client=all and the client filter is
  // applied here, so the "Hunting for" cycle can name every client that
  // actually appears in the data and the counts stay one consistent set.
  const [clientKey, setClientKey] = useState<"all" | "house" | number>("all");
  const [stage, setStage] = useState<TargetStage | "all">("all");
  const [chip, setChip] = useState<ChipId>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    if (!user || DEV_AUTH_BYPASS) {
      setRows([]); setLoaded(true); setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true); setError(null);
    fetch(`/api/crm/targets?client=all`, { headers: authHeaders() })
      .then(jsonOrThrow)
      .then((j: { targets: TargetRow[] }) => { if (!cancelled) setRows(j.targets ?? []); })
      .catch((e: Error) => {
        if (cancelled) return;
        // Say WHY — before migration 131 the target columns do not exist, and
        // an empty "no targets yet" would be a lie.
        console.error("[targets] load failed:", e.message);
        setRows([]); setError(e.message || "Could not load the target board");
      })
      .finally(() => { if (!cancelled) { setLoading(false); setLoaded(true); } });
    return () => { cancelled = true; };
  }, [user?.id, nonce]);

  const refresh = () => setNonce(n => n + 1);

  /** Merge a full row the server echoed back (PATCH / promote) into the list,
   *  keeping the joined fields (client_firm, wave_name…) the echo lacks. */
  const mergeRow = (patched: Partial<TargetRow> & { id: number }) =>
    setRows(rs => rs.map(r => (r.id === patched.id ? { ...r, ...patched } : r)));

  /* ── scope: client → search → chip → stage, in that order ───────────── */

  const clients = useMemo(() => {
    const m = new Map<number, string>();
    for (const t of rows) {
      if (t.client_account_id != null) m.set(t.client_account_id, t.client_firm ?? `Client #${t.client_account_id}`);
    }
    return [...m.entries()].map(([id, firm]) => ({ id, firm }))
      .sort((a, b) => a.firm.localeCompare(b.firm));
  }, [rows]);

  const clientScoped = useMemo(() => {
    if (clientKey === "all") return rows;
    if (clientKey === "house") return rows.filter(t => t.client_account_id == null);
    return rows.filter(t => t.client_account_id === clientKey);
  }, [rows, clientKey]);

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clientScoped;
    return clientScoped.filter(t =>
      [t.firm, t.trades, t.hq_city, t.hq_state, t.notes, t.client_firm, t.wave_name]
        .some(v => (v ?? "").toLowerCase().includes(q)),
    );
  }, [clientScoped, query]);

  // Chip counts are read off the searched scope so the numbers agree with the
  // list under them. Every one is a real count of loaded rows — a genuine zero
  // here IS a zero, unlike the unwritten-column dashes on the Clients list.
  const readyRows = useMemo(
    () => searched.filter(t => t.target_stage === "ioi_decision" && !isFrozen(t) && !isDq(t)),
    [searched],
  );
  const stalledRows = useMemo(
    () => searched.filter(t => { const a = targetAging(t); return a != null && a.tone !== "quiet"; }),
    [searched],
  );
  const dqRows = useMemo(() => searched.filter(t => isDq(t) && !isFrozen(t)), [searched]);
  const frozenRows = useMemo(() => searched.filter(isFrozen), [searched]);

  const chipScoped = useMemo(() => {
    switch (chip) {
      case "ready": return readyRows;
      case "stalled": return stalledRows;
      case "disqualified": return dqRows;
      case "promoted": return frozenRows;
      default: return searched;
    }
  }, [chip, searched, readyRows, stalledRows, dqRows, frozenRows]);

  const stageCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of chipScoped) {
      const key = t.target_stage ?? "none";
      m.set(key, (m.get(key) ?? 0) + 1);
    }
    return m;
  }, [chipScoped]);

  const visible = useMemo(
    () => (stage === "all" ? chipScoped : chipScoped.filter(t => t.target_stage === stage)),
    [chipScoped, stage],
  );

  // Grouped by stage in funnel order, server order kept inside each group
  // (unfrozen first, undisqualified first, oldest-in-stage first). Rows whose
  // stage predates migration 131 land in a visible trailing group rather than
  // being dropped.
  const groups = useMemo(() => {
    const m = new Map<string, TargetRow[]>();
    for (const s of TARGET_STAGES) m.set(s, []);
    m.set("none", []);
    for (const t of visible) {
      const key = (TARGET_STAGES as readonly string[]).includes(t.target_stage ?? "")
        ? (t.target_stage as string) : "none";
      m.get(key)!.push(t);
    }
    return m;
  }, [visible]);

  const selected = rows.find(t => t.id === selectedId) ?? null;

  /* ── criteria bar ───────────────────────────────────────────────────── */

  const clientCycle: Array<"all" | "house" | number> = ["all", "house", ...clients.map(c => c.id)];
  const clientLabel =
    clientKey === "all" ? "All clients"
      : clientKey === "house" ? "House mandate"
        : clients.find(c => c.id === clientKey)?.firm ?? `Client #${clientKey}`;
  const cycleClient = () => {
    const i = clientCycle.findIndex(k => k === clientKey);
    setClientKey(clientCycle[(i + 1) % clientCycle.length]);
  };

  const cycleStage = () => {
    if (stage === "all") { setStage(TARGET_STAGES[0]); return; }
    const i = TARGET_STAGES.indexOf(stage);
    const next = TARGET_STAGES[i + 1];
    setStage(next ?? "all");
  };

  const cells: CriteriaCell[] = [
    { label: "Hunting for", grow: 1.2, value: clientLabel, onClick: cycleClient },
    { label: "Stage", grow: 1, value: stage === "all" ? "Any" : TARGET_STAGE_LABEL[stage], onClick: cycleStage },
    {
      label: "Search",
      grow: 1.5,
      value: (
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Firm, trade, city or note"
          style={searchInput}
          aria-label="Search targets"
        />
      ),
    },
  ];

  const chips: Chip[] = [
    { id: "all", label: "All", value: String(searched.length) },
    { id: "ready", label: "Ready to promote", value: String(readyRows.length) },
    { id: "stalled", label: "Stalled", value: String(stalledRows.length) },
    { id: "disqualified", label: "Disqualified", value: String(dqRows.length) },
    { id: "promoted", label: "Promoted", value: String(frozenRows.length) },
  ];

  const strip: CompareItem[] = TARGET_STAGES.map(s => ({
    id: s,
    label: TARGET_STAGE_LABEL[s],
    // A genuine zero: counted off the loaded rows in the current scope.
    value: String(stageCounts.get(s) ?? 0),
  }));

  /* ── shell ──────────────────────────────────────────────────────────── */

  const root: CSSProperties = {
    flex: 1, minWidth: 0, display: "flex", flexDirection: "column",
    fontFamily: T.font, color: T.ink, overflow: "hidden", position: "relative",
  };

  const modeTabs = (
    <div style={{ display: "flex", gap: 6, padding: "14px 22px 10px", flex: "none" }}>
      {(["board", "waves"] as const).map(k => (
        <button
          key={k}
          type="button"
          onClick={() => setMode(k)}
          style={{
            padding: "7px 16px", borderRadius: 99, fontSize: 13, fontWeight: 700,
            cursor: "pointer",
            border: `1px solid ${mode === k ? T.ink : T.border}`,
            background: mode === k ? T.ink : T.white,
            color: mode === k ? "#fff" : T.ink,
          }}
        >
          {k === "board" ? "Board" : "Waves"}
        </button>
      ))}
    </div>
  );

  if (mode === "waves") {
    return (
      <div style={root}>
        {modeTabs}
        <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
          <Page><WavesPanel user={user} /></Page>
        </div>
      </div>
    );
  }

  if (loading && !loaded) {
    return (
      <div style={root}>
        {modeTabs}
        <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
          <Page><div style={quietBlock}>Loading the target board…</div></Page>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={root}>
        {modeTabs}
        <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
          <Page>
            <Sheet style={{ padding: "22px 20px" }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Could not load the target board</div>
              <p style={pMuted}>
                {error}. If this is the first deploy carrying migration 131, the
                target columns may not exist yet — check the boot log. Nothing
                came back, so this is not an empty pipeline.
              </p>
              <button type="button" onClick={refresh} style={greenBtn}>Try again</button>
            </Sheet>
          </Page>
        </div>
      </div>
    );
  }

  return (
    <div style={root}>
      {modeTabs}
      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <Page>
          <CriteriaBar cells={cells} />
          <ChipRow chips={chips} activeId={chip} onPick={id => setChip(id as ChipId)} />
          <CompareStrip
            items={strip}
            activeId={stage === "all" ? undefined : stage}
            onPick={id => setStage(s => (s === id ? "all" : (id as TargetStage)))}
          />

          <div style={{ marginTop: 16 }}>
            <ListDetail
              detailEmpty={
                <p style={{ ...pMuted, margin: 0 }}>
                  Pick a target to see its stage, its wave, and the notes the
                  screen stamped on it. Targets arrive from the Cowork screen
                  via push-crm, or from a client card&rsquo;s Add-a-target — nothing
                  is sourced on this board.
                </p>
              }
              detail={selected ? (
                <div style={detailScroll}>
                  {/* Keyed so switching targets remounts the editors — stale
                      inputs under a different firm's card would be a wrong
                      attribution. */}
                  <TargetDetail key={selected.id} row={selected} onMerge={mergeRow} />
                </div>
              ) : null}
              list={
                <div>
                  {loaded && rows.length === 0 ? (
                    <Sheet style={{ padding: "22px 20px" }}>
                      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>No targets on file</div>
                      <p style={{ ...pMuted, marginBottom: 0 }}>
                        Targets arrive from the Cowork workspace via{" "}
                        <code style={code}>push-crm.mts</code>, or by naming one on a
                        client&rsquo;s card (Clients → the firm → Add a target). The
                        screening itself — enumeration, affiliation, revenue bands —
                        happens in the workspace, never here.
                      </p>
                    </Sheet>
                  ) : (
                    <Sheet>
                      {[...TARGET_STAGES, "none" as const].map(s => {
                        const group = groups.get(s) ?? [];
                        if (!group.length) return null;
                        return (
                          <div key={s}>
                            <GroupHeader
                              title={s === "none" ? "Stage not recorded" : TARGET_STAGE_LABEL[s as TargetStage]}
                              columns={["Wave", "Last touch"]}
                            />
                            {group.map(t => (
                              <TargetRowView
                                key={t.id}
                                t={t}
                                selected={selectedId === t.id}
                                onClick={() => setSelectedId(t.id)}
                              />
                            ))}
                          </div>
                        );
                      })}
                      {visible.length === 0 && rows.length > 0 && (
                        <div style={{ padding: "24px 16px", fontSize: 12.5, color: T.muted, lineHeight: 1.6 }}>
                          Nothing matches this scope. {rows.length} target{rows.length === 1 ? "" : "s"} loaded
                          in total — widen the search, clear a chip, or pick a different stage.
                        </div>
                      )}
                    </Sheet>
                  )}

                  <RankingNote
                    ordering={
                      "The server orders the board: unfrozen targets first, then undisqualified, then oldest-in-stage first — the row that has waited longest sits at the top of its stage. This view groups those rows under their stage heading and keeps the server's order inside each group. Nothing is re-ranked here."
                    }
                    caveats={[
                      "Targets ARRIVE here — from the Cowork screen via push-crm, or from a client card's Add-a-target. This board holds relationship state only; enumeration, enrichment and screening live in the workspace.",
                      "Pre-IoI math lives in the workbench and lands here as stamped notes (run date + commit), never as live models. Nothing on this screen computes a valuation.",
                      "Ready to promote counts IoI-decision targets that are neither frozen nor disqualified — the set the server would actually accept a promotion for.",
                      "A promoted target is read-only by design: promotion created its deal at B2 and froze this record, so the deal is where the work lives now. Frozen rows stay on the board — the spec freezes, never hides.",
                      "Aging runs from the day a target entered its stage: amber at 10 days, red at 20. Frozen and disqualified targets never age — neither is waiting on anyone.",
                      "Nothing here sends anything. Wave sends happen in Clients → Outreach — one touch, one press, one human.",
                    ]}
                  />
                </div>
              }
            />
          </div>
        </Page>
      </div>
    </div>
  );
}

/* ── one board row ────────────────────────────────────────────────────── */

function TargetRowView({ t, selected, onClick }: {
  t: TargetRow; selected: boolean; onClick: () => void;
}) {
  const frozen = isFrozen(t);
  const dq = isDq(t);
  const ag = targetAging(t);
  const place = [t.hq_city, t.hq_state].filter(Boolean).join(", ");

  const subBits = [t.client_firm ?? "house", t.trades, place || null].filter(Boolean) as string[];
  const sub: ReactNode = (
    <>
      {subBits.join(" · ")}
      {ag && (
        <span style={{ color: ag.tone === "red" ? T.terra : ag.tone === "amber" ? T.amber : undefined }}>
          {subBits.length ? " · " : ""}{ag.days}d in stage
        </span>
      )}
    </>
  );

  return (
    <ResultRow
      anchor={frozen ? <span style={{ color: T.muted }}>{t.firm}</span> : t.firm}
      sub={sub}
      identity={
        frozen ? <span style={frozenPill}>Promoted → deal #{t.promoted_deal_id}</span>
          : dq ? <span style={dqPill}>Do not pursue</span>
            : undefined
      }
      selected={selected}
      onClick={onClick}
      values={[
        {
          // null → "Not available": not in a wave is a real absence, said plainly.
          text: t.wave_name ?? null,
          note: t.touches_pending ? `${t.touches_pending} pending` : undefined,
        },
        { text: touchLabel(t.last_touch_at) ?? "never" },
      ]}
    />
  );
}

/* ── the detail panel ─────────────────────────────────────────────────── */

function TargetDetail({ row, onMerge }: {
  row: TargetRow;
  onMerge: (patched: Partial<TargetRow> & { id: number }) => void;
}) {
  const frozen = isFrozen(row);
  const dq = isDq(row);
  const ag = targetAging(row);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [promoteMsg, setPromoteMsg] = useState<string | null>(null);
  const [dqText, setDqText] = useState("");
  const [nextText, setNextText] = useState(row.next_action ?? "");
  const [nextOn, setNextOn] = useState(row.next_action_on ? String(row.next_action_on).slice(0, 10) : "");
  const [nextSaved, setNextSaved] = useState(false);

  const patch = async (body: Record<string, unknown>) => {
    if (busy) return null;
    setBusy(true); setErr(null);
    try {
      const r = await fetch(`/api/crm/targets/${row.id}`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const saved = await jsonOrThrow(r);
      onMerge(saved);
      return saved as TargetRow;
    } catch (e: any) {
      // The 409 on a frozen row and every other refusal, verbatim — the
      // server owns the rule.
      setErr(e?.message ?? "The request failed");
      return null;
    } finally { setBusy(false); }
  };

  const promote = async () => {
    if (busy) return;
    setBusy(true); setErr(null);
    try {
      const r = await fetch(`/api/crm/targets/${row.id}/promote`, {
        method: "POST", headers: authHeaders(),
      });
      const j = await jsonOrThrow(r);
      onMerge({ id: row.id, promoted_deal_id: j.dealId });
      setPromoteMsg(`Deal #${j.dealId} created — open it from the Deals tab.`);
    } catch (e: any) {
      setErr(e?.message ?? "Promotion failed");
    } finally { setBusy(false); }
  };

  const summarySub = [
    ag ? `${ag.days}d in stage` : null,
    row.wave_name ? `Wave: ${row.wave_name}` : "not in a wave",
  ].filter(Boolean).join(" · ");

  return (
    <>
      <SummaryCard
        kicker={row.client_firm ?? "House mandate"}
        value={row.firm}
        badge={stageLabelOf(row.target_stage)}
        sub={summarySub}
      />

      {frozen && (
        <div style={{ marginTop: 12 }}>
          <InfoBanner>
            <b>Promoted → deal #{row.promoted_deal_id}.</b> This record is
            read-only by design — the deal is where the work lives now. Open it
            from the Deals tab.
          </InfoBanner>
        </div>
      )}

      {dq && !frozen && (
        <div style={{ marginTop: 12 }}>
          <InfoBanner tone="caution">
            <b>Do not pursue.</b> {row.disqualified}
          </InfoBanner>
        </div>
      )}

      {err && (
        <div style={{ marginTop: 12 }}>
          <InfoBanner tone="caution">{err}</InfoBanner>
        </div>
      )}

      {/* Stage moves are inline, never full-page forms (spec law 5). Frozen
          rows get disabled chips — the server would 409 anyway, and any
          refusal that does land is shown above verbatim. */}
      <DetailCard title="Stage">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {TARGET_STAGES.map(s => {
            const on = row.target_stage === s;
            return (
              <button
                key={s}
                type="button"
                disabled={frozen || busy || on}
                onClick={() => patch({ target_stage: s })}
                style={{
                  ...stageChip,
                  borderColor: on ? T.blue : T.inputBd,
                  background: on ? T.blueBg : T.white,
                  color: on ? T.blue : frozen ? T.faint : T.ink,
                  fontWeight: on ? 700 : 500,
                  cursor: frozen || on ? "default" : "pointer",
                  opacity: frozen && !on ? 0.5 : 1,
                }}
                aria-pressed={on}
              >
                {TARGET_STAGE_LABEL[s]}
              </button>
            );
          })}
        </div>
        {frozen && (
          <p style={{ ...pMuted, margin: "8px 0 0" }}>
            Promoted targets are read-only — this one became deal #{row.promoted_deal_id}. Work it there.
          </p>
        )}
      </DetailCard>

      {row.target_stage === "ioi_decision" && !frozen && (
        <DetailCard title="IoI decision">
          {dq ? (
            <p style={{ ...pMuted, marginBottom: 0 }}>
              This target is disqualified ({row.disqualified}) — the server will
              refuse the promotion. Clear the disqualification below first if
              the decision has changed.
            </p>
          ) : (
            <>
              <p style={pMuted}>
                Promotion creates the deal at B2 — the IoI is its first piece of
                work — and freezes this record behind it. One target, one deal,
                one direction.
              </p>
              <button type="button" onClick={promote} disabled={busy} style={greenBtn}>
                {busy ? "Promoting…" : "Promote to deal"}
              </button>
            </>
          )}
          {promoteMsg && (
            <p style={{ margin: "8px 0 0", fontSize: 12.5, color: T.green, fontWeight: 600 }}>
              {promoteMsg}
            </p>
          )}
        </DetailCard>
      )}

      {!frozen && (
        <DetailCard title="Next step">
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <input
              value={nextText}
              onChange={e => { setNextText(e.target.value); setNextSaved(false); }}
              placeholder="What happens next"
              style={{ ...filledInput, flex: "2 1 160px" }}
            />
            <input
              type="date"
              value={nextOn}
              onChange={e => { setNextOn(e.target.value); setNextSaved(false); }}
              style={{ ...filledInput, flex: "1 1 130px" }}
              aria-label="Next step date"
            />
            <button
              type="button"
              disabled={busy || !nextText.trim()}
              onClick={async () => {
                const saved = await patch({ next_action: nextText.trim(), next_action_on: nextOn || null });
                if (saved) setNextSaved(true);
              }}
              style={{ ...greenBtn, opacity: busy || !nextText.trim() ? 0.5 : 1 }}
            >
              Save
            </button>
          </div>
          {nextSaved && nextOn && (
            <p style={{ margin: "6px 0 0", fontSize: 12.5, color: T.green }}>
              Saved — due {dueLabel(nextOn) ?? nextOn}.
            </p>
          )}
        </DetailCard>
      )}

      {!frozen && (
        <DetailCard title="Disqualify">
          {dq ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 12.5, color: T.muted, flex: "1 1 auto" }}>
                Disqualified: {row.disqualified}
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => patch({ disqualified: null })}
                style={ghostBtn}
              >
                Clear
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 6 }}>
              <input
                value={dqText}
                onChange={e => setDqText(e.target.value)}
                placeholder="Why this target is out"
                style={{ ...filledInput, flex: 1 }}
              />
              <button
                type="button"
                disabled={busy || !dqText.trim()}
                onClick={async () => {
                  const saved = await patch({ disqualified: dqText.trim() });
                  if (saved) setDqText("");
                }}
                style={{ ...ghostBtn, opacity: busy || !dqText.trim() ? 0.5 : 1 }}
              >
                Disqualify
              </button>
            </div>
          )}
        </DetailCard>
      )}

      {(row.notes ?? "").trim() && (
        <DetailCard title="From the screen">
          <p style={{ ...pMuted, whiteSpace: "pre-wrap" }}>{row.notes}</p>
          <p style={{ margin: 0, fontSize: 11.5, color: T.muted2, lineHeight: 1.55 }}>
            Corrections happen in the studio and re-push; this panel never
            writes research.
          </p>
        </DetailCard>
      )}
    </>
  );
}

/* ── WAVES — the outreach schema, read for targets ────────────────────── */

/**
 * Read-only surface over migration 120: waves on the left, the selected
 * wave's touches on the right. `useOutreach` is the ONLY data path — the same
 * hook Clients → Outreach runs — with status=all so a wave shows its whole
 * queue, not just the pending slice. Sending stays in Clients → Outreach; no
 * verb here touches a message.
 */
function WavesPanel({ user }: { user: User | null }) {
  const { machine, touches, loading, loaded, error } = useOutreach(user, "all");
  const [waveId, setWaveId] = useState<number | null>(null);

  const waves = machine?.waves ?? [];
  const wave = waves.find(w => w.id === waveId) ?? null;
  const waveTouches = useMemo(
    () => (wave ? touches.filter(t => t.wave_key === wave.wave_key) : []),
    [touches, wave],
  );

  if (loading && !loaded) return <div style={quietBlock}>Loading the outreach machine…</div>;

  if (error) {
    return (
      <Sheet style={{ padding: "22px 20px" }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Could not load the waves</div>
        <p style={{ ...pMuted, marginBottom: 0 }}>
          {error}. Before migration 120 runs, the outreach tables do not exist —
          nothing came back, so this is not an empty plan.
        </p>
      </Sheet>
    );
  }

  if (loaded && waves.length === 0) {
    return (
      <Sheet style={{ padding: "22px 20px" }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>No waves on file</div>
        <p style={{ ...pMuted, marginBottom: 0 }}>
          The campaign plan seeds from Clients → Board (Seed the outreach plan)
          or arrives from the workspace via push-crm. Once waves exist they
          appear here with their touch queues.
        </p>
      </Sheet>
    );
  }

  return (
    <div>
      <ListDetail
        detailEmpty={
          <p style={{ ...pMuted, margin: 0 }}>
            Pick a wave to see its touches — who is queued, what step, when it
            is due, and where each stands. Sending happens in Clients →
            Outreach — one touch, one press, one human.
          </p>
        }
        detail={wave ? (
          <div style={detailScroll}>
            <SummaryCard
              kicker={[wave.start_on, wave.end_on].filter(Boolean).map(d => String(d).slice(0, 10)).join(" → ") || "No dates recorded"}
              value={wave.name}
              badge={wave.status}
              sub={wave.objective ?? undefined}
            />
            <DetailCard title={`Touches · ${waveTouches.length}`}>
              {waveTouches.length === 0 ? (
                <p style={{ ...pMuted, marginBottom: 0 }}>
                  No touches queued against this wave. The queue view here reads
                  every status; if the plan promised touches, they were either
                  excluded at build (do-not-pitch, unsubscribed) or the seed has
                  not run.
                </p>
              ) : (
                <div>
                  {waveTouches.map(t => <TouchLine key={t.id} t={t} />)}
                </div>
              )}
            </DetailCard>
          </div>
        ) : null}
        list={
          <div>
            <Sheet>
              <GroupHeader title="Waves" columns={["Touches"]} />
              {waves.map(w => <WaveRow key={w.id} w={w} selected={w.id === waveId} onClick={() => setWaveId(w.id)} />)}
            </Sheet>
            <RankingNote
              ordering="Waves render in the order the server returns them — the plan's own sequence. Touch progress counts sent, replied and done against every touch queued for the wave's steps, whatever its status; skipped touches stay in the total."
              caveats={[
                "This mode is read-only. Sending happens in Clients → Outreach — one touch, one press, one human. No batch send exists anywhere in the app.",
                (machine?.unwavedSteps?.length
                  ? `${machine.unwavedSteps.length} sequence step${machine.unwavedSteps.length === 1 ? "" : "s"} on file belong to no wave and are not shown here — they appear in Clients → Outreach.`
                  : "Every sequence step on file belongs to a wave."),
                "What this view does not show: templates, events, and the composed drafts — those live in Clients → Outreach, where the sending discipline is enforced.",
              ]}
            />
          </div>
        }
      />
    </div>
  );
}

function WaveRow({ w, selected, onClick }: { w: OutreachWave; selected: boolean; onClick: () => void }) {
  // Progress from the machine's own per-step tallies — nothing counted twice,
  // nothing invented. done = sent + replied + done; skipped stays in the total.
  let total = 0; let done = 0;
  for (const s of w.steps) {
    for (const [status, n] of Object.entries(s.touches ?? {})) {
      total += n;
      if (status === "sent" || status === "replied" || status === "done") done += n;
    }
  }
  const dates = [w.start_on, w.end_on].filter(Boolean).map(d => String(d).slice(0, 10)).join(" → ");
  return (
    <ResultRow
      anchor={w.name}
      sub={[dates || null, w.objective].filter(Boolean).join(" · ") || undefined}
      selected={selected}
      onClick={onClick}
      values={[{ text: total > 0 ? `${done}/${total}` : "none queued" }]}
    />
  );
}

function TouchLine({ t }: { t: OutreachTouch }) {
  return (
    <div style={touchLine}>
      <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>
        {t.firm ?? t.contact_name ?? "No account on this touch"}
      </div>
      <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
        {[
          t.step_action,
          t.due_on ? (dueLabel(t.due_on) ?? String(t.due_on).slice(0, 10)) : "no date",
          t.status,
        ].filter(Boolean).join(" · ")}
      </div>
    </div>
  );
}

/* ── styles ───────────────────────────────────────────────────────────── */

const searchInput: CSSProperties = {
  font: "inherit", fontSize: 14, fontWeight: 700, color: T.ink,
  background: "transparent", border: "none", outline: "none",
  padding: 0, width: "100%", minWidth: 0,
};

const detailScroll: CSSProperties = {
  maxHeight: "calc(100vh - 190px)",
  overflowY: "auto",
  paddingRight: 4,
};

const quietBlock: CSSProperties = {
  padding: "40px 0", fontSize: 13.5, color: T.muted, textAlign: "center",
};

const pMuted: CSSProperties = { margin: "0 0 10px", fontSize: 12.5, color: T.muted, lineHeight: 1.6 };

const code: CSSProperties = { fontSize: 11.5, background: T.track, padding: "1px 4px" };

/* Identity pills. Frozen is muted — the record is done here, not in danger;
   disqualified is amber — a standing warning, on the row before anyone acts. */
const frozenPill: CSSProperties = {
  fontSize: 9.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase",
  background: T.track, color: T.muted, padding: "2px 6px", whiteSpace: "nowrap",
};
const dqPill: CSSProperties = {
  fontSize: 9.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase",
  background: T.amberBg, color: T.amber, padding: "2px 6px", whiteSpace: "nowrap",
};

const touchLine: CSSProperties = { padding: "7px 0", borderBottom: `1px solid ${T.rowDiv}` };

const stageChip: CSSProperties = {
  font: "inherit", fontSize: 13, display: "inline-flex", alignItems: "center",
  padding: "7px 12px", borderRadius: 999, border: "1px solid", lineHeight: 1.2,
};

/* The transcription's control pair: filled cell + filled-green action. */
const filledInput: CSSProperties = {
  minWidth: 0, font: "inherit", fontSize: 13.5, color: T.ink,
  background: T.track, border: "none", borderRadius: 8, padding: "9px 11px",
  outline: "none",
};
const greenBtn: CSSProperties = {
  font: "inherit", fontSize: 13.5, fontWeight: 700, color: "#fff",
  background: T.blue, border: "none", borderRadius: 8, padding: "9px 15px",
  cursor: "pointer", flex: "none",
};
const ghostBtn: CSSProperties = {
  font: "inherit", fontSize: 12.5, fontWeight: 600, color: T.muted,
  background: T.white, border: `1px solid ${T.inputBd}`, borderRadius: 8,
  padding: "8px 13px", cursor: "pointer", flex: "none",
};
