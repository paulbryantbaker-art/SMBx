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
import { authHeaders } from "../../../../hooks/useAuth";
import { T } from "../../desktop/atlasTokens";
import { Card, Avatar, Pill, ProgressBar, LoadingState } from "../../desktop/primitives";
import { PlusIcon } from "../../desktop/icons";

/* ─── locked pricing (SMBX_PRICING_LOCKED.md) ─────────────────────────────── */
const PLAN_LABEL: Record<string, string> = {
  free: "Free",
  solo: "Solo",
  pro: "Pro",
  team: "Team",
  enterprise: "Enterprise",
  // legacy rows normalize to the nearest locked tier display
  starter: "Solo",
  professional: "Pro",
};
const PLAN_PRICE: Record<string, string> = {
  free: "Free",
  solo: "$99 / month",
  pro: "$249 / month",
  team: "$749 / month",
  enterprise: "$3,000+ / month",
  starter: "$99 / month",
  professional: "$249 / month",
};

/* ─── server payload shapes (real fields, coerced) ─────────────────────────── */
interface SubscriptionRow {
  status?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean | null;
  trial_end?: string | null;
  stripe_customer_id?: string | null;
}
interface SubscriptionPayload {
  plan?: string | null;
  name?: string | null;
  priceDisplay?: string | null;
  note?: string | null;
  subscription?: SubscriptionRow | null;
}
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
                fontFamily: T.font,
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                padding: "8px 14px",
                borderRadius: T.rPill,
                border: `1px solid ${active ? "transparent" : T.border}`,
                background: active ? T.navActive : T.white,
                color: active ? T.blue : T.label,
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
    <div style={{ fontSize: 11.5, fontWeight: 600, color: T.muted2, letterSpacing: ".03em" }}>
      {children}
    </div>
  );
}

function HonestNote({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ fontSize: 12, color: T.muted2, lineHeight: 1.55, ...style }}>{children}</div>
  );
}

