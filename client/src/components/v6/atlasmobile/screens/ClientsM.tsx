/**
 * Atlas MOBILE — CLIENTS (the client pipeline: the acquirers we work for).
 *
 * Built on the SAME grammar as mobile Deals (atlasmobile/screens/Deals.tsx),
 * because the first cut used the settings-page `DetailSection` kit and came out
 * flush to the screen edge with a duplicated title — Paul: "why does the client
 * page look ugly, everything should look like the Cash App style". So this file
 * copies the house mobile patterns rather than improvising:
 *
 *   - the shell owns the vertical rhythm; we own a horizontal 18px gutter
 *     (PAGE_H), so nothing ever touches the edge
 *   - the screen does NOT repeat its own name — the shell's back bar says
 *     "Clients" already
 *   - white pill search (h44, RT.card) + edge-bleed chip scroll
 *   - flat white cards on the warm page: separation by TONE, never a border or
 *     a shadow
 *   - EmptyState carries the green accent (RT.accent / RT.onAccent)
 *
 * PHONE SCOPE: the ten minutes before a call and the ten minutes after — who is
 * this firm, why does it rank, who do I ask for; then move the stage, set the
 * next action, log what happened. CSV import, re-scoring and evidence editing
 * stay on desktop.
 */
import { useState } from "react";
import type { AtlasScreenProps } from "../../desktop/atlasNav";
import { useCrmAccounts, useCrmAccount, type CrmFilters } from "../../../../hooks/useCrmAccounts";
import {
  CRM_STAGES, STAGE_LABEL, MOMENT_LABEL, MOMENT_WHY, SEGMENT_LABEL, GRADE_LABEL,
  ACTIVITY_KINDS, dueLabel, touchLabel, daysUntil, type CrmAccount,
} from "../../../../lib/crm";
import { ROLE_LABEL } from "../../../../hooks/useDealTasks";
import { useDraft } from "../../../../hooks/useDraft";
import { Pill, EmptyState, LoadingState } from "../../desktop/primitives";
import { SearchIcon } from "../../desktop/icons";
import { RT } from "../redesign/rt";
import { MarkBadge as RMarkBadge } from "../redesign/kit";

const PAGE_H = "0 18px"; // shell owns vertical; we own the horizontal 18px

const S: Record<string, React.CSSProperties> = {
  root: { color: RT.ink, fontFamily: RT.font, display: "flex", flexDirection: "column" },
};

const CHIPS: { label: string; key: keyof CrmFilters; value: string | boolean }[] = [
  { label: "Due now", key: "due", value: true },
  { label: "Flow-constrained", key: "moment", value: "thesis_no_flow" },
  { label: "Tier A", key: "tier", value: "A" },
  { label: "DFW", key: "dfw", value: "yes" },
];

/* ── palettes (match the desktop sibling exactly) ─────────────────────── */

function tierPill(tier: string | null): { bg: string; fg: string } {
  if (tier === "A") return { bg: RT.accentSoft, fg: RT.accentInk };
  if (tier === "B") return { bg: RT.line, fg: RT.ink2 };
  return { bg: RT.line, fg: RT.muted };
}

/** `has_both` stays neutral: it is the HARDEST sale, not the best lead, and
 *  colouring it like a win would invert the model. */
