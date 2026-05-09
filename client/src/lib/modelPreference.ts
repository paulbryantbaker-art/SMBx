export type ModelPreference = "auto" | "fast" | "deep" | "drafting" | "research";

export const MODEL_PREFERENCE_LABELS: Record<ModelPreference, string> = {
  auto: "Auto",
  fast: "Fast",
  deep: "Deep",
  drafting: "Drafting",
  research: "Research",
};

export function normalizeModelPreference(value: unknown): ModelPreference {
  return value === "fast" || value === "deep" || value === "drafting" || value === "research"
    ? value
    : "auto";
}
