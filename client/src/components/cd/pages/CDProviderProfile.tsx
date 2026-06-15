/**
 * CDProviderProfile — the self-serve service-provider listing, ported into the
 * Claude Design (CD) cool/indigo language. The V6 predecessor
 * (V6ProviderProfileView) wrapped the legacy warm "deals-list full view" form;
 * here the SAME real data is rebuilt natively as CD form cards.
 *
 * Real data wiring is preserved exactly via `useProviderProfile`:
 *   - GET /api/providers/me  → { provider, representsClients }
 *   - PUT /api/providers/me  ← the camelCase ProviderProfileInput body
 * deal_size_min/max are stored in CENTS — the form works in dollars and converts
 * on the boundary (dollarsToCents / centsToDollars), same as the V6 view.
 *
 * Props match the Canvas call `<V6ProviderProfileView user />` exactly so this
 * drops in as a 1:1 route swap. Mounts under `.cd-root` (cdTokens.css). Only
 * --cd-* tokens. THE LINE is NOT engaged here — this is account/directory
 * chrome, no Yulia-authored read, so no CDLineNote.
 */
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { type User } from "../../../hooks/useAuth";
import {
  FEE_STRUCTURES,
  FEE_STRUCTURE_LABELS,
  PROVIDER_TYPES,
  PROVIDER_TYPE_LABELS,
  centsToDollars,
  dollarsToCents,
  toInput,
  useProviderProfile,
  type ProviderProfileInput,
} from "../../v6/hooks/useProviderProfile";
import { CDIcon, CDCard, CDSectionTitle } from "../kit/cdUi";

interface Props {
  user: User | null;
}

/* ─── shared form atoms (CD-tokened) ──────────────────────────────────────── */
const inputBase: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  borderRadius: "var(--cd-r-md)",
  border: "1px solid var(--cd-line-2)",
  background: "var(--cd-surface)",
  color: "var(--cd-ink)",
  fontSize: 13,
  outline: "none",
  fontFamily: "var(--cd-sans)",
};

function fieldInput(invalid?: boolean): CSSProperties {
  return { ...inputBase, borderColor: invalid ? "var(--cd-neg)" : "var(--cd-line-2)" };
}

function Field({ label, required, children, span = 1 }: { label: string; required?: boolean; children: ReactNode; span?: number }) {
  return (
    <label style={{ display: "block", gridColumn: `span ${span}`, minWidth: 0 }}>
      <span className="cd-eyebrow" style={{ display: "block", marginBottom: 6 }}>
        {label}{required && <span style={{ color: "var(--cd-accent-strong)", marginLeft: 3 }}>*</span>}
      </span>
      {children}
    </label>
  );
}

/** Tag/chip input: type a value, Enter or comma to add, click × to remove. */
function ChipInput({
  values, onChange, placeholder,
}: { values: string[]; onChange: (next: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState("");
  const has = values.length > 0;

  const commit = () => {
    const v = draft.trim().replace(/,$/, "").trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  };

  return (
    <div
      style={{
        display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center",
        padding: has ? "7px 8px" : 0,
        border: has ? "1px solid var(--cd-line-2)" : "none",
        borderRadius: "var(--cd-r-md)", background: has ? "var(--cd-surface)" : "transparent",
      }}
    >
      {values.map(v => (
        <span
          key={v}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 6px 4px 11px", borderRadius: 999, fontSize: 12,
            fontWeight: 600, background: "var(--cd-surface-2)", color: "var(--cd-ink)",
            border: "1px solid var(--cd-line)",
          }}
        >
          {v}
          <button
            type="button"
            aria-label={`Remove ${v}`}
            onClick={() => onChange(values.filter(x => x !== v))}
            style={{
              all: "unset", cursor: "pointer", width: 16, height: 16, lineHeight: "16px",
              borderRadius: 999, textAlign: "center", color: "var(--cd-ink-3)", fontSize: 13,
            }}
          >×</button>
        </span>
      ))}
      <input
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); commit(); }
          else if (e.key === "Backspace" && !draft && values.length) onChange(values.slice(0, -1));
        }}
        onBlur={commit}
        placeholder={has ? "Add…" : placeholder}
        style={{ ...inputBase, flex: "1 1 140px", minWidth: 120, width: "auto", border: has ? "none" : "1px solid var(--cd-line-2)", padding: has ? "4px 6px" : "10px 12px", background: "transparent" }}
      />
    </div>
  );
}

