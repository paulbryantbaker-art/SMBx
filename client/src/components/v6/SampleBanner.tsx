import { type CSSProperties } from "react";
import { V6Icon } from "./icons";

export const SAMPLE_DISMISS_KEY = "smbx_v6_sample_banner_dismissed";

interface SampleBannerProps {
  onDismiss: () => void;
  onStartWorkspace: () => void;
}

export function SampleBanner({ onDismiss, onStartWorkspace }: SampleBannerProps) {
  return (
    <div role="status" aria-live="polite" style={B.bar}>
      <div style={B.left}>
        <span className="mono" style={B.eyebrow}>WORKING SAMPLE</span>
        <span style={B.divider} />
        <span style={B.text}>
          Chat is live. Deal data is illustrative &mdash; bring your own when you&rsquo;re ready.
        </span>
      </div>
      <div style={B.right}>
        <button onClick={onStartWorkspace} style={B.cta} className="m-nudge-soft">
          Start your workspace
          <span style={{ fontSize: 11, marginLeft: 4 }}>&rarr;</span>
        </button>
        <button
          onClick={onDismiss}
          aria-label="Dismiss working sample banner"
          style={B.dismiss}
          className="m-nudge-soft"
        >
          <V6Icon name="close" size={11} />
        </button>
      </div>
    </div>
  );
}

const B: Record<string, CSSProperties> = {
  bar: {
    height: 36,
    flexShrink: 0,
    background: "#F3F1EA",
    color: "#57534A",
    borderBottom: "1px solid rgba(25, 24, 19, 0.10)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 14px",
    fontSize: 12,
    gap: 12,
  },
  left: { display: "flex", alignItems: "center", gap: 10, minWidth: 0 },
  eyebrow: {
    fontSize: 9.5,
    letterSpacing: "0.14em",
    fontWeight: 700,
    color: "#57534A",
    flexShrink: 0,
  },
  divider: {
    width: 1,
    height: 12,
    background: "rgba(25, 24, 19, 0.16)",
    flexShrink: 0,
  },
  text: {
    fontSize: 12,
    fontWeight: 500,
    color: "#57534A",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  right: { display: "flex", alignItems: "center", gap: 4, flexShrink: 0 },
  cta: {
    all: "unset",
    display: "inline-flex",
    alignItems: "center",
    padding: "5px 10px",
    borderRadius: 6,
    fontSize: 11.5,
    fontWeight: 600,
    color: "#191813",
    cursor: "pointer",
    border: "1px solid rgba(43, 255, 119, 0.55)",
    transition: "background 120ms ease, border-color 120ms ease",
  },
  dismiss: {
    all: "unset",
    width: 24,
    height: 24,
    display: "grid",
    placeItems: "center",
    borderRadius: 6,
    cursor: "pointer",
    color: "rgba(87, 83, 74, 0.68)",
  },
};
