/**
 * Atlas-MOBILE — SETTINGS screen.
 *
 * Mobile re-lay of the desktop sibling (desktop/screens/Settings.tsx). SAME data
 * layer + SAME honesty posture — re-laid from the desktop 236px-rail + 660px
 * content split into a single narrow column with a horizontal pane picker:
 *
 *   • Pane PICKER — an edge-bleed horizontal chip row (Profile / Account &
 *     billing / Notifications / Members / Integrations / Security). The active
 *     pane comes from `view.settingsPane` (defaults to "profile"); tapping a
 *     chip drives `nav.openSettings(pane)`. The shell renders the back-bar
 *     header + "Settings" title, so this body owns the picker + the pane only.
 *   • PROFILE  — real useAuth() user passed in via props (display_name / email /
 *     role / league / plan), read-only. Honest "manage your Google account"
 *     note; in-app editing is a GAP.
 *   • BILLING  — GET /api/stripe/subscription (real plan + renew) + usage rows
 *     from GET /api/v19/entitlements; "Manage" → POST /api/stripe/portal →
 *     redirect. LOCKED pricing only (Free / $99 / $249 / $749 / $3,000+). The
 *     prototype's $1,200 "Professional" + fake invoices are fiction — never
 *     ported. Free-tier "Change plan" routes through chat (THE LINE: Yulia
 *     guides; the user decides).
 *   • NOTIFICATIONS — faithful toggle chrome, but there is NO notif-preferences
 *     backend, so toggles are local-only with an honest "not saved" note.
 *   • MEMBERS  — org-level member management is a GAP (only per-deal participants
 *     exist) → show the signed-in user as Owner + an honest "coming soon" note +
 *     an invite affordance that routes to chat. Never fabricate teammates.
 *   • INTEGRATIONS / SECURITY — faithful single-card honest stubs.
 *
 * The only new data path is the in-file `useEndpoint` hook over two endpoints
 * that have no client hook (Stripe subscription + V19 entitlements) — copied
 * verbatim from the desktop sibling. No parallel/duplicate data path.
 *
 * Shell contract: this screen returns BODY ONLY. The shell renders the header
 * (variant B back-bar with the "Settings" title), the scroll area + bottom-nav
 * clearance, and the FAB. Horizontal padding 0 18px; edge-bleed rows use the
 * `margin:0 -18px; padding:0 18px; overflow-x:auto` + `.scr` pattern.
 *
 * Honesty (contract law #4): every value is a real hook field or an honest "—"
 * (fmtCents / "—"). Render loading / empty / error. NO demo literals.
 */
import { useState, useEffect, useCallback } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { AtlasScreenProps, SettingsPane } from "../../desktop/atlasNav";
import { useAtlasNav, useAtlasChat } from "../../desktop/atlasNav";
import type { User } from "../../../../hooks/useAuth";
import { usePracticeMode } from "../../../../lib/practiceMode";
import { authHeaders } from "../../../../hooks/useAuth";
import { Card, Avatar, Pill, ProgressBar, LoadingState } from "../../desktop/primitives";
import { PlusIcon } from "../../desktop/icons";
import { Switch } from "../iosKit";
import { RT } from "../redesign/rt";
import { DetailSection, ActionRow, Divider } from "../redesign/kit";

/* ─── server payload shapes (real fields, coerced) ─────────────────────────── */
interface UsageCounter {
  used: number;
  limit: number | null;
  remaining: number | null;
}
interface EntitlementsPayload {
  usage?: {
    plan?: string;
    periodEnd?: string;
    credits?: UsageCounter;
    events?: Record<string, UsageCounter>;
  };
}

/* ─── small in-file hook over an endpoint that has no client hook ──────────── */
type Fetched<T> = { data: T | null; loading: boolean; error: boolean };

function useEndpoint<TData>(url: string, enabled: boolean): Fetched<TData> {
  const [state, setState] = useState<Fetched<TData>>({ data: null, loading: enabled, error: false });
  useEffect(() => {
    if (!enabled) {
      setState({ data: null, loading: false, error: false });
      return;
    }
    let alive = true;
    setState({ data: null, loading: true, error: false });
    fetch(url, { headers: authHeaders() })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((json) => { if (alive) setState({ data: json as TData, loading: false, error: false }); })
      .catch(() => { if (alive) setState({ data: null, loading: false, error: true }); });
    return () => { alive = false; };
  }, [url, enabled]);
  return state;
}

