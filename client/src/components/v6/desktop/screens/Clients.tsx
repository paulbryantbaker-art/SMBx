/**
 * Atlas CLIENTS — the client pipeline (migration 113, `server/routes/crm.ts`).
 *
 * The acquirers the practice SERVES, as distinct from the targets it
 * underwrites. Deals is the second pipeline; this is the first one. See
 * WHERE_THE_WORK_HAPPENS.md §5.
 *
 * ── WHAT THIS SCREEN IS FOR ──────────────────────────────────────────────
 * Two questions, in this order:
 *   1. Who do I call next?  → the board, ranked by `house/leads.ts`
 *   2. What did I say last?  → the detail pane: contacts, touches, next action
 *
 * ── HONESTY RULES ────────────────────────────────────────────────────────
 *  - The score is never shown bare. Every row can open `score_detail`, which
 *    names each scale in words, so a ranking can be argued with rather than
 *    taken on faith.
 *  - `grade` is presented as PROVENANCE ("Directory only"), never as a quality
 *    grade, because in the scorer it is a discount and not a scale.
 *  - A firm with no named contact says so. It is a research task before it is a
 *    lead, and that is the cheapest thing to fix.
 *  - "Never contacted" is stated outright rather than rendered as a dash.
 *  - A load failure shows the server's message. Before migration 113 runs the
 *    tables do not exist, and an empty "no clients yet" would be a lie.
 *
 * THE LINE: this screen TRACKS a relationship. Nothing here contacts anyone,
 * quotes a fee, or records compensation — the engagement letter is a human
 * artefact and stays outside the app.
 *
 * Safari rule: the detail pane is position:absolute inside a relative parent,
 * never position:fixed with a background colour.
 */
import { useMemo, useRef, useState } from "react";
import type { AtlasScreenProps } from "../atlasNav";
import { useAtlasChat } from "../atlasNav";
import { useCrmAccounts, useCrmAccount, type CrmFilters } from "../../../../hooks/useCrmAccounts";
import {
  CRM_STAGES, STAGE_LABEL, MOMENT_LABEL, MOMENT_WHY, SEGMENT_LABEL, PITCH_LABEL,
  GRADE_LABEL, ACTIVITY_KINDS, dueLabel, touchLabel, daysUntil,
  type CrmAccount,
} from "../../../../lib/crm";
import { MarkBadge, Pill, KpiCard, EmptyState, LoadingState } from "../primitives";
import { CONTACT_ROLES, ROLE_LABEL } from "../../../../hooks/useDealTasks";
import { authHeaders } from "../../../../hooks/useAuth";
import { SearchIcon, ChevronRightIcon } from "../icons";
import { T } from "../atlasTokens";

/* ── palettes ─────────────────────────────────────────────────────────── */

/** Tier colour. A is the call list; D is parked. Deliberately only four steps —
 *  a gradient would imply more precision than a 0-100 heuristic has. */
function tierPill(tier: string | null): { bg: string; fg: string } {
  switch (tier) {
    case "A": return { bg: T.greenBg, fg: T.green };
    case "B": return { bg: T.blueBg, fg: T.blue };
    case "C": return { bg: T.track, fg: T.muted };
    default: return { bg: T.track, fg: T.faint };
  }
}

/** The buy signal carries the colour, because it is the thing that decides the
 *  order. `has_both` is deliberately grey: it is the hardest sale, not the best
 *  lead, and colouring it like a win would invert the whole model. */
function momentPill(m: string | null): { bg: string; fg: string } {
  switch (m) {
    case "thesis_no_flow": return { bg: T.greenBg, fg: T.green };
    case "capital_no_thesis": return { bg: T.amberBg, fg: T.amber };
    default: return { bg: T.track, fg: T.muted };
  }
}

function stagePill(s: string): { bg: string; fg: string } {
  switch (s) {
    case "mandate_live": return { bg: T.greenBg, fg: T.green };
    case "engaged": return { bg: T.greenBg, fg: T.green };
    case "proposal": return { bg: T.blueBg, fg: T.blue };
    case "conversation": return { bg: T.amberBg, fg: T.amber };
    case "passed": return { bg: T.track, fg: T.faint };
    default: return { bg: T.track, fg: T.muted };
  }
}

