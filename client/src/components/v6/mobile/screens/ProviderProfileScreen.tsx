/* V6 Mobile — Provider profile screen.

   Create/edit the signed-in user's service-provider directory listing via
   GET/PUT /api/providers/me (useProviderProfile). Being a provider is free with
   no plan gate. Layout mirrors the mobile deals-list screen: floating back
   button, large hero title, card sections, and the same --mb-* token styling.
   Pushed from the mobile account sheet. */

import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { MobileIcon } from "../icons";
import { type User } from "../../../../hooks/useAuth";
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
} from "../../hooks/useProviderProfile";

interface Props {
  onBack: () => void;
  user: User | null;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span style={D.label}>{label}</span>
      {children}
    </label>
  );
}

/** Mobile tag/chip input: type, Enter/comma to add, tap × to remove. */
function ChipInput({
  values, onChange, placeholder,
}: { values: string[]; onChange: (next: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState("");
  const commit = () => {
    const v = draft.trim().replace(/,$/, "").trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  };
  return (
    <div>
      {values.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
          {values.map(v => (
            <span key={v} style={D.chip}>
              {v}
              <button
                type="button"
                aria-label={`Remove ${v}`}
                onClick={() => onChange(values.filter(x => x !== v))}
                style={D.chipX}
              >×</button>
            </span>
          ))}
        </div>
      )}
      <input
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); commit(); }
          else if (e.key === "Backspace" && !draft && values.length) onChange(values.slice(0, -1));
        }}
        onBlur={commit}
        placeholder={placeholder}
        style={D.input}
      />
    </div>
  );
}

