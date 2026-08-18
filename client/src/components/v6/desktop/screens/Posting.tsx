/**
 * POSTING — the campaign calendar, on `post_queue` (migration 123).
 *
 * (2026-08-16, Paul, with the Aug 17 – Sep 11 plan in hand: "in cowork, the
 * studio works fine, i have no way of managing the campaign schedule or what
 * gets made and ready to post when?")
 *
 * ── THE OWNERSHIP LAW, RENDERED ─────────────────────────────────────────
 * The MARKDOWN owns CONTENT (angle, format, what it carries, evidence grade
 * — content/studio/CAMPAIGN_2026-08-17.md and its JSON); this TABLE owns
 * STATE (drafted, posted_at, the retired-check verdict, the post URL). This
 * screen therefore edits state and only state. Copy changes happen in the
 * Cowork plan and arrive by re-import, which can push a row forward but can
 * never un-post one.
 *
 * ── CAMPAIGNS (2026-08-18) ─────────────────────────────────────────────
 * The plan was remade the same day the first one shipped — Tue/Wed/Thu spine,
 * P-1…P-8 + five Mandate editions, Aug 18 – Sep 16 — and this screen kept
 * showing the calendar it retired, because the import was wired to ONE file
 * and the week labels were typed in here. Now: `/api/post-queue/campaigns`
 * lists every shipped campaign file (newest first); the calendar shows ONE
 * campaign at a time (a chip per campaign, plus the standing queue); week
 * labels and the strip come from the campaign file's own `weeks`; and Import
 * loads the selected campaign, which parks the superseded calendar's rows
 * (never a posted one) and reports exactly what it did. Migration 135 stamps
 * `campaign` on each row so two calendars can share the table without sharing
 * a week.
 *
 * ── NOTHING HERE FIRES ──────────────────────────────────────────────────
 * The queue is rows carrying a date and a status. There is no dispatcher and
 * no scheduler; "Mark posted" is a human recording that a human posted, and
 * posted_at is stamped server-side at the click. The server refuses the mark
 * while retired-check is unrun or flagged — a caption is the most exposed
 * artifact this practice produces.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { T } from "../atlasTokens";
import type { AtlasScreenProps } from "../atlasNav";
import {
  Page, Sheet, ChipRow, CompareStrip, ListDetail, GroupHeader, ResultRow,
  Endorsement, SummaryCard, DetailCard, InfoBanner, RankingNote,
  type Chip, type CompareItem,
} from "../kit";
import { authHeaders } from "../../../../hooks/useAuth";
import { daysUntil, dueLabel } from "../../../../lib/crm";

interface QueueRow {
  id: number;
  queue_id: string;
  tier: string | null;          // W1…W4 for the campaign
  lead: string | null;          // "Mon Aug 17 · Post 1"
  angle: string;
  format: string | null;
  carries: string | null;
  evidence_grade: string | null;
  source_disclosure: string | null;
  may_state_figure: boolean;
  slot: string | null;
  scheduled_for: string | null;
  status: string;               // next · drafted · posted · parked · recurring
  drafted_at: string | null;
  posted_at: string | null;
  post_url: string | null;
  retired_check: string;        // clean · flagged · not_run
  notes: string | null;
  campaign: string | null;      // `2026-08-18` = the file it came from; null = the standing queue
}

interface CampaignMeta {
  name: string;                 // `2026-08-18`
  file: string;
  title: string | null;
  note: string | null;
  rows: number;
  weeks: Record<string, string>;
  first: string | null;
  last: string | null;
  supersedes: string | null;
}

/** The standing queue (POST_QUEUE.md rows) has no campaign; this is its chip id. */
const STANDING = "standing";

const STATUS_LABEL: Record<string, string> = {
  next: "Next", drafted: "Drafted", posted: "Posted", parked: "Parked", recurring: "Recurring",
};

/* Fallback only — used when a campaign file carries no `weeks` of its own.
   These are the Aug 17 labels this screen used to hard-code, kept so an old
   file still renders; a real campaign supplies its own. */
