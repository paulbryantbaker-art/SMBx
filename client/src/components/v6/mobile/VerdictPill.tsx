import type { Verdict } from "./types";

interface VerdictPillProps {
  kind?: Verdict;
  onLight?: boolean;
}

const LABELS: Record<Verdict, string> = {
  pursue: "PURSUE",
  watch:  "WATCH",
  pass:   "PASS",
};

export function VerdictPill({ kind = "pursue", onLight = false }: VerdictPillProps) {
  const cls = [
    "mb-verdict-pill",
    onLight ? "on-light" : null,
    kind === "watch" ? "warn" : null,
    kind === "pass" ? "danger" : null,
  ].filter(Boolean).join(" ");
  return (
    <span className={cls}>
      <span className="pulse-dot" aria-hidden="true" />
      {LABELS[kind]}
    </span>
  );
}
