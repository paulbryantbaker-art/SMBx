/**
 * Mobile CLIENTS — the client pipeline on a phone (rule 11: mobile first).
 *
 * The phone job is NOT data entry. It is the two things you need in the ten
 * minutes before a call, and the one thing you do in the ten minutes after:
 *
 *   before → who is this firm, why does it rank, who do I ask for
 *   after  → move the stage, set the next action, log what happened
 *
 * Everything else — CSV import, re-scoring the whole board, editing evidence —
 * is desktop work and is deliberately absent rather than cramped into a sheet.
 * The board reads the SAME ranked list from `/api/crm/accounts` and the SAME
 * vocabulary from `lib/crm.ts`, so the two platforms cannot disagree.
 *
 * Single column, RT tokens, in-place drill-down with a "Clients" back row —
 * the pattern StudioResearchM established. No position:fixed with a background
 * colour anywhere (Safari toolbar rule).
 */
import { useState } from "react";
import type { AtlasScreenProps } from "../../desktop/atlasNav";
import { useCrmAccounts, useCrmAccount, type CrmFilters } from "../../../../hooks/useCrmAccounts";
import {
  CRM_STAGES, STAGE_LABEL, MOMENT_LABEL, MOMENT_WHY, SEGMENT_LABEL, GRADE_LABEL,
  ACTIVITY_KINDS, dueLabel, touchLabel, daysUntil, type CrmAccount,
} from "../../../../lib/crm";
import { DetailSection, ActionRow, MarkBadge, Divider } from "../redesign/kit";
import { RT } from "../redesign/rt";

/* ── chips ────────────────────────────────────────────────────────────── */

const FILTER_CHIPS: { label: string; key: keyof CrmFilters; value: string | boolean }[] = [
  { label: "Due now", key: "due", value: true },
  { label: "Flow-constrained", key: "moment", value: "thesis_no_flow" },
  { label: "Tier A", key: "tier", value: "A" },
  { label: "DFW", key: "dfw", value: "yes" },
];

function chipStyle(active: boolean): React.CSSProperties {
  return {
    flex: "none", fontSize: 13, fontWeight: 600, padding: "8px 14px",
    borderRadius: RT.rPill, border: "none", cursor: "pointer", fontFamily: RT.font,
    background: active ? RT.accentSoft : RT.line,
    color: active ? RT.accentInk : RT.muted,
  };
}

const btn = (primary = false): React.CSSProperties => ({
  fontSize: 14, fontWeight: 600, padding: "11px 16px", borderRadius: RT.rPill,
  border: "none", cursor: "pointer", fontFamily: RT.font, width: "100%",
  background: primary ? RT.accentStrong : RT.line,
  color: primary ? RT.onAccent : RT.ink,
});

const field: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: "12px 14px", fontSize: 15,
  fontFamily: RT.font, color: RT.ink, background: RT.card,
  border: `1px solid ${RT.line}`, borderRadius: 12, outline: "none",
};

/* ── screen ───────────────────────────────────────────────────────────── */

