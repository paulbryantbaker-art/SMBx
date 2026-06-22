/**
 * More (frame 07) — the mobile "More" tab. Account header + secondary module
 * list + account settings. Body content only: the shell renders the "More"
 * title header, the scroll area, and the bottom nav (More active).
 *
 * Wiring (mirrors the desktop Settings profile + AtlasHeader module nav, same
 * data layer — no new fetch path):
 *   - Profile card  → real `user` (display_name/email/role/plan), gradient avatar
 *                     → ChevronRight opens Settings (profile pane).
 *   - MODULES card  → Studio/Integration/Agent rows → nav.go(screen). (Sourcing
 *                     is a bottom-bar tab now, so it's dropped from here.)
 *   - ACCOUNT card  → Settings → openSettings(); Members & roles →
 *                     openSettings('members'); Notifications → openSettings(
 *                     'notifications') with the REAL unread badge from
 *                     useNotifications (honest — no fabricated count).
 *
 * Honesty: the prototype's "Paul Mercer · Managing Director · Atlas M&A" and the
 * Agent "3 on" pill are placeholders — NOT ported. The profile subtitle is the
 * real role + plan; the Agent row carries no fabricated live-count pill.
 */
import type { CSSProperties, ReactNode } from "react";
import type { AtlasScreenProps } from "../../desktop/atlasNav";
import { useAtlasNav } from "../../desktop/atlasNav";
import type { User } from "../../../../hooks/useAuth";
import { useNotifications } from "../../../../hooks/useNotifications";
import { Avatar, SectionLabel } from "../../desktop/primitives";
import { ChevronRightIcon } from "../../desktop/icons";
import { T } from "../../desktop/atlasTokens";

/* ─── locked plan labels (mirror desktop Settings PLAN_LABEL) ─────────────── */
const PLAN_LABEL: Record<string, string> = {
  free: "Free",
  solo: "Solo",
  pro: "Pro",
  team: "Team",
  enterprise: "Enterprise",
  // legacy aliases → locked names
  starter: "Solo",
  professional: "Pro",
};

function titleCase(s: string | null | undefined): string {
  if (!s) return "";
  return s.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function userInitials(u: User | null): string {
  const n = (u?.display_name || u?.email || "").trim();
  if (!n) return "?";
  const parts = n.split(/[\s@.]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return n.slice(0, 2).toUpperCase();
}

/** Real, honest profile subtitle: role + plan (no fabricated firm/title). */
function profileSubtitle(u: User | null): string {
  if (!u) return "";
  const role = titleCase(u.role);
  const plan = PLAN_LABEL[(u.plan || "free").toLowerCase()] ?? titleCase(u.plan);
  return [role, plan ? `${plan} plan` : ""].filter(Boolean).join(" · ");
}

export default function MoreScreen({ user }: AtlasScreenProps) {
  const nav = useAtlasNav();
  // Real unread count for the Notifications row badge (polled; honest 0 when
  // there's nothing). Disabled for anonymous so we never hit /api unauthenticated.
  const { unreadCount } = useNotifications(!!user);

  const name = user?.display_name?.trim() || user?.email || "Your account";
  const subtitle = profileSubtitle(user);

  return (
    <div style={S.body}>
      {/* ── Profile card ───────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => nav.openSettings("profile")}
        style={S.profileCard}
      >
        <Avatar initials={userInitials(user)} size={42} gradient />
        <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
          <div style={S.profileName}>{name}</div>
          {subtitle && <div style={S.profileSub}>{subtitle}</div>}
        </div>
        <ChevronRightIcon size={18} c={T.muted2} />
      </button>

      {/* ── MODULES ─────────────────────────────────────────────── */}
      <SectionLabel>Modules</SectionLabel>
      <div style={S.group}>
        <Row glyph={<StudioGlyph />} label="Studio" first onClick={() => nav.go("studio")} />
        <Row
          glyph={<IntegrationGlyph />}
          label="Integration"
          onClick={() => nav.go("integration")}
        />
        <Row glyph={<AgentGlyph />} label="Agent" last onClick={() => nav.go("agent")} />
      </div>

      {/* ── ACCOUNT ─────────────────────────────────────────────── */}
      <SectionLabel>Account</SectionLabel>
      <div style={S.group}>
        <Row
          glyph={<SettingsGlyphIcon />}
          label="Settings"
          first
          onClick={() => nav.openSettings()}
        />
        <Row
          glyph={<MembersGlyph />}
          label="Members & roles"
          onClick={() => nav.openSettings("members")}
        />
        <Row
          glyph={<BellGlyph />}
          label="Notifications"
          last
          badge={user && unreadCount > 0 ? unreadCount : undefined}
          onClick={() => nav.openSettings("notifications")}
        />
      </div>
    </div>
  );
}

/* ─── grouped-list row ───────────────────────────────────────────────────── */

function Row({
  glyph,
  label,
  onClick,
  first = false,
  last = false,
  badge,
}: {
  glyph: ReactNode;
  label: string;
  onClick: () => void;
  first?: boolean;
  last?: boolean;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...S.row,
        borderTop: first ? "none" : `1px solid ${T.rowDiv}`,
        borderTopLeftRadius: first ? T.rCardLg : 0,
        borderTopRightRadius: first ? T.rCardLg : 0,
        borderBottomLeftRadius: last ? T.rCardLg : 0,
        borderBottomRightRadius: last ? T.rCardLg : 0,
      }}
      onMouseDown={(e) => (e.currentTarget.style.background = T.hover)}
      onMouseUp={(e) => (e.currentTarget.style.background = T.white)}
      onMouseLeave={(e) => (e.currentTarget.style.background = T.white)}
    >
      <span style={S.glyphWrap}>{glyph}</span>
      <span style={S.rowLabel}>{label}</span>
      {badge != null && (
        <span style={S.badge}>{badge > 99 ? "99+" : badge}</span>
      )}
      <ChevronRightIcon size={18} c={T.muted2} />
    </button>
  );
}

