import Settings from "../../../pages/Settings";
import type { User } from "../../../hooks/useAuth";

interface SettingsViewProps {
  user: User | null;
  onSignOut: () => void;
}

export function V6SettingsView({ user, onSignOut }: SettingsViewProps) {
  if (!user) {
    return (
      <div className="m-fade-up" style={{ maxWidth: 560 }}>
        <div className="mono" style={{ fontSize: 9.5, color: "var(--m-on-surface-mid)", letterSpacing: "0.14em", fontWeight: 600 }}>SETTINGS</div>
        <h1 style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24,
          letterSpacing: "-0.025em", margin: "4px 0 8px", color: "var(--m-on-surface)",
        }}>Sign in to manage settings</h1>
        <p style={{ fontSize: 13, color: "var(--m-on-surface-mid)", margin: 0 }}>
          Profile, usage, billing, and preferences are tied to your account.
        </p>
      </div>
    );
  }
  // Mount the existing Settings page inside the canvas tab.
  return <Settings user={user} onLogout={onSignOut} />;
}