export default function ClientsMobileScreen({ user }: AtlasScreenProps) {
  const [filters, setFilters] = useState<CrmFilters>({});
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);
  const [nonce, setNonce] = useState(0);

  const crm = useCrmAccounts(user, filters, query);

  if (openId != null) {
    return (
      <Detail
        id={openId}
        nonce={nonce}
        onBack={() => setOpenId(null)}
        onChanged={() => { crm.refresh(); setNonce(n => n + 1); }}
        patch={crm.patch}
        logActivity={crm.logActivity}
      />
    );
  }

  const s = crm.summary;

  return (
    <div style={{ padding: "8px 0 32px" }}>
      <DetailSection
        title="Clients"
        desc={
          s
            ? `${s.total} firms · ${(s.byTier.A ?? 0) + (s.byTier.B ?? 0)} on the call list · ${s.dueNow} due now`
            : "The acquirers we serve, ranked by fit."
        }
      >
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search firms"
          style={{ ...field, marginBottom: 12 }}
        />
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, WebkitOverflowScrolling: "touch" }}>
          {FILTER_CHIPS.map(c => (
            <button
              key={c.label}
              type="button"
              style={chipStyle(filters[c.key] === c.value)}
              onClick={() => setFilters(f => ({ ...f, [c.key]: f[c.key] === c.value ? undefined : c.value }))}
            >
              {c.label}
            </button>
          ))}
        </div>
      </DetailSection>

      {crm.loading && !crm.loaded && (
        <DetailSection title="Loading…" desc="Reading the client pipeline." />
      )}

      {/* A failure must never read as an empty pipeline. */}
      {crm.error && (
        <DetailSection
          title="Could not load"
          desc={`${crm.error}. If this is the first deploy carrying migration 113, the tables may not exist yet.`}
          card
        >
          <ActionRow title="Try again" action="Retry" onClick={crm.refresh} />
        </DetailSection>
      )}

      {crm.loaded && !crm.error && crm.all.length === 0 && (
        <DetailSection
          title="No firms yet"
          desc="Import the buy-side register on desktop — the board ranks every firm on import."
        />
      )}

      {crm.accounts.length > 0 && (
        <DetailSection title="Ranked" desc="Best fit first. Tap a firm for the read." card>
          {crm.accounts.map((a, i) => (
            <ActionRow
              key={a.id}
              leading={<MarkBadge label={a.firm} seed={a.id} size={36} />}
              title={a.firm}
              sub={subFor(a)}
              action={<Chevron />}
              onClick={() => { setOpenId(a.id); setNonce(n => n + 1); }}
            />
          ))}
        </DetailSection>
      )}

      {crm.loaded && !crm.error && crm.all.length > 0 && crm.accounts.length === 0 && (
        <DetailSection title="Nothing matches" desc="Clear the search or the chips to see the full board." />
      )}
    </div>
  );
}

/** The sub-line carries what decides the order plus what blocks acting on it. */
function subFor(a: CrmAccount): string {
  const due = dueLabel(a.next_action_on);
  return [
    a.tier ? `${a.tier} · ${a.score ?? "—"}` : null,
    MOMENT_LABEL[a.buyer_moment ?? "unknown"],
    STAGE_LABEL[a.stage as never] ?? a.stage,
    due ? `next ${due}` : null,
    !a.contact_count ? "no contact" : null,
  ].filter(Boolean).join(" · ");
}

function Chevron() {
  return <span style={{ color: RT.faint, fontSize: 20, lineHeight: 1 }}>›</span>;
}

/* ── detail ───────────────────────────────────────────────────────────── */

