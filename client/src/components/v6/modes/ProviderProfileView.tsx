/**
 * V6ProviderProfileView — desktop "Provider profile" tab.
 *
 * Lets a signed-in user create/edit their own service-provider directory listing
 * via GET/PUT /api/providers/me (see useProviderProfile). Being a provider is
 * free and has no plan gate. Layout mirrors the deals-list "full view" pattern:
 * `wk-content` shell, `pg-head` title, `wkcard` sections, and the same input /
 * chip styling used there. Opened from the desktop account menu as a tab kind.
 */
import { useEffect, useMemo, useState, type CSSProperties } from "react";
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
} from "../hooks/useProviderProfile";

interface Props {
  user: User | null;
}

const inputStyle: CSSProperties = {
  width: "100%", boxSizing: "border-box",
  padding: "10px 12px", borderRadius: 10,
  border: "1px solid var(--line)", background: "var(--surface)",
  color: "var(--ink)", fontSize: "0.9rem", outline: "none",
  fontFamily: "var(--font-body)",
};

const labelStyle: CSSProperties = {
  display: "block", fontSize: "0.82rem", fontWeight: 600,
  color: "var(--ink-2)", marginBottom: 6,
};

function Field({ label, children, span = 1 }: { label: string; children: React.ReactNode; span?: number }) {
  return (
    <label style={{ display: "block", gridColumn: `span ${span}` }}>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="wkcard" style={{ marginTop: 16 }}>
      <div className="wkcard-title" style={{ marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  );
}

/** Tag/chip input: type a value, Enter or comma to add, click × to remove. */
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
    <div
      style={{
        display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center",
        padding: values.length ? "7px 8px" : 0,
        border: values.length ? "1px solid var(--line)" : "none",
        borderRadius: 10, background: values.length ? "var(--surface)" : "transparent",
      }}
    >
      {values.map(v => (
        <span
          key={v}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 6px 4px 11px", borderRadius: 999, fontSize: "0.8rem",
            fontWeight: 600, background: "var(--surface-2)", color: "var(--ink)",
            border: "1px solid var(--line)",
          }}
        >
          {v}
          <button
            type="button"
            aria-label={`Remove ${v}`}
            onClick={() => onChange(values.filter(x => x !== v))}
            style={{
              all: "unset", cursor: "pointer", width: 16, height: 16, lineHeight: "16px",
              borderRadius: 999, textAlign: "center", color: "var(--ink-2)", fontSize: 13,
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
        placeholder={values.length ? "Add…" : placeholder}
        style={{ ...inputStyle, flex: "1 1 140px", minWidth: 120, width: "auto", border: values.length ? "none" : "1px solid var(--line)", padding: values.length ? "4px 6px" : "10px 12px", background: "transparent" }}
      />
    </div>
  );
}

export function V6ProviderProfileView({ user }: Props) {
  const { provider, loading, loadError, saving, saveError, saved, save } = useProviderProfile();
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
    const next = toInput(provider, fallbackEmail);
    setForm(next);
    setDealMin(centsToDollars(next.dealSizeMin));
    setDealMax(centsToDollars(next.dealSizeMax));
    setRadius(next.serviceRadiusMiles != null ? String(next.serviceRadiusMiles) : "");
    setHydrated(true);
  }, [loading, hydrated, provider, fallbackEmail]);

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
    <div className="wk-content m-fade-up" style={{ maxWidth: 920, margin: "0 auto" }}>
      <div className="pg-head">
        <div>
          <div className="pg-title">Provider profile</div>
          <p className="pg-sub">
            {loading
              ? "Loading your listing…"
              : provider
                ? "Your listing in the service-provider directory. Update it any time."
                : "List yourself in the service-provider directory so deal teams can find you."}
          </p>
        </div>
      </div>

      {/* One neutral billing note (THE LINE / billing model). */}
      <div
        style={{
          margin: "10px 0 4px", padding: "10px 14px", borderRadius: 10,
          background: "var(--surface-2)", border: "1px solid var(--line)",
          color: "var(--ink-2)", fontSize: "0.86rem", lineHeight: 1.45,
        }}
      >
        Free — you can join any number of deals as a participant at no cost.
      </div>

      {loadError && (
        <div style={{ marginTop: 12, color: "#B42318", fontSize: "0.88rem" }}>{loadError}</div>
      )}

      {/* Identity */}
      <Section title="Identity">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Provider type *">
            <select
              value={form.type}
              onChange={e => set("type", e.target.value as ProviderProfileInput["type"])}
              style={{ ...inputStyle, borderColor: attemptedSubmit && !form.type ? "#B42318" : "var(--line)", cursor: "pointer" }}
            >
              <option value="">Select a type…</option>
              {PROVIDER_TYPES.map(t => (
                <option key={t} value={t}>{PROVIDER_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </Field>
          <Field label="Name *">
            <input
              value={form.name}
              onChange={e => set("name", e.target.value)}
              placeholder="Your full name"
              style={{ ...inputStyle, borderColor: attemptedSubmit && !form.name.trim() ? "#B42318" : "var(--line)" }}
            />
          </Field>
          <Field label="Firm" span={2}>
            <input value={form.firmName} onChange={e => set("firmName", e.target.value)} placeholder="Firm or company name" style={inputStyle} />
          </Field>
        </div>
      </Section>

      {/* Contact */}
      <Section title="Contact">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Email">
            <input value={form.email} onChange={e => set("email", e.target.value)} placeholder={fallbackEmail || "you@firm.com"} type="email" style={inputStyle} />
          </Field>
          <Field label="Phone">
            <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="(555) 555-5555" style={inputStyle} />
          </Field>
          <Field label="Website" span={2}>
            <input value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://…" style={inputStyle} />
          </Field>
        </div>
      </Section>

      {/* Location */}
      <Section title="Location">
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 16 }}>
          <Field label="City">
            <input value={form.locationCity} onChange={e => set("locationCity", e.target.value)} placeholder="City" style={inputStyle} />
          </Field>
          <Field label="State">
            <input value={form.locationState} onChange={e => set("locationState", e.target.value)} placeholder="TX" style={inputStyle} />
          </Field>
          <Field label="ZIP">
            <input value={form.locationZip} onChange={e => set("locationZip", e.target.value)} placeholder="00000" style={inputStyle} />
          </Field>
          <Field label="Service radius (mi)">
            <input value={radius} onChange={e => setRadius(e.target.value)} placeholder="50" inputMode="numeric" style={inputStyle} />
          </Field>
        </div>
      </Section>

      {/* Expertise */}
      <Section title="Expertise">
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
      </Section>

      {/* Engagement */}
      <Section title="Engagement">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <Field label="Min deal size ($)">
            <input value={dealMin} onChange={e => setDealMin(e.target.value)} placeholder="100,000" inputMode="numeric" style={inputStyle} />
          </Field>
          <Field label="Max deal size ($)">
            <input value={dealMax} onChange={e => setDealMax(e.target.value)} placeholder="5,000,000" inputMode="numeric" style={inputStyle} />
          </Field>
          <Field label="Fee structure">
            <select value={form.feeStructure} onChange={e => set("feeStructure", e.target.value as ProviderProfileInput["feeStructure"])} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="">Select…</option>
              {FEE_STRUCTURES.map(f => (
                <option key={f} value={f}>{FEE_STRUCTURE_LABELS[f]}</option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* Save bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "20px 0 8px" }}>
        <button
          type="button"
          className="wkbtn primary"
          onClick={onSave}
          disabled={saving || loading}
          style={{ opacity: saving || loading ? 0.6 : 1 }}
        >
          {saving ? "Saving…" : provider ? "Save changes" : "Create listing"}
        </button>
        {attemptedSubmit && !canSave && (
          <span style={{ fontSize: "0.85rem", color: "#B42318" }}>Type and name are required.</span>
        )}
        {saved && !saveError && (
          <span style={{ fontSize: "0.85rem", color: "var(--on-accent)", fontWeight: 600 }}>Saved.</span>
        )}
        {saveError && (
          <span style={{ fontSize: "0.85rem", color: "#B42318" }}>{saveError}</span>
        )}
      </div>
    </div>
  );
}

export default V6ProviderProfileView;
