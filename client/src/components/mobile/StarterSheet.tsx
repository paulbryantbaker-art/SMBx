/**
 * StarterSheet — Vaul modal sheet that replaces the + popup on mobile.
 *
 * Mirrors AccountSheet.tsx exactly (the one the user said "is great"):
 *   - Vaul Drawer.Root in MODAL mode (default — has overlay + body lock).
 *   - Drawer.Overlay = scrim. Drawer.Content = sheet at bottom.
 *   - shouldScaleBackground gives the iOS scale-down feel.
 *   - Built-in: drag handle, swipe-down-to-dismiss, tap-overlay-to-dismiss,
 *     body scroll lock, focus trap.
 *
 * Same content as the previous .home-tools-popup:
 *   - Optional "Attach" row (file upload, when supported)
 *   - "Start with Yulia" — journey starters
 *   - "Tools" — quick-launch deal-intel tools
 */

import { Drawer } from 'vaul';
import type { ReactNode } from 'react';

export interface StarterTool {
  label: string;
  desc: string;
  fill?: string;
  action?: 'upload';
  group?: 'journey' | 'tool';
  icon: ReactNode;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dark: boolean;
  /** Tools to render. Filtered into journey vs. tool groups internally. */
  tools: StarterTool[];
  /** When the user picks a starter or tool. Caller fills the input or
      triggers the upload flow. */
  onPick: (tool: StarterTool) => void;
  /** Optional file-upload affordance shown as the first row. */
  onAttachFile?: () => void;
}

export function StarterSheet({
  open, onOpenChange, dark, tools, onPick, onAttachFile,
}: Props) {
  const bg = dark ? '#151617' : '#fefefe';
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const mutedC = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const borderC = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const rowBg = dark ? '#1f2123' : '#ffffff';
  const rowBd = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.06)';
  const accent = dark ? '#E8709A' : '#D44A78';

  const journeys = tools.filter(t => t.group === 'journey');
  const toolItems = tools.filter(t => t.group === 'tool');

  const pick = (tool: StarterTool) => {
    onOpenChange(false);
    // Defer one frame so the sheet starts dismissing before we mutate the
    // input — feels snappier than waiting for the dismiss animation.
    requestAnimationFrame(() => onPick(tool));
  };

  const attach = () => {
    onOpenChange(false);
    if (onAttachFile) requestAnimationFrame(onAttachFile);
  };

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} shouldScaleBackground>
      <Drawer.Portal>
        <Drawer.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 90 }} />
        <Drawer.Content
          aria-describedby={undefined}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '82dvh',
            background: bg,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100,
            outline: 'none',
            boxShadow: dark
              ? '0 -24px 60px -12px rgba(0,0,0,0.7)'
              : '0 -24px 60px -12px rgba(15,16,18,0.25)',
          }}
        >
          {/* Drag handle */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
            <div style={{
              width: 40, height: 5, borderRadius: 999,
              background: dark ? 'rgba(255,255,255,0.22)' : 'rgba(15,16,18,0.18)',
            }} />
          </div>

          {/* a11y title */}
          <Drawer.Title
            style={{
              position: 'absolute', width: 1, height: 1, padding: 0, margin: -1,
              overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0,
            }}
          >Starter prompts and tools</Drawer.Title>

          {/* Body — scrollable card list */}
          <div
            style={{
              padding: '8px 16px 24px',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
            }}
          >
            {onAttachFile && (
              <>
                <SectionLabel color={mutedC}>Attach</SectionLabel>
                <Row
                  bg={rowBg} bd={rowBd} headingC={headingC} mutedC={mutedC} accent={accent}
                  icon={
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                  }
                  title="Attach a file"
                  desc="PDF, Word, Excel, images — Yulia reads it"
                  onClick={attach}
                />
                <Spacer />
              </>
            )}

            {journeys.length > 0 && (
              <>
                <SectionLabel color={mutedC}>Start with Yulia</SectionLabel>
                {journeys.map((t) => (
                  <Row
                    key={t.label}
                    bg={rowBg} bd={rowBd} headingC={headingC} mutedC={mutedC} accent={accent}
                    icon={t.icon}
                    title={t.label}
                    desc={t.desc}
                    onClick={() => pick(t)}
                  />
                ))}
                <Spacer />
              </>
            )}

            {toolItems.length > 0 && (
              <>
                <SectionLabel color={mutedC}>Tools</SectionLabel>
                {toolItems.map((t) => (
                  <Row
                    key={t.label}
                    bg={rowBg} bd={rowBd} headingC={headingC} mutedC={mutedC} accent={accent}
                    icon={t.icon}
                    title={t.label}
                    desc={t.desc}
                    onClick={() => pick(t)}
                  />
                ))}
              </>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function SectionLabel({ children, color }: { children: ReactNode; color: string }) {
  return (
    <div style={{ padding: '12px 4px 8px' }}>
      <span style={{
        fontFamily: 'Inter, system-ui',
        fontSize: 11, fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color,
      }}>{children}</span>
    </div>
  );
}

function Spacer() {
  return <div style={{ height: 8 }} />;
}

function Row({
  icon, title, desc, onClick, bg, bd, headingC, mutedC, accent,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
  bg: string; bd: string;
  headingC: string; mutedC: string; accent: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '14px 16px',
        marginBottom: 6,
        borderRadius: 14,
        background: bg,
        border: `1px solid ${bd}`,
        textAlign: 'left',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        fontFamily: 'inherit',
        transition: 'transform 120ms ease-out, background 120ms ease-out',
      }}
      className="active:scale-[0.98]"
    >
      <span
        aria-hidden
        style={{
          width: 20, height: 20,
          flexShrink: 0,
          color: accent,
          marginTop: 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{
          fontFamily: 'Inter, system-ui',
          fontSize: 15, fontWeight: 700,
          color: headingC,
          letterSpacing: '-0.005em',
          lineHeight: 1.3,
        }}>{title}</div>
        <div style={{
          fontFamily: 'Inter, system-ui',
          fontSize: 13, fontWeight: 400,
          color: mutedC,
          lineHeight: 1.4,
          marginTop: 2,
        }}>{desc}</div>
      </div>
    </button>
  );
}

export default StarterSheet;
