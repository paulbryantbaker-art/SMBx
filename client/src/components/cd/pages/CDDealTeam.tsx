/**
 * CDDealTeam — the Deal Team collaboration surface ported into the Claude Design
 * (CD cool/indigo) language. A 1:1 route swap for V6 DealTeamView.
 *
 * Every value is REAL or honestly empty ("—" / skeleton). The data wiring is the
 * SAME live collaboration backend the V6 predecessor binds, via `useDealTeam`:
 *   GET    /api/deals/:id/participants  → { owner, participants, pendingInvitations }
 *   POST   /api/deals/:id/invite        ← { email, role, accessLevel }
 *   DELETE /api/deals/:id/participants/:participantId
 *   PATCH  /api/deals/:id/participants/:participantId ← { role?, accessLevel? }
 *   GET    /api/deals/:id/messages      → DealTeamMessage[] (threaded via parent_id)
 *   POST   /api/deals/:id/messages      ← { content, parentId?, mentions? }
 *
 * Visual target is the CD "Ultra Modern Fintech" deal-team (detail.jsx DealTeam):
 * a left roster split internal/external with an Invite affordance, and a right
 * threaded chat with @-mention compose. Rebuilt on `.cd-root` with only `--cd-*`
 * tokens — never the V3 warm/green palette. No fabricated members, no demo thread.
 *
 * THE LINE: this is a human collaboration surface (the team talks to each other),
 * not a Yulia-authored read, so no CDLineNote is forced. The "Ask Yulia who to
 * add" affordance routes to chat and stays inside THE LINE (no recommendation on
 * signing / custody / negotiation).
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { OpenTab } from "../../v6/types";
import type { User } from "../../../hooks/useAuth";
import {
  useDealTeam,
  DEAL_TEAM_ROLES,
  DEAL_TEAM_ACCESS_LEVELS,
  DEAL_TEAM_ROLE_LABELS,
  type DealTeamAccessLevel,
  type DealTeamMessage,
} from "../../v6/hooks/useDealTeam";
import { CDIcon, CDPill, CDCard, CDAvatar, cdDealColor, type CDTone } from "../kit/cdUi";

const ROLE_LABELS: Record<string, string> = DEAL_TEAM_ROLE_LABELS;

const ACCESS_LABELS: Record<DealTeamAccessLevel, string> = {
  full: "Full access",
  comment: "Comment",
  read: "Read only",
};
const ACCESS_TONE: Record<string, CDTone> = { full: "pos", comment: "accent", read: "neutral" };

/** Internal-vs-external split so the roster reads like a real deal team. */
const INTERNAL_ROLES = new Set(["owner"]);

