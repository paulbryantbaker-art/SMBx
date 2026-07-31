/**
 * Shared pipeline-stage taxonomy for the deal pipeline — used by BOTH the
 * desktop PipelineRoot and the mobile Pipeline screen so the two surfaces group
 * deals identically. Maps a journey gate (S/B/R/PMI + index) to one of five
 * human stages.
 */

export type PipelineStageId = "source" | "value" | "diligence" | "structure" | "close";

export interface PipelineStage {
  id: PipelineStageId;
  title: string;
  sub: string;
}

/**
 * BUY-SIDE DEAL STAGES (relabelled 2026-07-31). Paul: "everything is buy-side,
 * so we need this to be clients, then deals, and then stages like interested,
 * indication of interest, … whatever the stages are going into close."
 *
 * The IDs and the gate mapping below are UNCHANGED — this is a vocabulary
 * change, not a re-plumbing. The old titles (Source / Value / Structure) were
 * journey-neutral because the app once ran sell-side and raise as well; the
 * practice is buy-side only now, so the labels say what actually happens to a
 * target on the way to close.
 *
 * The order follows the existing B0–B5 gates rather than a textbook process:
 * B3 is diligence and B4 is structuring in this app, so LOI sits with terms.
 * Renumbering the gates would be a real migration, and mislabelling them to
 * look tidier would be worse.
 */
export const PIPELINE_STAGES: PipelineStage[] = [
  { id: "source", title: "Interested", sub: "Thesis, sourcing, first read" },
  { id: "value", title: "Indication of interest", sub: "Valuation, then the IOI" },
  { id: "diligence", title: "Diligence", sub: "QoE, files, legal watch" },
  { id: "structure", title: "LOI & terms", sub: "Terms, tax, approvals" },
  { id: "close", title: "Close", sub: "Closing and the first 100 days" },
];

export function stageForGate(gateId: string): PipelineStageId {
  if (/^(S|B|R)[01]$/.test(gateId)) return "source";
  if (/^(S|B|R)2$/.test(gateId)) return "value";
  if (/^(S|B)3$/.test(gateId) || gateId === "R3") return "diligence";
  if (/^(S|B|R)4$/.test(gateId)) return "structure";
  return "close";
}
