/* V6 Mobile — Deal Team screen.

   Mobile twin of the desktop DealTeamView. Single-column, App Store glass
   aesthetic (--mb-* tokens, watercolor-free white page like the data-room
   real-read screen). Two segmented sections in one scroll:

     • Team     — owner + participant list (role pill, access), owner-only
                  invite (email + role + access), remove / change role/access.
     • Messages — the deal_messages thread (bubbles, role badge, reply), a
                  compose box with @-autocomplete over participants that inserts
                  @Name + collects user-ids into `mentions`, highlights @Name in
                  rendered messages, and hides for read-only seats (canPost).

   Pure data comes from useDealTeam(dealId, userId) — the same hook the desktop
   surface uses, whenever there is a real numeric dealId.

   Dev / sample deals have no numeric id (dealId === null). Rather than hide the
   surface, the screen renders the SAME Team / Messages UI populated with sample
   collaboration data (a small fixed team + a short threaded conversation with an
   @mention and a reply), so reviewers can see deal-team chat in dev — consistent
   with the rest of the mobile app's sample-data experience. The invite form and
   compose box render but are inert in sample mode, with an honest "Sample" note.
   PRODUCTION is unaffected: real deals always have numeric ids → live path.

   Numbers in mono. No new deps beyond lucide-react (already used on mobile). */

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Loader2, Reply, Settings2, Trash2, UserPlus, X } from "lucide-react";
import { MobileIcon } from "../icons";
import {
  useDealTeam,
  DEAL_TEAM_ROLES,
  DEAL_TEAM_ACCESS_LEVELS,
  DEAL_TEAM_ROLE_LABELS,
  type DealTeamAccessLevel,
  type DealTeamMessage,
} from "../../hooks/useDealTeam";

const ROLE_LABELS: Record<string, string> = DEAL_TEAM_ROLE_LABELS;

const ACCESS_LABELS: Record<DealTeamAccessLevel, string> = {
  full: "Full access",
  comment: "Comment",
  read: "Read-only",
};

/** Role → one of the three mobile verdict tones, so badges stay on-palette. */
function roleTone(role: string | null | undefined): { bg: string; ink: string; dot: string } {
  switch (role) {
    case "owner":
    case "broker":
    case "re_agent":
      return { bg: "var(--mb-verdict-pursue-soft)", ink: "var(--mb-verdict-pursue-ink)", dot: "var(--mb-verdict-pursue)" };
    case "counterparty":
      return { bg: "var(--mb-danger-soft)", ink: "var(--mb-danger-ink)", dot: "var(--mb-danger)" };
    case "cpa":
    case "lender":
    case "attorney":
    case "auditor":
    case "appraiser":
    case "escrow":
    case "title":
    case "insurance":
      return { bg: "var(--mb-warn-soft)", ink: "var(--mb-warn-ink)", dot: "var(--mb-warn)" };
    case "consultant":
    default:
      return { bg: "var(--mb-card-2)", ink: "var(--mb-ink-2)", dot: "var(--mb-ink-4)" };
  }
}

function roleLabel(role: string | null | undefined): string {
  if (!role) return "Member";
  return ROLE_LABELS[role] || role.charAt(0).toUpperCase() + role.slice(1);
}

