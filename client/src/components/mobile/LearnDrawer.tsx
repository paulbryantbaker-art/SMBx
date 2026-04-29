/**
 * LearnDrawer stub — original retired 2026-04-22 with the rest of the
 * journey content. Original at `_retired/journey_v1/mobile/LearnDrawer.tsx`.
 *
 * Kept as a minimal Vaul drawer so AppShell's "Learn" entry point
 * doesn't crash while the new direction is built. Renders a quiet
 * placeholder and lets the user dismiss + optionally navigate to a
 * journey destination (which currently routes to a blank stub page).
 */
import { Drawer } from 'vaul';
import type { LearnDest } from './mobileTypes';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dark: boolean;
  onPick: (dest: LearnDest) => void;
}

export function LearnDrawer({ open, onOpenChange, dark }: Props) {
  if (!open) return null;
  const bg = dark ? '#141413' : '#FEFEFE';
  const ink = dark ? '#faf9f5' : '#1a1918';
  const mute = dark ? 'rgba(218,218,220,0.65)' : '#87867f';

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000 }}
        />
        <Drawer.Content
          style={{
            position: 'fixed', left: 0, right: 0, bottom: 0,
            background: bg,
            borderTopLeftRadius: 18, borderTopRightRadius: 18,
            zIndex: 1001, padding: '24px 24px 36px',
          }}
        >
          <Drawer.Title
            style={{
              fontFamily: 'JetBrains Mono, ui-monospace, monospace',
              fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
              fontWeight: 700, color: '#C7616F', margin: '8px 0 10px',
            }}
          >
            Blank canvas
          </Drawer.Title>
          <h2
            style={{
              fontFamily: 'Figtree, system-ui, sans-serif', fontWeight: 800,
              fontSize: 24, letterSpacing: '-0.02em', lineHeight: 1.1,
              color: ink, margin: '0 0 12px',
            }}
          >
            Yulia is ready.
          </h2>
          <p
            style={{
              fontFamily: "'Figtree', system-ui, sans-serif",
              fontSize: 14, lineHeight: 1.55, color: mute, margin: '0 0 18px',
            }}
          >
            The journey tour is being rebuilt. Tap below to jump into chat — Yulia can walk you through selling, buying, raising, or integrating.
          </p>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            style={{
              padding: '12px 18px',
              background: ink, color: bg,
              border: 'none', borderRadius: 999,
              fontFamily: 'Figtree, system-ui, sans-serif', fontWeight: 700,
              fontSize: 13, cursor: 'pointer',
            }}
          >
            Back to chat
          </button>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