const COLS = { firm: 2.5, segment: 1.5, moment: 1.4, stage: 1.2, next: 1.6 };
const ROW_PAD = "11px 22px";

/* ── screen ───────────────────────────────────────────────────────────── */

export default function ClientsScreen({ user }: AtlasScreenProps) {
  const chat = useAtlasChat();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<CrmFilters>({});
  const [openId, setOpenId] = useState<number | null>(null);
  const [detailNonce, setDetailNonce] = useState(0);
  const [banner, setBanner] = useState<string | null>(null);

  const crm = useCrmAccounts(user, filters, query);

  const toggle = (key: keyof CrmFilters, value: string | boolean) =>
    setFilters(f => ({ ...f, [key]: f[key] === value ? undefined : value }));

  const root: React.CSSProperties = {
    flex: 1, minWidth: 0, display: "flex", flexDirection: "column",
    fontFamily: T.font, color: T.ink, overflow: "hidden",
    // The detail pane is absolute inside this — never fixed (Safari rule).
    position: "relative",
  };

  const toolbar = (
    <Toolbar
      query={query} onSearch={setQuery}
      filters={filters} onToggle={toggle}
      count={crm.all.length}
      onImport={async (csv) => {
        try {
          const r = await crm.importCsv(csv);
          setBanner(
            `Imported ${r.imported} — ${r.created} new, ${r.updated} updated, ` +
            `${r.contactsAdded} contacts` +
            (r.ignoredColumns.length ? `. Ignored columns: ${r.ignoredColumns.join(", ")}` : ""),
          );
        } catch (e: any) {
          setBanner(`Import failed: ${e?.message ?? "unknown error"}`);
        }
      }}
      onRescore={async () => {
        try {
          const r = await crm.rescore();
          setBanner(`Re-scored ${r.rescored} firms.`);
        } catch (e: any) {
          setBanner(`Re-score failed: ${e?.message ?? "unknown error"}`);
        }
      }}
    />
  );

  if (crm.loading && !crm.loaded) {
    return <div style={root}>{toolbar}<div style={{ flex: 1, display: "flex" }}>
      <LoadingState label="Loading the client pipeline…" />
    </div></div>;
  }

  // A real failure must not read as an empty pipeline.
  if (crm.error) {
    return <div style={root}>{toolbar}<div style={{ flex: 1, display: "flex" }}>
      <EmptyState
        title="Could not load the client pipeline"
        hint={`${crm.error}. If this is the first deploy carrying migration 113, the crm_accounts tables may not exist yet — check the boot log for "[migrations] Applied: 113_crm_accounts.sql".`}
        cta="Try again"
        onCta={crm.refresh}
      />
    </div></div>;
  }

  if (crm.loaded && crm.all.length === 0) {
    return <div style={root}>{toolbar}<div style={{ flex: 1, display: "flex" }}>
      <EmptyState
        title="No firms yet"
        hint="Import the buy-side register CSV to populate the board. Every firm is ranked on import — the buy signal (a declared thesis it cannot fill) carries the most weight."
        cta="Ask Yulia about the register"
        onCta={() => chat?.send("How do I import my buy-side register into the client pipeline?")}
      />
    </div></div>;
  }

  const s = crm.summary;

  return (
    <div style={root}>
      {toolbar}

      {banner && (
        <div style={{
          margin: "0 22px 10px", padding: "10px 14px", background: T.blueBg,
          border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13,
          display: "flex", alignItems: "center", gap: 12, flex: "none",
        }}>
          <span style={{ flex: 1 }}>{banner}</span>
          <button type="button" onClick={() => setBanner(null)} style={ghostBtn}>Dismiss</button>
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: 14, overflow: "auto", padding: "0 22px 22px" }}>
        {/* The picture: counts only, every one derived from the rows. */}
        <div style={{ display: "flex", gap: 14, flex: "none" }}>
          <KpiCard
            label="THE CALL LIST"
            value={s ? String((s.byTier.A ?? 0) + (s.byTier.B ?? 0)) : "—"}
            delta={s ? `tier A+B of ${s.total}` : undefined}
            deltaColor={T.muted2}
          />
          <KpiCard
            label="FLOW-CONSTRAINED"
            value={s ? String(s.byMoment.thesis_no_flow ?? 0) : "—"}
            delta="declared a thesis, can't fill it"
            deltaColor={T.muted2}
          />
          <KpiCard
            label="DUE NOW"
            value={s ? String(s.dueNow) : "—"}
            delta={s?.dueNow ? "next action today or overdue" : "nothing scheduled"}
            deltaColor={s?.dueNow ? T.amber : T.muted2}
          />
          <KpiCard
            label="NEED A CONTACT"
            value={s ? String(s.needContact) : "—"}
            delta="research before outreach"
            deltaColor={T.muted2}
          />
        </div>

        {/* table */}
        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{
            padding: ROW_PAD, display: "flex", alignItems: "center", gap: 12,
            borderBottom: `1px solid ${T.border}`, background: T.surface,
            fontSize: 11.5, fontWeight: 700, letterSpacing: "0.05em", color: T.muted2,
          }}>
            <span style={{ width: 44, flex: "none" }}>RANK</span>
            <div style={{ flex: COLS.firm, minWidth: 0 }}>FIRM</div>
            <div style={{ flex: COLS.segment, minWidth: 0 }}>SEGMENT</div>
            <div style={{ flex: COLS.moment, minWidth: 0 }}>BUY SIGNAL</div>
            <div style={{ flex: COLS.stage, minWidth: 0 }}>STAGE</div>
            <div style={{ flex: COLS.next, minWidth: 0 }}>NEXT</div>
            <span style={{ width: 18, flex: "none" }} />
          </div>

          {crm.accounts.length === 0 ? (
            <div style={{ padding: "34px 22px", textAlign: "center", color: T.muted, fontSize: 13.5 }}>
              No firms match this search or filter.
            </div>
          ) : crm.accounts.map((a, i) => (
            <Row key={a.id} account={a} rank={i + 1} onOpen={() => { setOpenId(a.id); setDetailNonce(n => n + 1); }} />
          ))}
        </div>

        <p style={{ fontSize: 12.5, color: T.muted2, margin: 0, maxWidth: "62ch", lineHeight: 1.6 }}>
          Ranked by fit, not by whether a buyer is proven. No register column records
          whether a firm has ever closed a deal, so a well-written site with no
          acquisitions can rank well — set “last evidenced deal” on a firm as you
          verify it, and the score follows.
        </p>
      </div>

      {openId != null && (
        <DetailPane
          id={openId}
          nonce={detailNonce}
          onClose={() => setOpenId(null)}
          onChanged={() => { crm.refresh(); setDetailNonce(n => n + 1); }}
          patch={crm.patch}
          logActivity={crm.logActivity}
        />
      )}
    </div>
  );
}

