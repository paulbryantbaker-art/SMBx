import type { CSSProperties } from "react";
import Settings from "../../../pages/Settings";
import type { User } from "../../../hooks/useAuth";
import { useLocation } from "wouter";
import { WK_THEMES, type WkTheme } from "../../../lib/wkTheme";

interface SettingsViewProps {
  user: User | null;
  onSignOut: () => void;
  wkTheme?: WkTheme;
  onSetWkTheme?: (t: WkTheme) => void;
}

/** Appearance — workspace chrome theme picker (desktop only; the theme
 *  repaints the shell tokens, never brand accent or verdict semantics). */
function AppearanceCard({ wkTheme = "paper", onSetWkTheme }: { wkTheme?: WkTheme; onSetWkTheme?: (t: WkTheme) => void }) {
  if (!onSetWkTheme) return null;
  return (
    <div className="wkcard" style={{ marginBottom: 18 }}>
      <div className="wkcard-title">Appearance</div>
      <div className="wkcard-sub">Workspace chrome — the ground, nav, and surfaces. Verdicts and actions keep their colors in every theme.</div>
      <div style={T.row}>
        {WK_THEMES.map(t => {
          const active = wkTheme === t.id;
          return (
            <button
              key={t.id}
              type="button"
              className="wk-tap"
              onClick={() => onSetWkTheme(t.id)}
              aria-pressed={active}
              style={{ ...T.option, borderColor: active ? "var(--accent-strong)" : "var(--line)", boxShadow: active ? "0 0 0 1px var(--accent-strong)" : "none" }}
            >
              <span aria-hidden style={{ ...T.swatch, background: t.swatch.bg }}>
                <span style={{ ...T.swatchNav, background: t.swatch.nav, borderRight: `1px solid ${t.swatch.line}` }} />
                <span style={{ ...T.swatchCard, border: `1px solid ${t.swatch.line}` }} />
              </span>
              <span style={T.optionLabel}>{t.label}</span>
              <span style={T.optionSub}>{t.sub}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function V6SettingsView({ user, onSignOut, wkTheme, onSetWkTheme }: SettingsViewProps) {
  const [, navigate] = useLocation();

  if (!user) {
    return (
      <div className="wk-content m-fade-up" style={{ maxWidth: 560 }}>
        <h1 style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24,
          letterSpacing: "-0.025em", margin: "4px 0 8px", color: "var(--ink)",
        }}>Sign in to manage settings</h1>
        <p style={{ fontSize: 13, color: "var(--ink-2)", margin: "0 0 18px" }}>
          Profile, usage, billing, and preferences are tied to your account.
        </p>
        <AppearanceCard wkTheme={wkTheme} onSetWkTheme={onSetWkTheme} />
        <div style={{ display: "flex", gap: 8 }}>
          <button className="wkbtn" type="button" onClick={() => navigate("/login")}>
            Sign in
          </button>
          <button className="wkbtn" type="button" onClick={() => navigate("/signup")}>
            Create account
          </button>
        </div>
      </div>
    );
  }
  // Appearance above the existing Settings page, inside the same canvas tab.
  return (
    <div>
      <div className="wk-content" style={{ maxWidth: 760, paddingBottom: 0 }}>
        <AppearanceCard wkTheme={wkTheme} onSetWkTheme={onSetWkTheme} />
      </div>
      <Settings user={user} onLogout={onSignOut} />
    </div>
  );
}

const T: Record<string, CSSProperties> = {
  row: { display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" },
  option: {
    appearance: "none",
    background: "var(--surface)",
    border: "1px solid var(--line)",
    margin: 0,
    cursor: "pointer",
    borderRadius: 14,
    padding: 10,
    width: 168,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 3,
    textAlign: "left",
  },
  swatch: {
    position: "relative",
    display: "block",
    width: "100%",
    height: 64,
    borderRadius: 9,
    overflow: "hidden",
    border: "1px solid rgba(25,24,19,0.10)",
    marginBottom: 6,
  },
  swatchNav: {
    position: "absolute",
    top: 0, left: 0, bottom: 0,
    width: "30%",
  },
  swatchCard: {
    position: "absolute",
    top: 12, right: 10,
    width: "48%", height: 30,
    borderRadius: 6,
    background: "#FFFFFF",
  },
  optionLabel: { fontSize: 13, fontWeight: 750, color: "var(--ink)" },
  optionSub: { fontSize: 11, color: "var(--ink-3)", lineHeight: 1.35 },
};
