/**
 * useProviderProfile — V6 data hook for the self-serve service-provider listing.
 *
 * Wires the live provider routes (server/routes/providers.ts, behind requireAuth):
 *   GET  /api/providers/me  → { provider: ProviderProfile | null }
 *   PUT  /api/providers/me  ← { type, name, firmName, email, phone, website,
 *                              locationState, locationCity, locationZip,
 *                              serviceRadiusMiles, credentials, practiceAreas,
 *                              dealSizeMin, dealSizeMax, industries,
 *                              financingExperience, feeStructure, licenses }
 *
 * The GET returns snake_case columns; the PUT takes camelCase. deal_size_min/max
 * are stored in CENTS (integers) — the form works in dollars and converts on the
 * boundary. Only `type` + `name` are required server-side.
 *
 * Shared by the desktop tab (modes/ProviderProfileView) and the mobile screen
 * (mobile/screens/ProviderProfileScreen) so the wiring lives in one place.
 */
import { useCallback, useEffect, useState } from "react";
import { authHeaders } from "../../../hooks/useAuth";

/** Provider type enum — mirrors PROVIDER_TYPES in server/routes/providers.ts. */
export const PROVIDER_TYPES = [
  "attorney",
  "cpa",
  "appraiser",
  "re_agent",
  "insurance",
  "consultant",
  "escrow",
  "title",
] as const;
export type ProviderType = (typeof PROVIDER_TYPES)[number];

export const PROVIDER_TYPE_LABELS: Record<ProviderType, string> = {
  attorney: "Attorney",
  cpa: "CPA",
  appraiser: "Appraiser",
  re_agent: "Real estate agent",
  insurance: "Insurance",
  consultant: "Consultant",
  escrow: "Escrow",
  title: "Title",
};

/** Fee-structure enum from the backend. */
export const FEE_STRUCTURES = ["hourly", "flat", "contingent", "hybrid"] as const;
export type FeeStructure = (typeof FEE_STRUCTURES)[number];

export const FEE_STRUCTURE_LABELS: Record<FeeStructure, string> = {
  hourly: "Hourly",
  flat: "Flat fee",
  contingent: "Contingent",
  hybrid: "Hybrid",
};

/** snake_case row as returned by GET /api/providers/me. */
export interface ProviderProfile {
  id: number;
  type: ProviderType | string;
  name: string;
  firm_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  location_state: string | null;
  location_city: string | null;
  location_zip: string | null;
  service_radius_miles: number | null;
  credentials: string[] | null;
  practice_areas: string[] | null;
  deal_size_min: number | null;
  deal_size_max: number | null;
  industries: string[] | null;
  financing_experience: string[] | null;
  fee_structure: FeeStructure | string | null;
  licenses: unknown;
}

/** camelCase body for PUT /api/providers/me. */
export interface ProviderProfileInput {
  type: ProviderType | "";
  name: string;
  firmName: string;
  email: string;
  phone: string;
  website: string;
  locationState: string;
  locationCity: string;
  locationZip: string;
  serviceRadiusMiles: number | null;
  credentials: string[];
  practiceAreas: string[];
  dealSizeMin: number | null;
  dealSizeMax: number | null;
  industries: string[];
  financingExperience: string[];
  feeStructure: FeeStructure | "";
  licenses: string[];
}

export interface UseProviderProfile {
  provider: ProviderProfile | null;
  loading: boolean;
  loadError: string | null;
  saving: boolean;
  saveError: string | null;
  saved: boolean;
  refresh: () => Promise<void>;
  save: (input: ProviderProfileInput) => Promise<boolean>;
}

export function useProviderProfile(): UseProviderProfile {
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/providers/me", { headers: authHeaders() });
      if (!res.ok) {
        setLoadError(`Couldn't load your listing (${res.status}).`);
        return;
      }
      const data = await res.json();
      setProvider(data?.provider ?? null);
    } catch {
      setLoadError("Network error loading your listing.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = useCallback(async (input: ProviderProfileInput): Promise<boolean> => {
    if (saving) return false;
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/providers/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveError(data?.error || "Couldn't save your listing.");
        return false;
      }
      const data = await res.json();
      setProvider(data?.provider ?? null);
      setSaved(true);
      return true;
    } catch {
      setSaveError("Network error saving your listing.");
      return false;
    } finally {
      setSaving(false);
    }
  }, [saving]);

  return { provider, loading, loadError, saving, saveError, saved, refresh, save };
}

/** Parse the licenses column (stored as JSON text) into a string[] best-effort. */
export function parseLicenses(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch { /* not JSON — ignore */ }
  }
  return [];
}

/** Build the camelCase PUT body from a snake_case profile row (for prefill). */
export function toInput(p: ProviderProfile | null, fallbackEmail: string): ProviderProfileInput {
  return {
    type: (p?.type as ProviderType) ?? "",
    name: p?.name ?? "",
    firmName: p?.firm_name ?? "",
    email: p?.email ?? fallbackEmail ?? "",
    phone: p?.phone ?? "",
    website: p?.website ?? "",
    locationState: p?.location_state ?? "",
    locationCity: p?.location_city ?? "",
    locationZip: p?.location_zip ?? "",
    serviceRadiusMiles: p?.service_radius_miles ?? null,
    credentials: p?.credentials ?? [],
    practiceAreas: p?.practice_areas ?? [],
    dealSizeMin: p?.deal_size_min ?? null,
    dealSizeMax: p?.deal_size_max ?? null,
    industries: p?.industries ?? [],
    financingExperience: p?.financing_experience ?? [],
    feeStructure: (p?.fee_structure as FeeStructure) ?? "",
    licenses: parseLicenses(p?.licenses),
  };
}

/** Dollars (string from an input) → integer cents, or null when blank/invalid. */
export function dollarsToCents(value: string): number | null {
  const trimmed = value.trim().replace(/[$,\s]/g, "");
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

/** Integer cents → a plain dollar string for an input ("" when null). */
export function centsToDollars(cents: number | null | undefined): string {
  if (cents == null) return "";
  return String(Math.round(cents / 100));
}