/* ─── pane picker model ────────────────────────────────────────────────────── */
const PANES: { pane: SettingsPane; label: string }[] = [
  { pane: "profile", label: "Profile" },
  { pane: "billing", label: "Account & billing" },
  { pane: "notifications", label: "Notifications" },
  { pane: "members", label: "Members" },
  { pane: "connections", label: "Integrations" },
  { pane: "security", label: "Security" },
];

export default function SettingsMobileScreen({ user, view }: AtlasScreenProps) {
  const nav = useAtlasNav();
  const pane: SettingsPane = view.settingsPane ?? "profile";

  return (
    <div style={{ padding: "10px 18px 8px", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* edge-bleed pane picker */}
      <div
        className="scr"
        style={{
          margin: "0 -18px",
          padding: "0 18px",
          display: "flex",
          gap: 8,
          overflowX: "auto",
          flexWrap: "nowrap",
        }}
      >
        {PANES.map((p) => {
          const active = p.pane === pane;
          return (
            <button
              key={p.pane}
              type="button"
              onClick={() => nav.openSettings(p.pane)}
              style={{
                flex: "none",
                whiteSpace: "nowrap",
                fontFamily: RT.font,
                fontSize: 14,
                fontWeight: active ? 700 : 600,
                padding: "8px 14px",
                borderRadius: RT.rPill,
                border: "none",
                background: active ? RT.accentSoft : RT.card,
                color: active ? RT.accentInk : RT.ink2,
                cursor: "pointer",
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {pane === "profile" && <ProfilePane user={user} />}
      {pane === "billing" && <BillingPane />}
      {pane === "notifications" && <NotificationsPane />}
      {pane === "members" && <MembersPane user={user} />}
      {pane === "connections" && (
        <StubPane text="Connect Google Workspace, Slack, your CRM, and agent / MCP keys here. These integrations are configured by talking to Yulia today — a self-serve panel is coming." />
      )}
      {pane === "security" && (
        <StubPane text="Two-factor authentication, active sessions, and SSO configuration live here. SSO and API controls ship with the Enterprise plan; self-serve security settings are coming." />
      )}
    </div>
  );
}

/* ─── shared bits ──────────────────────────────────────────────────────────── */

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontSize: 19, fontWeight: 600, color: RT.ink, letterSpacing: "-0.01em" }}>
      {children}
    </div>
  );
}

function HonestNote({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ fontSize: 14, color: RT.muted, lineHeight: 1.55, ...style }}>{children}</div>
  );
}

function ErrorNote({ label }: { label: string }) {
  return (
    <Card style={{ padding: 18, borderRadius: RT.rCard, background: RT.card, border: "none", boxShadow: "none" }}>
      <HonestNote>{label}</HonestNote>
    </Card>
  );
}

function userInitials(u: User | null): string {
  const n = (u?.display_name || u?.email || "").trim();
  if (!n) return "?";
  const parts = n.split(/[\s@.]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return n.slice(0, 2).toUpperCase();
}

function titleCase(s: string | null | undefined): string {
  if (!s) return "—";
  return s.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ─── PROFILE ──────────────────────────────────────────────────────────────── */

function ProfilePane({ user }: { user: User | null }) {
  if (!user) return <ErrorNote label="No signed-in account to show." />;

  const fields: { key: string; value: string }[] = [
    { key: "Full name", value: user.display_name || "—" },
    { key: "Email", value: user.email || "—" },
    { key: "Role", value: titleCase(user.role) },
    { key: "League", value: user.league ? titleCase(user.league) : "—" },
    /* The Plan row is gone with the ladder. It read `planLabel(user.plan)` —
       Free / Solo / Pro / Team / Enterprise — which described which
       subscription a user had bought. There is one user set (the team
       allowlist), it runs at full entitlements, and nothing is bought. */
  ];

  return (
    <Card pad={20} style={{ borderRadius: RT.rCard, background: RT.card, border: "none", boxShadow: "none" }}>
      {/* identity row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          borderBottom: `1px solid ${RT.line}`,
          paddingBottom: 18,
        }}
      >
        <Avatar initials={userInitials(user)} size={56} gradient />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: RT.ink, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.3 }}>
            {user.display_name || user.email}
          </div>
          <div style={{ fontSize: 14, color: RT.muted, marginTop: 2 }}>
            {titleCase(user.role)}
            {user.league ? ` · ${titleCase(user.league)} league` : ""}
          </div>
        </div>
      </div>

      {/* read-only fields */}
      <div style={{ marginTop: 4 }}>
        {fields.map((f) => (
          <div
            key={f.key}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 12,
              padding: "11px 0",
              borderBottom: `1px solid ${RT.line}`,
            }}
          >
            <div style={{ width: 96, fontSize: 12.5, color: RT.muted, fontWeight: 500, flex: "none" }}>
              {f.key}
            </div>
            <div style={{ fontSize: 14, color: RT.ink, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>
              {f.value}
            </div>
          </div>
        ))}
      </div>

      <HonestNote style={{ marginTop: 16 }}>
        Profile details come from your account. To change your name, email, or sign-in,
        manage your Google account or ask Yulia — in-app editing is coming.
      </HonestNote>
    </Card>
  );
}

/* ─── ACCOUNT & BILLING ─────────────────────────────────────────────────────── */

function BillingPane() {
  /* NO BILLING, UNCONDITIONALLY (2026-08-15, Paul: "this is old from when I
     was going to sell the app - not relevant any more").

     This pane used to fetch GET /api/stripe/subscription, render the plan, the
     price line and the renewal date, and offer a "Manage" button that POSTed to
     /api/stripe/portal and redirected to Stripe's customer portal. It already
     short-circuited to the card below whenever practice mode was on — which is
     the default and, per THE LINE v2 rule 3, the permanent posture — so the
     Stripe half was unreachable. Both endpoints are now DELETED, so the old
     path would fetch a 404 and render the error state.

     The usage rows are unaffected: they come from GET /api/v19/entitlements,
     which is capability data, not billing.
  */
  return (
    <Card pad={20} style={{ borderRadius: T.rCardLg }}>
      <div style={{ fontSize: 24, fontWeight: 600, color: T.ink, marginTop: 4 }}>Practice workspace</div>
      <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>Full access · nothing billed in-app</div>
      <HonestNote style={{ marginTop: 16 }}>
        smbX runs as the practice's internal instrument (THE LINE v2). There is no
        subscription here — client compensation is papered in each engagement
        letter, never charged through the app.
      </HonestNote>
    </Card>
  );
}

function UsageBody({ ent }: { ent: Fetched<EntitlementsPayload> }) {
  if (ent.loading) return <HonestNote>Loading usage…</HonestNote>;
  if (ent.error || !ent.data?.usage) {
    return <HonestNote>Usage details aren't available right now. They'll appear once your plan meter loads.</HonestNote>;
  }
  const u = ent.data.usage;
  const rows: { label: string; counter?: UsageCounter }[] = [
    { label: "Credits", counter: u.credits },
    { label: "Model runs", counter: u.events?.model_run },
    { label: "Studio exports", counter: u.events?.studio_export },
    { label: "API calls", counter: u.events?.api_call },
  ];
  const shown = rows.filter((r) => r.counter);
  if (shown.length === 0) {
    return <HonestNote>No metered usage recorded this cycle yet.</HonestNote>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {shown.map((r) => (
        <UsageRow key={r.label} label={r.label} counter={r.counter!} />
      ))}
    </div>
  );
}

function UsageRow({ label, counter }: { label: string; counter: UsageCounter }) {
  const used = Number.isFinite(counter.used) ? counter.used : 0;
  const limit = counter.limit;
  const hasLimit = limit != null && Number.isFinite(limit) && limit > 0;
  const pct = hasLimit ? Math.min(100, (used / (limit as number)) * 100) : 0;
  const valueText = hasLimit
    ? `${fmtCount(used)} / ${fmtCount(limit as number)}`
    : `${fmtCount(used)}${limit == null ? " · unlimited" : ""}`;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 14, color: RT.ink2 }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: RT.ink }}>{valueText}</span>
      </div>
      <ProgressBar pct={pct} color={RT.accent} />
    </div>
  );
}

