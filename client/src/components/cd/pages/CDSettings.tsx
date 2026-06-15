/**
 * CDSettings — the Settings surface ported into the Claude Design (CD)
 * cool/indigo language. The V6 predecessor (V6SettingsView) wrapped the legacy
 * warm Settings page; here the same real data is rebuilt natively as CD cards:
 *
 *   - Profile        → the `user` record (name, email, plan, member-since)
 *   - Appearance     → workspace chrome theme picker (wkTheme / onSetWkTheme),
 *                      repaints shell tokens only — never brand accent or verdict
 *   - Plan & usage   → V19UsageMeter (GET /api/v19/entitlements) + the rolling
 *                      activity meter (GET /api/flywheel/usage?days=…)
 *   - Billing        → Stripe Customer Portal (POST /api/stripe/portal) — the
 *                      SAME wired action as V6App/V6Mobile; hidden under the
 *                      dev-bypass preview (no real token → would 401)
 *   - Sign out       → onSignOut
 *
 * Props match V6SettingsView exactly so this drops in as a 1:1 route swap.
 * Mounts under `.cd-root` (cdTokens.css). Only --cd-* tokens. THE LINE is not
 * engaged here — this is account chrome, no Yulia-authored read.
 */
import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useLocation } from "wouter";
import { authHeaders, DEV_AUTH_BYPASS, type User } from "../../../hooks/useAuth";
import { WK_THEMES, type WkTheme } from "../../../lib/wkTheme";
import { V19UsageMeter } from "../../v6/V19UsageMeter";
import { CDIcon, CDPill, CDCard, CDSectionTitle } from "../kit/cdUi";

interface SettingsProps {
  user: User | null;
  onSignOut: () => void;
  wkTheme?: WkTheme;
  onSetWkTheme?: (t: WkTheme) => void;
}

/* Same rolling-usage shapes the legacy Settings page binds (GET /api/flywheel/usage). */
interface UsageTotals {
  total_input_tokens: number;
  total_output_tokens: number;
  total_tool_calls: number;
  total_deliverables: number;
  total_queries: number;
}

const PLAN_LABEL: Record<string, string> = {
  free: "Free",
  solo: "Solo",
  pro: "Pro",
  team: "Team",
  enterprise: "Enterprise",
};

export function CDSettings({ user, onSignOut, wkTheme = "paper", onSetWkTheme }: SettingsProps) {
  const [, navigate] = useLocation();

  /* ─── signed-out gate ─────────────────────────────────────────────── */
  if (!user) {
    return (
      <div className="cd-root cd-scrollable" style={ROOT}>
        <Header title="Settings" sub="Profile, usage, billing, and preferences are tied to your account." />
        <AppearanceCard wkTheme={wkTheme} onSetWkTheme={onSetWkTheme} />
        <CDCard>
          <CDSectionTitle>Sign in to manage settings</CDSectionTitle>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--cd-ink-2)", lineHeight: 1.5 }}>
            Your plan, usage meter, and billing portal need an account.
          </p>
          <div style={{ display: "flex", gap: 9 }}>
            <PrimaryBtn onClick={() => navigate("/login")}>Sign in</PrimaryBtn>
            <GhostBtn onClick={() => navigate("/signup")}>Create account</GhostBtn>
          </div>
        </CDCard>
      </div>
    );
  }

  return <SettingsBody user={user} onSignOut={onSignOut} wkTheme={wkTheme} onSetWkTheme={onSetWkTheme} navigate={navigate} />;
}

