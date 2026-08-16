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
}

const STATUS_LABEL: Record<string, string> = {
  next: "Next", drafted: "Drafted", posted: "Posted", parked: "Parked", recurring: "Recurring",
};

const WEEK_LABEL: Record<string, string> = {
  W1: "Week 1 · Aug 17–21 · establish the seat",
  W2: "Week 2 · Aug 24–28 · register credibility",
  W3: "Week 3 · Aug 31 – Sep 4 · DEALSOURCE WEEK",
  W4: "Week 4 · Sep 7–11 · close the arc",
};

type FilterId = "all" | "today" | "videos" | "mandates" | "posted";

export default function PostingScreen(_props: AtlasScreenProps) {
  const [rows, setRows] = useState<QueueRow[] | null>(null);
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
  }, []);
  useEffect(load, [load]);

  const seedCampaign = async () => {
    setBusy(true); setBanner(null);
    try {
      const r = await fetch("/api/post-queue/import-campaign", {
        method: "POST", headers: authHeaders(),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) { setBanner(`Import failed: ${j?.error ?? r.status}`); return; }
      setBanner(
        `${j.campaign ?? "Campaign"} — ${j.inserted} slots new, ${j.updated} refreshed, ${j.scheduled} dated.` +
        (j.heldAtHigherState?.length ? ` Held at higher state: ${j.heldAtHigherState.length}.` : ""),
      );
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
  const isVideo = (r: QueueRow) => (r.format ?? "").startsWith("Video");
  const isMandate = (r: QueueRow) => r.status === "recurring";

  const all = rows ?? [];
  const shown = useMemo(() => all.filter(r => {
    switch (filter) {
      case "today": return String(r.scheduled_for ?? "").slice(0, 10) === todayIso;
      case "videos": return isVideo(r);
      case "mandates": return isMandate(r);
      case "posted": return r.status === "posted";
      default: return true;
    }
  }), [all, filter, todayIso]);

  /* Weeks, from the campaign's own tier labels — an unlabelled row still
     renders, in its own trailing group, rather than vanishing. */
  const weeks = useMemo(() => {
    const m = new Map<string, QueueRow[]>();
    for (const r of shown) {
      const k = r.tier && WEEK_LABEL[r.tier] ? r.tier : "other";
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(r);
    }
    for (const list of m.values()) {
      list.sort((a, b) => String(a.scheduled_for ?? "9999").localeCompare(String(b.scheduled_for ?? "9999")));
    }
    return m;
  }, [shown]);

  const strip: CompareItem[] = ["W1", "W2", "W3", "W4"].map(w => {
    const group = all.filter(r => r.tier === w);
    const posted = group.filter(r => r.status === "posted").length;
    return {
      id: w,
      label: `Week ${w.slice(1)} · ${group.length}`,
      value: group.length ? `${posted} posted` : null,
      unknownWhy: group.length ? undefined : "No slots loaded for this week yet.",
    };
  });

  const chips: Chip[] = [
    { id: "all", label: "All", value: String(all.length) },
    { id: "today", label: "Today", value: (() => { const n = all.filter(r => String(r.scheduled_for ?? "").slice(0, 10) === todayIso).length; return n ? String(n) : null; })() },
    { id: "videos", label: "Videos", value: String(all.filter(isVideo).length) },
    { id: "mandates", label: "Mandates", value: String(all.filter(isMandate).length) },
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

  if (all.length === 0) {
    return (
      <Page>
        {banner && <div style={bannerBox}>{banner}</div>}
        <div style={{ maxWidth: 560, margin: "80px auto", textAlign: "center" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: T.ink }}>No campaign loaded</div>
          <p style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.6, marginTop: 8 }}>
            The 30-day plan (Aug 17 – Sep 11 · 12 posts · 8 videos · 4 Mandate
            editions) ships with the app as content. Loading it here creates
            the calendar; drafting stays in Cowork, and posting stays a human
            press on LinkedIn — this screen only ever tracks.
          </p>
          <button type="button" onClick={seedCampaign} disabled={busy} style={primaryBtn}>
            {busy ? "Loading…" : "Load the Aug 17 campaign"}
          </button>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      {banner && <div style={bannerBox}>{banner}</div>}
      <CompareStrip items={strip} />
      <ChipRow
        chips={chips}
        activeId={filter}
        onPick={id => setFilter(id as FilterId)}
        right={
          <button type="button" onClick={seedCampaign} disabled={busy} style={ghostBtn}
                  title="Re-import the plan's content. State-preserving: it can never un-post or re-date anything a human set.">
            Re-import plan
          </button>
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
                      title={WEEK_LABEL[w] ?? "Unscheduled"}
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

      <RankingNote
        title="How this calendar works"
        ordering="Slots group by campaign week and sort by date. The content (copy, scripts, collateral specs) is owned by the Cowork plan — edit there and re-import; this screen owns only state."
        caveats={[
          "Nothing here fires. There is no scheduler and no auto-post: Mark posted records that a human posted, and the timestamp is stamped at the click.",
          "A slot that may state figures cannot be marked posted until retired-check has run clean on its caption — the server refuses, not the button.",
          "The four Mandate editions carry live deal data and are unwritten by design: built each week from actual announcements, nothing invented, a thin week runs four bullets.",
          "The month's metric is not impressions — it is profile views from named people in DFW. Decide now to trust the small number.",
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