function fmtCount(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return Math.round(n).toLocaleString();
}

function KeyVal({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, fontSize: 14 }}>
      <span style={{ color: RT.muted, width: 86, flex: "none", fontSize: 13 }}>{k}</span>
      <span style={{ color: RT.ink, fontWeight: 500 }}>{v}</span>
    </div>
  );
}

/** Subscription status with a color cue for non-active states. A null/empty
 *  status row is treated as "Active" (titleCase never returns nullish, so the
 *  fallback has to be gated on the raw value, not its title-cased result). */
function StatusValue({ status }: { status?: string | null }) {
  const raw = (status || "").trim().toLowerCase();
  const text = status?.trim() ? titleCase(status) : "Active";
  const isActive = raw === "" || raw === "active" || raw === "trialing";
  const color = isActive ? RT.ink : RT.muted;
  return <span style={{ color, fontWeight: isActive ? 500 : 600 }}>{text}</span>;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

const NOTIF_GROUPS: { title: string; desc: string; items: { id: string; label: string; on: boolean }[] }[] = [
  {
    title: "Deals & pipeline",
    desc: "Stage moves, IOI / LOI due dates, and deals that have gone quiet.",
    items: [
      { id: "stage", label: "Stage changes", on: true },
      { id: "duedates", label: "IOI / LOI due dates", on: true },
      { id: "stalled", label: "Stalled deals (>30 days)", on: true },
    ],
  },
  {
    title: "Yulia & agents",
    desc: "Agent runs, approvals waiting on you, and new buy-box matches.",
    items: [
      { id: "runs", label: "Agent run completed", on: true },
      { id: "approval", label: "Needs your approval", on: true },
      { id: "matches", label: "New buy-box matches", on: false },
    ],
  },
  {
    title: "Collaboration",
    desc: "Mentions, comments, and document shares from your team.",
    items: [
      { id: "mentions", label: "Mentions & comments", on: true },
      { id: "shares", label: "Document shares", on: false },
    ],
  },
  {
    title: "Digests",
    desc: "Periodic roll-ups of your pipeline.",
    items: [{ id: "digest", label: "Weekly pipeline digest", on: true }],
  },
];

function NotificationsPane() {
  // Local-only — there is no notification-preferences backend, so these toggles
  // are not persisted. We say so plainly instead of pretending they save.
  const [state, setState] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const g of NOTIF_GROUPS) for (const it of g.items) init[it.id] = it.on;
    return init;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <HonestNote style={{ fontSize: 14 }}>
        Choose what Atlas and your agents notify you about.
      </HonestNote>

      {NOTIF_GROUPS.map((g, gi) => (
        <div key={g.title}>
          {gi > 0 && <Divider />}
          <DetailSection title={g.title} desc={g.desc}>
            {g.items.map((it) => (
              <ActionRow
                key={it.id}
                title={it.label}
                action={
                  <Switch
                    on={!!state[it.id]}
                    onChange={() => setState((s) => ({ ...s, [it.id]: !s[it.id] }))}
                  />
                }
              />
            ))}
          </DetailSection>
        </div>
      ))}

      <HonestNote style={{ marginTop: 22 }}>
        Notification preferences aren't saved yet — these toggles control this session only.
        Real delivery (the bell, email, weekly digest) is driven by your deal activity today.
      </HonestNote>
    </div>
  );
}

