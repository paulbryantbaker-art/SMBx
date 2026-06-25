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
import { useState, type CSSProperties, type ReactNode } from "react";
import type { AtlasScreenProps } from "../../desktop/atlasNav";
import { useAtlasNav } from "../../desktop/atlasNav";
import type { User } from "../../../../hooks/useAuth";
import { useNotifications } from "../../../../hooks/useNotifications";
import { Avatar } from "../../desktop/primitives";
import { ChevronRightIcon } from "../../desktop/icons";
import { T } from "../../desktop/atlasTokens";
import { RT } from "../redesign/rt";
import { DetailSection, Divider, ActionRow } from "../redesign/kit";
import { ActionSheet } from "../iosKit";
import { useMobileShell } from "../mobileShell";

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
  const shell = useMobileShell();
  // Real unread count for the Notifications row badge (polled; honest 0 when
  // there's nothing). Disabled for anonymous so we never hit /api unauthenticated.
  const { unreadCount } = useNotifications(!!user);
  const [signOutOpen, setSignOutOpen] = useState(false);

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
        <ChevronRightIcon size={18} c={RT.muted} />
      </button>

      <DetailSection title="Modules" desc="Build collateral, connect your tools, and run agents.">
        <ActionRow leading={<StudioGlyph />} title="Studio" action={<Chevron />} onClick={() => nav.go("studio")} />
        <ActionRow leading={<IntegrationGlyph />} title="Integration" action={<Chevron />} onClick={() => nav.go("integration")} />
        <ActionRow leading={<AgentGlyph />} title="Agent" action={<Chevron />} onClick={() => nav.go("agent")} />
      </DetailSection>

      <Divider />

      <DetailSection title="Account" desc="Your profile, team, and notifications.">
        <ActionRow leading={<SettingsGlyphIcon />} title="Settings" action={<Chevron />} onClick={() => nav.openSettings()} />
        <ActionRow leading={<MembersGlyph />} title="Members & roles" action={<Chevron />} onClick={() => nav.openSettings("members")} />
        <ActionRow
          leading={<BellGlyph />}
          title="Notifications"
          action={
            user && unreadCount > 0 ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CountBadge n={unreadCount} />
                <Chevron />
              </span>
            ) : (
              <Chevron />
            )
          }
          onClick={() => nav.openSettings("notifications")}
        />
      </DetailSection>

      <Divider />

      <button type="button" onClick={() => setSignOutOpen(true)} style={S.signOut}>
        Sign out
      </button>

      <ActionSheet
        open={signOutOpen}
        onClose={() => setSignOutOpen(false)}
        title="Sign out?"
        message="You'll need to sign back in to reach your deals."
        actions={[{ label: "Sign out", destructive: true, onClick: () => shell?.signOut() }]}
      />
    </div>
  );
}

/* ─── notification count badge (red, iOS-style) ─────────────────────────── */

function CountBadge({ n }: { n: number }) {
  return <span style={S.badge}>{n > 99 ? "99+" : n}</span>;
}

/** The right-side chevron on a detail row (faint, Cash App style). */
function Chevron() {
  return <ChevronRightIcon size={18} c={RT.faint} />;
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
    RT.muted,
  );
}

/** Integration — timeline / clock (PMI cadence). */
function IntegrationGlyph() {
  return glyphSvg(
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </>,
    RT.muted,
  );
}

/** Agent — diamond (autonomous scope), violet to match the desktop accent. */
function AgentGlyph() {
  return glyphSvg(
    <path d="M12 3l8 9-8 9-8-9z" />,
    RT.accentInk,
  );
}

/** Settings — gear, neutral. */
function SettingsGlyphIcon() {
  return glyphSvg(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </>,
    RT.muted,
  );
}

/** Members & roles — two people. */
function MembersGlyph() {
  return glyphSvg(
    <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 21a7 7 0 0 1 14 0M17 11a3 3 0 0 0 0-6" />,
    RT.muted,
  );
}

/** Notifications — bell. */
function BellGlyph() {
  return glyphSvg(
    <>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </>,
    RT.muted,
  );
}

/* ─── styles ─────────────────────────────────────────────────────────────── */

const S: Record<string, CSSProperties> = {
  body: {
    padding: "4px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  profileCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    background: RT.card,
    borderRadius: T.rCardLg,
    padding: 14,
    marginBottom: 14,
    cursor: "pointer",
    fontFamily: RT.font,
  },
  profileName: {
    fontSize: 18.5,
    fontWeight: 600,
    color: RT.ink,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    lineHeight: 1.3,
  },
  profileSub: {
    fontSize: 15.5,
    color: RT.muted,
    marginTop: 2,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    lineHeight: 1.45,
  },
  badge: {
    flex: "none",
    minWidth: 20,
    height: 20,
    padding: "0 7px",
    borderRadius: 999,
    background: "#FF3B30", // iOS notification red
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  signOut: {
    marginTop: 24,
    width: "100%",
    background: "transparent",
    border: "none",
    padding: "12px 0",
    textAlign: "left",
    fontSize: 17,
    fontWeight: 600,
    color: "#C0562F", // warm red (marketing --neg) — destructive
    cursor: "pointer",
    fontFamily: RT.font,
    WebkitTapHighlightColor: "transparent",
  },
};
