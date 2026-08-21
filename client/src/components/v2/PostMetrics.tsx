/**
 * WHAT THE POST DID — the pillar it argued for, the numbers it earned, and the
 * people worth keeping.
 *
 * (Paul, 2026-08-21: "all i want to do is paste in the link to the post and
 * track metrics against each post.")
 *
 * Three surfaces, in the order he uses them:
 *
 *   PillarPick    before or after posting — which of the five this argues for
 *   Readings      after posting — the five numbers off LinkedIn, on a DAY
 *   Engagers      after posting — the commenters worth saving, into Leads
 *
 * and one that reads across all of them, `PillarRollup`, which is the only
 * reason the other three exist: it answers whether The Capture — the 30%
 * whitespace bet — is actually earning its weight.
 *
 * THE HONESTY RULES THIS FILE KEEPS, all of which are one-line changes to
 * break and none of which announce themselves when broken:
 *
 *   · A BLANK BOX IS UNKNOWN, NOT ZERO. Every input is held as TEXT and sent
 *     as null when empty. `?? 0` anywhere in here would turn "I have not typed
 *     it in yet" into a measurement that drags a pillar's median down.
 *   · MISSING RENDERS AS "–". Never 0, never blank — the same rule the
 *     site-visit email keeps for days before counting began.
 *   · THE RATE IS NEVER CALLED "ENGAGEMENT RATE". LinkedIn's own engagements
 *     figure includes clicks and follows, so ours is a strict subset and would
 *     never reconcile with his screen. It is printed as what it is:
 *     reactions + comments + reposts per 1,000 impressions.
 *   · A READING CARRIES ITS AGE. LinkedIn revises figures upward for days, so
 *     two posts read at different ages are not comparable and the UI says so
 *     rather than averaging them silently.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { authHeaders } from "../../hooks/useAuth";
import { C, input, btnPrimary, btnGhost, mono, chip } from "./tokens";
import { localIso } from "./Leads";
import {
  PILLARS, pillarById, pillarRollup, per1k,
  MIN_TAGGED_FOR_SHARE, MIN_READINGS_FOR_RATE,
  type PillarId, type Reading, type PostRow, type Rollup,
} from "@shared/pillars";

/* ── shapes ──────────────────────────────────────────────────────────── */

export interface ReadingRow {
  queue_id: string;
  read_on: string;
  days_after_post: number | null;
  impressions: number | null;
  members_reached: number | null;
  reactions: number | null;
  comments: number | null;
  reposts: number | null;
}

const toReading = (r: ReadingRow): Reading => ({
  queueId: r.queue_id,
  readOn: r.read_on,
  daysAfterPost: r.days_after_post,
  impressions: r.impressions,
  membersReached: r.members_reached,
  reactions: r.reactions,
  comments: r.comments,
  reposts: r.reposts,
});

/** Missing is a dash. Never a zero, never an empty cell. */
const n = (v: number | null | undefined) =>
  v == null ? "–" : v.toLocaleString("en-US");

const rate1 = (v: number | null) => (v == null ? "–" : v.toFixed(1));

/* ── the plan's own pillar, where it declared one ─────────────────────── */

/**
 * The live 30-day calendar names a pillar for every slot, as prose inside
 * `format`: "Video · Diligence Tell · pillar Dead Deal Economics". Those seven
 * names predate this register and are NOT retired, so a slot can carry a plan
 * pillar and an app pillar that disagree.
 *
 * Rather than merge them — which would pick a winner silently — the picker
 * prints what the plan said underneath, the same way `copy_note` surfaces the
 * two-captions problem instead of resolving it. The human decides.
 */
export function planPillar(format: string | null | undefined): string | null {
  if (!format) return null;
  const m = /(?:^|·)\s*pillar\s+(.+?)\s*(?:·|$)/i.exec(format);
  return m ? m[1].trim() : null;
}

/* ── 1 · the pillar ──────────────────────────────────────────────────── */