/* ─── module / account glyphs — stroked Atlas line icons (stroke-2 round),
 *     not the prototype's unicode placeholders (◎ ▤ ◷ ◆ ⚙ 👥 🔔). ─────────── */

function glyphSvg(children: ReactNode, stroke: string, fill = false) {
  return (
    <svg
      width={19}
      height={19}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      stroke={fill ? "none" : stroke}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

/** Studio — collateral / document grid. */
function StudioGlyph() {
  return glyphSvg(
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </>,
    T.blue,
  );
}

/** Integration — timeline / clock (PMI cadence). */
function IntegrationGlyph() {
  return glyphSvg(
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </>,
    T.blue,
  );
}

/** Agent — diamond (autonomous scope), violet to match the desktop accent. */
function AgentGlyph() {
  return glyphSvg(
    <path d="M12 3l8 9-8 9-8-9z" />,
    T.violet,
  );
}

/** Settings — gear, neutral. */
function SettingsGlyphIcon() {
  return glyphSvg(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </>,
    T.muted,
  );
}

/** Members & roles — two people. */
function MembersGlyph() {
  return glyphSvg(
    <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 21a7 7 0 0 1 14 0M17 11a3 3 0 0 0 0-6" />,
    T.muted,
  );
}

/** Notifications — bell. */
function BellGlyph() {
  return glyphSvg(
    <>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </>,
    T.muted,
  );
}

/* ─── styles ─────────────────────────────────────────────────────────────── */

const S: Record<string, CSSProperties> = {
  body: {
    padding: "4px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 9,
  },
  profileCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    background: T.white,
    border: `1px solid ${T.border}`,
    borderRadius: T.rCardLg,
    boxShadow: T.shCard,
    padding: 14,
    marginBottom: 9,
    cursor: "pointer",
    fontFamily: T.font,
  },
  profileName: {
    fontSize: 15.5,
    fontWeight: 600,
    color: T.ink,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    lineHeight: 1.3,
  },
  profileSub: {
    fontSize: 14,
    color: T.muted,
    marginTop: 2,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    lineHeight: 1.45,
  },
  group: {
    background: T.white,
    border: `1px solid ${T.border}`,
    borderRadius: T.rCardLg,
    boxShadow: T.shCard,
    overflow: "hidden",
    marginTop: 7,
    marginBottom: 11,
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    background: T.white,
    border: "none",
    padding: 14,
    cursor: "pointer",
    fontFamily: T.font,
    textAlign: "left",
    transition: "background .12s ease",
  },
  glyphWrap: {
    width: 20,
    flex: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { flex: 1, minWidth: 0, fontSize: 15.5, color: T.ink, fontWeight: 600 },
  badge: {
    flex: "none",
    minWidth: 18,
    height: 18,
    padding: "0 6px",
    borderRadius: 999,
    background: T.blue,
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