const FALLBACK_WEEKS: Record<string, string> = {
  W1: "Week 1 · Aug 17–21 · establish the seat",
  W2: "Week 2 · Aug 24–28 · register credibility",
  W3: "Week 3 · Aug 31 – Sep 4 · DEALSOURCE WEEK",
  W4: "Week 4 · Sep 7–11 · close the arc",
};

/** "Aug 18 – Sep 16" from two ISO dates, for chips and titles. */
function windowLabel(first: string | null, last: string | null): string {
  const f = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  if (first && last) return `${f(first)} – ${f(last)}`;
  return first ? f(first) : "undated";
}

type FilterId = "all" | "today" | "videos" | "carousels" | "mandates" | "posted";

export default function PostingScreen(_props: AtlasScreenProps) {
  const [rows, setRows] = useState<QueueRow[] | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignMeta[]>([]);
  /* Which calendar is on screen: a campaign name, or STANDING for the queue.
     Defaults to the NEWEST shipped campaign once the list arrives — the same
     file Import loads with no argument, so what you see is what you press. */
  const [view, setView] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterId>("all");
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/post-queue/", { headers: authHeaders() })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(d => { setRows(d.rows ?? []); setError(null); })
      .catch(e => setError(e?.message ?? "load failed"));
    fetch("/api/post-queue/campaigns", { headers: authHeaders() })
      .then(r => (r.ok ? r.json() : { campaigns: [] }))
      .then(d => {
        const list: CampaignMeta[] = d.campaigns ?? [];
        setCampaigns(list);
        setView(v => v ?? (list[0]?.name ?? STANDING));
      })
      .catch(() => setCampaigns([]));
  }, []);
  useEffect(load, [load]);

  const current = campaigns.find(c => c.name === view) ?? null;

  /* Import the campaign on screen. State-preserving by contract: dates only
     where none, the superseded calendar PARKED (a posted row is left alone and
     named), the file's queue bookkeeping applied with the same floor. The
     banner says exactly what moved, because "imported" alone hides the part
     that matters — what stepped aside. */
  const seedCampaign = async () => {
    setBusy(true); setBanner(null);
    try {
      const name = current?.name ?? campaigns[0]?.name ?? null;
      const r = await fetch("/api/post-queue/import-campaign", {
        method: "POST", headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(name ? { campaign: name } : {}),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) { setBanner(`Import failed: ${j?.error ?? r.status}`); return; }
      const parts = [
        `${j.title ?? j.campaign ?? "Campaign"} — ${j.inserted} slots new, ${j.updated} refreshed, ${j.scheduled} dated.`,
        j.parkedSuperseded ? `Parked ${j.parkedSuperseded} slot${j.parkedSuperseded === 1 ? "" : "s"} of the superseded calendar.` : "",
        j.parkedBookkeeping || j.draftedBookkeeping ? `Standing queue: ${j.parkedBookkeeping} parked, ${j.draftedBookkeeping} moved to drafted.` : "",
        j.keptPosted?.length ? `Left alone because already posted: ${j.keptPosted.join(", ")}.` : "",
        j.heldAtHigherState?.length ? `Held at higher state: ${j.heldAtHigherState.length}.` : "",
      ].filter(Boolean);
      setBanner(parts.join(" "));
      if (j.campaign) setView(j.campaign);
      load();
    } finally { setBusy(false); }
  };

  const patch = async (queueId: string, body: Record<string, unknown>): Promise<string | null> => {
    setBusy(true);
    try {
      const r = await fetch(`/api/post-queue/${queueId}`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) return j?.error ?? `HTTP ${r.status}`;
      load();
      return null;
    } finally { setBusy(false); }
  };

  const markPosted = async (queueId: string, postUrl: string, retiredCheck: string): Promise<string | null> => {
    setBusy(true);
    try {
      const r = await fetch(`/api/post-queue/${queueId}/posted`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ postUrl: postUrl || null, retiredCheck: retiredCheck || null }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) return j?.error ?? `HTTP ${r.status}`;
      load();
      return null;
    } finally { setBusy(false); }
  };

  const todayIso = new Date().toISOString().slice(0, 10);
  const isVideo = (r: QueueRow) => /^Video|🎥/.test(r.format ?? "");
  const isCarousel = (r: QueueRow) => /carousel/i.test(`${r.format ?? ""} ${r.angle}`);
  /* A Mandate edition is recurring in the standing sense, but the salvaged
     first edition arrives already `drafted` — so the angle decides, not the
     status. */
  const isMandate = (r: QueueRow) => r.status === "recurring" || /^THE MANDATE/i.test(r.angle);

  const total = rows ?? [];
  /* The calendar on screen: one campaign's rows, or the standing queue's. A
     row imported before migration 135 stamped campaigns sits under STANDING
     until the press that parks it also stamps it. */
  const all = useMemo(
    () => total.filter(r => (view === STANDING || view === null ? r.campaign == null : r.campaign === view)),
    [total, view],
  );
  const shown = useMemo(() => all.filter(r => {
    switch (filter) {
      case "today": return String(r.scheduled_for ?? "").slice(0, 10) === todayIso;
      case "videos": return isVideo(r);
      case "carousels": return isCarousel(r);
      case "mandates": return isMandate(r);
      case "posted": return r.status === "posted";
      default: return true;
    }
  }), [all, filter, todayIso]);

  /* Week labels come from the CAMPAIGN FILE, so a new calendar never inherits
     the old one's dates. The fallback exists for a file that has none. */
  const weekLabel: Record<string, string> =
    current && Object.keys(current.weeks).length ? current.weeks : (view === STANDING ? {} : FALLBACK_WEEKS);
  const weekIds = Object.keys(weekLabel);

  /* Weeks, from the campaign's own tier labels — an unlabelled row still
     renders, in its own trailing group, rather than vanishing. */
  const weeks = useMemo(() => {
    const m = new Map<string, QueueRow[]>();
    for (const r of shown) {
      const k = r.tier && weekLabel[r.tier] ? r.tier : "other";
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(r);
    }
    for (const list of m.values()) {
      list.sort((a, b) => String(a.scheduled_for ?? "9999").localeCompare(String(b.scheduled_for ?? "9999")));
    }
    return m;
  }, [shown, weekLabel]);

  const strip: CompareItem[] = weekIds.map(w => {
    const group = all.filter(r => r.tier === w);
    const posted = group.filter(r => r.status === "posted").length;
    return {
      id: w,
      label: `Week ${w.slice(1)} · ${group.length}`,
      value: group.length ? `${posted} posted` : null,
      unknownWhy: group.length ? undefined : "No slots loaded for this week yet.",
    };
  });

  /* One chip per shipped campaign (newest first) plus the standing queue.
     Counts are rows actually in the table, so a campaign that ships in the
     code but has not been imported reads "0" — press Import to load it. */
  const campaignChips: Chip[] = [
    ...campaigns.map(c => ({
      id: c.name,
      label: `${windowLabel(c.first, c.last)}${c.name === campaigns[0]?.name ? "" : " · superseded"}`,
      value: String(total.filter(r => r.campaign === c.name).length),
    })),
    { id: STANDING, label: "Standing queue", value: String(total.filter(r => r.campaign == null).length) },
  ];

  const chips: Chip[] = [
    { id: "all", label: "All", value: String(all.length) },
    { id: "today", label: "Today", value: (() => { const n = all.filter(r => String(r.scheduled_for ?? "").slice(0, 10) === todayIso).length; return n ? String(n) : null; })() },
    ...(all.some(isVideo) ? [{ id: "videos", label: "Videos", value: String(all.filter(isVideo).length) }] : []),
    ...(all.some(isCarousel) ? [{ id: "carousels", label: "Carousels", value: String(all.filter(isCarousel).length) }] : []),
    ...(all.some(isMandate) ? [{ id: "mandates", label: "Mandates", value: String(all.filter(isMandate).length) }] : []),
    { id: "posted", label: "Posted", value: String(all.filter(r => r.status === "posted").length) },
  ];

  const todaysSlot = all.find(r => String(r.scheduled_for ?? "").slice(0, 10) === todayIso && r.status !== "posted");
  const selected = all.find(r => r.queue_id === selectedId) ?? null;

  if (error) {
    return (
      <Page>
        <InfoBanner tone="caution">The queue did not load ({error}). Retry by reopening the tab.</InfoBanner>
      </Page>
    );
  }
  if (rows === null) {
    return <Page><div style={{ fontSize: 13, color: T.muted2 }}>Loading the posting queue…</div></Page>;
  }

  const newest = campaigns[0] ?? null;
  const loadLabel = current
    ? `Load ${current.title ?? current.name}`
    : newest ? `Load ${newest.title ?? newest.name}` : "Load campaign";

  /* Nothing in the table at all: the first press. */
  if (total.length === 0) {
    return (
      <Page>
        {banner && <div style={bannerBox}>{banner}</div>}
        <div style={{ maxWidth: 560, margin: "80px auto", textAlign: "center" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: T.ink }}>No campaign loaded</div>
          <p style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.6, marginTop: 8 }}>
            {newest
              ? <>{newest.title ?? newest.name} ({newest.rows} slots · {windowLabel(newest.first, newest.last)}) ships with the app as content. </>
              : <>No campaign file ships with this build. </>}
            Loading it here creates the calendar; drafting stays in Cowork, and
            posting stays a human press on LinkedIn — this screen only ever tracks.
          </p>
          {newest && (
            <button type="button" onClick={seedCampaign} disabled={busy} style={primaryBtn}>
              {busy ? "Loading…" : loadLabel}
            </button>
          )}
        </div>
      </Page>
    );
  }

  return (
    <Page>
      {banner && <div style={bannerBox}>{banner}</div>}
      {/* Which calendar. The newest shipped campaign is first and is what
          Import loads; a superseded one stays readable — parked, not deleted. */}
      {campaignChips.length > 1 && (
        <div style={{ marginBottom: 10 }}>
          <ChipRow
            chips={campaignChips}
            activeId={view ?? STANDING}
            onPick={id => { setView(id); setFilter("all"); setSelectedId(null); }}
            right={
              current && current.name !== newest?.name
                ? <span style={{ fontSize: 12.5, color: T.muted2 }}>Superseded by {newest?.title ?? newest?.name} — read-only in spirit; its rows were parked, not deleted.</span>
                : current?.note
                  ? <span style={{ fontSize: 12.5, color: T.muted2 }} title={current.note}>{current.note.split(/(?<=\.)\s/)[0]}</span>
                  : null
            }
          />
        </div>
      )}
      {all.length === 0 ? (
        <div style={{ maxWidth: 560, margin: "48px auto", textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>
            {view === STANDING ? "Nothing in the standing queue" : "This campaign is not loaded yet"}
          </div>
          {view !== STANDING && current && (
            <>
              <p style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.6, marginTop: 8 }}>
                {current.title ?? current.name} · {current.rows} slots · {windowLabel(current.first, current.last)}.
                {current.supersedes ? ` Loading it parks the ${current.supersedes} calendar's slots (never a posted one) and says so.` : ""}
              </p>
              <button type="button" onClick={seedCampaign} disabled={busy} style={primaryBtn}>
                {busy ? "Loading…" : loadLabel}
              </button>
            </>
          )}
        </div>
      ) : (<>
      <CompareStrip items={strip} />
      <ChipRow
        chips={chips}
        activeId={filter}
        onPick={id => setFilter(id as FilterId)}
        right={
          view !== STANDING && current ? (
            <button type="button" onClick={seedCampaign} disabled={busy} style={ghostBtn}
                    title="Re-import this campaign's content. State-preserving: it can never un-post or re-date anything a human set; it parks a superseded calendar and reports what moved.">
              Re-import {current.name}
            </button>
          ) : null
        }
      />

      <div style={{ marginTop: 14 }}>
        <ListDetail
          detailEmpty={<>Pick a slot to see what it carries and move its state.</>}
          list={
            <div>
              {todaysSlot && filter === "all" && (
                <div style={{ marginBottom: 2 }}>
                  <Endorsement
                    claim={`Today's slot — ${todaysSlot.angle}.`}
                    grounds={`${todaysSlot.lead ?? ""} · ${STATUS_LABEL[todaysSlot.status] ?? todaysSlot.status}.`}
                  />
                </div>
              )}
              <Sheet>
                {[...weeks.entries()].map(([w, group]) => (
                  <div key={w}>
                    <GroupHeader
                      title={weekLabel[w] ?? (view === STANDING ? "Standing queue — no week" : "Unscheduled")}
                      columns={["When", "Status"]}
                    />
                    {group.map(r => {
                      const d = daysUntil(r.scheduled_for);
                      return (
                        <ResultRow
                          key={r.queue_id}
                          anchor={`${isVideo(r) ? "🎥 " : ""}${r.angle}`}
                          sub={[r.lead, r.format].filter(Boolean).join(" · ")}
                          selected={selectedId === r.queue_id}
                          onClick={() => setSelectedId(r.queue_id)}
                          endorsed={r.queue_id === todaysSlot?.queue_id && filter === "all"}
                          values={[
                            {
                              text: r.scheduled_for
                                ? String(r.scheduled_for).slice(5, 10).replace("-", "/")
                                : null,
                              note: r.status !== "posted" && d != null && d < 0 ? "missed" : undefined,
                            },
                            {
                              text: STATUS_LABEL[r.status] ?? r.status,
                              lead: r.status === "posted",
                              badge: r.retired_check === "clean" ? "checked" : undefined,
                              note: r.retired_check === "flagged" ? "flagged" : undefined,
                            },
                          ]}
                        />
                      );
                    })}
                  </div>
                ))}
              </Sheet>
            </div>
          }
          detail={selected ? (
            <SlotDetail
              row={selected}
              busy={busy}
              onPatch={patch}
              onMarkPosted={markPosted}
            />
          ) : null}
        />
      </div>

      </>)}

      <RankingNote
        title="How this calendar works"
        ordering="Slots group by the campaign's own weeks and sort by date. The content (copy, scripts, collateral specs) is owned by the plan in the studio — edit there, re-export, re-import; this screen owns only state."
        caveats={[
          "Nothing here fires. There is no scheduler and no auto-post: Mark posted records that a human posted, and the timestamp is stamped at the click.",
          "A slot that may state figures cannot be marked posted until retired-check has run clean on its caption — the server refuses, not the button.",
          "A new campaign parks the calendar it supersedes rather than deleting it — a posted row is never touched — and a queue id belongs to one campaign forever, because that id is what its analytics are joined on.",
          ...(all.some(isMandate) ? ["A Mandate edition ships only when the sweep verifies three or more in-window deals against primary sources; a padded Mandate is worse than a skipped one — a quiet week is stated, not filled."] : []),
        ]}
      />
    </Page>
  );
}

