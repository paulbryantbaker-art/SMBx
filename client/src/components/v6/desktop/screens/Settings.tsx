/**
 * Atlas SETTINGS screen — full width, no Yulia rail.
 * Own 236px left nav + 660px content column (design map 01 §6).
 *
 * HONESTY POSTURE (per ATLAS_BUILD_CONTRACT §3 + the prototype's own gap flags):
 *  - Profile  : real useAuth().user (display_name/email/role/league/plan), read-only.
 *  - Billing  : GET /api/stripe/subscription (real plan + renew) + usage rows from
 *               GET /api/v19/entitlements; "Manage" → POST /api/stripe/portal → redirect.
 *               LOCKED pricing only (Free/$99/$249/$749/$3,000+). The prototype's
 *               $1,200 "Professional" + fake invoices are fiction — never ported.
 *  - Notifications : faithful toggle chrome, but there is NO notif-preferences
 *               backend, so toggles are local-only with an honest "not yet saved" note.
 *  - Members  : org-level member management is a GAP (only per-deal participants exist)
 *               → show the signed-in user as Owner + an honest "coming soon" note.
 *               Never fabricate Dana/Mia/J.Park.
 *  - Connections / Security : faithful single-card honest stubs (matches prototype).
 *
 * The only new data path is two in-file hooks over endpoints that have no client hook
 * (Stripe subscription + V19 entitlements). No parallel/duplicate data path.
 */
import { useState, useEffect, useCallback } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { AtlasScreenProps } from "../atlasNav";
import { useAtlasNav } from "../atlasNav";
import type { SettingsPane } from "../atlasNav";
import type { User } from "../../../../hooks/useAuth";
import { authHeaders } from "../../../../hooks/useAuth";
import { T } from "../atlasTokens";
import { Card, Avatar, Pill, ProgressBar, LoadingState } from "../primitives";
import { SettingsGlyph } from "../icons";

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

function useEndpoint<T>(url: string, enabled: boolean): Fetched<T> {
  const [state, setState] = useState<Fetched<T>>({ data: null, loading: enabled, error: false });
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
      .then((json) => { if (alive) setState({ data: json as T, loading: false, error: false }); })
      .catch(() => { if (alive) setState({ data: null, loading: false, error: true }); });
    return () => { alive = false; };
  }, [url, enabled]);
  return state;
}

/* ─── nav items ────────────────────────────────────────────────────────────── */
const NAV: { pane: SettingsPane; label: string; glyph: string }[] = [
  { pane: "profile", label: "Profile", glyph: "profile" },
  { pane: "billing", label: "Account & billing", glyph: "billing" },
  { pane: "notifications", label: "Notifications", glyph: "notifications" },
  { pane: "members", label: "Members & roles", glyph: "members" },
  { pane: "connections", label: "Integrations", glyph: "connections" },
  { pane: "security", label: "Security", glyph: "security" },
];

const PANE_TITLE: Record<SettingsPane, string> = {
  profile: "Profile",
  billing: "Account & billing",
  notifications: "Notifications",
  members: "Members & roles",
  connections: "Integrations",
  security: "Security",
};

