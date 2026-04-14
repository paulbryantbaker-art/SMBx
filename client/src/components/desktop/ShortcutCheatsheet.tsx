/**
 * ShortcutCheatsheet — centered modal listing all desktop keyboard
 * shortcuts. Opens when the user presses `?` globally.
 *
 * Closes the Nielsen H10 gap — shortcuts exist but were invisible.
 */

import * as Dialog from '@radix-ui/react-dialog';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dark: boolean;
}

interface ShortcutRow {
  keys: string[];      // e.g. ['⌘', 'K']
  label: string;
}

interface ShortcutGroup {
  heading: string;
  shortcuts: ShortcutRow[];
}

const GROUPS: ShortcutGroup[] = [
  {
    heading: 'Global',
    shortcuts: [
      { keys: ['⌘', 'K'], label: 'Open command palette' },
      { keys: ['⌘', '/'], label: 'Focus chat composer' },
      { keys: ['?'], label: 'Show this cheatsheet' },
      { keys: ['⌘', '⇧', 'D'], label: 'Toggle dark mode' },
    ],
  },
  {
    heading: 'Deals',
    shortcuts: [
      { keys: ['⌘', 'N'], label: 'Start a new deal' },
    ],
  },
  {
    heading: 'Navigation',
    shortcuts: [
      { keys: ['Enter'], label: 'Activate focused item' },
      { keys: ['Esc'], label: 'Close overlay / dismiss' },
      { keys: ['↑', '↓'], label: 'Move within lists' },
    ],
  },
];

export default function ShortcutCheatsheet({ open, onOpenChange, dark }: Props) {
  const bg = dark ? '#151617' : '#FFFFFF';
  const heading = dark ? '#F0F0F3' : '#1A1C1E';
  const body = dark ? 'rgba(240,240,243,0.78)' : '#3C3D40';
  const muted = dark ? 'rgba(240,240,243,0.55)' : '#6B6C6F';
  const border = dark ? 'rgba(255,255,255,0.08)' : '#E5E1D9';
  const keyBg = dark ? '#1A1C1E' : '#F7F5EF';
  const keyBorder = dark ? 'rgba(255,255,255,0.10)' : '#E0DCD2';
  const accent = dark ? '#E8709A' : '#D44A78';

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15,16,18,0.45)',
          zIndex: 220,
          animation: 'cheatOverlayIn 120ms ease',
        }} />
        <Dialog.Content
          aria-label="Keyboard shortcuts"
          style={{
            position: 'fixed',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(520px, calc(100vw - 32px))',
            maxHeight: '80vh',
            background: bg,
            border: `1px solid ${border}`,
            borderRadius: 16,
            boxShadow: dark
              ? '0 1px 2px rgba(0,0,0,0.4), 0 24px 48px rgba(0,0,0,0.5)'
              : '0 1px 2px rgba(60,55,45,0.08), 0 24px 48px rgba(60,55,45,0.18)',
            zIndex: 230,
            outline: 'none',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: 'cheatContentIn 160ms ease',
          }}
        >
          <header style={{ padding: '18px 22px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Dialog.Title asChild>
                <h2 style={{
                  margin: 0,
                  fontFamily: "'Sora', system-ui, sans-serif",
                  fontSize: 18, fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: heading,
                }}>
                  Keyboard shortcuts
                </h2>
              </Dialog.Title>
              <Dialog.Description asChild>
                <p style={{
                  margin: '4px 0 0',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 12.5,
                  color: muted,
                }}>
                  The fast paths. Press <Kbd dark={dark} keyBg={keyBg} keyBorder={keyBorder}>?</Kbd> anywhere to re-open this.
                </p>
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                style={{
                  width: 30, height: 30, padding: 0,
                  borderRadius: 8,
                  border: `1px solid ${border}`,
                  background: 'transparent',
                  color: body,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
              </button>
            </Dialog.Close>
          </header>

          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 22px 20px' }}>
            {GROUPS.map(group => (
              <section key={group.heading} style={{ marginBottom: 20 }}>
                <h3 style={{
                  margin: '8px 0 10px',
                  fontFamily: "'Sora', system-ui, sans-serif",
                  fontSize: 10, fontWeight: 800,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: accent,
                }}>
                  {group.heading}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {group.shortcuts.map((s, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                        borderBottom: i === group.shortcuts.length - 1 ? 'none' : `1px solid ${border}`,
                        fontFamily: "'Inter', system-ui, sans-serif",
                        fontSize: 13,
                        color: heading,
                      }}
                    >
                      <span>{s.label}</span>
                      <span style={{ display: 'inline-flex', gap: 4 }}>
                        {s.keys.map((k, ki) => (
                          <Kbd key={ki} dark={dark} keyBg={keyBg} keyBorder={keyBorder}>{k}</Kbd>
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <style>{`
            @keyframes cheatOverlayIn { from { opacity: 0 } to { opacity: 1 } }
            @keyframes cheatContentIn { from { opacity: 0; transform: translate(-50%, calc(-50% + 6px)) scale(0.98); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
          `}</style>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Kbd({
  children, dark, keyBg, keyBorder,
}: { children: React.ReactNode; dark: boolean; keyBg: string; keyBorder: string }) {
  const heading = dark ? '#F0F0F3' : '#1A1C1E';
  return (
    <kbd style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 22,
      height: 22,
      padding: '0 6px',
      borderRadius: 6,
      border: `1px solid ${keyBorder}`,
      background: keyBg,
      color: heading,
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 0,
      boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
    }}>
      {children}
    </kbd>
  );
}
