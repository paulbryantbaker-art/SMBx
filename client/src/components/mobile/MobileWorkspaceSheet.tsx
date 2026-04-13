/**
 * MobileWorkspaceSheet.tsx
 *
 * Premium bottom drawer for workspace tools on mobile.
 * Drag handle at top, no close button — pull down to dismiss.
 * Opens at 95vh consistently. Clean, minimal header.
 *
 * Design: Grok-minimal, warm charcoal, Sora headlines.
 * No X button. Drag handle is tight and subtle.
 * Title bar gains blur + border on scroll.
 */

import { Drawer } from 'vaul';
import { type ReactNode, useState, useEffect, useRef } from 'react';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dark: boolean;
  icon: string;
  title: string;
  subtitle?: string;
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
    setScrolled(e.currentTarget.scrollTop > 8);
  };

  const bg       = dark ? '#151617' : '#fefefe';
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const mutedC   = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const ruleC    = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.08)';
  const pinkC    = dark ? PINK_DARK : PINK;
  const handleC  = dark ? 'rgba(255,255,255,0.20)' : 'rgba(15,16,18,0.15)';
  const topBarBg = dark
    ? scrolled ? 'rgba(21,22,23,0.92)' : bg
    : scrolled ? 'rgba(254,254,254,0.92)' : bg;

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
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            height: '95vh',
            paddingTop: 'env(safe-area-inset-top, 0px)',
            boxShadow: '0 -12px 40px -12px rgba(0,0,0,0.4)',
          }}
        >
          <Drawer.Title className="sr-only">{title}</Drawer.Title>
          <Drawer.Description className="sr-only">{subtitle || title}</Drawer.Description>

          {/* Drag handle — tight, subtle, centered */}
          <div className="flex justify-center pt-2 pb-1 shrink-0">
            <div
              className="w-9 h-1 rounded-full"
              style={{ background: handleC }}
            />
          </div>

          {/* Title bar — icon + title, blur on scroll */}
          <div
            className="shrink-0 flex items-center gap-2.5 px-5 py-2 transition-all"
            style={{
              background: topBarBg,
              backdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
              borderBottom: scrolled ? `1px solid ${ruleC}` : '1px solid transparent',
            }}
          >
            <span className="material-symbols-outlined text-[18px]" style={{ color: pinkC }}>
              {icon}
            </span>
            <div className="flex-1 min-w-0">
              <p
                className="font-headline font-black text-[15px] tracking-[-0.02em] truncate"
                style={{ color: headingC, lineHeight: 1.2 }}
              >
                {title}
              </p>
              {subtitle && !scrolled && (
                <p className="text-[11px] truncate" style={{ color: mutedC }}>
                  {subtitle}
                </p>
              )}
            </div>
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