function initialsFor(name: string | null | undefined, email: string): string {
  const base = (name || email || "?").trim();
  return base.charAt(0).toUpperCase() || "?";
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

function RoleBadge({ role }: { role: string | null | undefined }) {
  const tone = roleTone(role);
  return (
    <span style={{ ...T.roleBadge, background: tone.bg, color: tone.ink }}>
      <span aria-hidden="true" style={{ ...T.roleDot, background: tone.dot }} />
      {roleLabel(role)}
    </span>
  );
}

type Section = "team" | "messages";

export function MobileDealTeamScreen({
  dealId,
  dealTitle,
  userId,
  userEmail,
  initials,
  onBack,
  onAvatarClick,
}: {
  /** Real numeric deal id for the live participants/messages backend, or null
   *  for a sample/dev deal (renders sample collaboration data instead). */
  dealId: number | null;
  dealTitle: string;
  /** Signed-in user id (drives owner-only controls + canPost). */
  userId?: number | null;
  /** Current-user email — marks "You" on your bubbles + excludes you from @mentions. */
  userEmail?: string | null;
  /** Header avatar initials. */
  initials?: string;
  onBack: () => void;
  onAvatarClick?: () => void;
}) {
  // Sample / dev deal (no numeric id): render the same UI with sample data so
  // the surface is reviewable in dev. Real deals fall through to the live hook.
  if (dealId == null) {
    return (
      <DemoDealTeamScreen
        dealTitle={dealTitle}
        initials={initials}
        onBack={onBack}
        onAvatarClick={onAvatarClick}
      />
    );
  }

  return (
    <LiveDealTeamScreen
      dealId={dealId}
      dealTitle={dealTitle}
      userId={userId}
      userEmail={userEmail}
      initials={initials}
      onBack={onBack}
      onAvatarClick={onAvatarClick}
    />
  );
}

function LiveDealTeamScreen({
  dealId,
  dealTitle,
  userId,
  userEmail,
  initials,
  onBack,
  onAvatarClick,
}: {
  dealId: number;
  dealTitle: string;
  userId?: number | null;
  userEmail?: string | null;
  initials?: string;
  onBack: () => void;
  onAvatarClick?: () => void;
}) {
  const team = useDealTeam(dealId, userId ?? null);
  const [section, setSection] = useState<Section>("team");

  const memberCount = (team.owner ? 1 : 0) + team.participants.length;

  return (
    <div className="mb-fade-up" style={{ ...T.page, position: "relative" }}>
      <button type="button" onClick={onBack} aria-label="Back" style={T.floatBack}>
        <MobileIcon name="back" size={14} c="var(--mb-ink-1)" />
      </button>
      {onAvatarClick && (
        <button type="button" onClick={onAvatarClick} aria-label="Account" style={T.floatAvatar}>
          <span style={T.floatAvatarText}>{initials || "JM"}</span>
        </button>
      )}

      <div style={T.breadcrumb}>
        <span style={T.breadcrumbLink}>{dealTitle}</span>
        <MobileIcon name="chevron" c="var(--mb-ink-4)" size={9} />
        <span>Deal team</span>
      </div>

      <div style={T.hero}>
        <h1 style={T.h1}>Deal team</h1>
        <div style={T.heroSub}>{dealTitle}</div>
        <div style={T.heroMeta}>
          <span className="mb-mono" style={T.heroCount}>
            {team.loadingTeam && !team.owner
              ? "LOADING…"
              : `${memberCount} ${memberCount === 1 ? "PERSON" : "PEOPLE"}`}
          </span>
          <span style={T.heroDot} aria-hidden="true">·</span>
          <span style={T.heroRole}>{team.isOwner ? "You own it" : "Shared with you"}</span>
        </div>
      </div>

      {/* Segmented control — Team / Messages */}
      <div style={T.segmentRow}>
        <Segment label="Team" count={memberCount} active={section === "team"} onClick={() => setSection("team")} />
        <Segment label="Messages" count={team.messages.length} active={section === "messages"} onClick={() => setSection("messages")} />
      </div>

      {section === "team" ? (
        <TeamSection team={team} dealTitle={dealTitle} />
      ) : (
        <MessagesSection team={team} currentUserEmail={userEmail ?? undefined} />
      )}
    </div>
  );
}

/* ─── Demo / sample Deal Team (no real deal id) ────────────────

   Renders the exact Team / Messages UI — same chrome, Segment, RoleBadge,
   bubbles, role badges, times, and @Name highlight — but populated from a
   fixed sample team + thread instead of the live hook. Invite + compose are
   visible (so the surface reads complete) but inert, with an honest note that
   this is sample data. Reachable only in dev/sample mode; production deals
   always have a numeric id and use the live path above. */

interface DemoMember {
  name: string;
  email: string;
  role: string;
  accessLevel: DealTeamAccessLevel;
  isOwnerRow?: boolean;
}

interface DemoMessage {
  id: number;
  parentId: number | null;
  name: string;
  role: string;
  mine?: boolean;
  /** Minutes ago, turned into a real timestamp at render so timeAgo() works. */
  minutesAgo: number;
  content: string;
}

const DEMO_MEMBERS: DemoMember[] = [
  { name: "You", email: "you@smbx.ai", role: "owner", accessLevel: "full", isOwnerRow: true },
  { name: "Jordan Lee", email: "jordan.lee@harborlaw.com", role: "attorney", accessLevel: "full" },
  { name: "Priya Shah", email: "priya.shah@shahcpa.com", role: "cpa", accessLevel: "comment" },
  { name: "Marcus Reed", email: "marcus.reed@firstcapital.com", role: "lender", accessLevel: "comment" },
  { name: "Dana Whitfield", email: "dana@whitfieldbrokers.com", role: "counterparty", accessLevel: "read" },
];

const DEMO_MESSAGES: DemoMessage[] = [
  {
    id: 1, parentId: null, name: "You", role: "owner", mine: true, minutesAgo: 182,
    content: "Kicking off the deal team here. Working file is the FY recast + the SBA structure. @Priya Shah can you sanity-check the add-backs before we send anything to the lender?",
  },
  {
    id: 2, parentId: 1, name: "Priya Shah", role: "cpa", minutesAgo: 168,
    content: "On it. The owner-comp and one-time legal add-backs look supportable; the vehicle add-back I want to tie to the depreciation schedule before we rely on it.",
  },
  {
    id: 3, parentId: null, name: "Marcus Reed", role: "lender", minutesAgo: 95,
    content: "Once the recast is locked I can run it against a 10-year 7(a). Early read is DSCR clears comfortably at the current asking, but I'll need the normalized SDE Priya signs off on.",
  },
  {
    id: 4, parentId: null, name: "Jordan Lee", role: "attorney", minutesAgo: 47,
    content: "Flagging that the lease assignment will need landlord consent — that's usually the long pole. I'll draft the LOI scaffold so structure and contingencies are spelled out before anyone signs.",
  },
  {
    id: 5, parentId: null, name: "Dana Whitfield", role: "counterparty", minutesAgo: 12,
    content: "Seller is motivated and open to a short transition period. Happy to get you the trailing-twelve P&L this week so your team can verify against the recast.",
  },
];

function DemoDealTeamScreen({
  dealTitle,
  initials,
  onBack,
  onAvatarClick,
}: {
  dealTitle: string;
  initials?: string;
  onBack: () => void;
  onAvatarClick?: () => void;
}) {
  const [section, setSection] = useState<Section>("team");
  const memberCount = DEMO_MEMBERS.length;

  return (
    <div className="mb-fade-up" style={{ ...T.page, position: "relative" }}>
      <button type="button" onClick={onBack} aria-label="Back" style={T.floatBack}>
        <MobileIcon name="back" size={14} c="var(--mb-ink-1)" />
      </button>
      {onAvatarClick && (
        <button type="button" onClick={onAvatarClick} aria-label="Account" style={T.floatAvatar}>
          <span style={T.floatAvatarText}>{initials || "JM"}</span>
        </button>
      )}

      <div style={T.breadcrumb}>
        <span style={T.breadcrumbLink}>{dealTitle}</span>
        <MobileIcon name="chevron" c="var(--mb-ink-4)" size={9} />
        <span>Deal team</span>
      </div>

      <div style={T.hero}>
        <h1 style={T.h1}>Deal team</h1>
        <div style={T.heroSub}>{dealTitle}</div>
        <div style={T.heroMeta}>
          <span className="mb-mono" style={T.heroCount}>{memberCount} PEOPLE</span>
          <span style={T.heroDot} aria-hidden="true">·</span>
          <span style={T.heroRole}>You own it</span>
        </div>
      </div>

      {/* Honest sample banner — this is demo data, not a live deal team. */}
      <div style={T.sampleBanner} role="note">
        <span className="mb-mono" style={T.sampleBannerKicker}>SAMPLE MODE</span>
        <span style={T.sampleBannerText}>
          Sample deal team. Sign in with a real deal for live collaboration — invite and messaging are inactive here.
        </span>
      </div>

      {/* Segmented control — Team / Messages */}
      <div style={T.segmentRow}>
        <Segment label="Team" count={memberCount} active={section === "team"} onClick={() => setSection("team")} />
        <Segment label="Messages" count={DEMO_MESSAGES.length} active={section === "messages"} onClick={() => setSection("messages")} />
      </div>

      {section === "team" ? <DemoTeamSection dealTitle={dealTitle} /> : <DemoMessagesSection />}
    </div>
  );
}

function DemoTeamSection({ dealTitle }: { dealTitle: string }) {
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div style={T.sectionPad}>
      <button
        type="button"
        onClick={() => setShowInvite(v => !v)}
        style={{ ...T.inviteToggle, ...(showInvite ? T.inviteToggleOpen : null) }}
      >
        <UserPlus size={16} strokeWidth={2.2} color={showInvite ? "var(--mb-ink-2)" : "var(--mb-accent-ink)"} />
        <span>{showInvite ? "Close invite" : "Invite to this deal"}</span>
      </button>

      {showInvite && (
        <div className="mb-as-card" style={T.inviteCard}>
          <label style={T.fieldLabel} htmlFor="mdt-demo-invite-email">Email</label>
          <input
            id="mdt-demo-invite-email"
            type="email"
            inputMode="email"
            autoComplete="off"
            autoCapitalize="none"
            placeholder={`Invite to ${dealTitle}`}
            style={T.input}
            disabled
          />
          <div style={T.fieldRow}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label style={T.fieldLabel} htmlFor="mdt-demo-invite-role">Role</label>
              <div style={T.selectWrap}>
                <select id="mdt-demo-invite-role" style={T.select} disabled defaultValue="consultant">
                  {DEAL_TEAM_ROLES.map(r => (
                    <option key={r} value={r}>{roleLabel(r)}</option>
                  ))}
                </select>
                <span aria-hidden="true" style={T.selectChevron}><MobileIcon name="chevron" size={11} c="var(--mb-ink-3)" /></span>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label style={T.fieldLabel} htmlFor="mdt-demo-invite-access">Access</label>
              <div style={T.selectWrap}>
                <select id="mdt-demo-invite-access" style={T.select} disabled defaultValue="comment">
                  {DEAL_TEAM_ACCESS_LEVELS.map(a => (
                    <option key={a} value={a}>{ACCESS_LABELS[a]}</option>
                  ))}
                </select>
                <span aria-hidden="true" style={T.selectChevron}><MobileIcon name="chevron" size={11} c="var(--mb-ink-3)" /></span>
              </div>
            </div>
          </div>
          <button type="button" disabled style={{ ...T.primaryBtn, opacity: 0.55, cursor: "default" }}>
            Send invitation
          </button>
          <p style={T.inviteHint}>Sample — sign in with a real deal to send invites.</p>
        </div>
      )}

      <div style={T.memberList}>
        {DEMO_MEMBERS.map(m => (
          <div key={m.email} style={T.memberRow}>
            <span style={m.isOwnerRow ? T.avatarOwner : T.avatar}>{initialsFor(m.name, m.email)}</span>
            <span style={T.memberText}>
              <strong style={T.memberName}>{m.name}</strong>
              <span style={T.memberMeta}>
                {m.email}
                {!m.isOwnerRow && ` · ${ACCESS_LABELS[m.accessLevel]}`}
              </span>
            </span>
            <RoleBadge role={m.role} />
          </div>
        ))}
      </div>
    </div>
  );
}

