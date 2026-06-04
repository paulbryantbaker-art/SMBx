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

export const PIPELINE_STAGES: PipelineStage[] = [
  { id: "source", title: "Source", sub: "Thesis, intake, first read" },
  { id: "value", title: "Value", sub: "Valuation and finance fit" },
  { id: "diligence", title: "Diligence", sub: "QoE, files, legal watch" },
  { id: "structure", title: "Structure", sub: "Terms, tax, approvals" },
  { id: "close", title: "Close / PMI", sub: "Closing and value creation" },
];

export function stageForGate(gateId: string): PipelineStageId {
  if (/^(S|B|R)[01]$/.test(gateId)) return "source";
  if (/^(S|B|R)2$/.test(gateId)) return "value";
  if (/^(S|B)3$/.test(gateId) || gateId === "R3") return "diligence";
  if (/^(S|B|R)4$/.test(gateId)) return "structure";
  return "close";
}