function Detail({
  id, nonce, onBack, onChanged, patch, logActivity,
}: {
  id: number;
  nonce: number;
  onBack: () => void;
  onChanged: () => void;
  patch: (id: number, body: Record<string, unknown>) => Promise<unknown>;
  logActivity: (id: number, body: Record<string, unknown>) => Promise<unknown>;
}) {
  const { account, contacts, activity, loading, error } = useCrmAccount(id, nonce);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [touch, setTouch] = useState("");
  const [touchKind, setTouchKind] = useState<string>("call");
  const [action, setAction] = useState<string | null>(null);
  const [when, setWhen] = useState<string | null>(null);

  const run = async (fn: () => Promise<unknown>) => {
    setSaving(true); setSaveError(null);
    try { await fn(); onChanged(); }
    catch (e: any) { setSaveError(e?.message ?? "Could not save"); }
    finally { setSaving(false); }
  };

  const actionVal = action ?? account?.next_action ?? "";
  const whenVal = when ?? (account?.next_action_on ? String(account.next_action_on).slice(0, 10) : "");
  const dirty = action != null || when != null;
  const overdue = (daysUntil(account?.next_action_on) ?? 1) <= 0;

  return (
    <div style={{ padding: "8px 0 32px" }}>
      <DetailSection title={account?.firm ?? (loading ? "Loading…" : "Firm")} card>
        <ActionRow title="Clients" sub="Back to the board" onClick={onBack} />
      </DetailSection>

      {error && <DetailSection title="Could not load" desc={error} />}
      {saveError && <DetailSection title="Not saved" desc={saveError} />}

      {account && (
        <>
          <DetailSection
            title="Why it ranks here"
            desc={`${account.tier ?? "—"} · ${account.score ?? "—"} — ${MOMENT_WHY[account.buyer_moment ?? "unknown"]}`}
          >
            <p style={{ margin: 0, fontSize: 13.5, color: RT.muted, lineHeight: 1.6 }}>
              {account.score_detail ?? "Not yet scored."}
            </p>
            <p style={{ margin: "10px 0 0", fontSize: 13.5, color: RT.muted }}>
              {SEGMENT_LABEL[account.segment ?? "unknown"]}
              {account.trades ? ` · ${account.trades}` : ""}
              {" · "}{GRADE_LABEL[account.grade ?? "unknown"]}
            </p>
          </DetailSection>

          <Divider />

          <DetailSection title="Who to ask for" desc={contacts.length ? undefined : "No named contact — that's the research task."} card={contacts.length > 0}>
            {contacts.map(c => (
              <ActionRow
                key={c.id}
                title={c.name}
                sub={[c.title, c.email, c.phone].filter(Boolean).join(" · ") || undefined}
                action={c.is_primary ? "primary" : undefined}
              />
            ))}
          </DetailSection>

          <Divider />

          <DetailSection title="Stage" desc={STAGE_LABEL[account.stage as never] ?? account.stage}>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, WebkitOverflowScrolling: "touch" }}>
              {CRM_STAGES.map(st => (
                <button
                  key={st}
                  type="button"
                  disabled={saving}
                  style={chipStyle(account.stage === st)}
                  onClick={() => run(() => patch(id, { stage: st }))}
                >
                  {STAGE_LABEL[st]}
                </button>
              ))}
            </div>
          </DetailSection>

          <DetailSection
            title="Next action"
            desc={dueLabel(account.next_action_on)
              ? `${overdue ? "Overdue — " : ""}${dueLabel(account.next_action_on)}`
              : "Nothing scheduled."}
          >
            <input
              value={actionVal}
              onChange={e => setAction(e.target.value)}
              placeholder="e.g. intro via a fire-alarm distributor"
              style={{ ...field, marginBottom: 10 }}
            />
            <input
              type="date"
              value={whenVal}
              onChange={e => setWhen(e.target.value)}
              style={{ ...field, marginBottom: 10 }}
            />
            {dirty && (
              <button
                type="button"
                disabled={saving}
                style={btn(true)}
                onClick={() => run(async () => {
                  await patch(id, { next_action: actionVal, next_action_on: whenVal || null });
                  setAction(null); setWhen(null);
                })}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            )}
          </DetailSection>

          <Divider />

          <DetailSection
            title="Log a touch"
            desc="This records what happened. It does not send anything."
          >
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, WebkitOverflowScrolling: "touch" }}>
              {ACTIVITY_KINDS.map(k => (
                <button key={k} type="button" style={chipStyle(touchKind === k)} onClick={() => setTouchKind(k)}>
                  {k}
                </button>
              ))}
            </div>
            <textarea
              value={touch}
              onChange={e => setTouch(e.target.value)}
              rows={3}
              placeholder="What happened?"
              style={{ ...field, marginBottom: 10, resize: "vertical", lineHeight: 1.5 }}
            />
            <button
              type="button"
              disabled={saving || !touch.trim()}
              style={{ ...btn(true), opacity: touch.trim() ? 1 : 0.5 }}
              onClick={() => run(async () => {
                await logActivity(id, {
                  kind: touchKind, body: touch.trim(),
                  direction: touchKind === "note" ? null : "out",
                });
                setTouch("");
              })}
            >
              {saving ? "Saving…" : "Log it"}
            </button>
          </DetailSection>

          <DetailSection
            title="History"
            desc={activity.length ? undefined : "Never contacted."}
            card={activity.length > 0}
          >
            {activity.map(v => (
              <ActionRow
                key={v.id}
                title={v.subject || v.body?.slice(0, 60) || v.kind}
                sub={`${v.kind}${v.direction ? ` · ${v.direction}` : ""} · ${touchLabel(v.occurred_at) ?? v.occurred_at.slice(0, 10)}`}
              />
            ))}
          </DetailSection>

          {(account.evidence || account.notes) && (
            <>
              <Divider />
              <DetailSection title="Evidence">
                {account.evidence && (
                  <p style={{ margin: 0, fontSize: 13.5, color: RT.ink2, lineHeight: 1.6 }}>{account.evidence}</p>
                )}
                {account.source_url && (
                  <a href={account.source_url} target="_blank" rel="noreferrer"
                     style={{ display: "block", marginTop: 8, fontSize: 13, color: RT.accentInk, wordBreak: "break-all" }}>
                    {account.source_url}
                  </a>
                )}
                {account.notes && (
                  <p style={{ margin: "10px 0 0", fontSize: 13.5, color: RT.muted, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {account.notes}
                  </p>
                )}
              </DetailSection>
            </>
          )}
        </>
      )}
    </div>
  );
}
