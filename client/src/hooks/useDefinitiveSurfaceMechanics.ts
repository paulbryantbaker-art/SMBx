import { useEffect, useMemo, useState } from "react";

export type DefinitiveSurfaceId = "today" | "pipeline" | "files" | "studio";

export type DefinitiveRouteReadiness =
  | "executable"
  | "planning_only"
  | "professional_handoff"
  | "research_only"
  | "pass_through_required"
  | "reserved";

export interface DefinitiveMechanicsReadiness {
  total: number;
  executable: number;
  planningOnly: number;
  professionalHandoff: number;
  researchOnly: number;
  passThroughRequired: number;
  reserved: number;
}

export interface DefinitiveSurfaceMechanics {
  surface: DefinitiveSurfaceId;
  title: string;
  purpose: string;
  totalMechanics: number;
  readiness: DefinitiveMechanicsReadiness;
  visibleModelSlots: string[];
  needs: {
    executable: string[];
    passThrough: string[];
    professionalHandoff: string[];
    researchOnly: string[];
  };
  yuliaGuidance: string[];
}

export interface DefinitivePassThroughCatalogItem {
  id: string;
  label: string;
  sourceType: string;
  exampleProviders: string[];
  billingUnit: string;
  pricingMode: "vendor_cost_plus_fixed_margin" | "free_public_record" | "free_editorial_directory";
  priceDisplay: string;
  fixedMarginPolicy: string;
  chargedRegardlessOfOutcome: true;
  humanReferralCompensationAllowed: false;
  dependentModelSlots: string[];
  lineBoundary: string;
  status: "published" | "planned";
}

export interface DefinitiveSurfaceContract {
  version: string;
  generatedAt?: string;
  surfaceMechanics: DefinitiveSurfaceMechanics[];
  passThroughCatalog: DefinitivePassThroughCatalogItem[];
}

interface DefinitiveSpecResponse {
  version: string;
  generatedAt?: string;
  dealMechanicsSurface?: {
    surfaceMechanics?: DefinitiveSurfaceMechanics[];
  };
  passThroughSurface?: {
    catalog?: DefinitivePassThroughCatalogItem[];
  };
}

export function useDefinitiveSurfaceMechanics() {
  const [contract, setContract] = useState<DefinitiveSurfaceContract | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 4500);
    setLoading(true);
    setError(null);

    fetch("/api/definitive/spec", { signal: controller.signal })
      .then(res => res.ok ? res.json() : Promise.reject(new Error(`definitive ${res.status}`)))
      .then((payload: DefinitiveSpecResponse) => {
        if (cancelled) return;
        setContract({
          version: payload.version,
          generatedAt: payload.generatedAt,
          surfaceMechanics: payload.dealMechanicsSurface?.surfaceMechanics ?? [],
          passThroughCatalog: payload.passThroughSurface?.catalog ?? [],
        });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setContract(null);
        setError(err.name === "AbortError" ? "definitive timeout" : err.message);
      })
      .finally(() => {
        window.clearTimeout(timeout);
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const bySurface = useMemo(() => {
    const map = new Map<DefinitiveSurfaceId, DefinitiveSurfaceMechanics>();
    for (const item of contract?.surfaceMechanics ?? []) {
      map.set(item.surface, item);
    }
    return map;
  }, [contract?.surfaceMechanics]);

  const passThroughByModel = useMemo(() => {
    const map = new Map<string, DefinitivePassThroughCatalogItem[]>();
    for (const item of contract?.passThroughCatalog ?? []) {
      for (const slot of item.dependentModelSlots) {
        const list = map.get(slot) ?? [];
        list.push(item);
        map.set(slot, list);
      }
    }
    return map;
  }, [contract?.passThroughCatalog]);

  return {
    contract,
    loading,
    error,
    bySurface,
    passThroughByModel,
    getSurface: (surface: DefinitiveSurfaceId) => bySurface.get(surface) ?? null,
    getPassThroughItems: (modelSlot: string) => passThroughByModel.get(modelSlot) ?? [],
  };
}