/* ─── signed-in body (hooks live here so the gate above can early-return) ─── */
function SettingsBody({
  user, onSignOut, wkTheme, onSetWkTheme, navigate,
}: {
  user: User;
  onSignOut: () => void;
  wkTheme: WkTheme;
  onSetWkTheme?: (t: WkTheme) => void;
  navigate: (to: string) => void;
}) {
  void navigate;
  const plan = PLAN_LABEL[(user.plan || "free").toLowerCase()] || "Free";
  const memberSince = useMemo(() => {
    const d = new Date(user.created_at || Date.now());
    return isFinite(d.getTime()) ? d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) : "—";
  }, [user.created_at]);
  const initials = (user.display_name || user.email || "SX").replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase() || "SX";

  /* rolling activity totals — same endpoint + selector as legacy Settings */
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [totals, setTotals] = useState<UsageTotals | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);
  const loadUsage = useCallback(async () => {
    setUsageLoading(true);
    try {
      const res = await fetch(`/api/flywheel/usage?days=${days}`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setTotals(data.totals || null);
      }
    } catch { /* honest empty */ }
    finally { setUsageLoading(false); }
  }, [days]);
  useEffect(() => { loadUsage(); }, [loadUsage]);

  /* Stripe Customer Portal — same action V6App.handleManageBilling wires.
     Hidden under dev-bypass (mock user, no real token → would 401). */
  const canBill = !DEV_AUTH_BYPASS;
  const [billingBusy, setBillingBusy] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);
  const manageBilling = useCallback(async () => {
    if (billingBusy) return;
    setBillingBusy(true);
    setBillingError(null);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
      });
      if (res.ok) {
        const { url } = await res.json();
        if (url) { window.location.assign(url); return; }
      }
      setBillingError("Couldn’t open the billing portal. Try again.");
    } catch {
      setBillingError("Couldn’t open the billing portal. Try again.");
    } finally {
      setBillingBusy(false);
    }
  }, [billingBusy]);

  const tokensUsed = totals ? (totals.total_input_tokens || 0) + (totals.total_output_tokens || 0) : 0;

  return (
    <div className="cd-root cd-scrollable" style={ROOT}>
      <Header title="Settings" sub="Your account, appearance, plan, and billing." />

      {/* ── Profile ── */}
      <CDCard>
        <CDSectionTitle>Profile</CDSectionTitle>
        <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 18 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--cd-accent)", color: "white", display: "grid", placeItems: "center", fontSize: 19, fontWeight: 700, flexShrink: 0, letterSpacing: "0.01em" }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--cd-ink)", letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.display_name || user.email.split("@")[0]}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--cd-ink-3)", marginTop: 2 }}>Member since {memberSince}</div>
          </div>
          <div style={{ marginLeft: "auto", flexShrink: 0 }}><CDPill tone="accent">{plan} plan</CDPill></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 11 }}>
          <Field label="Name" value={user.display_name || "—"} />
          <Field label="Email" value={user.email} mono />
        </div>
      </CDCard>

      {/* ── Appearance ── */}
      <AppearanceCard wkTheme={wkTheme} onSetWkTheme={onSetWkTheme} />

      {/* ── Plan & usage ── */}
      <CDCard>
        <CDSectionTitle
          action={
            <div style={{ display: "inline-flex", background: "var(--cd-surface-2)", border: "1px solid var(--cd-line)", borderRadius: 999, padding: 2, gap: 2 }}>
              {([7, 30, 90] as const).map(d => {
                const active = days === d;
                return (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setDays(d)}
                    style={{
                      all: "unset", cursor: "pointer", padding: "4px 11px", borderRadius: 999, fontSize: 11.5, fontWeight: 600,
                      fontFamily: "var(--cd-num)",
                      color: active ? "white" : "var(--cd-ink-3)",
                      background: active ? "var(--cd-accent)" : "transparent",
                    }}
                  >
                    {d}d
                  </button>
                );
              })}
            </div>
          }
        >
          Plan &amp; usage
        </CDSectionTitle>

        {/* rolling activity totals — real or honest skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 11, marginBottom: 18 }}>
          {usageLoading && !totals ? (
            [0, 1, 2, 3].map(i => (
              <div key={i} style={MINI}>
                <div className="cd-skel" style={{ height: 10, width: "60%", borderRadius: 4 }} />
                <div className="cd-skel" style={{ height: 20, width: "45%", borderRadius: 4, marginTop: 9 }} />
              </div>
            ))
          ) : (
            <>
              <MiniStat label="Tokens used" value={fmtNum(tokensUsed)} />
              <MiniStat label="Tool calls" value={fmtNum(totals?.total_tool_calls)} />
              <MiniStat label="Deliverables" value={String(totals?.total_deliverables ?? 0)} accent="var(--cd-accent)" />
              <MiniStat label="Intel queries" value={String(totals?.total_queries ?? 0)} />
            </>
          )}
        </div>
        <div style={{ fontSize: 11, color: "var(--cd-ink-4)", marginBottom: 18 }}>
          Activity over the last {days} days{!usageLoading && !totals ? " — no data for this period yet." : "."}
        </div>

        {/* the V19 plan meter — included monthly allowances (entitlements) */}
        <V19UsageMeter user={user} surface="settings" />
      </CDCard>

      {/* ── Billing ── */}
      <CDCard>
        <CDSectionTitle>Billing</CDSectionTitle>
        <div style={{ display: "flex", alignItems: "center", gap: 15, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--cd-ink)" }}>{plan} plan</div>
            <div style={{ fontSize: 12.5, color: "var(--cd-ink-3)", marginTop: 3, lineHeight: 1.5 }}>
              {canBill
                ? "Open the billing portal to change plan, update payment, or download invoices."
                : "Billing isn’t available in this preview — sign in to a real account to manage your plan."}
            </div>
          </div>
          {canBill && (
            <PrimaryBtn onClick={manageBilling} disabled={billingBusy}>
              <CDIcon name="link" size={14} color="white" />
              {billingBusy ? "Opening…" : "Manage billing"}
            </PrimaryBtn>
          )}
        </div>
        {billingError && (
          <div style={{ marginTop: 11, fontSize: 12, color: "var(--cd-neg)", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--cd-neg)", flexShrink: 0 }} />
            {billingError}
          </div>
        )}
      </CDCard>

      {/* ── Account / sign out ── */}
      <CDCard>
        <CDSectionTitle>Account</CDSectionTitle>
        <div style={{ display: "flex", alignItems: "center", gap: 15, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--cd-ink)" }}>Sign out</div>
            <div style={{ fontSize: 12.5, color: "var(--cd-ink-3)", marginTop: 3 }}>End your session on this device.</div>
          </div>
          <DangerBtn onClick={onSignOut}>Sign out</DangerBtn>
        </div>
      </CDCard>
    </div>
  );
}

/* ─── Appearance — workspace chrome theme picker ──────────────────────────
   Repaints shell tokens only (ground / nav / surfaces); brand accent and
   verdict semantics keep their colors in every theme. Rendered only when the
   shell hands down a setter (desktop). */
function AppearanceCard({ wkTheme = "paper", onSetWkTheme }: { wkTheme?: WkTheme; onSetWkTheme?: (t: WkTheme) => void }) {
  if (!onSetWkTheme) return null;
  return (
    <CDCard>
      <CDSectionTitle>Appearance</CDSectionTitle>
      <p style={{ margin: "0 0 16px", fontSize: 12.5, color: "var(--cd-ink-2)", lineHeight: 1.5, maxWidth: 560 }}>
        Workspace chrome — the ground, nav, and surfaces. Verdicts and actions keep their colors in every theme.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(168px, 1fr))", gap: 11 }}>
        {WK_THEMES.map(t => {
          const active = wkTheme === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSetWkTheme(t.id)}
              aria-pressed={active}
              style={{
                all: "unset", cursor: "pointer", boxSizing: "border-box", display: "flex", flexDirection: "column",
                gap: 6, padding: 11, borderRadius: "var(--cd-r-md)", background: "var(--cd-surface)", textAlign: "left",
                border: `1px solid ${active ? "var(--cd-accent)" : "var(--cd-line-2)"}`,
                boxShadow: active ? "0 0 0 1px var(--cd-accent)" : "var(--cd-shadow-sm)",
              }}
            >
              <span aria-hidden style={{ position: "relative", display: "block", width: "100%", height: 60, borderRadius: 9, overflow: "hidden", background: t.swatch.bg, border: `1px solid ${t.swatch.line}` }}>
                <span style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "30%", background: t.swatch.nav, borderRight: `1px solid ${t.swatch.line}` }} />
                <span style={{ position: "absolute", top: 11, right: 9, width: "48%", height: 28, borderRadius: 6, background: "#FFFFFF", border: `1px solid ${t.swatch.line}` }} />
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--cd-ink)" }}>
                {t.label}
                {active && <CDIcon name="check" size={13} color="var(--cd-accent)" sw={2.4} />}
              </span>
              <span style={{ fontSize: 11, color: "var(--cd-ink-3)", lineHeight: 1.35 }}>{t.sub}</span>
            </button>
          );
        })}
      </div>
    </CDCard>
  );
}