function roleLabel(role: string | null | undefined): string {
  if (!role) return "Member";
  return ROLE_LABELS[role] || role.charAt(0).toUpperCase() + role.slice(1);
}
function initialsFor(name: string | null | undefined, email: string): string {
  const base = (name || email || "?").trim();
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return base.slice(0, 2).toUpperCase() || "?";
}
function timeAgo(dateStr: string): string {
  const then = new Date(dateStr).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Math.floor((Date.now() - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

/* ════════════════════════════════════════════════════════════════════════ */
export function CDDealTeam({
  dealId,
  dealTitle,
  onTalkToYulia,
  user,
}: {
  dealId: string;
  dealTitle: string;
  openTab?: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
  user?: User | null;
}) {
  const numericId = /^\d+$/.test(dealId) ? parseInt(dealId, 10) : null;
  const team = useDealTeam(numericId, user?.id ?? null);
  const color = cdDealColor(numericId ?? dealId);
  const memberCount = (team.owner ? 1 : 0) + team.participants.length;

  const askWhoToAdd = () =>
    onTalkToYulia?.(
      `On ${dealTitle}: who should be on the deal team for where we are, and what should I route to counsel vs. CPA vs. lender? Respect THE LINE — no recommendations on signing, custody, or negotiation.`,
    );

  return (
    <div
      className="cd-root cd-scrollable"
      style={{ background: "var(--cd-canvas)", height: "100%", overflow: "auto", padding: "30px 34px 60px", display: "flex", flexDirection: "column", gap: "var(--cd-gap)" }}
    >
      {/* ── Hero — flat CD header with the deal's color rail ── */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, minWidth: 0 }}>
          <span style={{ width: 11, height: 44, borderRadius: 4, background: color, flexShrink: 0, marginTop: 4 }} />
          <div style={{ minWidth: 0 }}>
            <h1 style={{ margin: 0, fontFamily: "var(--cd-serif)", fontWeight: 600, fontSize: 32, lineHeight: 1.04, letterSpacing: "-0.02em" }}>{dealTitle}</h1>
            <p style={{ margin: "8px 0 0", color: "var(--cd-ink-2)", fontSize: 13.5 }}>
              {numericId === null
                ? "Team collaboration opens once this deal is saved."
                : memberCount > 0
                  ? <>{memberCount} {memberCount === 1 ? "person" : "people"} on this deal · {team.isOwner ? "you own it" : "shared with you"}</>
                  : "Invite your advisors and counterparties to collaborate on this deal."}
            </p>
          </div>
        </div>
        {onTalkToYulia && numericId !== null && (
          <button type="button" style={ghostBtn} onClick={askWhoToAdd}>
            <CDIcon name="sparkle" size={13} color="var(--cd-accent)" />Ask Yulia who to add
          </button>
        )}
      </div>

      {/* ── Sample / non-persisted deal — honest, no fabricated team ── */}
      {numericId === null ? (
        <CDCard style={{ maxWidth: 640 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>
            Team collaboration opens once this deal is saved
          </h3>
          <p style={{ margin: "10px 0 0", fontSize: 13.5, color: "var(--cd-ink-2)", lineHeight: 1.55 }}>
            Sample and preview deals don&rsquo;t have a shared team yet. Create or open a real deal to invite your
            attorney, CPA, lender, broker, or counterparty and start a deal-team thread.
          </p>
        </CDCard>
      ) : (
        <>
          {team.teamError && (
            <CDCard style={{ borderColor: "var(--cd-neg-soft)", color: "var(--cd-neg)", fontSize: 13 }}>{team.teamError}</CDCard>
          )}

          <div style={grid}>
            <TeamColumn team={team} dealTitle={dealTitle} color={color} userId={user?.id ?? null} />
            <ChatColumn team={team} currentUserEmail={user?.email} />
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Team column: invite affordance + internal/external roster + pending ─── */
function TeamColumn({
  team,
  dealTitle,
  color,
  userId,
}: {
  team: ReturnType<typeof useDealTeam>;
  dealTitle: string;
  color: string;
  userId: number | null;
}) {
  const [showInvite, setShowInvite] = useState(false);

  const internal = team.participants.filter(p => INTERNAL_ROLES.has(p.role));
  const external = team.participants.filter(p => !INTERNAL_ROLES.has(p.role));

  return (
    <CDCard pad={false} style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "16px var(--cd-pad) 12px" }}>
        <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, letterSpacing: "-0.01em" }}>Deal team</h3>
        {team.isOwner && (
          <button type="button" style={showInvite ? ghostBtnSm : accentBtnSm} onClick={() => setShowInvite(v => !v)}>
            {showInvite ? "Close" : <><CDIcon name="plus" size={12} color="white" />Invite</>}
          </button>
        )}
      </div>

      {team.isOwner && showInvite && (
        <div style={{ padding: "0 var(--cd-pad) 4px" }}>
          <InviteForm team={team} dealTitle={dealTitle} onDone={() => setShowInvite(false)} />
        </div>
      )}

      <div style={{ padding: "0 var(--cd-pad) 18px" }}>
        {team.loadingTeam && !team.owner && <div style={loadingNote}>Loading team…</div>}

        {/* Internal — smbx.ai side (owner + any internal seats) */}
        {(team.owner || internal.length > 0) && (
          <>
            <div style={{ padding: "10px 0 2px", fontSize: 11.5, fontWeight: 600, color: "var(--cd-ink-3)" }}>Internal · smbx.ai</div>
            {team.owner && (
              <MemberRow
                name={team.owner.display_name}
                email={team.owner.email}
                role="owner"
                accessLevel="full"
                color={color}
                isOwnerRow
                isYou={userId != null && team.owner.id === userId}
              />
            )}
            {internal.map(p => (
              <MemberRow
                key={p.id}
                name={p.display_name}
                email={p.email}
                role={p.role}
                accessLevel={p.access_level}
                color={color}
                pending={p.accepted_at == null}
                canManage={team.isOwner}
                busy={team.mutatingParticipantId === p.id}
                isYou={userId != null && p.user_id === userId}
                onRemove={() => team.removeParticipant(p.id)}
                onChangeRole={(r) => team.changeRole(p.id, r, p.access_level as DealTeamAccessLevel)}
                onChangeAccess={(a) => team.changeRole(p.id, p.role, a)}
              />
            ))}
          </>
        )}

        {/* External — advisors / counterparties */}
        {external.length > 0 && (
          <>
            <div style={{ padding: "16px 0 2px", display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 600, color: "var(--cd-ink-3)" }}>
              <CDIcon name="share" size={11} color="var(--cd-ink-4)" />Advisors · external
            </div>
            {external.map(p => (
              <MemberRow
                key={p.id}
                name={p.display_name}
                email={p.email}
                role={p.role}
                accessLevel={p.access_level}
                color={color}
                pending={p.accepted_at == null}
                canManage={team.isOwner}
                busy={team.mutatingParticipantId === p.id}
                isYou={userId != null && p.user_id === userId}
                onRemove={() => team.removeParticipant(p.id)}
                onChangeRole={(r) => team.changeRole(p.id, r, p.access_level as DealTeamAccessLevel)}
                onChangeAccess={(a) => team.changeRole(p.id, p.role, a)}
              />
            ))}
          </>
        )}

        {team.owner && team.participants.length === 0 && !team.loadingTeam && (
          <div style={{ marginTop: 14, padding: "14px 15px", background: "var(--cd-surface-2)", border: "1px solid var(--cd-line)", borderRadius: "var(--cd-r-md)", fontSize: 12.5, color: "var(--cd-ink-2)", lineHeight: 1.5 }}>
            No advisors or counterparties yet.{" "}
            {team.isOwner
              ? "Use Invite to bring in your attorney, CPA, lender, broker, or the other side."
              : "The owner hasn't added anyone else."}
          </div>
        )}

        {/* Pending invitations — real, from the participants endpoint */}
        {team.pendingInvitations.length > 0 && (
          <>
            <div style={{ padding: "16px 0 2px", fontSize: 11.5, fontWeight: 600, color: "var(--cd-ink-3)" }}>Pending invitations</div>
            {team.pendingInvitations.map(inv => (
              <div key={inv.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 0", opacity: 0.78 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", background: "var(--cd-surface-3)", color: "var(--cd-ink-3)" }}>
                  <CDIcon name="clock" size={14} color="var(--cd-ink-3)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inv.email}</div>
                  <div style={{ fontSize: 11, color: "var(--cd-ink-3)" }}>Invited · expires {timeAgo(inv.expires_at)}</div>
                </div>
                <CDPill tone="neutral">{roleLabel(inv.role)}</CDPill>
              </div>
            ))}
          </>
        )}

        {/* read-only advisory note (matches CD fintech roster footnote) */}
        {(team.owner || team.participants.length > 0) && (
          <div style={{ marginTop: 16, padding: "11px 13px", background: "var(--cd-surface-2)", border: "1px solid var(--cd-line)", borderRadius: "var(--cd-r-md)", fontSize: 11, color: "var(--cd-ink-3)", lineHeight: 1.5 }}>
            <CDIcon name="flag" size={12} color="var(--cd-ink-4)" style={{ display: "inline-block", verticalAlign: "-2px", marginRight: 5 }} />
            Read-only advisors can follow shared documents but can&rsquo;t post or comment.
          </div>
        )}
      </div>
    </CDCard>
  );
}

function InviteForm({
  team,
  dealTitle,
  onDone,
}: {
  team: ReturnType<typeof useDealTeam>;
  dealTitle: string;
  onDone: () => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("consultant");
  const [accessLevel, setAccessLevel] = useState<DealTeamAccessLevel>("comment");

  const submit = async () => {
    const ok = await team.invite({ email, role, accessLevel });
    if (ok) {
      setEmail("");
      onDone();
    }
  };

  return (
    <div style={{ background: "var(--cd-surface-2)", border: "1px solid var(--cd-line)", borderRadius: "var(--cd-r-md)", padding: 14, marginBottom: 4 }}>
      <label style={fieldLabel} htmlFor="cd-dt-invite-email">Email</label>
      <input
        id="cd-dt-invite-email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder={`Invite to ${dealTitle}`}
        style={inputStyle}
        autoComplete="off"
      />
      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <label style={fieldLabel} htmlFor="cd-dt-invite-role">Role</label>
          <select id="cd-dt-invite-role" value={role} onChange={e => setRole(e.target.value)} style={selectStyle}>
            {DEAL_TEAM_ROLES.map(r => <option key={r} value={r}>{roleLabel(r)}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <label style={fieldLabel} htmlFor="cd-dt-invite-access">Access</label>
          <select
            id="cd-dt-invite-access"
            value={accessLevel}
            onChange={e => setAccessLevel(e.target.value as DealTeamAccessLevel)}
            style={selectStyle}
          >
            {DEAL_TEAM_ACCESS_LEVELS.map(a => <option key={a} value={a}>{ACCESS_LABELS[a]}</option>)}
          </select>
        </div>
      </div>

      {team.inviteError && <div style={{ marginTop: 10, fontSize: 12, color: "var(--cd-neg)" }}>{team.inviteError}</div>}

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button
          type="button"
          style={{ ...accentBtnSm, padding: "8px 14px", opacity: team.inviting || !email.trim() ? 0.55 : 1 }}
          onClick={() => { void submit(); }}
          disabled={team.inviting || !email.trim()}
        >
          {team.inviting ? "Sending…" : "Send invitation"}
        </button>
        <button type="button" style={ghostBtnSm} onClick={onDone}>Cancel</button>
      </div>
      <p style={{ margin: "10px 0 0", fontSize: 11.5, color: "var(--cd-ink-3)", lineHeight: 1.4 }}>
        We email a secure invite link. They get {ACCESS_LABELS[accessLevel].toLowerCase()} as {roleLabel(role).toLowerCase()} once they accept.
      </p>
    </div>
  );
}

function MemberRow({
  name,
  email,
  role,
  accessLevel,
  color,
  isOwnerRow = false,
  isYou = false,
  pending = false,
  canManage = false,
  busy = false,
  onRemove,
  onChangeRole,
  onChangeAccess,
}: {
  name: string | null;
  email: string;
  role: string;
  accessLevel: string;
  color: string;
  isOwnerRow?: boolean;
  isYou?: boolean;
  pending?: boolean;
  canManage?: boolean;
  busy?: boolean;
  onRemove?: () => void;
  onChangeRole?: (role: string) => void;
  onChangeAccess?: (access: DealTeamAccessLevel) => void;
}) {
  const [editing, setEditing] = useState(false);
  const accessKey = (accessLevel as DealTeamAccessLevel);

  return (
    <div style={{ padding: "9px 0", borderBottom: "1px solid var(--cd-line)", opacity: pending ? 0.82 : 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <CDAvatar initials={initialsFor(name, email)} size={32} color={isOwnerRow ? color : undefined} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name || email.split("@")[0]}</span>
            {isYou && <span style={{ fontSize: 9.5, color: "var(--cd-ink-4)", fontWeight: 500 }}>(you)</span>}
          </div>
          <div style={{ fontSize: 11, color: "var(--cd-ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {roleLabel(role)} · {email}{pending ? " · invite pending" : ""}
          </div>
        </div>
        <CDPill tone={ACCESS_TONE[accessLevel] || "neutral"}>
          {accessKey === "read" ? <CDIcon name="flag" size={10} color="var(--cd-ink-3)" /> : null}
          {ACCESS_LABELS[accessKey] || accessLevel}
        </CDPill>
        {canManage && !isOwnerRow && (
          <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
            <button type="button" style={iconBtn} title="Change role and access" aria-label="Change role and access" disabled={busy} aria-expanded={editing} onClick={() => setEditing(v => !v)}>
              <CDIcon name="settings" size={13} color="var(--cd-ink-3)" />
            </button>
            <button
              type="button"
              style={iconBtn}
              title="Remove from deal"
              aria-label="Remove from deal"
              disabled={busy}
              onClick={() => { if (window.confirm(`Remove ${name || email} from this deal?`)) onRemove?.(); }}
            >
              <CDIcon name="close" size={13} color="var(--cd-ink-3)" />
            </button>
          </div>
        )}
      </div>

      {editing && canManage && !isOwnerRow && (
        <div style={{ display: "flex", gap: 10, marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--cd-line)" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label style={fieldLabel}>Role</label>
            <select value={role} onChange={e => onChangeRole?.(e.target.value)} style={selectStyle} disabled={busy}>
              {DEAL_TEAM_ROLES.map(r => <option key={r} value={r}>{roleLabel(r)}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label style={fieldLabel}>Access</label>
            <select value={accessLevel} onChange={e => onChangeAccess?.(e.target.value as DealTeamAccessLevel)} style={selectStyle} disabled={busy}>
              {DEAL_TEAM_ACCESS_LEVELS.map(a => <option key={a} value={a}>{ACCESS_LABELS[a]}</option>)}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Chat column: threaded deal-team messages + @-mention compose ─── */
interface ThreadNode {
  message: DealTeamMessage;
  replies: DealTeamMessage[];
}
function buildThreads(messages: DealTeamMessage[]): ThreadNode[] {
  const byParent = new Map<number, DealTeamMessage[]>();
  const roots: DealTeamMessage[] = [];
  for (const m of messages) {
    if (m.parent_id == null) roots.push(m);
    else {
      const list = byParent.get(m.parent_id) ?? [];
      list.push(m);
      byParent.set(m.parent_id, list);
    }
  }
  // Orphan replies (parent outside the window) surface as roots so nothing is lost.
  for (const [parentId, replies] of byParent.entries()) {
    if (!messages.some(m => m.id === parentId)) roots.push(...replies);
  }
  return roots.map(message => ({
    message,
    replies: (byParent.get(message.id) ?? []).filter(r => messages.some(m => m.id === r.parent_id)),
  }));
}

interface MentionCandidate { userId: number; name: string; role: string }
function mentionToken(name: string): string { return name.replace(/\s+/g, ""); }

function ChatColumn({ team, currentUserEmail }: { team: ReturnType<typeof useDealTeam>; currentUserEmail?: string }) {
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<DealTeamMessage | null>(null);
  const [mentionIds, setMentionIds] = useState<number[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState<number>(-1);
  const [mentionActive, setMentionActive] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const threads = useMemo(() => buildThreads(team.messages), [team.messages]);
  const isMe = (email: string) => !!currentUserEmail && email === currentUserEmail;
  const openCount = team.messages.length;

  // Mention candidates: owner first, then accepted participants, skipping yourself.
  const candidates = useMemo<MentionCandidate[]>(() => {
    const out: MentionCandidate[] = [];
    const seen = new Set<number>();
    const push = (userId: number | null | undefined, name: string | null, email: string, role: string) => {
      if (userId == null || seen.has(userId)) return;
      if (currentUserEmail && email === currentUserEmail) return;
      seen.add(userId);
      out.push({ userId, name: name || email.split("@")[0], role });
    };
    if (team.owner) push(team.owner.id, team.owner.display_name, team.owner.email, "owner");
    for (const p of team.participants) {
      if (p.accepted_at == null) continue;
      push(p.user_id, p.display_name, p.email, p.role);
    }
    return out;
  }, [team.owner, team.participants, currentUserEmail]);

  const mentionMatches = useMemo<MentionCandidate[]>(() => {
    if (mentionQuery == null) return [];
    const q = mentionQuery.toLowerCase();
    return candidates
      .filter(c => q === "" || mentionToken(c.name).toLowerCase().startsWith(q) || c.name.toLowerCase().startsWith(q))
      .slice(0, 6);
  }, [candidates, mentionQuery]);

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [team.messages.length]);

  const closeMention = () => { setMentionQuery(null); setMentionStart(-1); setMentionActive(0); };

  const syncMentionState = (value: string, caret: number) => {
    const upToCaret = value.slice(0, caret);
    const at = upToCaret.lastIndexOf("@");
    if (at === -1) { closeMention(); return; }
    const charBefore = at === 0 ? "" : upToCaret[at - 1];
    const atWordBoundary = at === 0 || /\s/.test(charBefore);
    const token = upToCaret.slice(at + 1);
    const tokenHasSpace = /\s/.test(token);
    if (atWordBoundary && !tokenHasSpace) {
      setMentionQuery(token);
      setMentionStart(at);
      setMentionActive(0);
    } else {
      closeMention();
    }
  };

  const onDraftChange = (value: string, caret: number) => {
    setDraft(value);
    syncMentionState(value, caret);
    setMentionIds(prev => prev.filter(id => {
      const c = candidates.find(x => x.userId === id);
      return c ? value.includes(`@${c.name}`) : false;
    }));
  };

  const selectMention = (c: MentionCandidate | undefined) => {
    if (!c || mentionStart < 0 || !textareaRef.current) return;
    const el = textareaRef.current;
    const caret = el.selectionStart ?? draft.length;
    const before = draft.slice(0, mentionStart);
    const after = draft.slice(caret);
    const insert = `@${c.name} `;
    const next = before + insert + after;
    setDraft(next);
    setMentionIds(prev => (prev.includes(c.userId) ? prev : [...prev, c.userId]));
    closeMention();
    const nextCaret = before.length + insert.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(nextCaret, nextCaret);
    });
  };

  const handleSend = async () => {
    if (!draft.trim()) return;
    const activeMentions = mentionIds.filter(id => {
      const c = candidates.find(x => x.userId === id);
      return c ? draft.includes(`@${c.name}`) : false;
    });
    const ok = await team.sendMessage(draft, replyTo?.id ?? null, activeMentions);
    if (ok) {
      setDraft("");
      setMentionIds([]);
      closeMention();
      setReplyTo(null);
      textareaRef.current?.focus();
    }
  };

  return (
    <CDCard pad={false} style={{ display: "flex", flexDirection: "column", minWidth: 0, height: "min(70vh, 740px)", overflow: "hidden" }}>
      {/* head */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "14px var(--cd-pad)", borderBottom: "1px solid var(--cd-line)", flexShrink: 0 }}>
        <CDIcon name="comment" size={16} color="var(--cd-accent)" />
        <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, letterSpacing: "-0.01em" }}>Deal chat</h3>
        <span className="cd-num" style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--cd-ink-3)", fontWeight: 600 }}>
          {openCount} message{openCount === 1 ? "" : "s"}
        </span>
      </div>

      {/* thread */}
      <div ref={scrollRef} className="cd-scrollable" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "18px var(--cd-pad)", display: "flex", flexDirection: "column", gap: 14 }}>
        {team.loadingMessages && team.messages.length === 0 && <div style={loadingNote}>Loading discussion…</div>}

        {!team.loadingMessages && team.messages.length === 0 && !team.messagesError && (
          <div style={{ margin: "auto", maxWidth: 320, textAlign: "center", display: "flex", flexDirection: "column", gap: 7 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--cd-accent-soft)", display: "grid", placeItems: "center", margin: "0 auto" }}>
              <CDIcon name="comment" size={18} color="var(--cd-accent)" />
            </div>
            <strong style={{ fontSize: 14, color: "var(--cd-ink)", fontWeight: 700 }}>No messages yet</strong>
            <span style={{ fontSize: 12.5, color: "var(--cd-ink-3)", lineHeight: 1.45 }}>
              Start the conversation with your deal team. Everyone with comment or full access can reply.
            </span>
          </div>
        )}

        {threads.map(node => (
          <div key={node.message.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <MessageBubble message={node.message} mine={isMe(node.message.email)} canReply={team.canPost} onReply={() => setReplyTo(node.message)} />
            {node.replies.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginLeft: 28, paddingLeft: 14, borderLeft: "2px solid var(--cd-line)" }}>
                {node.replies.map(reply => (
                  <MessageBubble key={reply.id} message={reply} mine={isMe(reply.email)} reply canReply={team.canPost} onReply={() => setReplyTo(node.message)} />
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {team.messagesError && <div style={{ margin: "0 var(--cd-pad) 10px", fontSize: 12, color: "var(--cd-neg)" }}>{team.messagesError}</div>}

      {/* composer */}
      <div style={{ padding: "12px var(--cd-pad) 16px", borderTop: "1px solid var(--cd-line)", flexShrink: 0 }}>
        {replyTo && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, padding: "6px 10px", borderRadius: 8, background: "var(--cd-surface-2)", border: "1px solid var(--cd-line)" }}>
            <span style={{ flex: 1, minWidth: 0, fontSize: 11.5, color: "var(--cd-ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              Replying to {replyTo.display_name || replyTo.email.split("@")[0]}: &ldquo;{replyTo.content.slice(0, 60)}{replyTo.content.length > 60 ? "…" : ""}&rdquo;
            </span>
            <button type="button" style={{ all: "unset", cursor: "pointer", display: "grid", placeItems: "center", padding: 2 }} onClick={() => setReplyTo(null)} aria-label="Cancel reply">
              <CDIcon name="close" size={12} color="var(--cd-ink-3)" />
            </button>
          </div>
        )}
        {team.canPost ? (
          <div style={{ border: "1px solid var(--cd-line-2)", borderRadius: "var(--cd-r-md)", background: "var(--cd-surface)", padding: 10, boxShadow: "var(--cd-shadow-sm)", position: "relative" }}>
            {mentionQuery != null && mentionMatches.length > 0 && (
              <div style={mentionMenu} role="listbox" aria-label="Mention a teammate">
                {mentionMatches.map((c, i) => (
                  <button
                    key={c.userId}
                    type="button"
                    role="option"
                    aria-selected={i === mentionActive}
                    style={{ ...mentionItem, ...(i === mentionActive ? { background: "var(--cd-surface-2)" } : null) }}
                    onMouseEnter={() => setMentionActive(i)}
                    onMouseDown={e => { e.preventDefault(); selectMention(c); }}
                  >
                    <CDAvatar initials={c.name.charAt(0).toUpperCase()} size={24} />
                    <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: "var(--cd-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                    <CDPill tone="neutral">{roleLabel(c.role)}</CDPill>
                  </button>
                ))}
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={e => onDraftChange(e.target.value, e.target.selectionStart ?? e.target.value.length)}
              onClick={e => syncMentionState((e.target as HTMLTextAreaElement).value, (e.target as HTMLTextAreaElement).selectionStart ?? 0)}
              onKeyDown={e => {
                const menuOpen = mentionQuery != null && mentionMatches.length > 0;
                if (menuOpen) {
                  if (e.key === "ArrowDown") { e.preventDefault(); setMentionActive(a => (a + 1) % mentionMatches.length); return; }
                  if (e.key === "ArrowUp") { e.preventDefault(); setMentionActive(a => (a - 1 + mentionMatches.length) % mentionMatches.length); return; }
                  if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); selectMention(mentionMatches[mentionActive]); return; }
                  if (e.key === "Escape") { e.preventDefault(); closeMention(); return; }
                }
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleSend(); }
              }}
              placeholder={replyTo ? "Write a reply…" : "Message the deal team…  use @ to mention"}
              rows={2}
              aria-label="Message the deal team"
              style={{ width: "100%", boxSizing: "border-box", border: "none", outline: "none", resize: "none", maxHeight: 120, fontFamily: "var(--cd-sans)", fontSize: 13.5, lineHeight: 1.45, color: "var(--cd-ink)", background: "transparent" }}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--cd-ink-4)" }}>
                <CDAvatar initials={(currentUserEmail || "You").slice(0, 2).toUpperCase()} size={20} color="var(--cd-accent)" />
                <span>Posting as you · <span className="cd-num">↵</span> to send</span>
              </div>
              <button
                type="button"
                style={{ width: 32, height: 32, borderRadius: 9, background: "var(--cd-accent)", border: "none", display: "grid", placeItems: "center", cursor: !draft.trim() || team.sending ? "default" : "pointer", opacity: !draft.trim() || team.sending ? 0.5 : 1 }}
                onClick={() => { void handleSend(); }}
                disabled={!draft.trim() || team.sending}
                aria-label="Send message"
              >
                {team.sending ? <CDIcon name="clock" size={15} color="white" /> : <CDIcon name="send" size={15} color="white" />}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: "11px 13px", borderRadius: "var(--cd-r-md)", background: "var(--cd-surface-2)", border: "1px solid var(--cd-line)", fontSize: 12, color: "var(--cd-ink-3)", lineHeight: 1.5 }}>
            <CDIcon name="flag" size={12} color="var(--cd-ink-4)" style={{ display: "inline-block", verticalAlign: "-2px", marginRight: 5 }} />
            Your access level is read-only, so you can follow the discussion but can&rsquo;t post. Ask the deal owner for comment access.
          </div>
        )}
      </div>
    </CDCard>
  );
}

/** Visual-only @mention highlighting (same token shape selectMention inserts). */
function renderWithMentions(text: string, mine: boolean): ReactNode {
  const parts: ReactNode[] = [];
  const re = /(^|[\s(])(@[A-Za-z0-9][A-Za-z0-9._-]*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    const lead = m[1];
    const handle = m[2];
    const start = m.index + lead.length;
    if (start > last) parts.push(text.slice(last, start));
    parts.push(
      <span
        key={`mention-${key++}`}
        style={mine
          ? { color: "white", fontWeight: 700, textDecoration: "underline" }
          : { color: "var(--cd-accent-strong)", fontWeight: 600, background: "var(--cd-accent-soft)", borderRadius: 4, padding: "0 3px" }}
      >
        {handle}
      </span>,
    );
    last = start + handle.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
}

function MessageBubble({
  message,
  mine,
  reply = false,
  canReply = false,
  onReply,
}: {
  message: DealTeamMessage;
  mine: boolean;
  reply?: boolean;
  canReply?: boolean;
  onReply?: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: "92%", alignItems: mine ? "flex-end" : "flex-start", alignSelf: mine ? "flex-end" : "flex-start" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, flexDirection: mine ? "row-reverse" : "row" }}>
        <strong style={{ fontSize: 11.5, fontWeight: 700, color: "var(--cd-ink-2)" }}>{mine ? "You" : message.display_name || message.email.split("@")[0]}</strong>
        {message.participant_role && <CDPill tone="neutral">{roleLabel(message.participant_role)}</CDPill>}
        <span style={{ fontSize: 10.5, color: "var(--cd-ink-4)" }}>{timeAgo(message.created_at)}</span>
      </div>
      <div
        style={{
          borderRadius: 14,
          padding: "10px 13px",
          fontSize: reply ? 13 : 13.5,
          lineHeight: 1.5,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          ...(mine
            ? { background: "var(--cd-accent)", color: "white", borderBottomRightRadius: 4 }
            : { background: "var(--cd-surface-2)", color: "var(--cd-ink)", border: "1px solid var(--cd-line)", borderBottomLeftRadius: 4 }),
        }}
      >
        {renderWithMentions(message.content, mine)}
      </div>
      {canReply && !reply && (
        <button
          type="button"
          style={{ all: "unset", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "var(--cd-ink-3)", padding: "2px 4px", alignSelf: mine ? "flex-end" : "flex-start" }}
          onClick={onReply}
        >
          Reply
        </button>
      )}
    </div>
  );
}

/* ─── Styles (only --cd-* tokens) ───────────────────────────────────────── */
const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(300px, 0.8fr) minmax(0, 1.2fr)",
  gap: "var(--cd-gap)",
  alignItems: "start",
};
const ghostBtn: CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6, background: "var(--cd-surface)", color: "var(--cd-ink-2)",
  border: "1px solid var(--cd-line-2)", borderRadius: "var(--cd-r-md)", padding: "9px 14px", fontSize: 12.5,
  fontWeight: 600, cursor: "pointer", fontFamily: "var(--cd-sans)", whiteSpace: "nowrap", boxShadow: "var(--cd-shadow-sm)",
};
const ghostBtnSm: CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 5, background: "var(--cd-surface)", color: "var(--cd-ink-2)",
  border: "1px solid var(--cd-line-2)", borderRadius: 8, padding: "6px 11px", fontSize: 11.5, fontWeight: 600,
  cursor: "pointer", fontFamily: "var(--cd-sans)", whiteSpace: "nowrap",
};
const accentBtnSm: CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 5, background: "var(--cd-accent)", color: "white",
  border: "none", borderRadius: 8, padding: "6px 11px", fontSize: 11.5, fontWeight: 600, cursor: "pointer",
  fontFamily: "var(--cd-sans)", whiteSpace: "nowrap",
};
const iconBtn: CSSProperties = {
  width: 28, height: 28, borderRadius: 8, border: "1px solid var(--cd-line)", background: "var(--cd-surface)",
  display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0,
};
const loadingNote: CSSProperties = { fontSize: 12, color: "var(--cd-ink-3)", padding: "10px 2px" };
const fieldLabel: CSSProperties = { display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--cd-ink-3)", marginBottom: 5 };
const inputStyle: CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 10, border: "1px solid var(--cd-line-2)",
  background: "var(--cd-surface)", color: "var(--cd-ink)", fontSize: 13.5, fontFamily: "var(--cd-sans)", outline: "none",
};
const selectStyle: CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 10, border: "1px solid var(--cd-line-2)",
  background: "var(--cd-surface)", color: "var(--cd-ink)", fontSize: 13, fontFamily: "var(--cd-sans)", outline: "none", cursor: "pointer",
};
const mentionMenu: CSSProperties = {
  position: "absolute", left: 0, right: 0, bottom: "calc(100% + 6px)", background: "var(--cd-surface)",
  border: "1px solid var(--cd-line-2)", borderRadius: "var(--cd-r-md)", boxShadow: "var(--cd-shadow-md)",
  padding: 5, zIndex: 20, display: "flex", flexDirection: "column", gap: 2,
};
const mentionItem: CSSProperties = {
  all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, padding: "7px 9px",
  borderRadius: 9, boxSizing: "border-box",
};