/* ── the slot detail ─────────────────────────────────────────────────── */

function SlotDetail({ row, busy, onPatch, onMarkPosted }: {
  row: QueueRow;
  busy: boolean;
  onPatch: (queueId: string, body: Record<string, unknown>) => Promise<string | null>;
  onMarkPosted: (queueId: string, postUrl: string, retiredCheck: string) => Promise<string | null>;
}) {
  const [err, setErr] = useState<string | null>(null);
  const [postUrl, setPostUrl] = useState(row.post_url ?? "");
  const [check, setCheck] = useState(row.retired_check === "not_run" ? "" : row.retired_check);
  const [notes, setNotes] = useState(row.notes ?? "");
  useEffect(() => {
    setErr(null);
    setPostUrl(row.post_url ?? "");
    setCheck(row.retired_check === "not_run" ? "" : row.retired_check);
    setNotes(row.notes ?? "");
  }, [row.queue_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const act = async (p: Promise<string | null>) => setErr(await p);

  return (
    <div>
      <SummaryCard
        kicker={row.lead ?? row.queue_id}
        value={row.angle}
        badge={STATUS_LABEL[row.status] ?? row.status}
        sub={[row.format, row.scheduled_for ? `scheduled ${String(row.scheduled_for).slice(0, 10)}${dueLabel(row.scheduled_for) ? ` (${dueLabel(row.scheduled_for)})` : ""}` : "no date"].filter(Boolean).join(" · ")}
      />

      <DetailCard title="What it carries">
        {row.carries && <p style={p}>{row.carries}</p>}
        <p style={{ ...p, marginBottom: 0 }}>
          {row.may_state_figure
            ? <>States figures{row.evidence_grade && row.evidence_grade !== "n/a" ? ` · evidence ${row.evidence_grade}` : ""} — the caption goes through retired-check before it ships.</>
            : <>States NO figures by design — an argument, not a data post.</>}
        </p>
        {row.source_disclosure && (
          <p style={{ ...p, marginTop: 6, marginBottom: 0, color: T.muted2 }}>{row.source_disclosure}</p>
        )}
      </DetailCard>

      {row.status !== "posted" && (
        <DetailCard title="State">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {row.status !== "drafted" && row.status !== "recurring" && (
              <button type="button" disabled={busy} style={ghostBtn}
                      onClick={() => act(onPatch(row.queue_id, { status: "drafted" }))}>
                Mark drafted
              </button>
            )}
            {row.status === "recurring" && (
              <span style={{ fontSize: 12.5, color: T.muted, alignSelf: "center" }}>
                Recurring — this week's edition gets built in Cowork, then posted here.
              </span>
            )}
            <button type="button" disabled={busy} style={ghostBtn}
                    onClick={() => act(onPatch(row.queue_id, { status: row.status === "parked" ? "next" : "parked" }))}>
              {row.status === "parked" ? "Unpark" : "Park"}
            </button>
          </div>

          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <select value={check} onChange={e => setCheck(e.target.value)} style={input} aria-label="Retired-check result">
              <option value="">retired-check: not run</option>
              <option value="clean">retired-check: clean</option>
              <option value="flagged">retired-check: flagged</option>
            </select>
            <input value={postUrl} onChange={e => setPostUrl(e.target.value)}
                   placeholder="LinkedIn post URL (after you post)" style={input} />
            <button
              type="button"
              disabled={busy}
              style={primaryBtn}
              title="Records that YOU posted it on LinkedIn — nothing is published from here."
              onClick={() => act(onMarkPosted(row.queue_id, postUrl.trim(), check))}
            >
              Mark posted
            </button>
          </div>
        </DetailCard>
      )}

      {row.status === "posted" && (
        <DetailCard title="Posted">
          <p style={p}>
            {row.posted_at ? `Marked posted ${String(row.posted_at).slice(0, 16).replace("T", " ")}.` : "Posted."}
            {row.post_url && <> {" "}<a href={row.post_url} target="_blank" rel="noreferrer" style={{ color: T.blue }}>Open the post →</a></>}
          </p>
          <p style={{ ...p, marginBottom: 0, color: T.muted2 }}>
            Performance arrives when the next LinkedIn analytics export is imported — every number in the app is one LinkedIn wrote.
          </p>
        </DetailCard>
      )}

      <DetailCard title="Notes">
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                  placeholder="Build notes, art picks, what happened…" style={{ ...input, resize: "vertical", lineHeight: 1.5, width: "100%" }} />
        <button type="button" disabled={busy || notes === (row.notes ?? "")} style={{ ...ghostBtn, marginTop: 8 }}
                onClick={() => act(onPatch(row.queue_id, { notes }))}>
          Save notes
        </button>
      </DetailCard>

      {err && (
        <div style={{ marginTop: 12 }}>
          <InfoBanner tone="caution">{err}</InfoBanner>
        </div>
      )}
    </div>
  );
}

/* ── styles — the transcription's shapes ─────────────────────────────── */

const p: CSSProperties = { margin: "0 0 8px", fontSize: 13, color: T.muted, lineHeight: 1.6 };

const input: CSSProperties = {
  font: "inherit", fontSize: 13.5, color: T.ink, background: T.track,
  border: "none", borderRadius: 8, padding: "9px 11px", outline: "none", minWidth: 0,
};

const ghostBtn: CSSProperties = {
  font: "inherit", fontSize: 13, fontWeight: 600, color: T.muted,
  background: T.white, border: `1px solid ${T.inputBd}`, borderRadius: 999,
  padding: "7px 14px", cursor: "pointer",
};

const primaryBtn: CSSProperties = {
  font: "inherit", fontSize: 13.5, fontWeight: 700, color: "#fff",
  background: T.blue, border: "none", borderRadius: 8, padding: "10px 18px",
  cursor: "pointer", marginTop: 4,
};

const bannerBox: CSSProperties = {
  margin: "0 0 12px", padding: "10px 14px", background: T.blueBg,
  borderRadius: 8, fontSize: 13, color: T.ink, lineHeight: 1.5,
};