export function PillarPick({ pillar, format, onSet }: {
  pillar: string | null;
  format: string | null;
  onSet: (p: string) => Promise<unknown>;
}) {
  const declared = planPillar(format);
  const current = pillarById(pillar);
  return (
    <div style={{ marginBottom: 10, padding: "12px 14px", background: C.panel }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Pillar</div>
      <select
        value={pillar ?? ""}
        onChange={e => { void onSet(e.target.value); }}
        style={{ ...input, width: "100%" }}
        aria-label="Content pillar"
      >
        <option value="">— not tagged —</option>
        {PILLARS.map(p => (
          <option key={p.id} value={p.id}>{p.name} · target {p.targetPct}%</option>
        ))}
      </select>
      {current && (
        <div style={{ fontSize: 12.5, color: C.body, marginTop: 6, lineHeight: 1.5 }}>
          {current.scope}
        </div>
      )}
      {/* The reconciliation, shown rather than resolved. */}
      {declared && (
        <div style={{ ...mono, marginTop: 6, color: C.muted }}>
          the plan filed this under “{declared}”
          {current ? "" : " — tag it above to count it"}
        </div>
      )}
    </div>
  );
}

/* ── 2 · the readings ────────────────────────────────────────────────── */

const FIELDS = [
  { key: "impressions",     label: "Impressions" },
  { key: "membersReached",  label: "Members reached" },
  { key: "reactions",       label: "Reactions" },
  { key: "comments",        label: "Comments" },
  { key: "reposts",         label: "Reposts" },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];

export function Readings({ queueId, readings, onRecord, onRemove }: {
  queueId: string;
  readings: ReadingRow[];
  onRecord: (body: Record<string, string>) => Promise<string | null>;
  onRemove: (readOn: string) => Promise<string | null>;
}) {
  const mine = useMemo(
    () => readings.filter(r => r.queue_id === queueId).sort((a, b) => b.read_on.localeCompare(a.read_on)),
    [readings, queueId],
  );
  const [readOn, setReadOn] = useState(localIso());
  /* HELD AS TEXT, deliberately. A numeric state seeded `?? 0` would render a
     never-typed field as "0" and then save it as a measurement. */
  const [vals, setVals] = useState<Record<FieldKey, string>>(
    { impressions: "", membersReached: "", reactions: "", comments: "", reposts: "" },
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  /* Editing a day already recorded loads it, so a correction is a correction
     rather than a blind overwrite of fields he cannot see. */
  useEffect(() => {
    const existing = mine.find(r => r.read_on === readOn);
    setVals({
      impressions:    existing?.impressions     != null ? String(existing.impressions) : "",
      membersReached: existing?.members_reached != null ? String(existing.members_reached) : "",
      reactions:      existing?.reactions       != null ? String(existing.reactions) : "",
      comments:       existing?.comments        != null ? String(existing.comments) : "",
      reposts:        existing?.reposts         != null ? String(existing.reposts) : "",
    });
  }, [readOn, mine]);

  const anything = Object.values(vals).some(v => v.trim() !== "");

  const save = useCallback(async () => {
    setBusy(true); setErr(null);
    const e = await onRecord({ readOn, ...vals });
    setBusy(false);
    if (e) setErr(e);
  }, [onRecord, readOn, vals]);

  const editing = mine.some(r => r.read_on === readOn);

  return (
    <div style={{ marginTop: 10, padding: "12px 14px", background: C.panel }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>What it did</div>
        <div style={{ ...mono, color: C.muted }}>
          type what LinkedIn shows you — blank stays blank
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
        <input type="date" value={readOn} max={localIso()}
               onChange={e => setReadOn(e.target.value)}
               style={{ ...input, width: 170 }} aria-label="Day you read the numbers" />
        <span style={{ ...mono, color: C.muted }}>
          {editing ? "correcting this day’s reading" : "the day you read them"}
        </span>
      </div>

      {/* auto-fit so five boxes become two columns on a phone without a breakpoint */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
        {FIELDS.map(f => (
          <label key={f.key} style={{ display: "block" }}>
            <span style={{ ...mono, display: "block", marginBottom: 3, color: C.body }}>{f.label}</span>
            <input
              value={vals[f.key]}
              onChange={e => setVals(v => ({ ...v, [f.key]: e.target.value }))}
              inputMode="numeric"
              placeholder="–"
              style={{ ...input, width: "100%" }}
            />
          </label>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 10 }}>
        <button type="button" style={btnPrimary} disabled={!anything || busy} onClick={() => void save()}>
          {busy ? "Saving…" : editing ? "Update this reading" : "Record this reading"}
        </button>
        {err && <span style={{ color: C.danger, fontSize: 13 }}>{err}</span>}
      </div>

      {mine.length > 0 && (
        <div style={{ marginTop: 12, borderTop: `1px solid ${C.hair}`, paddingTop: 10 }}>
          <div style={{ ...mono, color: C.muted, marginBottom: 6 }}>
            {mine.length === 1 ? "one reading" : `${mine.length} readings`} — LinkedIn keeps revising for about a fortnight
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {mine.map(r => {
              const v = per1k(toReading(r));
              return (
                <div key={r.read_on} style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap", fontSize: 13 }}>
                  <span style={{ ...mono, color: C.ink, minWidth: 96 }}>
                    {r.read_on}
                    {r.days_after_post != null && (
                      <span style={{ color: C.muted }}> · day {r.days_after_post}</span>
                    )}
                  </span>
                  <span style={{ color: C.body }}>
                    {n(r.impressions)} impressions · {n(r.reactions)}/{n(r.comments)}/{n(r.reposts)} r/c/r
                  </span>
                  {v != null && (
                    <span style={chip} title="reactions + comments + reposts per 1,000 impressions">
                      {rate1(v)} per 1k
                    </span>
                  )}
                  <button type="button"
                          style={{ ...btnGhost, padding: "3px 8px", fontSize: 12 }}
                          onClick={() => void onRemove(r.read_on)}>
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 3 · the people ──────────────────────────────────────────────────── */

/**
 * WHO ENGAGED — the only reliable lead capture available.
 *
 * The website cannot identify a stranger: a visit is a keyed hash of an IP,
 * and no lawful path leads from it to a person. LinkedIn, meanwhile, hands
 * over every commenter and reactor by name. So the capture point is here.
 *
 * NOTHING IS SENT. This writes a `crm_leads` row and stamps `source` with the
 * post — the practice's "one touch, one press, one human" law is untouched,
 * because the outreach machine has no batch release and this creates no touch.
 * A lead saved here is a name with a follow-up date, nothing more.
 */
export function Engagers({ queueId, pillar, onSave }: {
  queueId: string;
  pillar: string | null;
  onSave: (lead: { name: string; org: string; linkedin_url: string; source: string }) => Promise<string | null>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [url, setUrl] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const label = pillarById(pillar)?.name;
  const source = `${queueId}${label ? ` · ${label}` : ""}`;

  const add = useCallback(async () => {
    const nm = name.trim();
    if (!nm) return;
    setBusy(true); setErr(null);
    const e = await onSave({ name: nm, org: org.trim(), linkedin_url: url.trim(), source });
    setBusy(false);
    if (e) { setErr(e); return; }
    setSaved(s => [...s, nm]);
    setName(""); setOrg(""); setUrl("");
  }, [name, org, url, source, onSave]);

  if (!open) {
    return (
      <button type="button" style={{ ...btnGhost, marginTop: 10 }} onClick={() => setOpen(true)}>
        Who engaged →
      </button>
    );
  }

  return (
    <div style={{ marginTop: 10, padding: "12px 14px", background: C.panel }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Who engaged</div>
      <div style={{ fontSize: 12.5, color: C.body, marginBottom: 8, lineHeight: 1.5 }}>
        Names off the post — commenters first. Saves to Leads with a follow-up date.
        Nothing is sent to anyone.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" style={input} />
        <input value={org} onChange={e => setOrg(e.target.value)} placeholder="Firm (optional)" style={input} />
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="linkedin.com/in/… (optional)" style={input} />
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 8 }}>
        <button type="button" style={btnPrimary} disabled={!name.trim() || busy} onClick={() => void add()}>
          {busy ? "Saving…" : "Save to Leads"}
        </button>
        <span style={{ ...mono, color: C.muted }}>source: {source}</span>
        {err && <span style={{ color: C.danger, fontSize: 13 }}>{err}</span>}
      </div>
      {saved.length > 0 && (
        <div style={{ ...mono, marginTop: 8, color: C.green }}>
          saved: {saved.join(" · ")}
        </div>
      )}
    </div>
  );
}

/* ── 4 · the rollup — the only reason the rest exists ─────────────────── */

export function PillarRollup({ posts, readings, campaign }: {
  posts: PostRow[];
  readings: ReadingRow[];
  campaign: string | null;
}) {
  const roll: Rollup = useMemo(
    () => pillarRollup(posts, readings.map(toReading), { campaign }),
    [posts, readings, campaign],
  );

  const cell: CSSProperties = { padding: "7px 10px", textAlign: "right", fontFamily: C.mono, fontSize: 13 };
  const head: CSSProperties = { ...mono, padding: "0 10px 5px", textAlign: "right", color: C.muted, whiteSpace: "nowrap" };

  return (
    <div style={{ border: `1px solid ${C.hair}`, marginBottom: 14, background: C.bg }}>
      <div style={{ padding: "11px 14px", borderBottom: `1px solid ${C.hair}`, display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
        <div style={{ fontFamily: C.display, fontSize: 17, fontWeight: 600 }}>By pillar</div>
        <div style={{ ...mono, color: C.muted }}>
          {roll.tagged} tagged
          {roll.untagged > 0 && ` · ${roll.untagged} not tagged`}
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 420 }}>
          <thead>
            <tr>
              <th style={{ ...head, textAlign: "left", paddingLeft: 14 }}>Pillar</th>
              <th style={head}>Posts</th>
              {roll.showTargets && <th style={head}>Share</th>}
              {roll.showTargets && <th style={head}>Target</th>}
              <th style={head}>Read</th>
              <th style={head} title="reactions + comments + reposts per 1,000 impressions">Per 1k</th>
            </tr>
          </thead>
          <tbody>
            {roll.lines.map(l => (
              <tr key={l.id} style={{ borderTop: `1px solid ${C.hair}` }}>
                <td style={{ padding: "7px 10px 7px 14px", fontSize: 13.5, fontWeight: 600, color: C.ink }}>
                  {l.name}
                </td>
                <td style={cell}>{l.posts}</td>
                {roll.showTargets && (
                  <td style={cell}>{l.sharePct == null ? "–" : `${Math.round(l.sharePct)}%`}</td>
                )}
                {roll.showTargets && <td style={{ ...cell, color: C.muted }}>{l.targetPct}%</td>}
                <td style={{ ...cell, color: C.muted }}>{l.withMetrics}</td>
                <td style={cell}>
                  {l.medianPer1k == null
                    ? <span style={{ color: C.muted }}>–</span>
                    : rate1(l.medianPer1k)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* WHAT THE NUMBERS ARE, AND WHAT THEY ARE NOT. Every line below exists
          because the figure above it would otherwise read as more than it is. */}
      <div style={{ padding: "9px 14px", borderTop: `1px solid ${C.hair}`, fontSize: 12.5, color: C.muted, lineHeight: 1.55 }}>
        <div>
          <b style={{ color: C.body }}>Per 1k</b> is the median of reactions + comments + reposts per 1,000 impressions,
          over the latest reading of each post. It is arithmetic on your typed numbers — not a figure LinkedIn reports,
          whose own “engagements” also counts clicks and follows.
        </div>
        {!roll.showTargets && (
          <div style={{ marginTop: 4 }}>
            No targets on this window — it was planned before these pillars existed, against its own weights.
            Targets begin with the next campaign.
          </div>
        )}
        {roll.showTargets && !roll.shareIsMeaningful && (
          <div style={{ marginTop: 4 }}>
            Share is withheld until {MIN_TAGGED_FOR_SHARE} posts are tagged — below that a percentage moves several
            points per post and would be noise with a decimal on it.
          </div>
        )}
        <div style={{ marginTop: 4 }}>
          A pillar shows no rate until it has {MIN_READINGS_FOR_RATE} readings. A post you have not typed in is
          counted as unread, never as a zero.
        </div>
      </div>
    </div>
  );
}
