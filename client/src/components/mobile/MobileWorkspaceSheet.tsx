/**
 * MobileWorkspaceSheet.tsx
 *
 * Full-screen Vaul drawer that hosts any in-app workspace tool on mobile.
 * Documents (Data Room), Library, Pipeline, Sourcing, Analysis, Settings —
 * any of the chat-side panels render inside this wrapper.
 *
 * Same Vaul + drag-handle + scroll-aware top bar pattern as MobileJourneySheet,
 * but tuned for tool/panel content (no bottom CTA, no eyebrow tag, no story
 * narrative).
 */

import { Drawer } from 'vaul';
import { type ReactNode, useState, useEffect, useRef } from 'react';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dark: boolean;
  /** The tool icon (material-symbols name) shown in the top bar */
  icon: string;
  /** The tool title shown in the top bar */
  title: string;
  /** Optional sub-line under the title */
  subtitle?: string;
  /** The tool component */
  children: ReactNode;
}

export function MobileWorkspaceSheet({
  open,
  onOpenChange,
  dark,
  icon,
  title,
  subtitle,
  children,
}: Props) {
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setScrolled(false);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }
  }, [open]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrolled(e.currentTarget.scrollTop > 16);
  };

  // Color tokens
  const bg          = dark ? '#151617' : '#fefefe';
  const headingC    = dark ? '#f9f9fc' : '#0f1012';
  const bodyC       = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedC      = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const ruleC       = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.08)';
  const pinkC       = dark ? PINK_DARK : PINK;
  const topBarBg    = dark
    ? scrolled ? 'rgba(21,22,23,0.85)' : 'rgba(21,22,23,1)'
    : scrolled ? 'rgba(254,254,254,0.85)' : 'rgba(254,254,254,1)';

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} shouldScaleBackground>
      <Drawer.Portal>
        <Drawer.Overlay
          className="fixed inset-0 z-[100]"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
        />
        <Drawer.Content
          className="fixed left-0 right-0 bottom-0 z-[101] outline-none flex flex-col"
          style={{
            background: bg,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            height: '94vh',
            boxShadow: '0 -20px 60px -20px rgba(0,0,0,0.6)',
          }}
        >
          <Drawer.Title className="sr-only">{title}</Drawer.Title>
          <Drawer.Description className="sr-only">
            {subtitle || title}
          </Drawer.Description>

          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2 shrink-0 relative z-20">
            <div
              className="w-12 h-1.5 rounded-full"
              style={{ background: dark ? 'rgba(255,255,255,0.18)' : 'rgba(15,16,18,0.18)' }}
            />
          </div>

          {/* Top bar — always shows icon + title, gains border + blur on scroll */}
          <div
            className="sticky top-0 z-10 flex items-center px-4 py-3 transition-all"
            style={{
              background: topBarBg,
              backdropFilter: scrolled ? 'blur(12px) saturate(180%)' : 'none',
              borderBottom: scrolled ? `1px solid ${ruleC}` : '1px solid transparent',
            }}
          >
            <button
              onClick={() => onOpenChange(false)}
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.05)',
                border: 'none',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-[18px]" style={{ color: bodyC }}>
                close
              </span>
            </button>
            <div className="flex-1 text-center px-3">
              <div className="flex items-center justify-center gap-2">
                <span
                  className="material-symbols-outlined text-[16px]"
                  style={{ color: pinkC }}
                >
                  {icon}
                </span>
                <p
                  className="font-headline font-black text-[15px] tracking-tight"
                  style={{ color: headingC }}
                >
                  {title}
                </p>
              </div>
              {subtitle && !scrolled && (
                <p className="text-[11px] mt-0.5" style={{ color: mutedC }}>
                  {subtitle}
                </p>
              )}
            </div>
            <div className="w-9 h-9 shrink-0" />
          </div>

          {/* Scrollable content */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto mobile-scroll"
            style={{
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