function momentPill(m: string | null): { bg: string; fg: string } {
  if (m === "thesis_no_flow") return { bg: RT.accentSoft, fg: RT.accentInk };
  return { bg: RT.line, fg: RT.muted };
}

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

  const toolbar = (
    <Toolbar
      query={query} onSearch={setQuery}
      filters={filters}
      onToggle={(k, v) => setFilters(f => ({ ...f, [k]: f[k] === v ? undefined : v }))}
      count={crm.all.length}
      summary={crm.summary}
    />
  );

  if (crm.loading && !crm.loaded) {
    return (
      <div style={S.root}>
        {toolbar}
        <div style={{ padding: "32px 18px", display: "flex", minHeight: 200 }}>
          <LoadingState label="Loading your clients…" />
        </div>
      </div>
    );
  }

  // A failure must never read as an empty pipeline.
  if (crm.error) {
    return (
      <div style={S.root}>
        {toolbar}
        <div style={{ padding: "24px 18px", display: "flex", minHeight: 260 }}>
          <EmptyState
            accent={RT.accent} onAccent={RT.onAccent}
            title="Could not load your clients"
            hint={crm.error}
            cta="Try again"
            onCta={crm.refresh}
          />
        </div>
      </div>
    );
  }

  if (crm.loaded && crm.all.length === 0) {
    return (
      <div style={S.root}>
        {toolbar}
        <div style={{ padding: "24px 18px", display: "flex", minHeight: 260 }}>
          <EmptyState
            accent={RT.accent} onAccent={RT.onAccent}
            title="No clients yet"
            hint="Import your buy-side register on desktop and every firm is ranked on the way in."
          />
        </div>
      </div>
    );
  }

  return (
    <div style={S.root}>
      {toolbar}
      <div style={{ padding: PAGE_H, display: "flex", flexDirection: "column", gap: 11, marginTop: 13 }}>
        {crm.accounts.length === 0 ? (
          <div style={{ padding: "16px 0", display: "flex", minHeight: 200 }}>
            <EmptyState
              accent={RT.accent} onAccent={RT.onAccent}
              title="Nothing matches"
              hint="Clear the search or the chips to see the full board."
              cta="Clear"
              onCta={() => { setQuery(""); setFilters({}); }}
            />
          </div>
        ) : crm.accounts.map(a => (
          <Card
            key={a.id}
            account={a}
            onOpen={() => { setOpenId(a.id); setNonce(n => n + 1); }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── toolbar ──────────────────────────────────────────────────────────── */

function Toolbar({
  query, onSearch, filters, onToggle, count, summary,
}: {
  query: string;
  onSearch: (v: string) => void;
  filters: CrmFilters;
  onToggle: (k: keyof CrmFilters, v: string | boolean) => void;
  count: number;
  summary: { byTier: Record<string, number>; total: number; dueNow: number } | null;
}) {
  return (
    <div style={{ padding: "12px 18px 0" }}>
      <label
        style={{
          height: 44, background: RT.card, borderRadius: RT.rPill,
          display: "flex", alignItems: "center", padding: "0 15px",
          gap: 9, marginBottom: 11,
        }}
      >
        <SearchIcon size={19} c={RT.faint} />
        <input
          value={query}
          onChange={e => onSearch(e.target.value)}
          placeholder={count > 0 ? `Search ${count} clients` : "Search clients"}
          style={{
            flex: 1, minWidth: 0, border: "none", background: "transparent",
            outline: "none", fontSize: 16, color: RT.ink, fontFamily: RT.font,
          }}
        />
      </label>

      {/* stat tiles — edge-bleed scroll, same as the deals board */}
      {summary && (
        <div
          className="scr"
          style={{ display: "flex", gap: 9, margin: "0 -18px 11px", padding: "0 18px", overflowX: "auto" }}
        >
          <StatTile
            value={String((summary.byTier.A ?? 0) + (summary.byTier.B ?? 0))}
            caption="on the call list"
          />
          <StatTile value={String(summary.dueNow)} caption="due now" />
          <StatTile value={String(summary.total)} caption="clients" />
        </div>
      )}

      {/* filter chips — edge-bleed horizontal scroll */}
      <div
        className="scr"
        style={{ display: "flex", gap: 7, margin: "0 -18px", padding: "0 18px", overflowX: "auto" }}
      >
        {CHIPS.map(c => {
          const active = filters[c.key] === c.value;
          return (
            <button
              key={c.label}
              type="button"
              onClick={() => onToggle(c.key, c.value)}
              style={{
                flex: "none", fontSize: 14, fontWeight: 600, padding: "8px 15px",
                borderRadius: RT.rPill, cursor: "pointer", fontFamily: RT.font,
                border: "none", whiteSpace: "nowrap",
                background: active ? RT.accent : RT.card,
                color: active ? RT.onAccent : RT.muted,
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StatTile({ value, caption }: { value: string; caption: string }) {
  return (
    <div style={{ flex: "none", minWidth: 118, background: RT.card, borderRadius: 14, padding: "13px 15px" }}>
      <div style={{ fontSize: 19, fontWeight: 600, color: RT.ink, letterSpacing: "-0.01em", lineHeight: 1.1 }}>
        {value}
      </div>
      <div style={{ fontSize: 12.5, color: RT.muted, marginTop: 4 }}>{caption}</div>
    </div>
  );
}

/* ── card ─────────────────────────────────────────────────────────────── */

/** Flat white card on the warm page — separation by TONE, no border, no shadow. */
function Card({ account: a, onOpen }: { account: CrmAccount; onOpen: () => void }) {
  const tp = tierPill(a.tier);
  const mp = momentPill(a.buyer_moment);
  const due = dueLabel(a.next_action_on);
  const overdue = (daysUntil(a.next_action_on) ?? 1) <= 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
      style={{
        background: RT.card, borderRadius: RT.rCard, padding: 16,
        cursor: "pointer", outline: "none", WebkitTapHighlightColor: "transparent",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 11 }}>
        <RMarkBadge label={a.firm} seed={a.id} size={32} />
        <div style={{ flex: 1, minWidth: 0, fontSize: 16, fontWeight: 600, color: RT.ink, lineHeight: 1.3 }}>
          {a.firm}
        </div>
        <Pill bg={tp.bg} fg={tp.fg} style={{ fontSize: 11.5, padding: "4px 10px", flex: "none" }}>
          {a.tier ?? "—"}
        </Pill>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 9 }}>
        <Pill bg={mp.bg} fg={mp.fg} style={{ fontSize: 11.5, padding: "4px 10px" }}>
          {MOMENT_LABEL[a.buyer_moment ?? "unknown"]}
        </Pill>
        <Pill bg={RT.line} fg={RT.muted} style={{ fontSize: 11.5, padding: "4px 10px" }}>
          {STAGE_LABEL[a.stage as never] ?? a.stage}
        </Pill>
      </div>

      <div style={{ fontSize: 14.5, color: RT.muted, lineHeight: 1.45 }}>
        {[
          SEGMENT_LABEL[a.segment ?? "unknown"],
          a.dfw === "yes" ? "DFW" : null,
          !a.contact_count ? "no contact yet" : null,
        ].filter(Boolean).join(" · ")}
      </div>

      {a.next_action && (
        <div style={{ fontSize: 14.5, color: overdue ? RT.down : RT.ink2, marginTop: 6 }}>
          {a.next_action}{due ? ` — ${due}` : ""}
        </div>
      )}
    </div>
  );
}

/* ── detail ───────────────────────────────────────────────────────────── */

const field: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: "12px 14px", fontSize: 16,
  fontFamily: RT.font, color: RT.ink, background: RT.card,
  border: "none", borderRadius: 14, outline: "none",
};

const btn = (primary = false): React.CSSProperties => ({
  fontSize: 15, fontWeight: 600, padding: "12px 18px", borderRadius: RT.rPill,
  border: "none", cursor: "pointer", fontFamily: RT.font, width: "100%",
  background: primary ? RT.accent : RT.card,
  color: primary ? RT.onAccent : RT.ink,
});

function chip(active: boolean): React.CSSProperties {
  return {
    flex: "none", fontSize: 14, fontWeight: 600, padding: "8px 15px",
    borderRadius: RT.rPill, border: "none", cursor: "pointer",
    fontFamily: RT.font, whiteSpace: "nowrap",
    background: active ? RT.accent : RT.card,
    color: active ? RT.onAccent : RT.muted,
  };
}

/** Section heading on the warm page — a label, not a card. */
function Head({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 600, color: RT.muted, marginBottom: 9 }}>
      {children}
    </div>
  );
}

/** Flat white block — the same tone separation the cards use. */
function Block({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: RT.card, borderRadius: RT.rCard, padding: 16 }}>
      {children}
    </div>
  );
}

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
  const { account, contacts, activity, deals, loading, error } = useCrmAccount(id, nonce);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [touchKind, setTouchKind] = useState<string>("call");

  // Anything typed and not yet saved survives a back-swipe (useDraft). Keyed by
  // account id — a draft typed against one client must never appear under
  // another. Cleared on a successful save, not before.
  const [touch, setTouch, clearTouch] = useDraft(`client:${id}:touch`);
  const [action, setAction, clearAction] = useDraft(
    `client:${id}:action`, account?.next_action ?? "",
  );
  const [when, setWhen, clearWhen] = useDraft(
    `client:${id}:when`,
    account?.next_action_on ? String(account.next_action_on).slice(0, 10) : "",
  );

  const run = async (fn: () => Promise<unknown>) => {
    setSaving(true); setSaveError(null);
    try { await fn(); onChanged(); }
    catch (e: any) { setSaveError(e?.message ?? "Could not save"); }
    finally { setSaving(false); }
  };

  const savedAction = account?.next_action ?? "";
  const savedWhen = account?.next_action_on ? String(account.next_action_on).slice(0, 10) : "";
  const dirty = action !== savedAction || when !== savedWhen;

  return (
    <div style={S.root}>
      <div style={{ padding: "12px 18px 0" }}>
        <button type="button" onClick={onBack} style={{ ...chip(false), marginBottom: 13 }}>
          ‹ All clients
        </button>
      </div>

      <div style={{ padding: PAGE_H, display: "flex", flexDirection: "column", gap: 18, paddingBottom: 32 }}>
        {loading && !account && <LoadingState label="Loading…" />}
        {error && <Block><span style={{ fontSize: 14.5, color: RT.down }}>{error}</span></Block>}
        {saveError && <Block><span style={{ fontSize: 14.5, color: RT.down }}>{saveError}</span></Block>}

        {account && (
          <>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color: RT.ink, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
                {account.firm}
              </div>
              <div style={{ fontSize: 14.5, color: RT.muted, marginTop: 5 }}>
                {[
                  account.tier ? `Tier ${account.tier} · ${account.score ?? "—"}` : null,
                  SEGMENT_LABEL[account.segment ?? "unknown"],
                  account.trades,
                ].filter(Boolean).join(" · ")}
              </div>
            </div>

            <div>
              <Head>Why it ranks here</Head>
              <Block>
                <div style={{ fontSize: 14.5, color: RT.ink2, lineHeight: 1.5 }}>
                  {MOMENT_WHY[account.buyer_moment ?? "unknown"]}
                </div>
                <div style={{ fontSize: 13.5, color: RT.muted, marginTop: 9, lineHeight: 1.5 }}>
                  {account.score_detail ?? "Not yet scored."}
                </div>
                <div style={{ fontSize: 13.5, color: RT.muted, marginTop: 9 }}>
                  Evidence: {GRADE_LABEL[account.grade ?? "unknown"]}
                </div>
              </Block>
            </div>

            <div>
              <Head>Who to ask for</Head>
              <Block>
                {contacts.length === 0 ? (
                  <span style={{ fontSize: 14.5, color: RT.muted }}>
                    No named contact — that's the research task, and the cheapest
                    way to move them up.
                  </span>
                ) : contacts.map((c, i) => (
                  <div key={c.id} style={{ marginTop: i === 0 ? 0 : 12 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 600, color: RT.ink }}>
                      {c.name}
                      {c.role && <span style={{ color: RT.accentInk }}> · {ROLE_LABEL[c.role] ?? c.role}</span>}
                    </div>
                    <div style={{ fontSize: 14, color: RT.muted, marginTop: 2 }}>
                      {[c.title, c.email, c.phone].filter(Boolean).join(" · ") || "no email yet"}
                    </div>
                  </div>
                ))}
              </Block>
            </div>

            {deals.length > 0 && (
              <div>
                <Head>Deals for them</Head>
                <Block>
                  {deals.map((d, i) => (
                    <div key={d.id} style={{ marginTop: i === 0 ? 0 : 12 }}>
                      <div style={{ fontSize: 15.5, fontWeight: 600, color: RT.ink }}>
                        {d.business_name || d.name}
                      </div>
                      <div style={{ fontSize: 14, color: RT.muted, marginTop: 2 }}>
                        {[d.current_gate, d.next_action].filter(Boolean).join(" · ") || "just opened"}
                      </div>
                    </div>
                  ))}
                </Block>
              </div>
            )}

            <div>
              <Head>Stage</Head>
              <div
                className="scr"
                style={{ display: "flex", gap: 7, margin: "0 -18px", padding: "0 18px", overflowX: "auto" }}
              >
                {CRM_STAGES.map(st => (
                  <button
                    key={st}
                    type="button"
                    disabled={saving}
                    style={chip(account.stage === st)}
                    onClick={() => run(() => patch(id, { stage: st }))}
                  >
                    {STAGE_LABEL[st]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Head>
                Next action{dueLabel(account.next_action_on) ? ` — ${dueLabel(account.next_action_on)}` : ""}
                {dirty && <span style={{ color: RT.accentInk }}> · unsaved</span>}
              </Head>
              <input
                value={action}
                onChange={e => setAction(e.target.value)}
                placeholder="e.g. intro via a fire-alarm distributor"
                style={{ ...field, marginBottom: 9 }}
              />
              <input
                type="date"
                value={when}
                onChange={e => setWhen(e.target.value)}
                style={{ ...field, marginBottom: 9 }}
              />
              {dirty && (
                <button
                  type="button" disabled={saving} style={btn(true)}
                  onClick={() => run(async () => {
                    await patch(id, { next_action: action, next_action_on: when || null });
                    clearAction(); clearWhen();
                  })}
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              )}
            </div>

            <div>
              <Head>Log a touch — records it, sends nothing{touch.trim() ? " · unsaved" : ""}</Head>
              <div
                className="scr"
                style={{ display: "flex", gap: 7, margin: "0 -18px 9px", padding: "0 18px", overflowX: "auto" }}
              >
                {ACTIVITY_KINDS.map(k => (
                  <button key={k} type="button" style={chip(touchKind === k)} onClick={() => setTouchKind(k)}>
                    {k}
                  </button>
                ))}
              </div>
              <textarea
                value={touch}
                onChange={e => setTouch(e.target.value)}
                rows={3}
                placeholder="What happened?"
                style={{ ...field, marginBottom: 9, resize: "vertical", lineHeight: 1.5 }}
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
                  clearTouch();
                })}
              >
                {saving ? "Saving…" : "Log it"}
              </button>
            </div>

            <div>
              <Head>History</Head>
              <Block>
                {activity.length === 0 ? (
                  <span style={{ fontSize: 14.5, color: RT.muted }}>Never contacted.</span>
                ) : activity.map((v, i) => (
                  <div key={v.id} style={{ marginTop: i === 0 ? 0 : 12 }}>
                    <div style={{ fontSize: 13, color: RT.faint }}>
                      {v.kind}{v.direction ? ` · ${v.direction}` : ""} · {touchLabel(v.occurred_at) ?? v.occurred_at.slice(0, 10)}
                    </div>
                    {(v.subject || v.body) && (
                      <div style={{ fontSize: 14.5, color: RT.ink2, marginTop: 2, lineHeight: 1.45 }}>
                        {v.subject || v.body}
                      </div>
                    )}
                  </div>
                ))}
              </Block>
            </div>

            {(account.evidence || account.notes) && (
              <div>
                <Head>Evidence</Head>
                <Block>
                  {account.evidence && (
                    <div style={{ fontSize: 14.5, color: RT.ink2, lineHeight: 1.5 }}>{account.evidence}</div>
                  )}
                  {account.source_url && (
                    <a href={account.source_url} target="_blank" rel="noreferrer"
                       style={{ display: "block", marginTop: 9, fontSize: 13.5, color: RT.accentInk, wordBreak: "break-all" }}>
                      {account.source_url}
                    </a>
                  )}
                  {account.notes && (
                    <div style={{ fontSize: 14, color: RT.muted, marginTop: 10, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                      {account.notes}
                    </div>
                  )}
                </Block>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