export function MobileProviderProfileScreen({ onBack, user }: Props) {
  const { provider, representsClients, loading, loadError, saving, saveError, saved, save } = useProviderProfile();
  const fallbackEmail = user?.email ?? "";

  const [form, setForm] = useState<ProviderProfileInput>(() => toInput(null, fallbackEmail));
  const [dealMin, setDealMin] = useState("");
  const [dealMax, setDealMax] = useState("");
  const [radius, setRadius] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

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
    <div className="mb-fade-up" style={{ minHeight: "100vh", paddingBottom: 110 }}>
      <button type="button" onClick={onBack} aria-label="Back" style={D.backBtn}>
        <MobileIcon name="back" size={14} c="var(--mb-ink-1)" />
      </button>

      <div style={D.heroHeader}>
        <h1 style={D.heroTitle}>Provider profile</h1>
        <p style={D.heroSub}>
          {loading
            ? "Loading your listing…"
            : provider
              ? "Your listing in the service-provider directory."
              : "List yourself so deal teams can find you."}
        </p>
      </div>

      <div style={{ padding: "0 16px" }}>
        {/* One neutral billing note. */}
        <div style={D.note}>Free — you can join any number of deals as a participant at no cost.</div>

        {loadError && <div style={{ ...D.error, marginBottom: 10 }}>{loadError}</div>}

        {/* Identity */}
        <div className="mb-as-card" style={D.card}>
          <div style={D.cardTitle}>Identity</div>
          <Field label="Provider type *">
            <select
              value={form.type}
              onChange={e => set("type", e.target.value as ProviderProfileInput["type"])}
              style={{ ...D.input, borderColor: attemptedSubmit && !form.type ? "#D9534F" : "var(--mb-line-2)" }}
            >
              <option value="">Select a type…</option>
              {PROVIDER_TYPES.map(t => <option key={t} value={t}>{PROVIDER_TYPE_LABELS[t]}</option>)}
            </select>
          </Field>
          <Field label="Name *">
            <input
              value={form.name}
              onChange={e => set("name", e.target.value)}
              placeholder="Your full name"
              style={{ ...D.input, borderColor: attemptedSubmit && !form.name.trim() ? "#D9534F" : "var(--mb-line-2)" }}
            />
          </Field>
          <Field label="Firm">
            <input value={form.firmName} onChange={e => set("firmName", e.target.value)} placeholder="Firm or company name" style={D.input} />
          </Field>
        </div>

        {/* Contact */}
        <div className="mb-as-card" style={D.card}>
          <div style={D.cardTitle}>Contact</div>
          <Field label="Email">
            <input value={form.email} onChange={e => set("email", e.target.value)} placeholder={fallbackEmail || "you@firm.com"} type="email" style={D.input} />
          </Field>
          <Field label="Phone">
            <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="(555) 555-5555" inputMode="tel" style={D.input} />
          </Field>
          <Field label="Website">
            <input value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://…" inputMode="url" style={D.input} />
          </Field>
        </div>

        {/* Location */}
        <div className="mb-as-card" style={D.card}>
          <div style={D.cardTitle}>Location</div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
            <Field label="City">
              <input value={form.locationCity} onChange={e => set("locationCity", e.target.value)} placeholder="City" style={D.input} />
            </Field>
            <Field label="State">
              <input value={form.locationState} onChange={e => set("locationState", e.target.value)} placeholder="TX" style={D.input} />
            </Field>
            <Field label="ZIP">
              <input value={form.locationZip} onChange={e => set("locationZip", e.target.value)} placeholder="00000" inputMode="numeric" style={D.input} />
            </Field>
            <Field label="Service radius (mi)">
              <input value={radius} onChange={e => setRadius(e.target.value)} placeholder="50" inputMode="numeric" style={D.input} />
            </Field>
          </div>
        </div>

        {/* Expertise */}
        <div className="mb-as-card" style={D.card}>
          <div style={D.cardTitle}>Expertise</div>
          <Field label="Practice areas">
            <ChipInput values={form.practiceAreas} onChange={v => set("practiceAreas", v)} placeholder="e.g. M&A, tax" />
          </Field>
          <Field label="Credentials">
            <ChipInput values={form.credentials} onChange={v => set("credentials", v)} placeholder="e.g. JD, CPA" />
          </Field>
          <Field label="Industries">
            <ChipInput values={form.industries} onChange={v => set("industries", v)} placeholder="e.g. HVAC, SaaS" />
          </Field>
          <Field label="Financing experience">
            <ChipInput values={form.financingExperience} onChange={v => set("financingExperience", v)} placeholder="e.g. SBA 7(a)" />
          </Field>
        </div>

        {/* Engagement */}
        <div className="mb-as-card" style={D.card}>
          <div style={D.cardTitle}>Engagement</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Min deal size ($)">
              <input value={dealMin} onChange={e => setDealMin(e.target.value)} placeholder="100,000" inputMode="numeric" style={D.input} />
            </Field>
            <Field label="Max deal size ($)">
              <input value={dealMax} onChange={e => setDealMax(e.target.value)} placeholder="5,000,000" inputMode="numeric" style={D.input} />
            </Field>
          </div>
          <Field label="Fee structure">
            <select value={form.feeStructure} onChange={e => set("feeStructure", e.target.value as ProviderProfileInput["feeStructure"])} style={D.input}>
              <option value="">Select…</option>
              {FEE_STRUCTURES.map(f => <option key={f} value={f}>{FEE_STRUCTURE_LABELS[f]}</option>)}
            </select>
          </Field>

          {/* Represent-clients mode: account flag + paid-tier upsell hint (not a gate). */}
          <label style={D.repRow}>
            <input
              type="checkbox"
              checked={form.representsClients}
              onChange={e => set("representsClients", e.target.checked)}
              style={D.checkbox}
            />
            <span style={{ fontSize: 15, color: "var(--mb-ink)", lineHeight: 1.4 }}>I represent clients</span>
          </label>
          {form.representsClients && (
            <div style={{ ...D.note, marginTop: 10, marginBottom: 4 }}>
              Representing clients uses Pro or Team — multiple client deals, shared templates, and seats.
            </div>
          )}
        </div>

        {/* Save */}
        <button
          type="button"
          onClick={onSave}
          disabled={saving || loading}
          style={{ ...D.saveBtn, opacity: saving || loading ? 0.6 : 1 }}
        >
          {saving ? "Saving…" : provider ? "Save changes" : "Create listing"}
        </button>
        <div style={{ minHeight: 22, marginTop: 10, textAlign: "center" }}>
          {attemptedSubmit && !canSave && <span style={D.error}>Type and name are required.</span>}
          {saved && !saveError && <span style={D.ok}>Saved.</span>}
          {saveError && <span style={D.error}>{saveError}</span>}
        </div>
      </div>
    </div>
  );
}

