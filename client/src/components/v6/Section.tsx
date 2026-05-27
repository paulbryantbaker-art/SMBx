import type { CSSProperties, ReactNode } from "react";

export function V6Section({ eyebrow, title, sub, action, children }: {
  eyebrow?: string;
  title: string;
  sub?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section style={{ marginBottom: 36 }}>
      <div style={S.header}>
        <div>
          {eyebrow && <div className="mono" style={S.eyebrow}>{eyebrow}</div>}
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
  eyebrow: {
    fontSize: 9.5,
    color: "var(--m-on-surface-mid)",
    letterSpacing: "0.14em",
    fontWeight: 600,
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