export default function SettingsScreen({ user, view }: AtlasScreenProps) {
  const nav = useAtlasNav();
  const pane: SettingsPane = view.settingsPane ?? "profile";

  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", background: T.surface, overflow: "hidden" }}>
      {/* left nav rail — 236px */}
      <nav
        style={{
          width: 236,
          flex: "none",
          borderRight: `1px solid ${T.hair}`,
          background: T.white,
          padding: "18px 13px",
          display: "flex",
          flexDirection: "column",
          gap: 3,
          overflow: "auto",
        }}
      >
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            color: T.muted2,
            letterSpacing: ".05em",
            padding: "0 13px 8px",
          }}
        >
          SETTINGS
        </div>
        {NAV.map((item) => {
          const active = item.pane === pane;
          return (
            <button
              key={item.pane}
              type="button"
              onClick={() => nav.openSettings(item.pane)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                fontSize: 14,
                padding: "10px 13px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: T.font,
                background: active ? T.navActive : "transparent",
                color: active ? T.blue : T.label,
                fontWeight: active ? 600 : 500,
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = T.tabHover; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <SettingsGlyph pane={item.glyph} size={19} c={active ? T.blue : T.label} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* content column — 660px centered */}
      <div style={{ flex: 1, minWidth: 0, overflow: "auto", padding: "30px 0" }}>
        <div style={{ width: 660, maxWidth: "90%", margin: "0 auto" }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: T.ink, margin: "0 0 18px" }}>
            {PANE_TITLE[pane]}
          </h1>
          {pane === "profile" && <ProfilePane user={user} />}
          {pane === "billing" && <BillingPane />}
          {pane === "notifications" && <NotificationsPane />}
          {pane === "members" && <MembersPane user={user} />}
          {pane === "connections" && <StubPane text="Connect Google Workspace, Slack, your CRM, and agent / MCP keys here. These integrations are configured by talking to Yulia today — a self-serve panel is coming." />}
          {pane === "security" && <StubPane text="Two-factor authentication, active sessions, and SSO configuration live here. SSO and API controls ship with the Enterprise plan; self-serve security settings are coming." />}
        </div>
      </div>
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
    <Card style={{ padding: 18 }}>
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

/* ─── 6a. PROFILE ──────────────────────────────────────────────────────────── */

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
    <Card pad={22} style={{ borderRadius: T.rCardLg }}>
      {/* identity row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          borderBottom: `1px solid ${T.railDiv}`,
          paddingBottom: 20,
        }}
      >
        <Avatar initials={userInitials(user)} size={62} gradient />
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
              alignItems: "center",
              padding: "11px 0",
              borderBottom: `1px solid ${T.rowDiv2}`,
            }}
          >
            <div style={{ width: 160, fontSize: 13, color: T.muted2, fontWeight: 500, flex: "none" }}>
              {f.key}
            </div>
            <div style={{ fontSize: 14, color: T.ink, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
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

/* ─── 6b. ACCOUNT & BILLING ────────────────────────────────────────────────── */

function BillingPane() {
  const sub = useEndpoint<SubscriptionPayload>("/api/stripe/subscription", true);
  const ent = useEndpoint<EntitlementsPayload>("/api/v19/entitlements", true);
  const nav = useAtlasNav();
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
  const priceLine = PLAN_PRICE[planKey] ?? sub.data.priceDisplay ?? "—";
  const row = sub.data.subscription || null;
  const renewLabel = formatRenew(row);
  const isFree = planKey === "free";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* plan + usage row */}
      <div style={{ display: "flex", gap: 14, alignItems: "stretch", flexWrap: "wrap" }}>
        {/* plan card */}
        <Card pad={20} style={{ flex: 1, minWidth: 240, borderRadius: T.rCardLg, display: "flex", flexDirection: "column" }}>
          <Eyebrow>PLAN</Eyebrow>
          <div style={{ fontSize: 24, fontWeight: 600, color: T.ink, marginTop: 4 }}>{planName}</div>
          <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>
            {priceLine}
            {renewLabel ? ` · ${renewLabel}` : ""}
          </div>
          <div style={{ flex: 1 }} />
          <button
            type="button"
            onClick={isFree ? () => nav.go("today") : openPortal}
            disabled={portalBusy}
            style={{
              marginTop: 16,
              alignSelf: "flex-start",
              background: T.blueBg,
              color: T.blue,
              border: "none",
              borderRadius: T.rPill,
              padding: "9px 16px",
              fontSize: 13,
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
        <Card pad={20} style={{ flex: 1.4, minWidth: 280, borderRadius: T.rCardLg }}>
          <Eyebrow>USAGE THIS CYCLE</Eyebrow>
          <div style={{ marginTop: 12 }}>
            <UsageBody ent={ent} />
          </div>
        </Card>
      </div>

      {/* status / receipts card — honest: no invoice ledger is exposed here */}
      <Card pad={20} style={{ borderRadius: T.rCardLg }}>
        <Eyebrow>BILLING</Eyebrow>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          <KeyVal k="Status" v={titleCase(row?.status) ?? "Active"} />
          {renewLabel && <KeyVal k="Next" v={stripLead(renewLabel)} />}
          {row?.cancel_at_period_end ? (
            <KeyVal k="Renewal" v="Cancels at period end" />
          ) : null}
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

function stripLead(s: string): string {
  return s.replace(/^(renews|trial ends|ends)\s+/i, "").trim();
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

/* ─── 6c. NOTIFICATIONS ────────────────────────────────────────────────────── */

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
      <HonestNote style={{ fontSize: 13.5, marginTop: -6 }}>
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

/* ─── 6d. MEMBERS & ROLES ──────────────────────────────────────────────────── */

function MembersPane({ user }: { user: User | null }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card style={{ borderRadius: T.rCardLg, padding: 0, overflow: "hidden" }}>
        {/* column header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 18px",
            borderBottom: `1px solid ${T.hair}`,
            fontSize: 11,
            fontWeight: 600,
            color: T.muted2,
            letterSpacing: ".04em",
          }}
        >
          <span style={{ flex: 2 }}>MEMBER</span>
          <span style={{ flex: 1 }}>ROLE</span>
          <span style={{ flex: 1 }}>ACCESS</span>
          <span style={{ width: 70, flex: "none", textAlign: "right" }}>STATUS</span>
        </div>

        {/* the only honest org member is the signed-in user */}
        {user ? (
          <div style={{ display: "flex", alignItems: "center", padding: "14px 18px", fontSize: 13.5 }}>
            <div style={{ flex: 2, display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
              <Avatar initials={userInitials(user)} size={32} gradient />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.display_name || user.email}
                </div>
                <div style={{ fontSize: 12, color: T.muted2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.email}
                </div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <Pill bg={T.violetBg} fg={T.violet}>Owner</Pill>
            </div>
            <div style={{ flex: 1, color: T.ink3 }}>All deals</div>
            <div style={{ width: 70, flex: "none", textAlign: "right", color: T.green, fontWeight: 600 }}>You</div>
          </div>
        ) : (
          <div style={{ padding: "18px", fontSize: 13, color: T.muted2 }}>No signed-in account.</div>
        )}
      </Card>

      <HonestNote>
        Org-wide member management is coming. Today, collaborators are added per deal —
        open a deal and use the deal team to invite teammates, counsel, or specialists.
        Those invitations grant access to that deal only, not the whole org.
      </HonestNote>
    </div>
  );
}

/* ─── 6e / 6f. STUB PANES (Connections + Security) ─────────────────────────── */

function StubPane({ text }: { text: string }) {
  return (
    <Card style={{ borderRadius: T.rCardLg, padding: 30, textAlign: "center" }}>
      <div style={{ fontSize: 14, color: T.muted2, lineHeight: 1.6 }}>{text}</div>
    </Card>
  );
}