function DemoMessagesSection() {
  // Turn relative minutes into stable timestamps once per mount so timeAgo()
  // renders "Xh ago" / "Xm ago" exactly like the live thread.
  const now = useRef(Date.now()).current;
  const stamp = (minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString();
  const roots = DEMO_MESSAGES.filter(m => m.parentId == null);
  const repliesOf = (id: number) => DEMO_MESSAGES.filter(m => m.parentId === id);

  return (
    <div style={T.chatSectionPad}>
      <div style={T.chatScroll}>
        {roots.map(root => (
          <div key={root.id} style={T.threadBlock}>
            <DemoBubble message={root} createdAt={stamp(root.minutesAgo)} />
            {repliesOf(root.id).length > 0 && (
              <div style={T.replyStack}>
                {repliesOf(root.id).map(reply => (
                  <DemoBubble key={reply.id} message={reply} createdAt={stamp(reply.minutesAgo)} reply />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Inert compose — looks live, but disabled in sample mode. */}
      <div style={T.composeWrap}>
        <div style={T.composeRow}>
          <div style={T.composeField}>
            <textarea
              placeholder="Sample — sign in with a real deal to message your team"
              rows={1}
              style={{ ...T.textarea, opacity: 0.7 }}
              disabled
            />
          </div>
          <button type="button" aria-label="Send message" disabled style={{ ...T.sendBtn, opacity: 0.5, cursor: "default" }}>
            <span style={{ transform: "rotate(90deg)", display: "grid", placeItems: "center" }}><MobileIcon name="back" size={15} c="#fff" /></span>
          </button>
        </div>
      </div>
    </div>
  );
}

function DemoBubble({ message, createdAt, reply = false }: { message: DemoMessage; createdAt: string; reply?: boolean }) {
  const mine = !!message.mine;
  return (
    <div style={{ ...T.bubbleWrap, alignItems: mine ? "flex-end" : "flex-start" }}>
      <div style={{ ...T.bubbleMeta, flexDirection: mine ? "row-reverse" : "row" }}>
        <strong style={T.bubbleName}>{mine ? "You" : message.name}</strong>
        <RoleBadge role={message.role} />
        <span style={T.bubbleTime}>{timeAgo(createdAt)}</span>
      </div>
      <div style={{ ...T.bubble, ...(mine ? T.bubbleMine : T.bubbleOther), ...(reply ? T.bubbleReply : null) }}>
        {renderWithMentions(message.content, mine)}
      </div>
    </div>
  );
}

function Segment({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        ...T.segment,
        background: active ? "var(--mb-ink)" : "#fff",
        color: active ? "#fff" : "var(--mb-ink-1)",
        boxShadow: active ? "none" : "0 1px 3px rgba(0,0,0,0.06), inset 0 0 0 0.5px var(--mb-line-2)",
      }}
    >
      {label}
      <span
        className="mb-mono"
        style={{
          ...T.segmentCount,
          background: active ? "rgba(255,255,255,0.22)" : "var(--mb-card-2)",
          color: active ? "#fff" : "var(--mb-ink-3)",
        }}
      >
        {count}
      </span>
    </button>
  );
}

/* ─── Team section ─────────────────────────────────────────── */

function TeamSection({ team, dealTitle }: { team: ReturnType<typeof useDealTeam>; dealTitle: string }) {
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div style={T.sectionPad}>
      {team.teamError && <div style={T.errorBanner} role="alert">{team.teamError}</div>}

      {team.isOwner && (
        <button
          type="button"
          onClick={() => setShowInvite(v => !v)}
          style={{ ...T.inviteToggle, ...(showInvite ? T.inviteToggleOpen : null) }}
        >
          <UserPlus size={16} strokeWidth={2.2} color={showInvite ? "var(--mb-ink-2)" : "var(--mb-accent-ink)"} />
          <span>{showInvite ? "Close invite" : "Invite to this deal"}</span>
        </button>
      )}

      {team.isOwner && showInvite && (
        <InviteCard team={team} dealTitle={dealTitle} onDone={() => setShowInvite(false)} />
      )}

      {team.loadingTeam && !team.owner && (
        <div className="mb-as-card" style={T.stateCard}>
          <div className="mb-mono" style={T.stateKicker}>DEAL TEAM</div>
          <div style={T.stateTitle}>Loading team…</div>
          <div style={T.stateCopy}>Fetching the people on this deal.</div>
        </div>
      )}

      <div style={T.memberList}>
        {team.owner && (
          <MemberRow
            name={team.owner.display_name}
            email={team.owner.email}
            role="owner"
            accessLevel="full"
            isOwnerRow
          />
        )}

        {team.participants.map(p => (
          <MemberRow
            key={p.id}
            name={p.display_name}
            email={p.email}
            role={p.role}
            accessLevel={p.access_level}
            pending={p.accepted_at == null}
            canManage={team.isOwner}
            busy={team.mutatingParticipantId === p.id}
            onRemove={() => team.removeParticipant(p.id)}
            onChangeRole={(role) => team.changeRole(p.id, role, p.access_level as DealTeamAccessLevel)}
            onChangeAccess={(access) => team.changeRole(p.id, p.role, access)}
          />
        ))}
      </div>

      {team.owner && team.participants.length === 0 && !team.loadingTeam && (
        <div className="mb-as-card" style={T.stateCard}>
          <div aria-hidden="true" style={T.stateIcon}>
            <UserPlus size={24} strokeWidth={2} />
          </div>
          <div style={T.stateTitle}>Just you so far</div>
          <div style={T.stateCopy}>
            {team.isOwner
              ? "Invite your attorney, CPA, lender, broker, or the other side to collaborate on this deal."
              : "The owner hasn’t added anyone else yet."}
          </div>
        </div>
      )}

      {team.pendingInvitations.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div className="mb-section-eyebrow" style={{ paddingLeft: 4, marginBottom: 8 }}>PENDING INVITATIONS</div>
          <div style={T.memberList}>
            {team.pendingInvitations.map(inv => (
              <div key={inv.id} style={{ ...T.memberRow, opacity: 0.72 }}>
                <span style={T.avatarPending} aria-hidden="true">
                  <Loader2 size={15} strokeWidth={2.2} color="var(--mb-ink-3)" />
                </span>
                <span style={T.memberText}>
                  <strong style={T.memberName}>{inv.email}</strong>
                  <span style={T.memberMeta}>Invited · expires {timeAgo(inv.expires_at)}</span>
                </span>
                <RoleBadge role={inv.role} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InviteCard({
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
    <div className="mb-as-card" style={T.inviteCard}>
      <label style={T.fieldLabel} htmlFor="mdt-invite-email">Email</label>
      <input
        id="mdt-invite-email"
        type="email"
        inputMode="email"
        autoComplete="off"
        autoCapitalize="none"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder={`Invite to ${dealTitle}`}
        style={T.input}
      />

      <div style={T.fieldRow}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <label style={T.fieldLabel} htmlFor="mdt-invite-role">Role</label>
          <div style={T.selectWrap}>
            <select id="mdt-invite-role" value={role} onChange={e => setRole(e.target.value)} style={T.select}>
              {DEAL_TEAM_ROLES.map(r => (
                <option key={r} value={r}>{roleLabel(r)}</option>
              ))}
            </select>
            <span aria-hidden="true" style={T.selectChevron}><MobileIcon name="chevron" size={11} c="var(--mb-ink-3)" /></span>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <label style={T.fieldLabel} htmlFor="mdt-invite-access">Access</label>
          <div style={T.selectWrap}>
            <select
              id="mdt-invite-access"
              value={accessLevel}
              onChange={e => setAccessLevel(e.target.value as DealTeamAccessLevel)}
              style={T.select}
            >
              {DEAL_TEAM_ACCESS_LEVELS.map(a => (
                <option key={a} value={a}>{ACCESS_LABELS[a]}</option>
              ))}
            </select>
            <span aria-hidden="true" style={T.selectChevron}><MobileIcon name="chevron" size={11} c="var(--mb-ink-3)" /></span>
          </div>
        </div>
      </div>

      {team.inviteError && <div style={{ ...T.errorBanner, marginTop: 12, marginBottom: 0 }} role="alert">{team.inviteError}</div>}

      <button
        type="button"
        onClick={() => { void submit(); }}
        disabled={team.inviting || !email.trim()}
        style={{ ...T.primaryBtn, opacity: team.inviting || !email.trim() ? 0.55 : 1 }}
      >
        {team.inviting ? "Sending…" : "Send invitation"}
      </button>
      <p style={T.inviteHint}>
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
  isOwnerRow = false,
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
  isOwnerRow?: boolean;
  pending?: boolean;
  canManage?: boolean;
  busy?: boolean;
  onRemove?: () => void;
  onChangeRole?: (role: string) => void;
  onChangeAccess?: (access: DealTeamAccessLevel) => void;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div style={{ ...T.memberRow, opacity: pending ? 0.82 : 1 }}>
      <span style={isOwnerRow ? T.avatarOwner : T.avatar}>{initialsFor(name, email)}</span>
      <span style={T.memberText}>
        <strong style={T.memberName}>{name || email.split("@")[0]}</strong>
        <span style={T.memberMeta}>
          {email}
          {!isOwnerRow && ` · ${ACCESS_LABELS[(accessLevel as DealTeamAccessLevel)] || accessLevel}`}
          {pending && " · invite pending"}
        </span>
      </span>
      <RoleBadge role={role} />

      {canManage && !isOwnerRow && (
        <div style={T.memberActions}>
          <button
            type="button"
            style={T.iconBtn}
            aria-label="Change role and access"
            disabled={busy}
            onClick={() => setEditing(v => !v)}
          >
            {busy ? <Loader2 size={15} strokeWidth={2.2} color="var(--mb-ink-2)" /> : <Settings2 size={15} strokeWidth={2.1} color="var(--mb-ink-2)" />}
          </button>
          <button
            type="button"
            style={T.iconBtn}
            aria-label="Remove from deal"
            disabled={busy}
            onClick={() => { if (window.confirm(`Remove ${name || email} from this deal?`)) onRemove?.(); }}
          >
            <Trash2 size={15} strokeWidth={2.1} color="var(--mb-danger-ink)" />
          </button>
        </div>
      )}

      {editing && canManage && !isOwnerRow && (
        <div style={T.editRow}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label style={T.fieldLabel}>Role</label>
            <div style={T.selectWrap}>
              <select value={role} onChange={e => onChangeRole?.(e.target.value)} style={T.select} disabled={busy}>
                {DEAL_TEAM_ROLES.map(r => (
                  <option key={r} value={r}>{roleLabel(r)}</option>
                ))}
              </select>
              <span aria-hidden="true" style={T.selectChevron}><MobileIcon name="chevron" size={11} c="var(--mb-ink-3)" /></span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label style={T.fieldLabel}>Access</label>
            <div style={T.selectWrap}>
              <select
                value={accessLevel}
                onChange={e => onChangeAccess?.(e.target.value as DealTeamAccessLevel)}
                style={T.select}
                disabled={busy}
              >
                {DEAL_TEAM_ACCESS_LEVELS.map(a => (
                  <option key={a} value={a}>{ACCESS_LABELS[a]}</option>
                ))}
              </select>
              <span aria-hidden="true" style={T.selectChevron}><MobileIcon name="chevron" size={11} c="var(--mb-ink-3)" /></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Messages section ─────────────────────────────────────── */

interface ThreadNode {
  message: DealTeamMessage;
  replies: DealTeamMessage[];
}

function buildThreads(messages: DealTeamMessage[]): ThreadNode[] {
  const byParent = new Map<number, DealTeamMessage[]>();
  const roots: DealTeamMessage[] = [];
  for (const m of messages) {
    if (m.parent_id == null) {
      roots.push(m);
    } else {
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

/** A person who can be @mentioned: deal owner or an accepted participant. */
interface MentionCandidate {
  userId: number;
  name: string;
  role: string;
}

function MessagesSection({ team, currentUserEmail }: { team: ReturnType<typeof useDealTeam>; currentUserEmail?: string }) {
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<DealTeamMessage | null>(null);
  // user-ids the author has @mentioned in the current draft (server re-validates).
  const [mentionIds, setMentionIds] = useState<number[]>([]);
  // open @-autocomplete state: the query after the active "@" and where it began.
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState<number>(-1);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const threads = useMemo(() => buildThreads(team.messages), [team.messages]);

  // Resolve "mine" by the signed-in user's email when we have it (parity with
  // desktop). If it wasn't threaded in, fall back to marking the owner's own
  // messages as "You" when the current user IS the owner. Read-path honesty: we
  // never falsely claim a message is yours.
  const myEmail = currentUserEmail || (team.isOwner ? team.owner?.email : undefined);
  const isMe = (email: string) => !!myEmail && email === myEmail;

  // Mention candidates: owner first, then accepted participants. Skip the
  // current user (you don't mention yourself) when we can resolve them.
  const candidates = useMemo<MentionCandidate[]>(() => {
    const out: MentionCandidate[] = [];
    const seen = new Set<number>();
    const push = (uid: number | null | undefined, name: string | null, email: string, role: string) => {
      if (uid == null || seen.has(uid)) return;
      if (myEmail && email === myEmail) return;
      seen.add(uid);
      out.push({ userId: uid, name: name || email.split("@")[0], role });
    };
    if (team.owner) push(team.owner.id, team.owner.display_name, team.owner.email, "owner");
    for (const p of team.participants) {
      if (p.accepted_at == null) continue; // only people who can actually be notified
      push(p.user_id, p.display_name, p.email, p.role);
    }
    return out;
  }, [team.owner, team.participants, myEmail]);

  const mentionToken = (name: string) => name.replace(/\s+/g, "");

  const mentionMatches = useMemo<MentionCandidate[]>(() => {
    if (mentionQuery == null) return [];
    const q = mentionQuery.toLowerCase();
    return candidates
      .filter(c => q === "" || mentionToken(c.name).toLowerCase().startsWith(q) || c.name.toLowerCase().startsWith(q))
      .slice(0, 5);
  }, [candidates, mentionQuery]);

  // Keep the latest message in view as the poll brings new ones in.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [team.messages.length]);

  const closeMention = () => {
    setMentionQuery(null);
    setMentionStart(-1);
  };

  // Re-derive the active @-query from the caret position after every change.
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
    } else {
      closeMention();
    }
  };

  const onDraftChange = (value: string, caret: number) => {
    setDraft(value);
    syncMentionState(value, caret);
    // Drop any recorded mention whose "@Name" text no longer appears in the draft.
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
    // Only send mentions whose "@Name" text is actually present in the final draft.
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
    <div style={T.chatSectionPad}>
      <div style={T.chatScroll}>
        {team.loadingMessages && team.messages.length === 0 && (
          <div className="mb-as-card" style={T.stateCard}>
            <div className="mb-mono" style={T.stateKicker}>DEAL DISCUSSION</div>
            <div style={T.stateTitle}>Loading messages…</div>
          </div>
        )}

        {!team.loadingMessages && team.messages.length === 0 && !team.messagesError && (
          <div className="mb-as-card" style={T.stateCard}>
            <div aria-hidden="true" style={T.stateIcon}>
              <MobileIcon name="chat" size={24} c="var(--mb-accent-ink)" />
            </div>
            <div style={T.stateTitle}>No messages yet</div>
            <div style={T.stateCopy}>
              Start the conversation with your deal team. Everyone with comment or full access can reply, and @mentions land as notifications.
            </div>
          </div>
        )}

        {threads.map(node => (
          <div key={node.message.id} style={T.threadBlock}>
            <MessageBubble
              message={node.message}
              mine={isMe(node.message.email)}
              canReply={team.canPost}
              onReply={() => setReplyTo(node.message)}
            />
            {node.replies.length > 0 && (
              <div style={T.replyStack}>
                {node.replies.map(reply => (
                  <MessageBubble
                    key={reply.id}
                    message={reply}
                    mine={isMe(reply.email)}
                    reply
                    canReply={team.canPost}
                    onReply={() => setReplyTo(node.message)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {team.messagesError && <div style={{ ...T.errorBanner, margin: "0 0 10px" }} role="alert">{team.messagesError}</div>}

      {/* Compose — fixed-feel card at the bottom of the section. */}
      {team.canPost ? (
        <div style={T.composeWrap}>
          {replyTo && (
            <div style={T.replyChip}>
              <Reply size={13} strokeWidth={2.2} color="var(--mb-ink-3)" />
              <span style={T.replyChipText}>
                Replying to {replyTo.display_name || replyTo.email.split("@")[0]}: “{replyTo.content.slice(0, 48)}{replyTo.content.length > 48 ? "…" : ""}”
              </span>
              <button type="button" style={T.replyChipClose} onClick={() => setReplyTo(null)} aria-label="Cancel reply">
                <X size={13} strokeWidth={2.4} color="var(--mb-ink-3)" />
              </button>
            </div>
          )}

          <div style={T.composeRow}>
            <div style={T.composeField}>
              {mentionQuery != null && mentionMatches.length > 0 && (
                <div style={T.mentionMenu} role="listbox" aria-label="Mention a teammate">
                  <div className="mb-mono" style={T.mentionMenuHead}>MENTION</div>
                  {mentionMatches.map((c) => (
                    <button
                      key={c.userId}
                      type="button"
                      role="option"
                      aria-selected="false"
                      style={T.mentionItem}
                      // mousedown (not click) so the textarea doesn't blur first.
                      onMouseDown={e => { e.preventDefault(); selectMention(c); }}
                    >
                      <span style={T.mentionAvatar}>{c.name.charAt(0).toUpperCase()}</span>
                      <span style={T.mentionName}>{c.name}</span>
                      <RoleBadge role={c.role} />
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
                  if (menuOpen && (e.key === "Enter" || e.key === "Tab")) {
                    e.preventDefault();
                    selectMention(mentionMatches[0]);
                    return;
                  }
                  if (menuOpen && e.key === "Escape") { e.preventDefault(); closeMention(); return; }
                }}
                placeholder={replyTo ? "Write a reply…" : "Message your deal team…  (@ to mention)"}
                rows={1}
                style={T.textarea}
              />
            </div>
            <button
              type="button"
              onClick={() => { void handleSend(); }}
              disabled={!draft.trim() || team.sending}
              aria-label="Send message"
              style={{ ...T.sendBtn, opacity: !draft.trim() || team.sending ? 0.5 : 1 }}
            >
              {team.sending
                ? <Loader2 size={16} strokeWidth={2.4} color="#fff" />
                : <span style={{ transform: "rotate(90deg)", display: "grid", placeItems: "center" }}><MobileIcon name="back" size={15} c="#fff" /></span>}
            </button>
          </div>
        </div>
      ) : (
        <div style={T.readOnlyNote}>
          Your access level is read-only, so you can follow the discussion but can’t post. Ask the deal owner for comment access.
        </div>
      )}
    </div>
  );
}

/**
 * Render message text with @mentions highlighted. We accent any "@Word" run
 * (letters, digits, ., _, -) — the same shape selectMention inserts. Purely
 * visual; the server is the source of truth for who was actually notified.
 */
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
      <span key={`mention-${key++}`} style={mine ? T.mentionTokenMine : T.mentionToken}>
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
    <div style={{ ...T.bubbleWrap, alignItems: mine ? "flex-end" : "flex-start" }}>
      <div style={{ ...T.bubbleMeta, flexDirection: mine ? "row-reverse" : "row" }}>
        <strong style={T.bubbleName}>{mine ? "You" : message.display_name || message.email.split("@")[0]}</strong>
        <RoleBadge role={message.participant_role} />
        <span style={T.bubbleTime}>{timeAgo(message.created_at)}</span>
      </div>
      <div style={{ ...T.bubble, ...(mine ? T.bubbleMine : T.bubbleOther), ...(reply ? T.bubbleReply : null) }}>
        {renderWithMentions(message.content, mine)}
      </div>
      {canReply && !reply && (
        <button type="button" style={{ ...T.replyBtn, alignSelf: mine ? "flex-end" : "flex-start" }} onClick={onReply}>
          Reply
        </button>
      )}
    </div>
  );
}

/* ─── Styles — mobile --mb-* tokens, white page (data-room real-read twin) ─── */

const T: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 120px)",
    background: "#fff",
  },

  floatBack: {
    position: "absolute",
    top: "calc(env(safe-area-inset-top, 44px) + 16px)",
    left: 16,
    zIndex: 10,
    width: 32, height: 32, borderRadius: "50%",
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
    border: "none", display: "grid", placeItems: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)", cursor: "pointer",
  },
  floatAvatar: {
    position: "absolute",
    top: "calc(env(safe-area-inset-top, 44px) + 16px)",
    right: 16,
    zIndex: 10,
    width: 32, height: 32, borderRadius: "50%",
    background: "var(--mb-ink)", color: "#fff",
    border: "none", display: "grid", placeItems: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)", cursor: "pointer",
  },
  floatAvatarText: { fontFamily: "var(--mb-font-display)", fontWeight: 700, fontSize: 12, letterSpacing: "-0.2px" },

  breadcrumb: {
    padding: "calc(env(safe-area-inset-top, 44px) + 60px) 22px 6px",
    fontSize: 12.5, color: "var(--mb-ink-3)",
    display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap",
  },
  breadcrumbLink: { color: "var(--mb-accent-ink)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60vw" },

  hero: { padding: "4px 22px 16px" },
  h1: {
    fontFamily: "var(--mb-font-display)", fontWeight: 800, fontSize: 32,
    letterSpacing: "-1px", lineHeight: 1.05, margin: 0, color: "var(--mb-ink)",
  },
  heroSub: { fontSize: 14, color: "var(--mb-ink-3)", marginTop: 4, textWrap: "balance" },
  heroMeta: { marginTop: 12, display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" },
  heroCount: { fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "var(--mb-ink-2)" },
  heroDot: { color: "var(--mb-ink-4)" },
  heroRole: { fontSize: 12, color: "var(--mb-ink-3)" },

  segmentRow: { display: "flex", gap: 8, padding: "0 22px 14px" },
  segment: {
    flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
    padding: "9px 12px", borderRadius: 999, border: "none",
    fontFamily: "var(--mb-font-body)", fontSize: 13.5, fontWeight: 700, letterSpacing: "-0.2px",
    cursor: "pointer",
  },
  segmentCount: { padding: "1px 7px", borderRadius: 999, fontSize: 11, fontWeight: 700, minWidth: 18, textAlign: "center" },

  sectionPad: { padding: "2px 16px 0" },
  chatSectionPad: { padding: "2px 16px 0", display: "flex", flexDirection: "column" },

  // state cards (loading / empty / error placeholders)
  stateCard: {
    padding: "24px 20px 22px",
    display: "flex", flexDirection: "column", alignItems: "flex-start",
    marginTop: 4,
  },
  stateIcon: {
    width: 50, height: 50, borderRadius: 15,
    background: "var(--mb-accent-soft)", color: "var(--mb-accent-ink)",
    display: "grid", placeItems: "center", marginBottom: 14,
  },
  stateKicker: { fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: "var(--mb-ink-3)", marginBottom: 8 },
  stateTitle: {
    fontFamily: "var(--mb-font-display)", fontWeight: 800, fontSize: 19,
    letterSpacing: "-0.4px", lineHeight: 1.15, color: "var(--mb-ink)",
  },
  stateCopy: { fontSize: 14, lineHeight: 1.45, color: "var(--mb-ink-3)", marginTop: 6, textWrap: "pretty" },

  errorBanner: {
    borderRadius: 14, padding: "11px 14px", marginBottom: 12,
    background: "var(--mb-danger-soft)", color: "var(--mb-danger-ink)",
    fontSize: 13, fontWeight: 600, lineHeight: 1.4, textWrap: "pretty",
    boxShadow: "inset 0 0 0 0.5px rgba(216,139,132,0.4)",
  },

  // invite
  inviteToggle: {
    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
    padding: "13px 14px", marginBottom: 12, borderRadius: 14,
    background: "var(--mb-accent-soft)", color: "var(--mb-accent-ink)",
    border: "none", fontFamily: "var(--mb-font-body)", fontSize: 14.5, fontWeight: 700,
    letterSpacing: "-0.2px", cursor: "pointer",
  },
  inviteToggleOpen: { background: "var(--mb-card-2)", color: "var(--mb-ink-2)" },
  inviteCard: { padding: "16px 16px 16px", marginBottom: 12 },
  fieldLabel: { display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--mb-ink-2)", letterSpacing: "-0.1px", marginBottom: 7 },
  fieldRow: { display: "flex", gap: 10, marginTop: 12 },
  input: {
    width: "100%", boxSizing: "border-box", padding: "11px 13px", borderRadius: 12,
    border: "none", background: "var(--mb-card-2)", color: "var(--mb-ink)",
    fontSize: 16, fontFamily: "var(--mb-font-body)", outline: "none",
    boxShadow: "inset 0 0 0 0.5px var(--mb-line-2)",
  },
  selectWrap: { position: "relative" },
  select: {
    width: "100%", boxSizing: "border-box", padding: "11px 30px 11px 13px", borderRadius: 12,
    border: "none", background: "var(--mb-card-2)", color: "var(--mb-ink)",
    fontSize: 15, fontFamily: "var(--mb-font-body)", outline: "none",
    boxShadow: "inset 0 0 0 0.5px var(--mb-line-2)",
    appearance: "none", WebkitAppearance: "none", cursor: "pointer",
  },
  selectChevron: {
    position: "absolute", right: 11, top: "50%", transform: "translateY(-50%) rotate(-90deg)",
    pointerEvents: "none", display: "grid", placeItems: "center",
  },
  primaryBtn: {
    width: "100%", marginTop: 14, padding: "13px 14px", borderRadius: 12,
    background: "var(--mb-accent-2)", color: "#fff",
    border: "none", fontFamily: "var(--mb-font-body)", fontSize: 15, fontWeight: 700,
    letterSpacing: "-0.2px", cursor: "pointer",
  },
  inviteHint: { margin: "10px 0 0", fontSize: 12, color: "var(--mb-ink-3)", lineHeight: 1.4, textWrap: "pretty" },

  // member list
  memberList: { display: "flex", flexDirection: "column", gap: 8 },
  memberRow: {
    display: "grid",
    gridTemplateColumns: "36px minmax(0, 1fr) auto",
    alignItems: "center", columnGap: 11, rowGap: 12,
    padding: "12px 14px", borderRadius: 16,
    background: "var(--mb-card)", boxShadow: "0 1px 3px rgba(0,0,0,0.05), inset 0 0 0 0.5px var(--mb-line-2)",
  },
  avatar: {
    width: 36, height: 36, borderRadius: 999, flexShrink: 0,
    display: "grid", placeItems: "center",
    background: "var(--mb-card-2)", color: "var(--mb-ink-2)",
    fontSize: 14, fontWeight: 800,
  },
  avatarOwner: {
    width: 36, height: 36, borderRadius: 999, flexShrink: 0,
    display: "grid", placeItems: "center",
    background: "var(--mb-ink)", color: "#fff",
    fontSize: 14, fontWeight: 800,
  },
  avatarPending: {
    width: 36, height: 36, borderRadius: 999, flexShrink: 0,
    display: "grid", placeItems: "center",
    background: "var(--mb-card-2)", color: "var(--mb-ink-3)",
  },
  memberText: { minWidth: 0, display: "flex", flexDirection: "column", gap: 2 },
  memberName: {
    fontSize: 14.5, fontWeight: 700, color: "var(--mb-ink)", letterSpacing: "-0.2px",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  memberMeta: {
    fontSize: 12, color: "var(--mb-ink-3)",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  roleBadge: {
    display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0,
    padding: "4px 9px", borderRadius: 999,
    fontSize: 10.5, fontWeight: 800, letterSpacing: "0.02em", whiteSpace: "nowrap",
  },
  roleDot: { width: 5, height: 5, borderRadius: "50%", flexShrink: 0 },
  memberActions: { gridColumn: "1 / -1", display: "flex", gap: 8, justifyContent: "flex-end" },
  iconBtn: {
    width: 34, height: 34, borderRadius: 10, border: "none",
    background: "var(--mb-card-2)", display: "grid", placeItems: "center", cursor: "pointer",
  },
  editRow: {
    gridColumn: "1 / -1", display: "flex", gap: 10, marginTop: 2,
    paddingTop: 12, borderTop: "0.5px solid var(--mb-line-2)",
  },

  // chat
  chatScroll: { display: "flex", flexDirection: "column", gap: 16, paddingBottom: 12 },
  threadBlock: { display: "flex", flexDirection: "column", gap: 10 },
  replyStack: {
    display: "flex", flexDirection: "column", gap: 10,
    marginLeft: 18, paddingLeft: 14, borderLeft: "2px solid var(--mb-line-2)",
  },
  bubbleWrap: { display: "flex", flexDirection: "column", gap: 4, maxWidth: "90%" },
  bubbleMeta: { display: "flex", alignItems: "center", gap: 7 },
  bubbleName: { fontSize: 12, fontWeight: 700, color: "var(--mb-ink-2)" },
  bubbleTime: { fontSize: 11, color: "var(--mb-ink-4)" },
  bubble: {
    borderRadius: 16, padding: "10px 13px", fontSize: 14.5, lineHeight: 1.45,
    whiteSpace: "pre-wrap", wordBreak: "break-word",
  },
  bubbleMine: { background: "var(--mb-ink)", color: "#fff", borderBottomRightRadius: 5 },
  bubbleOther: {
    background: "var(--mb-card)", color: "var(--mb-ink)",
    boxShadow: "inset 0 0 0 0.5px var(--mb-line-2)", borderBottomLeftRadius: 5,
  },
  bubbleReply: { fontSize: 14 },
  replyBtn: {
    border: "none", background: "transparent", cursor: "pointer",
    fontSize: 11.5, fontWeight: 700, color: "var(--mb-ink-3)", padding: "2px 4px",
    fontFamily: "var(--mb-font-body)",
  },

  composeWrap: {
    position: "sticky", bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
    marginTop: 4,
    padding: 12, borderRadius: 20,
    background: "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.86))",
    WebkitBackdropFilter: "blur(20px) saturate(180%)", backdropFilter: "blur(20px) saturate(180%)",
    boxShadow: "0 8px 28px -12px rgba(25,24,19,0.28), inset 0 0 0 0.5px var(--mb-line-2)",
  },
  replyChip: {
    display: "flex", alignItems: "center", gap: 7, marginBottom: 9,
    padding: "7px 10px", borderRadius: 10, background: "var(--mb-card-2)",
  },
  replyChipText: { flex: 1, minWidth: 0, fontSize: 11.5, color: "var(--mb-ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  replyChipClose: { border: "none", background: "transparent", cursor: "pointer", display: "grid", placeItems: "center", padding: 2 },
  composeRow: { display: "flex", alignItems: "flex-end", gap: 8 },
  composeField: { flex: 1, minWidth: 0, position: "relative" },
  textarea: {
    width: "100%", boxSizing: "border-box",
    resize: "none", maxHeight: 120, minHeight: 42,
    padding: "11px 14px", borderRadius: 14, border: "none",
    background: "var(--mb-card-2)", color: "var(--mb-ink)", fontSize: 16,
    fontFamily: "var(--mb-font-body)", outline: "none", lineHeight: 1.4,
    boxShadow: "inset 0 0 0 0.5px var(--mb-line-2)",
  },
  sendBtn: {
    flexShrink: 0, width: 42, height: 42, borderRadius: 999, border: "none",
    background: "var(--mb-ink)", color: "#fff",
    display: "grid", placeItems: "center", cursor: "pointer",
  },

  // @-mention autocomplete (anchored above the textarea)
  mentionMenu: {
    position: "absolute", left: 0, right: 0, bottom: "calc(100% + 8px)",
    background: "rgba(255,255,255,0.96)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)", backdropFilter: "blur(20px) saturate(180%)",
    borderRadius: 16, boxShadow: "0 16px 40px -16px rgba(25,24,19,0.4), inset 0 0 0 0.5px var(--mb-line-2)",
    padding: 6, zIndex: 30, display: "flex", flexDirection: "column", gap: 2,
  },
  mentionMenuHead: { fontSize: 9.5, letterSpacing: "0.08em", fontWeight: 700, color: "var(--mb-ink-3)", padding: "4px 8px 2px" },
  mentionItem: {
    border: "none", background: "transparent", cursor: "pointer",
    display: "flex", alignItems: "center", gap: 9, padding: "8px 9px", borderRadius: 11, width: "100%",
  },
  mentionAvatar: {
    width: 26, height: 26, borderRadius: 999, flexShrink: 0, display: "grid", placeItems: "center",
    background: "var(--mb-card-2)", color: "var(--mb-ink-2)", fontSize: 12, fontWeight: 800,
  },
  mentionName: {
    flex: 1, minWidth: 0, fontSize: 14, fontWeight: 700, color: "var(--mb-ink)", textAlign: "left",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  mentionToken: { color: "var(--mb-accent-ink)", fontWeight: 700 },
  mentionTokenMine: { color: "#fff", fontWeight: 800, textDecoration: "underline" },

  readOnlyNote: {
    marginTop: 6, padding: "14px 16px", borderRadius: 16,
    background: "var(--mb-card-2)", fontSize: 13.5, lineHeight: 1.45, color: "var(--mb-ink-3)", textWrap: "pretty",
  },

  // sample-mode banner (demo deal team only — honest "this is sample data")
  sampleBanner: {
    margin: "0 22px 14px", padding: "11px 14px", borderRadius: 14,
    background: "var(--mb-card-2)", boxShadow: "inset 0 0 0 0.5px var(--mb-line-2)",
    display: "flex", flexDirection: "column", gap: 4,
  },
  sampleBannerKicker: { fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--mb-ink-3)" },
  sampleBannerText: { fontSize: 12.5, lineHeight: 1.4, color: "var(--mb-ink-2)", textWrap: "pretty" },
};