/* ─── the page ────────────────────────────────────────────────────────────── */
export function CDProviderProfile({ user }: Props) {
  const { provider, representsClients, loading, loadError, saving, saveError, saved, save } = useProviderProfile();
  const fallbackEmail = user?.email ?? "";

  const [form, setForm] = useState<ProviderProfileInput>(() => toInput(null, fallbackEmail));
  const [dealMin, setDealMin] = useState("");
  const [dealMax, setDealMax] = useState("");
  const [radius, setRadius] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Hydrate the form once the GET resolves (provider may be null → blank create).
  useEffect(() => {
    if (loading || hydrated) return;
    const next = toInput(provider, fallbackEmail, representsClients);
    setForm(next);
    setDealMin(centsToDollars(next.dealSizeMin));
    setDealMax(centsToDollars(next.dealSizeMax));
    setRadius(next.serviceRadiusMiles != null ? String(next.serviceRadiusMiles) : "");
    setHydrated(true);
  }, [loading, hydrated, provider, fallbackEmail, representsClients]);

  const set = <K extends keyof ProviderProfileInput>(key: K, value: ProviderProfileInput[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const canSave = useMemo(() => !!form.type && !!form.name.trim(), [form.type, form.name]);

  const onSave = async () => {
    setAttemptedSubmit(true);
    if (!canSave) return;
    const radiusNum = radius.trim() ? Number(radius.trim()) : null;
    await save({
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      dealSizeMin: dollarsToCents(dealMin),
      dealSizeMax: dollarsToCents(dealMax),
      serviceRadiusMiles: radiusNum != null && Number.isFinite(radiusNum) ? radiusNum : null,
    });
  };

  return (
    <div
      className="cd-root cd-scrollable"
      style={{ background: "var(--cd-canvas)", height: "100%", overflow: "auto", padding: "30px 34px 60px", display: "flex", flexDirection: "column", gap: "var(--cd-gap)" }}
    >
      {/* header */}
      <div style={{ maxWidth: 920, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "var(--cd-gap)" }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "var(--cd-serif)", fontWeight: 600, fontSize: 38, lineHeight: 1.03, letterSpacing: "-0.02em" }}>
            Provider profile
          </h1>
          <p style={{ margin: "9px 0 0", color: "var(--cd-ink-2)", fontSize: 14, lineHeight: 1.5 }}>
            {loading
              ? "Loading your listing…"
              : provider
                ? "Your listing in the service-provider directory. Update it any time."
                : "List yourself in the service-provider directory so deal teams can find you."}
          </p>
        </div>

        {/* billing model note (free to participate) */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 9,
            padding: "11px 15px", borderRadius: "var(--cd-r-md)",
            background: "var(--cd-surface-2)", border: "1px solid var(--cd-line)",
            color: "var(--cd-ink-2)", fontSize: 13, lineHeight: 1.45,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--cd-pos)", flexShrink: 0 }} />
          Free — you can join any number of deals as a participant at no cost.
        </div>

        {loadError && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--cd-neg)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--cd-neg)", flexShrink: 0 }} />
            {loadError}
          </div>
        )}

        {/* Identity */}
        <CDCard>
          <CDSectionTitle>Identity</CDSectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Provider type" required>
              <select
                value={form.type}
                onChange={e => set("type", e.target.value as ProviderProfileInput["type"])}
                style={{ ...fieldInput(attemptedSubmit && !form.type), cursor: "pointer" }}
              >
                <option value="">Select a type…</option>
                {PROVIDER_TYPES.map(t => (
                  <option key={t} value={t}>{PROVIDER_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </Field>
            <Field label="Name" required>
              <input
                value={form.name}
                onChange={e => set("name", e.target.value)}
                placeholder="Your full name"
                style={fieldInput(attemptedSubmit && !form.name.trim())}
              />
            </Field>
            <Field label="Firm" span={2}>
              <input value={form.firmName} onChange={e => set("firmName", e.target.value)} placeholder="Firm or company name" style={inputBase} />
            </Field>
          </div>
        </CDCard>

        {/* Contact */}
        <CDCard>
          <CDSectionTitle>Contact</CDSectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Email">
              <input value={form.email} onChange={e => set("email", e.target.value)} placeholder={fallbackEmail || "you@firm.com"} type="email" style={inputBase} />
            </Field>
            <Field label="Phone">
              <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="(555) 555-5555" style={inputBase} />
            </Field>
            <Field label="Website" span={2}>
              <input value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://…" style={inputBase} />
            </Field>
          </div>
        </CDCard>

        {/* Location */}
        <CDCard>
          <CDSectionTitle>Location</CDSectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 16 }}>
            <Field label="City">
              <input value={form.locationCity} onChange={e => set("locationCity", e.target.value)} placeholder="City" style={inputBase} />
            </Field>
            <Field label="State">
              <input value={form.locationState} onChange={e => set("locationState", e.target.value)} placeholder="TX" style={inputBase} />
            </Field>
            <Field label="ZIP">
              <input value={form.locationZip} onChange={e => set("locationZip", e.target.value)} placeholder="00000" style={inputBase} />
            </Field>
            <Field label="Service radius (mi)">
              <input value={radius} onChange={e => setRadius(e.target.value)} placeholder="50" inputMode="numeric" style={inputBase} />
            </Field>
          </div>
        </CDCard>

        {/* Expertise */}
        <CDCard>
          <CDSectionTitle>Expertise</CDSectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Practice areas">
              <ChipInput values={form.practiceAreas} onChange={v => set("practiceAreas", v)} placeholder="e.g. M&A, tax, real estate" />
            </Field>
            <Field label="Credentials">
              <ChipInput values={form.credentials} onChange={v => set("credentials", v)} placeholder="e.g. JD, CPA, CFA" />
            </Field>
            <Field label="Industries">
              <ChipInput values={form.industries} onChange={v => set("industries", v)} placeholder="e.g. HVAC, SaaS, healthcare" />
            </Field>
            <Field label="Financing experience">
              <ChipInput values={form.financingExperience} onChange={v => set("financingExperience", v)} placeholder="e.g. SBA 7(a), seller note" />
            </Field>
          </div>
        </CDCard>

        {/* Engagement */}
        <CDCard>
          <CDSectionTitle>Engagement</CDSectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <Field label="Min deal size ($)">
              <input value={dealMin} onChange={e => setDealMin(e.target.value)} placeholder="100,000" inputMode="numeric" style={inputBase} />
            </Field>
            <Field label="Max deal size ($)">
              <input value={dealMax} onChange={e => setDealMax(e.target.value)} placeholder="5,000,000" inputMode="numeric" style={inputBase} />
            </Field>
            <Field label="Fee structure">
              <select value={form.feeStructure} onChange={e => set("feeStructure", e.target.value as ProviderProfileInput["feeStructure"])} style={{ ...inputBase, cursor: "pointer" }}>
                <option value="">Select…</option>
                {FEE_STRUCTURES.map(f => (
                  <option key={f} value={f}>{FEE_STRUCTURE_LABELS[f]}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Represent-clients mode: account flag + paid-tier upsell hint (not a gate). */}
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 18, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.representsClients}
              onChange={e => set("representsClients", e.target.checked)}
              style={{ width: 16, height: 16, marginTop: 2, accentColor: "var(--cd-accent)", cursor: "pointer", flex: "0 0 auto" }}
            />
            <span style={{ fontSize: 13.5, color: "var(--cd-ink)", lineHeight: 1.4 }}>I represent clients</span>
          </label>
          {form.representsClients && (
            <div
              style={{
                marginTop: 10, padding: "11px 15px", borderRadius: "var(--cd-r-md)",
                background: "var(--cd-accent-soft)", border: "1px solid var(--cd-accent-ring)",
                color: "var(--cd-ink-2)", fontSize: 13, lineHeight: 1.45,
              }}
            >
              Representing clients uses Pro or Team — multiple client deals, shared templates, and seats.
            </div>
          )}
        </CDCard>

        {/* Save bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 2 }}>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || loading}
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "var(--cd-accent)", color: "white", border: "none",
              borderRadius: "var(--cd-r-md)", padding: "10px 18px",
              fontSize: 13, fontWeight: 600, cursor: saving || loading ? "default" : "pointer",
              fontFamily: "var(--cd-sans)", whiteSpace: "nowrap",
              boxShadow: "var(--cd-shadow-sm)", opacity: saving || loading ? 0.6 : 1,
            }}
          >
            {saving ? "Saving…" : provider ? "Save changes" : "Create listing"}
          </button>
          {attemptedSubmit && !canSave && (
            <span style={{ fontSize: 13, color: "var(--cd-neg)" }}>Type and name are required.</span>
          )}
          {saved && !saveError && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--cd-pos)", fontWeight: 600 }}>
              <CDIcon name="check" size={14} color="var(--cd-pos)" sw={2.4} />Saved.
            </span>
          )}
          {saveError && (
            <span style={{ fontSize: 13, color: "var(--cd-neg)" }}>{saveError}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default CDProviderProfile;
