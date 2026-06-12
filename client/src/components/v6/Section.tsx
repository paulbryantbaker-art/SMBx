import type { CSSProperties, ReactNode } from "react";

/* Section header — title leads, per the eyebrow lock (2026-06-01): no
   decorative mono-caps kickers. The old `eyebrow` prop and its render path
   were deleted in the fusion Wave A foundation. */
export function V6Section({ title, sub, action, children }: {
  title: string;
  sub?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section style={{ marginBottom: 36 }}>
      <div style={S.header}>
        <div>
          <h2 style={S.title}>{title}</h2>
          {sub && <div style={S.sub}>{sub}</div>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

const S: Record<string, CSSProperties> = {
  header: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  title: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: 20,
    letterSpacing: "-0.025em",
    margin: "4px 0 0",
    color: "var(--m-on-surface)",
  },
  sub: {
    fontSize: 12.5,
    color: "var(--m-on-surface-mid)",
    marginTop: 3,
  },
};