function ErrorNote({ label }: { label: string }) {
  return (
    <Card style={{ padding: 18, borderRadius: T.rCardLg }}>
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
    { key: "Plan", value: PLAN_LABEL[(user.plan || "free").toLowerCase()] ?? titleCase(user.plan) },
  ];

  return (
    <Card pad={20} style={{ borderRadius: T.rCardLg }}>
      {/* identity row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          borderBottom: `1px solid ${T.railDiv}`,
          paddingBottom: 18,
        }}
      >
        <Avatar initials={userInitials(user)} size={56} gradient />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.display_name || user.email}
          </div>
          <div style={{ fontSize: 13, color: T.muted2, marginTop: 2 }}>
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
              borderBottom: `1px solid ${T.rowDiv2}`,
            }}
          >
            <div style={{ width: 96, fontSize: 12.5, color: T.muted2, fontWeight: 500, flex: "none" }}>
              {f.key}
            </div>
            <div style={{ fontSize: 14, color: T.ink, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>
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
  const sub = useEndpoint<SubscriptionPayload>("/api/stripe/subscription", true);
  const ent = useEndpoint<EntitlementsPayload>("/api/v19/entitlements", true);
  const chat = useAtlasChat();
  const [portalBusy, setPortalBusy] = useState(false);
  const [portalError, setPortalError] = useState(false);

  const openPortal = useCallback(async () => {
    setPortalError(false);
    setPortalBusy(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
      });
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as { url?: string };
      if (json.url) {
        window.location.href = json.url;
        return;
      }
      throw new Error("no url");
    } catch {
      setPortalError(true);
      setPortalBusy(false);
    }
  }, []);

  if (sub.loading) return <LoadingState label="Loading your plan…" />;
  if (sub.error || !sub.data) {
    return <ErrorNote label="Couldn't load your billing details right now. Please try again in a moment." />;
  }

  const planKey = (sub.data.plan || "free").toLowerCase();
  const planName = PLAN_LABEL[planKey] ?? titleCase(sub.data.name);
  // Known plans use our own spaced label; an unknown planKey falls back to the
  // server priceDisplay ("$99/month"), normalized to the screen's "$99 / month".
  const priceLine = PLAN_PRICE[planKey] ?? normalizePrice(sub.data.priceDisplay) ?? "—";
  const row = sub.data.subscription || null;
  const renewLabel = formatRenew(row);
  const isFree = planKey === "free";

  const changePlan = () => {
    // Plan changes route through chat (THE LINE: Yulia guides the upgrade; the
    // user decides). There is no self-serve pricing surface — chat is the door.
    chat?.send("I'd like to change my plan. What are my options?");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* plan card */}
      <Card pad={20} style={{ borderRadius: T.rCardLg, display: "flex", flexDirection: "column" }}>
        <Eyebrow>PLAN</Eyebrow>
        <div style={{ fontSize: 24, fontWeight: 600, color: T.ink, marginTop: 4 }}>{planName}</div>
        <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>
          {priceLine}
          {renewLabel ? ` · ${renewLabel}` : ""}
        </div>
        <button
          type="button"
          onClick={isFree ? changePlan : openPortal}
          disabled={portalBusy}
          style={{
            marginTop: 16,
            alignSelf: "flex-start",
            background: T.blueBg,
            color: T.blue,
            border: "none",
            borderRadius: T.rPill,
            padding: "10px 18px",
            fontSize: 13.5,
            fontWeight: 600,
            cursor: portalBusy ? "default" : "pointer",
            opacity: portalBusy ? 0.65 : 1,
            fontFamily: T.font,
          }}
        >
          {isFree ? "Change plan" : portalBusy ? "Opening…" : "Manage subscription"}
        </button>
        {portalError && (
          <HonestNote style={{ marginTop: 10, color: T.terra }}>
            Couldn't open the billing portal. Please try again.
          </HonestNote>
        )}
        {isFree && (
          <HonestNote style={{ marginTop: 10 }}>
            Talk to Yulia to upgrade — every plan change routes through chat.
          </HonestNote>
        )}
      </Card>

      {/* usage card */}
      <Card pad={20} style={{ borderRadius: T.rCardLg }}>
        <Eyebrow>USAGE THIS CYCLE</Eyebrow>
        <div style={{ marginTop: 12 }}>
          <UsageBody ent={ent} />
        </div>
      </Card>

      {/* status / receipts card — honest: no invoice ledger is exposed here */}
      <Card pad={20} style={{ borderRadius: T.rCardLg }}>
        <Eyebrow>BILLING</Eyebrow>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          <KeyVal k="Status" v={<StatusValue status={row?.status} />} />
          {renewLabel && <KeyVal k={renewRowKey(renewLabel)} v={stripLead(renewLabel)} />}
          {row?.cancel_at_period_end ? <KeyVal k="Renewal" v="Cancels at period end" /> : null}
        </div>
        <HonestNote style={{ marginTop: 14 }}>
          {isFree
            ? "You're on the Free plan — no payment method or invoices yet."
            : "Payment method, invoices, and receipts are managed in the secure Stripe billing portal — use Manage subscription above."}
        </HonestNote>
      </Card>
    </div>
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
        <span style={{ fontSize: 13, color: T.ink3 }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{valueText}</span>
      </div>
      <ProgressBar pct={pct} />
    </div>
  );
}

function fmtCount(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return Math.round(n).toLocaleString();
}

function KeyVal({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, fontSize: 13 }}>
      <span style={{ color: T.muted2, width: 86, flex: "none" }}>{k}</span>
      <span style={{ color: T.ink, fontWeight: 500 }}>{v}</span>
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
  const color = isActive ? T.ink : T.terra;
  return <span style={{ color, fontWeight: isActive ? 500 : 600 }}>{text}</span>;
}

function stripLead(s: string): string {
  return s.replace(/^(renews|trial ends|ends)\s+/i, "").trim();
}

/** Label the date row by what the date actually is, so a trial-end date isn't
 *  mislabeled "Next" (which reads as a renewal). */
function renewRowKey(renewLabel: string): string {
  const l = renewLabel.toLowerCase();
  if (l.startsWith("trial ends")) return "Trial ends";
  if (l.startsWith("ends")) return "Ends";
  return "Renews";
}

