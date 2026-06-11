import { useEffect, useRef, useState } from "react";

/**
 * WorkSeal — the substrate's signature, rendered. A compact mono stamp:
 *
 *     ◇ MODEL.lbo.v1 · v4   9f3a2c…d21b ✓   2m ago
 *
 * HONESTY RULE (the whole point): a seal renders ONLY from a real
 * `outputHash` the substrate produced (model_executions / persisted
 * deliverable snapshots). When work hasn't been signed yet, pass
 * `unsigned` — it renders a dashed "unsigned draft" and never fabricates.
 *
 * The stamp-in animation fires once per new hash (keyed re-mount), never
 * loops, and collapses under prefers-reduced-motion (CSS handles it).
 * Styles live in workspace.css under `.wkseal*`.
 */

function shortHash(value: string): string {
  const clean = value.replace(/^sha256:/i, "");
  return clean.length <= 12 ? clean : `${clean.slice(0, 6)}…${clean.slice(-4)}`;
}

function relTime(iso?: string | number | null): string | null {
  if (!iso) return null;
  const then = typeof iso === "number" ? iso : new Date(iso).getTime();
  if (!Number.isFinite(then)) return null;
  const min = Math.round((Date.now() - then) / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.round(hr / 24)}d ago`;
}

export function WorkSeal({
  modelId,
  version,
  outputHash,
  timestamp,
  unsigned = false,
  title,
}: {
  /** e.g. "MODEL.lbo.v1" or a model type like "lbo" */
  modelId?: string | null;
  version?: number | string | null;
  /** the REAL hash from the substrate; absent → unsigned */
  outputHash?: string | null;
  /** when the signed run happened (iso or epoch ms) */
  timestamp?: string | number | null;
  /** explicit scratch state (overrides hash presence) */
  unsigned?: boolean;
  /** optional tooltip override */
  title?: string;
}) {
  const signed = !unsigned && !!outputHash;
  // Re-trigger the stamp-in exactly when a NEW signature lands.
  const [stampKey, setStampKey] = useState(0);
  const prevHash = useRef<string | null>(null);
  useEffect(() => {
    if (signed && outputHash !== prevHash.current) {
      prevHash.current = outputHash ?? null;
      setStampKey((k) => k + 1);
    }
  }, [signed, outputHash]);

  if (!signed) {
    return (
      <span className="wkseal wkseal-unsigned" title={title || "This state has not been persisted — no signature yet"}>
        <span className="wkseal-mark" aria-hidden="true" />
        unsigned draft
      </span>
    );
  }

  const time = relTime(timestamp);
  return (
    <span
      key={stampKey}
      className="wkseal wkseal-stamp"
      title={title || `Output hash ${outputHash} — computed by the substrate`}
    >
      <span className="wkseal-mark" aria-hidden="true" />
      {modelId && <span>{modelId}{version != null ? ` · v${version}` : ""}</span>}
      <span className="wkseal-hash">
        {shortHash(outputHash!)}
        <i className="wkseal-check" aria-hidden="true">✓</i>
      </span>
      {time && <span className="wkseal-time">{time}</span>}
    </span>
  );
}