const D: Record<string, CSSProperties> = {
  backBtn: {
    position: "absolute",
    top: "calc(env(safe-area-inset-top, 44px) + 12px)",
    left: 16, zIndex: 10,
    width: 36, height: 36, borderRadius: "50%",
    background: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
    border: "none",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.04)",
    cursor: "pointer",
  },
  heroHeader: { padding: "calc(env(safe-area-inset-top, 44px) + 64px) 22px 6px" },
  heroTitle: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700, fontSize: 32,
    letterSpacing: "-0.7px", lineHeight: 1.05, margin: "6px 0 0", color: "var(--mb-ink)",
  },
  heroSub: { fontSize: 14, color: "var(--mb-ink-3)", margin: "8px 0 12px", lineHeight: 1.4 },
  note: {
    padding: "10px 14px", borderRadius: 12, marginBottom: 14,
    background: "var(--mb-card-2)", border: "0.5px solid var(--mb-line-2)",
    color: "var(--mb-ink-2)", fontSize: 13, lineHeight: 1.4,
  },
  card: { padding: "16px 16px 4px", marginBottom: 14 },
  cardTitle: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700, fontSize: 17,
    color: "var(--mb-ink)", letterSpacing: "-0.3px", marginBottom: 14,
  },
  label: { display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--mb-ink-2)", marginBottom: 6 },
  input: {
    width: "100%", boxSizing: "border-box",
    padding: "11px 14px", borderRadius: 12,
    border: "0.5px solid var(--mb-line-2)", background: "var(--mb-surface, #fff)",
    color: "var(--mb-ink)", fontSize: 15, outline: "none",
    WebkitAppearance: "none", fontFamily: "var(--mb-font-display)",
  },
  chip: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "5px 7px 5px 12px", borderRadius: 999, fontSize: 13, fontWeight: 600,
    background: "var(--mb-card-2)", color: "var(--mb-ink)", border: "0.5px solid var(--mb-line-2)",
  },
  chipX: {
    all: "unset", cursor: "pointer", width: 18, height: 18, lineHeight: "18px",
    borderRadius: 999, textAlign: "center", color: "var(--mb-ink-3)", fontSize: 15,
  },
  saveBtn: {
    width: "100%", boxSizing: "border-box", marginTop: 6,
    padding: "15px 16px", borderRadius: 14, border: "none",
    background: "var(--mb-accent)", color: "var(--mb-accent-ink)",
    fontFamily: "var(--mb-font-display)", fontWeight: 700, fontSize: 16,
    cursor: "pointer", WebkitTapHighlightColor: "transparent",
  },
  error: { fontSize: 13, color: "#D9534F", fontWeight: 600 },
  ok: { fontSize: 13, color: "var(--mb-accent-ink)", fontWeight: 700 },
  repRow: {
    display: "flex", alignItems: "flex-start", gap: 10,
    marginTop: 4, marginBottom: 10, cursor: "pointer",
  },
  checkbox: {
    width: 20, height: 20, marginTop: 1, flex: "0 0 auto",
    accentColor: "var(--mb-accent)", cursor: "pointer",
  },
};

export default MobileProviderProfileScreen;