/* ─── MEMBERS & ROLES ───────────────────────────────────────────────────────── */

/** Org-wide invites are a GAP (only per-deal participants exist), so this routes
 *  the invite intent to Yulia rather than fabricating an org-roster write.
 *  Honest: chat is the only real door today. */
function InviteMemberButton() {
  const chat = useAtlasChat();
  return (
    <button
      type="button"
      onClick={() => chat?.send("I'd like to invite a teammate. How do I add someone to a deal?")}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        background: RT.accent,
        color: RT.onAccent,
        border: "none",
        borderRadius: RT.rPill,
        padding: "11px 16px",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: RT.font,
      }}
    >
      <PlusIcon size={16} c="#fff" />
      Invite member
    </button>
  );
}

function MembersPane({ user }: { user: User | null }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* the only honest org member is the signed-in user */}
      <Card style={{ borderRadius: RT.rCard, background: RT.card, border: "none", boxShadow: "none", padding: 0, overflow: "hidden" }}>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", padding: "16px 18px", gap: 12 }}>
            <Avatar initials={userInitials(user)} size={40} gradient />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 15.5, fontWeight: 600, color: RT.ink, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.3 }}>
                {user.display_name || user.email}
              </div>
              <div style={{ fontSize: 14, color: RT.muted, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.45 }}>
                {user.email}
              </div>
            </div>
            <Pill bg={RT.line} fg={RT.ink}>Owner</Pill>
          </div>
        ) : (
          <div style={{ padding: 18, fontSize: 14, color: RT.muted }}>No signed-in account.</div>
        )}
      </Card>

      <InviteMemberButton />

      <HonestNote>
        Org-wide member management is coming. Today, collaborators are added per deal —
        open a deal and use the deal team to invite teammates, counsel, or specialists.
        Those invitations grant access to that deal only, not the whole org.
      </HonestNote>
    </div>
  );
}

/* ─── STUB PANES (Integrations + Security) ──────────────────────────────────── */

function StubPane({ text }: { text: string }) {
  return (
    <Card style={{ borderRadius: RT.rCard, background: RT.card, border: "none", boxShadow: "none", padding: 26, textAlign: "center" }}>
      <div style={{ fontSize: 14, color: RT.muted, lineHeight: 1.6 }}>{text}</div>
    </Card>
  );
}