/* ─── small parts ─────────────────────────────────────────────────────────── */
function Header({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <h1 style={{ margin: 0, fontFamily: "var(--cd-serif)", fontWeight: 600, fontSize: 38, lineHeight: 1.03, letterSpacing: "-0.02em" }}>{title}</h1>
      <p style={{ margin: "9px 0 0", color: "var(--cd-ink-2)", fontSize: 14 }}>{sub}</p>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div className="cd-eyebrow" style={{ marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 13, color: "var(--cd-ink)", padding: "9px 12px", background: "var(--cd-surface-2)", border: "1px solid var(--cd-line)", borderRadius: "var(--cd-r-md)", fontFamily: mono ? "var(--cd-num)" : "var(--cd-sans)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {value}
      </div>
    </div>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={MINI}>
      <div className="cd-eyebrow">{label}</div>
      <div className="cd-num" style={{ fontSize: 21, fontWeight: 700, lineHeight: 1, marginTop: 8, color: accent || "var(--cd-ink)", letterSpacing: "-0.02em" }}>{value}</div>
    </div>
  );
}

function PrimaryBtn({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--cd-accent)", color: "white", border: "none", borderRadius: "var(--cd-r-md)", padding: "9px 15px", fontSize: 12.5, fontWeight: 600, cursor: disabled ? "default" : "pointer", fontFamily: "var(--cd-sans)", whiteSpace: "nowrap", boxShadow: "var(--cd-shadow-sm)", opacity: disabled ? 0.6 : 1 }}>{children}</button>
  );
}
function GhostBtn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--cd-surface)", color: "var(--cd-ink-2)", border: "1px solid var(--cd-line-2)", borderRadius: "var(--cd-r-md)", padding: "9px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--cd-sans)", whiteSpace: "nowrap" }}>{children}</button>
  );
}
function DangerBtn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--cd-neg-soft)", color: "var(--cd-neg)", border: "1px solid color-mix(in oklch, var(--cd-neg), transparent 78%)", borderRadius: "var(--cd-r-md)", padding: "9px 15px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--cd-sans)", whiteSpace: "nowrap" }}>{children}</button>
  );
}

function fmtNum(val: number | null | undefined): string {
  const n = val || 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

const ROOT: CSSProperties = {
  background: "var(--cd-canvas)",
  height: "100%",
  overflow: "auto",
  padding: "30px 34px 60px",
  display: "flex",
  flexDirection: "column",
  gap: "var(--cd-gap)",
};

const MINI: CSSProperties = {
  background: "var(--cd-surface-2)",
  border: "1px solid var(--cd-line)",
  borderRadius: "var(--cd-r-md)",
  padding: "13px 15px",
  minWidth: 0,
};