/* ── toolbar ──────────────────────────────────────────────────────────── */

const ghostBtn: React.CSSProperties = {
  fontSize: 12.5, fontWeight: 600, padding: "7px 13px", borderRadius: T.rPill,
  border: `1px solid ${T.border}`, background: T.white, color: T.muted,
  cursor: "pointer", fontFamily: T.font,
};

function chip(active: boolean): React.CSSProperties {
  return {
    fontSize: 12.5, fontWeight: 600, padding: "7px 13px", borderRadius: T.rPill,
    cursor: "pointer", fontFamily: T.font,
    border: `1px solid ${active ? T.blue : T.border}`,
    background: active ? T.blue : T.white,
    color: active ? "#fff" : T.muted,
  };
}

function Toolbar({
  query, onSearch, filters, onToggle, count, onImport, onRescore,
}: {
  query: string;
  onSearch: (v: string) => void;
  filters: CrmFilters;
  onToggle: (k: keyof CrmFilters, v: string | boolean) => void;
  count: number;
  onImport: (csv: string) => void;
  onRescore: () => void;
}) {
  const file = useRef<HTMLInputElement | null>(null);

  return (
    <div style={{ padding: "18px 22px 14px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", flex: "none" }}>
      <label style={{
        width: 260, height: 38, background: T.track, borderRadius: T.rPill,
        padding: "0 14px", display: "flex", alignItems: "center", gap: 9,
      }}>
        <SearchIcon size={16} c={T.muted2} />
        <input
          value={query}
          onChange={e => onSearch(e.target.value)}
          placeholder={count > 0 ? `Search ${count} firms` : "Search firms"}
          style={{
            flex: 1, minWidth: 0, border: "none", background: "transparent",
            outline: "none", fontSize: 13, color: T.ink, fontFamily: T.font,
          }}
        />
      </label>

      <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
        <button type="button" style={chip(filters.due === true)} onClick={() => onToggle("due", true)}>Due now</button>
        <button type="button" style={chip(filters.moment === "thesis_no_flow")} onClick={() => onToggle("moment", "thesis_no_flow")}>Flow-constrained</button>
        <button type="button" style={chip(filters.tier === "A")} onClick={() => onToggle("tier", "A")}>Tier A</button>
        <button type="button" style={chip(filters.dfw === "yes")} onClick={() => onToggle("dfw", "yes")}>DFW</button>
        <button type="button" style={chip(filters.archived === true)} onClick={() => onToggle("archived", true)}>Archived</button>
      </div>

      <div style={{ flex: 1 }} />

      <button type="button" style={ghostBtn} onClick={onRescore} title="Re-run the scorer over every firm — needed after a new market master lands">
        Re-score
      </button>
      <button
        type="button"
        onClick={() => file.current?.click()}
        style={{
          background: T.blue, color: "#fff", border: "none", borderRadius: T.rPill,
          padding: "8px 15px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: T.font,
        }}
      >
        Import CSV
      </button>
      {/* The register lives in Google Sheets; a file picker is the honest door.
          Re-importing UPDATES firms by name and never resets stage/owner/next
          action — the Sheet owns the research, the app owns the pipeline. */}
      <input
        ref={file}
        type="file"
        accept=".csv,text/csv"
        style={{ display: "none" }}
        onChange={async e => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          onImport(await f.text());
        }}
      />
    </div>
  );
}