function formatRenew(row: SubscriptionRow | null): string | null {
  if (!row) return null;
  const trial = row.trial_end ? new Date(row.trial_end) : null;
  if (trial && trial.getTime() > Date.now()) {
    return `trial ends ${fmtDate(trial)}`;
  }
  const end = row.current_period_end ? new Date(row.current_period_end) : null;
  if (!end || Number.isNaN(end.getTime())) return null;
  if (row.cancel_at_period_end) return `ends ${fmtDate(end)}`;
  return `renews ${fmtDate(end)}`;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/** Normalize a server priceDisplay ("$99/month") to the screen's spaced
 *  "$99 / month" so an unknown-plan fallback reads consistently. */
function normalizePrice(s: string | null | undefined): string | null {
  if (!s) return null;
  const trimmed = s.trim();
  if (!trimmed) return null;
  return trimmed.replace(/\s*\/\s*/g, " / ");
}

/* ─── NOTIFICATIONS ─────────────────────────────────────────────────────────── */

const NOTIF_GROUPS: { title: string; items: { id: string; label: string; on: boolean }[] }[] = [
  {
    title: "Deals & pipeline",
    items: [
      { id: "stage", label: "Stage changes", on: true },
      { id: "duedates", label: "IOI / LOI due dates", on: true },
      { id: "stalled", label: "Stalled deals (>30 days)", on: true },
    ],
  },
  {
    title: "Yulia & agents",
    items: [
      { id: "runs", label: "Agent run completed", on: true },
      { id: "approval", label: "Needs your approval", on: true },
      { id: "matches", label: "New buy-box matches", on: false },
    ],
  },
  {
    title: "Collaboration",
    items: [
      { id: "mentions", label: "Mentions & comments", on: true },
      { id: "shares", label: "Document shares", on: false },
    ],
  },
  {
    title: "Digests",
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
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <HonestNote style={{ fontSize: 13.5 }}>
        Choose what Atlas and your agents notify you about.
      </HonestNote>

      {NOTIF_GROUPS.map((g) => (
        <Card key={g.title} pad="8px 18px" style={{ borderRadius: T.rCardLg }}>
          <div style={{ padding: "12px 0 6px" }}>
            <Eyebrow>{g.title.toUpperCase()}</Eyebrow>
          </div>
          {g.items.map((it, idx) => (
            <div
              key={it.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 0",
                borderTop: idx === 0 ? "none" : `1px solid ${T.rowDiv2}`,
              }}
            >
              <span style={{ fontSize: 14, color: T.ink }}>{it.label}</span>
              <Toggle
                on={!!state[it.id]}
                onChange={() => setState((s) => ({ ...s, [it.id]: !s[it.id] }))}
              />
            </div>
          ))}
        </Card>
      ))}

      <HonestNote>
        Notification preferences aren't saved yet — these toggles control this session only.
        Real delivery (the bell, email, weekly digest) is driven by your deal activity today.
      </HonestNote>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onChange}
      style={{
        width: 40,
        height: 23,
        flex: "none",
        borderRadius: T.rPill,
        border: "none",
        cursor: "pointer",
        padding: 0,
        position: "relative",
        background: on ? T.blue : T.inputBd,
        transition: "background .15s ease",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: on ? 19 : 2,
          width: 19,
          height: 19,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 2px rgba(60,64,67,.3)",
          transition: "left .15s ease",
        }}
      />
    </button>
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
        background: T.blue,
        color: "#fff",
        border: "none",
        borderRadius: T.rPill,
        padding: "11px 16px",
        fontSize: 13.5,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: T.font,
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
      <Card style={{ borderRadius: T.rCardLg, padding: 0, overflow: "hidden" }}>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", padding: "16px 18px", gap: 12 }}>
            <Avatar initials={userInitials(user)} size={40} gradient />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.display_name || user.email}
              </div>
              <div style={{ fontSize: 12.5, color: T.muted2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.email}
              </div>
            </div>
            <Pill bg={T.violetBg} fg={T.violet}>Owner</Pill>
          </div>
        ) : (
          <div style={{ padding: 18, fontSize: 13, color: T.muted2 }}>No signed-in account.</div>
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
    <Card style={{ borderRadius: T.rCardLg, padding: 26, textAlign: "center" }}>
      <div style={{ fontSize: 14, color: T.muted2, lineHeight: 1.6 }}>{text}</div>
    </Card>
  );
}
