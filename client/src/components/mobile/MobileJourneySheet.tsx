/**
 * MobileJourneySheet.tsx
 *
 * Full-screen Vaul drawer that hosts any mobile journey page.
 *   - Top bar: back arrow + title (sticky, blurred when content scrolls under)
 *   - Middle: scrollable content (children)
 *   - Bottom: sticky action bar with safe-area inset
 *
 * Drag down to dismiss. Edge-of-screen swipe also dismisses.
 * Generous safe-area handling for iOS notch + home indicator.
 *
 * Used by: MobileSellPage, MobileBuyPage, MobileRaisePage, etc.
 */

import { Drawer } from 'vaul';
import { type ReactNode, useEffect, useState, useRef } from 'react';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dark: boolean;

  /** Eyebrow tag, like "Sell" or "Buy" */
  eyebrow: string;
  /** Page title, e.g., "Sell" — used for the top bar after scrolling */
  topBarTitle: string;

  /** Bottom action bar */
  ctaLabel: string;
  ctaSubLabel?: string;
  onCTA: () => void;

  /** The journey page content */
  children: ReactNode;
}

export function MobileJourneySheet({
  open,
  onOpenChange,
  dark,
  eyebrow,
  topBarTitle,
  ctaLabel,
  ctaSubLabel,
  onCTA,
  children,
}: Props) {
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset scroll state when drawer opens/closes
  useEffect(() => {
    if (!open) {
      setScrolled(false);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }
  }, [open]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrolled(e.currentTarget.scrollTop > 24);
  };

  // Color tokens
  const bg          = dark ? '#151617' : '#fefefe';
  const headingC    = dark ? '#f9f9fc' : '#0f1012';
  const bodyC       = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedC      = dark ? 'rgba(218,218,220,0.55)'  : '#7c7d80';
  const ruleC       = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.08)';
  const pinkC       = dark ? PINK_DARK : PINK;
  const topBarBg    = dark
    ? scrolled ? 'rgba(21,22,23,0.85)' : 'transparent'
    : scrolled ? 'rgba(254,254,254,0.85)' : 'transparent';

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} shouldScaleBackground snapPoints={[0.35, 0.95]}>
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
            maxHeight: '95vh',
            paddingTop: 0,
            boxShadow: '0 -20px 60px -20px rgba(0,0,0,0.6)',
          }}
        >
          <Drawer.Title className="sr-only">{topBarTitle}</Drawer.Title>
          <Drawer.Description className="sr-only">
            {eyebrow} — Yulia journey page
          </Drawer.Description>

          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2 shrink-0 relative z-20">
            <div
              className="w-12 h-1.5 rounded-full"
              style={{ background: dark ? 'rgba(255,255,255,0.18)' : 'rgba(15,16,18,0.18)' }}
            />
          </div>

          {/* Sticky top bar — fades in on scroll */}
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
            <div className="flex-1 text-center">
              <p
                className="text-[10px] font-bold uppercase tracking-[0.22em]"
                style={{ color: pinkC }}
              >
                {eyebrow}
              </p>
              {scrolled && (
                <p
                  className="font-headline font-black text-[14px] tracking-tight mt-0.5"
                  style={{ color: headingC }}
                >
                  {topBarTitle}
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
            }}
          >
            {children}
            {/* Bottom spacer to ensure last content clears the action bar */}
            <div style={{ height: 'calc(96px + env(safe-area-inset-bottom, 0px))' }} aria-hidden />
          </div>

          {/* Sticky bottom action bar */}
          <div
            className="absolute left-0 right-0 bottom-0 z-20"
            style={{
              background: dark
                ? 'linear-gradient(to top, rgba(21,22,23,1) 60%, rgba(21,22,23,0))'
                : 'linear-gradient(to top, rgba(254,254,254,1) 60%, rgba(254,254,254,0))',
              paddingTop: 24,
              paddingLeft: 16,
              paddingRight: 16,
              paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
            }}
          >
            <button
              onClick={onCTA}
              className="w-full flex items-center justify-between px-5 py-4 rounded-2xl font-bold text-[15px] active:scale-[0.985] transition-all"
              style={{
                background: pinkC,
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                boxShadow: `0 12px 32px -10px ${pinkC}aa`,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div className="text-left">
                <span className="block text-[15px] tracking-tight">{ctaLabel}</span>
                {ctaSubLabel && (
                  <span className="block text-[11px] font-medium opacity-80 mt-0.5">
                    {ctaSubLabel}
                  </span>
                )}
              </div>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
            {/* Subtle muted line below CTA */}
            <p
              className="text-[10px] text-center mt-2"
              style={{ color: mutedC }}
            >
              Free to start · No card · Your data stays yours
            </p>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

/* ────────────────────────────────────────────────────────────
   Reusable mobile-native section primitives — used inside
   children of MobileJourneySheet for consistent rhythm.
   ──────────────────────────────────────────────────────────── */

export function MobileHero({
  hook,
  sub,
  dark,
}: {
  hook: ReactNode;
  sub: ReactNode;
  dark: boolean;
}) {
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const bodyC    = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';

  return (
    <div className="px-6 pt-2 pb-8">
      <h1
        className="font-headline font-black tracking-[-0.035em] mb-5"
        style={{
          fontSize: 'clamp(2.5rem, 11vw, 3.75rem)',
          color: headingC,
          lineHeight: 0.95,
        }}
      >
        {hook}
      </h1>
      <p className="text-[16px] md:text-[17px] leading-[1.55]" style={{ color: bodyC }}>
        {sub}
      </p>
    </div>
  );
}

export function MobileSection({
  eyebrow,
  title,
  sub,
  children,
  dark,
}: {
  eyebrow?: string;
  title?: ReactNode;
  sub?: ReactNode;
  children: ReactNode;
  dark: boolean;
}) {
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const mutedC   = dark ? 'rgba(218,218,220,0.65)' : '#7c7d80';
  const pinkC    = dark ? PINK_DARK : PINK;

  return (
    <section className="px-6 mb-10">
      {eyebrow && (
        <p
          className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3"
          style={{ color: pinkC }}
        >
          {eyebrow}
        </p>
      )}
      {title && (
        <h2
          className="font-headline font-black tracking-[-0.025em] leading-[1.05] mb-3"
          style={{
            fontSize: 'clamp(1.625rem, 6vw, 2.125rem)',
            color: headingC,
          }}
        >
          {title}
        </h2>
      )}
      {sub && (
        <p className="text-[15px] leading-[1.55] mb-5" style={{ color: mutedC }}>
          {sub}
        </p>
      )}
      <div>{children}</div>
    </section>
  );
}

/** Big numbered KPI strip used inside mobile journey pages */
export function MobileKpiStrip({
  kpis,
  dark,
}: {
  kpis: { label: string; value: string; sub?: string }[];
  dark: boolean;
}) {
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const mutedC   = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const ruleC    = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.08)';
  const pinkC    = dark ? PINK_DARK : PINK;

  return (
    <div className="px-6 mb-10">
      <div
        className="rounded-3xl overflow-hidden"
        style={{
          background: dark ? '#1f2123' : '#ffffff',
          border: `1px solid ${ruleC}`,
        }}
      >
        {kpis.map((k, i) => (
          <div
            key={k.label}
            className="px-6 py-5 flex items-baseline justify-between gap-4"
            style={{
              borderBottom: i < kpis.length - 1 ? `1px solid ${ruleC}` : 'none',
            }}
          >
            <div className="flex-1 min-w-0">
              <p
                className="text-[10px] font-bold uppercase tracking-[0.18em] mb-1"
                style={{ color: mutedC }}
              >
                {k.label}
              </p>
              {k.sub && (
                <p className="text-[11px]" style={{ color: mutedC }}>
                  {k.sub}
                </p>
              )}
            </div>
            <p
              className="font-headline font-black tracking-[-0.02em] tabular-nums shrink-0"
              style={{
                fontSize: 'clamp(1.75rem, 6vw, 2.25rem)',
                color: i === kpis.length - 1 ? pinkC : headingC,
                lineHeight: 1,
              }}
            >
              {k.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