/* ── row ──────────────────────────────────────────────────────────────── */

function Row({ account: a, rank, onOpen }: { account: CrmAccount; rank: number; onOpen: () => void }) {
  const tp = tierPill(a.tier);
  const mp = momentPill(a.buyer_moment);
  const sp = stagePill(a.stage);
  const due = dueLabel(a.next_action_on);
  const overdue = (daysUntil(a.next_action_on) ?? 1) <= 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
      style={{
        padding: ROW_PAD, borderBottom: `1px solid ${T.rowDiv}`, display: "flex",
        alignItems: "center", gap: 12, fontSize: 13.5, cursor: "pointer", outline: "none",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = T.hover; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
      onFocus={e => { e.currentTarget.style.background = T.hover; }}
      onBlur={e => { e.currentTarget.style.background = "transparent"; }}
    >
      <span style={{ width: 44, flex: "none", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: T.muted2, fontSize: 12.5, fontVariantNumeric: "tabular-nums" }}>{rank}</span>
      </span>

      <div style={{ flex: COLS.firm, minWidth: 0, display: "flex", alignItems: "center", gap: 11 }}>
        <MarkBadge letter={a.firm} bg={tp.bg} fg={tp.fg} size={26} radius={7} />
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "block", fontWeight: 600, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {a.firm}
          </span>
          <span style={{ display: "block", fontSize: 12, color: T.muted2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {[a.tier ? `${a.tier} · ${a.score ?? "—"}` : null,
              a.dfw === "yes" ? "DFW" : null,
              !a.contact_count ? "no contact" : null,
              a.grade === "directory" ? "directory only" : null,
            ].filter(Boolean).join(" · ")}
          </span>
        </span>
      </div>

      <div style={{ flex: COLS.segment, minWidth: 0, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {SEGMENT_LABEL[a.segment ?? "unknown"] ?? a.segment ?? "—"}
      </div>

      <div style={{ flex: COLS.moment, minWidth: 0 }}>
        <Pill bg={mp.bg} fg={mp.fg}>{MOMENT_LABEL[a.buyer_moment ?? "unknown"] ?? "Unknown"}</Pill>
      </div>

      <div style={{ flex: COLS.stage, minWidth: 0 }}>
        <Pill bg={sp.bg} fg={sp.fg}>{STAGE_LABEL[a.stage as never] ?? a.stage}</Pill>
      </div>

      <div style={{ flex: COLS.next, minWidth: 0, fontSize: 12.5 }}>
        {a.next_action ? (
          <>
            <span style={{ display: "block", color: T.ink3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {a.next_action}
            </span>
            {due && <span style={{ color: overdue ? T.amber : T.muted2 }}>{due}</span>}
          </>
        ) : (
          <span style={{ color: T.faint }}>no next action</span>
        )}
      </div>

      <span style={{ width: 18, flex: "none", display: "flex" }}>
        <ChevronRightIcon size={16} c={T.faint} />
      </span>
    </div>
  );
}

/* ── detail pane ──────────────────────────────────────────────────────── */

function DetailPane({
  id, nonce, onClose, onChanged, patch, logActivity,
}: {
  id: number;
  nonce: number;
  onClose: () => void;
  onChanged: () => void;
  patch: (id: number, body: Record<string, unknown>) => Promise<unknown>;
  logActivity: (id: number, body: Record<string, unknown>) => Promise<unknown>;
}) {
  const { account, contacts, activity, deals, searches, loading, error } = useCrmAccount(id, nonce);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [nextAction, setNextAction] = useState<string | null>(null);
  const [nextOn, setNextOn] = useState<string | null>(null);
  const [touch, setTouch] = useState("");
  const [touchKind, setTouchKind] = useState<string>("note");
  // Add a person — who's who at the firm. Role is the field that decides who
  // gets which email later.
  const [pName, setPName] = useState("");
  const [pRole, setPRole] = useState("principal");
  const [pEmail, setPEmail] = useState("");
  const [pTitle, setPTitle] = useState("");
  // Lead → deal. The TARGET name, never the client's: a client is not a deal.
  const [target, setTarget] = useState("");

  const action = nextAction ?? account?.next_action ?? "";
  const actionOn = nextOn ?? (account?.next_action_on ? String(account.next_action_on).slice(0, 10) : "");
  const dirty = nextAction != null || nextOn != null;

  const run = async (fn: () => Promise<unknown>) => {
    setSaving(true); setSaveError(null);
    try { await fn(); onChanged(); }
    catch (e: any) { setSaveError(e?.message ?? "Could not save"); }
    finally { setSaving(false); }
  };

  // position:absolute inside the screen's relative root — never fixed.
  const shell: React.CSSProperties = {
    position: "absolute", top: 0, right: 0, bottom: 0, width: 520, maxWidth: "94%",
    background: T.white, borderLeft: `1px solid ${T.border}`,
    boxShadow: "-14px 0 40px rgba(16,24,40,0.10)",
    display: "flex", flexDirection: "column", zIndex: 5,
  };

  return (
    <div style={shell}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 12, flex: "none" }}>
        <span style={{ flex: 1, minWidth: 0, fontWeight: 700, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {account?.firm ?? (loading ? "Loading…" : "Account")}
        </span>
        <button type="button" onClick={onClose} style={ghostBtn}>Close</button>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 18 }}>
        {error && <p style={{ color: T.amber, fontSize: 13, margin: 0 }}>{error}</p>}
        {saveError && <p style={{ color: T.amber, fontSize: 13, margin: 0 }}>{saveError}</p>}

        {account && (
          <>
            {/* the ranking, in words */}
            <Section title="Why it ranks here">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Pill {...tierPill(account.tier)}>{account.tier ?? "—"} · {account.score ?? "—"}</Pill>
                <Pill {...momentPill(account.buyer_moment)}>
                  {MOMENT_LABEL[account.buyer_moment ?? "unknown"]}
                </Pill>
                <span style={{ fontSize: 12.5, color: T.muted2 }}>
                  {MOMENT_WHY[account.buyer_moment ?? "unknown"]}
                </span>
              </div>
              {account.score_detail && (
                <p style={{ margin: 0, fontSize: 12.5, color: T.muted, lineHeight: 1.65 }}>
                  {account.score_detail}
                </p>
              )}
              <p style={{ margin: "8px 0 0", fontSize: 12.5, color: T.muted2 }}>
                Pitch: <strong style={{ color: T.ink3 }}>{PITCH_LABEL[account.pitch ?? "unknown"]}</strong>
                {" · "}Evidence: {GRADE_LABEL[account.grade ?? "unknown"]}
              </p>
            </Section>

            {/* pipeline */}
            <Section title="Pipeline">
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 }}>
                {CRM_STAGES.map(st => (
                  <button
                    key={st}
                    type="button"
                    disabled={saving}
                    onClick={() => run(() => patch(id, { stage: st }))}
                    style={chip(account.stage === st)}
                  >
                    {STAGE_LABEL[st]}
                  </button>
                ))}
              </div>
              <Field label="Next action">
                <input
                  value={action}
                  onChange={e => setNextAction(e.target.value)}
                  placeholder="e.g. intro via a fire-alarm distributor"
                  style={input}
                />
              </Field>
              <Field label="When">
                <input type="date" value={actionOn} onChange={e => setNextOn(e.target.value)} style={input} />
              </Field>
              {dirty && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => run(async () => {
                    await patch(id, { next_action: action, next_action_on: actionOn || null });
                    setNextAction(null); setNextOn(null);
                  })}
                  style={{ ...ghostBtn, borderColor: T.blue, color: T.blue }}
                >
                  {saving ? "Saving…" : "Save next action"}
                </button>
              )}
            </Section>

            {/* the scoring input a human resolves in the app */}
            <Section title="Last evidenced deal">
              <p style={{ margin: "0 0 8px", fontSize: 12.5, color: T.muted2, lineHeight: 1.6 }}>
                The one thing the register could not see. Setting it re-scores this
                firm — and a stale deal ranks below no evidence at all.
              </p>
              <input
                type="date"
                defaultValue={account.last_deal_on ? String(account.last_deal_on).slice(0, 10) : ""}
                onBlur={e => {
                  const v = e.target.value || null;
                  const cur = account.last_deal_on ? String(account.last_deal_on).slice(0, 10) : null;
                  if (v !== cur) run(() => patch(id, { last_deal_on: v }));
                }}
                style={input}
              />
            </Section>

            {/* deals run for this client — migration 114's join, read from
                this side. "Do we have a lead, and then transfer that into a
                deal" is this section plus the field under it. */}
            <Section title={`Deals for this client (${deals.length})`}>
              {deals.length === 0 ? (
                <p style={{ margin: "0 0 10px", fontSize: 13, color: T.muted }}>
                  No deals opened for them yet.
                </p>
              ) : deals.map(d => (
                <div key={d.id} style={{ padding: "7px 0", borderBottom: `1px solid ${T.rowDiv}` }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{d.business_name || d.name}</div>
                  <div style={{ fontSize: 12, color: T.muted2 }}>
                    {[d.current_gate, d.status, d.next_action].filter(Boolean).join(" · ")}
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <input
                  value={target}
                  onChange={e => setTarget(e.target.value)}
                  placeholder="Target company name"
                  style={{ ...input, flex: 1 }}
                />
                <button
                  type="button"
                  disabled={saving || !target.trim()}
                  onClick={() => run(async () => {
                    const r = await fetch(`/api/crm/accounts/${id}/deals`, {
                      method: "POST",
                      headers: { ...authHeaders(), "Content-Type": "application/json" },
                      body: JSON.stringify({ business_name: target.trim() }),
                    });
                    if (!r.ok) {
                      let d = ""; try { d = (await r.json())?.error || ""; } catch { /* none */ }
                      throw new Error(d || `HTTP ${r.status}`);
                    }
                    setTarget("");
                  })}
                  style={{ ...ghostBtn, borderColor: T.blue, color: T.blue, whiteSpace: "nowrap", opacity: target.trim() ? 1 : 0.5 }}
                >
                  Open a deal
                </button>
              </div>
              <p style={{ margin: "6px 0 0", fontSize: 12, color: T.muted2, lineHeight: 1.5 }}>
                The target company, not the client — the deal is what they're
                buying. It opens at gate B0 (Thesis), linked back to this client.
              </p>
            </Section>

            {/* The searches running for this client — the top of the chain
                that already existed: thesis → portfolio → candidates → deal.
                Sourcing does the hunting; nothing about that changed when the
                practice started working for clients. */}
            <Section title={`Searches (${searches.length})`}>
              {searches.length === 0 ? (
                <p style={{ margin: 0, fontSize: 13, color: T.muted }}>
                  No buy-box set up for them yet. Create one in Sourcing and pick
                  this client — the candidates and any deal that comes out of it
                  then belong to them.
                </p>
              ) : searches.map(t => (
                <div key={t.id} style={{ padding: "7px 0", borderBottom: `1px solid ${T.rowDiv}` }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: T.muted2 }}>
                    {[
                      t.industry, t.geography,
                      `${t.candidate_count} candidate${t.candidate_count === 1 ? "" : "s"}`,
                      t.is_active === false ? "paused" : null,
                    ].filter(Boolean).join(" · ")}
                  </div>
                </div>
              ))}
            </Section>

            {/* people */}
            <Section title={`People (${contacts.length})`}>
              {contacts.length === 0 ? (
                <p style={{ margin: 0, fontSize: 13, color: T.muted }}>
                  No named contact. This is a research task before it is a lead —
                  and it's the cheapest way to move the firm up the board.
                </p>
              ) : contacts.map(c => (
                <div key={c.id} style={{ padding: "8px 0", borderBottom: `1px solid ${T.rowDiv}` }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                    {c.name}
                    {c.role && (
                      <span style={{ color: T.blue, fontWeight: 600 }}> · {ROLE_LABEL[c.role] ?? c.role}</span>
                    )}
                    {c.is_primary && <span style={{ color: T.muted2, fontWeight: 400 }}> · primary</span>}
                  </div>
                  {c.title && <div style={{ fontSize: 12.5, color: T.muted }}>{c.title}</div>}
                  {(c.email || c.phone) && (
                    <div style={{ fontSize: 12.5, color: T.muted2 }}>{[c.email, c.phone].filter(Boolean).join(" · ")}</div>
                  )}
                  {!c.email && (
                    <div style={{ fontSize: 12, color: T.faint }}>no email — cannot be mailed or assigned</div>
                  )}
                </div>
              ))}

              {/* Add a person. ROLE is the load-bearing field: it decides who
                  gets a campaign and who can be assigned a deal action. */}
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <input value={pName} onChange={e => setPName(e.target.value)} placeholder="Name" style={input} />
                <div style={{ display: "flex", gap: 8 }}>
                  <select value={pRole} onChange={e => setPRole(e.target.value)} style={{ ...input, flex: 1 }}>
                    {CONTACT_ROLES.map(r => (
                      <option key={r} value={r}>{ROLE_LABEL[r] ?? r}</option>
                    ))}
                  </select>
                  <input value={pTitle} onChange={e => setPTitle(e.target.value)} placeholder="Title (optional)" style={{ ...input, flex: 1 }} />
                </div>
                <input value={pEmail} onChange={e => setPEmail(e.target.value)} placeholder="Email" style={input} />
                <button
                  type="button"
                  disabled={saving || !pName.trim()}
                  onClick={() => run(async () => {
                    const r = await fetch(`/api/crm/accounts/${id}/contacts`, {
                      method: "POST",
                      headers: { ...authHeaders(), "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name: pName.trim(), role: pRole,
                        title: pTitle.trim() || null, email: pEmail.trim() || null,
                      }),
                    });
                    if (!r.ok) {
                      let d = ""; try { d = (await r.json())?.error || ""; } catch { /* none */ }
                      throw new Error(d || `HTTP ${r.status}`);
                    }
                    setPName(""); setPTitle(""); setPEmail("");
                  })}
                  style={{ ...ghostBtn, alignSelf: "flex-start", opacity: pName.trim() ? 1 : 0.5 }}
                >
                  Add person
                </button>
              </div>
            </Section>

            {/* history */}
            <Section title="Touches">
              <div style={{ display: "flex", gap: 7, marginBottom: 8, flexWrap: "wrap" }}>
                {ACTIVITY_KINDS.map(k => (
                  <button key={k} type="button" style={chip(touchKind === k)} onClick={() => setTouchKind(k)}>
                    {k}
                  </button>
                ))}
              </div>
              <textarea
                value={touch}
                onChange={e => setTouch(e.target.value)}
                placeholder="What happened? This records the touch — it does not send anything."
                rows={3}
                style={{ ...input, resize: "vertical", lineHeight: 1.5 }}
              />
              <button
                type="button"
                disabled={saving || !touch.trim()}
                onClick={() => run(async () => {
                  await logActivity(id, { kind: touchKind, body: touch.trim(), direction: touchKind === "note" ? null : "out" });
                  setTouch("");
                })}
                style={{ ...ghostBtn, marginTop: 8, opacity: touch.trim() ? 1 : 0.5 }}
              >
                {saving ? "Saving…" : "Log it"}
              </button>

              <div style={{ marginTop: 14 }}>
                {activity.length === 0 ? (
                  <p style={{ margin: 0, fontSize: 13, color: T.muted }}>Never contacted.</p>
                ) : activity.map(v => (
                  <div key={v.id} style={{ padding: "8px 0", borderBottom: `1px solid ${T.rowDiv}` }}>
                    <div style={{ fontSize: 12, color: T.muted2 }}>
                      {v.kind}{v.direction ? ` · ${v.direction}` : ""} · {touchLabel(v.occurred_at) ?? v.occurred_at.slice(0, 10)}
                    </div>
                    {v.subject && <div style={{ fontSize: 13, fontWeight: 600 }}>{v.subject}</div>}
                    {v.body && <div style={{ fontSize: 13, color: T.ink3, lineHeight: 1.55 }}>{v.body}</div>}
                  </div>
                ))}
              </div>
            </Section>

            {/* provenance, verbatim */}
            {(account.evidence || account.source_url || account.notes) && (
              <Section title="Evidence">
                {account.evidence && (
                  <p style={{ margin: "0 0 8px", fontSize: 12.5, color: T.ink3, lineHeight: 1.6 }}>{account.evidence}</p>
                )}
                {account.source_url && (
                  <a href={account.source_url} target="_blank" rel="noreferrer"
                     style={{ fontSize: 12.5, color: T.blue, wordBreak: "break-all" }}>
                    {account.source_url}
                  </a>
                )}
                {account.notes && (
                  <p style={{ margin: "10px 0 0", fontSize: 12.5, color: T.muted, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {account.notes}
                  </p>
                )}
              </Section>
            )}

            <Section title="Not a client">
              <p style={{ margin: "0 0 8px", fontSize: 12.5, color: T.muted2, lineHeight: 1.6 }}>
                Some firms on the register are competitive context, not prospects.
                Flagging one here zeroes its score — this is never inferred from
                the notes.
              </p>
              <input
                defaultValue={account.disqualified ?? ""}
                placeholder="reason, e.g. competitive context"
                onBlur={e => {
                  const v = e.target.value.trim();
                  if (v !== (account.disqualified ?? "")) run(() => patch(id, { disqualified: v }));
                }}
                style={input}
              />
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

const input: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: "8px 11px", fontSize: 13,
  fontFamily: T.font, color: T.ink, background: T.white,
  border: `1px solid ${T.border}`, borderRadius: 8, outline: "none",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", color: T.muted2, marginBottom: 8 }}>
        {title.toUpperCase()}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: 10 }}>
      <span style={{ display: "block", fontSize: 12.5, color: T.muted, marginBottom: 4 }}>{label}</span>
      {children}
    </label>
  );
}
