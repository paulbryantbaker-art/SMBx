/**
 * _blankMobileSheet.tsx — shared placeholder for retired mobile
 * journey sheets. The original Vaul-drawer pages (MobileSellPage,
 * MobileBuyPage, etc.) were retired 2026-04-22. This stub matches
 * their external API so AppShell keeps typechecking while the new
 * mobile direction is built from scratch.
 *
 * Renders nothing when closed. When opened, shows a minimal drawer
 * that says "blank canvas — chat with Yulia" and closes cleanly.
 */
import { Drawer } from 'vaul';

export interface BlankMobileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dark: boolean;
  onTalkToYulia: (prefill?: string) => void;
}

export function BlankMobileSheet({
  open, onOpenChange, dark, onTalkToYulia,
  title,
}: BlankMobileSheetProps & { title: string }) {
  if (!open) return null;
  const bg = dark ? '#151617' : '#FEFEFE';
  const ink = dark ? '#F9F9FC' : '#0F1012';
  const mute = dark ? 'rgba(218,218,220,0.65)' : '#6B6B70';
  const accent = '#C7616F';

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
            maxHeight: '88vh', overflowY: 'auto',
          }}
        >
          <Drawer.Title
            style={{
              fontFamily: 'JetBrains Mono, ui-monospace, monospace',
              fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
              fontWeight: 700, color: accent, margin: '8px 0 10px',
            }}
          >
            Blank canvas
          </Drawer.Title>
          <h2
            style={{
              fontFamily: 'Sora, sans-serif', fontWeight: 800,
              fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1.1,
              color: ink, margin: '0 0 12px',
            }}
          >
            {title}
          </h2>
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 14, lineHeight: 1.55, color: mute, margin: '0 0 20px',
            }}
          >
            This page is being rebuilt from scratch. Chat with Yulia directly — she can walk you through anything.
          </p>
          <button
            type="button"
            onClick={() => { onOpenChange(false); onTalkToYulia(); }}
            style={{
              padding: '12px 18px',
              background: ink, color: bg,
              border: 'none', borderRadius: 999,
              fontFamily: 'Sora, sans-serif', fontWeight: 700,
              fontSize: 13, cursor: 'pointer',
            }}
          >
            Talk to Yulia
          </button>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
